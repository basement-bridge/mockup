/* Option C: rail with in-place tabs. Sample data and rendering are mockup-only; class names are the build's (recipe.css / recipes-browse vocabulary). */
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
 plus:'<path d="M12 5v14M5 12h14"/>',timer:'<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2M9 2h6"/>',img:'<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="10" r="1.6"/><path d="M4 18l5-5 4 4 3-3 4 4"/>'
};
var ic=function(n,c){return '<svg class="ic '+(c||"")+'" viewBox="0 0 24 24" aria-hidden="true">'+I[n]+'</svg>'};

/* ---------------- sample data (shapes follow types.ts; invented values, see notes.md) ---------------- */
var VERS=[{id:"o",name:"Original",st:"kept"},{id:"p",name:"With peas",st:"kept",usual:true,review:true},{id:"l",name:"Less soy, more garlic",st:"trying"}];
var NOTES=[
 {on:"Original",by:"Sam",at:"12 Sep",inh:true,b:["Day-old rice really is better. Fresh rice goes mushy."]},
 {on:"With peas",by:"Jane",at:"20 Sep",b:["Kids like it with **frozen peas** thrown in at step 5."]},
 {on:"With peas",by:"Alex",at:"28 Sep",reworded:true,b:["Peas straight from frozen is fine, no need to thaw."]},
 {on:"Original",by:"Priya",at:"2 Oct",inh:true,b:["Things that go well on the side:"],li:["Cucumber in rice vinegar","A soft-boiled egg on top","Kimchi"]},
 {on:"With peas",by:"You",at:"14 Oct",b:["Doubled for 4 people in the big pan and had to fry the rice in two batches. Do not crowd the pan."]}
];
var COOKS=[
 {d:"9",m:"Oct",by:"Jane",v:"With peas",line:"used leftover rice",ate:3,ago:"2 days ago"},
 {d:"28",m:"Sep",by:"Sam",v:"Less soy, more garlic",line:"",verdict:"Kept it",ate:3},
 {d:"20",m:"Sep",by:"You",v:"Original",line:"too salty first time, halved the soy",verdict:"Needed work",ate:2},
 {d:"",m:"Earlier",by:"Sam",v:"Original",line:""}
];
var REACT={mine:"up",chips:[["J","up","m1"],["S","up","m2"],["You","up","m3"]],notKeen:1,fav:"Liked by 2 of 3. A household favourite."};
var DATA={
 typical:{name:"Egg fried rice",min:"20 min",serves:2,banner:"#ba976b",emoji:"\u{1F35A}",vers:VERS,ver:"p",planned:"Tue",pantryKnown:true,
  ing:[["Eggs",3,""],["Basmati rice, cooked and cooled",300,"g"],["Onion",1,""],["Spring onions",2,"","miss"],["Soy sauce",2,"tbsp"],["Oil",1,"tbsp"],["Frozen peas",80,"g"],["Garlic cloves",2,""],["Sesame oil",1,"tsp","miss","opt"],["Chilli flakes",null,"","","","amount?"]],
  steps:[["Beat the eggs with a pinch of salt.",0,"#bfa98c"],["Chop the onion and fry it in the oil until soft.",3,"#d8c8c8"],["Push the onion aside, pour in the eggs and stir until just set.",1,"prep"],["Tip in the cold rice and break up any lumps. Keep the heat high.",4,"#c9b48a"],["Splash in the soy sauce and add the peas.",2],["Toss through the spring onions and serve.",0]],
  notes:NOTES,cooks:COOKS,react:REACT,gallery:["#c8a86b","#bfa98c","#d8c8c8"],cookedPh:["#ba976b","#a98f6a","#c9b48a"],source:"Adapted from a recipe card, Sam, 2024",share:2},
 short:{name:"Garlic toast eggs",min:"10 min",serves:2,banner:"#c8a86b",emoji:"\u{1F373}",vers:[{id:"o",name:"Original",st:"kept",usual:true}],ver:"o",pantryKnown:true,
  ing:[["Eggs",4,""],["Sourdough",4,"slices"]],
  steps:[["Toast the bread and rub it with a cut garlic clove.",3,"#bfa98c"],["Fry the eggs in butter until the whites are set; lay on the toast.",4,"#d8c8c8"]],
  notes:[],cooks:[],react:{mine:null,chips:[],notKeen:0},gallery:["#c8a86b","#bfa98c"],cookedPh:[],source:"",share:null},
 long:{name:"Slow lamb shoulder with white beans and salsa verde",min:"4 h 30",serves:8,banner:"#8a6a4a",emoji:"\u{1F356}",vers:[{id:"o",name:"Original",st:"kept",usual:true}],ver:"o",pantryKnown:true,groups:true,
  ing:[["Lamb shoulder, bone in",2.2,"kg",0,0,0,"Lamb"],["Garlic cloves",8,""],["Rosemary sprigs",4,""],["Anchovy fillets",6,"","","opt"],["Olive oil",3,"tbsp"],["Salt",2,"tsp"],["Black pepper",1,"tsp"],["White wine",250,"ml"],
   ["Cannellini beans",3,"tins","miss",0,0,"Beans"],["Onion, finely sliced",2,""],["Celery sticks",2,"","miss"],["Carrot",2,""],["Tomato paste",2,"tbsp"],["Chicken stock",500,"ml"],["Bay leaves",2,""],["Lemon, zest of",1,""],["Chilli flakes",null,"","","","amount?"],
   ["Flat-leaf parsley, large bunch",1,"","miss",0,0,"Salsa verde"],["Mint leaves",20,"g","miss"],["Capers",2,"tbsp"],["Garlic cloves",1,""],["Red wine vinegar",2,"tbsp","miss"],["Olive oil",120,"ml"],["Sea salt",1,"pinch"]],
  steps:[["Heat the oven to 160C.",5,0,"Lamb"],["Pound the garlic, rosemary and anchovies to a rough paste with the oil.",0],["Score the lamb and rub the paste in; season well.",0],["Brown the lamb on all sides in a heavy pot.",15,"#a98a66"],["Deglaze with the wine and let it bubble down by half.",5],["Cover tightly and roast.",180],
   ["Meanwhile soften onion, celery and carrot in a pan.",12,0,"Beans"],["Add paste, stock, bay and beans; simmer.",20],["Lift the lamb out, rest it under foil.",20,"#9a7c5a"],["Tip the beans into the pot and return to the oven, lid off.",30],
   ["Chop herbs, capers and garlic together.",8,0,"Salsa verde"],["Stir in vinegar and oil; season with the salt.",0],["Pull the lamb into large pieces over the beans.",5,"#b08f68",""],["Spoon salsa verde over and serve with lemon wedges.",0]],
  notes:[NOTES[0],{on:"Original",by:"You",at:"3 Oct",b:["Rest it a full 20 minutes or it shreds badly."]}],
  cooks:[{d:"11",m:"Oct",by:"Sam",v:"Original",line:"fell off the bone",verdict:"Kept it",ate:8,ago:"6 days ago"},{d:"6",m:"Sep",by:"You",v:"Original",line:"",verdict:"Kept it",ate:6}],
  react:{mine:"up",chips:[["S","up","m2"],["You","up","m3"]],notKeen:0,fav:"Liked by 2 of 3."},gallery:["#8a6a4a","#a98a66","#9a7c5a"],cookedPh:["#8a6a4a"],source:"Slow Sundays, a family recipe",share:1}
};
var key=(R==="short"||R==="long")?R:"typical";
var D=JSON.parse(JSON.stringify(DATA[key]));
if(R==="nocooked"){D.cooks=[];D.notes=[];D.react={mine:null,chips:[],notKeen:0};D.cookedPh=[];D.planned=null}
D.banner=D.banner||null;
var tab=Q.get("tab")||(R==="notes"?"notes":R==="cooked"?"cooked":"ing");
var servesNow=D.serves,openStep=-1;

