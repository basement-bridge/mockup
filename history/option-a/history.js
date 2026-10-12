/* History, Option A "Search first". Mockup only: sample data, nothing is a real household.
   One script for phone and desktop. HS.mount(el, opts) draws the search surface (box, chips, results); the layout differences are CSS.
   Today in the sample is Sun 11 Oct 2026, 10:30. Weeks start Monday. */
(function(){
var esc=function(s){return String(s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})};
var P={priya:{n:"Priya",you:1},sam:{n:"Sam"},jo:{n:"Jo",guest:1},kitchie:{n:"Kitchie",sys:1}};
var VIA={app:"App",sheet:"Item sheet",voice:"Voice",claude:"Claude",mcp:"Assistant link",import:"Import",shopper:"Shopper link",auto:"Automatic"};
var DAYN=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],NOW=new Date(2026,9,11,10,30);
function dt(d,hm){var x=new Date(2026,9,11-d);var t=hm.split(":");x.setHours(+t[0],+t[1],0,0);return x}
function dlabel(x){var d=Math.round((new Date(2026,9,11)-new Date(x.getFullYear(),x.getMonth(),x.getDate()))/864e5);return d===0?"Today":d===1?"Yesterday":DAYN[x.getDay()]+" "+x.getDate()+" "+["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][x.getMonth()]}
function tlabel(x){var h=x.getHours(),m=x.getMinutes();return(h%12||12)+":"+(m<10?"0":"")+m+" "+(h<12?"am":"pm")}
/* id, daysAgo, time, app(k=Kitchie,r=Recipe), area, action, subject, who, via, basis(said|inferred), detail{from,to,field,amt,where,note}, undo{s:can|done|stale|no, fx, why}, also */
var E=[
["e1",0,"08:12","k","Pantry","used_up","milk","sam","sheet","said",{from:"Some",to:"Out",field:"Level"},{s:"can",fx:"Puts the milk back at Some."}],
["e2",0,"07:40","k","Pantry","moved","spinach","priya","voice","said",{from:"Fridge",to:"Crisper",field:"Location",where:"Crisper"},{s:"can",fx:"Moves the spinach back to the Fridge."}],
["e3",0,"07:05","k","Plan","planned","Egg fried rice","priya","claude","said",{to:"Mon dinner",field:"Meal",note:"Asked for by Priya, in her own words"},{s:"can",fx:"Takes it off Monday's plan."}],
["e4",1,"19:05","k","Cooking","cooked","Egg fried rice","priya","app","said",{amt:"5 items used",field:"Cook"},{s:"can",fx:"Puts the 5 items back in the pantry and clears the cook log."},[["r","Recipe","Cooked Our usual version, 1 more time"]]],
["e5",1,"17:30","k","Pantry","added","12 eggs","sam","sheet","said",{to:"12",field:"Quantity",where:"Fridge"},{s:"can",fx:"Removes the 12 eggs."}],
["e6",1,"14:10","k","Pantry","undid","tomatoes","priya","app","said",{note:"Undid Sam's used-up, 1:50 pm"},{s:"no",why:"An undo can itself be undone from the original entry."}],
["e7",1,"13:50","k","Pantry","used_up","tomatoes","sam","sheet","said",{from:"Some",to:"Out",field:"Level"},{s:"done",by:"Priya",at:"Sat 2:10 pm"}],
["e8",1,"12:10","k","Shopping","listed","paneer","priya","app","said",{to:"On the list",field:"Shopping"},{s:"can",fx:"Takes paneer off the list."}],
["e9",1,"10:20","r","Stars","starred","Dal tadka","sam","app","said",{to:"Starred",field:"Star"},{s:"can",fx:"Removes the star."}],
["e10",2,"20:15","r","Votes","voted","Egg fried rice","priya","app","said",{to:"Liked",field:"Vote",note:"Only a liked vote is shown by name"},{s:"can",fx:"Clears your vote."}],
["e11",2,"18:40","r","Versions","created","Egg fried rice, less oil","sam","claude","said",{to:"New version",field:"Version",note:"Sam: \"keep that one, less oil\""},{s:"can",fx:"Puts the new version away. Nothing is deleted."}],
["e12",2,"09:00","k","Pantry","checked","rice","priya","voice","said",{note:"Checked: still about right"},{s:"no",why:"A check changes nothing to undo."}],
["e13",3,"20:20","k","Pantry","changed","butter","priya","claude","inferred",{field:"Note",from:"",to:"Bought at the Saturday market, use this one first"},{s:"can",fx:"Clears the note."}],
["e14",3,"18:12","k","Pantry","moved","rice","sam","sheet","said",{from:"Cupboard",to:"Pantry",field:"Location",where:"Pantry"},{s:"stale",why:"Moved again since (Sat). Undo would overwrite that."}],
["e15",3,"08:05","k","Shopping","bought","2 bananas","jo","shopper","said",{amt:"2",field:"Bought",note:"From the shopper link, no sign-in"},{s:"no",why:"The shopping trip is finished."}],
["e16",4,"18:41","k","Pantry","changed","butter","sam","sheet","said",{field:"Minimum",from:"2",to:"3"},{s:"can",fx:"Sets the minimum back to 2."}],
["e17",4,"18:40","k","Pantry","changed","milk","sam","sheet","said",{field:"Quantity",from:"2 L",to:"1 L"},{s:"can",fx:"Sets the quantity back to 2 L."}],
["e18",4,"12:00","r","Versions","edited","Pad see ew","priya","app","said",{field:"Noodles",from:"200 g",to:"250 g",note:"Revision 4"},{s:"can",fx:"Saved as revision 5 that reverses only this change."}],
["e19",5,"19:30","k","Plan","planned","Dal tadka","priya","app","said",{to:"Wed dinner",field:"Meal"},{s:"can",fx:"Takes it off Wednesday's plan."}],
["e20",5,"08:10","k","Pantry","added","milk","sam","voice","said",{to:"2 L",field:"Quantity",where:"Fridge"},{s:"can",fx:"Removes the milk entry."}],
["e21",6,"21:00","k","Preferences","pref","coriander","priya","app","said",{to:"Dislike until 30 Oct",field:"Preference",note:"On her own list"},{s:"can",fx:"Clears the dislike."}],
["e22",6,"07:45","k","Pantry","changed","butter","sam","sheet","said",{field:"Level",from:"Some",to:"Plenty"},{s:"can",fx:"Sets the level back to Some."}],
["e23",7,"18:20","k","Pantry","used","milk","priya","app","said",{amt:"1 L",field:"Quantity",from:"2 L",to:"1 L"},{s:"expired",why:"Quantity changed since (Wed). Undo would overwrite it."}],
["e24",7,"11:00","r","Cook","cooked","Pad see ew","sam","app","said",{amt:"6 items used",field:"Cook"},{s:"can",fx:"Puts 6 items back and clears the cook log."},[["k","Pantry","6 items used"]]],
["e25",8,"09:30","k","Shopping","unlisted","milk","sam","app","said",{to:"Off the list",field:"Shopping"},{s:"can",fx:"Puts milk back on the list."}],
["e26",8,"09:05","k","Pantry","moved","paneer","priya","claude","inferred",{from:"Fridge",to:"Freezer",field:"Location",where:"Freezer"},{s:"can",fx:"Moves the paneer back to the Fridge."}],
["e27",9,"19:50","r","Stars","unstarred","Chicken curry","sam","app","said",{to:"No star",field:"Star"},{s:"can",fx:"Stars it again."}],
["e28",9,"18:30","k","Pantry","used_up","milk","sam","sheet","said",{from:"Some",to:"Out",field:"Level"},{s:"can",fx:"Puts the milk back at Some."}],
["e29",10,"18:12","k","Pantry","changed","milk","sam","sheet","said",{field:"Level",from:"Plenty",to:"Some"},{s:"can",fx:"Sets the level back to Plenty."}],
["e30",10,"12:00","k","Plan","planned","Pad see ew","priya","app","said",{to:"Sat dinner",field:"Meal"},{s:"can",fx:"Takes it off Saturday's plan."}],
["e31",11,"17:15","k","Pantry","added","milk","priya","import","said",{to:"4 L",field:"Quantity",where:"Fridge",note:"From the receipt import"},{s:"can",fx:"Removes the milk entry."}],
["e32",11,"08:20","k","Pantry","added","sourdough","sam","voice","said",{to:"1 loaf",field:"Quantity",where:"Pantry"},{s:"can",fx:"Removes the sourdough."}],
["e33",12,"20:00","r","Versions","put_away","Brown butter, v1","priya","app","said",{to:"Put away",field:"State"},{s:"can",fx:"Brings it back as Kept."}],
["e34",12,"19:10","r","Create","created","Lemon yoghurt cake","priya","claude","said",{to:"New recipe",field:"Recipe",note:"Priya: \"save that\""},{s:"can",fx:"Puts the recipe away. Nothing is deleted."}],
["e35",13,"08:00","k","Pantry","changed","bread","kitchie","auto","inferred",{field:"Level",from:"Some",to:"Running low",note:"Use-by passed, so a check was queued"},{s:"no",why:"Automatic: nobody to undo."}],
["e36",20,"10:00","k","Pantry","removed","old tahini","priya","app","said",{note:"Removed from the pantry"},{s:"can",fx:"Adds old tahini back with its last amounts."}]
].map(function(r){var t=dt(r[1],r[2]);return{id:r[0],t:t,d:r[1],app:r[3],area:r[4],act:r[5],sub:r[6],who:r[7],via:r[8],basis:r[9],det:r[10]||{},undo:r[11],also:r[12]||[]}});
var ACT={used_up:["Used up","used up"],used:["Used","used"],moved:["Moved","moved"],added:["Added","added"],changed:["Changed","changed"],removed:["Removed","removed"],listed:["Shopping","put on the list:"],unlisted:["Shopping","took off the list:"],bought:["Shopping","got"],planned:["Planned","planned"],cooked:["Cooked","cooked"],starred:["Starred","starred"],unstarred:["Starred","un-starred"],voted:["Voted","liked"],created:["Created","created"],edited:["Edited","edited"],put_away:["Put away","put away"],pref:["Preference","set a preference:"],checked:["Checked","checked"],undid:["Undone","undid the used-up of"]};
var GROUPS=[["Added",["added"]],["Used",["used","used_up"]],["Moved",["moved"]],["Changed",["changed","checked"]],["Shopping",["listed","unlisted","bought"]],["Planned",["planned"]],["Cooked",["cooked"]],["Starred or voted",["starred","unstarred","voted"]],["Created or edited",["created","edited","put_away"]],["Removed",["removed"]]];
var WHERE=["Fridge","Freezer","Crisper","Pantry","Cupboard"],VIAS=[["voice","Voice"],["assistant","An assistant"],["app","In the app"],["import","Import"],["shopper","Shopper link"],["auto","Automatic"]];
function who(e,you){var p=P[e.who];if(e.via==="claude"||e.via==="mcp")return"Claude";return p.you&&you!==false?"You":p.n}
function sentence(e){var a=ACT[e.act],s="<b>"+esc(e.sub)+"</b>";
 var w=who(e);
 if(e.act==="moved")return w+" moved "+s+(e.det.to?" to "+esc(e.det.to):"");
 if(e.act==="used")return w+" used "+(e.det.amt?esc(e.det.amt)+" of ":"")+s;
 if(e.act==="added")return w+" added "+s+(e.det.where?" to the "+esc(e.det.where):"");
 if(e.act==="changed")return w+" changed "+esc(e.det.field.toLowerCase())+" of "+s;
 if(e.act==="edited")return w+" edited "+s;
 if(e.act==="cooked")return w+" cooked "+s;
 if(e.act==="planned")return w+" planned "+s+(e.det.to?" for "+esc(e.det.to):"");
 if(e.act==="voted")return w+" liked "+s;
 if(e.act==="pref")return w+" "+a[1]+" "+s;
 if(e.act==="checked")return w+" checked "+s+" ("+esc(e.det.note.replace("Checked: ",""))+")";
 if(e.act==="undid")return w+" undid the used-up of "+s;
 if(e.act==="removed")return w+" removed "+s;
 if(e.act==="put_away")return w+" put away "+s;
 return w+" "+a[1]+" "+s}
/* ---------- plain phrase to chips ---------- */
var STOP="what whats did does do the a an to in on of for was were is are with by from and at show me everything anything things all my mine i it that this there who when where how which someone anyone about".split(" ");
function monday(d){var x=new Date(d);x.setHours(0,0,0,0);x.setDate(x.getDate()-((x.getDay()+6)%7));return x}
function range(key){var t0=new Date(2026,9,11),m=monday(t0),D=function(n){return new Date(2026,9,11-n)};
 var R={today:[t0,new Date(2026,9,12),"Today"],yesterday:[D(1),t0,"Yesterday"],week:[m,new Date(2026,9,12),"This week"],lastweek:[new Date(m.getFullYear(),m.getMonth(),m.getDate()-7),m,"Last week"],last7:[D(6),new Date(2026,9,12),"Past 7 days"],month:[new Date(2026,9,1),new Date(2026,9,12),"This month"],lastmonth:[new Date(2026,8,1),new Date(2026,9,1),"Last month"],all:[new Date(2000,0,1),new Date(2100,0,1),"All time"]};return R[key]}
function rtext(r){var f=function(x){return x.getDate()+" "+["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][x.getMonth()]};if(r[2]==="All time")return"";var e=new Date(r[1].getFullYear(),r[1].getMonth(),r[1].getDate()-1);return f(r[0])===f(e)?f(r[0]):f(r[0])+" to "+f(e)}
var WHENS=[["today","Today"],["yesterday","Yesterday"],["week","This week"],["lastweek","Last week"],["last7","Past 7 days"],["month","This month"],["lastmonth","Last month"],["all","All time"]];
var DAYK={mon:1,tue:2,wed:3,thu:4,fri:5,sat:6,sun:0};
function parse(q){var s=" "+q.toLowerCase().replace(/[?!.,]/g," ")+" ",o={},ask=null,m;
 function eat(re,fn){var r=s.match(re);if(r){s=s.replace(re," ");fn(r)}}
 eat(/\b(last week|this week|last month|this month|yesterday|today|last night|this morning|past 7 days|last 7 days|all time|ever)\b/,function(r){var k=r[1];o.when={last_week:"lastweek",last_month:"lastmonth"}[k.replace(" ","_")]||({"this week":"week","this month":"month","yesterday":"yesterday","today":"today","last night":"yesterday","this morning":"today","past 7 days":"last7","last 7 days":"last7","all time":"all","ever":"all"})[k]});
 eat(/\bsince (mon|tue|wed|thu|fri|sat|sun)\w*\b/,function(r){o.since=DAYK[r[1]]});
 eat(/\bon (mon|tue|wed|thu|fri|sat|sun)\w*\b/,function(r){o.day=DAYK[r[1]]});
 eat(/\b(i|me|my|mine)\b/,function(){o.who="priya"});
 eat(/\b(sam|priya|jo)\b/,function(r){o.who=r[1]});
 eat(/\b(voice|spoke|said out loud)\b/,function(){o.via="voice"});
 eat(/\b(claude|assistant|assistants|ai|chatgpt)\b/,function(){o.via="assistant"});
 eat(/\b(undone|undid|reverted|revert|undo)\b/,function(){o.show="undone"});
 eat(/\bused up|finished|ran out of|ran out\b/,function(){o.did="Used"});
 eat(/\b(moved?|moving)\b/,function(){o.did="Moved"});
 eat(/\b(added|add|bought|buy|got)\b/,function(r){o.did=r[1]==="bought"||r[1]==="got"||r[1]==="buy"?"Shopping":"Added"});
 eat(/\b(used|use|using)\b/,function(){o.did="Used"});
 eat(/\b(cooked|cook|cooking|made|make)\b/,function(){o.did="Cooked"});
 eat(/\b(planned|plan|planning|scheduled)\b/,function(){o.did="Planned"});
 eat(/\b(starred|star|favourited|voted|vote|liked|like)\b/,function(){o.did="Starred or voted"});
 eat(/\b(changed|change|edited|edit|updated|created|create|wrote)\b/,function(r){o.did=/creat|wrote/.test(r[1])?"Created or edited":"Changed"});
 eat(/\b(removed|remove|deleted|put away|threw out)\b/,function(){o.did="Removed"});
 eat(/\brecipes?\b/,function(){o.app="r"});
 eat(/\b(shopping list|shopping)\b/,function(){o.did=o.did||"Shopping"});
 eat(/\b(in|into|to|from)? ?(the )?(fridge|freezer|crisper|cupboard)\b/,function(r){o.where=r[3][0].toUpperCase()+r[3].slice(1)});
 eat(/\bwho\b/,function(){ask="who"});
 var toks=s.split(/\s+/).filter(function(w){return w&&STOP.indexOf(w)<0});
 if(toks.length)o.sub=toks.join(" ");
 if(ask)o.ask=ask;return o}
/* ---------- filtering ---------- */
function match(e,f){
 if(f.who&&e.who!==f.who&&!(f.show==="undone"&&e.undo.by&&e.undo.by.toLowerCase()===(P[f.who].you?"priya":f.who)))return false;
 if(f.did){var g=GROUPS.filter(function(x){return x[0]===f.did})[0];if(g&&g[1].indexOf(e.act)<0)return false}
 if(f.sub){var n=e.sub.toLowerCase(),w=f.sub.toLowerCase().split(" ").filter(Boolean).every(function(t){t=t.replace(/s$/,"");return n.indexOf(t)>=0});if(!w)return false}
 if(f.when){var r=range(f.when);if(e.t<r[0]||e.t>=r[1])return false}
 if(f.day!==undefined&&e.t.getDay()!==f.day)return false;
 if(f.since!==undefined&&e.t<sinceDate(f.since))return false;
 if(f.where&&(e.det.where||"").toLowerCase()!==f.where.toLowerCase()&&(e.det.to||"")!==f.where&&(e.det.from||"")!==f.where)return false;
 if(f.via){if(f.via==="assistant"&&e.via!=="claude"&&e.via!=="mcp")return false;if(f.via!=="assistant"&&e.via!==f.via&&!(f.via==="app"&&e.via==="sheet"))return false}
 if(f.app&&e.app!==f.app)return false;
 if(f.show==="undone"&&e.undo.s!=="done"&&e.act!=="undid")return false;
 return true}
function sinceDate(w){var x=new Date(2026,9,10);while(x.getDay()!==+w)x=new Date(x.getFullYear(),x.getMonth(),x.getDate()-1);return x}
function run(f){return E.filter(function(e){return match(e,f)}).sort(function(a,b){return b.t-a.t})}
function merge(a,b){var o={};for(var k in a)o[k]=a[k];for(var j in b)o[j]=b[j];return o}
function isEmpty(f){return!Object.keys(f).filter(function(k){return k!=="ask"}).length}
/* ---------- chips ---------- */
function chipDefs(f){var c=[];
 if(f.who)c.push(["who","Who",P[f.who].you?"You":P[f.who].n]);
 if(f.did)c.push(["did","Did",f.did]);
 if(f.sub)c.push(["sub","Item",f.sub]);
 if(f.when){var r=range(f.when);c.push(["when","When",r[2]+(rtext(r)?" · "+rtext(r):"")])}
 if(f.day!==undefined)c.push(["day","On",["Sundays","Mondays","Tuesdays","Wednesdays","Thursdays","Fridays","Saturdays"][f.day]]);
 if(f.since!==undefined){var sd=sinceDate(f.since);c.push(["since","Since",dlabel(sd)])}
 if(f.where)c.push(["where","Where",f.where]);
 if(f.via)c.push(["via","How",VIAS.filter(function(v){return v[0]===f.via})[0][1]]);
 if(f.app)c.push(["app","In",f.app==="r"?"Recipe":"Kitchie"]);
 if(f.show)c.push(["show","Showing","Undone only"]);
 return c}
var ICON={
 search:'<circle cx="11" cy="11" r="6.5"/><path d="M16 16l5 5"/>',back:'<path d="M15 5l-7 7 7 7"/>',x:'<path d="M6 6l12 12M18 6L6 18"/>',mic:'<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>',
 clock:'<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',undo:'<path d="M9 7L4 12l5 5"/><path d="M4 12h10a6 6 0 0 1 0 12" transform="translate(0 -5)"/>',
 jar:'<path d="M7 3h10v3H7zM6 6h12v14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1zM9 11h6v5H9z"/>',pot:'<path d="M7 14a4 4 0 1 1 2-7 4 4 0 0 1 6 0 4 4 0 1 1 2 7v6H7z"/>',
 spark:'<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/>',link:'<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',gear:'<circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1"/>',
 plus:'<path d="M12 5v14M5 12h14"/>',chev:'<path d="M9 5l7 7-7 7"/>',filter:'<path d="M4 6h16M7 12h10M10 18h4"/>',tick:'<path d="M5 12.5l4.5 4.5L19 7.5"/>',list:'<path d="M5 7h14M5 12h14M5 17h9"/>'};
function ic(n,s){return'<svg class="hs-ic'+(s?" "+s:"")+'" viewBox="0 0 24 24" aria-hidden="true">'+ICON[n]+'</svg>'}
function avatar(e){var p=P[e.who],inner=e.via==="voice"?ic("mic"):e.via==="claude"||e.via==="mcp"?ic("spark"):e.via==="shopper"?ic("link"):e.via==="auto"?ic("gear"):esc(p.n[0]);
 return'<span class="hs-av'+(p.you?" me":"")+(e.via==="claude"||e.via==="mcp"?" ai":"")+'" aria-hidden="true">'+inner+'<i class="hs-dom">'+ic(e.app==="r"?"pot":"jar")+'</i></span>'}
function viaText(e){var v=VIA[e.via];if(e.via==="claude")return"Claude, for "+P[e.who].n;if(e.via==="voice")return"Voice";return v}
function row(e,sel){var u=e.undo,ub="";
 if(u.s==="can")ub='<button type="button" class="hs-undo" data-undo="'+e.id+'">'+ic("undo","xs")+'Undo</button>';
 else if(u.s==="done")ub='<span class="hs-undone">Undone</span>';
 var also=e.also.map(function(a){return'<span class="hs-also">'+ic(a[0]==="r"?"pot":"jar","xs")+esc(a[1])+": "+esc(a[2])+'</span>'}).join("");
 return'<li class="hs-ev'+(u.s==="done"?" is-undone":"")+(sel===e.id?" sel":"")+'" data-ev="'+e.id+'" data-app="'+e.app+'">'+
 '<button type="button" class="hs-evb" data-open="'+e.id+'" aria-label="Details: '+esc(e.sub)+'">'+avatar(e)+
 '<span class="hs-tx"><span class="hs-s">'+sentence(e)+'</span>'+(e.det.from!==undefined&&e.det.to!==undefined&&e.det.field&&e.act!=="moved"?'<span class="hs-ch">'+esc(e.det.field)+': '+esc(e.det.from||"not set")+' &rarr; '+esc(e.det.to||"not set")+'</span>':"")+also+
 '<span class="hs-m">'+tlabel(e.t)+' · '+esc(viaText(e))+' · '+(e.app==="r"?"Recipe":"Kitchie")+' '+esc(e.area)+'</span></span></button>'+ub+'</li>'}
function timeline(list,sel){var out="",cur="";list.forEach(function(e){var d=dlabel(e.t);if(d!==cur){if(cur)out+="</ol></section>";cur=d;out+='<section class="hs-day"><h3>'+d+'</h3><ol class="hs-list">'}out+=row(e,sel)});return out?out+"</ol></section>":""}
function answer(list,f){if(f.ask!=="who"||!list.length)return"";var e=list[0];return'<div class="hs-ans" role="status"><span class="hs-ansk">Quick answer</span><b>'+who(e)+(who(e)==="You"?"":"")+'</b> '+sentence(e).replace(/^(You|\w+) /,"").replace(/<b>/,"<b>")+' <span class="hs-m">'+dlabel(e.t)+', '+tlabel(e.t)+(list.length>1?' · '+(list.length-1)+' earlier':'')+'</span></div>'}
function skeleton(n){var s="";for(var i=0;i<(n||5);i++)s+='<li class="hs-sk"><i></i><span><b></b><u></u></span></li>';return'<section class="hs-day" aria-busy="true" aria-label="Loading"><h3 class="hs-skh"></h3><ol class="hs-list">'+s+'</ol></section>'}
function zero(f){var c=chipDefs(f),sub=f.sub;
 var msg=sub?"Nothing about <b>"+esc(sub)+"</b>"+(f.when?" from "+esc(range(f.when)[2].toLowerCase()):"")+". The kitchen has no memory of it.":"No matching history. Quiet kitchen.";
 var tips=[];if(f.when&&f.when!=="all")tips.push(["widen","Search all time"]);if(f.who)tips.push(["rmwho","Anyone, not just "+(P[f.who].you?"you":P[f.who].n)]);if(sub)tips.push(["rmsub","Drop &ldquo;"+esc(sub)+"&rdquo;"]);if(f.did)tips.push(["rmdid","Any action"]);
 return'<div class="hs-zero"><span class="hs-zi">'+ic("search")+'</span><p>'+msg+'</p><div class="hs-tips">'+tips.map(function(t){return'<button type="button" data-tip="'+t[0]+'">'+t[1]+'</button>'}).join("")+'</div></div>'}
function empty(){return'<div class="hs-zero"><span class="hs-zi">'+ic("clock")+'</span><p>Nothing has happened here yet. Add milk or cook something and it lands in History.</p></div>'}
function detail(e){var d=e.det,u=e.undo,rows=[];
 var R=function(l,v,f){rows.push('<div class="hs-fr"><dt>'+l+'</dt><dd>'+(f?'<button type="button" class="hs-ft" data-add="'+f[0]+'" data-val="'+esc(f[1])+'" title="Search for this">'+v+ic("plus","xs")+'</button>':v)+'</dd></div>')};
 R("Who",esc(who(e)),["who",e.who]);R("What",esc(e.sub),["sub",e.sub.replace(/^\d+ /,"")]);R("Did",esc(ACT[e.act][0]),["did",ACT[e.act][0]]);
 R("When",dlabel(e.t)+", "+tlabel(e.t));if(d.where)R("Where",esc(d.where),["where",d.where]);
 if(d.from!==undefined||d.to!==undefined)R(esc(d.field||"Change"),esc(d.from||"not set")+" &rarr; "+esc(d.to||"not set"));else if(d.amt)R("Amount",esc(d.amt));
 R("How",esc(viaText(e)),["via",e.via==="claude"||e.via==="mcp"?"assistant":e.via==="sheet"?"app":e.via]);
 R("Said or worked out",e.basis==="said"?"The person said it":"The assistant worked it out");
 R("Part of",e.app==="r"?"Recipe · "+esc(e.area):"Kitchie · "+esc(e.area),["app",e.app]);
 if(d.note)R("Note",esc(d.note));
 e.also.forEach(function(a){R("Also recorded",esc(a[1])+": "+esc(a[2]))});
 var ub=u.s==="can"?'<p class="hs-fx">'+esc(u.fx)+' Saved as a new entry, so nothing is rewritten.</p><button type="button" class="hs-bt pri" data-undo="'+e.id+'">'+ic("undo","xs")+'Undo this</button>':
  u.s==="done"?'<p class="hs-fx">Undone by '+esc(u.by)+', '+esc(u.at)+'.</p><button type="button" class="hs-bt" data-toast="Mockup: this would undo the undo (redo)">Do it again</button>':
  '<p class="hs-fx"><b>Can&rsquo;t undo.</b> '+esc(u.why||"")+'</p>';
 return'<h2 class="hs-dh">'+sentence(e)+'</h2><dl class="hs-fields">'+rows.join("")+'</dl>'+ub+'<p class="hs-m" style="margin-top:12px">Tap a value to search for it.</p>'}
/* ---------- the search surface ---------- */
var SUGG=[["What did Sam cook?","Cooked by Sam"],["Who moved the rice?","A quick answer on top"],["Milk last week","An item and a time"],["What did Claude do?","Everything an assistant did"],["Fridge since Thursday","A place and a start day"],["What did I undo?","Undone entries"]];
var RECENT=["milk last week","who moved the rice","sam cooked","starred recipes"];
function mount(el,o){o=o||{};
 var S={f:{},draft:"",sel:null,state:o.state||"",pop:null,recent:RECENT.slice(),gen:0};
 function eff(){return merge(S.f,S.draft?parse(S.draft):{})}
 function chipsHtml(f){return chipDefs(f).map(function(c){if(/^(since|day|show)$/.test(c[0]))return'<span class="hs-chip" data-chip="'+c[0]+'"><span class="hs-cv"><small>'+esc(c[1])+'</small> '+esc(c[2])+'</span><button type="button" class="hs-cx" data-rm="'+c[0]+'" aria-label="Remove '+esc(c[1])+' filter">'+ic("x","xs")+'</button></span>';return'<span class="hs-chip" data-chip="'+c[0]+'"><button type="button" class="hs-cv" data-pop="'+c[0]+'" aria-haspopup="listbox" aria-label="Change '+esc(c[1])+': '+esc(c[2])+'"><small>'+esc(c[1])+'</small> '+esc(c[2])+'</button><button type="button" class="hs-cx" data-rm="'+c[0]+'" aria-label="Remove '+esc(c[1])+' filter">'+ic("x","xs")+'</button></span>'}).join("")}
 function popHtml(k,f){var opts=[];
  if(k==="who")opts=[["priya","You"],["sam","Sam"],["jo","Jo (shopper link)"]];
  if(k==="did")opts=GROUPS.map(function(g){return[g[0],g[0]]});
  if(k==="when")opts=WHENS.map(function(w){var r=range(w[0]);return[w[0],w[1]+(rtext(r)?" · "+rtext(r):"")]});
  if(k==="where")opts=WHERE.map(function(w){return[w,w]});
  if(k==="via")opts=VIAS;if(k==="app")opts=[["k","Kitchie"],["r","Recipe"]];
  if(k==="sub")return'<div class="hs-pop" role="dialog" aria-label="Edit item or recipe"><input class="hs-pi" value="'+esc(f.sub)+'" aria-label="Item or recipe"><button type="button" class="hs-bt pri" data-subok>Done</button></div>';
  return'<div class="hs-pop" role="listbox" aria-label="Pick">'+opts.map(function(x){return'<button type="button" role="option" data-set="'+k+'" data-val="'+esc(x[0])+'" aria-selected="'+(String(f[k])===String(x[0]))+'">'+esc(x[1])+'</button>'}).join("")+'</div>'}
 function start(){var f=eff(),rec=isEmpty(f);
  return'<div class="hs-start">'+
   '<h3 class="hs-h">Recent</h3><ul class="hs-rec">'+S.recent.map(function(r){return'<li><button type="button" data-q="'+esc(r)+'">'+ic("clock")+'<span>'+esc(r)+'</span></button><button type="button" class="hs-rx" data-rmrec="'+esc(r)+'" aria-label="Forget '+esc(r)+'">'+ic("x","xs")+'</button></li>'}).join("")+'</ul>'+
   '<h3 class="hs-h">Ask it like you would say it</h3><ul class="hs-sg">'+SUGG.map(function(s){return'<li><button type="button" data-q="'+esc(s[0])+'"><b>'+esc(s[0])+'</b><small>'+esc(s[1])+'</small></button></li>'}).join("")+'</ul>'+
   '<h3 class="hs-h">Or pick a filter</h3><div class="hs-add">'+[["who","Who"],["when","When"],["did","What happened"],["where","Where"],["via","How"],["app","Kitchie or Recipe"]].map(function(a){return'<button type="button" data-addf="'+a[0]+'">'+ic("plus","xs")+a[1]+'</button>'}).join("")+'</div></div>'}
 function draw(keepFocus){var f=eff(),list=run(f),rec=isEmpty(f),body;
  if(S.state==="loading")body=skeleton(6);else if(S.state==="empty")body=empty();
  else if(rec)body=o.recentOnEmpty===false?"":start();
  else if(!list.length)body=zero(f);
  else body=answer(list,f)+timeline(list,S.sel);
  var count=rec||S.state?"":'<p class="hs-count" role="status" aria-live="polite">'+list.length+(list.length===1?" entry":" entries")+(S.draft?" · from what you typed":"")+'</p>';
  var q=el.querySelector(".hs-in"),pos=q?q.selectionStart:0;
  el.querySelector(".hs-top").innerHTML=
   '<div class="hs-bar">'+(o.back?'<a class="hs-back" href="'+o.back+'" aria-label="Back">'+ic("back")+'</a>':"")+'<label class="hs-box">'+ic("search")+'<input class="hs-in" type="search" enterkeyhint="search" autocomplete="off" spellcheck="false" placeholder="'+(Object.keys(S.f).length?"Add more, or press Enter":"Try: milk last week, or who moved the rice")+'" value="'+esc(S.draft)+'" aria-label="Search History"><button type="button" class="hs-mic" aria-label="Search by voice">'+ic("mic")+'</button></label>'+(o.kbd?'<span class="kbd">'+o.kbd+'</span>':"")+'</div>'+
   '<div class="hs-chips" aria-label="Filters">'+chipsHtml(S.f)+(S.draft&&!isEmpty(parse(S.draft))?'<span class="hs-pre" aria-live="polite">'+ic("spark","xs")+'Understood as '+chipDefs(parse(S.draft)).map(function(c){return esc(c[2])}).join(" · ")+'</span>':"")+
   (Object.keys(S.f).length?'<button type="button" class="hs-clear" data-clear>Clear all</button>':"")+'</div>'+(S.pop?'<div class="hs-popw">'+popHtml(S.pop,S.f)+'</div>':"");
  el.querySelector(".hs-res").innerHTML=count+body;
  if(keepFocus!==false){var n=el.querySelector(".hs-in");if(n&&(keepFocus||document.activeElement===document.body)){n.focus();try{n.setSelectionRange(pos,pos)}catch(x){}}}
  if(o.onDraw)o.onDraw(S,list)}
 function lock(){var p=parse(S.draft);S.f=merge(S.f,p);if(p.sub&&S.f.sub&&S.draft&&parse(S.draft).sub)S.f.sub=p.sub;if(S.draft.trim()&&S.recent.indexOf(S.draft.trim())<0)S.recent.unshift(S.draft.trim());S.draft="";S.sel=null}
 function setq(q){S.draft=q;lock();S.state="";draw(true)}
 function toast(t){var x=document.querySelector(".hs-toast");if(!x){x=document.createElement("div");x.className="hs-toast";x.setAttribute("role","status");document.body.appendChild(x)}x.textContent=t;x.hidden=false;clearTimeout(x._t);x._t=setTimeout(function(){x.hidden=true},3200)}
 function undo(id){var e=E.filter(function(x){return x.id===id})[0];if(!e)return;e.undo={s:"done",by:"You",at:"just now"};toast("Undone. Saved as a new entry. "+(e.app==="r"?"It is in the version's History too.":"It is in the item's History too."));draw(false);if(o.onOpen&&S.sel===id)o.onOpen(e)}
 el.addEventListener("input",function(ev){if(ev.target.classList.contains("hs-in")){S.draft=ev.target.value;S.state="";var pos=ev.target.selectionStart;draw(true)}});
 el.addEventListener("keydown",function(ev){var t=ev.target;
  if(t.classList.contains("hs-in")){
   if(ev.key==="Enter"){ev.preventDefault();if(ev.shiftKey&&o.onShiftEnter){o.onShiftEnter(merge(S.f,parse(S.draft)));return}lock();draw(true)}
   else if(ev.key==="Backspace"&&!S.draft){var k=Object.keys(S.f).filter(function(x){return x!=="ask"}).pop();if(k){delete S.f[k];if(!Object.keys(S.f).length)delete S.f.ask;draw(true)}}
   else if(ev.key==="Escape"&&!ev.ctrlKey&&!ev.metaKey){if(S.draft||S.pop){S.draft="";S.pop=null;ev.preventDefault();ev.stopPropagation();draw(true)}}
   else if(ev.key==="ArrowDown"){var f=el.querySelector(".hs-evb");if(f){ev.preventDefault();f.focus()}}}
  else if(t.classList.contains("hs-evb")){var li=t.closest(".hs-ev"),all=[].slice.call(el.querySelectorAll(".hs-ev")),i=all.indexOf(li);
   if(ev.key==="ArrowDown"&&all[i+1]){ev.preventDefault();all[i+1].querySelector(".hs-evb").focus()}
   else if(ev.key==="ArrowUp"){ev.preventDefault();if(i>0)all[i-1].querySelector(".hs-evb").focus();else el.querySelector(".hs-in").focus()}
   else if((ev.key==="z"||ev.key==="Z")&&!ev.ctrlKey&&!ev.metaKey&&li.querySelector("[data-undo]")){ev.preventDefault();undo(li.dataset.ev)}}
  else if(t.classList.contains("hs-pi")&&ev.key==="Enter"){ev.preventDefault();S.f.sub=t.value.trim();if(!S.f.sub)delete S.f.sub;S.pop=null;draw(true)}});
 el.addEventListener("click",function(ev){var b=ev.target.closest("button");if(!b)return;var d=b.dataset;
  if(d.q!==undefined)setq(d.q);
  else if(d.rmrec!==undefined){S.recent=S.recent.filter(function(x){return x!==d.rmrec});draw(false)}
  else if(d.rm){delete S.f[d.rm];if(d.rm==="did"&&S.f.ask)delete S.f.ask;S.pop=null;draw(true)}
  else if(d.pop){S.pop=S.pop===d.pop?null:d.pop;draw(false);var pi=el.querySelector(".hs-pi");if(pi)pi.focus()}
  else if(d.addf){S.pop=d.addf;draw(false)}
  else if(d.set){S.f[d.set]=d.val;S.pop=null;S.state="";draw(true)}
  else if(d.subok!==undefined){var v=el.querySelector(".hs-pi").value.trim();if(v)S.f.sub=v;else delete S.f.sub;S.pop=null;draw(true)}
  else if(d.clear!==undefined){S.f={};S.draft="";S.pop=null;S.sel=null;draw(true)}
  else if(d.tip){if(d.tip==="widen")S.f.when="all";if(d.tip==="rmwho")delete S.f.who;if(d.tip==="rmsub")delete S.f.sub;if(d.tip==="rmdid")delete S.f.did;draw(true)}
  else if(d.undo){ev.stopPropagation();undo(d.undo)}
  else if(d.open){S.sel=d.open;var e=E.filter(function(x){return x.id===d.open})[0];el.querySelectorAll(".hs-ev").forEach(function(l){l.classList.toggle("sel",l.dataset.ev===d.open)});if(o.onOpen)o.onOpen(e)}
  else if(d.add){var k=d.add,v=d.val;if(k==="sub")S.f.sub=v;else S.f[k]=v;if(k==="did"&&!GROUPS.some(function(g){return g[0]===v}))delete S.f.did;S.state="";S.sel=null;if(o.onAdd)o.onAdd();draw(true)}
  else if(d.toast!==undefined)toast(d.toast);
  else if(b.classList.contains("hs-mic"))toast("Mockup: speak the question, it becomes the same chips")});
 el.innerHTML='<div class="hs-top"></div><div class="hs-res"></div>';
 if(o.q){S.draft=o.q;lock()}
 if(o.chips)S.f=o.chips;
 if(o.sel)S.sel=o.sel;
 draw(o.focus!==false);
 return{S:S,draw:draw,setq:setq,state:function(s){S.state=s;draw(false)},undo:undo,toast:toast,eff:eff,focus:function(){var n=el.querySelector(".hs-in");if(n)n.focus()}}}
window.HS={E:E,P:P,parse:parse,run:run,mount:mount,detail:detail,ic:ic,esc:esc,sentence:sentence,row:row,timeline:timeline,chipDefs:chipDefs,merge:merge,range:range,dlabel:dlabel,tlabel:tlabel,GROUPS:GROUPS,WHERE:WHERE,VIAS:VIAS,VIA:VIA,ACT:ACT,SUGG:SUGG};
})();
