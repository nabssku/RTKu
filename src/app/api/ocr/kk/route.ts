import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { extractKKFromImage } from "@/lib/ocr";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { image } = await req.json(); // base64 string
    if (!image) {
      return NextResponse.json({ error: "Image is required" }, { status: 400 });
    }

    // Ekstrak data menggunakan Groq
    const data = await extractKKFromImage(image);
    return NextResponse.json({ data });
  } catch (error: any) {
    console.error("Error in OCR:", error);
    return NextResponse.json({ error: error.message || "Failed to process image" }, { status: 500 });
  }
}