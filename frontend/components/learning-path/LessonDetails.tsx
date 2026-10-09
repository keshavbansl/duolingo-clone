import { BookOpen, CheckCircle2, Circle, LockKeyhole } from "lucide-react";
import type { HomeSkillData } from "@/lib/types";

type LessonDetailsProps = {
  skill: HomeSkillData;
  onClose: () => void;
  onStartLesson: (lessonId: number) => void;
};

export default function LessonDetails({
  skill,
  onClose,
  onStartLesson,
}: LessonDetailsProps)  {
  const completedLessons = skill.lessons.filter(
    (lesson) => lesson.completed,
  ).length;
const nextLesson =
  skill.lessons.find((lesson) => !lesson.completed) ??
  (skill.completed ? skill.lessons[0] : undefined);
  return (
    <section
      aria-labelledby="lesson-details-title"
      className="duo-card w-full overflow-hidden border-2 border-border"
    >
      <div className="flex items-start justify-between gap-3 border-b border-border p-4 sm:p-5">
        <div>
          <p className="duo-label text-green">Skill details</p>
          <h2 id="lesson-details-title" className="duo-heading-lg mt-1">
            {skill.name}
          </h2>
          <p className="duo-text mt-1 text-muted">{skill.description}</p>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close lesson details"
          className="rounded-lg px-3 py-2 font-extrabold text-muted hover:bg-gray-100"
        >
          ✕
        </button>
      </div>

      <div className="p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <span className="font-extrabold">Skill progress</span>
          <span className="font-black text-green">
            {Math.round(skill.progress)}%
          </span>
        </div>

        <div
          className="mt-2 h-3 overflow-hidden rounded-full bg-gray-200"
          role="progressbar"
          aria-label={`${skill.name} progress`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={skill.progress}
        >
          <div
            className="h-full rounded-full bg-green transition-all duration-300"
            style={{
              width: `${Math.max(0, Math.min(100, skill.progress))}%`,
            }}
          />
        </div>

        <p className="duo-text-small mt-2 text-muted">
          {completedLessons} of {skill.lessons.length} lessons completed
        </p>

        <h3 className="mt-6 font-black">Lessons</h3>

        <div className="mt-3 space-y-3">
          {skill.lessons.map((lesson) => (
            <button
              key={lesson.id}
              type="button"
              onClick={() => onStartLesson(lesson.id)}
              className="flex w-full items-center gap-3 rounded-xl border-2 border-border p-3 text-left transition hover:border-green hover:bg-green/5 focus-visible:outline-2 focus-visible:outline-green"
            >
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                  lesson.completed
                    ? "bg-green/10 text-green"
                    : "bg-gray-100 text-muted"
                }`}
              >
                {lesson.completed ? (
                  <CheckCircle2 size={22} aria-hidden="true" />
                ) : (
                  <BookOpen size={22} aria-hidden="true" />
                )}
              </span>

              <div className="min-w-0 flex-1">
                <p className="font-extrabold">{lesson.title}</p>
                <p className="text-xs font-bold text-muted">
                  {lesson.completed
                    ? `Completed · Score ${Math.round(lesson.score)}%`
                    : `Lesson ${lesson.order_index}`}
                </p>
              </div>

              {lesson.completed ? (
                <CheckCircle2
                  size={20}
                  className="text-green"
                  aria-label="Completed"
                />
              ) : (
                <Circle
                  size={20}
                  className="text-muted"
                  aria-label="Not completed"
                />
              )}
            </button>
          ))}

          {skill.lessons.length === 0 && (
            <p className="rounded-xl bg-gray-50 p-4 text-sm font-semibold text-muted">
              No lessons are available for this skill yet.
            </p>
          )}
        </div>

        {skill.status === "completed" && (
          <p className="mt-5 flex items-center gap-2 font-extrabold text-green">
            <CheckCircle2 size={20} />
            Skill completed — great work!
          </p>
        )}

        {skill.status === "in_progress" && (
          <p className="mt-5 flex items-center gap-2 font-extrabold text-blue">
            <BookOpen size={20} />
            Continue working on this skill.
          </p>
        )}

        {skill.status === "available" && (
          <p className="mt-5 flex items-center gap-2 font-extrabold text-green-dark">
            <BookOpen size={20} />
            Ready to start learning!
          </p>
        )}

        {skill.locked && (
          <p className="mt-5 flex items-center gap-2 font-extrabold text-muted">
            <LockKeyhole size={20} />
            Complete the previous skill to unlock this one.
          </p>
        )}

        {nextLesson && !skill.locked && (
          <button
            type="button"
            onClick={() => onStartLesson(nextLesson.id)}
            className="duo-button duo-button-primary mt-6 w-full px-6 py-3"
          >
            {skill.completed
              ? "Practice again"
              : skill.status === "in_progress"
                ? "Continue learning"
                : "Start learning"}
          </button>
        )}
      </div>
    </section>
  );
}