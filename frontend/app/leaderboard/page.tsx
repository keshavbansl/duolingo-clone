"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

type Leader = {
  rank: number;
  id: number;
  name: string;
  xp: number;
  streak: number;
  is_current_user: boolean;
};

type LeaderboardResponse = {
  current_user_id: number;
  leaderboard: Leader[];
};

export default function LeaderboardPage() {
  const [data, setData] = useState<LeaderboardResponse | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch<LeaderboardResponse>("/api/home/leaderboard")
      .then(setData)
      .catch(() => setError("Unable to load leaderboard."));
  }, []);

  if (error) {
    return <main className="p-8 text-center">{error}</main>;
  }

  if (!data) {
    return <main className="p-8 text-center">Loading leaderboard...</main>;
  }

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-5 py-10">
      <h1 className="text-3xl font-extrabold">Leaderboard 🏆</h1>
      <p className="mb-8 mt-2 text-gray-500">
        Learn more, earn XP, and climb the rankings.
      </p>

      <section className="space-y-3">
        {data.leaderboard.map((user) => (
          <div
            key={user.id}
            className={`flex items-center gap-4 rounded-2xl border-2 p-4 ${
              user.is_current_user
                ? "border-green-500 bg-green-50"
                : "border-gray-200"
            }`}
          >
            <div className="w-10 shrink-0 text-center text-xl font-extrabold">
              {user.rank <= 3
                ? ["🥇", "🥈", "🥉"][user.rank - 1]
                : `#${user.rank}`}
            </div>

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xl">
              👤
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate font-bold">
                {user.name}
                {user.is_current_user && (
                  <span className="ml-2 text-sm text-green-700">
                    (You)
                  </span>
                )}
              </p>
              <p className="text-sm text-gray-500">
                🔥 {user.streak} day streak
              </p>
            </div>

            <div className="shrink-0 text-right">
              <p className="font-extrabold">{user.xp.toLocaleString()} XP</p>
            </div>
          </div>
        ))}
      </section>

      {data.leaderboard.length === 0 && (
        <p className="py-10 text-center text-gray-500">
          No users on the leaderboard yet.
        </p>
      )}
    </main>
  );
}
