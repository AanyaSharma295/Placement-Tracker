"use client";

import { useEffect, useState } from "react";
import CompanyCard from "@/components/companies/CompanyCard";
import { Search, SlidersHorizontal, Building2, Trophy, Target, TrendingUp } from "lucide-react";

interface Company {
  id: string;
  name: string;
  slug: string;
  totalQuestions: number;
  solvedQuestions: number;
  completionPercentage: number;
  difficulty: { easy: number; medium: number; hard: number };
}

type SortOption = "name" | "total" | "solved" | "completion";

const FEATURED_SLUGS = ["amazon", "google", "microsoft", "adobe"];

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortOption>("name");

  useEffect(() => {
    fetch("/api/companies")
      .then((r) => r.json())
      .then((data) => {
        setCompanies(data);
        setLoading(false);
      });
  }, []);

  const featured = companies.filter((c) => FEATURED_SLUGS.includes(c.slug));
  const rest = companies.filter((c) => !FEATURED_SLUGS.includes(c.slug));

  const filtered = rest
    .filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name);
      if (sort === "total") return b.totalQuestions - a.totalQuestions;
      if (sort === "solved") return b.solvedQuestions - a.solvedQuestions;
      if (sort === "completion")
        return b.completionPercentage - a.completionPercentage;
      return 0;
    });

  const totalSolved = companies.reduce((a, c) => a + c.solvedQuestions, 0);
  const totalQuestions = companies.reduce((a, c) => a + c.totalQuestions, 0);
  const companiesStarted = companies.filter(
    (c) => c.solvedQuestions > 0
  ).length;
  const overallCompletion =
    totalQuestions > 0 ? Math.round((totalSolved / totalQuestions) * 100) : 0;
  const mostPrepared = companies.reduce(
    (best, c) =>
      c.completionPercentage > (best?.completionPercentage ?? 0) ? c : best,
    null as Company | null
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-blue-400" />
            </div>
            <h1 className="text-3xl font-bold text-white">Company Questions</h1>
          </div>
          <p className="text-gray-400 ml-13">
            Practice interview questions from top product and finance companies
          </p>
        </div>

        {/* Analytics Cards */}
        {!loading && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            <div className="bg-gray-800 border border-gray-700 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <Building2 className="w-4 h-4 text-blue-400" />
                <span className="text-xs text-gray-400">Companies</span>
              </div>
              <p className="text-2xl font-bold text-white">{companies.length}</p>
              <p className="text-xs text-gray-500 mt-0.5">
                {companiesStarted} started
              </p>
            </div>

            <div className="bg-gray-800 border border-gray-700 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <Target className="w-4 h-4 text-green-400" />
                <span className="text-xs text-gray-400">Solved</span>
              </div>
              <p className="text-2xl font-bold text-white">{totalSolved}</p>
              <p className="text-xs text-gray-500 mt-0.5">
                of {totalQuestions} questions
              </p>
            </div>

            <div className="bg-gray-800 border border-gray-700 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-yellow-400" />
                <span className="text-xs text-gray-400">Completion</span>
              </div>
              <p className="text-2xl font-bold text-white">
                {overallCompletion}%
              </p>
              <p className="text-xs text-gray-500 mt-0.5">overall progress</p>
            </div>

            <div className="bg-gray-800 border border-gray-700 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <Trophy className="w-4 h-4 text-purple-400" />
                <span className="text-xs text-gray-400">Most Prepared</span>
              </div>
              <p className="text-lg font-bold text-white truncate">
                {mostPrepared && mostPrepared.completionPercentage > 0
                  ? mostPrepared.name
                  : "—"}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                {mostPrepared && mostPrepared.completionPercentage > 0
                  ? `${mostPrepared.completionPercentage}% done`
                  : "Start solving!"}
              </p>
            </div>
          </div>
        )}

        {/* Featured Companies */}
        {!loading && featured.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">🔥</span>
              <h2 className="text-lg font-semibold text-white">
                Featured Companies
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {featured.map((company) => (
                <CompanyCard
                  key={company.id}
                  {...company}
                  featured={true}
                />
              ))}
            </div>
          </div>
        )}

        {/* Divider */}
        {!loading && (
          <div className="border-t border-gray-700/50 mb-8" />
        )}

        {/* Search + Sort */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search companies..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-700 bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          <div className="relative">
            <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOption)}
              className="pl-9 pr-8 py-2.5 rounded-xl border border-gray-700 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm appearance-none cursor-pointer"
            >
              <option value="name">Sort: A → Z</option>
              <option value="total">Sort: Most Questions</option>
              <option value="solved">Sort: Most Solved</option>
              <option value="completion">Sort: Completion %</option>
            </select>
          </div>
        </div>

        {/* All Companies Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="bg-gray-800 border border-gray-700 rounded-2xl p-5 animate-pulse"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-11 h-11 bg-gray-700 rounded-xl" />
                  <div className="space-y-2 flex-1">
                    <div className="h-3 bg-gray-700 rounded w-3/4" />
                    <div className="h-2 bg-gray-700 rounded w-1/2" />
                  </div>
                </div>
                <div className="flex gap-2 mb-4">
                  <div className="h-5 w-12 bg-gray-700 rounded-full" />
                  <div className="h-5 w-12 bg-gray-700 rounded-full" />
                  <div className="h-5 w-12 bg-gray-700 rounded-full" />
                </div>
                <div className="space-y-1.5">
                  <div className="h-2 bg-gray-700 rounded" />
                  <div className="h-1.5 bg-gray-700 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 && search ? (
          <div className="text-center py-20 text-gray-500">
            <p className="text-lg font-medium">No companies found</p>
            <p className="text-sm mt-1">Try a different search term</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-4">
              {filtered.length} companies
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filtered.map((company) => (
                <CompanyCard key={company.id} {...company} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}