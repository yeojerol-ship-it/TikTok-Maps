import {
  CrownLayout,
  LIST_CROWN_LAYOUT,
  MAP_CROWN_LAYOUT,
} from "@/lib/rankingStyles";

interface RankingCrownProps {
  src: string;
  /** "list" = 48px avatar row; "map" = 28px map marker. */
  variant: "list" | "map";
  /** 1–3 for rank-specific list sizing from Figma node 2984:3504. */
  rank?: number;
}

/** Tilted crown overlay for top-3 ranking avatars (Figma node 2984:3504). */
export function RankingCrown({ src, variant, rank = 1 }: RankingCrownProps) {
  const layout: CrownLayout =
    variant === "map"
      ? MAP_CROWN_LAYOUT
      : (LIST_CROWN_LAYOUT[rank] ?? LIST_CROWN_LAYOUT[1]);

  return (
    <img
      src={src}
      alt=""
      draggable={false}
      className="pointer-events-none absolute z-10 block origin-center object-contain"
      style={{
        left: layout.left,
        top: layout.top,
        width: layout.width,
        height: layout.height,
        transform: `rotate(${layout.rotation}deg)`,
        background: "transparent",
      }}
    />
  );
}
