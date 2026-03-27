/* ═══════════════════════════════════════════════
   Adrian's Portfolio — Sketch Desktop OS
   ═══════════════════════════════════════════════ */

const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);
const RC = (c) => typeof rough !== 'undefined' ? rough.canvas(c) : null;

/* ═══ GLOBAL WRIGGLE ENGINE ════════════════════════
   Every canvas with ._wriggleDraw gets constantly redrawn.
   Rough.js randomness makes each redraw slightly different
   → living, breathing sketch effect.
   ═══════════════════════════════════════════════════ */
let WRIGGLE_FPS = 8; // redraws per second (smooth wiggle without killing CPU)
let _wriggleRunning = false;
let _wriggleLast = 0;

function startWriggle() {
  if (_wriggleRunning) return;
  _wriggleRunning = true;
  requestAnimationFrame(wriggleTick);
}

function stopWriggle() {
  _wriggleRunning = false;
}

function wriggleTick(ts) {
  if (!_wriggleRunning) return;
  if (ts - _wriggleLast >= 1000 / WRIGGLE_FPS) {
    _wriggleLast = ts;
    document.querySelectorAll('[data-wriggle]').forEach(cvs => {
      if (cvs._wriggleDraw && cvs.offsetParent !== null) { // only if visible
        const ctx = cvs.getContext('2d');
        ctx.clearRect(0, 0, cvs.width, cvs.height);
        cvs._wriggleDraw();
      }
    });
  }
  requestAnimationFrame(wriggleTick);
}

function markWriggle(canvas, drawFn) {
  canvas.setAttribute('data-wriggle', '');
  canvas._wriggleDraw = drawFn;
}

/* ═══ SIMPLE FADE TRANSITION ═══════════════════════ */
function fadeTransition(duringFn) {
  return new Promise(resolve => {
    const overlay = $('#scribbleOverlay');
    if (!overlay) { duringFn?.(); resolve(); return; }
    const ctx = overlay.getContext('2d');
    overlay.width = window.innerWidth;
    overlay.height = window.innerHeight;
    ctx.clearRect(0, 0, overlay.width, overlay.height);
    overlay.classList.add('active');

    // Fade to black
    let alpha = 0;
    function fadeIn() {
      alpha += 0.06;
      ctx.fillStyle = `rgba(0,0,0,${Math.min(alpha, 1)})`;
      ctx.fillRect(0, 0, overlay.width, overlay.height);
      if (alpha < 1) {
        requestAnimationFrame(fadeIn);
      } else {
        duringFn?.();
        setTimeout(() => {
          overlay.style.transition = 'opacity 0.4s ease-out';
          overlay.style.opacity = '0';
          setTimeout(() => {
            overlay.classList.remove('active');
            overlay.style.transition = '';
            overlay.style.opacity = '';
            ctx.clearRect(0, 0, overlay.width, overlay.height);
            resolve();
          }, 420);
        }, 150);
      }
    }
    requestAnimationFrame(fadeIn);
  });
}

/* ═══ BOOT SCREEN ══════════════════════════════════ */
(function boot() {
  const screen = $('#bootScreen');
  if (!screen) return;

  const lines = [
    'loading adrian.os...',
    'mounting filesystem',
    'initializing rough.js engine',
    'loading projects from memory',
    'preparing desktop icons',
    'connecting pencil driver',
    'boot complete — welcome back, Adrian'
  ];

  const linesEl = $('#bootLines');
  const bar = $('#bootBar');
  const logo = $('#bootLogo');

  // Draw boot logo with Rough.js
  setTimeout(() => {
    const rc = RC(logo);
    if (rc) {
      rc.circle(30, 30, 40, { roughness: 2, stroke: '#4A7C59', strokeWidth: 1.5 });
      rc.line(18, 30, 42, 30, { roughness: 1.5, stroke: '#F7F5F0', strokeWidth: 1.3 });
      rc.line(30, 18, 30, 42, { roughness: 1.5, stroke: '#F7F5F0', strokeWidth: 1.3 });
    }
  }, 100);

  let i = 0;
  const total = lines.length;

  function addLine() {
    if (i >= total) {
      // Boot done — scribble transition to hero
      setTimeout(() => {
        fadeTransition(() => {
          screen.classList.add('hidden');
          const hero = $('#heroWrap');
          hero.classList.remove('hidden');
        });
      }, 400);
      return;
    }

    const div = document.createElement('div');
    div.className = 'line' + (i === total - 1 ? ' ok' : '');
    div.textContent = '> ' + lines[i];
    div.style.animationDelay = '0s';
    linesEl.appendChild(div);
    bar.style.width = ((i + 1) / total * 100) + '%';
    i++;

    // Scroll to bottom
    linesEl.scrollTop = linesEl.scrollHeight;

    const delay = 200 + Math.random() * 350;
    setTimeout(addLine, delay);
  }

  setTimeout(addLine, 600);
})();

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

/* ─── Enter Desktop (scribble transition) ─────────── */
$('#enterDesktop')?.addEventListener('click', () => {
  const wrap = $('#heroWrap');
  const desk = $('#desktop');

  fadeTransition(() => {
    // Swap views while scribbles cover the screen
    wrap.classList.add('zoomed');
    desk.classList.remove('hidden');
    requestAnimationFrame(() => desk.classList.add('visible'));
    initDesktop();
  });
});

function logoutDesktop() {
  const desk = $('#desktop');
  const wrap = $('#heroWrap');
  // Stop wriggle engine
  stopWriggle();
  // Stop music
  if (musicState.playing) {
    musicState.playing = false;
    stopSynth();
    stopMusicTick();
  }
  // Close all windows
  Object.keys(openWindows).forEach(id => closeWindow(id));

  // Scribble transition back to hero
  fadeTransition(() => {
    desk.classList.remove('visible');
    desk.classList.add('hidden');
    wrap.classList.remove('zoomed', 'zooming');
    wrap.classList.remove('hidden');
    wrap.style.transition = 'none';
    requestAnimationFrame(() => {
      wrap.style.transition = '';
    });
  });
}


/* ═══ DESKTOP OS ═══════════════════════════════════ */

let windowZIndex = 100;
const openWindows = {};

let _desktopInited = false;
function initDesktop() {
  // Kill any existing music completely before doing anything
  stopSynth();
  stopMusicTick();
  musicState.playing = false;

  renderDesktopIcons();

  if (!_desktopInited) {
    startClock();
    $('#logoutBtn')?.addEventListener('click', logoutDesktop);
    _desktopInited = true;
  }

  // Start background music — single instance, loops forever
  musicState.trackIdx = 0;
  musicState.elapsed = 0;
  initAudio();
  if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
  musicState.playing = true;
  startSynth();
  startMusicTick();
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

/* ─── New Icon Drawers ─────────────────────────── */
function drawTerminalIcon(canvas, w, h) {
  const rc = RC(canvas); if (!rc) return;
  canvas.width = w; canvas.height = h;
  const s = w / 56;
  rc.rectangle(6*s, 8*s, 44*s, 40*s, { roughness: 1.8, stroke: '#1A1A1A', strokeWidth: 1.3, fill: '#1A1A1A', fillStyle: 'solid' });
  rc.line(14*s, 24*s, 22*s, 20*s, { roughness: 1.2, stroke: '#4A7C59', strokeWidth: 1.5 });
  rc.line(14*s, 24*s, 22*s, 28*s, { roughness: 1.2, stroke: '#4A7C59', strokeWidth: 1.5 });
  rc.line(26*s, 30*s, 38*s, 30*s, { roughness: 1.2, stroke: '#9B9B9B', strokeWidth: 1 });
}

function drawTimelineIcon(canvas, w, h) {
  const rc = RC(canvas); if (!rc) return;
  canvas.width = w; canvas.height = h;
  const s = w / 56;
  rc.line(16*s, 8*s, 16*s, 48*s, { roughness: 1.5, stroke: '#C4956A', strokeWidth: 1.5 });
  [[16, 14, 8], [16, 26, 8], [16, 38, 8]].forEach(([x, y, r]) => {
    rc.circle(x*s, y*s, r*s, { roughness: 1.5, stroke: '#4A7C59', strokeWidth: 1.3, fill: '#4A7C59', fillStyle: 'solid' });
  });
  [[22, 14, 44, 14], [22, 26, 40, 26], [22, 38, 36, 38]].forEach(([x1,y1,x2,y2]) => {
    rc.line(x1*s, y1*s, x2*s, y2*s, { roughness: 1.2, stroke: '#9B9B9B', strokeWidth: 0.8 });
  });
}

function drawMusicIcon(canvas, w, h) {
  const rc = RC(canvas); if (!rc) return;
  canvas.width = w; canvas.height = h;
  const s = w / 56;
  rc.line(22*s, 12*s, 22*s, 40*s, { roughness: 1.3, stroke: '#1A1A1A', strokeWidth: 1.5 });
  rc.line(38*s, 10*s, 38*s, 36*s, { roughness: 1.3, stroke: '#1A1A1A', strokeWidth: 1.5 });
  rc.ellipse(16*s, 40*s, 14*s, 10*s, { roughness: 1.8, stroke: '#1A1A1A', strokeWidth: 1.3, fill: '#C4956A', fillStyle: 'solid' });
  rc.ellipse(32*s, 36*s, 14*s, 10*s, { roughness: 1.8, stroke: '#1A1A1A', strokeWidth: 1.3, fill: '#4A7C59', fillStyle: 'solid' });
  rc.line(22*s, 12*s, 38*s, 10*s, { roughness: 1.5, stroke: '#1A1A1A', strokeWidth: 1.5 });
}

function drawHelpIcon(canvas, w, h) {
  const rc = RC(canvas); if (!rc) return;
  canvas.width = w; canvas.height = h;
  const s = w / 56;
  rc.rectangle(8*s, 4*s, 40*s, 48*s, { roughness: 1.8, stroke: '#1A1A1A', strokeWidth: 1.3, fill: '#fff', fillStyle: 'solid' });
  const ctx = canvas.getContext('2d');
  ctx.font = `700 ${22*s}px Caveat`; ctx.fillStyle = '#4A7C59';
  ctx.textAlign = 'center'; ctx.fillText('?', 28*s, 34*s);
}

function drawEtchIcon(canvas, w, h) {
  const rc = RC(canvas); if (!rc) return;
  canvas.width = w; canvas.height = h;
  const s = w / 56;
  rc.rectangle(6*s, 4*s, 44*s, 40*s, { roughness: 1.8, stroke: '#C4956A', strokeWidth: 1.3, fill: '#e8e3d9', fillStyle: 'solid' });
  rc.line(14*s, 16*s, 20*s, 24*s, { roughness: 1.5, stroke: '#4A7C59', strokeWidth: 1.2 });
  rc.line(20*s, 24*s, 26*s, 16*s, { roughness: 1.5, stroke: '#4A7C59', strokeWidth: 1.2 });
  rc.line(26*s, 16*s, 32*s, 24*s, { roughness: 1.5, stroke: '#4A7C59', strokeWidth: 1.2 });
  rc.line(32*s, 24*s, 38*s, 16*s, { roughness: 1.5, stroke: '#4A7C59', strokeWidth: 1.2 });
  rc.circle(18*s, 46*s, 8*s, { roughness: 1.5, stroke: '#1A1A1A', strokeWidth: 1.2 });
  rc.circle(38*s, 46*s, 8*s, { roughness: 1.5, stroke: '#1A1A1A', strokeWidth: 1.2 });
}

function drawMinesweeperIcon(canvas, w, h) {
  const rc = RC(canvas); if (!rc) return;
  canvas.width = w; canvas.height = h;
  const s = w / 56;
  for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) {
    rc.rectangle((10 + c*14)*s, (10 + r*14)*s, 12*s, 12*s, { roughness: 1.5, stroke: '#9B9B9B', strokeWidth: 0.8 });
  }
  rc.circle(30*s, 30*s, 8*s, { roughness: 1.8, stroke: '#1A1A1A', strokeWidth: 1.3, fill: '#1A1A1A', fillStyle: 'solid' });
}

