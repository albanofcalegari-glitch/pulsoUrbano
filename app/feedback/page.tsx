"use client";

import { useState } from "react";
import { APP_NAME } from "@/lib/constants";
import type { FeedbackType } from "@/types";

const FEEDBACK_TYPES: { key: FeedbackType; label: string }[] = [
  { key: "bug", label: "Algo no funciona" },
  { key: "confusion", label: "Algo no se entiende" },
  { key: "suggestion", label: "Sugerencia" },
  { key: "performance", label: "La app está lenta" },
  { key: "visual", label: "Problema visual" },
  { key: "other", label: "Otro" },
];

export default function FeedbackPage() {
  const [type, setType] = useState<FeedbackType | null>(null);
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!type) {
      setError("Elegí un tipo de feedback.");
      return;
    }
    if (message.trim().length < 10) {
      setError("El mensaje debe tener al menos 10 caracteres.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          message: message.trim(),
          email: email.trim() || undefined,
          pageUrl: window.location.href,
        }),
      });

      if (res.ok) {
        setSent(true);
      } else {
        const data = await res.json();
        setError(data.error || "Error al enviar. Intentá de nuevo.");
      }
    } catch {
      setError("Error de conexión.");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="max-w-sm w-full text-center space-y-4">
          <div className="text-4xl">🙏</div>
          <h1 className="font-heading text-xl font-bold text-foreground">Gracias</h1>
          <p className="text-sm text-foreground/60">Tu comentario nos ayuda a mejorar la beta.</p>
          <a href="/"
            className="inline-block mt-4 text-sm text-primary hover:text-primary/80 font-medium transition-colors">
            Volver al mapa
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border px-4 py-3 sm:px-6 sm:py-4 flex items-center justify-between gap-2">
        <h1 className="font-heading text-base sm:text-xl font-bold bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent min-w-0">
          Ayudanos a mejorar {APP_NAME}
        </h1>
        <a href="/" className="text-xs sm:text-sm text-primary hover:underline shrink-0">Volver al mapa</a>
      </header>

      <div className="max-w-md mx-auto p-4 sm:p-6">
        <p className="text-sm text-foreground/60 mb-6">
          Estamos construyendo Pulso Urbano con los vecinos. Si algo no funcionó, no se entendió o tenés una sugerencia, contanos acá.
          No hace falta estar logueado.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Tipo */}
          <div>
            <label className="block text-xs font-medium text-foreground/60 mb-2 uppercase tracking-wide">
              Tipo <span className="text-red-400">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {FEEDBACK_TYPES.map((ft) => (
                <button key={ft.key} type="button" onClick={() => setType(ft.key)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium text-left transition-all active:translate-y-px ${
                    type === ft.key
                      ? "bg-primary text-white shadow-sm shadow-primary/25"
                      : "bg-secondary text-foreground/60 ring-1 ring-foreground/10 hover:bg-muted"
                  }`}>
                  {ft.label}
                </button>
              ))}
            </div>
          </div>

          {/* Mensaje */}
          <div>
            <label className="block text-xs font-medium text-foreground/60 mb-2 uppercase tracking-wide">
              Mensaje <span className="text-red-400">*</span>
            </label>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)}
              maxLength={2000} rows={5}
              placeholder="Contanos qué pasó, qué estabas intentando hacer y qué esperabas que ocurriera."
              className="w-full px-3 py-2.5 bg-transparent border border-border rounded-lg text-sm text-card-foreground placeholder:text-foreground/30 focus:ring-2 focus:ring-primary/50 focus:border-transparent resize-none transition-all" />
            <p className="text-xs text-foreground/30 mt-1 text-right">{message.length}/2000</p>
          </div>

          {/* Email opcional */}
          <div>
            <label className="block text-xs font-medium text-foreground/60 mb-2 uppercase tracking-wide">
              Email <span className="normal-case text-foreground/30 font-normal">(opcional, por si queremos consultarte)</span>
            </label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              maxLength={255}
              placeholder="tu@email.com"
              className="w-full px-3 py-2.5 bg-transparent border border-border rounded-lg text-sm text-card-foreground placeholder:text-foreground/30 focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all" />
          </div>

          {/* Error */}
          {error && (
            <div className="text-sm text-red-400 bg-red-500/10 px-3 py-2.5 rounded-lg ring-1 ring-red-500/20">
              {error}
            </div>
          )}

          {/* Submit */}
          <button type="submit" disabled={loading}
            className="w-full py-3 bg-primary hover:bg-primary/90 text-white font-medium rounded-lg transition-all active:translate-y-px disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-primary/25">
            {loading ? "Enviando..." : "Enviar feedback"}
          </button>
        </form>
      </div>
    </div>
  );
}
