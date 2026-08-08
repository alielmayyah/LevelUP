"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { BarChart3, Home, Target, User, Users } from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Today", icon: Home },
  { href: "/progress", label: "Progress", icon: BarChart3 },
  { href: "/community", label: "Community", icon: Users },
  { href: "/goals", label: "Goals", icon: Target },
  { href: "/profile", label: "Profile", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 flex justify-center px-4 pb-6">
      <div className="flex items-center gap-1 rounded-full border border-white/10 bg-black/80 p-2 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.6)] backdrop-blur-md">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href} aria-label={label} className="relative">
              {active && (
                <motion.span
                  layoutId="lu-nav-pill"
                  className="absolute inset-0 rounded-full bg-primary/20 shadow-[0_0_16px_2px_var(--tw-shadow-color)] shadow-primary/50"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
              <span
                className={`relative flex items-center gap-1.5 rounded-full px-3.5 py-2.5 text-[11px] font-medium transition-colors ${
                  active ? "text-white" : "text-white/40"
                }`}
              >
                <Icon size={active ? 22 : 20} />
                {active && label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
