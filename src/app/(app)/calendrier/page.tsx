import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function CalendrierPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const profile = await prisma.clientProfile.findUnique({
    where: { userId: session.user.id },
    select: { ghlBookingUrl: true },
  });

  const VISION_CALENDAR_URL = process.env.NEXT_PUBLIC_GOOGLE_CALENDAR_URL ?? "";

  return (
    <div style={{ maxWidth: 560, margin: "0 auto", padding: "20px 16px 80px", fontFamily: "'Inter', sans-serif", color: "#1A1714" }}>

      {/* Page title */}
      <div style={{ marginBottom: 20 }}>
        <p style={{ fontSize: 11, color: "#9A9080", margin: "0 0 2px", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>Mon espace</p>
        <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0, letterSpacing: "-0.025em", color: "#1A1714" }}>Calendrier</h1>
      </div>

      {/* Agenda collectif VISION */}
      <div style={{ background: "#FFFFFF", borderRadius: 20, border: "1px solid #E8DFC8", overflow: "hidden", marginBottom: 14 }}>
        <div style={{
          padding: "14px 18px",
          borderBottom: "1px solid #F0E8D4",
          display: "flex", alignItems: "center", gap: 12,
        }}>
          <div style={{
            width: 38, height: 38, borderRadius: 11,
            background: "linear-gradient(160deg, #0E3D34 0%, #07251F 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0, fontSize: 18,
          }}>
            📅
          </div>
          <div>
            <h2 style={{ fontSize: 14, fontWeight: 700, margin: 0, color: "#1A1714", letterSpacing: "-0.01em" }}>
              Événements collectifs VISION
            </h2>
            <p style={{ fontSize: 11, color: "#9A9080", margin: "2px 0 0" }}>
              Workshops, lives de groupe et événements communs
            </p>
          </div>
        </div>
        {VISION_CALENDAR_URL ? (
          <iframe
            src={VISION_CALENDAR_URL}
            style={{ width: "100%", display: "block", border: "none" }}
            height={420}
            scrolling="no"
          />
        ) : (
          <div style={{ padding: "32px 20px", textAlign: "center" }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>📆</div>
            <p style={{ fontSize: 13, color: "#9A9080", margin: 0, lineHeight: 1.5 }}>
              Le calendrier collectif VISION sera disponible ici.
            </p>
            <p style={{ fontSize: 11, color: "#9A9080", margin: "6px 0 0" }}>
              (Variable NEXT_PUBLIC_GOOGLE_CALENDAR_URL à configurer)
            </p>
          </div>
        )}
      </div>

      {/* Réservation coaching individuel */}
      <div style={{ background: "#FFFFFF", borderRadius: 20, border: "1px solid #E8DFC8", overflow: "hidden" }}>
        <div style={{
          padding: "14px 18px",
          borderBottom: "1px solid #F0E8D4",
          display: "flex", alignItems: "center", gap: 12,
        }}>
          <div style={{
            width: 38, height: 38, borderRadius: 11,
            background: "linear-gradient(135deg, #FF8A6B 0%, #E8527D 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0, fontSize: 18,
          }}>
            💬
          </div>
          <div>
            <h2 style={{ fontSize: 14, fontWeight: 700, margin: 0, color: "#1A1714", letterSpacing: "-0.01em" }}>
              Coaching individuel
            </h2>
            <p style={{ fontSize: 11, color: "#9A9080", margin: "2px 0 0" }}>
              Réserve ta prochaine séance avec ton coach
            </p>
          </div>
        </div>
        {profile?.ghlBookingUrl ? (
          <iframe
            src={profile.ghlBookingUrl}
            style={{ width: "100%", display: "block", border: "none" }}
            height={500}
          />
        ) : (
          <div style={{ padding: "32px 20px", textAlign: "center" }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>🗓️</div>
            <p style={{ fontSize: 13, color: "#9A9080", margin: 0, lineHeight: 1.5 }}>
              Ton lien de réservation n&apos;est pas encore configuré.
            </p>
            <p style={{ fontSize: 11, color: "#9A9080", margin: "6px 0 0" }}>
              Contacte ton coach pour obtenir ton lien personnalisé.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
