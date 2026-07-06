"use client";

import { useState } from "react";
import { CheckCircle2, Edit2, X, Save } from "lucide-react";

interface Module {
  id: string;
  title: string;
  description: string | null;
  videoUrl: string | null;
  exerciseUrl: string | null;
}

interface Phase {
  id: string;
  order: number;
  title: string;
  modules: Module[];
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "8px 12px",
  border: "1px solid var(--border)",
  borderRadius: 10,
  fontSize: 12,
  color: "var(--ink)",
  background: "#fff",
  fontFamily: "inherit",
  outline: "none",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 11,
  fontWeight: 600,
  color: "var(--ink-soft)",
  letterSpacing: "0.03em",
  marginBottom: 4,
};

export function ModulesManagerView({ phases }: { phases: Phase[] }) {
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<Record<string, { videoUrl: string; exerciseUrl: string }>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<Set<string>>(new Set());

  function startEdit(module: Module) {
    setEditing(module.id);
    setForm((prev) => ({
      ...prev,
      [module.id]: { videoUrl: module.videoUrl ?? "", exerciseUrl: module.exerciseUrl ?? "" },
    }));
  }

  async function saveModule(moduleId: string) {
    setSaving(moduleId);
    await fetch("/api/modules", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: moduleId,
        videoUrl: form[moduleId].videoUrl || null,
        exerciseUrl: form[moduleId].exerciseUrl || null,
      }),
    });
    setSaving(null);
    setEditing(null);
    setSaved((prev) => new Set([...prev, moduleId]));
    setTimeout(() => setSaved((prev) => { const s = new Set(prev); s.delete(moduleId); return s; }), 3000);
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">

      {/* Hero */}
      <div className="relative overflow-hidden rounded-[20px] mb-6"
        style={{ background: "linear-gradient(160deg, var(--green-deep) 0%, #07251F 100%)", padding: "24px 24px 22px" }}>
        <p className="text-[11px] font-bold uppercase tracking-[0.12em] mb-1.5" style={{ color: "var(--gold-light)" }}>
          Contenu
        </p>
        <h1 className="text-[22px] font-extrabold leading-tight tracking-[-0.02em]" style={{ color: "#fff" }}>
          Gestion des modules
        </h1>
        <p className="text-[13px] mt-0.5" style={{ color: "rgba(255,255,255,0.65)" }}>
          Configurez les liens vidéo et exercices pour chaque module
        </p>
      </div>

      <div className="space-y-4">
        {phases.map((phase) => (
          <div key={phase.id} className="rounded-[16px] overflow-hidden"
            style={{ background: "#fff", border: "1px solid var(--border)" }}>

            {/* Phase header */}
            <div className="px-5 py-3.5" style={{ borderBottom: "1px solid var(--border-soft)", background: "var(--cream)" }}>
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0"
                  style={{ background: "var(--green-soft)", color: "var(--green-deep)" }}>
                  {phase.order}
                </div>
                <p className="text-[14px] font-bold" style={{ color: "var(--ink)" }}>{phase.title}</p>
              </div>
            </div>

            {/* Modules */}
            <div className="p-4 space-y-3">
              {phase.modules.map((module) => (
                <div key={module.id} className="rounded-[12px] p-3"
                  style={{
                    border: `1px solid ${saved.has(module.id) ? "var(--green-accent)" : "var(--border-soft)"}`,
                    background: saved.has(module.id) ? "var(--green-soft)" : "#fff",
                  }}>

                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[13px] font-semibold" style={{ color: "var(--ink)" }}>{module.title}</p>
                    <div className="flex items-center gap-2">
                      {saved.has(module.id) && (
                        <span className="text-[11px] flex items-center gap-1 font-semibold" style={{ color: "var(--green-deep)" }}>
                          <CheckCircle2 className="w-3.5 h-3.5" /> Enregistré
                        </span>
                      )}
                      {editing === module.id ? (
                        <button onClick={() => setEditing(null)}
                          className="p-1 rounded transition-colors"
                          style={{ color: "var(--ink-mute)" }}>
                          <X className="w-4 h-4" />
                        </button>
                      ) : (
                        <button onClick={() => startEdit(module)}
                          className="p-1 rounded transition-colors"
                          style={{ color: "var(--ink-mute)" }}>
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {editing === module.id ? (
                    <div className="space-y-3">
                      <div>
                        <label style={labelStyle}>Lien vidéo (GHL)</label>
                        <input
                          value={form[module.id]?.videoUrl ?? ""}
                          onChange={(e) => setForm((prev) => ({
                            ...prev,
                            [module.id]: { ...prev[module.id], videoUrl: e.target.value },
                          }))}
                          placeholder="https://..."
                          style={inputStyle}
                        />
                      </div>
                      <div>
                        <label style={labelStyle}>Lien exercice (Google Docs/Sheets)</label>
                        <input
                          value={form[module.id]?.exerciseUrl ?? ""}
                          onChange={(e) => setForm((prev) => ({
                            ...prev,
                            [module.id]: { ...prev[module.id], exerciseUrl: e.target.value },
                          }))}
                          placeholder="https://docs.google.com/..."
                          style={inputStyle}
                        />
                      </div>
                      <button
                        onClick={() => saveModule(module.id)}
                        disabled={saving === module.id}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-[10px] text-[13px] font-bold text-white transition-opacity disabled:opacity-50"
                        style={{ background: "linear-gradient(160deg, var(--green-deep), #07251F)" }}>
                        <Save className="w-3.5 h-3.5" />
                        {saving === module.id ? "Enregistrement..." : "Enregistrer"}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-0.5">
                      <p className="text-[11.5px]" style={{ color: "var(--ink-mute)" }}>
                        Vidéo :{" "}
                        <span style={{ color: module.videoUrl ? "var(--green-accent)" : "var(--coral-end)", fontWeight: 600 }}>
                          {module.videoUrl ? "configurée" : "non configurée"}
                        </span>
                      </p>
                      <p className="text-[11.5px]" style={{ color: "var(--ink-mute)" }}>
                        Exercice :{" "}
                        <span style={{ color: module.exerciseUrl ? "var(--green-accent)" : "var(--coral-end)", fontWeight: 600 }}>
                          {module.exerciseUrl ? "configuré" : "non configuré"}
                        </span>
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
