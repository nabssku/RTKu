import { NextRequest, NextResponse } from "next/server";
import { sendOTP } from "@/lib/otp";

export async function POST(req: NextRequest) {
  try {
    const { phone } = await req.json();
    if (!phone) {
      return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
    }

    const result = await sendOTP(phone);
    if (!result.success) {
      const status = result.message === "Nomor tidak terdaftar" ? 400 : 550;
      return NextResponse.json({ error: result.message }, { status: status === 550 ? 500 : status });
    }

    return NextResponse.json({ success: true, message: result.message });
  } catch (error: any) {
    console.error("Error sending OTP in api:", error);
    return NextResponse.json({ error: error.message || "Failed to send OTP" }, { status: 500 });
  }
}
