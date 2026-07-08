"use client";

import React, { useState, useEffect } from "react";
import { Package, Plus, QrCode, ClipboardList, Info, Check, XCircle, AlertCircle, RefreshCw } from "lucide-react";

export default function InventarisPage() {
  const [listAsset, setListAsset] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openForm, setOpenForm] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const [userRole, setUserRole] = useState("WARGA");
  const [userPhone, setUserPhone] = useState("");

  const [formData, setFormData] = useState({
    nama: "",
    jumlah: "1",
    kondisi: "BAIK",
    lokasi: ""
  });

  useEffect(() => {
    fetchAsset();
    fetchRole();
  }, []);

  const fetchRole = async () => {
    try {
      const res = await fetch("/api/rt/profile");
      const json = await res.json();
      if (json.role) {
        setUserRole(json.role);
      }
      // Also get the phone number of the current user from Warga API
      const resWarga = await fetch("/api/warga");
      const jsonWarga = await resWarga.json();
      // Warga API GET logic maps Warga.telepon -> Warga.phone equivalent, let's see.
      // In GET api/warga we fetched dbUser structure which contains phone number.
      // We can also fetch '/api/warga' or query user phone directly.
      // Actually /api/rt/profile doesn't send the phone directly, but let's query it.
      // Wait, we can fetch all warga list and since for WARGA it only returns their family,
      // the first member will have the matching telepon!
      if (jsonWarga.data && jsonWarga.data.length > 0) {
        const matchingMember = jsonWarga.data[0].anggota?.find((a: any) => a.hubungan === "KEPALA_KELUARGA");
        if (matchingMember) {
          setUserPhone(matchingMember.telepon || "");
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handlePinjam = async (assetId: string) => {
    const ket = prompt("Masukkan keterangan peminjaman (contoh: untuk rapat warga):");
    if (ket === null) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/inventaris/pinjam", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inventarisId: assetId, keterangan: ket })
      });
      if (res.ok) {
        alert("Aset inventaris berhasil dipinjam.");
        fetchAsset();
      } else {
        const json = await res.json();
        alert("Gagal meminjam: " + (json.error || "Server issue"));
      }
    } catch (e) {
      console.error(e);
      alert("Terjadi kesalahan koneksi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKembalikan = async (peminjamanId: string) => {
    if (!confirm("Apakah Anda yakin ingin mengembalikan barang ini?")) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/inventaris/pinjam", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ peminjamanId })
      });
      if (res.ok) {
        alert("Aset inventaris berhasil dikembalikan.");
        fetchAsset();
      } else {
        const json = await res.json();
        alert("Gagal mengembalikan: " + (json.error || "Server issue"));
      }
    } catch (e) {
      console.error(e);
      alert("Terjadi kesalahan koneksi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchAsset = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/inventaris");
      const json = await res.json();
      if (json.data) setListAsset(json.data);
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
      const res = await fetch("/api/inventaris", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        alert("Aset inventaris baru berhasil disimpan.");
        setFormData({ nama: "", jumlah: "1", kondisi: "BAIK", lokasi: "" });
        setOpenForm(false);
        fetchAsset();
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
            Inventaris & Aset RT
          </h1>
          <p className="text-slate-500 text-sm mt-1">Daftar aset kepunyaan bersama, monitoring status peminjaman, serta cetak label identitas QR Code.</p>
        </div>
        {userRole === "KETUA_RT" && (
          <button
            onClick={() => setOpenForm(!openForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs md:text-sm px-4 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Tambah Aset Baru
          </button>
        )}
      </div>

      {/* FORM INPUT ASET */}
      {openForm && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-950 p-6 md:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Plus className="w-5 h-5 text-blue-500" />
            Pendaftaran Aset / Barang RT Baru
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Nama Barang / Aset</label>
              <input
                type="text"
                required
                placeholder="Misal: Tenda Utama, Sound System Portabel, Kursi Plastik"
                className="w-full border dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-2.5 rounded-xl text-sm dark:text-white"
                value={formData.nama}
                onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Jumlah Unit (Pcs)</label>
              <input
                type="number"
                required
                min="1"
                placeholder="10"
                className="w-full border dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-2.5 rounded-xl text-sm dark:text-white"
                value={formData.jumlah}
                onChange={(e) => setFormData({ ...formData, jumlah: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Kondisi Fisik</label>
              <select
                className="w-full border dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-2.5 rounded-xl text-sm dark:text-white focus:outline-none"
                value={formData.kondisi}
                onChange={(e) => setFormData({ ...formData, kondisi: e.target.value })}
              >
                <option value="BAIK">Baik</option>
                <option value="RUSAK_RINGAN">Rusak Ringan</option>
                <option value="RUSAK_BERAT">Rusak Berat</option>
                <option value="HILANG">Hilang</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Lokasi Gudang / Penyimpanan</label>
              <input
                type="text"
                placeholder="Pos Satpam, Rumah Ketua RT..."
                className="w-full border dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-2.5 rounded-xl text-sm dark:text-white"
                value={formData.lokasi}
                onChange={(e) => setFormData({ ...formData, lokasi: e.target.value })}
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
              className="px-5 py-2 bg-slate-900 hover:bg-slate-850 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold rounded-xl text-sm shadow-md transition-colors"
            >
              {isSubmitting ? "Menyimpan..." : "Simpan Barang"}
            </button>
          </div>
        </form>
      )}

      {/* ASSSETS LIST TABLE */}
      <div className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/20">
          <span className="font-extrabold text-sm text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-indigo-500" />
            Daftar Barang & Peralatan Bersama
          </span>
          <button onClick={fetchAsset} className="text-slate-400 hover:text-slate-650 cursor-pointer">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/20 dark:bg-slate-900/10 text-slate-500 text-xs font-bold border-b dark:border-slate-800">
              <tr>
                <th className="p-4">Nama Aset</th>
                <th className="p-4">Jumlah Stok</th>
                <th className="p-4">Kondisi Fisik</th>
                <th className="p-4">Tempat Penyimpanan</th>
                <th className="p-4">Status Pinjam</th>
                <th className="p-4 text-right">Identitas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {isLoading ? (
                <tr><td colSpan={6} className="p-12 text-center text-slate-450 animate-pulse">Loading data inventaris...</td></tr>
              ) : listAsset.length > 0 ? (
                listAsset.map((asset: any) => (
                  <tr key={asset.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors dark:text-slate-300">
                    <td className="p-4 font-bold text-slate-800 dark:text-slate-200">{asset.nama}</td>
                    <td className="p-4 font-semibold text-slate-650">{asset.jumlah} Unit</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                        asset.kondisi === "BAIK" ? "bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-400" :
                        asset.kondisi === "RUSAK_RINGAN" ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400" :
                        "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400"
                      }`}>
                        {asset.kondisi}
                      </span>
                    </td>
                    <td className="p-4 text-slate-500 text-xs">{asset.lokasi || "-"}</td>
                    <td className="p-4">
                      {asset.peminjaman?.length > 0 ? (
                        <div className="space-y-1">
                          <span className="text-amber-600 text-xs font-bold inline-flex items-center gap-1">
                            <AlertCircle size={12} /> Dipinjam
                          </span>
                          <p className="text-[10px] text-zinc-400 font-bold">Oleh: {asset.peminjaman[0].peminjam}</p>
                        </div>
                      ) : (
                        <span className="text-green-600 text-xs font-bold inline-flex items-center gap-1">
                          <Check size={12} /> Tersedia
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right flex items-center justify-end gap-2.5">
                      {userRole === "WARGA" ? (
                        (() => {
                          const isBorrowed = asset.peminjaman?.length > 0;
                          if (!isBorrowed) {
                            return (
                              <button
                                onClick={() => handlePinjam(asset.id)}
                                className="bg-indigo-600 hover:bg-indigo-750 text-white text-xs font-extrabold px-3 py-1.5 rounded-xl cursor-pointer"
                              >
                                Pinjam
                              </button>
                            );
                          }
                          const isMyBorrowing = asset.peminjaman[0].telepon === userPhone;
                          if (isMyBorrowing) {
                            return (
                              <button
                                onClick={() => handleKembalikan(asset.peminjaman[0].id)}
                                className="bg-emerald-650 hover:bg-emerald-700 text-white text-xs font-extrabold px-3 py-1.5 rounded-xl cursor-pointer"
                              >
                                Kembalikan
                              </button>
                            );
                          }
                          return (
                            <span className="text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-450 px-3 py-1.5 rounded-xl font-bold">
                              Dipinjam
                            </span>
                          );
                        })()
                      ) : (
                        <>
                          {asset.peminjaman?.length > 0 && (
                            <button
                              onClick={() => handleKembalikan(asset.peminjaman[0].id)}
                              className="bg-emerald-650 hover:bg-emerald-700 text-white text-xs font-extrabold px-3 py-1.5 rounded-xl cursor-pointer bg-emerald-600 flex items-center justify-center"
                            >
                              Kembalikan
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedAsset(asset)}
                            className="inline-flex items-center gap-1 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-350 text-xs font-bold border dark:border-slate-800 px-3 py-1.5 rounded-lg cursor-pointer transition-colors"
                          >
                            <QrCode size={12} />
                            Lihat QR
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-400">Belum ada inventaris barang terdaftar.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAIL QR CODE MODAL */}
      {selectedAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-950 max-w-sm w-full rounded-2xl border dark:border-slate-800 shadow-2xl p-6 space-y-6 text-center animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start border-b pb-3 text-left">
              <div>
                <h3 className="font-bold text-slate-800 dark:text-white">{selectedAsset.nama}</h3>
                <p className="text-xs text-slate-400 mt-0.5">Kode Aset RTKu</p>
              </div>
              <button onClick={() => setSelectedAsset(null)} className="text-slate-400 hover:text-slate-650 text-sm font-semibold">Tutup</button>
            </div>

            {/* QR CODE IMAGE RENDER */}
            <div className="flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border dark:border-slate-800/80">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/api/inventaris/qrcode?id=${selectedAsset.id}`}
                alt={`QR Code ${selectedAsset.nama}`}
                className="w-48 h-48 rounded-lg shadow-sm"
              />
              <p className="text-[10px] text-slate-400 font-mono mt-3">ID: {selectedAsset.id}</p>
            </div>

            <div className="text-xs text-slate-400 leading-relaxed">
              Cetak QR Code ini dan tempelkan pada aset fisik untuk mempermudah identifikasi inventaris dan tracking peminjaman warga.
            </div>

            <div className="pt-2 border-t dark:border-slate-800 flex justify-end">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Print Label
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}