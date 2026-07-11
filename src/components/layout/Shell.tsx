"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Users,
  CreditCard,
  Mail,
  MessageSquare,
  Megaphone,
  Wallet,
  Package,
  Calendar,
  Settings,
  Menu,
  X,
  UserCheck,
  Building,
  ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigations = [
  { name: "Beranda", href: "/beranda", icon: Home },
  { name: "Warga", href: "/warga", icon: Users },
  { name: "Iuran", href: "/iuran", icon: CreditCard },
  { name: "Surat", href: "/surat", icon: Mail },
  { name: "Pengaduan", href: "/pengaduan", icon: MessageSquare },
  { name: "Pengumuman", href: "/pengumuman", icon: Megaphone },
  { name: "Keuangan", href: "/keuangan", icon: Wallet },
  { name: "Inventaris", href: "/inventaris", icon: Package },
  { name: "Kegiatan", href: "/kegiatan", icon: Calendar },
  { name: "Pengaturan", href: "/pengaturan", icon: Settings },
];

export function Shell({
  children,
  userRole,
  isOnboarded: initialIsOnboarded
}: {
  children: React.ReactNode;
  userRole: string;
  isOnboarded: boolean;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isOnboarded, setIsOnboarded] = useState(initialIsOnboarded);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // States untuk Form Onboarding
  const [name, setName] = useState("");
  const [namaSekretaris, setNamaSekretaris] = useState("");
  const [namaBendahara, setNamaBendahara] = useState("");
  const [alamat, setAlamat] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const visibleNavigations = navigations.filter((item) => {
    if (userRole === "WARGA") {
      return ["Beranda", "Warga", "Iuran", "Pengaduan", "Pengumuman", "Kegiatan"].includes(item.name);
    }
    return true;
  });

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const inviteRtId = localStorage.getItem("invite_rt_id");
      if (inviteRtId) {
        fetch("/api/rt/associate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rtId: inviteRtId })
        }).then((res) => {
          if (res.ok) {
            localStorage.removeItem("invite_rt_id");
            window.location.reload();
          }
        }).catch((err) => console.error(err));
      }
    }
  }, []);

  const handleOnboardingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const payload = userRole === "KETUA_RT"
        ? { name, namaSekretaris, namaBendahara, alamat }
        : { name };

      const res = await fetch("/api/auth/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (res.ok) {
        setIsOnboarded(true);
        // Paksa reload penuh agar token JWT sesi klien NextAuth diperbarui dengan data profil yang baru
        window.location.reload();
      } else {
        setErrorMsg(data.error || "Gagal menyimpan onboarding");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Koneksi bermasalah. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-zinc-950 text-slate-800 dark:text-zinc-200 transition-colors">
      {/* ONBOARDING DIALOG MODAL LAYOUT */}
      {!isOnboarded && (
        <div className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl relative animate-in zoom-in-95 duration-200">
            {userRole === "KETUA_RT" ? (
              // Onboarding Form untuk Ketua RT Baru
              <form onSubmit={handleOnboardingSubmit} className="space-y-5">
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mx-auto">
                    <Building className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white">Setup RT Baru Anda</h2>
                  <p className="text-xs text-slate-500">Lengkapi data awal pengurus dan kesekretariatan RT untuk memulai.</p>
                </div>

                {errorMsg && (
                  <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-650 dark:text-red-400 text-xs font-semibold rounded-xl text-center">
                    {errorMsg}
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Nama Ketua RT</label>
                    <input
                      type="text"
                      required
                      placeholder="Masukkan nama Ketua RT"
                      className="w-full border dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950 p-2.5 rounded-xl text-sm dark:text-white placeholder:text-slate-400"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Nama Sekretaris</label>
                      <input
                        type="text"
                        required
                        placeholder="Nama Sekretaris"
                        className="w-full border dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950 p-2.5 rounded-xl text-sm dark:text-white placeholder:text-slate-400"
                        value={namaSekretaris}
                        onChange={(e) => setNamaSekretaris(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Nama Bendahara</label>
                      <input
                        type="text"
                        required
                        placeholder="Nama Bendahara"
                        className="w-full border dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950 p-2.5 rounded-xl text-sm dark:text-white placeholder:text-slate-400"
                        value={namaBendahara}
                        onChange={(e) => setNamaBendahara(e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Alamat Sekretariat RT</label>
                    <textarea
                      required
                      rows={2.5}
                      placeholder="Contoh: Perum Indah Blok A No. 12"
                      className="w-full border dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950 p-2.5 rounded-xl text-sm dark:text-white placeholder:text-slate-400 resize-none"
                      value={alamat}
                      onChange={(e) => setAlamat(e.target.value)}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white font-bold rounded-xl text-sm shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? "Menyimpan data..." : (
                    <>
                      Simpan & Mulai Dashboard
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              // Onboarding Form untuk Warga Baru
              <form onSubmit={handleOnboardingSubmit} className="space-y-5">
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mx-auto">
                    <UserCheck className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white">Lengkapi Nama Warga</h2>
                  <p className="text-xs text-slate-500">Selamat datang di RTKu! Silakan isi nama lengkap Kepala Keluarga Anda.</p>
                </div>

                {errorMsg && (
                  <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-650 dark:text-red-400 text-xs font-semibold rounded-xl text-center">
                    {errorMsg}
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Nama Lengkap Kepala Keluarga</label>
                  <input
                    type="text"
                    required
                    placeholder="Masukkan nama lengkap Anda"
                    className="w-full border dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950 p-2.5 rounded-xl text-sm dark:text-white placeholder:text-slate-400"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white font-bold rounded-xl text-sm shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? "Menyimpan data..." : (
                    <>
                      Masuk ke Halaman Utama
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-zinc-950/60 backdrop-blur-sm md:hidden animate-fade-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-zinc-900 border-r border-slate-200 dark:border-zinc-800/80 transform transition-all duration-300 ease-in-out md:static md:translate-x-0 hidden md:flex flex-col shadow-lg shadow-slate-100/50 dark:shadow-none",
          sidebarOpen ? "translate-x-0 flex" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between h-18 px-6 border-b border-slate-200 dark:border-zinc-800/85">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-600 dark:bg-indigo-500 rounded-xl flex items-center justify-center shadow-md shadow-indigo-550/20">
              <span className="text-white font-extrabold text-xl">R</span>
            </div>
            <span className="text-xl font-black text-slate-900 dark:text-white bg-gradient-to-r from-zinc-900 via-indigo-900 to-indigo-700 bg-clip-text text-transparent dark:from-white dark:to-zinc-300">RTKu</span>
          </Link>
          <button className="md:hidden p-1.5 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg text-slate-500 transition-colors" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-5 px-4 space-y-1">
          {visibleNavigations.map((item) => {
            const isActive = pathname?.startsWith(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-200",
                  isActive
                    ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-750 dark:text-indigo-400 border-l-4 border-indigo-600"
                    : "text-slate-650 hover:bg-slate-100/80 hover:text-slate-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
                )}
              >
                <item.icon className={cn("w-5 h-5 transition-transform duration-200 group-hover:scale-105", isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400")} />
                {item.name}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Top Navbar */}
        <header className="h-18 flex-shrink-0 bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800/80 flex items-center px-6 justify-between md:justify-end shadow-sm shadow-slate-100/10">
          <button
            className="md:hidden p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl transition-all"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="flex items-center gap-4">
            <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700/80 flex items-center justify-center font-extrabold text-sm text-indigo-650 dark:text-indigo-455">
              RT
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 lg:p-10 bg-slate-50/70 dark:bg-zinc-950/40 animate-fade-in">
          {children}
        </main>

        {/* Mobile bottom nav spacer to prevent content overlapping with fixed nav */}
        <div className="h-18 md:hidden"></div>
      </div>

      {/* Mobile Bottom Navigation (only shown on small screens) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-18 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-lg border-t border-slate-200 dark:border-zinc-800/80 flex items-center justify-around z-40 px-3 pb-safe shadow-lg">
        {visibleNavigations.slice(0, 4).map((item) => {
          const isActive = pathname?.startsWith(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full space-y-1 relative transition-colors",
                isActive ? "text-indigo-600 dark:text-indigo-400 font-bold" : "text-slate-500 dark:text-zinc-400 font-medium"
              )}
            >
              <item.icon className="w-5.5 h-5.5" />
              <span className="text-[9.5px] leading-none tracking-wide">{item.name}</span>
            </Link>
          );
        })}
        <button
          onClick={() => setSidebarOpen(true)}
          className="flex flex-col items-center justify-center w-full h-full space-y-1 text-slate-500 dark:text-zinc-400 font-medium cursor-pointer"
        >
          <Menu className="w-5.5 h-5.5" />
          <span className="text-[9.5px] leading-none tracking-wide">Menu</span>
        </button>
      </div>
    </div>
  );
}
