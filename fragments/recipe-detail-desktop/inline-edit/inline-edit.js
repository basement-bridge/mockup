/* Recipe page, desktop, INLINE EDIT (Kitchie #892; follows #830). The page is the Recommended layout (../recommended/); this file draws it from the same sample data and adds edit mode.
   Mockup only: nothing is saved anywhere. Rendering is mockup-only; class names are the build's vocabulary (see ../recommended/notes.md) plus the edit ones listed in notes.md.
   Rules this mockup keeps (mockup recipe/edit.js header): a Trying version edits in place; a keeper asks where changes go (fix this one / keep both / different dish);
   every change is one entry in the revision with per-change undo and shows in History with who did it; nothing is hard-deleted; photos can be undone for 5 minutes.
   URL options: ?r=typical|short|long|notes|cooked|nocooked|empty  &ver=trying  &edit=1  &tab=ing|notes|cooked|pho  &lane=1|h  &banner=none  &theme=dark|light
   Edit model: the Edit button (or E) turns edit mode on; every value is then click-to-edit in place; Enter or leaving the field saves THAT field at once (Saved + Undo), Esc cancels it. */
(function(){
"use strict";
var Q=new URLSearchParams(location.search);
var R=Q.get("r")||"typical"; if(["short","typical","long","notes","cooked","nocooked","empty"].indexOf(R)<0)R="typical";
var $=function(s,e){return (e||document).querySelector(s)},$$=function(s,e){return Array.prototype.slice.call((e||document).querySelectorAll(s))};
var esc=function(s){return String(s).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})};
var md=function(s){return esc(s).replace(/\*\*(.+?)\*\*/g,"<b>$1</b>")};
var I={
 back:'<path d="M15 5l-7 7 7 7"/>',star:'<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
 share:'<path d="M12 15V4M8 8l4-4 4 4M5 13v6h14v-6"/>',more:'<circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/>',
 up:'<path d="M7 11v9H4v-9zM7 11l4-8c2 0 3 1.5 2.5 3.5L13 9h6a2 2 0 012 2.4l-1.3 6.6a2 2 0 01-2 1.6H7"/>',dn:'<path d="M7 13V4H4v9zM7 13l4 8c2 0 3-1.5 2.5-3.5L13 15h6a2 2 0 002-2.4l-1.3-6.6a2 2 0 00-2-1.6H7"/>',
 note:'<path d="M5 4h14v12l-5 4H5z"/><path d="M14 20v-4h5"/>',clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
 people:'<circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.5 2.7-6 6-6s6 2.5 6 6M16 5a3 3 0 010 6M18 14c2 1 3 3 3 6"/>',zoom:'<circle cx="11" cy="11" r="6"/><path d="M20 20l-4-4M11 8v6M8 11h6"/>',left:'<path d="M15 5l-7 7 7 7"/>',right:'<path d="M9 5l7 7-7 7"/>',cart:'<path d="M3 4h2l2 11h11l2-8H6"/><circle cx="9" cy="19" r="1.4"/><circle cx="17" cy="19" r="1.4"/>',plan:'<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/>',
 cook:'<path d="M8 3c-2 2 2 3 0 5M13 3c-2 2 2 3 0 5M4 12h16l-1.5 7a2 2 0 01-2 1.5h-9A2 2 0 014.800 19z"/>',hist:'<path d="M4 12a8 8 0 108-8 8 8 0 00-6 2.700L4 9M4 4v5h5M12 8v4l3 2"/>',
 pen:'<path d="M4 20l1-4L16 5l3 3L8 19z"/>',branch:'<circle cx="6" cy="5" r="2"/><circle cx="6" cy="19" r="2"/><circle cx="18" cy="8" r="2"/><path d="M6 7v10M18 10c0 4-6 3-12 7"/>',
 plus:'<path d="M12 5v14M5 12h14"/>',timer:'<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2M9 2h6"/>',x:'<path d="M6 6l12 12M18 6L6 18"/>',chev:'<path d="M7 10l5 5 5-5"/>',
 grip:'<circle cx="9" cy="6" r="1.5"/><circle cx="15" cy="6" r="1.5"/><circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/><circle cx="9" cy="18" r="1.5"/><circle cx="15" cy="18" r="1.5"/>',
 check:'<path d="M5 12.500l4.500 4.500L19 7"/>',undo:'<path d="M9 14L4 9l5-5"/><path d="M4 9h9a6 6 0 010 12h-3"/>',lock:'<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 018 0v3"/>',image:'<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="10" r="1.6"/><path d="M4 18l5-5 4 4 3-3 4 4"/>'
};
var ic=function(n,c){return '<svg class="ic '+(c||"")+'" viewBox="0 0 24 24" aria-hidden="true">'+I[n]+'</svg>'};
var fmt=function(v){return String(Math.round(v*100)/100)};
var mins=function(m){return m>=60?(m%60?Math.floor(m/60)+" h "+m%60:Math.floor(m/60)+" h"):m+" min"};

/* ---------------- sample data -> editable model ---------------- */
var key=(R==="short"||R==="long")?R:"typical";
var D=JSON.parse(JSON.stringify(window.RECIPES[key]));
var IMG=window.RECIPES.IMG;
if(D.banner)D.banner="../recommended/"+D.banner;     /* the banner crops live in ../recommended/img */
if(R==="nocooked"){D.cooks=[];D.notes=[];D.react={mine:null,people:[],household:D.react.household};D.planned=null}
if(R==="empty"){D.name="New recipe";D.min="";D.serves=2;D.banner=null;D.ing=[];D.steps=[];D.notes=[];D.cooks=[];D.photos=[];D.react={mine:null,people:[],household:5};D.hist=[{at:"Today",by:"You",v:"Original",what:"Started the recipe."}];D.vers=[{id:"o",name:"Original",st:"trying",parent:null}];D.ver="o";D.source="";D.share=null;D.planned=null;D.pantryKnown=false;D.groups=false}
if(Q.get("banner")==="none")D.banner=null;
if(Q.get("ver")==="trying"&&key==="typical")D.ver="l";
var uid=100,nid=function(p){return p+(++uid)};
function parseMin(s){if(typeof s==="number")return s;if(!s)return null;var m;s=String(s).trim();
 if((m=/^(\d+)\s*h(?:\s*(\d+))?(?:\s*min)?$/i.exec(s)))return +m[1]*60+(+m[2]||0);
 if((m=/^(\d+):(\d{1,2})$/.exec(s)))return +m[1]*60+(+m[2]);
 if((m=/^(\d+)(?:\s*min)?$/i.exec(s)))return +m[1];return NaN}
var META={name:D.name,serves:D.serves,min:parseMin(D.min)||null};
var ING=[],STP=[];
D.ing.forEach(function(x){if(x[6]&&D.groups)ING.push({id:nid("g"),k:"g",name:x[6]});ING.push({id:nid("i"),k:"i",name:x[0],q:x[1],u:x[2]||"",pan:x[3]==="miss"?"miss":"in",opt:!!x[4]})});
D.steps.forEach(function(s){if(s[3]&&D.groups)STP.push({id:nid("g"),k:"g",name:s[3]});STP.push({id:nid("s"),k:"s",t:s[0],m:s[1]||0,ph:s[2]||null})});
var NOTES=D.notes.map(function(n){var c=JSON.parse(JSON.stringify(n));c.id=nid("n");return c});
var HIST=D.hist.map(function(h){var c=JSON.parse(JSON.stringify(h));c.id=nid("h");return c});
var VERS=D.vers;
var cur=function(){return VERS.filter(function(v){return v.id===D.ver})[0]};
var calcDens=function(){var n=ING.filter(function(x){return x.k==="i"}).length,m=STP.filter(function(x){return x.k==="s"}).length;return (n>16||m>10)?"tight":(n<=5&&m<=4)?"roomy":"normal"};
var tab=Q.get("tab")||(R==="notes"?"notes":R==="cooked"?"cooked":"ing");
var S={edit:false,dens:calcDens(),target:cur().st==="trying"?"inplace":null,revN:Math.max(1,HIST.filter(function(h){return h.v===cur().name}).length),revOpen:false,changes:0,saved:"",stack:[],laneOpen:false,histOpen:false,composing:false,servesNow:META.serves};
var find=function(arr,id){return arr.filter(function(x){return x.id===id})[0]};
var idx=function(arr,id){for(var i=0;i<arr.length;i++)if(arr[i].id===id)return i;return -1};
var PHOTOS=["img:efr-s1","img:efr-s2","img:efr-s4"],phCycle=0,MAXSTEPPH=10;
var UNITS=["g","kg","ml","l","tsp","tbsp","cup","tin","tins","slice","slices","stick","pinch"];

/* ---------------- parsing and validation ---------------- */
function parseQty(s){s=s.trim().replace(",",".");if(s==="")return {v:null};
 var fr={"½":.5,"¼":.25,"¾":.75,"⅓":1/3,"⅔":2/3},m;
 if((m=/^(\d+)?\s*([½¼¾⅓⅔])$/.exec(s)))return {v:Math.round(((+m[1]||0)+fr[m[2]])*100)/100};
 if((m=/^(\d+)\s+(\d+)\/(\d+)$/.exec(s))&&+m[3])return {v:Math.round((+m[1]+m[2]/m[3])*100)/100};
 if((m=/^(\d+)\/(\d+)$/.exec(s))&&+m[2])return {v:Math.round(m[1]/m[2]*100)/100};
 if(/^\d+(\.\d+)?$/.test(s)){var n=parseFloat(s);if(n>0&&n<=9999)return {v:Math.round(n*100)/100}}
 return {err:"Use a number like 2, 1.5 or 1/2, or leave it empty."}}
function parseLine(s){s=s.trim();var q=null,u="",rest=s,m=/^(\d+\s+\d+\/\d+|\d+\/\d+|\d+(?:[.,]\d+)?|[½¼¾])(?:\s+|(?=[a-zA-Z]))(.*)$/.exec(s);
 if(m){var p=parseQty(m[1]);if(!p.err){q=p.v;rest=m[2]}}
 var w=/^([A-Za-z]+)\s+(.+)$/.exec(rest);if(q!==null&&w&&UNITS.indexOf(w[1].toLowerCase())>=0){u=w[1].toLowerCase();rest=w[2]}
 rest=rest.replace(/^of\s+/i,"");return {q:q,u:u,name:rest.trim()}}
