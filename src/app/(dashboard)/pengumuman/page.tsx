"use client";

import React, { useState, useEffect } from "react";

export default function PengumumanPage() {
  const [listPengumuman, setListPengumuman] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openForm, setOpenForm] = useState(false);
  const [userRole, setUserRole] = useState("WARGA");

  const [formData, setFormData] = useState({
    judul: "",
    konten: "",
    isPinned: false
  });

  useEffect(() => {
    fetchPengumuman();
    fetchRole();
  }, []);

  const fetchRole = async () => {
    try {
      const res = await fetch("/api/rt/profile");
      const json = await res.json();
      if (json.role) setUserRole(json.role);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchPengumuman = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/pengumuman");
      const json = await res.json();
      if (json.data) setListPengumuman(json.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/pengumuman", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        alert("Pengumuman berhasil disebarkan");
        setFormData({ judul: "", konten: "", isPinned: false });
        setOpenForm(false);
        fetchPengumuman();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Mading & Pengumuman RT</h1>
        {userRole === "KETUA_RT" && (
          <button onClick={() => setOpenForm(!openForm)} className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-semibold shadow hover:bg-blue-700">
            + Sebarkan Pengumuman
          </button>
        )}
      </div>

      {openForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded border shadow-sm space-y-4">
          <h2 className="text-lg font-bold">Buat Pengumuman Baru</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Judul Informasi</label>
              <input type="text" className="border w-full p-2 rounded" value={formData.judul} onChange={(e) => setFormData({...formData, judul: e.target.value})} required placeholder="Contoh: Kerja Bakti Bululawang" />
            </div>
            <div>
              <label className="block text-sm font-medium">Konten / Isi Informasi</label>
              <textarea rows={6} className="border w-full p-2 rounded" value={formData.konten} onChange={(e) => setFormData({...formData, konten: e.target.value})} required />
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="isPinned" checked={formData.isPinned} onChange={(e) => setFormData({...formData, isPinned: e.target.checked})} className="w-4 h-4 rounded text-blue-600" />
              <label htmlFor="isPinned" className="text-sm font-medium text-amber-700">Pin di bagian paling atas mading</label>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setOpenForm(false)} className="px-4 py-2 border rounded">Batal</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded font-bold shadow hover:bg-blue-700" disabled={isSubmitting}>
              {isSubmitting ? "Mengirim..." : "Sebarkan Link"}
            </button>
          </div>
        </form>
      )}

      {/* FEED PENGUMUMAN */}
      <div className="space-y-4">
        {isLoading ? (
          <p>Loading pengumuman...</p>
        ) : listPengumuman.length > 0 ? (
          listPengumuman.map((info: any) => (
            <div key={info.id} className={`bg-white p-6 rounded-xl border shadow-sm relative ${info.isPinned ? "border-amber-400 bg-amber-50/20" : ""}`}>
              {info.isPinned && (
                <span className="absolute top-4 right-4 bg-amber-100 text-amber-800 text-[10px] uppercase font-black px-2 py-0.5 rounded">
                  📌 Pinned Information
                </span>
              )}
              <h3 className="font-bold text-lg mb-2 text-slate-800">{info.judul}</h3>
              <p className="text-slate-600 text-sm whitespace-pre-line mb-4 font-normal leading-relaxed">{info.konten}</p>

              <div className="text-xs text-slate-400 mt-2 border-t pt-3 flex justify-between">
                <span>Dibuat: {new Date(info.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white p-8 text-center text-slate-400 border rounded">Belum ada pengumuman hari ini.</div>
        )}
      </div>
    </div>
  );
}