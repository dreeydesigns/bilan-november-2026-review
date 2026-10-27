
(()=>{
'use strict';
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
const months=[{id:'2026-10',name:'October 2026',sub:'Historical archive · Size 3 & 4',description:'October launch archive with the content and artwork recorded in the corrected October calendar. 1–28 October are shown as reported posted.',type:'archive'},{id:'2026-11',name:'November 2026',sub:'Creative review · Size 4',description:'November creative campaign: original versus revised posters, carousel slides and Reel storyboards, with captions and client correction notes.',type:'review'}];
const localKey='bilan-review-notes-v2';let saved={};try{saved=JSON.parse(localStorage.getItem(localKey)||'{}')}catch(e){saved={}}
const october=(window.BILAN_OCTOBER||[]).map(p=>({...p,month:'2026-10',slides:p.image?[{original:p.image,revised:p.image}]:[],scenes:[],hasVideo:false}));
const november=(window.BILAN_POSTS||[]).map(p=>({...p,month:'2026-11',status:'review',sourceUrl:'',slides:p.slides||[],scenes:p.scenes||[]}));
const all=[...october,...november];
let month='2026-11',mode='gallery',current=null;
const params=new URLSearchParams(location.search);if(params.get('month')==='2026-10')month='2026-10';
const monthPosts=()=>all.filter(p=>p.month===month).sort((a,b)=>a.date.localeCompare(b.date)||a.id.localeCompare(b.id));
const effectiveStatus=p=>saved[p.id]?.status||p.status||'review';
const labels={'reported-posted':'Reported posted','not-confirmed':'Not confirmed','review':'Needs review','approved':'Approved locally'};
const title=p=>p.title||p.concept||'Untitled content';
const kind=p=>(p.format||'static').toLowerCase();
const poster=p=>p.slides?.[0]?.revised||p.slides?.[0]?.original||p.image||'';
const caption=p=>p.caption||'';
const prettyDate=d=>new Date(d+'T12:00:00').toLocaleDateString('en-KE',{weekday:'short',day:'numeric',month:'short'});
const prettyLong=d=>new Date(d+'T12:00:00').toLocaleDateString('en-KE',{day:'numeric',month:'long',year:'numeric'});
const shortConcept=p=>String(p.concept||p.title||'').slice(0,148);
const safeUrl=x=>/^https:\/\/drive\.google\.com\//.test(x||'')?x:'';
const statusPill=p=>`<span class="status ${esc(effectiveStatus(p))}">${esc(labels[effectiveStatus(p)]||effectiveStatus(p))}</span>`;
function setMonth(id){if(!months.some(x=>x.id===id))return;month=id;document.title='BILAN · '+months.find(x=>x.id===id).name+' · Client Portal';try{history.replaceState({},'',location.pathname+'?month='+month)}catch(e){}$('search').value='';$('format').value='all';$('status').value='all';draw();}
function saveReview(){try{localStorage.setItem(localKey,JSON.stringify(saved))}catch(e){console.warn('Local save unavailable',e)}}
function draw(){const meta=months.find(m=>m.id===month);$('pageTitle').textContent=meta.name+' Content';$('pageDesc').textContent=meta.description;
$('months').innerHTML=months.map(m=>`<button class="month ${m.id===month?'active':''}" type="button" data-month="${m.id}"><strong>${m.name}</strong><small>${m.sub}</small></button>`).join('');
$('months').querySelectorAll('[data-month]').forEach(b=>b.addEventListener('click',()=>setMonth(b.dataset.month)));
$('disclaimer').innerHTML=month==='2026-10'?'<b>October archive</b> · Dates 1–28 are marked “Reported posted” based on your update. The supplied calendar is evidence of the content plan and its Drive image links, not independent verification of published social posts.': '<b>November review</b> · 44 planned posts. None are marked live or published here. Original/revised images, captions and Reel storyboard frames are available for approval.';
const entries=monthPosts();const c={static:0,carousel:0,reel:0};entries.forEach(p=>{const k=kind(p);c[k]=(c[k]||0)+1});
const first=month==='2026-10'?entries.filter(p=>effectiveStatus(p)==='reported-posted').length:entries.filter(p=>effectiveStatus(p)==='approved').length;
$('stats').innerHTML=`<div class="stat"><strong>${entries.length}</strong><span>Calendar entries</span></div><div class="stat"><strong>${first}</strong><span>${month==='2026-10'?'Reported posted':'Approved on this device'}</span></div><div class="stat"><strong>${c.static||0} / ${c.carousel||0} / ${c.reel||0}</strong><span>Static / Carousel / Reel</span></div><div class="stat"><strong>${month==='2026-10'?'28 days':'30 days'}</strong><span>${month==='2026-10'?'Posting history reported':'November content period'}</span></div>`;
const q=$('search').value.toLowerCase().trim(),f=$('format').value,st=$('status').value;
const matches=entries.filter(p=>(f==='all'||kind(p)===f)&&(st==='all'||effectiveStatus(p)===st)&&(!q||[p.date,p.id,p.title,p.concept,p.caption,p.product,p.phase].join(' ').toLowerCase().includes(q)));
$('results').textContent=`Showing ${matches.length} of ${entries.length} posts · ${meta.name}${month==='2026-11'&&entries.length!==44?' · Warning: November records have not all loaded':''}`;
if(!matches.length){$('content').innerHTML=`<div class="empty"><b>No matching posts.</b><p>${entries.length===0?'Campaign data could not load. Please refresh.':'Try changing your search or filters.'}</p></div>`;return;}
if(mode==='gallery'){$('content').className='grid';$('content').innerHTML=matches.map(p=>`<article class="card"><div class="thumb">${poster(p)?`<img loading="lazy" src="${poster(p)}" alt="Creative for ${esc(p.id)}">`:'<div class="noimage">Artwork preview not available</div>'}</div><div class="body"><span class="eyebrow">${prettyDate(p.date)} · ${kind(p)} · ${esc(p.product||'BILAN')}</span><h3>${esc(title(p))}</h3>${statusPill(p)}<p>${esc(shortConcept(p))}</p><button type="button" data-open="${esc(p.id)}">${month==='2026-10'?'View archive':'Review creative'} →</button></div></article>`).join('');}
else{$('content').className='timeline';let groups={};matches.forEach(p=>{(groups[p.date]??=[]).push(p)});$('content').innerHTML=Object.entries(groups).map(([date,ps])=>`<section class="daygroup"><div class="dayhead"><h3>${prettyLong(date)}</h3><span class="note">${ps.length} ${ps.length===1?'post':'posts'}</span></div>${ps.map(p=>`<div class="dayrow"><div>${poster(p)?`<img loading="lazy" src="${poster(p)}" alt="">`:''}</div><div><h4>${esc(title(p))}</h4><p>${kind(p).toUpperCase()} · ${esc(p.product||'BILAN')} · ${esc(p.id)}</p>${statusPill(p)}</div><button type="button" data-open="${esc(p.id)}">View details →</button></div>`).join('')}</section>`).join('');}
$('content').querySelectorAll('[data-open]').forEach(b=>b.addEventListener('click',()=>openPost(b.dataset.open)));
}
function openPost(id){const p=all.find(p=>p.id===id);if(!p)return;current=p;$('modalTitle').textContent=prettyLong(p.date)+' · '+p.id;
let markup=`<div class="meta">${statusPill(p)}<span class="eyebrow">${kind(p).toUpperCase()} · ${esc(p.product||'BILAN')} · ${esc(p.phase||'')}</span></div><h2 style="margin:6px 0 10px">${esc(title(p))}</h2><div class="copy"><div class="kicker">Caption / post text</div><p>${esc(caption(p)||'Caption not supplied in source calendar.')}</p>${p.cta?`<p><b>Conversation prompt:</b> ${esc(p.cta)}</p>`:''}${p.story?`<p><b>Story support:</b> ${esc(p.story)}</p>`:''}<button type="button" id="copyCaption" class="action secondary">Copy caption</button></div>`;
if(p.month==='2026-10'){
 markup+=`<div class="sectiontitle">October artwork · archived plan</div>${poster(p)?`<div class="pair"><figure><figcaption>Image embedded in October workbook</figcaption><img src="${poster(p)}" alt="October campaign artwork preview"></figure><div><p>${esc(p.concept||'')}</p><p class="note">The preview is extracted from the supplied calendar and may be lower resolution. Open the original Google Drive source for the full-resolution image.</p>${safeUrl(p.sourceUrl)?`<a class="source" href="${safeUrl(p.sourceUrl)}" target="_blank" rel="noopener noreferrer">Open full-resolution Google Drive image ↗</a>`:'<p>Full-resolution link not supplied.</p>'}<p class="note">${esc(p.postingEvidence||'')}</p></div></div>`:`<p class="note">No October artwork embedded for this date.</p>`}`;
}else{
 p.slides.forEach((s,i)=>{markup+=`<div class="slidesep"><div class="sectiontitle">${kind(p)==='carousel'?'Slide '+(i+1):kind(p)==='reel'?'Reel cover':'Post artwork'} · Original vs revised</div><div class="pair"><figure><figcaption>Original image</figcaption>${s.original?`<img loading="lazy" src="${s.original}" alt="Original image">`:'<p>Not supplied</p>'}</figure><figure><figcaption>Revised image</figcaption>${s.revised?`<img loading="lazy" src="${s.revised}" alt="Revised image">`:'<p>Not supplied</p>'}</figure></div></div>`});
 if((p.scenes||[]).length)markup+=`<div class="sectiontitle">Reel storyboard · ${p.scenes.length} scenes</div><p class="note">Storyboard frames only. This is not a finished edited or published Reel.</p><div class="scenes">${p.scenes.map((s,i)=>`<div class="scene"><small>Scene ${i+1}</small><img loading="lazy" src="${s}" alt="Reel scene ${i+1}"></div>`).join('')}</div>`;
 if(!p.slides.length)markup+='<p class="note">Visual assets missing from this review package.</p>';
}
markup+=`<div class="copy"><div class="kicker">Client correction and approval</div><label class="fieldlabel" for="reviewStatus">Status for this device</label><div class="reviewtools"><select id="reviewStatus"><option value="review">Needs review</option><option value="approved">Approved locally</option><option value="not-confirmed">On hold / unconfirmed</option>${p.month==='2026-10'?'<option value="reported-posted">Reported posted</option>':''}</select><button type="button" class="action" id="saveNote">Save review</button></div><label class="fieldlabel" for="reviewText">Correction notes</label><textarea class="reviewfield" id="reviewText" placeholder="Framing, product accuracy, copy, story, Reel scenes, dates…">${esc(saved[p.id]?.note||'')}</textarea><p id="saveMsg" class="note">Saved only in your current browser. Export notes to share with the team.</p></div>`;
$('modalContent').innerHTML=markup;$('reviewStatus').value=effectiveStatus(p);
$('copyCaption').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(caption(p));$('copyCaption').textContent='Copied'}catch(e){$('copyCaption').textContent='Select caption above to copy'}});
$('saveNote').addEventListener('click',()=>{saved[p.id]={status:$('reviewStatus').value,note:$('reviewText').value,updatedAt:new Date().toISOString()};saveReview();$('saveMsg').textContent='Saved locally. Export notes to share with your team.';draw()});
$('reviewModal').showModal();}
function exportNotes(){const rows=[['Post ID','Date','Month','Format','Selected status','Correction / Approval notes','Last modified']];all.filter(p=>saved[p.id]).forEach(p=>rows.push([p.id,p.date,p.month,kind(p),saved[p.id].status||'',saved[p.id].note||'',saved[p.id].updatedAt||'']));const csv='\ufeff'+rows.map(row=>row.map(v=>'"'+String(v??'').replaceAll('"','""')+'"').join(',')).join('\r\n');const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));a.download='BILAN_Client_Review_Notes_'+new Date().toISOString().slice(0,10)+'.csv';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),1500)}
$('closeModal').onclick=()=>$('reviewModal').close();$('reviewModal').addEventListener('click',e=>{if(e.target===$('reviewModal'))$('reviewModal').close()});$('export').onclick=exportNotes;
['search','format','status'].forEach(id=>$(id).addEventListener(id==='search'?'input':'change',draw));
$('galleryMode').onclick=()=>{mode='gallery';$('galleryMode').classList.add('on');$('timelineMode').classList.remove('on');draw()};
$('timelineMode').onclick=()=>{mode='timeline';$('timelineMode').classList.add('on');$('galleryMode').classList.remove('on');draw()};
window.addEventListener('error',e=>{console.error('BILAN portal runtime error:',e.message)});
// Convenience for future months: add a new month descriptor and push campaign items into window.BILAN_POSTS with the matching month metadata.
draw();
})();