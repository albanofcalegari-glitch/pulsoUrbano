"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { useEffect } from "react";
import type { Report, ReportCategory, ReportStatus, JobRequest, ServiceCategory, TransitStop } from "@/types";
import {
  REPORT_CATEGORY_COLORS,
  REPORT_CATEGORY_LABELS,
  REPORT_STATUS_LABELS,
  REPORT_STATUS_COLORS,
  SERVICE_CATEGORY_COLORS,
  SERVICE_CATEGORY_LABELS,
  JOB_URGENCY_LABELS,
  isVehicleAlert,
} from "@/lib/constants";
import { timeAgo } from "@/lib/utils";
import "leaflet/dist/leaflet.css";

function createIcon(category: ReportCategory): L.DivIcon {
  const color = REPORT_CATEGORY_COLORS[category];
  const inner = isVehicleAlert(category)
    ? `<text x="12" y="15" text-anchor="middle" font-size="11" fill="${color}">🚗</text>`
    : `<circle cx="12" cy="12" r="6" fill="white"/>`;
  return L.divIcon({
    className: "",
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28],
    html: `<svg viewBox="0 0 24 36" width="28" height="36" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24s12-15 12-24C24 5.4 18.6 0 12 0z" fill="${color}"/>
      ${inner}
    </svg>`,
  });
}

function createJobIcon(category: ServiceCategory): L.DivIcon {
  const color = SERVICE_CATEGORY_COLORS[category] || "#7c5cfc";
  return L.divIcon({
    className: "",
    iconSize: [28, 36],
    iconAnchor: [14, 36],
    popupAnchor: [0, -36],
    html: `<svg viewBox="0 0 24 36" width="28" height="36" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="20" height="20" rx="5" fill="${color}" stroke="white" stroke-width="2"/>
      <polygon points="12,36 8,22 16,22" fill="${color}"/>
      <circle cx="12" cy="12" r="4" fill="white"/>
    </svg>`,
  });
}

const SUBTE_LINE_COLORS: Record<string, { bg: string; text: string }> = {
  A: { bg: "#18B4E9", text: "#fff" },
  B: { bg: "#EE3A43", text: "#fff" },
  C: { bg: "#0068B5", text: "#fff" },
  D: { bg: "#00954B", text: "#fff" },
  E: { bg: "#7B2D8E", text: "#fff" },
  H: { bg: "#FDDA24", text: "#333" },
};

const busStopIcon = L.divIcon({
  className: "",
  iconSize: [14, 14],
  iconAnchor: [7, 7],
  html: `<svg viewBox="0 0 14 14" width="14" height="14" xmlns="http://www.w3.org/2000/svg">
    <circle cx="7" cy="7" r="6" fill="#0284C7" stroke="white" stroke-width="1"/>
    <text x="7" y="10.5" text-anchor="middle" font-size="8" font-weight="bold" fill="white" font-family="sans-serif">B</text>
  </svg>`,
});

const subwayIcon = L.divIcon({
  className: "",
  iconSize: [18, 18],
  iconAnchor: [9, 9],
  html: `<svg viewBox="0 0 18 18" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
    <rect x="1" y="1" width="16" height="16" rx="4" fill="#DC2626" stroke="white" stroke-width="1"/>
    <text x="9" y="13" text-anchor="middle" font-size="10" font-weight="bold" fill="white" font-family="sans-serif">S</text>
  </svg>`,
});

function MapBoundsTracker({ onBoundsChange }: { onBoundsChange: (bounds: { south: number; west: number; north: number; east: number; zoom: number }) => void }) {
  const map = useMap();
  useEffect(() => {
    function report() {
      const b = map.getBounds();
      onBoundsChange({
        south: b.getSouth(),
        west: b.getWest(),
        north: b.getNorth(),
        east: b.getEast(),
        zoom: map.getZoom(),
      });
    }
    report();
    map.on("moveend", report);
    return () => { map.off("moveend", report); };
  }, [map, onBoundsChange]);
  return null;
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
  jobs?: JobRequest[];
  transitStops?: TransitStop[];
  onReportClick?: (report: Report) => void;
  onJobClick?: (job: JobRequest) => void;
  onMapClick?: (lat: number, lng: number) => void;
  onBoundsChange?: (bounds: { south: number; west: number; north: number; east: number; zoom: number }) => void;
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
  jobs = [],
  transitStops = [],
  onReportClick,
  onJobClick,
  onMapClick,
  onBoundsChange,
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

      {jobs.map((job) => (
        <Marker
          key={`job-${job.id}`}
          position={[job.latitude, job.longitude]}
          icon={createJobIcon(job.category as ServiceCategory)}
          eventHandlers={{ click: () => onJobClick?.(job) }}
        >
          <Popup>
            <div className="text-sm min-w-[160px]">
              <p className="text-xs font-medium text-purple-600">
                🔧 {SERVICE_CATEGORY_LABELS[job.category as ServiceCategory]}
              </p>
              <p className="font-semibold text-gray-800">{job.title}</p>
              {job.urgency === "urgent" && (
                <p className="text-xs text-red-500 mt-0.5">🔥 {JOB_URGENCY_LABELS[job.urgency]}</p>
              )}
              <p className="text-gray-400 text-xs mt-1">
                {timeAgo(job.createdAt)} · {job.applicationsCount} postulación{job.applicationsCount !== 1 ? "es" : ""}
              </p>
            </div>
          </Popup>
        </Marker>
      ))}

      {onBoundsChange && <MapBoundsTracker onBoundsChange={onBoundsChange} />}

      {transitStops.map((stop) => (
        <Marker
          key={`transit-${stop.id}`}
          position={[stop.lat, stop.lng]}
          icon={stop.type === "subway_station" ? subwayIcon : busStopIcon}
        >
          <Popup>
            <div className="text-sm min-w-[160px] max-w-[280px]">
              {stop.type === "subway_station" ? (
                <>
                  <p className="text-xs font-medium text-red-600">🚇 Subte</p>
                  {stop.name && <p className="font-semibold text-gray-800">{stop.name}</p>}
                  {stop.line ? (() => {
                    const lines = stop.line!.split(", ");
                    const isCombi = lines.length > 1;
                    return (
                      <div className="mt-1.5">
                        {isCombi && (
                          <span className="inline-block mb-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 ring-1 ring-amber-300">
                            Combinación
                          </span>
                        )}
                        <div className="flex flex-wrap gap-1">
                          {lines.map((l) => {
                            const c = SUBTE_LINE_COLORS[l.trim().toUpperCase()];
                            return (
                              <span key={l} className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold"
                                style={c ? { backgroundColor: c.bg, color: c.text } : { backgroundColor: "#6B7280", color: "#fff" }}>
                                Línea {l.trim()}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })() : (
                    <p className="text-xs text-gray-400 mt-0.5 italic">Sin info de línea</p>
                  )}
                </>
              ) : (
                <>
                  <p className="text-xs font-medium text-sky-600">🚌 Parada de colectivo</p>
                  {stop.name && <p className="font-semibold text-gray-800">{stop.name}</p>}
                  {stop.line ? (
                    <div className="mt-1">
                      <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-0.5">Líneas</p>
                      <div className="flex flex-wrap gap-1">
                        {stop.line.split(", ").map((l) => (
                          <span key={l} className="inline-block px-1.5 py-0.5 rounded text-[11px] font-semibold bg-sky-100 text-sky-700">
                            {l}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 mt-0.5 italic">Sin info de líneas</p>
                  )}
                </>
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
