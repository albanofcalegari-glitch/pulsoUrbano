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
  photoUrl: z.string().min(1, "La foto es obligatoria"),
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
