"use client";

import { useState } from "react";

const C = {
  greenDeep: "#0E3D34", greenSoft: "#E8EFEC",
  gold: "#D4A047", goldLight: "#E8C56F",
  coralStart: "#FF8A6B", coralEnd: "#E8527D",
  cream: "#FAF6EB",
  ink: "#1A1714", inkSoft: "#5A5247", inkMute: "#9A9080",
  border: "#E8DFC8", borderSoft: "#F0E8D4",
};

interface Coach {
  id: string;
  firstName: string;
  lastName: string;
  ghlCalendarSlug: string;
}

interface CalendrierClientProps {
  coaches: Coach[];
  calendarUrl: string;
}

export function CalendrierClient({ coaches, calendarUrl }: CalendrierClientProps) {
  const [activeCoach, setActiveCoach] = useState<string>(coaches[0]?.id ?? "");

  const selectedCoach = coaches.find(c => c.id === activeCoach);
  const ghlUrl = selectedCoach
    ? `https://api.leadconnectorhq.com/widget/booking/${selectedCoach.ghlCalendarSlug}`
    : null;

  return (
    <div style={{ maxWidth: 560, margin: "0 auto", padding: "20px 16px 80px", fontFamily: "'Inter', sans-serif", color: C.ink }}>

      {/* Title */}
      <div style={{ marginBottom: 20 }}>
        <p style={{ fontSize: 11, color: C.inkMute, margin: "0 0 2px", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>Mon espace</p>
        <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0, letterSpacing: "-0.025em" }}>Calendrier</h1>
      </div>

      {/* Coaching individuel — GHL booking */}
      <div style={{ background: "#FFFFFF", borderRadius: 20, border: `1px solid ${C.border}`, overflow: "hidden", marginBottom: 14 }}>
        <div style={{ padding: "14px 18px", borderBottom: `1px solid ${C.borderSoft}`, display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 11,
            background: `linear-gradient(135deg, ${C.coralStart} 0%, ${C.coralEnd} 100%)`,
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 18,
          }}>💬</div>
          <div>
            <h2 style={{ fontSize: 14, fontWeight: 700, margin: 0, color: C.ink }}>Coaching individuel</h2>
            <p style={{ fontSize: 11, color: C.inkMute, margin: "2px 0 0" }}>Réserve une séance avec ton coach</p>
          </div>
        </div>

        {coaches.length === 0 ? (
          <div style={{ padding: "32px 20px", textAlign: "center" }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>🗓️</div>
            <p style={{ fontSize: 13, color: C.inkMute, margin: 0 }}>
              Aucun calendrier de coach configuré pour l&apos;instant.
            </p>
          </div>
        ) : (
          <>
            {/* Coach tabs */}
            {coaches.length > 1 && (
              <div style={{ display: "flex", gap: 8, padding: "12px 16px 0", borderBottom: `1px solid ${C.borderSoft}` }}>
                {coaches.map(coach => {
                  const isActive = coach.id === activeCoach;
                  return (
                    <button
                      key={coach.id}
                      onClick={() => setActiveCoach(coach.id)}
                      style={{
                        padding: "8px 14px",
                        background: isActive ? C.greenDeep : "transparent",
                        color: isActive ? "#FFFFFF" : C.inkSoft,
                        border: `1px solid ${isActive ? C.greenDeep : C.border}`,
                        borderBottom: "none",
                        borderRadius: "10px 10px 0 0",
                        fontSize: 12.5, fontWeight: 700,
                        cursor: "pointer", fontFamily: "inherit",
                        display: "flex", alignItems: "center", gap: 7,
                      }}
                    >
                      <span style={{
                        width: 24, height: 24, borderRadius: "50%",
                        background: isActive ? "rgba(255,255,255,0.2)" : `linear-gradient(135deg, ${C.coralStart}, ${C.coralEnd})`,
                        color: "#FFFFFF",
                        display: "inline-flex", alignItems: "center", justifyContent: "center",
                        fontSize: 10, fontWeight: 700, flexShrink: 0,
                      }}>
                        {coach.firstName[0]}{coach.lastName[0]}
                      </span>
                      {coach.firstName}
                    </button>
                  );
                })}
              </div>
            )}

            {/* GHL iframe */}
            {ghlUrl && (
              <div style={{ padding: coaches.length > 1 ? "0" : "0" }}>
                <iframe
                  key={ghlUrl}
                  src={ghlUrl}
                  style={{ width: "100%", display: "block", border: "none", minHeight: 600 }}
                  scrolling="no"
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Agenda collectif VISION */}
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
            height={420}
            scrolling="no"
          />
        ) : (
          <div style={{ padding: "32px 20px", textAlign: "center" }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>📆</div>
            <p style={{ fontSize: 13, color: C.inkMute, margin: 0 }}>
              Le calendrier collectif VISION sera disponible ici.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
