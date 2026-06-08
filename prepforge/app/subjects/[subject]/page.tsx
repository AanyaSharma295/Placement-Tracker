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
  NotebookPen,
  ChevronRight,
  ChevronDown,
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

const SUBJECT_NAV = [
  { slug: "dbms", label: "DBMS" },
  { slug: "oops", label: "OOPS" },
  { slug: "os", label: "Operating Systems" },
  { slug: "cn", label: "Computer Networks" },
  { slug: "sql", label: "SQL" },
];

const SLUG_MAP: Record<string, string> = {
  "ER Diagrams": "er-diagrams",
  "Normalization": "normalization",
  "Transactions": "transactions",
  "ACID Properties": "acid-properties",
  "Indexing": "indexing",
  "Joins": "joins",
  "Query Optimization": "query-optimization",
  "Classes & Objects": "classes-objects",
  "Encapsulation": "encapsulation",
  "Abstraction": "abstraction",
  "Inheritance": "inheritance",
  "Polymorphism": "polymorphism",
  "SOLID Principles": "solid-principles",
  "Processes": "processes",
  "Threads": "threads",
  "Scheduling": "scheduling",
  "Deadlocks": "deadlocks",
  "Memory Management": "memory-management",
  "Paging": "paging",
  "Virtual Memory": "virtual-memory",
  "OSI Model": "osi-model",
  "TCP/IP": "tcp-ip",
  "HTTP/HTTPS": "http-https",
  "DNS": "dns",
  "Routing": "routing",
  "Congestion Control": "congestion-control",
  "SELECT Queries": "select-queries",
  "JOINS": "joins-sql",
  "GROUP BY & HAVING": "group-by-having",
  "Subqueries": "subqueries",
  "Window Functions": "window-functions",
  "Indexes & Performance": "indexes-performance",
};

const SUBJECT_META = {
  dbms: { icon: Database, color: "text-blue-400", bg: "bg-blue-500/20", border: "border-blue-500/30", accent: "#3B82F6", hours: "~4 Hours", importance: "High" },
  oops: { icon: Code2, color: "text-purple-400", bg: "bg-purple-500/20", border: "border-purple-500/30", accent: "#A855F7", hours: "~3 Hours", importance: "High" },
  os: { icon: Monitor, color: "text-green-400", bg: "bg-green-500/20", border: "border-green-500/30", accent: "#22C55E", hours: "~5 Hours", importance: "High" },
  cn: { icon: Network, color: "text-yellow-400", bg: "bg-yellow-500/20", border: "border-yellow-500/30", accent: "#EAB308", hours: "~3 Hours", importance: "Medium" },
  sql: { icon: Table2, color: "text-orange-400", bg: "bg-orange-500/20", border: "border-orange-500/30", accent: "#F97316", hours: "~2 Hours", importance: "High" },
};

const TOPIC_TAGS: Record<string, string> = {
  "ER Diagrams": "Conceptual",
  "Normalization": "Design",
  "Transactions": "ACID • Important",
  "ACID Properties": "Core",
  "Indexing": "Performance",
  "Joins": "Queries",
  "Query Optimization": "Advanced",
  "Classes & Objects": "Fundamentals",
  "Encapsulation": "Principle",
  "Abstraction": "Principle",
  "Inheritance": "Core",
  "Polymorphism": "Core",
  "SOLID Principles": "Advanced",
  "Processes": "Core",
  "Threads": "Core",
  "Scheduling": "Algorithms",
  "Deadlocks": "Important",
  "Memory Management": "Core",
  "Paging": "Memory",
  "Virtual Memory": "Advanced",
  "OSI Model": "Fundamentals",
  "TCP/IP": "Core",
  "HTTP/HTTPS": "Web",
  "DNS": "Networking",
  "Routing": "Algorithms",
  "Congestion Control": "Advanced",
  "SELECT Queries": "Fundamentals",
  "JOINS": "Core • Important",
  "GROUP BY & HAVING": "Aggregation",
  "Subqueries": "Intermediate",
  "Window Functions": "Advanced",
  "Indexes & Performance": "Optimization",
};

type FilterType = "ALL" | "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";

function getConfig(slug: string) {
  return SUBJECT_META[slug as keyof typeof SUBJECT_META] ?? {
    icon: BookOpen,
    color: "text-indigo-400",
    bg: "bg-indigo-500/20",
    border: "border-indigo-500/30",
    accent: "#6366F1",
    hours: "~2 Hours",
    importance: "Medium",
  };
}

