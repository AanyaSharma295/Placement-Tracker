// app/api/contests/route.ts
//
// GET /api/contests
//
// Simple in-memory cache instead of Redis — this project's Redis usage is
// internal to BullMQ (no shared lib/redis.ts client exists), and adding one
// just for this endpoint isn't worth it. Contest schedules are identical
// for every user, so caching per-server-instance for a few hours is a fine
// trade-off: worst case is a few extra harmless calls to Codeforces/LeetCode
// after a cold start, not a correctness problem.

import { NextResponse } from "next/server";
import { getUpcomingContests, type PlatformContest } from "@/lib/services/contests";

const CACHE_TTL_MS = 60 * 60 * 3 * 1000; // 3 hours

let cache: { data: PlatformContest[]; expiresAt: number } | null = null;

export async function GET() {
  try {
    if (cache && Date.now() < cache.expiresAt) {
      return NextResponse.json({ contests: cache.data, cached: true });
    }

    const contests = await getUpcomingContests();
    cache = { data: contests, expiresAt: Date.now() + CACHE_TTL_MS };

    return NextResponse.json({ contests, cached: false });
  } catch (error) {
    console.error("Failed to load contest calendar:", error);
    return NextResponse.json(
      { error: "Failed to fetch contest data" },
      { status: 500 }
    );
  }
}