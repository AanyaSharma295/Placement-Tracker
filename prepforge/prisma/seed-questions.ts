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
}

async function main() {
  console.log("🌱 Seeding subject questions...");

  // ── DBMS: Transactions ──────────────────────────────────────
  const transactionsId = await getTopicId("dbms", "transactions");
  await seedQuestions(transactionsId, [
    {
      type: "THEORY", order: 1,
      question: "What is a database transaction? Explain with an example.",
      difficulty: "Easy", frequency: "High",
      companies: ["Amazon", "Microsoft", "Oracle", "Goldman Sachs"],
      interviewerNote: "Follow-up: What happens if a transaction fails midway?",
    },
    {
      type: "THEORY", order: 2,
      question: "Explain the ACID properties of a transaction in detail.",
      difficulty: "Medium", frequency: "High",
      companies: ["Amazon", "Google", "Microsoft", "Goldman Sachs", "Oracle"],
      interviewerNote: "Follow-up: Which ACID property is hardest to achieve in distributed systems?",
    },
    {
      type: "THEORY", order: 3,
      question: "What is the difference between a commit and a rollback?",
      difficulty: "Easy", frequency: "High",
      companies: ["Microsoft", "Adobe", "Flipkart"],
    },
    {
      type: "THEORY", order: 4,
      question: "What is serializability? Differentiate between conflict and view serializability.",
      difficulty: "Hard", frequency: "Medium",
      companies: ["DE Shaw", "Arcesium", "Oracle"],
      interviewerNote: "Follow-up: Is every conflict serializable schedule view serializable?",
    },
    {
      type: "THEORY", order: 5,
      question: "Explain two-phase locking (2PL) protocol. What are its advantages and disadvantages?",
      difficulty: "Hard", frequency: "Medium",
      companies: ["DE Shaw", "Goldman Sachs", "Morgan Stanley"],
    },
    {
      type: "THEORY", order: 6,
      question: "What is a savepoint in a transaction? How is it different from a full rollback?",
      difficulty: "Easy", frequency: "Medium",
      companies: ["Oracle", "Microsoft"],
    },
    {
      type: "THEORY", order: 7,
      question: "What are dirty reads, phantom reads, and non-repeatable reads?",
      difficulty: "Medium", frequency: "High",
      companies: ["Amazon", "Google", "Oracle", "JPMorgan"],
      interviewerNote: "Follow-up: Which isolation level prevents each of these?",
    },
    {
      type: "MCQ", order: 8,
      question: "Which ACID property ensures that a committed transaction's changes are permanent even after a system crash?",
      difficulty: "Easy", frequency: "High",
      companies: ["Amazon", "Microsoft", "Oracle"],
      options: ["Atomicity", "Consistency", "Isolation", "Durability"],
      correctOption: 3,
      explanation: "Durability ensures that once a transaction is committed, its changes are permanently saved even in the event of a system failure.",
    },
    {
      type: "MCQ", order: 9,
      question: "What does Atomicity in ACID mean?",
      difficulty: "Easy", frequency: "High",
      companies: ["Microsoft", "Flipkart"],
      options: ["All operations complete or none do", "Data remains consistent", "Transactions are isolated", "Changes are permanent"],
      correctOption: 0,
      explanation: "Atomicity means a transaction is treated as a single unit — either all operations succeed or none are applied.",
    },
    {
      type: "MCQ", order: 10,
      question: "Which isolation level prevents dirty reads but allows non-repeatable reads?",
      difficulty: "Medium", frequency: "Medium",
      companies: ["Oracle", "Goldman Sachs"],
      options: ["Read Uncommitted", "Read Committed", "Repeatable Read", "Serializable"],
      correctOption: 1,
      explanation: "Read Committed prevents dirty reads by only reading committed data, but does not prevent non-repeatable reads.",
    },
    {
      type: "MCQ", order: 11,
      question: "In two-phase locking, which phase allows releasing locks?",
      difficulty: "Medium", frequency: "Medium",
      companies: ["DE Shaw", "Arcesium"],
      options: ["Growing phase", "Shrinking phase", "Commit phase", "Rollback phase"],
      correctOption: 1,
      explanation: "In 2PL, the shrinking phase begins when a transaction releases its first lock and no new locks can be acquired after this point.",
    },
  ]);

  // ── DBMS: ACID Properties ────────────────────────────────────
  const acidId = await getTopicId("dbms", "acid-properties");
  await seedQuestions(acidId, [
    {
      type: "THEORY", order: 1,
      question: "Explain each ACID property with a real-world banking example.",
      difficulty: "Medium", frequency: "High",
      companies: ["Goldman Sachs", "JPMorgan", "Morgan Stanley", "Amazon"],
      interviewerNote: "Follow-up: How does a bank transfer demonstrate all four ACID properties?",
    },
    {
      type: "THEORY", order: 2,
      question: "How does a DBMS ensure atomicity? What mechanisms are used?",
      difficulty: "Medium", frequency: "Medium",
      companies: ["Oracle", "Microsoft", "DE Shaw"],
    },
    {
      type: "THEORY", order: 3,
      question: "What is the difference between consistency in ACID and consistency in CAP theorem?",
      difficulty: "Hard", frequency: "Medium",
      companies: ["Google", "Amazon", "DE Shaw"],
      interviewerNote: "Follow-up: Can a distributed database achieve both?",
    },
    {
      type: "THEORY", order: 4,
      question: "How is isolation implemented in modern databases? Explain isolation levels.",
      difficulty: "Hard", frequency: "High",
      companies: ["Oracle", "Goldman Sachs", "Amazon"],
    },
    {
      type: "THEORY", order: 5,
      question: "What is a write-ahead log (WAL) and how does it help achieve durability?",
      difficulty: "Hard", frequency: "Medium",
      companies: ["Google", "DE Shaw", "Arcesium"],
      interviewerNote: "Follow-up: What is the difference between WAL and shadow paging?",
    },
    {
      type: "MCQ", order: 6,
      question: "Which ACID property ensures that a transaction brings the database from one valid state to another?",
      difficulty: "Easy", frequency: "High",
      companies: ["Amazon", "Microsoft"],
      options: ["Atomicity", "Consistency", "Isolation", "Durability"],
      correctOption: 1,
      explanation: "Consistency ensures that any transaction will bring the database from one valid state to another, maintaining all predefined rules and constraints.",
    },
    {
      type: "MCQ", order: 7,
      question: "What anomaly occurs when a transaction reads data written by an uncommitted transaction?",
      difficulty: "Medium", frequency: "High",
      companies: ["Oracle", "Goldman Sachs", "JPMorgan"],
      options: ["Phantom read", "Non-repeatable read", "Dirty read", "Lost update"],
      correctOption: 2,
      explanation: "A dirty read occurs when a transaction reads data that has been modified by another transaction that has not yet committed.",
    },
    {
      type: "MCQ", order: 8,
      question: "Which isolation level provides the highest degree of isolation?",
      difficulty: "Easy", frequency: "Medium",
      companies: ["Microsoft", "Oracle"],
      options: ["Read Uncommitted", "Read Committed", "Repeatable Read", "Serializable"],
      correctOption: 3,
      explanation: "Serializable is the highest isolation level, ensuring complete isolation from other transactions by executing transactions as if they were serial.",
    },
  ]);

  // ── DBMS: Normalization ──────────────────────────────────────
  const normalizationId = await getTopicId("dbms", "normalization");
  await seedQuestions(normalizationId, [
    {
      type: "THEORY", order: 1,
      question: "What is database normalization? Why is it important?",
      difficulty: "Easy", frequency: "High",
      companies: ["Amazon", "Microsoft", "Oracle", "Flipkart"],
    },
    {
      type: "THEORY", order: 2,
      question: "Explain 1NF, 2NF, and 3NF with examples.",
      difficulty: "Medium", frequency: "High",
      companies: ["Amazon", "Google", "Microsoft", "Oracle"],
      interviewerNote: "Follow-up: Give an example of a table that is in 2NF but not 3NF.",
    },
    {
      type: "THEORY", order: 3,
      question: "What is BCNF? How does it differ from 3NF?",
      difficulty: "Hard", frequency: "Medium",
      companies: ["DE Shaw", "Arcesium", "Oracle"],
    },
    {
      type: "THEORY", order: 4,
      question: "What are the anomalies that normalization aims to eliminate?",
      difficulty: "Medium", frequency: "High",
      companies: ["Amazon", "Microsoft", "Flipkart"],
      interviewerNote: "Follow-up: Give examples of insertion, deletion, and update anomalies.",
    },
    {
      type: "THEORY", order: 5,
      question: "When would you choose to denormalize a database? What are the tradeoffs?",
      difficulty: "Hard", frequency: "Medium",
      companies: ["Amazon", "Google", "Uber", "Zomato"],
    },
    {
      type: "MCQ", order: 6,
      question: "A relation is in 2NF if it is in 1NF and:",
      difficulty: "Medium", frequency: "High",
      companies: ["Oracle", "Microsoft"],
      options: [
        "Has no transitive dependencies",
        "Has no partial dependencies on the primary key",
        "Has no multi-valued dependencies",
        "All attributes are atomic"
      ],
      correctOption: 1,
      explanation: "2NF eliminates partial dependencies — every non-prime attribute must be fully functionally dependent on the entire primary key.",
    },
    {
      type: "MCQ", order: 7,
      question: "Which normal form deals with multi-valued dependencies?",
      difficulty: "Hard", frequency: "Low",
      companies: ["DE Shaw"],
      options: ["2NF", "3NF", "BCNF", "4NF"],
      correctOption: 3,
      explanation: "4NF deals with multi-valued dependencies. A relation is in 4NF if it has no non-trivial multi-valued dependencies.",
    },
  ]);

  // ── DBMS: Indexing ───────────────────────────────────────────
  const indexingId = await getTopicId("dbms", "indexing");
  await seedQuestions(indexingId, [
    {
      type: "THEORY", order: 1,
      question: "What is an index in a database? How does it improve query performance?",
      difficulty: "Easy", frequency: "High",
      companies: ["Amazon", "Google", "Microsoft", "Oracle", "Goldman Sachs"],
    },
    {
      type: "THEORY", order: 2,
      question: "What is the difference between clustered and non-clustered indexes?",
      difficulty: "Medium", frequency: "High",
      companies: ["Microsoft", "Oracle", "Amazon"],
      interviewerNote: "Follow-up: Can a table have multiple clustered indexes?",
    },
    {
      type: "THEORY", order: 3,
      question: "Explain B-Tree and B+ Tree indexes. Why are B+ Trees preferred in databases?",
      difficulty: "Hard", frequency: "High",
      companies: ["Google", "DE Shaw", "Arcesium", "Oracle"],
    },
    {
      type: "THEORY", order: 4,
      question: "What is a composite index? When should you use one?",
      difficulty: "Medium", frequency: "Medium",
      companies: ["Amazon", "Flipkart", "Razorpay"],
    },
    {
      type: "THEORY", order: 5,
      question: "What are the disadvantages of over-indexing a table?",
      difficulty: "Medium", frequency: "Medium",
      companies: ["Amazon", "Google", "Oracle"],
      interviewerNote: "Follow-up: How do you decide which columns to index?",
    },
    {
      type: "MCQ", order: 6,
      question: "Which data structure is most commonly used to implement database indexes?",
      difficulty: "Medium", frequency: "High",
      companies: ["Oracle", "Google", "DE Shaw"],
      options: ["Hash Table", "B+ Tree", "AVL Tree", "Red-Black Tree"],
      correctOption: 1,
      explanation: "B+ Trees are the most common index structure because they maintain sorted data, support range queries efficiently, and have O(log n) search complexity.",
    },
    {
      type: "MCQ", order: 7,
      question: "A clustered index:",
      difficulty: "Medium", frequency: "High",
      companies: ["Microsoft", "Amazon"],
      options: [
        "Creates a separate structure for index data",
        "Physically orders the table data based on the index key",
        "Can have multiple instances per table",
        "Only works on string columns"
      ],
      correctOption: 1,
      explanation: "A clustered index physically reorders the table rows to match the index. Because of this, only one clustered index can exist per table.",
    },
  ]);

  // ── OOPS: Inheritance ────────────────────────────────────────
  const inheritanceId = await getTopicId("oops", "inheritance");
  await seedQuestions(inheritanceId, [
    {
      type: "THEORY", order: 1,
      question: "What is inheritance in OOP? What are its types?",
      difficulty: "Easy", frequency: "High",
      companies: ["Amazon", "Microsoft", "Adobe", "Flipkart"],
    },
    {
      type: "THEORY", order: 2,
      question: "What is the difference between single, multiple, and multilevel inheritance?",
      difficulty: "Medium", frequency: "High",
      companies: ["Amazon", "Google", "Microsoft"],
      interviewerNote: "Follow-up: Why does Java not support multiple inheritance with classes?",
    },
    {
      type: "THEORY", order: 3,
      question: "What is the diamond problem in inheritance? How is it solved?",
      difficulty: "Hard", frequency: "High",
      companies: ["Google", "Amazon", "DE Shaw"],
      interviewerNote: "Follow-up: How does Python's MRO solve the diamond problem?",
    },
    {
      type: "THEORY", order: 4,
      question: "What is method overriding? How does it differ from method overloading?",
      difficulty: "Easy", frequency: "High",
      companies: ["Amazon", "Microsoft", "Adobe", "Sprinklr"],
    },
    {
      type: "THEORY", order: 5,
      question: "What is the Liskov Substitution Principle and how does it relate to inheritance?",
      difficulty: "Hard", frequency: "Medium",
      companies: ["Google", "DE Shaw", "Arcesium"],
    },
    {
      type: "MCQ", order: 6,
      question: "Which keyword is used in Java to inherit a class?",
      difficulty: "Easy", frequency: "High",
      companies: ["Amazon", "Microsoft", "Adobe"],
      options: ["implements", "extends", "inherits", "super"],
      correctOption: 1,
      explanation: "In Java, the 'extends' keyword is used to inherit from a class, while 'implements' is used for interfaces.",
    },
    {
      type: "MCQ", order: 7,
      question: "The diamond problem in multiple inheritance occurs when:",
      difficulty: "Medium", frequency: "High",
      companies: ["Google", "Amazon"],
      options: [
        "A class inherits from two classes that have a common ancestor",
        "A class has too many methods",
        "Two interfaces have the same method signature",
        "A class inherits from itself"
      ],
      correctOption: 0,
      explanation: "The diamond problem occurs when a class inherits from two classes that both inherit from a common base class, creating ambiguity about which version of the base class methods to use.",
    },
  ]);

  // ── OOPS: Polymorphism ───────────────────────────────────────
  const polymorphismId = await getTopicId("oops", "polymorphism");
  await seedQuestions(polymorphismId, [
    {
      type: "THEORY", order: 1,
      question: "What is polymorphism? Explain compile-time vs runtime polymorphism.",
      difficulty: "Medium", frequency: "High",
      companies: ["Amazon", "Google", "Microsoft", "Adobe"],
      interviewerNote: "Follow-up: Give a real-world example of each type.",
    },
    {
      type: "THEORY", order: 2,
      question: "How does method overloading achieve compile-time polymorphism?",
      difficulty: "Easy", frequency: "High",
      companies: ["Amazon", "Microsoft", "Flipkart"],
    },
    {
      type: "THEORY", order: 3,
      question: "What is dynamic dispatch? How does it work internally using vtables?",
      difficulty: "Hard", frequency: "Medium",
      companies: ["Google", "DE Shaw", "Arcesium"],
      interviewerNote: "Follow-up: What is the overhead of virtual function calls?",
    },
    {
      type: "THEORY", order: 4,
      question: "What is operator overloading? Give examples of when it is useful.",
      difficulty: "Medium", frequency: "Medium",
      companies: ["Adobe", "Microsoft"],
    },
    {
      type: "MCQ", order: 5,
      question: "Which type of polymorphism is achieved through method overriding?",
      difficulty: "Easy", frequency: "High",
      companies: ["Amazon", "Adobe"],
      options: ["Compile-time polymorphism", "Runtime polymorphism", "Static polymorphism", "Template polymorphism"],
      correctOption: 1,
      explanation: "Method overriding achieves runtime (dynamic) polymorphism because the method to be called is determined at runtime based on the actual object type.",
    },
    {
      type: "MCQ", order: 6,
      question: "What is a virtual function in C++?",
      difficulty: "Medium", frequency: "High",
      companies: ["Google", "DE Shaw", "Adobe"],
      options: [
        "A function that cannot be overridden",
        "A function declared with the virtual keyword that enables runtime polymorphism",
        "A function without a body",
        "A static class function"
      ],
      correctOption: 1,
      explanation: "A virtual function is declared with the 'virtual' keyword and allows derived classes to override it. The correct function is called at runtime based on the object's actual type.",
    },
  ]);

  // ── OOPS: SOLID Principles ───────────────────────────────────
  const solidId = await getTopicId("oops", "solid-principles");
  await seedQuestions(solidId, [
    {
      type: "THEORY", order: 1,
      question: "What are the SOLID principles? Explain each briefly.",
      difficulty: "Medium", frequency: "High",
      companies: ["Amazon", "Google", "Microsoft", "Atlassian", "Sprinklr"],
      interviewerNote: "Follow-up: Which SOLID principle do you find hardest to implement in practice?",
    },
    {
      type: "THEORY", order: 2,
      question: "Explain the Single Responsibility Principle with a code example.",
      difficulty: "Medium", frequency: "High",
      companies: ["Amazon", "Google", "Atlassian"],
    },
    {
      type: "THEORY", order: 3,
      question: "What is the Open/Closed Principle? How does it help with maintainability?",
      difficulty: "Medium", frequency: "Medium",
      companies: ["Google", "Microsoft", "Sprinklr"],
    },
    {
      type: "THEORY", order: 4,
      question: "Explain the Dependency Inversion Principle. How does it relate to dependency injection?",
      difficulty: "Hard", frequency: "Medium",
      companies: ["Google", "Amazon", "Atlassian"],
      interviewerNote: "Follow-up: How do frameworks like Spring implement dependency injection?",
    },
    {
      type: "MCQ", order: 5,
      question: "The 'O' in SOLID stands for:",
      difficulty: "Easy", frequency: "High",
      companies: ["Amazon", "Microsoft"],
      options: ["Object Principle", "Open/Closed Principle", "Overriding Principle", "Ownership Principle"],
      correctOption: 1,
      explanation: "The Open/Closed Principle states that software entities should be open for extension but closed for modification.",
    },
    {
      type: "MCQ", order: 6,
      question: "Which SOLID principle states that a class should have only one reason to change?",
      difficulty: "Easy", frequency: "High",
      companies: ["Amazon", "Google", "Atlassian"],
      options: ["Open/Closed", "Liskov Substitution", "Single Responsibility", "Interface Segregation"],
      correctOption: 2,
      explanation: "The Single Responsibility Principle (SRP) states that a class should have only one reason to change, meaning it should have only one job or responsibility.",
    },
  ]);

  // ── OS: Deadlocks ────────────────────────────────────────────
  const deadlocksId = await getTopicId("os", "deadlocks");
  await seedQuestions(deadlocksId, [
    {
      type: "THEORY", order: 1,
      question: "What is a deadlock? What are the four necessary conditions for a deadlock to occur?",
      difficulty: "Medium", frequency: "High",
      companies: ["Amazon", "Google", "Microsoft", "Flipkart"],
      interviewerNote: "Follow-up: If you remove one condition, can deadlock still occur?",
    },
    {
      type: "THEORY", order: 2,
      question: "Explain the Banker's Algorithm for deadlock avoidance.",
      difficulty: "Hard", frequency: "Medium",
      companies: ["DE Shaw", "Arcesium", "Google"],
    },
    {
      type: "THEORY", order: 3,
      question: "What is the difference between deadlock prevention, avoidance, and detection?",
      difficulty: "Medium", frequency: "High",
      companies: ["Amazon", "Microsoft", "Oracle"],
    },
    {
      type: "THEORY", order: 4,
      question: "How does a resource allocation graph help in detecting deadlocks?",
      difficulty: "Medium", frequency: "Medium",
      companies: ["Google", "DE Shaw"],
    },
    {
      type: "THEORY", order: 5,
      question: "What is livelock? How does it differ from deadlock?",
      difficulty: "Medium", frequency: "Medium",
      companies: ["Amazon", "Google"],
      interviewerNote: "Follow-up: Give a real-world analogy for livelock.",
    },
    {
      type: "MCQ", order: 6,
      question: "Which of the following is NOT a necessary condition for deadlock?",
      difficulty: "Medium", frequency: "High",
      companies: ["Amazon", "Microsoft", "Flipkart"],
      options: ["Mutual Exclusion", "Hold and Wait", "Preemption", "Circular Wait"],
      correctOption: 2,
      explanation: "The four necessary conditions for deadlock are Mutual Exclusion, Hold and Wait, No Preemption, and Circular Wait. Preemption itself is NOT a condition — No Preemption is.",
    },
    {
      type: "MCQ", order: 7,
      question: "The Banker's Algorithm is used for:",
      difficulty: "Medium", frequency: "Medium",
      companies: ["DE Shaw", "Google"],
      options: ["Deadlock detection", "Deadlock prevention", "Deadlock avoidance", "Deadlock recovery"],
      correctOption: 2,
      explanation: "The Banker's Algorithm is a deadlock avoidance algorithm that ensures the system never enters an unsafe state by carefully allocating resources.",
    },
  ]);

  // ── OS: Scheduling ───────────────────────────────────────────
  const schedulingId = await getTopicId("os", "scheduling");
  await seedQuestions(schedulingId, [
    {
      type: "THEORY", order: 1,
      question: "What is CPU scheduling? Why is it important in an operating system?",
      difficulty: "Easy", frequency: "High",
      companies: ["Amazon", "Google", "Microsoft", "Flipkart"],
    },
    {
      type: "THEORY", order: 2,
      question: "Explain FCFS, SJF, Round Robin, and Priority scheduling algorithms.",
      difficulty: "Medium", frequency: "High",
      companies: ["Amazon", "Microsoft", "Google"],
      interviewerNote: "Follow-up: Which algorithm has the minimum average waiting time?",
    },
    {
      type: "THEORY", order: 3,
      question: "What is the difference between preemptive and non-preemptive scheduling?",
      difficulty: "Easy", frequency: "High",
      companies: ["Amazon", "Microsoft", "Flipkart"],
    },
    {
      type: "THEORY", order: 4,
      question: "What is starvation? How does aging solve it?",
      difficulty: "Medium", frequency: "Medium",
      companies: ["Amazon", "Google"],
      interviewerNote: "Follow-up: Which scheduling algorithm can cause starvation?",
    },
    {
      type: "MCQ", order: 5,
      question: "Which scheduling algorithm gives minimum average waiting time for a given set of processes?",
      difficulty: "Medium", frequency: "High",
      companies: ["Amazon", "Microsoft"],
      options: ["FCFS", "Round Robin", "SJF", "Priority Scheduling"],
      correctOption: 2,
      explanation: "Shortest Job First (SJF) gives the minimum average waiting time for a given set of processes as it always picks the shortest available process next.",
    },
    {
      type: "MCQ", order: 6,
      question: "Round Robin scheduling is best suited for:",
      difficulty: "Easy", frequency: "High",
      companies: ["Amazon", "Flipkart"],
      options: ["Batch systems", "Real-time systems", "Time-sharing systems", "Single-process systems"],
      correctOption: 2,
      explanation: "Round Robin is best suited for time-sharing systems as it gives each process an equal share of CPU time, ensuring fair allocation.",
    },
  ]);

  // ── CN: TCP/IP ───────────────────────────────────────────────
  const tcpipId = await getTopicId("cn", "tcp-ip");
  await seedQuestions(tcpipId, [
    {
      type: "THEORY", order: 1,
      question: "Explain the TCP three-way handshake process.",
      difficulty: "Medium", frequency: "High",
      companies: ["Amazon", "Google", "Microsoft", "Uber"],
      interviewerNote: "Follow-up: What happens during TCP connection termination (four-way handshake)?",
    },
    {
      type: "THEORY", order: 2,
      question: "What is the difference between TCP and UDP? When would you use each?",
      difficulty: "Easy", frequency: "High",
      companies: ["Amazon", "Google", "Microsoft", "Uber", "Zomato"],
    },
    {
      type: "THEORY", order: 3,
      question: "What is flow control in TCP? Explain the sliding window protocol.",
      difficulty: "Hard", frequency: "Medium",
      companies: ["Google", "DE Shaw"],
    },
    {
      type: "THEORY", order: 4,
      question: "What is TCP congestion control? Explain slow start and congestion avoidance.",
      difficulty: "Hard", frequency: "Medium",
      companies: ["Google", "Amazon", "DE Shaw"],
    },
    {
      type: "MCQ", order: 5,
      question: "How many packets are exchanged in a TCP three-way handshake?",
      difficulty: "Easy", frequency: "High",
      companies: ["Amazon", "Microsoft"],
      options: ["2", "3", "4", "5"],
      correctOption: 1,
      explanation: "TCP three-way handshake involves 3 packets: SYN (client→server), SYN-ACK (server→client), and ACK (client→server).",
    },
    {
      type: "MCQ", order: 6,
      question: "Which protocol provides reliable, ordered, and error-checked delivery?",
      difficulty: "Easy", frequency: "High",
      companies: ["Amazon", "Google", "Uber"],
      options: ["UDP", "ICMP", "TCP", "ARP"],
      correctOption: 2,
      explanation: "TCP provides reliable, ordered, and error-checked delivery of data between applications. UDP is faster but does not guarantee delivery or ordering.",
    },
  ]);

  // ── CN: OSI Model ────────────────────────────────────────────
  const osiId = await getTopicId("cn", "osi-model");
  await seedQuestions(osiId, [
    {
      type: "THEORY", order: 1,
      question: "Explain all 7 layers of the OSI model with their functions.",
      difficulty: "Medium", frequency: "High",
      companies: ["Amazon", "Google", "Microsoft", "Oracle"],
      interviewerNote: "Follow-up: At which layer does HTTP operate?",
    },
    {
      type: "THEORY", order: 2,
      question: "What is the difference between the OSI model and the TCP/IP model?",
      difficulty: "Medium", frequency: "High",
      companies: ["Amazon", "Microsoft", "Uber"],
    },
    {
      type: "THEORY", order: 3,
      question: "What happens at the transport layer? What protocols operate here?",
      difficulty: "Medium", frequency: "Medium",
      companies: ["Google", "Amazon"],
    },
    {
      type: "MCQ", order: 4,
      question: "At which OSI layer does a router operate?",
      difficulty: "Easy", frequency: "High",
      companies: ["Amazon", "Oracle", "Microsoft"],
      options: ["Layer 1 - Physical", "Layer 2 - Data Link", "Layer 3 - Network", "Layer 4 - Transport"],
      correctOption: 2,
      explanation: "Routers operate at Layer 3 (Network layer) and use IP addresses to forward packets between different networks.",
    },
    {
      type: "MCQ", order: 5,
      question: "Which layer of the OSI model is responsible for end-to-end communication and error recovery?",
      difficulty: "Medium", frequency: "High",
      companies: ["Amazon", "Google"],
      options: ["Network Layer", "Data Link Layer", "Transport Layer", "Session Layer"],
      correctOption: 2,
      explanation: "The Transport layer (Layer 4) is responsible for end-to-end communication, error recovery, and flow control. TCP and UDP operate at this layer.",
    },
  ]);

  // ── SQL: JOINS ───────────────────────────────────────────────
  const joinsId = await getTopicId("sql", "joins-sql");
  await seedQuestions(joinsId, [
    {
      type: "THEORY", order: 1,
      question: "Explain all types of SQL JOINs with examples.",
      difficulty: "Medium", frequency: "High",
      companies: ["Amazon", "Microsoft", "Oracle", "Goldman Sachs", "JPMorgan"],
      interviewerNote: "Follow-up: What is the difference between INNER JOIN and OUTER JOIN?",
    },
    {
      type: "THEORY", order: 2,
      question: "What is a CROSS JOIN? When would you use it?",
      difficulty: "Medium", frequency: "Medium",
      companies: ["Oracle", "Microsoft"],
    },
    {
      type: "THEORY", order: 3,
      question: "What is a self-join? Write a query to find employees who earn more than their manager.",
      difficulty: "Hard", frequency: "High",
      companies: ["Amazon", "Goldman Sachs", "JPMorgan", "DE Shaw"],
      interviewerNote: "Follow-up: Can a self-join cause performance issues on large tables?",
    },
    {
      type: "THEORY", order: 4,
      question: "What is the difference between WHERE and ON clause in a JOIN?",
      difficulty: "Medium", frequency: "High",
      companies: ["Oracle", "Microsoft", "Amazon"],
    },
    {
      type: "MCQ", order: 5,
      question: "Which JOIN returns all rows from both tables, with NULLs where there is no match?",
      difficulty: "Medium", frequency: "High",
      companies: ["Oracle", "Goldman Sachs"],
      options: ["INNER JOIN", "LEFT JOIN", "RIGHT JOIN", "FULL OUTER JOIN"],
      correctOption: 3,
      explanation: "FULL OUTER JOIN returns all rows from both tables. Where there is no match, NULL values are filled in for the columns from the table without a match.",
    },
    {
      type: "MCQ", order: 6,
      question: "What does a LEFT JOIN return?",
      difficulty: "Easy", frequency: "High",
      companies: ["Amazon", "Microsoft", "JPMorgan"],
      options: [
        "Only matching rows from both tables",
        "All rows from the left table and matching rows from the right table",
        "All rows from the right table and matching rows from the left table",
        "All rows from both tables"
      ],
      correctOption: 1,
      explanation: "LEFT JOIN returns all rows from the left table and the matched rows from the right table. If there is no match, NULL values are returned for columns from the right table.",
    },
  ]);

  // ── SQL: Window Functions ────────────────────────────────────
  const windowId = await getTopicId("sql", "window-functions");
  await seedQuestions(windowId, [
    {
      type: "THEORY", order: 1,
      question: "What are window functions in SQL? How are they different from aggregate functions?",
      difficulty: "Medium", frequency: "High",
      companies: ["Goldman Sachs", "JPMorgan", "Morgan Stanley", "Amazon"],
      interviewerNote: "Follow-up: Can you use a window function in a WHERE clause?",
    },
    {
      type: "THEORY", order: 2,
      question: "Explain ROW_NUMBER(), RANK(), and DENSE_RANK() with examples.",
      difficulty: "Medium", frequency: "High",
      companies: ["Goldman Sachs", "Amazon", "Oracle", "DE Shaw"],
    },
    {
      type: "THEORY", order: 3,
      question: "Write a query to find the second highest salary in each department using window functions.",
      difficulty: "Hard", frequency: "High",
      companies: ["Amazon", "Goldman Sachs", "JPMorgan", "Microsoft"],
      interviewerNote: "Follow-up: How would you solve this without window functions?",
    },
    {
      type: "MCQ", order: 4,
      question: "What is the difference between RANK() and DENSE_RANK()?",
      difficulty: "Medium", frequency: "High",
      companies: ["Goldman Sachs", "Oracle"],
      options: [
        "RANK() skips numbers after ties, DENSE_RANK() does not",
        "DENSE_RANK() skips numbers after ties, RANK() does not",
        "They are identical",
        "RANK() only works with integers"
      ],
      correctOption: 0,
      explanation: "RANK() assigns the same rank to tied rows but skips the next rank(s). DENSE_RANK() also assigns the same rank to tied rows but does NOT skip ranks.",
    },
    {
      type: "MCQ", order: 5,
      question: "The OVER() clause in a window function is used to:",
      difficulty: "Medium", frequency: "High",
      companies: ["Goldman Sachs", "Amazon"],
      options: [
        "Filter rows",
        "Define the window/partition for the function",
        "Order the final result",
        "Aggregate all rows"
      ],
      correctOption: 1,
      explanation: "The OVER() clause defines the window of rows the function operates on. It can include PARTITION BY to divide rows into groups and ORDER BY to define the order within each partition.",
    },
  ]);

  console.log("✅ All questions seeded!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());