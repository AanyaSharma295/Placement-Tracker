"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ExternalLink,
  CheckCircle2,
  Clock,
  Circle,
  Target,
  TrendingUp,
  BookOpen,
} from "lucide-react";

interface Question {
  id: string;
  title: string;
  difficulty: string;
  topic: string;
  link: string;
  status: string;
}

interface CompanyStats {
  totalQuestions: number;
  solvedQuestions: number;
  inProgressQuestions: number;
  remainingQuestions: number;
  completionPercentage: number;
  easy: number;
  medium: number;
  hard: number;
}

interface CompanyData {
  id: string;
  name: string;
  slug: string;
  stats: CompanyStats;
  questions: Question[];
}

const COMPANY_COLORS: Record<string, string> = {
  amazon: "#FF9900",
  google: "#4285F4",
  microsoft: "#00A4EF",
  adobe: "#FF0000",
  "goldman-sachs": "#6DB4F2",
  atlassian: "#0052CC",
  walmart: "#0071CE",
  uber: "#1C1C1C",
  oracle: "#F80000",
  "morgan-stanley": "#003087",
  jpmorgan: "#003087",
  "de-shaw": "#00B4D8",
  arcesium: "#00B4D8",
  sprinklr: "#6C5CE7",
  flipkart: "#2874F0",
  razorpay: "#3395FF",
  phonepe: "#5F259F",
  zomato: "#E23744",
  swiggy: "#FC8019",
  paytm: "#00BAF2",
};

const LOGO_DOMAINS: Record<string, string> = {
  amazon: "amazon.com",
  google: "google.com",
  microsoft: "microsoft.com",
  adobe: "adobe.com",
  "goldman-sachs": "goldmansachs.com",
  atlassian: "atlassian.com",
  walmart: "walmart.com",
  uber: "uber.com",
  oracle: "oracle.com",
  "morgan-stanley": "morganstanley.com",
  jpmorgan: "jpmorgan.com",
  "de-shaw": "deshaw.com",
  arcesium: "arcesium.com",
  sprinklr: "sprinklr.com",
  flipkart: "flipkart.com",
  razorpay: "razorpay.com",
  phonepe: "phonepe.com",
  zomato: "zomato.com",
  swiggy: "swiggy.com",
  paytm: "paytm.com",
};

function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const styles = {
    Easy: "bg-green-500/10 text-green-400 border border-green-500/20",
    Medium: "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20",
    Hard: "bg-red-500/10 text-red-400 border border-red-500/20",
  };
  return (
    <span
      className={`text-xs font-medium px-2.5 py-1 rounded-full ${
        styles[difficulty as keyof typeof styles] ?? "bg-gray-700 text-gray-400"
      }`}
    >
      {difficulty}
    </span>
  );
}

