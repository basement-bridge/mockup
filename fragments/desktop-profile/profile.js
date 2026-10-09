/* Desktop profile options. Static sample data, no storage, no libraries. Option A account card, B two-pane dialog, C menu then modal.
   Modal rules (all three): scrim covers the whole window, the page behind is inert, focus is trapped and handed back, Esc and a scrim click close.
   Query: ?o=a|b|c picks the option, &open=1|me|settings|history|household|data|shortcuts opens it, &menu=1 (option C) keeps the menu under the modal. */
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
var FOOT='<span><kbd>Esc</kbd> close</span><span><kbd>Tab</kbd> move</span><span><kbd>G</kbd> then a letter jumps</span><span><kbd>?</kbd> shortcuts</span>';

/* ---------- pane content (shared by all options, drawn on first view) ---------- */
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
var opt="a",stack=[],pop=null,gTimer=null,toastTimer=null;
var avatar=$("#pf-avatar"),toastEl=$("#pf-toast");
avatar.innerHTML=badge(30);

/* ---------- renderers per option ---------- */
function item(view,label,chip){var v=VIEWS[view];return '<li><button type="button" class="pf-item" data-view="'+view+'"'+(view==="settings"?' data-focus':'')+'><span class="pf-ico">'+ic(v.icon,18)+'</span><span class="pf-t">'+label+'</span>'+(chip||'')+keys(v.k)+'<span class="pf-chev">'+ic("chev",18)+'</span></button></li>'}
function dlItem(){return '<li><button type="button" class="pf-item" data-act="download"><span class="pf-ico">'+ic("down",18)+'</span><span class="pf-t">Download inventory CSV</span>'+keys("D")+'</button></li>'}
function xbtn(){return '<span class="pf-hx"><kbd>Esc</kbd><button type="button" class="pf-x" data-close aria-label="Close">'+ic("close",20)+'</button></span>'}
function renderA(m){
 if(m.view==="root"){
  return '<div class="pf-head">'+bw(60)+'<div class="pf-who"><h2>'+NAME+'</h2><p class="pf-sub">'+SUB+'</p></div>'+xbtn()+'</div>'
  +'<div class="pf-body"><div><span class="pf-lbl">Look and kitchen</span><ul class="pf-list">'+item("settings","Settings")+item("history","History")+'</ul></div>'
  +'<div><span class="pf-lbl">People</span><ul class="pf-list">'+item("me","Me",'<span class="pf-chip">'+NAME+'</span>')+item("household","Household",'<span class="pf-chip">2</span>')+'</ul></div>'
  +'<div><span class="pf-lbl">My data</span><ul class="pf-list">'+dlItem()+'</ul></div></div><div class="pf-foot">'+FOOT+'</div>'}
 var v=VIEWS[m.view];
 return '<div class="pf-head"><button type="button" class="pf-bk" data-view="root" data-focus aria-label="Back to profile">'+ic("back",20)+' Profile</button><div class="pf-who"><h2 class="sm">'+v.t+'</h2></div>'+xbtn()+'</div><div class="pf-body">'+PANE[m.view]()+'</div><div class="pf-foot">'+FOOT+'</div>'}
function renderB(m){
 var tabs=["me","settings","history","household","data"].map(function(k){var v=VIEWS[k],on=m.view===k;
  var label=k==="me"?"Profile":v.t,kk=k==="me"?"P":v.k;
  return '<button type="button" class="pf-nvt" role="tab" id="pf-tab-'+k+'" data-view="'+k+'" aria-selected="'+on+'" aria-controls="pf-panel" tabindex="'+(on?0:-1)+'"'+(on?' data-focus':'')+'>'+ic(v.icon,20)+'<span class="pf-t">'+label+'</span>'+(k==="household"?'<span class="pf-chip">2</span>':'')+keys(kk)+'</button>'}).join("");
 var title=m.view==="me"?"Profile":VIEWS[m.view].t;
 return '<div class="pf-bnav"><div class="pf-bwho">'+bw(48)+'<div><b>'+NAME+'</b><span class="pf-sub">'+SUB+'</span></div></div><div role="tablist" aria-orientation="vertical" aria-label="Profile sections">'+tabs+'</div><span class="pf-grow"></span><p class="pf-small"><kbd>&uarr;</kbd> <kbd>&darr;</kbd> switch section</p></div>'
 +'<div class="pf-bmain"><div class="pf-head"><div class="pf-who"><h2>'+title+'</h2></div>'+xbtn()+'</div><div class="pf-body" id="pf-panel" role="tabpanel" aria-labelledby="pf-tab-'+m.view+'" tabindex="0">'+PANE[m.view]()+'</div><div class="pf-foot">'+FOOT+'</div></div>'}
