/*
  Warnings:

  - A unique constraint covering the columns `[subject,slug]` on the table `RevisionTopic` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "RevisionTopic_subject_slug_key" ON "RevisionTopic"("subject", "slug");
