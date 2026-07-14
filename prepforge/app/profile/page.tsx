"use client";

import { useState, useEffect } from "react";
import { useUser, UserButton } from "@clerk/nextjs";

type XPBreakdown = {
  leetcode: number;
  codeforces: number;
  companyQuestions: number;
  revisionTopics: number;
  total: number;
};

export default function ProfilePage() {
  const { user } = useUser();
  const [handles, setHandles] = useState({
    codeforces: "",
    leetcode: "",
    atcoder: "",
    hackerrank: "",
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [message, setMessage] = useState("");

  const [xp, setXp] = useState<XPBreakdown | null>(null);
  const [xpLoading, setXpLoading] = useState(true);

  useEffect(() => {
    const fetchHandles = async () => {
      try {
        const res = await fetch("/api/profile/handles");
        const data = await res.json();
        if (data.handles) {
          setHandles({
            codeforces: data.handles.codeforces ?? "",
            leetcode: data.handles.leetcode ?? "",
            atcoder: data.handles.atcoder ?? "",
            hackerrank: data.handles.hackerrank ?? "",
          });
        }
      } catch {
        console.error("Failed to fetch handles");
      } finally {
        setFetching(false);
      }
    };
    fetchHandles();
  }, []);

  useEffect(() => {
    const fetchXP = async () => {
      try {
        const res = await fetch("/api/profile/xp");
        const data = await res.json();
        if (res.ok) {
          setXp(data);
        }
      } catch {
        console.error("Failed to fetch XP");
      } finally {
        setXpLoading(false);
      }
    };
    fetchXP();
  }, []);

  const handleSubmit = async () => {
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/profile/handles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(handles),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("✅ Handles saved successfully!");
      } else {
        setMessage("❌ Error: " + data.error);
      }
    } catch {
      setMessage("❌ Something went wrong.");
    }
    setLoading(false);
  };

  const platforms = [
    {
      key: "codeforces",
      label: "Codeforces",
      placeholder: "e.g. tourist",
      hint: "Optional — add if you use Codeforces",
      ring: "focus:ring-blue-500",
    },
    {
      key: "leetcode",
      label: "LeetCode",
      placeholder: "e.g. neal_wu",
      hint: "Optional — add if you use LeetCode",
      ring: "focus:ring-yellow-500",
    },
    {
      key: "atcoder",
      label: "AtCoder",
      placeholder: "e.g. tourist",
      hint: "Optional — add if you use AtCoder",
      ring: "focus:ring-green-500",
    },
    {
      key: "hackerrank",
      label: "HackerRank",
      placeholder: "e.g. yourhandle",
      hint: "Optional — add if you use HackerRank",
      ring: "focus:ring-green-400",
    },
  ];

  if (fetching) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <p className="text-gray-400">Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center px-4 relative">

      {/* Top bar */}
      <div className="absolute top-4 right-4">
        <UserButton />
      </div>

      {/* Header */}
      <div className="mb-4 text-center">
        <h1 className="text-3xl font-bold mb-1">Your Profile</h1>
        <p className="text-gray-400">
          Welcome, {user?.firstName ?? "there"}! Connect the platforms you use.
        </p>
        <p className="text-gray-600 text-sm mt-1">
          All fields are optional — fill in only what you use.
        </p>
      </div>

      {/* XP Display */}
      <div className="mb-8 bg-gray-800 rounded-2xl px-8 py-4 text-center">
        {xpLoading ? (
          <p className="text-gray-500 text-sm">Loading XP...</p>
        ) : xp ? (
          <>
            <p className="text-3xl font-bold text-purple-400">{xp.total.toLocaleString()} XP</p>
            <p className="text-xs text-gray-500 mt-1">
              {xp.leetcode} LeetCode · {xp.codeforces} Contests · {xp.companyQuestions} Companies ·{" "}
              {xp.revisionTopics} Revision
            </p>
          </>
        ) : (
          <p className="text-gray-500 text-sm">Couldn't load XP</p>
        )}
      </div>

      {/* Form */}
      <div className="bg-gray-800 rounded-2xl p-8 w-full max-w-md flex flex-col gap-5">

        {platforms.map((platform) => (
          <div key={platform.key}>
            <label className="text-sm text-gray-400 mb-1 block">
              {platform.label}
            </label>
            <input
              type="text"
              placeholder={platform.placeholder}
              value={handles[platform.key as keyof typeof handles]}
              onChange={(e) =>
                setHandles({ ...handles, [platform.key]: e.target.value })
              }
              className={`w-full bg-gray-700 text-white rounded-lg px-4 py-3 outline-none focus:ring-2 ${platform.ring}`}
            />
            <p className="text-xs text-gray-600 mt-1">{platform.hint}</p>
          </div>
        ))}

        {message && (
          <p className="text-sm text-center">{message}</p>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-3 rounded-lg transition"
        >
          {loading ? "Saving..." : "Save Handles"}
        </button>

        <p className="text-xs text-gray-600 text-center">
          You can update these anytime from your profile.
        </p>
      </div>
    </div>
  );
}