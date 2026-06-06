"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { SLIDER_METRICS, EVOLUTION_TEXT_QUESTIONS } from "@/lib/audit-data";

type AuditType = "INITIAL" | "MID" | "FINAL";

interface AuditData {
  type: AuditType;
  submittedAt: string;
  responses: Record<string, unknown>;
}

interface Props {
  audits: AuditData[];
}

const RUN_STYLE: Record<AuditType, { label: string; color: string; week: string }> = {
  INITIAL: { label: "Départ",      color: "#9A9080", week: "S1"  },
  MID:     { label: "Mi-parcours", color: "#D4A047", week: "S13" },
  FINAL:   { label: "Final",       color: "#E8527D", week: "S26" },
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

function MetricBar({ metricId, metricLabel, audits }: {
  metricId: string;
  metricLabel: string;
  audits: AuditData[];
}) {
  const pts = audits
    .map((a) => ({ type: a.type, val: typeof a.responses[metricId] === "number" ? (a.responses[metricId] as number) : null }))
    .filter((p): p is { type: AuditType; val: number } => p.val !== null);

  const first = pts[0]?.val;
  const last = pts[pts.length - 1]?.val;
  const delta = typeof first === "number" && typeof last === "number" && pts.length > 1 ? last - first : null;

  return (
    <div className="rounded-[14px] p-3.5" style={{ background: "#fff", border: "1px solid var(--border)" }}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-[13px] font-bold" style={{ color: "var(--ink)" }}>{metricLabel}</span>
        {delta !== null && (
          <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full"
            style={{
              background: delta > 0 ? "var(--green-soft)" : delta < 0 ? "rgba(232,82,125,0.1)" : "var(--border-soft)",
              color: delta > 0 ? "var(--green-deep)" : delta < 0 ? "var(--coral-end)" : "var(--ink-mute)",
            }}>
            {delta > 0 ? `+${delta}` : delta} {delta > 0 ? "↑" : delta < 0 ? "↓" : "="}
          </span>
        )}
      </div>

      {/* Track */}
      <div className="relative h-5">
        <div className="absolute top-[9px] left-0 right-0 h-1 rounded-sm" style={{ background: "var(--border-soft)" }} />

        {pts.length > 1 && (() => {
          const leftPct = (pts[0].val / 10) * 100;
          const widthPct = ((pts[pts.length - 1].val - pts[0].val) / 10) * 100;
          if (widthPct === 0) return null;
          return (
            <div className="absolute top-[9px] h-1 rounded-sm" style={{
              left: `${leftPct}%`,
              width: `${Math.abs(widthPct)}%`,
              ...(widthPct < 0 ? { left: `${leftPct + widthPct}%` } : {}),
              background: `linear-gradient(90deg, ${RUN_STYLE[pts[0].type].color}, ${RUN_STYLE[pts[pts.length - 1].type].color})`,
            }} />
          );
        })()}

        {pts.map((p) => (
          <div key={p.type}
            className="absolute top-0 flex flex-col items-center"
            style={{ left: `${(p.val / 10) * 100}%`, transform: "translateX(-50%)" }}>
            <div className="w-5 h-5 rounded-full border-[3px] border-white flex items-center justify-center text-[9px] font-extrabold text-white"
              style={{ background: RUN_STYLE[p.type].color, boxShadow: "0 1px 4px rgba(0,0,0,0.15)" }}>
              {p.val}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AuditEvolution({ audits }: Props) {
  const router = useRouter();
  const [openQ, setOpenQ] = useState(EVOLUTION_TEXT_QUESTIONS[0].id);

  function avgScore(audit: AuditData) {
    const vals = SLIDER_METRICS.map((m) => audit.responses[m.id]).filter((v): v is number => typeof v === "number");
    return vals.length ? vals.reduce((s, v) => s + v, 0) / vals.length : null;
  }

  const initial = audits.find((a) => a.type === "INITIAL");
  const mid = audits.find((a) => a.type === "MID");
  const final = audits.find((a) => a.type === "FINAL");

  const avgInit = initial ? avgScore(initial) : null;
  const avgMid = mid ? avgScore(mid) : null;
  const avgFinal = final ? avgScore(final) : null;
  const latestAvg = avgFinal ?? avgMid ?? null;
  const delta = latestAvg !== null && avgInit !== null ? (latestAvg - avgInit).toFixed(1) : null;

  const ALL_TYPES: AuditType[] = ["INITIAL", "MID", "FINAL"];

  return (
    <div className="max-w-[640px] mx-auto px-4 py-5 pb-24" style={{ color: "var(--ink)" }}>

      {/* Top */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => router.push("/audit")}
          className="w-9 h-9 rounded-[11px] flex items-center justify-center shrink-0 transition-colors"
          style={{ background: "#fff", border: "1px solid var(--border)" }}>
          <ChevronLeft className="w-4 h-4" style={{ color: "var(--ink)" }} />
        </button>
        <h1 className="text-[17px] font-bold m-0 tracking-[-0.015em]">Mon évolution</h1>
      </div>

      {/* Hero score global */}
      <div className="relative overflow-hidden rounded-[20px] mb-4"
        style={{ background: "linear-gradient(160deg, var(--green-deep) 0%, #07251F 100%)", padding: "24px 24px 22px" }}>
        <Mountain />
        <p className="text-[11px] font-bold uppercase tracking-[0.12em] mb-3.5" style={{ color: "var(--gold-light)" }}>
          Score global de confiance
        </p>
        <div className="flex items-end gap-3.5">
          {avgInit !== null && (
            <div>
              <p className="text-[11px] m-0 mb-0.5" style={{ color: "rgba(255,255,255,0.6)" }}>Départ</p>
              <p className="text-[30px] font-extrabold text-white m-0 leading-none tabular-nums">
                {avgInit.toFixed(1)}<span className="text-[14px]" style={{ color: "rgba(255,255,255,0.5)" }}>/10</span>
              </p>
            </div>
          )}
          {(avgMid !== null || avgFinal !== null) && (
            <>
              <span className="text-[20px] mb-1" style={{ color: "var(--gold-light)" }}>→</span>
              <div>
                <p className="text-[11px] font-semibold m-0 mb-0.5" style={{ color: "var(--gold-light)" }}>
                  {avgFinal !== null ? "Final" : "Mi-parcours"}
                </p>
                <p className="text-[30px] font-extrabold m-0 leading-none tabular-nums" style={{ color: "var(--gold-light)" }}>
                  {(avgFinal ?? avgMid)!.toFixed(1)}<span className="text-[14px]" style={{ color: "rgba(232,197,111,0.6)" }}>/10</span>
                </p>
              </div>
            </>
          )}
          {delta !== null && (
            <div className="ml-auto">
              <span className="inline-block px-3 py-1.5 rounded-full text-[14px] font-extrabold text-white"
                style={{ background: "var(--green-accent)" }}>
                {Number(delta) > 0 ? "+" : ""}{delta} ↑
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Légende */}
      <div className="flex gap-4 mb-4 px-1">
        {ALL_TYPES.map((type) => {
          const filled = audits.some((a) => a.type === type);
          const s = RUN_STYLE[type];
          return (
            <div key={type} className="flex items-center gap-1.5" style={{ opacity: filled ? 1 : 0.4 }}>
              <span className="w-3 h-3 rounded-full shrink-0" style={{ background: s.color }} />
              <span className="text-[11px] font-semibold" style={{ color: "var(--ink-soft)" }}>
                {s.label}{!filled ? " (à venir)" : ""}
              </span>
            </div>
          );
        })}
      </div>

      {/* Métriques */}
      <p className="text-[12px] font-bold uppercase tracking-[0.08em] mb-3 ml-0.5" style={{ color: "var(--ink-soft)" }}>
        Évolution par dimension
      </p>
      <div className="flex flex-col gap-2 mb-7">
        {SLIDER_METRICS.map((m) => (
          <MetricBar key={m.id} metricId={m.id} metricLabel={m.short} audits={audits} />
        ))}
      </div>

      {/* Comparaison textuelle */}
      <p className="text-[12px] font-bold uppercase tracking-[0.08em] mb-3 ml-0.5" style={{ color: "var(--ink-soft)" }}>
        Comparer mes réponses
      </p>
      <div className="flex gap-1.5 flex-wrap mb-3.5">
        {EVOLUTION_TEXT_QUESTIONS.map((q) => {
          const active = openQ === q.id;
          return (
            <button key={q.id} onClick={() => setOpenQ(q.id)}
              className="px-3 py-1.5 rounded-full text-[11.5px] font-bold transition-colors"
              style={{
                border: `1px solid ${active ? "var(--ink)" : "var(--border)"}`,
                background: active ? "var(--ink)" : "#fff",
                color: active ? "#fff" : "var(--ink-soft)",
                cursor: "pointer",
              }}>
              {q.label}
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-2.5">
        {ALL_TYPES.map((type) => {
          const audit = audits.find((a) => a.type === type);
          const ans = audit?.responses[openQ];
          const s = RUN_STYLE[type];
          return (
            <div key={type} className="rounded-[14px] px-4 py-3.5"
              style={{
                background: "#fff",
                border: "1px solid var(--border)",
                borderLeft: `4px solid ${s.color}`,
              }}>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[10px] font-extrabold uppercase tracking-[0.08em]" style={{ color: s.color }}>
                  {s.label}
                </span>
                <span className="text-[10px]" style={{ color: "var(--ink-mute)" }}>· {s.week}</span>
              </div>
              {typeof ans === "string" && ans ? (
                <p className="text-[13.5px] m-0 leading-relaxed" style={{ color: "var(--ink)" }}>{ans}</p>
              ) : (
                <p className="text-[12.5px] m-0 italic" style={{ color: "var(--ink-mute)" }}>
                  Pas encore renseigné — cet audit n'a pas encore été rempli.
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
