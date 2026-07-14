"use client";

// components/contests/ContestCalendar.tsx
//
// Month-grid contest calendar. Fetches once from /api/contests, then does
// all month navigation and day-selection client-side (no refetch on nav).
// Styled to match the existing PrepForge dark theme / color language:
// purple accent (#8B5CF6), CF green (#a8ff78), LC orange (#FFA116).

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

function formatTime(unixSeconds: number) {
  return new Date(unixSeconds * 1000).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

const WEEKDAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

export default function ContestCalendar() {
  const [contests, setContests] = useState<PlatformContest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cursor, setCursor] = useState(() => new Date());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

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
  const selectedContests = selectedDay ? contestsByDay.get(selectedDay) ?? [] : [];

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
            onClick={() => {
              setCursor(new Date());
              setSelectedDay(null);
            }}
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
            {WEEKDAY_LABELS.map((d, i) => (
              <div key={i} className="text-center text-xs text-[#6b6b85]">
                {d}
              </div>
            ))}
          </div>

          {/* Day grid */}
          <div className="grid grid-cols-7 gap-1">
            {cells.map((date, i) => {
              if (!date) return <div key={`empty-${i}`} />;

              const key = date.toDateString();
              const dayContests = contestsByDay.get(key) ?? [];
              const isToday = key === todayKey;
              const isSelected = key === selectedDay;

              return (
                <button
                  key={key}
                  disabled={dayContests.length === 0}
                  onClick={() => setSelectedDay(isSelected ? null : key)}
                  className={`flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border text-sm transition-colors
                    ${isSelected ? "border-[#8B5CF6]" : "border-transparent"}
                    ${isToday ? "bg-[#8B5CF6]/10" : ""}
                    ${dayContests.length ? "cursor-pointer hover:bg-white/5" : "cursor-default"}
                  `}
                >
                  <span className="text-slate-100">{date.getDate()}</span>
                  {dayContests.length > 0 && (
                    <div className="flex gap-0.5">
                      {dayContests.slice(0, 3).map((c) => (
                        <span
                          key={c.id}
                          className="h-1.5 w-1.5 rounded-full"
                          style={{ background: PLATFORM_COLOR[c.platform] }}
                        />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Selected day detail */}
          {selectedContests.length > 0 && (
            <div className="mt-5 space-y-2 border-t border-[#8B5CF6]/10 pt-4">
              {selectedContests.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between rounded-lg bg-[#0a0a18] p-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ background: PLATFORM_COLOR[c.platform] }}
                      />
                      <a
                        href={c.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-slate-100 hover:underline"
                      >
                        {c.name}
                      </a>
                    </div>
                    <p className="mt-0.5 text-xs text-[#6b6b85]">
                      {PLATFORM_LABEL[c.platform]} · {formatTime(c.startTime)} ·{" "}
                      {Math.round(c.durationSeconds / 60)} min
                    </p>
                  </div>
                  <a
                    href={buildGoogleCalendarLink(c)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="whitespace-nowrap rounded-md bg-[#8B5CF6] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#7c4de0]"
                  >
                    + Google Calendar
                  </a>
                </div>
              ))}
            </div>
          )}

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