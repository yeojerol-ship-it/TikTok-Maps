"use client";

/** Compact location puck — deep Apple-blue core, white bezel. */
export function UserLocationMarker() {
  return (
    <div className="user-location-dot" aria-label="Your location">
      <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
        <defs>
          <radialGradient id="user-loc-fill" cx="46%" cy="34%" r="68%">
            <stop offset="0%" stopColor="#1a7aee" />
            <stop offset="38%" stopColor="#0066d6" />
            <stop offset="72%" stopColor="#0054c2" />
            <stop offset="100%" stopColor="#003fa0" />
          </radialGradient>
          <radialGradient id="user-loc-shine" cx="50%" cy="24%" r="42%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.38)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </radialGradient>
        </defs>
        <circle cx="9" cy="9.6" r="7.2" fill="rgba(8, 28, 64, 0.2)" />
        <circle cx="9" cy="9" r="8" fill="#ffffff" />
        <circle cx="9" cy="9" r="5.55" fill="url(#user-loc-fill)" />
        <ellipse
          cx="9"
          cy="7.1"
          rx="3.2"
          ry="2.1"
          fill="url(#user-loc-shine)"
        />
      </svg>
    </div>
  );
}
