import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding companies...");

  const amazon = await prisma.company.upsert({
    where: { slug: "amazon" },
    update: {},
    create: { name: "Amazon", slug: "amazon" },
  });

  const google = await prisma.company.upsert({
    where: { slug: "google" },
    update: {},
    create: { name: "Google", slug: "google" },
  });

  const microsoft = await prisma.company.upsert({
    where: { slug: "microsoft" },
    update: {},
    create: { name: "Microsoft", slug: "microsoft" },
  });

  const adobe = await prisma.company.upsert({
    where: { slug: "adobe" },
    update: {},
    create: { name: "Adobe", slug: "adobe" },
  });

  const goldman = await prisma.company.upsert({
    where: { slug: "goldman-sachs" },
    update: {},
    create: { name: "Goldman Sachs", slug: "goldman-sachs" },
  });

  console.log("✅ Companies seeded");

  // ─── QUESTIONS ───────────────────────────────────────────────
  console.log("🌱 Seeding questions...");

  const questions = [
    // Amazon
    {
      title: "Two Sum",
      difficulty: "Easy",
      topic: "Arrays",
      link: "https://leetcode.com/problems/two-sum/",
      companies: [amazon.id],
    },
    {
      title: "LRU Cache",
      difficulty: "Medium",
      topic: "Design",
      link: "https://leetcode.com/problems/lru-cache/",
      companies: [amazon.id],
    },
    {
      title: "Number of Islands",
      difficulty: "Medium",
      topic: "Graphs",
      link: "https://leetcode.com/problems/number-of-islands/",
      companies: [amazon.id],
    },
    {
      title: "Trapping Rain Water",
      difficulty: "Hard",
      topic: "Arrays",
      link: "https://leetcode.com/problems/trapping-rain-water/",
      companies: [amazon.id],
    },
    {
      title: "Word Ladder",
      difficulty: "Hard",
      topic: "Graphs",
      link: "https://leetcode.com/problems/word-ladder/",
      companies: [amazon.id],
    },
    {
      title: "Merge Intervals",
      difficulty: "Medium",
      topic: "Arrays",
      link: "https://leetcode.com/problems/merge-intervals/",
      companies: [amazon.id],
    },
    // Google
    {
      title: "Median of Two Sorted Arrays",
      difficulty: "Hard",
      topic: "Binary Search",
      link: "https://leetcode.com/problems/median-of-two-sorted-arrays/",
      companies: [google.id],
    },
    {
      title: "Longest Substring Without Repeating Characters",
      difficulty: "Medium",
      topic: "Sliding Window",
      link: "https://leetcode.com/problems/longest-substring-without-repeating-characters/",
      companies: [google.id],
    },
    {
      title: "Search in Rotated Sorted Array",
      difficulty: "Medium",
      topic: "Binary Search",
      link: "https://leetcode.com/problems/search-in-rotated-sorted-array/",
      companies: [google.id],
    },
    {
      title: "Valid Parentheses",
      difficulty: "Easy",
      topic: "Stack",
      link: "https://leetcode.com/problems/valid-parentheses/",
      companies: [google.id],
    },
    {
      title: "Word Break",
      difficulty: "Medium",
      topic: "Dynamic Programming",
      link: "https://leetcode.com/problems/word-break/",
      companies: [google.id],
    },
    {
      title: "Serialize and Deserialize Binary Tree",
      difficulty: "Hard",
      topic: "Trees",
      link: "https://leetcode.com/problems/serialize-and-deserialize-binary-tree/",
      companies: [google.id],
    },
    // Microsoft
    {
      title: "Reverse Linked List",
      difficulty: "Easy",
      topic: "Linked List",
      link: "https://leetcode.com/problems/reverse-linked-list/",
      companies: [microsoft.id],
    },
    {
      title: "Binary Tree Level Order Traversal",
      difficulty: "Medium",
      topic: "Trees",
      link: "https://leetcode.com/problems/binary-tree-level-order-traversal/",
      companies: [microsoft.id],
    },
    {
      title: "Clone Graph",
      difficulty: "Medium",
      topic: "Graphs",
      link: "https://leetcode.com/problems/clone-graph/",
      companies: [microsoft.id],
    },
    {
      title: "Maximum Subarray",
      difficulty: "Medium",
      topic: "Dynamic Programming",
      link: "https://leetcode.com/problems/maximum-subarray/",
      companies: [microsoft.id],
    },
    {
      title: "Course Schedule",
      difficulty: "Medium",
      topic: "Graphs",
      link: "https://leetcode.com/problems/course-schedule/",
      companies: [microsoft.id],
    },
    // Adobe
    {
      title: "Spiral Matrix",
      difficulty: "Medium",
      topic: "Arrays",
      link: "https://leetcode.com/problems/spiral-matrix/",
      companies: [adobe.id],
    },
    {
      title: "Jump Game",
      difficulty: "Medium",
      topic: "Greedy",
      link: "https://leetcode.com/problems/jump-game/",
      companies: [adobe.id],
    },
    {
      title: "Decode Ways",
      difficulty: "Medium",
      topic: "Dynamic Programming",
      link: "https://leetcode.com/problems/decode-ways/",
      companies: [adobe.id],
    },
    {
      title: "Container With Most Water",
      difficulty: "Medium",
      topic: "Two Pointers",
      link: "https://leetcode.com/problems/container-with-most-water/",
      companies: [adobe.id],
    },
    // Goldman Sachs
    {
      title: "Best Time to Buy and Sell Stock",
      difficulty: "Easy",
      topic: "Arrays",
      link: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/",
      companies: [goldman.id],
    },
    {
      title: "Longest Common Subsequence",
      difficulty: "Medium",
      topic: "Dynamic Programming",
      link: "https://leetcode.com/problems/longest-common-subsequence/",
      companies: [goldman.id],
    },
    {
      title: "Minimum Path Sum",
      difficulty: "Medium",
      topic: "Dynamic Programming",
      link: "https://leetcode.com/problems/minimum-path-sum/",
      companies: [goldman.id],
    },
    {
      title: "Find Median from Data Stream",
      difficulty: "Hard",
      topic: "Heap",
      link: "https://leetcode.com/problems/find-median-from-data-stream/",
      companies: [goldman.id],
    },
    // Shared
    {
      title: "3Sum",
      difficulty: "Medium",
      topic: "Two Pointers",
      link: "https://leetcode.com/problems/3sum/",
      companies: [amazon.id, microsoft.id, adobe.id],
    },
    {
      title: "Binary Search",
      difficulty: "Easy",
      topic: "Binary Search",
      link: "https://leetcode.com/problems/binary-search/",
      companies: [google.id, microsoft.id],
    },
    {
      title: "Lowest Common Ancestor of a Binary Tree",
      difficulty: "Medium",
      topic: "Trees",
      link: "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/",
      companies: [amazon.id, google.id, microsoft.id],
    },
  ];

  for (const q of questions) {
    // Check if question already exists by title
    let question = await prisma.question.findFirst({
      where: { title: q.title },
    });

    if (!question) {
      question = await prisma.question.create({
        data: {
          title: q.title,
          difficulty: q.difficulty,
          topic: q.topic,
          link: q.link,
        },
      });
    }

    for (const companyId of q.companies) {
      await prisma.companyQuestion.upsert({
        where: {
          companyId_questionId: {
            companyId,
            questionId: question.id,
          },
        },
        update: {},
        create: {
          companyId,
          questionId: question.id,
        },
      });
    }
  }

  console.log("✅ Questions seeded");

  // ─── SUBJECTS ────────────────────────────────────────────────
  console.log("🌱 Seeding subjects...");

  const subjectTopics = [
    // DBMS
    { subject: "dbms", title: "ER Diagrams", order: 1 },
    { subject: "dbms", title: "Normalization", order: 2 },
    { subject: "dbms", title: "Transactions", order: 3 },
    { subject: "dbms", title: "ACID Properties", order: 4 },
    { subject: "dbms", title: "Indexing", order: 5 },
    { subject: "dbms", title: "Joins", order: 6 },
    { subject: "dbms", title: "Query Optimization", order: 7 },
    // OOPS
    { subject: "oops", title: "Classes & Objects", order: 1 },
    { subject: "oops", title: "Encapsulation", order: 2 },
    { subject: "oops", title: "Abstraction", order: 3 },
    { subject: "oops", title: "Inheritance", order: 4 },
    { subject: "oops", title: "Polymorphism", order: 5 },
    { subject: "oops", title: "SOLID Principles", order: 6 },
    // OS
    { subject: "os", title: "Processes", order: 1 },
    { subject: "os", title: "Threads", order: 2 },
    { subject: "os", title: "Scheduling", order: 3 },
    { subject: "os", title: "Deadlocks", order: 4 },
    { subject: "os", title: "Memory Management", order: 5 },
    { subject: "os", title: "Paging", order: 6 },
    { subject: "os", title: "Virtual Memory", order: 7 },
    // CN
    { subject: "cn", title: "OSI Model", order: 1 },
    { subject: "cn", title: "TCP/IP", order: 2 },
    { subject: "cn", title: "HTTP/HTTPS", order: 3 },
    { subject: "cn", title: "DNS", order: 4 },
    { subject: "cn", title: "Routing", order: 5 },
    { subject: "cn", title: "Congestion Control", order: 6 },
    // SQL
    { subject: "sql", title: "SELECT Queries", order: 1 },
    { subject: "sql", title: "JOINS", order: 2 },
    { subject: "sql", title: "GROUP BY & HAVING", order: 3 },
    { subject: "sql", title: "Subqueries", order: 4 },
    { subject: "sql", title: "Window Functions", order: 5 },
    { subject: "sql", title: "Indexes & Performance", order: 6 },
  ];

  for (const topic of subjectTopics) {
    await prisma.revisionTopic.upsert({
      where: { id: `${topic.subject}-${topic.order}` },
      update: {},
      create: {
        id: `${topic.subject}-${topic.order}`,
        subject: topic.subject,
        title: topic.title,
        content: "",
        order: topic.order,
      },
    });
  }

  console.log("✅ Subjects seeded");
  console.log("🎉 All done!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });