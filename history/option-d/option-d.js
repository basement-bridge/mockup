/* History, Option D: people and catch-up feed. Mockup data and rendering. Plain names that exist only for the sample live here, not in the stylesheet.
   Markup uses the classes in option-d.css; lift those and the render functions, replace DATA with the lazy call (see docs/knowledge/history-option-d.md). */
(function(){
"use strict";
var Q=new URLSearchParams(location.search);
var $=function(s,r){return (r||document).querySelector(s)},$$=function(s,r){return [].slice.call((r||document).querySelectorAll(s))};
var esc=function(s){return String(s).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})};
var P={
 spark:'<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 16l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z"/>',
 search:'<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/>',
 sliders:'<path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/>',
 clock:'<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
 home:'<path d="M4 11l8-6.5 8 6.5v8.5H4z"/>',jar:'<path d="M8 4h8M7 7h10v12.5a1 1 0 01-1 1H8a1 1 0 01-1-1z"/><path d="M7 11h10"/>',
 cart:'<path d="M3.5 5h2.5l2 10h9.5l2-7.5H7"/><circle cx="9.5" cy="19" r="1.2"/><circle cx="16.5" cy="19" r="1.2"/>',
 cal:'<rect x="4" y="5.5" width="16" height="14.5" rx="2.5"/><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4"/>',
 book:'<path d="M5 4.5h10a3 3 0 013 3V20H8a3 3 0 01-3-3z"/><path d="M5 17a3 3 0 013-3h10"/>',
 pot:'<path d="M5 10h14v6a3.5 3.5 0 01-3.5 3.5h-7A3.5 3.5 0 015 16z"/><path d="M3 10h18M9 6.5c0-1.2 1-1.2 1-2.5M14 6.5c0-1.2 1-1.2 1-2.5"/>',
 user:'<circle cx="12" cy="8.5" r="3.5"/><path d="M5 20c.6-3.6 3.4-5.5 7-5.5s6.4 1.9 7 5.5"/>',
 users:'<circle cx="9" cy="9" r="3"/><path d="M3.5 19c.5-3 2.7-4.6 5.5-4.6s5 1.6 5.5 4.6"/><circle cx="17" cy="9.5" r="2.4"/><path d="M16.5 14.6c2.4 0 4 1.2 4.5 3.9"/>',
 mic:'<rect x="9" y="3.5" width="6" height="11" rx="3"/><path d="M5.5 11.5a6.5 6.5 0 0013 0M12 18v2.5"/>',
 lock:'<rect x="5.5" y="10.5" width="13" height="9.5" rx="2"/><path d="M8.5 10.5V8a3.5 3.5 0 017 0v2.5"/>',
 undo:'<path d="M9 8L5 12l4 4"/><path d="M5 12h9a5 5 0 010 10"/>',
 x:'<path d="M6 6l12 12M18 6L6 18"/>',chev:'<path d="M9 6l6 6-6 6"/>',check:'<path d="M5 12.5l4.5 4.5L19 7.5"/>',
 eye:'<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>',
 bell:'<path d="M6 16.5V11a6 6 0 0112 0v5.5l1.5 2h-15z"/><path d="M10 21h4"/>',
 pin:'<path d="M12 21s6.5-5.4 6.5-10.5a6.5 6.5 0 00-13 0C5.5 15.6 12 21 12 21z"/><circle cx="12" cy="10.5" r="2.3"/>',
 star:'<path d="M12 4l2.4 5 5.4.7-4 3.8 1 5.4L12 16.3 7.2 18.9l1-5.4-4-3.8 5.4-.7z"/>',
 link:'<path d="M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7l1-1"/>',
 bowl:'<path d="M4 11h16a8 8 0 01-16 0z"/><path d="M8 7.5c0-1.4 1-1.4 1-2.8M13 7.5c0-1.4 1-1.4 1-2.8"/>',
 info:'<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5M12 8v.5"/>'
};
var ic=function(n,c){return '<svg viewBox="0 0 24 24" aria-hidden="true"'+(c?' class="'+c+'"':'')+'>'+(P[n]||"")+'</svg>'};

/* ---------- sample world (11 Oct 2026, 9:15 am; last visit Sat 6:40 pm) ---------- */
var NOW=9*60+15, LAST=-1440+18*60+40;
var PEOPLE={arjan:{n:"Arjan",i:"A",admin:1},sam:{n:"Sam",i:"S"}};
var ACT={arjan:{n:"Arjan",i:"A",k:"person"},sam:{n:"Sam",i:"S",k:"person"},"cl-a":{n:"Claude",i:"C",k:"ai",of:"arjan"},"cl-s":{n:"Claude",i:"C",k:"ai",of:"sam"},shop:{n:"Shopper link",i:"L",k:"visitor"}};
/* Event fields = the FIELD CATALOGUE in docs/knowledge/history-option-d.md:
   d day offset, t time, w actor, via, x text (*bold* = the subject), ar area, app, pl place, ch [field,from,to], sc h|a|p (scope), o owner of a personal event,
   to second person a personal event is for, aff {person: highlight line}, act highlight action, words (their own words), undo, rev (needs review), kids (cook session lines). */
