"use client";

import { useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CheckCircle2,
  Circle,
  Lock,
  Play,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Clock,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ModuleWithProgress {
  id: string;
  title: string;
  description: string | null;
  videoUrl: string | null;
  exerciseUrl: string | null;
  progress: {
    videoWatched: boolean;
    exerciseSubmitted: boolean;
    coachValidated: boolean;
    coachComment: string | null;
    realImplementation: boolean;
  } | null;
}

interface PhaseWithProgress {
  id: string;
  order: number;
  title: string;
  description: string | null;
  progressPercent: number;
  isCompleted: boolean;
  isUnlocked: boolean;
  modules: ModuleWithProgress[];
}

interface FormationViewProps {
  progress: {
    globalPercent: number;
    phases: PhaseWithProgress[];
    currentPhase: { order: number };
  };
}

export function FormationView({ progress }: FormationViewProps) {
  const [expandedPhase, setExpandedPhase] = useState<number>(
    progress.currentPhase.order
  );
  const [updating, setUpdating] = useState<string | null>(null);
  const [localProgress, setLocalProgress] = useState<
    Record<string, { videoWatched: boolean; exerciseSubmitted: boolean; realImplementation: boolean }>
  >({});

  async function updateProgress(
    moduleId: string,
    field: string,
    value: boolean
  ) {
    setUpdating(moduleId + field);
    setLocalProgress((prev) => ({
      ...prev,
      [moduleId]: { ...(prev[moduleId] ?? {}), [field]: value } as {
        videoWatched: boolean;
        exerciseSubmitted: boolean;
        realImplementation: boolean;
      },
    }));

    await fetch("/api/client/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ moduleId, field, value }),
    });

    setUpdating(null);
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Ma Formation</h1>
        <p className="text-sm text-gray-500 mt-0.5">Progression globale</p>
      </div>

      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Avancement total</span>
            <span className="text-xl font-bold text-green-700">{progress.globalPercent}%</span>
          </div>
          <Progress value={progress.globalPercent} />
        </CardContent>
      </Card>

      <div className="space-y-3">
        {progress.phases.map((phase) => (
          <PhaseCard
            key={phase.id}
            phase={phase}
            isExpanded={expandedPhase === phase.order}
            onToggle={() =>
              setExpandedPhase(expandedPhase === phase.order ? -1 : phase.order)
            }
            localProgress={localProgress}
            updating={updating}
            onUpdateProgress={updateProgress}
          />
        ))}
      </div>
    </div>
  );
}

