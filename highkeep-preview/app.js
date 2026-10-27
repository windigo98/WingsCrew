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
 home:'<path d="M3 11l9-7 9 7M5 9.5V20h14V9.5"/>',
 apple:'<path d="M12 7c-3-2-8-1-8 4.5C4 16 7.5 21 10 21c1 0 1.4-.5 2-.5s1 .5 2 .5c2.5 0 6-5 6-9.5C20 6 15 5 12 7z"/><path d="M12 7c0-2 1-3.5 3-4"/>',
 leaf:'<path d="M5 19C4 10 10 4 20 4c0 10-6 16-14 15z"/><path d="M5 19c3-5 6-8 10-10"/>',
 flower:'<circle cx="12" cy="12" r="2.4"/><path d="M12 9.6C10.5 7 11 4 12 3c1 1 1.5 4 0 6.6zM14.4 12c2.6-1.5 5.6-1 6.6 0-1 1-4 1.5-6.6 0zM12 14.4c1.5 2.6 1 5.6 0 6.6-1-1-1.5-4 0-6.6zM9.6 12C7 13.5 4 13 3 12c1-1 4-1.5 6.6 0z"/>',
 cake:'<path d="M4 20h16v-6H4zM5 14c0-3 3-4 7-4s7 1 7 4M12 10V6.5M12 3.2c1 1 1 2.4 0 2.4s-1-1.4 0-2.4z"/>',
 cup:'<path d="M5 10h11v4a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5zM16 11h1.5a2.5 2.5 0 0 1 0 5H15.5M8 3.5c-1 1.2 1 2 0 3.5M12 3.5c-1 1.2 1 2 0 3.5"/>',
 tree:'<path d="M12 21v-6M12 15c-4 0-7-2.5-7-6 0-3 2-4.5 4-4.5C10 2.5 14 2.5 15 4.5c2 0 4 1.5 4 4.5 0 3.5-3 6-7 6z"/>',
 boat:'<path d="M3 15h18l-2.5 5h-13zM12 3v12M12 4.5l6 9h-6M12 6.5l-5 7h5"/>',
 fish:'<path d="M3 12c3-5 9-6 14-2l4-3v10l-4-3c-5 4-11 3-14-2zM8 11.5h.01"/>',
 waves:'<path d="M2 8c2.5-2 4.5-2 7 0s4.5 2 7 0 4-1.5 6-.5M2 13c2.5-2 4.5-2 7 0s4.5 2 7 0 4-1.5 6-.5M2 18c2.5-2 4.5-2 7 0s4.5 2 7 0 4-1.5 6-.5"/>',
 bird:'<path d="M3 14c0 4 3.5 6 7.500 6 4 0 7.500-2 8.500-6-3 1-5 0-5-3 0-1.500.800-2.500.800-4.500a4 4 0 0 0-8 .5c0 2.500 1.200 3.500 1.200 5.500C5.500 12.500 3 13 3 14zM17 5.500l3 1.200-3 1.200M13 6.200h.01"/>',
 sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2.5V5M12 19v2.500M2.500 12H5M19 12h2.500M5.300 5.300l1.800 1.800M16.900 16.900l1.800 1.800M5.300 18.700l1.800-1.800M16.900 7.100l1.800-1.800"/>',
 mountain:'<path d="M2 20l7-12 4 6 3-4 6 10z"/><path d="M7 12l2 1.500 1.500-1.500"/>',
 bowl:'<path d="M3 11h18c0 5-3.500 8-9 8s-9-3-9-8zM8 8c-1-1.200 1-2 0-3.500M13 8c-1-1.200 1-2 0-3.500"/>',
 bread:'<path d="M5 20V10c-2-1-3-3-1.500-5C5 3 8 3 12 3s7 0 8.500 2C22 7 21 9 19 10v10z"/>',
 mic:'<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21M8.5 21h7"/>',
 trash:'<path d="M4 7h16M9 7V4.5h6V7M6.5 7l1 13h9l1-13M10 11v6M14 11v6"/>',
 pencil:'<path d="M4 20l1-4.500L16.500 4a2 2 0 0 1 3 3L8 18.500zM14.500 6l3 3"/>',
 copy:'<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/>',
 calendar:'<rect x="3.500" y="5" width="17" height="15.500" rx="2"/><path d="M3.500 10h17M8 3v4M16 3v4"/>',
 undo:'<path d="M9 6L4 11l5 5M4 11h10a5 5 0 0 1 0 10h-4"/>',
 briefcase:'<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M3 13h18"/>'
 ,phone:'<rect x="7" y="2.5" width="10" height="19" rx="2.2"/><path d="M10.5 18.5h3"/>',
 wallet:'<path d="M4 7.5h14a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6.5A2 2 0 0 1 5 4.5h11v3"/><path d="M20 12h-4a1.75 1.75 0 0 0 0 3.5h4z"/>',
 umbrella:'<path d="M3 12a9 9 0 0 1 18 0zM12 12v7a2 2 0 0 1-4 0M12 3V2"/>',
 glasses:'<circle cx="6.5" cy="14" r="3.5"/><circle cx="17.5" cy="14" r="3.5"/><path d="M10 14c1.2-1 2.8-1 4 0M3 13l1.5-5M21 13l-1.5-5"/>',
 bottle:'<path d="M10 2.5h4v3l1.5 2.5V20a1.5 1.5 0 0 1-1.5 1.5h-4A1.5 1.5 0 0 1 8.5 20V8L10 5.5z"/><path d="M8.5 12h7"/>',
 coat:'<path d="M9 3l3 3 3-3 4.5 2.5L21 12l-2.5 1V21h-13v-8L3 12l1.5-6.5zM12 6v15"/>',
 hat:'<path d="M2.5 16.5c2.5 2 16.5 2 19 0-2-1.2-3.5-1.5-4.5-1.5 0-5-2-8-5-8s-5 3-5 8c-1 0-2.5.3-4.5 1.5z"/><path d="M7 14.5c3 .8 7 .8 10 0"/>',
 card:'<rect x="3" y="5.5" width="18" height="13" rx="2"/><path d="M3 10h18M6.5 14.5h4"/>',
 ticket:'<path d="M3 7.5h18v3a1.5 1.5 0 0 0 0 3v3H3v-3a1.5 1.5 0 0 0 0-3z"/><path d="M14.5 8.5v1.5M14.5 11.5v1.5M14.5 14.5v1"/>',
 plug:'<path d="M9 3v4M15 3v4M6.5 7h11v3.5a5.5 5.5 0 0 1-11 0zM12 16v5"/>',
 bed:'<path d="M3 19V6M3 15h18v4M21 15v-3.5a2.5 2.5 0 0 0-2.5-2.5H11v6"/><circle cx="7" cy="11.5" r="2"/>',
 drop:'<path d="M12 3s6.5 7 6.5 11.5a6.5 6.5 0 0 1-13 0C5.5 10 12 3 12 3z"/>',
 shirt:'<path d="M8.5 3.5L4 6l-1.5 4.5 3 1.2v8.8h13v-8.8l3-1.2L20 6l-4.5-2.5a3.5 3.5 0 0 1-7 0z"/>',
 door:'<path d="M6 21V4.5A1.5 1.5 0 0 1 7.5 3h9A1.5 1.5 0 0 1 18 4.5V21M3.5 21h17"/><circle cx="14.8" cy="12.5" r=".9" fill="currentColor"/>',
 bath:'<path d="M3 12h18v2.5a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5zM6 12V5.5a2 2 0 0 1 3.8-.9M7 19.5L6 21.5M17 19.5l1 2M9 7.5h2"/>',
 towel:'<path d="M5 4h11a3 3 0 0 1 3 3v14H8V7a3 3 0 0 0-3-3zM5 4a3 3 0 0 0-3 3v3h6M11 15h5M11 18h5"/>',
 tap:'<path d="M4 7v4M4 9h7V6.5M7.5 6.5h7M11 9h6.5a2.5 2.5 0 0 1 2.5 2.5V13h-4M18 16.5s1.3 1.5 1.3 2.5a1.3 1.3 0 0 1-2.6 0c0-1 1.3-2.5 1.3-2.5z"/>',
 soap:'<rect x="3.5" y="10" width="17" height="10" rx="4"/><circle cx="9" cy="5.5" r="2"/><circle cx="15" cy="4" r="1.3"/><circle cx="14.5" cy="7.5" r="1"/>',
 tooth:'<path d="M7.5 3.5c-2.5 0-4 2-4 4.5 0 3 1.5 4.5 2 7.5.5 3 1 5.5 2.5 5.5s1.8-4 4-4 2.5 4 4 4 2-2.5 2.5-5.5c.5-3 2-4.5 2-7.5 0-2.5-1.5-4.5-4-4.5-1.8 0-2.8 1-4.5 1s-2.7-1-4.5-1z"/>',
 kettle:'<path d="M5 20h12l-1-9a5 5 0 0 0-10 0zM8 6.5a3 3 0 0 1 6 0M16.3 11.5l3.7-3v4l-2.7 2.5"/>',
 brush:'<path d="M3 21L13.5 10.5"/><path d="M12 9l3 3 6-6-3-3z"/><path d="M15 6l3 3"/>',
 grip:'<circle cx="9" cy="6" r="1.3" fill="currentColor"/><circle cx="15" cy="6" r="1.3" fill="currentColor"/><circle cx="9" cy="12" r="1.3" fill="currentColor"/><circle cx="15" cy="12" r="1.3" fill="currentColor"/><circle cx="9" cy="18" r="1.3" fill="currentColor"/><circle cx="15" cy="18" r="1.3" fill="currentColor"/>'
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
let seqId=0;
function stopSpeech(){seqId++;if(curAudio){curAudio.pause();curAudio=null;}try{if('speechSynthesis' in window)speechSynthesis.cancel();}catch(e){}}
function speakTTS(text){if(!('speechSynthesis' in window))return;try{const u=new SpeechSynthesisUtterance(text);u.rate=.92;u.pitch=1;if(voice)u.voice=voice;speechSynthesis.speak(u);}catch(e){}}
function ttsThen(text,done){if(!('speechSynthesis' in window)){setTimeout(done,0);return;}
  try{const u=new SpeechSynthesisUtterance(text);u.rate=.92;u.pitch=1;if(voice)u.voice=voice;u.onend=done;u.onerror=done;speechSynthesis.speak(u);}catch(e){setTimeout(done,0);}}
/* Speak several lines one after another (used by Story Recall). Any other speech cancels the rest. */
function speakSeq(lines){
  stopSpeech();const my=seqId;let i=0;
  const next=()=>{if(my!==seqId||i>=lines.length)return;const t=lines[i++];const src=audioFor(t,myVoice());
    if(src){const a=new Audio(src);curAudio=a;a.onended=next;a.onerror=next;a.play().catch(()=>{if(curAudio===a){curAudio=null;ttsThen(t,next);}});}
    else ttsThen(t,next);};
  next();
}
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
        <button class="tool" data-act="nav" data-to="remind">${ic('bell')}Remind me<span class="rm-dot" style="${rmDueList().length?'':'display:none'}">${rmDueList().length}</span></button>
        <button class="tool" data-act="nav" data-to="donecheck">${ic('shieldcheck')}Done-check</button>
        <button class="tool extra" data-act="nav" data-to="where">${ic('search')}Where is it?</button>
        <button class="tool extra" data-act="nav" data-to="whos">${ic('whos')}Who\u2019s that?</button>
        <button class="tool helpbtn" data-act="help" style="display:${S.badDay?'flex':'none'}">${ic('help')}Help</button>
      </div>
      <div class="card info extra" id="reminder"><button class="rmcard-go" data-act="nav" data-to="remind"><span class="ico">${ic('bell')}</span><span class="t"><small>Next reminder</small><strong>${(()=>{const n=rmNext();return n?esc(n.text.length>34?n.text.slice(0,33)+'\u2026':n.text)+' \u00b7 '+esc(rmWhen(rmFireAt(n))):'Nothing yet. Tap to add one.';})()}</strong></span></button>
        <button class="iconbtn" data-act="rem" aria-label="Hear this reminder">${ic('play')}</button></div>
      <button class="card info extra" data-act="nav" data-to="whos" style="width:100%;text-align:left;font:inherit"><span class="ico">${ic('star')}</span><span class="t"><small>Weekly challenge</small><strong>Learn 5 names this week</strong><span class="bar"><i style="width:20%"></i></span></span></button>
      </div></div>`,
    acts:{tick:el=>{const c=S.checklist.find(x=>x.id===el.dataset.id);c.done=!c.done;save();if(c.done)addGauge(6,'chk:'+c.id);else render();if(c.done)render();},
      bad:()=>{S.badDay=!S.badDay;save();applyClasses();render();toast(S.badDay?'Bad day mode is on. Just the basics.':'Bad day mode is off.');},
      rem:()=>{const n=rmNext();if(n)speakSeq(['Reminder',n.text]);else go('remind');},
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
const PLAYABLE={cardflip:'game/cardflip/1',pack:'game/pack/1',simon:'game/simon/1',changed:'game/changed/1',names:'game/names/1',story:'game/story/1',routine:'game/routine/1'};
function scr_games(){
  return {name:'Games',tab:'games',topLeft:'brand',portal:{size:'small',world:S.world,title:'Games'},
    guide:'Tap a doorway to pick a game. All seven games are ready to play.',
    body:`<div class="doors">${GAMES.map(([k,n,i,d,img])=>PLAYABLE[k]?
      `<button class="door play" data-act="play" data-g="${k}"><span class="dimg" style="background-image:url(${imgUrl(img,1)})"></span><span class="dic">${ic(i)}</span>${n}<small>${d}</small><span class="badge gold">Play</span></button>`:
      `<button class="door soon" data-act="soon" data-n="${n}"><span class="dimg" style="background-image:url(${imgUrl(img,1)})"></span><span class="dic">${ic(i)}</span>${n}<small>${d}</small><span class="badge">Coming soon</span></button>`).join('')}</div>`,
    acts:{play:el=>{game=null;wc=null;wcClear();sr=null;pk=null;sm=null;smClear();nm=null;rt=null;go(PLAYABLE[el.dataset.g]||PLAYABLE.cardflip);},soon:el=>toast(el.dataset.n+' is coming soon.')}};
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

/* ---------------- What Changed? ---------------- */
const WCI=['crown','key','tower','star','moon','lantern','shield','gem','bell','heart','book','compass'];
const WCN={crown:'crown',key:'key',tower:'tower',star:'star',moon:'moon',lantern:'lantern',shield:'shield',gem:'gem',bell:'bell',heart:'heart',book:'book',compass:'compass'};
const WCR=5;
let wc=null,wcT=null;
function wcShuffle(a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function wcRound(kind,slots,nItems){
  const icons=wcShuffle(WCI).slice(0,nItems+1),use=icons.slice(0,nItems),spare=icons[nItems];
  const pos=wcShuffle([...Array(slots).keys()]);const a=Array(slots).fill(null);use.forEach((n,i)=>{a[pos[i]]=n;});
  const filled=pos.slice(0,nItems),empty=pos.slice(nItems);const b=a.slice();let idx,alt=null,from=null;
  if(kind==='swap'){idx=filled[Math.floor(Math.random()*filled.length)];b[idx]=spare;from=a[idx];}
  else if(kind==='missing'){idx=filled[Math.floor(Math.random()*filled.length)];from=a[idx];b[idx]=null;}
  else{const i=filled[Math.floor(Math.random()*filled.length)],j=empty[Math.floor(Math.random()*empty.length)];from=a[i];b[j]=a[i];b[i]=null;idx=j;alt=i;}
  return {kind,a,b,idx,alt,from,to:b[idx]};
}
function newWC(){
  const bad=!!S.badDay,slots=bad?4:6,nItems=bad?3:5;
  const kinds=wcShuffle(['swap','missing','moved',['swap','missing','moved'][Math.floor(Math.random()*3)],['swap','missing','moved'][Math.floor(Math.random()*3)]]);
  return {rounds:kinds.map(k=>wcRound(k,slots,nItems)),r:0,phase:'study',misses:0,spotted:0,done:false,awarded:false,viewMs:bad?10000:6000,slots,bad,res:[],msg:'',pick:-1,gen:0};
}
function wcClear(){clearTimeout(wcT);wcT=null;}
function wcLive(g,phase){return wc===g&&g.phase===phase&&location.hash.indexOf('#/game/changed/2')===0;}
function wcStudy(g){wcClear();g.phase='study';g.gen++;render();wcT=setTimeout(()=>{if(wcLive(g,'study'))wcHide(g);},g.viewMs);}
function wcHide(g){wcClear();g.phase='hidden';render();wcT=setTimeout(()=>{if(wcLive(g,'hidden')){g.phase='choose';g.misses=0;g.msg='';g.pick=-1;render();}},g.bad?1800:1300);}
const WCK={swap:'swapped for something else',missing:'went missing',moved:'moved to a new spot'};
const WCKS={swap:'swapped',missing:'went missing',moved:'moved'};
function wcDesc(rd){const f=WCN[rd.from];
  return rd.kind==='swap'?`The ${f} changed into a ${WCN[rd.to]}.`:rd.kind==='missing'?`The ${f} went missing.`:`The ${f} moved to a new spot.`;}
function wcPick(k){
  const g=wc;if(!g||g.phase!=='choose')return;const rd=g.rounds[g.r];
  if(k===rd.idx||k===rd.alt){g.phase='fb';g.pick=k;g.ok=true;g.res[g.r]=g.misses===0?1:0;if(g.misses===0)g.spotted++;
    g.msg=(g.misses===0?'Well spotted! ':'You found it! ')+wcDesc(rd);chime(false);
    if(S.readAloud)speak(`Well spotted! Something ${WCKS[rd.kind]}.`,false);render();return;}
  g.misses++;g.pick=k;
  if(g.misses>=2){g.phase='fb';g.ok=false;g.res[g.r]=0;g.msg='Good try. '+wcDesc(rd);
    if(S.readAloud)speak(`Good try. Something ${WCKS[rd.kind]}. It is glowing now.`,false);}
  else{g.msg='Not that one. Take another look and try again.';}
  render();
}
function wcSlot(c,k,cls,attrs,label){
  if(cls.includes('back'))return `<span class="wslot back ${cls}" ${attrs}><span class="in"><span class="b">${cardIc('castle')}</span></span></span>`;
  return `<${attrs.includes('data-act')?'button':'span'} class="wslot ${c?'':'empty'} ${cls}" ${attrs} aria-label="${label}">${c?`<span class="f">${cardIc(c)}</span>`:'<span class="f"></span>'}</${attrs.includes('data-act')?'button':'span'}>`;
}
function scr_changed(step){
  const N=3;step=Math.max(1,Math.min(N,step||1));
  const base={name:'What Changed?',tab:'games',step:{x:step,y:N},topLeft:'back',backTo:()=>{wcClear();step>1?go('game/changed/'+(step-1)):go('games');},portal:{size:'small',world:S.world,title:'What Changed?'}};
  if(step===1){wcClear();return Object.assign(base,{guide:'Read how to play, then tap Start.',
    body:`<div class="card"><span class="steptag">How to play</span><h2>Spot the one thing that changed</h2>
    <div class="choices" style="margin-top:12px">${[['eye','Look at the picture. Remember where each thing is.'],['moon','The picture hides for a moment.'],['search','It comes back with one change. Tap what changed.']].map(([i,t],k)=>`<div class="choice" style="min-height:64px;font-weight:500;font-size:1.08rem">${ic(i)}<span><b>${k+1}.</b> ${t}</span></div>`).join('')}</div>
    <p class="note">${S.badDay?'Bad day mode: fewer things and more time to look. 5 rounds, no rush.':'Seedling level: 5 things, 5 rounds. No timer, no rush.'}</p></div>`,
    nextLabel:'Start',next:()=>{wc=newWC();go('game/changed/2');wcStudy(wc);}});}
  if(step===2){
    if(!wc){setTimeout(()=>go('game/changed/1'));return Object.assign(base,{guide:'Read how to play, then tap Start.',body:'<div class="card"></div>',nextLabel:'Finish',nextDisabled:true,next:()=>{}});}
    const g=wc,rd=g.rounds[g.r],ph=g.phase;
    const guides={study:'Remember where each thing is. Tap I am ready when you can.',hidden:'The picture is hiding. Think about where each thing was.',choose:g.misses?g.msg:'Tap the thing that changed.',fb:g.msg};
    const scene=ph==='study'?rd.a:rd.b;
    let cells='';
    scene.forEach((c,k)=>{
      if(ph==='hidden')cells+=wcSlot(c,k,'back','','');
      else if(ph==='study')cells+=wcSlot(c,k,'','',c?WCN[c]:'Empty spot');
      else{let cls='';if(ph==='fb'&&k===rd.idx)cls='glow';else if(g.pick===k&&ph==='choose')cls='miss';
        cells+=wcSlot(c,k,cls,ph==='choose'?`data-act="wcpick" data-k="${k}"`:'',(c?WCN[c]:'Empty spot')+(ph==='choose'?'. Tap if this changed.':''));}
    });
    const last=g.r===WCR-1;
    const more=ph==='study'?`<button class="btn wcmore" data-act="wcmore">${ic('clock')}More time</button>`:'';
    const bar=ph==='study'?`<div class="wcbar" aria-hidden="true"><i style="animation-duration:${g.viewMs}ms" data-gen="${g.gen}"></i></div>`:'<div class="wcbar off" aria-hidden="true"></div>';
    const nextLabel=ph==='study'?'I am ready':ph==='fb'?(last?'See results':'Next round'):ph==='hidden'?'Wait...':'Tap a spot';
    return Object.assign(base,{guide:guides[ph],
      body:`<div class="card wc"><div class="statrow wcstat"><div><b>Round ${g.r+1} / ${WCR}</b></div>${more}<div aria-label="${g.spotted} spotted"><b>${g.spotted}</b><span class="sub">spotted</span></div></div>
      ${bar}<div class="wcgrid ${g.bad?'bad':''} ph-${ph}" role="group" aria-label="Scene">${cells}</div>
      <p class="wcsr" aria-live="polite">${esc(ph==='fb'||(ph==='choose'&&g.misses)?g.msg:ph==='hidden'?'Hidden for a moment':'')}</p></div>`,
      mount:()=>{setTimeout(()=>{if(window.matchMedia('(orientation:landscape) and (max-height:560px)').matches)return;const gd=$('#guide');if(gd)window.scrollTo(0,Math.max(0,gd.getBoundingClientRect().top+window.scrollY-10));},0);},
      nextLabel,nextDisabled:!(ph==='study'||ph==='fb'),
      next:()=>{if(ph==='study'){if(wcLive(g,'study'))wcHide(g);}
        else if(ph==='fb'){if(g.phase!=='fb')return;if(last){g.done=true;go('game/changed/3');}else{g.r++;g.msg='';g.misses=0;g.pick=-1;wcStudy(g);}}},
      acts:{wcpick:el=>wcPick(+el.dataset.k),wcmore:()=>{if(wcLive(g,'study')){g.viewMs=5000;wcStudy(g);}}}});
  }
  const g=wc;if(!g||!g.done){setTimeout(()=>go('game/changed/1'));return Object.assign(base,{guide:'Read how to play, then tap Start.',body:'<div class="card"></div>',nextLabel:'Done',next:()=>go('games')});}
  if(!g.awarded){g.awarded=true;S.changedBest=Math.max(S.changedBest||0,g.spotted);save();addGauge(20,null,false);chime(true);}
  return Object.assign(base,{guide:'Great work. Tap Play again, or go back to Games.',
    body:`<div class="card" style="text-align:center"><span class="steptag">Results</span><h1>Well done!</h1>
    <p style="font-size:1.2rem">You spotted <b>${g.spotted}</b> of ${WCR} changes on the first look. Every round counts.</p>
    <div style="width:150px;margin:6px auto" class="gauge-big mini"><div style="width:110px">${gaugeSVG(S.gauge)}</div><span class="pct">${S.gauge}%</span></div>
    <p>Your keep grew <b>+20%</b> brighter.${S.changedBest?` Best so far: ${S.changedBest} of ${WCR}.`:''}</p>
    <div class="acts" style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center"><button class="btn primary" data-act="again">${ic('repeat')}Play again</button><button class="btn" data-act="nav" data-to="games">Back to Games</button></div></div>`,
    nextLabel:'Done',next:()=>go('games'),acts:{again:()=>{wc=newWC();go('game/changed/2');wcStudy(wc);}}});
}

