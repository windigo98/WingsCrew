/* Highkeep prototype. © 2026 WingsCrew. All rights reserved. */
(function(){
'use strict';
const $=(s,r=document)=>r.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

/* ---------------- Icons ---------------- */
const P={
 castle:'<path d="M3 21h18M5 21V10l3-2V5h2v2l2-2 2 2V5h2v3l3 2v11M10 21v-4a2 2 0 0 1 4 0v4"/>',
 lotus:'<path d="M12 20c-4.5 0-8.5-2.2-9.5-6.5 3.4-.2 6.6 1.2 9.5 4.3 2.9-3.1 6.1-4.5 9.5-4.3-1 4.3-5 6.5-9.5 6.5z"/><path d="M12 17.5c-2.3-2.3-3.2-5.9-2-10 1 .8 1.7 1.7 2 2.8.3-1.1 1-2 2-2.8 1.2 4.1.3 7.7-2 10z"/>',
 puzzle:'<path d="M5 5h4a2.5 2.5 0 1 1 5 0h4v4a2.5 2.5 0 1 1 0 5v5h-4.5a2.5 2.5 0 1 0-5 0H5v-5a2.5 2.5 0 1 0 0-5z"/>',
 crown:'<path d="M3.5 18.5h17M4.5 18.5L3 8l5.2 4L12 5l3.8 7L21 8l-1.5 10.5"/><circle cx="12" cy="4.2" r=".9"/>',
 dots:'<circle cx="5" cy="12" r="1.8" fill="currentColor"/><circle cx="12" cy="12" r="1.8" fill="currentColor"/><circle cx="19" cy="12" r="1.8" fill="currentColor"/>',
 check:'<path d="M5 12.5l4.5 4.5L19 7.5"/>',
 shieldcheck:'<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M8.5 12l2.5 2.5 4.5-5"/>',
 search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="M20 20l-4.8-4.8"/>',
 whos:'<circle cx="9" cy="8" r="4"/><path d="M2 21c0-4 3-6.5 7-6.5s7 2.5 7 6.5"/><path d="M17.5 5.5a2.2 2.2 0 1 1 2.6 2.2c-.6.2-.9.7-.9 1.3M19.2 12h.01"/>',
 bell:'<path d="M6 16v-5a6 6 0 0 1 12 0v5l2 2H4zM10 20.5a2 2 0 0 0 4 0"/>',
 star:'<path d="M12 3l2.7 5.8 6.3.7-4.7 4.3 1.3 6.2L12 16.9 6.4 20l1.3-6.2L3 9.5l6.3-.7z"/>',
 speaker:'<path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16.5 9a4 4 0 0 1 0 6M19 6.5a7.5 7.5 0 0 1 0 11"/>',
 back:'<path d="M15 5l-7 7 7 7"/>', next:'<path d="M9 5l7 7-7 7"/>',
 compass:'<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>',
 plus:'<path d="M12 5v14M5 12h14"/>', x:'<path d="M6 6l12 12M18 6L6 18"/>',
 camera:'<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
 pill:'<rect x="3" y="8.5" width="18" height="7" rx="3.5" transform="rotate(-40 12 12)"/><path d="M9.2 9.2l5.6 5.6"/>',
 flame:'<path d="M12 3c1 4 5.5 5.5 5.5 10.5a5.5 5.5 0 0 1-11 0c0-3 2-4.5 2-7.5 1.2 1 2 2.3 2 4 1.2-2 1.5-4.2 1.5-7z"/>',
 lock:'<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
 bulb:'<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.7.7 1 1.5 1 2.5h6c0-1 .3-1.8 1-2.5A6 6 0 0 0 12 3z"/>',
 help:'<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .8-1 1.7M12 17h.01"/>',
 play:'<path d="M8 5l11 7-11 7z" fill="currentColor"/>',
 gear:'<circle cx="12" cy="12" r="3.5"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1"/>',
 text:'<path d="M3 20l6-16 6 16M5.3 14h7.4M16 20l3-8 3 8M17 17.5h4"/>',
 sparkle:'<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z"/>',
 person:'<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"/>',
 heart:'<path d="M12 20s-7.5-4.6-7.5-10.2A4.2 4.2 0 0 1 12 7.3a4.2 4.2 0 0 1 7.5 2.5C19.5 15.4 12 20 12 20z"/>',
 child:'<circle cx="12" cy="5.5" r="2.8"/><path d="M12 8.5v7M7.5 11.5h9M8.5 21l3.5-5.5 3.5 5.5"/>',
 clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.2 2"/>',
 eye:'<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
 bag:'<path d="M5 8h14l-1.2 12.5H6.2zM9 8V6.5a3 3 0 0 1 6 0V8"/>',
 grid:'<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>',
 book:'<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5zM4 20.5V5.5M8 7h8"/>',
 list:'<path d="M9 6h11M9 12h11M9 18h11"/><circle cx="4.5" cy="6" r="1.3"/><circle cx="4.5" cy="12" r="1.3"/><circle cx="4.5" cy="18" r="1.3"/>',
 tag:'<path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="8" r="1.5"/>',
 hash:'<path d="M4 9h16M4 15h16M10 3L8 21M16 3l-2 18"/>',
 repeat:'<path d="M20.5 12a8.5 8.5 0 1 1-2.6-6.1M20.5 4v5h-5"/>',
 path:'<path d="M5 20c1-5 13-4 14-10a4 4 0 0 0-8 .5"/><circle cx="5" cy="20" r="1.5"/><circle cx="15" cy="7" r="1.6"/>',
 link:'<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
 target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/>',
 moon:'<path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a6.8 6.8 0 0 0 10.5 10.5z"/>',
 image:'<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5-9 9"/>',
 key:'<circle cx="8" cy="12" r="4.2"/><path d="M12.2 12H21M18 12v3.2M21 12v3.2"/>',
 tower:'<path d="M6 21V9h12v12M6 9V4.5h2.4v2.2h2.2V4.5h2.8v2.2h2.2V4.5H18V9M10 21v-4a2 2 0 0 1 4 0v4"/>',
 lantern:'<path d="M9 4h6M12 2v2M8.5 6.5h7l1.5 2.5v8l-1.5 2.5h-7L7 17V9zM6.5 21.5h11"/><path d="M12 10v5"/>',
 shield:'<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M12 7v10M8 11h8"/>',
 gem:'<path d="M6.5 3.5h11L22 9 12 21 2 9z"/><path d="M2 9h20M9 3.5L12 9l3-5.5M12 9v12"/>',
 home:'<path d="M3 11l9-7 9 7M5 9.5V20h14V9.5"/>'
};
const ic=(n,cls='')=>`<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[n]||''}</svg>`;
const cardIc=n=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><g fill="currentColor" fill-opacity=".14">${P[n]}</g></svg>`;

const goldDefs=`<defs><linearGradient id="gg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8c6a29"/><stop offset=".35" stop-color="#ecd28a"/><stop offset=".6" stop-color="#b8913f"/><stop offset="1" stop-color="#f3e1a6"/></linearGradient></defs>`;
const cornerSVG=cls=>`<svg class="corner ${cls}" viewBox="0 0 60 60" fill="none" stroke="url(#gg)" stroke-width="1.7" stroke-linecap="round" aria-hidden="true">${goldDefs}
<path d="M5 57V22C5 12 12 5 22 5h35"/><path d="M10 50c0-15 8-27 22-33 8-3 15-3 20-1"/>
<path d="M16 37c3-10 12-15 19-13 5 1.5 6 7 2 9-3 1.3-5.2-1-4-3.2"/><path d="M37 16c-10 3-15 12-13 19 1.5 5 7 6 9 2 1.3-3-1-5.2-3.2-4"/>
<circle cx="13" cy="13" r="2.6" fill="url(#gg)" stroke="none"/><path d="M44 9c3-3 7-3 9 0M9 44c-3 3-3 7 0 9"/></svg>`;
const keystone=`<svg class="keystone" viewBox="0 0 64 30" aria-hidden="true">${goldDefs}<path d="M18 1h28l-5 22H23z" fill="url(#gg)" stroke="#7f5c1c" stroke-width=".8"/><path d="M32 6l2 5 5 1-5 1-2 5-2-5-5-1 5-1z" fill="#fff6d6"/><path d="M4 8c6-4 10 0 14 2M60 8c-6-4-10 0-14 2" stroke="url(#gg)" stroke-width="1.6" fill="none"/></svg>`;

/* ---------------- Keep silhouette gauge ---------------- */
let gid=0;
function palaceShapes(){
  const towers=[[30,8,98,76],[162,8,98,76],[52,10,80,54],[138,10,80,54],[69,12,66,34],[119,12,66,34],[83,6,72,56],[111,6,72,56],[89,22,52,6]];
  let s='<polygon points="16,121 184,121 174,133 152,146 134,168 112,195 100,184 88,197 72,169 50,147 28,135"/><rect x="42" y="94" width="116" height="28"/>';
  towers.forEach(([x,w,t,sp])=>{s+=`<rect x="${x}" y="${t}" width="${w}" height="${122-t}"/><polygon points="${x-1.6},${t+.5} ${x+w/2},${sp} ${x+w+1.6},${t+.5}"/>`;});
  return s;
}
const SHAPES=palaceShapes();
const WINDOWS=[[97,62],[97,76],[103,62],[103,76],[73,84],[123,84],[56,96],[140,96],[74,104],[122,104],[98,104]].map(([x,y])=>`<rect x="${x-1.7}" y="${y}" width="3.4" height="6" rx="1.7"/>`).join('');
function gaugeSVG(pct){
  const id='k'+(++gid); const top=197-(Math.max(0,Math.min(100,pct))/100)*191;
  return `<svg viewBox="0 0 200 200" role="img" aria-label="Your keep is ${Math.round(pct)} percent full">
  <defs><linearGradient id="g${id}" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#9c6a12"/><stop offset=".45" stop-color="#f2c64a"/><stop offset="1" stop-color="#fff3b8"/></linearGradient>
  <clipPath id="c${id}">${SHAPES}</clipPath><filter id="f${id}" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="4"/></filter></defs>
  <g fill="#a99cff" opacity=".7" filter="url(#f${id})">${SHAPES}</g>
  <g fill="#141936" stroke="#9d91f0" stroke-width=".9">${SHAPES}</g>
  <g fill="#2c3366">${WINDOWS}</g>
  <g clip-path="url(#c${id})"><rect x="0" y="${top}" width="200" height="${200-top}" fill="url(#g${id})"/>
   <rect x="0" y="${top-1}" width="200" height="2.5" fill="#fffbe0" opacity="${pct>0&&pct<100?.9:0}"/>
   <g fill="#fffbe6" clip-path="none">${pct>0?WINDOWS:''}</g></g>
  ${pct>=100?`<g fill="#fff8d0" opacity=".9"><circle cx="40" cy="60" r="1.6"/><circle cx="160" cy="48" r="1.3"/><circle cx="130" cy="20" r="1.2"/><circle cx="64" cy="28" r="1.4"/></g>`:''}
  </svg>`;
}
const plantSVG=`<svg class="plant glow" viewBox="0 0 120 120" aria-hidden="true"><defs>
<radialGradient id="pg"><stop offset="0" stop-color="#fff6c8" stop-opacity=".95"/><stop offset=".5" stop-color="#ffe08a" stop-opacity=".45"/><stop offset="1" stop-color="#ffe08a" stop-opacity="0"/></radialGradient>
<linearGradient id="lf" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#5f9a4a"/><stop offset="1" stop-color="#d8f0a0"/></linearGradient></defs>
<circle cx="60" cy="60" r="56" fill="url(#pg)"/>
<path d="M30 92h60l-8 10c-6 6-38 6-44 0z" fill="#8d7a9c" stroke="#efe0b0" stroke-width="1.2"/><path d="M34 92c8-5 44-5 52 0" fill="#7fae5a"/>
<path d="M60 92C60 78 60 66 61 50" stroke="#6c9b4c" stroke-width="3.2" fill="none" stroke-linecap="round"/>
<path d="M60 70C48 70 38 62 36 50c12-1 22 6 24 20z" fill="url(#lf)" stroke="#f6f0c8" stroke-width=".8"/>
<path d="M61 58c2-12 12-20 25-19-1 13-12 20-25 19z" fill="url(#lf)" stroke="#f6f0c8" stroke-width=".8"/>
<circle cx="61" cy="46" r="4" fill="#fff4c0"/></svg>`;

/* ---------------- Data ---------------- */
const THEMES={
 fantasy:{name:'Fantasy',blurb:'Floating isles, glass palaces and glowing forests'},
 medieval:{name:'Medieval',blurb:'Castles on misty lakes and mountain keeps'},
 modern:{name:'Modern',blurb:'Calm glass, gardens and towers by the sea'},
 scifi:{name:'Sci-fi',blurb:'Star citadels, ring worlds and nebulae'},
 kids:{name:'Kids',blurb:'Gentle, bright and friendly places',kids:true}
};
/* Scenes: f = file under img/ (scenes/... have a small version in img/scenes/sm/). pos = crop focus for windows and thumbnails, paint = crop focus for framed paintings. */
const SCENES=[
 {id:'floating_isles',theme:'fantasy',f:'floating_isles',short:'Floating isles',title:'Floating isles above the clouds',pos:'64% 30%',paint:'68% 35%'},
 {id:'blossom_tree',theme:'fantasy',f:'blossom_tree',short:'Blossom tree',title:'A palace in a great blossom tree',pos:'50% 35%',paint:'55% 40%'},
 {id:'crystal_cliff',theme:'fantasy',f:'crystal_cliff',short:'Crystal cliff',title:'Crystal towers by a glowing sea',pos:'74% 40%',paint:'78% 40%'},
 {id:'underwater_glass',theme:'fantasy',f:'scenes/fantasy_underwater_glass_palace',short:'Glass palace',title:'A glass palace beneath the waves',pos:'55% 55%',paint:'55% 55%'},
 {id:'waterfall_citadel',theme:'fantasy',f:'scenes/fantasy_waterfall_citadel',short:'Waterfall citadel',title:'A waterfall citadel among the clouds',pos:'55% 40%',paint:'55% 40%'},
 {id:'aurora_ice',theme:'fantasy',f:'scenes/fantasy_aurora_ice_palace',short:'Aurora palace',title:'An ice palace under the aurora',pos:'55% 45%',paint:'55% 45%'},
 {id:'misty_lake',theme:'medieval',f:'scenes/medieval_misty_lake_castle',short:'Misty lake castle',title:'A castle on a misty lake at golden hour',pos:'40% 50%',paint:'40% 50%'},
 {id:'mountain_keep',theme:'medieval',f:'scenes/medieval_mountain_keep',short:'Mountain keep',title:'A keep above the mountain mist',pos:'70% 55%',paint:'70% 55%'},
 {id:'sky_villa',theme:'modern',f:'scenes/modern_sky_villa',short:'Sky villa',title:'A glass-and-garden villa in the sky',pos:'60% 50%',paint:'60% 50%'},
 {id:'coastal_tower',theme:'modern',f:'scenes/modern_coastal_tower',short:'Coastal tower',title:'A quiet coastal tower at dusk',pos:'75% 40%',paint:'75% 40%'},
 {id:'star_citadel',theme:'scifi',f:'star_citadel',short:'Star citadel',title:'A star citadel among the planets',pos:'66% 45%',paint:'68% 45%'},
 {id:'ringworld',theme:'scifi',f:'scenes/scifi_ringworld_palace',short:'Ring-world palace',title:'A palace on a ring world',pos:'70% 70%',paint:'70% 70%'},
 {id:'nebula_observatory',theme:'scifi',f:'scenes/scifi_nebula_observatory',short:'Nebula keep',title:'An observatory keep in the nebula',pos:'40% 60%',paint:'40% 60%'},
 {id:'cloud_castle',theme:'kids',f:'scenes/kids_cloud_castle',short:'Cloud castle',title:'A candy-colored cloud castle',pos:'40% 55%',paint:'40% 55%'},
 {id:'treehouse',theme:'kids',f:'scenes/kids_treehouse_kingdom',short:'Treehouse kingdom',title:'A treehouse kingdom with friendly lanterns',pos:'50% 50%',paint:'50% 50%'},
 {id:'rainbow_bridges',theme:'kids',f:'scenes/kids_rainbow_bridge_palace',short:'Rainbow bridges',title:'A storybook palace with rainbow bridges',pos:'55% 45%',paint:'55% 45%'}
];
const sceneById=id=>SCENES.find(x=>x.id===id);
const themeScenes=t=>SCENES.filter(x=>x.theme===t);
const isKidSetup=()=>S.who==='child';
const availThemes=()=>Object.keys(THEMES).filter(k=>!THEMES[k].kids||isKidSetup());
const KEY='highkeep.proto.v1';
const DEF=()=>({onboarded:false,who:'me',readAloud:false,textSize:'normal',sensory:'calm',world:'fantasy',scene:'floating_isles',looks:{},guide:true,badDay:false,
 checklist:[{id:'c1',label:'Socks',done:false},{id:'c2',label:'Keys',done:false},{id:'c3',label:'Wallet',done:false},{id:'c4',label:'Meds',done:false}],
 leaveTime:'08:30',gauge:35,awarded:{},keeps:[],tourDone:false,
 doneChecks:[{id:'d1',label:'Took my meds',icon:'pill',at:null},{id:'d2',label:'Stove is off',icon:'flame',at:null},{id:'d3',label:'Door locked',icon:'lock',at:null},{id:'d4',label:'Lights off',icon:'bulb',at:null}],
 doneLog:[],places:[{id:'p1',item:'Spare key',where:'Under the blue flowerpot by the back door',photo:null,at:Date.now()-86400000*2}],cardBest:null});
let S;
try{S=Object.assign(DEF(),JSON.parse(localStorage.getItem(KEY)||'{}'));}catch(e){S=DEF();}
function normLook(){if(!THEMES[S.world]||(THEMES[S.world].kids&&!isKidSetup()))S.world='fantasy';const c=sceneById(S.scene);if(!c||c.theme!==S.world)S.scene=themeScenes(S.world)[0].id;}
normLook();
function rememberLook(){S.looks=Object.assign({},S.looks,{[S.who]:{world:S.world,scene:S.scene}});}
function switchPerson(who){rememberLook();S.who=who;const l=S.looks&&S.looks[who];
  if(l&&THEMES[l.world]){S.world=l.world;S.scene=l.scene;}else if(who==='child'){S.world='kids';S.scene=themeScenes('kids')[0].id;}
  normLook();rememberLook();}
function save(){try{localStorage.setItem(KEY,JSON.stringify(S));}catch(e){toast('Storage is full. Try a smaller photo.');}}

/* ---------------- Helpers ---------------- */
const fmtTime=ts=>new Date(ts).toLocaleTimeString([], {hour:'numeric',minute:'2-digit'});
const fmtDay=ts=>{const d=new Date(ts),n=new Date();return d.toDateString()===n.toDateString()?'Today':d.toLocaleDateString([], {month:'short',day:'numeric'});};
const fmtHM=hm=>{const [h,m]=hm.split(':').map(Number);const d=new Date();d.setHours(h,m,0,0);return fmtTime(d);};
let toastT;
function toast(msg,ms=2600){const t=$('#toast');t.textContent=msg;t.classList.add('show');clearTimeout(toastT);toastT=setTimeout(()=>t.classList.remove('show'),ms);}
let voice=null;
const VOICES=[['af_heart','Warm woman'],['am_michael','Warm man'],['bm_george','Calm older British man'],['bf_emma','Calm British woman'],['af_bella','Cheerful kid-friendly'],['af_nicole','Gentle soft woman'],['am_fenrir','Steady deeper man'],['af_sarah','Bright friendly woman']];
const VSAMPLE='Good morning. Let\u2019s get you ready. Step one: find your keys. They\u2019re usually by the front door.';
let VMAN=null,curAudio=null;
fetch('audio/manifest.json').then(r=>r.ok?r.json():null).then(j=>{VMAN=j;}).catch(()=>{});
function normT(t){return String(t).replace(/[\u2018\u2019]/g,"'").replace(/\s+/g,' ').trim();}
function myVoice(){return (S.voices&&S.voices[S.who])||'af_heart';}
function audioFor(text,vid){if(!VMAN)return null;const h=VMAN.lines[normT(text)];if(!h)return null;const vs=VMAN.voices[vid];return vs&&vs.includes(h)?`audio/${vid}/${h}.mp3`:null;}
function pickVoice(){const v=speechSynthesis.getVoices().filter(x=>/^en/i.test(x.lang));
  const score=x=>(/Natural|Neural|Online/i.test(x.name)?8:0)+(/Google|Samantha|Aria|Jenny|Ava|Serena|Daniel/i.test(x.name)?4:0)+(/en[-_]US/i.test(x.lang)?2:0)+(x.localService?0:1);
  voice=v.sort((a,b)=>score(b)-score(a))[0]||null;}
if('speechSynthesis' in window){pickVoice();speechSynthesis.onvoiceschanged=pickVoice;}
function stopSpeech(){if(curAudio){curAudio.pause();curAudio=null;}try{if('speechSynthesis' in window)speechSynthesis.cancel();}catch(e){}}
function speakTTS(text){if(!('speechSynthesis' in window))return;try{const u=new SpeechSynthesisUtterance(text);u.rate=.92;u.pitch=1;if(voice)u.voice=voice;speechSynthesis.speak(u);}catch(e){}}
function speak(text,show=true,vid){
  if(show)toast(text,Math.max(2600,text.length*70));
  stopSpeech();
  const src=audioFor(text,vid||myVoice());
  if(src){const a=new Audio(src);curAudio=a;a.play().catch(()=>{if(curAudio===a){curAudio=null;speakTTS(text);}});return;}
  speakTTS(text);
}
let actx;
function chime(big){
  if(S.sensory!=='full')return;
  try{actx=actx||new (window.AudioContext||window.webkitAudioContext)();const notes=big?[659,784,988,1319]:[880,1175];
    notes.forEach((f,i)=>{const o=actx.createOscillator(),g=actx.createGain();o.type='sine';o.frequency.value=f;const t=actx.currentTime+i*.12;
    g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.12,t+.02);g.gain.exponentialRampToValueAtTime(.001,t+(big?1.4:.6));o.connect(g).connect(actx.destination);o.start(t);o.stop(t+1.5);});}catch(e){}
}
function applyClasses(){
  const h=document.documentElement;
  h.classList.toggle('ts-large',S.textSize==='large');h.classList.toggle('ts-xl',S.textSize==='xl');
  h.classList.toggle('bad-day',!!S.badDay);
  const rm=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  h.classList.toggle('calm',S.sensory!=='full'||rm);
}
const asWorld=sc=>Object.assign({},sc,{name:THEMES[sc.theme].name,img:sc.f,desc:sc.title});
const W=t=>asWorld(!t||t===S.world?(sceneById(S.scene)||themeScenes(S.world)[0]):(themeScenes(t)[0]||SCENES[0]));
const imgUrl=(n,sm)=>n.startsWith('scenes/')?(sm?`img/scenes/sm/${n.slice(7)}.jpg`:`img/${n}.jpg`):`img/${n}${sm?'_sm':''}.jpg`;

/* Gauge */
let pendingReveal=false;
function addGauge(n,key,label){
  if(key&&S.awarded[key])return;
  if(key)S.awarded[key]=1;
  const before=S.gauge;S.gauge=Math.min(100,S.gauge+n);save();
  if(S.gauge>before){chime(false);if(label!==false)toast(`Your keep glows a little brighter (+${S.gauge-before}%)`,2000);}
  if(S.gauge>=100&&before<100)pendingReveal=true;
}

/* ---------------- Router ---------------- */
function route(){const h=(location.hash||'').replace(/^#\/?/,'');const p=h.split('/').filter(Boolean);return p.length?p:['home'];}
function go(path){location.hash='#/'+path;}
const TABS=[['home','Home','castle'],['practice','Practice','lotus'],['games','Games','puzzle'],['palace','Palace','crown'],['more','More','dots']];

/* ---------------- Screens ---------------- */
const draft={item:'',where:'',photo:null};
let game=null;

function scr_onboard(step){
  const N=7;step=Math.max(1,Math.min(N,step||1));
  const nav=(n)=>go('onboard/'+n);
  const base={noTabs:true,step:{x:step,y:N},topLeft:step>1?'back':'brand',backTo:()=>nav(step-1)};
  const portal=(o)=>Object.assign({size:'small',world:S.world},o);
  if(step===1)return Object.assign(base,{name:'Welcome',portal:{size:'home',world:'fantasy',inner:plantSVG,dim:true},
    guide:'This is the first step. Tap Next when you are ready.',
    body:`<div class="card" style="text-align:center"><span class="steptag">Your keep begins</span><h1>Welcome to Highkeep</h1>
    <p style="font-size:1.25rem">I'll guide you one step at a time.</p><p class="muted">Highkeep holds your lists and reminders, and grows a palace as you go. Nothing is ever lost if you stop.</p></div>`,
    next:()=>nav(2),nextLabel:'Let\u2019s begin'});
  if(step===2){const o=[['me','Myself','person','I want help remembering'],['care','Someone I care for','heart','A parent, partner or friend'],['child','A child','child','Picture routines and calm steps']];
    return Object.assign(base,{name:'Who is this for?',portal:portal({title:'Who is this for?'}),guide:'Tap the one that fits, then tap Next.',
    body:`<div class="choices row3">${o.map(([k,l,i,d])=>`<button class="choice" data-act="who" data-v="${k}" aria-pressed="${S.who===k}">${ic(i)}<span>${l}<small>${d}</small></span></button>`).join('')}</div>`,
    next:()=>nav(3),acts:{who:el=>{switchPerson(el.dataset.v);save();render();}}});}
  if(step===3)return Object.assign(base,{name:'How should I help?',portal:portal({title:'How should I help?'}),guide:'Choose what feels comfortable. You can change these later in More.',
    body:settingsRows(['read','voice','size','sensory']),next:()=>nav(4),acts:settingActs});
  if(step===4)return Object.assign(base,{name:'Pick your world',portal:portal({title:W().name+' world'}),guide:'Tap a world. It shows in the window above. Then tap Next.',
    body:worldPicker(),next:()=>nav(5),acts:settingActs});
  if(step===5)return Object.assign(base,{name:'Your first checklist',portal:portal({title:'Your first checklist'}),guide:'Keep the things you need. Tap the X to remove one, or add your own.',
    body:`<div class="card"><div class="card-h"><h3>Before I leave</h3><span class="count">${S.checklist.length} things</span></div>
    ${S.checklist.map(c=>`<div class="check-row" style="cursor:default"><span class="circle" style="border-color:#d9bd78">${ic('check')}</span><span class="lab">${esc(c.label)}</span>
    <button class="rmv" data-act="rm" data-id="${c.id}" aria-label="Remove ${esc(c.label)}">${ic('x')}</button></div>`).join('')||'<p class="muted">Your list is empty. Add something below.</p>'}
    <div class="field"><input class="input" id="newitem" placeholder="Add a thing, like Phone" aria-label="Add a thing"><button class="btn primary" data-act="add" aria-label="Add">${ic('plus')}Add</button></div>
    <div class="chips">${['Phone','Glasses','Water bottle','Bag'].filter(x=>!S.checklist.some(c=>c.label===x)).map(x=>`<button class="chip" data-act="addq" data-v="${x}">+ ${x}</button>`).join('')}</div></div>`,
    next:()=>nav(6),acts:{rm:el=>{S.checklist=S.checklist.filter(c=>c.id!==el.dataset.id);save();render();},
      add:()=>{const v=$('#newitem').value.trim();if(!v)return toast('Type a thing first, then tap Add.');S.checklist.push({id:'c'+Date.now(),label:v,done:false});save();render();},
      addq:el=>{S.checklist.push({id:'c'+Date.now(),label:el.dataset.v,done:false});save();render();}},
    mount:r=>{const i=$('#newitem',r);i&&i.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();$('[data-act=add]',r).click();}});}});
  if(step===6)return Object.assign(base,{name:'When do you leave?',portal:portal({title:'When do you leave?'}),guide:'Pick the time you usually head out. Your checklist will pop up then.',
    body:`<div class="card" style="text-align:center"><label class="sub" for="lt">I usually leave at</label>
    <input type="time" id="lt" class="input timebig" value="${S.leaveTime}">
    <div class="chips" style="justify-content:center">${['07:30','08:00','08:30','09:00','12:00'].map(t=>`<button class="chip" data-act="lt" data-v="${t}" aria-pressed="${S.leaveTime===t}">${fmtHM(t)}</button>`).join('')}</div>
    <p class="note">Your checklist will pop up at <b>${fmtHM(S.leaveTime)}</b> each day. (In this prototype, it shows on Home.)</p></div>`,
    next:()=>nav(7),acts:{lt:el=>{S.leaveTime=el.dataset.v;save();render();}},
    mount:r=>{$('#lt',r).addEventListener('change',e=>{if(e.target.value){S.leaveTime=e.target.value;save();render();}});}});
  return Object.assign(base,{name:'You\u2019re ready',portal:portal({size:'home',gauge:true}),guide:'Tap Show me around for a quick tour of Home, or skip it.',
    body:`<div class="card" style="text-align:center"><span class="steptag">All set</span><h1>You\u2019re ready</h1>
    <p>Your keep has started. Every thing you check off fills it with golden light.</p>
    <p class="muted">${W().name} world \u00b7 ${S.checklist.length} things on your list \u00b7 leaving at ${fmtHM(S.leaveTime)}</p>
    <button class="btn block" data-act="skip" style="margin-top:6px">Skip the tour</button></div>`,
    nextLabel:'Show me around',next:()=>{S.onboarded=true;save();go('home');setTimeout(startTour,450);},
    acts:{skip:()=>{S.onboarded=true;S.tourDone=true;save();go('home');}}});
}

