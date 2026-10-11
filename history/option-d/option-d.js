/* History, Option D (revised to the owner's locked decisions H4 to H10, 11 Oct 2026): catch-up feed, last five, structured filters. No typed search, no Assistants. Mockup data and rendering. Plain names that exist only for the sample live here, not in the stylesheet.
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

/* ---------- sample world (Sun 11 Oct 2026, 9:15 am) ---------- */
var NOW=9*60+15;
var LASTV={wed:{v:-4*1440+18*60+40,t:"Wed 7 Oct, 6:40 pm"},sat:{v:-1440+18*60+40,t:"Sat 10 Oct, 6:40 pm"}};
var CAP=2; /* H6: three days = today and the two days before (Proposal: calendar days, not 72 hours) */
var PEOPLE={arjan:{n:"Arjan",i:"A",admin:1},sam:{n:"Sam",i:"S"}};
/* actor = a person (H10). An assistant's action is stored under the person it acted for. "shop" is the one-off shopper link: a visitor, not an assistant. */
var ACT={arjan:{n:"Arjan",i:"A",k:"person"},sam:{n:"Sam",i:"S",k:"person"},shop:{n:"Shopper link",i:"L",k:"visitor"}};
/* Event fields = the FIELD CATALOGUE in docs/knowledge/history-option-d.md:
   d day offset, t time, w actor (a person), x text (*bold* = the subject), ar area, app, pl place, sc h|a|p (scope), o owner of a personal event, to second person,
   aff {person: highlight line}, act highlight action label, rev needs review, go option C scope to open (history/option-c/?scope=). */
var EV=[
{id:"e1",d:0,t:"08:12",w:"sam",x:"used up *Green tea*",ar:"Pantry",app:"kitchie",pl:"Pantry",sc:"h",go:"item:tea",aff:{arjan:"Green tea ran out, so it is on the list now."},act:"Open list"},
{id:"e2",d:0,t:"07:40",w:"sam",x:"moved *Frozen peas* to Drawer 2",ar:"Pantry",app:"kitchie",pl:"Freezer",sc:"h",go:"item:peas"},
{id:"e3",d:0,t:"07:02",w:"sam",x:"set the use-by of *Eggs* to 14 Oct",ar:"Pantry",app:"kitchie",pl:"Fridge",sc:"h",go:"item:eggs"},
{id:"e4",d:1,t:"21:05",w:"sam",x:"planned *Egg fried rice* for Monday dinner",ar:"Plan",app:"kitchie",sc:"h",go:"recipe:fried-rice",aff:{arjan:"Monday dinner is Egg fried rice, planned by Sam."},act:"Open plan"},
{id:"e22",d:1,t:"21:30",w:"arjan",x:"moved *Basmati rice* to the Top shelf",ar:"Pantry",app:"kitchie",pl:"Pantry",sc:"h",go:"item:rice",aff:{sam:"Basmati rice moved to the Top shelf. It is not in the Door any more."},act:"Open it"},
{id:"e5",d:1,t:"19:44",w:"sam",x:"saved a try of *Egg fried rice*: less soy",ar:"Versions",app:"recipe",sc:"h",rev:1,go:"recipe:fried-rice",aff:{arjan:"A new try of your usual Egg fried rice is waiting for review."},act:"Review"},
{id:"e6",d:1,t:"19:30",w:"sam",x:"cooked *Egg fried rice*, used 5 items",ar:"Cooking",app:"kitchie",sc:"h",go:"recipe:fried-rice"},
{id:"e7",d:1,t:"18:20",w:"shop",x:"ticked off 6 of 8 lines on the shopping list",ar:"Shopping",app:"kitchie",sc:"h",go:"all:",aff:{arjan:"Someone shopping got 6 of 8 lines. 2 are still open.",sam:"Someone shopping got 6 of 8 lines. 2 are still open."},act:"Open list"},
{id:"e8",d:1,t:"17:50",w:"arjan",x:"added *12 Eggs* to the Fridge",ar:"Pantry",app:"kitchie",pl:"Fridge",sc:"h",go:"item:eggs",aff:{sam:"12 eggs are in the Fridge now."}},
{id:"e9",d:1,t:"12:10",w:"arjan",x:"put *Soy sauce* on the shopping list",ar:"Shopping",app:"kitchie",sc:"h",go:"item:soy",aff:{sam:"Soy sauce is on the list. You corrected its amount on Wednesday."}},
{id:"e10",d:1,t:"09:30",w:"sam",x:"voted up *Lemon dal*",ar:"Stars and votes",app:"recipe",sc:"p",o:"sam",go:"recipe:dal"},
{id:"e11",d:1,t:"09:28",w:"sam",x:"changed a personal preference: less coriander",ar:"Preferences",app:"kitchie",sc:"p",o:"sam",go:"all:"},
{id:"e12",d:2,t:"20:15",w:"arjan",x:"cooked *Lemon dal*, used 3 items",ar:"Cooking",app:"kitchie",sc:"h",go:"recipe:dal"},
{id:"e13",d:2,t:"18:05",w:"arjan",x:"edited *Lemon dal*: more lemon",ar:"Versions",app:"recipe",sc:"h",go:"recipe:dal"},
{id:"e14",d:2,t:"11:00",w:"sam",x:"proposed a preference for Arjan: *less spicy at dinner*",ar:"Preferences",app:"kitchie",sc:"p",o:"arjan",to:"arjan",go:"all:",aff:{arjan:"Sam proposed a preference for you: less spicy at dinner. Waiting for you."},act:"Look"},
{id:"e15",d:2,t:"09:12",w:"arjan",x:"changed the household quiet hours to start at 10 pm",ar:"Preferences",app:"kitchie",sc:"h",go:"all:",aff:{sam:"The household quiet hours now start at 10 pm. Your own setting is unchanged."}},
{id:"e16",d:3,t:"19:00",w:"arjan",x:"changed the use-by of *Frozen peas* to 14 Oct",ar:"Pantry",app:"kitchie",pl:"Freezer",sc:"h",go:"item:peas"},
{id:"e17",d:3,t:"17:40",w:"sam",x:"corrected *Red lentils* to 400 g",ar:"Pantry",app:"kitchie",pl:"Pantry",sc:"h",go:"item:lentils"},
{id:"e18",d:3,t:"14:10",w:"arjan",x:"added *Red lentils, 1 kg* to the shopping list",ar:"Shopping",app:"kitchie",sc:"h",go:"item:lentils"},
{id:"e19",d:4,t:"21:00",w:"arjan",x:"changed Sam's role to Sous chef",ar:"Household",app:"kitchie",sc:"a",go:"all:"},
{id:"e20",d:4,t:"18:30",w:"arjan",x:"checked the amount of *Basmati rice*: still about right",ar:"Pantry",app:"kitchie",pl:"Pantry",sc:"h",go:"item:rice"},
{id:"e21",d:4,t:"12:00",w:"sam",x:"corrected *Eggs* to 6",ar:"Pantry",app:"kitchie",pl:"Fridge",sc:"h",go:"item:eggs"}
];
var MORE=[
{id:"m1",d:5,t:"19:20",w:"arjan",x:"cooked *Lemon dal*, used 4 items",ar:"Cooking",app:"kitchie",sc:"h",go:"recipe:dal"},
{id:"m2",d:5,t:"10:00",w:"sam",x:"added *Green tea* to the Basket",ar:"Pantry",app:"kitchie",pl:"Pantry",sc:"h",go:"item:tea"},
{id:"m3",d:6,t:"18:00",w:"arjan",x:"saved *Lemon dal* with extra lemon as a try",ar:"Versions",app:"recipe",sc:"h",go:"recipe:dal"},
{id:"m4",d:7,t:"09:40",w:"arjan",x:"put *Egg fried rice* version 4 away",ar:"Versions",app:"recipe",sc:"h",go:"recipe:fried-rice"},
{id:"m5",d:9,t:"20:10",w:"sam",x:"starred *Egg fried rice*",ar:"Stars and votes",app:"recipe",sc:"p",o:"sam",go:"recipe:fried-rice"}
];
var AREAS=["Pantry","Shopping","Plan","Cooking","Preferences","Versions","Stars and votes","Household"];
var AREAICON={Pantry:"jar",Shopping:"cart",Plan:"cal",Cooking:"pot",Preferences:"sliders",Versions:"book","Stars and votes":"star",Household:"users"};
var RANGES=[["3d","Last 3 days"],["today","Today"],["week","7 days"],["month","30 days"]];
var GROUPS=[["when","When","clock"],["who","Who","users"],["area","Area","jar"],["place","Where","pin"],["app","App","book"],["aff","Touches me","bell"]];

