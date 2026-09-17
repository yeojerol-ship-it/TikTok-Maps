"use client";

import { getMarkerPastel } from "@/data/markerIcons";

interface StickerMarkerIconProps {
  src: string;
  /** Outer circle diameter (resting). Defaults to 44. */
  size?: number;
  /** Expanded / selected: Figma inverted-teardrop map pin. */
  expanded?: boolean;
}

const OUTER = 44;
const INNER = 40;
const EMOJI = 28;

/** Figma pin Union (node 407:179230) — viewBox 0 0 76 86 */
const PIN_VB_W = 76;
const PIN_VB_H = 86;
const PIN_PASTEL = 68;
const PIN_PASTEL_INSET = 4;
const PIN_EMOJI = 52;
/** Exact path from Figma Union export */
const PIN_UNION_PATH =
  "M38 0C58.9868 0 76 17.0132 76 38C76 52.1157 68.3031 64.4323 56.8775 70.9844C49.751 75.0711 42.2757 79.2041 37.6602 86C32.9684 79.0929 25.4149 74.8281 18.2809 70.4891C7.32042 63.8227 0 51.7664 0 38C0 17.0132 17.0132 0 38 0Z";

/**
 * POI marker badge: 44px outer + 40px pastel inner + emoji.
 * Expanded state uses the Been Here Figma pin silhouette (white teardrop + pastel disc).
 * Pastels are locked to Figma Key screens values (no canvas sampling).
 */
export function StickerMarkerIcon({
  src,
  size = OUTER,
  expanded = false,
}: StickerMarkerIconProps) {
  const scale = size / OUTER;
  const outer = Math.round(OUTER * scale);
  const inner = Math.round(INNER * scale);
  const emoji = Math.round(EMOJI * scale);
  const pastel = getMarkerPastel(src);

  if (expanded) {
    const pinW = size;
    const pinH = Math.round(size * (PIN_VB_H / PIN_VB_W));
    const pastelSize = (PIN_PASTEL / PIN_VB_W) * size;
    const pastelInset = (PIN_PASTEL_INSET / PIN_VB_W) * size;
    const emojiSize = (PIN_EMOJI / PIN_VB_W) * size;
    const emojiX = pastelInset + (pastelSize - emojiSize) / 2;
    const emojiY = pastelInset + (pastelSize - emojiSize) / 2;

    return (
      <div
        aria-hidden
        className="relative z-0 shrink-0"
        style={{
          width: pinW,
          height: pinH,
          filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.14))",
        }}
      >
        <svg
          width={pinW}
          height={pinH}
          viewBox={`0 0 ${PIN_VB_W} ${PIN_VB_H}`}
          className="absolute inset-0 block"
          aria-hidden
        >
          <path d={PIN_UNION_PATH} fill="#ffffff" />
        </svg>
        <div
          className="absolute rounded-full"
          style={{
            width: pastelSize,
            height: pastelSize,
            left: pastelInset,
            top: pastelInset,
            backgroundColor: pastel,
          }}
        />
        <img
          src={src}
          alt=""
          draggable={false}
          className="absolute object-contain"
          style={{
            width: emojiSize,
            height: emojiSize,
            left: emojiX,
            top: emojiY,
          }}
        />
      </div>
    );
  }

  return (
    <div
      aria-hidden
      className="relative z-0 flex shrink-0 items-center justify-center rounded-full bg-white"
      style={{
        width: outer,
        height: outer,
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
      }}
    >
      <div
        className="flex items-center justify-center rounded-full"
        style={{
          width: inner,
          height: inner,
          backgroundColor: pastel,
        }}
      >
        <img
          src={src}
          alt=""
          draggable={false}
          width={emoji}
          height={emoji}
          className="object-contain"
          style={{ width: emoji, height: emoji }}
        />
      </div>
    </div>
  );
}
