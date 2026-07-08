"use client";

import React, { useState, useEffect } from "react";
import { Users, FilePlus, Search, ArrowRight, UserPlus, Sparkles, AlertCircle, Eye } from "lucide-react";

export default function WargaPage() {
  const [keluargaList, setKeluargaList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOCRProcessing, setIsOCRProcessing] = useState(false);
  const [openForm, setOpenForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [formData, setFormData] = useState({
    noKK: "",
    alamat: "",
    rt: "",
    rw: "",
    kelurahan: "",
    kecamatan: "",
    kabupaten: "",
    provinsi: "",
    kodePos: "",
    anggota: []
  });

  const [newAnggota, setNewAnggota] = useState({
    nik: "",
    nama: "",
    hubungan: "ANAK",
    jenisKelamin: "LAKI_LAKI",
    agama: "ISLAM",
    tempatLahir: "",
    tanggalLahir: "",
    pendidikan: "",
    pekerjaan: "",
    statusKawin: "BELUM_KAWIN"
  });

  const handleAddAnggota = () => {
    if (!newAnggota.nama) {
      alert("Nama lengkap anggota harus diisi.");
      return;
    }
    setFormData((prev: any) => ({
      ...prev,
      anggota: [...(prev.anggota || []), { ...newAnggota }]
    }));
    setNewAnggota({
      nik: "",
      nama: "",
      hubungan: "ANAK",
      jenisKelamin: "LAKI_LAKI",
      agama: "ISLAM",
      tempatLahir: "",
      tanggalLahir: "",
      pendidikan: "",
      pekerjaan: "",
      statusKawin: "BELUM_KAWIN"
    });
  };

  const handleRemoveAnggota = (index: number) => {
    setFormData((prev: any) => ({
      ...prev,
      anggota: prev.anggota.filter((_: any, idx: number) => idx !== index)
    }));
  };

  useEffect(() => {
    fetchWarga();
  }, [searchQuery]);

  const fetchWarga = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/warga?search=${encodeURIComponent(searchQuery)}`);
      const json = await res.json();
      if (json.data) setKeluargaList(json.data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Convert file to base64
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const base64Str = (reader.result as string).split(",")[1];

      setIsOCRProcessing(true);
      try {
        const res = await fetch("/api/ocr/kk", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: base64Str }),
        });

        const json = await res.json();
        if (json.data) {
          alert("AI OCR Berhasil! Data form telah di-autofill dari foto KK Anda.");
          setFormData(json.data);
          setOpenForm(true);
        } else {
          alert("Gagal memindai KK: " + (json.error || "Format tidak terdeteksi"));
        }
      } catch (err) {
        console.error(err);
        alert("OCR error. Pastikan API key Groq Anda valid.");
      } finally {
        setIsOCRProcessing(false);
      }
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/warga", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        alert("Data Kartu Keluarga berhasil disimpan ke database.");
        setOpenForm(false);
        fetchWarga();
      } else {
        alert("Gagal menyimpan data keluarga.");
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 border-b border-zinc-150 dark:border-zinc-800/80 pb-6">
        <div>
          <h1 className="text-3.5xl font-black bg-gradient-to-r from-zinc-900 via-indigo-900 to-indigo-700 bg-clip-text text-transparent dark:from-white dark:to-zinc-300">
            Kependudukan RT
          </h1>
          <p className="text-zinc-550 dark:text-zinc-400 text-sm font-medium mt-1">Kelola data kartu keluarga dan anggota warga secara digital.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <label className="cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs md:text-sm px-5 py-3 rounded-2xl shadow-md hover:shadow-lg active:scale-98 transition-all flex items-center gap-2">
            {isOCRProcessing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Memproses AI OCR...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-white" />
                Upload Foto KK (AI OCR)
              </>
            )}
            <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} disabled={isOCRProcessing} />
          </label>
          <button
            onClick={() => {
              setFormData({
                noKK: "",
                alamat: "",
                rt: "",
                rw: "",
                kelurahan: "",
                kecamatan: "",
                kabupaten: "",
                provinsi: "",
                kodePos: "",
                anggota: []
              });
              setOpenForm(true);
            }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs md:text-sm px-5 py-3 rounded-2xl shadow-md hover:shadow-lg active:scale-98 transition-all flex items-center gap-2 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            Tambah Manual
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="relative max-w-md">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">
          <Search className="w-4 h-4" />
        </span>
        <input
          type="text"
          placeholder="Cari Kepala Keluarga, NIK, atau nomor KK..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-505 transition-all dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-650"
        />
      </div>

      {/* FORM KELUARGA MODAL-LIKE */}
      {openForm && (
        <div className="bg-white dark:bg-zinc-900 p-6 md:p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xl space-y-6 animate-in fade-in slide-in-from-top-4 duration-350">
          <div className="flex justify-between items-center border-b border-zinc-150 dark:border-zinc-800/80 pb-4">
            <h2 className="text-lg font-black text-zinc-850 dark:text-zinc-100 flex items-center gap-2">
              <FilePlus className="w-5 h-5 text-indigo-500" />
              Pendaftaran Data Kartu Keluarga
            </h2>
            <button onClick={() => setOpenForm(false)} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-sm font-bold">Tutup</button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-2.5">Nomor KK (16 digit)</label>
                <input
                  type="text"
                  maxLength={16}
                  required
                  className="w-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-4 py-3 rounded-2xl text-sm font-semibold dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  value={formData.noKK}
                  onChange={(e) => setFormData({ ...formData, noKK: e.target.value })}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-2.5">Alamat Lengkap</label>
                <input
                  type="text"
                  className="w-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-4 py-3 rounded-2xl text-sm font-semibold dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  value={formData.alamat}
                  onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-2.5">RT</label>
                <input
                  type="text"
                  placeholder="001"
                  className="w-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-4 py-3 rounded-2xl text-sm font-semibold dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  value={formData.rt}
                  onChange={(e) => setFormData({ ...formData, rt: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-2.5">RW</label>
                <input
                  type="text"
                  placeholder="004"
                  className="w-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-4 py-3 rounded-2xl text-sm font-semibold dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  value={formData.rw}
                  onChange={(e) => setFormData({ ...formData, rw: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-2.5">Kode Pos</label>
                <input
                  type="text"
                  className="w-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-4 py-3 rounded-2xl text-sm font-semibold dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  value={formData.kodePos}
                  onChange={(e) => setFormData({ ...formData, kodePos: e.target.value })}
                />
              </div>
            </div>

            {/* Anggota Keluarga */}
            <div className="space-y-4">
              <h3 className="font-extrabold text-sm text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" />
                Anggota Keluarga Terdeteksi ({formData.anggota?.length || 0})
              </h3>
              <div className="border border-zinc-150 dark:border-zinc-800/80 rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-xs text-left">
                  <thead className="bg-zinc-50 dark:bg-zinc-950 text-zinc-500 dark:text-zinc-400 font-bold border-b border-zinc-150 dark:border-zinc-800/80">
                    <tr>
                      <th className="p-4">NIK</th>
                      <th className="p-4">Nama Lengkap</th>
                      <th className="p-4">Hubungan</th>
                      <th className="p-4">Kelamin</th>
                      <th className="p-4">Agama</th>
                      <th className="p-4 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-850">
                    {formData.anggota?.map((a: any, i: number) => (
                      <tr key={i} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-950/40 dark:text-zinc-200">
                        <td className="p-4 font-mono font-semibold text-zinc-600 dark:text-zinc-400">{a.nik}</td>
                        <td className="p-4 font-extrabold text-zinc-850 dark:text-zinc-100">{a.nama}</td>
                        <td className="p-4">
                          <span className="bg-indigo-50 dark:bg-indigo-950/40 text-indigo-750 dark:text-indigo-400 px-2.5 py-1 rounded-lg font-bold">
                            {a.hubungan}
                          </span>
                        </td>
                        <td className="p-4 font-medium">{a.jenisKelamin}</td>
                        <td className="p-4 font-medium">{a.agama}</td>
                        <td className="p-4 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveAnggota(i)}
                            className="text-xs text-rose-605 hover:text-rose-500 font-bold hover:underline cursor-pointer"
                          >
                            Hapus
                          </button>
                        </td>
                      </tr>
                    ))}
                    {(!formData.anggota || formData.anggota.length === 0) && (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-zinc-400 dark:text-zinc-500 italic font-semibold">
                          Belum ada data anggota keluarga. Silakan tambah anggota secara manual di bawah.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Form Input Anggota Baru */}
            <div className="bg-zinc-50 dark:bg-zinc-950 p-5 rounded-2xl border border-zinc-150 dark:border-zinc-850 space-y-4">
              <h4 className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
                <Sparkles size={14} className="text-amber-500 fill-amber-500" />
                Tambah Anggota Keluarga (+)
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 dark:text-zinc-550 uppercase tracking-wider mb-1">NIK (16 digit)</label>
                  <input
                    type="text"
                    maxLength={16}
                    placeholder="Contoh: 3573..."
                    className="w-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 rounded-xl text-xs font-bold dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    value={newAnggota.nik}
                    onChange={(e) => setNewAnggota({ ...newAnggota, nik: e.target.value.replace(/\D/g, "") })}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 dark:text-zinc-550 uppercase tracking-wider mb-1">Nama Lengkap</label>
                  <input
                    type="text"
                    placeholder="Nama Lengkap"
                    className="w-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 rounded-xl text-xs font-bold dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    value={newAnggota.nama}
                    onChange={(e) => setNewAnggota({ ...newAnggota, nama: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 dark:text-zinc-550 uppercase tracking-wider mb-1">Hubungan</label>
                  <select
                    className="w-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 rounded-xl text-xs font-bold dark:text-white focus:outline-none"
                    value={newAnggota.hubungan}
                    onChange={(e) => setNewAnggota({ ...newAnggota, hubungan: e.target.value })}
                  >
                    <option value="KEPALA_KELUARGA">Kepala Keluarga</option>
                    <option value="ISTRI">Istri</option>
                    <option value="ANAK">Anak</option>
                    <option value="MENANTU">Menantu</option>
                    <option value="CUCU">Cucu</option>
                    <option value="ORANG_TUA">Orang Tua</option>
                    <option value="MERTUA">Mertua</option>
                    <option value="FAMILI_LAIN">Famili Lain</option>
                    <option value="LAINNYA">Lainnya</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 dark:text-zinc-550 uppercase tracking-wider mb-1">Jenis Kelamin</label>
                  <select
                    className="w-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 rounded-xl text-xs font-bold dark:text-white focus:outline-none"
                    value={newAnggota.jenisKelamin}
                    onChange={(e) => setNewAnggota({ ...newAnggota, jenisKelamin: e.target.value })}
                  >
                    <option value="LAKI_LAKI">Laki-Laki</option>
                    <option value="PEREMPUAN">Perempuan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 dark:text-zinc-550 uppercase tracking-wider mb-1">Agama</label>
                  <select
                    className="w-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 rounded-xl text-xs font-bold dark:text-white focus:outline-none"
                    value={newAnggota.agama}
                    onChange={(e) => setNewAnggota({ ...newAnggota, agama: e.target.value })}
                  >
                    <option value="ISLAM">Islam</option>
                    <option value="KRISTEN">Kristen</option>
                    <option value="KATOLIK">Katolik</option>
                    <option value="HINDU">Hindu</option>
                    <option value="BUDDHA">Buddha</option>
                    <option value="KONGHUCU">Konghucu</option>
                    <option value="LAINNYA">Lainnya</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 dark:text-zinc-550 uppercase tracking-wider mb-1">Tempat Lahir</label>
                  <input
                    type="text"
                    placeholder="Contoh: MAKASSAR"
                    className="w-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 rounded-xl text-xs font-bold dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    value={newAnggota.tempatLahir}
                    onChange={(e) => setNewAnggota({ ...newAnggota, tempatLahir: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 dark:text-zinc-550 uppercase tracking-wider mb-1">Tanggal Lahir</label>
                  <input
                    type="date"
                    className="w-full border border-zinc-200 dark:border-zinc-805 bg-white dark:bg-zinc-900 px-3 py-2 rounded-xl text-xs font-bold dark:text-white focus:outline-none"
                    value={newAnggota.tanggalLahir}
                    onChange={(e) => setNewAnggota({ ...newAnggota, tanggalLahir: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 dark:text-zinc-550 uppercase tracking-wider mb-1">Pendidikan</label>
                  <input
                    type="text"
                    placeholder="Contoh: SLTA/SEDERAJAT"
                    className="w-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 rounded-xl text-xs font-bold dark:text-white focus:outline-none"
                    value={newAnggota.pendidikan}
                    onChange={(e) => setNewAnggota({ ...newAnggota, pendidikan: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 dark:text-zinc-550 uppercase tracking-wider mb-1">Pekerjaan</label>
                  <input
                    type="text"
                    placeholder="Contoh: WIRASWASTA"
                    className="w-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 rounded-xl text-xs font-bold dark:text-white focus:outline-none"
                    value={newAnggota.pekerjaan}
                    onChange={(e) => setNewAnggota({ ...newAnggota, pekerjaan: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 dark:text-zinc-550 uppercase tracking-wider mb-1">Status Perkawinan</label>
                  <select
                    className="w-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 rounded-xl text-xs font-bold dark:text-white focus:outline-none"
                    value={newAnggota.statusKawin}
                    onChange={(e) => setNewAnggota({ ...newAnggota, statusKawin: e.target.value })}
                  >
                    <option value="BELUM_KAWIN">Belum Kawin</option>
                    <option value="KAWIN">Kawin</option>
                    <option value="CERAI_HIDUP">Cerai Hidup</option>
                    <option value="CERAI_MATI">Cerai Mati</option>
                  </select>
                </div>

                <div className="flex items-end sm:col-span-2">
                  <button
                    type="button"
                    onClick={handleAddAnggota}
                    className="w-full bg-indigo-650 hover:bg-indigo-700 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    Tambah Anggota (+)
                  </button>
                </div>
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
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-2xl text-sm shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                Simpan Keluarga & Warga
              </button>
            </div>
          </form>
        </div>
      )}

      {/* KARTU DAFTAR WARGA (TABLE) */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800/80 rounded-3xl shadow-sm overflow-hidden animate-fade-in">
        <div className="px-6 py-5 border-b border-zinc-150 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/40 dark:bg-zinc-950/20">
          <span className="font-extrabold text-sm text-zinc-700 dark:text-zinc-305 flex items-center gap-2">
            <Users className="w-4.5 h-4.5 text-indigo-500" />
            Daftar Kartu Keluarga Terdaftar
          </span>
          <span className="text-xs bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 font-black px-3 py-1 rounded-full">{keluargaList.length} KK</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50/20 dark:bg-zinc-950/10 text-zinc-400 dark:text-zinc-500 text-xs font-bold border-b border-zinc-100 dark:border-zinc-800">
              <tr>
                <th className="p-4.5">No KK</th>
                <th className="p-4.5">Alamat Lengkap</th>
                <th className="p-4.5">RT / RW</th>
                <th className="p-4.5">Anggota</th>
                <th className="p-4.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-850">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-16 text-center">
                    <div className="flex justify-center items-center gap-2.5">
                      <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-xs text-zinc-400 font-bold">Memuat data warga...</span>
                    </div>
                  </td>
                </tr>
              ) : keluargaList.length > 0 ? (
                keluargaList.map((kk: any) => (
                  <tr key={kk.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-950/20 transition-all dark:text-zinc-300">
                    <td className="p-4.5 font-mono font-bold text-indigo-700 dark:text-indigo-400">{kk.noKK}</td>
                    <td className="p-4.5 font-bold text-zinc-800 dark:text-zinc-200">{kk.alamat}</td>
                    <td className="p-4.5 text-xs font-black text-zinc-400 dark:text-zinc-500">RT {kk.rt} / RW {kk.rw}</td>
                    <td className="p-4.5">
                      <span className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-xs px-3 py-1 rounded-full font-extrabold flex items-center gap-1.5 w-fit">
                        <Users size={12} />
                        {kk.anggota?.length || 0} Jiwa
                      </span>
                    </td>
                    <td className="p-4.5 text-right">
                      <button
                        onClick={() => alert(`Daftar Anggota Keluarga:\n\n` + kk.anggota.map((a: any) => `- ${a.nama} (${a.hubungan})`).join("\n"))}
                        className="text-xs bg-zinc-50 dark:bg-zinc-950 hover:bg-indigo-50 hover:text-indigo-650 dark:hover:bg-indigo-950 dark:hover:text-indigo-400 text-zinc-700 dark:text-zinc-300 font-extrabold border border-zinc-200 dark:border-zinc-800 rounded-xl px-4.5 py-2.5 transition-all cursor-pointer inline-flex items-center gap-1.5 active:scale-98 shadow-sm"
                      >
                        <Eye size={12} className="shrink-0" />
                        Detail KK
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-16 text-center text-zinc-400 dark:text-zinc-500">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <AlertCircle className="w-10 h-10 text-zinc-300 dark:text-zinc-700" />
                      <p className="text-sm font-extrabold text-zinc-700 dark:text-zinc-300">Data Warga Kosong</p>
                      <p className="text-xs text-zinc-400 dark:text-zinc-500 max-w-sm leading-relaxed">Gunakan tombol di atas untuk menambah manual warga baru atau mengunggah scan KK via AI OCR.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
