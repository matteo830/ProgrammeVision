// Écrans Audit VISION — Hub · Wizard (remplissage) · Évolution (comparaison)
const t = window.AUDIT_TOKENS;

// ════════════════════════════════════════════════════════════
// Helpers visuels
// ════════════════════════════════════════════════════════════
function Mountain({ opacity = 0.25 }) {
  return (
    <svg width="140" height="88" viewBox="0 0 140 88" fill="none" style={{ position: "absolute", bottom: 0, right: 0, opacity, pointerEvents: "none" }}>
      <polygon points="70,8 140,88 0,88" fill="white" />
      <polygon points="105,32 140,88 70,88" fill="white" opacity="0.5" />
      <polygon points="25,50 70,88 0,88" fill="white" opacity="0.4" />
    </svg>
  );
}

function GreenHero({ eyebrow, title, subtitle }) {
  return (
    <div style={{ position: "relative", overflow: "hidden", borderRadius: 20, background: `linear-gradient(160deg, ${t.greenDeep} 0%, ${t.greenDeeper} 100%)`, padding: "26px 26px 24px", marginBottom: 20 }}>
      <Mountain />
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: t.goldLight, marginBottom: 8 }}>{eyebrow}</div>
      <h1 style={{ fontSize: 25, fontWeight: 800, color: t.white, margin: "0 0 4px", lineHeight: 1.15, letterSpacing: "-0.02em" }}>{title}</h1>
      {subtitle && <p style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", margin: 0, position: "relative" }}>{subtitle}</p>}
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// 1. HUB — les 3 passages
// ════════════════════════════════════════════════════════════
const AuditHub = () => {
  const runs = window.AUDIT_RUNS;
  const cards = [
    { key: "initial", run: runs.initial, sub: "Au démarrage du programme" },
    { key: "mid", run: runs.mid, sub: "À mi-parcours · semaine 13" },
    { key: "final", run: runs.final, sub: "À la fin du programme · semaine 26" },
  ];
  const doneCount = cards.filter(c => c.run.status === "SUBMITTED").length;

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "20px 16px 90px", fontFamily: "'Inter', sans-serif", color: t.ink }}>
      <GreenHero eyebrow="Mon audit" title="Mon bilan VISION" subtitle={`${doneCount} audit${doneCount > 1 ? "s" : ""} sur 3 réalisé${doneCount > 1 ? "s" : ""}`} />

      {/* CTA évolution */}
      {doneCount >= 2 && (
        <button style={{
          width: "100%", marginBottom: 20, padding: "16px 18px",
          background: `linear-gradient(135deg, ${t.coralStart}, ${t.coralEnd})`,
          border: "none", borderRadius: 16, cursor: "pointer", fontFamily: "inherit",
          display: "flex", alignItems: "center", gap: 14, textAlign: "left",
          boxShadow: `0 10px 24px -10px ${t.coralEnd}80`,
        }}>
          <div style={{ width: 40, height: 40, borderRadius: 11, background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>📈</div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 14, fontWeight: 800, color: t.white, margin: 0 }}>Voir mon évolution</p>
            <p style={{ fontSize: 11.5, color: "rgba(255,255,255,0.85)", margin: "2px 0 0" }}>Compare tes réponses au fil du programme</p>
          </div>
          <span style={{ color: t.white, fontSize: 18 }}>→</span>
        </button>
      )}

      <p style={{ fontSize: 12, fontWeight: 700, color: t.inkSoft, letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 12px 2px" }}>Les 3 temps de l'audit</p>

      <div style={{ display: "flex", flexDirection: "column", gap: 12, position: "relative" }}>
        {cards.map((c, i) => {
          const { run } = c;
          const isDone = run.status === "SUBMITTED";
          const isAvailable = run.status === "AVAILABLE";
          const isLocked = run.status === "LOCKED";
          const accent = isDone ? t.greenAccent : isAvailable ? t.coralEnd : t.border;

          return (
            <div key={c.key} style={{ position: "relative", display: "flex", gap: 14 }}>
              {/* Timeline rail */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
                  background: isDone ? t.greenDeep : isAvailable ? `linear-gradient(135deg, ${t.coralStart}, ${t.coralEnd})` : t.borderSoft,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: isDone ? t.goldLight : isAvailable ? t.white : t.inkMute,
                  fontSize: 14, fontWeight: 700,
                }}>
                  {isDone ? "✓" : isLocked ? "🔒" : i + 1}
                </div>
                {i < cards.length - 1 && <div style={{ width: 2, flex: 1, minHeight: 28, background: t.border, marginTop: 4 }} />}
              </div>

              {/* Card */}
              <div style={{
                flex: 1, background: t.white, borderRadius: 16,
                border: `1px solid ${isAvailable ? t.coralEnd + "40" : t.border}`,
                padding: "14px 16px", marginBottom: 4,
                opacity: isLocked ? 0.6 : 1,
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: t.ink }}>{run.icon} {run.label}</span>
                  <span style={{
                    fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
                    padding: "2px 8px", borderRadius: 999,
                    background: isDone ? t.greenSoft : isAvailable ? t.coralEnd + "1A" : t.borderSoft,
                    color: isDone ? t.greenDeep : isAvailable ? t.coralEnd : t.inkMute,
                  }}>
                    {isDone ? "Terminé" : isAvailable ? "À remplir" : "Verrouillé"}
                  </span>
                </div>
                <p style={{ fontSize: 11.5, color: t.inkMute, margin: "0 0 10px" }}>{c.sub}{run.date ? ` · ${run.date}` : ""}</p>

                {isDone ? (
                  <div style={{ display: "flex", gap: 8 }}>
                    <button style={{ padding: "8px 14px", background: t.greenSoft, color: t.greenDeep, border: "none", borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Revoir mes réponses</button>
                    {run.coachComments && Object.keys(run.coachComments).length > 0 && (
                      <span style={{ padding: "8px 12px", background: t.goldSoft, color: t.goldDeep, borderRadius: 10, fontSize: 11.5, fontWeight: 700, display: "flex", alignItems: "center", gap: 5 }}>
                        ★ {Object.keys(run.coachComments).length} retour coach
                      </span>
                    )}
                  </div>
                ) : isAvailable ? (
                  <button style={{ padding: "9px 16px", background: `linear-gradient(135deg, ${t.coralStart}, ${t.coralEnd})`, color: t.white, border: "none", borderRadius: 10, fontSize: 12.5, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", display: "inline-flex", alignItems: "center", gap: 7 }}>
                    Commencer l'audit →
                  </button>
                ) : (
                  <p style={{ fontSize: 11.5, color: t.inkMute, margin: 0, fontStyle: "italic" }}>Se débloque à la fin du programme</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════
// 2. WIZARD — remplissage section par section
// ════════════════════════════════════════════════════════════
const SliderInput = ({ value, onChange }) => (
  <div>
    <div style={{ display: "flex", gap: 4 }}>
      {Array.from({ length: 11 }).map((_, n) => {
        const active = value === n;
        return (
          <button key={n} onClick={() => onChange(n)} style={{
            flex: 1, aspectRatio: "1", minWidth: 0,
            borderRadius: 8,
            border: active ? "none" : `1px solid ${t.border}`,
            background: active ? `linear-gradient(135deg, ${t.coralStart}, ${t.coralEnd})` : t.white,
            color: active ? t.white : t.inkMute,
            fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>{n}</button>
        );
      })}
    </div>
    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
      <span style={{ fontSize: 10, color: t.inkMute, fontWeight: 600 }}>0 · Pas du tout</span>
      <span style={{ fontSize: 10, color: t.inkMute, fontWeight: 600 }}>Totalement · 10</span>
    </div>
  </div>
);

const AuditWizard = () => {
  const sections = window.AUDIT_SECTIONS;
  const [secIdx, setSecIdx] = React.useState(0);
  const [answers, setAnswers] = React.useState({
    clarte: 4, confiance: 3, vente: 2, communication: 5, gestion: 4,
    alignementViePro: 3, alignementAmbition: 6,
    s1_situation: "Je travaille beaucoup mais je manque de visibilité sur où je vais.",
  });
  const section = sections[secIdx];
  const isLast = secIdx === sections.length - 1;
  const setAnswer = (id, v) => setAnswers(a => ({ ...a, [id]: v }));

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "20px 16px 110px", fontFamily: "'Inter', sans-serif", color: t.ink, minHeight: "100%", background: t.cream }}>
      {/* Top bar : retour + autosave */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <button style={{ width: 36, height: 36, borderRadius: 11, background: t.white, border: `1px solid ${t.border}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={t.ink} strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6" /></svg>
        </button>
        <span style={{ fontSize: 11, color: t.greenAccent, fontWeight: 600, display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: t.greenAccent }} />
          Brouillon enregistré
        </span>
      </div>

      {/* Progress */}
      <div style={{ marginBottom: 6, display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: t.coralEnd, letterSpacing: "0.1em", textTransform: "uppercase", margin: 0 }}>Section {section.num} / 7</p>
        <span style={{ fontSize: 11, color: t.inkMute, fontWeight: 600 }}>Audit de départ</span>
      </div>
      <div style={{ display: "flex", gap: 4, marginBottom: 20 }}>
        {sections.map((s, i) => (
          <div key={s.num} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= secIdx ? `linear-gradient(90deg, ${t.coralStart}, ${t.coralEnd})` : t.borderSoft }} />
        ))}
      </div>

      {/* Section header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
        <div style={{ width: 44, height: 44, borderRadius: 13, background: t.greenSoft, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>{section.icon}</div>
        <h2 style={{ fontSize: 19, fontWeight: 800, margin: 0, letterSpacing: "-0.02em", lineHeight: 1.2 }}>{section.title}</h2>
      </div>

      {/* Questions */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {section.questions.map(q => (
          <div key={q.id} style={{ background: t.white, borderRadius: 16, border: `1px solid ${t.border}`, padding: "16px 16px" }}>
            <label style={{ display: "block", fontSize: 13.5, fontWeight: 600, color: t.ink, lineHeight: 1.4, marginBottom: q.type === "text" ? 10 : 14 }}>{q.label}</label>
            {q.type === "slider" && <SliderInput value={answers[q.id] ?? null} onChange={(v) => setAnswer(q.id, v)} />}
            {q.type === "text" && (
              <textarea value={answers[q.id] ?? ""} onChange={(e) => setAnswer(q.id, e.target.value)} rows={3}
                placeholder="Ta réponse…"
                style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: 10, border: `1px solid ${t.border}`, background: t.cream, fontSize: 13.5, fontFamily: "inherit", color: t.ink, resize: "vertical", outline: "none", lineHeight: 1.5 }} />
            )}
            {q.type === "ab" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[q.optionA, q.optionB].map((opt, oi) => {
                  const active = answers[q.id] === oi;
                  return (
                    <button key={oi} onClick={() => setAnswer(q.id, oi)} style={{
                      padding: "12px 14px", borderRadius: 12, textAlign: "left", cursor: "pointer", fontFamily: "inherit",
                      border: `1.5px solid ${active ? t.coralEnd : t.border}`,
                      background: active ? t.coralEnd + "0D" : t.white,
                      display: "flex", alignItems: "center", gap: 10,
                    }}>
                      <span style={{ width: 20, height: 20, borderRadius: "50%", flexShrink: 0, border: `2px solid ${active ? t.coralEnd : t.border}`, background: active ? t.coralEnd : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {active && <span style={{ width: 7, height: 7, borderRadius: "50%", background: t.white }} />}
                      </span>
                      <span style={{ fontSize: 13, color: t.ink, fontWeight: active ? 700 : 500, lineHeight: 1.4 }}>{opt}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Nav */}
      <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
        {secIdx > 0 && (
          <button onClick={() => setSecIdx(i => i - 1)} style={{ padding: "13px 20px", background: t.white, color: t.inkSoft, border: `1px solid ${t.border}`, borderRadius: 14, fontSize: 13.5, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>← Précédent</button>
        )}
        <button onClick={() => !isLast && setSecIdx(i => i + 1)} style={{
          flex: 1, padding: "13px 20px", border: "none", borderRadius: 14,
          background: isLast ? t.greenDeep : `linear-gradient(135deg, ${t.coralStart}, ${t.coralEnd})`,
          color: isLast ? t.goldLight : t.white,
          fontSize: 13.5, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        }}>
          {isLast ? "✓ Valider mon audit" : "Suivant →"}
        </button>
      </div>
    </div>
  );
};

window.AuditHub = AuditHub;
window.AuditWizard = AuditWizard;
