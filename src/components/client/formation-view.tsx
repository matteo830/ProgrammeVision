"use client";

import { useState } from "react";

const C = {
  greenDeep: "#0E3D34", greenDeeper: "#07251F", greenAccent: "#3FA88E",
  gold: "#D4A047", goldLight: "#E8C56F",
  coralStart: "#FF8A6B", coralEnd: "#E8527D",
  ink: "#1A1714", inkSoft: "#5A5247", inkMute: "#9A9080",
  border: "#E8DFC8", borderSoft: "#F0E8D4", cream: "#FAF6EB", white: "#FFFFFF",
};

type LessonStatus = "NOT_STARTED" | "IN_PROGRESS" | "DONE";

interface Lesson { id: string; title: string; order: number; status: LessonStatus }
interface Module { id: string; title: string; description: string | null; lessons: Lesson[] }
interface Course { id: string; title: string; description: string | null; imageUrl: string | null; accessUrl: string | null; order: number; modules: Module[] }

// ── Mountain decoration ───────────────────────────────────────────────────────
function Mountain() {
  return (
    <svg width="140" height="88" viewBox="0 0 140 88" fill="none"
      style={{ position: "absolute", bottom: 0, right: 0, opacity: 0.25, pointerEvents: "none" }}>
      <polygon points="70,8 140,88 0,88" fill="white" />
      <polygon points="105,32 140,88 70,88" fill="white" opacity="0.5" />
      <polygon points="25,50 70,88 0,88" fill="white" opacity="0.4" />
    </svg>
  );
}

