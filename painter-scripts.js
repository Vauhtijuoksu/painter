const frame = document.getElementById('frame');
const cover = document.getElementById('cover');
const c = document.getElementById('canvas-main');
const ctx = c.getContext('2d');

// sizes for tools
const tools = {
  pencil: { tip: 'translate(-3.5%, -96.5%)', op: 'source-over', sizes: [1, 2, 5, 10, 20], size: 2 },
  eraser: { tip: 'translate(-50%, -97%)', op: 'destination-out', sizes: [6, 12, 24, 48, 96], size: 2 },
};
const sizeSelect = document.getElementById('size');

const cursor = document.getElementById('cursor');
const buttons = document.querySelectorAll('#tools [data-tool]');
let tool;
let color = '#e53935';
const swatches = document.querySelectorAll('#colors button');
const colors = document.getElementById('colors');
const pencilBtn = document.querySelector('[data-tool="pencil"]');
const setTool = name => {
  const t = tools[tool = name];
  ctx.lineCap = 'round'; ctx.strokeStyle = color;
  cursor.src = 'icons/' + name + '.svg';
  cursor.style.transform = t.tip;
  ctx.globalCompositeOperation = t.op;
  ctx.lineWidth = t.sizes[t.size];
  sizeSelect.value = t.size;
  buttons.forEach(b => b.setAttribute('aria-pressed', b.dataset.tool === name));
  swatches.forEach(b => b.setAttribute('aria-pressed', b.dataset.color === color));
  pencilBtn.style.setProperty('--color', color);
};
buttons.forEach(b => b.onclick = () => setTool(b.dataset.tool));
swatches.forEach(b => b.onclick = () => { color = b.dataset.color; setTool('pencil'); colors.hidePopover(); });
colors.addEventListener('beforetoggle', e => {
  if (e.newState !== 'open') return;
  const r = pencilBtn.getBoundingClientRect();
  colors.style.left = r.left + 'px';
  colors.style.top = r.bottom + 6 + 'px';
});
sizeSelect.onchange = () => {
  tools[tool].size = +sizeSelect.value;
  setTool(tool);
};
setTool('pencil');

// zoom&positioning
let s; 
let tx = 0;
let ty = 0; 
let fit;
const apply = () => {
  const fw = frame.clientWidth, fh = frame.clientHeight, w = c.width * s, h = c.height * s;
  tx = w <= fw ? (fw - w) / 2 : Math.min(0, Math.max(fw - w, tx));
  ty = h <= fh ? (fh - h) / 2 : Math.min(0, Math.max(fh - h, ty));
  c.style.transform = `translate(${tx}px, ${ty}px) scale(${s})`;
  const { w: iw, h: ih } = pic, peek = Math.min(iw, ih) * 0.07 * s;
  Object.assign(cover.style, {
    left: tx + (c.width - iw) / 2 * s + peek + 'px',
    top: ty + (c.height - ih) / 2 * s + peek + 'px',
    width: iw * s - 2 * peek + 'px',
    height: ih * s - 2 * peek + 'px',
  });
};
//////////////// ADD NEW IMAGES NAME HERE //////////////////////
const released = [
  'etsierot',
  'aivopahkina1',
  'aivopahkina2',
  'persoonallisuustesti',
  'horoskooppi',
  'juomatpulma',
  'slotinpyora',
  'teleporttisokkelo',
  'ristikko',
  'sanahaku',
  'sanasokkelo',
  'anagrammi',
  'riddles',
  'maze'
];
const titles = {
  "etsierot": "Etsi eroavaisuudet",
  "aivopahkina1": "Aivopähkinät 1/2",
  "aivopahkina2": "Aivopähkinät 2/2",
  "juomatpulma": "Pillimehusokkelo",
  "persoonallisuustesti": "Persoonallisuustesti",
  "horoskooppi": "Horoskooppi",
  "slotinpyora": "Oulu pilalla",
  "teleporttisokkelo": "Hurja lapyrintti",
  "sanasokkelo": "Sanasokkelo",
  "ristikko": "Ristikko",
  "maze": "Metroidvania-labyrintti",
  "sanahaku": "Sanahaku",
  "anagrammi": "Anagrammi",
  "riddles": "Arvoituksia"
}
////////////////////////////////////////////////////////////////
let current, pic = { w: 1, h: 1 }, picImg;
const refit = () => {
  const fw = frame.clientWidth, fh = frame.clientHeight;
  if (!fw || !fh) return;
  const { w: IMG_W, h: IMG_H } = pic;
  const w = IMG_W + 2 * Math.round(Math.max(0, IMG_H * fw / fh - IMG_W) / 2);
  const h = IMG_H + 2 * Math.round(Math.max(0, IMG_W * fh / fw - IMG_H) / 2);
  if (w !== c.width || h !== c.height) {
    const old = ctx.getImageData(0, 0, c.width, c.height);
    c.width = w; c.height = h;
    ctx.putImageData(old, (w - old.width) / 2, (h - old.height) / 2);
    setTool(tool);
  }
  fit = s = Math.min(fw / w, fh / h);
  apply();
};
new ResizeObserver(refit).observe(frame);

