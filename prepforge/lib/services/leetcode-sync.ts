// lib/services/leetcode-sync.ts

import { prisma } from "@/lib/prisma";
import { getLeetCodeUser } from "@/lib/services/leetcode";

const STALE_THRESHOLD_MS = 60 * 60 * 1000; // 1 hour

export interface LCSyncResult {
  success: boolean;
  totalSolved: number;
  easy: number;
  medium: number;
  hard: number;
  error?: string;
}

export async function syncLeetCodeData(
  userId: string,
  handle: string
): Promise<LCSyncResult> {
  try {
    // Check freshness
    const existing = await prisma.leetcodeStats.findUnique({
      where: { userId },
    });

    const isStale =
      !existing?.updatedAt ||
      existing.handle !== handle ||
      Date.now() - existing.updatedAt.getTime() > STALE_THRESHOLD_MS;

    if (!isStale) {
      return {
        success: true,
        totalSolved: existing!.totalSolved,
        easy: existing!.easy,
        medium: existing!.medium,
        hard: existing!.hard,
      };
    }

    // Fetch fresh data
    const user = await getLeetCodeUser(handle);

    if (!user) {
      return {
        success: false,
        totalSolved: 0,
        easy: 0,
        medium: 0,
        hard: 0,
        error: `LeetCode user "${handle}" not found.`,
      };
    }

    // Upsert into LeetcodeStats
    await prisma.leetcodeStats.upsert({
      where: { userId },
      update: {
        handle,
        easy: user.easySolved,
        medium: user.mediumSolved,
        hard: user.hardSolved,
        totalSolved: user.totalSolved,
      },
      create: {
        userId,
        handle,
        easy: user.easySolved,
        medium: user.mediumSolved,
        hard: user.hardSolved,
        totalSolved: user.totalSolved,
      },
    });

    return {
      success: true,
      totalSolved: user.totalSolved,
      easy: user.easySolved,
      medium: user.mediumSolved,
      hard: user.hardSolved,
    };
  } catch (error) {
    console.error("[LC Sync] error:", error);
    return {
      success: false,
      totalSolved: 0,
      easy: 0,
      medium: 0,
      hard: 0,
      error: "Sync failed. Please try again.",
    };
  }
}