const settingActs={
  set:el=>{const k=el.dataset.k;let v=el.dataset.v;if(v==='true')v=true;if(v==='false')v=false;S[k]=v;save();applyClasses();render();
    if(k==='readAloud'&&v)speak('Read aloud is on. I will read each step to you.');},
  theme:el=>{const t=el.dataset.v;if(!THEMES[t]||!availThemes().includes(t))return;S.world=t;S.scene=themeScenes(t)[0].id;rememberLook();save();render();},
  scene:el=>{const c=sceneById(el.dataset.v);if(!c||c.theme!==S.world)return;S.scene=c.id;rememberLook();save();render();},
  voice:el=>{S.voices=Object.assign({},S.voices,{[S.who]:el.dataset.v});save();render();speak(VSAMPLE,false,el.dataset.v);},
  vplay:el=>speak(VSAMPLE,false,el.dataset.v)
};
function seg(k,opts){return `<div class="seg" role="group">${opts.map(([v,l])=>`<button data-act="set" data-k="${k}" data-v="${v}" aria-pressed="${String(S[k])===String(v)}">${l}</button>`).join('')}</div>`;}
function settingsRows(which){
  const rows={
    guide:`<div class="setrow"><div class="lbl">${ic('compass')}Step-by-step guide</div>${seg('guide',[[true,'On'],[false,'Off']])}</div>`,
    read:`<div class="setrow"><div class="lbl">${ic('speaker')}Read things aloud</div>${seg('readAloud',[[true,'On'],[false,'Off']])}</div>`,
    size:`<div class="setrow"><div class="lbl">${ic('text')}Text size</div>${seg('textSize',[['normal','Normal'],['large','Large'],['xl','Extra large']])}</div>`,
    sensory:`<div class="setrow"><div class="lbl">${ic('sparkle')}Sounds and motion</div>${seg('sensory',[['calm','Calm'],['full','Full']])}<p class="sub" style="margin-top:6px">${S.sensory==='calm'?'Calm: no sounds, very little movement.':'Full: gentle chimes, shimmer and motion.'}</p></div>`,
    bad:`<div class="setrow"><div class="lbl">${ic('heart')}Bad day mode</div>${seg('badDay',[[true,'On'],[false,'Off']])}</div>`,
    world:`<div class="setrow"><div class="lbl">${ic('image')}World</div>${worldPicker(true)}</div>`,
    voice:`<div class="setrow"><div class="lbl">${ic('speaker')}Reading voice</div><div class="vpick" role="radiogroup" aria-label="Reading voice">${VOICES.map(([id,n])=>`<div class="vrow"><button class="vchoose" role="radio" data-act="voice" data-v="${id}" aria-checked="${myVoice()===id}" aria-pressed="${myVoice()===id}">${n}</button><button class="vplay" data-act="vplay" data-v="${id}" aria-label="Play sample: ${n}">${ic('speaker')}Play</button></div>`).join('')}</div></div>`
  };
  return `<div class="card">${which.map(w=>rows[w]).join('')}</div>`;
}
function worldPicker(inner){
  const kid=isKidSetup(),ts=availThemes(),list=themeScenes(S.world),cur=W();
  const g=`<div class="themes" role="group" aria-label="World type">${ts.map(k=>`<button class="theme" data-act="theme" data-v="${k}" aria-pressed="${S.world===k}">${THEMES[k].name}</button>`).join('')}</div>
  <div class="worlds">${list.map(w=>`<button class="world" data-act="scene" data-v="${w.id}" aria-pressed="${cur.id===w.id}" aria-label="${esc(w.short)}: ${esc(w.title)}"><img src="${imgUrl(w.f,1)}" alt="" style="object-position:${w.pos}" loading="lazy" decoding="async"><span>${esc(w.short)}</span></button>`).join('')}</div>
  <p class="sub" style="margin-top:8px">${esc(cur.desc)}.${kid?' A caregiver can choose for a young child.':''}</p>
  ${kid?'':'<p class="sub tiny-note">Kid-friendly worlds appear when this is set up for a child.</p>'}`;
  return inner?g:`<div class="card">${g}</div>`;
}

