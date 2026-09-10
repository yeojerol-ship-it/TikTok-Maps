# Podium ribbon ranking (archived)

Saved snapshot of the ribbon-style TOP 3 podium ranking UI.

## Restore

1. Copy `PodiumRibbon.tsx` and `RankingPodium.tsx` back to `components/Ranking/`.
2. Replace `Ranking.tsx` with `Ranking.with-podium.tsx`.
3. Import `podium.css` in `app/layout.tsx` or merge styles into `app/globals.css`.
4. In `SocialMapApp.tsx`, set `surfaceClassName={isRankingView ? "ranking-panel-gradient" : undefined}` on `BottomSheet`.

## Files

- `PodiumRibbon.tsx` — SVG ribbon cards
- `RankingPodium.tsx` — 2nd · 1st · 3rd layout
- `Ranking.with-podium.tsx` — list rows 4+ below podium
- `podium.css` — panel gradient + ribbon styles
