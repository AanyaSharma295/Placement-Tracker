// app/api/codeforces/sync/route.ts

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { syncCodeforcesData } from "@/lib/services/codeforces-sync";

export async function POST() {
  try {
    // Step 1 — verify logged in
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return NextResponse.json({ error: "Not logged in." }, { status: 401 });
    }

    // Step 2 — get user from DB
    const user = await prisma.user.findUnique({
      where: { clerkId },
      include: { handles: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    // Step 3 — check handle exists
    const handle = user.handles?.codeforces;

    if (!handle) {
      return NextResponse.json(
        { error: "No Codeforces handle saved. Please add one in Profile." },
        { status: 400 }
      );
    }

    // Step 4 — run sync
    const result = await syncCodeforcesData(user.id, handle);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error ?? "Sync failed." },
        { status: 500 }
      );
    }

    // Step 5 — return summary
    return NextResponse.json({
      success: true,
      rating: result.rating,
      maxRating: result.maxRating,
      contestsSynced: result.contestsSynced,
    });
  } catch (error) {
    console.error("[Sync Route] error:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}