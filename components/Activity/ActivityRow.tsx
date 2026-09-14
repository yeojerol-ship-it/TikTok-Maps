"use client";

import { ActivityItem } from "@/lib/types";
import { getInteractionActivityImages } from "@/data/activityImages";
import { formatRelativeTime, getActivityText } from "@/lib/selectors";
import { ThreadRow } from "./ThreadRow";

interface ActivityRowProps {
  item: ActivityItem;
  onClick: () => void;
}

export function ActivityRow({ item, onClick }: ActivityRowProps) {
  const text = getActivityText(item.interaction);
  const time = formatRelativeTime(item.interaction.createdAt);
  const images = getInteractionActivityImages(
    item.interaction.id,
    item.place.id,
  );
  const showImages =
    images.length > 0 &&
    (item.interaction.type === "REVIEWED" ||
      (item.interaction.type === "BEEN" && Boolean(item.interaction.comment)));

  return (
    <ThreadRow
      user={item.user}
      time={time}
      text={text || undefined}
      placeName={item.place.name}
      images={showImages ? images : []}
      onClick={onClick}
    />
  );
}
