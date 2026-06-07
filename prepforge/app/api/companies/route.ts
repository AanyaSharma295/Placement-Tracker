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

    const companies = await prisma.company.findMany({
      include: {
        questions: {
          include: {
            question: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });

    const companiesWithProgress = await Promise.all(
      companies.map(async (company) => {
        const questionIds = company.questions.map((q) => q.questionId);

        const solvedCount = await prisma.questionProgress.count({
          where: {
            userId: user.id,
            questionId: { in: questionIds },
            status: "SOLVED",
          },
        });

        const totalQuestions = questionIds.length;
        const completionPercentage =
          totalQuestions > 0
            ? Math.round((solvedCount / totalQuestions) * 100)
            : 0;

        return {
          id: company.id,
          name: company.name,
          slug: company.slug,
          totalQuestions,
          solvedQuestions: solvedCount,
          completionPercentage,
        };
      })
    );

    return NextResponse.json(companiesWithProgress);
  } catch (error) {
    console.error("Error fetching companies:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}