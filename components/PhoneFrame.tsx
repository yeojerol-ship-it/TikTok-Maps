"use client";

import { ReactNode } from "react";

interface PhoneFrameProps {
  children: ReactNode;
}

export function PhoneFrame({ children }: PhoneFrameProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f5f5f7] p-4">
      <div
        className="relative h-[844px] w-[390px] overflow-hidden bg-bg shadow-2xl"
        style={{ borderRadius: 40 }}
      >
        <div className="h-full w-full">{children}</div>
      </div>
    </div>
  );
}
