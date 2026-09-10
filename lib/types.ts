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

export type SheetTab = "activities" | "ranking";
export type SheetSnap = "collapsed" | "medium" | "expanded";

export interface PlaceExperience {
  user: User;
  text: string;
  images: string[];
  createdAt: string;
}
