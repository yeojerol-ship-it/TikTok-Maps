"use client";

interface ActivityPlaceImagesProps {
  images: string[];
  placeName: string;
  /** Bleed into trailing panel padding so cards aren't clipped mid-scroll. */
  bleedEnd?: boolean;
  /**
   * `scatter` — square horizontal carousel (0°).
   * `scatterLoose` is kept as an alias of `scatter`.
   * Default keeps the neat activity-feed carousel.
   */
  variant?: "default" | "scatter" | "scatterLoose";
}

/** Uniform square card size — same for every photo. */
const CARD_WIDTH = 136;
const CARD_RADIUS = 14;

export function ActivityPlaceImages({
  images,
  placeName,
  bleedEnd = false,
  variant = "default",
}: ActivityPlaceImagesProps) {
  if (images.length === 0) return null;

  if (variant === "scatter" || variant === "scatterLoose") {
    return (
      <ScatterPlaceImages
        images={images}
        placeName={placeName}
        bleedEnd={bleedEnd}
      />
    );
  }

  if (images.length === 1) {
    return (
      <div className="bump-surface mt-2.5 overflow-hidden rounded-[14px] border border-[var(--border-subtle)]">
        <img
          src={images[0]}
          alt={placeName}
          className="aspect-[4/3] w-full object-cover"
          draggable={false}
        />
      </div>
    );
  }

  return (
    <div
      data-place-images-carousel
      className={
        bleedEnd
          ? "mt-2.5 -mr-5 flex w-[calc(100%+1.25rem)] snap-x snap-mandatory gap-2 overflow-x-auto overflow-y-visible pb-0.5 pr-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          : "mt-2.5 flex snap-x snap-mandatory gap-2 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      }
    >
      {images.map((src, index) => (
        <div
          key={`${src}-${index}`}
          className="bump-surface w-[68%] shrink-0 snap-start overflow-hidden rounded-[14px] border border-[var(--border-subtle)]"
        >
          <img
            src={src}
            alt={placeName}
            className="aspect-[4/3] w-full object-cover"
            draggable={false}
          />
        </div>
      ))}
      <div className="w-4 shrink-0 snap-none" aria-hidden />
    </div>
  );
}

function ScatterPlaceImages({
  images,
  placeName,
  bleedEnd,
}: {
  images: string[];
  placeName: string;
  bleedEnd: boolean;
}) {
  if (images.length === 1) {
    return (
      <div className="mt-2.5">
        <div
          className="shrink-0 overflow-hidden border border-black/[0.06] bg-[var(--surface-raised)]"
          style={{
            width: CARD_WIDTH,
            maxWidth: "72%",
            borderRadius: CARD_RADIUS,
          }}
        >
          <img
            src={images[0]}
            alt={placeName}
            className="aspect-square h-auto w-full object-cover"
            draggable={false}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      data-place-images-scatter
      className={[
        "mt-2.5 flex snap-x snap-mandatory gap-2 overflow-x-auto",
        "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        "touch-pan-x pb-0.5",
        bleedEnd
          ? "-mr-5 w-[calc(100%+1.25rem)] pr-5"
          : "pr-1",
      ].join(" ")}
    >
      {images.map((src, index) => (
        <div
          key={`${src}-${index}`}
          className="shrink-0 snap-start overflow-hidden border border-black/[0.06] bg-[var(--surface-raised)]"
          style={{
            width: CARD_WIDTH,
            borderRadius: CARD_RADIUS,
          }}
        >
          <img
            src={src}
            alt={placeName}
            className="aspect-square h-auto w-full object-cover"
            draggable={false}
          />
        </div>
      ))}
      <div className="w-3 shrink-0 snap-none" aria-hidden />
    </div>
  );
}
