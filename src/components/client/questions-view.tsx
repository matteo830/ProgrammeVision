"use client";

import { useState } from "react";
import { formatDate } from "@/lib/utils";

const CATEGORIES = ["Mindset", "Business", "Tunnel", "Technique", "Autre"];

interface Reply {
  id: string;
  content: string;
  createdAt: Date;
  author: { firstName: string; lastName: string; role: string };
}

interface Question {
  id: string;
  category: string;
  content: string;
  status: string;
  createdAt: Date;
  replies: Reply[];
}

export function QuestionsView({ initialQuestions }: { initialQuestions: Question[] }) {
  const [questions, setQuestions] = useState(initialQuestions);
  const [showForm, setShowForm] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [form, setForm] = useState({ category: CATEGORIES[0], title: "", content: "" });
  const [submitting, setSubmitting] = useState(false);

  async function submitQuestion() {
    if (!form.content.trim()) return;
    setSubmitting(true);

    const res = await fetch("/api/questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category: form.category, content: form.content }),
    });

    const question = await res.json();
    setQuestions([question, ...questions]);
    setForm({ category: CATEGORIES[0], title: "", content: "" });
    setShowForm(false);
    setSubmitting(false);
  }

  const openCount = questions.filter((q) => q.status !== "ANSWERED").length;
  const answeredCount = questions.filter((q) => q.status === "ANSWERED").length;
  const submitDisabled = submitting || !form.content.trim();

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
      {/* Stats bar */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <span
          style={{
            padding: "6px 14px",
            borderRadius: 20,
            background: "rgba(255, 138, 107, 0.15)",
            color: "#E8527D",
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          {openCount} Ouvertes
        </span>
        <span
          style={{
            padding: "6px 14px",
            borderRadius: 20,
            background: "#E8EFEC",
            color: "#1A5448",
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          {answeredCount} Répondues
        </span>
        <span
          style={{
            padding: "6px 14px",
            borderRadius: 20,
            background: "#F0E8D4",
            color: "#5A5247",
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          {questions.length} Total
        </span>
      </div>

      {/* New question button */}
      <button
        onClick={() => setShowForm(!showForm)}
        style={{
          width: "100%",
          padding: "14px",
          borderRadius: 14,
          border: "none",
          background:
            "linear-gradient(135deg, #FF8A6B 0%, #F46B7A 50%, #E8527D 100%)",
          color: "#FFFFFF",
          fontSize: 15,
          fontWeight: 700,
          cursor: "pointer",
          letterSpacing: "0.01em",
        }}
      >
        Poser une question
      </button>

      {/* New question form */}
      {showForm && (
        <div
          style={{
            background: "#FFFFFF",
            border: "1px solid #E8DFC8",
            borderRadius: 16,
            padding: "20px",
          }}
        >
          <p
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: "#1A1714",
              margin: "0 0 16px",
            }}
          >
            Nouvelle question
          </p>

          {/* Category pills */}
          <div style={{ marginBottom: 16 }}>
            <p
              style={{
                fontSize: 12,
                color: "#5A5247",
                fontWeight: 500,
                margin: "0 0 8px",
              }}
            >
              Catégorie
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setForm({ ...form, category: cat })}
                  style={{
                    padding: "6px 14px",
                    borderRadius: 20,
                    fontSize: 13,
                    fontWeight: 500,
                    border:
                      form.category === cat ? "none" : "1px solid #E8DFC8",
                    background:
                      form.category === cat
                        ? "linear-gradient(135deg, #FF8A6B 0%, #E8527D 100%)"
                        : "transparent",
                    color: form.category === cat ? "#FFFFFF" : "#5A5247",
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Title input */}
          <div style={{ marginBottom: 12 }}>
            <p
              style={{
                fontSize: 12,
                color: "#5A5247",
                fontWeight: 500,
                margin: "0 0 6px",
              }}
            >
              Titre
            </p>
            <input
              type="text"
              placeholder="Résumé de ta question..."
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              style={{
                width: "100%",
                padding: "10px 14px",
                border: "1px solid #E8DFC8",
                borderRadius: 10,
                fontSize: 14,
                color: "#1A1714",
                background: "#FAF6EB",
                outline: "none",
                boxSizing: "border-box",
                fontFamily: "inherit",
              }}
            />
          </div>

          {/* Content textarea */}
          <div style={{ marginBottom: 16 }}>
            <p
              style={{
                fontSize: 12,
                color: "#5A5247",
                fontWeight: 500,
                margin: "0 0 6px",
              }}
            >
              Ta question
            </p>
            <textarea
              autoFocus
              placeholder="Décris ta question en détail..."
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              style={{
                width: "100%",
                minHeight: 100,
                padding: "10px 14px",
                border: "1px solid #E8DFC8",
                borderRadius: 10,
                fontSize: 14,
                color: "#1A1714",
                background: "#FAF6EB",
                resize: "vertical",
                fontFamily: "inherit",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div
            style={{
              display: "flex",
              gap: 10,
              justifyContent: "flex-end",
            }}
          >
            <button
              onClick={() => setShowForm(false)}
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
              onClick={submitQuestion}
              disabled={submitDisabled}
              style={{
                padding: "9px 20px",
                borderRadius: 10,
                border: "none",
                background: submitDisabled
                  ? "#E8DFC8"
                  : "linear-gradient(135deg, #FF8A6B 0%, #E8527D 100%)",
                color: submitDisabled ? "#9A9080" : "#FFFFFF",
                fontSize: 13,
                fontWeight: 600,
                cursor: submitDisabled ? "not-allowed" : "pointer",
              }}
            >
              {submitting ? "Envoi…" : "Envoyer"}
            </button>
          </div>
        </div>
      )}

      {/* Questions list */}
      {questions.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <p style={{ color: "#9A9080", fontSize: 14, margin: 0 }}>
            Aucune question posée pour l&apos;instant
          </p>
          <p style={{ color: "#9A9080", fontSize: 12, marginTop: 4 }}>
            N&apos;hésite pas à poser tes questions à ton coach !
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {questions.map((q) => {
            const isAnswered = q.status === "ANSWERED";
            const isExpanded = expanded === q.id;

            return (
              <div
                key={q.id}
                style={{
                  background: "#FFFFFF",
                  border: "1px solid #E8DFC8",
                  borderLeft: isAnswered
                    ? "4px solid #3FA88E"
                    : "4px solid #FF8A6B",
                  borderRadius: 14,
                  overflow: "hidden",
                }}
              >
                <button
                  onClick={() => setExpanded(isExpanded ? null : q.id)}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: "16px 18px",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    display: "block",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 12,
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          marginBottom: 6,
                          flexWrap: "wrap",
                        }}
                      >
                        {/* Status badge */}
                        <span
                          style={{
                            padding: "3px 10px",
                            borderRadius: 20,
                            fontSize: 11,
                            fontWeight: 700,
                            letterSpacing: "0.05em",
                            textTransform: "uppercase" as const,
                            background: isAnswered
                              ? "#E8EFEC"
                              : "rgba(255, 138, 107, 0.15)",
                            color: isAnswered ? "#1A5448" : "#E8527D",
                          }}
                        >
                          {isAnswered ? "Répondue" : "Ouverte"}
                        </span>
                        {/* Category */}
                        <span
                          style={{
                            padding: "3px 10px",
                            borderRadius: 20,
                            fontSize: 11,
                            fontWeight: 500,
                            background: "#F0E8D4",
                            color: "#5A5247",
                          }}
                        >
                          {q.category}
                        </span>
                        {q.replies.length > 0 && (
                          <span style={{ fontSize: 11, color: "#9A9080" }}>
                            {q.replies.length} réponse
                            {q.replies.length > 1 ? "s" : ""}
                          </span>
                        )}
                      </div>
                      <p
                        style={{
                          fontSize: 14,
                          fontWeight: 600,
                          color: "#1A1714",
                          margin: "0 0 4px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          display: "-webkit-box",
                          WebkitLineClamp: isExpanded ? undefined : 2,
                          WebkitBoxOrient: "vertical" as const,
                        }}
                      >
                        {q.content}
                      </p>
                      <p style={{ fontSize: 11, color: "#9A9080", margin: 0 }}>
                        {formatDate(q.createdAt)}
                      </p>
                    </div>
                    <span
                      style={{
                        color: "#9A9080",
                        fontSize: 18,
                        flexShrink: 0,
                        marginTop: 2,
                      }}
                    >
                      {isExpanded ? "▲" : "▼"}
                    </span>
                  </div>
                </button>

                {/* Expanded: replies */}
                {isExpanded && q.replies.length > 0 && (
                  <div
                    style={{
                      borderTop: "1px solid #F0E8D4",
                      padding: "14px 18px",
                      display: "flex",
                      flexDirection: "column",
                      gap: 10,
                    }}
                  >
                    {q.replies.map((reply) => {
                      const isCoachReply = reply.author.role === "COACH";
                      return (
                        <div
                          key={reply.id}
                          style={{
                            background: isCoachReply ? "#FFFFFF" : "#FAF6EB",
                            border: "1px solid #E8DFC8",
                            borderLeft: isCoachReply
                              ? "3px solid #D4A047"
                              : "none",
                            borderRadius: 10,
                            padding: "12px 14px",
                          }}
                        >
                          {isCoachReply && (
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
                                  width: 28,
                                  height: 28,
                                  borderRadius: "50%",
                                  background: "#0E3D34",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontSize: 12,
                                  fontWeight: 700,
                                  color: "#D4A047",
                                  flexShrink: 0,
                                }}
                              >
                                {reply.author.firstName[0]}
                              </div>
                              <div>
                                <p
                                  style={{
                                    fontSize: 12,
                                    fontWeight: 700,
                                    color: "#B8862E",
                                    margin: 0,
                                  }}
                                >
                                  Coach {reply.author.firstName}
                                </p>
                                <p
                                  style={{
                                    fontSize: 11,
                                    color: "#9A9080",
                                    margin: "2px 0 0",
                                  }}
                                >
                                  {formatDate(reply.createdAt)}
                                </p>
                              </div>
                            </div>
                          )}
                          {!isCoachReply && (
                            <p
                              style={{
                                fontSize: 11,
                                fontWeight: 600,
                                color: "#9A9080",
                                margin: "0 0 4px",
                              }}
                            >
                              Toi · {formatDate(reply.createdAt)}
                            </p>
                          )}
                          <p
                            style={{
                              fontSize: 14,
                              color: "#1A1714",
                              lineHeight: 1.6,
                              margin: 0,
                            }}
                          >
                            {reply.content}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
