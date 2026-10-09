from datetime import datetime

from sqlalchemy import (
    Boolean,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import Date, Integer,Column

from .database import Base

class User(Base):
    
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)

    xp: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    streak: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    hearts: Mapped[int] = mapped_column(Integer, default=5, nullable=False)
    gems: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    daily_goal: Mapped[int] = mapped_column(
        Integer,
        default=30,
        nullable=False,
    )

    last_active: Mapped[datetime | None] = mapped_column(
        DateTime,
        nullable=True,
    )

    skill_progress: Mapped[list["UserSkillProgress"]] = relationship(
        back_populates="user",
        cascade="all, delete-orphan",
    )

    lesson_progress: Mapped[list["UserLessonProgress"]] = relationship(
        back_populates="user",
        cascade="all, delete-orphan",
    )

    daily_xp = Column(Integer, default=0, nullable=False)
    daily_xp_date = Column(Date, nullable=True)

class Course(Base):
    __tablename__ = "courses"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    language: Mapped[str] = mapped_column(String(50), nullable=False)

    units: Mapped[list["Unit"]] = relationship(
        back_populates="course",
        cascade="all, delete-orphan",
        order_by="Unit.order_index",
    )

class Unit(Base):
    __tablename__ = "units"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    course_id: Mapped[int] = mapped_column(
        ForeignKey("courses.id"),
        nullable=False,
    )

    title: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)

    order_index: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    course: Mapped["Course"] = relationship(
        back_populates="units",
    )

    skills: Mapped[list["Skill"]] = relationship(
        back_populates="unit",
        cascade="all, delete-orphan",
        order_by="Skill.order_index",
    )

class Skill(Base):
    __tablename__ = "skills"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    unit_id: Mapped[int] = mapped_column(
        ForeignKey("units.id"),
        nullable=False,
    )

    name: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)

    order_index: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    unit: Mapped["Unit"] = relationship(
        back_populates="skills",
    )

    lessons: Mapped[list["Lesson"]] = relationship(
        back_populates="skill",
        cascade="all, delete-orphan",
        order_by="Lesson.order_index",
    )

    user_progress: Mapped[list["UserSkillProgress"]] = relationship(
        back_populates="skill",
        cascade="all, delete-orphan",
    )

class Lesson(Base):
    __tablename__ = "lessons"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    skill_id: Mapped[int] = mapped_column(
        ForeignKey("skills.id"),
        nullable=False,
    )

    title: Mapped[str] = mapped_column(String(100), nullable=False)

    order_index: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    skill: Mapped["Skill"] = relationship(
        back_populates="lessons",
    )

    exercises: Mapped[list["Exercise"]] = relationship(
        back_populates="lesson",
        cascade="all, delete-orphan",
        order_by="Exercise.order_index",
    )

    user_progress: Mapped[list["UserLessonProgress"]] = relationship(
        back_populates="lesson",
        cascade="all, delete-orphan",
    )

class Exercise(Base):
    __tablename__ = "exercises"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    lesson_id: Mapped[int] = mapped_column(
        ForeignKey("lessons.id"),
        nullable=False,
    )

    type: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
    )

    question: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    answer: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    options: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    data: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    order_index: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    lesson: Mapped["Lesson"] = relationship(
        back_populates="exercises",
    )

class UserSkillProgress(Base):
    __tablename__ = "user_skill_progress"

    __table_args__ = (
        UniqueConstraint(
            "user_id",
            "skill_id",
            name="uq_user_skill_progress",
        ),
    )

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False,
    )

    skill_id: Mapped[int] = mapped_column(
        ForeignKey("skills.id"),
        nullable=False,
    )

    progress: Mapped[float] = mapped_column(
        Float,
        default=0.0,
        nullable=False,
    )

    completed: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )

    user: Mapped["User"] = relationship(
        back_populates="skill_progress",
    )

    skill: Mapped["Skill"] = relationship(
        back_populates="user_progress",
    )

class UserLessonProgress(Base):
    __tablename__ = "user_lesson_progress"

    __table_args__ = (
        UniqueConstraint(
            "user_id",
            "lesson_id",
            name="uq_user_lesson_progress",
        ),
    )

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False,
    )

    lesson_id: Mapped[int] = mapped_column(
        ForeignKey("lessons.id"),
        nullable=False,
    )

    completed: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )

    score: Mapped[float] = mapped_column(
        Float,
        default=0.0,
        nullable=False,
    )

    completed_at: Mapped[datetime | None] = mapped_column(
        DateTime,
        nullable=True,
    )

    user: Mapped["User"] = relationship(
        back_populates="lesson_progress",
    )

    lesson: Mapped["Lesson"] = relationship(
        back_populates="user_progress",
    )