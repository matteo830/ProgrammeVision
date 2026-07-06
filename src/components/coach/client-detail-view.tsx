"use client";

import { useState } from "react";
import Link from "next/link";
import { SessionForm } from "@/components/coach/session-form";
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  MessageCircle,
  FileText,
  ChevronDown,
  ChevronUp,
  Lock,
  Eye,
  EyeOff,
  Send,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

interface ClientDetailViewProps {
  client: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatarUrl: string | null;
    clientProfile: {
      objective6months: string | null;
      currentRevenue: number | null;
      targetRevenue: number | null;
      programStartDate: Date | null;
      ghlBookingUrl: string | null;
    } | null;
  };
  progress: {
    globalPercent: number;
    phases: Array<{
      id: string;
      order: number;
      title: string;
      isCompleted: boolean;
      isUnlocked: boolean;
      progressPercent: number;
      modules: Array<{
        id: string;
        title: string;
        progress: {
          videoWatched: boolean;
          exerciseSubmitted: boolean;
          coachValidated: boolean;
          coachComment: string | null;
        } | null;
      }>;
    }>;
  };
  notes: Array<{
    id: string;
    content: string;
    visibility: string;
    createdAt: Date;
    author: { firstName: string; lastName: string; role: string };
  }>;
  questions: Array<{
    id: string;
    category: string;
    content: string;
    status: string;
    createdAt: Date;
    user: { firstName: string; lastName: string };
    replies: Array<{
      id: string;
      content: string;
      createdAt: Date;
      author: { firstName: string; lastName: string; role: string };
    }>;
  }>;
  sessions: Array<{
    id: string;
    title: string;
    scheduledAt: Date;
    meetingUrl: string | null;
    firefliesUrl: string | null;
    summary: string | null;
    decisions: string | null;
    actions: Array<{ id: string; content: string; completedByClient: boolean }>;
  }>;
}

type ActiveTab = "formation" | "notes" | "questions" | "seances";

const inputStyle: React.CSSProperties = {
  border: "1px solid var(--border)",
  background: "#fff",
  color: "var(--ink)",
  fontFamily: "inherit",
  outline: "none",
};