var EV=[
{id:"e1",d:0,t:"08:12",w:"sam",via:"app",x:"used up *milk*",ar:"Pantry",app:"kitchie",pl:"Fridge",ch:["Amount","about half","none"],sc:"h",undo:1,aff:{arjan:"Milk ran out, so it is on the list now."},act:["Open list"]},
{id:"e2",d:0,t:"07:40",w:"sam",via:"app",x:"moved *spinach* to the Crisper",ar:"Pantry",app:"kitchie",pl:"Crisper",ch:["Spot","Fridge shelf","Crisper"],sc:"h",undo:1},
{id:"e3",d:0,t:"07:02",w:"cl-s",via:"claude",x:"set the use-by of *yoghurt* to 14 Oct",ar:"Pantry",app:"kitchie",pl:"Fridge",ch:["Use-by","12 Oct","14 Oct"],sc:"h",words:"the yoghurt is fine for two more days",undo:1},
{id:"e4",d:1,t:"21:05",w:"cl-s",via:"claude",x:"planned *Egg fried rice* for Monday dinner",ar:"Plan",app:"kitchie",pl:"",ch:["Mon dinner","empty","Egg fried rice"],sc:"h",words:"put the egg fried rice on Monday",undo:1,aff:{arjan:"Monday dinner is Egg fried rice, planned by Sam's assistant."},act:["Open plan"]},
{id:"e5",d:1,t:"19:44",w:"cl-s",via:"claude",x:"saved a try of *Egg fried rice*: less soy",ar:"Versions",app:"recipe",pl:"",ch:["Soy sauce","2 tbsp","1 tbsp"],sc:"h",words:"that worked well, save it",rev:1,undo:1,aff:{arjan:"A new try of your usual Egg fried rice is waiting for review."},act:["Review"]},
{id:"e6",d:1,t:"19:30",w:"sam",via:"app",x:"cooked *Egg fried rice*, used 5 items",ar:"Cooking",app:"kitchie",pl:"",sc:"h",kids:["Rice, 200 g","Eggs, 3","Peas, 50 g","Onion, 1","Spring onion, 1 bunch"],undo:1},
{id:"e22",d:1,t:"21:30",w:"arjan",via:"app",x:"moved *rice* to the Cupboard",ar:"Pantry",app:"kitchie",pl:"Cupboard",ch:["Location","Pantry shelf","Cupboard"],sc:"h",undo:1,aff:{sam:"Rice moved to the Cupboard. It is not on the Pantry shelf any more."},act:["Open it"]},
{id:"e7",d:1,t:"18:20",w:"shop",via:"shopper-link",x:"ticked off 6 of 8 lines on the shopping list",ar:"Shopping",app:"kitchie",pl:"",sc:"h",kids:["Bananas","Oat milk","Basmati rice","Spinach","Yoghurt","Coriander"],aff:{arjan:"Someone shopping got 6 of 8 lines. 2 are still open.",sam:"Someone shopping got 6 of 8 lines. 2 are still open."},act:["Open list"]},
{id:"e8",d:1,t:"17:50",w:"arjan",via:"voice",x:"added *12 eggs* to the Fridge",ar:"Pantry",app:"kitchie",pl:"Fridge",ch:["Amount","none","12"],sc:"h",words:"I just bought a dozen eggs, put them in the fridge",undo:1,aff:{sam:"12 eggs are in the Fridge now."}},
{id:"e9",d:1,t:"12:10",w:"arjan",via:"app",x:"put *paneer* on the shopping list",ar:"Shopping",app:"kitchie",pl:"",sc:"h",undo:1,aff:{sam:"Paneer is on the list. You corrected its amount on Wednesday."}},
{id:"e10",d:1,t:"09:30",w:"sam",via:"app",x:"voted up *Lentil dal*",ar:"Stars and votes",app:"recipe",sc:"p",o:"sam"},
{id:"e11",d:1,t:"09:28",w:"sam",via:"app",x:"changed a personal preference: less coriander",ar:"Preferences",app:"kitchie",sc:"p",o:"sam"},
{id:"e12",d:2,t:"20:15",w:"arjan",via:"app",x:"cooked *Pasta with tomato*, used 3 items",ar:"Cooking",app:"kitchie",pl:"",sc:"h",kids:["Pasta, 250 g","Tinned tomato, 1","Onion, 1"],undo:1},
{id:"e13",d:2,t:"18:05",w:"arjan",via:"app",x:"edited *Lentil dal*: more cumin",ar:"Versions",app:"recipe",ch:["Cumin","1 tsp","2 tsp"],sc:"h",undo:1},
{id:"e14",d:2,t:"11:00",w:"sam",via:"app",x:"proposed a preference for Arjan: *less spicy at dinner*",ar:"Preferences",app:"kitchie",sc:"p",o:"arjan",to:"arjan",aff:{arjan:"Sam proposed a preference for you: less spicy at dinner. Waiting for you."},act:["Look"]},
{id:"e15",d:2,t:"09:12",w:"arjan",via:"app",x:"changed the household quiet hours to start at 10 pm",ar:"Preferences",app:"kitchie",ch:["Quiet hours start","9 pm","10 pm"],sc:"h",undo:1,aff:{sam:"The household quiet hours now start at 10 pm. Your own setting is unchanged."}},
{id:"e16",d:3,t:"19:00",w:"arjan",via:"app",x:"changed the use-by of *butter* to 14 Oct",ar:"Pantry",app:"kitchie",pl:"Fridge",ch:["Use-by","10 Oct","14 Oct"],sc:"h",undo:1},
{id:"e17",d:3,t:"17:40",w:"sam",via:"app",x:"removed *old chutney* from the Pantry",ar:"Pantry",app:"kitchie",pl:"Pantry",sc:"h",undo:1},
{id:"e18",d:3,t:"14:10",w:"cl-a",via:"claude",x:"added *Lentils, 1 kg* to the shopping list",ar:"Shopping",app:"kitchie",sc:"h",words:"we are out of lentils, add a kilo",undo:1},
{id:"e19",d:4,t:"21:00",w:"sam",via:"app",x:"linked an AI assistant to their account",ar:"Household",app:"kitchie",sc:"a"},
{id:"e20",d:4,t:"18:30",w:"arjan",via:"app",x:"checked the amount of *rice*: still about right",ar:"Pantry",app:"kitchie",pl:"Pantry",sc:"h"},
{id:"e21",d:4,t:"12:00",w:"sam",via:"app",x:"corrected *paneer*",ar:"Pantry",app:"kitchie",pl:"Fridge",ch:["Amount","200 g","250 g"],sc:"h",undo:1}
];
var MORE=[
{id:"m1",d:5,t:"19:20",w:"arjan",via:"app",x:"cooked *Lentil dal*, used 4 items",ar:"Cooking",app:"kitchie",sc:"h",kids:["Red lentils, 200 g","Onion, 1","Tomato, 2","Ginger, 1 piece"]},
{id:"m2",d:5,t:"10:00",w:"sam",via:"app",x:"added *saffron* to the Spice rack",ar:"Pantry",app:"kitchie",pl:"Spice rack",sc:"h"},
{id:"m3",d:6,t:"18:00",w:"cl-a",via:"claude",x:"saved *Lentil dal* with extra cumin as a try",ar:"Versions",app:"recipe",sc:"h",words:"keep that one"},
{id:"m4",d:7,t:"09:40",w:"arjan",via:"app",x:"put *Pasta with tomato* away",ar:"Versions",app:"recipe",sc:"h"},
{id:"m5",d:9,t:"20:10",w:"sam",via:"app",x:"starred *Egg fried rice*",ar:"Stars and votes",app:"recipe",sc:"p",o:"sam"}
];
var AREAS=["Pantry","Shopping","Plan","Cooking","Preferences","Versions","Stars and votes","Household"];
var AREAICON={Pantry:"jar",Shopping:"cart",Plan:"cal",Cooking:"pot",Preferences:"sliders",Versions:"book","Stars and votes":"star",Household:"users"};
var VIA={app:"",voice:"Voice",claude:"Assistant","shopper-link":"Shopper link"};

