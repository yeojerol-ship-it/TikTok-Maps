import { FEATURED_MAP_PLACE_IDS } from "@/data/featuredPlaces";
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
        .filter((i) => i.type === "REVIEWED" || i.type === "WANT_TO_GO")
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
  const now = new Date("2026-09-09T10:00:00");
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
  const interaction = interactions.find(
    (i) =>
      i.placeId === placeId && i.type === "BEEN" && isFriend(i.userId),
  );
  if (!interaction) return null;
  return userMap[interaction.userId] ?? null;
}

export function getPlaceSavedFriends(placeId: string): User[] {
  const userIds = new Set<string>();

  for (const interaction of interactions) {
    if (
      interaction.placeId !== placeId ||
      interaction.type !== "WANT_TO_GO" ||
      !isFriend(interaction.userId)
    ) {
      continue;
    }
    userIds.add(interaction.userId);
  }

  return Array.from(userIds)
    .map((id) => userMap[id])
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
