import { DEMO_NOW } from "@/lib/demoTime";
import {
  DEFAULT_MAP_PLACE_ID,
  FEATURED_MAP_PLACE_IDS,
} from "@/data/featuredPlaces";
import { interactions } from "@/data/interactions";
import { placeMap, places } from "@/data/places";
import { rankingPlacesVisited } from "@/data/ranking";
import { currentUser, userMap, users } from "@/data/users";
import {
  getInteractionActivityImages,
  getPlaceActivityImages,
} from "@/data/activityImages";
import {
  ActivityItem,
  PlaceExperience,
  PlaceInteraction,
  PlaceMarkerBubble,
  RankingEntry,
  SocialPlace,
  User,
} from "@/lib/types";

const CURRENT_USER_ID = currentUser.id;

function isFriend(userId: string) {
  return userId !== CURRENT_USER_ID;
}

function getUniqueFriendIds(placeInteractions: PlaceInteraction[]): string[] {
  const ids = new Set<string>();
  for (const i of placeInteractions) {
    if (isFriend(i.userId)) ids.add(i.userId);
  }
  return Array.from(ids);
}

export function getSocialPlaces(): SocialPlace[] {
  return places
    .map((place) => {
      const placeInteractions = interactions.filter(
        (i) => i.placeId === place.id,
      );
      const friendInteractions = placeInteractions.filter((i) =>
        isFriend(i.userId),
      );

      const friendBeenCount = Math.min(
        1,
        new Set(
          friendInteractions
            .filter((i) => i.type === "BEEN")
            .map((i) => i.userId),
        ).size,
      );

      const friendWantToGoCount = new Set(
        friendInteractions
          .filter((i) => i.type === "WANT_TO_GO")
          .map((i) => i.userId),
      ).size;

      const friendReviewCount = friendInteractions.filter(
        (i) => i.type === "REVIEWED",
      ).length;

      const friendUserIds = getUniqueFriendIds(friendInteractions);
      const friendUsers = friendUserIds
        .map((id) => userMap[id])
        .filter(Boolean) as User[];

      const recentThoughts = friendInteractions
        .filter(
          (i) =>
            i.type === "REVIEWED" ||
            i.type === "WANT_TO_GO" ||
            i.type === "BEEN",
        )
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );

      return {
        ...place,
        friendBeenCount,
        friendWantToGoCount,
        friendReviewCount,
        friendUsers,
        recentThoughts,
      };
    })
    .filter(
      (p) => p.friendBeenCount > 0 || p.friendWantToGoCount > 0,
    );
}

export function getMapPlaces(): SocialPlace[] {
  const featured = new Set<string>(FEATURED_MAP_PLACE_IDS);
  return getSocialPlaces().filter((p) => featured.has(p.id));
}

export function getActivityFeed(): ActivityItem[] {
  return interactions
    .filter((i) => isFriend(i.userId))
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .map((interaction) => ({
      id: interaction.id,
      user: userMap[interaction.userId],
      place: placeMap[interaction.placeId],
      interaction,
    }))
    .filter((item) => item.user && item.place);
}

/** Pin the centred default POI marker’s activity to the top of the feed. */
export function getDefaultMapActivityFeed(): ActivityItem[] {
  return orderActivityFeedForFocusPlace(
    getActivityFeed(),
    DEFAULT_MAP_PLACE_ID,
  );
}

export function orderActivityFeedForFocusPlace(
  items: ActivityItem[],
  focusPlaceId: string,
): ActivityItem[] {
  const markerThought = getPlaceMarkerThought(focusPlaceId);
  if (!markerThought) return items;

  const focusIndex = items.findIndex(
    (item) => item.interaction.id === markerThought.id,
  );
  if (focusIndex <= 0) return items;

  const focusItem = items[focusIndex];
  return [
    focusItem,
    ...items.slice(0, focusIndex),
    ...items.slice(focusIndex + 1),
  ];
}

export function getRanking(): RankingEntry[] {
  const sorted = users
    .map((user) => ({
      user,
      placesVisited: rankingPlacesVisited[user.id] ?? 0,
      isCurrentUser: user.id === CURRENT_USER_ID,
    }))
    .sort((a, b) => b.placesVisited - a.placesVisited)
    .map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));

  return sorted;
}

export function getPlaceFriendComments(placeId: string) {
  return interactions
    .filter(
      (i) =>
        i.placeId === placeId &&
        isFriend(i.userId) &&
        (i.type === "REVIEWED" || i.comment),
    )
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .map((interaction) => ({
      interaction,
      user: userMap[interaction.userId],
    }))
    .filter((item) => item.user);
}

export function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date(DEMO_NOW);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "now";
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;
  return date.toLocaleDateString("en-SG", { month: "short", day: "numeric" });
}

export function getActivityText(interaction: PlaceInteraction): string {
  if (interaction.type === "REVIEWED" && interaction.comment) {
    return interaction.comment;
  }
  if (interaction.type === "BEEN" && interaction.comment) {
    return interaction.comment;
  }
  if (interaction.type === "WANT_TO_GO") return "Want to go";
  if (interaction.type === "BEEN") return "Been here";
  return "";
}