function ProgressBar({ percentage, accent }: { percentage: number; accent: string }) {
  return (
    <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${percentage}%`, backgroundColor: accent }} />
    </div>
  );
}

function TopicRow({
  topic,
  subject,
  onUpdate,
}: {
  topic: Topic;
  subject: string;
  onUpdate: (topicId: string, status: string) => void;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const slug = SLUG_MAP[topic.title];
  const tag = TOPIC_TAGS[topic.title];
  const hasQuestions = !!slug;

  const handleStatusClick = async (e: React.MouseEvent, status: string) => {
    e.stopPropagation();
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
    { status: "NOT_STARTED", label: "Not Started", icon: Circle, active: "bg-gray-600 text-white border-gray-500", inactive: "bg-gray-800/50 text-gray-500 border-gray-700 hover:border-gray-500" },
    { status: "IN_PROGRESS", label: "In Progress", icon: Clock, active: "bg-amber-500/20 text-amber-400 border-amber-500/50", inactive: "bg-gray-800/50 text-gray-500 border-gray-700 hover:border-amber-500/50" },
    { status: "COMPLETED", label: "Completed", icon: CheckCircle2, active: "bg-green-500/20 text-green-400 border-green-500/50", inactive: "bg-gray-800/50 text-gray-500 border-gray-700 hover:border-green-500/50" },
  ];

  return (
    <div
      onClick={() => hasQuestions && router.push(`/subjects/${subject}/${slug}`)}
      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border transition-all duration-200
        ${hasQuestions ? "cursor-pointer" : "cursor-default"}
        ${topic.status === "COMPLETED" ? "bg-green-500/5 border-green-500/20 hover:border-green-500/40"
          : topic.status === "IN_PROGRESS" ? "bg-amber-500/5 border-amber-500/20 hover:border-amber-500/40"
          : "bg-gray-800 border-gray-700 hover:border-gray-600"}`}
    >
      {/* Left */}
      <div className="flex items-center gap-3 min-w-0">
        <span className="text-xs text-gray-600 w-5 text-right flex-shrink-0">{topic.order}</span>
        {topic.status === "COMPLETED" ? (
          <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
        ) : topic.status === "IN_PROGRESS" ? (
          <Clock className="w-4 h-4 text-amber-400 flex-shrink-0" />
        ) : (
          <Circle className="w-4 h-4 text-gray-600 flex-shrink-0" />
        )}
        <div className="min-w-0">
          <p className={`text-sm font-medium truncate ${topic.status === "COMPLETED" ? "text-green-400" : topic.status === "IN_PROGRESS" ? "text-amber-400" : "text-white"}`}>
            {topic.title}
          </p>
          {tag && <p className="text-xs text-gray-500 mt-0.5">{tag}</p>}
        </div>
        {hasQuestions && (
          <ChevronRight className="w-3.5 h-3.5 text-gray-600 flex-shrink-0 ml-1" />
        )}
      </div>

      {/* Right */}
      <div className="flex items-center gap-2 flex-shrink-0 ml-8 sm:ml-0">
        <div className="flex gap-1.5">
          {pills.map(({ status, label, icon: Icon, active, inactive }) => (
            <button
              key={status}
              onClick={(e) => handleStatusClick(e, status)}
              disabled={loading}
              title={label}
              className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border transition-all duration-150 font-medium
                ${topic.status === status ? active : inactive}
                ${loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
            >
              <Icon className="w-3 h-3" />
              <span className="hidden lg:inline">{label}</span>
            </button>
          ))}
        </div>

        <button
          disabled
          title="Notes coming soon"
          className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border border-gray-700 bg-gray-800/50 text-gray-600 cursor-not-allowed opacity-60"
          onClick={(e) => e.stopPropagation()}
        >
          <NotebookPen className="w-3 h-3" />
          <span className="hidden lg:inline">Notes</span>
        </button>
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
  const [filter, setFilter] = useState<FilterType>("ALL");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    fetch(`/api/subjects/${subject}`)
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setIsLoading(false);
      });
  }, [subject]);

  const handleStatusUpdate = useCallback((topicId: string, status: string) => {
    setData((prev) => {
      if (!prev) return prev;
      const updatedTopics = prev.topics.map((t) =>
        t.id === topicId ? { ...t, status } : t
      );
      const completed = updatedTopics.filter((t) => t.status === "COMPLETED").length;
      const inProgress = updatedTopics.filter((t) => t.status === "IN_PROGRESS").length;
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
  }, []);

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

  const filteredTopics = data.topics.filter((t) =>
    filter === "ALL" ? true : t.status === filter
  );

  const importanceColor =
    config.importance === "High" ? "text-red-400 bg-red-500/10"
    : config.importance === "Medium" ? "text-yellow-400 bg-yellow-500/10"
    : "text-green-400 bg-green-500/10";

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

        {/* Subject Navigation */}
        <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
          {SUBJECT_NAV.map((s) => (
            <button
              key={s.slug}
              onClick={() => router.push(`/subjects/${s.slug}`)}
              className={`text-xs px-3 py-1.5 rounded-full border whitespace-nowrap font-medium transition-all
                ${s.slug === subject ? "text-white" : "bg-gray-800 text-gray-400 border-gray-700 hover:border-gray-500 hover:text-white"}`}
              style={s.slug === subject ? { backgroundColor: config.accent + "30", borderColor: config.accent + "60", color: config.accent } : {}}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Header Card */}
        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 mb-6">
          <div className="flex items-start gap-4 mb-6">
            <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center flex-shrink-0 ${config.bg} ${config.border}`}>
              <Icon className={`w-7 h-7 ${config.color}`} />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-white">{data.label}</h1>
              <div className="flex flex-wrap items-center gap-2 mt-1.5">
                <span className="text-xs text-gray-400">{data.stats.totalTopics} Topics</span>
                <span className="text-gray-600">•</span>
                <span className="text-xs text-gray-400">{config.hours} Revision</span>
                <span className="text-gray-600">•</span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${importanceColor}`}>
                  {config.importance} Interview Frequency
                </span>
              </div>
            </div>
          </div>

          {/* Progress */}
          <div className="bg-gray-700/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-medium text-white">
                  {data.stats.completedTopics} / {data.stats.totalTopics} Topics Completed
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {data.stats.inProgressTopics} in progress • {data.stats.remainingTopics} remaining
                </p>
              </div>
              <span className="text-2xl font-bold" style={{ color: config.accent }}>
                {data.stats.completionPercentage}%
              </span>
            </div>
            <ProgressBar percentage={data.stats.completionPercentage} accent={config.accent} />
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3 mt-4">
            {[
              { icon: CheckCircle2, color: "text-green-400", value: data.stats.completedTopics, label: "Completed" },
              { icon: Clock, color: "text-amber-400", value: data.stats.inProgressTopics, label: "In Progress" },
              { icon: Target, color: "text-gray-400", value: data.stats.remainingTopics, label: "Remaining" },
            ].map(({ icon: Ic, color, value, label }) => (
              <div key={label} className="bg-gray-700/30 rounded-xl p-3 text-center">
                <Ic className={`w-4 h-4 ${color} mx-auto mb-1`} />
                <p className={`text-lg font-bold ${color}`}>{value}</p>
                <p className="text-xs text-gray-500">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Topic Dropdown Navigator */}
        <div className="relative mb-4">
          <button
            onClick={() => setDropdownOpen((o) => !o)}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-gray-700 bg-gray-800 text-sm text-gray-300 hover:border-gray-600 transition-all"
          >
            <span>Select Topic to Practice →</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
          </button>
          {dropdownOpen && (
            <div className="absolute top-full mt-1 w-full bg-gray-800 border border-gray-700 rounded-xl shadow-2xl z-10 overflow-hidden">
              {data.topics.map((topic) => {
                const slug = SLUG_MAP[topic.title];
                return (
                  <button
                    key={topic.id}
                    onClick={() => {
                      setDropdownOpen(false);
                      if (slug) router.push(`/subjects/${subject}/${slug}`);
                    }}
                    disabled={!slug}
                    className={`w-full flex items-center justify-between px-4 py-2.5 text-left text-sm transition-colors
                      ${slug ? "hover:bg-gray-700 text-white cursor-pointer" : "text-gray-500 cursor-not-allowed"}`}
                  >
                    <span>{topic.title}</span>
                    {slug ? (
                      <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
                    ) : (
                      <span className="text-xs text-gray-600">No questions yet</span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-4">
          {(["ALL", "NOT_STARTED", "IN_PROGRESS", "COMPLETED"] as FilterType[]).map((f) => {
            const labels: Record<FilterType, string> = { ALL: "All", NOT_STARTED: "Not Started", IN_PROGRESS: "In Progress", COMPLETED: "Completed" };
            const counts: Record<FilterType, number> = {
              ALL: data.topics.length,
              NOT_STARTED: data.topics.filter((t) => t.status === "NOT_STARTED").length,
              IN_PROGRESS: data.topics.filter((t) => t.status === "IN_PROGRESS").length,
              COMPLETED: data.topics.filter((t) => t.status === "COMPLETED").length,
            };
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-all flex items-center gap-1.5
                  ${filter === f
                    ? f === "COMPLETED" ? "bg-green-500/20 text-green-400 border-green-500/50"
                      : f === "IN_PROGRESS" ? "bg-amber-500/20 text-amber-400 border-amber-500/50"
                      : f === "NOT_STARTED" ? "bg-gray-600 text-white border-gray-500"
                      : "bg-blue-500/20 text-blue-400 border-blue-500/50"
                    : "bg-gray-800 text-gray-400 border-gray-700 hover:border-gray-500"}`}
              >
                {labels[f]}
                <span className="bg-gray-700 text-gray-300 px-1.5 py-0.5 rounded-full text-xs">
                  {counts[f]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Topics List */}
        <div className="space-y-2">
          <h2 className="text-sm font-medium text-gray-400 mb-3">
            {filteredTopics.length} Topics
          </h2>
          {filteredTopics.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-sm">No topics in this category</p>
            </div>
          ) : (
            filteredTopics.map((topic) => (
              <TopicRow
                key={topic.id}
                topic={topic}
                subject={subject}
                onUpdate={handleStatusUpdate}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}