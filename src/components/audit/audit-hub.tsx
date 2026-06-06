"use client";

import { useRouter } from "next/navigation";
import { AuditType } from "@prisma/client";

interface AuditEntry {
  type: AuditType;
  id: string | null;
  status: "SUBMITTED" | "DRAFT" | "AVAILABLE" | "LOCKED";
  submittedAt: string | null;
  coachCommentCount: number;
}

interface Props {
  audits: AuditEntry[];
}

const TYPE_META: Record<AuditType, { label: string; sub: string; week: string }> = {
  INITIAL: { label: "Audit de départ",    sub: "Au démarrage du programme",       week: "S1"  },
  MID:     { label: "Audit mi-parcours",  sub: "À mi-parcours · semaine 13",      week: "S13" },
  FINAL:   { label: "Audit final",        sub: "À la fin du programme · semaine 26", week: "S26" },
};

function Mountain() {
  return (
    <svg width="140" height="88" viewBox="0 0 140 88" fill="none"
      className="absolute bottom-0 right-0 pointer-events-none" style={{ opacity: 0.25 }}>
      <polygon points="70,8 140,88 0,88" fill="white" />
      <polygon points="105,32 140,88 70,88" fill="white" opacity="0.5" />
      <polygon points="25,50 70,88 0,88" fill="white" opacity="0.4" />
    </svg>
  );
}

