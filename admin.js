/* ═══════════════════════════════════════════════
   Admin — admin.js
   Handles: login, toolbar, inline text editing,
   add/edit/delete projects.
   ═══════════════════════════════════════════════ */

(function () {
  /*
   * Credentials are stored as SHA-256 hashes so the plaintext
   * password is never exposed in source code.
   * To change the password, run in browser console:
   *   crypto.subtle.digest('SHA-256', new TextEncoder().encode('your-new-password'))
   *     .then(h => console.log([...new Uint8Array(h)].map(b=>b.toString(16).padStart(2,'0')).join('')))
   * Then paste the output as PASS_HASH below.
   */
  const EMAIL_HASH = '575370e89842cd25a31ea4dfd8372c6e6f7e63cf10f1fa1efa65b3d30792881d';
  const PASS_HASH  = '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918';
  const SESSION_KEY = 'portfolio_admin';
  let adminActive = false;

  async function sha256(str) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
    return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /* Expose for script.js card-click guard */
  window.isAdmin = () => adminActive;

  function debounce(fn, ms) {
    let t;
    return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
  }

  /* ── Apply saved text overrides ───────────────── */
  function applyStoredText() {
    document.querySelectorAll('[data-editable-key]').forEach(el => {
      const val = localStorage.getItem('portfolio_text_' + el.dataset.editableKey);
      if (val !== null) el.innerHTML = val;
    });
  }

  /* ── Login Modal ──────────────────────────────── */
  function buildLoginModal() {
    const div = document.createElement('div');
    div.id = 'adminLoginModal';
    div.innerHTML = `
      <div class="alm-overlay" id="almOverlay"></div>
      <div class="alm-box">
        <div class="alm-head">
          <span>Admin Login</span>
          <button class="alm-close" id="almClose">✕</button>
        </div>
        <div class="alm-body">
          <label class="alm-label">Email</label>
          <input class="alm-input" type="email" id="almEmail" placeholder="email" autocomplete="off"/>
          <label class="alm-label">Password</label>
          <input class="alm-input" type="password" id="almPass" placeholder="••••••••"/>
          <p class="alm-error" id="almError"></p>
          <button class="alm-btn" id="almSubmit">Login</button>
        </div>
      </div>`;
    document.body.appendChild(div);

    document.getElementById('almClose').addEventListener('click', closeLogin);
    document.getElementById('almOverlay').addEventListener('click', closeLogin);
    document.getElementById('almSubmit').addEventListener('click', tryLogin);
    document.getElementById('almPass').addEventListener('keydown', e => { if (e.key === 'Enter') tryLogin(); });
  }

  function openLogin() {
    if (adminActive) return;
    document.getElementById('adminLoginModal').classList.add('open');
    setTimeout(() => document.getElementById('almEmail').focus(), 80);
  }

  function closeLogin() {
    document.getElementById('adminLoginModal').classList.remove('open');
    document.getElementById('almError').textContent = '';
    document.getElementById('almEmail').value = '';
    document.getElementById('almPass').value = '';
  }

  async function tryLogin() {
    const email = document.getElementById('almEmail').value.trim();
    const pass  = document.getElementById('almPass').value;
    const emailH = await sha256(email);
    const passH  = await sha256(pass);
    if (emailH === EMAIL_HASH && passH === PASS_HASH) {
      sessionStorage.setItem(SESSION_KEY, '1');
      closeLogin();
      activateAdmin();
    } else {
      document.getElementById('almError').textContent = 'Incorrect credentials.';
      document.getElementById('almPass').value = '';
    }
  }

  /* ── Admin Toolbar ────────────────────────────── */
  function buildToolbar() {
    const bar = document.createElement('div');
    bar.id = 'adminBar';
    bar.innerHTML = `
      <div class="abar-inner">
        <div class="abar-left">
          <span class="abar-dot"></span>
          <span class="abar-label">Admin Mode — click any text to edit it</span>
        </div>
        <div class="abar-right">
          <button class="abar-btn" id="abarAdd">+ Add Project</button>
          <button class="abar-btn danger" id="abarLogout">Logout</button>
        </div>
      </div>`;
    document.body.appendChild(bar);

    document.getElementById('abarLogout').addEventListener('click', logout);
    const addBtn = document.getElementById('abarAdd');
    if (addBtn) addBtn.addEventListener('click', () => openProjectModal(null));
  }

  /* ── Activate / Deactivate ────────────────────── */
  function activateAdmin() {
    adminActive = true;
    document.body.classList.add('admin-mode');

    const btn = document.getElementById('adminBtn');
    if (btn) { btn.classList.add('active'); btn.title = 'Admin Active — click to open settings'; }

    /* Make text elements editable */
    document.querySelectorAll('[data-editable-key]').forEach(el => {
      el.contentEditable = 'true';
      el.spellcheck = false;
      el.addEventListener('input', debounce(() => {
        localStorage.setItem('portfolio_text_' + el.dataset.editableKey, el.innerHTML);
      }, 600));
    });

    /* Show toolbar */
    const bar = document.getElementById('adminBar');
    if (bar) bar.classList.add('visible');

    /* In desktop mode, admin adds projects via toolbar button */
  }

  function adminCardClick(e) {
    if (!adminActive) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    const id = this.dataset.projectId;
    if (id && window.PortfolioData) {
      openProjectModal(window.PortfolioData.getProject(id));
    }
  }

  function logout() {
    adminActive = false;
    sessionStorage.removeItem(SESSION_KEY);
    document.body.classList.remove('admin-mode');

    const btn = document.getElementById('adminBtn');
    if (btn) { btn.classList.remove('active'); btn.title = 'Admin Login'; }

    document.querySelectorAll('[data-editable-key]').forEach(el => {
      el.removeAttribute('contenteditable');
    });

    const bar = document.getElementById('adminBar');
    if (bar) bar.classList.remove('visible');

    /* Desktop mode — no card listeners needed */
  }

  /* ── Project Modal ────────────────────────────── */
  function buildProjectModal() {
    const div = document.createElement('div');
    div.id = 'projectModal';
    div.innerHTML = `
      <div class="pm-overlay" id="pmOverlay"></div>
      <div class="pm-box">
        <div class="pm-head">
          <span id="pmHeadTitle">Add Project</span>
          <button class="pm-close" id="pmClose">✕</button>
        </div>
        <div class="pm-body">
          <div class="pm-row">
            <div class="pm-field">
              <label class="pm-label">Title *</label>
              <input class="pm-input" type="text" id="pmFTitle" placeholder="My Project"/>
            </div>
            <div class="pm-field" style="max-width:130px">
              <label class="pm-label">Status</label>
              <select class="pm-input" id="pmFStatus">
                <option value="soon">Soon</option>
                <option value="live">Live</option>
                <option value="wip">WIP</option>
              </select>
            </div>
          </div>
          <div class="pm-field">
            <label class="pm-label">Short Description (shown on card)</label>
            <textarea class="pm-input" id="pmFDesc" rows="2" placeholder="Brief overview..."></textarea>
          </div>
          <div class="pm-row">
            <div class="pm-field">
              <label class="pm-label">Tags (comma-separated)</label>
              <input class="pm-input" type="text" id="pmFTags" placeholder="HTML, CSS, JavaScript"/>
            </div>
            <div class="pm-field" style="max-width:130px; justify-content:center;">
              <label class="pm-label">Featured?</label>
              <div class="pm-check-wrap">
                <input type="checkbox" id="pmFFeatured" class="pm-check"/>
                <label for="pmFFeatured">Yes</label>
              </div>
            </div>
          </div>
          <div class="pm-field">
            <label class="pm-label">The Story / Journal</label>
            <textarea class="pm-input" id="pmFJournal" rows="5" placeholder="How this project came to be, what problems you solved..."></textarea>
          </div>
          <div class="pm-field">
            <label class="pm-label">What I Did</label>
            <textarea class="pm-input" id="pmFWhat" rows="3" placeholder="Your specific role and contributions..."></textarea>
          </div>
          <div class="pm-row">
            <div class="pm-field">
              <label class="pm-label">Tech Stack (comma-separated)</label>
              <input class="pm-input" type="text" id="pmFTech" placeholder="React, Node.js, MongoDB"/>
            </div>
          </div>
          <div class="pm-row">
            <div class="pm-field">
              <label class="pm-label">Link URL</label>
              <input class="pm-input" type="url" id="pmFLink" placeholder="https://..."/>
            </div>
            <div class="pm-field" style="max-width:170px">
              <label class="pm-label">Button Type</label>
              <select class="pm-input" id="pmFLinkType">
                <option value="visit">Visit Project</option>
                <option value="download">Download Files</option>
              </select>
            </div>
          </div>
          <p class="pm-error" id="pmError"></p>
          <div class="pm-actions">
            <button class="pm-delete-btn" id="pmDelete">Delete Project</button>
            <button class="pm-save-btn" id="pmSave">Save Project</button>
          </div>
        </div>
      </div>`;
    document.body.appendChild(div);

    document.getElementById('pmClose').addEventListener('click', closeProjectModal);
    document.getElementById('pmOverlay').addEventListener('click', closeProjectModal);
    document.getElementById('pmSave').addEventListener('click', saveProject);
    document.getElementById('pmDelete').addEventListener('click', deleteProject);
  }

  let editingId = null;

  function openProjectModal(project) {
    editingId = project ? project.id : null;
    document.getElementById('pmHeadTitle').textContent = project ? 'Edit Project' : 'Add Project';
    document.getElementById('pmFTitle').value       = project?.title    || '';
    document.getElementById('pmFStatus').value      = project?.status   || 'soon';
    document.getElementById('pmFDesc').value        = project?.desc     || '';
    document.getElementById('pmFTags').value        = (project?.tags || []).join(', ');
    document.getElementById('pmFFeatured').checked  = !!project?.featured;
    document.getElementById('pmFJournal').value     = project?.journal  || '';
    document.getElementById('pmFWhat').value        = project?.whatIDid || '';
    document.getElementById('pmFTech').value        = (project?.tech || []).join(', ');
    document.getElementById('pmFLink').value        = project?.link     || '';
    document.getElementById('pmFLinkType').value    = project?.linkType || 'visit';
    document.getElementById('pmDelete').style.display = project ? 'block' : 'none';
    document.getElementById('pmError').textContent  = '';
    document.getElementById('projectModal').classList.add('open');
  }

  function closeProjectModal() {
    document.getElementById('projectModal').classList.remove('open');
    editingId = null;
  }

  function saveProject() {
    if (!window.PortfolioData) return;
    const title = document.getElementById('pmFTitle').value.trim();
    if (!title) { document.getElementById('pmError').textContent = 'Title is required.'; return; }

    const data = {
      title,
      status:   document.getElementById('pmFStatus').value,
      desc:     document.getElementById('pmFDesc').value.trim(),
      tags:     document.getElementById('pmFTags').value.split(',').map(s => s.trim()).filter(Boolean),
      featured: document.getElementById('pmFFeatured').checked,
      journal:  document.getElementById('pmFJournal').value.trim(),
      whatIDid: document.getElementById('pmFWhat').value.trim(),
      tech:     document.getElementById('pmFTech').value.split(',').map(s => s.trim()).filter(Boolean),
      link:     document.getElementById('pmFLink').value.trim(),
      linkType: document.getElementById('pmFLinkType').value,
    };

    const projects = window.PortfolioData.getProjects();
    if (editingId) {
      const i = projects.findIndex(p => p.id === editingId);
      if (i !== -1) projects[i] = { ...projects[i], ...data };
    } else {
      const nums = projects.map(p => parseInt(p.id, 10)).filter(n => !isNaN(n));
      const next = (Math.max(0, ...nums) + 1).toString().padStart(3, '0');
      projects.push({ id: next, num: next, ...data });
    }

    window.PortfolioData.saveProjects(projects);
    closeProjectModal();
    refreshGrid();
  }

  function deleteProject() {
    if (!editingId || !window.PortfolioData) return;
    if (!confirm('Delete this project? This cannot be undone.')) return;
    const projects = window.PortfolioData.getProjects().filter(p => p.id !== editingId);
    window.PortfolioData.saveProjects(projects);
    closeProjectModal();
    refreshGrid();
  }

  /* ── Refresh file explorer after CRUD ─────────── */
  function refreshGrid() {
    if (typeof window.refreshDesktopFiles === 'function') {
      window.refreshDesktopFiles();
    }
  }

  /* ── Init ─────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', () => {
    applyStoredText();
    buildLoginModal();
    buildToolbar();
    buildProjectModal();

    const btn = document.getElementById('adminBtn');
    if (btn) btn.addEventListener('click', openLogin);

    if (sessionStorage.getItem(SESSION_KEY) === '1') activateAdmin();
  });
})();
