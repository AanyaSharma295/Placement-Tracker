import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const VALID_STATUSES = ["NOT_STARTED", "REVISED", "MASTERED"];

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ questionId: string }> }
) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { questionId } = await params;
    const body = await request.json();
    const { status, bookmarked } = body;

    // Validate
    if (status && !VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be NOT_STARTED, REVISED, or MASTERED" },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {};
    if (status !== undefined) {
      updateData.status = status;
      if (status === "REVISED" || status === "MASTERED") {
        updateData.lastRevisedAt = new Date();
      }
    }
    if (bookmarked !== undefined) {
      updateData.bookmarked = bookmarked;
    }

    const progress = await prisma.subjectQuestionProgress.upsert({
      where: {
        userId_questionId: {
          userId: user.id,
          questionId,
        },
      },
      update: updateData,
      create: {
        userId: user.id,
        questionId,
        status: status ?? "NOT_STARTED",
        bookmarked: bookmarked ?? false,
      },
    });

    return NextResponse.json(progress);
  } catch (error) {
    console.error("Error updating question progress:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}