/* ---------------- Story Recall ---------------- */
const srQ=(q,opts,fact)=>({q,opts,fact});
const STORIES=[
 {id:'market',title:'A Trip to the Market',
  full:'Rosa walked to the market on a sunny morning. She bought a basket of red apples. A kind baker gave her a warm roll. Then Rosa carried everything home.',
  short:'Rosa walked to the market on a sunny morning. She bought a basket of red apples.',
  who:srQ('Who was the story about?',[['Rosa','person'],['Tom','person'],['Nina','person']],'The story was about Rosa.'),
  what:srQ('What did Rosa buy?',[['Red apples','apple'],['Sweet pears','leaf'],['Fresh fish','fish']],'Rosa bought red apples.'),
  where:srQ('Where did Rosa go?',[['The market','bag'],['The library','book'],['The beach','waves']],'Rosa went to the market.')},
 {id:'garden',title:'In the Garden',
  full:'Sam went out to the garden after breakfast. He watered the yellow sunflowers with a green can. A little bee buzzed around his hat. Sam smiled and sat down in the shade.',
  short:'Sam went out to the garden after breakfast. He watered the yellow sunflowers.',
  who:srQ('Who was the story about?',[['Sam','person'],['Jack','person'],['Paul','person']],'The story was about Sam.'),
  what:srQ('What did Sam water?',[['Yellow sunflowers','sun'],['Red roses','flower'],['Tall tomatoes','apple']],'Sam watered the yellow sunflowers.'),
  where:srQ('Where did Sam go?',[['The garden','leaf'],['The shop','bag'],['The train station','clock']],'Sam went out to the garden.')},
 {id:'lighthouse',title:'The Lighthouse Keeper',
  full:'Old Henry kept a white lighthouse by the sea. Every evening he climbed the stairs to light the big lamp. Boats far away could see the light and sail home safely. Then he drank a cup of tea and watched the stars.',
  short:'Old Henry kept a white lighthouse by the sea. Every evening he climbed the stairs to light the big lamp.',
  who:srQ('Who was the story about?',[['Henry','person'],['Walter','person'],['George','person']],'The story was about Henry.'),
  what:srQ('What did Henry do every evening?',[['Lit the big lamp','lantern'],['Painted a boat','boat'],['Fed the seagulls','bird']],'Henry lit the big lamp every evening.'),
  where:srQ('Where was the lighthouse?',[['By the sea','waves'],['On a mountain','mountain'],['In a busy town','home']],'The lighthouse was by the sea.')},
 {id:'baking',title:'Baking Day',
  full:'Grandma Ruth put on her blue apron in the kitchen. She mixed flour, eggs and sugar in a big bowl. Soon the whole house smelled of warm cinnamon cake. She shared a slice with her neighbor.',
  short:'Grandma Ruth put on her blue apron in the kitchen. She baked a warm cinnamon cake.',
  who:srQ('Who was the story about?',[['Grandma Ruth','person'],['Aunt May','person'],['Uncle Joe','person']],'The story was about Grandma Ruth.'),
  what:srQ('What did Ruth bake?',[['A cinnamon cake','cake'],['An apple pie','apple'],['Bread rolls','bread']],'Ruth baked a cinnamon cake.'),
  where:srQ('Where did Ruth bake?',[['In the kitchen','home'],['In the garden','leaf'],['On the porch','key']],'Ruth baked in the kitchen.')},
 {id:'library',title:'A Rainy Afternoon',
  full:'Leo walked to the library on a rainy afternoon. He picked a big book about birds. Then he found a cozy chair by the window. He read until the rain stopped.',
  short:'Leo walked to the library on a rainy afternoon. He picked a big book about birds.',
  who:srQ('Who was the story about?',[['Leo','person'],['Max','person'],['Owen','person']],'The story was about Leo.'),
  what:srQ('What kind of book did Leo pick?',[['A book about birds','bird'],['A book about trains','clock'],['A book about cooking','cup']],'Leo picked a book about birds.'),
  where:srQ('Where did Leo go?',[['The library','book'],['The pool','waves'],['The bakery','bread']],'Leo went to the library.')},
 {id:'lake',title:'A Walk by the Lake',
  full:'Maya went for a walk by the lake at sunset. Two white ducks swam close to the shore. She sat on a wooden bench and listened to the water. The sky turned orange and pink.',
  short:'Maya went for a walk by the lake at sunset. Two white ducks swam close to the shore.',
  who:srQ('Who was the story about?',[['Maya','person'],['Lily','person'],['Zoe','person']],'The story was about Maya.'),
  what:srQ('What did Maya see on the water?',[['Two white ducks','bird'],['A red boat','boat'],['A big fish','fish']],'Maya saw two white ducks.'),
  where:srQ('Where did Maya walk?',[['By the lake','waves'],['In the forest','tree'],['Along a road','path']],'Maya walked by the lake.')},
 {id:'picnic',title:'A Picnic in the Park',
  full:'Ben and his sister packed a picnic and went to the park. They spread a red blanket under a tall oak tree. They ate sandwiches and sipped cold lemonade. A friendly dog came to say hello.',
  short:'Ben and his sister had a picnic in the park. They sipped cold lemonade under a tall oak tree.',
  who:srQ('Who was the story about?',[['Ben and his sister','child'],['Carl and his dad','person'],['Eli and his friend','person']],'The story was about Ben and his sister.'),
  what:srQ('What did they drink?',[['Cold lemonade','sun'],['Hot cocoa','cup'],['Warm milk','moon']],'They sipped cold lemonade.'),
  where:srQ('Where did they have a picnic?',[['The park','tree'],['The beach','waves'],['The school','book']],'They had a picnic in the park.')},
 {id:'tea',title:'A Cozy Day at Home',
  full:'Nora stayed home on a rainy day. She made a pot of peppermint tea. Her gray cat curled up on her lap. They watched the raindrops on the window.',
  short:'Nora stayed home on a rainy day. She made a pot of peppermint tea.',
  who:srQ('Who was the story about?',[['Nora','person'],['Ella','person'],['Anna','person']],'The story was about Nora.'),
  what:srQ('What did Nora make?',[['Peppermint tea','cup'],['Chicken soup','bowl'],['Fresh toast','bread']],'Nora made peppermint tea.'),
  where:srQ('Where did Nora stay?',[['At home','home'],['At school','book'],['At the shop','bag']],'Nora stayed at home.')}
];
let sr=null;
function srShuffle(a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function srMakeQ(q){const opts=srShuffle(q.opts.map((o,i)=>({t:o[0],i:o[1],ok:i===0})));return {q:q.q,fact:q.fact,opts};}
function newSR(){
  const bad=!!S.badDay,last=Array.isArray(S.storyLast)?S.storyLast:[];
  let avail=STORIES.filter(x=>!last.includes(x.id));if(avail.length<3)avail=STORIES.slice();
  const picked=srShuffle(avail).slice(0,3);S.storyLast=picked.map(x=>x.id);save();
  const kinds=bad?['who','what']:['who','what','where'];
  const items=picked.map(st=>({id:st.id,title:st.title,text:bad?st.short:st.full,qs:kinds.map(k=>srMakeQ(st[k]))}));
  return {items,si:0,qi:0,phase:'listen',misses:0,tried:[],right:0,total:items.length*kinds.length,bad,msg:'',ok:false,done:false,awarded:false,played:false,pick:-1};
}
function srQCur(g){return g.items[g.si].qs[g.qi];}
function srReplay(){if(sr)speakSeq([sr.items[sr.si].text]);}
function srPick(k){
  const g=sr;if(!g||g.phase!=='ask'||g.tried.includes(k))return;const q=srQCur(g),o=q.opts[k];if(!o)return;
  g.pick=k;
  if(o.ok){g.phase='fb';g.ok=true;if(g.misses===0)g.right++;g.msg='Yes, that\u2019s right! '+q.fact;chime(false);
    if(S.readAloud)speak('Yes, that\u2019s right!',false);render();return;}
  g.tried.push(k);g.misses++;
  if(g.misses>=2){g.phase='fb';g.ok=false;g.msg='Good try. '+q.fact+' Here is the story again.';
    if(S.readAloud)speakSeq(['Good try. Here is the story again.',g.items[g.si].text]);}
  else{g.msg='Not quite. Listen once more.';if(S.readAloud)speakSeq(['Not quite. Listen once more.',g.items[g.si].text]);}
  render();
}
function srAdvance(){
  const g=sr;if(!g||g.phase!=='fb')return;const it=g.items[g.si];
  if(g.qi<it.qs.length-1){g.qi++;g.phase='ask';g.tried=[];g.misses=0;g.pick=-1;g.msg='';render();if(S.readAloud)speak(srQCur(g).q,false);return;}
  if(g.si<g.items.length-1){g.si++;g.qi=0;g.phase='listen';g.tried=[];g.misses=0;g.pick=-1;g.msg='';g.played=false;render();return;}
  g.done=true;go('game/story/3');
}
function scr_story(step){
  const N=3;step=Math.max(1,Math.min(N,step||1));
  const base={name:'Story Recall',tab:'games',step:{x:step,y:N},topLeft:'back',backTo:()=>{stopSpeech();step>1?go('game/story/'+(step-1)):go('games');},portal:{size:'small',world:S.world,title:'Story Recall'}};
  if(step===1)return Object.assign(base,{guide:'Read how to play, then tap Start.',
    body:`<div class="card"><span class="steptag">How to play</span><h2>Listen, then remember</h2>
    <div class="choices" style="margin-top:12px">${[['speaker','Listen to a short, warm story. You can read it too.'],['repeat','Tap Replay to hear it again, as often as you like.'],['search','Answer by tapping a picture. No typing.']].map(([i,t],k)=>`<div class="choice" style="min-height:64px;font-weight:500;font-size:1.08rem">${ic(i)}<span><b>${k+1}.</b> ${t}</span></div>`).join('')}</div>
    <p class="note">${S.badDay?'Bad day mode: shorter stories and 2 easy questions each. No rush.':'Seedling level: 3 short stories, 3 questions each. No timer, no rush.'}</p></div>`,
    nextLabel:'Start',next:()=>{sr=newSR();go('game/story/2');}});
  if(step===2){
    if(!sr){setTimeout(()=>go('game/story/1'));return Object.assign(base,{guide:'Read how to play, then tap Start.',body:'<div class="card"></div>',nextLabel:'Finish',nextDisabled:true,next:()=>{}});}
    const g=sr,it=g.items[g.si],ph=g.phase,q=ph==='listen'?null:srQCur(g),nQ=it.qs.length;
    const guide=ph==='listen'?'Listen to the story, then tap Questions.':
      ph==='ask'?(g.misses?'Not quite. Listen once more, then try again.':'Tap the answer you remember.'):
      (g.ok?'Well done. Tap Next when you are ready.':'Good try. The answer is glowing. Tap Next when you are ready.');
    const stat=`<div class="statrow srstat"><div><b>Story ${g.si+1} / ${g.items.length}</b></div>${q?`<div><b>Question ${g.qi+1} / ${nQ}</b></div>`:''}<div aria-label="${g.right} right on the first try"><b>${g.right}</b><span class="sub">first try</span></div><button class="btn srrep-top" data-act="srreplay" aria-label="Replay story">${ic('speaker')}<span>Replay</span></button></div>`;
    const rep=`<button class="btn block srrep ${ph==='listen'||g.misses?'primary':''}" data-act="srreplay">${ic('speaker')}Replay story</button>`;
    let inner;
    if(ph==='listen')inner=`<span class="steptag">Listen</span><h2 class="srtitle">${esc(it.title)}</h2><p class="srtext">${esc(it.text)}</p>${rep}`;
    else{
      const showStory=ph==='fb'&&!g.ok;
      const opts=q.opts.map((o,k)=>{let cls='';if(ph==='fb'&&o.ok)cls='right';else if(g.tried.includes(k))cls='tried';
        return `<button class="choice src ${cls}" data-act="srpick" data-k="${k}" ${g.tried.includes(k)?'disabled':''} ${ph==='fb'?'aria-disabled="true"':''} aria-label="${esc(o.t)}${o.ok&&ph==='fb'?'. This is the answer.':''}">${ic(o.i)}<span>${esc(o.t)}</span></button>`;}).join('');
      inner=`${showStory?`<div class="srreview"><span class="steptag">The story again</span><p class="srtext">${esc(it.text)}</p></div>`:''}
        <h2 class="srq">${esc(q.q)}</h2><div class="srch">${opts}</div>
        <p class="srmsg ${ph==='fb'?(g.ok?'ok':'soft'):(g.misses?'soft':'')}" aria-live="polite">${esc(g.msg)}</p>${rep}`;
    }
    const last=g.si===g.items.length-1&&(q&&g.qi===nQ-1);
    const nextLabel=ph==='listen'?'Questions':ph==='ask'?'Pick one':(last?'See results':(g.qi===nQ-1?'Next story':'Next'));
    return Object.assign(base,{guide,
      body:`<div class="card srcard">${stat}${inner}</div>`,
      mount:()=>{
        if(ph==='listen'&&!g.played){g.played=true;const fresh=(location.hash+'|Story Recall')!==lastKey,text=it.text;
          setTimeout(()=>{if(sr!==g||g.phase!=='listen'||!S.readAloud)return;const my=seqId;
            if(fresh&&S.guide&&curAudio){curAudio.addEventListener('ended',()=>{if(my===seqId&&sr===g&&g.phase==='listen')speakSeq([text]);});}
            else speakSeq([text]);},0);}
        setTimeout(()=>{if(window.matchMedia('(orientation:landscape) and (max-height:560px)').matches){if(ph==='fb'){const bd=$('.content-col .body'),rt=$('.choice.right');if(bd&&rt)bd.scrollTop+=rt.getBoundingClientRect().top-bd.getBoundingClientRect().top-8;}return;}const gd=$('#guide');if(gd)window.scrollTo(0,Math.max(0,gd.getBoundingClientRect().top+window.scrollY-10));},0);},
      nextLabel,nextDisabled:ph==='ask',
      next:()=>{if(ph==='listen'){if(sr!==g||g.phase!=='listen')return;g.phase='ask';g.tried=[];g.misses=0;g.pick=-1;g.msg='';render();if(S.readAloud)speak(srQCur(g).q,false);}else if(ph==='fb')srAdvance();},
      acts:{srpick:el=>srPick(+el.dataset.k),srreplay:()=>srReplay()}});
  }
  const g=sr;if(!g||!g.done){setTimeout(()=>go('game/story/1'));return Object.assign(base,{guide:'Read how to play, then tap Start.',body:'<div class="card"></div>',nextLabel:'Done',next:()=>go('games')});}
  if(!g.awarded){g.awarded=true;const b=S.storyBest;if(!b||g.right/g.total>b.c/b.n)S.storyBest={c:g.right,n:g.total};save();addGauge(20,null,false);chime(true);}
  const b=S.storyBest;
  return Object.assign(base,{guide:'Great work. Tap Play again, or go back to Games.',
    body:`<div class="card" style="text-align:center"><span class="steptag">Results</span><h1>Well done!</h1>
    <p style="font-size:1.2rem">You remembered <b>${g.right}</b> of ${g.total} answers on the first try. Every try counts.</p>
    <div style="width:150px;margin:6px auto" class="gauge-big mini"><div style="width:110px">${gaugeSVG(S.gauge)}</div><span class="pct">${S.gauge}%</span></div>
    <p>Your keep grew <b>+20%</b> brighter.${b?` Best so far: ${b.c} of ${b.n}.`:''}</p>
    <div class="acts" style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center"><button class="btn primary" data-act="again">${ic('repeat')}Play again</button><button class="btn" data-act="nav" data-to="games">Back to Games</button></div></div>`,
    nextLabel:'Done',next:()=>go('games'),acts:{again:()=>{sr=newSR();go('game/story/2');}}});
}

/* ================= New games: shared helpers ================= */
/* Same look and flow as Card Flip, What Changed? and Story Recall: step 1 how to play, step 2 play, step 3 results (+20% keep). */
function gHow(title,steps,note){return `<div class="card"><span class="steptag">How to play</span><h2>${title}</h2>
    <div class="choices" style="margin-top:12px">${steps.map(([i,t],k)=>`<div class="choice" style="min-height:64px;font-weight:500;font-size:1.08rem">${ic(i)}<span><b>${k+1}.</b> ${t}</span></div>`).join('')}</div>
    <p class="note">${note}</p></div>`;}
function gResults(line,best){return `<div class="card" style="text-align:center"><span class="steptag">Results</span><h1>Well done!</h1>
    <p style="font-size:1.2rem">${line}</p>
    <div style="width:150px;margin:6px auto" class="gauge-big mini"><div style="width:110px">${gaugeSVG(S.gauge)}</div><span class="pct">${S.gauge}%</span></div>
    <p>Your keep grew <b>+20%</b> brighter.${best?' '+best:''}</p>
    <div class="acts" style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center"><button class="btn primary" data-act="again">${ic('repeat')}Play again</button><button class="btn" data-act="nav" data-to="games">Back to Games</button></div></div>`;}
const G_START='Read how to play, then tap Start.',G_END='Great work. Tap Play again, or go back to Games.';
function gStub(base,label){return Object.assign(base,{guide:G_START,body:'<div class="card"></div>',nextLabel:label||'Finish',nextDisabled:true,next:()=>{}});}
function gLive(r){return location.hash.indexOf('#/game/'+r+'/2')===0;}
function gSay(t){if(S.readAloud)speak(t,false);}
function gSaySeq(lines){if(S.readAloud)speakSeq(lines);}
/* Run fn after the spoken "You are on ..." guide finishes (so game speech does not cut it off). */
function gAfterGuide(fn){setTimeout(()=>{
  if(!S.readAloud||!S.guide)return fn();const my=seqId;
  if(curAudio){const a=curAudio;let done=false;const go2=()=>{if(done)return;done=true;if(my===seqId)fn();};a.addEventListener('ended',go2);a.addEventListener('error',go2);setTimeout(()=>{if(a.paused&&!a.ended)go2();},9000);return;}
  if('speechSynthesis' in window&&(speechSynthesis.speaking||speechSynthesis.pending)){let n=0;const iv=setInterval(()=>{n++;if(my!==seqId){clearInterval(iv);return;}
    if(!speechSynthesis.speaking&&!speechSynthesis.pending||n>60){clearInterval(iv);fn();}},250);return;}
  fn();},0);}
function gScroll(){setTimeout(()=>{if(window.matchMedia('(orientation:landscape) and (max-height:560px)').matches)return;const gd=$('#guide');if(gd)window.scrollTo(0,Math.max(0,gd.getBoundingClientRect().top+window.scrollY-10));},0);}
const gShuf=srShuffle;
function gList(a){return a.length<2?a.join(''):a.slice(0,-1).join(', ')+' and '+a[a.length-1];}

/* ================= Pack the Bag ================= */
const PK_ITEMS={keys:['Keys','key'],wallet:['Wallet','wallet'],meds:['Meds','pill'],phone:['Phone','phone'],umbrella:['Umbrella','umbrella'],glasses:['Glasses','glasses'],
 water:['Water bottle','bottle'],coat:['Coat','coat'],hat:['Sun hat','hat'],snack:['Snack','apple'],book:['Book','book'],list:['Shopping list','list'],pass:['Bus pass','card'],
 tickets:['Tickets','ticket'],charger:['Charger','plug'],bag:['Shopping bag','bag'],suncream:['Sun cream','sun'],mug:['Travel mug','cup']};
/* First items are the most important: Bad day keeps only the first 3. */
const PK_TRIPS=[
 {id:'doctor',title:'A visit to the doctor',i:'heart',items:['meds','keys','phone','glasses','wallet']},
 {id:'rain',title:'A walk in the rain',i:'umbrella',items:['umbrella','coat','keys','phone','pass']},
 {id:'shop',title:'Going to the shop',i:'bag',items:['wallet','list','bag','keys','phone']},
 {id:'park',title:'A sunny day at the park',i:'sun',items:['water','hat','snack','suncream','phone']},
 {id:'train',title:'A train trip',i:'ticket',items:['tickets','phone','wallet','charger','book']},
 {id:'cafe',title:'Coffee with a friend',i:'cup',items:['wallet','phone','keys','glasses','mug']}];
const PK_G={study:'Look at what you need. Tap I am ready when you can.',pick:'Tap each thing you need. Then tap Check my bag.',ok:'All packed! Tap Next when you are ready.',soft:'Good try. Tap Next when you are ready.'};
let pk=null;
function newPK(){const bad=!!S.badDay,n=bad?3:5,rounds=bad?2:3;
  const last=Array.isArray(S.packLast)?S.packLast:[];let av=PK_TRIPS.filter(t=>!last.includes(t.id));if(av.length<rounds)av=PK_TRIPS.slice();
  const trips=gShuf(av).slice(0,rounds).map(t=>{const need=t.items.slice(0,n);const others=gShuf(Object.keys(PK_ITEMS).filter(k=>!t.items.includes(k))).slice(0,n);
    return {id:t.id,title:t.title,i:t.i,need,opts:gShuf([...need,...others])};});
  S.packLast=trips.map(t=>t.id);save();
  return {trips,r:0,phase:'study',sel:[],got:0,total:0,perfect:0,bad,msg:'',ok:false,done:false,awarded:false,said:-1};}
function pkTile(k,cls,attrs,extra){const [l,i]=PK_ITEMS[k];return `<${attrs?'button':'div'} class="pktile ${cls}" ${attrs||''}><span class="pkic">${cardIc(i)}</span><span class="pkl">${esc(l)}</span>${extra||''}</${attrs?'button':'div'}>`;}
function pkStudySay(g){const t=g.trips[g.r];gSaySeq([t.title+'. Pack these things.',...t.need.map(k=>PK_ITEMS[k][0]+'.')]);}
function pkCheck(){const g=pk;if(!g||g.phase!=='pick'||!g.sel.length)return;const t=g.trips[g.r];
  const right=g.sel.filter(k=>t.need.includes(k)),miss=t.need.filter(k=>!g.sel.includes(k)),extra=g.sel.filter(k=>!t.need.includes(k));
  g.got+=right.length;g.total+=t.need.length;g.phase='fb';g.ok=!miss.length&&!extra.length;if(g.ok)g.perfect++;
  if(g.ok){g.msg='All packed! You remembered everything.';chime(false);gSay('All packed! You remembered everything.');}
  else{g.msg=`You packed ${right.length} of ${t.need.length}.`+(miss.length?` Still needed: ${gList(miss.map(k=>PK_ITEMS[k][0]))}.`:'')+(extra.length?` Not needed this time: ${gList(extra.map(k=>PK_ITEMS[k][0]))}.`:'');
    gSay('Good try. The things you still need are glowing.');}
  render();}
function scr_pack(step){
  const N=3;step=Math.max(1,Math.min(N,step||1));
  const base={name:'Pack the Bag',tab:'games',step:{x:step,y:N},topLeft:'back',backTo:()=>{stopSpeech();step>1?go('game/pack/'+(step-1)):go('games');},portal:{size:'small',world:S.world,title:'Pack the Bag'}};
  if(step===1)return Object.assign(base,{guide:G_START,
    body:gHow('Remember what to bring',[['eye','Look at the things you need for an outing.'],['moon','They go away for a moment.'],['bag','Tap each one you need to pack it in your bag.']],
      S.badDay?'Bad day mode: 3 things to pack, 2 outings. No rush.':'Seedling level: 5 things to pack, 3 outings. No timer, no rush.'),
    nextLabel:'Start',next:()=>{pk=newPK();go('game/pack/2');}});
  if(step===2){
    if(!pk){setTimeout(()=>go('game/pack/1'));return gStub(base);}
    const g=pk,t=g.trips[g.r],ph=g.phase,last=g.r===g.trips.length-1;
    const stat=`<div class="statrow pkstat"><div><b>Outing ${g.r+1} / ${g.trips.length}</b></div>${ph==='pick'?`<div aria-label="${g.sel.length} of ${t.need.length} picked"><b>${g.sel.length} / ${t.need.length}</b><span class="sub">picked</span></div><button class="btn pklook" data-act="pklook">${ic('eye')}Look again</button>`:''}</div>`;
    const head=`<div class="pkhead">${ic(t.i)}<h2>${esc(t.title)}</h2></div>`;
    let inner;
    if(ph==='study')inner=`${head}<p class="pkp">Pack ${t.need.length===3?'these 3 things':'these '+t.need.length+' things'}:</p><div class="pkgrid need n${t.need.length}">${t.need.map(k=>pkTile(k,'show')).join('')}</div>
      <button class="btn block pksay" data-act="pksay">${ic('speaker')}Hear the list</button>`;
    else if(ph==='pick')inner=`${head}<p class="pkp">What do you need? Tap to pack it.</p><div class="pkgrid opts" role="group" aria-label="Things you could pack">${t.opts.map(k=>{const on=g.sel.includes(k);
      return pkTile(k,on?'on':'',`data-act="pktap" data-k="${k}" aria-pressed="${on}" aria-label="${esc(PK_ITEMS[k][0])}${on?', in your bag':''}"`,`<span class="pkmark">${on?ic('check')+'In bag':''}</span>`);}).join('')}</div>`;
    else inner=`${head}<p class="srmsg pkmsg ${g.ok?'ok':'soft'}" aria-live="polite">${esc(g.msg)}</p><div class="pkgrid opts">${t.opts.map(k=>{const need=t.need.includes(k),on=g.sel.includes(k);
      const cls=need&&on?'right':need?'missed':on?'extra':'off';const lab=need&&on?ic('check')+'Packed':need?ic('sparkle')+'Needed':on?'Not needed':'';
      return pkTile(k,cls,'',`<span class="pkmark">${lab}</span>`);}).join('')}</div>`;
    const nextLabel=ph==='study'?'I am ready':ph==='pick'?'Check my bag':(last?'See results':'Next outing');
    return Object.assign(base,{guide:ph==='fb'?(g.ok?PK_G.ok:PK_G.soft):PK_G[ph],body:`<div class="card pkcard">${stat}${inner}</div>`,
      mount:()=>{if(ph==='study'&&g.said!==g.r){g.said=g.r;gAfterGuide(()=>{if(pk===g&&g.phase==='study'&&gLive('pack'))pkStudySay(g);});}gScroll();},
      nextLabel,nextDisabled:ph==='pick'&&!g.sel.length,
      next:()=>{if(pk!==g)return;
        if(g.phase==='study'){g.phase='pick';stopSpeech();render();gSay(PK_G.pick);}
        else if(g.phase==='pick')pkCheck();
        else if(g.phase==='fb'){if(last){g.done=true;go('game/pack/3');}else{g.r++;g.phase='study';g.sel=[];g.msg='';render();}}},
      acts:{pktap:el=>{if(g.phase!=='pick')return;const k=el.dataset.k;const i=g.sel.indexOf(k);if(i>=0)g.sel.splice(i,1);else{g.sel.push(k);gSay(PK_ITEMS[k][0]+'.');}render();},
        pklook:()=>{if(g.phase!=='pick')return;g.phase='study';g.said=g.r;render();pkStudySay(g);},pksay:()=>speakSeq([t.title+'. Pack these things.',...t.need.map(k=>PK_ITEMS[k][0]+'.')])}});
  }
  const g=pk;if(!g||!g.done){setTimeout(()=>go('game/pack/1'));return Object.assign(gStub(base,'Done'),{nextDisabled:false,next:()=>go('games')});}
  if(!g.awarded){g.awarded=true;const b=S.packBest;if(!b||g.got/g.total>b.c/b.n)S.packBest={c:g.got,n:g.total};save();addGauge(20,null,false);chime(true);}
  const b=S.packBest;
  return Object.assign(base,{guide:G_END,body:gResults(`You packed <b>${g.got}</b> of ${g.total} things${g.perfect?`, with ${g.perfect} perfect bag${g.perfect>1?'s':''}`:''}. Every try helps.`,b?`Best so far: ${b.c} of ${b.n}.`:''),
    nextLabel:'Done',next:()=>go('games'),acts:{again:()=>{pk=newPK();go('game/pack/2');}}});
}

/* ================= Simon Says (palace windows) ================= */
const SM_WIN=[['moon','Moon',262],['star','Star',330],['sun','Sun',392],['leaf','Leaf',494]];
const SM_G={show:'Watch the windows light up.',input:'Your turn. Tap the windows in the same order.',ok:'Well done! Tap Next when you are ready.',soft:'Good try. Tap Next when you are ready.'};
let sm=null,smT=null;
function newSM(){const bad=!!S.badDay,wins=bad?3:4,start=2,maxLen=bad?4:6;
  const seq=[];for(let i=0;i<maxLen;i++){let k;do{k=Math.floor(Math.random()*wins);}while(i>1&&k===seq[i-1]&&k===seq[i-2]);seq.push(k);}
  return {wins,seq,len:start,start,maxLen,phase:'show',pos:0,misses:0,best:0,firstTry:0,bad,on:bad?1300:800,off:bad?650:350,msg:'',ok:false,end:false,done:false,awarded:false,started:false,gen:0};}
function smClear(){clearTimeout(smT);smT=null;}
function smTone(f,ms){if(S.sensory!=='full')return;try{actx=actx||new (window.AudioContext||window.webkitAudioContext)();const o=actx.createOscillator(),g=actx.createGain(),t=actx.currentTime,d=ms/1000;
  o.type='sine';o.frequency.value=f;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.11,t+.04);g.gain.setValueAtTime(.11,t+Math.max(.05,d-.15));g.gain.linearRampToValueAtTime(0,t+d);o.connect(g).connect(actx.destination);o.start(t);o.stop(t+d+.05);}catch(e){}}