function renderC(m){
 var v=VIEWS[m.view];
 return '<div class="pf-head"><span class="pf-ico">'+ic(v.icon,18)+'</span><div class="pf-who"><h2 class="sm" id="pf-ctitle">'+v.t+'</h2></div>'+xbtn()+'</div><div class="pf-body">'+PANE[m.view]()+'</div><div class="pf-foot">'+FOOT+'</div>'}
function renderS(){
 var rows=[["Open profile","P"],["Me","M"],["Settings","S"],["History","Y"],["Household","H"],["Download inventory CSV","D"]];
 return '<div class="pf-head"><span class="pf-ico">'+ic("kbd",18)+'</span><div class="pf-who"><h2 class="sm">Keyboard shortcuts</h2></div>'+xbtn()+'</div><div class="pf-body"><p class="pf-small">Press <kbd>G</kbd>, then the letter, within 1.5 seconds. Works on the page and inside an open window.</p><ul class="pf-list pf-sc">'
 +rows.map(function(r){return '<li><span>'+r[0]+'</span>'+keys(r[1])+'</li>'}).join("")
 +'<li><span>Close the window</span><span class="pf-keys"><kbd>Esc</kbd></span></li><li><span>Show this list</span><span class="pf-keys"><kbd>?</kbd></span></li></ul></div><div class="pf-foot"><span>Press <kbd>Esc</kbd> to go back</span></div>'}
var RENDER={a:renderA,b:renderB,c:renderC,s:renderS};
function label(m){return m.kind==="s"?"Keyboard shortcuts":m.kind==="a"?(m.view==="root"?"Profile":"Profile, "+VIEWS[m.view].t):m.kind==="b"?"Profile, "+(m.view==="me"?"Profile":VIEWS[m.view].t):VIEWS[m.view].t}

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
function openModal(kind,view,opener){
 var root=document.createElement("div");root.className="pf-scrim";
 root.innerHTML='<div class="pf-dlg pf-'+kind+'" role="dialog" aria-modal="true" tabindex="-1"></div>';
 var m={kind:kind,view:view,root:root,frame:root.firstChild,opener:opener||document.activeElement};
 document.body.appendChild(root);stack.push(m);syncInert();paint(m,true);return m}
function setView(m,view){if(m.view===view)return;m.view=view;paint(m,true)}
function closeTop(){
 var m=stack.pop();if(!m)return;
 m.root.remove();syncInert();
 var o=m.opener;
 if(!(o&&document.contains(o)&&!o.inert&&o!==document.body)){var t=stack[stack.length-1];o=t?($("[data-focus]",t.frame)||t.frame):(pop?$("[role=menuitem]",pop):avatar)}
 try{o.focus()}catch(e){avatar.focus()}}
function closeAll(){while(stack.length)closeTop();closePop(false)}

/* ---------- option C menu ---------- */
function menuItem(view,label,chip){var v=VIEWS[view];return '<button type="button" class="pf-item" role="menuitem" tabindex="-1" data-view="'+view+'"><span class="pf-ico">'+ic(v.icon,16)+'</span><span class="pf-t">'+label+'</span>'+chip+keys(v.k)+'</button>'}
function openPop(){
 if(pop)return;
 pop=document.createElement("div");pop.id="pf-pop";pop.className="pf-pop";pop.setAttribute("aria-label","Profile menu");
 pop.innerHTML='<div class="pf-phead">'+bw(48)+'<div><b>'+NAME+'</b><span class="pf-sub">'+SUB+'</span></div></div>'
 +'<div class="pf-pg" role="menu" aria-label="Profile">'
 +'<div class="pf-lbl" role="presentation">Look and kitchen</div>'+menuItem("settings","Settings","")+menuItem("history","History","")
 +'<div class="pf-lbl" role="presentation">People</div>'+menuItem("me","Me",'<span class="pf-chip">'+NAME+'</span>')+menuItem("household","Household",'<span class="pf-chip">2</span>')
 +'<div class="pf-lbl" role="presentation">My data</div><button type="button" class="pf-item" role="menuitem" tabindex="-1" data-act="download"><span class="pf-ico">'+ic("down",16)+'</span><span class="pf-t">Download inventory CSV</span>'+keys("D")+'</button></div>'
 +'<div class="pf-foot"><span><kbd>&uarr;</kbd> <kbd>&darr;</kbd> move</span><span><kbd>Esc</kbd> close</span><span><kbd>?</kbd> all shortcuts</span></div>';
 document.body.appendChild(pop);placePop();
 avatar.setAttribute("aria-expanded","true");
 var f=$("[role=menuitem]",pop);f.tabIndex=0;f.focus()}