/* ---------------- render ---------------- */
var cookedN=D.cooks.length,notesN=D.notes.length,photosN=D.gallery.length+D.cookedPh.length;
var missing=D.ing.filter(function(x){return x[3]==="miss"}).length;
var tabs=[["ing","Ingredients",0,"1"],["notes","Notes",notesN,"2",1],["cooked","Cooked",cookedN,"3"],["pho","Photos",photosN,"4"]].filter(function(t){
 if(t[0]==="cooked"&&!cookedN)return false; /* empty is absent: "Not cooked yet." has no action */
 if(t[0]==="pho"&&!photosN)return false; return true});
if(!tabs.some(function(t){return t[0]===tab}))tab="ing";
var cur=D.vers.filter(function(v){return v.id===D.ver})[0];
var lastCook=D.cooks[0]&&D.cooks[0].ago;

function chips(){return D.react.chips.map(function(c){return '<span class="rb-rc"><span class="rb-av '+c[2]+'">'+esc(c[0].charAt(0))+'</span><span class="rb-th '+c[1]+'">'+ic(c[1]==="up"?"up":"dn")+'</span></span>'}).join("")+(D.react.notKeen?'<span class="rb-rc"><span class="rb-th no">'+ic("dn")+'</span><small>'+D.react.notKeen+' other</small></span>':"")}

