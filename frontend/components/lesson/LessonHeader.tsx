"use client";

import { ArrowLeft, Heart } from "lucide-react";

type LessonHeaderProps = {
  title: string;
  current: number;
  total: number;
  hearts: number;
  onExit: () => void;
};

export default function LessonHeader({
  title,
  current,
  total,
  hearts,
  onExit,
}: LessonHeaderProps) {
  const progress =
    total > 0 ? Math.min(100, Math.max(0, (current / total) * 100)) : 0;

  return (
    <header className="flex items-center gap-3 sm:gap-4">
      <button
        type="button"
        onClick={onExit}
        aria-label="Exit lesson"
        className="shrink-0 rounded-xl p-2 text-muted transition hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-green"
      >
        <ArrowLeft size={25} />
      </button>

      <div className="min-w-0 flex-1">
        <p className="mb-1 truncate text-xs font-extrabold text-muted">
          {title}
        </p>

        <div
          role="progressbar"
          aria-label="Lesson progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress)}
          className="h-3 overflow-hidden rounded-full bg-border"
        >
          <div
            className="h-full rounded-full bg-green transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div
        className="flex shrink-0 items-center gap-1 font-black text-red"
        aria-label={`${hearts} hearts remaining`}
      >
        <Heart size={22} fill="currentColor" aria-hidden="true" />
        <span>{hearts}</span>
      </div>
    </header>
  );
}