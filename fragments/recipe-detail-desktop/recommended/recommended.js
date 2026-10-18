/* Recommended layout: C's in-place tabbed left rail + E's hero strip and balanced method columns. Sample data in recommended-data.js.
   Rendering is mockup-only; class names are the build's (recipe.css / recipes-browse vocabulary). Behaviour that the build would own is listed in notes.md.
   ?r=short|typical|long|notes|cooked|nocooked  &tab=ing|notes|cooked|pho  &lane=1 (Notes flyout open)  &banner=none  &theme=dark|light */
(function(){
"use strict";
var Q=new URLSearchParams(location.search);
var R=Q.get("r")||"typical"; if(["short","typical","long","notes","cooked","nocooked"].indexOf(R)<0)R="typical";
var $=function(s,e){return (e||document).querySelector(s)},$$=function(s,e){return Array.prototype.slice.call((e||document).querySelectorAll(s))};
var esc=function(s){return String(s).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})};
var md=function(s){return esc(s).replace(/\*\*(.+?)\*\*/g,"<b>$1</b>")};
var I={
 back:'<path d="M15 5l-7 7 7 7"/>',star:'<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
 edit:'<path d="M4 20l1-4L16 5l3 3L8 19z"/>',share:'<path d="M12 15V4M8 8l4-4 4 4M5 13v6h14v-6"/>',more:'<circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/>',
 up:'<path d="M7 11v9H4v-9zM7 11l4-8c2 0 3 1.5 2.5 3.5L13 9h6a2 2 0 012 2.4l-1.3 6.6a2 2 0 01-2 1.6H7"/>',dn:'<path d="M7 13V4H4v9zM7 13l4 8c2 0 3-1.5 2.5-3.5L13 15h6a2 2 0 002-2.4l-1.3-6.6a2 2 0 00-2-1.6H7"/>',
 note:'<path d="M5 4h14v12l-5 4H5z"/><path d="M14 20v-4h5"/>',clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
 people:'<circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.5 2.7-6 6-6s6 2.5 6 6M16 5a3 3 0 010 6M18 14c2 1 3 3 3 6"/>',zoom:'<circle cx="11" cy="11" r="6"/><path d="M20 20l-4-4M11 8v6M8 11h6"/>',left:'<path d="M15 5l-7 7 7 7"/>',right:'<path d="M9 5l7 7-7 7"/>',cart:'<path d="M3 4h2l2 11h11l2-8H6"/><circle cx="9" cy="19" r="1.4"/><circle cx="17" cy="19" r="1.4"/>',plan:'<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/>',
 cook:'<path d="M8 3c-2 2 2 3 0 5M13 3c-2 2 2 3 0 5M4 12h16l-1.5 7a2 2 0 01-2 1.5h-9A2 2 0 014.800 19z"/>',hist:'<path d="M4 12a8 8 0 108-8 8 8 0 00-6 2.700L4 9M4 4v5h5M12 8v4l3 2"/>',
 pen:'<path d="M4 20l1-4L16 5l3 3L8 19z"/>',branch:'<circle cx="6" cy="5" r="2"/><circle cx="6" cy="19" r="2"/><circle cx="18" cy="8" r="2"/><path d="M6 7v10M18 10c0 4-6 3-12 7"/>',
 plus:'<path d="M12 5v14M5 12h14"/>',timer:'<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2M9 2h6"/>',x:'<path d="M6 6l12 12M18 6L6 18"/>',chev:'<path d="M7 10l5 5 5-5"/>'
};
var ic=function(n,c){return '<svg class="ic '+(c||"")+'" viewBox="0 0 24 24" aria-hidden="true">'+I[n]+'</svg>'};

var key=(R==="short"||R==="long")?R:"typical";
var D=JSON.parse(JSON.stringify(window.RECIPES[key]));
var IMG=window.RECIPES.IMG;
if(R==="nocooked"){D.cooks=[];D.notes=[];D.react={mine:null,people:[],household:D.react.household};D.planned=null}
if(Q.get("banner")==="none")D.banner=null;
var tab=Q.get("tab")||(R==="notes"?"notes":R==="cooked"?"cooked":"ing");
var servesNow=D.serves;

