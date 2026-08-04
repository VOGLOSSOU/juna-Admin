"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Loader2, Search, UserX, UserCheck, ShieldOff } from "lucide-react";

interface User {
  id: string;
  name?: string;
  email: string;
  phone?: string;
  role: string;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
}

type ModalType = "suspend" | "ban";

const ROLE_STYLES: Record<string, string> = {
  ADMIN: "bg-purple-50 text-purple-600",
  SUPER_ADMIN: "bg-purple-100 text-purple-700",
  PROVIDER: "bg-blue-50 text-blue-600",
  USER: "bg-[#EEF5F0] text-[#1A5C2A]",
};

function extractError(err: unknown): string {
  const msg = (err as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message;
  return Array.isArray(msg) ? msg.join(" ") : (msg ?? "Une erreur est survenue.");
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [isActiveFilter, setIsActiveFilter] = useState<"" | "true" | "false">("");
  const [roleFilter, setRoleFilter] = useState("");
  const [modal, setModal] = useState<{ type: ModalType; id: string; name: string } | null>(null);
  const [modalReason, setModalReason] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput), 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (search) params.search = search;
    if (isActiveFilter !== "") params.isActive = isActiveFilter;
    if (roleFilter) params.role = roleFilter;

    api.get("/admin/users", { params })
      .then(({ data }) => setUsers(Array.isArray(data) ? data : data.data ?? []))
      .finally(() => setLoading(false));
  }, [search, isActiveFilter, roleFilter]);

  const closeModal = () => { setModal(null); setModalReason(""); setActionError(""); };

  const handleModalConfirm = async () => {
    if (!modal) return;
    setActionLoading(modal.id);
    setActionError("");
    try {
      if (modal.type === "suspend") {
        await api.put(`/admin/users/${modal.id}/suspend`, { reason: modalReason });
        setUsers(prev => prev.map(u => u.id === modal.id ? { ...u, isActive: false } : u));
      } else {
        await api.put(`/admin/users/${modal.id}/ban`, { reason: modalReason });
        setUsers(prev => prev.filter(u => u.id !== modal.id));
      }
      closeModal();
    } catch (err) {
      setActionError(extractError(err));
    } finally {
      setActionLoading(null);
    }
  };

  const handleActivate = async (userId: string) => {
    setActionLoading(userId);
    try {
      await api.put(`/admin/users/${userId}/activate`);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, isActive: true } : u));
    } catch {
      // silently fail
    } finally {
      setActionLoading(null);
    }
  };

  const isBanned = (u: User) => !u.isActive && u.email.startsWith("banned_");

  return (
    <div>
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl border border-[#E5E5E5] p-6 w-full max-w-md mx-4">
            <div className="flex items-center gap-3 mb-3">
              {modal.type === "ban" && (
                <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                  <ShieldOff size={18} className="text-red-600" />
                </div>
              )}
              <div>
                <h3 className="text-[16px] font-bold text-[#1A1A1A]">
                  {modal.type === "suspend" ? "Suspendre" : "Bannir définitivement"} {modal.name}
                </h3>
                <p className="text-[13px] text-[#6B6B6B]">
                  {modal.type === "suspend"
                    ? "L'utilisateur ne pourra plus se connecter (réversible)."
                    : "⚠️ Action irréversible — l'email sera anonymisé."}
                </p>
              </div>
            </div>
            <label className="block text-[13px] font-semibold text-[#1A1A1A] mb-1.5">
              Raison {modal.type === "ban" ? "(optionnel)" : "(optionnel)"}
            </label>
            <textarea
              value={modalReason}
              onChange={e => setModalReason(e.target.value)}
              placeholder={modal.type === "ban" ? "Fraude avérée, signalements multiples." : "Comportement abusif signalé..."}
              rows={3}
              className="w-full rounded-lg border border-[#E5E5E5] text-[14px] text-[#1A1A1A] px-4 py-3 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 resize-none transition-all"
            />
            {actionError && <p className="text-[13px] text-[#F4521E] mt-2">{actionError}</p>}
            <div className="flex gap-3 mt-5">
              <button onClick={closeModal}
                className="flex-1 h-10 rounded-lg border border-[#E5E5E5] text-[14px] font-semibold text-[#6B6B6B] hover:text-[#1A1A1A] hover:border-[#1A1A1A] transition-colors">
                Annuler
              </button>
              <button onClick={handleModalConfirm} disabled={!!actionLoading}
                className={`flex-1 h-10 rounded-lg text-white text-[14px] font-semibold transition-colors disabled:opacity-60 flex items-center justify-center gap-2 ${modal.type === "ban" ? "bg-red-700 hover:bg-red-800" : "bg-[#F4521E] hover:bg-red-600"}`}>
                {actionLoading === modal.id ? <Loader2 size={14} className="animate-spin" /> : (modal.type === "ban" ? <ShieldOff size={14} /> : <UserX size={14} />)}
                {modal.type === "suspend" ? "Suspendre" : "Bannir"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#1A1A1A]">Utilisateurs</h1>
        <span className="text-[13px] text-[#6B6B6B]">{users.length} inscrits</span>
      </div>

      <div className="flex flex-col gap-3 mb-5">
        <div className="relative max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B6B6B]" />
          <input
            type="text"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder="Rechercher nom, email, téléphone..."
            className="w-full h-10 pl-9 pr-4 rounded-lg border border-[#E5E5E5] text-[14px] text-[#1A1A1A] outline-none focus:border-[#1A5C2A] focus:ring-2 focus:ring-[#1A5C2A]/10 transition-all placeholder:text-[#6B6B6B] bg-white"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {[["", "Tous rôles"], ["USER", "USER"], ["PROVIDER", "PROVIDER"], ["ADMIN", "ADMIN"]].map(([val, label]) => (
            <button key={val} onClick={() => setRoleFilter(val)}
              className={`px-4 py-1.5 rounded-full text-[13px] font-semibold transition-colors ${roleFilter === val ? "bg-[#1A5C2A] text-white" : "bg-white border border-[#E5E5E5] text-[#6B6B6B] hover:border-[#1A5C2A] hover:text-[#1A5C2A]"}`}>
              {label}
            </button>
          ))}
          <div className="w-px bg-[#E5E5E5] mx-1" />
          {[["", "Tous statuts"], ["true", "Actifs"], ["false", "Suspendus"]].map(([val, label]) => (
            <button key={val} onClick={() => setIsActiveFilter(val as "" | "true" | "false")}
              className={`px-4 py-1.5 rounded-full text-[13px] font-semibold transition-colors ${isActiveFilter === val ? (val === "false" ? "bg-[#F4521E] text-white" : "bg-[#1A5C2A] text-white") : "bg-white border border-[#E5E5E5] text-[#6B6B6B] hover:border-[#1A5C2A] hover:text-[#1A5C2A]"}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#E5E5E5] overflow-hidden" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#E5E5E5] bg-[#F7F7F7]">
              <th className="text-left text-[13px] font-semibold text-[#1A1A1A] px-5 py-3">Nom</th>
              <th className="text-left text-[13px] font-semibold text-[#1A1A1A] px-5 py-3">Email</th>
              <th className="text-left text-[13px] font-semibold text-[#1A1A1A] px-5 py-3">Rôle</th>
              <th className="text-left text-[13px] font-semibold text-[#1A1A1A] px-5 py-3">Statut</th>
              <th className="text-left text-[13px] font-semibold text-[#1A1A1A] px-5 py-3">Inscription</th>
              <th className="text-left text-[13px] font-semibold text-[#1A1A1A] px-5 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="px-5 py-10 text-center"><Loader2 size={20} className="animate-spin mx-auto text-[#6B6B6B]" /></td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={6} className="px-5 py-10 text-center text-[13px] text-[#6B6B6B]">Aucun utilisateur trouvé.</td></tr>
            ) : (
              users.map(u => (
                <tr key={u.id} className="border-b border-[#E5E5E5] last:border-0 hover:bg-[#F7F7F7] transition-colors">
                  <td className="px-5 py-3.5 text-[14px] font-semibold text-[#1A1A1A]">{u.name ?? "—"}</td>
                  <td className="px-5 py-3.5 text-[14px] text-[#6B6B6B]">{u.email}</td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-semibold ${ROLE_STYLES[u.role] ?? "bg-gray-100 text-gray-600"}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-semibold ${
                      isBanned(u) ? "bg-red-100 text-red-700" : u.isActive ? "bg-[#EEF5F0] text-[#1A5C2A]" : "bg-red-50 text-red-500"
                    }`}>
                      {isBanned(u) ? "Banni" : u.isActive ? "Actif" : "Suspendu"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-[13px] text-[#6B6B6B]">{new Date(u.createdAt).toLocaleDateString("fr-FR")}</td>
                  <td className="px-5 py-3.5">
                    {u.role !== "ADMIN" && u.role !== "SUPER_ADMIN" && !isBanned(u) && (
                      <div className="flex items-center gap-2">
                        {u.isActive ? (
                          <>
                            <button
                              onClick={() => setModal({ type: "suspend", id: u.id, name: u.name ?? u.email })}
                              disabled={actionLoading === u.id}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold text-[#F4521E] bg-[#FFF5F2] hover:bg-red-100 transition-colors disabled:opacity-60"
                            >
                              {actionLoading === u.id ? <Loader2 size={12} className="animate-spin" /> : <UserX size={12} />}
                              Suspendre
                            </button>
                            <button
                              onClick={() => setModal({ type: "ban", id: u.id, name: u.name ?? u.email })}
                              disabled={actionLoading === u.id}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold text-red-700 bg-red-100 hover:bg-red-200 transition-colors disabled:opacity-60"
                            >
                              <ShieldOff size={12} />Bannir
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => handleActivate(u.id)}
                            disabled={actionLoading === u.id}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold text-[#1A5C2A] bg-[#EEF5F0] hover:bg-green-100 transition-colors disabled:opacity-60"
                          >
                            {actionLoading === u.id ? <Loader2 size={12} className="animate-spin" /> : <UserCheck size={12} />}
                            Réactiver
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
