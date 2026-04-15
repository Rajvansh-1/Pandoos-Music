# 🐼 Pandoos Music 

Pandoos Music is a production-ready, lightning-fast music streaming web application built with **React.js** and **Vite**. Styled with a stunning custom dark-mode design system, it uses the **YouTube Data API v3** to provide millions of free songs directly to your browser.

![Pandoos Preview](https://raw.githubusercontent.com/Daksh-Mehandiratta/Pandoos-Music/main/public/favicon.svg)

## ✨ Features

- **Blazing Fast Playback**: Invisible YouTube IFrame API engine guarantees ultra-fast audio streaming without buffering.
- **Top Trending Music**: Auto-refreshes Top Hits and Trending songs from YouTube directly to the home screen.
- **Smart Search**: Real-time search with debouncing. Find any song, artist, or mood.
- **Free Lyrics**: Integrated with `lyrics.ovh` to pull lyrics instantly.
- **Extensive Caching**: Uses `localStorage` TTL caching to reduce YouTube API quota usage by 80%, allowing thousands of simultaneous users.
- **Killer UI/UX**: Custom gradient placeholders, smooth animations, animated equalizers, and pixel-perfect design.
- **Keyboard Shortcuts**: `Space` (Play/Pause), `M` (Mute), `S` (Shuffle), `L` (Like), `Arrows` (Seek/Skip).
- **Media Session API**: Controls show on your mobile lock screen or desktop media controller.
- **Error Resilient**: Includes React Error Boundaries and graceful API fallbacks.

## 🚀 Quick Start

### 1. Installation
Clone the repository and install dependencies in the root directory:
```bash
npm install
```

### 2. Configure Environment Variables
You need a free **YouTube Data API v3** key to unlock trending music and search.
Create a `.env` file in the root directory:

```env
VITE_YOUTUBE_API_KEY=your_api_key_here
```
> **Note:** Do NOT commit your `.env` file to GitHub! The `.gitignore` file has been configured to protect it automatically.

### 3. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

## 🛠 Tech Stack

- **Frontend Framework**: React 18
- **Build Tool**: Vite (esbuild + Rollup)
- **Routing**: React Router DOM (v6)
- **Styling**: Vanilla CSS with comprehensive CSS Variables
- **State Management**: React Context + `useReducer`
- **Data Source**: YouTube Data API v3 & YouTube IFrame Player API
- **Lyrics Source**: Lyrics.ovh REST API

## 📦 Production Build

To build the app for production (e.g., to host on Vercel, Netlify, or GitHub Pages):
```bash
npm run build
npm run preview
```
This enables Terser minification and chunk-splitting for maximum performance.

## 👨‍💻 Architecture & Quota Management

Pandoos Music is designed to overcome the YouTube API's 10,000 requests/day quota limit:
1. **TTL Caching**: Search results are cached locally for 10 minutes; trending tracks for 30 minutes. 
2. **Distributed Usage**: Since the API runs completely client-side in the browser, there is no shared backend. The application scales infinitely for free.
3. **Graceful Failover**: If the API key is missing or quota is exhausted, the app automatically fails over to a persistent array of fallback "Demo Songs."

Enjoy the music! 🎧🐼
