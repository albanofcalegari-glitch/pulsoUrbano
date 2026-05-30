import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email("Email inválido").max(255),
  password: z.string().min(6, "Mínimo 6 caracteres").max(100),
  displayName: z.string().min(2).max(50).optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Contraseña requerida"),
});

export const verifyEmailSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6, "El código debe tener 6 dígitos"),
});

export const createReportSchema = z.object({
  category: z.enum([
    "dumpster", "construction_debris", "construction_materials",
    "roadwork_obstruction", "sidewalk_blocked", "street_obstruction",
    "large_waste", "other",
    "books", "furniture", "reusable_materials", "plants", "free_object", "other_share",
  ]).default("dumpster"),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  status: z.enum([
    "seen", "full", "badly_placed", "abandoned", "in_use", "blocking",
    "available", "taken",
  ]),
  comment: z.string().max(500).optional(),
  photoUrl: z.string().optional(),
  reporterLatitude: z.number().min(-90).max(90).optional(),
  reporterLongitude: z.number().min(-180).max(180).optional(),
  locationAccuracyMeters: z.number().min(0).optional(),
});

export const flagReportSchema = z.object({
  reason: z.string().max(300).optional(),
});

export const createFeedbackSchema = z.object({
  type: z.enum(["bug", "confusion", "suggestion", "performance", "visual", "other"]),
  message: z.string().min(10, "Mínimo 10 caracteres").max(2000, "Máximo 2000 caracteres"),
  email: z.string().email("Email inválido").max(255).optional().or(z.literal("")),
  pageUrl: z.string().max(500).optional(),
});

export const updateFeedbackSchema = z.object({
  status: z.enum(["new", "reviewed", "planned", "resolved", "dismissed"]).optional(),
  adminNotes: z.string().max(2000).optional(),
});

// ─── Capa 3: Servicios ───

const serviceCategories = [
  "pintura", "plomeria", "electricidad", "mudanzas", "limpieza",
  "albanileria", "carpinteria", "jardineria", "cerrajeria", "gasista",
  "aire_acondicionado", "computacion", "clases_particulares",
  "cuidado_personas", "mascotas", "fletes", "otro_servicio",
] as const;

export const createJobRequestSchema = z.object({
  title: z.string().min(5, "Mínimo 5 caracteres").max(120, "Máximo 120 caracteres"),
  description: z.string().min(10, "Mínimo 10 caracteres").max(2000, "Máximo 2000 caracteres"),
  category: z.enum(serviceCategories),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  address: z.string().max(300).optional(),
  budgetMin: z.number().int().min(0).optional(),
  budgetMax: z.number().int().min(0).optional(),
  urgency: z.enum(["low", "normal", "urgent"]).default("normal"),
});

export const createProviderSchema = z.object({
  bio: z.string().max(500).optional(),
  phone: z.string().max(30).optional(),
  skills: z.array(z.enum(serviceCategories)).min(1, "Elegí al menos un servicio").max(10),
  photoUrls: z.array(z.string()).max(5).optional(),
});

export const updateProviderSchema = createProviderSchema.partial();

export const createApplicationSchema = z.object({
  message: z.string().min(5, "Mínimo 5 caracteres").max(1000, "Máximo 1000 caracteres"),
  proposedPrice: z.number().int().min(0).optional(),
  estimatedTime: z.string().max(100).optional(),
});

export const createReviewSchema = z.object({
  rating: z.number().int().min(1, "Mínimo 1 estrella").max(5, "Máximo 5 estrellas"),
  comment: z.string().max(1000).optional(),
});