function scr_home(){
  const done=S.checklist.filter(c=>c.done).length,n=S.checklist.length;
  const allDone=n>0&&done===n;
  return {name:'Home',tab:'home',portal:{size:'home',world:S.world,gauge:true},topLeft:'brand',
    topRight:`<button class="toggle only-p" data-act="bad" aria-pressed="${!!S.badDay}"><span>Bad day</span><span class="knob"></span></button>`,
    guide:allDone?'All set! You can check things off, or tap a button below.':(S.badDay?'Bad day mode is on. Just your list and the basics. Tap each thing as you pack it.':'Tap each thing on your list as you pack it.'),
    body:`<div class="home-grid"><div><div class="card" id="today"><div class="card-h"><h2>Today</h2><span class="count">${done} of ${n} done</span></div>
      <div class="sub" style="margin:-2px 0 6px">Before you leave \u00b7 ${fmtHM(S.leaveTime)}</div>
      ${S.checklist.map(c=>`<button class="check-row ${c.done?'done':''}" data-act="tick" data-id="${c.id}" aria-pressed="${c.done}"><span class="circle">${ic('check')}</span><span class="lab">${esc(c.label)}</span></button>`).join('')}
      ${allDone?`<p class="note" style="text-align:center;font-size:1.05rem">\u2728 All set. Have a good day!</p>`:''}</div></div>
      <div><div class="tools"><button class="tool toggle toggle-tool only-l" data-act="bad" aria-pressed="${!!S.badDay}"><span>Bad day</span><span class="knob"></span></button>
        <button class="tool" data-act="nav" data-to="donecheck">${ic('shieldcheck')}Done-check</button>
        <button class="tool extra" data-act="nav" data-to="where">${ic('search')}Where is it?</button>
        <button class="tool extra" data-act="nav" data-to="whos">${ic('whos')}Who\u2019s that?</button>
        <button class="tool helpbtn" data-act="help" style="display:${S.badDay?'flex':'none'}">${ic('help')}Help</button>
      </div>
      <div class="card info extra" id="reminder"><span class="ico">${ic('bell')}</span><span class="t"><small>Next reminder</small><strong>Call the dentist \u00b7 2:00 PM</strong></span>
        <button class="iconbtn" data-act="rem" aria-label="Hear this reminder">${ic('play')}</button></div>
      <button class="card info extra" data-act="nav" data-to="whos" style="width:100%;text-align:left;font:inherit"><span class="ico">${ic('star')}</span><span class="t"><small>Weekly challenge</small><strong>Learn 5 names this week</strong><span class="bar"><i style="width:20%"></i></span></span></button>
      </div></div>`,
    acts:{tick:el=>{const c=S.checklist.find(x=>x.id===el.dataset.id);c.done=!c.done;save();if(c.done)addGauge(6,'chk:'+c.id);else render();if(c.done)render();},
      bad:()=>{S.badDay=!S.badDay;save();applyClasses();render();toast(S.badDay?'Bad day mode is on. Just the basics.':'Bad day mode is off.');},
      rem:()=>speak('Reminder. Call the dentist at 2 PM.'),
      help:()=>helpModal()}};
}

