import React from "react";
import { Database, ShieldCheck, Filter, LayoutDashboard, FileDown, FolderClock } from "lucide-react";

export default function MobileBottomNav({ activeTab, setActiveTab }) {
  const tabs = [
    { id: "dataset-input", label: "Input", icon: Database },
    { id: "data-cleaning", label: "Clean", icon: ShieldCheck },
    { id: "filter-preview", label: "Filter", icon: Filter },
    { id: "dashboard", label: "Canvas", icon: LayoutDashboard },
    { id: "comparison", label: "Compare", icon: FolderClock },
    { id: "export-report", label: "Export", icon: FileDown },
  ];

  return (
    <nav className="no-print lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 px-2 py-1.5 flex items-center justify-around shadow-2xl">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
              isActive
                ? "text-amber-400 font-bold bg-amber-500/10"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Icon className={`w-4 h-4 mb-0.5 ${isActive ? "stroke-[2.5]" : ""}`} />
            <span className="text-[10px]">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