function drawSnakeIcon(canvas, w, h) {
  const rc = RC(canvas); if (!rc) return;
  canvas.width = w; canvas.height = h;
  const s = w / 56;
  rc.line(10*s, 18*s, 18*s, 34*s, { roughness: 1.5, stroke: '#4A7C59', strokeWidth: 2 });
  rc.line(18*s, 34*s, 26*s, 18*s, { roughness: 1.5, stroke: '#4A7C59', strokeWidth: 2 });
  rc.line(26*s, 18*s, 34*s, 34*s, { roughness: 1.5, stroke: '#4A7C59', strokeWidth: 2 });
  rc.line(34*s, 34*s, 42*s, 18*s, { roughness: 1.5, stroke: '#4A7C59', strokeWidth: 2 });
  rc.circle(46*s, 40*s, 8*s, { roughness: 1.5, stroke: '#e55', strokeWidth: 1.2, fill: '#e55', fillStyle: 'solid' });
}

function drawDressUpIcon(canvas, w, h) {
  const rc = RC(canvas); if (!rc) return;
  canvas.width = w; canvas.height = h;
  const s = w / 56;
  rc.circle(28*s, 14*s, 10*s, { roughness: 1.8, stroke: '#1A1A1A', strokeWidth: 1.3 });
  rc.line(28*s, 20*s, 28*s, 36*s, { roughness: 1.5, stroke: '#1A1A1A', strokeWidth: 1.3 });
  rc.line(28*s, 26*s, 18*s, 32*s, { roughness: 1.5, stroke: '#1A1A1A', strokeWidth: 1.3 });
  rc.line(28*s, 26*s, 38*s, 32*s, { roughness: 1.5, stroke: '#1A1A1A', strokeWidth: 1.3 });
  rc.line(28*s, 36*s, 20*s, 48*s, { roughness: 1.5, stroke: '#1A1A1A', strokeWidth: 1.3 });
  rc.line(28*s, 36*s, 36*s, 48*s, { roughness: 1.5, stroke: '#1A1A1A', strokeWidth: 1.3 });
  rc.linearPath([[20*s, 8*s], [28*s, 2*s], [36*s, 8*s]], { roughness: 1.5, stroke: '#C4956A', strokeWidth: 1.3 });
}

function draw8BallIcon(canvas, w, h) {
  const rc = RC(canvas); if (!rc) return;
  canvas.width = w; canvas.height = h;
  const s = w / 56;
  rc.circle(28*s, 28*s, 40*s, { roughness: 1.8, stroke: '#1A1A1A', strokeWidth: 1.5, fill: '#1A1A1A', fillStyle: 'solid' });
  const ctx = canvas.getContext('2d');
  ctx.font = `700 ${14*s}px Caveat`; ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('8', 28*s, 30*s);
}

function drawCalcIcon(canvas, w, h) {
  const rc = RC(canvas); if (!rc) return;
  canvas.width = w; canvas.height = h;
  const s = w / 56;
  rc.rectangle(10*s, 4*s, 36*s, 48*s, { roughness: 1.8, stroke: '#1A1A1A', strokeWidth: 1.3, fill: '#fff', fillStyle: 'solid' });
  rc.line(10*s, 18*s, 46*s, 18*s, { roughness: 1, stroke: '#9B9B9B', strokeWidth: 0.8 });
  rc.line(10*s, 30*s, 46*s, 30*s, { roughness: 1, stroke: '#9B9B9B', strokeWidth: 0.8 });
  rc.line(10*s, 40*s, 46*s, 40*s, { roughness: 1, stroke: '#9B9B9B', strokeWidth: 0.8 });
  rc.line(22*s, 18*s, 22*s, 52*s, { roughness: 1, stroke: '#9B9B9B', strokeWidth: 0.8 });
  rc.line(34*s, 18*s, 34*s, 52*s, { roughness: 1, stroke: '#9B9B9B', strokeWidth: 0.8 });
  const ctx = canvas.getContext('2d');
  ctx.font = `700 ${10*s}px Caveat`; ctx.fillStyle = '#4A7C59';
  ctx.textAlign = 'center'; ctx.fillText('=', 28*s, 14*s);
}

function drawNotepadIcon(canvas, w, h) {
  const rc = RC(canvas); if (!rc) return;
  canvas.width = w; canvas.height = h;
  const s = w / 56;
  rc.rectangle(8*s, 4*s, 36*s, 48*s, { roughness: 1.8, stroke: '#1A1A1A', strokeWidth: 1.3, fill: '#fff', fillStyle: 'solid' });
  [[16, 16, 36, 16], [16, 24, 34, 24], [16, 32, 32, 32], [16, 40, 30, 40]].forEach(([x1, y1, x2, y2]) => {
    rc.line(x1*s, y1*s, x2*s, y2*s, { roughness: 1.2, stroke: '#9B9B9B', strokeWidth: 0.8 });
  });
  rc.line(46*s, 8*s, 46*s, 44*s, { roughness: 1.5, stroke: '#C4956A', strokeWidth: 1.2 });
}

function drawWeatherIcon(canvas, w, h) {
  const rc = RC(canvas); if (!rc) return;
  canvas.width = w; canvas.height = h;
  const s = w / 56;
  rc.circle(28*s, 28*s, 20*s, { roughness: 1.8, stroke: '#C4956A', strokeWidth: 1.5, fill: '#ffd', fillStyle: 'solid' });
  [[28, 10, 28, 4], [28, 46, 28, 52], [10, 28, 4, 28], [46, 28, 52, 28],
   [16, 16, 12, 12], [40, 16, 44, 12], [16, 40, 12, 44], [40, 40, 44, 44]].forEach(([x1, y1, x2, y2]) => {
    rc.line(x1*s, y1*s, x2*s, y2*s, { roughness: 1.2, stroke: '#C4956A', strokeWidth: 1 });
  });
}

function drawClockIcon(canvas, w, h) {
  const rc = RC(canvas); if (!rc) return;
  canvas.width = w; canvas.height = h;
  const s = w / 56;
  rc.circle(28*s, 28*s, 40*s, { roughness: 1.8, stroke: '#1A1A1A', strokeWidth: 1.3 });
  rc.line(28*s, 28*s, 28*s, 14*s, { roughness: 1.2, stroke: '#1A1A1A', strokeWidth: 1.5 });
  rc.line(28*s, 28*s, 38*s, 28*s, { roughness: 1.2, stroke: '#1A1A1A', strokeWidth: 1.3 });
  [[28, 10], [46, 28], [28, 46], [10, 28]].forEach(([x, y]) => {
    rc.circle(x*s, y*s, 3*s, { roughness: 1, stroke: '#4A7C59', fill: '#4A7C59', fillStyle: 'solid', strokeWidth: 0.8 });
  });
}

function drawLinksIcon(canvas, w, h) {
  const rc = RC(canvas); if (!rc) return;
  canvas.width = w; canvas.height = h;
  const s = w / 56;
  rc.rectangle(8*s, 16*s, 24*s, 24*s, { roughness: 1.8, stroke: '#3a6fbf', strokeWidth: 1.5 });
  rc.rectangle(24*s, 16*s, 24*s, 24*s, { roughness: 1.8, stroke: '#4A7C59', strokeWidth: 1.5 });
}

function drawGuestbookIcon(canvas, w, h) {
  const rc = RC(canvas); if (!rc) return;
  canvas.width = w; canvas.height = h;
  const s = w / 56;
  rc.rectangle(6*s, 8*s, 22*s, 40*s, { roughness: 1.8, stroke: '#C4956A', strokeWidth: 1.3, fill: '#fff', fillStyle: 'solid' });
  rc.rectangle(28*s, 8*s, 22*s, 40*s, { roughness: 1.8, stroke: '#C4956A', strokeWidth: 1.3, fill: '#fff', fillStyle: 'solid' });
  rc.line(28*s, 8*s, 28*s, 48*s, { roughness: 1.5, stroke: '#C4956A', strokeWidth: 1.5 });
}

function drawTrashIcon(canvas, w, h) {
  const rc = RC(canvas); if (!rc) return;
  canvas.width = w; canvas.height = h;
  const s = w / 56;
  rc.rectangle(14*s, 8*s, 28*s, 6*s, { roughness: 1.5, stroke: '#9B9B9B', strokeWidth: 1.3 });
  rc.linearPath([[10*s, 14*s], [14*s, 48*s], [42*s, 48*s], [46*s, 14*s]], { roughness: 1.8, stroke: '#9B9B9B', strokeWidth: 1.3 });
  rc.line(22*s, 20*s, 22*s, 42*s, { roughness: 1.2, stroke: '#9B9B9B', strokeWidth: 0.8 });
  rc.line(28*s, 20*s, 28*s, 42*s, { roughness: 1.2, stroke: '#9B9B9B', strokeWidth: 0.8 });
  rc.line(34*s, 20*s, 34*s, 42*s, { roughness: 1.2, stroke: '#9B9B9B', strokeWidth: 0.8 });
}

function drawSettingsIcon(canvas, w, h) {
  const rc = RC(canvas); if (!rc) return;
  canvas.width = w; canvas.height = h;
  const s = w / 56;
  rc.circle(28*s, 28*s, 22*s, { roughness: 1.8, stroke: '#1A1A1A', strokeWidth: 1.3 });
  rc.rectangle(24*s, 4*s, 8*s, 10*s, { roughness: 1.5, stroke: '#1A1A1A', strokeWidth: 1 });
  rc.rectangle(24*s, 42*s, 8*s, 10*s, { roughness: 1.5, stroke: '#1A1A1A', strokeWidth: 1 });
  rc.rectangle(4*s, 24*s, 10*s, 8*s, { roughness: 1.5, stroke: '#1A1A1A', strokeWidth: 1 });
  rc.rectangle(42*s, 24*s, 10*s, 8*s, { roughness: 1.5, stroke: '#1A1A1A', strokeWidth: 1 });
}

function drawPhotosIcon(canvas, w, h) {
  const rc = RC(canvas); if (!rc) return;
  canvas.width = w; canvas.height = h;
  const s = w / 56;
  rc.rectangle(14*s, 4*s, 36*s, 36*s, { roughness: 1.8, stroke: '#9B9B9B', strokeWidth: 1, fill: '#fff', fillStyle: 'solid' });
  rc.rectangle(6*s, 12*s, 36*s, 36*s, { roughness: 1.8, stroke: '#1A1A1A', strokeWidth: 1.3, fill: '#fff', fillStyle: 'solid' });
  rc.circle(18*s, 24*s, 8*s, { roughness: 1.5, stroke: '#C4956A', strokeWidth: 1, fill: '#ffd', fillStyle: 'solid' });
  rc.line(6*s, 40*s, 20*s, 30*s, { roughness: 1.5, stroke: '#4A7C59', strokeWidth: 1.2 });
  rc.line(20*s, 30*s, 30*s, 38*s, { roughness: 1.5, stroke: '#4A7C59', strokeWidth: 1.2 });
  rc.line(30*s, 38*s, 42*s, 28*s, { roughness: 1.5, stroke: '#4A7C59', strokeWidth: 1.2 });
}

