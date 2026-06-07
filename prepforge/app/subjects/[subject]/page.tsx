"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Clock,
  Circle,
  Database,
  Code2,
  Monitor,
  Network,
  Table2,
  TrendingUp,
  Target,
} from "lucide-react";

interface Topic {
  id: string;
  title: string;
  order: number;
  status: string;
}

interface SubjectStats {
  totalTopics: number;
  completedTopics: number;
  inProgressTopics: number;
  remainingTopics: number;
  completionPercentage: number;
}

interface SubjectData {
  slug: string;
  label: string;
  stats: SubjectStats;
  topics: Topic[];
}

function getConfig(slug: string) {
  if (slug === "dbms")
    return {
      icon: Database,
      color: "text-blue-400",
      bg: "bg-blue-500/20",
      border: "border-blue-500/30",
      accent: "#3B82F6",
    };
  if (slug === "oops")
    return {
      icon: Code2,
      color: "text-purple-400",
      bg: "bg-purple-500/20",
      border: "border-purple-500/30",
      accent: "#A855F7",
    };
  if (slug === "os")
    return {
      icon: Monitor,
      color: "text-green-400",
      bg: "bg-green-500/20",
      border: "border-green-500/30",
      accent: "#22C55E",
    };
  if (slug === "cn")
    return {
      icon: Network,
      color: "text-yellow-400",
      bg: "bg-yellow-500/20",
      border: "border-yellow-500/30",
      accent: "#EAB308",
    };
  if (slug === "sql")
    return {
      icon: Table2,
      color: "text-orange-400",
      bg: "bg-orange-500/20",
      border: "border-orange-500/30",
      accent: "#F97316",
    };
  return {
    icon: BookOpen,
    color: "text-indigo-400",
    bg: "bg-indigo-500/20",
    border: "border-indigo-500/30",
    accent: "#6366F1",
  };
}

