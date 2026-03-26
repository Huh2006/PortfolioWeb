/* ═══════════════════════════════════════════════
   Adrian's Portfolio — Sketch Desktop OS
   ═══════════════════════════════════════════════ */

const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);
const RC = (c) => typeof rough !== 'undefined' ? rough.canvas(c) : null;

/* ═══ HERO ═════════════════════════════════════════ */

/* ─── Trail Canvas ─────────────────────────────── */
(function initTrail() {
  const canvas = $('#trailCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let strokes = [], lx = null, ly = null;

  function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  const hero = $('#heroWrap');
  hero.addEventListener('mousemove', e => {
    const x = e.clientX, y = e.clientY;
    if (lx !== null) strokes.push({ x1: lx, y1: ly, x2: x, y2: y, life: 1, w: Math.random() * 0.8 + 0.3 });
    lx = x; ly = y;
  });
  hero.addEventListener('mouseleave', () => { lx = null; ly = null; });

  (function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    strokes = strokes.filter(s => s.life > 0.01);
    strokes.forEach(s => {
      for (let i = 0; i < 3; i++) {
        const ox = (Math.random() - 0.5) * 1.4, oy = (Math.random() - 0.5) * 1.4;
        ctx.beginPath();
        ctx.moveTo(s.x1 + ox, s.y1 + oy);
        ctx.lineTo(s.x2 + ox, s.y2 + oy);
        ctx.strokeStyle = `rgba(26,26,26,${s.life * 0.13})`;
        ctx.lineWidth = s.w * (0.4 + Math.random() * 0.6);
        ctx.lineCap = 'round';
        ctx.stroke();
      }
      s.life *= 0.982;
    });
    requestAnimationFrame(loop);
  })();
})();

/* ─── Hero Sketch (laptop drawing) ─────────────── */
(function drawHeroSketch() {
  const canvas = $('#sketchCanvas');
  if (!canvas) return;
  const rc = RC(canvas);
  if (!rc) return;
  const ctx = canvas.getContext('2d');
  const W = 480, H = 480;
  const ink = '#1A1A1A', green = '#4A7C59', warm = '#C4956A';
  const iO = { roughness: 1.4, strokeWidth: 1.2, stroke: ink };
  const gO = { ...iO, stroke: green, roughness: 1.8 };
  const wO = { ...iO, stroke: warm, roughness: 1.6 };

  let t = 0;
  const d = (fn, ms) => setTimeout(fn, ms);

  d(() => rc.circle(W / 2, H / 2, 370, { ...iO, roughness: 2.2, strokeWidth: 1, stroke: '#CCCAC4' }), t += 0);
  d(() => rc.circle(W / 2, H / 2, 190, { ...gO, strokeWidth: 1.3 }), t += 130);
  d(() => rc.rectangle(148, 148, 184, 128, { ...iO, strokeWidth: 1.3 }), t += 110);
  d(() => rc.line(162, 165, 318, 165, { ...iO, roughness: 1, strokeWidth: 0.8, stroke: '#CCCAC4' }), t += 60);
  d(() => rc.line(240, 276, 240, 306, { ...iO, strokeWidth: 1.1 }), t += 70);
  d(() => rc.line(205, 306, 275, 306, { ...iO, strokeWidth: 1.1 }), t += 50);
  d(() => {
    ctx.font = '600 28px Caveat, cursive'; ctx.fillStyle = green; ctx.globalAlpha = 0;
    (function fi(a) {
      ctx.globalAlpha = a; ctx.fillText('</ >', 185, 222);
      if (a < 1) requestAnimationFrame(() => fi(Math.min(a + 0.05, 1)));
      else ctx.globalAlpha = 1;
    })(0);
  }, t += 110);
  d(() => {
    [[82, 92, 4.5, warm, 0.65], [392, 72, 3, green, 0.6], [62, 355, 3.5, ink, 0.25], [405, 348, 2.5, warm, 0.55], [265, 58, 2, green, 0.5]].forEach(([x, y, r, c, a]) => {
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = c; ctx.globalAlpha = a; ctx.fill();
    });
    ctx.globalAlpha = 1;
  }, t += 70);
  d(() => {
    [[328, 95, 362, 52], [346, 100, 380, 57], [364, 105, 398, 62]].forEach(([x1, y1, x2, y2]) => {
      rc.line(x1, y1, x2, y2, { ...wO, roughness: 1.2, strokeWidth: 0.8 });
    });
  }, t += 90);
  d(() => {
    ctx.globalAlpha = 0.6;
    ctx.font = '22px Caveat'; ctx.fillStyle = warm; ctx.fillText('✦', 74, 198);
    ctx.font = '14px Caveat'; ctx.fillStyle = green; ctx.fillText('✦', 374, 272);
    ctx.globalAlpha = 1;
  }, t += 90);
  d(() => {
    ctx.font = '400 16px Caveat'; ctx.fillStyle = ink;
    ctx.globalAlpha = 0.28; ctx.fillText('build. learn. repeat.', 128, 345); ctx.globalAlpha = 1;
  }, t += 130);

  setTimeout(() => {
    const hr = $('#heroRight');
    if (hr) hr.classList.add('visible');
  }, 800);
})();

