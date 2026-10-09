"use client";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { apiFetch } from "@/lib/api";
import type { HomeResponse, HomeSkillData } from "@/lib/types";
import LearningPath from "@/components/learning-path/LearningPath";
import LessonDetails from "@/components/learning-path/LessonDetails";
import {
  canSelectSkill,
  findSkillById,
  getLessonPath,
  getSkillLockMessage,
} from "@/lib/navigation";

export default function Home() {
  const [homeData, setHomeData] = useState<HomeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<HomeSkillData | null>(
  null,
  );
  const router = useRouter();
  const detailsRef = useRef<HTMLDivElement>(null);
  const [skillMessage, setSkillMessage] = useState<string | null>(null);
  useEffect(() => {
    if (selectedSkill) {
      detailsRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [selectedSkill]);

  useEffect(() => {
    if (!homeData || !selectedSkill) return;

    const updatedSkill = findSkillById(
      homeData.course.units,
      selectedSkill.id,
    );

    if (!updatedSkill || updatedSkill.locked) {
      setSelectedSkill(null);
      return;
    }

    setSelectedSkill(updatedSkill);
  }, [homeData, selectedSkill?.id]);

  useEffect(() => {
    let isMounted = true;

    async function loadHome() {
      try {
        const data = await apiFetch<HomeResponse>("/api/home/");

        if (isMounted) {
          setHomeData(data);
          setError(null);
        }
      } catch {
        if (isMounted) {
          setError(
            "Could not load your learning path. Make sure the backend server is running.",
          );
        }
      }
    }

    loadHome();

    return () => {
      isMounted = false;
    };
  }, []);

  if (error) {
    return (
      <main className="duo-container py-12">
        <div
          role="alert"
          className="duo-card mx-auto max-w-xl p-8 text-center"
        >
          <div className="mb-4 text-5xl">🦉</div>
          <p className="font-extrabold text-red">{error}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="duo-button duo-button-primary mt-6 px-6 py-3"
          >
            Try again
          </button>
        </div>
      </main>
    );
  }

  if (!homeData) {
    return (
      <main className="duo-container py-12">
        <div className="duo-card mx-auto max-w-xl p-8 text-center">
          <div className="mb-4 text-5xl">🦉</div>
          <p className="font-extrabold text-muted">
            Loading your learning path...
          </p>
          <div className="mx-auto mt-5 h-2 max-w-xs overflow-hidden rounded-full bg-border">
            <div className="h-full w-1/2 animate-pulse rounded-full bg-green" />
          </div>
        </div>
      </main>
    );
  }

  const { user, course } = homeData;
  const skills = course.units.flatMap((unit) => unit.skills);
  const completedSkills = skills.filter((skill) => skill.completed).length;

  return (
    <main className="duo-container space-y-8 py-8 sm:py-10">
      <section className="mx-auto w-full max-w-2xl">
        <p className="duo-label text-green">{course.language} course</p>
        <h1 className="duo-heading-xl mt-2">
          Welcome back, {user.name}!
        </h1>
        <p className="duo-text mt-2 text-muted">
          Keep your streak alive and continue learning.
        </p>

        <div className="mt-5 flex flex-wrap gap-3">
          <div className="rounded-xl bg-green/10 px-4 py-3">
            <p className="text-xs font-extrabold text-green">Daily goal</p>
            <p className="mt-1 font-black">{user.daily_goal} XP</p>
          </div>
          <div className="rounded-xl bg-blue/10 px-4 py-3">
            <p className="text-xs font-extrabold text-blue">Skills completed</p>
            <p className="mt-1 font-black">
              {completedSkills} / {skills.length}
            </p>
          </div>
        </div>
      </section>


      <LearningPath
        units={course.units}
        selectedSkillId={selectedSkill?.id ?? null}
        onSelectSkill={(skillId) => {
          const skill = findSkillById(course.units, skillId);

          if (!skill) return;

          if (!canSelectSkill(skill)) {
            setSkillMessage(getSkillLockMessage());
            setSelectedSkill(null);
            return;
          }

          setSkillMessage(null);
          setSelectedSkill(skill);
        }}
      />

      {skillMessage && (
        <div
          role="status"
          className="mx-auto w-full max-w-2xl rounded-xl border-2 border-border bg-gray-50 p-4 text-center font-extrabold text-muted"
        >
          🔒 {skillMessage}
        </div>
      )}

      {selectedSkill && (
        <div ref={detailsRef} className="mx-auto w-full max-w-2xl">
          <LessonDetails
            skill={selectedSkill}
            onClose={() => setSelectedSkill(null)}
            onStartLesson={(lessonId) => {
              router.push(getLessonPath(lessonId));
            }}
          />
        </div>
      )}
    </main>
  );
}