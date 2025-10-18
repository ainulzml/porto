// Simple CountAPI wrapper for static site
// Uses namespace 'zmlab_blog' — change if mau namespace lain
const COUNTAPI_NAMESPACE = 'zmlab_blog'; // ganti sesuai kebutuhan
const COUNT_TTL_MS = 24 * 60 * 60 * 1000; // 24 jam

async function _fetchCount(action, slug) {
  try {
    const url = `https://api.countapi.xyz/${action}/${encodeURIComponent(COUNTAPI_NAMESPACE)}/${encodeURIComponent(slug)}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    return typeof data.value === 'number' ? data.value : null;
  } catch (e) {
    console.warn('CountAPI error', e);
    return null;
  }
}

async function fetchCount(slug) {
  return _fetchCount('get', slug);
}

async function hitCount(slug) {
  return _fetchCount('hit', slug);
}

// local marker to avoid double-hits from same browser within TTL
function setViewMarker(slug) {
  try {
    const v = JSON.parse(localStorage.getItem('__viewed_posts__') || '{}');
    v[slug] = Date.now();
    localStorage.setItem('__viewed_posts__', JSON.stringify(v));
  } catch (e) {}
}
function getViewMarker(slug) {
  try {
    const v = JSON.parse(localStorage.getItem('__viewed_posts__') || '{}');
    return v[slug] || 0;
  } catch (e) { return 0; }
}

// exposed helpers:
// - showViewsInElement(el, count)
// - maybeHitAndShow(slug, el)
function showViewsInElement(el, count) {
  if (!el) return;
  el.textContent = count !== null ? `👁️ ${count} views` : '';
}

async function maybeHitAndShow(slug, el) {
  if (!slug) return showViewsInElement(el, null);
  const last = getViewMarker(slug);
  const now = Date.now();
  if (last && (now - last) < COUNT_TTL_MS) {
    const current = await fetchCount(slug);
    return showViewsInElement(el, current);
  }
  const hit = await hitCount(slug);
  if (hit !== null) {
    setViewMarker(slug);
    return showViewsInElement(el, hit);
  }
  const current = await fetchCount(slug);
  return showViewsInElement(el, current);
}