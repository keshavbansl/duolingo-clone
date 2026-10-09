
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Home,
  Trophy,
  UserRound,
  Settings,
  Award,
  ShoppingBag,
  Users,
  Target,
  Menu,
  X,
} from "lucide-react";

const navItems = [
  { label: "Home", href: "/", Icon: Home },
  { label: "Leaderboard", href: "/leaderboard", Icon: Trophy },
  { label: "Profile", href: "/profile", Icon: UserRound },
  { label: "Settings", href: "/settings", Icon: Settings },
];

const extraNavItems = [
  { label: "Achievements", href: "/achievements", Icon: Award },
  { label: "Shop", href: "/shop", Icon: ShoppingBag },
  { label: "Friends", href: "/friends", Icon: Users },
  { label: "Quests", href: "/quests", Icon: Target },
];

export default function BottomNav() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav
      aria-label="Main navigation"
      className="fixed inset-x-0 bottom-0 z-50 border-t-2 border-border bg-white pb-[env(safe-area-inset-bottom)]"
    >
      {menuOpen && (
        <div className="mx-auto grid max-w-2xl grid-cols-4 gap-2 px-3 py-3">
          {extraNavItems.map(({ label, href, Icon }) => {
            const isActive = pathname === href;

            return (
              <Link
                key={href}
                href={href}
                aria-current={isActive ? "page" : undefined}
                onClick={() => setMenuOpen(false)}
                className={`flex flex-col items-center justify-center gap-1 rounded-xl px-1 py-3 ${
                  isActive
                    ? "bg-green/10 text-green"
                    : "text-muted hover:bg-gray-50 hover:text-foreground"
                }`}
              >
                <Icon size={22} aria-hidden="true" />
                <span className="text-[11px] font-extrabold sm:text-xs">
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      )}

      <div className="mx-auto flex min-h-[72px] max-w-2xl items-stretch justify-around px-2">
        {navItems.map(({ label, href, Icon }) => {
          const isActive = pathname === href;

          return (
            <Link
              key={href}
              href={href}
              aria-current={isActive ? "page" : undefined}
              className={`relative flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-xl px-1 py-2 transition-colors ${
                isActive
                  ? "text-green"
                  : "text-muted hover:bg-gray-50 hover:text-foreground"
              }`}
            >
              <Icon
                size={23}
                strokeWidth={isActive ? 3 : 2.3}
                aria-hidden="true"
              />
              <span className="text-[11px] font-extrabold sm:text-xs">
                {label}
              </span>
              {isActive && (
                <span className="absolute bottom-0 h-1 w-10 rounded-t-full bg-green" />
              )}
            </Link>
          );
        })}

        <button
          type="button"
          aria-label={menuOpen ? "Close menu" : "More navigation links"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}
          className={`flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-xl px-1 py-2 transition-colors ${
            menuOpen
              ? "text-green"
              : "text-muted hover:bg-gray-50 hover:text-foreground"
          }`}
        >
          {menuOpen ? (
            <X size={23} aria-hidden="true" />
          ) : (
            <Menu size={23} aria-hidden="true" />
          )}
          <span className="text-[11px] font-extrabold sm:text-xs">
            More
          </span>
        </button>
      </div>
    </nav>
  );
}