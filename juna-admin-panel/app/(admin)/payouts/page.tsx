"use client";

import { Fragment, useEffect, useState } from "react";
import api from "@/lib/api";
import { Loader2, ChevronLeft, ChevronRight, CheckCircle2, Send, AlertTriangle } from "lucide-react";

interface PayoutInfo {
  id: string | null;
  automatic: boolean;
  status: "MANUAL" | "PROCESSING" | "SUCCESS" | "NEEDS_REVIEW";
  label: string;
  paidAt: string | null;
  mode: "AUTOMATIC" | "MANUAL" | "TRIGGERED" | null;
  reference: string | null;
  reviewReason: string | null;
  canTrigger: boolean;
  canConfirmManual: boolean;
}

interface PayoutRow {
  orderId: string;
  orderNumber: string;
  orderStatus: string;
  subscriptionName: string;
  providerId: string;
  providerName: string;
  providerConfigured: boolean;
  clientName: string;
  clientAmount: number;
  providerAmount: number;
  activatedAt: string | null;
  payout: PayoutInfo;
}

const STATUS_STYLES: Record<string, string> = {
  SUCCESS: "bg-[#EEF5F0] text-[#1A5C2A]",
  PROCESSING: "bg-blue-50 text-blue-600",
  NEEDS_REVIEW: "bg-orange-50 text-orange-600",
  MANUAL: "bg-gray-100 text-gray-600",
};

const STATUS_LABELS: Record<string, string> = {
  SUCCESS: "Versé",
  PROCESSING: "En cours",
  NEEDS_REVIEW: "À vérifier",
  MANUAL: "Jamais suivi",
};

const MODE_LABELS: Record<string, string> = {
  AUTOMATIC: "Automatique",
  MANUAL: "Manuel",
  TRIGGERED: "Déclenché",
};

const LIMIT = 20;

function formatDate(date: string | null): string {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("fr-FR");
}

