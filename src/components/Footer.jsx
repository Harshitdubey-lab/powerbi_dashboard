import React from "react";
import { GraduationCap, Heart, Code2, Sparkles, Layers } from "lucide-react";

export default function Footer({ studentInfo, onOpenAbout }) {
  return (
    <footer className="no-print bg-slate-950 border-t border-slate-850 py-4 px-4 sm:px-8 text-xs text-slate-400">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Left: Academic info */}
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-amber-500/10 rounded-lg text-amber-400">
            <GraduationCap className="w-4 h-4" />
          </div>
          <div>
            <span className="font-semibold text-slate-200">
              {studentInfo.studentName || "Alex Morgan"}
            </span>
            <span className="text-slate-500 mx-1.5">•</span>
            <span className="text-slate-400">{studentInfo.collegeName}</span>
            <span className="text-slate-500 mx-1.5">•</span>
            <span className="font-mono text-amber-400/90">{studentInfo.projectYear}</span>
          </div>
        </div>

        {/* Right: Project trigger & badges */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
            <Code2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>React + Vite + Tailwind + Recharts</span>
          </div>

          <button
            onClick={onOpenAbout}
            className="text-[11px] font-semibold text-amber-400 hover:text-amber-300 hover:underline transition-colors"
          >
            About Project
          </button>
        </div>
      </div>
    </footer>
  );
}
