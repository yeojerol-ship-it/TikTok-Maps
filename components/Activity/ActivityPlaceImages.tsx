"use client";

interface ActivityPlaceImagesProps {
  images: string[];
  placeName: string;
}

export function ActivityPlaceImages({
  images,
  placeName,
}: ActivityPlaceImagesProps) {
  if (images.length === 0) return null;

  if (images.length === 1) {
    return (
      <div className="bump-surface mt-2.5 overflow-hidden rounded-xl border border-[var(--border-subtle)]">
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
    <div className="mt-2.5 flex snap-x snap-mandatory gap-2 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {images.map((src, index) => (
        <div
          key={`${src}-${index}`}
          className="bump-surface w-[68%] shrink-0 snap-start overflow-hidden rounded-xl border border-[var(--border-subtle)]"
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
