"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { AUDIT_SECTIONS } from "@/lib/audit-data";

interface AuditComment {
  section: number;
  content: string;
  coach: { firstName: string; lastName: string };
}

interface Props {
  auditId: string;
  initialResponses: Record<string, unknown>;
  isReadOnly: boolean;
  auditType: string;
  comments: AuditComment[];
}

// ── Slider (11 boutons 0-10) ──────────────────────────────────────────────
function SliderInput({ value, onChange, readOnly }: {
  value: number | null;
  onChange: (v: number) => void;
  readOnly: boolean;
}) {
  return (
    <div>
      <div className="flex gap-1">
        {Array.from({ length: 11 }).map((_, n) => {
          const active = value === n;
          return (
            <button
              key={n}
              type="button"
              disabled={readOnly}
              onClick={() => !readOnly && onChange(n)}
              className="flex-1 aspect-square min-w-0 rounded-[8px] text-[12px] font-bold flex items-center justify-center transition-all"
              style={{
                border: active ? "none" : "1px solid var(--border)",
                background: active ? "linear-gradient(135deg, var(--coral-start), var(--coral-end))" : "#fff",
                color: active ? "#fff" : "var(--ink-mute)",
                cursor: readOnly ? "default" : "pointer",
              }}
            >{n}</button>
          );
        })}
      </div>
      <div className="flex justify-between mt-1.5">
        <span className="text-[10px] font-semibold" style={{ color: "var(--ink-mute)" }}>0 · Pas du tout</span>
        <span className="text-[10px] font-semibold" style={{ color: "var(--ink-mute)" }}>Totalement · 10</span>
      </div>
    </div>
  );
}