function ingPane(){
 var h='<div class="lblrow"><span class="lbl">Ingredients <span class="sub">'+(D.pantryKnown?(missing?(D.ing.length-missing)+' of '+D.ing.length+' in':'all in'):'')+'</span></span><span class="row-a">'+(D.planned?'<button type="button" class="mini" data-hold>Hold for '+D.planned+'</button>':'')+'<a class="mini ico" href="#" aria-label="Edit ingredients" data-key="e">'+ic("pen")+'</a></span></div><div class="scroll" data-scroll><div class="ings">';
 var g="";
 D.ing.forEach(function(x,i){
  if(x[6]&&D.groups){h+='<h3 class="grp">'+esc(x[6])+'</h3>'}
  var miss=x[3]==="miss";
  h+='<div class="ing'+(miss?' miss':'')+'">'+(D.pantryKnown?'<span class="dot'+(miss?' no':'')+'" title="'+(miss?'Not in the pantry':'In the pantry')+'"></span>':'')
   +'<span class="nm">'+esc(x[0].replace(/,.*/,""))+(x[0].indexOf(",")>0?'<small>'+esc(x[0].replace(/^[^,]*/,""))+'</small>':"")+(x[4]?' <small>(optional)</small>':"")+'</span>'
   +(miss?'<button type="button" class="cart" data-cart aria-label="Add '+esc(x[0])+' to shopping">'+ic("cart")+'</button>':"")
   +(x[1]===null?'<span class="q unk">amount?</span>':'<span class="q" data-a="'+x[1]+'" data-u="'+esc(x[2])+'"></span>')+'</div>';
 });
 h+='</div></div>';
 if(missing){h+='<div class="pfoot">'+(missing>1?'<button type="button" class="mini wide" data-cartall>'+ic("cart")+' Add all '+missing+' missing to shopping</button>':'')+'<span class="hint">Talk to your assistant about substitutes</span></div>'}
 return h}

function notesPane(){
 var h='<div class="lblrow"><span class="lbl">Notes <span class="sub">'+(notesN?'on '+esc(cur.name):'')+'</span></span><span class="row-a"><a class="mini ico" href="#" aria-label="Edit notes">'+ic("pen")+'</a></span></div>';
 if(D.react.chips.length||D.react.notKeen)h+='<div class="rb-react rrow">'+chips()+'</div>';
 h+='<div class="scroll" data-scroll>';
 if(!notesN)h+='<div class="rb-empty"><span>'+ic("note")+'</span><div><b>No notes yet.</b><small>'+(cookedN?'Anything worth remembering next time.':'Cook it once and the thumbs and notes start here.')+'</small></div></div>';
 D.notes.forEach(function(n){
  h+='<div class="note'+(n.inh?' inh':'')+'">'+n.b.map(function(p){return '<p>'+md(p)+'</p>'}).join("")+(n.li?'<ul>'+n.li.map(function(l){return '<li>'+esc(l)+'</li>'}).join("")+'</ul>':"")
   +'<small>'+esc(n.by)+', '+esc(n.at)+(n.inh?'<span class="from" title="from the parent version">'+ic("branch")+' from '+esc(n.on)+'</span>':n.reworded?'<span class="from">changed in this version</span>':'')+'</small></div>'});
 h+='</div><div class="pfoot"><button type="button" class="rb-btn" data-note>'+ic("plus")+' Add a note</button></div>';
 return h}

