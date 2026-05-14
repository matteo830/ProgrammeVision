"use client";

import { useState } from "react";

const C = {
  greenDeep: "#0E3D34",
  greenMid: "#1A5448",
  greenSoft: "#E8EFEC",
  greenAccent: "#3FA88E",
  gold: "#D4A047",
  goldLight: "#E8C56F",
  goldDeep: "#B8862E",
  coralStart: "#FF8A6B",
  coralEnd: "#E8527D",
  cream: "#FAF6EB",
  creamWarm: "#F2EBD8",
  ink: "#1A1714",
  inkSoft: "#5A5247",
  inkMute: "#9A9080",
  border: "#E8DFC8",
  borderSoft: "#F0E8D4",
  tileRose: "#F5C9CE",
  tileRoseText: "#A8425C",
  tileSage: "#CFDDC2",
  tileSageText: "#4A6638",
};

interface Coach {
  id: string;
  firstName: string;
  lastName: string;
  ghlCalendarSlug: string | null;
}

interface SessionAction {
  id: string;
  content: string;
  completedByClient: boolean;
  addedToDashboard: boolean;
}

interface CoachingSession {
  id: string;
  title: string;
  scheduledAt: Date | string;
  meetingUrl: string | null;
  firefliesUrl: string | null;
  summary: string | null;
  decisions: string | null;
  coach: { firstName: string; lastName: string };
  actions: SessionAction[];
  notes: Array<{ id: string; content: string; authorId: string; createdAt: Date | string }>;
}

interface CalendrierClientProps {
  coaches: Coach[];
  calendarUrl: string;
  upcoming: CoachingSession | null;
  past: CoachingSession[];
  assignedCoach: Coach | null;
  currentUserId: string;
  clientFirstName: string;
  clientLastName: string;
  clientEmail: string;
  clientPhone: string | null;
}

function formatScheduledAt(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const days = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
  const months = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
  const dayName = days[d.getDay()];
  const day = d.getDate();
  const month = months[d.getMonth()];
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${dayName} ${day} ${month} · ${hours}h${minutes}`;
}

function formatShortDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const months = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()} · ${hours}h${minutes}`;
}