/* ---------------- derived ---------------- */
var cookedN=D.cooks.length,notesN=D.notes.length,remarksN=D.cooks.filter(function(c){return c.line}).length,photosN=D.photos.length+(D.banner?1:0);
var missing=D.ing.filter(function(x){return x[3]==="miss"}).length;
var dens=(D.ing.length>16||D.steps.length>10)?"tight":(D.ing.length<=5&&D.steps.length<=4)?"roomy":"normal";
var cur=D.vers.filter(function(v){return v.id===D.ver})[0];
var lastCook=D.cooks[0]&&D.cooks[0].ago;
var upN=D.react.people.filter(function(p){return p[1]==="up"}).length,dnN=D.react.people.length-upN;
var tabs=[["ing","Ingredients",D.ing.length,"1"],["notes","Notes",notesN,"2"],["cooked","Cooked",cookedN,"3"],["pho","Photos",photosN,"4"]].filter(function(t){
 if(t[0]==="cooked"&&!cookedN)return false;   /* empty is absent: "Not cooked yet." has no action */
 if(t[0]==="pho"&&!photosN)return false;return true});
if(!tabs.some(function(t){return t[0]===tab}))tab="ing";
var mins=function(m){return m>=60?(m%60?Math.floor(m/60)+" h "+m%60:Math.floor(m/60)+" h"):m+" min"};

/* ---------------- rail panes ---------------- */
function ingPane(){
 var h='<div class="lblrow"><span class="lbl">Ingredients <span class="sub">'+(D.pantryKnown?(missing?(D.ing.length-missing)+' of '+D.ing.length+' in':'all in'):'')+'</span></span><span class="row-a">'+(D.planned?'<button type="button" class="mini" data-hold>Hold for '+D.planned+'</button>':'')+'<a class="mini ico" href="#" aria-label="Edit ingredients" data-key="e">'+ic("pen")+'</a></span></div><div class="pscroll" data-scroll><div class="ings">';
 D.ing.forEach(function(x){
  if(x[6]&&D.groups)h+='<h3 class="grp">'+esc(x[6])+'</h3>';
  var miss=x[3]==="miss";
  h+='<div class="ing'+(miss?' miss':'')+'">'+(D.pantryKnown?'<span class="dot'+(miss?' no':'')+'" title="'+(miss?'Not in the pantry':'In the pantry')+'"></span>':'')
   +'<span class="nm">'+esc(x[0].replace(/,.*/,""))+(x[0].indexOf(",")>0?'<small>'+esc(x[0].replace(/^[^,]*/,""))+'</small>':"")+(x[4]?' <small>(optional)</small>':"")+'</span>'
   +(miss?'<button type="button" class="cart" data-cart aria-label="Add '+esc(x[0])+' to shopping">'+ic("cart")+'</button>':"")
   +(x[1]===null?'<span class="q unk">amount?</span>':'<span class="q" data-a="'+x[1]+'" data-u="'+esc(x[2])+'"></span>')+'</div>'});
 h+='</div></div>';
 if(missing)h+='<div class="pfoot">'+(missing>1?'<button type="button" class="mini wide" data-cartall>'+ic("cart")+' Add all '+missing+' missing to shopping</button>':'')+'<span class="hint">Talk to your assistant about substitutes</span></div>';
 return h}
function noteCard(n){return '<div class="note'+(n.inh?' inh':'')+'">'+n.b.map(function(p){return '<p>'+md(p)+'</p>'}).join("")+(n.li?'<ul>'+n.li.map(function(l){return '<li>'+esc(l)+'</li>'}).join("")+'</ul>':"")
 +'<small>'+esc(n.by)+', '+esc(n.at)+(n.inh?'<span class="from" title="from the parent version">'+ic("branch")+' from '+esc(n.on)+'</span>':n.reworded?'<span class="from">changed in this version</span>':'')+'</small></div>'}
function notesPane(){
 var h='<div class="lblrow"><span class="lbl">Notes <span class="sub">'+(notesN?'on '+esc(cur.name):'')+'</span></span><span class="row-a"><a class="mini ico" href="#" aria-label="Edit notes">'+ic("pen")+'</a></span></div><div class="pscroll" data-scroll>';
 if(!notesN)h+='<div class="rb-empty"><span>'+ic("note")+'</span><div><b>No notes yet.</b><small>'+(cookedN?'Anything worth remembering next time.':'Make it once and the thumbs and notes start here.')+'</small></div></div>';
 h+=D.notes.map(noteCard).join("")+'</div><div class="pfoot"><button type="button" class="rb-btn" data-note>'+ic("plus")+' Add a note</button></div>';
 return h}
function cookedPane(){
 var h='<div class="lblrow"><span class="lbl">Cooked <span class="sub">'+cookedN+(cookedN>=40?"+":"")+' time'+(cookedN>1?'s':'')+'</span></span></div>';
 if(D.react.fav)h+='<p class="fav">'+esc(D.react.fav)+'</p>';
 h+='<div class="pscroll" data-scroll>';
 D.cooks.forEach(function(c){h+='<div class="hist"><div class="d">'+(c.d?'<b>'+c.d+'</b>':'')+c.m+'</div><div class="t"><b>'+esc(c.by)+'</b> cooked '+esc(c.v)+(c.line?'<small>“'+esc(c.line)+'”</small>':'')+((c.verdict||c.ate)?'<small>'+(c.verdict?'<em class="vd">'+c.verdict+'</em>':'')+(c.verdict&&c.ate?' . ':'')+(c.ate?c.ate+' ate':'')+'</small>':'')+'</div></div>'});
 return h+'</div>'}
