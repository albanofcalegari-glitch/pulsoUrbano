"use client";

import { useState, useEffect, useCallback } from "react";
import { timeAgo } from "@/lib/utils";
import type { AppFeedback, FeedbackType, FeedbackStatus } from "@/types";

const TYPE_LABELS: Record<FeedbackType, string> = {
  bug: "Bug",
  confusion: "Confuso",
  suggestion: "Sugerencia",
  performance: "Lentitud",
  visual: "Visual",
  other: "Otro",
};

const TYPE_COLORS: Record<FeedbackType, string> = {
  bug: "#EF4444",
  confusion: "#F59E0B",
  suggestion: "#3B82F6",
  performance: "#F97316",
  visual: "#8B5CF6",
  other: "#6B7280",
};

const STATUS_LABELS: Record<FeedbackStatus, string> = {
  new: "Nuevo",
  reviewed: "Revisado",
  planned: "Planeado",
  resolved: "Resuelto",
  dismissed: "Descartado",
};

const STATUS_COLORS: Record<FeedbackStatus, string> = {
  new: "#3B82F6",
  reviewed: "#F59E0B",
  planned: "#8B5CF6",
  resolved: "#10B981",
  dismissed: "#9CA3AF",
};

type FilterKey = "all" | FeedbackStatus;

function shortenUA(ua: string | null): string {
  if (!ua) return "";
  if (ua.includes("iPhone")) return "iPhone";
  if (ua.includes("Android")) return "Android";
  if (ua.includes("Chrome")) return "Chrome";
  if (ua.includes("Firefox")) return "Firefox";
  if (ua.includes("Safari")) return "Safari";
  return ua.slice(0, 30);
}

export default function AdminFeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<AppFeedback[]>([]);
  const [filter, setFilter] = useState<FilterKey>("new");
  const [loading, setLoading] = useState(true);

  const fetchFeedbacks = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filter !== "all") params.set("status", filter);
    const res = await fetch(`/api/admin/feedback?${params}`);
    if (res.ok) setFeedbacks(await res.json());
    setLoading(false);
  }, [filter]);

  useEffect(() => { fetchFeedbacks(); }, [fetchFeedbacks]);

  async function handleStatus(id: string, status: FeedbackStatus) {
    await fetch(`/api/admin/feedback/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    fetchFeedbacks();
  }

  const FILTERS: { key: FilterKey; label: string }[] = [
    { key: "new", label: "Nuevos" },
    { key: "reviewed", label: "Revisados" },
    { key: "planned", label: "Planeados" },
    { key: "resolved", label: "Resueltos" },
    { key: "dismissed", label: "Descartados" },
    { key: "all", label: "Todos" },
  ];

  return (
    <div>
      <div className="px-4 sm:px-6 py-4 flex items-center justify-between">
        <div>
          <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold">Feedback</h2>
          <p className="text-sm text-foreground/50 mt-0.5">{feedbacks.length} comentarios</p>
        </div>
        <a href="/api/admin/feedback/export"
          className="text-xs text-foreground/50 hover:text-foreground ring-1 ring-foreground/10 px-3 py-1.5 rounded-lg transition-colors">
          Exportar CSV
        </a>
      </div>

      <div className="px-4 sm:px-6 pb-3 flex gap-2 overflow-x-auto no-scrollbar">
        {FILTERS.map((f) => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className={`shrink-0 px-3 py-1.5 rounded-4xl text-xs font-medium transition-all ${
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
        {!loading && feedbacks.length === 0 && (
          <p className="text-foreground/50 text-sm">No hay feedback en esta categoría.</p>
        )}

        {feedbacks.map((fb) => {
          const fbType = fb.type as FeedbackType;
          const fbStatus = fb.status as FeedbackStatus;
          return (
            <div key={fb.id} className="bg-card rounded-xl ring-1 ring-foreground/10 p-4 space-y-3">
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center h-5 px-2 rounded-4xl text-xs font-medium text-white"
                      style={{ backgroundColor: TYPE_COLORS[fbType] }}>
                      {TYPE_LABELS[fbType]}
                    </span>
                    <span className="inline-flex items-center h-5 px-2 rounded-4xl text-xs font-medium text-white"
                      style={{ backgroundColor: STATUS_COLORS[fbStatus] }}>
                      {STATUS_LABELS[fbStatus]}
                    </span>
                    <span className="text-xs text-foreground/40">{timeAgo(fb.createdAt)}</span>
                  </div>
                  <p className="text-sm text-foreground/80 mt-2 whitespace-pre-wrap">{fb.message}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-foreground/40">
                    {fb.user && <span>{fb.user.displayName || "Vecino"}</span>}
                    {!fb.user && fb.email && <span>{fb.email}</span>}
                    {!fb.user && !fb.email && <span>Anónimo</span>}
                    {fb.pageUrl && <span className="truncate max-w-[200px]">{fb.pageUrl}</span>}
                    {fb.userAgent && <span>{shortenUA(fb.userAgent)}</span>}
                  </div>
                  {fb.adminNotes && (
                    <div className="mt-2 text-xs text-foreground/50 bg-muted px-3 py-2 rounded-lg ring-1 ring-foreground/5">
                      <span className="font-medium">Nota:</span> {fb.adminNotes}
                    </div>
                  )}
                </div>
              </div>

              {/* Acciones */}
              <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
                <button onClick={() => handleStatus(fb.id, "reviewed")}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20 hover:bg-amber-500/20 transition-colors">
                  Revisado
                </button>
                <button onClick={() => handleStatus(fb.id, "planned")}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-purple-500/10 text-purple-400 ring-1 ring-purple-500/20 hover:bg-purple-500/20 transition-colors">
                  Planeado
                </button>
                <button onClick={() => handleStatus(fb.id, "resolved")}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20 hover:bg-emerald-500/20 transition-colors">
                  Resuelto
                </button>
                <button onClick={() => handleStatus(fb.id, "dismissed")}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-secondary text-foreground/60 ring-1 ring-foreground/10 hover:bg-muted transition-colors">
                  Descartar
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