function noteToText(n){return n.b.join("\n\n")+(n.li?"\n"+n.li.map(function(l){return "- "+l}).join("\n"):"")}
function textToNote(t){var paras=t.split(/\n{2,}/).map(function(p){return p.replace(/\n/g," ").trim()}).filter(Boolean),li=null;
 var last=t.split(/\n{2,}/).pop().split("\n");if(last.length&&last.every(function(l){return /^-\s+/.test(l)})){li=last.map(function(l){return l.replace(/^-\s+/,"")});paras.pop()}
 else{var lines=t.split("\n"),k=lines.length;while(k>0&&/^-\s+/.test(lines[k-1]))k--;if(k<lines.length&&k>0){li=lines.slice(k).map(function(l){return l.replace(/^-\s+/,"")});paras=lines.slice(0,k).join("\n").split(/\n{2,}/).map(function(p){return p.replace(/\n/g," ").trim()}).filter(Boolean)}}
 return {b:paras.length?paras:[""],li:li}}
var qtext=function(x,scaled){if(x.q===null)return "";var v=scaled?x.q*S.servesNow/META.serves:x.q;return fmt(v)+(x.u?" "+x.u:"")};

/* ---------------- derived ---------------- */
function derived(){var d={};d.ingN=ING.filter(function(x){return x.k==="i"}).length;d.stpN=STP.filter(function(x){return x.k==="s"}).length;
 d.cookedN=D.cooks.length;d.notesN=NOTES.length;d.photosN=D.photos.length+(D.banner?1:0);
 d.known=ING.filter(function(x){return x.k==="i"&&x.pan}).length;d.missing=ING.filter(function(x){return x.k==="i"&&x.pan==="miss"}).length;
 d.upN=D.react.people.filter(function(p){return p[1]==="up"}).length;d.dnN=D.react.people.length-d.upN;d.remarksN=D.cooks.filter(function(c){return c.line}).length;
 d.tabs=[["ing","Ingredients",d.ingN,"1"],["notes","Notes",d.notesN,"2"],["cooked","Cooked",d.cookedN,"3"],["pho","Photos",d.photosN,"4"]].filter(function(t){
  if(t[0]==="cooked"&&!d.cookedN)return false;if(t[0]==="pho"&&!d.photosN)return false;return true});
 if(!d.tabs.some(function(t){return t[0]===tab}))tab="ing";return d}
var DV=derived();
var askNeeded=function(){return S.edit&&S.target===null};

/* ---------------- editable value helper ---------------- */
function ed(k,html,o){o=o||{};if(!S.edit)return html;
 return '<button type="button" class="ed'+(o.cls?' '+o.cls:'')+'" data-ed="'+k+'" aria-label="'+esc(o.label||"Edit")+'" title="'+esc(o.label||"Edit")+'">'+html+'</button>'}

/* ---------------- rail panes ---------------- */
function grip(label){return '<button type="button" class="grip" draggable="true" data-act="grip" aria-label="Move '+esc(label)+'. Up and Down arrow keys move it, or drag." title="Drag, or Up and Down arrows">'+ic("grip","s")+'</button>'}
function rmBtn(label,what){return '<button type="button" class="rm" data-act="rm" aria-label="Remove '+esc(label)+'" title="Remove">'+ic("x","s")+'</button>'}
function ingRow(x){
 if(x.k==="g"){
  if(!S.edit)return '<h3 class="grp">'+esc(x.name)+'</h3>';
  return '<div class="ing ing-e ing-g" data-row="'+x.id+'" data-list="ing">'+grip(x.name+" (group)")+'<h3 class="grp">'+ed("g:"+x.id,esc(x.name),{cls:"nm",label:"Edit the group name"})+'</h3>'+rmBtn(x.name+" (group heading)")+'</div>'}
 var miss=x.pan==="miss",un=x.q===null,u=esc(x.u);
 if(!S.edit){
  return '<div class="ing'+(miss?' miss':'')+'" data-row="'+x.id+'">'+(D.pantryKnown?'<span class="dot'+(miss?' no':x.pan?'':' unk')+'" title="'+(miss?'Not in the pantry':x.pan?'In the pantry':'Checked against the pantry when saved')+'"></span>':'')
   +'<span class="nm">'+esc(x.name.replace(/,.*/,""))+(x.name.indexOf(",")>0?'<small>'+esc(x.name.replace(/^[^,]*/,""))+'</small>':"")+(x.opt?' <small>(optional)</small>':"")+'</span>'
   +(miss?'<button type="button" class="cart" data-act="cart" aria-label="Add '+esc(x.name)+' to shopping">'+ic("cart")+'</button>':"")
   +(un?'<span class="q unk">amount?</span>':'<span class="q">'+esc(qtext(x,true))+'</span>')+'</div>'}
 return '<div class="ing ing-e" data-row="'+x.id+'" data-list="ing">'+grip(x.name)
  +ed("i:"+x.id+":q",un?'<i aria-label="amount unknown">?</i>':fmt(x.q),{cls:"eq",label:"Edit the amount of "+x.name+(un?" (unknown)":"")})
  +ed("i:"+x.id+":u",x.u?u:'<i>unit</i>',{cls:"eu",label:"Edit the unit of "+x.name})
  +ed("i:"+x.id+":n",esc(x.name)+(x.opt?' <small>(optional)</small>':""),{cls:"nm",label:"Edit the ingredient name"})+rmBtn(x.name)+'</div>'}
function ingPane(){
 var head='<div class="lblrow"><span class="lbl">Ingredients <span class="sub">'+(S.edit?'as written for '+META.serves:D.pantryKnown&&DV.known?(DV.missing?(DV.known-DV.missing)+' of '+DV.known+' in':'all in'):'')+'</span></span><span class="row-a">'
  +(!S.edit&&D.planned?'<button type="button" class="mini" data-act="hold">Hold for '+D.planned+'</button>':'')
  +(S.edit?'':'<button type="button" class="mini ico" data-act="edit-sec" data-sec="ing" aria-label="Edit ingredients" title="Edit ingredients (E)">'+ic("pen")+'</button>')+'</span></div>';
 var body='<div class="pscroll" data-scroll><div class="ings">';
 if(!ING.length)body+='<div class="rb-empty"><span>'+ic("plus")+'</span><div><b>No ingredients yet.</b><small>'+(S.edit?'Type the first one below, for example 2 tbsp soy sauce.':'Press E to add them.')+'</small></div></div>';
 body+=ING.map(ingRow).join("")+'</div></div>';
 var foot="";
 if(S.edit)foot='<div class="pfoot pfoot-e"><label class="addrow"><span class="vh">Add an ingredient</span>'+ic("plus","s")+'<input class="edin" data-add="ing" placeholder="Add one, e.g. 2 tbsp soy sauce" maxlength="120" autocomplete="off"></label>'
  +'<button type="button" class="mini" data-act="addgrp" data-list="ing" aria-label="Add a group heading" title="Add a group heading">'+ic("plus","s")+' Group</button></div>';
 else if(DV.missing)foot='<div class="pfoot">'+(DV.missing>1?'<button type="button" class="mini wide" data-act="cartall">'+ic("cart")+' Add all '+DV.missing+' missing to shopping</button>':'')+'<span class="hint">Talk to your assistant about substitutes</span></div>';
 return head+body+foot}
function noteBody(n){return n.b.map(function(p){return '<p>'+md(p)+'</p>'}).join("")+(n.li?'<ul>'+n.li.map(function(l){return '<li>'+esc(l)+'</li>'}).join("")+'</ul>':"")}
function noteMeta(n){return '<small>'+esc(n.by)+', '+esc(n.at)+(n.inh?'<span class="from" title="from the parent version">'+ic("branch")+' from '+esc(n.on)+'</span>':n.reworded?'<span class="from">changed in this version</span>':'')+'</small>'}
function noteCard(n){return '<div class="note'+(n.inh?' inh':'')+'">'+noteBody(n)+noteMeta(n)+'</div>'}
function noteCardEdit(n){
 if(n.inh)return '<div class="note inh n-e" data-note-id="'+n.id+'">'+noteBody(n)+noteMeta(n)+'<p class="lockn">'+ic("lock","s")+' Comes from '+esc(n.on)+'. Change it there.</p></div>';
 return '<div class="note n-e" data-note-id="'+n.id+'" data-row="'+n.id+'">'+ed("n:"+n.id,noteBody(n),{cls:"nbtn",label:"Edit this note"})+'<div class="nfoot">'+noteMeta(n)+'<button type="button" class="rm" data-act="rm" aria-label="Remove this note" title="Remove">'+ic("x","s")+'</button></div></div>'}
function notesPane(){
 var c=cur(),h='<div class="lblrow"><span class="lbl">Notes <span class="sub" data-subnotes>'+(DV.notesN?'on '+esc(c.name):'')+'</span></span><span class="row-a">'+(S.edit?'':'<button type="button" class="mini ico" data-act="edit-sec" data-sec="notes" aria-label="Edit notes" title="Edit notes (E)">'+ic("pen")+'</button>')+'</span></div><div class="pscroll" data-scroll>';
 if(!DV.notesN)h+='<div class="rb-empty"><span>'+ic("note")+'</span><div><b>No notes yet.</b><small>'+(DV.cookedN?'Anything worth remembering next time.':'Cook it once and the thumbs and notes start here.')+'</small></div></div>';
 h+=NOTES.map(S.edit?noteCardEdit:noteCard).join("")+'</div>';
 return h+'<div class="pfoot" data-pfoot-notes>'+noteFoot()+'</div>'}
function noteFoot(){return S.composing?'<div class="composer"><textarea class="edin" data-add="note" rows="3" maxlength="4000" placeholder="Anything worth remembering next time" aria-label="New note"></textarea><div class="comp-a"><span class="hint">Ctrl+Enter adds. Esc cancels.</span><button type="button" class="mini" data-act="note-cancel">Cancel</button><button type="button" class="rb-btn pri" data-act="note-add">Add</button></div></div>'
 :'<button type="button" class="rb-btn" data-act="note">'+ic("plus")+' Add a note</button>'}
