"use client";

import { useState } from "react";
import type { Report, ReportStatus, ReportCategory, LocationValidation } from "@/types";
import {
  REPORT_STATUS_LABELS,
  REPORT_STATUS_COLORS,
  REPORT_CATEGORY_LABELS,
  REPORT_CATEGORY_COLORS,
  REPORT_TYPE_LABELS,
  getReportType,
} from "@/lib/constants";
import { timeAgo } from "@/lib/utils";
import UserBadge from "./UserBadge";
import ConfidenceBadge from "./ConfidenceBadge";
import LocationBadge from "./LocationBadge";

interface ReportDetailProps {
  report: Report;
  isLoggedIn: boolean;
  emailVerified: boolean;
  isBlocked: boolean;
  onClose: () => void;
  onAction: () => void;
  onAuthRequired: () => void;
}

export default function ReportDetail({ report, isLoggedIn, emailVerified, isBlocked, onClose, onAction, onAuthRequired }: ReportDetailProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const canInteract = isLoggedIn && emailVerified && !isBlocked;

  async function handleAction(action: "confirm" | "remove" | "flag") {
    if (!isLoggedIn || (isLoggedIn && !emailVerified)) {
      onAuthRequired();
      return;
    }
    if (isBlocked) {
      setFeedback("Tu cuenta está restringida. No podés interactuar con avisos.");
      return;
    }

    setLoading(action);
    setFeedback(null);
    try {
      const res = await fetch(`/api/reports/${report.id}/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: action === "flag" ? JSON.stringify({ reason: "" }) : "{}",
      });
      if (res.ok) {
        const messages = { confirm: "Confirmado. Gracias.", remove: "Marcado como removido.", flag: "Señalado para revisión. Gracias." };
        setFeedback(messages[action]);
        setTimeout(() => onAction(), 1000);
      } else {
        const data = await res.json();
        setFeedback(data.error || "Error");
      }
    } catch {
      setFeedback("Error de conexión");
    } finally {
      setLoading(null);
    }
  }

  const status = report.status as ReportStatus;
  const category = report.category as ReportCategory;
  const reportType = getReportType(category);

  return (
    <div className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative bg-card rounded-t-xl sm:rounded-xl w-full sm:max-w-sm max-h-[85vh] overflow-y-auto ring-1 ring-foreground/10 shadow-xl">
        {/* Header */}
        <div className="sticky top-0 bg-card rounded-t-xl border-b border-border px-4 py-3 flex items-center justify-between z-10">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-medium text-foreground/40 uppercase tracking-wider">
              {REPORT_TYPE_LABELS[reportType]}
            </span>
            <span className="inline-flex items-center h-5 px-2.5 rounded-4xl text-xs font-medium text-white"
              style={{ backgroundColor: REPORT_CATEGORY_COLORS[category] }}>
              {REPORT_CATEGORY_LABELS[category]}
            </span>
            <span className="inline-flex items-center h-5 px-2.5 rounded-4xl text-xs font-medium text-white"
              style={{ backgroundColor: REPORT_STATUS_COLORS[status] }}>
              {REPORT_STATUS_LABELS[status]}
            </span>
          </div>
          <button onClick={onClose} className="h-8 w-8 flex items-center justify-center rounded-lg text-foreground/40 hover:text-foreground hover:bg-muted transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="p-4 space-y-3">
          {/* Foto */}
          {report.photoUrl && (
            <img src={report.photoUrl} alt="Foto del aviso" className="w-full h-48 object-cover rounded-lg ring-1 ring-foreground/10" />
          )}

          {/* Badges de confianza */}
          <div className="flex flex-wrap gap-2">
            <ConfidenceBadge score={report.confidenceScore} />
            <LocationBadge status={report.locationValidation as LocationValidation} />
          </div>

          {/* Usuario */}
          <div className="flex items-center justify-between">
            <UserBadge trustStars={report.user.trustStars} displayName={report.user.displayName} />
            <span className="text-xs text-foreground/40">{timeAgo(report.createdAt)}</span>
          </div>

          {/* Comentario */}
          {report.comment && (
            <p className="text-sm text-card-foreground/80">{report.comment}</p>
          )}

          {/* Metadata */}
          <div className="flex items-center gap-3 text-xs text-foreground/40">
            {report.confirmationCount > 0 && (
              <span className="text-emerald-400 font-medium">
                {report.confirmationCount} confirmación{report.confirmationCount !== 1 ? "es" : ""}
              </span>
            )}
          </div>

          {/* Feedback */}
          {feedback && (
            <div className="text-sm text-center py-2 px-3 rounded-lg bg-muted text-foreground/80 ring-1 ring-foreground/5">
              {feedback}
            </div>
          )}

          {/* Acciones */}
          <div className="grid grid-cols-3 gap-2">
            <button onClick={() => handleAction("confirm")} disabled={loading !== null}
              className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 ring-1 ring-emerald-500/20 transition-all active:translate-y-px disabled:opacity-50">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span className="text-xs font-medium text-emerald-400">Sigue ahí</span>
            </button>
            <button onClick={() => handleAction("remove")} disabled={loading !== null}
              className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 ring-1 ring-red-500/20 transition-all active:translate-y-px disabled:opacity-50">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
              <span className="text-xs font-medium text-red-400">Ya no está</span>
            </button>
            <button onClick={() => handleAction("flag")} disabled={loading !== null}
              className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 ring-1 ring-amber-500/20 transition-all active:translate-y-px disabled:opacity-50">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/>
              </svg>
              <span className="text-xs font-medium text-amber-400">Problema</span>
            </button>
          </div>

          {!canInteract && (
            <p className="text-xs text-center text-foreground/40">
              {isBlocked
                ? "Tu cuenta está restringida."
                : !isLoggedIn
                ? "Para colaborar con el mapa, iniciá sesión y verificá tu email."
                : "Verificá tu email para poder colaborar con el mapa."}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
