"use client";

import Image from "next/image";

/** Tap target for the "Map" quick-action pill (Figma node 2440:15930, 390×844 frame) */
export const LANDING_MAP_HOTSPOT = {
  left: 261,
  top: 143,
  width: 121,
  height: 32,
} as const;

interface LandingScreenProps {
  onOpenMap: () => void;
}

export function LandingScreen({ onOpenMap }: LandingScreenProps) {
  const { left, top, width, height } = LANDING_MAP_HOTSPOT;

  return (
    <div className="relative h-full w-full overflow-hidden bg-white">
      <Image
        src="/screens/landing.png"
        alt="Discover nearby places"
        fill
        priority
        className="object-cover object-top"
        sizes="390px"
      />
      <button
        type="button"
        aria-label="Open map"
        onClick={onOpenMap}
        className="absolute cursor-pointer border-0 bg-transparent p-0"
        style={{ left, top, width, height }}
      />
    </div>
  );
}
