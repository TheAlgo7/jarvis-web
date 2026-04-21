# JARVIS Web

A browser-based AI assistant interface inspired by the idea of a voice-first desktop companion. This project combines a stylized frontend, assistant personality, and a lightweight API surface to create a more theatrical browser assistant experience.

## Core idea

JARVIS Web is built to feel conversational and command-driven, not like a plain chatbot wrapper. The repo focuses on interface, interaction, and the feeling of talking to a digital assistant directly from the browser.

## Stack

- HTML
- CSS
- Vanilla JavaScript
- Vercel-style serverless API endpoint in `api/`

## Project layout

- `index.html` - main UI shell
- `style.css` - presentation layer
- `app.js` - client behavior and assistant interaction logic
- `config.js` - app configuration surface
- `api/ask.js` - backend endpoint for assistant requests

## Local development

There is no package manifest in the repo root, so local usage depends on what you want to test:

1. For UI-only iteration, serve the project root as a static site and open `index.html`.
2. For the full assistant flow, run it in an environment that can execute the `api/ask.js` endpoint, such as a Vercel-compatible local workflow.
3. Keep local secrets in `.env.local` or `.env`, not in source.

## Notes

- This repo appears to be the revived continuation of an older college-era assistant project.
- The codebase is small enough to stay easy to reason about, which suits experimentation and fast frontend iteration.
