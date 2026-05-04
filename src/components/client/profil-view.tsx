"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LogOut, Save, User, Lock, Target } from "lucide-react";

interface ProfilViewProps {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    avatarUrl: string | null;
    clientProfile: {
      objective6months: string | null;
      currentRevenue: number | null;
      targetRevenue: number | null;
      currentSalary: number | null;
      targetSalary: number | null;
    } | null;
  };
}

export function ProfilView({ user }: ProfilViewProps) {
  const [form, setForm] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
  });
  const [objective, setObjective] = useState(
    user.clientProfile?.objective6months ?? ""
  );
  const [finances, setFinances] = useState({
    currentRevenue: user.clientProfile?.currentRevenue?.toString() ?? "",
    targetRevenue: user.clientProfile?.targetRevenue?.toString() ?? "",
    currentSalary: user.clientProfile?.currentSalary?.toString() ?? "",
    targetSalary: user.clientProfile?.targetSalary?.toString() ?? "",
  });
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [saving, setSaving] = useState<string | null>(null);
  const [messages, setMessages] = useState<Record<string, string>>({});

  function setMessage(key: string, msg: string) {
    setMessages((prev) => ({ ...prev, [key]: msg }));
    setTimeout(() => setMessages((prev) => { const n = { ...prev }; delete n[key]; return n; }), 3000);
  }

  async function saveProfile() {
    setSaving("profile");
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName: form.firstName,
        lastName: form.lastName,
        profile: {
          objective6months: objective || null,
          currentRevenue: finances.currentRevenue ? parseFloat(finances.currentRevenue) : null,
          targetRevenue: finances.targetRevenue ? parseFloat(finances.targetRevenue) : null,
          currentSalary: finances.currentSalary ? parseFloat(finances.currentSalary) : null,
          targetSalary: finances.targetSalary ? parseFloat(finances.targetSalary) : null,
        },
      }),
    });
    setSaving(null);
    if (res.ok) setMessage("profile", "Profil mis à jour ✓");
    else setMessage("profile", "Erreur lors de la sauvegarde");
  }

  async function changePassword() {
    if (passwords.newPassword !== passwords.confirmPassword) {
      setMessage("password", "Les mots de passe ne correspondent pas");
      return;
    }
    if (passwords.newPassword.length < 8) {
      setMessage("password", "Le mot de passe doit contenir au moins 8 caractères");
      return;
    }
    setSaving("password");
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      }),
    });
    setSaving(null);
    const data = await res.json();
    if (res.ok) {
      setMessage("password", "Mot de passe modifié ✓");
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } else {
      setMessage("password", data.error ?? "Erreur");
    }
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Mon profil</h1>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-600 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Déconnexion
        </button>
      </div>

      {/* Avatar + info */}
      <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-green-800 font-bold text-2xl">
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
          ) : (
            user.firstName[0]
          )}
        </div>
        <div>
          <p className="font-bold text-gray-900">{user.firstName} {user.lastName}</p>
          <p className="text-sm text-gray-500">{user.email}</p>
          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
            {user.role === "COACH" ? "Coach" : "Client"}
          </span>
        </div>
      </div>

      {/* Informations personnelles */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <User className="w-4 h-4" />
            Informations personnelles
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Prénom</Label>
              <Input
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Nom</Label>
              <Input
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Email</Label>
            <Input value={user.email} disabled className="bg-gray-50" />
          </div>

          {messages.profile && (
            <p className="text-xs text-green-600 font-medium">{messages.profile}</p>
          )}
        </CardContent>
      </Card>

      {/* Objectif et finances (clients uniquement) */}
      {user.role === "CLIENT" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="w-4 h-4" />
              Mon objectif et mes chiffres
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Objectif 6 mois</Label>
              <Textarea
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
                placeholder="Ex: Atteindre 10K€/mois avec un tunnel structuré"
                className="min-h-[70px]"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">CA actuel (€/mois)</Label>
                <Input
                  type="number"
                  value={finances.currentRevenue}
                  onChange={(e) =>
                    setFinances({ ...finances, currentRevenue: e.target.value })
                  }
                  placeholder="0"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">CA objectif (€/mois)</Label>
                <Input
                  type="number"
                  value={finances.targetRevenue}
                  onChange={(e) =>
                    setFinances({ ...finances, targetRevenue: e.target.value })
                  }
                  placeholder="10000"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Button className="w-full" onClick={saveProfile} disabled={saving === "profile"}>
        <Save className="w-4 h-4" />
        {saving === "profile" ? "Enregistrement..." : "Enregistrer les modifications"}
      </Button>

      {/* Mot de passe */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Lock className="w-4 h-4" />
            Changer le mot de passe
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Mot de passe actuel</Label>
            <Input
              type="password"
              value={passwords.currentPassword}
              onChange={(e) =>
                setPasswords({ ...passwords, currentPassword: e.target.value })
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Nouveau mot de passe</Label>
            <Input
              type="password"
              value={passwords.newPassword}
              onChange={(e) =>
                setPasswords({ ...passwords, newPassword: e.target.value })
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Confirmer le nouveau mot de passe</Label>
            <Input
              type="password"
              value={passwords.confirmPassword}
              onChange={(e) =>
                setPasswords({ ...passwords, confirmPassword: e.target.value })
              }
            />
          </div>

          {messages.password && (
            <p
              className={`text-xs font-medium ${
                messages.password.includes("✓") ? "text-green-600" : "text-red-600"
              }`}
            >
              {messages.password}
            </p>
          )}

          <Button
            variant="outline"
            className="w-full"
            onClick={changePassword}
            disabled={
              saving === "password" ||
              !passwords.currentPassword ||
              !passwords.newPassword
            }
          >
            {saving === "password" ? "Modification..." : "Modifier le mot de passe"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
