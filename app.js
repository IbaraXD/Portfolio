const cfg=window.PORTFOLIO_CONFIG||{};
const hasSupabase=Boolean(cfg.supabaseUrl&&cfg.supabaseAnonKey&&window.supabase);
const db=hasSupabase?window.supabase.createClient(cfg.supabaseUrl,cfg.supabaseAnonKey):null;
const grid=document.getElementById('projectGrid');
const archiveGrid=document.getElementById('archiveGrid');
const filters=document.getElementById('filters');
const dataNote=document.getElementById('dataNote');
const viewer=document.getElementById('viewer');
const viewerMedia=document.getElementById('viewerMedia');
const viewerTitle=document.getElementById('viewerTitle');
const viewerCopy=document.getElementById('viewerCopy');
const viewerMeta=document.getElementById('viewerMeta');
const viewerType=document.getElementById('viewerType');
let projects=[];

const cats=[['all','ALL'],['campaign','CAMPAIGNS'],['template','TEMPLATES'],['motion','VIDEO / MOTION'],['branding','BRANDING'],['web','WEB / UI']];

function esc(v=''){return String(v).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
function driveId(url=''){
  const s=String(url).trim();
  const patterns=[/\/file\/d\/([a-zA-Z0-9_-]+)/,/\/d\/([a-zA-Z0-9_-]+)/,/[?&]id=([a-zA-Z0-9_-]+)/];
  for(const p of patterns){const m=s.match(p);if(m)return m[1]}
  return '';
}
function imageUrl(url,fileId){const id=fileId||driveId(url);return id?`https://drive.google.com/thumbnail?id=${encodeURIComponent(id)}&sz=w2000`:url}
function videoEmbed(url,fileId){const id=fileId||driveId(url);return id?`https://drive.google.com/file/d/${encodeURIComponent(id)}/preview`:url}
function isDirectVideo(url=''){return /\.(mp4|webm|ogg)(\?|#|$)/i.test(url)}

function coverMarkup(p){
  const cover=imageUrl(p.cover_url,p.cover_file_id);
  if(cover)return `<img src="${esc(cover)}" alt="${esc(p.title)}" loading="lazy" decoding="async">`;
  const tag=(p.tags&&p.tags[0])||p.category||'WORK';
  return `<div class="placeholder ph-${esc(p.category||'campaign')}"><span>${esc(tag)}</span><b>${esc(p.title)}</b></div>`;
}
function renderFilters(){filters.innerHTML='';cats.forEach(([v,l],i)=>{const b=document.createElement('button');b.type='button';b.dataset.filter=v;b.textContent=l;if(i===0)b.classList.add('active');filters.appendChild(b)})}
function renderProjects(filter='all'){
  grid.innerHTML='';
  const list=projects.filter(p=>p.featured!==false&&(filter==='all'||p.category===filter));
  if(!list.length){grid.innerHTML='<div class="empty-state">NO PROJECTS IN THIS CATEGORY YET.</div>';return}
  const frag=document.createDocumentFragment();
  list.forEach((p,i)=>{const b=document.createElement('button');b.type='button';b.className=`project size-${p.size||'normal'}`;b.innerHTML=`<div class="project-visual">${coverMarkup(p)}</div><div class="project-meta"><div><strong>${esc(p.title).toUpperCase()}</strong><small>${esc((p.tags||[]).join(' · '))}</small></div><em>${String(i+1).padStart(2,'0')}</em></div>`;b.addEventListener('click',()=>openViewer(p));frag.appendChild(b)});grid.appendChild(frag)
}
function renderArchive(){
  archiveGrid.innerHTML='';
  const all=[];
  projects.forEach(p=>(p.portfolio_media||[]).forEach(m=>all.push({project:p,...m})));
  if(!all.length){archiveGrid.innerHTML='<div class="empty-state">YOUR EXTRA GRAPHICS AND VIDEOS WILL APPEAR HERE.</div>';return}
  const frag=document.createDocumentFragment();
  all.slice(0,30).forEach(m=>{const b=document.createElement('button');b.type='button';b.className='archive-card';if(m.media_type==='video')b.classList.add('video');const poster=m.media_type==='video'&&m.poster_url?imageUrl(m.poster_url,m.poster_file_id):'';const visual=m.media_type==='image'?`<img src="${esc(imageUrl(m.source_url,m.drive_file_id))}" loading="lazy" decoding="async" alt="${esc(m.caption||m.project.title)}">`:poster?`<img src="${esc(poster)}" loading="lazy" decoding="async" alt="${esc(m.caption||m.project.title)}"><span class="play">▶</span>`:`<div class="archive-video-placeholder"><span>▶</span></div>`;b.innerHTML=`${visual}<div><strong>${esc(m.project.title)}</strong><small>${esc(m.caption||m.media_type.toUpperCase())}</small></div>`;b.addEventListener('click',()=>openViewer(m.project,m.id));frag.appendChild(b)});archiveGrid.appendChild(frag)
}
function mediaElement(m){
  if(m.media_type==='video'){
    const src=videoEmbed(m.source_url,m.drive_file_id);
    if((m.drive_file_id||driveId(m.source_url))&&!isDirectVideo(m.source_url)){const f=document.createElement('iframe');f.src=src;f.allow='autoplay; encrypted-media';f.allowFullscreen=true;f.loading='lazy';f.title=m.caption||'Project video';return f}
    const v=document.createElement('video');v.src=src;v.controls=true;v.playsInline=true;v.preload='metadata';if(m.poster_url)v.poster=imageUrl(m.poster_url,m.poster_file_id);return v
  }
  const img=document.createElement('img');img.src=imageUrl(m.source_url,m.drive_file_id);img.alt=m.caption||'Portfolio work';img.loading='lazy';img.decoding='async';return img
}
function openViewer(p,focusMediaId=''){
  viewerTitle.textContent=p.title||'';viewerCopy.textContent=p.description||'';viewerType.textContent=((p.tags||[]).join(' / ')||p.category||'SELECTED WORK').toUpperCase();viewerMeta.innerHTML=[p.client&&`CLIENT / ${esc(p.client)}`,p.year&&`YEAR / ${esc(p.year)}`].filter(Boolean).join('<br>');viewerMedia.innerHTML='';
  let items=[...(p.portfolio_media||[])].sort((a,b)=>(a.display_order||0)-(b.display_order||0));if(focusMediaId)items.sort((a,b)=>(a.id===focusMediaId?-1:b.id===focusMediaId?1:0));
  if(items.length){items.forEach(m=>{const wrap=document.createElement('figure');wrap.appendChild(mediaElement(m));if(m.caption){const c=document.createElement('figcaption');c.textContent=m.caption;wrap.appendChild(c)}viewerMedia.appendChild(wrap)})}else viewerMedia.innerHTML='<div class="viewer-empty"><span>PROJECT MEDIA</span><b>ADD GRAPHICS OR VIDEOS FROM THE ADMIN</b></div>';
  viewer.classList.add('open');viewer.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';
}
function closeViewer(){viewer.querySelectorAll('video').forEach(v=>v.pause());viewer.classList.remove('open');viewer.setAttribute('aria-hidden','true');document.body.style.overflow=''}
viewer.querySelector('.viewer-close').addEventListener('click',closeViewer);viewer.addEventListener('click',e=>{if(e.target===viewer)closeViewer()});document.addEventListener('keydown',e=>{if(e.key==='Escape')closeViewer()});
filters.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;[...filters.children].forEach(x=>x.classList.remove('active'));b.classList.add('active');renderProjects(b.dataset.filter)});

async function load(){
  renderFilters();
  if(!hasSupabase){projects=(window.PORTFOLIO_DEMO_DATA?.projects||[]);dataNote.hidden=false;dataNote.textContent='DEMO MODE — connect Supabase in config.js to load projects from your admin dashboard.';renderProjects();renderArchive();return}
  const {data,error}=await db.from('portfolio_projects').select('*, portfolio_media(*)').eq('published',true).order('display_order',{ascending:true});
  if(error){console.error(error);projects=(window.PORTFOLIO_DEMO_DATA?.projects||[]);dataNote.hidden=false;dataNote.textContent='Could not load Supabase. Showing demo content.'}else projects=data||[];
  renderProjects();renderArchive();
}
load();
