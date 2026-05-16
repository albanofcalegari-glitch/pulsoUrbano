import type { LocationValidation } from "@/types";
import { LOCATION_VALIDATION_RADIUS_METERS } from "./constants";

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

export function haversineDistance(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number {
  const R = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

interface LocationInput {
  reportLat: number;
  reportLng: number;
  reporterLat?: number;
  reporterLng?: number;
}

interface LocationResult {
  status: LocationValidation;
  distanceMeters: number | null;
}

export function validateLocation(input: LocationInput): LocationResult {
  if (input.reporterLat == null || input.reporterLng == null) {
    return { status: "denied_permission", distanceMeters: null };
  }

  const distance = haversineDistance(
    input.reportLat, input.reportLng,
    input.reporterLat, input.reporterLng
  );

  if (distance <= LOCATION_VALIDATION_RADIUS_METERS) {
    return { status: "validated_nearby", distanceMeters: Math.round(distance) };
  }

  return { status: "too_far", distanceMeters: Math.round(distance) };
}
