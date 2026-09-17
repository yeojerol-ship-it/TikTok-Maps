"use client";

import { formatPlaceDistance } from "@/lib/selectors";

interface MapCompassProps {
  distance: string;
  bearing?: number;
}

/** Figma CompassDial pointer (node 2969:17001), rotated at 44×44 center (22, 22). */
const COMPASS_DIAL_PIVOT = { x: 7.18465, y: 14 };
const COMPASS_DIAL_SCALE = 1.18;
/** Nudge so the chevron sits visually centered in the inset circle. */
const COMPASS_DIAL_X_ADJUST = 0.5;
const COMPASS_DIAL_Y_ADJUST = 2;

function CompassDial({ bearing = 0 }: { bearing?: number }) {
  return (
    <div
      className="bump-surface-inset relative flex size-11 shrink-0 items-center justify-center rounded-full"
      aria-hidden
    >
      <svg width="44" height="44" viewBox="0 0 44 44" fill="none" overflow="visible">
        <defs>
          <filter
            id="compass-dial-shadow"
            x="-50%"
            y="-50%"
            width="200%"
            height="200%"
            filterUnits="objectBoundingBox"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feColorMatrix
              in="SourceAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              result="hardAlpha"
            />
            <feOffset />
            <feGaussianBlur stdDeviation="1" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.08 0"
            />
            <feBlend
              mode="normal"
              in2="BackgroundImageFix"
              result="effect1_dropShadow"
            />
            <feBlend
              mode="normal"
              in="SourceGraphic"
              in2="effect1_dropShadow"
              result="shape"
            />
          </filter>
        </defs>
        {Array.from({ length: 24 }, (_, i) => {
          const angle = (i * 360) / 24;
          const rad = (angle * Math.PI) / 180;
          const cx = 22 + Math.sin(rad) * 17;
          const cy = 22 - Math.cos(rad) * 17;
          const isMajor = i % 6 === 0;
          return (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={isMajor ? 1.6 : 1.1}
              fill={isMajor ? "#8E8E93" : "#C7C7CC"}
            />
          );
        })}
        <g transform={`rotate(${bearing} 22 22)`}>
          <g
            transform={`translate(22 22) scale(${COMPASS_DIAL_SCALE}) translate(${-COMPASS_DIAL_PIVOT.x + COMPASS_DIAL_X_ADJUST} ${-COMPASS_DIAL_PIVOT.y + COMPASS_DIAL_Y_ADJUST})`}
            filter="url(#compass-dial-shadow)"
          >
            <path
              d="M4.8379 6.39627C5.63967 4.21116 8.73012 4.21116 9.53189 6.39627L11.9753 13.0555C12.7826 15.2555 10.3912 17.2573 8.36755 16.0755L7.43705 15.532C7.28126 15.4411 7.08853 15.4411 6.93274 15.532L6.00223 16.0755C3.9786 17.2573 1.58723 15.2555 2.39448 13.0555L4.8379 6.39627Z"
              fill="#007AFF"
            />
            <path
              d="M5.30687 6.56822C5.94833 4.8203 8.42123 4.82034 9.06273 6.56822L11.5061 13.2274C12.1519 14.9874 10.2383 16.5889 8.61937 15.6434L7.68968 15.1004C7.37815 14.9185 6.99245 14.9186 6.68089 15.1004L5.75023 15.6434C4.13132 16.5889 2.21772 14.9874 2.86351 13.2274L5.30687 6.56822Z"
              stroke="white"
              fill="none"
            />
          </g>
        </g>
      </svg>
    </div>
  );
}

export function MapCompass({ distance, bearing = 32 }: MapCompassProps) {
  const formatted = formatPlaceDistance(distance);
  const [displayValue, displayUnit = ""] = formatted.split(" ");

  return (
    <div
      className="bump-surface-raised pointer-events-auto flex items-center gap-2 rounded-full pl-4 pr-1.5 py-1.5"
      aria-label={`${distance} from you`}
    >
      <div className="min-w-0">
        <p className="text-[15px] font-bold leading-none text-foreground">
          {displayValue}
          {displayUnit ? ` ${displayUnit}` : ""}
        </p>
        <p className="mt-0.5 text-[11px] leading-none text-[var(--tux-text-2)]">
          from you
        </p>
      </div>
      <CompassDial bearing={bearing} />
    </div>
  );
}
