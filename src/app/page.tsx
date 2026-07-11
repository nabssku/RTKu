"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  ShieldCheck,
  Zap,
  Sparkles,
  Smartphone,
  ArrowRight,
  ScanLine,
  FileText,
  Users,
  Wallet,
  Star,
  Upload,
  ArrowRightLeft,
  Lock,
  ArrowDownCircle,
  HelpCircle,
  MessageSquare
} from "lucide-react";

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
            }, 400);
            return 100;
          }
          return prev + 4; // Lebih smooth
        });
      }, 40);
    }
    return () => clearInterval(interval);
  }, [simStep]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-800 dark:text-zinc-100 font-sans flex flex-col justify-between selection:bg-indigo-500 selection:text-white transition-colors duration-300">
      {/* Background gradients */}
      <div className="absolute top-0 right-0 w-[60%] aspect-square rounded-full bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent blur-[150px] pointer-events-none"></div>
      <div className="absolute top-[30%] left-0 w-[50%] aspect-square rounded-full bg-gradient-to-tr from-sky-500/5 via-indigo-500/5 to-transparent blur-[130px] pointer-events-none"></div>

      {/* Navbar */}
      <header className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border-b border-slate-200 dark:border-zinc-800 sticky top-0 z-50 transition-colors">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-655 bg-indigo-600 dark:bg-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/20 dark:shadow-indigo-500/20">
              <span className="text-white font-extrabold text-2xl">R</span>
            </div>
            <div>
              <span className="text-2xl font-black tracking-tight bg-gradient-to-r from-slate-900 via-indigo-900 to-indigo-700 dark:from-white dark:to-zinc-300 bg-clip-text text-transparent">
                RTKu
              </span>
              <span className="text-[10px] block font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-widest leading-none">Aplikasi Rukun Tetangga</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/beranda"
              className="bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white font-extrabold px-6 py-3 rounded-2xl text-xs sm:text-sm tracking-wide transition-all shadow-md active:scale-97 cursor-pointer hover:-translate-y-0.5"
            >
              Buka Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 md:py-24 relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">

            {/* Left Content Column */}
            <div className="space-y-8 lg:col-span-6">
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full text-xs font-black bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/35">
                <Sparkles size={14} className="text-indigo-600 dark:text-indigo-400 animate-pulse" />
                DENGAN AI OCR KARTU KELUARGA · 100% INDONESIA
              </div>

              <h1 className="text-4xl md:text-6xl font-black leading-tight tracking-tight text-slate-900 dark:text-white">
                Input Data Warga RT <br />
                <span className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-755 to-indigo-700 dark:from-indigo-400 dark:to-indigo-300 bg-clip-text text-transparent">
                  Cukup Foto KK Saja!
                </span>
              </h1>

              <p className="text-slate-600 dark:text-zinc-300 text-lg leading-relaxed max-w-xl">
                Bebaskan pengurus RT dari kerepotan mengetik NIK dan biodata keluarga satu per satu. Cukup upload foto dokumen KK, teknologi AI RTKu akan mengekstrak seluruh data warga secara instan.
              </p>

              {/* Trust Badges */}
              <div className="grid grid-cols-2 gap-4 max-w-lg pt-2 text-[14px] font-bold text-slate-700 dark:text-zinc-300">
                <div className="flex items-center gap-2.5">
                  <span className="flex-shrink-0 w-5 h-5 bg-emerald-50 dark:bg-emerald-950/50 rounded-full flex items-center justify-center text-emerald-650 dark:text-emerald-450 text-emerald-600 dark:text-emerald-400 text-xs">✓</span>
                  Setup RT Cepat (5 Menit)
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="flex-shrink-0 w-5 h-5 bg-emerald-50 dark:bg-emerald-950/50 rounded-full flex items-center justify-center text-emerald-650 dark:text-emerald-450 text-emerald-600 dark:text-emerald-400 text-xs">✓</span>
                  Akurasi AI Mencapai 95%+
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="flex-shrink-0 w-5 h-5 bg-emerald-50 dark:bg-emerald-950/50 rounded-full flex items-center justify-center text-emerald-650 dark:text-emerald-455 text-emerald-600 dark:text-emerald-400 text-xs">✓</span>
                  Pembayaran Online & QRIS
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="flex-shrink-0 w-5 h-5 bg-emerald-50 dark:bg-emerald-950/50 rounded-full flex items-center justify-center text-emerald-655 dark:text-emerald-455 text-emerald-600 dark:text-emerald-400 text-xs">✓</span>
                  Keamanan Data Kependudukan
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-5 pt-3 items-stretch sm:items-center">
                <Link
                  href="/beranda"
                  className="bg-indigo-650 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-center px-8 py-4.5 rounded-2xl shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/30 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2.5 cursor-pointer text-sm tracking-wide"
                >
                  Buka Dashboard Sekarang
                  <ArrowRight size={18} />
                </Link>
                <div className="flex flex-col items-center sm:items-start justify-center">
                  <span className="text-slate-400 dark:text-zinc-500 line-through text-xs font-bold leading-none">
                    Lisensi Rp 150.000
                  </span>
                  <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 px-3.5 py-1.5 rounded-xl mt-1">
                    <span className="text-[12px] font-black text-emerald-700 dark:text-emerald-400 whitespace-nowrap">
                      Hanya Rp 15.000 (Selamanya)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Simulator Column */}
            <div className="lg:col-span-6 flex justify-center relative w-full">
              <div className="absolute w-[80%] aspect-square bg-indigo-500/5 rounded-full blur-[90px] -z-10"></div>

              {/* Simulator Card CONTAINER */}
              <div className="w-full max-w-[490px] bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-[32px] p-6.5 shadow-2xl relative overflow-hidden transition-all duration-300">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-600 via-indigo-500 to-sky-400"></div>

                <div className="flex justify-between items-center mb-6 border-b border-slate-100 dark:border-zinc-800 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded-full bg-slate-100 dark:bg-zinc-800 border border-slate-205 dark:border-zinc-700 flex items-center justify-center text-[8px] font-bold">1</span>
                    <span className="w-3.5 h-3.5 rounded-full bg-slate-100 dark:bg-zinc-800 border border-slate-205 dark:border-zinc-700 flex items-center justify-center text-[8px] font-bold">2</span>
                    <span className="w-3.5 h-3.5 rounded-full bg-slate-100 dark:bg-zinc-800 border border-slate-205 dark:border-zinc-700 flex items-center justify-center text-[8px] font-bold">3</span>
                  </div>
                  <span className="text-[11px] bg-indigo-50/80 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 font-extrabold px-3 py-1 rounded-full flex items-center gap-1.5">
                    <Sparkles size={11} className="text-amber-500 animate-pulse" />
                    RTKu AI Scanner Simulator
                  </span>
                </div>

                {simStep === "idle" && (
                  <div className="py-8 text-center space-y-6 animate-in fade-in duration-200">
                    <div className="w-22 h-22 bg-slate-50 dark:bg-zinc-950/60 rounded-3xl flex items-center justify-center mx-auto border-2 border-dashed border-slate-205 border-slate-200 dark:border-zinc-800 shadow-inner group hover:border-indigo-455 hover:border-indigo-500 transition-all cursor-pointer">
                      <Upload size={36} className="text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform" />
                    </div>
                    <div className="space-y-1.5">
                      <h4 className="font-black text-slate-800 dark:text-white text-base">Uji Coba Pengenalan AI KK</h4>
                      <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-sm mx-auto leading-relaxed">
                        Rasakan bagaimana sistem AI secara otomatis mengekstrak dokumen KK menjadi tabel anggota keluarga siap simpan.
                      </p>
                    </div>
                    <button
                      onClick={runSimulation}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs px-6 py-3.5 rounded-xl transition-all shadow-md active:scale-97 cursor-pointer flex items-center gap-2 mx-auto"
                    >
                      <ScanLine size={14} />
                      Simulasikan Foto KK
                    </button>
                  </div>
                )}

                {simStep === "scanning" && (
                  <div className="py-12 space-y-6 relative animate-in fade-in duration-200">
                    <div className="w-full h-48 bg-slate-950 rounded-2xl border border-zinc-800 p-4 relative overflow-hidden flex flex-col justify-center items-center">

                      {/* Laser scanner line effect */}
                      <div
                        className="absolute left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-indigo-400 to-transparent shadow-lg shadow-indigo-500/80 pointer-events-none transition-all duration-75 block"
                        style={{ top: `${progress}%` }}
                      ></div>

                      <div className="text-center space-y-2 text-zinc-500">
                        <ScanLine size={38} className="mx-auto text-indigo-400 animate-pulse" />
                        <span className="text-[10px] uppercase tracking-widest font-black text-indigo-500">Membaca Data Kartu Keluarga...</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-bold text-zinc-400">
                        <span>Pemrosesan OCR AI (RTKu Core)</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="w-full bg-zinc-205 bg-slate-200 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                        <div className="bg-indigo-650 bg-indigo-600 h-full rounded-full transition-all duration-75" style={{ width: `${progress}%` }}></div>
                      </div>
                    </div>
                  </div>
                )}

                {simStep === "done" && (
                  <div className="space-y-5 animate-in slide-in-from-bottom-2 duration-300">
                    <div className="bg-emerald-500/10 border border-emerald-500/20 p-3.5 rounded-2xl flex items-start gap-3">
                      <span className="text-emerald-600 dark:text-emerald-400 text-lg">✓</span>
                      <div className="text-left space-y-0.5">
                        <div className="text-[11px] font-black text-emerald-800 dark:text-emerald-400 uppercase tracking-wider">Ekstraksi Sensus Sukses</div>
                        <p className="text-[10.5px] text-slate-600 dark:text-zinc-400 leading-normal font-medium">Buku registrasi terisi otomatis. AI mendeteksi dokumen valid dalam waktu 0.9 detik.</p>
                      </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-zinc-950 rounded-2xl p-4.5 border border-slate-200 dark:border-zinc-800 space-y-3.5 text-left">
                      <div className="grid grid-cols-2 gap-4 text-xs font-bold">
                        <div>
                          <span className="text-[9px] text-slate-500 dark:text-zinc-400 font-bold uppercase tracking-wider block mb-0.5">Nomor KK</span>
                          <div className="font-extrabold text-slate-800 dark:text-zinc-200">3273012345678901</div>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-500 dark:text-zinc-400 font-bold uppercase tracking-wider block mb-0.5">Alamat</span>
                          <div className="font-extrabold text-slate-800 dark:text-zinc-200">Perum Sukamaju Blok B No. 12</div>
                        </div>
                      </div>

                      <div className="border-t border-slate-200 dark:border-zinc-800 pt-3">
                        <span className="text-[9px] text-slate-500 dark:text-zinc-400 font-bold uppercase tracking-wider block mb-2">Relasi Anggota Terdeteksi</span>
                        <div className="space-y-2 text-[11px] font-semibold">
                          <div className="flex justify-between items-center bg-white dark:bg-zinc-900 p-2.5 rounded-xl border border-slate-100 dark:border-zinc-800">
                            <span className="text-slate-700 dark:text-zinc-300">Ahmad Subagja</span>
                            <span className="text-[8px] bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 px-2 py-0.5 rounded-md font-black uppercase">Kepala Keluarga</span>
                          </div>
                          <div className="flex justify-between items-center bg-white dark:bg-zinc-900 p-2.5 rounded-xl border border-slate-100 dark:border-zinc-800">
                            <span className="text-slate-700 dark:text-zinc-350">Sumiati</span>
                            <span className="text-[8px] bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 px-2 py-0.5 rounded-md font-black uppercase">Istri</span>
                          </div>
                          <div className="flex justify-between items-center bg-white dark:bg-zinc-900 p-2.5 rounded-xl border border-slate-100 dark:border-zinc-800">
                            <span className="text-slate-700 dark:text-zinc-350">Rian Hidayat</span>
                            <span className="text-[8px] bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 px-2 py-0.5 rounded-md font-black uppercase">Anak</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-1">
                      <button
                        onClick={() => setSimStep("idle")}
                        className="px-4 py-2 border border-slate-200 dark:border-zinc-800 text-slate-500 rounded-xl text-xs font-bold hover:bg-slate-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
                      >
                        Ulangi Simulasi
                      </button>
                      <Link
                        href="/beranda"
                        className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold flex items-center gap-1 shadow-md cursor-pointer hover:-translate-y-0.5 transition-all"
                      >
                        Coba di Dashboard
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

      {/* Comparison Section (Before vs After) */}
      <section className="py-20 bg-white dark:bg-zinc-900 border-y border-slate-200 dark:border-zinc-800/80 relative">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 dark:bg-rose-955/20 text-rose-700 dark:text-rose-455 border border-rose-100 dark:border-rose-900/30">
              ⚡ COMPATIBILITY
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white">
              Mengapa Harus Beralih ke RTKu?
            </h2>
            <p className="text-slate-550 dark:text-zinc-400 text-sm">
              Perbandingan efisiensi nyata pengelolaan rukun tetangga cara lama vs cara digital.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Before (Manual) */}
            <div className="bg-slate-50/50 dark:bg-zinc-950/40 p-8 rounded-[28px] border border-slate-200 dark:border-zinc-800/80 space-y-6 relative">
              <div className="w-10 h-10 rounded-2xl bg-red-50 dark:bg-red-950/20 text-red-500 flex items-center justify-center text-sm font-black">X</div>
              <h3 className="text-xl font-bold text-red-650 dark:text-red-400">
                Cara Manual Lama
              </h3>
              <ul className="space-y-4 text-xs sm:text-sm text-slate-655 text-slate-600 dark:text-zinc-400 font-semibold leading-relaxed">
                <li className="flex items-start gap-2.5">
                  <span className="text-red-450 leading-none">⚠️</span>
                  <span>Ketik ulang NIK dan nama anggota keluarga satu per satu (10 menit per KK).</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-red-450 leading-none">⚠️</span>
                  <span>Rentah salah ketik NIK / nomor berkas yang mengakibatkan data dinas warga eror.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-red-455 text-red-500 leading-none">⚠️</span>
                  <span>Pencatatan iuran di buku kas fisik rentan robek, hilang, atau manipulasi data.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-red-455 text-red-500 leading-none">⚠️</span>
                  <span>Warga kesulitan melihat jumlah kas RT dan mengajukan keluhan secara instan.</span>
                </li>
              </ul>
              <div className="pt-4 border-t border-slate-200 dark:border-zinc-800 text-[10px] font-bold text-red-500 dark:text-red-400 uppercase tracking-widest text-right">
                Butuh Berjam-jam
              </div>
            </div>

            {/* After (RTKu AI) */}
            <div className="bg-indigo-50 dark:bg-indigo-950/20 p-8 rounded-[28px] border-2 border-indigo-500/20 dark:border-indigo-500/10 space-y-6 relative shadow-lg shadow-indigo-500/5">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-sm font-black">✓</div>
              <h3 className="text-xl font-bold text-indigo-600 dark:text-indigo-450">
                Cara Pintar Dengan RTKu
              </h3>
              <ul className="space-y-4 text-xs sm:text-sm text-slate-800 dark:text-zinc-200 font-bold leading-relaxed">
                <li className="flex items-start gap-2.5">
                  <span className="text-indigo-600 dark:text-indigo-400 leading-none font-extrabold">✓</span>
                  <span>Foto KK dari kamera HP/laptop Anda untuk pendaftaran terotomatisasi.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-indigo-600 dark:text-indigo-400 leading-none font-extrabold">✓</span>
                  <span>Ekstraksi data KK digital otomatis dalam 30 detik berkat teknologi AI OCR.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-indigo-600 dark:text-indigo-400 leading-none font-extrabold">✓</span>
                  <span>Manajemen iuran otomatis terintegrasi e-wallet dengan Pakasir Payment.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-indigo-600 dark:text-indigo-400 leading-none font-extrabold">✓</span>
                  <span>Sistem surat menyurat (PDF), aduan real-time, dan transparansi keuangan.</span>
                </li>
              </ul>
              <div className="pt-4 border-t border-indigo-100 dark:border-indigo-900/50 text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest text-right">
                Selesai Dalam 30 Detik
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modules Grid */}
      <section className="py-24 bg-slate-50 dark:bg-zinc-950 relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-20 space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/35">
              📦 DECK SISTEM
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white">
              Modul Administrasi Rumah Tangga Lengkap
            </h2>
            <p className="text-slate-655 text-slate-600 dark:text-zinc-400 text-sm">
              Semua modul yang Anda perlukan untuk mendigitalisasi unit Rukun Tetangga (RT) dalam satu aplikasi.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6.5">
            {/* Modul 1 */}
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all space-y-4 group">
              <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105">
                <ScanLine size={24} />
              </div>
              <h3 className="font-bold text-slate-800 dark:text-white text-base">Analisa File KK Otomatis</h3>
              <p className="text-xs text-slate-600 dark:text-zinc-350 leading-relaxed font-semibold">
                Unggah foto berkas KK Anda, kecerdasan buatan akan langsung merinci tabel kependudukan di dashboard RT secara instan.
              </p>
            </div>

            {/* Modul 2 */}
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all space-y-4 group">
              <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105">
                <Users size={24} />
              </div>
              <h3 className="font-bold text-slate-800 dark:text-white text-base">Database Sensus Warga</h3>
              <p className="text-xs text-slate-600 dark:text-zinc-355 dark:text-zinc-350 leading-relaxed font-semibold">
                Pantau struktur keluarga, status tinggal (tetap/kontrak), dan kontak warga RT dengan pencarian real-time terpusat.
              </p>
            </div>

            {/* Modul 3 */}
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all space-y-4 group">
              <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105">
                <Wallet size={24} />
              </div>
              <h3 className="font-bold text-slate-800 dark:text-white text-base">Kas & Iuran Warga Digital</h3>
              <p className="text-xs text-slate-600 dark:text-zinc-350 leading-relaxed font-semibold">
                Bayar iuran lewat payment gateway Pakasir (QRIS, VA, GoPay, dsb) dengan pembukuan pengeluaran kas transparan.
              </p>
            </div>

            {/* Modul 4 */}
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all space-y-4 group">
              <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105">
                <FileText size={24} />
              </div>
              <h3 className="font-bold text-slate-800 dark:text-white text-base">Permohonan Surat Kuasa</h3>
              <p className="text-xs text-slate-600 dark:text-zinc-350 leading-relaxed font-semibold">
                Warga bisa membuat draf surat pengantar (KTP, Domisili, SKTM) dari dashboard mereka untuk disetujui Ketua RT secara digital.
              </p>
            </div>

            {/* Modul 5 */}
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all space-y-4 group">
              <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105">
                <MessageSquare size={24} />
              </div>
              <h3 className="font-bold text-slate-800 dark:text-white text-base">Kanal Pengaduan & Aspirasi</h3>
              <p className="text-xs text-slate-600 dark:text-zinc-355 dark:text-zinc-350 leading-relaxed font-semibold">
                Laporkan masalah lingkungan (seperti jalanan rusak, pemadaman) lengkap dengan bukti foto dan pelacak proses terpadu.
              </p>
            </div>

            {/* Modul 6 */}
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all space-y-4 group">
              <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105">
                <Smartphone size={24} />
              </div>
              <h3 className="font-bold text-slate-800 dark:text-white text-base">Aplikasi PWA Ringan</h3>
              <p className="text-xs text-slate-600 dark:text-zinc-350 leading-relaxed font-semibold">
                Instal RTKu di desktop maupun layar depan HP Anda layaknya aplikasi native mobile tanpa biaya storage besar.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Security Info */}
      <section className="py-20 bg-white dark:bg-zinc-900 border-t border-slate-200 dark:border-zinc-800 text-center">
        <div className="max-w-2xl mx-auto px-6 space-y-5">
          <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
            <Lock size={28} />
          </div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white">Privasi Berkas Kependudukan Terjamin</h3>
          <p className="text-sm text-slate-600 dark:text-zinc-300 leading-relaxed font-medium">
            Gambar Kartu Keluarga (KK) yang diunggah hanya diproses sekali oleh server RTKu AI untuk ekstraksi biodata sensus (OCR). Setelah selesai dianalisis, berkas media foto langsung dihapus permanen untuk mencegah penyalahgunaan data.
          </p>
        </div>
      </section>

      {/* License Price Section */}
      <section className="bg-slate-50 dark:bg-zinc-950 py-24 border-t border-slate-200 dark:border-zinc-800 relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-8">
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white">
            Aktivasi Cepat, Akses Permanen
          </h2>
          <p className="text-slate-600 dark:text-zinc-300 max-w-xl mx-auto font-medium text-sm leading-relaxed">
            Dapatkan masa coba gratis sistem RTKu selama 7 hari. Bayar sekali tanpa iuran bulanan untuk mengaktifkan kode lisensi unit RT Anda selamanya.
          </p>
          <div className="inline-block bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800/80 p-8 rounded-3xl shadow-xl max-w-md w-full relative group">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-700 to-indigo-550 to-indigo-500 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-md">
              LISENSI SEUMUR HIDUP (LIFETIME)
            </div>

            <div className="text-[10px] font-black text-slate-550 dark:text-zinc-500 uppercase tracking-widest mt-3 font-mono">Investasi Digital RT Terbaik</div>
            <div className="text-5xl font-black text-indigo-600 dark:text-indigo-400 mt-3">Rp 15.000</div>
            <div className="text-xs text-slate-600 dark:text-zinc-405 mt-4 leading-relaxed font-bold">
              Bayar sekali via QRIS / E-wallet RT Anda untuk mengaktifkan Lisensi RTKu selamanya tanpa biaya tambahan tersembunyi.
            </div>

            <div className="pt-6 mt-6 border-t border-slate-200 dark:border-zinc-800 flex justify-center">
              <Link
                href="/beranda"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold px-8 py-3.5 rounded-xl shadow-md transition-all active:scale-97 hover:-translate-y-0.5 cursor-pointer uppercase text-xs tracking-wider"
              >
                Mulai Setup Sekarang
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-zinc-950 text-zinc-500 py-12 border-t border-zinc-900 text-center text-xs font-semibold">
        <div className="max-w-6xl mx-auto px-6 space-y-2">
          <p>&copy; {new Date().getFullYear()} RTKu. Powered by Next.js & Pakasir Payment. Made in Indonesia 🇮🇩</p>
          <p className="text-[10px] text-zinc-650 text-zinc-500">Aplikasi Administrasi Rukun Tetangga (RT) Mandiri Terdesentralisasi.</p>
        </div>
      </footer>
    </div>
  );
}
