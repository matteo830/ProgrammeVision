"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Send, ChevronDown, ChevronUp, Clock } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";

const CATEGORIES = ["Mindset", "Business", "Tunnel", "Technique", "Autre"];

interface Reply {
  id: string;
  content: string;
  createdAt: Date;
  author: { firstName: string; lastName: string; role: string };
}

interface Question {
  id: string;
  category: string;
  content: string;
  status: string;
  createdAt: Date;
  replies: Reply[];
}

export function QuestionsView({ initialQuestions }: { initialQuestions: Question[] }) {
  const [questions, setQuestions] = useState(initialQuestions);
  const [showForm, setShowForm] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [form, setForm] = useState({ category: CATEGORIES[0], content: "" });
  const [submitting, setSubmitting] = useState(false);

  async function submitQuestion() {
    if (!form.content.trim()) return;
    setSubmitting(true);

    const res = await fetch("/api/questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const question = await res.json();
    setQuestions([question, ...questions]);
    setForm({ category: CATEGORIES[0], content: "" });
    setShowForm(false);
    setSubmitting(false);
  }

  const statusConfig = {
    PENDING: { label: "En attente", variant: "pending" as const, icon: Clock },
    IN_PROGRESS: { label: "En cours", variant: "secondary" as const, icon: Clock },
    ANSWERED: { label: "Répondu", variant: "default" as const, icon: Send },
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Mes questions</h1>
        <Button size="sm" onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4" />
          Poser une question
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="pt-4 space-y-3">
            <p className="text-sm font-semibold text-gray-800">Nouvelle question</p>

            <div className="space-y-1.5">
              <Label className="text-xs">Catégorie</Label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setForm({ ...form, category: cat })}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                      form.category === cat
                        ? "bg-green-700 text-white border-green-700"
                        : "border-gray-200 text-gray-600 hover:border-green-300"
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Ta question</Label>
              <Textarea
                placeholder="Décris ta question en détail..."
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                className="min-h-[100px]"
                autoFocus
              />
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={submitQuestion}
                disabled={submitting || !form.content.trim()}
              >
                {submitting ? "Envoi..." : "Envoyer"}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setShowForm(false)}>
                Annuler
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {questions.length === 0 && (
          <div className="text-center py-10">
            <p className="text-gray-400 text-sm">Aucune question posée pour l&apos;instant</p>
            <p className="text-gray-400 text-xs mt-1">
              N&apos;hésite pas à poser tes questions à ton coach !
            </p>
          </div>
        )}

        {questions.map((q) => {
          const status = statusConfig[q.status as keyof typeof statusConfig] ?? statusConfig.PENDING;
          const isExpanded = expanded === q.id;

          return (
            <Card key={q.id}>
              <button
                onClick={() => setExpanded(isExpanded ? null : q.id)}
                className="w-full text-left"
              >
                <CardContent className="py-4">
                  <div className="flex items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <Badge variant="outline" className="text-[10px]">
                          {q.category}
                        </Badge>
                        <Badge variant={status.variant} className="text-[10px]">
                          {status.label}
                        </Badge>
                        {q.replies.length > 0 && (
                          <span className="text-[10px] text-gray-400">
                            {q.replies.length} réponse{q.replies.length > 1 ? "s" : ""}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-900 font-medium">{q.content}</p>
                      <p className="text-[11px] text-gray-400 mt-1">
                        {formatDate(q.createdAt)}
                      </p>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" />
                    )}
                  </div>
                </CardContent>
              </button>

              {isExpanded && q.replies.length > 0 && (
                <div className="px-4 pb-4 space-y-2 border-t border-gray-50 pt-3">
                  {q.replies.map((reply) => (
                    <div
                      key={reply.id}
                      className={cn(
                        "p-3 rounded-xl text-sm",
                        reply.author.role === "COACH"
                          ? "bg-green-50 border border-green-100"
                          : "bg-gray-50"
                      )}
                    >
                      <p className="text-[11px] font-semibold text-gray-600 mb-1">
                        {reply.author.role === "COACH"
                          ? `Coach ${reply.author.firstName}`
                          : "Toi"}{" "}
                        · {formatDate(reply.createdAt)}
                      </p>
                      <p className="text-gray-800">{reply.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
