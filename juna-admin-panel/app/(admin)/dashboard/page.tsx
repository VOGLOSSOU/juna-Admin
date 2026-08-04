"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Store, Users, Package, ClipboardList, Clock, CheckCircle, TrendingUp } from "lucide-react";

interface Overview {
  totalUsers: number;
  totalProviders: number;
  pendingProviders: number;
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  totalRevenue: number;
}

interface PeriodStats {
  period: string;
  newUsers: number;
  newProviders: number;
  newOrders: number;
  revenue: number;
}

type Period = "day" | "week" | "month";
const PERIOD_LABELS: Record<Period, string> = {
  day: "Aujourd'hui",
  week: "Cette semaine",
  month: "Ce mois",
};

export default function DashboardPage() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [activeSubscribersCount, setActiveSubscribersCount] = useState<number | null>(null);
  const [periodStats, setPeriodStats] = useState<PeriodStats | null>(null);
  const [period, setPeriod] = useState<Period>("week");
  const [loading, setLoading] = useState(true);
  const [periodLoading, setPeriodLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      api.get("/admin/dashboard"),
      api.get("/active-subscriptions/stats"),
    ]).then(([dashRes, statsRes]) => {
      if (dashRes.status === "fulfilled") setOverview(dashRes.value.data.data.overview);
      if (statsRes.status === "fulfilled") setActiveSubscribersCount(statsRes.value.data.data?.activeSubscriptionsCount ?? null);
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setPeriodLoading(true);
    api.get("/admin/dashboard/stats", { params: { period } })
      .then(({ data }) => setPeriodStats(data.data))
      .catch(() => setPeriodStats(null))
      .finally(() => setPeriodLoading(false));
  }, [period]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#1A1A1A] mb-6">Dashboard</h1>

      {/* KPIs globaux */}
      {loading ? (
        <div className="grid grid-cols-3 gap-4 mb-8">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-[#E5E5E5] p-5 h-24 animate-pulse" />
          ))}
        </div>
      ) : overview && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Utilisateurs inscrits", value: overview.totalUsers, icon: <Users size={20} />, color: "text-[#1A5C2A]", bg: "bg-[#EEF5F0]" },
            { label: "Fournisseurs", value: overview.totalProviders, icon: <Store size={20} />, color: "text-[#1A5C2A]", bg: "bg-[#EEF5F0]" },
            { label: "En attente d'approbation", value: overview.pendingProviders, icon: <Clock size={20} />, color: "text-[#F4521E]", bg: "bg-[#FFF5F2]" },
            { label: "Commandes totales", value: overview.totalOrders, icon: <ClipboardList size={20} />, color: "text-[#1A5C2A]", bg: "bg-[#EEF5F0]" },
            { label: "Commandes en attente", value: overview.pendingOrders, icon: <Clock size={20} />, color: "text-[#F4521E]", bg: "bg-[#FFF5F2]" },
            { label: "Commandes complétées", value: overview.completedOrders, icon: <CheckCircle size={20} />, color: "text-[#1A5C2A]", bg: "bg-[#EEF5F0]" },
            {
              label: "Abonnés actifs",
              value: activeSubscribersCount != null ? activeSubscribersCount : "—",
              icon: <Package size={20} />,
              color: "text-[#1A5C2A]",
              bg: "bg-[#EEF5F0]",
            },
            {
              label: "Revenus totaux",
              value: `${overview.totalRevenue.toLocaleString("fr-FR")} FCFA`,
              icon: <TrendingUp size={20} />,
              color: "text-[#F4521E]",
              bg: "bg-[#FFF5F2]",
            },
          ].map((card) => (
            <div
              key={card.label}
              className="bg-white rounded-xl border border-[#E5E5E5] p-5 flex items-center gap-4"
              style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
            >
              <div className={`w-11 h-11 rounded-xl ${card.bg} flex items-center justify-center shrink-0 ${card.color}`}>
                {card.icon}
              </div>
              <div>
                <p className="text-[13px] text-[#6B6B6B]">{card.label}</p>
                <p className="text-2xl font-bold text-[#1A1A1A]">{card.value}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats par période */}
      <div className="bg-white rounded-xl border border-[#E5E5E5] p-6" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[18px] font-semibold text-[#1A1A1A]">Activité récente</h2>
          <div className="flex gap-2">
            {(["day", "week", "month"] as Period[]).map(p => (
              <button key={p} onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-lg text-[13px] font-semibold transition-colors ${period === p ? "bg-[#1A5C2A] text-white" : "bg-[#F7F7F7] text-[#6B6B6B] hover:text-[#1A1A1A]"}`}>
                {PERIOD_LABELS[p]}
              </button>
            ))}
          </div>
        </div>

        {periodLoading ? (
          <div className="grid grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-20 rounded-xl bg-[#F7F7F7] animate-pulse" />
            ))}
          </div>
        ) : periodStats ? (
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: "Nouveaux utilisateurs", value: periodStats.newUsers, color: "text-[#1A5C2A]" },
              { label: "Nouveaux fournisseurs", value: periodStats.newProviders, color: "text-[#1A5C2A]" },
              { label: "Nouvelles commandes", value: periodStats.newOrders, color: "text-[#1A5C2A]" },
              { label: "Revenus", value: `${periodStats.revenue.toLocaleString("fr-FR")} FCFA`, color: "text-[#F4521E]" },
            ].map(stat => (
              <div key={stat.label} className="bg-[#F7F7F7] rounded-xl p-4">
                <p className="text-[12px] text-[#6B6B6B] mb-1">{stat.label}</p>
                <p className={`text-[22px] font-bold ${stat.color}`}>{stat.value}</p>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