function phoPane(){
 return '<div class="lblrow"><span class="lbl">Photos <span class="sub">'+photosN+'</span></span></div><div class="pscroll" data-scroll><div id="pgrid" class="pgrid"><button type="button" class="pmore" data-pmore>Show '+photosN+' photos <small>(loads on tap)</small></button></div></div>'}
var panes={ing:ingPane,notes:notesPane,cooked:cookedPane,pho:phoPane};

/* ---------------- method ---------------- */
function photoCell(ph,i){
 if(!ph)return"";
 if(ph==="prep")return '<span class="psp pprep" title="Photo is being prepared">Photo being prepared</span>';
 var real=ph.indexOf("img:")===0;
 var bg=real?'background-image:url('+IMG+ph.slice(4)+'-m.webp)':'background-image:linear-gradient(150deg,'+ph+',color-mix(in srgb,'+ph+' 55%,#000))';
 return '<button type="button" class="psp" data-psp style="'+bg+'" aria-label="Enlarge the photo for step '+(i+1)+'" title="Enlarge (Esc closes)">'+(real?'':'<span class="pf">'+D.emoji+'</span>')+'<span class="zm" aria-hidden="true">'+ic("zoom","s")+'</span></button>'}
function stepsHtml(){
 var h="";
 D.steps.forEach(function(s,i){
  if(s[3]&&D.groups)h+='<h3 class="grp">'+esc(s[3])+'</h3>';
  /* per-step time sits beside the step number, only where the step has one; NO ingredient links on this page (Cook it mode owns them) */
  h+='<div class="stp" data-i="'+i+'"><div class="nbw"><span class="nb">'+(i+1)+'</span>'+(s[1]?'<span class="timer">'+ic("timer")+mins(s[1])+'</span>':'')+'</div><div class="sb"><p>'+esc(s[0])+'</p></div>'+photoCell(s[2],i)+'</div>'});
 return h}

/* ---------------- hero ---------------- */
function hero(){
 var vers=D.vers.length>1;
 var chip='<div class="vwrap"><button type="button" class="vchip" data-vchip aria-haspopup="true" aria-expanded="false" title="Switch version">'+(cur.usual?'<span class="us" title="Our usual">★</span>':'')+(cur.review?'<span class="rvd" title="Has a change to review"></span>':'')+'<span class="vn">'+esc(cur.name)+'</span>'+(vers?ic("chev","s"):'')+'</button>'
  +(vers?'<div class="vpop" data-vpop role="menu" hidden>'+D.vers.map(function(v){return '<button type="button" role="menuitem" class="vi'+(v.id===D.ver?' on':'')+'">'+(v.usual?'<span class="us">★</span>':'<span class="us"></span>')+'<span class="vl"><b>'+esc(v.name)+'</b>'+(v.parent?'<small>From '+esc(v.parent)+'</small>':'<small>First version</small>')+'</span>'+(v.st==="trying"?'<em>Trying</em>':'')+(v.review?'<em class="rv">To review</em>':'')+'</button>'}).join("")+'<a class="vall" href="#">All versions</a></div>':'')+'</div>';
 /* Notes and reactions pill: icons and counts only, no text label (the thumbs and note icons say it). aria-label and tooltip keep the words. */
 var pill='<button type="button" class="rb-notesbtn re-a" data-gonotes aria-label="Notes and reactions: '+upN+' liked, '+dnN+' not for me, '+notesN+' notes" title="Notes and reactions (N)"><i class="rb-pillcnt"><i class="u">'+ic("up")+upN+'</i>'+(dnN?'<i class="d">'+ic("dn")+dnN+'</i>':'')+'<i>'+ic("note")+notesN+'</i></i><span class="kbd">N</span></button>';
 var hist='<button type="button" class="hico" data-hist aria-expanded="false" aria-controls="hlane" aria-label="History (,)" title="History (,)">'+ic("hist")+'</button>';
 var servesCta='<div class="svwrap"><button type="button" class="svcta" data-svcta aria-haspopup="true" aria-expanded="false" title="Change servings">'+ic("people","s")+'<span data-sv>Serves '+servesNow+'</span>'+ic("chev","s")+'</button>'
  +'<div class="spop" data-spop role="group" aria-label="Servings" hidden><div class="serves" data-serves><button type="button" data-dec aria-label="Fewer servings">−</button><span data-sv2>'+servesNow+' servings</span><button type="button" data-inc aria-label="More servings">+</button></div><small>Scales the ingredients and Cook it</small></div></div>';
 /* banner band: the photo has its own band above the controls; nothing sits on it or crops into it */
 return '<header class="hero'+(D.banner?'':' nobanner')+'" id="hero">'
 +(D.banner?'<div class="hphoto" aria-hidden="true"><img src="'+D.banner+'" alt="" width="1600" height="560" decoding="async"></div>':'')
 +'<div class="hbody"><div class="hr1"><div class="hmain"><a class="back ib" href="#" data-key="alt-left" aria-label="Back to Recipes">'+ic("back")+'</a>'
 +'<h1 data-vt="title" title="'+esc(D.name)+'">'+esc(D.name)+'</h1></div>'
 +'<div class="hicons">'+pill
 +'<button type="button" class="ib" data-star aria-pressed="'+(D.react.mine==="up")+'" aria-label="Like this version">'+ic("star")+'</button>'
 +'<a class="ib" href="#" data-key="e" aria-label="Edit (E)">'+ic("edit")+'</a>'
 +(D.share!==null?'<button type="button" class="shr-chip" data-share>'+ic("share","s")+'<span class="sl">Share</span>'+(D.share?'<span class="shr-n">'+D.share+'</span>':'')+'<span class="kbd">S</span></button>':'')
 +'<button type="button" class="ib" data-more aria-label="More">'+ic("more")+'</button></div></div>'
 +'<div class="hr2"><div class="hmeta">'+servesCta+'<span class="tbadge" title="Total time">'+ic("clock","s")+D.min+'</span>'+chip+hist+'</div>'
 +'<div class="hgo"><button type="button" class="rb-btn" data-plan>'+ic("plan")+(D.planned?'<span class="lw">Planned </span>'+D.planned:'Plan it')+'</button><a class="rb-btn pri" href="#" data-cook>'+ic("cook")+'Make it</a></div></div></div>'
 +'</header>'}

