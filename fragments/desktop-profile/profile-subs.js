/* Settings window sub-screens (mockup, 11 Oct 2026, round 4). Loaded by profile.js the first time one is needed: Categories, Locations and spots, Install,
   the Preferences desktop layouts A, B and C, and the rows that open in place on a phone or tablet. Static sample data, no storage, no network.
   Rule for all of them (owner): nothing here is a page of its own. A group opens under its entry (desktop: in the left gutter; phone and tablet: under its row),
   and the detail of one row is a flyout in the main area (desktop, 1168px and up: beside the list; 901 to 1167px: it takes the main area; 600 to 900px: a drawer;
   under 600px: a bottom sheet). The window never changes page, and the close chord closes the flyout first, then the window. */
(function(){
"use strict";
var $=function(s,r){return(r||document).querySelector(s)};
var $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
var P={
 chev:'<path d="M9 6l6 6-6 6"/>',close:'<path d="M6 6l12 12M18 6L6 18"/>',back:'<path d="M15 6l-6 6 6 6"/>',
 down:'<path d="M12 4v11M7 11l5 5 5-5M5 20h14"/>',lock:'<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
 plus:'<path d="M12 5v14M5 12h14"/>',up:'<path d="M6 15l6-6 6 6"/>',dn:'<path d="M6 9l6 6 6-6"/>',tag:'<path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="8.5" r="1.2"/>',
 pin:'<path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',monitor:'<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>',
 share:'<path d="M12 15V4M8 8l4-4 4 4M6 12v7h12v-7"/>',dots:'<circle cx="12" cy="5" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="12" cy="19" r="1.4"/>',
 check:'<path d="M5 12.5l4.5 4.5L19 7"/>',copy:'<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h8"/>',minus:'<path d="M5 12h14"/>'};
function ic(k,s){s=s||20;return '<svg class="pf-i" viewBox="0 0 24 24" width="'+s+'" height="'+s+'" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">'+P[k]+'</svg>'}
function esc(t){return String(t).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
function narrow(){return window.matchMedia("(max-width:900px)").matches}
var ESCL=/Mac|iPhone|iPad/.test(navigator.platform||"")?"⌘ Esc":"Ctrl Esc";

/* ---------- sample data (the household's; changed in this module only while the page is open) ---------- */
var CATS=[["dairy","🥛","Dairy and eggs",["butter","eggs","greek yoghurt","milk","paneer","cream"]],["veg","🥕","Vegetables",["carrots","spinach","tomatoes","onions"]],["fruit","🍎","Fruits",["apples","lemons"]],["meat","🥩","Meat",["chicken thighs","mince","bacon"]],["dry","🌾","Dry goods",["rice","pasta","flour","oats","sugar","lentils","couscous","cornflour","noodles"]],["cans","🥫","Cans",["chickpeas","tomatoes (tin)","coconut milk","tuna"]],["season","🧂","Seasoning",["salt","pepper","cumin","paprika","turmeric","oregano","chilli flakes"]],["snack","🍿","Snacks",["crackers","nuts"]],["frozen","🧊","Frozen",["peas","fish fingers","berries","bread","ice"]],["other","📦","Other",["baking paper"]]];
var LOCS=[["fridge","Fridge",[["door","Door",4],["top","Top shelf",3],["crisper","Crisper",3],["mid","Middle shelf",2]]],["pantry","Pantry",[["shelf1","Shelf 1",6],["shelf2","Shelf 2",5],["cupboard","Cupboard",4],["spice","Spice rack",7]]],["freezer","Freezer",[["d1","Drawer 1",3],["d2","Drawer 2",2],["fdoor","Door",1]]]];
function cat(id){return CATS.filter(function(c){return c[0]===id})[0]}
function loc(id){return LOCS.filter(function(l){return l[0]===id})[0]}
function spot(ref){var p=ref.split("."),l=loc(p[0]);return l?{l:l,s:l[2].filter(function(s){return s[0]===p[1]})[0]}:null}
function locCount(l){return l[2].reduce(function(n,s){return n+s[2]},0)}
function plural(n,w){return n+" "+w+(n===1?"":"s")}

/* ---------- Install ---------- */
function ua(){var u=navigator.userAgent||"";return /Edg\//.test(u)?"edge":/Firefox\//.test(u)?"firefox":/Chrome\//.test(u)?"chrome":/Safari\//.test(u)?"safari":"chrome"}
function desk(m){return /^(chrome|edge|safari|firefox)$/.test(m.os)?m.os:ua()}
function mob(m){return /^(ios|android)$/.test(m.os)?m.os:(ua()==="safari"?"ios":"android")}
var BR={chrome:"Chrome",edge:"Edge",safari:"Safari",firefox:"Firefox"};
function addrBar(){return '<div class="pf-addr" aria-hidden="true"><span class="pf-addr-lock">'+ic("lock",14)+'</span><span class="pf-addr-url">kitchen.example</span><span class="pf-addr-ico">'+ic("monitor",18)+'<i>'+ic("down",9)+'</i></span></div><div class="pf-addr-cap" aria-hidden="true"><span>The install icon, at the right end of the address bar</span></div>'}
function menuIll(){return '<div class="pf-menu" aria-hidden="true"><b>File</b><span>New Window</span><span>New Private Window</span><span>Open Location…</span><span class="hl">Add to Dock…</span><span>Share</span></div>'}
function installDesktop(m){
 var b=desk(m),h='',names=BR[b];
 h+='<div class="pf-inst"><div class="pf-inst-t"><span class="pf-ico big">'+ic("monitor",22)+'</span><div><h3 class="pf-h">On this computer</h3><p>It opens in its own window with no tabs or address bar, and starts from your Dock, Start menu or Launchpad. You can do this as often as you like.</p></div></div>';
 h+='<p class="pf-small pf-detect" data-detect="'+b+'">You are in <b>'+names+'</b> on a computer. A phone or tablet gets its own steps.</p>';
 if(b==="chrome"||b==="edge"){
  h+='<div class="pf-inst-main"><div class="pf-inst-l"><button type="button" class="pf-btn pri pf-big" data-inst="go">'+ic("down",20)+' Install Kitchie</button><p class="pf-small">'+names+' asks once, then Kitchie opens in its own window.</p>'
   +(m.idone?'<p class="pf-note ok" role="status">'+ic("check",16)+' Installed. Kitchie now opens in its own window. You can install it again whenever you like.</p>':'')
   +'<ol class="pf-steps"><li>Press <b>Install Kitchie</b>.</li><li>In the box '+names+' shows, press <b>Install</b>.</li><li>Open Kitchie from your Start menu or Dock. Pin it if you like.</li></ol></div><div class="pf-inst-r">'+addrBar()+'<p class="pf-small">The same thing, if you prefer: the install icon is in the address bar.</p></div></div>'}
 else if(b==="safari"){
  h+='<div class="pf-inst-main"><div class="pf-inst-l"><ol class="pf-steps"><li>In the menu bar, choose <b>File</b>, then <b>Add to Dock…</b></li><li>Check the name says <b>Kitchie</b>, then press <b>Add</b>.</li><li>Open Kitchie from your Dock or Launchpad.</li></ol><p class="pf-small">Needs Safari 17 on macOS Sonoma or later. Safari cannot start the install from a button, so there is none here.</p></div><div class="pf-inst-r">'+menuIll()+'</div></div>'}
 else{
  h+='<div class="pf-inst-main"><div class="pf-inst-l"><p class="pf-note" role="status">Firefox on a computer cannot install web apps. Kitchie works fine in a tab. To install it, open this page in Chrome, Edge or Safari.</p><button type="button" class="pf-btn" data-inst="copy">'+ic("copy",18)+' Copy this page’s address</button><p class="pf-small">Or pin the tab: right-click it, then choose Pin Tab.</p></div></div>'}
 h+='<div class="pf-mock"><span>Mockup only. The real page detects the browser. Pretend it is</span><div class="pf-seg" role="radiogroup" aria-label="Pretend the browser is">'
  +["chrome","edge","safari","firefox"].map(function(k){return '<button type="button" role="radio" aria-checked="'+(b===k)+'" data-ib="'+k+'">'+BR[k]+'</button>'}).join("")+'</div></div></div>';
 return h}
function installSteps(m){
 var o=mob(m),h='<div class="pf-inst pf-inst-m"><p class="pf-small">The same on a phone and a tablet. It adds Kitchie to your home screen, and you can do it again any time.</p>'
  +'<div class="pf-seg" role="radiogroup" aria-label="Your device">'+[["ios","iPhone or iPad"],["android","Android"]].map(function(x){return '<button type="button" role="radio" aria-checked="'+(o===x[0])+'" data-imob="'+x[0]+'">'+x[1]+'</button>'}).join("")+'</div>';
 if(o==="ios")h+='<ol class="pf-steps"><li>Open Kitchie in <b>Safari</b>.</li><li>Tap <b>Share</b> '+ic("share",16)+' (the bar at the bottom, or the top on an iPad).</li><li>Scroll down and tap <b>Add to Home Screen</b>.</li><li>Tap <b>Add</b>.</li></ol>';
 else h+='<ol class="pf-steps"><li>Open Kitchie in <b>Chrome</b>.</li><li>Tap the menu '+ic("dots",16)+' at the top right.</li><li>Tap <b>Install app</b> (or <b>Add to Home screen</b>).</li><li>Tap <b>Install</b>.</li></ol>';
 h+='<div class="pf-acts"><button type="button" class="pf-btn pri" data-inst="mdone">Done, I’ve installed it</button><button type="button" class="pf-btn" data-acc="install">Not now</button></div></div>';
 return h}

/* ---------- Categories, Locations and spots ---------- */
function catRows(){return CATS.map(function(c){return '<li><button type="button" class="pf-item" data-sel="cat:'+c[0]+'" aria-pressed="false"><span class="pf-ico">'+c[1]+'</span><span class="pf-t"><span class="pf-name">'+esc(c[2])+'</span><small>'+plural(c[3].length,"item")+'</small></span><span class="pf-chev">'+ic("chev",18)+'</span></button></li>'}).join("")}
function catList(){return '<p class="pf-small pf-intro">Rename a category for every item at once. This is the household’s, not just this device’s.</p><ul class="pf-list pf-picks">'+catRows()+'</ul>'
 +'<div><button type="button" class="pf-btn" data-act="addcat">'+ic("plus",18)+' Add a category</button></div>'}
function locBlock(l){return '<div class="pf-locg"><ul class="pf-list pf-picks"><li><button type="button" class="pf-item" data-sel="loc:'+l[0]+'" aria-pressed="false"><span class="pf-ico">'+ic("pin",18)+'</span><span class="pf-t"><span class="pf-name">'+esc(l[1])+'</span><small>'+plural(l[2].length,"spot")+' · '+plural(locCount(l),"item")+'</small></span><span class="pf-chev">'+ic("chev",18)+'</span></button></li></ul>'
  +'<div class="pf-spots" role="group" aria-label="Spots in '+esc(l[1])+'">'+l[2].map(function(s){return '<button type="button" class="pf-spot" data-sel="spot:'+l[0]+'.'+s[0]+'" aria-pressed="false"><span class="pf-name">'+esc(s[1])+'</span> <em>'+s[2]+'</em></button>'}).join("")+'</div></div>'}
function locList(){return '<p class="pf-small pf-intro">A location holds spots. Renaming or moving one updates every item stored there. This is the household’s, not just this device’s.</p>'
 +LOCS.map(locBlock).join("")+'<div><button type="button" class="pf-btn" data-act="addloc">'+ic("plus",18)+' Add a location</button></div>'}
function subPane(m){return m.sub==="cats"?catList():m.sub==="locs"?locList():installDesktop(m)}

/* the flyout */
function flyShell(title,sub,bodyHtml,foot,label){
 return '<div class="pf-flybk" data-flyclose aria-hidden="true"></div><aside class="pf-fly" role="complementary" aria-label="'+esc(label||title)+'"><div class="pf-fly-h"><button type="button" class="pf-flyback" data-flyclose aria-label="Back to the list">'+ic("back",20)+'</button><div class="pf-fly-t">'+(sub?'<span class="pf-crumb">'+sub+'</span>':'')+'<h3>'+title+'</h3></div><button type="button" class="pf-x" data-flyclose aria-label="Close this panel" title="Close this panel ('+ESCL+')">'+ic("close",20)+'</button></div><div class="pf-fly-b">'+bodyHtml+'</div><div class="pf-fly-f">'+(foot||'<button type="button" class="pf-btn pri" data-flyclose>Done</button>')+'</div></aside>'}
function moveSel(opts,ph){return '<select class="pf-in" data-mv aria-label="Where the items go"><option value="">'+ph+'</option>'+opts.map(function(o){return '<option value="'+esc(o[0])+'">'+esc(o[1])+'</option>'}).join("")+'</select>'}
function orderRow(pos,n){return '<div class="pf-row2 pf-order"><span>Position '+pos+' of '+n+'</span><button type="button" class="pf-btn sm" data-act="earlier"'+(pos===1?' disabled':'')+'>'+ic("up",16)+' Earlier</button><button type="button" class="pf-btn sm" data-act="later"'+(pos===n?' disabled':'')+'>'+ic("dn",16)+' Later</button></div>'}
function rmBtn(act,base){return '<button type="button" class="pf-btn dng" data-act="'+act+'" data-base="'+esc(base)+'" disabled>'+esc(base)+' and remove</button>'}
function catFly(id){
 var c=cat(id);if(!c)return "";var i=CATS.indexOf(c),n=c[3].length;
 var others=CATS.filter(function(x){return x!==c}).map(function(x){return [x[0],x[2]]});
 var body='<label class="pf-field"><span class="pf-lbl">Name</span><input class="pf-in" type="text" data-rename="cat:'+id+'" data-flyfocus value="'+esc(c[2])+'" maxlength="24" autocomplete="off" spellcheck="false"><span class="pf-small pf-hint2">Renames it on '+(n===1?"the 1 item":"all "+n+" items")+' at once. 24 characters at most.</span></label>'
  +'<div><span class="pf-lbl">In this category</span><div class="pf-tags">'+c[3].slice(0,8).map(function(t){return '<span class="pf-tag">'+esc(t)+'</span>'}).join("")+(n>8?'<span class="pf-tag more">+'+(n-8)+' more</span>':'')+'</div></div>'
  +'<div><span class="pf-lbl">Order in the Pantry</span>'+orderRow(i+1,CATS.length)+'</div>'
  +'<div class="pf-danger"><b>Remove or merge</b><p class="pf-small">Pick where its '+(n===1?"item goes":n+" items go")+'. Nothing is deleted. The button stays off until you pick.</p>'+moveSel(others,"Pick a category…")+rmBtn("rmcat","Move "+plural(n,"item"))+'</div>';
 return flyShell(c[1]+' <span data-flytitle>'+esc(c[2])+'</span>',"Kitchen setup › Categories",body,null,"Edit category "+c[2])}
function locFly(id){
 var l=loc(id);if(!l)return "";var i=LOCS.indexOf(l),others=LOCS.filter(function(x){return x!==l}).map(function(x){return [x[0],x[1]]});
 var body='<label class="pf-field"><span class="pf-lbl">Name</span><input class="pf-in" type="text" data-rename="loc:'+id+'" data-flyfocus value="'+esc(l[1])+'" maxlength="24" autocomplete="off" spellcheck="false"><span class="pf-small pf-hint2">Renames it on all '+locCount(l)+' items stored here.</span></label>'
  +'<div><span class="pf-lbl">Spots</span><ul class="pf-list">'+l[2].map(function(s){return '<li><button type="button" class="pf-item" data-sel="spot:'+id+'.'+s[0]+'"><span class="pf-t">'+esc(s[1])+'<small>'+plural(s[2],"item")+'</small></span><span class="pf-chev">'+ic("chev",18)+'</span></button></li>'}).join("")+'</ul><div class="pf-addrow"><input class="pf-in" type="text" placeholder="New spot, for example Top shelf" maxlength="24" aria-label="New spot name"><button type="button" class="pf-btn" data-act="addspot">'+ic("plus",18)+' Add</button></div></div>'
  +'<div><span class="pf-lbl">Order</span>'+orderRow(i+1,LOCS.length)+'</div>'
  +'<div class="pf-danger"><b>Remove this location</b><p class="pf-small">Its '+plural(locCount(l),"item")+' move to the location you pick. Its spots stay as spots there; the same names merge.</p>'+moveSel(others,"Pick a location…")+rmBtn("rmloc","Move "+plural(locCount(l),"item"))+'</div>';
 return flyShell(esc(l[1]),"Kitchen setup › Locations and spots",body,null,"Edit location "+l[1])}
function spotFly(ref){
 var r=spot(ref);if(!r||!r.s)return "";var l=r.l,s=r.s,i=l[2].indexOf(s),others=[];
 LOCS.forEach(function(x){x[2].forEach(function(y){if(y!==s)others.push([x[0]+"."+y[0],x[1]+", "+y[1]])})});
 var body='<label class="pf-field"><span class="pf-lbl">Name</span><input class="pf-in" type="text" data-rename="spot:'+ref+'" data-flyfocus value="'+esc(s[1])+'" maxlength="24" autocomplete="off" spellcheck="false"><span class="pf-small pf-hint2">Renames it on all '+s[2]+' items kept here. Two spots in different locations may share a name.</span></label>'
  +'<label class="pf-field"><span class="pf-lbl">Lives in</span><select class="pf-in" aria-label="Lives in">'+LOCS.map(function(x){return '<option'+(x===l?' selected':'')+'>'+esc(x[1])+'</option>'}).join("")+'</select><span class="pf-small pf-hint2">Moving it takes its items with it.</span></label>'
  +'<div><span class="pf-lbl">Order in '+esc(l[1])+'</span>'+orderRow(i+1,l[2].length)+'</div>'
  +'<div class="pf-danger"><b>Remove or merge</b><p class="pf-small">Pick where its '+plural(s[2],"item")+' go. Picking an existing spot merges the two.</p>'+moveSel(others,"Pick a spot…")+rmBtn("rmspot","Move "+plural(s[2],"item"))+'</div>';
 return flyShell(esc(s[1]),"Locations and spots › "+esc(l[1]),body,null,"Edit spot "+s[1])}

/* ---------- phone and tablet: rows that open in place under themselves ---------- */
var ACCL={cats:"Categories",locs:"Locations and spots",install:"Install Kitchie"};
function accHead(key,icon,title,sub,open){return '<button type="button" class="pf-item pf-acch" data-acc="'+key+'" aria-expanded="'+open+'" aria-controls="pf-acc-'+key+'"><span class="pf-ico">'+ic(icon,18)+'</span><span class="pf-t">'+title+'<small>'+sub+'</small></span><span class="pf-chev pf-rot">'+ic("chev",18)+'</span></button>'}
function accs(m){
 var a=m.acc;
 function panel(key,inner){return '<div class="pf-accp" id="pf-acc-'+key+'" role="region" aria-label="'+ACCL[key]+'"'+(a===key?'':' hidden')+'>'+(a===key?inner:'')+'</div>'}
 var cats='<ul class="pf-list pf-picks">'+catRows()+'</ul><div><button type="button" class="pf-btn" data-act="addcat">'+ic("plus",18)+' Add a category</button></div>';
 var locs=LOCS.map(locBlock).join("")+'<div><button type="button" class="pf-btn" data-act="addloc">'+ic("plus",18)+' Add a location</button></div>';
 return '<div><span class="pf-lbl">Kitchen setup</span><ul class="pf-list pf-acc">'
  +'<li>'+accHead("cats","tag","Categories",CATS.length+" categories",a==="cats")+panel("cats",cats)+'</li>'
  +'<li>'+accHead("locs","pin","Locations and spots",plural(LOCS.length,"location")+", "+plural(LOCS.reduce(function(n,l){return n+l[2].length},0),"spot"),a==="locs")+panel("locs",locs)+'</li></ul>'
  +'<p class="pf-small" style="margin:8px 2px 0">Categories and Locations and spots are the household’s, not just this device’s.</p></div>'
  +'<div><span class="pf-lbl">Install</span><ul class="pf-list pf-acc"><li>'+accHead("install","down","Install Kitchie","Add it to your home screen, as often as you like",a==="install")+panel("install",installSteps(m))+'</li></ul></div>'}

/* ---------- Preferences: three desktop layouts (a mockup choice for the owner) ---------- */
var SRC={you:["You","you"],hh:["Household","ok"],app:["App","app"]};
function chip(k){return '<span class="pf-chip '+SRC[k][1]+'">'+SRC[k][0]+'</span>'}
var MINE=[["Stock level checks",[["check","Ask me to check amounts","On","app","App says On"],["quiet","Quiet hours","9pm to 7am","hh","Same as household"],["cap","Most suggestions per day","6","you","Household says 5"]]],
 ["Food",[["f1","Avoid peanuts","Never suggested","you","No end date"],["f2","Dislike coriander","Until 30 Nov","you","Ends by itself"],["f3","Milk once a week","At most once in 7 days","you","A limit"]]],
 ["Substitutions",[["s1","Butter for ghee","A swap","you","Yours over the household’s"]]]];
var HH=[["Stock level checks",[["check","Ask to check amounts","On","app","Nobody has changed it"],["quiet","Quiet hours","9pm to 7am","hh","Set by Arjan"],["cap","Most suggestions per day","5","hh","Set by Arjan"]]],
 ["Food",[["f4","No pork in the house","Everyone’s avoid","hh","Set by Arjan"]]],
 ["Only the household has these",[["members","Members and admins","2 members","hh","Arjan is the founding member"],["hname","Household name","Our kitchen","hh",""],["go-cats","Categories","10 categories","hh","Opens in Settings"],["go-locs","Locations and spots","3 locations","hh","Opens in Settings"],["stars","Recipe stars and votes","Shared by the kitchen","hh",""]]]];
function prow(scope,r,sel,csel){
 var id=scope+":"+r[0];
 return '<li><button type="button" class="pf-item" '+(csel?'data-csel="'+id+'"':'data-sel="pref:'+id+'"')+' aria-pressed="'+(sel===id)+'"><span class="pf-t">'+esc(r[1])+'<small><b class="pf-val">'+esc(r[2])+'</b>'+(r[4]?' · '+esc(r[4]):'')+'</small></span>'+(r[3]?chip(r[3]):'')+'<span class="pf-chev">'+ic("chev",18)+'</span></button></li>'}
function plist(scope,data,sel,csel){return data.map(function(g){return '<div><span class="pf-lbl">'+g[0]+'</span><ul class="pf-list pf-picks">'+g[1].map(function(r){return prow(scope,r,sel,csel)}).join("")+'</ul></div>'}).join("")}
function isAdmin(m){return m.as!=="sam"}
function members(m){return '<p class="pf-small pf-intro">Only the founding member grants or removes admin. Admins change the household’s values.</p><ul class="pf-list"><li><div class="pf-ev"><span class="pf-ini me" aria-hidden="true">A</span><span class="pf-t">arjan <span class="pf-chip acc">Founding member</span><small>Always an admin</small></span></div></li><li><div class="pf-ev"><span class="pf-ini" aria-hidden="true">S</span><span class="pf-t">sam <span class="pf-chip">Member</span><small>Can change their own preferences</small></span>'+(m.as!=="sam"?'<button type="button" class="pf-btn sm" data-toast="Mockup: sam is now an admin">Make admin</button>':'')+'</div></li></ul>'}
function pbar(m){return '<p class="pf-small pf-intro">You are viewing as <b>'+(isAdmin(m)?"Arjan, the founding member and an admin":"Sam, a member")+'</b>.'+(isAdmin(m)?"":" The household’s values are read-only for you.")+'</p>'}
function cellBtn(m,scope,rr,rid,label,lock,sel){
 var on=rr&&sel===scope+":"+rr[0];
 return '<button type="button" class="pf-cell'+(rr?'':' empty')+'" '+(rr?'data-sel="pref:'+scope+':'+rr[0]+'"':'data-toast="Mockup: '+(scope==="hh"?(isAdmin(m)?"this would set a household value":"only an admin can set a household value"):"this would set your own value")+'"')+' aria-pressed="'+(!!on)+'"><span class="pf-cell-l">'+label+(lock?' '+ic("lock",12):'')+'</span><b>'+(rr?esc(rr[2]):'Not set')+'</b><small>'+(rr?esc(rr[4]):'Nobody has chosen')+'</small>'+(rr&&!(scope==="hh"&&rr[3]==="hh")?chip(rr[3]):'')+'</button>'}
function prefsPane(m){
 var o=m.pref,sel=m.sel&&m.sel.replace(/^pref:/,"");
 if(o==="a"){
  var sc=m.psub||"mine";
  if(sc==="members")return members(m);
  return pbar(m)+(sc==="mine"?'<p class="pf-small pf-intro">What you have chosen for yourself, and where everything else comes from.</p>'+plist("me",MINE,sel):'<p class="pf-small pf-intro">The kitchen’s own list. '+(isAdmin(m)?"You are an admin, so you can change these.":"Only an admin can change these.")+'</p>'+plist("hh",HH,sel))}
 if(o==="b"){
  var groups=[0,1].map(function(gi){
   var mine=MINE[gi][1],hh=HH[gi][1],ids=mine.map(function(r){return r[0]});hh.forEach(function(r){if(ids.indexOf(r[0])<0)ids.push(r[0])});
   function by(arr,id){return arr.filter(function(r){return r[0]===id})[0]}
   return '<div><span class="pf-lbl">'+MINE[gi][0]+'</span><div class="pf-sbs">'+ids.map(function(id){var a=by(mine,id),b=by(hh,id),t=(a||b)[1];
    return '<div class="pf-sbsr"><span class="pf-sbs-t">'+esc(t)+'</span><div class="pf-sbs2">'+cellBtn(m,"me",a,id,"Mine",false,sel)+cellBtn(m,"hh",b,id,"Household",!isAdmin(m),sel)+'</div></div>'}).join("")+'</div></div>'}).join("");
  var sub=MINE[2],only=HH[2];
  return pbar(m)+'<div class="pf-sbs-head" aria-hidden="true"><span>Mine</span><span>Household</span></div>'+groups
   +'<div><span class="pf-lbl">'+sub[0]+'</span><div class="pf-sbs"><div class="pf-sbsr"><span class="pf-sbs-t">'+esc(sub[1][0][1])+'</span><div class="pf-sbs2">'+cellBtn(m,"me",sub[1][0],"s1","Mine",false,sel)+cellBtn(m,"hh",null,"s1","Household",!isAdmin(m),sel)+'</div></div></div></div>'
   +'<div><span class="pf-lbl">'+only[0]+'</span><ul class="pf-list pf-picks">'+only[1].map(function(r){return prow("hh",r,sel,false)}).join("")+'</ul></div>'}
 var tab=m.ptab||"mine",data=tab==="mine"?MINE:HH,sc2=tab==="mine"?"me":"hh",cs=m.csel||"";
 if(cs.split(":")[0]!==sc2||!findRow(cs))cs=sc2+":"+data[0][1][0][0];
 return pbar(m)+'<div class="pf-seg pf-tabs2" role="radiogroup" aria-label="Whose">'+[["mine","Mine"],["hh","Household"]].map(function(x){return '<button type="button" role="radio" aria-checked="'+(tab===x[0])+'" data-ptab="'+x[0]+'">'+x[1]+'</button>'}).join("")+'</div>'
  +'<div class="pf-c2"><div class="pf-c2l">'+plist(sc2,data,cs,true)+'</div><div class="pf-c2r" id="pf-ed" aria-live="polite">'+prefEditor(m,cs)+'</div></div>'}
function findRow(id){var p=id.split(":"),d=p[0]==="me"?MINE:HH,r=null;d.forEach(function(g){g[1].forEach(function(x){if(x[0]===p[1])r=x})});return r}
function prefEditor(m,id,nohead){
 var p=id.split(":"),r=findRow(id);if(!r)return "";
 var mine=p[0]==="me",adm=isAdmin(m);
 var h=nohead?(r[3]?'<div class="pf-ed-h">'+chip(r[3])+'</div>':''):'<div class="pf-ed-h"><div><span class="pf-crumb">'+(mine?"Mine":"Household")+'</span><h3>'+esc(r[1])+'</h3></div>'+(r[3]?chip(r[3]):'')+'</div>';
 if(/^go-/.test(r[0]))return h+'<p>These are managed in Settings, in the same place a phone reaches them.</p><div class="pf-acts"><button type="button" class="pf-btn pri" data-pgo="'+(r[0]==="go-cats"?"cats":"locs")+'">Open in Settings</button></div>';
 if(r[0]==="members"||r[0]==="hname"||r[0]==="stars")return h+'<p>'+esc(r[2])+'. '+(adm?"You can change this.":"Only an admin can change this.")+'</p>'+(adm?'<div class="pf-acts"><button type="button" class="pf-btn" data-toast="Mockup: this opens the editor">Change</button></div>':'<p class="pf-small">'+ic("lock",12)+' Read-only for you.</p>');
 h+='<p class="pf-ed-now">In force: <b>'+esc(r[2])+'</b></p>';
 if(!mine&&!adm)return h+'<p class="pf-small">'+ic("lock",12)+' Only an admin changes the household’s value. Arjan can.</p>';
 if(/^f/.test(r[0]))return h+'<p class="pf-small">'+esc(r[4])+'.'+(mine?'':' Changes it for everyone in Our kitchen.')+'</p><div class="pf-acts"><button type="button" class="pf-btn" data-toast="Mockup: this opens the rule">Edit the rule</button><button type="button" class="pf-btn dng" data-toast="Mockup: rule removed">Remove</button></div>';
 if(r[0]==="s1")return h+'<p class="pf-small">'+esc(r[4])+'.</p><div class="pf-acts"><button type="button" class="pf-btn" data-toast="Mockup: this opens the swap">Edit the swap</button></div>';
 var vh=r[0]==="cap"?"5":r[0]==="quiet"?"9pm to 7am":"On",va=r[0]==="cap"?"3":r[0]==="quiet"?"10pm to 6am":"On";
 var step=r[0]==="cap"?'<div class="pf-step"><button type="button" class="pf-btn sm" aria-label="One fewer">'+ic("minus",16)+'</button><b>'+(mine?"6":"5")+'</b><button type="button" class="pf-btn sm" aria-label="One more">'+ic("plus",16)+'</button></div>':'';
 if(mine)return h+'<div role="radiogroup" aria-label="Where it comes from" class="pf-radios">'
  +'<label class="pf-rad"><input type="radio" name="src-'+r[0]+'"'+(r[3]==="hh"?' checked':'')+'><span>Same as household <small>'+vh+'</small></span></label>'
  +'<label class="pf-rad"><input type="radio" name="src-'+r[0]+'"'+(r[3]==="app"?' checked':'')+'><span>Same as app default <small>'+va+'</small></span></label>'
  +'<label class="pf-rad"><input type="radio" name="src-'+r[0]+'"'+(r[3]==="you"?' checked':'')+'><span>Mine <small>'+(r[0]==="cap"?"1 to 20":"my own")+'</small></span></label></div>'+step+'<div class="pf-acts"><button type="button" class="pf-btn pri" data-toast="Mockup: saved for you">Save</button></div>';
 return h+'<p class="pf-small">Changes it for everyone in Our kitchen.</p>'+(step||'<input class="pf-in" type="text" value="'+esc(r[2])+'" aria-label="'+esc(r[1])+'">')+'<div class="pf-acts"><button type="button" class="pf-btn pri" data-toast="Mockup: saved for the household">Save</button></div>'}
function prefFly(m){
 var id=m.sel.replace(/^pref:/,""),r=findRow(id);if(!r)return "";
 return flyShell(esc(r[1]),id.split(":")[0]==="me"?"Mine":"Household",'<div class="pf-ed">'+prefEditor(m,id,true)+'</div>','<button type="button" class="pf-btn" data-flyclose>Close</button>',"Edit "+r[1])}
function footCtl(m){
 if(narrow())return "";var o=m.pref||"today";
 return '<span class="pf-mock pf-mockf"><span>Mockup only. Layout</span><span class="pf-seg" role="radiogroup" aria-label="Preferences layout">'+[["today","Today"],["a","A"],["b","B"],["c","C"]].map(function(x){return '<button type="button" role="radio" aria-checked="'+(o===x[0])+'" data-pref="'+x[0]+'">'+x[1]+'</button>'}).join("")+'</span><span>Viewing as</span><span class="pf-seg" role="radiogroup" aria-label="Viewing as">'+[["arjan","Arjan (admin)"],["sam","Sam"]].map(function(x){return '<button type="button" role="radio" aria-checked="'+(m.as===x[0])+'" data-as="'+x[0]+'">'+x[1]+'</button>'}).join("")+'</span></span>'}

/* ---------- the module's face ---------- */
function fly(m){
 var s=m.sel||"";
 if(/^cat:/.test(s))return catFly(s.slice(4));
 if(/^loc:/.test(s))return locFly(s.slice(4));
 if(/^spot:/.test(s))return spotFly(s.slice(5));
 if(/^pref:/.test(s))return prefFly(m);
 return ""}

function liveName(ref,val){
 var kind=ref.split(":")[0],id=ref.slice(kind.length+1);
 if(!val)return;
 if(kind==="cat"){var c=cat(id);if(c)c[2]=val}
 else if(kind==="loc"){var l=loc(id);if(l)l[1]=val}
 else{var r=spot(id);if(r&&r.s)r.s[1]=val}
 $$('[data-sel="'+kind+":"+id+'"] .pf-name').forEach(function(n){n.textContent=val});
 $$("[data-flytitle]").forEach(function(n){n.textContent=val})}
document.addEventListener("input",function(e){var t=e.target;if(t&&t.dataset&&t.dataset.rename)liveName(t.dataset.rename,t.value)});
document.addEventListener("change",function(e){
 var t=e.target;if(!t||!t.matches||!t.matches("select[data-mv]"))return;
 var b=t.parentNode.querySelector("button[data-act^=rm]");if(!b)return;
 b.disabled=!t.value;
 b.textContent=b.dataset.base+(t.value?" to "+t.options[t.selectedIndex].text:"")+" and remove"});

function click(m,el,H){
 var a=el.dataset.act;
 if(el.dataset.ib){m.os=el.dataset.ib;m.idone=false;H.paint(m,false,'[data-ib="'+el.dataset.ib+'"]');return true}
 if(el.dataset.imob){m.os=el.dataset.imob;H.paint(m,false,'[data-imob="'+el.dataset.imob+'"]');return true}
 if(el.dataset.as){m.as=el.dataset.as;m.sel=null;H.paint(m,false,'[data-as="'+el.dataset.as+'"]');return true}
 if(el.dataset.ptab){m.ptab=el.dataset.ptab;m.csel=null;H.paint(m,false,'[data-ptab="'+el.dataset.ptab+'"]');return true}
 if(el.dataset.csel){m.csel=el.dataset.csel;var ed=H.$("#pf-ed",m.frame);H.$$("[data-csel]",m.frame).forEach(function(b){b.setAttribute("aria-pressed",String(b===el))});if(ed)ed.innerHTML=prefEditor(m,m.csel);return true}
 if(el.dataset.pgo){H.setView(m,"settings",el.dataset.pgo);return true}
 if(el.dataset.inst==="go"){m.idone=true;H.paint(m,false,'[data-inst="go"]');return true}
 if(el.dataset.inst==="copy"){H.toast("Mockup: address copied. Paste it into Chrome, Edge or Safari.");return true}
 if(el.dataset.inst==="mdone"){m.acc=null;H.paint(m,false,'[data-acc="install"]');H.toast("Added. See you on the home screen.");return true}
 if(a==="addcat"){H.toast("Mockup: a new row appears here, ready to name");return true}
 if(a==="addloc"){H.toast("Mockup: a new location appears here, ready to name");return true}
 if(a==="addspot"){H.toast("Mockup: the spot is added to this location");return true}
 if(a==="earlier"||a==="later"){
  var s=m.sel||"",k=s.split(":")[0],id=s.slice(k.length+1),r0=k==="spot"?spot(id):null,arr=k==="cat"?CATS:k==="loc"?LOCS:(r0?r0.l[2]:[]),it=k==="cat"?cat(id):k==="loc"?loc(id):(r0?r0.s:null),i=arr.indexOf(it),j=a==="earlier"?i-1:i+1;
  if(i<0||j<0||j>=arr.length)return true;
  arr.splice(i,1);arr.splice(j,0,it);
  var body=H.$(".pf-body",m.frame),y=body.scrollTop;
  H.paint(m,false,a==="earlier"&&j>0?'[data-act="earlier"]':a==="later"&&j<arr.length-1?'[data-act="later"]':'[data-flyfocus]');
  H.$(".pf-body",m.frame).scrollTop=y;
  H.toast("Mockup: moved "+(a==="earlier"?"earlier":"later")+". Undo");return true}
 if(a==="rmcat"||a==="rmloc"||a==="rmspot"){
  var s2=m.sel||"",k2=s2.split(":")[0],id2=s2.slice(k2.length+1),sel=H.$("select[data-mv]",m.frame),dest=sel&&sel.options[sel.selectedIndex].text;
  if(k2==="cat"){var c=cat(id2),to=cat(sel.value);CATS.splice(CATS.indexOf(c),1);if(to)to[3]=to[3].concat(c[3])}
  else if(k2==="loc"){LOCS.splice(LOCS.indexOf(loc(id2)),1)}
  else{var r=spot(id2);if(r)r.l[2].splice(r.l[2].indexOf(r.s),1)}
  m.sel=null;H.paint(m,false);H.toast("Mockup: moved to "+dest+" and removed. Undo");return true}
 return false}
/* An open row on a phone or tablet is brought to the top of the page once, so a link to it shows it. */
function after(m){if(m.view==='settings'&&narrow()&&m.acc&&m._sc!==m.acc&&!m.sel){m._sc=m.acc;var h=$('[data-acc="'+m.acc+'"]',m.frame);if(h&&h.scrollIntoView)h.scrollIntoView({block:'start'})}}
window.KProfileSubs={pane:subPane,fly:fly,accs:accs,prefsPane:prefsPane,footCtl:footCtl,click:click,after:after};
})();
