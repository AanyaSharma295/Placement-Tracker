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

export async function GET(
  request: Request,
  { params }: { params: Promise<{ subject: string }> }
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

    const { subject } = await params;

    const topics = await prisma.revisionTopic.findMany({
      where: { subject },
      orderBy: { order: "asc" },
    });

    if (topics.length === 0) {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 });
    }

    const progressRecords = await prisma.topicProgress.findMany({
      where: {
        userId: user.id,
        topicId: { in: topics.map((t) => t.id) },
      },
    });

    const progressMap = new Map(
      progressRecords.map((p) => [p.topicId, p.status])
    );

    const topicsWithProgress = topics.map((topic) => ({
      id: topic.id,
      title: topic.title,
      order: topic.order,
      status: progressMap.get(topic.id) ?? "NOT_STARTED",
    }));

    const totalTopics = topicsWithProgress.length;
    const completedTopics = topicsWithProgress.filter(
      (t) => t.status === "COMPLETED"
    ).length;
    const inProgressTopics = topicsWithProgress.filter(
      (t) => t.status === "IN_PROGRESS"
    ).length;
    const completionPercentage =
      totalTopics > 0
        ? Math.round((completedTopics / totalTopics) * 100)
        : 0;

    const meta = SUBJECT_META[subject as SubjectSlug];

    return NextResponse.json({
      slug: subject,
      label: meta?.label ?? subject.toUpperCase(),
      stats: {
        totalTopics,
        completedTopics,
        inProgressTopics,
        remainingTopics: totalTopics - completedTopics,
        completionPercentage,
      },
      topics: topicsWithProgress,
    });
  } catch (error) {
    console.error("Error fetching subject:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}