import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, getOrCreateRtId } from "@/lib/auth";
import prisma from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rtId = await getOrCreateRtId((session.user as any).id);

  const data = await prisma.pengaduan.findMany({ where: { rtId }, include: { user: true }, orderBy: { createdAt: "desc" } });
  return NextResponse.json({ data });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rtId = await getOrCreateRtId((session.user as any).id);

  const { judul, deskripsi, kategori, isAnonim, fotoUrl } = await req.json();
  const data = await prisma.pengaduan.create({ data: { judul, deskripsi, kategori, isAnonim: !!isAnonim, userId: session.user.id, rtId, fotoUrl: fotoUrl || null } });
  return NextResponse.json({ data });
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const dbUser = await prisma.user.findUnique({ where: { id: (session.user as any).id } });
  if (dbUser?.role !== "KETUA_RT") {
    return NextResponse.json({ error: "Forbidden: Only Ketua RT can update complaint status" }, { status: 403 });
  }

  try {
    const { aduanId, status, tanggapan } = await req.json();
    if (!aduanId || !status) {
      return NextResponse.json({ error: "aduanId and status are required" }, { status: 400 });
    }

    const updated = await prisma.pengaduan.update({
      where: { id: aduanId },
      data: {
        status,
        tanggapan: tanggapan || null
      }
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error("Error updating complaint status:", error);
    return NextResponse.json({ error: error.message || "Failed to update complaint" }, { status: 500 });
  }
}
