export type InteractionType = "BEEN" | "WANT_TO_GO" | "REVIEWED";

export interface User {
  id: string;
  name: string;
  avatar: string;
  placesVisited: number;
}

export interface Place {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  category: string;
  emoji: string;
  image: string;
  rating: number;
  distance: string;
}

export interface PlaceInteraction {
  id: string;
  userId: string;
  placeId: string;
  type: InteractionType;
  comment?: string;
  createdAt: string;
}

export interface SocialPlace extends Place {
  friendBeenCount: number;
  friendWantToGoCount: number;
  friendReviewCount: number;
  friendUsers: User[];
  recentThoughts: PlaceInteraction[];
}

export interface ActivityItem {
  id: string;
  user: User;
  place: Place;
  interaction: PlaceInteraction;
}

export interface RankingEntry {
  user: User;
  rank: number;
  placesVisited: number;
  isCurrentUser?: boolean;
}

/** Friend avatar pinned on the map while the Ranking tab is active. */
export interface RankingMapAvatar {
  id: string;
  user: User;
  rank: number;
  latitude: number;
  longitude: number;
  /** BEEN check-ins in this user's region cluster. */
  checkInCount: number;
  isCurrentUser?: boolean;
  /** Set when a top-3 user has multiple regional markers. */
  placeId?: string;
}

export type SheetTab = "activities" | "ranking";
export type SheetSnap = "collapsed" | "medium" | "expanded";

export interface PlaceExperience {
  user: User;
  text: string;
  images: string[];
  createdAt: string;
  /** Whole-star rating shown on the thread (1–5). */
  rating?: number;
  commentCount?: number;
  likeCount?: number;
}

export type PlaceMarkerBubble =
  | { mode: "single"; thought: PlaceInteraction }
  | { mode: "marked"; users: User[]; count: number };

export interface MapVisitState {
  version: 1;
  lastMapVisitAt: string | null;
  placeLastSeenAt: Record<string, string>;
}

export interface PlaceFreshness {
  placeId: string;
  newInteractionCount: number;
  latestNewAt: string;
}

export interface PlaceFreshnessBubble {
  newInteractionCount: number;
  latestInteraction: PlaceInteraction;
  freshUsers: User[];
}

/** Immutable freshness computed once per map entry. */
export interface MapFreshnessSnapshot {
  previousVisitAt: string | null;
  sessionStartedAt: string;
  freshPlaces: PlaceFreshness[];
}
