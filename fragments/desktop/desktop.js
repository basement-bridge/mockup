/* Desktop mockup renderer. Static sample data, no storage. Settled direction: left rail, off-centre column, side panel (owner, 9 October 2026). ?sel=butter pre-selects an item. */
(function(){
var Q=new URLSearchParams(location.search),SCR=document.body.dataset.screen,SEL=Q.get("sel")||null,AREA="All";
var ITEMS=[["butter","🧈","butter","Fridge","250 g","Door","Dairy and eggs",null],["carrots","🥕","carrots","Fridge","1 bag","Crisper","Vegetables",null],["cheddar","","cheddar","Fridge","200 g","Top shelf","Dairy and eggs",null],["eggs","🥚","eggs","Fridge","12","Door","Dairy and eggs",null],["yog","","greek yoghurt","Fridge","500 g","Top shelf","Dairy and eggs",7],["milk","🥛","milk","Fridge","1 L","Door","Dairy and eggs",0],["paneer","","paneer","Fridge","50 g","Top shelf","Dairy and eggs",3],["spinach","🥬","spinach","Fridge","50 g","Crisper","Vegetables",1],["rice","🍚","Basmati rice","Pantry","5 kg","Bottom shelf","Dry goods",null],["tom","🥫","Chopped tomatoes","Pantry","4 tin","Top shelf","Cans",null],["onion","🧅","Onions","Pantry","6","Baskets","Vegetables",null],["garam","","Garam masala","Pantry","1 jar","Spice rack","Seasoning",null]];
var IC={pin:'<path d="M12 21s-6-5.2-6-10a6 6 0 1 1 12 0c0 4.8-6 10-6 10z"/><circle cx="12" cy="11" r="2"/>',tag:'<path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="8.5" r="1"/>',home:'<path d="M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',pantry:'<path d="M7 3h10v3H7zM6 6h12v14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1zM9 11h6v5H9z"/>',recipes:'<path d="M7 14a4 4 0 1 1 2-7 4 4 0 0 1 6 0 4 4 0 1 1 2 7v6H7z"/>',cart:'<path d="M3 4h2l2.4 11h10l2-8H6.2M9 20h.01M17 20h.01"/>'};
var NAV=[["home","Home",0],["pantry","Pantry",0],["recipes","Recipes",2],["cart","Shopping",3]];
function nav(cls){return NAV.map(function(n){var on=(SCR==="home"&&n[0]==="home")||(SCR==="pantry"&&n[0]==="pantry");return '<button class="nv '+(on?"on":"")+'" '+(on?'aria-current="page"':"")+'><svg viewBox="0 0 24 24" aria-hidden="true">'+IC[n[0]]+'</svg><span>'+n[1]+'</span>'+(n[2]?'<i class="n">'+n[2]+'</i>':"")+'</button>'}).join("")}
function due(d){return d===null?"":d===0?'<span class="due hot">Today</span>':d===1?'<span class="due hot">Tomorrow</span>':'<span class="due">Use within<br>'+d+' days</span>'}
var AREAS=["Fridge","Pantry","Freezer","Unplaced","Laundry","Garage","Spice rack","Cellar","Balcony"],DISP=["All"].concat(AREAS);
var EDIT=false,EF="qty",HELP=false,PEND=null,PT=null,TT=null,UNDO=null,FIND="",SELA=[],SHOPN=3,LIST={},X={},RH=0,ROW=50,FULLH=50,ST=null,LASTF=null,FP=false,HIST=false,HLOG={},BY="location",DISPC=null,FUSED=false,CUES=true,FST={},FCAT=[],FSORT="none",FLAST={st:{soon:1},loc:["Fridge"],cat:[],sort:"useby"};
ITEMS.push(["peas","","peas","Freezer","1 kg","Drawer 2","Vegetables",null],["ice","🍨","ice cream","Freezer","1 tub","Door","Dessert",null]);
NAV[3][2]=SHOPN;
function $(s){return document.querySelector(s)}
function esc(s){return String(s).replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;")}
function cur(){return ITEMS.filter(function(x){return x[0]===SEL})[0]}
function lvl(i){var x=dflt(i[0]);if(!isCount(i))return x.level;var n=parseFloat(i[4]),m=parseFloat(x.min);if(!(n>0))return"Out";if(!(m>0))return"Plenty";return n<=m?"Running low":n<=2*m?"Some":"Plenty"}
function isCount(i){return !/\d\s*(g|kg|ml|L)\b/.test(i[4])}
function dflt(id){return X[id]||(X[id]={level:"Plenty",useby:"",min:""})}
function names(){return BY==="location"?AREAS:cats()}
function selA(){return BY==="location"?SELA:FCAT}
function setSelA(a){if(BY==="location")SELA=a;else FCAT=a}
function dispA(){if(BY==="location")return DISP;if(!DISPC)DISPC=["All"].concat(cats());return DISPC}
function setDispA(d){if(BY==="location")DISP=d;else DISPC=d}
function pickArr(arr,v,multi){var h=arr.indexOf(v)>-1;return multi?(h?arr.filter(function(x){return x!==v}):arr.concat(v)):(h&&arr.length===1?[]:[v])}
function areasShown(){return SELA.length?AREAS.filter(function(a){return SELA.indexOf(a)>-1}):AREAS}
var STS=[["soon","Expiring soon",function(i){return i[7]!==null&&i[7]<=7}],["list","On your list",function(i){return!!LIST[i[0]]}],["nodate","No use-by set",function(i){return i[7]===null}]],SORTS=[["none","As listed"],["name","Name A to Z"],["useby","Use-by soonest"],["cat","Category"]];
function stOn(){return STS.filter(function(t){return FST[t[0]]})}
function nF(){return stOn().length+SELA.length+FCAT.length}
function cmp(a,b){if(FSORT==="name")return a[2].localeCompare(b[2]);if(FSORT==="cat")return a[6].localeCompare(b[6])||a[2].localeCompare(b[2]);if(FSORT==="useby"){var x=a[7]===null?1e9:a[7],y=b[7]===null?1e9:b[7];return x-y}return 0}
function vis(){var f=FIND.toLowerCase(),so=stOn();return ITEMS.filter(function(i){return(!SELA.length||SELA.indexOf(i[3])>-1)&&(!FCAT.length||FCAT.indexOf(i[6])>-1)&&(!so.length||so.some(function(t){return t[2](i)}))&&(!f||(i[2]+" "+i[6]).toLowerCase().indexOf(f)>-1)}).sort(cmp)}
function order(){return groups().reduce(function(o,g){return o.concat(g[1])},[])}
var KB={cart:'<svg viewBox="0 0 24 24" aria-hidden="true">'+IC.cart+'</svg>'};
function RA(i){var c=isCount(i),n=esc(i[2]);return (c?'<button class="rb" data-act="use" title="'+(c?"Use one":"Use some")+' (U)" aria-label="'+(c?"Use one of ":"Use some of ")+n+'">'+(c?"&minus;1":"&minus;&hellip;")+'</button>':"")+'<button class="rb" data-act="done" title="Used up (D)" aria-label="Mark '+n+' used up">&#10003;</button><button class="rb'+(LIST[i[0]]?" on":"")+'" data-act="list" title="'+(LIST[i[0]]?"Take off your shopping list":"Add to shopping list")+' (S)" aria-label="'+(LIST[i[0]]?"Take "+n+" off your shopping list":"Add "+n+" to your shopping list")+'">'+KB.cart+'</button>'}
function row(i){var on=SEL===i[0];return '<li class="rw'+(on?" sel":"")+'" data-id="'+i[0]+'"><button class="row" data-open="'+i[0]+'"'+(on?' aria-current="true"':"")+'><div><div class="nm">'+(i[1]?i[1]+" ":"")+esc(i[2])+'</div><div class="mt">'+esc(i[3])+' · '+esc(i[4])+' · '+esc(i[5])+' · '+esc(i[6])+(LIST[i[0]]?' · <b class="onl">On your list</b>':"")+'</div></div>'+due(i[7])+'</button><div class="ra" role="group" aria-label="Quick actions for '+esc(i[2])+'">'+RA(i)+'</div></li>'}
function groups(){var V=vis();if(BY==="category"){var cs=FCAT.length?cats().filter(function(c){return FCAT.indexOf(c)>-1}):cats();return cs.map(function(c){return[c,V.filter(function(i){return i[6]===c})]}).filter(function(g){return g[1].length||FCAT.length})}return areasShown().map(function(a){return[a,V.filter(function(i){return i[3]===a})]}).filter(function(g){return g[1].length||SELA.length})}
function list(){var G=groups();return G.length?G.map(function(g){return '<div class="grp"><h2>'+esc(g[0])+'</h2><span class="kbd">'+g[1].length+'</span></div>'+(g[1].length?'<ul class="rows">'+g[1].map(row).join("")+'</ul>':'<p class="none">Nothing here yet.</p>')}).join(""):'<p class="none">No match.</p>'}
function ptop(i){return '<span class="ph">'+(i[1]||"🧀")+'</span><div><h2>'+esc(i[2])+'</h2><p>'+esc(i[4])+'</p><p><b style="color:var(--fg)">'+esc(i[3])+'</b> · '+esc(i[5])+'</p>'+(LIST[i[0]]?'<p class="onl">On your list</p>':"")+'</div><button class="x" aria-label="Close" data-close>&times;</button>'}
function tiles(i){var x=dflt(i[0]);function t(k,lab,val,set){return '<button class="tl'+(set?" set":"")+(EDIT&&EF===k?" open":"")+'" data-edit="'+k+'" aria-expanded="'+(EDIT?"true":"false")+'" aria-controls="pedit"><b>'+esc(lab)+'</b>'+esc(val)+'</button>'}
 return t("level","Level",lvl(i),1)+t("useby",x.useby?"Use-by":"+ Add use-by",x.useby||"Not set",!!x.useby)+t("min",x.min?"Minimum":"+ Add minimum",x.min||"Not set",!!x.min)+t("cat",i[6],"Category",1)}
function edit(i){var x=dflt(i[0]);
 function inp(k,lab,v,ph){return '<label class="f"><span>'+lab+'</span><input data-f="'+k+'" value="'+esc(v)+'" placeholder="'+(ph||"")+'" autocomplete="off"></label>'}
 function sel(k,lab,v,o,dis){return '<label class="f"><span>'+lab+'</span><select data-f="'+k+'"'+(dis?" disabled":"")+'>'+o.map(function(a){return '<option'+(a===v?" selected":"")+'>'+a+'</option>'}).join("")+'</select></label>'}
 return '<div class="edit" id="pedit" role="group" aria-label="Edit '+esc(i[2])+'">'+inp("qty","Quantity",i[4])+sel("area","Location",i[3],AREAS)+inp("spot","Spot",i[5],"Pick or type")+inp("cat","Category",i[6])+sel("level",isCount(i)?"Level (worked out from amount and minimum)":"Level",lvl(i),["Plenty","Some","Running low","Out"],isCount(i))+inp("useby","Use-by",x.useby,"e.g. 14 Oct")+inp("min","Minimum",x.min,"e.g. 2")+'<p class="eh"><span class="kbd">Esc</span> closes. Changes save as you go.</p></div>'}
function panel(){if(FP)return fpanel();var i=cur();
 if(!i)return '<div class="empty"><p>Pick an item to see it here.</p><p style="margin-top:8px"><span class="kbd">&uarr;</span> <span class="kbd">&darr;</span> to move, <span class="kbd">Esc</span> to close, <span class="kbd">?</span> for all shortcuts</p></div>';
 return '<div class="top" id="ptop">'+ptop(i)+'</div><div class="tiles" id="ptiles">'+tiles(i)+'</div>'+(EDIT?edit(i):"")
 +'<p class="phint">'+(isCount(i)?'<span class="kbd">U</span> use one ':"")+'<span class="kbd">D</span> used up <span class="kbd">S</span> shopping list <span class="kbd">E</span> edit</p><div class="acts"><button class="btn" data-hist>History</button></div>'}
function chipsHtml(){return dispA().map(function(a){var on=a==="All"?!selA().length:selA().indexOf(a)>-1;return '<button class="chip'+(on?" on":"")+'" data-a="'+esc(a)+'" aria-pressed="'+on+'">'+esc(a)+'</button>'}).join("")}
function modeBtn(){var loc=BY==="location";return '<button class="mode" id="modebtn" data-mode aria-label="Showing '+(loc?"locations":"categories")+'. Switch to '+(loc?"categories":"locations")+'" title="Switch between location and category"><svg viewBox="0 0 24 24" aria-hidden="true">'+(loc?IC.pin:IC.tag)+'</svg></button>'}
function ribbon(){return '<div class="ftw" id="ftw" hidden></div><div class="ribwrap" id="ribw"><div class="ribbon" id="rib">'+modeBtn()+'<div class="chips" id="chips" role="group" aria-label="Pick several with Ctrl or Command click.">'+chipsHtml()+'</div></div><button class="rcorner" id="rcorner" aria-label="Show all locations" title="Double-click to show all locations"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 10l5 5 5-5"/></svg></button><div class="rgrip" id="rgrip" role="separator" aria-orientation="horizontal" aria-label="Resize the locations. Arrow keys resize, Enter shows all." tabindex="0" title="Drag to resize. Double-click to show all."><i></i></div></div>'}
function pantry(){return '<div class="col"><div class="hd"><h1 class="sr">Pantry</h1><span class="count" id="cnt"></span><button class="btn" data-filters>Filters <span class="fbadge" id="fbadge" hidden></span><span class="kbd">F</span></button><button class="btn pri" aria-label="Add" data-add>+ Add</button><label class="find"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6"/><path d="M16 16l4 4"/></svg><input id="find" type="search" placeholder="Search your pantry" aria-label="Search your pantry" autocomplete="off"><span class="kbd">/</span></label></div>'+ribbon()+'<div id="lw">'+list()+'</div></div>'}
function cats(){var c=[];ITEMS.forEach(function(i){if(c.indexOf(i[6])<0)c.push(i[6])});return c.sort()}
function fch(k,v,lab,on,n){return '<button class="chip fc'+(on?" on":"")+'" data-fk="'+k+'" data-v="'+esc(v)+'" aria-pressed="'+on+'">'+esc(lab)+(n===undefined?"":' <i>'+n+'</i>')+'</button>'}
function fpanel(){var n=order().length,so=stOn();
 return '<div class="fp"><div class="fph"><div><h2>Filters</h2><p id="fcount">'+n+(n===1?" item":" items")+'</p></div><button class="btn pri" data-fdone>Done</button></div><div class="fpb">'
 +'<p class="fhint">Click picks one. <span class="kbd keep">'+(/Mac|iPhone|iPad/.test(navigator.platform||"")?"&#8984;":"Ctrl")+'</span> click adds more. The list updates as you go.</p>'
 +'<section><h3>Sort</h3><div class="fchips" role="group" aria-label="Sort">'+SORTS.map(function(t){return fch("sort",t[0],t[1],FSORT===t[0])}).join("")+'</div></section>'
 +'<section><h3>Status</h3><div class="fchips" role="group" aria-label="Status">'+STS.map(function(t){return fch("st",t[0],t[1],!!FST[t[0]],ITEMS.filter(t[2]).length)}).join("")+'</div></section>'
 +'<section><h3>Location</h3><div class="fchips" role="group" aria-label="Location">'+AREAS.slice(0,4).map(function(a){return fch("loc",a,a,SELA.indexOf(a)>-1,ITEMS.filter(function(i){return i[3]===a}).length)}).join("")+'</div></section>'
 +'<section><h3>Category</h3><div class="fchips" role="group" aria-label="Category">'+cats().map(function(c){return fch("cat",c,c,FCAT.indexOf(c)>-1,ITEMS.filter(function(i){return i[6]===c}).length)}).join("")+'</div></section></div>'
 +'<div class="fpf"><button class="btn" data-fclear'+(nF()||FSORT!=="none"?"":" disabled")+'>Clear</button><button class="btn" data-flast>Use last filters</button></div></div>'}
function fre(focus){if(!FP)return;var b=$(".fpb"),y=b?b.scrollTop:0;$("#panel").innerHTML=fpanel();var nb=$(".fpb");if(nb)nb.scrollTop=y;if(focus){var e=$('.fc[data-fk="'+focus[0]+'"][data-v="'+focus[1]+'"]');if(e)e.focus()}}
function syncChips(){settle();var c=$("#chips");if(c)c.innerHTML=chipsHtml()}
function pickF(k,v,e){var multi=e.ctrlKey||e.metaKey;FUSED=true;
 if(k==="sort")FSORT=v;
 else if(k==="st"){var on=!!FST[v],only=stOn().length===1&&on;if(multi){if(on)delete FST[v];else FST[v]=1}else{FST={};if(!only)FST[v]=1}}
 else if(k==="cat")FCAT=pickArr(FCAT,v,multi);
 else if(k==="loc")SELA=pickArr(SELA,v,multi);
 paintChips();lw();fre([k,v])}
function rmTile(k,v){if(k==="st")delete FST[v];else if(k==="loc")SELA=SELA.filter(function(x){return x!==v});else if(k==="cat")FCAT=FCAT.filter(function(x){return x!==v});else FSORT="none";paintChips();lw();fre()}
function ftiles(){var t=[];stOn().forEach(function(x){t.push(["st",x[0],"Status: "+x[1]])});SELA.forEach(function(a){t.push(["loc",a,"Location: "+a])});FCAT.forEach(function(c){t.push(["cat",c,"Category: "+c])});if(FSORT!=="none")t.push(["sort","none","Sort: "+SORTS.filter(function(x){return x[0]===FSORT})[0][1]]);
 return '<div class="ftiles" role="group" aria-label="Filters in use">'+t.map(function(x){return '<span class="ft">'+esc(x[2])+'<button data-frm="'+x[0]+'" data-v="'+esc(x[1])+'" aria-label="Remove '+esc(x[2])+'">&times;</button></span>'}).join("")+'<button class="ftclear" data-fclear2>Clear all</button></div>'}
function strip(){var rw=$("#ribw"),ft=$("#ftw");if(!rw||!ft)return;if(!nF()&&FSORT==="none")FUSED=false;var show=FUSED,was=!rw.hidden;rw.hidden=show;ft.hidden=!show;ft.innerHTML=show?ftiles():"";if(!show&&!was){measure();setH(RH)}}
function saveLast(){if(nF()||FSORT!=="none"){var st={};stOn().forEach(function(t){st[t[0]]=1});FLAST={st:st,loc:SELA.slice(),cat:FCAT.slice(),sort:FSORT}}}
function openF(){if(FP)return;settle();FP=true;redraw();var b=$("[data-fdone]");if(b)b.focus()}
function closeF(){if(!FP)return;saveLast();FP=false;redraw();focusRow()}
function clearF(){saveLast();FST={};FCAT=[];SELA=[];FSORT="none";FUSED=false;syncChips();lw();fre()}
function lastF(){FUSED=true;FST=JSON.parse(JSON.stringify(FLAST.st));SELA=FLAST.loc.slice();FCAT=FLAST.cat.slice();FSORT=FLAST.sort;syncChips();lw();fre()}
/* History mirrors Kitchie's journal (store.getHistory(id), MCP item_history): one entry per write, each with an action, the item before and after, the source and a note.
   Real entries come in bursts (a stepper tapped several times), so entries from one source within two minutes are shown as one line per field with the net change. Sample data only: nothing here is a real household. */
var HF=[["qty","Quantity"],["min","Minimum"],["staple","Staple"],["level","Level"],["useby","Use-by"],["area","Location"]],SRC={"item-sheet":"Item sheet",assistant:"Assistant",import:"Import",desk:"This page"};
function jr(t,who,src,a,b,gap){return{t:t,who:who,src:src,gap:gap||0,before:a,after:b}}
function journal(i){var c=isCount(i),q=i[4],n=parseFloat(q),alt=c&&n>0?q.replace(String(n),String(n+1)):q,m=Math.max(1,Math.round(c&&n>0?n:2));
 var J=[jr("Fri 25 Sep, 11:10 am","Priya","import",{},{qty:q,area:i[3]}),
  jr("Sat 3 Oct, 9:05 am","Priya","assistant",{area:i[3]==="Fridge"?"Pantry":"Fridge"},{area:i[3]}),
  jr("Wed 7 Oct, 6:40 pm","Sam","item-sheet",{qty:q,min:"",staple:"No"},{qty:alt,min:"",staple:"No"}),
  jr("Wed 7 Oct, 6:40 pm","Sam","item-sheet",{qty:alt,min:"",staple:"No"},{qty:q,min:"",staple:"No"},12),
  jr("Wed 7 Oct, 6:40 pm","Sam","item-sheet",{qty:q,min:"",staple:"No"},{qty:q,min:m+1,staple:"Yes"},20),
  jr("Wed 7 Oct, 6:41 pm","Sam","item-sheet",{qty:q,min:m+1,staple:"Yes"},{qty:q,min:m,staple:"Yes"},8)];
 return J}
function net(group){var a=group[0].before,b=group[group.length-1].after,out=[];HF.forEach(function(f){var x=a[f[0]],y=b[f[0]];if(x===undefined&&y===undefined)return;if(String(x===undefined?"":x)!==String(y===undefined?"":y))out.push([f[1],x===undefined||x===""?"not set":x,y===undefined||y===""?"not set":y,x===undefined])});return out}
function hevents(i){var J=journal(i),G=[];J.forEach(function(e){var g=G[G.length-1];if(g&&g[0].src===e.src&&g[0].who===e.who&&e.gap&&e.gap<=120)g.push(e);else G.push([e])});
 var out=G.map(function(g){var ch=net(g),first=g[0].before&&!Object.keys(g[0].before).length;return{t:g[0].t,who:g[0].who,src:g[0].src,n:g.length,added:first,ch:ch}}).filter(function(e){return e.added||e.ch.length});
 return out.reverse().concat((HLOG[i[0]]||[]).map(function(x){return{t:"Just now",who:"Sam",src:"desk",n:1,added:false,ch:[],text:x[2]}}).reverse()).sort(function(a,b){return(b.t==="Just now")-(a.t==="Just now")})}
function addLog(i,t){(HLOG[i[0]]=HLOG[i[0]]||[]).unshift(["Just now","Sam",t])}
function hline(e){if(e.text)return '<b>'+esc(e.text)+'</b>';if(e.added)return '<b>Added</b><span class="hch">'+esc(e.ch.map(function(c){return c[0]+" "+c[2]}).join(", "))+'</span>';return '<b>'+(e.ch.length===1?esc(e.ch[0][0])+" changed":"Edited")+(e.n>1?' <em>'+e.n+' edits</em>':"")+'</b>'+e.ch.map(function(c){return '<span class="hch">'+esc(c[0])+': '+esc(c[1])+' &rarr; '+esc(c[2])+'</span>'}).join("")}
function hcol(i){return '<div class="hh"><div><h2>History</h2><p>'+esc(i[2])+' only</p></div><button class="x" data-hclose aria-label="Close history">&times;</button></div><ol class="hist" aria-label="History of '+esc(i[2])+'">'+hevents(i).map(function(e){return '<li>'+hline(e)+'<span>'+esc(e.t)+' · '+esc(e.who)+' · '+esc(SRC[e.src]||e.src)+'</span></li>'}).join("")+'</ol><p class="phint"><span class="kbd">Esc</span> closes this column. Pick another row to see its history.</p>'}
function drawH(){var h=$("#hcol"),i=cur();if(!h)return;var on=HIST&&!!i;h.hidden=!on;h.innerHTML=on?hcol(i):"";var a=$(".app");if(a)a.classList.toggle("hopen",on)}
function sofar(){return ITEMS.filter(function(i){return i[7]!==null&&i[7]<=3}).sort(function(a,b){return a[7]-b[7]})}
function homeCards(){var s=sofar().slice(0,3);
 return '<section class="card"><div class="th"><span class="ric">⏱</span><h2>On the way out</h2><button class="va">View all</button></div><div class="three">'+s.map(function(i){return '<button class="mini" data-id="'+i[0]+'"><span class="em">'+(i[1]||"🍽️")+'</span><b>'+i[2]+'</b><span>'+(i[7]===0?"Today":i[7]===1?"Tomorrow":"in "+i[7]+" days")+'</span></button>'}).join("")+'</div></section>'
 +'<section class="card"><div class="th"><span class="ric">🧺</span><h2>Running low</h2><button class="va">View all</button></div>'
 +[["🥛","Milk","1 L left","On your list"],["","Paneer","50 g left",""],["🥬","Spinach","50 g left",""]].map(function(r){return '<div class="lrow"><span class="em">'+(r[0]||"🍽️")+'</span><div><b>'+r[1]+'</b><span class="s">'+r[2]+'</span></div>'+(r[3]?'<span class="tag" style="margin-left:auto;font-size:12px;border:1px solid var(--border);border-radius:99px;padding:3px 10px">'+r[3]+'</span>':'<button class="btn pri">Add</button>')+'</div>'}).join("")+'</section>'}
function ideas(){return '<section class="card" style="margin-top:0"><div class="th"><span class="ric">👩‍🍳</span><h2>Cooking ideas for you</h2><button class="va">See all</button></div>'
 +[["🍳","Egg fried rice","You have 5 of 6"],["🍝","Tomato pasta","You have 4 of 5"],["🥘","Palak paneer","You have 4 of 7"]].map(function(r){return '<div class="idea"><span class="ph">'+r[0]+'</span><div><b>'+r[1]+'</b><p>'+r[2]+'</p></div></div>'}).join("")+'</section>'}
function home(){var g='<h1 style="font-size:2.2rem">Good morning, Sam.</h1>';
 return '<div class="col">'+g+homeCards()+'</div>'}
var HELPHTML='<div class="kb" id="kb" hidden><div class="kbc" role="dialog" aria-modal="true" aria-labelledby="kbt"><div class="kbh"><h2 id="kbt">Keyboard shortcuts</h2><button class="x" data-help-close aria-label="Close">&times;</button></div><div class="kbg">'
 +G("Move",[["&uarr; &darr; or J K","Previous or next item"],["Enter or E","Edit the open item"],["Esc","Close the edit, then the item"],["/","Search your pantry"]])
 +G("The open item",[["U","Use one (counted items only; other items change by level)"],["D","Used up"],["S","Add to, or take off, the shopping list"],["Z","Undo the last change"]])
 +G("Go to",[["G then H","Home"],["G then P","Pantry"],["G then R","Recipes"],["G then S","Shopping"]])
 +G("General",[["N","Add an item"],["F","Filters side panel (F or Esc closes, picks stay)"],["? or H","This list"],["Esc","Close this list"]])
 +G("Location pills",[["Click","Show just that location"],["Ctrl or &#8984; click","Pick several"],["~Drag the bar below","Show more rows. Scroll for the rest"],["~Double-click the top right corner","Show every pill"]])
 +'</div><div class="kbt"><span id="cuel">Show shortcut cues on buttons and hints</span><button type="button" class="sw2" id="cuetog" role="switch" aria-checked="true" aria-labelledby="cuel" data-cues><i>On</i></button></div><p class="kbf">Shortcuts pause while you type in a box. Picked pills move to the left after 5 seconds, or when you use the list.</p></div></div>';
function G(t,r){return '<section class="kbs"><h3>'+t+'</h3>'+r.map(function(x){var k=x[0][0]==="~"?x[0].slice(1):x[0].split(" ").map(function(w){return /^(then|or|and|click)$/.test(w)?'<em>'+w+'</em>':'<kbd>'+w+'</kbd>'}).join(" ");return '<div class="kbr"><span class="kk">'+k+'</span><span>'+x[1]+'</span></div>'}).join("")+'</section>'}
var sw='';
var main=SCR==="pantry"?pantry():home();
var h=sw+'<div class="app"><nav class="rail" aria-label="Main"><div class="brand">Our<br>kitchen</div><div id="navw" style="display:contents">'+nav()+'</div><div class="me"><button class="nv" data-help aria-label="Keyboard shortcuts"><span class="qk">?</span><span>Keys</span></button><button class="av" data-profile aria-label="Profile and settings" aria-haspopup="dialog">S</button></div></nav><main class="main">'+main+'</main><aside class="panel" id="panel" aria-label="'+(SCR==="home"?"Ideas":"Item detail")+'">'+(SCR==="pantry"?panel():ideas())+'</aside>'+(SCR==="pantry"?'<aside class="hcol" id="hcol" hidden aria-label="History"></aside>':"")+'</div><div class="toast" id="toast" role="status" hidden></div>'+HELPHTML;
document.body.innerHTML=h;try{if(localStorage.getItem("desktop-cues")==="0")cues(false)}catch(e){}
function snap(){return JSON.stringify([ITEMS,LIST,SHOPN,X,SEL])}
function toast(msg,undo){clearTimeout(TT);var t=$("#toast");t.innerHTML='<span>'+msg+'</span>'+(undo?'<button data-undo>Undo <span class="kbd">Z</span></button>':"");t.hidden=false;UNDO=undo||null;TT=setTimeout(function(){t.hidden=true;UNDO=null},6000)}
function url(){try{var u=new URL(location.href);if(SEL)u.searchParams.set("sel",SEL);else u.searchParams.delete("sel");history.replaceState(null,"",u)}catch(e){}}
function lw(){var l=$("#lw");if(l)l.innerHTML=list();var c=$("#cnt");if(c)c.textContent=order().length+(order().length===1?" item":" items");var fb=$("#fbadge");if(fb){fb.textContent=nF();fb.hidden=!nF()}var fc=$("#fcount");if(fc)fc.textContent=c.textContent;strip()}
function redraw(){NAV[3][2]=SHOPN;if(SCR!=="pantry")return;lw();$("#panel").innerHTML=panel();$("#navw").innerHTML=nav();drawH();url()}
function focusRow(){var r=$('li[data-id="'+SEL+'"] .row');if(r){r.focus({preventScroll:true});r.scrollIntoView({block:"nearest"})}}
function focusF(k){var e=$('#pedit [data-f="'+k+'"]');if(e){e.focus();if(e.select&&e.tagName==="INPUT")e.select()}}
function select(id){SEL=id;EDIT=false;settle();redraw();focusRow()}
function move(d){var o=order();if(!o.length)return;var ids=o.map(function(i){return i[0]}),ix=ids.indexOf(SEL);ix=ix<0?(d>0?0:o.length-1):Math.max(0,Math.min(o.length-1,ix+d));select(ids[ix])}
function openEdit(k){if(!cur())return;EDIT=true;EF=k||"qty";$("#panel").innerHTML=panel();focusF(EF)}
function closeEdit(){EDIT=false;$("#panel").innerHTML=panel();focusRow()}
function setF(k,v){var i=cur(),x=dflt(i[0]);if(k==="qty")i[4]=v;else if(k==="area")i[3]=v;else if(k==="spot")i[5]=v;else if(k==="cat")i[6]=v;else x[k]=v;lw();$("#ptop").innerHTML=ptop(i);$("#ptiles").innerHTML=tiles(i)}
function act(kind){var i=cur();if(!i)return;settle();var s=snap();
 if(kind==="use"){if(isCount(i)){var n=parseFloat(i[4]);if(n>1){i[4]=i[4].replace(String(n),String(n-1));addLog(i,"Used one. "+i[4]+" left.");redraw();toast("Used one "+esc(i[2])+". "+esc(i[4])+" left.",s)}else act("done")}else{toast(esc(i[2])+" is not counted, so there is no Use one. Change its level instead.")}return}
 if(kind==="done"){addLog(i,"Used up");var o=order(),ix=o.indexOf(i);ITEMS=ITEMS.filter(function(x){return x!==i});o=order();var nx=o[ix]||o[ix-1];SEL=nx?nx[0]:null;EDIT=false;redraw();toast(esc(i[2])+" is used up. It is in History.",s);if(SEL)focusRow();return}
 if(kind==="list"){if(LIST[i[0]]){addLog(i,"Taken off the shopping list");delete LIST[i[0]];SHOPN--;redraw();toast(esc(i[2])+" is off your shopping list.",s)}else{addLog(i,"Added to the shopping list");LIST[i[0]]=1;SHOPN++;redraw();toast(esc(i[2])+" is on your shopping list.",s)}}}
function doUndo(){if(!UNDO)return;var a=JSON.parse(UNDO);UNDO=null;ITEMS=a[0];LIST=a[1];SHOPN=a[2];X=a[3];SEL=a[4];redraw();toast("Undone.")}
function cues(on){CUES=on;document.body.classList.toggle("nocues",!on);try{localStorage.setItem("desktop-cues",on?"1":"0")}catch(e){}var b=$("#cuetog");if(b){b.setAttribute("aria-checked",on);b.querySelector("i").textContent=on?"On":"Off"}}
function profile(opener){function go(){window.KProfile&&KProfile.open(opener)}if(window.KProfile)return go();var l=document.createElement("link");l.rel="stylesheet";l.href="../desktop-profile/profile.css";document.head.appendChild(l);var j=document.createElement("script");j.src="../desktop-profile/profile.js";j.onload=go;document.head.appendChild(j)}
function help(on){HELP=on;$("#kb").hidden=!on;if(on){LASTF=document.activeElement;$("#kb [data-help-close]").focus()}else if(LASTF&&document.contains(LASTF)&&LASTF.focus)LASTF.focus()}
// Location pills: resizable area, multi-select, tidy up after 5 seconds or on first use of the list
function measure(){var c=$("#chips");if(!c||!c.firstChild)return;ROW=c.firstChild.offsetHeight+14;FULLH=Math.max(ROW,c.scrollHeight+14)}
function setH(v){var r=$("#rib");if(!r)return;RH=Math.max(ROW,Math.min(FULLH,Math.round(v)));r.style.height=RH+"px";var all=RH>=FULLH;r.dataset.full=all?"1":"0";$("#rgrip").setAttribute("aria-valuenow",RH);$("#rcorner").classList.toggle("open",all)}
function togglePills(){setH(RH>=FULLH?ROW:FULLH)}
function paintChips(){var c=$("#chips");if(!c)return;[].forEach.call(c.children,function(b){var n=b.dataset.a,on=n==="All"?!selA().length:selA().indexOf(n)>-1;b.classList.toggle("on",on);b.setAttribute("aria-pressed",on)})}
function chip(a,e){var multi=e.ctrlKey||e.metaKey;if(a==="All")setSelA([]);else setSelA(pickArr(selA(),a,multi));paintChips();lw();clearTimeout(ST);ST=setTimeout(settle,5000)}
function settle(){clearTimeout(ST);ST=null;var c=$("#chips");if(!c)return;var N=names(),sel=N.filter(function(a){return selA().indexOf(a)>-1}),nd=["All"].concat(sel,N.filter(function(a){return sel.indexOf(a)<0}));if(nd.join()===dispA().join())return;
 var old={};[].forEach.call(c.children,function(b){old[b.dataset.a]=b.getBoundingClientRect()});setDispA(nd);c.innerHTML=chipsHtml();$("#rib").scrollTop=0;
 if(window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches)return;
 [].forEach.call(c.children,function(b){var o=old[b.dataset.a],n=b.getBoundingClientRect(),dx=o.left-n.left,dy=o.top-n.top;if(dx||dy){b.style.transition="none";b.style.transform="translate("+dx+"px,"+dy+"px)";b.offsetWidth;b.style.transition="transform .35s ease";b.style.transform=""}})}
if(SCR==="pantry"){measure();setH(ROW);if(Q.get("filters")==='1'){if(Q.get("pre")==='1'){FST={soon:1};FCAT=["Dairy and eggs"];FSORT="useby"}FP=true;$("#panel").innerHTML=panel()}lw();window.addEventListener("resize",function(){measure();setH(RH)});
 var g=$("#rgrip");g.addEventListener("pointerdown",function(e){e.preventDefault();g.setPointerCapture(e.pointerId);var y0=e.clientY,h0=RH;$("#rib").dataset.drag=1;function mv(ev){setH(h0+ev.clientY-y0)}function up(){delete $("#rib").dataset.drag;g.removeEventListener("pointermove",mv);g.removeEventListener("pointerup",up)}g.addEventListener("pointermove",mv);g.addEventListener("pointerup",up)});
 g.addEventListener("dblclick",togglePills);$("#rcorner").addEventListener("dblclick",togglePills);$("#rcorner").addEventListener("click",function(e){if(e.detail===0)togglePills()});
 g.addEventListener("keydown",function(e){var k=e.key;if(k==="ArrowDown"){setH(RH+ROW);e.preventDefault()}else if(k==="ArrowUp"){setH(RH-ROW);e.preventDefault()}else if(k==="Home"){setH(ROW);e.preventDefault()}else if(k==="End"||k==="Enter"){k==="End"?setH(FULLH):togglePills();e.preventDefault()}});
 $("#find").addEventListener("input",function(e){FIND=e.target.value;lw()});
 document.body.addEventListener("input",function(e){var f=e.target.dataset&&e.target.dataset.f;if(f)setF(f,e.target.value)});
 document.body.addEventListener("change",function(e){var f=e.target.dataset&&e.target.dataset.f;if(f&&e.target.tagName==="SELECT")setF(f,e.target.value)})}
document.body.addEventListener("click",function(e){var t=e.target,c;
 if(t.closest("[data-cues]")){cues(!CUES);return}
 if(c=t.closest("[data-profile]")){profile(c);return}
 if(t.closest("[data-help]")){help(true);return}
 if(t.closest("[data-help-close]")||t.id==="kb"){help(false);return}
 if(t.closest("[data-undo]")){doUndo();return}
 if(SCR!=="pantry")return;
 if(c=t.closest("[data-act]")){var li=c.closest("li");if(li.dataset.id!==SEL){SEL=li.dataset.id;EDIT=false}act(c.dataset.act);return}
 if(c=t.closest("[data-open]")){select(c.dataset.open);return}
 if(t.closest("[data-close]")){SEL=null;EDIT=false;HIST=false;settle();redraw();return}
 if(c=t.closest("[data-edit]")){openEdit(c.dataset.edit);return}
 if(c=t.closest(".chip:not(.fc)")){chip(c.dataset.a,e);return}
 if(c=t.closest(".fc")){pickF(c.dataset.fk,c.dataset.v,e);return}
 if(c=t.closest("[data-frm]")){rmTile(c.dataset.frm,c.dataset.v);return}
 if(t.closest("[data-fclear2]")){clearF();return}
 if(t.closest("[data-mode]")){BY=BY==="location"?"category":"location";$("#rib").innerHTML=modeBtn()+'<div class="chips" id="chips" role="group" aria-label="Pick several with Ctrl or Command click.">'+chipsHtml()+'</div>';measure();setH(RH);lw();$("#modebtn").focus();return}
 if(t.closest("[data-hist]")){HIST=!HIST;drawH();if(HIST){var hb=$("[data-hclose]");if(hb)hb.focus()}return}
 if(t.closest("[data-hclose]")){HIST=false;drawH();focusRow();return}
 if(t.closest("[data-fdone]")){closeF();return}
 if(t.closest("[data-fclear]")){clearF();return}
 if(t.closest("[data-flast]")){lastF();return}
 if(t.closest("[data-filters]")){FP?closeF():openF();return}
 if(t.closest("[data-add]")){toast("Add opens the add form (not drawn here).");return}});
document.addEventListener("kitchie-help",function(){help(!HELP)});
document.addEventListener("keydown",function(e){var k=e.key,t=e.target,typing=!!(t.closest&&t.closest("input,textarea,select,[contenteditable]"));
 if(k==="Escape"){if(HELP){help(false);e.preventDefault();return}
  if(SCR!=="pantry")return;
  if(t.id==="find"){t.value="";FIND="";lw();t.blur();return}
  if(FP){closeF();return}
  if(HIST){HIST=false;drawH();focusRow();return}
  if(EDIT){closeEdit();return}
  if(SEL&&!typing){SEL=null;settle();redraw()}return}
 if(e.ctrlKey||e.metaKey||e.altKey||typing)return;
 var K=k.length===1?k.toLowerCase():k;
 if(PEND){PEND=null;clearTimeout(PT);var d={h:"home.html",p:"pantry.html"}[K];if(d)location.href=d;else if(K==="r"||K==="s")toast("Recipes and Shopping are not drawn in this fragment.");e.preventDefault();return}
 if(k==="?"||K==="h"){help(!HELP);e.preventDefault();return}
 if(HELP)return;
 if(K==="g"){PEND=1;PT=setTimeout(function(){PEND=null},1500);return}
 if(SCR!=="pantry"||(t.closest&&t.closest(".rgrip")))return;
 if(k==="ArrowDown"||K==="j"){move(1);e.preventDefault()}
 else if(k==="ArrowUp"||K==="k"){move(-1);e.preventDefault()}
 else if(k==="Enter"||K==="e"){if(k==="Enter"&&!(t===document.body||t.closest(".row")))return;e.preventDefault();settle();if(!cur()){var o=order();if(!o.length)return;SEL=o[0][0];redraw()}openEdit("qty")}
 else if(K==="u"||K==="d"||K==="s"){e.preventDefault();if(!cur()){toast("Pick an item first.");return}act({u:"use",d:"done",s:"list"}[K])}
 else if(K==="z"){e.preventDefault();doUndo()}
 else if(K==="n"){e.preventDefault();toast("Add opens the add form (not drawn here).")}
 else if(K==="f"){FP?closeF():openF();e.preventDefault()}
 else if(k==="/"){e.preventDefault();var f=$("#find");if(f)f.focus()}});
})();
