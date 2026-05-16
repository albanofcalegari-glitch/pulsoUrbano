"use client";

import { useState, useEffect, useCallback } from "react";
import { DEFAULT_CENTER } from "@/lib/constants";

type GeoError = "denied" | "unavailable" | "timeout" | "unsupported" | null;

interface GeoState {
  lat: number;
  lng: number;
  loading: boolean;
  located: boolean;
  error: GeoError;
}

const ERROR_MESSAGES: Record<NonNullable<GeoError>, string[]> = {
  denied: [
    "Ubicación denegada. Para activarla:",
    "1. Ajustes → Privacidad → Localización → Safari → \"Al usar\"",
    "2. En Safari, tocá \"aA\" en la barra → Ajustes del sitio web → Ubicación → Permitir",
    "3. Recargá la página",
  ],
  unavailable: [
    "No se pudo obtener tu ubicación.",
    "Verificá que el GPS esté activado en Ajustes → Privacidad → Localización.",
  ],
  timeout: [
    "La ubicación tardó demasiado.",
    "Tocá de nuevo para reintentar.",
  ],
  unsupported: [
    "Tu navegador no soporta geolocalización.",
  ],
};

export function useGeolocation() {
  const [state, setState] = useState<GeoState>({
    lat: DEFAULT_CENTER.lat,
    lng: DEFAULT_CENTER.lng,
    loading: false,
    located: false,
    error: null,
  });

  const locate = useCallback(() => {
    if (!navigator.geolocation) {
      setState((s) => ({ ...s, loading: false, error: "unsupported" }));
      return;
    }

    setState((s) => ({ ...s, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setState({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          loading: false,
          located: true,
          error: null,
        });
      },
      (err) => {
        const error: GeoError =
          err.code === 1 ? "denied" :
          err.code === 3 ? "timeout" : "unavailable";
        setState((s) => ({ ...s, loading: false, error }));
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  const errorLines = state.error ? ERROR_MESSAGES[state.error] : null;

  return { ...state, locate, errorLines };
}
