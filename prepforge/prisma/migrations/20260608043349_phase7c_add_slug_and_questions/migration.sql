-- AlterTable
ALTER TABLE "RevisionTopic" ADD COLUMN     "slug" TEXT NOT NULL DEFAULT '';

-- CreateTable
CREATE TABLE "SubjectQuestion" (
    "id" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "companies" TEXT[],
    "interviewerNote" TEXT,
    "options" TEXT[],
    "correctOption" INTEGER,
    "explanation" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "SubjectQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubjectQuestionProgress" (
    "userId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'NOT_STARTED',
    "bookmarked" BOOLEAN NOT NULL DEFAULT false,
    "attempted" BOOLEAN NOT NULL DEFAULT false,
    "selectedOption" INTEGER,
    "isCorrect" BOOLEAN,
    "attemptedAt" TIMESTAMP(3),
    "lastRevisedAt" TIMESTAMP(3),

    CONSTRAINT "SubjectQuestionProgress_pkey" PRIMARY KEY ("userId","questionId")
);

-- AddForeignKey
ALTER TABLE "SubjectQuestion" ADD CONSTRAINT "SubjectQuestion_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "RevisionTopic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubjectQuestionProgress" ADD CONSTRAINT "SubjectQuestionProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubjectQuestionProgress" ADD CONSTRAINT "SubjectQuestionProgress_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "SubjectQuestion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
