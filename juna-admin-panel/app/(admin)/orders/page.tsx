"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Loader2, Truck, Package, ChevronLeft, ChevronRight } from "lucide-react";

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  amount: number;
  deliveryMethod: "DELIVERY" | "PICKUP";
  scheduledFor?: string;
  createdAt: string;
  user?: { id: string; name?: string; email?: string };
  subscription?: {
    id: string;
    name: string;
    provider?: { businessName: string };
  };
  payment?: { status: string; amount: number };
}

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-orange-50 text-orange-600",
  CONFIRMED: "bg-blue-50 text-blue-600",
  ACTIVE: "bg-purple-50 text-purple-600",
  COMPLETED: "bg-[#EEF5F0] text-[#1A5C2A]",
  CANCELLED: "bg-red-50 text-red-500",
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: "En attente",
  CONFIRMED: "Confirmée",
  ACTIVE: "Active",
  COMPLETED: "Terminée",
  CANCELLED: "Annulée",
};

const DELIVERY_LABELS: Record<string, string> = {
  DELIVERY: "Livraison",
  PICKUP: "Retrait",
};

const ALL_STATUSES = ["", "PENDING", "CONFIRMED", "ACTIVE", "COMPLETED", "CANCELLED"];
const ALL_METHODS = ["", "DELIVERY", "PICKUP"];
const LIMIT = 20;

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [methodFilter, setMethodFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);
    const params: Record<string, string | number> = { page, limit: LIMIT };
    if (statusFilter) params.status = statusFilter;
    if (methodFilter) params.deliveryMethod = methodFilter;

    api.get("/orders", { params })
      .then(({ data }) => {
        const paginated = data.data;
        // Response: { data: { data: Order[], total, page, totalPages } }
        setOrders(Array.isArray(paginated) ? paginated : paginated.data ?? []);
        setTotal(paginated.total ?? 0);
        setTotalPages(paginated.totalPages ?? 1);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [statusFilter, methodFilter, page]);

  const handleStatusFilter = (s: string) => { setPage(1); setStatusFilter(s); };
  const handleMethodFilter = (m: string) => { setPage(1); setMethodFilter(m); };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#1A1A1A]">Commandes</h1>
        <span className="text-[13px] text-[#6B6B6B]">{total > 0 ? `${total} commandes` : `${orders.length} commandes`}</span>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        {ALL_STATUSES.map(s => (
          <button key={s} onClick={() => handleStatusFilter(s)}
            className={`px-4 py-1.5 rounded-full text-[13px] font-semibold transition-colors ${statusFilter === s ? "bg-[#1A5C2A] text-white" : "bg-white border border-[#E5E5E5] text-[#6B6B6B] hover:border-[#1A5C2A] hover:text-[#1A5C2A]"}`}>
            {s === "" ? "Tous statuts" : STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 mb-5">
        {ALL_METHODS.map(m => (
          <button key={m} onClick={() => handleMethodFilter(m)}
            className={`px-4 py-1.5 rounded-full text-[13px] font-semibold transition-colors ${methodFilter === m ? "bg-[#1A5C2A] text-white" : "bg-white border border-[#E5E5E5] text-[#6B6B6B] hover:border-[#1A5C2A] hover:text-[#1A5C2A]"}`}>
            {m === "" ? "Tous modes" : DELIVERY_LABELS[m]}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-[#E5E5E5] overflow-hidden" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#E5E5E5] bg-[#F7F7F7]">
              <th className="text-left text-[13px] font-semibold text-[#1A1A1A] px-5 py-3">N° Commande</th>
              <th className="text-left text-[13px] font-semibold text-[#1A1A1A] px-5 py-3">Client</th>
              <th className="text-left text-[13px] font-semibold text-[#1A1A1A] px-5 py-3">Abonnement</th>
              <th className="text-left text-[13px] font-semibold text-[#1A1A1A] px-5 py-3">Fournisseur</th>
              <th className="text-left text-[13px] font-semibold text-[#1A1A1A] px-5 py-3">Mode</th>
              <th className="text-left text-[13px] font-semibold text-[#1A1A1A] px-5 py-3">Statut</th>
              <th className="text-left text-[13px] font-semibold text-[#1A1A1A] px-5 py-3">Date</th>
              <th className="text-left text-[13px] font-semibold text-[#1A1A1A] px-5 py-3">Montant</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="px-5 py-10 text-center"><Loader2 size={20} className="animate-spin mx-auto text-[#6B6B6B]" /></td></tr>
            ) : error ? (
              <tr><td colSpan={8} className="px-5 py-10 text-center text-[13px] text-[#6B6B6B]">Impossible de charger les commandes.</td></tr>
            ) : orders.length === 0 ? (
              <tr><td colSpan={8} className="px-5 py-10 text-center text-[13px] text-[#6B6B6B]">Aucune commande trouvée.</td></tr>
            ) : (
              orders.map(o => (
                <tr key={o.id} className="border-b border-[#E5E5E5] last:border-0 hover:bg-[#F7F7F7] transition-colors">
                  <td className="px-5 py-3.5 text-[12px] text-[#6B6B6B] font-mono">{o.orderNumber}</td>
                  <td className="px-5 py-3.5 text-[14px] text-[#1A1A1A] font-medium">{o.user?.name ?? o.user?.email ?? "—"}</td>
                  <td className="px-5 py-3.5 text-[13px] text-[#6B6B6B]">{o.subscription?.name ?? "—"}</td>
                  <td className="px-5 py-3.5 text-[13px] text-[#6B6B6B]">{o.subscription?.provider?.businessName ?? "—"}</td>
                  <td className="px-5 py-3.5">
                    <span className="flex items-center gap-1.5 text-[13px] text-[#6B6B6B]">
                      {o.deliveryMethod === "DELIVERY" ? <Truck size={13} /> : <Package size={13} />}
                      {DELIVERY_LABELS[o.deliveryMethod] ?? o.deliveryMethod}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-semibold ${STATUS_STYLES[o.status] ?? "bg-gray-100 text-gray-600"}`}>
                      {STATUS_LABELS[o.status] ?? o.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-[13px] text-[#6B6B6B]">{new Date(o.createdAt).toLocaleDateString("fr-FR")}</td>
                  <td className="px-5 py-3.5 text-[14px] font-semibold text-[#F4521E]">
                    {o.amount != null ? `${o.amount.toLocaleString("fr-FR")} FCFA` : "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 px-1">
          <p className="text-[13px] text-[#6B6B6B]">{total} commandes au total</p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setPage(p => p - 1)}
              disabled={page <= 1 || loading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-semibold border border-[#E5E5E5] text-[#6B6B6B] hover:text-[#1A1A1A] hover:border-[#1A1A1A] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={14} />Précédent
            </button>
            <span className="text-[13px] text-[#6B6B6B] font-medium">Page {page} / {totalPages}</span>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={page >= totalPages || loading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-semibold border border-[#E5E5E5] text-[#6B6B6B] hover:text-[#1A1A1A] hover:border-[#1A1A1A] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Suivant<ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
