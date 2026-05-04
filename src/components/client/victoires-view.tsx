"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Heart, Flame } from "lucide-react";
import { formatDate, formatDateShort } from "@/lib/utils";

interface VictoiresViewProps {
  victories: Array<{ id: string; content: string; weekStartDate: Date; createdAt: Date }>;
  gratitudes: Array<{ id: string; content: string; date: Date }>;
}

export function VictoiresView({ victories, gratitudes }: VictoiresViewProps) {
  const streak = calculateStreak(gratitudes);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
      <h1 className="text-2xl font-bold text-gray-900">Mes victoires</h1>

      {/* Streak */}
      {streak > 0 && (
        <Card className="bg-gradient-to-r from-orange-50 to-amber-50 border-orange-100">
          <CardContent className="py-4 flex items-center gap-3">
            <Flame className="w-8 h-8 text-orange-500" />
            <div>
              <p className="font-bold text-orange-700 text-lg">{streak} jours actifs</p>
              <p className="text-xs text-orange-500">Continue ta lancée !</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Victoires */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Trophy className="w-5 h-5 text-amber-500" />
          <h2 className="font-semibold text-gray-900">
            Victoires de la semaine ({victories.length})
          </h2>
        </div>

        {victories.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">
            Tes victoires s&apos;afficheront ici 🏆
          </p>
        ) : (
          <div className="space-y-2">
            {victories.map((v) => (
              <Card key={v.id}>
                <CardContent className="py-3 px-4">
                  <div className="flex items-start gap-3">
                    <span className="text-lg">🏆</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-800 font-medium">{v.content}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        Semaine du {formatDateShort(v.weekStartDate)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Gratitudes */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Heart className="w-5 h-5 text-rose-400" />
          <h2 className="font-semibold text-gray-900">
            Gratitudes récentes ({gratitudes.length})
          </h2>
        </div>

        {gratitudes.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">
            Tes gratitudes quotidiennes s&apos;afficheront ici 💛
          </p>
        ) : (
          <div className="space-y-2">
            {gratitudes.map((g) => (
              <Card key={g.id}>
                <CardContent className="py-3 px-4">
                  <div className="flex items-start gap-3">
                    <span className="text-lg">💛</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-800">{g.content}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        {formatDate(g.date)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function calculateStreak(gratitudes: Array<{ date: Date }>): number {
  if (gratitudes.length === 0) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dates = gratitudes.map((g) => {
    const d = new Date(g.date);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  });

  const unique = [...new Set(dates)].sort((a, b) => b - a);

  let streak = 0;
  let current = today.getTime();

  for (const date of unique) {
    if (date === current || date === current - 86400000) {
      streak++;
      current = date - 86400000;
    } else {
      break;
    }
  }

  return streak;
}
