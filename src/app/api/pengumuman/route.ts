import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, getOrCreateRtId } from "@/lib/auth";
import prisma from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rtId = await getOrCreateRtId((session.user as any).id);

  const data = await prisma.pengumuman.findMany({ where: { rtId }, orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }] });
  return NextResponse.json({ data });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const dbUser = await prisma.user.findUnique({ where: { id: (session.user as any).id } });
  if (dbUser?.role === "WARGA") {
    return NextResponse.json({ error: "Forbidden: Warga cannot create pengumuman" }, { status: 403 });
  }

  const rtId = await getOrCreateRtId((session.user as any).id);

  const { judul, konten, isPinned } = await req.json();
  const data = await prisma.pengumuman.create({ data: { judul, konten, isPinned: !!isPinned, rtId } });
  return NextResponse.json({ data });
}
