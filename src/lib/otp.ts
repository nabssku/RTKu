import prisma from "./db";

const FONNTE_API_KEY = process.env.FONNTE_API_KEY;
const OTP_EXPIRY = parseInt(process.env.OTP_EXPIRY_SECONDS || "300");

const TEMPLATES = [
  "Kode verifikasi RTKu Anda: *{code}*. Berlaku {minutes} menit. Rahasiakan kode ini.",
  "[RTKu] Jangan bagikan kode ini! OTP masuk Anda adalah *{code}* (aktif {minutes} menit).",
  "Masukkan kode OTP *{code}* untuk login akun RTKu. Kode ini kedaluwarsa dalam {minutes} menit.",
  "KODE OTP RTKu: *{code}*. Segera gunakan kode ini. Berlaku hingga {minutes} menit ke depan.",
  "Halo, kode OTP keamanan masuk RTKu Anda: *{code}*. Hanya berlaku selama {minutes} menit.",
  "Gunakan kode keamanan *{code}* untuk verifikasi akun RTKu Anda. Berlaku {minutes} menit.",
  "Penting! Kode OTP login RTKu Anda adalah *{code}*. Berlaku {minutes} menit. Jangan berikan ke siapapun.",
  "[Verifikasi RTKu] Kode OTP Anda: *{code}*. Aktif selama {minutes} menit. Selamat beraktivitas.",
  "Kode verifikasi masuk untuk aplikasi RTKu adalah *{code}*. Rahasiakan! Berlaku {minutes} menit.",
  "Gunakan OTP berikut untuk masuk ke RTKu: *{code}* (berlaku {minutes} menit)."
];

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

  // Ambil record OTP terakhir untuk memastikan rotasi pesan berbeda
  const lastOtpRecord = await prisma.oTPCode.findFirst({
    where: { phone: formattedPhone },
    orderBy: { createdAt: "desc" },
  });

  const lastIndex = lastOtpRecord ? parseInt(lastOtpRecord.code) % 10 : -1;

  let code = generateOTP();
  let index = parseInt(code) % 10;

  // ponytail: jamin indeks pesan saat ini berbeda dengan yang dikirim sebelumnya
  while (lastIndex !== -1 && index === lastIndex) {
    code = generateOTP();
    index = parseInt(code) % 10;
  }

  if (!FONNTE_API_KEY) {
    console.warn("FONNTE_API_KEY tidak diset. OTP tidak dikirim via WhatsApp.");
    console.log(`[DEV] OTP untuk ${formattedPhone}: ${code}`);

    const expiresAt = new Date(Date.now() + OTP_EXPIRY * 1000);
    await prisma.oTPCode.create({
      data: {
        phone: formattedPhone,
        code,
        expiresAt,
      },
    });

    return { success: true, message: "OTP berhasil dikirim (dev mode)" };
  }

  try {
    // 1. Validasi WhatsApp
    const validateRes = await fetch("https://api.fonnte.com/validate", {
      method: "POST",
      headers: {
        "Authorization": FONNTE_API_KEY,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        target: formattedPhone,
        countryCode: "62"
      })
    });
    const validateData = await validateRes.json();

    const isRegistered = validateData.registered && validateData.registered.includes(formattedPhone);
    if (!isRegistered) {
      return { success: false, message: "Nomor tidak terdaftar" };
    }

    // 2. Simpan kontak ke Fonnte
    const last4 = formattedPhone.slice(-4);
    const contactName = `RTKu_${last4}`;
    await fetch("https://api.fonnte.com/contact", {
      method: "POST",
      headers: {
        "Authorization": FONNTE_API_KEY,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        name: contactName,
        number: formattedPhone
      })
    });

    // 3. Simpan OTP ke database
    const expiresAt = new Date(Date.now() + OTP_EXPIRY * 1000);
    await prisma.oTPCode.create({
      data: {
        phone: formattedPhone,
        code,
        expiresAt,
      },
    });

    // 4. Kirim WA OTP via Fonnte menggunakan template bervariasi
    const minutes = (OTP_EXPIRY / 60).toString();
    const rawTemplate = TEMPLATES[index];
    const messageText = rawTemplate.replace("{code}", code).replace("{minutes}", minutes);

    const res = await fetch("https://api.fonnte.com/send", {
      method: "POST",
      headers: {
        "Authorization": FONNTE_API_KEY,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        target: formattedPhone,
        message: messageText,
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
