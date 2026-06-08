"use client";

import { useState } from "react";
import { Bookmark, BookmarkCheck, CheckCircle2, XCircle } from "lucide-react";

interface MCQQuestion {
  id: string;
  question: string;
  difficulty: string;
  frequency: string;
  companies: string[];
  options: string[];
  correctOption: number | null;
  explanation: string | null;
  bookmarked: boolean;
  attempted: boolean;
  selectedOption: number | null;
  isCorrect: boolean | null;
}

const DIFFICULTY_STYLES: Record<string, string> = {
  Easy: "bg-green-500/10 text-green-400 border border-green-500/20",
  Medium: "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20",
  Hard: "bg-red-500/10 text-red-400 border border-red-500/20",
};

const FREQUENCY_STYLES: Record<string, string> = {
  High: "bg-red-500/10 text-red-400 border border-red-500/20",
  Medium: "bg-orange-500/10 text-orange-400 border border-orange-500/20",
  Low: "bg-gray-500/10 text-gray-400 border border-gray-500/20",
};

export default function MCQCard({
  question,
  onAttempt,
  onBookmarkUpdate,
}: {
  question: MCQQuestion;
  onAttempt: (id: string, selectedOption: number, isCorrect: boolean, correctOption: number) => void;
  onBookmarkUpdate: (id: string, bookmarked: boolean) => void;
}) {
  const [selected, setSelected] = useState<number | null>(question.selectedOption);
  const [revealed, setRevealed] = useState(question.attempted);
  const [correctAnswer, setCorrectAnswer] = useState<number | null>(
    question.attempted ? question.correctOption : null
  );
  const [isCorrect, setIsCorrect] = useState<boolean | null>(question.isCorrect);
  const [submitting, setSubmitting] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);

  const handleSubmit = async () => {
    if (selected === null || submitting || revealed) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/subject-questions/${question.id}/attempt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selectedOption: selected }),
      });
      const data = await res.json();
      setCorrectAnswer(data.correctOption);
      setIsCorrect(data.isCorrect);
      setRevealed(true);
      onAttempt(question.id, selected, data.isCorrect, data.correctOption);
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
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

  function getOptionStyle(index: number): string {
    if (!revealed) {
      // Before submission
      return selected === index
        ? "border-indigo-500 bg-indigo-500/15 text-white"
        : "border-gray-600 bg-gray-700/40 text-gray-300 hover:border-gray-500 hover:bg-gray-700/60";
    }
    // After submission
    if (index === correctAnswer) {
      return "border-green-500 bg-green-500/15 text-green-300";
    }
    if (index === selected && index !== correctAnswer) {
      return "border-red-500 bg-red-500/15 text-red-300";
    }
    return "border-gray-700 bg-gray-700/20 text-gray-500";
  }

  return (
    <div className={`bg-gray-800 border rounded-2xl p-5 transition-all duration-200
      ${revealed
        ? isCorrect ? "border-green-500/30" : "border-red-500/30"
        : "border-gray-700 hover:border-gray-600"
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
          MCQ
        </span>
        <button
          onClick={handleBookmark}
          disabled={bookmarkLoading}
          className="text-gray-500 hover:text-yellow-400 transition-colors"
        >
          {question.bookmarked
            ? <BookmarkCheck className="w-4 h-4 text-yellow-400" />
            : <Bookmark className="w-4 h-4" />
          }
        </button>
      </div>

      {/* Question */}
      <p className="text-sm font-medium text-white leading-relaxed mb-4">
        {question.question}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${DIFFICULTY_STYLES[question.difficulty] ?? "bg-gray-700 text-gray-400"}`}>
          {question.difficulty}
        </span>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${FREQUENCY_STYLES[question.frequency] ?? "bg-gray-700 text-gray-400"}`}>
          {question.frequency} Frequency
        </span>
      </div>

      {/* Options */}
      <div className="space-y-2 mb-4">
        {question.options.map((option, index) => (
          <button
            key={index}
            onClick={() => !revealed && setSelected(index)}
            disabled={revealed}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all duration-150
              ${getOptionStyle(index)}
              ${!revealed ? "cursor-pointer" : "cursor-default"}`}
          >
            {/* Radio */}
            <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center
              ${revealed && index === correctAnswer ? "border-green-400"
                : revealed && index === selected && index !== correctAnswer ? "border-red-400"
                : selected === index ? "border-indigo-400"
                : "border-gray-500"}`}
            >
              {!revealed && selected === index && (
                <div className="w-2 h-2 rounded-full bg-indigo-400" />
              )}
              {revealed && index === correctAnswer && (
                <div className="w-2 h-2 rounded-full bg-green-400" />
              )}
              {revealed && index === selected && index !== correctAnswer && (
                <div className="w-2 h-2 rounded-full bg-red-400" />
              )}
            </div>

            <span className="text-sm flex-1">{option}</span>

            {revealed && index === correctAnswer && (
              <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
            )}
            {revealed && index === selected && index !== correctAnswer && (
              <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            )}
          </button>
        ))}
      </div>

      {/* Submit Button */}
      {!revealed && (
        <button
          onClick={handleSubmit}
          disabled={selected === null || submitting}
          className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all
            ${selected !== null
              ? "bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer"
              : "bg-gray-700 text-gray-500 cursor-not-allowed"
            }`}
        >
          {submitting ? "Checking..." : "Check Answer"}
        </button>
      )}

      {/* Result Banner */}
      {revealed && (
        <div className={`mt-3 p-4 rounded-xl border ${isCorrect ? "bg-green-500/5 border-green-500/20" : "bg-red-500/5 border-red-500/20"}`}>
          <div className="flex items-center gap-2 mb-1">
            {isCorrect
              ? <><CheckCircle2 className="w-4 h-4 text-green-400" /><span className="text-sm font-semibold text-green-400">Correct!</span></>
              : <><XCircle className="w-4 h-4 text-red-400" /><span className="text-sm font-semibold text-red-400">Incorrect</span></>
            }
          </div>
          {!isCorrect && correctAnswer !== null && (
            <p className="text-xs text-gray-300 mb-1">
              Correct answer: <span className="text-green-400 font-medium">"{question.options[correctAnswer]}"</span>
            </p>
          )}
          {question.explanation && (
            <p className="text-xs text-gray-400 leading-relaxed mt-1">
              {question.explanation}
            </p>
          )}
        </div>
      )}

      {/* Company Tags */}
      {question.companies.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {question.companies.map((company) => (
            <span key={company} className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              {company}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}