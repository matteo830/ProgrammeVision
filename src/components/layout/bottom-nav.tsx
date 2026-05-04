"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Calendar, Plus, MessageCircle, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", icon: Home, label: "Accueil" },
  { href: "/calendrier", icon: Calendar, label: "Calendrier" },
  { href: "/dashboard", icon: Plus, label: "", isAction: true },
  { href: "/questions", icon: MessageCircle, label: "Messages" },
  { href: "/profil", icon: User, label: "Profil" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50 md:hidden">
      <div className="flex items-center justify-around px-2 py-2 max-w-lg mx-auto">
        {navItems.map((item, i) => {
          if (item.isAction) {
            return (
              <Link
                key={i}
                href="/dashboard"
                className="flex items-center justify-center w-12 h-12 bg-green-800 rounded-full shadow-lg -mt-6 transition-transform active:scale-95"
              >
                <Plus className="w-6 h-6 text-white" />
              </Link>
            );
          }

          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <Link
              key={i}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-colors",
                isActive ? "text-green-800" : "text-gray-400"
              )}
            >
              <item.icon className={cn("w-5 h-5", isActive && "stroke-[2.5]")} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
