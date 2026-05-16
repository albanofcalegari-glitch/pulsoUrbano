"use client";

import { useState } from "react";

interface AuthModalProps {
  onClose: () => void;
  onSuccess: () => void;
  contextMessage?: string;
  initialStep?: "login" | "register";
  initialEmail?: string;
}

type Step = "login" | "register";

export default function AuthModal({ onClose, onSuccess, contextMessage, initialStep = "login", initialEmail = "" }: AuthModalProps) {
  const [step, setStep] = useState<Step>(initialStep);
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error);
      } else {
        onSuccess();
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, displayName: displayName || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error);
      } else {
        onSuccess();
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative bg-card rounded-t-xl sm:rounded-xl w-full sm:max-w-sm ring-1 ring-foreground/10 shadow-xl">
        {/* Header */}
        <div className="border-b border-border px-4 py-3 flex items-center justify-between">
          <h2 className="font-heading text-base font-semibold text-card-foreground">
            {step === "login" ? "Iniciar sesión" : "Crear cuenta"}
          </h2>
          <button onClick={onClose} className="h-8 w-8 flex items-center justify-center rounded-lg text-foreground/40 hover:text-foreground hover:bg-muted transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="p-4">
          {contextMessage && (
            <p className="text-sm text-foreground/60 bg-muted px-3 py-2.5 rounded-lg ring-1 ring-foreground/5 mb-4">
              {contextMessage}
            </p>
          )}

          {/* Login */}
          {step === "login" && (
            <form onSubmit={handleLogin} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-foreground/60 mb-1.5 uppercase tracking-wide">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                  className="w-full h-9 px-3 bg-transparent border border-border rounded-lg text-sm text-card-foreground placeholder:text-foreground/30 focus:ring-2 focus:ring-primary/50 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground/60 mb-1.5 uppercase tracking-wide">Contraseña</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
                  className="w-full h-9 px-3 bg-transparent border border-border rounded-lg text-sm text-card-foreground placeholder:text-foreground/30 focus:ring-2 focus:ring-primary/50 focus:border-transparent" />
              </div>
              {error && <p className="text-sm text-red-400 bg-red-500/10 px-3 py-2 rounded-lg ring-1 ring-red-500/20">{error}</p>}
              <button type="submit" disabled={loading}
                className="w-full h-10 bg-primary hover:bg-primary/90 text-white font-medium rounded-lg transition-all active:translate-y-px disabled:opacity-50">
                {loading ? "Entrando..." : "Entrar"}
              </button>
              <p className="text-center text-xs text-foreground/50">
                ¿No tenés cuenta?{" "}
                <button type="button" onClick={() => { setStep("register"); setError(null); }} className="text-primary hover:underline">
                  Registrate
                </button>
              </p>
            </form>
          )}

          {/* Register */}
          {step === "register" && (
            <form onSubmit={handleRegister} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-foreground/60 mb-1.5 uppercase tracking-wide">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                  className="w-full h-9 px-3 bg-transparent border border-border rounded-lg text-sm text-card-foreground placeholder:text-foreground/30 focus:ring-2 focus:ring-primary/50 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground/60 mb-1.5 uppercase tracking-wide">
                  Nombre <span className="normal-case text-foreground/30 font-normal">(opcional)</span>
                </label>
                <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} maxLength={50}
                  placeholder="Cómo querés que te vean"
                  className="w-full h-9 px-3 bg-transparent border border-border rounded-lg text-sm text-card-foreground placeholder:text-foreground/30 focus:ring-2 focus:ring-primary/50 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground/60 mb-1.5 uppercase tracking-wide">Contraseña</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6}
                  className="w-full h-9 px-3 bg-transparent border border-border rounded-lg text-sm text-card-foreground placeholder:text-foreground/30 focus:ring-2 focus:ring-primary/50 focus:border-transparent" />
                <p className="text-xs text-foreground/30 mt-1">Mínimo 6 caracteres</p>
              </div>
              {error && <p className="text-sm text-red-400 bg-red-500/10 px-3 py-2 rounded-lg ring-1 ring-red-500/20">{error}</p>}
              <button type="submit" disabled={loading}
                className="w-full h-10 bg-primary hover:bg-primary/90 text-white font-medium rounded-lg transition-all active:translate-y-px disabled:opacity-50">
                {loading ? "Creando cuenta..." : "Crear cuenta"}
              </button>
              <p className="text-center text-xs text-foreground/50">
                ¿Ya tenés cuenta?{" "}
                <button type="button" onClick={() => { setStep("login"); setError(null); }} className="text-primary hover:underline">
                  Entrá
                </button>
              </p>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
