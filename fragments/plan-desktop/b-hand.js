/* Option B, the tile in hand and the hand-offs (realigned with the phone Plan, 14 Oct 2026; decisions 259 to 275).
   The tear (phone 118, 158: every lift-and-drag, top and bottom edges only, never a side): a torn top edge when the tile is pulled down, a torn bottom edge when pulled up; the place it left has the matching edge.
   Copy forward (phone 100 to 102, 190a): a past tile offers one thing, a copy on a coming day; on a wide screen the date picker is a menu of the coming two weeks (Translate: no bottom sheet).
   Ask AI (owner, 12 to 13 Oct: "does nothing when clicked"): the click now says, in place, that it hands off to the default AI app; nothing happens inside Kitchie (decision 42, 45).
   Today (phone 193, 202: a long hold on the week label goes to today): on a pointer it is the T key and "This week" in the week picker; today's row scrolls into view and pulses once. */
(function(){var P=PLAN,u=P.u,BI=P.bi,DN=u.DN,DF=u.DF,esc=u.esc,sm=BI.sm;
var RED=window.matchMedia("(prefers-reduced-motion:reduce)").matches;
/* ---------- the tear ---------- */
var TD=[2.5,5.5,2,7,4,6.5,1.5,5,7,3,5.5,2,4,7,3.5,5.5,1.5,6.5,4,7,3,5],POLY={};
function pts(edge,n){var a=[],i,t,v;for(i=0;i<n;i++){t=(i/(n-1)*100).toFixed(1)+"%";v="calc(var(--tz,1)*"+TD[(edge==="top"?i:i*3+1)%TD.length].toFixed(1)+"px)";a.push(edge==="top"?t+" "+v:t+" calc(100% - "+v+")")}return a}
function poly(edge){return POLY[edge]||(POLY[edge]="polygon("+pts(edge,24).concat(edge==="top"?["100% 100%","0 100%"]:["100% 0","0 0"]).join(",")+")")}
var EDGE={top:"bottom",bottom:"top"};
function dragMove(e,g){var S=P.S(),d=S.drag;if(!d||!g||d.ox==null)return;var dx=e.clientX-d.ox,dy=e.clientY-d.oy,dist=Math.hypot(dx,dy),edge=d.edge||"top";
 if(Math.abs(dy)>10)edge=dy>=0?"top":"bottom";   /* only the top and bottom edges tear; a sideways move keeps the edge it had (158) */
 d.edge=edge;var tz=RED?1:Math.min(1,dist/36),m=g.querySelector(".mc");if(m){m.style.setProperty("--tz",tz.toFixed(2));m.style.setProperty("--tpl",poly(edge));m.classList.add("torn")}
 u.qa('[data-cw="'+d.id+'"] .mc').forEach(function(o){o.style.setProperty("--tz",tz.toFixed(2));o.style.setProperty("--tpl",poly(EDGE[edge]));o.classList.add("torn")})}
/* ---------- copy forward ---------- */
function cfMenu(m){var c=u.cardById(m.id);if(!c)return "";var h='<div class="cm" role="menu" id="cm" style="left:'+(m.x||0)+'px;top:'+(m.y||0)+'px"><div class="cmh">Copy '+esc(u.lbl(c))+' forward to</div>',last=-1;
 for(var k=0;k<14;k++){var d=new Date(2026,9,10+k),days=Math.round((d-new Date(2026,9,5))/864e5),wk=Math.floor(days/7),i=(d.getDay()+6)%7,dn=DN[i];
  if(k>0&&wk!==last)h+='<hr>';last=wk;
  h+='<button role="menuitem" data-mi="cf|'+wk+"|"+dn+'" data-fk="mi:cf'+k+'">'+(k===0?"Today, ":"")+DF[i]+" "+u.dstr(wk,i)+(wk===1?'<span class="kbd keep">next week</span>':wk===0?"":'<span class="kbd keep">in '+wk+" weeks</span>")+'</button>'}
 return h+'</div>'}
function cfAct(m,a){var p=a.split("|"),S=P.S();if(p[0]!=="cf")return;var wk=+p[1],day=p[2],c=u.cardById(m.id);if(!c||u.guard())return;
 u.pushUndo();var n=JSON.parse(JSON.stringify(c));n.id=c.id+"-cf"+(Date.now()%100000);n.wk=wk;n.day=day;n.res=false;n.fromCopy=true;S.cards.push(n);u.lf(n);
 var T=P.bDrop;if(T){T.t[n.id]=Date.now();T.n=[u.lbl(c)+" on "+day]}
 S.wk=Math.max(u.WMIN(),Math.min(u.WMAX(),wk));S.sel=n.id;S.cur={day:day};S.day=day;S.just=null;S.prop=null;
 u.toast("Copied "+esc(u.lbl(c))+" forward to "+DF[DN.indexOf(day)]+" "+u.dstr(wk,DN.indexOf(day))+". The original stays. ",true);u.pulseSync();P.render();u.say("Copied forward to "+DF[DN.indexOf(day)])}
document.addEventListener("click",function(e){var b=e.target.closest&&e.target.closest("[data-act=cfwd]");if(!b)return;e.stopPropagation();var S=P.S(),r=b.getBoundingClientRect();S.menu=S.menu&&S.menu.id===b.dataset.id&&S.menu.kind==="cf"?null:{kind:"cf",id:b.dataset.id,x:r.left-200,y:r.bottom+4,focus:true};P.render()},true);
/* ---------- Ask AI ---------- */
var AT=null;
function skipNote(){var W=P.bWeek,e=W&&W.empty();return e&&e.on?" Open nights only."+(e.nc.length?" "+W.skipText(e):""):""}
function askNote(d){var S=P.S();S.aiNote={wk:S.wk,day:d||null,t:Date.now()};S.aiSay=d?"Ask AI opens your default AI app for "+DF[DN.indexOf(d)]+". Nothing happens inside Kitchie.":"Ask AI opens your default AI app with the week of "+u.dstr(S.wk,0)+". Nothing happens inside Kitchie.";
 clearTimeout(AT);AT=setTimeout(function(){S.aiNote=null;P.render()},9000)}
function noteHtml(d){var S=P.S(),n=S.aiNote;if(!n||n.wk!==S.wk||n.day!==(d||null))return "";
 return '<div class="ainote" role="status">'+sm(BI.SPARK,16)+'<span>'+(d?'<b>Ask AI</b> opens your default AI app, for '+DF[DN.indexOf(d)]+'.':'<b>Ask AI</b> opens your default AI app with the week of '+u.dstr(S.wk,0)+'.')+' Nothing happens inside Kitchie.'+(d?"":skipNote())+'</span></div>'}
function weekNote(){var h=noteHtml(null);return h?'<div class="cslot">'+h+'</div>':""}
/* ---------- today ---------- */
function onToday(){var S=P.S();if(S.wk!==u.CURWK)return;var el=u.q(".arow.is-today");if(!el)return;
 el.scrollIntoView({block:"center",behavior:RED?"auto":"smooth"});el.classList.remove("pulse");void el.offsetWidth;el.classList.add("pulse");setTimeout(function(){el.classList.remove("pulse")},2600);u.say("Today, "+DF[DN.indexOf("Sat")])}
P.bHand={dragMove:dragMove,cfMenu:cfMenu,cfAct:cfAct,askNote:askNote,noteHtml:noteHtml,weekNote:weekNote,onToday:onToday};
})();