/* ─── Desktop Icon Rendering ───────────────────── */
function renderDesktopIcons() {
  const area = $('#desktopIcons');
  area.innerHTML = '';

  const icons = [
    { id: 'files', label: 'Files', draw: drawFolderIcon, action: () => openFileExplorer() },
    { id: 'terminal', label: 'Terminal', draw: drawTerminalIcon, action: () => openTerminal() },
    { id: 'paint', label: 'Paint', draw: drawPaintIcon, action: () => openPaint() },
    { id: 'timeline', label: 'Timeline', draw: drawTimelineIcon, action: () => openTimeline() },
    { id: 'music', label: 'Music', draw: drawMusicIcon, action: () => openMusic() },
    { id: 'about', label: 'About Me', draw: drawAboutIcon, action: () => openAbout() },
    { id: 'resume', label: 'Resume', draw: drawResumeIcon, action: () => openResume() },
    { id: 'help', label: 'Help.txt', draw: drawHelpIcon, action: () => openHelp() },
    { id: 'etch', label: 'Etch-a-Sketch', draw: drawEtchIcon, action: () => openEtch() },
    { id: 'minesweeper', label: 'Minesweeper', draw: drawMinesweeperIcon, action: () => openMinesweeper() },
    { id: 'snake', label: 'Snake', draw: drawSnakeIcon, action: () => openSnake() },
    { id: 'dressup', label: 'Dress Up', draw: drawDressUpIcon, action: () => openDressUp() },
    { id: '8ball', label: '8-Ball', draw: draw8BallIcon, action: () => open8Ball() },
    { id: 'calc', label: 'Calculator', draw: drawCalcIcon, action: () => openCalc() },
    { id: 'notepad', label: 'Notepad', draw: drawNotepadIcon, action: () => openNotepad() },
    { id: 'weather', label: 'Weather', draw: drawWeatherIcon, action: () => openWeather() },
    { id: 'clock', label: 'Clock', draw: drawClockIcon, action: () => openClock() },
    { id: 'links', label: 'Links', draw: drawLinksIcon, action: () => openLinks() },
    { id: 'guestbook', label: 'Guestbook', draw: drawGuestbookIcon, action: () => openGuestbook() },
    { id: 'trash', label: 'Trash', draw: drawTrashIcon, action: () => openTrash() },
    { id: 'settings', label: 'Settings', draw: drawSettingsIcon, action: () => openSettings() },
    { id: 'photos', label: 'Photos', draw: drawPhotosIcon, action: () => openPhotos() },
  ];

  icons.forEach(ico => {
    const el = document.createElement('div');
    el.className = 'desk-icon';
    el.innerHTML = `<canvas width="56" height="56"></canvas><span class="desk-icon-label">${ico.label}</span>`;
    const cvs = el.querySelector('canvas');
    ico.draw(cvs, 56, 56);
    markWriggle(cvs, () => ico.draw(cvs, 56, 56));

    let clicks = 0, clickTimer;
    el.addEventListener('click', () => {
      clicks++;
      if (clicks === 1) {
        clickTimer = setTimeout(() => { clicks = 0; }, 300);
      } else if (clicks === 2) {
        clearTimeout(clickTimer);
        clicks = 0;
        ico.action();
      }
    });
    area.appendChild(el);
  });

  // Start the global wriggle engine
  startWriggle();
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

  openWindows[id] = { el, title, minimized: false, maximized: false, restore: null, onClose: opts.onClose || null };
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
  if (win.onClose) win.onClose();
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
  const cvs = el.querySelector('canvas');
  drawFolderIcon(cvs, 48, 48);
  markWriggle(cvs, () => drawFolderIcon(cvs, 48, 48));
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
  if (ext === '.png' || ext === '.jpg') {
    drawImageIcon(cvs, 48, 48);
    markWriggle(cvs, () => drawImageIcon(cvs, 48, 48));
  } else {
    drawFileIcon(cvs, 48, 48, ext);
    markWriggle(cvs, () => drawFileIcon(cvs, 48, 48, ext));
  }
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
  const allExp = window.PortfolioData ? window.PortfolioData.getExperience() : [];
  allExp.sort((a, b) => (a.order || 0) - (b.order || 0));

  const work = allExp.filter(e => e.type === 'work');
  const edu = allExp.filter(e => e.type === 'education');

  let workHtml = '';
  work.forEach(e => {
    workHtml += `
      <div style="margin-bottom:20px">
        <p><strong>${e.title} — ${e.place}</strong> <span style="color:var(--ink-light);font-size:15px">&nbsp; ${e.location || ''} &nbsp;·&nbsp; ${e.date}</span></p>
        <p style="font-size:16px;margin-left:12px">${e.desc}</p>
      </div>`;
  });

  let eduHtml = '';
  edu.forEach(e => {
    eduHtml += `
      <div style="margin-bottom:12px">
        <p><strong>${e.title} — ${e.place}</strong> <span style="color:var(--ink-light);font-size:15px">&nbsp; ${e.location || ''} &nbsp;·&nbsp; ${e.date}</span></p>
        ${e.desc ? `<p style="font-size:16px;margin-left:12px">${e.desc}</p>` : ''}
      </div>`;
  });

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
      ${workHtml}

      <h3 style="color:var(--ink)">Education</h3>
      ${eduHtml}

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
    toolCanvases.forEach((c, i) => {
      if (iconData[i]) {
        iconData[i](c);
        markWriggle(c, () => iconData[i](c));
      }
    });
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


/* ═══ TERMINAL ═════════════════════════════════════ */
function openTerminal() {
  const body = `
    <div class="term-wrap">
      <div class="term-output" id="termOutput"><span class="term-accent">adrian.os terminal v1.0</span>\n<span class="term-result">Type "help" for a list of commands.\n</span></div>
      <div class="term-input-row">
        <span class="term-prompt-label">adrian@portfolio ~$</span>
        <input class="term-input" id="termInput" type="text" autocomplete="off" autofocus spellcheck="false" />
      </div>
    </div>`;
  createWindow('terminal', 'Terminal', 640, 420, body);
  const input = $('#termInput');
  const output = $('#termOutput');
  if (!input || !output) return;
  setTimeout(() => input.focus(), 100);

  const cmdHistory = [];
  let histIdx = -1;

  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      const cmd = input.value.trim();
      if (!cmd) return;
      cmdHistory.unshift(cmd);
      histIdx = -1;
      output.innerHTML += `\n<span class="term-prompt">adrian@portfolio ~$ </span><span class="term-cmd">${escHtml(cmd)}</span>\n`;
      const result = runCommand(cmd);
      output.innerHTML += result + '\n';
      input.value = '';
      output.scrollTop = output.scrollHeight;
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (histIdx < cmdHistory.length - 1) { histIdx++; input.value = cmdHistory[histIdx]; }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (histIdx > 0) { histIdx--; input.value = cmdHistory[histIdx]; }
      else { histIdx = -1; input.value = ''; }
    }
  });
}

function escHtml(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

function runCommand(cmd) {
  const parts = cmd.toLowerCase().split(/\s+/);
  const c = parts[0];
  const projects = (typeof siteData !== 'undefined' && siteData.projects) ? siteData.projects : [];

  const commands = {
    help: () =>
`<span class="term-heading">Available commands:</span>
<span class="term-accent">  whoami</span>       <span class="term-result">— who is Adrian?</span>
<span class="term-accent">  skills</span>       <span class="term-result">— list technical skills</span>
<span class="term-accent">  projects</span>     <span class="term-result">— list all projects</span>
<span class="term-accent">  experience</span>   <span class="term-result">— work history</span>
<span class="term-accent">  education</span>    <span class="term-result">— education background</span>
<span class="term-accent">  contact</span>      <span class="term-result">— contact information</span>
<span class="term-accent">  socials</span>      <span class="term-result">— social media links</span>
<span class="term-accent">  open &lt;app&gt;</span>   <span class="term-result">— open an app (files, paint, timeline, music, about, resume)</span>
<span class="term-accent">  echo &lt;text&gt;</span>  <span class="term-result">— print text</span>
<span class="term-accent">  date</span>         <span class="term-result">— current date & time</span>
<span class="term-accent">  clear</span>        <span class="term-result">— clear terminal</span>
<span class="term-accent">  neofetch</span>     <span class="term-result">— system info</span>
<span class="term-accent">  help</span>         <span class="term-result">— show this list</span>`,

    whoami: () =>
`<span class="term-heading">Adrian Tan</span>
<span class="term-result">IT student at RMIT with practical experience in CRM administration,
website maintenance (Shopify, WordPress) and on-page SEO.
Builder of things. Always learning.</span>`,

    skills: () =>
`<span class="term-heading">Technical Skills</span>
<span class="term-accent">  Languages:</span>    <span class="term-result">Java, HTML, CSS, JavaScript</span>
<span class="term-accent">  Tools:</span>        <span class="term-result">Blender (3D), Shopify, WordPress</span>
<span class="term-accent">  Other:</span>        <span class="term-result">CRM Administration, SEO, Photography</span>`,

    projects: () => {
      if (!projects.length) return '<span class="term-result">No projects added yet. Check back soon!</span>';
      return '<span class="term-heading">Projects</span>\n' + projects.map((p, i) =>
        `<span class="term-accent">  [${String(i+1).padStart(2,'0')}]</span> <span class="term-result">${escHtml(p.title)} — ${escHtml(p.description || '')}</span>`
      ).join('\n');
    },

    experience: () => {
      const exp = window.PortfolioData ? window.PortfolioData.getExperience().filter(e => e.type === 'work') : [];
      if (!exp.length) return '<span class="term-result">No experience data yet.</span>';
      exp.sort((a, b) => (a.order || 0) - (b.order || 0));
      return '<span class="term-heading">Employment History</span>\n' + exp.map(e =>
        `\n<span class="term-accent">  ${escHtml(e.title)}</span> <span class="term-result">— ${escHtml(e.place)}, ${escHtml(e.location || '')}</span>\n<span class="term-result">  ${escHtml(e.date)}</span>\n<span class="term-result">  ${escHtml(e.desc)}</span>`
      ).join('\n');
    },

    education: () => {
      const edu = window.PortfolioData ? window.PortfolioData.getExperience().filter(e => e.type === 'education') : [];
      if (!edu.length) return '<span class="term-result">No education data yet.</span>';
      edu.sort((a, b) => (a.order || 0) - (b.order || 0));
      return '<span class="term-heading">Education</span>\n' + edu.map(e =>
        `<span class="term-accent">  ${escHtml(e.title)}</span> <span class="term-result">— ${escHtml(e.place)}, ${escHtml(e.location || '')} (${escHtml(e.date)})</span>`
      ).join('\n');
    },

    contact: () =>
`<span class="term-heading">Contact</span>
<span class="term-accent">  Email:</span>    <span class="term-result">adrian@anda.land</span>
<span class="term-accent">  Phone:</span>    <span class="term-result">0435 833 331</span>
<span class="term-accent">  Location:</span> <span class="term-result">Glen Waverley, VIC</span>`,

    socials: () =>
`<span class="term-heading">Socials</span>
<span class="term-accent">  GitHub:</span>   <span class="term-result">github.com/Huh2006</span>
<span class="term-accent">  LinkedIn:</span> <span class="term-result">linkedin.com/in/adrian-tan12</span>`,

    date: () => `<span class="term-result">${new Date().toLocaleString()}</span>`,

    clear: () => {
      setTimeout(() => {
        const o = $('#termOutput');
        if (o) o.innerHTML = `<span class="term-accent">adrian.os terminal v1.0</span>\n<span class="term-result">Type "help" for a list of commands.\n</span>`;
      }, 0);
      return '';
    },

    echo: () => `<span class="term-result">${escHtml(cmd.slice(5))}</span>`,

    neofetch: () =>
`<span class="term-accent">       ___       </span>  <span class="term-heading">adrian@portfolio</span>
<span class="term-accent">      /   \\      </span>  <span class="term-result">──────────────────</span>
<span class="term-accent">     / .   \\     </span>  <span class="term-accent">OS:</span>     <span class="term-result">adrian.os v1.0</span>
<span class="term-accent">    /  ___  \\    </span>  <span class="term-accent">Shell:</span>  <span class="term-result">portfolio-term</span>
<span class="term-accent">   /  /   \\  \\   </span>  <span class="term-accent">Theme:</span>  <span class="term-result">hand-drawn (light)</span>
<span class="term-accent">  /__/     \\__\\  </span>  <span class="term-accent">Engine:</span> <span class="term-result">Rough.js + Canvas</span>
<span class="term-accent">                 </span>  <span class="term-accent">Font:</span>   <span class="term-result">Caveat / DM Sans</span>`,

    open: () => {
      const app = parts[1];
      const appMap = { files: openFileExplorer, paint: openPaint, timeline: openTimeline, music: openMusic, about: openAbout, resume: openResume, help: openHelp };
      if (app && appMap[app]) { setTimeout(appMap[app], 100); return `<span class="term-result">Opening ${app}...</span>`; }
      return `<span class="term-error">Usage: open &lt;files|paint|timeline|music|about|resume|help&gt;</span>`;
    },
  };

  if (commands[c]) return commands[c]();
  return `<span class="term-error">Command not found: ${escHtml(c)}. Type "help" for available commands.</span>`;
}

/* ═══ TIMELINE ═════════════════════════════════════ */
function openTimeline() {
  const entries = window.PortfolioData ? window.PortfolioData.getExperience() : [];
  // Sort by order field
  entries.sort((a, b) => (a.order || 0) - (b.order || 0));

  let html = '<div class="timeline-wrap">';
  entries.forEach((e, i) => {
    const editBtn = window.isAdmin && window.isAdmin() ?
      ` <button class="tl-edit-btn" data-exp-id="${e.id}" title="Edit">✎</button>` : '';
    html += `
      <div class="tl-item${e.current ? ' current' : ''}" style="animation-delay:${i * 0.12}s">
        <div class="tl-date">${e.date}${editBtn}</div>
        <div class="tl-title">${e.title}</div>
        <div class="tl-place">${e.place} — ${e.location || ''}</div>
        <div class="tl-desc">${e.desc}</div>
      </div>`;
  });

  if (window.isAdmin && window.isAdmin()) {
    html += '<div style="text-align:center;margin-top:16px"><button class="tl-add-btn" id="tlAddExp">+ Add Experience</button></div>';
  }

  html += '</div>';

  createWindow('timeline', 'Timeline', 560, 500, html, {
    onReady: () => {
      // Wire up edit buttons
      document.querySelectorAll('.tl-edit-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          if (typeof window.openExpModal === 'function') {
            const item = window.PortfolioData.getExperienceItem(btn.dataset.expId);
            window.openExpModal(item);
          }
        });
      });
      const addBtn = document.getElementById('tlAddExp');
      if (addBtn) addBtn.addEventListener('click', () => {
        if (typeof window.openExpModal === 'function') window.openExpModal(null);
      });
    }
  });
}

