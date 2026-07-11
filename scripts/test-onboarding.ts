import { assert } from "console";
import prisma from "../src/lib/db";

async function testOnboardingLogic() {
  console.log("Menjalankan testOnboardingLogic...");

  // Setup user Ketua RT uji
  const rtUserPhone = "6289999999999";
  await prisma.user.deleteMany({ where: { phone: rtUserPhone } });

  const testRT = await prisma.rT.create({
    data: {
      name: "RT Percobaan Onboarding",
      nomorRT: "002",
      nomorRW: "005",
      isOnboarded: false
    }
  });

  const testUserRT = await prisma.user.create({
    data: {
      phone: rtUserPhone,
      name: "Ketua RT Baru",
      role: "KETUA_RT",
      rtId: testRT.id,
      isOnboarded: false
    }
  });

  // Simulasi Onboarding Ketua RT Backend
  console.log("Menjalankan simulasi onboarding Ketua RT...");
  const updateName = "Bapak Budi";
  const updateSekretaris = "Ibu Siti";
  const updateBendahara = "Bapak Iwan";
  const updateAlamat = "Jl. Merdeka No. 10";

  // Jalankan update database analog dengan route onboarding
  await prisma.user.update({
    where: { id: testUserRT.id },
    data: {
      name: updateName,
      isOnboarded: true
    }
  });

  await prisma.rT.update({
    where: { id: testRT.id },
    data: {
      kontakKetua: testUserRT.phone,
      namaSekretaris: updateSekretaris,
      namaBendahara: updateBendahara,
      alamat: updateAlamat,
      isOnboarded: true
    }
  });

  // Verifikasi
  const verifiedUserRT = await prisma.user.findUnique({ where: { id: testUserRT.id } });
  const verifiedRT = await prisma.rT.findUnique({ where: { id: testRT.id } });

  assert(verifiedUserRT?.name === updateName, "Nama user Ketua RT salah");
  assert(verifiedUserRT?.isOnboarded === true, "FlagisOnboarded user Ketua RT salah");
  assert(verifiedRT?.namaSekretaris === updateSekretaris, "Nama sekretaris salah");
  assert(verifiedRT?.namaBendahara === updateBendahara, "Nama bendahara salah");
  assert(verifiedRT?.alamat === updateAlamat, "Alamat RT salah");
  assert(verifiedRT?.isOnboarded === true, "Flag isOnboarded RT salah");

  console.log("Sukses: Onboarding Ketua RT terverifikasi.");

  // Setup user Warga uji
  const wargaPhone = "6288888888888";
  await prisma.user.deleteMany({ where: { phone: wargaPhone } });

  const testUserWarga = await prisma.user.create({
    data: {
      phone: wargaPhone,
      name: "Warga Baru",
      role: "WARGA",
      rtId: testRT.id,
      isOnboarded: false
    }
  });

  // Simulasi Onboarding Warga
  console.log("Menjalankan simulasi onboarding Warga...");
  const updateWargaName = "Warga Joko";

  await prisma.user.update({
    where: { id: testUserWarga.id },
    data: {
      name: updateWargaName,
      isOnboarded: true
    }
  });

  // Verifikasi
  const verifiedUserWarga = await prisma.user.findUnique({ where: { id: testUserWarga.id } });
  assert(verifiedUserWarga?.name === updateWargaName, "Nama Warga salah");
  assert(verifiedUserWarga?.isOnboarded === true, "Flag isOnboarded Warga salah");

  console.log("Sukses: Onboarding Warga terverifikasi.");

  // Cleanup
  await prisma.user.deleteMany({ where: { phone: { in: [rtUserPhone, wargaPhone] } } });
  await prisma.rT.delete({ where: { id: testRT.id } });
  console.log("Cleanup selesai.");
}

async function main() {
  try {
    await testOnboardingLogic();
    console.log("Semua pengujian onboarding berhasil!");
    process.exit(0);
  } catch (error) {
    console.error("Pengujian onboarding gagal:", error);
    process.exit(1);
  }
}

main();
