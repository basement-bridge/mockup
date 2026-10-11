/* History, Option B "Faceted filters". Mockup: sample data, no storage, nothing is sent anywhere.
   Load notes (DESIGN.md section 6): the default path is this file plus hist.css, one page of 20 rows and a count. Deferred until the person
   engages: the Item or recipe suggestions (first focus), one event's detail (first select), CSV (only on press), saved-view names are small and load with the page. */
(function(){
"use strict";
var $=function(s,r){return (r||document).querySelector(s)},$$=function(s,r){return [].slice.call((r||document).querySelectorAll(s))};
var esc=function(s){return String(s).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})};
var IC={
 pantry:'<path d="M7 3h10v3H7zM6 6h12v14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1zM9 11h6v5H9z"/>',
 cart:'<path d="M3 4h2l2.4 11h10l2-8H6.2M9 20h.01M17 20h.01"/>',
 plan:'<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/>',
 cook:'<path d="M5 11h14v6a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3zM3 11h18M9 4c0 2 2 2 2 4M14 4c0 2 2 2 2 4"/>',
 recipes:'<path d="M7 14a4 4 0 1 1 2-7 4 4 0 0 1 6 0 4 4 0 1 1 2 7v6H7z"/>',
 prefs:'<path d="M4 7h10M18 7h2M4 17h2M10 17h10"/><circle cx="16" cy="7" r="2"/><circle cx="8" cy="17" r="2"/>',
 home:'<path d="M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
 clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
 search:'<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
 x:'<path d="M6 6l12 12M18 6L6 18"/>',
 chev:'<path d="M9 6l6 6-6 6"/>',
 down:'<path d="M6 9l6 6 6-6"/>',
 filt:'<path d="M4 6h16M7 12h10M10 18h4"/>',
 person:'<circle cx="12" cy="8" r="4"/><path d="M4 20c1-4 4-6 8-6s7 2 8 6"/>',
 mic:'<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>',
 spark:'<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z"/>',
 phone:'<rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18h2"/>',
 link:'<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3A4 4 0 0 0 11 18.7l1-1"/>',
 gear:'<circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1"/>',
 pin:'<path d="M12 21s-6-5.2-6-10a6 6 0 1 1 12 0c0 4.8-6 10-6 10z"/><circle cx="12" cy="11" r="2"/>',
 tag:'<path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="8.5" r="1"/>',
 undo:'<path d="M9 7H5v4M5 11a8 8 0 1 1 2 6"/>',
 copy:'<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h8"/>',
 save:'<path d="M5 3h12l2 2v16H5zM8 3v6h8V3M8 21v-7h8v7"/>',
 file:'<path d="M6 3h8l4 4v14H6zM14 3v5h4"/>',
 star:'<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>',
 ghost:'<path d="M5 21V11a7 7 0 0 1 14 0v10l-3-2-2 2-2-2-2 2-2-2z"/><path d="M9.5 11h.01M14.5 11h.01"/>'
};
var ic=function(n,c){return '<svg class="ic'+(c?' '+c:'')+'" viewBox="0 0 24 24" aria-hidden="true">'+IC[n]+'</svg>'};
var MAC=/Mac|iPhone|iPad/.test(navigator.platform||"");
var CLOSEKEY=MAC?"\u2318 Esc":"Ctrl Esc";
var kb=function(k){return '<kbd class="kbd" aria-hidden="true">'+k+'</kbd>'};

/* ------------------------------------------------------------------ the catalogue */
var AREAS=[["Pantry","pantry"],["Shopping","cart"],["Plan","plan"],["Cooking","cook"],["Recipes","recipes"],["Preferences","prefs"]];
var AREAIC={};AREAS.forEach(function(a){AREAIC[a[0]]=a[1]});
/* Action verbs (B4): a short shared vocabulary; the list shown follows the Area picked. */
var VERBS={Pantry:["Added","Used","Moved","Changed","Removed","Checked","Undone"],Shopping:["Added","Bought","Changed","Removed","Undone"],Plan:["Planned","Moved","Changed","Removed","Undone"],Cooking:["Cooked","Undone"],Recipes:["Created","Edited","Rated","Removed","Undone","Suggested"],Preferences:["Changed","Suggested","Undone"]};
var VERBHELP={Added:"new item, new list line",Used:"used one, used up",Moved:"to another place or day",Changed:"amount, use-by, details",Removed:"removed, put away, thrown out",Checked:"amount confirmed",Bought:"ticked off while shopping",Planned:"a meal on a day",Cooked:"started, finished, stopped",Created:"a new recipe",Edited:"a new version or revision",Rated:"starred or voted",Undone:"going back",Suggested:"by an assistant, waiting for a person"};
var WHO=[["me","You","Y"],["sam","Sam","S"],["guest","Guests","G"],["ai","Assistants","\u2726"],["auto","Automatic","\u2699"]];
var WHONAME={me:"You",sam:"Sam",guest:"A shopper (link)",ai:"Claude",auto:"Kitchie, automatic"};
var VIA=[["app","App","phone"],["voice","Voice","mic"],["assistant","Assistant","spark"],["link","Shopper link","link"],["auto","Automatic","gear"]];
var VIANAME={app:"App",voice:"Voice",assistant:"Assistant (MCP)",link:"Shopper link",auto:"Automatic"};
var WHEN=[["any","Any time"],["today","Today"],["yesterday","Yesterday"],["week","This week"],["lastweek","Last week"],["30","Last 30 days"],["custom","Custom range"]];
var PLACES=[["Fridge",["Door","Top shelf","Crisper"]],["Freezer",["Drawer 1"]],["Pantry cupboard",["Shelf 2","Spice rack"]],["Bench",[]]];
var STATES=[["","Any"],["undone","Undone"],["review","Waiting for review"]];
var SORTS=[["new","Newest first"],["old","Oldest first"],["item","Item or recipe, A to Z"],["who","Person, then newest"]];
var NAMES=["Milk","Spinach","Oat milk","Rice","Eggs","Paneer","Butter","Tomatoes","Ice cream","Garam masala","Peas","Yoghurt","Onions","Egg fried rice","Dal tadka","Pea soup","Lemon dal"];
var FAMS={"Egg fried rice":1,"Dal tadka":1,"Pea soup":1,"Lemon dal":1};
var TODAY=new Date(2026,9,11);
var DOW=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],MON=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
var dateOf=function(d){var x=new Date(TODAY);x.setDate(x.getDate()+d);return x};
var iso=function(d){var x=dateOf(d);return x.getFullYear()+"-"+("0"+(x.getMonth()+1)).slice(-2)+"-"+("0"+x.getDate()).slice(-2)};
var dayLabel=function(d){if(d===0)return"Today";if(d===-1)return"Yesterday";var x=dateOf(d);return DOW[x.getDay()]+" "+x.getDate()+" "+MON[x.getMonth()]};
var timeLabel=function(t){var p=t.split(":"),h=+p[0];return (h%12||12)+":"+p[1]+" "+(h<12?"am":"pm")};

