"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";

const C = {
  greenDeep: "#0E3D34", greenMid: "#1A5448", greenSoft: "#E8EFEC", greenAccent: "#3FA88E",
  gold: "#D4A047", goldLight: "#E8C56F", goldDeep: "#B8862E",
  coralStart: "#FF8A6B", coralEnd: "#E8527D",
  cream: "#FAF6EB", creamWarm: "#F2EBD8",
  ink: "#1A1714", inkSoft: "#5A5247", inkMute: "#9A9080",
  border: "#E8DFC8", borderSoft: "#F0E8D4",
};

interface ProfilViewProps {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    avatarUrl: string | null;
    clientProfile: {
      objective6months: string | null;
      currentRevenue: number | null;
      targetRevenue: number | null;
      currentSalary: number | null;
      targetSalary: number | null;
    } | null;
  };
}

function InputField({ label, value, onChange, type = "text", disabled = false, placeholder = "" }: {
  label: string; value: string; onChange?: (v: string) => void; type?: string; disabled?: boolean; placeholder?: string;
}) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: C.inkSoft, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 5, marginLeft: 2 }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        disabled={disabled}
        placeholder={placeholder}
        style={{
          width: "100%", padding: "11px 14px",
          background: disabled ? C.creamWarm : "#FFFFFF",
          border: `1px solid ${C.border}`, borderRadius: 12,
          fontSize: 13, color: disabled ? C.inkMute : C.ink,
          fontFamily: "inherit", boxSizing: "border-box",
        }}
      />
    </div>
  );
}

