-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "clerkId" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Handles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "codeforces" TEXT,
    "leetcode" TEXT,
    "atcoder" TEXT,
    "hackerrank" TEXT,

    CONSTRAINT "Handles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContestHistory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "contestId" TEXT NOT NULL,
    "contestName" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "rank" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContestHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContestStats" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "currentRating" INTEGER NOT NULL,
    "maxRating" INTEGER NOT NULL,
    "contestCount" INTEGER NOT NULL,
    "lastSyncedAt" TIMESTAMP(3),

    CONSTRAINT "ContestStats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeetcodeStats" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "easy" INTEGER NOT NULL DEFAULT 0,
    "medium" INTEGER NOT NULL DEFAULT 0,
    "hard" INTEGER NOT NULL DEFAULT 0,
    "totalSolved" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "LeetcodeStats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "XP" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "points" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,

    CONSTRAINT "XP_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Badge" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "Badge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserBadge" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "badgeId" TEXT NOT NULL,

    CONSTRAINT "UserBadge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Question" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "link" TEXT NOT NULL,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyQuestion" (
    "companyId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,

    CONSTRAINT "CompanyQuestion_pkey" PRIMARY KEY ("companyId","questionId")
);

-- CreateTable
CREATE TABLE "QuestionProgress" (
    "userId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'NOT_STARTED',

    CONSTRAINT "QuestionProgress_pkey" PRIMARY KEY ("userId","questionId")
);

-- CreateTable
CREATE TABLE "RevisionTopic" (
    "id" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,

    CONSTRAINT "RevisionTopic_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_clerkId_key" ON "User"("clerkId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Handles_userId_key" ON "Handles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ContestHistory_userId_contestId_platform_key" ON "ContestHistory"("userId", "contestId", "platform");

-- CreateIndex
CREATE UNIQUE INDEX "LeetcodeStats_userId_key" ON "LeetcodeStats"("userId");

-- AddForeignKey
ALTER TABLE "Handles" ADD CONSTRAINT "Handles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContestHistory" ADD CONSTRAINT "ContestHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContestStats" ADD CONSTRAINT "ContestStats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeetcodeStats" ADD CONSTRAINT "LeetcodeStats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "XP" ADD CONSTRAINT "XP_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserBadge" ADD CONSTRAINT "UserBadge_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserBadge" ADD CONSTRAINT "UserBadge_badgeId_fkey" FOREIGN KEY ("badgeId") REFERENCES "Badge"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyQuestion" ADD CONSTRAINT "CompanyQuestion_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyQuestion" ADD CONSTRAINT "CompanyQuestion_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionProgress" ADD CONSTRAINT "QuestionProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionProgress" ADD CONSTRAINT "QuestionProgress_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
