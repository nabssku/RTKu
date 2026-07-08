import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { inventarisId, keterangan } = await req.json();
    if (!inventarisId) {
      return NextResponse.json({ error: "inventarisId is required" }, { status: 400 });
    }

    const asset = await prisma.inventaris.findUnique({
      where: { id: inventarisId },
      include: { peminjaman: { where: { status: "DIPINJAM" } } }
    });

    if (!asset) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }

    if (asset.peminjaman.length > 0) {
      return NextResponse.json({ error: "Asset is currently borrowed" }, { status: 400 });
    }

    const dbUser = await prisma.user.findUnique({ where: { id: session.user.id } });
    const peminjaman = await prisma.peminjaman.create({
      data: {
        inventarisId,
        peminjam: dbUser?.name || session.user.name || "Warga",
        telepon: dbUser?.phone || (session.user as any).phone || "",
        status: "DIPINJAM",
        keterangan: keterangan || "Dipinjam oleh warga"
      }
    });

    return NextResponse.json({ success: true, data: peminjaman });
  } catch (error: any) {
    console.error("Error borrowing asset:", error);
    return NextResponse.json({ error: error.message || "Failed to borrow asset" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { peminjamanId } = await req.json();
    if (!peminjamanId) {
      return NextResponse.json({ error: "peminjamanId is required" }, { status: 400 });
    }

    const peminjaman = await prisma.peminjaman.update({
      where: { id: peminjamanId },
      data: {
        status: "DIKEMBALIKAN",
        tanggalKembali: new Date()
      }
    });

    return NextResponse.json({ success: true, data: peminjaman });
  } catch (error: any) {
    console.error("Error returning asset:", error);
    return NextResponse.json({ error: error.message || "Failed to return asset" }, { status: 500 });
  }
}
