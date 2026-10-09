import { Check, LockKeyhole, Play, Star } from "lucide-react";
import type { HomeSkillData } from "@/lib/types";

type SkillNodeProps = {
  skill: HomeSkillData;
  onSelect?: (skill: HomeSkillData) => void;
  isSelected?: boolean;
};

const statusStyles = {
  available: {
    ring: "#58CC02",
    button: "border-green-dark bg-green text-white shadow-[0_5px_0_var(--green-dark)] hover:brightness-105",
    label: "text-green-dark",
  },
  in_progress: {
    ring: "#1CB0F6",
    button: "border-blue-dark bg-blue text-white shadow-[0_5px_0_var(--blue-dark)] hover:brightness-105",
    label: "text-blue-dark",
  },
  completed: {
    ring: "#58CC02",
    button: "border-green-dark bg-green text-white shadow-[0_5px_0_var(--green-dark)]",
    label: "text-green-dark",
  },
  locked: {
    ring: "#D1D5DB",
    button: "border-gray-300 bg-gray-200 text-gray-500 shadow-[0_5px_0_#D1D5DB]",
    label: "text-muted",
  },
};

type SkillStatus = keyof typeof statusStyles;

export default function SkillNode({
  skill,
  onSelect,
  isSelected = false,
}: SkillNodeProps) {
const status: SkillStatus = skill.locked ? "locked" : skill.status;
  const styles = statusStyles[status];
  const progress = Math.max(0, Math.min(100, skill.progress));

  const StatusIcon =
    status === "completed"
      ? Check
      : status === "locked"
        ? LockKeyhole
        : status === "in_progress"
          ? Star
          : Play;

  const statusLabel = {
    available: "Start learning",
    in_progress: `${Math.round(progress)}% complete`,
    completed: "Completed",
    locked: "Locked",
  }[status];

  return (
    <button
      type="button"
      aria-disabled={status === "locked"}
      title={
        status === "locked"
          ? "Complete the previous skill to unlock this one."
          : skill.name
      }
onClick={() => onSelect?.(skill)}
      aria-label={`${skill.name}, ${statusLabel}`}
      className={`group flex w-32 flex-col items-center gap-2 rounded-2xl p-2 transition-transform hover:scale-105 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-green disabled:cursor-not-allowed ${isSelected ? "bg-green/10 ring-4 ring-green/30" : ""}`}    >
      <span
        className="relative flex h-20 w-20 items-center justify-center"
        role="progressbar"
        aria-label={`${skill.name} progress`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress}
      >
        <svg
          viewBox="0 0 80 80"
          className="absolute inset-0 h-full w-full -rotate-90"
          aria-hidden="true"
        >
          <circle
            cx="40"
            cy="40"
            r="35"
            fill="none"
            stroke="#E5E5E5"
            strokeWidth="5"
          />
          <circle
            cx="40"
            cy="40"
            r="35"
            fill="none"
            stroke={styles.ring}
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 35}
            strokeDashoffset={2 * Math.PI * 35 * (1 - progress / 100)}
            className="transition-all duration-300"
          />
        </svg>

        <span
          className={`relative flex h-16 w-16 items-center justify-center rounded-full border-b-4 transition-colors ${styles.button}`}
        >
          <StatusIcon
            size={28}
            strokeWidth={3}
            fill={status === "in_progress" ? "currentColor" : "none"}
            aria-hidden="true"
          />
        </span>
      </span>

      <span className="text-center text-sm font-extrabold leading-tight text-foreground">
        {skill.name}
      </span>

      <span className={`text-xs font-extrabold ${styles.label}`}>
        {statusLabel}
      </span>
    </button>
  );
}