"use client";

import { useState, useEffect } from "react";

const C = {
  greenDeep: "#0E3D34", greenSoft: "#E8EFEC", greenAccent: "#3FA88E",
  gold: "#D4A047", goldLight: "#E8C56F",
  coralStart: "#FF8A6B", coralEnd: "#E8527D",
  cream: "#FAF6EB", creamWarm: "#F2EBD8",
  ink: "#1A1714", inkSoft: "#5A5247", inkMute: "#9A9080",
  border: "#E8DFC8", borderSoft: "#F0E8D4",
};

export default function CoachSettingsPage() {
  const [slug, setSlug] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/coach/settings/me").then(r => r.json()).then(d => {
      if (d.ghlCalendarSlug) setSlug(d.ghlCalendarSlug);
    }).catch(() => {});
  }, []);

  async function save() {
    setSaving(true);
    const res = await fetch("/api/coach/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ghlCalendarSlug: slug }),
    });
    setSaving(false);
    setMessage(res.ok ? "Enregistré ✓" : "Erreur lors de la sauvegarde");
    setTimeout(() => setMessage(""), 3000);
  }

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: "24px 16px 80px", fontFamily: "'Inter', sans-serif", color: C.ink }}>
      <div style={{ marginBottom: 28 }}>
        <p style={{ fontSize: 11, color: C.inkMute, margin: "0 0 2px", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>Espace coach</p>
        <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0, letterSpacing: "-0.025em" }}>Paramètres</h1>
      </div>

      {/* GHL Booking Widget */}
      <div style={{ background: "#FFFFFF", borderRadius: 20, border: `1px solid ${C.border}`, padding: "20px 20px", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <div style={{ width: 40, height: 40, borderRadius: 11, background: C.greenDeep, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
            📅
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, margin: 0, color: C.ink }}>Widget de prise de rendez-vous</p>
            <p style={{ fontSize: 11.5, color: C.inkMute, margin: "1px 0 0" }}>Affiché aux clients dans la page Calendrier</p>
          </div>
        </div>

        {/* Instructions */}
        <div style={{ background: C.greenSoft, borderRadius: 12, padding: "12px 14px", marginBottom: 14, borderLeft: `3px solid ${C.greenAccent}` }}>
          <p style={{ fontSize: 11.5, fontWeight: 700, color: C.greenDeep, margin: "0 0 6px" }}>Comment trouver ce code dans GoHighLevel :</p>
          <ol style={{ fontSize: 11.5, color: C.inkSoft, margin: 0, paddingLeft: 16, lineHeight: 1.7 }}>
            <li>Va dans <strong>Calendriers</strong> → sélectionne ton calendrier</li>
            <li>Clique sur <strong>Partager</strong> ou <strong>Embed / Intégrer</strong></li>
            <li>Copie le code <code style={{ background: "#FFFFFF", padding: "1px 5px", borderRadius: 4 }}>&lt;iframe src="..."&gt;</code></li>
            <li>Colle-le ci-dessous (le lien seul fonctionne aussi)</li>
          </ol>
        </div>

        <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: C.inkSoft, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>
          Code iframe ou URL GHL
        </label>
        <textarea
          value={slug}
          onChange={e => setSlug(e.target.value)}
          placeholder={`<iframe src="https://api.leadconnectorhq.com/widget/booking/xxxx" ...></iframe>\nou simplement : xxxx`}
          style={{
            width: "100%", minHeight: 90, padding: "11px 14px",
            background: C.cream, border: `1px solid ${C.border}`, borderRadius: 12,
            fontSize: 12, color: C.ink, fontFamily: "monospace",
            resize: "vertical", boxSizing: "border-box",
          }}
        />

        {slug && !slug.includes("<") && (
          <div style={{ marginTop: 12, background: C.creamWarm, borderRadius: 10, padding: "10px 14px" }}>
            <p style={{ fontSize: 11, color: C.inkSoft, margin: 0 }}>
              Aperçu de l&apos;URL : <code style={{ color: C.greenDeep }}>https://api.leadconnectorhq.com/widget/booking/<strong>{slug.match(/widget\/booking\/([A-Za-z0-9]+)/)?.[1] ?? slug}</strong></code>
            </p>
          </div>
        )}

        {message && (
          <p style={{ fontSize: 12, fontWeight: 600, color: message.includes("✓") ? C.greenAccent : C.coralEnd, marginTop: 10 }}>
            {message}
          </p>
        )}

        <button
          onClick={save}
          disabled={saving || !slug.trim()}
          style={{
            marginTop: 14, width: "100%", padding: "12px 16px",
            background: `linear-gradient(135deg, ${C.coralStart}, ${C.coralEnd})`,
            color: "#FFFFFF", border: "none", borderRadius: 12,
            fontSize: 13, fontWeight: 700, cursor: saving ? "default" : "pointer",
            opacity: (saving || !slug.trim()) ? 0.6 : 1, fontFamily: "inherit",
          }}
        >
          {saving ? "Enregistrement..." : "Enregistrer"}
        </button>
      </div>
    </div>
  );
}