window.refreshTimeline = () => {
  if (openWindows['timeline']) {
    closeWindow('timeline');
    openTimeline();
  }
};

/* ═══ MUSIC PLAYER (Web Audio API Synth) ═══════════ */
const musicTracks = [
  { title: 'Morning Sketch', artist: 'Lofi Adrian', bpm: 72, dur: 120,
    key: 'C', chords: [[261.6,329.6,392],[293.7,349.2,440],[329.6,392,493.9],[261.6,329.6,392]],
    melody: [523.3,493.9,440,392,440,493.9,523.3,0,440,392,349.2,329.6,349.2,392,440,0] },
  { title: 'Compile & Chill', artist: 'Lofi Adrian', bpm: 80, dur: 120,
    key: 'Am', chords: [[220,261.6,329.6],[196,246.9,293.7],[174.6,220,261.6],[196,246.9,329.6]],
    melody: [659.3,0,523.3,440,523.3,659.3,0,440,523.3,0,440,392,440,523.3,659.3,0] },
  { title: 'Late Night Debug', artist: 'Lofi Adrian', bpm: 66, dur: 120,
    key: 'Dm', chords: [[293.7,349.2,440],[261.6,329.6,392],[233.1,293.7,349.2],[261.6,329.6,440]],
    melody: [587.3,523.3,0,440,523.3,587.3,0,523.3,440,0,349.2,293.7,349.2,440,523.3,0] },
];

let musicState = { playing: false, trackIdx: 0, elapsed: 0, interval: null };
let audioCtx = null, masterGain = null, lofiFilter = null;
let synthInterval = null, chordStep = 0, melodyStep = 0;
let activeOscillators = []; // track all playing oscillators so we can kill them

function initAudio() {
  if (audioCtx) return;
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();

  // Lo-fi filter chain: lowpass → slight distortion → master gain
  lofiFilter = audioCtx.createBiquadFilter();
  lofiFilter.type = 'lowpass';
  lofiFilter.frequency.value = 1200;
  lofiFilter.Q.value = 1.5;

  masterGain = audioCtx.createGain();
  masterGain.gain.value = 0.3;

  lofiFilter.connect(masterGain);
  masterGain.connect(audioCtx.destination);
}

function playNote(freq, duration, delay, type, vol) {
  if (!audioCtx || freq === 0 || !musicState.playing) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type || 'sine';
  osc.frequency.value = freq;

  // Slight detune for warmth
  osc.detune.value = (Math.random() - 0.5) * 12;

  gain.gain.setValueAtTime(0, audioCtx.currentTime + delay);
  gain.gain.linearRampToValueAtTime(vol || 0.15, audioCtx.currentTime + delay + 0.05);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + delay + duration);

  osc.connect(gain);
  gain.connect(lofiFilter);
  osc.start(audioCtx.currentTime + delay);
  osc.stop(audioCtx.currentTime + delay + duration + 0.05);

  // Track it so stopSynth can kill lingering notes
  activeOscillators.push(osc);
  osc.onended = () => {
    const i = activeOscillators.indexOf(osc);
    if (i !== -1) activeOscillators.splice(i, 1);
  };
}

function playChord(freqs, duration, delay) {
  freqs.forEach(f => playNote(f, duration, delay, 'triangle', 0.08));
}

function startSynth() {
  stopSynth();
  const track = musicTracks[musicState.trackIdx];
  const beatLen = 60 / track.bpm;
  chordStep = 0;
  melodyStep = 0;

  // Play first beat immediately
  playBeat(track, beatLen);

  synthInterval = setInterval(() => {
    if (!musicState.playing) return;
    playBeat(track, beatLen);
  }, beatLen * 1000);
}

function playBeat(track, beatLen) {
  // Chord every 4 beats
  if (melodyStep % 4 === 0) {
    const chord = track.chords[chordStep % track.chords.length];
    playChord(chord, beatLen * 3.5, 0);
    chordStep++;
  }

  // Melody note every beat
  const note = track.melody[melodyStep % track.melody.length];
  if (note > 0) {
    playNote(note, beatLen * 0.8, 0, 'sine', 0.12);
    // Add a quiet octave-down undertone
    playNote(note / 2, beatLen * 0.6, 0.02, 'triangle', 0.04);
  }

  // Soft kick-like thump on beats 0 and 2
  if (melodyStep % 4 === 0 || melodyStep % 4 === 2) {
    playNote(80, 0.15, 0, 'sine', 0.18);
  }
  // Hi-hat on every beat (noise approximation via high-freq)
  playNote(8000 + Math.random() * 2000, 0.04, 0, 'square', 0.015);

  melodyStep++;
}

function stopSynth() {
  if (synthInterval) { clearInterval(synthInterval); synthInterval = null; }
  // Kill all lingering oscillators immediately
  activeOscillators.forEach(osc => {
    try { osc.stop(); } catch(e) {}
  });
  activeOscillators = [];
}

function openMusic() {
  const t = musicTracks[musicState.trackIdx];
  let playlistHtml = '<div class="music-playlist">';
  musicTracks.forEach((tr, i) => {
    playlistHtml += `<div class="music-track${i === musicState.trackIdx ? ' active' : ''}" data-idx="${i}">
      <span class="music-track-num">${i+1}.</span>${tr.title}</div>`;
  });
  playlistHtml += '</div>';

  const body = `
    <div class="music-wrap">
      <div class="music-art"><canvas id="musicArtCanvas" width="160" height="160"></canvas></div>
      <div class="music-title" id="musicTitle">${t.title}</div>
      <div class="music-artist" id="musicArtist">${t.artist}</div>
      <div class="music-progress"><div class="music-progress-bar" id="musicBar"></div></div>
      <div class="music-time" id="musicTime">${fmtTime(musicState.elapsed)} / ${fmtTime(t.dur)}</div>
      <div class="music-controls">
        <button class="music-btn prev" id="musicPrev" title="Previous">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M12 3L6 8l6 5V3zM4 3v10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
        <button class="music-btn play${musicState.playing ? ' playing' : ''}" id="musicPlay" title="Play/Pause">
          <svg id="playIcon" width="20" height="20" viewBox="0 0 20 20" fill="none">
            ${musicState.playing
              ? '<rect x="5" y="4" width="3" height="12" rx="1" fill="currentColor"/><rect x="12" y="4" width="3" height="12" rx="1" fill="currentColor"/>'
              : '<path d="M6 4l10 6-10 6V4z" fill="currentColor"/>'}
          </svg>
        </button>
        <button class="music-btn next" id="musicNext" title="Next">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 3l6 5-6 5V3zM12 3v10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
      </div>
      ${playlistHtml}
    </div>`;

  createWindow('music', 'Music Player', 340, 480, body);

  setTimeout(() => {
    const artC = $('#musicArtCanvas');
    if (artC) {
      drawAlbumArt(artC, musicState.trackIdx);
      markWriggle(artC, () => drawAlbumArt(artC, musicState.trackIdx));
    }
  }, 50);

  setTimeout(() => {
    const playBtn = $('#musicPlay');
    if (playBtn) playBtn.onclick = toggleMusic;
    const prevBtn = $('#musicPrev');
    if (prevBtn) prevBtn.onclick = () => switchTrack(musicState.trackIdx - 1);
    const nextBtn = $('#musicNext');
    if (nextBtn) nextBtn.onclick = () => switchTrack(musicState.trackIdx + 1);
    document.querySelectorAll('.music-track').forEach(tr => {
      tr.onclick = () => switchTrack(parseInt(tr.dataset.idx));
    });
  }, 50);

  // Don't start another tick — music is already playing in the background
}

function drawAlbumArt(canvas, idx) {
  const rc = RC(canvas); if (!rc) return;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, 160, 160);
  const colors = [['#4A7C59','#C4956A','#3a6fbf'], ['#e55','#4A7C59','#9b59b6'], ['#3a6fbf','#C4956A','#e55']];
  const c = colors[idx % 3];
  rc.rectangle(4, 4, 152, 152, { roughness: 2, stroke: '#1A1A1A', strokeWidth: 1.5, fill: '#F7F5F0', fillStyle: 'solid' });
  rc.circle(80, 80, 90, { roughness: 2.5, stroke: c[0], strokeWidth: 1.5 });
  rc.circle(80, 80, 50, { roughness: 2, stroke: c[1], strokeWidth: 1.3 });
  rc.circle(80, 80, 16, { roughness: 1.5, stroke: '#1A1A1A', strokeWidth: 1.3, fill: '#1A1A1A', fillStyle: 'solid' });
  ctx.font = '700 18px Caveat'; ctx.fillStyle = c[2]; ctx.globalAlpha = 0.6;
  ctx.fillText('♪', 112, 40); ctx.fillText('♫', 30, 130); ctx.globalAlpha = 1;
}

function fmtTime(s) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

