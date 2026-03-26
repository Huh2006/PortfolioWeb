/* ═══════════════════════════════════════════════
   Portfolio Data — data.js
   Central store for project + experience data.
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

const DEFAULT_EXPERIENCE = [
  { id: 'e1', type: 'work', date: '2025 — Present', title: 'Bachelor of IT', place: 'RMIT University', location: 'Melbourne', desc: 'Currently studying Information Technology, building skills in software development, networking, and system design.', current: true, order: 0 },
  { id: 'e2', type: 'work', date: 'Sept 2025 — Feb 2026', title: 'IT Intern', place: 'Andatech', location: 'Vermont South', desc: 'Maintained and optimised company websites through on-page SEO, content updates and technical fixes. Monitored website performance and analytics. Updated pages on Shopify and WordPress.', current: false, order: 1 },
  { id: 'e3', type: 'work', date: 'Jun 2025 — Aug 2026', title: 'CRM Assistant', place: 'Andatech', location: 'Vermont South', desc: 'Maintained CRM database accuracy by cleaning, deduplicating and segmenting customer records. Assisted in CRM migration, supported automation for lead follow-up.', current: false, order: 2 },
  { id: 'e4', type: 'work', date: 'Nov 2023 — Jun 2025', title: 'Sales Assistant', place: 'Andatech', location: 'Vermont South', desc: 'Processed POS transactions, managed stock room, provided in-store customer service, assisted with online order packing.', current: false, order: 3 },
  { id: 'e5', type: 'work', date: 'Sept 2024 — Feb 2025', title: 'Front of House', place: 'Nana Green Tea', location: 'Melbourne', desc: 'Delivered friendly, efficient customer service. Operated POS system, prepared beverages and menu items to company standards.', current: false, order: 4 },
  { id: 'e6', type: 'work', date: 'Mar 2023 — Apr 2024', title: 'Kitchen Hand', place: 'Local Her Singapore', location: 'Knox', desc: 'Prepared and plated menu items, coordinated with front-of-house during peak periods, managed stock rotation and coached new staff.', current: false, order: 5 },
  { id: 'e7', type: 'education', date: 'Feb 2025 — Feb 2028', title: 'Information Technology', place: 'RMIT', location: 'Melbourne', desc: 'Bachelor of IT', current: true, order: 6 },
  { id: 'e8', type: 'education', date: '2011 — 2024', title: 'Primary & High School', place: 'St Andrews Christian College', location: 'Knox', desc: 'Graduated primary and high school.', current: false, order: 7 },
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

  getExperience() {
    try {
      const s = localStorage.getItem('portfolio_experience');
      if (s) return JSON.parse(s);
    } catch (e) { /* ignore */ }
    return JSON.parse(JSON.stringify(DEFAULT_EXPERIENCE));
  },
  saveExperience(entries) {
    localStorage.setItem('portfolio_experience', JSON.stringify(entries));
  },
  getExperienceItem(id) {
    return this.getExperience().find(e => e.id === id) || null;
  },
};
