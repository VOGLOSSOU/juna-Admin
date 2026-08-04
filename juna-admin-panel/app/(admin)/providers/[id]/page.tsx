"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { ArrowLeft, Loader2, CheckCircle, XCircle, PauseCircle, MapPin, Store } from "lucide-react";
import Image from "next/image";

interface Provider {
  id: string;
  businessName: string;
  description?: string;
  businessAddress?: string;
  phone?: string;
  logo?: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";
  acceptsDelivery?: boolean;
  acceptsPickup?: boolean;
  city?: { name: string; country?: { translations?: { fr: string } } };
  deliveryZones?: { city: string; cost: number; country: string }[];
  landmarks?: { landmark: { id: string; name: string } }[];
  user?: { name: string; email: string };
  createdAt: string;
}

const STATUS_STYLES: Record<string, string> = {
  APPROVED: "bg-[#EEF5F0] text-[#1A5C2A]",
  PENDING: "bg-orange-50 text-orange-600",
  REJECTED: "bg-red-50 text-red-500",
  SUSPENDED: "bg-yellow-50 text-yellow-600",
};
const STATUS_LABELS: Record<string, string> = {
  APPROVED: "Approuvé",
  PENDING: "En attente",
  REJECTED: "Rejeté",
  SUSPENDED: "Suspendu",
};

