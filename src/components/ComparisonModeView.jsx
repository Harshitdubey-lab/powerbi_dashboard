import React, { useState } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from "recharts";
import {
  GitCompare,
  ArrowRightLeft,
  TrendingUp,
  Percent,
  Sliders,
  Scale,
  Sparkles,
  Layers,
} from "lucide-react";

export default function ComparisonModeView({ data = [], stats = {} }) {
  const columns = stats.columns || (data[0] ? Object.keys(data[0]) : []);
  const numericCols = columns.filter((c) => stats.columnTypes?.[c]?.type === "numeric");
  const catCols = columns.filter(
    (c) => stats.columnTypes?.[c]?.type === "categorical" || stats.columnTypes?.[c]?.type === "date"
  );

  const [colA, setColA] = useState(numericCols[0] || columns[0] || "");
  const [colB, setColB] = useState(numericCols[1] || numericCols[0] || "");
  const [groupCol, setGroupCol] = useState(catCols[0] || columns[0] || "");

  // Aggregate comparison data grouped by groupCol
  const groupedData = {};
  data.forEach((row) => {
    const gVal = String(row[groupCol] ?? "Other");
    const valA = Number(row[colA]) || 0;
    const valB = Number(row[colB]) || 0;

    if (!groupedData[gVal]) {
      groupedData[gVal] = { name: gVal, [colA]: valA, [colB]: valB, count: 1 };
    } else {
      groupedData[gVal][colA] += valA;
      groupedData[gVal][colB] += valB;
      groupedData[gVal].count += 1;
    }
  });

  const chartData = Object.values(groupedData).slice(0, 10).map((item) => {
    const a = Number(item[colA].toFixed(2));
    const b = Number(item[colB].toFixed(2));
    const diff = Number((b - a).toFixed(2));
    const pctDiff = a !== 0 ? Number((((b - a) / Math.abs(a)) * 100).toFixed(1)) : 0;
    return {
      name: item.name,
      [colA]: a,
      [colB]: b,
      diff,
      pctDiff,
    };
  });

  // Calculate overall metrics
  const totalA = data.reduce((acc, r) => acc + (Number(r[colA]) || 0), 0);
  const totalB = data.reduce((acc, r) => acc + (Number(r[colB]) || 0), 0);
  const meanA = totalA / (data.length || 1);
  const meanB = totalB / (data.length || 1);
  const overallDiff = totalB - totalA;
  const overallPctDiff = totalA !== 0 ? ((overallDiff / Math.abs(totalA)) * 100).toFixed(1) : "0";

  return (
    <div className="max-w-7xl mx-auto py-4 px-2 sm:px-4 space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">Dual-Column Comparative Analysis Studio</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Benchmark two metrics side-by-side and evaluate variance deltas.
              </p>
            </div>
          </div>
        </div>

        {/* Column Selectors */}
        <div className="flex items-center gap-2 flex-wrap bg-slate-950 p-2 rounded-xl border border-slate-800">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-amber-400 font-bold uppercase">Metric A:</span>
            <select
              value={colA}
              onChange={(e) => setColA(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200"
            >
              {numericCols.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <ArrowRightLeft className="w-4 h-4 text-slate-500" />

          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-cyan-400 font-bold uppercase">Metric B:</span>
            <select
              value={colB}
              onChange={(e) => setColB(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200"
            >
              {numericCols.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 ml-2 pl-2 border-l border-slate-800">
            <span className="text-[10px] text-slate-400 font-semibold uppercase">By:</span>
            <select
              value={groupCol}
              onChange={(e) => setGroupCol(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200"
            >
              {catCols.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Comparison Scoreboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-[10px] text-slate-400 font-bold uppercase">
            Total {colA.replace(/_/g, " ")} (A)
          </span>
          <div className="text-2xl font-bold font-mono text-amber-400 mt-1">
            {totalA.toLocaleString()}
          </div>
          <span className="text-[10px] text-slate-400">Mean: {meanA.toFixed(2)}</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-[10px] text-slate-400 font-bold uppercase">
            Total {colB.replace(/_/g, " ")} (B)
          </span>
          <div className="text-2xl font-bold font-mono text-cyan-400 mt-1">
            {totalB.toLocaleString()}
          </div>
          <span className="text-[10px] text-slate-400">Mean: {meanB.toFixed(2)}</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-[10px] text-slate-400 font-bold uppercase">Net Variance (B - A)</span>
          <div
            className={`text-2xl font-bold font-mono mt-1 ${
              overallDiff >= 0 ? "text-emerald-400" : "text-rose-400"
            }`}
          >
            {overallDiff >= 0 ? `+${overallDiff.toLocaleString()}` : overallDiff.toLocaleString()}
          </div>
          <span className="text-[10px] text-slate-400">Absolute difference</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-[10px] text-slate-400 font-bold uppercase">Percentage Delta</span>
          <div
            className={`text-2xl font-bold font-mono mt-1 ${
              Number(overallPctDiff) >= 0 ? "text-emerald-400" : "text-rose-400"
            }`}
          >
            {Number(overallPctDiff) >= 0 ? `+${overallPctDiff}%` : `${overallPctDiff}%`}
          </div>
          <span className="text-[10px] text-slate-400">Relative percentage shift</span>
        </div>
      </div>

      {/* Side-by-Side Comparison Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* 1. Grouped Side-by-Side Bar Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm h-[380px] flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-bold text-slate-100">
                {colA.replace(/_/g, " ")} vs {colB.replace(/_/g, " ")}
              </h3>
              <p className="text-[11px] text-slate-400">Grouped comparison by {groupCol}</p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
              Side-by-Side
            </span>
          </div>

          <div className="flex-1 w-full min-h-0 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} angle={-25} textAnchor="end" />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "8px", fontSize: "11px" }}
                />
                <Legend verticalAlign="top" height={30} iconType="circle" />
                <Bar dataKey={colA} fill="#f59e0b" name={`Metric A: ${colA}`} radius={[4, 4, 0, 0]} />
                <Bar dataKey={colB} fill="#06b6d4" name={`Metric B: ${colB}`} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. Variance & Percentage Shift Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm h-[380px] flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-bold text-slate-100">Variance Shift (Delta B - A)</h3>
              <p className="text-[11px] text-slate-400">Percentage difference across segments</p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Delta %
            </span>
          </div>

          <div className="flex-1 w-full min-h-0 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} angle={-25} textAnchor="end" />
                <YAxis stroke="#64748b" fontSize={11} unit="%" />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "8px", fontSize: "11px" }}
                />
                <ReferenceLine y={0} stroke="#64748b" strokeWidth={1.5} />
                <Bar dataKey="pctDiff" fill="#10b981" name="Percentage Shift (%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Comparison Breakdown Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
        <h3 className="text-sm font-bold text-slate-100">
          Segment Variance Breakdown Table
        </h3>
        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/60">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                <th className="p-3">{groupCol}</th>
                <th className="p-3 text-right">{colA}</th>
                <th className="p-3 text-right">{colB}</th>
                <th className="p-3 text-right">Variance (B - A)</th>
                <th className="p-3 text-right">Shift (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850 text-slate-300">
              {chartData.map((row, i) => (
                <tr key={i} className="hover:bg-slate-900/60">
                  <td className="p-3 font-semibold">{row.name}</td>
                  <td className="p-3 text-right font-mono text-amber-300">{row[colA].toLocaleString()}</td>
                  <td className="p-3 text-right font-mono text-cyan-300">{row[colB].toLocaleString()}</td>
                  <td className="p-3 text-right font-mono font-bold">
                    <span className={row.diff >= 0 ? "text-emerald-400" : "text-rose-400"}>
                      {row.diff >= 0 ? `+${row.diff.toLocaleString()}` : row.diff.toLocaleString()}
                    </span>
                  </td>
                  <td className="p-3 text-right font-mono font-bold">
                    <span className={row.pctDiff >= 0 ? "text-emerald-400" : "text-rose-400"}>
                      {row.pctDiff >= 0 ? `+${row.pctDiff}%` : `${row.pctDiff}%`}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
