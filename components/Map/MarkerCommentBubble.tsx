"use client";

interface MarkerCommentBubbleProps {
  text: string;
}

/** Short quote floating above a marker pill (Figma node 2969:18745). */
export function MarkerCommentBubble({ text }: MarkerCommentBubbleProps) {
  return (
    <div className="flex flex-col items-start">
      <div
        className="flex max-w-[112px] items-center rounded-full border border-[#fefefe] px-2 py-1.5"
        style={{
          backgroundImage:
            "linear-gradient(160.63deg, #f6f6f6 12.64%, #ffffff 33.19%, #f6f6f6 68.85%, #ffffff 81.61%)",
          filter: "drop-shadow(0 2px 5px rgba(0, 0, 0, 0.08))",
        }}
      >
        <p className="truncate text-[11px] leading-[14px] text-[#171b22]">
          {text}
        </p>
      </div>
      <div className="relative h-1.5 w-4 shrink-0 pt-0.5" aria-hidden>
        <div className="absolute left-[5px] top-0 size-1.5 rounded-full bg-white" />
      </div>
    </div>
  );
}
