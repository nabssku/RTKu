"use client";

import React, { useState, useEffect } from "react";
import { CreditCard, Plus, ArrowUpRight, DollarSign, Clock, User, Sparkles, Wallet } from "lucide-react";

export default function IuranPage() {
  const [iuranList, setIuranList] = useState<any[]>([]);
  const [wargaList, setWargaList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [userRole, setUserRole] = useState("WARGA");

  // Form Kategori Iuran
  const [openFormKategori, setOpenFormKategori] = useState(false);
  const [formKategori, setFormKategori] = useState({
    nama: "",
    nominal: "",
    deskripsi: "",
    periode: "Bulanan"
  });

  // Form Bayar
  const [openFormBayar, setOpenFormBayar] = useState(false);
  const [formBayar, setFormBayar] = useState({
    wargaId: "",
    iuranId: "",
    periode: ""
  });

  useEffect(() => {
    fetchData();
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

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [resIuran, resWarga] = await Promise.all([
        fetch("/api/iuran"),
        fetch("/api/warga")
      ]);

      const jsonIuran = await resIuran.json();
      const jsonWarga = await resWarga.json();

      if (jsonIuran.data) setIuranList(jsonIuran.data);
      if (jsonWarga.data) {
        const flatWarga = jsonWarga.data.flatMap((k: any) => k.anggota);
        setWargaList(flatWarga);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKategoriSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/iuran", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formKategori)
      });
      if (res.ok) {
        alert("Kategori iuran baru berhasil didaftarkan.");
        setOpenFormKategori(false);
        setFormKategori({ nama: "", nominal: "", deskripsi: "", periode: "Bulanan" });
        fetchData();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleBayarSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPaying(true);
    try {
      const res = await fetch("/api/iuran/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formBayar)
      });
      const data = await res.json();

      if (res.ok && data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        alert("Gagal memproses pembayaran: " + (data.error || "Gagal membuat invoice"));
      }
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan koneksi ke payment gateway.");
    } finally {
      setIsPaying(false);
    }
  };

  const handleWargaPay = async (iuranId: string) => {
    if (wargaList.length === 0) {
      alert("Data warga Anda belum terdaftar. Silakan unggah KK di menu Warga terlebih dahulu.");
      return;
    }
    const targetWarga = wargaList[0];

    setIsPaying(true);
    try {
      const res = await fetch("/api/iuran/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wargaId: targetWarga.id,
          iuranId,
          periode: new Date().toLocaleDateString("id-ID", { month: "long", year: "numeric" })
        })
      });
      const data = await res.json();

      if (res.ok && data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        alert("Gagal memproses pembayaran: " + (data.error || "Gagal membuat invoice"));
      }
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan koneksi.");
    } finally {
      setIsPaying(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 border-b border-zinc-150 dark:border-zinc-800/80 pb-6">
        <div className="space-y-1">
          <h1 className="text-3.5xl font-black bg-gradient-to-r from-zinc-900 via-indigo-900 to-indigo-700 bg-clip-text text-transparent dark:from-white dark:to-zinc-300">
            Manajemen Iuran & Kas Warga
          </h1>
          <p className="text-zinc-550 dark:text-zinc-400 text-sm font-medium">Kelola ketetapan iuran wajib/sosial, rekam pembayaran, dan integrasi digital invoice.</p>
        </div>
        {userRole === "KETUA_RT" && (
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setOpenFormKategori(true)}
              className="bg-zinc-900 hover:bg-zinc-850 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-zinc-800 text-white font-extrabold text-xs md:text-sm px-5 py-3 rounded-2xl shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-98"
            >
              <Plus className="w-4 h-4" />
              Kategori Iuran
            </button>
            <button
              onClick={() => setOpenFormBayar(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs md:text-sm px-5 py-3 rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer active:scale-98"
            >
              <DollarSign className="w-4 h-4" />
              Tagih / Bayar Iuran
            </button>
          </div>
        )}
      </div>

      {/* FORM KATEGORI IURAN */}
      {openFormKategori && (
        <div className="bg-white dark:bg-zinc-900 p-6 md:p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xl space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex justify-between items-center border-b border-zinc-150 dark:border-zinc-800/80 pb-4">
            <h2 className="text-lg font-black text-zinc-850 dark:text-zinc-100 flex items-center gap-2">
              <Plus className="w-5 h-5 text-indigo-500" />
              Buat Kategori Iuran Baru
            </h2>
            <button onClick={() => setOpenFormKategori(false)} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-sm font-bold">Tutup</button>
          </div>

          <form onSubmit={handleKategoriSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Nama Kategori Iuran</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Iuran Keamanan, Uang Kas"
                  className="w-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-4 py-3 rounded-2xl text-sm font-semibold dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  value={formKategori.nama}
                  onChange={(e) => setFormKategori({ ...formKategori, nama: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Nominal Iuran (Rp)</label>
                <input
                  type="number"
                  required
                  placeholder="25000"
                  className="w-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-4 py-3 rounded-2xl text-sm font-semibold dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  value={formKategori.nominal}
                  onChange={(e) => setFormKategori({ ...formKategori, nominal: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Periode Penagihan</label>
                <select
                  className="w-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-4 py-3 rounded-2xl text-sm font-semibold dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  value={formKategori.periode}
                  onChange={(e) => setFormKategori({ ...formKategori, periode: e.target.value })}
                >
                  <option value="Bulanan">Bulanan</option>
                  <option value="Tahunan">Tahunan</option>
                  <option value="Insidental (Sekali)">Insidental (Sekali)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Keterangan / Rincian</label>
                <input
                  type="text"
                  placeholder="Digunakan untuk operasional satpam..."
                  className="w-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-4 py-3 rounded-2xl text-sm font-semibold dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  value={formKategori.deskripsi}
                  onChange={(e) => setFormKategori({ ...formKategori, deskripsi: e.target.value })}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-zinc-150 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setOpenFormKategori(false)}
                className="px-5 py-2.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-950 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300 font-extrabold rounded-2xl text-sm border border-zinc-200 dark:border-zinc-800 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-zinc-900 hover:bg-zinc-850 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white font-extrabold rounded-2xl text-sm shadow-md transition-all cursor-pointer active:scale-98"
              >
                Simpan Kategori
              </button>
            </div>
          </form>
        </div>
      )}

      {/* FORM PEMBAYARAN IURAN */}
      {openFormBayar && (
        <div className="bg-white dark:bg-zinc-900 p-6 md:p-8 rounded-3xl border border-indigo-200 dark:border-indigo-900/50 shadow-xl space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex justify-between items-center border-b border-zinc-150 dark:border-zinc-800 pb-4">
            <h2 className="text-lg font-black text-indigo-900 dark:text-indigo-400 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-indigo-500" />
              Tagih / Bayar Iuran Warga via Pakasir
            </h2>
            <button onClick={() => setOpenFormBayar(false)} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-sm font-bold">Tutup</button>
          </div>

          <form onSubmit={handleBayarSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Pilih Warga Pembayar</label>
                <select
                  required
                  className="w-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-4 py-3 rounded-2xl text-sm font-semibold dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  value={formBayar.wargaId}
                  onChange={(e) => setFormBayar({ ...formBayar, wargaId: e.target.value })}
                >
                  <option value="">-- Pilih Warga --</option>
                  {wargaList.map((w: any) => (
                    <option key={w.id} value={w.id}>{w.nama} (NIK: {w.nik || "-"})</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Pilih Kategori Iuran</label>
                <select
                  required
                  className="w-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-4 py-3 rounded-2xl text-sm font-semibold dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  value={formBayar.iuranId}
                  onChange={(e) => setFormBayar({ ...formBayar, iuranId: e.target.value })}
                >
                  <option value="">-- Pilih Iuran --</option>
                  {iuranList.map((i: any) => (
                    <option key={i.id} value={i.id}>{i.nama} - Rp {i.nominal.toLocaleString("id-ID")}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Periode Tagihan</label>
                <input
                  type="text"
                  required
                  placeholder="Juli 2026"
                  className="w-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-4 py-3 rounded-2xl text-sm font-semibold dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  value={formBayar.periode}
                  onChange={(e) => setFormBayar({ ...formBayar, periode: e.target.value })}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-zinc-150 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setOpenFormBayar(false)}
                className="px-5 py-2.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-950 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300 font-extrabold rounded-2xl text-sm border border-zinc-200 dark:border-zinc-800 transition-colors cursor-pointer"
                disabled={isPaying}
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isPaying}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-2xl text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 active:scale-98"
              >
                {isPaying ? "Membuat invoice..." : "Buat Link Pembayaran Pakasir"}
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* GRID KATEGORI IURAN */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full py-20 text-center text-zinc-400 animate-pulse font-bold">Memuat data iuran RT...</div>
        ) : iuranList.length > 0 ? (
          iuranList.map((iuran: any) => (
            <div key={iuran.id} className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-150 dark:border-zinc-800/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group hover:-translate-y-1">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="w-11 h-11 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center shadow-inner">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <span className="bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full">
                    {iuran.periode}
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="font-black text-lg text-zinc-850 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{iuran.nama}</h3>
                  <p className="text-zinc-400 dark:text-zinc-500 text-xs leading-relaxed min-h-[32px]">{iuran.deskripsi || "Tidak ada rincian keterangan iuran."}</p>
                </div>

                <div className="pt-3">
                  <span className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Nominal Tagihan</span>
                  <p className="text-2xl font-black text-zinc-900 dark:text-white mt-0.5">Rp {iuran.nominal.toLocaleString("id-ID")}</p>
                </div>
              </div>

              {/* Payment Section for WARGA or KETUA_RT */}
              {userRole === "WARGA" ? (
                <div className="pt-5 mt-5 border-t border-zinc-150 dark:border-zinc-800/80 space-y-3">
                  {(() => {
                    const myPayment = iuran.pembayaran?.find((p: any) => wargaList.some((w: any) => w.id === p.wargaId));
                    if (myPayment?.statusPembayaran === "PAID") {
                      return (
                        <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 p-3 rounded-2xl text-center text-xs font-black text-emerald-700 dark:text-emerald-450">
                          ✅ Lunas
                        </div>
                      );
                    }
                    if (myPayment?.statusPembayaran === "PENDING" && myPayment?.paymentUrl) {
                      return (
                        <a
                          href={myPayment.paymentUrl}
                          className="w-full bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs py-3 rounded-2xl block text-center shadow-md active:scale-98 transition-all"
                        >
                          Lanjutkan Pembayaran
                        </a>
                      );
                    }
                    return (
                      <button
                        onClick={() => handleWargaPay(iuran.id)}
                        disabled={isPaying}
                        className="w-full bg-indigo-650 hover:bg-indigo-700 text-white font-extrabold text-xs py-3 rounded-2xl block text-center shadow-md active:scale-98 transition-all cursor-pointer"
                      >
                        {isPaying ? "Memproses..." : "Bayar Sekarang"}
                      </button>
                    );
                  })()}
                </div>
              ) : (
                <div className="pt-6 mt-6 border-t border-zinc-100 dark:border-zinc-800 space-y-3">
                  <p className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                    <Clock className="w-3 h-3" /> Riwayat Penagihan Terakhir
                  </p>
                  {iuran.pembayaran?.length > 0 ? (
                    <ul className="text-xs space-y-2.5">
                      {iuran.pembayaran.slice(0, 3).map((p: any) => (
                        <li key={p.id} className="flex justify-between items-center p-2 rounded-xl bg-zinc-50 dark:bg-zinc-955/40 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800 transition-colors">
                          <span className="truncate w-[60%] text-zinc-650 dark:text-zinc-400 font-bold inline-flex items-center gap-2" title={p.warga?.nama}>
                            <User className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                            {p.warga?.nama || "Warga"}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-bold text-zinc-400">{p.periode}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                              p.statusPembayaran === "PAID" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400" :
                              p.statusPembayaran === "PENDING" ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400" :
                              "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-455"
                            }`}>
                              {p.statusPembayaran}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-zinc-400 dark:text-zinc-600 italic font-medium">Belum ada catatan iuran masuk.</p>
                  )}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center text-zinc-400 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl font-medium">
            Belum ada kategori iuran terdaftar. Silakan buat dengan tombol di atas.
          </div>
        )}
      </div>
    </div>
  );
}
