// lib/services/xp.ts
//
// Computes a user's total XP live, from data that's already synced —
// same philosophy as computeContestStats() in codeforces.ts. Nothing here
// gets written to the database; XP is always freshly derived, so it can
// never drift out of sync with the underlying stats.
//
// The unused `XP` model in schema.prisma (points/reason per row) is for a
// different, event-based design — logging individual XP-earning events.
// We're intentionally not using it yet; this file is the "compute live"
// approach we're starting with.

import { prisma } from "@/lib/prisma";

export const XP_RULES = {
  leetcodeEasy: 5,
  leetcodeMedium: 10,
  leetcodeHard: 20,
  codeforcesContest: 50,
  companyQuestionSolved: 15,
  topicCompleted: 10,
} as const;

export type XPBreakdown = {
  leetcode: number;
  codeforces: number;
  companyQuestions: number;
  revisionTopics: number;
  total: number;
};

export async function calculateUserXP(userId: string): Promise<XPBreakdown> {
  const [leetcodeStats, contestStats, solvedQuestionCount, completedTopicCount] =
    await Promise.all([
      prisma.leetcodeStats.findUnique({
        where: { userId },
      }),
      prisma.contestStats.findMany({
        where: { userId },
      }),
      prisma.questionProgress.count({
        where: { userId, status: "SOLVED" },
      }),
      prisma.topicProgress.count({
        where: { userId, status: "COMPLETED" },
      }),
    ]);

  const leetcodeXP = leetcodeStats
    ? leetcodeStats.easy * XP_RULES.leetcodeEasy +
      leetcodeStats.medium * XP_RULES.leetcodeMedium +
      leetcodeStats.hard * XP_RULES.leetcodeHard
    : 0;

  // Sum across all platforms in ContestStats (currently just Codeforces,
  // but this stays correct once AtCoder/HackerRank contest tracking exists).
  const codeforcesXP = contestStats.reduce(
    (sum, stat) => sum + stat.contestCount * XP_RULES.codeforcesContest,
    0
  );

  const companyQuestionsXP = solvedQuestionCount * XP_RULES.companyQuestionSolved;
  const revisionTopicsXP = completedTopicCount * XP_RULES.topicCompleted;

  return {
    leetcode: leetcodeXP,
    codeforces: codeforcesXP,
    companyQuestions: companyQuestionsXP,
    revisionTopics: revisionTopicsXP,
    total: leetcodeXP + codeforcesXP + companyQuestionsXP + revisionTopicsXP,
  };
}