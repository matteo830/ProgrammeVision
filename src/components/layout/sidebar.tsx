"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  BookOpen,
  Calendar,
  MessageCircle,
  Trophy,
  FileText,
  User,
  Sparkles,
  LogOut,
  Users,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";

const clientNav = [
  { href: "/dashboard", icon: Home, label: "Accueil" },
  { href: "/formation", icon: BookOpen, label: "Formation" },
  { href: "/coaching", icon: MessageCircle, label: "Coaching" },
  { href: "/calendrier", icon: Calendar, label: "Calendrier" },
  { href: "/questions", icon: FileText, label: "Mes questions" },
  { href: "/victoires", icon: Trophy, label: "Mes victoires" },
  { href: "/profil", icon: User, label: "Profil" },
];

const coachNav = [
  { href: "/coach", icon: Users, label: "Mes clients" },
  { href: "/coach/modules", icon: Settings, label: "Modules" },
];

interface SidebarProps {
  role: string;
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const nav = role === "COACH" ? coachNav : clientNav;

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-100 min-h-screen fixed left-0 top-0 z-40">
      <div className="p-6 border-b border-gray-100">
        <Link href="/dashboard" className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-green-800">Vision</h1>
          <Sparkles className="w-5 h-5 text-amber-400" />
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {nav.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                isActive
                  ? "bg-green-50 text-green-800"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
              )}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-100">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-800 transition-all w-full"
        >
          <LogOut className="w-4 h-4" />
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