function PhaseCard({
  phase,
  isExpanded,
  onToggle,
  localProgress,
  updating,
  onUpdateProgress,
}: {
  phase: PhaseWithProgress;
  isExpanded: boolean;
  onToggle: () => void;
  localProgress: Record<string, { videoWatched: boolean; exerciseSubmitted: boolean; realImplementation: boolean }>;
  updating: string | null;
  onUpdateProgress: (moduleId: string, field: string, value: boolean) => Promise<void>;
}) {
  const statusBadge = phase.isCompleted
    ? { label: "Terminé", variant: "default" as const }
    : !phase.isUnlocked
    ? { label: "Verrouillé", variant: "locked" as const }
    : phase.progressPercent > 0
    ? { label: "En cours", variant: "secondary" as const }
    : { label: "À venir", variant: "outline" as const };

  return (
    <Card className={cn(!phase.isUnlocked && "opacity-60")}>
      <button
        onClick={onToggle}
        disabled={!phase.isUnlocked}
        className="w-full text-left"
      >
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0",
                phase.isCompleted
                  ? "bg-green-500 text-white"
                  : phase.isUnlocked
                  ? "bg-amber-100 text-amber-800"
                  : "bg-gray-100 text-gray-500"
              )}
            >
              {phase.isCompleted ? <CheckCircle2 className="w-5 h-5" /> : !phase.isUnlocked ? <Lock className="w-4 h-4" /> : phase.order}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <CardTitle className="text-sm">{phase.title}</CardTitle>
                <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
              </div>
              {phase.description && (
                <p className="text-xs text-gray-500 mt-0.5 truncate">{phase.description}</p>
              )}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-sm font-semibold text-gray-700">
                {phase.progressPercent}%
              </span>
              {isExpanded ? (
                <ChevronUp className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              )}
            </div>
          </div>
          {phase.isUnlocked && (
            <Progress value={phase.progressPercent} className="mt-2 h-1.5" />
          )}
        </CardHeader>
      </button>

      {isExpanded && phase.isUnlocked && (
        <CardContent className="pt-0 space-y-3">
          {phase.modules.map((module) => {
            const local = localProgress[module.id];
            const p = module.progress;
            const videoWatched = local?.videoWatched ?? p?.videoWatched ?? false;
            const exerciseSubmitted = local?.exerciseSubmitted ?? p?.exerciseSubmitted ?? false;
            const coachValidated = p?.coachValidated ?? false;

            return (
              <div
                key={module.id}
                className={cn(
                  "border rounded-xl p-4 space-y-3",
                  coachValidated
                    ? "border-green-200 bg-green-50"
                    : "border-gray-100 bg-white"
                )}
              >
                <div className="flex items-start gap-2">
                  {coachValidated ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  ) : (
                    <Circle className="w-4 h-4 text-gray-300 mt-0.5 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{module.title}</p>
                    {module.description && (
                      <p className="text-xs text-gray-500 mt-0.5">{module.description}</p>
                    )}
                  </div>
                </div>

                {/* Étapes de progression */}
                <div className="space-y-2 pl-6">
                  {/* Vidéo */}
                  {module.videoUrl ? (
                    <div className="flex items-center gap-2">
                      <CheckOrCircle checked={videoWatched} />
                      <a
                        href={module.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                      >
                        <Play className="w-3 h-3" /> Regarder la vidéo
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      {!videoWatched && (
                        <button
                          onClick={() => onUpdateProgress(module.id, "videoWatched", true)}
                          disabled={updating === module.id + "videoWatched"}
                          className="text-[10px] text-gray-400 hover:text-green-600 underline ml-auto"
                        >
                          Marquer vu
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Clock className="w-3 h-3 text-gray-300" />
                      <span className="text-xs text-gray-400 italic">Vidéo à venir</span>
                    </div>
                  )}

                  {/* Exercice */}
                  {module.exerciseUrl ? (
                    <div className="flex items-center gap-2">
                      <CheckOrCircle checked={exerciseSubmitted} />
                      <a
                        href={module.exerciseUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" /> Ouvrir l&apos;exercice
                      </a>
                      {!exerciseSubmitted && (
                        <button
                          onClick={() =>
                            onUpdateProgress(module.id, "exerciseSubmitted", true)
                          }
                          disabled={updating === module.id + "exerciseSubmitted"}
                          className="text-[10px] text-gray-400 hover:text-green-600 underline ml-auto"
                        >
                          Marquer rendu
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Clock className="w-3 h-3 text-gray-300" />
                      <span className="text-xs text-gray-400 italic">Exercice à venir</span>
                    </div>
                  )}

                  {/* Validation coach */}
                  <div className="flex items-center gap-2">
                    <CheckOrCircle checked={coachValidated} />
                    <span
                      className={cn(
                        "text-xs",
                        coachValidated ? "text-green-600 font-medium" : "text-gray-400"
                      )}
                    >
                      Validé par le coach
                    </span>
                    {!coachValidated && exerciseSubmitted && (
                      <span className="text-[10px] bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded ml-auto">
                        En attente
                      </span>
                    )}
                  </div>
                </div>

                {/* Commentaire coach */}
                {p?.coachComment && (
                  <div className="pl-6 mt-2 p-2 bg-green-50 rounded-lg border border-green-100">
                    <p className="text-xs text-gray-500 mb-0.5 font-medium flex items-center gap-1">
                      <Star className="w-3 h-3 text-amber-400" />
                      Retour coach
                    </p>
                    <p className="text-xs text-gray-700">{p.coachComment}</p>
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      )}
    </Card>
  );
}

function CheckOrCircle({ checked }: { checked: boolean }) {
  return checked ? (
    <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
  ) : (
    <Circle className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
  );
}