var railT='<div class="tabs" role="tablist" aria-label="Ingredients, notes, cooked, photos">'+tabs.map(function(t){
 return '<button type="button" role="tab" id="tab-'+t[0]+'" aria-controls="p-'+t[0]+'" data-tab="'+t[0]+'" aria-selected="'+(t[0]===tab)+'" tabindex="'+(t[0]===tab?0:-1)+'" title="'+t[1]+' ('+t[3]+')"><span class="tl">'+t[1]+'</span>'+(t[2]?'<b class="bdg">'+t[2]+'</b>':'')+'</button>'}).join("")+'</div>';
var rail='<aside class="rail" aria-label="Ingredients, notes, cooked, photos">'+railT+tabs.map(function(t){return '<section class="pane" role="tabpanel" id="p-'+t[0]+'" aria-labelledby="tab-'+t[0]+'"'+(t[0]===tab?'':' hidden')+' data-pane="'+t[0]+'">'+panes[t[0]]()+'</section>'}).join("")
 +(D.source?'<p class="src" title="Where it came from">'+ic("branch","s")+'<span>'+esc(D.source)+'</span></p>':'')+'</aside>';
var method='<main class="meth" id="met" data-steps="'+D.steps.length+'"><div class="lblrow"><span class="lbl">Method <span class="sub">'+D.steps.length+' steps</span></span><span class="row-a"><a class="mini ico" href="#" aria-label="Edit method" data-key="e">'+ic("pen")+'</a></span></div><div class="mscroll" data-scroll><div class="steps">'+stepsHtml()+'</div></div></main>';