/* ---------- state ---------- */
var LV=LASTV[Q.get("last")==="sat"?"sat":"wed"];
var S={
 as:Q.get("as")==="sam"?"sam":"arjan", tab:Q.get("tab")==="mine"?"mine":"house", toks:[], range:/^(3d|today|week|month)$/.test(Q.get("range")||"")?Q.get("range"):"3d",
 group:Q.get("group")==="time"?"time":"person", state:Q.get("state")||"", seen:LV.v, lastTxt:LV.t, aff:false,
 view:(Q.get("view")==="list"||Q.get("filters")==="1")?"list":"catch", n:5, panel:Q.get("filters")==="1"?"filters":"", step:Q.get("step")||"", nocues:false
};
["who","area","place","app"].forEach(function(k){if(Q.get(k))Q.get(k).split(",").forEach(function(v){S.toks.push({t:k,v:v})})});
if(Q.get("aff")==="1")S.toks.push({t:"aff",v:"aff"});
if(S.toks.length||S.range!=="3d")S.view="list";
if(S.state==="caught"){S.seen=NOW}
var wide=function(){return matchMedia("(min-width:1024px)").matches};
var me=function(){return S.as};
var isFiltered=function(){return S.toks.length>0||S.range!=="3d"};

/* ---------- model ---------- */
function absMin(e){var p=e.t.split(":");return -e.d*1440+(+p[0])*60+(+p[1])}
function visible(e,p){ /* privacy and scope, D6 to D8 */
 if(e.sc==="h")return true;
 if(e.sc==="a")return !!PEOPLE[p].admin;
 if(e.sc==="p")return e.o===p||e.to===p;
 return false}
function pool(){return EV.concat(S.range==="week"||S.range==="month"?MORE:[]).sort(function(a,b){return absMin(b)-absMin(a)})}
function tabOK(e){
 var p=me();
 if(S.tab==="mine")return e.w===p||(e.sc==="p"&&(e.o===p||e.to===p));
 return e.sc!=="p"}
