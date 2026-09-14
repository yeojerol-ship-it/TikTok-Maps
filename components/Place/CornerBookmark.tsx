"use client";

import { useId } from "react";

/** Panel corner radius (28px), in viewBox units at the rendered 76px scale. */
const PANEL_CORNER_R = 23.6;

const FOLD_CONTROL = "31.5 33";

function buildBackPath() {
  return (
    `M -12 0 ` +
    `H ${64 - PANEL_CORNER_R} ` +
    `A ${PANEL_CORNER_R} ${PANEL_CORNER_R} 0 0 1 64 ${PANEL_CORNER_R} ` +
    `V 74 ` +
    `Q ${FOLD_CONTROL} -12 0 ` +
    `Z`
  );
}

function buildCurlPath() {
  return (
    `M -12 0 ` +
    `Q ${FOLD_CONTROL} 64 74 ` +
    `Q 33 56.5 6.5 57.5 ` +
    `Q 3.5 56 2.5 52.5 ` +
    `Q 6.5 30.5 -12 0 ` +
    `Z`
  );
}

function buildCurlEdge() {
  return (
    `M 64 74 Q 33 56.5 6.5 57.5 Q 3.5 56 2.5 52.5 Q 6.5 30.5 -12 0`
  );
}

interface CornerBookmarkProps {
  saved: boolean;
  onToggle: () => void;
}

function BookmarkGlyph({
  filled,
  glowId,
  fillId,
}: {
  filled: boolean;
  glowId: string;
  fillId: string;
}) {
  const path =
    "M4.4 2.4h9.2c.66 0 1.2.54 1.2 1.2v12c0 .5-.54.8-.95.54L9 13.2 5.15 16.14c-.41.26-.95-.04-.95-.54v-12c0-.66.54-1.2 1.2-1.2Z";

  if (!filled) {
    return (
      <svg width="22" height="22" viewBox="0 0 18 18" aria-hidden>
        <path
          d={path}
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg width="22" height="22" viewBox="0 0 18 18" aria-hidden>
      <defs>
        <linearGradient
          id={fillId}
          x1="5"
          y1="2"
          x2="13"
          y2="16"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
          <stop offset="55%" stopColor="#ffffff" stopOpacity="0.88" />
          <stop offset="100%" stopColor="#ffd6e2" stopOpacity="0.62" />
        </linearGradient>
        <filter
          id={glowId}
          x="-80%"
          y="-80%"
          width="260%"
          height="260%"
        >
          <feGaussianBlur stdDeviation="1.35" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <path
        d={path}
        fill="#ffffff"
        opacity="0.55"
        filter={`url(#${glowId})`}
      />
      <path
        d={path}
        fill={`url(#${fillId})`}
        stroke="#ffffff"
        strokeWidth="1.1"
        strokeLinejoin="round"
        strokeOpacity="0.75"
      />
    </svg>
  );
}

/**
 * Two-sheet corner peel inside a 60×60 region.
 * Back sheet holds the bookmark and lights pink when saved;
 * the front sheet's corner peels off as a white curl over the diagonal.
 */
export function CornerBookmark({ saved, onToggle }: CornerBookmarkProps) {
  const uid = useId().replace(/:/g, "");
  const ids = {
    back: `peel-back-${uid}`,
    pink: `peel-pink-${uid}`,
    pinkGlow: `peel-pink-glow-${uid}`,
    curl: `peel-curl-${uid}`,
    curlShade: `peel-curl-shade-${uid}`,
    curlReflect: `peel-curl-reflect-${uid}`,
    shadow: `peel-shadow-${uid}`,
    glyphFill: `peel-glyph-fill-${uid}`,
    glyphGlow: `peel-glyph-glow-${uid}`,
  };

  const backPath = buildBackPath();
  const curlPath = buildCurlPath();
  const curlEdge = buildCurlEdge();

  return (
    <button
      type="button"
      className={`poi-corner-peel ${saved ? "poi-corner-peel--saved" : ""}`}
      aria-label={saved ? "Unsave place" : "Save place"}
      aria-pressed={saved}
      onClick={(event) => {
        event.stopPropagation();
        onToggle();
      }}
    >
      <svg
        className="poi-corner-peel__svg"
        viewBox="0 0 64 64"
        width="76"
        height="76"
        aria-hidden
      >
        <defs>
          <linearGradient
            id={ids.back}
            x1="64"
            y1="0"
            x2="10"
            y2="54"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#f3f4f6" />
            <stop offset="100%" stopColor="#e4e6ea" />
          </linearGradient>

          <linearGradient
            id={ids.pink}
            x1="64"
            y1="0"
            x2="8"
            y2="56"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#ff7d9e" />
            <stop offset="30%" stopColor="#ff4470" />
            <stop offset="68%" stopColor="#fe2c55" />
            <stop offset="100%" stopColor="#e0154a" />
          </linearGradient>

          <radialGradient
            id={ids.pinkGlow}
            cx="58"
            cy="6"
            r="34"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.55" />
            <stop offset="38%" stopColor="#ffc2d3" stopOpacity="0.26" />
            <stop offset="100%" stopColor="#fe2c55" stopOpacity="0" />
          </radialGradient>

          <linearGradient
            id={ids.curl}
            x1="51"
            y1="11"
            x2="2"
            y2="60"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="58%" stopColor="#fcfcfd" />
            <stop offset="100%" stopColor="#e9ebef" />
          </linearGradient>

          <linearGradient
            id={ids.curlShade}
            x1="53"
            y1="9"
            x2="21"
            y2="41"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#c9ced8" stopOpacity="0.4" />
            <stop offset="40%" stopColor="#c9ced8" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>

          <linearGradient
            id={ids.curlReflect}
            x1="48"
            y1="14"
            x2="12"
            y2="50"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#ff6b90" stopOpacity="0.34" />
            <stop offset="42%" stopColor="#fe2c55" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#fe2c55" stopOpacity="0" />
          </linearGradient>

          <filter
            id={ids.shadow}
            x="-60%"
            y="-60%"
            width="220%"
            height="220%"
          >
            <feOffset dx="-1.5" dy="4" />
            <feGaussianBlur stdDeviation="3.8" />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0.078
                      0 0 0 0 0.098
                      0 0 0 0 0.137
                      0 0 0 0.32 0"
            />
          </filter>
        </defs>

        <path
          className="poi-corner-peel__back"
          d={backPath}
          fill={saved ? `url(#${ids.pink})` : `url(#${ids.back})`}
        />
        {saved ? <path d={backPath} fill={`url(#${ids.pinkGlow})`} /> : null}

        <g className="poi-corner-peel__flap">
          <path
            className="poi-corner-peel__shadow"
            d={curlPath}
            fill="#141923"
            filter={`url(#${ids.shadow})`}
            opacity={saved ? 1 : 0.88}
          />
          <path
            className="poi-corner-peel__curl"
            d={curlPath}
            fill={`url(#${ids.curl})`}
          />
          <path d={curlPath} fill={`url(#${ids.curlShade})`} />
          {saved ? (
            <path d={curlPath} fill={`url(#${ids.curlReflect})`} />
          ) : null}
          <path
            d={curlEdge}
            fill="none"
            stroke="rgba(186,193,205,0.18)"
            strokeWidth="0.5"
            strokeLinecap="round"
          />
        </g>
      </svg>

      <span className="poi-corner-peel__glyph" aria-hidden>
        <span className="poi-corner-peel__glyph-pop">
          <BookmarkGlyph
            filled={saved}
            glowId={ids.glyphGlow}
            fillId={ids.glyphFill}
          />
        </span>
      </span>
    </button>
  );
}
