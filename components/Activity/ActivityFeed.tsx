"use client";

import { ActivityItem } from "@/lib/types";
import { ActivityRow } from "./ActivityRow";

interface ActivityFeedProps {
  items: ActivityItem[];
  onSelectActivity: (item: ActivityItem) => void;
}

export function ActivityFeed({ items, onSelectActivity }: ActivityFeedProps) {
  return (
    <div
      data-sheet-scroll
      className="flex min-h-0 flex-1 flex-col overflow-x-visible overflow-y-auto [scrollbar-gutter:stable]"
    >
      {/* Horizontal padding doubles as shadow room (y-scroll forces x clip). */}
      <div className="divide-y divide-[var(--border-subtle)] overflow-visible px-5 pb-10">
        {items.map((item) => (
          <ActivityRow
            key={item.id}
            item={item}
            onClick={() => onSelectActivity(item)}
          />
        ))}
      </div>
    </div>
  );
}
