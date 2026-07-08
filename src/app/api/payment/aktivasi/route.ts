import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { getPakasir } from "@/lib/pakasir";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id }, include: { rt: true } });
  if (!user || !user.rtId || !user.rt) {
    return NextResponse.json({ error: "Akun Anda belum terhubung ke sebuah RT." }, { status: 400 });
  }

  if (user.rt.isActive && user.rt.activationCode) {
    return NextResponse.json({ error: "RT ini sudah aktif secara penuh." }, { status: 400 });
  }

  try {
    const pakasir = await getPakasir();
    const amount = 15000;

    // Create payment link
    const paymentData = await pakasir.createPaymentLink({
      amount: amount,
      customerName: user.name || "Pengurus RT",
      customerPhone: user.phone || "",
      description: `Aktivasi Penuh RTKu PWA - ${user.rt.name}`,
      redirectUrl: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/pengaturan?payment_success=true`,
    });

    if (!paymentData.success || !paymentData.data) {
      return NextResponse.json({ error: "Gagal membuat link pembayaran dari Pakasir API" }, { status: 500 });
    }

    // Save transaction to DB specifically for RT activation
    const pembayaran = await prisma.payment.create({
      data: {
        rtId: user.rt.id,
        amount: amount,
        description: `Aktivasi RTKu: ${user.rt.name}`,
        status: "PENDING",
        pakasirTxId: paymentData.data.transactionId,
        paymentUrl: paymentData.data.paymentUrl,
      }
    });

    return NextResponse.json({
      data: pembayaran,
      paymentUrl: paymentData.data.paymentUrl
    });

  } catch (error: any) {
    console.error("Error creating activation payment:", error);
    return NextResponse.json({ error: error.message || "Something went wrong" }, { status: 500 });
  }
}