import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, getOrCreateRtId } from "@/lib/auth";
import prisma from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";

  const rtId = await getOrCreateRtId((session.user as any).id);

  const dbUser = await prisma.user.findUnique({ where: { id: session.user.id } });
  const userRole = dbUser?.role || (session.user as any).role;
  const userPhone = dbUser?.phone || (session.user as any).phone;

  let whereQuery: any = { rtId };

  if (userRole === "WARGA") {
    if (userPhone) {
      whereQuery = {
        rtId,
        anggota: {
          some: {
            telepon: userPhone
          }
        }
      };
    } else {
      whereQuery = { id: "none" };
    }
  } else if (search) {
    whereQuery = {
      rtId,
      OR: [
        { noKK: { contains: search, mode: "insensitive" } },
        { alamat: { contains: search, mode: "insensitive" } },
        {
          anggota: {
            some: {
              nama: { contains: search, mode: "insensitive" }
            }
          }
        }
      ]
    };
  }

  try {
    const keluarga = await prisma.keluarga.findMany({
      where: whereQuery,
      include: {
        anggota: true
      }
    });

    return NextResponse.json({ data: keluarga });
  } catch (error) {
    console.error("Error get warga:", error);
    return NextResponse.json({ error: "Failed to fetch warga" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rtId = await getOrCreateRtId((session.user as any).id);
  const userRole = (session.user as any).role;
  const userPhone = (session.user as any).phone;

  try {
    const body = await req.json();
    const { noKK, alamat, rt, rw, kelurahan, kecamatan, kabupaten, provinsi, kodePos, anggota } = body;

    if (!noKK) {
      return NextResponse.json({ error: "noKK is required" }, { status: 400 });
    }

    const keluarga = await prisma.keluarga.create({
      data: {
        noKK,
        alamat,
        rt,
        rw,
        kelurahan,
        kecamatan,
        kabupaten,
        provinsi,
        kodePos,
        rtId,
        anggota: {
          create: (anggota || []).map((a: any) => ({
            nik: a.nik || `TEMP-${Math.random().toString(36).substr(2, 9)}`,
            nama: a.nama,
            tempatLahir: a.tempatLahir || "",
            tanggalLahir: a.tanggalLahir ? new Date(a.tanggalLahir) : null,
            jenisKelamin: a.jenisKelamin === "LAKI_LAKI" || a.jenisKelamin === "PEREMPUAN" ? a.jenisKelamin : null,
            agama: ["ISLAM", "KRISTEN", "KATOLIK", "HINDU", "BUDDHA", "KONGHUCU", "LAINNYA"].includes(a.agama) ? a.agama : "LAINNYA",
            statusKawin: ["BELUM_KAWIN", "KAWIN", "CERAI_HIDUP", "CERAI_MATI"].includes(a.statusKawin) ? a.statusKawin : "BELUM_KAWIN",
            pekerjaan: a.pekerjaan || "",
            pendidikan: a.pendidikan || "",
            hubungan: ["KEPALA_KELUARGA", "ISTRI", "ANAK", "MENANTU", "CUCU", "ORANG_TUA", "MERTUA", "FAMILI_LAIN", "LAINNYA"].includes(a.hubungan) ? a.hubungan : "LAINNYA",
            statusWarga: "TETAP",
            telepon: a.telepon || (userRole === "WARGA" && a.hubungan === "KEPALA_KELUARGA" ? userPhone : null),
          }))
        }
      },
      include: {
        anggota: true
      }
    });

    const kepalaKeluarga = (anggota || []).find((a: any) => a.hubungan === "KEPALA_KELUARGA");
    if (kepalaKeluarga && userRole === "WARGA") {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { name: kepalaKeluarga.nama }
      });
    }

    return NextResponse.json({ data: keluarga });
  } catch (error: any) {
    console.error("Error creating keluarga:", error);
    return NextResponse.json({ error: error.message || "Failed to create keluarga" }, { status: 500 });
  }
}