# 🎮 Nova Arcade — Unblocked Games Portal

A fast, fully client-side unblocked games portal. No backend, no logins, no downloads — just static files you can host anywhere (GitHub Pages, Netlify, Cloudflare Pages, or even a USB stick).

## Features
- 🐍 **8 built-in games** (Snake, 2048, Breakout, Flappy, Pong, Minesweeper, Blockfall, Reaction Test) — all bundled, zero external dependencies
- 🔍 Instant search + category filters
- ⭐ Favorites and high scores saved in localStorage
- 🕶️ **Tab cloaking** — disguise the tab as Google Classroom, Drive, Docs, Gmail, or Canvas
- 🚀 **URL launcher** — open any game URL inside the portal
- ⛶ Fullscreen player with restart
- 📱 Responsive — works on Chromebooks, laptops, and phones

## Run locally
Just open `index.html` in a browser, or:
```bash
npx serve .
```

## Deploy to GitHub Pages
1. Push this repo to GitHub
2. Settings → Pages → Source: `main` branch, `/ (root)`
3. Your site goes live at `https://<username>.github.io/<repo>/`

## Add games
Edit `games.js` — add a builtin entry or an `embed` entry with any external game URL:

```js
{id:'mygame', name:'My Game', cat:'Arcade', emoji:'🎮', type:'embed', url:'https://example.com/game'}
```

## License
MIT — fork it, remix it, make it yours.