function scr_donecheck(){
  const today=S.doneLog.filter(l=>new Date(l.at).toDateString()===new Date().toDateString()).slice().reverse();
  return {name:'Done-check',tab:'home',topLeft:'back',backTo:()=>go('home'),portal:{size:'small',world:S.world,title:'Done-check'},
    guide:'Tap a button right after you do it. I\u2019ll remember the time for you.',
    body:`<div class="card">${S.doneChecks.map(d=>`<button class="check-row ${d.at?'done':''}" data-act="mark" data-id="${d.id}"><span class="circle">${ic('check')}</span><span class="lab">${esc(d.label)}</span><span class="when">${d.at?'Done at '+fmtTime(d.at):'Not yet'}</span></button>`).join('')}
    <div class="field extra"><input class="input" id="newdc" placeholder="Add one, like Fed the cat" aria-label="Add a done-check"><button class="btn primary" data-act="add">${ic('plus')}Add</button></div></div>
    <div class="card"><h3>Today\u2019s record</h3>${today.length?today.map(l=>`<div class="place"><span class="ph">${ic('check')}</span><div><b>${esc(l.label)}</b><small>Done at ${fmtTime(l.at)}</small></div></div>`).join(''):'<p class="muted">Nothing yet today. When you tap a button above, it shows up here with the time.</p>'}</div>`,
    acts:{mark:el=>{const d=S.doneChecks.find(x=>x.id===el.dataset.id);const doIt=()=>{d.at=Date.now();S.doneLog.push({label:d.label,at:d.at});save();addGauge(4,'dc:'+d.id,false);chime(false);render();speak(d.label+'. Done at '+fmtTime(d.at)+'.',true);};
        if(d.at&&new Date(d.at).toDateString()===new Date().toDateString())modal(`<h2>${esc(d.label)}</h2><p style="font-size:1.2rem">You already did this today at <b>${fmtTime(d.at)}</b>.</p><p class="muted">Do you want to mark it done again?</p>`,[['No, leave it',null],['Yes, mark again',doIt,true]]);else doIt();},
      add:()=>{const v=$('#newdc').value.trim();if(!v)return toast('Type it first, then tap Add.');S.doneChecks.push({id:'d'+Date.now(),label:v,icon:'check',at:null});save();render();}}};
}

