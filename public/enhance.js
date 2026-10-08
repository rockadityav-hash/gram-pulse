/* GRAM-PULSE · Soft Meadow enhancements
 * Design + "alive" layer. Loaded after app.js; wraps a few globals (go, toast, renderMap,
 * overlay, applyTheme) but never changes data logic or API calls. */
(()=>{
'use strict';
const byEl=id=>document.getElementById(id);
const body=document.body;
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const coarse=matchMedia('(hover: none)').matches;
const MOBILE=()=>innerWidth<=700, DRAWER=()=>innerWidth<1024;

/* ---------------------------------------------------------------- icons */
const IC={
dashboard:'<rect x="3.5" y="3.5" width="7" height="7" rx="2.5"/><rect x="13.5" y="3.5" width="7" height="7" rx="2.5"/><rect x="3.5" y="13.5" width="7" height="7" rx="2.5"/><rect x="13.5" y="13.5" width="7" height="7" rx="2.5"/>',
home:'<path d="M4 11l8-7 8 7"/><path d="M6 10v9.5h12V10"/><path d="M10 19.5v-5h4v5"/>',
twin:'<path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.4"/>',
simulate:'<path d="M20 12a8 8 0 1 1-2.6-5.9"/><path d="M20 4v5h-5"/><path d="M12 8.5V12l2.3 1.4"/>',
priorities:'<path d="M4 7h10M4 12h7M4 17h5"/><path d="M18 20v-9M14.500 14.500l3.500-3.500 3.500 3.500"/>',
budget:'<circle cx="12" cy="12" r="8.5"/><path d="M8.5 8.5h7M8.5 11.5h7M9.500 8.500c4.500 0 4.500 4.500 0 4.500l4.500 4"/>',
reports:'<path d="M5 5h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-7l-4.500 3.500V17H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z"/><path d="M8 10h8M8 13h5"/>',
confidence:'<path d="M12 3l7.500 3v5.500c0 4.500-3.200 8-7.500 9.500-4.300-1.500-7.500-5-7.500-9.500V6z"/><path d="M8.800 12l2.300 2.300 4.200-4.600"/>',
assets:'<path d="M12 3l8 4.200v9.600L12 21l-8-4.200V7.200z"/><path d="M4 7.200l8 4.300 8-4.300M12 11.500V21"/>',
incidents:'<path d="M6 21V4"/><path d="M6 5c4-2.500 7 2.500 12 0v9c-5 2.500-8-2.500-12 0"/>',
analytics:'<path d="M5 20v-8M12 20V5M19 20v-5"/>',
whatif:'<path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/>',
citizen:'<circle cx="9" cy="8.500" r="3.300"/><path d="M3 20c0-3.500 2.700-6 6-6s6 2.500 6 6"/><circle cx="17.500" cy="9.500" r="2.500"/><path d="M17 14.200c2.500.3 4 2.300 4 5"/>',
settings:'<circle cx="12" cy="12" r="3"/><path d="M12 3v2.500M12 18.500V21M3 12h2.500M18.500 12H21M5.600 5.600l1.800 1.800M16.600 16.600l1.800 1.800M5.600 18.400l1.800-1.800M16.600 7.400l1.800-1.800"/>',
brief:'<path d="M7 3h7l5 5v11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/><path d="M14 3v5h5M8.500 13h7M8.500 16.500h5"/>',
management:'<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 12.500l9 5 9-5M3 16.500l9 5 9-5"/>',
audit:'<rect x="5" y="4.500" width="14" height="16.500" rx="2.500"/><path d="M9 4.500V3h6v1.500M8.800 13l2.400 2.400 4-4.400"/>',
bell:'<path d="M6 17v-6a6 6 0 0 1 12 0v6l1.500 2h-15z"/><path d="M10 21a2 2 0 0 0 4 0"/>',
search:'<circle cx="11" cy="11" r="6.500"/><path d="M16 16l4.500 4.500"/>',
moon:'<path d="M20 14.500A8 8 0 0 1 9.500 4a8 8 0 1 0 10.500 10.500z"/>',
sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2.500V5M12 19v2.500M2.500 12H5M19 12h2.500M5.300 5.300l1.800 1.800M16.900 16.900l1.800 1.800M5.300 18.700l1.800-1.800M16.900 7.100l1.800-1.800"/>',
menu:'<path d="M4 7h16M4 12h16M4 17h10"/>',
panel:'<rect x="3.500" y="4.500" width="17" height="15" rx="4"/><path d="M9.500 4.500v15"/>',
plus:'<path d="M12 5v14M5 12h14"/>',
up:'<path d="M6 14l6-6 6 6"/>',
more:'<circle cx="6" cy="12" r="1.600"/><circle cx="12" cy="12" r="1.600"/><circle cx="18" cy="12" r="1.600"/>'
};
const ico=n=>`<svg viewBox="0 0 24 24" aria-hidden="true">${IC[n]||IC.dashboard}</svg>`;

/* ---------------------------------------------------------------- hand-drawn scene */
const rnd=(a,b)=>a+Math.random()*(b-a);
const tree=(x,y,s=1,c='s-crown',d='')=>`<g transform="translate(${x} ${y}) scale(${s})"><g class="sway ${d}"><path class="s-trunk" d="M-6 0C-5-12-6-20-4-28H4C6-20 5-12 6 0Z"/><path class="${c}" d="M0-92C-22-92-36-74-28-56C-42-46-34-26-14-28C-4-18 20-20 26-34C42-42 38-62 24-66C26-80 14-92 0-92Z"/><path class="nofill" d="M-12-70c4-6 10-8 16-6M10-52c4-1 8 0 10 3"/></g></g>`;
const pine=(x,y,s=1,d='')=>`<g transform="translate(${x} ${y}) scale(${s})"><g class="sway ${d}"><path class="s-trunk" d="M-5 0V-12H5V0Z"/><path class="s-pine" d="M0-96L-22-62H-12L-32-34H-18L-38-12H38L18-34H32L12-62H22Z"/></g></g>`;
const flower=(x,y,s,c,d='')=>{const p=[[0,-7],[6.7,-2.2],[4.1,5.7],[-4.1,5.7],[-6.7,-2.2]].map(([a,b])=>`<circle class="${c}" cx="${a}" cy="${b}" r="5.2"/>`).join('');return `<g transform="translate(${x} ${y}) scale(${s})"><g class="sway ${d}"><path class="nofill" d="M0 0C-2-10 2-18 0-26"/><path class="s-leaf" d="M0-9C-8-11-12-17-12-21C-4-21 0-15 0-9Z"/><g transform="translate(0 -31)">${p}<circle class="s-butter" r="3.6"/></g></g></g>`};
const hut=(x,y,s=1)=>`<g transform="translate(${x} ${y}) scale(${s})"><path class="s-hut" d="M14-58V-78H26V-50Z"/><circle class="smoke s-white" cx="20" cy="-84" r="4" stroke="none"/><circle class="smoke s-white" cx="20" cy="-84" r="3" stroke="none" style="animation-delay:-2.2s"/><path class="s-hut" d="M-28 0V-38H28V0Z"/><path class="s-roof" d="M-38-36L0-70L38-36Z"/><path class="s-trunk" d="M-8 0V-20Q0-28 8-20V0Z"/><circle class="s-pond" cx="-17" cy="-21" r="5"/><circle class="s-pond" cx="17" cy="-21" r="5"/></g>`;
const cloud=(x,y,s,c)=>`<g transform="translate(${x} ${y}) scale(${s})"><path class="cloud ${c} s-cloud" d="M0 26C-16 26-18 6 0 4C2-14 30-18 38-2C52-12 74-2 70 14C82 16 82 26 68 26Z"/></g>`;
const bird=(x,y,c='')=>`<g transform="translate(${x} ${y})"><path class="bird ${c} nofill" d="M0 0q6-8 12 0q6-8 12 0"/></g>`;
const lf=(x,y,c,r=0)=>`<g transform="translate(${x} ${y}) rotate(${r})"><path class="fl ${c} s-leaf" d="M0 0C6-9 18-9 24 0C18 9 6 9 0 0Z"/></g>`;
const bfly=(x,y)=>`<g transform="translate(${x} ${y})"><g class="bfly"><path class="wing s-rose" d="M0 0C-4-11-15-11-13-2C-12 5-4 5 0 0Z"/><path class="wing r s-rose" d="M0 0C4-11 15-11 13-2C12 5 4 5 0 0Z"/><path class="nofill" d="M0-3V5"/></g></g>`;
const hill=(d,c)=>`<path class="${c}" stroke="none" d="${d}L560 330L0 330Z"/><path class="nofill" d="${d}"/>`;
function scene(o={}){
  const rays=Array.from({length:8},(_,i)=>{const a=i*Math.PI/4,cx=470,cy=66;return `<path class="nofill" d="M${(cx+Math.cos(a)*36).toFixed(1)} ${(cy+Math.sin(a)*36).toFixed(1)}L${(cx+Math.cos(a)*47).toFixed(1)} ${(cy+Math.sin(a)*47).toFixed(1)}"/>`}).join('');
  const par=o.slice?'xMidYMax slice':'xMaxYMax meet';
  return `<svg class="scene" viewBox="0 0 560 320" preserveAspectRatio="${par}" aria-hidden="true" focusable="false"><g class="ink" fill="none" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
<g class="ly ly1"><g class="sun-rays">${rays}</g><circle class="s-sun" cx="470" cy="66" r="26"/>${cloud(40,52,1,'c1')}${cloud(250,22,.7,'c2')}${bird(318,92)}${bird(350,76,'b2')}</g>
<g class="ly ly2">${hill('M0 214C60 170 130 168 200 200C260 226 330 160 420 176C480 186 530 196 560 190','s-hill1')}${tree(70,196,.42,'s-crown2')}${tree(98,190,.36,'s-crown')}${pine(396,182,.4)}${tree(424,178,.4,'s-crown2')}</g>
<g class="ly ly3">${hill('M0 252C80 214 160 236 240 246C330 258 400 214 470 226C510 233 540 240 560 238','s-hill2')}${tree(118,238,.95,'s-crown','d2')}${pine(176,242,.72,'d3')}${pine(250,248,.86)}${hut(318,252,.9)}${tree(386,240,.78,'s-crown2','d3')}${tree(486,232,.7,'s-crown')}${pine(522,236,.6,'d2')}</g>
<g class="ly ly4">${hill('M0 288C100 262 200 280 300 284C400 288 480 266 560 276','s-hill3')}${flower(40,282,.9,'s-rose')}${flower(74,278,.7,'s-lav','d2')}${flower(158,279,.8,'s-butter','d3')}${flower(236,283,.9,'s-peach')}${flower(342,286,.75,'s-rose','d2')}${flower(404,284,.9,'s-lav')}${flower(512,276,.8,'s-butter','d3')}${flower(540,278,.7,'s-rose')}
<ellipse class="s-pond" cx="452" cy="304" rx="40" ry="9"/><path class="nofill ripple" d="M434 304h18M446 308h20"/></g>
<g class="ly ly5">${bfly(200,170)}${lf(280,150,'f1',20)}${lf(430,130,'f2',-30)}${lf(90,120,'f3',40)}</g>
</g></svg>`;
}
window.__gpScene=scene;

/* small deco for the SVG village map */
function mapDeco(){
  return `<g class="ink deco" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" pointer-events="none" opacity=".75">
${tree(40,570,.8,'s-crown')}${tree(86,574,.58,'s-crown2')}${pine(940,80,.55)}${tree(972,92,.6,'s-crown2')}${pine(962,570,.62)}
<ellipse class="s-pond" cx="880" cy="540" rx="56" ry="13"/><path class="nofill ripple" d="M848 540h28M868 546h32"/>
${flower(520,568,.8,'s-rose')}${flower(560,572,.7,'s-lav')}${flower(30,40,.7,'s-butter')}${flower(62,36,.6,'s-rose')}</g>`;
}

/* ---------------------------------------------------------------- animation window */
let kickT;
function kick(ms=2300){if(reduce)return;body.classList.add('anim-on');clearTimeout(kickT);kickT=setTimeout(()=>body.classList.remove('anim-on'),ms)}
function countUp(el){
  if(!el||reduce||!body.classList.contains('anim-on'))return;
  const n=el.firstChild;if(!n||n.nodeType!==3)return;
  const m=n.nodeValue.match(/^(\D*?)(\d[\d,]*(?:\.\d+)?)([\s\S]*)$/);if(!m)return;
  const [,pre,num,suf]=m,dec=(num.split('.')[1]||'').length,commas=num.includes(','),end=parseFloat(num.replace(/,/g,''));
  if(!isFinite(end)||end===0)return;
  const t0=performance.now(),dur=1000;
  const fmtN=v=>commas?v.toLocaleString('en-IN',{minimumFractionDigits:dec,maximumFractionDigits:dec}):v.toFixed(dec);
  (function step(t){const p=Math.min(1,(t-t0)/dur),e=1-Math.pow(1-p,3);n.nodeValue=pre+fmtN(end*e)+suf;if(p<1)requestAnimationFrame(step);else n.nodeValue=pre+num+suf})(t0);
}
function burst(){
  if(reduce)return;const b=document.createElement('div');b.className='leaf-burst';
  const cols=['#9fd0a8','#bfe0c3','#fbe6a2','#f9c8cf','#fbd5be','#cfe5f3'];
  for(let i=0;i<16;i++){const l=document.createElement('i'),a=rnd(-Math.PI*.95,-Math.PI*.05),d=rnd(70,170);
    l.style.setProperty('--x',Math.cos(a)*d+'px');l.style.setProperty('--y',Math.sin(a)*d+'px');l.style.setProperty('--r',rnd(-240,240)+'deg');l.style.setProperty('--d',rnd(0,.15)+'s');l.style.setProperty('--c',cols[i%cols.length]);b.append(l)}
  document.body.append(b);setTimeout(()=>b.remove(),1700);
}

/* ---------------------------------------------------------------- structure: brand, icons, art */
const brand=document.querySelector('.topbar .brand');
if(brand){brand.innerHTML='<span class="logo"></span><span class="bt"><b>GRAM</b>-PULSE<small>Predictive Rural Infrastructure Digital Twin</small></span>';
  brand.setAttribute('role','button');brand.tabIndex=0;brand.setAttribute('aria-label','GRAM-PULSE home');
  brand.addEventListener('click',()=>go('dashboard'));brand.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();go('dashboard')}})}

