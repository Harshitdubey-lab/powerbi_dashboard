import React, { useState } from "react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import {
  Download,
  FileSpreadsheet,
  FileCode,
  FileText,
  Camera,
  Printer,
  CheckCircle2,
  Sparkles,
  Award,
  TrendingUp,
  ShieldCheck,
  Share2,
} from "lucide-react";

export default function ExportReportView({
  datasetName,
  datasetPurpose,
  data = [],
  rawData = [],
  stats,
  kpiCards = [],
  charts = [],
}) {
  const [isExporting, setIsExporting] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3500);
  };

  // 1. Export as CSV
  const handleExportCSV = () => {
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${datasetName.replace(/\s+/g, "_")}_Cleaned.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("CSV dataset exported successfully!");
  };

  // 2. Export as Excel XLSX
  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Cleaned Data");
    XLSX.writeFile(workbook, `${datasetName.replace(/\s+/g, "_")}_Dashboard_Data.xlsx`);
    showToast("Excel (.xlsx) spreadsheet downloaded!");
  };

  // 3. Export as JSON
  const handleExportJSON = () => {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${datasetName.replace(/\s+/g, "_")}_dataset.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("JSON format exported successfully!");
  };

  // 4. Download PDF Report using jsPDF + html2canvas
  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const element = document.getElementById("printable-report");
      if (!element) throw new Error("Report element not found");

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#0f172a",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${datasetName.replace(/\s+/g, "_")}_Executive_Report.pdf`);
      showToast("PDF Executive Report generated successfully!");
    } catch (err) {
      // Fallback to browser print
      window.print();
    } finally {
      setIsExporting(false);
    }
  };

  // 5. Download PNG Screenshot
  const handleExportPNG = async () => {
    setIsExporting(true);
    try {
      const element = document.getElementById("printable-report");
      if (!element) return;

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#0f172a",
      });

      const link = document.createElement("a");
      link.download = `${datasetName.replace(/\s+/g, "_")}_Snapshot.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      showToast("High-resolution PNG snapshot saved!");
    } catch (err) {
      showToast("Failed to generate image snapshot: " + err.message);
    } finally {
      setIsExporting(false);
    }
  };

  // Data Quality Score Calculation
  const duplicateRate = stats.duplicateCount ? (stats.duplicateCount / (rawData.length || 1)) * 100 : 0;
  const qualityScore = Math.max(70, Math.min(99, Math.round(100 - duplicateRate * 2)));

  // Generate automated executive findings
  const numericCols = Object.keys(stats.numericStats || {});
  const topNumCol = numericCols[0];
  const topNumStat = stats.numericStats?.[topNumCol];
  const catCols = Object.keys(stats.categoricalStats || {}).filter(
    (col) => !col.toLowerCase().includes("id") && !col.toLowerCase().includes("code") && !col.toLowerCase().includes("sku")
  );
  const topCatCol = catCols.length > 0 ? catCols[0] : Object.keys(stats.categoricalStats || {})[0];
  const topCatStat = stats.categoricalStats?.[topCatCol];

  return (
    <div className="max-w-6xl mx-auto py-4 px-2 sm:px-4 space-y-6">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-500 text-slate-950 font-bold px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="no-print bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-mono text-xs font-semibold border border-amber-500/20">
              Step 5 of 5
            </span>
            <h2 className="text-xl font-bold text-slate-100">Export & Executive Report Studio</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Download cleaned datasets in multiple formats or generate executive PDF summaries.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleExportPDF}
            disabled={isExporting}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all disabled:opacity-50"
          >
            <FileText className="w-4 h-4" />
            <span>{isExporting ? "Generating..." : "Download PDF Report"}</span>
          </button>

          <button
            onClick={handleExportPNG}
            disabled={isExporting}
            className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
          >
            <Camera className="w-4 h-4 text-amber-400" />
            <span>PNG Snapshot</span>
          </button>

          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
          >
            <Printer className="w-4 h-4 text-cyan-400" />
            <span>Print View</span>
          </button>
        </div>
      </div>

      {/* Dataset Export Actions */}
      <div className="no-print grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          onClick={handleExportCSV}
          className="bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 p-5 rounded-2xl text-left transition-all group flex items-start justify-between"
        >
          <div>
            <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl w-fit mb-3">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-100 group-hover:text-emerald-400 transition-colors">
              Export Cleaned CSV
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Standard comma-separated table with parsed headers.
            </p>
          </div>
          <Download className="w-4 h-4 text-slate-600 group-hover:text-emerald-400 transition-colors" />
        </button>

        <button
          onClick={handleExportExcel}
          className="bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 p-5 rounded-2xl text-left transition-all group flex items-start justify-between"
        >
          <div>
            <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl w-fit mb-3">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-100 group-hover:text-blue-400 transition-colors">
              Export Microsoft Excel (.xlsx)
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Formatted workbook ready for Excel & Power BI Desktop.
            </p>
          </div>
          <Download className="w-4 h-4 text-slate-600 group-hover:text-blue-400 transition-colors" />
        </button>

        <button
          onClick={handleExportJSON}
          className="bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 p-5 rounded-2xl text-left transition-all group flex items-start justify-between"
        >
          <div>
            <div className="p-2.5 bg-purple-500/10 text-purple-400 rounded-xl w-fit mb-3">
              <FileCode className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-100 group-hover:text-purple-400 transition-colors">
              Export Cleaned JSON
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Structured JSON object array for developer APIs.
            </p>
          </div>
          <Download className="w-4 h-4 text-slate-600 group-hover:text-purple-400 transition-colors" />
        </button>
      </div>

      {/* Printable Executive Summary Report Container */}
      <div
        id="printable-report"
        className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl"
      >
        {/* Report Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-5 gap-4">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-widest text-amber-400 font-bold">
              Automated Intelligence Brief
            </span>
            <h1 className="text-2xl font-extrabold text-slate-100 mt-0.5">
              {datasetName || "Executive Dashboard Report"}
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Purpose: {datasetPurpose} • Generated on {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            <div>
              <span className="text-[10px] text-slate-400 block uppercase">Data Quality Rating</span>
              <span className="text-lg font-bold font-mono text-emerald-400">
                {qualityScore} / 100
              </span>
            </div>
          </div>
        </div>

        {/* Executive KPI Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800">
            <span className="text-[11px] text-slate-400 uppercase font-semibold">Active Records</span>
            <div className="text-xl font-bold font-mono text-slate-100 mt-1">{data.length}</div>
            <span className="text-[10px] text-slate-400">Cleaned dataset volume</span>
          </div>

          {topNumCol && topNumStat && (
            <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800">
              <span className="text-[11px] text-slate-400 uppercase font-semibold">
                Total {topNumCol.replace(/_/g, " ")}
              </span>
              <div className="text-xl font-bold font-mono text-amber-400 mt-1">
                {topNumStat.sum.toLocaleString()}
              </div>
              <span className="text-[10px] text-slate-400">Sum across records</span>
            </div>
          )}

          {topNumCol && topNumStat && (
            <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800">
              <span className="text-[11px] text-slate-400 uppercase font-semibold">
                Mean {topNumCol.replace(/_/g, " ")}
              </span>
              <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
                {topNumStat.mean}
              </div>
              <span className="text-[10px] text-slate-400">Average per record</span>
            </div>
          )}

          <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800">
            <span className="text-[11px] text-slate-400 uppercase font-semibold">Schema Size</span>
            <div className="text-xl font-bold font-mono text-cyan-400 mt-1">
              {stats.columnCount} Cols
            </div>
            <span className="text-[10px] text-slate-400">Parsed dimensions</span>
          </div>
        </div>

        {/* Automated Key Insights List */}
        <div className="bg-slate-950/60 rounded-xl p-5 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-200 uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Key Executive Observations</span>
          </div>

          <ul className="space-y-2 text-xs text-slate-300">
            <li className="flex items-start gap-2">
              <span className="text-amber-400 font-bold">•</span>
              <span>
                <strong>Data Completeness:</strong> Dataset contains{" "}
                <strong>{data.length}</strong> validated records across{" "}
                <strong>{stats.columnCount}</strong> attributes, with an overall data health score of{" "}
                <strong className="text-emerald-400">{qualityScore}%</strong>.
              </span>
            </li>

            {topCatCol && topCatStat && (
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 font-bold">•</span>
                <span>
                  <strong>Top Segment:</strong> The most frequent <strong>{topCatCol.replace(/_/g, " ")}</strong> is{" "}
                  <strong>"{topCatStat.topValues[0]?.name}"</strong> representing{" "}
                  <strong>{topCatStat.topValues[0]?.count}</strong> instances (
                  {((topCatStat.topValues[0]?.count / (data.length || 1)) * 100).toFixed(1)}% of dataset).
                </span>
              </li>
            )}

            {topNumCol && topNumStat && (
              <li className="flex items-start gap-2">
                <span className="text-purple-400 font-bold">•</span>
                <span>
                  <strong>Metric Extremes:</strong> <strong>{topNumCol.replace(/_/g, " ")}</strong> ranges from a minimum of{" "}
                  <strong>{topNumStat.min}</strong> to a peak of{" "}
                  <strong className="text-amber-300">{topNumStat.max}</strong> with a median benchmark of{" "}
                  <strong>{topNumStat.median}</strong>.
                </span>
              </li>
            )}

            <li className="flex items-start gap-2">
              <span className="text-emerald-400 font-bold">•</span>
              <span>
                <strong>Data Processing Summary:</strong> Imputed missing attributes and purged duplicate redundancies for accurate downstream analytics.
              </span>
            </li>
          </ul>
        </div>

        {/* Visual Charts Summary Snapshot Table */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Generated Visualizations Summary ({charts.length} Charts)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {charts.map((c, i) => (
              <div
                key={c.id}
                className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs flex items-center justify-between"
              >
                <div>
                  <span className="font-bold text-slate-200 block">{c.title}</span>
                  <span className="text-[11px] text-slate-400">
                    Type: <strong className="uppercase text-amber-400">{c.type}</strong> • X: {c.xAxis} • Y: {c.yAxis || "Records"}
                  </span>
                </div>
                <span className="text-[10px] font-mono px-2 py-1 rounded bg-slate-900 border border-slate-800 text-slate-400">
                  {c.aggType?.toUpperCase() || "SUM"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Report Footer */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
          <span>Smart Data Dashboard Builder • Student Edition</span>
          <span>Confidential Analytics Export</span>
        </div>
      </div>
    </div>
  );
}