function extractError(err: unknown): string {
  const msg = (err as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message;
  return Array.isArray(msg) ? msg.join(" ") : (msg ?? "Une erreur est survenue.");
}

export default function ProviderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [provider, setProvider] = useState<Provider | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<"approve" | "reject" | "suspend" | null>(null);
  const [error, setError] = useState("");
  const [pendingAction, setPendingAction] = useState<"reject" | "suspend" | null>(null);
  const [actionReason, setActionReason] = useState("");

  useEffect(() => {
    api.get(`/admin/providers/${id}`)
      .then(({ data }) => setProvider(data.data))
      .finally(() => setLoading(false));
  }, [id]);

  const handleApprove = async () => {
    setActionLoading("approve");
    setError("");
    try {
      await api.put(`/admin/providers/${id}/approve`, { message: "Dossier complet, bienvenue sur Juna !" });
      setProvider(prev => prev ? { ...prev, status: "APPROVED" } : prev);
    } catch (err) {
      setError(extractError(err));
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!actionReason.trim()) {
      setError("La raison du rejet est obligatoire.");
      return;
    }
    setActionLoading("reject");
    setError("");
    try {
      await api.put(`/admin/providers/${id}/reject`, { reason: actionReason });
      setProvider(prev => prev ? { ...prev, status: "REJECTED" } : prev);
      setPendingAction(null);
      setActionReason("");
    } catch (err) {
      setError(extractError(err));
    } finally {
      setActionLoading(null);
    }
  };

  const handleSuspend = async () => {
    setActionLoading("suspend");
    setError("");
    try {
      await api.put(`/admin/providers/${id}/suspend`, { reason: actionReason });
      setProvider(prev => prev ? { ...prev, status: "SUSPENDED" } : prev);
      setPendingAction(null);
      setActionReason("");
    } catch (err) {
      setError(extractError(err));
    } finally {
      setActionLoading(null);
    }
  };

  const cancelPendingAction = () => {
    setPendingAction(null);
    setActionReason("");
    setError("");
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 size={28} className="animate-spin text-[#1A5C2A]" />
    </div>
  );

  if (!provider) return <p className="text-[#6B6B6B] text-center py-20">Fournisseur introuvable.</p>;

  return (
    <div className="max-w-3xl">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-[13px] text-[#6B6B6B] hover:text-[#1A1A1A] mb-6 transition-colors">
        <ArrowLeft size={16} />Retour
      </button>

      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          {provider.logo ? (
            <div className="w-16 h-16 rounded-xl overflow-hidden border border-[#E5E5E5]">
              <Image src={provider.logo} alt={provider.businessName} width={64} height={64} className="object-cover w-full h-full" />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-xl bg-[#EEF5F0] flex items-center justify-center">
              <Store size={28} className="text-[#1A5C2A]" />
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-[#1A1A1A]">{provider.businessName}</h1>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-semibold mt-1 ${STATUS_STYLES[provider.status]}`}>
              {STATUS_LABELS[provider.status]}
            </span>
          </div>
        </div>

        <div className="flex gap-3">
          {provider.status === "PENDING" && !pendingAction && (
            <>
              <button onClick={() => { setPendingAction("reject"); setError(""); }}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#F4521E] hover:bg-red-600 text-white text-[14px] font-semibold rounded-lg transition-colors">
                <XCircle size={16} />Rejeter
              </button>
              <button onClick={handleApprove} disabled={!!actionLoading}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#1A5C2A] hover:bg-[#0F3D1A] text-white text-[14px] font-semibold rounded-lg transition-colors disabled:opacity-60">
                {actionLoading === "approve" ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={16} />}
                Approuver
              </button>
            </>
          )}
          {provider.status === "APPROVED" && !pendingAction && (
            <button onClick={() => { setPendingAction("suspend"); setError(""); }}
              className="flex items-center gap-2 px-4 py-2.5 bg-yellow-500 hover:bg-yellow-600 text-white text-[14px] font-semibold rounded-lg transition-colors">
              <PauseCircle size={16} />Suspendre
            </button>
          )}
        </div>
      </div>

      {/* Inline reason form */}
      {pendingAction && (
        <div className={`rounded-xl border p-5 mb-4 ${pendingAction === "reject" ? "bg-[#FFF5F2] border-[#F4521E]/20" : "bg-yellow-50 border-yellow-200"}`}>
          <p className="text-[14px] font-semibold text-[#1A1A1A] mb-1">
            {pendingAction === "reject" ? "Raison du rejet" : "Raison de la suspension"}
          </p>
          <p className="text-[13px] text-[#6B6B6B] mb-3">
            {pendingAction === "reject"
              ? "Cette raison sera envoyée par email au fournisseur."
              : "Usage interne uniquement."}
          </p>
          <textarea
            value={actionReason}
            onChange={e => setActionReason(e.target.value)}
            placeholder={pendingAction === "reject"
              ? "Documents d'identité manquants. Veuillez soumettre une pièce officielle valide."
              : "Signalements répétés sur la qualité des repas."}
            rows={3}
            className="w-full rounded-lg border border-[#E5E5E5] text-[14px] text-[#1A1A1A] px-4 py-3 outline-none focus:border-[#F4521E] focus:ring-2 focus:ring-[#F4521E]/10 resize-none transition-all bg-white"
          />
          {error && <p className="text-[13px] text-[#F4521E] mt-2">{error}</p>}
          <div className="flex gap-3 mt-4">
            <button onClick={cancelPendingAction}
              className="px-5 h-10 rounded-lg border border-[#E5E5E5] text-[14px] font-semibold text-[#6B6B6B] hover:text-[#1A1A1A] hover:border-[#1A1A1A] transition-colors">
              Annuler
            </button>
            <button
              onClick={pendingAction === "reject" ? handleReject : handleSuspend}
              disabled={!!actionLoading}
              className={`flex items-center gap-2 px-5 h-10 rounded-lg text-white text-[14px] font-semibold transition-colors disabled:opacity-60 ${pendingAction === "reject" ? "bg-[#F4521E] hover:bg-red-600" : "bg-yellow-500 hover:bg-yellow-600"}`}>
              {actionLoading ? <Loader2 size={14} className="animate-spin" /> : (pendingAction === "reject" ? <XCircle size={14} /> : <PauseCircle size={14} />)}
              {pendingAction === "reject" ? "Confirmer le rejet" : "Confirmer la suspension"}
            </button>
          </div>
        </div>
      )}

      {error && !pendingAction && (
        <p className="text-[13px] text-[#F4521E] bg-[#FFF5F2] border border-[#F4521E]/20 rounded-lg px-4 py-2.5 mb-4">{error}</p>
      )}

      <div className="space-y-4">
        <div className="bg-white rounded-xl border border-[#E5E5E5] p-6" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <h2 className="text-[18px] font-semibold text-[#1A1A1A] mb-4">Informations</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[13px] text-[#6B6B6B] mb-0.5">Adresse</p>
              <p className="text-[14px] text-[#1A1A1A] font-medium flex items-center gap-1.5">
                <MapPin size={14} className="text-[#1A5C2A]" />{provider.businessAddress ?? "Non renseigné"}
              </p>
            </div>
            <div>
              <p className="text-[13px] text-[#6B6B6B] mb-0.5">Ville</p>
              <p className="text-[14px] text-[#1A1A1A] font-medium">{provider.city?.name ?? "—"}</p>
            </div>
            <div>
              <p className="text-[13px] text-[#6B6B6B] mb-0.5">Pays</p>
              <p className="text-[14px] text-[#1A1A1A] font-medium">{provider.city?.country?.translations?.fr ?? "—"}</p>
            </div>
            <div>
              <p className="text-[13px] text-[#6B6B6B] mb-0.5">Propriétaire</p>
              <p className="text-[14px] text-[#1A1A1A] font-medium">{provider.user?.name ?? "—"}</p>
            </div>
            <div>
              <p className="text-[13px] text-[#6B6B6B] mb-0.5">Livraison / Retrait</p>
              <p className="text-[14px] text-[#1A1A1A] font-medium">
                {[provider.acceptsDelivery && "Livraison", provider.acceptsPickup && "Retrait"].filter(Boolean).join(" · ") || "—"}
              </p>
            </div>
            <div>
              <p className="text-[13px] text-[#6B6B6B] mb-0.5">Inscrit le</p>
              <p className="text-[14px] text-[#1A1A1A] font-medium">{new Date(provider.createdAt).toLocaleDateString("fr-FR")}</p>
            </div>
          </div>

          {provider.description && (
            <div className="mt-4 pt-4 border-t border-[#E5E5E5]">
              <p className="text-[13px] text-[#6B6B6B] mb-1">Description</p>
              <p className="text-[14px] text-[#1A1A1A]">{provider.description}</p>
            </div>
          )}
        </div>

        {provider.landmarks && provider.landmarks.length > 0 && (
          <div className="bg-white rounded-xl border border-[#E5E5E5] p-6" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <h2 className="text-[18px] font-semibold text-[#1A1A1A] mb-3">Landmarks couverts</h2>
            <div className="flex flex-wrap gap-2">
              {provider.landmarks.map((l) => (
                <span key={l.landmark.id} className="px-3 py-1 bg-[#EEF5F0] text-[#1A5C2A] text-[12px] font-semibold rounded-full">{l.landmark.name}</span>
              ))}
            </div>
          </div>
        )}

        {provider.deliveryZones && provider.deliveryZones.length > 0 && (
          <div className="bg-white rounded-xl border border-[#E5E5E5] p-6" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <h2 className="text-[18px] font-semibold text-[#1A1A1A] mb-3">Zones de livraison</h2>
            <div className="space-y-2">
              {provider.deliveryZones.map((z, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-[#E5E5E5] last:border-0">
                  <span className="text-[14px] text-[#1A1A1A]">{z.city} ({z.country})</span>
                  <span className="text-[14px] font-semibold text-[#F4521E]">{z.cost.toLocaleString("fr-FR")} FCFA</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
