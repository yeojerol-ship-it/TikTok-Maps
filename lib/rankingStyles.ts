/** Inner crown leaf size + placement (Figma node 2984:3504). */
export interface CrownLayout {
  left: number;
  top: number;
  width: number;
  height: number;
  /** Degrees clockwise; Figma uses -rotate-32. */
  rotation: number;
}

const LIST_AVATAR_PX = 48;
const MAP_AVATAR_PX_TOP3 = 28;
const MAP_AVATAR_PX = 20;
const FIGMA_MAP_AVATAR_PX = 36;
/** 2984:3661 label width — avatar is centered in this column (2984:3658). */
const FIGMA_MAP_PARENT_W = 81.219;
const FIGMA_MAP_AVATAR_LEFT = (FIGMA_MAP_PARENT_W - FIGMA_MAP_AVATAR_PX) / 2;
const MAP_SCALE = MAP_AVATAR_PX_TOP3 / FIGMA_MAP_AVATAR_PX;

/** Centered inner leaf inside a Figma flex wrapper. */
function innerFromWrapper(
  wrapperLeft: number,
  wrapperTop: number,
  wrapperW: number,
  wrapperH: number,
  innerW: number,
  innerH: number,
  avatarLeft = 0,
  avatarTop = 0,
): Pick<CrownLayout, "left" | "top" | "width" | "height"> {
  return {
    left: wrapperLeft + (wrapperW - innerW) / 2 - avatarLeft,
    top: wrapperTop + (wrapperH - innerH) / 2 - avatarTop,
    width: innerW,
    height: innerH,
  };
}

/** List crowns scaled down ~25% and shifted up so they sit on the head, not the face. */
const LIST_CROWN_SCALE = 0.75;
const LIST_CROWN_TOP_SHIFT = 6;

function listCrownFromFigma(
  wrapperLeft: number,
  wrapperTop: number,
  wrapperW: number,
  wrapperH: number,
  innerW: number,
  innerH: number,
  avatarLeft = 0,
  avatarTop = 0,
): CrownLayout {
  const base = innerFromWrapper(
    wrapperLeft,
    wrapperTop,
    wrapperW,
    wrapperH,
    innerW,
    innerH,
    avatarLeft,
    avatarTop,
  );
  return {
    left: base.left,
    top: base.top - LIST_CROWN_TOP_SHIFT,
    width: base.width * LIST_CROWN_SCALE,
    height: base.height * LIST_CROWN_SCALE,
    rotation: -32,
  };
}

/**
 * List row crowns — inner leaf position relative to 48 px avatar top-left.
 * Gold 2984:3657 (wrapper −2,18 / 60.795, avatar at 20,40 in parent).
 * Silver/bronze start from gold's bottom-center anchor, then nudge up/right
 * so shorter assets sit on the head like gold (not low on the face).
 */
const LIST_CROWN_GOLD = listCrownFromFigma(
  -2,
  18,
  60.795,
  60.795,
  44.119,
  44.119,
  20,
  40,
);

const LIST_CROWN_ANCHOR = {
  x: LIST_CROWN_GOLD.left + LIST_CROWN_GOLD.width / 2,
  y: LIST_CROWN_GOLD.top + LIST_CROWN_GOLD.height,
};

function listCrownAnchored(innerW: number, innerH: number): CrownLayout {
  const width = innerW * LIST_CROWN_SCALE;
  const height = innerH * LIST_CROWN_SCALE;
  return {
    left: LIST_CROWN_ANCHOR.x - width / 2,
    top: LIST_CROWN_ANCHOR.y - height,
    width,
    height,
    rotation: -32,
  };
}

/** Bottom-anchor baseline sits silver/bronze too low — nudge up and right to match gold. */
const LIST_CROWN_SILVER_BRONZE_NUDGE = { left: 4.5, top: -11 };

function listCrownAnchoredNudged(
  innerW: number,
  innerH: number,
): CrownLayout {
  const layout = listCrownAnchored(innerW, innerH);
  return {
    ...layout,
    left: layout.left + LIST_CROWN_SILVER_BRONZE_NUDGE.left,
    top: layout.top + LIST_CROWN_SILVER_BRONZE_NUDGE.top,
  };
}

export const LIST_CROWN_LAYOUT: Record<number, CrownLayout> = {
  1: LIST_CROWN_GOLD,
  2: listCrownAnchoredNudged(41.58, 20.79),
  3: listCrownAnchoredNudged(44.363, 22.182),
};

/**
 * Map marker crown — inner leaf scaled 36→28 px (2984:3662).
 * Wrapper is absolute in the centered map column, so subtract avatar inset
 * (FIGMA_MAP_AVATAR_LEFT) to get position relative to the avatar top-left.
 */
export const MAP_CROWN_LAYOUT: CrownLayout = {
  ...(() => {
    const inner = innerFromWrapper(
      11,
      -18,
      38.103,
      38.103,
      27.651,
      27.651,
      FIGMA_MAP_AVATAR_LEFT,
      0,
    );
    return {
      left: inner.left * MAP_SCALE,
      top: inner.top * MAP_SCALE,
      width: inner.width * MAP_SCALE,
      height: inner.height * MAP_SCALE,
    };
  })(),
  rotation: -32,
};

export { LIST_AVATAR_PX, MAP_AVATAR_PX, MAP_AVATAR_PX_TOP3 };

export function getMapAvatarPx(rank: number): number {
  return rank <= 3 ? MAP_AVATAR_PX_TOP3 : MAP_AVATAR_PX;
}

/** Top-3 ranking visuals — colors from Figma node 2984:3504. */
export const RANK_STYLES: Record<
  number,
  { border: string; label: string; text: string; crown: string }
> = {
  1: {
    border: "#fff3a8",
    label: "1st",
    text: "#d3bc2a",
    crown: "/icons/crown-gold.png",
  },
  2: {
    border: "#dee8ec",
    label: "2nd",
    text: "#6b7376",
    crown: "/icons/crown-silver.png",
  },
  3: {
    border: "#ffe6d0",
    label: "3rd",
    text: "#c18554",
    crown: "/icons/crown-bronze.png",
  },
};

export function getRankStyle(rank: number) {
  return RANK_STYLES[rank];
}