function StatusPills({
  questionId,
  currentStatus,
  onUpdate,
}: {
  questionId: string;
  currentStatus: string;
  onUpdate: (questionId: string, status: string) => void;
}) {
  const [loading, setLoading] = useState(false);

  const pills = [
    {
      status: "NOT_STARTED",
      label: "Not Started",
      icon: Circle,
      active: "bg-gray-600 text-white border-gray-500",
      inactive: "bg-gray-800 text-gray-500 border-gray-700 hover:border-gray-500",
    },
    {
      status: "IN_PROGRESS",
      label: "In Progress",
      icon: Clock,
      active: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
      inactive: "bg-gray-800 text-gray-500 border-gray-700 hover:border-yellow-500/50",
    },
    {
      status: "SOLVED",
      label: "Solved",
      icon: CheckCircle2,
      active: "bg-green-500/20 text-green-400 border-green-500/50",
      inactive: "bg-gray-800 text-gray-500 border-gray-700 hover:border-green-500/50",
    },
  ];

  const handleClick = async (status: string) => {
    if (loading || status === currentStatus) return;
    setLoading(true);
    try {
      await fetch(`/api/questions/${questionId}/progress`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      onUpdate(questionId, status);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-1.5">
      {pills.map(({ status, label, icon: Icon, active, inactive }) => (
        <button
          key={status}
          onClick={() => handleClick(status)}
          disabled={loading}
          className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border 
            transition-all duration-150 font-medium whitespace-nowrap
            ${currentStatus === status ? active : inactive}
            ${loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        >
          <Icon className="w-3 h-3" />
          {label}
        </button>
      ))}
    </div>
  );
}

function ProgressBar({ percentage }: { percentage: number }) {
  const color =
    percentage >= 70 ? "#22C55E" : percentage >= 40 ? "#F59E0B" : "#3B82F6";
  return (
    <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${percentage}%`, backgroundColor: color }}
      />
    </div>
  );
}

export default function CompanyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const companyId = params.companyId as string;

  const [data, setData] = useState<CompanyData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string>("ALL");
  const [topicFilter, setTopicFilter] = useState<string>("ALL");

  useEffect(() => {
    fetch(`/api/companies/${companyId}`)
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setIsLoading(false);
      });
  }, [companyId]);

  const handleStatusUpdate = useCallback(
    (questionId: string, status: string) => {
      setData((prev) => {
        if (!prev) return prev;
        const updatedQuestions = prev.questions.map((q) =>
          q.id === questionId ? { ...q, status } : q
        );
        const solved = updatedQuestions.filter(
          (q) => q.status === "SOLVED"
        ).length;
        const inProgress = updatedQuestions.filter(
          (q) => q.status === "IN_PROGRESS"
        ).length;
        const total = updatedQuestions.length;
        return {
          ...prev,
          questions: updatedQuestions,
          stats: {
            ...prev.stats,
            solvedQuestions: solved,
            inProgressQuestions: inProgress,
            remainingQuestions: total - solved,
            completionPercentage: Math.round((solved / total) * 100),
          },
        };
      });
    },
    []
  );

  if (isLoading){
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-gray-400 animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-gray-400">Company not found</div>
      </div>
    );
  }

  const color = COMPANY_COLORS[data.slug] ?? "#3B82F6";
  const domain = LOGO_DOMAINS[data.slug] ?? `${data.slug}.com`;
  const initials = data.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const topics = ["ALL", ...Array.from(new Set(data.questions.map((q) => q.topic))).sort()];

  const filteredQuestions = data.questions.filter((q) => {
    const diffMatch = filter === "ALL" || q.difficulty === filter;
    const topicMatch = topicFilter === "ALL" || q.topic === topicFilter;
    return diffMatch && topicMatch;
  });

  const mostPracticedTopic = Object.entries(
    data.questions.reduce((acc, q) => {
      acc[q.topic] = (acc[q.topic] ?? 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Back Button */}
        <button
          onClick={() => router.push("/companies")}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Companies
        </button>

        {/* Company Header */}
        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-4 mb-6">
            {/* Logo */}
            <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-gray-700 flex-shrink-0">
              <img
                src={`https://img.logo.dev/${domain}?token=pk_X0MvBV7hRRW8GKQbLjEHBg&size=64`}
                alt={data.name}
                className="w-full h-full object-contain p-1.5"
                onError={(e) => {
                  const img = e.target as HTMLImageElement;
                  img.style.display = "none";
                  const fallback = img.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = "flex";
                }}
              />
              <div
                className="absolute inset-0 items-center justify-center text-white font-bold text-lg rounded-2xl hidden"
                style={{ backgroundColor: color }}
              >
                {initials}
              </div>
            </div>

            <div>
              <h1 className="text-2xl font-bold text-white">{data.name}</h1>
              <p className="text-gray-400 text-sm mt-0.5">
                Interview Preparation
              </p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-700/50 rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-xs text-gray-400">Total</span>
              </div>
              <p className="text-xl font-bold text-white">
                {data.stats.totalQuestions}
              </p>
            </div>
            <div className="bg-gray-700/50 rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                <span className="text-xs text-gray-400">Solved</span>
              </div>
              <p className="text-xl font-bold text-green-400">
                {data.stats.solvedQuestions}
              </p>
            </div>
            <div className="bg-gray-700/50 rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Target className="w-3.5 h-3.5 text-yellow-400" />
                <span className="text-xs text-gray-400">Remaining</span>
              </div>
              <p className="text-xl font-bold text-yellow-400">
                {data.stats.remainingQuestions}
              </p>
            </div>
            <div className="bg-gray-700/50 rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <TrendingUp className="w-3.5 h-3.5 text-purple-400" />
                <span className="text-xs text-gray-400">Complete</span>
              </div>
              <p className="text-xl font-bold text-purple-400">
                {data.stats.completionPercentage}%
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-xs text-gray-400 mb-2">
              <span>Progress</span>
              <span>{data.stats.completionPercentage}%</span>
            </div>
            <ProgressBar percentage={data.stats.completionPercentage} />
          </div>

          {/* Difficulty Breakdown */}
          <div className="flex gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-400" />
              <span className="text-xs text-gray-400">
                Easy:{" "}
                <span className="text-green-400 font-medium">
                  {data.stats.easy}
                </span>
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-yellow-400" />
              <span className="text-xs text-gray-400">
                Medium:{" "}
                <span className="text-yellow-400 font-medium">
                  {data.stats.medium}
                </span>
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-400" />
              <span className="text-xs text-gray-400">
                Hard:{" "}
                <span className="text-red-400 font-medium">
                  {data.stats.hard}
                </span>
              </span>
            </div>
            <div className="ml-auto flex items-center gap-1.5">
              <BookOpen className="w-3 h-3 text-gray-500" />
              <span className="text-xs text-gray-400">
                Top topic:{" "}
                <span className="text-white font-medium">
                  {mostPracticedTopic}
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-4">
          {["ALL", "Easy", "Medium", "Hard"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-all
                ${
                  filter === f
                    ? f === "Easy"
                      ? "bg-green-500/20 text-green-400 border-green-500/50"
                      : f === "Medium"
                      ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/50"
                      : f === "Hard"
                      ? "bg-red-500/20 text-red-400 border-red-500/50"
                      : "bg-blue-500/20 text-blue-400 border-blue-500/50"
                    : "bg-gray-800 text-gray-400 border-gray-700 hover:border-gray-500"
                }`}
            >
              {f}
            </button>
          ))}

          <select
            value={topicFilter}
            onChange={(e) => setTopicFilter(e.target.value)}
            className="text-xs px-3 py-1.5 rounded-full border border-gray-700 bg-gray-800 text-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
          >
            {topics.map((t) => (
              <option key={t} value={t}>
                {t === "ALL" ? "All Topics" : t}
              </option>
            ))}
          </select>

          <span className="ml-auto text-xs text-gray-500 self-center">
            {filteredQuestions.length} questions
          </span>
        </div>

        {/* Question Table */}
        <div className="bg-gray-800 border border-gray-700 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left text-xs font-medium text-gray-400 px-4 py-3">
                    Title
                  </th>
                  <th className="text-left text-xs font-medium text-gray-400 px-4 py-3">
                    Difficulty
                  </th>
                  <th className="text-left text-xs font-medium text-gray-400 px-4 py-3 hidden md:table-cell">
                    Topic
                  </th>
                  <th className="text-left text-xs font-medium text-gray-400 px-4 py-3">
                    Status
                  </th>
                  <th className="text-left text-xs font-medium text-gray-400 px-4 py-3">
                    Link
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/50">
                {filteredQuestions.map((question) => (
                  <tr
                    key={question.id}
                    className="hover:bg-gray-700/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <span className="text-sm text-white font-medium">
                        {question.title}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <DifficultyBadge difficulty={question.difficulty} />
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-xs text-gray-400 bg-gray-700/50 px-2 py-1 rounded-lg">
                        {question.topic}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusPills
                        questionId={question.id}
                        currentStatus={question.status}
                        onUpdate={handleStatusUpdate}
                      />
                    </td>
                    <td className="px-4 py-3">
                      {/* Fixed Anchor Tag below */}
                      <a
                        href={question.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Open
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}