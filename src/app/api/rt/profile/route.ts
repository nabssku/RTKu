import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const inviteRtId = req.cookies.get("invite_rt_id")?.value;

  let user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { rt: true }
  });

  if (user && !user.rtId && inviteRtId) {
    try {
      const targetRT = await prisma.rT.findUnique({ where: { id: inviteRtId } });
      if (targetRT) {
        user = await prisma.user.update({
          where: { id: session.user.id },
          data: { rtId: inviteRtId, role: "WARGA" },
          include: { rt: true }
        });
      }
    } catch (err) {
      console.error("Error linking invite RT:", err);
    }
  }

  if (!user || !user.rtId || !user.rt) {
    try {
      const defaultRT = await prisma.rT.create({
        data: {
          name: "RT Baru",
          nomorRT: "001",
          nomorRW: "004",
          kelurahan: "Sukamaju",
          kecamatan: "Bekasi Timur",
          kabupaten: "Kota Bekasi",
          provinsi: "Jawa Barat",
          trialEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days trial
          isActive: false // Trial mode initially
        }
      });

      const updatedUser = await prisma.user.update({
        where: { id: session.user.id },
        data: { rtId: defaultRT.id, role: "KETUA_RT" },
        include: { rt: true }
      });

      const res = NextResponse.json({ data: updatedUser.rt, role: "KETUA_RT" });
      res.cookies.delete("invite_rt_id");
      return res;
    } catch (err: any) {
      console.error("Error creating default RT:", err);
      return NextResponse.json({ error: "RT not set up" }, { status: 400 });
    }
  }

  const res = NextResponse.json({ data: user.rt, role: user.role });
  res.cookies.delete("invite_rt_id");
  return res;
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id }
  });

  if (!user || !user.rtId) {
    return NextResponse.json({ error: "RT not set up" }, { status: 400 });
  }

  try {
    const body = await req.json();
    const { name, nomorRT, nomorRW, kelurahan, kecamatan, kabupaten, provinsi, alamat, kontakKetua, pakasirSlug, pakasirApiKey } = body;

    const updatedRT = await prisma.rT.update({
      where: { id: user.rtId },
      data: {
        name,
        nomorRT,
        nomorRW,
        kelurahan,
        kecamatan,
        kabupaten,
        provinsi,
        alamat,
        kontakKetua,
        pakasirSlug: pakasirSlug || null,
        pakasirApiKey: pakasirApiKey || null
      }
    });

    return NextResponse.json({ data: updatedRT });
  } catch (error: any) {
    console.error("Error updating RT profile:", error);
    return NextResponse.json({ error: error.message || "Failed to update profile" }, { status: 500 });
  }
}
