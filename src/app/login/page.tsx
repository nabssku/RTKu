"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ShieldCheck, ArrowRight, Sparkles, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const rtIdParam = params.get("rtId");
      if (rtIdParam) {
        localStorage.setItem("invite_rt_id", rtIdParam);
        document.cookie = `invite_rt_id=${rtIdParam}; path=/; max-age=3600; SameSite=Lax`;
      }
    }
  }, []);

  const startResendTimer = () => {
    setResendTimer(60);
    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return;

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });

      const data = await res.json();
      if (res.ok) {
        setStep("otp");
        startResendTimer();
        // Mode dev / fallback jika Fonnte belum dipasang
        if (data.message && data.message.includes("dev mode")) {
          alert(`[DEV MODE] Kode OTP Anda telah dikirim! Cek log konsol atau gunakan kode simulasi: 123456 (atau lihat log backend)`);
        } else {
          alert("Kode OTP telah dikirim melalui WhatsApp!");
        }
      } else {
        alert(data.error || "Gagal mengirim OTP");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan sistem.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode) return;

    setIsLoading(true);
    try {
      // Sign in menggunakan NextAuth credentials provider 'otp-login'
      const result = await signIn("otp-login", {
        phone,
        code: otpCode,
        redirect: false,
      });

      if (result?.error) {
        alert("Kode OTP salah atau sudah kedaluwarsa.");
      } else {
        router.push("/beranda");
        router.refresh();
      }
    } catch (err) {
      console.error(err);
      alert("Gagal melakukan verifikasi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col justify-center items-center relative overflow-hidden px-6 py-12 selection:bg-indigo-500 selection:text-white">
      {/* Dynamic gradients for beautiful visual glow */}
      <div className="absolute top-[-25%] left-[-20%] w-[70%] aspect-square rounded-full bg-indigo-650/15 blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-[-25%] right-[-20%] w-[70%] aspect-square rounded-full bg-sky-600/10 blur-[130px] pointer-events-none"></div>

      <div className="w-full max-w-[440px] z-10 space-y-10 animate-slide-up">
        {/* Brand logo & header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10.5px] font-black uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/15 backdrop-blur-md mb-1.5">
            <Sparkles className="w-3.5 h-3.5 animate-pulse text-indigo-455" /> Aplikasi RT Masa Kini
          </div>
          <div className="flex justify-center items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-tr from-indigo-600 to-indigo-500 rounded-xl flex items-center justify-center shadow-xl shadow-indigo-500/25">
              <span className="text-white font-black text-2xl">R</span>
            </div>
            <h1 className="text-3.5xl font-black tracking-tight text-white">RTKu</h1>
          </div>
          <p className="text-zinc-400 text-sm font-medium">Masuk untuk mengelola administrasi & iuran warga</p>
        </div>

        {/* Login Card */}
        <div className="bg-zinc-900/40 border border-zinc-800/80 backdrop-blur-2xl p-8 md:p-10 rounded-[28px] shadow-2xl space-y-8 relative overflow-hidden">
          {step === "phone" ? (
            <form onSubmit={handleRequestOTP} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Nomor WhatsApp</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 font-extrabold text-sm border-r border-zinc-800 pr-3">+62</span>
                  <input
                    type="tel"
                    required
                    placeholder="8123456789"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                    className="w-full pl-18 pr-4 py-3.5 bg-zinc-950/90 border border-zinc-800 rounded-2xl text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all placeholder:text-zinc-650"
                  />
                </div>
                <div className="flex items-start gap-1.5 mt-2">
                  <AlertCircle size={14} className="text-zinc-550 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-zinc-500 leading-normal">Kami akan mengirimkan kode verifikasi 6-digit ke nomor WhatsApp ini secara otomatis.</p>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !phone}
                className="w-full bg-gradient-to-r from-indigo-650 to-indigo-550 hover:from-indigo-600 hover:to-indigo-500 text-white font-extrabold py-3.5 px-4 rounded-2xl shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20 active:scale-99 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Mengirim OTP..." : "Kirim Kode OTP"}
                <ArrowRight className="w-4 h-4 text-white" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Kode Verifikasi (OTP)</label>
                  <button
                    type="button"
                    onClick={() => setStep("phone")}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-bold transition-colors"
                  >
                    Ubah Nomor
                  </button>
                </div>
                <input
                  type="text"
                  maxLength={6}
                  required
                  placeholder="123456"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                  className="w-full text-center tracking-[0.8em] text-xl font-black py-4 bg-zinc-950/90 border border-zinc-800 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all placeholder:text-zinc-800 placeholder:tracking-normal"
                />
                <div className="flex justify-between items-center mt-2.5 text-xs">
                  <span className="text-zinc-500">Kirim ulang dalam:</span>
                  {resendTimer > 0 ? (
                    <span className="text-zinc-400 font-bold">{resendTimer} detik</span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleRequestOTP}
                      className="text-indigo-400 hover:text-indigo-300 font-black transition-colors"
                    >
                      Kirim Ulang
                    </button>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || otpCode.length !== 6}
                className="w-full bg-gradient-to-r from-indigo-650 to-indigo-550 hover:from-indigo-600 hover:to-indigo-500 text-white font-extrabold py-3.5 px-4 rounded-2xl shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20 active:scale-99 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Verifikasi..." : "Verifikasi & Masuk"}
                <ShieldCheck className="w-5 h-5 text-white" />
              </button>
            </form>
          )}

          {/* Separator */}
          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-zinc-800/80"></div>
            <span className="flex-shrink mx-4 text-zinc-600 text-xs font-black uppercase tracking-widest">Atau</span>
            <div className="flex-grow border-t border-zinc-800/80"></div>
          </div>

          {/* Google Sign In */}
          <button
            onClick={() => signIn("google", { callbackUrl: "/beranda" })}
            className="w-full bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 text-zinc-300 font-bold py-3.5 px-4 rounded-2xl flex items-center justify-center gap-3 transition-colors cursor-pointer hover:text-white"
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
            </svg>
            Masuk dengan Google
          </button>
        </div>

        {/* Info PWA */}
        <div className="text-center text-xs text-zinc-500 leading-relaxed max-w-sm mx-auto font-medium">
          Dapat diinstal di HP melalui menu browser <span className="font-bold text-zinc-400">"Tambahkan ke Layar Utama"</span> atau <span className="font-bold text-zinc-400">"Add to Home Screen"</span>.
        </div>
      </div>
    </div>
  );
}
