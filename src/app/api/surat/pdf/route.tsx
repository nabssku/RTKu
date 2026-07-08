import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import React from "react";
import { renderToBuffer, Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

// Styles for React PDF Document
const styles = StyleSheet.create({
  page: {
    padding: 50,
    fontFamily: "Helvetica",
    fontSize: 12,
    lineHeight: 1.6,
    color: "#1e293b",
  },
  header: {
    borderBottomWidth: 2,
    borderBottomColor: "#0f172a",
    paddingBottom: 15,
    marginBottom: 20,
    alignItems: "center",
  },
  titleRT: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0f172a",
  },
  subHeader: {
    fontSize: 10,
    color: "#475569",
    marginTop: 2,
  },
  titleSurat: {
    fontSize: 14,
    fontWeight: "bold",
    textDecoration: "underline",
    textAlign: "center",
    marginTop: 15,
    textTransform: "uppercase",
    color: "#0f172a",
  },
  nomorSurat: {
    fontSize: 10,
    textAlign: "center",
    marginBottom: 25,
    color: "#64748b",
  },
  paragraph: {
    textAlign: "justify",
    marginBottom: 15,
  },
  signatureContainer: {
    marginTop: 40,
    alignItems: "flex-end",
  },
  signatureBox: {
    width: 200,
    alignItems: "center",
  },
  spaceSignature: {
    height: 60,
  },
  signerTitle: {
    fontWeight: "bold",
    textDecoration: "underline",
  },
});

// PDF Document Component
function SuratDocument({ surat, rt, warga }: { surat: any; rt: any; warga: any }) {
  const currentDate = new Date(surat.createdAt || new Date()).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const location = rt.kabupaten ? rt.kabupaten.replace(/^(kabupaten|kab\.|kota)\s+/i, "") : "Setempat";

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Kop Surat */}
        <View style={styles.header}>
          <Text style={styles.titleRT}>RUKUN TETANGGA {rt.nomorRT || "00"} / RW {rt.nomorRW || "00"}</Text>
          <Text style={styles.subHeader}>
            Kelurahan {rt.kelurahan || "-"} • Kecamatan {rt.kecamatan || "-"} • {rt.kabupaten || "-"}
          </Text>
          <Text style={styles.subHeader}>Provinsi {rt.provinsi || "-"} • Kode Pos {rt.kodePos || "-"}</Text>
        </View>

        {/* Judul Surat */}
        <Text style={styles.titleSurat}>{surat.jenisSurat}</Text>
        <Text style={styles.nomorSurat}>Nomor: {surat.nomorSurat}</Text>

        {/* Content */}
        <View>
          <Text style={styles.paragraph}>
            Yang bertanda tangan di bawah ini Ketua Rukun Tetangga (RT) {rt.nomorRT || "-"} / RW {rt.nomorRW || "-"} Kelurahan {rt.kelurahan || "-"} Kecamatan {rt.kecamatan || "-"} menerangkan dengan sebenarnya bahwa:
          </Text>

          <View style={{ marginVertical: 15, paddingLeft: 30 }}>
            <Text>Nama Lengkap :  {warga?.nama || "-"}</Text>
            <Text>NIK/No. KTP    :  {warga?.nik || "-"}</Text>
            <Text>Tempat/Tgl Lahir:  {warga?.tempatLahir || "-"}, {warga?.tanggalLahir ? new Date(warga.tanggalLahir).toLocaleDateString("id-ID") : "-"}</Text>
            <Text>Jenis Kelamin  :  {warga?.jenisKelamin === "LAKI_LAKI" ? "Laki-laki" : warga?.jenisKelamin === "PEREMPUAN" ? "Perempuan" : "-"}</Text>
            <Text>Agama          :  {warga?.agama || "-"}</Text>
            <Text>Pekerjaan      :  {warga?.pekerjaan || "-"}</Text>
            <Text>Alamat         :  {warga?.keluarga?.alamat || "-"}</Text>
          </View>

          <Text style={styles.paragraph}>
            Adalah benar yang bersangkutan warga kami yang bertempat tinggal di alamat tersebut di atas. Surat pengantar ini diberikan untuk keperluan pengurusan: {surat.perihal}.
          </Text>

          <Text style={styles.paragraph}>
            Demikian surat pengantar ini dibuat dengan sebenarnya untuk dapat dipergunakan sebagaimana mestinya.
          </Text>
        </View>

        {/* Tanda Tangan Ketua RT */}
        <View style={styles.signatureContainer}>
          <View style={styles.signatureBox}>
            <Text>{location}, {currentDate}</Text>
            <Text>Ketua RT {rt.nomorRT || "00"}</Text>
            <View style={styles.spaceSignature} />
            <Text style={styles.signerTitle}>( {rt.kontakKetua || "Nama Ketua RT"} )</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Surat ID is required" }, { status: 400 });
  }

  try {
    const surat = await prisma.surat.findUnique({
      where: { id },
      include: {
        wargaSurat: {
          include: {
            warga: {
              include: { keluarga: true }
            }
          }
        },
        rt: true
      }
    });

    if (!surat || !surat.rt) {
      return NextResponse.json({ error: "Surat not found" }, { status: 404 });
    }

    const rt = surat.rt;
    const warga = surat.wargaSurat?.[0]?.warga;

    // Generate PDF Buffer menggunakan @react-pdf/renderer
    const pdfBuffer = await renderToBuffer(<SuratDocument surat={surat} rt={rt} warga={warga} />);

    return new NextResponse(pdfBuffer as any, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=surat-${surat.nomorSurat.replace(/\//g, "-")}.pdf`,
      },
    });

  } catch (error: any) {
    console.error("Error generating PDF:", error);
    return NextResponse.json({ error: error.message || "Failed to generate PDF" }, { status: 500 });
  }
}
