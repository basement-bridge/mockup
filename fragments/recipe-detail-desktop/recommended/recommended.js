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
 cart:'<path d="M3 4h2l2 11h11l2-8H6"/><circle cx="9" cy="19" r="1.4"/><circle cx="17" cy="19" r="1.4"/>',plan:'<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/>',
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
var cookedN=D.cooks.length,notesN=D.notes.length,remarksN=D.cooks.filter(function(c){return c.line}).length,photosN=D.photosN;
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
 if(!notesN)h+='<div class="rb-empty"><span>'+ic("note")+'</span><div><b>No notes yet.</b><small>'+(cookedN?'Anything worth remembering next time.':'Cook it once and the thumbs and notes start here.')+'</small></div></div>';
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
 var bg=ph.indexOf("img:")===0?'background-image:url('+IMG+ph.slice(4)+'-m.webp)':'background-image:linear-gradient(150deg,'+ph+',color-mix(in srgb,'+ph+' 55%,#000))';
 return '<button type="button" class="psp" data-psp style="'+bg+'" aria-label="Show the photo for step '+(i+1)+'">'+(ph.indexOf("img:")===0?'':'<span class="pf">'+D.emoji+'</span>')+'</button>'}
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
 var lineage=cur.parent?'<a class="lin" href="#" title="Open '+esc(cur.parent)+'">'+ic("branch","s")+'From '+esc(cur.parent)+'</a>':'';
 var proof=cookedN?'<button type="button" class="proof" data-gocooked title="Cooked '+cookedN+' time'+(cookedN>1?'s':'')+(lastCook?', last '+lastCook:'')+' (3)">Cooked <b>'+cookedN+'×</b>'+(lastCook?'<small class="lc">last '+lastCook+'</small>':'')+'<span class="rb-dots">'+D.cooks.slice(0,8).reverse().map(function(c,i,a){return '<i class="'+(i===a.length-1?'last':'')+'"></i>'}).join("")+'</span></button>':'<span class="proof none" title="Cook it once and the thumbs and notes start here.">Not cooked yet</span>';
 /* Notes and reactions pill: icons and counts only, no text label (the thumbs and note icons say it). aria-label and tooltip keep the words. */
 var pill='<button type="button" class="rb-notesbtn re-a" data-gonotes aria-label="Notes and reactions: '+upN+' liked, '+dnN+' not for me, '+notesN+' notes" title="Notes and reactions (N)"><i class="rb-pillcnt"><i class="u">'+ic("up")+upN+'</i>'+(dnN?'<i class="d">'+ic("dn")+dnN+'</i>':'')+'<i>'+ic("note")+notesN+'</i></i><span class="kbd">N</span></button>';
 return '<header class="hero'+(D.banner?'':' nobanner')+'" id="hero">'
 +(D.banner?'<div class="hphoto" aria-hidden="true"><img src="'+D.banner+'" alt="" width="1600" height="560" decoding="async"></div>':'')
 +'<div class="hmain"><a class="back ib" href="#" data-key="alt-left" aria-label="Back to Recipes">'+ic("back")+'</a>'
 +'<div class="hinfo"><h1 data-vt="title" title="'+esc(D.name)+'">'+esc(D.name)+'</h1>'
 +'<span class="tbadge" title="Total time">'+ic("clock","s")+D.min+'</span>'
 +'<div class="hmeta"><div class="serves" data-serves><button type="button" data-dec aria-label="Fewer servings">−</button><span data-sv>Serves '+servesNow+'</span><button type="button" data-inc aria-label="More servings">+</button></div>'
 +chip+lineage+'<a class="hl" href="#" data-key=",">'+ic("hist","s")+'History<span class="kbd">,</span></a>'+proof+'</div></div></div>'
 +'<div class="hact"><div class="hicons">'+pill
 +'<button type="button" class="ib" data-star aria-pressed="'+(D.react.mine==="up")+'" aria-label="Like this version">'+ic("star")+'</button>'
 +'<a class="ib" href="#" data-key="e" aria-label="Edit (E)">'+ic("edit")+'</a>'
 +(D.share!==null?'<button type="button" class="shr-chip" data-share>'+ic("share","s")+'<span class="sl">Share</span>'+(D.share?'<span class="shr-n">'+D.share+'</span>':'')+'<span class="kbd">S</span></button>':'')
 +'<button type="button" class="ib" data-more aria-label="More">'+ic("more")+'</button></div>'
 +'<div class="hgo"><button type="button" class="rb-btn" data-plan>'+ic("plan")+(D.planned?'<span class="lw">Planned </span>'+D.planned:'Plan it')+'</button><a class="rb-btn pri" href="#" data-cook>'+ic("cook")+'Cook it</a></div></div>'
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