export function ProfilView({ user }: ProfilViewProps) {
  const [form, setForm] = useState({ firstName: user.firstName, lastName: user.lastName });
  const [objective, setObjective] = useState(user.clientProfile?.objective6months ?? "");
  const [finances, setFinances] = useState({
    currentRevenue: user.clientProfile?.currentRevenue?.toString() ?? "",
    targetRevenue: user.clientProfile?.targetRevenue?.toString() ?? "",
    currentSalary: user.clientProfile?.currentSalary?.toString() ?? "",
    targetSalary: user.clientProfile?.targetSalary?.toString() ?? "",
  });
  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [saving, setSaving] = useState<string | null>(null);
  const [messages, setMessages] = useState<Record<string, string>>({});

  function setMessage(key: string, msg: string) {
    setMessages((prev) => ({ ...prev, [key]: msg }));
    setTimeout(() => setMessages((prev) => { const n = { ...prev }; delete n[key]; return n; }), 3000);
  }

  async function saveProfile() {
    setSaving("profile");
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName: form.firstName,
        lastName: form.lastName,
        profile: {
          objective6months: objective || null,
          currentRevenue: finances.currentRevenue ? parseFloat(finances.currentRevenue) : null,
          targetRevenue: finances.targetRevenue ? parseFloat(finances.targetRevenue) : null,
          currentSalary: finances.currentSalary ? parseFloat(finances.currentSalary) : null,
          targetSalary: finances.targetSalary ? parseFloat(finances.targetSalary) : null,
        },
      }),
    });
    setSaving(null);
    if (res.ok) setMessage("profile", "Profil mis à jour ✓");
    else setMessage("profile", "Erreur lors de la sauvegarde");
  }

  async function changePassword() {
    if (passwords.newPassword !== passwords.confirmPassword) {
      setMessage("password", "Les mots de passe ne correspondent pas");
      return;
    }
    if (passwords.newPassword.length < 8) {
      setMessage("password", "Le mot de passe doit contenir au moins 8 caractères");
      return;
    }
    setSaving("password");
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword: passwords.currentPassword, newPassword: passwords.newPassword }),
    });
    setSaving(null);
    const data = await res.json();
    if (res.ok) {
      setMessage("password", "Mot de passe modifié ✓");
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } else {
      setMessage("password", data.error ?? "Erreur");
    }
  }

  const currentRevenue = parseFloat(finances.currentRevenue) || 0;
  const targetRevenue = parseFloat(finances.targetRevenue) || 0;
  const progressPct = targetRevenue > 0 ? Math.min(100, Math.round((currentRevenue / targetRevenue) * 100)) : 0;

  return (
    <div style={{ maxWidth: 560, margin: "0 auto", padding: "20px 16px 80px", fontFamily: "'Inter', sans-serif", color: C.ink }}>

      {/* Hero card */}
      <div style={{
        background: `linear-gradient(160deg, ${C.greenDeep} 0%, #07251F 100%)`,
        color: "#FFFFFF", borderRadius: 24, padding: "20px 20px 18px",
        position: "relative", overflow: "hidden", marginBottom: 20,
      }}>
        <svg width="160" height="120" viewBox="0 0 160 120" style={{ position: "absolute", bottom: -10, right: -20, opacity: 0.2 }}>
          <path d="M0 100 L30 70 L60 90 L90 50 L130 80 L160 60 L160 120 L0 120 Z" fill={C.gold} />
        </svg>
        <div style={{ display: "flex", alignItems: "center", gap: 14, position: "relative" }}>
          <div style={{
            width: 64, height: 64, borderRadius: "50%",
            background: `linear-gradient(135deg, ${C.coralStart}, ${C.coralEnd})`,
            color: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 700, fontSize: 26, flexShrink: 0,
            border: `3px solid ${C.gold}`,
          }}>
            {user.avatarUrl
              ? <img src={user.avatarUrl} alt="" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
              : user.firstName[0]
            }
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: 19, fontWeight: 700, margin: 0, color: "#FFFFFF", letterSpacing: "-0.02em" }}>
              {user.firstName} {user.lastName}
            </h2>
            <p style={{ fontSize: 11.5, color: C.goldLight, margin: "3px 0 0", fontWeight: 600 }}>{user.email}</p>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 5, marginTop: 6,
              padding: "3px 9px", background: "rgba(212,160,71,0.18)", borderRadius: 999,
            }}>
              <span style={{ fontSize: 10, color: C.goldLight, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                {user.role === "COACH" ? "Coach" : user.role === "ADMIN" ? "Admin" : "Cliente"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Informations personnelles */}
      <div style={{ background: "#FFFFFF", borderRadius: 20, border: `1px solid ${C.border}`, padding: "16px 18px", marginBottom: 14 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: C.inkMute, letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 14px" }}>
          Informations personnelles
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
          <InputField label="Prénom" value={form.firstName} onChange={(v) => setForm({ ...form, firstName: v })} />
          <InputField label="Nom" value={form.lastName} onChange={(v) => setForm({ ...form, lastName: v })} />
        </div>
        <InputField label="Email" value={user.email} disabled />
        {messages.profile && (
          <p style={{ fontSize: 12, fontWeight: 600, color: messages.profile.includes("✓") ? C.greenAccent : C.coralEnd, marginTop: 8, marginBottom: 0 }}>
            {messages.profile}
          </p>
        )}
      </div>

      {/* Objectif et finances (clients uniquement) */}
      {user.role === "CLIENT" && (
        <div style={{ background: "#FFFFFF", borderRadius: 20, border: `1px solid ${C.border}`, padding: "16px 18px", marginBottom: 14 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: C.inkMute, letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 14px" }}>
            Mon objectif &amp; mes chiffres
          </p>
          <div style={{ marginBottom: 10 }}>
            <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: C.inkSoft, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 5, marginLeft: 2 }}>
              Objectif 6 mois
            </label>
            <textarea
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              placeholder="Ex: Atteindre 10K€/mois avec un tunnel structuré"
              style={{
                width: "100%", minHeight: 72, padding: "11px 14px",
                background: "#FFFFFF", border: `1px solid ${C.border}`, borderRadius: 12,
                fontSize: 13, color: C.ink, fontFamily: "inherit",
                resize: "vertical", boxSizing: "border-box",
              }}
            />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <InputField label="CA actuel (€/mois)" type="number" value={finances.currentRevenue} placeholder="0"
              onChange={(v) => setFinances({ ...finances, currentRevenue: v })} />
            <InputField label="CA objectif (€/mois)" type="number" value={finances.targetRevenue} placeholder="10000"
              onChange={(v) => setFinances({ ...finances, targetRevenue: v })} />
          </div>
          {targetRevenue > 0 && (
            <div style={{ marginTop: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: C.inkSoft, marginBottom: 4 }}>
                <span>Progression vers l&apos;objectif</span>
                <span style={{ fontWeight: 700, color: C.coralEnd }}>{progressPct}%</span>
              </div>
              <div style={{ height: 5, background: C.borderSoft, borderRadius: 3, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${progressPct}%`, background: `linear-gradient(90deg, ${C.coralStart}, ${C.coralEnd})`, borderRadius: 3 }} />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Save button */}
      <button
        onClick={saveProfile}
        disabled={saving === "profile"}
        style={{
          width: "100%", padding: "13px 16px", marginBottom: 20,
          background: `linear-gradient(135deg, ${C.coralStart} 0%, ${C.coralEnd} 100%)`,
          color: "#FFFFFF", border: "none", borderRadius: 14,
          fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
          opacity: saving === "profile" ? 0.7 : 1,
          boxShadow: `0 8px 22px -10px ${C.coralEnd}80`,
        }}
      >
        {saving === "profile" ? "Enregistrement..." : "Enregistrer les modifications"}
      </button>

      {/* Mot de passe */}
      <div style={{ background: "#FFFFFF", borderRadius: 20, border: `1px solid ${C.border}`, padding: "16px 18px", marginBottom: 20 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: C.inkMute, letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 14px" }}>
          Changer le mot de passe
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <InputField label="Mot de passe actuel" type="password" value={passwords.currentPassword}
            onChange={(v) => setPasswords({ ...passwords, currentPassword: v })} />
          <InputField label="Nouveau mot de passe" type="password" value={passwords.newPassword}
            onChange={(v) => setPasswords({ ...passwords, newPassword: v })} />
          <InputField label="Confirmer le nouveau mot de passe" type="password" value={passwords.confirmPassword}
            onChange={(v) => setPasswords({ ...passwords, confirmPassword: v })} />
        </div>
        {messages.password && (
          <p style={{ fontSize: 12, fontWeight: 600, color: messages.password.includes("✓") ? C.greenAccent : C.coralEnd, marginTop: 8, marginBottom: 0 }}>
            {messages.password}
          </p>
        )}
        <button
          onClick={changePassword}
          disabled={saving === "password" || !passwords.currentPassword || !passwords.newPassword}
          style={{
            width: "100%", marginTop: 14, padding: "12px 16px",
            background: "#FFFFFF", color: C.greenDeep,
            border: `1.5px solid ${C.greenDeep}`,
            borderRadius: 12, fontSize: 13, fontWeight: 700,
            cursor: (!passwords.currentPassword || !passwords.newPassword) ? "default" : "pointer",
            opacity: (saving === "password" || !passwords.currentPassword || !passwords.newPassword) ? 0.5 : 1,
            fontFamily: "inherit",
          }}
        >
          {saving === "password" ? "Modification..." : "Modifier le mot de passe"}
        </button>
      </div>

      {/* Déconnexion */}
      <button
        onClick={() => signOut({ callbackUrl: "/login" })}
        style={{
          width: "100%", padding: "13px 16px",
          background: "#FFFFFF", color: C.coralEnd,
          border: `1px solid ${C.coralEnd}40`,
          borderRadius: 14, fontSize: 13.5, fontWeight: 700,
          cursor: "pointer", fontFamily: "inherit",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
        </svg>
        Se déconnecter
      </button>
    </div>
  );
}
