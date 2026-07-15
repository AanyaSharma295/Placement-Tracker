// lib/services/codeforces-sync.ts

import { prisma } from "@/lib/prisma";
import { getUserInfo, getContestHistory } from "@/lib/services/codeforces";

const STALE_THRESHOLD_MS = 60 * 60 * 1000; // 1 hour

export interface SyncResult {
  success: boolean;
  rating: number;
  maxRating: number;
  contestsSynced: number;
  error?: string;
}

export async function syncCodeforcesData(
  userId: string,
  handle: string
): Promise<SyncResult> {
  try {
    // Check if data is fresh
    const existing = await prisma.contestStats.findFirst({
      where: { userId, platform: "codeforces" },
    });

    const isStale =
      !existing?.lastSyncedAt ||
      existing.handle !== handle ||
      Date.now() - existing.lastSyncedAt.getTime() > STALE_THRESHOLD_MS;

    if (!isStale) {
      return {
        success: true,
        rating: existing!.currentRating,
        maxRating: existing!.maxRating,
        contestsSynced: existing!.contestCount,
      };
    }

    // Fetch fresh data from Codeforces API
    const [user, history] = await Promise.all([
      getUserInfo(handle),
      getContestHistory(handle),
    ]);

    if (!user) {
      return {
        success: false,
        rating: 0,
        maxRating: 0,
        contestsSynced: 0,
        error: `Codeforces user "${handle}" not found.`,
      };
    }

    // Upsert ContestStats
    if (existing) {
      await prisma.contestStats.update({
        where: { id: existing.id },
        data: {
          handle,
          currentRating: user.rating ?? 0,
          maxRating: user.maxRating ?? 0,
          contestCount: history.length,
          lastSyncedAt: new Date(),
        },
      });
    } else {
      await prisma.contestStats.create({
        data: {
          userId,
          platform: "codeforces",
          handle,
          currentRating: user.rating ?? 0,
          maxRating: user.maxRating ?? 0,
          contestCount: history.length,
          lastSyncedAt: new Date(),
        },
      });
    }

    // Insert ContestHistory — skip duplicates
    let contestsSynced = 0;

    for (const contest of history) {
      try {
        await prisma.contestHistory.upsert({
          where: {
            userId_contestId_platform: {
              userId,
              contestId: String(contest.contestId),
              platform: "codeforces",
            },
          },
          update: {
            contestName: contest.contestName,
            rating: contest.newRating,
            rank: contest.rank,
            date: new Date(contest.ratingUpdateTimeSeconds * 1000),
          },
          create: {
            userId,
            platform: "codeforces",
            contestId: String(contest.contestId),
            contestName: contest.contestName,
            rating: contest.newRating,
            rank: contest.rank,
            date: new Date(contest.ratingUpdateTimeSeconds * 1000),
          },
        });
        contestsSynced++;
      } catch {
        // Skip individual contest failures silently
        continue;
      }
    }

    return {
      success: true,
      rating: user.rating ?? 0,
      maxRating: user.maxRating ?? 0,
      contestsSynced,
    };
  } catch (error) {
    console.error("[Sync] syncCodeforcesData error:", error);
    return {
      success: false,
      rating: 0,
      maxRating: 0,
      contestsSynced: 0,
      error: "Sync failed. Please try again.",
    };
  }
}