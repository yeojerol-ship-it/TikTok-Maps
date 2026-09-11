"use client";

import { useCallback, useEffect, useRef } from "react";

export const PANEL_DRAG_THRESHOLD_PX = 40;

export function closestSheetScroller(
  start: EventTarget | null,
  root: HTMLElement | null,
): HTMLElement | null {
  let node = start instanceof HTMLElement ? start : null;
  while (node && node !== root) {
    if (node.dataset.sheetScroll !== undefined) return node;
    node = node.parentElement;
  }
  return root?.querySelector("[data-sheet-scroll]") ?? null;
}

type ExpandDragOptions = {
  expanded: boolean;
  enabled?: boolean;
  onExpand: () => void;
  onCollapse: () => void;
  /** Dragging down while collapsed/mid (e.g. medium → collapsed). */
  onRestDragDown?: () => void;
  rootRef: React.RefObject<HTMLElement | null>;
};

export function usePanelExpandDrag(options: ExpandDragOptions) {
  const { expanded, enabled = true, onExpand, onCollapse, rootRef } = options;
  const dragging = useRef(false);
  const startY = useRef(0);
  const startExpanded = useRef(false);
  const suppressClick = useRef(false);
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const releasePointer = (target: EventTarget | null, pointerId: number) => {
    if (!(target instanceof HTMLElement)) return;
    try {
      if (target.hasPointerCapture(pointerId)) {
        target.releasePointerCapture(pointerId);
      }
    } catch {
      /* pointer already released */
    }
  };

  const onPointerDown = useCallback(
    (capture: boolean) => (e: React.PointerEvent) => {
      const current = optionsRef.current;
      if (!current.enabled || e.button !== 0) return;
      dragging.current = true;
      startY.current = e.clientY;
      startExpanded.current = current.expanded;
      if (capture) {
        try {
          (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        } catch {
          /* ignore */
        }
      }
    },
    [],
  );

  const onPointerMove = useCallback(
    (ignoreScroll: boolean) => (e: React.PointerEvent) => {
      const current = optionsRef.current;
      if (!current.enabled || !dragging.current) return;
      const delta = startY.current - e.clientY;

      if (startExpanded.current) {
        if (!ignoreScroll) {
          const scroller = closestSheetScroller(
            e.target,
            current.rootRef.current,
          );
          if (scroller && scroller.scrollTop > 1) return;
        }
        if (delta < -PANEL_DRAG_THRESHOLD_PX) {
          dragging.current = false;
          suppressClick.current = true;
          current.onCollapse();
        }
        return;
      }

      if (!ignoreScroll) {
        const target = e.target instanceof Element ? e.target : null;
        // Horizontal image carousels own the gesture.
        if (target?.closest("[data-place-images-carousel]")) return;

        const scroller = closestSheetScroller(
          e.target,
          current.rootRef.current,
        );
        if (scroller) {
          const canScrollDown =
            scroller.scrollHeight - scroller.clientHeight - scroller.scrollTop >
            1;
          const canScrollUp = scroller.scrollTop > 1;
          // Let the sheet scroller consume vertical drags while content overflows.
          if (delta > 0 && canScrollDown) return;
          if (delta < 0 && canScrollUp) return;
        }
      }

      if (delta > PANEL_DRAG_THRESHOLD_PX) {
        dragging.current = false;
        suppressClick.current = true;
        current.onExpand();
      } else if (delta < -PANEL_DRAG_THRESHOLD_PX) {
        dragging.current = false;
        suppressClick.current = true;
        current.onRestDragDown?.();
      }
    },
    [],
  );

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    dragging.current = false;
    releasePointer(e.currentTarget, e.pointerId);
  }, []);

  const onClickCapture = useCallback((e: React.MouseEvent) => {
    if (!suppressClick.current) return;
    e.preventDefault();
    e.stopPropagation();
    suppressClick.current = false;
  }, []);

  const grabberProps = {
    onPointerDown: onPointerDown(true),
    onPointerMove: onPointerMove(true),
    onPointerUp,
    onPointerCancel: onPointerUp,
  };

  const contentProps = {
    onPointerDown: onPointerDown(false),
    onPointerMove: onPointerMove(false),
    onPointerUp,
    onPointerCancel: onPointerUp,
    onClickCapture,
  };

  const onWheel = useCallback((e: WheelEvent) => {
    const current = optionsRef.current;
    if (!current.enabled) return;
    const scroller = closestSheetScroller(e.target, current.rootRef.current);

    if (!current.expanded) {
      // Prefer scrolling overflow content (e.g. image carousels) before expanding.
      if (scroller) {
        const canScrollDown =
          scroller.scrollHeight - scroller.clientHeight - scroller.scrollTop > 1;
        const canScrollUp = scroller.scrollTop > 1;
        if ((e.deltaY > 0 && canScrollDown) || (e.deltaY < 0 && canScrollUp)) {
          return;
        }
      }
      if (e.deltaY > 0) {
        e.preventDefault();
        current.onExpand();
      } else if (e.deltaY < 0) {
        e.preventDefault();
        current.onRestDragDown?.();
      }
      return;
    }

    if ((!scroller || scroller.scrollTop <= 0) && e.deltaY < 0) {
      e.preventDefault();
      current.onCollapse();
    }
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || !enabled) return;
    root.addEventListener("wheel", onWheel, { passive: false });
    return () => root.removeEventListener("wheel", onWheel);
  }, [enabled, expanded, onExpand, onCollapse, onWheel, rootRef]);

  return { grabberProps, contentProps };
}
