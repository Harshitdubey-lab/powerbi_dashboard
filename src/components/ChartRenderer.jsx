import React, { useRef } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import html2canvas from "html2canvas";
import {
  BarChart3,
  TrendingUp,
  PieChart as PieIcon,
  Activity,
  Trash2,
  Edit2,
  Camera,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { aggregateData } from "../utils/dataProcessor";

const PALETTE = [
  "#f59e0b", // Amber (Power BI primary)
  "#06b6d4", // Cyan
  "#10b981", // Emerald
  "#8b5cf6", // Purple
  "#3b82f6", // Blue
  "#ec4899", // Pink
  "#f97316", // Orange
  "#14b8a6", // Teal
  "#6366f1", // Indigo
  "#eab308", // Yellow
];

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-lg p-3 shadow-xl text-xs z-50">
        <p className="font-semibold text-slate-200 mb-1 border-b border-slate-700/60 pb-1">
          {label || data.name}
        </p>
        <div className="flex items-center justify-between gap-4 py-0.5">
          <span className="text-slate-400 flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-sm inline-block"
              style={{ backgroundColor: data.fill || data.color || "#f59e0b" }}
            />
            {data.name || "Value"}:
          </span>
          <span className="font-mono font-bold text-amber-400">
            {typeof data.value === "number" ? data.value.toLocaleString() : data.value}
          </span>
        </div>
        {data.payload?.count && (
          <div className="flex items-center justify-between gap-4 py-0.5 text-slate-400">
            <span>Records count:</span>
            <span className="font-mono">{data.payload.count}</span>
          </div>
        )}
      </div>
    );
  }
  return null;
}

export default function ChartRenderer({
  chart,
  data = [],
  onEdit,
  onDelete,
  onChangeType,
  onMoveUp,
  onMoveDown,
  onSelectCategory,
  selectedCategory,
}) {
  const chartCardRef = useRef(null);
  const { id, title, type, xAxis, yAxis, aggType = "sum", color = "#f59e0b" } = chart;

  const chartData = aggregateData(data, xAxis, yAxis, aggType);

  const getChartIcon = () => {
    switch (type) {
      case "line":
        return <TrendingUp className="w-4 h-4 text-cyan-400" />;
      case "pie":
      case "donut":
        return <PieIcon className="w-4 h-4 text-purple-400" />;
      case "area":
        return <Activity className="w-4 h-4 text-blue-400" />;
      case "bar":
      default:
        return <BarChart3 className="w-4 h-4 text-amber-400" />;
    }
  };

  const handleExportChartImage = async (e) => {
    e.stopPropagation();
    if (!chartCardRef.current) return;
    try {
      const canvas = await html2canvas(chartCardRef.current, {
        scale: 2,
        backgroundColor: "#0f172a",
      });
      const link = document.createElement("a");
      link.download = `${title.replace(/\s+/g, "_")}_Chart.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error("Failed to save chart screenshot:", err);
    }
  };

  return (
    <div
      ref={chartCardRef}
      className="dashboard-card bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-sm hover:border-slate-700 transition-all flex flex-col h-[370px] relative group"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="p-1.5 bg-slate-800/80 rounded-md shrink-0">{getChartIcon()}</div>
          <div className="truncate">
            <h3 className="text-sm font-semibold text-slate-100 truncate" title={title}>
              {title}
            </h3>
            <p className="text-[11px] text-slate-400 truncate">
              {xAxis} • {aggType.toUpperCase()} of {yAxis || "Records"}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1">
          {/* Quick Chart Type Switcher */}
          {onChangeType && (
            <select
              value={type}
              onChange={(e) => onChangeType(id, e.target.value)}
              className="bg-slate-950 border border-slate-800 text-[11px] text-slate-300 rounded px-1.5 py-0.5 focus:outline-none cursor-pointer"
            >
              <option value="bar">Bar</option>
              <option value="line">Line</option>
              <option value="donut">Donut</option>
              <option value="area">Area</option>
            </select>
          )}

          {/* Export Chart as PNG */}
          <button
            onClick={handleExportChartImage}
            className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded-md transition-colors"
            title="Download Chart as PNG Image"
          >
            <Camera className="w-3.5 h-3.5" />
          </button>

          {onMoveUp && (
            <button
              onClick={() => onMoveUp(id)}
              className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded"
              title="Move Chart Up"
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          )}

          {onMoveDown && (
            <button
              onClick={() => onMoveDown(id)}
              className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded"
              title="Move Chart Down"
            >
              <ArrowDown className="w-3.5 h-3.5" />
            </button>
          )}

          {onEdit && (
            <button
              onClick={() => onEdit(chart)}
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-md transition-colors"
              title="Edit Chart Configuration"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          )}

          {onDelete && (
            <button
              onClick={() => onDelete(id)}
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-md transition-colors"
              title="Remove Chart"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="flex-1 w-full min-h-0 pt-2">
        {chartData.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs">
            <BarChart3 className="w-8 h-8 stroke-1 mb-1 text-slate-600" />
            No data available for selected filters
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            {type === "line" ? (
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                <XAxis
                  dataKey="name"
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  angle={-25}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={color || "#06b6d4"}
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: color || "#06b6d4", strokeWidth: 1, stroke: "#0f172a" }}
                  activeDot={{ r: 6, fill: "#38bdf8" }}
                />
              </LineChart>
            ) : type === "area" ? (
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                <defs>
                  <linearGradient id={`gradient-${id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={color || "#3b82f6"} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={color || "#3b82f6"} stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                <XAxis
                  dataKey="name"
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  angle={-25}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={color || "#3b82f6"}
                  strokeWidth={2}
                  fillOpacity={1}
                  fill={`url(#gradient-${id})`}
                />
              </AreaChart>
            ) : type === "donut" || type === "pie" ? (
              <PieChart>
                <Tooltip content={<CustomTooltip />} />
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={type === "donut" ? "52%" : "0%"}
                  outerRadius="80%"
                  paddingAngle={type === "donut" ? 3 : 1}
                  onClick={(entry) => onSelectCategory && onSelectCategory(xAxis, entry.name)}
                  cursor="pointer"
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={PALETTE[index % PALETTE.length]}
                      stroke="#0f172a"
                      strokeWidth={1.5}
                      className="transition-transform hover:scale-105"
                    />
                  ))}
                </Pie>
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  formatter={(value) => (
                    <span className="text-[11px] text-slate-300 truncate max-w-[90px] inline-block align-middle">
                      {value}
                    </span>
                  )}
                />
              </PieChart>
            ) : (
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                <XAxis
                  dataKey="name"
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  angle={-25}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="value"
                  fill={color || "#f59e0b"}
                  radius={[4, 4, 0, 0]}
                  onClick={(entry) => onSelectCategory && onSelectCategory(xAxis, entry.name)}
                  cursor="pointer"
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`bar-cell-${index}`}
                      fill={
                        selectedCategory && selectedCategory.col === xAxis && selectedCategory.val === entry.name
                          ? "#38bdf8"
                          : color || PALETTE[index % PALETTE.length]
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            )}
          </ResponsiveContainer>
        )}
      </div>

      {/* Footer Info */}
      <div className="mt-1 pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
        <span>{chartData.length} categories shown</span>
        <span className="font-mono text-slate-400">
          Total: {chartData.reduce((a, b) => a + Number(b.value || 0), 0).toLocaleString()}
        </span>
      </div>
    </div>
  );
}
