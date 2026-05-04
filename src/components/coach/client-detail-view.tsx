"use client";

import { useState } from "react";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
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
import { cn, formatDate } from "@/lib/utils";

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
}

type ActiveTab = "formation" | "notes" | "questions";

export function ClientDetailView({
  client,
  progress,
  notes: initialNotes,
  questions: initialQuestions,
}: ClientDetailViewProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>("formation");
  const [notes, setNotes] = useState(initialNotes);
  const [questions, setQuestions] = useState(initialQuestions);
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
      body: JSON.stringify({
        content: noteContent,
        clientId: client.id,
        visibility: noteVisibility,
      }),
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
      body: JSON.stringify({
        moduleId,
        clientId: client.id,
        validated,
        coachComment: coachComment[moduleId] ?? null,
      }),
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
        q.id === questionId
          ? { ...q, status: "ANSWERED", replies: [...q.replies, reply] }
          : q
      )
    );
    setReplyContent((prev) => ({ ...prev, [questionId]: "" }));
  }

  const tabs: { id: ActiveTab; label: string; icon: typeof MessageCircle }[] = [
    { id: "formation", label: "Formation", icon: CheckCircle2 },
    { id: "notes", label: "Notes", icon: MessageCircle },
    { id: "questions", label: "Questions", icon: FileText },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard">
          <button className="p-2 rounded-xl hover:bg-gray-100">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-800 font-bold">
            {client.firstName[0]}
          </div>
          <div>
            <h1 className="font-bold text-gray-900">
              {client.firstName} {client.lastName}
            </h1>
            <p className="text-xs text-gray-500">{client.email}</p>
          </div>
        </div>
      </div>

      {/* Contexte client */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Objectif 6 mois</p>
              <p className="text-sm font-medium text-gray-900">
                {client.clientProfile?.objective6months ?? "—"}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Début programme</p>
              <p className="text-sm font-medium text-gray-900">
                {client.clientProfile?.programStartDate
                  ? formatDate(client.clientProfile.programStartDate)
                  : "—"}
              </p>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-3">
            <Progress value={progress.globalPercent} className="flex-1" />
            <span className="text-sm font-bold text-green-700 w-10 text-right">
              {progress.globalPercent}%
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Onglets */}
      <div className="flex border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors",
              activeTab === tab.id
                ? "border-green-700 text-green-700"
                : "border-transparent text-gray-500 hover:text-gray-700"
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Formation */}
      {activeTab === "formation" && (
        <div className="space-y-3">
          {progress.phases.map((phase) => (
            <Card key={phase.id} className={cn(!phase.isUnlocked && "opacity-60")}>
              <button
                onClick={() =>
                  setExpandedPhase(expandedPhase === phase.order ? null : phase.order)
                }
                className="w-full text-left"
              >
                <CardHeader className="pb-2 pt-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0",
                        phase.isCompleted
                          ? "bg-green-500 text-white"
                          : !phase.isUnlocked
                          ? "bg-gray-100 text-gray-400"
                          : "bg-amber-100 text-amber-800"
                      )}
                    >
                      {phase.isCompleted ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : !phase.isUnlocked ? (
                        <Lock className="w-3 h-3" />
                      ) : (
                        phase.order
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm">{phase.title}</CardTitle>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-gray-600">
                            {phase.progressPercent}%
                          </span>
                          {expandedPhase === phase.order ? (
                            <ChevronUp className="w-4 h-4 text-gray-400" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                      </div>
                      <Progress value={phase.progressPercent} className="mt-1.5 h-1.5" />
                    </div>
                  </div>
                </CardHeader>
              </button>

              {expandedPhase === phase.order && (
                <CardContent className="pt-0 space-y-2">
                  {phase.modules.map((module) => {
                    const p = module.progress;
                    return (
                      <div
                        key={module.id}
                        className={cn(
                          "border rounded-xl p-3",
                          p?.coachValidated ? "border-green-200 bg-green-50" : "border-gray-100"
                        )}
                      >
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            {p?.coachValidated ? (
                              <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                            ) : (
                              <Circle className="w-4 h-4 text-gray-300 flex-shrink-0" />
                            )}
                            <p className="text-sm font-medium text-gray-900">{module.title}</p>
                          </div>
                        </div>

                        <div className="flex gap-3 ml-6 text-[11px] text-gray-500">
                          <span className={cn(p?.videoWatched && "text-green-600 font-medium")}>
                            Vidéo {p?.videoWatched ? "✓" : "—"}
                          </span>
                          <span className={cn(p?.exerciseSubmitted && "text-green-600 font-medium")}>
                            Exercice {p?.exerciseSubmitted ? "✓" : "—"}
                          </span>
                        </div>

                        {p?.exerciseSubmitted && !p?.coachValidated && (
                          <div className="mt-3 ml-6 space-y-2">
                            <Input
                              placeholder="Commentaire (optionnel)"
                              value={coachComment[module.id] ?? ""}
                              onChange={(e) =>
                                setCoachComment((prev) => ({
                                  ...prev,
                                  [module.id]: e.target.value,
                                }))
                              }
                              className="text-xs h-9"
                            />
                            <Button
                              size="sm"
                              variant="success"
                              onClick={() => validateModule(module.id, true)}
                              disabled={validating === module.id}
                              className="text-xs h-8"
                            >
                              {validating === module.id ? "Validation..." : "Valider l'exercice"}
                            </Button>
                          </div>
                        )}

                        {p?.coachComment && (
                          <p className="ml-6 mt-2 text-xs text-gray-500 italic">
                            &ldquo;{p.coachComment}&rdquo;
                          </p>
                        )}
                      </div>
                    );
                  })}
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Notes */}
      {activeTab === "notes" && (
        <div className="space-y-4">
          <Card>
            <CardContent className="pt-4 space-y-3">
              <p className="text-sm font-semibold text-gray-800">Ajouter une note</p>
              <Textarea
                placeholder="Notes de coaching, décisions prises, prises de conscience..."
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                className="min-h-[100px]"
              />
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <button
                    onClick={() => setNoteVisibility("CLIENT_VISIBLE")}
                    className={cn(
                      "flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-colors",
                      noteVisibility === "CLIENT_VISIBLE"
                        ? "bg-green-50 border-green-300 text-green-700"
                        : "border-gray-200 text-gray-500"
                    )}
                  >
                    <Eye className="w-3 h-3" /> Visible client
                  </button>
                  <button
                    onClick={() => setNoteVisibility("TEAM_ONLY")}
                    className={cn(
                      "flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-colors",
                      noteVisibility === "TEAM_ONLY"
                        ? "bg-orange-50 border-orange-300 text-orange-700"
                        : "border-gray-200 text-gray-500"
                    )}
                  >
                    <EyeOff className="w-3 h-3" /> Équipe seulement
                  </button>
                </div>
                <Button size="sm" onClick={saveNote} disabled={savingNote}>
                  {savingNote ? "Enregistrement..." : "Enregistrer"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3">
            {notes.map((note) => (
              <Card
                key={note.id}
                className={cn(
                  note.visibility === "TEAM_ONLY" && "border-orange-100 bg-orange-50"
                )}
              >
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-gray-700">
                        {note.author.firstName} {note.author.lastName}
                      </span>
                      <Badge
                        variant={note.visibility === "TEAM_ONLY" ? "pending" : "default"}
                        className="text-[10px]"
                      >
                        {note.visibility === "TEAM_ONLY" ? "Équipe" : "Visible"}
                      </Badge>
                    </div>
                    <span className="text-[11px] text-gray-400">
                      {formatDate(note.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{note.content}</p>
                </CardContent>
              </Card>
            ))}

            {notes.length === 0 && (
              <p className="text-center text-sm text-gray-400 py-6">
                Aucune note pour ce client
              </p>
            )}
          </div>
        </div>
      )}

      {/* Questions */}
      {activeTab === "questions" && (
        <div className="space-y-3">
          {questions.map((question) => (
            <Card key={question.id}>
              <CardContent className="pt-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <Badge variant="outline" className="text-[10px] mb-1">
                      {question.category}
                    </Badge>
                    <p className="text-sm font-medium text-gray-900">{question.content}</p>
                  </div>
                  <Badge
                    variant={
                      question.status === "ANSWERED"
                        ? "default"
                        : question.status === "IN_PROGRESS"
                        ? "secondary"
                        : "pending"
                    }
                    className="text-[10px] flex-shrink-0"
                  >
                    {question.status === "ANSWERED"
                      ? "Répondu"
                      : question.status === "IN_PROGRESS"
                      ? "En cours"
                      : "En attente"}
                  </Badge>
                </div>

                {question.replies.length > 0 && (
                  <div className="mt-3 space-y-2 pl-3 border-l-2 border-gray-100">
                    {question.replies.map((reply) => (
                      <div key={reply.id}>
                        <span className="text-[11px] font-semibold text-gray-600">
                          {reply.author.firstName} ({reply.author.role === "COACH" ? "Coach" : "Client"})
                        </span>
                        <p className="text-xs text-gray-700 mt-0.5">{reply.content}</p>
                      </div>
                    ))}
                  </div>
                )}

                {question.status !== "ANSWERED" && (
                  <div className="mt-3 flex gap-2">
                    <Textarea
                      placeholder="Votre réponse..."
                      value={replyContent[question.id] ?? ""}
                      onChange={(e) =>
                        setReplyContent((prev) => ({
                          ...prev,
                          [question.id]: e.target.value,
                        }))
                      }
                      className="min-h-[60px] text-xs"
                    />
                    <Button
                      size="icon"
                      className="flex-shrink-0 self-end"
                      onClick={() => sendReply(question.id)}
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          {questions.length === 0 && (
            <p className="text-center text-sm text-gray-400 py-6">
              Aucune question de ce client
            </p>
          )}
        </div>
      )}
    </div>
  );
}
