"use client";

import { useId } from "react";

interface StickerMarkerIconProps {
  src: string;
  size?: number;
}

/**
 * Renders the marker PNG inside SVG so the sticker filter and image share one
 * document (HTML <img> + url(#filter) is unreliable in embedded previews).
 */
export function StickerMarkerIcon({ src, size = 40 }: StickerMarkerIconProps) {
  const filterId = `marker-sticker-${useId().replace(/:/g, "")}`;
  const viewSize = 40;
  const scale = size / viewSize;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${viewSize} ${viewSize}`}
      aria-hidden
      className="relative z-0 shrink-0 overflow-visible"
      style={{
        width: size,
        height: size,
        filter: "drop-shadow(0 1px 2px rgba(0, 0, 0, 0.08))",
      }}
    >
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
      <image
        href={src}
        x={0}
        y={0}
        width={viewSize}
        height={viewSize}
        preserveAspectRatio="xMidYMid meet"
        filter={`url(#${filterId})`}
      />
    </svg>
  );
}