// ── AB Choice ─────────────────────────────────────────────────────────────
function AbInput({ value, onChange, optionA, optionB, readOnly }: {
  value: number | null;
  onChange: (v: number) => void;
  optionA: string;
  optionB: string;
  readOnly: boolean;
}) {
  return (
    <div className="flex flex-col gap-2">
      {[optionA, optionB].map((opt, oi) => {
        const active = value === oi;
        return (
          <button
            key={oi}
            type="button"
            disabled={readOnly}
            onClick={() => !readOnly && onChange(oi)}
            className="px-3.5 py-3 rounded-[12px] text-left flex items-center gap-2.5 transition-all"
            style={{
              border: `1.5px solid ${active ? "var(--coral-end)" : "var(--border)"}`,
              background: active ? "rgba(232,82,125,0.05)" : "#fff",
              cursor: readOnly ? "default" : "pointer",
            }}
          >
            <span className="w-5 h-5 rounded-full shrink-0 flex items-center justify-center"
              style={{
                border: `2px solid ${active ? "var(--coral-end)" : "var(--border)"}`,
                background: active ? "var(--coral-end)" : "transparent",
              }}>
              {active && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
            </span>
            <span className="text-[13px] leading-snug" style={{ color: "var(--ink)", fontWeight: active ? 700 : 500 }}>
              {opt}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ── Main Wizard ───────────────────────────────────────────────────────────
export function AuditWizard({ auditId, initialResponses, isReadOnly, auditType, comments }: Props) {
  const router = useRouter();
  const [secIdx, setSecIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, unknown>>(initialResponses);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [submitting, setSubmitting] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const section = AUDIT_SECTIONS[secIdx];
  const isLast = secIdx === AUDIT_SECTIONS.length - 1;

  const typeLabels: Record<string, string> = {
    INITIAL: "Audit de départ",
    MID: "Audit mi-parcours",
    FINAL: "Audit final",
  };

  // ── Autosave debounced ────────────────────────────────────────────────
  const save = useCallback(async (data: Record<string, unknown>) => {
    setSaveStatus("saving");
    await fetch(`/api/client/audit/${auditId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ responses: data }),
    });
    setSaveStatus("saved");
    setTimeout(() => setSaveStatus("idle"), 2000);
  }, [auditId]);

  function setAnswer(id: string, value: unknown) {
    const next = { ...answers, [id]: value };
    setAnswers(next);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => save(next), 800);
  }

  useEffect(() => () => { if (debounceRef.current) clearTimeout(debounceRef.current); }, []);

  // ── Submit ────────────────────────────────────────────────────────────
  async function handleSubmit() {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setSubmitting(true);
    await fetch(`/api/client/audit/${auditId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ responses: answers }),
    });
    await fetch(`/api/client/audit/${auditId}/submit`, { method: "POST" });
    router.push("/audit");
  }

  // Coach comments for current section
  const sectionComments = comments.filter((c) => c.section === section.num);

  return (
    <div className="max-w-[640px] mx-auto px-4 py-5 pb-28" style={{ color: "var(--ink)", minHeight: "100%" }}>

      {/* Top bar */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => router.push("/audit")}
          className="w-9 h-9 rounded-[11px] flex items-center justify-center transition-colors"
          style={{ background: "#fff", border: "1px solid var(--border)" }}>
          <ChevronLeft className="w-4 h-4" style={{ color: "var(--ink)" }} />
        </button>

        {!isReadOnly && (
          <span className="text-[11px] font-semibold flex items-center gap-1.5"
            style={{ color: saveStatus === "saved" ? "var(--green-accent)" : "var(--ink-mute)" }}>
            {saveStatus === "saving" && <>⏳ Enregistrement…</>}
            {saveStatus === "saved" && <><span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: "var(--green-accent)" }} /> Brouillon enregistré</>}
            {saveStatus === "idle" && <span style={{ opacity: 0 }}>—</span>}
          </span>
        )}

        {isReadOnly && (
          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
            style={{ background: "var(--green-soft)", color: "var(--green-deep)" }}>
            Lecture seule
          </span>
        )}
      </div>

      {/* Progress */}
      <div className="flex items-baseline justify-between mb-1.5">
        <p className="text-[11px] font-bold uppercase tracking-[0.1em] m-0" style={{ color: "var(--coral-end)" }}>
          Section {section.num} / {AUDIT_SECTIONS.length}
        </p>
        <span className="text-[11px] font-semibold" style={{ color: "var(--ink-mute)" }}>
          {typeLabels[auditType] ?? auditType}
        </span>
      </div>
      <div className="flex gap-1 mb-5">
        {AUDIT_SECTIONS.map((s, i) => (
          <div key={s.num} className="flex-1 h-1 rounded-sm"
            style={{ background: i <= secIdx ? "linear-gradient(90deg, var(--coral-start), var(--coral-end))" : "var(--border-soft)" }} />
        ))}
      </div>

      {/* Section header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-11 h-11 rounded-[13px] flex items-center justify-center text-[22px] shrink-0"
          style={{ background: "var(--green-soft)" }}>
          {section.icon}
        </div>
        <h2 className="text-[19px] font-extrabold m-0 leading-tight tracking-[-0.02em]">
          {section.title}
        </h2>
      </div>

      {/* Coach comment for this section (read-only mode) */}
      {sectionComments.length > 0 && (
        <div className="mb-4 rounded-[14px] px-4 py-3"
          style={{ background: "var(--gold-soft)", borderLeft: "4px solid var(--gold)" }}>
          {sectionComments.map((c, i) => (
            <div key={i} className={i > 0 ? "mt-3 pt-3 border-t" : ""} style={{ borderColor: "var(--border-soft)" }}>
              <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: "var(--gold-deep)" }}>
                ★ Retour de {c.coach.firstName} {c.coach.lastName}
              </p>
              <p className="text-[13px] leading-relaxed m-0" style={{ color: "var(--ink)" }}>{c.content}</p>
            </div>
          ))}
        </div>
      )}

      {/* Questions */}
      <div className="flex flex-col gap-4">
        {section.questions.map((q) => (
          <div key={q.id} className="rounded-[16px] p-4" style={{ background: "#fff", border: "1px solid var(--border)" }}>
            <label className="block text-[13.5px] font-semibold leading-snug mb-3.5" style={{ color: "var(--ink)" }}>
              {q.label}
            </label>

            {q.type === "slider" && (
              <SliderInput
                value={typeof answers[q.id] === "number" ? (answers[q.id] as number) : null}
                onChange={(v) => setAnswer(q.id, v)}
                readOnly={isReadOnly}
              />
            )}
            {q.type === "text" && (
              <textarea
                value={typeof answers[q.id] === "string" ? (answers[q.id] as string) : ""}
                onChange={(e) => setAnswer(q.id, e.target.value)}
                readOnly={isReadOnly}
                rows={3}
                placeholder={isReadOnly ? "" : "Ta réponse…"}
                className="w-full px-3 py-2.5 rounded-[10px] text-[13.5px] leading-relaxed resize-y"
                style={{
                  border: "1px solid var(--border)",
                  background: isReadOnly ? "var(--cream)" : "var(--cream)",
                  color: "var(--ink)",
                  fontFamily: "inherit",
                  outline: "none",
                }}
              />
            )}
            {q.type === "ab" && (
              <AbInput
                value={typeof answers[q.id] === "number" ? (answers[q.id] as number) : null}
                onChange={(v) => setAnswer(q.id, v)}
                optionA={q.optionA!}
                optionB={q.optionB!}
                readOnly={isReadOnly}
              />
            )}
          </div>
        ))}
      </div>

      {/* Navigation */}
      <div className="flex gap-2.5 mt-5">
        {secIdx > 0 && (
          <button
            onClick={() => setSecIdx((i) => i - 1)}
            className="px-5 py-3.5 rounded-[14px] text-[13.5px] font-bold transition-colors"
            style={{ background: "#fff", color: "var(--ink-soft)", border: "1px solid var(--border)" }}>
            ← Précédent
          </button>
        )}

        {!isLast && (
          <button
            onClick={() => setSecIdx((i) => i + 1)}
            className="flex-1 py-3.5 rounded-[14px] text-[13.5px] font-bold text-white flex items-center justify-center gap-2 transition-opacity active:opacity-80"
            style={{ background: "linear-gradient(135deg, var(--coral-start), var(--coral-end))" }}>
            Suivant →
          </button>
        )}

        {isLast && !isReadOnly && (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 py-3.5 rounded-[14px] text-[13.5px] font-bold flex items-center justify-center gap-2 transition-opacity active:opacity-80 disabled:opacity-50"
            style={{ background: "var(--green-deep)", color: "var(--gold-light)" }}>
            {submitting ? "Envoi…" : "✓ Valider mon audit"}
          </button>
        )}

        {isLast && isReadOnly && (
          <button
            onClick={() => router.push("/audit")}
            className="flex-1 py-3.5 rounded-[14px] text-[13.5px] font-bold text-white flex items-center justify-center"
            style={{ background: "var(--green-deep)" }}>
            Retour au bilan
          </button>
        )}
      </div>
    </div>
  );
}
