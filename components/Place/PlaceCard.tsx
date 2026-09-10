"use client";

import { SocialPlace } from "@/lib/types";

interface PlaceCardProps {
  place: SocialPlace;
  onClose: () => void;
}

function getRatingLabel(rating: number): string {
  if (rating >= 4.7) return "Excellent";
  if (rating >= 4.3) return "Great";
  if (rating >= 4.0) return "Good";
  return "Decent";
}

/** Stub until real review counts are wired up. */
function getReviewCountLabel(_placeId: string): string {
  return "(1.8K)";
}

function getPriceRange(category: string): string {
  if (category === "Restaurant" || category === "Cafe") return "$15-$30";
  if (category === "Shopping") return "$$";
  return "$";
}

function IconChevronRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M6 4.5L10 8l-4 3.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconClose() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M4.5 4.5l7 7M11.5 4.5l-7 7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PageDots() {
  const total = 6;
  const activeIndex = 0;

  return (
    <div
      className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-0 p-1.5"
      aria-hidden
    >
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={`mx-0.5 block rounded-full ${
            i === activeIndex
              ? "size-2 bg-white"
              : "size-2 bg-white/45"
          }`}
        />
      ))}
    </div>
  );
}

export function PlaceCard({ place, onClose }: PlaceCardProps) {
  const heroSrc = place.image || "/place-card/hero.png";
  const ratingLabel = getRatingLabel(place.rating);
  const reviewCount = getReviewCountLabel(place.id);
  const priceRange = getPriceRange(place.category);

  return (
    <article
      className="pointer-events-auto mx-auto w-full max-w-[372px] overflow-hidden rounded-[40px] border border-white bg-gradient-to-b from-[rgba(255,255,255,0.8)] from-[48%] to-[rgba(255,255,255,0.78)] shadow-[0_8px_32px_rgba(0,0,0,0.12)] backdrop-blur-[33px]"
      aria-label={place.name}
    >
      <div className="relative h-[159px] w-full overflow-hidden">
        <img
          src={heroSrc}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <PageDots />
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="absolute right-3 top-3 flex size-8 items-center justify-center rounded-full border-none bg-white/80 text-foreground outline-none backdrop-blur-[2px] active:opacity-70"
        >
          <IconClose />
        </button>
      </div>

      <div className="flex flex-col gap-1.5 px-[13px] pb-4 pt-2">
        <div className="flex min-w-0 items-center gap-0.5">
          <h2 className="truncate text-[18px] font-semibold leading-[1.3] text-foreground">
            {place.name}
          </h2>
          <span className="shrink-0 text-foreground">
            <IconChevronRight />
          </span>
        </div>

        <div className="flex items-center gap-0.5">
          <img
            src="/place-card/star.svg"
            alt=""
            className="size-3.5 shrink-0"
            aria-hidden
          />
          <span className="text-[13px] font-bold leading-[1.3] tracking-[0.13px] text-foreground">
            {place.rating.toFixed(1)}
          </span>
          <span className="text-[13px] font-semibold leading-[1.3] tracking-[0.13px] text-foreground">
            {ratingLabel}
          </span>
          <span className="text-[13px] font-normal leading-[1.3] tracking-[0.13px] text-[var(--tux-text-2)]">
            {reviewCount}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] leading-[1.3] tracking-[0.13px] text-foreground">
          <p className="whitespace-nowrap">
            <span className="font-semibold">Open</span>
            <span> · 9:00AM - 17:00PM</span>
          </p>
          <span className="h-2 w-px shrink-0 bg-border" aria-hidden />
          <span className="whitespace-nowrap">{priceRange}</span>
          <span className="h-2 w-px shrink-0 bg-border" aria-hidden />
          <span className="whitespace-nowrap">{place.category}</span>
        </div>

        <button
          type="button"
          className="mt-1 w-full rounded-full border-none bg-[#161823] px-4 py-2.5 text-[15px] font-semibold leading-[1.3] text-white outline-none active:opacity-85"
        >
          Save
        </button>
      </div>
    </article>
  );
}
