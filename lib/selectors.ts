import { DEMO_NOW } from "@/lib/demoTime";
import {
  DEFAULT_MAP_PLACE_ID,
  FEATURED_MAP_PLACE_IDS,
  MINOR_MAP_PLACE_IDS,
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
  RankingMapAvatar,
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
  const onMap = new Set<string>([
    ...FEATURED_MAP_PLACE_IDS,
    ...MINOR_MAP_PLACE_IDS,
  ]);
  return getSocialPlaces().filter((p) => onMap.has(p.id));
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

/** Places on the map with friend activity landing in the "now" bucket. */
export function getNewMapActivityCount(): number {
  const freshPlaceIds = new Set(
    getDefaultMapActivityFeed()
      .filter((item) => formatRelativeTime(item.interaction.createdAt) === "now")
      .map((item) => item.place.id),
  );

  return freshPlaceIds.size;
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

/** Singapore districts used when a ranking user has no BEEN check-ins on record. */
const RANKING_FALLBACK_REGIONS: ReadonlyArray<readonly [number, number]> = [
  [1.304, 103.834], // Orchard
  [1.282, 103.858], // Marina Bay
  [1.286, 103.844], // Chinatown
  [1.301, 103.856], // Bugis
  [1.318, 103.706], // Jurong West
  [1.352, 103.945], // Tampines
  [1.372, 103.845], // Bishan
  [1.265, 103.822], // Sentosa
  [1.344, 103.835], // MacRitchie
  [1.312, 103.763], // Clementi
];

/** ~650 m minimum separation at Singapore latitude (zoom 11.3 overview). */
const MIN_RANKING_AVATAR_SEPARATION_DEG = 0.006;
const TOP3_MAX_MAP_MARKERS = 3;
/** ~200–800 m jitter in degrees at Singapore latitude. */
const JITTER_RADIUS_MIN_DEG = 0.0018;
const JITTER_RADIUS_MAX_DEG = 0.0072;
const SINGAPORE_LAT_RAD = (1.3 * Math.PI) / 180;

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return hash;
}

/** Deterministic pseudo-random offset from userId (+ optional placeId). */
function jitterOffsetForAvatar(
  userId: string,
  placeId?: string,
): { lat: number; lng: number } {
  const seed = hashString(`${userId}:${placeId ?? ""}`);
  const angle = ((seed & 0xffff) / 0xffff) * 2 * Math.PI;
  const t = ((seed >>> 16) & 0xff) / 255;
  const radius =
    JITTER_RADIUS_MIN_DEG + t * (JITTER_RADIUS_MAX_DEG - JITTER_RADIUS_MIN_DEG);
  return {
    lat: Math.sin(angle) * radius,
    lng: (Math.cos(angle) * radius) / Math.cos(SINGAPORE_LAT_RAD),
  };
}

function geoDistanceDeg(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const dLat = lat2 - lat1;
  const dLng = (lng2 - lng1) * Math.cos((lat1 * Math.PI) / 180);
  return Math.hypot(dLat, dLng);
}

/** Greedy pick of geographically spread places for top-3 map markers. */
function selectSpreadPlaceIds(
  placeIds: Iterable<string>,
  maxCount: number,
): string[] {
  const candidates = Array.from(placeIds)
    .map((id) => ({ id, place: placeMap[id] }))
    .filter((entry): entry is { id: string; place: NonNullable<typeof placeMap[string]> } =>
      Boolean(entry.place),
    );

  if (candidates.length <= maxCount) {
    return candidates.map((entry) => entry.id);
  }

  const selected: string[] = [candidates[0].id];

  while (selected.length < maxCount) {
    let bestId = candidates.find((entry) => !selected.includes(entry.id))!.id;
    let bestMinDist = -1;

    for (const candidate of candidates) {
      if (selected.includes(candidate.id)) continue;

      let minDist = Infinity;
      for (const selectedId of selected) {
        const selectedPlace = placeMap[selectedId]!;
        minDist = Math.min(
          minDist,
          geoDistanceDeg(
            candidate.place.latitude,
            candidate.place.longitude,
            selectedPlace.latitude,
            selectedPlace.longitude,
          ),
        );
      }

      if (minDist > bestMinDist) {
        bestMinDist = minDist;
        bestId = candidate.id;
      }
    }

    selected.push(bestId);
  }

  return selected;
}

function pushAwayFromPlaced(
  latitude: number,
  longitude: number,
  placed: ReadonlyArray<{ latitude: number; longitude: number }>,
  minSeparation: number,
  avatarId: string,
): { latitude: number; longitude: number } {
  let lat = latitude;
  let lng = longitude;
  const fallbackAngle =
    ((hashString(avatarId) & 0xffff) / 0xffff) * 2 * Math.PI;

  for (let attempt = 0; attempt < 32; attempt += 1) {
    let adjusted = false;

    for (const anchor of placed) {
      const dist = geoDistanceDeg(lat, lng, anchor.latitude, anchor.longitude);
      if (dist >= minSeparation) continue;

      const push = minSeparation - dist + 0.0003;
      const dLat = lat - anchor.latitude;
      const dLng = (lng - anchor.longitude) * Math.cos((lat * Math.PI) / 180);
      const magnitude = Math.hypot(dLat, dLng);

      if (magnitude < 1e-9) {
        lat += Math.sin(fallbackAngle) * push;
        lng +=
          (Math.cos(fallbackAngle) * push) /
          Math.cos((lat * Math.PI) / 180);
      } else {
        lat += (dLat / magnitude) * push;
        lng +=
          (dLng / magnitude / Math.cos((lat * Math.PI) / 180)) * push;
      }
      adjusted = true;
    }

    if (!adjusted) break;
  }

  return { latitude: lat, longitude: lng };
}

function beenPlaceIdsForUser(userId: string): Set<string> {
  const ids = new Set<string>();
  for (const interaction of interactions) {
    if (interaction.userId === userId && interaction.type === "BEEN") {
      ids.add(interaction.placeId);
    }
  }
  return ids;
}

function centroidForPlaceIds(placeIds: Iterable<string>): {
  latitude: number;
  longitude: number;
} | null {
  let sumLat = 0;
  let sumLng = 0;
  let count = 0;
  for (const placeId of placeIds) {
    const place = placeMap[placeId];
    if (!place) continue;
    sumLat += place.latitude;
    sumLng += place.longitude;
    count += 1;
  }
  if (count === 0) return null;
  return { latitude: sumLat / count, longitude: sumLng / count };
}

/**
 * Ranking map avatars. Top 3 users get one marker per BEEN check-in region;
 * everyone else stays a single centroid marker.
 */
export function getRankingMapAvatars(): RankingMapAvatar[] {
  const ranking = getRanking();
  const rawAvatars: RankingMapAvatar[] = [];

  for (const [index, entry] of ranking.entries()) {
    const userId = entry.user.id;
    const beenPlaceIds = beenPlaceIdsForUser(userId);
    const checkInCount = beenPlaceIds.size;

    if (entry.rank <= 3 && checkInCount > 0) {
      const spreadPlaceIds = selectSpreadPlaceIds(
        beenPlaceIds,
        TOP3_MAX_MAP_MARKERS,
      );
      for (const placeId of spreadPlaceIds) {
        const place = placeMap[placeId];
        if (!place) continue;
        const jitter = jitterOffsetForAvatar(userId, placeId);
        rawAvatars.push({
          id: `${userId}-${placeId}`,
          user: entry.user,
          rank: entry.rank,
          latitude: place.latitude + jitter.lat,
          longitude: place.longitude + jitter.lng,
          checkInCount,
          isCurrentUser: entry.isCurrentUser,
          placeId,
        });
      }
      continue;
    }

    const centroid = centroidForPlaceIds(beenPlaceIds);
    const [fallbackLat, fallbackLng] =
      RANKING_FALLBACK_REGIONS[index % RANKING_FALLBACK_REGIONS.length];
    const jitter = jitterOffsetForAvatar(userId);

    rawAvatars.push({
      id: userId,
      user: entry.user,
      rank: entry.rank,
      latitude: (centroid?.latitude ?? fallbackLat) + jitter.lat,
      longitude: (centroid?.longitude ?? fallbackLng) + jitter.lng,
      checkInCount,
      isCurrentUser: entry.isCurrentUser,
    });
  }

  const placed: Array<{ latitude: number; longitude: number }> = [];
  const avatars: RankingMapAvatar[] = [];

  const shuffled = [...rawAvatars].sort(
    (a, b) => hashString(a.id) - hashString(b.id),
  );

  for (const avatar of shuffled) {
    const adjusted = pushAwayFromPlaced(
      avatar.latitude,
      avatar.longitude,
      placed,
      MIN_RANKING_AVATAR_SEPARATION_DEG,
      avatar.id,
    );
    placed.push(adjusted);
    avatars.push({ ...avatar, ...adjusted });
  }

  return avatars;
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
  "rappu-sushi": "22 Gemmill Lane, Singapore 069420",
  "burnt-ends": "20 Teck Lim Road, Singapore 088391",
  "ion-orchard": "2 Orchard Turn, Singapore 238801",
  "ps-cafe": "390 Orchard Road, Singapore 238871",
  "dempsey-hill": "8D Dempsey Road, Singapore 249672",
  "common-man-coffee": "22 Martin Road, Singapore 239058",
};

const PLACE_DESCRIPTIONS: Record<string, string> = {
  "rappu-sushi":
    "Intimate omakase counter with fresh daily catches — a relaxed spot for sushi and sake with friends.",
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

/** Stub review count label matching Figma POI meta. */
export function getPlaceReviewCountLabel(_placeId: string): string {
  return "(1.8K)";
}

/** Stub price level for POI meta line. */
export function getPlacePriceLevel(category: string): string {
  if (category === "Restaurant" || category === "Cafe") return "$$$";
  if (category === "Shopping") return "$$";
  return "$";
}

/** Category label used in POI meta (Figma: “Korean shop”). */
export function getPlaceCategoryLabel(category: string): string {
  if (category === "Restaurant") return "Korean shop";
  if (category === "Cafe") return "Cafe";
  return category;
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
      rating: 4,
      commentCount: 12,
      likeCount: 6,
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
      rating: thought.comment ? 4 : undefined,
      commentCount: thought.comment ? 12 : undefined,
      likeCount: thought.comment ? 6 : undefined,
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

/**
 * Marker label under the pill: who acted and how, e.g. "Michelle posted",
 * "Cody saved", "2 friends marked" (Figma node 2969:18742).
 */
export function getPlaceMarkerCaption(placeId: string): string | null {
  const bubble = getPlaceMarkerBubble(placeId);
  if (!bubble) return null;

  if (bubble.mode === "marked") {
    return `${bubble.count} friends marked`;
  }

  const user = userMap[bubble.thought.userId];
  if (!user) return null;

  if (bubble.thought.type === "WANT_TO_GO") return `${user.name} saved`;
  if (bubble.thought.comment) return `${user.name} posted`;
  return `${user.name} been here`;
}

/** Friends shown as avatars inside the marker pill. */
export function getPlaceMarkerAvatarUsers(placeId: string): User[] {
  const bubble = getPlaceMarkerBubble(placeId);
  if (!bubble) return [];
  if (bubble.mode === "marked") return bubble.users;

  const user = userMap[bubble.thought.userId];
  return user ? [user] : [];
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
        rating: 4,
        commentCount: 12,
        likeCount: 6,
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
      rating: 4,
      commentCount: 12,
      likeCount: 6,
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