function toggleMusic() {
  initAudio();
  if (audioCtx.state === 'suspended') audioCtx.resume();
  musicState.playing = !musicState.playing;
  if (musicState.playing) { startSynth(); startMusicTick(); }
  else { stopSynth(); stopMusicTick(); }
  updateMusicUI();
}

function startMusicTick() {
  stopMusicTick();
  musicState.interval = setInterval(() => {
    const t = musicTracks[musicState.trackIdx];
    musicState.elapsed += 1;
    if (musicState.elapsed >= t.dur) {
      switchTrack(musicState.trackIdx + 1);
      return;
    }
    updateMusicProgress();
  }, 1000);
}

function stopMusicTick() {
  if (musicState.interval) { clearInterval(musicState.interval); musicState.interval = null; }
}

function switchTrack(idx) {
  if (idx < 0) idx = musicTracks.length - 1;
  if (idx >= musicTracks.length) idx = 0;
  const wasPlaying = musicState.playing;
  if (wasPlaying) { stopSynth(); stopMusicTick(); }
  musicState.trackIdx = idx;
  musicState.elapsed = 0;
  chordStep = 0; melodyStep = 0;
  if (wasPlaying) { startSynth(); startMusicTick(); }
  updateMusicUI();
  const artC = $('#musicArtCanvas');
  if (artC) {
    drawAlbumArt(artC, idx);
    markWriggle(artC, () => drawAlbumArt(artC, idx));
  }
}

function updateMusicUI() {
  const t = musicTracks[musicState.trackIdx];
  const title = $('#musicTitle'); if (title) title.textContent = t.title;
  const artist = $('#musicArtist'); if (artist) artist.textContent = t.artist;
  const playBtn = $('#musicPlay');
  if (playBtn) {
    playBtn.classList.toggle('playing', musicState.playing);
    const icon = playBtn.querySelector('svg');
    if (icon) icon.innerHTML = musicState.playing
      ? '<rect x="5" y="4" width="3" height="12" rx="1" fill="currentColor"/><rect x="12" y="4" width="3" height="12" rx="1" fill="currentColor"/>'
      : '<path d="M6 4l10 6-10 6V4z" fill="currentColor"/>';
  }
  document.querySelectorAll('.music-track').forEach((tr, i) => {
    tr.classList.toggle('active', i === musicState.trackIdx);
  });
  updateMusicProgress();
}

function updateMusicProgress() {
  const t = musicTracks[musicState.trackIdx];
  const bar = $('#musicBar');
  if (bar) bar.style.width = (musicState.elapsed / t.dur * 100) + '%';
  const time = $('#musicTime');
  if (time) time.textContent = `${fmtTime(musicState.elapsed)} / ${fmtTime(t.dur)}`;
}

/* ═══ HELP FILE ════════════════════════════════════ */
function openHelp() {
  const body = `
    <div class="notepad-body" style="padding:24px 28px;line-height:1.8">
      <h2 style="font-size:32px;margin-bottom:4px">How to Use Terminal</h2>
      <p style="color:var(--ink-light);margin-bottom:20px">A quick guide to the adrian.os terminal</p>

      <h3 style="color:var(--ink)">Getting Started</h3>
      <p>Double-click the <strong>Terminal</strong> icon on the desktop to open it.
      You'll see a command prompt where you can type commands and press Enter.</p>

      <h3 style="color:var(--ink)">Commands</h3>
      <table style="width:100%;border-collapse:collapse;margin:8px 0 16px">
        <tr style="border-bottom:1px solid var(--rule)"><td style="padding:6px 12px 6px 0;color:#4A7C59;font-weight:600">whoami</td><td style="padding:6px 0">Learn about Adrian</td></tr>
        <tr style="border-bottom:1px solid var(--rule)"><td style="padding:6px 12px 6px 0;color:#4A7C59;font-weight:600">skills</td><td style="padding:6px 0">See technical skills</td></tr>
        <tr style="border-bottom:1px solid var(--rule)"><td style="padding:6px 12px 6px 0;color:#4A7C59;font-weight:600">projects</td><td style="padding:6px 0">List all projects</td></tr>
        <tr style="border-bottom:1px solid var(--rule)"><td style="padding:6px 12px 6px 0;color:#4A7C59;font-weight:600">experience</td><td style="padding:6px 0">Work history</td></tr>
        <tr style="border-bottom:1px solid var(--rule)"><td style="padding:6px 12px 6px 0;color:#4A7C59;font-weight:600">education</td><td style="padding:6px 0">Education info</td></tr>
        <tr style="border-bottom:1px solid var(--rule)"><td style="padding:6px 12px 6px 0;color:#4A7C59;font-weight:600">contact</td><td style="padding:6px 0">Contact details</td></tr>
        <tr style="border-bottom:1px solid var(--rule)"><td style="padding:6px 12px 6px 0;color:#4A7C59;font-weight:600">socials</td><td style="padding:6px 0">Social media links</td></tr>
        <tr style="border-bottom:1px solid var(--rule)"><td style="padding:6px 12px 6px 0;color:#4A7C59;font-weight:600">open &lt;app&gt;</td><td style="padding:6px 0">Open any desktop app</td></tr>
        <tr style="border-bottom:1px solid var(--rule)"><td style="padding:6px 12px 6px 0;color:#4A7C59;font-weight:600">neofetch</td><td style="padding:6px 0">System info</td></tr>
        <tr style="border-bottom:1px solid var(--rule)"><td style="padding:6px 12px 6px 0;color:#4A7C59;font-weight:600">date</td><td style="padding:6px 0">Current date & time</td></tr>
        <tr style="border-bottom:1px solid var(--rule)"><td style="padding:6px 12px 6px 0;color:#4A7C59;font-weight:600">echo &lt;text&gt;</td><td style="padding:6px 0">Print text back</td></tr>
        <tr><td style="padding:6px 12px 6px 0;color:#4A7C59;font-weight:600">clear</td><td style="padding:6px 0">Clear the screen</td></tr>
      </table>

      <h3 style="color:var(--ink)">Tips</h3>
      <p>· Use <strong>↑ / ↓ arrow keys</strong> to scroll through command history<br>
         · Try <strong>open paint</strong> to launch Paint from the terminal<br>
         · Commands are case-insensitive</p>

      <h3 style="color:var(--ink)">About This Desktop</h3>
      <p>This portfolio is built as a hand-drawn desktop operating system.
      Everything is rendered using <strong>Rough.js</strong> and the HTML Canvas API
      to create a unique sketchbook aesthetic. Each element is slightly
      different every time — just like real pencil drawings.</p>
    </div>`;
  createWindow('help', 'Help.txt', 520, 480, body);
}

/* ═══ ETCH-A-SKETCH ════════════════════════════════ */
function openEtch() {
  const body = `
    <div class="etch-wrap">
      <canvas id="etchCanvas" width="360" height="300"></canvas>
      <div class="etch-controls">
        <label class="etch-label">X <input type="range" min="0" max="360" value="180" id="etchX" class="etch-slider"></label>
        <label class="etch-label">Y <input type="range" min="0" max="300" value="150" id="etchY" class="etch-slider"></label>
        <button class="etch-shake" id="etchShake">Shake!</button>
      </div>
    </div>`;
  createWindow('etch', 'Etch-a-Sketch', 400, 420, body, {
    onReady: () => {
      const cvs = $('#etchCanvas');
      if (!cvs) return;
      const ctx = cvs.getContext('2d');
      ctx.fillStyle = '#c0c0c0';
      ctx.fillRect(0, 0, 360, 300);
      let lastX = 180, lastY = 150;
      ctx.strokeStyle = '#4A7C59';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      const xSlider = $('#etchX');
      const ySlider = $('#etchY');
      function draw() {
        const x = parseInt(xSlider.value);
        const y = parseInt(ySlider.value);
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(x, y);
        ctx.stroke();
        lastX = x;
        lastY = y;
      }
      xSlider.addEventListener('input', draw);
      ySlider.addEventListener('input', draw);
      $('#etchShake').addEventListener('click', () => {
        cvs.classList.add('etch-shaking');
        setTimeout(() => {
          ctx.fillStyle = '#c0c0c0';
          ctx.fillRect(0, 0, 360, 300);
          lastX = 180; lastY = 150;
          xSlider.value = 180; ySlider.value = 150;
          cvs.classList.remove('etch-shaking');
        }, 500);
      });
    }
  });
}

/* ═══ MINESWEEPER ══════════════════════════════════ */
function openMinesweeper() {
  const body = `
    <div class="ms-wrap">
      <div class="ms-header">
        <span class="ms-mines" id="msMines">🚩 10</span>
        <button class="ms-new" id="msNew">New Game</button>
      </div>
      <div class="ms-grid" id="msGrid"></div>
    </div>`;
  createWindow('minesweeper', 'Minesweeper', 340, 440, body, {
    onReady: () => initMinesweeper()
  });
}

function initMinesweeper() {
  const ROWS = 9, COLS = 9, MINES = 10;
  let board = [], revealed = [], flagged = [], gameOver = false;

  function init() {
    board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    revealed = Array.from({ length: ROWS }, () => Array(COLS).fill(false));
    flagged = Array.from({ length: ROWS }, () => Array(COLS).fill(false));
    gameOver = false;
    let placed = 0;
    while (placed < MINES) {
      const r = Math.floor(Math.random() * ROWS), c = Math.floor(Math.random() * COLS);
      if (board[r][c] !== -1) { board[r][c] = -1; placed++; }
    }
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
      if (board[r][c] === -1) continue;
      let count = 0;
      for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
        const nr = r + dr, nc = c + dc;
        if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && board[nr][nc] === -1) count++;
      }
      board[r][c] = count;
    }
    render();
    const el = $('#msMines');
    if (el) el.textContent = '🚩 ' + MINES;
  }

  function reveal(r, c) {
    if (r < 0 || r >= ROWS || c < 0 || c >= COLS || revealed[r][c] || flagged[r][c]) return;
    revealed[r][c] = true;
    if (board[r][c] === 0) {
      for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) reveal(r + dr, c + dc);
    }
  }

  function render() {
    const grid = $('#msGrid');
    if (!grid) return;
    grid.innerHTML = '';
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
      const btn = document.createElement('button');
      btn.className = 'ms-cell';
      if (revealed[r][c]) {
        btn.classList.add('revealed');
        if (board[r][c] === -1) { btn.textContent = '💣'; btn.classList.add('mine'); }
        else if (board[r][c] > 0) { btn.textContent = board[r][c]; btn.dataset.num = board[r][c]; }
      } else if (flagged[r][c]) {
        btn.textContent = '🚩';
      }
      btn.addEventListener('click', () => {
        if (gameOver || flagged[r][c]) return;
        if (board[r][c] === -1) {
          gameOver = true;
          for (let rr = 0; rr < ROWS; rr++) for (let cc = 0; cc < COLS; cc++) revealed[rr][cc] = true;
          render();
          setTimeout(() => alert('Game Over! 💥'), 100);
          return;
        }
        reveal(r, c);
        render();
        checkWin();
      });
      btn.addEventListener('contextmenu', e => {
        e.preventDefault();
        if (gameOver || revealed[r][c]) return;
        flagged[r][c] = !flagged[r][c];
        const count = flagged.flat().filter(Boolean).length;
        const el = $('#msMines');
        if (el) el.textContent = '🚩 ' + (MINES - count);
        render();
      });
      grid.appendChild(btn);
    }
  }

  function checkWin() {
    let unrevealed = 0;
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
      if (!revealed[r][c]) unrevealed++;
    }
    if (unrevealed === MINES) {
      gameOver = true;
      setTimeout(() => alert('You win! 🎉'), 100);
    }
  }

  init();
  const newBtn = $('#msNew');
  if (newBtn) newBtn.addEventListener('click', init);
}

