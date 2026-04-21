<div align="center">

# J.A.R.V.I.S.

### *Just A Rather Very Intelligent System.*

**A browser-based AI assistant with voice control, command routing, and a full Iron HUD aesthetic.**

[![Live Site](https://img.shields.io/badge/Live-jarvis--web--alpha.vercel.app-5D98A6?style=for-the-badge&logo=vercel&logoColor=black)](https://jarvis-web-alpha.vercel.app)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Voice UI](https://img.shields.io/badge/Interface-Voice%20%C2%B7%20Text%20%C2%B7%20HUD-5D98A6?style=for-the-badge&labelColor=111111)](https://github.com/TheAlgo7/jarvis-web)

*Originally born as a college project, then rebuilt into the version it should have been: faster, sharper, more theatrical, and far more intentional.*

</div>

---

## Overview

JARVIS is a browser assistant that puts personality and interface design on equal footing with functionality. It runs primarily in the frontend, listens through the Web Speech API, responds through text and voice, and wraps the whole interaction model in an amber-on-black HUD that feels closer to a command deck than a chatbot page.

The point is not just to ask questions. It is to feel like you are operating a system.

## What It Can Do

- **Voice-first interaction** with fallback text input.
- **Utility commands** for search, notes, quick actions, and browser workflows.
- **Weather and lightweight live data** integration.
- **Persistent local notes** without needing a user account.
- **A distinct personality layer** instead of sterile assistant output.

## Quick Start

For the frontend shell:

```bash
git clone https://github.com/TheAlgo7/jarvis-web.git
cd jarvis-web
python -m http.server 8000
```

Open `http://localhost:8000`.

For the full hosted behavior, deploy in an environment that supports the `api/ask.js` serverless endpoint, such as Vercel.

## Project Structure

```text
jarvis-web/
├── index.html
├── style.css
├── app.js
├── config.js
├── api/
│   └── ask.js
├── giphy.gif
└── README.md
```

## Stack

| Layer | Technology |
| --- | --- |
| UI | HTML, CSS, Vanilla JavaScript |
| Voice | Web Speech API |
| Persistence | localStorage |
| Serverless | `api/ask.js` |
| Hosting | Vercel-friendly structure |

## Design Language

- **Iron HUD.** Amber glows, scan-line energy, tactical framing, and high-contrast surfaces.
- **No framework bloat.** The interface stays immediate and lightweight.
- **Personality matters.** This project leans into presence, not generic assistant minimalism.
- **Nostalgia, upgraded.** The original student-project DNA is still there, just treated seriously.

<div align="center">

Built for the version of browser AI that should have looked **cool from the first second**.

</div>