$("#rtab").innerHTML=hero()+'<div class="rbody">'+rail+method+'</div>';
$("#lane-slot").innerHTML=lane();
var rt=$("#rtab");rt.dataset.dens=dens;rt.dataset.tab=tab;rt.dataset.r=R;rt.dataset.size=key;
document.title="Recipe detail, desktop, recommended ("+R+")";

/* ---------------- behaviour ---------------- */
function fmt(v){return String(Math.round(v*100)/100)}
function scale(){$$("[data-a]").forEach(function(e){var v=parseFloat(e.dataset.a)*servesNow/D.serves;e.textContent=fmt(v)+(e.dataset.u?" "+e.dataset.u:"")});$("[data-sv]").textContent="Serves "+servesNow;$("[data-cook]").setAttribute("href","#cook?n="+servesNow)}
scale();
$("[data-dec]").onclick=function(){if(servesNow>1){servesNow--;scale()}};
$("[data-inc]").onclick=function(){if(servesNow<12){servesNow++;scale()}};

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
var gc=$("[data-gocooked]");if(gc)gc.onclick=function(){setTab("cooked",true)};

/* Notes and reactions flyout: opens on the pill or N, pushes the page (the app's lane rule), closes on its x or Ctrl/Cmd+Enter. */
var app=$(".app"),laneEl=$("#lane");
function setLane(on){laneEl.hidden=!on;app.classList.toggle("lane-open",on);$("[data-gonotes]").setAttribute("aria-expanded",on);setTimeout(fades,200)}
$("[data-gonotes]").onclick=function(){setLane(laneEl.hidden)};
$("[data-lane-close]").onclick=function(){setLane(false)};
if(Q.get("lane")==="1")setLane(true);

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
 if(e.key==="Escape"){if(vp&&!vp.hidden){vpop(false);vc.focus();return}if($(".stp.open"))collapse();return}
 if(KEYS[k]){e.preventDefault();setTab(KEYS[k])}
 else if(k==="n"){e.preventDefault();setLane(laneEl.hidden)}
 else if(k==="s"&&$("[data-share]")){e.preventDefault();toast("Share panel opens in the right lane (not drawn here).")}
 else if(k==="e"||k===","){e.preventDefault();toast(k==="e"?"Editor opens in the right lane (not drawn here).":"History opens as its own page (not drawn here).")}
});

/* step photos: thumbnail; click expands the whole photo under the step, click or Esc returns */
function collapse(){$$(".stp.open").forEach(function(s){s.classList.remove("open")});fades()}
$$("[data-psp]").forEach(function(b){b.onclick=function(){var s=b.closest(".stp"),was=s.classList.contains("open");collapse();if(!was){s.classList.add("open");s.scrollIntoView({block:"nearest"});fades()}}});

var pm=$("[data-pmore]");
if(pm)pm.onclick=function(){var g=$("#pgrid"),h="",cs=["#c8a86b","#bfa98c","#d8c8c8","#ba976b","#a98f6a","#c9b48a"];for(var i=0;i<photosN;i++)h+='<div class="pfr" style="background-image:linear-gradient(150deg,'+cs[i%cs.length]+',color-mix(in srgb,'+cs[i%cs.length]+' 55%,#000))"><span class="pf">'+D.emoji+'</span></div>';g.innerHTML=h;fades()};

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
 +(D.groups?'<p class="dn">Groups are drawn, but the app drops <code>group</code> today. Needs the wire change.</p>':'')+'<p class="dn">Keys: 1 to 4 rail tabs, N Notes and reactions, S share, Esc closes a step photo. The wide layout needs 1280 x 700 or more; below that the page stacks and scrolls (the build keeps today’s page there).</p>';
$$("[data-th]",P).forEach(function(b){b.onclick=function(){setTheme(b.dataset.th)}});
B.onclick=function(){var o=P.hidden;P.hidden=!o;B.setAttribute("aria-expanded",o)};
document.addEventListener("keydown",function(e){if(e.key==="`")B.click()});
})();
