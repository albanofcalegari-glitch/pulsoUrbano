import type { ReportStatus, ReportCategory, ReportType, LocationValidation, ConfidenceLevel, CategoryGroup, ServiceCategory, JobUrgency, JobStatus } from "@/types";

export function isServicesMode(group: CategoryGroup): boolean {
  return group === "services_seek" || group === "services_offer";
}

// ─── Categorías ───

export const REPORT_CATEGORY_LABELS: Record<ReportCategory, string> = {
  dumpster: "Volquete",
  construction_debris: "Escombros",
  construction_materials: "Materiales de obra",
  roadwork_obstruction: "Obra en vía pública",
  sidewalk_blocked: "Vereda bloqueada",
  street_obstruction: "Obstáculo en la calle",
  large_waste: "Residuo voluminoso",
  other: "Otro aviso urbano",
  books: "Libros disponibles",
  furniture: "Mueble disponible",
  reusable_materials: "Materiales reutilizables",
  plants: "Plantas o macetas",
  free_object: "Objeto gratuito",
  other_share: "Otro aviso vecinal",
};

export const REPORT_CATEGORY_COLORS: Record<ReportCategory, string> = {
  dumpster: "#3B82F6",
  construction_debris: "#F97316",
  construction_materials: "#D97706",
  roadwork_obstruction: "#EF4444",
  sidewalk_blocked: "#8B5CF6",
  street_obstruction: "#DC2626",
  large_waste: "#78716C",
  other: "#6B7280",
  books: "#10B981",
  furniture: "#06B6D4",
  reusable_materials: "#84CC16",
  plants: "#22C55E",
  free_object: "#14B8A6",
  other_share: "#64748B",
};

export const ALL_CATEGORIES: ReportCategory[] = [
  "dumpster",
  "construction_debris",
  "construction_materials",
  "roadwork_obstruction",
  "sidewalk_blocked",
  "street_obstruction",
  "large_waste",
  "other",
  "books",
  "furniture",
  "reusable_materials",
  "plants",
  "free_object",
  "other_share",
];

// ─── Tipos de aviso ───

export const REPORT_TYPE_LABELS: Record<ReportType, string> = {
  urban_notice: "Aviso urbano",
  neighborhood_share: "Compartido por vecinos",
};

export const URBAN_NOTICE_CATEGORIES: ReportCategory[] = [
  "dumpster", "construction_debris", "construction_materials",
  "roadwork_obstruction", "sidewalk_blocked", "street_obstruction",
  "large_waste", "other",
];

export const NEIGHBORHOOD_SHARE_CATEGORIES: ReportCategory[] = [
  "books", "furniture", "reusable_materials", "plants", "free_object", "other_share",
];

export function getReportType(category: ReportCategory): ReportType {
  return NEIGHBORHOOD_SHARE_CATEGORIES.includes(category)
    ? "neighborhood_share"
    : "urban_notice";
}

// ─── Grupos de filtro ───

export const CATEGORY_GROUP_LABELS: Record<CategoryGroup, string> = {
  all: "Todo",
  dumpsters: "Volquetes",
  construction: "Obras / Escombros",
  obstructions: "Obstáculos",
  waste: "Residuos",
  neighborhood_share: "Compartido",
  services_seek: "Busco servicio",
  services_offer: "Ofrezco servicio",
};

export const CATEGORY_GROUP_DESCRIPTIONS: Record<CategoryGroup, string> = {
  all: "Todos los avisos del barrio.",
  dumpsters: "Volquetes de obra estacionados en la vía pública.",
  construction: "Escombros, materiales de obra y obras que afectan la vía pública.",
  obstructions: "Veredas bloqueadas y obstáculos en la calle.",
  waste: "Residuos voluminosos dejados en la vía pública.",
  neighborhood_share: "Cosas útiles dejadas por vecinos: libros, muebles, plantas, objetos gratuitos.",
  services_seek: "Vecinos que buscan un profesional para un trabajo.",
  services_offer: "Profesionales que ofrecen sus servicios en la zona.",
};

