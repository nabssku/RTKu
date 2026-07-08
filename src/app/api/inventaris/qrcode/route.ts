import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import QRCode from "qrcode";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Asset ID is required" }, { status: 400 });
  }

  try {
    // Generate QR Code containing the asset identifier
    const textToEncode = `rtku:asset:${id}`;
    const qrBuffer = await QRCode.toBuffer(textToEncode, {
      type: "png",
      width: 300,
      margin: 2,
      color: {
        dark: "#0f172a", // Navy color matching theme
        light: "#ffffff",
      },
    });

    return new NextResponse(qrBuffer, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error: any) {
    console.error("QR Code generation error:", error);
    return NextResponse.json({ error: "Failed to generate QR Code" }, { status: 500 });
  }
}
