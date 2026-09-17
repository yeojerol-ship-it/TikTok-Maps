"use client";

import { useEffect, useState } from "react";

interface IOSStatusBarProps {
  /** Use live clock; defaults to fixed 8:00 when false (Figma node 2969:14489). */
  liveTime?: boolean;
  variant?: "dark" | "light";
}

function formatTime(date: Date) {
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

/** Figma System Status Bar — 390×47, node 2969:14489. */
export function IOSStatusBar({
  liveTime = false,
  variant = "dark",
}: IOSStatusBarProps) {
  const [time, setTime] = useState("8:00");

  useEffect(() => {
    if (!liveTime) return;
    const tick = () => setTime(formatTime(new Date()));
    tick();
    const id = window.setInterval(tick, 30_000);
    return () => window.clearInterval(id);
  }, [liveTime]);

  const tone = variant === "dark" ? "#000000" : "#ffffff";

  return (
    <div
      className="pointer-events-none absolute inset-x-0 top-0 z-50 flex h-[47px] items-end justify-between px-4 pb-[15px]"
      aria-hidden
    >
      <span
        className="text-[15px] font-semibold leading-none tracking-[-0.2px]"
        style={{
          color: tone,
          fontFamily: "-apple-system, SF Pro Text, sans-serif",
        }}
      >
        {time}
      </span>
      <div className="flex items-end gap-[6px]">
        {/* Figma-exported icons — node 2969:14490 */}
        <img
          src="/status-bar/cellular.svg"
          alt=""
          width={21}
          height={13}
          className="block shrink-0"
          aria-hidden
        />
        <img
          src="/status-bar/wifi.svg"
          alt=""
          width={18}
          height={13}
          className="block shrink-0"
          aria-hidden
        />
        <img
          src="/status-bar/battery.svg"
          alt=""
          width={29}
          height={14}
          className="block shrink-0"
          aria-hidden
        />
      </div>
    </div>
  );
}
