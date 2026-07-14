// lib/services/contests.ts
//
// Service layer for the contest calendar. Follows the same pattern as
// lib/services/codeforces.ts and lib/services/leetcode.ts — talk to the
// external API, normalize the response, return clean data.

export type PlatformContest = {
  id: string;
  platform: "codeforces" | "leetcode";
  name: string;
  startTime: number; // unix seconds
  durationSeconds: number;
  url: string;
};

const CF_CONTEST_LIST_URL = "https://codeforces.com/api/contest.list?gym=false";
const LC_GRAPHQL_URL = "https://leetcode.com/graphql";

/**
 * Fetches upcoming Codeforces contests (phase === "BEFORE").
 * contest.list returns *every* contest ever, so we filter client-side.
 */
async function getCodeforcesContests(): Promise<PlatformContest[]> {
  const res = await fetch(CF_CONTEST_LIST_URL, { cache: "no-store" });
  if (!res.ok) throw new Error(`Codeforces API returned ${res.status}`);

  const data = await res.json();
  if (data.status !== "OK") throw new Error("Codeforces API returned an error status");

  return data.result
    .filter((c: any) => c.phase === "BEFORE")
    .map((c: any) => ({
      id: `cf-${c.id}`,
      platform: "codeforces" as const,
      name: c.name,
      startTime: c.startTimeSeconds,
      durationSeconds: c.durationSeconds,
      url: `https://codeforces.com/contests/${c.id}`,
    }));
}

/**
 * Fetches LeetCode's next two contests (always one Weekly + one Biweekly —
 * that's the entirety of what LeetCode has queued at any given time).
 */
async function getLeetCodeContests(): Promise<PlatformContest[]> {
  const res = await fetch(LC_GRAPHQL_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Referer: "https://leetcode.com",
    },
    body: JSON.stringify({
      query: `query topTwoContests {
        topTwoContests {
          title
          titleSlug
          startTime
          duration
        }
      }`,
      operationName: "topTwoContests",
    }),
    cache: "no-store",
  });

  if (!res.ok) throw new Error(`LeetCode API returned ${res.status}`);

  const json = await res.json();
  const contests = json?.data?.topTwoContests ?? [];

  return contests.map((c: any) => ({
    id: `lc-${c.titleSlug}`,
    platform: "leetcode" as const,
    name: c.title,
    startTime: c.startTime,
    durationSeconds: c.duration,
    url: `https://leetcode.com/contest/${c.titleSlug}`,
  }));
}

/**
 * Returns all upcoming contests across supported platforms, sorted by start time.
 * Uses allSettled so one platform's API being down doesn't kill the whole calendar.
 */
export async function getUpcomingContests(): Promise<PlatformContest[]> {
  const [cf, lc] = await Promise.allSettled([
    getCodeforcesContests(),
    getLeetCodeContests(),
  ]);

  if (cf.status === "rejected") console.error("Codeforces contest fetch failed:", cf.reason);
  if (lc.status === "rejected") console.error("LeetCode contest fetch failed:", lc.reason);

  const contests: PlatformContest[] = [
    ...(cf.status === "fulfilled" ? cf.value : []),
    ...(lc.status === "fulfilled" ? lc.value : []),
  ];

  return contests.sort((a, b) => a.startTime - b.startTime);
}