function smLight(k,ms,say){const el=$(`.smwin[data-k="${k}"]`);const w=SM_WIN[k];if(el){el.classList.add('lit');setTimeout(()=>el.classList.remove('lit'),ms);}
  const lr=$('#smlive');if(lr)lr.textContent=w[1];smTone(w[2],ms);if(say&&S.readAloud)speak(w[1],false);}
function smShow(g,delay){smClear();if(sm!==g)return;g.phase='show';g.pos=0;g.gen++;render();const my=g.gen;let i=0;
  const step=()=>{if(sm!==g||g.gen!==my||!gLive('simon'))return;
    if(i>=g.len){g.phase='input';render();gSay(SM_G.input);return;}
    smLight(g.seq[i],g.on,true);i++;smT=setTimeout(step,g.on+g.off);};
  smT=setTimeout(step,delay==null?700:delay);}
function smTap(k){const g=sm;if(!g||g.phase!=='input')return;
  if(k===g.seq[g.pos]){g.pos++;
    if(g.pos>=g.len){g.best=Math.max(g.best,g.len);if(!g.misses)g.firstTry++;g.phase='fb';g.ok=true;
      if(g.len>=g.maxLen){g.end=true;g.msg=`You did it! You remembered all ${g.len} lights.`;}else g.msg='Well done! Next time there is one more light.';
      chime(false);render();smLight(k,350,false);gSay(g.end?'You did it! You remembered the whole pattern.':'Well done! Next time there is one more light.');return;}
    render();smLight(k,350,false);return;}
  g.misses++;g.phase='fb';g.ok=false;
  if(g.misses>=2){g.end=true;g.msg=g.best?`Good try. You remembered ${g.best} lights in a row. That is great memory work.`:'Good try. Patterns take practice. You are doing well.';gSay('Good try. That is great memory work.');}
  else{g.msg='Not quite. Let\u2019s watch it again.';gSay('Not quite. Let\u2019s watch it again.');}
  render();}
function scr_simon(step){
  const N=3;step=Math.max(1,Math.min(N,step||1));
  const base={name:'Simon Says',tab:'games',step:{x:step,y:N},topLeft:'back',backTo:()=>{smClear();stopSpeech();step>1?go('game/simon/'+(step-1)):go('games');},portal:{size:'small',world:S.world,title:'Simon Says'}};
  if(step===1){smClear();const quiet=S.sensory!=='full'&&!S.readAloud;
    return Object.assign(base,{guide:G_START,
    body:gHow('Repeat the pattern',[['sparkle','Watch the palace windows light up, one by one.'],['repeat','Tap the same windows in the same order.'],['plus','Each time, the pattern grows by one.']],
      (S.badDay?'Bad day mode: 3 windows, slower lights, up to 4 in a row.':'Seedling level: 4 windows, up to 6 in a row. No timer, no rush.')+(quiet?' Tip: turn on Read aloud or Full sounds in More to hear each window.':'')),
    nextLabel:'Start',next:()=>{sm=newSM();go('game/simon/2');}});}
  if(step===2){
    if(!sm){setTimeout(()=>go('game/simon/1'));return gStub(base);}
    const g=sm,ph=g.phase;
    const dots=`<div class="smdots" aria-label="${ph==='input'?`Tap ${Math.min(g.pos+1,g.len)} of ${g.len}`:`${g.len} lights`}">${Array.from({length:g.len},(_,i)=>`<i class="${ph==='input'&&i<g.pos?'on':''}">${ph==='input'&&i<g.pos?ic('check'):i+1}</i>`).join('')}</div>`;
    const stat=`<div class="statrow smstat"><div><b>${g.len} lights</b></div>${ph==='input'?`<button class="btn smagain" data-act="smagain">${ic('eye')}Watch again</button>`:''}<div aria-label="Best ${g.best}"><b>${g.best}</b><span class="sub">best</span></div></div>`;
    const wins=SM_WIN.slice(0,g.wins).map(([i,l],k)=>`<button class="smwin" data-act="smtap" data-k="${k}" ${ph!=='input'?'aria-disabled="true"':''} aria-label="${l} window"><span class="smglass">${cardIc(i)}</span><span class="sml">${l}</span></button>`).join('');
    const guide=ph==='fb'?(g.ok?SM_G.ok:SM_G.soft):SM_G[ph];
    const nextLabel=ph==='show'?'Watching\u2026':ph==='input'?'Your turn':(g.end?'See results':g.ok?'Next pattern':'Watch again');
    return Object.assign(base,{guide,
      body:`<div class="card smcard">${stat}${dots}<div class="smgrid w${g.wins} ph-${ph}" role="group" aria-label="Palace windows">${wins}</div>
        <p class="srmsg ${ph==='fb'?(g.ok?'ok':'soft'):''}" aria-live="polite">${esc(ph==='fb'?g.msg:ph==='show'?'Watch\u2026':'Your turn.')}</p><p class="wcsr" id="smlive" aria-live="assertive"></p></div>`,
      mount:()=>{if(!g.started){g.started=true;gAfterGuide(()=>{if(sm===g&&gLive('simon')&&g.phase==='show')smShow(g,500);});}gScroll();},
      nextLabel,nextDisabled:ph!=='fb',
      next:()=>{if(sm!==g||g.phase!=='fb')return;if(g.end){g.done=true;smClear();go('game/simon/3');return;}
        if(g.ok){g.len++;g.misses=0;}smShow(g,500);},
      acts:{smtap:el=>smTap(+el.dataset.k),smagain:()=>{if(g.phase==='input')smShow(g,300);}}});
  }
  const g=sm;if(!g||!g.done){setTimeout(()=>go('game/simon/1'));return Object.assign(gStub(base,'Done'),{nextDisabled:false,next:()=>go('games')});}
  if(!g.awarded){g.awarded=true;S.simonBest=Math.max(S.simonBest||0,g.best);save();addGauge(20,null,false);chime(true);}
  return Object.assign(base,{guide:G_END,body:gResults(g.best>=g.maxLen?`You remembered the whole pattern: <b>${g.best}</b> lights in a row!`:`You remembered <b>${g.best}</b> light${g.best===1?'':'s'} in a row. Every pattern counts.`,S.simonBest?`Best so far: ${S.simonBest} in a row.`:''),
    nextLabel:'Done',next:()=>go('games'),acts:{again:()=>{sm=newSM();go('game/simon/2');}}});
}

/* ================= Name Game ================= */
/* Friendly made-up people drawn as simple SVG avatars (no photos, no real people). */
const NM_PEOPLE=[
 {id:'ruby',name:'Ruby',hint:'grows roses',i:'flower',f:{skin:'#f1c7a5',hair:'#a5432a',style:'long',shirt:'#c46d7b',bg:'#f6dfe3'}},
 {id:'omar',name:'Omar',hint:'bakes bread',i:'bread',f:{skin:'#a8714c',hair:'#2b1d14',style:'short',beard:1,shirt:'#d9a441',bg:'#f7ead0'}},
 {id:'grace',name:'Grace',hint:'loves books',i:'book',f:{skin:'#7a4a2e',hair:'#1d1410',style:'bun',glasses:1,shirt:'#5f7fb8',bg:'#dfe7f5'}},
 {id:'theo',name:'Theo',hint:'sails boats',i:'boat',f:{skin:'#f3d2b8',hair:'#d9b25a',style:'curly',shirt:'#3f8a8c',bg:'#d8eef0'}},
 {id:'priya',name:'Priya',hint:'paints pictures',i:'image',f:{skin:'#c68b62',hair:'#241612',style:'pony',earrings:1,shirt:'#8a5cb0',bg:'#ece0f5'}},
 {id:'frank',name:'Frank',hint:'goes fishing',i:'fish',f:{skin:'#e9b996',hair:'#cfcfcf',style:'bald',glasses:1,shirt:'#5a8a4e',bg:'#e3f0dc'}},
 {id:'mae',name:'Mae',hint:'makes tea',i:'cup',f:{skin:'#f0c9a0',hair:'#e8e4df',style:'bob',glasses:1,shirt:'#c9784a',bg:'#f7e3d6'}},
 {id:'kenji',name:'Kenji',hint:'climbs mountains',i:'mountain',f:{skin:'#e8c39e',hair:'#1a1a1a',style:'spiky',shirt:'#b84a3a',bg:'#f5dcd6'}},
 {id:'lucy',name:'Lucy',hint:'feeds the birds',i:'bird',f:{skin:'#fbe0cc',hair:'#6b3d1e',style:'long',hat:'#e2c47a',shirt:'#4f9a7a',bg:'#d9f0e6'}},
 {id:'diego',name:'Diego',hint:'watches the stars',i:'star',f:{skin:'#b97d55',hair:'#3a2418',style:'short',shirt:'#3b3f86',bg:'#e2e3f6'}}];
