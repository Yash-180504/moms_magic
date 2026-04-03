import { NextResponse } from "next/server";
import { err } from "@/lib/auth";

function pickCity(address = {}) {
  return (
    address.city ||
    address.town ||
    address.village ||
    address.county ||
    address.state_district ||
    address.state ||
    null
  );
}

// GET /api/geo/reverse?lat=&lon=
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = Number(searchParams.get("lat"));
    const lon = Number(searchParams.get("lon"));

    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      return err("lat and lon are required", 400);
    }
    if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      return err("lat/lon out of range", 400);
    }

    const url = new URL("https://nominatim.openstreetmap.org/reverse");
    url.searchParams.set("format", "jsonv2");
    url.searchParams.set("lat", String(lat));
    url.searchParams.set("lon", String(lon));

    const res = await fetch(url.toString(), {
      headers: {
        "User-Agent": "moms-magic/1.0 (Next.js)",
        "Accept-Language": "en",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return err(
        `Reverse geocoding failed (${res.status})${text ? `: ${text.slice(0, 120)}` : ""}`,
        502,
      );
    }

    const data = await res.json();
    const city = pickCity(data?.address);

    return NextResponse.json({ city, raw: data?.address || null });
  } catch (e) {
    console.error("GET /api/geo/reverse failed:", e);
    return err(e?.message || "Unexpected error", 500);
  }
}
