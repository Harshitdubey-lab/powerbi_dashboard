import React, { useState } from "react";
import {
  Plus,
  Filter,
  Search,
  RotateCcw,
  Sparkles,
  TrendingUp,
  Database,
  Calendar,
  Layers,
  Calculator,
  Award,
  Download,
  BarChart3,
  SlidersHorizontal,
  Table as TableIcon,
  Save,
  CheckCircle2,
  Edit2,
  Palette,
  Bot,
  ChevronRight,
  HelpCircle,
} from "lucide-react";
import ChartRenderer from "./ChartRenderer";
import CustomChartModal from "./CustomChartModal";
import { filterAndSearchData } from "../utils/dataProcessor";
import { generateSmartAIInsights } from "../utils/aiInsights";
import { saveDashboardToStorage } from "../utils/storage";
import { isSupabaseConfigured } from "../utils/supabase";

const THEME_PRESETS = [
  { id: "amber", name: "Power BI Gold", primary: "#f59e0b", ring: "ring-amber-500", bg: "bg-amber-500" },
  { id: "cyan", name: "Cyber Cyan", primary: "#06b6d4", ring: "ring-cyan-500", bg: "bg-cyan-500" },
  { id: "emerald", name: "Emerald Growth", primary: "#10b981", ring: "ring-emerald-500", bg: "bg-emerald-500" },
  { id: "purple", name: "Electric Purple", primary: "#8b5cf6", ring: "ring-purple-500", bg: "bg-purple-500" },
  { id: "blue", name: "Cobalt Blue", primary: "#3b82f6", ring: "ring-blue-500", bg: "bg-blue-500" },
  { id: "rose", name: "Ruby Sunset", primary: "#ec4899", ring: "ring-rose-500", bg: "bg-rose-500" },
];

