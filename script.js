/* ═══════════════════════════════════════════════
   Adrian's Portfolio — script.js
   ═══════════════════════════════════════════════ */

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

/* ─── Custom Cursor ──────────────────────────────── */
const cursor    = $('#cursor');
const cursorDot = $('#cursorDot');
let mx = 0, my = 0, cx = 0, cy = 0;

document.addEventListener('mousemove', (e) => {
  mx = e.clientX;
  my = e.clientY;
  if (cursorDot) { cursorDot.style.left = mx + 'px'; cursorDot.style.top = my + 'px'; }
});

(function moveCursor() {
  cx += (mx - cx) * 0.11;
  cy += (my - cy) * 0.11;
  if (cursor) { cursor.style.left = cx + 'px'; cursor.style.top = cy + 'px'; }
  requestAnimationFrame(moveCursor);
})();

$$('a, button, .project-card, .chip').forEach(el => {
  el.addEventListener('mouseenter', () => {
    const isCard = el.classList.contains('project-card');
    cursor?.classList.toggle('on-link', !isCard);
    cursor?.classList.toggle('on-card', isCard);
    cursorDot?.classList.toggle('on-link', !isCard);
  });
  el.addEventListener('mouseleave', () => {
    cursor?.classList.remove('on-link', 'on-card');
    cursorDot?.classList.remove('on-link');
  });
});

/* ─── Nav scroll state ───────────────────────────── */
const nav = $('#nav');
if (nav) {
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });
}

/* ─── Scroll Reveal ──────────────────────────────── */
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) e.target.classList.add('visible');
  });
}, { threshold: 0.12 });
window.revealObs = revealObs; /* expose for admin.js */

$$('.reveal, .reveal-instant').forEach(el => revealObs.observe(el));

/* Hero elements fire instantly */
$$('.reveal-instant').forEach((el, i) => {
  const delay = [0, 300, 500, 700, 900][i] ?? i * 150;
  setTimeout(() => el.classList.add('visible'), delay);
});

/* Hero-right sketch reveal */
setTimeout(() => {
  const heroRight = $('.hero-right');
  if (heroRight) heroRight.classList.add('visible');
}, 1000);

/* ─── Hero Trail Canvas ──────────────────────────── */
(function initTrail() {
  const canvas = $('#trailCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let strokes = [];
  let lx = null, ly = null;

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  const hero = $('#hero');
  if (!hero) return;
  hero.addEventListener('mousemove', (e) => {
    const r = canvas.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    if (lx !== null) {
      strokes.push({ x1: lx, y1: ly, x2: x, y2: y, life: 1, w: Math.random() * 0.8 + 0.3 });
    }
    lx = x; ly = y;
  });
  hero.addEventListener('mouseleave', () => { lx = null; ly = null; });

  function pencilLine(x1, y1, x2, y2, alpha, w) {
    for (let i = 0; i < 3; i++) {
      const ox = (Math.random() - 0.5) * 1.4;
      const oy = (Math.random() - 0.5) * 1.4;
      ctx.beginPath();
      ctx.moveTo(x1 + ox, y1 + oy);
      ctx.lineTo(x2 + ox, y2 + oy);
      ctx.strokeStyle = `rgba(26,26,26,${alpha * 0.13})`;
      ctx.lineWidth   = w * (0.4 + Math.random() * 0.6);
      ctx.lineCap     = 'round';
      ctx.stroke();
    }
  }

  (function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    strokes = strokes.filter(s => s.life > 0.008);
    strokes.forEach(s => { pencilLine(s.x1, s.y1, s.x2, s.y2, s.life, s.w); s.life *= 0.982; });
    requestAnimationFrame(loop);
  })();
})();