/* ------------------------------------------------------------------ sample events
   [id, dayOffset, "HH:MM", who, via, area, verb, [lead words, subject, tail], place, spot, changes, extra]
   who = whose decision: me, sam, guest, ai (the assistant's own conclusion, Kitchie's model_inference), auto (the app itself).
   via = the channel it came through. A change Sam asks Claude to make is who=sam, via=assistant. */
var E=function(id,d,t,who,via,area,verb,txt,place,spot,ch,x){var e={id:id,d:d,t:t,who:who,via:via,area:area,verb:verb,lead:txt[0],sub:txt[1],tail:txt[2]||"",place:place||"",spot:spot||"",ch:ch||[],undoable:true};for(var k in (x||{}))e[k]=x[k];return e};
var EV=[
E(1,0,"08:12","sam","app","Pantry","Used",["used up the ","Milk",""],"Fridge","Door",[["chg","Amount","1 L","0 (Out)"]]),
E(2,0,"07:40","me","app","Pantry","Moved",["moved ","Spinach"," to the Crisper"],"Fridge","Crisper",[["chg","Spot","Top shelf","Crisper"]]),
E(3,0,"07:15","sam","voice","Shopping","Added",["added ","Oat milk"," to the list"],"","",[["add","On the list","","Oat milk, 1"]],{words:"Add oat milk to the shopping list.",acct:"Sam\u2019s voice assistant"}),
E(4,0,"06:50","auto","auto","Pantry","Changed",["level updated for ","Rice"," from the cook"],"Pantry cupboard","Shelf 2",[["chg","Level","Plenty","Some"]],{note:"Worked out from last night\u2019s cook. Nobody typed it.",undoable:false}),
E(5,-1,"19:05","me","app","Cooking","Cooked",["finished cooking ","Egg fried rice",", used 5 items"],"","",[["rm","Used","Eggs 3, Rice 200 g, Peas 80 g, Spring onion, Oil",""]],{fam:"Egg fried rice",ver:"Our usual"}),
E(6,-1,"18:20","me","app","Cooking","Cooked",["started cooking ","Egg fried rice",""],"","",[],{fam:"Egg fried rice",ver:"Our usual"}),
E(7,-1,"17:30","sam","app","Pantry","Added",["added ","12 eggs"," to the Fridge"],"Fridge","Door",[["add","Eggs","","12"]],{match:"Eggs"}),
E(8,-1,"16:50","guest","link","Shopping","Bought",["got ","Paneer"," while shopping"],"","",[["chg","On the list","Paneer, 1","Got it"]],{note:"Anyone with the one-off shopper link, no sign-in. The link was shared by Sam.",acct:"Shopper link"}),
E(9,-1,"12:10","me","assistant","Shopping","Added",["put ","Paneer"," on the shopping list"],"","",[["add","On the list","","Paneer, 1"]],{words:"We\u2019re out of paneer, put it on the list.",acct:"Your Claude"}),
E(10,-1,"11:00","ai","assistant","Recipes","Suggested",["suggested a change to ","Egg fried rice \u2014 Less oil",""],"","",[["chg","Oil","2 tbsp","1 tbsp"]],{fam:"Egg fried rice",review:true,acct:"Claude, for Sam",note:"Claude worked this out itself after two cooks with a note about oily rice. Nothing changes until a person accepts."}),
E(11,-2,"20:15","sam","voice","Cooking","Cooked",["stopped cooking ","Dal tadka"," at step 3"],"","",[],{fam:"Dal tadka",words:"Stop cooking.",acct:"Sam\u2019s voice assistant",undoable:false}),
E(12,-2,"19:30","sam","voice","Cooking","Cooked",["started cooking ","Dal tadka",""],"","",[],{fam:"Dal tadka",words:"Let\u2019s cook dal tadka.",acct:"Sam\u2019s voice assistant"}),
E(13,-2,"15:45","me","app","Recipes","Rated",["starred ","Dal tadka",""],"","",[["add","Star","","Starred"]],{fam:"Dal tadka"}),
E(14,-2,"15:44","sam","app","Recipes","Rated",["voted yes on ","Dal tadka",""],"","",[["chg","Vote","None","Yes"]],{fam:"Dal tadka"}),
E(15,-2,"09:00","auto","auto","Pantry","Changed",["level updated for ","Onions"," from the cook"],"Pantry cupboard","Shelf 2",[["chg","Level","Some","Running low"]],{note:"Worked out from the cook. Nobody typed it.",undoable:false}),
E(16,-3,"21:00","me","app","Plan","Planned",["planned ","Egg fried rice"," for Mon 12 Oct dinner"],"","",[["add","Mon 12 Oct, dinner","","Egg fried rice"]],{fam:"Egg fried rice"}),
E(17,-3,"20:40","me","app","Plan","Moved",["moved ","Dal tadka"," from Wed to Thu"],"","",[["chg","Day","Wed 14 Oct","Thu 15 Oct"]],{fam:"Dal tadka"}),
E(18,-3,"18:00","sam","assistant","Plan","Changed",["blocked ","Sat 17 Oct"," (out for dinner)"],"","",[["add","Blocked","","Sat 17 Oct"]],{words:"We\u2019re out Saturday the 17th.",acct:"Sam\u2019s Claude"}),
E(19,-4,"19:10","sam","app","Recipes","Edited",["saved a new version, ","Egg fried rice \u2014 Less oil",""],"","",[["add","Version","","Less oil (kept)"]],{fam:"Egg fried rice"}),
E(20,-4,"19:08","sam","app","Recipes","Edited",["edited ","Egg fried rice \u2014 Less oil"," (revision 2)"],"","",[["chg","Frozen peas","100 g","80 g"]],{fam:"Egg fried rice"}),
E(21,-4,"13:05","me","app","Preferences","Changed",["set quiet hours to ","21:00 to 07:00",""],"","",[["chg","Quiet hours","None","21:00 to 07:00"]],{scope:"Yours"}),
E(22,-4,"13:00","ai","assistant","Preferences","Suggested",["suggested ","\u201Cless spicy dinners on school nights\u201D",""],"","",[["add","Household","","Less spicy dinners, school nights"]],{review:true,acct:"Claude, for Sam",note:"Learned from three cooks. Waiting for a person; it is not a preference yet."}),
E(23,-5,"14:30","sam","app","Pantry","Changed",["changed the use-by of ","Butter"," to 14 Oct"],"Fridge","Door",[["chg","Use-by","10 Oct","14 Oct"]]),
E(24,-5,"09:10","me","voice","Pantry","Changed",["corrected the amount of ","Rice"," to 1.5 kg"],"Pantry cupboard","Shelf 2",[["chg","Amount","2 kg","1.5 kg"]],{words:"Rice is about one and a half kilos.",acct:"Your voice assistant"}),
E(25,-5,"09:02","me","voice","Pantry","Checked",["checked ","Spinach",", still about right"],"Fridge","Crisper",[],{words:"Spinach is fine.",acct:"Your voice assistant",undoable:false}),
E(26,-6,"18:45","me","app","Shopping","Removed",["took ","Ice cream"," off the list"],"","",[["rm","On the list","Ice cream, 1",""]]),
E(27,-6,"18:40","me","app","Shopping","Changed",["changed ","Tomatoes"," from 4 to 6"],"","",[["chg","Quantity","4","6"]]),
E(28,-6,"12:00","sam","app","Pantry","Added",["added ","Garam masala"," to the Spice rack"],"Pantry cupboard","Spice rack",[["add","Garam masala","","1 jar"]]),
E(29,-7,"17:30","me","app","Recipes","Created",["created ","Lemon dal"," (draft)"],"","",[["add","Recipe","","Lemon dal, 6 ingredients"]],{fam:"Lemon dal"}),
E(30,-7,"17:00","me","app","Recipes","Removed",["put away ","Pea soup \u2014 With mint",""],"","",[["chg","State","Kept","Put away"]],{fam:"Pea soup"}),
E(31,-7,"11:10","sam","app","Pantry","Removed",["threw out ","Old peanut butter",""],"Pantry cupboard","Shelf 2",[["rm","Peanut butter","1 jar",""]]),
E(32,-9,"19:00","me","app","Cooking","Cooked",["finished cooking ","Pea soup",""],"","",[["rm","Used","Peas 300 g, Stock 1 L, Onion",""]],{fam:"Pea soup"}),
E(33,-9,"08:00","me","assistant","Plan","Planned",["copied last week\u2019s plan",""," into this week"],"","",[["add","This week","","5 dinners"]],{words:"Copy last week\u2019s plan.",acct:"Your Claude"}),
E(34,-14,"20:20","sam","app","Recipes","Undone",["went back to revision 3 of ","Dal tadka",""],"","",[["chg","Content","Revision 4","Revision 3 (saved as 5)"]],{fam:"Dal tadka"}),
E(35,-14,"10:00","me","app","Pantry","Added",["added ","Peas"," to the Freezer"],"Freezer","Drawer 1",[["add","Peas","","2 bags"]]),
E(36,-20,"15:00","guest","link","Shopping","Bought",["got ","Yoghurt"," while shopping"],"","",[["chg","On the list","Yoghurt, 1","Got it"]],{acct:"Shopper link",note:"Anyone with the one-off shopper link, no sign-in."}),
E(37,-20,"12:00","me","app","Preferences","Changed",["set most suggestions per day to ","2",""],"","",[["chg","Suggestions per day","3","2"]],{scope:"Household"}),
E(38,-26,"18:10","sam","voice","Shopping","Added",["added ","Onions"," to the list"],"","",[["add","On the list","","Onions, 1 kg"]],{words:"Put onions on the list.",acct:"Sam\u2019s voice assistant"})
];
/* sample undone state */
EV[19].undone=false;EV[8].undone=false;EV.forEach(function(e){e.iso=iso(e.d)});
var BYID={};EV.forEach(function(e){BYID[e.id]=e});

