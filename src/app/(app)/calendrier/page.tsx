import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

const C = {
  greenDeep: "#0E3D34", ink: "#1A1714", inkMute: "#9A9080",
  border: "#E8DFC8", borderSoft: "#F0E8D4",
};

export default async function CalendrierPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const calendarUrl = process.env.NEXT_PUBLIC_GOOGLE_CALENDAR_URL ?? "";

  return (
    <div style={{ maxWidth: 560, margin: "0 auto", padding: "20px 16px 80px", fontFamily: "'Inter', sans-serif", color: C.ink }}>

      <div style={{ marginBottom: 20 }}>
        <p style={{ fontSize: 11, color: C.inkMute, margin: "0 0 2px", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>
          Mon espace
        </p>
        <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0, letterSpacing: "-0.025em" }}>Calendrier</h1>
      </div>

      <div style={{ background: "#FFFFFF", borderRadius: 20, border: `1px solid ${C.border}`, overflow: "hidden" }}>
        <div style={{ padding: "14px 18px", borderBottom: `1px solid ${C.borderSoft}`, display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 11,
            background: `linear-gradient(160deg, ${C.greenDeep} 0%, #07251F 100%)`,
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 18,
          }}>📅</div>
          <div>
            <h2 style={{ fontSize: 14, fontWeight: 700, margin: 0, color: C.ink }}>Événements collectifs VISION</h2>
            <p style={{ fontSize: 11, color: C.inkMute, margin: "2px 0 0" }}>Workshops, lives de groupe et événements communs</p>
          </div>
        </div>
        {calendarUrl ? (
          <iframe
            src={calendarUrl}
            style={{ width: "100%", display: "block", border: "none" }}
            height={500}
          />
        ) : (
          <div style={{ padding: "48px 20px", textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📆</div>
            <p style={{ fontSize: 14, color: C.inkMute, margin: "0 0 6px", fontWeight: 600 }}>Calendrier collectif à venir</p>
            <p style={{ fontSize: 12, color: C.inkMute, margin: 0 }}>
              Le calendrier des événements VISION sera disponible ici.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
