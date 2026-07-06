"use client";
import { useState } from "react";
import { Users, UserCheck, UserX, Plus, Pencil, PowerOff, Power } from "lucide-react";
import { UserFormModal } from "./user-form-modal";

type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isActive: boolean;
  avatarUrl: string | null;
  createdAt: Date;
  ghlCalendarSlug: string | null;
};

type ClientWithStats = User & {
  validatedModules: number;
  progressPercent: number;
  clientProfile: { programStartDate: Date | null } | null;
  moduleProgresses: unknown[];
};

type Props = {
  coaches: User[];
  clients: ClientWithStats[];
  inactive: User[];
  currentAdminId: string;
};

type Tab = "coaches" | "clients" | "inactive";

function Mountain() {
  return (
    <svg width="140" height="88" viewBox="0 0 140 88" fill="none"
      className="absolute bottom-0 right-0 pointer-events-none" style={{ opacity: 0.2 }}>
      <polygon points="70,8 140,88 0,88" fill="white" />
      <polygon points="105,32 140,88 70,88" fill="white" opacity="0.5" />
      <polygon points="25,50 70,88 0,88" fill="white" opacity="0.4" />
    </svg>
  );
}

function RoleBadge({ role }: { role: string }) {
  const styles: Record<string, { bg: string; color: string; label: string }> = {
    ADMIN:  { bg: "var(--gold-soft)",   color: "var(--gold-deep)",   label: "Admin"  },
    COACH:  { bg: "var(--green-soft)",  color: "var(--green-deep)",  label: "Coach"  },
    CLIENT: { bg: "rgba(232,82,125,0.1)", color: "var(--coral-end)", label: "Client" },
  };
  const s = styles[role] ?? styles.CLIENT;
  return (
    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full"
      style={{ background: s.bg, color: s.color }}>
      {s.label}
    </span>
  );
}