function cookedPane(){
 var h='<div class="lblrow"><span class="lbl">Cooked <span class="sub">'+cookedN+(cookedN>=40?"+":"")+' time'+(cookedN>1?'s':'')+'</span></span></div>';
 if(D.react.fav)h+='<p class="fav">'+esc(D.react.fav)+'</p>';
 h+='<div class="scroll" data-scroll>';
 D.cooks.forEach(function(c){h+='<div class="hist"><div class="d">'+(c.d?'<b>'+c.d+'</b>':'')+c.m+'</div><div class="t"><b>'+esc(c.by)+'</b> cooked '+esc(c.v)+(c.line?'<small>“'+esc(c.line)+'”</small>':'')+((c.verdict||c.ate)?'<small>'+(c.verdict?'<em class="vd">'+c.verdict+'</em>':'')+(c.verdict&&c.ate?' . ':'')+(c.ate?c.ate+' ate':'')+'</small>':'')+'</div></div>'});
 return h+'</div>'}

function phoPane(){
 return '<div class="lblrow"><span class="lbl">Photos <span class="sub">'+photosN+'</span></span></div><div class="scroll" data-scroll><div id="pgrid" class="pgrid"><button type="button" class="pmore" data-pmore>Show '+photosN+' photos <small>(loads on tap)</small></button></div></div>'}

function stepsHtml(){
 var h="";
 D.steps.forEach(function(s,i){
  var gr=s[3];
  if(gr&&D.groups)h+='<h3 class="grp">'+esc(gr)+'</h3>';
  var ph=s[2];
  h+='<div class="stp" data-i="'+i+'"><span class="nb">'+(i+1)+'</span><div class="sb"><p>'+esc(s[0])+'</p>'+(s[1]?'<span class="timer">'+ic("timer")+s[1]+' min</span>':'')+'</div>'
   +(ph&&ph!=="prep"?'<button type="button" class="psp" data-psp style="--pc:'+ph+'" aria-label="Show the photo for step '+(i+1)+'"><span class="pf in">'+D.emoji+'</span></button>':'')
   +(ph==="prep"?'<span class="psp pprep" title="Photo is being prepared">Photo being prepared</span>':'')+'</div>'});
 return h}

var top=''
+'<header class="top">'
+'<a class="back" href="#" data-key="alt-left"><span class="ib bare">'+ic("back")+'</span><span class="bl">Recipes</span></a>'
+(D.banner?'<button type="button" class="thumb" data-gopho style="--pc:'+D.banner+'" aria-label="See photos"><span class="pf in">'+D.emoji+'</span></button>':'')
+'<h1 data-vt="title" title="'+esc(D.name)+'">'+esc(D.name)+'</h1>'
+'<div class="tools">'
+'<button type="button" class="rb-notesbtn re-a rb-d" data-gonotes title="Notes and reactions (N)">'+ic("note")+'<span class="lbl2">Notes and reactions</span><i class="rb-pillcnt"><i class="u">'+ic("up")+D.react.chips.length+'</i>'+(D.react.notKeen?'<i class="d">'+ic("dn")+D.react.notKeen+'</i>':'')+'<i>'+ic("note")+notesN+'</i></i><span class="kbd">N</span></button>'
+'<button type="button" class="ib bare" data-star aria-pressed="'+(D.react.mine==="up")+'" aria-label="Like this version">'+ic("star")+'</button>'
+'<a class="ib bare" href="#" data-key="e" aria-label="Edit (E)">'+ic("edit")+'</a>'
+(D.share!==null?'<button type="button" class="shr-chip" data-share>'+ic("share")+'Share'+(D.share?'<span class="shr-n">'+D.share+'</span>':'')+'<span class="kbd">S</span></button>':'')
+'<button type="button" class="ib bare" data-more aria-label="More">'+ic("more")+'</button>'
+'</div></header>';

