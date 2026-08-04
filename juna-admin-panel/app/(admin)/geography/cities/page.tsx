"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Plus, Loader2, X } from "lucide-react";

interface Country { id: string; code: string; translations: { fr: string; en: string }; }
interface City { id: string; name: string; countryId: string; isActive: boolean; }
interface CityWithCountry extends City { countryCode: string; countryName: string; }

export default function CitiesPage() {
  const [cities, setCities] = useState<CityWithCountry[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [filterCountryId, setFilterCountryId] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ countryId: "", name: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: countriesRes } = await api.get("/countries");
      const allCountries: Country[] = countriesRes.data ?? [];
      setCountries(allCountries);

      // Fetch villes de chaque pays en parallèle
      const results = await Promise.allSettled(
        allCountries.map((c) => api.get(`/countries/${c.code}/cities`))
      );

      const allCities: CityWithCountry[] = [];
      results.forEach((r, i) => {
        if (r.status === "fulfilled") {
          const citisList: City[] = r.value.data.data ?? [];
          citisList.forEach((city) => allCities.push({
            ...city,
            countryCode: allCountries[i].code,
            countryName: allCountries[i].translations.fr,
          }));
        }
      });
      setCities(allCities);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = filterCountryId ? cities.filter(c => c.countryId === filterCountryId) : cities;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await api.post("/admin/cities", { name: form.name, countryId: form.countryId });
      setShowModal(false);
      setForm({ countryId: "", name: "" });
      fetchData();
    } catch (err: unknown) {
      setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Erreur lors de la création.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#1A1A1A]">Villes</h1>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-[#1A5C2A] hover:bg-[#0F3D1A] text-white text-[14px] font-semibold px-4 py-2.5 rounded-lg transition-colors">
          <Plus size={16} />Ajouter une ville
        </button>
      </div>

      <div className="mb-4">
        <select value={filterCountryId} onChange={e => setFilterCountryId(e.target.value)}
          className="h-9 px-3 rounded-lg border border-[#E5E5E5] text-[13px] text-[#1A1A1A] bg-white outline-none focus:border-[#1A5C2A]">
          <option value="">Tous les pays</option>
          {countries.map(c => <option key={c.id} value={c.id}>{c.translations.fr}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-[#E5E5E5] overflow-hidden" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#E5E5E5] bg-[#F7F7F7]">
              <th className="text-left text-[14px] font-semibold text-[#1A1A1A] px-5 py-3">Nom</th>
              <th className="text-left text-[14px] font-semibold text-[#1A1A1A] px-5 py-3">Pays</th>
              <th className="text-left text-[14px] font-semibold text-[#1A1A1A] px-5 py-3">Statut</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={3} className="px-5 py-10 text-center"><Loader2 size={20} className="animate-spin mx-auto text-[#6B6B6B]" /></td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={3} className="px-5 py-10 text-center text-[13px] text-[#6B6B6B]">Aucune ville trouvée.</td></tr>
            ) : (
              filtered.map(c => (
                <tr key={c.id} className="border-b border-[#E5E5E5] last:border-0 hover:bg-[#F7F7F7] transition-colors">
                  <td className="px-5 py-3.5 text-[14px] font-semibold text-[#1A1A1A]">{c.name}</td>
                  <td className="px-5 py-3.5 text-[14px] text-[#6B6B6B]">{c.countryName}</td>
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
              <h2 className="text-[18px] font-semibold text-[#1A1A1A]">Ajouter une ville</h2>
              <button onClick={() => setShowModal(false)} className="text-[#6B6B6B] hover:text-[#1A1A1A]"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#1A1A1A] mb-1.5">Pays</label>
                <select value={form.countryId} onChange={e => setForm({ ...form, countryId: e.target.value })} required
                  className="w-full h-10 px-3 rounded-lg border border-[#E5E5E5] text-[14px] bg-white outline-none focus:border-[#1A5C2A] focus:ring-2 focus:ring-[#1A5C2A]/10">
                  <option value="">Sélectionner un pays</option>
                  {countries.map(c => <option key={c.id} value={c.id}>{c.translations.fr}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#1A1A1A] mb-1.5">Nom de la ville</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="ex: Cotonou" required
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
