/* ═══════════════════════════════════════════════
   Portfolio Data — data.js
   Central store for project data.
   Admin edits are persisted in localStorage.
   ═══════════════════════════════════════════════ */

const DEFAULT_PROJECTS = [
  {
    id: '001', num: '001',
    title: 'Project One',
    status: 'soon',
    desc: 'Details coming shortly — check back soon.',
    tags: [], featured: false,
    journal: '', whatIDid: '', tech: [],
    link: '', linkType: 'visit',
  },
  {
    id: '002', num: '002',
    title: 'Project Two',
    status: 'soon',
    desc: 'Details coming shortly — check back soon.',
    tags: [], featured: false,
    journal: '', whatIDid: '', tech: [],
    link: '', linkType: 'visit',
  },
  {
    id: '003', num: '003',
    title: 'Project Three',
    status: 'soon',
    desc: 'Details coming shortly — check back soon.',
    tags: [], featured: true,
    journal: '', whatIDid: '', tech: [],
    link: '', linkType: 'visit',
  },
];

window.PortfolioData = {
  getProjects() {
    try {
      const s = localStorage.getItem('portfolio_projects');
      if (s) return JSON.parse(s);
    } catch (e) { /* ignore */ }
    return JSON.parse(JSON.stringify(DEFAULT_PROJECTS));
  },
  saveProjects(projects) {
    localStorage.setItem('portfolio_projects', JSON.stringify(projects));
  },
  getProject(id) {
    return this.getProjects().find(p => p.id === id) || null;
  },
};