/* Notes and reactions flyout (lane, pushes the page, never covers it). Reactions: NAME against each rating, only people who rated. */
function lane(){
 var rows=D.react.people.map(function(p){return '<li class="pr"><span class="rb-av m'+(p[0]==="You"?3:p[0]==="Sam"?2:1)+'">'+esc(p[0].charAt(0))+'</span><span class="pn">'+esc(p[0])+'</span><span class="rb-th '+p[1]+'">'+ic(p[1]==="up"?"up":"dn")+(p[1]==="up"?'Liked it':'Not for me')+'</span><small>'+esc(p[2])+'</small></li>'}).join("");
 var rem=D.cooks.filter(function(c){return c.line}).map(function(c){return '<div class="note"><p>“'+esc(c.line)+'”</p><small>'+esc(c.by)+', '+c.d+' '+c.m+' . cooked '+esc(c.v)+'</small></div>'}).join("");
 return '<aside class="rfly rfly-notes" id="lane" aria-label="Notes and reactions" hidden><header class="rfh"><h2>Notes and reactions</h2><button type="button" class="x" data-lane-close aria-label="Close (Ctrl+Enter)">'+ic("x")+'</button></header>'
 +'<div class="rfb" data-scroll><section><h3 class="rb-h4">Reactions <span class="sub">'+(D.react.people.length?D.react.people.length+' of '+D.react.household+' rated':'')+'</span></h3>'
 +(rows?'<ul class="plist">'+rows+'</ul>':'<p class="mut">Nobody has reacted yet.</p>')+'</section>'
 +'<section><h3 class="rb-h4">Cook remarks <span class="sub">'+remarksN+'</span></h3>'+(rem||'<p class="mut">None yet.</p>')+'</section>'
 +'<section><h3 class="rb-h4">Notes on this version <span class="sub">'+notesN+'</span></h3>'+(D.notes.slice().reverse().map(noteCard).join("")||'<p class="mut">No notes yet.</p>')+'</section></div>'
 +'<footer class="rff"><button type="button" class="rb-btn pri" data-note>'+ic("plus")+' Add a note</button></footer></aside>'}

/* History flyout: same lane, slide-in and treatment as Notes and reactions. This recipe's version history, newest first, with the lineage chain on top. */
function histLane(){
 var chain=[],v=cur;while(v){chain.unshift(v);var pn=v.parent;v=pn?D.vers.filter(function(x){return x.name===pn})[0]:null}
 var rows=D.hist.map(function(h){return '<li class="hrow"><div class="hd"><b>'+esc(h.at)+'</b></div><div class="ht"><p><b>'+esc(h.by)+'</b> '+(h.from?'started':'changed')+' <span class="hv">'+esc(h.v)+'</span>'+(h.from?' <small>from '+esc(h.from)+'</small>':'')+'</p><p class="hw">'+esc(h.what)+'</p></div></li>'}).join("");
 return '<aside class="rfly rfly-hist" id="hlane" aria-label="History" hidden><header class="rfh"><h2>History</h2><button type="button" class="x" data-hist-close aria-label="Close (Esc)">'+ic("x")+'</button></header>'
 +'<div class="rfb" data-scroll><section><h3 class="rb-h4">This version <span class="sub">'+esc(cur.name)+'</span></h3><p class="chain">'+chain.map(function(c,i){return (i?'<span class="ar" aria-hidden="true">\u2192</span>':'')+'<span class="ch'+(c.id===cur.id?' on':'')+'">'+esc(c.name)+'</span>'}).join("")+'</p></section>'
 +'<section><h3 class="rb-h4">Changes <span class="sub">'+D.hist.length+'</span></h3><ol class="hlist">'+rows+'</ol></section></div></aside>'}
$("#rtab").innerHTML=hero()+'<div class="rbody">'+rail+method+'</div>';
$("#lane-slot").innerHTML=lane()+histLane();
var rt=$("#rtab");rt.dataset.dens=dens;rt.dataset.tab=tab;rt.dataset.r=R;rt.dataset.size=key;
document.title="Recipe detail, desktop, recommended ("+R+")";

/* ---------------- behaviour ---------------- */
function fmt(v){return String(Math.round(v*100)/100)}
function scale(){$$("[data-a]").forEach(function(e){var v=parseFloat(e.dataset.a)*servesNow/D.serves;e.textContent=fmt(v)+(e.dataset.u?" "+e.dataset.u:"")});$("[data-sv]").textContent="Serves "+servesNow;$("[data-sv2]").textContent=servesNow+" serving"+(servesNow>1?"s":"");$("[data-cook]").setAttribute("href","#cook?n="+servesNow)}
scale();
$("[data-dec]").onclick=function(){if(servesNow>1){servesNow--;scale()}};
$("[data-inc]").onclick=function(){if(servesNow<12){servesNow++;scale()}};
/* Serves is the call to action: opens a small stepper under it (Esc or a click outside closes and returns focus) */
var sc=$("[data-svcta]"),sp=$("[data-spop]");
function spop(on){sp.hidden=!on;sc.setAttribute("aria-expanded",on)}
sc.onclick=function(e){e.stopPropagation();spop(sp.hidden);if(!sp.hidden)$("[data-inc]").focus()};
document.addEventListener("click",function(e){if(!sp.hidden&&!sp.contains(e.target))spop(false)});

function setTab(t,focus){
 if(!tabs.some(function(x){return x[0]===t}))return;
 tab=t;rt.dataset.tab=t;
 $$("[role=tab]").forEach(function(b){var on=b.dataset.tab===t;b.setAttribute("aria-selected",on);b.tabIndex=on?0:-1;if(on&&focus)b.focus()});
 $$("[role=tabpanel]").forEach(function(p){p.hidden=p.dataset.pane!==t});
 fades();
 try{var u=new URL(location.href);u.searchParams.set("tab",t);history.replaceState(null,"",u)}catch(e){}}
