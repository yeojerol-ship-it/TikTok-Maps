"use client";

import { useEffect, useState } from "react";
import { getMarkerPastel } from "@/data/markerIcons";

/**
 * Figma tints every marker disc with its emoji's own hue pushed to full
 * saturation and ~94.5% lightness — sushi #ffebe3 is hsl(17, 100%, 94.5%),
 * arcade #f3e3ff is hsl(274, 100%, 94.9%). Rather than hand-picking a colour
 * per icon we sample the hue out of the artwork and re-apply that rule, so a
 * new emoji PNG gets a matching pastel without a data entry.
 */
const PASTEL_SATURATION = 1;
const PASTEL_LIGHTNESS = 0.945;

/**
 * Sampling window fitted against the six pastels Figma locked in node
 * 2969:14433. Plates, highlights and outlines carry no useful hue, so only
 * mid-tone saturated pixels vote, each weighted by its chroma.
 */
const MIN_PIXEL_ALPHA = 160;
const MIN_PIXEL_SATURATION = 0.55;
const MIN_PIXEL_LIGHTNESS = 0.3;
const MAX_PIXEL_LIGHTNESS = 0.92;

const pastelCache = new Map<string, string>();
const pending = new Map<string, Promise<string | null>>();

function hslToHex(hue: number, saturation: number, lightness: number): string {
  const sector = (((hue % 360) + 360) % 360) / 60;
  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
  const mid = chroma * (1 - Math.abs((sector % 2) - 1));
  const base = lightness - chroma / 2;

  const [r, g, b] =
    sector < 1
      ? [chroma, mid, 0]
      : sector < 2
        ? [mid, chroma, 0]
        : sector < 3
          ? [0, chroma, mid]
          : sector < 4
            ? [0, mid, chroma]
            : sector < 5
              ? [mid, 0, chroma]
              : [chroma, 0, mid];

  return `#${[r, g, b]
    .map((channel) =>
      Math.round((channel + base) * 255)
        .toString(16)
        .padStart(2, "0"),
    )
    .join("")}`;
}

/**
 * Chroma-weighted circular mean hue of the artwork, or null when nothing in
 * the image carries enough colour to tint a disc with.
 */
function sampleHue(image: HTMLImageElement): number | null {
  const width = image.naturalWidth;
  const height = image.naturalHeight;
  if (!width || !height) return null;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) return null;

  context.drawImage(image, 0, 0);
  const { data } = context.getImageData(0, 0, width, height);

  let x = 0;
  let y = 0;
  let total = 0;

  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < MIN_PIXEL_ALPHA) continue;

    const r = data[i] / 255;
    const g = data[i + 1] / 255;
    const b = data[i + 2] / 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const chroma = max - min;
    if (chroma === 0) continue;

    const lightness = (max + min) / 2;
    if (lightness < MIN_PIXEL_LIGHTNESS || lightness > MAX_PIXEL_LIGHTNESS) {
      continue;
    }

    const saturation =
      lightness > 0.5 ? chroma / (2 - max - min) : chroma / (max + min);
    if (saturation < MIN_PIXEL_SATURATION) continue;

    const hue =
      max === r
        ? ((g - b) / chroma + (g < b ? 6 : 0)) / 6
        : max === g
          ? ((b - r) / chroma + 2) / 6
          : ((r - g) / chroma + 4) / 6;

    const angle = hue * 2 * Math.PI;
    x += Math.cos(angle) * chroma;
    y += Math.sin(angle) * chroma;
    total += chroma;
  }

  if (total === 0) return null;
  return (Math.atan2(y, x) * 180) / Math.PI;
}

/**
 * Pastel sampled from an emoji PNG, or null on SSR / decode failure / a
 * tainted canvas. Resolved values are cached per src so each emoji is only
 * decoded once per session.
 */
export function deriveMarkerPastel(src: string): Promise<string | null> {
  if (typeof window === "undefined") return Promise.resolve(null);

  const cached = pastelCache.get(src);
  if (cached) return Promise.resolve(cached);

  const inFlight = pending.get(src);
  if (inFlight) return inFlight;

  const request = new Promise<string | null>((resolve) => {
    const image = new Image();
    image.decoding = "async";
    image.onload = () => {
      try {
        const hue = sampleHue(image);
        if (hue === null) {
          resolve(null);
          return;
        }
        const pastel = hslToHex(hue, PASTEL_SATURATION, PASTEL_LIGHTNESS);
        pastelCache.set(src, pastel);
        resolve(pastel);
      } catch {
        resolve(null);
      }
    };
    image.onerror = () => resolve(null);
    image.src = src;
  }).finally(() => {
    pending.delete(src);
  });

  pending.set(src, request);
  return request;
}

/**
 * Disc tint for an emoji marker: the locked Figma pastel on first paint, then
 * the colour sampled from the artwork once it decodes.
 */
export function useMarkerPastel(src: string): string {
  const fallback = getMarkerPastel(src);
  const [pastel, setPastel] = useState(() => pastelCache.get(src) ?? fallback);

  useEffect(() => {
    const cached = pastelCache.get(src);
    if (cached) {
      setPastel(cached);
      return;
    }

    setPastel(fallback);

    let active = true;
    void deriveMarkerPastel(src).then((derived) => {
      if (active && derived) setPastel(derived);
    });

    return () => {
      active = false;
    };
  }, [fallback, src]);

  return pastel;
}
