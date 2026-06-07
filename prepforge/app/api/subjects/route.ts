import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const SUBJECT_META = {
  dbms: { label: "DBMS", order: 1 },
  oops: { label: "OOPS", order: 2 },
  os: { label: "Operating Systems", order: 3 },
  cn: { label: "Computer Networks", order: 4 },
  sql: { label: "SQL", order: 5 },
} as const;

type SubjectSlug = keyof typeof SUBJECT_META;

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

    const topics = await prisma.revisionTopic.findMany();

    const progressRecords = await prisma.topicProgress.findMany({
      where: { userId: user.id },
    });

    const progressMap = new Map(
      progressRecords.map((p) => [p.topicId, p.status])
    );

    const subjectMap: {
      [key: string]: { total: number; completed: number; inProgress: number };
    } = {};

    for (const topic of topics) {
      if (!subjectMap[topic.subject]) {
        subjectMap[topic.subject] = { total: 0, completed: 0, inProgress: 0 };
      }
      subjectMap[topic.subject].total++;

      const status = progressMap.get(topic.id) ?? "NOT_STARTED";
      if (status === "COMPLETED") subjectMap[topic.subject].completed++;
      if (status === "IN_PROGRESS") subjectMap[topic.subject].inProgress++;
    }

    const subjects = Object.entries(subjectMap)
      .map(([slug, stats]) => {
        const meta = SUBJECT_META[slug as SubjectSlug];
        return {
          slug,
          label: meta?.label ?? slug.toUpperCase(),
          order: meta?.order ?? 99,
          totalTopics: stats.total,
          completedTopics: stats.completed,
          inProgressTopics: stats.inProgress,
          completionPercentage:
            stats.total > 0
              ? Math.round((stats.completed / stats.total) * 100)
              : 0,
        };
      })
      .sort((a, b) => a.order - b.order);

    return NextResponse.json(subjects);
  } catch (error) {
    console.error("Error fetching subjects:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}