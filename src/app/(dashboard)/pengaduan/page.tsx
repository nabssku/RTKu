"use client";

import React, { useState, useEffect } from "react";
import { MessageSquare, Plus, Save, Clock, User, AlertCircle, Image as ImageIcon, XCircle, CheckCircle2, ChevronRight, CornerDownRight } from "lucide-react";

export default function PengaduanPage() {
  const [listAduan, setListAduan] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [openForm, setOpenForm] = useState(false);
  const [userRole, setUserRole] = useState("WARGA");

  // Form Pengaduan Warga
  const [formData, setFormData] = useState({
    judul: "",
    deskripsi: "",
    kategori: "KEAMANAN",
    isAnonim: false,
    fotoUrl: ""
  });

  // Form Response/Tanggapan Ketua RT
  const [selectedAduan, setSelectedAduan] = useState<any>(null);
  const [openResponseForm, setOpenResponseForm] = useState(false);
  const [responseForm, setResponseForm] = useState({
    status: "DIPROSES",
    tanggapan: ""
  });

  useEffect(() => {
    fetchAduan();
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

  const fetchAduan = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/pengaduan");
      const json = await res.json();
      if (json.data) setListAduan(json.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const base64Str = (reader.result as string).split(",")[1];
      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: base64Str }),
        });
        const json = await res.json();
        if (res.ok && json.url) {
          setFormData((prev) => ({ ...prev, fotoUrl: json.url }));
          alert("Foto lampiran berhasil diunggah!");
        } else {
          alert("Gagal mengunggah foto: " + (json.error || "Server issue"));
        }
      } catch (err) {
        console.error(err);
        alert("Gagal mengunggah foto karena gangguan koneksi.");
      } finally {
        setIsUploading(false);
      }
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/pengaduan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        alert("Laporan pengaduan berhasil dikirim ke Pengurus RT.");
        setFormData({ judul: "", deskripsi: "", kategori: "KEAMANAN", isAnonim: false, fotoUrl: "" });
        setOpenForm(false);
        fetchAduan();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAduan) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/pengaduan", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          aduanId: selectedAduan.id,
          ...responseForm
        })
      });
      if (res.ok) {
        alert("Tanggapan pengaduan berhasil disimpan.");
        setOpenResponseForm(false);
        setSelectedAduan(null);
        fetchAduan();
      } else {
        const data = await res.json();
        alert("Gagal menyimpan tanggapan: " + (data.error || "Server issue"));
      }
    } catch (err) {
      console.error(err);
      alert("Gagal menyimpan karena gangguan koneksi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 border-b border-zinc-150 dark:border-zinc-800 pb-5">
        <div className="space-y-1">
          <h1 className="text-3.5xl font-black bg-gradient-to-r from-zinc-900 via-indigo-900 to-indigo-700 bg-clip-text text-transparent dark:from-white dark:to-zinc-305">
            Laporan Pengaduan Warga
          </h1>
          <p className="text-zinc-550 dark:text-zinc-400 text-sm font-medium">Sampaikan keluhan, aduan infrastruktur, atau masalah keamanan di lingkungan RT.</p>
        </div>
        {userRole === "WARGA" && (
          <button
            onClick={() => setOpenForm(!openForm)}
            className="bg-indigo-650 hover:bg-indigo-700 text-white font-extrabold text-xs md:text-sm px-5 py-3 rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer active:scale-98"
          >
            <Plus className="w-4 h-4" />
            Buat Pengaduan Baru
          </button>
        )}
      </div>

      {/* FORM INPUT PENGADUAN WARGA */}
      {openForm && userRole === "WARGA" && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-zinc-900 p-6 md:p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xl space-y-5 animate-in fade-in slide-in-from-top-4 duration-300">
          <h2 className="text-lg font-black text-zinc-900 dark:text-white flex items-center gap-2">
            <Plus className="w-5 h-5 text-indigo-500" />
            Buat Laporan Pengaduan Baru
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-zinc-400 dark:text-zinc-550 uppercase tracking-widest">Judul Laporan / Keluhan</label>
              <input
                type="text"
                required
                placeholder="Misal: Lampu mading depan balai RT mati"
                className="w-full border border-zinc-200 dark:border-zinc-850 bg-zinc-50 dark:bg-zinc-950 px-4 py-3 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-550"
                value={formData.judul}
                onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-zinc-400 dark:text-zinc-550 uppercase tracking-widest">Kategori Laporan</label>
              <select
                className="w-full border border-zinc-200 dark:border-zinc-850 bg-zinc-50 dark:bg-zinc-950 px-4 py-3 rounded-2xl text-xs font-bold focus:outline-none"
                value={formData.kategori}
                onChange={(e) => setFormData({ ...formData, kategori: e.target.value })}
              >
                <option value="KEAMANAN">Keamanan</option>
                <option value="KEBERSIHAN">Kebersihan</option>
                <option value="INFRASTRUKTUR">Infrastruktur</option>
                <option value="SOSIAL">Sosial</option>
                <option value="LAINNYA">Lainnya</option>
              </select>
            </div>

            <div className="md:col-span-2 space-y-1">
              <label className="block text-xs font-bold text-zinc-400 dark:text-zinc-550 uppercase tracking-widest">Deskripsi Rincian Aduan</label>
              <textarea
                rows={4}
                required
                placeholder="Tulis kronologi laporan, lokasi detail aduan, dsb..."
                className="w-full border border-zinc-200 dark:border-zinc-855 bg-zinc-50 dark:bg-zinc-950 px-4 py-3 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-550"
                value={formData.deskripsi}
                onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
              />
            </div>

            {/* FOTO LAMPIRAN UPLOAD CLOUDINARY */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-zinc-400 dark:text-zinc-550 uppercase tracking-widest">Lampirkan Bukti Foto (Cloudinary)</label>
              <div className="flex items-center gap-3">
                <label className="cursor-pointer bg-zinc-150 hover:bg-zinc-200 dark:bg-zinc-950 dark:hover:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 text-zinc-700 dark:text-zinc-300 font-extrabold text-xs px-4 py-2.5 rounded-xl shadow transition-all flex items-center gap-2 active:scale-98">
                  {isUploading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                      Mengunggah Foto...
                    </>
                  ) : (
                    <>
                      <ImageIcon className="w-4 h-4" />
                      Pilih & Upload Foto
                    </>
                  )}
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} disabled={isUploading || isSubmitting} />
                </label>
                {formData.fotoUrl && (
                  <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-bold px-2.5 py-1 rounded-full">
                    ✓ Foto siap dilampirkan
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="w-4.5 h-4.5 rounded text-indigo-600 focus:ring-indigo-500 border-zinc-300 dark:border-zinc-800"
                  checked={formData.isAnonim}
                  onChange={(e) => setFormData({ ...formData, isAnonim: e.target.checked })}
                />
                <span className="text-xs font-semibold text-zinc-500">Kirim secara anonim (Sembunyikan profil pengirim)</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-5 border-t border-zinc-150 dark:border-zinc-805">
            <button
              type="button"
              onClick={() => setOpenForm(false)}
              className="px-5 py-2.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-950 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300 font-extrabold rounded-2xl text-sm border border-zinc-200 dark:border-zinc-800 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isUploading}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-2xl text-sm shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? "Mengirim..." : "Kirim Pengaduan"}
            </button>
          </div>
        </form>
      )}

      {/* FORM ACTIONS KETUA RT (MODAL TINDAK LANJUT) */}
      {openResponseForm && selectedAduan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <form onSubmit={handleSaveResponse} className="bg-white dark:bg-zinc-900 p-6 md:p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl max-w-md w-full space-y-5 animate-in zoom-in-95 duration-200 text-zinc-800 dark:text-zinc-200">
            <div className="flex justify-between items-start border-b border-zinc-150 dark:border-zinc-800/80 pb-3">
              <div>
                <h3 className="font-black text-lg">Tindak Lanjut Pengaduan</h3>
                <p className="text-xs text-zinc-400 mt-0.5">{selectedAduan.judul}</p>
              </div>
              <button type="button" onClick={() => { setOpenResponseForm(false); setSelectedAduan(null); }} className="text-zinc-500 hover:text-zinc-700 dark:hover:text-white text-xs font-bold">Batal</button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-zinc-450 uppercase tracking-widest">Update Status Aduan</label>
                <select
                  className="w-full border border-zinc-205 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 p-2.5 rounded-xl text-xs font-bold focus:outline-none"
                  value={responseForm.status}
                  onChange={(e) => setResponseForm({ ...responseForm, status: e.target.value })}
                >
                  <option value="DIPROSES">Diproses (Sedang ditinjau petugas)</option>
                  <option value="SELESAI">Selesai (Aduan sudah ditanggulangi)</option>
                  <option value="DITOLAK">Ditolak / Arsipkan</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-zinc-450 uppercase tracking-widest">Tanggapan / Catatan Ketua RT</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Tulis rincian perbaikan fasilitas, tanggapan keamanan, dsb..."
                  className="w-full border border-zinc-205 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 p-3 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  value={responseForm.tanggapan}
                  onChange={(e) => setResponseForm({ ...responseForm, tanggapan: e.target.value })}
                />
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-150 dark:border-zinc-800 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => { setOpenResponseForm(false); setSelectedAduan(null); }}
                className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-950 dark:hover:bg-zinc-950/40 text-xs font-extrabold text-zinc-705 dark:text-zinc-300 rounded-lg border cursor-pointer border-zinc-200 dark:border-zinc-800"
              >
                Kembali
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4.5 py-2 bg-indigo-650 hover:bg-indigo-700 text-white text-xs font-black rounded-lg shadow cursor-pointer active:scale-98 transition-all"
              >
                {isSubmitting ? "Menyimpan..." : "Simpan Tindak Lanjut"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* FEED ADUAN (LIST) */}
      <div className="space-y-6">
        {isLoading ? (
          <div className="py-20 text-center text-zinc-400 font-bold animate-pulse">Memuat laporan pengaduan...</div>
        ) : listAduan.length > 0 ? (
          listAduan.map((aduan: any) => (
            <div key={aduan.id} className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-150 dark:border-zinc-800/80 shadow-sm hover:shadow-md transition-shadow relative space-y-4">
              <div className="flex justify-between items-start flex-wrap gap-2.5 border-b border-zinc-100 dark:border-zinc-850 pb-4">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] bg-slate-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-black uppercase tracking-widest px-2.5 py-1 rounded-full">
                    {aduan.kategori}
                  </span>
                  <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${
                    aduan.status === "DITERIMA" ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400" :
                    aduan.status === "DIPROSES" ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400" :
                    aduan.status === "SELESAI" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400" :
                    "bg-rose-50 text-rose-700 dark:bg-rose-955/20 dark:text-rose-455"
                  }`}>
                    {aduan.status}
                  </span>
                </div>
                {userRole === "KETUA_RT" && (
                  <button
                    onClick={() => {
                      setSelectedAduan(aduan);
                      setResponseForm({
                        status: aduan.status || "DIPROSES",
                        tanggapan: aduan.tanggapan || ""
                      });
                      setOpenResponseForm(true);
                    }}
                    className="text-xs bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:hover:bg-indigo-950 text-indigo-750 dark:text-indigo-400 font-extrabold px-3 py-1.5 rounded-lg border dark:border-zinc-800/70 cursor-pointer active:scale-98 transition-all"
                  >
                    Tindak Lanjut
                  </button>
                )}
              </div>

              <div className="space-y-2 text-left">
                <h3 className="font-black text-lg text-zinc-850 dark:text-white leading-tight">{aduan.judul}</h3>
                <p className="text-zinc-600 dark:text-zinc-400 text-sm whitespace-pre-line leading-relaxed font-normal">{aduan.deskripsi}</p>

                {/* DISPLAY Bukti Foto Cloudinary */}
                {aduan.fotoUrl && (
                  <div className="pt-2 max-w-sm">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={aduan.fotoUrl}
                      alt={`Lampiran keluhan: ${aduan.judul}`}
                      className="rounded-2xl border border-zinc-150 dark:border-zinc-800 shadow-sm max-h-56 object-cover"
                    />
                  </div>
                )}
              </div>

              {/* display response message from Ketua RT if exists */}
              {aduan.tanggapan && (
                <div className="bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-150 dark:border-zinc-805 p-4.5 rounded-2xl mt-4 flex items-start gap-2.5 text-left text-xs font-semibold leading-relaxed">
                  <CornerDownRight className="w-4.5 h-4.5 text-indigo-500 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <span className="font-extrabold text-[10px] text-zinc-400 uppercase tracking-widest">Tanggapan/Tindakan Pengurus RT:</span>
                    <p className="text-zinc-650 dark:text-zinc-350">{aduan.tanggapan}</p>
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center text-[10.5px] text-zinc-450 dark:text-zinc-550 border-t border-zinc-100 dark:border-zinc-850 pt-4 mt-2 font-bold uppercase tracking-wide">
                <span className="flex items-center gap-1.5">
                  <User size={13} className="text-zinc-400" />
                  Pengirim: {aduan.isAnonim ? "Anonim Warga" : (aduan.user?.name || "Warga Baru")}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock size={13} className="text-zinc-400" />
                  {new Date(aduan.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-16 text-center text-zinc-450 border border-dashed rounded-3xl font-medium">
            Belum ada laporan pengaduan masuk di wilayah RT Anda.
          </div>
        )}
      </div>
    </div>
  );
}
