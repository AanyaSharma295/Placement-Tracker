"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  Search,
  Bookmark,
  Database,
  Code2,
  Monitor,
  Network,
  Table2,
} from "lucide-react";
import TheoryQuestionCard from "@/components/subjects/TheoryQuestionCard";
import MCQCard from "@/components/subjects/MCQCard";
import ReadinessPanel from "@/components/subjects/ReadinessPanel";

interface Question {
  id: string;
  type: string;
  question: string;
  difficulty: string;
  frequency: string;
  companies: string[];
  interviewerNote?: string | null;
  options: string[];
  correctOption: number | null;
  explanation: string | null;
  status: string;
  bookmarked: boolean;
  attempted: boolean;
  selectedOption: number | null;
  isCorrect: boolean | null;
}

interface Analytics {
  totalQuestions: number;
  theoryQuestions: number;
  mcqQuestions: number;
  masteredQuestions: number;
  revisedQuestions: number;
  bookmarkedQuestions: number;
  attemptedMCQs: number;
  correctMCQs: number;
  mcqAccuracy: number;
  readinessScore: number;
}

interface TopicData {
  id: string;
  subject: string;
  slug: string;
  title: string;
  analytics: Analytics;
  companyDistribution: { name: string; count: number }[];
  questions: Question[];
}

type TabType = "ALL" | "THEORY" | "MCQ";
type StatusFilter = "ALL" | "NOT_STARTED" | "REVISED" | "MASTERED";
type DifficultyFilter = "ALL" | "Easy" | "Medium" | "Hard";
type FrequencyFilter = "ALL" | "High" | "Medium" | "Low";
type BookmarkFilter = "ALL" | "BOOKMARKED";

function getConfig(slug: string) {
  if (slug === "dbms") return { icon: Database, color: "text-blue-400", accent: "#3B82F6" };
  if (slug === "oops") return { icon: Code2, color: "text-purple-400", accent: "#A855F7" };
  if (slug === "os") return { icon: Monitor, color: "text-green-400", accent: "#22C55E" };
  if (slug === "cn") return { icon: Network, color: "text-yellow-400", accent: "#EAB308" };
  if (slug === "sql") return { icon: Table2, color: "text-orange-400", accent: "#F97316" };
  return { icon: BookOpen, color: "text-indigo-400", accent: "#6366F1" };
}

