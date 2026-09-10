"use client";

import { formatPlaceDistance } from "@/lib/selectors";

interface MapCompassProps {
  distance: string;
  bearing?: number;
}

function CompassDial({ bearing = 0 }: { bearing?: number }) {
  return (
    <div
      className="bump-surface-inset relative flex size-11 shrink-0 items-center justify-center rounded-full"
      aria-hidden
    >
      <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
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
          <path
            d="M22 10 L25 24 L22 21 L19 24 Z"
            fill="var(--bump-blue)"
          />
          <circle cx="22" cy="22" r="2.5" fill="var(--bump-blue)" />
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
