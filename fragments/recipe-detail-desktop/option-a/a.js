/* Mockup script: sample data (notes.md section 3.4) + rendering. Sample-data names stay here, never in a.css. */
(function(){
var Q=new URLSearchParams(location.search),R=Q.get("r")||"typical";
var VERS=Q.get("vers")==="3";
var th=Q.get("t");if(th==="dark")th="kitchie";if(th==="light")th="kitchie-day";
if(th)document.documentElement.setAttribute("data-theme",th);
var E=function(s){return String(s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})};
var ic=function(n,c){return '<svg class="ic'+(c?" "+c:"")+'" aria-hidden="true"><use href="#i-'+n+'"/></svg>'};
var I=function(name,a,u,o){return{name:name,a:a,u:u||"",o:o}};

var CK=[{day:"9",mon:"Oct",by:"Jane",ver:"With peas",line:"used leftover rice",ate:3,ago:"2 days ago"},
 {day:"28",mon:"Sep",by:"Sam",ver:"Less soy, more garlic",verdict:"Kept it",ate:3},
 {day:"20",mon:"Sep",by:"You",ver:"Original",line:"too salty first time",verdict:"Needed work",ate:2},
 {day:"",mon:"Earlier",by:"Sam",ver:"Original"}];
var NOTES5=[
 {on:"With peas",by:"You",at:"14 Oct",t:"Doubled for 4 people in the big pan and had to fry the rice in two batches. Do not crowd the pan."},
 {on:"With peas",by:"Alex",at:"28 Sep",t:"Peas straight from frozen is fine, no need to thaw.",rew:1},
 {on:"With peas",by:"Jane",at:"20 Sep",t:"Kids like it with frozen peas thrown in at step 5."},
 {on:"Original",by:"Priya",at:"2 Oct",t:"Things that go well on the side: cucumber in rice vinegar, a soft-boiled egg on top, kimchi.",inh:1},
 {on:"Original",by:"Sam",at:"12 Sep",t:"Day-old rice really is better. Fresh rice goes mushy.",inh:1}];

var D={
short:{name:"Garlic toast eggs",min:"10 min",serves:2,col:"#c8a86b",e:"🍳",pantry:1,
 ing:[I("Eggs",4),I("Sourdough",4,"slices")],miss:[],
 steps:[{t:"Toast the bread and rub it with a cut garlic clove.",m:3,p:"#bfa98c",e:"🍞"},{t:"Fry the eggs in butter until the whites are set; lay on the toast.",m:4,p:"#d8c8c8",e:"🍳"}],
 cooks:[],notes:[],share:null,planned:null},
typical:{name:"Egg fried rice",min:"20 min",serves:2,col:"#ba976b",e:"🍚",pantry:1,
 ing:[I("Eggs",3),I("Basmati rice, cooked and cooled",300,"g"),I("Onion",1),I("Spring onions",2),I("Soy sauce",2,"tbsp"),I("Oil",1,"tbsp"),I("Frozen peas",80,"g"),I("Garlic cloves",2),I("Sesame oil",1,"tsp",1),I("Chilli flakes",null)],
 miss:["Spring onions","Sesame oil"],
 steps:[{t:"Beat the eggs with a pinch of salt.",p:"#d9b98c",e:"🥚"},{t:"Chop the onion and fry it in the oil until soft.",m:3,p:"#c9a46a",e:"🧅"},{t:"Push the onion aside, pour in the eggs and stir until just set.",m:1,prep:1},{t:"Tip in the cold rice and break up any lumps. Keep the heat high.",m:4,p:"#e3cfa6",e:"🍚"},{t:"Splash in the soy sauce and add the peas.",m:2},{t:"Toss through the spring onions and serve."}],
 cooks:CK,notes:[],share:null,planned:"Tue",likes:{up:["J","S","Y"],dn:1,line:"Cooked 4 times"}},
long:{name:"Slow lamb shoulder with white beans and salsa verde",min:"4 h 30",serves:8,col:"#8a6a4a",e:"🍖",pantry:1,
 ing:[["Lamb",I("Lamb shoulder, bone in",2.2,"kg"),I("Garlic cloves",8),I("Rosemary sprigs",4),I("Anchovy fillets",6,"",1),I("Olive oil",3,"tbsp"),I("Salt",2,"tsp"),I("Black pepper",1,"tsp"),I("White wine",250,"ml")],
  ["Beans",I("Cannellini beans",3,"tins"),I("Onion, finely sliced",2),I("Celery sticks",2),I("Carrot",2),I("Tomato paste",2,"tbsp"),I("Chicken stock",500,"ml"),I("Bay leaves",2),I("Lemon, zest of",1),I("Chilli flakes",null)],
  ["Salsa verde",I("Flat-leaf parsley, large bunch",1),I("Mint leaves",20,"g"),I("Capers",2,"tbsp"),I("Garlic cloves",1),I("Red wine vinegar",2,"tbsp"),I("Olive oil",120,"ml"),I("Sea salt",1,"pinch")]],
 miss:["Anchovy fillets","Cannellini beans","Celery sticks","Mint leaves","Capers"],
 steps:[["Lamb","Heat the oven to 160C.",5],["Lamb","Pound the garlic, rosemary and anchovies to a rough paste with the oil."],["Lamb","Score the lamb and rub the paste in; season well."],["Lamb","Brown the lamb on all sides in a heavy pot.",15,"#a5764f","🥩"],["Lamb","Deglaze with the wine and let it bubble down by half.",5],["Lamb","Cover tightly and roast.",180],["Beans","Meanwhile soften onion, celery and carrot in a pan.",12],["Beans","Add paste, stock, bay and beans; simmer.",20],["Beans","Lift the lamb out, rest it under foil.",20,"#9b8466","🧱"],["Beans","Tip the beans into the pot and return to the oven, lid off.",30],["Salsa verde","Chop herbs, capers and garlic together.",8],["Salsa verde","Stir in vinegar and oil; season with the salt."],["","Pull the lamb into large pieces over the beans.",5,"#b08a62","🍖"],["","Spoon salsa verde over and serve with lemon wedges."]].map(function(s){return{g:s[0],t:s[1],m:s[2],p:s[3],e:s[4]}}),
 cooks:[{day:"3",mon:"Oct",by:"Sam",ver:"Original",verdict:"Kept it",ate:6},{day:"6",mon:"Sep",by:"You",ver:"Original",ate:7}],
 notes:[{on:"Original",by:"Sam",at:"4 Oct",t:"Rested 30 min instead of 20, much easier to pull apart."},{on:"Original",by:"Priya",at:"12 Sep",t:"Swap the wine for stock if serving kids.",inh:1}],share:1,planned:null,likes:{up:["S"],dn:0}}
};
D.notes=JSON.parse(JSON.stringify(D.typical));D.notes.notes=NOTES5;
D.cooked=D.typical;
D.nocooked=JSON.parse(JSON.stringify(D.typical));D.nocooked.cooks=[];D.nocooked.likes=null;D.nocooked.planned=null;
if(!D[R])R="typical";var d=D[R];
var key=(R==="notes"||R==="cooked"||R==="nocooked")?"typical":R;
var shareCount=R==="long"?1:(R==="short"?null:(d.share||null));

/* ingredients: long has groups */
var groups=Array.isArray(d.ing[0])?d.ing.map(function(g){return{g:g[0],rows:g.slice(1)}}):[{g:"",rows:d.ing}];
var steps=d.steps.map(function(s){return s.t?s:{}});
var few=steps.length<=3;
var n=d.serves;
function fmt(v){var r=Math.round(v*100)/100;return String(r).replace(/\.0+$/,"")}
function qty(i){if(i.a==null)return '<span class="unk">amount?</span>';return fmt(i.a*n/d.serves)+(i.u?" "+i.u:"")}
function ingHtml(){var out="",miss=d.miss||[];
 groups.forEach(function(g){if(g.g)out+='<div class="grp">'+E(g.g)+'</div>';
  g.rows.forEach(function(i){var m=miss.indexOf(i.name)>-1,held=0;
   out+='<div class="ing'+(m?" miss":"")+'">'+'<span class="dot'+(m?" no":"")+'"></span><span class="nm">'+E(i.name)+(i.o?' <small>(optional)</small>':"")+'</span>'+(m?'<button class="cart" type="button" data-cart aria-label="Add '+E(i.name)+' to shopping">'+ic("cart","s")+'</button>':"")+'<span class="q" data-a="'+(i.a==null?"":i.a)+'">'+qty(i)+'</span></div>'})});
 return out}
function stepsHtml(){var out="",cur=null;
 d.steps.forEach(function(s,k){
  if(s.g&&s.g!==cur){cur=s.g;out+='<li class="sg">'+E(s.g)+'</li>'}
  if(!s.g&&cur){cur="";}
  var ph=s.p?'<button class="psp" type="button" data-pid="s'+k+'" aria-label="Photo of step '+(k+1)+', tap to enlarge" style="background:linear-gradient(150deg,'+s.p+',color-mix(in srgb,'+s.p+' 55%,#000))"><span class="ph">'+(s.e||"")+'</span></button>':(s.prep?'<span class="psp prep">Photo is being prepared</span>':"");
  var tm=s.m?'<span class="timer">'+ic("clock","xs")+s.m+(s.m>=60?" min":" min")+'</span>':"";
  out+='<li class="stp"><span class="nb">'+(k+1)+'</span><p class="tx">'+E(s.t)+tm+'</p>'+ph+'</li>'});
 return out}
function noteHtml(x,full){return '<div class="note'+(x.inh?" inh":"")+'"><div class="tx">'+E(x.t)+'</div><div class="from">'+(x.inh?ic("branch","xs")+" from the parent version · ":"")+E(x.by)+", "+E(x.at)+(x.rew?" · changed in this version":"")+'</div></div>'}
var cooks=d.cooks,planned=d.planned,lk=d.likes;
var nCook=cooks.length;
function proof(){
 if(!nCook)return '<button class="rb-band rb-empty" type="button" data-open="cooked"><b>Not cooked yet</b><small>Cook it once and the thumbs and notes start here.</small></button>';
 var dots=cooks.filter(function(c){return c.day}).map(function(c,i,a){return '<i class="rb-dot'+(i===0?" last":"")+'"></i>'}).join("");
 var last=cooks[0].ago?"last cooked "+cooks[0].ago:"last cooked "+cooks[0].day+" "+cooks[0].mon;
 var chips=lk?lk.up.map(function(x,i){return '<span class="rb-rc"><span class="rb-av m'+(1+i%3)+'">'+x+'</span>'+ic("up","xs").replace('class="ic xs"','class="ic up"')+'</span>'}).join("")+(lk.dn?'<span class="rb-rc"><span class="rb-av m3">'+lk.dn+'</span>'+ic("dn").replace('class="ic"','class="ic dn"')+'</span>':""):"";
 return '<button class="rb-band" type="button" data-open="cooked"><b>Cooked '+nCook+' time'+(nCook>1?"s":"")+'</b><small>'+last+'</small><span class="rb-dots">'+dots+'</span><span class="rb-react">'+chips+'</span></button>'}
var nmiss=(d.miss||[]).length,nIng=groups.reduce(function(a,g){return a+g.rows.length},0);
var up=lk?lk.up.length:0,dn=lk?lk.dn:0,nn=d.notes.length;
var title=d.name;
var vers=VERS?'<span class="vstrip" role="group" aria-label="Versions"><button type="button">Original</button><button type="button" class="on">With peas &#9733;</button><button type="button">Less soy, more garlic</button></span><span class="pills"><span class="tg rev">To review</span></span>':"";

var H='<nav class="nav" aria-label="Main"><div>Our<br>kitchen</div><span class="nv"></span><span class="nv on"></span><span class="nv"></span><span class="nv"></span></nav>'+
'<div class="rd '+(few?"few":"")+'">'+
'<header class="top"><a class="back" href="#" aria-label="Back to Recipes">'+ic("back")+'<span class="bl">Recipes</span></a>'+
'<button class="hb" type="button" data-hero aria-label="Photo of '+E(title)+'" style="background:linear-gradient(150deg,'+d.col+',color-mix(in srgb,'+d.col+' 55%,#000))"><span class="ph" style="font-size:22px">'+d.e+'</span></button>'+
'<h1 class="ttl" data-vt="title" title="'+E(title)+'">'+E(title)+'</h1>'+
'<button class="rb-notesbtn re-a rb-d" type="button" data-notes aria-label="Notes and reactions">'+ic("note")+'<span>Notes and reactions</span><em class="rb-pillcnt"><i class="u">'+ic("up")+up+'</i><i class="d">'+ic("dn")+dn+'</i><i>'+ic("note")+nn+'</i></em><span class="kbd">N</span></button>'+
'<button class="ib bare" type="button" data-star aria-pressed="'+(lk&&lk.up.indexOf("Y")>-1)+'" aria-label="Like this version">'+ic("star")+'</button>'+
'<a class="ib bare" href="#" data-key="e" aria-label="Edit">'+ic("pen")+'</a>'+
(shareCount!==undefined&&R!=="short"?'<button class="shr-chip" type="button" data-share>'+ic("share")+'Share'+(shareCount?'<span class="shr-n">'+shareCount+'</span>':"")+'<span class="kbd">S</span></button>':'<button class="shr-chip" type="button" data-share>'+ic("share")+'Share<span class="kbd">S</span></button>')+
'<button class="ib bare" type="button" data-more aria-label="More">'+ic("dots")+'</button></header>'+
'<div class="meta2"><span class="mc">'+ic("clock","s")+d.min+'</span><span class="sep"></span>'+(VERS?vers+'<span class="sep"></span>':"")+
'<a class="hl" href="#" data-key=",">'+ic("hist","s")+(VERS?"From Original · ":"")+'History <span class="kbd">,</span></a><span class="sep"></span>'+proof()+'<span class="grow"></span></div>'+
'<div class="cols">'+
'<aside class="rcol" aria-label="Ingredients and notes">'+
 (d.serves?'<div class="srv"><span class="lbl">Serves</span><span class="serves"><button type="button" data-n="-1" aria-label="Fewer servings">−</button><span data-sv>'+n+'</span><button type="button" data-n="1" aria-label="More servings">+</button></span></div>':"")+
 '<div class="rscroll" id="rs"><section id="ing"><div class="lblrow"><span class="lbl">Ingredients<em>'+(nmiss?(nIng-nmiss)+" of "+nIng+" in":"all in")+'</em></span><span style="display:flex;gap:2px">'+(planned?'<button class="mini" type="button" data-holdall>Hold</button>':"")+(nmiss>1?'<button class="mini" type="button" data-cartall aria-label="Add all '+nmiss+' missing to shopping" title="Add all '+nmiss+' missing to shopping. Talk to your assistant about substitutes.">'+ic("cart","s")+'<span class="n">'+nmiss+'</span></button>':"")+'<a class="mini ico" href="#" aria-label="Edit ingredients">'+ic("pen","s")+'</a></span></div>'+ingHtml()+'</section>'+
 '<section id="not"><div class="lblrow"><span class="lbl">Notes'+(nn?'<em>'+nn+'</em>':"")+'</span><button class="mini" type="button" data-note>'+ic("plus","s")+'Add a note</button></div>'+
 (nn?'<div class="nlist">'+d.notes.slice(0,2).map(noteHtml).join("")+'</div>'+(nn>1?'<button class="more" type="button" data-open="notes">See all '+nn+' notes <span class="kbd">N</span></button>':""):'<p class="nonote">No notes yet.</p>')+'</section></div>'+
 '<div class="act"><button class="btn sec" type="button" data-plan>'+(planned?"Planned "+planned:"Plan it")+'</button><a class="btn" href="#" data-cook>Cook it</a></div>'+
'</aside>'+
'<main class="mcol" id="mc"><section id="met"><div class="mhead"><span class="lbl">Method</span><span class="grow"></span><a class="mini ico" href="#" aria-label="Edit method">'+ic("pen","s")+'</a></div>'+
 '<div class="hero" data-hero style="background:linear-gradient(150deg,'+d.col+',color-mix(in srgb,'+d.col+' 55%,#000))"><span class="ph big">'+d.e+'</span></div>'+
 '<ol class="stps">'+stepsHtml()+'</ol></section></main></div></div>'+
'<aside class="rfly rfly-notes" id="fly" aria-label="Notes, cooked and photos"><header><h2>'+E(title)+'</h2><button class="ib" type="button" data-close aria-label="Close">'+ic("x")+'</button></header><div class="rfly-tabs" role="tablist"><button role="tab" data-tab="notes">Notes and reactions</button><button role="tab" data-tab="cooked">Cooked</button><button role="tab" data-tab="photos">Photos</button></div><div class="rfb" id="rfb"></div></aside>';
document.getElementById("rtab").innerHTML=H;

/* flyout bodies */
function flyBody(t){
 if(t==="notes"){var a=lk?'<div class="react">'+lk.up.map(function(x,i){return '<span class="rb-rc"><span class="rb-av m'+(1+i%3)+'">'+x+'</span>'+ic("up","xs").replace('class="ic xs"','class="ic up"')+'</span>'}).join("")+'</div>':'<p class="nonote">Nobody has rated it yet.</p>';
  return '<h3>Reactions</h3>'+a+'<h3>Notes</h3>'+(nn?d.notes.map(noteHtml).join(""):'<p class="nonote">No notes yet.</p>')+(nCook?'<h3>Cook remarks</h3>'+cooks.filter(function(c){return c.line}).map(function(c){return '<div class="note"><div class="tx">'+E(c.line)+'</div><div class="from">'+E(c.by)+", "+c.day+" "+c.mon+'</div></div>'}).join(""):"")+'<button class="mini" type="button" data-note style="margin-top:8px">'+ic("plus","s")+'Add a note</button>'}
 if(t==="cooked")return nCook?'<p class="nonote" style="margin-bottom:8px">Liked by 2 of 3 · a household favourite</p>'+cooks.map(function(c){return '<div class="hist"><span class="d"><b>'+(c.day||"–")+'</b>'+c.mon+'</span><div><div>'+E(c.by)+' cooked '+E(c.ver)+'</div>'+(c.line?'<small>“'+E(c.line)+'”</small>':"")+'<small>'+(c.verdict||"")+(c.ate?(c.verdict?" · ":"")+c.ate+" ate":"")+'</small></div></div>'}).join(""):'<p class="nonote">Not cooked yet.</p>';
 return '<button class="mini" type="button" data-more-photos>Show 6 photos</button><div class="pgrid" id="pg" style="margin-top:10px"></div><p class="nonote" id="pgn">Loads on tap.</p>'}
var tab="notes";
function openFly(t){tab=t;var r=document.getElementById("rtab");r.setAttribute("data-fly",t);
 document.querySelectorAll("[data-tab]").forEach(function(b){b.setAttribute("aria-selected",String(b.dataset.tab===t))});
 document.getElementById("rfb").innerHTML=flyBody(t)}
function closeFly(){document.getElementById("rtab").removeAttribute("data-fly")}
var toast=function(m){var t=document.getElementById("toast");t.textContent=m;t.style.display="block";clearTimeout(t._t);t._t=setTimeout(function(){t.style.display="none"},1800)};
document.addEventListener("click",function(e){var t=e.target;
 var o=t.closest("[data-open]");if(o){openFly(o.dataset.open);return}
 if(t.closest("[data-notes]")){openFly("notes");return}
 if(t.closest("[data-close]")){closeFly();return}
 var tb=t.closest("[data-tab]");if(tb){openFly(tb.dataset.tab);return}
 var s=t.closest("[data-n]");if(s){var m=d.batch?d.serves:1;n=Math.max(1,Math.min(12,n+(+s.dataset.n)*m));document.querySelector("[data-sv]").textContent=n;document.querySelectorAll(".q[data-a]").forEach(function(q){if(q.dataset.a!=="")q.textContent=(function(i){return fmt(i.a*n/d.serves)+(i.u?" "+i.u:"")})({a:+q.dataset.a,u:(q.textContent.replace(/^[\d.]+\s*/,""))})});return}
 var p=t.closest(".psp[data-pid]");if(p){p.closest(".stp").classList.toggle("open");return}
 if(t.closest("[data-hero]")){var h=t.closest("[data-hero]");document.getElementById("lbi").style.background=h.style.background;document.getElementById("lbi").innerHTML='<span class="ph big" style="font-size:120px">'+d.e+'</span>';document.getElementById("lb").classList.add("on");return}
 if(t.closest("#lb")){document.getElementById("lb").classList.remove("on");return}
 if(t.closest("[data-more-photos]")){document.getElementById("pg").innerHTML=[1,2,3,4,5,6].map(function(k){return '<div style="background:color-mix(in srgb,'+d.col+' '+(30+k*10)+'%,var(--surface))"></div>'}).join("");document.getElementById("pgn").remove();return}
 if(t.closest("[data-star]")){var b=t.closest("[data-star]");b.setAttribute("aria-pressed",String(b.getAttribute("aria-pressed")!=="true"));return}
 var msg={ "[data-share]":"Share panel opens in the right lane","[data-more]":"More sheet","[data-plan]":planned?"On the plan for "+planned+". Change it in Plan.":"Day picker (right flyout, #757)","[data-note]":"Note sheet","[data-cart]":"Added to shopping","[data-cartall]":"All missing added to shopping","[data-holdall]":"Held for "+planned,"[data-cook]":"Cook mode (separate page)","[data-key=e]":"Editor opens in the right lane","[data-key=',']":"History page"};
 for(var k in msg){if(t.closest(k)){e.preventDefault();toast(msg[k]);return}}
 var a=t.closest("a[href='#']");if(a)e.preventDefault()});
document.addEventListener("keydown",function(e){var k=e.key;
 if((e.ctrlKey||e.metaKey)&&(k==="Enter"||k==="Escape")){closeFly();return}
 if(k==="Escape")document.getElementById("lb").classList.remove("on");
 if(e.target.closest&&e.target.closest("input,textarea"))return;
 if(k==="n"||k==="N")openFly("notes");if(k==="s"||k==="S")toast("Share panel opens in the right lane");if(k==="e"||k==="E")toast("Editor opens in the right lane");if(k===",")toast("History page")});
if(R==="cooked")openFly("cooked");else if(Q.get("fly"))openFly(Q.get("fly"));

/* switcher */
var sw=document.getElementById("sw"),pn=document.getElementById("swp");
var link=function(k,v,l,on){var u=new URLSearchParams(location.search);u.set(k,v);return '<a href="?'+u+'"'+(on?' class="on"':"")+'>'+l+'</a>'};
pn.innerHTML='<b>Recipe state</b>'+["short","typical","long","notes","cooked","nocooked"].map(function(r){return link("r",r,r,r===R)}).join("")+
 '<b>Theme</b>'+link("t","dark","dark",th==="kitchie"||(!th&&document.documentElement.getAttribute("data-theme")==="kitchie"))+link("t","light","light",th==="kitchie-day")+
 '<b>Versions</b>'+link("vers","3","3 versions",VERS)+link("vers","1","1 version",!VERS)+
 '<p style="margin-top:8px;color:var(--muted)">Desktop only (1280 to 1920). Phone unchanged. Keys: N notes, S share, E edit, comma history. Close lane: Ctrl/Cmd+Enter.</p>';
sw.firstElementChild.onclick=function(){sw.classList.toggle("on");sw.firstElementChild.setAttribute("aria-expanded",String(sw.classList.contains("on")))};
})();
