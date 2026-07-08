"use client";

import React, { useState, useEffect } from "react";
import { Mail, Plus, Search, FileText, Download, CheckCircle, ExternalLink, Calendar, Printer } from "lucide-react";

export default function SuratPage() {
  const [wargaList, setWargaList] = useState([]);
  const [suratList, setSuratList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [openForm, setOpenForm] = useState(false);
  const [selectedSurat, setSelectedSurat] = useState<any>(null);

  const [formData, setFormData] = useState({
    wargaId: "",
    jenisSurat: "Surat Pengantar KTP",
    perihal: "Pengantar Pembuatan KTP Baru",
    isiSurat: ""
  });

  const templateOptions = [
    { label: "Surat Pengantar KTP", perihal: "Pengantar Pembuatan KTP Baru" },
    { label: "Surat Pengantar KK", perihal: "Pengantar Pengurusan Kartu Keluarga" },
    { label: "Surat Keterangan Usaha (SKU)", perihal: "Keterangan Memiliki Usaha Mikro/Kecil" },
    { label: "Surat Keterangan Domisili", perihal: "Keterangan Domisili Sementara/Tetap" },
    { label: "Surat Keterangan Tidak Mampu (SKTM)", perihal: "Pernyataan Keadaan Ekonomi Tidak Mampu" }
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [resWarga, resSurat] = await Promise.all([
        fetch("/api/warga"),
        fetch("/api/surat/generate")
      ]);
      const jsonWarga = await resWarga.json();
      const jsonSurat = await resSurat.json();

      if (jsonWarga.data) {
        const flatWarga = jsonWarga.data.flatMap((k: any) => k.anggota);
        setWargaList(flatWarga);
      }
      if (jsonSurat.data) {
        setSuratList(jsonSurat.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedTemplate = templateOptions.find(t => t.label === e.target.value);
    setFormData({
      ...formData,
      jenisSurat: e.target.value,
      perihal: selectedTemplate ? selectedTemplate.perihal : ""
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    try {
      const res = await fetch("/api/surat/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        alert("Surat pengantar berhasil diterbitkan dan diarsipkan.");
        setOpenForm(false);
        setFormData({ wargaId: "", jenisSurat: "Surat Pengantar KTP", perihal: "Pengantar Pembuatan KTP Baru", isiSurat: "" });
        fetchData();
      } else {
        alert("Gagal menerbitkan surat.");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-3xl font-black bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent dark:from-white dark:to-slate-400">
            Surat Menyurat & Dokumen
          </h1>
          <p className="text-slate-500 text-sm mt-1">Buat, kelola, cetak, dan download arsip surat pengantar RT untuk warga secara praktis.</p>
        </div>
        <button
          onClick={() => setOpenForm(!openForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs md:text-sm px-4 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Terbitkan Surat Pengantar
        </button>
      </div>

      {/* FORM SURAT */}
      {openForm && (
        <div className="bg-white dark:bg-slate-950 p-6 md:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex justify-between items-center border-b pb-4">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Mail className="w-5 h-5 text-blue-500" />
              Buat Surat Pengantar Warga Baru
            </h2>
            <button onClick={() => setOpenForm(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-semibold">Tutup</button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Pilih Warga Pengaju</label>
                <select
                  required
                  className="w-full border dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-2.5 rounded-xl text-sm dark:text-white focus:outline-none"
                  value={formData.wargaId}
                  onChange={(e) => setFormData({ ...formData, wargaId: e.target.value })}
                >
                  <option value="">-- Pilih Warga --</option>
                  {wargaList.map((w: any) => (
                    <option key={w.id} value={w.id}>{w.nama} (NIK: {w.nik || "-"})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Pilih Jenis Surat Template</label>
                <select
                  required
                  className="w-full border dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-2.5 rounded-xl text-sm dark:text-white focus:outline-none"
                  value={formData.jenisSurat}
                  onChange={handleTemplateChange}
                >
                  {templateOptions.map((t, idx) => (
                    <option key={idx} value={t.label}>{t.label}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Perihal / Keperluan Pengurusan</label>
                <input
                  type="text"
                  required
                  className="w-full border dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-2.5 rounded-xl text-sm dark:text-white"
                  value={formData.perihal}
                  onChange={(e) => setFormData({ ...formData, perihal: e.target.value })}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Tambahan Isi / Catatan Khusus (Opsional)</label>
                <textarea
                  rows={4}
                  placeholder="Isi catatan tambahan khusus di sini atau kosongkan untuk menggunakan template kop surat standar RT..."
                  className="w-full border dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-2.5 rounded-xl text-sm dark:text-white placeholder:text-slate-400"
                  value={formData.isiSurat}
                  onChange={(e) => setFormData({ ...formData, isiSurat: e.target.value })}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t dark:border-slate-800">
              <button
                type="button"
                onClick={() => setOpenForm(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-sm border hover:bg-slate-200 transition-colors"
                disabled={isGenerating}
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isGenerating}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm shadow-md hover:shadow-lg transition-all"
              >
                {isGenerating ? "Menerbitkan..." : "Cetak & Simpan Surat"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ARSIP SURAT KELUAR */}
      <div className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/20">
          <span className="font-extrabold text-sm text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-500" />
            Arsip Surat Keluar Resmi
          </span>
          <span className="text-xs text-slate-400 font-bold">{suratList.length} Surat</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/20 dark:bg-slate-900/10 text-slate-500 text-xs font-bold border-b dark:border-slate-800">
              <tr>
                <th className="p-4">Nomor Surat</th>
                <th className="p-4">Jenis Surat</th>
                <th className="p-4">Pengaju / Warga</th>
                <th className="p-4">Perihal</th>
                <th className="p-4">Tanggal Rilis</th>
                <th className="p-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-400">Memuat list arsip surat...</td>
                </tr>
              ) : suratList.length > 0 ? (
                suratList.map((surat: any) => (
                  <tr key={surat.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors dark:text-slate-300">
                    <td className="p-4 font-mono font-bold text-blue-600 dark:text-blue-400">{surat.nomorSurat}</td>
                    <td className="p-4 font-semibold">{surat.jenisSurat}</td>
                    <td className="p-4 text-slate-800 dark:text-slate-200">{surat.wargaSurat?.[0]?.warga?.nama || "Umum / Warga"}</td>
                    <td className="p-4 text-xs text-slate-500">{surat.perihal}</td>
                    <td className="p-4 text-xs text-slate-400">
                      {new Date(surat.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => setSelectedSurat(surat)}
                        className="text-xs bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold px-2.5 py-1.5 border dark:border-slate-800 rounded-lg transition-colors cursor-pointer"
                      >
                        Lihat Detail
                      </button>
                      <a
                        href={`/api/surat/pdf?id=${surat.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1.5 rounded-lg transition-all shadow-sm hover:shadow cursor-pointer"
                      >
                        <Printer size={12} />
                        Unduh PDF
                      </a>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-400">Belum ada arsip surat pengantar keluar.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAIL MODAL DIALOG */}
      {selectedSurat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-950 max-w-2xl w-full rounded-2xl border dark:border-slate-800 shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start border-b pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{selectedSurat.jenisSurat}</h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">No: {selectedSurat.nomorSurat}</p>
              </div>
              <button onClick={() => setSelectedSurat(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-semibold">Tutup</button>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border dark:border-slate-800 text-xs font-mono whitespace-pre-wrap max-h-96 overflow-y-auto text-slate-700 dark:text-slate-300 leading-relaxed">
              {selectedSurat.isiSurat}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedSurat(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-sm border hover:bg-slate-200"
              >
                Kembali
              </button>
              <a
                href={`/api/surat/pdf?id=${selectedSurat.id}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm shadow-md"
              >
                <Download size={14} />
                Unduh PDF
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}