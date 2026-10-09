import { BookOpen } from "lucide-react";
import type { HomeUnitData } from "@/lib/types";

type UnitHeaderProps = {
  unit: HomeUnitData;
};

export default function UnitHeader({ unit }: UnitHeaderProps) {
  return (
    <header className="overflow-hidden rounded-2xl border-2 border-green-dark bg-green text-white shadow-[0_4px_0_var(--green-dark)]">
      <div className="flex items-center gap-4 p-5 sm:p-6">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/20 sm:h-14 sm:w-14">
          <BookOpen size={28} strokeWidth={2.5} aria-hidden="true" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-xs font-black uppercase tracking-widest text-white/80">
            Unit {unit.order_index}
          </p>

          <h2 className="mt-1 text-xl font-black leading-tight sm:text-2xl">
            {unit.title}
          </h2>

          <p className="mt-1 text-sm font-semibold leading-relaxed text-white/90">
            {unit.description}
          </p>
        </div>
      </div>
    </header>
  );
}