function scr_where(sub,step){
  if(sub==='add'){
    const N=3;step=Math.max(1,Math.min(N,step||1));
    const base={name:'Save a spot',tab:'home',step:{x:step,y:N},topLeft:'back',backTo:()=>step>1?go('where/add/'+(step-1)):go('where'),portal:{size:'small',world:S.world,title:'Save a spot'}};
    if(step===1)return Object.assign(base,{guide:'What did you put away? Type it or tap one, then tap Next.',
      body:`<div class="card"><h3>What is it?</h3><input class="input" id="wi" style="width:100%;margin-top:10px" placeholder="Like: keys" value="${esc(draft.item)}" aria-label="What is it">
      <div class="chips">${['Keys','Glasses','Phone','Wallet','TV remote','Passport'].map(x=>`<button class="chip" data-act="q" data-v="${x}" aria-pressed="${draft.item===x}">${x}</button>`).join('')}</div></div>`,
      nextDisabled:!draft.item.trim(),next:()=>go('where/add/2'),acts:{q:el=>{draft.item=el.dataset.v;render();}},
      mount:r=>{$('#wi',r).addEventListener('input',e=>{draft.item=e.target.value;$('.stepbar .next').disabled=!draft.item.trim();});}});
    if(step===2)return Object.assign(base,{guide:`Where did you put the ${draft.item.toLowerCase()||'thing'}? Type it or tap one, then tap Next.`,
      body:`<div class="card"><h3>Where is ${esc(draft.item)}?</h3><input class="input" id="ww" style="width:100%;margin-top:10px" placeholder="Like: in the blue jacket pocket" value="${esc(draft.where)}" aria-label="Where is it">
      <div class="chips">${['Kitchen counter','Blue jacket pocket','By the front door','Bedside table','Top drawer'].map(x=>`<button class="chip" data-act="q" data-v="${x}" aria-pressed="${draft.where===x}">${x}</button>`).join('')}</div></div>`,
      nextDisabled:!draft.where.trim(),next:()=>go('where/add/3'),acts:{q:el=>{draft.where=el.dataset.v;render();}},
      mount:r=>{$('#ww',r).addEventListener('input',e=>{draft.where=e.target.value;$('.stepbar .next').disabled=!draft.where.trim();});}});
    return Object.assign(base,{guide:'Add a photo if you like. It is optional. Then tap Save.',
      body:`<div class="card"><h3>Add a photo (optional)</h3><p class="muted">${esc(draft.item)} \u00b7 ${esc(draft.where)}</p>
      <label class="btn block filebtn">${ic('camera')}${draft.photo?'Change photo':'Take or choose a photo'}<input type="file" accept="image/*" id="wp"></label>
      ${draft.photo?`<img class="photo-prev" src="${draft.photo}" alt="Your photo">`:''}</div>`,
      nextLabel:'Save',next:()=>{S.places.unshift({id:'p'+Date.now(),item:draft.item.trim(),where:draft.where.trim(),photo:draft.photo,at:Date.now()});save();addGauge(5,null,false);
        const msg=`Saved. ${draft.item} is ${draft.where.toLowerCase()}.`;draft.item='';draft.where='';draft.photo=null;go('where');setTimeout(()=>speak(msg),50);},
      mount:r=>{$('#wp',r).addEventListener('change',e=>{const f=e.target.files[0];if(!f)return;shrink(f,900).then(d=>{draft.photo=d;render();}).catch(()=>toast('That photo could not be opened.'));});}});
  }
  const q=(window._wq||'').toLowerCase();
  const list=S.places.filter(p=>!q||(p.item+' '+p.where).toLowerCase().includes(q));
  return {name:'Where is it?',tab:'home',topLeft:'back',backTo:()=>go('home'),portal:{size:'small',world:S.world,title:'Where is it?'},
    guide:'Search for a thing, or tap Save a spot when you put something away.',
    body:`<button class="btn primary block" data-act="add" style="margin-bottom:14px">${ic('plus')}Save a spot</button>
    <div class="card"><div class="field" style="margin-top:0"><input class="input" id="wq" type="search" placeholder="Find something, like keys" value="${esc(window._wq||'')}" aria-label="Find something"></div>
    <div id="plist">${placeList(list)}</div></div>`,
    acts:{add:()=>{draft.item='';draft.where='';draft.photo=null;go('where/add/1');},
      open:el=>{const p=S.places.find(x=>x.id===el.dataset.id);modal(`${p.photo?`<img class="photo-prev" style="max-height:300px;margin:0 0 10px" src="${p.photo}" alt="">`:''}<h2>${esc(p.item)}</h2><p style="font-size:1.25rem">${esc(p.where)}</p><p class="muted">Saved ${fmtDay(p.at)} at ${fmtTime(p.at)}</p>`,[['Close',null],['Read it to me',()=>speak(`${p.item}. ${p.where}.`),true,true]]);}},
    mount:r=>{$('#wq',r).addEventListener('input',e=>{window._wq=e.target.value;const q=e.target.value.toLowerCase();$('#plist').innerHTML=placeList(S.places.filter(p=>!q||(p.item+' '+p.where).toLowerCase().includes(q)));});}};
}
function placeList(list){return list.length?list.map(p=>`<button class="place" data-act="open" data-id="${p.id}" style="width:100%;background:none;border-left:0;border-right:0;border-top:0;text-align:left;min-height:64px">
  <span class="ph" style="${p.photo?`background-image:url(${p.photo})`:''}">${p.photo?'':ic('search')}</span><span><b>${esc(p.item)}</b><small>${esc(p.where)} \u00b7 ${fmtDay(p.at)}</small></span></button>`).join(''):'<p class="muted">Nothing found. Try another word, or tap Save a spot.</p>';}
