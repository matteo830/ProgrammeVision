"use client";

import { useState } from "react";
import { formatDate } from "@/lib/utils";

const C = {
  greenDeep: "#0E3D34", greenMid: "#1A5448", greenSoft: "#E8EFEC", greenAccent: "#3FA88E",
  gold: "#D4A047", goldLight: "#E8C56F", goldDeep: "#B8862E",
  coralStart: "#FF8A6B", coralEnd: "#E8527D",
  cream: "#FAF6EB", creamWarm: "#F2EBD8",
  ink: "#1A1714", inkSoft: "#5A5247", inkMute: "#9A9080",
  border: "#E8DFC8", borderSoft: "#F0E8D4",
  tileSage: "#CFDDC2", tileSageText: "#4A6638",
};

interface Note {
  id: string;
  content: string;
  visibility: string;
  createdAt: Date;
  author: { firstName: string; lastName: string; role: string };
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

interface Coach {
  id: string;
  firstName: string;
  lastName: string;
  ghlCalendarSlug: string | null;
}

interface CoachingClientViewProps {
  initialNotes: Note[];
  userId: string;
  upcoming: CoachingSession | null;
  past: CoachingSession[];
  assignedCoach: Coach | null;
  coaches: Coach[];
  clientFirstName: string;
  clientLastName: string;
  clientEmail: string;
  clientPhone: string | null;
}

function formatScheduledAt(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const days = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
  const months = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]} · ${hours}h${minutes}`;
}

function formatShortDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const months = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()} · ${hours}h${minutes}`;
}

