"use client";

import { User } from "@/lib/types";
import { getMarkerPastel } from "@/data/markerIcons";
import { Avatar } from "@/components/Avatar/Avatar";

interface MarkerPillProps {
  /** Emoji sticker for the place category. */
  icon: string;
  /** Friends stacked to the right of the sticker. */
  users: User[];
}

/** Figma pill (node 2969:18737): 36px tall, circles overlapped inside. */
const PILL_HEIGHT = 36;
const PILL_PADDING_X = 3.6;
const CIRCLE = 29.4;
const CIRCLE_OVERLAP = 5.3;
/** Horizontal advance per stacked circle. */
const CIRCLE_STEP = CIRCLE - CIRCLE_OVERLAP;
/**
 * Figma's pill rect (2969:18737) is a #ffffff fill under a gold NOISE effect
 * that renders as ~#fef9eb, and its rings (#fff8e9 on 2969:18728/18729,
 * #fff9f0 on 2969:18740) were eyedropped from that tinted result. We adopt the
 * rendered warmth instead of the fill token, so pill and ring share one cream.
 */
const PILL_COLOR = "#FDF8EA";
const RING_COLOR = PILL_COLOR;
const RING_WIDTH = 2;
/** Emoji overflows its pastel disc and is tilted, as in Figma. */
const EMOJI = 27.3;
const EMOJI_TILT = "-8.61deg";
const MAX_AVATARS = 2;

export function MarkerPill({ icon, users }: MarkerPillProps) {
  const visibleUsers = users.slice(0, MAX_AVATARS);
  const pastel = getMarkerPastel(icon);

  const avatarTrackWidth = visibleUsers.length * CIRCLE_STEP;

  return (
    <div
      className="marker-pill flex shrink-0 items-center rounded-full"
      style={{
        height: PILL_HEIGHT,
        paddingLeft: PILL_PADDING_X,
        paddingRight: PILL_PADDING_X,
        backgroundColor: PILL_COLOR,
      }}
    >
      <div
        className="relative z-[2] flex shrink-0 items-center justify-center rounded-full"
        style={{
          width: CIRCLE,
          height: CIRCLE,
          backgroundColor: pastel,
          boxShadow: `0 0 0 ${RING_WIDTH}px ${RING_COLOR}`,
        }}
      >
        <img
          src={icon}
          alt=""
          draggable={false}
          width={EMOJI}
          height={EMOJI}
          className="max-w-none object-contain"
          style={{
            width: EMOJI,
            height: EMOJI,
            transform: `rotate(${EMOJI_TILT})`,
          }}
        />
      </div>

      {visibleUsers.length > 0 ? (
        <div
          className="marker-pill__avatar-track flex shrink-0 items-center"
          style={{
            width: avatarTrackWidth,
            marginLeft: -CIRCLE_OVERLAP,
            paddingLeft: CIRCLE_OVERLAP,
            boxSizing: "content-box",
          }}
        >
          {visibleUsers.map((user, index) => (
            <div
              key={user.id}
              className="marker-pill__avatar relative shrink-0 rounded-full"
              style={{
                marginLeft: -CIRCLE_OVERLAP,
                zIndex: 1 - index,
                boxShadow: `0 0 0 ${RING_WIDTH}px ${RING_COLOR}`,
              }}
            >
              <Avatar src={user.avatar} name={user.name} size={CIRCLE} />
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