function shrink(file,max){return new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>{const im=new Image();im.onload=()=>{const k=Math.min(1,max/Math.max(im.width,im.height));const c=document.createElement('canvas');c.width=Math.round(im.width*k);c.height=Math.round(im.height*k);c.getContext('2d').drawImage(im,0,0,c.width,c.height);res(c.toDataURL('image/jpeg',.72));};im.onerror=rej;im.src=r.result;};r.onerror=rej;r.readAsDataURL(file);});}

function scr_whos(){
  return {name:'Who\u2019s that?',tab:'home',topLeft:'back',backTo:()=>go('home'),portal:{size:'small',world:S.world,title:'Who\u2019s that?'},
    guide:'Tap a person to hear their name. Adding people is coming soon.',
    body:`<div class="card"><button class="person" data-act="hear" style="background:none;border:0;padding:0;text-align:left;width:100%;min-height:72px"><span class="avatar">M</span><span><b style="font-size:1.35rem">Maria</b><br><span class="muted">Lives next door. Has a dog named Pepper.</span></span></button></div>
    <div class="card"><h3>Weekly challenge</h3><p>Learn 5 names this week. <b>1 of 5</b></p><div class="bar"><i style="width:20%"></i></div>
    <p class="note">Coming soon: add faces with a photo, name and note, then practice them in the Name Game.</p></div>`,
    acts:{hear:()=>speak('This is Maria. She lives next door and has a dog named Pepper.')}};
}

const GAMES=[['cardflip','Card Flip','grid','Match the pairs','star_citadel'],['pack','Pack the Bag','bag','Remember the list','floating_isles'],['simon','Simon Says','sparkle','Repeat the pattern','crystal_cliff'],
 ['changed','What Changed?','eye','Spot the difference','blossom_tree'],['names','Name Game','tag','Faces and names','floating_isles'],['story','Story Recall','book','Listen, then answer','crystal_cliff'],['routine','Routine Builder','list','Put steps in order','blossom_tree']];
function scr_games(){
  return {name:'Games',tab:'games',topLeft:'brand',portal:{size:'small',world:S.world,title:'Games'},
    guide:'Tap a doorway to pick a game. Card Flip is ready to play.',
    body:`<div class="doors">${GAMES.map(([k,n,i,d,img])=>k==='cardflip'?
      `<button class="door play" data-act="play"><span class="dimg" style="background-image:url(${imgUrl(img,1)})"></span><span class="dic">${ic(i)}</span>${n}<small>${d}</small><span class="badge gold">Play</span></button>`:
      `<button class="door soon" data-act="soon" data-n="${n}"><span class="dimg" style="background-image:url(${imgUrl(img,1)})"></span><span class="dic">${ic(i)}</span>${n}<small>${d}</small><span class="badge">Coming soon</span></button>`).join('')}</div>`,
    acts:{play:()=>{game=null;go('game/cardflip/1');},soon:el=>toast(el.dataset.n+' is coming soon.')}};
}
const CICONS=['crown','key','tower','star','moon','lantern','shield','gem'];
function newGame(){const pairs=S.badDay?4:8;const icons=(S.badDay?['crown','key','star','moon']:CICONS.slice(0,8));
  const deck=[...icons,...icons].map((n,i)=>({n,i,up:false,m:false}));for(let i=deck.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[deck[i],deck[j]]=[deck[j],deck[i]];}
  return {deck,first:null,lock:false,tries:0,found:0,pairs,awarded:false,start:Date.now()};}
function scr_cardflip(step){
  const N=3;step=Math.max(1,Math.min(N,step||1));
  if(!game||(step===1))game=game&&step!==1?game:newGame();
  const base={name:'Card Flip',tab:'games',step:{x:step,y:N},topLeft:'back',backTo:()=>step>1?go('game/cardflip/'+(step-1)):go('games'),portal:{size:'small',world:S.world,title:'Card Flip'}};
  if(step===1)return Object.assign(base,{guide:'Read how to play, then tap Start.',
    body:`<div class="card"><span class="steptag">How to play</span><h2>Find the matching pairs</h2>
    <div class="choices" style="margin-top:12px">${[['grid','All the cards start face down.'],['eye','Tap two cards to turn them over.'],['sparkle','If they match, they stay up. If not, they turn back.']].map(([i,t],k)=>`<div class="choice" style="min-height:64px;font-weight:500;font-size:1.08rem">${ic(i)}<span><b>${k+1}.</b> ${t}</span></div>`).join('')}</div>
    <p class="note">${S.badDay?'Bad day mode: 4 pairs with big cards. Take your time.':'Seedling level: 8 pairs on a 4 by 4 board. No timer, no rush.'}</p></div>`,
    nextLabel:'Start',next:()=>{game=newGame();go('game/cardflip/2');}});
  if(step===2){const g=game;return Object.assign(base,{guide:g.first!==null?'Now tap one more card to look for its match.':'Tap any card to turn it over.',
    body:`<div class="card"><div class="statrow"><div><b>${g.found} / ${g.pairs}</b><span class="sub">pairs found</span></div><div><b>${g.tries}</b><span class="sub">tries</span></div></div>
    <div class="flipgrid">${g.deck.map((c,k)=>`<button class="fcard ${c.up?'up':''} ${c.m?'matched':''}" data-act="flip" data-k="${k}" aria-label="${c.up||c.m?c.n:'Face-down card '+(k+1)}"><span class="in"><span class="b">${cardIc('castle')}</span><span class="f">${cardIc(c.n)}</span></span></button>`).join('')}</div></div>`,
    nextLabel:'Finish',nextDisabled:g.found<g.pairs,next:()=>go('game/cardflip/3'),acts:{flip:el=>flip(+el.dataset.k)}});}
  const g=game;if(g.found<g.pairs){setTimeout(()=>go('game/cardflip/1'));}
  if(g.found>=g.pairs&&!g.awarded){g.awarded=true;S.cardBest=S.cardBest?Math.min(S.cardBest,g.tries):g.tries;save();addGauge(20,null,false);chime(true);}
  return Object.assign(base,{guide:'Great work. Tap Play again, or go back to Games.',
    body:`<div class="card" style="text-align:center"><span class="steptag">Results</span><h1>Well done!</h1>
    <p style="font-size:1.2rem">You found all ${g.pairs} pairs in <b>${g.tries}</b> tries.</p>
    <div style="width:150px;margin:6px auto" class="gauge-big mini"><div style="width:110px">${gaugeSVG(S.gauge)}</div><span class="pct">${S.gauge}%</span></div>
    <p>Your keep grew <b>+20%</b> brighter.${S.cardBest?` Best so far: ${S.cardBest} tries.`:''}</p>
    <div class="acts" style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center"><button class="btn primary" data-act="again">${ic('repeat')}Play again</button><button class="btn" data-act="nav" data-to="games">Back to Games</button></div></div>`,
    nextLabel:'Done',next:()=>go('games'),acts:{again:()=>{game=newGame();go('game/cardflip/2');}}});
}
function flip(k){const g=game,c=g.deck[k];if(g.lock||c.up||c.m)return;c.up=true;
  if(g.first===null){g.first=k;render();return;}
  const a=g.deck[g.first];g.tries++;
  if(a.n===c.n){a.m=c.m=true;a.up=c.up=false;g.first=null;g.found++;chime(false);render();
    if(g.found===g.pairs)setTimeout(()=>go('game/cardflip/3'),900);}
  else{g.lock=true;render();setTimeout(()=>{a.up=c.up=false;g.first=null;g.lock=false;render();},S.badDay?1500:1100);}
}