/* ─── Hero Sketch (right side) ───────────────────── */
(function drawHeroSketch() {
  const canvas = $('#sketchCanvas');
  if (!canvas || typeof rough === 'undefined') return;

  const rc  = rough.canvas(canvas);
  const ctx = canvas.getContext('2d');
  const W = 480, H = 480;
  const ink = '#1A1A1A', green = '#4A7C59', warm = '#C4956A';
  const base = { roughness: 1.4, strokeWidth: 1.2 };
  const gOpt = { ...base, stroke: green, roughness: 1.8 };
  const wOpt = { ...base, stroke: warm,  roughness: 1.6 };
  const iOpt = { ...base, stroke: ink };
  ctx.clearRect(0, 0, W, H);

  let t = 0;
  const d = (fn, ms) => setTimeout(fn, ms);

  d(() => rc.circle(W/2, H/2, 370, { ...iOpt, roughness: 2.2, strokeWidth: 1, stroke: '#CCCAC4' }), t += 0);
  d(() => rc.circle(W/2, H/2, 190, { ...gOpt, strokeWidth: 1.3 }), t += 130);
  d(() => rc.rectangle(148, 148, 184, 128, { ...iOpt, strokeWidth: 1.3 }), t += 110);
  d(() => rc.line(162, 165, 318, 165, { ...iOpt, roughness: 1, strokeWidth: 0.8, stroke: '#CCCAC4' }), t += 60);
  d(() => rc.line(240, 276, 240, 306, { ...iOpt, strokeWidth: 1.1 }), t += 70);
  d(() => rc.line(205, 306, 275, 306, { ...iOpt, strokeWidth: 1.1 }), t += 50);
  d(() => {
    ctx.font = '600 28px Caveat, cursive';
    ctx.fillStyle = green;
    ctx.globalAlpha = 0;
    (function fi(a) {
      ctx.globalAlpha = a;
      ctx.fillText('</ >', 185, 222);
      if (a < 1) requestAnimationFrame(() => fi(Math.min(a + 0.05, 1)));
      else ctx.globalAlpha = 1;
    })(0);
  }, t += 110);
  d(() => {
    [[82,92,4.5,warm,0.65],[392,72,3,green,0.6],[62,355,3.5,ink,0.25],[405,348,2.5,warm,0.55],[265,58,2,green,0.5]].forEach(([x,y,r,c,a]) => {
      ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2);
      ctx.fillStyle = c; ctx.globalAlpha = a; ctx.fill();
    });
    ctx.globalAlpha = 1;
  }, t += 70);
  d(() => {
    [[328,95,362,52],[346,100,380,57],[364,105,398,62]].forEach(([x1,y1,x2,y2]) => {
      rc.line(x1,y1,x2,y2, { ...wOpt, roughness: 1.2, strokeWidth: 0.8 });
    });
  }, t += 90);
  d(() => {
    ctx.globalAlpha = 0.6;
    ctx.font = '22px Caveat, cursive'; ctx.fillStyle = warm; ctx.fillText('✦', 74, 198);
    ctx.font = '14px Caveat, cursive'; ctx.fillStyle = green; ctx.fillText('✦', 374, 272);
    ctx.globalAlpha = 1;
  }, t += 90);
  d(() => {
    ctx.font = '400 16px Caveat, cursive'; ctx.fillStyle = ink;
    ctx.globalAlpha = 0.28; ctx.fillText('build. learn. repeat.', 128, 345); ctx.globalAlpha = 1;
  }, t += 130);
})();

/* ─── About Canvas ───────────────────────────────── */
(function initAbout() {
  const canvas = $('#aboutCanvas');
  if (!canvas || typeof rough === 'undefined') return;
  let drawn = false;
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting && !drawn) { drawn = true; drawAbout(canvas); } });
  }, { threshold: 0.3 });
  obs.observe(canvas);
})();

function drawAbout(canvas) {
  const rc  = rough.canvas(canvas);
  const ctx = canvas.getContext('2d');
  const ink = '#1A1A1A', green = '#4A7C59', warm = '#C4956A';
  const base = { roughness: 2.5, strokeWidth: 1.4 };
  let t = 0;
  const d = (fn, ms) => setTimeout(fn, ms);

  d(() => rc.circle(170, 160, 280, { ...base, stroke: '#E5E0D5', roughness: 3, strokeWidth: 1 }), t += 0);
  d(() => rc.line(40, 240, 300, 240, { ...base, stroke: ink, roughness: 2 }), t += 120);
  d(() => rc.rectangle(90, 130, 160, 110, { ...base, stroke: ink }), t += 100);
  d(() => rc.rectangle(75, 240, 190, 14, { ...base, stroke: ink, roughness: 1.5 }), t += 80);
  d(() => {
    [[105,160,225,160],[105,175,195,175],[105,190,215,190]].forEach(([x1,y1,x2,y2]) => {
      rc.line(x1,y1,x2,y2, { ...base, stroke: green, roughness: 1.2, strokeWidth: 1 });
    });
  }, t += 80);
  d(() => {
    rc.rectangle(268, 195, 32, 44, { ...base, stroke: warm, roughness: 2 });
    rc.arc(300, 217, 18, 20, -Math.PI/4, Math.PI/4, false, { ...base, stroke: warm });
  }, t += 80);
  d(() => {
    rc.line(277, 193, 273, 178, { ...base, stroke: '#C4956A55', roughness: 2 });
    rc.line(290, 192, 288, 175, { ...base, stroke: '#C4956A55', roughness: 2 });
  }, t += 60);
  d(() => {
    ctx.font = '700 28px Caveat, cursive';
    ctx.fillStyle = green; ctx.globalAlpha = 0.5; ctx.fillText('{ }', 36, 150);
    ctx.fillStyle = warm; ctx.fillText('< >', 36, 200); ctx.globalAlpha = 1;
  }, t += 80);
  d(() => {
    [[300,100,3,warm],[50,270,3,green],[310,275,4,ink],[160,90,2.5,green]].forEach(([x,y,r,c]) => {
      ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2);
      ctx.fillStyle = c; ctx.globalAlpha = 0.6; ctx.fill(); ctx.globalAlpha = 1;
    });
  }, t += 80);
  d(() => {
    ctx.font = '400 17px Caveat, cursive'; ctx.fillStyle = ink;
    ctx.globalAlpha = 0.28; ctx.fillText('my workspace ☕', 78, 305); ctx.globalAlpha = 1;
  }, t += 100);
}