const timer = document.getElementById('timer');
const startBtn = document.getElementById('start');
const clock = document.getElementById('clock');
const stopBtn = document.getElementById('stop');
let ticker;
startBtn.onclick = () => {
  cover.hidden = true;
  clock.hidden = false;
  const t0 = Date.now();
  ticker = setInterval(() => {
    const ms = Date.now() - t0, sec = Math.floor(ms / 1000);
    timer.textContent = String(Math.floor(sec / 60)).padStart(2, '0') + ':' + String(sec % 60).padStart(2, '0') + ':' + String(Math.floor(ms % 1000 / 10)).padStart(2, '0');
  }, 10);
};
stopBtn.onclick = () => {
  clearInterval(ticker);
  stopBtn.disabled = true;
};

const zoomAt = (cx, cy, k) => {
  const r = frame.getBoundingClientRect(), fx = cx - r.left - frame.clientLeft, fy = cy - r.top - frame.clientTop;
  const ns = Math.min(fit * 8, Math.max(fit, s * k));
  tx = fx - (fx - tx) * ns / s; ty = fy - (fy - ty) * ns / s; s = ns;
  apply();
};

const pos = e => {
  const r = c.getBoundingClientRect();
  return [(e.clientX - r.left) * c.width / r.width, (e.clientY - r.top) * c.height / r.height];
};

const showCursor = e => { cursor.style.display = 'block'; cursor.style.left = e.clientX + 'px'; cursor.style.top = e.clientY + 'px'; };

const pts = new Map();
let drawing = false, pinch;

const undoStack = [];
const undo = () => {
  const img = undoStack.pop();
  if (!img) return;
  ctx.clearRect(0, 0, c.width, c.height);
  ctx.putImageData(img, (c.width - img.width) / 2, (c.height - img.height) / 2);
};
document.getElementById('undo').onclick = undo;
addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'z') { e.preventDefault(); undo(); }
});

frame.onpointerdown = e => {
  if (!cover.hidden) return;
  frame.setPointerCapture(e.pointerId);
  pts.set(e.pointerId, e);
  showCursor(e);
  if (pts.size === 1) {
    drawing = true;
    undoStack.push(ctx.getImageData(0, 0, c.width, c.height));
    if (undoStack.length > 20) undoStack.shift();
    ctx.beginPath(); ctx.moveTo(...pos(e));
  } else if (drawing) {
    drawing = false;
    ctx.putImageData(undoStack.pop(), 0, 0);
  }
};

frame.onpointermove = e => {
  if (!cover.hidden) return;
  showCursor(e);
  if (!pts.has(e.pointerId)) return;
  pts.set(e.pointerId, e);
  if (drawing) { ctx.lineTo(...pos(e)); ctx.stroke(); return; }
  if (pts.size !== 2) return;
  const [a, b] = pts.values();
  const mx = (a.clientX + b.clientX) / 2, my = (a.clientY + b.clientY) / 2;
  const d = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
  if (pinch) { tx += mx - pinch.mx; ty += my - pinch.my; zoomAt(mx, my, d / pinch.d); }
  pinch = { mx, my, d };
};

frame.onpointerup = frame.onpointercancel = e => {
  pts.delete(e.pointerId);
  pinch = null;
  if (!pts.size) drawing = false;
};
frame.onpointerleave = () => cursor.style.display = 'none';

frame.addEventListener('wheel', e => {
  e.preventDefault();
  if (!cover.hidden) return;
  if (e.ctrlKey) zoomAt(e.clientX, e.clientY, Math.exp(-e.deltaY * 0.005));
  else { tx -= e.deltaX; ty -= e.deltaY; apply(); }
}, { passive: false });

const nav = document.getElementById('nav');
const titleDiv = document.getElementById('title');
const showImage = id => {
  const img = new Image();
  img.onerror = () => id !== released[0] && showImage(released[0]);
  img.onload = () => {
    current = id;
    pic = { w: img.naturalWidth, h: img.naturalHeight };
    picImg = img;
    history.replaceState(null, '', '?p=' + id);
    nav.hidden = released.length < 2 || !released.includes(id);
    clearInterval(ticker);
    timer.textContent = '00:00:00';
    clock.hidden = true;
    cover.hidden = false;
    stopBtn.disabled = false;
    ctx.clearRect(0, 0, c.width, c.height);
    undoStack.length = 0;
    c.style.backgroundImage = `url('${img.src}')`;
    if (id in titles){
      titleDiv.innerText = titles[id]
    } else {
      titleDiv.innerText = "?"
    }
    refit();
  };
  img.src = 'imgs/' + id + '.png';
};
const step = d => showImage(released[(released.indexOf(current) + d + released.length) % released.length]);
document.getElementById('prev').onclick = () => step(-1);
document.getElementById('next').onclick = () => step(1);
showImage(new URLSearchParams(location.search).get('p') || released[0]);

const printOut = document.getElementById('print-out');
document.getElementById('print').onclick = () => {
  if (!cover.hidden) return;
  const { w, h } = pic, p = printOut.getContext('2d');
  printOut.width = w; printOut.height = h;
  p.drawImage(picImg, 0, 0);
  p.drawImage(c, (c.width - w) / 2, (c.height - h) / 2, w, h, 0, 0, w, h);
  print();
};

document.addEventListener('touchstart', () => {}, { passive: true });
