"use client";

import { useState } from "react";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Sparkles,
  Bell,
  Target,
  CheckCircle2,
  Circle,
  BookOpen,
  Calendar,
  ListTodo,
  MessageCircle,
  Trophy,
  FileText,
  BarChart2,
  Quote,
  Heart,
  Star,
  Flame,
  ChevronRight,
} from "lucide-react";
import { cn, formatDate } from "@/lib/utils";

interface DashboardClientProps {
  user: { firstName: string; lastName: string; avatarUrl: string | null };
  profile: {
    objective6months: string | null;
    programEndDate: Date | null;
  } | null;
  progress: {
    globalPercent: number;
    currentPhase: { title: string; order: number };
    phases: Array<{
      order: number;
      title: string;
      isCompleted: boolean;
      isUnlocked: boolean;
      progressPercent: number;
    }>;
  };
  actions: Array<{ id: string; content: string; completed: boolean }>;
  recentGratitude: { content: string; date: Date } | null;
  recentVictory: { content: string; weekStartDate: Date } | null;
  inspiration: { quote: string; author: string | null } | null;
}

const phaseColors = ["bg-gray-100", "bg-green-100", "bg-amber-100", "bg-blue-100"];
const phaseTextColors = ["text-gray-600", "text-green-700", "text-amber-700", "text-blue-700"];

