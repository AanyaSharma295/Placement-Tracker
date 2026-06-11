"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// ─── Types ────────────────────────────────────────────────────────────────────
interface InterviewStats {
  questions: {
    total: number;
    solved: number;
    inProgress: number;
    completionPercentage: number;
  };
  companies: {
    started: number;
    total: number;
  };
  subjects: {
    totalTopics: number;
    completedTopics: number;
    inProgressTopics: number;
    completionPercentage: number;
  };
  overallReadiness: number;
}

interface DashboardData {
  user: { name: string; email: string; image: string };
  handles: {
    codeforces: string | null;
    leetcode: string | null;
    atcoder: string | null;
    hackerrank: string | null;
  };
  codeforces: {
    rating: number;
    maxRating: number;
    contestCount: number;
    ratingGraph: Array<{ date: string; rating: number; contestName: string }>;
    lastSyncedAt: string | null;
  };
  leetcode: {
    totalSolved: number;
    easy: number;
    medium: number;
    hard: number;
    lastSyncedAt: string | null;
  };
  summary: {
    totalContests: number;
    progressScore: number;
    platformsTracked: number;
  };
  activity: Array<{
    platform: string;
    title: string;
    detail: string;
    date: string;
  }>;
  insights: string[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const LC_COLORS = { easy: "#00C4B4", medium: "#FFA116", hard: "#FF375F" };
const CF_GREEN = "#a8ff78";
const PF_PURPLE = "#8B5CF6";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function getMotivation() {
  const lines = [
    "Keep pushing. You're closer to your dream company than yesterday.",
    "Every problem solved is a step toward your offer letter.",
    "Consistency beats talent. Show up today.",
    "Your future self will thank you for the work you do today.",
    "One more contest. One more problem. One step closer.",
  ];
  return lines[new Date().getDay() % lines.length];
}

function formatSyncTime(iso: string | null) {
  if (!iso) return "Never synced";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function isConnected(handle: string | null | undefined): boolean {
  return !!handle && handle.trim() !== "";
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-xl bg-[#1a1a2e] ${className}`} />
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: string | number;
  sub?: string;
  color: string;
}) {
  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-2"
      style={{
        background: "#12121f",
        border: `1px solid ${color}25`,
        boxShadow: `0 0 20px ${color}06`,
      }}
    >
      <span className="text-[11px] uppercase tracking-widest text-[#6b6b85] font-medium">
        {label}
      </span>
      <span
        className="text-3xl font-black tabular-nums leading-none"
        style={{ color }}
      >
        {value}
      </span>
      {sub && (
        <span className="text-[11px] text-[#6b6b85] leading-relaxed">{sub}</span>
      )}
    </div>
  );
}

// ─── Tooltips ─────────────────────────────────────────────────────────────────

function CFTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const { rating, contestName } = payload[0].payload;
  return (
    <div
      className="rounded-xl px-4 py-3 shadow-2xl text-sm max-w-[200px]"
      style={{ background: "#12121f", border: "1px solid #a8ff7830" }}
    >
      <p className="text-[#6b6b85] text-xs mb-1 truncate">{contestName}</p>
      <p className="font-bold text-[#a8ff78]">{rating}</p>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const { user: clerkUser, isLoaded } = useUser();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [interviewStats, setInterviewStats] = useState<InterviewStats | null>(null);
  const [syncing, setSyncing] = useState<"cf" | "lc" | null>(null);

  useEffect(() => {
    if (!isLoaded || !clerkUser) return;
    fetchDashboard();
    fetchInterviewStats();
  }, [isLoaded, clerkUser]);

  async function fetchDashboard() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/dashboard", { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to load dashboard.");
      setData(json);
    } catch (e: any) {
      setError(e.message ?? "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function fetchInterviewStats() {
    try {
      const res = await fetch("/api/dashboard/interview-stats", { cache: "no-store" });
      const json = await res.json();
      if (res.ok) setInterviewStats(json);
    } catch (e) {
      console.error(e);
    }
  }

  async function syncPlatform(platform: "cf" | "lc") {
    setSyncing(platform);
    try {
      const endpoint =
        platform === "cf" ? "/api/codeforces/sync" : "/api/leetcode/sync";
      await fetch(endpoint, { method: "POST" });
      await fetchDashboard();
    } catch (e) {
      console.error(e);
    } finally {
      setSyncing(null);
    }
  }

  // ── Loading ───────────────────────────────────────────────────────────────

  if (!isLoaded || loading) {
    return (
      <main className="min-h-screen bg-[#0a0a18] px-4 py-10 md:px-10">
        <div className="max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-36 rounded-3xl" />
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-2xl" />
            ))}
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Skeleton className="h-52 rounded-3xl" />
            <Skeleton className="h-52 rounded-3xl" />
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Skeleton className="h-72 rounded-3xl" />
            <Skeleton className="h-72 rounded-3xl" />
          </div>
          <Skeleton className="h-40 rounded-3xl" />
          <Skeleton className="h-24 rounded-3xl" />
        </div>
      </main>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────────────

