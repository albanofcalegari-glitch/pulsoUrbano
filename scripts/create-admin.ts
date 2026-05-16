import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.error("Uso: ADMIN_EMAIL=tu@email.com ADMIN_PASSWORD=contraseña tsx scripts/create-admin.ts");
    process.exit(1);
  }

  if (password.length < 8) {
    console.error("La contraseña debe tener al menos 8 caracteres.");
    process.exit(1);
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    if (existing.role === "admin") {
      console.log(`El usuario ${email} ya es admin.`);
      return;
    }
    await prisma.user.update({
      where: { email },
      data: { role: "admin", emailVerified: true },
    });
    console.log(`Usuario ${email} promovido a admin.`);
    return;
  }

  await prisma.user.create({
    data: {
      email,
      passwordHash: await bcrypt.hash(password, 10),
      displayName: "Admin",
      emailVerified: true,
      role: "admin",
      trustScore: 100,
      trustStars: 5,
    },
  });

  console.log(`Admin creado: ${email}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