export const CATEGORY_GROUP_MEMBERS: Record<CategoryGroup, ReportCategory[] | null> = {
  all: null,
  dumpsters: ["dumpster"],
  construction: ["construction_debris", "construction_materials", "roadwork_obstruction"],
  obstructions: ["sidewalk_blocked", "street_obstruction"],
  waste: ["large_waste"],
  neighborhood_share: ["books", "furniture", "reusable_materials", "plants", "free_object", "other_share"],
  services_seek: null,
  services_offer: null,
};

// ─── Estados ───

export const REPORT_STATUS_LABELS: Record<ReportStatus, string> = {
  seen: "Visto",
  full: "Lleno",
  badly_placed: "Mal ubicado",
  abandoned: "Abandonado",
  in_use: "En uso",
  blocking: "Bloqueando",
  available: "Disponible",
  taken: "Retirado",
  removed: "Ya no está",
  hidden: "Oculto",
  under_review: "En revisión",
  expired: "Vencido",
};

export const REPORT_STATUS_COLORS: Record<ReportStatus, string> = {
  seen: "#3B82F6",
  full: "#EF4444",
  badly_placed: "#F59E0B",
  abandoned: "#6B7280",
  in_use: "#10B981",
  blocking: "#DC2626",
  available: "#22C55E",
  taken: "#9CA3AF",
  removed: "#9CA3AF",
  hidden: "#9CA3AF",
  under_review: "#8B5CF6",
  expired: "#9CA3AF",
};

export const CATEGORY_STATUSES: Record<ReportCategory, ReportStatus[]> = {
  dumpster: ["seen", "full", "badly_placed", "abandoned", "in_use"],
  construction_debris: ["seen", "badly_placed", "blocking", "abandoned"],
  construction_materials: ["seen", "badly_placed", "blocking"],
  roadwork_obstruction: ["seen", "blocking", "in_use"],
  sidewalk_blocked: ["seen", "blocking"],
  street_obstruction: ["seen", "blocking", "badly_placed"],
  large_waste: ["seen", "abandoned"],
  other: ["seen", "badly_placed"],
  books: ["available", "seen"],
  furniture: ["available", "seen"],
  reusable_materials: ["available", "seen"],
  plants: ["available", "seen"],
  free_object: ["available", "seen"],
  other_share: ["available", "seen"],
};

export const ACTIVE_STATUSES: ReportStatus[] = [
  "seen", "full", "badly_placed", "abandoned", "in_use", "blocking",
  "available", "under_review",
];

// ─── Ubicación ───

export const LOCATION_VALIDATION_LABELS: Record<LocationValidation, string> = {
  validated_nearby: "Ubicación validada",
  manual_unverified: "Ubicación manual",
  denied_permission: "Ubicación no verificada",
  too_far: "Ubicación lejana",
  unknown: "Sin verificar",
};

export const LOCATION_VALIDATION_COLORS: Record<LocationValidation, string> = {
  validated_nearby: "#10B981",
  manual_unverified: "#F59E0B",
  denied_permission: "#6B7280",
  too_far: "#EF4444",
  unknown: "#6B7280",
};

// ─── Confianza ───

export const CONFIDENCE_LEVELS: { max: number; level: ConfidenceLevel; label: string; color: string }[] = [
  { max: 25, level: "baja", label: "Confianza baja", color: "#EF4444" },
  { max: 50, level: "media", label: "Confianza media", color: "#F59E0B" },
  { max: 75, level: "alta", label: "Confianza alta", color: "#10B981" },
  { max: 100, level: "muy_alta", label: "Confianza muy alta", color: "#059669" },
];

export const TRUST_STAR_LABELS: Record<number, string> = {
  1: "Nuevo",
  2: "Activo",
  3: "Confiable",
  4: "Muy confiable",
  5: "Excelente",
};

// ─── Mapa ───

