// Updated post.js to integrate CountAPI (hit on first visit per 24h)
const postBody = document.getElementById('postBody');
const postMeta = document.getElementById('postMeta');

function getSlug(){
  const params = new URLSearchParams(location.search);
  return params.get('slug');
}

async function loadPost(){
  const slug = getSlug();
  if(!slug){
    document.getElementById('post').innerHTML = '<p>Tidak ada artikel yang dipilih.</p>';
    return;
  }
  try{
    const res = await fetch('posts.json');
    const posts = await res.json();
    const post = posts.find(p=>p.slug === slug);
    if(!post){
      document.getElementById('post').innerHTML = '<p>Artikel tidak ditemukan.</p>';
      return;
    }
    document.title = `${post.title} — [Nama Anda]`;
    const metaDesc = document.getElementById('meta-desc');
    metaDesc && post.summary && metaDesc.setAttribute('content', post.summary);

    postMeta.textContent = `${post.date || ''} · ${(post.tags || []).join(', ')}`;

    const mdPath = post.file || `posts/${slug}.md`;
    const mdRes = await fetch(mdPath);
    if(!mdRes.ok){
      postBody.innerHTML = '<p>Gagal memuat isi artikel.</p>';
      return;
    }
    const md = await mdRes.text();
    postBody.innerHTML = marked.parse(md);
    if(window.hljs) document.querySelectorAll('pre code').forEach((b)=>hljs.highlightElement(b));

    // show & increment view count (uses countapi.js helpers)
    const viewsEl = document.createElement('span');
    viewsEl.className = 'ml-2 text-sm text-slate-500 dark:text-slate-400';
    postMeta.appendChild(viewsEl);
    if (typeof maybeHitAndShow === 'function') {
      maybeHitAndShow(slug, viewsEl);
    } else if (typeof fetchCount === 'function') {
      const c = await fetchCount(slug);
      if (c !== null) viewsEl.textContent = `👁️ ${c}`;
    }
  }catch(err){
    console.error(err);
    document.getElementById('post').innerHTML = '<p>Terjadi kesalahan saat memuat artikel.</p>';
  }
}

loadPost();