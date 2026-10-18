import React, { useState } from "react";
import {
  ShieldCheck,
  Trash2,
  Sparkles,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Info,
  Calendar,
  Hash,
  Type,
  ToggleLeft,
  ToggleRight,
  ListFilter,
  ArrowUpDown,
  Search,
} from "lucide-react";
import { cleanDataset } from "../utils/dataProcessor";
import { calculateDataQualityBreakdown } from "../utils/aiInsights";

export default function DataCleaningView({
  rawData,
  cleanedData,
  stats,
  onApplyCleaning,
  onProceed,
}) {
  // Cleaning options state
  const [removeDuplicates, setRemoveDuplicates] = useState(true);
  const [missingValueAction, setMissingValueAction] = useState("fill"); // 'drop' | 'fill' | 'none'
  const [numericFillStrategy, setNumericFillStrategy] = useState("mean"); // 'mean' | 'median' | 'zero'
  const [textFillStrategy, setTextFillStrategy] = useState("Unknown"); // 'Unknown' | 'custom'
  const [customTextFill, setCustomTextFill] = useState("Not Specified");
  const [trimWhitespace, setTrimWhitespace] = useState(true);
  const [standardizeCase, setStandardizeCase] = useState("none"); // 'none' | 'lower' | 'upper'

  // Table preview controls
  const [previewFilterCol, setPreviewFilterCol] = useState("");
  const [previewSearch, setPreviewSearch] = useState("");
  const [sortCol, setSortCol] = useState("");
  const [sortDir, setSortDir] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 8;

  // Track if clean was executed
  const [cleaningReport, setCleaningReport] = useState(null);

  const handleRunCleaning = () => {
    const result = cleanDataset(rawData, {
      removeDuplicates,
      missingValueAction,
      numericFillStrategy,
      textFillStrategy,
      customTextFill,
      trimWhitespace,
      standardizeCase,
    });

    setCleaningReport(result);
    onApplyCleaning(result.cleanedData);
  };

  // Preview data selection
  const displayData = cleanedData.length > 0 ? cleanedData : rawData;
  const columns = stats.columns || (displayData[0] ? Object.keys(displayData[0]) : []);

  // Filter and sort for preview table
  let tableData = [...displayData];
  if (previewSearch.trim()) {
    const q = previewSearch.toLowerCase();
    tableData = tableData.filter((row) =>
      Object.values(row).some((val) => String(val ?? "").toLowerCase().includes(q))
    );
  }

  if (sortCol) {
    tableData.sort((a, b) => {
      const valA = a[sortCol];
      const valB = b[sortCol];
      if (valA === valB) return 0;
      if (valA === null || valA === undefined) return 1;
      if (valB === null || valB === undefined) return -1;
      if (typeof valA === "number" && typeof valB === "number") {
        return sortDir === "asc" ? valA - valB : valB - valA;
      }
      return sortDir === "asc"
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });
  }

  const totalPages = Math.ceil(tableData.length / rowsPerPage) || 1;
  const paginatedRows = tableData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const getColIcon = (type) => {
    switch (type) {
      case "numeric":
        return <Hash className="w-3.5 h-3.5 text-amber-400" />;
      case "date":
        return <Calendar className="w-3.5 h-3.5 text-cyan-400" />;
      default:
        return <Type className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-4 px-2 sm:px-4 space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-mono text-xs font-semibold border border-amber-500/20">
              Step 2 of 5
            </span>
            <h2 className="text-xl font-bold text-slate-100">Data Cleaning & Quality Engine</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Detect anomalies, strip duplicate entries, impute missing values, and verify column data types.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRunCleaning}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Apply Data Cleaning Rules</span>
          </button>
          <button
            onClick={onProceed}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold text-xs border border-slate-700 transition-all"
          >
            <span>Proceed to Filter & Preview</span>
            <ArrowRight className="w-4 h-4 text-amber-400" />
          </button>
        </div>
      </div>

      {/* Before vs After Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Raw Input Rows
          </div>
          <div className="text-2xl font-bold font-mono text-slate-100 mt-1">
            {stats.rawRowCount || rawData.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Original dataset count</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Cleaned Output Rows
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
            {cleanedData.length > 0 ? cleanedData.length : rawData.length}
          </div>
          <div className="text-[11px] text-emerald-400/80 mt-1">
            {cleanedData.length > 0
              ? `${rawData.length - cleanedData.length} rows adjusted/filtered`
              : "Awaiting clean rule application"}
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Duplicate Rows Found
          </div>
          <div className="text-2xl font-bold font-mono text-amber-400 mt-1">
            {stats.duplicateCount || 0}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {removeDuplicates ? "Will be purged on clean" : "Retained in dataset"}
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Columns Classified
          </div>
          <div className="text-2xl font-bold font-mono text-cyan-400 mt-1">
            {stats.columnCount || columns.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Numeric, Categorical, Dates</div>
        </div>
      </div>

      {/* Data Quality Health Breakdown Bar (Feature #5) */}
      {(() => {
        const quality = calculateDataQualityBreakdown(rawData, cleanedData, stats);
        return (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="text-sm font-bold text-slate-100">
                    Comprehensive Data Quality Index
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Evaluates missing data density, duplicate rows, empty columns, and type integrity
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-400">Overall Score:</span>
                <span
                  className={`text-base font-bold font-mono ${
                    quality.overallScore >= 85
                      ? "text-emerald-400"
                      : quality.overallScore >= 70
                      ? "text-amber-400"
                      : "text-rose-400"
                  }`}
                >
                  {quality.overallScore} / 100
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">Missing Values Health:</span>
                  <span className="font-mono text-emerald-400 font-bold">{quality.missingScore}%</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${quality.missingScore}%` }} />
                </div>
                <span className="text-[10px] text-slate-500 block">{quality.missingRate}% total missing cells</span>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">Uniqueness / Dedupe:</span>
                  <span className="font-mono text-amber-400 font-bold">{quality.duplicateScore}%</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-amber-400 h-full rounded-full" style={{ width: `${quality.duplicateScore}%` }} />
                </div>
                <span className="text-[10px] text-slate-500 block">{quality.duplicateCount} duplicate row(s)</span>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">Column Completeness:</span>
                  <span className="font-mono text-cyan-400 font-bold">{quality.emptyColScore}%</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-cyan-400 h-full rounded-full" style={{ width: `${quality.emptyColScore}%` }} />
                </div>
                <span className="text-[10px] text-slate-500 block">{quality.emptyColsCount} empty columns</span>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">Type Integrity:</span>
                  <span className="font-mono text-purple-400 font-bold">{quality.typeIntegrityScore}%</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-purple-400 h-full rounded-full" style={{ width: `${quality.typeIntegrityScore}%` }} />
                </div>
                <span className="text-[10px] text-slate-500 block">Valid numeric & date schema</span>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Cleaning Controls Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Rules & Settings */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-slate-200">Cleaning Rules & Handlers</h3>
          </div>

          {/* 1. Duplicate Rows */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-200 block">Remove Duplicate Rows</span>
                <span className="text-[11px] text-slate-400">Purge redundant identical records</span>
              </div>
              <button
                type="button"
                onClick={() => setRemoveDuplicates(!removeDuplicates)}
                className={`p-1 rounded-lg transition-colors ${
                  removeDuplicates ? "text-amber-400" : "text-slate-600"
                }`}
              >
                {removeDuplicates ? (
                  <ToggleRight className="w-8 h-8 fill-amber-400/20" />
                ) : (
                  <ToggleLeft className="w-8 h-8" />
                )}
              </button>
            </div>
          </div>

          {/* 2. Missing Value Strategy */}
          <div className="space-y-2 border-t border-slate-800/80 pt-4">
            <label className="block text-xs font-bold text-slate-200 mb-1">
              Missing Values Treatment
            </label>
            <select
              value={missingValueAction}
              onChange={(e) => setMissingValueAction(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
            >
              <option value="fill">Impute / Fill with smart defaults</option>
              <option value="drop">Drop rows containing any nulls</option>
              <option value="none">Keep missing as empty/NaN</option>
            </select>

            {missingValueAction === "fill" && (
              <div className="pt-2 space-y-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Numeric Columns Fill Strategy:
                  </label>
                  <select
                    value={numericFillStrategy}
                    onChange={(e) => setNumericFillStrategy(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-md px-2.5 py-1.5 text-xs text-slate-200"
                  >
                    <option value="mean">Column Mean (Average)</option>
                    <option value="median">Column Median (Middle Value)</option>
                    <option value="zero">Zero (0)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Text / Category Fill Strategy:
                  </label>
                  <select
                    value={textFillStrategy}
                    onChange={(e) => setTextFillStrategy(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-md px-2.5 py-1.5 text-xs text-slate-200"
                  >
                    <option value="Unknown">"Unknown"</option>
                    <option value="N/A">"N/A"</option>
                    <option value="custom">Custom Text...</option>
                  </select>
                </div>

                {textFillStrategy === "custom" && (
                  <input
                    type="text"
                    placeholder="Enter custom placeholder..."
                    value={customTextFill}
                    onChange={(e) => setCustomTextFill(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-md px-2.5 py-1.5 text-xs text-slate-100"
                  />
                )}
              </div>
            )}
          </div>

          {/* 3. Text Formatting */}
          <div className="space-y-2 border-t border-slate-800/80 pt-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-200 block">Trim Whitespace</span>
                <span className="text-[11px] text-slate-400">Strip trailing and leading spaces</span>
              </div>
              <button
                type="button"
                onClick={() => setTrimWhitespace(!trimWhitespace)}
                className={`p-1 rounded-lg transition-colors ${
                  trimWhitespace ? "text-amber-400" : "text-slate-600"
                }`}
              >
                {trimWhitespace ? (
                  <ToggleRight className="w-8 h-8 fill-amber-400/20" />
                ) : (
                  <ToggleLeft className="w-8 h-8" />
                )}
              </button>
            </div>

            <div className="pt-2">
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Standardize Text Casing
              </label>
              <select
                value={standardizeCase}
                onChange={(e) => setStandardizeCase(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
              >
                <option value="none">Preserve Original Casing</option>
                <option value="lower">Lowercase (all text)</option>
                <option value="upper">UPPERCASE (all text)</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleRunCleaning}
            className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-sm transition-all"
          >
            Execute Cleaning Engine
          </button>
        </div>

        {/* Right Column: Column Schema & Cleaning Logs */}
        <div className="lg:col-span-2 space-y-6">
          {/* Column Schema & Missing Analysis */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="text-sm font-bold text-slate-200">
                Column Schema & Missing Values Breakdown
              </h3>
              <span className="text-xs text-slate-400">{columns.length} columns detected</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {columns.map((col) => {
                const typeObj = stats.columnTypes?.[col] || { type: "text" };
                const missingInfo = stats.missingByColumn?.[col] || { count: 0, percentage: 0 };

                return (
                  <div
                    key={col}
                    className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-xs font-bold text-slate-200 truncate" title={col}>
                          {col}
                        </span>
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300">
                          {getColIcon(typeObj.type)}
                          {typeObj.type}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        {typeObj.uniqueCount ? `${typeObj.uniqueCount} distinct values` : "Categorical"}
                      </p>
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px]">
                      <span className="text-slate-500">Missing values:</span>
                      <span
                        className={`font-mono font-semibold ${
                          missingInfo.count > 0 ? "text-amber-400" : "text-emerald-400"
                        }`}
                      >
                        {missingInfo.count} ({missingInfo.percentage}%)
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cleaning Audit Log */}
          {cleaningReport && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 animate-in fade-in duration-200">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold mb-3">
                <CheckCircle2 className="w-4 h-4" />
                <span>Cleaning Execution Audit Trail</span>
              </div>
              <div className="bg-slate-950 rounded-xl p-3 border border-slate-800 font-mono text-[11px] space-y-1 text-slate-300">
                {cleaningReport.log.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="text-amber-400">✓</span>
                    <span>{item}</span>
                  </div>
                ))}
                <div className="pt-2 text-slate-400 text-[10px]">
                  Rows: {cleaningReport.beforeCount} raw ➔ {cleaningReport.afterCount} cleaned | Duplicates removed: {cleaningReport.duplicatesRemoved} | Imputed values: {cleaningReport.missingValuesHandled}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Dataset Preview Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-200">
              Cleaned Dataset Preview Table
            </h3>
            <p className="text-xs text-slate-400">
              Showing {tableData.length} records • Click column headers to sort
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search table rows..."
                value={previewSearch}
                onChange={(e) => {
                  setPreviewSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-slate-950 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 w-48 sm:w-60"
              />
            </div>
          </div>
        </div>

        {/* Responsive Table */}
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
                          className={`w-3 h-3 ${
                            isSorted ? "text-amber-400" : "text-slate-600"
                          }`}
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
                    No rows match the search query.
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
                            <span className="text-rose-400/80 italic">null</span>
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

        {/* Pagination footer */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-2">
          <span>
            Page {currentPage} of {totalPages} ({tableData.length} records)
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
  );
}