document.querySelectorAll('#nav [data-page] .ico').forEach(s=>{s.innerHTML=ico(s.parentElement.dataset.page)});
function setBtn(sel,icon,label){const b=document.querySelector(sel);if(b){b.innerHTML=ico(icon);b.setAttribute('aria-label',label);b.title=label}return b}
setBtn('#menuBtn','menu','Open menu');
const bellBtn=setBtn('.top-actions .iconbtn[onclick^="openAlerts"]','bell','Notifications');
const dotBadge=document.createElement('span');dotBadge.className='dot-badge';dotBadge.hidden=true;bellBtn?.append(dotBadge);
setBtn('#collapseToggle','panel','Collapse navigation');
setBtn('.top-actions .iconbtn[onclick^="openCommand"]','search','Search');
function themeIcon(){const b=byEl('themeToggle');if(!b)return;const dark=body.classList.contains('theme-dark');b.innerHTML=ico(dark?'sun':'moon');const l=dark?'Switch to light mode':'Switch to dark mode';b.setAttribute('aria-label',l);b.title=l}
if(typeof applyTheme==='function'){const _at=applyTheme;window.applyTheme=function(t){_at.apply(this,arguments);themeIcon()}}
themeIcon();

document.querySelectorAll('.hero-art').forEach(el=>{el.innerHTML=scene()});
const arts=['s1','s2','s3','s4'];
document.querySelectorAll('.page>.section-head').forEach((h,i)=>{const d=document.createElement('div');d.className='sh-art';d.setAttribute('aria-hidden','true');d.dataset.art=arts[i%4];h.insertBefore(d,h.children[1]||null)});