function cookedPane(){
 var h='<div class="lblrow"><span class="lbl">Cooked <span class="sub">'+DV.cookedN+(DV.cookedN>=40?"+":"")+' time'+(DV.cookedN>1?'s':'')+'</span></span></div>';
 if(D.react.fav)h+='<p class="fav">'+esc(D.react.fav)+'</p>';
 h+='<div class="pscroll" data-scroll>';
 D.cooks.forEach(function(c){h+='<div class="hist"><div class="d">'+(c.d?'<b>'+c.d+'</b>':'')+c.m+'</div><div class="t"><b>'+esc(c.by)+'</b> cooked '+esc(c.v)+(c.line?'<small>“'+esc(c.line)+'”</small>':'')+((c.verdict||c.ate)?'<small>'+(c.verdict?'<em class="vd">'+c.verdict+'</em>':'')+(c.verdict&&c.ate?' . ':'')+(c.ate?c.ate+' ate':'')+'</small>':'')+'</div></div>'});
 return h+'</div>'}
function phoPane(){return '<div class="lblrow"><span class="lbl">Photos <span class="sub">'+DV.photosN+'</span></span></div><div class="pscroll" data-scroll><div id="pgrid" class="pgrid"><button type="button" class="pmore" data-act="pmore">Show '+DV.photosN+' photos <small>(loads on tap)</small></button></div></div>'}
var panes={ing:ingPane,notes:notesPane,cooked:cookedPane,pho:phoPane};

/* ---------------- method ---------------- */
function photoCell(s,n){
 var ph=s.ph;
 if(!S.edit){
  if(!ph)return"";
  if(ph==="prep")return '<span class="psp pprep" title="Photo is being prepared">Photo being prepared</span>';
  var real=ph.indexOf("img:")===0,bg=real?'background-image:url('+IMG+ph.slice(4)+'-m.webp)':'background-image:linear-gradient(150deg,'+ph+',color-mix(in srgb,'+ph+' 55%,#000))';
  return '<button type="button" class="psp" data-act="psp" style="'+bg+'" aria-expanded="false" aria-label="Enlarge the photo for step '+n+'" title="Enlarge (Esc closes)">'+(real?'':'<span class="pf">'+D.emoji+'</span>')+'<span class="zm" aria-hidden="true">'+ic("zoom","s")+'</span></button>'}
 if(!ph){var full=STP.filter(function(x){return x.ph}).length>=MAXSTEPPH;
  return '<button type="button" class="addph" data-act="addph" '+(full?'disabled title="A recipe keeps up to '+MAXSTEPPH+' step photos"':'title="Add a photo to step '+n+'"')+' aria-label="Add a photo to step '+n+'">'+ic("image","s")+(full?'10 of 10':'Photo')+'</button>'}
 if(ph==="prep")return '<span class="pwrap"><span class="psp pprep" title="Photo is being prepared">Photo being prepared</span><button type="button" class="phx" data-act="rmph" aria-label="Remove the photo from step '+n+'" title="Remove the photo">'+ic("x","s")+'</button></span>';
 var real2=ph.indexOf("img:")===0,bg2=real2?'background-image:url('+IMG+ph.slice(4)+'-m.webp)':'background-image:linear-gradient(150deg,'+ph+',color-mix(in srgb,'+ph+' 55%,#000))';
 return '<span class="pwrap"><span class="psp" style="'+bg2+'" role="img" aria-label="Photo for step '+n+'">'+(real2?'':'<span class="pf">'+D.emoji+'</span>')+'</span><button type="button" class="phx" data-act="rmph" aria-label="Remove the photo from step '+n+'" title="Remove the photo (undo for 5 minutes)">'+ic("x","s")+'</button></span>'}
function timerHtml(s){return s.m?ic("timer")+mins(s.m):""}
function stepRow(s,n){
 if(s.k==="g"){
  if(!S.edit)return '<h3 class="grp">'+esc(s.name)+'</h3>';
  return '<div class="stp stp-g" data-row="'+s.id+'" data-list="stp"><div class="nbw">'+grip(s.name+" (group)")+'</div><div class="sb"><h3 class="grp">'+ed("g:"+s.id,esc(s.name),{cls:"nm",label:"Edit the group name"})+'</h3></div>'+rmBtn(s.name+" (group heading)")+'</div>'}
 if(!S.edit)return '<div class="stp" data-row="'+s.id+'" data-i="'+(n-1)+'"><div class="nbw"><span class="nb">'+n+'</span>'+(s.m?'<span class="timer">'+timerHtml(s)+'</span>':'')+'</div><div class="sb"><p>'+esc(s.t)+'</p></div>'+photoCell(s,n)+'</div>';
 return '<div class="stp stp-e" data-row="'+s.id+'" data-list="stp" data-i="'+(n-1)+'"><div class="nbw"><span class="nb">'+n+'</span>'
  +ed("s:"+s.id+":m",s.m?timerHtml(s):ic("timer")+'<i>time</i>',{cls:"timer et"+(s.m?'':' none'),label:"Edit the time for step "+n})
  +'<span class="racts">'+grip("step "+n)+rmBtn("step "+n)+'</span></div>'
  +'<div class="sb">'+ed("s:"+s.id+":t",esc(s.t)||'<i>Write the step</i>',{cls:"tx",label:"Edit step "+n})+'</div>'+photoCell(s,n)+'</div>'}
function stepsHtml(){var n=0,h="";STP.forEach(function(s){if(s.k==="s")n++;h+=stepRow(s,n)});return h}
function method(){
 var c=DV.stpN,h='<main class="meth" id="met" data-steps="'+c+'"><div class="lblrow"><span class="lbl">Method <span class="sub">'+c+' step'+(c===1?'':'s')+'</span></span><span class="row-a">'+(S.edit?'':'<button type="button" class="mini ico" data-act="edit-sec" data-sec="met" aria-label="Edit method" title="Edit method (E)">'+ic("pen")+'</button>')+'</span></div>';
 h+='<div class="mscroll" data-scroll>';
 if(!STP.length)h+='<div class="rb-empty"><span>'+ic("plus")+'</span><div><b>No steps yet.</b><small>'+(S.edit?'Type the first step below.':'Press E to add them.')+'</small></div></div>';
 h+='<div class="steps">'+stepsHtml()+'</div></div>';
 if(S.edit)h+='<div class="mfoot"><label class="addrow"><span class="vh">Add a step</span>'+ic("plus","s")+'<input class="edin" data-add="stp" placeholder="Add a step, then Enter" maxlength="400" autocomplete="off"></label><button type="button" class="mini" data-act="addgrp" data-list="stp" aria-label="Add a group heading" title="Add a group heading">'+ic("plus","s")+' Group heading</button></div>';
 return h+'</main>'}

/* ---------------- hero and edit strip ---------------- */
function vchipHtml(){var c=cur(),vers=VERS.length>1;
 return '<div class="vwrap"><button type="button" class="vchip" data-act="vchip" aria-haspopup="true" aria-expanded="false" title="Switch version">'+(c.usual?'<span class="us" title="Our usual">★</span>':'')+(c.review?'<span class="rvd" title="Has a change to review"></span>':'')+'<span class="vn">'+esc(c.name)+'</span>'+(vers?ic("chev","s"):'')+'</button>'
 +(vers?'<div class="vpop" data-vpop role="menu" hidden>'+VERS.map(function(v){return '<button type="button" role="menuitem" class="vi'+(v.id===D.ver?' on':'')+'">'+(v.usual?'<span class="us">★</span>':'<span class="us"></span>')+'<span class="vl"><b>'+esc(v.name)+'</b>'+(v.parent?'<small>From '+esc(v.parent)+'</small>':'<small>First version</small>')+'</span>'+(v.st==="trying"?'<em>Trying</em>':'')+(v.review?'<em class="rv">To review</em>':'')+'</button>'}).join("")+'<a class="vall" href="#">All versions</a></div>':'')+'</div>'}
function hero(){
 var d=DV,c=cur();
 var pill='<button type="button" class="rb-notesbtn re-a" data-act="lane" aria-label="Notes and reactions: '+d.upN+' liked, '+d.dnN+' not for me, '+d.notesN+' notes" title="Notes and reactions (N)"><i class="rb-pillcnt"><i class="u">'+ic("up")+d.upN+'</i>'+(d.dnN?'<i class="d">'+ic("dn")+d.dnN+'</i>':'')+'<i>'+ic("note")+d.notesN+'</i></i><span class="kbd">N</span></button>';
 var hist='<button type="button" class="hico" data-act="hist" aria-expanded="'+S.histOpen+'" aria-controls="hlane" aria-label="History (,)" title="History (,)">'+ic("hist")+'</button>';
 var serves=S.edit?'<button type="button" class="svcta ed ed-b" data-ed="serves" aria-label="Edit how many it serves" title="Edit how many it serves">'+ic("people","s")+'Serves '+META.serves+'</button>'
  :'<div class="svwrap"><button type="button" class="svcta" data-act="svcta" aria-haspopup="true" aria-expanded="false" title="Change servings">'+ic("people","s")+'<span>Serves '+S.servesNow+'</span>'+ic("chev","s")+'</button>'
   +'<div class="spop" data-spop role="group" aria-label="Servings" hidden><div class="serves"><button type="button" data-act="dec" aria-label="Fewer servings">−</button><span>'+S.servesNow+' serving'+(S.servesNow>1?'s':'')+'</span><button type="button" data-act="inc" aria-label="More servings">+</button></div><small>Scales the ingredients and Cook it</small></div></div>';
 var time=S.edit?'<button type="button" class="tbadge ed ed-b'+(META.min?'':' none')+'" data-ed="time" aria-label="Edit the total time" title="Edit the total time">'+ic("clock","s")+(META.min?mins(META.min):'Add time')+'</button>'
  :(META.min?'<span class="tbadge" title="Total time">'+ic("clock","s")+mins(META.min)+'</span>':'');
 var ren=S.edit?'<button type="button" class="hico ed ed-b" data-ed="vname" aria-label="Rename this version" title="Rename this version">'+ic("pen","s")+'</button>':'';
 var planBtn='<button type="button" class="rb-btn" data-act="plan"'+(S.edit?' disabled title="Finish editing to plan it"':'')+'>'+ic("plan")+(D.planned?'<span class="lw">Planned </span>'+D.planned:'Plan it')+'</button>';
 var cook='<a class="rb-btn pri" href="#cook?n='+S.servesNow+'" data-act="cook"'+(S.edit?' aria-disabled="true" tabindex="-1" title="Finish editing to cook it"':'')+'>'+ic("cook")+'Cook it</a>';
 return '<header class="hero'+(D.banner?'':' nobanner')+'" id="hero">'
 +(D.banner?'<div class="hphoto" aria-hidden="true"><img src="'+D.banner+'" alt="" width="1600" height="560" decoding="async"></div>':'')
 +'<div class="hbody"><div class="hr1"><div class="hmain"><a class="back ib" href="#" aria-label="Back to Recipes">'+ic("back")+'</a>'
 +'<h1 data-vt="title" title="'+esc(META.name)+'">'+(S.edit?'<button type="button" class="ed ed-t" data-ed="title" aria-label="Edit the name" title="Edit the name">'+esc(META.name)+'</button>':esc(META.name))+'</h1></div>'
 +'<div class="hicons">'+pill
 +'<button type="button" class="ib" data-act="star" aria-pressed="'+(D.react.mine==="up")+'" aria-label="Like this version">'+ic("star")+'</button>'
 +'<button type="button" class="shr-chip edtog" data-act="edit" aria-pressed="'+S.edit+'" title="'+(S.edit?'Finish editing':'Edit this recipe')+' (E)">'+ic("pen","s")+'<span class="sl">'+(S.edit?'Editing':'Edit')+'</span><span class="kbd">E</span></button>'
 +(D.share!==null?'<button type="button" class="shr-chip" data-act="share">'+ic("share","s")+'<span class="sl">Share</span>'+(D.share?'<span class="shr-n">'+D.share+'</span>':'')+'<span class="kbd">S</span></button>':'')
 +'<button type="button" class="ib" data-act="more" aria-label="More">'+ic("more")+'</button></div></div>'
 +'<div class="hr2"><div class="hmeta">'+serves+time+vchipHtml()+ren+hist+'</div>'
 +'<div class="hgo">'+planBtn+cook+'</div></div></div></header>'}