function initials(firstName: string, lastName: string) {
  return `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase();
}

export function CoachingClientView({
  initialNotes, userId,
  upcoming, past: initialPast,
  assignedCoach, coaches,
  clientFirstName, clientLastName, clientEmail, clientPhone,
}: CoachingClientViewProps) {
  const [notes, setNotes] = useState(initialNotes);
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);
  const [composerOpen, setComposerOpen] = useState(false);
  const [showBookingForCoachId, setShowBookingForCoachId] = useState<string | null>(null);
  const [expandedSession, setExpandedSession] = useState<string | null>(null);
  const [past, setPast] = useState<CoachingSession[]>(initialPast);
  const [commentTexts, setCommentTexts] = useState<Record<string, string>>({});
  const [submittingComment, setSubmittingComment] = useState<Record<string, boolean>>({});

  const coachesWithSlug = coaches.filter(c => c.ghlCalendarSlug);

  function getBookingUrl(slug: string) {
    const params = new URLSearchParams();
    if (clientFirstName) params.set("firstName", clientFirstName);
    if (clientLastName) params.set("lastName", clientLastName);
    if (clientEmail) params.set("email", clientEmail);
    if (clientPhone) params.set("phone", clientPhone);
    const query = params.toString();
    return `https://api.leadconnectorhq.com/widget/booking/${slug}${query ? `?${query}` : ""}`;
  }

  async function addComment() {
    if (!comment.trim()) return;
    setSaving(true);
    const res = await fetch("/api/coaching/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: comment, clientId: userId, visibility: "CLIENT_VISIBLE" }),
    });
    const note = await res.json();
    setNotes([note, ...notes]);
    setComment("");
    setSaving(false);
    setComposerOpen(false);
  }

  async function handleMarkAction(sessionId: string, actionId: string, completed: boolean) {
    setPast(prev => prev.map(s =>
      s.id === sessionId
        ? { ...s, actions: s.actions.map(a => a.id === actionId ? { ...a, completedByClient: completed } : a) }
        : s
    ));
    await fetch(`/api/client/sessions/${sessionId}/actions/${actionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completedByClient: completed }),
    });
  }

  async function handleAddToDashboard(sessionId: string, actionId: string) {
    setPast(prev => prev.map(s =>
      s.id === sessionId
        ? { ...s, actions: s.actions.map(a => a.id === actionId ? { ...a, addedToDashboard: true } : a) }
        : s
    ));
    await fetch(`/api/client/sessions/${sessionId}/actions/${actionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ addedToDashboard: true }),
    });
  }

  async function handleAddSessionComment(sessionId: string) {
    const text = commentTexts[sessionId]?.trim();
    if (!text) return;
    setSubmittingComment(prev => ({ ...prev, [sessionId]: true }));
    const res = await fetch(`/api/client/sessions/${sessionId}/comment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: text }),
    });
    if (res.ok) {
      const newNote = await res.json();
      setPast(prev => prev.map(s => s.id === sessionId ? { ...s, notes: [...s.notes, newNote] } : s));
      setCommentTexts(prev => ({ ...prev, [sessionId]: "" }));
    }
    setSubmittingComment(prev => ({ ...prev, [sessionId]: false }));
  }

  const coralBtn: React.CSSProperties = {
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    padding: "10px 20px",
    background: `linear-gradient(135deg, ${C.coralStart} 0%, ${C.coralEnd} 100%)`,
    color: "#FFFFFF", border: "none", borderRadius: 12,
    fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", textDecoration: "none",
  };

  const coach = notes.find(n => n.author.role === "COACH")?.author;
  const grouped: Record<string, Note[]> = {};
  for (const note of notes) {
    const key = formatDate(note.createdAt);
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(note);
  }
  const dateGroups = Object.entries(grouped);
  const isDisabled = saving || !comment.trim();

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "20px 16px 80px", fontFamily: "'Inter', sans-serif", color: C.ink }}>

      <div style={{ marginBottom: 20 }}>
        <p style={{ fontSize: 11, color: C.inkMute, margin: "0 0 2px", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>Mon espace</p>
        <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0, letterSpacing: "-0.025em" }}>Coaching</h1>
      </div>

      {/* ── Hero card ── */}
      <div style={{
        background: "linear-gradient(160deg, #0E3D34 0%, #07251F 100%)",
        borderRadius: 20, padding: "28px 24px",
        display: "flex", flexDirection: "column", gap: 20, marginBottom: 14,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 52, height: 52, borderRadius: "50%",
            background: "#D4A047",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 22, fontWeight: 700, color: "#0E3D34", flexShrink: 0,
          }}>
            {coach ? coach.firstName[0] : "C"}
          </div>
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", color: C.goldLight, textTransform: "uppercase", margin: 0 }}>
              TON COACH VISION
            </p>
            <p style={{ fontSize: 18, fontWeight: 700, color: "#FFFFFF", margin: "4px 0 0" }}>
              {coach ? `${coach.firstName} ${coach.lastName}` : "Ton coach"}
            </p>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div style={{ background: "rgba(0,0,0,0.25)", borderRadius: 12, padding: "14px 16px" }}>
            <p style={{ fontSize: 11, color: "#9A9080", margin: "0 0 6px", fontWeight: 500 }}>Séances faites</p>
            <p style={{ fontSize: 28, fontWeight: 700, color: "#FFFFFF", margin: 0 }}>{past.length}</p>
          </div>
          <div style={{ background: "rgba(0,0,0,0.25)", borderRadius: 12, padding: "14px 16px" }}>
            <p style={{ fontSize: 11, color: "#9A9080", margin: "0 0 6px", fontWeight: 500 }}>Prochaine séance</p>
            <p style={{ fontSize: upcoming ? 13 : 15, fontWeight: 600, color: "#FFFFFF", margin: 0 }}>
              {upcoming ? formatScheduledAt(upcoming.scheduledAt).split(" · ")[0] : "—"}
            </p>
          </div>
        </div>
      </div>

      {/* ── Upcoming / Booking ── */}
      <div style={{ background: "#FFFFFF", borderRadius: 20, border: `1px solid ${C.border}`, overflow: "hidden", marginBottom: 14 }}>
        <div style={{ padding: "14px 18px", borderBottom: `1px solid ${C.borderSoft}`, display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 11,
            background: `linear-gradient(135deg, ${C.coralStart} 0%, ${C.coralEnd} 100%)`,
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 18,
          }}>🎯</div>
          <div>
            <h2 style={{ fontSize: 14, fontWeight: 700, margin: 0, color: C.ink }}>Coaching individuel</h2>
            <p style={{ fontSize: 11, color: C.inkMute, margin: "2px 0 0" }}>Tes séances personnalisées</p>
          </div>
        </div>
        <div style={{ padding: 18 }}>
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
                    <button style={coralBtn} onClick={() => setShowBookingForCoachId(assignedCoach.id)}>
                      Prendre rendez-vous
                    </button>
                  ) : (
                    <iframe key={assignedCoach.ghlCalendarSlug} src={getBookingUrl(assignedCoach.ghlCalendarSlug)}
                      style={{ width: "100%", display: "block", border: "none", height: 600 }} />
                  )}
                </>
              ) : coachesWithSlug.length > 0 ? (
                <>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
                    {coachesWithSlug.map(c => (
                      <button key={c.id}
                        onClick={() => setShowBookingForCoachId(showBookingForCoachId === c.id ? null : c.id)}
                        style={{
                          display: "flex", alignItems: "center", gap: 10, padding: "10px 14px",
                          background: showBookingForCoachId === c.id ? C.greenSoft : C.cream,
                          border: `1px solid ${showBookingForCoachId === c.id ? C.greenAccent : C.border}`,
                          borderRadius: 12, cursor: "pointer", fontFamily: "inherit", textAlign: "left",
                        }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: "50%",
                          background: `linear-gradient(135deg, ${C.coralStart}, ${C.coralEnd})`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 11, fontWeight: 700, color: "#FFFFFF", flexShrink: 0,
                        }}>
                          {initials(c.firstName, c.lastName)}
                        </div>
                        <div>
                          <p style={{ fontSize: 13, fontWeight: 700, margin: 0, color: C.ink }}>{c.firstName} {c.lastName}</p>
                          <p style={{ fontSize: 11, color: C.inkMute, margin: 0 }}>Réserver une séance</p>
                        </div>
                      </button>
                    ))}
                  </div>
                  {showBookingForCoachId && coachesWithSlug.find(c => c.id === showBookingForCoachId)?.ghlCalendarSlug && (
                    <iframe key={showBookingForCoachId}
                      src={getBookingUrl(coachesWithSlug.find(c => c.id === showBookingForCoachId)!.ghlCalendarSlug!)}
                      style={{ width: "100%", display: "block", border: "none", height: 600 }} />
                  )}
                </>
              ) : null}
            </div>
          )}
        </div>
      </div>

      {/* ── Past sessions ── */}
      {past.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: C.ink }}>Historique des séances</h2>
            <span style={{ background: C.greenSoft, color: C.greenDeep, fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20 }}>
              {past.length}
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {past.map(session => {
              const isExpanded = expandedSession === session.id;
              const clientNotes = session.notes.filter(n => n.authorId === userId);
              return (
                <div key={session.id} style={{ background: "#FFFFFF", borderRadius: 16, border: `1px solid ${C.border}`, overflow: "hidden" }}>
                  <button onClick={() => setExpandedSession(isExpanded ? null : session.id)}
                    style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", background: "transparent", border: "none", cursor: "pointer", fontFamily: "inherit", textAlign: "left", gap: 12 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 11, color: C.inkMute, margin: "0 0 2px" }}>{formatShortDate(session.scheduledAt)} · {session.coach.firstName} {session.coach.lastName}</p>
                      <p style={{ fontSize: 13, fontWeight: 700, color: C.ink, margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{session.title}</p>
                    </div>
                    <span style={{ fontSize: 16, color: C.inkMute, transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s", flexShrink: 0 }}>▾</span>
                  </button>
                  {isExpanded && (
                    <div style={{ padding: "0 16px 16px", borderTop: `1px solid ${C.borderSoft}`, paddingTop: 14 }}>
                      {session.firefliesUrl && (
                        <a href={session.firefliesUrl} target="_blank" rel="noopener noreferrer"
                          style={{ display: "inline-flex", alignItems: "center", gap: 6, color: C.coralEnd, fontSize: 13, fontWeight: 600, textDecoration: "none", marginBottom: 12 }}>
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
                            {session.actions.map(action => (
                              <div key={action.id} style={{
                                display: "flex", alignItems: "flex-start", gap: 8, padding: "8px 10px",
                                background: action.completedByClient ? C.greenSoft : C.cream,
                                borderRadius: 10, border: `1px solid ${action.completedByClient ? C.greenAccent + "40" : C.borderSoft}`,
                              }}>
                                <button onClick={() => handleMarkAction(session.id, action.id, !action.completedByClient)}
                                  style={{
                                    width: 20, height: 20, borderRadius: 6, flexShrink: 0,
                                    background: action.completedByClient ? C.greenAccent : "transparent",
                                    border: `2px solid ${action.completedByClient ? C.greenAccent : C.inkMute}`,
                                    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                                    fontSize: 11, color: "#FFFFFF", fontWeight: 700, marginTop: 1,
                                  }}>
                                  {action.completedByClient ? "✓" : ""}
                                </button>
                                <span style={{ fontSize: 13, color: action.completedByClient ? C.inkMute : C.ink, textDecoration: action.completedByClient ? "line-through" : "none", flex: 1, lineHeight: 1.5 }}>
                                  {action.content}
                                </span>
                                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
                                  {action.addedToDashboard ? (
                                    <span style={{ fontSize: 10, fontWeight: 700, color: C.tileSageText, background: C.tileSage, padding: "2px 7px", borderRadius: 10 }}>
                                      Ajouté au dashboard
                                    </span>
                                  ) : (
                                    <button onClick={() => handleAddToDashboard(session.id, action.id)}
                                      style={{
                                        fontSize: 10, fontWeight: 700, color: C.goldDeep, background: C.creamWarm,
                                        border: `1px solid ${C.border}`, padding: "2px 7px", borderRadius: 10,
                                        cursor: "pointer", fontFamily: "inherit",
                                      }}>
                                      + Dashboard
                                    </button>
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
                            {clientNotes.map(note => (
                              <div key={note.id} style={{ padding: "8px 10px", background: C.creamWarm, borderRadius: 10, border: `1px solid ${C.borderSoft}`, fontSize: 13, color: C.inkSoft, lineHeight: 1.5 }}>
                                {note.content}
                              </div>
                            ))}
                          </div>
                        )}
                        <div style={{ display: "flex", gap: 8 }}>
                          <textarea
                            value={commentTexts[session.id] ?? ""}
                            onChange={e => setCommentTexts(prev => ({ ...prev, [session.id]: e.target.value }))}
                            placeholder="Ajouter un commentaire..." rows={2}
                            style={{ flex: 1, resize: "vertical", padding: "8px 10px", borderRadius: 10, border: `1px solid ${C.border}`, fontSize: 13, fontFamily: "inherit", color: C.ink, background: "#FFFFFF", outline: "none" }}
                          />
                          <button
                            onClick={() => handleAddSessionComment(session.id)}
                            disabled={submittingComment[session.id] || !commentTexts[session.id]?.trim()}
                            style={{
                              padding: "8px 14px", background: `linear-gradient(135deg, ${C.coralStart}, ${C.coralEnd})`,
                              color: "#FFFFFF", border: "none", borderRadius: 10, fontSize: 12, fontWeight: 700,
                              cursor: "pointer", fontFamily: "inherit", alignSelf: "flex-end",
                              opacity: submittingComment[session.id] || !commentTexts[session.id]?.trim() ? 0.5 : 1,
                            }}>
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

      {/* ── Notes section ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, marginTop: past.length > 0 ? 8 : 0 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: C.ink }}>Journal de coaching</h2>
      </div>

      {/* Note composer */}
      <div style={{ background: "#FFFFFF", borderRadius: 16, border: "1px solid #E8DFC8", overflow: "hidden", marginBottom: 14 }}>
        {!composerOpen ? (
          <button onClick={() => setComposerOpen(true)}
            style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "16px 20px", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", flexShrink: 0, background: `linear-gradient(135deg, ${C.coralStart} 0%, ${C.coralEnd} 100%)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: "#FFFFFF" }}>
              {clientFirstName ? clientFirstName[0].toUpperCase() : "M"}
            </div>
            <span style={{ fontSize: 14, color: "#9A9080" }}>Note une réflexion, une question…</span>
          </button>
        ) : (
          <div style={{ padding: "20px" }}>
            <textarea autoFocus
              placeholder="Tes réflexions, prises de conscience, questions après la séance..."
              value={comment} onChange={e => setComment(e.target.value)}
              style={{ width: "100%", minHeight: 100, padding: "12px 14px", border: "1px solid #E8DFC8", borderRadius: 12, fontSize: 14, color: C.ink, background: C.cream, resize: "vertical", fontFamily: "inherit", outline: "none", boxSizing: "border-box" }}
            />
            <div style={{ display: "flex", gap: 10, marginTop: 12, justifyContent: "flex-end" }}>
              <button onClick={() => { setComposerOpen(false); setComment(""); }}
                style={{ padding: "9px 18px", borderRadius: 10, border: "1px solid #E8DFC8", background: "none", color: C.inkSoft, fontSize: 13, fontWeight: 500, cursor: "pointer" }}>
                Annuler
              </button>
              <button onClick={addComment} disabled={isDisabled}
                style={{ padding: "9px 20px", borderRadius: 10, border: "none", background: isDisabled ? "#E8DFC8" : `linear-gradient(135deg, ${C.coralStart} 0%, ${C.coralEnd} 100%)`, color: isDisabled ? "#9A9080" : "#FFFFFF", fontSize: 13, fontWeight: 600, cursor: isDisabled ? "not-allowed" : "pointer" }}>
                {saving ? "Envoi…" : "Envoyer"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Notes timeline */}
      {notes.length === 0 ? (
        <p style={{ textAlign: "center", fontSize: 14, color: "#9A9080", padding: "24px 0" }}>
          Aucune note de coaching pour l&apos;instant
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {dateGroups.map(([date, group]) => (
            <div key={date}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <div style={{ flex: 1, height: 1, background: "#E8DFC8" }} />
                <span style={{ fontSize: 12, color: "#9A9080", fontWeight: 500, whiteSpace: "nowrap" }}>{date}</span>
                <div style={{ flex: 1, height: 1, background: "#E8DFC8" }} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {group.map(note => {
                  const isCoach = note.author.role === "COACH";
                  if (isCoach) {
                    return (
                      <div key={note.id} style={{ background: "#FFFFFF", border: "1px solid #E8DFC8", borderLeft: "4px solid #D4A047", borderRadius: 14, overflow: "hidden" }}>
                        <div style={{ flex: 1, padding: "16px 18px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#0E3D34", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#D4A047", flexShrink: 0 }}>
                              {note.author.firstName[0]}
                            </div>
                            <div>
                              <p style={{ fontSize: 13, fontWeight: 700, color: C.goldDeep, margin: 0 }}>Coach {note.author.firstName}</p>
                              <p style={{ fontSize: 11, color: "#9A9080", margin: "2px 0 0" }}>Note de séance</p>
                            </div>
                          </div>
                          <p style={{ fontSize: 14, color: C.ink, lineHeight: 1.6, whiteSpace: "pre-wrap", margin: 0 }}>{note.content}</p>
                        </div>
                      </div>
                    );
                  }
                  return (
                    <div key={note.id} style={{ marginLeft: 32, background: "rgba(255,138,107,0.08)", border: "1px solid rgba(232,82,125,0.15)", borderRadius: 14, padding: "14px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                        <div style={{ width: 26, height: 26, borderRadius: "50%", flexShrink: 0, background: `linear-gradient(135deg, ${C.coralStart} 0%, ${C.coralEnd} 100%)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#FFFFFF" }}>
                          {clientFirstName ? clientFirstName[0].toUpperCase() : "M"}
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 700, color: C.coralEnd }}>Toi</span>
                      </div>
                      <p style={{ fontSize: 14, color: C.ink, lineHeight: 1.6, whiteSpace: "pre-wrap", margin: 0 }}>{note.content}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