function personKey(e){return ACT[e.w].k==="visitor"?"visitor":e.w}
function tokOne(e,t){
 if(t.t==="who")return t.v==="me"?e.w===me():t.v==="visitor"?ACT[e.w].k==="visitor":e.w===t.v;
 if(t.t==="area")return e.ar===t.v;
 if(t.t==="place")return (e.pl||"")===t.v;
 if(t.t==="app")return e.app===t.v;
 if(t.t==="aff")return !!(e.aff&&e.aff[me()]);
 return true}
function tokOK(e,skip){ /* same filter type = OR, different types = AND */
 var types={};S.toks.forEach(function(t){if(t.t!==skip){(types[t.t]=types[t.t]||[]).push(t)}});
 return Object.keys(types).every(function(k){return types[k].some(function(t){return tokOne(e,t)})})}
function rangeOK(e){
 if(S.range==="3d")return e.d<=CAP;
 if(S.range==="today")return e.d===0;
 if(S.range==="week")return e.d<=7;
 return true}
function list(){return pool().filter(function(e){return visible(e,me())&&tabOK(e)&&tokOK(e)&&rangeOK(e)})}
function catchAll(){return pool().filter(function(e){return e.d<=CAP&&absMin(e)>S.seen&&visible(e,me())})}
function catchPool(){return catchAll().filter(tabOK)}
function catchList(){var L=catchPool();return S.aff?L.filter(function(e){return e.aff&&e.aff[me()]}):L}
function capCut(){return S.seen<-CAP*1440} /* the cap cut the window: last visit is older than the cap */
function hidden(){var o={};pool().forEach(function(e){if(e.d<=CAP&&e.sc==="p"&&e.o!==me()&&e.to!==me()){var k=e.d+"|"+e.o;o[k]=(o[k]||0)+1}});return o}
function hiddenTotal(){var H=hidden();return Object.keys(H).reduce(function(s,k){return s+H[k]},0)}
function hlList(){return EV.filter(function(e){return e.d<=CAP&&absMin(e)>S.seen&&visible(e,me())&&e.aff&&e.aff[me()]}).sort(function(a,b){return absMin(b)-absMin(a)})}
function shortDay(d){return ["Sun","Sat","Fri","Thu","Wed","Tue","Mon","Sun","Sat","Fri","Thu"][d]}
function dayLabel(d){var names=["Sun","Sat","Fri","Thu","Wed","Tue","Mon","Sun","Sat","Fri","Thu"];var dn=11-d;
 return {a:d===0?"Today":d===1?"Yesterday":names[d]+" "+dn+" Oct",b:d<2?names[d]+" "+dn+" Oct":""}}
function fmt(t){var p=t.split(":"),h=+p[0];return (h%12||12)+":"+p[1]+(h<12?" am":" pm")}
function sub(s){return esc(s).replace(/\*([^*]+)\*/g,"<b>$1</b>")}
function who(e){var a=ACT[e.w];if(a.k==="visitor")return "Someone shopping";return e.w===me()?"You":a.n}
function avatar(e,small){var a=ACT[e.w];var cls="av"+(small?" sm":"")+(e.w===me()?" me":"");
 return '<span class="'+cls+'" aria-hidden="true">'+(a.k==="visitor"?ic("link","sm"):a.i)+'</span>'}
/* H5: a tap opens option C's in-context flyout for the thing (history/option-c/), phone or desktop page by width. Not redrawn here. */
function href(e){return (wide()?"../option-c/desktop.html":"../option-c/mobile.html")+"?scope="+(e.go||"all:")}

/* ---------- render ---------- */
function evRow(e,flat){
 var m=[];
 if(ACT[e.w].k==="visitor")m.push('<span class="chip">'+ic("link","sm")+'No sign-in</span>');
 if(e.sc==="p")m.push('<span class="chip">'+ic("lock","sm")+(e.o===me()?'Only you':'For you')+'</span>');
 if(e.sc==="a")m.push('<span class="chip">'+ic("lock","sm")+'Admins</span>');
 if(e.rev)m.push('<span class="chip rv">To review</span>');
 if(e.aff&&e.aff[me()]&&absMin(e)>S.seen)m.push('<span class="chip me">Affects you</span>');
 if(e.pl)m.push('<span class="chip">'+ic("pin","sm")+esc(e.pl)+'</span>');
 m.push('<span>'+ic(AREAICON[e.ar]||"clock","sm")+' '+esc(e.ar)+' · '+(e.app==="recipe"?"Recipe":"Kitchie")+'</span>');
 var byTime=flat||S.group==="time"||S.tab==="mine";
 var t=sub(e.x);
 if(!byTime)t=t.charAt(0).toUpperCase()+t.slice(1);
 return '<a class="ev'+(S.view==="catch"&&absMin(e)>S.seen?" new":"")+'" data-id="'+e.id+'" href="'+href(e)+'">'+
  (byTime?avatar(e,1):"")+'<div class="tx">'+(byTime?'<b>'+esc(who(e))+'</b> ':"")+t+'<div class="meta">'+m.join("")+'</div></div><time>'+(flat?shortDay(e.d)+" ":"")+fmt(e.t)+'</time></a>'}
function pgHead(evs,hid){
 var e=evs[0],a=ACT[e.w];
 var name=a.k==="visitor"?"Someone shopping · link":(e.w===me()?"You":a.n);
 return '<div class="who">'+avatar(e)+'<div><b>'+esc(name)+'</b><br>'+evs.length+(evs.length===1?" thing":" things")+'</div>'+(hid?'<span class="priv">'+ic("lock","sm")+hid+' private, hidden</span>':'')+'</div>'}