/* ─── Project Card Hover (Rough.js border) ───────── */
function initCardHover() {
  $$('.project-card').forEach((card) => {
    if (card.dataset.hoverInit) return;
    card.dataset.hoverInit = 'true';
    const canvas = card.querySelector('.card-canvas');
    if (!canvas || typeof rough === 'undefined') return;

    let drawn = false;
    card.addEventListener('mouseenter', () => {
      if (!drawn) {
        canvas.width  = card.offsetWidth;
        canvas.height = card.offsetHeight;
        drawn = true;
      }
      const rc  = rough.canvas(canvas);
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      rc.rectangle(5, 5, canvas.width - 10, canvas.height - 10, {
        roughness: 2.5,
        stroke: 'rgba(247,245,240,0.5)',
        strokeWidth: 1.5,
      });
      rc.rectangle(10, 10, canvas.width - 20, canvas.height - 20, {
        roughness: 3,
        stroke: 'rgba(247,245,240,0.18)',
        strokeWidth: 1,
      });
      canvas.style.opacity = '1';
    });
    card.addEventListener('mouseleave', () => { canvas.style.opacity = '0'; });
  });
}
window.initCardHover = initCardHover; /* expose for admin.js */
initCardHover();

/* ─── Project Card Click → project.html ─────────── */
$$('.project-card').forEach(card => {
  card.addEventListener('click', () => {
    if (typeof window.isAdmin === 'function' && window.isAdmin()) return;
    const id = card.dataset.projectId;
    if (id) window.location.href = `project.html?id=${id}`;
  });
});

/* ─── Contact Canvas ─────────────────────────────── */
(function initContact() {
  const canvas = $('#contactCanvas');
  if (!canvas || typeof rough === 'undefined') return;
  let drawn = false;
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting && !drawn) { drawn = true; drawContact(canvas); } });
  }, { threshold: 0.3 });
  obs.observe(canvas);
})();

function drawContact(canvas) {
  const rc  = rough.canvas(canvas);
  const ctx = canvas.getContext('2d');
  const green = '#4A7C59', warm = '#C4956A', ink = '#1A1A1A';
  const base  = { roughness: 2.5, strokeWidth: 1.3 };
  let t = 0;
  const d = (fn, ms) => setTimeout(fn, ms);

  d(() => rc.circle(80, 80, 100, { ...base, stroke: '#E5E0D5', roughness: 3.5 }), t += 0);
  d(() => rc.circle(80, 80, 60,  { ...base, stroke: green, roughness: 2.8 }), t += 140);
  d(() => {
    ctx.font = '700 26px Caveat, cursive'; ctx.fillStyle = ink; ctx.globalAlpha = 0;
    (function f(a) {
      ctx.clearRect(56, 56, 50, 36); ctx.globalAlpha = a; ctx.fillText(':)', 60, 88);
      if (a < 1) requestAnimationFrame(() => f(Math.min(a + 0.05, 1)));
      else ctx.globalAlpha = 1;
    })(0);
  }, t += 140);
  d(() => {
    [[20,20,3.5,warm],[145,30,2.5,green],[150,140,3,ink]].forEach(([x,y,r,c]) => {
      ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2);
      ctx.fillStyle = c; ctx.globalAlpha = 0.65; ctx.fill(); ctx.globalAlpha = 1;
    });
  }, t += 100);
}

/* ─── Smooth anchor scroll ───────────────────────── */
$$('a[href^="#"]').forEach(a => {
  a.addEventListener('click', (e) => {
    const target = $(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth' });
  });
});