/* ─── Enter Desktop (zoom into laptop) ─────────── */
$('#enterDesktop')?.addEventListener('click', () => {
  const wrap = $('#heroWrap');
  const desk = $('#desktop');
  wrap.classList.add('zooming');
  setTimeout(() => {
    wrap.classList.add('zoomed');
    desk.classList.remove('hidden');
    requestAnimationFrame(() => desk.classList.add('visible'));
    initDesktop();
  }, 1400);
});

function logoutDesktop() {
  const desk = $('#desktop');
  const wrap = $('#heroWrap');
  // Close all windows
  Object.keys(openWindows).forEach(id => closeWindow(id));
  // Fade out desktop
  desk.classList.remove('visible');
  setTimeout(() => {
    desk.classList.add('hidden');
    wrap.classList.remove('zoomed', 'zooming');
    wrap.style.transition = 'none';
    requestAnimationFrame(() => {
      wrap.style.transition = '';
    });
  }, 500);
}


/* ═══ DESKTOP OS ═══════════════════════════════════ */

let windowZIndex = 100;
const openWindows = {};

function initDesktop() {
  renderDesktopIcons();
  startClock();
  $('#logoutBtn')?.addEventListener('click', logoutDesktop);
}

/* ─── Rough.js Icon Drawing Helpers ────────────── */
function drawFolderIcon(canvas, w, h) {
  const rc = RC(canvas); if (!rc) return;
  canvas.width = w; canvas.height = h;
  const s = w / 56;
  rc.rectangle(4 * s, 14 * s, 48 * s, 34 * s, { roughness: 1.8, stroke: '#C4956A', strokeWidth: 1.5, fill: '#faebd7', fillStyle: 'solid' });
  rc.line(4 * s, 14 * s, 12 * s, 6 * s, { roughness: 1.5, stroke: '#C4956A', strokeWidth: 1.5 });
  rc.line(12 * s, 6 * s, 28 * s, 6 * s, { roughness: 1.5, stroke: '#C4956A', strokeWidth: 1.5 });
  rc.line(28 * s, 6 * s, 32 * s, 14 * s, { roughness: 1.5, stroke: '#C4956A', strokeWidth: 1.5 });
}

function drawFileIcon(canvas, w, h, ext) {
  const rc = RC(canvas); if (!rc) return;
  canvas.width = w; canvas.height = h;
  const s = w / 56;
  rc.rectangle(10 * s, 4 * s, 36 * s, 46 * s, { roughness: 1.8, stroke: '#1A1A1A', strokeWidth: 1.3, fill: '#fff', fillStyle: 'solid' });
  rc.line(10 * s, 4 * s, 32 * s, 4 * s, { roughness: 1, stroke: '#1A1A1A', strokeWidth: 1.3 });
  rc.line(32 * s, 4 * s, 46 * s, 16 * s, { roughness: 1.5, stroke: '#1A1A1A', strokeWidth: 1.3 });
  const ctx = canvas.getContext('2d');
  ctx.font = `${600} ${12 * s}px Caveat`; ctx.fillStyle = ext === '.txt' ? '#4A7C59' : '#C4956A';
  ctx.textAlign = 'center'; ctx.fillText(ext, 28 * s, 38 * s);
}

function drawPaintIcon(canvas, w, h) {
  const rc = RC(canvas); if (!rc) return;
  canvas.width = w; canvas.height = h;
  const s = w / 56;
  rc.circle(28 * s, 28 * s, 36 * s, { roughness: 2, stroke: '#1A1A1A', strokeWidth: 1.3 });
  // palette dots
  [[18, 18, '#e55'], [36, 16, '#4A7C59'], [38, 30, '#3a6fbf'], [24, 36, '#C4956A'], [14, 30, '#9b59b6']].forEach(([x, y, c]) => {
    rc.circle(x * s, y * s, 8 * s, { roughness: 1.5, stroke: c, strokeWidth: 1, fill: c, fillStyle: 'solid' });
  });
}

function drawAboutIcon(canvas, w, h) {
  const rc = RC(canvas); if (!rc) return;
  canvas.width = w; canvas.height = h;
  const s = w / 56;
  rc.rectangle(8 * s, 4 * s, 40 * s, 48 * s, { roughness: 2, stroke: '#1A1A1A', strokeWidth: 1.3, fill: '#fff', fillStyle: 'solid' });
  [[18, 20, 36, 20], [18, 28, 32, 28], [18, 36, 28, 36]].forEach(([x1, y1, x2, y2]) => {
    rc.line(x1 * s, y1 * s, x2 * s, y2 * s, { roughness: 1.2, stroke: '#4A7C59', strokeWidth: 1 });
  });
  rc.circle(28 * s, 12 * s, 6 * s, { roughness: 1.5, stroke: '#C4956A', strokeWidth: 1, fill: '#C4956A', fillStyle: 'solid' });
}

