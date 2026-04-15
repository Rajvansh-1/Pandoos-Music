# 🐼 Pandoos Music

A panda-themed, modern music web app built with **vanilla HTML, CSS, and JavaScript modules**.  
It streams real tracks from **Jamendo API** and automatically falls back to local songs when needed.

---

## ✨ Highlights

- Beautiful, responsive panda-themed UI
- Real music streaming via Jamendo API
- Automatic local fallback (`/songs/`) if API is unavailable
- Playlist-based listening experience
- Search with query + genre filters
- Like/favorite system persisted in `localStorage`
- Full playbar controls: play/pause, next/prev, seek, volume, mute, shuffle, repeat
- Song detail overlay + clipboard share action
- Lightweight hash routing (`#home`, `#search`, `#library`, `#playlist:<id>`)
- No framework dependency

---

## 🧱 Tech Stack

- **Frontend:** HTML5, CSS3, JavaScript (ES Modules)
- **Audio:** HTMLAudioElement + Web Audio API (analyser for visualizer)
- **Data Source:** Jamendo API (`https://api.jamendo.com/v3.0`)
- **Fallback Data:** local MP3 files from `/songs/`

---

## 🚀 Quick Start

> This project is static and should be run through a local web server (not by opening `index.html` directly).

### 1) Clone

```bash
git clone https://github.com/Daksh-Mehandiratta/Pandoos-Music.git
cd Pandoos-Music
```

### 2) Start a local server

Use any static server. Example:

```bash
npx serve .
```

Then open the shown URL in your browser.

---

## ⚙️ Configuration

Jamendo client ID is currently set in:

- `src/js/api.js` → `JAMENDO_CLIENT_ID`

If you want to use your own API key, replace that constant.

---

## 📁 Project Structure

```text
Pandoos-Music/
├── index.html
├── src/
│   ├── css/
│   │   ├── variables.css
│   │   ├── base.css
│   │   ├── layout.css
│   │   ├── components.css
│   │   ├── player.css
│   │   └── overlay.css
│   └── js/
│       ├── app.js
│       ├── api.js
│       ├── player.js
│       ├── router.js
│       ├── store.js
│       ├── utils.js
│       └── ui/
│           ├── home.js
│           ├── search.js
│           ├── playlist.js
│           ├── library.js
│           ├── playbar.js
│           ├── sidebar.js
│           ├── topbar.js
│           ├── overlay.js
│           └── visualizer.js
├── songs/
└── assets/
```

---

## 🧠 How It Works

1. App boots from `src/js/app.js`
2. Songs are fetched from Jamendo (`fetchSongs`)
3. If Jamendo fails, local `/songs/` is used
4. State is managed via `src/js/store.js`
5. UI views render based on hash routes
6. Player engine (`src/js/player.js`) controls playback and updates state

---

## 🎵 Music Sources

- **Primary:** Jamendo tracks (with metadata and cover art)
- **Fallback:** local `.mp3` files in `/songs/`

For local mode, place MP3 files in the `songs/` folder and ensure your server can list/access that directory.

---

## 🛠️ Development Notes

- This repository currently has **no configured build/lint/test pipeline**.
- It is designed to run as a direct static web app.
- Keep modules in `src/js` small and feature-focused for maintainability.

---

## 🧩 Troubleshooting

- **No songs showing?**  
  Start via a local server (`npx serve .`), not `file://`.

- **Jamendo not loading?**  
  Check internet access/API availability. App should fallback to local songs.

- **Playback issues on first interaction?**  
  Some browsers require a user gesture before audio context fully activates.

---

## 🤝 Contributing

Contributions are welcome.

1. Fork the repo
2. Create a feature branch
3. Make focused changes
4. Open a pull request

---

## 📜 License

No license file is currently defined in this repository.  
Add a `LICENSE` file if you want to declare usage rights explicitly.

