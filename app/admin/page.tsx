"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { REPORT_CATEGORY_LABELS, REPORT_CATEGORY_COLORS, REPORT_STATUS_LABELS, REPORT_STATUS_COLORS } from "@/lib/constants";
import { starsDisplay } from "@/lib/utils";
import type { ReportCategory, ReportStatus } from "@/types";

interface DashboardData {
  stats: {
    totalUsers: number;
    totalReports: number;
    activeReports: number;
    pendingFeedback: number;
    blockedUsers: number;
    totalConfirmations: number;
    totalFlags: number;
  };
  reportsByCategory: { category: string; count: number }[];
  reportsByStatus: { status: string; count: number }[];
  recentUsers: {
    id: string; email: string; displayName: string | null;
    trustStars: number; reportsCount: number; isBlocked: boolean;
    createdAt: string; lastLoginAt: string | null;
  }[];
  topReporters: {
    id: string; displayName: string | null; email: string;
    trustStars: number; reportsCount: number;
  }[];
}

function StatCard({ label, value, color, icon }: { label: string; value: number; color: string; icon: React.ReactNode }) {
  return (
    <div className="bg-card rounded-xl ring-1 ring-foreground/10 p-4 flex items-center gap-3">
      <div className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${color}15` }}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold font-[family-name:var(--font-heading)]">{value}</p>
        <p className="text-xs text-foreground/50">{label}</p>
      </div>
    </div>
  );
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("es-AR", { day: "2-digit", month: "short" });
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <svg className="w-8 h-8 animate-spin text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" strokeDasharray="60" strokeDashoffset="20" />
        </svg>
      </div>
    );
  }

  if (!data) return null;

  const maxCategoryCount = Math.max(...data.reportsByCategory.map((r) => r.count), 1);
  const maxStatusCount = Math.max(...data.reportsByStatus.map((r) => r.count), 1);

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-3xl font-bold font-[family-name:var(--font-heading)] bg-gradient-to-r from-[#7c5cfc] to-[#c084fc] bg-clip-text text-transparent">
          Dashboard
        </h2>
        <p className="text-foreground/50 text-sm mt-1">Resumen general de la plataforma</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <StatCard label="Usuarios" value={data.stats.totalUsers} color="#7c5cfc"
          icon={<svg className="w-5 h-5" style={{ color: "#7c5cfc" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>}
        />
        <StatCard label="Avisos totales" value={data.stats.totalReports} color="#3b82f6"
          icon={<svg className="w-5 h-5" style={{ color: "#3b82f6" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>}
        />
        <StatCard label="Avisos activos" value={data.stats.activeReports} color="#22c55e"
          icon={<svg className="w-5 h-5" style={{ color: "#22c55e" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>}
        />
        <StatCard label="Feedback nuevo" value={data.stats.pendingFeedback} color="#f97316"
          icon={<svg className="w-5 h-5" style={{ color: "#f97316" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>}
        />
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-card rounded-xl ring-1 ring-foreground/10 p-4 text-center">
          <p className="text-lg font-bold font-[family-name:var(--font-heading)] text-emerald-400">{data.stats.totalConfirmations}</p>
          <p className="text-xs text-foreground/50">Confirmaciones</p>
        </div>
        <div className="bg-card rounded-xl ring-1 ring-foreground/10 p-4 text-center">
          <p className="text-lg font-bold font-[family-name:var(--font-heading)] text-red-400">{data.stats.totalFlags}</p>
          <p className="text-xs text-foreground/50">Señalamientos</p>
        </div>
        <div className="bg-card rounded-xl ring-1 ring-foreground/10 p-4 text-center">
          <p className="text-lg font-bold font-[family-name:var(--font-heading)] text-red-400">{data.stats.blockedUsers}</p>
          <p className="text-xs text-foreground/50">Bloqueados</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Reports by category */}
        <div className="bg-card rounded-xl ring-1 ring-foreground/10 p-4 sm:p-5">
          <h3 className="font-[family-name:var(--font-heading)] font-semibold mb-4">Avisos por categoría</h3>
          {data.reportsByCategory.length === 0 ? (
            <p className="text-sm text-foreground/40">Sin datos aún</p>
          ) : (
            <div className="space-y-3">
              {data.reportsByCategory.map((item) => (
                <div key={item.category}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm">{REPORT_CATEGORY_LABELS[item.category as ReportCategory] || item.category}</span>
                    <span className="text-sm font-medium">{item.count}</span>
                  </div>
                  <div className="h-2 bg-foreground/5 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all"
                      style={{
                        width: `${(item.count / maxCategoryCount) * 100}%`,
                        backgroundColor: REPORT_CATEGORY_COLORS[item.category as ReportCategory] || "#7c5cfc",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Reports by status */}
        <div className="bg-card rounded-xl ring-1 ring-foreground/10 p-4 sm:p-5">
          <h3 className="font-[family-name:var(--font-heading)] font-semibold mb-4">Avisos por estado</h3>
          {data.reportsByStatus.length === 0 ? (
            <p className="text-sm text-foreground/40">Sin datos aún</p>
          ) : (
            <div className="space-y-3">
              {data.reportsByStatus.map((item) => (
                <div key={item.status}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm">{REPORT_STATUS_LABELS[item.status as ReportStatus] || item.status}</span>
                    <span className="text-sm font-medium">{item.count}</span>
                  </div>
                  <div className="h-2 bg-foreground/5 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all"
                      style={{
                        width: `${(item.count / maxStatusCount) * 100}%`,
                        backgroundColor: REPORT_STATUS_COLORS[item.status as ReportStatus] || "#7c5cfc",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Recent users */}
        <div className="bg-card rounded-xl ring-1 ring-foreground/10 p-4 sm:p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-[family-name:var(--font-heading)] font-semibold">Usuarios recientes</h3>
            <Link href="/admin/users" className="text-xs text-primary hover:underline">Ver todos</Link>
          </div>
          {data.recentUsers.length === 0 ? (
            <p className="text-sm text-foreground/40">Sin usuarios aún</p>
          ) : (
            <div className="space-y-2">
              {data.recentUsers.map((user) => (
                <div key={user.id} className="flex items-center gap-3 py-2 border-b border-border/50 last:border-0">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary shrink-0">
                    {(user.displayName || user.email).charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{user.displayName || user.email.split("@")[0]}</p>
                    <p className="text-xs text-foreground/40 truncate">{user.email}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-amber-400">{starsDisplay(user.trustStars)}</p>
                    <p className="text-xs text-foreground/40">{formatDate(user.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top reporters */}
        <div className="bg-card rounded-xl ring-1 ring-foreground/10 p-4 sm:p-5">
          <h3 className="font-[family-name:var(--font-heading)] font-semibold mb-4">Top colaboradores</h3>
          {data.topReporters.length === 0 ? (
            <p className="text-sm text-foreground/40">Sin colaboradores aún</p>
          ) : (
            <div className="space-y-2">
              {data.topReporters.map((user, i) => (
                <div key={user.id} className="flex items-center gap-3 py-2 border-b border-border/50 last:border-0">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    i === 0 ? "bg-amber-400/20 text-amber-400" :
                    i === 1 ? "bg-foreground/10 text-foreground/50" :
                    i === 2 ? "bg-orange-400/20 text-orange-400" :
                    "bg-foreground/5 text-foreground/30"
                  }`}>
                    #{i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{user.displayName || user.email.split("@")[0]}</p>
                    <p className="text-xs text-amber-400">{starsDisplay(user.trustStars)}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-lg font-bold font-[family-name:var(--font-heading)] text-primary">{user.reportsCount}</p>
                    <p className="text-xs text-foreground/40">avisos</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link href="/admin/reports"
          className="bg-card rounded-xl ring-1 ring-foreground/10 p-4 text-center hover:ring-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all">
          <p className="text-sm font-medium">Moderación</p>
          <p className="text-xs text-foreground/40 mt-1">Revisar avisos</p>
        </Link>
        <Link href="/admin/users"
          className="bg-card rounded-xl ring-1 ring-foreground/10 p-4 text-center hover:ring-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all">
          <p className="text-sm font-medium">Usuarios</p>
          <p className="text-xs text-foreground/40 mt-1">Gestionar cuentas</p>
        </Link>
        <Link href="/admin/feedback"
          className="bg-card rounded-xl ring-1 ring-foreground/10 p-4 text-center hover:ring-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all">
          <p className="text-sm font-medium">Feedback</p>
          <p className="text-xs text-foreground/40 mt-1">Sugerencias</p>
        </Link>
        <Link href="/"
          className="bg-card rounded-xl ring-1 ring-foreground/10 p-4 text-center hover:ring-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all">
          <p className="text-sm font-medium">Mapa</p>
          <p className="text-xs text-foreground/40 mt-1">Ver en vivo</p>
        </Link>
      </div>
    </div>
  );
}
