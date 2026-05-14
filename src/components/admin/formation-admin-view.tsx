"use client";

import type { CSSProperties } from "react";
import { useState } from "react";

const C = {
  greenDeep: "#0E3D34", greenSoft: "#E8EFEC", greenAccent: "#3FA88E",
  coralStart: "#FF8A6B", coralEnd: "#E8527D",
  cream: "#FAF6EB", ink: "#1A1714", inkSoft: "#5A5247", inkMute: "#9A9080",
  border: "#E8DFC8", borderSoft: "#F0E8D4", white: "#FFFFFF", goldLight: "#E8C56F",
};

interface Lesson { id: string; title: string; order: number }
interface Module { id: string; title: string; description: string | null; templateDriveId: string | null; order: number; lessons: Lesson[] }
interface Course { id: string; title: string; description: string | null; imageUrl: string | null; accessUrl: string | null; order: number; modules: Module[] }

const btn = (variant: "primary" | "secondary" | "danger" | "ghost", extra?: CSSProperties): CSSProperties => ({
  border: "none", borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", padding: "7px 14px",
  ...(variant === "primary" && { background: `linear-gradient(135deg, ${C.coralStart}, ${C.coralEnd})`, color: C.white }),
  ...(variant === "secondary" && { background: C.greenSoft, color: C.greenDeep, border: `1px solid ${C.greenAccent}40` }),
  ...(variant === "danger" && { background: `${C.coralEnd}15`, color: C.coralEnd }),
  ...(variant === "ghost" && { background: C.borderSoft, color: C.inkSoft }),
  ...extra,
});

const input: CSSProperties = {
  width: "100%", padding: "9px 12px", borderRadius: 9, border: `1px solid ${C.border}`,
  fontSize: 13, fontFamily: "inherit", color: C.ink, background: C.cream, boxSizing: "border-box",
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: C.inkSoft, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 5 }}>{label}</label>
      {children}
    </div>
  );
}

// ── Lesson row ────────────────────────────────────────────────────────────────
function LessonRow({ lesson, courseId, moduleId, onDelete }: { lesson: Lesson; courseId: string; moduleId: string; onDelete: (id: string) => void }) {
  async function del() {
    if (!confirm("Supprimer cette leçon ?")) return;
    await fetch(`/api/admin/formations/${courseId}/modules/${moduleId}/lessons`, {
      method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ lessonId: lesson.id }),
    });
    onDelete(lesson.id);
  }
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 0", borderBottom: `1px solid ${C.borderSoft}` }}>
      <span style={{ fontSize: 11, color: C.inkMute, width: 18, textAlign: "center" }}>{lesson.order + 1}</span>
      <span style={{ flex: 1, fontSize: 13, color: C.ink }}>{lesson.title}</span>
      <button onClick={del} style={btn("danger", { padding: "4px 10px", fontSize: 11 })}>✕</button>
    </div>
  );
}

