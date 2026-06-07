"use client";

import { useEffect, useState } from "react";
import CompanyCard from "@/components/companies/CompanyCard";
import { Search, SlidersHorizontal } from "lucide-react";

interface Company {
  id: string;
  name: string;
  slug: string;
  totalQuestions: number;
  solvedQuestions: number;
  completionPercentage: number;
}

type SortOption = "name" | "total" | "solved" | "completion";

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

  const filtered = companies
    .filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name);
      if (sort === "total") return b.totalQuestions - a.totalQuestions;
      if (sort === "solved") return b.solvedQuestions - a.solvedQuestions;
      if (sort === "completion")
        return b.completionPercentage - a.completionPercentage;
      return 0;
    });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Company Questions
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Practice interview questions asked by top companies
          </p>
        </div>

        {/* Search + Sort Bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search companies..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          {/* Sort */}
          <div className="relative">
            <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOption)}
              className="pl-9 pr-8 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm appearance-none cursor-pointer"
            >
              <option value="name">Sort: A → Z</option>
              <option value="total">Sort: Most Questions</option>
              <option value="solved">Sort: Most Solved</option>
              <option value="completion">Sort: Completion %</option>
            </select>
          </div>
        </div>

        {/* Stats Bar */}
        {!loading && (
          <div className="flex gap-6 mb-6 text-sm text-gray-500 dark:text-gray-400">
            <span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {companies.length}
              </span>{" "}
              companies
            </span>
            <span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {companies.reduce((a, c) => a + c.totalQuestions, 0)}
              </span>{" "}
              total questions
            </span>
            <span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {companies.reduce((a, c) => a + c.solvedQuestions, 0)}
              </span>{" "}
              solved
            </span>
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 animate-pulse"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl" />
                  <div className="space-y-2 flex-1">
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400 dark:text-gray-500">
            <p className="text-lg font-medium">No companies found</p>
            <p className="text-sm mt-1">Try a different search term</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((company) => (
              <CompanyCard key={company.id} {...company} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}