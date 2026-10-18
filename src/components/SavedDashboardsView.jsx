import React, { useState, useEffect } from "react";
import {
  FolderClock,
  LayoutDashboard,
  Calendar,
  Layers,
  Trash2,
  ExternalLink,
  Plus,
  Search,
  Copy,
  Sparkles,
  BarChart2,
  CheckCircle2,
  Cloud,
  RefreshCw,
  Database,
  Terminal,
  Check,
} from "lucide-react";
import {
  getSavedDashboards,
  deleteDashboardFromStorage,
  saveDashboardToStorage,
  syncDashboardsWithCloud,
} from "../utils/storage";
import { isSupabaseConfigured } from "../utils/supabase";

export default function SavedDashboardsView({
  onLoadSavedDashboard,
  onNavigateToInput,
  currentDashboardId,
}) {
  const [dashboards, setDashboards] = useState(getSavedDashboards());
  const [searchQuery, setSearchQuery] = useState("");
  const [toastMsg, setToastMsg] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [showSqlGuide, setShowSqlGuide] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  // Sync with Supabase on component mount
  useEffect(() => {
    if (isSupabaseConfigured) {
      handleCloudSync(false);
    }
  }, []);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3500);
  };

  const handleCloudSync = async (notify = true) => {
    setIsSyncing(true);
    try {
      const merged = await syncDashboardsWithCloud();
      setDashboards(merged);
      if (notify) {
        showToast("Synchronized with Supabase Cloud!");
      }
    } catch (err) {
      if (notify) {
        showToast("Sync failed: Local cache is active.");
      }
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDelete = (id, e) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this saved dashboard?")) {
      const updated = deleteDashboardFromStorage(id);
      setDashboards(updated);
      showToast("Dashboard removed from storage and Supabase.");
    }
  };

  const handleDuplicate = (d, e) => {
    e.stopPropagation();
    const copy = {
      ...d,
      id: `dash-${Date.now()}`,
      title: `${d.title} (Copy)`,
      updatedAt: new Date().toISOString(),
    };
    const updated = saveDashboardToStorage(copy);
    setDashboards(updated);
    showToast("Dashboard duplicated and synced!");
  };

  const sqlCode = `-- Run this in your Supabase SQL Editor:
create table if not exists dashboards (
  id text primary key,
  title text not null,
  dataset_name text,
  purpose text,
  data jsonb,
  raw_data jsonb,
  kpi_cards jsonb,
  charts jsonb,
  filters jsonb,
  theme text,
  row_count integer,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable public access for anon operations
alter table dashboards enable row level security;
create policy "Allow all operations for anon" on dashboards for all using (true) with check (true);`;

  const copySqlToClipboard = () => {
    navigator.clipboard.writeText(sqlCode);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const filtered = dashboards.filter((d) =>
    (d.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (d.purpose || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (d.datasetName || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto py-4 px-2 sm:px-4 space-y-6">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-500 text-slate-950 font-bold px-4 py-2 rounded-xl shadow-xl flex items-center gap-2 text-xs animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400">
              <FolderClock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-100">Saved Dashboards Gallery</h2>
                {isSupabaseConfigured && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Supabase Connected
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Reopen, duplicate, or manage previously constructed analytics workspaces.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search saved..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 w-44 sm:w-56"
            />
          </div>

          {isSupabaseConfigured && (
            <button
              onClick={() => handleCloudSync(true)}
              disabled={isSyncing}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
              title="Sync with Supabase Cloud"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isSyncing ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Sync Cloud</span>
            </button>
          )}

          <button
            onClick={onNavigateToInput}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Create New</span>
          </button>
        </div>
      </div>

      {/* Supabase Status & Setup Helper Banner */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 text-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <div className="font-semibold text-slate-200 flex items-center gap-2">
                <span>Database: Supabase Cloud</span>
                <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
                  rtuwpjsigzafcskrpilj
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Dashboards are persisted to cloud & local storage simultaneously.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowSqlGuide(!showSqlGuide)}
            className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold underline self-start sm:self-auto"
          >
            {showSqlGuide ? "Hide Supabase Table SQL" : "View Supabase Table SQL Schema"}
          </button>
        </div>

        {showSqlGuide && (
          <div className="mt-4 pt-3 border-t border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-300">
              <span className="flex items-center gap-1 text-slate-400">
                <Terminal className="w-3.5 h-3.5 text-amber-400" />
                Run this once in your Supabase SQL Editor:
              </span>
              <button
                onClick={copySqlToClipboard}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-md font-mono text-[10px] transition-colors"
              >
                {copiedSql ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedSql ? "Copied!" : "Copy SQL"}</span>
              </button>
            </div>
            <pre className="p-3 bg-slate-950 border border-slate-850 rounded-xl font-mono text-[10px] text-slate-300 overflow-x-auto leading-relaxed">
              {sqlCode}
            </pre>
          </div>
        )}
      </div>

      {/* Gallery Grid */}
      {filtered.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center space-y-4">
          <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto text-slate-500">
            <LayoutDashboard className="w-6 h-6 stroke-1" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-200">No Saved Dashboards Found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              Save your dashboard from the Canvas top bar to quickly restore your custom charts, filters, and color themes anytime.
            </p>
          </div>
          <button
            onClick={onNavigateToInput}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-semibold border border-slate-700"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Start a New Dataset</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((dash) => {
            const isCurrent = currentDashboardId === dash.id;
            const updatedDate = new Date(dash.updatedAt || Date.now()).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            });

            return (
              <div
                key={dash.id}
                onClick={() => onLoadSavedDashboard(dash)}
                className={`bg-slate-900 border rounded-2xl p-5 cursor-pointer transition-all hover:scale-[1.01] flex flex-col justify-between group shadow-sm ${
                  isCurrent
                    ? "border-amber-500/80 ring-1 ring-amber-500/30"
                    : "border-slate-800 hover:border-slate-700"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold">
                        {dash.purpose || "Analytics"}
                      </span>
                      {dash.isCloudSynced && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 inline-flex items-center gap-1" title="Stored in Supabase Cloud">
                          <Cloud className="w-3 h-3" />
                          <span>Cloud</span>
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                      <button
                        onClick={(e) => handleDuplicate(dash, e)}
                        className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-md transition-colors"
                        title="Duplicate Dashboard"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => handleDelete(dash.id, e)}
                        className="p-1 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-md transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-sm font-bold text-slate-100 group-hover:text-amber-400 transition-colors line-clamp-1">
                    {dash.title || "Untitled Dashboard"}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                    Dataset: {dash.datasetName || "Custom Data"}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-800/80 space-y-2">
                  <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                    <div className="bg-slate-950 p-1.5 rounded-lg border border-slate-850">
                      <span className="text-slate-400 block">Rows</span>
                      <span className="font-mono font-bold text-slate-200">
                        {dash.rowCount || dash.data?.length || 0}
                      </span>
                    </div>
                    <div className="bg-slate-950 p-1.5 rounded-lg border border-slate-850">
                      <span className="text-slate-400 block">Visuals</span>
                      <span className="font-mono font-bold text-cyan-400">
                        {dash.charts?.length || 0}
                      </span>
                    </div>
                    <div className="bg-slate-950 p-1.5 rounded-lg border border-slate-850">
                      <span className="text-slate-400 block">KPIs</span>
                      <span className="font-mono font-bold text-emerald-400">
                        {dash.kpiCards?.length || 0}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {updatedDate}
                    </span>
                    <span className="text-amber-400 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                      Open Canvas <ExternalLink className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