/* ═══ SNAKE ════════════════════════════════════════ */
function openSnake() {
  const body = `
    <div class="snake-wrap">
      <div class="snake-header">
        <span class="snake-score" id="snakeScore">Score: 0</span>
        <button class="snake-start" id="snakeStart">Start</button>
      </div>
      <canvas id="snakeCanvas" width="360" height="360"></canvas>
    </div>`;
  let snakeInterval = null;
  createWindow('snake', 'Snake', 380, 440, body, {
    onReady: () => {
      const cvs = $('#snakeCanvas');
      if (!cvs) return;
      const ctx = cvs.getContext('2d');
      const G = 20, W = 18, H = 18;
      let snake, food, dir, score, running;

      function reset() {
        snake = [{ x: 9, y: 9 }];
        dir = { x: 1, y: 0 };
        score = 0;
        running = false;
        placeFood();
        draw();
        const el = $('#snakeScore');
        if (el) el.textContent = 'Score: 0';
      }

      function placeFood() {
        do { food = { x: Math.floor(Math.random() * W), y: Math.floor(Math.random() * H) }; }
        while (snake.some(s => s.x === food.x && s.y === food.y));
      }

      function draw() {
        ctx.fillStyle = '#f0ece4';
        ctx.fillRect(0, 0, 360, 360);
        ctx.fillStyle = '#4A7C59';
        snake.forEach(s => ctx.fillRect(s.x * G, s.y * G, G - 1, G - 1));
        ctx.beginPath();
        ctx.arc(food.x * G + G / 2, food.y * G + G / 2, G / 2 - 2, 0, Math.PI * 2);
        ctx.fillStyle = '#e55';
        ctx.fill();
      }

      function step() {
        const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
        if (head.x < 0 || head.x >= W || head.y < 0 || head.y >= H || snake.some(s => s.x === head.x && s.y === head.y)) {
          running = false;
          if (snakeInterval) { clearInterval(snakeInterval); snakeInterval = null; }
          alert('Game Over! Score: ' + score);
          return;
        }
        snake.unshift(head);
        if (head.x === food.x && head.y === food.y) {
          score++;
          const el = $('#snakeScore');
          if (el) el.textContent = 'Score: ' + score;
          placeFood();
          if (score % 5 === 0 && snakeInterval) {
            clearInterval(snakeInterval);
            const speed = Math.max(50, 150 - Math.floor(score / 5) * 15);
            snakeInterval = setInterval(step, speed);
          }
        } else {
          snake.pop();
        }
        draw();
      }

      function handleKey(e) {
        if (!openWindows['snake']) return;
        const map = { ArrowUp: { x: 0, y: -1 }, ArrowDown: { x: 0, y: 1 }, ArrowLeft: { x: -1, y: 0 }, ArrowRight: { x: 1, y: 0 } };
        if (map[e.key]) {
          e.preventDefault();
          const d = map[e.key];
          if (d.x !== -dir.x || d.y !== -dir.y) dir = d;
        }
      }

      document.addEventListener('keydown', handleKey);
      reset();

      $('#snakeStart').addEventListener('click', () => {
        if (running) return;
        reset();
        running = true;
        snakeInterval = setInterval(step, 150);
      });
    },
    onClose: () => {
      if (snakeInterval) { clearInterval(snakeInterval); snakeInterval = null; }
    }
  });
}

/* ═══ DRESS UP ═════════════════════════════════════ */
function openDressUp() {
  const body = `
    <div class="dressup-wrap">
      <canvas id="dressupCanvas" width="320" height="280"></canvas>
      <div class="dressup-btns" id="dressupBtns">
        <button class="dressup-btn" data-acc="hat">Hat</button>
        <button class="dressup-btn" data-acc="glasses">Glasses</button>
        <button class="dressup-btn" data-acc="bowtie">Bow Tie</button>
        <button class="dressup-btn" data-acc="cape">Cape</button>
        <button class="dressup-btn" data-acc="crown">Crown</button>
        <button class="dressup-btn" data-acc="mustache">Mustache</button>
      </div>
      <button class="dressup-reset" id="dressupReset">Reset</button>
    </div>`;
  createWindow('dressup', 'Sketch Dress Up', 360, 450, body, {
    onReady: () => {
      const cvs = $('#dressupCanvas');
      if (!cvs) return;
      const accessories = { hat: false, glasses: false, bowtie: false, cape: false, crown: false, mustache: false };

      function drawFigure() {
        const rc = RC(cvs); if (!rc) return;
        const ctx = cvs.getContext('2d');
        ctx.clearRect(0, 0, 320, 280);
        // Head
        rc.circle(160, 60, 50, { roughness: 1.8, stroke: '#1A1A1A', strokeWidth: 1.5 });
        // Body
        rc.line(160, 86, 160, 180, { roughness: 1.5, stroke: '#1A1A1A', strokeWidth: 1.5 });
        // Arms
        rc.line(160, 120, 110, 155, { roughness: 1.5, stroke: '#1A1A1A', strokeWidth: 1.3 });
        rc.line(160, 120, 210, 155, { roughness: 1.5, stroke: '#1A1A1A', strokeWidth: 1.3 });
        // Legs
        rc.line(160, 180, 125, 250, { roughness: 1.5, stroke: '#1A1A1A', strokeWidth: 1.3 });
        rc.line(160, 180, 195, 250, { roughness: 1.5, stroke: '#1A1A1A', strokeWidth: 1.3 });

        if (accessories.hat) {
          rc.rectangle(130, 22, 60, 14, { roughness: 1.5, stroke: '#C4956A', strokeWidth: 1.3, fill: '#C4956A', fillStyle: 'solid' });
          rc.rectangle(140, 4, 40, 20, { roughness: 1.5, stroke: '#C4956A', strokeWidth: 1.3, fill: '#C4956A', fillStyle: 'solid' });
        }
        if (accessories.glasses) {
          rc.circle(148, 58, 18, { roughness: 1.5, stroke: '#3a6fbf', strokeWidth: 1.3 });
          rc.circle(172, 58, 18, { roughness: 1.5, stroke: '#3a6fbf', strokeWidth: 1.3 });
          rc.line(157, 58, 163, 58, { roughness: 1, stroke: '#3a6fbf', strokeWidth: 1 });
        }
        if (accessories.bowtie) {
          rc.linearPath([[145, 90], [160, 96], [175, 90], [160, 102], [145, 90]], { roughness: 1.5, stroke: '#e55', strokeWidth: 1.3, fill: '#e55', fillStyle: 'solid' });
        }
        if (accessories.cape) {
          rc.linearPath([[140, 100], [100, 200], [160, 180], [220, 200], [180, 100]], { roughness: 2, stroke: '#9b59b6', strokeWidth: 1.3, fill: 'rgba(155,89,182,0.2)', fillStyle: 'solid' });
        }
        if (accessories.crown) {
          rc.linearPath([[135, 36], [140, 20], [150, 30], [160, 14], [170, 30], [180, 20], [185, 36]], { roughness: 1.5, stroke: '#f0c040', strokeWidth: 1.3, fill: '#ffd', fillStyle: 'solid' });
        }
        if (accessories.mustache) {
          rc.arc(152, 70, 16, 10, 0, Math.PI, false, { roughness: 1.5, stroke: '#1A1A1A', strokeWidth: 1.3 });
          rc.arc(168, 70, 16, 10, 0, Math.PI, false, { roughness: 1.5, stroke: '#1A1A1A', strokeWidth: 1.3 });
        }
      }

      drawFigure();
      markWriggle(cvs, drawFigure);

      document.querySelectorAll('.dressup-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const acc = btn.dataset.acc;
          accessories[acc] = !accessories[acc];
          btn.classList.toggle('active', accessories[acc]);
          drawFigure();
        });
      });

      $('#dressupReset').addEventListener('click', () => {
        Object.keys(accessories).forEach(k => accessories[k] = false);
        document.querySelectorAll('.dressup-btn').forEach(b => b.classList.remove('active'));
        drawFigure();
      });
    }
  });
}

/* ═══ 8-BALL ═══════════════════════════════════════ */
function open8Ball() {
  const answers = [
    'It is certain.', 'It is decidedly so.', 'Without a doubt.', 'Yes definitely.',
    'You may rely on it.', 'As I see it, yes.', 'Most likely.', 'Outlook good.',
    'Yes.', 'Signs point to yes.', 'Reply hazy, try again.', 'Ask again later.',
    'Better not tell you now.', 'Cannot predict now.', 'Concentrate and ask again.',
    'Don\'t count on it.', 'My reply is no.', 'My sources say no.',
    'Outlook not so good.', 'Very doubtful.'
  ];
  const body = `
    <div class="ball-wrap">
      <input type="text" class="ball-question" id="ballQ" placeholder="Ask a question...">
      <canvas id="ballCanvas" width="200" height="200"></canvas>
      <div class="ball-answer" id="ballAnswer">Ask the ball...</div>
      <button class="ball-ask" id="ballAsk">Ask!</button>
    </div>`;
  createWindow('8ball', 'Magic 8-Ball', 300, 380, body, {
    onReady: () => {
      const cvs = $('#ballCanvas');
      if (!cvs) return;

      function drawBall() {
        const rc = RC(cvs); if (!rc) return;
        const ctx = cvs.getContext('2d');
        ctx.clearRect(0, 0, 200, 200);
        rc.circle(100, 100, 160, { roughness: 2, stroke: '#1A1A1A', strokeWidth: 2, fill: '#1A1A1A', fillStyle: 'solid' });
        rc.circle(100, 90, 50, { roughness: 1.5, stroke: '#223', strokeWidth: 1, fill: '#223', fillStyle: 'solid' });
      }

      drawBall();
      markWriggle(cvs, drawBall);

      function ask() {
        const cvs = $('#ballCanvas');
        if (cvs) cvs.classList.add('ball-shaking');
        const ansEl = $('#ballAnswer');
        if (ansEl) ansEl.textContent = '...';
        setTimeout(() => {
          if (cvs) cvs.classList.remove('ball-shaking');
          const answer = answers[Math.floor(Math.random() * answers.length)];
          if (ansEl) ansEl.textContent = answer;
        }, 500);
      }

      const askBtn = $('#ballAsk');
      if (askBtn) askBtn.addEventListener('click', ask);
      const cvs2 = $('#ballCanvas');
      if (cvs2) cvs2.addEventListener('click', ask);
    }
  });
}

/* ═══ CALCULATOR ═══════════════════════════════════ */
function openCalc() {
  const body = `
    <div class="calc-wrap">
      <div class="calc-display" id="calcDisplay">0</div>
      <div class="calc-grid">
        <button class="calc-btn" data-val="7">7</button>
        <button class="calc-btn" data-val="8">8</button>
        <button class="calc-btn" data-val="9">9</button>
        <button class="calc-btn op" data-val="/">÷</button>
        <button class="calc-btn" data-val="4">4</button>
        <button class="calc-btn" data-val="5">5</button>
        <button class="calc-btn" data-val="6">6</button>
        <button class="calc-btn op" data-val="*">×</button>
        <button class="calc-btn" data-val="1">1</button>
        <button class="calc-btn" data-val="2">2</button>
        <button class="calc-btn" data-val="3">3</button>
        <button class="calc-btn op" data-val="-">−</button>
        <button class="calc-btn" data-val="0">0</button>
        <button class="calc-btn clear" data-val="C">C</button>
        <button class="calc-btn eq" data-val="=">=</button>
        <button class="calc-btn op" data-val="+">+</button>
      </div>
    </div>`;
  createWindow('calc', 'Calculator', 280, 400, body, {
    onReady: (win) => {
      const display = win.querySelector('#calcDisplay');
      let current = '0', expr = '';
      win.querySelectorAll('.calc-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const v = btn.dataset.val;
          if (v === 'C') {
            current = '0'; expr = '';
          } else if (v === '=') {
            try {
              const safe = expr.replace(/[^0-9+\-*/().]/g, '');
              current = String(Function('"use strict";return (' + safe + ')')());
              expr = current;
            } catch { current = 'Error'; expr = ''; }
          } else if (['+', '-', '*', '/'].includes(v)) {
            expr += v;
            current = '';
          } else {
            if (current === '0' || current === 'Error') current = v;
            else current += v;
            expr += v;
          }
          display.textContent = current || '0';
        });
      });
    }
  });
}

