
from datetime import datetime

from sqlalchemy.orm import Session

from .database import SessionLocal
from .models import (
    User,
    Course,
    Unit,
    Skill,
    Lesson,
    Exercise,
    UserSkillProgress,
    UserLessonProgress,
)

import json

def seed_database(db: Session) -> None:
    
    # Safely clear the existing seeded Spanish course and its progress.
    existing_course = db.query(Course).filter(
        Course.name == "Spanish"
    ).first()

    if existing_course is not None:
        unit_ids = [
            row[0]
            for row in db.query(Unit.id).filter(
                Unit.course_id == existing_course.id
            ).all()
        ]

        skill_ids = [
            row[0]
            for row in db.query(Skill.id).filter(
                Skill.unit_id.in_(unit_ids)
            ).all()
        ] if unit_ids else []

        lesson_ids = [
            row[0]
            for row in db.query(Lesson.id).filter(
                Lesson.skill_id.in_(skill_ids)
            ).all()
        ] if skill_ids else []

        # Delete dependent records before their parent records.
        if lesson_ids:
            db.query(UserLessonProgress).filter(
                UserLessonProgress.lesson_id.in_(lesson_ids)
            ).delete(synchronize_session=False)

            db.query(Exercise).filter(
                Exercise.lesson_id.in_(lesson_ids)
            ).delete(synchronize_session=False)

            db.query(Lesson).filter(
                Lesson.id.in_(lesson_ids)
            ).delete(synchronize_session=False)

        if skill_ids:
            db.query(UserSkillProgress).filter(
                UserSkillProgress.skill_id.in_(skill_ids)
            ).delete(synchronize_session=False)

            db.query(Skill).filter(
                Skill.id.in_(skill_ids)
            ).delete(synchronize_session=False)

        if unit_ids:
            db.query(Unit).filter(
                Unit.id.in_(unit_ids)
            ).delete(synchronize_session=False)

        db.delete(existing_course)
        db.flush()

    """Create demo learner, course, units, skills, and lessons."""

    # 1. Demo learner
    user = db.query(User).filter(User.name == "Keshav").first()
    if user is None:
        user = User(
            name="Keshav",
            xp=450,
            streak=7,
            hearts=5,
            gems=120,
            daily_goal=30,
            last_active=datetime.now(),
        )
        db.add(user)

    # 2. Spanish course
    course = db.query(Course).filter(Course.name == "Spanish").first()
    if course is None:
        course = Course(name="Spanish", language="Spanish")
        db.add(course)
        db.flush()

    # 3. Units
    unit_data = [
        {
            "title": "Basics",
            "description": "Learn greetings, introductions, and common Spanish words.",
            "order_index": 1,
        },
        {
            "title": "Everyday Life",
            "description": "Practice useful Spanish vocabulary for food and family.",
            "order_index": 2,
        },
    ]

    for item in unit_data:
        exists = db.query(Unit).filter(
            Unit.course_id == course.id,
            Unit.order_index == item["order_index"],
        ).first()

        if not exists:
            db.add(Unit(course_id=course.id, **item))

    db.flush()

    units = db.query(Unit).filter(
        Unit.course_id == course.id
    ).all()
    unit_by_order = {unit.order_index: unit for unit in units}

    # 4. Skills
    skill_data = [
        (1, "Greetings", "Learn to say hello, goodbye, and polite greetings.", 1),
        (1, "Introductions", "Introduce yourself and ask someone's name.", 2),
        (1, "Common Words", "Practice useful everyday Spanish words.", 3),
        (2, "Food", "Learn Spanish words for food, drinks, and meals.", 1),
        (2, "Family", "Learn how to talk about family members.", 2),
    ]

    for unit_order, name, description, order_index in skill_data:
        unit = unit_by_order[unit_order]
        exists = db.query(Skill).filter(
            Skill.unit_id == unit.id,
            Skill.order_index == order_index,
        ).first()

        if not exists:
            db.add(Skill(
                unit_id=unit.id,
                name=name,
                description=description,
                order_index=order_index,
            ))

    db.flush()

    # 5. One lesson per skill
    lesson_data = [
        ("Greetings", "Basic Greetings"),
        ("Introductions", "Introducing Yourself"),
        ("Common Words", "Everyday Words"),
        ("Food", "Food and Drinks"),
        ("Family", "Family Members"),
    ]

    for skill_name, lesson_title in lesson_data:
        skill = db.query(Skill).filter(
            Skill.name == skill_name
        ).one()

        exists = db.query(Lesson).filter(
            Lesson.skill_id == skill.id,
            Lesson.order_index == 1,
        ).first()

        if not exists:
            db.add(Lesson(
                skill_id=skill.id,
                title=lesson_title,
                order_index=1,
            ))
            print(f"Added lesson: {lesson_title}")
        else:
            print(f"Lesson already exists: {lesson_title}")

    db.flush()

    
    # 6. Multiple-choice exercises (10 total)
    multiple_choice_data = [
        {
            "skill": "Greetings",
            "question": "What does 'Hola' mean?",
            "options": ["Hello", "Goodbye", "Please", "Thank you"],
            "answer": "Hello",
            "order_index": 1,
        },
        {
            "skill": "Greetings",
            "question": "How do you say 'Goodbye' in Spanish?",
            "options": ["Hola", "Adiós", "Gracias", "Sí"],
            "answer": "Adiós",
            "order_index": 2,
        },
        {
            "skill": "Introductions",
            "question": "What does 'Me llamo Ana' mean?",
            "options": [
                "My name is Ana",
                "I am hungry",
                "Good morning",
                "Where is Ana?",
            ],
            "answer": "My name is Ana",
            "order_index": 1,
        },
        {
            "skill": "Introductions",
            "question": "How do you ask 'What is your name?'",
            "options": [
                "¿Cómo te llamas?",
                "¿Cuántos años tienes?",
                "¿Dónde está?",
                "¿Cómo estás?",
            ],
            "answer": "¿Cómo te llamas?",
            "order_index": 2,
        },
        {
            "skill": "Common Words",
            "question": "What does 'Gracias' mean?",
            "options": ["Please", "Thank you", "Sorry", "Goodbye"],
            "answer": "Thank you",
            "order_index": 1,
        },
        {
            "skill": "Common Words",
            "question": "What does 'Por favor' mean?",
            "options": ["Good night", "Excuse me", "Please", "Welcome"],
            "answer": "Please",
            "order_index": 2,
        },
        {
            "skill": "Food",
            "question": "What does 'Agua' mean?",
            "options": ["Bread", "Water", "Milk", "Apple"],
            "answer": "Water",
            "order_index": 1,
        },
        {
            "skill": "Food",
            "question": "What does 'Pan' mean?",
            "options": ["Bread", "Fish", "Rice", "Cheese"],
            "answer": "Bread",
            "order_index": 2,
        },
        {
            "skill": "Family",
            "question": "What does 'Madre' mean?",
            "options": ["Father", "Sister", "Mother", "Brother"],
            "answer": "Mother",
            "order_index": 1,
        },
        {
            "skill": "Family",
            "question": "What does 'Hermano' mean?",
            "options": ["Brother", "Mother", "Grandmother", "Father"],
            "answer": "Brother",
            "order_index": 2,
        },
    ]

    for item in multiple_choice_data:
        skill = db.query(Skill).filter(
            Skill.name == item["skill"]
        ).one()

        lesson = db.query(Lesson).filter(
            Lesson.skill_id == skill.id
        ).one()

        exists = db.query(Exercise).filter(
            Exercise.lesson_id == lesson.id,
            Exercise.type == "multiple_choice",
            Exercise.order_index == item["order_index"],
        ).first()

        if exists is None:
            db.add(
                Exercise(
                    lesson_id=lesson.id,
                    type="multiple_choice",
                    question=item["question"],
                    answer=item["answer"],
                    options=json.dumps(
                        item["options"],
                        ensure_ascii=False,
                    ),
                    data=None,
                    order_index=item["order_index"],
                )
            )

    
    # 7. Translation exercises (10 total)
    translate_data = [
        {
            "skill": "Greetings",
            "question": "Translate to English: Buenos días",
            "answer": "Good morning",
            "order_index": 3,
        },
        {
            "skill": "Greetings",
            "question": "Translate to Spanish: Good evening",
            "answer": "Buenas tardes",
            "order_index": 4,
        },
        {
            "skill": "Introductions",
            "question": "Translate to English: ¿Cómo te llamas?",
            "answer": "What is your name?",
            "order_index": 3,
        },
        {
            "skill": "Introductions",
            "question": "Translate to Spanish: My name is Carlos",
            "answer": "Me llamo Carlos",
            "order_index": 4,
        },
        {
            "skill": "Common Words",
            "question": "Translate to English: Por favor",
            "answer": "Please",
            "order_index": 3,
        },
        {
            "skill": "Common Words",
            "question": "Translate to Spanish: Thank you",
            "answer": "Gracias",
            "order_index": 4,
        },
        {
            "skill": "Food",
            "question": "Translate to English: Me gusta el pan",
            "answer": "I like bread",
            "order_index": 3,
        },
        {
            "skill": "Food",
            "question": "Translate to Spanish: Water",
            "answer": "Agua",
            "order_index": 4,
        },
        {
            "skill": "Family",
            "question": "Translate to English: Mi madre",
            "answer": "My mother",
            "order_index": 3,
        },
        {
            "skill": "Family",
            "question": "Translate to Spanish: My brother",
            "answer": "Mi hermano",
            "order_index": 4,
        },
    ]

    for item in translate_data:
        skill = db.query(Skill).filter(
            Skill.name == item["skill"]
        ).one()

        lesson = db.query(Lesson).filter(
            Lesson.skill_id == skill.id
        ).one()

        exists = db.query(Exercise).filter(
            Exercise.lesson_id == lesson.id,
            Exercise.type == "translate",
            Exercise.order_index == item["order_index"],
        ).first()

        if exists is None:
            db.add(
                Exercise(
                    lesson_id=lesson.id,
                    type="translate",
                    question=item["question"],
                    answer=item["answer"],
                    options=None,
                    data=None,
                    order_index=item["order_index"],
                )
            )


    # Seed fill-in-the-blank exercises.
    fill_blank_data = [
        {
            "skill": "Greetings",
            "question": "Complete the greeting: Hola, ¿_____ estás?",
            "answer": "cómo",
            "data": {"hint": "It means 'how'."},
        },
        {
            "skill": "Introductions",
            "question": "Complete the introduction: Me _____ Ana.",
            "answer": "llamo",
            "data": {"hint": "Together, 'me llamo' means 'my name is'."},
        },
        {
            "skill": "Common Words",
            "question": "Complete the polite phrase: Por _____.",
            "answer": "favor",
            "data": {"hint": "The complete phrase means 'please'."},
        },
        {
            "skill": "Food",
            "question": "Complete the sentence: Me gusta el _____.",
            "answer": "pan",
            "data": {"hint": "It is a common food made from flour."},
        },
        {
            "skill": "Family",
            "question": "Complete the sentence: Mi _____ es amable.",
            "answer": "madre",
            "data": {"hint": "This means 'mother'."},
        },
    ]

    for item in fill_blank_data:
        skill = db.query(Skill).filter(
            Skill.name == item["skill"]
        ).one()

        lesson = db.query(Lesson).filter(
            Lesson.skill_id == skill.id,
            Lesson.order_index == 1,
        ).one()

        existing = db.query(Exercise).filter(
            Exercise.lesson_id == lesson.id,
            Exercise.type == "fill_blank",
            Exercise.order_index == 5,
        ).first()

        if existing is None:
            exercise = Exercise(
                lesson_id=lesson.id,
                type="fill_blank",
                question=item["question"],
                answer=item["answer"],
                options=None,
                data=json.dumps(item["data"], ensure_ascii=False),
                order_index=5,
            )
            db.add(exercise)


    # Seed typed-answer exercises.
    type_answer_data = [
        {
            "skill": "Greetings",
            "order_index": 6,
            "question": "Type the Spanish word for 'Hello'.",
            "answer": "Hola",
        },
        {
            "skill": "Greetings",
            "order_index": 7,
            "question": "Type the English meaning of 'Gracias'.",
            "answer": "Thank you",
        },
        {
            "skill": "Introductions",
            "order_index": 6,
            "question": "Type the Spanish phrase for 'My name is Carlos'.",
            "answer": "Me llamo Carlos",
        },
        {
            "skill": "Introductions",
            "order_index": 7,
            "question": "Type the English meaning of '¿Cómo te llamas?'.",
            "answer": "What is your name?",
        },
        {
            "skill": "Common Words",
            "order_index": 6,
            "question": "Type the Spanish word for 'Please'.",
            "answer": "Por favor",
        },
        {
            "skill": "Common Words",
            "order_index": 7,
            "question": "Type the English meaning of 'Agua'.",
            "answer": "Water",
        },
        {
            "skill": "Food",
            "order_index": 6,
            "question": "Type the Spanish word for 'Bread'.",
            "answer": "Pan",
        },
        {
            "skill": "Food",
            "order_index": 7,
            "question": "Type the English meaning of 'Me gusta el pan'.",
            "answer": "I like bread",
        },
        {
            "skill": "Family",
            "order_index": 6,
            "question": "Type the Spanish word for 'Mother'.",
            "answer": "Madre",
        },
        {
            "skill": "Family",
            "order_index": 7,
            "question": "Type the Spanish phrase for 'My brother'.",
            "answer": "Mi hermano",
        },
    ]

    for item in type_answer_data:
        skill = db.query(Skill).filter(
            Skill.name == item["skill"]
        ).one()

        lesson = db.query(Lesson).filter(
            Lesson.skill_id == skill.id,
            Lesson.order_index == 1,
        ).one()

        existing = db.query(Exercise).filter(
            Exercise.lesson_id == lesson.id,
            Exercise.type == "type_answer",
            Exercise.order_index == item["order_index"],
        ).first()

        if existing is None:
            exercise = Exercise(
                lesson_id=lesson.id,
                type="type_answer",
                question=item["question"],
                answer=item["answer"],
                options=None,
                data=None,
                order_index=item["order_index"],
            )
            db.add(exercise)


    # Seed matching-pair exercises.
    match_pairs_data = [
        {
            "skill": "Greetings",
            "question": "Match each Spanish greeting with its English meaning.",
            "pairs": [
                {"left": "Hola", "right": "Hello"},
                {"left": "Adiós", "right": "Goodbye"},
                {"left": "Gracias", "right": "Thank you"},
                {"left": "Por favor", "right": "Please"},
            ],
        },
        {
            "skill": "Introductions",
            "question": "Match each Spanish phrase with its English meaning.",
            "pairs": [
                {"left": "Me llamo", "right": "My name is"},
                {"left": "¿Cómo te llamas?", "right": "What is your name?"},
                {"left": "Mucho gusto", "right": "Nice to meet you"},
                {"left": "Soy", "right": "I am"},
            ],
        },
        {
            "skill": "Common Words",
            "question": "Match each Spanish word with its English meaning.",
            "pairs": [
                {"left": "Agua", "right": "Water"},
                {"left": "Sí", "right": "Yes"},
                {"left": "No", "right": "No"},
                {"left": "Gracias", "right": "Thank you"},
            ],
        },
        {
            "skill": "Food",
            "question": "Match each Spanish food word with its English meaning.",
            "pairs": [
                {"left": "Pan", "right": "Bread"},
                {"left": "Leche", "right": "Milk"},
                {"left": "Manzana", "right": "Apple"},
                {"left": "Arroz", "right": "Rice"},
            ],
        },
        {
            "skill": "Family",
            "question": "Match each Spanish family word with its English meaning.",
            "pairs": [
                {"left": "Madre", "right": "Mother"},
                {"left": "Padre", "right": "Father"},
                {"left": "Hermano", "right": "Brother"},
                {"left": "Hermana", "right": "Sister"},
            ],
        },
    ]

    for item in match_pairs_data:
        skill = db.query(Skill).filter(
            Skill.name == item["skill"]
        ).one()

        lesson = db.query(Lesson).filter(
            Lesson.skill_id == skill.id,
            Lesson.order_index == 1,
        ).one()

        existing = db.query(Exercise).filter(
            Exercise.lesson_id == lesson.id,
            Exercise.type == "match_pairs",
            Exercise.order_index == 8,
        ).first()

        if existing is None:
            exercise = Exercise(
                lesson_id=lesson.id,
                type="match_pairs",
                question=item["question"],
                answer="",
                options=None,
                data=json.dumps(
                    {"pairs": item["pairs"]},
                    ensure_ascii=False,
                ),
                order_index=8,
            )
            db.add(exercise)


    # Seed initial progress for the demo user's skills.
    skill_progress_data = [
        {"skill": "Greetings", "progress": 100.0, "completed": True},
        {"skill": "Introductions", "progress": 60.0, "completed": False},
        {"skill": "Common Words", "progress": 0.0, "completed": False},
        {"skill": "Food", "progress": 0.0, "completed": False},
        {"skill": "Family", "progress": 0.0, "completed": False},
    ]

    for item in skill_progress_data:
        skill = db.query(Skill).filter(
            Skill.name == item["skill"]
        ).one()

        existing = db.query(UserSkillProgress).filter(
            UserSkillProgress.user_id == user.id,
            UserSkillProgress.skill_id == skill.id,
        ).first()

        if existing is None:
            progress_record = UserSkillProgress(
                user_id=user.id,
                skill_id=skill.id,
                progress=item["progress"],
                completed=item["completed"],
            )
            db.add(progress_record)
        else:
            existing.progress = item["progress"]
            existing.completed = item["completed"]


    # Seed initial progress for the demo user's lessons.
    lesson_progress_data = [
        {"skill": "Greetings", "completed": True, "score": 100.0},
        {"skill": "Introductions", "completed": False, "score": 0.0},
        {"skill": "Common Words", "completed": False, "score": 0.0},
        {"skill": "Food", "completed": False, "score": 0.0},
        {"skill": "Family", "completed": False, "score": 0.0},
    ]

    for item in lesson_progress_data:
        skill = db.query(Skill).filter(
            Skill.name == item["skill"]
        ).one()

        lesson = db.query(Lesson).filter(
            Lesson.skill_id == skill.id,
            Lesson.order_index == 1,
        ).one()

        existing = db.query(UserLessonProgress).filter(
            UserLessonProgress.user_id == user.id,
            UserLessonProgress.lesson_id == lesson.id,
        ).first()

        completed_at = datetime.now() if item["completed"] else None

        if existing is None:
            progress_record = UserLessonProgress(
                user_id=user.id,
                lesson_id=lesson.id,
                completed=item["completed"],
                score=item["score"],
                completed_at=completed_at,
            )
            db.add(progress_record)
        else:
            existing.completed = item["completed"]
            existing.score = item["score"]
            existing.completed_at = completed_at


    # Seed demo leaderboard users.
    leaderboard_data = [
        {"name": "Alex", "xp": 820},
        {"name": "Sarah", "xp": 650},
        {"name": "Keshav", "xp": 450},
        {"name": "Rahul", "xp": 390},
        {"name": "Emma", "xp": 320},
    ]

    for item in leaderboard_data:
        leaderboard_user = db.query(User).filter(
            User.name == item["name"]
        ).first()

        if leaderboard_user is None:
            leaderboard_user = User(
                name=item["name"],
                xp=item["xp"],
                streak=0,
                hearts=5,
                gems=0,
                daily_goal=30,
                last_active=datetime.now(),
            )
            db.add(leaderboard_user)
        else:
            leaderboard_user.xp = item["xp"]

    db.commit()
    print("Leaderboard seed completed.")

def main() -> None:
    """Run the seed process as one transaction."""
    db = SessionLocal()

    try:
        seed_database(db)
        db.commit()
        print("Seed process completed successfully.")

    except Exception:
        db.rollback()
        print("Seed process failed. Changes rolled back.")
        raise

    finally:
        db.close()


if __name__ == "__main__":
    main()
