"use client";

import { useRouter } from "next/navigation";

interface CompanyCardProps {
  name: string;
  slug: string;
  totalQuestions: number;
  solvedQuestions: number;
  completionPercentage: number;
}

const COMPANY_COLORS: Record<string, string> = {
  amazon: "#FF9900",
  google: "#4285F4",
  microsoft: "#00A4EF",
  adobe: "#FF0000",
  "goldman-sachs": "#6DB4F2",
  atlassian: "#0052CC",
  walmart: "#0071CE",
  uber: "#000000",
  oracle: "#F80000",
  "morgan-stanley": "#003087",
  jpmorgan: "#003087",
  "de-shaw": "#1a1a2e",
  arcesium: "#00B4D8",
  sprinklr: "#6C5CE7",
  flipkart: "#2874F0",
  razorpay: "#3395FF",
  phonepe: "#5F259F",
  zomato: "#E23744",
  swiggy: "#FC8019",
  paytm: "#00BAF2",
};

function CompanyLogo({ name, slug }: { name: string; slug: string }) {
  const color = COMPANY_COLORS[slug] ?? "#6366F1";
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0">
      {/* Logo via logo.dev API */}
      <img
        src={`https://img.logo.dev/${slug}.com?token=pk_X0MvBV7hRRW8GKQbLjEHBg`}
        alt={`${name} logo`}
        className="w-full h-full object-contain p-1"
        onError={(e) => {
          // Hide broken image
          (e.target as HTMLImageElement).style.display = "none";
          // Show fallback
          const fallback = (e.target as HTMLImageElement)
            .nextElementSibling as HTMLElement;
          if (fallback) fallback.style.display = "flex";
        }}
      />
      {/* Initials fallback */}
      <div
        className="absolute inset-0 items-center justify-center text-white font-bold text-sm rounded-xl hidden"
        style={{ backgroundColor: color }}
      >
        {initials}
      </div>
    </div>
  );
}

function ProgressBar({ percentage }: { percentage: number }) {
  const color =
    percentage >= 70
      ? "#22C55E"
      : percentage >= 40
      ? "#F59E0B"
      : "#3B82F6";

  return (
    <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${percentage}%`, backgroundColor: color }}
      />
    </div>
  );
}

export default function CompanyCard({
  name,
  slug,
  totalQuestions,
  solvedQuestions,
  completionPercentage,
}: CompanyCardProps) {
  const router = useRouter();

  return (
    <div
      onClick={() => router.push(`/companies/${slug}`)}
      className="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 cursor-pointer hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-500 transition-all duration-200 hover:-translate-y-0.5"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <CompanyLogo name={name} slug={slug} />
        <div className="min-w-0">
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {name}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {totalQuestions} questions
          </p>
        </div>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs">
          <span className="text-gray-500 dark:text-gray-400">
            {solvedQuestions}/{totalQuestions} solved
          </span>
          <span className="font-semibold text-gray-700 dark:text-gray-300">
            {completionPercentage}%
          </span>
        </div>
        <ProgressBar percentage={completionPercentage} />
      </div>
    </div>
  );
}