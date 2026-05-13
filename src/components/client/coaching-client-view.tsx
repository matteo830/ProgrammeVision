"use client";

import { useState } from "react";
import { formatDate } from "@/lib/utils";

interface Note {
  id: string;
  content: string;
  visibility: string;
  createdAt: Date;
  author: { firstName: string; lastName: string; role: string };
}

export function CoachingClientView({
  initialNotes,
  userId,
}: {
  initialNotes: Note[];
  userId: string;
}) {
  const [notes, setNotes] = useState(initialNotes);
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);
  const [composerOpen, setComposerOpen] = useState(false);

  async function addComment() {
    if (!comment.trim()) return;
    setSaving(true);

    const res = await fetch("/api/coaching/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: comment,
        clientId: userId,
        visibility: "CLIENT_VISIBLE",
      }),
    });

    const note = await res.json();
    setNotes([note, ...notes]);
    setComment("");
    setSaving(false);
    setComposerOpen(false);
  }

  const coach = notes.find((n) => n.author.role === "COACH")?.author;

  // Group notes by date
  const grouped: Record<string, Note[]> = {};
  for (const note of notes) {
    const key = formatDate(note.createdAt);
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(note);
  }
  const dateGroups = Object.entries(grouped);

  const isDisabled = saving || !comment.trim();

  return (
    <div
      style={{
        maxWidth: 640,
        margin: "0 auto",
        padding: "24px 16px",
        display: "flex",
        flexDirection: "column",
        gap: 20,
      }}
    >
      {/* Hero card */}
      <div
        style={{
          background: "linear-gradient(160deg, #0E3D34 0%, #07251F 100%)",
          borderRadius: 20,
          padding: "28px 24px",
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
        {/* Coach identity */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: "50%",
              background: "#D4A047",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22,
              fontWeight: 700,
              color: "#0E3D34",
              flexShrink: 0,
            }}
          >
            {coach ? coach.firstName[0] : "C"}
          </div>
          <div>
            <p
              style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.1em",
                color: "#E8C56F",
                textTransform: "uppercase",
                marginBottom: 4,
                margin: 0,
              }}
            >
              TON COACH VISION
            </p>
            <p
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: "#FFFFFF",
                margin: "4px 0 0",
              }}
            >
              {coach ? `${coach.firstName} ${coach.lastName}` : "Ton coach"}
            </p>
          </div>
        </div>

        {/* Stat grid */}
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
        >
          <div
            style={{
              background: "rgba(0,0,0,0.25)",
              borderRadius: 12,
              padding: "14px 16px",
            }}
          >
            <p
              style={{
                fontSize: 11,
                color: "#9A9080",
                marginBottom: 6,
                fontWeight: 500,
                margin: "0 0 6px",
              }}
            >
              Séances faites
            </p>
            <p
              style={{
                fontSize: 28,
                fontWeight: 700,
                color: "#FFFFFF",
                margin: 0,
              }}
            >
              {notes.filter((n) => n.author.role === "COACH").length}
            </p>
          </div>
          <div
            style={{
              background: "rgba(0,0,0,0.25)",
              borderRadius: 12,
              padding: "14px 16px",
            }}
          >
            <p
              style={{
                fontSize: 11,
                color: "#9A9080",
                marginBottom: 6,
                fontWeight: 500,
                margin: "0 0 6px",
              }}
            >
              Prochaine séance
            </p>
            <p
              style={{
                fontSize: 15,
                fontWeight: 600,
                color: "#FFFFFF",
                margin: 0,
              }}
            >
              —
            </p>
          </div>
        </div>
      </div>

      {/* Note composer */}
      <div
        style={{
          background: "#FFFFFF",
          borderRadius: 16,
          border: "1px solid #E8DFC8",
          overflow: "hidden",
        }}
      >
        {!composerOpen ? (
          <button
            onClick={() => setComposerOpen(true)}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "16px 20px",
              background: "none",
              border: "none",
              cursor: "pointer",
              textAlign: "left",
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                flexShrink: 0,
                background:
                  "linear-gradient(135deg, #FF8A6B 0%, #E8527D 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 14,
                fontWeight: 700,
                color: "#FFFFFF",
              }}
            >
              M
            </div>
            <span style={{ fontSize: 14, color: "#9A9080" }}>
              Note une réflexion, une question…
            </span>
          </button>
        ) : (
          <div style={{ padding: "20px" }}>
            <textarea
              autoFocus
              placeholder="Tes réflexions, prises de conscience, questions après la séance..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              style={{
                width: "100%",
                minHeight: 100,
                padding: "12px 14px",
                border: "1px solid #E8DFC8",
                borderRadius: 12,
                fontSize: 14,
                color: "#1A1714",
                background: "#FAF6EB",
                resize: "vertical",
                fontFamily: "inherit",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
            <div
              style={{
                display: "flex",
                gap: 10,
                marginTop: 12,
                justifyContent: "flex-end",
              }}
            >
              <button
                onClick={() => {
                  setComposerOpen(false);
                  setComment("");
                }}
                style={{
                  padding: "9px 18px",
                  borderRadius: 10,
                  border: "1px solid #E8DFC8",
                  background: "none",
                  color: "#5A5247",
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                Annuler
              </button>
              <button
                onClick={addComment}
                disabled={isDisabled}
                style={{
                  padding: "9px 20px",
                  borderRadius: 10,
                  border: "none",
                  background: isDisabled
                    ? "#E8DFC8"
                    : "linear-gradient(135deg, #FF8A6B 0%, #E8527D 100%)",
                  color: isDisabled ? "#9A9080" : "#FFFFFF",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: isDisabled ? "not-allowed" : "pointer",
                  transition: "opacity 0.15s",
                }}
              >
                {saving ? "Envoi…" : "Envoyer"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Notes timeline */}
      {notes.length === 0 ? (
        <p
          style={{
            textAlign: "center",
            fontSize: 14,
            color: "#9A9080",
            padding: "32px 0",
          }}
        >
          Aucune note de coaching pour l&apos;instant
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {dateGroups.map(([date, group]) => (
            <div key={date}>
              {/* Date separator */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 14,
                }}
              >
                <div style={{ flex: 1, height: 1, background: "#E8DFC8" }} />
                <span
                  style={{
                    fontSize: 12,
                    color: "#9A9080",
                    fontWeight: 500,
                    whiteSpace: "nowrap",
                  }}
                >
                  {date}
                </span>
                <div style={{ flex: 1, height: 1, background: "#E8DFC8" }} />
              </div>

              <div
                style={{ display: "flex", flexDirection: "column", gap: 10 }}
              >
                {group.map((note) => {
                  const isCoach = note.author.role === "COACH";

                  if (isCoach) {
                    return (
                      <div
                        key={note.id}
                        style={{
                          background: "#FFFFFF",
                          border: "1px solid #E8DFC8",
                          borderLeft: "4px solid #D4A047",
                          borderRadius: 14,
                          overflow: "hidden",
                        }}
                      >
                        <div style={{ flex: 1, padding: "16px 18px" }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                              marginBottom: 10,
                            }}
                          >
                            <div
                              style={{
                                width: 32,
                                height: 32,
                                borderRadius: "50%",
                                background: "#0E3D34",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 13,
                                fontWeight: 700,
                                color: "#D4A047",
                                flexShrink: 0,
                              }}
                            >
                              {note.author.firstName[0]}
                            </div>
                            <div>
                              <p
                                style={{
                                  fontSize: 13,
                                  fontWeight: 700,
                                  color: "#B8862E",
                                  margin: 0,
                                }}
                              >
                                Coach {note.author.firstName}
                              </p>
                              <p
                                style={{
                                  fontSize: 11,
                                  color: "#9A9080",
                                  margin: "2px 0 0",
                                }}
                              >
                                Note de séance
                              </p>
                            </div>
                          </div>
                          <p
                            style={{
                              fontSize: 14,
                              color: "#1A1714",
                              lineHeight: 1.6,
                              whiteSpace: "pre-wrap",
                              margin: 0,
                            }}
                          >
                            {note.content}
                          </p>
                        </div>
                      </div>
                    );
                  }

                  // Client note
                  return (
                    <div
                      key={note.id}
                      style={{
                        marginLeft: 32,
                        background: "rgba(255, 138, 107, 0.08)",
                        border: "1px solid rgba(232, 82, 125, 0.15)",
                        borderRadius: 14,
                        padding: "14px 16px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          marginBottom: 8,
                        }}
                      >
                        <div
                          style={{
                            width: 26,
                            height: 26,
                            borderRadius: "50%",
                            flexShrink: 0,
                            background:
                              "linear-gradient(135deg, #FF8A6B 0%, #E8527D 100%)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 11,
                            fontWeight: 700,
                            color: "#FFFFFF",
                          }}
                        >
                          M
                        </div>
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 700,
                            color: "#E8527D",
                          }}
                        >
                          Toi
                        </span>
                      </div>
                      <p
                        style={{
                          fontSize: 14,
                          color: "#1A1714",
                          lineHeight: 1.6,
                          whiteSpace: "pre-wrap",
                          margin: 0,
                        }}
                      >
                        {note.content}
                      </p>
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
