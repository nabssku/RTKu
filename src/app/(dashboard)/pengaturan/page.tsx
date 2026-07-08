"use client";

import React, { useState, useEffect } from "react";
import { CheckCircle2, AlertTriangle, ShieldCheck, Settings, Users, MessageSquare, Save } from "lucide-react";

export default function PengaturanPage() {
  const [profile, setProfile] = useState<any>(null);
  const [userRole, setUserRole] = useState("WARGA");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isActivating, setIsActivating] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    nomorRT: "",
    nomorRW: "",
    kelurahan: "",
    kecamatan: "",
    kabupaten: "",
    provinsi: "",
    kontakKetua: "",
    alamat: "",
    pakasirSlug: "",
    pakasirApiKey: ""
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/rt/profile");
      const json = await res.json();
      if (json.data) {
        setProfile(json.data);
        setUserRole(json.role || "WARGA");
        setFormData({
          name: json.data.name || "",
          nomorRT: json.data.nomorRT || "",
          nomorRW: json.data.nomorRW || "",
          kelurahan: json.data.kelurahan || "",
          kecamatan: json.data.kecamatan || "",
          kabupaten: json.data.kabupaten || "",
          provinsi: json.data.provinsi || "",
          kontakKetua: json.data.kontakKetua || "",
          alamat: json.data.alamat || "",
          pakasirSlug: json.data.pakasirSlug || "",
          pakasirApiKey: json.data.pakasirApiKey || ""
        });
      }
    } catch (err) {
      console.error("Failed to load profile:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch("/api/rt/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok && data.data) {
        setProfile(data.data);
        alert("Profil RT berhasil diperbarui.");
      } else {
        alert("Gagal menyimpan profil: " + (data.error || "Server issue"));
      }
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan koneksi.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleBayarAktivasi = async () => {
    setIsActivating(true);
    try {
      const res = await fetch("/api/payment/aktivasi", { method: "POST" });
      const data = await res.json();

      if (res.ok && data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        alert("Gagal me-request pembayaran Pakasir: " + (data.error || "Server issue"));
      }
    } catch (error) {
      console.error(error);
      alert("Gagal menghubungkan ke gateway Pakasir.");
    } finally {
      setIsActivating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-96 space-y-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-400 font-medium animate-pulse text-sm">Memuat konfigurasi sistem...</p>
      </div>
    );
  }

  const isTrialActive = !profile.isActive && profile.trialEnd;
  const msRemaining = profile.trialEnd ? new Date(profile.trialEnd).getTime() - Date.now() : 0;
  const daysRemaining = Math.max(0, Math.ceil(msRemaining / (1000 * 60 * 60 * 24)));

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="border-b border-slate-100 dark:border-slate-800 pb-5 flex items-center gap-3">
        <div className="p-3 bg-blue-500/5 text-blue-600 dark:text-blue-400 rounded-xl">
          <Settings className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-black bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent dark:from-white dark:to-slate-400">
            Pengaturan RTKu
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">Kelola identitas kepengurusan RT dan status aktivasi seumur hidup.</p>
        </div>
      </div>

      {/* BANNER AKTIVASI */}
      {userRole === "KETUA_RT" && (
        <div className={`p-6 rounded-2xl border shadow-sm ${profile.isActive ? "bg-green-50/40 border-green-200/80 dark:bg-green-950/10 dark:border-green-900/50" : "bg-white dark:bg-slate-950 border-slate-100 dark:border-slate-800/80"}`}>
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
            <div className="space-y-2">
              <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800 dark:text-slate-150">
                Status Aplikasi:
                {profile.isActive ? (
                  <span className="text-green-600 dark:text-green-400 flex items-center gap-1.5"><CheckCircle2 className="w-5 h-5" /> Aktif Selamanya</span>
                ) : (
                  <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1.5"><AlertTriangle className="w-5 h-5" /> Masa Percobaan (Trial)</span>
                )}
              </h2>

              {profile.isActive ? (
                <p className="text-slate-500 text-xs md:text-sm">Lisensi RTKu Anda sudah diaktivasi secara penuh dengan kode pembelian <strong>{profile.activationCode}</strong> seumur hidup.</p>
              ) : (
                <p className="text-slate-500 text-xs md:text-sm">
                  Aplikasi Anda saat ini berjalan pada masa percobaan gratis 7 hari, tersisa <span className="font-extrabold text-amber-600 dark:text-amber-400">{daysRemaining} hari</span>.
                  Segera aktifkan sebelum batas masa trial berakhir.
                </p>
              )}
            </div>

            {!profile.isActive && (
              <div className="bg-slate-50/50 dark:bg-slate-900 p-5 rounded-2xl border dark:border-slate-800 min-w-[280px] w-full md:w-auto">
                <div className="text-center mb-3">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Lisensi Seumur Hidup</span>
                  <div className="text-3xl font-black text-slate-800 dark:text-slate-200 mt-1">Rp 15.000</div>
                </div>
                <button
                  onClick={handleBayarAktivasi}
                  disabled={isActivating}
                  className="w-full bg-blue-600 hover:bg-blue-750 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isActivating ? (
                    <span className="animate-pulse">Loading gateway...</span>
                  ) : (
                    <>
                      <ShieldCheck className="w-5 h-5" />
                      Aktifkan via Pakasir
                    </>
                  )}
                </button>
                <div className="text-[9px] text-center text-slate-400 mt-3 font-medium">Mendukung QRIS, GoPay, OVO, Dana, LinkAja, VA</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* IDENTITAS RT */}
      <div className="bg-white dark:bg-slate-950 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800/80 p-6 md:p-8">
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-6 border-b dark:border-slate-800 pb-3 flex items-center gap-2">
          <Users className="w-5 h-5 text-indigo-500" />
          Profil Rukun Tetangga (RT)
        </h2>
        
        <form onSubmit={handleSaveProfile} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Nama Wilayah / Perumahan</label>
              <input
                type="text"
                required
                className="w-full border dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-2.5 rounded-xl text-sm dark:text-white"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Nomor RT</label>
              <input
                type="text"
                required
                className="w-full border dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-2.5 rounded-xl text-sm dark:text-white"
                value={formData.nomorRT}
                onChange={(e) => setFormData({ ...formData, nomorRT: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Nomor RW</label>
              <input
                type="text"
                required
                className="w-full border dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-2.5 rounded-xl text-sm dark:text-white"
                value={formData.nomorRW}
                onChange={(e) => setFormData({ ...formData, nomorRW: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Kelurahan / Desa</label>
              <input
                type="text"
                required
                className="w-full border dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-2.5 rounded-xl text-sm dark:text-white"
                value={formData.kelurahan}
                onChange={(e) => setFormData({ ...formData, kelurahan: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Kecamatan</label>
              <input
                type="text"
                required
                className="w-full border dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-2.5 rounded-xl text-sm dark:text-white"
                value={formData.kecamatan}
                onChange={(e) => setFormData({ ...formData, kecamatan: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Kabupaten / Kota</label>
              <input
                type="text"
                required
                className="w-full border dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-2.5 rounded-xl text-sm dark:text-white"
                value={formData.kabupaten}
                onChange={(e) => setFormData({ ...formData, kabupaten: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Provinsi</label>
              <input
                type="text"
                required
                className="w-full border dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-2.5 rounded-xl text-sm dark:text-white"
                value={formData.provinsi}
                onChange={(e) => setFormData({ ...formData, provinsi: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Nama Kontak Ketua RT</label>
              <input
                type="text"
                required
                className="w-full border dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-2.5 rounded-xl text-sm dark:text-white"
                value={formData.kontakKetua}
                onChange={(e) => setFormData({ ...formData, kontakKetua: e.target.value })}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Alamat Kantor / Sekretariat RT</label>
              <textarea
                rows={3}
                className="w-full border dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-2.5 rounded-xl text-sm dark:text-white"
                value={formData.alamat}
                onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
              />
            </div>

            {/* INTEGRASI PAKASIR (BILLING PER RT) */}
            <div className="sm:col-span-2 mt-4 pt-4 border-t dark:border-slate-800 space-y-4">
              <h3 className="text-sm font-extrabold text-indigo-650 dark:text-indigo-400 uppercase tracking-wider">Integrasi Payment Gateway Pakasir RT</h3>
              <p className="text-[11px] text-slate-500 leading-normal">
                Konfigurasikan akun merchant Pakasir Anda di sini. Ketika warga membayar iuran bulanan digital dari dashboard mereka, dana iuran akan masuk secara langsung ke akun POS/merch Pakasir khusus RT Anda.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Pakasir Project Slug</label>
                  <input
                    type="text"
                    placeholder="Contoh: rtku-rt03"
                    className="w-full border dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-2.5 rounded-xl text-sm dark:text-white"
                    value={formData.pakasirSlug}
                    onChange={(e) => setFormData({ ...formData, pakasirSlug: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Pakasir Server API Key</label>
                  <input
                    type="password"
                    placeholder="Masukkan API Key Pakasir Anda"
                    className="w-full border dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-2.5 rounded-xl text-sm dark:text-white"
                    value={formData.pakasirApiKey}
                    onChange={(e) => setFormData({ ...formData, pakasirApiKey: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="pt-4 border-t dark:border-slate-800 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 bg-slate-900 hover:bg-slate-850 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold rounded-xl text-sm shadow-md transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Save size={16} />
              {isSaving ? "Menyimpan..." : "Simpan Profil RT"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}