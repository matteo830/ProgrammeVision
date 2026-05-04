"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, Edit2, X, Save } from "lucide-react";
import { cn } from "@/lib/utils";

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

export function ModulesManagerView({ phases }: { phases: Phase[] }) {
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<Record<string, { videoUrl: string; exerciseUrl: string }>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<Set<string>>(new Set());

  function startEdit(module: Module) {
    setEditing(module.id);
    setForm((prev) => ({
      ...prev,
      [module.id]: {
        videoUrl: module.videoUrl ?? "",
        exerciseUrl: module.exerciseUrl ?? "",
      },
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
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Gestion des modules</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Configurez les liens vidéo et exercices pour chaque module
        </p>
      </div>

      {phases.map((phase) => (
        <Card key={phase.id}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-green-100 text-green-800 text-xs font-bold flex items-center justify-center">
                {phase.order}
              </span>
              {phase.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            {phase.modules.map((module) => (
              <div
                key={module.id}
                className={cn(
                  "border rounded-xl p-3",
                  saved.has(module.id)
                    ? "border-green-200 bg-green-50"
                    : "border-gray-100"
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-900">{module.title}</p>
                  <div className="flex items-center gap-2">
                    {saved.has(module.id) && (
                      <span className="text-xs text-green-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Enregistré
                      </span>
                    )}
                    {editing === module.id ? (
                      <button
                        onClick={() => setEditing(null)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => startEdit(module)}
                        className="p-1 text-gray-400 hover:text-green-600 rounded"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {editing === module.id ? (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Lien vidéo (GHL)</Label>
                      <Input
                        value={form[module.id]?.videoUrl ?? ""}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            [module.id]: { ...prev[module.id], videoUrl: e.target.value },
                          }))
                        }
                        placeholder="https://..."
                        className="h-9 text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Lien exercice (Google Docs/Sheets)</Label>
                      <Input
                        value={form[module.id]?.exerciseUrl ?? ""}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            [module.id]: { ...prev[module.id], exerciseUrl: e.target.value },
                          }))
                        }
                        placeholder="https://docs.google.com/..."
                        className="h-9 text-xs"
                      />
                    </div>
                    <Button
                      size="sm"
                      onClick={() => saveModule(module.id)}
                      disabled={saving === module.id}
                      className="w-full"
                    >
                      <Save className="w-3.5 h-3.5" />
                      {saving === module.id ? "Enregistrement..." : "Enregistrer"}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500">
                      Vidéo :{" "}
                      {module.videoUrl ? (
                        <span className="text-blue-600 truncate">configurée</span>
                      ) : (
                        <span className="text-orange-500">non configurée</span>
                      )}
                    </p>
                    <p className="text-xs text-gray-500">
                      Exercice :{" "}
                      {module.exerciseUrl ? (
                        <span className="text-blue-600">configuré</span>
                      ) : (
                        <span className="text-orange-500">non configuré</span>
                      )}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