function drawResumeIcon(canvas, w, h) {
  const rc = RC(canvas); if (!rc) return;
  canvas.width = w; canvas.height = h;
  const s = w / 56;
  // Paper with folded corner
  rc.rectangle(8 * s, 4 * s, 40 * s, 48 * s, { roughness: 1.8, stroke: '#1A1A1A', strokeWidth: 1.3, fill: '#fff', fillStyle: 'solid' });
  rc.line(36 * s, 4 * s, 48 * s, 16 * s, { roughness: 1.5, stroke: '#1A1A1A', strokeWidth: 1.3 });
  // "CV" text
  const ctx = canvas.getContext('2d');
  ctx.font = `700 ${14 * s}px Caveat`; ctx.fillStyle = '#4A7C59';
  ctx.textAlign = 'center'; ctx.fillText('CV', 26 * s, 22 * s);
  // Lines representing text
  [[16, 28, 38, 28], [16, 34, 34, 34], [16, 40, 30, 40]].forEach(([x1, y1, x2, y2]) => {
    rc.line(x1 * s, y1 * s, x2 * s, y2 * s, { roughness: 1.2, stroke: '#9B9B9B', strokeWidth: 0.8 });
  });
}

function drawImageIcon(canvas, w, h) {
  const rc = RC(canvas); if (!rc) return;
  canvas.width = w; canvas.height = h;
  const s = w / 56;
  rc.rectangle(6 * s, 6 * s, 44 * s, 44 * s, { roughness: 1.8, stroke: '#1A1A1A', strokeWidth: 1.3, fill: '#e8f0e8', fillStyle: 'solid' });
  rc.circle(20 * s, 22 * s, 10 * s, { roughness: 1.5, stroke: '#C4956A', strokeWidth: 1, fill: '#ffd', fillStyle: 'solid' });
  rc.line(6 * s, 40 * s, 22 * s, 28 * s, { roughness: 1.5, stroke: '#4A7C59', strokeWidth: 1.3 });
  rc.line(22 * s, 28 * s, 34 * s, 36 * s, { roughness: 1.5, stroke: '#4A7C59', strokeWidth: 1.3 });
  rc.line(34 * s, 36 * s, 50 * s, 24 * s, { roughness: 1.5, stroke: '#4A7C59', strokeWidth: 1.3 });
}

/* ─── Desktop Icon Rendering ───────────────────── */
function renderDesktopIcons() {
  const area = $('#desktopIcons');
  area.innerHTML = '';

  const icons = [
    { id: 'files', label: 'Files', draw: drawFolderIcon, action: () => openFileExplorer() },
    { id: 'paint', label: 'Paint', draw: drawPaintIcon, action: () => openPaint() },
    { id: 'about', label: 'About Me', draw: drawAboutIcon, action: () => openAbout() },
    { id: 'resume', label: 'Resume', draw: drawResumeIcon, action: () => openResume() },
  ];

  icons.forEach(ico => {
    const el = document.createElement('div');
    el.className = 'desk-icon';
    el.innerHTML = `<canvas width="56" height="56"></canvas><span class="desk-icon-label">${ico.label}</span>`;
    const cvs = el.querySelector('canvas');
    ico.draw(cvs, 56, 56);

    let clicks = 0, clickTimer;
    el.addEventListener('click', () => {
      clicks++;
      if (clicks === 1) {
        clickTimer = setTimeout(() => { clicks = 0; el.classList.toggle('selected'); }, 300);
      } else if (clicks === 2) {
        clearTimeout(clickTimer);
        clicks = 0;
        ico.action();
      }
    });
    area.appendChild(el);
  });
}

