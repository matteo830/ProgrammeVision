"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, Users, Calendar, User } from "lucide-react";

const navItems = [
  { href: "/dashboard",   icon: Home,     label: "Accueil"    },
  { href: "/formation",   icon: BookOpen,  label: "Formation"  },
  { href: "/coaching",    icon: Users,     label: "Coaching"   },
  { href: "/calendrier",  icon: Calendar,  label: "Agenda"     },
  { href: "/profil",      icon: User,      label: "Profil"     },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
      style={{
        background: "rgba(255,255,255,0.88)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderTop: "1px solid var(--border-soft)",
      }}
    >
      <div className="flex items-center justify-around px-2 py-1.5 max-w-[640px] mx-auto">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-0.5 min-w-[44px] min-h-[44px] justify-center rounded-xl transition-colors"
            >
              <span
                className="flex items-center justify-center w-9 h-7 rounded-lg transition-colors"
                style={
                  isActive
                    ? { background: "var(--green-soft)" }
                    : {}
                }
              >
                <item.icon
                  className="w-5 h-5"
                  style={{
                    color: isActive ? "var(--green-deep)" : "var(--ink-mute)",
                    strokeWidth: isActive ? 2.5 : 2,
                  }}
                />
              </span>
              <span
                className="text-[10px] font-semibold leading-none"
                style={{
                  color: isActive ? "var(--green-deep)" : "var(--ink-mute)",
                  letterSpacing: "0.04em",
                }}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