var bandL='<div class="bandL"><span class="mc ro">'+ic("clock","s")+D.min+'</span><div class="serves" data-serves><button type="button" data-dec aria-label="Fewer servings">−</button><span data-sv>Serves '+servesNow+'</span><button type="button" data-inc aria-label="More servings">+</button></div></div>';
var vs=D.vers.length>1?'<div class="vstrip" role="group" aria-label="Versions">'+D.vers.map(function(v){return '<button type="button" class="vb'+(v.id===D.ver?' on':'')+(v.st==="trying"?' try':'')+'" title="'+esc(v.name)+(v.st==="trying"?' (trying)':'')+'">'+(v.usual?'<span class="us" title="Our usual">★</span>':'')+(v.review?'<span class="rvd" title="Has a change to review"></span>':'')+esc(v.name)+'</button>'}).join("")+'</div>':'<span class="pill ver">'+esc(cur.name)+(cur.usual?' . Our usual':'')+'</span>';
var proof=cookedN?'<button type="button" class="proof" data-gocooked title="Cooked '+cookedN+' time'+(cookedN>1?'s':'')+(lastCook?', last '+lastCook:'')+' (3)">Cooked <b>'+cookedN+'\u00D7</b>'+(lastCook?'<small class="lc">'+lastCook+'</small>':'')+'<span class="rb-dots mini">'+D.cooks.slice(0,8).reverse().map(function(c,i,a){return '<i class="'+(i===a.length-1?'last':'')+'"></i>'}).join("")+'</span></button>':'<span class="proof none" title="Cook it once and the thumbs and notes start here.">Not cooked yet</span>';
var bandR='<div class="bandR">'+vs+'<a class="hl" href="#" data-key=",">'+ic("hist")+'History<span class="kbd">,</span></a>'+proof+'<span class="sp"></span><button type="button" class="rb-btn" data-plan>'+ic("plan")+(D.planned?'<span class="lw">Planned </span>'+D.planned:'Plan it')+'</button><a class="rb-btn pri" href="#" data-cook>'+ic("cook")+'Cook it</a></div>';

var railT='<div class="tabs" role="tablist" aria-label="Recipe extras">'+tabs.map(function(t){
 return '<button type="button" role="tab" id="tab-'+t[0]+'" aria-controls="p-'+t[0]+'" data-tab="'+t[0]+'" aria-selected="'+(t[0]===tab)+'" tabindex="'+(t[0]===tab?0:-1)+'" title="'+t[1]+' ('+t[3]+')">'+t[1]+(t[2]?'<b class="bdg'+(t[0]==="ing"?' acc':'')+'">'+t[2]+'</b>':'')+'</button>'}).join("")+'</div>';
var panes={ing:ingPane,notes:notesPane,cooked:cookedPane,pho:phoPane};
var rail='<aside class="rail" aria-label="Ingredients, notes, cooked, photos">'+railT+tabs.map(function(t){return '<section class="pane" role="tabpanel" id="p-'+t[0]+'" aria-labelledby="tab-'+t[0]+'"'+(t[0]===tab?'':' hidden')+' data-pane="'+t[0]+'">'+panes[t[0]]()+'</section>'}).join("")+'</aside>';
var method='<main class="meth" id="met"><div class="lblrow"><span class="lbl">Method <span class="sub">'+D.steps.length+' steps</span></span><span class="row-a"><a class="mini ico" href="#" aria-label="Edit method">'+ic("pen")+'</a></span></div><div class="scroll" data-scroll>'+stepsHtml()+(D.source?'<p class="src">'+esc(D.source)+'</p>':'')+'</div></main>';

