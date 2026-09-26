"""README screenshots and hero banner, from the live site.

  python scripts/readme-shots.py            # against production
  BASE=http://localhost:8000 python scripts/readme-shots.py

Needs Python with Playwright and Chrome. Asks JARVIS a few things (one of them
goes to the AI), all in a throwaway browser. Writes docs/readme/*.png. The
folder is in .vercelignore, so none of it is deployed.
"""
import base64, os
from pathlib import Path
from playwright.sync_api import sync_playwright

BASE = os.environ.get('BASE', 'https://jarvis-web-alpha.vercel.app')
OUT = Path('docs/readme')
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

    # Hero: the wordmark, the line, the HUD on a laptop and on a phone.
    img = lambda n: 'data:image/png;base64,' + base64.b64encode((OUT / n).read_bytes()).decode()
    hero = f'''<html><head>
<link href="https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@500;600;700&family=JetBrains+Mono:wght@400;500&display=block" rel="stylesheet">
<style>
body {{ margin: 0; width: 1600px; height: 820px; background: #020608; font-family: 'JetBrains Mono'; color: #D6F3F8; overflow: hidden; position: relative; }}
.grid {{ position: absolute; inset: 0; background-image: linear-gradient(rgba(0,180,216,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,180,216,0.05) 1px, transparent 1px); background-size: 48px 48px; }}
.glow {{ position: absolute; right: -200px; top: -240px; width: 1100px; height: 1100px; border-radius: 50%;
  background: radial-gradient(closest-side, rgba(0,180,216,0.16), rgba(0,180,216,0)); }}
.copy {{ position: absolute; left: 100px; top: 190px; width: 540px; }}
.wm {{ font-family: 'Chakra Petch'; font-weight: 700; font-size: 44px; letter-spacing: 0.18em; color: #19C3E6; }}
h1 {{ margin: 46px 0 0; font-family: 'Chakra Petch'; font-size: 60px; line-height: 1.06; font-weight: 600; letter-spacing: -0.01em; color: #EAFBFF; }}
h1 em {{ font-style: normal; color: #19C3E6; }}
p {{ margin: 28px 0 0; font-size: 20px; line-height: 1.6; color: #8DB3BC; max-width: 34ch; }}
.laptop {{ position: absolute; left: 640px; top: 110px; width: 860px; border-radius: 10px; overflow: hidden;
  border: 1px solid rgba(25,195,230,0.25); box-shadow: 0 50px 110px -40px rgba(0,0,0,0.95), 0 0 60px -20px rgba(25,195,230,0.35); background: #000; }}
.laptop img {{ display: block; width: 100%; }}
.phone {{ position: absolute; left: 1300px; top: 260px; width: 240px; border-radius: 30px; overflow: hidden;
  border: 1px solid rgba(25,195,230,0.30); box-shadow: 0 40px 90px -30px rgba(0,0,0,0.95); background: #000; }}
.phone img {{ display: block; width: 100%; }}
</style></head><body><div class="grid"></div><div class="glow"></div>
<div class="copy"><div class="wm">J.A.R.V.I.S.</div>
<h1>A browser assistant that feels like <em>a command deck.</em></h1>
<p>Voice or text, quick tools, notes and a real AI behind it, in one HUD.</p></div>
<div class="laptop"><img src="{img('desktop-chat.png')}"></div>
<div class="phone"><img src="{img('phone-chat.png')}"></div>
</body></html>'''
    pg = b.new_page(viewport={'width': 1600, 'height': 820})
    pg.set_content(hero, wait_until='networkidle')
    pg.evaluate('document.fonts.ready')
    pg.wait_for_timeout(800)
    pg.screenshot(path=str(OUT / 'hero.png'))
    b.close()
print('written:', sorted(x.name for x in OUT.iterdir()))