// ── Module card ───────────────────────────────────────────────────────────────
function ModuleCard({ mod, courseId, onUpdate, onDelete }: { mod: Module; courseId: string; onUpdate: (m: Module) => void; onDelete: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ title: mod.title, description: mod.description ?? "", templateDriveId: mod.templateDriveId ?? "" });
  const [saving, setSaving] = useState(false);
  const [lessons, setLessons] = useState(mod.lessons);
  const [newLesson, setNewLesson] = useState("");
  const [addingLesson, setAddingLesson] = useState(false);

  async function saveModule() {
    setSaving(true);
    const res = await fetch(`/api/admin/formations/${courseId}/modules/${mod.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
    });
    if (res.ok) { onUpdate({ ...mod, ...form, lessons }); setEditing(false); }
    setSaving(false);
  }

  async function addLesson() {
    if (!newLesson.trim()) return;
    setAddingLesson(true);
    const res = await fetch(`/api/admin/formations/${courseId}/modules/${mod.id}/lessons`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: newLesson }),
    });
    if (res.ok) { const l = await res.json(); setLessons((p) => [...p, l]); setNewLesson(""); }
    setAddingLesson(false);
  }

  async function delModule() {
    if (!confirm("Supprimer ce module et toutes ses leçons ?")) return;
    await fetch(`/api/admin/formations/${courseId}/modules/${mod.id}`, { method: "DELETE" });
    onDelete(mod.id);
  }

  return (
    <div style={{ background: C.cream, borderRadius: 14, border: `1px solid ${C.border}`, overflow: "hidden", marginBottom: 10 }}>
      {/* Module header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px" }}>
        <button onClick={() => setOpen((o) => !o)} style={{ flex: 1, background: "none", border: "none", cursor: "pointer", textAlign: "left", padding: 0, fontFamily: "inherit" }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: C.ink }}>{mod.title}</span>
          <span style={{ fontSize: 12, color: C.inkMute, marginLeft: 8 }}>{lessons.length} leçon{lessons.length !== 1 ? "s" : ""}</span>
          {mod.templateDriveId && <span style={{ fontSize: 11, color: C.greenAccent, marginLeft: 8 }}>📄 Template</span>}
        </button>
        <button onClick={() => { setEditing((e) => !e); setOpen(true); }} style={btn("ghost", { padding: "5px 12px" })}>Modifier</button>
        <button onClick={delModule} style={btn("danger", { padding: "5px 10px" })}>✕</button>
        <span style={{ color: C.inkMute, fontSize: 14, cursor: "pointer" }} onClick={() => setOpen((o) => !o)}>{open ? "▲" : "▼"}</span>
      </div>

      {open && (
        <div style={{ padding: "0 16px 16px" }}>
          {/* Edit form */}
          {editing && (
            <div style={{ background: C.white, borderRadius: 12, padding: "16px", marginBottom: 14, border: `1px solid ${C.border}` }}>
              <Field label="Titre *"><input style={input} value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} /></Field>
              <Field label="Description"><textarea style={{ ...input, minHeight: 60, resize: "vertical" }} value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} /></Field>
              <Field label="Google Drive File ID du template">
                <input style={input} value={form.templateDriveId} onChange={(e) => setForm((p) => ({ ...p, templateDriveId: e.target.value }))} placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms" />
                <p style={{ fontSize: 11, color: C.inkMute, margin: "4px 0 0" }}>L&apos;ID se trouve dans l&apos;URL du fichier Drive : drive.google.com/file/d/<strong>[ID]</strong>/edit</p>
              </Field>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={saveModule} disabled={saving} style={btn("primary")}>Enregistrer</button>
                <button onClick={() => setEditing(false)} style={btn("ghost")}>Annuler</button>
              </div>
            </div>
          )}

          {/* Lessons */}
          <div style={{ marginBottom: 10 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: C.inkMute, textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 8px" }}>Leçons</p>
            {lessons.length === 0 && <p style={{ fontSize: 12, color: C.inkMute, fontStyle: "italic" }}>Aucune leçon</p>}
            {lessons.map((l) => (
              <LessonRow key={l.id} lesson={l} courseId={courseId} moduleId={mod.id} onDelete={(id) => setLessons((p) => p.filter((x) => x.id !== id))} />
            ))}
          </div>

          {/* Add lesson */}
          <div style={{ display: "flex", gap: 8 }}>
            <input
              style={{ ...input, flex: 1 }}
              value={newLesson}
              onChange={(e) => setNewLesson(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addLesson()}
              placeholder="Nom de la leçon…"
            />
            <button onClick={addLesson} disabled={addingLesson || !newLesson.trim()} style={btn("secondary")}>
              + Ajouter
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Course card ───────────────────────────────────────────────────────────────
function CourseCard({ course, onUpdate, onDelete }: { course: Course; onUpdate: (c: Course) => void; onDelete: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ title: course.title, description: course.description ?? "", imageUrl: course.imageUrl ?? "", accessUrl: course.accessUrl ?? "" });
  const [saving, setSaving] = useState(false);
  const [modules, setModules] = useState(course.modules);
  const [newMod, setNewMod] = useState({ title: "", description: "", templateDriveId: "" });
  const [showModForm, setShowModForm] = useState(false);
  const [addingMod, setAddingMod] = useState(false);

  async function saveCourse() {
    setSaving(true);
    const res = await fetch(`/api/admin/formations/${course.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
    });
    if (res.ok) { onUpdate({ ...course, ...form, modules }); setEditing(false); }
    setSaving(false);
  }

  async function addModule() {
    if (!newMod.title.trim()) return;
    setAddingMod(true);
    const res = await fetch(`/api/admin/formations/${course.id}/modules`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newMod),
    });
    if (res.ok) {
      const m = await res.json();
      setModules((p) => [...p, { ...m, lessons: m.lessons ?? [] }]);
      setNewMod({ title: "", description: "", templateDriveId: "" });
      setShowModForm(false);
    }
    setAddingMod(false);
  }

  async function deleteCourse() {
    if (!confirm("Supprimer ce cours et tous ses modules ?")) return;
    await fetch(`/api/admin/formations/${course.id}`, { method: "DELETE" });
    onDelete(course.id);
  }

  return (
    <div style={{ background: C.white, borderRadius: 20, border: `1px solid ${C.border}`, overflow: "hidden", marginBottom: 16 }}>
      {/* Course header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "18px 20px" }}>
        <div style={{ width: 48, height: 48, borderRadius: 10, background: C.borderSoft, flexShrink: 0, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {course.imageUrl ? <img src={course.imageUrl} alt={course.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ fontSize: 24 }}>📚</span>}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 15, fontWeight: 700, margin: "0 0 2px", color: C.ink }}>{course.title}</p>
          <p style={{ fontSize: 12, color: C.inkMute, margin: 0 }}>{modules.length} module{modules.length !== 1 ? "s" : ""}</p>
        </div>
        <button onClick={() => { setEditing((e) => !e); setOpen(true); }} style={btn("ghost")}>Modifier</button>
        <button onClick={deleteCourse} style={btn("danger")}>✕</button>
        <span style={{ color: C.inkMute, fontSize: 16, cursor: "pointer" }} onClick={() => setOpen((o) => !o)}>{open ? "▲" : "▼"}</span>
      </div>

      {open && (
        <div style={{ padding: "0 20px 20px" }}>
          {/* Edit course form */}
          {editing && (
            <div style={{ background: C.cream, borderRadius: 14, padding: "16px", marginBottom: 16, border: `1px solid ${C.border}` }}>
              <Field label="Titre *"><input style={input} value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} /></Field>
              <Field label="Description"><textarea style={{ ...input, minHeight: 60, resize: "vertical" }} value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} /></Field>
              <Field label="URL de l'image"><input style={input} value={form.imageUrl} onChange={(e) => setForm((p) => ({ ...p, imageUrl: e.target.value }))} placeholder="https://..." /></Field>
              <Field label="Lien d'accès GHL"><input style={input} value={form.accessUrl} onChange={(e) => setForm((p) => ({ ...p, accessUrl: e.target.value }))} placeholder="https://app.gohighlevel.com/..." /></Field>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={saveCourse} disabled={saving} style={btn("primary")}>Enregistrer</button>
                <button onClick={() => setEditing(false)} style={btn("ghost")}>Annuler</button>
              </div>
            </div>
          )}

          {/* Modules */}
          <p style={{ fontSize: 11, fontWeight: 700, color: C.inkMute, textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 12px" }}>
            Modules ({modules.length})
          </p>
          {modules.map((m) => (
            <ModuleCard
              key={m.id} mod={m} courseId={course.id}
              onUpdate={(updated) => setModules((p) => p.map((x) => x.id === updated.id ? updated : x))}
              onDelete={(id) => setModules((p) => p.filter((x) => x.id !== id))}
            />
          ))}

          {/* Add module form */}
          {showModForm ? (
            <div style={{ background: C.cream, borderRadius: 14, padding: "16px", border: `1px solid ${C.border}` }}>
              <Field label="Titre du module *"><input style={input} value={newMod.title} onChange={(e) => setNewMod((p) => ({ ...p, title: e.target.value }))} /></Field>
              <Field label="Description"><input style={input} value={newMod.description} onChange={(e) => setNewMod((p) => ({ ...p, description: e.target.value }))} /></Field>
              <Field label="Google Drive File ID du template">
                <input style={input} value={newMod.templateDriveId} onChange={(e) => setNewMod((p) => ({ ...p, templateDriveId: e.target.value }))} placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms" />
                <p style={{ fontSize: 11, color: C.inkMute, margin: "4px 0 0" }}>URL Drive : drive.google.com/file/d/<strong>[copie cet ID]</strong>/edit</p>
              </Field>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={addModule} disabled={addingMod || !newMod.title.trim()} style={btn("primary")}>
                  {addingMod ? "Création…" : "Créer le module"}
                </button>
                <button onClick={() => setShowModForm(false)} style={btn("ghost")}>Annuler</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setShowModForm(true)} style={btn("secondary", { width: "100%", padding: "10px", textAlign: "center" })}>
              + Ajouter un module
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────
export function FormationAdminView({ initialCourses }: { initialCourses: Course[] }) {
  const [courses, setCourses] = useState(initialCourses);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", imageUrl: "", accessUrl: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function addCourse() {
    if (!form.title.trim()) { setError("Titre requis"); return; }
    setSaving(true); setError("");
    const res = await fetch("/api/admin/formations", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error); setSaving(false); return; }
    setCourses((p) => [...p, { ...data, modules: [] }]);
    setForm({ title: "", description: "", imageUrl: "", accessUrl: "" });
    setShowForm(false);
    setSaving(false);
  }

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "28px 16px 80px", fontFamily: "'Inter', sans-serif", color: C.ink }}>
      <div style={{ marginBottom: 28 }}>
        <p style={{ fontSize: 11, color: C.inkMute, margin: "0 0 2px", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>Administration</p>
        <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0, letterSpacing: "-0.025em" }}>Contenus de formation</h1>
      </div>

      {/* Course list */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: C.inkSoft, letterSpacing: "0.08em", textTransform: "uppercase", margin: 0 }}>
          Cours ({courses.length})
        </p>
        <button onClick={() => setShowForm((s) => !s)} style={btn("primary", { padding: "9px 18px", borderRadius: 99, fontSize: 13 })}>
          + Ajouter un cours
        </button>
      </div>

      {showForm && (
        <div style={{ background: C.white, borderRadius: 20, border: `1px solid ${C.border}`, padding: "22px", marginBottom: 16 }}>
          <p style={{ fontSize: 15, fontWeight: 700, margin: "0 0 16px" }}>Nouveau cours</p>
          <Field label="Titre *"><input style={input} value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} /></Field>
          <Field label="Description"><textarea style={{ ...input, minHeight: 70, resize: "vertical" }} value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} /></Field>
          <Field label="URL de l'image (vignette)"><input style={input} value={form.imageUrl} onChange={(e) => setForm((p) => ({ ...p, imageUrl: e.target.value }))} placeholder="https://..." /></Field>
          <Field label="Lien d'accès GHL"><input style={input} value={form.accessUrl} onChange={(e) => setForm((p) => ({ ...p, accessUrl: e.target.value }))} placeholder="https://app.gohighlevel.com/..." /></Field>
          {error && <p style={{ fontSize: 12, color: C.coralEnd, margin: "0 0 12px", fontWeight: 600 }}>{error}</p>}
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={addCourse} disabled={saving} style={btn("primary", { padding: "10px 20px" })}>
              {saving ? "Création…" : "Créer le cours"}
            </button>
            <button onClick={() => setShowForm(false)} style={btn("ghost", { padding: "10px 16px" })}>Annuler</button>
          </div>
        </div>
      )}

      {courses.length === 0 && !showForm && (
        <div style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, padding: "40px 24px", textAlign: "center" }}>
          <p style={{ fontSize: 14, color: C.inkMute, margin: 0 }}>Aucun cours. Clique sur &quot;Ajouter un cours&quot; pour commencer.</p>
        </div>
      )}

      {courses.map((c) => (
        <CourseCard
          key={c.id} course={c}
          onUpdate={(updated) => setCourses((p) => p.map((x) => x.id === updated.id ? updated : x))}
          onDelete={(id) => setCourses((p) => p.filter((x) => x.id !== id))}
        />
      ))}
    </div>
  );
}
