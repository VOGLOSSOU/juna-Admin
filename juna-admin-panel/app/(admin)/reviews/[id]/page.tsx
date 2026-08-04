"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { ArrowLeft, Loader2, Star, CheckCircle, XCircle } from "lucide-react";

interface Review {
  id: string;
  rating: number;
  comment: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  moderatedAt: string | null;
  moderatedBy: string | null;
  createdAt: string;
  user: { id: string; name: string };
  subscription: {
    id: string;
    name: string;
    provider: { id: string; businessName: string };
  };
  order: { id: string; orderNumber: string };
}

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-orange-50 text-orange-600",
  APPROVED: "bg-[#EEF5F0] text-[#1A5C2A]",
  REJECTED: "bg-red-50 text-red-500",
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: "En attente",
  APPROVED: "Approuvé",
  REJECTED: "Rejeté",
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={18}
          className={i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200 fill-gray-200"}
        />
      ))}
      <span className="text-[15px] font-semibold text-[#1A1A1A] ml-1">{rating}/5</span>
    </div>
  );
}

function extractError(err: unknown): string {
  const msg = (err as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message;
  return Array.isArray(msg) ? msg.join(" ") : (msg ?? "Une erreur est survenue.");
}

export default function ReviewDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [review, setReview] = useState<Review | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<"approve" | "reject" | null>(null);
  const [error, setError] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    api.get(`/reviews/${id}`)
      .then(({ data }) => setReview(data.data))
      .finally(() => setLoading(false));
  }, [id]);

  const handleApprove = async () => {
    setActionLoading("approve");
    setError("");
    try {
      await api.put(`/reviews/${id}/moderate`, { status: "APPROVED" });
      setReview(prev => prev ? { ...prev, status: "APPROVED", moderatedAt: new Date().toISOString() } : prev);
    } catch (err) {
      setError(extractError(err));
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    setActionLoading("reject");
    setError("");
    try {
      await api.put(`/reviews/${id}/moderate`, { status: "REJECTED", reason: rejectReason });
      setReview(prev => prev ? { ...prev, status: "REJECTED", moderatedAt: new Date().toISOString() } : prev);
      setShowRejectForm(false);
    } catch (err) {
      setError(extractError(err));
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 size={28} className="animate-spin text-[#1A5C2A]" />
    </div>
  );

  if (!review) return <p className="text-[#6B6B6B] text-center py-20">Avis introuvable.</p>;

  return (
    <div className="max-w-2xl">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-[13px] text-[#6B6B6B] hover:text-[#1A1A1A] mb-6 transition-colors">
        <ArrowLeft size={16} />Retour
      </button>

      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A] mb-1">Avis de {review.user.name}</h1>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-semibold ${STATUS_STYLES[review.status]}`}>
            {STATUS_LABELS[review.status]}
          </span>
        </div>

        {review.status === "PENDING" && !showRejectForm && (
          <div className="flex gap-3">
            <button onClick={() => setShowRejectForm(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#F4521E] hover:bg-red-600 text-white text-[14px] font-semibold rounded-lg transition-colors">
              <XCircle size={16} />Rejeter
            </button>
            <button onClick={handleApprove} disabled={!!actionLoading}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#1A5C2A] hover:bg-[#0F3D1A] text-white text-[14px] font-semibold rounded-lg transition-colors disabled:opacity-60">
              {actionLoading === "approve" ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={16} />}
              Approuver
            </button>
          </div>
        )}
      </div>

      {showRejectForm && (
        <div className="rounded-xl border bg-[#FFF5F2] border-[#F4521E]/20 p-5 mb-4">
          <p className="text-[14px] font-semibold text-[#1A1A1A] mb-1">Raison du rejet</p>
          <p className="text-[13px] text-[#6B6B6B] mb-3">Optionnel — usage interne.</p>
          <textarea
            value={rejectReason}
            onChange={e => setRejectReason(e.target.value)}
            placeholder="Contenu inapproprié, langage offensant..."
            rows={3}
            className="w-full rounded-lg border border-[#E5E5E5] text-[14px] text-[#1A1A1A] px-4 py-3 outline-none focus:border-[#F4521E] focus:ring-2 focus:ring-[#F4521E]/10 resize-none transition-all bg-white"
          />
          {error && <p className="text-[13px] text-[#F4521E] mt-2">{error}</p>}
          <div className="flex gap-3 mt-4">
            <button onClick={() => { setShowRejectForm(false); setRejectReason(""); setError(""); }}
              className="px-5 h-10 rounded-lg border border-[#E5E5E5] text-[14px] font-semibold text-[#6B6B6B] hover:text-[#1A1A1A] hover:border-[#1A1A1A] transition-colors">
              Annuler
            </button>
            <button onClick={handleReject} disabled={!!actionLoading}
              className="flex items-center gap-2 px-5 h-10 rounded-lg bg-[#F4521E] hover:bg-red-600 text-white text-[14px] font-semibold transition-colors disabled:opacity-60">
              {actionLoading === "reject" ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
              Confirmer le rejet
            </button>
          </div>
        </div>
      )}

      {error && !showRejectForm && (
        <p className="text-[13px] text-[#F4521E] bg-[#FFF5F2] border border-[#F4521E]/20 rounded-lg px-4 py-2.5 mb-4">{error}</p>
      )}

      <div className="space-y-4">
        <div className="bg-white rounded-xl border border-[#E5E5E5] p-6" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <h2 className="text-[18px] font-semibold text-[#1A1A1A] mb-4">Contenu de l&apos;avis</h2>
          <div className="mb-4">
            <StarRating rating={review.rating} />
          </div>
          <p className="text-[15px] text-[#1A1A1A] leading-relaxed bg-[#F7F7F7] rounded-xl p-4">{review.comment}</p>
        </div>

        <div className="bg-white rounded-xl border border-[#E5E5E5] p-6" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <h2 className="text-[18px] font-semibold text-[#1A1A1A] mb-4">Informations</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[13px] text-[#6B6B6B] mb-0.5">Auteur</p>
              <p className="text-[14px] text-[#1A1A1A] font-medium">{review.user.name}</p>
            </div>
            <div>
              <p className="text-[13px] text-[#6B6B6B] mb-0.5">Abonnement</p>
              <p className="text-[14px] text-[#1A1A1A] font-medium">{review.subscription.name}</p>
            </div>
            <div>
              <p className="text-[13px] text-[#6B6B6B] mb-0.5">Fournisseur</p>
              <p className="text-[14px] text-[#1A1A1A] font-medium">{review.subscription.provider.businessName}</p>
            </div>
            <div>
              <p className="text-[13px] text-[#6B6B6B] mb-0.5">Commande</p>
              <p className="text-[14px] text-[#1A1A1A] font-mono font-medium">{review.order.orderNumber}</p>
            </div>
            <div>
              <p className="text-[13px] text-[#6B6B6B] mb-0.5">Posté le</p>
              <p className="text-[14px] text-[#1A1A1A] font-medium">{new Date(review.createdAt).toLocaleDateString("fr-FR")}</p>
            </div>
            {review.moderatedAt && (
              <div>
                <p className="text-[13px] text-[#6B6B6B] mb-0.5">Modéré le</p>
                <p className="text-[14px] text-[#1A1A1A] font-medium">{new Date(review.moderatedAt).toLocaleDateString("fr-FR")}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