/* ---------- state ---------- */
var S={
 as:Q.get("as")==="sam"?"sam":"arjan", tab:Q.get("tab")||"house", q:Q.get("q")||"", toks:[], range:Q.get("range")||"recent",
 group:Q.get("group")==="time"?"time":"person", sel:Q.get("sel")||"", panel:Q.get("filters")==="1"?"filters":"", state:Q.get("state")||"",
 days:3, more:false, seen:LAST, sheet:false, searchOpen:!!Q.get("q"), nocues:false
};
if(!/^(mine|house|ai)$/.test(S.tab))S.tab="house";
["who","area","place"].forEach(function(k){if(Q.get(k))Q.get(k).split(",").forEach(function(v){S.toks.push({t:k,v:v})})});
try{var sv=localStorage.getItem("hx-tab");if(sv&&!Q.get("tab"))S.tab=sv}catch(e){}
if(S.state==="caught"){S.seen=NOW}
if(Q.get("sel"))S.panel="detail";
var wide=function(){return matchMedia("(min-width:1024px)").matches};
var me=function(){return S.as};

/* ---------- model ---------- */
function absMin(e){var p=e.t.split(":");return -e.d*1440+(+p[0])*60+(+p[1])}
function visible(e,p){ /* privacy and scope, D6 to D8 */
 if(e.sc==="h")return true;
 if(e.sc==="a")return !!PEOPLE[p].admin;
 if(e.sc==="p")return e.o===p||e.to===p;
 return false}
function isMineActor(e,p){var a=ACT[e.w];return e.w===p||(a.k==="ai"&&a.of===p)}
function pool(){return EV.concat(S.more||S.q||S.range==="month"?MORE:[]).sort(function(a,b){return absMin(b)-absMin(a)})}
function txt(e){return e.x.replace(/\*/g,"")}
function hay(e){return (txt(e)+" "+(e.pl||"")+" "+ACT[e.w].n+" "+(ACT[e.w].of?PEOPLE[ACT[e.w].of].n:"")+" "+(VIA[e.via]||"")+" "+(e.words||"")+" "+e.ar+" "+e.app+" "+(e.kids||[]).join(" ")).toLowerCase()}
function tabOK(e){
 var p=me();
 if(S.tab==="mine")return isMineActor(e,p)||(e.sc==="p"&&(e.o===p||e.to===p));
 if(S.tab==="ai")return ACT[e.w].k==="ai"&&(e.sc!=="p"||e.o===p);
 return e.sc!=="p"||false}
function personKey(e){var a=ACT[e.w];return a.k==="ai"?"ai:"+a.of:(a.k==="visitor"?"visitor":e.w)}
function tokOK(e){
 var h=hay(e);
 for(var i=0;i<S.toks.length;i++){var t=S.toks[i];
  if(t.t==="who"){ if(t.v==="ai"){if(ACT[e.w].k!=="ai")return false} else if(t.v==="voice"){if(e.via!=="voice")return false} else if(t.v==="visitor"){if(ACT[e.w].k!=="visitor")return false} else if(t.v==="me"){if(!isMineActor(e,me()))return false} else if(e.w!==t.v&&!(ACT[e.w].of===t.v&&false))return false}
  else if(t.t==="area"&&e.ar!==t.v)return false;
  else if(t.t==="place"&&(e.pl||"")!==t.v)return false;
  else if(t.t==="app"&&e.app!==t.v)return false;
  else if(t.t==="aff"&&!(e.aff&&e.aff[me()]))return false;
  else if(t.t==="text"&&h.indexOf(t.v.toLowerCase())<0)return false}
 if(S.q&&h.indexOf(S.q.toLowerCase())<0)return false;
 return true}
function rangeOK(e){var m=absMin(e);
 if(S.range==="since")return m>S.seen;
 if(S.range==="today")return e.d===0;
 if(S.range==="week")return e.d<=7;
 return true}
function list(){return pool().filter(function(e){return visible(e,me())&&tabOK(e)&&tokOK(e)&&rangeOK(e)})}
function hidden(){ /* private items of other people, counted per day and person, never shown (D7) */
 var o={};pool().forEach(function(e){if(e.sc==="p"&&e.o!==me()&&e.to!==me()){var k=e.d+"|"+e.o;o[k]=(o[k]||0)+1}});return o}
function hiddenTotal(){var H=hidden();return Object.keys(H).reduce(function(s,k){return s+H[k]},0)}
function newCount(arr){return arr.filter(function(e){return absMin(e)>S.seen}).length}
function hlList(){return pool().filter(function(e){return visible(e,me())&&absMin(e)>S.seen&&e.aff&&e.aff[me()]})}
function dayLabel(d){var names=["Sun","Sat","Fri","Thu","Wed","Tue","Mon","Sun","Sat","Fri","Thu"];var dn=11-d;
 return {a:d===0?"Today":d===1?"Yesterday":names[d]+" "+dn+" Oct",b:d<2?names[d]+" "+dn+" Oct":""}}
function fmt(t){var p=t.split(":"),h=+p[0];return (h%12||12)+":"+p[1]+(h<12?" am":" pm")}
function sub(s){return esc(s).replace(/\*([^*]+)\*/g,"<b>$1</b>")}
function who(e){var a=ACT[e.w];if(a.k==="ai")return (a.of===me()?"Claude, for you":"Claude, for "+PEOPLE[a.of].n);if(a.k==="visitor")return "Someone shopping";return e.w===me()?"You":a.n}
function avatar(e,small){var a=ACT[e.w];var cls="av"+(small?" sm":"")+(a.k==="ai"?" ai":(e.w===me()?" me":""));
 return '<span class="'+cls+'" aria-hidden="true">'+(a.k==="ai"?ic("spark","sm"):a.k==="visitor"?ic("link","sm"):a.i)+'</span>'}

