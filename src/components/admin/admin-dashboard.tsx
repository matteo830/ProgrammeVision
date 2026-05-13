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
    { key: "clients", label: "Clients", count: clients.length, icon: <Users className="w-4 h-4" /> },
    { key: "coaches", label: "Coaches", count: coaches.length, icon: <UserCheck className="w-4 h-4" /> },
    { key: "inactive", label: "Désactivés", count: inactive.length, icon: <UserX className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Administration</h1>
            <p className="text-sm text-gray-500 mt-1">Gestion des comptes</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => handleAdd("CLIENT")}
              className="flex items-center gap-1.5 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800">
              <Plus className="w-4 h-4" /> Client
            </button>
            <button onClick={() => handleAdd("COACH")}
              className="flex items-center gap-1.5 px-3 py-2 bg-gray-700 text-white text-sm rounded-lg hover:bg-gray-600">
              <Plus className="w-4 h-4" /> Coach
            </button>
            <button onClick={() => handleAdd("ADMIN")}
              className="flex items-center gap-1.5 px-3 py-2 bg-gray-500 text-white text-sm rounded-lg hover:bg-gray-400">
              <Plus className="w-4 h-4" /> Admin
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white border border-gray-200 rounded-xl p-1 mb-6 w-fit">
          {tabs.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === t.key ? "bg-gray-900 text-white" : "text-gray-500 hover:text-gray-900"
              }`}>
              {t.icon} {t.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${tab === t.key ? "bg-white/20" : "bg-gray-100"}`}>
                {t.count}
              </span>
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {tab === "clients" && (
            <UserTable users={clients} onEdit={handleEdit} onToggle={handleToggleActive}
              currentAdminId={currentAdminId} extra={(u) => (
                <span className="text-xs text-gray-500">{(u as ClientWithStats).progressPercent}% complété</span>
              )} />
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
    return <p className="text-center text-gray-400 py-12 text-sm">Aucun compte.</p>;
  }

  return (
    <table className="w-full text-sm">
      <thead className="bg-gray-50 border-b border-gray-100">
        <tr>
          <th className="text-left px-4 py-3 font-medium text-gray-500">Nom</th>
          <th className="text-left px-4 py-3 font-medium text-gray-500">Email</th>
          <th className="text-left px-4 py-3 font-medium text-gray-500">Rôle</th>
          {extra && <th className="text-left px-4 py-3 font-medium text-gray-500">Progression</th>}
          <th className="text-right px-4 py-3 font-medium text-gray-500">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-50">
        {users.map((u) => (
          <tr key={u.id} className="hover:bg-gray-50">
            <td className="px-4 py-3 font-medium text-gray-900">
              {u.firstName} {u.lastName}
              {showBadge && (
                <span className="ml-2 text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">Inactif</span>
              )}
            </td>
            <td className="px-4 py-3 text-gray-500">{u.email}</td>
            <td className="px-4 py-3">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                u.role === "ADMIN" ? "bg-purple-100 text-purple-700" :
                u.role === "COACH" ? "bg-blue-100 text-blue-700" :
                "bg-green-100 text-green-700"
              }`}>{u.role}</span>
            </td>
            {extra && <td className="px-4 py-3 text-gray-500">{extra(u)}</td>}
            <td className="px-4 py-3 text-right">
              <div className="flex items-center justify-end gap-2">
                <button onClick={() => onEdit(u)} className="p-1.5 text-gray-400 hover:text-gray-700 rounded">
                  <Pencil className="w-4 h-4" />
                </button>
                {u.id !== currentAdminId && (
                  <button onClick={() => onToggle(u)}
                    className={`p-1.5 rounded ${u.isActive ? "text-gray-400 hover:text-red-600" : "text-gray-400 hover:text-green-600"}`}
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
