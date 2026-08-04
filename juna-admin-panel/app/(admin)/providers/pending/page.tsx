"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { Loader2, ChevronRight, Clock } from "lucide-react";

interface Provider {
  id: string;
  businessName: string;
  city?: { name: string };
  createdAt: string;
}

export default function PendingProvidersPage() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Endpoint dédié pour les fournisseurs en attente
    api.get("/admin/providers/pending")
      .then(({ data }) => setProviders(data.data ?? []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold text-[#1A1A1A]">Demandes en attente</h1>
        {!loading && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 text-orange-600 text-[12px] font-semibold">
            <Clock size={12} />{providers.length}
          </span>
        )}
      </div>

      <div className="bg-white rounded-xl border border-[#E5E5E5] overflow-hidden" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#E5E5E5] bg-[#F7F7F7]">
              <th className="text-left text-[14px] font-semibold text-[#1A1A1A] px-5 py-3">Nom</th>
              <th className="text-left text-[14px] font-semibold text-[#1A1A1A] px-5 py-3">Ville</th>
              <th className="text-left text-[14px] font-semibold text-[#1A1A1A] px-5 py-3">Date de demande</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="px-5 py-10 text-center"><Loader2 size={20} className="animate-spin mx-auto text-[#6B6B6B]" /></td></tr>
            ) : providers.length === 0 ? (
              <tr><td colSpan={4} className="px-5 py-10 text-center text-[13px] text-[#6B6B6B]">Aucune demande en attente.</td></tr>
            ) : (
              providers.map(p => (
                <tr key={p.id} className="border-b border-[#E5E5E5] last:border-0 hover:bg-[#F7F7F7] transition-colors">
                  <td className="px-5 py-3.5 text-[14px] font-semibold text-[#1A1A1A]">{p.businessName}</td>
                  <td className="px-5 py-3.5 text-[14px] text-[#6B6B6B]">{p.city?.name ?? "—"}</td>
                  <td className="px-5 py-3.5 text-[13px] text-[#6B6B6B]">{new Date(p.createdAt).toLocaleDateString("fr-FR")}</td>
                  <td className="px-5 py-3.5 text-right">
                    <Link href={`/providers/${p.id}`} className="text-[#1A5C2A] hover:text-[#0F3D1A] inline-flex items-center gap-1 text-[13px] font-semibold">
                      Traiter <ChevronRight size={14} />
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
