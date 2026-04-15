<div align="center">

# 🐼 Pandoos Music

**A panda-themed music streaming web app — real tracks, zero frameworks, pure vibes.**

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Jamendo API](https://img.shields.io/badge/Jamendo_API-34d399?style=for-the-badge&logo=music&logoColor=white)](https://developer.jamendo.com/v3.0)
[![No Dependencies](https://img.shields.io/badge/Zero_Dependencies-🐼-black?style=for-the-badge)](https://github.com/Daksh-Mehandiratta/Pandoos-Music)

</div>

---

## 🎧 What Is This?

**Pandoos Music** is a fully client-side music player styled around a panda aesthetic.  
It streams real, licensed music from the **Jamendo API** and gracefully falls back to local `.mp3` files when the API isn't reachable — all without a single npm package or build step.

> _"Life is short — relax like a panda and enjoy good music." 🌿_

---

## ✨ Features

| Feature | Details |
|---|---|
| 🎵 Real Music Streaming | Jamendo API — 50 popular tracks on load |
| 🔎 Search + Genres | Live search + genre filter pills (Rock, Pop, Chill, Jazz, Classical, Indie, Folk) |
| 📋 Playlists | Pandoos Picks · Bamboo Chill · Panda Power · Moonlit Melodies · Heart Stash |
| ❤️ Likes | Like any track; persisted in `localStorage` |
| 🔀 Shuffle & 🔁 Repeat | Shuffle queue or cycle None → All → One repeat modes |
| 🎚️ Full Playbar | Play/Pause · Prev/Next · Seek · Volume · Mute |
| 📊 Visualizer | Web Audio API frequency visualizer |
| 🗂️ Song Detail Overlay | Metadata panel with clipboard share |
| 🧭 Hash Router | `#home` · `#search` · `#library` · `#playlist:<id>` |
| 📱 Mobile Ready | Responsive layout with sidebar overlay for small screens |
| 🔋 Persistent State | Volume, last played song, liked songs — all saved across sessions |

---

## 🧱 Tech Stack

```
┌──────────────────────────────────────────────────┐
│                  Pandoos Music                   │
├──────────────────────────────────────────────────┤
│  UI Layer        HTML5 · CSS3 · ES Modules       │
│  Audio Engine    HTMLAudioElement + Web Audio API │
│  State           Custom pub/sub store (store.js) │
│  Routing         Hash-based router (router.js)   │
│  Data            Jamendo API  →  local fallback  │
└──────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

> ⚠️ Run through a local web server — **not** by opening `index.html` directly as a `file://` URL.

**Clone the repo:**

```bash
git clone https://github.com/Daksh-Mehandiratta/Pandoos-Music.git
cd Pandoos-Music
```

**Start a local server** (pick any option):

```bash
# Option A — npx (Node.js required)
npx serve .

# Option B — Python 3
python3 -m http.server 8080

# Option C — VS Code Live Server
# Install the "Live Server" extension, then click "Go Live"
```

Open the printed URL in your browser and enjoy 🐼🎵

---

## ⚙️ Configuration

The Jamendo public client ID lives in one place:

```js
// src/js/api.js
const JAMENDO_CLIENT_ID = 'b6747d04';   // ← replace with your own key
```

Get a free key at [developer.jamendo.com](https://developer.jamendo.com/v3.0).

---

## 📁 Project Structure

```
Pandoos-Music/
├── index.html              ← App shell (JS-rendered)
├── assets/                 ← Logo, favicon, images
├── songs/                  ← Local MP3 fallback files
├── src/
│   ├── css/
│   │   ├── variables.css   ← Design tokens & CSS custom properties
│   │   ├── base.css        ← Reset & global styles
│   │   ├── layout.css      ← Sidebar / main / playbar layout
│   │   ├── components.css  ← Cards, buttons, badges…
│   │   ├── player.css      ← Playbar & player controls
│   │   └── overlay.css     ← Song detail overlay
│   └── js/
│       ├── app.js          ← Bootstrap & orchestration
│       ├── api.js          ← Jamendo fetchers + local fallback
│       ├── player.js       ← Audio engine (play/pause/seek/shuffle…)
│       ├── router.js       ← Hash-based client router
│       ├── store.js        ← Reactive state + pub/sub
│       ├── utils.js        ← Helpers (debounce, formatTime, …)
│       ├── assets.js       ← Inline SVG icon constants
│       └── ui/
│           ├── home.js     ← Home view
│           ├── search.js   ← Search & genre filter view
│           ├── playlist.js ← Playlist detail view
│           ├── library.js  ← Library overview
│           ├── playbar.js  ← Bottom playbar component
│           ├── sidebar.js  ← Sidebar navigation
│           ├── topbar.js   ← Top bar + toast notifications
│           ├── overlay.js  ← Song detail overlay
│           └── visualizer.js ← Web Audio frequency bars
└── style.css               ← Legacy styles (v1 prototype)
```

---

## 🧠 How It Works

```
DOMContentLoaded
      │
      ▼
 bootstrap()               ← app.js
      │
      ├─ Init UI shells     ← sidebar, topbar, playbar, overlay
      ├─ Init views         ← home, search, playlist, library
      ├─ Init router        ← listens to hashchange
      │
      ├─ fetchSongs()       ← api.js
      │     ├─ Jamendo API  (primary, 50 tracks)
      │     └─ /songs/      (fallback, local MP3s)
      │
      ├─ setState()         ← store.js reactive update
      ├─ initPlayer()       ← player.js audio engine
      ├─ initVisualizer()   ← Web Audio API
      └─ renderView()       ← route → home / search / library / playlist
```

---

## 🎵 Adding Local Songs

1. Drop `.mp3` files into the `songs/` folder.
2. Start the local server — the app automatically discovers them.
3. Local files are used as fallback when Jamendo is unreachable.

---

## 🧩 Troubleshooting

| Problem | Fix |
|---|---|
| **No songs showing** | Use `npx serve .`, never `file://` |
| **Jamendo not loading** | Check network — app auto-falls back to local songs |
| **No audio on first click** | Normal browser behaviour — Web Audio needs a user gesture to start |
| **Cover art missing** | Local songs have no cover art; a gradient placeholder is shown |

---

## 🤝 Contributing

Contributions and improvements are welcome!

1. **Fork** this repo
2. **Create** a feature branch: `git checkout -b feat/my-feature`
3. **Commit** with a clear message: `git commit -m "feat: add my feature"`
4. **Push** and open a **Pull Request**

Please keep PRs focused — one feature or fix per PR.

---

## 📜 License

No license is currently defined in this repository.  
If you fork or distribute this project, consider adding a `LICENSE` file (e.g. MIT or Apache 2.0).

---

<div align="center">
  Made with ❤️ and 🐼 energy by <a href="https://github.com/Daksh-Mehandiratta">Daksh Mehandiratta</a>
</div>