/* ---------------------------------------------------------------- mobile drawer + bottom nav */
const sb=byEl('sidebar');
const shell=document.querySelector('.shell');
function syncCollapse(){if(!shell)return;if(DRAWER())shell.classList.remove('collapsed');else if(localStorage.getItem('gramPulseSidebar')==='collapsed')shell.classList.add('collapsed')}
syncCollapse();addEventListener('resize',syncCollapse);
const navEl=byEl('nav');
if(navEl){const tb=document.createElement('button');tb.type='button';tb.className='drawer-only';tb.innerHTML=`<span class="ico">${ico('moon')}</span>Light / dark mode`;tb.addEventListener('click',()=>byEl('themeToggle')?.click());navEl.append(tb)}
const backdrop=document.createElement('div');backdrop.className='nav-backdrop';document.body.append(backdrop);
const syncDrawer=()=>body.classList.toggle('nav-open',!!sb&&sb.classList.contains('open')&&DRAWER());
if(sb){new MutationObserver(syncDrawer).observe(sb,{attributes:true,attributeFilter:['class']});
  backdrop.addEventListener('click',()=>sb.classList.remove('open'));
  addEventListener('resize',()=>{if(!DRAWER())sb.classList.remove('open');syncDrawer()});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')sb.classList.remove('open')});
  let sx=null,sy=0;
  document.addEventListener('touchstart',e=>{const t=e.touches[0];sx=t.clientX;sy=t.clientY},{passive:true});
  document.addEventListener('touchend',e=>{if(sx===null||!DRAWER())return;const t=e.changedTouches[0],dx=t.clientX-sx,dy=Math.abs(t.clientY-sy);
    if(dy<50){if(sx<22&&dx>70&&!sb.classList.contains('open'))sb.classList.add('open');else if(dx<-70&&sb.classList.contains('open'))sb.classList.remove('open')}sx=null},{passive:true})}

