"use client";

import { useState } from "react";

type Exercise = {
  id: number;
  type: string;
  question: string;
  options: string[] | null;
  data: unknown;
  order_index: number;
};

type Props = {
  exercise: Exercise;
  current: number;
  total: number;
  selectedAnswer: string | null;
  onSelectAnswer: (answer: string) => void;
  onCheck: (answer: string) => void;
  feedback: string | null;
  isCorrect: boolean | null;
  checking: boolean;
};

export default function ExerciseRenderer({
  exercise,
  current,
  total,
  selectedAnswer,
  onSelectAnswer,
  onCheck,
  feedback,
  isCorrect,
  checking,
}: Props) {
  const [textAnswer, setTextAnswer] = useState("");
  const [firstMatch, setFirstMatch] = useState<string | null>(null);
  const [secondMatch, setSecondMatch] = useState<string | null>(null);

  const data =
    exercise.data && typeof exercise.data === "object"
      ? (exercise.data as Record<string, unknown>)
      : {};

  const pairs =
    data.pairs && typeof data.pairs === "object"
      ? (data.pairs as Record<string, string>)
      : {};

  const matchItems = Object.entries(pairs).flatMap(([key, value]) => [
    key,
    value,
  ]);

  const matchingComplete = Boolean(firstMatch && secondMatch);
  const answerReady =
    exercise.type === "multiple_choice"
      ? Boolean(selectedAnswer)
      : exercise.type === "match_pairs"
        ? matchingComplete
        : Boolean(textAnswer.trim());

  function chooseMatch(item: string) {
    if (!firstMatch) {
      setFirstMatch(item);
      return;
    }

    setSecondMatch(item);
    onSelectAnswer(JSON.stringify([firstMatch, item]));
  }

  function handleCheck() {
    const answer =
      exercise.type === "multiple_choice"
        ? selectedAnswer ?? ""
        : exercise.type === "match_pairs"
          ? JSON.stringify([firstMatch, secondMatch])
          : textAnswer.trim();

    if (answer.trim()) onCheck(answer);
  }

  return (
    <div className="duo-card">
      <p className="mb-4 text-sm font-bold text-muted">
        Question {current + 1} of {total}
      </p>

      <h2 className="mb-8 text-2xl font-extrabold">
        {exercise.question}
      </h2>

      {exercise.type === "multiple_choice" &&
      Array.isArray(exercise.options) ? (
        <div className="grid gap-3">
          {exercise.options.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => onSelectAnswer(option)}
              aria-pressed={selectedAnswer === option}
              className={`w-full rounded-2xl border-2 p-4 text-left font-bold transition ${
                selectedAnswer === option
                  ? "border-blue bg-blue/10 text-blue"
                  : "border-border hover:bg-gray-50"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      ) : ["translate", "fill_blank", "type_answer"].includes(
          exercise.type,
        ) ? (
        <textarea
          value={textAnswer}
          onChange={(event) => setTextAnswer(event.target.value)}
          placeholder={
            exercise.type === "translate"
              ? "Type your translation..."
              : exercise.type === "fill_blank"
                ? "Enter the missing word..."
                : "Type your answer..."
          }
          rows={3}
          className="w-full rounded-2xl border-2 border-border p-4 font-semibold outline-none focus:border-blue"
        />
      ) : exercise.type === "match_pairs" ? (
        matchItems.length ? (
          <div className="grid grid-cols-2 gap-3">
            {matchItems.map((item) => {
              const chosen = item === firstMatch || item === secondMatch;

              return (
                <button
                  key={item}
                  type="button"
                  disabled={matchingComplete}
                  onClick={() => chooseMatch(item)}
                  className={`rounded-2xl border-2 p-3 font-bold ${
                    chosen
                      ? "border-blue bg-blue/10 text-blue"
                      : "border-border hover:bg-gray-50"
                  }`}
                >
                  {item}
                </button>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-muted">
            Matching-pair data is missing for this exercise.
          </p>
        )
      ) : (
        <p className="text-sm text-muted">
          Unsupported exercise type: {exercise.type}
        </p>
      )}

      <button
        type="button"
        disabled={!answerReady || checking || feedback !== null}
        onClick={handleCheck}
        className="duo-button duo-button-primary mt-8 w-full disabled:cursor-not-allowed disabled:opacity-50"
      >
        {checking ? "Checking..." : feedback ? "Answer checked" : "Check answer"}
      </button>

      {feedback && (
        <p
          role="status"
          className={`mt-4 rounded-xl p-4 font-bold ${
            isCorrect
              ? "bg-green-50 text-green-800"
              : "bg-red-50 text-red-700"
          }`}
        >
          {feedback}
        </p>
      )}
    </div>
  );
}

