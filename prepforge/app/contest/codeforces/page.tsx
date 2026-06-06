"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { rankColor } from "@/lib/services/codeforces";

interface CFDashboardData {
  user: {
    handle: string;
    rating: number;
    maxRating: number;
    rank: string;
    maxRank: string;
    contribution: number;
    avatar: string;
  };
  stats: {
    totalContests: number;
    bestRank: number | null;
    worstRank: number | null;
    averageRatingChange: number;
  };
  recentContests: Array<{
    id: number;
    name: string;
    rank: number;
    ratingChange: number;
    newRating: number;
    date: string;
  }>;
  ratingGraph: Array<{
    date: string;
    rating: number;
    contestName: string;
  }>;
}

function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-md bg-[#1e2a1e] ${className}`} />
  );
}

function RatingTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const { rating, contestName } = payload[0].payload;
  return (
    <div className="rounded-xl border border-[#2a3d2a] bg-[#0d1a0d]/90 px-4 py-3 shadow-2xl">
      <p className="font-mono text-xs text-[#5a7a5a] mb-1 max-w-[200px] truncate">
        {contestName}
      </p>
      <p className="font-bold text-lg text-[#a8ff78]">{rating}</p>
    </div>
  );
}

function StatBadge({
  label,
  value,
  accent = false,
  color,
}: {
  label: string;
  value: string | number;
  accent?: boolean;
  color?: string;
}) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl border border-[#1e3a1e] bg-[#0a1a0a] px-5 py-4">
      <span className="text-[11px] uppercase tracking-widest text-[#4a6a4a] font-medium">
        {label}
      </span>
      <span
        className={`text-2xl font-black tabular-nums leading-none ${
          accent ? "text-[#a8ff78]" : "text-[#e8f5e8]"
        }`}
        style={color ? { color } : undefined}
      >
        {value}
      </span>
    </div>
  );
}

