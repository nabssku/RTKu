"use client";

import React, { useState, useEffect } from "react";
import { use } from "react";
import { Calendar, Clock, MapPin, CheckCircle, XCircle, Sparkles, Shield, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function PublicRSVPPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const kegiatanId = resolvedParams.id;

  const [kegiatan, setKegiatan] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [hasConfirmed, setHasConfirmed] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [formData, setFormData] = useState({
    nama: "",
    telepon: "",
    hadir: true,
    keterangan: ""
  });

  useEffect(() => {
    // Check if already confirmed on this device
    const rsvpStatus = localStorage.getItem(`rsvp_confirmed_${kegiatanId}`);
    if (rsvpStatus === "true") {
      setHasConfirmed(true);
    }
    fetchKegiatan();
  }, [kegiatanId]);

  const fetchKegiatan = async () => {
    try {
      const res = await fetch(`/api/kegiatan/rsvp?id=${kegiatanId}`);
      const json = await res.json();
      if (json.data) {
        setKegiatan(json.data);
      } else {
        setErrorMsg(json.error || "Kegiatan tidak ditemukan");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Gagal memuat detail kegiatan.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama || !formData.telepon) {
      alert("Nama dan Nomor WhatsApp wajib diisi!");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/kegiatan/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kegiatanId,
          ...formData
        })
      });

      const json = await res.json();
      if (res.ok) {
        setSuccess(true);
        localStorage.setItem(`rsvp_confirmed_${kegiatanId}`, "true");
      } else {
        setErrorMsg(json.error || "Gagal melakukan konfirmasi");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Koneksi gagal. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-6 text-white">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-zinc-500 font-bold mt-4 animate-pulse">Memuat Agenda Rapat & Kegiatan...</p>
      </div>
    );
  }

  if (errorMsg && !kegiatan) {
    return (
      <div className="min-h-screen bg-slate-955 flex flex-col justify-center items-center p-6 text-white space-y-4">
        <AlertCircle size={44} className="text-rose-500" />
        <h1 className="text-xl font-black">{errorMsg}</h1>
        <p className="text-zinc-500 text-xs">Pastikan link konfirmasi RSVP yang Anda buka valid.</p>
      </div>
    );
  }

  const eventDate = new Date(kegiatan.tanggal);

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden selection:bg-indigo-500 selection:text-white">
      {/* Background elegant mesh gradients */}
      <div className="absolute top-[-25%] left-[-20%] w-[70%] aspect-square rounded-full bg-indigo-650/15 blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-[-25%] right-[-20%] w-[70%] aspect-square rounded-full bg-sky-600/10 blur-[130px] pointer-events-none"></div>

      <div className="w-full max-w-[500px] z-10 space-y-8 animate-slide-up">
        {/* Brand logo & header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10.5px] font-black uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-505/15 backdrop-blur-md mb-1">
            <Sparkles className="w-3.5 h-3.5" /> Konfirmasi RSVP Kegiatan
          </div>
          <div className="flex justify-center items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-indigo-600 to-indigo-500 rounded-xl flex items-center justify-center shadow-xl shadow-indigo-500/25">
              <span className="text-white font-black text-2xl">R</span>
            </div>
            <h1 className="text-2.5xl font-black tracking-tight text-white">RTKu PWA</h1>
          </div>
        </div>

        {/* Form / Success Card */}
        <div className="bg-zinc-900/40 border border-zinc-800/80 backdrop-blur-2xl p-6 md:p-8 rounded-[28px] shadow-2xl space-y-6 relative overflow-hidden text-zinc-350">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-indigo-650 to-indigo-500"></div>

          {/* Event details summary */}
          <div className="space-y-4 border-b border-zinc-800 pb-5">
            <span className="text-[10px] bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-400 px-2.5 py-1 rounded-full font-black tracking-wider uppercase">
              Agenda Kegiatan RT
            </span>
            <h2 className="text-xl font-black text-white">{kegiatan.judul}</h2>
            <p className="text-xs text-zinc-400 leading-relaxed">{kegiatan.deskripsi || "Tidak ada rincian agenda."}</p>

            <div className="grid grid-cols-1 gap-2 pt-2 text-xs font-semibold text-zinc-400">
              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-indigo-400" />
                <span>{eventDate.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-indigo-400" />
                <span>{kegiatan.waktu} WIB</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={14} className="text-indigo-400" />
                <span>{kegiatan.lokasi}</span>
              </div>
            </div>
          </div>

          {success || hasConfirmed ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 bg-emerald-500/10 text-emerald-450 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle size={36} />
              </div>
              <div className="space-y-1">
                <h3 className="font-extrabold text-white text-lg">Konfirmasi Kehadiran Terkirim</h3>
                <p className="text-xs text-zinc-500 max-w-sm mx-auto leading-relaxed">
                  Terima kasih, konfirmasi kehadiran Anda sudah terdaftar di sistem database RTKu dan diteruskan secara otomatis ke Ketua RT.
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-450 uppercase tracking-widest block">Nama Lengkap</label>
                  <input
                    type="text"
                    required
                    placeholder="Nama sesuai KK"
                    className="w-full px-4 py-3 bg-zinc-950/80 border border-zinc-800 rounded-xl text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all placeholder:text-zinc-700"
                    value={formData.nama}
                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-455 uppercase tracking-widest block">Nomor WhatsApp</label>
                  <input
                    type="tel"
                    required
                    placeholder="8123456789"
                    className="w-full px-4 py-3 bg-zinc-950/80 border border-zinc-800 rounded-xl text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all placeholder:text-zinc-700"
                    value={formData.telepon}
                    onChange={(e) => setFormData({ ...formData, telepon: e.target.value.replace(/\D/g, "") })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-455 uppercase tracking-widest block">Konfirmasi Kehandiran</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, hadir: true })}
                      className={`flex items-center justify-center gap-2 p-3.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        formData.hadir
                          ? "bg-emerald-500/10 border-emerald-500 text-emerald-450 shadow"
                          : "border-zinc-800 hover:border-zinc-700 hover:bg-zinc-950/40"
                      }`}
                    >
                      <CheckCircle size={16} />
                      Saya Hadir
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, hadir: false })}
                      className={`flex items-center justify-center gap-2 p-3.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        !formData.hadir
                          ? "bg-rose-500/10 border-rose-500 text-rose-455 shadow"
                          : "border-zinc-800 hover:border-zinc-700 hover:bg-zinc-950/40"
                      }`}
                    >
                      <XCircle size={16} />
                      Absen / Absen
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-455 uppercase tracking-widest block">Keterangan (Opsional)</label>
                  <input
                    type="text"
                    placeholder="Contoh: Datang terlambat / Hadir bersama istri"
                    className="w-full px-4 py-3 bg-zinc-950/80 border border-zinc-800 rounded-xl text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all placeholder:text-zinc-700"
                    value={formData.keterangan}
                    onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
                  />
                </div>
              </div>

              {errorMsg && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-450 rounded-xl text-[11px] font-bold flex items-center gap-1.5 leading-relaxed">
                  <AlertCircle size={14} className="shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold py-3.5 px-4 rounded-xl shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? "Mengirim Konfirmasi..." : "Kirim RSVP Kehadiran"}
              </button>
            </form>
          )}

          <div className="pt-4 border-t border-zinc-800 flex items-center justify-between text-[10px] text-zinc-550 font-bold">
            <span className="inline-flex items-center gap-1"><Shield size={11} /> 1 Perangkat = 1 Konfirmasi</span>
            <span>Secured by RTKu</span>
          </div>
        </div>
      </div>
    </div>
  );
}
