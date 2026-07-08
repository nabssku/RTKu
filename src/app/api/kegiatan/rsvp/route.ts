import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { sendWhatsApp } from "@/lib/otp";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const kegiatanId = searchParams.get("id");

    if (!kegiatanId) {
      return NextResponse.json({ error: "Missing kegiatanId" }, { status: 400 });
    }

    const kegiatan = await prisma.kegiatan.findUnique({
      where: { id: kegiatanId },
      select: {
        id: true,
        judul: true,
        deskripsi: true,
        tanggal: true,
        waktu: true,
        lokasi: true,
        rtId: true
      }
    });

    if (!kegiatan) {
      return NextResponse.json({ error: "Kegiatan not found" }, { status: 404 });
    }

    return NextResponse.json({ data: kegiatan });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch kegiatan" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { kegiatanId, hadir, keterangan, nama, telepon } = await req.json();

    if (!kegiatanId || hadir === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const kegiatan = await prisma.kegiatan.findUnique({
      where: { id: kegiatanId },
      include: { rt: true }
    });

    if (!kegiatan) {
      return NextResponse.json({ error: "Kegiatan not found" }, { status: 404 });
    }

    let userId: string;
    let finalPhone = "";
    let finalName = "";

    // 1. Check if user is logged in
    const session = await getServerSession(authOptions);
    if (session?.user) {
      userId = session.user.id;
      const user = await prisma.user.findUnique({ where: { id: userId } });
      finalPhone = user?.phone || "";
      finalName = user?.name || "";
    } else {
      // Public link Submission (WhatsApp RSVP link)
      if (!nama || !telepon) {
        return NextResponse.json({ error: "Nama dan Telepon wajib diisi untuk konfirmasi publik" }, { status: 400 });
      }

      // Format telepon
      const cleaned = telepon.replace(/\D/g, "");
      const formattedPhone = cleaned.startsWith("0")
        ? "62" + cleaned.substring(1)
        : cleaned.startsWith("62")
        ? cleaned
        : "62" + cleaned;

      // Find or create User with role WARGA
      let user = await prisma.user.findUnique({ where: { phone: formattedPhone } });
      if (!user) {
        user = await prisma.user.create({
          data: {
            phone: formattedPhone,
            name: nama,
            role: "WARGA",
            rtId: kegiatan.rtId
          }
        });
      }
      userId = user.id;
      finalPhone = formattedPhone;
      finalName = nama;
    }

    // 2. Security Check: 1 device / user can only confirm once
    const existingRSVP = await prisma.rSVP.findUnique({
      where: {
        kegiatanId_userId: {
          kegiatanId,
          userId
        }
      }
    });

    if (existingRSVP) {
      return NextResponse.json({ error: "Anda sudah melakukan konfirmasi kehadiran untuk kegiatan ini" }, { status: 400 });
    }

    // 3. Create RSVP
    const rsvp = await prisma.rSVP.create({
      data: {
        kegiatanId,
        userId,
        hadir: !!hadir,
        keterangan: keterangan || ""
      }
    });

    // 4. Send WhatsApp Notification to Ketua RT
    // Find Ketua RT phone number
    const ketuaRT = await prisma.user.findFirst({
      where: {
        rtId: kegiatan.rtId,
        role: "KETUA_RT"
      }
    });

    const targetPhone = ketuaRT?.phone || kegiatan.rt?.kontakKetua;
    if (targetPhone) {
      const statusKehadiran = hadir ? "✅ HADIR" : "❌ TIDAK HADIR";
      const waMessage = `*RTKu RSVP Info*\n\n` +
        `Warga telah mengonfirmasi kehadiran:\n` +
        `• *Acara/Rapat:* ${kegiatan.judul}\n` +
        `• *Nama:* ${finalName}\n` +
        `• *WhatsApp:* +${finalPhone}\n` +
        `• *Status:* ${statusKehadiran}\n` +
        `• *Keterangan:* ${keterangan || "-"}\n\n` +
        `Sistem RTKu PWA.`;

      await sendWhatsApp(targetPhone, waMessage);
    }

    return NextResponse.json({ success: true, data: rsvp });
  } catch (error: any) {
    console.error("Error RSVP:", error);
    return NextResponse.json({ error: error.message || "Failed to confirm RSVP" }, { status: 500 });
  }
}
