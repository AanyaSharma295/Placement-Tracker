import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const topics = await prisma.revisionTopic.findMany({
    include: { questions: true },
    orderBy: [{ subject: "asc" }, { order: "asc" }],
  });

  console.log("Topics with question counts:\n");
  for (const t of topics) {
    const status = t.questions.length === 0 ? "❌ EMPTY" : `✅ ${t.questions.length} questions`;
    console.log(`${status} | ${t.subject} | ${t.title}`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());