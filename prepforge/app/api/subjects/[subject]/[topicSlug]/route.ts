import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ subject: string; topicSlug: string }> }
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

    const { subject, topicSlug } = await params;

    const topic = await prisma.revisionTopic.findUnique({
      where: { subject_slug: { subject, slug: topicSlug } },
      include: {
        questions: { orderBy: { order: "asc" } },
      },
    });

    if (!topic) {
      return NextResponse.json({ error: "Topic not found" }, { status: 404 });
    }

    // Get user progress for all questions
    const progressRecords = await prisma.subjectQuestionProgress.findMany({
      where: {
        userId: user.id,
        questionId: { in: topic.questions.map((q) => q.id) },
      },
    });

    const progressMap = new Map(
      progressRecords.map((p) => [p.questionId, p])
    );

    // Attach progress to each question
    const questions = topic.questions.map((q) => {
      const progress = progressMap.get(q.id);
      return {
        id: q.id,
        type: q.type,
        question: q.question,
        difficulty: q.difficulty,
        frequency: q.frequency,
        companies: q.companies,
        interviewerNote: q.interviewerNote,
        options: q.options,
        correctOption: q.type === "MCQ" ? q.correctOption : null,
        explanation: q.explanation,
        order: q.order,
        // User progress
        status: progress?.status ?? "NOT_STARTED",
        bookmarked: progress?.bookmarked ?? false,
        attempted: progress?.attempted ?? false,
        selectedOption: progress?.selectedOption ?? null,
        isCorrect: progress?.isCorrect ?? null,
        lastRevisedAt: progress?.lastRevisedAt ?? null,
      };
    });

    // Analytics
    const totalQuestions = questions.length;
    const theoryQuestions = questions.filter((q) => q.type === "THEORY").length;
    const mcqQuestions = questions.filter((q) => q.type === "MCQ").length;
    const masteredQuestions = questions.filter((q) => q.status === "MASTERED").length;
    const revisedQuestions = questions.filter((q) => q.status === "REVISED").length;
    const bookmarkedQuestions = questions.filter((q) => q.bookmarked).length;
    const attemptedMCQs = questions.filter((q) => q.type === "MCQ" && q.attempted).length;
    const correctMCQs = questions.filter((q) => q.type === "MCQ" && q.isCorrect).length;
    const mcqAccuracy = attemptedMCQs > 0
      ? Math.round((correctMCQs / attemptedMCQs) * 100)
      : 0;

    // Readiness = 60% mastered theory + 40% MCQ accuracy
    const theoryScore = theoryQuestions > 0
      ? (masteredQuestions / theoryQuestions) * 60
      : 0;
    const mcqScore = mcqQuestions > 0
      ? (correctMCQs / mcqQuestions) * 40
      : 0;
    const readinessScore = Math.round(theoryScore + mcqScore);

    // Company distribution
    const companyMap: Record<string, number> = {};
    for (const q of questions) {
      for (const c of q.companies) {
        companyMap[c] = (companyMap[c] ?? 0) + 1;
      }
    }
    const companyDistribution = Object.entries(companyMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    return NextResponse.json({
      id: topic.id,
      subject,
      slug: topicSlug,
      title: topic.title,
      order: topic.order,
      analytics: {
        totalQuestions,
        theoryQuestions,
        mcqQuestions,
        masteredQuestions,
        revisedQuestions,
        bookmarkedQuestions,
        attemptedMCQs,
        correctMCQs,
        mcqAccuracy,
        readinessScore,
      },
      companyDistribution,
      questions,
    });
  } catch (error) {
    console.error("Error fetching topic:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}