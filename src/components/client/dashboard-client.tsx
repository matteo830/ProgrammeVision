"use client";

import { useState } from "react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

interface DashboardClientProps {
  user: { firstName: string; lastName: string; avatarUrl: string | null };
  profile: {
    objective6months: string | null;
    programEndDate: Date | null;
  } | null;
  progress: {
    globalPercent: number;
    currentPhase: { title: string; order: number };
    phases: Array<{
      order: number;
      title: string;
      isCompleted: boolean;
      isUnlocked: boolean;
      progressPercent: number;
    }>;
  };
  actions: Array<{ id: string; content: string; completed: boolean }>;
  recentGratitude: { content: string; date: Date } | null;
  recentVictory: { content: string; weekStartDate: Date } | null;
  inspiration: { quote: string; author: string | null } | null;
}

export function DashboardClient({
  user,
  profile,
  progress,
  actions: initialActions,
  recentGratitude,
  recentVictory,
  inspiration,
}: DashboardClientProps) {
  const [actions, setActions] = useState(initialActions);
  const [gratitude, setGratitude] = useState("");
  const [victory, setVictory] = useState("");
  const [showGratitudeForm, setShowGratitudeForm] = useState(false);
  const [showVictoryForm, setShowVictoryForm] = useState(false);
  const [savingGratitude, setSavingGratitude] = useState(false);
  const [savingVictory, setSavingVictory] = useState(false);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Bonjour" : hour < 18 ? "Bon après-midi" : "Bonsoir";

  async function completeAction(id: string) {
    await fetch("/api/client/actions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, completed: true }),
    });
    setActions((prev) => prev.filter((a) => a.id !== id));
  }

  async function saveGratitude() {
    if (!gratitude.trim()) return;
    setSavingGratitude(true);
    await fetch("/api/client/gratitude", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: gratitude }),
    });
    setSavingGratitude(false);
    setGratitude("");
    setShowGratitudeForm(false);
  }

  async function saveVictory() {
    if (!victory.trim()) return;
    setSavingVictory(true);
    await fetch("/api/client/victories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: victory }),
    });
    setSavingVictory(false);
    setVictory("");
    setShowVictoryForm(false);
  }

  const navTiles = [
    { href: "/formation",  emoji: "📚", label: "Formation",  bg: "#CFDDC2", color: "#4A6638" },
    { href: "/coaching",   emoji: "💬", label: "Coaching",   bg: "#D8C7E5", color: "#5D3F7A" },
    { href: "/questions",  emoji: "❓", label: "Questions",  bg: "#C2D5E5", color: "#3A5E80" },
    { href: "/victoires",  emoji: "🏆", label: "Victoires",  bg: "#F5C9CE", color: "#A8425C" },
    { href: "/calendrier", emoji: "📅", label: "Calendrier", bg: "#D2E0E8", color: "#3D5C70" },
    { href: "/profil",     emoji: "👤", label: "Profil",     bg: "#F5D5B0", color: "#A6611F" },
  ];

  return (
    <div
      style={{
        maxWidth: 640,
        margin: "0 auto",
        padding: "24px 16px",
        display: "flex",
        flexDirection: "column",
        gap: 16,
        background: "#FAF6EB",
        minHeight: "100vh",
      }}
    >
      {/* ── 1. HEADER ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* Avatar circle */}
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              background: "#0E3D34",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              flexShrink: 0,
            }}
          >
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt=""
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <span style={{ color: "#E8C56F", fontWeight: 700, fontSize: 18 }}>
                {user.firstName[0]}
              </span>
            )}
          </div>
          {/* Greeting text */}
          <div>
            <p style={{ fontSize: 12, color: "#7A7060", margin: 0 }}>
              {greeting}
            </p>
            <h2
              style={{
                fontWeight: 700,
                color: "#1A1208",
                margin: 0,
                fontSize: 16,
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              {user.firstName} <span>✨</span>
            </h2>
          </div>
        </div>
        {/* Bell button */}
        <button
          style={{
            width: 36,
            height: 36,
            borderRadius: 11,
            background: "#fff",
            border: "1px solid #E8DFC8",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
          aria-label="Notifications"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#7A7060"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        </button>
      </div>

      {/* ── 2. OBJECTIVE CARD ── */}
      <div
        style={{
          background: "linear-gradient(160deg, #0E3D34 0%, #07251F 100%)",
          borderRadius: 22,
          padding: "18px 20px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Mountain SVG decoration */}
        <svg
          width="120"
          height="80"
          viewBox="0 0 120 80"
          style={{
            position: "absolute",
            bottom: 0,
            right: 0,
            opacity: 0.3,
            pointerEvents: "none",
          }}
          fill="none"
        >
          <polygon points="60,10 110,80 10,80" fill="#E8C56F" />
          <polygon points="90,30 120,80 60,80" fill="#fff" />
        </svg>
        {/* Label */}
        <p
          style={{
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: "0.08em",
            color: "#E8C56F",
            textTransform: "uppercase",
            margin: "0 0 8px 0",
          }}
        >
          Mon objectif 6 mois
        </p>
        {/* Objective text */}
        <p
          style={{
            fontSize: 15,
            fontWeight: 600,
            color: "#fff",
            margin: 0,
            lineHeight: 1.4,
            position: "relative",
            zIndex: 1,
          }}
        >
          {profile?.objective6months ?? "Définis ton objectif dans ton profil"}
        </p>
        {/* Échéance */}
        {profile?.programEndDate && (
          <p
            style={{
              fontSize: 12,
              color: "rgba(255,255,255,0.6)",
              margin: "8px 0 0 0",
            }}
          >
            Échéance : {formatDate(profile.programEndDate)}
          </p>
        )}
      </div>

      {/* ── 3. PROGRESS CARD ── */}
      <div
        style={{
          background: "#fff",
          borderRadius: 20,
          border: "1px solid #E8DFC8",
          padding: "18px 20px",
        }}
      >
        {/* Title + percentage */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 12,
          }}
        >
          <p style={{ fontWeight: 600, color: "#1A1208", margin: 0, fontSize: 15 }}>
            Ma progression
          </p>
          <span style={{ fontSize: 24, fontWeight: 700, color: "#0E3D34" }}>
            {progress.globalPercent}%
          </span>
        </div>
        {/* Progress bar */}
        <div
          style={{
            height: 10,
            borderRadius: 999,
            background: "#E8DFC8",
            overflow: "hidden",
            marginBottom: 12,
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${progress.globalPercent}%`,
              background: "linear-gradient(90deg, #0E3D34, #2E7D6B)",
              borderRadius: 999,
              transition: "width 0.4s ease",
            }}
          />
        </div>
        {/* Motivation text */}
        <p style={{ fontSize: 11, color: "#7A7060", margin: "0 0 14px 0" }}>
          {progress.globalPercent >= 80
            ? "🔥 Incroyable, tu es presque au bout !"
            : progress.globalPercent >= 50
            ? "🌟 Tu es sur la bonne voie ! Continue comme ça"
            : progress.globalPercent >= 20
            ? "💪 Bon départ, continue ta lancée !"
            : "🚀 C'est parti ! Chaque étape compte"}
        </p>
        {/* Phase timeline */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 0,
            overflowX: "auto",
            paddingBottom: 4,
          }}
        >
          {progress.phases.map((phase, i) => (
            <div
              key={phase.order}
              style={{ display: "flex", alignItems: "center", flexShrink: 0 }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                {/* Circle */}
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 11,
                    fontWeight: 700,
                    ...(phase.isCompleted
                      ? { background: "#0E3D34", color: "#E8C56F" }
                      : phase.order === progress.currentPhase.order
                      ? {
                          background: "#E8C56F",
                          color: "#07251F",
                          boxShadow: "0 0 0 3px #F5DFA0",
                        }
                      : { background: "#E4DDD0", color: "#9E9080" }),
                  }}
                >
                  {phase.isCompleted ? (
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    phase.order
                  )}
                </div>
                {/* Phase label */}
                <span
                  style={{
                    fontSize: 9,
                    marginTop: 3,
                    fontWeight: 500,
                    textAlign: "center",
                    maxWidth: 40,
                    color: phase.isCompleted
                      ? "#0E3D34"
                      : phase.order === progress.currentPhase.order
                      ? "#B8861F"
                      : "#9E9080",
                  }}
                >
                  {phase.title.split(" ")[0]}
                </span>
              </div>
              {/* Connector line */}
              {i < progress.phases.length - 1 && (
                <div
                  style={{
                    height: 2,
                    width: 24,
                    marginBottom: 14,
                    flexShrink: 0,
                    background: progress.phases[i + 1].isUnlocked
                      ? "#2E7D6B"
                      : "#E4DDD0",
                  }}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── 4. ACTIONS CARD ── */}
      <div
        style={{
          background:
            "linear-gradient(135deg, #FF8A6B 0%, #F46B7A 55%, #E8527D 100%)",
          borderRadius: 24,
          padding: "18px 20px",
          color: "#fff",
        }}
      >
        <p style={{ fontWeight: 700, fontSize: 15, margin: "0 0 14px 0" }}>
          🔥 Mes actions à faire
        </p>
        {actions.length === 0 ? (
          <div style={{ textAlign: "center", padding: "12px 0" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginBottom: 8,
              }}
            >
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#0E3D34"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <p style={{ color: "#fff", fontSize: 14, margin: 0 }}>
              Toutes tes actions sont faites! 🎉
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {actions.map((action) => (
              <div
                key={action.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  background: "rgba(255,255,255,0.18)",
                  borderRadius: 14,
                  padding: "12px 14px",
                }}
              >
                <button
                  onClick={() => completeAction(action.id)}
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: "50%",
                    border: "2px solid rgba(255,255,255,0.7)",
                    background: "transparent",
                    cursor: "pointer",
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  aria-label="Marquer comme fait"
                />
                <span
                  style={{ fontSize: 14, color: "#fff", flex: 1, lineHeight: 1.4 }}
                >
                  {action.content}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── 5. GRATITUDE + VICTORY TILES ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {/* Gratitude tile */}
        <div
          style={{ background: "#F5C9CE", borderRadius: 20, padding: "14px 16px" }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginBottom: 8,
            }}
          >
            <span>🤍</span>
            <p
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "#A8425C",
                margin: 0,
              }}
            >
              Gratitude du jour
            </p>
          </div>
          {showGratitudeForm ? (
            <>
              <textarea
                placeholder="Je suis reconnaissant(e) pour..."
                value={gratitude}
                onChange={(e) => setGratitude(e.target.value)}
                autoFocus
                rows={3}
                style={{
                  width: "100%",
                  borderRadius: 10,
                  border: "1px solid rgba(168,66,92,0.3)",
                  padding: "8px 10px",
                  fontSize: 12,
                  fontFamily: "inherit",
                  resize: "vertical",
                  outline: "none",
                  boxSizing: "border-box",
                  background: "rgba(255,255,255,0.6)",
                  color: "#A8425C",
                }}
              />
              <div
                style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}
              >
                <button
                  onClick={saveGratitude}
                  disabled={savingGratitude}
                  style={{
                    background:
                      "linear-gradient(135deg, #FF8A6B 0%, #E8527D 100%)",
                    color: "#fff",
                    border: "none",
                    borderRadius: 8,
                    padding: "6px 14px",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: savingGratitude ? "not-allowed" : "pointer",
                    opacity: savingGratitude ? 0.7 : 1,
                  }}
                >
                  {savingGratitude ? "..." : "Enregistrer"}
                </button>
                <button
                  onClick={() => setShowGratitudeForm(false)}
                  style={{
                    background: "transparent",
                    color: "#A8425C",
                    border: "1px solid rgba(168,66,92,0.4)",
                    borderRadius: 8,
                    padding: "6px 10px",
                    fontSize: 12,
                    cursor: "pointer",
                  }}
                >
                  Annuler
                </button>
              </div>
            </>
          ) : (
            <>
              {recentGratitude ? (
                <p
                  style={{
                    fontSize: 12,
                    color: "#A8425C",
                    margin: "0 0 8px 0",
                    lineHeight: 1.5,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {recentGratitude.content}
                </p>
              ) : (
                <p
                  style={{
                    fontSize: 12,
                    color: "#C47090",
                    fontStyle: "italic",
                    margin: "0 0 8px 0",
                  }}
                >
                  Pas encore écrite...
                </p>
              )}
              <button
                onClick={() => setShowGratitudeForm(true)}
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#A8425C",
                  background: "none",
                  border: "none",
                  padding: 0,
                  cursor: "pointer",
                }}
              >
                Écrire ✍️
              </button>
            </>
          )}
        </div>

        {/* Victory tile */}
        <div
          style={{ background: "#F5D5B0", borderRadius: 20, padding: "14px 16px" }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginBottom: 8,
            }}
          >
            <span>🏆</span>
            <p
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "#A6611F",
                margin: 0,
              }}
            >
              Victoire de la semaine
            </p>
          </div>
          {showVictoryForm ? (
            <>
              <textarea
                placeholder="Cette semaine, j'ai..."
                value={victory}
                onChange={(e) => setVictory(e.target.value)}
                autoFocus
                rows={3}
                style={{
                  width: "100%",
                  borderRadius: 10,
                  border: "1px solid rgba(166,97,31,0.3)",
                  padding: "8px 10px",
                  fontSize: 12,
                  fontFamily: "inherit",
                  resize: "vertical",
                  outline: "none",
                  boxSizing: "border-box",
                  background: "rgba(255,255,255,0.6)",
                  color: "#A6611F",
                }}
              />
              <div
                style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}
              >
                <button
                  onClick={saveVictory}
                  disabled={savingVictory}
                  style={{
                    background:
                      "linear-gradient(135deg, #FF8A6B 0%, #E8527D 100%)",
                    color: "#fff",
                    border: "none",
                    borderRadius: 8,
                    padding: "6px 14px",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: savingVictory ? "not-allowed" : "pointer",
                    opacity: savingVictory ? 0.7 : 1,
                  }}
                >
                  {savingVictory ? "..." : "Enregistrer"}
                </button>
                <button
                  onClick={() => setShowVictoryForm(false)}
                  style={{
                    background: "transparent",
                    color: "#A6611F",
                    border: "1px solid rgba(166,97,31,0.4)",
                    borderRadius: 8,
                    padding: "6px 10px",
                    fontSize: 12,
                    cursor: "pointer",
                  }}
                >
                  Annuler
                </button>
              </div>
            </>
          ) : (
            <>
              {recentVictory ? (
                <p
                  style={{
                    fontSize: 12,
                    color: "#A6611F",
                    margin: "0 0 8px 0",
                    lineHeight: 1.5,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {recentVictory.content}
                </p>
              ) : (
                <p
                  style={{
                    fontSize: 12,
                    color: "#C4883A",
                    fontStyle: "italic",
                    margin: "0 0 8px 0",
                  }}
                >
                  Célèbre tes avancées !
                </p>
              )}
              <button
                onClick={() => setShowVictoryForm(true)}
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#A6611F",
                  background: "none",
                  border: "none",
                  padding: 0,
                  cursor: "pointer",
                }}
              >
                Écrire ✨
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── 6. NAV TILES GRID (3x2) ── */}
      <div
        style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}
      >
        {navTiles.map((item) => (
          <Link key={item.href} href={item.href} style={{ textDecoration: "none" }}>
            <div
              style={{
                background: item.bg,
                borderRadius: 20,
                padding: 14,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 6,
                textAlign: "center",
                cursor: "pointer",
              }}
            >
              <span style={{ fontSize: 24 }}>{item.emoji}</span>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: item.color,
                  lineHeight: 1.3,
                }}
              >
                {item.label}
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* ── 7. INSPIRATION BLOCK ── */}
      {inspiration && (
        <div
          style={{
            background: "#E8EFEC",
            borderRadius: 18,
            border: "1px solid #D7E5DE",
            padding: "18px 20px",
          }}
        >
          {/* Big quote mark */}
          <svg
            width="32"
            height="28"
            viewBox="0 0 32 28"
            fill="none"
            style={{ marginBottom: 8, display: "block" }}
          >
            <text
              x="0"
              y="26"
              fontSize="40"
              fill="#3FA88E"
              fontFamily="Georgia, serif"
            >
              "
            </text>
          </svg>
          <p
            className="font-serif"
            style={{
              fontSize: 15,
              fontStyle: "italic",
              color: "#1A5448",
              lineHeight: 1.6,
              margin: "0 0 10px 0",
            }}
          >
            {inspiration.quote}
          </p>
          {inspiration.author && (
            <p
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "#1A5448",
                margin: 0,
              }}
            >
              — {inspiration.author}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
