
"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

type Profile = {
  id: number;
  name: string;
  xp: number;
  streak: number;
  hearts: number;
  gems: number;
  daily_goal: number;
  daily_xp: number;
  daily_goal_progress: number;
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch<Profile>("/api/home/profile")
      .then(setProfile)
      .catch(() => setError("Could not load profile. Please try again."));
  }, []);

  if (error) {
    return <main className="p-8 text-center">{error}</main>;
  }

  if (!profile) {
    return <main className="p-8 text-center">Loading profile...</main>;
  }

  const stats = [
    { icon: "⚡", label: "Total XP", value: profile.xp },
    { icon: "🔥", label: "Day streak", value: profile.streak },
    { icon: "❤️", label: "Hearts", value: profile.hearts },
    { icon: "💎", label: "Gems", value: profile.gems },
  ];

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-5 py-10">
      <section className="mb-8 flex items-center gap-5">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 text-4xl">
          👤
        </div>
        <div>
          <h1 className="text-3xl font-extrabold">{profile.name}</h1>
          <p className="mt-1 text-gray-500">Language learner</p>
        </div>
      </section>

      <h2 className="mb-4 text-xl font-bold">Your statistics</h2>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="flex items-center gap-4 rounded-2xl border-2 border-gray-200 p-5"
          >
            <span className="text-3xl">{stat.icon}</span>
            <div>
              <p className="text-sm font-semibold text-gray-500">
                {stat.label}
              </p>
              <p className="text-2xl font-extrabold">{stat.value}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="mt-6 rounded-2xl border-2 border-gray-200 p-6">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold">Daily XP goal</h2>
          <span className="font-bold text-green-600">
            {profile.daily_xp}/{profile.daily_goal} XP
          </span>
        </div>

        <div
          className="h-4 overflow-hidden rounded-full bg-gray-200"
          role="progressbar"
          aria-label="Daily XP goal progress"
          aria-valuenow={profile.daily_goal_progress}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full rounded-full bg-green-500 transition-all"
            style={{ width: `${profile.daily_goal_progress}%` }}
          />
        </div>

        <p className="mt-3 text-sm text-gray-500">
          {profile.daily_goal_progress >= 100
            ? "Daily goal completed! Great work!"
            : `${Math.max(0, profile.daily_goal - profile.daily_xp)} XP left to reach your goal.`}
        </p>
      </section>
    </main>
  );
}
