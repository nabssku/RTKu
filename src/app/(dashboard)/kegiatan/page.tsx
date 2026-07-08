"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Calendar, Plus, MapPin, Clock, Users, CheckCircle, HelpCircle, XCircle } from "lucide-react";

export default function KegiatanPage() {
  const [listKegiatan, setListKegiatan] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openForm, setOpenForm] = useState(false);
  const [userRole, setUserRole] = useState("WARGA");

  const [formData, setFormData] = useState({
    judul: "",
    deskripsi: "",
    tanggal: "",
    waktu: "",
    lokasi: ""
  });

  useEffect(() => {
    fetchKegiatan();
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

  const fetchKegiatan = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/kegiatan");
      const json = await res.json();
      if (json.data) setListKegiatan(json.data);
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
      const res = await fetch("/api/kegiatan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        alert("Agenda kegiatan RT baru berhasil dijadwalkan.");
        setFormData({ judul: "", deskripsi: "", tanggal: "", waktu: "", lokasi: "" });
        setOpenForm(false);
        fetchKegiatan();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-3xl font-black bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent dark:from-white dark:to-slate-400">
            Agenda Kegiatan & Rapat
          </h1>
          <p className="text-slate-500 text-sm mt-1">Jadwalkan rapat warga, kerja bakti, peringatan hari besar, serta kelola konfirmasi kehadiran warga (RSVP).</p>
        </div>
        {userRole === "KETUA_RT" && (
          <button
            onClick={() => setOpenForm(!openForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs md:text-sm px-4 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Buat Kegiatan Baru
          </button>
        )}
      </div>

      {/* FORM INPUT KEGIATAN */}
      {openForm && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-950 p-6 md:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Plus className="w-5 h-5 text-blue-500" />
            Jadwalkan Agenda RT Baru
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Judul Kegiatan / Acara</label>
              <input
                type="text"
                required
                placeholder="Misal: Rapat Kerja Bakti Bulanan, Perayaan 17 Agustus"
                className="w-full border dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-2.5 rounded-xl text-sm dark:text-white"
                value={formData.judul}
                onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Lokasi Pelaksanaan</label>
              <input
                type="text"
                required
                placeholder="Misal: Balai RT, Area Taman Utama"
                className="w-full border dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-2.5 rounded-xl text-sm dark:text-white"
                value={formData.lokasi}
                onChange={(e) => setFormData({ ...formData, lokasi: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Tanggal Pelaksanaan</label>
              <input
                type="date"
                required
                className="w-full border dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-2.5 rounded-xl text-sm dark:text-white"
                value={formData.tanggal}
                onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Waktu (Jam Mulai)</label>
              <input
                type="text"
                placeholder="Misal: 08:00 - Selesai, 19:30 WIB"
                className="w-full border dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-2.5 rounded-xl text-sm dark:text-white"
                value={formData.waktu}
                onChange={(e) => setFormData({ ...formData, waktu: e.target.value })}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Rincian Deskripsi Kegiatan</label>
              <textarea
                rows={4}
                placeholder="Deskripsikan agenda acara, perlengkapan yang perlu dibawa warga, dsb..."
                className="w-full border dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-2.5 rounded-xl text-sm dark:text-white"
                value={formData.deskripsi}
                onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t dark:border-slate-800">
            <button
              type="button"
              onClick={() => setOpenForm(false)}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-sm border hover:bg-slate-200"
              disabled={isSubmitting}
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm shadow-md hover:shadow-lg transition-all"
            >
              {isSubmitting ? "Menjadwalkan..." : "Simpan Agenda RT"}
            </button>
          </div>
        </form>
      )}

      {/* FEED KEGIATAN (CARDS) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {isLoading ? (
          <div className="col-span-full py-12 text-center text-slate-400 animate-pulse">Memuat agenda kegiatan...</div>
        ) : listKegiatan.length > 0 ? (
          listKegiatan.map((item: any) => {
            const eventDate = new Date(item.tanggal);
            const isUpcoming = eventDate.getTime() > Date.now();
            const cardContent = (
              <>
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 bg-indigo-500/5 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${
                      isUpcoming ? "bg-blue-50 text-blue-750 dark:bg-blue-950/40 dark:text-blue-400" : "bg-slate-100 text-slate-500 dark:bg-slate-900 dark:text-slate-450"
                    }`}>
                      {isUpcoming ? "Mendatang" : "Selesai"}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-lg text-slate-800 dark:text-slate-100 group-hover:text-blue-600 transition-colors">{item.judul}</h3>
                  <p className="text-slate-500 dark:text-slate-450 text-xs mt-2 whitespace-pre-line min-h-[48px]">{item.deskripsi || "Tidak ada rincian agenda."}</p>
                </div>

                <div className="border-t border-slate-100 dark:border-slate-805 pt-4 mt-6 space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="font-medium inline-flex items-center gap-1.5"><Calendar className="w-4 h-4 text-slate-400" /> Tanggal</span>
                    <span className="font-bold text-slate-855 dark:text-slate-202">
                      {eventDate.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="font-medium inline-flex items-center gap-1.5"><Clock className="w-4 h-4 text-slate-400" /> Waktu</span>
                    <span className="font-bold text-slate-800 dark:text-slate-202">{item.waktu || "-"} WIB</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-505">
                    <span className="font-medium inline-flex items-center gap-1.5"><MapPin className="w-4 h-4 text-slate-400" /> Lokasi</span>
                    <span className="font-bold text-slate-800 dark:text-slate-202">{item.lokasi || "-"}</span>
                  </div>

                  {/* RSVP status */}
                  <div className="border-t border-slate-100 dark:border-slate-805 pt-3 mt-1.5 flex justify-between items-center text-xs font-bold text-blue-600">
                    <span className="inline-flex items-center gap-1.5"><Users className="w-4 h-4 text-blue-500" /> Konfirmasi Hadir (RSVP):</span>
                    <span>{item.rsvp?.length || 0} Orang</span>
                  </div>
                </div>
              </>
            );

            if (userRole === "WARGA") {
              return (
                <Link
                  key={item.id}
                  href={`/rsvp/${item.id}`}
                  className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-800/80 shadow-sm flex flex-col justify-between group hover:shadow-md hover:border-indigo-500/40 hover:-translate-y-0.5 transition-all text-left cursor-pointer animate-fade-in"
                >
                  {cardContent}
                </Link>
              );
            }

            return (
              <div key={item.id} className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-800/80 shadow-sm flex flex-col justify-between group hover:shadow-md transition-shadow">
                {cardContent}
                <button
                  type="button"
                  onClick={() => {
                    const shareUrl = `${window.location.origin}/rsvp/${item.id}`;
                    navigator.clipboard.writeText(shareUrl);
                    alert("Link Konfirmasi RSVP berhasil disalin! Bagikan ke Grup WA warga.");
                  }}
                  className="w-full mt-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-755 dark:bg-indigo-950/40 dark:hover:bg-indigo-950/70 dark:text-indigo-400 font-extrabold text-[10.5px] py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm active:scale-98"
                >
                  <span>🔗</span> Salin Link RSVP Grup WA
                </button>
              </div>
            );
          })
        ) : (
          <div className="col-span-full py-12 text-center text-slate-450 border border-dashed rounded-2xl">
            Belum ada jadwal rapat atau agenda kegiatan bersama terdaftar.
          </div>
        )}
      </div>
    </div>
  );
}