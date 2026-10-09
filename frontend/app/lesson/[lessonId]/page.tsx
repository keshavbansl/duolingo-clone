"use client";

import { Suspense,useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { apiFetch } from "@/lib/api";
import LessonHeader from "@/components/lesson/LessonHeader";
import ExerciseRenderer from "@/components/lesson/ExerciseRenderer";

type LessonExercise = {
  id: number;
  type: string;
  question: string;
  options: string[] | null;
  data: unknown;
  order_index: number;
};

type LessonResponse = {
  id: number;
  title: string;
  order_index: number;
  skill: {
    id: number;
    name: string;
    description: string;
  };
  exercises: LessonExercise[];
};

function LessonContent() {
  const params = useParams<{ lessonId: string }>();
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hearts, setHearts] = useState(5);

  const [lesson, setLesson] = useState<LessonResponse | null>(null);
  const [error, setError] = useState("");
  const [notFound, setNotFound] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [textAnswer, setTextAnswer] = useState("");
  const [answerChecked, setAnswerChecked] = useState(false);
  const [answerFeedback, setAnswerFeedback] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [checkingAnswer, setCheckingAnswer] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [completingLesson, setCompletingLesson] = useState(false);
  const [completion, setCompletion] = useState<{
    xp_awarded: number;
    xp_total: number;
    score: number;
  } | null>(null);

  useEffect(() => {
    let active = true;

    async function loadLesson() {
      try {
        const data = await apiFetch<LessonResponse>(
          `/api/lessons/${params.lessonId}`,
        );

        if (active) setLesson(data);
      } catch (err) {
        if (!active) return;

        if (err instanceof Error && err.message.includes("404")) {
          setNotFound(true);
          setError("This lesson could not be found.");
        } else {
          setError(
            "Unable to load this lesson. Check your connection and try again.",
          );
        }
      }
    }

    loadLesson();

    return () => {
      active = false;
    };
  }, [params.lessonId]);

  if (error) {
    return (
      <main className="duo-container flex min-h-screen items-center justify-center py-10">
        <div className="duo-card w-full max-w-md text-center">
          <h1 className="text-2xl font-extrabold">
            {notFound ? "Lesson not found" : "Something went wrong"}
          </h1>

          <p className="mt-3 text-muted">{error}</p>

          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            {!notFound && (
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="duo-button duo-button-primary"
              >
                Try again
              </button>
            )}

            <button
              type="button"
              onClick={() => router.push("/")}
              className="duo-button border-2 border-border"
            >
              Back to home
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (!lesson) {
    return (
      <main
        className="duo-container flex min-h-screen items-center justify-center"
        role="status"
        aria-live="polite"
      >
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-border border-t-green" />
          <p className="font-bold text-muted">Loading lesson...</p>
        </div>
      </main>
    );
  }

  if (completion) {
    return (
      <main className="duo-container flex min-h-screen items-center justify-center py-10">
        <div className="duo-card w-full max-w-md text-center">
          <div className="mb-4 text-5xl">🎉</div>
          <h1 className="text-3xl font-extrabold">Lesson complete!</h1>

          <p className="mt-3 text-muted">
            You scored {completion.score}% on this lesson.
          </p>

          <div className="my-6 rounded-2xl bg-yellow-50 p-5">
            <p className="text-lg font-extrabold text-yellow-800">
              +{completion.xp_awarded} XP
            </p>
            <p className="mt-1 text-sm text-yellow-800">
              Total XP: {completion.xp_total}
            </p>
          </div>

          <button
            type="button"
            onClick={() => router.push("/")}
            className="duo-button duo-button-primary w-full"
          >
            Continue learning
          </button>
        </div>
      </main>
    );
  }

  const exercise = lesson.exercises[currentIndex];

  return (
    <main className="duo-container min-h-screen py-6 sm:py-10">
      <div className="mx-auto max-w-2xl">
        <LessonHeader
          title={lesson.title}
          current={exercise ? currentIndex + 1 : 0}
          total={lesson.exercises.length}
          hearts={hearts}
          onExit={() => router.push("/")}
        />

        <section className="mt-10">
          <p className="mb-2 text-sm font-extrabold uppercase tracking-wide text-muted">
            {lesson.skill.name}
          </p>

          <h1 className="duo-heading-xl mb-8">{lesson.title}</h1>

          {exercise ? (
            <>
              <ExerciseRenderer
                key={exercise.id}
                exercise={exercise}
                current={currentIndex}
                total={lesson.exercises.length}
                selectedAnswer={selectedAnswer}
                feedback={answerFeedback}
                isCorrect={isCorrect}
                checking={checkingAnswer}
                onSelectAnswer={(answer) => {
                  setSelectedAnswer(answer);
                  setAnswerFeedback(null);
                  setIsCorrect(null);
                  setAnswerChecked(false);
                }}
                onCheck={async (answer) => {
                  if (hearts <= 0) {
                    setAnswerFeedback(
                      "No hearts remaining. Return home to continue later.",
                    );
                    return;
                  }

                  setCheckingAnswer(true);

                  try {
                    const result = await apiFetch<{
                      is_correct: boolean;
                      feedback: string;
                      correct_answer?: string;
                    }>(
                      `/api/lessons/${lesson.id}/exercises/${exercise.id}/validate`,
                      {
                        method: "POST",
                        body: JSON.stringify({ answer }),
                      },
                    );

                    if (result.is_correct) {
                      setCorrectAnswers((count) => count + 1);
                    }

                    if (!result.is_correct) {
                      const heartResult = await apiFetch<{ hearts: number }>(
                        `/api/lessons/${lesson.id}/exercises/${exercise.id}/heart-loss`,
                        { method: "POST" },
                      );

                      setHearts(heartResult.hearts);
                    }

                    setIsCorrect(result.is_correct);
                    setAnswerFeedback(
                      result.is_correct
                        ? result.feedback
                        : `${result.feedback}${
                            result.correct_answer
                              ? ` Correct answer: ${result.correct_answer}`
                              : ""
                          }`,
                    );
                    setAnswerChecked(true);
                  } catch {
                    setAnswerFeedback(
                      "Could not check your answer. Please try again.",
                    );
                    setIsCorrect(null);
                  } finally {
                    setCheckingAnswer(false);
                  }
                }}
              />

              {answerChecked && currentIndex < lesson.exercises.length - 1 && (
                <button
                  type="button"
                  className="duo-button duo-button-primary mt-4 w-full"
                  onClick={() => {
                    setCurrentIndex((index) => index + 1);
                    setSelectedAnswer(null);
                    setTextAnswer("");
                    setAnswerChecked(false);
                    setAnswerFeedback(null);
                    setIsCorrect(null);
                  }}
                >
                  Next question
                </button>
              )}

              {answerChecked &&
                currentIndex === lesson.exercises.length - 1 && (
                  <button
                    type="button"
                    disabled={completingLesson}
                    className="duo-button duo-button-primary mt-4 w-full disabled:opacity-50"
                    onClick={async () => {
                      setCompletingLesson(true);

                      try {
                        const result = await apiFetch<{
                          completed: boolean;
                          xp_awarded: number;
                          xp_total: number;
                          score: number;
                        }>(`/api/lessons/${lesson.id}/complete`, {
                          method: "POST",
                          body: JSON.stringify({
                            correct_answers: correctAnswers,
                            total_questions: lesson.exercises.length,
                          }),
                        });

                        setCompletion({
                          xp_awarded: result.xp_awarded,
                          xp_total: result.xp_total,
                          score: result.score,
                        });
                      } catch {
                        setAnswerFeedback(
                          "Could not save lesson progress. Please try again.",
                        );
                      } finally {
                        setCompletingLesson(false);
                      }
                    }}
                  >
                    {completingLesson
                      ? "Saving progress..."
                      : "Finish lesson"}
                  </button>
                )}
            </>
          ) : (
            <div className="duo-card text-center">
              <h2 className="text-xl font-extrabold">No exercises available</h2>
              <p className="mt-2 text-muted">
                This lesson does not contain any exercises yet.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default function LessonPage() {
  return (
    <Suspense
      fallback={
        <main className="duo-container flex min-h-screen items-center justify-center">
          <p className="font-bold text-muted">Loading lesson...</p>
        </main>
      }
    >
      <LessonContent />
    </Suspense>
  );
}