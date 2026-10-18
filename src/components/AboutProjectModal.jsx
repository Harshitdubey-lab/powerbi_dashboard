import React, { useState } from "react";
import {
  X,
  GraduationCap,
  Code2,
  Cpu,
  Layers,
  Sparkles,
  BookOpen,
  Award,
  CheckCircle2,
  Edit2,
  Save,
} from "lucide-react";
import { saveStudentInfo } from "../utils/storage";

export default function AboutProjectModal({ isOpen, onClose, studentInfo, setStudentInfo }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(studentInfo);
  const [toast, setToast] = useState("");

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    setStudentInfo(formData);
    saveStudentInfo(formData);
    setIsEditing(false);
    setToast("Student profile updated!");
    setTimeout(() => setToast(""), 2500);
  };

  const techStack = [
    { name: "React 19", desc: "Component architecture & state", color: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" },
    { name: "Vite 8", desc: "Lightning fast bundler & HMR", color: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
    { name: "Tailwind CSS v4", desc: "Modern utility styling & tokens", color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
    { name: "Recharts", desc: "Responsive SVG data visuals", color: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
    { name: "PapaParse", desc: "Streaming CSV parser", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
    { name: "SheetJS (XLSX)", desc: "Excel spreadsheet reader & writer", color: "bg-rose-500/10 text-rose-400 border-rose-500/20" },
    { name: "jsPDF & html2canvas", desc: "Client-side report PDF exports", color: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" },
    { name: "Lucide React", desc: "Power BI style UI iconography", color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">About Smart Data Dashboard Builder</h2>
              <p className="text-xs text-slate-400">Academic Final Year / Capstone Engineering Project</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {toast && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-2 text-emerald-300 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{toast}</span>
            </div>
          )}

          {/* Project Summary */}
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Project Abstract</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              <strong>Smart Data Dashboard Builder</strong> is a Power BI-inspired web studio that democratizes data analysis.
              It allows users to supply raw tabular datasets (CSV, Excel, API), executes automated quality cleansing,
              detects column schemas, and generates interactive charts, KPI metrics, slicer cross-filters, and printable PDF reports.
            </p>
          </div>

          {/* Academic Info & Student Credentials */}
          <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Student Academic Profile</span>
              </div>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="text-xs text-amber-400 hover:underline flex items-center gap-1 font-semibold"
              >
                {isEditing ? <X className="w-3.5 h-3.5" /> : <Edit2 className="w-3.5 h-3.5" />}
                <span>{isEditing ? "Cancel" : "Edit Details"}</span>
              </button>
            </div>

            {isEditing ? (
              <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Student Name</label>
                  <input
                    type="text"
                    value={formData.studentName}
                    onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Roll / ID Number</label>
                  <input
                    type="text"
                    value={formData.rollNo}
                    onChange={(e) => setFormData({ ...formData, rollNo: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Department / Branch</label>
                  <input
                    type="text"
                    value={formData.collegeName}
                    onChange={(e) => setFormData({ ...formData, collegeName: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">University / Institute</label>
                  <input
                    type="text"
                    value={formData.universityName}
                    onChange={(e) => setFormData({ ...formData, universityName: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Academic Year</label>
                  <input
                    type="text"
                    value={formData.projectYear}
                    onChange={(e) => setFormData({ ...formData, projectYear: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-100"
                  />
                </div>
                <div className="sm:col-span-2 pt-2">
                  <button
                    type="submit"
                    className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs flex items-center justify-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Academic Details</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block">Lead Developer</span>
                  <span className="font-bold text-slate-200">{studentInfo.studentName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Roll / Reg No.</span>
                  <span className="font-mono text-amber-400 font-semibold">{studentInfo.rollNo}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Department</span>
                  <span className="text-slate-300">{studentInfo.collegeName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Academic Session</span>
                  <span className="text-slate-300">{studentInfo.projectYear}</span>
                </div>
              </div>
            )}
          </div>

          {/* Technology Stack Grid */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-purple-400 uppercase tracking-wider">
              <Code2 className="w-3.5 h-3.5" />
              <span>Technology Stack & Libraries</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {techStack.map((tech) => (
                <div
                  key={tech.name}
                  className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-slate-200 block">{tech.name}</span>
                    <span className="text-[11px] text-slate-400">{tech.desc}</span>
                  </div>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${tech.color}`}>
                    Active
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-[11px] text-slate-400">
          <span>{studentInfo.projectTitle}</span>
          <span>Version 2.0.0</span>
        </div>
      </div>
    </div>
  );
}
