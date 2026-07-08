const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("=== DIAGNOSTIC DATABASE (SAFE) ===");
  const users = await prisma.user.findMany({
    select: { id: true, role: true, rtId: true }
  });
  console.log("USERS:", users);

  const rts = await prisma.rT.findMany({
    select: { id: true }
  });
  console.log("RTS:", rts);

  const keluarga = await prisma.keluarga.findMany({
    select: { id: true, rtId: true, noKK: true }
  });
  console.log("KELUARGA:", keluarga);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
