"use client";

import { RankingEntry } from "@/lib/types";
import { Avatar } from "@/components/Avatar/Avatar";
import { RankingCrown } from "@/components/Ranking/RankingCrown";
import { getRankStyle } from "@/lib/rankingStyles";

interface RankingRowProps {
  entry: RankingEntry;
}

function ordinalLabel(rank: number): string {
  if (rank === 1) return "1st";
  if (rank === 2) return "2nd";
  if (rank === 3) return "3rd";
  return `${rank}th`;
}

export function RankingRow({ entry }: RankingRowProps) {
  const style = getRankStyle(entry.rank);
  const placeWord = entry.placesVisited === 1 ? "place" : "places";

  return (
    <div className="relative flex items-center gap-4 px-4 py-3">
      <div className="relative shrink-0 overflow-visible pb-3">
        {style ? (
          <RankingCrown src={style.crown} variant="list" rank={entry.rank} />
        ) : null}
        <div
          className="rounded-full"
          style={
            style
              ? {
                  boxShadow: `0 0 0 4px ${style.border}`,
                }
              : undefined
          }
        >
          <Avatar
            src={entry.user.avatar}
            name={entry.user.name}
            size={48}
            className="shrink-0"
          />
        </div>
        <span
          className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center text-[13px] font-black italic leading-[22.5px] whitespace-nowrap"
          style={{
            color: style?.text ?? "#949494",
            WebkitTextStroke: "2px #ffffff",
            paintOrder: "stroke fill",
          }}
        >
          {style?.label ?? ordinalLabel(entry.rank)}
        </span>
      </div>
      <div className="min-w-0 flex-1 overflow-hidden">
        <p className="truncate text-[15px] font-semibold leading-[18px] text-foreground">
          {entry.user.name}
        </p>
        <p className="mt-1 truncate text-[12px] leading-[18px] text-black/65">
          {entry.placesVisited} {placeWord} been
        </p>
      </div>
      <button
        type="button"
        aria-label={`React to ${entry.user.name}`}
        className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-black/[0.05] outline-none active:scale-[0.96]"
      >
        <img
          src="/icons/emoji-plus.svg"
          alt=""
          width={20}
          height={20}
          className="size-5"
          draggable={false}
        />
      </button>
    </div>
  );
}
