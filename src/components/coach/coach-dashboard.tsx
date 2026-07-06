"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, AlertTriangle, TrendingUp, Search, Clock, ChevronRight } from "lucide-react";
import { formatDateShort } from "@/lib/utils";

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

const inputStyle: React.CSSProperties = {
  border: "1px solid var(--border)",
  background: "#fff",
  color: "var(--ink)",
  fontFamily: "inherit",
  outline: "none",
};

export function CoachDashboard() {
  const [clients, setClients] = useState<ClientStat[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/coach/clients")
      .then((r) => r.json())
      .then((data) => { setClients(data); setLoading(false); });
  }, []);

  const filtered = clients.filter(
    (c) =>
      `${c.firstName} ${c.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  );

  const atRisk = clients.filter(
    (c) => c.lastActivity && Date.now() - new Date(c.lastActivity).getTime() > 5 * 24 * 60 * 60 * 1000
  );

  const avgProgress =
    clients.length > 0
      ? Math.round(clients.reduce((s, c) => s + c.progressPercent, 0) / clients.length)
      : 0;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">

      {/* Hero */}
      <div className="relative overflow-hidden rounded-[20px] mb-6"
        style={{ background: "linear-gradient(160deg, var(--green-deep) 0%, #07251F 100%)", padding: "24px 24px 22px" }}>
        <p className="text-[11px] font-bold uppercase tracking-[0.12em] mb-1.5" style={{ color: "var(--gold-light)" }}>
          Espace coach
        </p>
        <h1 className="text-[22px] font-extrabold leading-tight tracking-[-0.02em]" style={{ color: "#fff" }}>
          Mes clients
        </h1>
        <p className="text-[13px] mt-0.5" style={{ color: "rgba(255,255,255,0.65)" }}>
          {clients.length} client{clients.length !== 1 ? "s" : ""} actif{clients.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {([
          { icon: <Users className="w-5 h-5" />, value: clients.length, label: "Total clients", color: "var(--green-deep)" },
          { icon: <TrendingUp className="w-5 h-5" />, value: `${avgProgress}%`, label: "Moy. progression", color: "var(--green-accent)" },
          { icon: <AlertTriangle className="w-5 h-5" />, value: atRisk.length, label: "À relancer", color: "var(--coral-end)" },
        ] as const).map((stat, i) => (
          <div key={i} className="rounded-[16px] p-4" style={{ background: "#fff", border: "1px solid var(--border)" }}>
            <div className="flex items-center gap-2.5">
              <div style={{ color: stat.color }}>{stat.icon}</div>
              <div>
                <p className="text-[20px] font-extrabold leading-none" style={{ color: "var(--ink)" }}>{stat.value}</p>
                <p className="text-[11px] mt-0.5" style={{ color: "var(--ink-mute)" }}>{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--ink-mute)" }} />
        <input
          placeholder="Rechercher un client..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-[10px] text-[13.5px]"
          style={inputStyle}
        />
      </div>

      {/* Client list */}
      {loading ? (
        <p className="text-center py-12 text-[13px]" style={{ color: "var(--ink-mute)" }}>Chargement...</p>
      ) : (
        <div className="space-y-2">
          {filtered.map((client) => {
            const daysSince = client.lastActivity
              ? Math.floor((Date.now() - new Date(client.lastActivity).getTime()) / (1000 * 60 * 60 * 24))
              : null;

            const isAtRisk = daysSince !== null && daysSince > 7;
            const isPending = daysSince !== null && daysSince > 4 && !isAtRisk;
            const statusLabel =
              client.progressPercent >= 70 ? "En avance"
              : isAtRisk ? `Inactif ${daysSince}j`
              : isPending ? `Inactif ${daysSince}j`
              : "Dans le rythme";
            const statusBg =
              client.progressPercent >= 70 ? "var(--green-soft)"
              : isAtRisk ? "rgba(232,82,125,0.1)"
              : isPending ? "rgba(255,138,107,0.12)"
              : "var(--border-soft)";
            const statusColor =
              client.progressPercent >= 70 ? "var(--green-deep)"
              : isAtRisk ? "var(--coral-end)"
              : isPending ? "var(--coral-start)"
              : "var(--ink-mute)";

            return (
              <Link key={client.id} href={`/coach/clients/${client.id}`}>
                <div className="flex items-center gap-3 rounded-[16px] px-4 py-3.5 transition-opacity hover:opacity-90 cursor-pointer"
                  style={{ background: "#fff", border: "1px solid var(--border)" }}>

                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-bold shrink-0"
                    style={{ background: "var(--green-soft)", color: "var(--green-deep)" }}>
                    {client.avatarUrl ? (
                      <img src={client.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
                    ) : `${client.firstName[0]}${client.lastName[0]}`}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-[13.5px] font-semibold" style={{ color: "var(--ink)" }}>
                        {client.firstName} {client.lastName}
                      </p>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{ background: statusBg, color: statusColor }}>
                        {statusLabel}
                      </span>
                      {(isAtRisk || isPending) && (
                        <AlertTriangle className="w-3.5 h-3.5" style={{ color: "var(--coral-end)" }} />
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1.5">
                      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--border-soft)" }}>
                        <div className="h-full rounded-full" style={{ width: `${client.progressPercent}%`, background: "var(--green-accent)" }} />
                      </div>
                      <span className="text-[11px] font-semibold w-9 text-right" style={{ color: "var(--ink-soft)" }}>
                        {client.progressPercent}%
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[11px]" style={{ color: "var(--ink-mute)" }}>
                        {client.validatedModules}/{client.totalModules} modules
                      </span>
                      {client.lastActivity && (
                        <span className="text-[11px] flex items-center gap-1" style={{ color: "var(--ink-mute)" }}>
                          <Clock className="w-3 h-3" />
                          {formatDateShort(client.lastActivity)}
                        </span>
                      )}
                    </div>
                  </div>

                  <ChevronRight className="w-4 h-4 shrink-0" style={{ color: "var(--border)" }} />
                </div>
              </Link>
            );
          })}

          {filtered.length === 0 && (
            <p className="text-center py-8 text-[13px]" style={{ color: "var(--ink-mute)" }}>
              Aucun client trouvé
            </p>
          )}
        </div>
      )}
    </div>
  );
}