/* ═══ NOTEPAD APP ══════════════════════════════════ */
function openNotepad() {
  const saved = localStorage.getItem('notepad-content') || '';
  const body = `
    <div class="np-wrap">
      <textarea class="np-textarea" id="npText" placeholder="Start typing...">${saved.replace(/</g,'&lt;')}</textarea>
    </div>`;
  createWindow('notepad', 'Notepad', 420, 380, body, {
    onReady: () => {
      const ta = $('#npText');
      if (ta) {
        ta.addEventListener('input', () => {
          localStorage.setItem('notepad-content', ta.value);
        });
      }
    }
  });
}

/* ═══ WEATHER ══════════════════════════════════════ */
function openWeather() {
  const body = `
    <div class="weather-wrap">
      <div class="weather-loc">Melbourne, VIC</div>
      <canvas id="weatherCanvas" width="100" height="100"></canvas>
      <div class="weather-temp" id="weatherTemp">Loading...</div>
      <div class="weather-detail" id="weatherDetail"></div>
      <button class="weather-refresh" id="weatherRefresh">Refresh</button>
    </div>`;
  createWindow('weather', 'Weather', 320, 300, body, {
    onReady: () => fetchWeather()
  });
}

function fetchWeather() {
  const url = 'https://api.open-meteo.com/v1/forecast?latitude=-37.81&longitude=144.96&current_weather=true';
  fetch(url).then(r => r.json()).then(data => {
    const w = data.current_weather;
    const tempEl = $('#weatherTemp');
    const detailEl = $('#weatherDetail');
    const cvs = $('#weatherCanvas');
    if (tempEl) tempEl.textContent = w.temperature + '°C';
    const codes = { 0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast', 45: 'Fog', 51: 'Light drizzle', 61: 'Rain', 71: 'Snow', 80: 'Showers', 95: 'Thunderstorm' };
    const desc = codes[w.weathercode] || 'Weather code ' + w.weathercode;
    if (detailEl) detailEl.textContent = desc + ' · Wind: ' + w.windspeed + ' km/h';
    if (cvs) {
      function drawWeather() {
        const rc = RC(cvs); if (!rc) return;
        const ctx = cvs.getContext('2d');
        ctx.clearRect(0, 0, 100, 100);
        if (w.weathercode <= 1) {
          rc.circle(50, 50, 50, { roughness: 2, stroke: '#C4956A', strokeWidth: 1.5, fill: '#ffd', fillStyle: 'solid' });
          [[50, 10, 50, 2], [50, 90, 50, 98], [10, 50, 2, 50], [90, 50, 98, 50]].forEach(([x1, y1, x2, y2]) => {
            rc.line(x1, y1, x2, y2, { roughness: 1.2, stroke: '#C4956A', strokeWidth: 1 });
          });
        } else {
          rc.ellipse(40, 50, 50, 30, { roughness: 2, stroke: '#9B9B9B', strokeWidth: 1.5, fill: '#e8e3d9', fillStyle: 'solid' });
          rc.ellipse(65, 45, 40, 25, { roughness: 2, stroke: '#9B9B9B', strokeWidth: 1.5, fill: '#e8e3d9', fillStyle: 'solid' });
        }
      }
      drawWeather();
      markWriggle(cvs, drawWeather);
    }
  }).catch(() => {
    const tempEl = $('#weatherTemp');
    if (tempEl) tempEl.textContent = 'Failed to load';
  });
  const btn = $('#weatherRefresh');
  if (btn) btn.onclick = fetchWeather;
}

/* ═══ CLOCK ════════════════════════════════════════ */
function openClock() {
  const body = `
    <div class="clock-wrap">
      <canvas id="clockCanvas" width="240" height="240"></canvas>
      <div class="clock-digital" id="clockDigital"></div>
    </div>`;
  let clockInterval = null;
  createWindow('clock', 'Clock', 300, 340, body, {
    onReady: () => {
      const cvs = $('#clockCanvas');
      if (!cvs) return;

      function drawClock() {
        const rc = RC(cvs); if (!rc) return;
        const ctx = cvs.getContext('2d');
        ctx.clearRect(0, 0, 240, 240);
        const cx = 120, cy = 120, r = 100;

        rc.circle(cx, cy, r * 2, { roughness: 1.8, stroke: '#1A1A1A', strokeWidth: 1.5 });

        // Numbers
        ctx.font = '600 18px Caveat'; ctx.fillStyle = '#1A1A1A'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        for (let i = 1; i <= 12; i++) {
          const angle = (i * 30 - 90) * Math.PI / 180;
          ctx.fillText(i, cx + Math.cos(angle) * 82, cy + Math.sin(angle) * 82);
        }

        // Dots at 12/3/6/9
        [0, 90, 180, 270].forEach(deg => {
          const a = (deg - 90) * Math.PI / 180;
          rc.circle(cx + Math.cos(a) * 94, cy + Math.sin(a) * 94, 4, { roughness: 1, stroke: '#4A7C59', fill: '#4A7C59', fillStyle: 'solid', strokeWidth: 0.8 });
        });

        const now = new Date();
        const h = now.getHours() % 12, m = now.getMinutes(), s = now.getSeconds();

        // Hour hand
        const hAngle = ((h + m / 60) * 30 - 90) * Math.PI / 180;
        rc.line(cx, cy, cx + Math.cos(hAngle) * 55, cy + Math.sin(hAngle) * 55, { roughness: 1.5, stroke: '#1A1A1A', strokeWidth: 2.5 });

        // Minute hand
        const mAngle = ((m + s / 60) * 6 - 90) * Math.PI / 180;
        rc.line(cx, cy, cx + Math.cos(mAngle) * 75, cy + Math.sin(mAngle) * 75, { roughness: 1.5, stroke: '#1A1A1A', strokeWidth: 1.5 });

        // Second hand (red)
        const sAngle = (s * 6 - 90) * Math.PI / 180;
        rc.line(cx, cy, cx + Math.cos(sAngle) * 80, cy + Math.sin(sAngle) * 80, { roughness: 1, stroke: '#e55', strokeWidth: 1 });

        // Center dot
        rc.circle(cx, cy, 6, { roughness: 1, stroke: '#1A1A1A', fill: '#1A1A1A', fillStyle: 'solid', strokeWidth: 1 });

        const digitalEl = $('#clockDigital');
        if (digitalEl) digitalEl.textContent = now.toLocaleTimeString();
      }

      drawClock();
      clockInterval = setInterval(drawClock, 1000);
    },
    onClose: () => {
      if (clockInterval) { clearInterval(clockInterval); clockInterval = null; }
    }
  });
}

/* ═══ LINKS / BOOKMARKS ═══════════════════════════ */
function openLinks() {
  const links = [
    { title: 'GitHub', url: 'https://github.com/Huh2006', letter: 'G', color: '#1A1A1A' },
    { title: 'LinkedIn', url: 'https://linkedin.com/in/adrian-tan12', letter: 'L', color: '#3a6fbf' },
    { title: 'RMIT', url: 'https://rmit.edu.au', letter: 'R', color: '#e55' },
    { title: 'Rough.js', url: 'https://roughjs.com', letter: 'R', color: '#4A7C59' },
    { title: 'MDN Web Docs', url: 'https://developer.mozilla.org', letter: 'M', color: '#1A1A1A' },
    { title: 'Blender', url: 'https://blender.org', letter: 'B', color: '#C4956A' },
  ];
  let html = '<div class="links-list">';
  links.forEach((l, i) => {
    html += `
      <a href="${l.url}" target="_blank" rel="noopener" class="links-item">
        <canvas width="24" height="24" data-link-idx="${i}"></canvas>
        <div class="links-info">
          <span class="links-title">${l.title}</span>
          <span class="links-url">${l.url}</span>
        </div>
      </a>`;
  });
  html += '</div>';
  createWindow('links', 'Bookmarks', 360, 380, html, {
    onReady: (win) => {
      win.querySelectorAll('.links-item canvas').forEach(cvs => {
        const idx = parseInt(cvs.dataset.linkIdx);
        const l = links[idx];
        function drawIcon() {
          const rc = RC(cvs); if (!rc) return;
          const ctx = cvs.getContext('2d');
          ctx.clearRect(0, 0, 24, 24);
          rc.circle(12, 12, 20, { roughness: 1.5, stroke: l.color, strokeWidth: 1.2 });
          ctx.font = '600 12px Caveat'; ctx.fillStyle = l.color;
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText(l.letter, 12, 13);
        }
        drawIcon();
        markWriggle(cvs, drawIcon);
      });
    }
  });
}

/* ═══ GUESTBOOK (Supabase) ═════════════════════════ */
const SUPABASE_URL = 'https://fahhjkmejewsmzbtpiiv.supabase.co';
const SUPABASE_KEY = 'sb_publishable_jDZ4eDAmdmSA5u50wteqTw__q8fEhGA';

async function sbFetch(path, opts = {}) {
  const res = await fetch(SUPABASE_URL + '/rest/v1/' + path, {
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': 'Bearer ' + SUPABASE_KEY,
      'Content-Type': 'application/json',
      'Prefer': opts.prefer || '',
      ...opts.headers,
    },
    method: opts.method || 'GET',
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  if (opts.method === 'DELETE') return [];
  return res.json();
}

function openGuestbook() {
  const body = `
    <div class="gb-wrap">
      <div class="gb-form">
        <input type="text" class="gb-input" id="gbName" placeholder="Your name" maxlength="50">
        <textarea class="gb-textarea" id="gbMsg" placeholder="Leave a message..." rows="3" maxlength="280"></textarea>
        <button class="gb-sign" id="gbSign">Sign</button>
      </div>
      <div class="gb-entries" id="gbEntries">
        <div class="gb-empty">Loading...</div>
      </div>
    </div>`;
  createWindow('guestbook', 'Guestbook', 420, 460, body, {
    onReady: () => {
      renderGuestbook();
      const signBtn = $('#gbSign');
      if (signBtn) signBtn.addEventListener('click', async () => {
        const nameEl = $('#gbName');
        const msgEl = $('#gbMsg');
        const name = nameEl?.value.trim();
        const msg = msgEl?.value.trim();
        if (!name || !msg) return;
        signBtn.disabled = true;
        signBtn.textContent = '...';
        await sbFetch('guestbook', {
          method: 'POST',
          prefer: 'return=representation',
          body: { name, msg },
        });
        if (nameEl) nameEl.value = '';
        if (msgEl) msgEl.value = '';
        signBtn.disabled = false;
        signBtn.textContent = 'Sign';
        renderGuestbook();
      });
    }
  });
}

async function renderGuestbook() {
  const container = $('#gbEntries');
  if (!container) return;

  const entries = await sbFetch('guestbook?select=*&order=created_at.desc&limit=50');

  if (!entries || entries.length === 0) {
    container.innerHTML = '<div class="gb-empty">No entries yet. Be the first!</div>';
    return;
  }
  const isAdm = typeof window.isAdmin === 'function' && window.isAdmin();
  container.innerHTML = entries.map(e => {
    const time = new Date(e.created_at).toLocaleString();
    return `
    <div class="gb-entry">
      <div class="gb-entry-top">
        <span class="gb-name">${e.name.replace(/</g,'&lt;')}</span>
        <span class="gb-time">${time}</span>
        ${isAdm ? `<button class="gb-del" data-gb-id="${e.id}" title="Delete">✕</button>` : ''}
      </div>
      <p class="gb-msg">${e.msg.replace(/</g,'&lt;')}</p>
    </div>`;
  }).join('');

  // Admin delete buttons
  if (isAdm) {
    container.querySelectorAll('.gb-del').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.gbId;
        btn.textContent = '…';
        await sbFetch('guestbook?id=eq.' + id, { method: 'DELETE' });
        renderGuestbook();
      });
    });
  }
}

