// app/api/dashboard/route.ts

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return NextResponse.json({ error: "Not logged in." }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId },
      include: {
        handles: true,
        contestStats: true,
        contestHistory: {
          orderBy: { date: "desc" },
          take: 20,
        },
        leetcodeStats: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    // ── Codeforces data ──────────────────────────────────────────────
    const cfStats = user.contestStats.find(
      (s) => s.platform === "codeforces"
    );
    const cfHistory = user.contestHistory.filter(
      (c) => c.platform === "codeforces"
    );

    const cfRatingGraph = [...cfHistory]
      .reverse()
      .map((c) => ({
        date: new Date(c.date).toLocaleDateString("en-US", {
          month: "short",
          year: "2-digit",
        }),
        rating: c.rating,
        contestName: c.contestName,
      }));

    const recentCfActivity = cfHistory.slice(0, 5).map((c) => ({
      platform: "codeforces",
      title: c.contestName,
      detail: `Rank #${c.rank}`,
      date: c.date.toISOString(),
    }));

    // ── LeetCode data ─────────────────────────────────────────────────
    const lc = user.leetcodeStats;

    const recentLcActivity = lc
      ? [
          {
            platform: "leetcode",
            title: "LeetCode Progress",
            detail: `${lc.totalSolved} problems solved`,
            date: lc.updatedAt.toISOString(),
          },
        ]
      : [];

    // ── Activity feed (merged, newest first) ──────────────────────────
    const activity = [...recentCfActivity, ...recentLcActivity].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    // ── Summary stats ─────────────────────────────────────────────────
    const totalContests = cfStats?.contestCount ?? 0;
    const cfRating = cfStats?.currentRating ?? 0;
    const lcSolved = lc?.totalSolved ?? 0;
    const progressScore = Math.round(cfRating / 10) + lcSolved;

    // ── Insights (rule-based) ─────────────────────────────────────────
    const insights: string[] = [];

    if (lc) {
      if (lc.hard < lc.medium * 0.2) {
        insights.push(
          "Your LeetCode Hard count is low compared to Medium. Try tackling harder problems."
        );
      }
      if (lc.totalSolved > 500) {
        insights.push("You have solved over 500 LeetCode problems. Keep it up!");
      }
      if (lc.medium > lc.easy) {
        insights.push(
          "You solve more Medium questions than Easy — great difficulty progression."
        );
      }
    }

    if (cfStats) {
      if (cfStats.currentRating >= 1600) {
        insights.push(
          "Your Codeforces rating is above 1600. You are in Expert territory."
        );
      }
      if (cfStats.contestCount < 5) {
        insights.push(
          "You have participated in fewer than 5 contests. Try to compete more regularly."
        );
      }
    }

    if (!user.handles?.codeforces && !user.handles?.leetcode) {
      insights.push(
        "Add your Codeforces and LeetCode handles in Profile to unlock full analytics."
      );
    }

    if (insights.length === 0) {
      insights.push(
        "Sync your platforms to generate personalized insights."
      );
    }

    // ── Last synced ───────────────────────────────────────────────────
    const lastCfSync = cfStats?.lastSyncedAt?.toISOString() ?? null;
    const lastLcSync = lc?.updatedAt?.toISOString() ?? null;

    return NextResponse.json({
      user: {
        name: user.name,
        email: user.email,
        image: user.image,
      },
      handles: {
        codeforces: user.handles?.codeforces ?? null,
        leetcode: user.handles?.leetcode ?? null,
      },
      codeforces: {
        rating: cfRating,
        maxRating: cfStats?.maxRating ?? 0,
        contestCount: totalContests,
        ratingGraph: cfRatingGraph,
        lastSyncedAt: lastCfSync,
      },
      leetcode: {
        totalSolved: lcSolved,
        easy: lc?.easy ?? 0,
        medium: lc?.medium ?? 0,
        hard: lc?.hard ?? 0,
        lastSyncedAt: lastLcSync,
      },
      summary: {
        totalContests,
        progressScore,
        platformsTracked:
          (user.handles?.codeforces ? 1 : 0) +
          (user.handles?.leetcode ? 1 : 0),
      },
      activity,
      insights,
    });
  } catch (error) {
    console.error("[Dashboard API] error:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}