export default function TopicDetailPage() {
  const params = useParams();
  const router = useRouter();
  const subject = params.subject as string;
  const topicSlug = params.topicSlug as string;

  const [data, setData] = useState<TopicData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [tab, setTab] = useState<TabType>("ALL");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>("ALL");
  const [frequencyFilter, setFrequencyFilter] = useState<FrequencyFilter>("ALL");
  const [bookmarkFilter, setBookmarkFilter] = useState<BookmarkFilter>("ALL");
  const [companyFilter, setCompanyFilter] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    fetch(`/api/subjects/${subject}/${topicSlug}`)
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setIsLoading(false);
      });
  }, [subject, topicSlug]);

  const handleStatusUpdate = useCallback((id: string, status: string) => {
    setData((prev) => {
      if (!prev) return prev;
      const questions = prev.questions.map((q) =>
        q.id === id ? { ...q, status } : q
      );
      const mastered = questions.filter((q) => q.status === "MASTERED").length;
      const revised = questions.filter((q) => q.status === "REVISED").length;
      const theoryQ = questions.filter((q) => q.type === "THEORY").length;
      const mcqQ = questions.filter((q) => q.type === "MCQ").length;
      const correctMCQs = questions.filter((q) => q.type === "MCQ" && q.isCorrect).length;
      const attemptedMCQs = questions.filter((q) => q.type === "MCQ" && q.attempted).length;
      const mcqAccuracy = attemptedMCQs > 0 ? Math.round((correctMCQs / attemptedMCQs) * 100) : 0;
      const theoryScore = theoryQ > 0 ? (mastered / theoryQ) * 60 : 0;
      const mcqScore = mcqQ > 0 ? (correctMCQs / mcqQ) * 40 : 0;
      return {
        ...prev,
        questions,
        analytics: {
          ...prev.analytics,
          masteredQuestions: mastered,
          revisedQuestions: revised,
          mcqAccuracy,
          readinessScore: Math.round(theoryScore + mcqScore),
        },
      };
    });
  }, []);

  const handleBookmarkUpdate = useCallback((id: string, bookmarked: boolean) => {
    setData((prev) => {
      if (!prev) return prev;
      const questions = prev.questions.map((q) =>
        q.id === id ? { ...q, bookmarked } : q
      );
      return {
        ...prev,
        questions,
        analytics: {
          ...prev.analytics,
          bookmarkedQuestions: questions.filter((q) => q.bookmarked).length,
        },
      };
    });
  }, []);

  const handleAttempt = useCallback(
    (id: string, selectedOption: number, isCorrect: boolean, correctOption: number) => {
      setData((prev) => {
        if (!prev) return prev;
        const questions = prev.questions.map((q) =>
          q.id === id
            ? { ...q, attempted: true, selectedOption, isCorrect, correctOption }
            : q
        );
        const correctMCQs = questions.filter((q) => q.type === "MCQ" && q.isCorrect).length;
        const attemptedMCQs = questions.filter((q) => q.type === "MCQ" && q.attempted).length;
        const mcqAccuracy = attemptedMCQs > 0 ? Math.round((correctMCQs / attemptedMCQs) * 100) : 0;
        const theoryQ = questions.filter((q) => q.type === "THEORY").length;
        const mcqQ = questions.filter((q) => q.type === "MCQ").length;
        const mastered = questions.filter((q) => q.status === "MASTERED").length;
        const theoryScore = theoryQ > 0 ? (mastered / theoryQ) * 60 : 0;
        const mcqScore = mcqQ > 0 ? (correctMCQs / mcqQ) * 40 : 0;
        return {
          ...prev,
          questions,
          analytics: {
            ...prev.analytics,
            attemptedMCQs,
            correctMCQs,
            mcqAccuracy,
            readinessScore: Math.round(theoryScore + mcqScore),
          },
        };
      });
    },
    []
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-gray-400 animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-gray-400">Topic not found</div>
      </div>
    );
  }

  const config = getConfig(subject);

  // Apply all filters
  const filtered = data.questions.filter((q) => {
    if (tab !== "ALL" && q.type !== tab) return false;
    if (statusFilter !== "ALL" && q.status !== statusFilter) return false;
    if (difficultyFilter !== "ALL" && q.difficulty !== difficultyFilter) return false;
    if (frequencyFilter !== "ALL" && q.frequency !== frequencyFilter) return false;
    if (bookmarkFilter === "BOOKMARKED" && !q.bookmarked) return false;
    if (companyFilter && !q.companies.includes(companyFilter)) return false;
    if (search) {
      const s = search.toLowerCase();
      const inQuestion = q.question.toLowerCase().includes(s);
      const inCompanies = q.companies.some((c) => c.toLowerCase().includes(s));
      const inNote = q.interviewerNote?.toLowerCase().includes(s) ?? false;
      if (!inQuestion && !inCompanies && !inNote) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-6">
          <button onClick={() => router.push("/subjects")} className="hover:text-white transition-colors">
            Subjects
          </button>
          <span>/</span>
          <button onClick={() => router.push(`/subjects/${subject}`)} className="hover:text-white transition-colors capitalize">
            {subject.toUpperCase()}
          </button>
          <span>/</span>
          <span className="text-white">{data.title}</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">

          {/* ── Left: Main Content ── */}
          <div className="flex-1 min-w-0">

            {/* Header */}
            <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <button
                  onClick={() => router.push(`/subjects/${subject}`)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <h1 className="text-xl font-bold text-white">{data.title}</h1>
                <span
                  className="text-xs font-medium px-2 py-0.5 rounded-full ml-auto"
                  style={{
                    background: config.accent + "20",
                    color: config.accent,
                    border: `1px solid ${config.accent}40`,
                  }}
                >
                  {data.analytics.totalQuestions} Questions
                </span>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "Theory", value: data.analytics.theoryQuestions, color: "text-blue-400" },
                  { label: "MCQs", value: data.analytics.mcqQuestions, color: "text-purple-400" },
                  { label: "Mastered", value: data.analytics.masteredQuestions, color: "text-green-400" },
                  { label: "Bookmarked", value: data.analytics.bookmarkedQuestions, color: "text-yellow-400" },
                ].map(({ label, value, color }) => (
                  <div key={label} className="bg-gray-700/40 rounded-xl p-3 text-center">
                    <p className={`text-lg font-bold ${color}`}>{value}</p>
                    <p className="text-xs text-gray-500">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-4">
              {(["ALL", "THEORY", "MCQ"] as TabType[]).map((t) => {
                const counts = {
                  ALL: data.questions.length,
                  THEORY: data.analytics.theoryQuestions,
                  MCQ: data.analytics.mcqQuestions,
                };
                return (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-all flex items-center gap-1.5
                      ${tab === t
                        ? "bg-indigo-500/20 text-indigo-400 border-indigo-500/50"
                        : "bg-gray-800 text-gray-400 border-gray-700 hover:border-gray-500"
                      }`}
                  >
                    {t === "ALL" ? "All Questions" : t === "THEORY" ? "Theory" : "MCQs"}
                    <span className="bg-gray-700 text-gray-300 px-1.5 py-0.5 rounded-full text-xs">
                      {counts[t]}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2 mb-4">
              {/* Search */}
              <div className="relative flex-1 min-w-48">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search questions..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-gray-700 bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs"
                />
              </div>

              {/* Difficulty */}
              <select
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value as DifficultyFilter)}
                className="text-xs px-3 py-1.5 rounded-xl border border-gray-700 bg-gray-800 text-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="ALL">All Difficulty</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>

              {/* Frequency */}
              <select
                value={frequencyFilter}
                onChange={(e) => setFrequencyFilter(e.target.value as FrequencyFilter)}
                className="text-xs px-3 py-1.5 rounded-xl border border-gray-700 bg-gray-800 text-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="ALL">All Frequency</option>
                <option value="High">High Frequency</option>
                <option value="Medium">Medium Frequency</option>
                <option value="Low">Low Frequency</option>
              </select>

              {/* Status */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                className="text-xs px-3 py-1.5 rounded-xl border border-gray-700 bg-gray-800 text-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="ALL">All Status</option>
                <option value="NOT_STARTED">Not Started</option>
                <option value="REVISED">Revised</option>
                <option value="MASTERED">Mastered</option>
              </select>

              {/* Bookmark */}
              <button
                onClick={() =>
                  setBookmarkFilter((f) =>
                    f === "ALL" ? "BOOKMARKED" : "ALL"
                  )
                }
                className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl border font-medium transition-all
                  ${bookmarkFilter === "BOOKMARKED"
                    ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/50"
                    : "bg-gray-800 text-gray-400 border-gray-700 hover:border-gray-500"
                  }`}
              >
                <Bookmark className="w-3 h-3" />
                Bookmarked
              </button>
            </div>

            {/* Active company filter indicator */}
            {companyFilter && (
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs text-gray-400">Filtered by:</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  {companyFilter}
                </span>
                <button
                  onClick={() => setCompanyFilter(null)}
                  className="text-xs text-gray-500 hover:text-white transition-colors"
                >
                  ✕ Clear
                </button>
              </div>
            )}

            {/* Results count */}
            <p className="text-xs text-gray-500 mb-4">
              {filtered.length} questions
            </p>

            {/* Question List */}
            <div className="space-y-3">
              {filtered.length === 0 ? (
                <div className="text-center py-16 text-gray-500">
                  <p className="text-sm">No questions match your filters</p>
                </div>
              ) : (
                filtered.map((q) =>
                  q.type === "THEORY" ? (
                    <TheoryQuestionCard
                      key={q.id}
                      question={q}
                      onStatusUpdate={handleStatusUpdate}
                      onBookmarkUpdate={handleBookmarkUpdate}
                    />
                  ) : (
                    <MCQCard
                      key={q.id}
                      question={q}
                      onAttempt={handleAttempt}
                      onBookmarkUpdate={handleBookmarkUpdate}
                    />
                  )
                )
              )}
            </div>
          </div>

          {/* ── Right: Readiness Panel ── */}
          <div className="lg:w-72 flex-shrink-0">
            <div className="sticky top-20">
              <ReadinessPanel
                analytics={data.analytics}
                companyDistribution={data.companyDistribution}
                onCompanyFilter={setCompanyFilter}
                activeCompany={companyFilter}
                accent={config.accent}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}