function revLabel(){return "revision "+(S.revOpen?S.revN:S.revN+1)}
function whereText(){return S.target==="fix"?'Fixing this version, '+revLabel():S.target==="both"&&!S.forked?'New version starts at your first change':S.forked?'New version, a try, '+revLabel():'A try, edited in place, '+revLabel()}
function strip(){
 if(!S.edit)return"";var c=cur(),q=askNeeded();
 var where=q?'<span class="es-q" id="esq">Where should changes go?</span><span class="seg" role="group" aria-label="Where should changes go">'
   +[["fix","Fix this one"],["both","Keep both"],["own","Different dish"]].map(function(o){return '<button type="button" data-act="target" data-v="'+o[0]+'" aria-pressed="false"'+(o[0]==="own"?' title="Starts its own recipe, linked back"':o[0]==="both"?' title="A new version that starts as Trying; this one stays as it is"':' title="Revision of this version; everyone cooking it gets the fix"')+'>'+o[1]+'</button>'}).join("")+'</span>'
  :'<span class="es-w">'+whereText()+'</span>';
 return '<div class="estrip" id="estrip" role="region" aria-label="Editing">'
  +'<span class="es-t">'+ic("pen","s")+'Editing <b>'+esc(c.name)+'</b></span>'+where
  +'<span class="es-sp"></span><span class="es-s" id="ess" role="status"></span>'
  +'<button type="button" class="mini" data-act="undolast" id="esu">'+ic("undo","s")+' Undo last <span class="kbd">Ctrl Z</span></button>'
  +'<button type="button" class="rb-btn pri es-done" data-act="edit">'+ic("check","s")+' Done <span class="kbd">E</span></button></div>'}
function statusText(){if(!S.changes)return S.saved||"Nothing changed yet";return (S.saved==="Saved"?"✓ Saved":"✓ All changes saved")+" · "+S.changes+" change"+(S.changes>1?"s":"")}
function updStatus(){var e=$("#ess");if(e){e.textContent=statusText();e.dataset.just=S.saved==="Saved"?"1":""}var u=$("#esu");if(u)u.disabled=!lastUndo()}

/* ---------------- lanes ---------------- */
function lane(){
 var rows=D.react.people.map(function(p){return '<li class="pr"><span class="rb-av m'+(p[0]==="You"?3:p[0]==="Sam"?2:1)+'">'+esc(p[0].charAt(0))+'</span><span class="pn">'+esc(p[0])+'</span><span class="rb-th '+p[1]+'">'+ic(p[1]==="up"?"up":"dn")+(p[1]==="up"?'Liked it':'Not for me')+'</span><small>'+esc(p[2])+'</small></li>'}).join("");
 var rem=D.cooks.filter(function(c){return c.line}).map(function(c){return '<div class="note"><p>“'+esc(c.line)+'”</p><small>'+esc(c.by)+', '+c.d+' '+c.m+' . cooked '+esc(c.v)+'</small></div>'}).join("");
 return '<aside class="rfly rfly-notes" id="lane" aria-label="Notes and reactions"'+(S.laneOpen?'':' hidden')+'><header class="rfh"><h2>Notes and reactions</h2><button type="button" class="x" data-act="laneclose" aria-label="Close (Ctrl+Enter)">'+ic("x")+'</button></header>'
 +'<div class="rfb" data-scroll><section><h3 class="rb-h4">Reactions <span class="sub">'+(D.react.people.length?D.react.people.length+' of '+D.react.household+' rated':'')+'</span></h3>'
 +(rows?'<ul class="plist">'+rows+'</ul>':'<p class="mut">Nobody has reacted yet.</p>')+'</section>'
 +'<section><h3 class="rb-h4">Cook remarks <span class="sub">'+DV.remarksN+'</span></h3>'+(rem||'<p class="mut">None yet.</p>')+'</section>'
 +'<section><h3 class="rb-h4">Notes on this version <span class="sub">'+NOTES.length+'</span></h3>'+(NOTES.slice().reverse().map(noteCard).join("")||'<p class="mut">No notes yet.</p>')+'</section></div>'
 +'<footer class="rff"><button type="button" class="rb-btn pri" data-act="note">'+ic("plus")+' Add a note</button></footer></aside>'}
function histLane(){
 var c=cur(),chain=[],v=c;while(v){chain.unshift(v);var pn=v.parent;v=pn?VERS.filter(function(x){return x.name===pn})[0]:null}
 var rows=HIST.map(function(h){
  return '<li class="hrow'+(h.mine?' mine':'')+(h.done?' undone':'')+'" data-hid="'+h.id+'"><div class="hd"><b>'+esc(h.at)+'</b>'+(h.mine?'<small class="rv">rev '+h.rev+'</small>':'')+'</div><div class="ht"><p><b>'+esc(h.by)+'</b> '+(h.from?'started':'changed')+' <span class="hv">'+esc(h.v)+'</span>'+(h.from?' <small>from '+esc(h.from)+'</small>':'')+'</p><p class="hw">'+esc(h.what)+'</p>'
   +(h.mine&&h.undo?(h.done?'<span class="hu">Undone</span>':'<button type="button" class="hundo" data-act="hundo" data-id="'+h.id+'">'+ic("undo","s")+' Undo'+(h.until?' <small>(5 min)</small>':'')+'</button>'):'')+'</div></li>'}).join("");
 return '<aside class="rfly rfly-hist" id="hlane" aria-label="History"'+(S.histOpen?'':' hidden')+'><header class="rfh"><h2>History</h2><button type="button" class="x" data-act="histclose" aria-label="Close (Esc)">'+ic("x")+'</button></header>'
 +'<div class="rfb" data-scroll><section><h3 class="rb-h4">This version <span class="sub">'+esc(c.name)+'</span></h3><p class="chain">'+chain.map(function(x,i){return (i?'<span class="ar" aria-hidden="true">→</span>':'')+'<span class="ch'+(x.id===c.id?' on':'')+'">'+esc(x.name)+'</span>'}).join("")+'</p></section>'
 +'<section><h3 class="rb-h4">Changes <span class="sub">'+HIST.length+'</span></h3><ol class="hlist">'+rows+'</ol></section></div></aside>'}
function renderLanes(){$("#lane-slot").innerHTML=lane()+histLane();$$("#lane-slot [data-scroll]").forEach(function(s){s.addEventListener("scroll",fades)});$(".app").classList.toggle("lane-open",S.laneOpen||S.histOpen)}

/* ---------------- paint ---------------- */
var rt=$("#rtab"),WIDE=matchMedia("(min-width:1280px) and (min-height:700px)");
function paint(o){o=o||{};
 if(EDB)closeEd(EDB);
 var sc=$$("#rtab [data-scroll]").map(function(s){return s.scrollTop});
 DV=derived();
 var railT='<div class="tabs" role="tablist" aria-label="Ingredients, notes, cooked, photos">'+DV.tabs.map(function(t){return '<button type="button" role="tab" id="tab-'+t[0]+'" aria-controls="p-'+t[0]+'" data-tab="'+t[0]+'" aria-selected="'+(t[0]===tab)+'" tabindex="'+(t[0]===tab?0:-1)+'" title="'+t[1]+' ('+t[3]+')"><span class="tl">'+t[1]+'</span>'+(t[2]?'<b class="bdg">'+t[2]+'</b>':'')+'</button>'}).join("")+'</div>';
 var rail='<aside class="rail" aria-label="Ingredients, notes, cooked, photos">'+railT+DV.tabs.map(function(t){return '<section class="pane" role="tabpanel" id="p-'+t[0]+'" aria-labelledby="tab-'+t[0]+'"'+(t[0]===tab?'':' hidden')+' data-pane="'+t[0]+'">'+panes[t[0]]()+'</section>'}).join("")
  +(D.source?'<p class="src" title="Where it came from">'+ic("branch","s")+'<span>'+esc(D.source)+'</span></p>':'')+'</aside>';
 rt.innerHTML=hero()+strip()+'<div class="rbody">'+rail+method()+'</div>';
 rt.dataset.dens=S.dens;rt.dataset.tab=tab;rt.dataset.r=R;rt.dataset.size=key;rt.dataset.edit=S.edit?"1":"";rt.dataset.gated=askNeeded()?"1":"";
 document.title="Recipe detail, desktop, inline edit ("+R+(S.edit?", editing":"")+")";
 $$("#rtab [data-scroll]").forEach(function(s,i){if(sc[i])s.scrollTop=sc[i];s.addEventListener("scroll",fades)});
 renderLanes();updStatus();fades();
 if(o.focus){var f=$(o.focus);if(f)f.focus({preventScroll:false})}
 if(o.open){var b=$('[data-ed="'+o.open+'"]');if(b){b.scrollIntoView({block:"nearest"});openEd(b)}}}
function fades(){$$("[data-scroll]").forEach(function(s){var more=s.scrollHeight-s.clientHeight>1;s.dataset.more=more?(s.scrollTop+s.clientHeight<s.scrollHeight-2?"down":"end"):"none"})}
addEventListener("resize",fades);

