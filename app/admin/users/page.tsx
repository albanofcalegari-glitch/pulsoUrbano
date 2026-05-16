"use client";

import { useState, useEffect, useCallback } from "react";
import { starsDisplay } from "@/lib/utils";

interface AdminUser {
  id: string;
  email: string;
  displayName: string | null;
  role: string;
  trustStars: number;
  trustScore: number;
  reportsCount: number;
  confirmedReportsCount: number;
  rejectedReportsCount: number;
  flagsReceivedCount: number;
  isBlocked: boolean;
  createdAt: string;
  lastLoginAt: string | null;
}

export default function UsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchUsers = useCallback(async (q: string) => {
    setLoading(true);
    const params = q ? `?search=${encodeURIComponent(q)}` : "";
    const res = await fetch(`/api/admin/users${params}`);
    if (res.ok) setUsers(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchUsers(""); }, [fetchUsers]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    fetchUsers(search);
  }

  async function handleBlock(userId: string) {
    await fetch(`/api/admin/users/${userId}/block`, { method: "POST" });
    fetchUsers(search);
  }

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" });
  }

  return (
    <div>
      <div className="px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold">Usuarios</h2>
          <p className="text-sm text-foreground/50 mt-0.5">{users.length} usuario{users.length !== 1 ? "s" : ""}</p>
        </div>
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por email o nombre..."
            className="h-9 px-3 bg-card border border-border rounded-lg text-sm text-foreground placeholder:text-foreground/30 focus:ring-2 focus:ring-primary/50 focus:border-transparent w-64"
          />
          <button type="submit"
            className="h-9 px-4 bg-gradient-to-r from-[#7c5cfc] to-[#c084fc] text-white text-sm font-medium rounded-lg transition-all active:translate-y-px">
            Buscar
          </button>
        </form>
      </div>

      <div className="px-4 sm:px-6 pb-6">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <svg className="w-8 h-8 animate-spin text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" strokeDasharray="60" strokeDashoffset="20" />
            </svg>
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-foreground/40">
            <svg className="w-12 h-12 mb-2 opacity-40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" />
            </svg>
            <p className="text-sm">No se encontraron usuarios.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-foreground/50">
                  <th className="text-left py-3 px-3 font-medium">Usuario</th>
                  <th className="text-left py-3 px-3 font-medium hidden sm:table-cell">Email</th>
                  <th className="text-center py-3 px-3 font-medium">Estrellas</th>
                  <th className="text-center py-3 px-3 font-medium">Avisos</th>
                  <th className="text-center py-3 px-3 font-medium hidden md:table-cell">Confirmados</th>
                  <th className="text-center py-3 px-3 font-medium hidden md:table-cell">Flags</th>
                  <th className="text-left py-3 px-3 font-medium hidden lg:table-cell">Registro</th>
                  <th className="text-center py-3 px-3 font-medium">Estado</th>
                  <th className="text-center py-3 px-3 font-medium">Acción</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-border/50 hover:bg-card/50 transition-colors">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                          {(user.displayName || user.email).charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-foreground truncate">{user.displayName || "—"}</p>
                          <p className="text-xs text-foreground/40 sm:hidden truncate">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-foreground/60 hidden sm:table-cell">
                      <span className="truncate block max-w-[200px]">{user.email}</span>
                    </td>
                    <td className="py-3 px-3 text-center text-amber-400 text-xs">{starsDisplay(user.trustStars)}</td>
                    <td className="py-3 px-3 text-center">{user.reportsCount}</td>
                    <td className="py-3 px-3 text-center hidden md:table-cell text-emerald-400">{user.confirmedReportsCount}</td>
                    <td className="py-3 px-3 text-center hidden md:table-cell text-red-400">{user.flagsReceivedCount}</td>
                    <td className="py-3 px-3 text-foreground/40 hidden lg:table-cell">{formatDate(user.createdAt)}</td>
                    <td className="py-3 px-3 text-center">
                      {user.isBlocked ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                          Bloqueado
                        </span>
                      ) : user.role === "admin" ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                          Admin
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Activo
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center">
                      {user.role !== "admin" && !user.isBlocked && (
                        <button onClick={() => handleBlock(user.id)}
                          className="px-2 py-1 text-xs font-medium rounded-lg bg-red-500/10 text-red-400 ring-1 ring-red-500/20 hover:bg-red-500/20 transition-colors">
                          Bloquear
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
