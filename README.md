# Social Map — Foundation V1

Mobile-first H5 prototype for discovering places through friends.

## Quick start

```bash
npm install
cp .env.local.example .env.local
# Add your Mapbox public token to .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

- **Desktop:** 390×844 phone frame preview
- **Mobile:** Full viewport

## Mapbox token

Get a free public token at [mapbox.com](https://account.mapbox.com/access-tokens/).

Add to `.env.local`:

```
NEXT_PUBLIC_MAPBOX_TOKEN=pk.your_token_here
```

## What's included (Foundation V1)

- Real Mapbox map centered on Singapore
- Social POI markers (emoji + friend avatars + place name + thought bubbles)
- Collapsible bottom sheet with Activities / Social ranking tabs
- Activity feed (people-first, recent friend actions)
- Social ranking with top-3 podium
- Place detail on marker or activity tap
- Mock data: 10 users, 24 places, 59 interactions

## What's next

- Visual polish (markers, sheet, typography)
- Been experience composer
- localStorage persistence
- GPT-generated place images