function dayBlocks(L,byTimeAll){
 var H=hidden(),byDay={},order=[],out="";
 L.forEach(function(e){if(!byDay[e.d]){byDay[e.d]=[];order.push(e.d)}byDay[e.d].push(e)});
 order.forEach(function(d){
  var evs=byDay[d],lb=dayLabel(d),nc=S.view==="catch"?evs.filter(function(e){return absMin(e)>S.seen}).length:0;
  out+='<section class="day" aria-label="'+esc(lb.a)+'"><div class="lbl">'+esc(lb.a)+(lb.b?' <small>'+lb.b+'</small>':'')+(nc?' <small>· '+nc+' new</small>':'')+'</div>';
  if(byTimeAll||S.group==="time"||S.tab==="mine"){out+='<div class="pg">'+evs.map(function(e){return evRow(e)}).join("")+'</div>'}
  else{var gs={},go=[];evs.forEach(function(e){var k=personKey(e);if(!gs[k]){gs[k]=[];go.push(k)}gs[k].push(e)});
   go.forEach(function(k){var h=(S.tab==="house"&&k!==me()&&k!=="visitor")?(H[d+"|"+k]||0):0;
    out+='<div class="pg">'+pgHead(gs[k],h)+gs[k].map(function(e){return evRow(e)}).join("")+'</div>'})}
  out+='</section>'});
 return out}
function olderLine(){ /* H6 Proposal: the cap cut the window */
 return '<div class="more cap"><p class="capline">'+ic("clock","sm")+'<span>Showing the last 3 days. Search for older.</span></p><button type="button" class="sec2" data-pick>'+ic("sliders","sm")+' Pick a filter <span class="kbd">F</span></button></div>'}
function skeleton(){var r='<div class="sk"><span class="av"></span><div><i></i><i class="s"></i></div></div>';return '<div aria-busy="true" aria-label="Loading history"><section class="day"><div class="lbl sklbl"><i></i></div><div class="pg">'+r+r+r+'</div></section><p class="note">Fetching the last 3 days, this tab only.</p></div>'}
function feed(){
 if(S.state==="loading")return skeleton();
 if(S.state==="empty")return emptyState("empty");
 if(S.view==="catch"){
  var C=catchList();
  if(!catchPool().length)return emptyState("quiet");
  if(!C.length)return emptyState("none");
  return dayBlocks(C)+(capCut()?olderLine():"")}
 var L=list();
 if(!L.length)return isFiltered()?emptyState("zero"):emptyState(S.tab==="mine"?"mineEmpty":"empty");
 if(!isFiltered()){ /* H7b, H8: the last five, newest first, five in total across pantry, recipes and shopping (Proposal) */
  var shown=L.slice(0,S.n),out='<p class="lastn">'+ic("clock","sm")+'<span>The last '+Math.min(S.n,L.length)+' things, newest first</span></p><div class="pg flatlist">'+shown.map(function(e){return evRow(e,true)}).join("")+'</div>';
  if(L.length>S.n)out+='<div class="more"><button type="button" class="sec2" data-more>Show more <span class="kbd">M</span></button></div><p class="note">Five at a time, inside the last 3 days.</p>';
  else out+='<div class="more cap"><p class="capline">'+ic("clock","sm")+'<span>That is all of the last 3 days. Pick a filter to look further back.</span></p><button type="button" class="sec2" data-pick>'+ic("sliders","sm")+' Pick a filter <span class="kbd">F</span></button></div>';
  return out}
 return dayBlocks(L,true)}
function rangeName(){return {"3d":"the last 3 days",today:"today",week:"the last 7 days",month:"the last 30 days"}[S.range]}
function emptyState(k){
 var m={
  empty:['bowl','A quiet kitchen so far','Add a jar of something or cook a meal and it lands here, with who did it.','<button class="pri" data-act="plain">See a lively kitchen</button>'],
  mineEmpty:['bowl','Nothing from you in the last 3 days','Your own changes and your votes show here.','<button class="sec2" data-tab="house">See the household</button>'],
  quiet:['check','Nothing since you were last here','All quiet. The last five things are one tap away.','<button class="pri" data-closecatch>Show the last five</button>'],
  none:['bell','None of these touch you','Nothing in the catch-up affects you.','<button class="sec2" data-affoff>Show all changes</button>']
 }[k];
 if(k==="zero"){
  var what=S.toks.map(function(t){return esc(tokLabel(t))});
  return '<div class="empty"><div class="big">'+ic("sliders")+'</div><h2>Nothing matches'+(what.length?" "+what.join(" + "):"")+'</h2><p>Nothing in '+rangeName()+'. Try a wider time range or fewer filters. Nothing is deleted; it may simply not have happened.</p><div class="acts">'+(S.range!=="month"?'<button class="pri" data-range="month">Look back 30 days</button>':'')+'<button class="sec2" data-clear>Clear filters</button></div><p class="searched">Filtered: '+esc(tabName(S.tab))+', '+rangeName()+', '+S.toks.length+' filter'+(S.toks.length===1?"":"s")+'. '+(S.tab==="house"?'Private changes are never included.':'')+'</p></div>'}
 return '<div class="empty"><div class="big">'+ic(m[0])+'</div><h2>'+m[1]+'</h2><p>'+m[2]+'</p><div class="acts">'+m[3]+'</div></div>'}