function placePop(){if(!pop)return;var r=avatar.getBoundingClientRect();pop.style.left=(r.right+16)+"px";pop.style.bottom=Math.max(8,window.innerHeight-r.bottom-6)+"px"}
function closePop(ret){if(!pop)return;pop.remove();pop=null;avatar.setAttribute("aria-expanded","false");if(ret!==false)avatar.focus()}

/* ---------- actions ---------- */
function toast(msg){toastEl.textContent=msg;toastEl.classList.add("on");clearTimeout(toastTimer);toastTimer=setTimeout(function(){toastEl.classList.remove("on")},2200)}
function download(){toast("Inventory CSV saved (sample, nothing is downloaded)")}
function openProfile(){
 if(opt==="a")openModal("a","root",avatar);
 else if(opt==="b")openModal("b","me",avatar);
 else{pop?closePop():openPop()}}
function go(v){
 var top=stack[stack.length-1];
 if(top&&top.kind==="s")return;
 if(v==="data"&&opt!=="b"){download();return}
 if(top){
  if(top.kind==="a")setView(top,v==="profile"?"root":v);
  else if(top.kind==="b")setView(top,v==="profile"?"me":v);
  else if(v==="profile")closeTop();
  else setView(top,v);
  return}
 if(opt==="a")openModal("a",v==="profile"?"root":v,avatar);
 else if(opt==="b")openModal("b",v==="profile"?"me":v,avatar);
 else if(v==="profile")openProfile();
 else{closePop(false);openModal("c",v,avatar)}}
function toggleShortcuts(){
 var top=stack[stack.length-1];
 if(top&&top.kind==="s"){closeTop();return}
 openModal("s","list",document.activeElement)}

/* ---------- option tabs ---------- */
function setOpt(o,silent){
 closeAll();opt=o;
 $$(".pf-tab").forEach(function(t){var on=t.dataset.opt===o;t.setAttribute("aria-selected",on);t.tabIndex=on?0:-1});
 $$(".pf-info").forEach(function(s){s.hidden=s.id!=="info-"+o});
 avatar.setAttribute("aria-haspopup",o==="c"?"menu":"dialog");avatar.removeAttribute("aria-expanded");
 if(!silent){try{history.replaceState(null,"","?o="+o)}catch(e){}}}

/* ---------- events ---------- */
document.addEventListener("click",function(e){
 var t=e.target;
 if(t.classList&&t.classList.contains("pf-scrim")){closeTop();return}
 var el=t.closest?t.closest("button"):null;if(!el)return;
 var top=stack[stack.length-1];
 if(el===avatar){openProfile();return}
 if(el.classList.contains("pf-tab")){setOpt(el.dataset.opt);return}
 if(el.hasAttribute("data-open")){openProfile();return}
 if(el.hasAttribute("data-open-both")){closeAll();openPop();var b=$('[data-view="household"]',pop);openModal("c","household",b);return}
 if(el.hasAttribute("data-close")){closeTop();return}
 if(el.dataset.act==="download"){download();if(pop&&!top)closePop();return}
 if(el.dataset.view){
  var v=el.dataset.view;
  if(top){setView(top,v)}
  else if(pop&&el.closest("#pf-pop")){openModal("c",v,el)}
  return}
 if(el.dataset.toast){toast(el.dataset.toast);return}
 if(el.getAttribute("role")==="switch"){el.setAttribute("aria-checked",String(el.getAttribute("aria-checked")!=="true"));return}
 if(el.getAttribute("role")==="radio"){$$('[role=radio]',el.parentNode).forEach(function(b){b.setAttribute("aria-checked",String(b===el))});return}
 if(el.hasAttribute("data-who")){
  $$("[data-who]",el.parentNode).forEach(function(b){b.setAttribute("aria-pressed",String(b===el))});
  $$(".pf-evli",top?top.frame:document).forEach(function(li){li.hidden=el.dataset.who!=="all"&&li.dataset.who!==el.dataset.who});
  $$(".pf-day",top?top.frame:document).forEach(function(d){d.hidden=!$$(".pf-evli",d).some(function(li){return !li.hidden})});
  return}
});
document.addEventListener("pointerdown",function(e){
 if(pop&&!stack.length&&!pop.contains(e.target)&&e.target!==avatar&&!avatar.contains(e.target))closePop(false)});
