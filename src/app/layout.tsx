import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RTKu - Aplikasi Rukun Tetangga Pintar & Mandiri",
  description: "RTKu memodernisasi cara kerja Rukun Tetangga (RT). Sensus warga cepat dengan AI OCR Kartu Keluarga, transparansi laporan kas keuangan, pelaporan pengaduan, dan transaksi iuran online terintegrasi.",
  keywords: ["RTKu", "Aplikasi RT", "Aplikasi Rukun Tetangga", "Sistem Administrasi RT", "AI OCR Kartu Keluarga", "Pembayaran Iuran RT", "Laporan Kas RT", "Surat Pengantar RT"],
  authors: [{ name: "RTKu Team" }],
  creator: "RTKu",
  publisher: "RTKu",
  metadataBase: new URL("http://localhost:3000"), // Default localhost/domain build fallback
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "RTKu - Aplikasi Rukun Tetangga Pintar & Mandiri",
    description: "Modernisasi administrasi RT Anda. Input data otomatis dengan AI OCR Kartu Keluarga, sistem keuangan kas transparan, dan kelola warga secara terpusat.",
    url: "/",
    siteName: "RTKu",
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "RTKu - Aplikasi Rukun Tetangga Pintar",
    description: "Manajemen rukun tetangga digital dan sensus warga cepat berbasis kecerdasan buatan.",
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
