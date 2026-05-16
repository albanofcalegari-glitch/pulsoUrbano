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
  | "other_share";

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
  | "neighborhood_share";

// ─── Feedback de beta ───

export type FeedbackType = "bug" | "confusion" | "suggestion" | "performance" | "visual" | "other";
export type FeedbackStatus = "new" | "reviewed" | "planned" | "resolved" | "dismissed";

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