export default function DashboardView({
  data,
  rawData = [],
  stats,
  kpiCards = [],
  charts = [],
  setCharts,
  filters,
  setFilters,
  datasetName,
  datasetPurpose,
  dashboardTitle,
  setDashboardTitle,
  onNavigateToExport,
}) {
  const [searchKeyword, setSearchKeyword] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingChart, setEditingChart] = useState(null);
  const [selectedDrilldown, setSelectedDrilldown] = useState(null);
  const [showSummaryTable, setShowSummaryTable] = useState(false);
  const [showAiInsights, setShowAiInsights] = useState(true);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [currentTheme, setCurrentTheme] = useState("amber");
  const [toastMsg, setToastMsg] = useState("");

  const columns = stats.columns || [];
  const columnTypes = stats.columnTypes || {};

  // Generate smart AI insights
  const aiInsights = generateSmartAIInsights(data, rawData, stats, datasetPurpose);

  // Filtered dataset
  const filteredData = filterAndSearchData(data, filters, searchKeyword);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3500);
  };

  const handleSaveDashboard = () => {
    const dashboardObj = {
      id: `dash-${datasetName.replace(/\s+/g, "-").toLowerCase()}`,
      title: dashboardTitle || datasetName,
      datasetName,
      purpose: datasetPurpose,
      data,
      rawData,
      kpiCards,
      charts,
      filters,
      theme: currentTheme,
      rowCount: data.length,
    };
    saveDashboardToStorage(dashboardObj);
    showToast(
      isSupabaseConfigured
        ? "Dashboard saved & synced to Supabase Cloud!"
        : "Dashboard saved to local library!"
    );
  };

  // Dynamic KPI calculation
  const dynamicKpis = kpiCards.map((kpi) => {
    if (kpi.id === "kpi-records") {
      return { ...kpi, value: filteredData.length.toLocaleString() };
    }
    if (kpi.metricCol && kpi.agg) {
      const values = filteredData
        .map((r) => Number(r[kpi.metricCol]))
        .filter((v) => !isNaN(v));

      if (values.length === 0) return { ...kpi, value: "0" };

      if (kpi.agg === "sum") {
        const sum = values.reduce((a, b) => a + b, 0);
        const isCurr = kpi.metricCol.toLowerCase().includes("revenue") ||
          kpi.metricCol.toLowerCase().includes("price") ||
          kpi.metricCol.toLowerCase().includes("profit") ||
          kpi.metricCol.toLowerCase().includes("cost") ||
          kpi.metricCol.toLowerCase().includes("budget");
        return {
          ...kpi,
          value: isCurr ? (sum >= 1000 ? `$${(sum / 1000).toFixed(1)}k` : `$${sum.toFixed(2)}`) : sum >= 1000 ? `${(sum / 1000).toFixed(1)}k` : sum.toLocaleString(),
        };
      }
      if (kpi.agg === "avg") {
        const sum = values.reduce((a, b) => a + b, 0);
        const avg = sum / values.length;
        return { ...kpi, value: avg.toFixed(2) };
      }
      if (kpi.agg === "max") {
        return { ...kpi, value: Math.max(...values).toLocaleString() };
      }
    }
    return kpi;
  });

  const handleAddChart = (newChart) => {
    if (editingChart) {
      setCharts(charts.map((c) => (c.id === newChart.id ? newChart : c)));
    } else {
      setCharts([...charts, newChart]);
    }
  };

  const handleDeleteChart = (chartId) => {
    setCharts(charts.filter((c) => c.id !== chartId));
  };

  const handleEditChart = (chart) => {
    setEditingChart(chart);
    setIsModalOpen(true);
  };

  const handleChangeChartType = (chartId, newType) => {
    setCharts(
      charts.map((c) => (c.id === chartId ? { ...c, type: newType } : c))
    );
  };

  const handleMoveUp = (chartId) => {
    const idx = charts.findIndex((c) => c.id === chartId);
    if (idx > 0) {
      const copy = [...charts];
      const temp = copy[idx - 1];
      copy[idx - 1] = copy[idx];
      copy[idx] = temp;
      setCharts(copy);
    }
  };

  const handleMoveDown = (chartId) => {
    const idx = charts.findIndex((c) => c.id === chartId);
    if (idx < charts.length - 1) {
      const copy = [...charts];
      const temp = copy[idx + 1];
      copy[idx + 1] = copy[idx];
      copy[idx] = temp;
      setCharts(copy);
    }
  };

  const handleDrilldown = (col, val) => {
    if (filters[col]?.selected?.includes(val)) {
      const next = { ...filters };
      delete next[col];
      setFilters(next);
      setSelectedDrilldown(null);
    } else {
      setFilters({
        ...filters,
        [col]: { type: "categorical", selected: [val] },
      });
      setSelectedDrilldown({ col, val });
    }
  };

  const clearAllFilters = () => {
    setFilters({});
    setSearchKeyword("");
    setSelectedDrilldown(null);
  };

  const activeFilterCount = Object.keys(filters).length + (searchKeyword ? 1 : 0);

  const getKpiIcon = (iconName) => {
    switch (iconName) {
      case "trending-up":
        return <TrendingUp className="w-5 h-5 text-amber-400" />;
      case "calculator":
        return <Calculator className="w-5 h-5 text-emerald-400" />;
      case "award":
        return <Award className="w-5 h-5 text-purple-400" />;
      case "layers":
        return <Layers className="w-5 h-5 text-cyan-400" />;
      case "database":
      default:
        return <Database className="w-5 h-5 text-blue-400" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-3 px-2 sm:px-4 space-y-5" id="dashboard-canvas">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-500 text-slate-950 font-bold px-4 py-2 rounded-xl shadow-2xl flex items-center gap-2 text-xs">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Banner with Inline Title Rename & Controls */}
      <div className="no-print bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Title Editor */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 rounded-xl border border-amber-500/30 shrink-0">
              <SlidersHorizontal className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              {isEditingTitle ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={dashboardTitle}
                    onChange={(e) => setDashboardTitle(e.target.value)}
                    className="bg-slate-950 border border-amber-500 rounded-lg px-2.5 py-1 text-sm font-bold text-white focus:outline-none"
                    autoFocus
                    onBlur={() => setIsEditingTitle(false)}
                    onKeyDown={(e) => e.key === "Enter" && setIsEditingTitle(false)}
                  />
                  <button
                    onClick={() => setIsEditingTitle(false)}
                    className="px-2 py-1 bg-amber-500 text-slate-950 rounded text-xs font-bold"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 group">
                  <h2 className="text-base sm:text-lg font-bold text-slate-100">
                    {dashboardTitle || datasetName}
                  </h2>
                  <button
                    onClick={() => setIsEditingTitle(true)}
                    className="p-1 text-slate-400 hover:text-amber-400 transition-colors"
                    title="Rename Dashboard"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    {filteredData.length} records active
                  </span>
                </div>
              )}
              <p className="text-xs text-slate-400 mt-0.5">
                {datasetPurpose} • Interactive Power BI Canvas
              </p>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Theme Picker */}
            <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1.5 rounded-xl border border-slate-800">
              <Palette className="w-3.5 h-3.5 text-slate-400" />
              <div className="flex items-center gap-1">
                {THEME_PRESETS.map((th) => (
                  <button
                    key={th.id}
                    onClick={() => setCurrentTheme(th.id)}
                    className={`w-4 h-4 rounded-full ${th.bg} transition-all ${
                      currentTheme === th.id ? "ring-2 ring-white scale-110" : "opacity-70 hover:opacity-100"
                    }`}
                    title={`Theme: ${th.name}`}
                  />
                ))}
              </div>
            </div>

            {/* AI Insights Toggle */}
            <button
              onClick={() => setShowAiInsights(!showAiInsights)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                showAiInsights
                  ? "bg-purple-500/15 text-purple-300 border-purple-500/40 shadow-xs"
                  : "bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200"
              }`}
            >
              <Bot className="w-3.5 h-3.5 text-purple-400" />
              <span>Smart AI Insights</span>
            </button>

            {/* Save Dashboard Button */}
            <button
              onClick={handleSaveDashboard}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
            >
              <Save className="w-3.5 h-3.5 text-emerald-400" />
              <span>Save</span>
            </button>

            {/* Add Visual Button */}
            <button
              onClick={() => {
                setEditingChart(null);
                setIsModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-sm transition-all"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Add Visual</span>
            </button>

            {activeFilterCount > 0 && (
              <button
                onClick={clearAllFilters}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-semibold border border-slate-700 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset ({activeFilterCount})</span>
              </button>
            )}
          </div>
        </div>

        {/* Global Search & Dropdown Slicers */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-800/80">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search across all dimensions..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {columns.slice(0, 2).map((col) => {
            const catStats = stats.categoricalStats?.[col];
            if (!catStats) return null;
            const selectedVal = filters[col]?.selected?.[0] || "";

            return (
              <div key={col} className="flex items-center gap-2 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs">
                <span className="text-[11px] text-slate-400 font-semibold truncate shrink-0">
                  {col}:
                </span>
                <select
                  value={selectedVal}
                  onChange={(e) => {
                    if (e.target.value) {
                      setFilters({
                        ...filters,
                        [col]: { type: "categorical", selected: [e.target.value] },
                      });
                    } else {
                      const next = { ...filters };
                      delete next[col];
                      setFilters(next);
                    }
                  }}
                  className="bg-transparent text-slate-200 text-xs w-full focus:outline-none cursor-pointer"
                >
                  <option value="" className="bg-slate-900">
                    All {col}
                  </option>
                  {catStats.topValues.map((v) => (
                    <option key={v.name} value={v.name} className="bg-slate-900">
                      {v.name} ({v.count})
                    </option>
                  ))}
                </select>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI Smart Insights Strip (Feature #2) */}
      {showAiInsights && aiInsights.length > 0 && (
        <div className="bg-slate-900/90 border border-purple-500/30 rounded-2xl p-4 shadow-sm space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2 text-xs font-bold text-purple-300">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>Automated Rule-Based AI Observations</span>
            </div>
            <span className="text-[10px] font-mono text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
              NLP Analytics Engine
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {aiInsights.map((ins) => (
              <div
                key={ins.id}
                className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[10px] font-mono font-bold uppercase text-amber-400">
                      {ins.tag}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                      {ins.badge}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-100">{ins.title}</h4>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                    {ins.description}
                  </p>
                </div>
                <div className="mt-2 pt-2 border-t border-slate-850 flex items-center justify-between text-[10px] text-slate-400">
                  <span>Impact: <strong className="text-slate-300">{ins.impact}</strong></span>
                  <span className="text-purple-400 flex items-center gap-0.5">
                    Analyzed <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {dynamicKpis.map((kpi) => (
          <div
            key={kpi.id}
            className="dashboard-card bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-sm flex flex-col justify-between hover:border-slate-700 transition-colors"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider truncate">
                {kpi.title}
              </span>
              <div className="p-1.5 bg-slate-800 rounded-lg shrink-0">
                {getKpiIcon(kpi.icon)}
              </div>
            </div>
            <div className="my-2">
              <span className="text-2xl font-extrabold font-mono text-slate-100 tracking-tight">
                {kpi.value}
              </span>
            </div>
            <div className="text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-800/80 pt-1.5">
              <span className="truncate">{kpi.subtitle}</span>
              {kpi.trend && (
                <span className="font-mono text-emerald-400 font-semibold">{kpi.trend}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {charts.map((chart) => (
          <ChartRenderer
            key={chart.id}
            chart={chart}
            data={filteredData}
            onEdit={handleEditChart}
            onDelete={handleDeleteChart}
            onChangeType={handleChangeChartType}
            onMoveUp={handleMoveUp}
            onMoveDown={handleMoveDown}
            onSelectCategory={handleDrilldown}
            selectedCategory={selectedDrilldown}
          />
        ))}
      </div>

      {/* Collapsible Executive Data Breakdown Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <TableIcon className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-slate-200">
              Live Data Grid Summary ({filteredData.length} records)
            </h3>
          </div>
          <button
            onClick={() => setShowSummaryTable(!showSummaryTable)}
            className="text-xs text-amber-400 hover:text-amber-300 font-semibold"
          >
            {showSummaryTable ? "Hide Summary Grid" : "Show Summary Grid"}
          </button>
        </div>

        {showSummaryTable && (
          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/60 max-h-60 overflow-y-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 font-mono text-[11px] sticky top-0">
                  <th className="p-2.5 w-10 text-center">#</th>
                  {columns.map((c) => (
                    <th key={c} className="p-2.5 whitespace-nowrap">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850 text-slate-300">
                {filteredData.slice(0, 15).map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/60">
                    <td className="p-2.5 text-center text-slate-500 font-mono text-[10px]">
                      {idx + 1}
                    </td>
                    {columns.map((c) => (
                      <td key={c} className="p-2.5 truncate max-w-[180px]">
                        {typeof row[c] === "number" ? (
                          <span className="font-mono text-amber-300/90">{row[c]}</span>
                        ) : (
                          String(row[c] ?? "")
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Visual builder modal */}
      <CustomChartModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingChart(null);
        }}
        onSave={handleAddChart}
        columns={columns}
        columnTypes={columnTypes}
        editingChart={editingChart}
      />
    </div>
  );
}
