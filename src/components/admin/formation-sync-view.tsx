"use client";

import { useState } from "react";

const C = {
  greenDeep: "#0E3D34",
  greenSoft: "#E8EFEC",
  greenAccent: "#3FA88E",
  gold: "#D4A047",
  goldLight: "#E8C56F",
  coralStart: "#FF8A6B",
  coralEnd: "#E8527D",
  cream: "#FAF6EB",
  ink: "#1A1714",
  inkSoft: "#5A5247",
  inkMute: "#9A9080",
  border: "#E8DFC8",
  borderSoft: "#F0E8D4",
  white: "#FFFFFF",
};

interface GhlCourse {
  id: string;
  ghlId: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  accessUrl: string | null;
  order: number;
  isActive: boolean;
  syncedAt: string;
}

interface FormationSyncViewProps {
  initialCourses: GhlCourse[];
  lastSync: string | null;
}

const emptyForm = { title: "", description: "", imageUrl: "", accessUrl: "" };

export function FormationSyncView({ initialCourses, lastSync: initialLastSync }: FormationSyncViewProps) {
  const [courses, setCourses] = useState(initialCourses);
  const [lastSync, setLastSync] = useState(initialLastSync);
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState<{ text: string; ok: boolean } | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  async function triggerSync() {
    setSyncing(true);
    setSyncMsg(null);
    try {
      const res = await fetch("/api/admin/ghl-sync", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setSyncMsg({ text: `Erreur : ${data.error}`, ok: false });
      } else {
        setSyncMsg({ text: `Synchronisation réussie — ${data.synced} cours importés`, ok: true });
        const refresh = await fetch("/api/admin/formations");
        if (refresh.ok) setCourses(await refresh.json());
        setLastSync(new Date().toISOString());
      }
    } catch {
      setSyncMsg({ text: "Erreur réseau", ok: false });
    } finally {
      setSyncing(false);
    }
  }

  function startAdd() {
    setEditingId(null);
    setForm(emptyForm);
    setFormError("");
    setShowForm(true);
  }

  function startEdit(course: GhlCourse) {
    setEditingId(course.id);
    setForm({
      title: course.title,
      description: course.description ?? "",
      imageUrl: course.imageUrl ?? "",
      accessUrl: course.accessUrl ?? "",
    });
    setFormError("");
    setShowForm(true);
  }

  function cancelForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
    setFormError("");
  }

  async function saveForm() {
    if (!form.title.trim()) { setFormError("Le titre est requis"); return; }
    setSaving(true);
    setFormError("");
    try {
      const url = editingId ? `/api/admin/formations/${editingId}` : "/api/admin/formations";
      const method = editingId ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setFormError(data.error ?? "Erreur"); return; }
      if (editingId) {
        setCourses((prev) => prev.map((c) => (c.id === editingId ? data : c)));
      } else {
        setCourses((prev) => [...prev, data]);
      }
      cancelForm();
    } catch {
      setFormError("Erreur réseau");
    } finally {
      setSaving(false);
    }
  }

  async function deleteCourse(id: string) {
    if (!confirm("Supprimer ce cours ?")) return;
    await fetch(`/api/admin/formations/${id}`, { method: "DELETE" });
    setCourses((prev) => prev.filter((c) => c.id !== id));
  }

  function formatDate(iso: string | null) {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("fr-FR", {
      day: "numeric", month: "long", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  }

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "28px 16px 80px", fontFamily: "'Inter', sans-serif", color: C.ink }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <p style={{ fontSize: 11, color: C.inkMute, margin: "0 0 2px", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>Administration</p>
        <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0, letterSpacing: "-0.025em" }}>Contenus de formation</h1>
      </div>

      {/* Sync card */}
      <div style={{ background: C.white, borderRadius: 20, border: `1px solid ${C.border}`, padding: "20px 22px", marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
          <div style={{ width: 40, height: 40, borderRadius: 11, background: C.greenDeep, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>🔄</div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>Synchronisation GoHighLevel</p>
            <p style={{ fontSize: 12, color: C.inkMute, margin: "2px 0 0" }}>Dernière synchro : {formatDate(lastSync)}</p>
          </div>
        </div>
        {syncMsg && (
          <p style={{ fontSize: 13, fontWeight: 600, color: syncMsg.ok ? C.greenAccent : C.coralEnd, margin: "0 0 10px" }}>{syncMsg.text}</p>
        )}
        <button
          onClick={triggerSync}
          disabled={syncing}
          style={{
            width: "100%", padding: "11px 16px",
            background: syncing ? C.borderSoft : C.greenSoft,
            color: syncing ? C.inkMute : C.greenDeep,
            border: `1px solid ${syncing ? C.border : C.greenAccent}`,
            borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: syncing ? "default" : "pointer", fontFamily: "inherit",
          }}
        >
          {syncing ? "Synchronisation en cours…" : "Tenter la synchro GHL"}
        </button>
      </div>

      {/* Course list */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: C.inkSoft, letterSpacing: "0.08em", textTransform: "uppercase", margin: 0 }}>
          Cours ({courses.length})
        </p>
        <button
          onClick={startAdd}
          style={{
            display: "flex", alignItems: "center", gap: 7,
            padding: "8px 16px", borderRadius: 99,
            background: `linear-gradient(135deg, ${C.coralStart}, ${C.coralEnd})`,
            color: C.white, border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
          }}
        >
          + Ajouter un cours
        </button>
      </div>

      {/* Add / Edit form */}
      {showForm && (
        <div style={{ background: C.white, borderRadius: 20, border: `1px solid ${C.border}`, padding: "22px", marginBottom: 16 }}>
          <p style={{ fontSize: 15, fontWeight: 700, margin: "0 0 18px" }}>
            {editingId ? "Modifier le cours" : "Nouveau cours"}
          </p>
          {(["title", "description", "imageUrl", "accessUrl"] as const).map((field) => (
            <div key={field} style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: C.inkSoft, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 5 }}>
                {field === "title" ? "Titre *" : field === "description" ? "Description" : field === "imageUrl" ? "URL de l'image" : "Lien d'accès GHL *"}
              </label>
              {field === "description" ? (
                <textarea
                  value={form[field]}
                  onChange={(e) => setForm((p) => ({ ...p, [field]: e.target.value }))}
                  rows={3}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: `1px solid ${C.border}`, fontSize: 13, fontFamily: "inherit", color: C.ink, background: C.cream, resize: "vertical", boxSizing: "border-box" }}
                />
              ) : (
                <input
                  type="text"
                  value={form[field]}
                  onChange={(e) => setForm((p) => ({ ...p, [field]: e.target.value }))}
                  placeholder={field === "accessUrl" ? "https://app.gohighlevel.com/..." : ""}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: `1px solid ${C.border}`, fontSize: 13, fontFamily: "inherit", color: C.ink, background: C.cream, boxSizing: "border-box" }}
                />
              )}
            </div>
          ))}
          {formError && <p style={{ fontSize: 12, color: C.coralEnd, margin: "0 0 12px", fontWeight: 600 }}>{formError}</p>}
          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={saveForm}
              disabled={saving}
              style={{ flex: 1, padding: "11px", borderRadius: 12, background: `linear-gradient(135deg, ${C.coralStart}, ${C.coralEnd})`, color: C.white, border: "none", fontSize: 13, fontWeight: 700, cursor: saving ? "default" : "pointer", fontFamily: "inherit", opacity: saving ? 0.7 : 1 }}
            >
              {saving ? "Enregistrement…" : editingId ? "Mettre à jour" : "Ajouter"}
            </button>
            <button
              onClick={cancelForm}
              style={{ padding: "11px 20px", borderRadius: 12, background: C.borderSoft, color: C.inkSoft, border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Empty state */}
      {courses.length === 0 && !showForm && (
        <div style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, padding: "32px 24px", textAlign: "center" }}>
          <p style={{ fontSize: 14, color: C.inkMute, margin: 0 }}>
            Aucun cours. Clique sur &quot;Ajouter un cours&quot; pour en créer un.
          </p>
        </div>
      )}

      {/* Course cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {courses.map((course) => (
          <div
            key={course.id}
            style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, padding: "16px 18px", display: "flex", alignItems: "center", gap: 14 }}
          >
            {/* Thumbnail */}
            <div style={{ width: 52, height: 52, borderRadius: 10, background: C.borderSoft, flexShrink: 0, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {course.imageUrl
                // eslint-disable-next-line @next/next/no-img-element
                ? <img src={course.imageUrl} alt={course.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : <span style={{ fontSize: 22 }}>📚</span>}
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 14, fontWeight: 700, margin: "0 0 2px", color: C.ink }}>{course.title}</p>
              {course.description && (
                <p style={{ fontSize: 12, color: C.inkMute, margin: "0 0 3px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {course.description}
                </p>
              )}
              {course.accessUrl && (
                <a href={course.accessUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: C.greenAccent }}>
                  ↗ Vérifier le lien
                </a>
              )}
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
              <button
                onClick={() => startEdit(course)}
                style={{ padding: "6px 14px", borderRadius: 8, background: C.borderSoft, color: C.inkSoft, border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
              >
                Modifier
              </button>
              <button
                onClick={() => deleteCourse(course.id)}
                style={{ padding: "6px 12px", borderRadius: 8, background: `${C.coralEnd}15`, color: C.coralEnd, border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