export function DashboardClient({
  user,
  profile,
  progress,
  actions: initialActions,
  recentGratitude,
  recentVictory,
  inspiration,
}: DashboardClientProps) {
  const [actions, setActions] = useState(initialActions);
  const [gratitude, setGratitude] = useState("");
  const [victory, setVictory] = useState("");
  const [showGratitudeForm, setShowGratitudeForm] = useState(false);
  const [showVictoryForm, setShowVictoryForm] = useState(false);
  const [savingGratitude, setSavingGratitude] = useState(false);
  const [savingVictory, setSavingVictory] = useState(false);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Bonjour" : hour < 18 ? "Bon après-midi" : "Bonsoir";

  async function completeAction(id: string) {
    await fetch("/api/client/actions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, completed: true }),
    });
    setActions((prev) => prev.filter((a) => a.id !== id));
  }

  async function saveGratitude() {
    if (!gratitude.trim()) return;
    setSavingGratitude(true);
    await fetch("/api/client/gratitude", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: gratitude }),
    });
    setSavingGratitude(false);
    setGratitude("");
    setShowGratitudeForm(false);
  }

  async function saveVictory() {
    if (!victory.trim()) return;
    setSavingVictory(true);
    await fetch("/api/client/victories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: victory }),
    });
    setSavingVictory(false);
    setVictory("");
    setShowVictoryForm(false);
  }

  const currentPhaseIndex = progress.phases.findIndex(
    (p) => p.order === progress.currentPhase.order
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-green-100 flex items-center justify-center text-green-800 font-bold text-lg">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
            ) : (
              user.firstName[0]
            )}
          </div>
          <div>
            <p className="text-sm text-gray-500">{greeting}</p>
            <h2 className="font-bold text-gray-900 flex items-center gap-1">
              {user.firstName} <Sparkles className="w-4 h-4 text-amber-400" />
            </h2>
          </div>
        </div>
        <button className="relative p-2 rounded-xl hover:bg-gray-100">
          <Bell className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Objectif 6 mois */}
      <div className="bg-gradient-to-br from-green-800 to-green-700 rounded-3xl p-5 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10" />
        <div className="flex items-start gap-2 mb-1">
          <Target className="w-4 h-4 mt-0.5 text-amber-300 flex-shrink-0" />
          <p className="text-xs font-semibold uppercase tracking-wide text-green-200">
            Mon objectif 6 mois
          </p>
        </div>
        <p className="text-base font-semibold leading-snug mt-1 relative z-10">
          {profile?.objective6months ?? "Définis ton objectif dans ton profil"}
        </p>
        {profile?.programEndDate && (
          <p className="text-xs text-green-300 mt-2 flex items-center gap-1">
            <span>Échéance :</span>
            <span>{formatDate(profile.programEndDate)}</span>
          </p>
        )}
      </div>

      {/* Progression globale */}
      <Card>
        <CardContent className="pt-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">Ma progression globale</h3>
            <span className="text-2xl font-bold text-green-700">{progress.globalPercent}%</span>
          </div>
          <Progress value={progress.globalPercent} className="h-3" />
          <p className="text-xs text-gray-500 mt-2">
            {progress.globalPercent >= 80
              ? "🔥 Incroyable, tu es presque au bout !"
              : progress.globalPercent >= 50
              ? "🌟 Tu es sur la bonne voie ! Continue comme ça"
              : progress.globalPercent >= 20
              ? "💪 Bon départ, continue ta lancée !"
              : "🚀 C'est parti ! Chaque étape compte"}
          </p>

          {/* Timeline phases */}
          <div className="flex items-center gap-1 mt-4 overflow-x-auto pb-1">
            {progress.phases.map((phase, i) => (
              <div key={phase.order} className="flex items-center gap-1 flex-shrink-0">
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold",
                      phase.isCompleted
                        ? "bg-green-500 text-white"
                        : phase.order === progress.currentPhase.order
                        ? "bg-amber-400 text-green-900 ring-2 ring-amber-300"
                        : phase.isUnlocked
                        ? "bg-gray-200 text-gray-600"
                        : "bg-gray-100 text-gray-400"
                    )}
                  >
                    {phase.isCompleted ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      phase.order
                    )}
                  </div>
                  <span
                    className={cn(
                      "text-[9px] mt-0.5 font-medium",
                      phase.order === progress.currentPhase.order
                        ? "text-amber-600"
                        : phase.isCompleted
                        ? "text-green-600"
                        : "text-gray-400"
                    )}
                  >
                    {phase.title.split(" ")[0]}
                  </span>
                </div>
                {i < progress.phases.length - 1 && (
                  <div
                    className={cn(
                      "h-0.5 w-6 mb-4",
                      progress.phases[i + 1].isUnlocked ? "bg-green-300" : "bg-gray-200"
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Actions du jour */}
      <Card>
        <CardContent className="pt-5">
          <div className="flex items-center gap-2 mb-3">
            <Flame className="w-5 h-5 text-orange-500" />
            <h3 className="font-semibold text-gray-900">Mes actions à faire</h3>
          </div>

          {actions.length === 0 ? (
            <div className="text-center py-4">
              <CheckCircle2 className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Toutes tes actions sont faites ! 🎉</p>
              <Link href="/formation">
                <Button variant="ghost" size="sm" className="mt-2">
                  Voir ma formation
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {actions.map((action) => (
                <div
                  key={action.id}
                  className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl border border-amber-100"
                >
                  <button
                    onClick={() => completeAction(action.id)}
                    className="text-gray-400 hover:text-green-500 transition-colors flex-shrink-0"
                  >
                    <Circle className="w-5 h-5" />
                  </button>
                  <span className="text-sm text-gray-800 flex-1">{action.content}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Gratitude + Victoire */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2 mb-2">
              <Heart className="w-4 h-4 text-rose-400" />
              <p className="text-xs font-semibold text-gray-700">Gratitude du jour</p>
            </div>
            {recentGratitude ? (
              <p className="text-xs text-gray-500 line-clamp-2">{recentGratitude.content}</p>
            ) : (
              <p className="text-xs text-gray-400 italic">Pas encore écrite...</p>
            )}
            <button
              onClick={() => setShowGratitudeForm(true)}
              className="mt-2 text-xs text-green-700 font-medium flex items-center gap-1 hover:text-green-600"
            >
              Écrire ✍️
            </button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="w-4 h-4 text-amber-500" />
              <p className="text-xs font-semibold text-gray-700">Victoire de la semaine</p>
            </div>
            {recentVictory ? (
              <p className="text-xs text-gray-500 line-clamp-2">{recentVictory.content}</p>
            ) : (
              <p className="text-xs text-gray-400 italic">Célèbre tes avancées !</p>
            )}
            <button
              onClick={() => setShowVictoryForm(true)}
              className="mt-2 text-xs text-green-700 font-medium flex items-center gap-1 hover:text-green-600"
            >
              Écrire ✨
            </button>
          </CardContent>
        </Card>
      </div>

      {/* Formulaire gratitude */}
      {showGratitudeForm && (
        <Card>
          <CardContent className="pt-4 space-y-3">
            <p className="text-sm font-semibold text-gray-800">💛 Ta gratitude du jour</p>
            <Textarea
              placeholder="Je suis reconnaissant(e) pour..."
              value={gratitude}
              onChange={(e) => setGratitude(e.target.value)}
              className="min-h-[80px]"
              autoFocus
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={saveGratitude} disabled={savingGratitude}>
                {savingGratitude ? "Enregistrement..." : "Enregistrer"}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setShowGratitudeForm(false)}>
                Annuler
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Formulaire victoire */}
      {showVictoryForm && (
        <Card>
          <CardContent className="pt-4 space-y-3">
            <p className="text-sm font-semibold text-gray-800">🏆 Ta victoire de la semaine</p>
            <Textarea
              placeholder="Cette semaine, j'ai..."
              value={victory}
              onChange={(e) => setVictory(e.target.value)}
              className="min-h-[80px]"
              autoFocus
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={saveVictory} disabled={savingVictory}>
                {savingVictory ? "Enregistrement..." : "Enregistrer"}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setShowVictoryForm(false)}>
                Annuler
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation rapide */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Mon tableau de bord</h3>
        <div className="grid grid-cols-3 gap-3">
          {[
            { href: "/formation", icon: BookOpen, label: "Formation", color: "bg-green-50 text-green-700" },
            { href: "/coaching", icon: MessageCircle, label: "Coachings", color: "bg-purple-50 text-purple-700" },
            { href: "/formation#actions", icon: ListTodo, label: "Actions à faire", color: "bg-amber-50 text-amber-700" },
            { href: "/questions", icon: FileText, label: "Mes questions", color: "bg-blue-50 text-blue-700" },
            { href: "/victoires", icon: Trophy, label: "Mes victoires", color: "bg-rose-50 text-rose-700" },
            { href: "/calendrier", icon: Calendar, label: "Calendrier", color: "bg-teal-50 text-teal-700" },
          ].map((item) => (
            <Link key={item.href} href={item.href}>
              <div className={cn(
                "rounded-2xl p-3 flex flex-col items-center gap-2 text-center hover:scale-105 transition-transform cursor-pointer",
                item.color
              )}>
                <item.icon className="w-5 h-5" />
                <span className="text-[11px] font-semibold leading-tight">{item.label}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Inspiration */}
      {inspiration && (
        <Card className="bg-green-50 border-green-100">
          <CardContent className="pt-5">
            <div className="flex gap-3">
              <Quote className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-green-900 italic leading-relaxed">
                  {inspiration.quote}
                </p>
                {inspiration.author && (
                  <p className="text-xs text-green-600 mt-2 font-medium">
                    — {inspiration.author}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
