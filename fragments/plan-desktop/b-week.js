/* Option B, week-level tools (realigned with the phone Plan, 14 Oct 2026; decisions 259 to 275 in docs/knowledge/jobs-to-be-done/plan-desktop.md).
   Loaded before b.js. Holds the line icons B shares, the in-place Undo chip (phone 194, 214), Copy last week, Clear week by scope (203, 195, 211),
   the week indicators (169 to 171, 181, 191, 215d) and the week-level bulk actions in the summary (159 to 177, 180): Add to the shopping list, Reserve, Release.
   Shared rules: only the meals the person can act on are touched (206), never a past night (162, 190), nothing is drawn for another person's plan.
   Tokens only; no size rules (the header wraps by itself); no files fetched. */
(function(){var P=PLAN,u=P.u,DN=u.DN,ME=u.ME,esc=u.esc;
function svg(p){return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+p+'</svg>'}
function sm(i,w){return i.replace("<svg","<svg width=\""+w+"\" height=\""+w+"\"")}
var BI=P.bi={svg:svg,sm:sm,
 MOON:svg('<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>'),
 REPEAT:svg('<path d="M17 2l3 3-3 3M3 11V9a4 4 0 0 1 4-4h13M7 22l-3-3 3-3M21 13v2a4 4 0 0 1-4 4H4"/>'),
 CALW:svg('<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4M8 15h3M13 15h3"/>'),
 SURP:svg('<path d="M12 3l1.9 5.6L19.5 10l-5.6 1.9L12 17.5l-1.9-5.6L4.5 10l5.6-1.4z"/><path d="M18.5 16l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z"/>'),
 TICK:svg('<path d="M5 12.5l4.5 4.5L19 7.5"/>'),
 OPEN:svg('<path d="M9 6l6 6-6 6"/>'),
 BACK:svg('<path d="M15 6l-6 6 6 6"/>'),
 /* the phone's glyphs, same recipe (24 grid, 2 px stroke, round caps): the open padlock is an open night (215), the eye is view only (190), the eraser is Clear week (109) */
 UNLOCK:svg('<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 7.6-1.7"/><path d="M12 15.5v1.5"/>'),
 EYE:svg('<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/>'),
 ERASE:svg('<path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21"/><path d="M22 21H7"/><path d="m5 11 9 9"/>'),
 UNDO:svg('<path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/>'),
 SPARK:svg('<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z"/>'),
 CLOCK:svg('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>')};
function S(){return P.S()}
function person(){return u.person()}
function today(i){return u.dt(S().wk,i)>=u.TODAYD}
function plural(n,w){return n+" "+w+(n===1?"":"s")}

/* ---------- the in-place Undo chip (phone 194, 214): the button that did the work flips to Undo for 14 s, then the icon (or the next state) returns ---------- */
var FLIP=14000,FT=null;
function setFlip(k){var s=S();s.flip={k:k,depth:s.undo.length,until:Date.now()+FLIP};clearTimeout(FT);FT=setTimeout(function(){P.render()},FLIP+60)}
function flipOn(k){var s=S(),f=s.flip;return !!(f&&f.k===k&&f.depth===s.undo.length&&Date.now()<f.until)}
function chip(k,fk,word,sub){return '<button class="flipundo" data-act="flipundo" data-fk="'+fk+'" aria-label="Undo '+word+'" data-tip="Undo '+word+' (Z)">'+sm(BI.UNDO,14)+'<span><b>Undo</b><small>'+sub+'</small></span></button>'}
P.bFlipOn=flipOn;P.bChip=chip;

/* ---------- Copy last week (phone 99, 194): fills only empty nights, never overwrites, skips Not cooking and past nights ---------- */
function copyWeek(){var s=S();if(u.guard()||person())return;
 var LAST=[["Mon","shak","all",2],["Tue","rice","all",2],["Wed","pasta","Sam",1],["Thu","fritt","all",2],["Fri","soup","all",2]],add=[],skip=[];
 LAST.forEach(function(l){var i=DN.indexOf(l[0]);if(!today(i)||u.isBlocked(l[0],ME)){skip.push(l[0]);return}
  if(s.cards.some(function(c){return c.wk===s.wk&&c.day===l[0]&&u.me(c)})){skip.push(l[0]);return}add.push(l)});
 if(!add.length){u.toast("Nothing to fill: every night this week from today on already has a meal, is Not cooking or has passed.",false);P.render();return}
 u.pushUndo();add.forEach(function(l){var n=u.mkCard(s.wk,l[0],l[1],ME,l[2]==="all"?"all":ME,l[3],{fromCopy:true});s.cards.push(n);u.lf(n)});
 s.copied[s.wk]=true;setFlip("copy");u.toast("Copied last week into "+plural(add.length,"empty night")+" ("+add.map(function(l){return l[0]}).join(", ")+"). Nothing was overwritten.",false);u.pulseSync();P.render();u.say("Copied last week, "+plural(add.length,"night"))}

/* ---------- Clear week by scope (phone 195, 203, 211) ----------
   Mine clears my own individual meals and this week's changes to my routine; Household clears the household's meals (everyone, or a named few). Never a past night, never another person's meal, never the routine itself. */
function planClear(apply){var s=S(),hh=s.view==="all",o={meals:0,marks:0,usual:0,stay:0,firstI:7},gone=[];
 DN.forEach(function(d,i){if(today(i)&&i<o.firstI)o.firstI=i});
 if(o.firstI===7)return o;
 s.cards.forEach(function(c){var i=DN.indexOf(c.day);if(c.wk!==s.wk||!today(i)||!u.me(c))return;var hhm=c.forw==="all";if(hh?hhm:!hhm){o.meals++;gone.push(c)}});
 u.scopeCards().forEach(function(c){if(today(DN.indexOf(c.day))&&gone.indexOf(c)<0)o.stay++});
 var keys=[];
 if(!hh)DN.forEach(function(d,i){if(!today(i))return;var k=u.okey(d,ME),usual=s.stencil.Sam.indexOf(d)>-1;if(k in s.ov){if(!usual&&s.ov[k]===true){o.marks++;keys.push(k)}else if(usual&&s.ov[k]===false){o.usual++;keys.push(k)}}});
 o.gone=gone;if(apply){s.cards=s.cards.filter(function(c){return gone.indexOf(c)<0});keys.forEach(function(k){delete s.ov[k]});if(s.sel&&!u.cardById(s.sel))s.sel=null}
 return o}
function clearWeek(){var s=S();if(u.guard()||person()||u.weekRo())return;
 var o=planClear(false);if(!o.meals&&!o.marks&&!o.usual){u.toast("Nothing to clear from today on.",false);P.render();return}
 var cb=u.cartLines();u.pushUndo();planClear(true);s.just=null;s.prop=null;setFlip("clear");
 var ch=o.marks+o.usual,hh=s.view==="all";
 u.toast("Cleared "+plural(o.meals,"meal")+(ch?" and "+plural(ch,"Not cooking change"):"")+", "+u.dstr(s.wk,o.firstI)+" to "+u.dstr(s.wk,6)+(hh?" (household)":" (my plan)")+". "
  +(o.stay?plural(o.stay,hh?"personal meal":"household meal")+" stay"+(o.stay===1?"s":"")+". ":"")+(hh?"":"Usual days off stay.")+u.cartDiff(cb,o.gone),false);
 u.pulseSync();P.render();u.say("Cleared the week from today on")}
function headTools(){var s=S(),off=u.offline(),ro=u.weekRo()||off;
 if(person())return "";
 var cp=flipOn("copy")?chip("copy","hdr:copy","copy last week","copy")
  :'<button class="ib" data-act="copy" aria-label="Copy last week" data-tip="Copy last week (C)" data-fk="hdr:copy"'+(ro?" disabled":"")+'>'+u.I.copy+'</button>';
 var o=planClear(false),none=!o.meals&&!o.marks&&!o.usual,
 cl=flipOn("clear")?chip("clear","hdr:clear","clear week","clear")
  :'<button class="ib" data-act="clearwk" aria-label="Clear week: remove this week\'s planned meals from today on" data-tip="Clear week from today on (Shift C)" data-fk="hdr:clear"'+((ro||none)?" disabled":"")+'>'+BI.ERASE+'</button>';
 return cp+cl}

/* ---------- week indicators (phone 165, 169 to 171, 181, 191, 192, 215d): "5 of 7 nights", the moon count, the open-padlock count; the two counts jump ---------- */
function counts(){var s=S(),v=s.view,pv=person(),who=pv?v:ME,n=0,nc=[],op=[];
 DN.forEach(function(d,i){var has=u.dayCards(d).length>0;if(has)n++;if(!today(i))return;var b=u.isBlocked(d,who);if(b)nc.push(d);else if(!has)op.push(d)});
 return{n:n,nc:nc,op:op}}
function chips(){var c=counts(),h='<div class="wki" role="group" aria-label="This week">';
 h+='<span class="wkn" title="Nights with a meal this week">'+c.n+' of 7 nights</span>';
 if(c.nc.length)h+='<button class="wkc" data-jump="nc" aria-label="'+plural(c.nc.length,"night")+" not cooking. Go to the first one: "+c.nc[0]+'" data-tip="'+plural(c.nc.length,"night")+' not cooking. Go to the first" data-fk="hdr:nc"><b>'+c.nc.length+'</b>'+sm(BI.MOON,14)+'</button>';
 if(c.op.length)h+='<button class="wkc" data-jump="open" aria-label="'+plural(c.op.length,"night")+" open. Go to the first one: "+c.op[0]+'" data-tip="'+plural(c.op.length,"night")+' open. Go to the first" data-fk="hdr:open"><b>'+c.op.length+'</b>'+sm(BI.UNLOCK,14)+'</button>';
 return h+fillBar()+'</div>'}
document.addEventListener("click",function(e){var j=e.target.closest&&e.target.closest("[data-jump]");if(!j)return;var c=counts(),d=(j.dataset.jump==="nc"?c.nc:c.op)[0];if(!d)return;
 var el=u.q('.arow[data-day="'+d+'"]');if(!el)return;var red=window.matchMedia("(prefers-reduced-motion:reduce)").matches;
 el.scrollIntoView({block:"center",behavior:red?"auto":"smooth"});el.classList.remove("pulse");void el.offsetWidth;el.classList.add("pulse");setTimeout(function(){el.classList.remove("pulse")},2600);
 var f=u.q('[data-fk="slot:'+d+'"]',el);if(f)f.focus({preventScroll:true});u.say("Went to "+u.DF[DN.indexOf(d)])});

/* ---------- an empty week (decisions 282 to 284): ONE whole-week Surprise me and Ask AI instead of the pair on every night ----------
   Empty = no meal at all in the week as the person filter shows it (a week with only Not cooking nights is empty too, as in 96). The moment even one night has a meal,
   by any route, the per-night Surprise me and Ask AI come back for the nights still open. The whole-week fill plans only nights from today on that are not Not cooking
   (a one-off mark or a usual day off from Settings): those are never included. Placement is switchable: ?wkfill=card (default) | header | gutter. */
function fillMode(){var m=new URLSearchParams(location.search).get("wkfill");return m==="header"||m==="gutter"?m:"card"}
function emptyWeek(){var s=S(),o={on:false,days:[],nc:[],past:0};
 if(person()||u.weekRo()||s.loading)return o;
 if(DN.some(function(d){return u.dayCards(d).length}))return o;
 DN.forEach(function(d,i){if(!today(i)){o.past++;return}if(u.isBlocked(d,ME))o.nc.push(d);else o.days.push(d)});
 o.on=o.days.length>0;return o}
function skipText(e){if(!e.nc.length)return "";var s=S();
 return e.nc.map(function(d){return d+(s.stencil.Sam.indexOf(d)>-1&&s.ov[u.okey(d,ME)]!==false?" (usual day off)":"")}).join(", ")+(e.nc.length===1?" is":" are")+" Not cooking, so left out."}
function fillWeek(){var s=S();if(u.guard()||person())return;var e=emptyWeek();if(!e.on)return;
 u.pushUndo();s.just=null;s.prop=null;
 e.days.forEach(function(d){var p=u.pickSurprise(d),n=u.mkCard(s.wk,d,p.r,ME,"all",2,{surp:true});s.cards.push(n);u.lf(n)});
 setFlip("fill");
 u.toast("Surprise me planned "+plural(e.days.length,"night")+" ("+e.days.join(", ")+"). "+skipText(e),true);
 u.pulseSync();P.render();u.say("Planned "+plural(e.days.length,"night"))}
function fillBtns(e,cls){var n=e.days.length;
 return '<button class="mini cta" data-act="weekfill" data-fk="wk:sp" data-tip="Surprise me: the app proposes a meal for each open night" aria-label="Surprise me: plan the '+plural(n,"open night")+' of this week">'+sm(BI.SURP,15)+'Surprise me</button>'
 +'<button class="mini cta" data-act="assistant" data-week="1" data-fk="wk:ai" aria-pressed="'+!!(S().aiNote&&!S().aiNote.day&&S().aiNote.wk===S().wk)+'" data-tip="Ask AI: hands off to your default AI app, for the whole week" aria-label="Ask AI: plan the '+plural(n,"open night")+' of this week">'+sm(BI.SPARK,14)+'Ask AI</button>'}
function fillCard(){var e=emptyWeek();if(!e.on||fillMode()!=="card")return "";var ro=u.offline();
 return '<section class="wkfill" aria-label="Plan the whole week">'+sm(BI.CALW,22)
  +'<div class="wf"><b>Nothing planned this week</b><small>'+plural(e.days.length,"open night")+": "+e.days.join(", ")+". "+skipText(e)+'</small></div>'
  +'<span class="ctas">'+fillBtns(e)+(ro?"":'<button class="mini quiet" data-act="copy" data-fk="wk:copy" data-tip="Copy last week (C): fills open nights only, never overwrites">'+sm(u.I.copy,15)+'Copy last week</button>')+'</span></section>'}
function fillBar(){var e=emptyWeek();if(!e.on||fillMode()!=="header")return "";return '<span class="wkfillbar" role="group" aria-label="Plan the whole week">'+fillBtns(e)+'</span>'}
function fillGutter(){var e=emptyWeek();if(!e.on||fillMode()!=="gutter")return "";
 return '<section class="sumsec wkfill gut" aria-label="Plan the whole week"><div class="wf"><b>Plan the whole week</b><small>'+plural(e.days.length,"open night")+". "+skipText(e)+'</small></div><span class="ctas">'+fillBtns(e)+'</span></section>'}
document.addEventListener("click",function(e){var a=e.target.closest&&e.target.closest("[data-act=weekfill]");if(a)fillWeek()});

/* ---------- week tools in the summary (phone 99, 109, 194, 195, 203, 211, 214; decision 285): Copy last week and Clear week, labelled, with the scope in words, flipping in place to the same Undo chip ---------- */
function weekToolsHtml(){var s=S();if(person()||u.weekRo())return "";var off=u.offline(),hh=s.view==="all",o=planClear(false),none=!o.meals&&!o.marks&&!o.usual,wide=function(h){return h.replace('class="flipundo"','class="flipundo wide"')},h="";
 h+=flipOn("copy")?wide(chip("copy","sum:copy","copy last week","copy")):'<button class="btn" data-act="copy" data-fk="sum:copy" data-tip="Copy last week (C): fills open nights only, never overwrites"'+(off?" disabled":"")+' aria-label="Copy last week: fill the open nights of this week from today on, nothing is overwritten">'+sm(u.I.copy,17)+'<span class="bl"><b>Copy last week</b><small>open nights only</small></span></button>';
 if(flipOn("clear"))h+=wide(chip("clear","sum:clear","clear week","clear"));
 else if(!none)h+='<button class="btn" data-act="clearwk" data-fk="sum:clear" data-tip="Clear week from today on (Shift C)"'+(off?" disabled":"")+' aria-label="Clear week, '+(hh?"household":"my plan")+': remove this week\'s planned meals from today on">'+sm(BI.ERASE,17)+'<span class="bl"><b>Clear week</b><small>'+(hh?"household":"my plan")+', from today</small></span></button>';
 if(flipOn("fill"))h+=wide(chip("fill","sum:fill","the whole-week Surprise me","whole week"));
 return '<section class="sumsec" aria-label="Week actions"><h3>Week actions</h3><div class="wkacts">'+h+'</div></section>'}

/* ---------- bulk actions in the summary (phone 159 to 177, 180) ---------- */
function mineCards(){return u.scopeCards().filter(function(c){return u.me(c)&&!u.roCard(c)})}
function holdable(){return mineCards().filter(function(c){return u.srcOf(c)!=="left"&&u.onhand(c).length})}
function bulk(){var sh=u.shopping(),add=sh.filter(function(x){return !x.list}),h=holdable(),nh=h.filter(function(c){return !c.res}),
 items=function(l){return l.reduce(function(a,c){return a+u.onhand(c).length},0)};
 return{add:add,addN:add.length,res:nh.length?"reserve":h.length?"release":"",resN:nh.length?items(nh):items(h.filter(function(c){return c.res})),nh:nh,held:h.filter(function(c){return c.res})}}
function bulkHtml(){var s=S();if(person()||u.weekRo())return "";var b=bulk(),h="";
 if(flipOn("add"))h+=chip("add","sum:add","add to the shopping list","add to list").replace('class="flipundo"','class="flipundo wide"');
 else if(b.addN)h+='<button class="btn pri" data-act="bulkadd" data-fk="addall" aria-label="Add to the shopping list: the '+plural(b.addN,"missing item")+' for this week">'+sm(u.I.cart,18)+'Add '+b.addN+' to the shopping list</button>';
 if(flipOn("reserve"))h+=chip("reserve","sum:res","reserve","reserve").replace('class="flipundo"','class="flipundo wide"');
 else if(flipOn("release"))h+=chip("release","sum:res","release","release").replace('class="flipundo"','class="flipundo wide"');
 else if(b.res==="reserve")h+='<button class="btn" data-act="reserve" data-fk="sum:res" data-tip="Hold everything on hand this week (same as the phone\'s Reserve)" aria-label="Reserve, hold everything: hold the '+plural(b.resN,"on-hand item")+' for this week">'+sm(u.I.held,17)+'Reserve '+b.resN+'</button>';
 else if(b.res==="release")h+='<button class="btn held" data-act="release" data-fk="sum:res" aria-label="Release: let go of the '+plural(b.resN,"held on-hand item")+' for this week">'+sm(u.I.held,17)+'Release '+b.resN+'</button>';
 return h?'<div class="bulk" role="group" aria-label="Bulk actions for this week">'+h+'</div>':""}
function bulkAdd(){var s=S();if(u.guard()||person())return;var b=bulk();if(!b.addN)return;u.pushUndo();var cards={};b.add.forEach(function(x){u.listAdd(x.name,x.cards.map(u.cardById));x.cards.forEach(function(id){cards[id]=1})});
 setFlip("add");u.toast("Added "+plural(b.addN,"item")+" for this week to the shopping list, across "+plural(Object.keys(cards).length,"meal")+".",false);u.pulseSync();P.render()}
function reserve(){var s=S();if(u.guard()||person())return;var b=bulk();if(b.res!=="reserve")return;u.pushUndo();b.nh.forEach(function(c){c.res=true});
 setFlip("reserve");u.toast("Reserved "+plural(b.resN,"on-hand item")+" across "+plural(b.nh.length,"meal")+" for this week.",false);u.pulseSync();P.render()}
function release(){var s=S();if(u.guard()||person())return;var b=bulk();if(b.res!=="release")return;u.pushUndo();b.held.forEach(function(c){c.res=false});
 setFlip("release");u.toast("Released "+plural(b.resN,"held item")+" across "+plural(b.held.length,"meal")+".",false);u.pulseSync();P.render()}
document.addEventListener("click",function(e){var a=e.target.closest&&e.target.closest("[data-act]");if(!a)return;var k=a.dataset.act;
 if(k==="clearwk")clearWeek();else if(k==="bulkadd")bulkAdd();else if(k==="reserve")reserve();else if(k==="release")release();else if(k==="flipundo"){u.undo();S().flip=null;P.render()}});

P.bWeek={empty:emptyWeek,fillCard:fillCard,fillBar:fillBar,fillGutter:fillGutter,fillMode:fillMode,skipText:skipText,tools:weekToolsHtml,headTools:headTools,chips:chips,bulkHtml:bulkHtml,bulk:bulk,copy:copyWeek,clearWeek:clearWeek,counts:counts};
})();
