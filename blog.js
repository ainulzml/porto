// Updated blog.js to show counts (uses countapi.js)
const postsGrid = document.getElementById('postsGrid');
const searchInput = document.getElementById('searchPosts');
const tagsContainer = document.getElementById('postTags');

let posts = [];
let activeTag = null;

function el(tag, props={}, ...children){
  const e = document.createElement(tag);
  Object.entries(props).forEach(([k,v])=>{
    if(k.startsWith('on') && typeof v === 'function'){ e.addEventListener(k.slice(2), v); }
    else if(k === 'class') e.className = v;
    else if(v !== null && v !== undefined) e.setAttribute(k,v);
  });
  children.flat().forEach(c => { e.append(typeof c === 'string' ? document.createTextNode(c) : c); });
  return e;
}

async function loadPosts(){
  try{
    const res = await fetch('posts.json');
    posts = await res.json();
    renderTags();
    renderPosts();
  }catch(err){
    postsGrid.innerHTML = '<p>Tidak dapat memuat tulisan.</p>';
    console.error(err);
  }
}

function uniqueTags(){
  const set = new Set();
  posts.forEach(p => (p.tags || []).forEach(t => set.add(t)));
  return Array.from(set).sort();
}

function renderTags(){
  tagsContainer.innerHTML = '';
  const tags = uniqueTags();
  const allBtn = el('button',{class:'tag' + (activeTag===null?' active':''), onClick:()=>{ activeTag=null; renderPosts(); renderTags(); }}, 'Semua');
  tagsContainer.appendChild(allBtn);
  tags.forEach(t => {
    const btn = el('button',{
      class: 'tag' + (activeTag===t ? ' active' : ''),
      onClick: () => { activeTag = activeTag===t ? null : t; renderPosts(); renderTags(); }
    }, t);
    tagsContainer.appendChild(btn);
  });
}

function matches(post, q){
  if(!q) return true;
  q = q.toLowerCase();
  return (post.title && post.title.toLowerCase().includes(q))
      || (post.summary && post.summary.toLowerCase().includes(q))
      || ((post.tags || []).some(t=>t.toLowerCase().includes(q)));
}

async function renderPosts(){
  const q = (searchInput && searchInput.value.trim().toLowerCase()) || '';
  const filtered = posts.filter(p => matches(p,q) && (activeTag ? (p.tags||[]).includes(activeTag) : true));
  if(filtered.length === 0){
    postsGrid.innerHTML = '<p>Tidak ada tulisan yang cocok.</p>';
    return;
  }
  postsGrid.innerHTML = '';
  for(const p of filtered){
    const card = el('article',{class:'bg-white dark:bg-slate-800 rounded-xl p-4 shadow'});
    const title = el('h4',{class:'text-lg font-semibold'}, p.title);
    const desc = el('p',{class:'text-sm text-slate-600 dark:text-slate-300 mt-2'}, p.summary || '');
    const meta = el('div',{class:'mt-3 flex items-center justify-between text-sm text-slate-500 dark:text-slate-400'});
    const left = el('div',{}, p.date || '');
    const right = el('div',{class:'flex items-center gap-3'}, el('a',{href:`post.html?slug=${encodeURIComponent(p.slug)}`, class:'text-sky-600'}, 'Baca →'));
    meta.append(left, right);
    const tags = el('div',{class:'flex gap-2 mt-3'}, ...(p.tags||[]).map(t=> el('span',{class:'text-xs px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200'}, t) ));
    card.append(title, desc, tags, meta);
    postsGrid.appendChild(card);

    // attach view count element
    const viewEl = el('span',{class:'text-sm text-slate-500 dark:text-slate-400'});
    right.appendChild(viewEl);
    // fetch count asynchronously
    if (typeof maybeHitAndShow === 'function') {
      // don't increment on list views; just fetch current count
      fetchCount(p.slug).then(c => { if(c !== null) viewEl.textContent = `👁️ ${c}`; });
    }
  }
}

if (searchInput) searchInput.addEventListener('input', ()=> renderPosts());

loadPosts();