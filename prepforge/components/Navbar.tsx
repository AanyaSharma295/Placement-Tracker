"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import {
  LayoutDashboard,
  Building2,
  BookOpen,
  Trophy,
  User,
  Calendar,
  ChevronDown,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";

const CONTEST_ITEMS = [
  {
    label: "Codeforces",
    href: "/contest/codeforces",
    color: "#a8ff78",
    status: "live",
  },
  {
    label: "LeetCode",
    href: "/contest/leetcode",
    color: "#FFA116",
    status: "live",
  },
  {
    label: "AtCoder",
    href: "/contest/atcoder",
    color: "#6b6b85",
    status: "soon",
  },
  {
    label: "HackerRank",
    href: "/contest/hackerrank",
    color: "#6b6b85",
    status: "soon",
  },
];

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Companies", href: "/companies", icon: Building2 },
  { label: "Subjects", href: "/subjects", icon: BookOpen },
  { label: "Profile", href: "/profile", icon: User },
];

function getActiveColor(href: string) {
  if (href === "/companies") return { bg: "#3B82F615", color: "#3B82F6" };
  if (href === "/subjects") return { bg: "#6366F115", color: "#6366F1" };
  if (href === "/contest/calendar") return { bg: "#8B5CF615", color: "#8B5CF6" };
  return { bg: "#8B5CF615", color: "#8B5CF6" };
}

export default function Navbar() {
  const pathname = usePathname();
  const [contestOpen, setContestOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setContestOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  if (
    pathname === "/" ||
    pathname?.startsWith("/sign-in") ||
    pathname?.startsWith("/sign-up")
  ) {
    return null;
  }

  const contestActive =
    pathname?.startsWith("/contest") && pathname !== "/contest/calendar";
  const calendarActive = pathname === "/contest/calendar";

  return (
    <nav
      className="sticky top-0 z-50 w-full border-b"
      style={{ background: "#0a0a18", borderColor: "#ffffff0a" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">

          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2 flex-shrink-0">
            <span className="text-lg font-black tracking-tight" style={{ color: "#8B5CF6" }}>
              PrepForge
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
              const active =
                href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname?.startsWith(href);
              const { bg, color } = getActiveColor(href);

              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                    ${active ? "text-white" : "text-[#6b6b85] hover:text-white hover:bg-white/5"}`}
                  style={active ? { background: bg, color } : {}}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </Link>
              );
            })}

            {/* Contests Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setContestOpen((o) => !o)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                  ${contestActive ? "text-white" : "text-[#6b6b85] hover:text-white hover:bg-white/5"}`}
                style={
                  contestActive
                    ? { background: "#a8ff7815", color: "#a8ff78" }
                    : {}
                }
              >
                <Trophy className="w-3.5 h-3.5" />
                Contests
                <ChevronDown
                  className={`w-3 h-3 transition-transform ${contestOpen ? "rotate-180" : ""}`}
                />
              </button>

              {contestOpen && (
                <div
                  className="absolute top-full mt-1.5 left-0 w-48 rounded-xl border py-1.5 shadow-2xl"
                  style={{ background: "#12121f", borderColor: "#ffffff10" }}
                >
                  {CONTEST_ITEMS.map(({ label, href, color, status }) => (
                    <div key={href}>
                      {status === "soon" ? (
                        <div className="flex items-center justify-between px-3 py-2 opacity-40 cursor-not-allowed">
                          <div className="flex items-center gap-2">
                            <span
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ background: color }}
                            />
                            <span className="text-xs text-[#6b6b85]">{label}</span>
                          </div>
                          <span className="text-[10px] text-[#6b6b85] bg-[#1a1a2e] px-1.5 py-0.5 rounded">
                            Soon
                          </span>
                        </div>
                      ) : (
                        <Link
                          href={href}
                          onClick={() => setContestOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 hover:bg-white/5 transition-colors"
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{
                              background: color,
                              boxShadow: `0 0 4px ${color}`,
                            }}
                          />
                          <span className="text-xs text-white">{label}</span>
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Calendar — standalone, next to Contests */}
            <Link
              href="/contest/calendar"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                ${calendarActive ? "text-white" : "text-[#6b6b85] hover:text-white hover:bg-white/5"}`}
              style={calendarActive ? { background: "#8B5CF615", color: "#8B5CF6" } : {}}
            >
              <Calendar className="w-3.5 h-3.5" />
              Calendar
            </Link>
          </div>

          {/* Right: User */}
          <div className="flex items-center gap-3">
            <UserButton />
          </div>
        </div>

        {/* Mobile Nav */}
        <div className="md:hidden flex items-center gap-1 pb-2 overflow-x-auto scrollbar-hide">
          {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
            const active =
              href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname?.startsWith(href);
            const { bg, color } = getActiveColor(href);

            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all
                  ${active ? "text-white" : "text-[#6b6b85] hover:text-white"}`}
                style={active ? { background: bg, color } : {}}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </Link>
            );
          })}

          {/* Mobile Contests */}
          {CONTEST_ITEMS.filter((c) => c.status === "live").map(
            ({ label, href, color }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all
                  ${pathname?.startsWith(href) ? "text-white" : "text-[#6b6b85] hover:text-white"}`}
                style={
                  pathname?.startsWith(href)
                    ? { background: `${color}15`, color }
                    : {}
                }
              >
                <Trophy className="w-3.5 h-3.5" />
                {label}
              </Link>
            )
          )}

          {/* Mobile Calendar */}
          <Link
            href="/contest/calendar"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all
              ${calendarActive ? "text-white" : "text-[#6b6b85] hover:text-white"}`}
            style={calendarActive ? { background: "#8B5CF615", color: "#8B5CF6" } : {}}
          >
            <Calendar className="w-3.5 h-3.5" />
            Calendar
          </Link>
        </div>
      </div>
    </nav>
  );
}