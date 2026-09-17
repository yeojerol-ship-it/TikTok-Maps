"use client";

import { SheetTab } from "@/lib/types";

interface SheetTabsProps {
  active: SheetTab;
  onChange: (tab: SheetTab) => void;
}

/**
 * Two overlapping sheets: the active tab is a notch raised off the front
 * sheet, the inactive tab is the back sheet peeking out beside it. Geometry
 * comes from the Figma `Vector 11248` path (node 2969:18761) in a 390-wide
 * frame; the shape is mirrored when Ranking is active.
 */
const NOTCH_FILL_PATH =
  "M209.022 48.0523L186.978 14.4477C181.063 5.43113 171.005 0 160.221 0H32C14.3269 0 0 14.3269 0 32V62.5H235.779C224.995 62.5 214.937 57.0689 209.022 48.0523Z";
/** Open contour along the visible sheet edge — stroked, never filled. */
const SHEET_EDGE_PATH =
  "M390 88V86.5C390 73.2452 379.255 62.5 366 62.5H235.779C224.995 62.5 214.937 57.0689 209.022 48.0523L186.978 14.4477C181.063 5.43113 171.005 0 160.221 0H32C14.3269 0 0 14.3269 0 32V88";

/** Height of the notch strip the labels sit in. */
export const SHEET_TABS_HEIGHT = 62.5;
/** Body corner radius where the sheet top meets the notch. */
export const SHEET_TABS_BODY_RADIUS = 24;
/** Viewbox height — includes the body corner arc below the notch. */
const SVG_HEIGHT = 88;
/** Back sheet sits 9px below the front notch. */
const BACK_SHEET_TOP = 9;
/** Label centre inside the notch. */
const LABEL_CENTER_Y = 36;

const tabs: { id: SheetTab; label: string; centerX: number }[] = [
  { id: "activities", label: "Activities", centerX: 95.5 },
  { id: "ranking", label: "Ranking", centerX: 294.5 },
];

export function SheetTabs({ active, onChange }: SheetTabsProps) {
  const mirrored = active === "ranking";

  return (
    <div className="relative w-full" style={{ height: SHEET_TABS_HEIGHT }}>
      <div
        aria-hidden
        className="sheet-tabs__back pointer-events-none absolute inset-x-0"
        style={{ top: BACK_SHEET_TOP, height: SVG_HEIGHT * 2 }}
      />

      <svg
        aria-hidden
        className="sheet-tabs__front pointer-events-none absolute inset-x-0 top-0"
        style={{ height: SVG_HEIGHT }}
        viewBox={`0 0 390 ${SVG_HEIGHT}`}
        preserveAspectRatio="none"
      >
        <g transform={mirrored ? "translate(390, 0) scale(-1, 1)" : undefined}>
          <path d={NOTCH_FILL_PATH} fill="var(--panel-bg-top)" />
          <path
            d={SHEET_EDGE_PATH}
            fill="none"
            stroke="rgba(255, 255, 255, 0.6)"
            strokeWidth="2"
          />
        </g>
      </svg>

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
          aria-pressed={active === tab.id}
          className={`absolute top-0 flex -translate-x-1/2 cursor-pointer items-center whitespace-nowrap border-none bg-transparent text-[17px] font-extrabold leading-[1.3] outline-none transition-colors duration-200 ${
            active === tab.id ? "text-foreground" : "text-[rgba(0,0,0,0.34)]"
          }`}
          style={{
            left: `${(tab.centerX / 390) * 100}%`,
            height: LABEL_CENTER_Y * 2,
            touchAction: "manipulation",
          }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