function nmFace(p){const f=p.f,h=f.hair;let back='',front='';
  if(f.style==='long')back=`<path d="M25 52c0-21 11-33 25-33s25 12 25 33v30H25z" fill="${h}"/>`;
  if(f.style==='bob')back=`<path d="M27 50c0-19 10-29 23-29s23 10 23 29v13c-4 3-9 3-11 1H38c-2 2-7 2-11-1z" fill="${h}"/>`;
  if(f.style==='pony')back=`<path d="M70 34c9 5 10 20 3 30" stroke="${h}" stroke-width="9" fill="none" stroke-linecap="round"/>`;
  if(f.style==='bun')back=`<circle cx="50" cy="20" r="9" fill="${h}"/>`;
  if(f.style==='short'||f.style==='bun'||f.style==='pony')front=`<path d="M31 43c0-14 8-21 19-21s19 7 19 21c-4-6-10-9-19-9s-15 3-19 9z" fill="${h}"/>`;
  if(f.style==='long'||f.style==='bob')front=`<path d="M31 45c0-15 8-23 19-23s19 8 19 23c-6-2-11-8-13-13-5 7-15 11-25 13z" fill="${h}"/>`;
  if(f.style==='curly')front=[[33,38],[38,30],[45,26],[53,25],[61,28],[67,35],[69,42],[31,44]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="7" fill="${h}"/>`).join('');
  if(f.style==='bald')front=`<path d="M31 50c-1-7 1-11 4-12v13zM69 50c1-7-1-11-4-12v13z" fill="${h}"/>`;
  if(f.style==='spiky')front=`<path d="M31 43l1-13 6 5 3-10 5 6 4-9 4 9 5-6 3 10 6-5 1 13c-5-5-12-8-19-8s-14 3-19 8z" fill="${h}"/>`;
  const beard=f.beard?`<path d="M31 50c1 14 9 21 19 21s18-7 19-21c-3 5-7 7-10 7-2-2-5-3-9-3s-7 1-9 3c-3 0-7-2-10-7z" fill="${h}"/>`:'';
  const glasses=f.glasses?`<g fill="none" stroke="#3a2c12" stroke-width="1.8"><circle cx="42" cy="47" r="6"/><circle cx="58" cy="47" r="6"/><path d="M48 47h4M36 46l-5-2M64 46l5-2"/></g>`:'';
  const ear=f.earrings?`<circle cx="31" cy="55" r="2.2" fill="#e2b13c"/><circle cx="69" cy="55" r="2.2" fill="#e2b13c"/>`:'';
  const hat=f.hat?`<path d="M34 30c0-8 7-12 16-12s16 4 16 12z" fill="${f.hat}"/><ellipse cx="50" cy="30" rx="27" ry="5.5" fill="${f.hat}"/><path d="M34 27h32" stroke="#b8913f" stroke-width="2.5"/>`:'';
  return `<svg class="nmface" viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="50" fill="${f.bg}"/>${back}
  <path d="M15 100c0-17 15-26 35-26s35 9 35 26z" fill="${f.shirt}"/><rect x="43" y="62" width="14" height="15" rx="6" fill="${f.skin}"/>
  <circle cx="31" cy="49" r="4.5" fill="${f.skin}"/><circle cx="69" cy="49" r="4.5" fill="${f.skin}"/><ellipse cx="50" cy="47" rx="19" ry="22" fill="${f.skin}"/>${ear}${beard}${front}
  <circle cx="42" cy="47" r="2.5" fill="#2a2216"/><circle cx="58" cy="47" r="2.5" fill="#2a2216"/><path d="M38 41.5q4-2.5 8 0M54 41.5q4-2.5 8 0" stroke="#3a2c12" stroke-width="1.6" fill="none" stroke-linecap="round" opacity=".7"/>
  <circle cx="37" cy="55" r="3.5" fill="#e88a8a" opacity=".3"/><circle cx="63" cy="55" r="3.5" fill="#e88a8a" opacity=".3"/>
  <path d="M43 57c4 4.5 10 4.5 14 0" stroke="${f.beard?'#f5e6d8':'#8a3b2b'}" stroke-width="2.2" fill="none" stroke-linecap="round"/>${glasses}${hat}</svg>`;}
const nmIntro=p=>`This is ${p.name}. ${p.name} ${p.hint}.`;
const nmClue=p=>`Here is a clue. This person ${p.hint}.`;
const NM_G={learn:'Meet each person. Tap a card to hear it again. Tap I am ready when you can.',ask:'Who is this? Tap their name.',askmiss:'Not quite. Here is a clue. Try again.',ok:'Yes! Tap Next when you are ready.',soft:'Good try. Tap Next when you are ready.'};
let nm=null;
function newNM(){const bad=!!S.badDay,n=bad?2:4;const last=Array.isArray(S.namesLast)?S.namesLast:[];
  let av=NM_PEOPLE.filter(p=>!last.includes(p.id));if(av.length<n)av=NM_PEOPLE.slice();
  const people=gShuf(av).slice(0,n);S.namesLast=people.map(p=>p.id);save();
  return {people,order:gShuf(people.map((_,i)=>i)),qi:0,phase:'learn',opts:[],misses:0,tried:[],right:0,bad,msg:'',ok:false,done:false,awarded:false,said:false};}
function nmAsk(g){g.phase='ask';g.misses=0;g.tried=[];g.msg='';g.opts=gShuf(g.people.map((_,i)=>i));render();gSay('Who is this? Tap their name.');}
function nmPick(k){const g=nm;if(!g||g.phase!=='ask'||g.tried.includes(k))return;const p=g.people[g.order[g.qi]];
  if(k===g.order[g.qi]){g.phase='fb';g.ok=true;if(!g.misses)g.right++;g.msg=`Yes! This is ${p.name}. ${p.name} ${p.hint}.`;chime(false);gSay(`Yes! This is ${p.name}.`);render();return;}
  g.tried.push(k);g.misses++;
  if(g.misses>=2||g.tried.length>=g.people.length-1){g.phase='fb';g.ok=false;g.msg='Good try. '+nmIntro(p);gSay('Good try. '+nmIntro(p));}
  else{g.msg=nmClue(p);gSay(nmClue(p));}
  render();}
function scr_names(step){
  const N=3;step=Math.max(1,Math.min(N,step||1));
  const base={name:'Name Game',tab:'games',step:{x:step,y:N},topLeft:'back',backTo:()=>{stopSpeech();step>1?go('game/names/'+(step-1)):go('games');},portal:{size:'small',world:S.world,title:'Name Game'}};
  if(step===1)return Object.assign(base,{guide:G_START,
    body:gHow('Faces and names',[['whos','Meet some friendly people and their names.'],['bulb','Each one has a little clue to help you remember.'],['tag','Then see a face and tap the right name.']],
      S.badDay?'Bad day mode: 2 people to meet. Take your time.':'Seedling level: 4 people to meet. No timer, no rush.'),
    nextLabel:'Start',next:()=>{nm=newNM();go('game/names/2');}});
  if(step===2){
    if(!nm){setTimeout(()=>go('game/names/1'));return gStub(base);}
    const g=nm,ph=g.phase,n=g.people.length;
    let inner,guide;
    if(ph==='learn'){guide=NM_G.learn;
      inner=`<span class="steptag">Meet</span><div class="nmlearn n${n}">${g.people.map((p,k)=>`<button class="nmcard" data-act="nmhear" data-k="${k}" aria-label="${esc(nmIntro(p))} Tap to hear it.">${nmFace(p)}<span class="nmname">${esc(p.name)}</span><span class="nmhint">${ic(p.i)}${esc(p.hint)}</span></button>`).join('')}</div>`;}
    else{const p=g.people[g.order[g.qi]];guide=ph==='ask'?(g.misses?NM_G.askmiss:NM_G.ask):(g.ok?NM_G.ok:NM_G.soft);
      const opts=g.opts.map(k=>{const q=g.people[k];let cls='';if(ph==='fb'&&k===g.order[g.qi])cls='right';else if(g.tried.includes(k))cls='tried';
        return `<button class="choice src nmopt ${cls}" data-act="nmpick" data-k="${k}" ${g.tried.includes(k)?'disabled':''} ${ph==='fb'?'aria-disabled="true"':''} aria-label="${esc(q.name)}${cls==='right'?'. This is the answer.':''}">${ic(cls==='right'?'check':'tag')}<span>${esc(q.name)}</span></button>`;}).join('');
      inner=`<div class="statrow nmstat"><div><b>Face ${g.qi+1} / ${n}</b></div><div aria-label="${g.right} right on the first try"><b>${g.right}</b><span class="sub">first try</span></div></div>
        <div class="nmask"><div class="nmbig">${nmFace(p)}${ph==='fb'?`<span class="nmname">${esc(p.name)}</span>`:''}${(ph==='ask'&&g.misses)||ph==='fb'?`<span class="nmhint">${ic(p.i)}${esc(p.hint)}</span>`:''}</div>
        <div class="nmside"><h2 class="srq">${ph==='fb'?esc(p.name):'Who is this?'}</h2><div class="srch nmch">${opts}</div></div></div>
        <p class="srmsg ${ph==='fb'?(g.ok?'ok':'soft'):(g.misses?'soft':'')}" aria-live="polite">${esc(g.msg)}</p>`;}
    const last=g.qi===n-1;
    const nextLabel=ph==='learn'?'I am ready':ph==='ask'?'Pick a name':(last?'See results':'Next face');
    return Object.assign(base,{guide,body:`<div class="card nmcardwrap">${inner}</div>`,
      mount:()=>{if(ph==='learn'&&!g.said){g.said=true;gAfterGuide(()=>{if(nm===g&&g.phase==='learn'&&gLive('names'))gSaySeq(g.people.map(nmIntro));});}gScroll();},
      nextLabel,nextDisabled:ph==='ask',
      next:()=>{if(nm!==g)return;if(g.phase==='learn'){stopSpeech();nmAsk(g);}else if(g.phase==='fb'){if(last){g.done=true;go('game/names/3');}else{g.qi++;nmAsk(g);}}},
      acts:{nmhear:el=>{const p=g.people[+el.dataset.k];speak(nmIntro(p),false);},nmpick:el=>nmPick(+el.dataset.k)}});
  }
  const g=nm;if(!g||!g.done){setTimeout(()=>go('game/names/1'));return Object.assign(gStub(base,'Done'),{nextDisabled:false,next:()=>go('games')});}
  if(!g.awarded){g.awarded=true;const b=S.namesBest;if(!b||g.right/g.people.length>b.c/b.n)S.namesBest={c:g.right,n:g.people.length};save();addGauge(20,null,false);chime(true);}
  const b=S.namesBest;
  return Object.assign(base,{guide:G_END,body:gResults(`You matched <b>${g.right}</b> of ${g.people.length} names on the first try. Every name counts.`,b?`Best so far: ${b.c} of ${b.n}.`:''),
    nextLabel:'Done',next:()=>go('games'),acts:{again:()=>{nm=newNM();go('game/names/2');}}});
}

/* ================= Routine Builder ================= */
/* Steps are in the right order. Bad day keeps the first, middle and last step. */
const RT_ROUTINES=[
 {id:'morning',title:'Getting up in the morning',i:'sun',steps:[['Wake up','sun'],['Get out of bed','bed'],['Wash your face','drop'],['Get dressed','shirt'],['Eat breakfast','bowl']]},
 {id:'leave',title:'Leaving the house',i:'door',steps:[['Pick up your bag','bag'],['Open the front door','door'],['Step outside','path'],['Close the door','home'],['Lock the door with your key','key']]},
 {id:'bed',title:'Getting ready for bed',i:'moon',steps:[['Have a warm bath','bath'],['Dry off with a towel','towel'],['Put on your pajamas','shirt'],['Get into bed','bed'],['Close your eyes and rest','moon']]},
 {id:'hands',title:'Washing your hands',i:'drop',steps:[['Turn on the tap','tap'],['Wet your hands','drop'],['Rub on some soap','soap'],['Rinse off the soap','waves'],['Dry your hands','towel']]},
 {id:'teeth',title:'Brushing your teeth',i:'tooth',steps:[['Pick up your toothbrush','brush'],['Put on some toothpaste','plus'],['Brush all your teeth','tooth'],['Spit and rinse','cup'],['Put your toothbrush away','check']]},
 {id:'tea',title:'Making a cup of tea',i:'cup',steps:[['Fill the kettle with water','kettle'],['Boil the water','flame'],['Put a tea bag in a cup','cup'],['Pour in the hot water','drop'],['Wait, then sip slowly','clock']]}];
const RT_G={place:'Tap the steps in order, first step first. Tap a placed step to take it back.',full:'All the steps are placed. Tap Check order.',retry:'Some steps are back below. Tap them in order again.',ok:'Well done! Tap Next when you are ready.',soft:'Here is the right order. Tap Next when you are ready.'};
let rt=null;
function newRT(){const bad=!!S.badDay,rounds=bad?2:3;const last=Array.isArray(S.routineLast)?S.routineLast:[];
  let av=RT_ROUTINES.filter(r=>!last.includes(r.id));if(av.length<rounds)av=RT_ROUTINES.slice();
  const list=gShuf(av).slice(0,rounds).map(r=>{const steps=bad?[r.steps[0],r.steps[2],r.steps[4]]:r.steps.slice();
    let pool;do{pool=gShuf(steps.map((_,i)=>i));}while(pool.every((v,i)=>v===i));return {id:r.id,title:r.title,i:r.i,steps,pool};});
  S.routineLast=list.map(r=>r.id);save();
  return {list,r:0,phase:'place',slots:Array(list[0].steps.length).fill(null),lock:[],checks:0,firstTry:0,bad,msg:'',ok:false,done:false,awarded:false,said:-1};}
function rtCur(g){return g.list[g.r];}
function rtStart(g){const c=rtCur(g);g.phase='place';g.slots=Array(c.steps.length).fill(null);g.lock=[];g.checks=0;g.msg='';}
function rtPlace(si,slot){const g=rt;if(!g||g.phase!=='place')return;const c=rtCur(g);
  if(slot!=null&&slot>=0&&g.lock[slot])return render();
  const at=g.slots.indexOf(si);if(at>=0)g.slots[at]=null;
  if(slot==null||slot<0)slot=g.slots.indexOf(null);if(slot<0)return render();
  const prev=g.slots[slot];g.slots[slot]=si;if(prev!=null&&at>=0)g.slots[at]=prev;/* otherwise prev goes back to the pool */
  if(at<0)gSay(c.steps[si][0]+'.');render();}
function rtUnplace(slot){const g=rt;if(!g||g.phase!=='place'||g.lock[slot])return;g.slots[slot]=null;render();}
function rtCheck(){const g=rt;if(!g||g.phase!=='place'||g.slots.includes(null))return;const c=rtCur(g);g.checks++;
  let right=0;g.slots.forEach((si,k)=>{if(si===k){g.lock[k]=true;right++;}});
  if(right===g.slots.length){g.phase='fb';g.ok=true;if(g.checks===1)g.firstTry++;g.msg=g.checks===1?'Perfect! Every step is in the right order.':'Well done! Every step is in the right order now.';chime(false);gSay('Well done! Every step is in the right order.');return render();}
  if(g.checks>=3){g.slots=c.steps.map((_,i)=>i);g.lock=g.slots.map(()=>true);g.phase='fb';g.ok=false;g.msg='Good try. Here is the right order. Read it through once more.';gSay('Good try. Here is the right order.');return render();}
  g.slots=g.slots.map((si,k)=>g.lock[k]?si:null);
  g.msg=`${right} of ${c.steps.length} ${right===1?'step is':'steps are'} in the right spot. The others are back below. Try again.`;gSay('Some steps are in the right spot. Try the others again.');render();}
function rtCard(c,si,attrs,cls){const [l,i]=c.steps[si];return `<button class="rtstep ${cls||''}" ${attrs} data-si="${si}"><span class="rtgrip" aria-hidden="true">${ic('grip')}</span>${ic(i)}<span class="rtl">${esc(l)}</span></button>`;}
let rtDrag=null,rtNoClick=0;
function rtAutoScroll(y){/* While dragging near the top or bottom edge, gently scroll so every slot can be reached. */
  const bd=$('.content-col .body');const sc=bd&&bd.scrollHeight>bd.clientHeight+2&&getComputedStyle(bd).overflowY!=='visible'?bd:null;
  const top=sc?sc.getBoundingClientRect().top:0,bot=sc?sc.getBoundingClientRect().bottom:innerHeight,edge=48,sp=14;
  const dy=y<top+edge?-sp:y>bot-edge?sp:0;if(!dy)return;if(sc)sc.scrollTop+=dy;else window.scrollBy(0,dy);}
function rtDragInit(){if(window.__rtDrag)return;window.__rtDrag=1;
  document.addEventListener('pointerdown',e=>{const gr=e.target.closest('.rtstep');if(!gr||!rt||rt.phase!=='place'||gr.disabled)return;
    rtDrag={el:gr,si:+gr.dataset.si,x:e.clientX,y:e.clientY,on:false,ghost:null,fromGrip:!!e.target.closest('.rtgrip'),type:e.pointerType};});
  document.addEventListener('pointermove',e=>{const d=rtDrag;if(!d)return;const dist=Math.hypot(e.clientX-d.x,e.clientY-d.y);
    if(!d.on){if(dist<10)return;if(d.type!=='mouse'&&!d.fromGrip){rtDrag=null;return;}
      d.on=true;const r=d.el.getBoundingClientRect();d.ghost=d.el.cloneNode(true);d.ghost.classList.add('rtghost');d.ghost.style.width=r.width+'px';d.ox=e.clientX-r.left;d.oy=e.clientY-r.top;document.body.appendChild(d.ghost);d.el.classList.add('dragging');}
    e.preventDefault();rtAutoScroll(e.clientY);d.ghost.style.left=(e.clientX-d.ox)+'px';d.ghost.style.top=(e.clientY-d.oy)+'px';
    document.querySelectorAll('.rtslot.over').forEach(x=>x.classList.remove('over'));const t=document.elementFromPoint(e.clientX,e.clientY);const sl=t&&t.closest('.rtslot');if(sl&&!sl.classList.contains('locked'))sl.classList.add('over');},{passive:false});
  const end=e=>{const d=rtDrag;rtDrag=null;if(!d||!d.on)return;if(d.ghost)d.ghost.remove();d.el.classList.remove('dragging');rtNoClick=Date.now();
    const t=document.elementFromPoint(e.clientX,e.clientY);const sl=t&&t.closest('.rtslot');const pool=t&&t.closest('.rtpool');
    if(sl&&!sl.classList.contains('locked'))rtPlace(d.si,+sl.dataset.slot);else if(pool){const a=rt.slots.indexOf(d.si);if(a>=0)rtUnplace(a);else render();}else render();};
  document.addEventListener('pointerup',end);document.addEventListener('pointercancel',e=>{const d=rtDrag;rtDrag=null;if(d&&d.ghost){d.ghost.remove();d.el.classList.remove('dragging');}});}
function scr_routine(step){
  const N=3;step=Math.max(1,Math.min(N,step||1));
  const base={name:'Routine Builder',tab:'games',step:{x:step,y:N},topLeft:'back',backTo:()=>{stopSpeech();step>1?go('game/routine/'+(step-1)):go('games');},portal:{size:'small',world:S.world,title:'Routine Builder'}};
  if(step===1)return Object.assign(base,{guide:G_START,
    body:gHow('Put the steps in order',[['list','You will see the steps of an everyday routine, all mixed up.'],['next','Tap the first step, then the next, and so on. You can also drag them.'],['check','Tap Check order. Steps in the right spot stay put.']],
      S.badDay?'Bad day mode: 3 steps in each routine, 2 routines. No rush.':'Seedling level: 5 steps in each routine, 3 routines. No timer, no rush.'),
    nextLabel:'Start',next:()=>{rt=newRT();go('game/routine/2');}});
  if(step===2){
    if(!rt){setTimeout(()=>go('game/routine/1'));return gStub(base);}
    const g=rt,c=rtCur(g),ph=g.phase,n=c.steps.length,full=!g.slots.includes(null),last=g.r===g.list.length-1;
    const slots=g.slots.map((si,k)=>{const lk=!!g.lock[k];
      return `<li class="rtslot ${si==null?'empty':''} ${lk?'locked':''}" data-slot="${k}"><span class="rtn" aria-hidden="true">${k+1}</span>${si==null?`<span class="rtempty">${k===g.slots.indexOf(null)?'Next step goes here':'Empty'}</span>`:
        rtCard(c,si,`data-act="rtun" data-k="${k}" ${lk||ph!=='place'?'aria-disabled="true"':''} aria-label="Step ${k+1}: ${esc(c.steps[si][0])}${lk?'. Right spot.':'. Tap to take it back.'}"`,lk?'placed lockd':'placed')}${lk?`<span class="rtok">${ic('check')}<span>Right</span></span>`:''}</li>`;}).join('');
    const pool=c.pool.filter(si=>!g.slots.includes(si));
    const poolH=ph==='place'?`<div class="rtpool" aria-label="Steps to place">${pool.length?pool.map(si=>rtCard(c,si,`data-act="rtpick" aria-label="${esc(c.steps[si][0])}. Tap to place it as step ${g.slots.indexOf(null)+1}."`)).join(''):`<p class="rtdone">${ic('check')}All steps placed.</p>`}</div>`:'';
    const guide=ph==='fb'?(g.ok?RT_G.ok:RT_G.soft):full?RT_G.full:(g.checks?RT_G.retry:RT_G.place);
    return Object.assign(base,{guide,
      body:`<div class="card rtcard"><div class="statrow rtstat"><div><b>Routine ${g.r+1} / ${g.list.length}</b></div><button class="btn rtsay" data-act="rtsay" aria-label="Hear the routine name">${ic('speaker')}<span>Hear</span></button></div>
        <div class="pkhead">${ic(c.i)}<h2>${esc(c.title)}</h2></div>
        ${g.msg?`<p class="srmsg rtmsg ${ph==='fb'?(g.ok?'ok':'soft'):'soft'}" aria-live="polite">${esc(g.msg)}</p>`:''}<div class="rtwrap ph-${ph} ${pool.length?'':'allin'}"><div class="rtcol"><span class="steptag">Your order</span><ol class="rtslots">${slots}</ol></div>${ph==='place'?`<div class="rtcol"><span class="steptag">Steps to place</span>${poolH}</div>`:''}</div>
</div>`,
      mount:()=>{rtDragInit();if(g.said!==g.r){g.said=g.r;gAfterGuide(()=>{if(rt===g&&gLive('routine'))gSaySeq([c.title+'.','Tap the first step.']);});}gScroll();},
      nextLabel:ph==='place'?'Check order':(last?'See results':'Next routine'),nextDisabled:ph==='place'&&!full,
      next:()=>{if(rt!==g)return;if(g.phase==='place')rtCheck();else if(g.phase==='fb'){if(last){g.done=true;go('game/routine/3');}else{g.r++;rtStart(g);render();}}},
      acts:{rtpick:el=>{if(Date.now()-rtNoClick<400)return;rtPlace(+el.dataset.si,-1);},rtun:el=>{if(Date.now()-rtNoClick<400)return;rtUnplace(+el.dataset.k);},
        rtsay:()=>speakSeq([c.title+'.',...g.slots.filter(x=>x!=null).map(si=>c.steps[si][0]+'.')])}});
  }
  const g=rt;if(!g||!g.done){setTimeout(()=>go('game/routine/1'));return Object.assign(gStub(base,'Done'),{nextDisabled:false,next:()=>go('games')});}
  if(!g.awarded){g.awarded=true;const b=S.routineBest;if(!b||g.firstTry/g.list.length>b.c/b.n)S.routineBest={c:g.firstTry,n:g.list.length};save();addGauge(20,null,false);chime(true);}
  const b=S.routineBest;
  return Object.assign(base,{guide:G_END,body:gResults(`You put <b>${g.list.length}</b> routines in order${g.firstTry?`, ${g.firstTry} on the first try`:''}. Steady steps, well done.`,b?`Best so far: ${b.c} of ${b.n} on the first try.`:''),
    nextLabel:'Done',next:()=>go('games'),acts:{again:()=>{rt=newRT();go('game/routine/2');}}});
}

/* Every fixed line the new games can speak (for pre-recording MP3s). */
function newGameLines(){const L=new Set();const gl=(name,n,txt)=>L.add(`You are on ${name}. Step ${n} of 3. ${txt}`);
  [['Pack the Bag',PK_G],['Simon Says',SM_G],['Name Game',NM_G],['Routine Builder',RT_G]].forEach(([nm2,G])=>{gl(nm2,1,G_START);gl(nm2,3,G_END);Object.values(G).forEach(t=>{gl(nm2,2,t);});});
  L.add('You are on Games. Tap a doorway to pick a game. All seven games are ready to play.');
  Object.values(PK_G).forEach(t=>L.add(t));Object.values(SM_G).forEach(t=>L.add(t));Object.values(NM_G).forEach(t=>L.add(t));
  PK_TRIPS.forEach(t=>L.add(t.title+'. Pack these things.'));Object.values(PK_ITEMS).forEach(([l])=>L.add(l+'.'));
  ['All packed! You remembered everything.','Good try. The things you still need are glowing.'].forEach(t=>L.add(t));
  SM_WIN.forEach(w=>L.add(w[1]));['You did it! You remembered the whole pattern.','Well done! Next time there is one more light.','Good try. That is great memory work.','Not quite. Let\u2019s watch it again.'].forEach(t=>L.add(t));
  L.add('Who is this? Tap their name.');NM_PEOPLE.forEach(p=>{L.add(nmIntro(p));L.add(nmClue(p));L.add(`Yes! This is ${p.name}.`);L.add('Good try. '+nmIntro(p));});
  RT_ROUTINES.forEach(r=>{L.add(r.title+'.');r.steps.forEach(s=>L.add(s[0]+'.'));});
  ['Tap the first step.','Well done! Every step is in the right order.','Good try. Here is the right order.','Some steps are in the right spot. Try the others again.'].forEach(t=>L.add(t));
  return [...L].map(normT);}

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
      <button class="tool" data-act="nav" data-to="remind">${ic('bell')}Remind me</button><button class="tool" data-act="nav" data-to="remind/alerts">${ic('bell')}Phone alerts</button>
      <button class="tool" data-act="nav" data-to="donecheck">${ic('shieldcheck')}Done-check</button><button class="tool" data-act="nav" data-to="where">${ic('search')}Where is it?</button>
      <button class="tool" data-act="nav" data-to="whos">${ic('whos')}Who\u2019s that?</button><button class="tool" data-act="tour">${ic('compass')}Replay the tour</button></div>
    <h2 style="margin:6px 4px 10px">Settings</h2>${settingsRows(['guide','read','voice','size','sensory','bad','world'])}
    <div class="card"><div class="setrow"><div class="lbl">${ic('repeat')}Reset prototype</div><p class="sub">Clears everything and starts again from Welcome.</p><button class="btn block" data-act="reset">Reset everything</button></div></div>
    <p class="footer">Highkeep prototype \u00b7 \u00a9 2026 <a href="https://wingscrew.com/">WingsCrew</a>. All rights reserved.</p>`,
    acts:Object.assign({},settingActs,{tour:()=>{go('home');setTimeout(startTour,450);},
      reset:()=>modal('<h2>Reset everything?</h2><p>Your lists, notes, photos and keep will be cleared.</p>',[['Cancel',null],['Yes, reset',()=>{localStorage.removeItem(KEY);location.hash='';location.reload();},true]])})};
}

/*RM-PARSER-START*/
/* Remind Me time reader. Pure and deterministic: rmParse(text, now, opts) never guesses silently.
   It returns what it understood plus plain-words notes, and the screen always shows the result for the person to fix. */
