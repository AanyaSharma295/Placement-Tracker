// app/api/profile/xp/route.ts
//
// GET /api/profile/xp
//
// Returns the logged-in user's XP breakdown. Same auth pattern as
// /api/profile/handles — verify via Clerk, map clerkId -> internal User.id,
// then hand off to the service layer.

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateUserXP } from "@/lib/services/xp";

export async function GET() {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const xp = await calculateUserXP(user.id);

    return NextResponse.json(xp);
  } catch (error) {
    console.error("Error calculating XP:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}