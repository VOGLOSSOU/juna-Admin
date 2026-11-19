"use client";

import Image from "next/image";
import { useAuth } from "@/contexts/auth-context";
import { useSidebar } from "@/contexts/sidebar-context";
import { LogOut, User } from "lucide-react";

export default function Header() {
  const { admin, logout } = useAuth();
  const { collapsed } = useSidebar();

  return (
    <header
      className={`h-16 bg-white border-b border-[#E5E5E5] fixed top-0 right-0 z-20 flex items-center justify-between px-6 shadow-sm transition-[left] duration-200 ${collapsed ? "left-16" : "left-64"}`}
    >
      <Image
        src="/juna-logo.png"
        alt="JUNA"
        width={44}
        height={44}
        className="object-contain"
      />

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-[14px] text-[#1A1A1A]">
          <div className="w-8 h-8 rounded-full bg-[#EEF5F0] flex items-center justify-center">
            <User size={16} className="text-[#1A5C2A]" />
          </div>
          <span className="font-semibold">{admin?.name ?? admin?.email ?? "Admin"}</span>
        </div>

        <div className="w-px h-5 bg-[#E5E5E5]" />

        <button
          onClick={logout}
          className="flex items-center gap-2 text-[13px] text-[#6B6B6B] hover:text-[#F4521E] transition-colors font-medium"
        >
          <LogOut size={15} />
          Déconnexion
        </button>
      </div>
    </header>
  );
}
