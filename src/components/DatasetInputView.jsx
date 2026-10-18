import React, { useState } from "react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import {
  UploadCloud,
  Link as LinkIcon,
  FileSpreadsheet,
  Layers,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  TrendingUp,
  GraduationCap,
  DollarSign,
  HeartPulse,
} from "lucide-react";
import { SAMPLE_DATASETS } from "../data/sampleDatasets";

export default function DatasetInputView({
  datasetName,
  setDatasetName,
  datasetPurpose,
  setDatasetPurpose,
  onDataLoaded,
  onProceed,
}) {
  const [sourceType, setSourceType] = useState("sample"); // 'upload' | 'link' | 'sample'
  const [selectedSampleKey, setSelectedSampleKey] = useState("sales");
  const [linkUrl, setLinkUrl] = useState("");
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const purposes = [
    { id: "Sales Analysis", label: "Sales & E-Commerce", icon: TrendingUp, desc: "Revenue, orders, customer regions" },
    { id: "Student Performance", label: "Student Performance", icon: GraduationCap, desc: "Grades, attendance, pass status" },
    { id: "Finance", label: "Finance & Budget", icon: DollarSign, desc: "Expenditure, ROI, budget variance" },
    { id: "Health", label: "Healthcare & Patients", icon: HeartPulse, desc: "Hospital stays, costs, satisfaction" },
    { id: "General Analytics", label: "General / Custom Analytics", icon: Layers, desc: "Any custom structured tabular data" },
  ];

  // Handle local file upload
  const handleFileUpload = (e) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    setErrorMsg("");
    setFile(uploadedFile);
    if (!datasetName) {
      const cleanName = uploadedFile.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ");
      setDatasetName(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
    }
  };

  const processFile = (targetFile) => {
    return new Promise((resolve, reject) => {
      const fileName = targetFile.name.toLowerCase();

      if (fileName.endsWith(".csv") || fileName.endsWith(".txt")) {
        Papa.parse(targetFile, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
          complete: (results) => {
            if (results.data && results.data.length > 0) {
              resolve(results.data);
            } else {
              reject(new Error("The CSV file is empty or could not be parsed properly."));
            }
          },
          error: (err) => reject(err),
        });
      } else if (fileName.endsWith(".xlsx") || fileName.endsWith(".xls")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: "array" });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
            if (jsonData && jsonData.length > 0) {
              resolve(jsonData);
            } else {
              reject(new Error("The Excel worksheet contains no data rows."));
            }
          } catch (err) {
            reject(new Error("Failed to parse Excel file: " + err.message));
          }
        };
        reader.onerror = () => reject(new Error("Failed to read Excel file."));
        reader.readAsArrayBuffer(targetFile);
      } else {
        reject(new Error("Unsupported file format. Please upload a .csv, .xlsx, or .xls file."));
      }
    });
  };

  const handleFetchUrl = async (url) => {
    if (!url.trim()) throw new Error("Please enter a valid dataset link or Google Sheets export URL.");

    let fetchUrl = url.trim();

    // Convert Google Sheets edit URL to CSV export URL if needed
    if (fetchUrl.includes("docs.google.com/spreadsheets") && !fetchUrl.includes("export?format=csv")) {
      const match = fetchUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
      if (match && match[1]) {
        fetchUrl = `https://docs.google.com/spreadsheets/d/${match[1]}/export?format=csv`;
      }
    }

    const response = await fetch(fetchUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch dataset from URL (HTTP ${response.status}). Make sure the link is publicly accessible.`);
    }

    const text = await response.text();
    return new Promise((resolve, reject) => {
      try {
        // Try JSON first
        const json = JSON.parse(text);
        if (Array.isArray(json)) resolve(json);
        else if (json.data && Array.isArray(json.data)) resolve(json.data);
        else resolve([json]);
      } catch (e) {
        // Parse as CSV
        Papa.parse(text, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
          complete: (results) => {
            if (results.data && results.data.length > 0) {
              resolve(results.data);
            } else {
              reject(new Error("Fetched data was empty or not recognized as valid CSV/JSON."));
            }
          },
          error: (err) => reject(err),
        });
      }
    });
  };

  const handleLoadAndProceed = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!datasetName.trim()) {
      setErrorMsg("Please provide a dataset name to continue.");
      return;
    }

    setIsLoading(true);

    try {
      let parsedData = [];

      if (sourceType === "sample") {
        const sampleObj = SAMPLE_DATASETS[selectedSampleKey];
        if (!sampleObj) throw new Error("Selected sample dataset could not be found.");
        parsedData = sampleObj.data;
        if (!datasetName) setDatasetName(sampleObj.name);
        setDatasetPurpose(sampleObj.purpose);
      } else if (sourceType === "upload") {
        if (!file) throw new Error("Please select a CSV or Excel file to upload.");
        parsedData = await processFile(file);
      } else if (sourceType === "link") {
        parsedData = await handleFetchUrl(linkUrl);
      }

      if (!parsedData || parsedData.length === 0) {
        throw new Error("Parsed dataset contains 0 records. Please check the data source.");
      }

      onDataLoaded(parsedData);
      setSuccessMsg(`Successfully loaded ${parsedData.length} records with ${Object.keys(parsedData[0]).length} columns.`);
      
      setTimeout(() => {
        onProceed();
      }, 500);
    } catch (err) {
      setErrorMsg(err.message || "An unexpected error occurred while processing the dataset.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-4 px-2 sm:px-4 space-y-6">
      {/* Introduction Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-mono text-xs font-semibold border border-amber-500/20">
                Step 1 of 5
              </span>
              <h2 className="text-xl font-bold text-slate-100">Dataset Configuration & Import</h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Provide your data source to begin automated cleaning, column type detection, and interactive dashboard generation.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-950 px-3 py-2 rounded-xl border border-slate-800">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Auto-detects numeric, categorical, and date metrics</span>
          </div>
        </div>

        {/* Error / Success Notifications */}
        {errorMsg && (
          <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-start gap-3 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Dataset Import Notice</p>
              <p className="mt-0.5 text-rose-200/90">{errorMsg}</p>
            </div>
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-start gap-3 text-emerald-300 text-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Ready for Analysis</p>
              <p className="mt-0.5 text-emerald-200/90">{successMsg}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleLoadAndProceed} className="space-y-6">
          {/* Top Form Fields: Dataset Name & Purpose */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1.5 uppercase tracking-wider">
                1. Dataset Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Q1 Global Sales & Inventory"
                value={datasetName}
                onChange={(e) => setDatasetName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Give your analytics project a descriptive title
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1.5 uppercase tracking-wider">
                2. Dashboard Purpose / Domain
              </label>
              <select
                value={datasetPurpose}
                onChange={(e) => setDatasetPurpose(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-500 transition-colors"
              >
                {purposes.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
              <span className="text-[11px] text-slate-400 mt-1 block">
                Tailors KPI cards and auto-generated chart suggestions
              </span>
            </div>
          </div>

          {/* Dataset Source Tabs */}
          <div>
            <label className="block text-xs font-bold text-slate-200 mb-2 uppercase tracking-wider">
              3. Select Dataset Source
            </label>
            <div className="grid grid-cols-3 gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setSourceType("sample")}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all ${
                  sourceType === "sample"
                    ? "bg-amber-500 text-slate-950 shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-850"
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>Sample Datasets (Instant)</span>
              </button>

              <button
                type="button"
                onClick={() => setSourceType("upload")}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all ${
                  sourceType === "upload"
                    ? "bg-amber-500 text-slate-950 shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-850"
                }`}
              >
                <UploadCloud className="w-4 h-4" />
                <span>Upload CSV / Excel</span>
              </button>

              <button
                type="button"
                onClick={() => setSourceType("link")}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all ${
                  sourceType === "link"
                    ? "bg-amber-500 text-slate-950 shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-850"
                }`}
              >
                <LinkIcon className="w-4 h-4" />
                <span>Link / Google Sheet / API</span>
              </button>
            </div>
          </div>

          {/* Source 1: Sample Datasets Selection */}
          {sourceType === "sample" && (
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
              <p className="text-xs text-slate-400">
                Choose a pre-configured, structured demo dataset with realistic metrics and deliberate dirty data points (duplicates/missing fields) to test the cleaning engine:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.entries(SAMPLE_DATASETS).map(([key, item]) => {
                  const isSelected = selectedSampleKey === key;
                  return (
                    <div
                      key={key}
                      onClick={() => {
                        setSelectedSampleKey(key);
                        setDatasetName(item.name);
                        setDatasetPurpose(item.purpose);
                      }}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? "bg-amber-500/10 border-amber-500/80 text-slate-100 shadow-sm ring-1 ring-amber-500/30"
                          : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs text-slate-100">{item.name}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                          {item.data.length} records
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-2">{item.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Source 2: File Upload (CSV, XLSX) */}
          {sourceType === "upload" && (
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-6 text-center space-y-3">
              <label className="border-2 border-dashed border-slate-700 hover:border-amber-500/80 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-900/40">
                <FileSpreadsheet className="w-10 h-10 text-amber-400 mb-2 stroke-1" />
                <span className="text-sm font-semibold text-slate-200">
                  {file ? file.name : "Click to browse or drag & drop CSV or Excel file"}
                </span>
                <span className="text-xs text-slate-500 mt-1">
                  Supports .csv, .xlsx, .xls (max 20MB)
                </span>
                <input
                  type="file"
                  accept=".csv, .xlsx, .xls, text/csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              {file && (
                <div className="flex items-center justify-between bg-slate-900 border border-slate-700 px-4 py-2 rounded-lg text-xs text-slate-300">
                  <div className="flex items-center gap-2 truncate">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="font-mono truncate">{file.name}</span>
                    <span className="text-slate-400">({(file.size / 1024).toFixed(1)} KB)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    className="text-rose-400 hover:text-rose-300 font-semibold text-[11px]"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Source 3: URL / Google Sheet / API */}
          {sourceType === "link" && (
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-5 space-y-3">
              <label className="block text-xs font-semibold text-slate-300">
                Paste Google Sheets CSV Export Link, Web CSV URL, or JSON API endpoint:
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://docs.google.com/spreadsheets/d/... or https://example.com/data.csv"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>
              <div className="text-[11px] text-slate-400 space-y-1">
                <p>💡 <strong>Google Sheets Tip:</strong> Share sheet as "Anyone with link can view", or use "File &gt; Share &gt; Publish to web &gt; CSV".</p>
                <p>💡 <strong>REST API:</strong> Accepts any endpoint returning an array of JSON objects.</p>
              </div>
            </div>
          )}

          {/* Submit CTA */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-4">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-md hover:shadow-amber-500/20 transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Processing Dataset...</span>
                </>
              ) : (
                <>
                  <span>Load Data & Proceed to Cleaning</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
