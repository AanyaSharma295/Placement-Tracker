// app/api/leetcode/[handle]/route.ts

import { NextResponse } from "next/server";
import { getLeetCodeUser } from "@/lib/services/leetcode";

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

  const user = await getLeetCodeUser(handle);

  if (!user) {
    return NextResponse.json(
      {
        error: `LeetCode user "${handle}" not found. Please check your handle in Profile settings.`,
      },
      { status: 404 }
    );
  }

  return NextResponse.json({
    username: user.username,
    ranking: user.ranking,
    totalSolved: user.totalSolved,
    easySolved: user.easySolved,
    mediumSolved: user.mediumSolved,
    hardSolved: user.hardSolved,
    totalSubmissions: user.totalSubmissions,
    acceptanceRate: user.acceptanceRate,
  });
}