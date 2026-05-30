"use client";

import { useState } from "react";
import type { ServiceCategory } from "@/types";
import {
  SERVICE_CATEGORIES,
  SERVICE_CATEGORY_LABELS,
  SERVICE_CATEGORY_COLORS,
} from "@/lib/constants";

interface ProviderProfileFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function ProviderProfileForm({ onClose, onSuccess }: ProviderProfileFormProps) {
  const [bio, setBio] = useState("");
  const [phone, setPhone] = useState("");
  const [skills, setSkills] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleSkill(skill: ServiceCategory) {
    setSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : prev.length < 10 ? [...prev, skill] : prev
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (skills.length === 0) { setError("Elegí al menos un servicio."); return; }
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/providers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bio: bio.trim() || undefined,
          phone: phone.trim() || undefined,
          skills,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al crear perfil");
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white dark:bg-zinc-900 w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">🛠️ Ofrecer mis servicios</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 text-xl">✕</button>
        </div>

        <p className="text-sm text-zinc-500">
          Creá tu perfil de proveedor para que los vecinos te encuentren cuando necesiten un servicio.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Skills */}
          <div>
            <label className="block text-sm font-medium mb-2">¿Qué servicios ofrecés? *</label>
            <div className="flex flex-wrap gap-1.5">
              {SERVICE_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => toggleSkill(cat)}
                  className="text-xs px-2.5 py-1.5 rounded-full border transition-all"
                  style={{
                    backgroundColor: skills.includes(cat) ? SERVICE_CATEGORY_COLORS[cat] : "transparent",
                    color: skills.includes(cat) ? "white" : undefined,
                    borderColor: SERVICE_CATEGORY_COLORS[cat],
                  }}
                >
                  {SERVICE_CATEGORY_LABELS[cat]}
                </button>
              ))}
            </div>
            <p className="text-xs text-zinc-400 mt-1">{skills.length}/10 seleccionados</p>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium mb-1">Sobre vos (opcional)</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Ej: Pintor con 10 años de experiencia, trabajo en Palermo y alrededores."
              maxLength={500}
              rows={3}
              className="w-full px-3 py-2 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700 text-sm resize-none"
            />
            <p className="text-xs text-zinc-400 mt-1">{bio.length}/500</p>
          </div>

          {/* Teléfono */}
          <div>
            <label className="block text-sm font-medium mb-1">Teléfono / WhatsApp (opcional)</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Ej: 11-2345-6789"
              maxLength={30}
              className="w-full px-3 py-2 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700 text-sm"
            />
            <p className="text-xs text-zinc-400 mt-1">Solo visible para quienes te contraten.</p>
          </div>

          {error && (
            <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950/30 px-3 py-2 rounded-lg">
              ⚠️ {error}
            </p>
          )}

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-lg bg-purple-600 text-white font-medium text-sm hover:bg-purple-700 disabled:opacity-50"
            >
              {loading ? "Creando perfil..." : "Publicar perfil"}
            </button>
            <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-lg border dark:border-zinc-600 text-sm">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
