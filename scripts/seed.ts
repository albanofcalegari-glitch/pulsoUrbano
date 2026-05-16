import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@pulsourbano.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "admin1234";
  const demoEmail = process.env.DEMO_EMAIL || "demo@pulsourbano.com";
  const demoPassword = process.env.DEMO_PASSWORD || "demo1234";

  const isProduction = process.env.NODE_ENV === "production";

  if (isProduction && adminPassword === "admin1234") {
    console.error("ERROR: No uses la contraseña por defecto en producción.");
    console.error("Configurá ADMIN_EMAIL y ADMIN_PASSWORD en las variables de entorno.");
    process.exit(1);
  }

  console.log("Limpiando datos...");
  await prisma.reportFlag.deleteMany();
  await prisma.reportRemoval.deleteMany();
  await prisma.reportConfirmation.deleteMany();
  await prisma.report.deleteMany();
  await prisma.user.deleteMany();

  console.log("Creando admin...");
  const admin = await prisma.user.create({
    data: {
      email: adminEmail,
      passwordHash: await bcrypt.hash(adminPassword, 10),
      displayName: "Admin",
      emailVerified: true,
      role: "admin",
      trustScore: 100,
      trustStars: 5,
    },
  });

  console.log("Creando vecino demo...");
  const user = await prisma.user.create({
    data: {
      email: demoEmail,
      passwordHash: await bcrypt.hash(demoPassword, 10),
      displayName: "Vecino Demo",
      emailVerified: true,
      role: "user",
      trustScore: 50,
      trustStars: 3,
    },
  });

  console.log("Insertando avisos de prueba...");
  const reports = [
    // Volquetes (categoría principal)
    { cat: "dumpster", lat: -34.6037, lng: -58.3816, status: "seen", comment: "Volquete nuevo en esquina Corrientes y Florida", loc: "validated_nearby" },
    { cat: "dumpster", lat: -34.6080, lng: -58.3700, status: "full", comment: "Volquete lleno, desbordando en la vereda", loc: "validated_nearby" },
    { cat: "dumpster", lat: -34.5990, lng: -58.3850, status: "badly_placed", comment: "Bloquea rampa de discapacitados", loc: "too_far" },
    { cat: "dumpster", lat: -34.6120, lng: -58.3780, status: "abandoned", comment: "Lleva más de una semana sin que lo retiren", loc: "manual_unverified" },
    { cat: "dumpster", lat: -34.6055, lng: -58.3900, status: "in_use", comment: "Están cargando escombros de una obra", loc: "validated_nearby" },
    { cat: "dumpster", lat: -34.6150, lng: -58.3650, status: "seen", comment: "Volquete recién colocado", loc: "validated_nearby" },
    // Avisos urbanos
    { cat: "construction_debris", lat: -34.5970, lng: -58.3750, status: "seen", comment: "Escombros de demolición sobre la vereda", loc: "denied_permission" },
    { cat: "roadwork_obstruction", lat: -34.6100, lng: -58.3950, status: "blocking", comment: "Obra de gas ocupa media calle, sin señalización", loc: "validated_nearby" },
    { cat: "sidewalk_blocked", lat: -34.6020, lng: -58.3880, status: "seen", comment: "Andamio de obra ocupa toda la vereda", loc: "manual_unverified" },
    { cat: "large_waste", lat: -34.6070, lng: -58.3830, status: "abandoned", comment: "Colchón y muebles tirados en la esquina", loc: "validated_nearby" },
    // Compartido por vecinos
    { cat: "books", lat: -34.6045, lng: -58.3790, status: "available", comment: "Dejé una caja con novelas y libros infantiles en la puerta", loc: "validated_nearby" },
    { cat: "furniture", lat: -34.6010, lng: -58.3860, status: "available", comment: "Mesa de madera en buen estado, se puede retirar", loc: "validated_nearby" },
    { cat: "reusable_materials", lat: -34.6090, lng: -58.3720, status: "available", comment: "Ladrillos y cerámicos sobrantes de una reforma", loc: "manual_unverified" },
  ];

  for (const r of reports) {
    await prisma.report.create({
      data: {
        userId: user.id,
        category: r.cat,
        latitude: r.lat,
        longitude: r.lng,
        status: r.status,
        comment: r.comment,
        photoUrl: "/api/uploads/placeholder.jpg",
        locationValidation: r.loc,
        confidenceScore: r.loc === "validated_nearby" ? 65 : 30,
        expiresAt: new Date(Date.now() + 72 * 60 * 60 * 1000),
      },
    });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { reportsCount: reports.length },
  });

  const urbanCount = reports.filter(r => !["books", "furniture", "reusable_materials", "plants", "free_object", "other_share"].includes(r.cat)).length;
  const shareCount = reports.length - urbanCount;
  console.log(`Admin: ${adminEmail}`);
  console.log(`Demo:  ${demoEmail}`);
  console.log(`${reports.length} avisos creados (${urbanCount} urbanos + ${shareCount} compartidos).`);
  void admin;
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
