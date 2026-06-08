"use client";

import { useState } from "react";
import {
  Bookmark,
  BookmarkCheck,
  ChevronDown,
  ChevronUp,
  MessageSquare,
} from "lucide-react";

interface TheoryQuestion {
  id: string;
  question: string;
  difficulty: string;
  frequency: string;
  companies: string[];
  interviewerNote?: string | null;
  status: string;
  bookmarked: boolean;
}

const DIFFICULTY_STYLES = {
  Easy: "bg-green-500/10 text-green-400 border border-green-500/20",
  Medium: "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20",
  Hard: "bg-red-500/10 text-red-400 border border-red-500/20",
};

const FREQUENCY_STYLES = {
  High: "bg-red-500/10 text-red-400 border border-red-500/20",
  Medium: "bg-orange-500/10 text-orange-400 border border-orange-500/20",
  Low: "bg-gray-500/10 text-gray-400 border border-gray-500/20",
};

const STATUS_OPTIONS = [
  {
    status: "NOT_STARTED",
    label: "Not Started",
    active: "bg-gray-600 text-white border-gray-500",
    inactive: "bg-gray-800 text-gray-500 border-gray-700 hover:border-gray-500",
  },
  {
    status: "REVISED",
    label: "Revised",
    active: "bg-blue-500/20 text-blue-400 border-blue-500/50",
    inactive: "bg-gray-800 text-gray-500 border-gray-700 hover:border-blue-500/50",
  },
  {
    status: "MASTERED",
    label: "Mastered",
    active: "bg-green-500/20 text-green-400 border-green-500/50",
    inactive: "bg-gray-800 text-gray-500 border-gray-700 hover:border-green-500/50",
  },
];

export default function TheoryQuestionCard({
  question,
  onStatusUpdate,
  onBookmarkUpdate,
}: {
  question: TheoryQuestion;
  onStatusUpdate: (id: string, status: string) => void;
  onBookmarkUpdate: (id: string, bookmarked: boolean) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  const [showNote, setShowNote] = useState(false);

  const handleStatus = async (status: string) => {
    if (loading || status === question.status) return;
    setLoading(true);
    try {
      await fetch(`/api/subject-questions/${question.id}/progress`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      onStatusUpdate(question.id, status);
    } finally {
      setLoading(false);
    }
  };

  const handleBookmark = async () => {
    if (bookmarkLoading) return;
    setBookmarkLoading(true);
    try {
      await fetch(`/api/subject-questions/${question.id}/progress`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookmarked: !question.bookmarked }),
      });
      onBookmarkUpdate(question.id, !question.bookmarked);
    } finally {
      setBookmarkLoading(false);
    }
  };

  return (
    <div
      className={`bg-gray-800 border rounded-2xl p-5 transition-all duration-200
        ${question.status === "MASTERED"
          ? "border-green-500/30"
          : question.status === "REVISED"
          ? "border-blue-500/30"
          : "border-gray-700 hover:border-gray-600"
        }`}
    >
      {/* Header Row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <p className="text-sm font-medium text-white leading-relaxed flex-1">
          {question.question}
        </p>
        <button
          onClick={handleBookmark}
          disabled={bookmarkLoading}
          className="flex-shrink-0 mt-0.5 text-gray-500 hover:text-yellow-400 transition-colors"
        >
          {question.bookmarked ? (
            <BookmarkCheck className="w-4 h-4 text-yellow-400" />
          ) : (
            <Bookmark className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Tags Row */}
      <div className="flex flex-wrap gap-2 mb-4">
        <span
          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
            DIFFICULTY_STYLES[question.difficulty as keyof typeof DIFFICULTY_STYLES] ??
            "bg-gray-700 text-gray-400"
          }`}
        >
          {question.difficulty}
        </span>
        <span
          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
            FREQUENCY_STYLES[question.frequency as keyof typeof FREQUENCY_STYLES] ??
            "bg-gray-700 text-gray-400"
          }`}
        >
          {question.frequency} Frequency
        </span>
      </div>

      {/* Company Tags */}
      {question.companies.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {question.companies.map((company) => (
            <span
              key={company}
              className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
            >
              {company}
            </span>
          ))}
        </div>
      )}

      {/* Interviewer Note */}
      {question.interviewerNote && (
        <div className="mb-4">
          <button
            onClick={() => setShowNote((p) => !p)}
            className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Interviewer Follow-up
            {showNote ? (
              <ChevronUp className="w-3 h-3" />
            ) : (
              <ChevronDown className="w-3 h-3" />
            )}
          </button>
          {showNote && (
            <div className="mt-2 p-3 rounded-xl bg-amber-500/5 border border-amber-500/20">
              <p className="text-xs text-amber-300 leading-relaxed italic">
                "{question.interviewerNote}"
              </p>
            </div>
          )}
        </div>
      )}

      {/* Status Pills */}
      <div className="flex gap-1.5">
        {STATUS_OPTIONS.map(({ status, label, active, inactive }) => (
          <button
            key={status}
            onClick={() => handleStatus(status)}
            disabled={loading}
            className={`text-xs px-3 py-1 rounded-full border font-medium transition-all
              ${question.status === status ? active : inactive}
              ${loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}