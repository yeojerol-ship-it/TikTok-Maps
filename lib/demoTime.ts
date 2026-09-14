/** Fixed demo clock — matches activity feed relative times. */
export const DEMO_NOW = "2026-09-09T10:00:00";

export function getDemoNowIso(): string {
  return DEMO_NOW;
}

/** Visit timestamps saved with real clock time sit after mock data; align for the prototype. */
export function normalizeVisitTimestamp(iso: string | null): string | null {
  if (!iso) return null;
  const visitMs = Date.parse(iso);
  const demoMs = Date.parse(DEMO_NOW);
  if (Number.isNaN(visitMs) || Number.isNaN(demoMs)) return iso;
  if (visitMs > demoMs) return DEMO_NOW;
  return iso;
}