function tabName(t){return {mine:"My activity",house:"Household"}[t]}
function tokLabel(t){return {who:{visitor:"Shopper link",shop:"Shopper link",me:"You"}[t.v]||(PEOPLE[t.v]?PEOPLE[t.v].n:t.v),area:t.v,place:t.v,app:t.v==="recipe"?"Recipe":"Kitchie",aff:"Affects me"}[t.t]||t.v}
function tokKind(t){return {who:"Who",area:"Area",place:"Where",app:"App",aff:""}[t.t]}

function catchCard(){
 var hl=hlList(),all=catchAll();
 var by={};all.forEach(function(e){var k=e.w===me()?"you":ACT[e.w].k==="visitor"?"the shopper link":ACT[e.w].n;by[k]=(by[k]||0)+1});
 var parts=Object.keys(by).map(function(k){return by[k]+" by "+k});
 var x='<button type="button" class="ib xcatch" data-closecatch aria-label="Clear the catch-up and show the last five (C)">'+ic("x")+'</button>';
 if(!all.length)return '<section class="catch" aria-label="Since you were last here"><div class="chead"><h2>'+ic("check")+'You are all caught up</h2>'+x+'</div><p class="sum">Nothing new since '+(S.seen>=NOW?"you cleared it just now":esc(S.lastTxt))+'. Enjoy the quiet.</p></section>';
 var rows=hl.slice(0,4).map(function(e){
  return '<div class="hl"><span class="ico">'+ic(e.rev?"book":e.w==="shop"?"cart":"bell")+'</span><div class="tx">'+esc(e.aff[me()])+'<small>'+esc(who(e))+' · '+dayLabel(e.d).a.toLowerCase()+', '+fmt(e.t)+'</small></div>'+(e.act?'<a class="go" href="'+href(e)+'">'+esc(e.act)+'</a>':'')+'</div>'}).join("");
 return '<section class="catch" aria-label="Since you were last here"><div class="chead"><h2>'+ic("bell")+'Since you were last here</h2>'+x+'</div><p class="sum">'+esc(S.lastTxt)+' · '+all.length+' change'+(all.length===1?"":"s")+(capCut()?' in the last 3 days':'')+(parts.length?': '+esc(parts.join(", ")):"")+'</p>'+
  (hl.length?'<div class="lbl2">Affects you · '+hl.length+'</div>'+rows+(hl.length>4?'<p class="note left">and '+(hl.length-4)+' more in the feed, marked Affects you.</p>':''):'<p class="sum">Nothing changed that touches you.</p>')+
  (hl.length?'<div class="foot"><button type="button" class="lnk2" data-aff>'+(S.aff?'Show all changes':'Show only these')+'</button></div>':'')+'</section>'}

/* ---------- filters: desktop panel (Pantry's .fp panel classes) and phone sheet (Pantry's .sheet.tall classes) ---------- */
function baseFor(skip){return pool().filter(function(e){return visible(e,me())&&tabOK(e)&&rangeOK(e)&&tokOK(e,skip)})}
function has(t,v){return S.toks.some(function(x){return x.t===t&&x.v===v})}
function options(g){ /* [type, value, label, count, icon] */
 var rows=[],b=baseFor(g);
 var cnt=function(f){return b.filter(f).length};
 if(g==="when")return RANGES.map(function(r){return ["range",r[0],r[1],null,"clock"]});
 if(g==="who"){rows.push(["who","me","Me",cnt(function(e){return e.w===me()}),"user"]);
  rows.push(me()==="arjan"?["who","sam","Sam",cnt(function(e){return e.w==="sam"}),"user"]:["who","arjan","Arjan",cnt(function(e){return e.w==="arjan"}),"user"]);
  rows.push(["who","visitor","Shopper link",cnt(function(e){return ACT[e.w].k==="visitor"}),"link"])}
 if(g==="area")AREAS.forEach(function(a){rows.push(["area",a,a,cnt(function(e){return e.ar===a}),AREAICON[a]])});
 if(g==="app")rows.push(["app","kitchie","Kitchie",cnt(function(e){return e.app==="kitchie"}),"jar"],["app","recipe","Recipe",cnt(function(e){return e.app==="recipe"}),"book"]);
 if(g==="place"){var pl={};b.forEach(function(e){if(e.pl)pl[e.pl]=(pl[e.pl]||0)+1});["Fridge","Freezer","Pantry"].concat(Object.keys(pl).filter(function(p){return ["Fridge","Freezer","Pantry"].indexOf(p)<0})).forEach(function(p){rows.push(["place",p,p,pl[p]||0,"pin"])})}
 if(g==="aff")rows.push(["aff","aff","Affects me",cnt(function(e){return e.aff&&e.aff[me()]}),"bell"]);
 return rows}
function isOn(o){return o[0]==="range"?S.range===o[1]:has(o[0],o[1])}
function chipSet(g,cls){return options(g).map(function(o){var on=isOn(o);var z=o[3]===0&&!on;
 return '<button type="button" class="'+cls+(on?' on':'')+(z?' zero':'')+'" aria-pressed="'+on+'" data-pick-opt="'+o[0]+'|'+esc(o[1])+'">'+(cls==="mc"?'<span class="mi">'+ic(o[4],"sm")+'</span>':ic(o[4],"sm"))+esc(o[2])+(o[3]===null?'':' <i>'+o[3]+'</i>')+'</button>'}).join("")}
