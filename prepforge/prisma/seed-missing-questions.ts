import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function getTopicId(subject: string, slug: string): Promise<string> {
  const topic = await prisma.revisionTopic.findUnique({
    where: { subject_slug: { subject, slug } },
  });
  if (!topic) throw new Error(`Topic not found: ${subject}/${slug}`);
  return topic.id;
}

async function seedQuestions(
  topicId: string,
  questions: Array<{
    type: string;
    question: string;
    difficulty: string;
    frequency: string;
    companies: string[];
    interviewerNote?: string;
    options?: string[];
    correctOption?: number;
    explanation?: string;
    order: number;
  }>
) {
  for (const q of questions) {
    await prisma.subjectQuestion.create({ data: { topicId, ...q } });
  }
  console.log(`✅ Seeded ${questions.length} questions for topic ${topicId}`);
}

async function main() {
  console.log("🌱 Seeding missing questions...");

  // ── CN: HTTP/HTTPS ───────────────────────────────────────────
  const httpId = await getTopicId("cn", "http-https");
  await seedQuestions(httpId, [
    {
      type: "THEORY", order: 1,
      question: "What is the difference between HTTP and HTTPS?",
      difficulty: "Easy", frequency: "High",
      companies: ["Amazon", "Google", "Microsoft", "Uber", "Zomato"],
      interviewerNote: "Follow-up: What is SSL/TLS and how does it work?",
    },
    {
      type: "THEORY", order: 2,
      question: "Explain the HTTP request-response cycle in detail.",
      difficulty: "Easy", frequency: "High",
      companies: ["Amazon", "Google", "Flipkart"],
    },
    {
      type: "THEORY", order: 3,
      question: "What are HTTP status codes? Explain 2xx, 3xx, 4xx, and 5xx with examples.",
      difficulty: "Medium", frequency: "High",
      companies: ["Amazon", "Google", "Microsoft", "Atlassian"],
      interviewerNote: "Follow-up: What is the difference between 401 and 403?",
    },
    {
      type: "THEORY", order: 4,
      question: "What is the difference between HTTP/1.1, HTTP/2, and HTTP/3?",
      difficulty: "Hard", frequency: "Medium",
      companies: ["Google", "Amazon", "Uber"],
    },
    {
      type: "THEORY", order: 5,
      question: "What are HTTP methods? Explain GET, POST, PUT, PATCH, and DELETE.",
      difficulty: "Easy", frequency: "High",
      companies: ["Amazon", "Google", "Microsoft", "Razorpay"],
    },
    {
      type: "MCQ", order: 6,
      question: "Which HTTP status code indicates a resource was successfully created?",
      difficulty: "Easy", frequency: "High",
      companies: ["Amazon", "Microsoft"],
      options: ["200 OK", "201 Created", "204 No Content", "301 Moved Permanently"],
      correctOption: 1,
      explanation: "201 Created indicates that the request was successful and a new resource was created as a result.",
    },
  ]);

  // ── CN: DNS ──────────────────────────────────────────────────
  const dnsId = await getTopicId("cn", "dns");
  await seedQuestions(dnsId, [
    {
      type: "THEORY", order: 1,
      question: "What is DNS and how does it work?",
      difficulty: "Easy", frequency: "High",
      companies: ["Amazon", "Google", "Microsoft", "Uber"],
      interviewerNote: "Follow-up: What happens when you type google.com in your browser?",
    },
    {
      type: "THEORY", order: 2,
      question: "What is the difference between authoritative and recursive DNS servers?",
      difficulty: "Medium", frequency: "Medium",
      companies: ["Google", "Amazon"],
    },
    {
      type: "THEORY", order: 3,
      question: "What is DNS caching? What is TTL in DNS?",
      difficulty: "Medium", frequency: "Medium",
      companies: ["Amazon", "Google", "Cloudflare"],
    },
    {
      type: "THEORY", order: 4,
      question: "What is a DNS A record vs CNAME record? When would you use each?",
      difficulty: "Medium", frequency: "Medium",
      companies: ["Amazon", "Google"],
    },
    {
      type: "MCQ", order: 5,
      question: "Which port does DNS typically use?",
      difficulty: "Easy", frequency: "Medium",
      companies: ["Amazon", "Oracle"],
      options: ["80", "443", "53", "22"],
      correctOption: 2,
      explanation: "DNS uses port 53 for both UDP (for most queries) and TCP (for zone transfers and large responses).",
    },
    {
      type: "MCQ", order: 6,
      question: "What type of DNS record maps a domain name to an IP address?",
      difficulty: "Easy", frequency: "High",
      companies: ["Amazon", "Google"],
      options: ["MX Record", "CNAME Record", "A Record", "NS Record"],
      correctOption: 2,
      explanation: "An A (Address) record maps a domain name directly to an IPv4 address.",
    },
  ]);

  // ── CN: Routing ──────────────────────────────────────────────
  const routingId = await getTopicId("cn", "routing");
  await seedQuestions(routingId, [
    {
      type: "THEORY", order: 1,
      question: "What is routing in computer networks? What is the difference between static and dynamic routing?",
      difficulty: "Easy", frequency: "High",
      companies: ["Amazon", "Google", "Oracle"],
    },
    {
      type: "THEORY", order: 2,
      question: "Explain Dijkstra's algorithm and how it is used in link-state routing.",
      difficulty: "Hard", frequency: "Medium",
      companies: ["Google", "DE Shaw", "Amazon"],
      interviewerNote: "Follow-up: What is the time complexity of Dijkstra's algorithm?",
    },
    {
      type: "THEORY", order: 3,
      question: "What is the difference between distance vector and link state routing protocols?",
      difficulty: "Medium", frequency: "Medium",
      companies: ["Oracle", "Google"],
    },
    {
      type: "THEORY", order: 4,
      question: "What is BGP? Why is it called the protocol of the internet?",
      difficulty: "Hard", frequency: "Low",
      companies: ["Google", "Amazon"],
    },
    {
      type: "MCQ", order: 5,
      question: "Which routing protocol uses the Bellman-Ford algorithm?",
      difficulty: "Medium", frequency: "Medium",
      companies: ["Oracle", "Google"],
      options: ["OSPF", "BGP", "RIP", "EIGRP"],
      correctOption: 2,
      explanation: "RIP (Routing Information Protocol) uses the Bellman-Ford algorithm for distance vector routing.",
    },
    {
      type: "MCQ", order: 6,
      question: "What is the maximum hop count in RIP?",
      difficulty: "Medium", frequency: "Low",
      companies: ["Oracle"],
      options: ["8", "15", "32", "255"],
      correctOption: 1,
      explanation: "RIP has a maximum hop count of 15. A hop count of 16 is considered infinity, meaning the destination is unreachable.",
    },
  ]);

  // ── CN: Congestion Control ───────────────────────────────────
  const congestionId = await getTopicId("cn", "congestion-control");
  await seedQuestions(congestionId, [
    {
      type: "THEORY", order: 1,
      question: "What is network congestion? How does TCP handle it?",
      difficulty: "Medium", frequency: "High",
      companies: ["Google", "Amazon", "DE Shaw"],
      interviewerNote: "Follow-up: What is the difference between flow control and congestion control?",
    },
    {
      type: "THEORY", order: 2,
      question: "Explain TCP slow start and congestion avoidance algorithms.",
      difficulty: "Hard", frequency: "Medium",
      companies: ["Google", "Amazon"],
    },
    {
      type: "THEORY", order: 3,
      question: "What is the TCP congestion window (cwnd)? How does it change over time?",
      difficulty: "Hard", frequency: "Medium",
      companies: ["Google", "DE Shaw"],
    },
    {
      type: "THEORY", order: 4,
      question: "What is the difference between TCP Tahoe and TCP Reno?",
      difficulty: "Hard", frequency: "Low",
      companies: ["Google", "DE Shaw"],
    },
    {
      type: "MCQ", order: 5,
      question: "In TCP slow start, the congestion window size grows:",
      difficulty: "Medium", frequency: "High",
      companies: ["Google", "Amazon"],
      options: ["Linearly", "Exponentially", "Logarithmically", "Remains constant"],
      correctOption: 1,
      explanation: "In TCP slow start, the congestion window doubles with each RTT (exponential growth) until it reaches the slow start threshold (ssthresh).",
    },
    {
      type: "MCQ", order: 6,
      question: "What triggers TCP to enter the congestion avoidance phase?",
      difficulty: "Medium", frequency: "Medium",
      companies: ["Google"],
      options: [
        "When cwnd reaches ssthresh",
        "When a packet is sent",
        "When ACK is received",
        "When cwnd is 1"
      ],
      correctOption: 0,
      explanation: "TCP enters congestion avoidance when cwnd reaches ssthresh. After this point, cwnd grows linearly (by 1 MSS per RTT) instead of exponentially.",
    },
  ]);

  // ── DBMS: ER Diagrams ────────────────────────────────────────
  const erId = await getTopicId("dbms", "er-diagrams");
  await seedQuestions(erId, [
    {
      type: "THEORY", order: 1,
      question: "What is an ER diagram? What are its main components?",
      difficulty: "Easy", frequency: "High",
      companies: ["Amazon", "Microsoft", "Oracle", "Flipkart"],
    },
    {
      type: "THEORY", order: 2,
      question: "What is the difference between strong and weak entities in ER diagrams?",
      difficulty: "Medium", frequency: "Medium",
      companies: ["Oracle", "Microsoft"],
      interviewerNote: "Follow-up: Give a real-world example of a weak entity.",
    },
    {
      type: "THEORY", order: 3,
      question: "Explain cardinality in ER diagrams. What are one-to-one, one-to-many, and many-to-many relationships?",
      difficulty: "Easy", frequency: "High",
      companies: ["Amazon", "Oracle", "Microsoft"],
    },
    {
      type: "THEORY", order: 4,
      question: "How do you convert an ER diagram to relational tables?",
      difficulty: "Medium", frequency: "High",
      companies: ["Oracle", "Amazon", "Goldman Sachs"],
    },
    {
      type: "MCQ", order: 5,
      question: "In an ER diagram, a weak entity is represented by:",
      difficulty: "Easy", frequency: "Medium",
      companies: ["Oracle", "Microsoft"],
      options: ["Single rectangle", "Double rectangle", "Diamond", "Ellipse"],
      correctOption: 1,
      explanation: "A weak entity is represented by a double rectangle in ER diagrams. It depends on a strong entity for its existence.",
    },
    {
      type: "MCQ", order: 6,
      question: "Which symbol represents a relationship in an ER diagram?",
      difficulty: "Easy", frequency: "High",
      companies: ["Oracle", "Amazon"],
      options: ["Rectangle", "Ellipse", "Diamond", "Circle"],
      correctOption: 2,
      explanation: "Relationships between entities are represented by diamonds in ER diagrams.",
    },
  ]);

  // ── DBMS: Joins ──────────────────────────────────────────────
  const dbmsJoinsId = await getTopicId("dbms", "joins");
  await seedQuestions(dbmsJoinsId, [
    {
      type: "THEORY", order: 1,
      question: "What is a join in DBMS? What are the different types of joins?",
      difficulty: "Easy", frequency: "High",
      companies: ["Amazon", "Microsoft", "Oracle", "Goldman Sachs"],
    },
    {
      type: "THEORY", order: 2,
      question: "What is the difference between natural join and equijoin?",
      difficulty: "Medium", frequency: "Medium",
      companies: ["Oracle", "Microsoft"],
    },
    {
      type: "THEORY", order: 3,
      question: "Explain nested loop join and hash join algorithms. When is each preferred?",
      difficulty: "Hard", frequency: "Medium",
      companies: ["DE Shaw", "Google", "Oracle"],
      interviewerNote: "Follow-up: What is the time complexity of each?",
    },
    {
      type: "THEORY", order: 4,
      question: "What is a self-join? Give a real-world example.",
      difficulty: "Medium", frequency: "High",
      companies: ["Amazon", "Goldman Sachs", "JPMorgan"],
    },
    {
      type: "MCQ", order: 5,
      question: "Which join returns only the rows that have matching values in both tables?",
      difficulty: "Easy", frequency: "High",
      companies: ["Amazon", "Oracle"],
      options: ["LEFT JOIN", "RIGHT JOIN", "INNER JOIN", "FULL OUTER JOIN"],
      correctOption: 2,
      explanation: "INNER JOIN returns only rows where there is a match in both tables. Non-matching rows from either table are excluded.",
    },
    {
      type: "MCQ", order: 6,
      question: "A CROSS JOIN produces:",
      difficulty: "Medium", frequency: "Medium",
      companies: ["Oracle", "Microsoft"],
      options: [
        "Only matching rows",
        "All rows from left table",
        "Cartesian product of both tables",
        "Only non-matching rows"
      ],
      correctOption: 2,
      explanation: "CROSS JOIN produces the Cartesian product of two tables — every row from the first table is combined with every row from the second table.",
    },
  ]);

  // ── DBMS: Query Optimization ─────────────────────────────────
  const queryOptId = await getTopicId("dbms", "query-optimization");
  await seedQuestions(queryOptId, [
    {
      type: "THEORY", order: 1,
      question: "What is query optimization in DBMS? Why is it important?",
      difficulty: "Medium", frequency: "High",
      companies: ["Amazon", "Google", "Oracle", "Goldman Sachs"],
    },
    {
      type: "THEORY", order: 2,
      question: "What is a query execution plan? How do you read EXPLAIN output in SQL?",
      difficulty: "Medium", frequency: "High",
      companies: ["Amazon", "Oracle", "Goldman Sachs"],
      interviewerNote: "Follow-up: What does a full table scan in EXPLAIN output indicate?",
    },
    {
      type: "THEORY", order: 3,
      question: "What is the role of indexes in query optimization? When does an index not help?",
      difficulty: "Medium", frequency: "High",
      companies: ["Amazon", "Google", "Oracle"],
    },
    {
      type: "THEORY", order: 4,
      question: "What is a cost-based optimizer? How does it decide which query plan to use?",
      difficulty: "Hard", frequency: "Medium",
      companies: ["Oracle", "DE Shaw"],
    },
    {
      type: "MCQ", order: 5,
      question: "Which SQL clause is evaluated first in a query?",
      difficulty: "Medium", frequency: "High",
      companies: ["Amazon", "Goldman Sachs", "Oracle"],
      options: ["SELECT", "WHERE", "FROM", "GROUP BY"],
      correctOption: 2,
      explanation: "SQL queries are logically evaluated in this order: FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY. FROM is always evaluated first.",
    },
    {
      type: "MCQ", order: 6,
      question: "What does a covering index mean?",
      difficulty: "Hard", frequency: "Medium",
      companies: ["Oracle", "DE Shaw"],
      options: [
        "An index that covers all tables",
        "An index that includes all columns needed by a query",
        "An index on the primary key",
        "An index with no duplicates"
      ],
      correctOption: 1,
      explanation: "A covering index includes all the columns needed to satisfy a query, allowing the database to retrieve data directly from the index without accessing the table.",
    },
  ]);

  // ── OOPS: Classes & Objects ──────────────────────────────────
  const classesId = await getTopicId("oops", "classes-objects");
  await seedQuestions(classesId, [
    {
      type: "THEORY", order: 1,
      question: "What is the difference between a class and an object?",
      difficulty: "Easy", frequency: "High",
      companies: ["Amazon", "Microsoft", "Adobe", "Flipkart"],
    },
    {
      type: "THEORY", order: 2,
      question: "What is a constructor? What are the types of constructors?",
      difficulty: "Easy", frequency: "High",
      companies: ["Amazon", "Microsoft", "Adobe"],
      interviewerNote: "Follow-up: What is a copy constructor? When is it called implicitly?",
    },
    {
      type: "THEORY", order: 3,
      question: "What is the difference between a class and a struct in C++?",
      difficulty: "Medium", frequency: "Medium",
      companies: ["Adobe", "DE Shaw", "Microsoft"],
    },
    {
      type: "THEORY", order: 4,
      question: "What are access modifiers? Explain public, private, and protected.",
      difficulty: "Easy", frequency: "High",
      companies: ["Amazon", "Microsoft", "Adobe", "Flipkart"],
    },
    {
      type: "MCQ", order: 5,
      question: "Which of the following is NOT a characteristic of OOP?",
      difficulty: "Easy", frequency: "High",
      companies: ["Amazon", "Microsoft"],
      options: ["Encapsulation", "Polymorphism", "Compilation", "Inheritance"],
      correctOption: 2,
      explanation: "The four pillars of OOP are Encapsulation, Abstraction, Inheritance, and Polymorphism. Compilation is not an OOP concept.",
    },
    {
      type: "MCQ", order: 6,
      question: "What is instantiation in OOP?",
      difficulty: "Easy", frequency: "Medium",
      companies: ["Amazon", "Adobe"],
      options: [
        "Defining a class",
        "Creating an object from a class",
        "Inheriting from a class",
        "Overriding a method"
      ],
      correctOption: 1,
      explanation: "Instantiation is the process of creating an instance (object) of a class. The 'new' keyword is used in most languages for instantiation.",
    },
  ]);

  // ── OOPS: Encapsulation ──────────────────────────────────────
  const encapsulationId = await getTopicId("oops", "encapsulation");
  await seedQuestions(encapsulationId, [
    {
      type: "THEORY", order: 1,
      question: "What is encapsulation in OOP? Why is it important?",
      difficulty: "Easy", frequency: "High",
      companies: ["Amazon", "Microsoft", "Adobe", "Flipkart"],
    },
    {
      type: "THEORY", order: 2,
      question: "What is the difference between encapsulation and data hiding?",
      difficulty: "Medium", frequency: "Medium",
      companies: ["Google", "Adobe", "DE Shaw"],
      interviewerNote: "Follow-up: Can you have encapsulation without data hiding?",
    },
    {
      type: "THEORY", order: 3,
      question: "What are getters and setters? Why are they preferred over public fields?",
      difficulty: "Easy", frequency: "High",
      companies: ["Amazon", "Microsoft", "Adobe"],
    },
    {
      type: "THEORY", order: 4,
      question: "How does encapsulation help in achieving loose coupling?",
      difficulty: "Medium", frequency: "Medium",
      companies: ["Google", "Atlassian", "Sprinklr"],
    },
    {
      type: "MCQ", order: 5,
      question: "Which access modifier provides the strongest encapsulation?",
      difficulty: "Easy", frequency: "High",
      companies: ["Amazon", "Microsoft"],
      options: ["public", "protected", "private", "default"],
      correctOption: 2,
      explanation: "The 'private' access modifier provides the strongest encapsulation by restricting access to only within the class itself.",
    },
    {
      type: "MCQ", order: 6,
      question: "Encapsulation is best described as:",
      difficulty: "Easy", frequency: "High",
      companies: ["Amazon", "Adobe"],
      options: [
        "Inheriting properties from parent class",
        "Bundling data and methods that operate on that data",
        "Using one interface for multiple data types",
        "Hiding implementation details through abstract classes"
      ],
      correctOption: 1,
      explanation: "Encapsulation is the bundling of data (attributes) and the methods that operate on that data into a single unit (class), while restricting direct access to some components.",
    },
  ]);

  // ── OOPS: Abstraction ────────────────────────────────────────
  const abstractionId = await getTopicId("oops", "abstraction");
  await seedQuestions(abstractionId, [
    {
      type: "THEORY", order: 1,
      question: "What is abstraction in OOP? How is it different from encapsulation?",
      difficulty: "Medium", frequency: "High",
      companies: ["Amazon", "Google", "Microsoft", "Adobe"],
      interviewerNote: "Follow-up: Give a real-world analogy for abstraction.",
    },
    {
      type: "THEORY", order: 2,
      question: "What is an abstract class? How does it differ from an interface?",
      difficulty: "Medium", frequency: "High",
      companies: ["Amazon", "Microsoft", "Google", "Adobe"],
    },
    {
      type: "THEORY", order: 3,
      question: "Can we instantiate an abstract class? Why or why not?",
      difficulty: "Easy", frequency: "High",
      companies: ["Amazon", "Microsoft", "Adobe"],
    },
    {
      type: "THEORY", order: 4,
      question: "When would you use an abstract class over an interface?",
      difficulty: "Medium", frequency: "High",
      companies: ["Google", "Amazon", "Atlassian"],
      interviewerNote: "Follow-up: What changed in Java 8 regarding interfaces?",
    },
    {
      type: "MCQ", order: 5,
      question: "An abstract class in Java:",
      difficulty: "Easy", frequency: "High",
      companies: ["Amazon", "Microsoft"],
      options: [
        "Cannot have any concrete methods",
        "Can have both abstract and concrete methods",
        "Can be instantiated directly",
        "Cannot have constructors"
      ],
      correctOption: 1,
      explanation: "An abstract class can have both abstract methods (without implementation) and concrete methods (with implementation). It cannot be instantiated directly.",
    },
    {
      type: "MCQ", order: 6,
      question: "Which keyword is used to declare an abstract method in Java?",
      difficulty: "Easy", frequency: "Medium",
      companies: ["Amazon", "Adobe"],
      options: ["virtual", "abstract", "override", "interface"],
      correctOption: 1,
      explanation: "The 'abstract' keyword is used to declare abstract methods in Java. Abstract methods have no body and must be implemented by subclasses.",
    },
  ]);

  // ── OS: Processes ────────────────────────────────────────────
  const processesId = await getTopicId("os", "processes");
  await seedQuestions(processesId, [
    {
      type: "THEORY", order: 1,
      question: "What is a process? What are the different states of a process?",
      difficulty: "Easy", frequency: "High",
      companies: ["Amazon", "Google", "Microsoft", "Flipkart"],
    },
    {
      type: "THEORY", order: 2,
      question: "What is a PCB (Process Control Block)? What information does it contain?",
      difficulty: "Medium", frequency: "Medium",
      companies: ["Google", "Amazon", "DE Shaw"],
      interviewerNote: "Follow-up: How does the OS use the PCB during context switching?",
    },
    {
      type: "THEORY", order: 3,
      question: "What is the difference between a process and a program?",
      difficulty: "Easy", frequency: "High",
      companies: ["Amazon", "Microsoft", "Flipkart"],
    },
    {
      type: "THEORY", order: 4,
      question: "What is inter-process communication (IPC)? What are the different IPC mechanisms?",
      difficulty: "Medium", frequency: "High",
      companies: ["Amazon", "Google", "Microsoft"],
      interviewerNote: "Follow-up: What is the difference between shared memory and message passing IPC?",
    },
    {
      type: "MCQ", order: 5,
      question: "Which process state indicates the process is waiting for I/O completion?",
      difficulty: "Easy", frequency: "High",
      companies: ["Amazon", "Microsoft"],
      options: ["Running", "Ready", "Waiting/Blocked", "Terminated"],
      correctOption: 2,
      explanation: "A process in the Waiting/Blocked state is waiting for some event (like I/O completion) before it can continue execution.",
    },
    {
      type: "MCQ", order: 6,
      question: "What is a zombie process?",
      difficulty: "Medium", frequency: "Medium",
      companies: ["Google", "Amazon"],
      options: [
        "A process consuming too much CPU",
        "A process that has completed but its entry still exists in the process table",
        "A process with no parent",
        "A process waiting for I/O"
      ],
      correctOption: 1,
      explanation: "A zombie process is one that has completed execution but still has an entry in the process table because its parent hasn't read its exit status yet.",
    },
  ]);

  // ── OS: Threads ──────────────────────────────────────────────
  const threadsId = await getTopicId("os", "threads");
  await seedQuestions(threadsId, [
    {
      type: "THEORY", order: 1,
      question: "What is a thread? How does it differ from a process?",
      difficulty: "Easy", frequency: "High",
      companies: ["Amazon", "Google", "Microsoft", "Flipkart"],
      interviewerNote: "Follow-up: What resources are shared between threads of the same process?",
    },
    {
      type: "THEORY", order: 2,
      question: "What are user-level threads vs kernel-level threads?",
      difficulty: "Medium", frequency: "Medium",
      companies: ["Google", "DE Shaw"],
    },
    {
      type: "THEORY", order: 3,
      question: "What is a race condition? How do you prevent it?",
      difficulty: "Medium", frequency: "High",
      companies: ["Amazon", "Google", "Microsoft", "Uber"],
      interviewerNote: "Follow-up: What is the difference between a mutex and a semaphore?",
    },
    {
      type: "THEORY", order: 4,
      question: "What is a mutex? What is a semaphore? When would you use each?",
      difficulty: "Medium", frequency: "High",
      companies: ["Amazon", "Google", "Microsoft"],
    },
    {
      type: "MCQ", order: 5,
      question: "Which of the following is NOT shared between threads of the same process?",
      difficulty: "Medium", frequency: "High",
      companies: ["Amazon", "Google"],
      options: ["Heap memory", "Code segment", "Stack", "Global variables"],
      correctOption: 2,
      explanation: "Each thread has its own stack (for local variables and function calls). Threads share heap memory, code segment, and global variables.",
    },
    {
      type: "MCQ", order: 6,
      question: "A binary semaphore is equivalent to:",
      difficulty: "Medium", frequency: "Medium",
      companies: ["Google", "DE Shaw"],
      options: ["Counting semaphore", "Mutex", "Spinlock", "Monitor"],
      correctOption: 1,
      explanation: "A binary semaphore (values 0 or 1) is functionally equivalent to a mutex, though there are subtle differences in ownership and usage patterns.",
    },
  ]);

  // ── OS: Memory Management ────────────────────────────────────
  const memoryId = await getTopicId("os", "memory-management");
  await seedQuestions(memoryId, [
    {
      type: "THEORY", order: 1,
      question: "What is memory management in OS? What are its goals?",
      difficulty: "Easy", frequency: "High",
      companies: ["Amazon", "Google", "Microsoft"],
    },
    {
      type: "THEORY", order: 2,
      question: "What is fragmentation? Explain internal vs external fragmentation.",
      difficulty: "Medium", frequency: "High",
      companies: ["Amazon", "Google", "DE Shaw"],
      interviewerNote: "Follow-up: How does compaction solve external fragmentation?",
    },
    {
      type: "THEORY", order: 3,
      question: "What is the difference between contiguous and non-contiguous memory allocation?",
      difficulty: "Medium", frequency: "Medium",
      companies: ["Google", "DE Shaw"],
    },
    {
      type: "THEORY", order: 4,
      question: "What is a memory leak? How do you detect and prevent it?",
      difficulty: "Medium", frequency: "High",
      companies: ["Amazon", "Google", "Microsoft", "Adobe"],
      interviewerNote: "Follow-up: What tools can you use to detect memory leaks?",
    },
    {
      type: "MCQ", order: 5,
      question: "Internal fragmentation occurs when:",
      difficulty: "Medium", frequency: "High",
      companies: ["Amazon", "Google"],
      options: [
        "Free memory exists but is not contiguous",
        "Allocated memory is larger than requested memory",
        "A process requests more memory than available",
        "Two processes share the same memory"
      ],
      correctOption: 1,
      explanation: "Internal fragmentation occurs when more memory is allocated to a process than it actually needs, wasting the unused portion within the allocated block.",
    },
    {
      type: "MCQ", order: 6,
      question: "Which memory allocation algorithm always allocates the smallest sufficient block?",
      difficulty: "Medium", frequency: "Medium",
      companies: ["DE Shaw", "Google"],
      options: ["First Fit", "Best Fit", "Worst Fit", "Next Fit"],
      correctOption: 1,
      explanation: "Best Fit allocates the smallest free block that is large enough for the process, minimizing wasted space within each allocated block.",
    },
  ]);

  // ── OS: Paging ───────────────────────────────────────────────
  const pagingId = await getTopicId("os", "paging");
  await seedQuestions(pagingId, [
    {
      type: "THEORY", order: 1,
      question: "What is paging in OS? How does it solve external fragmentation?",
      difficulty: "Medium", frequency: "High",
      companies: ["Amazon", "Google", "Microsoft"],
      interviewerNote: "Follow-up: What is the difference between paging and segmentation?",
    },
    {
      type: "THEORY", order: 2,
      question: "What is a page table? What information does each entry contain?",
      difficulty: "Medium", frequency: "High",
      companies: ["Google", "DE Shaw", "Amazon"],
    },
    {
      type: "THEORY", order: 3,
      question: "What is a TLB (Translation Lookaside Buffer)? How does it improve performance?",
      difficulty: "Hard", frequency: "Medium",
      companies: ["Google", "DE Shaw"],
      interviewerNote: "Follow-up: What is the TLB hit ratio and how does it affect performance?",
    },
    {
      type: "THEORY", order: 4,
      question: "What is a page fault? How does the OS handle it?",
      difficulty: "Medium", frequency: "High",
      companies: ["Amazon", "Google", "Microsoft"],
    },
    {
      type: "MCQ", order: 5,
      question: "Paging eliminates which type of fragmentation?",
      difficulty: "Easy", frequency: "High",
      companies: ["Amazon", "Google"],
      options: ["Internal fragmentation", "External fragmentation", "Both", "Neither"],
      correctOption: 1,
      explanation: "Paging eliminates external fragmentation by dividing memory into fixed-size frames. However, it may cause internal fragmentation since the last page of a process may not be completely full.",
    },
    {
      type: "MCQ", order: 6,
      question: "The TLB is used to:",
      difficulty: "Medium", frequency: "High",
      companies: ["Google", "DE Shaw"],
      options: [
        "Store page tables",
        "Speed up virtual to physical address translation",
        "Manage disk I/O",
        "Handle page faults"
      ],
      correctOption: 1,
      explanation: "The TLB (Translation Lookaside Buffer) is a cache for page table entries that speeds up virtual-to-physical address translation, reducing memory access overhead.",
    },
  ]);

  // ── OS: Virtual Memory ───────────────────────────────────────
  const virtualMemoryId = await getTopicId("os", "virtual-memory");
  await seedQuestions(virtualMemoryId, [
    {
      type: "THEORY", order: 1,
      question: "What is virtual memory? What problem does it solve?",
      difficulty: "Medium", frequency: "High",
      companies: ["Amazon", "Google", "Microsoft"],
      interviewerNote: "Follow-up: What is the difference between virtual memory and physical memory?",
    },
    {
      type: "THEORY", order: 2,
      question: "What is demand paging? How is it different from pre-paging?",
      difficulty: "Medium", frequency: "High",
      companies: ["Google", "Amazon", "DE Shaw"],
    },
    {
      type: "THEORY", order: 3,
      question: "Explain page replacement algorithms: FIFO, LRU, and Optimal.",
      difficulty: "Hard", frequency: "High",
      companies: ["Amazon", "Google", "DE Shaw"],
      interviewerNote: "Follow-up: Which algorithm gives the best performance? Is it implementable in practice?",
    },
    {
      type: "THEORY", order: 4,
      question: "What is thrashing? How can it be prevented?",
      difficulty: "Hard", frequency: "Medium",
      companies: ["Google", "Amazon", "DE Shaw"],
    },
    {
      type: "MCQ", order: 5,
      question: "Which page replacement algorithm suffers from Belady's anomaly?",
      difficulty: "Hard", frequency: "Medium",
      companies: ["DE Shaw", "Google"],
      options: ["LRU", "Optimal", "FIFO", "LFU"],
      correctOption: 2,
      explanation: "FIFO suffers from Belady's anomaly — increasing the number of frames can sometimes increase page faults. LRU and Optimal algorithms do not suffer from this.",
    },
    {
      type: "MCQ", order: 6,
      question: "Thrashing occurs when:",
      difficulty: "Medium", frequency: "High",
      companies: ["Google", "Amazon"],
      options: [
        "CPU utilization is too high",
        "The OS spends more time paging than executing processes",
        "Too many processes are terminated",
        "Physical memory is not used"
      ],
      correctOption: 1,
      explanation: "Thrashing occurs when the OS spends more time handling page faults and swapping pages than executing actual processes, causing a dramatic drop in CPU utilization.",
    },
  ]);

  // ── SQL: SELECT Queries ──────────────────────────────────────
  const selectId = await getTopicId("sql", "select-queries");
  await seedQuestions(selectId, [
    {
      type: "THEORY", order: 1,
      question: "What is the logical order of execution of a SQL SELECT statement?",
      difficulty: "Medium", frequency: "High",
      companies: ["Amazon", "Goldman Sachs", "Oracle", "JPMorgan"],
      interviewerNote: "Follow-up: Why can't you use a column alias in a WHERE clause?",
    },
    {
      type: "THEORY", order: 2,
      question: "What is the difference between WHERE and HAVING clauses?",
      difficulty: "Medium", frequency: "High",
      companies: ["Amazon", "Oracle", "Goldman Sachs"],
    },
    {
      type: "THEORY", order: 3,
      question: "What is the difference between DISTINCT and GROUP BY in SQL?",
      difficulty: "Medium", frequency: "Medium",
      companies: ["Oracle", "Goldman Sachs"],
    },
    {
      type: "THEORY", order: 4,
      question: "Write a SQL query to find the second highest salary from an Employee table.",
      difficulty: "Medium", frequency: "High",
      companies: ["Amazon", "Goldman Sachs", "JPMorgan", "Microsoft"],
      interviewerNote: "Follow-up: How would you find the Nth highest salary?",
    },
    {
      type: "MCQ", order: 5,
      question: "Which SQL clause is used to filter rows after grouping?",
      difficulty: "Easy", frequency: "High",
      companies: ["Amazon", "Oracle"],
      options: ["WHERE", "FILTER", "HAVING", "GROUP BY"],
      correctOption: 2,
      explanation: "HAVING is used to filter groups after GROUP BY aggregation. WHERE filters individual rows before grouping.",
    },
    {
      type: "MCQ", order: 6,
      question: "What does SELECT DISTINCT do?",
      difficulty: "Easy", frequency: "High",
      companies: ["Amazon", "Microsoft"],
      options: [
        "Selects all rows including duplicates",
        "Selects only unique rows",
        "Selects rows in sorted order",
        "Selects rows with NULL values"
      ],
      correctOption: 1,
      explanation: "SELECT DISTINCT removes duplicate rows from the result set, returning only unique combinations of the selected columns.",
    },
  ]);

  // ── SQL: GROUP BY & HAVING ───────────────────────────────────
  const groupById = await getTopicId("sql", "group-by-having");
  await seedQuestions(groupById, [
    {
      type: "THEORY", order: 1,
      question: "What is GROUP BY in SQL? How does it work with aggregate functions?",
      difficulty: "Easy", frequency: "High",
      companies: ["Amazon", "Goldman Sachs", "Oracle", "JPMorgan"],
    },
    {
      type: "THEORY", order: 2,
      question: "What is the difference between COUNT(*), COUNT(1), and COUNT(column)?",
      difficulty: "Medium", frequency: "High",
      companies: ["Amazon", "Goldman Sachs", "Oracle"],
      interviewerNote: "Follow-up: What does COUNT(column) do with NULL values?",
    },
    {
      type: "THEORY", order: 3,
      question: "Write a query to find departments with more than 5 employees.",
      difficulty: "Easy", frequency: "High",
      companies: ["Amazon", "Goldman Sachs", "JPMorgan"],
    },
    {
      type: "THEORY", order: 4,
      question: "Can you use GROUP BY without an aggregate function? What happens?",
      difficulty: "Medium", frequency: "Medium",
      companies: ["Oracle", "DE Shaw"],
    },
    {
      type: "MCQ", order: 5,
      question: "Which aggregate function returns the number of rows?",
      difficulty: "Easy", frequency: "High",
      companies: ["Amazon", "Oracle"],
      options: ["SUM()", "AVG()", "COUNT()", "MAX()"],
      correctOption: 2,
      explanation: "COUNT() returns the number of rows that match the specified criteria. COUNT(*) counts all rows while COUNT(column) counts non-NULL values.",
    },
    {
      type: "MCQ", order: 6,
      question: "In which order are WHERE and HAVING evaluated?",
      difficulty: "Medium", frequency: "High",
      companies: ["Goldman Sachs", "Oracle"],
      options: [
        "HAVING is evaluated before WHERE",
        "WHERE is evaluated before HAVING",
        "They are evaluated simultaneously",
        "Order depends on the query"
      ],
      correctOption: 1,
      explanation: "WHERE is evaluated before GROUP BY and HAVING. WHERE filters individual rows, then GROUP BY groups them, then HAVING filters the groups.",
    },
  ]);

  // ── SQL: Subqueries ──────────────────────────────────────────
  const subqueriesId = await getTopicId("sql", "subqueries");
  await seedQuestions(subqueriesId, [
    {
      type: "THEORY", order: 1,
      question: "What is a subquery in SQL? What are the types of subqueries?",
      difficulty: "Medium", frequency: "High",
      companies: ["Amazon", "Goldman Sachs", "Oracle", "JPMorgan"],
    },
    {
      type: "THEORY", order: 2,
      question: "What is the difference between a correlated and non-correlated subquery?",
      difficulty: "Hard", frequency: "High",
      companies: ["Goldman Sachs", "DE Shaw", "Oracle"],
      interviewerNote: "Follow-up: Which is generally slower and why?",
    },
    {
      type: "THEORY", order: 3,
      question: "What is the difference between IN, EXISTS, and JOIN for subqueries? When is each preferred?",
      difficulty: "Hard", frequency: "High",
      companies: ["Amazon", "Goldman Sachs", "Oracle"],
    },
    {
      type: "THEORY", order: 4,
      question: "Write a query to find employees who earn more than the average salary.",
      difficulty: "Easy", frequency: "High",
      companies: ["Amazon", "Goldman Sachs", "JPMorgan", "Microsoft"],
    },
    {
      type: "MCQ", order: 5,
      question: "A correlated subquery:",
      difficulty: "Hard", frequency: "High",
      companies: ["Goldman Sachs", "DE Shaw"],
      options: [
        "Executes once for the entire query",
        "Executes once for each row of the outer query",
        "Cannot reference the outer query",
        "Always returns a single value"
      ],
      correctOption: 1,
      explanation: "A correlated subquery references columns from the outer query and is executed once for each row processed by the outer query, making it potentially slower than non-correlated subqueries.",
    },
    {
      type: "MCQ", order: 6,
      question: "Which operator checks if a subquery returns any rows?",
      difficulty: "Medium", frequency: "High",
      companies: ["Oracle", "Goldman Sachs"],
      options: ["IN", "ANY", "EXISTS", "ALL"],
      correctOption: 2,
      explanation: "EXISTS returns TRUE if the subquery returns at least one row. It's often more efficient than IN for large datasets because it stops as soon as it finds a match.",
    },
  ]);

  // ── SQL: Indexes & Performance ───────────────────────────────
  const sqlIndexesId = await getTopicId("sql", "indexes-performance");
  await seedQuestions(sqlIndexesId, [
    {
      type: "THEORY", order: 1,
      question: "What is a SQL index? How does it improve query performance?",
      difficulty: "Easy", frequency: "High",
      companies: ["Amazon", "Goldman Sachs", "Oracle", "JPMorgan"],
    },
    {
      type: "THEORY", order: 2,
      question: "What are the disadvantages of creating too many indexes?",
      difficulty: "Medium", frequency: "High",
      companies: ["Amazon", "Oracle", "Goldman Sachs"],
      interviewerNote: "Follow-up: How do you decide which columns to index?",
    },
    {
      type: "THEORY", order: 3,
      question: "What is a composite index? What is the left prefix rule?",
      difficulty: "Hard", frequency: "High",
      companies: ["Amazon", "Goldman Sachs", "DE Shaw"],
      interviewerNote: "Follow-up: If you have an index on (A, B, C), which queries will use it?",
    },
    {
      type: "THEORY", order: 4,
      question: "What is query optimization? What is an execution plan?",
      difficulty: "Medium", frequency: "High",
      companies: ["Oracle", "Goldman Sachs", "Amazon"],
    },
    {
      type: "MCQ", order: 5,
      question: "Which operation is most improved by database indexing?",
      difficulty: "Easy", frequency: "High",
      companies: ["Amazon", "Oracle"],
      options: ["INSERT", "UPDATE", "DELETE", "SELECT with WHERE"],
      correctOption: 3,
      explanation: "Indexes primarily improve SELECT query performance, especially with WHERE, JOIN, and ORDER BY clauses. However, they slow down INSERT, UPDATE, and DELETE operations.",
    },
    {
      type: "MCQ", order: 6,
      question: "A unique index:",
      difficulty: "Medium", frequency: "Medium",
      companies: ["Oracle", "Goldman Sachs"],
      options: [
        "Speeds up queries but allows duplicates",
        "Ensures no duplicate values in the indexed column",
        "Only works on primary keys",
        "Cannot be used with NULL values"
      ],
      correctOption: 1,
      explanation: "A unique index ensures that no two rows in the table have the same value for the indexed column(s), while also improving query performance.",
    },
  ]);

  console.log("🎉 All missing questions seeded!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());