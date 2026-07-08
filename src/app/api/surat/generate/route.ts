import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, getOrCreateRtId } from "@/lib/auth";
import prisma from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rtId = await getOrCreateRtId((session.user as any).id);

  try {
    const { wargaId, jenisSurat, perihal, isiSurat } = await req.json();

    if (!wargaId || !jenisSurat) {
      return NextResponse.json({ error: "WargaId and jenisSurat are required" }, { status: 400 });
    }

    const warga = await prisma.warga.findUnique({
      where: { id: wargaId },
      include: { keluarga: true }
    });

    if (!warga) {
      return NextResponse.json({ error: "Warga not found" }, { status: 404 });
    }

    const rt = await prisma.rT.findUnique({ where: { id: rtId } });
    if (!rt) {
      return NextResponse.json({ error: "RT not found" }, { status: 404 });
    }

    // Generate unique nomor surat
    const listSuratCount = await prisma.surat.count({ where: { rtId } });
    const noSurat = `${listSuratCount + 1}/SRT-RT${rt.nomorRT || "00"}/${new Date().getFullYear()}`;

    // Buat data isi surat template default jika kosong
    let fullIsiSurat = isiSurat || `Yang bertanda tangan di bawah ini Ketua RT ${rt.nomorRT || "-"} RW ${rt.nomorRW || "-"} Kelurahan ${rt.kelurahan || "-"} Kecamatan ${rt.kecamatan || "-"} menerangkan bahwa:\n\nNama: ${warga.nama}\nNIK: ${warga.nik}\nAlamat: ${warga.keluarga?.alamat || "-"}\n\nAdalah benar warga kami dan berkelakuan baik. Surat pengantar ini dibuat untuk perihal: *${perihal || "Pengantar KTP"}*.`;

    // Save database record
    const surat = await prisma.surat.create({
      data: {
        nomorSurat: noSurat,
        jenisSurat,
        perihal: perihal || "Surat Pengantar",
        isiSurat: fullIsiSurat,
        rtId,
        wargaSurat: {
          create: {
            wargaId
          }
        }
      }
    });

    return NextResponse.json({ data: surat });
  } catch (error: any) {
    console.error("Error creating surat:", error);
    return NextResponse.json({ error: error.message || "Failed to generate surat" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rtId = await getOrCreateRtId((session.user as any).id);

  try {
    const listSurat = await prisma.surat.findMany({
      where: { rtId },
      include: {
        wargaSurat: {
          include: {
            warga: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ data: listSurat });
  } catch (error) {
    console.error("Error fetch surat:", error);
    return NextResponse.json({ error: "Failed to fetch surat list" }, { status: 500 });
  }
}