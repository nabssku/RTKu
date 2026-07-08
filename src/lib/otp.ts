import prisma from "./db";

const FONNTE_API_KEY = process.env.FONNTE_API_KEY;
const OTP_EXPIRY = parseInt(process.env.OTP_EXPIRY_SECONDS || "300");

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.startsWith("0")) return "62" + cleaned.substring(1);
  if (cleaned.startsWith("+62")) return cleaned.substring(1);
  if (cleaned.startsWith("62")) return cleaned;
  return "62" + cleaned;
}

export async function sendOTP(phone: string): Promise<{ success: boolean; message: string }> {
  const formattedPhone = formatPhone(phone);
  const code = generateOTP();
  const expiresAt = new Date(Date.now() + OTP_EXPIRY * 1000);

  await prisma.oTPCode.create({
    data: {
      phone: formattedPhone,
      code,
      expiresAt,
    },
  });

  if (!FONNTE_API_KEY) {
    console.warn("FONNTE_API_KEY tidak diset. OTP tidak dikirim via WhatsApp.");
    console.log(`[DEV] OTP untuk ${formattedPhone}: ${code}`);
    return { success: true, message: "OTP berhasil dikirim (dev mode)" };
  }

  try {
    const res = await fetch("https://api.fonnte.com/send", {
      method: "POST",
      headers: {
        "Authorization": FONNTE_API_KEY,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        target: formattedPhone,
        message: `Kode OTP RTKu Anda: *${code}*\n\nKode berlaku ${OTP_EXPIRY / 60} menit.\nJangan bagikan kode ini kepada siapapun.`,
        countryCode: "62",
      }),
    });

    const data = await res.json();

    if (data.status === true) {
      return {
        success: true,
        message: "OTP berhasil dikirim via WhatsApp",
      };
    } else {
      console.warn("Fonnte API error:", data.reason || data.message || "Quota limit/expired");
      console.log(`[SIMULATION OTP FALLBACK] Phone: ${formattedPhone} | Code: ${code}`);
      return {
        success: true,
        message: `dev mode: Gagal kirim WA (${data.reason || "limit/error"}). Gunakan kode simulasi: ${code}`,
      };
    }
  } catch (error) {
    console.error("Error sending OTP:", error);
    console.log(`[SIMULATION OTP FALLBACK] Phone: ${formattedPhone} | Code: ${code}`);
    return {
      success: true,
      message: `dev mode: Gangguan jaringan. Gunakan kode simulasi: ${code}`
    };
  }
}

export async function sendWhatsApp(phone: string, message: string): Promise<{ success: boolean; message: string }> {
  const formattedPhone = formatPhone(phone);
  if (!FONNTE_API_KEY) {
    console.warn("FONNTE_API_KEY tidak diset. WA tidak dikirim.");
    console.log(`[DEV WA] Target: ${formattedPhone}\nMessage:\n${message}`);
    return { success: true, message: "WhatsApp terkirim (dev mode)" };
  }

  try {
    const res = await fetch("https://api.fonnte.com/send", {
      method: "POST",
      headers: {
        Authorization: FONNTE_API_KEY,
      },
      body: new URLSearchParams({
        target: formattedPhone,
        message,
        countryCode: "62",
      }),
    });

    const data = await res.json();
    return {
      success: data.status === true,
      message: data.status ? "WhatsApp terkirim" : "Gagal mengirim WhatsApp",
    };
  } catch (error) {
    console.error("Error sending WA:", error);
    return { success: false, message: "Gagal mengirim WhatsApp" };
  }
}

export async function verifyOTP(phone: string, code: string): Promise<{ success: boolean; message: string }> {
  const formattedPhone = formatPhone(phone);

  const otpRecord = await prisma.oTPCode.findFirst({
    where: {
      phone: formattedPhone,
      code,
      used: false,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!otpRecord) {
    return { success: false, message: "Kode OTP tidak valid atau sudah kedaluwarsa" };
  }

  await prisma.oTPCode.update({
    where: { id: otpRecord.id },
    data: { used: true },
  });

  return { success: true, message: "OTP berhasil diverifikasi" };
}
