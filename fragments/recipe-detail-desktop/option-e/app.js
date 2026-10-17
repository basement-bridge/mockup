/* Option E render. Mockup-only: draws the page from window.RECIPES with the build's class names (.rtab, .meta, .serves, .ing, .stp, .note, .hist, .jumps, .rb-*, .rfly).
   ?r=short|typical|long|notes|cooked|nocooked   ?theme=kitchie|kitchie-day   ?lane=0|1 forces the notes lane. */
(function(){
var q=new URLSearchParams(location.search),key=q.get("r")||"typical",D=window.RECIPES[key]||window.RECIPES.typical;
var P={back:"M15 5l-7 7 7 7",star:"M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.9-5.2-2.8-5.2 2.8 1-5.9-4.3-4.1 5.9-.8z",pen:"M4 20l4-1 11-11-3-3L5 16zM14 6l3 3",share:"M4 13v6h16v-6M12 4v11M8 8l4-4 4 4",dots:"M5 12h.01M12 12h.01M19 12h.01",clock:"M12 7v5l3 2M12 3a9 9 0 100 18 9 9 0 000-18z",cal:"M5 6h14v14H5zM5 10h14M9 3v4M15 3v4",pot:"M5 11h14v6a3 3 0 01-3 3H8a3 3 0 01-3-3zM3 11h18M9 4c0 2 2 2 2 4M14 4c0 2 2 2 2 4",up:"M7 11v9H4v-9zM7 11l4-8c2 0 3 1 3 3l-.5 4H19a1.5 1.5 0 011.5 1.8l-1.3 6A2 2 0 0117.2 20H7",dn:"M7 13V4H4v9zM7 13l4 8c2 0 3-1 3-3l-.5-4H19a1.5 1.5 0 001.5-1.8l-1.3-6A2 2 0 0017.2 4H7",note:"M6 3h9l4 4v14H6zM9 12h7M9 16h7",cart:"M4 5h2l2 10h9l2-7H7",br:"M7 4v10a3 3 0 003 3h4M17 8a3 3 0 100-6 3 3 0 000 6z",x:"M6 6l12 12M18 6L6 18"};
var ic=function(n,c){return '<svg class="'+(c||"")+'" viewBox="0 0 24 24" aria-hidden="true"><path d="'+P[n]+'"/></svg>'};
var esc=function(s){return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;")};
var n=+q.get("n")||D.serves,fr={.25:"¼",.5:"½",.75:"¾"};
var fmt=function(a){if(a==null)return"";var v=a*n/D.serves;if(v>=10)v=Math.round(v);else v=Math.round(v*4)/4>=1&&v%1?Math.round(v*4)/4:Math.round(v*10)/10;var w=Math.floor(v),f=v-w;return (w?w:"")+(fr[f]||(f?String(f).slice(1):""))||String(v)};
var ni=D.ing.length,ns=D.steps.length;
var dens=(ni>16||ns>10)?"tight":(ni<=5&&ns<=4)?"roomy":"normal";
var vers=D.versions,cooks=D.cooks,tabs=[["rec","Recipe"]];
if(cooks.length)tabs.push(["his","Cooked",cooks.length]);
if(D.gallery)tabs.push(["pho","Photos",D.gallery]);
var tab=key==="cooked"?"his":(q.get("tab")||"rec");
var miss=D.ing.filter(function(i){return i.p==="out"}).length,known=D.ing.some(function(i){return i.p});
var upN=D.react.up.length,notesN=D.notes.length+cooks.filter(function(c){return c.line}).length;

/* thumbnail: the recipe photo, else the first step photo, else a plain tile */
var firstStep=D.steps.filter(function(s){return s.ph&&s.ph!=="prep"})[0];
var thumb=D.photo==="own"?'<span class="pf" style="background:linear-gradient(150deg,'+D.colour+',color-mix(in srgb,'+D.colour+' 55%,#000))"><span class="e">'+D.e+'</span></span>':
 firstStep?'<span class="pf" style="background:'+firstStep.ph.c+'"><span class="e">'+firstStep.ph.e+'</span></span><span class="pinh" title="Step photo until this recipe has its own">'+ic("br")+'</span>':
 '<span class="pf stock"><span class="e">'+D.e+'</span></span>';

var hero='<header class="rhero">'+
'<a class="ib bare back" href="#" aria-label="Back to Recipes">'+ic("back")+'</a>'+
'<div class="hb" title="Open the photo">'+thumb+'</div>'+
'<div class="hmain"><div class="hrow h1row"><h1 data-vt="title" title="'+esc(D.name)+'">'+esc(D.name)+'</h1>'+
 '<div class="hact"><button class="ib bare" data-star aria-pressed="'+(D.react.mine?"true":"false")+'" aria-label="Star: I like this version">'+ic("star")+'</button>'+
 '<a class="ib bare" data-key="e" href="#" aria-label="Edit (E)">'+ic("pen")+'</a>'+
 (D.share===null&&key==="x"?"":'<button class="shr-chip" data-share>'+ic("share")+'Share'+(D.share?'<i class="shr-n">'+D.share+'</i>':"")+'<span class="kbd">S</span></button>')+
 '<button class="ib bare" data-more aria-label="More">'+ic("dots")+'</button>'+
 '<button class="rb-notesbtn re-a rb-d" data-notes aria-label="Notes and reactions">'+ic("note")+'<span class="nb-t">Notes and reactions</span><i class="rb-pillcnt"><i class="u">'+ic("up")+upN+'</i>'+(D.react.down?'<i class="d">'+ic("dn")+D.react.down+'</i>':"")+'<i>'+ic("note")+notesN+'</i></i><span class="kbd">N</span></button></div></div>'+
 '<div class="hrow h2row"><div class="meta"><span class="mc ro">'+ic("clock")+(D.min>=60?Math.floor(D.min/60)+" h "+(D.min%60?D.min%60+" min":""):D.min+" min")+'</span>'+
 '<form class="serves" onsubmit="return false"><button type="button" data-st="-1" aria-label="Fewer servings">−</button><span data-n="'+n+'">Serves '+n+'</span><button type="button" data-st="1" aria-label="More servings">+</button></form></div>'+
 '<a class="vline" data-key="," href="#">'+(vers.length>1&&vers[D.cur].usual?'<span class="fp">From Original \u00B7 </span>':"")+'<u>History</u><span class="kbd">,</span></a>'+
 (cooks.length?'<div class="proof"><b>Cooked '+(cooks.length>=4?cooks.length+" times":cooks.length===1?"once":cooks.length+" times")+'</b><span class="mut">last '+(cooks[0].ago||"cooked")+'</span><span class="rb-dots">'+cooks.slice(0,8).reverse().map(function(c,i,a){return '<i class="'+(i===a.length-1?"last":"")+'"></i>'}).join("")+'</span>'+
  (upN?'<span class="rb-th up" title="'+upN+' liked it">'+ic("up")+'<i>'+upN+'</i></span>':"")+(D.react.down?'<span class="rb-th dn" title="'+D.react.down+' not keen">'+ic("dn")+'<i>'+D.react.down+'</i></span>':"")+'</div>'
  :'<div class="proof none"><b>Not cooked yet</b><span class="mut">Cook it once and the thumbs and notes start here.</span></div>')+
 '<div class="hgo"><button class="btn ghost sm" data-plan>'+ic("cal")+(D.planned?"Planned "+D.planned:"Plan it")+'</button><a class="btn sm" href="#" data-cook>'+ic("pot")+'Make it</a></div></div></div></header>';

var vbar=(tabs.length>1||vers.length>1)?'<nav class="jumps vbar" aria-label="Views">'+
 (tabs.length>1?'<div class="tabs" role="tablist">'+tabs.map(function(t){return '<a href="#'+t[0]+'" role="tab" data-tab="'+t[0]+'"'+(t[0]===tab?' class="on" aria-selected="true"':"")+'>'+t[1]+(t[2]?'<small>'+t[2]+'</small>':"")+'</a>'}).join("")+'</div>':"")+
 (vers.length>1?'<div class="vstrip" role="group" aria-label="Versions">'+vers.map(function(v,i){return '<button type="button" class="vp'+(i===D.cur?" on":"")+'">'+(v.usual?'<b>★</b>':"")+esc(v.n)+(v.state==="trying"?'<em>Trying</em>':"")+(v.review?'<i class="rv" title="Has a change to review"></i>':"")+'</button>'}).join("")+'<a class="slim" href="#">To review · '+vers[D.cur].review+'</a></div>':"")+'</nav>':"";

var ingRows=function(){var out="",g=null;D.ing.forEach(function(i){if(i.g&&i.g!==g){g=i.g;out+='<h3 class="grp">'+esc(g)+'</h3>'}
 out+='<div class="ing'+(i.p==="out"?" miss":"")+'">'+(known?'<span class="dot'+(i.p==="out"?" no":"")+'" title="'+(i.p==="out"?"Not in":"In")+'"></span>':"")+'<span class="nm">'+esc(i.n)+(i.prep?', <span class="prep">'+esc(i.prep)+'</span>':"")+(i.opt?' <span class="prep">(optional)</span>':"")+'</span>'+(i.p==="out"?'<button class="cart" data-cart aria-label="Add '+esc(i.n)+' to shopping">'+ic("cart")+'</button>':"")+
  (i.unk?'<span class="q unk">amount?</span>':'<span class="q">'+fmt(i.a)+(i.u?" "+i.u:"")+'</span>')+'</div>'});return out};
var ing='<section id="ing" class="sec ingsec"><div class="lblrow"><h2 class="lbl">Ingredients'+(known?'<small>'+(D.ing.length-miss)+' of '+D.ing.length+' in</small>':"")+'</h2>'+(D.planned?'<button class="mini" data-holdall>Hold</button>':"")+'<a class="mini ico" href="#" data-key="e" aria-label="Edit ingredients">'+ic("pen")+'</a></div><div class="inglist">'+ingRows()+'</div>'+(miss>1?'<button class="mini cartall" data-cartall>'+ic("cart")+'Add all '+miss+' missing to shopping</button>':"")+'</section>';

var noteCard=function(x){return '<div class="note'+(x.inh?" inh":"")+'"><div class="nt">'+x.b.map(function(t){return '<p>'+esc(t)+'</p>'}).join("")+(x.li?'<ul>'+x.li.map(function(l){return '<li>'+esc(l)+'</li>'}).join("")+'</ul>':"")+'</div><small>'+esc(x.by)+' · '+x.at+(x.inh?'<span class="from">'+ic("br")+'from '+esc(x.w)+'</span>':"")+(x.rew?'<span class="from">changed in this version</span>':"")+'</small></div>'};
var notes;
if(!D.notes.length)notes='<section id="not" class="sec notesec empty"><button class="mini wide" data-note>'+ic("note")+'Add a note</button></section>';
else if(dens==="tight")notes='<section id="not" class="sec notesec sum"><button class="notesum" data-notes><span class="lbl">Notes <small>'+D.notes.length+'</small></span><span class="ns">'+esc(D.notes[D.notes.length-1].by)+': '+esc(D.notes[D.notes.length-1].b[0])+'</span></button></section>';
else notes='<section id="not" class="sec notesec"><div class="lblrow"><h2 class="lbl">Notes<small>'+D.notes.length+'</small></h2><button class="mini" data-note>Add a note</button></div><div class="nlist">'+D.notes.slice().reverse().map(noteCard).join("")+'</div></section>';

var sg=null,stp='';D.steps.forEach(function(s,i){if(s.g&&s.g!==sg){sg=s.g;stp+='<h3 class="grp">'+esc(sg)+'</h3>'}
 stp+='<div class="stp"><span class="nb">'+(i+1)+'</span><div class="st"><p>'+esc(s.t)+(s.m?' <span class="timer">'+(s.m>=60?s.m/60+" h":s.m+" min")+'</span>':"")+'</p></div>'+
 (s.ph==="prep"?'<span class="psp prep" title="Photo is being prepared"></span>':s.ph?'<button class="psp" type="button" aria-label="Show photo for step '+(i+1)+'" style="background:'+s.ph.c+'"><span class="e">'+s.ph.e+'</span></button>':"")+'</div>'});
var met='<section id="met" class="sec metsec"><div class="lblrow"><h2 class="lbl">Method<small>'+ns+' steps</small></h2><a class="mini ico" href="#" data-key="e" aria-label="Edit method">'+ic("pen")+'</a></div><div class="stps">'+stp+'</div></section>';

var cookedView='<section id="his" class="sec viewsec"><div class="lblrow"><h2 class="lbl">Cooked</h2></div>'+(D.react.of?'<p class="liked">Liked by '+D.react.up.length+' of '+D.react.of+(D.react.fav?" · a household favourite":"")+'</p>':"")+'<div class="histgrid">'+cooks.map(function(c){return '<div class="hist"><span class="d"><b>'+(c.d||"–")+'</b>'+c.mo+'</span><span class="t">'+esc(c.by)+' cooked '+esc(c.v)+(c.line?'<small>“'+esc(c.line)+'”</small>':"")+'</span>'+(c.verdict?'<span class="tg">'+c.verdict+'</span>':"")+(c.ate?'<small class="ate">'+c.ate+' ate</small>':"")+'</div>'}).join("")+'</div></section>';
var photosView='<section id="pho" class="sec viewsec"><div class="lblrow"><h2 class="lbl">Photos</h2></div><button class="mini pmore" data-pmore>Show '+D.gallery+' photos (loads on tap)</button><div class="pgrid" id="pgrid" hidden>'+Array.apply(null,Array(D.gallery)).map(function(_,i){return '<span class="pf" style="background:color-mix(in srgb,'+D.colour+' '+(90-i*14)+'%,var(--surface))"><span class="e">'+D.e+'</span></span>'}).join("")+'</div></section>';

var bodyFor=function(t){return t==="his"?'<div class="rbody single">'+cookedView+'</div>':t==="pho"?'<div class="rbody single">'+photosView+'</div>':
 '<div class="rbody"><div class="rl">'+ing+notes+(D.source?'<p class="src">'+esc(D.source)+'</p>':"")+'</div><div class="rm" data-steps="'+(ns<=3?"few":"many")+'">'+met+'</div></div>'};var body=bodyFor(tab);

/* Notes and reactions lane (right). Same content as today's flyout: thumbs per member, cook remarks newest first, then version notes. */
var lane='<aside class="rfly rfly-notes" aria-label="Notes and reactions" hidden><header class="rfh"><h2>Notes and reactions</h2><button class="x" data-lane-close aria-label="Close">'+ic("x")+'</button></header><div class="rfb">'+
 (D.react.of?'<div class="rb-react">'+D.react.up.map(function(m){return '<span class="rb-rc"><span class="rb-av m1">'+m+'</span><span class="rb-th up">'+ic("up")+'</span></span>'}).join("")+(D.react.down?'<span class="rb-rc"><span class="rb-av m3">?</span><span class="rb-th dn">'+ic("dn")+'</span></span>':"")+'</div>':'<p class="mut">No reactions yet.</p>')+
 '<h3 class="rb-h4">Cook remarks</h3>'+(cooks.filter(function(c){return c.line}).map(function(c){return '<div class="note"><div class="nt"><p>“'+esc(c.line)+'”</p></div><small>'+esc(c.by)+' · '+c.d+' '+c.mo+'</small></div>'}).join("")||'<p class="mut">None yet.</p>')+
 '<h3 class="rb-h4">Version notes</h3>'+(D.notes.slice().reverse().map(noteCard).join("")||'<p class="mut">No notes yet.</p>')+'</div><footer class="rff"><button class="btn sm" data-note>Add a note</button></footer></aside>';

var rail='<nav class="bar" aria-label="Main"><div class="brand">Our<br>kitchen</div><span class="nv"><svg viewBox="0 0 24 24"><path d="M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/></svg>Home</span><span class="nv"><svg viewBox="0 0 24 24"><path d="M5 8h14v12H5zM8 8V5h8v3"/></svg>Pantry</span><span class="nv on"><svg viewBox="0 0 24 24"><path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z"/></svg>Recipes</span><span class="nv"><svg viewBox="0 0 24 24"><path d="M5 5h14v14H5zM5 10h14"/></svg>Plan</span><span class="nv"><svg viewBox="0 0 24 24"><path d="M4 5h2l2 10h9l2-7H7"/></svg>Shopping</span></nav>';

var sw='<div class="sw"><button class="swb" aria-expanded="false" aria-controls="swp">States</button><div id="swp" class="swp" hidden><h3>Recipe</h3><div class="swg">'+["short","typical","long","notes","cooked","nocooked"].map(function(k){return '<a href="?r='+k+'"'+(k===key?' aria-current="true"':"")+'>'+k+'</a>'}).join("")+'</div><h3>Theme</h3><div class="swg"><button data-theme-pick="kitchie">Dark</button><button data-theme-pick="kitchie-day">Light</button></div><p>Lane: <a href="?r='+key+'&lane=1">open</a> · <a href="?r='+key+'&lane=0">closed</a></p></div></div>';

document.getElementById("app").innerHTML=rail+'<main class="rpage"><div class="rtab" id="rtab" data-screen="recipe" data-dens="'+dens+'" data-rec="'+key+'">'+hero+vbar+body+'</div></main>'+lane+sw;

/* behaviour */
var app=document.getElementById("app"),laneEl=document.querySelector(".rfly");
var wantLane=q.get("lane");var setLane=function(on){laneEl.hidden=!on;app.classList.toggle("lane-open",on)};
setLane(wantLane==="1"||(wantLane===null&&innerWidth>=1700&&(D.notes.length||D.react.of||cooks.some(function(c){return c.line}))));
document.addEventListener("click",function(e){var t=e.target.closest&&e.target.closest("[data-notes],[data-lane-close],[data-st],[data-tab],.swb,.psp,[data-pmore]");if(!t)return;
 if(t.matches("[data-notes]")){setLane(laneEl.hidden)}
 else if(t.matches("[data-lane-close]")){setLane(false)}
 else if(t.matches("[data-st]")){n=Math.max(1,Math.min(12,n+(+t.dataset.st)));document.querySelectorAll(".serves span").forEach(function(s){s.textContent="Serves "+n});document.querySelectorAll(".inglist").forEach(function(l){l.innerHTML=ingRows()})}
 else if(t.matches("[data-tab]")){e.preventDefault();/* in place, no reload (DESIGN.md 6a) */document.querySelector(".rbody").outerHTML=bodyFor(t.dataset.tab);document.querySelectorAll("[data-tab]").forEach(function(a){var on=a===t;a.classList.toggle("on",on);a.setAttribute("aria-selected",String(on))})}
 else if(t.matches(".swb")){var p=document.getElementById("swp");p.hidden=!p.hidden;t.setAttribute("aria-expanded",String(!p.hidden))}
 else if(t.matches(".psp")&&!t.classList.contains("prep")){t.classList.toggle("open")}
 else if(t.matches("[data-pmore]")){document.getElementById("pgrid").hidden=false;t.hidden=true}
});
document.addEventListener("keydown",function(e){if(e.target.matches("input,textarea"))return;if(e.key==="n"||e.key==="N")setLane(laneEl.hidden)});
})();
