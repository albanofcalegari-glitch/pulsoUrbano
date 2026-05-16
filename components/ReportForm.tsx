"use client";

import { useState, useRef } from "react";
import type { ReportStatus, ReportCategory, ReportType } from "@/types";
import {
  REPORT_CATEGORY_LABELS,
  REPORT_CATEGORY_COLORS,
  CATEGORY_STATUSES,
  REPORT_STATUS_LABELS,
  REPORT_STATUS_COLORS,
  REPORT_TYPE_LABELS,
  URBAN_NOTICE_CATEGORIES,
  NEIGHBORHOOD_SHARE_CATEGORIES,
  MAX_PHOTO_SIZE_BYTES,
  getReportType,
} from "@/lib/constants";

interface ReportFormProps {
  position: { lat: number; lng: number } | null;
  onClose: () => void;
  onSuccess: () => void;
  onRequestLocation: () => void;
}

export default function ReportForm({
  position,
  onClose,
  onSuccess,
  onRequestLocation,
}: ReportFormProps) {
  const [reportType, setReportType] = useState<ReportType>("urban_notice");
  const [category, setCategory] = useState<ReportCategory>("dumpster");
  const [status, setStatus] = useState<ReportStatus>("seen");
  const [comment, setComment] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<"uploading" | "creating" | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categoriesForType = reportType === "urban_notice"
    ? URBAN_NOTICE_CATEGORIES
    : NEIGHBORHOOD_SHARE_CATEGORIES;

  const availableStatuses = CATEGORY_STATUSES[category];

  function handleTypeChange(newType: ReportType) {
    setReportType(newType);
    const cats = newType === "urban_notice" ? URBAN_NOTICE_CATEGORIES : NEIGHBORHOOD_SHARE_CATEGORIES;
    const newCat = cats[0];
    setCategory(newCat);
    setStatus(CATEGORY_STATUSES[newCat][0]);
  }

  function handleCategoryChange(newCat: ReportCategory) {
    setCategory(newCat);
    const newStatuses = CATEGORY_STATUSES[newCat];
    if (!newStatuses.includes(status)) {
      setStatus(newStatuses[0]);
    }
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_PHOTO_SIZE_BYTES) {
      setError("La imagen no puede superar 5MB");
      return;
    }
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Solo JPG, PNG o WebP");
      return;
    }

    setPhotoFile(file);
    setError(null);
    const reader = new FileReader();
    reader.onload = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!position || !photoFile) return;

    setLoading(true);
    setError(null);

    try {
      setStep("uploading");
      const formData = new FormData();
      formData.append("file", photoFile);
      const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
      if (!uploadRes.ok) {
        const data = await uploadRes.json();
        setError(data.error || "Error al subir la foto");
        return;
      }
      const { url: photoUrl } = await uploadRes.json();

      let reporterLatitude: number | undefined;
      let reporterLongitude: number | undefined;
      let locationAccuracyMeters: number | undefined;

      try {
        const geoPos = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 5000,
          });
        });
        reporterLatitude = geoPos.coords.latitude;
        reporterLongitude = geoPos.coords.longitude;
        locationAccuracyMeters = geoPos.coords.accuracy;
      } catch {
        // Sin GPS — se registra como denied_permission
      }

      setStep("creating");
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          latitude: position.lat,
          longitude: position.lng,
          status,
          comment: comment.trim() || undefined,
          photoUrl,
          reporterLatitude,
          reporterLongitude,
          locationAccuracyMeters,
        }),
      });

      if (res.ok) {
        onSuccess();
      } else {
        const data = await res.json();
        setError(data.error || "Error al crear el aviso");
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
      setStep(null);
    }
  }

  return (
    <div className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative bg-card rounded-t-xl sm:rounded-xl w-full sm:max-w-sm max-h-[85vh] overflow-y-auto ring-1 ring-foreground/10 shadow-xl">
        <div className="sticky top-0 bg-card rounded-t-xl border-b border-border px-4 py-3 flex items-center justify-between z-10">
          <h2 className="font-heading text-base font-semibold text-card-foreground">Crear aviso</h2>
          <button onClick={onClose} className="h-8 w-8 flex items-center justify-center rounded-lg text-foreground/40 hover:text-foreground hover:bg-muted transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Foto (obligatoria) */}
          <div>
            <label className="block text-xs font-medium text-foreground/60 mb-2 uppercase tracking-wide">
              Foto <span className="text-red-400">*</span>
            </label>
            {photoPreview ? (
              <div className="relative">
                <img src={photoPreview} alt="Preview" className="w-full h-40 object-cover rounded-lg ring-1 ring-foreground/10" />
                <button type="button" onClick={() => { setPhotoFile(null); setPhotoPreview(null); }}
                  className="absolute top-2 right-2 h-7 w-7 flex items-center justify-center rounded-full bg-black/60 text-white text-xs hover:bg-black/80 transition-colors">
                  ✕
                </button>
              </div>
            ) : (
              <button type="button" onClick={() => fileInputRef.current?.click()}
                className="w-full py-8 border-2 border-dashed border-primary/30 rounded-lg text-sm text-primary/70 hover:border-primary hover:text-primary transition-colors flex flex-col items-center gap-2">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/>
                </svg>
                Tocar para sacar o elegir foto
              </button>
            )}
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" capture="environment"
              onChange={handlePhotoChange} className="hidden" />
          </div>

          {/* Ubicación */}
          <div>
            <label className="block text-xs font-medium text-foreground/60 mb-2 uppercase tracking-wide">Ubicación</label>
            {position ? (
              <div className="flex items-center gap-2 text-sm text-foreground/70 bg-muted px-3 py-2.5 rounded-lg ring-1 ring-foreground/5">
                <span className="text-emerald-400">●</span>
                <span className="tabular-nums">{position.lat.toFixed(5)}, {position.lng.toFixed(5)}</span>
              </div>
            ) : (
              <button type="button" onClick={onRequestLocation}
                className="w-full py-3 px-4 border-2 border-dashed border-primary/30 rounded-lg text-sm text-primary/70 hover:border-primary hover:text-primary transition-colors">
                Tocá en el mapa para marcar la ubicación
              </button>
            )}
          </div>

          {/* Tipo de aviso */}
          <div>
            <label className="block text-xs font-medium text-foreground/60 mb-2 uppercase tracking-wide">Tipo de aviso</label>
            <div className="flex gap-2">
              {(["urban_notice", "neighborhood_share"] as const).map((t) => (
                <button key={t} type="button" onClick={() => handleTypeChange(t)}
                  className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all active:translate-y-px ${
                    reportType === t
                      ? "bg-primary text-white shadow-sm shadow-primary/25"
                      : "bg-secondary text-foreground/60 ring-1 ring-foreground/10 hover:bg-muted"
                  }`}>
                  {REPORT_TYPE_LABELS[t]}
                </button>
              ))}
            </div>
          </div>

          {/* Categoría */}
          <div>
            <label className="block text-xs font-medium text-foreground/60 mb-2 uppercase tracking-wide">Categoría</label>
            <div className="flex flex-wrap gap-2">
              {categoriesForType.map((cat) => (
                <button key={cat} type="button" onClick={() => handleCategoryChange(cat)}
                  className={`px-3 py-1.5 rounded-4xl text-xs font-medium transition-all active:translate-y-px ${
                    category === cat ? "text-white shadow-sm" : "bg-secondary text-foreground/60 ring-1 ring-foreground/10 hover:bg-muted"
                  }`}
                  style={category === cat ? { backgroundColor: REPORT_CATEGORY_COLORS[cat], boxShadow: `0 2px 8px ${REPORT_CATEGORY_COLORS[cat]}40` } : undefined}>
                  {REPORT_CATEGORY_LABELS[cat]}
                </button>
              ))}
            </div>
          </div>

          {/* Estado */}
          <div>
            <label className="block text-xs font-medium text-foreground/60 mb-2 uppercase tracking-wide">Estado</label>
            <div className="flex flex-wrap gap-2">
              {availableStatuses.map((s) => (
                <button key={s} type="button" onClick={() => setStatus(s)}
                  className={`px-3 py-1.5 rounded-4xl text-xs font-medium transition-all active:translate-y-px ${
                    status === s ? "text-white shadow-sm" : "bg-secondary text-foreground/60 ring-1 ring-foreground/10 hover:bg-muted"
                  }`}
                  style={status === s ? { backgroundColor: REPORT_STATUS_COLORS[s], boxShadow: `0 2px 8px ${REPORT_STATUS_COLORS[s]}40` } : undefined}>
                  {REPORT_STATUS_LABELS[s]}
                </button>
              ))}
            </div>
          </div>

          {/* Comentario */}
          <div>
            <label className="block text-xs font-medium text-foreground/60 mb-2 uppercase tracking-wide">
              Comentario <span className="normal-case text-foreground/30 font-normal">(opcional)</span>
            </label>
            <textarea value={comment} onChange={(e) => setComment(e.target.value)} maxLength={500} rows={2}
              placeholder={reportType === "neighborhood_share"
                ? "Ej: Dejé libros en la puerta, se pueden retirar..."
                : "Ej: Está en la esquina, bloquea la vereda..."}
              className="w-full px-3 py-2.5 bg-transparent border border-border rounded-lg text-sm text-card-foreground placeholder:text-foreground/30 focus:ring-2 focus:ring-primary/50 focus:border-transparent resize-none transition-all" />
          </div>

          {/* Error */}
          {error && <div className="text-sm text-red-400 bg-red-500/10 px-3 py-2.5 rounded-lg ring-1 ring-red-500/20">{error}</div>}

          {/* Submit */}
          <button type="submit" disabled={!position || !photoFile || loading}
            className="w-full py-3 bg-primary hover:bg-primary/90 text-white font-medium rounded-lg transition-all active:translate-y-px disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-primary/25">
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" strokeOpacity="0.25"/><path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/>
                </svg>
                {step === "uploading" ? "Subiendo foto..." : "Creando aviso..."}
              </span>
            ) : "Agregar al mapa"}
          </button>
        </form>
      </div>
    </div>
  );
}
