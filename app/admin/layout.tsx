"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { APP_NAME } from "@/lib/constants";
import { starsDisplay } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/reports", label: "Moderación" },
  { href: "/admin/users", label: "Usuarios" },
  { href: "/admin/feedback", label: "Feedback" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  const pathname = usePathname();

  if (auth.loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <svg className="w-8 h-8 animate-spin text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" strokeDasharray="60" strokeDashoffset="20" />
        </svg>
      </div>
    );
  }

  if (!auth.user || auth.user.role !== "admin") {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-3">
          <div className="h-12 w-12 mx-auto rounded-xl bg-red-500/10 flex items-center justify-center">
            <svg className="w-6 h-6 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>
          <h1 className="font-[family-name:var(--font-heading)] text-xl font-bold text-foreground">Acceso denegado</h1>
          <p className="text-foreground/50 text-sm">Necesitás ser admin para acceder.</p>
          <a href="/" className="inline-block text-primary hover:underline text-sm mt-2">Volver al mapa</a>
        </div>
      </div>
    );
  }

  function isActive(href: string) {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="bg-card border-b border-border">
        <div className="px-4 sm:px-6 py-3 flex items-center justify-between">
          <h1 className="font-[family-name:var(--font-heading)] text-lg font-bold bg-gradient-to-r from-[#7c5cfc] to-[#c084fc] bg-clip-text text-transparent">
            {APP_NAME}
          </h1>
          <div className="flex items-center gap-3">
            <span className="text-xs text-amber-400">{starsDisplay(auth.user.trustStars)}</span>
            <span className="text-xs text-foreground/50 hidden sm:inline">{auth.user.email}</span>
            <a href="/" className="text-xs text-primary hover:underline">Mapa</a>
          </div>
        </div>
        <nav className="px-4 sm:px-6 flex gap-1 overflow-x-auto no-scrollbar pb-0">
          {NAV_ITEMS.map((item) => (
            <Link key={item.href} href={item.href}
              className={`shrink-0 px-3 py-2 text-sm font-medium transition-colors border-b-2 ${
                isActive(item.href)
                  ? "border-primary text-primary"
                  : "border-transparent text-foreground/50 hover:text-foreground"
              }`}>
              {item.label}
            </Link>
          ))}
        </nav>
      </header>
      {children}
    </div>
  );
}
