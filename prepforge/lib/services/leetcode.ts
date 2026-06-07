// lib/services/leetcode.ts

const LC_GRAPHQL = "https://leetcode.com/graphql";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface LCSubmissionCount {
  difficulty: string;
  count: number;
}

export interface LCUser {
  username: string;
  ranking: number;
  totalSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  totalSubmissions: number;
  acceptanceRate: number;
}

// ─── Fetcher ──────────────────────────────────────────────────────────────────

export async function getLeetCodeUser(handle: string): Promise<LCUser | null> {
  try {
    const query = `
      {
        matchedUser(username: "${handle}") {
          username
          profile {
            ranking
          }
          submitStats {
            acSubmissionNum {
              difficulty
              count
            }
            totalSubmissionNum {
              difficulty
              count
            }
          }
        }
      }
    `;

    const res = await fetch(LC_GRAPHQL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Referer": "https://leetcode.com",
      },
      body: JSON.stringify({ query }),
      next: { revalidate: 300 },
    });

    if (!res.ok) return null;

    const data = await res.json();
    const user = data?.data?.matchedUser;

    if (!user) return null;

    const ac = user.submitStats.acSubmissionNum as LCSubmissionCount[];
    const total = user.submitStats.totalSubmissionNum as LCSubmissionCount[];

    const get = (arr: LCSubmissionCount[], key: string) =>
      arr.find((x) => x.difficulty === key)?.count ?? 0;

    const totalSolved = get(ac, "All");
    const totalSubmissions = get(total, "All");
    const acceptanceRate =
      totalSubmissions > 0
        ? Math.round((totalSolved / totalSubmissions) * 1000) / 10
        : 0;

    return {
      username: user.username,
      ranking: user.profile.ranking ?? 0,
      totalSolved,
      easySolved: get(ac, "Easy"),
      mediumSolved: get(ac, "Medium"),
      hardSolved: get(ac, "Hard"),
      totalSubmissions,
      acceptanceRate,
    };
  } catch (err) {
    console.error("[LC] getLeetCodeUser error:", err);
    return null;
  }
}