"""README screenshots, from the live site.

  python scripts/readme-shots.py            # against production
  BASE=http://localhost:8000 python scripts/readme-shots.py

Needs Python with Playwright and Chrome. Asks JARVIS a few things (one of them
goes to the AI), all in a throwaway browser. Writes docs/readme/src/assets/*.png; the README Kit
(Work/Playbooks/README Kit/render.py) draws docs/readme/*.webp from them. The
folder is in .vercelignore, so none of it is deployed.
"""
import base64, os
from pathlib import Path
from playwright.sync_api import sync_playwright

BASE = os.environ.get('BASE', 'https://jarvis-web-alpha.vercel.app')
OUT = Path('docs/readme/src/assets')
OUT.mkdir(parents=True, exist_ok=True)
UA = 'Mozilla/5.0 (Linux; Android 16; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Mobile Safari/537.36'


def ask(page, text, wait=2500):
    page.locator('#textInput').fill(text)
    page.locator('#sendBtn').click()
    page.wait_for_timeout(wait)


with sync_playwright() as p:
    b = p.chromium.launch(channel='chrome')

    desk = b.new_context(viewport={'width': 1440, 'height': 900}, device_scale_factor=1.5)
    d = desk.new_page()
    d.goto(BASE, wait_until='networkidle'); d.wait_for_timeout(6000)  # the boot sequence
    ask(d, 'what time is it')
    ask(d, 'tell me a joke')
    ask(d, 'In two sentences, what would you check first before a long drive?', 9000)
    d.screenshot(path=str(OUT / 'desktop-chat.png'))
    desk.close()

    mob = b.new_context(viewport={'width': 393, 'height': 852}, device_scale_factor=2, user_agent=UA, is_mobile=True, has_touch=True)
    m = mob.new_page()
    m.goto(BASE, wait_until='networkidle'); m.wait_for_timeout(1500)
    m.screenshot(path=str(OUT / 'boot.png'))
    m.wait_for_timeout(5000)
    m.screenshot(path=str(OUT / 'phone.png'))
    ask(m, 'Give me a one-line status report, JARVIS.', 9000)
    m.screenshot(path=str(OUT / 'phone-chat.png'))
    mob.close()

    b.close()
print('written:', sorted(x.name for x in OUT.iterdir()))
