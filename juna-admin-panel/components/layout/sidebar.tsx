"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Globe,
  Store,
  Package,
  Users,
  ClipboardList,
  Star,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import api from "@/lib/api";

interface NavItem {
  label: string;
  href?: string;
  icon: React.ReactNode;
  badgeKey?: "orders" | "reviews";
  children?: { label: string; href: string }[];
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: <LayoutDashboard size={18} /> },
  {
    label: "Géographie",
    icon: <Globe size={18} />,
    children: [
      { label: "Pays", href: "/geography/countries" },
      { label: "Villes", href: "/geography/cities" },
      { label: "Landmarks", href: "/geography/landmarks" },
    ],
  },
  {
    label: "Fournisseurs",
    icon: <Store size={18} />,
    children: [
      { label: "Liste des fournisseurs", href: "/providers" },
      { label: "Demandes en attente", href: "/providers/pending" },
    ],
  },
  { label: "Abonnements", href: "/subscriptions", icon: <Package size={18} /> },
  { label: "Utilisateurs", href: "/users", icon: <Users size={18} /> },
  { label: "Commandes", href: "/orders", icon: <ClipboardList size={18} />, badgeKey: "orders" },
  { label: "Avis", href: "/reviews", icon: <Star size={18} />, badgeKey: "reviews" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [openGroups, setOpenGroups] = useState<string[]>(["Géographie", "Fournisseurs"]);
  const [badges, setBadges] = useState<Record<string, number>>({ orders: 0, reviews: 0 });

  useEffect(() => {
    Promise.allSettled([
      api.get("/orders/pending/count"),
      api.get("/reviews/pending/count"),
    ]).then(([ordersRes, reviewsRes]) => {
      setBadges({
        orders: ordersRes.status === "fulfilled" ? (ordersRes.value.data.data?.pendingCount ?? 0) : 0,
        reviews: reviewsRes.status === "fulfilled" ? (reviewsRes.value.data.data?.pendingCount ?? 0) : 0,
      });
    });
  }, []);

  const toggleGroup = (label: string) => {
    setOpenGroups((prev) =>
      prev.includes(label) ? prev.filter((g) => g !== label) : [...prev, label]
    );
  };

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <aside className="w-64 h-screen flex flex-col bg-[#0F3D1A] fixed left-0 top-0 z-30">
      {/* Logo */}
      <div className="h-16 flex items-center px-5 border-b border-white/10">
        <div className="bg-white rounded-lg p-1.5 inline-flex items-center justify-center">
          <Image
            src="/juna-logo.png"
            alt="JUNA"
            width={36}
            height={36}
            className="object-contain"
            priority
          />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {navItems.map((item) => {
          if (item.children) {
            const isOpen = openGroups.includes(item.label);
            const hasActiveChild = item.children.some((c) => isActive(c.href));

            return (
              <div key={item.label} className="mb-1">
                <button
                  onClick={() => toggleGroup(item.label)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] font-semibold transition-colors",
                    hasActiveChild
                      ? "text-white bg-[#1A5C2A]"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  )}
                >
                  <span className="shrink-0">{item.icon}</span>
                  <span className="flex-1 text-left">{item.label}</span>
                  {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </button>

                {isOpen && (
                  <div className="mt-1 ml-4 pl-4 border-l border-white/10 space-y-0.5">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={cn(
                          "flex items-center px-3 py-2 rounded-lg text-[13px] transition-colors",
                          isActive(child.href)
                            ? "text-white bg-[#1A5C2A] font-semibold"
                            : "text-white/60 hover:text-white hover:bg-white/5"
                        )}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          const badgeCount = item.badgeKey ? badges[item.badgeKey] : 0;

          return (
            <Link
              key={item.href}
              href={item.href!}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] font-semibold transition-colors mb-1",
                isActive(item.href!)
                  ? "text-white bg-[#1A5C2A]"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              )}
            >
              <span className="shrink-0">{item.icon}</span>
              <span className="flex-1">{item.label}</span>
              {badgeCount > 0 && (
                <span className="bg-[#F4521E] text-white text-[11px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-tight">
                  {badgeCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
