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
}

export async function fetchGhlCourses(): Promise<GhlCourseRaw[]> {
  const token = process.env.GHL_API_KEY;
  if (!token) throw new Error("GHL_API_KEY non configuré");

  const res = await fetch(
    `${GHL_BASE}/courses/?locationId=${GHL_LOCATION_ID}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Version: "2021-07-28",
      },
      cache: "no-store",
    }
  );

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`GHL API ${res.status}: ${body.slice(0, 300)}`);
  }

  const data = await res.json();
  return Array.isArray(data) ? data : (data.courses ?? data.data ?? []);
}

export function buildAccessUrl(course: GhlCourseRaw): string {
  if (course.accessUrl) return course.accessUrl;
  if (course.permalink) return course.permalink;
  const portalBase =
    process.env.GHL_PORTAL_URL ?? "https://app.gohighlevel.com";
  return `${portalBase}/v2/preview/${course.id}`;
}