/* saved views: s = a filter state. Mine or shared with the household. */
var VIEWS=[
 {id:"sam-week",name:"What Sam changed this week",shared:true,s:{who:["sam"],when:"week"}},
 {id:"cooked",name:"What I cooked",shared:false,s:{who:["me"],area:["Cooking"],when:"30"}},
 {id:"review",name:"Assistant ideas to review",shared:false,s:{state:"review"}},
 {id:"recipe-edits",name:"Recipe edits",shared:false,s:{area:["Recipes"],verb:["Edited","Created","Undone"]}},
 {id:"voice",name:"Said out loud",shared:false,s:{via:["voice"]}}
];

/* ------------------------------------------------------------------ state */
var blank=function(){return {q:"",who:[],area:[],verb:[],items:[],place:"",when:"any",from:"",to:"",via:[],state:""}};
var S=blank(),SORT="new",SHOWN=20,SEL=null,DEMO="",PAGE=20;
var csv=function(v){return v?v.split(",").filter(Boolean):[]};
function readURL(){
 var q=new URLSearchParams(location.search);
 var v=q.get("view");
 if(v){var vw=VIEWS.filter(function(x){return x.id===v})[0];if(vw)S=Object.assign(blank(),JSON.parse(JSON.stringify(vw.s)))}
 ["who","area","verb","via"].forEach(function(k){if(q.get(k))S[k]=csv(q.get(k))});
 if(q.get("item"))S.items=csv(q.get("item"));
 ["q","place","when","from","to","state"].forEach(function(k){if(q.get(k)!==null&&q.get(k)!==undefined)S[k]=q.get(k)});
 if(q.get("sort"))SORT=q.get("sort");
 if(q.get("sel"))SEL=+q.get("sel");
 DEMO=q.get("demo")||"";
 return {sheet:q.get("sheet"),detail:q.get("detail")};
}
function writeURL(){
 var q=new URLSearchParams();
 ["who","area","verb","via"].forEach(function(k){if(S[k].length)q.set(k,S[k].join(","))});
 if(S.items.length)q.set("item",S.items.join(","));
 ["q","place","from","to","state"].forEach(function(k){if(S[k])q.set(k,S[k])});
 if(S.when!=="any")q.set("when",S.when);
 if(SORT!=="new")q.set("sort",SORT);
 if(DEMO)q.set("demo",DEMO);
 try{history.replaceState(null,"",location.pathname+(q.toString()?"?"+q.toString():""))}catch(e){}
}
var isActive=function(s){s=s||S;return !!(s.q||s.who.length||s.area.length||s.verb.length||s.items.length||s.place||s.when!=="any"||s.via.length||s.state)};

/* ------------------------------------------------------------------ matching */
function inWhen(e,s){
 var w=s.when,d=e.d;
 if(w==="any")return true;if(w==="today")return d===0;if(w==="yesterday")return d===-1;
 if(w==="week")return d>=-6;if(w==="lastweek")return d<=-7&&d>=-13;if(w==="30")return d>=-29;
 if(w==="custom"){if(s.from&&e.iso<s.from)return false;if(s.to&&e.iso>s.to)return false;return true}
 return true;
}
function hay(e){return (WHONAME[e.who]+" "+e.lead+e.sub+e.tail+" "+e.verb+" "+e.area+" "+e.place+" "+e.spot+" "+(e.words||"")+" "+(e.ch.map(function(c){return c.slice(1).join(" ")}).join(" "))+" "+(e.fam||"")+" "+(e.acct||"")).toLowerCase()}
function match(e,s,skip){
 s=s||S;
 if(skip!=="who"&&s.who.length&&s.who.indexOf(e.who)<0)return false;
 if(skip!=="area"&&s.area.length&&s.area.indexOf(e.area)<0)return false;
 if(skip!=="verb"&&s.verb.length&&s.verb.indexOf(e.verb)<0)return false;
 if(skip!=="via"&&s.via.length&&s.via.indexOf(e.via)<0)return false;
 if(skip!=="state"&&s.state){if(s.state==="review"&&!e.review)return false;if(s.state==="undone"&&!e.undone)return false}
 if(skip!=="when"&&!inWhen(e,s))return false;
 if(skip!=="place"&&s.place){var p=s.place.split("|");if(e.place!==p[0])return false;if(p[1]&&e.spot!==p[1])return false}
 if(skip!=="items"&&s.items.length){var ok=s.items.some(function(n){return e.sub.toLowerCase().indexOf(n.toLowerCase())>-1||(e.fam&&e.fam.toLowerCase()===n.toLowerCase())||(e.match&&e.match.toLowerCase()===n.toLowerCase())});if(!ok)return false}
 if(skip!=="q"&&s.q){var hs=hay(e);if(s.q.toLowerCase().split(/\s+/).some(function(w){return w&&hs.indexOf(w)<0}))return false}
 return true;
}
function results(){
 var r=EV.filter(function(e){return match(e)});
 var cmp={new:function(a,b){return b.d-a.d||(a.t<b.t?1:-1)},old:function(a,b){return a.d-b.d||(a.t<b.t?-1:1)},item:function(a,b){return a.sub.localeCompare(b.sub)||b.d-a.d},who:function(a,b){return WHONAME[a.who].localeCompare(WHONAME[b.who])||b.d-a.d}}[SORT];
 return r.sort(cmp);
}

