const GHL_BASE = "https://services.leadconnectorhq.com";
const GHL_LOCATION_ID = "MqMvPiQgeRAj5T25cofA";

export interface GhlCourseRaw {
  id: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  imageUrl?: string;
  permalink?: string;
  accessUrl?: string;
  productType?: string;
}

// GHL v2 API endpoints to try in order
const ENDPOINTS = [
  `/products/?locationId=${GHL_LOCATION_ID}`,
  `/memberships/courses/?locationId=${GHL_LOCATION_ID}`,
  `/courses?locationId=${GHL_LOCATION_ID}`,
];

async function tryFetch(token: string, path: string) {
  return fetch(`${GHL_BASE}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Version: "2021-07-28",
    },
    cache: "no-store",
  });
}

export async function fetchGhlCourses(): Promise<GhlCourseRaw[]> {
  const token = process.env.GHL_API_KEY;
  if (!token) throw new Error("GHL_API_KEY non configuré");

  const errors: string[] = [];

  for (const path of ENDPOINTS) {
    const res = await tryFetch(token, path);
    if (!res.ok) {
      const body = await res.text();
      errors.push(`${path} → ${res.status}: ${body.slice(0, 150)}`);
      continue;
    }
    const data = await res.json();
    const items: GhlCourseRaw[] = Array.isArray(data)
      ? data
      : (data.products ?? data.courses ?? data.data ?? []);
    // Filter to membership/course type products if productType is present
    return items.filter(
      (i) => !i.productType || ["MEMBERSHIP", "COURSE", "certificate"].includes(i.productType)
    );
  }

  throw new Error(
    `Aucun endpoint GHL n'a fonctionné :\n${errors.join("\n")}`
  );
}

export function buildAccessUrl(course: GhlCourseRaw): string {
  if (course.accessUrl) return course.accessUrl;
  if (course.permalink) return course.permalink;
  const portalBase =
    process.env.GHL_PORTAL_URL ?? "https://app.gohighlevel.com";
  return `${portalBase}/v2/preview/${course.id}`;
}
