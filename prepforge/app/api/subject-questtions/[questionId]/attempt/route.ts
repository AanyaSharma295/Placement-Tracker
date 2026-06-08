import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
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
    const { selectedOption } = body;

    if (selectedOption === undefined || selectedOption === null) {
      return NextResponse.json(
        { error: "selectedOption is required" },
        { status: 400 }
      );
    }

    // Get the question to validate answer
    const question = await prisma.subjectQuestion.findUnique({
      where: { id: questionId },
    });

    if (!question) {
      return NextResponse.json(
        { error: "Question not found" },
        { status: 404 }
      );
    }

    if (question.type !== "MCQ") {
      return NextResponse.json(
        { error: "This question is not an MCQ" },
        { status: 400 }
      );
    }

    const isCorrect = selectedOption === question.correctOption;

    // Persist attempt
    const progress = await prisma.subjectQuestionProgress.upsert({
      where: {
        userId_questionId: {
          userId: user.id,
          questionId,
        },
      },
      update: {
        attempted: true,
        selectedOption,
        isCorrect,
        attemptedAt: new Date(),
      },
      create: {
        userId: user.id,
        questionId,
        attempted: true,
        selectedOption,
        isCorrect,
        attemptedAt: new Date(),
        status: "NOT_STARTED",
        bookmarked: false,
      },
    });

    return NextResponse.json({
      isCorrect,
      correctOption: question.correctOption,
      explanation: question.explanation,
      progress,
    });
  } catch (error) {
    console.error("Error submitting MCQ attempt:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}