function initials(firstName: string, lastName: string): string {
  return `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase();
}

export function CalendrierClient({
  coaches,
  calendarUrl,
  upcoming,
  past: initialPast,
  assignedCoach,
  currentUserId,
  clientFirstName,
  clientLastName,
  clientEmail,
  clientPhone,
}: CalendrierClientProps) {
  const [showBookingForCoachId, setShowBookingForCoachId] = useState<string | null>(null);
  const [expandedSession, setExpandedSession] = useState<string | null>(null);
  const [past, setPast] = useState<CoachingSession[]>(initialPast);
  const [commentTexts, setCommentTexts] = useState<Record<string, string>>({});
  const [submittingComment, setSubmittingComment] = useState<Record<string, boolean>>({});

  const coachesWithSlug = coaches.filter((c) => c.ghlCalendarSlug);

  function getBookingUrl(slug: string) {
    const params = new URLSearchParams();
    if (clientFirstName) params.set("firstName", clientFirstName);
    if (clientLastName) params.set("lastName", clientLastName);
    if (clientEmail) params.set("email", clientEmail);
    if (clientPhone) params.set("phone", clientPhone);
    const query = params.toString();
    return `https://api.leadconnectorhq.com/widget/booking/${slug}${query ? `?${query}` : ""}`;
  }

  async function handleMarkAction(sessionId: string, actionId: string, completed: boolean) {
    setPast((prev) =>
      prev.map((s) =>
        s.id === sessionId
          ? { ...s, actions: s.actions.map((a) => (a.id === actionId ? { ...a, completedByClient: completed } : a)) }
          : s
      )
    );
    await fetch(`/api/client/sessions/${sessionId}/actions/${actionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completedByClient: completed }),
    });
  }

  async function handleAddToDashboard(sessionId: string, actionId: string) {
    setPast((prev) =>
      prev.map((s) =>
        s.id === sessionId
          ? { ...s, actions: s.actions.map((a) => (a.id === actionId ? { ...a, addedToDashboard: true } : a)) }
          : s
      )
    );
    await fetch(`/api/client/sessions/${sessionId}/actions/${actionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ addedToDashboard: true }),
    });
  }

  async function handleAddComment(sessionId: string) {
    const text = commentTexts[sessionId]?.trim();
    if (!text) return;
    setSubmittingComment((prev) => ({ ...prev, [sessionId]: true }));
    const res = await fetch(`/api/client/sessions/${sessionId}/comment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: text }),
    });
    if (res.ok) {
      const newNote = await res.json();
      setPast((prev) =>
        prev.map((s) =>
          s.id === sessionId ? { ...s, notes: [...s.notes, newNote] } : s
        )
      );
      setCommentTexts((prev) => ({ ...prev, [sessionId]: "" }));
    }
    setSubmittingComment((prev) => ({ ...prev, [sessionId]: false }));
  }

  const coralBtn: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "10px 20px",
    background: `linear-gradient(135deg, ${C.coralStart} 0%, ${C.coralEnd} 100%)`,
    color: "#FFFFFF",
    border: "none",
    borderRadius: 12,
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "inherit",
    textDecoration: "none",
  };

  return (
    <div style={{ maxWidth: 560, margin: "0 auto", padding: "20px 16px 80px", fontFamily: "'Inter', sans-serif", color: C.ink }}>

      <div style={{ marginBottom: 20 }}>
        <p style={{ fontSize: 11, color: C.inkMute, margin: "0 0 2px", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>Mon espace</p>
        <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0, letterSpacing: "-0.025em" }}>Calendrier</h1>
      </div>

      {/* Group events — always first */}
      <div style={{ background: "#FFFFFF", borderRadius: 20, border: `1px solid ${C.border}`, overflow: "hidden", marginBottom: 14 }}>
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
          />
        ) : (
          <div style={{ padding: "32px 20px", textAlign: "center" }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>📆</div>
            <p style={{ fontSize: 13, color: C.inkMute, margin: 0 }}>Le calendrier collectif VISION sera disponible ici.</p>
          </div>
        )}
      </div>

      {/* Individual coaching — always second */}
      <div style={{ background: "#FFFFFF", borderRadius: 20, border: `1px solid ${C.border}`, overflow: "hidden", marginBottom: 14 }}>
        <div style={{ padding: "14px 18px", borderBottom: `1px solid ${C.borderSoft}`, display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 11,
            background: `linear-gradient(135deg, ${C.coralStart} 0%, ${C.coralEnd} 100%)`,
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 18,
          }}>🎯</div>
          <div>
            <h2 style={{ fontSize: 14, fontWeight: 700, margin: 0, color: C.ink }}>Coaching individuel</h2>
            <p style={{ fontSize: 11, color: C.inkMute, margin: "2px 0 0" }}>Tes séances de coaching personnalisé</p>
          </div>
        </div>

        <div style={{ padding: "18px 18px" }}>
          {upcoming ? (
            <div style={{ background: C.greenDeep, borderRadius: 14, padding: "16px 18px" }}>
              <p style={{ fontSize: 12, color: C.greenSoft, margin: "0 0 6px", fontWeight: 600, opacity: 0.8 }}>Prochaine séance</p>
              <p style={{ fontSize: 15, fontWeight: 700, color: "#FFFFFF", margin: "0 0 10px" }}>{formatScheduledAt(upcoming.scheduledAt)}</p>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: "50%",
                  background: `linear-gradient(135deg, ${C.coralStart}, ${C.coralEnd})`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 11, fontWeight: 700, color: "#FFFFFF", flexShrink: 0,
                }}>
                  {initials(upcoming.coach.firstName, upcoming.coach.lastName)}
                </div>
                <div>
                  <p style={{ fontSize: 12, color: C.greenSoft, margin: 0, opacity: 0.8 }}>{upcoming.coach.firstName} {upcoming.coach.lastName}</p>
                  <p style={{ fontSize: 13, color: "#FFFFFF", margin: 0, fontWeight: 600 }}>{upcoming.title}</p>
                </div>
              </div>
              {upcoming.meetingUrl && (
                <a href={upcoming.meetingUrl} target="_blank" rel="noopener noreferrer" style={{ ...coralBtn, marginTop: 6 }}>
                  Rejoindre la séance
                </a>
              )}
            </div>
          ) : (
            <div>
              <p style={{ fontSize: 13, color: C.inkMute, margin: "0 0 14px" }}>Aucun coaching planifié</p>

              {assignedCoach?.ghlCalendarSlug ? (
                <>
                  {showBookingForCoachId !== assignedCoach.id ? (
                    <button
                      style={coralBtn}
                      onClick={() => setShowBookingForCoachId(assignedCoach.id)}
                    >
                      Prendre rendez-vous
                    </button>
                  ) : (
                    <iframe
                      key={assignedCoach.ghlCalendarSlug}
                      src={getBookingUrl(assignedCoach.ghlCalendarSlug)}
                      style={{ width: "100%", display: "block", border: "none", height: 600 }}
                    />
                  )}
                </>
              ) : (
                <>
                  {coachesWithSlug.length > 0 && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
                      {coachesWithSlug.map((coach) => (
                        <button
                          key={coach.id}
                          onClick={() => setShowBookingForCoachId(showBookingForCoachId === coach.id ? null : coach.id)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            padding: "10px 14px",
                            background: showBookingForCoachId === coach.id ? C.greenSoft : C.cream,
                            border: `1px solid ${showBookingForCoachId === coach.id ? C.greenAccent : C.border}`,
                            borderRadius: 12,
                            cursor: "pointer",
                            fontFamily: "inherit",
                            textAlign: "left",
                          }}
                        >
                          <div style={{
                            width: 32, height: 32, borderRadius: "50%",
                            background: `linear-gradient(135deg, ${C.coralStart}, ${C.coralEnd})`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 11, fontWeight: 700, color: "#FFFFFF", flexShrink: 0,
                          }}>
                            {initials(coach.firstName, coach.lastName)}
                          </div>
                          <div>
                            <p style={{ fontSize: 13, fontWeight: 700, margin: 0, color: C.ink }}>{coach.firstName} {coach.lastName}</p>
                            <p style={{ fontSize: 11, color: C.inkMute, margin: 0 }}>Réserver une séance</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                  {showBookingForCoachId && coachesWithSlug.find((c) => c.id === showBookingForCoachId)?.ghlCalendarSlug && (
                    <iframe
                      key={showBookingForCoachId}
                      src={getBookingUrl(coachesWithSlug.find((c) => c.id === showBookingForCoachId)!.ghlCalendarSlug!)}
                      style={{ width: "100%", display: "block", border: "none", height: 600 }}
                    />
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {past.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: C.ink }}>Historique des séances</h2>
            <span style={{
              background: C.greenSoft,
              color: C.greenDeep,
              fontSize: 11,
              fontWeight: 700,
              padding: "2px 8px",
              borderRadius: 20,
            }}>{past.length}</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {past.map((session) => {
              const isExpanded = expandedSession === session.id;
              const clientNotes = session.notes.filter((n) => n.authorId === currentUserId);
              return (
                <div key={session.id} style={{ background: "#FFFFFF", borderRadius: 16, border: `1px solid ${C.border}`, overflow: "hidden" }}>
                  <button
                    onClick={() => setExpandedSession(isExpanded ? null : session.id)}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "14px 16px",
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      fontFamily: "inherit",
                      textAlign: "left",
                      gap: 12,
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 11, color: C.inkMute, margin: "0 0 2px" }}>{formatShortDate(session.scheduledAt)} · {session.coach.firstName} {session.coach.lastName}</p>
                      <p style={{ fontSize: 13, fontWeight: 700, color: C.ink, margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{session.title}</p>
                    </div>
                    <span style={{ fontSize: 16, color: C.inkMute, transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s", flexShrink: 0 }}>▾</span>
                  </button>

                  {isExpanded && (
                    <div style={{ padding: "0 16px 16px", borderTop: `1px solid ${C.borderSoft}`, paddingTop: 14 }}>

                      {session.firefliesUrl && (
                        <a
                          href={session.firefliesUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ display: "inline-flex", alignItems: "center", gap: 6, color: C.coralEnd, fontSize: 13, fontWeight: 600, textDecoration: "none", marginBottom: 12 }}
                        >
                          🎬 Voir le replay
                        </a>
                      )}

                      {session.summary && (
                        <div style={{ marginBottom: 12 }}>
                          <p style={{ fontSize: 12, fontWeight: 700, color: C.ink, margin: "0 0 4px" }}>📝 Résumé</p>
                          <p style={{ fontSize: 13, color: C.inkSoft, margin: 0, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{session.summary}</p>
                        </div>
                      )}

                      {session.decisions && (
                        <div style={{ marginBottom: 12 }}>
                          <p style={{ fontSize: 12, fontWeight: 700, color: C.ink, margin: "0 0 4px" }}>✅ Décisions</p>
                          <p style={{ fontSize: 13, color: C.inkSoft, margin: 0, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{session.decisions}</p>
                        </div>
                      )}

                      {session.actions.length > 0 && (
                        <div style={{ marginBottom: 12 }}>
                          <p style={{ fontSize: 12, fontWeight: 700, color: C.ink, margin: "0 0 8px" }}>Actions à réaliser</p>
                          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                            {session.actions.map((action) => (
                              <div key={action.id} style={{
                                display: "flex",
                                alignItems: "flex-start",
                                gap: 8,
                                padding: "8px 10px",
                                background: action.completedByClient ? C.greenSoft : C.cream,
                                borderRadius: 10,
                                border: `1px solid ${action.completedByClient ? C.greenAccent + "40" : C.borderSoft}`,
                              }}>
                                <button
                                  onClick={() => handleMarkAction(session.id, action.id, !action.completedByClient)}
                                  style={{
                                    width: 20, height: 20, borderRadius: 6, flexShrink: 0,
                                    background: action.completedByClient ? C.greenAccent : "transparent",
                                    border: `2px solid ${action.completedByClient ? C.greenAccent : C.inkMute}`,
                                    cursor: "pointer",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    fontSize: 11, color: "#FFFFFF", fontWeight: 700,
                                    marginTop: 1,
                                  }}
                                >
                                  {action.completedByClient ? "✓" : ""}
                                </button>
                                <span style={{
                                  fontSize: 13, color: action.completedByClient ? C.inkMute : C.ink,
                                  textDecoration: action.completedByClient ? "line-through" : "none",
                                  flex: 1, lineHeight: 1.5,
                                }}>{action.content}</span>
                                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
                                  {action.addedToDashboard ? (
                                    <span style={{
                                      fontSize: 10, fontWeight: 700,
                                      color: C.tileSageText,
                                      background: C.tileSage,
                                      padding: "2px 7px", borderRadius: 10,
                                    }}>Ajouté au dashboard</span>
                                  ) : (
                                    <button
                                      onClick={() => handleAddToDashboard(session.id, action.id)}
                                      style={{
                                        fontSize: 10, fontWeight: 700,
                                        color: C.goldDeep,
                                        background: C.creamWarm,
                                        border: `1px solid ${C.border}`,
                                        padding: "2px 7px", borderRadius: 10,
                                        cursor: "pointer", fontFamily: "inherit",
                                      }}
                                    >+ Dashboard</button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div>
                        <p style={{ fontSize: 12, fontWeight: 700, color: C.ink, margin: "0 0 8px" }}>Mes commentaires</p>
                        {clientNotes.length > 0 && (
                          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 10 }}>
                            {clientNotes.map((note) => (
                              <div key={note.id} style={{
                                padding: "8px 10px",
                                background: C.creamWarm,
                                borderRadius: 10,
                                border: `1px solid ${C.borderSoft}`,
                                fontSize: 13, color: C.inkSoft, lineHeight: 1.5,
                              }}>
                                {note.content}
                              </div>
                            ))}
                          </div>
                        )}
                        <div style={{ display: "flex", gap: 8 }}>
                          <textarea
                            value={commentTexts[session.id] ?? ""}
                            onChange={(e) => setCommentTexts((prev) => ({ ...prev, [session.id]: e.target.value }))}
                            placeholder="Ajouter un commentaire..."
                            rows={2}
                            style={{
                              flex: 1,
                              resize: "vertical",
                              padding: "8px 10px",
                              borderRadius: 10,
                              border: `1px solid ${C.border}`,
                              fontSize: 13,
                              fontFamily: "inherit",
                              color: C.ink,
                              background: "#FFFFFF",
                              outline: "none",
                            }}
                          />
                          <button
                            onClick={() => handleAddComment(session.id)}
                            disabled={submittingComment[session.id] || !commentTexts[session.id]?.trim()}
                            style={{
                              padding: "8px 14px",
                              background: `linear-gradient(135deg, ${C.coralStart}, ${C.coralEnd})`,
                              color: "#FFFFFF",
                              border: "none",
                              borderRadius: 10,
                              fontSize: 12,
                              fontWeight: 700,
                              cursor: "pointer",
                              fontFamily: "inherit",
                              alignSelf: "flex-end",
                              opacity: submittingComment[session.id] || !commentTexts[session.id]?.trim() ? 0.5 : 1,
                            }}
                          >
                            Envoyer
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