window.addEventListener("resize",placePop);

document.addEventListener("keydown",function(e){
 var top=stack[stack.length-1],t=e.target;
 if(e.key==="Escape"){
  if(top){e.preventDefault();e.stopPropagation();closeTop();return}
  if(pop){e.preventDefault();closePop();return}}
 if(e.key==="Tab"){
  if(top){var f=focusables(top.frame);if(!f.length){e.preventDefault();return}
   var i=f.indexOf(document.activeElement);
   if(e.shiftKey&&(i<=0)){e.preventDefault();f[f.length-1].focus()}
   else if(!e.shiftKey&&(i===f.length-1||i<0)){e.preventDefault();f[0].focus()}}
  else if(pop&&pop.contains(t)){closePop()}
  return}
 /* tablist roving (option tabs, B sections) and menu arrows */
 if(t.getAttribute&&t.getAttribute("role")==="tab"&&/^(Arrow|Home|End)/.test(e.key)){
  var isOpt=t.classList.contains("pf-tab"),list=isOpt?$$(".pf-tab"):$$(".pf-nvt",top?top.frame:document),i2=list.indexOf(t),n=i2;
  var fwd=isOpt?"ArrowRight":"ArrowDown",bwd=isOpt?"ArrowLeft":"ArrowUp";
  if(e.key===fwd)n=(i2+1)%list.length;else if(e.key===bwd)n=(i2-1+list.length)%list.length;else if(e.key==="Home")n=0;else if(e.key==="End")n=list.length-1;else return;
  e.preventDefault();
  if(isOpt){setOpt(list[n].dataset.opt);list[n].focus()}else{setView(top,list[n].dataset.view)}
  return}
 if(pop&&pop.contains(t)&&!top&&/^Arrow(Up|Down)$|^(Home|End)$/.test(e.key)){
  var items=$$("[role=menuitem]",pop),j=items.indexOf(document.activeElement);
  var nj=e.key==="ArrowDown"?(j+1)%items.length:e.key==="ArrowUp"?(j-1+items.length)%items.length:e.key==="Home"?0:items.length-1;
  e.preventDefault();items.forEach(function(b,x){b.tabIndex=x===nj?0:-1});items[nj].focus();return}
 /* shortcuts */
 if(e.ctrlKey||e.metaKey||e.altKey)return;
 if(t.matches&&t.matches("input,textarea,select,[contenteditable]"))return;
 if(e.key==="?"){e.preventDefault();toggleShortcuts();return}
 if(top&&top.kind==="s")return;
 if(gTimer){clearTimeout(gTimer);gTimer=null;toastEl.classList.remove("on");var v=KEYS[e.key.toLowerCase()];if(v){e.preventDefault();go(v)}return}
 if(e.key==="g"||e.key==="G"){gTimer=setTimeout(function(){gTimer=null;toastEl.classList.remove("on")},1500);toast("G, then P, M, S, Y, H or D")}
},true);

/* ---------- start ---------- */
var Q=new URLSearchParams(location.search),o0=Q.get("o");
setOpt(/^[abc]$/.test(o0||"")?o0:"b",true);
var op=Q.get("open");
if(op){
 if(op==="shortcuts")toggleShortcuts();
 else if(opt==="c"&&Q.get("menu")==="1"&&VIEWS[op]){openPop();openModal("c",op,$('[data-view="'+op+'"]',pop))}
 else if(op==="1")openProfile();
 else if(VIEWS[op])go(op)}
})();