/* ---------------- toast with Undo ---------------- */
function toast(m,act,fn){var t=$("#toast");t.textContent="";var s=document.createElement("span");s.textContent=m;t.appendChild(s);
 if(act){var b=document.createElement("button");b.type="button";b.className="tundo";b.textContent=act;b.onclick=function(){t.hidden=true;fn()};t.appendChild(b)}
 t.hidden=false;clearTimeout(toast.t);toast.t=setTimeout(function(){t.hidden=true},act?7000:2600)}

/* ---------------- changes: one entry per saved edit, each undoable on its own ---------------- */
function lastUndo(){for(var i=S.stack.length-1;i>=0;i--)if(!S.stack[i].done)return S.stack[i];return null}
function forkVersion(){var p=cur(),nv={id:"n"+(++uid),name:p.name+", edited",st:"trying",parent:p.name};VERS.push(nv);D.ver=nv.id;S.forked=true;S.target="inplace";S.revN=0;S.revOpen=false;
 HIST.unshift({id:nid("h"),at:"Today",by:"You",v:nv.name,from:p.name,what:"Started this version from "+p.name+".",mine:false});refreshVersionBits();toast("Started a new version, "+nv.name+", from "+p.name+". "+p.name+" stays as it is.")}
function record(ch,photo){
 if(S.target==="both"&&!S.forked)forkVersion();
 if(!S.revOpen){S.revOpen=true;S.revN++}
 var e={id:nid("h"),what:ch.what,undo:ch.undo,done:false,rev:S.revN};if(photo)e.until=Date.now()+300000;
 S.stack.push(e);S.changes++;S.saved="Saved";
 HIST.unshift({id:e.id,at:"Today",by:"You",v:cur().name,what:ch.what,mine:true,rev:S.revN,undo:true,until:e.until||0,done:false});
 clearTimeout(record.t);record.t=setTimeout(function(){S.saved="All saved";updStatus()},3200);
 renderLanes();updStatus();refreshStripWhere();
 toast(ch.what,"Undo",function(){undoEntry(e)})}
function undoEntry(e){if(!e||e.done)return;if(e.until&&Date.now()>e.until){toast("The 5 minutes for undoing this photo change are over.");return}
 e.undo();e.done=true;S.changes=Math.max(0,S.changes-1);var h=find(HIST,e.id);if(h)h.done=true;S.saved="All saved";
 paint({focus:S.edit?".estrip .es-done":".edtog"});toast("Undone: "+e.what)}
function refreshVersionBits(){var w=$(".vwrap");if(w){var tmp=document.createElement("div");tmp.innerHTML=vchipHtml();w.replaceWith(tmp.firstChild)}
 var st=$("#estrip");if(st){var t=document.createElement("div");t.innerHTML=strip();st.replaceWith(t.firstChild);updStatus()}
 var sn=$("[data-subnotes]");if(sn)sn.textContent=DV.notesN?"on "+cur().name:"";renderLanes()}
function refreshStripWhere(){var w=$(".estrip .es-w");if(w)w.textContent=whereText();rt.dataset.gated=askNeeded()?"1":""}

/* ---------------- field editors ---------------- */
var EDB=null;
function spec(k){
 var p=k.split(":"),a=p[0],x;
 if(a==="title")return {cls:"ti",label:"Name",max:80,get:function(){return META.name},validate:function(v){return v?null:"Give the recipe a name."},show:function(){return esc(META.name)},
  set:function(v){var o=META.name;META.name=v;return {what:"Renamed the recipe to “"+v+"”",undo:function(){META.name=o}}}};
 if(a==="serves")return {cls:"sv",label:"Serves",max:2,mode:"numeric",hint:"How many it makes. Amounts stay as written.",get:function(){return String(META.serves)},same:function(v){return +v===META.serves},validate:function(v){return /^\d{1,2}$/.test(v)&&+v>=1?null:"Serves needs a whole number from 1 to 99."},
  show:function(){return ic("people","s")+"Serves "+META.serves},set:function(v){var o=META.serves;META.serves=+v;S.servesNow=META.serves;return {what:"Serves changed from "+o+" to "+v,undo:function(){META.serves=o;S.servesNow=o}}}};
 if(a==="time")return {cls:"tm",label:"Total time",max:8,hint:"Minutes, or hours and minutes: 45 or 1 h 30.",get:function(){return META.min?mins(META.min):""},same:function(v){return (v===""?null:parseMin(v))===META.min},
  validate:function(v){if(v==="")return null;var n=parseMin(v);return isNaN(n)||n<1||n>1440?"Use minutes (45) or hours and minutes (1 h 30), up to 24 hours.":null},
  show:function(){return ic("clock","s")+(META.min?mins(META.min):"Add time")},
  set:function(v){var o=META.min,n=v===""?null:parseMin(v);META.min=n;return {what:n?"Total time set to "+mins(n):"Total time removed",undo:function(){META.min=o}}}};
 if(a==="vname")return {cls:"vn",label:"Version name",max:60,hide:".vwrap",get:function(){return cur().name},validate:function(v){if(!v)return "Give the version a name.";var dup=VERS.some(function(z){return z.id!==cur().id&&z.name.toLowerCase()===v.toLowerCase()});return dup?"Another version already has that name.":null},
  show:function(){return ic("pen","s")},after:refreshVersionBits,set:function(v){var c=cur(),o=c.name;c.name=v;VERS.forEach(function(z){if(z.parent===o)z.parent=v});HIST.forEach(function(h){if(h.v===o)h.v=v;if(h.from===o)h.from=v});return {what:"Renamed the version to “"+v+"”",undo:function(){c.name=o;VERS.forEach(function(z){if(z.parent===v)z.parent=o});HIST.forEach(function(h){if(h.v===v)h.v=o;if(h.from===v)h.from=o})}}}};
 if(a==="g"){x=find(ING,p[1])||find(STP,p[1]);if(!x)return null;
  return {cls:"gn",label:"Group name",max:40,fresh:x.fresh,get:function(){return x.name},validate:function(v){return v?null:"Name the group, or remove it."},show:function(){return esc(x.name)},set:function(v){var o=x.name;x.name=v;if(x.fresh){delete x.fresh;var arr=find(ING,x.id)?ING:STP;return {what:"Added the group \u201c"+v+"\u201d",undo:function(){var i=idx(arr,x.id);if(i>=0)arr.splice(i,1)}}}return {what:"Renamed the group “"+o+"” to “"+v+"”",undo:function(){x.name=o}}}}}
 if(a==="i"){x=find(ING,p[1]);if(!x)return null;var f=p[2];
  if(f==="q")return {cls:"iq",label:"Amount",max:8,get:function(){return x.q===null?"":fmt(x.q)},same:function(v){var r=parseQty(v);return r.v===x.q},validate:function(v){var r=parseQty(v);return r.err||null},show:function(){return x.q===null?'<i aria-label="amount unknown">?</i>':fmt(x.q)},
   set:function(v){var o=x.q,r=parseQty(v);x.q=r.v;return {what:"Changed "+x.name.replace(/,.*/,"")+" to "+(x.q===null?"an unknown amount":qtext(x)),undo:function(){x.q=o}}}};
  if(f==="u")return {cls:"iu",label:"Unit",max:12,list:"units",get:function(){return x.u},validate:function(){return null},show:function(){return x.u?esc(x.u):'<i>unit</i>'},
   set:function(v){var o=x.u;x.u=v;return {what:"Changed the unit of "+x.name.replace(/,.*/,"")+" to "+(v||"none"),undo:function(){x.u=o}}}};
  return {cls:"in",label:"Ingredient",max:80,fresh:x.fresh,get:function(){return x.name},validate:function(v){return v?null:"Name the ingredient."},show:function(){return esc(x.name)+(x.opt?' <small>(optional)</small>':"")},
   after:function(){insertBlank("ing",x.id)},set:function(v,b){var o=x.name;x.name=v;if(x.fresh){delete x.fresh;return {what:"Added "+v.replace(/,.*/,""),undo:function(){var i=idx(ING,x.id);if(i>=0)ING.splice(i,1)}}}return {what:"Renamed “"+o.replace(/,.*/,"")+"” to “"+v.replace(/,.*/,"")+"”",undo:function(){x.name=o}}}}}
 if(a==="s"){x=find(STP,p[1]);if(!x)return null;
  if(p[2]==="m")return {cls:"sm",label:"Time in minutes",max:4,mode:"numeric",hint:"Minutes. Empty means no timer.",get:function(){return x.m?String(x.m):""},same:function(v){return (v===""?0:+v)===x.m},validate:function(v){return v===""||(/^\d{1,4}$/.test(v)&&+v>=1&&+v<=1440)?null:"Use whole minutes from 1 to 1440."},
   show:function(){return x.m?timerHtml(x):ic("timer")+'<i>time</i>'},set:function(v){var o=x.m;x.m=v===""?0:+v;var n=stepNo(x.id);return {what:(x.m?"Step "+n+" time set to "+mins(x.m):"Step "+n+" time removed"),undo:function(){x.m=o}}}};
  return {cls:"st",label:"Step",area:true,enterCommits:true,max:400,fresh:x.fresh,get:function(){return x.t},validate:function(v){return v?null:"Write the step, or remove it."},show:function(){return esc(x.t)||'<i>Write the step</i>'},
   after:function(){insertBlank("stp",x.id)},set:function(v){var o=x.t;x.t=v;var n=stepNo(x.id);if(x.fresh){delete x.fresh;return {what:"Added step "+n,undo:function(){var i=idx(STP,x.id);if(i>=0)STP.splice(i,1)}}}return {what:"Reworded step "+n,undo:function(){x.t=o}}}}}
 if(a==="n"){x=find(NOTES,p[1]);if(!x)return null;
  return {cls:"nt",label:"Note",area:true,max:4000,multi:true,raw:true,hint:"Enter starts a new line. Ctrl+Enter saves.",get:function(){return noteToText(x)},
   validate:function(v){return v.trim()?null:"A note needs some words. Use Remove to take it off."},show:function(){return noteBody(x)},
   set:function(v){var ob=x.b,ol=x.li,r=textToNote(v.trim());x.b=r.b;x.li=r.li;x.reworded=true;return {what:"Reworded a note",undo:function(){x.b=ob;x.li=ol}}}}}
 return null}
