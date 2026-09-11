"use client";

import { ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { SheetSnap } from "@/lib/types";
import { usePanelExpandDrag } from "@/lib/usePanelExpandDrag";

interface BottomSheetProps {
  children: ReactNode;
  snap?: SheetSnap;
  onSnapChange?: (snap: SheetSnap) => void;
  /** Full-sheet background (covers grabber + content). Falls back to solid white. */
  background?: string;
  /** Float grabber over content (e.g. full-bleed POI hero). */
  grabberOverlay?: boolean;
  /** Custom header rendered instead of the default grabber bar (e.g. folder tabs). */
  header?: ReactNode;
  /** Replaces default `bg-bg` on the sheet root when set. */
  surfaceClassName?: string;
  /** Slide the sheet off-screen while a place panel is open. */
  recede?: boolean;
}

export const SHEET_SNAP_FRACTIONS: Record<SheetSnap, number> = {
  collapsed: 0.32,
  medium: 0.52,
  expanded: 0.95,
};

export function BottomSheet({
  children,
  snap: controlledSnap,
  onSnapChange,
  background,
  grabberOverlay = false,
  header,
  surfaceClassName,
  recede = false,
}: BottomSheetProps) {
  const [internalSnap, setInternalSnap] = useState<SheetSnap>("collapsed");
  const snap = controlledSnap ?? internalSnap;
  const sheetRef = useRef<HTMLDivElement>(null);
  const restSnapRef = useRef<SheetSnap>(
    snap === "expanded" ? "collapsed" : snap,
  );

  const setSnap = useCallback(
    (s: SheetSnap) => {
      if (s !== "expanded") restSnapRef.current = s;
      setInternalSnap(s);
      onSnapChange?.(s);
    },
    [onSnapChange],
  );

  useEffect(() => {
    if (snap !== "expanded") restSnapRef.current = snap;
  }, [snap]);

  const expanded = snap === "expanded";

  const expand = useCallback(() => {
    if (snap !== "expanded") setSnap("expanded");
  }, [snap, setSnap]);

  const collapse = useCallback(() => {
    if (snap === "expanded") setSnap(restSnapRef.current);
  }, [snap, setSnap]);

  const collapseFromRest = useCallback(() => {
    if (snap === "medium") setSnap("collapsed");
  }, [snap, setSnap]);

  const { grabberProps, contentProps } = usePanelExpandDrag({
    expanded,
    enabled: !recede,
    onExpand: expand,
    onCollapse: collapse,
    onRestDragDown: collapseFromRest,
    rootRef: sheetRef,
  });

  return (
    <div
      ref={sheetRef}
      className={`sheet-stage absolute bottom-0 left-0 right-0 z-30 flex flex-col overflow-hidden ${expanded ? "sheet-stage--expanded" : ""} ${recede ? "sheet-stage--recede pointer-events-none" : "pointer-events-auto"} ${background ? "" : surfaceClassName ?? "bump-panel"}`}
      style={{
        height: `${SHEET_SNAP_FRACTIONS[snap] * 100}%`,
        maxHeight: "95%",
        borderTopLeftRadius: "var(--radius-surface)",
        borderTopRightRadius: "var(--radius-surface)",
      }}
      aria-hidden={recede || undefined}
    >
      {background && (
        <div
          className="pointer-events-none absolute inset-0 z-0"
          style={{ background }}
          aria-hidden
        />
      )}
      {header ? (
        <div
          className="relative z-10 shrink-0 cursor-grab touch-none active:cursor-grabbing"
          {...grabberProps}
        >
          {header}
        </div>
      ) : (
        <div
          className={
            grabberOverlay
              ? "absolute left-0 right-0 top-0 z-20 flex cursor-grab touch-none flex-col items-center bg-transparent pb-4 pt-3 active:cursor-grabbing"
              : "relative z-10 flex shrink-0 cursor-grab touch-none flex-col items-center bg-transparent pb-4 pt-3 active:cursor-grabbing"
          }
          {...grabberProps}
        >
          <div className="bump-grabber h-1 w-10 rounded-full" />
        </div>
      )}
      <div
        className={`relative z-10 flex min-h-0 flex-1 flex-col overflow-x-visible overflow-y-hidden ${grabberOverlay ? "pt-8" : ""} ${expanded ? "" : "touch-none"}`}
        {...contentProps}
      >
        {children}
      </div>
    </div>
  );
}