/* ---------- render ---------- */
function evRow(e){
 var a=ACT[e.w],m=[];
 if(a.k==="ai")m.push('<span class="chip ai">'+ic("spark","sm")+'Assistant</span>');
 if(e.via==="voice")m.push('<span class="chip ai">'+ic("mic","sm")+'Voice</span>');
 if(e.via==="shopper-link")m.push('<span class="chip">'+ic("link","sm")+'No sign-in</span>');
 if(e.sc==="p")m.push('<span class="chip">'+ic("lock","sm")+(e.o===me()?'Only you':'For you')+'</span>');
 if(e.sc==="a")m.push('<span class="chip">'+ic("lock","sm")+'Admins</span>');
 if(e.rev)m.push('<span class="chip rv">To review</span>');
 if(e.aff&&e.aff[me()]&&absMin(e)>S.seen)m.push('<span class="chip me">Affects you</span>');
 if(e.pl)m.push('<span class="chip">'+ic("pin","sm")+esc(e.pl)+'</span>');
 m.push('<span>'+ic(AREAICON[e.ar]||"clock","sm")+' '+esc(e.ar)+' · '+(e.app==="recipe"?"Recipe":"Kitchie")+'</span>');
 var who2=S.group==="time"||S.tab==="mine"?'<b>'+esc(who(e))+'</b> ':"";
 var t=sub(e.x);
 if(S.group==="person"&&S.tab!=="mine")t=t.charAt(0).toUpperCase()+t.slice(1);
 return '<button type="button" class="ev'+(absMin(e)>S.seen?" new":"")+'" data-id="'+e.id+'"'+(S.sel===e.id?' aria-current="true"':'')+'>'+
  (S.group==="time"||S.tab==="mine"?avatar(e,1):"")+'<div class="tx">'+who2+t+(e.kids&&e.kids.length<=0?"":"")+'<div class="meta">'+m.join("")+'</div></div><time>'+fmt(e.t)+'</time></button>'}
function pgHead(key,evs,hid){
 var e=evs[0],a=ACT[e.w];
 var name=a.k==="ai"?"Claude · "+(a.of===me()?"your link":PEOPLE[a.of].n+"'s link"):a.k==="visitor"?"Someone shopping · link":(e.w===me()?"You":a.n);
 return '<div class="who">'+avatar(e)+'<div><b>'+esc(name)+'</b><br>'+evs.length+(evs.length===1?" thing":" things")+'</div>'+(hid?'<span class="priv">'+ic("lock","sm")+hid+' private, hidden</span>':'')+'</div>'}
function feed(){
 var L=list(),H=hidden(),out="";
 if(S.state==="empty"||(!EV.length)){return emptyState("empty")}
 if(!L.length){return S.q||S.toks.length||S.range!=="recent"?emptyState("zero"):emptyState(S.tab==="mine"?"mineEmpty":"empty")}
 if(S.state==="caught"&&S.range==="recent"&&false){}
 /* window rule (Proposal D3): the last N days that have entries, 3 by default, 5 more per press. Search and ranges ask the server for their own window. */
 var byDay={},order=[];
 L.forEach(function(e){if(!byDay[e.d]){byDay[e.d]=[];order.push(e.d)}byDay[e.d].push(e)});
 var windowed=(S.range==="recent"&&!S.q&&!S.toks.length);
 var shown=windowed?order.slice(0,S.days):order;
 shown.forEach(function(d){
  var evs=byDay[d],lb=dayLabel(d),nc=newCount(evs);
  out+='<section class="day" aria-label="'+esc(lb.a)+'"><div class="lbl">'+esc(lb.a)+(lb.b?' <small>'+lb.b+'</small>':'')+(nc?' <small>· '+nc+' new</small>':'')+'</div>';
  if(S.group==="time"||S.tab==="mine"){out+='<div class="pg">'+evs.map(evRow).join("")+'</div>'}
  else{var gs={},go=[];evs.forEach(function(e){var k=personKey(e);if(!gs[k]){gs[k]=[];go.push(k)}gs[k].push(e)});
   go.forEach(function(k){var h=0;if(S.tab==="house"&&k.indexOf("ai:")!==0&&k!=="visitor"&&k!==me())h=H[d+"|"+k]||0;
    out+='<div class="pg">'+pgHead(k,gs[k],h)+gs[k].map(evRow).join("")+'</div>'})}
  out+='</section>'});
 if(windowed&&order.length>S.days)out+='<div class="more"><button type="button" class="sec2" data-more>Show 5 more days <span class="kbd">M</span></button></div><p class="note">Older days load only when you ask.</p>';
 else if(windowed)out+='<div class="more"><button type="button" class="sec2" data-older>Look further back</button></div><p class="note">That is everything loaded. Looking further back asks the server for 30 days.</p>';
 return out}
function emptyState(k){
 var m={
  empty:['bowl','A quiet kitchen so far','Add a jar of something or cook a meal and it lands here, with who did it.','<button class="pri" data-act="plain">See a lively kitchen</button>'],
  mineEmpty:['bowl','Nothing from you yet this week','Your own changes, your assistant\'s and your votes show here.','<button class="sec2" data-tab="house">See the household</button>'],
  zero:['search','Nothing matches',"",""]
 }[k];
 if(k==="zero"){
  var what=[];if(S.q)what.push('“'+esc(S.q)+'”');S.toks.forEach(function(t){what.push(esc(tokLabel(t)))});
  var range={recent:"the last 3 days with entries",since:"since you were last here",today:"today",week:"the last 7 days",month:"the last 30 days"}[S.range];
  return '<div class="empty"><div class="big">'+ic("search")+'</div><h2>Nothing matches '+(what.length?what.join(" + "):"")+'</h2><p>Nothing in '+range+'. Try a wider time range or fewer filters. Nothing is deleted; it may simply not have happened.</p><div class="acts">'+(S.range!=="month"?'<button class="pri" data-range="month">Search 30 days</button>':'')+'<button class="sec2" data-clear>Clear filters</button></div><p class="searched">Searched: '+esc(tabName(S.tab))+', '+range+', '+(S.toks.length?S.toks.length+' filters':'all areas')+'. '+(S.tab==="house"?'Private changes are never searched.':'')+'</p></div>'}
 return '<div class="empty"><div class="big">'+ic(m[0])+'</div><h2>'+m[1]+'</h2><p>'+m[2]+'</p><div class="acts">'+m[3]+'</div></div>'}
function tabName(t){return {mine:"My activity",house:"Household",ai:"Assistants"}[t]}
function tokLabel(t){return {who:{ai:"Assistants",voice:"By voice",visitor:"Shopper link",me:"You"}[t.v]||(PEOPLE[t.v]?PEOPLE[t.v].n:t.v),area:t.v,place:t.v,app:t.v==="recipe"?"Recipe":"Kitchie",aff:"Affects me",text:t.v}[t.t]||t.v}
function tokKind(t){return {who:"Who",area:"Area",place:"Where",app:"App",aff:"",text:"Text"}[t.t]}