function filtersPanel(){ /* desktop lane: Proposal, H8 */
 var always=S.view==="list",n=S.toks.length+(S.range!=="3d"?1:0),cntAll=list().length;
 var sec=function(g,sub){return '<section><h3>'+g[1]+(sub?' <small>'+sub+'</small>':'')+'</h3><div class="fchips">'+chipSet(g[0],"fpl")+'</div></section>'};
 return '<div class="fp"><div class="fph"><div><h2>Filters</h2><p>'+cntAll+' '+(cntAll===1?'entry':'entries')+' · '+esc(rangeName())+'</p></div>'+(always?'':'<button type="button" class="ib" data-closepanel aria-label="Close filters (Ctrl Esc)">'+ic("x")+'</button>')+'</div><div class="fpb">'+
  '<p class="fhint">Nothing is typed. Pick what you are looking for; the list updates as you pick.</p>'+
  GROUPS.map(function(g){return sec(g,g[0]==="who"||g[0]==="area"||g[0]==="place"?"pick several":"")}).join("")+
  '<div class="acts2"><button type="button" class="sec2" data-clear>Clear all'+(n?' ('+n+')':'')+'</button>'+(always?'':'<button type="button" class="pri" data-closepanel>'+ic("check")+' Done</button>')+'</div>'+
  '<p class="rule">'+ic("info","sm")+'<span>Counts are of what is already loaded for this tab. A range wider than 3 days asks the server for that window.</span></p></div></div>'}
function groupValue(g){
 if(g==="when")return RANGES.filter(function(r){return r[0]===S.range})[0][1];
 var v=S.toks.filter(function(t){return t.t===(g==="aff"?"aff":g)}).map(tokLabel);return v.length?v.join(", "):"Any"}
function sheetHtml(){ /* phone: H7a. Modelled on Pantry's Filters sheet (.sheet.tall, .fhead, .fbody, .strow, .mc, .ffoot). Nothing is typed. */
 var n=list().length,step=S.step&&GROUPS.some(function(g){return g[0]===S.step})?S.step:"",g=GROUPS.filter(function(x){return x[0]===step})[0];
 var body;
 if(!step)body='<p class="fsub">Pick one to narrow the history. You can add more after.</p><div class="strows">'+GROUPS.map(function(x){var v=groupValue(x[0]);return '<button type="button" class="strow'+(v!=="Any"&&!(x[0]==="when"&&S.range==="3d")?' on':'')+'" data-step="'+x[0]+'"><span class="stt"><span class="dotc">'+ic(x[2],"sm")+'</span>'+x[1]+'</span><span class="sval">'+esc(v)+ic("chev","sm")+'</span></button>'}).join("")+'</div>';
 else body='<button type="button" class="back2" data-step="">'+ic("chev","sm")+' All filters</button><h3 class="fh">'+g[1]+(step==="who"||step==="area"||step==="place"?' <small>pick several</small>':'')+'</h3><div class="mcs">'+chipSet(step,"mc")+'</div>';
 return '<div class="sheet-dim" data-closepanel><div class="sheet tall" role="dialog" aria-modal="true" aria-label="Pick a filter" data-keep><div class="grab"></div><div class="fhead"><div class="ftabs"><button type="button" class="on">'+(step?g[1]:'Pick a filter')+'</button></div><button type="button" class="ib" data-closepanel aria-label="Close">'+ic("x")+'</button></div>'+
  '<div class="fbody">'+body+'</div><div class="ffoot"><button type="button" class="pri wide" data-closepanel>Show '+n+' '+(n===1?'entry':'entries')+'</button><div class="flinks"><button type="button" class="link" data-clear>Clear</button><span></span></div></div></div></div>'}
function scopeCard(){
 var adm=PEOPLE[me()].admin,hn=hiddenTotal();
 return '<div class="rule">'+ic("lock","sm")+'<span>'+(adm?'You are an <b>admin</b>: you also see household admin items. ':'You see the household\'s changes. Admin-only items are not shown to you. ')+'Other people\'s personal changes ('+hn+' in the last 3 days) stay private for everyone, admins too.</span></div>'}

function railHtml(){
 var it=[["home","Home"],["jar","Pantry"],["cal","Plan"],["book","Recipes"],["cart","Shopping"],["clock","History"]];
 return '<div class="brand">Kitchie</div>'+it.map(function(i){return '<a href="#" data-rail aria-label="'+i[1]+'"'+(i[1]==="History"?' aria-current="page"':'')+'>'+ic(i[0])+'<span>'+i[1]+'</span></a>'}).join("")}
function sorterBar(){
 if(S.view!=="catch"||S.state==="loading"||S.state==="empty")return "";
 return '<div class="sorter"><span>'+(S.tab==="mine"?"Newest first":"Newest first, grouped by "+(S.group==="person"?"person":"time"))+'</span>'+(S.tab==="mine"?'':'<div class="seg" role="group" aria-label="Group by"><button type="button" aria-pressed="'+(S.group==="person")+'" data-group="person">By person</button><button type="button" aria-pressed="'+(S.group==="time")+'" data-group="time">By time</button></div>')+'</div>'}
