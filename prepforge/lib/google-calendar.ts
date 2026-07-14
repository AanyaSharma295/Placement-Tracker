// lib/google-calendar.ts
//
// Builds a Google Calendar "quick add event" link. This requires no auth,
// no API key, and no OAuth flow — it's the same mechanism as clicking
// "Add to Google Calendar" on any event page. The user's browser handles
// the rest (they just need to be logged into Google in that tab).

import type { PlatformContest } from "./services/contests";

const PLATFORM_LABEL: Record<PlatformContest["platform"], string> = {
  codeforces: "Codeforces",
  leetcode: "LeetCode",
};

function toGCalTimestamp(unixSeconds: number): string {
  // Google Calendar wants UTC in the form YYYYMMDDTHHMMSSZ
  return (
    new Date(unixSeconds * 1000)
      .toISOString()
      .replace(/[-:]/g, "")
      .split(".")[0] + "Z"
  );
}

export function buildGoogleCalendarLink(contest: PlatformContest): string {
  const start = toGCalTimestamp(contest.startTime);
  const end = toGCalTimestamp(contest.startTime + contest.durationSeconds);

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `${contest.name} (${PLATFORM_LABEL[contest.platform]})`,
    dates: `${start}/${end}`,
    details: `Contest link: ${contest.url}\n\nAdded from PrepForge.`,
    location: contest.url,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}