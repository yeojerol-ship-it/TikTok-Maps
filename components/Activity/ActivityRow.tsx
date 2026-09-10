"use client";

import { ActivityItem } from "@/lib/types";
import { getPlaceActivityImages } from "@/data/activityImages";
import { formatRelativeTime, getActivityText } from "@/lib/selectors";
import { ThreadRow } from "./ThreadRow";

interface ActivityRowProps {
  item: ActivityItem;
  onClick: () => void;
}

export function ActivityRow({ item, onClick }: ActivityRowProps) {
  const text = getActivityText(item.interaction);
  const time = formatRelativeTime(item.interaction.createdAt);
  const images =
    item.interaction.type === "REVIEWED"
      ? getPlaceActivityImages(item.place.id)
      : [];

  return (
    <ThreadRow
      user={item.user}
      time={time}
      text={text || undefined}
      placeName={item.place.name}
      images={images}
      onClick={onClick}
    />
  );
}
