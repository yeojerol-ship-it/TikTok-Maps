"use client";

import { ReactNode } from "react";

interface PhoneFrameProps {
  children: ReactNode;
}

export function PhoneFrame({ children }: PhoneFrameProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f5f5f7] p-4">
      {/*
        Never combine border-radius + overflow:hidden (or WebkitMaskImage) on
        Mapbox ancestors — Chromium diagonally clips / blanks the WebGL canvas.
        Square clip only; roundness is a non-clipping inset stroke.
      */}
      <div className="relative h-[844px] w-[390px] overflow-hidden bg-bg shadow-2xl">
        {children}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[100] rounded-[40px] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.08)]"
        />
      </div>
    </div>
  );
}
