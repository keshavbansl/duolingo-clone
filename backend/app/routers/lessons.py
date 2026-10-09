import json

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, selectinload
from datetime import date, datetime, timedelta
from ..database import get_db
from ..models import Lesson
from pydantic import BaseModel
from ..models import Exercise
from ..models import User, UserLessonProgress

router = APIRouter(prefix="/lessons", tags=["Lessons"])


def parse_json(value):
    if value is None:
        return None
    try:
        return json.loads(value)
    except (json.JSONDecodeError, TypeError):
        return value

@router.get("/progress")
def get_learning_progress(db: Session = Depends(get_db)):
    """Return lesson completion statistics for the demo user."""

    user = db.query(User).filter(User.name == "Keshav").first()

    if user is None:
        raise HTTPException(status_code=404, detail="Demo user not found")

    lessons = db.query(Lesson).order_by(Lesson.id).all()

    progress_records = (
        db.query(UserLessonProgress)
        .filter(UserLessonProgress.user_id == user.id)
        .all()
    )

    progress_map = {item.lesson_id: item for item in progress_records}

    completed_count = sum(
        1 for item in progress_records if item.completed
    )
    total_lessons = len(lessons)

    return {
        "completed_lessons": completed_count,
        "total_lessons": total_lessons,
        "completion_percentage": round(
            completed_count / total_lessons * 100, 1
        ) if total_lessons else 0,
        "lessons": [
            {
                "id": lesson.id,
                "title": lesson.title,
                "completed": (
                    progress_map[lesson.id].completed
                    if lesson.id in progress_map else False
                ),
                "score": (
                    progress_map[lesson.id].score
                    if lesson.id in progress_map else 0
                ),
            }
            for lesson in lessons
        ],
    }

@router.get("/{lesson_id}")
def get_lesson(lesson_id: int, db: Session = Depends(get_db)):
    lesson = (
        db.query(Lesson)
        .options(
            selectinload(Lesson.skill),
            selectinload(Lesson.exercises),
        )
        .filter(Lesson.id == lesson_id)
        .first()
    )

    if lesson is None:
        raise HTTPException(status_code=404, detail="Lesson not found")

    return {
        "id": lesson.id,
        "title": lesson.title,
        "order_index": lesson.order_index,
        "skill": {
            "id": lesson.skill.id,
            "name": lesson.skill.name,
            "description": lesson.skill.description,
        },
        "exercises": [
            {
                "id": exercise.id,
                "type": exercise.type,
                "question": exercise.question,
                "options": parse_json(exercise.options),
                "data": parse_json(exercise.data),
                "order_index": exercise.order_index,
            }
            for exercise in sorted(
                lesson.exercises,
                key=lambda item: item.order_index,
            )
        ],
    }

class AnswerSubmission(BaseModel):
    answer: str


def normalize_answer(value):
    try:
        parsed = json.loads(value) if isinstance(value, str) else value
        if isinstance(parsed, (dict, list)):
            if isinstance(parsed, dict):
                return json.dumps(parsed, sort_keys=True, ensure_ascii=False)
            return json.dumps(parsed, ensure_ascii=False)
    except (json.JSONDecodeError, TypeError):
        pass

    return " ".join(str(value).strip().casefold().split())


@router.post("/{lesson_id}/exercises/{exercise_id}/validate")
def validate_answer(
    lesson_id: int,
    exercise_id: int,
    submission: AnswerSubmission,
    db: Session = Depends(get_db),
):
    exercise = (
        db.query(Exercise)
        .filter(
            Exercise.id == exercise_id,
            Exercise.lesson_id == lesson_id,
        )
        .first()
    )

    if exercise is None:
        raise HTTPException(
            status_code=404,
            detail="Exercise not found in this lesson",
        )

    correct = (
        normalize_answer(submission.answer)
        == normalize_answer(exercise.answer)
    )

    result = {
        "is_correct": correct,
        "feedback": (
            "Correct! Great job!"
            if correct
            else "Not quite. Try to remember the correct answer."
        ),
    }

    if not correct:
        result["correct_answer"] = exercise.answer

    return result


@router.post("/{lesson_id}/exercises/{exercise_id}/heart-loss")
def lose_heart(
    lesson_id: int,
    exercise_id: int,
    db: Session = Depends(get_db),
):
    exercise = (
        db.query(Exercise)
        .filter(
            Exercise.id == exercise_id,
            Exercise.lesson_id == lesson_id,
        )
        .first()
    )

    if exercise is None:
        raise HTTPException(status_code=404, detail="Exercise not found")

    user = db.query(User).filter(User.id == 1).first()
    if user is None:
        today = date.today()
        yesterday = today - timedelta(days=1)

        last_active_date = (
            user.last_active.date()
            if isinstance(user.last_active, datetime)
            else user.last_active
        )

        if last_active_date != today:
            if last_active_date == yesterday:
                user.streak += 1
            else:
                user.streak = 1

            user.last_active = datetime.utcnow()
        raise HTTPException(status_code=404, detail="User not found")

    user.hearts = max(0, user.hearts - 1)
    db.commit()
    db.refresh(user)

    return {"hearts": user.hearts}


class CompleteLessonRequest(BaseModel):
    correct_answers: int
    total_questions: int


@router.post("/{lesson_id}/complete")
def complete_lesson(
    lesson_id: int,
    submission: CompleteLessonRequest,
    db: Session = Depends(get_db),
):
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if lesson is None:
        raise HTTPException(status_code=404, detail="Lesson not found")

    user = db.query(User).filter(User.id == 1).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    total = len(lesson.exercises)
    if total == 0:
        raise HTTPException(status_code=400, detail="Lesson has no exercises")

    if submission.total_questions != total:
        raise HTTPException(status_code=400, detail="Invalid question count")

    if not 0 <= submission.correct_answers <= total:
        raise HTTPException(status_code=400, detail="Invalid correct answer count")

    progress = (
        db.query(UserLessonProgress)
        .filter_by(user_id=user.id, lesson_id=lesson_id)
        .first()
    )

    if progress and progress.completed:
        return {
            "completed": True,
            "already_completed": True,
            "xp_awarded": 0,
            "xp_total": user.xp,
            "score": progress.score,
        }

    score = round(submission.correct_answers / total * 100, 2)
    xp_awarded = submission.correct_answers * 10

    if progress is None:
        progress = UserLessonProgress(
            user_id=user.id,
            lesson_id=lesson_id,
        )
        db.add(progress)

    progress.completed = True
    progress.score = score
    progress.completed_at = datetime.utcnow()

    user.xp += xp_awarded
    if user.daily_xp_date != today:
        user.daily_xp = 0
        user.daily_xp_date = today

    user.daily_xp += xp_awarded

    db.commit()
    db.refresh(user)

    return {
        "completed": True,
        "already_completed": False,
        "xp_awarded": xp_awarded,
        "xp_total": user.xp,
        "score": score,
    }


