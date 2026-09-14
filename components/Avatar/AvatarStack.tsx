"use client";

import type { CSSProperties } from "react";
import { User } from "@/lib/types";
import { Avatar } from "./Avatar";

interface AvatarStackProps {
  users: User[];
  max?: number;
  size?: number;
  /**
   * Surface colour punched through overlapping edges (cutout ring).
   * Match the background behind the stack (bubble white, pill muted, etc.).
   */
  cutoutColor?: string;
  /** Animate the leading avatar entrance (e.g. current user just saved). */
  animateLeading?: boolean;
  onLeadingAnimationEnd?: () => void;
}

/** Overlap as a fraction of avatar size — keeps stacks dense across sizes. */
const OVERLAP_RATIO = 0.28;
/** Cutout ring width in px (TUX-style facepile stroke). */
const CUTOUT_PX = 2;

export function AvatarStack({
  users,
  max = 3,
  size = 22,
  cutoutColor = "var(--bg)",
  animateLeading = false,
  onLeadingAnimationEnd,
}: AvatarStackProps) {
  const visible = users.slice(0, max);
  const overflow = users.length - max;
  const overlap = Math.max(4, Math.round(size * OVERLAP_RATIO));
  const cutoutStyle: CSSProperties = {
    boxShadow: `0 0 0 ${CUTOUT_PX}px ${cutoutColor}`,
  };

  return (
    <div
      className="avatar-stack flex items-center justify-center"
      role="group"
      aria-label="Avatars"
    >
      {visible.map((user, i) => (
        <div
          key={user.id}
          className={`avatar-stack__item rounded-full${
            i === 0 && animateLeading ? " saved-avatar-pop" : ""
          }`}
          style={{
            marginLeft: i === 0 ? 0 : -overlap,
            zIndex: max - i,
            ...cutoutStyle,
          }}
          onAnimationEnd={
            i === 0 && animateLeading
              ? (event) => {
                  if (event.target !== event.currentTarget) return;
                  onLeadingAnimationEnd?.();
                }
              : undefined
          }
        >
          <Avatar src={user.avatar} name={user.name} size={size} />
        </div>
      ))}
      {overflow > 0 && (
        <div
          className="avatar-stack__item tux-small-2-semi flex items-center justify-center rounded-full bg-[var(--surface-muted)] text-muted"
          style={{
            width: size,
            height: size,
            marginLeft: -overlap,
            zIndex: 0,
            ...cutoutStyle,
          }}
        >
          +{overflow}
        </div>
      )}
    </div>
  );
}
