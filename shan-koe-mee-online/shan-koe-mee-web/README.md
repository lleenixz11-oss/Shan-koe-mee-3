# Shan Koe Mee Multiplayer Web Prototype

A working 2–6 player Socket.IO room demo using **virtual display-only chips**. No money or betting features.

## Run

Requires Node.js 18+.

```bash
npm install
npm start
```

Open `http://localhost:3000` in two browser tabs, enter different names and the same room code, mark both ready, and use the host controls to deal and reveal.

## Scope and limitations

This is an original **simplified two-card points prototype**, not the full Shan Koe Mee rules. A=1, 2–9 face value, 10/J/Q/K=0, score modulo 10. Highest score wins; ties allowed. It does not implement authentic special hands, optional third cards, betting, persistent accounts, bot players, reconnection, or chip transfers. Rooms are held in memory and reset on server restart. The room host is the first connected player.

## Deployment

Requires a Node.js hosting environment supporting long-running processes and WebSockets. Shared PHP-only hosting is insufficient. Configure HTTPS and a reverse proxy for production. For real production use add persistent sessions, authentication, cryptographically secure deck shuffle, server-side anti-abuse controls, rate limits, and proper rule verification.

## Play online without localhost (Render)

1. Upload the contents of this folder to a GitHub repository (keep `package.json`, `server.js`, `render.yaml`, and `public/` at the repository root).
2. At https://dashboard.render.com choose **New > Web Service**, connect the GitHub repository.
3. Choose Node runtime, build command `npm install`, start command `npm start`, and a plan available to your account. Render reads `PORT` automatically; the server already uses it.
4. Deploy and open the HTTPS `*.onrender.com` URL Render gives you. Share the **same URL and room code** with other players.
5. Optional: add your own domain in Render's Custom Domains settings and follow the DNS instructions displayed there.

The free instance may sleep when inactive and take time to wake. Rooms are memory-only and disappear on restart, and multiple server instances will not share rooms. This demo is not production-hardened. Never put passwords or payment credentials into this project.
