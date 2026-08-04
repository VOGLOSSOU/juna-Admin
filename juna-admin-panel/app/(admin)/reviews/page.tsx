"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { Loader2, Star, CheckCircle, Eye } from "lucide-react";

interface Review {
  id: string;
  rating: number;
  comment: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  moderatedAt: string | null;
  createdAt: string;
  user: { id: string; name: string };
  subscription: {
    id: string;
    name: string;
    provider: { id: string; businessName: string };
  };
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
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={13}
          className={i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200 fill-gray-200"}
        />
      ))}
    </div>
  );
}

function extractError(err: unknown): string {
  const msg = (err as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message;
  return Array.isArray(msg) ? msg.join(" ") : (msg ?? "Une erreur est survenue.");
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("PENDING");
  const [approveLoading, setApproveLoading] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (statusFilter) params.status = statusFilter;

    api.get("/reviews", { params })
      .then(({ data }) => setReviews(data.data ?? []))
      .finally(() => setLoading(false));
  }, [statusFilter]);

  const handleApprove = async (reviewId: string) => {
    setApproveLoading(reviewId);
    try {
      await api.put(`/reviews/${reviewId}/moderate`, { status: "APPROVED" });
      setReviews(prev => prev.map(r =>
        r.id === reviewId ? { ...r, status: "APPROVED", moderatedAt: new Date().toISOString() } : r
      ));
    } catch (err) {
      console.error(extractError(err));
    } finally {
      setApproveLoading(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#1A1A1A]">Avis</h1>
        <span className="text-[13px] text-[#6B6B6B]">{reviews.length} avis</span>
      </div>

      <div className="flex gap-2 mb-5">
        {[["PENDING", "En attente"], ["APPROVED", "Approuvés"], ["REJECTED", "Rejetés"], ["", "Tous"]].map(([val, label]) => (
          <button key={val} onClick={() => setStatusFilter(val)}
            className={`px-4 py-1.5 rounded-full text-[13px] font-semibold transition-colors ${
              statusFilter === val
                ? val === "REJECTED" ? "bg-[#F4521E] text-white" : "bg-[#1A5C2A] text-white"
                : "bg-white border border-[#E5E5E5] text-[#6B6B6B] hover:border-[#1A5C2A] hover:text-[#1A5C2A]"
            }`}>
            {label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-[#E5E5E5] overflow-hidden" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#E5E5E5] bg-[#F7F7F7]">
              <th className="text-left text-[13px] font-semibold text-[#1A1A1A] px-5 py-3">Auteur</th>
              <th className="text-left text-[13px] font-semibold text-[#1A1A1A] px-5 py-3">Abonnement</th>
              <th className="text-left text-[13px] font-semibold text-[#1A1A1A] px-5 py-3">Fournisseur</th>
              <th className="text-left text-[13px] font-semibold text-[#1A1A1A] px-5 py-3">Note</th>
              <th className="text-left text-[13px] font-semibold text-[#1A1A1A] px-5 py-3">Commentaire</th>
              <th className="text-left text-[13px] font-semibold text-[#1A1A1A] px-5 py-3">Statut</th>
              <th className="text-left text-[13px] font-semibold text-[#1A1A1A] px-5 py-3">Date</th>
              <th className="text-left text-[13px] font-semibold text-[#1A1A1A] px-5 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="px-5 py-10 text-center"><Loader2 size={20} className="animate-spin mx-auto text-[#6B6B6B]" /></td></tr>
            ) : reviews.length === 0 ? (
              <tr><td colSpan={8} className="px-5 py-10 text-center text-[13px] text-[#6B6B6B]">Aucun avis trouvé.</td></tr>
            ) : (
              reviews.map(r => (
                <tr key={r.id} className="border-b border-[#E5E5E5] last:border-0 hover:bg-[#F7F7F7] transition-colors">
                  <td className="px-5 py-3.5 text-[14px] font-semibold text-[#1A1A1A]">{r.user.name}</td>
                  <td className="px-5 py-3.5 text-[13px] text-[#6B6B6B]">{r.subscription.name}</td>
                  <td className="px-5 py-3.5 text-[13px] text-[#6B6B6B]">{r.subscription.provider.businessName}</td>
                  <td className="px-5 py-3.5"><StarRating rating={r.rating} /></td>
                  <td className="px-5 py-3.5 text-[13px] text-[#6B6B6B] max-w-[200px]">
                    <span className="line-clamp-2">{r.comment}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-semibold ${STATUS_STYLES[r.status]}`}>
                      {STATUS_LABELS[r.status]}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-[13px] text-[#6B6B6B]">{new Date(r.createdAt).toLocaleDateString("fr-FR")}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      {r.status === "PENDING" && (
                        <button
                          onClick={() => handleApprove(r.id)}
                          disabled={approveLoading === r.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold text-[#1A5C2A] bg-[#EEF5F0] hover:bg-green-100 transition-colors disabled:opacity-60"
                        >
                          {approveLoading === r.id ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle size={12} />}
                          Approuver
                        </button>
                      )}
                      <Link
                        href={`/reviews/${r.id}`}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold text-[#6B6B6B] bg-[#F7F7F7] hover:bg-[#E5E5E5] transition-colors"
                      >
                        <Eye size={12} />Voir
                      </Link>
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