export function AdminDashboard({ coaches, clients, inactive, currentAdminId }: Props) {
  const [tab, setTab] = useState<Tab>("clients");
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [defaultRole, setDefaultRole] = useState<"CLIENT" | "COACH" | "ADMIN">("CLIENT");

  function handleAdd(role: "CLIENT" | "COACH" | "ADMIN") {
    setEditUser(null);
    setDefaultRole(role);
    setShowModal(true);
  }

  function handleEdit(user: User) {
    setEditUser(user);
    setShowModal(true);
  }

  async function handleToggleActive(user: User) {
    const action = user.isActive ? "désactiver" : "réactiver";
    if (!confirm(`Voulez-vous ${action} ${user.firstName} ${user.lastName} ?`)) return;
    await fetch(`/api/admin/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !user.isActive }),
    });
    window.location.reload();
  }

  const tabs: { key: Tab; label: string; count: number; icon: React.ReactNode }[] = [
    { key: "clients",  label: "Clients",         count: clients.length,  icon: <Users     className="w-4 h-4" /> },
    { key: "coaches",  label: "Coaches & Admins", count: coaches.length,  icon: <UserCheck className="w-4 h-4" /> },
    { key: "inactive", label: "Désactivés",       count: inactive.length, icon: <UserX     className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen" style={{ background: "var(--cream)" }}>
      <div className="max-w-5xl mx-auto px-4 py-6">

        {/* Hero */}
        <div className="relative overflow-hidden rounded-[20px] mb-6"
          style={{ background: "linear-gradient(160deg, var(--green-deep) 0%, #07251F 100%)", padding: "24px 24px 22px" }}>
          <Mountain />
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] mb-1.5" style={{ color: "var(--gold-light)" }}>
            Panneau d'administration
          </p>
          <div className="flex items-end justify-between">
            <div>
              <h1 className="text-[22px] font-extrabold leading-tight tracking-[-0.02em]" style={{ color: "#fff" }}>
                Gestion des comptes
              </h1>
              <p className="text-[13px] mt-0.5" style={{ color: "rgba(255,255,255,0.65)" }}>
                {clients.length} clients · {coaches.length} coaches &amp; admins
              </p>
            </div>
            {/* CTA boutons */}
            <div className="flex gap-2 shrink-0">
              <button onClick={() => handleAdd("CLIENT")}
                className="flex items-center gap-1.5 text-[12.5px] font-bold px-3.5 py-2 rounded-[10px] transition-opacity active:opacity-80"
                style={{ background: "linear-gradient(135deg, var(--coral-start), var(--coral-end))", color: "#fff" }}>
                <Plus className="w-3.5 h-3.5" /> Client
              </button>
              <button onClick={() => handleAdd("COACH")}
                className="flex items-center gap-1.5 text-[12.5px] font-bold px-3.5 py-2 rounded-[10px] transition-opacity active:opacity-80"
                style={{ background: "rgba(255,255,255,0.15)", color: "#fff", border: "1px solid rgba(255,255,255,0.25)" }}>
                <Plus className="w-3.5 h-3.5" /> Coach
              </button>
              <button onClick={() => handleAdd("ADMIN")}
                className="flex items-center gap-1.5 text-[12.5px] font-bold px-3.5 py-2 rounded-[10px] transition-opacity active:opacity-80"
                style={{ background: "rgba(255,255,255,0.1)", color: "var(--gold-light)", border: "1px solid rgba(212,160,71,0.4)" }}>
                <Plus className="w-3.5 h-3.5" /> Admin
              </button>
            </div>
          </div>
        </div>

        {/* Onglets */}
        <div className="flex gap-1 rounded-[14px] p-1 mb-5 w-fit"
          style={{ background: "#fff", border: "1px solid var(--border)" }}>
          {tabs.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className="flex items-center gap-2 px-4 py-2 rounded-[10px] text-[13px] font-semibold transition-colors"
              style={tab === t.key
                ? { background: "var(--green-deep)", color: "#fff" }
                : { color: "var(--ink-mute)" }
              }>
              {t.icon} {t.label}
              <span className="text-[11px] px-1.5 py-0.5 rounded-full font-bold"
                style={tab === t.key
                  ? { background: "rgba(255,255,255,0.2)", color: "#fff" }
                  : { background: "var(--border-soft)", color: "var(--ink-mute)" }
                }>
                {t.count}
              </span>
            </button>
          ))}
        </div>

        {/* Tableau */}
        <div className="rounded-[16px] overflow-hidden" style={{ background: "#fff", border: "1px solid var(--border)" }}>
          {tab === "clients" && (
            <UserTable users={clients} onEdit={handleEdit} onToggle={handleToggleActive}
              currentAdminId={currentAdminId}
              extra={(u) => {
                const pct = (u as ClientWithStats).progressPercent;
                return (
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--border-soft)" }}>
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: "var(--green-accent)" }} />
                    </div>
                    <span className="text-[12px] tabular-nums" style={{ color: "var(--ink-mute)" }}>{pct}%</span>
                  </div>
                );
              }} />
          )}
          {tab === "coaches" && (
            <UserTable users={coaches} onEdit={handleEdit} onToggle={handleToggleActive} currentAdminId={currentAdminId} />
          )}
          {tab === "inactive" && (
            <UserTable users={inactive} onEdit={handleEdit} onToggle={handleToggleActive} currentAdminId={currentAdminId} showBadge />
          )}
        </div>
      </div>

      {showModal && (
        <UserFormModal
          user={editUser}
          defaultRole={defaultRole}
          onClose={() => setShowModal(false)}
          onSuccess={() => { setShowModal(false); window.location.reload(); }}
        />
      )}
    </div>
  );
}

function UserTable({ users, onEdit, onToggle, currentAdminId, extra, showBadge }: {
  users: User[];
  onEdit: (u: User) => void;
  onToggle: (u: User) => void;
  currentAdminId: string;
  extra?: (u: User) => React.ReactNode;
  showBadge?: boolean;
}) {
  if (users.length === 0) {
    return (
      <p className="text-center py-12 text-[13px]" style={{ color: "var(--ink-mute)" }}>
        Aucun compte.
      </p>
    );
  }

  return (
    <table className="w-full text-[13px]">
      <thead style={{ background: "var(--cream)", borderBottom: "1px solid var(--border-soft)" }}>
        <tr>
          <th className="text-left px-5 py-3 font-semibold" style={{ color: "var(--ink-soft)" }}>Nom</th>
          <th className="text-left px-4 py-3 font-semibold" style={{ color: "var(--ink-soft)" }}>Email</th>
          <th className="text-left px-4 py-3 font-semibold" style={{ color: "var(--ink-soft)" }}>Rôle</th>
          {extra && <th className="text-left px-4 py-3 font-semibold" style={{ color: "var(--ink-soft)" }}>Progression</th>}
          <th className="text-right px-5 py-3 font-semibold" style={{ color: "var(--ink-soft)" }}>Actions</th>
        </tr>
      </thead>
      <tbody>
        {users.map((u, i) => (
          <tr key={u.id}
            style={{ borderTop: i > 0 ? "1px solid var(--border-soft)" : undefined }}
            className="hover:bg-[var(--cream)] transition-colors">
            <td className="px-5 py-3.5 font-semibold" style={{ color: "var(--ink)" }}>
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0"
                  style={{ background: "var(--green-soft)", color: "var(--green-deep)" }}>
                  {u.firstName[0]}{u.lastName[0]}
                </div>
                {u.firstName} {u.lastName}
                {showBadge && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                    style={{ background: "rgba(232,82,125,0.1)", color: "var(--coral-end)" }}>
                    Inactif
                  </span>
                )}
              </div>
            </td>
            <td className="px-4 py-3.5" style={{ color: "var(--ink-mute)" }}>{u.email}</td>
            <td className="px-4 py-3.5"><RoleBadge role={u.role} /></td>
            {extra && <td className="px-4 py-3.5">{extra(u)}</td>}
            <td className="px-5 py-3.5 text-right">
              <div className="flex items-center justify-end gap-1.5">
                <button onClick={() => onEdit(u)}
                  className="p-1.5 rounded-lg transition-colors"
                  style={{ color: "var(--ink-mute)" }}
                  title="Modifier">
                  <Pencil className="w-4 h-4" />
                </button>
                {u.id !== currentAdminId && (
                  <button onClick={() => onToggle(u)}
                    className="p-1.5 rounded-lg transition-colors"
                    style={{ color: "var(--ink-mute)" }}
                    title={u.isActive ? "Désactiver" : "Réactiver"}>
                    {u.isActive ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                  </button>
                )}
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
