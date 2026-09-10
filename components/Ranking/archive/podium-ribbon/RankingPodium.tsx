"use client";

import { RankingEntry } from "@/lib/types";
import { PodiumRibbon } from "./PodiumRibbon";

interface RankingPodiumProps {
  entries: RankingEntry[];
}

const PODIUM_AVATAR_SIZE = 56;

const PODIUM_CONFIG = {
  1: {
    cardHeight: 228,
    label: "TOP 1",
  },
  2: {
    cardHeight: 192,
    label: "TOP 2",
  },
  3: {
    cardHeight: 192,
    label: "TOP 3",
  },
} as const;

/** Classic podium order: 2nd · 1st · 3rd */
export function RankingPodium({ entries }: RankingPodiumProps) {
  const topThree = entries.filter((e) => e.rank <= 3);
  if (topThree.length === 0) return null;

  const byRank = Object.fromEntries(topThree.map((e) => [e.rank, e]));
  const ordered = [byRank[2], byRank[1], byRank[3]].filter(Boolean) as RankingEntry[];

  return (
    <section
      aria-label="Top 3 ranking"
      className="relative flex items-end gap-2.5 px-3 pb-4 pt-4"
    >
      {ordered.map((entry) => {
        const rank = entry.rank as 1 | 2 | 3;
        const config = PODIUM_CONFIG[rank];

        return (
          <PodiumRibbon
            key={entry.user.id}
            entry={entry}
            rank={rank}
            cardHeight={config.cardHeight}
            avatarSize={PODIUM_AVATAR_SIZE}
            label={config.label}
          />
        );
      })}
    </section>
  );
}
