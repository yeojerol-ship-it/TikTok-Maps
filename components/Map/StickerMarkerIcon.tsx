"use client";

import { useId } from "react";

interface StickerMarkerIconProps {
  src: string;
  size?: number;
}

export function StickerMarkerIcon({ src, size = 40 }: StickerMarkerIconProps) {
  const filterId = `marker-sticker-${useId().replace(/:/g, "")}`;
  const scale = size / 40;

  return (
    <>
      <svg width={0} height={0} aria-hidden className="absolute">
        <defs>
          <filter
            id={filterId}
            x="-35%"
            y="-35%"
            width="170%"
            height="170%"
            colorInterpolationFilters="sRGB"
          >
            <feMorphology
              in="SourceAlpha"
              operator="dilate"
              radius={2.8 * scale}
              result="outerSilhouette"
            />
            <feFlood floodColor="#000000" floodOpacity="0.06" result="edgeTint" />
            <feComposite
              in="edgeTint"
              in2="outerSilhouette"
              operator="in"
              result="outerEdge"
            />
            <feMorphology
              in="SourceAlpha"
              operator="dilate"
              radius={1.7 * scale}
              result="innerSilhouette"
            />
            <feFlood floodColor="#ffffff" result="stickerFill" />
            <feComposite
              in="stickerFill"
              in2="innerSilhouette"
              operator="in"
              result="stickerBorder"
            />
            <feMerge>
              <feMergeNode in="outerEdge" />
              <feMergeNode in="stickerBorder" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </svg>
      <img
        src={src}
        alt=""
        aria-hidden
        width={size}
        height={size}
        draggable={false}
        className="relative z-0 shrink-0 object-contain"
        style={{
          width: size,
          height: size,
          filter: `url(#${filterId}) drop-shadow(0 1px 2px rgba(0,0,0,0.08))`,
        }}
      />
    </>
  );
}
