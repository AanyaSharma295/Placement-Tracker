// app/api/codeforces/[handle]/route.ts

import { NextResponse } from "next/server";
import {
  getUserInfo,
  getContestHistory,
  computeContestStats,
  getRecentContests,
  buildRatingGraph,
} from "@/lib/services/codeforces";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ handle: string }> }
) {
  const { handle } = await params;

  if (!handle || handle.trim() === "") {
    return NextResponse.json(
      { error: "Handle is required." },
      { status: 400 }
    );
  }

  const [user, history] = await Promise.all([
    getUserInfo(handle),
    getContestHistory(handle),
  ]);

  if (!user) {
    return NextResponse.json(
      {
        error: `Codeforces user "${handle}" not found. Please check your handle in Profile settings.`,
      },
      { status: 404 }
    );
  }

  const stats = computeContestStats(history);
  const recentContests = getRecentContests(history, 10);
  const ratingGraph = buildRatingGraph(history);

  return NextResponse.json({
    user: {
      handle: user.handle,
      rating: user.rating ?? 0,
      maxRating: user.maxRating ?? 0,
      rank: user.rank ?? "unrated",
      maxRank: user.maxRank ?? "unrated",
      contribution: user.contribution ?? 0,
      avatar: user.titlePhoto ?? user.avatar ?? "",
    },
    stats,
    recentContests,
    ratingGraph,
  });
}