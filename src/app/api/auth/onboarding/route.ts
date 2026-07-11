import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const dbUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { rt: true }
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await req.json();

    if (dbUser.role === "KETUA_RT") {
      const { name, namaSekretaris, namaBendahara, alamat } = body;
      if (!name || !namaSekretaris || !namaBendahara || !alamat) {
        return NextResponse.json({ error: "Semua bidang setup Ketua RT wajib diisi" }, { status: 400 });
      }

      // Update data Ketua RT
      await prisma.user.update({
        where: { id: userId },
        data: {
          name: name,
          isOnboarded: true
        }
      });

      // Update data RT
      if (dbUser.rtId) {
        await prisma.rT.update({
          where: { id: dbUser.rtId },
          data: {
            kontakKetua: dbUser.phone, // Default kontak ketua ke HP login
            namaSekretaris,
            namaBendahara,
            alamat,
            isOnboarded: true
          }
        });
      }

      return NextResponse.json({ success: true, message: "Onboarding Ketua RT berhasil" });
    } else {
      // Skenario untuk warga baru
      const { name } = body;
      if (!name) {
        return NextResponse.json({ error: "Nama Kepala Keluarga wajib diisi" }, { status: 400 });
      }

      await prisma.user.update({
        where: { id: userId },
        data: {
          name: name,
          isOnboarded: true
        }
      });

      return NextResponse.json({ success: true, message: "Onboarding Warga berhasil" });
    }
  } catch (error: any) {
    console.error("Error onboarding user:", error);
    return NextResponse.json({ error: error.message || "Gagal memproses onboarding" }, { status: 500 });
  }
}
