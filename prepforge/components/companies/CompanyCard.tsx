"use client";

import { useRouter } from "next/navigation";

interface CompanyCardProps {
  name: string;
  slug: string;
  totalQuestions: number;
  solvedQuestions: number;
  completionPercentage: number;
  difficulty: { easy: number; medium: number; hard: number };
  featured?: boolean;
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

function CompanyLogo({
  name,
  slug,
  size = "md",
}: {
  name: string;
  slug: string;
  size?: "md" | "lg";
}) {
  const color = COMPANY_COLORS[slug] ?? "#3B82F6";
  const domain = LOGO_DOMAINS[slug] ?? `${slug}.com`;
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const sizeClass = size === "lg" ? "w-16 h-16" : "w-11 h-11";
  const textSize = size === "lg" ? "text-lg" : "text-sm";

  return (
    <div className={`relative ${sizeClass} rounded-xl overflow-hidden flex-shrink-0 bg-gray-800`}>
      <img
        src={`https://img.logo.dev/${domain}?token=pk_X0MvBV7hRRW8GKQbLjEHBg&size=64`}
        alt={`${name} logo`}
        className="w-full h-full object-contain p-1.5"
        onError={(e) => {
          const img = e.target as HTMLImageElement;
          img.style.display = "none";
          const fallback = img.nextElementSibling as HTMLElement;
          if (fallback) fallback.style.display = "flex";
        }}
      />
      <div
        className={`absolute inset-0 items-center justify-center text-white font-bold ${textSize} rounded-xl hidden`}
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
    <div className="w-full bg-gray-700 rounded-full h-1.5 overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-700"
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
  difficulty,
  featured = false,
}: CompanyCardProps) {
  const router = useRouter();

  return (
    <div
      onClick={() => router.push(`/companies/${slug}`)}
      className={`group bg-gray-800 border border-gray-700 rounded-2xl cursor-pointer 
        hover:shadow-xl hover:shadow-blue-500/10 hover:border-blue-500/50 
        transition-all duration-200 hover:-translate-y-1
        ${featured ? "p-6" : "p-5"}`}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <CompanyLogo name={name} slug={slug} size={featured ? "lg" : "md"} />
        <div className="min-w-0 flex-1">
          <h3
            className={`font-semibold text-white truncate group-hover:text-blue-400 transition-colors
              ${featured ? "text-base" : "text-sm"}`}
          >
            {name}
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            {totalQuestions} questions
          </p>
        </div>
        {completionPercentage > 0 && (
          <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full flex-shrink-0">
            {completionPercentage}%
          </span>
        )}
      </div>

      {/* Difficulty Breakdown */}
      <div className="flex gap-2 mb-4">
        <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 font-medium">
          E: {difficulty.easy}
        </span>
        <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 font-medium">
          M: {difficulty.medium}
        </span>
        <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 font-medium">
          H: {difficulty.hard}
        </span>
      </div>

      {/* Progress */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs text-gray-400">
          <span>{solvedQuestions} solved</span>
          <span>{totalQuestions - solvedQuestions} remaining</span>
        </div>
        <ProgressBar percentage={completionPercentage} />
      </div>
    </div>
  );
}