/* Settings window, Preferences layout A, redrawn (mockup, 12 Oct 2026, round 5). Loaded by profile.js only when ?pref=a is shown, after profile-subs.js.
   Owner (voice, 11-12 Oct 2026): layout A is the one. The gutter under Preferences is Mine, Household, and one row per housemate who has food to show. Mine holds everything uat's Mine screen holds
   (stock level checks, rules by place, the add-rule and what-applies pickers, switched off, notes, Added for you, Food, Substitutions, Add something for a housemate, Added for housemates). A housemate's row
   is read-only and shows food only; what you proposed for them looks different (dashed, "Proposed by you", "Waiting for <name>") and carries Take back. Members and admins are not here: they live in the Household section.
   Words and rules are uat's (server/src/preferences/*, branch uat, read 12 Oct 2026): page-dials, rules-draw, stock-rules, food-card, web-notes, web-propose, web-page. Static sample data, no storage, no network.
   Everything opens in place: a row opens its flyout beside the list; nothing is a page of its own (in uat, Added for you and Add for a housemate are pages; here they are flyouts). */
(function(){
"use strict";
var $=function(s,r){return(r||document).querySelector(s)};
var $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
var P={chev:'<path d="M9 6l6 6-6 6"/>',lock:'<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',plus:'<path d="M12 5v14M5 12h14"/>',minus:'<path d="M5 12h14"/>',
 check:'<circle cx="12" cy="12" r="9"/><path d="M8 12.5l2.7 2.7L16 9.5"/>',pencil:'<path d="M4 20l1-4L16.5 4.5a2.1 2.1 0 0 1 3 3L8 19z"/><path d="M14 7l3 3"/>',bin:'<path d="M5 7h14M10 7V5h4v2M7 7l1 12h8l1-12M10 11v5M14 11v5"/>',
 bolt:'<path d="M13 3L5 13.5h6L10 21l8-10.5h-6z"/>',person:'<circle cx="12" cy="8" r="3.6"/><path d="M5 20c.8-4 3.6-6 7-6s6.2 2 7 6"/>',bell:'<path d="M6 17V11a6 6 0 0 1 12 0v6l1.5 2h-15z"/><path d="M10 21h4"/>',
 search:'<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/>',user:'<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/>',people:'<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6"/><circle cx="17" cy="9" r="2.6"/><path d="M17 14c2.8 0 4.5 1.9 4.5 5"/>'};
function ic(k,s){s=s||18;return '<svg class="pf-i" viewBox="0 0 24 24" width="'+s+'" height="'+s+'" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">'+P[k]+'</svg>'}
function esc(t){return String(t).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
function cap1(t){return t.charAt(0).toUpperCase()+t.slice(1)}
var CHEV='<span class="pf-chev">'+ic("chev")+'</span>';
function H(){return window.KProfileH}
function shell(){return window.KProfileSubs.shell.apply(null,arguments)}
function repaint(focusSel){var m=CUR;if(m&&H()){var y=($(".pf-body",m.frame)||{}).scrollTop,fy=($(".pf-fly-b",m.frame)||{}).scrollTop;H().paint(m,false,focusSel);var b=$(".pf-body",m.frame),f=$(".pf-fly-b",m.frame);if(b&&y)b.scrollTop=y;if(f&&fy)f.scrollTop=fy}}
var CUR=null;

/* ---------- the household, sample (Arjan is you; Maya is an admin; Sam and Jo are members) ---------- */
var PPL={arjan:"Arjan",sam:"Sam",maya:"Maya",jo:"Jo"},ADMINS=["arjan","maya"];
function viewer(m){return m.as==="sam"?"sam":"arjan"}
function isAdmin(m){return ADMINS.indexOf(viewer(m))>-1}
function nameList(a){return a.length<2?a.join(""):a.slice(0,-1).join(", ")+" and "+a[a.length-1]}

/* ---------- stock level checks: three settings, each App, then Household, then You (uat D16) ---------- */
var DIAL=[["check","Ask me to check amounts","Ask to check amounts"],["quiet","Quiet hours","Quiet hours"],["cap","Most suggestions per day","Most suggestions per day"]];
var APP={check:"On",quiet:"10pm to 6am",cap:"3"},HHV={check:null,quiet:"9pm to 7am",cap:"5"};
var YOU={arjan:{check:"On",quiet:null,cap:"6"},sam:{check:null,quiet:null,cap:null}};
function inForce(k,scope,who){var you=scope==="me"?YOU[who][k]:null;if(you!==null)return{t:you,from:"you"};if(HHV[k]!==null)return{t:HHV[k],from:"hh"};return{t:APP[k],from:"app"}}
function whyLine(k,v,scope){if(scope!=="me")return "";if(v.from==="you")return (HHV[k]!==null?"Household":"App")+" says "+(HHV[k]!==null?HHV[k]:APP[k]);return v.from==="hh"?"Same as household":"Same as app default"}
var SRC={you:["You","you"],hh:["Household","ok"],app:["App","app"]};
function chip(f){return '<span class="pf-chip '+SRC[f][1]+'">'+SRC[f][0]+'</span>'}

/* ---------- the pantry, for the pickers and the rules (a small sample) ---------- */
var LOCN={fridge:"Fridge",pantry:"Pantry",freezer:"Freezer"};
var CATN=["Dairy and eggs","Vegetables","Fruits","Meat","Dry goods","Cans","Seasoning","Snacks","Frozen"];
var ITEMS=[["butter","Butter","Dairy and eggs","fridge","Door"],["eggs","Eggs","Dairy and eggs","fridge","Door"],["yoghurt","Greek yoghurt","Dairy and eggs","fridge","Top shelf"],["milk","Milk","Dairy and eggs","fridge","Door"],["paneer","Paneer","Dairy and eggs","fridge","Top shelf"],["cream","Cream","Dairy and eggs","fridge","Top shelf"],
 ["carrots","Carrots","Vegetables","fridge","Crisper"],["spinach","Spinach","Vegetables","fridge","Crisper"],["tomatoes","Tomatoes","Vegetables","pantry","Shelf 1"],["onions","Onions","Vegetables","pantry","Shelf 1"],["apples","Apples","Fruits","fridge","Crisper"],["lemons","Lemons","Fruits","fridge","Crisper"],
 ["chicken","Chicken thighs","Meat","fridge","Middle shelf"],["bacon","Bacon","Meat","fridge","Middle shelf"],["mince","Beef mince","Meat","freezer","Drawer 1"],["salmon","Salmon fillets","Meat","freezer","Drawer 2"],
 ["rice","Rice","Dry goods","pantry","Shelf 2"],["pasta","Pasta","Dry goods","pantry","Shelf 2"],["flour","Flour","Dry goods","pantry","Shelf 2"],["oats","Oats","Dry goods","pantry","Shelf 2"],["lentils","Lentils","Dry goods","pantry","Shelf 2"],
 ["chickpeas","Chickpeas","Cans","pantry","Cupboard"],["coconut","Coconut milk","Cans","pantry","Cupboard"],["tuna","Tuna","Cans","pantry","Cupboard"],["salt","Salt","Seasoning","pantry","Spice rack"],["cumin","Cumin","Seasoning","pantry","Spice rack"],["paprika","Paprika","Seasoning","pantry","Spice rack"],
 ["peas","Peas","Frozen","freezer","Drawer 1"],["fishfingers","Fish fingers","Frozen","freezer","Drawer 2"],["berries","Berries","Frozen","freezer","Drawer 1"],["bread","Bread","Frozen","freezer","Door"]];
function item(id){return ITEMS.filter(function(i){return i[0]===id})[0]}
function whereOf(i){return LOCN[i[3]]+(i[4]?" ("+i[4]+")":"")+", "+i[2]}

/* ---------- rules by place: the most specific place wins (uat stock-rules.ts) ---------- */
var LV=["quiet","normal","helpful"],LVW={quiet:"Quiet",normal:"Normal",helpful:"Helpful"};
var LVC=[["quiet","Quiet, I do not need to know"],["normal","Normal"],["helpful","Helpful, ask me more"]];
var EVC=[[1,"Every day"],[3,"Every 3 days"],[7,"Once a week"],[14,"Every 2 weeks"],[30,"Once a month"]];
function everyWord(d){if(d===null)return "The app decides how often";var e=EVC.filter(function(x){return x[0]===d})[0];return e?e[1]:"Every "+d+" days"}
var RULES=[{id:"r1",o:"arjan",sc:"loc",loc:"freezer",lv:null,ev:7},{id:"r2",o:"arjan",sc:"cat",cat:"Meat",lv:"helpful",ev:3},{id:"r3",o:"hh",sc:"loc",loc:"fridge",lv:null,ev:14},{id:"all",o:"hh",sc:"all",lv:"normal",ev:null}];
var RANK={all:1,cat:2,loc:2,catloc:3,item:4};
function applies(r,it){return r.sc==="all"||(r.sc==="item"&&r.item===it[0])||(r.sc==="cat"&&r.cat===it[2])||(r.sc==="loc"&&r.loc===it[3])||(r.sc==="catloc"&&r.cat===it[2]&&r.loc===it[3])}
function pick1(it,rules,key){
 var f=rules.filter(function(r){return r[key]!==null&&applies(r,it)});if(!f.length)return{v:null,from:"app",rule:null,tie:false};
 var top=Math.max.apply(null,f.map(function(r){return RANK[r.sc]})),per={};
 f.filter(function(r){return RANK[r.sc]===top}).forEach(function(r){var h=per[r.sc];if(!h||(r.o!=="hh"&&h.o==="hh"))per[r.sc]=r});
 var w=Object.keys(per).map(function(k){return per[k]}),ch=w[0],tie=false;
 if(w.length>1){w.slice(1).forEach(function(x){var a=x[key],b=ch[key],better=a===b?(x.o!=="hh"&&ch.o==="hh"):(key==="lv"?LV.indexOf(a)<LV.indexOf(b):a>b);if(better)ch=x});tie=w.some(function(x){return x[key]!==ch[key]})}
 return{v:ch[key],from:ch.o==="hh"?"hh":"you",rule:ch,tie:tie}}
function resolve(it,rules){var l=pick1(it,rules,"lv"),e=pick1(it,rules,"ev");return{lv:l.v||"normal",lf:l.from,lr:l.rule,ev:e.v,ef:e.from,er:e.rule,tie:l.tie||e.tie}}
function visRules(scope,v){return RULES.filter(function(r){return scope==="hh"?r.o==="hh":(r.o===v||r.o==="hh")})}
function rTitle(r){return r.sc==="all"?"Everything else":r.sc==="loc"?LOCN[r.loc]:r.sc==="cat"?r.cat:r.sc==="catloc"?r.cat+" in "+LOCN[r.loc]:item(r.item)[1]}
function rScope(r){if(r.sc==="item"){var i=item(r.item);return "Item, in "+LOCN[i[3]]+" ("+i[4]+"), "+i[2]}return{all:"The whole kitchen",cat:"Category",loc:"Location",catloc:"Category in a location"}[r.sc]}
function rValue(r){var p=[];if(r.lv!==null)p.push(LVW[r.lv]);if(r.ev!==null)p.push(everyWord(r.ev));return p.length?p.join(" · "):"Same as the broader rule"}
function rulesFor(scope,v){return visRules(scope,v).filter(function(r){return r.sc!=="all"}).sort(function(a,b){return RANK[b.sc]-RANK[a.sc]||(b.o==="hh"?0:1)-(a.o==="hh"?0:1)||rTitle(a).localeCompare(rTitle(b))})}

/* ---------- switched off ---------- */
var STOPS=[{id:"st1",o:"arjan",name:"Soy sauce",what:"This item only. We check back after 2026-11-20"},{id:"st2",o:"arjan",name:"Pantry",what:"Everything in this place. We check back after 2026-12-01"}];

/* ---------- notes ---------- */
var NOTES={arjan:"Dinner is usually at 7. Please ask before throwing out leftovers.",sam:"",hh:"Bins go out on Thursday night. Label what you put in the freezer."};

/* ---------- food (uat food-card.ts): avoids, limits, substitutions, likes, dislikes ---------- */
var RW={avoid:"Avoids",cap:"Limit",sub:"Substitution",like:"Likes",dislike:"Dislikes"},RORDER=["avoid","cap","sub","like","dislike"];
var FOOD=[
 {id:"f1",o:"arjan",r:"avoid",s:"gluten",d:"For safety, no end",said:"I can't eat gluten",n:2},{id:"f2",o:"arjan",r:"like",s:"rice noodles",d:"No end",said:"I like rice noodles",n:1},
 {id:"f3",o:"arjan",r:"dislike",s:"coriander",d:"Until 30 Nov · Ends by itself",said:"no coriander for the next few weeks",n:1,ends:"30 Nov"},{id:"f4",o:"arjan",r:"cap",s:"milk",d:"At most once in 7 days · A limit",said:"milk only once a week",n:1},
 {id:"s1",o:"arjan",r:"sub",s:"Butter for ghee",d:"A swap · Yours over the household’s",said:"use ghee instead of butter",n:1},
 {id:"h1",o:"hh",r:"avoid",s:"pork",d:"Not for safety, no end",said:"no pork in the house",n:1},{id:"h2",o:"hh",r:"avoid",s:"sesame",d:"For safety, no end",said:"nothing with sesame, one of us is allergic",n:1},
 {id:"x1",o:"sam",r:"avoid",s:"shellfish",d:"For safety, no end",said:"shellfish makes me ill",n:2},{id:"x2",o:"sam",r:"like",s:"mushrooms",d:"No end",said:"I love mushrooms",n:1},{id:"x3",o:"sam",r:"dislike",s:"olives",d:"Until 30 Nov · Ends by itself",said:"no olives for a while",n:1,ends:"30 Nov"}];
/* proposals: something a housemate added to another's own list. Used straight away, tagged proposed by; the person has the last word (uat web-propose.ts). status: waiting, kept, removed, taken back. */
var PROPS=[{id:"p1",from:"arjan",to:"sam",r:"avoid",s:"peanuts",why:"safety",at:"yesterday, 4:40 pm",st:"waiting"},{id:"p2",from:"arjan",to:"maya",r:"avoid",s:"beans",why:"other",at:"today, 7:18 am",st:"waiting"},{id:"p3",from:"sam",to:"arjan",r:"like",s:"paneer",why:"",at:"today, 8:02 am",st:"waiting"}];
function waiting(f){return PROPS.filter(function(p){return p.st==="waiting"&&f(p)})}
function propTime(p){return cap1(p.at)}
function propDetail(p){return p.r==="avoid"?(p.why==="safety"?"For safety, none at all":p.why==="other"?"Not for safety, none at all":"Treated as safety until said"):""}
function foodOf(who){return FOOD.filter(function(f){return f.o===who})}
function sortFood(a){return a.slice().sort(function(x,y){return RORDER.indexOf(x.r)-RORDER.indexOf(y.r)})}

/* ---------- Household: what changed since the viewer last looked (three ways to show it; owner has not chosen) ---------- */
var LASTSEEN="Fri 9 Oct";
var CHG=[{id:"a:d:hh:cap",what:"Most suggestions per day",line:"8 to 5",by:"maya",when:"yesterday, 6:12 pm"},{id:"a:f:h2",what:"Avoids sesame",line:"Added for everyone",by:"maya",when:"today, 7:40 am"}];
var SEEN={};
function chgOf(id){return CHG.filter(function(c){return c.id===id})[0]}
function unseen(){return CHG.filter(function(c){return !SEEN[c.id]})}
function chgMode(m){return m.chg===undefined?"1":m.chg}
/* what a changed row adds: variant 1 a badge and who and when; variant 2 a dot that clears once the row is opened; variant 3 a call-out (the summary above says which) */
function mark(m,id){
 var c=chgOf(id),md=chgMode(m);if(!c||md==="0")return{};
 if(md==="1")return{chip:'<span class="pf-chip chg">Changed</span>',x:'<span class="pf-chgline">'+PPL[c.by]+' changed this · '+c.when+(c.id==="a:d:hh:cap"?' · was 8':'')+'</span>'};
 if(SEEN[id])return{};
 if(md==="2")return{lead:'<i class="pf-dot" role="img" aria-label="Changed since you last looked"></i>',cls:"pf-unseen"};
 return{cls:"pf-called"}}

/* ---------- small pieces ---------- */
function prow(m,sel,o){
 var on=m.sel===sel;
 return '<li class="'+(o.cls||"")+'"><button type="button" class="pf-item" data-sel="'+sel+'" aria-pressed="'+on+'">'+(o.lead||"")+'<span class="pf-t">'+(o.kw?'<span class="pf-fs">'+o.kw+'</span>':"")+esc(o.t)
  +((o.v||o.w)?'<small>'+(o.v?'<b class="pf-val">'+esc(o.v)+'</b>':"")+(o.w?(o.v?" · ":"")+esc(o.w):"")+'</small>':"")+(o.x||"")+'</span>'+(o.chip||"")+CHEV+'</button></li>'}
function gh(t,line){return '<li class="pf-gh"><b>'+t+'</b>'+(line?'<span>'+line+'</span>':"")+'</li>'}
function card(label,inner,after){return '<div><span class="pf-lbl">'+label+'</span><ul class="pf-list pf-picks">'+inner+'</ul>'+(after||"")+'</div>'}
function notep(t){return '<p class="pf-small pf-note2">'+t+'</p>'}
function lockNote(){return '<p class="pf-lock">'+ic("lock",16)+'<span>Only household admins can change this. Admins: '+nameList(ADMINS.map(function(a){return PPL[a]}))+'.</span></p>'}
function pbar(m){var a=isAdmin(m);return '<p class="pf-small pf-intro">You are viewing as <b>'+(a?"Arjan, the founding member and an admin":"Sam, a member")+'</b>.'+(a||m.psub==="mine"?"":" The household’s values are read-only for you.")+'</p>'}
function legend(){return '<p class="pf-small pf-legend"><span>'+chip("you")+' you chose it</span><span>'+chip("hh")+' the kitchen’s value, as you have not chosen</span><span>'+chip("app")+' nobody has, so Kitchie’s own</span></p>'}

function dialRows(m,scope){
 var v=viewer(m);
 return DIAL.map(function(d){var x=inForce(d[0],scope,v),sel="a:d:"+scope+":"+d[0],mk=scope==="hh"?mark(m,sel):{};
  return prow(m,sel,{t:scope==="me"?d[1]:d[2],v:x.t,w:whyLine(d[0],x,scope),chip:(mk.chip||"")+chip(x.from),x:mk.x,lead:mk.lead,cls:mk.cls})}).join("")}
function ruleRows(m,scope){
 var v=viewer(m),out="";
 out+=gh("Level and how often, by place","The most specific place wins: an item, then a category in a location, then a category or a location, then everything else.");
 rulesFor(scope,v).forEach(function(r){
  if(scope==="me"&&r.o==="hh"){out+='<li><div class="pf-item pf-static"><span class="pf-t">'+esc(rTitle(r))+'<small><b class="pf-val">'+esc(rValue(r))+'</b> · '+esc(rScope(r))+'</small></span>'+chip("hh")+'<button type="button" class="pf-btn sm" data-pa="gohh" data-id="a:r:'+r.id+'" aria-label="Open '+esc(rTitle(r))+' in Household">Open in Household</button></div></li>';return}
  out+=prow(m,"a:r:"+r.id,{t:rTitle(r),v:rValue(r),w:rScope(r),chip:chip(r.o==="hh"?"hh":"you")})});
 var all=resolve([ "", "", "", "", ""],visRules(scope,v)),from=all.lf==="you"||all.ef==="you"?"you":all.lf==="hh"||all.ef==="hh"?"hh":"app";
 var hhAll=resolve(["","","","",""],visRules("hh",v));
 out+=prow(m,"a:r:all:"+scope,{t:"Everything else",v:LVW[all.lv]+" · "+everyWord(all.ev),w:scope==="me"&&from==="you"?(hhAll.lf==="hh"?"Household":"App")+" says "+LVW[hhAll.lv]:"",chip:chip(from)});
 if(scope==="hh"&&!isAdmin(m))return out;
 out+='<li><button type="button" class="pf-item pf-addrow2" data-sel="a:add:'+scope+'" aria-pressed="'+(m.sel==="a:add:"+scope)+'"><span class="pf-ico sm">'+ic("plus",16)+'</span><span class="pf-t">Add a rule for a place or an item</span>'+CHEV+'</button></li>';
 if(scope==="me")out+=prow(m,"a:probe",{t:"What applies to an item",v:"Pick one to see which rule wins"});
 return out}
function stopRows(m){
 var v=viewer(m),st=STOPS.filter(function(s){return s.o===v});
 var out=gh("Switched off","Things you told Kitchie to stop asking about. A switch-off always wins over a rule above.");
 if(!st.length)return out+'<li class="pf-li-note"><p class="pf-small">Nothing is switched off. Use Stop asking on a check, or tell the assistant.</p></li>';
 return out+st.map(function(s){return '<li><div class="pf-item pf-static"><span class="pf-t">'+esc(s.name)+'<small>'+esc(s.what)+'</small></span><button type="button" class="pf-btn sm" data-pa="askagain" data-id="'+s.id+'" aria-label="Ask again about '+esc(s.name)+'">Ask again</button></div></li>'}).join("")}

function foodRow(m,f,scope,v){
 var who=f.o==="hh"?"hh":"you",tag=f.tag?(f.d?" · ":"")+f.tag:"",mk=scope==="hh"&&f.o==="hh"?mark(m,"a:f:"+f.id):{};
 return prow(m,"a:f:"+f.id,{kw:RW[f.r],t:f.s,w:f.d+tag,chip:(mk.chip||"")+'<span class="pf-chip '+(who==="hh"?"ok":"you")+'">'+(who==="hh"?"Everyone":"Just you")+'</span>',x:mk.x,lead:mk.lead,cls:mk.cls})}
function myFood(m,v){
 var own=foodOf(v).filter(function(f){return f.r!=="sub"}),inc=waiting(function(p){return p.to===v}).map(function(p){return{id:p.id,o:v,r:p.r,s:p.s,d:propDetail(p),tag:"Proposed by "+PPL[p.from],prop:true}});
 var hh=FOOD.filter(function(f){return f.o==="hh"});
 return sortFood(own.concat(inc).concat(hh))}

function mine(m){
 var v=viewer(m),h=pbar(m)+'<p class="pf-small pf-intro">What you have chosen for yourself, and where everything else comes from.</p>'+legend();
 h+=card("Stock level checks",dialRows(m,"me")+ruleRows(m,"me")+stopRows(m),notep("Stock level checks ask whether the level Kitchie has recorded is still right. They are not about how much you have."));
 /* notes */
 var nt=NOTES[v];
 h+=card("Notes",prow(m,"a:n:me",{t:"Your note",v:nt||"Add a note",chip:chip("you")})
  +'<li><div class="pf-item pf-static"><span class="pf-t">Household note<small><b class="pf-val pf-clamp">'+esc(NOTES.hh||"Nobody has written one")+'</b></small></span><button type="button" class="pf-chipgo" data-pa="gohh" data-id="a:n:hh" aria-label="Household note, open it in Household">Household '+ic("chev",14)+'</button></div></li>',notep("Both notes are read. Neither replaces the other."));
 /* added for you */
 var inc=waiting(function(p){return p.to===v}).length;
 h+='<div><ul class="pf-list pf-picks">'+prow(m,"a:added",{t:"Added for you",v:inc?inc+(inc===1?" thing":" things")+" from housemates, in use now":"Nothing waiting",chip:inc?'<span class="pf-chip wait">Waiting for you</span>':'<span class="pf-chip">All clear</span>'})+'</ul></div>';
 /* food */
 var fr=myFood(m,v).map(function(f){return foodRow(m,f,"me",v)}).join("");
 h+=card("Food",fr||'<li class="pf-li-note"><p class="pf-small">Nothing remembered about you yet. Tell your assistant what you like, dislike, cannot eat, want less often or want swapped for something else, and it shows up here.</p></li>');
 /* substitutions */
 var subs=foodOf(v).filter(function(f){return f.r==="sub"});
 h+=card("Substitutions",subs.length?subs.map(function(f){return prow(m,"a:f:"+f.id,{kw:RW.sub,t:f.s,w:f.d,chip:'<span class="pf-chip you">Just you</span>'})}).join(""):'<li class="pf-li-note"><p class="pf-small">No substitutions yet. Tell your assistant, for example: “whenever a recipe has white bread, use sourdough” or “frozen food always needs blanching first”.</p></li>',notep("Your statements and the household’s are added together, not swapped. Say new ones, or a new category, to your assistant. The household’s can be changed by household admins only."));
 /* housemates */
 var mineP=waiting(function(p){return p.from===v});
 h+='<div class="pf-hmates"><div><button type="button" class="pf-btn" data-sel="a:give" aria-pressed="'+(m.sel==="a:give")+'">'+ic("plus",18)+' Add something for a housemate</button></div>'
  +'<div><span class="pf-lbl">Added for housemates</span>'+(mineP.length?'<ul class="pf-props">'+mineP.map(function(p){return propRow(p,true)}).join("")+'</ul>':'<p class="pf-small">Nothing waiting. What you add for a housemate, and what others add, is listed here until it has been dealt with. You are not told what they decide.</p>')+'</div></div>';
 return h}
/* one pending proposal, as the proposer sees it: the same thing on Mine and on the housemate's row. Dashed, "Proposed by you", "Waiting for <name>", Take back right on it. */
function propRow(p,withFor){
 var to=PPL[p.to];
 return '<li class="pf-prop" data-prop="'+p.id+'"><span class="pf-t"><span class="pf-fs">'+RW[p.r]+(withFor?" · for "+to:"")+'</span>'+esc(p.s)+'<small>'+(withFor?'Added '+p.at+'. In use now. '+to+' has not answered.':'Proposed by you · Added '+p.at+'. In use now.')+'</small></span><span class="pf-chip wait">Waiting for '+to+'</span><button type="button" class="pf-btn sm" data-pa="takeback" data-id="'+p.id+'" aria-label="Take back '+esc(p.s)+' from '+to+'">Take back</button></li>'}

function hh(m){
 var v=viewer(m),adm=isAdmin(m),h=pbar(m)+'<p class="pf-small pf-intro">Shared by everyone in Our kitchen. Used for anyone who has not chosen their own.</p>';
 h+='<p class="pf-lock">'+ic("lock",16)+'<span>Nothing a member adds for another member is kept here. It is written on that person’s own list, so it never becomes a household rule.</span></p>';
 h+=adm?'<p class="pf-small pf-intro">'+(v==="arjan"?"You are the founding member, so you are an admin.":"You are a household admin.")+' Admins can change these. Other members can only look.</p>':lockNote()+'<p class="pf-small pf-intro">You can still change everything on Mine.</p>';
 if(chgMode(m)==="3"&&unseen().length)h+=summary(m);
 h+=card("Stock level check defaults",dialRows(m,"hh")+ruleRows(m,"hh"));
 h+=card("Household note",prow(m,"a:n:hh",{t:"Household note",v:NOTES.hh||"Add a note",chip:chip("hh")}),notep("Everyone’s assistant reads this next to their own note. It does not replace theirs."));
 var fr=sortFood(FOOD.filter(function(f){return f.o==="hh"})).map(function(f){return foodRow(m,f,"hh",v)}).join("");
 h+=card("Food for everyone",fr,notep(adm?"Household admins can say or remove these. Safety ones ask once more before they are removed.":"Only household admins can say or remove these.")+notep("No substitutions for the whole kitchen yet. Tell your assistant, for example: “whenever a recipe has white bread, use sourdough” or “frozen food always needs blanching first”."));
 /* Members and admins are not here: they live in the Household section of the window (owner, 12 Oct 2026). */
 h+=card("Only the household has these",
  '<li><button type="button" class="pf-item" data-pa="goview" data-id="household"><span class="pf-t">Household name<small>Our kitchen · opens in Household settings</small></span>'+chip("hh").replace("Household","Household only")+CHEV+'</button></li>'
  +'<li><button type="button" class="pf-item" data-pgo="cats"><span class="pf-t">Categories<small>9 categories · opens in Settings</small></span>'+chip("hh").replace("Household","Household only")+CHEV+'</button></li>'
  +'<li><button type="button" class="pf-item" data-pgo="locs"><span class="pf-t">Locations and spots<small>3 locations · opens in Settings</small></span>'+chip("hh").replace("Household","Household only")+CHEV+'</button></li>'
  +'<li><div class="pf-item pf-static"><span class="pf-t">Recipe stars and votes<small>One star and one vote per recipe, for the whole kitchen. Not per person.</small></span>'+chip("hh").replace("Household","Household only")+'</div></li>',
  notep("These have no personal version, so there is nothing to override on Mine."));
 return h}
function summary(m){
 var u=unseen();
 return '<div class="pf-sumbar" role="status"><div class="pf-sumh"><b>'+u.length+(u.length===1?" thing":" things")+' changed since you last checked</b><span class="pf-small">You last looked on '+LASTSEEN+'. Admins changed these.</span></div><ul>'
  +u.map(function(c){return '<li><button type="button" class="pf-sumi" data-sel="'+c.id+'"><span class="pf-t">'+esc(c.what)+'<small>'+esc(c.line)+' · '+PPL[c.by]+', '+c.when+'</small></span>'+CHEV+'</button></li>'}).join("")
  +'</ul><button type="button" class="pf-btn sm" data-pa="seenall">Mark as seen</button></div>'}

/* a housemate: food only, read-only */
function memberPane(m,id){
 var v=viewer(m),nm=PPL[id],own=sortFood(foodOf(id).filter(function(f){return f.r!=="sub"})),props=waiting(function(p){return p.from===v&&p.to===id});
 var h='<p class="pf-small pf-intro">Food only. What '+nm+' has told Kitchie about food, to read. Only '+nm+' changes it; you can add something for '+nm+' from Mine.</p>';
 if(own.length)h+='<div><span class="pf-lbl">'+nm+'’s food</span><ul class="pf-list pf-ro">'+own.map(function(f){return '<li><div class="pf-item pf-static"><span class="pf-t"><span class="pf-fs">'+RW[f.r]+'</span>'+esc(f.s)+'<small>'+esc(f.d)+(f.tag?" · "+esc(f.tag.replace("Proposed by "+PPL[v],"Proposed by you")):"")+'</small></span><span class="pf-chip you">Just '+nm+'</span></div></li>'}).join("")+'</ul></div>';
 else h+='<p class="pf-small pf-note2">Nothing of '+nm+'’s own yet.</p>';
 if(props.length)h+='<div><span class="pf-lbl">Proposed by you, waiting for '+nm+'</span><ul class="pf-props">'+props.map(function(p){return propRow(p,false)}).join("")+'</ul><p class="pf-small pf-note2">In use now. '+nm+' keeps it, changes it or removes it. You are not told what '+nm+' decides.</p></div>';
 return h}

function pane(m){
 CUR=m;kids(m);
 if(!m.sel){m.saved=null;PK.key="";GV.key="";ED=null;CONF=null}
 if(m.psub==="hh"&&chgMode(m)==="2"){var s=m.sel;if(s&&chgOf(s))SEEN[s]=1}
 if(m.psub==="hh")return hh(m);
 if(m.psub==="mine")return mine(m);
 return memberPane(m,m.psub)}

/* the gutter: Mine, Household, then one row for each housemate with something to show (own food, or a proposal from the viewer) */
function memberIds(v){return Object.keys(PPL).filter(function(id){return id!==v&&(foodOf(id).filter(function(f){return f.r!=="sub"}).length>0||waiting(function(p){return p.from===v&&p.to===id}).length>0)})}
function kids(m){
 var v=viewer(m),out=[{k:"mine",t:"Mine",icon:"user"},{k:"hh",t:"Household",icon:"people",dot:chgMode(m)==="2"&&unseen().length>0}],ms=memberIds(v);
 if(ms.length){out.push({g:"Housemates"});ms.forEach(function(id){var n=waiting(function(p){return p.from===v&&p.to===id}).length;out.push({k:id,t:PPL[id],ini:PPL[id].charAt(0),note:n?n+" waiting":""})})}
 if(!out.some(function(c){return c.k===m.psub}))m.psub="mine";
 return out}

/* ---------- flyouts ---------- */
var PK={key:"",q:"",scope:"all",pick:null,lv:undefined,ev:undefined},GV={key:"",who:"",st:"avoids",subj:"",why:"safety",err:""},ED=null,CONF=null;
function saved(m,sel){return m.saved===sel?'<p class="pf-saved" role="status">'+ic("check",16)+' Saved</p>':""}
function radb(o){return '<button type="button" class="pf-radb" role="radio" aria-checked="'+o.on+'" data-pa="'+o.pa+'"'+(o.d||"")+'><span class="pf-ck" aria-hidden="true"></span><span>'+o.t+(o.s?'<small>'+o.s+'</small>':"")+'</span></button>'}
function chain(parts){var last=-1;parts.forEach(function(p,i){if(p[1]!==null)last=i});return '<p class="pf-chain" aria-label="Where the value comes from">'+parts.map(function(p,i){return (i===last?"<b>":"")+p[0]+" "+(p[1]===null?"not set":esc(p[1]))+(i===last?"</b>":"")}).join(" › ")+'</p>'}

function dialFly(m,scope,k){
 var d=DIAL.filter(function(x){return x[0]===k})[0],v=viewer(m),adm=isAdmin(m),mineS=scope==="me",x=inForce(k,scope,v),c=chgOf("a:d:hh:"+k);
 var yv=YOU[v][k],own=mineS?yv!==null:HHV[k]!==null;
 var body="";
 if(c&&!mineS)body+='<p class="pf-chgnote">'+ic("bell",16)+' Changed by '+PPL[c.by]+', '+c.when+'. Was 8, now 5.</p>';
 if(!mineS&&!adm)return {body:body+'<p class="pf-small">Members who have not chosen their own get this.</p>'+lockNote(),foot:"Close"};
 body+=chain([["App",APP[k]],["Household",HHV[k]]].concat(mineS?[["You",yv]]:[]));
 var below=mineS&&HHV[k]!==null?"Same as household ("+HHV[k]+")":"Same as app default ("+APP[k]+")";
 var rad='<div role="radiogroup" aria-label="'+esc(d[1])+'" class="pf-radios">';
 if(k==="check")rad+=radb({on:!own,pa:"dial",t:below,d:' data-sc="'+scope+'" data-k="'+k+'" data-v="inherit"'})+radb({on:own&&(mineS?yv:HHV[k])==="On",pa:"dial",t:"On",d:' data-sc="'+scope+'" data-k="'+k+'" data-v="On"'})+radb({on:own&&(mineS?yv:HHV[k])==="Off",pa:"dial",t:"Off",d:' data-sc="'+scope+'" data-k="'+k+'" data-v="Off"'});
 else if(k==="quiet")rad+=radb({on:!own,pa:"dial",t:below,d:' data-sc="'+scope+'" data-k="'+k+'" data-v="inherit"'})+radb({on:own&&(mineS?yv:HHV[k])!=="None",pa:"dial",t:mineS?"My own hours":"Household hours",d:' data-sc="'+scope+'" data-k="'+k+'" data-v="own"'})+(mineS?radb({on:yv==="None",pa:"dial",t:"None, no quiet hours for me",d:' data-sc="'+scope+'" data-k="'+k+'" data-v="None"'}):"");
 else rad+=radb({on:!own,pa:"dial",t:below,d:' data-sc="'+scope+'" data-k="'+k+'" data-v="inherit"'})+radb({on:own,pa:"dial",t:mineS?"My own number":"A number for the household",d:' data-sc="'+scope+'" data-k="'+k+'" data-v="own"'});
 body+=rad+'</div>';
 if(k==="cap"&&own)body+='<div class="pf-step"><button type="button" class="pf-btn sm" data-pa="capstep" data-sc="'+scope+'" data-d="-1" aria-label="One fewer">'+ic("minus",16)+'</button><b>'+(mineS?yv:HHV[k])+'</b><button type="button" class="pf-btn sm" data-pa="capstep" data-sc="'+scope+'" data-d="1" aria-label="One more">'+ic("plus",16)+'</button></div><p class="pf-small">From 1 to 20. The most stock level questions asked in one day.</p>';
 if(k==="quiet"&&own&&(mineS?yv:HHV[k])!=="None"){var tv=(mineS?yv:HHV[k]).split(" to ");body+='<div class="pf-two"><label>From<input class="pf-in" type="text" data-pq="'+scope+':0" value="'+esc(tv[0])+'" aria-label="Quiet hours from"></label><label>Until<input class="pf-in" type="text" data-pq="'+scope+':1" value="'+esc(tv[1])+'" aria-label="Quiet hours until"></label></div>'}
 if(k==="check")body+='<p class="pf-small">Turning this off stops every question on the web and in chat. Estimates already stored stay. It is on unless someone turns it off.</p>';
 if(k==="quiet")body+='<p class="pf-small">No questions are asked in between. The hours follow '+(mineS?"your":"each person’s")+' time zone, which comes from the device or account. It is not a setting.</p>'+(mineS?'<p class="pf-small">This one is always yours to change. None means no quiet hours for you at all, whatever the household has.</p>':"");
 if(mineS&&x.from!=="you")body+='<p><button type="button" class="pf-lnk" data-pa="gohh" data-id="a:d:hh:'+k+'">See the household’s setting</button></p>';
 return {body:body+saved(m,"a:d:"+scope+":"+k),foot:"Close"}}

function ruleEditor(m,r,scope,isAll){
 var adm=scope==="me"||isAdmin(m),v=viewer(m),title=isAll?"Everything else":rTitle(r);
 if(!adm)return '<p class="pf-small">Members who have not set their own get this.</p>'+lockNote();
 var fb=resolve(isAll?["","","","",""]:ruleItem(r),visRules(scope,v).filter(function(x){return x!==r&&(RANK[x.sc]<RANK[r.sc]||(RANK[x.sc]===RANK[r.sc]&&x.o==="hh"&&r.o!=="hh"))}));
 var word=function(f){return f==="hh"?"Same as household":f==="you"?"Same as your broader rule":"Same as app default"};
 var rd='<div role="radiogroup" aria-label="Level for '+esc(title)+'" class="pf-radios">'+radb({on:r.lv===null,pa:"rlevel",t:word(fb.lf)+" ("+LVW[fb.lv]+")",d:' data-id="'+r.id+'" data-v=""'})+LVC.map(function(l){return radb({on:r.lv===l[0],pa:"rlevel",t:l[1],d:' data-id="'+r.id+'" data-v="'+l[0]+'"'})}).join("")+'</div>';
 var opts='<option value=""'+(r.ev===null?" selected":"")+'>'+esc(word(fb.ef)+(fb.ev===null?"":" ("+everyWord(fb.ev).toLowerCase()+")"))+'</option>'+EVC.map(function(e){return '<option value="'+e[0]+'"'+(r.ev===e[0]?" selected":"")+'>'+e[1]+'</option>'}).join("");
 var h=rd+'<label class="pf-field"><span class="pf-lbl">How often to check</span><select class="pf-in" data-pa-sel="revery" data-id="'+r.id+'">'+opts+'</select></label>';
 if(isAll){var hhr=RULES.filter(function(x){return x.id==="all"})[0],yr=scope==="me"?r:null;h+='<p class="pf-small">Level</p>'+chain([["App","Normal"],["Household",hhr.lv?LVW[hhr.lv]:null]].concat(yr?[["You",yr.lv?LVW[yr.lv]:null]]:[]))+'<p class="pf-small">How often</p>'+chain([["App","decides per item"],["Household",hhr.ev===null?null:everyWord(hhr.ev)]].concat(yr?[["You",yr.ev===null?null:everyWord(yr.ev)]]:[]))}
 else h+='<button type="button" class="pf-btn dng" data-pa="rdel" data-id="'+r.id+'">Remove this rule</button>';
 h+='<p class="pf-small">Quiet asks the least, helpful asks the most. A narrower rule beats a broader one, so '+(r.sc==="item"?"an item rule beats its category, its location and everything else.":isAll?"anything with a narrower rule follows that instead.":"an item inside it can still have its own rule.")+'</p>';
 return h+saved(m,"a:r:"+r.id)}
function ruleItem(r){var f=ITEMS.filter(function(i){return applies(r,i)})[0];return f||[r.item||"",r.item||"",r.cat||"",r.loc||"",""]}
function ruleFly(m,id,scope){
 if(id==="all"&&scope==="me"){id="all-"+viewer(m);if(!RULES.some(function(x){return x.id===id}))RULES.push({id:id,o:viewer(m),sc:"all",lv:null,ev:null})}
 var r=RULES.filter(function(x){return x.id===id})[0];if(!r)return null;
 var isAll=r.sc==="all",sc=isAll?scope:(r.o==="hh"?"hh":"me");
 return {t:isAll?"Everything else":rTitle(r),crumb:(sc==="hh"?"Household":"Mine")+" › Level and how often, by place",body:'<p class="pf-small">'+esc(rScope(r))+'</p>'+ruleEditor(m,r,sc,isAll),foot:"Close"}}

/* the scoped, searchable picker (owner, 12 Oct 2026): never a list of every item. Quick picks are categories and places; items are found by typing. */
function pkScope(){return [["all","All"],["item","Items"],["cat","Categories"],["loc","Places"]]}
function pkFind(q,scope){
 q=q.trim().toLowerCase();var g=[],tot=0;
 var items=[],cats=[],locs=[],cl=[];
 if(q.length>=2){
  items=ITEMS.filter(function(i){return i[1].toLowerCase().indexOf(q)>-1}).map(function(i){return {kind:"item",id:i[0],label:i[1],sub:"Item · "+whereOf(i)}});
  cats=CATN.filter(function(c){return c.toLowerCase().indexOf(q)>-1}).map(function(c){return {kind:"cat",id:c,label:c,sub:"Category"}});
  locs=Object.keys(LOCN).filter(function(l){return LOCN[l].toLowerCase().indexOf(q)>-1}).map(function(l){return {kind:"loc",id:l,label:LOCN[l],sub:"Location"}});
  var seen={};ITEMS.forEach(function(i){var k=i[2]+"|"+i[3];if(seen[k])return;seen[k]=1;if(i[2].toLowerCase().indexOf(q)>-1||LOCN[i[3]].toLowerCase().indexOf(q)>-1)cl.push({kind:"catloc",id:k,label:i[2]+" in "+LOCN[i[3]],sub:"Category in a location"})})}
 else{cats=CATN.slice(0,4).map(function(c){return {kind:"cat",id:c,label:c,sub:"Category"}});locs=Object.keys(LOCN).map(function(l){return {kind:"loc",id:l,label:LOCN[l],sub:"Location"}})}
 var want=function(k){return scope==="all"||scope===k};
 var sets=[["Items",want("item")?items:[],5,"item"],["Categories",want("cat")?cats:[],3,"cat"],["Places",want("loc")?locs:[],3,"loc"],["A category in a place",want("cat")&&want("loc")||scope==="all"?cl:[],3,"catloc"]];
 var more=0;sets.forEach(function(s){if(s[1].length){g.push({g:s[0],a:s[1].slice(0,s[2])});tot+=Math.min(s[1].length,s[2]);more+=Math.max(0,s[1].length-s[2])}});
 return {groups:g,more:more,total:tot,q:q}}
function pkList(q,scope){
 var r=pkFind(q,scope);
 if(q.trim().length<2&&(scope==="item"))return '<p class="pf-small pf-pkmsg">Type at least 2 letters to look for an item. Items are not listed until you search.</p>';
 var h=q.trim().length<2?'<p class="pf-small pf-pkmsg">Quick picks. To find an item, start typing its name.</p>':"";
 if(!r.groups.length)return '<p class="pf-small pf-pkmsg">Nothing matches “'+esc(q.trim())+'”. Try a shorter word, or look in All.</p>';
 h+=r.groups.map(function(g){return '<div class="pf-pkg" role="group" aria-label="'+g.g+'"><span class="pf-pkgl">'+g.g+'</span>'+g.a.map(function(o){return '<button type="button" class="pf-pko" role="option" data-pa="pkpick" data-kind="'+o.kind+'" data-id="'+esc(o.id)+'"><span>'+esc(o.label)+'</span><small>'+esc(o.sub)+'</small></button>'}).join("")+'</div>'}).join("");
 if(r.more>0)h+='<p class="pf-small pf-pkmsg">'+r.more+' more match. Keep typing to narrow it down.</p>';
 return h}
function pkBox(mode){
 var pk=PK;
 if(pk.pick){var lab=pkLabel(pk.pick);return '<div class="pf-pkpick"><span class="pf-t"><span class="pf-fs">'+lab.kind+'</span>'+esc(lab.name)+'<small>'+esc(lab.where)+'</small></span><button type="button" class="pf-btn sm" data-pa="pkclear">Change</button></div>'}
 return '<div class="pf-pk"><div class="pf-seg pf-pkseg" role="radiogroup" aria-label="Look in">'+pkScope().map(function(s){return '<button type="button" role="radio" aria-checked="'+(pk.scope===s[0])+'" data-pa="pkscope" data-v="'+s[0]+'">'+s[1]+'</button>'}).join("")+'</div>'
  +'<label class="pf-field"><span class="pf-lbl">Find an item, a category or a place</span><span class="pf-pkin">'+ic("search",18)+'<input class="pf-in" id="pk-q" type="search" role="combobox" aria-autocomplete="list" aria-expanded="true" aria-controls="pk-list" data-pk placeholder="for example butter, Meat or Freezer" value="'+esc(pk.q)+'" autocomplete="off" spellcheck="false" data-flyfocus></span></label>'
  +'<div id="pk-list" class="pf-pkl" role="listbox" aria-label="Matches">'+pkList(pk.q,pk.scope)+'</div></div>'}
function pkLabel(p){
 if(p.kind==="item"){var i=item(p.id);return {kind:"Item",name:i[1],where:whereOf(i)}}
 if(p.kind==="cat")return {kind:"Category",name:p.id,where:"Every item in it"};
 if(p.kind==="loc")return {kind:"Location",name:LOCN[p.id],where:"Every item stored there"};
 var a=p.id.split("|");return {kind:"Category in a location",name:a[0]+" in "+LOCN[a[1]],where:"Only those items"}}
function pkRule(p,owner){var r={id:"n"+Date.now(),o:owner,lv:null,ev:null};if(p.kind==="item"){r.sc="item";r.item=p.id}else if(p.kind==="cat"){r.sc="cat";r.cat=p.id}else if(p.kind==="loc"){r.sc="loc";r.loc=p.id}else{var a=p.id.split("|");r.sc="catloc";r.cat=a[0];r.loc=a[1]}return r}
function pkItem(p){if(p.kind==="item")return item(p.id);var f=ITEMS.filter(function(i){return p.kind==="cat"?i[2]===p.id:p.kind==="loc"?i[3]===p.id:(i[2]+"|"+i[3])===p.id})[0];return f}
function sameSpot(a,b){return a.sc===b.sc&&a.cat===b.cat&&a.loc===b.loc&&a.item===b.item}

function addFly(m,scope){
 var v=viewer(m),owner=scope==="me"?v:"hh",pk=PK,h='<p class="pf-small">Where should it apply? Then choose its level, how often, or both. Whatever you leave out comes from a broader rule, then the app.</p>'+pkBox("add");
 if(pk.pick){
  var d=pkRule(pk.pick,owner),fb=resolve(pkItem(pk.pick)||["","","","",""],visRules(scope,v));
  h+='<div role="radiogroup" aria-label="Level" class="pf-radios">'+radb({on:pk.lv===undefined,pa:"pklevel",t:"Same as the broader rule ("+LVW[fb.lv]+")",d:' data-v=""'})+LVC.map(function(l){return radb({on:pk.lv===l[0],pa:"pklevel",t:l[1],d:' data-v="'+l[0]+'"'})}).join("")+'</div>'
   +'<label class="pf-field"><span class="pf-lbl">How often to check</span><select class="pf-in" data-pa-sel="pkevery"><option value="">'+esc(fb.ev===null?"Same as the broader rule (the app decides how often)":"Same as the broader rule ("+everyWord(fb.ev).toLowerCase()+")")+'</option>'+EVC.map(function(e){return '<option value="'+e[0]+'"'+(pk.ev===e[0]?" selected":"")+'>'+e[1]+'</option>'}).join("")+'</select></label>'}
 return {t:"Add a rule",crumb:(scope==="hh"?"Household":"Mine")+" › Level and how often, by place",body:h,foot:pk.pick?'<button type="button" class="pf-btn" data-flyclose>Cancel</button><button type="button" class="pf-btn pri" data-pa="addgo" data-sc="'+scope+'"'+(pk.lv===undefined&&pk.ev===undefined?" disabled":"")+'>Add the rule</button>':"Close"}}
function probeFly(m){
 var v=viewer(m),pk=PK,h='<p class="pf-small">Pick an item to see which rule decides its level and how often. Or pick a category or a place to see what an item there would get.</p>'+pkBox("probe");
 if(pk.pick){
  var it=pkItem(pk.pick);
  if(!it)h+='<p class="pf-small">There is no item there yet, so there is nothing to check.</p>';
  else{
   var res=resolve(it,visRules("me",v)),src=function(r){return r===null?"The app’s own":(r.o==="hh"?"Household":"Your")+" rule for "+rTitle(r).toLowerCase()};
   var stop=STOPS.filter(function(s){return s.o===v&&s.name.toLowerCase()===it[1].toLowerCase()})[0];
   h+='<dl class="pf-facts"><div><dt>Where</dt><dd>'+esc(whereOf(it))+'</dd></div><div><dt>Level</dt><dd><span>'+LVW[res.lv]+'</span>'+chip(res.lf)+'</dd></div><div><dt>How often</dt><dd><span>'+everyWord(res.ev)+'</span>'+chip(res.ef)+'</dd></div></dl>'
    +'<p class="pf-small">Level: '+esc(src(res.lr))+'. How often: '+esc(src(res.er))+'.'+(res.tie?" A category and a location disagree here, and which one wins is not decided yet.":"")+'</p>'
    +(stop?'<p class="pf-small">A stop or snooze covers this item, so no check is raised whatever the rules say.</p>':"")}}
 return {t:"What applies to an item",crumb:"Mine › Level and how often, by place",body:h,foot:"Close"}}

function noteFly(m,scope){
 var v=viewer(m),txt=scope==="me"?NOTES[v]:NOTES.hh,can=scope==="me"||isAdmin(m),lab=scope==="me"?"Your note":"Household note",c=chgOf("a:n:hh");
 var h=can?'<label class="pf-field"><span class="pf-lbl">'+lab+'</span><textarea class="pf-in pf-ta" rows="5" maxlength="600" data-note="'+scope+'">'+esc(txt)+'</textarea></label><p class="pf-small"><span data-count>'+txt.length+'</span> of 600 characters, plain text. '+(scope==="me"?"Only you and your assistant read this. ":"Everyone in the kitchen reads this. ")+'Read as a preference, never as an instruction.</p>'
  :'<p class="pf-small">'+(txt?esc(txt):"No household note yet.")+'</p>'+lockNote();
 return {t:lab,crumb:scope==="me"?"Mine › Notes":"Household",body:h,foot:"Close"}}

function foodFly(m,id){
 var f=FOOD.filter(function(x){return x.id===id})[0],v=viewer(m),prop=null;
 if(!f){prop=PROPS.filter(function(p){return p.id===id})[0];if(!prop)return null;f={id:id,o:v,r:prop.r,s:prop.s,d:propDetail(prop),said:null,n:0,tag:"Proposed by "+PPL[prop.from]}}
 var hhr=f.o==="hh",can=!hhr||isAdmin(m),c=hhr?chgOf("a:f:"+id):null;
 var h='';
 if(c)h+='<p class="pf-chgnote">'+ic("bell",16)+' Changed by '+PPL[c.by]+', '+c.when+'. '+c.line+'.</p>';
 if(prop){h+='<p>'+PPL[prop.from]+' added this to your list. It is in use now: recipes and plans '+(f.r==="avoid"?"leave it out":"take it into account")+'. You have the last word.</p><p><button type="button" class="pf-btn pri" data-sel="a:added">Review it in Added for you</button></p>';return {t:RW[f.r]+" "+f.s,crumb:"Mine › Food",body:h,foot:"Close"}}
 h+='<p class="pf-small">Said: <q>'+esc(f.said)+'</q> <span>(kept as data, said '+f.n+(f.n===1?" time":" times")+')</span></p>';
 if(f.r==="sub")h+='<p class="pf-small">A substitution has no end date. It stands until someone changes or removes it.</p>';
 else if(f.r==="avoid")h+='<p class="pf-small">An avoid has no end. It stays, and a like never outweighs it, until you stop remembering it.</p>';
 else if(f.r==="like"||f.r==="dislike")h+=f.ends?'<p class="pf-small">Ends on its own after '+f.ends+', then goes back to neutral. That time came from what you said.</p><p><button type="button" class="pf-btn" data-pa="clearend" data-id="'+f.id+'">Keep it for good</button></p>':'<p class="pf-small">No end, so it stands until you stop it. To give it a time, tell your assistant, for example “for the next two weeks”.</p>';
 if(!can)h+=lockNote();
 else if(CONF===f.id)h+='<p class="pf-small">This is kept for safety. Remove it only if it is no longer true'+(hhr?", for the whole household":"")+'.</p><div class="pf-acts"><button type="button" class="pf-btn dng" data-pa="forget" data-id="'+f.id+'" data-ok="1">Yes, stop remembering</button><button type="button" class="pf-btn" data-pa="keepit">Keep it</button></div>';
 else h+='<button type="button" class="pf-btn dng" data-pa="forget" data-id="'+f.id+'">Stop remembering this</button><p class="pf-small">To change the rule itself, tell your assistant. Moving a statement between Just you and Everyone has no operation today: say it again for the other one.</p>';
 return {t:RW[f.r]+" "+f.s,crumb:hhr?"Household › Food for everyone":"Mine › Food",body:h,foot:"Close"}}

/* Added for you: what housemates put on your list. Used already; you keep it, change it or remove it (uat reviewCard). */
function addedFly(m){
 var v=viewer(m),ps=waiting(function(p){return p.to===v}),h;
 if(!ps.length)h='<div class="pf-empty">'+ic("check",28)+'<b>Nothing waiting</b><p class="pf-small">When a housemate adds something to your list, it shows up here the next time you open Kitchie. Until you answer, it is already in use.</p></div>';
 else h='<p>Housemates added '+(ps.length===1?"this to your own list":"these to your own list")+'. It is already in use. Nothing here needs your approval, and you have the last word.</p>'+ps.map(function(p){return reviewCard(p)}).join("");
 return {t:"Added for you",crumb:"Mine",body:h,foot:"Close"}}
function reviewCard(p){
 var by=PPL[p.from],pv=propDetail(p),word=RW[p.r],confirming=CONF===p.id;
 var head='<span class="pf-t"><span class="pf-fs">'+by+' added</span>'+esc(word+" "+p.s)+(pv?'<small><b class="pf-val">'+pv+'</b></small>':"")+'<small>'+propTime(p)+'. In use now: recipes and plans '+(p.r==="avoid"?"leave it out":"take it into account")+'.</small></span>';
 if(ED===p.id)return '<div class="pf-rv" data-rv="'+p.id+'">'+head+'<label class="pf-field"><span class="pf-lbl">What is it?</span><input class="pf-in" type="text" data-edit-subj="'+p.id+'" value="'+esc(p.s)+'" maxlength="60" autocomplete="off"></label><div class="pf-acts"><button type="button" class="pf-btn pri" data-pa="ans" data-v="save" data-id="'+p.id+'">Save my version</button><button type="button" class="pf-btn" data-pa="ans" data-v="cancel" data-id="'+p.id+'">Cancel</button></div><p class="pf-small">Stays tagged <q>proposed by '+by+', changed by you</q>.</p></div>';
 if(confirming)return '<div class="pf-rv" data-rv="'+p.id+'">'+head+'<p class="pf-small">This is kept for safety'+(p.why==="safety"?"":" (no reason was given, so it is treated as safety)")+'. Remove it only if it is no longer true.</p><div class="pf-acts"><button type="button" class="pf-btn dng" data-pa="ans" data-v="rmyes" data-id="'+p.id+'">Yes, remove it</button><button type="button" class="pf-btn" data-pa="ans" data-v="keepit" data-id="'+p.id+'">Keep it for now</button></div></div>';
 return '<div class="pf-rv" data-rv="'+p.id+'">'+head+'<div class="pf-pacts">'
  +'<button type="button" class="pf-pact go" data-pa="ans" data-v="keep" data-id="'+p.id+'">'+ic("check",22)+'<span class="pf-t">Keep it as it is<small>Clears the waiting note. It stays on your list as yours, still tagged proposed by '+by+'.</small></span></button>'
  +'<button type="button" class="pf-pact" data-pa="ans" data-v="edit" data-id="'+p.id+'">'+ic("pencil",22)+'<span class="pf-t">Change it<small>Fix the wording or the reason. Your version replaces '+by+'’s and is the one in use.</small></span></button>'
  +'<button type="button" class="pf-pact dng" data-pa="ans" data-v="rm" data-id="'+p.id+'">'+ic("bin",22)+'<span class="pf-t">Remove it<small>Takes it off your list. New plans and recipes stop using it; a meal already planned stays as it was.</small></span></button></div></div>'}

/* Add something for a housemate (uat proposeScreenHtml), in place */
function others(v){return Object.keys(PPL).filter(function(x){return x!==v})}
function giveFly(m){
 var v=viewer(m),os=others(v);
 if(GV.key!==m.sel+v){GV={key:m.sel+v,who:os[1]||os[0],st:"avoids",subj:"",why:"safety",err:""}}
 var nm=PPL[GV.who],av=GV.st==="avoids",verb=av?"leave out ":"take into account ";
 var opt=function(pa,val,t,on,lead){return '<button type="button" class="pf-radb" role="radio" aria-checked="'+on+'" data-pa="'+pa+'" data-v="'+val+'"><span class="pf-ck" aria-hidden="true"></span><span class="pf-whoopt">'+(lead||"")+t+'</span></button>'};
 var h=(GV.err?'<p class="pf-err" role="alert">'+esc(GV.err)+'</p>':"")+'<p>Tell Kitchie something about someone else in the kitchen. It goes on their own list and is used straight away. It does not wait for their approval.</p>'
  +'<span class="pf-step1">1 · Who is it about?</span><div role="radiogroup" aria-label="Who is it about" class="pf-radios">'+os.map(function(id){return opt("gwho",id,PPL[id],GV.who===id,'<span class="pf-ini sm" aria-hidden="true">'+PPL[id][0]+'</span> ')}).join("")+'</div>'
  +'<span class="pf-step1">2 · What about '+nm+'?</span><div role="radiogroup" aria-label="What about them" class="pf-radios">'+[["avoids","Avoids"],["dislikes","Dislikes"],["likes","Likes"]].map(function(s){return opt("gst",s[0],s[1],GV.st===s[0])}).join("")+'</div>'
  +'<label class="pf-field"><span class="pf-step1">3 · What is it?</span><input class="pf-in" type="text" data-gsubj maxlength="60" autocomplete="off" placeholder="for example peanuts" value="'+esc(GV.subj)+'"></label>'
  +(av?'<span class="pf-step1">4 · Why?</span><div role="radiogroup" aria-label="Why" class="pf-radios">'+[["safety","Safety (allergy, intolerance, medical)"],["other","Another reason"],["","Not sure"]].map(function(s){return opt("gwhy",s[0],s[1],GV.why===s[0])}).join("")+'</div><p class="pf-small">Not sure is fine. Kitchie then treats it as none at all and for safety until '+nm+' says otherwise.</p>':"")
  +'<span class="pf-lbl">What happens when you press the button</span><ul class="pf-happens"><li>'+ic("bolt",22)+'<div><b>Used straight away</b><span>Recipes and plans '+verb+esc(GV.subj.trim()||"what you add")+' for '+nm+' from now. It does not wait for '+nm+' to sign in.</span></div></li>'
  +'<li>'+ic("person",22)+'<div><b>Written on '+nm+'’s own list</b><span>It is '+nm+'’s record, tagged <q>proposed by '+PPL[v]+'</q>. It is not a household rule and is not under Household.</span></div></li>'
  +'<li>'+ic("bell",22)+'<div><b>'+nm+' is told, and has the last word</b><span>Next time '+nm+' opens Kitchie, they can keep it, change it or remove it.</span></div></li></ul>';
 return {t:"Add for a housemate",crumb:"Mine",body:h,foot:'<button type="button" class="pf-btn" data-flyclose>Cancel</button><button type="button" class="pf-btn pri" data-pa="gsubmit">Add to '+nm+'’s list now</button>'}}

function fly(m){
 CUR=m;var s=m.sel||"",o=null,p=s.split(":");
 if(PK.key!==s&&/^a:(add|probe)/.test(s)){PK={key:s,q:"",scope:"all",pick:null,lv:undefined,ev:undefined}}
 if(p[1]==="d")o=dialFly(m,p[2],p[3]),o&&(o.t=DIAL.filter(function(d){return d[0]===p[3]})[0][p[2]==="me"?1:2],o.crumb=p[2]==="me"?"Mine › Stock level checks":"Household › Stock level check defaults");
 else if(p[1]==="r")o=ruleFly(m,p[2]==="all"?"all":p[2],p[3]||"me");
 else if(p[1]==="add")o=addFly(m,p[2]);
 else if(p[1]==="probe")o=probeFly(m);
 else if(p[1]==="n")o=noteFly(m,p[2]);
 else if(p[1]==="added")o=addedFly(m);
 else if(p[1]==="f")o=foodFly(m,p[2]);
 else if(p[1]==="give")o=giveFly(m);
 if(!o)return "";
 var foot=o.foot==="Close"?'<button type="button" class="pf-btn" data-flyclose>Close</button>':o.foot;
 return shell(esc(o.t),o.crumb,'<div class="pf-ed">'+o.body+'</div>',foot,o.t)}

/* ---------- events ---------- */
function say(t){H().toast(t)}
function propSay(k,p){var s=cap1(p.s),by=PPL[p.from];return {kept:"Kept. "+s+" stays on your list as yours, still tagged proposed by "+by+".",removed:"Removed. "+s+" is off your list, and new plans and recipes stop using it. Meals already planned stay as they were.",saved:"Saved. Your version replaces "+by+"’s and is the one in use. It stays tagged proposed by "+by+".",takenback:"Taken back. "+s+" is off "+PPL[p.to]+"’s list and no longer used."}[k]}
function click(m,el,H){
 CUR=m;var pa=el.dataset.pa;
 if(el.dataset.pgo)return false;
 if(!pa)return false;
 var id=el.dataset.id,v=viewer(m);
 if(pa==="gohh"){H.setSub(m,"hh");if(/^a:(d|r|n|f)/.test(id))H.openFly(m,id);return true}
 if(pa==="goview"){H.setView(m,id);return true}
 if(pa==="seenall"){CHG.forEach(function(c){SEEN[c.id]=1});H.paint(m,false);return true}
 if(pa==="askagain"){STOPS=STOPS.filter(function(s){return s.id!==id});H.paint(m,false);say("Asking again. Stock level checks may ask about it from now on.");return true}
 if(pa==="takeback"){
  var p=PROPS.filter(function(x){return x.id===id})[0];if(!p)return true;p.st="taken back";
  say(propSay("takenback",p));kids(m);H.paint(m,false);return true}
 if(pa==="dial"){
  var sc=el.dataset.sc,k=el.dataset.k,val=el.dataset.v,tgt=sc==="me"?YOU[v]:HHV;
  if(val==="inherit")tgt[k]=null;
  else if(val==="own")tgt[k]=k==="cap"?(sc==="me"?(HHV.cap||APP.cap):APP.cap):(sc==="me"&&HHV[k]?HHV[k]:APP[k]);
  else tgt[k]=val;
  m.saved="a:d:"+sc+":"+k;H.paint(m,false,'[data-pa="dial"][data-v="'+val+'"][data-k="'+k+'"]');return true}
 if(pa==="capstep"){var t2=el.dataset.sc==="me"?YOU[v]:HHV,n=Math.max(1,Math.min(20,Number(t2.cap)+Number(el.dataset.d)));t2.cap=String(n);m.saved="a:d:"+el.dataset.sc+":cap";H.paint(m,false,'[data-pa="capstep"][data-d="'+el.dataset.d+'"]');return true}
 if(pa==="rlevel"){var r=RULES.filter(function(x){return x.id===id})[0];if(r){r.lv=el.dataset.v||null;m.saved="a:r:"+id;H.paint(m,false,'[data-pa="rlevel"][data-v="'+(el.dataset.v||"")+'"]')}return true}
 if(pa==="rdel"){RULES=RULES.filter(function(x){return x.id!==id});m.sel=null;H.paint(m,false);say("Rule removed. Undo");return true}
 if(pa==="pkscope"){PK.scope=el.dataset.v;H.paint(m,false,"#pk-q");return true}
 if(pa==="pkpick"){PK.pick={kind:el.dataset.kind,id:id};PK.lv=undefined;PK.ev=undefined;H.paint(m,false,/probe/.test(m.sel)?'[data-pa="pkclear"]':'[data-pa="pklevel"]');return true}
 if(pa==="pkclear"){PK.pick=null;H.paint(m,false,"#pk-q");return true}
 if(pa==="pklevel"){PK.lv=el.dataset.v||undefined;H.paint(m,false,'[data-pa="pklevel"][data-v="'+(el.dataset.v||"")+'"]');return true}
 if(pa==="addgo"){
  var sc2=el.dataset.sc,owner=sc2==="me"?v:"hh",nr=pkRule(PK.pick,owner),dupe=RULES.filter(function(x){return x.o===owner&&sameSpot(x,nr)})[0];
  if(dupe){say("You already have a rule there. Opened it.");m.sel="a:r:"+dupe.id;H.paint(m,false);return true}
  nr.lv=PK.lv===undefined?null:PK.lv;nr.ev=PK.ev===undefined?null:PK.ev;RULES.push(nr);
  m.sel="a:r:"+nr.id;H.paint(m,false);say("Rule added for "+rTitle(nr).toLowerCase());return true}
 if(pa==="forget"){
  var f=FOOD.filter(function(x){return x.id===id})[0];if(!f)return true;
  if(!el.dataset.ok&&f.r==="avoid"&&/safety/.test(f.d)){CONF=f.id;H.paint(m,false,'[data-pa="forget"]');return true}
  FOOD=FOOD.filter(function(x){return x.id!==id});CONF=null;m.sel=null;kids(m);H.paint(m,false);say("Stopped remembering "+f.s+".");return true}
 if(pa==="keepit"){CONF=null;H.paint(m,false);return true}
 if(pa==="clearend"){var f2=FOOD.filter(function(x){return x.id===id})[0];if(f2){f2.ends=null;f2.d="No end"}H.paint(m,false);say("Kept for good.");return true}
 if(pa==="ans"){
  var pp=PROPS.filter(function(x){return x.id===id})[0],a=el.dataset.v;if(!pp)return true;
  if(a==="rm"){if(pp.r==="avoid"&&pp.why!=="other"){CONF=pp.id;H.paint(m,false,'[data-pa="ans"][data-v="rmyes"]');return true}a="rmyes"}
  if(a==="keepit"){CONF=null;H.paint(m,false);return true}
  if(a==="edit"){ED=pp.id;H.paint(m,false,"[data-edit-subj]");return true}
  if(a==="cancel"){ED=null;H.paint(m,false);return true}
  if(a==="keep"||a==="save"){
   if(a==="save"){var ni=H.$("[data-edit-subj]",m.frame);if(ni&&ni.value.trim())pp.s=ni.value.trim()}
   pp.st="kept";ED=null;FOOD.push({id:"k"+pp.id,o:pp.to,r:pp.r,s:pp.s,d:pp.r==="avoid"?(pp.why==="safety"?"For safety, no end":pp.why==="other"?"Not for safety, no end":"No end"):"No end",said:"added by "+PPL[pp.from],n:1,tag:"Proposed by "+PPL[pp.from]+(a==="save"?", changed by you":"")});
   say(propSay(a==="save"?"saved":"kept",pp));kids(m);H.paint(m,false);return true}
  if(a==="rmyes"){pp.st="removed";CONF=null;say(propSay("removed",pp));kids(m);H.paint(m,false);return true}
  return true}
 if(pa==="gwho"){GV.who=el.dataset.v;H.paint(m,false,'[data-pa="gwho"][data-v="'+GV.who+'"]');return true}
 if(pa==="gst"){GV.st=el.dataset.v;H.paint(m,false,'[data-pa="gst"][data-v="'+GV.st+'"]');return true}
 if(pa==="gwhy"){GV.why=el.dataset.v;H.paint(m,false,'[data-pa="gwhy"][data-v="'+GV.why+'"]');return true}
 if(pa==="gsubmit"){
  var inp=H.$("[data-gsubj]",m.frame);if(inp)GV.subj=inp.value;
  if(!GV.subj.trim()){GV.err="Say what it is first, for example peanuts.";H.paint(m,false,"[data-gsubj]");return true}
  var np={id:"p"+(PROPS.length+1)+Date.now()%1000,from:v,to:GV.who,r:{avoids:"avoid",dislikes:"dislike",likes:"like"}[GV.st],s:GV.subj.trim(),why:GV.st==="avoids"?GV.why:"",at:"today, 9:41 am",st:"waiting"};
  PROPS.push(np);GV.key="";m.sel=null;kids(m);H.paint(m,false);say("On "+PPL[np.to]+"’s list, and in use now. Waiting for "+PPL[np.to]+".");return true}
 return false}

document.addEventListener("input",function(e){
 var t=e.target;if(!t||!t.dataset||!CUR)return;
 if(t.hasAttribute("data-pk")){PK.q=t.value;var l=$("#pk-list");if(l)l.innerHTML=pkList(PK.q,PK.scope);return}
 if(t.dataset.note){var sc=t.dataset.note;if(sc==="me")NOTES[viewer(CUR)]=t.value;else NOTES.hh=t.value;var c=$("[data-count]",CUR.frame);if(c)c.textContent=t.value.length;return}
 if(t.hasAttribute("data-gsubj")){GV.subj=t.value;GV.err="";return}
});
document.addEventListener("change",function(e){
 var t=e.target;if(!t||!t.dataset||!CUR)return;
 if(t.dataset.paSel==="revery"){var r=RULES.filter(function(x){return x.id===t.dataset.id})[0];if(r){r.ev=t.value===""?null:Number(t.value);CUR.saved="a:r:"+r.id;repaint('[data-pa-sel="revery"]')}return}
 if(t.dataset.paSel==="pkevery"){PK.ev=t.value===""?undefined:Number(t.value);repaint('[data-pa-sel="pkevery"]');return}
 if(t.dataset.pq){var a=t.dataset.pq.split(":"),sc=a[0],i=Number(a[1]),k="quiet",tgt=sc==="me"?YOU[viewer(CUR)]:HHV,cur=(tgt[k]||HHV[k]||APP[k]).split(" to ");cur[i]=t.value.trim()||cur[i];tgt[k]=cur.join(" to ");CUR.saved="a:d:"+sc+":quiet";repaint();return}
});

window.KProfilePrefs={pane:pane,fly:fly,kids:kids,click:click};
})();
