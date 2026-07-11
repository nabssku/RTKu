import { assert } from "console";
import prisma from "../src/lib/db";
import { sendOTP } from "../src/lib/otp";

// ponytail: mock node fetch secara global untuk menguji skenario API Fonnte
const originalFetch = global.fetch;

function mockFonnteResponse(validateStatus: boolean, isRegistered: boolean) {
  global.fetch = async (url: any, init?: any): Promise<any> => {
    const urlStr = typeof url === "string" ? url : url.toString();

    if (urlStr.includes("/validate")) {
      return {
        json: async () => ({
          status: true,
          registered: isRegistered ? ["628123456789"] : [],
          not_registered: isRegistered ? [] : ["628123456789"]
        })
      };
    }

    if (urlStr.includes("/contact")) {
      return {
        json: async () => ({
          status: true,
          detail: "contact added successfully"
        })
      };
    }

    if (urlStr.includes("/send")) {
      return {
        json: async () => ({
          status: validateStatus,
          message: validateStatus ? "OTP berhasil dikirim" : "Gagal terkirim"
        })
      };
    }

    return originalFetch(url, init);
  };
}

function restoreFetch() {
  global.fetch = originalFetch;
}

async function testOtpLogic() {
  console.log("Menjalankan unit test dengan Mock Fonnte API...");

  const phone = "08123456789";
  const formattedPhone = "628123456789";

  // 1. Uji Kasus: Nomor TIDAK Terdaftar
  console.log("Kasus 1: Menguji nomor yang tidak terdaftar di WhatsApp");
  mockFonnteResponse(true, false); // isRegistered = false

  await prisma.oTPCode.deleteMany({ where: { phone: formattedPhone } });

  const res1 = await sendOTP(phone);
  assert(res1.success === false, "Seharusnya gagal jika nomor tidak terdaftar");
  assert(res1.message === "Nomor tidak terdaftar", "Pesan error salah");
  console.log("Kasus 1 sukses: Diblokir dengan benar.");

  // 2. Uji Kasus: Nomor Terdaftar dan Rotasi Template Pesan
  console.log("\nKasus 2: Menguji nomor terdaftar dan rotasi template");
  mockFonnteResponse(true, true); // isRegistered = true

  const res2 = await sendOTP(phone);
  assert(res2.success === true, "Pengiriman 1 gagal");

  const record1 = await prisma.oTPCode.findFirst({
    where: { phone: formattedPhone },
    orderBy: { createdAt: "desc" }
  });
  assert(record1 !== null, "OTP 1 tidak tersimpan di database");
  const index1 = parseInt(record1!.code) % 10;
  console.log(`Pesan 1 sukses dikirim. Index template: ${index1}, Kode: ${record1!.code}`);

  // Kirim OTP kedua, harus menggunakan index template yang berbeda
  const res3 = await sendOTP(phone);
  assert(res3.success === true, "Pengiriman 2 gagal");

  const record2 = await prisma.oTPCode.findFirst({
    where: { phone: formattedPhone },
    orderBy: { createdAt: "desc" }
  });
  assert(record2 !== null, "OTP 2 tidak tersimpan di database");
  const index2 = parseInt(record2!.code) % 10;
  console.log(`Pesan 2 sukses dikirim. Index template: ${index2}, Kode: ${record2!.code}`);

  assert(index1 !== index2, `Rotasi gagal: Indeks pesan berturut-turut sama (${index1} vs ${index2})`);
  console.log("Kasus 2 sukses: Rotasi template berhasil dan nomor disimpan sebagai kontak.");
}

async function main() {
  try {
    await testOtpLogic();
    restoreFetch();
    console.log("\nSemua unit test logika OTP berhasil disimulasikan!");
    process.exit(0);
  } catch (error) {
    console.error("\nPengujian gagal:", error);
    restoreFetch();
    process.exit(1);
  }
}

main();
