import type { HomeUnitData } from "@/lib/types";
import UnitHeader from "./UnitHeader";
import SkillNode from "./SkillNode";

type LearningPathProps = {
  units: HomeUnitData[];
  onSelectSkill?: (skillId: number) => void;
  selectedSkillId?: number | null;
};

const pathPositions = [
  "translate-x-0",
  "translate-x-5 sm:translate-x-10",
  "translate-x-8 sm:translate-x-14",
  "translate-x-5 sm:translate-x-10",
  "translate-x-0",
  "-translate-x-5 sm:-translate-x-10",
  "-translate-x-8 sm:-translate-x-14",
  "-translate-x-5 sm:-translate-x-10",
];

export default function LearningPath({
  units,
  onSelectSkill,
  selectedSkillId,
}: LearningPathProps) {
  return (
    <div className="mx-auto w-full max-w-2xl space-y-8 sm:space-y-10">
      {units.map((unit) => (
        <section key={unit.id} className="space-y-4 sm:space-y-6">
          <UnitHeader unit={unit} />

          <div className="relative mx-auto flex w-full max-w-md flex-col items-center py-3 sm:py-5">
            {unit.skills.map((skill, index) => (
              <div
                key={skill.id}
                className={`relative flex w-full justify-center ${pathPositions[index % pathPositions.length]}`}
              >
                {index > 0 && (
                  <div
                    aria-hidden="true"
                    className="absolute bottom-[calc(100%-8px)] left-1/2 h-8 -translate-x-1/2 -translate-y-1/2 border-l-4 border-dashed border-gray-300 sm:h-10"
                  />
                )}

                <SkillNode
                  skill={skill}
                  isSelected={selectedSkillId === skill.id}
                  onSelect={() => onSelectSkill?.(skill.id)}
                />
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}