const nav=document.createElement('nav');nav.className='bottom-nav';nav.setAttribute('aria-label','Primary');
const bItems=[['dashboard','Home','home'],['twin','Map','twin'],['citizen','Report','plus','fab'],['priorities','Priorities','priorities'],['__more','More','more']];
nav.innerHTML=bItems.map(([id,l,i,c])=>`<button type="button" data-b="${id}" class="${c||''}" aria-label="${id==='citizen'?'Report an issue':l}">${ico(i)}<span>${l}</span></button>`).join('');
(document.querySelector('.shell')||document.body).append(nav);
nav.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;navigator.vibrate?.(8);b.dataset.b==='__more'?sb.classList.add('open'):go(b.dataset.b)});
function syncBottom(){const id=document.querySelector('.page.active')?.id;let hit=false;nav.querySelectorAll('button').forEach(b=>{const on=b.dataset.b===id;if(on)hit=true;b.classList.toggle('active',on)});nav.querySelector('[data-b="__more"]').classList.toggle('active',!hit&&!!id)}

const toTop=document.createElement('button');toTop.className='to-top';toTop.type='button';toTop.setAttribute('aria-label','Back to top');toTop.innerHTML=ico('up');document.body.append(toTop);
toTop.addEventListener('click',()=>scrollTo({top:0,behavior:reduce?'auto':'smooth'}));
addEventListener('scroll',()=>toTop.classList.toggle('show',scrollY>520),{passive:true});

