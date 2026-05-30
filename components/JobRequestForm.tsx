"use client";

import { useState, useRef } from "react";
import type { ServiceCategory, JobUrgency } from "@/types";
import {
  SERVICE_CATEGORIES,
  SERVICE_CATEGORY_LABELS,
  SERVICE_CATEGORY_COLORS,
  JOB_URGENCY_LABELS,
} from "@/lib/constants";

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
}

interface JobRequestFormProps {
  position: { lat: number; lng: number } | null;
  onClose: () => void;
  onSuccess: () => void;
  onRequestLocation: () => void;
  onPositionChange: (lat: number, lng: number) => void;
}

export default function JobRequestForm({
  position,
  onClose,
  onSuccess,
  onRequestLocation,
  onPositionChange,
}: JobRequestFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<ServiceCategory>("pintura");
  const [urgency, setUrgency] = useState<JobUrgency>("normal");
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addressQuery, setAddressQuery] = useState("");
  const [addressResults, setAddressResults] = useState<NominatimResult[]>([]);
  const [searchingAddress, setSearchingAddress] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleAddressSearch(query: string) {
    setAddressQuery(query);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    if (query.length < 3) { setAddressResults([]); return; }
    searchTimeoutRef.current = setTimeout(async () => {
      setSearchingAddress(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=ar&limit=5`
        );
        const data: NominatimResult[] = await res.json();
        setAddressResults(data);
      } catch { /* ignore */ }
      setSearchingAddress(false);
    }, 400);
  }

  function selectAddress(result: NominatimResult) {
    onPositionChange(parseFloat(result.lat), parseFloat(result.lon));
    setAddress(result.display_name.split(",").slice(0, 3).join(","));
    setAddressResults([]);
    setAddressQuery("");
    setShowSearch(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!position) { setError("Elegí una ubicación en el mapa."); return; }
    setLoading(true);
    setError(null);

    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        category,
        latitude: position.lat,
        longitude: position.lng,
        address: address || undefined,
        budgetMin: budgetMin ? parseInt(budgetMin) : undefined,
        budgetMax: budgetMax ? parseInt(budgetMax) : undefined,
        urgency,
      };

      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al publicar");
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
          <h2 className="text-lg font-bold">🔧 Pedir servicio</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 text-xl">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Título */}
          <div>
            <label className="block text-sm font-medium mb-1">¿Qué necesitás?</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Pintar departamento 2 ambientes"
              maxLength={120}
              required
              className="w-full px-3 py-2 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700 text-sm"
            />
          </div>

          {/* Categoría */}
          <div>
            <label className="block text-sm font-medium mb-2">Categoría</label>
            <div className="flex flex-wrap gap-1.5">
              {SERVICE_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className="text-xs px-2.5 py-1.5 rounded-full border transition-all"
                  style={{
                    backgroundColor: category === cat ? SERVICE_CATEGORY_COLORS[cat] : "transparent",
                    color: category === cat ? "white" : undefined,
                    borderColor: SERVICE_CATEGORY_COLORS[cat],
                  }}
                >
                  {SERVICE_CATEGORY_LABELS[cat]}
                </button>
              ))}
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium mb-1">Detalle del trabajo</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describí lo que necesitás, dimensiones, materiales, etc."
              maxLength={2000}
              rows={3}
              required
              className="w-full px-3 py-2 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700 text-sm resize-none"
            />
            <p className="text-xs text-zinc-400 mt-1">{description.length}/2000</p>
          </div>

          {/* Urgencia */}
          <div>
            <label className="block text-sm font-medium mb-2">Urgencia</label>
            <div className="flex gap-2">
              {(Object.keys(JOB_URGENCY_LABELS) as JobUrgency[]).map((u) => (
                <button
                  key={u}
                  type="button"
                  onClick={() => setUrgency(u)}
                  className={`text-sm px-3 py-1.5 rounded-lg border transition-all ${
                    urgency === u
                      ? u === "urgent"
                        ? "bg-red-500 text-white border-red-500"
                        : u === "normal"
                        ? "bg-blue-500 text-white border-blue-500"
                        : "bg-zinc-500 text-white border-zinc-500"
                      : "border-zinc-300 dark:border-zinc-600"
                  }`}
                >
                  {JOB_URGENCY_LABELS[u]}
                </button>
              ))}
            </div>
          </div>

          {/* Presupuesto */}
          <div>
            <label className="block text-sm font-medium mb-1">Presupuesto estimado (opcional)</label>
            <div className="flex gap-2 items-center">
              <span className="text-sm text-zinc-500">$</span>
              <input
                type="number"
                value={budgetMin}
                onChange={(e) => setBudgetMin(e.target.value)}
                placeholder="Mín"
                min={0}
                className="w-24 px-3 py-2 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700 text-sm"
              />
              <span className="text-sm text-zinc-400">—</span>
              <span className="text-sm text-zinc-500">$</span>
              <input
                type="number"
                value={budgetMax}
                onChange={(e) => setBudgetMax(e.target.value)}
                placeholder="Máx"
                min={0}
                className="w-24 px-3 py-2 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700 text-sm"
              />
            </div>
          </div>

          {/* Ubicación */}
          <div>
            <label className="block text-sm font-medium mb-2">Ubicación</label>
            {position ? (
              <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                <span>📍</span>
                <span>Ubicación seleccionada</span>
                <button type="button" onClick={() => setShowSearch(!showSearch)} className="text-xs underline ml-auto">
                  Cambiar
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <button type="button" onClick={onRequestLocation} className="text-sm px-3 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700">
                  📍 Usar mi ubicación
                </button>
                <button type="button" onClick={() => setShowSearch(true)} className="text-sm px-3 py-2 rounded-lg border dark:border-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                  🔍 Buscar dirección
                </button>
              </div>
            )}

            {showSearch && (
              <div className="mt-2 space-y-1">
                <input
                  type="text"
                  value={addressQuery}
                  onChange={(e) => handleAddressSearch(e.target.value)}
                  placeholder="Escribí una dirección..."
                  className="w-full px-3 py-2 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700 text-sm"
                />
                {searchingAddress && <p className="text-xs text-zinc-400">Buscando...</p>}
                {addressResults.map((r, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => selectAddress(r)}
                    className="block w-full text-left text-xs px-3 py-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 truncate"
                  >
                    {r.display_name}
                  </button>
                ))}
              </div>
            )}

            {address && (
              <p className="text-xs text-zinc-500 mt-1">📍 {address}</p>
            )}
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
              {loading ? "Publicando..." : "Publicar pedido"}
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