export default function CodeforcesDashboard() {
  const { user: clerkUser, isLoaded } = useUser();
  const [data, setData] = useState<CFDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cfHandle, setCfHandle] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded || !clerkUser) return;

    async function loadHandle() {
      try {
        const res = await fetch("/api/profile/handles");
        if (!res.ok) throw new Error("Could not load profile handles.");
        const json = await res.json();
        const handle: string | null = json?.handles?.codeforces ?? null;
        if (!handle) {
          setError("No Codeforces handle found. Please add one in your Profile settings.");
          setLoading(false);
          return;
        }
        setCfHandle(handle);
      } catch (e: any) {
        setError(e.message ?? "Failed to load handles.");
        setLoading(false);
      }
    }

    loadHandle();
  }, [isLoaded, clerkUser]);

  useEffect(() => {
    if (!cfHandle) return;

    async function fetchDashboard() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/codeforces/${encodeURIComponent(cfHandle!)}`
        );
        const json = await res.json();
        if (!res.ok) {
          throw new Error(json.error ?? "Failed to fetch Codeforces data.");
        }
        setData(json);
      } catch (e: any) {
        setError(e.message ?? "An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    }

    fetchDashboard();
  }, [cfHandle]);

  if (!isLoaded || loading) {
    return (
      <main className="min-h-screen bg-[#060e06] px-4 py-10 md:px-10">
        <div className="mb-10 flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          <Skeleton className="h-52 rounded-3xl" />
          <Skeleton className="h-52 rounded-3xl" />
          <Skeleton className="h-52 rounded-3xl" />
        </div>
        <Skeleton className="mt-6 h-80 rounded-3xl" />
        <Skeleton className="mt-6 h-64 rounded-3xl" />
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-[#060e06] flex items-center justify-center px-4">
        <div className="max-w-md w-full rounded-3xl border border-[#3d1a1a] bg-[#1a0a0a] p-10 text-center shadow-2xl">
          <h2 className="mb-3 text-xl font-bold text-[#f5c6c6]">
            Something went wrong
          </h2>
          <p className="text-sm text-[#8a5a5a] leading-relaxed">
            {error}
          </p>
          
          <a
            href="/profile"
            className="mt-8 inline-block rounded-xl bg-[#a8ff78]/10 px-6 py-3 text-sm font-semibold text-[#a8ff78] ring-1 ring-[#a8ff78]/20 transition hover:bg-[#a8ff78]/20"
          >
            Go to Profile
          </a>
        </div>
      </main>
    );
  }
    
  if (!data) return null;

  const { user, stats, recentContests, ratingGraph } = data;
  const ratingCol = rankColor(user.rank);
  const maxRatingCol = rankColor(user.maxRank);
  const ratings = ratingGraph.map((p) => p.rating);
  const yMin = Math.max(0, Math.min(...ratings) - 100);
  const yMax = Math.max(...ratings) + 100;

  return (
    <main className="min-h-screen bg-[#060e06] px-4 py-10 md:px-10">

      {/* Header */}
      <header className="mb-10 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="inline-block h-2 w-2 rounded-full bg-[#a8ff78] shadow-[0_0_8px_#a8ff78]" />
            <span className="text-xs uppercase tracking-widest text-[#4a6a4a]">
              Codeforces · Live
            </span>
          </div>
          <h1 className="text-3xl font-black text-[#e8f5e8] tracking-tight">
            {user.handle}
            <span
              className="ml-3 text-lg font-normal"
              style={{ color: ratingCol }}
            >
              {user.rank}
            </span>
          </h1>
        </div>
        
        <a
          href={`https://codeforces.com/profile/${user.handle}`}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-xl border border-[#1e3a1e] bg-[#0a1a0a] px-5 py-2.5 text-sm font-medium text-[#a8ff78] transition hover:bg-[#a8ff78]/10"
        >
          View on Codeforces
        </a>
      </header>

      {/* Card 1 — Profile Summary */}
      <section className="mb-6 rounded-3xl border border-[#1e3a1e] bg-[#0a140a] p-6 md:p-8">
        <div className="flex flex-wrap items-start gap-6 md:gap-10">
          <div className="relative flex-shrink-0">
            <div
              className="h-20 w-20 rounded-2xl overflow-hidden border-2"
              style={{ borderColor: ratingCol }}
            >
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={`${user.handle} avatar`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full bg-[#1e3a1e] flex items-center justify-center text-2xl text-[#a8ff78] font-black">
                  {user.handle[0].toUpperCase()}
                </div>
              )}
            </div>
          </div>
          <div className="flex-1 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            <StatBadge label="Current Rating" value={user.rating} accent />
            <StatBadge label="Max Rating" value={user.maxRating} />
            <StatBadge
              label="Current Rank"
              value={user.rank}
              color={ratingCol}
            />
            <StatBadge
              label="Max Rank"
              value={user.maxRank}
              color={maxRatingCol}
            />
            <StatBadge
              label="Contribution"
              value={
                user.contribution >= 0
                  ? `+${user.contribution}`
                  : user.contribution
              }
            />
          </div>
        </div>
      </section>

      {/* Card 2 — Contest Statistics */}
      <section className="mb-6 rounded-3xl border border-[#1e3a1e] bg-[#0a140a] p-6 md:p-8">
        <h2 className="mb-5 text-xs font-bold uppercase tracking-widest text-[#4a6a4a]">
          Contest Statistics
        </h2>
        {stats.totalContests === 0 ? (
          <p className="text-sm text-[#4a6a4a]">No contest history found.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="col-span-2 sm:col-span-1 rounded-2xl border border-[#1a3a1a] bg-[#060e06] px-6 py-5">
              <p className="text-[11px] uppercase tracking-widest text-[#4a6a4a] mb-1">
                Total Contests
              </p>
              <p className="text-4xl font-black tabular-nums text-[#a8ff78]">
                {stats.totalContests}
              </p>
            </div>
            <StatBadge label="Best Rank" value={stats.bestRank ?? "—"} />
            <StatBadge label="Worst Rank" value={stats.worstRank ?? "—"} />
            <div className="rounded-2xl border border-[#1a3a1a] bg-[#060e06] px-5 py-4">
              <p className="text-[11px] uppercase tracking-widest text-[#4a6a4a] mb-1">
                Avg Delta Rating
              </p>
              <p
                className={`text-2xl font-black tabular-nums ${
                  stats.averageRatingChange >= 0
                    ? "text-[#a8ff78]"
                    : "text-red-400"
                }`}
              >
                {stats.averageRatingChange >= 0 ? "+" : ""}
                {stats.averageRatingChange}
              </p>
            </div>
          </div>
        )}
      </section>

      {/* Card 3 — Rating Graph */}
      {ratingGraph.length > 0 && (
        <section className="mb-6 rounded-3xl border border-[#1e3a1e] bg-[#0a140a] p-6 md:p-8">
          <h2 className="mb-6 text-xs font-bold uppercase tracking-widest text-[#4a6a4a]">
            Rating Progression
          </h2>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart
              data={ratingGraph}
              margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#1a2a1a"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                tick={{ fill: "#4a6a4a", fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: "#1a2a1a" }}
                interval="preserveStartEnd"
              />
              <YAxis
                domain={[yMin, yMax]}
                tick={{ fill: "#4a6a4a", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                width={45}
              />
              <Tooltip content={<RatingTooltip />} />
              {[1200, 1400, 1600, 1900, 2100, 2300, 2400, 2600, 3000].map(
                (r) =>
                  r >= yMin && r <= yMax ? (
                    <ReferenceLine
                      key={r}
                      y={r}
                      stroke="#1e3a1e"
                      strokeDasharray="4 4"
                      strokeWidth={1}
                    />
                  ) : null
              )}
              <Line
                type="monotone"
                dataKey="rating"
                stroke="#a8ff78"
                strokeWidth={2.5}
                dot={
                  ratingGraph.length < 30
                    ? { fill: "#a8ff78", strokeWidth: 0, r: 4 }
                    : false
                }
                activeDot={{ r: 6, fill: "#a8ff78", strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </section>
      )}

      {/* Card 4 — Recent Contests */}
      <section className="mb-10 rounded-3xl border border-[#1e3a1e] bg-[#0a140a] p-6 md:p-8">
        <h2 className="mb-5 text-xs font-bold uppercase tracking-widest text-[#4a6a4a]">
          Recent Contests
        </h2>
        {recentContests.length === 0 ? (
          <p className="text-sm text-[#4a6a4a]">No contests found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[540px] text-sm">
              <thead>
                <tr className="border-b border-[#1a2a1a]">
                  {["Contest", "Rank", "Rating Change", "New Rating", "Date"].map(
                    (col) => (
                      <th
                        key={col}
                        className="pb-3 text-left text-[10px] font-bold uppercase tracking-widest text-[#3a5a3a] px-2 first:pl-0 last:pr-0"
                      >
                        {col}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#0e1e0e]">
                {recentContests.map((contest) => {
                  const isPositive = contest.ratingChange >= 0;
                  const dateStr = new Date(contest.date).toLocaleDateString(
                    "en-US",
                    {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    }
                  );
                  return (
                    <tr
                      key={contest.id}
                      className="transition hover:bg-[#0d1a0d]"
                    >
                      <td className="py-3.5 px-2 pl-0 max-w-[220px]">
                        <a
                          href={`https://codeforces.com/contest/${contest.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="line-clamp-2 text-[#c8e8c8] hover:text-[#a8ff78] transition"
                          title={contest.name}
                        >
                          {contest.name}
                        </a>
                      </td>
                      <td className="py-3.5 px-2 tabular-nums font-mono text-[#8aaa8a]">
                        #{contest.rank.toLocaleString()}
                      </td>
                      <td
                        className={`py-3.5 px-2 tabular-nums font-bold ${
                          isPositive ? "text-[#a8ff78]" : "text-red-400"
                        }`}
                      >
                        {isPositive ? "+" : ""}
                        {contest.ratingChange}
                      </td>
                      <td className="py-3.5 px-2 tabular-nums text-[#c8e8c8] font-mono">
                        {contest.newRating}
                      </td>
                      <td className="py-3.5 px-2 pr-0 text-[#4a6a4a] whitespace-nowrap text-xs">
                        {dateStr}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <p className="text-center text-[10px] text-[#2a4a2a] tracking-widest uppercase">
        Data sourced from the Codeforces API. Cached for 5 minutes.
      </p>

    </main>
  );
}