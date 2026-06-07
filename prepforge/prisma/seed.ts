import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Helper to upsert a question and link it to companies
async function seedQuestion(
  title: string,
  difficulty: string,
  topic: string,
  link: string,
  companyIds: string[]
) {
  let question = await prisma.question.findFirst({ where: { title } });

  if (!question) {
    question = await prisma.question.create({
      data: { title, difficulty, topic, link },
    });
  }

  for (const companyId of companyIds) {
    await prisma.companyQuestion.upsert({
      where: {
        companyId_questionId: { companyId, questionId: question.id },
      },
      update: {},
      create: { companyId, questionId: question.id },
    });
  }
}

async function main() {
  // ─── COMPANIES ───────────────────────────────────────────────
  console.log("🌱 Seeding companies...");

  const companyData = [
    { name: "Amazon", slug: "amazon" },
    { name: "Google", slug: "google" },
    { name: "Microsoft", slug: "microsoft" },
    { name: "Adobe", slug: "adobe" },
    { name: "Goldman Sachs", slug: "goldman-sachs" },
    { name: "Atlassian", slug: "atlassian" },
    { name: "Walmart", slug: "walmart" },
    { name: "Uber", slug: "uber" },
    { name: "Oracle", slug: "oracle" },
    { name: "Morgan Stanley", slug: "morgan-stanley" },
    { name: "JPMorgan", slug: "jpmorgan" },
    { name: "DE Shaw", slug: "de-shaw" },
    { name: "Arcesium", slug: "arcesium" },
    { name: "Sprinklr", slug: "sprinklr" },
    { name: "Flipkart", slug: "flipkart" },
    { name: "Razorpay", slug: "razorpay" },
    { name: "PhonePe", slug: "phonepe" },
    { name: "Zomato", slug: "zomato" },
    { name: "Swiggy", slug: "swiggy" },
    { name: "Paytm", slug: "paytm" },
  ];

  const companies: Record<string, string> = {};

  for (const c of companyData) {
    const company = await prisma.company.upsert({
      where: { slug: c.slug },
      update: {},
      create: { name: c.name, slug: c.slug },
    });
    companies[c.slug] = company.id;
  }

  console.log("✅ Companies seeded");

  // ─── QUESTIONS ───────────────────────────────────────────────
  console.log("🌱 Seeding questions...");

  const amazon = companies["amazon"];
  const google = companies["google"];
  const microsoft = companies["microsoft"];
  const adobe = companies["adobe"];
  const goldman = companies["goldman-sachs"];
  const atlassian = companies["atlassian"];
  const walmart = companies["walmart"];
  const uber = companies["uber"];
  const oracle = companies["oracle"];
  const morganStanley = companies["morgan-stanley"];
  const jpmorgan = companies["jpmorgan"];
  const deshaw = companies["de-shaw"];
  const arcesium = companies["arcesium"];
  const sprinklr = companies["sprinklr"];
  const flipkart = companies["flipkart"];
  const razorpay = companies["razorpay"];
  const phonepe = companies["phonepe"];
  const zomato = companies["zomato"];
  const swiggy = companies["swiggy"];
  const paytm = companies["paytm"];

  // ── Amazon ──────────────────────────────────────────────────
  await seedQuestion("Two Sum", "Easy", "Arrays", "https://leetcode.com/problems/two-sum/", [amazon, google, microsoft, flipkart]);
  await seedQuestion("LRU Cache", "Medium", "Design", "https://leetcode.com/problems/lru-cache/", [amazon, google, uber]);
  await seedQuestion("Number of Islands", "Medium", "Graphs", "https://leetcode.com/problems/number-of-islands/", [amazon, microsoft, flipkart]);
  await seedQuestion("Trapping Rain Water", "Hard", "Arrays", "https://leetcode.com/problems/trapping-rain-water/", [amazon, google, adobe]);
  await seedQuestion("Word Ladder", "Hard", "Graphs", "https://leetcode.com/problems/word-ladder/", [amazon]);
  await seedQuestion("Merge Intervals", "Medium", "Arrays", "https://leetcode.com/problems/merge-intervals/", [amazon, google, microsoft, uber]);
  await seedQuestion("Sliding Window Maximum", "Hard", "Sliding Window", "https://leetcode.com/problems/sliding-window-maximum/", [amazon, deshaw]);
  await seedQuestion("Design Amazon Locker", "Hard", "System Design", "https://leetcode.com/problems/design-parking-system/", [amazon]);
  await seedQuestion("K Closest Points to Origin", "Medium", "Heap", "https://leetcode.com/problems/k-closest-points-to-origin/", [amazon, google, uber]);
  await seedQuestion("Reorder Log Files", "Medium", "Strings", "https://leetcode.com/problems/reorder-data-in-log-files/", [amazon]);

  // ── Google ──────────────────────────────────────────────────
  await seedQuestion("Median of Two Sorted Arrays", "Hard", "Binary Search", "https://leetcode.com/problems/median-of-two-sorted-arrays/", [google, deshaw]);
  await seedQuestion("Longest Substring Without Repeating Characters", "Medium", "Sliding Window", "https://leetcode.com/problems/longest-substring-without-repeating-characters/", [google, amazon, adobe]);
  await seedQuestion("Search in Rotated Sorted Array", "Medium", "Binary Search", "https://leetcode.com/problems/search-in-rotated-sorted-array/", [google, microsoft, flipkart]);
  await seedQuestion("Valid Parentheses", "Easy", "Stack", "https://leetcode.com/problems/valid-parentheses/", [google, microsoft, atlassian]);
  await seedQuestion("Word Break", "Medium", "Dynamic Programming", "https://leetcode.com/problems/word-break/", [google, amazon]);
  await seedQuestion("Serialize and Deserialize Binary Tree", "Hard", "Trees", "https://leetcode.com/problems/serialize-and-deserialize-binary-tree/", [google, amazon]);
  await seedQuestion("Strobogrammatic Number", "Medium", "Math", "https://leetcode.com/problems/strobogrammatic-number/", [google]);
  await seedQuestion("Next Permutation", "Medium", "Arrays", "https://leetcode.com/problems/next-permutation/", [google, microsoft]);
  await seedQuestion("Alien Dictionary", "Hard", "Graphs", "https://leetcode.com/problems/alien-dictionary/", [google, uber, deshaw]);

  // ── Microsoft ───────────────────────────────────────────────
  await seedQuestion("Reverse Linked List", "Easy", "Linked List", "https://leetcode.com/problems/reverse-linked-list/", [microsoft, amazon, flipkart]);
  await seedQuestion("Binary Tree Level Order Traversal", "Medium", "Trees", "https://leetcode.com/problems/binary-tree-level-order-traversal/", [microsoft, amazon]);
  await seedQuestion("Clone Graph", "Medium", "Graphs", "https://leetcode.com/problems/clone-graph/", [microsoft, google]);
  await seedQuestion("Maximum Subarray", "Medium", "Dynamic Programming", "https://leetcode.com/problems/maximum-subarray/", [microsoft, amazon, goldman, deshaw]);
  await seedQuestion("Course Schedule", "Medium", "Graphs", "https://leetcode.com/problems/course-schedule/", [microsoft, google, uber]);
  await seedQuestion("Meeting Rooms II", "Medium", "Greedy", "https://leetcode.com/problems/meeting-rooms-ii/", [microsoft, google, uber, flipkart]);

  // ── Adobe ───────────────────────────────────────────────────
  await seedQuestion("Spiral Matrix", "Medium", "Arrays", "https://leetcode.com/problems/spiral-matrix/", [adobe, microsoft]);
  await seedQuestion("Jump Game", "Medium", "Greedy", "https://leetcode.com/problems/jump-game/", [adobe, amazon]);
  await seedQuestion("Decode Ways", "Medium", "Dynamic Programming", "https://leetcode.com/problems/decode-ways/", [adobe, amazon, microsoft]);
  await seedQuestion("Container With Most Water", "Medium", "Two Pointers", "https://leetcode.com/problems/container-with-most-water/", [adobe, google]);
  await seedQuestion("Image Overlap", "Medium", "Arrays", "https://leetcode.com/problems/image-overlap/", [adobe]);
  await seedQuestion("Largest Rectangle in Histogram", "Hard", "Stack", "https://leetcode.com/problems/largest-rectangle-in-histogram/", [adobe, deshaw, arcesium]);

  // ── Goldman Sachs ────────────────────────────────────────────
  await seedQuestion("Best Time to Buy and Sell Stock", "Easy", "Arrays", "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/", [goldman, jpmorgan, morganStanley, paytm]);
  await seedQuestion("Longest Common Subsequence", "Medium", "Dynamic Programming", "https://leetcode.com/problems/longest-common-subsequence/", [goldman, deshaw, arcesium]);
  await seedQuestion("Minimum Path Sum", "Medium", "Dynamic Programming", "https://leetcode.com/problems/minimum-path-sum/", [goldman, deshaw]);
  await seedQuestion("Find Median from Data Stream", "Hard", "Heap", "https://leetcode.com/problems/find-median-from-data-stream/", [goldman, deshaw, arcesium]);
  await seedQuestion("Max Points on a Line", "Hard", "Math", "https://leetcode.com/problems/max-points-on-a-line/", [goldman]);
  await seedQuestion("Russian Doll Envelopes", "Hard", "Dynamic Programming", "https://leetcode.com/problems/russian-doll-envelopes/", [goldman, deshaw]);

  // ── Atlassian ────────────────────────────────────────────────
  await seedQuestion("Design Browser History", "Medium", "Design", "https://leetcode.com/problems/design-browser-history/", [atlassian]);
  await seedQuestion("LFU Cache", "Hard", "Design", "https://leetcode.com/problems/lfu-cache/", [atlassian, google]);
  await seedQuestion("Task Scheduler", "Medium", "Greedy", "https://leetcode.com/problems/task-scheduler/", [atlassian, amazon]);
  await seedQuestion("Text Justification", "Hard", "Strings", "https://leetcode.com/problems/text-justification/", [atlassian, google]);
  await seedQuestion("Flatten Nested List Iterator", "Medium", "Design", "https://leetcode.com/problems/flatten-nested-list-iterator/", [atlassian]);

  // ── Walmart ──────────────────────────────────────────────────
  await seedQuestion("Top K Frequent Elements", "Medium", "Heap", "https://leetcode.com/problems/top-k-frequent-elements/", [walmart, amazon, flipkart]);
  await seedQuestion("Product of Array Except Self", "Medium", "Arrays", "https://leetcode.com/problems/product-of-array-except-self/", [walmart, amazon, microsoft]);
  await seedQuestion("Find All Anagrams in a String", "Medium", "Sliding Window", "https://leetcode.com/problems/find-all-anagrams-in-a-string/", [walmart]);
  await seedQuestion("Subarray Sum Equals K", "Medium", "Arrays", "https://leetcode.com/problems/subarray-sum-equals-k/", [walmart, amazon, flipkart]);

  // ── Uber ─────────────────────────────────────────────────────
  await seedQuestion("Surge Pricing (Jump Game II)", "Medium", "Greedy", "https://leetcode.com/problems/jump-game-ii/", [uber]);
  await seedQuestion("Shortest Path in Binary Matrix", "Medium", "Graphs", "https://leetcode.com/problems/shortest-path-in-binary-matrix/", [uber, google]);
  await seedQuestion("Design HashMap", "Easy", "Design", "https://leetcode.com/problems/design-hashmap/", [uber, microsoft]);
  await seedQuestion("Optimal Account Balancing", "Hard", "Graphs", "https://leetcode.com/problems/optimal-account-balancing/", [uber]);
  await seedQuestion("Evaluate Division", "Medium", "Graphs", "https://leetcode.com/problems/evaluate-division/", [uber, google]);

  // ── Oracle ───────────────────────────────────────────────────
  await seedQuestion("Employee Free Time", "Hard", "Intervals", "https://leetcode.com/problems/employee-free-time/", [oracle]);
  await seedQuestion("Department Top Three Salaries", "Hard", "SQL", "https://leetcode.com/problems/department-top-three-salaries/", [oracle, jpmorgan]);
  await seedQuestion("Nth Highest Salary", "Medium", "SQL", "https://leetcode.com/problems/nth-highest-salary/", [oracle, goldman, jpmorgan]);
  await seedQuestion("All Nodes Distance K in Binary Tree", "Medium", "Trees", "https://leetcode.com/problems/all-nodes-distance-k-in-binary-tree/", [oracle]);

  // ── Morgan Stanley ───────────────────────────────────────────
  await seedQuestion("Stock Price Fluctuation", "Medium", "Design", "https://leetcode.com/problems/stock-price-fluctuation/", [morganStanley, goldman]);
  await seedQuestion("Range Sum Query 2D", "Medium", "Arrays", "https://leetcode.com/problems/range-sum-query-2d-immutable/", [morganStanley, deshaw]);
  await seedQuestion("Maximum Profit in Job Scheduling", "Hard", "Dynamic Programming", "https://leetcode.com/problems/maximum-profit-in-job-scheduling/", [morganStanley, goldman]);
  await seedQuestion("Bulls and Cows", "Medium", "Strings", "https://leetcode.com/problems/bulls-and-cows/", [morganStanley]);

  // ── JPMorgan ─────────────────────────────────────────────────
  await seedQuestion("Two Sum IV - Input is a BST", "Easy", "Trees", "https://leetcode.com/problems/two-sum-iv-input-is-a-bst/", [jpmorgan]);
  await seedQuestion("Linked List Cycle", "Easy", "Linked List", "https://leetcode.com/problems/linked-list-cycle/", [jpmorgan, microsoft, amazon]);
  await seedQuestion("Remove Nth Node From End of List", "Medium", "Linked List", "https://leetcode.com/problems/remove-nth-node-from-end-of-list/", [jpmorgan, microsoft]);
  await seedQuestion("Count of Smaller Numbers After Self", "Hard", "Arrays", "https://leetcode.com/problems/count-of-smaller-numbers-after-self/", [jpmorgan, deshaw]);

  // ── DE Shaw ──────────────────────────────────────────────────
  await seedQuestion("Palindrome Partitioning II", "Hard", "Dynamic Programming", "https://leetcode.com/problems/palindrome-partitioning-ii/", [deshaw, arcesium]);
  await seedQuestion("Minimum Window Substring", "Hard", "Sliding Window", "https://leetcode.com/problems/minimum-window-substring/", [deshaw, google, amazon]);
  await seedQuestion("Burst Balloons", "Hard", "Dynamic Programming", "https://leetcode.com/problems/burst-balloons/", [deshaw]);
  await seedQuestion("Regular Expression Matching", "Hard", "Dynamic Programming", "https://leetcode.com/problems/regular-expression-matching/", [deshaw, google]);
  await seedQuestion("Longest Increasing Subsequence", "Medium", "Dynamic Programming", "https://leetcode.com/problems/longest-increasing-subsequence/", [deshaw, arcesium, goldman]);

  // ── Arcesium ─────────────────────────────────────────────────
  await seedQuestion("Recover Binary Search Tree", "Medium", "Trees", "https://leetcode.com/problems/recover-binary-search-tree/", [arcesium]);
  await seedQuestion("Smallest Range Covering Elements from K Lists", "Hard", "Heap", "https://leetcode.com/problems/smallest-range-covering-elements-from-k-lists/", [arcesium, deshaw]);
  await seedQuestion("Trapping Rain Water II", "Hard", "Graphs", "https://leetcode.com/problems/trapping-rain-water-ii/", [arcesium]);
  await seedQuestion("Count of Range Sum", "Hard", "Arrays", "https://leetcode.com/problems/count-of-range-sum/", [arcesium]);

  // ── Sprinklr ─────────────────────────────────────────────────
  await seedQuestion("Design Twitter", "Medium", "Design", "https://leetcode.com/problems/design-twitter/", [sprinklr]);
  await seedQuestion("Word Search II", "Hard", "Graphs", "https://leetcode.com/problems/word-search-ii/", [sprinklr, google]);
  await seedQuestion("Implement Trie", "Medium", "Trie", "https://leetcode.com/problems/implement-trie-prefix-tree/", [sprinklr, google, microsoft]);
  await seedQuestion("Design Search Autocomplete System", "Hard", "Trie", "https://leetcode.com/problems/design-search-autocomplete-system/", [sprinklr, google]);

  // ── Flipkart ─────────────────────────────────────────────────
  await seedQuestion("Kth Largest Element in an Array", "Medium", "Heap", "https://leetcode.com/problems/kth-largest-element-in-an-array/", [flipkart, amazon, microsoft]);
  await seedQuestion("Rotate Image", "Medium", "Arrays", "https://leetcode.com/problems/rotate-image/", [flipkart, microsoft, adobe]);
  await seedQuestion("Set Matrix Zeroes", "Medium", "Arrays", "https://leetcode.com/problems/set-matrix-zeroes/", [flipkart, amazon]);
  await seedQuestion("Longest Palindromic Substring", "Medium", "Strings", "https://leetcode.com/problems/longest-palindromic-substring/", [flipkart, amazon, microsoft]);
  await seedQuestion("Min Stack", "Medium", "Stack", "https://leetcode.com/problems/min-stack/", [flipkart, amazon, microsoft]);

  // ── Razorpay ─────────────────────────────────────────────────
  await seedQuestion("Design a Payment System (Flatten 2D Vector)", "Medium", "Design", "https://leetcode.com/problems/flatten-2d-vector/", [razorpay]);
  await seedQuestion("Integer to Roman", "Medium", "Math", "https://leetcode.com/problems/integer-to-roman/", [razorpay, microsoft]);
  await seedQuestion("Group Anagrams", "Medium", "Strings", "https://leetcode.com/problems/group-anagrams/", [razorpay, amazon, google]);
  await seedQuestion("Unique Paths", "Medium", "Dynamic Programming", "https://leetcode.com/problems/unique-paths/", [razorpay, amazon]);
  await seedQuestion("Coin Change", "Medium", "Dynamic Programming", "https://leetcode.com/problems/coin-change/", [razorpay, amazon, google]);

  // ── PhonePe ──────────────────────────────────────────────────
  await seedQuestion("Design Notification System (Moving Average)", "Easy", "Design", "https://leetcode.com/problems/moving-average-from-data-stream/", [phonepe]);
  await seedQuestion("Validate Binary Search Tree", "Medium", "Trees", "https://leetcode.com/problems/validate-binary-search-tree/", [phonepe, amazon, microsoft]);
  await seedQuestion("Path Sum II", "Medium", "Trees", "https://leetcode.com/problems/path-sum-ii/", [phonepe, amazon]);
  await seedQuestion("Find Duplicate Number", "Medium", "Arrays", "https://leetcode.com/problems/find-the-duplicate-number/", [phonepe, flipkart]);

  // ── Zomato ───────────────────────────────────────────────────
  await seedQuestion("Design Food Delivery (Design Underground System)", "Medium", "Design", "https://leetcode.com/problems/design-underground-system/", [zomato]);
  await seedQuestion("The Skyline Problem", "Hard", "Heap", "https://leetcode.com/problems/the-skyline-problem/", [zomato, google]);
  await seedQuestion("Insert Delete GetRandom O(1)", "Medium", "Design", "https://leetcode.com/problems/insert-delete-getrandom-o1/", [zomato, amazon]);
  await seedQuestion("Random Pick with Weight", "Medium", "Math", "https://leetcode.com/problems/random-pick-with-weight/", [zomato, uber]);

  // ── Swiggy ───────────────────────────────────────────────────
  await seedQuestion("Minimum Cost to Connect Sticks", "Medium", "Heap", "https://leetcode.com/problems/minimum-cost-to-connect-sticks/", [swiggy, amazon]);
  await seedQuestion("Reorganize String", "Medium", "Greedy", "https://leetcode.com/problems/reorganize-string/", [swiggy, google]);
  await seedQuestion("Next Greater Element II", "Medium", "Stack", "https://leetcode.com/problems/next-greater-element-ii/", [swiggy]);
  await seedQuestion("Partition Equal Subset Sum", "Medium", "Dynamic Programming", "https://leetcode.com/problems/partition-equal-subset-sum/", [swiggy, amazon, flipkart]);

  // ── Paytm ────────────────────────────────────────────────────
  await seedQuestion("Maximum Product Subarray", "Medium", "Dynamic Programming", "https://leetcode.com/problems/maximum-product-subarray/", [paytm, amazon, flipkart]);
  await seedQuestion("Counting Bits", "Easy", "Bit Manipulation", "https://leetcode.com/problems/counting-bits/", [paytm]);
  await seedQuestion("Single Number", "Easy", "Bit Manipulation", "https://leetcode.com/problems/single-number/", [paytm, amazon, microsoft]);
  await seedQuestion("Power of Two", "Easy", "Math", "https://leetcode.com/problems/power-of-two/", [paytm]);
  await seedQuestion("Palindrome Number", "Easy", "Math", "https://leetcode.com/problems/palindrome-number/", [paytm, microsoft]);

  console.log("✅ Questions seeded");

  // ─── SUBJECTS ────────────────────────────────────────────────
  console.log("🌱 Seeding subjects...");

  const subjectTopics = [
    { subject: "dbms", title: "ER Diagrams", order: 1 },
    { subject: "dbms", title: "Normalization", order: 2 },
    { subject: "dbms", title: "Transactions", order: 3 },
    { subject: "dbms", title: "ACID Properties", order: 4 },
    { subject: "dbms", title: "Indexing", order: 5 },
    { subject: "dbms", title: "Joins", order: 6 },
    { subject: "dbms", title: "Query Optimization", order: 7 },
    { subject: "oops", title: "Classes & Objects", order: 1 },
    { subject: "oops", title: "Encapsulation", order: 2 },
    { subject: "oops", title: "Abstraction", order: 3 },
    { subject: "oops", title: "Inheritance", order: 4 },
    { subject: "oops", title: "Polymorphism", order: 5 },
    { subject: "oops", title: "SOLID Principles", order: 6 },
    { subject: "os", title: "Processes", order: 1 },
    { subject: "os", title: "Threads", order: 2 },
    { subject: "os", title: "Scheduling", order: 3 },
    { subject: "os", title: "Deadlocks", order: 4 },
    { subject: "os", title: "Memory Management", order: 5 },
    { subject: "os", title: "Paging", order: 6 },
    { subject: "os", title: "Virtual Memory", order: 7 },
    { subject: "cn", title: "OSI Model", order: 1 },
    { subject: "cn", title: "TCP/IP", order: 2 },
    { subject: "cn", title: "HTTP/HTTPS", order: 3 },
    { subject: "cn", title: "DNS", order: 4 },
    { subject: "cn", title: "Routing", order: 5 },
    { subject: "cn", title: "Congestion Control", order: 6 },
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