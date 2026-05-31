export type ReportCategory =
  | "dumpster"
  | "construction_debris"
  | "construction_materials"
  | "roadwork_obstruction"
  | "sidewalk_blocked"
  | "street_obstruction"
  | "large_waste"
  | "other"
  | "books"
  | "furniture"
  | "reusable_materials"
  | "plants"
  | "free_object"
  | "other_share"
  | "lights_on"
  | "hazard_lights"
  | "alarm_sounding";

export type ReportType = "urban_notice" | "neighborhood_share";

export type ReportStatus =
  | "seen"
  | "full"
  | "badly_placed"
  | "abandoned"
  | "in_use"
  | "blocking"
  | "available"
  | "taken"
  | "removed"
  | "hidden"
  | "under_review"
  | "expired";

export type ModerationStatus = "pending" | "approved" | "spam" | "hidden";

export type LocationValidation =
  | "validated_nearby"
  | "manual_unverified"
  | "denied_permission"
  | "too_far"
  | "unknown";

export type UserRole = "user" | "admin";

export interface User {
  id: string;
  email: string;
  displayName: string | null;
  emailVerified: boolean;
  role: UserRole;
  trustScore: number;
  trustStars: number;
  reportsCount: number;
  isBlocked: boolean;
  createdAt: string;
}

export interface PublicUser {
  id: string;
  displayName: string | null;
  trustStars: number;
  reportsCount: number;
  label: string;
}

export interface Report {
  id: string;
  category: ReportCategory;
  latitude: number;
  longitude: number;
  status: ReportStatus;
  comment: string | null;
  photoUrl: string;
  locationValidation: LocationValidation;
  confidenceScore: number;
  confirmationCount: number;
  removalCount: number;
  flagCount: number;
  moderationStatus: ModerationStatus;
  createdAt: string;
  expiresAt: string;
  lastConfirmedAt: string | null;
  user: PublicUser;
}

export interface CreateReportPayload {
  category?: ReportCategory;
  latitude: number;
  longitude: number;
  status: ReportStatus;
  comment?: string;
  photoUrl: string;
  reporterLatitude?: number;
  reporterLongitude?: number;
  locationAccuracyMeters?: number;
}

export interface ReportFilters {
  category?: ReportCategory;
  status?: ReportStatus;
  bounds?: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
}

export type ConfidenceLevel = "baja" | "media" | "alta" | "muy_alta";

export type CategoryGroup =
  | "all"
  | "dumpsters"
  | "construction"
  | "obstructions"
  | "waste"
  | "neighborhood_share"
  | "vehicle_alerts"
  | "services_seek"
  | "services_offer";

// ─── Feedback de beta ───

export type FeedbackType = "bug" | "confusion" | "suggestion" | "performance" | "visual" | "other";
export type FeedbackStatus = "new" | "reviewed" | "planned" | "resolved" | "dismissed";

// ─── Capa 3: Marketplace de Servicios ───

export type ServiceCategory =
  | "pintura"
  | "plomeria"
  | "electricidad"
  | "mudanzas"
  | "limpieza"
  | "albanileria"
  | "carpinteria"
  | "jardineria"
  | "cerrajeria"
  | "gasista"
  | "aire_acondicionado"
  | "computacion"
  | "clases_particulares"
  | "cuidado_personas"
  | "mascotas"
  | "fletes"
  | "otro_servicio";

export type JobUrgency = "low" | "normal" | "urgent";
export type JobStatus = "open" | "in_progress" | "completed" | "cancelled";
export type ApplicationStatus = "pending" | "accepted" | "rejected" | "withdrawn";

export interface ServiceProvider {
  id: string;
  userId: string;
  bio: string | null;
  phone: string | null;
  skills: ServiceCategory[];
  photoUrls: string[];
  averageRating: number;
  totalJobs: number;
  totalReviews: number;
  isVerified: boolean;
  isActive: boolean;
  moderationStatus: string;
  createdAt: string;
  user: PublicUser;
}

export interface JobRequest {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: ServiceCategory;
  latitude: number;
  longitude: number;
  address: string | null;
  budgetMin: number | null;
  budgetMax: number | null;
  urgency: JobUrgency;
  status: JobStatus;
  applicationsCount: number;
  selectedProviderId: string | null;
  createdAt: string;
  expiresAt: string;
  user: PublicUser;
}

export interface JobApplication {
  id: string;
  jobRequestId: string;
  providerId: string;
  userId: string;
  message: string;
  proposedPrice: number | null;
  estimatedTime: string | null;
  status: ApplicationStatus;
  createdAt: string;
  provider: ServiceProvider;
}

export interface JobReview {
  id: string;
  jobRequestId: string;
  authorId: string;
  targetId: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  author: PublicUser;
}

export interface CreateJobPayload {
  title: string;
  description: string;
  category: ServiceCategory;
  latitude: number;
  longitude: number;
  address?: string;
  budgetMin?: number;
  budgetMax?: number;
  urgency?: JobUrgency;
}

export interface AppFeedback {
  id: string;
  userId: string | null;
  email: string | null;
  type: FeedbackType;
  message: string;
  pageUrl: string | null;
  userAgent: string | null;
  status: FeedbackStatus;
  adminNotes: string | null;
  createdAt: string;
  resolvedAt: string | null;
  user: { displayName: string | null; trustStars: number } | null;
}
