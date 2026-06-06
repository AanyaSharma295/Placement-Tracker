// lib/services/codeforces.ts

const CF_BASE = "https://codeforces.com/api";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface CFUser {
  handle: string;
  rating: number;
  maxRating: number;
  rank: string;
  maxRank: string;
  contribution: number;
  avatar: string;
  titlePhoto: string;
}

export interface CFRatingChange {
  contestId: number;
  contestName: string;
  handle: string;
  rank: number;
  ratingUpdateTimeSeconds: number;
  oldRating: number;
  newRating: number;
}

// ─── Fetchers ─────────────────────────────────────────────────────────────────

export async function getUserInfo(handle: string): Promise<CFUser | null> {
  try {
    const res = await fetch(
      `${CF_BASE}/user.info?handles=${encodeURIComponent(handle)}`,
      { next: { revalidate: 300 } }
    );

    if (!res.ok) return null;

    const data = await res.json();
    if (data.status !== "OK" || !data.result?.length) return null;

    return data.result[0];
  } catch {
    return null;
  }
}

export async function getContestHistory(
  handle: string
): Promise<CFRatingChange[]> {
  try {
    const res = await fetch(
      `${CF_BASE}/user.rating?handle=${encodeURIComponent(handle)}`,
      { next: { revalidate: 300 } }
    );

    if (!res.ok) return [];

    const data = await res.json();
    if (data.status !== "OK" || !data.result) return [];

    return data.result;
  } catch {
    return [];
  }
}

// ─── Computed Helpers ─────────────────────────────────────────────────────────

export interface ContestStats {
  totalContests: number;
  bestRank: number | null;
  worstRank: number | null;
  averageRatingChange: number;
}

export function computeContestStats(
  history: CFRatingChange[]
): ContestStats {
  if (!history.length) {
    return {
      totalContests: 0,
      bestRank: null,
      worstRank: null,
      averageRatingChange: 0,
    };
  }

  const ranks = history.map((c) => c.rank);
  const deltas = history.map((c) => c.newRating - c.oldRating);
  const avg = deltas.reduce((s, d) => s + d, 0) / deltas.length;

  return {
    totalContests: history.length,
    bestRank: Math.min(...ranks),
    worstRank: Math.max(...ranks),
    averageRatingChange: Math.round(avg * 10) / 10,
  };
}

export interface RecentContest {
  id: number;
  name: string;
  rank: number;
  ratingChange: number;
  newRating: number;
  date: string;
}

export function getRecentContests(
  history: CFRatingChange[],
  count = 10
): RecentContest[] {
  return [...history]
    .reverse()
    .slice(0, count)
    .map((c) => ({
      id: c.contestId,
      name: c.contestName,
      rank: c.rank,
      ratingChange: c.newRating - c.oldRating,
      newRating: c.newRating,
      date: new Date(c.ratingUpdateTimeSeconds * 1000).toISOString(),
    }));
}

export interface RatingPoint {
  date: string;
  rating: number;
  contestName: string;
}

export function buildRatingGraph(history: CFRatingChange[]): RatingPoint[] {
  return history.map((c) => {
    const d = new Date(c.ratingUpdateTimeSeconds * 1000);
    const label = d.toLocaleDateString("en-US", {
      month: "short",
      year: "2-digit",
    });
    return {
      date: label,
      rating: c.newRating,
      contestName: c.contestName,
    };
  });
}

export function rankColor(rank: string): string {
  const r = rank?.toLowerCase() ?? "";
  if (r.includes("legendary grandmaster")) return "#FF0000";
  if (r.includes("international grandmaster")) return "#FF3333";
  if (r.includes("grandmaster")) return "#FF7777";
  if (r.includes("international master")) return "#FFBB55";
  if (r.includes("master")) return "#FF8C00";
  if (r.includes("candidate master")) return "#AA00AA";
  if (r.includes("expert")) return "#0000FF";
  if (r.includes("specialist")) return "#03A89E";
  if (r.includes("pupil")) return "#77FF77";
  return "#808080";
}