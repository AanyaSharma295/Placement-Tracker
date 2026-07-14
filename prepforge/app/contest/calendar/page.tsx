// app/contest/calendar/page.tsx

import ContestCalendar from "@/components/contests/ContestCalendar";

export default function ContestCalendarPage() {
  return (
    <main className="min-h-screen bg-[#0a0a18] px-4 py-10">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-100">Contest Calendar</h1>
          <p className="mt-1 text-sm text-[#6b6b85]">
            Upcoming Codeforces and LeetCode contests. Click a day to see details and add it to
            your Google Calendar.
          </p>
        </div>

        <ContestCalendar />
      </div>
    </main>
  );
}