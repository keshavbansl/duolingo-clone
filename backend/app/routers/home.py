
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, selectinload
from sqlalchemy import desc
from ..database import get_db
from ..models import (
    User,
    Course,
    Unit,
    Skill,
    UserSkillProgress,
    UserLessonProgress,
)

router = APIRouter(
    prefix="/home",
    tags=["Home"],
)


@router.get("/")
def get_home(db: Session = Depends(get_db)):
    """Return the complete home screen payload."""

    user = db.query(User).filter(User.name == "Keshav").first()

    if user is None:
        raise HTTPException(status_code=404, detail="Demo user not found")

    course = (
        db.query(Course)
        .options(
            selectinload(Course.units)
            .selectinload(Unit.skills)
            .selectinload(Skill.lessons)
        )
        .filter(Course.name == "Spanish")
        .first()
    )

    if course is None:
        raise HTTPException(status_code=404, detail="Spanish course not found")

    skill_progress = {
        item.skill_id: item
        for item in db.query(UserSkillProgress).filter(
            UserSkillProgress.user_id == user.id
        ).all()
    }

    lesson_progress = {
        item.lesson_id: item
        for item in db.query(UserLessonProgress).filter(
            UserLessonProgress.user_id == user.id
        ).all()
    }

    units_data = []
    previous_skill_completed = True

    for unit in sorted(course.units, key=lambda item: item.order_index):
        skills_data = []

        for skill in sorted(unit.skills, key=lambda item: item.order_index):
            progress = skill_progress.get(skill.id)
            progress_value = progress.progress if progress else 0.0
            is_completed = progress.completed if progress else False

            if is_completed:
                status = "completed"
            elif progress_value > 0:
                status = "in_progress"
            elif previous_skill_completed:
                status = "available"
            else:
                status = "locked"

            lessons_data = []

            for lesson in sorted(
                skill.lessons,
                key=lambda item: item.order_index,
            ):
                record = lesson_progress.get(lesson.id)

                lessons_data.append({
                    "id": lesson.id,
                    "title": lesson.title,
                    "order_index": lesson.order_index,
                    "completed": record.completed if record else False,
                    "score": record.score if record else 0.0,
                    "completed_at": (
                        record.completed_at.isoformat()
                        if record and record.completed_at
                        else None
                    ),
                })

            skills_data.append({
                "id": skill.id,
                "name": skill.name,
                "description": skill.description,
                "order_index": skill.order_index,
                "progress": progress_value,
                "completed": is_completed,
                "status": status,
                "locked": status == "locked",
                "lessons": lessons_data,
            })

            previous_skill_completed = is_completed

        units_data.append({
            "id": unit.id,
            "title": unit.title,
            "description": unit.description,
            "order_index": unit.order_index,
            "skills": skills_data,
        })

    return {
        
        "user": {
            "id": user.id,
            "name": user.name,
            "xp": user.xp,
            "streak": user.streak,
            "hearts": user.hearts,
            "gems": user.gems,
            "daily_goal": user.daily_goal,
            "daily_xp": user.daily_xp,
            "daily_goal_progress": min(
                100,
                round(user.daily_xp / max(user.daily_goal, 1) * 100),
            ),
        },
        "course": {
            "id": course.id,
            "name": course.name,
            "language": course.language,
            "units": units_data,
        },
    }



@router.get("/profile")
def get_profile(db: Session = Depends(get_db)):
    """Return profile statistics for the demo user."""

    user = db.query(User).filter(User.name == "Keshav").first()

    if user is None:
        raise HTTPException(status_code=404, detail="Demo user not found")

    return {
        "id": user.id,
        "name": user.name,
        "xp": user.xp,
        "streak": user.streak,
        "hearts": user.hearts,
        "gems": user.gems,
        "daily_goal": user.daily_goal,
        "daily_xp": user.daily_xp,
        "daily_goal_progress": min(
            100,
            round(user.daily_xp / max(user.daily_goal, 1) * 100),
        ),
    }

@router.get("/leaderboard")
def get_leaderboard(db: Session = Depends(get_db)):
    """Rank users by total XP."""

    current_user = db.query(User).filter(User.name == "Keshav").first()

    if current_user is None:
        raise HTTPException(status_code=404, detail="Demo user not found")

    users = (
        db.query(User)
        .order_by(desc(User.xp), User.id.asc())
        .all()
    )

    return {
        "current_user_id": current_user.id,
        "leaderboard": [
            {
                "rank": rank,
                "id": user.id,
                "name": user.name,
                "xp": user.xp,
                "streak": user.streak,
                "is_current_user": user.id == current_user.id,
            }
            for rank, user in enumerate(users, start=1)
        ],
    }
