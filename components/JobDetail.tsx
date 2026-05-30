"use client";

import { useState, useEffect, useCallback } from "react";
import type { JobRequest, JobApplication, JobReview, ServiceCategory } from "@/types";
import {
  SERVICE_CATEGORY_LABELS,
  SERVICE_CATEGORY_COLORS,
  JOB_URGENCY_LABELS,
  JOB_STATUS_LABELS,
} from "@/lib/constants";
import { timeAgo, starsDisplay } from "@/lib/utils";

interface JobDetailProps {
  job: JobRequest;
  currentUserId: string | null;
  hasProviderProfile: boolean;
  onClose: () => void;
  onAuthRequired: () => void;
  onNeedProvider: () => void;
  onJobUpdated: () => void;
}

export default function JobDetail({
  job,
  currentUserId,
  hasProviderProfile,
  onClose,
  onAuthRequired,
  onNeedProvider,
  onJobUpdated,
}: JobDetailProps) {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [reviews, setReviews] = useState<JobReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"info" | "applications">("info");

  // Application form
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [applyMessage, setApplyMessage] = useState("");
  const [applyPrice, setApplyPrice] = useState("");
  const [applyTime, setApplyTime] = useState("");
  const [applying, setApplying] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);

  // Review form
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  // Actions
  const [actionLoading, setActionLoading] = useState(false);

  const isOwner = currentUserId === job.userId;
  const catLabel = SERVICE_CATEGORY_LABELS[job.category] || job.category;
  const catColor = SERVICE_CATEGORY_COLORS[job.category] || "#6B7280";
  const urgencyLabel = JOB_URGENCY_LABELS[job.urgency] || job.urgency;
  const statusLabel = JOB_STATUS_LABELS[job.status] || job.status;

  const hasBudget = job.budgetMin != null || job.budgetMax != null;
  let budgetText = "A convenir";
  if (job.budgetMin != null && job.budgetMax != null) {
    budgetText = `$${job.budgetMin.toLocaleString()} — $${job.budgetMax.toLocaleString()}`;
  } else if (job.budgetMin != null) {
    budgetText = `Desde $${job.budgetMin.toLocaleString()}`;
  } else if (job.budgetMax != null) {
    budgetText = `Hasta $${job.budgetMax.toLocaleString()}`;
  }

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [appsRes, reviewsRes] = await Promise.all([
        fetch(`/api/jobs/${job.id}/applications`),
        fetch(`/api/jobs/${job.id}/reviews`),
      ]);
      if (appsRes.ok) setApplications(await appsRes.json());
      if (reviewsRes.ok) setReviews(await reviewsRes.json());
    } catch { /* ignore */ }
    setLoading(false);
  }, [job.id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const myApplication = applications.find((a) => a.userId === currentUserId);
  const acceptedApp = applications.find((a) => a.status === "accepted");
  const myReview = reviews.find((r) => r.authorId === currentUserId);
  const canApply = job.status === "open" && currentUserId && !isOwner && !myApplication;
  const canReview = job.status === "completed" && currentUserId && !myReview &&
    (isOwner || acceptedApp?.userId === currentUserId);

  async function handleApply(e: React.FormEvent) {
    e.preventDefault();
    setApplying(true);
    setApplyError(null);
    try {
      const res = await fetch(`/api/jobs/${job.id}/applications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: applyMessage.trim(),
          proposedPrice: applyPrice ? parseInt(applyPrice) : undefined,
          estimatedTime: applyTime.trim() || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al postularse");
      }
      setShowApplyForm(false);
      setApplyMessage("");
      setApplyPrice("");
      setApplyTime("");
      fetchData();
      onJobUpdated();
    } catch (err) {
      setApplyError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setApplying(false);
    }
  }

  async function handleApplicationAction(appId: string, status: "accepted" | "rejected") {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/jobs/${job.id}/applications/${appId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        fetchData();
        onJobUpdated();
      }
    } catch { /* ignore */ }
    setActionLoading(false);
  }

  async function handleStatusChange(newStatus: string) {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/jobs/${job.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        onJobUpdated();
        onClose();
      }
    } catch { /* ignore */ }
    setActionLoading(false);
  }

  async function handleReview(e: React.FormEvent) {
    e.preventDefault();
    setReviewSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobRequestId: job.id,
          rating: reviewRating,
          comment: reviewComment.trim() || undefined,
        }),
      });
      if (res.ok) {
        setShowReviewForm(false);
        fetchData();
      }
    } catch { /* ignore */ }
    setReviewSubmitting(false);
  }

  return (
    <div className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white dark:bg-zinc-900 w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl p-5 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className="text-xs px-2 py-0.5 rounded-full text-white font-medium"
                style={{ backgroundColor: catColor }}
              >
                {catLabel}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                job.status === "open" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                job.status === "in_progress" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" :
                job.status === "completed" ? "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400" :
                "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
              }`}>
                {statusLabel}
              </span>
              {job.urgency === "urgent" && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 font-medium">
                  {urgencyLabel}
                </span>
              )}
            </div>
            <h2 className="text-lg font-bold leading-tight">{job.title}</h2>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 text-xl shrink-0">✕</button>
        </div>

        {/* Tabs */}
        <div className="flex border-b dark:border-zinc-700">
          <button
            onClick={() => setTab("info")}
            className={`flex-1 text-sm py-2 font-medium border-b-2 transition-colors ${
              tab === "info" ? "border-purple-500 text-purple-600 dark:text-purple-400" : "border-transparent text-zinc-500"
            }`}
          >
            Detalle
          </button>
          <button
            onClick={() => setTab("applications")}
            className={`flex-1 text-sm py-2 font-medium border-b-2 transition-colors ${
              tab === "applications" ? "border-purple-500 text-purple-600 dark:text-purple-400" : "border-transparent text-zinc-500"
            }`}
          >
            Postulaciones ({applications.length})
          </button>
        </div>

        {tab === "info" ? (
          <>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap leading-relaxed">
              {job.description}
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-zinc-50 dark:bg-zinc-800 rounded-xl p-3">
                <p className="text-xs text-zinc-500 mb-0.5">Presupuesto</p>
                <p className="text-sm font-semibold">{hasBudget ? budgetText : "A convenir"}</p>
              </div>
              <div className="bg-zinc-50 dark:bg-zinc-800 rounded-xl p-3">
                <p className="text-xs text-zinc-500 mb-0.5">Urgencia</p>
                <p className="text-sm font-semibold">{urgencyLabel}</p>
              </div>
              <div className="bg-zinc-50 dark:bg-zinc-800 rounded-xl p-3">
                <p className="text-xs text-zinc-500 mb-0.5">Postulaciones</p>
                <p className="text-sm font-semibold">{applications.length}</p>
              </div>
              <div className="bg-zinc-50 dark:bg-zinc-800 rounded-xl p-3">
                <p className="text-xs text-zinc-500 mb-0.5">Publicado</p>
                <p className="text-sm font-semibold">{timeAgo(job.createdAt)}</p>
              </div>
            </div>

            {job.address && (
              <p className="text-sm text-zinc-500">
                {job.address}
              </p>
            )}

            <div className="flex items-center gap-2 pt-2 border-t dark:border-zinc-700">
              <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-sm">
                {isOwner ? "Tu" : job.user.displayName?.[0]?.toUpperCase() || "V"}
              </div>
              <div>
                <p className="text-sm font-medium">{isOwner ? "Tu pedido" : job.user.displayName || "Vecino"}</p>
                <p className="text-xs text-zinc-500">
                  {starsDisplay(job.user.trustStars)} · {job.user.label}
                </p>
              </div>
            </div>

            {/* Reviews */}
            {reviews.length > 0 && (
              <div className="space-y-2 pt-2 border-t dark:border-zinc-700">
                <p className="text-sm font-semibold">Reseñas</p>
                {reviews.map((r) => (
                  <div key={r.id} className="bg-zinc-50 dark:bg-zinc-800 rounded-xl p-3 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-amber-500 text-sm">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span>
                      <span className="text-xs text-zinc-500">{r.author.displayName || "Vecino"}</span>
                    </div>
                    {r.comment && <p className="text-xs text-zinc-600 dark:text-zinc-400">{r.comment}</p>}
                  </div>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="space-y-2 pt-2">
              {/* Apply button */}
              {canApply && !showApplyForm && (
                <button
                  onClick={() => {
                    if (!currentUserId) { onAuthRequired(); return; }
                    if (!hasProviderProfile) { onNeedProvider(); return; }
                    setShowApplyForm(true);
                  }}
                  className="w-full py-2.5 rounded-lg bg-purple-600 text-white font-medium text-sm hover:bg-purple-700"
                >
                  Postularme
                </button>
              )}

              {/* My application status */}
              {myApplication && (
                <div className={`text-sm text-center py-2 rounded-lg font-medium ${
                  myApplication.status === "accepted" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                  myApplication.status === "rejected" ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400" :
                  "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                }`}>
                  {myApplication.status === "accepted" ? "Tu postulación fue aceptada" :
                   myApplication.status === "rejected" ? "Tu postulación fue rechazada" :
                   "Tu postulación está pendiente"}
                </div>
              )}

              {/* Owner: complete job */}
              {isOwner && job.status === "in_progress" && (
                <button
                  onClick={() => handleStatusChange("completed")}
                  disabled={actionLoading}
                  className="w-full py-2.5 rounded-lg bg-green-600 text-white font-medium text-sm hover:bg-green-700 disabled:opacity-50"
                >
                  {actionLoading ? "Procesando..." : "Marcar como completado"}
                </button>
              )}

              {/* Owner: cancel job */}
              {isOwner && (job.status === "open" || job.status === "in_progress") && (
                <button
                  onClick={() => handleStatusChange("cancelled")}
                  disabled={actionLoading}
                  className="w-full py-2 rounded-lg border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 font-medium text-sm hover:bg-red-50 dark:hover:bg-red-950/20 disabled:opacity-50"
                >
                  Cancelar pedido
                </button>
              )}

              {/* Review */}
              {canReview && !showReviewForm && (
                <button
                  onClick={() => setShowReviewForm(true)}
                  className="w-full py-2.5 rounded-lg bg-amber-500 text-white font-medium text-sm hover:bg-amber-600"
                >
                  Dejar reseña
                </button>
              )}
            </div>

            {/* Apply form */}
            {showApplyForm && (
              <form onSubmit={handleApply} className="space-y-3 pt-2 border-t dark:border-zinc-700">
                <p className="text-sm font-semibold">Tu postulación</p>
                <div>
                  <label className="block text-xs font-medium mb-1">Mensaje *</label>
                  <textarea
                    value={applyMessage}
                    onChange={(e) => setApplyMessage(e.target.value)}
                    placeholder="Contá tu experiencia y cómo harías el trabajo..."
                    maxLength={1000}
                    rows={3}
                    required
                    className="w-full px-3 py-2 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700 text-sm resize-none"
                  />
                </div>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="block text-xs font-medium mb-1">Precio propuesto</label>
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-zinc-500">$</span>
                      <input
                        type="number"
                        value={applyPrice}
                        onChange={(e) => setApplyPrice(e.target.value)}
                        placeholder="Opcional"
                        min={0}
                        className="w-full px-3 py-2 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700 text-sm"
                      />
                    </div>
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-medium mb-1">Tiempo estimado</label>
                    <input
                      type="text"
                      value={applyTime}
                      onChange={(e) => setApplyTime(e.target.value)}
                      placeholder="Ej: 2 días"
                      maxLength={100}
                      className="w-full px-3 py-2 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700 text-sm"
                    />
                  </div>
                </div>
                {applyError && (
                  <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950/30 px-3 py-2 rounded-lg">{applyError}</p>
                )}
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={applying}
                    className="flex-1 py-2 rounded-lg bg-purple-600 text-white font-medium text-sm hover:bg-purple-700 disabled:opacity-50"
                  >
                    {applying ? "Enviando..." : "Enviar postulación"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowApplyForm(false)}
                    className="px-4 py-2 rounded-lg border dark:border-zinc-600 text-sm"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            )}

            {/* Review form */}
            {showReviewForm && (
              <form onSubmit={handleReview} className="space-y-3 pt-2 border-t dark:border-zinc-700">
                <p className="text-sm font-semibold">Tu reseña</p>
                <div>
                  <label className="block text-xs font-medium mb-2">Calificación</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setReviewRating(n)}
                        className={`text-2xl transition-colors ${n <= reviewRating ? "text-amber-400" : "text-zinc-300 dark:text-zinc-600"}`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Comentario (opcional)</label>
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Contá cómo fue tu experiencia..."
                    maxLength={1000}
                    rows={2}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700 text-sm resize-none"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={reviewSubmitting}
                    className="flex-1 py-2 rounded-lg bg-amber-500 text-white font-medium text-sm hover:bg-amber-600 disabled:opacity-50"
                  >
                    {reviewSubmitting ? "Enviando..." : "Enviar reseña"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowReviewForm(false)}
                    className="px-4 py-2 rounded-lg border dark:border-zinc-600 text-sm"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            )}
          </>
        ) : (
          /* Applications tab */
          <div className="space-y-3">
            {loading ? (
              <p className="text-sm text-zinc-500 text-center py-4">Cargando...</p>
            ) : applications.length === 0 ? (
              <div className="text-center py-6 space-y-2">
                <p className="text-2xl">📭</p>
                <p className="text-sm text-zinc-500">Todavía no hay postulaciones.</p>
              </div>
            ) : (
              applications.map((app) => (
                <div key={app.id} className="bg-zinc-50 dark:bg-zinc-800 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-sm shrink-0">
                        {app.provider.user.displayName?.[0]?.toUpperCase() || "P"}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{app.provider.user.displayName || "Proveedor"}</p>
                        <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                          <span className="text-amber-500">{starsDisplay(app.provider.user.trustStars)}</span>
                          {app.provider.averageRating > 0 && <span>· {app.provider.averageRating.toFixed(1)}</span>}
                          {app.provider.totalJobs > 0 && <span>· {app.provider.totalJobs} trabajos</span>}
                        </div>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${
                      app.status === "accepted" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                      app.status === "rejected" ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400" :
                      "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                    }`}>
                      {app.status === "accepted" ? "Aceptada" : app.status === "rejected" ? "Rechazada" : "Pendiente"}
                    </span>
                  </div>

                  {/* Skills */}
                  <div className="flex flex-wrap gap-1">
                    {app.provider.skills.slice(0, 4).map((skill: ServiceCategory) => (
                      <span
                        key={skill}
                        className="text-[10px] px-1.5 py-0.5 rounded-full text-white font-medium"
                        style={{ backgroundColor: SERVICE_CATEGORY_COLORS[skill] || "#7c5cfc" }}
                      >
                        {SERVICE_CATEGORY_LABELS[skill] || skill}
                      </span>
                    ))}
                  </div>

                  <p className="text-sm text-zinc-600 dark:text-zinc-400">{app.message}</p>

                  <div className="flex items-center gap-4 text-xs text-zinc-500">
                    {app.proposedPrice != null && (
                      <span>${app.proposedPrice.toLocaleString()}</span>
                    )}
                    {app.estimatedTime && <span>{app.estimatedTime}</span>}
                    <span className="ml-auto">{timeAgo(app.createdAt)}</span>
                  </div>

                  {/* Contact info for accepted */}
                  {app.status === "accepted" && app.provider.phone && isOwner && (
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-2 text-sm">
                      <span className="text-green-700 dark:text-green-400 font-medium">Tel: {app.provider.phone}</span>
                    </div>
                  )}

                  {/* Bio */}
                  {app.provider.bio && (
                    <p className="text-xs text-zinc-500 italic">{app.provider.bio}</p>
                  )}

                  {/* Owner actions */}
                  {isOwner && app.status === "pending" && job.status === "open" && (
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => handleApplicationAction(app.id, "accepted")}
                        disabled={actionLoading}
                        className="flex-1 py-1.5 rounded-lg bg-green-600 text-white text-xs font-medium hover:bg-green-700 disabled:opacity-50"
                      >
                        Aceptar
                      </button>
                      <button
                        onClick={() => handleApplicationAction(app.id, "rejected")}
                        disabled={actionLoading}
                        className="flex-1 py-1.5 rounded-lg border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 text-xs font-medium hover:bg-red-50 dark:hover:bg-red-950/20 disabled:opacity-50"
                      >
                        Rechazar
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-lg border dark:border-zinc-600 text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}
