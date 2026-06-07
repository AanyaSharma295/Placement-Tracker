"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link"; // Imported for optimized internal routing
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface LCDashboardData {
  username: string;
  ranking: number;
  totalSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  totalSubmissions: number;
  acceptanceRate: number;
}

function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-md bg-[#1c1c20] ${className}`} />
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
    <div
      className="flex flex-col gap-1 rounded-2xl px-5 py-4"
      style={{
        background: "#151518",
        border: "1px solid rgba(255,161,22,0.18)",
      }}
    >
      <span className="text-[11px] uppercase tracking-widest text-[#7a7a85] font-medium">
        {label}
      </span>
      <span
        className="text-2xl font-black tabular-nums leading-none"
        style={{ color: color ?? (accent ? "#FFA116" : "#FFFFFF") }}
      >
        {value}
      </span>
    </div>
  );
}

const COLORS = {
  easy: "#00C4B4",
  medium: "#FFC01E",
  hard: "#FF375F",
};

function DifficultyTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0];
  return (
    <div
      className="rounded-xl px-4 py-3 shadow-2xl"
      style={{
        background: "#151518",
        border: "1px solid rgba(255,161,22,0.25)",
      }}
    >
      <p className="text-xs text-[#7a7a85] mb-1">{name}</p>
      <p className="font-bold text-lg text-[#FFA116]">{value}</p>
    </div>
  );
}

