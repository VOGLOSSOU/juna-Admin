"use client";

import { useState } from "react";
import Image from "next/image";
import { useAuth } from "@/contexts/auth-context";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Email ou mot de passe incorrect.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F7F7]">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-sm border border-[#E5E5E5] p-10">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <Image
              src="/juna-logo.png"
              alt="JUNA"
              width={100}
              height={100}
              className="object-contain"
              priority
            />
          </div>

          <h1 className="text-2xl font-bold text-[#1A1A1A] mb-1 text-center">
            Administration
          </h1>
          <p className="text-[13px] text-[#6B6B6B] text-center mb-8">
            Connectez-vous à votre espace admin
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-[#1A1A1A] mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@juna.app"
                required
                className="w-full h-11 px-4 rounded-lg border border-[#E5E5E5] bg-white text-[14px] text-[#1A1A1A] outline-none focus:border-[#1A5C2A] focus:ring-2 focus:ring-[#1A5C2A]/10 transition-all placeholder:text-[#6B6B6B]"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1A1A1A] mb-1.5">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full h-11 px-4 pr-11 rounded-lg border border-[#E5E5E5] bg-white text-[14px] text-[#1A1A1A] outline-none focus:border-[#1A5C2A] focus:ring-2 focus:ring-[#1A5C2A]/10 transition-all placeholder:text-[#6B6B6B]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-[13px] text-[#F4521E] bg-[#FFF5F2] border border-[#F4521E]/20 rounded-lg px-4 py-2.5">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-[#1A5C2A] hover:bg-[#0F3D1A] text-white font-semibold text-[14px] rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              Se connecter
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
