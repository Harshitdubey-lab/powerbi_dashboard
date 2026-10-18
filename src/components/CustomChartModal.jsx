import React, { useState, useEffect } from "react";
import { X, BarChart3, TrendingUp, PieChart as PieIcon, Activity, Palette } from "lucide-react";

const PALETTE_OPTIONS = [
  { name: "Power BI Amber", color: "#f59e0b" },
  { name: "Cyan Teal", color: "#06b6d4" },
  { name: "Emerald Growth", color: "#10b981" },
  { name: "Electric Purple", color: "#8b5cf6" },
  { name: "Cobalt Blue", color: "#3b82f6" },
  { name: "Rose Ruby", color: "#ec4899" },
  { name: "Coral Orange", color: "#f97316" },
];

export default function CustomChartModal({
  isOpen,
  onClose,
  onSave,
  columns = [],
  columnTypes = {},
  editingChart = null,
}) {
  const [title, setTitle] = useState("");
  const [chartType, setChartType] = useState("bar");
  const [xAxis, setXAxis] = useState("");
  const [yAxis, setYAxis] = useState("");
  const [aggType, setAggType] = useState("sum");
  const [color, setColor] = useState("#f59e0b");

  const numericCols = columns.filter((c) => columnTypes[c]?.type === "numeric");
  const categoricalCols = columns.filter(
    (c) => columnTypes[c]?.type === "categorical" || columnTypes[c]?.type === "date" || columnTypes[c]?.type === "text"
  );

  useEffect(() => {
    if (editingChart) {
      setTitle(editingChart.title || "");
      setChartType(editingChart.type || "bar");
      setXAxis(editingChart.xAxis || (categoricalCols[0] || columns[0] || ""));
      setYAxis(editingChart.yAxis || (numericCols[0] || ""));
      setAggType(editingChart.aggType || "sum");
      setColor(editingChart.color || "#f59e0b");
    } else {
      setTitle("");
      setChartType("bar");
      setXAxis(categoricalCols[0] || columns[0] || "");
      setYAxis(numericCols[0] || "");
      setAggType("sum");
      setColor("#f59e0b");
    }
  }, [editingChart, isOpen, columns]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!xAxis) return;

    const generatedTitle =
      title.trim() ||
      `${yAxis ? `${yAxis.replace(/_/g, " ")} (${aggType.toUpperCase()})` : "Count"} by ${xAxis.replace(/_/g, " ")}`;

    onSave({
      id: editingChart?.id || `chart-${Date.now()}`,
      title: generatedTitle,
      type: chartType,
      xAxis,
      yAxis,
      aggType,
      color,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div>
            <h2 className="text-base font-bold text-slate-100">
              {editingChart ? "Edit Visual Configuration" : "Add Custom Visual Card"}
            </h2>
            <p className="text-xs text-slate-400">Customize axes, chart style, and aggregations</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[75vh]">
          {/* Chart Type Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">Visual / Chart Type</label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { type: "bar", label: "Bar Chart", icon: BarChart3 },
                { type: "line", label: "Line Chart", icon: TrendingUp },
                { type: "donut", label: "Donut / Pie", icon: PieIcon },
                { type: "area", label: "Area Chart", icon: Activity },
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = chartType === item.type;
                return (
                  <button
                    type="button"
                    key={item.type}
                    onClick={() => setChartType(item.type)}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                      isSelected
                        ? "bg-amber-500/10 border-amber-500 text-amber-400 shadow-sm"
                        : "bg-slate-850 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                    }`}
                  >
                    <Icon className="w-5 h-5 mb-1" />
                    <span className="text-[11px] font-medium">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Visual Title <span className="text-slate-500 font-normal">(Optional - auto-generated if blank)</span>
            </label>
            <input
              type="text"
              placeholder="e.g., Sales Revenue by Region"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          {/* X Axis Dimension */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Category / Dimension (X-Axis) *
              </label>
              <select
                value={xAxis}
                onChange={(e) => setXAxis(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500 transition-colors"
              >
                <option value="" disabled>
                  Select category column
                </option>
                {columns.map((col) => (
                  <option key={col} value={col}>
                    {col} ({columnTypes[col]?.type || "text"})
                  </option>
                ))}
              </select>
            </div>

            {/* Y Axis Metric */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Metric / Value (Y-Axis)
              </label>
              <select
                value={yAxis}
                onChange={(e) => setYAxis(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500 transition-colors"
              >
                <option value="">Row Count (Default)</option>
                {numericCols.map((col) => (
                  <option key={col} value={col}>
                    {col} (numeric)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Aggregation & Palette */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Aggregation Function</label>
              <select
                value={aggType}
                onChange={(e) => setAggType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500 transition-colors"
              >
                <option value="sum">Sum (Total)</option>
                <option value="avg">Average (Mean)</option>
                <option value="count">Count Records</option>
                <option value="max">Maximum</option>
                <option value="min">Minimum</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-amber-400" /> Color Accent
              </label>
              <div className="flex items-center gap-2 pt-1 flex-wrap">
                {PALETTE_OPTIONS.map((pal) => (
                  <button
                    key={pal.color}
                    type="button"
                    onClick={() => setColor(pal.color)}
                    style={{ backgroundColor: pal.color }}
                    title={pal.name}
                    className={`w-6 h-6 rounded-full transition-transform ${
                      color === pal.color ? "ring-2 ring-white scale-110" : "opacity-80 hover:opacity-100"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Footer actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg shadow-sm font-bold transition-all"
            >
              {editingChart ? "Update Visual" : "Add to Dashboard"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
