// Canvas interface artwork, with local Classic spell icons and drawn fallbacks.
import { artManifest, artURL } from '../gl/assets.js';

const spellIcons = new Map();
artManifest.then(manifest => {
  for (const [key, path] of Object.entries(manifest?.icons || {})) {
    const image = new Image();
    image.onload = () => spellIcons.set(key, image);
    image.src = artURL(path);
  }
});
// Chrome is rasterised once at device resolution; the HUD only blits it.
export const TITLE_FONT = 'Marcellus, Georgia, serif';
export const UI_FONT = '"Noto Sans", Arial, sans-serif';
const cache = new Map();
export const C = {
  gold: '#d6bd79',
  light: '#f4df9b',
  edge: '#807354',
  dark: '#131416',
  stone: '#383a3b',
  text: '#eee4cc',
  muted: '#bab09a',
  green: '#23b937',
  blue: '#226dde',
  red: '#c52628',
  yellow: '#ffd642',
};
export function gradient(c, x, y, w, h, stops) {
  if (!c.createLinearGradient) return stops[0][1];
  const g = c.createLinearGradient(x, y, x + w, y + h);
  stops.forEach(([p, color]) => g.addColorStop(p, color));
  return g;
}
export function poly(c, pts, fill, stroke, width = 1) {
  c.beginPath();
  pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
  c.closePath();
  if (fill) {
    c.fillStyle = fill;
    c.fill();
  }
  if (stroke) {
    c.strokeStyle = stroke;
    c.lineWidth = width;
    c.stroke();
  }
}
export function circle(c, x, y, r, fill, stroke, width = 1) {
  c.beginPath();
  c.arc(x, y, r, 0, Math.PI * 2);
  if (fill) {
    c.fillStyle = fill;
    c.fill();
  }
  if (stroke) {
    c.strokeStyle = stroke;
    c.lineWidth = width;
    c.stroke();
  }
}
export function label(
  c,
  str,
  x,
  y,
  size = 12,
  color = C.text,
  align = 'left',
  serif = false,
) {
  size = Math.max(9, size);
  c.font = `${serif ? 400 : 600} ${size}px ${serif ? TITLE_FONT : UI_FONT}`;
  c.textAlign = align;
  c.textBaseline = 'middle';
  c.lineJoin = 'round';
  c.strokeStyle = 'rgba(0,0,0,.94)';
  c.lineWidth = Math.max(2.5, size / 5);
  if (c.strokeText) c.strokeText(String(str), x, y);
  c.fillStyle = color;
  c.fillText(String(str), x, y);
}
export function fit(c, str, width) {
  str = String(str ?? '');
  if (!c.measureText || c.measureText(str).width <= width) return str;
  let lo = 0,
    hi = str.length;
  while (lo < hi) {
    const n = (lo + hi + 1) >> 1;
    if (c.measureText(str.slice(0, n) + '…').width <= width) lo = n;
    else hi = n - 1;
  }
  return str.slice(0, lo) + '…';
}
export function wrapped(
  c,
  str,
  x,
  y,
  width,
  size = 12,
  color = C.text,
  lineH = size * 1.4,
) {
  c.font = `500 ${size}px ${UI_FONT}`;
  let line = '',
    rows = 0;
  for (const word of String(str ?? '').split(/\s+/)) {
    const next = line ? line + ' ' + word : word;
    if (line && c.measureText && c.measureText(next).width > width) {
      label(c, line, x, y + rows++ * lineH, size, color);
      line = word;
    } else line = next;
  }
  if (line) label(c, line, x, y + rows++ * lineH, size, color);
  return rows * lineH;
}
export function cached(c, key, x, y, w, h, paint) {
  if (typeof document === 'undefined' || !c.drawImage) {
    c.save();
    c.translate(x, y);
    paint(c);
    c.restore();
    return;
  }
  const dpr = Math.min(2, globalThis.devicePixelRatio || 1),
    k = `${key}:${w.toFixed(1)}:${h.toFixed(1)}:${dpr}`;
  let cv = cache.get(k);
  if (!cv) {
    cv = document.createElement('canvas');
    cv.width = Math.ceil(w * dpr);
    cv.height = Math.ceil(h * dpr);
    const p = cv.getContext('2d');
    if (!p) return;
    p.scale(dpr, dpr);
    paint(p);
    if (cache.size >= 128) cache.delete(cache.keys().next().value);
    cache.set(k, cv);
  }
  c.drawImage(cv, x, y, w, h);
}
export function frame(c, x, y, w, h, heavy = false, subdued = false) {
  cached(c, `frame:${heavy}:${subdued}`, x, y, w, h, (p) => {
    p.fillStyle = '#080909';
    p.fillRect(0, 0, w, h);
    p.fillStyle = gradient(p, 0, 0, 0, h, [
      [0, subdued ? '#626564' : '#8b8980'],
      [0.1, '#444646'],
      [0.48, '#252829'],
      [0.9, '#3b3c3d'],
      [1, subdued ? '#414644' : '#68645b'],
    ]);
    p.fillRect(1, 1, w - 2, h - 2);
    const b = heavy ? 7 : 4;
    p.strokeStyle = subdued ? '#626358' : '#ad9a6c';
    p.lineWidth = 1;
    p.strokeRect(2.5, 2.5, w - 5, h - 5);
    p.strokeStyle = '#161718';
    p.strokeRect(4.5, 4.5, w - 9, h - 9);
    p.fillStyle = gradient(p, 0, 0, 0, h, [
      [0, '#181a1c'],
      [0.5, '#101113'],
      [1, '#080909'],
    ]);
    p.fillRect(b, b, w - 2 * b, h - 2 * b);
    p.strokeStyle = subdued ? '#363b39' : '#575043';
    p.strokeRect(b + 0.5, b + 0.5, w - 2 * b - 1, h - 2 * b - 1);
    // Fine carved stone veins, deterministic and cached.
    p.save();
    p.beginPath();
    p.rect(0, 0, w, h);
    p.rect(b, b, w - 2 * b, h - 2 * b);
    p.clip('evenodd');
    for (let i = 0; i < w; i += 13) {
      p.strokeStyle = i % 2 ? '#ffffff14' : '#00000055';
      p.beginPath();
      p.moveTo(i, 1);
      p.lineTo(i + 4, 4);
      p.lineTo(i + 2, h - 2);
      p.stroke();
    }
    p.restore();
    if (heavy)
      for (const [xx, yy] of [
        [5, 5],
        [w - 5, 5],
        [5, h - 5],
        [w - 5, h - 5],
      ])
        circle(p, xx, yy, 2.2, subdued ? '#696b62' : '#aa9870', '#181615');
  });
}
export function statusBar(c, x, y, w, h, f, color) {
  c.fillStyle = '#090a0b';
  c.fillRect(x, y, w, h);
  f = Math.max(0, Math.min(1, Number(f) || 0));
  c.fillStyle = color;
  c.fillRect(x + 1, y + 1, (w - 2) * f, h - 2);
  c.fillStyle = gradient(c, 0, y, 0, h, [
    [0, '#ffffff45'],
    [0.48, '#ffffff00'],
    [0.52, '#00000012'],
    [1, '#0000008a'],
  ]);
  c.fillRect(x + 1, y + 1, (w - 2) * f, h - 2);
  c.strokeStyle = '#040505';
  c.lineWidth = 1;
  c.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
}
export function socket(c, x, y, size, subdued = false) {
  cached(c, `socket:${subdued}`, x, y, size, size, (p) => {
    p.fillStyle = '#050607';
    p.fillRect(0, 0, size, size);
    poly(
      p,
      [
        [1, 1],
        [size - 1, 1],
        [size - 5, 5],
        [5, size - 5],
        [1, size - 1],
      ],
      subdued ? '#515653' : '#8d8b7e',
    );
    poly(
      p,
      [
        [size - 1, 1],
        [size - 1, size - 1],
        [1, size - 1],
        [5, size - 5],
        [size - 5, 5],
      ],
      subdued ? '#252a29' : '#34332d',
    );
    p.strokeStyle = subdued ? '#68695d' : '#c0ab73';
    p.strokeRect(0.5, 0.5, size - 1, size - 1);
    p.fillStyle = gradient(p, 0, 4, size, size, [
      [0, '#050607'],
      [1, subdued ? '#141819' : '#232525'],
    ]);
    p.fillRect(4, 4, size - 8, size - 8);
    p.strokeStyle = '#090a0b';
    p.strokeRect(3.5, 3.5, size - 7, size - 7);
  });
}
const abilityColors = {
  taunt: ['#6f170b', '#efaa44'],
  attack: ['#253653', '#9abaf0'],
  heal: ['#18422c', '#8eeaac'],
  dispel: ['#2e245d', '#baafff'],
  interrupt: ['#513619', '#e4bd82'],
  jump: ['#203f50', '#b5e0ee'],
};
export function icon(c, id, x, y, size) {
  const school = /poison|disease|swarm|plague/i.test(id) ? 'poison' : /fire|flame|breath|eruption/i.test(id) ? 'fire' : /frost|ice/i.test(id) ? 'frost' : 'shadow';
  const image = spellIcons.get(id) || spellIcons.get(school);
  if (image) { c.drawImage(image, x, y, size, size); return; }
  cached(c, `icon:${id}`, x, y, size, size, (p) => {
    p.save();
    p.scale(size / 100, size / 100);
    paintIcon(p, id);
    p.restore();
  });
}
function paintIcon(c, id) {
  const pair =
    abilityColors[id] ||
    (/poison|disease|swarm|plague/i.test(id)
      ? ['#24340c', '#b5d747']
      : /fire|flame|breath|eruption/i.test(id)
        ? ['#631307', '#ffb53f']
        : /frost|ice/i.test(id)
          ? ['#173d5a', '#9aeeff']
          : ['#372144', '#cd8ee9']);
  c.fillStyle = gradient(c, 0, 0, 100, 100, [
    [0, pair[0]],
    [0.6, '#121719'],
    [1, pair[0]],
  ]);
  c.fillRect(0, 0, 100, 100);
  // Rays under the hand-painted emblem.
  for (let i = 0; i < 12; i++) {
    const a = (i * Math.PI) / 6;
    poly(
      c,
      [
        [50, 50],
        [50 + Math.cos(a) * 74, 50 + Math.sin(a) * 74],
        [50 + Math.cos(a + 0.05) * 74, 50 + Math.sin(a + 0.05) * 74],
      ],
      pair[1] + '30',
    );
  }
  const metal = gradient(c, 20, 15, 60, 65, [
    [0, '#fff3bc'],
    [0.3, '#c5c9bd'],
    [0.55, '#777b73'],
    [0.7, '#d9d6ad'],
    [1, '#4b4b40'],
  ]);
  if (id === 'attack') {
    poly(
      c,
      [
        [25, 77],
        [62, 19],
        [80, 9],
        [79, 34],
        [37, 84],
      ],
      metal,
      '#080b0e',
      3,
    );
    poly(
      c,
      [
        [35, 75],
        [76, 15],
        [66, 40],
      ],
      '#e8f3f1',
    );
    poly(
      c,
      [
        [17, 62],
        [44, 84],
        [39, 92],
        [11, 70],
      ],
      '#b99044',
      '#342111',
      2,
    );
    poly(
      c,
      [
        [24, 77],
        [31, 83],
        [18, 99],
        [10, 91],
      ],
      '#785237',
      '#0a0908',
      2,
    );
  } else if (id === 'taunt') {
    poly(
      c,
      [
        [15, 27],
        [50, 12],
        [85, 27],
        [79, 69],
        [50, 92],
        [21, 69],
      ],
      metal,
      '#20150c',
      4,
    );
    poly(
      c,
      [
        [25, 33],
        [50, 23],
        [75, 33],
        [69, 65],
        [50, 80],
        [31, 65],
      ],
      '#9f271b',
      '#d5b15c',
      2,
    );
    poly(
      c,
      [
        [50, 29],
        [57, 45],
        [70, 49],
        [59, 57],
        [60, 69],
        [50, 63],
        [40, 69],
        [41, 57],
        [30, 49],
        [43, 45],
      ],
      '#efc573',
      '#482b13',
      2,
    );
  } else if (id === 'heal') {
    circle(c, 50, 48, 28, '#76dda029', '#a9f6a87a', 2);
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4;
      poly(
        c,
        [
          [50 + Math.cos(a) * 32, 48 + Math.sin(a) * 32],
          [50 + Math.cos(a - 0.04) * 46, 48 + Math.sin(a - 0.04) * 46],
          [50 + Math.cos(a + 0.04) * 46, 48 + Math.sin(a + 0.04) * 46],
        ],
        '#d0ffac',
      );
    }
    poly(
      c,
      [
        [40, 20],
        [60, 20],
        [60, 39],
        [79, 39],
        [79, 58],
        [60, 58],
        [60, 79],
        [40, 79],
        [40, 58],
        [21, 58],
        [21, 39],
        [40, 39],
      ],
      '#f6e7a4',
      '#386441',
      3,
    );
    poly(
      c,
      [
        [44, 25],
        [53, 25],
        [53, 44],
        [73, 44],
        [73, 49],
        [44, 49],
      ],
      '#fffbd9',
    );
  } else if (id === 'dispel') {
    c.strokeStyle = '#b1d8ff';
    c.lineWidth = 9;
    c.beginPath();
    c.arc(51, 51, 28, 0.1, 5.5);
    c.stroke();
    poly(
      c,
      [
        [55, 8],
        [42, 43],
        [22, 54],
        [43, 60],
        [48, 88],
        [59, 60],
        [80, 48],
        [59, 42],
      ],
      '#f2e6ff',
      '#7470b9',
      2,
    );
    circle(c, 51, 50, 7, '#fff');
    for (const [x, y] of [
      [21, 21],
      [79, 78],
      [16, 72],
    ])
      poly(
        c,
        [
          [x, y - 8],
          [x + 3, y - 2],
          [x + 8, y],
          [x + 3, y + 2],
          [x, y + 8],
          [x - 2, y + 2],
          [x - 8, y],
          [x - 2, y - 2],
        ],
        '#bce9ff',
      );
  } else if (id === 'interrupt') {
    poly(
      c,
      [
        [20, 11],
        [50, 13],
        [52, 46],
        [78, 63],
        [89, 81],
        [74, 91],
        [31, 72],
        [19, 52],
      ],
      metal,
      '#1d130b',
      3,
    );
    for (let i = 0; i < 4; i++)
      poly(
        c,
        [
          [21, 20 + i * 9],
          [48, 22 + i * 9],
          [48, 28 + i * 9],
          [21, 26 + i * 9],
        ],
        '#66594a',
        '#e5ca8a',
        1,
      );
    poly(
      c,
      [
        [61, 7],
        [68, 26],
        [86, 22],
        [75, 38],
        [94, 48],
        [74, 49],
        [72, 65],
        [62, 48],
        [46, 51],
        [56, 35],
      ],
      '#ffdd69',
    );
  } else if (id === 'jump') {
    poly(
      c,
      [
        [20, 53],
        [50, 16],
        [80, 53],
        [62, 53],
        [62, 84],
        [38, 84],
        [38, 53],
      ],
      metal,
      '#17222a',
      3,
    );
  } else {
    // Original magical flame / curse badge for encounter spells.
    poly(
      c,
      [
        [51, 7],
        [65, 33],
        [71, 21],
        [83, 49],
        [79, 74],
        [60, 92],
        [34, 87],
        [17, 67],
        [23, 40],
        [34, 55],
        [38, 26],
        [45, 40],
      ],
      pair[1],
      '#080909',
      3,
    );
    poly(
      c,
      [
        [53, 35],
        [65, 57],
        [60, 77],
        [47, 82],
        [35, 67],
        [41, 54],
        [45, 64],
      ],
      '#fff2be',
    );
  }
  c.strokeStyle = '#ffffff39';
  c.lineWidth = 2;
  c.strokeRect(2, 2, 96, 96);
}
export function portrait(c, kind, x, y, size) {
  cached(c, `portrait:${kind}`, x, y, size, size, (p) => {
    p.save();
    p.scale(size / 100, size / 100);
    paintPortrait(p, kind);
    p.restore();
  });
}
function paintPortrait(c, kind) {
  const isPlayer = kind.startsWith('player');
  const frost = /naxx|sapphiron|thuzad/.test(kind),
    fire = /molten|ragnaros|onyxia|blackwing/.test(kind);
  const bg = isPlayer
    ? '#24485a'
    : frost
      ? '#253849'
      : fire
        ? '#4e2118'
        : '#3b304d';
  c.save();
  circle(c, 50, 50, 49, bg);
  c.clip();
  c.fillStyle = gradient(c, 0, 0, 90, 100, [
    [0, bg],
    [1, '#080a0d'],
  ]);
  c.fillRect(0, 0, 100, 100);
  // Decorative halo, deliberately an illustrated heraldic fallback.
  circle(c, 50, 47, 38, null, '#b7a97533', 1);
  for (let i = 0; i < 12; i++) {
    const a = (i * Math.PI) / 6;
    c.strokeStyle = '#b7a97535';
    c.beginPath();
    c.moveTo(50 + Math.cos(a) * 33, 47 + Math.sin(a) * 33);
    c.lineTo(50 + Math.cos(a) * 38, 47 + Math.sin(a) * 38);
    c.stroke();
  }
  const plate = gradient(c, 20, 20, 60, 75, [
    [0, '#d4c9a8'],
    [0.35, '#7d8790'],
    [0.55, '#c5bfa4'],
    [1, '#343d43'],
  ]);
  if (isPlayer) {
    poly(
      c,
      [
        [5, 100],
        [15, 77],
        [33, 70],
        [35, 57],
        [65, 57],
        [68, 70],
        [86, 76],
        [98, 100],
      ],
      '#446070',
      '#a7a78c',
      2,
    );
    poly(
      c,
      [
        [29, 28],
        [50, 15],
        [70, 30],
        [67, 63],
        [50, 78],
        [33, 64],
      ],
      plate,
      '#111b23',
      3,
    );
    poly(
      c,
      [
        [29, 29],
        [50, 20],
        [70, 30],
        [69, 43],
        [54, 37],
        [54, 67],
        [48, 72],
        [44, 37],
        [30, 44],
      ],
      '#b7b9a6',
      '#353e40',
      2,
    );
    poly(
      c,
      [
        [30, 44],
        [43, 40],
        [43, 47],
        [34, 50],
      ],
      '#131b21',
    );
    poly(
      c,
      [
        [56, 40],
        [69, 45],
        [64, 50],
        [56, 47],
      ],
      '#131b21',
    );
    poly(
      c,
      [
        [6, 93],
        [16, 77],
        [32, 77],
        [24, 99],
      ],
      plate,
      '#131b21',
      2,
    );
    poly(
      c,
      [
        [71, 79],
        [85, 77],
        [96, 95],
        [76, 100],
      ],
      plate,
      '#131b21',
      2,
    );
    poly(
      c,
      [
        [45, 20],
        [48, 3],
        [56, 7],
        [56, 22],
      ],
      '#324e6d',
      '#9c9275',
      1,
    );
  } else if (/onyxia|wing|drak|dragon|sapphiron|nefari|razor/.test(kind)) {
    const skin = fire ? '#8c5b43' : '#71858d';
    poly(
      c,
      [
        [30, 38],
        [12, 6],
        [39, 26],
        [54, 18],
        [68, 28],
        [88, 8],
        [77, 47],
        [85, 61],
        [71, 83],
        [48, 95],
        [27, 70],
        [23, 48],
      ],
      skin,
      '#161515',
      3,
    );
    poly(
      c,
      [
        [43, 44],
        [65, 36],
        [80, 58],
        [61, 67],
        [57, 82],
        [38, 66],
      ],
      plate,
      '#2b2821',
      2,
    );
    poly(
      c,
      [
        [27, 41],
        [44, 48],
        [40, 54],
        [29, 50],
      ],
      '#ffc858',
    );
    poly(
      c,
      [
        [58, 45],
        [71, 42],
        [70, 51],
        [59, 54],
      ],
      '#ffc858',
    );
    poly(
      c,
      [
        [38, 68],
        [65, 67],
        [58, 80],
        [48, 83],
      ],
      '#111314',
    );
    for (let i = 0; i < 4; i++)
      poly(
        c,
        [
          [40 + i * 6, 68],
          [43 + i * 6, 68],
          [42 + i * 6, 75],
        ],
        '#d9ccb1',
      );
  } else if (/anub|maex|aq|qiraj|silith|skeram/.test(kind)) {
    poly(
      c,
      [
        [12, 86],
        [21, 44],
        [12, 22],
        [38, 33],
        [50, 11],
        [63, 32],
        [87, 21],
        [78, 44],
        [90, 88],
        [60, 72],
        [50, 93],
        [38, 72],
      ],
      '#657d83',
      '#111c27',
      3,
    );
    poly(
      c,
      [
        [31, 40],
        [50, 26],
        [70, 41],
        [68, 72],
        [50, 86],
        [31, 68],
      ],
      plate,
      '#1b2030',
      2,
    );
    poly(
      c,
      [
        [34, 47],
        [47, 54],
        [43, 61],
        [33, 58],
      ],
      '#80dc9d',
    );
    poly(
      c,
      [
        [54, 54],
        [68, 48],
        [68, 58],
        [58, 61],
      ],
      '#80dc9d',
    );
  } else {
    poly(
      c,
      [
        [12, 100],
        [22, 66],
        [27, 25],
        [49, 9],
        [76, 24],
        [82, 67],
        [96, 100],
      ],
      '#35383d',
      '#a39466',
      2,
    );
    poly(
      c,
      [
        [30, 30],
        [49, 22],
        [69, 29],
        [72, 51],
        [63, 62],
        [63, 77],
        [38, 78],
        [36, 62],
        [27, 51],
      ],
      plate,
      '#14191c',
      3,
    );
    poly(
      c,
      [
        [31, 43],
        [45, 47],
        [43, 57],
        [33, 55],
      ],
      '#0e1a20',
    );
    poly(
      c,
      [
        [54, 47],
        [69, 42],
        [67, 55],
        [56, 58],
      ],
      '#0e1a20',
    );
    circle(c, 38, 50, 3, frost ? '#9ff3fa' : '#ffb342');
    circle(c, 61, 50, 3, frost ? '#9ff3fa' : '#ffb342');
    poly(
      c,
      [
        [49, 55],
        [43, 66],
        [54, 66],
      ],
      '#202329',
    );
    for (let i = 0; i < 4; i++) {
      c.fillStyle = '#393b38';
      c.fillRect(41 + i * 5, 70, 2, 8);
    }
    poly(
      c,
      [
        [21, 26],
        [16, 7],
        [35, 24],
      ],
      '#a7a080',
      '#252722',
      2,
    );
    poly(
      c,
      [
        [67, 24],
        [85, 9],
        [78, 31],
      ],
      '#a7a080',
      '#252722',
      2,
    );
  }
  c.restore();
}
export function portraitRing(c, x, y, size) {
  cached(c, 'portrait-ring', x - 4, y - 4, size + 8, size + 8, (p) => {
    const r = size / 2,
      cx = r + 4;
    circle(p, cx, cx, r + 2, null, '#080a0c', 6);
    circle(p, cx, cx, r + 1, null, '#9a998a', 4);
    circle(p, cx, cx, r + 1, null, '#d5c69a', 1);
    circle(p, cx, cx, r - 2, null, '#171b1d', 2);
    for (let i = 0; i < 24; i++) {
      const a = (i * Math.PI) / 12;
      p.strokeStyle = i % 2 ? '#1a1b1c' : '#c9c7af';
      p.lineWidth = 1;
      p.beginPath();
      p.moveTo(cx + Math.cos(a) * (r - 1), cx + Math.sin(a) * (r - 1));
      p.lineTo(cx + Math.cos(a) * (r + 3), cx + Math.sin(a) * (r + 3));
      p.stroke();
    }
  });
}
export function wing(c, x, y, w, h, flip = false) {
  cached(c, `gryphon:${flip}`, x, y, w, h, (p) => {
    p.save();
    p.scale(w / 112, h / 104);
    if (flip) {
      p.translate(112, 0);
      p.scale(-1, 1);
    }
    p.lineJoin = 'round';
    p.lineCap = 'round';
    // Original pewter relief: a low shoulder, a folded wing, and a lion's haunch.
    // Two/four/six coordinates describe lines/quadratics/cubics respectively.
    const carve = (points, fill, stroke = '#15171a', width = 1.6, close = true) => {
      p.beginPath();
      p.moveTo(...points[0]);
      for (const pt of points.slice(1)) {
        if (pt.length === 6) p.bezierCurveTo(...pt);
        else if (pt.length === 4) p.quadraticCurveTo(...pt);
        else p.lineTo(...pt);
      }
      if (close) p.closePath();
      if (fill) { p.fillStyle = fill; p.fill(); }
      if (stroke) { p.strokeStyle = stroke; p.lineWidth = width; p.stroke(); }
    };
    const pewter = gradient(p, 12, 8, 55, 82, [
      [0, '#939792'], [0.23, '#676c6b'], [0.52, '#3d4244'],
      [0.76, '#555a59'], [1, '#272b2e'],
    ]);
    const raised = gradient(p, 25, 13, 30, 58, [
      [0, '#b1b3aa'], [0.22, '#858a83'], [0.48, '#555c5c'], [1, '#282d32'],
    ]);
    const feather = gradient(p, 18, 27, 40, 55, [
      [0, '#777d7b'], [0.45, '#545b5b'], [0.8, '#353b3f'], [1, '#6d726e'],
    ]);
    // Tail curls beneath the rump, keeping the entire silhouette close to the bar.
    carve([[34,61], [2,58,-3,88,15,97], [28,105,42,94,33,86],
      [26,79,17,84,21,90], [12,88,13,77,23,76], [41,80]], pewter, '#101215', 2.6);
    carve([[12,78], [4,88,15,99,26,94]], null, '#8a8e86', 1.2, false);
    // Broad body and tucked rear leg; no free-standing feather tips.
    carve([[14,72], [9,51,18,22,38,13], [53,6,72,17,79,38],
      [91,57,87,84,73,94], [55,102,23,97,14,72]], pewter, '#111417', 2.8);
    carve([[49,61], [33,62,28,80,39,91], [44,97,56,98,64,96],
      [76,95,80,99,82,95], [85,89,76,85,65,87],
      [68,76,62,65,49,61]], raised, '#202528', 1.8);
    carve([[45,73], [39,79,43,87,50,89], [61,91,66,89,74,93]], null, '#989c92', 1.1, false);
    for (let i = 0; i < 3; i++)
      carve([[65 + i * 5,90], [69 + i * 5,91,69 + i * 5,95]], null, '#20262a', 1.4, false);
    // Neck slopes into the shoulder, with a short swept crest and hooked beak.
    carve([[48,28], [52,17,60,14,66,14], [62,10], [75,12], [70,6],
      [86,10,94,16,96,23], [96,33,85,36,82,40],
      [80,49,85,56,80,64], [66,66,53,53,48,28]], raised, '#15191c', 2.1);
    carve([[83,20], [93,19,103,22,108,27], [110,32,106,38,101,40],
      [102,33,96,31,91,31], [84,29]], '#777c77', '#14191d', 1.8);
    carve([[94,24], [102,25,105,27,107,28]], null, '#b2b3a6', 1.1, false);
    carve([[91,32], [96,33,100,34,102,35]], null, '#20262a', 1.4, false);
    // The overhanging brow and dark eye remain readable at HUD size.
    carve([[75,21], [81,18,88,21,90,24], [84,26], [77,25]], '#252c30');
    circle(p, 83, 23, 1.4, '#b8b9aa', '#181d20', 0.8);
    carve([[73,19], [80,16,86,19,90,21]], null, '#a4a79b', 1.5, false);
    carve([[71,29], [73,35,80,36,82,35], [76,43], [80,44],
      [73,50], [76,52], [70,56], [61,43]], '#515859', '#282f33', 1.1);
    carve([[69,31], [69,37,72,40,75,41]], null, '#93998f', 1, false);
    // A bent foreleg reaches inward, the talons curl over the end rail.
    carve([[73,48], [73,59,78,69,87,68], [97,65,95,48,99,44],
      [101,41,106,42,108,46], [111,43,108,37,104,36],
      [95,33,88,39,87,47], [84,54], [81,44]], pewter, '#151b1e', 2);
    carve([[80,54], [82,62,86,62,88,58], [90,43,95,39,101,39]], null, '#92988e', 1.3, false);
    for (let i = 0; i < 3; i++)
      carve([[97 + i * 4,39], [101 + i * 4,38,103 + i * 3,43,101 + i * 3,47]],
        null, i === 0 ? '#b5b6a9' : '#858c84', 1.5, false);
    // The wing is one heavy teardrop folded across the flank, with layered relief.
    carve([[55,18], [36,10,19,29,17,49], [14,64,22,79,33,85],
      [35,71,48,63,57,50], [68,34,66,22,55,18]], feather, '#191e22', 2.2);
    // Broad primaries sweep diagonally back, their tips tucked against the haunch.
    for (let i = 0; i < 5; i++) {
      const rx = 43 + i * 2.5, ry = 27 + i * 4,
        tx = 20 + i * 3.3, ty = 62 + i * 4;
      carve([[rx,ry], [rx - 18,ry + 1,tx - 7,ty - 13,tx,ty],
        [tx + 8,ty - 6,rx + 4,ry + 16,rx + 6,ry + 6],
        [rx + 4,ry + 1,rx + 1,ry - 1,rx,ry]], feather, '#242b30', 1.2);
      carve([[rx - 3,ry + 6], [rx - 16,ry + 9,tx - 1,ty - 13,tx + 1,ty - 5]],
        null, '#a0a5988c', 1.2, false);
    }
    // Shoulder coverts cap the long feathers as a continuous, rounded hunch.
    carve([[24,34], [28,16,48,10,57,20], [65,27,63,38,56,43],
      [50,39,47,34,44,33], [37,38,29,39,24,34]], raised, '#293034', 1.3);
    for (const [xx, yy] of [[32,26], [40,21], [49,22], [31,32], [40,29], [49,30], [55,35]]) {
      carve([[xx - 3,yy - 2], [xx - 2,yy + 4,xx + 3,yy + 5,xx + 5,yy + 1]],
        null, '#30383b', 1.1, false);
      carve([[xx - 3,yy - 3], [xx,yy - 5,xx + 3,yy - 3]], null, '#a0a59883', 0.9, false);
    }
    carve([[19,48], [17,31,32,13,46,16]], null, '#a5a99e', 1.2, false);
    carve([[22,62], [22,71,27,78,31,81]], null, '#898f84', 1.1, false);
    carve([[58,51], [51,64,39,69,35,81]], null, '#12191c', 2, false);
    // Small tool marks catch the light without turning the relief into bright trim.
    for (const [xx, yy] of [[27,23], [35,18], [23,40], [38,86], [48,93], [68,17], [76,57]])
      carve([[xx,yy], [xx + 2,yy - 1]], null, '#b9bba76b', 0.8, false);
    p.restore();
  });
}
export function elite(c, x, y, w, h) {
  cached(c, 'elite-dragon', x, y, w, h, (p) => {
    p.save();
    p.scale(w / 300, h / 90);
    const gold = gradient(p, 0, 0, 0, 90, [
      [0, '#f4dc8e'],
      [0.3, '#9c7a38'],
      [0.5, '#dbba69'],
      [0.7, '#6c532c'],
      [1, '#d6b771'],
    ]);
    // Serpentine body curls around the right portrait then tapers along frame.
    p.beginPath();
    p.moveTo(13, 14);
    p.bezierCurveTo(76, 26, 132, -2, 218, 12);
    p.bezierCurveTo(292, -10, 308, 70, 263, 79);
    p.bezierCurveTo(239, 90, 221, 72, 237, 65);
    p.strokeStyle = '#16130c';
    p.lineWidth = 10;
    p.stroke();
    p.strokeStyle = gold;
    p.lineWidth = 6;
    p.stroke();
    for (let i = 0; i < 18; i++) {
      const xx = 26 + i * 11,
        yy = 14 + Math.sin(i * 0.37) * 3;
      poly(
        p,
        [
          [xx, yy],
          [xx + 4, yy - 6],
          [xx + 8, yy + 1],
        ],
        gold,
        '#5c4526',
        0.6,
      );
    }
    poly(
      p,
      [
        [224, 16],
        [233, 5],
        [251, 5],
        [261, 12],
        [253, 23],
        [239, 20],
        [235, 28],
        [229, 24],
      ],
      gold,
      '#3d2d19',
      1.5,
    );
    poly(
      p,
      [
        [234, 8],
        [228, 0],
        [241, 6],
        [246, 1],
        [249, 8],
      ],
      gold,
      '#4c361c',
      1,
    );
    poly(
      p,
      [
        [254, 13],
        [270, 18],
        [261, 23],
        [250, 20],
      ],
      gold,
      '#4c361c',
      1,
    );
    circle(p, 250, 13, 1.8, '#f24d21', '#170e06', 0.8);
    for (let i = 0; i < 9; i++) {
      const a = -1 + i * 0.27;
      const xx = 267 + Math.cos(a) * 27,
        yy = 44 + Math.sin(a) * 31;
      p.strokeStyle = '#ebd28c';
      p.lineWidth = 1;
      p.beginPath();
      p.moveTo(xx - 3, yy - 2);
      p.lineTo(xx + 3, yy + 2);
      p.stroke();
    }
    poly(
      p,
      [
        [278, 59],
        [289, 65],
        [281, 71],
        [271, 67],
        [261, 73],
        [267, 64],
      ],
      gold,
      '#4c361c',
      1,
    );
    p.restore();
  });
}
