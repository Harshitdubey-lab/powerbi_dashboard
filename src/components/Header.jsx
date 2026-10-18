import React from "react";
import {
  LayoutDashboard,
  FileSpreadsheet,
  Sparkles,
  Download,
  FolderClock,
  Scale,
  GraduationCap,
  User,
  Menu,
  X,
} from "lucide-react";

export default function Header({
  datasetName,
  datasetPurpose,
  rowCount,
  activeTab,
  setActiveTab,
  isCleaned,
  isSidebarOpen,
  setIsSidebarOpen,
  currentUser,
  onOpenAuth,
  onOpenAbout,
}) {
  const steps = [
    { id: "dataset-input", label: "1. Input" },
    { id: "data-cleaning", label: "2. Clean" },
    { id: "filter-preview", label: "3. Filter" },
    { id: "dashboard", label: "4. Canvas" },
    { id: "comparison", label: "5. Compare" },
    { id: "export-report", label: "6. Export" },
    { id: "saved-dashboards", label: "Saved" },
  ];

  return (
    <header className="no-print bg-slate-900 border-b border-slate-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo & Mobile Menu Toggle */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setIsSidebarOpen && setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors"
              aria-label="Toggle navigation menu"
            >
              {isSidebarOpen ? <X className="w-5 h-5 text-amber-400" /> : <Menu className="w-5 h-5" />}
            </button>

            <div
              onClick={() => setActiveTab("dashboard")}
              className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-md shadow-amber-500/20 shrink-0 cursor-pointer"
            >
              <LayoutDashboard className="w-5 h-5 text-slate-950 stroke-[2.5]" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xs sm:text-sm font-bold text-slate-100 tracking-tight truncate max-w-[150px] sm:max-w-none">
                  Smart Data Dashboard Builder
                </h1>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  Power BI Studio
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <span className="font-medium text-slate-300 truncate max-w-[120px] sm:max-w-[200px]">
                  {datasetName || "Untitled Dataset"}
                </span>
                {rowCount !== undefined && (
                  <>
                    <span>•</span>
                    <span className="font-mono text-emerald-400 text-[11px] font-semibold">
                      {rowCount} rows
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Workflow Steps Navbar */}
          <nav className="hidden xl:flex items-center bg-slate-950/70 p-1 rounded-xl border border-slate-800">
            {steps.map((step) => {
              const isActive = activeTab === step.id;
              return (
                <button
                  key={step.id}
                  onClick={() => setActiveTab(step.id)}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                    isActive
                      ? "bg-amber-500 text-slate-950 shadow-sm"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                  }`}
                >
                  {step.label}
                </button>
              );
            })}
          </nav>

          {/* Right Action Controls: Saved, About, User Profile, Export */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => setActiveTab("saved-dashboards")}
              className={`hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                activeTab === "saved-dashboards"
                  ? "bg-amber-500/20 text-amber-400 border-amber-500/40"
                  : "bg-slate-800/80 hover:bg-slate-800 text-slate-300 border-slate-700"
              }`}
            >
              <FolderClock className="w-3.5 h-3.5 text-amber-400" />
              <span>Library</span>
            </button>

            <button
              onClick={onOpenAbout}
              className="hidden md:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors"
            >
              <GraduationCap className="w-3.5 h-3.5 text-cyan-400" />
              <span>About</span>
            </button>

            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
            >
              <div
                className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold text-slate-950"
                style={{ backgroundColor: currentUser?.avatarColor || "#f59e0b" }}
              >
                {currentUser?.name?.charAt(0) || "U"}
              </div>
              <span className="hidden sm:inline truncate max-w-[80px]">
                {currentUser?.name?.split(" ")[0] || "Sign In"}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("export-report")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-sm transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
