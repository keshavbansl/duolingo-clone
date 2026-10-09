import type { HomeSkillData, HomeUnitData } from "@/lib/types";

export function findSkillById(
  units: HomeUnitData[],
  skillId: number,
): HomeSkillData | null {
  for (const unit of units) {
    const skill = unit.skills.find((item) => item.id === skillId);

    if (skill) {
      return skill;
    }
  }

  return null;
}

export function canSelectSkill(skill: HomeSkillData): boolean {
  return !skill.locked;
}

export function getSkillLockMessage(): string {
  return "Complete the previous skill to unlock this one.";
}

export function getLessonPath(lessonId: number): string {
  return `/lesson/${lessonId}`;
}