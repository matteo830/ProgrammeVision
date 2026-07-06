"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const inputClass = "w-full px-3 py-2.5 rounded-[10px] text-[13.5px]";
const inputStyle = { border: "1px solid var(--border)", background: "#fff", color: "var(--ink)", fontFamily: "inherit", outline: "none" };
const labelStyle = { color: "var(--ink-soft)", fontSize: "12px", fontWeight: 600, letterSpacing: "0.03em" } as React.CSSProperties;

export function AdminSetupForm() {
  const router = useRouter();
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/admin/setup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return setError(data.error || "Erreur");
    router.push("/login");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
      <div>
        <label className="block mb-1.5" style={labelStyle}>Email</label>
        <input type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
          className={inputClass} style={inputStyle} />
      </div>
      <div>
        <label className="block mb-1.5" style={labelStyle}>Mot de passe</label>
        <input type="password" required minLength={8} value={form.password}
          onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
          placeholder="8 caractères minimum"
          className={inputClass} style={inputStyle} />
      </div>
      {error && (
        <p className="text-[12.5px] px-3 py-2 rounded-[8px]"
          style={{ background: "rgba(232,82,125,0.08)", color: "var(--coral-end)" }}>
          {error}
        </p>
      )}
      <button type="submit" disabled={loading}
        className="w-full py-3 rounded-[12px] font-bold text-[14px] text-white transition-opacity disabled:opacity-50"
        style={{ background: "linear-gradient(160deg, var(--green-deep), #07251F)" }}>
        {loading ? "Création en cours…" : "Créer le compte administrateur"}
      </button>
    </form>
  );
}