export default function LeetCodeDashboard() {
  const { user: clerkUser, isLoaded } = useUser();
  const [data, setData] = useState<LCDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lcHandle, setLcHandle] = useState<string | null>(null);
  const [lastSynced, setLastSynced] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded || !clerkUser) return;

    async function loadHandle() {
      try {
        const res = await fetch("/api/profile/handles");
        if (!res.ok) throw new Error("Could not load profile handles.");
        const json = await res.json();
        const handle: string | null = json?.handles?.leetcode ?? null;
        if (!handle) {
          setError("No LeetCode handle found. Please add one in your Profile settings.");
          setLoading(false);
          return;
        }
        setLcHandle(handle);
      } catch (e: any) {
        setError(e.message ?? "Failed to load handles.");
        setLoading(false);
      }
    }

    loadHandle();
  }, [isLoaded, clerkUser]);

  useEffect(() => {
    if (!lcHandle) return;
    syncAndFetch();
  }, [lcHandle]);

  async function syncAndFetch() {
    setLoading(true);
    setError(null);
    try {
      await fetch("/api/leetcode/sync", { method: "POST" });
      const res = await fetch(`/api/leetcode/${encodeURIComponent(lcHandle!)}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to fetch LeetCode data.");
      setData(json);
      setLastSynced(new Date().toLocaleTimeString());
    } catch (e: any) {
      setError(e.message ?? "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }

  async function handleRefresh() {
    if (!lcHandle || syncing) return;
    setSyncing(true);
    setError(null);
    try {
      const syncRes = await fetch("/api/leetcode/sync", { method: "POST" });
      const syncJson = await syncRes.json();
      if (!syncRes.ok) throw new Error(syncJson.error ?? "Sync failed.");
      const res = await fetch(`/api/leetcode/${encodeURIComponent(lcHandle!)}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to fetch data.");
      setData(json);
      setLastSynced(new Date().toLocaleTimeString());
    } catch (e: any) {
      setError(e.message ?? "Refresh failed.");
    } finally {
      setSyncing(false);
    }
  }

  if (!isLoaded || loading) {
    return (
      <main
        className="min-h-screen px-4 py-10 md:px-10"
        style={{ background: "#0B0B0D" }}
      >
        <div className="mb-10 flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          <Skeleton className="h-32 rounded-3xl" />
          <Skeleton className="h-32 rounded-3xl" />
          <Skeleton className="h-32 rounded-3xl" />
          <Skeleton className="h-32 rounded-3xl" />
        </div>
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          <Skeleton className="h-80 rounded-3xl" />
          <Skeleton className="h-80 rounded-3xl" />
        </div>
      </main>
    );
  }

  // Error state — FIXED broken <a> tag syntax and integrated Next.js Link
  if (error) {
    return (
      <main
        className="min-h-screen flex items-center justify-center px-4"
        style={{ background: "#0B0B0D" }}
      >
        <div
          className="max-w-md w-full rounded-3xl p-10 text-center shadow-2xl"
          style={{
            background: "#151518",
            border: "1px solid rgba(255,100,100,0.2)",
          }}
        >
          <h2 className="mb-3 text-xl font-bold text-red-300">
            Something went wrong
          </h2>
          <p className="text-sm text-[#7a7a85] leading-relaxed">{error}</p>
          
          <Link
            href="/profile"
            className="mt-8 inline-block rounded-xl px-6 py-3 text-sm font-semibold transition"
            style={{
              background: "rgba(255,161,22,0.1)",
              border: "1px solid rgba(255,161,22,0.2)",
              color: "#FFA116",
            }}
          >
            Go to Profile
          </Link>
        </div>
      </main>
    );
  }

  if (!data) return null;

  const pieData = [
    { name: "Easy", value: data.easySolved },
    { name: "Medium", value: data.mediumSolved },
    { name: "Hard", value: data.hardSolved },
  ];

  const totalProblems = 3500;
  const solvedPercent = Math.round((data.totalSolved / totalProblems) * 100);

  return (
    <main
      className="min-h-screen px-4 py-10 md:px-10"
      style={{ background: "#0B0B0D" }}
    >
      {/* Header */}
      <header className="mb-10 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{
                background: "#FFA116",
                boxShadow: "0 0 8px rgba(255,161,22,0.6)",
              }}
            />
            <span className="text-xs uppercase tracking-widest text-[#7a7a85]">
              LeetCode · Live
            </span>
            {lastSynced && (
              <span className="text-xs text-[#7a7a85]">
                · Synced at {lastSynced}
              </span>
            )}
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            {data.username}
            <span className="ml-3 text-lg font-normal" style={{ color: "#FFA116" }}>
              #{data.ranking.toLocaleString()}
            </span>
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={syncing}
            className="rounded-xl px-5 py-2.5 text-sm font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: syncing ? "rgba(255,161,22,0.1)" : "#FFA116",
              color: syncing ? "#FFA116" : "#111111",
              border: "1px solid rgba(255,161,22,0.3)",
            }}
          >
            {syncing ? "Syncing..." : "Refresh"}
          </button>
          
          {/* External Redirect — FIXED broken <a> tag syntax */}
          <a
            href={`https://leetcode.com/${data.username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl px-5 py-2.5 text-sm font-medium transition"
            style={{
              background: "#151518",
              border: "1px solid rgba(255,161,22,0.18)",
              color: "#FFA116",
            }}
          >
            View on LeetCode
          </a>
        </div>
      </header>

      {/* Card 1 — Profile Summary */}
      <section
        className="mb-6 rounded-3xl p-6 md:p-8"
        style={{
          background: "#111114",
          border: "1px solid rgba(255,161,22,0.18)",
        }}
      >
        <h2 className="mb-5 text-xs font-bold uppercase tracking-widest text-[#7a7a85]">
          Profile Summary
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div
            className="col-span-2 sm:col-span-1 rounded-2xl px-6 py-5"
            style={{
              background: "#0B0B0D",
              border: "1px solid rgba(255,161,22,0.18)",
            }}
          >
            <p className="text-[11px] uppercase tracking-widest text-[#7a7a85] mb-1">
              Total Solved
            </p>
            <p className="text-4xl font-black tabular-nums text-[#FFA116]">
              {data.totalSolved}
            </p>
          </div>
          <StatBadge
            label="Ranking"
            value={`#${data.ranking.toLocaleString()}`}
            color="#FFB648"
          />
          <StatBadge
            label="Acceptance Rate"
            value={`${data.acceptanceRate}%`}
          />
          <StatBadge
            label="Total Submissions"
            value={data.totalSubmissions.toLocaleString()}
          />
        </div>
      </section>

      {/* Card 2 — Difficulty Breakdown */}
      <section
        className="mb-6 rounded-3xl p-6 md:p-8"
        style={{
          background: "#111114",
          border: "1px solid rgba(255,161,22,0.18)",
        }}
      >
        <h2 className="mb-5 text-xs font-bold uppercase tracking-widest text-[#7a7a85]">
          Difficulty Breakdown
        </h2>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Easy", value: data.easySolved, color: COLORS.easy },
            { label: "Medium", value: data.mediumSolved, color: COLORS.medium },
            { label: "Hard", value: data.hardSolved, color: COLORS.hard },
          ].map(({ label, value, color }) => (
            <div
              key={label}
              className="rounded-2xl px-5 py-5 text-center"
              style={{
                background: "#0B0B0D",
                border: `1px solid ${color}30`,
              }}
            >
              <p
                className="text-[11px] uppercase tracking-widest mb-2 font-bold"
                style={{ color }}
              >
                {label}
              </p>
              <p className="text-4xl font-black tabular-nums" style={{ color }}>
                {value}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Cards 3 & 4 */}
      <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">

        {/* Card 3 — Pie Chart */}
        <section
          className="rounded-3xl p-6 md:p-8"
          style={{
            background: "#111114",
            border: "1px solid rgba(255,161,22,0.18)",
          }}
        >
          <h2 className="mb-6 text-xs font-bold uppercase tracking-widest text-[#7a7a85]">
            Solved Breakdown
          </h2>
          <div className="relative">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={75}
                  outerRadius={110}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={entry.name}
                      fill={Object.values(COLORS)[index]}
                    />
                  ))}
                </Pie>
                <Tooltip content={<DifficultyTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <p className="text-4xl font-black text-white">
                {data.totalSolved}
              </p>
              <p className="text-xs uppercase tracking-widest text-[#7a7a85]">
                solved
              </p>
            </div>
          </div>
          <div className="mt-4 flex justify-center gap-6">
            {pieData.map((entry, i) => (
              <div key={entry.name} className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: Object.values(COLORS)[i] }}
                />
                <span className="text-xs text-[#7a7a85]">{entry.name}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Card 4 — Progress Bars */}
        <section
          className="rounded-3xl p-6 md:p-8"
          style={{
            background: "#111114",
            border: "1px solid rgba(255,161,22,0.18)",
          }}
        >
          <h2 className="mb-6 text-xs font-bold uppercase tracking-widest text-[#7a7a85]">
            Overall Progress
          </h2>
          <div className="space-y-6">
            {[
              { label: "Easy", solved: data.easySolved, total: 850, color: COLORS.easy },
              { label: "Medium", solved: data.mediumSolved, total: 1800, color: COLORS.medium },
              { label: "Hard", solved: data.hardSolved, total: 850, color: COLORS.hard },
            ].map(({ label, solved, total, color }) => {
              const pct = Math.min(100, Math.round((solved / total) * 100));
              return (
                <div key={label}>
                  <div className="flex justify-between mb-2">
                    <span
                      className="text-xs font-bold uppercase tracking-widest"
                      style={{ color }}
                    >
                      {label}
                    </span>
                    <span className="text-xs text-[#7a7a85] tabular-nums">
                      {solved} / {total}
                    </span>
                  </div>
                  <div
                    className="h-2 rounded-full overflow-hidden"
                    style={{ background: "#1c1c20" }}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, backgroundColor: color }}
                    />
                  </div>
                </div>
              );
            })}

            <div
              className="mt-6 rounded-2xl px-5 py-4"
              style={{
                background: "#0B0B0D",
                border: "1px solid rgba(255,161,22,0.18)",
              }}
            >
              <p className="text-[11px] uppercase tracking-widest text-[#7a7a85] mb-1">
                Overall Progress
              </p>
              <p className="text-2xl font-black text-[#FFA116]">
                {solvedPercent}%
                <span className="ml-2 text-sm font-normal text-[#7a7a85]">
                  of ~{totalProblems.toLocaleString()} problems
                </span>
              </p>
            </div>
          </div>
        </section>
      </div>

      <p className="text-center text-[10px] text-[#3a3a45] tracking-widest uppercase">
        Data sourced from the LeetCode GraphQL API. Cached for 5 minutes.
      </p>
    </main>
  );
}