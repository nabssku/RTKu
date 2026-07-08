import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, getOrCreateRtId } from "@/lib/auth";
import prisma from "@/lib/db";
import { getPakasir } from "@/lib/pakasir";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rtId = await getOrCreateRtId((session.user as any).id);

  try {
    const { wargaId, iuranId, periode } = await req.json();

    const warga = await prisma.warga.findUnique({ where: { id: wargaId } });
    const iuran = await prisma.iuran.findUnique({ where: { id: iuranId } });

    if (!warga || !iuran) {
      return NextResponse.json({ error: "Warga or Iuran not found" }, { status: 404 });
    }

    // Initialize Pakasir
    const pakasir = await getPakasir(rtId);

    // Create payment link via Pakasir
    const paymentData = await pakasir.createPaymentLink({
      amount: iuran.nominal,
      customerName: warga.nama,
      customerPhone: warga.telepon || "",
      description: `Pembayaran ${iuran.nama} - Periode ${periode} - ${warga.nama}`,
      redirectUrl: `${process.env.NEXTAUTH_URL}/iuran?success=true`,
    });

    if (!paymentData.success || !paymentData.data) {
      return NextResponse.json({ error: "Failed to create payment link" }, { status: 500 });
    }

    // Save transaction to DB
    const pembayaran = await prisma.pembayaran.create({
      data: {
        wargaId,
        iuranId,
        nominal: iuran.nominal,
        periode,
        statusPembayaran: "PENDING",
        pakasirTxId: paymentData.data.transactionId,
        paymentUrl: paymentData.data.paymentUrl,
        metodePembayaran: "PAKASIR",
      }
    });

    return NextResponse.json({
      data: pembayaran,
      paymentUrl: paymentData.data.paymentUrl
    });

  } catch (error: any) {
    console.error("Error creating payment:", error);
    return NextResponse.json({ error: error.message || "Something went wrong" }, { status: 500 });
  }
}