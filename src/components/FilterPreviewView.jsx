import React, { useState } from "react";
import {
  Filter,
  Search,
  ArrowUpDown,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Hash,
  Type,
  Calendar,
  Layers,
  ChevronDown,
  Sliders,
  Eye,
} from "lucide-react";
import { filterAndSearchData } from "../utils/dataProcessor";

export default function FilterPreviewView({
  data,
  stats,
  filters,
  setFilters,
  onProceed,
}) {
  const [searchKeyword, setSearchKeyword] = useState("");
  const [sortCol, setSortCol] = useState("");
  const [sortDir, setSortDir] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const columns = stats.columns || [];
  const columnTypes = stats.columnTypes || {};

  // Filter and sort the dataset in real-time
  const filteredRows = filterAndSearchData(
    data,
    filters,
    searchKeyword,
    sortCol ? { key: sortCol, direction: sortDir } : null
  );

  const totalPages = Math.ceil(filteredRows.length / rowsPerPage) || 1;
  const paginatedRows = filteredRows.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  // Helper for multi-select categorical filter toggle
  const toggleCategoricalFilter = (col, value) => {
    const current = filters[col]?.selected || [];
    const isPresent = current.includes(value);
    const updated = isPresent ? current.filter((v) => v !== value) : [...current, value];

    if (updated.length === 0) {
      const next = { ...filters };
      delete next[col];
      setFilters(next);
    } else {
      setFilters({
        ...filters,
        [col]: { type: "categorical", selected: updated },
      });
    }
    setCurrentPage(1);
  };

  const setNumericMinMax = (col, minVal, maxVal) => {
    if (minVal === "" && maxVal === "") {
      const next = { ...filters };
      delete next[col];
      setFilters(next);
    } else {
      setFilters({
        ...filters,
        [col]: { type: "numeric", min: minVal, max: maxVal },
      });
    }
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    setFilters({});
    setSearchKeyword("");
    setSortCol("");
    setCurrentPage(1);
  };

  const activeFilterCount = Object.keys(filters).length + (searchKeyword ? 1 : 0);

  return (
    <div className="max-w-7xl mx-auto py-4 px-2 sm:px-4 space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-mono text-xs font-semibold border border-amber-500/20">
              Step 3 of 5
            </span>
            <h2 className="text-xl font-bold text-slate-100">Column Schema & Dynamic Filtering</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Explore column statistics, distributions, and apply granular slice-and-dice filters.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {activeFilterCount > 0 && (
            <button
              onClick={clearAllFilters}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-semibold border border-slate-700 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filters ({activeFilterCount})</span>
            </button>
          )}

          <button
            onClick={onProceed}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all"
          >
            <span>Open Interactive Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Active Filter Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-[11px] text-slate-400 font-semibold uppercase">Total Rows</span>
          <div className="text-2xl font-bold font-mono text-slate-100 mt-1">{data.length}</div>
          <span className="text-[11px] text-slate-400">In memory dataset</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-[11px] text-slate-400 font-semibold uppercase">Filtered Matching</span>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
            {filteredRows.length}
          </div>
          <span className="text-[11px] text-emerald-400/80">
            {((filteredRows.length / (data.length || 1)) * 100).toFixed(0)}% of total rows
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-[11px] text-slate-400 font-semibold uppercase">Active Slicers</span>
          <div className="text-2xl font-bold font-mono text-amber-400 mt-1">
            {activeFilterCount}
          </div>
          <span className="text-[11px] text-slate-400">Rules currently applied</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-[11px] text-slate-400 font-semibold uppercase">Columns</span>
          <div className="text-2xl font-bold font-mono text-cyan-400 mt-1">
            {columns.length}
          </div>
          <span className="text-[11px] text-slate-400">Dimensions & Metrics</span>
        </div>
      </div>

      {/* Slicers & Column Profiler */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Slicer Sidebar */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                Filter Slicers
              </h3>
            </div>
            {activeFilterCount > 0 && (
              <button
                onClick={clearAllFilters}
                className="text-[11px] text-amber-400 hover:underline"
              >
                Clear
              </button>
            )}
          </div>

          {/* Global Search */}
          <div>
            <label className="block text-[11px] font-bold text-slate-300 mb-1.5">
              Quick Search (All Columns)
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search any text or number..."
                value={searchKeyword}
                onChange={(e) => {
                  setSearchKeyword(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Column Specific Slicers */}
          <div className="space-y-4 max-h-[480px] overflow-y-auto pr-1">
            {columns.map((col) => {
              const type = columnTypes[col]?.type;
              const isNumeric = type === "numeric";
              const catStats = stats.categoricalStats?.[col];
              const numStats = stats.numericStats?.[col];

              if (isNumeric && numStats) {
                const currentMin = filters[col]?.min ?? "";
                const currentMax = filters[col]?.max ?? "";

                return (
                  <div key={col} className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-200 mb-2">
                      <span className="truncate">{col}</span>
                      <span className="text-[10px] font-mono text-amber-400">Numeric Range</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block mb-0.5">Min (≥ {numStats.min})</span>
                        <input
                          type="number"
                          placeholder={String(numStats.min)}
                          value={currentMin}
                          onChange={(e) => setNumericMinMax(col, e.target.value, currentMax)}
                          className="w-full bg-slate-900 border border-slate-700 rounded p-1 text-xs text-slate-100"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block mb-0.5">Max (≤ {numStats.max})</span>
                        <input
                          type="number"
                          placeholder={String(numStats.max)}
                          value={currentMax}
                          onChange={(e) => setNumericMinMax(col, currentMin, e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded p-1 text-xs text-slate-100"
                        />
                      </div>
                    </div>
                  </div>
                );
              }

              if (catStats && catStats.topValues.length > 0) {
                const selectedList = filters[col]?.selected || [];

                return (
                  <div key={col} className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-200 mb-2">
                      <span className="truncate">{col}</span>
                      <span className="text-[10px] font-mono text-cyan-400">
                        {selectedList.length ? `${selectedList.length} picked` : "All"}
                      </span>
                    </div>
                    <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                      {catStats.topValues.map((v) => {
                        const isChecked = selectedList.includes(v.name);
                        return (
                          <label
                            key={v.name}
                            className="flex items-center justify-between text-xs text-slate-300 hover:text-white cursor-pointer select-none py-0.5"
                          >
                            <div className="flex items-center gap-2 truncate">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleCategoricalFilter(col, v.name)}
                                className="rounded bg-slate-900 border-slate-700 text-amber-500 focus:ring-0"
                              />
                              <span className="truncate">{v.name}</span>
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono">
                              ({v.count})
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              }

              return null;
            })}
          </div>
        </div>

        {/* Data Table & Column Profile Cards */}
        <div className="lg:col-span-3 space-y-6">
          {/* Column Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {columns.map((col) => {
              const type = columnTypes[col]?.type || "text";
              const numStat = stats.numericStats?.[col];
              const catStat = stats.categoricalStats?.[col];

              return (
                <div
                  key={col}
                  className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-200 truncate">{col}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                      {type}
                    </span>
                  </div>

                  {type === "numeric" && numStat ? (
                    <div className="text-[11px] text-slate-400 space-y-1 font-mono">
                      <div className="flex justify-between">
                        <span>Average (Mean):</span>
                        <span className="text-amber-400 font-bold">{numStat.mean}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Range (Min - Max):</span>
                        <span>
                          {numStat.min} - {numStat.max}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Sum:</span>
                        <span className="text-slate-300">{numStat.sum.toLocaleString()}</span>
                      </div>
                    </div>
                  ) : catStat ? (
                    <div className="text-[11px] text-slate-400 space-y-1">
                      <div className="flex justify-between">
                        <span>Unique Values:</span>
                        <span className="text-cyan-400 font-mono font-bold">
                          {catStat.uniqueCount}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        Top: {catStat.topValues.map((v) => v.name).join(", ")}
                      </div>
                    </div>
                  ) : (
                    <div className="text-[11px] text-slate-400">Standard text metric</div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Interactive Paginated Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-200">
                  Filtered Dataset Table ({filteredRows.length} matches)
                </h3>
                <p className="text-xs text-slate-400">
                  Click column headers to sort ascending / descending
                </p>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/60">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-900/90 border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                    <th className="p-3 w-12 text-center">#</th>
                    {columns.map((col) => {
                      const isSorted = sortCol === col;
                      return (
                        <th
                          key={col}
                          onClick={() => {
                            if (sortCol === col) {
                              setSortDir(sortDir === "asc" ? "desc" : "asc");
                            } else {
                              setSortCol(col);
                              setSortDir("asc");
                            }
                          }}
                          className="p-3 cursor-pointer hover:text-amber-400 transition-colors whitespace-nowrap"
                        >
                          <div className="flex items-center gap-1.5">
                            <span>{col}</span>
                            <ArrowUpDown
                              className={`w-3 h-3 ${isSorted ? "text-amber-400" : "text-slate-600"}`}
                            />
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850 text-slate-300">
                  {paginatedRows.length === 0 ? (
                    <tr>
                      <td colSpan={columns.length + 1} className="p-8 text-center text-slate-500">
                        No rows match the specified filter criteria. Try resetting slicers.
                      </td>
                    </tr>
                  ) : (
                    paginatedRows.map((row, idx) => {
                      const globalIdx = (currentPage - 1) * rowsPerPage + idx + 1;
                      return (
                        <tr key={idx} className="hover:bg-slate-900/60 transition-colors">
                          <td className="p-3 text-center text-slate-400 font-mono text-[11px]">
                            {globalIdx}
                          </td>
                          {columns.map((col) => (
                            <td key={col} className="p-3 truncate max-w-[200px]">
                              {row[col] !== null && row[col] !== undefined ? (
                                typeof row[col] === "number" ? (
                                  <span className="font-mono text-amber-300/90">{row[col]}</span>
                                ) : (
                                  String(row[col])
                                )
                              ) : (
                                <span className="text-slate-600 italic">null</span>
                              )}
                            </td>
                          ))}
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between text-xs text-slate-400 pt-2">
              <span>
                Showing {(currentPage - 1) * rowsPerPage + 1} to{" "}
                {Math.min(currentPage * rowsPerPage, filteredRows.length)} of {filteredRows.length} rows
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 transition-colors"
                >
                  Previous
                </button>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
