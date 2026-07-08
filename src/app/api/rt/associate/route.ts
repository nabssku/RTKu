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

    const { rtId } = await req.json();
    if (!rtId) {
      return NextResponse.json({ error: "rtId is required" }, { status: 400 });
    }

    const rt = await prisma.rT.findUnique({ where: { id: rtId } });
    if (!rt) {
      return NextResponse.json({ error: "RT target tidak ditemukan" }, { status: 404 });
    }

    // Update user to WARGA role and associate with this RT
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        rtId,
        role: "WARGA"
      }
    });

    return NextResponse.json({ success: true, message: "Berhasil bergabung dengan RT target" });
  } catch (error: any) {
    console.error("Error associating RT:", error);
    return NextResponse.json({ error: error.message || "Failed to associate RT" }, { status: 500 });
  }
}
