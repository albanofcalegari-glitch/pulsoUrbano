import type { TransitStop, TransitType } from "@/types";

const OVERPASS_URL = "https://overpass-api.de/api/interpreter";
const CACHE_TTL_MS = 5 * 60 * 1000;

const cache = new Map<string, { data: TransitStop[]; ts: number }>();

function roundCoord(n: number, decimals = 3): number {
  const f = 10 ** decimals;
  return Math.round(n * f) / f;
}

function cacheKey(s: number, w: number, n: number, e: number): string {
  return `${roundCoord(s)},${roundCoord(w)},${roundCoord(n)},${roundCoord(e)}`;
}

interface OverpassElement {
  type: "node" | "relation";
  id: number;
  lat?: number;
  lon?: number;
  tags?: Record<string, string>;
  members?: { type: string; ref: number; role: string }[];
}

export async function fetchTransitStops(bounds: {
  south: number;
  west: number;
  north: number;
  east: number;
}): Promise<TransitStop[]> {
  const { south, west, north, east } = bounds;
  const key = cacheKey(south, west, north, east);

  const cached = cache.get(key);
  if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
    return cached.data;
  }

  const bbox = `${south},${west},${north},${east}`;

  const query = `[out:json][timeout:25];
node["highway"="bus_stop"](${bbox})->.busStops;
.busStops out body;
rel(bn.busStops)["route"="bus"];
out body;
node["station"="subway"](${bbox})->.subwayStations;
.subwayStations out body;
rel(bn.subwayStations)["public_transport"="stop_area"]->.areas;
.areas out body;
node(r.areas)->.areaNodes;
rel(bn.areaNodes)["route"="subway"];
out body;`;

  const res = await fetch(OVERPASS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `data=${encodeURIComponent(query)}`,
  });

  if (!res.ok) throw new Error(`Overpass ${res.status}`);

  const json = await res.json();
  const elements: OverpassElement[] = json.elements || [];

  const nodes = elements.filter((e) => e.type === "node");
  const relations = elements.filter((e) => e.type === "relation");

  const busNodes = nodes.filter((n) => n.tags?.highway === "bus_stop");
  const subwayNodes = nodes.filter((n) => n.tags?.station === "subway");
  const subwayNodeIds = new Set(subwayNodes.map((n) => n.id));

  const busRoutes = relations.filter((r) => r.tags?.route === "bus");
  const stopAreas = relations.filter(
    (r) => r.tags?.public_transport === "stop_area"
  );
  const subwayRoutes = relations.filter((r) => r.tags?.route === "subway");

  // --- Bus: map node_id → Set<line_ref> ---
  const busNodeLines = new Map<number, Set<string>>();
  for (const rel of busRoutes) {
    const ref = rel.tags?.ref || rel.tags?.name || null;
    if (!ref || !rel.members) continue;
    for (const m of rel.members) {
      if (m.type !== "node") continue;
      let set = busNodeLines.get(m.ref);
      if (!set) {
        set = new Set();
        busNodeLines.set(m.ref, set);
      }
      set.add(ref);
    }
  }

  // --- Subway: station_node → lines via stop_area chain ---
  const routeMembers = new Map<string, Set<number>>();
  for (const route of subwayRoutes) {
    const ref = route.tags?.ref;
    if (!ref || !route.members) continue;
    const existing = routeMembers.get(ref) || new Set<number>();
    for (const m of route.members) {
      if (m.type === "node") existing.add(m.ref);
    }
    routeMembers.set(ref, existing);
  }

  const subwayStationLines = new Map<number, Set<string>>();
  for (const area of stopAreas) {
    if (!area.members) continue;
    const areaMemberIds = new Set(
      area.members.filter((m) => m.type === "node").map((m) => m.ref)
    );

    const linesAtArea = new Set<string>();
    Array.from(routeMembers.entries()).forEach(([ref, memberSet]) => {
      const found = Array.from(areaMemberIds).some((id) => memberSet.has(id));
      if (found) linesAtArea.add(ref);
    });

    if (linesAtArea.size === 0) continue;

    for (const memberId of Array.from(areaMemberIds)) {
      if (!subwayNodeIds.has(memberId)) continue;
      const existing = subwayStationLines.get(memberId) || new Set<string>();
      linesAtArea.forEach((l) => existing.add(l));
      subwayStationLines.set(memberId, existing);
    }
  }

  // --- Build results ---
  const stops: TransitStop[] = [];

  for (const el of busNodes) {
    const tags = el.tags || {};
    const relLines = busNodeLines.get(el.id);
    const lineFromRel = relLines
      ? Array.from(relLines)
          .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
          .join(", ")
      : null;
    stops.push({
      id: el.id,
      type: "bus_stop",
      lat: el.lat!,
      lng: el.lon!,
      name: tags.name || tags.description || null,
      line: lineFromRel || tags.route_ref || tags.ref || null,
    });
  }

  for (const el of subwayNodes) {
    const tags = el.tags || {};
    const lines = subwayStationLines.get(el.id);
    const lineStr = lines
      ? Array.from(lines)
          .sort()
          .join(", ")
      : null;
    stops.push({
      id: el.id,
      type: "subway_station",
      lat: el.lat!,
      lng: el.lon!,
      name: tags.name || null,
      line: lineStr,
    });
  }

  cache.set(key, { data: stops, ts: Date.now() });

  if (cache.size > 50) {
    const oldest = Array.from(cache.entries()).sort(
      (a, b) => a[1].ts - b[1].ts
    );
    for (let i = 0; i < oldest.length - 30; i++) cache.delete(oldest[i][0]);
  }

  return stops;
}
