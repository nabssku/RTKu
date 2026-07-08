"use client";

import React, { useState, useEffect } from "react";
import { Wallet, TrendingUp, TrendingDown, ArrowRightLeft, DollarSign, Calendar, Plus, RefreshCw } from "lucide-react";

export default function KeuanganPage() {
  const [listKeuangan, setListKeuangan] = useState([]);
  const [saldo, setSaldo] = useState(0);
  const [totalPemasukan, setTotalPemasukan] = useState(0);
  const [totalPengeluaran, setTotalPengeluaran] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openForm, setOpenForm] = useState(false);

  const [formData, setFormData] = useState({
    jenis: "PEMASUKAN",
    kategori: "Donasi Warga",
    nominal: "",
    keterangan: ""
  });

  useEffect(() => {
    fetchKeuangan();
  }, []);

  const fetchKeuangan = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/keuangan");
      const json = await res.json();
      if (json.data) {
        setListKeuangan(json.data);
        
        let pemasuk = 0;
        let pengeluar = 0;
        json.data.forEach((trx: any) => {
          if (trx.jenis === "PEMASUKAN") pemasuk += trx.nominal;
          else pengeluar += trx.nominal;
        });
        setTotalPemasukan(pemasuk);
        setTotalPengeluaran(pengeluar);
      }
      if (json.saldo !== undefined) setSaldo(json.saldo);
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
      const res = await fetch("/api/keuangan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        alert("Arus kas keuangan baru berhasil dicatat.");
        setFormData({ jenis: "PEMASUKAN", kategori: "Donasi Warga", nominal: "", keterangan: "" });
        setOpenForm(false);
        fetchKeuangan();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const pctPemasukan = totalPemasukan + totalPengeluaran > 0 ? (totalPemasukan / (totalPemasukan + totalPengeluaran)) * 100 : 50;
  const pctPengeluaran = totalPemasukan + totalPengeluaran > 0 ? (totalPengeluaran / (totalPemasukan + totalPengeluaran)) * 100 : 50;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-3xl font-black bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent dark:from-white dark:to-slate-400">
            Jurnal Keuangan & Kas RT
          </h1>
          <p className="text-slate-500 text-sm mt-1">Transparansi rekap pemasukan, pengeluaran kas, serta laporan jurnal transaksi terperinci.</p>
        </div>
        <button
          onClick={() => setOpenForm(!openForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs md:text-sm px-4 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Catat Transaksi Baru
        </button>
      </div>

      {/* QUICK STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-800/80 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/5 rounded-bl-[40px] group-hover:scale-110 transition-transform"></div>
          <div className="p-3 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-xl w-fit">
            <Wallet size={20} />
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-4">Total Saldo Kas RT</p>
          <p className="text-3xl font-black text-slate-800 dark:text-slate-100 mt-1">Rp {saldo.toLocaleString("id-ID")}</p>
        </div>

        <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-800/80 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-green-500/5 rounded-bl-[40px] group-hover:scale-110 transition-transform"></div>
          <div className="p-3 bg-green-50 dark:bg-green-950/40 text-green-600 dark:text-green-400 rounded-xl w-fit">
            <TrendingUp size={20} />
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-4">Total Pemasukan</p>
          <p className="text-3xl font-black text-green-600 dark:text-green-400 mt-1">Rp {totalPemasukan.toLocaleString("id-ID")}</p>
        </div>

        <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-800/80 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-rose-500/5 rounded-bl-[40px] group-hover:scale-110 transition-transform"></div>
          <div className="p-3 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-xl w-fit">
            <TrendingDown size={20} />
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-4">Total Pengeluaran</p>
          <p className="text-3xl font-black text-rose-600 dark:text-rose-450 mt-1">Rp {totalPengeluaran.toLocaleString("id-ID")}</p>
        </div>
      </div>

      {/* COMPARATIVE VISUAL CHART (CUSTOM COMPARISON BAR) */}
      <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-800/80 shadow-sm space-y-4">
        <h3 className="font-extrabold text-sm text-slate-700 dark:text-slate-300">Rasio Pemasukan & Pengeluaran</h3>
        <div className="space-y-2">
          {/* Progress bar */}
          <div className="h-6 w-full rounded-full bg-slate-100 dark:bg-slate-900 overflow-hidden flex">
            {totalPemasukan + totalPengeluaran > 0 ? (
              <>
                <div style={{ width: `${pctPemasukan}%` }} className="bg-green-500 h-full transition-all duration-500"></div>
                <div style={{ width: `${pctPengeluaran}%` }} className="bg-rose-500 h-full transition-all duration-500"></div>
              </>
            ) : (
              <div className="w-full bg-slate-350 h-full flex items-center justify-center text-[10px] text-slate-400 font-bold">Belum Ada Rasio Data</div>
            )}
          </div>
          <div className="flex justify-between items-center text-xs text-slate-400 font-bold">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-green-500"></span> Pemasukan ({pctPemasukan.toFixed(0)}%)</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Pengeluaran ({pctPengeluaran.toFixed(0)}%)</span>
          </div>
        </div>
      </div>

      {/* FORM INPUT TRANSAKSI */}
      {openForm && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-950 p-6 md:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Plus className="w-5 h-5 text-blue-500" />
            Catat Arus Keuangan Kas Baru
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Jenis Arus Kas</label>
              <select
                className="w-full border dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-2.5 rounded-xl text-sm dark:text-white focus:outline-none"
                value={formData.jenis}
                onChange={(e) => setFormData({ ...formData, jenis: e.target.value })}
              >
                <option value="PEMASUKAN">Kas Masuk (Pemasukan)</option>
                <option value="PENGELUARAN">Kas Keluar (Pengeluaran)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Kategori Kas</label>
              <input
                type="text"
                required
                placeholder="Misal: Bantuan Sosial, Pembelian Tenda, Kas Masjid"
                className="w-full border dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-2.5 rounded-xl text-sm dark:text-white"
                value={formData.kategori}
                onChange={(e) => setFormData({ ...formData, kategori: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Nominal Transaksi (Rp)</label>
              <input
                type="number"
                required
                placeholder="100000"
                className="w-full border dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-2.5 rounded-xl text-sm dark:text-white"
                value={formData.nominal}
                onChange={(e) => setFormData({ ...formData, nominal: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Rincian Keterangan</label>
              <input
                type="text"
                placeholder="Pembayaran oleh Bapak A untuk sumbangan duka..."
                className="w-full border dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-2.5 rounded-xl text-sm dark:text-white"
                value={formData.keterangan}
                onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
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
              {isSubmitting ? "Mencatat..." : "Simpan Transaksi"}
            </button>
          </div>
        </form>
      )}

      {/* TABLE JURNAL TRANSAKSI */}
      <div className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/20">
          <span className="font-extrabold text-sm text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <ArrowRightLeft className="w-4 h-4 text-indigo-500" />
            Jurnal Transaksi Kas RT Lengkap
          </span>
          <button onClick={fetchKeuangan} className="text-slate-400 hover:text-slate-650 cursor-pointer">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/20 dark:bg-slate-900/10 text-slate-500 text-xs font-bold border-b dark:border-slate-800">
              <tr>
                <th className="p-4">Tanggal Transaksi</th>
                <th className="p-4">Jenis</th>
                <th className="p-4">Kategori Kas</th>
                <th className="p-4">Rincian Keterangan</th>
                <th className="p-4 text-right">Nominal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {isLoading ? (
                <tr><td colSpan={5} className="p-12 text-center text-slate-400">Loading rekap kas...</td></tr>
              ) : listKeuangan.length > 0 ? (
                listKeuangan.map((trx: any) => (
                  <tr key={trx.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors dark:text-slate-300">
                    <td className="p-4 text-xs font-bold text-slate-500">
                      {new Date(trx.tanggal).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                        trx.jenis === "PEMASUKAN" ? "bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-400" : "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400"
                      }`}>
                        {trx.jenis}
                      </span>
                    </td>
                    <td className="p-4 font-bold">{trx.kategori}</td>
                    <td className="p-4 text-slate-500 text-xs">{trx.keterangan || "-"}</td>
                    <td className={`p-4 text-right font-black ${trx.jenis === "PEMASUKAN" ? "text-green-600" : "text-red-500"}`}>
                      {trx.jenis === "PEMASUKAN" ? "+" : "-"} Rp {trx.nominal.toLocaleString("id-ID")}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-450 italic">Belum ada kas masuk/keluar yang dicatat.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}