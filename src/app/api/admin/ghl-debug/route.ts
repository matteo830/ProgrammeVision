import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const GHL_BASE = "https://services.leadconnectorhq.com";
const GHL_LOCATION_ID = "MqMvPiQgeRAj5T25cofA";

const ENDPOINTS = [
  `/products/?locationId=${GHL_LOCATION_ID}`,
  `/memberships/courses/?locationId=${GHL_LOCATION_ID}`,
  `/courses?locationId=${GHL_LOCATION_ID}`,
];

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const token = process.env.GHL_API_KEY;
  if (!token) return NextResponse.json({ error: "GHL_API_KEY manquant" }, { status: 500 });

  const results: Record<string, unknown> = {};

  for (const path of ENDPOINTS) {
    try {
      const res = await fetch(`${GHL_BASE}${path}`, {
        headers: { Authorization: `Bearer ${token}`, Version: "2021-07-28" },
        cache: "no-store",
      });
      const text = await res.text();
      let json: unknown;
      try { json = JSON.parse(text); } catch { json = text; }
      results[path] = { status: res.status, body: json };
    } catch (e) {
      results[path] = { error: String(e) };
    }
  }

  return NextResponse.json(results);
}
