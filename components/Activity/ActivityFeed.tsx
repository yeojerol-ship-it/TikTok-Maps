"use client";

import { ActivityItem } from "@/lib/types";
import { ActivityRow } from "./ActivityRow";

interface ActivityFeedProps {
  items: ActivityItem[];
  onSelectActivity: (item: ActivityItem) => void;
}

export function ActivityFeed({ items, onSelectActivity }: ActivityFeedProps) {
  return (
    <div data-sheet-scroll className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      <div className="divide-y divide-[var(--border-subtle)] px-4 pb-4">
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
