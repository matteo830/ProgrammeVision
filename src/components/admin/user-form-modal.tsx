"use client";
import { useState } from "react";
import { X } from "lucide-react";

type User = { id: string; firstName: string; lastName: string; email: string; role: string; ghlCalendarSlug?: string | null };

type Props = {
  user: User | null;
  defaultRole: "CLIENT" | "COACH" | "ADMIN";
  onClose: () => void;
  onSuccess: () => void;
};

const inputClass = "w-full px-3 py-2.5 rounded-[10px] text-[13.5px]";
const inputStyle = { border: "1px solid var(--border)", background: "#fff", color: "var(--ink)", fontFamily: "inherit", outline: "none" };
const labelStyle = { color: "var(--ink-soft)", fontSize: "12px", fontWeight: 600, letterSpacing: "0.03em" };

export function UserFormModal({ user, defaultRole, onClose, onSuccess }: Props) {
  const isEdit = !!user;
  const [form, setForm] = useState({
    firstName: user?.firstName ?? "",
    lastName: user?.lastName ?? "",
    email: user?.email ?? "",
    password: "",
    role: user?.role ?? defaultRole,
    programStartDate: "",
    ghlCalendarSlug: user?.ghlCalendarSlug ?? "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const url = isEdit ? `/api/admin/users/${user!.id}` : "/api/admin/users";
    const method = isEdit ? "PATCH" : "POST";
    const isCoachOrAdmin = form.role === "COACH" || form.role === "ADMIN";
    const body = isEdit
      ? {
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          ...(form.password ? { password: form.password } : {}),
          ...(isCoachOrAdmin ? { ghlCalendarSlug: form.ghlCalendarSlug } : {}),
        }
      : form;

    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return setError(data.error || "Erreur");
    onSuccess();
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ background: "rgba(26,23,20,0.5)" }}>
      <div className="w-full max-w-md rounded-[20px] shadow-2xl p-6" style={{ background: "#fff" }}>

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.1em] mb-0.5" style={{ color: "var(--ink-mute)" }}>
              {isEdit ? "Modifier" : "Créer"}
            </p>
            <h2 className="text-[17px] font-extrabold" style={{ color: "var(--ink)" }}>
              {isEdit ? `${user!.firstName} ${user!.lastName}` : "Nouveau compte"}
            </h2>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
            style={{ background: "var(--border-soft)", color: "var(--ink-soft)" }}>
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">

          {/* Rôle (création uniquement) */}
          {!isEdit && (
            <div>
              <label className="block mb-1.5" style={labelStyle}>Rôle</label>
              <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                className={inputClass} style={inputStyle}>
                <option value="CLIENT">Client</option>
                <option value="COACH">Coach</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
          )}

          {/* Prénom / Nom */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block mb-1.5" style={labelStyle}>Prénom</label>
              <input required value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
                className={inputClass} style={inputStyle} />
            </div>
            <div>
              <label className="block mb-1.5" style={labelStyle}>Nom</label>
              <input required value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
                className={inputClass} style={inputStyle} />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block mb-1.5" style={labelStyle}>Email</label>
            <input type="email" required value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              className={inputClass} style={inputStyle} />
          </div>

          {/* Mot de passe */}
          <div>
            <label className="block mb-1.5" style={labelStyle}>
              Mot de passe
              {isEdit && <span className="ml-1 font-normal" style={{ color: "var(--ink-mute)" }}>(laisser vide pour ne pas changer)</span>}
            </label>
            <input type="password" required={!isEdit} minLength={8} value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              placeholder={isEdit ? "Nouveau mot de passe" : "8 caractères minimum"}
              className={inputClass} style={inputStyle} />
          </div>

          {/* Date début (client, création) */}
          {!isEdit && form.role === "CLIENT" && (
            <div>
              <label className="block mb-1.5" style={labelStyle}>Date de début du programme</label>
              <input type="date" value={form.programStartDate}
                onChange={e => setForm(f => ({ ...f, programStartDate: e.target.value }))}
                className={inputClass} style={inputStyle} />
            </div>
          )}

          {/* Calendrier GHL (coach ou admin) */}
          {(form.role === "COACH" || form.role === "ADMIN") && (
            <div>
              <label className="block mb-1.5" style={labelStyle}>
                Calendrier GHL
                <span className="ml-1 font-normal" style={{ color: "var(--ink-mute)" }}>(code iframe ou URL)</span>
              </label>
              <textarea
                value={form.ghlCalendarSlug}
                onChange={e => setForm(f => ({ ...f, ghlCalendarSlug: e.target.value }))}
                placeholder={`<iframe src="https://api.leadconnectorhq.com/widget/booking/..." ...></iframe>`}
                rows={3}
                className="w-full px-3 py-2.5 rounded-[10px] text-[12px] resize-none font-mono"
                style={{ ...inputStyle, color: "var(--ink-soft)" }}
              />
            </div>
          )}

          {error && (
            <p className="text-[12.5px] px-3 py-2 rounded-[8px]"
              style={{ background: "rgba(232,82,125,0.08)", color: "var(--coral-end)" }}>
              {error}
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-2.5 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-[12px] text-[13.5px] font-semibold transition-colors"
              style={{ border: "1px solid var(--border)", color: "var(--ink-soft)", background: "#fff" }}>
              Annuler
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-2.5 rounded-[12px] text-[13.5px] font-bold text-white transition-opacity disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, var(--coral-start), var(--coral-end))" }}>
              {loading ? "…" : isEdit ? "Enregistrer" : "Créer le compte"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
