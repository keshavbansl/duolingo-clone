
import { Flame, Gem, Heart, Zap } from "lucide-react";

export type GamificationStatsProps = {
  xp: number;
  streak: number;
  hearts: number;
  gems: number;
};

export default function GamificationStats({
  xp,
  streak,
  hearts,
  gems,
}: GamificationStatsProps) {
  const stats = [
    {
      label: "Streak",
      value: streak,
      Icon: Flame,
      color: "text-orange",
    },
    {
      label: "XP",
      value: xp,
      Icon: Zap,
      color: "text-yellow",
    },
    {
      label: "Hearts",
      value: hearts,
      Icon: Heart,
      color: "text-red",
    },
    {
      label: "Gems",
      value: gems,
      Icon: Gem,
      color: "text-blue",
    },
  ];

  return (
    <nav
      aria-label="Learner statistics"
      className="flex items-center gap-2 sm:gap-5"
    >
      {stats.map(({ label, value, Icon, color }) => (
        <div
          key={label}
          title={label}
          aria-label={`${label}: ${value}`}
          className={`flex items-center gap-1.5 ${label === "Gems" ? "hidden sm:flex" : ""}`}
        >
          <Icon
            size={21}
            strokeWidth={2.8}
            className={`${color} ${label === "Hearts" ? "fill-red" : ""}`}
            aria-hidden="true"
          />
          <span className={`duo-stat ${color}`}>{value}</span>
        </div>
      ))}
    </nav>
  );
}