/* ─── Window Manager ───────────────────────────── */
function createWindow(id, title, width, height, content, opts = {}) {
  if (openWindows[id]) {
    focusWindow(id);
    if (openWindows[id].minimized) toggleMinimize(id);
    return openWindows[id].el;
  }

  const layer = $('#windowLayer');
  const el = document.createElement('div');
  el.className = 'window';
  el.id = 'win-' + id;
  el.style.width = width + 'px';
  el.style.height = height + 'px';

  // Center with slight random offset
  const ox = Math.round((window.innerWidth - width) / 2 + (Math.random() - 0.5) * 60);
  const oy = Math.round((window.innerHeight - 48 - height) / 2 + (Math.random() - 0.5) * 40);
  el.style.left = Math.max(20, ox) + 'px';
  el.style.top = Math.max(20, oy) + 'px';
  el.style.zIndex = ++windowZIndex;

  el.innerHTML = `
    <div class="win-titlebar">
      <span class="win-title">${title}</span>
      <div class="win-controls">
        <button class="win-ctrl minimize" title="Minimize">–</button>
        <button class="win-ctrl maximize" title="Maximize">□</button>
        <button class="win-ctrl close" title="Close">×</button>
      </div>
    </div>
    <div class="win-body">${content}</div>`;

  layer.appendChild(el);

  // Open animation
  requestAnimationFrame(() => el.classList.add('open', 'focused'));

  // Dragging
  const bar = el.querySelector('.win-titlebar');
  let dragging = false, dx, dy;
  bar.addEventListener('mousedown', e => {
    if (e.target.closest('.win-ctrl')) return;
    dragging = true;
    dx = e.clientX - el.offsetLeft;
    dy = e.clientY - el.offsetTop;
    el.style.transition = 'none';
    focusWindow(id);
  });
  document.addEventListener('mousemove', e => {
    if (!dragging) return;
    el.style.left = (e.clientX - dx) + 'px';
    el.style.top = (e.clientY - dy) + 'px';
  });
  document.addEventListener('mouseup', () => {
    if (dragging) {
      dragging = false;
      el.style.transition = '';
    }
  });

  // Focus on click
  el.addEventListener('mousedown', () => focusWindow(id));

  // Controls
  el.querySelector('.win-ctrl.close').addEventListener('click', () => closeWindow(id));
  el.querySelector('.win-ctrl.minimize').addEventListener('click', () => toggleMinimize(id));
  el.querySelector('.win-ctrl.maximize').addEventListener('click', () => toggleMaximize(id));

  openWindows[id] = { el, title, minimized: false, maximized: false, restore: null };
  addTaskbarButton(id, title);

  if (opts.onReady) setTimeout(() => opts.onReady(el), 50);

  return el;
}

function focusWindow(id) {
  Object.keys(openWindows).forEach(k => {
    openWindows[k].el.classList.toggle('focused', k === id);
  });
  openWindows[id].el.style.zIndex = ++windowZIndex;
  $$('.tb-win-btn').forEach(b => b.classList.toggle('active', b.dataset.winId === id));
}

function closeWindow(id) {
  const win = openWindows[id];
  if (!win) return;
  win.el.classList.remove('open');
  setTimeout(() => win.el.remove(), 250);
  delete openWindows[id];
  $(`[data-win-id="${id}"]`)?.remove();
}

function toggleMinimize(id) {
  const win = openWindows[id];
  if (!win) return;
  win.minimized = !win.minimized;
  win.el.classList.toggle('minimized', win.minimized);
}

function toggleMaximize(id) {
  const win = openWindows[id];
  if (!win) return;
  if (!win.maximized) {
    win.restore = {
      left: win.el.style.left, top: win.el.style.top,
      width: win.el.style.width, height: win.el.style.height
    };
    win.el.style.left = '0'; win.el.style.top = '0';
    win.el.style.width = '100vw'; win.el.style.height = 'calc(100vh - 48px)';
    win.maximized = true;
  } else {
    Object.assign(win.el.style, win.restore);
    win.maximized = false;
  }
}

function addTaskbarButton(id, title) {
  const bar = $('#tbWindows');
  const btn = document.createElement('button');
  btn.className = 'tb-win-btn active';
  btn.dataset.winId = id;
  btn.textContent = title;
  btn.addEventListener('click', () => {
    const win = openWindows[id];
    if (win.minimized) toggleMinimize(id);
    focusWindow(id);
  });
  bar.appendChild(btn);
  // Unfocus others
  bar.querySelectorAll('.tb-win-btn').forEach(b => b.classList.toggle('active', b.dataset.winId === id));
}

