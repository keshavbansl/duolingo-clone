export type ExerciseType =
  | "multiple_choice"
  | "translate"
  | "match_pairs"
  | "fill_blank"
  | "type_answer";
export type SkillStatus = "locked" | "available" | "completed";
export interface User {
  id: number;
  name: string;
  xp: number;
  streak: number;
  hearts: number;
  gems: number;
  dailyGoal: number;
}
export interface Course {
  id: number;
  name: string;
  language: string;
}
export interface Unit {
  id: number;
  courseId: number;
  title: string;
  description: string;
  orderIndex: number;
}
export interface Skill {
  id: number;
  unitId: number;
  name: string;
  description: string;
  orderIndex: number;
  progress: number;
  completed: boolean;
  status: SkillStatus;
}
export interface Exercise {
  id: number;
  lessonId: number;
  type: ExerciseType;
  question: string;
  answer: string;
  options?: string[];
  data?: Record<string, unknown>;
  orderIndex: number;
}
export interface Lesson {
  id: number;
  skillId: number;
  title: string;
  orderIndex: number;
}
export interface HomeLessonData {
  id: number;
  title: string;
  order_index: number;
  completed: boolean;
  score: number;
  completed_at: string | null;
}
export interface HomeSkillData {
  id: number;
  name: string;
  description: string;
  order_index: number;
  progress: number;
  completed: boolean;
  status: "locked" | "available" | "in_progress" | "completed";
  locked: boolean;
  lessons: HomeLessonData[];
}
export interface HomeUnitData {
  id: number;
  title: string;
  description: string;
  order_index: number;
  skills: HomeSkillData[];
}
export interface HomeResponse {
  user: {
    id: number;
    name: string;
    xp: number;
    streak: number;
    hearts: number;
    gems: number;
    daily_goal: number;
    daily_xp: number;
    daily_goal_progress: number;
  };
  course: {
    id: number;
    name: string;
    language: string;
    units: HomeUnitData[];
  };
}