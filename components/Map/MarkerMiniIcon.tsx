"use client";

import { useMarkerPastel } from "@/lib/markerPastel";

interface MarkerMiniIconProps {
  /** Emoji sticker for the place category. */
  icon: string;
}

/** Collapsed marker for secondary POIs (Figma node 2969:18709). */
const DISC = 28;
const EMOJI = 19;
const EMOJI_TILT = "5.28deg";

export function MarkerMiniIcon({ icon }: MarkerMiniIconProps) {
  // Figma gives each mini disc its emoji's own tint (2969:14491/93/95).
  const pastel = useMarkerPastel(icon);

  return (
    <div
      aria-hidden
      className="flex shrink-0 items-center justify-center rounded-full"
      style={{
        width: DISC,
        height: DISC,
        backgroundColor: pastel,
        boxShadow: "0 0 12px rgba(0, 0, 0, 0.08)",
      }}
    >
      <img
        src={icon}
        alt=""
        draggable={false}
        width={EMOJI}
        height={EMOJI}
        className="max-w-none object-contain"
        style={{
          width: EMOJI,
          height: EMOJI,
          transform: `rotate(${EMOJI_TILT})`,
        }}
      />
    </div>
  );
}