$("#rtab").innerHTML=top+bandL+bandR+rail+method;
$("#rtab").dataset.size=key;$("#rtab").dataset.tab=tab;$("#rtab").dataset.r=R;
document.title="Recipe detail, desktop option C ("+R+")";

/* ---------------- behaviour ---------------- */
function fmt(v){var r=Math.round(v*100)/100;return String(r)}
function scale(){$$("[data-a]").forEach(function(e){var v=parseFloat(e.dataset.a)*servesNow/D.serves;e.textContent=fmt(v)+(e.dataset.u?" "+e.dataset.u:"")});$("[data-sv]").textContent="Serves "+servesNow;var c=$("[data-cook]");c.setAttribute("href","#cook?n="+servesNow)}
scale();
$("[data-dec]").onclick=function(){if(servesNow>1){servesNow--;scale()}};
$("[data-inc]").onclick=function(){if(servesNow<12){servesNow++;scale()}};

function setTab(t,focus){
 if(!tabs.some(function(x){return x[0]===t}))return;
 tab=t;$("#rtab").dataset.tab=t;
 $$("[role=tab]").forEach(function(b){var on=b.dataset.tab===t;b.setAttribute("aria-selected",on);b.tabIndex=on?0:-1;if(on&&focus)b.focus()});
 $$("[role=tabpanel]").forEach(function(p){p.hidden=p.dataset.pane!==t});
 fades();
 try{var u=new URL(location.href);u.searchParams.set("tab",t);history.replaceState(null,"",u)}catch(e){}
}
$$("[role=tab]").forEach(function(b){b.onclick=function(){setTab(b.dataset.tab)};
 b.onkeydown=function(e){var ids=tabs.map(function(t){return t[0]}),i=ids.indexOf(b.dataset.tab);
  if(e.key==="ArrowRight"||e.key==="ArrowLeft"){e.preventDefault();setTab(ids[(i+(e.key==="ArrowRight"?1:ids.length-1))%ids.length],true)}}});
var go=function(sel,t){var e=$(sel);if(e)e.onclick=function(){setTab(t,true)}};
go("[data-gonotes]","notes");go("[data-gocooked]","cooked");go("[data-gopho]","pho");

/* keys: digits switch rail tabs; N = Notes (as today's flyout key); S Share (existing). Ignored in fields and with modifiers. */
var KEYS={"1":"ing","2":"notes","3":"cooked","4":"pho",n:"notes"};
document.addEventListener("keydown",function(e){
 if(e.ctrlKey||e.metaKey||e.altKey)return;var t=e.target;if(t&&/INPUT|TEXTAREA|SELECT/.test(t.tagName))return;
 if(e.key==="Escape"&&openStep>=0){collapse();return}
 var k=KEYS[e.key.toLowerCase()];if(k){e.preventDefault();setTab(k)}
 else if(e.key.toLowerCase()==="s"&&$("[data-share]")){e.preventDefault();toast("Share panel opens in the right lane (not drawn here).")}
});

/* step photos: thumbnail, click expands the whole photo in place, click or Esc returns */
function collapse(){$$(".stp.open").forEach(function(s){s.classList.remove("open")});openStep=-1;fades()}
$$("[data-psp]").forEach(function(b){b.onclick=function(){var s=b.closest(".stp"),was=s.classList.contains("open");collapse();if(!was){s.classList.add("open");openStep=+s.dataset.i;s.scrollIntoView({block:"nearest"});fades()}}});

/* photos tab: grid fetched on tap (mock: drawn on tap) */
var pm=$("[data-pmore]");
if(pm)pm.onclick=function(){var g=$("#pgrid"),h="";(D.banner?[D.banner]:[]).concat(D.gallery,D.cookedPh).forEach(function(c,i){h+='<div class="pfr'+(i===0&&D.banner?' ban':'')+'" style="--pc:'+c+'"><span class="pf in">'+D.emoji+'</span>'+(i===0&&D.banner?'<small>Banner</small>':'')+'</div>'});g.innerHTML=h;fades()};

