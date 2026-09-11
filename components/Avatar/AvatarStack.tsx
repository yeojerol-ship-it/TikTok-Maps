"use client";

import { User } from "@/lib/types";
import { Avatar } from "./Avatar";

interface AvatarStackProps {
  users: User[];
  max?: number;
  size?: number;
  /** Animate the leading avatar entrance (e.g. current user just saved). */
  animateLeading?: boolean;
  onLeadingAnimationEnd?: () => void;
}

export function AvatarStack({
  users,
  max = 3,
  size = 22,
  animateLeading = false,
  onLeadingAnimationEnd,
}: AvatarStackProps) {
  const visible = users.slice(0, max);
  const overflow = users.length - max;

  return (
    <div className="flex items-center justify-center">
      {visible.map((user, i) => (
        <div
          key={user.id}
          className={`rounded-full${i === 0 && animateLeading ? " saved-avatar-pop" : ""}`}
          style={{ marginLeft: i === 0 ? 0 : -6, zIndex: max - i }}
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
          className="tux-small-2-semi flex items-center justify-center rounded-full bg-[var(--surface-muted)] text-muted"
          style={{
            width: size,
            height: size,
            marginLeft: -6,
            zIndex: 0,
          }}
        >
          +{overflow}
        </div>
      )}
    </div>
  );
}