function tokBar(){
 var h='';if(S.range!=="3d")h+='<button type="button" class="tok" data-range="3d"><i>When</i> '+RANGES.filter(function(r){return r[0]===S.range})[0][1]+'<span class="x">'+ic("x","sm")+'</span></button>';
 S.toks.forEach(function(t,i){h+='<button type="button" class="tok" data-rm="'+i+'"><i>'+tokKind(t)+'</i> '+esc(tokLabel(t))+'<span class="x">'+ic("x","sm")+'</span></button>'});
 return h?'<div class="toks" aria-label="Active filters">'+h+'</div>':""}
function counts(){var o={};["mine","house"].forEach(function(t){var keep=S.tab;S.tab=t;o[t]=catchPool().length;S.tab=keep});return o}

function render(){
 var c=S.view==="catch"?counts():{mine:0,house:0},root=$("#hx");
 var ntok=S.toks.length+(S.range!=="3d"?1:0);
 var scopeTxt=PEOPLE[me()].admin?'You see <b>everything the household did</b>, plus admin items. Personal changes of others stay private.':'You see <b>what the household did</b>. Personal changes of others stay private.';
 var showFilterBtn=wide()?S.view==="catch":S.view!=="catch";
 var lane=S.view==="catch"&&S.panel!=="filters"?'<div class="grab"></div>'+catchCard()+scopeCard():filtersPanel();
 root.innerHTML='<nav class="hx-rail" aria-label="Main">'+railHtml()+'</nav>'+
 '<main class="hx-main"><header class="hx-head"><h1>History</h1>'+(showFilterBtn?'<button type="button" class="ib'+(S.panel==="filters"?" on":"")+'" data-filters aria-label="Filters (F)">'+ic("sliders")+(ntok?'<span class="n">'+ntok+'</span>':'')+'</button>':'')+'</header>'+
 '<div class="hx-tabs" role="tablist" aria-label="Whose activity">'+[["mine","My activity",ic("user","sm")],["house","Household",ic("users","sm")]].map(function(t){return '<button type="button" role="tab" aria-selected="'+(S.tab===t[0])+'" data-tab="'+t[0]+'">'+t[2]+t[1]+(c[t[0]]?' <span class="c">'+c[t[0]]+'</span>':'')+'</button>'}).join("")+'</div>'+
 '<div class="scope">'+ic("lock","sm")+'<span>'+scopeTxt+'</span></div>'+
 (S.view==="catch"&&S.state!=="loading"&&S.state!=="empty"?'<div class="phonecatch">'+catchCard()+'</div>':'')+
 tokBar()+sorterBar()+'<div id="feed">'+feed()+'</div></main>'+
 '<aside class="hx-panel" id="panel" aria-label="'+(S.view==="catch"&&S.panel!=="filters"?"Catch-up":"Filters")+'">'+(wide()?lane:"")+'</aside>'+
 (!wide()&&S.panel==="filters"?sheetHtml():"");
 if(window.__pv)window.__pv.style.display=(!wide()&&S.panel==="filters")?'none':'';
}

/* ---------- behaviour ---------- */
var tmr;
function toast(t){var el=$("#toast");el.textContent=t;el.hidden=false;clearTimeout(tmr);tmr=setTimeout(function(){el.hidden=true},2400)}
function closeCatch(why){S.view="list";S.seen=NOW;S.n=5;S.aff=false;render();toast(why||"Catch-up cleared. Counted as caught up (Proposal).")}
function openFilters(){S.panel="filters";S.step=wide()?"":S.step;render()}
function pickOpt(t,v){
 if(t==="range"){S.range=v;}
 else{var i=S.toks.findIndex(function(x){return x.t===t&&x.v===v});if(i>=0)S.toks.splice(i,1);else S.toks.push({t:t,v:v})}
 S.view="list";S.seen=NOW;render()}
