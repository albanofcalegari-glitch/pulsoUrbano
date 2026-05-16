"use client";

import { useState, useEffect, useCallback } from "react";
import MapWrapper from "@/components/MapWrapper";
import StatusFilter from "@/components/StatusFilter";
import ReportForm from "@/components/ReportForm";
import ReportDetail from "@/components/ReportDetail";
import AuthModal from "@/components/AuthModal";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useAuth } from "@/hooks/useAuth";
import { DEFAULT_CENTER, DEFAULT_ZOOM, APP_NAME, APP_TAGLINE } from "@/lib/constants";
import { starsDisplay } from "@/lib/utils";
import type { Report, CategoryGroup } from "@/types";

export default function HomePage() {
  const geo = useGeolocation();
  const auth = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [categoryGroup, setCategoryGroup] = useState<CategoryGroup>("all");
  const [showForm, setShowForm] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [authMessage, setAuthMessage] = useState<string | undefined>();
  const [authStep, setAuthStep] = useState<"login" | "register">("login");
  const [notification, setNotification] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [selectedPosition, setSelectedPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [pickingLocation, setPickingLocation] = useState(false);

  const [flyTrigger, setFlyTrigger] = useState(0);
  const center = geo.located ? { lat: geo.lat, lng: geo.lng } : DEFAULT_CENTER;
  const userLocation = geo.located ? { lat: geo.lat, lng: geo.lng } : null;

  const fetchReports = useCallback(async () => {
    const params = new URLSearchParams();
    if (categoryGroup !== "all") params.set("categoryGroup", categoryGroup);
    const res = await fetch(`/api/reports?${params}`);
    if (res.ok) setReports(await res.json());
  }, [categoryGroup]);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  function openAuth(message: string, step: "login" | "register" = "login") {
    setAuthMessage(message);
    setAuthStep(step);
    setShowAuth(true);
  }

  function handleReportButton() {
    if (!auth.user) {
      openAuth("Para agregar un aviso, necesitás una cuenta.");
      return;
    }
    if (auth.user.isBlocked) {
      setNotification("Tu cuenta está restringida. No podés agregar ni interactuar con avisos.");
      return;
    }
    if (geo.lat !== DEFAULT_CENTER.lat || geo.lng !== DEFAULT_CENTER.lng) {
      setSelectedPosition({ lat: geo.lat, lng: geo.lng });
    }
    setShowForm(true);
  }

  function handleMapClick(lat: number, lng: number) {
    if (pickingLocation) {
      setSelectedPosition({ lat, lng });
      setPickingLocation(false);
      setShowForm(true);
    }
  }

  function handleAuthRequired() {
    if (auth.user?.isBlocked) {
      setNotification("Tu cuenta está restringida. No podés interactuar con avisos.");
      setSelectedReport(null);
      return;
    }
    openAuth("Para colaborar con el mapa, iniciá sesión.");
    setSelectedReport(null);
  }

  function handleAuthSuccess() {
    window.location.href = window.location.pathname;
  }

  return (
    <div className="flex flex-col overflow-hidden" style={{ height: "100dvh", paddingTop: "env(safe-area-inset-top)", paddingBottom: "env(safe-area-inset-bottom)" }}>
      {/* Header */}
      <header className="shrink-0 bg-card border-b border-border px-2 py-1.5 sm:px-4 sm:py-2.5 flex items-center justify-between gap-1 sm:gap-2">
        <h1 className="font-heading text-sm sm:text-lg font-bold bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent truncate min-w-0">
          {APP_NAME}
        </h1>
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {auth.user ? (
            <>
              <span className="text-[10px] sm:text-xs text-amber-400" title={`${auth.user.trustStars} estrellas`}>
                {starsDisplay(auth.user.trustStars)}
              </span>
              <button onClick={auth.logout}
                className="text-[10px] sm:text-xs text-foreground/40 hover:text-foreground transition-colors">
                Salir
              </button>
            </>
          ) : (
            <button onClick={() => setShowAuth(true)}
              className="text-xs sm:text-sm text-primary hover:text-primary/80 font-medium transition-colors">
              Entrar
            </button>
          )}
          <a href="/feedback"
            className="text-foreground/40 hover:text-foreground transition-colors hidden sm:inline sm:text-xs">
            Ayudanos a mejorar
          </a>
          <a href="/feedback"
            className="sm:hidden text-foreground/40 hover:text-foreground transition-colors"
            aria-label="Feedback"
            title="Ayudanos a mejorar"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </a>
          <button onClick={handleReportButton}
            className="bg-primary hover:bg-primary/90 text-white text-[11px] sm:text-sm font-medium px-1.5 py-1 sm:px-4 sm:py-2 rounded-lg transition-all active:translate-y-px whitespace-nowrap">
            <span className="sm:hidden">+</span>
            <span className="hidden sm:inline">+ Agregar al mapa</span>
          </button>
        </div>
      </header>

      {/* Filtros */}
      <div className="shrink-0 bg-card border-b border-border px-2 py-1.5 sm:px-3 sm:py-2">
        <StatusFilter selected={categoryGroup} onChange={setCategoryGroup} />
      </div>

      {/* Mapa — flex-1 ocupa el resto, min-h-0 evita overflow */}
      <div className="flex-1 min-h-0 relative overflow-hidden">
        <MapWrapper
          center={center} zoom={DEFAULT_ZOOM} reports={reports}
          onReportClick={setSelectedReport}
          onMapClick={pickingLocation ? handleMapClick : undefined}
          selectedPosition={selectedPosition}
          userLocation={userLocation}
          flyTrigger={flyTrigger}
        />

        {/* Aviso picking */}
        {pickingLocation && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-primary text-white text-sm font-medium px-5 py-2.5 rounded-full shadow-lg shadow-primary/25 animate-pulse">
            Tocá en el mapa para marcar la ubicación
          </div>
        )}

        {/* Botón Mi ubicación */}
        <button
          onClick={() => {
            geo.locate();
            setFlyTrigger((n) => n + 1);
          }}
          disabled={geo.loading}
          className={`absolute bottom-4 right-3 z-10 shadow-lg rounded-full w-10 h-10 flex items-center justify-center transition-colors active:translate-y-px disabled:opacity-50 ${
            geo.error
              ? "bg-red-500/10 ring-1 ring-red-500/30"
              : geo.located
                ? "bg-primary/10 ring-1 ring-primary/30"
                : "bg-card ring-1 ring-foreground/10"
          }`}
          aria-label="Mi ubicación"
          title="Centrar en mi ubicación"
        >
          {geo.loading ? (
            <svg className="w-5 h-5 text-primary animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" strokeDasharray="60" strokeDashoffset="20" />
            </svg>
          ) : (
            <svg className={`w-5 h-5 ${geo.error ? "text-red-400" : "text-primary"}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
            </svg>
          )}
        </button>

        {/* Mensaje de ubicación */}
        {(geo.errorLines || (!geo.located && !geo.loading)) && (
          <div className="absolute bottom-16 right-3 z-10 max-w-[260px] bg-card ring-1 ring-foreground/10 shadow-xl rounded-xl px-3 py-2.5 space-y-1">
            {geo.errorLines ? (
              geo.errorLines.map((line, i) => (
                <p key={i} className={`text-xs leading-relaxed ${i === 0 ? "text-foreground/80 font-medium" : "text-foreground/55"}`}>
                  {line}
                </p>
              ))
            ) : (
              <p className="text-xs text-foreground/70 leading-relaxed">
                Tocá el botón para ver tu ubicación en el mapa.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Modales — estos sí van fixed, son overlays */}
      {selectedReport && (
        <ReportDetail report={selectedReport}
          isLoggedIn={!!auth.user}
          isBlocked={auth.user?.isBlocked ?? false}
          onClose={() => setSelectedReport(null)}
          onAction={() => { fetchReports(); setSelectedReport(null); }}
          onAuthRequired={handleAuthRequired}
        />
      )}

      {showForm && (
        <ReportForm position={selectedPosition}
          onClose={() => { setShowForm(false); setSelectedPosition(null); }}
          onSuccess={() => { setShowForm(false); setSelectedPosition(null); fetchReports(); }}
          onRequestLocation={() => { setShowForm(false); setPickingLocation(true); }}
          onPositionChange={(lat, lng) => setSelectedPosition({ lat, lng })}
        />
      )}

      {notification && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[1100] max-w-sm w-full px-4">
          <div className="bg-card ring-1 ring-foreground/10 rounded-xl shadow-xl px-4 py-3 flex items-start gap-3">
            <p className="text-sm text-foreground/80 flex-1">{notification}</p>
            <button onClick={() => setNotification(null)}
              className="text-foreground/40 hover:text-foreground text-xs shrink-0">✕</button>
          </div>
        </div>
      )}

      {showAuth && (
        <AuthModal
          onClose={() => { setShowAuth(false); setAuthMessage(undefined); }}
          onSuccess={handleAuthSuccess}
          contextMessage={authMessage}
          initialStep={authStep}
          initialEmail={auth.user?.email}
        />
      )}
    </div>
  );
}
