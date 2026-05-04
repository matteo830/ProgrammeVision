"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Send } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Note {
  id: string;
  content: string;
  visibility: string;
  createdAt: Date;
  author: { firstName: string; lastName: string; role: string };
}

export function CoachingClientView({
  initialNotes,
  userId,
}: {
  initialNotes: Note[];
  userId: string;
}) {
  const [notes, setNotes] = useState(initialNotes);
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);

  async function addComment() {
    if (!comment.trim()) return;
    setSaving(true);

    const res = await fetch("/api/coaching/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: comment,
        clientId: userId,
        visibility: "CLIENT_VISIBLE",
      }),
    });

    const note = await res.json();
    setNotes([note, ...notes]);
    setComment("");
    setSaving(false);
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
      <h1 className="text-2xl font-bold text-gray-900">Mon Coaching</h1>

      {/* Ajouter un commentaire */}
      <Card>
        <CardContent className="pt-4 space-y-3">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-green-700" />
            <p className="text-sm font-semibold text-gray-800">Ajouter un commentaire</p>
          </div>
          <Textarea
            placeholder="Tes réflexions, prises de conscience, questions après la séance..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="min-h-[80px]"
          />
          <Button
            size="sm"
            onClick={addComment}
            disabled={saving || !comment.trim()}
            className="flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            {saving ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </CardContent>
      </Card>

      {/* Timeline des notes */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-700">
          Historique des séances ({notes.length})
        </h2>

        {notes.length === 0 && (
          <p className="text-center text-sm text-gray-400 py-8">
            Aucune note de coaching pour l&apos;instant
          </p>
        )}

        {notes.map((note) => (
          <Card key={note.id}>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center text-green-800 text-xs font-bold">
                    {note.author.firstName[0]}
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-gray-700">
                      {note.author.role === "COACH"
                        ? `Coach ${note.author.firstName}`
                        : "Moi"}
                    </span>
                    <Badge
                      variant={note.author.role === "COACH" ? "default" : "secondary"}
                      className="ml-2 text-[10px]"
                    >
                      {note.author.role === "COACH" ? "Coach" : "Toi"}
                    </Badge>
                  </div>
                </div>
                <span className="text-[11px] text-gray-400 flex-shrink-0">
                  {formatDate(note.createdAt)}
                </span>
              </div>
              <p className="text-sm text-gray-700 whitespace-pre-wrap pl-9">
                {note.content}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
