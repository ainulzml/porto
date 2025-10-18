// Simple light/dark toggle that toggles 'dark' class on <html>
// Stores preference in localStorage under 'site_theme_v1'.
// Exposes button id="themeToggle" to toggle (multiple buttons allowed).
(() => {
  const KEY = 'site_theme_v1';
  const buttons = () => Array.from(document.querySelectorAll('#themeToggle'));
  function apply(theme) {
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    buttons().forEach(b => { b.textContent = theme === 'dark' ? '🌙' : '☀️'; });
  }
  function getStored() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }
  function store(t) {
    try { localStorage.setItem(KEY, t); } catch (e) {}
  }
  function prefersDark() {
    try { return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches; } catch (e) { return false; }
  }

  function init() {
    let t = getStored();
    if (!t) t = prefersDark() ? 'dark' : 'light';
    apply(t);
    buttons().forEach(btn => btn.addEventListener('click', () => {
      const cur = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
      const next = cur === 'dark' ? 'light' : 'dark';
      apply(next); store(next);
    }));
    window.addEventListener('keydown', (e) => {
      const tag = (e.target && e.target.tagName) || '';
      if (tag === 'INPUT' || tag === 'TEXTAREA' || e.metaKey || e.ctrlKey) return;
      if (e.key && e.key.toLowerCase() === 't') {
        const cur = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
        const next = cur === 'dark' ? 'light' : 'dark';
        apply(next); store(next);
      }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();