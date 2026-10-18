import React from "react";
import {
  Database,
  Sparkles,
  Filter,
  LayoutDashboard,
  FileDown,
  Info,
  Layers,
  ChevronRight,
  ShieldCheck,
  Scale,
  FolderClock,
  GraduationCap,
} from "lucide-react";

export default function Sidebar({
  activeTab,
  setActiveTab,
  stats,
  isCleaned,
  datasetName,
  datasetPurpose,
  isOpen,
  onToggle,
  onOpenAbout,
  savedCount = 0,
}) {
  const navItems = [
    {
      id: "dataset-input",
      label: "Dataset Input",
      desc: "Upload or select data",
      icon: Database,
      badge: stats.rawRowCount ? `${stats.rawRowCount} rows` : null,
      badgeColor: "bg-slate-800 text-slate-300",
    },
    {
      id: "data-cleaning",
      label: "Data Cleaning",
      desc: "Duplicates & missing values",
      icon: ShieldCheck,
      badge: isCleaned ? "Cleaned" : stats.duplicateCount ? `${stats.duplicateCount} dupes` : null,
      badgeColor: isCleaned ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30" : "bg-amber-500/10 text-amber-400",
    },
    {
      id: "filter-preview",
      label: "Filter & Explore",
      desc: "Schema & data table",
      icon: Filter,
      badge: stats.columnCount ? `${stats.columnCount} cols` : null,
      badgeColor: "bg-slate-800 text-slate-300",
    },
    {
      id: "dashboard",
      label: "Dashboard Canvas",
      desc: "Interactive visual charts",
      icon: LayoutDashboard,
      badge: "Power BI",
      badgeColor: "bg-amber-500/20 text-amber-400 font-semibold",
    },
    {
      id: "comparison",
      label: "Comparison Studio",
      desc: "Dual column benchmark",
      icon: Scale,
      badge: "Delta %",
      badgeColor: "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20",
    },
    {
      id: "export-report",
      label: "Export & Report",
      desc: "PDF summary & data files",
      icon: FileDown,
      badge: null,
      badgeColor: "",
    },
    {
      id: "saved-dashboards",
      label: "Recent Dashboards",
      desc: "Saved workspace library",
      icon: FolderClock,
      badge: savedCount > 0 ? `${savedCount}` : null,
      badgeColor: "bg-purple-500/15 text-purple-300 border border-purple-500/30",
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onToggle}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-30 lg:hidden"
        />
      )}

      <aside
        className={`no-print fixed lg:static top-16 bottom-0 left-0 z-35 w-64 lg:w-72 bg-slate-900/98 lg:bg-slate-900/95 border-r border-slate-800 flex flex-col shrink-0 transition-transform duration-200 ease-in-out ${
          isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Workspace / Project Title */}
        <div className="p-4 border-b border-slate-800/80 bg-slate-950/30">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            Dashboard Workspace
          </div>
          <p className="text-sm font-bold text-slate-200 mt-1 truncate">
            {datasetName || "New Dashboard"}
          </p>
          <span className="inline-block text-[11px] text-amber-400/90 font-medium">
            {datasetPurpose || "General Analytics"}
          </span>
        </div>

        {/* Navigation List */}
        <div className="p-3 flex-1 overflow-y-auto space-y-1">
          <div className="text-[11px] font-bold text-slate-400 px-3 py-1.5 uppercase tracking-wider">
            Workflow Stages
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  if (isOpen && onToggle) onToggle();
                }}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all group ${
                  isActive
                    ? "bg-amber-500/10 border border-amber-500/40 text-slate-100 shadow-sm"
                    : "hover:bg-slate-800/60 text-slate-400 hover:text-slate-200 border border-transparent"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`p-2 rounded-lg transition-colors ${
                      isActive
                        ? "bg-amber-500 text-slate-950"
                        : "bg-slate-800 group-hover:bg-slate-700 text-slate-300"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <div className="text-xs font-bold text-slate-200 truncate flex items-center gap-1.5">
                      <span>{item.label}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">{item.desc}</div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0 ml-2">
                  {item.badge && (
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  )}
                  <ChevronRight
                    className={`w-3.5 h-3.5 transition-transform ${
                      isActive ? "text-amber-400 translate-x-0.5" : "text-slate-600 group-hover:text-slate-400"
                    }`}
                  />
                </div>
              </button>
            );
          })}
        </div>

        {/* Bottom Panel with Mini Stats & About Trigger */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/40 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Quality Health</span>
            <span
              className={`inline-flex items-center gap-1 font-semibold text-[11px] ${
                isCleaned ? "text-emerald-400" : "text-amber-400"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isCleaned ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
                }`}
              />
              {isCleaned ? "Cleaned & Ready" : "Raw Data"}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-center text-xs">
            <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
              <span className="block text-[10px] text-slate-400">Rows</span>
              <span className="font-mono font-bold text-slate-200">
                {stats.rowCount || 0}
              </span>
            </div>
            <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
              <span className="block text-[10px] text-slate-400">Columns</span>
              <span className="font-mono font-bold text-slate-200">
                {stats.columnCount || 0}
              </span>
            </div>
          </div>

          <button
            onClick={onOpenAbout}
            className="w-full py-1.5 px-2 rounded-lg bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white text-[11px] font-semibold border border-slate-800 flex items-center justify-center gap-1.5 transition-colors"
          >
            <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
            <span>About Project & Credits</span>
          </button>
        </div>
      </aside>
    </>
  );
}
