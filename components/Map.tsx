"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { useEffect } from "react";
import type { Report, ReportCategory, ReportStatus } from "@/types";
import {
  REPORT_CATEGORY_COLORS,
  REPORT_CATEGORY_LABELS,
  REPORT_STATUS_LABELS,
  REPORT_STATUS_COLORS,
} from "@/lib/constants";
import { timeAgo } from "@/lib/utils";
import "leaflet/dist/leaflet.css";

function createIcon(category: ReportCategory): L.DivIcon {
  const color = REPORT_CATEGORY_COLORS[category];
  return L.divIcon({
    className: "",
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28],
    html: `<svg viewBox="0 0 24 36" width="28" height="36" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24s12-15 12-24C24 5.4 18.6 0 12 0z" fill="${color}"/>
      <circle cx="12" cy="12" r="6" fill="white"/>
    </svg>`,
  });
}

function FlyToLocation({ lat, lng, trigger }: { lat: number; lng: number; trigger?: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lng], map.getZoom(), { duration: 1 });
  }, [map, lat, lng, trigger]);
  useEffect(() => {
    const handler = () => map.invalidateSize();
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, [map]);
  return null;
}

function MapClickHandler({ onMapClick }: { onMapClick?: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onMapClick?.(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

interface MapProps {
  center: { lat: number; lng: number };
  zoom: number;
  reports: Report[];
  onReportClick?: (report: Report) => void;
  onMapClick?: (lat: number, lng: number) => void;
  selectedPosition?: { lat: number; lng: number } | null;
  userLocation?: { lat: number; lng: number } | null;
  flyTrigger?: number;
}

const userLocationIcon = L.divIcon({
  className: "",
  iconSize: [18, 18],
  iconAnchor: [9, 9],
  html: `<div style="width:18px;height:18px;border-radius:50%;background:#3B82F6;border:3px solid white;box-shadow:0 0 0 2px rgba(59,130,246,0.3),0 2px 6px rgba(0,0,0,0.3)"></div>`,
});

export default function Map({
  center,
  zoom,
  reports,
  onReportClick,
  onMapClick,
  selectedPosition,
  userLocation,
  flyTrigger,
}: MapProps) {
  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={zoom}
      className="h-full w-full z-0"
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FlyToLocation lat={center.lat} lng={center.lng} trigger={flyTrigger} />
      {onMapClick && <MapClickHandler onMapClick={onMapClick} />}

      {reports.map((report) => (
        <Marker
          key={report.id}
          position={[report.latitude, report.longitude]}
          icon={createIcon(report.category as ReportCategory)}
          eventHandlers={{ click: () => onReportClick?.(report) }}
        >
          <Popup>
            <div className="text-sm min-w-[160px]">
              <p className="text-xs font-medium text-gray-500 mb-0.5">
                {REPORT_CATEGORY_LABELS[report.category as ReportCategory]}
              </p>
              <p className="font-semibold" style={{ color: REPORT_STATUS_COLORS[report.status as ReportStatus] }}>
                {REPORT_STATUS_LABELS[report.status as ReportStatus]}
              </p>
              {report.comment && <p className="text-gray-600 mt-1">{report.comment}</p>}
              <p className="text-gray-400 text-xs mt-1">{timeAgo(report.createdAt)}</p>
              {report.confirmationCount > 0 && (
                <p className="text-xs text-emerald-600 mt-1">
                  {report.confirmationCount} confirmación{report.confirmationCount !== 1 ? "es" : ""}
                </p>
              )}
            </div>
          </Popup>
        </Marker>
      ))}

      {selectedPosition && (
        <Marker
          position={[selectedPosition.lat, selectedPosition.lng]}
          icon={L.divIcon({
            className: "",
            iconSize: [20, 20],
            iconAnchor: [10, 10],
            html: `<div style="width:20px;height:20px;border-radius:50%;background:#7c5cfc;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>`,
          })}
        />
      )}

      {userLocation && (
        <Marker position={[userLocation.lat, userLocation.lng]} icon={userLocationIcon} />
      )}
    </MapContainer>
  );
}
