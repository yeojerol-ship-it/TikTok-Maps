/** Screen-space layout for map markers that share the same viewport area. */

export interface MarkerLayoutItem {
  id: string;
  /** Projected screen position (anchor = bottom center). */
  x: number;
  y: number;
  /** Higher priority markers move less when resolving overlap. */
  priority: number;
}

export interface MarkerLayoutBox {
  width: number;
  height: number;
  /** Extra gap between marker bounding boxes. */
  padding: number;
}

export const DETAILED_MARKER_LAYOUT_BOX: MarkerLayoutBox = {
  width: 136,
  height: 164,
  padding: 10,
};

export const COMPACT_MARKER_LAYOUT_BOX: MarkerLayoutBox = {
  width: 120,
  height: 68,
  padding: 8,
};

/** Selected marker: 48px icon + label beneath, geographic anchor at label bottom. */
export const SELECTED_MARKER_ICON_SIZE = 48;
export const SELECTED_MARKER_LABEL_HEIGHT = 18;

/** Shift flyTo so the sticker icon (not the label baseline) sits in the visible map band. */
export const SELECTED_MARKER_FLY_OFFSET_Y =
  SELECTED_MARKER_LABEL_HEIGHT + SELECTED_MARKER_ICON_SIZE / 2;

/** Max pixel drift from the true geographic anchor. */
const MAX_OFFSET_PX = 132;

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

function bottomAnchorRect(
  x: number,
  y: number,
  box: MarkerLayoutBox,
): Rect {
  const pad = box.padding;
  return {
    left: x - box.width / 2 - pad,
    top: y - box.height - pad,
    right: x + box.width / 2 + pad,
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
) {
  const ax = a.x + a.ox;
  const ay = a.y + a.oy;
  const bx = b.x + b.ox;
  const by = b.y + b.oy;

  const rectA = bottomAnchorRect(ax, ay, box);
  const rectB = bottomAnchorRect(bx, by, box);

  const overlapX =
    Math.min(rectA.right, rectB.right) - Math.max(rectA.left, rectB.left);
  const overlapY =
    Math.min(rectA.bottom, rectB.bottom) - Math.max(rectA.top, rectB.top);

  if (overlapX <= 0 || overlapY <= 0) return;

  const totalPriority = a.priority + b.priority;
  const push = (overlapX < overlapY ? overlapX : overlapY) + 0.5;

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
export function resolveMarkerOffsets(
  items: MarkerLayoutItem[],
  box: MarkerLayoutBox,
): Map<string, { x: number; y: number }> {
  const nodes: LayoutNode[] = items.map((item) => ({ ...item, ox: 0, oy: 0 }));
  const iterations = Math.max(8, nodes.length * 3);

  for (let pass = 0; pass < iterations; pass += 1) {
    for (let i = 0; i < nodes.length; i += 1) {
      for (let j = i + 1; j < nodes.length; j += 1) {
        separatePair(nodes[i], nodes[j], box);
      }
    }
  }

  const offsets = new Map<string, { x: number; y: number }>();
  for (const node of nodes) {
    offsets.set(node.id, {
      x: clampOffset(node.ox),
      y: clampOffset(node.oy),
    });
  }

  return offsets;
}
