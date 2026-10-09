"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

type LessonProgress = {
  id: number;
  title: string;
  completed: boolean;
  score: number;
};

type ProgressResponse = {
  completed_lessons: number;
  total_lessons: number;
  completion_percentage: number;
  lessons: LessonProgress[];
};

export default function ProgressPage() {
  const [progress, setProgress] = useState<ProgressResponse | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch<ProgressResponse>("/api/lessons/progress")
      .then(setProgress)
      .catch(() => setError("Unable to load learning progress."));
  }, []);

  if (error) {
    return <main className="p-8 text-center">{error}</main>;
  }

  if (!progress) {
    return <main className="p-8 text-center">Loading progress...</main>;
  }

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-5 py-10">
      <h1 className="mb-2 text-3xl font-extrabold">Learning Progress</h1>
      <p className="mb-8 text-gray-500">
        Track your completed lessons and scores.
      </p>

      <section className="mb-8 rounded-2xl border-2 border-gray-200 p-6">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="font-bold">Course completion</h2>
          <span className="text-xl font-extrabold text-green-600">
            {progress.completion_percentage}%
          </span>
        </div>

        <div
          className="h-4 overflow-hidden rounded-full bg-gray-200"
          role="progressbar"
          aria-label="Course completion"
          aria-valuenow={progress.completion_percentage}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full rounded-full bg-green-500 transition-all"
            style={{ width: `${progress.completion_percentage}%` }}
          />
        </div>

        <p className="mt-3 text-sm text-gray-500">
          {progress.completed_lessons} of {progress.total_lessons} lessons completed
        </p>
      </section>

      <h2 className="mb-4 text-xl font-bold">Your lessons</h2>

      <section className="space-y-3">
        {progress.lessons.map((lesson) => (
          <div
            key={lesson.id}
            className="flex items-center justify-between gap-4 rounded-xl border-2 border-gray-200 p-4"
          >
            <div className="flex min-w-0 items-center gap-3">
              <span className="text-2xl">
                {lesson.completed ? "✅" : "📘"}
              </span>
              <div className="min-w-0">
                <p className="font-bold">{lesson.title}</p>
                <p className="text-sm text-gray-500">
                  {lesson.completed ? "Completed" : "Not completed"}
                </p>
              </div>
            </div>

            <div className="shrink-0 text-right">
              <p className="font-extrabold">
                {lesson.completed ? `${Math.round(lesson.score)}%` : "—"}
              </p>
              <p className="text-xs text-gray-500">Score</p>
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
