import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

    // ── Question Progress ────────────────────────────────────
    const totalQuestions = await prisma.question.count();

    const solvedQuestions = await prisma.questionProgress.count({
      where: {
        userId: user.id,
        status: "SOLVED",
      },
    });

    const inProgressQuestions = await prisma.questionProgress.count({
      where: {
        userId: user.id,
        status: "IN_PROGRESS",
      },
    });

    // Companies where user has solved at least one question
    const companiesStarted = await prisma.questionProgress.findMany({
      where: {
        userId: user.id,
        status: { in: ["SOLVED", "IN_PROGRESS"] },
      },
      include: {
        question: {
          include: {
            companies: true,
          },
        },
      },
    });

    const uniqueCompanyIds = new Set(
      companiesStarted.flatMap((p) =>
        p.question.companies.map((c) => c.companyId)
      )
    );

    // ── Topic Progress ───────────────────────────────────────
    const totalTopics = await prisma.revisionTopic.count();

    const completedTopics = await prisma.topicProgress.count({
      where: {
        userId: user.id,
        status: "COMPLETED",
      },
    });

    const inProgressTopics = await prisma.topicProgress.count({
      where: {
        userId: user.id,
        status: "IN_PROGRESS",
      },
    });

    // ── Overall Interview Readiness ──────────────────────────
    // Weighted: 60% questions, 40% subjects
    const questionScore =
      totalQuestions > 0 ? (solvedQuestions / totalQuestions) * 60 : 0;
    const subjectScore =
      totalTopics > 0 ? (completedTopics / totalTopics) * 40 : 0;

    const overallReadiness = Math.round(questionScore + subjectScore);

    return NextResponse.json({
      questions: {
        total: totalQuestions,
        solved: solvedQuestions,
        inProgress: inProgressQuestions,
        completionPercentage:
          totalQuestions > 0
            ? Math.round((solvedQuestions / totalQuestions) * 100)
            : 0,
      },
      companies: {
        started: uniqueCompanyIds.size,
        total: await prisma.company.count(),
      },
      subjects: {
        totalTopics,
        completedTopics,
        inProgressTopics,
        completionPercentage:
          totalTopics > 0
            ? Math.round((completedTopics / totalTopics) * 100)
            : 0,
      },
      overallReadiness,
    });
  } catch (error) {
    console.error("Error fetching interview stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}