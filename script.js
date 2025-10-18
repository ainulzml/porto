const projectsGrid = document.getElementById('projectsGrid');
const searchInput = document.getElementById('search');
const tagsContainer = document.getElementById('tags');

let projects = [];
let activeTag = null;

// Utility render
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

async function loadProjects(){
  try{
    const res = await fetch('projects.json');
    projects = await res.json();
    renderTags();
    renderProjects();
  }catch(err){
    projectsGrid.innerHTML = '<p>Tidak dapat memuat proyek.</p>';
    console.error(err);
  }
}

function uniqueTags(){
  const set = new Set();
  projects.forEach(p => (p.tags || []).forEach(t => set.add(t)));
  return Array.from(set).sort();
}

function renderTags(){
  tagsContainer.innerHTML = '';
  const tags = uniqueTags();
  const allBtn = el('button',{class:'tag' + (activeTag===null?' active':''), onClick:()=>{ activeTag=null; renderProjects(); renderTags(); }}, 'Semua');
  tagsContainer.appendChild(allBtn);
  tags.forEach(t => {
    const btn = el('button',{
      class: 'tag' + (activeTag===t ? ' active' : ''),
      onClick: () => { activeTag = activeTag===t ? null : t; renderProjects(); renderTags(); }
    }, t);
    tagsContainer.appendChild(btn);
  });
}

function matches(project, q){
  if(!q) return true;
  q = q.toLowerCase();
  return (project.title && project.title.toLowerCase().includes(q))
      || (project.description && project.description.toLowerCase().includes(q))
      || ((project.tags || []).some(t=>t.toLowerCase().includes(q)));
}

function renderProjects(){
  const q = searchInput.value.trim().toLowerCase();
  const filtered = projects.filter(p => matches(p,q) && (activeTag ? (p.tags||[]).includes(activeTag) : true));
  if(filtered.length === 0){
    projectsGrid.innerHTML = '<p>Tidak ada proyek yang cocok.</p>';
    return;
  }
  projectsGrid.innerHTML = '';
  filtered.forEach(p=>{
    const card = el('article',{class:'card'});
    const img = el('img',{src:p.image || 'assets/placeholder.png', alt:p.title, loading:'lazy'});
    const title = el('h4',{}, p.title);
    const desc = el('p',{}, p.description || '');
    const tags = el('div',{}, ...(p.tags||[]).map(t => {
      const tEl = el('span',{class:'tag', title:`Filter: ${t}`, onClick: (ev)=>{ ev.stopPropagation(); activeTag = t; renderProjects(); renderTags(); }}, t);
      return tEl;
    }));
    const links = el('div',{class:'links'},
      p.live_url ? el('a',{href:p.live_url,target:'_blank',rel:'noopener'}, 'Demo') : null,
      p.repo_url ? el('a',{href:p.repo_url,target:'_blank',rel:'noopener'}, 'Repo') : null
    );
    const meta = el('div',{class:'meta'}, tags, links);
    card.append(img, title, desc, meta);
    projectsGrid.appendChild(card);
  });
}

searchInput && searchInput.addEventListener('input', ()=> renderProjects());

// Initial load
loadProjects();