function catchCard(){
 var hl=hlList(),all=pool().filter(function(e){return visible(e,me())&&absMin(e)>S.seen&&e.sc!=="p"||(e.sc==="p"&&(e.o===me()||e.to===me())&&absMin(e)>S.seen)});
 var by={};all.forEach(function(e){var k=ACT[e.w].k==="ai"?"assistants":(e.w===me()?"you":ACT[e.w].n);by[k]=(by[k]||0)+1});
 var parts=Object.keys(by).map(function(k){return by[k]+" by "+(k==="you"?"you":k==="assistants"?"assistants":k)});
 var lastTxt="Sat 10 Oct, 6:40 pm";
 if(!all.length||S.seen>=NOW)return '<section class="catch" aria-label="Since you were last here"><h2>'+ic("check")+'You are all caught up</h2><p class="sum">Nothing new since you looked at '+(S.seen>=NOW?"just now":lastTxt)+'. Enjoy the quiet.</p></section>';
 var rows=hl.slice(0,4).map(function(e){var ac=(e.act||[])[0];
  return '<div class="hl"><span class="ico">'+ic(e.rev?"book":e.w==="shop"?"cart":ACT[e.w].k==="ai"?"spark":"bell")+'</span><div class="tx">'+esc(e.aff[me()])+'<small>'+esc(who(e))+' · '+dayLabel(e.d).a.toLowerCase()+', '+fmt(e.t)+'</small></div>'+(ac?'<button type="button" class="go" data-open="'+e.id+'">'+esc(ac)+'</button>':'')+'</div>'}).join("");
 return '<section class="catch" aria-label="Since you were last here"><h2>'+ic("bell")+'Since you were last here</h2><p class="sum">'+esc(lastTxt)+' · '+all.length+' changes'+(parts.length?': '+esc(parts.join(", ")):"")+'</p>'+
  (hl.length?'<div class="lbl2" style="font-size:12px;letter-spacing:.08em;text-transform:uppercase;font-weight:700;color:var(--accent);margin-bottom:2px">Affects you · '+hl.length+'</div>'+rows+(hl.length>4?'<p class="note" style="text-align:left">and '+(hl.length-4)+' more in the feed, marked Affects you.</p>':''):'<p class="sum">Nothing changed that touches you.</p>')+
  '<div class="foot"><button type="button" class="pri" data-caught>'+ic("check")+' Mark as caught up <span class="kbd keep" style="color:inherit;border-color:currentColor;background:none">C</span></button>'+(hl.length?'<button type="button" class="lnk2" data-aff>Show only these</button>':'')+'</div></section>'}

function filtersPanel(){
 var base=pool().filter(function(e){return visible(e,me())&&tabOK(e)});
 var cnt=function(f){return base.filter(f).length};
 var has=function(t,v){return S.toks.some(function(x){return x.t===t&&x.v===v})};
 var pill=function(t,v,l,c,ico){return '<button type="button" class="pl'+(c?'':' zero')+'" aria-pressed="'+has(t,v)+'" data-tok="'+t+'|'+v+'">'+(ico?ic(ico,"sm"):"")+esc(l)+' <span class="ct">'+c+'</span></button>'};
 var places={};base.forEach(function(e){if(e.pl)places[e.pl]=(places[e.pl]||0)+1});
 var g=function(l,s,b){return '<div class="fg"><div class="lbl">'+l+(s?' <small>'+s+'</small>':'')+'</div><div class="pills">'+b+'</div></div>'};
 var rng=[["recent","Recent"],["since","Since last visit"],["today","Today"],["week","7 days"],["month","30 days"]];
 return '<div class="grab"></div><div class="ph"><h2>Filter history</h2><button type="button" class="ib" data-close aria-label="Close filters (Ctrl Esc)">'+ic("x")+'</button></div>'+
  g("When","one",rng.map(function(r){return '<button type="button" class="pl" aria-pressed="'+(S.range===r[0])+'" data-range="'+r[0]+'">'+r[1]+'</button>'}).join(""))+
  g("Who","combine with OR",
   pill("who","me","Me and my assistant",cnt(function(e){return isMineActor(e,me())}),"user")+
   (me()==="arjan"?pill("who","sam","Sam",cnt(function(e){return e.w==="sam"}),"user"):pill("who","arjan","Arjan",cnt(function(e){return e.w==="arjan"}),"user"))+
   pill("who","ai","Assistants",cnt(function(e){return ACT[e.w].k==="ai"}),"spark")+
   pill("who","voice","By voice",cnt(function(e){return e.via==="voice"}),"mic")+
   pill("who","visitor","Shopper link",cnt(function(e){return ACT[e.w].k==="visitor"}),"link"))+
  g("Area","",AREAS.map(function(a){return pill("area",a,a,cnt(function(e){return e.ar===a}),AREAICON[a])}).join(""))+
  g("App","",pill("app","kitchie","Kitchie",cnt(function(e){return e.app==="kitchie"}),"jar")+pill("app","recipe","Recipe",cnt(function(e){return e.app==="recipe"}),"book"))+
  g("Where","places",Object.keys(places).map(function(p){return pill("place",p,p,places[p],"pin")}).join(""))+
  g("Touches me","",pill("aff","aff","Affects me",cnt(function(e){return e.aff&&e.aff[me()]}),"bell"))+
  '<div class="acts2"><button type="button" class="sec2" data-clear>Clear all</button><button type="button" class="pri" data-close>'+ic("check")+' Done</button></div>'+
  '<p class="rule">'+ic("info","sm")+'<span>Counts are of what is already loaded for this tab. Picking a time range wider than Recent asks the server for that window.</span></p>'}