/* ---------------------------------------------------------------- wrap globals */
const _go=window.go;
window.go=function(id){kick();const r=_go.apply(this,arguments);syncBottom();return r};
const _toast=window.toast;
window.toast=function(m){_toast.apply(this,arguments);if(/saved|recorded|stored|updated|generated|cleared|applied|synced|deleted/i.test(String(m)))burst()};
const _ov=window.overlay;
window.overlay=function(html){return _ov.call(this,'<div class="login-art">'+scene({slice:true})+'</div>'+html)};

const _rm=window.renderMap;
window.renderMap=function(id){
  _rm.apply(this,arguments);
  const w=byEl(id),svg=w&&w.querySelector(':scope>svg');if(!svg)return;
  const ctr=w.querySelector(':scope>.map-controls'),canvas=document.createElement('div');canvas.className='map-canvas';
  svg.setAttribute('preserveAspectRatio','xMidYMid meet');svg.classList.add('scene');
  const bg=svg.querySelector('rect');bg&&bg.insertAdjacentHTML('afterend',mapDeco());
  w.insertBefore(canvas,svg);canvas.append(svg);if(ctr)w.insertBefore(ctr,canvas);
  const legend=w.querySelector('.map-legend');if(legend&&!legend.dataset.hint){legend.dataset.hint=1}
};

