// Nova Arcade — UI: catalog rendering, search, favorites, overlay, cloaking, launcher.
const $ = s => document.querySelector(s);
const grid=$('#grid'), chipsEl=$('#chips'), overlay=$('#overlay'), stage=$('#stage'), modal=$('#modal');
let activeCat='All', query='', active=null;

// favorites (localStorage)
const favs = new Set(JSON.parse(localStorage.getItem('nova-favs')||'[]'));
const scores = JSON.parse(localStorage.getItem('nova-scores')||'{}');

// categories
const cats = ['All',...new Set(GAMES.map(g=>g.cat)),'★ Favorites'];
cats.forEach(c=>{ const b=document.createElement('button'); b.className='chip'+(c=='All'?' active':''); b.textContent=c;
  b.onclick=()=>{ activeCat=c; [...chipsEl.children].forEach(x=>x.classList.toggle('active',x==b)); render(); }; chipsEl.appendChild(b); });

$('#search').addEventListener('input',e=>{ query=e.target.value.toLowerCase(); render(); });

function render(){
  grid.innerHTML='';
  $('#statCount').textContent=GAMES.length;
  const list=GAMES.filter(g=>(activeCat=='All'||g.cat==activeCat||(activeCat=='★ Favorites'&&favs.has(g.id)))
    && (g.name.toLowerCase().includes(query)||g.cat.toLowerCase().includes(query)));
  if(!list.length){ grid.innerHTML='<p style="color:var(--muted);grid-column:1/-1;text-align:center;padding:40px">No games found.</p>'; return; }
  list.forEach(g=>{
    const d=document.createElement('div'); d.className='card';
    d.innerHTML=`<div class="thumb">${g.emoji}</div>
      <button class="fav ${favs.has(g.id)?'on':''}" title="Favorite">★</button>
      <h3>${g.name}</h3>
      <div class="meta"><span>${g.cat}</span><span class="tag">${g.type=='builtin'?'INSTANT':'EMBED'}</span></div>`;
    d.querySelector('.fav').onclick=e=>{ e.stopPropagation(); favs.has(g.id)?favs.delete(g.id):favs.add(g.id);
      localStorage.setItem('nova-favs',JSON.stringify([...favs])); render(); };
    d.onclick=()=>openGame(g); grid.appendChild(d);
  });
}
render();

// ---- game overlay ----
function openGame(g){
  stage.innerHTML=''; $('#otitle').textContent=g.name+' — '+g.cat;
  overlay.classList.add('open'); document.body.style.overflow='hidden';
  if(g.type=='builtin'){
    const wrap=document.createElement('div'); wrap.className='gamewrap';
    const cv=document.createElement('canvas');
    const rect=stage.getBoundingClientRect(); cv.width=Math.min(720,~~(rect.width*.95)); cv.height=Math.min(560,~~(rect.height*.92));
    cv.style.aspectRatio='auto'; cv.style.maxHeight='100%'; cv.style.borderRadius='12px'; cv.style.background='#0b0e17';
    wrap.appendChild(cv); stage.appendChild(wrap);
    active=Engine.start(g.id,cv,(sc)=>saveScore(g.id,sc));
  } else {
    const f=document.createElement('iframe'); f.src=g.url; f.allow='fullscreen; autoplay'; f.setAttribute('allowfullscreen','');
    stage.appendChild(f); active=null;
  }
}
function saveScore(id,sc){ if(sc!=null&&(scores[id]==null||sc>scores[id])){ scores[id]=sc; localStorage.setItem('nova-scores',JSON.stringify(scores)); toast('New high score: '+sc); } }
function closeGame(){ if(active&&active.destroy)active.destroy(); active=null; overlay.classList.remove('open'); stage.innerHTML=''; document.body.style.overflow=''; }
$('#oclose').onclick=closeGame;
$('#orestart').onclick=()=>{ const g=GAMES.find(x=>$('#otitle').textContent.startsWith(x.name)); if(active&&active.restart)active.restart(); };
$('#ofull').onclick=()=>{ if(document.fullscreenElement)document.exitFullscreen(); else stage.requestFullscreen().catch(()=>{}); };
addEventListener('keydown',e=>{ if(e.key=='Escape')closeGame(); });

// ---- URL launcher ----
$('#launchBtn').onclick=()=>modal.classList.add('open');
$('#mclose').onclick=()=>modal.classList.remove('open');
$('#mgo').onclick=()=>{ let u=$('#urlInput').value.trim(); if(!u)return;
  if(!/^https?:\/\//.test(u))u='https://'+u;
  modal.classList.remove('open'); openGame({name:new URL(u).hostname,cat:'Launched',type:'embed',url:u}); };
$('#urlInput').addEventListener('keydown',e=>{ if(e.key=='Enter')$('#mgo').click(); });

// ---- tab cloaking ----
const CLOAKS=[
  {name:'Google Classroom',title:'Classes',icon:'https://www.google.com/a/favicon.ico'},
  {name:'Google Drive',title:'My Drive - Google Drive',icon:'https://ssl.gstatic.com/images/branding/product/1x/drive_2020q4_32dp.png'},
  {name:'Google Docs',title:'Untitled document - Google Docs',icon:'https://ssl.gstatic.com/docs/documents/images/kix-favicon7.ico'},
  {name:'Gmail',title:'Inbox (1) - Gmail',icon:'https://mail.google.com/favicon.ico'},
  {name:'Canvas LMS',title:'Dashboard',icon:'https://du11hjcvx0uqb.cloudfront.net/dist/images/favicon-e10d657a73.ico'},
];
let cloakIdx=0;
const origTitle=document.title, origIcon=document.querySelector('link[rel=icon]').href;
$('#cloakBtn').onclick=()=>{ cloakIdx=(cloakIdx+1)%(CLOAKS.length+1);
  if(cloakIdx==0){ document.title=origTitle; document.querySelector('link[rel=icon]').href=origIcon; toast('Cloak off'); return; }
  const c=CLOAKS[cloakIdx-1]; document.title=c.title; document.querySelector('link[rel=icon]').href=c.icon; toast('Cloaked as '+c.name); };

// toast
let toastT; function toast(msg){ const t=$('#toast'); t.textContent=msg; t.classList.add('show'); clearTimeout(toastT); toastT=setTimeout(()=>t.classList.remove('show'),2200); }
