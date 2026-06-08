"use client";

import {
  BookOpen,
  CheckCircle2,
  Bookmark,
  Target,
  TrendingUp,
  Brain,
} from "lucide-react";

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

interface CompanyDist {
  name: string;
  count: number;
}

function ProgressBar({
  percentage,
  color,
}: {
  percentage: number;
  color: string;
}) {
  return (
    <div className="w-full bg-gray-700 rounded-full h-1.5 overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${percentage}%`, backgroundColor: color }}
      />
    </div>
  );
}

export default function ReadinessPanel({
  analytics,
  companyDistribution,
  onCompanyFilter,
  activeCompany,
  accent,
}: {
  analytics: Analytics;
  companyDistribution: CompanyDist[];
  onCompanyFilter: (company: string | null) => void;
  activeCompany: string | null;
  accent: string;
}) {
  const masteredPercentage =
    analytics.totalQuestions > 0
      ? Math.round(
          (analytics.masteredQuestions / analytics.totalQuestions) * 100
        )
      : 0;

  return (
    <div className="space-y-4">
      {/* Readiness Score */}
      <div
        className="bg-gray-800 border border-gray-700 rounded-2xl p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-semibold text-white">
              Readiness Score
            </h3>
          </div>
          <span
            className="text-2xl font-black"
            style={{ color: accent }}
          >
            {analytics.readinessScore}%
          </span>
        </div>
        <ProgressBar
          percentage={analytics.readinessScore}
          color={accent}
        />
        <p className="text-xs text-gray-500 mt-2">
          Based on mastered questions + MCQ accuracy
        </p>
      </div>

      {/* Stats Grid */}
      <div className="bg-gray-800 border border-gray-700 rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-white mb-4">
          Progress Overview
        </h3>
        <div className="space-y-3">
          {[
            {
              icon: BookOpen,
              label: "Total Questions",
              value: analytics.totalQuestions,
              color: "text-gray-400",
            },
            {
              icon: BookOpen,
              label: "Theory Questions",
              value: analytics.theoryQuestions,
              color: "text-blue-400",
            },
            {
              icon: Target,
              label: "MCQ Questions",
              value: analytics.mcqQuestions,
              color: "text-purple-400",
            },
            {
              icon: CheckCircle2,
              label: "Mastered",
              value: analytics.masteredQuestions,
              color: "text-green-400",
            },
            {
              icon: TrendingUp,
              label: "Revised",
              value: analytics.revisedQuestions,
              color: "text-blue-400",
            },
            {
              icon: Bookmark,
              label: "Bookmarked",
              value: analytics.bookmarkedQuestions,
              color: "text-yellow-400",
            },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon className={`w-3.5 h-3.5 ${color}`} />
                <span className="text-xs text-gray-400">{label}</span>
              </div>
              <span className={`text-sm font-bold ${color}`}>{value}</span>
            </div>
          ))}
        </div>

        {/* Mastered Progress */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-gray-500 mb-1.5">
            <span>Mastered</span>
            <span>{masteredPercentage}%</span>
          </div>
          <ProgressBar percentage={masteredPercentage} color="#22C55E" />
        </div>
      </div>

      {/* MCQ Accuracy */}
      {analytics.mcqQuestions > 0 && (
        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4">
            MCQ Performance
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">Attempted</span>
              <span className="text-sm font-bold text-white">
                {analytics.attemptedMCQs}/{analytics.mcqQuestions}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">Correct</span>
              <span className="text-sm font-bold text-green-400">
                {analytics.correctMCQs}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">Accuracy</span>
              <span className="text-sm font-bold text-indigo-400">
                {analytics.mcqAccuracy}%
              </span>
            </div>
          </div>
          <div className="mt-3">
            <ProgressBar
              percentage={analytics.mcqAccuracy}
              color="#6366F1"
            />
          </div>
        </div>
      )}

      {/* Company Distribution */}
      {companyDistribution.length > 0 && (
        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4">
            Asked By Companies
          </h3>
          <div className="space-y-2">
            {companyDistribution.map(({ name, count }) => (
              <button
                key={name}
                onClick={() =>
                  onCompanyFilter(activeCompany === name ? null : name)
                }
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl border text-left transition-all
                  ${
                    activeCompany === name
                      ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-400"
                      : "bg-gray-700/30 border-gray-700 text-gray-300 hover:border-gray-600"
                  }`}
              >
                <span className="text-xs font-medium">{name}</span>
                <span
                  className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
                    activeCompany === name
                      ? "bg-indigo-500/20 text-indigo-400"
                      : "bg-gray-700 text-gray-400"
                  }`}
                >
                  {count}
                </span>
              </button>
            ))}
          </div>
          {activeCompany && (
            <button
              onClick={() => onCompanyFilter(null)}
              className="w-full mt-2 text-xs text-gray-500 hover:text-white transition-colors py-1"
            >
              Clear filter
            </button>
          )}
        </div>
      )}
    </div>
  );
}