document.addEventListener("click",function(ev){
 var t=ev.target.closest("button,a,[data-closepanel]");if(!t)return;
 var d=t.dataset;
 if(t.hasAttribute("data-rail")){ev.preventDefault();toast("Mockup: other screens are not drawn here");return}
 if(d.tab){S.tab=d.tab;render();return}
 if(t.hasAttribute("data-closecatch")){closeCatch();return}
 if(t.hasAttribute("data-closepanel")){if(ev.target.closest("[data-keep]")&&!t.closest(".fhead,.ffoot"))return;S.panel="";S.step="";render();return}
 if(t.hasAttribute("data-filters")){if(S.panel==="filters"){S.panel="";render()}else openFilters();return}
 if(t.hasAttribute("data-pick")){if(S.view==="catch")closeCatch("Catch-up cleared. Pick a filter to look further back.");S.panel="filters";S.step="";render();return}
 if(d.step!==undefined){S.step=d.step;render();return}
 if(d.pickOpt){var p=d.pickOpt.split("|");pickOpt(p[0],p[1]);return}
 if(d.rm!==undefined){S.toks.splice(+d.rm,1);render();return}
 if(d.range){S.range=d.range;render();return}
 if(d.group){S.group=d.group;render();return}
 if(t.hasAttribute("data-clear")){S.toks=[];S.range="3d";render();return}
 if(t.hasAttribute("data-more")){S.n+=5;render();return}
 if(t.hasAttribute("data-aff")){S.aff=!S.aff;render();return}
 if(t.hasAttribute("data-affoff")){S.aff=false;render();return}
 if(d.act==="plain"){location.search="?";return}
 if(t.hasAttribute("data-pv")){$(".pv").classList.toggle("open");return}
 if(d.pvset){var ix=d.pvset.indexOf("="),k=[d.pvset.slice(0,ix),d.pvset.slice(ix+1)];var u=new URLSearchParams(location.search);["view","filters","step","range","who","area","place","app","aff"].forEach(function(x){u.delete(x)});if(k[0]==="try"){k[1].split("&").forEach(function(kv){var a=kv.split("=");u.set(a[0],a[1])})}else if(k[1]==="")u.delete(k[0]);else u.set(k[0],k[1]);location.search=u.toString();return}
});
/* keys (shortcut-cues.md): never while typing; Ctrl/Cmd+Esc closes the open panel; Shift+? opens the list */
var isMac=/Mac|iPhone|iPad/.test(navigator.platform||"");
document.addEventListener("keydown",function(ev){
 var tg=ev.target,typing=tg&&(tg.tagName==="INPUT"||tg.tagName==="TEXTAREA"||tg.isContentEditable);
 if(ev.key==="Escape"&&(ev.ctrlKey||ev.metaKey)){if($("#kb:not([hidden])")){$("#kb").hidden=true;return}if(S.panel==="filters"){ev.preventDefault();S.panel="";S.step="";render()}return}
 if(typing||ev.isComposing||ev.ctrlKey||ev.metaKey||ev.altKey)return;
 var k=ev.key;
 if(k==="?"){$("#kb").hidden=!$("#kb").hidden;S.nocues=false;document.body.classList.remove("nocues");ev.preventDefault();return}
 if(k==="f"||k==="F"){if(S.panel==="filters"){S.panel="";S.step=""}else S.panel="filters";render();return}
 if(k==="1"||k==="2"){S.tab=["mine","house"][+k-1];render();return}
 if((k==="c"||k==="C")&&S.view==="catch"){closeCatch();return}
 if((k==="g"||k==="G")&&S.view==="catch"){S.group=S.group==="person"?"time":"person";render();return}
 if((k==="m"||k==="M")&&S.view==="list"&&!isFiltered()){S.n+=5;render();return}
 if(k==="j"||k==="k"||k==="J"||k==="K"||k==="ArrowDown"||k==="ArrowUp"){
  var rows=$$(".ev"),i=rows.findIndex(function(r){return r===document.activeElement});
  var n=(k==="j"||k==="J"||k==="ArrowDown")?Math.min(rows.length-1,i+1):Math.max(0,i-1);
  if(rows[n]){ev.preventDefault();rows[n].focus();rows[n].scrollIntoView({block:"nearest"})}
 }
});
function pvHtml(){
 var opt=function(g,v,l,on){return '<button type="button" class="pl" aria-pressed="'+on+'" data-pvset="'+g+'='+v+'">'+l+'</button>'};
 return '<button type="button" data-pv>Preview</button><div class="pop"><h3>Viewing as</h3><div class="pills">'+opt("as","arjan","Arjan (admin)",S.as==="arjan")+opt("as","sam","Sam (member)",S.as==="sam")+'</div>'+
 '<h3>Last visit</h3><div class="pills">'+opt("last","wed","Wed 7 Oct (cap cuts)",LV===LASTV.wed)+opt("last","sat","Sat 10 Oct",LV===LASTV.sat)+'</div>'+
 '<h3>State</h3><div class="pills">'+opt("state","","Lively",!S.state)+opt("state","caught","Nothing since",S.state==="caught")+opt("state","empty","New household",S.state==="empty")+opt("state","loading","Loading",S.state==="loading")+'</div>'+
 '<h3>Try</h3><div class="pills">'+opt("try","view=list","Last five",false)+opt("try","range=month&area=Versions","30 days, Area: Versions",false)+opt("try","who=visitor&area=Plan","Filters: nothing found",false)+'</div></div>'}
var pv=document.createElement("div");pv.className="pv";pv.innerHTML=pvHtml();document.body.appendChild(pv);window.__pv=pv;
var kb=document.createElement("div");kb.className="kb";kb.id="kb";kb.hidden=true;
var M=isMac?"⌘":"Ctrl";
kb.innerHTML='<div class="kbc" role="dialog" aria-label="Shortcuts"><div class="kbh"><h2>History shortcuts</h2><button class="x" type="button" onclick="document.getElementById(\'kb\').hidden=true" aria-label="Close">×</button></div><div class="kbg"><div class="kbs"><h3>On this screen</h3>'+
 [["F","Filters"],["1 2","My activity, Household"],["J K","Next, previous entry"],["Enter","Open the entry in context"],["G","Group by person or by time (catch-up)"],["C","Clear the catch-up, show the last five"],["M","Show more (last five)"]].map(function(r){return '<div class="kbr"><span class="kk"><kbd>'+r[0]+'</kbd></span><span>'+r[1]+'</span></div>'}).join("")+
 '</div><div class="kbs"><h3>Anywhere</h3>'+[["Shift ?","This list"],[M+" Esc","Close the open panel"],["Tab","Move on"]].map(function(r){return '<div class="kbr"><span class="kk"><kbd>'+r[0]+'</kbd></span><span>'+r[1]+'</span></div>'}).join("")+'</div></div></div>';
document.body.appendChild(kb);
var to=document.createElement("div");to.className="toast";to.id="toast";to.hidden=true;to.setAttribute("role","status");document.body.appendChild(to);
document.addEventListener("click",function(ev){if(ev.target===kb)kb.hidden=true});
window.addEventListener("resize",function(){clearTimeout(window.__r);window.__r=setTimeout(render,120)});
render();
})();