  if (error) {
    return (
      <main className="min-h-screen bg-[#0a0a18] flex items-center justify-center px-4">
        <div
          className="max-w-md w-full rounded-3xl p-10 text-center"
          style={{ background: "#12121f", border: "1px solid #ff375f30" }}
        >
          <h2 className="text-xl font-bold text-red-300 mb-3">
            Failed to load dashboard
          </h2>
          <p className="text-sm text-[#6b6b85] mb-8">{error}</p>
          <button
            onClick={fetchDashboard}
            className="rounded-xl px-6 py-3 text-sm font-semibold text-white"
            style={{ background: PF_PURPLE }}
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  if (!data) return null;

  const { handles, codeforces, leetcode, summary, activity, insights } = data;

  const firstName =
    clerkUser?.firstName?.trim() ||
    clerkUser?.fullName?.trim() ||
    null;

  const lcPieData = [
    { name: "Easy", value: leetcode.easy },
    { name: "Medium", value: leetcode.medium },
    { name: "Hard", value: leetcode.hard },
  ];

  const cfRatings = codeforces.ratingGraph.map((p) => p.rating);
  const cfYMin = cfRatings.length ? Math.max(0, Math.min(...cfRatings) - 100) : 0;
  const cfYMax = cfRatings.length ? Math.max(...cfRatings) + 100 : 2000;

  const platforms = [
    {
      name: "Codeforces",
      handle: handles.codeforces,
      color: CF_GREEN,
      coming: false,
    },
    {
      name: "LeetCode",
      handle: handles.leetcode,
      color: "#FFA116",
      coming: false,
    },
    {
      name: "AtCoder",
      handle: handles.atcoder,
      color: "#6b6b85",
      coming: true,
    },
    {
      name: "HackerRank",
      handle: handles.hackerrank,
      color: "#6b6b85",
      coming: true,
    },
  ];

  return (
    <main className="min-h-screen bg-[#0a0a18] px-4 py-10 md:px-10">
      <div className="max-w-7xl mx-auto space-y-5">

        {/* ── Section 1: Welcome Header ──────────────────────────────── */}
        <section
          className="rounded-3xl p-6 md:p-8 flex flex-wrap items-center justify-between gap-6"
          style={{
            background: "linear-gradient(135deg, #12121f 0%, #1a1030 100%)",
            border: `1px solid ${PF_PURPLE}25`,
          }}
        >
          <div className="flex items-center gap-5">
            {clerkUser?.imageUrl && (
              <img
                src={clerkUser.imageUrl}
                alt="avatar"
                className="h-14 w-14 rounded-2xl object-cover flex-shrink-0"
                style={{ border: `2px solid ${PF_PURPLE}` }}
              />
            )}
            <div>
              <p className="text-sm font-medium mb-0.5" style={{ color: PF_PURPLE }}>
                {getGreeting()}
                {firstName ? `, ${firstName}` : ""} 👋
              </p>
              <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                PrepForge Dashboard
              </h1>
              <p className="text-[#6b6b85] text-sm mt-1">{getMotivation()}</p>
            </div>
          </div>
          
          <div className="flex flex-col gap-3 text-xs text-[#6b6b85]">
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <span
                  className="h-2 w-2 rounded-full flex-shrink-0"
                  style={{ background: CF_GREEN }}
                />
                <span>
                  CF synced:{" "}
                  <span style={{ color: CF_GREEN }}>
                    {formatSyncTime(codeforces.lastSyncedAt)}
                  </span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="h-2 w-2 rounded-full flex-shrink-0"
                  style={{ background: "#FFA116" }}
                />
                <span>
                  LC synced:{" "}
                  <span style={{ color: "#FFA116" }}>
                    {formatSyncTime(leetcode.lastSyncedAt)}
                  </span>
                </span>
              </div>
            </div>

            {/* Added Sync Buttons Implementation Map Block */}
            <div className="flex flex-wrap gap-2 mt-1">
              {[
                { label: "Sync Codeforces", platform: "cf" as const, color: CF_GREEN },
                { label: "Sync LeetCode", platform: "lc" as const, color: "#FFA116" },
              ].map(({ label, platform, color }) => (
                <button
                  key={label}
                  onClick={() => syncPlatform(platform)}
                  disabled={syncing !== null}
                  className="rounded-xl px-5 py-2.5 text-sm font-semibold transition hover:opacity-90 disabled:opacity-50"
                  style={{
                    background: syncing === platform ? `${color}25` : `${color}10`,
                    border: `1px solid ${color}25`,
                    color,
                  }}
                >
                  {syncing === platform ? "Syncing..." : label}
                </button>
              ))}
            </div>

            <p className="text-[#6b6b85] mt-1">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </section>

        {/* ── Section 2: Overview Cards ──────────────────────────────── */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard
            label="Codeforces Rating"
            value={codeforces.rating || "—"}
            sub={isConnected(handles.codeforces) ? handles.codeforces! : "No handle saved"}
            color={CF_GREEN}
          />
          <StatCard
            label="LeetCode Solved"
            value={leetcode.totalSolved || "—"}
            sub={isConnected(handles.leetcode) ? handles.leetcode! : "No handle saved"}
            color="#FFA116"
          />
          <StatCard
            label="Total Contests"
            value={summary.totalContests}
            sub={`${summary.platformsTracked} platform${summary.platformsTracked !== 1 ? "s" : ""} tracked`}
            color={PF_PURPLE}
          />
          <StatCard
            label="Prep Score"
            value={summary.progressScore}
            sub="CF Rating / 10 + LC Solved"
            color="#e879f9"
          />
        </div>

        {/* ── Section 3: Platform Snapshots ─────────────────────────── */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {/* Codeforces */}
          <div
            className="rounded-3xl p-6 flex flex-col gap-4"
            style={{ background: "#12121f", border: `1px solid ${CF_GREEN}20` }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ background: CF_GREEN, boxShadow: `0 0 6px ${CF_GREEN}` }}
                />
                <span className="text-xs uppercase tracking-widest text-[#6b6b85] font-bold">
                  Codeforces
                </span>
              </div>
              <span className="text-xs font-mono text-[#6b6b85]">
                {handles.codeforces ?? "—"}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: "Rating", value: codeforces.rating, color: CF_GREEN },
                { label: "Max", value: codeforces.maxRating, color: "#fff" },
                { label: "Contests", value: codeforces.contestCount, color: "#fff" },
                { label: "Rank", value: codeforces.rating >= 3000 ? "LGM" : codeforces.rating >= 2600 ? "IGM" : codeforces.rating >= 2400 ? "GM" : codeforces.rating >= 2300 ? "IM" : codeforces.rating >= 2100 ? "Master" : codeforces.rating >= 1900 ? "CM" : codeforces.rating >= 1600 ? "Expert" : codeforces.rating >= 1400 ? "Spec." : codeforces.rating >= 1200 ? "Pupil" : codeforces.rating > 0 ? "Newbie" : "—", color: CF_GREEN },
              ].map(({ label, value, color }) => (
                <div
                  key={label}
                  className="rounded-xl px-3 py-3"
                  style={{ background: "#0a0a18" }}
                >
                  <p className="text-[10px] uppercase tracking-widest text-[#6b6b85] mb-1">
                    {label}
                  </p>
                  <p className="text-lg font-black tabular-nums leading-none" style={{ color }}>
                    {value}
                  </p>
                </div>
              ))}
            </div>
            <Link
              href="/contest/codeforces"
              className="rounded-xl px-4 py-3 text-sm font-semibold text-center transition hover:opacity-80"
              style={{
                background: `${CF_GREEN}12`,
                border: `1px solid ${CF_GREEN}25`,
                color: CF_GREEN,
              }}
            >
              View Codeforces Dashboard
            </Link>
          </div>

          {/* LeetCode */}
          <div
            className="rounded-3xl p-6 flex flex-col gap-4"
            style={{ background: "#12121f", border: "1px solid #FFA11620" }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ background: "#FFA116", boxShadow: "0 0 6px #FFA116" }}
                />
                <span className="text-xs uppercase tracking-widest text-[#6b6b85] font-bold">
                  LeetCode
                </span>
              </div>
              <span className="text-xs font-mono text-[#6b6b85]">
                {handles.leetcode ?? "—"}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: "Solved", value: leetcode.totalSolved, color: "#FFA116" },
                { label: "Easy", value: leetcode.easy, color: LC_COLORS.easy },
                { label: "Medium", value: leetcode.medium, color: LC_COLORS.medium },
                { label: "Hard", value: leetcode.hard, color: LC_COLORS.hard },
              ].map(({ label, value, color }) => (
                <div
                  key={label}
                  className="rounded-xl px-3 py-3"
                  style={{ background: "#0a0a18" }}
                >
                  <p className="text-[10px] uppercase tracking-widest text-[#6b6b85] mb-1">
                    {label}
                  </p>
                  <p className="text-lg font-black tabular-nums leading-none" style={{ color }}>
                    {value}
                  </p>
                </div>
              ))}
            </div>
            <Link
              href="/contest/leetcode"
              className="rounded-xl px-4 py-3 text-sm font-semibold text-center transition hover:opacity-80"
              style={{
                background: "rgba(255,161,22,0.08)",
                border: "1px solid rgba(255,161,22,0.22)",
                color: "#FFA116",
              }}
            >
              View LeetCode Dashboard
            </Link>
          </div>
        </div>

        {/* ── Section 4: Charts ─────────────────────────────────────── */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {/* CF Rating Trend */}
          <section
            className="rounded-3xl p-6"
            style={{ background: "#12121f", border: `1px solid ${CF_GREEN}20` }}
          >
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#6b6b85] mb-5">
              Codeforces Rating Trend
            </h2>
            {codeforces.ratingGraph.length < 3 ? (
              <div className="flex flex-col items-center justify-center h-48 gap-3 text-center">
                <span className="text-3xl">📈</span>
                <p className="text-sm font-semibold text-[#b8b8c8]">
                  Not enough contest history yet
                </p>
                <p className="text-xs text-[#6b6b85] max-w-[220px]">
                  Participate in at least 3 contests to unlock trend analysis.
                </p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart
                  data={codeforces.ratingGraph}
                  margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#1a1a2e"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: "#6b6b85", fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    domain={[cfYMin, cfYMax]}
                    tick={{ fill: "#6b6b85", fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                    width={40}
                  />
                  <Tooltip content={<CFTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="rating"
                    stroke={CF_GREEN}
                    strokeWidth={2.5}
                    dot={{ fill: CF_GREEN, strokeWidth: 0, r: 4 }}
                    activeDot={{ r: 6, fill: CF_GREEN, strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </section>

          {/* LC Pie */}
          <section
            className="rounded-3xl p-6"
            style={{ background: "#12121f", border: "1px solid #FFA11620" }}
          >
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#6b6b85] mb-5">
              LeetCode Difficulty Breakdown
            </h2>
            <div className="relative">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={lcPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {lcPieData.map((entry, i) => (
                      <Cell
                        key={entry.name}
                        fill={Object.values(LC_COLORS)[i]}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <p className="text-3xl font-black text-white">
                  {leetcode.totalSolved}
                </p>
                <p className="text-[10px] uppercase tracking-widest text-[#6b6b85]">
                  solved
                </p>
              </div>
            </div>
            <div className="mt-2 flex justify-center gap-5">
              {lcPieData.map((entry, i) => (
                <div key={entry.name} className="flex items-center gap-1.5">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: Object.values(LC_COLORS)[i] }}
                  />
                  <span className="text-xs text-[#6b6b85]">{entry.name}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* ── Section 5: Activity + Insights ────────────────────────── */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {/* Activity */}
          <section
            className="rounded-3xl p-6"
            style={{ background: "#12121f", border: `1px solid ${PF_PURPLE}20` }}
          >
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#6b6b85] mb-5">
              Recent Activity
            </h2>
            {activity.length === 0 ? (
              <p className="text-sm text-[#6b6b85]">No activity yet. Sync your platforms.</p>
            ) : (
              <div className="space-y-2">
                {activity.map((item, i) => {
                  const isCF = item.platform === "codeforces";
                  const color = isCF ? CF_GREEN : "#FFA116";
                  const dateStr = new Date(item.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  });
                  return (
                    <div
                      key={i}
                      className="flex items-start gap-3 rounded-xl px-4 py-3"
                      style={{ background: "#0a0a18" }}
                    >
                      <span
                        className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full"
                        style={{ background: color }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-white truncate">
                          {item.title}
                        </p>
                        <p className="text-xs text-[#6b6b85]">{item.detail}</p>
                      </div>
                      <span className="text-[10px] text-[#6b6b85] whitespace-nowrap flex-shrink-0">
                        {dateStr}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Insights */}
          <section
            className="rounded-3xl p-6"
            style={{ background: "#12121f", border: `1px solid ${PF_PURPLE}20` }}
          >
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#6b6b85] mb-5">
              PrepForge Insights
            </h2>
            <div className="space-y-2">
              {insights.map((insight, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 rounded-xl px-4 py-3"
                  style={{
                    background: "#0a0a18",
                    border: `1px solid ${PF_PURPLE}12`,
                  }}
                >
                  <span
                    className="mt-0.5 flex-shrink-0 text-base leading-none"
                    style={{ color: PF_PURPLE }}
                  >
                    ✦
                  </span>
                  <p className="text-sm text-[#b8b8c8] leading-relaxed">
                    {insight}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* ── Section 6: Connected Platforms ────────────────────────── */}
        <section
          className="rounded-3xl p-6"
          style={{ background: "#12121f", border: `1px solid ${PF_PURPLE}20` }}
        >
          <h2 className="text-xs font-bold uppercase tracking-widest text-[#6b6b85] mb-5">
            Connected Platforms
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {platforms.map(({ name, handle, color, coming }) => {
              const connected = !coming && isConnected(handle);
              return (
                <div
                  key={name}
                  className="rounded-2xl px-4 py-4 flex flex-col gap-2"
                  style={{
                    background: "#0a0a18",
                    border: `1px solid ${connected ? color + "30" : "#ffffff08"}`,
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                      style={{
                        background: connected ? color : "#3a3a4a",
                        boxShadow: connected ? `0 0 6px ${color}` : "none",
                      }}
                    />
                    <span
                      className="text-xs font-bold uppercase tracking-widest"
                      style={{ color: connected ? "#fff" : "#6b6b85" }}
                    >
                      {name}
                    </span>
                  </div>
                  {coming ? (
                    <span
                      className="text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full w-fit"
                      style={{
                        background: "#1e1e2e",
                        color: "#6b6b85",
                        border: "1px solid #ffffff10",
                      }}
                    >
                      Coming Soon
                    </span>
                  ) : connected ? (
                    <span className="text-[10px] text-[#6b6b85] font-mono truncate">
                      {handle}
                    </span>
                  ) : (
                    <Link
                      href="/profile"
                      className="text-[10px] font-semibold underline underline-offset-2"
                      style={{ color: PF_PURPLE }}
                    >
                      Add handle
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Section 7: Interview Preparation ──────────────────────── */}
        <section
          className="rounded-3xl p-6"
          style={{ background: "#12121f", border: "1px solid #3B82F620" }}
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#6b6b85]">
              Interview Preparation
            </h2>
            {interviewStats && (
              <span
                className="text-xs font-bold px-3 py-1 rounded-full"
                style={{ background: "#3B82F615", color: "#3B82F6", border: "1px solid #3B82F630" }}
              >
                {interviewStats.overallReadiness}% Ready
              </span>
            )}
          </div>

          {!interviewStats ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 rounded-2xl animate-pulse" style={{ background: "#0a0a18" }} />
              ))}
            </div>
          ) : (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-5">
                {[
                  {
                    label: "Questions Solved",
                    value: interviewStats.questions.solved,
                    sub: `of ${interviewStats.questions.total} total`,
                    color: "#3B82F6",
                  },
                  {
                    label: "Companies Started",
                    value: interviewStats.companies.started,
                    sub: `of ${interviewStats.companies.total} companies`,
                    color: "#60A5FA",
                  },
                  {
                    label: "Topics Completed",
                    value: interviewStats.subjects.completedTopics,
                    sub: `of ${interviewStats.subjects.totalTopics} topics`,
                    color: "#6366F1",
                  },
                  {
                    label: "Readiness",
                    value: `${interviewStats.overallReadiness}%`,
                    sub: "overall score",
                    color: "#818CF8",
                  },
                ].map(({ label, value, sub, color }) => (
                  <div
                    key={label}
                    className="rounded-2xl px-4 py-4 flex flex-col gap-1"
                    style={{ background: "#0a0a18", border: `1px solid ${color}20` }}
                  >
                    <p className="text-[10px] uppercase tracking-widest text-[#6b6b85]">
                      {label}
                    </p>
                    <p className="text-2xl font-black tabular-nums" style={{ color }}>
                      {value}
                    </p>
                    <p className="text-[10px] text-[#6b6b85]">{sub}</p>
                  </div>
                ))}
              </div>

              {/* Progress Bars */}
              <div className="space-y-3 mb-5">
                <div>
                  <div className="flex justify-between text-xs text-[#6b6b85] mb-1.5">
                    <span>Company Questions</span>
                    <span style={{ color: "#3B82F6" }}>
                      {interviewStats.questions.completionPercentage}%
                    </span>
                  </div>
                  <div className="w-full rounded-full h-1.5 overflow-hidden" style={{ background: "#1a1a2e" }}>
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${interviewStats.questions.completionPercentage}%`,
                        background: "#3B82F6",
                      }}
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-xs text-[#6b6b85] mb-1.5">
                    <span>Core Subject Topics</span>
                    <span style={{ color: "#6366F1" }}>
                      {interviewStats.subjects.completionPercentage}%
                    </span>
                  </div>
                  <div className="w-full rounded-full h-1.5 overflow-hidden" style={{ background: "#1a1a2e" }}>
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${interviewStats.subjects.completionPercentage}%`,
                        background: "#6366F1",
                      }}
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </section>

      </div>
    </main>
  );
}