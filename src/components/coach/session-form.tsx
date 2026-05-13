"use client";

import { useState } from "react";

const C = {
  greenDeep: "#0E3D34", greenSoft: "#E8EFEC", greenAccent: "#3FA88E",
  coralStart: "#FF8A6B", coralEnd: "#E8527D",
  gold: "#D4A047",
  cream: "#FAF6EB", creamWarm: "#F2EBD8",
  ink: "#1A1714", inkSoft: "#5A5247", inkMute: "#9A9080",
  border: "#E8DFC8", borderSoft: "#F0E8D4",
};

interface SessionAction {
  id: string;
  content: string;
  completedByClient: boolean;
}

interface SessionFormProps {
  session: {
    id: string;
    title: string;
    scheduledAt: Date | string;
    firefliesUrl: string | null;
    summary: string | null;
    decisions: string | null;
    actions: SessionAction[];
    client?: { firstName: string; lastName: string } | null;
  };
  onClose: () => void;
  onUpdated: (updated: { firefliesUrl?: string; summary?: string; decisions?: string; actions?: SessionAction[] }) => void;
}

function formatDate(date: Date | string) {
  const d = typeof date === "string" ? new Date(date) : date;
  const months = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: C.inkSoft, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: hint ? 2 : 6 }}>
        {label}
      </label>
      {hint && <p style={{ fontSize: 11, color: C.inkMute, margin: "0 0 6px" }}>{hint}</p>}
      {children}
    </div>
  );
}

export function SessionForm({ session, onClose, onUpdated }: SessionFormProps) {
  const [firefliesUrl, setFirefliesUrl] = useState(session.firefliesUrl ?? "");
  const [summary, setSummary] = useState(session.summary ?? "");
  const [decisions, setDecisions] = useState(session.decisions ?? "");
  const [actions, setActions] = useState<SessionAction[]>(session.actions);
  const [newAction, setNewAction] = useState("");
  const [saving, setSaving] = useState(false);
  const [addingAction, setAddingAction] = useState(false);
  const [message, setMessage] = useState("");

  async function save() {
    setSaving(true);
    const res = await fetch(`/api/coach/sessions/${session.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firefliesUrl: firefliesUrl || null, summary: summary || null, decisions: decisions || null }),
    });
    setSaving(false);
    if (res.ok) {
      setMessage("Enregistré ✓");
      onUpdated({ firefliesUrl: (firefliesUrl || undefined), summary: (summary || undefined), decisions: (decisions || undefined) });
      setTimeout(() => setMessage(""), 2500);
    }
  }

  async function addAction() {
    if (!newAction.trim()) return;
    setAddingAction(true);
    const res = await fetch(`/api/coach/sessions/${session.id}/actions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: newAction.trim() }),
    });
    setAddingAction(false);
    if (res.ok) {
      const created = await res.json();
      setActions(prev => [...prev, created]);
      onUpdated({ actions: [...actions, created] });
      setNewAction("");
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "10px 14px",
    background: "#FFFFFF", border: `1px solid ${C.border}`, borderRadius: 10,
    fontSize: 13, color: C.ink, fontFamily: "inherit", boxSizing: "border-box",
  };

  const textareaStyle: React.CSSProperties = {
    ...inputStyle, minHeight: 80, resize: "vertical",
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(14,61,52,0.55)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "20px 16px",
    }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: "#FFFFFF", borderRadius: 24, padding: "24px 22px",
        width: "100%", maxWidth: 560,
        maxHeight: "90vh", overflowY: "auto",
        boxShadow: "0 24px 64px -16px rgba(0,0,0,0.35)",
      }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <p style={{ fontSize: 11, color: C.inkMute, margin: "0 0 2px", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>
              Compte-rendu · {formatDate(session.scheduledAt)}
            </p>
            <h2 style={{ fontSize: 17, fontWeight: 700, margin: 0, color: C.ink, letterSpacing: "-0.015em" }}>
              {session.title}
            </h2>
            {session.client && (
              <p style={{ fontSize: 12, color: C.inkSoft, margin: "2px 0 0" }}>
                {session.client.firstName} {session.client.lastName}
              </p>
            )}
          </div>
          <button onClick={onClose} style={{
            width: 32, height: 32, borderRadius: "50%",
            background: C.creamWarm, border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.inkSoft} strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Fireflies */}
        <Field label="Lien Fireflies (replay)" hint="Copie l'URL du replay depuis app.fireflies.ai">
          <input
            style={inputStyle}
            type="url"
            value={firefliesUrl}
            onChange={e => setFirefliesUrl(e.target.value)}
            placeholder="https://app.fireflies.ai/view/..."
          />
        </Field>

        {/* Summary */}
        <Field label="Résumé de la séance" hint="Principaux sujets abordés">
          <textarea
            style={textareaStyle}
            value={summary}
            onChange={e => setSummary(e.target.value)}
            placeholder="Cette séance a porté sur..."
          />
        </Field>

        {/* Decisions */}
        <Field label="Décisions prises">
          <textarea
            style={textareaStyle}
            value={decisions}
            onChange={e => setDecisions(e.target.value)}
            placeholder="• Décision 1&#10;• Décision 2"
          />
        </Field>

        {/* Save button */}
        {message && (
          <p style={{ fontSize: 12, color: C.greenAccent, fontWeight: 600, marginBottom: 8 }}>{message}</p>
        )}
        <button
          onClick={save}
          disabled={saving}
          style={{
            width: "100%", padding: "12px 16px", marginBottom: 20,
            background: `linear-gradient(135deg, ${C.coralStart}, ${C.coralEnd})`,
            color: "#FFFFFF", border: "none", borderRadius: 12,
            fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
            opacity: saving ? 0.7 : 1,
          }}
        >
          {saving ? "Enregistrement..." : "Enregistrer le compte-rendu"}
        </button>

        {/* Actions */}
        <div style={{ borderTop: `1px solid ${C.borderSoft}`, paddingTop: 18 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: C.ink, margin: "0 0 12px", letterSpacing: "-0.005em" }}>
            Actions pour le client ({actions.length})
          </p>

          {actions.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 }}>
              {actions.map(action => (
                <div key={action.id} style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "9px 12px", background: C.cream, borderRadius: 10,
                  border: `1px solid ${C.borderSoft}`,
                }}>
                  <span style={{ fontSize: 14 }}>{action.completedByClient ? "✅" : "⬜"}</span>
                  <p style={{ fontSize: 12.5, color: action.completedByClient ? C.inkMute : C.ink, margin: 0, flex: 1, textDecoration: action.completedByClient ? "line-through" : "none" }}>
                    {action.content}
                  </p>
                  {action.completedByClient && (
                    <span style={{ fontSize: 10, color: C.greenAccent, fontWeight: 700 }}>Fait ✓</span>
                  )}
                </div>
              ))}
            </div>
          )}

          <div style={{ display: "flex", gap: 8 }}>
            <input
              style={{ ...inputStyle, flex: 1 }}
              value={newAction}
              onChange={e => setNewAction(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") addAction(); }}
              placeholder="Nouvelle action pour le client..."
            />
            <button
              onClick={addAction}
              disabled={addingAction || !newAction.trim()}
              style={{
                padding: "10px 14px", background: C.greenDeep, color: "#FFFFFF",
                border: "none", borderRadius: 10, fontSize: 12, fontWeight: 700,
                cursor: "pointer", fontFamily: "inherit", flexShrink: 0,
                opacity: (!newAction.trim() || addingAction) ? 0.5 : 1,
              }}
            >
              {addingAction ? "..." : "+ Ajouter"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