function detailPanel(){
 var e=EV.concat(MORE).filter(function(x){return x.id===S.sel})[0];
 if(!e)return filtersOrCatch();
 var a=ACT[e.w],how=a.k==="ai"?"Claude, using "+(a.of===me()?"your":PEOPLE[a.of].n+"'s")+" link":e.via==="voice"?"By voice, through the assistant":e.via==="shopper-link"?"One-off shopper link, no sign-in":"In the app";
 var scope=e.sc==="h"?"Everyone in Our kitchen":e.sc==="a"?"Admins only":(e.o===me()?"Only you":"Only "+PEOPLE[e.o].n+(e.to?" (proposed by "+PEOPLE[e.w].n+")":""));
 var own=(e.w===me()||(a.k==="ai"&&a.of===me()));
 return '<div class="grab"></div><div class="ph"><h2>'+ic(AREAICON[e.ar]||"clock")+' What happened</h2><button type="button" class="ib" data-close aria-label="Close (Ctrl Esc)">'+ic("x")+'</button></div>'+
  '<p style="color:var(--fg);font-size:17px;line-height:1.35"><b>'+esc(who(e))+'</b> '+sub(e.x)+'</p>'+
  (e.ch?'<div class="chg"><span class="chip">'+esc(e.ch[0])+'</span><s>'+esc(e.ch[1])+'</s>'+ic("chev","sm")+'<b>'+esc(e.ch[2])+'</b></div>':'')+
  (e.kids?'<ul class="kids">'+e.kids.map(function(k){return '<li>'+esc(k)+'</li>'}).join("")+'</ul>':'')+
  (e.words?'<div class="say"><small>'+(a.k==="ai"?"What "+(a.of===me()?"you":PEOPLE[a.of].n)+" said to the assistant":"Their words")+'</small>“'+esc(e.words)+'”</div>':'')+
  '<dl class="dl"><dt>When</dt><dd>'+esc(dayLabel(e.d).a)+(e.d>1?"":" · "+dayLabel(e.d).b)+', '+fmt(e.t)+'</dd><dt>How</dt><dd>'+esc(how)+'</dd><dt>Where</dt><dd>'+esc((e.app==="recipe"?"Recipe":"Kitchie")+" · "+e.ar+(e.pl?" · "+e.pl:""))+'</dd><dt>Who sees it</dt><dd>'+esc(scope)+'</dd></dl>'+
  '<div class="acts2">'+(e.rev?'<button class="pri" data-toast="Mockup: opens the review of the try">Review this try</button>':'')+
  (e.undo?'<button class="sec2" data-undo="'+e.id+'">'+ic("undo","sm")+' Undo <span class="kbd">Z</span></button>':'')+
  '<button class="sec2" data-toast="Mockup: opens the item or recipe">Open it</button>'+
  (e.ar!=="Household"?'<button class="sec2" data-textq="'+esc(txt(e).split(" ").slice(-1)[0])+'">All history of this</button>':'')+'</div>'+
  '<p class="rule">'+ic("undo","sm")+'<span>An undo is saved as a new entry; nothing is rewritten. '+(e.undo?(own?'You did this, so you can undo it.':'Anyone in the household may undo a household change. '+esc(who(e))+' is told.'):'This one has no undo.')+'</span></p>'}
function filtersOrCatch(){return '<div class="grab"></div>'+catchCard()+scopeCard()}
function scopeCard(){
 var adm=PEOPLE[me()].admin,hn=hiddenTotal();
 return '<div class="rule">'+ic("lock","sm")+'<span>'+(adm?'You are an <b>admin</b>: you also see members joining, leaving and linking assistants. ':'You see the household\'s changes. Admin-only items (members, assistant links) are not shown to you. ')+'Other people\'s personal changes ('+hn+' this week) stay private for everyone, admins too.</span></div>'}

function railHtml(){
 var it=[["home","Home"],["jar","Pantry"],["cal","Plan"],["book","Recipes"],["cart","Shopping"],["clock","History"]];
 return '<div class="brand">Kitchie</div>'+it.map(function(i){return '<a href="#" data-rail aria-label="'+i[1]+'"'+(i[1]==="History"?' aria-current="page"':'')+'>'+ic(i[0])+'<span>'+i[1]+'</span></a>'}).join("")}

function sorterBar(){
 return '<div class="sorter"><span>'+(S.tab==="mine"?"Newest first":"Newest first, grouped by "+(S.group==="person"?"person":"time"))+'</span>'+(S.tab==="mine"?'':'<div class="seg" role="group" aria-label="Group by"><button type="button" aria-pressed="'+(S.group==="person")+'" data-group="person">By person</button><button type="button" aria-pressed="'+(S.group==="time")+'" data-group="time">By time</button></div>')+'</div>'}
function tokBar(){
 var h='';if(S.range!=="recent")h+='<button type="button" class="tok" data-range="recent"><i>When</i> '+{since:"Since last visit",today:"Today",week:"7 days",month:"30 days"}[S.range]+'<span class="x">'+ic("x","sm")+'</span></button>';
 S.toks.forEach(function(t,i){h+='<button type="button" class="tok" data-rm="'+i+'"><i>'+tokKind(t)+'</i> '+esc(tokLabel(t))+'<span class="x">'+ic("x","sm")+'</span></button>'});
 return h?'<div class="toks" aria-label="Active filters">'+h+'</div>':""}
function counts(){var o={};["mine","house","ai"].forEach(function(t){var keep=S.tab;S.tab=t;var q=S.q,rg=S.range;o[t]=pool().filter(function(e){return visible(e,me())&&tabOK(e)&&absMin(e)>S.seen}).length;S.tab=keep});return o}

function render(){
 var c=counts(),root=$("#hx");
 var ntok=S.toks.length+(S.range!=="recent"?1:0);
 var scopeTxt=PEOPLE[me()].admin?'You see <b>everything the household did</b>, plus admin items. Personal changes of others stay private.':'You see <b>what the household did</b>. Personal changes of others stay private.';
 root.innerHTML='<nav class="hx-rail" aria-label="Main">'+railHtml()+'</nav>'+
 '<main class="hx-main"><header class="hx-head"><h1>History</h1><button type="button" class="ib sbtn" data-searchtoggle aria-label="Search history" aria-pressed="'+S.searchOpen+'">'+ic("search")+'</button><button type="button" class="ib'+(S.panel==="filters"?" on":"")+'" data-filters aria-label="Filters (F)">'+ic("sliders")+(ntok?'<span class="n">'+ntok+'</span>':'')+'</button></header>'+
 '<div class="hx-search'+(S.searchOpen?" open":"")+'"><div class="box">'+ic("search")+'<input id="q" type="search" autocomplete="off" placeholder="Search: a person, a place, an item…" value="'+esc(S.q)+'" aria-label="Search history" aria-autocomplete="list"><span class="kbd">/</span><button type="button" data-qclear aria-label="Clear search"'+(S.q?'':' hidden')+'>'+ic("x","sm")+'</button></div><div class="sug" id="sug" role="listbox"></div></div>'+
 '<div class="hx-tabs" role="tablist" aria-label="Whose activity">'+[["mine","My activity",ic("user","sm")],["house","Household",ic("users","sm")],["ai","Assistants",ic("spark","sm")]].map(function(t,i){return '<button type="button" role="tab" aria-selected="'+(S.tab===t[0])+'" data-tab="'+t[0]+'">'+t[2]+t[1]+(c[t[0]]?' <span class="c">'+c[t[0]]+'</span>':'')+'</button>'}).join("")+'</div>'+
 '<div class="scope">'+ic("lock","sm")+'<span>'+scopeTxt+'</span></div>'+
 (S.tab!=="ai"?catchCard():assistantsCard())+
 tokBar()+sorterBar()+'<div id="feed">'+feed()+'</div></main>'+
 '<aside class="hx-panel'+(S.panel&&(S.panel==="detail"||S.panel==="filters")?" open":"")+'" id="panel" aria-label="Details">'+panelHtml()+'</aside><div class="scrim'+(S.panel&&!wide()?" open":"")+'" data-close></div>';
 $("#panel").classList.toggle("open",!!S.panel||wide());
 if(!wide()&&!S.panel)$("#panel").classList.remove("open");
 bind();
 if(window.__pv)window.__pv.style.display=(S.panel&&!wide())?'none':'';
}
function panelHtml(){return S.panel==="filters"?filtersPanel():S.panel==="detail"?detailPanel():wide()?filtersOrCatch():""}
function assistantsCard(){
 var n=pool().filter(function(e){return ACT[e.w].k==="ai"&&visible(e,me())}).length;
 return '<section class="catch"><h2>'+ic("spark")+'Assistants in Our kitchen</h2><p class="sum">Every change an assistant makes is labelled, with the words it was given. Asking and looking are not logged here, only changes.</p>'+
 '<div class="hl"><span class="av ai">'+ic("spark","sm")+'</span><div class="tx"><b>Claude · '+(me()==="arjan"?"your link":"Arjan\'s link")+'</b><small>'+(me()==="arjan"?"Your default assistant":"Linked through sign-in")+'</small></div></div>'+
 '<div class="hl"><span class="av ai">'+ic("spark","sm")+'</span><div class="tx"><b>Claude · '+(me()==="sam"?"your link":"Sam\'s link")+'</b><small>Linked Wed 7 Oct</small></div></div>'+
 '<p class="sum" style="margin:var(--sp-2) 0 0">'+n+' changes in the window. Links are managed in Settings.</p></section>'}

