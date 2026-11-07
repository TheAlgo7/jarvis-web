// J.A.R.V.I.S.'s README pictures, drawn by the README Kit (Work\Playbooks\README Kit\render.py).
// Every wide picture has a "-mobile" twin that the README swaps in on screens up to 600 px.
// The screens come from scripts/readme-shots.py: the live app, phones at 393x852 and 2x, the
// desktop at 1080x675 and 2x, asked real questions through its own proxy.
const CYAN = '#3fd2ea', INK = '#e6f7fb';
const HUD = (at, glow = '#06323d') => `radial-gradient(820px 640px at ${at}, ${glow} 0%, rgba(2,8,10,0) 70%), #02080a`;
const P = (src, x, y, w, rot = 0, z = 20, glow = null) => ({ type: 'phone', src, x, y, w, rot, z, glow, bar: true, barBg: '#02080a', barColor: '#cfeff5' });
const wideLine = { width: 20, color: CYAN, points: [[-40, 712], [400, 690], [800, 730], [1640, 650]] };
const tallLine = (y) => ({ width: 26, color: CYAN, points: [[-40, y], [400, y - 40], [800, y + 10], [1120, y - 50]] });
const panel = (head, sub, items) => ({
  w: 1600, h: 760, bg: HUD('76% 54%'), color: INK, accent: CYAN,
  head: { x: 76, y: 180, size: 150, max: 530, lines: head }, sub: { x: 80, width: 500, size: 27, text: sub }, line: wideLine, items,
});
const tall = (head, sub, items, h = 1360) => ({
  w: 1080, h, bg: HUD('56% 74%'), color: INK, accent: CYAN,
  head: { x: 64, y: 80, size: 180, max: 950, lines: head }, sub: { x: 70, width: 930, size: 36, text: sub }, line: tallLine(h - 40), items,
});

window.README = {
  name: 'J.A.R.V.I.S.', icon: 'icon.png',
  layouts: {
    hero: {
      w: 1600, h: 820, bg: HUD('74% 54%'), color: INK, accent: CYAN,
      brand: { x: 80, y: 74, size: 30 },
      head: { x: 76, y: 236, size: 150, max: 600, lines: ['A browser', 'assistant'] },
      sub: { x: 80, width: 500, size: 27, gap: 34, text: 'Voice and text in a cyan HUD, with a real AI behind it and quick tools for the time, weather, notes and more.' },
      line: { width: 20, color: CYAN, points: [[-40, 770], [300, 724], [640, 708], [900, 772], [1200, 714], [1640, 752]] },
      items: [{ type: 'laptop', src: 'desktop-chat.png', x: 720, y: 110, w: 720 }, P('phone-chat.png', 1260, 230, 250, 5, 24, CYAN)],
    },
    'hero-mobile': {
      w: 1080, h: 1350, bg: HUD('56% 76%'), color: INK, accent: CYAN,
      brand: { x: 70, y: 70, size: 38 },
      head: { x: 64, y: 196, size: 200, max: 950, lines: ['A browser', 'assistant'] },
      sub: { x: 70, width: 930, size: 38, text: 'Voice and text in a cyan HUD, with a real AI behind it.' },
      line: { width: 26, color: CYAN, points: [[-40, 1300], [300, 1250], [600, 1296], [1120, 1222]] },
      items: [{ type: 'laptop', src: 'desktop-chat.png', x: 110, y: 760, w: 730 }, P('phone-chat.png', 760, 760, 240, 5, 24, CYAN)],
    },
    talk: panel(['Talk', 'or type'], 'Click the mic and speak, or type. Quick tools answer the time, weather, jokes and notes without a model; the rest goes to the AI.', [
      P('phone.png', 900, 80, 290, -4, 24), P('phone-chat.png', 1220, 110, 280, 5, 22, CYAN),
    ]),
    'talk-mobile': tall(['Talk', 'or type'], 'Click the mic and speak, or type. Quick tools answer simple things; the rest goes to the AI.', [
      P('phone.png', 90, 590, 330, -4, 24), P('phone-chat.png', 590, 620, 330, 5, 22, CYAN),
    ]),
    boot: panel(['Boots like', 'a suit'], 'A start-up sequence, a reactor that answers to your voice, and memory for notes and past conversations.', [
      P('boot.png', 900, 80, 290, -4, 24, CYAN), P('phone.png', 1220, 110, 280, 5, 22),
    ]),
    'boot-mobile': tall(['Boots like', 'a suit'], 'A start-up sequence, a reactor that answers to your voice, and memory for notes.', [
      P('boot.png', 90, 590, 330, -4, 24, CYAN), P('phone.png', 590, 620, 330, 5, 22),
    ]),
  },
};