/* ---------------------------------------------------------------- tables → mobile cards */
function labelTable(tb){const heads=[...tb.closest('table').querySelectorAll('thead th')].map(th=>th.textContent.replace(/[↕]/g,'').trim());
  tb.querySelectorAll('tr').forEach(tr=>[...tr.children].forEach((td,i)=>{if(!td.classList.contains('empty')&&heads[i])td.dataset.label=heads[i]}))}
['priorityRows','assetRows','incidentRows','manageRows','auditRows'].forEach(id=>{const tb=byEl(id);if(!tb)return;labelTable(tb);new MutationObserver(()=>labelTable(tb)).observe(tb,{childList:true})});

/* mobile sort control for the asset register (table headers are hidden on phones) */
const aTools=document.querySelector('#assets .toolbar');
if(aTools){const w=document.createElement('div');w.id='mobSortWrap';w.style.cssText='gap:8px;flex:1 1 100%;align-items:center';
  w.innerHTML='<select class="select" id="mobSort" aria-label="Sort assets" style="flex:1"><option value="id">Sort: ID</option><option value="name">Sort: Name</option><option value="type">Sort: Type</option><option value="ward">Sort: Ward</option><option value="condition">Sort: Condition</option><option value="criticality">Sort: Criticality</option><option value="risk">Sort: Risk</option><option value="pop">Sort: People served</option><option value="cost">Sort: Cost</option></select><button type="button" class="btn small" id="mobSortDir" aria-label="Reverse order">↕</button>';
  aTools.append(w);
  byEl('mobSort').addEventListener('change',e=>{assetSort=e.target.value;assetSortDir=1;assetPage=1;renderAssetTable()});
  byEl('mobSortDir').addEventListener('click',()=>{assetSortDir*=-1;renderAssetTable()})}