export function AuditHub({ audits }: Props) {
  const router = useRouter();
  const doneCount = audits.filter((a) => a.status === "SUBMITTED").length;

  async function handleStart(type: AuditType) {
    const res = await fetch("/api/client/audit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type }),
    });
    const data = await res.json();
    router.push(`/audit/${data.id}`);
  }

  function handleReview(id: string) {
    router.push(`/audit/${id}`);
  }

  return (
    <div className="max-w-[640px] mx-auto px-4 py-5 pb-24 font-sans" style={{ color: "var(--ink)" }}>

      {/* Hero */}
      <div className="relative overflow-hidden rounded-[20px] mb-5"
        style={{ background: "linear-gradient(160deg, var(--green-deep) 0%, #07251F 100%)", padding: "26px 26px 24px" }}>
        <Mountain />
        <p className="text-[11px] font-bold uppercase tracking-[0.12em] mb-2" style={{ color: "var(--gold-light)" }}>
          Mon audit
        </p>
        <h1 className="text-[25px] font-extrabold leading-tight tracking-[-0.02em] mb-1" style={{ color: "#fff" }}>
          Mon bilan VISION
        </h1>
        <p className="text-[13px] relative" style={{ color: "rgba(255,255,255,0.7)" }}>
          {doneCount} audit{doneCount > 1 ? "s" : ""} sur 3 réalisé{doneCount > 1 ? "s" : ""}
        </p>
      </div>

      {/* CTA Évolution (≥ 2 soumis) */}
      {doneCount >= 2 && (
        <button
          onClick={() => router.push("/audit/evolution")}
          className="w-full mb-5 flex items-center gap-3.5 rounded-[16px] text-left transition-opacity active:opacity-80"
          style={{
            padding: "16px 18px",
            background: "linear-gradient(135deg, var(--coral-start), var(--coral-end))",
            boxShadow: "0 10px 24px -10px rgba(232,82,125,0.5)",
          }}
        >
          <div className="w-10 h-10 rounded-[11px] flex items-center justify-center text-xl shrink-0"
            style={{ background: "rgba(255,255,255,0.2)" }}>📈</div>
          <div className="flex-1">
            <p className="text-[14px] font-extrabold text-white m-0">Voir mon évolution</p>
            <p className="text-[11.5px] m-0 mt-0.5" style={{ color: "rgba(255,255,255,0.85)" }}>
              Compare tes réponses au fil du programme
            </p>
          </div>
          <span className="text-white text-lg">→</span>
        </button>
      )}

      {/* Titre timeline */}
      <p className="text-[12px] font-bold uppercase tracking-[0.08em] mb-3 ml-0.5" style={{ color: "var(--ink-soft)" }}>
        Les 3 temps de l'audit
      </p>

      {/* Timeline */}
      <div className="flex flex-col gap-3">
        {audits.map((entry, i) => {
          const meta = TYPE_META[entry.type];
          const isDone = entry.status === "SUBMITTED";
          const isDraft = entry.status === "DRAFT";
          const isAvail = entry.status === "AVAILABLE";
          const isLocked = entry.status === "LOCKED";

          const dotBg = isDone
            ? "var(--green-deep)"
            : isAvail || isDraft
            ? "linear-gradient(135deg, var(--coral-start), var(--coral-end))"
            : "var(--border-soft)";
          const dotColor = isDone
            ? "var(--gold-light)"
            : isAvail || isDraft
            ? "#fff"
            : "var(--ink-mute)";
          const badgeBg = isDone
            ? "var(--green-soft)"
            : isAvail || isDraft
            ? "rgba(232,82,125,0.1)"
            : "var(--border-soft)";
          const badgeColor = isDone
            ? "var(--green-deep)"
            : isAvail || isDraft
            ? "var(--coral-end)"
            : "var(--ink-mute)";
          const badgeText = isDone ? "Terminé" : isDraft ? "En cours" : isAvail ? "À remplir" : "Verrouillé";

          return (
            <div key={entry.type} className="flex gap-3.5">
              {/* Rail */}
              <div className="flex flex-col items-center shrink-0">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-[14px] font-bold shrink-0"
                  style={{ background: dotBg, color: dotColor }}>
                  {isDone ? "✓" : isLocked ? "🔒" : i + 1}
                </div>
                {i < audits.length - 1 && (
                  <div className="w-0.5 flex-1 min-h-7 mt-1" style={{ background: "var(--border)" }} />
                )}
              </div>

              {/* Card */}
              <div className="flex-1 rounded-[16px] mb-1"
                style={{
                  background: "#fff",
                  border: `1px solid ${isAvail || isDraft ? "rgba(232,82,125,0.25)" : "var(--border)"}`,
                  padding: "14px 16px",
                  opacity: isLocked ? 0.6 : 1,
                }}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[14px] font-bold" style={{ color: "var(--ink)" }}>
                    {meta.label}
                  </span>
                  <span className="text-[9px] font-bold uppercase tracking-[0.08em] px-2 py-0.5 rounded-full"
                    style={{ background: badgeBg, color: badgeColor }}>
                    {badgeText}
                  </span>
                </div>

                <p className="text-[11.5px] mb-2.5" style={{ color: "var(--ink-mute)" }}>
                  {meta.sub}
                  {entry.submittedAt ? ` · ${new Date(entry.submittedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}` : ""}
                </p>

                {isDone && (
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => handleReview(entry.id!)}
                      className="text-[12px] font-bold px-3.5 py-2 rounded-[10px] transition-opacity active:opacity-70"
                      style={{ background: "var(--green-soft)", color: "var(--green-deep)" }}>
                      Revoir mes réponses
                    </button>
                    {entry.coachCommentCount > 0 && (
                      <button
                        onClick={() => handleReview(entry.id!)}
                        className="text-[11.5px] font-bold px-3 py-2 rounded-[10px] flex items-center gap-1.5"
                        style={{ background: "var(--gold-soft)", color: "var(--gold-deep)" }}>
                        ★ {entry.coachCommentCount} retour{entry.coachCommentCount > 1 ? "s" : ""} coach
                      </button>
                    )}
                  </div>
                )}
                {isDraft && (
                  <button
                    onClick={() => handleReview(entry.id!)}
                    className="text-[12.5px] font-bold px-4 py-2.5 rounded-[10px] flex items-center gap-1.5 transition-opacity active:opacity-80"
                    style={{ background: "linear-gradient(135deg, var(--coral-start), var(--coral-end))", color: "#fff" }}>
                    Continuer l'audit →
                  </button>
                )}
                {isAvail && (
                  <button
                    onClick={() => handleStart(entry.type)}
                    className="text-[12.5px] font-bold px-4 py-2.5 rounded-[10px] flex items-center gap-1.5 transition-opacity active:opacity-80"
                    style={{ background: "linear-gradient(135deg, var(--coral-start), var(--coral-end))", color: "#fff" }}>
                    Commencer l'audit →
                  </button>
                )}
                {isLocked && (
                  <p className="text-[11.5px] italic m-0" style={{ color: "var(--ink-mute)" }}>
                    Se débloque à la fin du programme
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