$$("[role=tab]").forEach(function(b){b.onclick=function(){setTab(b.dataset.tab)};
 b.onkeydown=function(e){var ids=tabs.map(function(t){return t[0]}),i=ids.indexOf(b.dataset.tab);
  if(e.key==="ArrowRight"||e.key==="ArrowLeft"){e.preventDefault();setTab(ids[(i+(e.key==="ArrowRight"?1:ids.length-1))%ids.length],true)}}});

/* Notes and reactions flyout: opens on the pill or N, pushes the page (the app's lane rule), closes on its x or Ctrl/Cmd+Enter. */
var app=$(".app"),laneEl=$("#lane");
var hlane=$("#hlane"),hbtn=$("[data-hist]");
function setHist(on,back){if(on&&!laneEl.hidden)setLane(false);hlane.hidden=!on;hbtn.setAttribute("aria-expanded",on);app.classList.toggle("lane-open",on||!laneEl.hidden);if(on)$("[data-hist-close]").focus();else if(back)hbtn.focus();setTimeout(fades,200)}
hbtn.onclick=function(e){e.preventDefault();setHist(hlane.hidden)};$("[data-hist-close]").onclick=function(){setHist(false,true)};
function setLane(on){if(on&&!hlane.hidden)setHist(false);laneEl.hidden=!on;app.classList.toggle("lane-open",on||!hlane.hidden);$("[data-gonotes]").setAttribute("aria-expanded",on);setTimeout(fades,200)}
$("[data-gonotes]").onclick=function(){setLane(laneEl.hidden)};
$("[data-lane-close]").onclick=function(){setLane(false)};
if(Q.get("lane")==="1")setLane(true);if(Q.get("lane")==="h")setHist(true);

/* version chip popover */
var vc=$("[data-vchip]"),vp=$("[data-vpop]");
function vpop(on){if(!vp)return;vp.hidden=!on;vc.setAttribute("aria-expanded",on)}
if(vp){vc.onclick=function(e){e.stopPropagation();vpop(vp.hidden)};document.addEventListener("click",function(e){if(!vp.hidden&&!vp.contains(e.target))vpop(false)})}

/* keys. Recipe page only (a build `when` gate): 1-4 rail tabs, N Notes and reactions flyout (the app's existing N), S share, Esc closes a step photo or the version menu.
   Ignored in fields and with Ctrl/Alt/Cmd. Ctrl/Cmd+Enter or Ctrl/Cmd+Esc closes the flyout (desktop rule). E and comma are plain data-key links, as in the app. */
var KEYS={"1":"ing","2":"notes","3":"cooked","4":"pho"};
document.addEventListener("keydown",function(e){
 var t=e.target;
 if((e.ctrlKey||e.metaKey)&&(e.key==="Enter"||e.key==="Escape")){if(!laneEl.hidden){e.preventDefault();setLane(false)}return}
 if(e.ctrlKey||e.metaKey||e.altKey)return;if(t&&/INPUT|TEXTAREA|SELECT/.test(t.tagName))return;
 var k=e.key.toLowerCase();
 if(e.key==="Escape"){if(!sp.hidden){spop(false);sc.focus();return}if(!hlane.hidden){setHist(false,true);return}if($(".stp.open")){collapse(true);return}if(vp&&!vp.hidden){vpop(false);vc.focus();return}return}
 if(KEYS[k]){e.preventDefault();setTab(KEYS[k])}
 else if(k==="n"){e.preventDefault();setLane(laneEl.hidden)}
 else if(k==="s"&&$("[data-share]")){e.preventDefault();toast("Share panel opens in the right lane (not drawn here).")}
 else if(k===","){e.preventDefault();setHist(hlane.hidden,true)}
 else if(k==="e"){e.preventDefault();toast("Editor opens in the right lane (not drawn here).")}
});

/* step photos: click enlarges the photo in place, under its step (no dimming, nothing else moves except the steps below it); click it again, click away or Esc returns, focus stays on the step photo.
   The full-screen photo viewer below is for the Photos tab only. */
function collapse(back){var o=$(".stp.open");if(!o)return;o.classList.remove("open");var b=$("[data-psp]",o);b.setAttribute("aria-expanded","false");if(back)b.focus();fades()}
$$("[data-psp]").forEach(function(b){b.setAttribute("aria-expanded","false");b.onclick=function(e){e.stopPropagation();var s=b.closest(".stp"),was=s.classList.contains("open");collapse();if(!was){s.classList.add("open");b.setAttribute("aria-expanded","true");s.scrollIntoView({block:"nearest"});fades()}}});
document.addEventListener("click",function(e){if($(".stp.open")&&!e.target.closest(".stp.open"))collapse()});

