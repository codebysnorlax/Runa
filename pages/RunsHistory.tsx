import React, { useState, useMemo } from "react";
import { useAppContext } from "../context/AppContext";
import Skeleton from "../components/Skeleton";
import Modal from "../components/Modal";
import {
  ArrowUp,
  ArrowDown,
  Minus,
  Edit,
  Trash2,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Run } from "../types";

type SortKey = "date" | "distance_m" | "avg_speed_kmh";
type SortDirection = "asc" | "desc";
type FilterType = "all" | "thisWeek" | "thisMonth" | "last3Months";

const RunsHistorySkeleton: React.FC = () => (
  <div className="space-y-6">
    <Skeleton className="h-9 w-1/3" />
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead>
          <tr>
            <th className="px-6 py-3 w-1/5">
              <Skeleton className="h-5" />
            </th>
            <th className="px-6 py-3 w-1/5">
              <Skeleton className="h-5" />
            </th>
            <th className="px-6 py-3 w-1/5">
              <Skeleton className="h-5" />
            </th>
            <th className="px-6 py-3 w-1/5">
              <Skeleton className="h-5" />
            </th>
            <th className="px-6 py-3 w-1/5">
              <Skeleton className="h-5" />
            </th>
            <th className="px-6 py-3 w-1/5">
              <Skeleton className="h-5" />
            </th>
          </tr>
        </thead>
        <tbody>
          {[...Array(8)].map((_, i) => (
            <tr key={i} className="border-t border-gray-700">
              <td className="px-6 py-4">
                <Skeleton className="h-5" />
              </td>
              <td className="px-6 py-4">
                <Skeleton className="h-5" />
              </td>
              <td className="px-6 py-4">
                <Skeleton className="h-5" />
              </td>
              <td className="px-6 py-4">
                <Skeleton className="h-5" />
              </td>
              <td className="px-6 py-4">
                <Skeleton className="h-5" />
              </td>
              <td className="px-6 py-4">
                <Skeleton className="h-5" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const RunsHistory: React.FC = () => {
  const { runs, deleteRun, loading } = useAppContext();
  const navigate = useNavigate();
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [runToDelete, setRunToDelete] = useState<Run | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredAndSortedRuns = useMemo(() => {
    let filtered = runs;

    // Apply date filter
    const now = new Date();
    if (filterType === "thisWeek") {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filtered = runs.filter((run) => new Date(run.date) >= weekAgo);
    } else if (filterType === "thisMonth") {
      const monthAgo = new Date(now.getFullYear(), now.getMonth(), 1);
      filtered = runs.filter((run) => new Date(run.date) >= monthAgo);
    } else if (filterType === "last3Months") {
      const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);
      filtered = runs.filter((run) => new Date(run.date) >= threeMonthsAgo);
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (run) =>
          run.notes.toLowerCase().includes(searchTerm.toLowerCase()) ||
          new Date(run.date).toLocaleDateString().includes(searchTerm)
      );
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      if (a[sortKey] < b[sortKey]) return -1;
      if (a[sortKey] > b[sortKey]) return 1;
      return 0;
    });

    return sortDirection === "desc" ? sorted.reverse() : sorted;
  }, [runs, sortKey, sortDirection, searchTerm, filterType]);

  const paginatedRuns = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedRuns.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedRuns, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredAndSortedRuns.length / itemsPerPage);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDirection("desc");
    }
  };

  const handleDeleteConfirm = () => {
    if (runToDelete) {
      deleteRun(runToDelete.id);
      setRunToDelete(null);
    }
  };

  const SortableHeader: React.FC<{
    sortKeyId: SortKey;
    children: React.ReactNode;
  }> = ({ sortKeyId, children }) => (
    <th
      scope="col"
      className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer"
      onClick={() => handleSort(sortKeyId)}
    >
      <div className="flex items-center">
        {children}
        {sortKey === sortKeyId && (
          <span className="ml-2">{sortDirection === "desc" ? "▼" : "▲"}</span>
        )}
      </div>
    </th>
  );

  const TrendIndicator: React.FC<{ current: number; previous: number }> = ({
    current,
    previous,
  }) => {
    if (current > previous) {
      return <ArrowUp className="w-4 h-4 text-green-400" />;
    }
    if (current < previous) {
      return <ArrowDown className="w-4 h-4 text-red-400" />;
    }
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  if (loading) {
    return <RunsHistorySkeleton />;
  }

  return (
    <div className="space-y-6 pb-24 lg:pb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">
          Run History
        </h1>

        <div className="text-sm text-gray-400">
          {filteredAndSortedRuns.length} of {runs.length} runs
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="flex gap-2 p-2 sm:p-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-2 sm:py-3 bg-gray-800 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-brand-orange text-sm sm:text-base"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as FilterType)}
            className="pl-8 pr-6 py-2 sm:py-3 bg-gray-800 border border-gray-600 rounded text-white focus:outline-none focus:border-brand-orange appearance-none text-sm sm:text-base"
          >
            <option value="all">All</option>
            <option value="thisWeek">Week</option>
            <option value="thisMonth">Month</option>
            <option value="last3Months">3 Months</option>
          </select>
        </div>
      </div>

      {/* Desktop & Tablet Table View */}
      <div className="hidden md:block">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-800">
              <tr>
                <SortableHeader sortKeyId="date">Date</SortableHeader>
                <SortableHeader sortKeyId="distance_m">
                  Distance
                </SortableHeader>
                <SortableHeader sortKeyId="avg_speed_kmh">
                  Avg Speed
                </SortableHeader>
                <th
                  scope="col"
                  className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                >
                  Time
                </th>
                <th
                  scope="col"
                  className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                >
                  Notes
                </th>
                <th
                  scope="col"
                  className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {paginatedRuns.map((run, index) => {
                const prevRun = paginatedRuns[index + 1];
                return (
                  <tr key={run.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {new Date(run.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      <div className="flex items-center">
                        {(run.distance_m / 1000).toFixed(2)} km
                        {prevRun && (
                          <span className="ml-2">
                            <TrendIndicator
                              current={run.distance_m}
                              previous={prevRun.distance_m}
                            />
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      <div className="flex items-center">
                        {run.avg_speed_kmh.toFixed(2)} km/h
                        {prevRun && (
                          <span className="ml-2">
                            <TrendIndicator
                              current={run.avg_speed_kmh}
                              previous={prevRun.avg_speed_kmh}
                            />
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {Math.floor(run.total_time_sec / 60)}m{" "}
                      {run.total_time_sec % 60}s
                    </td>
                    <td
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 max-w-xs truncate"
                      title={run.notes}
                    >
                      {run.notes}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={() => navigate(`/edit-run/${run.id}`)}
                          className="text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => setRunToDelete(run)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filteredAndSortedRuns.length === 0 && (
          <p className="text-center p-8 text-gray-400">
            {runs.length === 0
              ? "No runs found. Go for a run!"
              : "No runs match your search criteria."}
          </p>
        )}
      </div>

      {/* Mobile Table View */}
      <div className="md:hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-800">
              <tr>
                <th className="px-2 sm:px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                  Date
                </th>
                <th className="px-2 sm:px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                  Dist
                </th>
                <th className="px-2 sm:px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                  Speed
                </th>
                <th className="px-2 sm:px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                  Time
                </th>
                <th className="px-2 sm:px-3 py-3 text-center text-xs font-medium text-gray-300 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {paginatedRuns.map((run, index) => {
                const prevRun = paginatedRuns[index + 1];
                return (
                  <tr key={run.id}>
                    <td className="px-2 sm:px-3 py-3 text-white text-xs sm:text-sm">
                      {new Date(run.date).toLocaleDateString("en", {
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="px-2 sm:px-3 py-3 text-white text-xs sm:text-sm">
                      <div className="flex items-center">
                        {(run.distance_m / 1000).toFixed(1)}km
                        {prevRun && (
                          <span className="ml-1">
                            <TrendIndicator
                              current={run.distance_m}
                              previous={prevRun.distance_m}
                            />
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-2 sm:px-3 py-3 text-white text-xs sm:text-sm">
                      <div className="flex items-center">
                        {run.avg_speed_kmh.toFixed(1)}
                        {prevRun && (
                          <span className="ml-1">
                            <TrendIndicator
                              current={run.avg_speed_kmh}
                              previous={prevRun.avg_speed_kmh}
                            />
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-2 sm:px-3 py-3 text-white text-xs sm:text-sm">
                      {Math.floor(run.total_time_sec / 60)}m
                    </td>
                    <td className="px-2 sm:px-3 py-3">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => navigate(`/edit-run/${run.id}`)}
                          className="p-1.5 sm:p-2 bg-blue-600 hover:bg-blue-700 rounded transition-colors"
                        >
                          <Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                        </button>
                        <button
                          onClick={() => setRunToDelete(run)}
                          className="p-1.5 sm:p-2 bg-red-600 hover:bg-red-700 rounded transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filteredAndSortedRuns.length === 0 && (
          <p className="text-center p-8 text-gray-400">
            {runs.length === 0
              ? "No runs found. Go for a run!"
              : "No runs match your search criteria."}
          </p>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between p-4">
          <div className="text-sm text-gray-400">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="p-3 rounded-lg bg-gray-800 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="px-4 py-2 bg-brand-orange text-white rounded-lg font-medium min-w-[44px] text-center">
              {currentPage}
            </span>
            <button
              onClick={() =>
                setCurrentPage(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}
              className="p-3 rounded-lg bg-gray-800 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
      {runToDelete && (
        <Modal
          isOpen={!!runToDelete}
          onClose={() => setRunToDelete(null)}
          onConfirm={handleDeleteConfirm}
          title="Delete Run"
        >
          Are you sure you want to delete this run from{" "}
          {new Date(runToDelete.date).toLocaleDateString()}? This action cannot
          be undone.
        </Modal>
      )}
    </div>
  );
};

export default RunsHistory;