const DRILLS=[['path','Palace walk','Place things along a path in your palace'],['repeat','Spaced review','Quick reviews right before you\u2019d forget'],['list','Real-life lists','Practice your own lists'],['hash','Number recall','Codes and phone numbers, in chunks'],['search','Where was it?','Put things back where they were'],['whos','Name and face','Remember the people you saved'],['link','Story chain','Link a list into a silly story'],['target','Focus warm-up','One minute to get ready'],['moon','Daily recap','Gentle questions at night']];
function scr_practice(){
  return {name:'Practice',tab:'practice',topLeft:'brand',portal:{size:'small',world:S.world,title:'Practice'},
    guide:'These short drills are coming soon. For now, tap Play Card Flip to practice.',
    body:`<button class="btn primary block" data-act="play" style="margin-bottom:14px">${ic('grid')}Play Card Flip instead</button>
    <div class="card">${DRILLS.map(([i,n,d])=>`<div class="info" style="padding:10px 0;border-bottom:1px solid rgba(176,138,60,.2)"><span class="ico">${ic(i)}</span><span class="t"><strong>${n}</strong><small>${d}</small></span><span class="badge">Coming soon</span></div>`).join('')}</div>`,
    acts:{play:()=>{game=null;go('game/cardflip/1');}}};
}

function scr_palace(){
  const lvl=['Seedling','Gardener','Builder','Architect','Palace Keeper'][Math.min(4,S.keeps.length)];
  const keepScene=k=>{const c=sceneById(k.scene);return c&&c.theme===k.world?c:themeScenes(k.world)[0]||SCENES[0];};
  const mine=S.keeps.map((k,i)=>{const c=keepScene(k);return {img:c.f,pos:c.paint,title:`Keep ${i+1} \u00b7 ${THEMES[c.theme].name}`,label:'Built '+fmtDay(k.at)};});
  const paint=(p)=>`<button class="painting" data-act="view" data-img="${p.img}" data-pos="${p.pos}" data-t="${esc(p.title)}"><div class="frame"><img src="${imgUrl(p.img,1)}" alt="" style="object-position:${p.pos}" loading="lazy" decoding="async"></div><span class="plaque"><small>${esc(p.label)}</small>${esc(p.title)}</span></button>`;
  const groups=availThemes().sort((x,y)=>(y===S.world)-(x===S.world)).map(t=>`<details class="gal-group"${t===S.world?' open':''}><summary>${THEMES[t].name}<small>${themeScenes(t).length} scenes</small></summary><div class="gallery">${themeScenes(t).map(c=>paint({img:c.f,pos:c.paint,title:c.title,label:THEMES[t].name})).join('')}</div></details>`).join('');
  return {name:'Palace',tab:'palace',topLeft:'brand',portal:{size:'small',world:S.world,title:'Your Palace'},
    guide:`Your keep is ${S.gauge}% full. When it fills, a painting is revealed and hung in your hall.`,
    body:`<div class="gauge-big" id="biggauge">${gaugeSVG(S.gauge)}<span class="pct">${S.gauge}%</span><span>Level: ${lvl}</span></div>
    <div class="card" style="text-align:center"><p>Every thing you check off, and every game you finish, adds golden light. Missed days never take light away.</p>
    <button class="btn" data-act="demo">${ic('sparkle')}Demo: finish my keep now</button></div>
    <section class="hall"><h2>Gallery hall</h2><p class="sub" style="text-align:center">Your finished keeps hang here. Tap one to step inside.</p>
    ${mine.length?`<div class="gallery">${[...mine].reverse().map(paint).join('')}</div>`:''}<h3 class="gal-h">Example scenes by world</h3>${groups}</section>`,
    acts:{demo:()=>{S.gauge=99;save();addGauge(1,null,false);render();},
      view:el=>{overlay(`<div class="modal-back" data-close><div class="modal" style="width:min(900px,100%);padding:14px"><div class="painting"><div class="frame"><img src="${imgUrl(el.dataset.img)}" alt="" style="aspect-ratio:16/9;object-fit:cover"></div><span class="plaque">${el.dataset.t}</span></div><div class="acts"><button class="btn primary" data-close>Close</button></div></div></div>`);}}};
}

function scr_more(){
  return {name:'More',tab:'more',topLeft:'brand',portal:{size:'small',world:S.world,title:'More'},
    guide:'Change how Highkeep helps you. Your choices are saved right away.',
    body:`<div class="tools" style="grid-template-columns:repeat(2,1fr)">
      <button class="tool" data-act="nav" data-to="donecheck">${ic('shieldcheck')}Done-check</button><button class="tool" data-act="nav" data-to="where">${ic('search')}Where is it?</button>
      <button class="tool" data-act="nav" data-to="whos">${ic('whos')}Who\u2019s that?</button><button class="tool" data-act="tour">${ic('compass')}Replay the tour</button></div>
    <h2 style="margin:6px 4px 10px">Settings</h2>${settingsRows(['guide','read','voice','size','sensory','bad','world'])}
    <div class="card"><div class="setrow"><div class="lbl">${ic('repeat')}Reset prototype</div><p class="sub">Clears everything and starts again from Welcome.</p><button class="btn block" data-act="reset">Reset everything</button></div></div>
    <p class="footer">Highkeep prototype \u00b7 \u00a9 2026 WingsCrew. All rights reserved.</p>`,
    acts:Object.assign({},settingActs,{tour:()=>{go('home');setTimeout(startTour,450);},
      reset:()=>modal('<h2>Reset everything?</h2><p>Your lists, notes, photos and keep will be cleared.</p>',[['Cancel',null],['Yes, reset',()=>{localStorage.removeItem(KEY);location.hash='';location.reload();},true]])})};
}

