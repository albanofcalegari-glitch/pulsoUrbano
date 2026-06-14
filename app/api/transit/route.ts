import { NextRequest, NextResponse } from "next/server";
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

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const south = Number(sp.get("south"));
  const west = Number(sp.get("west"));
  const north = Number(sp.get("north"));
  const east = Number(sp.get("east"));

  if ([south, west, north, east].some(isNaN)) {
    return NextResponse.json({ error: "Faltan parámetros de bounding box" }, { status: 400 });
  }

  const bbox = `${south},${west},${north},${east}`;
  const key = cacheKey(south, west, north, east);

  const cached = cache.get(key);
  if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
    return NextResponse.json(cached.data);
  }

  const query = `[out:json][timeout:10];(node["highway"="bus_stop"](${bbox});node["station"="subway"](${bbox});node["railway"="subway_entrance"](${bbox}););out body;`;

  try {
    const res = await fetch(OVERPASS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "PulsoUrbano/1.0",
      },
      body: `data=${encodeURIComponent(query)}`,
      cache: "no-store",
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error(`Overpass ${res.status}: ${text.slice(0, 200)}`);
      return NextResponse.json({ error: "Overpass API error", status: res.status, detail: text.slice(0, 200) }, { status: 502 });
    }

    const json = await res.json();
    const stops: TransitStop[] = (json.elements || []).map((el: Record<string, unknown>) => {
      const tags = (el.tags || {}) as Record<string, string>;
      const isSubway = tags.station === "subway" || tags.railway === "subway_entrance";
      const type: TransitType = isSubway ? "subway_station" : "bus_stop";
      return {
        id: el.id as number,
        type,
        lat: el.lat as number,
        lng: el.lon as number,
        name: tags.name || tags.description || null,
        line: tags.route_ref || tags.ref || null,
      };
    });

    cache.set(key, { data: stops, ts: Date.now() });

    if (cache.size > 50) {
      const oldest = Array.from(cache.entries()).sort((a, b) => a[1].ts - b[1].ts);
      for (let i = 0; i < oldest.length - 30; i++) cache.delete(oldest[i][0]);
    }

    return NextResponse.json(stops);
  } catch (err) {
    console.error("Overpass fetch error:", err);
    return NextResponse.json({ error: "No se pudo consultar Overpass", detail: String(err) }, { status: 502 });
  }
}
