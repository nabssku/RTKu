import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, getOrCreateRtId } from "@/lib/auth";
import prisma from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rtId = await getOrCreateRtId((session.user as any).id);

  const data = await prisma.inventaris.findMany({ where: { rtId }, include: { peminjaman: { where: { status: "DIPINJAM" } } } });
  return NextResponse.json({ data });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rtId = await getOrCreateRtId((session.user as any).id);

  const { nama, jumlah, kondisi, lokasi } = await req.json();
  const data = await prisma.inventaris.create({ data: { nama, jumlah: parseInt(jumlah), kondisi, lokasi, rtId } });
  return NextResponse.json({ data });
}
