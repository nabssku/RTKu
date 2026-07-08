import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, getOrCreateRtId } from "@/lib/auth";
import prisma from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rtId = await getOrCreateRtId((session.user as any).id);

  const data = await prisma.keuangan.findMany({ where: { rtId }, orderBy: { tanggal: "desc" } });

  // Calculate total saldo
  let saldo = 0;
  data.forEach((trx: any) => {
    if (trx.jenis === "PEMASUKAN") saldo += trx.nominal;
    else saldo -= trx.nominal;
  });

  return NextResponse.json({ data, saldo });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rtId = await getOrCreateRtId((session.user as any).id);

  const { jenis, kategori, nominal, keterangan } = await req.json();
  const data = await prisma.keuangan.create({ data: { jenis, kategori, nominal: parseFloat(nominal), keterangan, rtId } });
  return NextResponse.json({ data });
}
