import { interactions } from "@/data/interactions";
import { currentUser, userMap } from "@/data/users";
import { getDemoNowIso, normalizeVisitTimestamp } from "@/lib/demoTime";
import type {
  PlaceFreshness,
  PlaceFreshnessBubble,
  MapFreshnessSnapshot,
  MapVisitState,
  PlaceInteraction,
  User,
} from "@/lib/types";

const STORAGE_KEY = "social-map-visit-v1";
const CURRENT_USER_ID = currentUser.id;

const FRESH_TYPES = new Set(["BEEN", "WANT_TO_GO", "REVIEWED"]);

function isFriend(userId: string) {
  return userId !== CURRENT_USER_ID;
}

function defaultVisitState(): MapVisitState {
  return { version: 1, lastMapVisitAt: null, placeLastSeenAt: {} };
}

export function loadVisitState(): MapVisitState {
  if (typeof window === "undefined") return defaultVisitState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultVisitState();
    const parsed = JSON.parse(raw) as MapVisitState;
    if (parsed.version !== 1) return defaultVisitState();
    return {
      version: 1,
      lastMapVisitAt: parsed.lastMapVisitAt ?? null,
      placeLastSeenAt: parsed.placeLastSeenAt ?? {},
    };
  } catch {
    return defaultVisitState();
  }
}

export function saveVisitState(state: MapVisitState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* quota / private mode */
  }
}

/** Friend interactions newer than `sinceIso` (exclusive). */
export function computeFreshPlaces(sinceIso: string | null): PlaceFreshness[] {
  if (!sinceIso) return [];

  const sinceMs = Date.parse(sinceIso);
  if (Number.isNaN(sinceMs)) return [];

  const byPlace = new Map<
    string,
    { count: number; latestMs: number; latestIso: string }
  >();

  for (const interaction of interactions) {
    if (!isFriend(interaction.userId)) continue;
    if (!FRESH_TYPES.has(interaction.type)) continue;

    const atMs = Date.parse(interaction.createdAt);
    if (Number.isNaN(atMs) || atMs <= sinceMs) continue;

    const prev = byPlace.get(interaction.placeId);
    if (!prev) {
      byPlace.set(interaction.placeId, {
        count: 1,
        latestMs: atMs,
        latestIso: interaction.createdAt,
      });
      continue;
    }

    prev.count += 1;
    if (atMs > prev.latestMs) {
      prev.latestMs = atMs;
      prev.latestIso = interaction.createdAt;
    }
  }

  return Array.from(byPlace.entries())
    .map(([placeId, stats]) => ({
      placeId,
      newInteractionCount: stats.count,
      latestNewAt: stats.latestIso,
    }))
    .sort((a, b) => {
      if (b.newInteractionCount !== a.newInteractionCount) {
        return b.newInteractionCount - a.newInteractionCount;
      }
      return Date.parse(b.latestNewAt) - Date.parse(a.latestNewAt);
    });
}

/** Read previous visit, persist this entry, return immutable session snapshot. */
export function beginMapFreshnessSession(): MapFreshnessSnapshot {
  const prior = loadVisitState();
  const previousVisitAt = normalizeVisitTimestamp(prior.lastMapVisitAt);
  const sessionStartedAt = getDemoNowIso();

  saveVisitState({
    ...prior,
    lastMapVisitAt: sessionStartedAt,
  });

  return {
    previousVisitAt,
    sessionStartedAt,
    freshPlaces: computeFreshPlaces(previousVisitAt),
  };
}

export function markPlaceFreshnessSeen(
  state: MapVisitState,
  placeId: string,
): MapVisitState {
  const next = {
    ...state,
    placeLastSeenAt: {
      ...state.placeLastSeenAt,
      [placeId]: getDemoNowIso(),
    },
  };
  saveVisitState(next);
  return next;
}

export function getFreshnessForPlace(
  snapshot: MapFreshnessSnapshot,
  placeId: string,
  dismissedPlaceIds: ReadonlySet<string>,
): PlaceFreshness | null {
  if (dismissedPlaceIds.has(placeId)) return null;
  const entry = snapshot.freshPlaces.find((p) => p.placeId === placeId);
  if (!entry || entry.newInteractionCount <= 0) return null;
  return entry;
}

/** Friend interactions at a place since the session baseline. */
export function getFreshInteractionsForPlace(
  sinceIso: string | null,
  placeId: string,
): PlaceInteraction[] {
  if (!sinceIso) return [];

  const sinceMs = Date.parse(sinceIso);
  if (Number.isNaN(sinceMs)) return [];

  return interactions
    .filter(
      (interaction) =>
        interaction.placeId === placeId &&
        isFriend(interaction.userId) &&
        FRESH_TYPES.has(interaction.type) &&
        Date.parse(interaction.createdAt) > sinceMs,
    )
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}

function getFreshUsersForPlace(freshInteractions: PlaceInteraction[]): User[] {
  const latestByUser = new Map<string, number>();

  for (const interaction of freshInteractions) {
    const at = Date.parse(interaction.createdAt);
    const prev = latestByUser.get(interaction.userId) ?? 0;
    if (at >= prev) latestByUser.set(interaction.userId, at);
  }

  return Array.from(latestByUser.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([id]) => userMap[id])
    .filter(Boolean) as User[];
}

/** Bubble payload for a fresh POI; null once dismissed or not fresh. */
export function getPlaceFreshnessBubble(
  snapshot: MapFreshnessSnapshot,
  placeId: string,
  dismissedPlaceIds: ReadonlySet<string>,
): PlaceFreshnessBubble | null {
  const summary = getFreshnessForPlace(snapshot, placeId, dismissedPlaceIds);
  if (!summary) return null;

  const freshInteractions = getFreshInteractionsForPlace(
    snapshot.previousVisitAt,
    placeId,
  );
  const latestInteraction = freshInteractions[0];
  if (!latestInteraction) return null;

  return {
    newInteractionCount: summary.newInteractionCount,
    latestInteraction,
    freshUsers: getFreshUsersForPlace(freshInteractions),
  };
}

export function pickHotspotPlaceId(
  freshPlaces: PlaceFreshness[],
  visiblePlaceIds: ReadonlySet<string>,
  dismissedPlaceIds: ReadonlySet<string>,
): string | null {
  for (const entry of freshPlaces) {
    if (dismissedPlaceIds.has(entry.placeId)) continue;
    if (!visiblePlaceIds.has(entry.placeId)) continue;
    return entry.placeId;
  }
  return null;
}
