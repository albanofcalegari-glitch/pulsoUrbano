"use client";

import dynamic from "next/dynamic";
import type { Report, JobRequest } from "@/types";

const Map = dynamic(() => import("./Map"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-gray-100">
      <p className="text-gray-500">Cargando mapa...</p>
    </div>
  ),
});

interface MapWrapperProps {
  center: { lat: number; lng: number };
  zoom: number;
  reports: Report[];
  jobs?: JobRequest[];
  onReportClick?: (report: Report) => void;
  onJobClick?: (job: JobRequest) => void;
  onMapClick?: (lat: number, lng: number) => void;
  selectedPosition?: { lat: number; lng: number } | null;
  userLocation?: { lat: number; lng: number } | null;
  flyTrigger?: number;
}

export default function MapWrapper(props: MapWrapperProps) {
  return <Map {...props} />;
}
