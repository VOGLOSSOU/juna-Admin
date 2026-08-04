"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Plus, Loader2, X } from "lucide-react";

interface Country {
  id: string;
  code: string;
  translations: { fr: string; en: string };
  isActive: boolean;
}

export default function CountriesPage() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ code: "", fr: "", en: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchCountries = async () => {
    try {
      const { data } = await api.get("/countries");
      setCountries(data.data ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCountries(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await api.post("/admin/countries", {
        code: form.code,
        translations: { fr: form.fr, en: form.en },
      });
      setShowModal(false);
      setForm({ code: "", fr: "", en: "" });
      fetchCountries();
    } catch (err: unknown) {
      setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Erreur lors de la création.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#1A1A1A]">Pays</h1>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-[#1A5C2A] hover:bg-[#0F3D1A] text-white text-[14px] font-semibold px-4 py-2.5 rounded-lg transition-colors">
          <Plus size={16} />Ajouter un pays
        </button>
      </div>

      <div className="bg-white rounded-xl border border-[#E5E5E5] overflow-hidden" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#E5E5E5] bg-[#F7F7F7]">
              <th className="text-left text-[14px] font-semibold text-[#1A1A1A] px-5 py-3">Code</th>
              <th className="text-left text-[14px] font-semibold text-[#1A1A1A] px-5 py-3">Nom (FR)</th>
              <th className="text-left text-[14px] font-semibold text-[#1A1A1A] px-5 py-3">Nom (EN)</th>
              <th className="text-left text-[14px] font-semibold text-[#1A1A1A] px-5 py-3">Statut</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="px-5 py-10 text-center"><Loader2 size={20} className="animate-spin mx-auto text-[#6B6B6B]" /></td></tr>
            ) : countries.length === 0 ? (
              <tr><td colSpan={4} className="px-5 py-10 text-center text-[13px] text-[#6B6B6B]">Aucun pays enregistré.</td></tr>
            ) : (
              countries.map((c) => (
                <tr key={c.id} className="border-b border-[#E5E5E5] last:border-0 hover:bg-[#F7F7F7] transition-colors">
                  <td className="px-5 py-3.5 text-[14px] font-semibold text-[#1A5C2A]">{c.code}</td>
                  <td className="px-5 py-3.5 text-[14px] text-[#1A1A1A]">{c.translations.fr}</td>
                  <td className="px-5 py-3.5 text-[14px] text-[#6B6B6B]">{c.translations.en}</td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-semibold ${c.isActive ? "bg-[#EEF5F0] text-[#1A5C2A]" : "bg-gray-100 text-gray-500"}`}>
                      {c.isActive ? "Actif" : "Inactif"}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[18px] font-semibold text-[#1A1A1A]">Ajouter un pays</h2>
              <button onClick={() => setShowModal(false)} className="text-[#6B6B6B] hover:text-[#1A1A1A]"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#1A1A1A] mb-1.5">Code pays</label>
                <input value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  placeholder="ex: BJ" required maxLength={3}
                  className="w-full h-10 px-3 rounded-lg border border-[#E5E5E5] text-[14px] outline-none focus:border-[#1A5C2A] focus:ring-2 focus:ring-[#1A5C2A]/10" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#1A1A1A] mb-1.5">Nom en français</label>
                <input value={form.fr} onChange={e => setForm({ ...form, fr: e.target.value })}
                  placeholder="ex: Bénin" required
                  className="w-full h-10 px-3 rounded-lg border border-[#E5E5E5] text-[14px] outline-none focus:border-[#1A5C2A] focus:ring-2 focus:ring-[#1A5C2A]/10" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#1A1A1A] mb-1.5">Nom en anglais</label>
                <input value={form.en} onChange={e => setForm({ ...form, en: e.target.value })}
                  placeholder="ex: Benin" required
                  className="w-full h-10 px-3 rounded-lg border border-[#E5E5E5] text-[14px] outline-none focus:border-[#1A5C2A] focus:ring-2 focus:ring-[#1A5C2A]/10" />
              </div>
              {error && <p className="text-[13px] text-[#F4521E] bg-[#FFF5F2] border border-[#F4521E]/20 rounded-lg px-3 py-2">{error}</p>}
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 h-10 border border-[#E5E5E5] rounded-lg text-[14px] font-semibold text-[#6B6B6B] hover:bg-[#F7F7F7] transition-colors">Annuler</button>
                <button type="submit" disabled={saving} className="flex-1 h-10 bg-[#1A5C2A] hover:bg-[#0F3D1A] text-white rounded-lg text-[14px] font-semibold flex items-center justify-center gap-2 disabled:opacity-60 transition-colors">
                  {saving && <Loader2 size={14} className="animate-spin" />}Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
