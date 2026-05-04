"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import {
  Users,
  AlertTriangle,
  TrendingUp,
  Search,
  Clock,
  ChevronRight,
  UserPlus,
} from "lucide-react";
import { cn, formatDateShort } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ClientStat {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl: string | null;
  progressPercent: number;
  validatedModules: number;
  totalModules: number;
  programStartDate: string | null;
  lastActivity: string | null;
}

export function CoachDashboard() {
  const [clients, setClients] = useState<ClientStat[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/coach/clients")
      .then((r) => r.json())
      .then((data) => {
        setClients(data);
        setLoading(false);
      });
  }, []);

  const filtered = clients.filter(
    (c) =>
      `${c.firstName} ${c.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  );

  const atRisk = clients.filter(
    (c) =>
      c.lastActivity &&
      Date.now() - new Date(c.lastActivity).getTime() > 5 * 24 * 60 * 60 * 1000
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mes clients</h1>
          <p className="text-sm text-gray-500">{clients.length} clients actifs</p>
        </div>
        <Link href="/coach/clients/new">
          <Button size="sm">
            <UserPlus className="w-4 h-4" />
            Nouveau client
          </Button>
        </Link>
      </div>

      {/* Stats résumé */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-xl font-bold text-gray-900">{clients.length}</p>
                <p className="text-xs text-gray-500">Total clients</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-xl font-bold text-gray-900">
                  {clients.length > 0
                    ? Math.round(
                        clients.reduce((s, c) => s + c.progressPercent, 0) /
                          clients.length
                      )
                    : 0}%
                </p>
                <p className="text-xs text-gray-500">Moy. progression</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-xl font-bold text-gray-900">{atRisk.length}</p>
                <p className="text-xs text-gray-500">À relancer</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recherche */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Rechercher un client..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Tableau clients */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">Chargement...</div>
      ) : (
        <div className="space-y-2">
          {filtered.map((client) => {
            const daysSinceActivity = client.lastActivity
              ? Math.floor(
                  (Date.now() - new Date(client.lastActivity).getTime()) /
                    (1000 * 60 * 60 * 24)
                )
              : null;

            const statusVariant =
              client.progressPercent >= 70
                ? "default"
                : daysSinceActivity !== null && daysSinceActivity > 7
                ? "destructive"
                : daysSinceActivity !== null && daysSinceActivity > 4
                ? "pending"
                : "secondary";

            const statusLabel =
              client.progressPercent >= 70
                ? "En avance"
                : daysSinceActivity !== null && daysSinceActivity > 7
                ? `Inactif ${daysSinceActivity}j`
                : daysSinceActivity !== null && daysSinceActivity > 4
                ? `Inactif ${daysSinceActivity}j`
                : "Dans le rythme";

            return (
              <Link key={client.id} href={`/coach/clients/${client.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center text-green-800 font-bold text-sm flex-shrink-0">
                        {client.avatarUrl ? (
                          <img
                            src={client.avatarUrl}
                            alt=""
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          client.firstName[0]
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold text-gray-900">
                            {client.firstName} {client.lastName}
                          </p>
                          <Badge variant={statusVariant} className="text-[10px]">
                            {statusLabel}
                          </Badge>
                          {daysSinceActivity !== null && daysSinceActivity > 4 && (
                            <AlertTriangle className="w-3.5 h-3.5 text-orange-500" />
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-1.5">
                          <Progress
                            value={client.progressPercent}
                            className="h-1.5 flex-1"
                          />
                          <span className="text-xs font-semibold text-gray-600 w-9 text-right">
                            {client.progressPercent}%
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[11px] text-gray-400">
                            {client.validatedModules}/{client.totalModules} modules
                          </span>
                          {client.lastActivity && (
                            <span className="text-[11px] text-gray-400 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatDateShort(client.lastActivity)}
                            </span>
                          )}
                        </div>
                      </div>

                      <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}

          {filtered.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              Aucun client trouvé
            </div>
          )}
        </div>
      )}
    </div>
  );
}
