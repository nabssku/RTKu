"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Users, CreditCard, Mail, Wallet, AlertTriangle, ArrowRight, Sparkles, ChevronRight, Megaphone, Shield, MessageSquare, Package } from "lucide-react";

export default function DashboardBeranda() {
  const [stats, setStats] = useState({
    warga: 0,
    kk: 0,
    iuranStatus: "0 Terkumpul",
    saldo: "Rp 0",
    suratCount: 0,
    pengaduanOpen: 0
  });
  const [rtProfile, setRtProfile] = useState<any>({
    id: "",
    name: "RT Anda",
    isActive: true,
    trialEnd: null,
  });
  const [userRole, setUserRole] = useState("WARGA");
  const [isLoading, setIsLoading] = useState(true);

  // Load all statistics
  useEffect(() => {
    async function loadDashboard() {
      setIsLoading(true);
      try {
        const [resWarga, resKeuangan, resSurat, resPengaduan, resProfile] = await Promise.all([
          fetch("/api/warga"),
          fetch("/api/keuangan"),
          fetch("/api/surat/generate"),
          fetch("/api/pengaduan"),
          fetch("/api/rt/profile")
        ]);

        let warga = 0, kk = 0, saldo = 0, surat = 0, pengaduan = 0;

        if (resWarga.ok) {
          const jsonWarga = await resWarga.json();
          kk = jsonWarga.data?.length || 0;
          warga = jsonWarga.data?.reduce((acc: number, k: any) => acc + (k.anggota?.length || 0), 0) || 0;
        }

        if (resKeuangan.ok) {
          const jsonKeuangan = await resKeuangan.json();
          saldo = jsonKeuangan.saldo || 0;
        }

        if (resSurat.ok) {
          const jsonSurat = await resSurat.json();
          surat = jsonSurat.data?.length || 0;
        }

        if (resPengaduan.ok) {
          const jsonPengaduan = await resPengaduan.json();
          pengaduan = jsonPengaduan.data?.filter((p: any) => p.status === "DITERIMA" || p.status === "DIPROSES").length || 0;
        }

        setStats({
          warga,
          kk,
          iuranStatus: "10 Lunas",
          saldo: new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(saldo),
          suratCount: surat,
          pengaduanOpen: pengaduan
        });

        if (resProfile.ok) {
          const jsonProfile = await resProfile.json();
          setRtProfile({
            id: jsonProfile.data?.id || "",
            name: jsonProfile.data?.name || "RT Anda",
            isActive: jsonProfile.data?.isActive || false,
            trialEnd: jsonProfile.data?.trialEnd,
          });
          setUserRole(jsonProfile.role || "WARGA");
        }

      } catch (error) {
        console.error("Dashboard error", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboard();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-[60vh] space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-zinc-550 dark:text-zinc-400 font-bold animate-pulse text-sm">Menghubungkan ke server RTKu...</p>
      </div>
    );
  }

  const msRemaining = new Date(rtProfile.trialEnd).getTime() - Date.now();
  const daysRemaining = Math.max(0, Math.ceil(msRemaining / (1000 * 60 * 60 * 24)));

  return (
    <div className="space-y-10 max-w-6xl mx-auto animate-fade-in">
      {/* Header Profile & Activation Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-4 border-b border-zinc-150 dark:border-zinc-900/60">
        <div>
          <h1 className="text-3.5xl font-black tracking-tight bg-gradient-to-r from-zinc-900 via-indigo-900 to-indigo-700 bg-clip-text text-transparent dark:from-white dark:to-zinc-300">
            {rtProfile.name}
          </h1>
          <p className="text-zinc-550 dark:text-zinc-400 text-sm font-medium mt-1.5">Selamat datang kembali! Berikut ringkasan administrasi hari ini.</p>
        </div>

        {/* Trial banner */}
        {!rtProfile.isActive && userRole === "KETUA_RT" && (
          <Link
            href="/pengaturan"
            className="flex items-center gap-3.5 px-4.5 py-2.5 bg-amber-500/10 hover:bg-amber-500/15 border border-amber-500/20 rounded-2xl transition-all group cursor-pointer shadow-sm"
          >
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping"></div>
            <span className="text-xs font-extrabold text-amber-700 dark:text-amber-450">
              Masa Trial: {daysRemaining} Hari Lagi. Upgrade Sekarang
            </span>
            <ChevronRight className="w-4 h-4 text-amber-500 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        )}
      </div>

      {/* QUICK STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Warga */}
        <div className="bg-white dark:bg-zinc-905 p-6 border border-zinc-150 dark:border-zinc-800/80 rounded-3xl shadow-sm hover:shadow-md transition-all flex items-center space-x-5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-500/5 rounded-bl-[50px] group-hover:scale-110 transition-transform"></div>
          <div className="p-3.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-2xl">
            <Users size={24} />
          </div>
          <div className="space-y-0.5">
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Total Warga</p>
            <p className="text-2.5xl font-black text-zinc-900 dark:text-white mt-1">
              {stats.warga} <span className="text-xs font-bold text-zinc-400">jiwa</span>
            </p>
            <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-semibold">{stats.kk} Kepala Keluarga</p>
          </div>
        </div>

        {/* Saldo Kas RT */}
        <div className="bg-white dark:bg-zinc-905 p-6 border border-zinc-150 dark:border-zinc-800/80 rounded-3xl shadow-sm hover:shadow-md transition-all flex items-center space-x-5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/5 rounded-bl-[50px] group-hover:scale-110 transition-transform"></div>
          <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-2xl">
            <Wallet size={24} />
          </div>
          <div className="space-y-0.5">
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Saldo Kas RT</p>
            <p className="text-2.5xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{stats.saldo}</p>
            <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-semibold">Selalu update real-time</p>
          </div>
        </div>

        {/* Tagihan Iuran */}
        <div className="bg-white dark:bg-zinc-905 p-6 border border-zinc-150 dark:border-zinc-800/80 rounded-3xl shadow-sm hover:shadow-md transition-all flex items-center space-x-5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-500/5 rounded-bl-[50px] group-hover:scale-110 transition-transform"></div>
          <div className="p-3.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-650 dark:text-indigo-400 rounded-2xl">
            <CreditCard size={24} />
          </div>
          <div className="space-y-0.5">
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Tagihan Iuran</p>
            <p className="text-2.5xl font-black text-zinc-900 dark:text-white mt-1">Laporan</p>
            <Link href="/iuran" className="text-[10px] text-indigo-500 dark:text-indigo-400 font-bold hover:underline inline-flex items-center gap-0.5 mt-1">
              Cek Rincian <ArrowRight size={10} />
            </Link>
          </div>
        </div>

        {/* Aduan Aktif */}
        <div className="bg-white dark:bg-zinc-905 p-6 border border-zinc-150 dark:border-zinc-800/80 rounded-3xl shadow-sm hover:shadow-md transition-all flex items-center space-x-5 relative overflow-hidden group">
          {stats.pengaduanOpen > 0 && (
            <span className="absolute top-4 right-4 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-rose-500"></span>
            </span>
          )}
          <div className="absolute top-0 right-0 w-20 h-20 bg-rose-500/5 rounded-bl-[50px] group-hover:scale-110 transition-transform"></div>
          <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-455 rounded-2xl">
            <AlertTriangle size={24} />
          </div>
          <div className="space-y-0.5">
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Aduan Aktif</p>
            <p className="text-2.5xl font-black text-rose-600 dark:text-rose-455 mt-1">{stats.pengaduanOpen} Laporan</p>
            <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-semibold">Perlu ditindaklanjuti</p>
          </div>
        </div>
      </div>

      {/* QUICK ACTIONS */}
      <div className="space-y-5">
        <h2 className="text-xl font-black text-zinc-850 dark:text-zinc-200">Aksi Cepat Layanan</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {userRole === "KETUA_RT" ? (
            <>
              {/* Ketua RT Actions */}
              <Link
                href="/warga"
                className="flex flex-col items-center p-6 bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800/80 shadow-sm hover:shadow-md rounded-3xl hover:bg-indigo-50/20 dark:hover:bg-indigo-950/15 hover:border-indigo-500/25 transition-all text-center group cursor-pointer"
              >
                <div className="w-13 h-13 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mb-4.5 group-hover:scale-105 transition-transform shadow-inner">
                  <Users size={24} />
                </div>
                <span className="text-sm font-extrabold text-zinc-800 dark:text-zinc-100">Tambah Warga</span>
                <span className="text-[10.5px] text-zinc-400 dark:text-zinc-500 mt-1.5 font-medium leading-relaxed">Input data via AI OCR KK</span>
              </Link>

              <Link
                href="/surat"
                className="flex flex-col items-center p-6 bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800/80 shadow-sm hover:shadow-md rounded-3xl hover:bg-indigo-50/20 dark:hover:bg-indigo-950/15 hover:border-indigo-500/25 transition-all text-center group cursor-pointer"
              >
                <div className="w-13 h-13 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mb-4.5 group-hover:scale-105 transition-transform shadow-inner">
                  <Mail size={24} />
                </div>
                <span className="text-sm font-extrabold text-zinc-800 dark:text-zinc-100">Buat Surat</span>
                <span className="text-[10.5px] text-zinc-400 dark:text-zinc-500 mt-1.5 font-medium leading-relaxed">Cetak PDF otomatis</span>
              </Link>

              <Link
                href="/iuran"
                className="flex flex-col items-center p-6 bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800/80 shadow-sm hover:shadow-md rounded-3xl hover:bg-emerald-50/20 dark:hover:bg-emerald-905/10 hover:border-emerald-500/25 transition-all text-center group cursor-pointer"
              >
                <div className="w-13 h-13 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mb-4.5 group-hover:scale-105 transition-transform shadow-inner">
                  <CreditCard size={24} />
                </div>
                <span className="text-sm font-extrabold text-zinc-800 dark:text-zinc-100">Tagih Iuran</span>
                <span className="text-[10.5px] text-zinc-400 dark:text-zinc-500 mt-1.5 font-medium leading-relaxed">Generate link pembayaran</span>
              </Link>

              <Link
                href="/pengumuman"
                className="flex flex-col items-center p-6 bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800/80 shadow-sm hover:shadow-md rounded-3xl hover:bg-rose-50/20 dark:hover:bg-rose-955/10 hover:border-rose-500/25 transition-all text-center group cursor-pointer"
              >
                <div className="w-13 h-13 bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-455 rounded-2xl flex items-center justify-center mb-4.5 group-hover:scale-105 transition-transform shadow-inner">
                  <Megaphone size={24} />
                </div>
                <span className="text-sm font-extrabold text-zinc-800 dark:text-zinc-100">Buat Pengumuman</span>
                <span className="text-[10.5px] text-zinc-400 dark:text-zinc-500 mt-1.5 font-medium leading-relaxed">Broadcast info ke mading</span>
              </Link>
            </>
          ) : (
            <>
              {/* Warga Actions */}
              <Link
                href="/warga"
                className="flex flex-col items-center p-6 bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800/80 shadow-sm hover:shadow-md rounded-3xl hover:bg-indigo-50/20 dark:hover:bg-indigo-950/15 hover:border-indigo-500/25 transition-all text-center group cursor-pointer"
              >
                <div className="w-13 h-13 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mb-4.5 group-hover:scale-105 transition-transform shadow-inner">
                  <Users size={24} />
                </div>
                <span className="text-sm font-extrabold text-zinc-800 dark:text-zinc-100">Data KK Warga</span>
                <span className="text-[10.5px] text-zinc-400 dark:text-zinc-500 mt-1.5 font-medium leading-relaxed">Lengkapi data keluarga via AI</span>
              </Link>

              <Link
                href="/iuran"
                className="flex flex-col items-center p-6 bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800/80 shadow-sm hover:shadow-md rounded-3xl hover:bg-emerald-50/20 dark:hover:bg-emerald-905/10 hover:border-emerald-500/25 transition-all text-center group cursor-pointer"
              >
                <div className="w-13 h-13 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mb-4.5 group-hover:scale-105 transition-transform shadow-inner">
                  <CreditCard size={24} />
                </div>
                <span className="text-sm font-extrabold text-zinc-800 dark:text-zinc-100">Bayar Iuran</span>
                <span className="text-[10.5px] text-zinc-400 dark:text-zinc-500 mt-1.5 font-medium leading-relaxed">Cek & bayar tagihan iuran digital</span>
              </Link>

              <Link
                href="/pengaduan"
                className="flex flex-col items-center p-6 bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800/80 shadow-sm hover:shadow-md rounded-3xl hover:bg-rose-50/20 dark:hover:bg-rose-955/10 hover:border-rose-500/25 transition-all text-center group cursor-pointer"
              >
                <div className="w-13 h-13 bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-455 rounded-2xl flex items-center justify-center mb-4.5 group-hover:scale-105 transition-transform shadow-inner">
                  <MessageSquare size={24} />
                </div>
                <span className="text-sm font-extrabold text-zinc-800 dark:text-zinc-100">Kirim Laporan</span>
                <span className="text-[10.5px] text-zinc-400 dark:text-zinc-550 mt-1.5 font-medium leading-relaxed">Lapor keluhan ke Pengurus RT</span>
              </Link>

              <Link
                href="/inventaris"
                className="flex flex-col items-center p-6 bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800/80 shadow-sm hover:shadow-md rounded-3xl hover:bg-indigo-50/20 dark:hover:bg-indigo-950/15 hover:border-indigo-500/25 transition-all text-center group cursor-pointer"
              >
                <div className="w-13 h-13 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mb-4.5 group-hover:scale-105 transition-transform shadow-inner">
                  <Package size={24} />
                </div>
                <span className="text-sm font-extrabold text-zinc-800 dark:text-zinc-100">Pinjam Barang</span>
                <span className="text-[10.5px] text-zinc-400 dark:text-zinc-500 mt-1.5 font-medium leading-relaxed">Pinjam peralatan & aset bersama</span>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* KETUA RT: Link Onboarding Warga */}
      {userRole === "KETUA_RT" && rtProfile.id && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6.5 space-y-4 shadow-sm animate-fade-in">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
            <span className="text-lg">📢</span>
            <h3 className="font-extrabold text-zinc-900 dark:text-white">Undang Warga untuk Input KK Mandiri</h3>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
            Sebagai Ketua RT, Anda tidak perlu mengetik satu-satu data KK warga. Bagikan tautan unik di bawah ini ke grup WhatsApp RT Anda. Warga (Kepala Rumah Tangga) dapat mendaftar mandiri, mengunggah foto & data KK via AI OCR, membuat laporan pengaduan, melihat agenda warga, dan memberikan konfirmasi kehadiran secara langsung dari ponsel mereka.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              readOnly
              className="flex-1 bg-zinc-50 dark:bg-zinc-950 border border-zinc-205 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-xs font-mono text-zinc-600 dark:text-zinc-350 select-all"
              value={`${typeof window !== "undefined" ? window.location.origin : ""}/login?rtId=${rtProfile.id}`}
            />
            <button
              onClick={() => {
                const inviteUrl = `${window.location.origin}/login?rtId=${rtProfile.id}`;
                navigator.clipboard.writeText(inviteUrl);
                alert("Link pendaftaran mandiri warga berhasil disalin! Silakan bagikan ke Grup WhatsApp RT.");
              }}
              className="bg-indigo-600 hover:bg-indigo-750 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow transition-all cursor-pointer whitespace-nowrap active:scale-98"
            >
              Salin Tautan Undang Warga
            </button>
          </div>
        </div>
      )}

      {/* HIGHLIGHT BOX */}
      <div className="bg-gradient-to-r from-indigo-600 via-indigo-650 to-indigo-700 rounded-[32px] p-8 md:p-10 text-white flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 shadow-xl shadow-indigo-500/10 relative overflow-hidden group">
        <div className="absolute top-[-30%] right-[-10%] w-[40%] aspect-square rounded-full bg-white/5 blur-[90px] pointer-events-none group-hover:scale-105 transition-transform"></div>
        <div className="space-y-3.5 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-white/10 rounded-full text-[10.5px] font-black uppercase tracking-wider backdrop-blur-md">
            <Sparkles size={13} className="text-amber-300 fill-amber-300" /> Tips Keamanan Data
          </div>
          <h3 className="text-2xl font-black">Simpan Berkas Warga Lebih Cepat via AI OCR</h3>
          <p className="text-indigo-150 text-sm max-w-2xl font-medium leading-relaxed opacity-90">
            Cukup ambil foto Kartu Keluarga warga secara lurus dan jelas, AI akan mengekstrak otomatis nama, NIK, alamat, dan seluruh anggota keluarga dalam waktu 30 detik tanpa pengetikan manual.
          </p>
        </div>
        <Link
          href="/warga"
          className="bg-white text-indigo-700 hover:bg-slate-55 hover:-translate-y-0.5 active:translate-y-0 font-extrabold px-7 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2 whitespace-nowrap text-sm cursor-pointer shrink-0"
        >
          Mulai Upload KK
          <ArrowRight size={18} />
        </Link>
      </div>
    </div>
  );
}
