import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, getOrCreateRtId } from "@/lib/auth";
import prisma from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rtId = await getOrCreateRtId((session.user as any).id);

  try {
    const iuran = await prisma.iuran.findMany({
      where: { rtId },
      include: {
        pembayaran: {
          include: {
            warga: true
          }
        }
      }
    });

    return NextResponse.json({ data: iuran });
  } catch (error) {
    console.error("Error get iuran:", error);
    return NextResponse.json({ error: "Failed to fetch iuran" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dbUser = await prisma.user.findUnique({ where: { id: (session.user as any).id } });
  if (dbUser?.role === "WARGA") {
    return NextResponse.json({ error: "Forbidden: Warga cannot create iuran category" }, { status: 403 });
  }

  const rtId = await getOrCreateRtId((session.user as any).id);

  try {
    const { nama, nominal, deskripsi, periode } = await req.json();

    if (!nama || !nominal) {
      return NextResponse.json({ error: "Nama and nominal are required" }, { status: 400 });
    }

    const iuran = await prisma.iuran.create({
      data: {
        nama,
        nominal: parseFloat(nominal),
        deskripsi,
        periode: periode || "Bulanan",
        rtId
      }
    });

    return NextResponse.json({ data: iuran });
  } catch (error: any) {
    console.error("Error create iuran:", error);
    return NextResponse.json({ error: error.message || "Failed to create iuran" }, { status: 500 });
  }
}