var pm=$("[data-pmore]");
/* Photos = the uploaded photos plus the banner image; method step photos are not here (they enlarge in place under their step) */
var PH=(D.banner?[{src:D.banner,thumb:D.banner,alt:D.name+", banner image",tag:"Banner"}]:[]).concat(D.photos.map(function(n,j){return {src:IMG+n+"-l.webp",thumb:IMG+n+"-t.webp",alt:D.name+", uploaded photo "+(j+1)}}));
if(pm)pm.onclick=function(){var g=$("#pgrid"),h="";PH.forEach(function(p,i){h+='<button type="button" class="pfr" data-ph="'+i+'" style="background-image:url('+p.thumb+')" aria-label="Open photo '+(i+1)+' of '+photosN+(p.tag?' ('+p.tag.toLowerCase()+')':'')+'">'+(p.tag?'<span class="ptag">'+p.tag+'</span>':'')+'</button>'});g.innerHTML=h;fades();
 var th=$$("[data-ph]",g);th.forEach(function(b,i){b.onclick=function(){LB.open(th.map(function(x,j){return {src:PH[j].src,alt:PH[j].alt,el:x}}),i)}})};

/* ---------------- lightbox (shared by the Photos grid and the step photos) ----------------
   Dims the page (inert + scrim), photo centred, object-fit contain with max sizes from the viewport, never upscaled past its natural size (width/height stay auto).
   Left/Right arrows (keys and buttons) wrap round; Home/End jump; Esc, the close button or a click on the scrim close; Tab is held inside; focus returns to the opener.
   While open every other page key (1-4, N, S, E, comma, backtick, Ctrl+Enter) is swallowed. */
var LB=(function(){
 var el=document.createElement("div");el.className="lbx";el.hidden=true;el.setAttribute("role","dialog");el.setAttribute("aria-modal","true");el.setAttribute("aria-label","Photo viewer");
 el.innerHTML='<button type="button" class="lbx-x" aria-label="Close (Esc)">'+ic("x")+'</button><button type="button" class="lbx-n prev" aria-label="Previous photo (Left arrow)">'+ic("left")+'</button><figure class="lbx-f"><img alt=""><figcaption></figcaption></figure><button type="button" class="lbx-n next" aria-label="Next photo (Right arrow)">'+ic("right")+'</button>';
 document.body.appendChild(el);
 var img=$("img",el),cap=$("figcaption",el),bx=$(".lbx-x",el),pv=$(".prev",el),nx=$(".next",el),L={items:[],i:0,isOpen:false};
 function show(i){var n=L.items.length;L.i=(i+n)%n;var it=L.items[L.i];img.alt=it.alt||"";img.src=it.src;cap.textContent=n>1?(L.i+1)+" of "+n:""}
 function toggleBg(on){[$(".app"),$("#toast")].forEach(function(x){if(x){if(on)x.setAttribute("inert","");else x.removeAttribute("inert")}});document.documentElement.classList.toggle("lbx-on",on)}
 L.open=function(items,i){L.items=items;L.isOpen=true;el.hidden=false;toggleBg(true);pv.hidden=nx.hidden=items.length<2;show(i);bx.focus()};
 L.close=function(){if(!L.isOpen)return;L.isOpen=false;el.hidden=true;toggleBg(false);img.removeAttribute("src");var o=L.items[L.i].el;if(o&&o.focus){o.focus();if(o.scrollIntoView)o.scrollIntoView({block:"nearest"})}};
 L.step=function(d){if(L.items.length>1)show(L.i+d)};
 pv.onclick=function(){L.step(-1)};nx.onclick=function(){L.step(1)};bx.onclick=L.close;
 el.addEventListener("click",function(e){if(e.target===el||e.target.classList.contains("lbx-f"))L.close()});
 document.addEventListener("keydown",function(e){
  if(!L.isOpen)return;
  var k=e.key;
  if(k==="Escape")L.close();
  else if(k==="ArrowLeft")L.step(-1);else if(k==="ArrowRight")L.step(1);
  else if(k==="Home"){show(0)}else if(k==="End"){show(L.items.length-1)}
  else if(k==="Tab"){var f=[bx,pv,nx].filter(function(b){return !b.hidden}),a=document.activeElement,ix=f.indexOf(a);e.preventDefault();f[(ix+(e.shiftKey?f.length-1:1))%f.length].focus();return}
  else if(k!=="Shift"&&k!=="Control"&&k!=="Alt"&&k!=="Meta"&&k!=="Enter"&&k!==" ")e.stopImmediatePropagation();
  if(k==="Escape"||k==="ArrowLeft"||k==="ArrowRight"||k==="Home"||k==="End"){e.preventDefault();e.stopImmediatePropagation()}
 },true);
 return L})();

