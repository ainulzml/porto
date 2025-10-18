// theme.js - simple light/dark toggle with persistence and shortcut (t)
(() => {
  const THEME_KEY = 'site_theme_v1';
  const AVAILABLE = ['light','dark'];
  const toggleButtons = document.querySelectorAll('#themeToggle');

  function getStored(){
    try{ return localStorage.getItem(THEME_KEY); }catch(e){ return null; }
  }
  function store(t){
    try{ localStorage.setItem(THEME_KEY, t); }catch(e){}
  }
  function prefersDark(){
    try{ return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches; }catch(e){ return false; }
  }

  function applyTheme(t){
    const theme = AVAILABLE.includes(t) ? t : 'light';
    document.documentElement.setAttribute('data-theme', theme);
    toggleButtons.forEach(btn => {
      if(!btn) return;
      btn.textContent = theme === 'light' ? '☀️' : '🌙';
      btn.setAttribute('data-theme', theme);
      btn.setAttribute('aria-pressed', String(theme === 'dark'));
    });
  }

  function nextTheme(current){
    return current === 'dark' ? 'light' : 'dark';
  }

  function init(){
    let theme = getStored();
    if(!theme){
      theme = prefersDark() ? 'dark' : 'light';
    }
    applyTheme(theme);

    toggleButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const cur = document.documentElement.getAttribute('data-theme') || 'light';
        const next = nextTheme(cur);
        applyTheme(next);
        store(next);
      });
    });

    // keyboard shortcut: press "t" to toggle theme
    window.addEventListener('keydown', (e) => {
      const tag = (e.target && e.target.tagName) || '';
      if(tag === 'INPUT' || tag === 'TEXTAREA' || e.metaKey || e.ctrlKey) return;
      if(e.key && e.key.toLowerCase() === 't'){
        const cur = document.documentElement.getAttribute('data-theme') || 'light';
        const next = nextTheme(cur);
        applyTheme(next);
        store(next);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();