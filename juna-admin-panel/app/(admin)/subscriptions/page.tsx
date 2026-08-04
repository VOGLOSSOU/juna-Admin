"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Loader2, Search } from "lucide-react";

interface Subscription {
  id: string;
  name: string;
  description?: string;
  price: number;
  type?: string;
  category?: string;
  duration?: string;
  isActive: boolean;
  isPublic: boolean;
  subscriberCount: number;
  createdAt: string;
  provider?: {
    id: string;
    businessName: string;
    city?: { id: string; name: string; country?: { translations?: { fr: string } } };
  };
}

const TYPE_LABELS: Record<string, string> = {
  BREAKFAST: "Petit-déj",
  LUNCH: "Déjeuner",
  DINNER: "Dîner",
  FULL_DAY: "Full day",
};

const DURATION_LABELS: Record<string, string> = {
  DAILY: "Journalier",
  WORK_WEEK: "Semaine (5j)",
  WEEK: "Semaine (7j)",
  MONTH: "Mensuel",
};

const CATEGORY_LABELS: Record<string, string> = {
  AFRICAN: "Africain",
  EUROPEAN: "Européen",
  ASIAN: "Asiatique",
  MIXED: "Mixte",
};

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [isActiveFilter, setIsActiveFilter] = useState<"" | "true" | "false">("");
  const [isPublicFilter, setIsPublicFilter] = useState<"" | "true" | "false">("");

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput), 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (search) params.search = search;
    if (isActiveFilter !== "") params.isActive = isActiveFilter;
    if (isPublicFilter !== "") params.isPublic = isPublicFilter;

    api.get("/admin/subscriptions", { params })
      .then(({ data }) => setSubscriptions(Array.isArray(data) ? data : data.data ?? []))
      .finally(() => setLoading(false));
  }, [search, isActiveFilter, isPublicFilter]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#1A1A1A]">Abonnements</h1>
        <span className="text-[13px] text-[#6B6B6B]">{subscriptions.length} abonnements</span>
      </div>

      <div className="flex flex-col gap-3 mb-5">
        <div className="relative max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B6B6B]" />
          <input
            type="text"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder="Rechercher un abonnement..."
            className="w-full h-10 pl-9 pr-4 rounded-lg border border-[#E5E5E5] text-[14px] text-[#1A1A1A] outline-none focus:border-[#1A5C2A] focus:ring-2 focus:ring-[#1A5C2A]/10 transition-all placeholder:text-[#6B6B6B] bg-white"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {[["", "Tous"], ["true", "Actifs"], ["false", "Inactifs"]].map(([val, label]) => (
            <button key={val} onClick={() => setIsActiveFilter(val as "" | "true" | "false")}
              className={`px-4 py-1.5 rounded-full text-[13px] font-semibold transition-colors ${isActiveFilter === val ? "bg-[#1A5C2A] text-white" : "bg-white border border-[#E5E5E5] text-[#6B6B6B] hover:border-[#1A5C2A] hover:text-[#1A5C2A]"}`}>
              {label}
            </button>
          ))}
          <div className="w-px bg-[#E5E5E5] mx-1" />
          {[["", "Tous"], ["true", "Publiés"], ["false", "Brouillons"]].map(([val, label]) => (
            <button key={val} onClick={() => setIsPublicFilter(val as "" | "true" | "false")}
              className={`px-4 py-1.5 rounded-full text-[13px] font-semibold transition-colors ${isPublicFilter === val ? "bg-[#1A5C2A] text-white" : "bg-white border border-[#E5E5E5] text-[#6B6B6B] hover:border-[#1A5C2A] hover:text-[#1A5C2A]"}`}>
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
              <th className="text-left text-[13px] font-semibold text-[#1A1A1A] px-5 py-3">Fournisseur</th>
              <th className="text-left text-[13px] font-semibold text-[#1A1A1A] px-5 py-3">Ville</th>
              <th className="text-left text-[13px] font-semibold text-[#1A1A1A] px-5 py-3">Prix</th>
              <th className="text-left text-[13px] font-semibold text-[#1A1A1A] px-5 py-3">Type</th>
              <th className="text-left text-[13px] font-semibold text-[#1A1A1A] px-5 py-3">Durée</th>
              <th className="text-left text-[13px] font-semibold text-[#1A1A1A] px-5 py-3">Abonnés</th>
              <th className="text-left text-[13px] font-semibold text-[#1A1A1A] px-5 py-3">Statut</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="px-5 py-10 text-center"><Loader2 size={20} className="animate-spin mx-auto text-[#6B6B6B]" /></td></tr>
            ) : subscriptions.length === 0 ? (
              <tr><td colSpan={8} className="px-5 py-10 text-center text-[13px] text-[#6B6B6B]">Aucun abonnement trouvé.</td></tr>
            ) : (
              subscriptions.map(s => (
                <tr key={s.id} className="border-b border-[#E5E5E5] last:border-0 hover:bg-[#F7F7F7] transition-colors">
                  <td className="px-5 py-3.5">
                    <p className="text-[14px] font-semibold text-[#1A1A1A]">{s.name}</p>
                    <p className="text-[12px] text-[#6B6B6B]">{CATEGORY_LABELS[s.category ?? ""] ?? s.category ?? "—"}</p>
                  </td>
                  <td className="px-5 py-3.5 text-[14px] text-[#6B6B6B]">{s.provider?.businessName ?? "—"}</td>
                  <td className="px-5 py-3.5 text-[13px] text-[#6B6B6B]">{s.provider?.city?.name ?? "—"}</td>
                  <td className="px-5 py-3.5 text-[14px] font-semibold text-[#F4521E]">{s.price?.toLocaleString("fr-FR")} FCFA</td>
                  <td className="px-5 py-3.5 text-[13px] text-[#6B6B6B]">{TYPE_LABELS[s.type ?? ""] ?? s.type ?? "—"}</td>
                  <td className="px-5 py-3.5 text-[13px] text-[#6B6B6B]">{DURATION_LABELS[s.duration ?? ""] ?? s.duration ?? "—"}</td>
                  <td className="px-5 py-3.5 text-[14px] font-semibold text-[#1A1A1A]">{s.subscriberCount}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex flex-col gap-1">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold w-fit ${s.isActive ? "bg-[#EEF5F0] text-[#1A5C2A]" : "bg-gray-100 text-gray-500"}`}>
                        {s.isActive ? "Actif" : "Inactif"}
                      </span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold w-fit ${s.isPublic ? "bg-blue-50 text-blue-600" : "bg-orange-50 text-orange-500"}`}>
                        {s.isPublic ? "Publié" : "Brouillon"}
                      </span>
                    </div>
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
