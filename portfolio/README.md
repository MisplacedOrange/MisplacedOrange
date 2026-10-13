# Roy Lu's portfolio

A personal portfolio with a short biography and selected-project rows styled after [Dun Li Chan's site](https://dunlichan.com/#index). The `entity-link` class gives project and company links pastel orange highlights; navigation and profile links stay neutral. Unboxed social icons follow [Kyaw's site](https://kyswtn.com/) and stay fixed at the bottom left. Uses a dark theme. The supplied 卢 SVG is the favicon.

## Run locally

Typography uses VS Code's Windows editor font stack: Consolas, Courier New, monospace.

```bash
npm install
npm run dev
```

Open `http://127.0.0.1:5173/`. Run `npm run build` to generate the production site in `dist/`.

## Visit counter

The counter beside Roy Lu uses [CounterAPI](https://counterapi.com/#options) to store a shared total under `misplacedorange.me/view/portfolio`. Page loads on `misplacedorange.me` and `www.misplacedorange.me` record a visit. Local and other preview domains only read the total. The service applies its own duplicate and bot filtering, so this is an approximate visit count, not a count of unique people. If the service is unavailable, the counter displays a dash.
