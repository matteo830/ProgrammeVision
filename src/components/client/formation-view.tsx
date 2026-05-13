"use client";

import { useState } from "react";

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  greenDeep: "#0E3D34",
  greenDeeper: "#07251F",
  green3: "#3FA88E",
  gold: "#D4A047",
  goldLight: "#E8C56F",
  coralStart: "#FF8A6B",
  coralMid: "#F46B7A",
  coralEnd: "#E8527D",
  ink: "#1A1714",
  inkSoft: "#5A5247",
  inkMute: "#9A9080",
  border: "#E8DFC8",
  borderSoft: "#F0E8D4",
  cream: "#FAF6EB",
  white: "#FFFFFF",
};

// ─── Types (unchanged) ────────────────────────────────────────────────────────
interface ModuleWithProgress {
  id: string;
  title: string;
  description: string | null;
  videoUrl: string | null;
  exerciseUrl: string | null;
  progress: {
    videoWatched: boolean;
    exerciseSubmitted: boolean;
    coachValidated: boolean;
    coachComment: string | null;
    realImplementation: boolean;
  } | null;
}

interface PhaseWithProgress {
  id: string;
  order: number;
  title: string;
  description: string | null;
  progressPercent: number;
  isCompleted: boolean;
  isUnlocked: boolean;
  modules: ModuleWithProgress[];
}

interface FormationViewProps {
  progress: {
    globalPercent: number;
    phases: PhaseWithProgress[];
    currentPhase: { order: number };
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function totalModules(phases: PhaseWithProgress[]) {
  return phases.reduce((s, p) => s + p.modules.length, 0);
}

function validatedModules(phases: PhaseWithProgress[]) {
  return phases.reduce(
    (s, p) =>
      s + p.modules.filter((m) => m.progress?.coachValidated).length,
    0
  );
}

function findCurrentModule(phases: PhaseWithProgress[]) {
  for (const phase of phases) {
    if (!phase.isUnlocked) continue;
    for (const mod of phase.modules) {
      if (!mod.progress?.coachValidated) return { phase, mod };
    }
  }
  return null;
}

// ─── Mountain SVG decoration ──────────────────────────────────────────────────
function MountainDecoration() {
  return (
    <svg
      width="160"
      height="100"
      viewBox="0 0 160 100"
      fill="none"
      style={{ position: "absolute", bottom: 0, right: 0, opacity: 0.3, pointerEvents: "none" }}
    >
      <polygon points="80,10 160,100 0,100" fill="white" />
      <polygon points="120,35 160,100 80,100" fill="white" opacity="0.5" />
      <polygon points="30,55 80,100 0,100" fill="white" opacity="0.4" />
    </svg>
  );
}

// ─── Progress hero card ───────────────────────────────────────────────────────
function ProgressHero({
  globalPercent,
  phases,
}: {
  globalPercent: number;
  phases: PhaseWithProgress[];
}) {
  const validated = validatedModules(phases);
  const total = totalModules(phases);
  const currentPhaseOrder = phases.find((p) => !p.isCompleted && p.isUnlocked)?.order ?? phases.length;

  return (
    <div
      style={{
        position: "relative",
        overflow: "hidden",
        borderRadius: 20,
        background: `linear-gradient(160deg, ${C.greenDeep} 0%, ${C.greenDeeper} 100%)`,
        padding: "28px 28px 24px",
      }}
    >
      <MountainDecoration />
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: C.goldLight,
          marginBottom: 8,
        }}
      >
        Avancement global
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 13,
              color: "rgba(255,255,255,0.67)",
              marginBottom: 4,
            }}
          >
            {validated} module{validated !== 1 ? "s" : ""} validé{validated !== 1 ? "s" : ""} sur {total}
          </div>
          <div
            style={{
              fontSize: 13,
              color: "rgba(255,255,255,0.67)",
            }}
          >
            Phase {currentPhaseOrder}/3
          </div>
        </div>
        <div
          style={{
            fontSize: 52,
            fontWeight: 800,
            color: C.white,
            lineHeight: 1,
            letterSpacing: "-0.02em",
          }}
        >
          {globalPercent}%
        </div>
      </div>

      {/* Progress bar */}
      <div
        style={{
          marginTop: 20,
          height: 4,
          borderRadius: 99,
          background: "rgba(255,255,255,0.12)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${globalPercent}%`,
            borderRadius: 99,
            background: `linear-gradient(90deg, ${C.gold} 0%, ${C.goldLight} 100%)`,
            transition: "width 0.6s ease",
          }}
        />
      </div>
    </div>
  );
}