/* ------------------------------------------------------------------ pieces */
function avatar(w){var o=WHO.filter(function(x){return x[0]===w})[0];return '<span class="hx-av '+w+'" aria-hidden="true">'+o[2]+'</span>'}
function whoName(e){return e.who==="ai"?"Claude":e.who==="auto"?"Kitchie":WHONAME[e.who]}
function hl(t){
 if(!S.q)return esc(t);var out=esc(t);
 S.q.split(/\s+/).filter(Boolean).forEach(function(w){var re=new RegExp("("+w.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")+")","ig");out=out.replace(/(<[^>]+>)|([^<]+)/g,function(m,tag,txt){return tag?tag:txt.replace(re,"<mark>$1</mark>")})});
 return out;
}
function sentence(e){
 var lead=e.lead,who=whoName(e);
 var s=hl(who==="You"?"You":who)+" "+hl(lead)+(e.sub?'<b>'+hl(e.sub)+'</b>':"")+hl(e.tail);
 return s;
}
function pills(e){
 return (e.who==="ai"?' <span class="hx-pill ai">'+ic("spark","s")+'assistant\u2019s own idea</span>':e.via==="assistant"?' <span class="hx-pill">'+ic("spark","s")+'via assistant</span>':e.via==="voice"?' <span class="hx-pill">'+ic("mic","s")+'voice</span>':"")+(e.review?' <span class="hx-pill rev">To review</span>':"")+(e.undone?' <span class="hx-pill und">Undone</span>':"");
}
function whereTxt(e){return e.place?e.place+(e.spot?" \u203A "+e.spot:""):""}
function metaLine(e){return [timeLabel(e.t),whereTxt(e),VIANAME[e.via]].filter(Boolean).join(" \u00B7 ")}

/* ------------------------------------------------------------------ filter form (one markup) */
function sumOf(k){
 var j=function(a){return a.length?a.join(", "):""};
 if(k==="who")return j(S.who.map(function(w){return WHO.filter(function(x){return x[0]===w})[0][1]}));
 if(k==="area")return j(S.area);
 if(k==="verb")return j(S.verb);
 if(k==="items")return j(S.items);
 if(k==="place")return S.place?S.place.replace("|"," \u203A "):"";
 if(k==="when"){if(S.when==="any")return"";if(S.when==="custom")return (S.from||"\u2026")+" to "+(S.to||"\u2026");return WHEN.filter(function(x){return x[0]===S.when})[0][1]}
 if(k==="via")return j(S.via.map(function(w){return VIA.filter(function(x){return x[0]===w})[0][1]}));
 if(k==="state")return S.state?STATES.filter(function(x){return x[0]===S.state})[0][1]:"";
 return"";
}
var OPEN={who:1,area:1,when:1};
function field(k,icn,title,body,note){
 var v=sumOf(k);
 return '<details class="hx-f" data-f="'+k+'"'+(OPEN[k]?" open":"")+'><summary>'+ic(icn)+'<b>'+title+'</b><span class="v'+(v?" set":"")+'">'+(v?esc(v):"Any")+'</span>'+ic("chev","s chev")+'</summary><div class="hx-fc">'+body+(note?'<p class="hx-help">'+note+'</p>':"")+'</div></details>';
}
function chip(group,val,label,on,extra){return '<button type="button" class="hx-chip" data-g="'+group+'" data-v="'+esc(val)+'" aria-pressed="'+!!on+'">'+(extra||"")+esc(label)+'</button>'}
function availVerbs(){var a=S.area.length?S.area:Object.keys(VERBS),seen={},out=[];a.forEach(function(x){VERBS[x].forEach(function(v){if(!seen[v]){seen[v]=1;out.push(v)}})});return out}
function filtersHtml(){
 var anyWho='<button type="button" class="hx-chip" data-g="who" data-v="" aria-pressed="'+(S.who.length===0)+'">Anyone</button>';
 var fWho=field("who","person",
   "Who",'<div class="hx-opts" role="group" aria-label="Who">'+anyWho+WHO.map(function(w){return chip("who",w[0],w[1],S.who.indexOf(w[0])>-1)}).join("")+'</div>',
   "<b>Assistants</b> means the assistant decided it itself and a person has not agreed yet. When Sam asks Claude to do something, that is Sam, through Assistant (see Source).");
 var fArea=field("area","pantry","Area",'<div class="hx-opts" role="group" aria-label="Area">'+AREAS.map(function(a){return chip("area",a[0],a[0],S.area.indexOf(a[0])>-1,ic(a[1],"s"))}).join("")+'</div>');
 var av=availVerbs();
 var fVerb=field("verb","tag","Action",'<div class="hx-opts" role="group" aria-label="Action">'+av.map(function(v){return chip("verb",v,v,S.verb.indexOf(v)>-1)}).join("")+'</div>',S.area.length?"Showing the actions that exist in "+S.area.join(", ")+".":"Pick an Area first to shorten this list.");
 var fItem=field("items","search",
   "Item or recipe",
   '<div class="hx-opts" id="hx-itemchips">'+S.items.map(function(n){return '<button type="button" class="hx-chip on" data-rm-item="'+esc(n)+'">'+esc(n)+ic("x","s")+'</button>'}).join("")+'</div><input class="hx-in" id="hx-item" type="search" placeholder="Start typing a name" autocomplete="off" aria-label="Item or recipe"><ul class="hx-sug" id="hx-sug" hidden></ul>',
   "A recipe name also finds every version and revision of it.");
 var pd=S.area.length&&S.area.indexOf("Pantry")<0;
 var fPlace=field("place","pin","Place and spot",
   '<select class="hx-in" id="hx-place" aria-label="Place and spot"'+(pd?" disabled":"")+'><option value="">Anywhere</option>'+PLACES.map(function(p){return '<option value="'+p[0]+'"'+(S.place===p[0]?" selected":"")+'>'+p[0]+'</option>'+p[1].map(function(sp){return '<option value="'+p[0]+'|'+sp+'"'+(S.place===p[0]+"|"+sp?" selected":"")+'>\u2003'+p[0]+' \u203A '+sp+'</option>'}).join("")}).join("")+'</select>',
   pd?"Places only apply to Pantry changes. Add Pantry to Area to use this.":"Pantry changes only. Moves match the place the item ended up in.");
 var fWhen=field("when","clock","When",
   '<div class="hx-opts" role="group" aria-label="When">'+WHEN.map(function(w){return chip("when",w[0],w[1],S.when===w[0])}).join("")+'</div>'+
   '<div class="hx-range" '+(S.when==="custom"?"":"hidden")+' id="hx-range"><label>From<input class="hx-in" type="date" id="hx-from" value="'+S.from+'"></label><label>To<input class="hx-in" type="date" id="hx-to" value="'+S.to+'"></label></div>');
 var fVia=field("via","phone","Source",'<div class="hx-opts" role="group" aria-label="Source">'+VIA.map(function(w){return chip("via",w[0],w[1],S.via.indexOf(w[0])>-1,ic(w[2],"s"))}).join("")+'</div>',"How it reached Kitchie or Recipe: tapped in the app, said out loud, sent by an assistant, a shopper link, or the app itself.");
 var fState=field("state","undo","State",'<div class="hx-opts" role="group" aria-label="State">'+STATES.map(function(w){return chip("state",w[0],w[1],S.state===w[0])}).join("")+'</div>');
 return '<div class="hx-grab" aria-hidden="true"></div><div class="hx-fh"><h2 id="hx-ft">Filters</h2><button type="button" class="hx-btn ghost" id="hx-reset" '+(isActive()?"":"disabled")+'>Reset'+kb("X")+'</button><button type="button" class="hx-x" id="hx-fclose" aria-label="Close filters ('+CLOSEKEY+')">'+ic("x")+'</button></div>'+
  '<div class="hx-fb">'+fWho+fArea+fVerb+fItem+fPlace+fWhen+fVia+fState+'</div>'+
  '<div class="hx-ff"><button type="button" class="hx-btn" id="hx-saveview"'+(isActive()?"":" disabled")+'>'+ic("save","s")+'Save view</button><button type="button" class="hx-btn pri" id="hx-show"></button></div>';
}

/* ------------------------------------------------------------------ main render */
var mq=matchMedia("(min-width:1024px)");
var wide=function(){return mq.matches};
function viewsHtml(){
 var cur=JSON.stringify(canon(S));
 return '<span class="lbl">Views'+kb("V")+'</span>'+VIEWS.map(function(v){var on=JSON.stringify(canon(Object.assign(blank(),v.s)))===cur;return '<button type="button" class="hx-chip" data-view="'+v.id+'" aria-pressed="'+on+'" title="'+(v.shared?"Shared with the household":"Only you")+'">'+(v.shared?ic("person","s"):"")+esc(v.name)+'</button>'}).join("")+(isActive()&&!VIEWS.some(function(v){return JSON.stringify(canon(Object.assign(blank(),v.s)))===cur})?'<button type="button" class="hx-chip dash" id="hx-save2">'+ic("save","s")+'Save this view</button>':"");
}
function canon(s){var o={};Object.keys(s).sort().forEach(function(k){var v=s[k];o[k]=Array.isArray(v)?v.slice().sort():v});if(o.when!=="custom"){o.from="";o.to=""}return o}
function activeChips(){
 var out=[];
 var add=function(k,lab,val,rm){out.push('<span class="hx-chip"><span><b>'+lab+':</b> '+esc(val)+'</span><button type="button" class="x" data-rm="'+k+'" data-rv="'+esc(rm||"")+'" aria-label="Remove '+lab+': '+esc(val)+'">'+ic("x","s")+'</button></span>')};
 if(S.q)add("q","Words",'\u201C'+S.q+'\u201D');
 S.who.forEach(function(w){add("who","Who",WHO.filter(function(x){return x[0]===w})[0][1],w)});
 S.area.forEach(function(w){add("area","Area",w,w)});
 S.verb.forEach(function(w){add("verb","Action",w,w)});
 S.items.forEach(function(w){add("items","Item",w,w)});
 if(S.place)add("place","Place",S.place.replace("|"," \u203A "));
 if(S.when!=="any")add("when","When",sumOf("when"));
 S.via.forEach(function(w){add("via","Source",VIA.filter(function(x){return x[0]===w})[0][1],w)});
 if(S.state)add("state","State",sumOf("state"));
 if(out.length>1)out.push('<button type="button" class="hx-chip clear" id="hx-clear">Clear all'+kb("X")+'</button>');
 return out.join("");
}
function cardHtml(e){
 return '<li><button type="button" class="hx-card'+(e.undone?" undone":"")+'" data-id="'+e.id+'" aria-current="'+(SEL===e.id)+'">'+avatar(e.who)+'<span class="t"><span>'+sentence(e)+pills(e)+'</span><small>'+esc(metaLine(e))+'</small></span><span class="hx-area" title="'+e.area+'">'+ic(AREAIC[e.area])+'</span></button></li>';
}
function rowHtml(e){
 return '<tr class="r'+(e.undone?" undone":"")+'" data-id="'+e.id+'" tabindex="0" aria-selected="'+(SEL===e.id)+'"><td class="w">'+timeLabel(e.t)+'</td><td class="who">'+avatar(e.who)+esc(whoName(e))+'</td><td class="wh"><span>'+sentence(e)+pills(e)+'</span><small class="inl">'+[whereTxt(e),VIANAME[e.via]].filter(Boolean).map(esc).join(" \u00B7 ")+'</small></td><td class="x2">'+esc(whereTxt(e)||"\u2014")+'</td><td class="x2">'+VIANAME[e.via]+'</td><td class="ar" title="'+e.area+'">'+ic(AREAIC[e.area])+'</td></tr>';
}
function listHtml(r){
 var rows=r.slice(0,SHOWN),grp=SORT==="new"||SORT==="old",html="",last=null;
 if(wide()){
  html='<table class="hx-tbl" aria-label="Changes"><thead><tr><th scope="col">Time</th><th scope="col">Who</th><th scope="col">What</th><th scope="col" class="x2">Where</th><th scope="col" class="x2">Source</th><th scope="col"><span class="hx-sr">Area</span></th></tr></thead><tbody>';
  rows.forEach(function(e){if(grp&&e.d!==last){html+='<tr class="dayrow"><td colspan="6">'+dayLabel(e.d)+'</td></tr>';last=e.d}html+=rowHtml(e)});
  html+='</tbody></table>';
 }else{
  html='';var open=false;
  rows.forEach(function(e){if(grp&&e.d!==last){if(open)html+='</ul>';html+='<h3 class="hx-day">'+dayLabel(e.d)+'</h3><ul class="hx-cards">';open=true;last=e.d}else if(!grp&&!open){html+='<ul class="hx-cards">';open=true}html+=cardHtml(e)});
  if(open)html+='</ul>';
 }
 if(r.length>SHOWN)html+='<div class="hx-more"><button type="button" class="hx-btn" id="hx-more">Show '+Math.min(PAGE,r.length-SHOWN)+' more <small style="color:var(--muted)">('+(r.length-SHOWN)+' left)</small></button></div>';
 return html;
}
function zeroHtml(){
 var cand=[];
 var tests=[["who","Who"],["area","Area"],["verb","Action"],["items","Item"],["place","Place"],["when","When"],["via","Source"],["state","State"],["q","Words"]];
 tests.forEach(function(t){var on=t[0]==="when"?S.when!=="any":Array.isArray(S[t[0]])?S[t[0]].length:S[t[0]];if(!on)return;var n=EV.filter(function(e){return match(e,S,t[0])}).length;if(n)cand.push([t[0],t[1],n])});
 cand.sort(function(a,b){return b[2]-a[2]});
 var acts=cand.slice(0,3).map(function(c){return '<button type="button" class="hx-chip" data-drop="'+c[0]+'">Drop '+c[1]+': '+esc(sumOf(c[0]==="q"?"":c[0])||('\u201C'+S.q+'\u201D'))+' <small>+'+c[2]+'</small></button>'}).join("");
 return '<div class="hx-state" role="status"><span class="big">'+ic("ghost")+'</span><h2>Nothing matches all of that</h2><p>No change fits every filter at once. Loosen one and it may turn up.</p><div class="acts">'+acts+'</div><div class="acts"><button type="button" class="hx-btn" id="hx-clear2">Clear all filters</button></div></div>';
}
function emptyHtml(){return '<div class="hx-state"><span class="big">'+ic("clock")+'</span><h2>A quiet kitchen</h2><p>Nothing has been changed yet. Add something to the Pantry, tick off a shopping line or cook a meal, and it lands here.</p><div class="acts"><a class="hx-btn pri" href="#">Add to the Pantry</a></div></div>'}
function errHtml(){return '<div class="hx-state" role="alert"><span class="big">'+ic("undo")+'</span><h2>History did not load</h2><p>Your filters are kept. Nothing was lost; it is just the connection.</p><div class="acts"><button type="button" class="hx-btn pri" id="hx-retry">Try again</button></div></div>'}
function skelHtml(){return '<div class="hx-skel" role="status" aria-label="Loading history"><i></i><i></i><i></i><i></i><i></i><i></i></div>'}

function render(keepFilters){
 var r=results(),total=EV.length;
 var fm=$("#hx-filters");
 if(!keepFilters){var open=fm.classList.contains("open");var openF=$$("details",fm).filter(function(d){return d.open}).map(function(d){return d.dataset.f});var sc=$(".hx-fb",fm)&&$(".hx-fb",fm).scrollTop;fm.innerHTML=filtersHtml();$$("details",fm).forEach(function(d){d.open=openF.indexOf(d.dataset.f)>-1||(!openF.length&&!!OPEN[d.dataset.f])});if(sc)$(".hx-fb",fm).scrollTop=sc}
 else{ $$("details.hx-f",fm).forEach(function(d){var k=d.dataset.f,v=sumOf(k),el=$(".v",d);el.textContent=v||"Any";el.className="v"+(v?" set":"")}) }
 var n=$$("#hx-active .x").length;
 $("#hx-views").innerHTML=viewsHtml();
 $("#hx-active").innerHTML=activeChips();
 $("#hx-active").hidden=!isActive();
 var nf=(S.who.length?1:0)+(S.area.length?1:0)+(S.verb.length?1:0)+(S.items.length?1:0)+(S.place?1:0)+(S.when!=="any"?1:0)+(S.via.length?1:0)+(S.state?1:0);
 $("#hx-open-f").innerHTML=ic("filt","s")+'Filters'+(nf?' <span class="hx-n">'+nf+'</span>':"")+kb("F");
 var cnt=DEMO==="empty"?0:r.length;
 $("#hx-show").textContent="Show "+cnt+" change"+(cnt===1?"":"s");
 $("#hx-count").innerHTML=(DEMO==="loading"||DEMO==="error"?'<span>\u2026</span>':'<span>'+cnt+' change'+(cnt===1?"":"s")+'</span>')+'<small>'+(isActive()?"matching your filters":"everything, newest first")+'</small><span class="grow"></span>';
 $("#hx-sort").value=SORT;
 $("#hx-q").value=S.q;$("#hx-qclr").hidden=!S.q;
 var res=$("#hx-results");
 if(DEMO==="loading")res.innerHTML=skelHtml();
 else if(DEMO==="error")res.innerHTML=errHtml();
 else if(DEMO==="empty")res.innerHTML=emptyHtml();
 else if(!r.length)res.innerHTML=zeroHtml();
 else res.innerHTML=listHtml(r);
 var rst=$("#hx-reset");if(rst)rst.disabled=!isActive();
 var sv=$("#hx-saveview");if(sv)sv.disabled=!isActive();
 writeURL();
 renderDetail();
 $("#hx-live").textContent=DEMO?"":cnt+" changes";
}

/* ------------------------------------------------------------------ detail */
function renderDetail(){
 var d=$("#hx-detail"),e=BYID[SEL];
 if(!e||!match(e)&&false){d.classList.remove("open");$("#hx-dbody").innerHTML="";return}
 var diff=e.ch.length?'<div><span class="hx-lbl">What changed</span><ul class="hx-df">'+e.ch.map(function(c){var t=c[0];return '<li class="'+t+'"><span>'+(t==="chg"?esc(c[1])+": <s>"+esc(c[2])+"</s> \u2192 <b>"+esc(c[3])+"</b>":t==="add"?"+ "+esc(c[1])+(c[3]?": <b>"+esc(c[3])+"</b>":""):"\u2212 "+esc(c[1])+": <s>"+esc(c[2])+"</s>")+'</span></li>'}).join("")+'</ul></div>':"";
 var kv='<dl class="hx-kv"><dt>Who</dt><dd>'+esc(WHONAME[e.who]===whoName(e)?whoName(e):whoName(e))+(e.acct&&e.who!=="auto"?' <span style="font-weight:400;color:var(--muted)">('+esc(e.acct)+')</span>':"")+'</dd><dt>Through</dt><dd>'+VIANAME[e.via]+'</dd><dt>When</dt><dd>'+dayLabel(e.d)+', '+timeLabel(e.t)+'</dd><dt>Area</dt><dd>'+e.area+(e.scope?" \u00B7 "+e.scope:"")+'</dd>'+(whereTxt(e)?'<dt>Where</dt><dd>'+esc(whereTxt(e))+'</dd>':"")+(e.ver?'<dt>Version</dt><dd>'+esc(e.ver)+'</dd>':"")+'</dl>';
 var said=e.words?'<div><span class="hx-lbl">What was said</span><div class="hx-quote">\u201C'+esc(e.words)+'\u201D<small>Heard by '+esc(e.acct||"the assistant")+'. The words are kept for this long only: open question B-Q7.</small></div></div>':"";
 var note=e.note?'<p>'+esc(e.note)+'</p>':"";
 var also='<div><span class="hx-lbl">Find more like this</span><div class="hx-also"><button type="button" class="hx-chip" data-more="item">Same '+(e.fam?"recipe":"item")+'</button><button type="button" class="hx-chip" data-more="who">Same person</button><button type="button" class="hx-chip" data-more="day">Same day</button><button type="button" class="hx-chip" data-more="via">Same source</button></div></div>';
 var acts='<div class="hx-acts">'+(e.review?'<button type="button" class="hx-btn pri" data-act="review">Review it</button>':"")+(e.undoable&&!e.undone&&!e.review?'<button type="button" class="hx-btn" data-act="undo">'+ic("undo","s")+'Undo this'+kb("Z")+'</button>':"")+'<button type="button" class="hx-btn ghost" data-act="open">Open '+(e.area==="Recipes"||e.area==="Cooking"?"the recipe":e.area==="Pantry"?"the item":"it")+'</button></div>';
 $("#hx-dtitle").innerHTML=sentence(e);
 $("#hx-dav").innerHTML=avatar(e.who);
 $("#hx-dbody").innerHTML=pills(e).trim()?'<div>'+pills(e)+'</div>'+kv+note+said+diff+acts+also:kv+note+said+diff+acts+also;
 d.classList.add("open");
 if(!wide()){/* sheet */}
}
function closeDetail(){SEL=null;$("#hx-detail").classList.remove("open");$$("[aria-current=true],[aria-selected=true]").forEach(function(x){x.setAttribute(x.tagName==="TR"?"aria-selected":"aria-current","false")});maybeScrim()}
function select(id,focus){
 SEL=id;
 $$("[data-id]").forEach(function(x){var on=+x.dataset.id===id;x.setAttribute(x.tagName==="TR"?"aria-selected":"aria-current",on)});
 renderDetail();maybeScrim();
 if(focus){var r=$('tr[data-id="'+id+'"]');if(r){r.focus({preventScroll:false})}}
}

/* ------------------------------------------------------------------ layers: sheet, flyout, scrim */
function filtersOpen(){return $("#hx-filters").classList.contains("open")}
function overlay(){return !wide()||innerWidth<1240}
function openFilters(){
 if(innerWidth>=1240){var f=$("#hx-filters details summary");f&&f.focus();return}
 $("#hx-filters").classList.add("open");maybeScrim();closeDetailIfSheet();
 var c=$("#hx-fclose");c&&c.focus();
}
function closeFilters(){$("#hx-filters").classList.remove("open");maybeScrim();$("#hx-open-f").focus()}
function closeDetailIfSheet(){if(!wide()){$("#hx-detail").classList.remove("open")}}
function maybeScrim(){
 var sc=$("#hx-scrim"),need=(filtersOpen()&&innerWidth<1240)||(!wide()&&$("#hx-detail").classList.contains("open"));
 sc.hidden=!need;sc.className="hx-scrim"+(wide()?"":" m");
}

/* ------------------------------------------------------------------ toast, save popover */
var toastT;
function toast(m){var t=$("#hx-toast");t.textContent=m;t.hidden=false;clearTimeout(toastT);toastT=setTimeout(function(){t.hidden=true},2600)}
function savePop(){
 var p=$("#hx-pop");p.hidden=false;
 p.innerHTML='<h3>Save this view</h3><p>'+esc(summaryText())+'</p><input class="hx-in" id="hx-vname" placeholder="Name it, e.g. Sam on the pantry" aria-label="View name"><label class="chk"><input type="checkbox" id="hx-vshare"> Share with the household</label><div class="hx-acts"><button type="button" class="hx-btn ghost" id="hx-vno">Cancel</button><button type="button" class="hx-btn pri" id="hx-vyes">Save view</button></div>';
 $("#hx-vname").focus();
}
function summaryText(){return $$("#hx-active .hx-chip:not(.clear) span").map(function(s){return s.textContent}).join(" \u00B7 ")||"No filters"}

/* ------------------------------------------------------------------ events */
function setGroup(g,v){
 if(g==="who"||g==="area"||g==="verb"||g==="via"){
  if(v===""){S[g]=[]}else{var i=S[g].indexOf(v);if(i>-1)S[g].splice(i,1);else S[g].push(v)}
  if(g==="area"){var av=availVerbs();S.verb=S.verb.filter(function(x){return av.indexOf(x)>-1});if(S.area.length&&S.area.indexOf("Pantry")<0)S.place=""}
 }else if(g==="when"){S.when=v;if(v!=="custom"){S.from="";S.to=""}}
 else if(g==="state"){S.state=v}
}
function bump(){SHOWN=PAGE;DEMO=DEMO==="loading"||DEMO==="error"?"":DEMO;render()}
document.addEventListener("click",function(e){
 var t=e.target.closest("button,a,tr[data-id]");if(!t)return;
 if(t.dataset.g!==undefined){setGroup(t.dataset.g,t.dataset.v);bump();var f=$('#hx-filters [data-g="'+t.dataset.g+'"][data-v="'+t.dataset.v+'"]');f&&f.focus();return}
 if(t.dataset.rm){var k=t.dataset.rm,v=t.dataset.rv;if(k==="q")S.q="";else if(k==="place")S.place="";else if(k==="when"){S.when="any";S.from=S.to=""}else if(k==="state")S.state="";else if(k==="items")S.items=S.items.filter(function(x){return x!==v});else setGroup(k,v);bump();return}
 if(t.dataset.rmItem){S.items=S.items.filter(function(x){return x!==t.dataset.rmItem});bump();return}
 if(t.id==="hx-clear"||t.id==="hx-clear2"||t.id==="hx-reset"){S=blank();bump();toast("Filters cleared");return}
 if(t.dataset.drop){var k2=t.dataset.drop;if(k2==="q")S.q="";else if(k2==="when"){S.when="any";S.from=S.to=""}else if(Array.isArray(S[k2]))S[k2]=[];else S[k2]="";bump();return}
 if(t.dataset.view){var vw=VIEWS.filter(function(x){return x.id===t.dataset.view})[0];var cur=JSON.stringify(canon(S)),vs=JSON.stringify(canon(Object.assign(blank(),vw.s)));S=cur===vs?blank():Object.assign(blank(),JSON.parse(JSON.stringify(vw.s)));bump();return}
 if(t.id==="hx-open-f"){openFilters();return}
 if(t.id==="hx-fclose"||t.id==="hx-show"||(t.id==="hx-scrim")){if(filtersOpen())closeFilters();else if(!wide())closeDetail();return}
 if(t.id==="hx-dclose"){closeDetail();return}
 if(t.id==="hx-more"){SHOWN+=PAGE;render(true);return}
 if(t.id==="hx-saveview"||t.id==="hx-save2"){savePop();return}
 if(t.id==="hx-vno"){$("#hx-pop").hidden=true;return}
 if(t.id==="hx-vyes"){var nm=$("#hx-vname").value.trim()||"My view",sh=$("#hx-vshare").checked;VIEWS.push({id:"v"+Date.now(),name:nm,shared:sh,s:JSON.parse(JSON.stringify(S))});$("#hx-pop").hidden=true;render(true);toast("Saved \u201C"+nm+"\u201D"+(sh?" for the household":" for you"));return}
 if(t.id==="hx-retry"){DEMO="";render();return}
 if(t.id==="hx-link"){try{navigator.clipboard&&navigator.clipboard.writeText(location.href)}catch(_){}toast("Link to this view copied");return}
 if(t.id==="hx-csv"){toast("Mockup: "+results().length+" rows would download as a CSV");return}
 if(t.id==="hx-qclr"){S.q="";bump();$("#hx-q").focus();return}
 if(t.dataset.more){var ev=BYID[SEL];S=blank();if(t.dataset.more==="item")S.items=[ev.fam||ev.sub.replace(/^[0-9]+ /,"").replace(/^./,function(c){return c.toUpperCase()})];if(t.dataset.more==="who")S.who=[ev.who];if(t.dataset.more==="day"){S.when="custom";S.from=S.to=ev.iso}if(t.dataset.more==="via")S.via=[ev.via];bump();return}
 if(t.dataset.act){var a=t.dataset.act;if(a==="undo"){var ev2=BYID[SEL];ev2.undone=true;toast("Undone. Saved as a new line in History, so you can undo the undo.");render(true)}else if(a==="review")toast("Mockup: opens the suggestion in Recipe");else toast("Mockup: opens it in its own screen");return}
 if(t.tagName==="TR"||t.classList.contains("hx-card")){select(+t.dataset.id);return}
});
document.addEventListener("input",function(e){
 var t=e.target;
 if(t.id==="hx-q"){clearTimeout(t._t);t._t=setTimeout(function(){S.q=t.value;SHOWN=PAGE;$("#hx-results").classList.add("hx-busy");requestAnimationFrame(function(){$("#hx-results").classList.remove("hx-busy");render(true)})},150);$("#hx-qclr").hidden=!t.value;return}
 if(t.id==="hx-item"){suggest(t.value);return}
});
document.addEventListener("change",function(e){
 var t=e.target;
 if(t.id==="hx-sort"){SORT=t.value;SHOWN=PAGE;render(true);return}
 if(t.id==="hx-place"){S.place=t.value;bump();return}
 if(t.id==="hx-from"||t.id==="hx-to"){S.from=$("#hx-from").value;S.to=$("#hx-to").value;S.when="custom";bump();return}
});
function suggest(v){
 var ul=$("#hx-sug"),q=v.trim().toLowerCase();
 if(!q&&document.activeElement!==$("#hx-item")){ul.hidden=true;return}
 var list=NAMES.filter(function(n){return S.items.indexOf(n)<0&&(!q||n.toLowerCase().indexOf(q)>-1)}).slice(0,5);
 ul.innerHTML=list.map(function(n){return '<li><button type="button" data-pick="'+esc(n)+'">'+(FAMS[n]?ic("recipes","s"):ic("pantry","s"))+esc(n)+'<small>'+(FAMS[n]?"recipe":"item")+'</small></button></li>'}).join("")||'<li><button type="button" disabled>Nothing called that</button></li>';
 ul.hidden=false;
}
document.addEventListener("click",function(e){var b=e.target.closest("[data-pick]");if(b){S.items.push(b.dataset.pick);bump();var i=$("#hx-item");i&&i.focus();$$("details",$("#hx-filters")).forEach(function(d){if(d.dataset.f==="items")d.open=true})}});
document.addEventListener("focusin",function(e){if(e.target.id==="hx-item")suggest(e.target.value)});
document.addEventListener("toggle",function(e){if(e.target.matches&&e.target.matches("details.hx-f"))OPEN[e.target.dataset.f]=e.target.open?1:0},true);

/* keys: per shortcut-cues.md. Shift+? and H belong to the global list and are not drawn here. Nothing fires while typing (SC-D3). */
document.addEventListener("keydown",function(e){
 var tg=e.target,typing=tg.matches&&tg.matches("input:not([type=checkbox]):not([type=radio]),textarea,select,[contenteditable]");
 if(e.key==="Escape"&&(e.ctrlKey||e.metaKey)){
  if(!$("#hx-pop").hidden){$("#hx-pop").hidden=true;e.preventDefault();return}
  if(filtersOpen()&&innerWidth<1240){closeFilters();e.preventDefault();return}
  if($("#hx-detail").classList.contains("open")){closeDetail();e.preventDefault();return}
  return;
 }
 if(e.key==="Escape"&&tg.id==="hx-q"){S.q="";tg.value="";bump();return}
 if(e.key==="Enter"&&tg.id==="hx-item"){var f=$("#hx-sug button:not([disabled])");if(f)f.click();e.preventDefault();return}
 if(e.key==="Enter"&&tg.id==="hx-vname"){$("#hx-vyes").click();return}
 if(typing||e.ctrlKey||e.metaKey||e.altKey||e.isComposing||e.repeat&&false)return;
 var k=e.key;
 if(k==="/"){e.preventDefault();$("#hx-q").focus();return}
 if(k==="f"||k==="F"){e.preventDefault();openFilters();return}
 if(k==="x"||k==="X"){if(isActive()){S=blank();bump();toast("Filters cleared")}return}
 if(k==="v"||k==="V"){var c=$("#hx-views .hx-chip");c&&c.focus();return}
 if(k==="o"||k==="O"){e.preventDefault();$("#hx-sort").focus();return}
 if(k==="z"||k==="Z"){var ev=BYID[SEL];if(ev&&ev.undoable&&!ev.undone&&!ev.review){ev.undone=true;toast("Undone. Saved as a new line in History.");render(true)}return}
 if(k==="j"||k==="k"||k==="ArrowDown"||k==="ArrowUp"){
  var ids=$$("[data-id]").map(function(x){return +x.dataset.id});if(!ids.length)return;
  var i=ids.indexOf(SEL),n=(k==="j"||k==="ArrowDown")?Math.min(ids.length-1,i+1):Math.max(0,i<0?0:i-1);
  e.preventDefault();select(ids[n],true);return;
 }
 if(k==="Enter"&&tg.closest&&tg.closest("tr[data-id]")){select(+tg.closest("tr").dataset.id);}
});
mq.addEventListener&&mq.addEventListener("change",function(){render(true)});
addEventListener("resize",maybeScrim);

/* ------------------------------------------------------------------ boot */
var u=readURL();
render();
if(u.sheet==="1")openFilters();
if(SEL&&!wide()&&u.detail!=="0"){/* detail sheet open on phone when sel is given */}
if(SEL)select(SEL);
if(u.sheet==="1")openFilters();
})();