function toast(m){var t=$("#toast");t.textContent=m;t.hidden=false;clearTimeout(toast.t);toast.t=setTimeout(function(){t.hidden=true},2600)}
$("[data-plan]").onclick=function(){toast(D.planned?"On the plan for "+D.planned+". Change it in Plan.":"Day picker opens in the right lane (not drawn here).")};
$("[data-star]").onclick=function(e){var b=e.currentTarget;b.setAttribute("aria-pressed",b.getAttribute("aria-pressed")!=="true")};
$$("[data-cart]").forEach(function(b){b.onclick=function(){b.disabled=true;b.classList.add("done");toast("Added to the shopping list.")}});
var ca=$("[data-cartall]");if(ca)ca.onclick=function(){$$("[data-cart]").forEach(function(b){b.disabled=true;b.classList.add("done")});toast("Added "+missing+" to the shopping list.")};
var hd=$("[data-hold]");if(hd)hd.onclick=function(){$$(".dot").forEach(function(d){d.className="dot held"});hd.textContent="Held for "+D.planned;toast("Held for "+D.planned+".")};
$$("[data-note],[data-more],[data-share]").forEach(function(b){if(b.hasAttribute("data-share")||b.hasAttribute("data-more")||b.hasAttribute("data-note"))b.addEventListener("click",function(){toast(b.hasAttribute("data-note")?"Note sheet opens (not drawn here).":b.hasAttribute("data-more")?"More menu opens as a sheet (not drawn here).":"Share panel opens in the right lane (not drawn here).")})});
$$("a[href='#'],a[href^='#cook']").forEach(function(a){a.addEventListener("click",function(e){e.preventDefault()})});

/* edge fades show where an inner pane still has more to scroll */
function fades(){$$("[data-scroll]").forEach(function(s){var more=s.scrollHeight-s.clientHeight>1;s.dataset.more=more?(s.scrollTop+s.clientHeight<s.scrollHeight-2?"down":"end"):"none"})}
$$("[data-scroll]").forEach(function(s){s.addEventListener("scroll",fades)});
addEventListener("resize",fades);fades();if(document.fonts&&document.fonts.ready)document.fonts.ready.then(fades);

/* ---------------- demo switcher (mockup only) ---------------- */
var P=$("#demoP"),B=$("#demoB");
function link(ch){var u=new URL(location.href);Object.keys(ch).forEach(function(k){if(ch[k]===null)u.searchParams.delete(k);else u.searchParams.set(k,ch[k])});return u.pathname+u.search}
var th=document.documentElement.getAttribute("data-theme")==="kitchie-day"?"light":"dark";
function setTheme(v){try{localStorage.setItem("theme",v==="light"?"kitchie-day":"kitchie")}catch(e){}document.documentElement.setAttribute("data-theme",v==="light"?"kitchie-day":"kitchie");var u=new URL(location.href);u.searchParams.set("theme",v);history.replaceState(null,"",u)}
var qt=Q.get("theme");if(qt==="light"||qt==="dark"){setTheme(qt);th=qt}
var rs=[["typical","Typical"],["short","Short"],["long","Long"],["notes","Notes"],["cooked","Cooked"],["nocooked","Not cooked"]];
P.innerHTML='<h3>State</h3><div class="dc">'+rs.map(function(r){return '<a href="'+link({r:r[0],tab:null})+'"'+(R===r[0]?' aria-current="true"':'')+'>'+r[1]+'</a>'}).join("")+'</div><h3>Theme</h3><div class="dc"><button type="button" data-th="dark">Dark</button><button type="button" data-th="light">Light</button></div>'
 +(D.groups?'<p class="dn">Groups are drawn, but the app drops <code>group</code> today. Needs the wire change.</p>':'')+'<p class="dn">Keys: 1 to 4 switch the rail, N notes, S share. Press Esc to close a step photo.</p>';
$$("[data-th]",P).forEach(function(b){b.onclick=function(){setTheme(b.dataset.th)}});
B.onclick=function(){var o=P.hidden;P.hidden=!o;B.setAttribute("aria-expanded",o)};
document.addEventListener("keydown",function(e){if(e.key==="`")B.click()});
})();
