"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { Loader2, ChevronRight } from "lucide-react";

interface Provider {
  id: string;
  businessName: string;
  city?: { name: string; country?: { code: string } };
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
}

const STATUS_STYLES: Record<string, string> = {
  APPROVED: "bg-[#EEF5F0] text-[#1A5C2A]",
  PENDING: "bg-orange-50 text-orange-600",
  REJECTED: "bg-red-50 text-red-500",
};
const STATUS_LABELS: Record<string, string> = {
  APPROVED: "Approuvé", PENDING: "En attente", REJECTED: "Rejeté",
};

export default function ProvidersPage() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/admin/providers")
      .then(({ data }) => setProviders(data.data ?? []))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter ? providers.filter(p => p.status === filter) : providers;

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#1A1A1A] mb-6">Fournisseurs</h1>

      <div className="flex gap-2 mb-4">
        {["", "PENDING", "APPROVED", "REJECTED"].map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-full text-[13px] font-semibold transition-colors ${filter === s ? "bg-[#1A5C2A] text-white" : "bg-white border border-[#E5E5E5] text-[#6B6B6B] hover:border-[#1A5C2A] hover:text-[#1A5C2A]"}`}>
            {s === "" ? "Tous" : STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-[#E5E5E5] overflow-hidden" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#E5E5E5] bg-[#F7F7F7]">
              <th className="text-left text-[14px] font-semibold text-[#1A1A1A] px-5 py-3">Nom</th>
              <th className="text-left text-[14px] font-semibold text-[#1A1A1A] px-5 py-3">Ville</th>
              <th className="text-left text-[14px] font-semibold text-[#1A1A1A] px-5 py-3">Statut</th>
              <th className="text-left text-[14px] font-semibold text-[#1A1A1A] px-5 py-3">Date</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="px-5 py-10 text-center"><Loader2 size={20} className="animate-spin mx-auto text-[#6B6B6B]" /></td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={5} className="px-5 py-10 text-center text-[13px] text-[#6B6B6B]">Aucun fournisseur trouvé.</td></tr>
            ) : (
              filtered.map(p => (
                <tr key={p.id} className="border-b border-[#E5E5E5] last:border-0 hover:bg-[#F7F7F7] transition-colors">
                  <td className="px-5 py-3.5 text-[14px] font-semibold text-[#1A1A1A]">{p.businessName}</td>
                  <td className="px-5 py-3.5 text-[14px] text-[#6B6B6B]">{p.city?.name ?? "—"}</td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-semibold ${STATUS_STYLES[p.status]}`}>
                      {STATUS_LABELS[p.status]}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-[13px] text-[#6B6B6B]">{new Date(p.createdAt).toLocaleDateString("fr-FR")}</td>
                  <td className="px-5 py-3.5 text-right">
                    <Link href={`/providers/${p.id}`} className="text-[#1A5C2A] hover:text-[#0F3D1A] inline-flex items-center gap-1 text-[13px] font-semibold">
                      Voir <ChevronRight size={14} />
                    </Link>
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