/* ─── Clock ────────────────────────────────────── */
function startClock() {
  const el = $('#tbClock');
  function tick() {
    const d = new Date();
    el.textContent = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  tick();
  setInterval(tick, 30000);
}


/* ═══ FILE EXPLORER ════════════════════════════════ */

function openFileExplorer(startPath) {
  const path = startPath || '/';
  const content = `
    <div class="fe-toolbar">
      <button class="fe-back" id="feBack" disabled>← Back</button>
      <div class="fe-breadcrumb" id="feBread">/ My Files</div>
    </div>
    <div class="fe-grid" id="feGrid"></div>`;

  createWindow('files', 'Files', 680, 460, content, {
    onReady: () => navigateTo(path)
  });
}

let feHistory = [];
let feCurrentPath = '/';

function navigateTo(path) {
  feCurrentPath = path;

  const grid = $('#feGrid');
  const bread = $('#feBread');
  const back = $('#feBack');
  if (!grid) return;

  grid.innerHTML = '';

  const projects = window.PortfolioData ? window.PortfolioData.getProjects() : [];

  if (path === '/') {
    // Root: show Projects folder + about.txt + contact.txt
    bread.innerHTML = '/ My Files';
    back.disabled = true;

    addFolderItem(grid, 'Projects', () => { feHistory.push('/'); navigateTo('/projects'); });
    addFileItem(grid, 'about.txt', '.txt', () => openAbout());
    addFileItem(grid, 'resume.txt', '.txt', () => openResume());
    addFileItem(grid, 'contact.txt', '.txt', () => openContactNote());

  } else if (path === '/projects') {
    bread.innerHTML = '/ My Files <span>/</span> Projects';
    back.disabled = false;
    back.onclick = () => { const prev = feHistory.pop() || '/'; navigateTo(prev); };

    projects.forEach(p => {
      addFolderItem(grid, p.title, () => {
        feHistory.push('/projects');
        navigateTo('/projects/' + p.id);
      });
    });

    if (projects.length === 0) {
      grid.innerHTML = '<div style="padding:40px;text-align:center;font-size:20px;color:var(--ink-light)">No projects yet</div>';
    }

  } else if (path.startsWith('/projects/')) {
    const pid = path.split('/')[2];
    const proj = projects.find(p => p.id === pid);
    if (!proj) return navigateTo('/projects');

    bread.innerHTML = `/ My Files <span>/</span> Projects <span>/</span> ${proj.title}`;
    back.disabled = false;
    back.onclick = () => { const prev = feHistory.pop() || '/projects'; navigateTo(prev); };

    addFileItem(grid, 'info.txt', '.txt', () => openProjectNote(proj));
    addFileItem(grid, 'thumbnail.png', '.png', () => openProjectThumbnail(proj));
  }
}

function addFolderItem(grid, name, onClick) {
  const el = document.createElement('div');
  el.className = 'fe-item';
  el.innerHTML = `<canvas width="48" height="48"></canvas><span class="fe-item-name">${name}</span>`;
  drawFolderIcon(el.querySelector('canvas'), 48, 48);
  let clicks = 0, timer;
  el.addEventListener('click', () => {
    clicks++;
    if (clicks === 2) { clearTimeout(timer); clicks = 0; onClick(); }
    else timer = setTimeout(() => clicks = 0, 350);
  });
  grid.appendChild(el);
}

function addFileItem(grid, name, ext, onClick) {
  const el = document.createElement('div');
  el.className = 'fe-item';
  el.innerHTML = `<canvas width="48" height="48"></canvas><span class="fe-item-name">${name}</span>`;
  const cvs = el.querySelector('canvas');
  if (ext === '.png' || ext === '.jpg') drawImageIcon(cvs, 48, 48);
  else drawFileIcon(cvs, 48, 48, ext);
  let clicks = 0, timer;
  el.addEventListener('click', () => {
    clicks++;
    if (clicks === 2) { clearTimeout(timer); clicks = 0; onClick(); }
    else timer = setTimeout(() => clicks = 0, 350);
  });
  grid.appendChild(el);
}


/* ═══ NOTEPAD WINDOWS ══════════════════════════════ */

function openProjectNote(proj) {
  const tags = (proj.tech || []).map(t => `<span class="tech-tag">${t}</span>`).join('');
  const tagsSection = tags ? `<h3>Tech Stack</h3><div class="tech-list">${tags}</div>` : '';
  const journal = proj.journal ? `<h3>The Story</h3><p>${proj.journal.replace(/\n/g, '<br>')}</p>` : '';
  const whatIDid = proj.whatIDid ? `<h3>What I Did</h3><p>${proj.whatIDid.replace(/\n/g, '<br>')}</p>` : '';
  const linkBtn = proj.link
    ? `<a href="${proj.link}" target="_blank" rel="noopener" class="note-btn">${proj.linkType === 'download' ? '↓ Download Files' : '→ Visit Project'}</a>`
    : '';

  const statusLabel = { live: '● Live', wip: '◐ Work in Progress', soon: '○ Coming Soon' }[proj.status] || proj.status;

  const body = `
    <div class="notepad-body">
      <h2>${proj.title}</h2>
      <p style="color:var(--ink-light);font-size:16px">${statusLabel}${proj.featured ? '  ★ Featured' : ''}</p>
      <p>${proj.desc || 'No description yet.'}</p>
      ${journal}
      ${whatIDid}
      ${tagsSection}
      ${linkBtn}
    </div>`;

  createWindow('note-' + proj.id, proj.title + ' — info.txt', 520, 440, body);
}

function openProjectThumbnail(proj) {
  const body = `<div class="img-viewer"><canvas id="thumbCanvas-${proj.id}" width="400" height="280"></canvas></div>`;
  createWindow('thumb-' + proj.id, proj.title + ' — thumbnail.png', 460, 360, body, {
    onReady: () => {
      const cvs = $(`#thumbCanvas-${proj.id}`);
      if (!cvs) return;
      const rc = RC(cvs); if (!rc) return;
      const ctx = cvs.getContext('2d');

      // Draw a sketch placeholder thumbnail
      ctx.fillStyle = '#f0ece4'; ctx.fillRect(0, 0, 400, 280);
      rc.rectangle(20, 20, 360, 240, { roughness: 2, stroke: '#1A1A1A', strokeWidth: 1.5 });
      rc.line(20, 60, 380, 60, { roughness: 1.5, stroke: '#E5E0D5', strokeWidth: 1 });

      // Draw project name
      ctx.font = '700 32px Caveat'; ctx.fillStyle = '#1A1A1A';
      ctx.textAlign = 'center'; ctx.fillText(proj.title, 200, 160);

      ctx.font = '400 18px Caveat'; ctx.fillStyle = '#9B9B9B';
      ctx.fillText('thumbnail coming soon', 200, 200);

      // Doodle dots
      [[40, 40, 4, '#4A7C59'], [360, 40, 3, '#C4956A'], [200, 240, 3, '#1A1A1A']].forEach(([x, y, r, c]) => {
        rc.circle(x, y, r * 2, { roughness: 1.5, stroke: c, fill: c, fillStyle: 'solid', strokeWidth: 0.8 });
      });
    }
  });
}

function openAbout() {
  const body = `
    <div class="notepad-body about-text">
      <div class="about-heading">Hi, I'm Adrian ✦</div>
      <p>
        <strong>IT student at RMIT</strong> with a genuine curiosity for how things are built.
        I enjoy turning ideas into real, working things.
      </p>
      <p>
        When I'm not studying, I'm exploring new tech, tinkering with projects,
        and trying to make things that actually matter.
      </p>
      <p style="margin-top:16px;color:var(--ink-light);font-size:16px">
        ★ Problem Solver &nbsp; ★ Builder &nbsp; ★ Always Learning
      </p>
    </div>`;

  createWindow('about', 'About Me — about.txt', 480, 420, body);
}

function openResume() {
  const body = `
    <div class="notepad-body resume-text">
      <h2 style="font-size:36px;margin-bottom:2px">Adrian Tan</h2>
      <p style="color:var(--ink-light);font-size:16px;margin-bottom:20px">
        adrian@anda.land &nbsp;·&nbsp; 0435 833 331 &nbsp;·&nbsp; Glen Waverley, VIC
      </p>

      <h3 style="color:var(--ink)">Profile</h3>
      <p>
        IT student at RMIT with practical experience in CRM administration, website maintenance
        (Shopify, WordPress) and on-page SEO. I have supported CRM migrations, cleaned and
        deduplicated customer data, and implemented automation to improve lead follow-up and
        customer lifecycle management. Technical skills include Java, HTML/CSS, JavaScript and
        3D modelling with Blender; combined with customer-facing roles, I bring strong
        communication and problem-solving abilities.
      </p>

      <h3 style="color:var(--ink)">Skills</h3>
      <div class="tech-list">
        <span class="tech-tag">Java</span>
        <span class="tech-tag">HTML</span>
        <span class="tech-tag">CSS</span>
        <span class="tech-tag">JavaScript</span>
        <span class="tech-tag">3D Modelling (Blender)</span>
        <span class="tech-tag">Photography</span>
        <span class="tech-tag">CRM Administration</span>
        <span class="tech-tag">SEO</span>
        <span class="tech-tag">Shopify</span>
        <span class="tech-tag">WordPress</span>
      </div>

      <h3 style="color:var(--ink)">Employment History</h3>

      <div style="margin-bottom:20px">
        <p><strong>IT Intern — Andatech</strong> <span style="color:var(--ink-light);font-size:15px">&nbsp; Vermont South &nbsp;·&nbsp; Sept 2025 — Feb 2026</span></p>
        <p style="font-size:16px;margin-left:12px">
          · Maintained and optimised multiple company websites through on-page SEO, content updates and technical fixes<br>
          · Monitored website performance and analytics to reduce load times and improve crawlability<br>
          · Collaborated with marketing and development teams to implement SEO recommendations<br>
          · Updated and created pages and elements on Shopify and WordPress
        </p>
      </div>

      <div style="margin-bottom:20px">
        <p><strong>CRM Assistant — Andatech</strong> <span style="color:var(--ink-light);font-size:15px">&nbsp; Vermont South &nbsp;·&nbsp; Jun 2025 — Aug 2026</span></p>
        <p style="font-size:16px;margin-left:12px">
          · Maintained and enhanced CRM database accuracy by cleaning, deduplicating and segmenting customer records<br>
          · Assisted in migrating between CRM platforms<br>
          · Collaborated with sales and product teams to implement CRM workflows and automation
        </p>
      </div>

      <div style="margin-bottom:20px">
        <p><strong>Front of House — Nana Green Tea</strong> <span style="color:var(--ink-light);font-size:15px">&nbsp; Melbourne &nbsp;·&nbsp; Sept 2024 — Feb 2025</span></p>
        <p style="font-size:16px;margin-left:12px">
          · Delivered friendly, efficient customer service — greeting guests, taking orders and ensuring accurate payment processing<br>
          · Operated POS system and handled cash/card transactions; reconciled tills and prepared end-of-day reports<br>
          · Prepared and served beverages and menu items to company standards<br>
          · Coordinated with kitchen staff to manage table turnover during peak periods
        </p>
      </div>

      <div style="margin-bottom:20px">
        <p><strong>Kitchen Hand — Local Hero Singapore</strong> <span style="color:var(--ink-light);font-size:15px">&nbsp; Wantirna South &nbsp;·&nbsp; Mar 2023 — Apr 2024</span></p>
        <p style="font-size:16px;margin-left:12px">
          · Prepared and plated menu items to strict recipe and presentation standards<br>
          · Coordinated with front-of-house to prioritise orders during peak periods<br>
          · Managed stock rotation and conducted inventory checks<br>
          · Onboarded and coached new kitchen staff in prep techniques and safety protocols
        </p>
      </div>

      <h3 style="color:var(--ink)">Education</h3>

      <div style="margin-bottom:12px">
        <p><strong>Information Technology — RMIT</strong> <span style="color:var(--ink-light);font-size:15px">&nbsp; Melbourne &nbsp;·&nbsp; Feb 2025 — Feb 2028</span></p>
      </div>

      <div style="margin-bottom:12px">
        <p><strong>St Andrews Christian College</strong> <span style="color:var(--ink-light);font-size:15px">&nbsp; Wantirna South &nbsp;·&nbsp; Jan 2011 — Dec 2024</span></p>
        <p style="font-size:16px;margin-left:12px">· Graduated Primary and Highschool</p>
      </div>

      <div style="margin-top:24px;padding-top:16px;border-top:1.5px solid var(--rule)">
        <div style="display:flex;gap:12px;flex-wrap:wrap">
          <a href="https://github.com/Huh2006" target="_blank" class="note-btn">GitHub</a>
          <a href="https://linkedin.com/in/adrian-tan12" target="_blank" class="note-btn">LinkedIn</a>
          <a href="mailto:adrian@anda.land" class="note-btn">Email Me</a>
        </div>
      </div>
    </div>`;

  createWindow('resume', 'Adrian Tan — Resume', 560, 520, body);
}

function openContactNote() {
  const body = `
    <div class="notepad-body about-text">
      <div class="about-heading">Let's connect :)</div>
      <p>Have a project idea? Want to collaborate? Just want to say hi?</p>
      <p>My inbox is always open.</p>
      <div class="about-links" style="margin-top:24px">
        <a href="mailto:adrian@anda.land">✉ adrian@anda.land</a>
        <a href="https://github.com/Huh2006" target="_blank">◉ GitHub — @Huh2006</a>
        <a href="https://linkedin.com/in/adrian-tan12" target="_blank">◉ LinkedIn — adrian-tan12</a>
      </div>
    </div>`;

  createWindow('contact', 'Contact — contact.txt', 440, 360, body);
}


/* ═══ PAINT APP ════════════════════════════════════ */

function openPaint() {
  const colors = ['#1A1A1A', '#e55', '#4A7C59', '#3a6fbf', '#C4956A', '#9b59b6', '#f0c040', '#fff'];
  const colorBtns = colors.map((c, i) =>
    `<button class="paint-color${i === 0 ? ' active' : ''}" style="background:${c}" data-color="${c}"></button>`
  ).join('');

  const content = `
    <div class="paint-wrap">
      <div class="paint-toolbar">
        <button class="paint-tool active" data-tool="pencil" title="Pencil"><canvas width="22" height="22"></canvas></button>
        <button class="paint-tool" data-tool="brush" title="Brush"><canvas width="22" height="22"></canvas></button>
        <button class="paint-tool" data-tool="eraser" title="Eraser"><canvas width="22" height="22"></canvas></button>
        <div class="paint-sep"></div>
        <button class="paint-tool" data-tool="line" title="Line"><canvas width="22" height="22"></canvas></button>
        <button class="paint-tool" data-tool="rect" title="Rectangle"><canvas width="22" height="22"></canvas></button>
        <button class="paint-tool" data-tool="circle" title="Circle"><canvas width="22" height="22"></canvas></button>
        <div class="paint-sep"></div>
        <div class="paint-colors">${colorBtns}</div>
        <div class="paint-size">
          <label>size</label>
          <input type="range" min="1" max="20" value="3" id="paintSize">
        </div>
        <button class="paint-clear">clear</button>
      </div>
      <div class="paint-canvas-wrap">
        <canvas id="paintCanvas"></canvas>
      </div>
    </div>`;

  createWindow('paint', 'Paint', 720, 500, content, {
    onReady: (win) => initPaintApp(win)
  });
}

function initPaintApp(win) {
  const wrap = win.querySelector('.paint-canvas-wrap');
  const canvas = win.querySelector('#paintCanvas');
  if (!canvas || !wrap) return;

  // Size canvas to fill wrapper
  function resizeCanvas() {
    const rect = wrap.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    // Redraw saved image data
    if (savedData) ctx.putImageData(savedData, 0, 0);
  }

  const ctx = canvas.getContext('2d');
  let savedData = null;
  let tool = 'pencil', color = '#1A1A1A', size = 3;
  let drawing = false, startX, startY, lastX, lastY;
  let undoStack = [];

  resizeCanvas();
  // Fill white
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw tool icons with Rough.js
  const toolCanvases = win.querySelectorAll('.paint-tool canvas');
  if (typeof rough !== 'undefined') {
    const iconData = [
      (c) => { const r = RC(c); r.line(4, 18, 18, 4, { roughness: 1.5, stroke: '#1A1A1A', strokeWidth: 1.5 }); }, // pencil
      (c) => { const r = RC(c); r.circle(11, 11, 14, { roughness: 2, stroke: '#1A1A1A', strokeWidth: 1.5, fill: '#1A1A1A', fillStyle: 'solid' }); }, // brush
      (c) => { const r = RC(c); r.rectangle(4, 6, 14, 10, { roughness: 2, stroke: '#1A1A1A', strokeWidth: 1.3 }); }, // eraser
      (c) => { const r = RC(c); r.line(3, 19, 19, 3, { roughness: 1.5, stroke: '#1A1A1A', strokeWidth: 1.5 }); }, // line
      (c) => { const r = RC(c); r.rectangle(3, 3, 16, 16, { roughness: 2, stroke: '#1A1A1A', strokeWidth: 1.3 }); }, // rect
      (c) => { const r = RC(c); r.circle(11, 11, 16, { roughness: 2, stroke: '#1A1A1A', strokeWidth: 1.3 }); }, // circle
    ];
    toolCanvases.forEach((c, i) => { if (iconData[i]) iconData[i](c); });
  }

  // Tool selection
  win.querySelectorAll('.paint-tool').forEach(btn => {
    btn.addEventListener('click', () => {
      win.querySelectorAll('.paint-tool').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      tool = btn.dataset.tool;
      wrap.style.cursor = tool === 'eraser' ? 'cell' : 'crosshair';
    });
  });

  // Color selection
  win.querySelectorAll('.paint-color').forEach(btn => {
    btn.addEventListener('click', () => {
      win.querySelectorAll('.paint-color').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      color = btn.dataset.color;
    });
  });

  // Size
  const sizeSlider = win.querySelector('#paintSize');
  sizeSlider.addEventListener('input', () => { size = parseInt(sizeSlider.value); });

  // Clear
  win.querySelector('.paint-clear').addEventListener('click', () => {
    saveUndo();
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  });

  function saveUndo() {
    undoStack.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    if (undoStack.length > 25) undoStack.shift();
  }

  // Pencil drawing — use Rough.js for sketch feel on freehand tools
  function pencilStroke(x1, y1, x2, y2) {
    const rc = RC(canvas);
    if (rc && tool === 'pencil') {
      rc.line(x1, y1, x2, y2, {
        roughness: 1.5,
        stroke: color,
        strokeWidth: size * 0.8,
        bowing: 0.5
      });
    } else {
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = tool === 'eraser' ? '#fff' : color;
      ctx.lineWidth = tool === 'brush' ? size * 3 : (tool === 'eraser' ? size * 4 : size);
      ctx.lineCap = 'round';
      ctx.stroke();
    }
  }

  canvas.addEventListener('mousedown', e => {
    drawing = true;
    const rect = canvas.getBoundingClientRect();
    startX = lastX = e.clientX - rect.left;
    startY = lastY = e.clientY - rect.top;
    saveUndo();

    if (tool === 'pencil' || tool === 'brush' || tool === 'eraser') {
      pencilStroke(lastX, lastY, lastX + 0.1, lastY + 0.1);
    }
  });

  canvas.addEventListener('mousemove', e => {
    if (!drawing) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (tool === 'pencil' || tool === 'brush' || tool === 'eraser') {
      pencilStroke(lastX, lastY, x, y);
      lastX = x; lastY = y;
    }
    // For shape tools, we could show preview but keeping it simple
  });

  canvas.addEventListener('mouseup', e => {
    if (!drawing) return;
    drawing = false;
    const rect = canvas.getBoundingClientRect();
    const endX = e.clientX - rect.left;
    const endY = e.clientY - rect.top;
    const rc = RC(canvas);

    if (tool === 'line' && rc) {
      rc.line(startX, startY, endX, endY, { roughness: 1.8, stroke: color, strokeWidth: size });
    } else if (tool === 'rect' && rc) {
      rc.rectangle(Math.min(startX, endX), Math.min(startY, endY),
        Math.abs(endX - startX), Math.abs(endY - startY),
        { roughness: 2, stroke: color, strokeWidth: size });
    } else if (tool === 'circle' && rc) {
      const cx = (startX + endX) / 2, cy = (startY + endY) / 2;
      const w = Math.abs(endX - startX), h = Math.abs(endY - startY);
      rc.ellipse(cx, cy, w, h, { roughness: 2, stroke: color, strokeWidth: size });
    }

    savedData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  });

  canvas.addEventListener('mouseleave', () => {
    if (drawing) {
      drawing = false;
      savedData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    }
  });

  // Ctrl+Z undo
  document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'z' && openWindows['paint']) {
      e.preventDefault();
      if (undoStack.length) ctx.putImageData(undoStack.pop(), 0, 0);
    }
  });
}


/* ═══ EXPOSE FOR ADMIN ═════════════════════════════ */
window.isAdmin = window.isAdmin || (() => false);
window.refreshDesktopFiles = () => {
  if (openWindows['files']) {
    navigateTo(feCurrentPath);
  }
};