const PLACE_ADDRESSES: Record<string, string> = {
  "latteria-mozzarella": "22 Gemmill Lane, Singapore 069420",
  "burnt-ends": "20 Teck Lim Road, Singapore 088391",
  "ion-orchard": "2 Orchard Turn, Singapore 238801",
  "ps-cafe": "390 Orchard Road, Singapore 238871",
  "dempsey-hill": "8D Dempsey Road, Singapore 249672",
  "common-man-coffee": "22 Martin Road, Singapore 239058",
};

const PLACE_DESCRIPTIONS: Record<string, string> = {
  "latteria-mozzarella":
    "A cozy Italian spot known for fresh burrata, natural wine, and warm corner booths — perfect for a relaxed date night.",
  "burnt-ends":
    "Award-winning barbecue with an open kitchen, smoky flavors, and a lively atmosphere that draws food lovers from across the city.",
  "ion-orchard":
    "Iconic Orchard Road mall with luxury brands, great people-watching, and plenty of spots to grab coffee between shops.",
};

export function getPlaceAddress(placeId: string, category: string): string {
  return (
    PLACE_ADDRESSES[placeId] ??
    `1 Main Street, Singapore · ${category}`
  );
}

export function getPlaceDescription(place: SocialPlace): string {
  const review = place.recentThoughts.find(
    (t) => t.type === "REVIEWED" && t.comment,
  );
  if (review?.comment) return review.comment;

  return (
    PLACE_DESCRIPTIONS[place.id] ??
    `Popular ${place.category.toLowerCase()} spot your friends have been talking about.`
  );
}

export function getPlacePeopleAddedCount(place: SocialPlace): number {
  const ids = new Set(place.friendUsers.map((u) => u.id));
  return Math.max(ids.size, place.friendBeenCount + place.friendWantToGoCount);
}

export function formatPlaceDistance(distance: string): string {
  if (distance === "0m") return "0 m";
  return distance.replace(/(\d)(km|m)/, "$1 $2");
}

/** Stub hours until live POI data is wired up. */
export function getPlaceHours(_placeId: string): string {
  return "9:00 AM – 5:00 PM";
}

export function getPlaceDistanceLabel(distance: string): string {
  if (distance === "0m") return "here";
  return `${formatPlaceDistance(distance)} away`;
}

export function getPlaceBeenFriend(placeId: string): User | null {
  const interaction = interactions
    .filter(
      (i) =>
        i.placeId === placeId && i.type === "BEEN" && isFriend(i.userId),
    )
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )[0];
  if (!interaction) return null;
  return userMap[interaction.userId] ?? null;
}

export function getPlaceBeenFriendForUser(
  placeId: string,
  userId: string,
): User | null {
  const hasBeen = interactions.some(
    (i) =>
      i.placeId === placeId &&
      i.userId === userId &&
      i.type === "BEEN" &&
      isFriend(i.userId),
  );
  if (!hasBeen) return null;
  return userMap[userId] ?? null;
}

/** Single panel experience aligned with the map marker speech bubble. */
export function getPlaceExperienceForMarkerThought(
  thought: PlaceInteraction,
): PlaceExperience | null {
  const user = userMap[thought.userId];
  if (!user || !isFriend(thought.userId)) return null;

  if (thought.type === "REVIEWED" && thought.comment) {
    return {
      user,
      text: thought.comment,
      images: getInteractionActivityImages(thought.id, thought.placeId),
      createdAt: thought.createdAt,
    };
  }

  if (thought.type === "BEEN") {
    return {
      user,
      text:
        thought.comment ??
        "Been here. Stopped by after work and ended up staying longer than planned — cozy vibe, easy to bring friends next time.",
      images: thought.comment
        ? getInteractionActivityImages(thought.id, thought.placeId)
        : getPlaceActivityImages(thought.placeId),
      createdAt: thought.createdAt,
    };
  }

  if (thought.type === "WANT_TO_GO") {
    return {
      user,
      text: "Want to go",
      images: [],
      createdAt: thought.createdAt,
    };
  }

  return null;
}

export function getPlaceBeenFriends(placeId: string): User[] {
  const latestByUser = new Map<string, number>();

  for (const interaction of interactions) {
    if (
      interaction.placeId !== placeId ||
      interaction.type !== "BEEN" ||
      !isFriend(interaction.userId)
    ) {
      continue;
    }
    const at = Date.parse(interaction.createdAt);
    const prev = latestByUser.get(interaction.userId) ?? 0;
    if (at >= prev) latestByUser.set(interaction.userId, at);
  }

  return Array.from(latestByUser.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([id]) => userMap[id])
    .filter(Boolean) as User[];
}

export function getPlaceSavedFriends(placeId: string): User[] {
  const beenUserIds = new Set(
    getPlaceBeenFriends(placeId).map((user) => user.id),
  );
  const userIds = new Set<string>();

  for (const interaction of interactions) {
    if (
      interaction.placeId !== placeId ||
      interaction.type !== "WANT_TO_GO" ||
      !isFriend(interaction.userId) ||
      beenUserIds.has(interaction.userId)
    ) {
      continue;
    }
    userIds.add(interaction.userId);
  }

  return Array.from(userIds)
    .map((id) => userMap[id])
    .filter(Boolean) as User[];
}

