"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { CheckCircle2, ShieldCheck, HeartHandshake, Zap, Sparkles, Smartphone, ArrowRight, ScanLine, FileText, Check, AlertTriangle, Users, Wallet, Star, RefreshCw, Upload, FileSignature, ArrowRightLeft } from "lucide-react";

export default function Home() {
  // Simulator State
  const [simStep, setSimStep] = useState<"idle" | "scanning" | "done">("idle");
  const [progress, setProgress] = useState(0);

  const runSimulation = () => {
    setSimStep("scanning");
    setProgress(0);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (simStep === "scanning") {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => {
              setSimStep("done");
            }, 300);
            return 100;
          }
          return prev + 5;
        });
      }, 50);
    }
    return () => clearInterval(interval);
  }, [simStep]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-800 dark:text-zinc-200 font-sans flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      {/* Background elegant mesh gradients */}
      <div className="absolute top-0 right-0 w-[55%] aspect-square rounded-full bg-gradient-to-br from-indigo-650/10 to-transparent blur-[165px] pointer-events-none"></div>
      <div className="absolute top-[25%] left-0 w-[45%] aspect-square rounded-full bg-gradient-to-tr from-sky-500/5 to-transparent blur-[130px] pointer-events-none"></div>

      {/* Navbar */}
      <header className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-slate-205 dark:border-zinc-800 sticky top-0 z-50 transition-colors">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-600 dark:bg-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <span className="text-white font-extrabold text-xl">R</span>
            </div>
            <span className="text-xl font-black tracking-tight bg-gradient-to-r from-zinc-900 to-indigo-900 dark:from-white dark:to-zinc-300 bg-clip-text text-transparent">
              RTKu
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/beranda"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-all shadow-md shadow-indigo-550/10 hover:shadow-indigo-600/20 active:scale-98 cursor-pointer"
            >
              Buka Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 md:py-28 relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            <div className="space-y-8 lg:col-span-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black bg-indigo-50 dark:bg-indigo-950/40 text-indigo-755 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/35">
                <Sparkles size={14} className="text-indigo-600 dark:text-indigo-455" />
                🤖 AI-POWERED · 100% MADE IN INDONESIA
              </div>

              <h1 className="text-4xl md:text-6xl font-black leading-tight tracking-tight text-zinc-955 dark:text-white">
                Aplikasi RT — <span className="bg-gradient-to-r from-indigo-650 to-indigo-500 bg-clip-text text-transparent animate-pulse">Foto KK Auto-Input</span> & Dashboard Iuran Real-Time
              </h1>

              <p className="text-slate-655 dark:text-zinc-405 text-lg leading-relaxed max-w-xl">
                RTKu memodernisasi cara kerja Rukun Tetangga (RT). Bebaskan Pengurus RT dan Bendahara dari pengetikan KK secara manual. Cukup foto KK, AI akan membaca semua data kependudukan secara instan.
              </p>

              {/* Trust badges */}
              <div className="grid grid-cols-2 gap-3.5 pt-2 text-[13.5px] font-extrabold text-zinc-650 dark:text-zinc-350">
                <div className="flex items-center gap-2">
                  <span className="text-emerald-500">✅</span> Setup Cepat 5 menit
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-500">✅</span> AI 95%+ Akurat
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-500">✅</span> Server di Indonesia
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-500">✅</span> Support via WhatsApp
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-5 pt-3">
                <Link
                  href="/beranda"
                  className="bg-indigo-650 hover:bg-indigo-700 text-white font-extrabold text-center px-8 py-4 rounded-xl shadow-lg shadow-indigo-550/20 hover:shadow-indigo-500/30 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  Buka Dashboard Gratis
                  <ArrowRight size={18} />
                </Link>
                <div className="flex items-center gap-3 justify-center sm:justify-start">
                  <span className="text-slate-405 dark:text-zinc-650 line-through text-sm">
                    Rp 150.000
                  </span>
                  <div className="bg-emerald-50 dark:bg-emerald-990/30 border border-emerald-100 dark:border-emerald-900/30 px-3.5 py-1.5 rounded-xl">
                    <span className="text-sm font-black text-emerald-600 dark:text-emerald-450">
                      Cuma Rp 15.000 (Sekali Bayar)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive simulator widget */}
            <div className="lg:col-span-6 flex justify-center relative w-full">
              <div className="absolute w-[90%] aspect-square bg-indigo-500/10 rounded-full blur-[100px] -z-10"></div>

              <div className="w-full max-w-[480px] bg-white dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden transition-colors">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-sky-500 to-indigo-550"></div>

                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-400"></span>
                    <span className="w-3 h-3 rounded-full bg-yellow-400"></span>
                    <span className="w-3 h-3 rounded-full bg-green-400"></span>
                  </div>
                  <span className="text-xs bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 font-extrabold px-3 py-1 rounded-full flex items-center gap-1.5">
                    <Sparkles size={11} className="animate-spin text-amber-500" />
                    RTKu AI Simulator
                  </span>
                </div>

                {simStep === "idle" && (
                  <div className="py-8 text-center space-y-6">
                    <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-950/50 rounded-2xl flex items-center justify-center mx-auto border border-dashed border-indigo-300 dark:border-indigo-800 shadow-inner group transition-all">
                      <Upload size={32} className="text-indigo-600 dark:text-indigo-400 group-hover:scale-105 transition-transform" />
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-extrabold text-zinc-900 dark:text-white">Simulasi Scan Kartu Keluarga</h4>
                      <p className="text-xs text-zinc-500 dark:text-zinc-650 max-w-sm mx-auto leading-relaxed">
                        Lihat bagaimana AI membaca & menginput seluruh tabel anggota KK secara otomatis tanpa Anda mengetik manual.
                      </p>
                    </div>
                    <button
                      onClick={runSimulation}
                      className="bg-indigo-650 hover:bg-indigo-700 text-white font-extrabold text-xs px-6 py-3 rounded-xl transition-all shadow-md active:scale-98 cursor-pointer flex items-center gap-2 mx-auto"
                    >
                      <ScanLine size={14} />
                      Coba Pindai Demo KK
                    </button>
                  </div>
                )}

                {simStep === "scanning" && (
                  <div className="py-12 space-y-6 relative">
                    <div className="w-full h-44 bg-zinc-950 rounded-2xl border border-zinc-800 p-4 relative overflow-hidden flex flex-col justify-center items-center">
                      {/* Scan laser line */}
                      <div
                        className="absolute left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent shadow-lg shadow-indigo-500/80 pointer-events-none transition-all duration-75"
                        style={{ top: `${progress}%` }}
                      ></div>

                      <div className="text-center space-y-2 text-zinc-500">
                        <ScanLine size={36} className="mx-auto text-indigo-400 animate-pulse" />
                        <span className="text-[10px] uppercase tracking-widest font-bold">Mengekstrak Data KK...</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-bold text-zinc-400">
                        <span>Pembacaan Karakter (OCR)</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                        <div className="bg-indigo-600 h-full rounded-full transition-all duration-75" style={{ width: `${progress}%` }}></div>
                      </div>
                    </div>
                  </div>
                )}

                {simStep === "done" && (
                  <div className="space-y-5 animate-fade-in">
                    <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-250 dark:border-emerald-900/30 p-3 rounded-2xl flex items-center gap-2.5">
                      <span className="text-emerald-500">✅</span>
                      <div className="text-left">
                        <div className="text-[11px] font-black text-emerald-800 dark:text-emerald-450 uppercase tracking-wider">AI Ekstraksi Sukses!</div>
                        <div className="text-[10px] text-emerald-650 dark:text-emerald-500 font-bold">Data KK berhasil diubah menjadi format database dalam 0.9 detik.</div>
                      </div>
                    </div>

                    <div className="bg-zinc-50 dark:bg-zinc-950 rounded-2xl p-4 border border-zinc-150 dark:border-zinc-805 space-y-3.5">
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                          <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">Nomor KK</span>
                          <div className="font-extrabold text-zinc-800 dark:text-zinc-205">3273012345678901</div>
                        </div>
                        <div>
                          <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">Alamat</span>
                          <div className="font-extrabold text-zinc-800 dark:text-zinc-205">Jl. Sukamaju No. 12</div>
                        </div>
                      </div>

                      <div className="border-t border-zinc-200/60 dark:border-zinc-800/80 pt-3">
                        <span className="text-[9px] text-zinc-450 font-bold uppercase tracking-wider block mb-2">Anggota Terdeteksi</span>
                        <div className="space-y-2 text-[10.5px]">
                          <div className="flex justify-between items-center bg-white dark:bg-zinc-900 p-2 rounded-lg border dark:border-zinc-805 font-bold">
                            <span className="text-zinc-700 dark:text-zinc-300">1. Ahmad Subagja</span>
                            <span className="text-[8.5px] bg-indigo-50 dark:bg-indigo-950/50 text-indigo-705 dark:text-indigo-400 px-2 py-0.5 rounded font-black uppercase">Kepala Keluarga</span>
                          </div>
                          <div className="flex justify-between items-center bg-white dark:bg-zinc-900 p-2 rounded-lg border dark:border-zinc-805 font-bold">
                            <span className="text-zinc-700 dark:text-zinc-300">2. Sumiati</span>
                            <span className="text-[8.5px] bg-indigo-50 dark:bg-indigo-950/50 text-indigo-705 dark:text-indigo-400 px-2 py-0.5 rounded font-black uppercase">Istri</span>
                          </div>
                          <div className="flex justify-between items-center bg-white dark:bg-zinc-900 p-2 rounded-lg border dark:border-zinc-805 font-bold">
                            <span className="text-zinc-700 dark:text-zinc-300">3. Rian Hidayat</span>
                            <span className="text-[8.5px] bg-indigo-50 dark:bg-indigo-950/50 text-indigo-705 dark:text-indigo-400 px-2 py-0.5 rounded font-black uppercase">Anak</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setSimStep("idle")}
                        className="px-4 py-2 border border-zinc-200 dark:border-zinc-800 text-zinc-500 rounded-xl text-xs font-bold hover:bg-zinc-50 dark:hover:bg-zinc-950 transition-colors"
                      >
                        Reset
                      </button>
                      <Link
                        href="/beranda"
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold flex items-center gap-1 shadow-md"
                      >
                        Mulai Praktik
                        <ArrowRight size={12} />
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* KILLER FEATURE: Before / After Comparison */}
      <section className="py-20 bg-white dark:bg-zinc-900 border-y border-slate-205 dark:border-zinc-800/60 relative">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 dark:bg-rose-955/20 text-rose-700 dark:text-rose-455 border border-rose-100 dark:border-rose-900/30">
              ⚡ FITUR UTAMA
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-zinc-955 dark:text-white">
              Mengapa Pak RT & Bendahara Harus Ganti ke RTKu?
            </h2>
            <p className="text-slate-655 dark:text-zinc-400">
              Perbandingan nyata efisiensi pencatatan manual vs AI RTKu.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Before (Manual) */}
            <div className="bg-slate-50 dark:bg-zinc-950/50 p-8 rounded-3xl border border-zinc-200/60 dark:border-zinc-800/60 space-y-6 relative overflow-hidden">
              <div className="h-1 bg-red-400 w-16 rounded-full"></div>
              <h3 className="text-xl font-bold text-red-500 flex items-center gap-2">
                ❌ Cara Manual (Repot & Lambat)
              </h3>
              <ul className="space-y-4 text-sm text-slate-550 dark:text-zinc-405 font-medium">
                <li className="flex items-center gap-3">
                  <span className="text-red-400">⚠️</span> Ketik nama KK & anggota satu-satu (10 menit / KK)
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-red-400">⚠️</span> Typo NIK sering terjadi, pusing cek dokumen ulang
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-red-400">⚠️</span> Bendahara catat iuran warga pakai buku fisik
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-red-400">⚠️</span> Warga tidak tahu kemana kas RT dipakai
                </li>
              </ul>
              <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 text-xs font-bold text-red-400 uppercase tracking-widest text-right">
                Pekerjaan 1 jam+
              </div>
            </div>

            {/* After (RTKu AI) */}
            <div className="bg-indigo-650/5 dark:bg-indigo-950/20 p-8 rounded-3xl border-2 border-indigo-500/30 dark:border-indigo-500/20 space-y-6 relative overflow-hidden shadow-lg shadow-indigo-550/5">
              <div className="absolute top-0 right-0 bg-gradient-to-l from-indigo-500/10 to-transparent w-full h-full pointer-events-none"></div>
              <div className="h-1 bg-indigo-500 w-16 rounded-full"></div>
              <h3 className="text-xl font-bold text-indigo-655 dark:text-indigo-400 flex items-center gap-2">
                🚀 Cara RTKu (Otomatis & Cepat)
              </h3>
              <ul className="space-y-4 text-sm text-zinc-700 dark:text-zinc-300 font-extrabold">
                <li className="flex items-center gap-3">
                  <span className="text-indigo-550">📸</span> Cukup foto KK pakai HP standar
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-indigo-555">🤖</span> AI membaca & menginput seluruh tabel anggota (30 detik / KK)
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-indigo-555">📊</span> Dashboard keuangan lunas/tunggak otomatis real-time
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-indigo-555">✅</span> Warga melihat laporan kas secara transparan
                </li>
              </ul>
              <div className="pt-4 border-t border-indigo-100 dark:border-indigo-900/50 text-xs font-black text-indigo-650 dark:text-indigo-400 uppercase tracking-widest text-right">
                Pekerjaan 30 detik saja!
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5 CORE MODULES */}
      <section className="py-24 bg-slate-50 dark:bg-zinc-955 relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-20 space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-75CC dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/35">
              📦 MODUL UTAMA
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-zinc-955 dark:text-white">
              Sistem Lengkap Siap Pakai
            </h2>
            <p className="text-slate-655 dark:text-zinc-400">
              Aplikasi mandiri all-in-one tanpa biaya hosting berlebih untuk ekosistem RT digital Anda.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {/* Module 1 */}
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-150 dark:border-zinc-800/80 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all space-y-4 group">
              <div className="w-11 h-11 bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-455 rounded-xl flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
                <ScanLine size={24} />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-extrabold text-zinc-850 dark:text-white">AI Scan KK</h3>
                <span className="text-[10px] inline-block bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-400 px-2 py-0.5 rounded font-black tracking-wide">⏱️ 30 Detik/KK</span>
              </div>
              <p className="text-slate-600 dark:text-zinc-400 text-xs leading-relaxed">
                Ekstrak nama, NIK, alamat otomatis dari jepretan kamera ponsel, tak perlu ketik ulang dari nol.
              </p>
            </div>

            {/* Module 2 */}
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-150 dark:border-zinc-800/80 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all space-y-4 group">
              <div className="w-11 h-11 bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-455 rounded-xl flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
                <Users size={24} />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-extrabold text-zinc-850 dark:text-white">Data Warga</h3>
                <span className="text-[10px] inline-block bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-450 px-2 py-0.5 rounded font-black tracking-wide">📊 Dashboard Real-time</span>
              </div>
              <p className="text-slate-605 dark:text-zinc-400 text-xs leading-relaxed">
                Dashboard terpusat untuk profil seluruh warga, kepemilikan KK, riwayat tinggal, & pencarian instan.
              </p>
            </div>

            {/* Module 3 */}
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-150 dark:border-zinc-800/80 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all space-y-4 group">
              <div className="w-11 h-11 bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-455 rounded-xl flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
                <Wallet size={24} />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-extrabold text-zinc-850 dark:text-white">Auto-Collect Iuran</h3>
                <span className="text-[10px] inline-block bg-indigo-50 dark:bg-indigo-950 text-indigo-705 dark:text-indigo-400 px-2 py-0.5 rounded font-black tracking-wide">📉 Tunggakan -70%</span>
              </div>
              <p className="text-slate-650 dark:text-zinc-400 text-xs leading-relaxed">
                Tagih iuran bulanan digital pakai payment link Pakasir. Bayar gampang via QRIS, e-wallet, VA.
              </p>
            </div>

            {/* Module 4 */}
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-150 dark:border-zinc-800/80 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all space-y-4 group">
              <div className="w-11 h-11 bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-455 rounded-xl flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
                <FileText size={24} />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-extrabold text-zinc-850 dark:text-white">Surat Pengantar</h3>
                <span className="text-[10px] inline-block bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded font-black tracking-wide">⚡ Format PDF Instan</span>
              </div>
              <p className="text-slate-650 dark:text-zinc-400 text-xs leading-relaxed">
                Generator surat pengantar KTP, KK, Domisili, SKTM terisi otomatis dari database siap cetak.
              </p>
            </div>

            {/* Module 5 */}
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-150 dark:border-zinc-800/80 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all space-y-4 group">
              <div className="w-11 h-11 bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-455 rounded-xl flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
                <Smartphone size={24} />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-extrabold text-zinc-850 dark:text-white">WhatsApp & PWA</h3>
                <span className="text-[10px] inline-block bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-400 px-2 py-0.5 rounded font-black tracking-wide">📲 Instalasi Langsung</span>
              </div>
              <p className="text-slate-605 dark:text-zinc-400 text-xs leading-relaxed">
                Bisa diinstal langsung ke layar HP warga, plus terkirim notifikasi kode verifikasi via WhatsApp.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF / TESTIMONIALS */}
      <section className="py-24 bg-white dark:bg-zinc-900 border-t border-zinc-150 dark:border-zinc-800/60 relative">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30">
              💬 TESTIMONI
            </div>
            <h2 className="text-3xl font-extrabold text-zinc-955 dark:text-white">
              Disukai oleh 300+ Pengurus RT di Indonesia
            </h2>
            <p className="text-slate-605 dark:text-zinc-400">
              Dengarkan langsung dari sesama pengurus RT yang sudah memakai sistem kami.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Testimonial 1 */}
            <div className="bg-slate-50 dark:bg-zinc-955 p-6 rounded-2xl border border-zinc-150 dark:border-zinc-800/80 space-y-4">
              <div className="flex gap-1 text-amber-500">
                {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
              </div>
              <p className="text-xs md:text-sm text-slate-655 dark:text-zinc-400 italic leading-relaxed">
                "Sebelum pakai RTKu saya harus luangkan waktu seharian buat input data warga dari KK. Sekarang tinggal jepret foto pakai HP selesai 30 detik. Sangat menghemat waktu!"
              </p>
              <div>
                <h4 className="font-extrabold text-sm text-zinc-850 dark:text-white">Pak Joko</h4>
                <p className="text-[10px] text-zinc-400 font-bold">RT 03 / RW 12, Surabaya</p>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-slate-50 dark:bg-zinc-955 p-6 rounded-2xl border border-zinc-150 dark:border-zinc-800/80 space-y-4">
              <div className="flex gap-1 text-amber-505">
                {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
              </div>
              <p className="text-xs md:text-sm text-slate-655 dark:text-zinc-400 italic leading-relaxed">
                "Warga senang sekali sekarang iuran bulanan bisa bayar pakai QRIS dan e-wallet. Tagihan juga otomatis muncul di dashboard warga, jadi transparansi keuangan RT luar biasa terjaga."
              </p>
              <div>
                <h4 className="font-extrabold text-sm text-zinc-850 dark:text-white">Ibu Sumarni</h4>
                <p className="text-[10px] text-zinc-400 font-bold">Bendahara RT 09, Jakarta Selatan</p>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-slate-50 dark:bg-zinc-955 p-6 rounded-2xl border border-zinc-150 dark:border-zinc-800/80 space-y-4">
              <div className="flex gap-1 text-amber-505">
                {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
              </div>
              <p className="text-xs md:text-sm text-slate-655 dark:text-zinc-400 italic leading-relaxed">
                "Cetak surat pengantar ke kantor kelurahan tinggal pencet satu tombol langsung unduh PDF. Data warga langsung masuk dari profiling KK, tidak ada salah ketik lagi."
              </p>
              <div>
                <h4 className="font-extrabold text-sm text-zinc-850 dark:text-white">Pak Andi</h4>
                <p className="text-[10px] text-zinc-400 font-bold">RT 01, RW 05, Bandung</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRIVACY & SECURITY CLAIMS */}
      <section className="py-16 bg-slate-50 dark:bg-zinc-950">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-4">
          <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-950/80 text-indigo-650 dark:text-indigo-400 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
            <ShieldCheck size={26} />
          </div>
          <h3 className="text-lg font-black text-zinc-855 dark:text-white">Keamanan & Kerahasiaan Berkas Terjamin</h3>
          <p className="text-sm text-slate-600 dark:text-zinc-400 max-w-xl mx-auto leading-relaxed">
            Data KK sangat sensitif. Oleh karena itu, server kami langsung menghapus bekas foto KK dari database secara permanen setelah AI selesai mengekstrak teks. Kami tidak mendistribusikan data warga ke pihak manapun.
          </p>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="bg-white dark:bg-zinc-900 py-24 border-t border-slate-150 dark:border-zinc-800/80 relative overflow-hidden">
        <div className="absolute bottom-0 right-[10%] w-[30%] aspect-square rounded-full bg-indigo-650/5 blur-[120px] pointer-events-none"></div>
        <div className="max-w-4xl mx-auto px-6 text-center space-y-8 relative">
          <h2 className="text-3xl md:text-4xl font-extrabold text-zinc-955 dark:text-white">
            Aktivasi Instan, Upgrade Selamanya
          </h2>
          <p className="text-slate-655 dark:text-zinc-400 max-w-xl mx-auto">
            Gunakan trial gratis 7 hari tanpa komitmen. Upgrade ke lisensi permanen seharga dua cangkir kopi untuk kepengurusan selamanya.
          </p>
          <div className="inline-block bg-slate-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 p-8 rounded-3xl shadow-xl max-w-md w-full relative group">
            {/* Sparkle badge */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-600 to-indigo-550 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-md">
              ONE TIME LICENSE
            </div>

            <div className="text-[10px] font-black text-zinc-400 dark:text-zinc-555 uppercase tracking-widest mt-2 font-mono">Investasi Terbaik Pengurus RT</div>
            <div className="text-5xl font-black text-indigo-650 dark:text-indigo-400 mt-2.5">Rp 15.000</div>
            <div className="text-xs text-slate-400 dark:text-zinc-550 mt-4 leading-relaxed font-bold">
              Tanpa biaya bulanan tersembunyi. Satu kali bayar untuk satu unit RT aktif selamanya!
            </div>

            <div className="pt-6 mt-6 border-t border-zinc-200 dark:border-zinc-800 flex justify-center">
              <Link
                href="/beranda"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold px-6 py-3 rounded-2xl shadow-md transition-all active:scale-98 cursor-pointer"
              >
                Mulai Setup Sekarang
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-zinc-950 text-zinc-500 py-12 border-t border-zinc-900 text-center text-sm font-medium">
        <div className="max-w-6xl mx-auto px-6">
          <p>&copy; {new Date().getFullYear()} RTKu PWA. Powered by Next.js & Pakasir. 🇮🇩 100% Buatan Indonesia</p>
        </div>
      </footer>
    </div>
  );
}