// ─── Step pill ────────────────────────────────────────────────────────────────
function StepPill({ label, done }: { label: string; done: boolean }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "5px 12px",
        borderRadius: 99,
        fontSize: 12,
        fontWeight: done ? 600 : 400,
        background: done ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.18)",
        color: done ? C.coralEnd : "rgba(255,255,255,0.87)",
        border: done ? "none" : "1px solid rgba(255,255,255,0.25)",
      }}
    >
      {done && (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M2 6l3 3 5-5" stroke={C.coralEnd} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
      {label}
    </span>
  );
}

// ─── Current module card ──────────────────────────────────────────────────────
function CurrentModuleCard({
  phases,
  onContinue,
}: {
  phases: PhaseWithProgress[];
  onContinue: (phaseOrder: number) => void;
}) {
  const current = findCurrentModule(phases);
  if (!current) return null;

  const { phase, mod } = current;
  const p = mod.progress;
  const videoWatched = p?.videoWatched ?? false;
  const exerciseSubmitted = p?.exerciseSubmitted ?? false;
  const coachValidated = p?.coachValidated ?? false;

  return (
    <div
      style={{
        borderRadius: 20,
        background: `linear-gradient(135deg, ${C.coralStart} 0%, ${C.coralMid} 55%, ${C.coralEnd} 100%)`,
        padding: "24px 24px 22px",
        color: C.white,
      }}
    >
      {/* EN COURS badge */}
      <div style={{ marginBottom: 12 }}>
        <span
          style={{
            display: "inline-block",
            padding: "3px 10px",
            borderRadius: 99,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            background: "rgba(255,255,255,0.22)",
            color: C.white,
            border: "1px solid rgba(255,255,255,0.35)",
          }}
        >
          EN COURS
        </span>
      </div>

      <div
        style={{ fontSize: 12, color: "rgba(255,255,255,0.75)", marginBottom: 6 }}
      >
        Phase {phase.order} · Module {phase.modules.indexOf(mod) + 1}
      </div>

      <div
        style={{
          fontSize: 20,
          fontWeight: 700,
          color: C.white,
          marginBottom: 8,
          lineHeight: 1.25,
        }}
      >
        {mod.title}
      </div>

      {mod.description && (
        <div
          style={{
            fontSize: 13,
            color: "rgba(255,255,255,0.87)",
            marginBottom: 18,
            lineHeight: 1.5,
          }}
        >
          {mod.description}
        </div>
      )}

      {/* Step pills */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
        <StepPill label="Vidéo vue" done={videoWatched} />
        <StepPill label="Exercice" done={exerciseSubmitted} />
        <StepPill label="Validation" done={coachValidated} />
      </div>

      {/* CTA */}
      <button
        onClick={() => onContinue(phase.order)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "11px 22px",
          borderRadius: 99,
          background: C.white,
          color: C.coralEnd,
          fontWeight: 700,
          fontSize: 14,
          border: "none",
          cursor: "pointer",
          boxShadow: "0 2px 12px rgba(0,0,0,0.12)",
        }}
      >
        Continuer le module
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M3 8h10M9 4l4 4-4 4" stroke={C.coralEnd} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
}

// ─── Module row ───────────────────────────────────────────────────────────────
function ModuleRow({
  mod,
  index,
  isCurrent,
  localProgress,
  updating,
  onUpdateProgress,
}: {
  mod: ModuleWithProgress;
  index: number;
  isCurrent: boolean;
  localProgress: Record<string, { videoWatched: boolean; exerciseSubmitted: boolean; realImplementation: boolean }>;
  updating: string | null;
  onUpdateProgress: (id: string, field: string, value: boolean) => Promise<void>;
}) {
  const local = localProgress[mod.id];
  const p = mod.progress;
  const videoWatched = local?.videoWatched ?? p?.videoWatched ?? false;
  const exerciseSubmitted = local?.exerciseSubmitted ?? p?.exerciseSubmitted ?? false;
  const coachValidated = p?.coachValidated ?? false;
  const pendingCoach = exerciseSubmitted && !coachValidated;

  return (
    <div
      style={{
        display: "flex",
        gap: 14,
        padding: "14px 0",
        borderBottom: `1px solid ${C.borderSoft}`,
      }}
    >
      {/* Circle indicator */}
      <div style={{ flexShrink: 0, marginTop: 2 }}>
        {coachValidated ? (
          <div
            style={{
              width: 26,
              height: 26,
              borderRadius: "50%",
              background: C.greenDeep,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="M2 6.5l3.5 3.5 5.5-6" stroke={C.goldLight} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        ) : isCurrent ? (
          <div
            style={{
              width: 26,
              height: 26,
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${C.coralStart}, ${C.coralEnd})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{ width: 8, height: 8, borderRadius: "50%", background: C.white }}
            />
          </div>
        ) : (
          <div
            style={{
              width: 26,
              height: 26,
              borderRadius: "50%",
              border: `2px solid ${C.border}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span style={{ fontSize: 10, color: C.inkMute, fontWeight: 600 }}>{index + 1}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8,
            flexWrap: "wrap",
            marginBottom: 6,
          }}
        >
          <span
            style={{
              fontSize: 14,
              fontWeight: isCurrent ? 700 : 500,
              color: isCurrent ? C.coralEnd : C.ink,
              lineHeight: 1.3,
            }}
          >
            {mod.title}
          </span>

          <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
            {pendingCoach && (
              <span
                style={{
                  padding: "2px 9px",
                  borderRadius: 99,
                  fontSize: 10,
                  fontWeight: 600,
                  background: "rgba(212,160,71,0.15)",
                  color: C.gold,
                  border: `1px solid ${C.gold}40`,
                }}
              >
                En attente coach
              </span>
            )}
            {isCurrent && (
              <span
                style={{
                  padding: "3px 11px",
                  borderRadius: 99,
                  fontSize: 11,
                  fontWeight: 700,
                  background: `linear-gradient(135deg, ${C.coralStart}, ${C.coralEnd})`,
                  color: C.white,
                  cursor: "pointer",
                }}
              >
                Reprendre
              </span>
            )}
          </div>
        </div>

        {/* Step toggles */}
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          {/* Video */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <StepDot done={videoWatched} />
            {mod.videoUrl ? (
              <a
                href={mod.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: 12, color: C.inkSoft, textDecoration: "none" }}
              >
                Vidéo
              </a>
            ) : (
              <span style={{ fontSize: 12, color: C.inkMute, fontStyle: "italic" }}>Vidéo à venir</span>
            )}
            {mod.videoUrl && !videoWatched && (
              <button
                onClick={() => onUpdateProgress(mod.id, "videoWatched", true)}
                disabled={updating === mod.id + "videoWatched"}
                style={{
                  fontSize: 10,
                  color: C.inkMute,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  textDecoration: "underline",
                  padding: 0,
                }}
              >
                Marquer vu
              </button>
            )}
          </div>

          {/* Exercise */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <StepDot done={exerciseSubmitted} />
            {mod.exerciseUrl ? (
              <a
                href={mod.exerciseUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: 12, color: C.inkSoft, textDecoration: "none" }}
              >
                Exercice
              </a>
            ) : (
              <span style={{ fontSize: 12, color: C.inkMute, fontStyle: "italic" }}>Exercice à venir</span>
            )}
            {mod.exerciseUrl && !exerciseSubmitted && (
              <button
                onClick={() => onUpdateProgress(mod.id, "exerciseSubmitted", true)}
                disabled={updating === mod.id + "exerciseSubmitted"}
                style={{
                  fontSize: 10,
                  color: C.inkMute,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  textDecoration: "underline",
                  padding: 0,
                }}
              >
                Marquer rendu
              </button>
            )}
          </div>

          {/* Coach validation */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <StepDot done={coachValidated} />
            <span style={{ fontSize: 12, color: coachValidated ? C.green3 : C.inkMute }}>
              Validation
            </span>
          </div>
        </div>

        {/* Coach comment */}
        {p?.coachComment && (
          <div
            style={{
              marginTop: 10,
              padding: "10px 12px",
              borderRadius: 10,
              background: "#E8EFEC",
              borderLeft: `3px solid ${C.green3}`,
            }}
          >
            <div style={{ fontSize: 10, fontWeight: 700, color: C.green3, marginBottom: 3, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Retour coach
            </div>
            <p style={{ fontSize: 12, color: C.greenDeep, margin: 0, lineHeight: 1.5 }}>
              {p.coachComment}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function StepDot({ done }: { done: boolean }) {
  return (
    <div
      style={{
        width: 8,
        height: 8,
        borderRadius: "50%",
        flexShrink: 0,
        background: done ? C.green3 : C.borderSoft,
        border: done ? "none" : `1.5px solid ${C.border}`,
      }}
    />
  );
}

// ─── Phase icon ───────────────────────────────────────────────────────────────
function PhaseIcon({ phase }: { phase: PhaseWithProgress }) {
  if (phase.isCompleted) {
    return (
      <div
        style={{
          width: 42,
          height: 42,
          borderRadius: 12,
          background: C.greenDeep,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M3 9l5 5 7-7" stroke={C.goldLight} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    );
  }

  if (!phase.isUnlocked) {
    return (
      <div
        style={{
          width: 42,
          height: 42,
          borderRadius: 12,
          background: C.borderSoft,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <rect x="3" y="7" width="10" height="8" rx="2" fill={C.inkMute} />
          <path d="M5 7V5a3 3 0 016 0v2" stroke={C.inkMute} strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </div>
    );
  }

  // current / unlocked
  return (
    <div
      style={{
        width: 42,
        height: 42,
        borderRadius: 12,
        background: `linear-gradient(135deg, ${C.coralStart}, ${C.coralEnd})`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        color: C.white,
        fontSize: 16,
        fontWeight: 800,
      }}
    >
      {phase.order}
    </div>
  );
}

// ─── Phase card ───────────────────────────────────────────────────────────────
function PhaseCard({
  phase,
  isExpanded,
  onToggle,
  localProgress,
  updating,
  onUpdateProgress,
}: {
  phase: PhaseWithProgress;
  isExpanded: boolean;
  onToggle: () => void;
  localProgress: Record<string, { videoWatched: boolean; exerciseSubmitted: boolean; realImplementation: boolean }>;
  updating: string | null;
  onUpdateProgress: (id: string, field: string, value: boolean) => Promise<void>;
}) {
  const isCurrent = !phase.isCompleted && phase.isUnlocked;
  const progressBarColor = phase.isCompleted
    ? C.greenDeep
    : isCurrent
    ? `linear-gradient(90deg, ${C.coralStart}, ${C.coralEnd})`
    : C.border;

  // Determine which module is "current" within this phase
  let currentModId: string | null = null;
  if (isCurrent) {
    for (const m of phase.modules) {
      if (!m.progress?.coachValidated) {
        currentModId = m.id;
        break;
      }
    }
  }

  return (
    <div
      style={{
        borderRadius: 20,
        border: `1px solid ${C.border}`,
        background: C.white,
        overflow: "hidden",
        opacity: !phase.isUnlocked ? 0.55 : 1,
        transition: "opacity 0.2s",
      }}
    >
      {/* Header (clickable) */}
      <button
        onClick={onToggle}
        disabled={!phase.isUnlocked}
        style={{
          width: "100%",
          background: "none",
          border: "none",
          cursor: phase.isUnlocked ? "pointer" : "not-allowed",
          padding: "18px 20px 14px",
          textAlign: "left",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <PhaseIcon phase={phase} />

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: C.ink,
                  lineHeight: 1.3,
                }}
              >
                {phase.title}
              </span>
              {isCurrent && (
                <span
                  style={{
                    padding: "2px 9px",
                    borderRadius: 99,
                    fontSize: 10,
                    fontWeight: 700,
                    color: C.coralEnd,
                    background: `${C.coralEnd}18`,
                    border: `1px solid ${C.coralEnd}40`,
                  }}
                >
                  En cours
                </span>
              )}
            </div>
            <div
              style={{
                fontSize: 12,
                color: C.inkMute,
                marginTop: 2,
              }}
            >
              {phase.modules.length} module{phase.modules.length !== 1 ? "s" : ""} · {phase.progressPercent}%
            </div>
          </div>

          {/* Chevron */}
          <div style={{ flexShrink: 0, color: C.inkMute }}>
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              style={{ transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}
            >
              <path d="M4.5 7l4.5 4.5L13.5 7" stroke={C.inkMute} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        {/* Progress bar */}
        {phase.isUnlocked && (
          <div
            style={{
              marginTop: 12,
              height: 4,
              borderRadius: 99,
              background: C.borderSoft,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${phase.progressPercent}%`,
                borderRadius: 99,
                background: progressBarColor,
                transition: "width 0.5s ease",
              }}
            />
          </div>
        )}
      </button>

      {/* Expanded module list */}
      {isExpanded && phase.isUnlocked && (
        <div style={{ padding: "0 20px 16px" }}>
          {phase.modules.map((mod, idx) => (
            <ModuleRow
              key={mod.id}
              mod={mod}
              index={idx}
              isCurrent={mod.id === currentModId}
              localProgress={localProgress}
              updating={updating}
              onUpdateProgress={onUpdateProgress}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Root component ───────────────────────────────────────────────────────────
export function FormationView({ progress }: FormationViewProps) {
  const [expandedPhase, setExpandedPhase] = useState<number>(
    progress.currentPhase.order
  );
  const [updating, setUpdating] = useState<string | null>(null);
  const [localProgress, setLocalProgress] = useState<
    Record<string, { videoWatched: boolean; exerciseSubmitted: boolean; realImplementation: boolean }>
  >({});

  async function updateProgress(moduleId: string, field: string, value: boolean) {
    setUpdating(moduleId + field);
    setLocalProgress((prev) => ({
      ...prev,
      [moduleId]: { ...(prev[moduleId] ?? {}), [field]: value } as {
        videoWatched: boolean;
        exerciseSubmitted: boolean;
        realImplementation: boolean;
      },
    }));

    await fetch("/api/client/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ moduleId, field, value }),
    });

    setUpdating(null);
  }

  function handleContinue(phaseOrder: number) {
    setExpandedPhase(phaseOrder);
    // scroll to phases section — browser will handle naturally
  }

  return (
    <div
      style={{
        maxWidth: 640,
        margin: "0 auto",
        padding: "28px 16px 48px",
        background: C.cream,
        minHeight: "100vh",
      }}
    >
      {/* Page title */}
      <div style={{ marginBottom: 24 }}>
        <div
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: C.inkSoft,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            marginBottom: 6,
          }}
        >
          Ma formation
        </div>
        <h1
          style={{
            fontSize: 28,
            fontWeight: 800,
            color: C.ink,
            margin: 0,
            lineHeight: 1.2,
            letterSpacing: "-0.02em",
          }}
        >
          Méthode VISION
        </h1>
      </div>

      {/* Progress hero */}
      <div style={{ marginBottom: 16 }}>
        <ProgressHero globalPercent={progress.globalPercent} phases={progress.phases} />
      </div>

      {/* Current module card */}
      <div style={{ marginBottom: 28 }}>
        <CurrentModuleCard phases={progress.phases} onContinue={handleContinue} />
      </div>

      {/* Phases list */}
      <div>
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: C.inkSoft,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            marginBottom: 14,
          }}
        >
          Toutes les phases
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {progress.phases.map((phase) => (
            <PhaseCard
              key={phase.id}
              phase={phase}
              isExpanded={expandedPhase === phase.order}
              onToggle={() =>
                setExpandedPhase(expandedPhase === phase.order ? -1 : phase.order)
              }
              localProgress={localProgress}
              updating={updating}
              onUpdateProgress={updateProgress}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
