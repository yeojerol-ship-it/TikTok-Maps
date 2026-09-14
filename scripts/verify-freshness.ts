/**
 * Deterministic checks for map freshness ranking and session baseline.
 * Run: npx tsx scripts/verify-freshness.ts
 */
import { DEMO_NOW } from "../lib/demoTime";
import { computeFreshPlaces } from "../lib/mapFreshness";

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

// First visit — no previous timestamp means no freshness.
assert(
  computeFreshPlaces(null).length === 0,
  "first visit should produce zero fresh places",
);

// Baseline before all mock interactions.
const beforeAll = computeFreshPlaces("2026-09-08T00:00:00");
assert(beforeAll.length > 0, "interactions after baseline should be fresh");

const commonMan = beforeAll.find((p) => p.placeId === "common-man-coffee");
assert(Boolean(commonMan), "common-man-coffee should be fresh");
assert(
  (commonMan?.newInteractionCount ?? 0) >= 3,
  "common-man-coffee should count raw friend interactions",
);

// Ranking: highest count first, tie-break by newest activity.
const sorted = [...beforeAll].sort((a, b) => {
  if (b.newInteractionCount !== a.newInteractionCount) {
    return b.newInteractionCount - a.newInteractionCount;
  }
  return Date.parse(b.latestNewAt) - Date.parse(a.latestNewAt);
});
assert(
  beforeAll[0]?.placeId === sorted[0]?.placeId,
  "computeFreshPlaces should return pre-sorted results",
);

// Narrow window — only newer interactions count.
const narrow = computeFreshPlaces("2026-09-09T09:00:00");
assert(
  narrow.every((p) => p.newInteractionCount >= 1),
  "narrow window should still include places with newer activity",
);

// Return visit after demo baseline — featured map POIs should surface.
const returnVisit = computeFreshPlaces(DEMO_NOW);
assert(returnVisit.length >= 4, "return visit should surface multiple fresh map POIs");
assert(returnVisit.length >= 4, "return visit should surface multiple fresh map POIs");
assert(
  returnVisit.some((place) => place.placeId === "latteria-mozzarella"),
  "latteria-mozzarella should appear in fresh places",
);

console.log("verify-freshness: all checks passed");
