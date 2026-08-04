"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Plus, Loader2, X } from "lucide-react";

interface Country { id: string; code: string; translations: { fr: string }; }
interface City { id: string; name: string; countryId: string; }
interface Landmark { id: string; name: string; cityId: string; isActive: boolean; cityName?: string; countryName?: string; }

export default function LandmarksPage() {
  const [landmarks, setLandmarks] = useState<Landmark[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [filterCityId, setFilterCityId] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ cityId: "", name: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: countriesRes } = await api.get("/countries");
      const allCountries: Country[] = countriesRes.data ?? [];

      // Fetch villes de chaque pays
      const cityResults = await Promise.allSettled(
        allCountries.map(c => api.get(`/countries/${c.code}/cities`))
      );
      const allCities: (City & { countryName: string })[] = [];
      cityResults.forEach((r, i) => {
        if (r.status === "fulfilled") {
          (r.value.data.data ?? []).forEach((city: City) =>
            allCities.push({ ...city, countryName: allCountries[i].translations.fr })
          );
        }
      });
      setCities(allCities);

      // Fetch landmarks de chaque ville
      const landmarkResults = await Promise.allSettled(
        allCities.map(c => api.get(`/cities/${c.id}/landmarks`))
      );
      const allLandmarks: Landmark[] = [];
      landmarkResults.forEach((r, i) => {
        if (r.status === "fulfilled") {
          (r.value.data.data ?? []).forEach((l: Landmark) =>
            allLandmarks.push({ ...l, cityName: allCities[i].name, countryName: allCities[i].countryName })
          );
        }
      });
      setLandmarks(allLandmarks);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = filterCityId ? landmarks.filter(l => l.cityId === filterCityId) : landmarks;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await api.post("/admin/landmarks", { name: form.name, cityId: form.cityId });
      setShowModal(false);
      setForm({ cityId: "", name: "" });
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
        <h1 className="text-2xl font-bold text-[#1A1A1A]">Landmarks</h1>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-[#1A5C2A] hover:bg-[#0F3D1A] text-white text-[14px] font-semibold px-4 py-2.5 rounded-lg transition-colors">
          <Plus size={16} />Ajouter un landmark
        </button>
      </div>

      <div className="mb-4">
        <select value={filterCityId} onChange={e => setFilterCityId(e.target.value)}
          className="h-9 px-3 rounded-lg border border-[#E5E5E5] text-[13px] text-[#1A1A1A] bg-white outline-none focus:border-[#1A5C2A]">
          <option value="">Toutes les villes</option>
          {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-[#E5E5E5] overflow-hidden" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#E5E5E5] bg-[#F7F7F7]">
              <th className="text-left text-[14px] font-semibold text-[#1A1A1A] px-5 py-3">Nom</th>
              <th className="text-left text-[14px] font-semibold text-[#1A1A1A] px-5 py-3">Ville</th>
              <th className="text-left text-[14px] font-semibold text-[#1A1A1A] px-5 py-3">Pays</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={3} className="px-5 py-10 text-center"><Loader2 size={20} className="animate-spin mx-auto text-[#6B6B6B]" /></td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={3} className="px-5 py-10 text-center text-[13px] text-[#6B6B6B]">Aucun landmark trouvé.</td></tr>
            ) : (
              filtered.map(l => (
                <tr key={l.id} className="border-b border-[#E5E5E5] last:border-0 hover:bg-[#F7F7F7] transition-colors">
                  <td className="px-5 py-3.5 text-[14px] font-semibold text-[#1A1A1A]">{l.name}</td>
                  <td className="px-5 py-3.5 text-[14px] text-[#6B6B6B]">{l.cityName ?? "—"}</td>
                  <td className="px-5 py-3.5 text-[14px] text-[#6B6B6B]">{l.countryName ?? "—"}</td>
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
              <h2 className="text-[18px] font-semibold text-[#1A1A1A]">Ajouter un landmark</h2>
              <button onClick={() => setShowModal(false)} className="text-[#6B6B6B] hover:text-[#1A1A1A]"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#1A1A1A] mb-1.5">Ville</label>
                <select value={form.cityId} onChange={e => setForm({ ...form, cityId: e.target.value })} required
                  className="w-full h-10 px-3 rounded-lg border border-[#E5E5E5] text-[14px] bg-white outline-none focus:border-[#1A5C2A] focus:ring-2 focus:ring-[#1A5C2A]/10">
                  <option value="">Sélectionner une ville</option>
                  {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#1A1A1A] mb-1.5">Nom du landmark</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="ex: Campus IUT Lokossa" required
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