export const DEFAULT_CENTER = {
  lat: Number(process.env.NEXT_PUBLIC_DEFAULT_LAT) || -34.6037,
  lng: Number(process.env.NEXT_PUBLIC_DEFAULT_LNG) || -58.3816,
};

export const DEFAULT_ZOOM = Number(process.env.NEXT_PUBLIC_DEFAULT_ZOOM) || 13;

// ─── Reglas de negocio ───

export const EXPIRATION_HOURS = 72;
export const CONFIRMATION_EXTENSION_HOURS = 24;
export const REMOVALS_THRESHOLD = 3;
export const FLAGS_THRESHOLD = 3;
export const LOCATION_VALIDATION_RADIUS_METERS = 150;
export const MAX_PHOTO_SIZE_BYTES = 5 * 1024 * 1024;
export const ALLOWED_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];

// Anti-abuso
export const MAX_REPORTS_PER_DAY_NEW_USER = 3;
export const MAX_REPORTS_PER_DAY_TRUSTED = 15;
export const MAX_ACTIONS_PER_DAY_NEW_USER = 10;
export const MAX_ACTIONS_PER_DAY_TRUSTED = 50;
export const NEW_USER_TRUST_THRESHOLD = 2;
export const AUTO_BLOCK_FLAGS_THRESHOLD = 10;

// ─── Capa 3: Servicios ───

export const SERVICE_CATEGORIES: ServiceCategory[] = [
  "pintura", "plomeria", "electricidad", "mudanzas", "limpieza",
  "albanileria", "carpinteria", "jardineria", "cerrajeria", "gasista",
  "aire_acondicionado", "computacion", "clases_particulares",
  "cuidado_personas", "mascotas", "fletes", "otro_servicio",
];

export const SERVICE_CATEGORY_LABELS: Record<ServiceCategory, string> = {
  pintura: "Pintura",
  plomeria: "Plomería",
  electricidad: "Electricidad",
  mudanzas: "Mudanzas",
  limpieza: "Limpieza",
  albanileria: "Albañilería",
  carpinteria: "Carpintería",
  jardineria: "Jardinería",
  cerrajeria: "Cerrajería",
  gasista: "Gasista",
  aire_acondicionado: "Aire acondicionado",
  computacion: "Computación / IT",
  clases_particulares: "Clases particulares",
  cuidado_personas: "Cuidado de personas",
  mascotas: "Mascotas",
  fletes: "Fletes",
  otro_servicio: "Otro servicio",
};

export const SERVICE_CATEGORY_COLORS: Record<ServiceCategory, string> = {
  pintura: "#F59E0B",
  plomeria: "#3B82F6",
  electricidad: "#EAB308",
  mudanzas: "#8B5CF6",
  limpieza: "#06B6D4",
  albanileria: "#D97706",
  carpinteria: "#92400E",
  jardineria: "#22C55E",
  cerrajeria: "#6B7280",
  gasista: "#EF4444",
  aire_acondicionado: "#0EA5E9",
  computacion: "#7C3AED",
  clases_particulares: "#EC4899",
  cuidado_personas: "#F472B6",
  mascotas: "#A3E635",
  fletes: "#64748B",
  otro_servicio: "#9CA3AF",
};

export const JOB_URGENCY_LABELS: Record<JobUrgency, string> = {
  low: "Sin apuro",
  normal: "Normal",
  urgent: "Urgente",
};

export const JOB_STATUS_LABELS: Record<JobStatus, string> = {
  open: "Abierto",
  in_progress: "En curso",
  completed: "Completado",
  cancelled: "Cancelado",
};

export const JOB_EXPIRATION_DAYS = 30;
export const MAX_APPLICATIONS_PER_JOB = 20;
export const MAX_JOBS_PER_DAY_NEW = 2;
export const MAX_JOBS_PER_DAY_TRUSTED = 5;
export const MAX_PORTFOLIO_PHOTOS = 5;

// ─── Identidad ───

export const APP_NAME = "Pulso Urbano";
export const APP_TAGLINE = "Lo que pasa en tu barrio, visto por vecinos.";
