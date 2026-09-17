/** Screen-space layout for map markers that share the same viewport area. */

export interface MarkerLayoutItem {
  id: string;
  /** Projected screen position (anchor = bottom center). */
  x: number;
  y: number;
  /** Higher priority markers move less when resolving overlap. */
  priority: number;
  /** Per-marker bounding box — falls back to the shared box when omitted. */
  box?: MarkerLayoutBox;
}

export interface MarkerLayoutBox {
  width: number;
  height: number;
  /** Extra gap between marker bounding boxes. */
  padding: number;
}

/** Pill (36) + gap (8) + two label lines (29), plus room for the quote bubble. */
export const DETAILED_MARKER_LAYOUT_BOX: MarkerLayoutBox = {
  width: 124,
  height: 112,
  padding: 10,
};

export const COMPACT_MARKER_LAYOUT_BOX: MarkerLayoutBox = {
  width: 118,
  height: 76,
  padding: 8,
};

/** Collapsed emoji disc — 28px plus breathing room. */
export const MINI_MARKER_LAYOUT_BOX: MarkerLayoutBox = {
  width: 36,
  height: 36,
  padding: 6,
};

/** Ranking map avatar — 20 px circle, no crown (rank 4+). */
export const RANKING_AVATAR_LAYOUT_BOX: MarkerLayoutBox = {
  width: 24,
  height: 24,
  padding: 4,
};

/** Top-3 crowned avatar — 28 px + crown overflow (Figma 2984:3662, ~44 px bbox). */
export const RANKING_CROWNED_AVATAR_LAYOUT_BOX: MarkerLayoutBox = {
  width: 44,
  height: 44,
  padding: 8,
};

/** Selected marker: 44px icon expanded 30% as Figma pin (76×86 aspect). */
export const SELECTED_MARKER_ICON_SIZE = Math.round(44 * 1.3);
/** Pin height above diameter: 86/76 − 1. */
export const SELECTED_MARKER_TIP_HEIGHT = Math.round(
  SELECTED_MARKER_ICON_SIZE * ((86 / 76) - 1),
);
export const SELECTED_MARKER_LABEL_HEIGHT = 0;

/** Shift flyTo so the pin tip sits in the visible map band. */
export const SELECTED_MARKER_FLY_OFFSET_Y =
  SELECTED_MARKER_ICON_SIZE / 2 + SELECTED_MARKER_TIP_HEIGHT;

/** Max pixel drift from the true geographic anchor. */
const MAX_OFFSET_PX = 132;
/** Keep resolved markers this far inside the map viewport. */
const EDGE_PADDING_PX = 6;

/** Map viewport used to keep spread markers on screen. */
export interface MarkerLayoutBounds {
  width: number;
}

interface Rect {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

interface LayoutNode extends MarkerLayoutItem {
  ox: number;
  oy: number;
}

export type MarkerLayoutAnchor = "bottom" | "center";

function anchorRect(
  x: number,
  y: number,
  box: MarkerLayoutBox,
  anchor: MarkerLayoutAnchor,
): Rect {
  const pad = box.padding;
  const halfW = box.width / 2;
  if (anchor === "center") {
    const halfH = box.height / 2;
    return {
      left: x - halfW - pad,
      top: y - halfH - pad,
      right: x + halfW + pad,
      bottom: y + halfH + pad,
    };
  }
  return {
    left: x - halfW - pad,
    top: y - box.height - pad,
    right: x + halfW + pad,
    bottom: y + pad,
  };
}

function clampOffset(value: number) {
  return Math.max(-MAX_OFFSET_PX, Math.min(MAX_OFFSET_PX, value));
}

function separatePair(
  a: LayoutNode,
  b: LayoutNode,
  box: MarkerLayoutBox,
  anchor: MarkerLayoutAnchor,
  separationBoost = 0,
) {
  const ax = a.x + a.ox;
  const ay = a.y + a.oy;
  const bx = b.x + b.ox;
  const by = b.y + b.oy;

  const rectA = anchorRect(ax, ay, a.box ?? box, anchor);
  const rectB = anchorRect(bx, by, b.box ?? box, anchor);

  const overlapX =
    Math.min(rectA.right, rectB.right) - Math.max(rectA.left, rectB.left);
  const overlapY =
    Math.min(rectA.bottom, rectB.bottom) - Math.max(rectA.top, rectB.top);

  if (overlapX <= 0 || overlapY <= 0) return;

  const totalPriority = a.priority + b.priority;
  const push =
    (overlapX < overlapY ? overlapX : overlapY) + 0.5 + separationBoost;

  if (overlapX < overlapY) {
    const dir = ax <= bx ? -1 : 1;
    a.ox += dir * push * (b.priority / totalPriority);
    b.ox -= dir * push * (a.priority / totalPriority);
    return;
  }

  const dir = ay <= by ? -1 : 1;
  a.oy += dir * push * (b.priority / totalPriority);
  b.oy -= dir * push * (a.priority / totalPriority);
}

/**
 * Spreads overlapping markers in screen space while keeping high-priority
 * markers close to their geographic anchor.
 */
export interface MarkerLayoutOptions {
  /** Override iteration count (default max(8, n×3)). */
  iterations?: number;
  /** Extra px added to each separation push (default 0). */
  separationBoost?: number;
}

export function resolveMarkerOffsets(
  items: MarkerLayoutItem[],
  box: MarkerLayoutBox,
  bounds?: MarkerLayoutBounds,
  anchor: MarkerLayoutAnchor = "bottom",
  options?: MarkerLayoutOptions,
): Map<string, { x: number; y: number }> {
  const nodes: LayoutNode[] = items.map((item) => ({ ...item, ox: 0, oy: 0 }));
  const boost = options?.separationBoost ?? 0;
  const iterations =
    options?.iterations ?? Math.max(8, nodes.length * 3);

  for (let pass = 0; pass < iterations; pass += 1) {
    for (let i = 0; i < nodes.length; i += 1) {
      for (let j = i + 1; j < nodes.length; j += 1) {
        separatePair(nodes[i], nodes[j], box, anchor, boost);
      }
    }
  }

  const offsets = new Map<string, { x: number; y: number }>();
  for (const node of nodes) {
    let ox = clampOffset(node.ox);

    if (bounds) {
      const half = (node.box ?? box).width / 2;
      const minX = half + EDGE_PADDING_PX;
      const maxX = bounds.width - half - EDGE_PADDING_PX;
      const x = node.x + ox;
      if (minX <= maxX) {
        if (x < minX) ox += minX - x;
        else if (x > maxX) ox += maxX - x;
      }
    }

    offsets.set(node.id, { x: ox, y: clampOffset(node.oy) });
  }

  return offsets;
}
