"use client";

// components/contests/ContestCalendar.tsx
//
// Month-grid contest calendar, Google-Calendar style: events render as
// inline pills directly inside each day cell, and days with contests get
// a highlighted background so they stand out at a glance. Clicking a pill
// opens a prefilled "Add to Google Calendar" link in a new tab.

import { useEffect, useMemo, useState } from "react";
import { buildGoogleCalendarLink } from "@/lib/google-calendar";
import type { PlatformContest } from "@/lib/services/contests";

const PLATFORM_COLOR: Record<PlatformContest["platform"], string> = {
  codeforces: "#a8ff78",
  leetcode: "#FFA116",
};

const PLATFORM_LABEL: Record<PlatformContest["platform"], string> = {
  codeforces: "Codeforces",
  leetcode: "LeetCode",
};

const MAX_VISIBLE_PER_DAY = 2;

function formatTime(unixSeconds: number) {
  return new Date(unixSeconds * 1000).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

const WEEKDAY_LABELS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

export default function ContestCalendar() {
  const [contests, setContests] = useState<PlatformContest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cursor, setCursor] = useState(() => new Date());

  useEffect(() => {
    let cancelled = false;

    fetch("/api/contests")
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        if (data.error) throw new Error(data.error);
        setContests(data.contests ?? []);
      })
      .catch(() => {
        if (!cancelled) setError("Couldn't load the contest calendar. Try refreshing.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const contestsByDay = useMemo(() => {
    const map = new Map<string, PlatformContest[]>();
    for (const contest of contests) {
      const key = new Date(contest.startTime * 1000).toDateString();
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(contest);
    }
    return map;
  }, [contests]);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const startOffset = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayKey = new Date().toDateString();

  const cells: (Date | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1)),
  ];

  const monthLabel = cursor.toLocaleDateString(undefined, { month: "long", year: "numeric" });

  return (
    <div className="rounded-2xl border border-[#8B5CF6]/20 bg-[#12121f] p-6">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-100">{monthLabel}</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setCursor(new Date(year, month - 1, 1))}
            className="rounded-md border border-[#8B5CF6]/20 bg-[#1a1a2e] px-2.5 py-1 text-sm text-slate-200 hover:bg-[#1a1a2e]/70"
            aria-label="Previous month"
          >
            ←
          </button>
          <button
            onClick={() => setCursor(new Date())}
            className="rounded-md border border-[#8B5CF6]/20 bg-[#1a1a2e] px-2.5 py-1 text-sm text-slate-200 hover:bg-[#1a1a2e]/70"
          >
            Today
          </button>
          <button
            onClick={() => setCursor(new Date(year, month + 1, 1))}
            className="rounded-md border border-[#8B5CF6]/20 bg-[#1a1a2e] px-2.5 py-1 text-sm text-slate-200 hover:bg-[#1a1a2e]/70"
            aria-label="Next month"
          >
            →
          </button>
        </div>
      </div>

      {loading && <p className="py-6 text-center text-sm text-[#6b6b85]">Loading contests…</p>}
      {error && <p className="py-6 text-center text-sm text-red-400">{error}</p>}

      {!loading && !error && (
        <>
          {/* Weekday header */}
          <div className="mb-1 grid grid-cols-7 gap-1">
            {WEEKDAY_LABELS.map((d) => (
              <div key={d} className="text-center text-[10px] font-medium tracking-wide text-[#6b6b85]">
                {d}
              </div>
            ))}
          </div>

          {/* Day grid */}
          <div className="grid grid-cols-7 gap-1">
            {cells.map((date, i) => {
              if (!date) return <div key={`empty-${i}`} className="min-h-[92px]" />;

              const key = date.toDateString();
              const dayContests = contestsByDay.get(key) ?? [];
              const hasContests = dayContests.length > 0;
              const isToday = key === todayKey;
              const visible = dayContests.slice(0, MAX_VISIBLE_PER_DAY);
              const overflowCount = dayContests.length - visible.length;

              return (
                <div
                  key={key}
                  className={`min-h-[92px] rounded-lg border p-1.5 transition-colors
                    ${hasContests ? "border-[#8B5CF6]/40 bg-[#8B5CF6]/[0.07]" : "border-white/5"}
                  `}
                >
                  <div className="mb-1 flex items-center justify-between">
                    <span
                      className={`flex h-5 w-5 items-center justify-center rounded-full text-xs
                        ${isToday ? "bg-[#8B5CF6] font-semibold text-white" : "text-slate-300"}
                      `}
                    >
                      {date.getDate()}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1">
                    {visible.map((c) => (
                      <a
                        key={c.id}
                        href={buildGoogleCalendarLink(c)}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={`${c.name} — click to add to Google Calendar`}
                        className="flex items-center gap-1 truncate rounded px-1 py-0.5 text-[10px] leading-tight hover:brightness-125"
                        style={{
                          background: `${PLATFORM_COLOR[c.platform]}1a`,
                          color: PLATFORM_COLOR[c.platform],
                        }}
                      >
                        <span
                          className="h-1.5 w-1.5 flex-shrink-0 rounded-full"
                          style={{ background: PLATFORM_COLOR[c.platform] }}
                        />
                        <span className="truncate">
                          {formatTime(c.startTime)} {c.name}
                        </span>
                      </a>
                    ))}

                    {overflowCount > 0 && (
                      <span className="px-1 text-[10px] text-[#6b6b85]">
                        +{overflowCount} more
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {contests.length === 0 && (
            <p className="py-4 text-center text-sm text-[#6b6b85]">
              No upcoming contests found right now.
            </p>
          )}
        </>
      )}

      <p className="mt-5 text-center text-xs text-[#6b6b85]">
        AtCoder and HackerRank contest sync — Coming Soon
      </p>
    </div>
  );
}