function ProgressBar({
  percentage,
  accent,
}: {
  percentage: number;
  accent: string;
}) {
  return (
    <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${percentage}%`, backgroundColor: accent }}
      />
    </div>
  );
}

function TopicRow({
  topic,
  accent,
  onUpdate,
}: {
  topic: Topic;
  accent: string;
  onUpdate: (topicId: string, status: string) => void;
}) {
  const [loading, setLoading] = useState(false);

  const handleClick = async (status: string) => {
    if (loading || status === topic.status) return;
    setLoading(true);
    try {
      await fetch(`/api/topics/${topic.id}/progress`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      onUpdate(topic.id, status);
    } finally {
      setLoading(false);
    }
  };

  const pills = [
    {
      status: "NOT_STARTED",
      label: "Not Started",
      icon: Circle,
      active: "bg-gray-600 text-white border-gray-500",
      inactive:
        "bg-gray-800 text-gray-500 border-gray-700 hover:border-gray-500",
    },
    {
      status: "IN_PROGRESS",
      label: "In Progress",
      icon: Clock,
      active: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
      inactive:
        "bg-gray-800 text-gray-500 border-gray-700 hover:border-yellow-500/50",
    },
    {
      status: "COMPLETED",
      label: "Completed",
      icon: CheckCircle2,
      active: "bg-green-500/20 text-green-400 border-green-500/50",
      inactive:
        "bg-gray-800 text-gray-500 border-gray-700 hover:border-green-500/50",
    },
  ];

  return (
    <div
      className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-200
        ${
          topic.status === "COMPLETED"
            ? "bg-green-500/5 border-green-500/20"
            : topic.status === "IN_PROGRESS"
            ? "bg-yellow-500/5 border-yellow-500/20"
            : "bg-gray-800 border-gray-700"
        }`}
    >
      {/* Topic Title */}
      <div className="flex items-center gap-3">
        <span className="text-xs text-gray-500 w-5 text-right">
          {topic.order}
        </span>
        {topic.status === "COMPLETED" ? (
          <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
        ) : topic.status === "IN_PROGRESS" ? (
          <Clock className="w-4 h-4 text-yellow-400 flex-shrink-0" />
        ) : (
          <Circle className="w-4 h-4 text-gray-600 flex-shrink-0" />
        )}
        <span
          className={`text-sm font-medium ${
            topic.status === "COMPLETED"
              ? "text-green-400"
              : topic.status === "IN_PROGRESS"
              ? "text-yellow-400"
              : "text-white"
          }`}
        >
          {topic.title}
        </span>
      </div>

      {/* Status Pills */}
      <div className="flex gap-1.5">
        {pills.map(({ status, label, icon: Icon, active, inactive }) => (
          <button
            key={status}
            onClick={() => handleClick(status)}
            disabled={loading}
            className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border
              transition-all duration-150 font-medium whitespace-nowrap
              ${topic.status === status ? active : inactive}
              ${loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
          >
            <Icon className="w-3 h-3" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function SubjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const subject = params.subject as string;

  const [data, setData] = useState<SubjectData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/subjects/${subject}`)
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setIsLoading(false);
      });
  }, [subject]);

  const handleStatusUpdate = useCallback(
    (topicId: string, status: string) => {
      setData((prev) => {
        if (!prev) return prev;
        const updatedTopics = prev.topics.map((t) =>
          t.id === topicId ? { ...t, status } : t
        );
        const completed = updatedTopics.filter(
          (t) => t.status === "COMPLETED"
        ).length;
        const inProgress = updatedTopics.filter(
          (t) => t.status === "IN_PROGRESS"
        ).length;
        const total = updatedTopics.length;
        return {
          ...prev,
          topics: updatedTopics,
          stats: {
            ...prev.stats,
            completedTopics: completed,
            inProgressTopics: inProgress,
            remainingTopics: total - completed,
            completionPercentage: Math.round((completed / total) * 100),
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
        <div className="text-gray-400">Subject not found</div>
      </div>
    );
  }

  const config = getConfig(data.slug);
  const Icon = config.icon;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Back Button */}
        <button
          onClick={() => router.push("/subjects")}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Subjects
        </button>

        {/* Header Card */}
        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div
              className={`w-14 h-14 rounded-2xl border flex items-center justify-center flex-shrink-0 ${config.bg} ${config.border}`}
            >
              <Icon className={`w-7 h-7 ${config.color}`} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{data.label}</h1>
              <p className="text-gray-400 text-sm mt-0.5">
                Revision & Progress Tracker
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-700/50 rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <BookOpen className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-xs text-gray-400">Total</span>
              </div>
              <p className="text-xl font-bold text-white">
                {data.stats.totalTopics}
              </p>
            </div>
            <div className="bg-gray-700/50 rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                <span className="text-xs text-gray-400">Completed</span>
              </div>
              <p className="text-xl font-bold text-green-400">
                {data.stats.completedTopics}
              </p>
            </div>
            <div className="bg-gray-700/50 rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Target className="w-3.5 h-3.5 text-yellow-400" />
                <span className="text-xs text-gray-400">Remaining</span>
              </div>
              <p className="text-xl font-bold text-yellow-400">
                {data.stats.remainingTopics}
              </p>
            </div>
            <div className="bg-gray-700/50 rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <TrendingUp className={`w-3.5 h-3.5 ${config.color}`} />
                <span className="text-xs text-gray-400">Complete</span>
              </div>
              <p
                className={`text-xl font-bold ${config.color}`}
              >
                {data.stats.completionPercentage}%
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div>
            <div className="flex justify-between text-xs text-gray-400 mb-2">
              <span>Progress</span>
              <span>{data.stats.completionPercentage}%</span>
            </div>
            <ProgressBar
              percentage={data.stats.completionPercentage}
              accent={config.accent}
            />
          </div>
        </div>

        {/* Topics List */}
        <div className="space-y-2">
          <h2 className="text-sm font-medium text-gray-400 mb-3">
            {data.stats.totalTopics} Topics
          </h2>
          {data.topics.map((topic) => (
            <TopicRow
              key={topic.id}
              topic={topic}
              accent={config.accent}
              onUpdate={handleStatusUpdate}
            />
          ))}
        </div>
      </div>
    </div>
  );
}