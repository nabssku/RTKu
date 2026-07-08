import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("X-Pakasir-Signature");
    const webhookSecret = process.env.PAKASIR_WEBHOOK_SECRET;

    // // Verifikasi signature webhook (dibuka saat production dengan webhook secret yg benar)
    // if (webhookSecret && signature) {
    //   const hash = crypto.createHmac("sha256", webhookSecret).update(rawBody).digest("hex");
    //   if (hash !== signature) {
    //     return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    //   }
    // }

    const body = JSON.parse(rawBody);
    const { order_id, status } = body;

    if (!order_id || !status) {
      return NextResponse.json({ error: "Invalid payload format" }, { status: 400 });
    }

    const isPaid = status === "completed" || status === "paid";

    // Cari pembayaran berdasarkan pakasirTxId
    // Bisa iuran bulanan warga, BISA JUGA pembayaran aktivasi Rp 15.000 RT
    const pembayaranIuran = await prisma.pembayaran.findFirst({
      where: { pakasirTxId: order_id },
    });

    if (pembayaranIuran) {
      // Ini pembayaran iuran
      const updateStatus = isPaid ? "PAID" : status === "expired" ? "EXPIRED" : "FAILED";
      await prisma.pembayaran.update({
        where: { id: pembayaranIuran.id },
        data: {
          statusPembayaran: updateStatus,
          paidAt: isPaid ? new Date() : null,
        }
      });
      return NextResponse.json({ success: true, message: "Iuran updated" });
    }

    // Cek apakah ini pembayaran aktivasi RT (Rp15.000)
    const paymentAktivasi = await prisma.payment.findFirst({
      where: { pakasirTxId: order_id },
    });

    if (paymentAktivasi) {
      const updateStatus = isPaid ? "PAID" : status === "expired" ? "EXPIRED" : "FAILED";
      await prisma.payment.update({
        where: { id: paymentAktivasi.id },
        data: {
          status: updateStatus,
          paidAt: isPaid ? new Date() : null,
        }
      });

      // Jika lunas, aktifkan RT!
      if (isPaid) {
        await prisma.rT.update({
          where: { id: paymentAktivasi.rtId },
          data: {
            activationCode: `ACT-${order_id}`,
            isActive: true,
            trialEnd: null, // Unlimited non-trial
          }
        });
      }

      return NextResponse.json({ success: true, message: "Aktivasi RT updated" });
    }

    return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
  } catch (error: any) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}