/** Unique friends who saved or have been at a place. */
export function getPlaceMarkedUserIds(placeId: string): string[] {
  const latestByUser = new Map<string, number>();

  for (const interaction of interactions) {
    if (
      interaction.placeId !== placeId ||
      (interaction.type !== "WANT_TO_GO" && interaction.type !== "BEEN") ||
      !isFriend(interaction.userId)
    ) {
      continue;
    }
    const at = Date.parse(interaction.createdAt);
    const prev = latestByUser.get(interaction.userId) ?? 0;
    if (at >= prev) latestByUser.set(interaction.userId, at);
  }

  return Array.from(latestByUser.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([id]) => id);
}

function getBestBubbleThoughtForUser(
  placeId: string,
  userId: string,
): PlaceInteraction | undefined {
  const userInteractions = interactions
    .filter(
      (interaction) =>
        interaction.placeId === placeId &&
        interaction.userId === userId &&
        isFriend(interaction.userId),
    )
    .sort(
      (a, b) =>
        Date.parse(b.createdAt) - Date.parse(a.createdAt),
    );

  return (
    userInteractions.find(
      (interaction) => interaction.type === "REVIEWED" && interaction.comment,
    ) ??
    userInteractions.find(
      (interaction) => interaction.type === "BEEN" && interaction.comment,
    ) ??
    userInteractions.find((interaction) => interaction.type === "REVIEWED") ??
    userInteractions.find((interaction) => interaction.type === "BEEN") ??
    userInteractions.find((interaction) => interaction.type === "WANT_TO_GO")
  );
}

/** Map marker bubble: one friend’s story, or “N marked” when several saved/been. */
export function getPlaceMarkerBubble(
  placeId: string,
): PlaceMarkerBubble | null {
  const markedIds = getPlaceMarkedUserIds(placeId);
  const users = markedIds
    .map((id) => userMap[id])
    .filter(Boolean) as User[];

  if (markedIds.length > 1) {
    return { mode: "marked", users, count: markedIds.length };
  }

  if (markedIds.length === 1) {
    const thought = getBestBubbleThoughtForUser(placeId, markedIds[0]);
    if (thought) return { mode: "single", thought };
  }

  return null;
}

/** Primary interaction for panel / activity sync with the map bubble. */
export function getPlaceMarkerThought(
  placeId: string,
): PlaceInteraction | undefined {
  const bubble = getPlaceMarkerBubble(placeId);
  if (!bubble) return undefined;
  if (bubble.mode === "single") return bubble.thought;

  const [primaryUserId] = getPlaceMarkedUserIds(placeId);
  if (!primaryUserId) return undefined;
  return getBestBubbleThoughtForUser(placeId, primaryUserId);
}

/** Friends who saved (WANT_TO_GO) or have been — for place panel aggregates. */
export function getPlaceMarkedFriends(placeId: string): User[] {
  const latestByUser = new Map<string, number>();

  for (const interaction of interactions) {
    if (
      interaction.placeId !== placeId ||
      (interaction.type !== "WANT_TO_GO" && interaction.type !== "BEEN") ||
      !isFriend(interaction.userId)
    ) {
      continue;
    }
    const at = new Date(interaction.createdAt).getTime();
    const prev = latestByUser.get(interaction.userId) ?? 0;
    if (at >= prev) latestByUser.set(interaction.userId, at);
  }

  return Array.from(latestByUser.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([id]) => userMap[id])
    .filter(Boolean) as User[];
}

export function getPlaceExperiences(placeId: string): PlaceExperience[] {
  const placeInteractions = interactions
    .filter((i) => i.placeId === placeId && isFriend(i.userId))
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

  const beenUserIds = new Set(
    placeInteractions
      .filter((i) => i.type === "BEEN")
      .map((i) => i.userId),
  );

  const experiences: PlaceExperience[] = [];

  for (const userId of beenUserIds) {
    const user = userMap[userId];
    if (!user) continue;

    const userInteractions = placeInteractions.filter(
      (i) => i.userId === userId,
    );
    const review = userInteractions.find(
      (i) => i.type === "REVIEWED" && i.comment,
    );

    if (review) {
      experiences.push({
        user,
        text: review.comment!,
        images: getInteractionActivityImages(review.id, placeId),
        createdAt: review.createdAt,
      });
      continue;
    }

    const been = userInteractions.find((i) => i.type === "BEEN");
    if (!been) continue;

    experiences.push({
      user,
      text: "Been here. Stopped by after work and ended up staying longer than planned — cozy vibe, easy to bring friends next time.",
      images: getPlaceActivityImages(placeId),
      createdAt: been.createdAt,
    });
  }

  return experiences
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 5);
}

export {
  beginMapFreshnessSession,
  computeFreshPlaces,
  getFreshnessForPlace,
  getPlaceFreshnessBubble,
  markPlaceFreshnessSeen,
  pickHotspotPlaceId,
} from "@/lib/mapFreshness";
