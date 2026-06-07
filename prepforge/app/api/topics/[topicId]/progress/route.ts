import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const VALID_STATUSES = ["NOT_STARTED", "IN_PROGRESS", "COMPLETED"];

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ topicId: string }> }
) {
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

    const { topicId } = await params;
    const body = await request.json();
    const { status } = body;

    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        {
          error:
            "Invalid status. Must be NOT_STARTED, IN_PROGRESS, or COMPLETED",
        },
        { status: 400 }
      );
    }

    const progress = await prisma.topicProgress.upsert({
      where: {
        userId_topicId: {
          userId: user.id,
          topicId,
        },
      },
      update: { status },
      create: {
        userId: user.id,
        topicId,
        status,
      },
    });

    return NextResponse.json(progress);
  } catch (error) {
    console.error("Error updating topic progress:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}