// Écran Évolution — comparaison des réponses entre les 3 passages
const te = window.AUDIT_TOKENS;

const RUN_STYLE = {
  initial: { label: "Départ", color: "#9A9080", week: "S1" },
  mid: { label: "Mi-parcours", color: "#D4A047", week: "S13" },
  final: { label: "Final", color: "#E8527D", week: "S26" },
};

// Barre de progression d'une métrique sur 0-10 avec les points des passages
const MetricBar = ({ metric }) => {
  const runs = window.AUDIT_RUNS;
  const pts = [
    { key: "initial", val: runs.initial.answers[metric.id] },
    { key: "mid", val: runs.mid.answers[metric.id] },
    { key: "final", val: runs.final.answers[metric.id] },
  ].filter(p => typeof p.val === "number");

  const first = pts[0]?.val;
  const last = pts[pts.length - 1]?.val;
  const delta = (typeof first === "number" && typeof last === "number") ? last - first : null;

  return (
    <div style={{ background: te.white, borderRadius: 14, border: `1px solid ${te.border}`, padding: "13px 15px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: te.ink }}>{metric.short}</span>
        {delta !== null && (
          <span style={{
            fontSize: 11, fontWeight: 800, padding: "2px 8px", borderRadius: 999,
            background: delta > 0 ? te.greenSoft : delta < 0 ? te.coralEnd + "1A" : te.borderSoft,
            color: delta > 0 ? te.greenDeep : delta < 0 ? te.coralEnd : te.inkMute,
          }}>
            {delta > 0 ? `+${delta}` : delta} {delta > 0 ? "↑" : delta < 0 ? "↓" : "="}
          </span>
        )}
      </div>

      {/* Track */}
      <div style={{ position: "relative", height: 22 }}>
        <div style={{ position: "absolute", top: 9, left: 0, right: 0, height: 4, borderRadius: 2, background: te.borderSoft }} />
        {/* connecting line initial→last */}
        {pts.length > 1 && (
          <div style={{ position: "absolute", top: 9, height: 4, borderRadius: 2,
            left: `${(pts[0].val / 10) * 100}%`,
            width: `${((pts[pts.length - 1].val - pts[0].val) / 10) * 100}%`,
            background: `linear-gradient(90deg, ${RUN_STYLE[pts[0].key].color}, ${RUN_STYLE[pts[pts.length - 1].key].color})`,
          }} />
        )}
        {pts.map(p => (
          <div key={p.key} style={{ position: "absolute", top: 0, left: `${(p.val / 10) * 100}%`, transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ width: 20, height: 20, borderRadius: "50%", background: RUN_STYLE[p.key].color, border: `3px solid ${te.white}`, boxShadow: "0 1px 4px rgba(0,0,0,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: te.white, fontSize: 9, fontWeight: 800 }}>{p.val}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

const AuditEvolution = () => {
  const runs = window.AUDIT_RUNS;
  const metrics = window.SLIDER_METRICS;

  const avg = (run) => {
    const vals = metrics.map(m => run.answers[m.id]).filter(v => typeof v === "number");
    return vals.length ? (vals.reduce((s, v) => s + v, 0) / vals.length) : null;
  };
  const avgInit = avg(runs.initial);
  const avgMid = avg(runs.mid);
  const avgDelta = (avgMid != null && avgInit != null) ? (avgMid - avgInit).toFixed(1) : null;

  // Comparaison textuelle
  const textQuestions = [
    { id: "s1_situation", label: "Ma situation en une phrase" },
    { id: "s2_objectifs", label: "Mes 3 objectifs de l'année" },
    { id: "s3_peurs", label: "Mes peurs / croyances limitantes" },
    { id: "s5_emotionsBusiness", label: "Mes émotions face au business" },
  ];
  const [openQ, setOpenQ] = React.useState("s1_situation");

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "20px 16px 90px", fontFamily: "'Inter', sans-serif", color: te.ink, minHeight: "100%", background: te.cream }}>
      {/* Top */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <button style={{ width: 36, height: 36, borderRadius: 11, background: te.white, border: `1px solid ${te.border}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={te.ink} strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6" /></svg>
        </button>
        <h1 style={{ fontSize: 17, fontWeight: 700, margin: 0, letterSpacing: "-0.015em" }}>Mon évolution</h1>
      </div>

      {/* Hero — moyenne globale */}
      <div style={{ position: "relative", overflow: "hidden", borderRadius: 20, background: `linear-gradient(160deg, ${te.greenDeep} 0%, ${te.greenDeeper} 100%)`, padding: "24px 24px 22px", marginBottom: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: te.goldLight, marginBottom: 14 }}>Score global de confiance</div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 14 }}>
          <div>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", margin: "0 0 2px" }}>Départ</p>
            <p style={{ fontSize: 30, fontWeight: 800, color: "#FFFFFF", margin: 0, lineHeight: 1 }}>{avgInit?.toFixed(1)}<span style={{ fontSize: 14, color: "rgba(255,255,255,0.5)" }}>/10</span></p>
          </div>
          <span style={{ fontSize: 20, color: te.goldLight, marginBottom: 4 }}>→</span>
          <div>
            <p style={{ fontSize: 11, color: te.goldLight, margin: "0 0 2px", fontWeight: 600 }}>Mi-parcours</p>
            <p style={{ fontSize: 30, fontWeight: 800, color: te.goldLight, margin: 0, lineHeight: 1 }}>{avgMid?.toFixed(1)}<span style={{ fontSize: 14, color: "rgba(232,197,111,0.6)" }}>/10</span></p>
          </div>
          <div style={{ marginLeft: "auto", textAlign: "right" }}>
            <span style={{ display: "inline-block", padding: "5px 12px", borderRadius: 999, background: te.greenAccent, color: te.white, fontSize: 14, fontWeight: 800 }}>+{avgDelta} ↑</span>
          </div>
        </div>
      </div>

      {/* Légende */}
      <div style={{ display: "flex", gap: 16, marginBottom: 18, padding: "0 4px" }}>
        {Object.entries(RUN_STYLE).map(([k, s]) => {
          const filled = Object.keys(runs[k].answers).length > 0;
          return (
            <div key={k} style={{ display: "flex", alignItems: "center", gap: 6, opacity: filled ? 1 : 0.4 }}>
              <span style={{ width: 12, height: 12, borderRadius: "50%", background: s.color }} />
              <span style={{ fontSize: 11, fontWeight: 600, color: te.inkSoft }}>{s.label}{!filled ? " (à venir)" : ""}</span>
            </div>
          );
        })}
      </div>

      {/* Métriques */}
      <p style={{ fontSize: 12, fontWeight: 700, color: te.inkSoft, letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 12px 2px" }}>Évolution par dimension</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 28 }}>
        {metrics.map(m => <MetricBar key={m.id} metric={m} />)}
      </div>

      {/* Comparaison textuelle */}
      <p style={{ fontSize: 12, fontWeight: 700, color: te.inkSoft, letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 12px 2px" }}>Comparer mes réponses</p>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
        {textQuestions.map(q => {
          const active = openQ === q.id;
          return (
            <button key={q.id} onClick={() => setOpenQ(q.id)} style={{
              padding: "7px 12px", borderRadius: 999, cursor: "pointer", fontFamily: "inherit",
              border: `1px solid ${active ? te.ink : te.border}`,
              background: active ? te.ink : te.white,
              color: active ? te.white : te.inkSoft,
              fontSize: 11.5, fontWeight: 700,
            }}>{q.label}</button>
          );
        })}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {["initial", "mid", "final"].map(k => {
          const ans = runs[k].answers[openQ];
          const s = RUN_STYLE[k];
          return (
            <div key={k} style={{ background: te.white, borderRadius: 14, border: `1px solid ${te.border}`, borderLeft: `4px solid ${s.color}`, padding: "13px 16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: s.color }}>{s.label}</span>
                <span style={{ fontSize: 10, color: te.inkMute }}>· {s.week}</span>
              </div>
              {ans ? (
                <p style={{ fontSize: 13.5, color: te.ink, margin: 0, lineHeight: 1.55 }}>{ans}</p>
              ) : (
                <p style={{ fontSize: 12.5, color: te.inkMute, margin: 0, fontStyle: "italic" }}>Pas encore renseigné — cet audit n'a pas encore été rempli.</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

window.AuditEvolution = AuditEvolution;
