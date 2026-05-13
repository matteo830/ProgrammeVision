"use client";

import { useState } from "react";
import { formatDate, formatDateShort } from "@/lib/utils";

interface Victory {
  id: string;
  content: string;
  weekStartDate: Date;
  createdAt: Date;
}

interface VictoiresViewProps {
  victories: Victory[];
  gratitudes?: Array<{ id: string; content: string; date: Date }>;
}

export function VictoiresView({ victories: initialVictories }: VictoiresViewProps) {
  const [victories, setVictories] = useState(initialVictories);
  const [showForm, setShowForm] = useState(false);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submitVictory() {
    if (!content.trim()) return;
    setSubmitting(true);

    const res = await fetch("/api/victories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });

    const victory = await res.json();
    setVictories([victory, ...victories]);
    setContent("");
    setShowForm(false);
    setSubmitting(false);
  }

  const submitDisabled = submitting || !content.trim();

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
      {/* Hero tile */}
      <div
        style={{
          background: "#F5D5B0",
          borderRadius: 20,
          padding: "28px 24px",
          display: "flex",
          alignItems: "center",
          gap: 20,
        }}
      >
        <span style={{ fontSize: 48, lineHeight: 1, flexShrink: 0 }}>🏆</span>
        <div>
          <p
            style={{
              fontSize: 22,
              fontWeight: 800,
              color: "#A6611F",
              margin: "0 0 4px",
            }}
          >
            Mes victoires
          </p>
          <p style={{ fontSize: 14, color: "#A6611F", margin: 0, opacity: 0.75 }}>
            {victories.length === 0
              ? "Célèbre tes premières victoires !"
              : `${victories.length} victoire${victories.length > 1 ? "s" : ""} célébrée${victories.length > 1 ? "s" : ""}`}
          </p>
        </div>
      </div>

      {/* New victory button */}
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
        Célébrer une victoire
      </button>

      {/* New victory form */}
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
              margin: "0 0 14px",
            }}
          >
            Nouvelle victoire 🏆
          </p>
          <textarea
            autoFocus
            placeholder="Décris ta victoire, grande ou petite, elle mérite d'être célébrée..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
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
              marginBottom: 14,
            }}
          />
          <div
            style={{
              display: "flex",
              gap: 10,
              justifyContent: "flex-end",
            }}
          >
            <button
              onClick={() => {
                setShowForm(false);
                setContent("");
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
              onClick={submitVictory}
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
                transition: "opacity 0.15s",
              }}
            >
              {submitting ? "Envoi…" : "Célébrer !"}
            </button>
          </div>
        </div>
      )}

      {/* Victories list */}
      {victories.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <p style={{ color: "#9A9080", fontSize: 14, margin: 0 }}>
            Tes victoires s&apos;afficheront ici
          </p>
          <p style={{ color: "#9A9080", fontSize: 12, marginTop: 4 }}>
            Chaque progrès mérite d&apos;être célébré !
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {victories.map((v) => (
            <div
              key={v.id}
              style={{
                background: "#FFFFFF",
                border: "1px solid #E8DFC8",
                borderRadius: 14,
                padding: "16px 18px",
                display: "flex",
                alignItems: "flex-start",
                gap: 14,
              }}
            >
              {/* Trophy in peach circle */}
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  background: "#F5D5B0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 22,
                  flexShrink: 0,
                }}
              >
                🏆
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    fontSize: 11,
                    color: "#9A9080",
                    fontWeight: 500,
                    margin: "0 0 4px",
                  }}
                >
                  Semaine du {formatDateShort(v.weekStartDate)}
                </p>
                <p
                  style={{
                    fontSize: 14,
                    color: "#1A1714",
                    lineHeight: 1.6,
                    fontWeight: 500,
                    margin: "0 0 8px",
                  }}
                >
                  {v.content}
                </p>
                {/* Date chip */}
                <span
                  style={{
                    display: "inline-block",
                    padding: "3px 10px",
                    borderRadius: 20,
                    background: "#F0E8D4",
                    color: "#5A5247",
                    fontSize: 11,
                    fontWeight: 500,
                  }}
                >
                  {formatDate(v.createdAt)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