/* ---------- behaviour ---------- */
var tmr;
function toast(t){var el=$("#toast");el.textContent=t;el.hidden=false;clearTimeout(tmr);tmr=setTimeout(function(){el.hidden=true},2200)}
function openPanel(m,id){S.panel=m;if(id)S.sel=id;render();if(!wide()&&m){}}
function closePanel(){S.panel="";S.sel="";render()}
function addTok(t,v){if(!S.toks.some(function(x){return x.t===t&&x.v===v}))S.toks.push({t:t,v:v})}
function setQ(v){S.q=v}
function suggest(v){
 var el=$("#sug");v=(v||"").trim().toLowerCase();
 if(!v){el.classList.remove("open");return}
 var out=[];
 Object.keys(PEOPLE).forEach(function(p){if(PEOPLE[p].n.toLowerCase().indexOf(v)===0)out.push(["who",p,"Person",PEOPLE[p].n,"user"])});
 if("assistant".indexOf(v)===0||"claude".indexOf(v)===0)out.push(["who","ai","Person","Assistants","spark"]);
 if("voice".indexOf(v)===0)out.push(["who","voice","Person","By voice","mic"]);
 AREAS.forEach(function(a){if(a.toLowerCase().indexOf(v)===0)out.push(["area",a,"Area",a,AREAICON[a]])});
 var pl={};EV.concat(MORE).forEach(function(e){if(e.pl)pl[e.pl]=1});Object.keys(pl).forEach(function(p){if(p.toLowerCase().indexOf(v)===0)out.push(["place",p,"Place",p,"pin"])});
 out.push(["text",v,"Text",'“'+v+'”',"search"]);
 el.innerHTML=out.slice(0,6).map(function(o,i){return '<button type="button" role="option" aria-selected="'+(i===0)+'" data-sug="'+o[0]+'|'+esc(o[1])+'">'+ic(o[4],"sm")+esc(o[3])+'<small>'+o[2]+'</small></button>'}).join("")+'<div class="hint">Pick one to filter by it, or press Enter to search the words.</div>';
 el.classList.add("open")}