function stepNo(id){var n=0;for(var i=0;i<STP.length;i++){if(STP[i].k==="s")n++;if(STP[i].id===id)return n}return n}
function vis(el){return el.offsetParent!==null&&!el.hidden}
function openEd(btn){
 if(EDB){if(EDB.btn===btn)return;if(!commitEd(EDB))return}
 if(askNeeded()){nudge();return}
 var sp=spec(btn.dataset.ed);if(!sp)return;
 var el=document.createElement(sp.area?"textarea":"input"),w=document.createElement("span"),msg=document.createElement("span");
 w.className="edw "+sp.cls;msg.className="edmsg";msg.hidden=!sp.hint;msg.textContent=sp.hint||"";
 el.className="edin";if(!sp.area)el.type="text";else el.rows=sp.multi?3:1;
 el.value=sp.get();if(sp.max)el.maxLength=sp.max;if(sp.mode)el.inputMode=sp.mode;if(sp.list)el.setAttribute("list",sp.list);el.setAttribute("aria-label",sp.label);el.autocomplete="off";
 if(sp.hint){msg.id="m"+(++uid);el.setAttribute("aria-describedby",msg.id)}
 w.appendChild(el);w.appendChild(msg);
 var hideEl=sp.hide?$(sp.hide):null;btn.hidden=true;if(hideEl)hideEl.hidden=true;btn.after(w);
 var b=EDB={btn:btn,sp:sp,w:w,el:el,msg:msg,hideEl:hideEl,closing:false};
 var grow=function(){if(sp.area){el.style.height="auto";el.style.height=Math.min(el.scrollHeight+2,sp.multi?260:140)+"px"}};
 el.addEventListener("input",function(){el.removeAttribute("aria-invalid");msg.className="edmsg";msg.textContent=sp.hint||"";msg.hidden=!sp.hint;grow();
  if(sp.max&&el.value.length>=sp.max*0.9&&sp.max>10){msg.hidden=false;msg.textContent=el.value.length+" of "+sp.max+" characters"}});
 el.addEventListener("keydown",function(e){
  if(e.key==="Escape"){e.preventDefault();e.stopPropagation();cancelEd(b);return}
  if(e.key==="Tab"&&!e.altKey&&!e.ctrlKey&&!e.metaKey){e.preventDefault();var d=e.shiftKey?-1:1;if(commitEd(b))moveNext(btn,d);return}
  if(e.key==="Enter"){var mod=e.ctrlKey||e.metaKey;
   if(sp.area&&!sp.enterCommits){if(mod){e.preventDefault();commitEd(b)}return}
   if(sp.area&&e.shiftKey)return;
   e.preventDefault();if(commitEd(b)&&mod&&sp.after)sp.after()}});
 el.addEventListener("blur",function(){if(b.closing)return;setTimeout(function(){if(EDB===b&&document.activeElement!==el)commitEd(b)},0)});
 el.focus();if(sp.area){el.setSelectionRange(el.value.length,el.value.length)}else el.select();grow();
 btn.scrollIntoView({block:"nearest"})}
function closeEd(b){if(!b||b.closing)return;b.closing=true;if(EDB===b)EDB=null;b.w.remove();b.btn.hidden=false;if(b.hideEl)b.hideEl.hidden=false}
function cancelEd(b){var fresh=b.sp.fresh;closeEd(b);if(fresh)discardFresh(b.btn);b.btn.focus()}
function commitEd(b){
 var sp=b.sp,v=b.el.value;if(!sp.raw)v=v.trim();
 if(sp.fresh&&v===""){closeEd(b);discardFresh(b.btn);return true}
 var err=sp.validate?sp.validate(v):null;
 if(err){b.el.setAttribute("aria-invalid","true");b.msg.hidden=false;b.msg.className="edmsg err";b.msg.textContent=err;return false}
 var same=(sp.same?sp.same(v):String(sp.get())===v)&&!sp.fresh;
 closeEd(b);
 if(!same){var ch=sp.set(v,b);record(ch);b.btn.innerHTML=sp.show();if(sp.after)sp.after();justSaved(b.btn)}
 return true}
function justSaved(el){if(!el.isConnected)return;el.classList.remove("just");void el.offsetWidth;el.classList.add("just");setTimeout(function(){el.classList.remove("just")},1700)}
function moveNext(btn,d){var list=$$("[data-ed]").filter(vis),i=list.indexOf(btn),n=list[i+d];if(n){n.scrollIntoView({block:"nearest"});openEd(n)}else btn.focus()}
function nudge(){var q=$("#esq"),f=$("[data-act=target]");if(q){q.classList.add("nudge");setTimeout(function(){q.classList.remove("nudge")},1200)}if(f)f.focus();toast("Choose where your changes go first.")}
function discardFresh(btn){var row=btn.closest("[data-row]");if(!row)return;var id=row.dataset.row,list=row.dataset.list,arr=list==="ing"?ING:STP,i=idx(arr,id),prev=row.previousElementSibling;if(i>=0)arr.splice(i,1);row.remove();renumber();var f=prev&&$("[data-ed]",prev);if(f)f.focus();else{var a=$(list==="ing"?"[data-add=ing]":"[data-add=stp]");if(a)a.focus()}}
function renumber(){var n=0;$$("#met .stp").forEach(function(r){var nb=$(".nb",r);if(nb){n++;nb.textContent=n}})}

/* ---------------- structure: add, insert, remove, move ---------------- */
function insertBlank(list,afterId){
 var arr=list==="ing"?ING:STP,i=idx(arr,afterId),x=list==="ing"?{id:nid("i"),k:"i",name:"",q:null,u:"",pan:null,opt:false,fresh:true}:{id:nid("s"),k:"s",t:"",m:0,ph:null,fresh:true};
 arr.splice(i+1,0,x);var keep=EDB;if(keep)closeEd(keep);paint({open:list==="ing"?"i:"+x.id+":n":"s:"+x.id+":t"})}
function addItem(list,text){
 if(askNeeded()){nudge();return false}
 if(list==="ing"){var r=parseLine(text);if(!r.name)return false;var x={id:nid("i"),k:"i",name:r.name,q:r.q,u:r.u,pan:null,opt:false};ING.push(x);
  record({what:"Added "+r.name.replace(/,.*/,"")+(r.q!==null?" ("+qtext(x)+")":""),undo:function(){var i=idx(ING,x.id);if(i>=0)ING.splice(i,1)}});}
 else{var s={id:nid("s"),k:"s",t:text.trim(),m:0,ph:null};if(!s.t)return false;STP.push(s);var n=stepNo(s.id);
  record({what:"Added step "+n,undo:function(){var i=idx(STP,s.id);if(i>=0)STP.splice(i,1)}})}
 paint({focus:list==="ing"?"[data-add=ing]":"[data-add=stp]"});
 var sc=$(list==="ing"?"#p-ing [data-scroll]":"#met .mscroll");if(sc)sc.scrollTop=sc.scrollHeight;return true}
function addGroup(list){if(askNeeded()){nudge();return}var arr=list==="ing"?ING:STP,g={id:nid("g"),k:"g",name:"",fresh:true};
 arr.push(g);paint({open:"g:"+g.id})}
function removeRow(row){
 if(askNeeded()){nudge();return}
 var id=row.dataset.row,list=row.dataset.list,arr=list==="ing"?ING:list==="stp"?STP:NOTES,i=idx(arr,id),x=arr[i];if(!x)return;
 var label=list==="notes"||!list?"a note":x.k==="g"?"the group “"+x.name+"”":list==="ing"?x.name.replace(/,.*/,""):"step "+stepNo(id);
 arr.splice(i,1);
 var photo=false;
 record({what:"Removed "+label,undo:function(){arr.splice(Math.min(i,arr.length),0,x)}});
 paint({focus:list==="ing"?"[data-add=ing]":list==="stp"?"[data-add=stp]":".edtog"})}
function moveRow(arr,id,to,label){var i=idx(arr,id);if(i<0||to<0||to>=arr.length||to===i)return false;var x=arr.splice(i,1)[0];arr.splice(to,0,x);
 record({what:"Moved "+label,undo:function(){var j=idx(arr,id);if(j>=0){var y=arr.splice(j,1)[0];arr.splice(Math.min(i,arr.length),0,y)}}});return true}
function rowLabel(list,id){var arr=list==="ing"?ING:STP,x=find(arr,id);return x.k==="g"?"the group “"+x.name+"”":list==="ing"?x.name.replace(/,.*/,""):"step "+stepNo(id)}
function dropOn(list,id,targetId,after){var arr=list==="ing"?ING:STP,i=idx(arr,id),j=idx(arr,targetId);if(i<0||j<0||id===targetId)return;
 var to=j+(after?1:0);if(i<to)to--;moveRow(arr,id,to,rowLabel(list,id)+(to<i?" up":" down"));paint({focus:'[data-row="'+id+'"] .grip'})}

/* ---------------- edit mode on and off ---------------- */
function setEdit(on,sec){
 if(on===S.edit)return;
 if(on&&!WIDE.matches){toast("Below 80rem wide and 700px high the page stacks and the build keeps today's edit panel. Inline edit is drawn for the wide layout.");return}
 if(EDB&&!commitEd(EDB))return;
 if(on){S.edit=true;S.changes=0;S.saved="";S.servesNow=META.serves;S.revOpen=false;S.forked=false;S.target=cur().st==="trying"?"inplace":null;if(sec)tab=sec==="notes"?"notes":"ing";
  paint({focus:null});
  if(askNeeded()){var f=$("[data-act=target]");if(f)f.focus()}
  else{var first=sec==="met"?$('#met [data-ed$=":t"]'):sec==="notes"?$("#p-notes [data-ed]"):$("#p-ing [data-ed]")||$('[data-ed="title"]');if(first&&sec)openEd(first);else{var t=$('[data-ed="title"]');if(t)t.focus()}}}
 else{var n=S.changes,wasForked=S.forked;S.edit=false;S.dens=calcDens();S.servesNow=META.serves;S.revOpen=false;S.composing=false;
  paint({focus:".edtog"});
  toast(n?"Done. "+n+" change"+(n>1?"s":"")+" saved"+(wasForked?" to the new version":"")+". Each is in History with Undo.":"Done. Nothing was changed.")}}

