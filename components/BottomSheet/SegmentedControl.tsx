"use client";

import { SheetTab } from "@/lib/types";

interface SegmentedControlProps {
  active: SheetTab;
  onChange: (tab: SheetTab) => void;
}

const tabs: { id: SheetTab; label: string }[] = [
  { id: "activities", label: "Activities" },
  { id: "ranking", label: "Ranking" },
];

export function SegmentedControl({ active, onChange }: SegmentedControlProps) {
  const ranking = active === "ranking";

  return (
    <div className="bump-segment-track relative grid grid-cols-2 gap-1 rounded-full p-1.5">
      <div
        aria-hidden
        className="bump-segment-thumb pointer-events-none absolute inset-y-1.5 left-1.5 z-0 w-[calc(50%-10px)] rounded-full"
        style={{
          transform: ranking ? "translateX(calc(100% + 4px))" : "translateX(0)",
        }}
      />
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onPointerDown={(e) => {
            e.stopPropagation();
            onChange(tab.id);
          }}
          onClick={(e) => {
            e.stopPropagation();
            onChange(tab.id);
          }}
          className={`tux-h4-semi relative z-10 cursor-pointer rounded-full border-none bg-transparent py-2.5 outline-none transition-colors duration-200 ${
            active === tab.id ? "text-foreground" : "text-muted"
          }`}
          style={{ touchAction: "manipulation" }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
