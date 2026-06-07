import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ companyId: string }> }
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

    const { companyId } = await params;

    // Find company by slug
    const company = await prisma.company.findUnique({
      where: { slug: companyId },
      include: {
        questions: {
          include: {
            question: true,
          },
        },
      },
    });

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    const questionIds = company.questions.map((q) => q.questionId);

    const progressRecords = await prisma.questionProgress.findMany({
      where: {
        userId: user.id,
        questionId: { in: questionIds },
      },
    });

    const progressMap = new Map(
      progressRecords.map((p) => [p.questionId, p.status])
    );

    const questions = company.questions.map((cq) => ({
      id: cq.question.id,
      title: cq.question.title,
      difficulty: cq.question.difficulty,
      topic: cq.question.topic,
      link: cq.question.link,
      status: progressMap.get(cq.question.id) ?? "NOT_STARTED",
    }));

    const totalQuestions = questions.length;
    const solvedQuestions = questions.filter((q) => q.status === "SOLVED").length;
    const inProgressQuestions = questions.filter((q) => q.status === "IN_PROGRESS").length;
    const completionPercentage =
      totalQuestions > 0
        ? Math.round((solvedQuestions / totalQuestions) * 100)
        : 0;

    const easyCount = questions.filter((q) => q.difficulty === "Easy").length;
    const mediumCount = questions.filter((q) => q.difficulty === "Medium").length;
    const hardCount = questions.filter((q) => q.difficulty === "Hard").length;

    return NextResponse.json({
      id: company.id,
      name: company.name,
      slug: company.slug,
      stats: {
        totalQuestions,
        solvedQuestions,
        inProgressQuestions,
        remainingQuestions: totalQuestions - solvedQuestions,
        completionPercentage,
        easy: easyCount,
        medium: mediumCount,
        hard: hardCount,
      },
      questions,
    });
  } catch (error) {
    console.error("Error fetching company:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}