/* ---------------- tabs, flyouts, popovers, photos ---------------- */
function setTab(t,focus){if(!DV.tabs.some(function(x){return x[0]===t}))return;if(EDB&&!commitEd(EDB))return;tab=t;rt.dataset.tab=t;
 $$("[role=tab]").forEach(function(b){var on=b.dataset.tab===t;b.setAttribute("aria-selected",on);b.tabIndex=on?0:-1;if(on&&focus)b.focus()});
 $$("[role=tabpanel]").forEach(function(p){p.hidden=p.dataset.pane!==t});fades();
 try{var u=new URL(location.href);u.searchParams.set("tab",t);history.replaceState(null,"",u)}catch(e){}}
function setLane(on){if(on&&S.histOpen)setHist(false);S.laneOpen=on;$("#lane").hidden=!on;$(".app").classList.toggle("lane-open",S.laneOpen||S.histOpen);var b=$('[data-act=lane]');if(b)b.setAttribute("aria-expanded",on);setTimeout(fades,200)}
function setHist(on,back){if(on&&S.laneOpen)setLane(false);S.histOpen=on;$("#hlane").hidden=!on;$(".app").classList.toggle("lane-open",S.laneOpen||S.histOpen);var b=$('[data-act=hist]');if(b){b.setAttribute("aria-expanded",on);if(!on&&back)b.focus()}if(on){var x=$("[data-act=histclose]");if(x)x.focus()}setTimeout(fades,200)}
function spopOpen(on){var p=$("[data-spop]"),c=$("[data-act=svcta]");if(!p)return;p.hidden=!on;c.setAttribute("aria-expanded",on)}
function vpopOpen(on){var p=$("[data-vpop]"),c=$("[data-act=vchip]");if(!p)return;p.hidden=!on;c.setAttribute("aria-expanded",on)}
function collapse(back){var o=$(".stp.open");if(!o)return;o.classList.remove("open");var b=$("[data-act=psp]",o);if(b){b.setAttribute("aria-expanded","false");if(back)b.focus()}fades()}
function scaleIng(){var p=$("#p-ing");if(p){p.innerHTML=ingPane();$$("#p-ing [data-scroll]").forEach(function(s){s.addEventListener("scroll",fades)});fades()}}
function stepServes(d){var n=S.servesNow+d;if(n<1||n>12)return;S.servesNow=n;var c=$("[data-act=svcta] span");if(c)c.textContent="Serves "+n;var s=$("[data-spop] .serves span");if(s)s.textContent=n+" serving"+(n>1?"s":"");var ck=$("[data-act=cook]");if(ck)ck.setAttribute("href","#cook?n="+n);scaleIng()}

/* photos: step photo add / remove (the banner and gallery stay in the existing photo sheet) */
function addPhoto(row){var s=find(STP,row.dataset.row);if(!s||askNeeded()){if(askNeeded())nudge();return}
 if(STP.filter(function(x){return x.ph}).length>=MAXSTEPPH)return;
 s.ph=PHOTOS[phCycle++%PHOTOS.length];var n=stepNo(s.id);record({what:"Added a photo to step "+n,undo:function(){s.ph=null}},true);paint({focus:'[data-row="'+s.id+'"] .phx'})}
function removePhoto(row){var s=find(STP,row.dataset.row);if(!s||askNeeded()){if(askNeeded())nudge();return}var o=s.ph,n=stepNo(s.id);s.ph=null;
 record({what:"Removed the photo from step "+n,undo:function(){s.ph=o}},true);paint({focus:'[data-row="'+s.id+'"] .addph'})}

/* notes composer (works outside edit mode too: adding a note is not editing the recipe) */
function openComposer(){if(S.edit&&askNeeded()){nudge();return}if(S.laneOpen)setLane(false);if(tab!=="notes")setTab("notes");S.composing=true;var f=$("[data-pfoot-notes]");f.innerHTML=noteFoot();var t=$("[data-add=note]");t.focus();bindComposer(t)}
function bindComposer(t){t.addEventListener("keydown",function(e){if(e.key==="Escape"){e.preventDefault();e.stopPropagation();closeComposer()}else if(e.key==="Enter"&&(e.ctrlKey||e.metaKey)){e.preventDefault();addNote()}})}
function closeComposer(){S.composing=false;$("[data-pfoot-notes]").innerHTML=noteFoot();var b=$("[data-act=note]",$("[data-pfoot-notes]"));if(b)b.focus()}
function addNote(){var t=$("[data-add=note]"),v=t.value;if(!v.trim()){t.setAttribute("aria-invalid","true");t.focus();return}
 var r=textToNote(v.trim()),n={id:nid("n"),on:cur().name,by:"You",at:"Today",b:r.b,li:r.li};
 if(S.target==="both"&&!S.forked)forkVersion();NOTES.push(n);S.composing=false;
 var wasEdit=S.edit;if(wasEdit){record({what:"Added a note",undo:function(){var i=idx(NOTES,n.id);if(i>=0)NOTES.splice(i,1)}})}
 else{HIST.unshift({id:nid("h"),at:"Today",by:"You",v:cur().name,what:"Added a note.",mine:false});toast("Note added.")}
 paint({focus:"[data-act=note]"});var sc=$("#p-notes [data-scroll]");if(sc)sc.scrollTop=sc.scrollHeight}

/* ---------------- clicks ---------------- */
document.addEventListener("click",function(e){
 var t=e.target,sp=$("[data-spop]"),vp=$("[data-vpop]");
 if(sp&&!sp.hidden&&!t.closest("[data-spop]")&&!t.closest("[data-act=svcta]"))spopOpen(false);
 if(vp&&!vp.hidden&&!t.closest("[data-vpop]")&&!t.closest("[data-act=vchip]"))vpopOpen(false);
 if($(".stp.open")&&!t.closest(".stp.open"))collapse();
 var d=t.closest("[data-ed]");if(d){e.preventDefault();openEd(d);return}
 var a=t.closest("[data-act]");if(!a){var tabb=t.closest("[role=tab]");if(tabb)setTab(tabb.dataset.tab);return}
 var act=a.dataset.act,row=a.closest("[data-row]");
 switch(act){
  case "edit":setEdit(!S.edit);break;
  case "edit-sec":if(askNeeded())return;setEdit(true,a.dataset.sec);break;
  case "target":if(a.dataset.v==="own"){toast("This would start its own recipe, linked back to this one. Not drawn here.");break}S.target=a.dataset.v;rt.dataset.gated="";
   var st=$("#estrip");if(st){var tmp=document.createElement("div");tmp.innerHTML=strip();st.replaceWith(tmp.firstChild);updStatus()}
   toast(S.target==="fix"?"Changes go into this version as "+revLabel()+".":"Your first change starts a new version. "+cur().name+" stays as it is.");var tt=$('[data-ed="title"]');if(tt)tt.focus();break;
  case "undolast":undoEntry(lastUndo());break;
  case "hundo":undoEntry(S.stack.filter(function(x){return x.id===a.dataset.id})[0]);var x2=$("[data-act=histclose]");if(x2)x2.focus();break;
  case "rm":if(row)removeRow(row);break;
  case "addgrp":addGroup(a.dataset.list);break;
  case "addph":if(row)addPhoto(row);break;
  case "rmph":if(row)removePhoto(row);break;
  case "grip":break;
  case "svcta":e.stopPropagation();spopOpen($("[data-spop]").hidden);if(!$("[data-spop]").hidden){var inc=$("[data-act=inc]");if(inc)inc.focus()}break;
  case "inc":stepServes(1);break;case "dec":stepServes(-1);break;
  case "vchip":e.stopPropagation();vpopOpen($("[data-vpop]")?$("[data-vpop]").hidden:false);break;
  case "lane":setLane(!S.laneOpen);break;case "laneclose":setLane(false);break;
  case "hist":setHist(!S.histOpen,true);break;case "histclose":setHist(false,true);break;
  case "note":openComposer();break;case "note-cancel":closeComposer();break;case "note-add":addNote();break;
  case "psp":e.stopPropagation();var s=a.closest(".stp"),was=s.classList.contains("open");collapse();if(!was){s.classList.add("open");a.setAttribute("aria-expanded","true");s.scrollIntoView({block:"nearest"});fades()}break;
  case "pmore":openGrid();break;
  case "star":a.setAttribute("aria-pressed",a.getAttribute("aria-pressed")!=="true");break;
  case "plan":toast(D.planned?"On the plan for "+D.planned+". Change it in Plan.":"Day picker opens in the right lane (not drawn here).");break;
  case "more":toast("More menu opens as a sheet (not drawn here).");break;
  case "share":toast("Share panel opens in the right lane (not drawn here).");break;
  case "cart":a.disabled=true;a.classList.add("done");toast("Added to the shopping list.");break;
  case "cartall":$$("[data-act=cart]").forEach(function(b){b.disabled=true;b.classList.add("done")});toast("Added "+DV.missing+" to the shopping list.");break;
  case "hold":$$(".dot").forEach(function(x){x.className="dot held"});a.textContent="Held for "+D.planned;toast("Held for "+D.planned+".");break;
  case "cook":e.preventDefault();break}});
document.addEventListener("click",function(e){if(e.target.closest("a[href='#']"))e.preventDefault()});

/* quick add rows: Enter adds and the field stays for the next one */
document.addEventListener("keydown",function(e){
 var t=e.target;
 if(t.matches&&t.matches("[data-add=ing],[data-add=stp]")){
  if(e.key==="Enter"){e.preventDefault();if(addItem(t.dataset.add,t.value)){}}
  else if(e.key==="Escape"){e.preventDefault();e.stopPropagation();t.value=""}}});

/* ---------------- drag and keyboard reorder ---------------- */
var DRAG=null;
document.addEventListener("dragstart",function(e){var g=e.target.closest&&e.target.closest(".grip");if(!g){return}var row=g.closest("[data-row]");DRAG={id:row.dataset.row,list:row.dataset.list};
 e.dataTransfer.effectAllowed="move";try{e.dataTransfer.setData("text/plain",row.dataset.row);e.dataTransfer.setDragImage(row,16,16)}catch(x){}row.classList.add("dragging")});
document.addEventListener("dragover",function(e){if(!DRAG)return;var row=e.target.closest&&e.target.closest("[data-row][data-list="+DRAG.list+"]");$$(".drop-b,.drop-a").forEach(function(r){r.classList.remove("drop-b","drop-a")});
 if(!row||row.dataset.row===DRAG.id)return;e.preventDefault();var r=row.getBoundingClientRect(),after=e.clientY>r.top+r.height/2;row.classList.add(after?"drop-a":"drop-b")});
