"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, Calendar, MessageCircle, Trophy, FileText, User, LogOut, Users, Settings } from "lucide-react";
import { signOut } from "next-auth/react";

const clientNav = [
  { href: "/dashboard", emoji: "🏠", label: "Accueil", icon: Home },
  { href: "/formation", emoji: "📚", label: "Formation", icon: BookOpen },
  { href: "/coaching", emoji: "💬", label: "Coaching", icon: MessageCircle },
  { href: "/calendrier", emoji: "📅", label: "Calendrier", icon: Calendar },
  { href: "/questions", emoji: "❓", label: "Mes questions", icon: FileText },
  { href: "/victoires", emoji: "🏆", label: "Mes victoires", icon: Trophy },
  { href: "/profil", emoji: "👤", label: "Profil", icon: User },
];

const coachNav = [
  { href: "/coach/clients", emoji: "👥", label: "Mes clients", icon: Users },
  { href: "/coach/coaches", emoji: "🎓", label: "Coaches", icon: Users },
  { href: "/coach/modules", emoji: "⚙️", label: "Modules", icon: Settings },
  { href: "/coach/settings", emoji: "🔧", label: "Paramètres", icon: Settings },
];

interface SidebarProps {
  role: string;
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const nav = role === "COACH" || role === "ADMIN" ? coachNav : clientNav;

  return (
    <aside className="hidden md:flex flex-col w-64 min-h-screen fixed left-0 top-0 z-40" style={{ background: "#0E3D34" }}>
      {/* Logo */}
      <div style={{ padding: "24px 20px 20px", borderBottom: "1px solid rgba(232,197,111,0.15)" }}>
        <Link href="/dashboard" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: "rgba(232,197,111,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#D4A047">
              <path d="M12 2 L4 22 L20 22 Z" opacity="0.4" />
              <path d="M12 7 L7 20 L17 20 Z" />
            </svg>
          </div>
          <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: "0.06em", color: "#D4A047" }}>VISION</span>
        </Link>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "12px 12px", display: "flex", flexDirection: "column", gap: 2 }}>
        {nav.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "10px 12px", borderRadius: 12,
                textDecoration: "none", fontSize: 13, fontWeight: 600,
                transition: "all 0.15s",
                background: isActive ? "rgba(232,197,111,0.12)" : "transparent",
                color: isActive ? "#E8C56F" : "rgba(255,255,255,0.6)",
              }}
            >
              <span style={{ fontSize: 16 }}>{item.emoji}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div style={{ padding: "12px", borderTop: "1px solid rgba(232,197,111,0.15)" }}>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 12, width: "100%", border: "none", background: "transparent", color: "rgba(255,255,255,0.45)", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.15s", fontFamily: "inherit" }}
        >
          <LogOut size={15} />
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