function bind(){
 var root=$("#hx");
 var q=$("#q");
 if(q){q.addEventListener("input",function(){suggest(q.value);$("[data-qclear]").hidden=!q.value});
  q.addEventListener("keydown",function(ev){
   if(ev.key==="Enter"){ev.preventDefault();var s=$("#sug .open,#sug button[aria-selected=true]");var v=q.value.trim();
    if(v){S.q=v;S.toks=S.toks;render();setTimeout(function(){var x=$("#q");x&&x.focus()},0)}}
   else if(ev.key==="ArrowDown"){var b=$$("#sug button");var i=b.findIndex(function(x){return x.getAttribute("aria-selected")==="true"});if(b.length){ev.preventDefault();b.forEach(function(x){x.setAttribute("aria-selected","false")});b[Math.min(b.length-1,i+1)].setAttribute("aria-selected","true")}}
   else if(ev.key==="ArrowUp"){var b2=$$("#sug button");var i2=b2.findIndex(function(x){return x.getAttribute("aria-selected")==="true"});if(b2.length){ev.preventDefault();b2.forEach(function(x){x.setAttribute("aria-selected","false")});b2[Math.max(0,i2-1)].setAttribute("aria-selected","true")}}
   else if(ev.key==="Tab"&&$("#sug.open")){var sel=$("#sug button[aria-selected=true]");if(sel&&q.value){ev.preventDefault();sel.click()}}
   else if(ev.key==="Escape"){if(q.value){q.value="";S.q="";render()}else{q.blur()}}
  })}
 if(S.q&&S.searchOpen&&document.activeElement===document.body){/* keep focus where the person left it */}
}
document.addEventListener("click",function(ev){
 var t=ev.target.closest("button,a");if(!t)return;
 var d=t.dataset;
 if(d.railx!==undefined||t.hasAttribute("data-rail")){ev.preventDefault();toast("Mockup: other screens are not drawn here");return}
 if(d.tab){S.tab=d.tab;try{localStorage.setItem("hx-tab",S.tab)}catch(e){}render();return}
 if(d.id){var wasSel=S.sel===d.id;S.sel=d.id;S.panel="detail";render();if(!wide()){}return}
 if(d.open){S.sel=d.open;S.panel="detail";render();return}
 if(t.hasAttribute("data-close")){closePanel();return}
 if(t.hasAttribute("data-filters")){S.panel=S.panel==="filters"?"":"filters";S.sel="";render();return}
 if(t.hasAttribute("data-searchtoggle")){S.searchOpen=!S.searchOpen;render();if(S.searchOpen)$("#q").focus();return}
 if(t.hasAttribute("data-qclear")){S.q="";render();return}
 if(d.tok){var p=d.tok.split("|"),i=S.toks.findIndex(function(x){return x.t===p[0]&&x.v===p[1]});if(i>=0)S.toks.splice(i,1);else S.toks.push({t:p[0],v:p[1]});render();return}
 if(d.rm!==undefined){S.toks.splice(+d.rm,1);render();return}
 if(d.sug){var s=d.sug.split("|");if(s[0]==="text"){S.q=s[1]}else{addTok(s[0],s[1]);S.q=""}render();return}
 if(d.range){S.range=d.range;render();return}
 if(d.group){S.group=d.group;render();return}
 if(t.hasAttribute("data-clear")){S.toks=[];S.q="";S.range="recent";render();return}
 if(t.hasAttribute("data-more")){S.days+=5;render();return}
 if(t.hasAttribute("data-older")){S.more=true;S.range="month";render();toast("Fetched 30 days. Only asked for just now.");return}
 if(t.hasAttribute("data-caught")){S.seen=NOW;render();toast("Caught up. Next time starts from now.");return}
 if(t.hasAttribute("data-aff")){addTok("aff","aff");S.panel="";render();return}
 if(d.undo){var e=EV.filter(function(x){return x.id===d.undo})[0];e.undo=0;e.x="(undone) "+e.x;S.panel="";S.sel="";render();toast("Undone. Saved as a new entry, nothing was rewritten.");return}
 if(d.textq){S.q=d.textq;S.panel="";S.sel="";S.searchOpen=true;render();return}
 if(d.toast){toast(d.toast);return}
 if(d.act==="plain"){location.search="?";return}
 if(t.hasAttribute("data-pv")){$(".pv").classList.toggle("open");return}
 if(d.pvset){var k=d.pvset.split("=");var u=new URLSearchParams(location.search);u.set(k[0],k[1]);if(k[0]==="as")u.delete("sel");location.search=u.toString();return}
});
document.addEventListener("click",function(ev){var s=$("#sug");if(s&&!ev.target.closest(".hx-search"))s.classList.remove("open")});
/* keys (shortcut-cues.md): never while typing; Ctrl/Cmd+Esc closes; Shift+? opens the list */
var isMac=/Mac|iPhone|iPad/.test(navigator.platform||"");
document.addEventListener("keydown",function(ev){
 var tg=ev.target,typing=tg&&(tg.tagName==="INPUT"||tg.tagName==="TEXTAREA"||tg.isContentEditable);
 if(ev.key==="Escape"&&(ev.ctrlKey||ev.metaKey)){if($("#kb:not([hidden])")){$("#kb").hidden=true;return}if(S.panel&&(wide()?S.panel!=="":true)){ev.preventDefault();closePanel()}return}
 if(typing||ev.isComposing||ev.ctrlKey||ev.metaKey||ev.altKey)return;
 var k=ev.key;
 if(k==="?"){$("#kb").hidden=!$("#kb").hidden;S.nocues=false;document.body.classList.remove("nocues");ev.preventDefault();return}
 if(k==="/"){ev.preventDefault();S.searchOpen=true;if(!$(".hx-search.open"))render();$("#q").focus();return}
 if(k==="f"||k==="F"){S.panel=S.panel==="filters"?"":"filters";S.sel="";render();return}
 if(k==="1"||k==="2"||k==="3"){S.tab=["mine","house","ai"][+k-1];render();return}
 if(k==="c"||k==="C"){S.seen=NOW;render();toast("Caught up.");return}
 if(k==="g"||k==="G"){S.group=S.group==="person"?"time":"person";render();return}
 if(k==="j"||k==="k"||k==="J"||k==="K"||k==="ArrowDown"||k==="ArrowUp"){
  var rows=$$(".ev"),i=rows.findIndex(function(r){return r===document.activeElement||r.getAttribute("aria-current")==="true"});
  var n=(k==="j"||k==="J"||k==="ArrowDown")?Math.min(rows.length-1,i+1):Math.max(0,i-1);
  if(rows[n]){ev.preventDefault();var id=rows[n].dataset.id;if(S.panel==="detail"||wide()){S.sel=id;S.panel="detail";render();var r2=$('.ev[data-id="'+id+'"]');r2&&r2.focus();r2&&r2.scrollIntoView({block:"nearest"})}else rows[n].focus()}
  return}
 if(k==="z"||k==="Z"){var e=EV.filter(function(x){return x.id===S.sel})[0];if(e&&e.undo){e.undo=0;e.x="(undone) "+e.x;S.panel="";S.sel="";render();toast("Undone. Saved as a new entry.")}return}
});
function pvHtml(){
 var opt=function(g,v,l,on){return '<button type="button" class="pl" aria-pressed="'+on+'" data-pvset="'+g+'='+v+'">'+l+'</button>'};
 return '<button type="button" data-pv>Preview</button><div class="pop"><h3>Viewing as</h3><div class="pills">'+opt("as","arjan","Arjan (admin)",S.as==="arjan")+opt("as","sam","Sam (member)",S.as==="sam")+'</div>'+
 '<h3>State</h3><div class="pills">'+opt("state","","Lively",!S.state)+opt("state","caught","Caught up",S.state==="caught")+opt("state","empty","New household",S.state==="empty")+'</div><h3>Try</h3><div class="pills">'+opt("q","saffron","Search: saffron (older)",false)+opt("q","zzz","Search: nothing found",false)+'</div></div>'}
var pv=document.createElement("div");pv.className="pv";pv.innerHTML=pvHtml();document.body.appendChild(pv);window.__pv=pv;
var kb=document.createElement("div");kb.className="kb";kb.id="kb";kb.hidden=true;
var M=isMac?"⌘":"Ctrl";
kb.innerHTML='<div class="kbc" role="dialog" aria-label="Shortcuts"><div class="kbh"><h2>History shortcuts</h2><button class="x" type="button" onclick="document.getElementById(\'kb\').hidden=true" aria-label="Close">×</button></div><div class="kbg"><div class="kbs"><h3>On this screen</h3>'+
 [["/","Search"],["F","Filters"],["1 2 3","My activity, Household, Assistants"],["J K","Next, previous entry (opens it)"],["G","Group by person or by time"],["C","Mark as caught up"],["Z","Undo the open entry"]].map(function(r){return '<div class="kbr"><span class="kk"><kbd>'+r[0]+'</kbd></span><span>'+r[1]+'</span></div>'}).join("")+
 '</div><div class="kbs"><h3>Anywhere</h3>'+[["Shift ?","This list"],[M+" Esc","Close the open panel"],["Esc","Clear the search box"],["Tab","Move on"]].map(function(r){return '<div class="kbr"><span class="kk"><kbd>'+r[0]+'</kbd></span><span>'+r[1]+'</span></div>'}).join("")+'</div></div></div>';
document.body.appendChild(kb);
var to=document.createElement("div");to.className="toast";to.id="toast";to.hidden=true;to.setAttribute("role","status");document.body.appendChild(to);
document.addEventListener("click",function(ev){if(ev.target===kb)kb.hidden=true});
window.addEventListener("resize",function(){clearTimeout(window.__r);window.__r=setTimeout(render,120)});
render();
})();