document.addEventListener("drop",function(e){if(!DRAG)return;var row=e.target.closest&&e.target.closest("[data-row][data-list="+DRAG.list+"]");if(row&&row.dataset.row!==DRAG.id){e.preventDefault();var r=row.getBoundingClientRect();var d=DRAG;DRAG=null;if(askNeeded()){nudge();return}dropOn(d.list,d.id,row.dataset.row,e.clientY>r.top+r.height/2)}});
document.addEventListener("dragend",function(){DRAG=null;$$(".dragging,.drop-a,.drop-b").forEach(function(r){r.classList.remove("dragging","drop-a","drop-b")})});

/* ---------------- keys ---------------- */
var KEYS={"1":"ing","2":"notes","3":"cooked","4":"pho"};
document.addEventListener("keydown",function(e){
 var t=e.target;
 if((e.ctrlKey||e.metaKey)&&(e.key==="Enter"||e.key==="Escape")){if(S.laneOpen){e.preventDefault();setLane(false)}return}
 if(t&&t.classList&&t.classList.contains("grip")&&(e.key==="ArrowUp"||e.key==="ArrowDown")&&!e.ctrlKey&&!e.metaKey){
  e.preventDefault();var row=t.closest("[data-row]");if(askNeeded()){nudge();return}var list=row.dataset.list,arr=list==="ing"?ING:STP,i=idx(arr,row.dataset.row),to=i+(e.key==="ArrowUp"?-1:1);
  if(moveRow(arr,row.dataset.row,to,rowLabel(list,row.dataset.row)+(to<i?" up":" down")))paint({focus:'[data-row="'+row.dataset.row+'"] .grip'});return}
 if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="z"&&!e.shiftKey&&!(t&&/INPUT|TEXTAREA|SELECT/.test(t.tagName))){var u=lastUndo();if(u){e.preventDefault();undoEntry(u)}return}
 if(e.ctrlKey||e.metaKey||e.altKey)return;if(t&&/INPUT|TEXTAREA|SELECT/.test(t.tagName))return;
 var k=e.key.toLowerCase();
 if(e.key==="Escape"){var sp0=$("[data-spop]");if(sp0&&!sp0.hidden){spopOpen(false);$("[data-act=svcta]").focus();return}if(S.histOpen){setHist(false,true);return}if($(".stp.open")){collapse(true);return}var vp=$("[data-vpop]");if(vp&&!vp.hidden){vpopOpen(false);$("[data-act=vchip]").focus();return}return}
 if(KEYS[k]){e.preventDefault();setTab(KEYS[k])}
 else if(k==="n"){e.preventDefault();setLane(!S.laneOpen)}
 else if(k==="s"&&$("[data-act=share]")){e.preventDefault();toast("Share panel opens in the right lane (not drawn here).")}
 else if(k===","){e.preventDefault();setHist(!S.histOpen,true)}
 else if(k==="e"){e.preventDefault();setEdit(!S.edit)}
});

/* ---------------- Photos grid and lightbox (as ../recommended/) ---------------- */
var LB=(function(){
 var el=document.createElement("div");el.className="lbx";el.hidden=true;el.setAttribute("role","dialog");el.setAttribute("aria-modal","true");el.setAttribute("aria-label","Photo viewer");
 el.innerHTML='<button type="button" class="lbx-x" aria-label="Close (Esc)">'+ic("x")+'</button><button type="button" class="lbx-n prev" aria-label="Previous photo (Left arrow)">'+ic("left")+'</button><figure class="lbx-f"><img alt=""><figcaption></figcaption></figure><button type="button" class="lbx-n next" aria-label="Next photo (Right arrow)">'+ic("right")+'</button>';
 document.body.appendChild(el);
 var img=$("img",el),cap=$("figcaption",el),bx=$(".lbx-x",el),pv=$(".prev",el),nx=$(".next",el),L={items:[],i:0,isOpen:false};
 function show(i){var n=L.items.length;L.i=(i+n)%n;var it=L.items[L.i];img.alt=it.alt||"";img.src=it.src;cap.textContent=n>1?(L.i+1)+" of "+n:""}
 function toggleBg(on){[$(".app"),$("#toast")].forEach(function(x){if(x){if(on)x.setAttribute("inert","");else x.removeAttribute("inert")}});document.documentElement.classList.toggle("lbx-on",on)}
 L.open=function(items,i){L.items=items;L.isOpen=true;el.hidden=false;toggleBg(true);pv.hidden=nx.hidden=items.length<2;show(i);bx.focus()};
 L.close=function(){if(!L.isOpen)return;L.isOpen=false;el.hidden=true;toggleBg(false);img.removeAttribute("src");var o=L.items[L.i].el;if(o&&o.focus){o.focus();if(o.scrollIntoView)o.scrollIntoView({block:"nearest"})}};
 L.step=function(d){if(L.items.length>1)show(L.i+d)};
 pv.onclick=function(){L.step(-1)};nx.onclick=function(){L.step(1)};bx.onclick=L.close;
 el.addEventListener("click",function(e){if(e.target===el||e.target.classList.contains("lbx-f"))L.close()});
 document.addEventListener("keydown",function(e){
  if(!L.isOpen)return;var k=e.key;
  if(k==="Escape")L.close();else if(k==="ArrowLeft")L.step(-1);else if(k==="ArrowRight")L.step(1);
  else if(k==="Home"){show(0)}else if(k==="End"){show(L.items.length-1)}
  else if(k==="Tab"){var f=[bx,pv,nx].filter(function(b){return !b.hidden}),a=document.activeElement,ix=f.indexOf(a);e.preventDefault();f[(ix+(e.shiftKey?f.length-1:1))%f.length].focus();return}
  else if(k!=="Shift"&&k!=="Control"&&k!=="Alt"&&k!=="Meta"&&k!=="Enter"&&k!==" ")e.stopImmediatePropagation();
  if(k==="Escape"||k==="ArrowLeft"||k==="ArrowRight"||k==="Home"||k==="End"){e.preventDefault();e.stopImmediatePropagation()}
 },true);
 return L})();
function openGrid(){
 var PH=(D.banner?[{src:D.banner,thumb:D.banner,alt:META.name+", banner image",tag:"Banner"}]:[]).concat(D.photos.map(function(n,j){return {src:IMG+n+"-l.webp",thumb:IMG+n+"-t.webp",alt:META.name+", uploaded photo "+(j+1)}}));
 var g=$("#pgrid"),h="";PH.forEach(function(p,i){h+='<button type="button" class="pfr" data-ph="'+i+'" style="background-image:url('+p.thumb+')" aria-label="Open photo '+(i+1)+' of '+DV.photosN+(p.tag?' ('+p.tag.toLowerCase()+')':'')+'">'+(p.tag?'<span class="ptag">'+p.tag+'</span>':'')+'</button>'});g.innerHTML=h;fades();
 var th=$$("[data-ph]",g);th.forEach(function(b,i){b.onclick=function(){LB.open(th.map(function(x,j){return {src:PH[j].src,alt:PH[j].alt,el:x}}),i)}})}

/* ---------------- demo switcher (mockup only) ---------------- */
var P=$("#demoP"),B=$("#demoB");
function link(ch){var u=new URL(location.href);Object.keys(ch).forEach(function(k){if(ch[k]===null)u.searchParams.delete(k);else u.searchParams.set(k,ch[k])});return u.pathname+u.search}
function setTheme(v){try{localStorage.setItem("theme",v==="light"?"kitchie-day":"kitchie")}catch(e){}document.documentElement.setAttribute("data-theme",v==="light"?"kitchie-day":"kitchie");var u=new URL(location.href);u.searchParams.set("theme",v);history.replaceState(null,"",u)}
var qt=Q.get("theme");if(qt==="light"||qt==="dark")setTheme(qt);
var rs=[["typical","Typical"],["short","Short"],["long","Long, groups"],["empty","Empty"],["notes","Notes"],["nocooked","Not cooked"]];
P.innerHTML='<h3>State</h3><div class="dc">'+rs.map(function(r){return '<a href="'+link({r:r[0],tab:null,ver:null})+'"'+(R===r[0]&&Q.get("ver")!=="trying"?' aria-current="true"':'')+'>'+r[1]+'</a>'}).join("")+'</div>'
 +'<h3>Version being edited</h3><div class="dc"><a href="'+link({r:"typical",ver:null})+'"'+(D.ver==="p"?' aria-current="true"':'')+'>With peas (a keeper)</a><a href="'+link({r:"typical",ver:"trying"})+'"'+(Q.get("ver")==="trying"?' aria-current="true"':'')+'>Less soy (a try)</a></div>'
 +'<h3>Open in</h3><div class="dc"><a href="'+link({edit:null})+'"'+(Q.get("edit")!=="1"?' aria-current="true"':'')+'>Read mode</a><a href="'+link({edit:"1"})+'"'+(Q.get("edit")==="1"?' aria-current="true"':'')+'>Edit mode</a></div>'
 +'<h3>Banner</h3><div class="dc"><a href="'+link({banner:null})+'"'+(Q.get("banner")!=="none"?' aria-current="true"':'')+'>Has banner</a><a href="'+link({banner:"none"})+'"'+(Q.get("banner")==="none"?' aria-current="true"':'')+'>No banner</a></div><h3>Theme</h3><div class="dc"><button type="button" data-th="dark">Dark</button><button type="button" data-th="light">Light</button></div>'
 +'<p class="dn">Nothing is saved: a reload starts again. Keys: E edit on or off, Enter saves a field, Esc cancels it, Tab saves and moves on, Ctrl+Z undoes the last change, 1 to 4 rail tabs, N Notes and reactions, comma History. The wide layout needs 1280 x 700 or more.</p>';
$$("[data-th]",P).forEach(function(b){b.onclick=function(){setTheme(b.dataset.th)}});
B.onclick=function(){var o=P.hidden;P.hidden=!o;B.setAttribute("aria-expanded",o)};
document.addEventListener("keydown",function(e){if(e.key==="`"&&!(e.target&&/INPUT|TEXTAREA/.test(e.target.tagName)))B.click()});

/* ---------------- start ---------------- */
paint();
if(Q.get("lane")==="1")setLane(true);if(Q.get("lane")==="h")setHist(true);
if(Q.get("edit")==="1"){setEdit(true);if(Q.get("choose")){var tg=$('[data-act=target][data-v="'+Q.get("choose")+'"]');if(tg)tg.click()}}
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(fades);
window.__ie={S:S,ING:ING,STP:STP,NOTES:NOTES,HIST:HIST,META:META,VERS:VERS};
})();
