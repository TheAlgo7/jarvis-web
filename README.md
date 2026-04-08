<div align="center">

# ⚡ J.A.R.V.I.S.

### *Just A Rather Very Intelligent System.*

**A web-based AI assistant that lives in your browser — voice-controlled, personality-driven, built to command.**

[![Live Site](https://img.shields.io/badge/Live%20Site-jarvis--web--alpha.vercel.app-F5A623?style=for-the-badge&logo=vercel&logoColor=black)](https://jarvis-web-alpha.vercel.app)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com)

---

*Originally built as a 2nd-year college major project by Gaurav Kumar & Ameen James — back when AI assistants were a flex, not a commodity. Revived in 2026 with real capabilities.*

</div>

---

## 🧬 What This Is

A vanilla JS voice assistant that runs entirely in the browser — no backend, no API keys, no framework overhead. You speak or type, JARVIS responds with personality and takes action.

The original version was a weekend project: a GIF, a mic button, and an if-else chain that opened Google. This is the version that should have existed.

The revived JARVIS ships with an **Iron HUD aesthetic** — warm amber on near-black, Chakra Petch typography, animated orbital rings, CRT scan lines, and a tactical status display — because if you're going to name something after Tony Stark's AI, it should at least look the part.

Everything runs client-side. Notes persist to `localStorage`. Voice uses the Web Speech API. Weather pulls from `wttr.in`. Zero data leaves your device.

---

## 🌍 Live Demo

**[→ jarvis-web-alpha.vercel.app](https://jarvis-web-alpha.vercel.app)**

Works best on Chrome or Edge — Firefox has limited Web Speech API support.

---

## 🗂️ Project Structure

```
jarvis-web/
├── index.html          → Full HUD layout — status bar, core visualization, conversation log, input
├── style.css           → Iron HUD theme — amber palette, Chakra Petch, scan lines, clip-path elements
├── app.js              → Jarvis class — 20+ commands, speech engine, browser APIs, personality layer
├── giphy.gif           → The original JARVIS core animation from the college project
└── README.md
```

---

## ⚙️ Tech Stack

| Layer | Technology |
|---|---|
| **Language** | Vanilla HTML5 / CSS3 / JavaScript (ES2022) |
| **Architecture** | Class-based JS — no framework, no bundler |
| **Typography** | Google Fonts — Chakra Petch (display), JetBrains Mono (body) |
| **Icons** | Font Awesome 6 |
| **Voice I/O** | Web Speech API — SpeechRecognition + SpeechSynthesis |
| **Weather** | wttr.in (no API key required) |
| **Storage** | localStorage — notes, persistent across sessions |
| **Security** | `crypto.getRandomValues()` for password generation |
| **Deployment** | Vercel |

---

## 🎨 Design Philosophy — *Iron HUD*

The original had cyan-on-dark — the most generic sci-fi palette in existence. This doesn't.

**Color Direction — Amber Tactical**
- Near-black `#070500` base with warm undertones — like the inside of an Iron Man helmet at night
- Amber gold `#F5A623` as the primary — pulled from the suit, not from a design system template
- Warm parchment `#EDD9B0` for readable text — not clinical white
- Ice blue `#4FC3F7` reserved for the listening state — the only cool tone, intentionally contrasting

**Typography — Precision over Generic**
- Chakra Petch for all display text — angular, military-grade, zero Orbitron energy
- JetBrains Mono for body and conversation — built for readability in technical contexts
- Neither font appears in any other project in this portfolio

**Spatial Composition**
- Clip-path `polygon()` on messages, buttons, and input — chopped corners instead of rounded
- Single amber accent bar on the left edge of the status bar — asymmetric, intentional
- SVG tick marks rotating on the outermost ring — functional-looking, not decorative
- CRT scan lines overlaid on both the page and the core GIF — period-accurate to the aesthetic

**Motion**
- Four rings with different radii, speeds, and directions — orbital complexity
- Boot sequence with a real progress bar — not just a fade-in
- Status badge transitions between STANDBY / LISTENING / SPEAKING — text and color shift
- Staggered reveal on all elements after boot — one orchestrated sequence, not scattered

---

## 🧩 Core Commands

### System & Utilities
| Command | What it does |
|---|---|
| `what time is it` | Current time |
| `what is the date` | Full date with weekday |
| `battery status` | Level, charging state, time remaining |
| `network status` | Online/offline, connection type, speed |
| `fullscreen` | Toggles fullscreen mode |
| `generate a password` | 16-char crypto-random password, copies to clipboard |
| `flip a coin` | Heads or tails |
| `roll a dice` | 1–6 |
| `random number between 1 and 100` | Custom range |
| `set timer for 5 minutes` | Browser notification on completion |

### Web & Search
| Command | What it does |
|---|---|
| `open github` | Opens any of 22 recognized sites |
| `search [query]` | Google search |
| `play [video]` | YouTube search |
| `wikipedia [topic]` | Wikipedia article |

### Intelligence
| Command | What it does |
|---|---|
| `what is the weather` | Live weather via wttr.in — temp, feels-like, humidity, wind |
| `calculate 2 + 2` | Math expressions (safe eval) |
| `what is 50 * 12` | Natural math questions |

### Personal
| Command | What it does |
|---|---|
| `save note [text]` | Saves to localStorage |
| `read my notes` | Lists all saved notes with timestamps |
| `clear notes` | Wipes all notes |
| `tell me a joke` | 15 programmer jokes |
| `inspire me` | 12 curated quotes |

### Personality
`who are you` · `who made you` · `how are you` · `thank you` · `goodbye` — JARVIS responds with character. Addresses you as Sir. Varies responses so it doesn't feel scripted.

---

## 📱 How to Use

1. Open the site in Chrome or Edge
2. Wait for the boot sequence to complete
3. Click the mic button or type in the input field
4. Speak or type any command — JARVIS handles it

For voice: the browser will ask for microphone permission on first use.

---

## 🚀 Run Locally

```bash
git clone https://github.com/TheAlgo7/jarvis-web

cd jarvis-web
```

Open `index.html` directly in Chrome or Edge. No build step, no `npm install`, no server required.

> Voice recognition requires a browser context with microphone access. If you're on a local file URL and it fails, serve it with `npx serve .` or VS Code Live Server.

---

<div align="center">

**Built in college. Revived with intention.**

`v2.0` · Iron HUD · April 2026

Originally by **Gaurav Kumar** & **Ameen James**

</div>