/* ---------------------------------------------------------------- make every element do something */
const KPI={'VILLAGE PULSE':{a:'pulse'},'POPULATION':{p:'twin'},'HOUSEHOLDS':{p:'twin'},'INFRASTRUCTURE ASSETS':{p:'assets'},'CRITICAL ASSETS':{p:'priorities'},'HIGH-RISK ASSETS':{p:'priorities',a:'risk'},'OPEN INCIDENTS':{p:'incidents'},'CITIZEN REPORTS':{p:'reports'},'BUDGET AVAILABLE':{p:'budget'},'EST. BENEFICIARIES':{p:'budget'}};
function decorateKpis(){document.querySelectorAll('#kpis .kpi').forEach((k,i)=>{
  const cfg=KPI[k.querySelector('.label')?.textContent.trim()];
  if(cfg&&typeof state!=='undefined'&&state&&(!cfg.p||permitted(cfg.p))){if(cfg.p)k.dataset.go=cfg.p;if(cfg.a)k.dataset.act=cfg.a;k.tabIndex=0;k.setAttribute('role','button');k.title='Open details'}
  countUp(k.querySelector('.value'))})}
const kp=byEl('kpis');if(kp)new MutationObserver(decorateKpis).observe(kp,{childList:true});
['simulationResult','planSummary'].forEach(id=>{const el=byEl(id);if(el)new MutationObserver(()=>el.querySelectorAll('.impact-kpis .mini b').forEach(countUp)).observe(el,{childList:true})});

const flow=document.querySelector('#dashboard .flow');
if(flow){[['twin','Open the village map'],['twin','Open the dependency graph'],['simulate','Run a failure simulation'],['priorities','See predicted priorities'],['budget','Optimize the budget']].forEach(([p,t],i)=>{const s=flow.querySelectorAll('span')[i];if(s){s.dataset.go=p;s.title=t;s.tabIndex=0;s.setAttribute('role','button')}})}

function doAct(el){
  const p=el.dataset.go,a=el.dataset.act;
  if(p&&typeof permitted==='function'&&state&&!permitted(p)){toast('That area is available to administrators and officers.');return}
  if(a==='pulse'){explainPulse();return}
  if(p)go(p);
  if(a==='risk'){const r=byEl('priorityRisk');if(r){r.value='High';renderPriorities()}}
}
document.addEventListener('click',e=>{
  const t=e.target.closest('[data-go],[data-act]');if(t&&!e.target.closest('button,a,input,select,textarea')){doAct(t);return}
  const h=e.target.closest('#health .health-item');
  if(h){const map={Water:'Water',Roads:'Road',Drainage:'Drainage',Education:'Education',Sanitation:'Sanitation',Healthcare:'Healthcare'},n=h.querySelector('.health-top span')?.textContent.trim(),sel=byEl('priorityType');
    if(sel&&map[n]){sel.value=map[n];go('priorities');toast('Showing '+map[n]+' priorities')}return}
  const pr=e.target.closest('#planRows .plan-row');
  if(pr){const m=(pr.querySelector('.panel-sub')?.textContent||'').match(/^\s*([A-Za-z]+\d+)/);if(m)inspectAsset(m[1]);return}
  if(e.target.closest('#pulseBox .event')){explainPulse();return}
  if(e.target.closest('.demo-tag')&&e.target.closest('.topbar')){
    modal('Simulated demo data','<div class="notice">Everything you see — assets, reports, incidents and budgets — is <b>simulated</b> for demonstration. It is not official government information.</div><p class="panel-sub" style="margin-top:12px">Model outputs are indicative. Always verify on site and through official channels before acting on any recommendation.</p>','ABOUT THIS DATA');return}
  if(e.target.closest('.topbar .location')&&state){
    modal(state.village.name,`<div class="detail-grid"><div class="detail-item"><span>Residents</span><b>${fmt(state.village.population)}</b></div><div class="detail-item"><span>Households</span><b>${fmt(state.village.households)}</b></div><div class="detail-item"><span>Wards</span><b>${state.wards.length}</b></div><div class="detail-item"><span>Assets mapped</span><b>${assets.length}</b></div></div>`+state.wards.map(w=>`<div class="conf-source"><span>${esc(w.name)}</span><b>${fmt(w.population)} residents · ${fmt(w.households)} homes</b></div>`).join('')+'<div class="toolbar"><button class="btn primary small" onclick="closeModal();go(\'twin\')">Open village map</button></div>','VILLAGE SNAPSHOT');return}
  if(e.target.closest('.aside-foot')&&state){refresh().then(()=>toast('Synced · everything is up to date'));return}
  if(e.target.closest('.btn,.filter,.scenario,.linkbtn'))kick();
});
document.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.matches?.('[data-go],[data-act]')&&!e.target.matches('button,input,select,textarea')){e.preventDefault();doAct(e.target)}});
const dt=document.querySelector('.topbar .demo-tag');if(dt){dt.setAttribute('role','button');dt.tabIndex=0;dt.title='About this data'}
const lc=document.querySelector('.topbar .location');if(lc){lc.setAttribute('role','button');lc.tabIndex=0;lc.title='Village snapshot'}
const af=document.querySelector('.aside-foot');if(af){af.setAttribute('role','button');af.tabIndex=0;af.title='Tap to sync now';af.insertAdjacentHTML('beforeend','<br><small>Tap to sync now</small>')}
document.querySelectorAll('.demo-tag,.topbar .location,.aside-foot').forEach(el=>el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();el.click()}}));

