import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const SLUG_MAP: Record<string, string> = {
  "ER Diagrams": "er-diagrams",
  "Normalization": "normalization",
  "Transactions": "transactions",
  "ACID Properties": "acid-properties",
  "Indexing": "indexing",
  "Joins": "joins",
  "Query Optimization": "query-optimization",
  "Classes & Objects": "classes-objects",
  "Encapsulation": "encapsulation",
  "Abstraction": "abstraction",
  "Inheritance": "inheritance",
  "Polymorphism": "polymorphism",
  "SOLID Principles": "solid-principles",
  "Processes": "processes",
  "Threads": "threads",
  "Scheduling": "scheduling",
  "Deadlocks": "deadlocks",
  "Memory Management": "memory-management",
  "Paging": "paging",
  "Virtual Memory": "virtual-memory",
  "OSI Model": "osi-model",
  "TCP/IP": "tcp-ip",
  "HTTP/HTTPS": "http-https",
  "DNS": "dns",
  "Routing": "routing",
  "Congestion Control": "congestion-control",
  "SELECT Queries": "select-queries",
  "JOINS": "joins-sql",
  "GROUP BY & HAVING": "group-by-having",
  "Subqueries": "subqueries",
  "Window Functions": "window-functions",
  "Indexes & Performance": "indexes-performance",
};

async function main() {
  console.log("🔧 Fixing all slugs...");

  const topics = await prisma.revisionTopic.findMany();
  console.log(`Found ${topics.length} topics`);

  for (const topic of topics) {
    const slug = SLUG_MAP[topic.title];
    if (!slug) {
      console.warn(`⚠️  No slug for: "${topic.title}" — skipping`);
      continue;
    }
    await prisma.revisionTopic.update({
      where: { id: topic.id },
      data: { slug },
    });
    console.log(`✅ ${topic.subject} | ${topic.title} → ${slug}`);
  }

  const empty = await prisma.revisionTopic.findMany({
    where: { slug: "" },
  });

  if (empty.length > 0) {
    console.log("\n⚠️  Still empty:");
    empty.forEach((t) => console.log(`  ${t.subject} | ${t.title}`));
  } else {
    console.log("\n✅ All slugs filled — no empty slugs remain!");
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());