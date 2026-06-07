"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Database,
  Code2,
  Monitor,
  Network,
  Table2,
  TrendingUp,
  CheckCircle2,
  Clock,
} from "lucide-react";

interface Subject {
  slug: string;
  label: string;
  order: number;
  totalTopics: number;
  completedTopics: number;
  inProgressTopics: number;
  completionPercentage: number;
}

const dbmsConfig = {
  icon: Database,
  color: "text-blue-400",
  bg: "bg-blue-500/10 border-blue-500/20",
  description: "ER Diagrams, Normalization, Transactions, Indexing",
};

const oopsConfig = {
  icon: Code2,
  color: "text-purple-400",
  bg: "bg-purple-500/10 border-purple-500/20",
  description: "Classes, Inheritance, Polymorphism, SOLID",
};

const osConfig = {
  icon: Monitor,
  color: "text-green-400",
  bg: "bg-green-500/10 border-green-500/20",
  description: "Processes, Threads, Scheduling, Memory",
};

const cnConfig = {
  icon: Network,
  color: "text-yellow-400",
  bg: "bg-yellow-500/10 border-yellow-500/20",
  description: "OSI Model, TCP/IP, HTTP, DNS, Routing",
};

const sqlConfig = {
  icon: Table2,
  color: "text-orange-400",
  bg: "bg-orange-500/10 border-orange-500/20",
  description: "SELECT, JOINS, GROUP BY, Window Functions",
};

function getConfig(slug: string) {
  if (slug === "dbms") return dbmsConfig;
  if (slug === "oops") return oopsConfig;
  if (slug === "os") return osConfig;
  if (slug === "cn") return cnConfig;
  if (slug === "sql") return sqlConfig;
  return {
    icon: BookOpen,
    color: "text-indigo-400",
    bg: "bg-indigo-500/10 border-indigo-500/20",
    description: "",
  };
}

function ProgressBar({ percentage }: { percentage: number }) {
  const barColor =
    percentage >= 70 ? "#22C55E" : percentage >= 40 ? "#F59E0B" : "#6366F1";
  return (
    <div className="w-full bg-gray-700 rounded-full h-1.5 overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${percentage}%`, backgroundColor: barColor }}
      />
    </div>
  );
}

function SubjectCard({ subject }: { subject: Subject }) {
  const router = useRouter();
  const config = getConfig(subject.slug);
  const Icon = config.icon;

  return (
    <div
      onClick={() => router.push(`/subjects/${subject.slug}`)}
      className="group bg-gray-800 border border-gray-700 rounded-2xl p-6 cursor-pointer hover:shadow-xl hover:shadow-indigo-500/10 hover:border-indigo-500/50 transition-all duration-200 hover:-translate-y-1"
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className={`w-12 h-12 rounded-xl border flex items-center justify-center flex-shrink-0 ${config.bg}`}
        >
          <Icon className={`w-6 h-6 ${config.color}`} />
        </div>
        {subject.completionPercentage > 0 && (
          <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full">
            {subject.completionPercentage}%
          </span>
        )}
      </div>

      <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-indigo-400 transition-colors">
        {subject.label}
      </h3>
      <p className="text-xs text-gray-500 mb-4 leading-relaxed">
        {config.description}
      </p>

      <div className="flex gap-3 mb-4">
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
          <span className="text-xs text-gray-400">
            <span className="text-white font-medium">
              {subject.completedTopics}
            </span>{" "}
            done
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-yellow-400" />
          <span className="text-xs text-gray-400">
            <span className="text-white font-medium">
              {subject.inProgressTopics}
            </span>{" "}
            in progress
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5 text-gray-500" />
          <span className="text-xs text-gray-400">
            <span className="text-white font-medium">{subject.totalTopics}</span>{" "}
            total
          </span>
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex justify-between text-xs text-gray-500">
          <span>
            {subject.completedTopics}/{subject.totalTopics} completed
          </span>
          <span>{subject.completionPercentage}%</span>
        </div>
        <ProgressBar percentage={subject.completionPercentage} />
      </div>
    </div>
  );
}

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/subjects")
      .then((r) => r.json())
      .then((data) => {
        setSubjects(data);
        setLoading(false);
      });
  }, []);

  const totalTopics = subjects.reduce((a, s) => a + s.totalTopics, 0);
  const completedTopics = subjects.reduce((a, s) => a + s.completedTopics, 0);
  const overallPercentage =
    totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-indigo-400" />
            </div>
            <h1 className="text-3xl font-bold text-white">Core CS Subjects</h1>
          </div>
          <p className="text-gray-400 mt-1">
            Master the fundamentals that every placement interview tests
          </p>
        </div>

        {!loading && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
            <div className="bg-gray-800 border border-gray-700 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <BookOpen className="w-4 h-4 text-indigo-400" />
                <span className="text-xs text-gray-400">Total Topics</span>
              </div>
              <p className="text-2xl font-bold text-white">{totalTopics}</p>
              <p className="text-xs text-gray-500 mt-0.5">across 5 subjects</p>
            </div>

            <div className="bg-gray-800 border border-gray-700 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                <span className="text-xs text-gray-400">Completed</span>
              </div>
              <p className="text-2xl font-bold text-white">{completedTopics}</p>
              <p className="text-xs text-gray-500 mt-0.5">
                of {totalTopics} topics
              </p>
            </div>

            <div className="bg-gray-800 border border-gray-700 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-indigo-400" />
                <span className="text-xs text-gray-400">Overall Progress</span>
              </div>
              <p className="text-2xl font-bold text-white">
                {overallPercentage}%
              </p>
              <p className="text-xs text-gray-500 mt-0.5">subjects mastered</p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="bg-gray-800 border border-gray-700 rounded-2xl p-6 animate-pulse"
              >
                <div className="w-12 h-12 bg-gray-700 rounded-xl mb-4" />
                <div className="h-4 bg-gray-700 rounded w-1/2 mb-2" />
                <div className="h-3 bg-gray-700 rounded w-3/4 mb-6" />
                <div className="h-1.5 bg-gray-700 rounded-full" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {subjects.map((subject) => (
              <SubjectCard key={subject.slug} subject={subject} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}