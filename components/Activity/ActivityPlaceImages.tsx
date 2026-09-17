"use client";

interface ActivityPlaceImagesProps {
  images: string[];
  placeName: string;
  /** Bleed into trailing panel padding so cards aren't clipped mid-scroll. */
  bleedEnd?: boolean;
  /**
   * `scatter` — square horizontal carousel (0°).
   * `scatterLoose` is kept as an alias of `scatter`.
   * `thread` — Figma POI thread cards (160×180, 14px radius).
   * Default keeps the neat activity-feed carousel.
   */
  variant?: "default" | "scatter" | "scatterLoose" | "thread";
}

/** Uniform square card size — same for every photo. */
const CARD_WIDTH = 136;
const CARD_RADIUS = 14;
/** Figma thread media: 160×180, radius 14. */
const THREAD_CARD_WIDTH = 160;
const THREAD_CARD_HEIGHT = 180;

export function ActivityPlaceImages({
  images,
  placeName,
  bleedEnd = false,
  variant = "default",
}: ActivityPlaceImagesProps) {
  if (images.length === 0) return null;

  if (variant === "thread") {
    return (
      <ThreadPlaceImages
        images={images}
        placeName={placeName}
        bleedEnd={bleedEnd}
      />
    );
  }

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

function ThreadPlaceImages({
  images,
  placeName,
  bleedEnd,
}: {
  images: string[];
  placeName: string;
  bleedEnd: boolean;
}) {
  const bleedClass = bleedEnd
    ? "-mr-5 w-[calc(100%+1.25rem)]"
    : "w-full";

  return (
    <div className={`mt-3 overflow-visible ${bleedClass}`}>
      <div
        data-place-images-thread
        className={[
          "flex snap-x snap-mandatory gap-2 overflow-x-auto overflow-y-visible",
          "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          "touch-pan-x pb-0.5",
          bleedEnd ? "pr-5" : "pr-1",
        ].join(" ")}
      >
        {images.map((src, index) => (
          <div
            key={`${src}-${index}`}
            className="shrink-0 snap-start overflow-hidden border border-black/[0.06] bg-[#fefeff]"
            style={{
              width: THREAD_CARD_WIDTH,
              height: THREAD_CARD_HEIGHT,
              borderRadius: CARD_RADIUS,
            }}
          >
            <img
              src={src}
              alt={placeName}
              className="h-full w-full object-cover"
              draggable={false}
            />
          </div>
        ))}
        <div className="w-2 shrink-0 snap-none" aria-hidden />
      </div>
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

  const bleedClass = bleedEnd
    ? "-mr-5 w-[calc(100%+1.25rem)]"
    : "w-full";

  return (
    <div className={`mt-2.5 overflow-visible ${bleedClass}`}>
      <div
        data-place-images-scatter
        className={[
          "flex snap-x snap-mandatory gap-2 overflow-x-auto overflow-y-visible",
          "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          "touch-pan-x pb-0.5",
          bleedEnd ? "pr-5" : "pr-1",
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
    </div>
  );
}