function toast(m){var t=$("#toast");t.textContent=m;t.hidden=false;clearTimeout(toast.t);toast.t=setTimeout(function(){t.hidden=true},2600)}
$("[data-plan]").onclick=function(){toast(D.planned?"On the plan for "+D.planned+". Change it in Plan.":"Day picker opens in the right lane (not drawn here).")};
$("[data-star]").onclick=function(e){var b=e.currentTarget;b.setAttribute("aria-pressed",b.getAttribute("aria-pressed")!=="true")};
$$("[data-cart]").forEach(function(b){b.onclick=function(){b.disabled=true;b.classList.add("done");toast("Added to the shopping list.")}});
var ca=$("[data-cartall]");if(ca)ca.onclick=function(){$$("[data-cart]").forEach(function(b){b.disabled=true;b.classList.add("done")});toast("Added "+missing+" to the shopping list.")};
var hd=$("[data-hold]");if(hd)hd.onclick=function(){$$(".dot").forEach(function(d){d.className="dot held"});hd.textContent="Held for "+D.planned;toast("Held for "+D.planned+".")};
$$("[data-note],[data-more],[data-share]").forEach(function(b){b.addEventListener("click",function(){toast(b.hasAttribute("data-note")?"Note sheet opens (not drawn here).":b.hasAttribute("data-more")?"More menu opens as a sheet (not drawn here).":"Share panel opens in the right lane (not drawn here).")})});
$$("a[href='#'],a[href^='#cook']").forEach(function(a){a.addEventListener("click",function(e){e.preventDefault()})});

/* edge fades show where an inner pane still has more to scroll */
function fades(){$$("[data-scroll]").forEach(function(s){var more=s.scrollHeight-s.clientHeight>1;s.dataset.more=more?(s.scrollTop+s.clientHeight<s.scrollHeight-2?"down":"end"):"none"})}
$$("[data-scroll]").forEach(function(s){s.addEventListener("scroll",fades)});
addEventListener("resize",fades);fades();if(document.fonts&&document.fonts.ready)document.fonts.ready.then(fades);

/* ---------------- demo switcher (mockup only) ---------------- */
var P=$("#demoP"),B=$("#demoB");
function link(ch){var u=new URL(location.href);Object.keys(ch).forEach(function(k){if(ch[k]===null)u.searchParams.delete(k);else u.searchParams.set(k,ch[k])});return u.pathname+u.search}
function setTheme(v){try{localStorage.setItem("theme",v==="light"?"kitchie-day":"kitchie")}catch(e){}document.documentElement.setAttribute("data-theme",v==="light"?"kitchie-day":"kitchie");var u=new URL(location.href);u.searchParams.set("theme",v);history.replaceState(null,"",u)}
var qt=Q.get("theme");if(qt==="light"||qt==="dark")setTheme(qt);
var rs=[["typical","Typical"],["short","Short"],["long","Long"],["notes","Notes"],["cooked","Cooked"],["nocooked","Not cooked"]];
P.innerHTML='<h3>State</h3><div class="dc">'+rs.map(function(r){return '<a href="'+link({r:r[0],tab:null})+'"'+(R===r[0]?' aria-current="true"':'')+'>'+r[1]+'</a>'}).join("")+'</div><h3>Banner</h3><div class="dc"><a href="'+link({banner:null})+'"'+(Q.get("banner")!=="none"?' aria-current="true"':'')+'>Has banner</a><a href="'+link({banner:"none"})+'"'+(Q.get("banner")==="none"?' aria-current="true"':'')+'>No banner</a></div><h3>Theme</h3><div class="dc"><button type="button" data-th="dark">Dark</button><button type="button" data-th="light">Light</button></div>'
 +(D.groups?'<p class="dn">Groups are drawn, but the app drops <code>group</code> today. Needs the wire change.</p>':'')+'<p class="dn">Keys: 1 to 4 rail tabs, N Notes and reactions, S share, comma History. flyout. In the Photos viewer: Left/Right, Home/End, Esc. The wide layout needs 1280 x 700 or more; below that the page stacks and scrolls (the build keeps today’s page there).</p>';
$$("[data-th]",P).forEach(function(b){b.onclick=function(){setTheme(b.dataset.th)}});
B.onclick=function(){var o=P.hidden;P.hidden=!o;B.setAttribute("aria-expanded",o)};
document.addEventListener("keydown",function(e){if(e.key==="`")B.click()});
})();