const RM_PARTS_DEF={morning:'08:00',afternoon:'13:00',evening:'18:00',night:'21:00'};
const RM_DOW=['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
const RM_DOW_SHORT={sun:0,mon:1,tue:2,tues:2,wed:3,thu:4,thur:4,thurs:4,fri:5,sat:6};
const RM_MONTHS=['january','february','march','april','may','june','july','august','september','october','november','december'];
const RM_MON_SHORT={jan:0,feb:1,mar:2,apr:3,jun:5,jul:6,aug:7,sep:8,sept:8,oct:9,nov:10,dec:11};
const RM_NUMW={zero:0,one:1,two:2,three:3,four:4,five:5,six:6,seven:7,eight:8,nine:9,ten:10,eleven:11,twelve:12,thirteen:13,fourteen:14,fifteen:15,sixteen:16,seventeen:17,eighteen:18,nineteen:19,twenty:20,thirty:30,forty:40,fifty:50,sixty:60,ninety:90};
function rmNum(w){if(w==null)return null;if(/^\d+$/.test(w))return parseInt(w,10);if(w==='a'||w==='an')return 1;if(Object.prototype.hasOwnProperty.call(RM_NUMW,w))return RM_NUMW[w];
  const m=/^(twenty|thirty|forty|fifty)[- ]?(one|two|three|four|five|six|seven|eight|nine)$/.exec(w);if(m)return RM_NUMW[m[1]]+RM_NUMW[m[2]];return null;}
function rmHM(s){const m=/^(\d{1,2}):(\d{2})$/.exec(s||'');return m?[+m[1],+m[2]]:[8,0];}
function rmDate(ts){return new Date(ts);}
function rmAtDay(base,addDays,h,m){const d=new Date(base);d.setHours(0,0,0,0);d.setDate(d.getDate()+addDays);d.setHours(h,m,0,0);return d.getTime();}
function rmUnit(w){if(!w)return null;if(/^(min|mins|minute|minutes|m)$/.test(w))return 'min';if(/^(hr|hrs|hour|hours|h)$/.test(w))return 'hour';if(/^(day|days)$/.test(w))return 'day';if(/^(week|weeks|wk|wks)$/.test(w))return 'week';if(/^(month|months)$/.test(w))return 'month';return null;}
function rmTokens(input){
  const out=[];String(input||'').replace(/\r|\n/g,' ').split(/\s+/).filter(Boolean).forEach(raw=>{
    let w=raw.toLowerCase().replace(/[\u2018\u2019]/g,"'").replace(/^[("'\u201c]+/,'').replace(/[)"'\u201d,;!?]+$/,'').replace(/\.+$/,'');
    w=w.replace(/^a\.m$/,'am').replace(/^p\.m$/,'pm').replace(/^(\d{1,2}(?::\d{2})?)a\.m$/,'$1am').replace(/^(\d{1,2}(?::\d{2})?)p\.m$/,'$1pm');
    if(w==="o'clock"||w==='oclock'){out.push({w:'oclock',raw});return;}
    out.push({w,raw});});
  return out;
}
/* Which day-of-week index is next, etc. */
function rmParse(input,nowTs,opts){
  const R0=rmParse0(input,nowTs,opts);
  if(R0.due!=null&&(!isFinite(R0.due)||R0.due-nowTs>3660*86400000)){R0.due=null;R0.notes=['That is too far away for me to set. Please pick a nearer time.'];R0.rep={type:'once',total:null};}
  return R0;
}
function rmParse0(input,nowTs,opts){
  opts=opts||{};const parts=Object.assign({},RM_PARTS_DEF,opts.parts||{});const now=+nowTs;const T=rmTokens(input);const used=new Array(T.length).fill(false);
  const R={text:'',due:null,rep:{type:'once',total:null},notes:[],assumed:false,found:false,hasTime:false,foundParts:[]};
  const w=i=>(i>=0&&i<T.length&&!used[i])?T[i].w:null;
  const take=(i,n)=>{for(let k=0;k<n;k++)used[i+k]=true;};
  const numAt=i=>{const t=w(i);if(t==null)return null;let n=rmNum(t);if(n==null)return null;let len=1;
    if(n>=20&&n<=50&&n%10===0&&/^(twenty|thirty|forty|fifty)$/.test(t)){const t2=w(i+1);const n2=t2==null?null:rmNum(t2);if(n2!=null&&n2>=1&&n2<=9&&t2!=='a'&&t2!=='an'){n+=n2;len=2;}}
    return {n,len};};
  let dur=null,clock=null,part=null,day=null,rep=null,total=null,startWord=false;
  const DAYWORDS={today:1,tomorrow:1,tonight:1};
  const isPart=x=>x==='morning'||x==='afternoon'||x==='evening'||x==='night';
  /* ---- pass 1: repeats ---- */
  for(let i=0;i<T.length;i++){const a=w(i);if(!a)continue;
    if(a==='daily'||a==='everyday'||a==='nightly'){rep={type:'daily'};if(a==='nightly')part=part||'night';take(i,1);continue;}
    if(a==='weekdays'||(a==='on'&&w(i+1)==='weekdays')){const k=a==='on'?2:1;rep={type:'weekdays'};take(i,k);continue;}
    if(a==='weekly'){rep={type:'weekly'};take(i,1);continue;}
    if(a==='every'||a==='each'){const b=w(i+1);
      if(isPart(b)){rep={type:'daily'};part=b;take(i,2);continue;}
      if(b==='day'){rep={type:'daily'};take(i,2);continue;}
      if(b==='weekday'||b==='weekdays'){rep={type:'weekdays'};take(i,2);continue;}
      if(b==='week'){rep={type:'weekly'};take(i,2);continue;}
      if(b==='other'||b==='second'){continue;}
      const di=RM_DOW.indexOf(b);const ds=RM_DOW_SHORT[b];
      if(di>=0||ds!==undefined){rep={type:'weekly'};day={type:'dow',dow:di>=0?di:ds,mod:null};take(i,2);continue;}
      if(b==='night'||b==='evening'){continue;}
    }
  }
  /* ---- pass 2: "for N days/weeks", "N times", "starting tomorrow" ---- */
  let span=null;
  for(let i=0;i<T.length;i++){const a=w(i);if(!a)continue;
    if(a==='for'){let j=i+1;let skip=0;if(w(j)==='the'&&w(j+1)==='next'){skip=2;j+=2;}else if(w(j)==='the'&&w(j+1)==='rest'){continue;}else if(w(j)==='next'){skip=1;j+=1;}
      const na=numAt(j);if(na){const n=na.n;const u=rmUnit(w(j+na.len));
      if(u&&(u==='day'||u==='week'||u==='month')){span={n,u};take(i,1+skip+na.len+1);continue;}
      if(w(j+na.len)==='times'||w(j+na.len)==='time'){total=n;take(i,1+skip+na.len+1);continue;}}
    }
    if(rmNum(a)!=null&&/^\d+$/.test(a)&&(w(i+1)==='times'||w(i+1)==='time')&&rep){const n=rmNum(a);if(n>0){total=n;take(i,2);continue;}}
    if((a==='starting'||a==='starts'||a==='beginning'||a==='from')&&(DAYWORDS[w(i+1)]||RM_DOW.indexOf(w(i+1))>=0)){startWord=true;take(i,1);continue;}
  }
  /* ---- pass 3: durations ("in 20 minutes") ---- */
  for(let i=0;i<T.length&&!dur;i++){const a=w(i);if(!a)continue;
    if(a==='in'||a==='after'){
      if(w(i+1)==='half'&&((w(i+2)==='an'&&rmUnit(w(i+3))==='hour')||rmUnit(w(i+2))==='hour')){const k=w(i+2)==='an'?4:3;dur={min:30};take(i,k);break;}
      if((w(i+1)==='an'||w(i+1)==='a'||w(i+1)==='one')&&rmUnit(w(i+2))==='hour'&&w(i+3)==='and'&&w(i+4)==='a'&&w(i+5)==='half'){dur={min:90};take(i,6);break;}
      if(w(i+1)==='a'&&w(i+2)==='couple'){let k=3;if(w(i+3)==='of')k=4;const u=rmUnit(w(i+k));if(u&&u!=='month'){dur=rmDur(2,u);take(i,k+1);break;}}
      const na=numAt(i+1);
      if(na){const k=1+na.len;const u=rmUnit(w(i+k));
        if(u&&u!=='month'){
          if(w(i+k+1)==='and'&&w(i+k+2)==='a'&&w(i+k+3)==='half'&&u==='hour'){dur={min:na.n*60+30};take(i,k+4);break;}
          dur=rmDur(na.n,u);take(i,k+1);if(w(i+k)==='from'&&w(i+k+1)==='now')take(i+k,2);break;}}
    }
    const na=numAt(i);
    if(na&&/^\d+$/.test(a)){const u=rmUnit(w(i+na.len));const j=i+na.len+1;
      if(u&&u!=='month'&&((w(j)==='from'&&w(j+1)==='now')||w(j)==='later')){dur=rmDur(na.n,u);take(i,na.len+1+(w(j)==='later'?1:2));break;}}
  }
  function rmDur(n,u){return u==='min'?{min:n}:u==='hour'?{min:n*60}:u==='day'?{days:n}:{days:n*7};}
  /* ---- pass 4: day words ---- */
  for(let i=0;i<T.length;i++){const a=w(i);if(!a)continue;
    if(a==='day'&&false)continue;
    if(a==='the'&&w(i+1)==='day'&&w(i+2)==='after'&&w(i+3)==='tomorrow'){day={type:'off',n:2};take(i,4);continue;}
    if(a==='day'&&w(i+1)==='after'&&w(i+2)==='tomorrow'){day={type:'off',n:2};take(i,3);continue;}
    if(a==='tomorrow'||a==='tmrw'){day={type:'off',n:1};take(i,1);continue;}
    if(a==='today'){day={type:'off',n:0};take(i,1);continue;}
    if(a==='tonight'){day=day||{type:'off',n:0};part='night';take(i,1);continue;}
    if(a==='next'&&w(i+1)==='week'&&!RM_DOW.includes(w(i+2))){day={type:'off',n:7,week:true};take(i,2);continue;}
    if((a==='next'||a==='this'||a==='on'||a==='by'||a==='every')&&w(i+1)){const b=w(i+1);let di=RM_DOW.indexOf(b);if(di<0&&RM_DOW_SHORT[b]!==undefined)di=RM_DOW_SHORT[b];
      if(di>=0){day={type:'dow',dow:di,mod:a==='next'?'next':null};take(i,2);continue;}}
    {const di=RM_DOW.indexOf(a);if(di>=0){day={type:'dow',dow:di,mod:null};take(i,1);continue;}}
    /* dates: october 25th, oct 25, 25 october, the 25th, 10/25 */
    {let mi=RM_MONTHS.indexOf(a);if(mi<0&&RM_MON_SHORT[a]!==undefined)mi=RM_MON_SHORT[a];
      if(mi>=0){const d=/^(\d{1,2})(st|nd|rd|th)?$/.exec(w(i+1)||'');if(d&&+d[1]>=1&&+d[1]<=31){const pre=w(i-1)==='on'&&!used[i-1]?1:0;day={type:'date',m:mi,d:+d[1]};take(i-pre,2+pre);continue;}}
      const d2=/^(\d{1,2})(st|nd|rd|th)?$/.exec(a);
      if(d2&&+d2[1]>=1&&+d2[1]<=31){let mi2=RM_MONTHS.indexOf(w(i+1)||'');if(mi2<0&&RM_MON_SHORT[w(i+1)||'']!==undefined)mi2=RM_MON_SHORT[w(i+1)];
        if(mi2>=0&&!(w(i-1)==='in')){day={type:'date',m:mi2,d:+d2[1]};take(i,2);continue;}
        if(d2[2]&&(w(i-1)==='the'||w(i-1)==='on')&&(w(i-1)==='the'?(w(i-2)==='on'?true:true):true)){const pre=w(i-1)==='the'&&w(i-2)==='on'?2:1;day={type:'dom',d:+d2[1]};take(i-pre,pre+1);continue;}}
      const md=/^(\d{1,2})\/(\d{1,2})$/.exec(a);
      if(md&&+md[1]>=1&&+md[1]<=12&&+md[2]>=1&&+md[2]<=31){const pre=w(i-1)==='on'?1:0;day={type:'date',m:+md[1]-1,d:+md[2]};take(i-pre,1+pre);continue;}}
  }
  /* ---- pass 5: parts of the day (with "in the", "this", "at") ---- */
  for(let i=0;i<T.length;i++){const a=w(i);if(!a)continue;
    if(isPart(a)){let s=i,n=1;
      if(w(i-1)==='the'&&w(i-2)==='in'){s=i-2;n=3;}else if(w(i-1)==='the'&&w(i-2)==='of'){}else if(w(i-1)==='this'||w(i-1)==='at'||w(i-1)==='in'){s=i-1;n=2;}
      if(w(i-1)==='this'&&!day)day={type:'off',n:0,thisPart:true};
      if(!part)part=a;take(s,n);continue;}
    if(a==='noon'||a==='midday'){clock={h:12,m:0,mer:'pm',explicit:true};const s=w(i-1)==='at'?i-1:i;take(s,s===i?1:2);continue;}
    if(a==='midnight'){clock={h:0,m:0,mer:'am',explicit:true};const s=w(i-1)==='at'?i-1:i;take(s,s===i?1:2);continue;}
  }
  /* ---- pass 6: clock times ---- */
  for(let i=0;i<T.length&&!clock;i++){const a=w(i);if(!a)continue;
    let m=/^(\d{1,2})(?::(\d{2}))?(am|pm)$/.exec(a);
    if(m){const pre=w(i-1)==='at'||w(i-1)==='@'?1:0;clock={h:+m[1],m:+(m[2]||0),mer:m[3],explicit:true};take(i-pre,1+pre);if(w(i+1)==='oclock')take(i+1,1);if(clock.h<1||clock.h>12||clock.m>59){clock=null;}continue;}
    m=/^(\d{1,2}):(\d{2})$/.exec(a);
    if(m){const pre=w(i-1)==='at'?1:0;let h=+m[1],mi=+m[2];if(mi>59||h>24)continue;const nx=w(i+1);
      if(nx==='am'||nx==='pm'){if(h<1||h>12)continue;clock={h,m:mi,mer:nx,explicit:true};take(i-pre,2+pre);}
      else if(h>=13||h===0){clock={h:h%24,m:mi,mer:'24',explicit:true};take(i-pre,1+pre);}
      else{clock={h,m:mi,mer:null,explicit:false};take(i-pre,1+pre);}
      continue;}
    if(a==='at'||a==='@'){const nn=w(i+1);const na=numAt(i+1);if(!na||nn==='a'||nn==='an')continue;let n=na.n;let len=1+na.len;let mins=0;
      if(/^\d+$/.test(nn)){if(w(i+len)&&/^\d{2}$/.test(w(i+len))&&+w(i+len)<60&&(w(i+len+1)==='am'||w(i+len+1)==='pm')){mins=+w(i+len);len++;}}
      else{const nb=numAt(i+len);if(nb&&nb.n>=10&&nb.n<60&&n<=12&&!rmUnit(w(i+len+nb.len))){mins=nb.n;len+=nb.len;}}
      if(n>24||(n===24&&mins>0))continue;
      let mer=null;const nx=w(i+len);if(nx==='am'||nx==='pm'){mer=nx;len++;}
      if(n>=13||n===0){clock={h:n%24,m:mins,mer:'24',explicit:true};}
      else clock={h:n,m:mins,mer,explicit:!!mer};
      take(i,len);if(w(i+len)==='oclock')take(i+len,1);continue;}
  }
  /* ---- build the leftover words as the reminder text ---- */
  const left=T.filter((t,i)=>!used[i]).map(t=>t.raw);
  let txt=left.join(' ').trim();
  txt=txt.replace(/^(?:please\s+)?(?:hey\s+)?remind\s+me\s+(?:to\s+|about\s+|that\s+|of\s+)?/i,'').replace(/^(?:please\s+)?(?:set\s+a\s+reminder\s+(?:to\s+|for\s+|about\s+)?)/i,'').replace(/^(?:to|about|that)\s+/i,'');
  txt=txt.replace(/\s+(?:at|on|in|for|by|from|starting|every|each|the|this|next|and|after)\s*$/i,'').replace(/^(?:at|on|in|for|by|from|and)\s+(?=\S)/i,'').replace(/\s{2,}/g,' ').replace(/[\s,;.]+$/,'').trim();
  R.text=txt;
  /* ---- resolve ---- */
  const foundTime=!!(dur||clock||part||day||rep);
  R.found=foundTime;
  if(!foundTime){return R;}
  const nowD=new Date(now);
  /* duration wins */
  if(dur&&!rep){
    if(dur.min!=null){R.due=now+dur.min*60000;R.hasTime=true;R.notes.push('relative');return R;}
    let base=new Date(now);base.setDate(base.getDate()+dur.days);
    let h=base.getHours(),mm=base.getMinutes();
    if(clock){const c=rmClock(clock,part,true,null,null);h=c.h;mm=c.m;if(c.assumed){R.assumed=true;R.notes.push(c.note);}}
    else if(part){const [ph,pm]=rmHM(parts[part]);h=ph;mm=pm;}
    else R.notes.push('I kept the same time of day as right now. Change it below if you want a different time.');
    R.due=rmAtDay(now,dur.days,h,mm);R.hasTime=true;return R;
  }
  /* time of day */
  let H=null,M=0,ambiguous=false,partDefaulted=false;
  const hasDayRef=!!day&&!(day.type==='off'&&day.n===0&&day.thisPart&&!clock);
  if(clock){
    const c=rmClock(clock,part,false,(day&&!(day.type==='off'&&day.n===0))?day:null,{now,parts});
    if(c.ambiguous){ambiguous=true;H=c.h;M=c.m;R._alt=c.alt;if(c.note){R.assumed=true;R.notes.push(c.note);}}
    else{H=c.h;M=c.m;if(c.assumed){R.assumed=true;R.notes.push(c.note);}}
  }else if(part){[H,M]=rmHM(parts[part]);}
  else{
    /* a day or repeat with no time: use a calm default and say so */
    if(day&&day.type==='off'&&day.n===0&&!rep){
      // today with no time: next of the part-of-day defaults that is still ahead
      const order=['morning','afternoon','evening','night'];let pick=null;
      for(const p of order){const [ph,pm]=rmHM(parts[p]);if(rmAtDay(now,0,ph,pm)>now){pick=p;break;}}
      if(!pick)pick='morning';[H,M]=rmHM(parts[pick]);R.assumed=true;partDefaulted=true;
      R.notes.push('You did not say a time, so I picked '+pick+' ('+rmFmtHM(H,M)+').');
    }else{[H,M]=rmHM(parts.morning);R.assumed=true;partDefaulted=true;
      R.notes.push('You did not say a time, so I picked morning ('+rmFmtHM(H,M)+').');}
  }
  /* day */
  let due=null;
  const todayAt=(h,m)=>rmAtDay(now,0,h,m);
  if(!day||day.type==='off'&&day.n===0){
    let cand=todayAt(H,M);
    if(ambiguous&&R._alt){
      const opts2=[];[0,1].forEach(dd=>{opts2.push([rmAtDay(now,dd,H,M),H,M]);opts2.push([rmAtDay(now,dd,R._alt.h,R._alt.m),R._alt.h,R._alt.m]);});
      const best=opts2.filter(o=>o[0]>now).sort((x,y)=>x[0]-y[0])[0];
      cand=best[0];H=best[1];M=best[2];
      R.notes[R.notes.length-1]='You did not say AM or PM, so I picked '+rmFmtHM(H,M)+', the next time it is that o\u2019clock.';
    }else if(cand<=now){cand=rmAtDay(now,1,H,M);R.notes.push('That time has already passed today, so I picked tomorrow.');}
    due=cand;
  }else if(day.type==='off'){
    if(ambiguous)R.notes.push('You did not say AM or PM, so I picked '+rmFmtHM(H,M)+'. Change it below if that is wrong.');
    due=rmAtDay(now,day.n,H,M);
    if(day.week&&!clock&&!part){/* next week: same weekday, morning */}
    if(due<=now){due=rmAtDay(now,day.n+1,H,M);R.notes.push('That time has already passed, so I picked the next day.');}
  }else if(day.type==='dow'){
    let delta=(day.dow-nowD.getDay()+7)%7;
    if(day.mod==='next'&&delta===0)delta=7;
    if(day.mod==='next'&&delta>0){/* the coming one */}
    due=rmAtDay(now,delta,H,M);
    if(due<=now){due=rmAtDay(now,delta+7,H,M);}
    if(ambiguous)R.notes.push('You did not say AM or PM, so I picked '+rmFmtHM(H,M)+'. Change it below if that is wrong.');
  }else if(day.type==='date'||day.type==='dom'){
    let y=nowD.getFullYear();let mo=day.type==='date'?day.m:nowD.getMonth();
    let d=new Date(y,mo,day.d,H,M,0,0);
    if(day.type==='dom'){
      while(d.getDate()!==day.d||d.getTime()<=now){mo++;if(mo>11){mo=0;y++;}d=new Date(y,mo,day.d,H,M,0,0);if(y>nowD.getFullYear()+2)break;}
    }else{
      if(d.getDate()!==day.d){/* e.g. Feb 30 */R.notes.push('That date does not exist, so I could not use it.');d=null;}
      else if(d.getTime()<=now){d=new Date(y+1,mo,day.d,H,M,0,0);R.notes.push('That date has passed this year, so I picked next year.');}
    }
    due=d?d.getTime():null;
    if(ambiguous&&due)R.notes.push('You did not say AM or PM, so I picked '+rmFmtHM(H,M)+'. Change it below if that is wrong.');
  }
  R.hasTime=true;
  /* repeats */
  if(rep){
    const r={type:rep.type,total:null};
    if(rep.type==='weekly'){if(day&&day.type==='dow')r.dow=day.dow;else if(due)r.dow=new Date(due).getDay();}
    if(rep.type==='weekdays'&&due){let d=new Date(due);while(d.getDay()===0||d.getDay()===6){d.setDate(d.getDate()+1);d.setHours(H,M,0,0);}if(d.getTime()!==due){R.notes.push('Weekdays only, so the first one is on a '+RM_DOW[d.getDay()][0].toUpperCase()+RM_DOW[d.getDay()].slice(1)+'.');due=d.getTime();}}
    if(rep.type==='daily'&&dur&&dur.days)due=rmAtDay(now,dur.days,H,M);
    R.rep=r;
    if(due){
      if(total!=null)r.total=total;
      else if(span){const days=span.u==='day'?span.n:span.u==='week'?span.n*7:span.n*30;r.total=rmCountIn(r,due,days,H,M);}
      if(r.total!=null&&r.total<1)r.total=1;
    }
  }
  R.due=due;
  return R;
}
function rmCountIn(rep,first,days,H,M){/* how many occurrences fall inside "days" days starting at the first one */
  const end=new Date(first);end.setDate(end.getDate()+days);end.setHours(0,0,0,0);
  let n=0,t=first;for(let g=0;g<400&&t<end.getTime();g++){n++;t=rmStep({type:rep.type,dow:rep.dow},t,H,M);}return Math.max(1,n);
}
function rmFmtHM(h,m){const ap=h>=12?'PM':'AM';const hh=h%12===0?12:h%12;return hh+':'+String(m).padStart(2,'0')+' '+ap;}
/* Turns a spoken clock like "5" or "7:30 pm" into 24h, and says when it had to pick AM or PM. */
function rmClock(c,part,noAlt,day,ctx){
  if(c.mer==='24')return {h:c.h,m:c.m};
  let h=c.h,m=c.m;
  if(c.mer==='am'){h=h%12;return {h,m};}
  if(c.mer==='pm'){h=h%12+12;return {h,m};}
  /* no AM/PM written */
  if(part==='morning'){h=h%12;return {h,m};}
  if(part==='afternoon'||part==='evening'||part==='night'){h=h===12?(part==='night'?0:12):h%12+12;return {h,m};}
  if(h===12){const r={h:12,m,assumed:true,note:'You did not say AM or PM, so I picked 12:'+String(m).padStart(2,'0')+' PM (midday).'};return r;}
  const pref=h<=6?h+12:h;const other=h<=6?h:h+12;
  if(noAlt||day)return {h:pref,m,assumed:true,note:'You did not say AM or PM, so I picked '+rmFmtHM(pref,m)+'. Change it below if that is wrong.'};
  return {h:pref,m,ambiguous:true,alt:{h:other,m},note:'AMBIG'};
}
/* next occurrence for repeats, keeping the same clock time */
function rmStep(rep,fromTs,H,M){
  const d=new Date(fromTs);let n=0;
  do{d.setDate(d.getDate()+(rep.type==='weekly'?7:1));d.setHours(H,M,0,0);n++;}while(rep.type==='weekdays'&&(d.getDay()===0||d.getDay()===6)&&n<10);
  return d.getTime();
}
/*RM-PARSER-END*/

/* ================= Remind Me ================= */
/* Saved shape: S.rm = {items:[...], read, nudge, nudgeMax, parts, quiet, seen}. Old saves without S.rm are filled in safely by rmNorm(). */
function RMDEF(){return {items:[],read:true,nudge:5,nudgeMax:3,parts:Object.assign({},RM_PARTS_DEF),quiet:{on:false,from:'22:00',to:'07:00'},seen:null};}
function rmNorm(){
  const d=RMDEF();const o=(S.rm&&typeof S.rm==='object')?S.rm:{};
  const r=Object.assign(d,o);
  r.parts=Object.assign({},RM_PARTS_DEF,(o.parts&&typeof o.parts==='object')?o.parts:{});
  Object.keys(r.parts).forEach(k=>{if(!/^\d{1,2}:\d{2}$/.test(r.parts[k]))r.parts[k]=RM_PARTS_DEF[k];});
  r.quiet=Object.assign({on:false,from:'22:00',to:'07:00'},(o.quiet&&typeof o.quiet==='object')?o.quiet:{});
  r.items=(Array.isArray(o.items)?o.items:[]).filter(x=>x&&typeof x==='object'&&typeof x.text==='string'&&isFinite(x.due)).map(x=>Object.assign({id:'r'+Math.random().toString(36).slice(2,8),time:null,rep:{type:'once',total:null},left:null,habit:false,status:'active',snooze:null,created:Date.now(),doneAt:null,alerted:'',nudges:0,lastAlert:0,missed:0,doneCount:0,log:[]},x,{rep:Object.assign({type:'once',total:null},x.rep||{})}));
  r.read=r.read!==false;r.nudge=[0,2,5,10].includes(+r.nudge)?+r.nudge:5;r.nudgeMax=[1,3,5].includes(+r.nudgeMax)?+r.nudgeMax:3;
  S.rm=r;
}
let rmOffset=0;const rmNow=()=>Date.now()+rmOffset;
const RMDOWN=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const RMMON=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const rmTimeStr=ts=>{const d=new Date(ts);return rmFmtHM(d.getHours(),d.getMinutes());};
function rmDayStr(ts,now){const d=new Date(ts),a=new Date(d);a.setHours(0,0,0,0);const b=new Date(now);b.setHours(0,0,0,0);const diff=Math.round((a-b)/86400000);
  if(diff===0)return 'Today';if(diff===1)return 'Tomorrow';if(diff===-1)return 'Yesterday';return RMDOWN[d.getDay()]+', '+RMMON[d.getMonth()]+' '+d.getDate();}
const rmWhen=(ts,now)=>rmDayStr(ts,now==null?rmNow():now)+' at '+rmTimeStr(ts);
function rmRel(ts,now){now=now==null?rmNow():now;const m=Math.round((ts-now)/60000);const a=Math.abs(m);const pl=(n,u)=>n+' '+u+(n===1?'':'s');
  let s;if(a<1)return 'right now';if(a<60)s=pl(a,'minute');else if(a<48*60){const h=Math.floor(a/60),mm=a%60;s=pl(h,'hour')+(mm?' '+pl(mm,'minute'):'');}else s=pl(Math.round(a/1440),'day');
  return m>0?'in '+s:s+' ago';}
function rmRepText(rep,ts,n,mode){
  if(!rep||rep.type==='once')return '';const t=rmTimeStr(ts);let b;
  if(rep.type==='daily')b='Every day at '+t;else if(rep.type==='weekdays')b='Every weekday at '+t;else b='Every '+RMDOWN[rep.dow!=null?rep.dow:new Date(ts).getDay()]+' at '+t;
  const unit=rep.type==='daily'?'day':rep.type==='weekdays'?'weekday':'week';
  if(n==null)return b+', until you stop it';
  return mode==='left'?b+' \u00b7 '+n+' more '+unit+(n===1?'':'s'):b+', for '+n+' '+unit+(n===1?'':'s');
}
const rmHMstr=ts=>{const d=new Date(ts);return String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0');};
function rmQuietAdjust(t){
  const q=S.rm.quiet;if(!q.on)return t;const [fh,fm]=rmHM(q.from),[th,tm]=rmHM(q.to);const d=new Date(t);const m=d.getHours()*60+d.getMinutes();const f=fh*60+fm,e=th*60+tm;if(f===e)return t;
  const over=f>e;const inQ=over?(m>=f||m<e):(m>=f&&m<e);if(!inQ)return t;
  const out=new Date(t);out.setHours(th,tm,0,0);if(over&&m>=f)out.setDate(out.getDate()+1);return out.getTime();
}
const rmInQuiet=t=>rmQuietAdjust(t)!==t;
const rmFireAt=r=>rmQuietAdjust(r.snooze||r.due);
const rmActive=()=>S.rm.items.filter(r=>r.status==='active');
const rmDueList=(now)=>{now=now==null?rmNow():now;return rmActive().filter(r=>rmFireAt(r)<=now).sort((a,b)=>rmFireAt(a)-rmFireAt(b));};
const rmUpcoming=(now)=>{now=now==null?rmNow():now;return rmActive().filter(r=>rmFireAt(r)>now).sort((a,b)=>rmFireAt(a)-rmFireAt(b));};
const rmNext=()=>{const a=rmActive().sort((x,y)=>rmFireAt(x)-rmFireAt(y));return a[0]||null;};
function rmAdd(o){
  const rep=Object.assign({type:'once',total:null},o.rep||{});let due=o.due;
  if(rep.type==='weekdays'){const d=new Date(due);const H=d.getHours(),M=d.getMinutes();while(d.getDay()===0||d.getDay()===6){d.setDate(d.getDate()+1);d.setHours(H,M,0,0);}due=d.getTime();}
  if(rep.type==='weekly'&&rep.dow==null)rep.dow=new Date(due).getDay();
  const r={id:'r'+Date.now().toString(36)+Math.random().toString(36).slice(2,5),text:String(o.text||'').trim().slice(0,300),due,time:rmHMstr(due),rep,left:rep.type==='once'?null:(rep.total==null?null:rep.total),habit:!!o.habit,status:'active',snooze:null,created:rmNow(),doneAt:null,alerted:'',nudges:0,lastAlert:0,missed:0,doneCount:0,log:[]};
  S.rm.items.push(r);save();rmSyncTriggers();return r;
}
/* Move a repeating reminder on to its next time after "now". Skipped times count against "for N days", never against the person. */
function rmAdvance(r,now){
  if(r.rep.type==='once'){r.status='done';r.doneAt=now;r.snooze=null;return;}
  const [H,M]=rmHM(r.time||rmHMstr(r.due));let t=r.due,used=1,missed=0;
  t=rmStep(r.rep,t,H,M);
  while(t<=now&&used<500){missed++;used++;t=rmStep(r.rep,t,H,M);}
  r.missed+=missed;
  if(r.left!=null){r.left-=used;if(r.left<=0){r.status='done';r.doneAt=now;r.snooze=null;return;}}
  r.due=t;r.snooze=null;r.alerted='';r.nudges=0;r.lastAlert=0;
}
function rmMarkDone(id,opt){
  const r=S.rm.items.find(x=>x.id===id);if(!r)return;const now=rmNow();
  const dueWas=r.due;
  r.doneCount++;r.log.push({at:now,did:true});if(r.log.length>40)r.log.shift();
  rmAdvance(r,now);save();
  addGauge(2,'rm:'+r.id+':'+dueWas,false);chime(false);rmSyncTriggers();
  if(!(opt&&opt.quiet)){const msg=r.status==='active'?'Done. Next one: '+rmWhen(r.due,now)+'.':'Done. Nice work.';toast(msg,2600);}
  return r;
}
function rmNotYet(id){const r=S.rm.items.find(x=>x.id===id);if(!r)return;const now=rmNow();r.log.push({at:now,did:false});if(r.log.length>40)r.log.shift();r.snooze=now+60*60000;r.alerted='';r.nudges=0;r.lastAlert=0;save();rmSyncTriggers();toast('No problem. I will ask again in 1 hour.',2600);}
function rmSnooze(id,kind){
  const r=S.rm.items.find(x=>x.id===id);if(!r)return;const now=rmNow();let t;
  if(kind==='tomorrow'){const [h,m]=rmHM(S.rm.parts.morning);t=rmAtDay(now,1,h,m);}else t=now+(kind==='hour'?60:10)*60000;
  r.snooze=t;r.alerted='';r.nudges=0;r.lastAlert=0;save();rmSyncTriggers();
  toast('Snoozed until '+rmWhen(t,now)+'.',2600);
}
let rmUndoT=null,rmStash=null;
function rmDelete(id){
  const i=S.rm.items.findIndex(x=>x.id===id);if(i<0)return;const [r]=S.rm.items.splice(i,1);rmStash={items:[r],at:[i]};save();rmSyncTriggers();
  if(rmAlertId===id)rmCloseAlert();
  rmSnack('Deleted \u201c'+(r.text.length>28?r.text.slice(0,27)+'\u2026':r.text)+'\u201d.');render();
}
function rmSnack(msg){
  let el=$('#rm-snack');if(!el){el=document.createElement('div');el.id='rm-snack';el.setAttribute('role','status');document.body.appendChild(el);
    el.addEventListener('click',e=>{if(e.target.closest('[data-undo]')){rmUndo();}});}
  el.innerHTML=`<span>${esc(msg)}</span><button class="btn primary" data-undo>${ic('undo')}Undo</button>`;el.classList.add('show');
  clearTimeout(rmUndoT);rmUndoT=setTimeout(()=>{el.classList.remove('show');rmStash=null;},9000);
}
function rmUndo(){
  const el=$('#rm-snack');if(el)el.classList.remove('show');clearTimeout(rmUndoT);
  if(!rmStash)return;rmStash.items.forEach((r,k)=>{const at=Math.min(rmStash.at[k],S.rm.items.length);S.rm.items.splice(at,0,r);});rmStash=null;save();rmSyncTriggers();toast('Brought it back.',2000);render();
}
/* ---------- Alerts while the app is open ---------- */
let rmQueue=[],rmAlertId=null,rmLastTick=null,rmTickT=null,rmCatch=null,rmSeenSaved=0;
const rmLog=[];
function rmRoot(){let el=$('#rm-alert-root');if(!el){el=document.createElement('div');el.id='rm-alert-root';document.body.appendChild(el);
  el.addEventListener('click',rmAlertClick);}return el;}
function rmCloseAlert(){rmAlertId=null;rmCatch=null;const el=$('#rm-alert-root');if(el)el.innerHTML='';}
function rmSpeakAlert(r,nudge){
  if(!S.rm.read)return;
  const lines=[nudge?'Reminder':'You asked me to remind you',r.text];if(r.habit)lines.push('Did you do it?');
  try{speakSeq(lines);}catch(e){}
}
function rmShowAlert(id,nudge){
  const r=S.rm.items.find(x=>x.id===id);if(!r||r.status!=='active')return;
  rmAlertId=id;rmCatch=null;const now=rmNow();
  const more=rmDueList(now).filter(x=>x.id!==id).length;
  const sc=cur&&cur.name;
  rmRoot().innerHTML=`<div class="rm-back"><div class="rm-alert" role="alertdialog" aria-modal="true" aria-labelledby="rm-at" aria-describedby="rm-as">
    <div class="rm-bell">${ic('bell')}</div>
    <div class="rm-body"><span class="steptag">${r.habit?'Did you do it?':'Reminder'}</span>
    <h2 id="rm-at">${esc(r.text)}</h2>
    <p class="sub" id="rm-as">Set for ${esc(rmWhen(r.due,now))}${more?' \u00b7 '+more+' more waiting':''}</p></div>
    <div class="rm-acts">
      <button class="btn primary rm-big" data-ra="done" data-id="${r.id}">${ic('check')}${r.habit?'Yes, done':'Done'}</button>
      ${r.habit?`<button class="btn rm-big" data-ra="notyet" data-id="${r.id}">${ic('clock')}Not yet</button>`:
      `<button class="btn" data-ra="s10" data-id="${r.id}">${ic('clock')}10 min</button><button class="btn" data-ra="s60" data-id="${r.id}">${ic('clock')}1 hour</button><button class="btn" data-ra="stm" data-id="${r.id}">${ic('moon')}Tomorrow</button>`}
    </div>
    <div class="rm-sub2"><button class="btn" data-ra="read" data-id="${r.id}">${ic('speaker')}Hear it</button><button class="btn" data-ra="later" data-id="${r.id}">${ic('x')}Close for now</button></div>
  </div></div>`;
  const b=$('#rm-alert-root [data-ra=done]');if(b&&!window.__rmNoFocus)b.focus({preventScroll:true});
  rmLog.push({t:now,type:nudge?'nudge':'alert',id});
  rmSpeakAlert(r,nudge);
  if(S.sensory==='full'){chime(true);}
}
function rmShowCatchUp(list){
  rmCatch=list.map(r=>r.id);rmAlertId=null;const n=list.length;
  const names=list.slice(0,3).map(r=>`<li>${esc(r.text)}</li>`).join('')+(n>3?`<li class="more">and ${n-3} more</li>`:'');
  rmRoot().innerHTML=`<div class="rm-back"><div class="rm-alert" role="alertdialog" aria-modal="true" aria-labelledby="rm-at">
    <div class="rm-bell">${ic('bell')}</div>
    <div class="rm-body"><span class="steptag">While you were away</span><h2 id="rm-at">You missed ${n===1?'1 reminder':n+' reminders'} while away</h2>
    <p class="sub">That is okay. Here ${n===1?'it is':'they are'}:</p><ul class="rm-miss">${names}</ul></div>
    <div class="rm-acts"><button class="btn primary rm-big" data-ra="see">${ic('list')}See my reminders</button>
    <button class="btn" data-ra="snoozeall">${ic('clock')}Remind me again in 10 min</button></div>
    <div class="rm-sub2"><button class="btn" data-ra="read">${ic('speaker')}Hear it</button><button class="btn" data-ra="later">${ic('x')}Close for now</button></div></div></div>`;
  rmLog.push({t:rmNow(),type:'catchup',n});
  if(S.rm.read){const l=n<=5?`You missed ${n===1?'1 reminder':n+' reminders'} while away. That is okay.`:'You missed some reminders while away. That is okay.';try{speakSeq([l]);}catch(e){}}
}
function rmAlertClick(e){
  const b=e.target.closest('[data-ra]');if(!b)return;const a=b.dataset.ra,id=b.dataset.id;
  const next=()=>{rmCloseAlert();setTimeout(()=>{rmTick();render();},60);};
  if(a==='done'){stopSpeech();rmMarkDone(id);next();}
  else if(a==='notyet'){stopSpeech();rmNotYet(id);next();}
  else if(a==='s10'){stopSpeech();rmSnooze(id,'10');speakSeq(['Snoozed']);next();}
  else if(a==='s60'){stopSpeech();rmSnooze(id,'hour');speakSeq(['Snoozed']);next();}
  else if(a==='stm'){stopSpeech();rmSnooze(id,'tomorrow');speakSeq(['Snoozed']);next();}
  else if(a==='read'){const r=S.rm.items.find(x=>x.id===id);if(r){const lines=['You asked me to remind you',r.text];if(r.habit)lines.push('Did you do it?');speakSeq(lines);}else if(rmCatch){speakSeq(['You missed some reminders while away. That is okay.']);}}
  else if(a==='later'){stopSpeech();const keep=id;rmCloseAlert();}
  else if(a==='see'){stopSpeech();rmCloseAlert();go('remind');}
  else if(a==='snoozeall'){stopSpeech();(rmCatch||[]).forEach(i=>{const r=S.rm.items.find(x=>x.id===i);if(r&&r.status==='active'){r.snooze=rmNow()+10*60000;r.alerted='';r.nudges=0;r.lastAlert=0;}});save();rmSyncTriggers();toast('I will remind you again in 10 minutes.',2400);next();}
}
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&(rmAlertId||rmCatch)){stopSpeech();rmCloseAlert();}});
function rmTick(){
  if(!S.rm)return;const now=rmNow();
  const gap=rmLastTick==null?0:now-rmLastTick;rmLastTick=now;
  S.rm.seen=now;if(now-rmSeenSaved>10000){rmSeenSaved=now;save();}
  if(!S.onboarded)return;
  const due=rmDueList(now);const key=r=>r.id+':'+rmFireAt(r);
  let changed=false;const fresh=[],again=[],away=[];
  due.forEach(r=>{const k=key(r);
    if(r.alerted!==k){r.alerted=k;r.nudges=0;r.lastAlert=now;changed=true;if(gap>90000||(rmFireAt(r)<now-90000))away.push(r);else fresh.push(r);}
    else if(S.rm.nudge&&r.nudges<S.rm.nudgeMax&&now-r.lastAlert>=S.rm.nudge*60000&&rmAlertId!==r.id){r.nudges++;r.lastAlert=now;changed=true;again.push(r);}});
  if(changed)save();
  if(away.length){away.forEach(r=>{r.nudges=S.rm.nudgeMax;});save();if(!rmAlertId&&!rmCatch)rmShowCatchUp(away);else rmCatch=(rmCatch||[]).concat(away.map(r=>r.id));}
  fresh.forEach(r=>{rmQueue.push({id:r.id,nudge:false});if(document.hidden)rmNotify({title:'Reminder',body:r.text,tag:'hk-'+r.id+'-'+rmFireAt(r),id:r.id});});
  again.forEach(r=>{if(!rmQueue.some(q=>q.id===r.id))rmQueue.push({id:r.id,nudge:true});if(document.hidden)rmNotify({title:'Reminder',body:r.text,tag:'hk-'+r.id+'-'+rmFireAt(r)+'-n'+r.nudges,id:r.id});});
  while(!rmAlertId&&!rmCatch&&rmQueue.length){const q=rmQueue.shift();const r=S.rm.items.find(x=>x.id===q.id);if(r&&r.status==='active'&&rmFireAt(r)<=now){rmShowAlert(q.id,q.nudge);break;}}
  /* keep the Remind Me list fresh when it is on screen */
  const rc=route()[0];if((fresh.length||again.length||away.length)&&((rc==='remind'&&!route()[1])||rc==='home'))render();
  rmBadge();
}
function rmBadge(){const n=rmDueList().length;document.querySelectorAll('.rm-dot').forEach(el=>{el.textContent=n;el.style.display=n?'':'none';});}
function rmOnVisible(){if(document.visibilityState==='visible')rmTick();else{S.rm.seen=rmNow();save();}}
document.addEventListener('visibilitychange',rmOnVisible);
window.addEventListener('pagehide',()=>{try{S.rm.seen=rmNow();save();}catch(e){}});
/* ---------- Phone notifications (as far as a web page can go) ---------- */
function rmCaps(){
  const ua=navigator.userAgent||'';const ios=/iPad|iPhone|iPod/.test(ua)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
  const standalone=navigator.standalone===true||(window.matchMedia&&window.matchMedia('(display-mode: standalone)').matches);
  const notif='Notification' in window;
  return {ios,android:/Android/.test(ua),standalone,notif,perm:notif?Notification.permission:'unsupported',sw:'serviceWorker' in navigator,secure:window.isSecureContext!==false,
    triggers:notif&&('showTrigger' in Notification.prototype)&&typeof window.TimestampTrigger!=='undefined'};
}
let rmReg=null;
function rmRegisterSW(){
  if(!('serviceWorker' in navigator))return Promise.resolve(null);
  if(!(location.protocol==='https:'||location.hostname==='localhost'||location.hostname==='127.0.0.1'))return Promise.resolve(null);
  if(rmReg)return Promise.resolve(rmReg);
  return navigator.serviceWorker.register('sw.js',{scope:'./',updateViaCache:'none'}).then(r=>{rmReg=r;return r;}).catch(()=>null);
}
if('serviceWorker' in navigator){try{navigator.serviceWorker.addEventListener('message',e=>{if(e.data&&e.data.type==='hk-open'){go('remind');setTimeout(rmTick,100);}});}catch(e){}}
async function rmNotify(o){
  try{
    if(!('Notification' in window)||Notification.permission!=='granted')return false;
    const opt={body:o.body||'',tag:o.tag||'hk',icon:'img/icon-180.png',badge:'img/icon-180.png',data:{id:o.id||null},renotify:true};
    let reg=rmReg;if(!reg&&'serviceWorker' in navigator){reg=await rmRegisterSW();}
    rmLog.push({t:rmNow(),type:'notify',title:o.title,tag:opt.tag});
    if(reg&&reg.showNotification){await reg.showNotification(o.title,opt);return true;}
    new Notification(o.title,opt);return true;
  }catch(e){return false;}
}
async function rmSyncTriggers(){
  try{
    const c=rmCaps();if(!c.triggers||c.perm!=='granted')return;
    const reg=await rmRegisterSW();if(!reg||!reg.getNotifications)return;
    const old=await reg.getNotifications({includeTriggered:true});old.filter(n=>/^hk-sched-/.test(n.tag||'')).forEach(n=>n.close());
    const now=rmNow();let count=0;
    for(const r of rmActive().sort((a,b)=>rmFireAt(a)-rmFireAt(b)).slice(0,20)){
      let t=rmFireAt(r);let left=r.left==null?4:Math.min(4,r.left);
      for(let k=0;k<(r.rep.type==='once'?1:left)&&count<60;k++){
        if(t>now+3000){await reg.showNotification('Reminder',{tag:'hk-sched-'+r.id+'-'+t,body:r.text,icon:'img/icon-180.png',badge:'img/icon-180.png',showTrigger:new window.TimestampTrigger(t),data:{id:r.id}});count++;}
        if(r.rep.type==='once')break;const [H,M]=rmHM(r.time||rmHMstr(r.due));t=rmStep(r.rep,t,H,M);}
    }
    S.rm.sched=count;
  }catch(e){}
}
async function rmAskPermission(){
  const c=rmCaps();if(!c.notif){toast('This browser cannot show phone alerts.');return 'unsupported';}
  let p='default';try{p=await Notification.requestPermission();}catch(e){}
  if(p==='granted'){await rmRegisterSW();rmSyncTriggers();}
  render();return p;
}

/* ---------- Capture by voice (Web Speech API) ---------- */
let rmDraft=null,rmRec=null;
const rmMic={on:false,msg:'',kind:''};
function rmFreshDraft(){rmDraft={id:null,phrase:'',text:'',due:null,rep:{type:'once',total:null},habit:false,habitTouched:false,notes:[],parsedPhrase:null,custom:false,pick:null,assumed:false,editing:false};}
rmFreshDraft();
const rmMicOK=()=>!!(window.SpeechRecognition||window.webkitSpeechRecognition);
const RM_NOMIC='This browser cannot listen to speech. That is okay. Type your reminder below. On a phone, you can also tap the little microphone on your keyboard to talk.';
function rmCap(t){t=String(t||'').trim();return t?t[0].toUpperCase()+t.slice(1):t;}
function rmPaintMic(){
  const b=$('#rmmic'),m=$('#rmmicmsg');if(!b)return;
  b.classList.toggle('listening',rmMic.on);b.setAttribute('aria-pressed',String(rmMic.on));
  const l=$('#rmmic .rm-mic-l');if(l)l.textContent=rmMic.on?'Listening\u2026 tap to stop':'Tap and speak';
  if(m){const nm=!rmMic.msg&&!rmMicOK();m.textContent=nm?RM_NOMIC:rmMic.msg;m.className='rm-micmsg '+(nm?'warn':(rmMic.kind||''));}
}
function rmSetPhrase(t){rmDraft.phrase=t;const ta=$('#rmtext');if(ta&&ta.value!==t)ta.value=t;const nx=$('.stepbar .next');if(nx)nx.disabled=!t.trim();}
function rmStopMic(){if(rmRec){try{rmRec.abort();}catch(e){}rmRec=null;}rmMic.on=false;}
function rmListen(){
  if(rmMic.on){try{rmRec&&rmRec.stop();}catch(e){}return;}
  const R=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!R){rmMic.msg=RM_NOMIC;rmMic.kind='warn';rmPaintMic();return;}
  stopSpeech();
  let rec;try{rec=new R();}catch(e){rmMic.msg='I could not start the microphone. Please type your reminder instead.';rmMic.kind='warn';rmPaintMic();return;}
  rmRec=rec;const base=rmDraft.phrase.trim();let got=false,err=null;
  rec.lang=navigator.language||'en-US';rec.interimResults=true;rec.continuous=false;rec.maxAlternatives=1;
  rec.onstart=()=>{rmMic.on=true;rmMic.msg='I am listening. Say what you want to remember, and when.';rmMic.kind='';rmPaintMic();};
  rec.onresult=e=>{let t='';for(let i=0;i<e.results.length;i++)t+=e.results[i][0].transcript;t=t.trim();if(t){got=true;rmSetPhrase((base?base+' ':'')+(base?t:rmCap(t)));}};
  rec.onerror=e=>{err=e&&e.error||'error';};
  rec.onend=()=>{rmMic.on=false;rmRec=null;
    if(err&&err!=='aborted'){
      rmMic.kind='warn';
      rmMic.msg=err==='not-allowed'||err==='service-not-allowed'?'The microphone is turned off for this page. Tap the lock icon near the address bar to allow it, or just type below.':
        err==='no-speech'?'I did not hear anything. Tap the microphone and try again, or type below.':
        err==='audio-capture'?'I cannot find a microphone on this device. Please type below.':
        err==='network'?'Listening needs an internet connection in this browser. Please type below.':'Something went wrong with the microphone. Please type below.';
    }else if(got){rmMic.kind='ok';rmMic.msg='Here is what I heard. Fix anything that is wrong, then tap Next.';}
    else{rmMic.kind='warn';rmMic.msg='I did not catch that. Tap the microphone and try again.';}
    rmPaintMic();};
  try{rec.start();rmMic.on=true;rmMic.msg='Starting the microphone\u2026';rmMic.kind='';rmPaintMic();}catch(e){rmMic.on=false;rmMic.msg='I could not start the microphone. Please type below.';rmMic.kind='warn';rmPaintMic();}
}
/* ---------- Reading the phrase and keeping the draft in step ---------- */
function rmApplyParse(force){
  const d=rmDraft;if(!force&&d.parsedPhrase===d.phrase)return;
  const res=rmParse(d.phrase,rmNow(),{parts:S.rm.parts});
  d.parsedPhrase=d.phrase;d.found=res.found;
  d.text=res.text||(res.found?'':d.phrase.trim());if(!d.text&&!res.found)d.text=d.phrase.trim();
  if(res.due!=null){d.due=res.due;d.rep=Object.assign({type:'once',total:null},res.rep);d.notes=res.notes.filter(n=>n!=='relative');d.assumed=res.assumed;d.pick=null;d.custom=false;
    if(d.rep.type!=='once'&&!d.habitTouched)d.habit=true;}
  else if(!d.editing){d.due=null;d.rep={type:'once',total:null};d.notes=res.found&&res.notes.length?res.notes:[];}
  if(d.due!=null&&d.due<=rmNow()&&!d.editing){d.notes.push('That time is in the past. Please pick a new one.');d.due=null;}
}
function rmLoadDraft(id){
  const r=S.rm.items.find(x=>x.id===id);if(!r){rmFreshDraft();return false;}
  rmDraft={id:r.id,phrase:r.text,text:r.text,due:r.due,rep:Object.assign({},r.rep,{total:r.left!=null?r.left:r.rep.total}),habit:r.habit,habitTouched:true,notes:[],parsedPhrase:r.text,custom:false,pick:null,assumed:false,editing:true};
  if(r.rep.type==='once')rmDraft.rep.total=null;
  return true;
}
function rmDraftDesc(){const d=rmDraft;return d.due==null?'':rmWhen(d.due);}
function rmDraftRepText(){const d=rmDraft;if(d.due==null||d.rep.type==='once')return '';return rmRepText(Object.assign({},d.rep,{dow:d.rep.type==='weekly'?new Date(d.due).getDay():undefined}),d.due,d.rep.total,'for');}
function rmPick(kind){
  const now=rmNow(),d=rmDraft;const P=S.rm.parts;let due=null,rep={type:'once',total:null};const [mh,mm]=rmHM(P.morning),[eh,em]=rmHM(P.evening);
  if(kind==='10')due=now+10*60000;
  else if(kind==='60')due=now+60*60000;
  else if(kind==='eve'){due=rmAtDay(now,0,eh,em);if(due<=now)due=rmAtDay(now,1,eh,em);}
  else if(kind==='tmorn')due=rmAtDay(now,1,mh,mm);
  else if(kind==='week'){due=rmAtDay(now,0,mh,mm);if(due<=now)due=rmAtDay(now,1,mh,mm);rep={type:'daily',total:7};if(!d.habitTouched)d.habit=true;}
  d.due=due;d.rep=rep;d.pick=kind;d.custom=false;d.notes=[];d.assumed=false;
  if(kind==='eve'&&new Date(due).getDate()!==new Date(now).getDate())d.notes.push('This evening has already started, so I picked tomorrow evening.');
}
function rmSetType(type){
  const d=rmDraft;if(d.rep.type===type)return;
  const was=d.rep.type;d.rep={type,total:type==='once'?null:(d.rep.total!=null&&was!=='once'?d.rep.total:(type==='daily'?7:type==='weekdays'?10:4))};
  if(type==='weekly'&&d.due!=null)d.rep.dow=new Date(d.due).getDay();
  if(was==='once'&&type!=='once'&&!d.habitTouched)d.habit=true;
  if(type==='once'&&!d.habitTouched)d.habit=false;
  if(type==='weekdays'&&d.due!=null){const x=new Date(d.due);const H=x.getHours(),M=x.getMinutes();let moved=false;while(x.getDay()===0||x.getDay()===6){x.setDate(x.getDate()+1);x.setHours(H,M,0,0);moved=true;}if(moved){d.due=x.getTime();d.notes=['Weekdays only, so the first one moves to '+rmWhen(d.due)+'.'];}}
}
function rmSaveDraft(){
  const d=rmDraft;if(!d.due||!d.text.trim())return false;
  const rep=Object.assign({},d.rep);if(rep.type==='weekly')rep.dow=new Date(d.due).getDay();if(rep.type==='once')rep.total=null;
  if(d.id){const r=S.rm.items.find(x=>x.id===d.id);if(r){r.text=d.text.trim();r.due=d.due;r.time=rmHMstr(d.due);r.rep=rep;r.left=rep.type==='once'?null:rep.total;r.habit=d.habit;r.status='active';r.snooze=null;r.alerted='';r.nudges=0;r.lastAlert=0;r.doneAt=null;save();rmSyncTriggers();return r;}}
  return rmAdd({text:d.text,due:d.due,rep,habit:d.habit});
}
/* ---------- Siri / link route:  #/remind/new?text=...&when=... ---------- */
function rmQuery(qs){const o={};String(qs||'').split('&').forEach(p=>{if(!p)return;const i=p.indexOf('=');let k=i<0?p:p.slice(0,i),v=i<0?'':p.slice(i+1);
  const dec=x=>{try{return decodeURIComponent(x.replace(/\+/g,' '));}catch(e){return x.replace(/\+/g,' ');}};k=dec(k);v=dec(v);if(!(k in o))o[k]=v;});return o;}
function rmDeepLink(){
  const m=/^#\/remind(?:\/new)?\/?\?(.*)$/.exec(location.hash||'');if(!m)return false;
  const q=rmQuery(m[1]);const text=String(q.text||'').trim().slice(0,400),when=String(q.when||'').trim().slice(0,100);
  rmFreshDraft();rmStopMic();
  const phrase=(text+(when?' '+when:'')).trim();
  rmDraft.phrase=phrase;
  if(phrase){rmApplyParse(true);if(!rmDraft.text&&text)rmDraft.text=text;}
  try{history.replaceState(null,'',location.pathname+location.search+'#/remind/new/'+(phrase?2:1));}catch(e){location.hash='#/remind/new/'+(phrase?2:1);}
  return true;
}

/* ---------- Screens ---------- */
const rmAbs=()=>location.origin+location.pathname;
function rmIcs(r){
  const p2=n=>String(n).padStart(2,'0');const f=ts=>{const d=new Date(ts);return d.getFullYear()+p2(d.getMonth()+1)+p2(d.getDate())+'T'+p2(d.getHours())+p2(d.getMinutes())+'00';};
  const esc2=t=>String(t).replace(/\\/g,'\\\\').replace(/;/g,'\\;').replace(/,/g,'\\,').replace(/\r?\n/g,'\\n');
  const t=r.due;let rr='';
  if(r.rep.type==='daily')rr='RRULE:FREQ=DAILY'+(r.left!=null?';COUNT='+r.left:'');
  else if(r.rep.type==='weekdays')rr='RRULE:FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR'+(r.left!=null?';COUNT='+r.left:'');
  else if(r.rep.type==='weekly')rr='RRULE:FREQ=WEEKLY'+(r.left!=null?';COUNT='+r.left:'');
  const L=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//WingsCrew//Highkeep//EN','CALSCALE:GREGORIAN','BEGIN:VEVENT','UID:'+r.id+'@highkeep','DTSTAMP:'+f(rmNow()),'DTSTART:'+f(t),'DTEND:'+f(t+15*60000),'SUMMARY:'+esc2('Reminder: '+r.text)];
  if(rr)L.push(rr);L.push('BEGIN:VALARM','ACTION:DISPLAY','DESCRIPTION:'+esc2(r.text),'TRIGGER:PT0M','END:VALARM','END:VEVENT','END:VCALENDAR');
  return L.join('\r\n');
}
function rmDownloadIcs(r){
  try{const blob=new Blob([rmIcs(r)],{type:'text/calendar'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='highkeep-reminder.ics';document.body.appendChild(a);a.click();setTimeout(()=>{a.remove();URL.revokeObjectURL(url);},1500);toast('Opening your calendar. Tap Add to save it.',3200);}
  catch(e){toast('Sorry, I could not make a calendar file here.');}
}
function rmExportText(){
  const now=rmNow();const line=r=>'- '+r.text+' \u2014 '+(r.status==='done'?'done':rmWhen(rmFireAt(r),now))+(r.rep.type!=='once'&&r.status==='active'?' ('+rmRepText(r.rep,r.due,r.left,'left')+')':'')+(r.habit?' [asks \u201cDid you do it?\u201d]':'');
  const a=rmActive().sort((x,y)=>rmFireAt(x)-rmFireAt(y)),d=S.rm.items.filter(r=>r.status==='done');
  return 'Highkeep reminders, saved '+new Date(now).toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'})+'\n\nComing up ('+a.length+')\n'+(a.map(line).join('\n')||'- none')+'\n\nDone ('+d.length+')\n'+(d.map(line).join('\n')||'- none')+'\n';
}
function rmCopy(text){
  const fallback=()=>{try{const ta=document.createElement('textarea');ta.value=text;ta.style.cssText='position:fixed;opacity:0';document.body.appendChild(ta);ta.select();const ok=document.execCommand('copy');ta.remove();return ok;}catch(e){return false;}};
  if(navigator.clipboard&&navigator.clipboard.writeText)return navigator.clipboard.writeText(text).then(()=>true).catch(()=>fallback());
  return Promise.resolve(fallback());
}
function rmIcon(r){return r.habit?'repeat':r.rep.type!=='once'?'repeat':'bell';}
function rmItemHTML(r,mode){
  const now=rmNow(),fa=rmFireAt(r),isDue=r.status==='active'&&fa<=now;
  const when=r.status==='done'?('Done '+(r.doneAt?rmDayStr(r.doneAt,now).toLowerCase()+' at '+rmTimeStr(r.doneAt):'')):isDue?('Was due '+rmWhen(fa,now)):rmWhen(fa,now);
  const q=r.status==='active'&&!r.snooze&&rmInQuiet(r.due)?`<small class="rm-q">${ic('moon')}Quiet hours, so I will hold it until ${rmTimeStr(fa)}.</small>`:'';
  const sn=r.status==='active'&&r.snooze&&r.snooze>now?`<small class="rm-q">${ic('clock')}Snoozed until ${rmTimeStr(r.snooze)}</small>`:'';
  const rep=r.status==='active'&&r.rep.type!=='once'?`<small class="rm-rep">${esc(rmRepText(r.rep,r.due,r.left,'left'))}${r.habit?' \u00b7 asks \u201cDid you do it?\u201d':''}</small>`:'';
  const cnt=r.doneCount&&r.rep.type!=='once'?`<small class="rm-rep">Done ${r.doneCount} time${r.doneCount===1?'':'s'} so far</small>`:'';
  const btn=(a,i,l,cls)=>`<button class="rm-b ${cls||''}" data-act="${a}" data-id="${r.id}">${ic(i)}<span>${l}</span></button>`;
  const btns=r.status==='active'?btn('rmdone','check',r.habit?'Did it':'Done','ok')+btn('rmsnooze','clock','Snooze')+btn('rmedit','pencil','Edit')+btn('rmdel','trash','Delete','del'):btn('rmedit','repeat','Again')+btn('rmdel','trash','Delete','del');
  return `<div class="rm-item ${isDue?'due':''} ${r.status==='done'?'isdone':''}"><button class="rm-main" data-act="rmopen" data-id="${r.id}" aria-label="Open: ${esc(r.text)}"><span class="ico">${ic(r.status==='done'?'check':rmIcon(r))}</span><span class="t"><strong>${esc(r.text)}</strong><small>${esc(when)}</small>${rep}${sn}${q}${r.status==='done'?'':cnt}</span></button><div class="rm-btns">${btns}</div></div>`;
}
const rmListActs={
  rmnew:()=>{rmFreshDraft();rmStopMic();rmMic.msg='';rmMic.kind='';go('remind/new/1');},
  rmdone:el=>{rmMarkDone(el.dataset.id);render();},
  rmedit:el=>{go('remind/edit/'+el.dataset.id+'/1');},
  rmdel:el=>rmDelete(el.dataset.id),
  rmsnooze:el=>{const id=el.dataset.id;modal(`<h2>Snooze for how long?</h2><p class="muted">I will remind you again then.</p>`,[['10 minutes',()=>{rmSnooze(id,'10');speakSeq(['Snoozed']);render();},true],['1 hour',()=>{rmSnooze(id,'hour');speakSeq(['Snoozed']);render();},true],['Tomorrow morning',()=>{rmSnooze(id,'tomorrow');speakSeq(['Snoozed']);render();},true],['Cancel',null]]);},
  rmopen:el=>{const r=S.rm.items.find(x=>x.id===el.dataset.id);if(!r)return;const now=rmNow();
    const btns=[['Close',null],['Hear it',()=>speakSeq(r.status==='active'?['Reminder',r.text]:['Done',r.text]),false,true]];
    if(r.status==='active')btns.splice(1,0,['Add to my phone calendar',()=>rmDownloadIcs(r),true]);
    modal(`<div class="rm-modal-ic">${ic(rmIcon(r))}</div><h2>${esc(r.text)}</h2><p style="font-size:1.15rem">${esc(r.status==='active'?rmWhen(rmFireAt(r),now):'Done')}</p>${r.rep.type!=='once'&&r.status==='active'?`<p class="muted">${esc(rmRepText(r.rep,r.due,r.left,'left'))}</p>`:''}${r.status==='active'?`<p class="note" style="text-align:left">A calendar copy can ring your phone even when Highkeep is closed. It is a good backup for things like medicine.</p>`:''}`,btns);},
  rmundoneall:()=>{S.rm.items=S.rm.items.filter(r=>r.status!=='done');save();toast('Cleared the done list.');render();}
};
function scr_remind(sub,p1,p2){
  if(sub==='new'||sub==='edit')return scr_rmwizard(sub,p1,p2);
  if(sub==='settings')return scr_rmsettings();
  if(sub==='alerts')return scr_rmalerts();
  if(sub==='siri')return scr_rmsiri();
  const now=rmNow();const due=rmDueList(now),up=rmUpcoming(now),done=S.rm.items.filter(r=>r.status==='done').sort((a,b)=>(b.doneAt||0)-(a.doneAt||0));
  const grp={};up.forEach(r=>{const k=rmDayStr(rmFireAt(r),now);const d=new Date(rmFireAt(r));const lab=(k==='Today'||k==='Tomorrow')?k:(Math.round((new Date(d).setHours(0,0,0,0)-new Date(now).setHours(0,0,0,0))/86400000)<7?RMDOWN[d.getDay()]:'Later');(grp[lab]=grp[lab]||[]).push(r);});
  const caps=rmCaps();const alertsHint=(!caps.notif||caps.perm!=='granted')?`<button class="card info rm-hint" data-act="nav" data-to="remind/alerts"><span class="ico">${ic('bell')}</span><span class="t"><strong>Want phone alerts too?</strong><small>Right now I only ring while Highkeep is open. Tap to set up.</small></span>${ic('next')}</button>`:'';
  return {name:'Remind Me',tab:'home',topLeft:'back',backTo:()=>go('home'),portal:{size:'small',world:S.world,title:'Remind Me'},
    guide:'Tap the big button to make a reminder, or look at your list below.',
    body:`<button class="btn primary block rm-new" data-act="rmnew">${ic('mic')}Remind me of something</button>
    ${due.length?`<section class="rm-sec"><h2 class="rm-h">${ic('bell')}Due now <span class="count">${due.length}</span></h2>${due.map(r=>rmItemHTML(r)).join('')}</section>`:''}
    <section class="rm-sec"><h2 class="rm-h">${ic('clock')}Coming up <span class="count">${up.length}</span></h2>
    ${up.length?Object.keys(grp).map(k=>`<h3 class="rm-day">${k}</h3>${grp[k].map(r=>rmItemHTML(r)).join('')}`).join(''):`<div class="card rm-empty"><p style="font-size:1.1rem">Nothing is waiting. Tap the big button and say something like <b>\u201cTake my pills tomorrow morning\u201d</b>.</p></div>`}</section>
    ${done.length?`<details class="rm-sec rm-done"><summary class="rm-h">${ic('check')}Done <span class="count">${done.length}</span></summary>${done.map(r=>rmItemHTML(r)).join('')}<button class="btn block" data-act="rmundoneall" style="margin-top:8px">${ic('trash')}Clear the done list</button></details>`:''}
    ${alertsHint}
    <div class="tools rm-tools"><button class="tool" data-act="nav" data-to="remind/alerts">${ic('bell')}Phone alerts</button><button class="tool" data-act="nav" data-to="remind/siri">${ic('mic')}Siri Shortcut</button><button class="tool" data-act="nav" data-to="remind/settings">${ic('gear')}Settings and backup</button></div>`,
    acts:rmListActs};
}
/* ---------- The four steps ---------- */
function scr_rmwizard(sub,p1,p2){
  const edit=sub==='edit';let step;
  if(edit){if(rmDraft.id!==p1||!rmDraft.editing){if(!rmLoadDraft(p1))return setTimeout(()=>go('remind')),scr_remind();}step=+p2||1;}
  else{step=+p1||1;if(rmDraft.editing)rmFreshDraft();}
  const N=4;step=Math.max(1,Math.min(N,step));const d=rmDraft;
  const here=n=>go('remind/'+(edit?'edit/'+d.id:'new')+'/'+n);
  if(step>1&&!d.phrase.trim()&&!d.text.trim()){setTimeout(()=>here(1));step=1;}
  if(step!==1)rmStopMic();
  const base={name:'Remind Me',tab:'home',step:{x:step,y:N},topLeft:'back',backTo:()=>step>1?here(step-1):go('remind'),portal:{size:'small',world:S.world,title:edit?'Change reminder':'New reminder'}};
  if(step===1){
    const ok=rmMicOK();
    return Object.assign(base,{guide:'Tap the microphone and say what you want to remember. Or type it. Then tap Next.',
      body:`<div class="card rm-cap"><h2>What should I remind you about?</h2>
      <div class="rm-micwrap"><button class="rm-mic" id="rmmic" data-act="rmmic" aria-pressed="false" aria-label="Microphone. Tap and speak." ${ok?'':'data-nomic="1"'}><span class="rm-ring"></span>${ic('mic')}<span class="rm-mic-l">Tap and speak</span></button></div>
      <p class="rm-micmsg ${ok?'':'warn'}" id="rmmicmsg" aria-live="polite">${ok?'':RM_NOMIC}</p>
      <label class="sub" for="rmtext">Or type it here</label>
      <textarea id="rmtext" class="input rm-ta" rows="3" placeholder="Like: Take my pills tomorrow morning" aria-label="What should I remind you about">${esc(d.phrase)}</textarea>
      <div class="rm-tools2"><button class="btn" data-act="rmread">${ic('speaker')}Read it back</button><button class="btn" data-act="rmclear">${ic('x')}Clear</button></div>
      <div class="chips">${['Take my pills in 20 minutes','Call Mom tomorrow evening','Stretch every morning for a week'].map(x=>`<button class="chip" data-act="rmex" data-v="${esc(x)}">${esc(x)}</button>`).join('')}</div>
      <p class="note">Say the time too, like <b>\u201cin 20 minutes\u201d</b>, <b>\u201ctomorrow morning\u201d</b> or <b>\u201cevery morning for 7 days\u201d</b>. I will show you what I understood before anything is saved.</p></div>`,
      nextDisabled:!d.phrase.trim(),next:()=>{rmApplyParse();here(2);},
      acts:{rmmic:()=>rmListen(),rmread:()=>{if(d.phrase.trim())speak(d.phrase,false);},rmclear:()=>{rmStopMic();rmSetPhrase('');rmMic.msg='';rmMic.kind='';rmPaintMic();const ta=$('#rmtext');ta&&ta.focus();},rmex:el=>{rmSetPhrase(el.dataset.v);}},
      mount:r=>{const ta=$('#rmtext',r);ta.addEventListener('input',e=>{rmDraft.phrase=e.target.value;const nx=$('.stepbar .next');if(nx)nx.disabled=!e.target.value.trim();});rmPaintMic();}});
  }
  if(step===2){
    const has=d.due!=null;
    const noteHTML=d.notes.map(n=>`<p class="note">${esc(n)}</p>`).join('');
    const picks=[['10','clock','10 min'],['60','clock','1 hour'],['eve','moon','This evening'],['tmorn','sun','Tomorrow morning'],['week','repeat','Every morning for a week'],['custom','calendar','Custom date and time']];
    const nowD=new Date(rmNow());const defD=has?new Date(d.due):new Date(rmNow()+3600000);
    const dv=`${defD.getFullYear()}-${String(defD.getMonth()+1).padStart(2,'0')}-${String(defD.getDate()).padStart(2,'0')}`;const tv=`${String(defD.getHours()).padStart(2,'0')}:${String(defD.getMinutes()).padStart(2,'0')}`;
    const q=has&&rmInQuiet(d.due)?`<p class="note"><span class="rm-inl">${ic('moon')}</span> That is during your quiet hours, so I will wait and remind you at ${rmTimeStr(rmQuietAdjust(d.due))}.</p>`:'';
    return Object.assign(base,{guide:'Check the time I picked. If it is wrong, tap a quick pick or choose your own. Then tap Next.',
      body:`<div class="card"><label class="sub" for="rmwhat">Remind me to</label><input id="rmwhat" class="input" style="width:100%" value="${esc(d.text)}" placeholder="What should I remind you about?" aria-label="Remind me to"></div>
      <div class="card rm-interp ${has?'':'empty'}"><span class="steptag">When</span>
      ${has?`<div class="rm-big" id="rmwhen">${esc(rmDraftDesc())}</div><div class="sub">${esc(rmRel(d.due))}</div>${d.rep.type!=='once'?`<div class="rm-rep2">${ic('repeat')}${esc(rmDraftRepText())}</div>`:''}`:`<div class="rm-big" id="rmwhen">I do not have a time yet</div><div class="sub">Tap one of the quick picks below, or choose your own.</div>`}
      ${noteHTML}${q}</div>
      <div class="card"><h3>Quick picks</h3><div class="rm-picks">${picks.map(([k,i,l])=>`<button class="rm-pick" data-act="rmpick" data-v="${k}" aria-pressed="${k==='custom'?d.custom:d.pick===k}">${ic(i)}<span>${l}</span></button>`).join('')}</div>
      ${d.custom?`<div class="rm-custom"><label>Day<input type="date" id="rmdate" class="input" value="${dv}" min="${nowD.getFullYear()}-${String(nowD.getMonth()+1).padStart(2,'0')}-${String(nowD.getDate()).padStart(2,'0')}"></label><label>Time<input type="time" id="rmtime" class="input" value="${tv}"></label><button class="btn primary" data-act="rmuse">${ic('check')}Use this time</button></div>`:''}</div>`,
      nextDisabled:!has||!d.text.trim(),next:()=>here(3),
      acts:{rmpick:el=>{const k=el.dataset.v;if(k==='custom'){d.custom=!d.custom;d.pick=null;render();return;}rmPick(k);render();},
        rmuse:()=>{const dv2=$('#rmdate').value,tv2=$('#rmtime').value;if(!dv2||!tv2)return toast('Pick a day and a time first.');const [y,m,dd]=dv2.split('-').map(Number),[h,mi]=tv2.split(':').map(Number);const t=new Date(y,m-1,dd,h,mi,0,0).getTime();
          if(t<=rmNow())return toast('That time has passed. Please pick a later time.',3000);d.due=t;d.pick=null;d.custom=false;d.notes=[];d.assumed=false;if(d.rep.type==='weekdays'||d.rep.type==='weekly'){d.rep.dow=new Date(t).getDay();}render();}},
      mount:r=>{const w=$('#rmwhat',r);w.addEventListener('input',e=>{d.text=e.target.value;const nx=$('.stepbar .next');if(nx)nx.disabled=d.due==null||!d.text.trim();});
        w.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();w.blur();}});}});
  }
  if(step===3){
    const types=[['once','bell','Just once'],['daily','repeat','Every day'],['weekdays','briefcase','Weekdays'],['weekly','calendar','Every week']];
    const t=d.rep.type;const opts=t==='daily'?[3,5,7,14,30]:t==='weekdays'?[5,10,20]:[4,8,12];const unit=t==='daily'?'days':t==='weekdays'?'weekdays':'weeks';
    return Object.assign(base,{guide:'Choose if this happens once or repeats. Then tap Next.',
      body:`<div class="card"><h3>How often?</h3><div class="rm-picks rm-types" role="group" aria-label="How often">${types.map(([k,i,l])=>`<button class="rm-pick" data-act="rmtype" data-v="${k}" aria-pressed="${t===k}">${ic(i)}<span>${l}</span></button>`).join('')}</div>
      ${t!=='once'?`<h3 style="margin-top:16px">For how long?</h3><div class="seg rm-seg" role="group" aria-label="For how long">${opts.map(n=>`<button data-act="rmtotal" data-v="${n}" aria-pressed="${d.rep.total===n}">${n} ${unit}</button>`).join('')}<button data-act="rmtotal" data-v="" aria-pressed="${d.rep.total==null}">Until I stop</button></div>
      <p class="rm-rep2" style="margin-top:12px">${ic('repeat')}${esc(rmDraftRepText())}</p>`:`<p class="sub" style="margin-top:12px">It will remind you once, ${esc(d.due?rmWhen(d.due).toLowerCase():'at the time you picked')}.</p>`}
      ${d.notes.map(n=>`<p class="note">${esc(n)}</p>`).join('')}</div>
      <div class="card"><div class="setrow" style="border:0;padding:0"><div class="lbl">${ic('shieldcheck')}Ask \u201cDid you do it?\u201d</div><div class="seg" role="group">${[[true,'Yes'],[false,'No']].map(([v,l])=>`<button data-act="rmhabit" data-v="${v}" aria-pressed="${d.habit===v}">${l}</button>`).join('')}</div>
      <p class="sub" style="margin-top:6px">Habit mode. When this is on, I ask if you did it and you tap <b>Done</b> or <b>Not yet</b>. Good for pills and daily habits.</p></div></div>`,
      next:()=>here(4),
      acts:{rmtype:el=>{rmSetType(el.dataset.v);render();},rmtotal:el=>{d.rep.total=el.dataset.v===''?null:+el.dataset.v;render();},rmhabit:el=>{d.habit=el.dataset.v==='true';d.habitTouched=true;render();}}});
  }
  const caps=rmCaps();
  const row=(i,l,v)=>`<div class="rm-sumrow"><span class="ico">${ic(i)}</span><span class="t"><small>${l}</small><strong>${v}</strong></span></div>`;
  return Object.assign(base,{guide:'Check everything, then tap Save reminder.',nextLabel:edit?'Save changes':'Save reminder',
    body:`<div class="card rm-sum"><span class="steptag">Almost done</span>
      ${row('bell','Remind me to',esc(d.text))}${row('clock','When',esc(d.due?rmWhen(d.due):'Not set')+(d.due?' ('+esc(rmRel(d.due))+')':''))}
      ${row('repeat','How often',esc(d.rep.type==='once'?'Just once':rmDraftRepText()))}
      ${row('shieldcheck','Habit check',d.habit?'I will ask \u201cDid you do it?\u201d':'Off')}
      ${row('speaker','How I tell you',S.rm.read?'A card on screen, read aloud in your voice':'A card on screen (read aloud is off)')}
      ${row('bell','Phone alerts',caps.perm==='granted'?'On':'Not on yet. I will only ring while Highkeep is open.')}</div>
      <button class="btn block" data-act="rmsay">${ic('speaker')}Read this to me</button>`,
    next:()=>{const r=rmSaveDraft();if(!r)return toast('I need what to remind you about and a time first.');
      const msg=(edit?'Changed. ':'Saved. ')+'I will remind you '+rmWhen(r.due).toLowerCase()+'.';rmFreshDraft();go('remind');setTimeout(()=>{toast(msg,3200);if(S.readAloud)speak(msg,false);},80);},
    acts:{rmsay:()=>speak('Remind me to '+d.text+'. '+(d.due?rmWhen(d.due)+'. ':'')+(d.rep.type==='once'?'Just once.':rmDraftRepText()+'.'),false)}});
}
/* ---------- Settings, backup ---------- */
function rmSeg(k,opts,val){return `<div class="seg" role="group">${opts.map(([v,l])=>`<button data-act="rmset" data-k="${k}" data-v="${v}" aria-pressed="${String(val)===String(v)}">${l}</button>`).join('')}</div>`;}
function scr_rmsettings(){
  const q=S.rm.quiet,P=S.rm.parts;
  const tin=(id,v,l)=>`<label class="rm-tin"><span>${l}</span><input type="time" class="input" id="${id}" value="${v}"></label>`;
  return {name:'Reminder settings',tab:'home',topLeft:'back',backTo:()=>go('remind'),portal:{size:'small',world:S.world,title:'Reminder settings'},
    guide:'Change how reminders sound and when they come. Your choices are saved right away.',
    body:`<div class="card"><div class="setrow"><div class="lbl">${ic('speaker')}Read reminders aloud</div>${rmSeg('read',[[true,'On'],[false,'Off']],S.rm.read)}<p class="sub" style="margin-top:6px">Uses the reading voice you picked in More. Your own words are read by the best voice on your device.</p></div>
      <div class="setrow"><div class="lbl">${ic('repeat')}Gentle repeat until you answer</div>${rmSeg('nudge',[[0,'Off'],[2,'2 min'],[5,'5 min'],[10,'10 min']],S.rm.nudge)}
      ${S.rm.nudge?`<div class="lbl" style="margin-top:12px">${ic('hash')}Repeat how many times</div>${rmSeg('nudgeMax',[[1,'1'],[3,'3'],[5,'5']],S.rm.nudgeMax)}`:''}
      <p class="sub" style="margin-top:6px">If you do not tap Done or Snooze, I will gently show it again. I never keep going forever.</p></div></div>
    <div class="card"><h3>Times of day</h3><p class="sub">When you say \u201cmorning\u201d or \u201cevening\u201d, this is the time I use.</p>
      <div class="rm-tgrid">${tin('rmp-morning',P.morning,'Morning')}${tin('rmp-afternoon',P.afternoon,'Afternoon')}${tin('rmp-evening',P.evening,'Evening')}${tin('rmp-night',P.night,'Night')}</div>
      <button class="btn" data-act="rmpartsreset" style="margin-top:8px">${ic('repeat')}Put the times back</button></div>
    <div class="card"><div class="setrow" style="border:0;padding:0"><div class="lbl">${ic('moon')}Quiet hours</div>${rmSeg('quiet',[[true,'On'],[false,'Off']],q.on)}
      <p class="sub" style="margin-top:6px">During quiet hours I stay silent and hold reminders until they end.</p>
      ${q.on?`<div class="rm-tgrid" style="margin-top:8px">${tin('rmq-from',q.from,'Starts')}${tin('rmq-to',q.to,'Ends')}</div>`:''}</div></div>
    <div class="card"><h3>Back up and clear</h3><p class="sub">Copy all your reminders as plain text. You can paste it into a note or message.</p>
      <button class="btn block" data-act="rmexport">${ic('copy')}Copy my reminders</button>
      <button class="btn block" data-act="rmclearall" style="margin-top:10px">${ic('trash')}Delete all my reminders</button></div>`,
    acts:{rmset:el=>{const k=el.dataset.k;let v=el.dataset.v;if(v==='true')v=true;else if(v==='false')v=false;else if(/^\d+$/.test(v))v=+v;if(k==='quiet')S.rm.quiet.on=v;else S.rm[k]=v;save();rmSyncTriggers();render();},
      rmpartsreset:()=>{S.rm.parts=Object.assign({},RM_PARTS_DEF);save();render();toast('Times put back.');},
      rmexport:()=>{const t=rmExportText();rmCopy(t).then(ok=>{modal(`<h2>${ok?'Copied':'Here is your list'}</h2><p class="muted">${ok?'Paste it anywhere you like.':'Your browser would not copy it, so you can select it here.'}</p><textarea class="input rm-ta" rows="8" readonly id="rmexp" style="width:100%;text-align:left">${esc(t)}</textarea>`,[['Close',null,true]]);const ta=$('#rmexp');ta&&ta.addEventListener('focus',()=>ta.select());});},
      rmclearall:()=>{const n=S.rm.items.length;if(!n)return toast('You have no reminders to delete.');modal(`<h2>Delete all ${n} reminder${n===1?'':'s'}?</h2><p>This clears your whole list. You cannot bring it back after this.</p>`,[['Keep them',null,true],['Yes, delete all',()=>{S.rm.items=[];save();rmCloseAlert();rmSyncTriggers();toast('All reminders deleted.');render();}]]);}},
    mount:r=>{
      ['morning','afternoon','evening','night'].forEach(k=>{const i=$('#rmp-'+k,r);i&&i.addEventListener('change',e=>{if(/^\d{2}:\d{2}$/.test(e.target.value)){S.rm.parts[k]=e.target.value;save();}});});
      const f=$('#rmq-from',r),t=$('#rmq-to',r);f&&f.addEventListener('change',e=>{if(e.target.value){S.rm.quiet.from=e.target.value;save();}});t&&t.addEventListener('change',e=>{if(e.target.value){S.rm.quiet.to=e.target.value;save();}});}};
}
/* ---------- Phone alerts and Add to Home Screen ---------- */
function scr_rmalerts(){
  const c=rmCaps();
  const st=(ok,l,v)=>`<div class="rm-stat ${ok===true?'ok':ok===false?'no':'mid'}"><span class="dot"></span><span><b>${l}</b><br><small>${v}</small></span></div>`;
  const permTxt=c.perm==='granted'?'Allowed':c.perm==='denied'?'Blocked':c.perm==='default'?'Not asked yet':'Not available on this browser';
  const how=c.ios&&!c.standalone?`<div class="note"><b>iPhone and iPad:</b> alerts only work after you add Highkeep to your Home Screen (iOS 16.4 or newer). Do the steps below first, then open Highkeep from its Home Screen icon and come back here.</div>`:'';
  const ask=c.perm==='default'&&c.notif?`<div class="rm-explain"><b>What happens when you tap the button:</b> your phone will ask \u201cAllow notifications?\u201d Tap <b>Allow</b>. That lets Highkeep show a banner when a reminder is due. You can turn it off any time in your phone settings.</div><button class="btn primary block" data-act="rmperm">${ic('bell')}Turn on phone alerts</button>`:
    c.perm==='granted'?`<p style="font-size:1.1rem"><span class="rm-inl ok">${ic('check')}</span> Phone alerts are on.</p><button class="btn primary block" data-act="rmtest">${ic('bell')}Send a test notification</button>`:
    c.perm==='denied'?`<div class="note">Alerts are blocked for this page. To turn them on: ${c.ios?'open the <b>Settings</b> app, tap <b>Notifications</b>, find <b>Highkeep</b> and turn on <b>Allow Notifications</b>.':c.android?'tap the lock icon next to the web address, tap <b>Permissions</b>, then <b>Notifications</b>, and choose Allow.':'click the lock icon next to the web address, find <b>Notifications</b>, and choose Allow.'} Then come back here.</div>`:
    `<div class="note">This browser cannot show phone alerts${c.ios?' yet. Add Highkeep to your Home Screen first (steps below)':''}. Highkeep will still show a card and read your reminder aloud while it is open.</div>`;
  const steps=(a)=>`<ol class="rm-steps">${a.map(s=>`<li>${s}</li>`).join('')}</ol>`;
  const iosSteps=steps(['Open Highkeep in <b>Safari</b>.','Tap the <b>Share</b> button (a square with an arrow pointing up) at the bottom of the screen.','Scroll down and tap <b>Add to Home Screen</b>.','Tap <b>Add</b> in the top corner.','Close Safari. Open <b>Highkeep from your Home Screen</b> and come back to this page.','Tap <b>Turn on phone alerts</b>.']);
  const andSteps=steps(['Open Highkeep in <b>Chrome</b>.','Tap the three dots (\u22ee) at the top right.','Tap <b>Add to Home screen</b> or <b>Install app</b>.','Tap <b>Install</b> or <b>Add</b>.','Open Highkeep from your Home screen.','Come back here and tap <b>Turn on phone alerts</b>.']);
  const deskSteps=steps(['In Chrome or Edge, look for an install icon at the right end of the address bar, or open the menu (\u22ee) and choose <b>Install Highkeep</b>.','Confirm. Highkeep opens in its own window.','Come back here and tap <b>Turn on phone alerts</b>.']);
  const order=c.ios?['ios','and','desk']:c.android?['and','ios','desk']:['desk','ios','and'];
  const blocks={ios:['iPhone or iPad',iosSteps],and:['Android phone',andSteps],desk:['Computer',deskSteps]};
  return {name:'Phone alerts',tab:'home',topLeft:'back',backTo:()=>go('remind'),portal:{size:'small',world:S.world,title:'Phone alerts'},
    guide:'Turn on phone alerts so Highkeep can show a banner when a reminder is due.',
    body:`<div class="card"><h3>Alerts on this device</h3>
      ${st(c.notif?(c.perm==='granted'?true:c.perm==='denied'?false:null):false,'Notifications',permTxt)}
      ${st(c.standalone?true:null,'Added to Home Screen',c.standalone?'Yes, you are using Highkeep as an app':(c.ios?'Not yet. iPhone needs this before alerts can work.':'Not added. This is optional on this device.'))}
      ${st(c.triggers?true:false,'Alerts when Highkeep is closed',c.triggers?'This browser can schedule them. It is still not 100% reliable.':'Not available on this browser')}
      ${how}<div style="margin-top:12px">${ask}</div></div>
    <div class="card"><h3>The honest part</h3><ul class="rm-honest"><li>A web app like this <b>cannot reliably wake your phone</b> when it is closed. Highkeep always rings and reads aloud while it is open, and it catches up on anything you missed when you open it again.</li>
      <li>On <b>iPhone</b>, web apps can only show notifications after they are added to the Home Screen. Even then, iPhone may not deliver them on time if Highkeep is closed.</li>
      <li>For something that really matters, like medicine, tap a reminder and choose <b>Add to my phone calendar</b>. Your phone\u2019s own calendar will ring even when Highkeep is closed.</li></ul></div>
    <div class="card"><h3>Add Highkeep to your Home Screen</h3>${c.standalone?'<p>You already did. You are using Highkeep as an app.</p>':''}
      ${order.map((k,i)=>`<details ${i===0&&!c.standalone?'open':''} class="rm-det"><summary>${blocks[k][0]}</summary>${blocks[k][1]}</details>`).join('')}
      ${c.ios?'<p class="note">On iPhone, Safari and the Home Screen app each keep their own saved reminders. Reminders made in one will not show in the other.</p>':''}</div>`,
    acts:{rmperm:()=>rmAskPermission(),rmtest:()=>{toast('Test is coming in 3 seconds. You can leave this page to see it.',3200);setTimeout(()=>rmNotify({title:'Highkeep test',body:'This is how a reminder will look. Nothing to do!',tag:'hk-test'}).then(ok=>{if(!ok)toast('I could not show a notification. Check the steps on this page.',4000);}),3000);}}};
}
/* ---------- Siri Shortcut helper ---------- */
function scr_rmsiri(){
  const base=rmAbs()+'#/remind/new?text=';const ex1=rmAbs()+'#/remind/new?text='+encodeURIComponent('Take my pills')+'&when='+encodeURIComponent('in 20 minutes');const ex2=rmAbs()+'#/remind/new?text='+encodeURIComponent('Call Mom tomorrow evening');
  return {name:'Siri Shortcut',tab:'home',topLeft:'back',backTo:()=>go('remind'),portal:{size:'small',world:S.world,title:'Siri Shortcut'},
    guide:'Follow these steps to ask Siri to make a reminder in Highkeep.',
    body:`<div class="card"><h3>Say \u201cHey Siri, remind me in Highkeep\u201d</h3><p>Siri can listen for you, then open Highkeep with your words already filled in. You still check the time and tap Save. Nothing is saved by surprise.</p>
      <ol class="rm-steps">
      <li>Open the <b>Shortcuts</b> app on your iPhone and tap the <b>+</b> button.</li>
      <li>Tap the name at the top and call it <b>Remind me in Highkeep</b>. Siri uses this name.</li>
      <li>Tap <b>Add Action</b>, search for <b>Dictate Text</b>, and tap it.</li>
      <li>Add another action: search for <b>URL Encode</b> and add it. If you cannot find it, skip this step. Highkeep still understands plain spaces.</li>
      <li>Add another action: <b>Text</b>. Type this link, then tap the blue <b>Encoded Text</b> (or <b>Dictated Text</b>) right after the equals sign:<div class="rm-code" id="rmlink">${esc(base)}</div><button class="btn" data-act="rmcopylink">${ic('copy')}Copy the link start</button></li>
      <li>Add one last action: <b>Open URLs</b>, and give it that Text.</li>
      <li>Tap <b>Done</b>. Now say <b>\u201cHey Siri, remind me in Highkeep\u201d</b>, and then say your reminder, like <b>\u201cCall Mom tomorrow evening\u201d</b>.</li></ol></div>
    <div class="card"><h3>What the link understands</h3><p class="sub">The part after <b>text=</b> can hold the whole sentence, time and all. You can also add <b>&when=</b> for a time phrase on its own.</p>
      <div class="rm-code">${esc(ex1)}</div><div class="rm-code">${esc(ex2)}</div>
      <div class="rm-tools2"><button class="btn" data-act="rmtryex" data-v="1">${ic('play')}Try the first one</button><button class="btn" data-act="rmtryex" data-v="2">${ic('play')}Try the second</button></div></div>
    <div class="card"><h3>Good to know</h3><ul class="rm-honest"><li>On iPhone, the shortcut opens the link in <b>Safari</b>. Safari and a Home Screen copy of Highkeep keep their <b>own separate reminders</b>, and I cannot share them yet.</li>
      <li>Siri does not make a reminder by itself. You see the screen and confirm. That keeps it safe and honest.</li>
      <li>If you want a reminder that always rings, even when everything is closed, make the shortcut use the built-in <b>Add New Reminder</b> action instead, or add the reminder to your phone calendar from Highkeep.</li></ul></div>`,
    acts:{rmcopylink:()=>rmCopy(base).then(ok=>toast(ok?'Copied. Paste it into the Text action.':'I could not copy. Press and hold the link to copy it.',3000)),
      rmtryex:el=>{location.hash=el.dataset.v==='1'?ex1.slice(ex1.indexOf('#')):ex2.slice(ex2.indexOf('#'));}}};
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
    case 'game':{const GS={changed:scr_changed,story:scr_story,pack:scr_pack,simon:scr_simon,names:scr_names,routine:scr_routine};return (GS[r[1]]||scr_cardflip)(+r[2]||1);}
    case 'practice':return scr_practice();
    case 'palace':return scr_palace();
    case 'remind':{const sc=scr_remind(r[1],r[2],r[3]);sc.body='<i class="rmx" hidden></i>'+sc.body;return sc;}
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
  rmDeepLink();if(route()[0]!=='remind')rmStopMic();
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
window.Highkeep={rm:{parse:rmParse,now:rmNow,warp:ms=>{let left=ms;while(left>0){const d=Math.min(30000,left);rmOffset+=d;left-=d;rmTick();}},jump:ms=>{rmOffset+=ms;rmTick();},tick:rmTick,items:()=>S.rm.items,add:rmAdd,due:rmDueList,log:()=>rmLog,caps:rmCaps,draft:()=>rmDraft,ics:rmIcs,exportText:rmExportText,alertId:()=>rmAlertId,catchUp:()=>rmCatch,seenReset:()=>{rmLastTick=null;},fireAt:rmFireAt,load:()=>{rmNorm();}},guide:()=>cur&&guideText(cur).speech,TOUR:()=>TOUR,startTour,state:()=>S,flip,reveal,game:()=>game,wc:()=>wc,wcPick,sr:()=>sr,srPick,STORIES:()=>STORIES,pk:()=>pk,sm:()=>sm,smTap,nm:()=>nm,nmPick,rt:()=>rt,rtPlace,newGameLines};

rmNorm();rmLastTick=S.rm.seen||null;
render();
setInterval(rmTick,1000);setTimeout(rmTick,350);
try{if('Notification' in window&&Notification.permission==='granted')rmRegisterSW();}catch(e){}
})();
