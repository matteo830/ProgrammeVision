"use client";

import { useState } from "react";

const C = {
  greenDeep: "#0E3D34", greenAccent: "#3FA88E", greenSoft: "#E8EFEC",
  gold: "#D4A047", goldLight: "#E8C56F",
  coralStart: "#FF8A6B", coralEnd: "#E8527D",
  cream: "#FAF6EB", creamWarm: "#F2EBD8",
  ink: "#1A1714", inkSoft: "#5A5247", inkMute: "#9A9080",
  border: "#E8DFC8", borderSoft: "#F0E8D4",
};

interface Coach {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: Date | string;
  ghlCalendarSlug: string | null;
  assignedClients: { id: string }[];
}

interface CoachesViewProps {
  coaches: Coach[];
  currentUserId: string;
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "10px 14px",
  background: "#FFFFFF", border: `1px solid ${C.border}`, borderRadius: 10,
  fontSize: 13, color: C.ink, fontFamily: "inherit", boxSizing: "border-box",
};

export function CoachesView({ coaches: initial, currentUserId }: CoachesViewProps) {
  const [coaches, setCoaches] = useState<Coach[]>(initial);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "", role: "COACH" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  async function createCoach() {
    if (!form.firstName || !form.lastName || !form.email || !form.password) {
      setError("Tous les champs sont obligatoires");
      return;
    }
    setSaving(true);
    setError("");
    const res = await fetch("/api/coach/coaches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { setError(data.error ?? "Erreur"); return; }
    setShowForm(false);
    setForm({ firstName: "", lastName: "", email: "", password: "", role: "COACH" });
    window.location.reload();
  }

  async function toggleActive(id: string, isActive: boolean) {
    setCoaches(prev => prev.map(c => c.id === id ? { ...c, isActive } : c));
    await fetch(`/api/coach/coaches/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive }),
    });
  }

  async function deleteCoach(id: string) {
    const res = await fetch(`/api/coach/coaches/${id}`, { method: "DELETE" });
    if (res.ok) {
      setCoaches(prev => prev.filter(c => c.id !== id));
      setConfirmDelete(null);
    }
  }

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "24px 16px 80px", fontFamily: "'Inter', sans-serif", color: C.ink }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <p style={{ fontSize: 11, color: C.inkMute, margin: "0 0 2px", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>
            Espace admin
          </p>
          <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0, letterSpacing: "-0.025em" }}>Coaches</h1>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setError(""); }}
          style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "10px 16px",
            background: `linear-gradient(135deg, ${C.coralStart}, ${C.coralEnd})`,
            color: "#FFFFFF", border: "none", borderRadius: 12,
            fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
          }}
        >
          {showForm ? "Annuler" : "+ Nouveau coach"}
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div style={{ background: "#FFFFFF", borderRadius: 20, border: `1px solid ${C.border}`, padding: "18px 20px", marginBottom: 20 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: C.ink, margin: "0 0 14px" }}>Créer un coach</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
            <div>
              <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: C.inkSoft, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 5 }}>Prénom</label>
              <input style={inputStyle} value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} placeholder="Prénom" />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: C.inkSoft, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 5 }}>Nom</label>
              <input style={inputStyle} value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} placeholder="Nom" />
            </div>
          </div>
          <div style={{ marginBottom: 10 }}>
            <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: C.inkSoft, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 5 }}>Email</label>
            <input style={inputStyle} type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="email@exemple.com" />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
            <div>
              <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: C.inkSoft, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 5 }}>Mot de passe</label>
              <input style={inputStyle} type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="••••••••" />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: C.inkSoft, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 5 }}>Rôle</label>
              <select style={{ ...inputStyle }} value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                <option value="COACH">Coach</option>
                <option value="ADMIN">Admin + Coach</option>
              </select>
            </div>
          </div>
          {error && <p style={{ fontSize: 12, color: C.coralEnd, fontWeight: 600, margin: "0 0 10px" }}>{error}</p>}
          <button
            onClick={createCoach}
            disabled={saving}
            style={{
              padding: "11px 20px",
              background: C.greenDeep, color: "#FFFFFF", border: "none", borderRadius: 12,
              fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
              opacity: saving ? 0.7 : 1,
            }}
          >
            {saving ? "Création..." : "Créer le compte"}
          </button>
        </div>
      )}

      {/* Coaches list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {coaches.map(coach => {
          const initials = `${coach.firstName[0]}${coach.lastName[0]}`.toUpperCase();
          const isSelf = coach.id === currentUserId;
          return (
            <div key={coach.id} style={{
              background: "#FFFFFF", borderRadius: 18, border: `1px solid ${C.border}`,
              padding: "14px 16px",
              display: "flex", alignItems: "center", gap: 14,
              opacity: coach.isActive ? 1 : 0.55,
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: "50%",
                background: coach.isActive
                  ? `linear-gradient(135deg, ${C.greenDeep}, ${C.greenAccent})`
                  : C.border,
                color: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: 700, fontSize: 15, flexShrink: 0,
              }}>
                {initials}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                  <p style={{ fontSize: 14, fontWeight: 700, margin: 0, color: C.ink }}>
                    {coach.firstName} {coach.lastName}
                  </p>
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: "1px 7px", borderRadius: 999,
                    background: coach.role === "ADMIN" ? "rgba(212,160,71,0.15)" : C.greenSoft,
                    color: coach.role === "ADMIN" ? C.gold : C.greenAccent,
                  }}>
                    {coach.role === "ADMIN" ? "Admin" : "Coach"}
                  </span>
                  {!coach.isActive && (
                    <span style={{ fontSize: 10, fontWeight: 700, padding: "1px 7px", borderRadius: 999, background: "#FEE2E2", color: "#DC2626" }}>
                      Désactivé
                    </span>
                  )}
                </div>
                <p style={{ fontSize: 11.5, color: C.inkMute, margin: "2px 0 0" }}>{coach.email}</p>
                <p style={{ fontSize: 11, color: C.inkMute, margin: "2px 0 0" }}>
                  {coach.assignedClients.length} client{coach.assignedClients.length !== 1 ? "s" : ""}
                  {coach.ghlCalendarSlug && " · Calendrier GHL ✓"}
                </p>
              </div>

              {/* Actions */}
              {!isSelf && (
                <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                  <button
                    onClick={() => toggleActive(coach.id, !coach.isActive)}
                    title={coach.isActive ? "Désactiver" : "Réactiver"}
                    style={{
                      padding: "6px 12px", borderRadius: 9, fontSize: 11.5, fontWeight: 700,
                      cursor: "pointer", fontFamily: "inherit", border: `1px solid ${C.border}`,
                      background: coach.isActive ? C.creamWarm : C.greenSoft,
                      color: coach.isActive ? C.inkSoft : C.greenAccent,
                    }}
                  >
                    {coach.isActive ? "Désactiver" : "Réactiver"}
                  </button>
                  {confirmDelete === coach.id ? (
                    <div style={{ display: "flex", gap: 4 }}>
                      <button
                        onClick={() => deleteCoach(coach.id)}
                        style={{
                          padding: "6px 12px", borderRadius: 9, fontSize: 11.5, fontWeight: 700,
                          cursor: "pointer", fontFamily: "inherit",
                          background: C.coralEnd, color: "#FFFFFF", border: "none",
                        }}
                      >
                        Confirmer
                      </button>
                      <button
                        onClick={() => setConfirmDelete(null)}
                        style={{
                          padding: "6px 10px", borderRadius: 9, fontSize: 11.5,
                          cursor: "pointer", fontFamily: "inherit",
                          background: "none", border: `1px solid ${C.border}`, color: C.inkMute,
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDelete(coach.id)}
                      title="Supprimer"
                      style={{
                        padding: "6px 10px", borderRadius: 9, fontSize: 13,
                        cursor: "pointer", fontFamily: "inherit",
                        background: "none", border: `1px solid ${C.border}`, color: C.inkMute,
                      }}
                    >
                      🗑
                    </button>
                  )}
                </div>
              )}
              {isSelf && (
                <span style={{ fontSize: 11, color: C.inkMute, fontStyle: "italic", flexShrink: 0 }}>Vous</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
