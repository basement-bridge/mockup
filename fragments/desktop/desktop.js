/* Desktop mockup renderer. Static sample data, no storage. ?o=A|B picks the option, ?sel=butter pre-selects an item. */
(function(){
var Q=new URLSearchParams(location.search),O=Q.get("o")==="B"?"B":"A",SCR=document.body.dataset.screen,SEL=Q.get("sel")||null,AREA="All";
var ITEMS=[["butter","🧈","butter","Fridge","250 g","Door","Dairy and eggs",null],["carrots","🥕","carrots","Fridge","1 bag","Crisper","Vegetables",null],["cheddar","","cheddar","Fridge","200 g","Top shelf","Dairy and eggs",null],["eggs","🥚","eggs","Fridge","12","Door","Dairy and eggs",null],["yog","","greek yoghurt","Fridge","500 g","Top shelf","Dairy and eggs",7],["milk","🥛","milk","Fridge","1 L","Door","Dairy and eggs",0],["paneer","","paneer","Fridge","50 g","Top shelf","Dairy and eggs",3],["spinach","🥬","spinach","Fridge","50 g","Crisper","Vegetables",1],["rice","🍚","Basmati rice","Pantry","5 kg","Bottom shelf","Dry goods",null],["tom","🥫","Chopped tomatoes","Pantry","4 tin","Top shelf","Cans",null],["onion","🧅","Onions","Pantry","6","Baskets","Vegetables",null],["garam","","Garam masala","Pantry","1 jar","Spice rack","Seasoning",null]];
var IC={home:'<path d="M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',pantry:'<path d="M7 3h10v3H7zM6 6h12v14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1zM9 11h6v5H9z"/>',recipes:'<path d="M7 14a4 4 0 1 1 2-7 4 4 0 0 1 6 0 4 4 0 1 1 2 7v6H7z"/>',cart:'<path d="M3 4h2l2.4 11h10l2-8H6.2M9 20h.01M17 20h.01"/>'};
var NAV=[["home","Home",0],["pantry","Pantry",0],["recipes","Recipes",2],["cart","Shopping",3]];
function nav(cls){return NAV.map(function(n){var on=(SCR==="home"&&n[0]==="home")||(SCR==="pantry"&&n[0]==="pantry");return '<button class="nv '+(on?"on":"")+'" '+(on?'aria-current="page"':"")+'><svg viewBox="0 0 24 24" aria-hidden="true">'+IC[n[0]]+'</svg><span>'+n[1]+'</span>'+(n[2]?'<i class="n">'+n[2]+'</i>':"")+'</button>'}).join("")}
function due(d){return d===null?"":d===0?'<span class="due hot">Today</span>':d===1?'<span class="due hot">Tomorrow</span>':'<span class="due">Use within<br>'+d+' days</span>'}
function row(i){return '<li><button class="row '+(SEL===i[0]?"sel":"")+'" data-id="'+i[0]+'" aria-haspopup="dialog"><div><div class="nm">'+(i[1]?i[1]+" ":"")+i[2]+'</div><div class="mt">'+i[3]+' · '+i[4]+' · '+i[5]+' · '+i[6]+'</div></div>'+due(i[7])+'</button></li>'}
function list(){var h="",A=["Fridge","Pantry"];A.forEach(function(a){var its=ITEMS.filter(function(i){return i[3]===a});h+='<div class="grp"><h2>'+a+'</h2><span class="kbd">'+its.length+'</span></div><ul class="rows">'+its.map(row).join("")+'</ul>'});return h}
function panel(){var i=ITEMS.filter(function(x){return x[0]===SEL})[0];
 if(!i)return '<div class="empty"><p>Pick an item to see it here.</p><p style="margin-top:8px"><span class="kbd">&uarr;</span> <span class="kbd">&darr;</span> to move, <span class="kbd">Esc</span> to close</p></div>';
 return '<div class="top"><span class="ph">'+(i[1]||"🧀")+'</span><div><h2>'+i[2]+'</h2><p>'+i[4]+'</p><p><b style="color:var(--fg)">'+i[3]+'</b> · '+i[5]+'</p></div><button class="x" aria-label="Close" data-close>&times;</button></div>'
 +'<div class="tiles"><div class="tl set"><b>Level</b>Plenty</div><div class="tl"><b>+ Add use-by</b>Not set</div><div class="tl"><b>+ Add minimum</b>Not set</div><div class="tl set"><b>'+i[6]+'</b>Category</div></div>'
 +'<div class="acts"><button class="btn">&#10003; Used up</button><button class="btn">&#10003; On your list</button><button class="btn">History</button></div>'}
function pantry(){return '<div class="col"><div class="hd"><h1>Pantry</h1><span class="count">&nbsp;16 items</span><button class="btn">Filters</button><button class="btn pri" aria-label="Add">+ Add</button></div>'
 +'<div class="ribbon"><button class="chip on">All</button><button class="chip">Fridge</button><button class="chip">Pantry</button><button class="chip">Freezer</button></div>'+list()+'</div>'}
function sofar(){return ITEMS.filter(function(i){return i[7]!==null&&i[7]<=3}).sort(function(a,b){return a[7]-b[7]})}
function homeCards(){var s=sofar().slice(0,3);
 return '<section class="card"><div class="th"><span class="ric">⏱</span><h2>On the way out</h2><button class="va">View all</button></div><div class="three">'+s.map(function(i){return '<button class="mini" data-id="'+i[0]+'"><span class="em">'+(i[1]||"🍽️")+'</span><b>'+i[2]+'</b><span>'+(i[7]===0?"Today":i[7]===1?"Tomorrow":"in "+i[7]+" days")+'</span></button>'}).join("")+'</div></section>'
 +'<section class="card"><div class="th"><span class="ric">🧺</span><h2>Running low</h2><button class="va">View all</button></div>'
 +[["🥛","Milk","1 L left","On your list"],["","Paneer","50 g left",""],["🥬","Spinach","50 g left",""]].map(function(r){return '<div class="lrow"><span class="em">'+(r[0]||"🍽️")+'</span><div><b>'+r[1]+'</b><span class="s">'+r[2]+'</span></div>'+(r[3]?'<span class="tag" style="margin-left:auto;font-size:12px;border:1px solid var(--border);border-radius:99px;padding:3px 10px">'+r[3]+'</span>':'<button class="btn pri">Add</button>')+'</div>'}).join("")+'</section>'}
function ideas(){return '<section class="card" style="margin-top:0"><div class="th"><span class="ric">👩‍🍳</span><h2>Cooking ideas for you</h2><button class="va">See all</button></div>'
 +[["🍳","Egg fried rice","You have 5 of 6"],["🍝","Tomato pasta","You have 4 of 5"],["🥘","Palak paneer","You have 4 of 7"]].map(function(r){return '<div class="idea"><span class="ph">'+r[0]+'</span><div><b>'+r[1]+'</b><p>'+r[2]+'</p></div></div>'}).join("")+'</section>'}
function home(){var g='<h1 style="font-size:2.2rem">Good morning, Sam.</h1>';
 if(O==="A")return '<div class="col">'+g+homeCards()+'</div>';
 return '<div class="two"><div>'+g+homeCards()+'</div><div style="padding-top:44px">'+ideas()+'</div></div>'}
function sidepanel(){ // Home in option A keeps the right column as "Cooking ideas" (secondary content beside, not under)
 return SCR==="home"?ideas():panel()}
var sw='<div class="sw"><a href="index.html">&lsaquo; Desktop</a><span>Option</span><a class="'+(O==="A"?"on":"")+'" href="?o=A'+(SEL?'&sel='+SEL:'')+'">A · Rail + side panel</a><a class="'+(O==="B"?"on":"")+'" href="?o=B'+(SEL?'&sel='+SEL:'')+'">B · Top bar + drawer</a><span class="sp"></span><span class="kbd">1280 × 800 target</span></div>';
var main=SCR==="pantry"?pantry():home();
document.body.classList.add(O);
if(O==="B"&&SEL&&SCR==="pantry")document.body.classList.add("open");
var h=sw;
if(O==="A"){h+='<div class="app"><nav class="rail" aria-label="Main"><div class="brand">Our<br>kitchen</div>'+nav()+'<div class="me"><span class="av">S</span></div></nav><main class="main">'+main+'</main><aside class="panel" id="panel" aria-label="'+(SCR==="home"?"Ideas":"Item detail")+'">'+(SCR==="pantry"?panel():ideas())+'</aside></div>'}
else{h+='<nav class="topbar" aria-label="Main"><span class="brand">Our kitchen</span>'+nav()+'<span class="sp"></span><span class="av">S</span></nav><div class="app"><main class="main">'+main+'</main>'+(SCR==="pantry"?'<aside class="panel" id="panel" aria-label="Item detail">'+panel()+'</aside>':'')+'</div>'}
document.body.innerHTML=h;
if(SCR==="pantry")document.body.addEventListener("click",function(e){var r=e.target.closest("[data-id]");if(r){SEL=r.dataset.id;go()}var c=e.target.closest("[data-close]");if(c){SEL=null;go()}});
function go(){var u=new URL(location.href);if(SEL)u.searchParams.set("sel",SEL);else u.searchParams.delete("sel");location.href=u}
document.addEventListener("keydown",function(e){if(e.key==="Escape"&&SEL){SEL=null;go()}});
})();