/* ---------------- Shell ---------------- */
let cur=null,lastKey='';
function getScreen(){
  const r=route();
  if(!S.onboarded&&r[0]!=='onboard'){return scr_onboard(1);}
  switch(r[0]){
    case 'onboard':return scr_onboard(+r[1]||1);
    case 'donecheck':return scr_donecheck();
    case 'where':return scr_where(r[1],+r[2]);
    case 'whos':return scr_whos();
    case 'games':return scr_games();
    case 'game':return scr_cardflip(+r[2]||1);
    case 'practice':return scr_practice();
    case 'palace':return scr_palace();
    case 'more':return scr_more();
    default:return scr_home();
  }
}
function portalHTML(p){
  const w=W(p.world);
  const cls=p.size==='home'?'':'small';
  let inner='';
  if(p.inner)inner+=p.inner;
  if(p.gauge)inner+=`<button class="gauge-medal" data-act="nav" data-to="palace" aria-label="Your keep, ${S.gauge} percent. Open Palace.">${gaugeSVG(S.gauge)}<span class="pill"><span class="pct">${S.gauge}%</span><span class="lbl">your keep</span></span></button>`;
  if(p.title)inner+=`<div class="portal-title"><h1>${esc(p.title)}</h1></div>`;
  const bg=`background-image:${p.dim?'linear-gradient(rgba(40,30,70,.15),rgba(40,30,70,.3)),':''}url(${imgUrl(w.img)});background-position:${w.pos}`;
  return `<div class="arch">${keystone}<div class="portal ${cls}" style="${bg}">${inner}</div></div>`;
}
function guideText(sc){
  const step=sc.step?` Step ${sc.step.x} of ${sc.step.y}.`:'';
  return {where:`You\u2019re on ${sc.name}${/[?.!]$/.test(sc.name)?'':'.'}`,next:sc.guide||'',speech:`You are on ${sc.name}.${step} ${sc.guide||''}`};
}
function render(){
  applyClasses();
  const sc=getScreen();cur=sc;
  const key=location.hash+'|'+sc.name;const same=key===lastKey;
  const cc=$('.content-col');const prevScroll=same?{y:window.scrollY,c:cc?cc.scrollTop:0}:null;
  const g=guideText(sc);
  const top=`<div class="topbar">${sc.topLeft==='back'?`<button class="topbtn" data-act="back" aria-label="Back">${ic('back')}Back</button>`:`<span class="brand">Highkeep</span>`}
    ${sc.topRight||(sc.topLeft==='back'&&!sc.noTabs?`<button class="topbtn" data-act="nav" data-to="home" aria-label="Home">${ic('castle')}Home</button>`:'')}</div>`;
  const guide=`<div class="guide ${S.guide?'':'off'}" id="guide"><span class="gicon">${ic('compass')}</span><div class="gtext">${sc.step?`<span class="gstep">Step ${sc.step.x} of ${sc.step.y}</span>`:''}<b>${esc(g.where)}</b><span class="next">${esc(g.next)}</span></div>
    <button class="whereami" data-act="where" aria-label="Where am I? Read this step aloud">${ic('speaker')}Where<br>am I?</button></div>`;
  const noBack=sc.step&&sc.step.x===1&&route()[0]==='onboard';
  const stepbar=sc.step?`<div class="stepbar ${noBack?'nob':''}">${noBack?'':`<button class="btn back" data-act="back">${ic('back')}Back</button>`}
    <div class="stepcount">Step ${sc.step.x} of ${sc.step.y}<div class="dots">${Array.from({length:sc.step.y},(_,i)=>`<i class="${i<sc.step.x?'on':''}"></i>`).join('')}</div></div>
    <button class="btn primary next" data-act="next" ${sc.nextDisabled?'disabled':''}>${esc(sc.nextLabel||'Next')}${ic('next')}</button></div>`:'';
  const tabs=sc.noTabs?'':`<nav class="tabs" aria-label="Main">${TABS.map(([k,l,i])=>`<button class="tab" data-act="nav" data-to="${k}" ${sc.tab===k?'aria-current="page"':''}>${ic(i)}${l}</button>`).join('')}</nav>`;
  $('#app').innerHTML=`<div class="app ${sc.noTabs?'no-tabs':''}">
    <div class="pillar l"></div><div class="pillar r"></div><div class="frame-lines"></div>${cornerSVG('tl')}${cornerSVG('tr')}${cornerSVG('bl')}${cornerSVG('br')}
    <main class="screen"><section class="portal-col">${top}${portalHTML(sc.portal)}</section>
    <section class="content-col">${guide}<div class="body">${sc.body}</div>${stepbar}</section></main>${tabs}</div>`;
  if(sc.mount)sc.mount($('#app'));
  if(prevScroll){window.scrollTo(0,prevScroll.y);const c2=$('.content-col');if(c2)c2.scrollTop=prevScroll.c;}
  else{window.scrollTo(0,0);if(S.readAloud&&S.guide)speak(g.speech,false);}
  lastKey=key;
  document.title=`${sc.name} \u00b7 Highkeep`;
  if(pendingReveal){pendingReveal=false;setTimeout(reveal,350);}
}
document.addEventListener('click',e=>{
  const el=e.target.closest('[data-act]');if(!el||!$('#app').contains(el))return;
  const a=el.dataset.act;const sc=cur;
  if(sc&&sc.acts&&sc.acts[a])return sc.acts[a](el,e);
  if(a==='nav')return go(el.dataset.to);
  if(a==='back')return sc.backTo?sc.backTo():history.back();
  if(a==='next')return sc.next&&sc.next();
  if(a==='where')return speak(guideText(sc).speech);
});
window.addEventListener('hashchange',render);

/* ---------------- Overlays ---------------- */
function overlay(html){const r=$('#overlay-root');r.innerHTML=html;r.onclick=e=>{if(e.target.hasAttribute('data-close')||e.target.closest('button[data-close]'))r.innerHTML='';};}
function modal(html,btns){overlay(`<div class="modal-back"><div class="modal" role="dialog" aria-modal="true">${html}<div class="acts">${btns.map((b,i)=>`<button class="btn ${b[2]?'primary':''}" data-i="${i}">${b[0]}</button>`).join('')}</div></div></div>`);
  $('#overlay-root').querySelectorAll('[data-i]').forEach(el=>el.onclick=()=>{const b=btns[+el.dataset.i];if(!b[3])$('#overlay-root').innerHTML='';b[1]&&b[1]();});}
function helpModal(){modal(`<div style="color:#3b3f86">${ic('help')}</div><h2>Help is here</h2><p style="font-size:1.15rem">In the full app, this sends a gentle alert to your caregiver so they can check in.</p><p class="muted">This is a prototype, so no alert was sent.</p>`,[['Close',null],['Read my step to me',()=>speak(guideText(cur).speech),true,true]]);}
function reveal(){
  const w=W();
  overlay(`<div class="modal-back reveal-back"><div class="reveal" role="dialog" aria-modal="true"><div class="stage"><div class="shine"></div>${gaugeSVG(100)}
   <div class="painting"><div class="frame"><img src="${imgUrl(w.img)}" alt="Your finished keep" style="object-position:${w.paint}"></div></div></div>
   <h2>Your keep is complete!</h2><p style="font-size:1.15rem">A new painting for your gallery hall.</p>
   <div class="acts" style="display:flex;justify-content:center"><button class="btn primary" id="hang">${ic('sparkle')}Hang it in my hall</button></div></div></div>`);
  const r=$('.reveal');setTimeout(()=>{r.classList.add('open');chime(true);},document.documentElement.classList.contains('calm')?300:1100);
  if(S.readAloud)speak('Your keep is complete! A new painting for your gallery hall.',false);
  $('#hang').onclick=()=>{S.keeps.push({world:S.world,scene:S.scene,at:Date.now()});S.gauge=0;S.awarded={};save();$('#overlay-root').innerHTML='';go('palace');toast('Hung in your gallery hall. A new keep begins!');};
}

/* Tour */
const TOUR=[['.gauge-medal','Your keep','This is your keep. It fills with golden light as you check things off and play. Tap it to see your palace.'],
 ['#today','Today\u2019s list','Tap each thing as you pack it. A gold check means it\u2019s done.'],
 ['.tools','Quick helpers','Done-check remembers what you did. Where is it? remembers where things are. Who\u2019s that? remembers people.'],
 ['[data-act=bad]','Bad day switch','Having a hard day? Turn this on and Highkeep shows only the basics, with bigger buttons.'],
 ['.whereami','Where am I?','Lost? Tap here any time and I\u2019ll read out where you are and what to do next.'],
 ['.tabs','Moving around','Use these to go to Practice, Games, your Palace, and More. Home always brings you back here.']];
let tourI=0;
function startTour(){if(route()[0]!=='home'){go('home');}tourI=0;showTour();}
function showTour(){
  const [sel,t,txt]=TOUR[tourI];const el=[...document.querySelectorAll(sel)].find(e=>e.offsetParent!==null||e.getClientRects().length);if(!el){return endTour();}
  const rcol=el.closest('.content-col');el.scrollIntoView({block:'center',behavior:'auto'});
  setTimeout(()=>{const b=el.getBoundingClientRect();const pad=6;
    const tipBelow=b.top+b.height/2<innerHeight/2;
    overlay(`<div class="tour-spot" style="top:${b.top-pad}px;left:${b.left-pad}px;width:${b.width+pad*2}px;height:${b.height+pad*2}px"></div>
    <div style="position:fixed;inset:0;z-index:69"></div>
    <div class="tour-tip" role="dialog" aria-live="polite" style="${tipBelow?`top:${Math.min(b.bottom+16,innerHeight-230)}px`:`bottom:${Math.min(innerHeight-b.top+16,innerHeight-230)}px`}">
    <span class="steptag">Tour \u00b7 ${tourI+1} of ${TOUR.length}</span><h3>${t}</h3><p>${txt}</p>
    <div class="acts"><button class="btn" id="tskip">Skip tour</button>${tourI>0?`<button class="btn" id="tback">Back</button>`:''}<button class="btn primary" id="tnext">${tourI===TOUR.length-1?'Finish':'Next'}</button></div></div>`);
    $('#tskip').onclick=endTour;$('#tnext').onclick=()=>{tourI++;tourI>=TOUR.length?endTour():showTour();};
    const tb=$('#tback');if(tb)tb.onclick=()=>{tourI--;showTour();};
    if(S.readAloud)speak(t+'. '+txt,false);
  },120);
}
function endTour(){$('#overlay-root').innerHTML='';S.tourDone=true;save();toast('Tour finished. Tap Where am I? any time.');}
window.addEventListener('resize',()=>{if($('.tour-spot'))showTour();});
window.Highkeep={guide:()=>cur&&guideText(cur).speech,TOUR:()=>TOUR,startTour,state:()=>S,flip,reveal,game:()=>game};

render();
})();