export default function PayoutsPage() {
  const [rows, setRows] = useState<PayoutRow[]>([]);
  const [needsActionOnly, setNeedsActionOnly] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [actionOrderId, setActionOrderId] = useState<string | null>(null);
  const [manualAmount, setManualAmount] = useState("");
  const [busyOrderId, setBusyOrderId] = useState<string | null>(null);
  const [rowError, setRowError] = useState<{ orderId: string; message: string } | null>(null);

  function load() {
    setLoading(true);
    setError(false);
    api
      .get("/admin/payouts", { params: { page, limit: LIMIT, needsAction: needsActionOnly || undefined } })
      .then(({ data }) => {
        const payload = data.data;
        setRows(payload.items ?? []);
        setTotal(payload.total ?? 0);
        setTotalPages(payload.totalPages ?? 1);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, needsActionOnly]);

  function openManualForm(row: PayoutRow) {
    setRowError(null);
    setActionOrderId(row.orderId);
    setManualAmount(String(row.providerAmount));
  }

  async function confirmManual(orderId: string) {
    setBusyOrderId(orderId);
    setRowError(null);
    try {
      const amount = manualAmount ? Number(manualAmount) : undefined;
      await api.post(`/admin/payouts/${orderId}/confirm-manual`, amount ? { amount } : {});
      setActionOrderId(null);
      load();
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Erreur lors de la confirmation.";
      setRowError({ orderId, message });
    } finally {
      setBusyOrderId(null);
    }
  }

  async function triggerPayout(row: PayoutRow) {
    const confirmed = window.confirm(
      `Envoyer réellement ${row.providerAmount.toLocaleString("fr-FR")} FCFA à ${row.providerName} maintenant ?`
    );
    if (!confirmed) return;
    setBusyOrderId(row.orderId);
    setRowError(null);
    try {
      await api.post(`/admin/payouts/${row.orderId}/trigger`, {});
      load();
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Erreur lors de l'envoi.";
      setRowError({ orderId: row.orderId, message });
    } finally {
      setBusyOrderId(null);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#1A1A1A]">Versements</h1>
        <span className="text-[13px] text-[#6B6B6B]">{total > 0 ? `${total} commande${total > 1 ? "s" : ""}` : `${rows.length} commande${rows.length > 1 ? "s" : ""}`}</span>
      </div>

      <div className="flex flex-wrap gap-2 mb-5">
        <button
          onClick={() => { setPage(1); setNeedsActionOnly(true); }}
          className={`px-4 py-1.5 rounded-full text-[13px] font-semibold transition-colors ${needsActionOnly ? "bg-[#1A5C2A] text-white" : "bg-white border border-[#E5E5E5] text-[#6B6B6B] hover:border-[#1A5C2A] hover:text-[#1A5C2A]"}`}
        >
          À régler
        </button>
        <button
          onClick={() => { setPage(1); setNeedsActionOnly(false); }}
          className={`px-4 py-1.5 rounded-full text-[13px] font-semibold transition-colors ${!needsActionOnly ? "bg-[#1A5C2A] text-white" : "bg-white border border-[#E5E5E5] text-[#6B6B6B] hover:border-[#1A5C2A] hover:text-[#1A5C2A]"}`}
        >
          Tous les paiements
        </button>
      </div>

      <div className="bg-white rounded-xl border border-[#E5E5E5] overflow-hidden" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#E5E5E5] bg-[#F7F7F7]">
              <th className="text-left text-[13px] font-semibold text-[#1A1A1A] px-5 py-3">Commande</th>
              <th className="text-left text-[13px] font-semibold text-[#1A1A1A] px-5 py-3">Client</th>
              <th className="text-left text-[13px] font-semibold text-[#1A1A1A] px-5 py-3">Prestataire</th>
              <th className="text-left text-[13px] font-semibold text-[#1A1A1A] px-5 py-3">Part prestataire</th>
              <th className="text-left text-[13px] font-semibold text-[#1A1A1A] px-5 py-3">Versement</th>
              <th className="text-left text-[13px] font-semibold text-[#1A1A1A] px-5 py-3">Mode</th>
              <th className="text-left text-[13px] font-semibold text-[#1A1A1A] px-5 py-3">Activée</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="px-5 py-10 text-center"><Loader2 size={20} className="animate-spin mx-auto text-[#6B6B6B]" /></td></tr>
            ) : error ? (
              <tr><td colSpan={8} className="px-5 py-10 text-center text-[13px] text-[#6B6B6B]">Impossible de charger les versements.</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={8} className="px-5 py-10 text-center text-[13px] text-[#6B6B6B]">Aucune commande à afficher.</td></tr>
            ) : (
              rows.map((row) => (
                <Fragment key={row.orderId}>
                  <tr className="border-b border-[#E5E5E5] last:border-0 hover:bg-[#F7F7F7] transition-colors align-top">
                    <td className="px-5 py-3.5 text-[12px] text-[#6B6B6B] font-mono">{row.orderNumber}</td>
                    <td className="px-5 py-3.5 text-[13px] text-[#1A1A1A]">{row.clientName}</td>
                    <td className="px-5 py-3.5 text-[13px] text-[#1A1A1A]">
                      {row.providerName}
                      {!row.providerConfigured && (
                        <span className="block text-[11px] text-orange-600 font-medium mt-0.5">Numéro non configuré</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-[14px] font-semibold text-[#F4521E]">
                      {row.providerAmount.toLocaleString("fr-FR")} FCFA
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-semibold ${STATUS_STYLES[row.payout.status] ?? "bg-gray-100 text-gray-600"}`}>
                        {STATUS_LABELS[row.payout.status] ?? row.payout.status}
                      </span>
                      <p className="text-[11px] text-[#6B6B6B] mt-1 max-w-[220px]">{row.payout.label}</p>
                    </td>
                    <td className="px-5 py-3.5 text-[12px] text-[#6B6B6B]">
                      {row.payout.mode ? MODE_LABELS[row.payout.mode] ?? row.payout.mode : "—"}
                    </td>
                    <td className="px-5 py-3.5 text-[13px] text-[#6B6B6B]">{formatDate(row.activatedAt)}</td>
                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        {row.payout.canConfirmManual && (
                          <button
                            onClick={() => openManualForm(row)}
                            disabled={busyOrderId === row.orderId}
                            title="Confirmer un paiement déjà fait en dehors du système"
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[12px] font-semibold border border-[#E5E5E5] text-[#1A5C2A] hover:border-[#1A5C2A] transition-colors disabled:opacity-50"
                          >
                            <CheckCircle2 size={13} /> Manuel
                          </button>
                        )}
                        {row.payout.canTrigger && row.providerConfigured && (
                          <button
                            onClick={() => triggerPayout(row)}
                            disabled={busyOrderId === row.orderId}
                            title="Envoyer réellement le versement via FeexPay"
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[12px] font-semibold bg-[#1A5C2A] text-white hover:bg-[#0F3D1A] transition-colors disabled:opacity-50"
                          >
                            {busyOrderId === row.orderId ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />} Déclencher
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                  {actionOrderId === row.orderId && (
                    <tr className="bg-[#F7F7F7] border-b border-[#E5E5E5]">
                      <td colSpan={8} className="px-5 py-4">
                        <div className="flex items-end gap-3">
                          <div>
                            <label className="block text-[12px] font-medium text-[#6B6B6B] mb-1">
                              Montant réellement versé (FCFA)
                            </label>
                            <input
                              type="number"
                              value={manualAmount}
                              onChange={(e) => setManualAmount(e.target.value)}
                              className="w-40 h-9 px-3 rounded-lg border border-[#E5E5E5] text-[13px] focus:outline-none focus:border-[#1A5C2A]"
                            />
                          </div>
                          <button
                            onClick={() => confirmManual(row.orderId)}
                            disabled={busyOrderId === row.orderId}
                            className="flex items-center gap-1.5 h-9 px-4 rounded-lg bg-[#1A5C2A] text-white text-[13px] font-semibold hover:bg-[#0F3D1A] transition-colors disabled:opacity-60"
                          >
                            {busyOrderId === row.orderId ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                            Confirmer le paiement manuel
                          </button>
                          <button
                            onClick={() => setActionOrderId(null)}
                            className="h-9 px-3 rounded-lg text-[13px] font-medium text-[#6B6B6B] hover:text-[#1A1A1A]"
                          >
                            Annuler
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                  {rowError?.orderId === row.orderId && (
                    <tr className="bg-[#FFF5F2] border-b border-[#E5E5E5]">
                      <td colSpan={8} className="px-5 py-3 text-[13px] text-[#F4521E] flex items-center gap-2">
                        <AlertTriangle size={14} className="inline mr-2" />{rowError.message}
                      </td>
                    </tr>
                  )}
                </Fragment>
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
              onClick={() => setPage((p) => p - 1)}
              disabled={page <= 1 || loading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-semibold border border-[#E5E5E5] text-[#6B6B6B] hover:text-[#1A1A1A] hover:border-[#1A1A1A] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={14} />Précédent
            </button>
            <span className="text-[13px] text-[#6B6B6B] font-medium">Page {page} / {totalPages}</span>
            <button
              onClick={() => setPage((p) => p + 1)}
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
