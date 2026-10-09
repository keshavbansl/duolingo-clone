
"use client";

import { ChevronDown } from "lucide-react";
import GamificationStats from "../gamification/GamificationStats";

type TopBarProps = {
  courseName?: string;
  language?: string;
  xp?: number;
  streak?: number;
  hearts?: number;
  gems?: number;
};

export default function TopBar({
  courseName = "Spanish",
  language = "ES",
  xp = 450,
  streak = 7,
  hearts = 5,
  gems = 120,
}: TopBarProps) {
  return (
    <header className="sticky top-0 z-50 border-b-2 border-border bg-white">
      <div className="duo-container flex min-h-[76px] items-center justify-between gap-4">
        <button
          type="button"
          aria-label={`Current course: ${courseName}`}
          className="flex shrink-0 items-center gap-3 rounded-xl p-2 transition hover:bg-gray-50"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-green text-2xl shadow-[0_3px_0_var(--green-dark)]">
            🇪🇸
          </span>

          <span className="hidden text-left sm:block">
            <span className="block text-xs font-extrabold uppercase tracking-wider text-muted">
              Learning
            </span>
            <span className="flex items-center gap-1 font-black text-foreground">
              {courseName}
              <ChevronDown size={16} strokeWidth={3} />
            </span>
          </span>

          <span className="text-sm font-black text-foreground sm:hidden">
            {language}
          </span>
        </button>

        <GamificationStats xp={xp} streak={streak} hearts={hearts} gems={gems} />
      </div>
    </header>
  );
}