export function ClientDetailView({
  client,
  progress,
  notes: initialNotes,
  questions: initialQuestions,
  sessions: initialSessions,
}: ClientDetailViewProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>("formation");
  const [notes, setNotes] = useState(initialNotes);
  const [questions, setQuestions] = useState(initialQuestions);
  const [sessions, setSessions] = useState(initialSessions);
  const [sessionFormOpen, setSessionFormOpen] = useState<string | null>(null);
  const [creatingSession, setCreatingSession] = useState(false);
  const [newSessionTitle, setNewSessionTitle] = useState("");
  const [newSessionDate, setNewSessionDate] = useState("");
  const [showNewSessionForm, setShowNewSessionForm] = useState(false);
  const [expandedPhase, setExpandedPhase] = useState<number | null>(null);
  const [noteContent, setNoteContent] = useState("");
  const [noteVisibility, setNoteVisibility] = useState<"CLIENT_VISIBLE" | "TEAM_ONLY">("CLIENT_VISIBLE");
  const [savingNote, setSavingNote] = useState(false);
  const [replyContent, setReplyContent] = useState<Record<string, string>>({});
  const [validating, setValidating] = useState<string | null>(null);
  const [coachComment, setCoachComment] = useState<Record<string, string>>({});

  async function saveNote() {
    if (!noteContent.trim()) return;
    setSavingNote(true);
    const res = await fetch("/api/coaching/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: noteContent, clientId: client.id, visibility: noteVisibility }),
    });
    const note = await res.json();
    setNotes([note, ...notes]);
    setNoteContent("");
    setSavingNote(false);
  }

  async function validateModule(moduleId: string, validated: boolean) {
    setValidating(moduleId);
    await fetch("/api/modules/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ moduleId, clientId: client.id, validated, coachComment: coachComment[moduleId] ?? null }),
    });
    setValidating(null);
    window.location.reload();
  }

  async function sendReply(questionId: string) {
    const content = replyContent[questionId];
    if (!content?.trim()) return;
    const res = await fetch(`/api/questions/${questionId}/reply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    const reply = await res.json();
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId ? { ...q, status: "ANSWERED", replies: [...q.replies, reply] } : q
      )
    );
    setReplyContent((prev) => ({ ...prev, [questionId]: "" }));
  }

  async function createSession() {
    if (!newSessionTitle.trim() || !newSessionDate) return;
    setCreatingSession(true);
    const res = await fetch("/api/coach/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId: client.id, title: newSessionTitle, type: "INDIVIDUAL", scheduledAt: newSessionDate }),
    });
    setCreatingSession(false);
    if (res.ok) {
      const created = await res.json();
      setSessions((prev) => [created, ...prev]);
      setNewSessionTitle("");
      setNewSessionDate("");
      setShowNewSessionForm(false);
    }
  }

  const tabs: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { id: "formation", label: "Formation", icon: <CheckCircle2 className="w-4 h-4" /> },
    { id: "seances",   label: "Séances",   icon: <MessageCircle className="w-4 h-4" /> },
    { id: "notes",     label: "Notes",     icon: <MessageCircle className="w-4 h-4" /> },
    { id: "questions", label: "Questions", icon: <FileText className="w-4 h-4" /> },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">

      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard">
          <button className="p-2 rounded-xl transition-colors"
            style={{ background: "var(--border-soft)", color: "var(--ink-soft)" }}>
            <ArrowLeft className="w-5 h-5" />
          </button>
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-bold shrink-0"
            style={{ background: "var(--green-soft)", color: "var(--green-deep)" }}>
            {client.firstName[0]}{client.lastName[0]}
          </div>
          <div>
            <h1 className="text-[16px] font-bold" style={{ color: "var(--ink)" }}>
              {client.firstName} {client.lastName}
            </h1>
            <p className="text-[12px]" style={{ color: "var(--ink-mute)" }}>{client.email}</p>
          </div>
        </div>
      </div>

      {/* Client context card */}
      <div className="rounded-[16px] p-4" style={{ background: "#fff", border: "1px solid var(--border)" }}>
        <div className="grid grid-cols-2 gap-4 mb-3">
          <div>
            <p className="text-[11px] font-semibold mb-0.5" style={{ color: "var(--ink-mute)" }}>Objectif 6 mois</p>
            <p className="text-[13px] font-medium" style={{ color: "var(--ink)" }}>
              {client.clientProfile?.objective6months ?? "—"}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-semibold mb-0.5" style={{ color: "var(--ink-mute)" }}>Début programme</p>
            <p className="text-[13px] font-medium" style={{ color: "var(--ink)" }}>
              {client.clientProfile?.programStartDate ? formatDate(client.clientProfile.programStartDate) : "—"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "var(--border-soft)" }}>
            <div className="h-full rounded-full" style={{ width: `${progress.globalPercent}%`, background: "var(--green-accent)" }} />
          </div>
          <span className="text-[13px] font-bold w-10 text-right" style={{ color: "var(--green-deep)" }}>
            {progress.globalPercent}%
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-[14px] p-1 w-fit"
        style={{ background: "#fff", border: "1px solid var(--border)" }}>
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className="flex items-center gap-2 px-4 py-2 rounded-[10px] text-[13px] font-semibold transition-colors"
            style={activeTab === tab.id
              ? { background: "var(--green-deep)", color: "#fff" }
              : { color: "var(--ink-mute)" }
            }>
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Formation tab */}
      {activeTab === "formation" && (
        <div className="space-y-3">
          {progress.phases.map((phase) => (
            <div key={phase.id} className="rounded-[16px] overflow-hidden transition-opacity"
              style={{
                background: "#fff",
                border: "1px solid var(--border)",
                opacity: phase.isUnlocked ? 1 : 0.6,
              }}>
              <button
                onClick={() => setExpandedPhase(expandedPhase === phase.order ? null : phase.order)}
                className="w-full text-left px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0"
                    style={{
                      background: phase.isCompleted ? "var(--green-accent)" : !phase.isUnlocked ? "var(--border-soft)" : "var(--gold-soft)",
                      color: phase.isCompleted ? "#fff" : !phase.isUnlocked ? "var(--ink-mute)" : "var(--gold-deep)",
                    }}>
                    {phase.isCompleted ? <CheckCircle2 className="w-4 h-4" /> : !phase.isUnlocked ? <Lock className="w-3 h-3" /> : phase.order}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-[13.5px] font-semibold" style={{ color: "var(--ink)" }}>{phase.title}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-[12px] font-bold" style={{ color: "var(--ink-soft)" }}>{phase.progressPercent}%</span>
                        {expandedPhase === phase.order
                          ? <ChevronUp className="w-4 h-4" style={{ color: "var(--ink-mute)" }} />
                          : <ChevronDown className="w-4 h-4" style={{ color: "var(--ink-mute)" }} />}
                      </div>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--border-soft)" }}>
                      <div className="h-full rounded-full" style={{ width: `${phase.progressPercent}%`, background: "var(--green-accent)" }} />
                    </div>
                  </div>
                </div>
              </button>

              {expandedPhase === phase.order && (
                <div className="px-5 pb-4 space-y-2" style={{ borderTop: "1px solid var(--border-soft)" }}>
                  {phase.modules.map((module) => {
                    const p = module.progress;
                    return (
                      <div key={module.id} className="rounded-[12px] p-3 mt-2"
                        style={{
                          border: `1px solid ${p?.coachValidated ? "var(--green-accent)" : "var(--border-soft)"}`,
                          background: p?.coachValidated ? "var(--green-soft)" : "#fff",
                        }}>
                        <div className="flex items-center gap-2 mb-2">
                          {p?.coachValidated
                            ? <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: "var(--green-accent)" }} />
                            : <Circle className="w-4 h-4 shrink-0" style={{ color: "var(--border)" }} />}
                          <p className="text-[13px] font-medium" style={{ color: "var(--ink)" }}>{module.title}</p>
                        </div>
                        <div className="flex gap-3 ml-6">
                          <span className="text-[11px] font-semibold"
                            style={{ color: p?.videoWatched ? "var(--green-deep)" : "var(--ink-mute)" }}>
                            Vidéo {p?.videoWatched ? "✓" : "—"}
                          </span>
                          <span className="text-[11px] font-semibold"
                            style={{ color: p?.exerciseSubmitted ? "var(--green-deep)" : "var(--ink-mute)" }}>
                            Exercice {p?.exerciseSubmitted ? "✓" : "—"}
                          </span>
                        </div>

                        {p?.exerciseSubmitted && !p?.coachValidated && (
                          <div className="mt-3 ml-6 space-y-2">
                            <input
                              placeholder="Commentaire (optionnel)"
                              value={coachComment[module.id] ?? ""}
                              onChange={(e) => setCoachComment((prev) => ({ ...prev, [module.id]: e.target.value }))}
                              className="w-full px-3 py-2 rounded-[8px] text-[12px]"
                              style={inputStyle}
                            />
                            <button
                              onClick={() => validateModule(module.id, true)}
                              disabled={validating === module.id}
                              className="px-4 py-1.5 rounded-[8px] text-[12px] font-bold text-white transition-opacity disabled:opacity-50"
                              style={{ background: "linear-gradient(135deg, var(--green-deep), #07251F)" }}>
                              {validating === module.id ? "Validation..." : "Valider l'exercice"}
                            </button>
                          </div>
                        )}

                        {p?.coachComment && (
                          <p className="ml-6 mt-2 text-[11.5px] italic" style={{ color: "var(--ink-mute)" }}>
                            &ldquo;{p.coachComment}&rdquo;
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Notes tab */}
      {activeTab === "notes" && (
        <div className="space-y-4">
          {/* Add note */}
          <div className="rounded-[16px] p-4" style={{ background: "#fff", border: "1px solid var(--border)" }}>
            <p className="text-[13px] font-semibold mb-3" style={{ color: "var(--ink)" }}>Ajouter une note</p>
            <textarea
              placeholder="Notes de coaching, décisions prises, prises de conscience..."
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              rows={4}
              className="w-full px-3 py-2.5 rounded-[10px] text-[13px] resize-none"
              style={inputStyle}
            />
            <div className="flex items-center justify-between mt-3">
              <div className="flex gap-2">
                <button
                  onClick={() => setNoteVisibility("CLIENT_VISIBLE")}
                  className="flex items-center gap-1.5 text-[12px] px-3 py-1.5 rounded-full border transition-colors"
                  style={noteVisibility === "CLIENT_VISIBLE"
                    ? { background: "var(--green-soft)", border: "1px solid var(--green-accent)", color: "var(--green-deep)" }
                    : { border: "1px solid var(--border)", color: "var(--ink-mute)" }}>
                  <Eye className="w-3 h-3" /> Visible client
                </button>
                <button
                  onClick={() => setNoteVisibility("TEAM_ONLY")}
                  className="flex items-center gap-1.5 text-[12px] px-3 py-1.5 rounded-full transition-colors"
                  style={noteVisibility === "TEAM_ONLY"
                    ? { background: "rgba(212,160,71,0.1)", border: "1px solid var(--gold)", color: "var(--gold-deep)" }
                    : { border: "1px solid var(--border)", color: "var(--ink-mute)" }}>
                  <EyeOff className="w-3 h-3" /> Équipe seulement
                </button>
              </div>
              <button
                onClick={saveNote}
                disabled={savingNote}
                className="px-4 py-1.5 rounded-[10px] text-[13px] font-bold text-white transition-opacity disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, var(--coral-start), var(--coral-end))" }}>
                {savingNote ? "Enregistrement..." : "Enregistrer"}
              </button>
            </div>
          </div>

          {/* Notes list */}
          <div className="space-y-3">
            {notes.map((note) => (
              <div key={note.id} className="rounded-[16px] p-4"
                style={{
                  background: note.visibility === "TEAM_ONLY" ? "rgba(212,160,71,0.06)" : "#fff",
                  border: `1px solid ${note.visibility === "TEAM_ONLY" ? "var(--gold)" : "var(--border)"}`,
                }}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] font-semibold" style={{ color: "var(--ink)" }}>
                      {note.author.firstName} {note.author.lastName}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={note.visibility === "TEAM_ONLY"
                        ? { background: "rgba(212,160,71,0.15)", color: "var(--gold-deep)" }
                        : { background: "var(--green-soft)", color: "var(--green-deep)" }}>
                      {note.visibility === "TEAM_ONLY" ? "Équipe" : "Visible"}
                    </span>
                  </div>
                  <span className="text-[11px]" style={{ color: "var(--ink-mute)" }}>
                    {formatDate(note.createdAt)}
                  </span>
                </div>
                <p className="text-[13px] whitespace-pre-wrap" style={{ color: "var(--ink-soft)" }}>{note.content}</p>
              </div>
            ))}
            {notes.length === 0 && (
              <p className="text-center text-[13px] py-6" style={{ color: "var(--ink-mute)" }}>
                Aucune note pour ce client
              </p>
            )}
          </div>
        </div>
      )}

      {/* Questions tab */}
      {activeTab === "questions" && (
        <div className="space-y-3">
          {questions.map((question) => (
            <div key={question.id} className="rounded-[16px] p-4" style={{ background: "#fff", border: "1px solid var(--border)" }}>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full mb-1.5 inline-block"
                    style={{ background: "var(--border-soft)", color: "var(--ink-mute)" }}>
                    {question.category}
                  </span>
                  <p className="text-[13px] font-medium" style={{ color: "var(--ink)" }}>{question.content}</p>
                </div>
                <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={question.status === "ANSWERED"
                    ? { background: "var(--green-soft)", color: "var(--green-deep)" }
                    : question.status === "IN_PROGRESS"
                    ? { background: "var(--border-soft)", color: "var(--ink-soft)" }
                    : { background: "rgba(212,160,71,0.15)", color: "var(--gold-deep)" }}>
                  {question.status === "ANSWERED" ? "Répondu" : question.status === "IN_PROGRESS" ? "En cours" : "En attente"}
                </span>
              </div>

              {question.replies.length > 0 && (
                <div className="mt-3 space-y-2 pl-3" style={{ borderLeft: "2px solid var(--border-soft)" }}>
                  {question.replies.map((reply) => (
                    <div key={reply.id}>
                      <span className="text-[11px] font-semibold" style={{ color: "var(--ink-soft)" }}>
                        {reply.author.firstName} ({reply.author.role === "COACH" ? "Coach" : "Client"})
                      </span>
                      <p className="text-[12px] mt-0.5" style={{ color: "var(--ink-mute)" }}>{reply.content}</p>
                    </div>
                  ))}
                </div>
              )}

              {question.status !== "ANSWERED" && (
                <div className="mt-3 flex gap-2">
                  <textarea
                    placeholder="Votre réponse..."
                    value={replyContent[question.id] ?? ""}
                    onChange={(e) => setReplyContent((prev) => ({ ...prev, [question.id]: e.target.value }))}
                    rows={2}
                    className="flex-1 px-3 py-2 rounded-[10px] text-[12px] resize-none"
                    style={inputStyle}
                  />
                  <button
                    onClick={() => sendReply(question.id)}
                    className="shrink-0 self-end p-2.5 rounded-[10px] text-white"
                    style={{ background: "linear-gradient(135deg, var(--coral-start), var(--coral-end))" }}>
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ))}
          {questions.length === 0 && (
            <p className="text-center text-[13px] py-6" style={{ color: "var(--ink-mute)" }}>
              Aucune question de ce client
            </p>
          )}
        </div>
      )}

      {/* Séances tab */}
      {activeTab === "seances" && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <p className="text-[13px] font-semibold" style={{ color: "var(--ink-soft)" }}>
              {sessions.length} séance{sessions.length !== 1 ? "s" : ""}
            </p>
            <button
              onClick={() => setShowNewSessionForm((v) => !v)}
              className="text-[12.5px] font-bold px-3 py-1.5 rounded-[10px] text-white"
              style={{ background: "linear-gradient(135deg, var(--coral-start), var(--coral-end))" }}>
              + Nouvelle séance
            </button>
          </div>

          {showNewSessionForm && (
            <div className="rounded-[16px] p-4 space-y-3" style={{ background: "#fff", border: "1px solid var(--border)" }}>
              <p className="text-[13px] font-semibold" style={{ color: "var(--ink)" }}>Planifier une séance</p>
              <input
                placeholder="Titre de la séance (ex: Séance 7)"
                value={newSessionTitle}
                onChange={(e) => setNewSessionTitle(e.target.value)}
                className="w-full px-3 py-2.5 rounded-[10px] text-[13px]"
                style={inputStyle}
              />
              <input
                type="datetime-local"
                value={newSessionDate}
                onChange={(e) => setNewSessionDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-[10px] text-[13px]"
                style={inputStyle}
              />
              <div className="flex gap-2">
                <button
                  onClick={createSession}
                  disabled={creatingSession || !newSessionTitle.trim() || !newSessionDate}
                  className="flex-1 py-2.5 text-[13px] font-bold text-white rounded-[10px] transition-opacity disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg, var(--coral-start), var(--coral-end))" }}>
                  {creatingSession ? "Création..." : "Créer"}
                </button>
                <button
                  onClick={() => setShowNewSessionForm(false)}
                  className="px-4 py-2.5 text-[13px] rounded-[10px]"
                  style={{ border: "1px solid var(--border)", color: "var(--ink-soft)" }}>
                  Annuler
                </button>
              </div>
            </div>
          )}

          {sessions.map((s) => (
            <div key={s.id} className="rounded-[16px] p-4" style={{ background: "#fff", border: "1px solid var(--border)" }}>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[13.5px] font-semibold" style={{ color: "var(--ink)" }}>{s.title}</p>
                  <p className="text-[11.5px] mt-0.5" style={{ color: "var(--ink-mute)" }}>
                    {new Date(s.scheduledAt).toLocaleDateString("fr-FR", {
                      day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
                    })}
                  </p>
                </div>
                <button
                  onClick={() => setSessionFormOpen(s.id)}
                  className="text-[12px] font-bold px-3 py-1.5 rounded-[8px] transition-colors"
                  style={{ border: "1px solid var(--border)", color: "var(--ink-soft)" }}>
                  {(s.summary || s.decisions || s.firefliesUrl) ? "Modifier" : "Remplir CR"}
                </button>
              </div>
              {s.actions.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {s.actions.map((a) => (
                    <span key={a.id}
                      className="text-[11.5px] px-2 py-0.5 rounded-full font-medium"
                      style={a.completedByClient
                        ? { background: "var(--green-soft)", color: "var(--green-deep)", textDecoration: "line-through" }
                        : { background: "rgba(212,160,71,0.12)", color: "var(--gold-deep)" }}>
                      {a.content.slice(0, 40)}{a.content.length > 40 ? "…" : ""}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}

          {sessions.length === 0 && !showNewSessionForm && (
            <p className="text-center text-[13px] py-6" style={{ color: "var(--ink-mute)" }}>
              Aucune séance planifiée
            </p>
          )}
        </div>
      )}

      {sessionFormOpen && (() => {
        const s = sessions.find((x) => x.id === sessionFormOpen);
        if (!s) return null;
        return (
          <SessionForm
            session={{ ...s, client: { firstName: client.firstName, lastName: client.lastName } }}
            onClose={() => setSessionFormOpen(null)}
            onUpdated={(updated) => {
              setSessions((prev) => prev.map((x) => x.id === s.id ? { ...x, ...updated } : x));
              setSessionFormOpen(null);
            }}
          />
        );
      })()}
    </div>
  );
}