/* ---------------------------------------------------------------- greeting, avatar, bell */
function greeting(){
  const acc=byEl('accountLabel');if(!acc||typeof state==='undefined'||!state)return;
  acc.dataset.initial=(state.user.name||'?').trim().charAt(0);acc.setAttribute('aria-label','Account: '+state.user.name);
  const h=new Date().getHours(),g=h<5?'Good night':h<12?'Good morning':h<17?'Good afternoon':'Good evening',el=byEl('greet');
  if(el)el.innerHTML=`<i>👋</i> ${g}, ${esc((state.user.name||'').split(' ')[0])}`;
}
const acc=byEl('accountLabel');if(acc)new MutationObserver(greeting).observe(acc,{childList:true,characterData:true,subtree:true});
async function updateBell(){if(typeof state==='undefined'||!state)return;try{const rows=await api.request('/notifications');dotBadge.hidden=!rows.some(r=>!r.read)}catch{}}
if(kp)new MutationObserver(()=>{updateBell()}).observe(kp,{childList:true});
setInterval(updateBell,60000);
if(typeof openAlerts==='function'){const _oa=window.openAlerts;window.openAlerts=async function(){const r=await _oa.apply(this,arguments);setTimeout(updateBell,400);return r}}

/* ---------------------------------------------------------------- ripple + hero parallax */
document.addEventListener('pointerdown',e=>{
  if(reduce)return;const b=e.target.closest('.btn,.iconbtn,.filter,.nav button,.bottom-nav button');if(!b||b.disabled)return;
  const r=b.getBoundingClientRect(),s=Math.max(r.width,r.height),d=document.createElement('span');d.className='ripple-dot';
  d.style.cssText=`width:${s}px;height:${s}px;left:${e.clientX-r.left-s/2}px;top:${e.clientY-r.top-s/2}px`;b.append(d);setTimeout(()=>d.remove(),650)},{passive:true});
if(!reduce&&!coarse)document.querySelectorAll('.hero').forEach(h=>{const L=[...h.querySelectorAll('.ly')],k=[0,5,9,14,18];
  h.addEventListener('pointermove',e=>{const r=h.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;L.forEach((g,i)=>g.style.transform=`translate(${(-x*k[i]).toFixed(1)}px,${(-y*k[i]*.5).toFixed(1)}px)`)});
  h.addEventListener('pointerleave',()=>L.forEach(g=>g.style.transform=''))});

/* section art backgrounds come from theme.css via data-art → resolve once from CSS vars */
document.querySelectorAll('.sh-art').forEach(d=>{d.style.backgroundImage=`var(--art-${d.dataset.art})`});

kick(3200);syncBottom();
})();
