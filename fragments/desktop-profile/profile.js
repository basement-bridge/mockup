/* Profile window: two-pane, settings-style (owner decision, 9 October 2026). Static sample data, no storage, no libraries.
   Reusable: load profile.css + profile.js on any page and call window.KProfile.open(opener) / .close(). The window is built only when opened.
   Modal rules: scrim covers the whole window, the page behind is inert, focus is trapped and handed back to the opener, Esc, the x button and a scrim click close.
   Standalone page (the mockup Pantry): ?open=1|me|settings|history|household|data|shortcuts opens it at load. */
(function(){
"use strict";
var NAME="persian",SUB="Full Stack Cook",LETTER="P";
var $=function(s,r){return(r||document).querySelector(s)};
var $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};

/* ---------- icons ---------- */
var P={
user:'<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/>',
sliders:'<path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/>',
clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
people:'<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6"/><circle cx="17" cy="9" r="2.6"/><path d="M17 14c2.8 0 4.5 1.9 4.5 5"/>',
down:'<path d="M12 4v11M7 11l5 5 5-5M5 20h14"/>',
chev:'<path d="M9 6l6 6-6 6"/>',
back:'<path d="M15 6l-6 6 6 6"/>',
close:'<path d="M6 6l12 12M18 6L6 18"/>',
pencil:'<path d="M4 20l1-4L16 5l3 3L8 19z"/>',
copy:'<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h8"/>',
plus:'<path d="M12 5v14M5 12h14"/>',
spark:'<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/>',
hat:'<path d="M7 14a4 4 0 1 1 2-7 4 4 0 0 1 6 0 4 4 0 1 1 2 7v6H7z"/>',
door:'<path d="M10 4H5v16h5M15 8l4 4-4 4M19 12H9"/>',
kbd:'<rect x="2.5" y="6" width="19" height="12" rx="2"/><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M7 14h10"/>',
mail:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 7 9-7"/>'
};
function ic(k,s){s=s||20;return '<svg class="pf-i" viewBox="0 0 24 24" width="'+s+'" height="'+s+'" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">'+P[k]+'</svg>'}
/* The owner's badge: stacked layers with a letter on the top layer. Colours come from tokens in CSS. */
function badge(px){return '<svg class="pf-badge" viewBox="0 0 32 32" width="'+px+'" height="'+px+'" aria-hidden="true" focusable="false"><path class="l3" d="M3 20l13 7 13-7"/><path class="l2" d="M3 15l13 7 13-7"/><path class="l1" d="M16 3l13 7-13 7L3 10z"/><text x="16" y="13.2" text-anchor="middle">'+LETTER+'</text></svg>'}
function bw(px,inner){return '<span class="pf-badgewrap" style="width:'+px+'px;height:'+px+'px">'+badge(Math.round(px*.62))+'</span>'}

/* ---------- views and keys ---------- */
var VIEWS={
 me:{t:"Me",icon:"user",k:"M"},
 settings:{t:"Settings",icon:"sliders",k:"S"},
 history:{t:"History",icon:"clock",k:"Y"},
 household:{t:"Household",icon:"people",k:"H"},
 data:{t:"My data",icon:"down",k:"D"}
};
var KEYS={p:"profile",m:"me",s:"settings",y:"history",h:"household",d:"data"};
function keys(k){return '<span class="pf-keys" aria-label="shortcut: G then '+k+'"><kbd>G</kbd><kbd>'+k+'</kbd></span>'}
var ESCL=/Mac|iPhone|iPad/.test(navigator.platform||"")?"\u2318 Enter":"Ctrl Enter";
var FOOT='<span><kbd>'+ESCL+'</kbd> close</span><span><kbd>Tab</kbd> move</span><span><kbd>G</kbd> then a letter jumps</span><span><kbd>?</kbd> shortcuts</span>';

/* ---------- pane content (drawn on first view) ---------- */
function sw(label,on){return '<li><button type="button" class="pf-sw" role="switch" aria-checked="'+on+'"><span>'+label+'</span><i aria-hidden="true"></i></button></li>'}
function paneMe(){
 return '<div class="pf-metop"><button type="button" class="pf-avedit" data-toast="Mockup: this opens the picture picker" aria-label="Change your picture"><span class="pf-badgewrap">'+badge(52)+'</span><span class="pe" aria-hidden="true">'+ic("pencil",14)+'</span></button><p class="pf-small">Tap the picture to change it</p></div>'
 +'<label class="pf-field"><span class="pf-lbl">Name</span><input class="pf-in" type="text" value="'+NAME+'" maxlength="24" autocomplete="off" spellcheck="false"><span class="pf-small" style="display:block;margin:6px 2px 0">Saves as you type. 24 characters at most.</span></label>'
 +'<div><span class="pf-lbl">Yours</span><ul class="pf-list">'
 +row("hat","Kitchen role",SUB,'',"Mockup: this opens the role picker")
 +row("spark","AI assistant","Your link",'<span class="pf-chip ok">Active</span>',"Mockup: this opens the AI assistant screen")
 +row("mail","Other households","Invite someone to a different household",'',"Mockup: this opens the invite sheet")
 +'</ul></div>'}
function row(icon,t,sub,chip,toast){return '<li><button type="button" class="pf-item" data-toast="'+toast+'"><span class="pf-ico">'+ic(icon,18)+'</span><span class="pf-t">'+t+(sub?'<small>'+sub+'</small>':'')+'</span>'+chip+'<span class="pf-chev">'+ic("chev",18)+'</span></button></li>'}
function paneSettings(){
 return '<div><span class="pf-lbl">Look</span><div class="pf-list"><div class="pf-themes"><b>Theme</b><div class="tgrid swatches" role="group" aria-label="Theme">'+(window.themeHtml?window.themeHtml(["kitchie","kitchie-day","marmalade","blueberry","herb"],true):"")+'</div><p class="pf-small" data-theme-name>'+(window.themeName?window.themeName():"")+'</p></div>'
 +'<div class="pf-row2" style="border-top:1px solid var(--border)"><span>Item name size</span><div class="pf-seg" role="radiogroup" aria-label="Item name size"><button type="button" role="radio" aria-checked="false">Small</button><button type="button" role="radio" aria-checked="true">Normal</button><button type="button" role="radio" aria-checked="false">Large</button></div></div>'
 +'<ul style="border-top:1px solid var(--border)">'+sw("Show emoji",true)+sw("Reduce motion",false)+sw("Show the spot",true)+sw("Show the amount",true)+sw("Show the use-by date",true)+sw("Compact rows",false)+'</ul></div></div>'
 +'<div><span class="pf-lbl">Kitchen</span><ul class="pf-list">'+row("sliders","Stock checks","",'<span class="pf-chip">On</span>',"Mockup: this opens Stock checks")+row("sliders","Categories","",'',"Mockup: this opens Categories")+'</ul><p class="pf-small" style="margin:8px 2px 0">Stock checks and Categories are the household\'s, not just this device\'s.</p></div>'
 +'<div><button type="button" class="pf-btn" data-toast="Mockup: back to defaults">Reset to defaults</button></div>'}
var EVENTS=[["Today",[["sam","S","used up the <b>milk</b>","8:12 am"],["me","P","moved <b>spinach</b> to the Crisper","7:40 am"]]],["Yesterday",[["me","P","cooked <b>egg fried rice</b>, used 5 items","7:05 pm"],["sam","S","added <b>12 eggs</b> to the Fridge","5:30 pm"],["me","P","put <b>paneer</b> on the shopping list","12:10 pm"]]],["Earlier this week",[["sam","S","changed the use-by of <b>butter</b> to 14 Oct","Tue"],["me","P","checked the amount of <b>rice</b>, still about right","Mon"]]]];
function paneHistory(){
 var h='<div class="pf-chips" role="group" aria-label="Show"><button type="button" aria-pressed="true" data-who="all">All</button><button type="button" aria-pressed="false" data-who="me">Mine</button><button type="button" aria-pressed="false" data-who="sam">Sam</button></div>';
 EVENTS.forEach(function(g){h+='<div class="pf-day"><span class="pf-lbl">'+g[0]+'</span><ul class="pf-list">'+g[1].map(function(e){return '<li class="pf-evli" data-who="'+e[0]+'"><div class="pf-ev"><span class="pf-ini'+(e[0]==="me"?" me":"")+'" aria-hidden="true">'+e[1]+'</span><span class="pf-t">'+(e[0]==="me"?"You":"sam")+' '+e[2]+'</span><time>'+e[3]+'</time></div></li>'}).join("")+'</ul></div>'});
 return h}
function paneHousehold(){
 return '<div><h3 class="pf-h">Our kitchen</h3><p>2 members</p></div>'
 +'<div><span class="pf-lbl">Members</span><ul class="pf-list">'
 +'<li><button type="button" class="pf-item" data-toast="Mockup: this opens the member sheet"><span class="pf-ini me" aria-hidden="true">P</span><span class="pf-t">'+NAME+' <span class="pf-chip">You</span> <span class="pf-chip acc">Founding member</span><small>'+SUB+'</small></span><span class="pf-chev">'+ic("chev",18)+'</span></button></li>'
 +'<li><button type="button" class="pf-item" data-toast="Mockup: this opens the member sheet"><span class="pf-ini" aria-hidden="true">S</span><span class="pf-t">sam<small>Sous chef</small></span><span class="pf-chev">'+ic("chev",18)+'</span></button></li></ul></div>'
 +'<div><span class="pf-lbl">Waiting to join</span><ul class="pf-list"><li><div class="pf-ev"><span class="pf-ico">'+ic("mail",18)+'</span><span class="pf-t"><span class="pf-code">482 913</span><small>Join Our kitchen, 20 hours left</small></span><button type="button" class="pf-btn sm" data-toast="Mockup: code copied">'+ic("copy",16)+' Copy</button><button type="button" class="pf-btn sm" data-toast="Mockup: invite cancelled">Cancel</button></div></li></ul></div>'
 +'<div><button type="button" class="pf-btn pri" data-toast="Mockup: this opens the invite sheet">'+ic("plus",18)+' Invite someone</button></div>'
 +'<div class="pf-danger"><b>Danger zone</b><p class="pf-small">You lose access to the pantry, shopping and recipes. Nothing is deleted. Someone has to invite you back.</p><button type="button" class="pf-btn dng" data-toast="Mockup: you would type your name to confirm">'+ic("door",18)+' Leave household</button></div>'}
function paneData(){
 return '<div class="pf-card"><span class="pf-ico">'+ic("down",18)+'</span><span class="pf-t">Inventory CSV<small>One file, one row per item: name, amount, place, use-by. 16 items.</small></span><button type="button" class="pf-btn pri" data-act="download">Download '+keys("D")+'</button></div>'
 +'<p class="pf-small">Sample only: nothing is downloaded in this mockup.</p>'}
var PANE={me:paneMe,settings:paneSettings,history:paneHistory,household:paneHousehold,data:paneData};

/* ---------- state ---------- */
var stack=[],home=null,gTimer=null,toastTimer=null,toastEl=null;

/* ---------- renderers ---------- */
function xbtn(){return '<span class="pf-hx"><kbd>'+ESCL+'</kbd><button type="button" class="pf-x" data-close aria-label="Close">'+ic("close",20)+'</button></span>'}
function renderWin(m){
 var tabs=["me","settings","history","household","data"].map(function(k){var v=VIEWS[k],on=m.view===k;
  var label=k==="me"?"Profile":v.t,kk=k==="me"?"P":v.k;
  return '<button type="button" class="pf-nvt" role="tab" id="pf-tab-'+k+'" data-view="'+k+'" aria-selected="'+on+'" aria-controls="pf-panel" tabindex="'+(on?0:-1)+'"'+(on?' data-focus':'')+'>'+ic(v.icon,20)+'<span class="pf-t">'+label+'</span>'+(k==="household"?'<span class="pf-chip">2</span>':'')+keys(kk)+'</button>'}).join("");
 var title=m.view==="me"?"Profile":VIEWS[m.view].t;
 return '<div class="pf-nav"><div class="pf-nwho">'+bw(48)+'<div><b>'+NAME+'</b><span class="pf-sub">'+SUB+'</span></div></div><div role="tablist" aria-orientation="vertical" aria-label="Profile sections">'+tabs+'</div><span class="pf-grow"></span><p class="pf-small"><kbd>&uarr;</kbd> <kbd>&darr;</kbd> switch section</p></div>'
 +'<div class="pf-cont"><div class="pf-head"><div class="pf-who"><h2>'+title+'</h2></div>'+xbtn()+'</div><div class="pf-body" id="pf-panel" role="tabpanel" aria-labelledby="pf-tab-'+m.view+'" tabindex="0">'+PANE[m.view]()+'</div><div class="pf-foot">'+FOOT+'</div></div>'}
function renderShortcuts(){
 var rows=[["Open profile","P"],["Me","M"],["Settings","S"],["History","Y"],["Household","H"],["Download inventory CSV","D"]];
 return '<div class="pf-head"><span class="pf-ico">'+ic("kbd",18)+'</span><div class="pf-who"><h2 class="sm">Keyboard shortcuts</h2></div>'+xbtn()+'</div><div class="pf-body"><p class="pf-small">Press <kbd>G</kbd>, then the letter, within 1.5 seconds. Works on the page and inside the open window.</p><ul class="pf-list pf-sc">'
 +rows.map(function(r){return '<li><span>'+r[0]+'</span>'+keys(r[1])+'</li>'}).join("")
 +'<li><span>Close the window</span><span class="pf-keys"><kbd>'+ESCL+'</kbd></span></li><li><span>Show this list</span><span class="pf-keys"><kbd>?</kbd></span></li></ul></div><div class="pf-foot"><span>Press <kbd>'+ESCL+'</kbd> to go back</span></div>'}
var RENDER={win:renderWin,s:renderShortcuts};
function label(m){return m.kind==="s"?"Keyboard shortcuts":"Profile, "+(m.view==="me"?"Profile":VIEWS[m.view].t)}

/* ---------- modal stack ---------- */
function syncInert(){
 var top=stack.length?stack[stack.length-1].root:null;
 $$("body > *").forEach(function(el){if(el.tagName==="SCRIPT"||el.id==="pf-toast")return;el.inert=!!top&&el!==top});
 document.documentElement.classList.toggle("pf-lock",!!top)}
function focusables(root){return $$('a[href],button:not([disabled]),input:not([disabled]),select,textarea,[tabindex]',root).filter(function(el){return el.tabIndex>=0&&el.getClientRects().length})}
function paint(m,focus){
 m.frame.innerHTML=RENDER[m.kind](m);
 m.frame.setAttribute("aria-label",label(m));
 if(window.themeApply&&m.view==="settings")window.themeApply();
 if(focus){var f=$("[data-focus]",m.frame)||focusables(m.frame)[0]||m.frame;f.focus()}}
function homeEl(){return home&&document.contains(home)?home:$("#pf-avatar")}
function openModal(kind,view,opener){
 toastNode();
 var root=document.createElement("div");root.className="pf-scrim";
 root.innerHTML='<div class="pf-dlg pf-'+kind+'" role="dialog" aria-modal="true" tabindex="-1"></div>';
 var m={kind:kind,view:view,root:root,frame:root.firstChild,opener:opener||document.activeElement};
 document.body.appendChild(root);stack.push(m);syncInert();paint(m,true);return m}
function setView(m,view){if(m.view===view)return;m.view=view;paint(m,true)}
function closeTop(){
 var m=stack.pop();if(!m)return;
 m.root.remove();syncInert();
 var o=m.opener;
 if(!(o&&document.contains(o)&&!o.inert&&o!==document.body)){var t=stack[stack.length-1];o=t?($("[data-focus]",t.frame)||t.frame):homeEl()}
 try{o.focus()}catch(e){}}
function closeAll(){while(stack.length)closeTop()}

/* ---------- actions ---------- */
function toastNode(){
 if(!toastEl){toastEl=$("#pf-toast");if(!toastEl){toastEl=document.createElement("div");toastEl.id="pf-toast";toastEl.className="pf-toast";toastEl.setAttribute("role","status");toastEl.setAttribute("aria-live","polite");document.body.appendChild(toastEl)}}
 return toastEl}
function toast(msg){var t=toastNode();t.textContent=msg;t.classList.add("on");clearTimeout(toastTimer);toastTimer=setTimeout(function(){t.classList.remove("on")},2200)}
function download(){toast("Inventory CSV saved (sample, nothing is downloaded)")}
function openProfile(opener){
 if(stack.length)return;
 if(opener)home=opener;
 openModal("win","me",homeEl()||document.activeElement)}
function go(v){
 var top=stack[stack.length-1];
 if(top&&top.kind==="s")return;
 var view=v==="profile"?"me":v;
 if(top)setView(top,view);else openModal("win",view,homeEl()||document.activeElement)}
function toggleShortcuts(){
 var top=stack[stack.length-1];
 if(top&&top.kind==="s"){closeTop();return}
 openModal("s","list",document.activeElement)}

/* ---------- events ---------- */
document.addEventListener("click",function(e){
 var t=e.target;
 if(t.classList&&t.classList.contains("pf-scrim")){closeTop();return}
 var el=t.closest?t.closest("button"):null;if(!el)return;
 var top=stack[stack.length-1];
 if(!top)return;
 if(el.hasAttribute("data-close")){closeTop();return}
 if(el.dataset.act==="download"){download();return}
 if(el.dataset.view){setView(top,el.dataset.view);return}
 if(el.dataset.toast){toast(el.dataset.toast);return}
 if(el.getAttribute("role")==="switch"){el.setAttribute("aria-checked",String(el.getAttribute("aria-checked")!=="true"));return}
 if(el.getAttribute("role")==="radio"){$$('[role=radio]',el.parentNode).forEach(function(b){b.setAttribute("aria-checked",String(b===el))});return}
 if(el.hasAttribute("data-who")){
  $$("[data-who]",el.parentNode).forEach(function(b){b.setAttribute("aria-pressed",String(b===el))});
  $$(".pf-evli",top.frame).forEach(function(li){li.hidden=el.dataset.who!=="all"&&li.dataset.who!==el.dataset.who});
  $$(".pf-day",top.frame).forEach(function(d){d.hidden=!$$(".pf-evli",d).some(function(li){return !li.hidden})});
  return}
});

document.addEventListener("keydown",function(e){
 var top=stack[stack.length-1],t=e.target;
 if(e.key==="Enter"&&(e.ctrlKey||e.metaKey)&&top){e.preventDefault();e.stopPropagation();closeTop();return}
 if(e.key==="Tab"&&top){
  var f=focusables(top.frame);if(!f.length){e.preventDefault();return}
  var i=f.indexOf(document.activeElement);
  if(e.shiftKey&&(i<=0)){e.preventDefault();f[f.length-1].focus()}
  else if(!e.shiftKey&&(i===f.length-1||i<0)){e.preventDefault();f[0].focus()}
  return}
 /* section tabs: arrows, Home, End */
 if(top&&t.getAttribute&&t.getAttribute("role")==="tab"&&/^(Arrow(Up|Down)|Home|End)$/.test(e.key)){
  var list=$$(".pf-nvt",top.frame),i2=list.indexOf(t),n=i2;
  if(e.key==="ArrowDown")n=(i2+1)%list.length;else if(e.key==="ArrowUp")n=(i2-1+list.length)%list.length;else if(e.key==="Home")n=0;else n=list.length-1;
  e.preventDefault();setView(top,list[n].dataset.view);return}
 /* shortcuts */
 if(e.ctrlKey||e.metaKey||e.altKey)return;
 if(t.matches&&t.matches("input,textarea,select,[contenteditable]"))return;
 if(e.key==="?"){e.preventDefault();toggleShortcuts();return}
 if(top&&top.kind==="s")return;
 if(gTimer){clearTimeout(gTimer);gTimer=null;toastNode().classList.remove("on");var v=KEYS[e.key.toLowerCase()];if(v){e.preventDefault();go(v)}return}
 if(e.key==="g"||e.key==="G"){gTimer=setTimeout(function(){gTimer=null;toastNode().classList.remove("on")},1500);toast("G, then P, M, S, Y, H or D")}
},true);

window.KProfile={open:openProfile,close:closeAll};

/* ---------- standalone page only (the mockup Pantry): avatar, Open button, ?open= ---------- */
if($("#pf-app")){
 var avatar=$("#pf-avatar");
 avatar.innerHTML=badge(30);
 home=avatar;
 avatar.addEventListener("click",function(){openProfile(avatar)});
 $$("[data-open]").forEach(function(b){b.addEventListener("click",function(){openProfile(b)})});
 var op=new URLSearchParams(location.search).get("open");
 if(op==="shortcuts")toggleShortcuts();
 else if(op==="1")openProfile(avatar);
 else if(op&&VIEWS[op])go(op)}
})();
