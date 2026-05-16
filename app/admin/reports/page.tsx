"use client";

import { useState, useEffect, useCallback } from "react";
import {
  REPORT_STATUS_LABELS,
  REPORT_STATUS_COLORS,
  REPORT_CATEGORY_LABELS,
  REPORT_CATEGORY_COLORS,
  REPORT_TYPE_LABELS,
  getReportType,
} from "@/lib/constants";
import { timeAgo, starsDisplay, getUserLabel } from "@/lib/utils";
import type { Report, ReportStatus, ReportCategory } from "@/types";

type AdminFilter = "all" | "flagged" | "under_review" | "pending" | "spam";

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [filter, setFilter] = useState<AdminFilter>("flagged");
  const [loading, setLoading] = useState(true);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/reports");
    if (res.ok) setReports(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  async function handleModerate(reportId: string, action: string) {
    await fetch(`/api/admin/reports/${reportId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    fetchReports();
  }

  async function handleBlockUser(userId: string) {
    await fetch(`/api/admin/users/${userId}/block`, { method: "POST" });
    fetchReports();
  }

  const filtered = reports.filter((r) => {
    if (filter === "all") return true;
    if (filter === "flagged") return r.flagCount > 0;
    if (filter === "under_review") return r.status === "under_review";
    if (filter === "pending") return r.moderationStatus === "pending";
    if (filter === "spam") return r.moderationStatus === "spam";
    return true;
  });

  const FILTERS: { key: AdminFilter; label: string }[] = [
    { key: "flagged", label: "Señalados" },
    { key: "under_review", label: "En revisión" },
    { key: "pending", label: "Pendientes" },
    { key: "all", label: "Todos" },
  ];

  return (
    <div>
      <div className="px-4 sm:px-6 py-4 flex items-center justify-between">
        <div>
          <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold">Moderación</h2>
          <p className="text-sm text-foreground/50 mt-0.5">{filtered.length} avisos</p>
        </div>
      </div>

      <div className="px-4 sm:px-6 pb-3 flex gap-2 overflow-x-auto no-scrollbar">
        {FILTERS.map((f) => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              filter === f.key
                ? "bg-primary text-white shadow-sm shadow-primary/25"
                : "bg-secondary text-foreground/70 ring-1 ring-foreground/10"
            }`}>
            {f.label}
          </button>
        ))}
      </div>

      <div className="p-4 sm:p-6 space-y-3">
        {loading && (
          <div className="flex items-center justify-center h-40">
            <svg className="w-8 h-8 animate-spin text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" strokeDasharray="60" strokeDashoffset="20" />
            </svg>
          </div>
        )}
        {!loading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center h-40 text-foreground/40">
            <svg className="w-12 h-12 mb-2 opacity-40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm">No hay avisos en esta categoría.</p>
          </div>
        )}

        {filtered.map((report) => {
          const status = report.status as ReportStatus;
          const category = report.category as ReportCategory;
          const reportType = getReportType(category);
          return (
            <div key={report.id} className="bg-card rounded-xl ring-1 ring-foreground/10 p-4 space-y-3">
              <div className="flex items-start gap-3">
                {report.photoUrl && (
                  <img src={report.photoUrl} alt="" className="w-20 h-20 object-cover rounded-lg ring-1 ring-foreground/10 shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-medium text-foreground/40 uppercase tracking-wider">
                      {REPORT_TYPE_LABELS[reportType]}
                    </span>
                    <span className="inline-flex items-center h-5 px-2 rounded-full text-xs font-medium text-white"
                      style={{ backgroundColor: REPORT_CATEGORY_COLORS[category] }}>
                      {REPORT_CATEGORY_LABELS[category]}
                    </span>
                    <span className="inline-flex items-center h-5 px-2 rounded-full text-xs font-medium text-white"
                      style={{ backgroundColor: REPORT_STATUS_COLORS[status] }}>
                      {REPORT_STATUS_LABELS[status]}
                    </span>
                    {report.flagCount > 0 && (
                      <span className="text-xs text-red-400 font-medium">{report.flagCount} flag{report.flagCount !== 1 ? "s" : ""}</span>
                    )}
                    <span className="text-xs text-foreground/40">{timeAgo(report.createdAt)}</span>
                  </div>
                  {report.comment && <p className="text-sm text-foreground/70 mt-1 line-clamp-2">{report.comment}</p>}
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-xs text-amber-400">{starsDisplay(report.user.trustStars)}</span>
                    <span className="text-xs text-foreground/50">{report.user.displayName || getUserLabel(report.user.trustStars)}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
                <button onClick={() => handleModerate(report.id, "approve")}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20 hover:bg-emerald-500/20 transition-colors">
                  Aprobar
                </button>
                <button onClick={() => handleModerate(report.id, "hide")}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-secondary text-foreground/60 ring-1 ring-foreground/10 hover:bg-muted transition-colors">
                  Ocultar
                </button>
                <button onClick={() => handleModerate(report.id, "spam")}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-red-500/10 text-red-400 ring-1 ring-red-500/20 hover:bg-red-500/20 transition-colors">
                  Spam
                </button>
                <button onClick={() => handleModerate(report.id, "remove")}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-secondary text-foreground/60 ring-1 ring-foreground/10 hover:bg-muted transition-colors">
                  Removido
                </button>
                <button onClick={() => handleBlockUser(report.user.id)}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-red-500/10 text-red-400 ring-1 ring-red-500/20 hover:bg-red-500/20 transition-colors">
                  Bloquear usuario
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