// ── Lesson row ────────────────────────────────────────────────────────────────
function LessonRow({ lesson, onStatusChange }: { lesson: Lesson & { localStatus?: LessonStatus }; onStatusChange: (id: string, s: LessonStatus) => void }) {
  const status = lesson.localStatus ?? lesson.status;
  const isDone = status === "DONE";
  const isInProgress = status === "IN_PROGRESS";

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: `1px solid ${C.borderSoft}` }}>
      {/* Status dot */}
      <div style={{
        width: 20, height: 20, borderRadius: "50%", flexShrink: 0,
        background: isDone ? C.greenAccent : isInProgress ? `${C.gold}33` : C.borderSoft,
        border: isDone ? "none" : isInProgress ? `2px solid ${C.gold}` : `2px solid ${C.border}`,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {isDone && <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1.5 5l2.5 2.5 4.5-4.5" stroke={C.white} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>}
      </div>

      {/* Title */}
      <span style={{ flex: 1, fontSize: 13, color: isDone ? C.inkMute : C.ink, textDecoration: isDone ? "line-through" : "none", lineHeight: 1.4 }}>
        {lesson.title}
      </span>

      {/* Status buttons */}
      <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
        {(["IN_PROGRESS", "DONE"] as LessonStatus[]).map((s) => {
          const active = status === s;
          const label = s === "IN_PROGRESS" ? "En cours" : "Terminé";
          return (
            <button
              key={s}
              onClick={() => onStatusChange(lesson.id, active ? "NOT_STARTED" : s)}
              style={{
                padding: "4px 10px", borderRadius: 99, fontSize: 11, fontWeight: 600,
                border: "none", cursor: "pointer", fontFamily: "inherit",
                background: active ? (s === "DONE" ? C.greenAccent : `${C.gold}33`) : C.borderSoft,
                color: active ? (s === "DONE" ? C.white : C.gold) : C.inkMute,
              }}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Module accordion ──────────────────────────────────────────────────────────
function ModuleAccordion({ mod, localStatuses, onStatusChange }: {
  mod: Module;
  localStatuses: Record<string, LessonStatus>;
  onStatusChange: (lessonId: string, s: LessonStatus) => void;
}) {
  const [open, setOpen] = useState(false);

  const total = mod.lessons.length;
  const done = mod.lessons.filter((l) => (localStatuses[l.id] ?? l.status) === "DONE").length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const allDone = done === total && total > 0;

  return (
    <div style={{ borderRadius: 14, border: `1px solid ${C.border}`, background: C.white, overflow: "hidden" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{ width: "100%", background: "none", border: "none", cursor: "pointer", padding: "14px 16px", textAlign: "left", fontFamily: "inherit" }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* Icon */}
          <div style={{
            width: 34, height: 34, borderRadius: 10, flexShrink: 0,
            background: allDone ? C.greenDeep : `${C.greenAccent}18`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            {allDone
              ? <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7l3.5 3.5 6.5-6" stroke={C.goldLight} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              : <span style={{ fontSize: 15 }}>📋</span>}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: C.ink, margin: "0 0 2px" }}>{mod.title}</p>
            <p style={{ fontSize: 11, color: C.inkMute, margin: 0 }}>{done}/{total} leçon{total !== 1 ? "s" : ""} · {pct}%</p>
          </div>

          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"
            style={{ flexShrink: 0, transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
            <path d="M4 6l4 4 4-4" stroke={C.inkMute} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        {/* Progress bar */}
        {total > 0 && (
          <div style={{ marginTop: 10, height: 3, borderRadius: 99, background: C.borderSoft, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${pct}%`, borderRadius: 99, background: allDone ? C.greenAccent : C.gold, transition: "width 0.4s ease" }} />
          </div>
        )}
      </button>

      {open && (
        <div style={{ padding: "0 16px 14px" }}>
          {mod.lessons.length === 0
            ? <p style={{ fontSize: 13, color: C.inkMute, fontStyle: "italic" }}>Aucune leçon pour ce module.</p>
            : mod.lessons.map((l) => (
              <LessonRow key={l.id} lesson={{ ...l, localStatus: localStatuses[l.id] }} onStatusChange={onStatusChange} />
            ))}
        </div>
      )}
    </div>
  );
}

// ── Course card ───────────────────────────────────────────────────────────────
function CourseCard({ course, localStatuses, onStatusChange }: {
  course: Course;
  localStatuses: Record<string, LessonStatus>;
  onStatusChange: (lessonId: string, s: LessonStatus) => void;
}) {
  const [open, setOpen] = useState(false);
  const allLessons = course.modules.flatMap((m) => m.lessons);
  const done = allLessons.filter((l) => (localStatuses[l.id] ?? l.status) === "DONE").length;
  const total = allLessons.length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div style={{ background: C.white, borderRadius: 20, border: `1px solid ${C.border}`, overflow: "hidden" }}>
      {/* Thumbnail */}
      {course.imageUrl && (
        <div style={{ height: 130, overflow: "hidden", background: C.borderSoft }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={course.imageUrl} alt={course.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
      )}

      <div style={{ padding: "18px 20px 20px" }}>
        {/* Badge */}
        <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 99, fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", background: `${C.greenDeep}18`, color: C.greenDeep, marginBottom: 10 }}>
          Cours {course.order + 1}
        </span>

        <h2 style={{ fontSize: 18, fontWeight: 800, color: C.ink, margin: "0 0 6px", lineHeight: 1.3 }}>{course.title}</h2>

        {course.description && (
          <p style={{ fontSize: 13, color: C.inkSoft, margin: "0 0 14px", lineHeight: 1.55 }}>{course.description}</p>
        )}

        {/* Progress */}
        {total > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: C.inkMute, marginBottom: 5 }}>
              <span>{done}/{total} leçons terminées</span><span>{pct}%</span>
            </div>
            <div style={{ height: 4, borderRadius: 99, background: C.borderSoft, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${pct}%`, background: pct === 100 ? C.greenAccent : `linear-gradient(90deg, ${C.coralStart}, ${C.coralEnd})`, borderRadius: 99, transition: "width 0.5s ease" }} />
            </div>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {course.accessUrl && (
            <a href={course.accessUrl} target="_blank" rel="noopener noreferrer"
              style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "10px 20px", borderRadius: 99, background: `linear-gradient(135deg, ${C.coralStart}, ${C.coralEnd})`, color: C.white, fontWeight: 700, fontSize: 13, textDecoration: "none" }}>
              Accéder au cours
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2.5 7h9M8 3.5l3.5 3.5L8 10.5" stroke={C.white} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </a>
          )}
          {course.modules.length > 0 && (
            <button onClick={() => setOpen((o) => !o)}
              style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "10px 18px", borderRadius: 99, background: C.borderSoft, color: C.inkSoft, fontWeight: 700, fontSize: 13, border: "none", cursor: "pointer", fontFamily: "inherit" }}>
              {open ? "Masquer" : "Voir les modules"}
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
                <path d="M3 5l4 4 4-4" stroke={C.inkSoft} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}
        </div>

        {/* Modules accordion */}
        {open && (
          <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 10 }}>
            {course.modules.map((m) => (
              <ModuleAccordion key={m.id} mod={m} localStatuses={localStatuses} onStatusChange={onStatusChange} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <div style={{ background: C.white, borderRadius: 20, border: `1px solid ${C.border}`, padding: "48px 32px", textAlign: "center" }}>
      <div style={{ fontSize: 40, marginBottom: 16 }}>📚</div>
      <p style={{ fontSize: 16, fontWeight: 700, color: C.ink, margin: "0 0 8px" }}>Contenus en cours de préparation</p>
      <p style={{ fontSize: 13, color: C.inkMute, margin: 0, lineHeight: 1.6 }}>
        Tes cours seront disponibles très prochainement.<br />
        N&apos;hésite pas à contacter ton coach si tu as des questions.
      </p>
    </div>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────
export function FormationView({ courses }: { courses: Course[] }) {
  const [localStatuses, setLocalStatuses] = useState<Record<string, LessonStatus>>({});
  const [saving, setSaving] = useState<string | null>(null);

  async function handleStatusChange(lessonId: string, status: LessonStatus) {
    setSaving(lessonId);
    setLocalStatuses((p) => ({ ...p, [lessonId]: status }));
    await fetch("/api/client/lesson-progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lessonId, status }),
    });
    setSaving(null);
  }

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "28px 16px 48px", background: C.cream, minHeight: "100vh" }}>
      {/* Hero */}
      <div style={{ position: "relative", overflow: "hidden", borderRadius: 20, background: `linear-gradient(160deg, ${C.greenDeep} 0%, ${C.greenDeeper} 100%)`, padding: "28px 28px 24px", marginBottom: 28 }}>
        <Mountain />
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: C.goldLight, marginBottom: 8 }}>Ma formation</div>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: C.white, margin: "0 0 4px", lineHeight: 1.2, letterSpacing: "-0.02em" }}>Méthode VISION</h1>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.67)", margin: 0 }}>{courses.length} cours disponible{courses.length !== 1 ? "s" : ""}</p>
      </div>

      {courses.length === 0 ? <EmptyState /> : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {courses.map((c) => (
            <CourseCard key={c.id} course={c} localStatuses={localStatuses} onStatusChange={handleStatusChange} />
          ))}
        </div>
      )}
      {saving && <div style={{ position: "fixed", bottom: 20, right: 20, background: C.greenDeep, color: C.white, padding: "8px 16px", borderRadius: 99, fontSize: 12, fontWeight: 600 }}>Enregistrement…</div>}
    </div>
  );
}