/* ═══ TRASH ════════════════════════════════════════ */
function openTrash() {
  const body = `
    <div class="trash-wrap">
      <canvas id="trashBinCanvas" width="80" height="80"></canvas>
      <div class="trash-msg">Nothing here... yet 🗑️</div>
    </div>`;
  createWindow('trash', 'Trash', 300, 200, body, {
    onReady: () => {
      const cvs = $('#trashBinCanvas');
      if (!cvs) return;
      function drawBin() {
        const rc = RC(cvs); if (!rc) return;
        const ctx = cvs.getContext('2d');
        ctx.clearRect(0, 0, 80, 80);
        rc.rectangle(25, 10, 30, 8, { roughness: 1.5, stroke: '#9B9B9B', strokeWidth: 1.3 });
        rc.linearPath([[18, 18], [22, 70], [58, 70], [62, 18]], { roughness: 1.8, stroke: '#9B9B9B', strokeWidth: 1.3 });
        rc.line(33, 26, 33, 62, { roughness: 1.2, stroke: '#9B9B9B', strokeWidth: 0.8 });
        rc.line(40, 26, 40, 62, { roughness: 1.2, stroke: '#9B9B9B', strokeWidth: 0.8 });
        rc.line(47, 26, 47, 62, { roughness: 1.2, stroke: '#9B9B9B', strokeWidth: 0.8 });
      }
      drawBin();
      markWriggle(cvs, drawBin);
    }
  });
}

/* ═══ SETTINGS ═════════════════════════════════════ */
function openSettings() {
  const colors = ['#F7F5F0', '#E8E3D9', '#f0e6d3', '#dde8dd', '#d8e0ed', '#1A1A1A'];
  const colorDots = colors.map(c =>
    `<button class="settings-color" style="background:${c};${c === '#1A1A1A' ? 'border-color:#666' : ''}" data-color="${c}"></button>`
  ).join('');

  const body = `
    <div class="settings-wrap">
      <div class="settings-section">
        <div class="settings-label">Wallpaper Color</div>
        <div class="settings-colors">${colorDots}</div>
      </div>
      <div class="settings-section">
        <div class="settings-label">Wriggle Speed</div>
        <input type="range" min="4" max="16" value="${WRIGGLE_FPS}" class="settings-range" id="settingsWriggle">
      </div>
      <div class="settings-section">
        <div class="settings-label">Music Volume</div>
        <input type="range" min="0" max="100" value="${masterGain ? Math.round(masterGain.gain.value * 100) : 30}" class="settings-range" id="settingsVolume">
      </div>
      <button class="settings-reset" id="settingsReset">Reset All</button>
    </div>`;
  createWindow('settings', 'Settings', 380, 400, body, {
    onReady: (win) => {
      win.querySelectorAll('.settings-color').forEach(btn => {
        btn.addEventListener('click', () => {
          const c = btn.dataset.color;
          document.body.style.background = c;
          document.documentElement.style.setProperty('--bg', c);
        });
      });

      const wriggleSlider = win.querySelector('#settingsWriggle');
      if (wriggleSlider) wriggleSlider.addEventListener('input', () => {
        WRIGGLE_FPS = parseInt(wriggleSlider.value);
      });

      const volSlider = win.querySelector('#settingsVolume');
      if (volSlider) volSlider.addEventListener('input', () => {
        if (masterGain) masterGain.gain.value = parseInt(volSlider.value) / 100;
      });

      const resetBtn = win.querySelector('#settingsReset');
      if (resetBtn) resetBtn.addEventListener('click', () => {
        document.body.style.background = '';
        document.documentElement.style.setProperty('--bg', '#F7F5F0');
        WRIGGLE_FPS = 8;
        if (wriggleSlider) wriggleSlider.value = 8;
        if (masterGain) masterGain.gain.value = 0.3;
        if (volSlider) volSlider.value = 30;
      });
    }
  });
}

/* ═══ PHOTOS ═══════════════════════════════════════ */
const defaultPhotos = [
  { caption: 'Sunset', fill: '#C4956A', accent: '#e55' },
  { caption: 'Mountains', fill: '#4A7C59', accent: '#9B9B9B' },
  { caption: 'City Lights', fill: '#1A1A1A', accent: '#f0c040' },
  { caption: 'Ocean', fill: '#3a6fbf', accent: '#87CEEB' },
  { caption: 'Forest', fill: '#4A7C59', accent: '#2d5a3f' },
  { caption: 'Abstract', fill: '#9b59b6', accent: '#C4956A' },
];

function getUploadedPhotos() {
  return JSON.parse(localStorage.getItem('portfolio-photos') || '[]');
}
function saveUploadedPhotos(arr) {
  localStorage.setItem('portfolio-photos', JSON.stringify(arr));
}

function openPhotos() {
  const isAdm = typeof window.isAdmin === 'function' && window.isAdmin();
  const uploaded = getUploadedPhotos();

  let html = '';
  if (isAdm) {
    html += `<div class="photos-admin-bar">
      <button class="gb-sign" id="photosAddBtn">+ Add Image</button>
      <input type="file" id="photosFileInput" accept="image/*" style="display:none">
    </div>`;
  }
  html += '<div class="photos-grid" id="photosGrid">';

  // Uploaded images first
  uploaded.forEach((p, i) => {
    html += `
      <div class="photo-polaroid photo-real" data-uploaded-idx="${i}">
        <img src="${p.data}" alt="${p.caption}" style="width:132px;height:90px;object-fit:cover;border-radius:2px;">
        <span class="photo-caption">${p.caption.replace(/</g,'&lt;')}</span>
        ${isAdm ? `<button class="photo-del" data-del-idx="${i}" title="Delete">✕</button>` : ''}
      </div>`;
  });

  // Default sketch photos
  defaultPhotos.forEach((p, i) => {
    html += `
      <div class="photo-polaroid photo-sketch" data-photo-idx="${i}">
        <canvas width="140" height="120" data-photo-idx="${i}"></canvas>
        <span class="photo-caption">${p.caption}</span>
      </div>`;
  });
  html += '</div>';

  createWindow('photos', 'Photos', 460, 440, html, {
    onReady: (win) => {
      // Draw sketch photos
      win.querySelectorAll('.photo-sketch canvas').forEach(cvs => {
        const idx = parseInt(cvs.dataset.photoIdx);
        const p = defaultPhotos[idx];
        function drawPhoto() {
          const rc = RC(cvs); if (!rc) return;
          const ctx = cvs.getContext('2d');
          ctx.clearRect(0, 0, 140, 120);
          rc.rectangle(4, 4, 132, 112, { roughness: 1.8, stroke: '#1A1A1A', strokeWidth: 1, fill: '#fff', fillStyle: 'solid' });
          rc.rectangle(12, 10, 116, 80, { roughness: 1.5, stroke: '#9B9B9B', strokeWidth: 0.8, fill: p.fill, fillStyle: 'solid', fillWeight: 0.5 });
          rc.line(12, 80, 50, 40, { roughness: 1.5, stroke: p.accent, strokeWidth: 1.2 });
          rc.line(50, 40, 80, 65, { roughness: 1.5, stroke: p.accent, strokeWidth: 1.2 });
          rc.line(80, 65, 128, 35, { roughness: 1.5, stroke: p.accent, strokeWidth: 1.2 });
          rc.circle(110, 22, 14, { roughness: 1.5, stroke: '#ffd', strokeWidth: 1, fill: '#ffd', fillStyle: 'solid' });
        }
        drawPhoto();
        markWriggle(cvs, drawPhoto);
      });

      // Click sketch photos to enlarge
      win.querySelectorAll('.photo-sketch').forEach(el => {
        el.addEventListener('click', () => {
          const idx = parseInt(el.dataset.photoIdx);
          const p = defaultPhotos[idx];
          const bigBody = `<div class="photo-big"><canvas id="photoBig${idx}" width="380" height="280"></canvas></div>`;
          createWindow('photo-' + idx, p.caption, 420, 340, bigBody, {
            onReady: () => {
              const bigCvs = $(`#photoBig${idx}`);
              if (!bigCvs) return;
              function drawBig() {
                const rc = RC(bigCvs); if (!rc) return;
                const ctx = bigCvs.getContext('2d');
                ctx.clearRect(0, 0, 380, 280);
                rc.rectangle(4, 4, 372, 272, { roughness: 2, stroke: '#1A1A1A', strokeWidth: 1.5, fill: p.fill, fillStyle: 'solid', fillWeight: 0.5 });
                rc.line(4, 250, 120, 130, { roughness: 2, stroke: p.accent, strokeWidth: 2 });
                rc.line(120, 130, 220, 190, { roughness: 2, stroke: p.accent, strokeWidth: 2 });
                rc.line(220, 190, 376, 100, { roughness: 2, stroke: p.accent, strokeWidth: 2 });
                rc.circle(320, 50, 40, { roughness: 2, stroke: '#ffd', strokeWidth: 1.5, fill: '#ffd', fillStyle: 'solid' });
                ctx.font = '700 28px Caveat'; ctx.fillStyle = '#fff'; ctx.textAlign = 'center';
                ctx.fillText(p.caption, 190, 260);
              }
              drawBig();
              markWriggle(bigCvs, drawBig);
            }
          });
        });
      });

      // Click uploaded photos to enlarge
      win.querySelectorAll('.photo-real').forEach(el => {
        el.addEventListener('click', (e) => {
          if (e.target.classList.contains('photo-del')) return;
          const idx = parseInt(el.dataset.uploadedIdx);
          const p = getUploadedPhotos()[idx];
          if (!p) return;
          const bigBody = `<div class="photo-big"><img src="${p.data}" alt="${p.caption}" style="max-width:100%;max-height:100%;object-fit:contain;border-radius:4px;"></div>`;
          createWindow('uphoto-' + idx, p.caption, 500, 400, bigBody);
        });
      });

      // Admin: add image button
      if (isAdm) {
        const addBtn = win.querySelector('#photosAddBtn');
        const fileInput = win.querySelector('#photosFileInput');
        if (addBtn && fileInput) {
          addBtn.addEventListener('click', () => fileInput.click());
          fileInput.addEventListener('change', () => {
            const file = fileInput.files[0];
            if (!file) return;
            const caption = prompt('Caption for this image:', file.name.replace(/\.[^.]+$/, ''));
            if (!caption) return;
            const reader = new FileReader();
            reader.onload = (e) => {
              const photos = getUploadedPhotos();
              photos.push({ caption, data: e.target.result });
              saveUploadedPhotos(photos);
              // Reopen to refresh
              closeWindow('photos');
              setTimeout(() => openPhotos(), 100);
            };
            reader.readAsDataURL(file);
          });
        }

        // Admin: delete uploaded photos
        win.querySelectorAll('.photo-del').forEach(btn => {
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const idx = parseInt(btn.dataset.delIdx);
            const photos = getUploadedPhotos();
            photos.splice(idx, 1);
            saveUploadedPhotos(photos);
            closeWindow('photos');
            setTimeout(() => openPhotos(), 100);
          });
        });
      }
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
