/* Option B (refined 12 Oct 2026, decisions 110 to 120 and 156; realigned with the phone Plan 14 Oct 2026, decisions 259 to 275: docs/knowledge/jobs-to-be-done/plan-desktop.md).
   Agenda (main swim lane, one row per day) + meal detail + "This week at a glance". Three columns from 1440 (b-three-1440.js), two below: the summary then tucks behind the meal detail.
   Files, in load order: b-week.js (icons, Undo chip, Copy, Clear week, week indicators, bulk actions), b-detail.js (the meal detail), b-hand.js (tear, Copy forward, Ask AI note, today), then this one: the tile, the day states, the summary, the columns.
   Sample data and sample-only logic stay in init() here; shared behaviour is in plan.js (hooks: layout.card, lanes, peek, glance, who, vis, headTools, chips, askNote and so on). */
(function(){var P=PLAN,u=P.u,BI=P.bi,DN=u.DN,DF=u.DF,I=u.I,esc=u.esc,R=u.R,ME=u.ME,W=u.W,sm=BI.sm,MOON=BI.MOON,REPEAT=BI.REPEAT,CALW=BI.CALW,SURP=BI.SURP,TICK=BI.TICK,OPEN=BI.OPEN,BACK=BI.BACK,EYE=BI.EYE,UNLOCK=BI.UNLOCK,H=P.bHand,WK=P.bWeek;
function names(l){return l.length>2?l.slice(0,2).join(", ")+" +"+(l.length-2):l.join(", ")}
function pill(cls,ic,txt){return '<span class="tg '+cls+'">'+ic+'<span>'+esc(txt)+'</span></span>'}
function btn(act,id,ic,label,tip,fk,o){o=o||{};return '<button class="rb" data-act="'+act+'" data-id="'+id+'"'+(o.pressed!==undefined?' aria-pressed="'+o.pressed+'"':'')+(o.dis?' disabled':'')+' aria-label="'+esc(label)+'" data-tip="'+esc(tip)+'" data-fk="'+fk+':'+id+'">'+ic+'</button>'}

/* ---------- who a meal is for (phone 201, 208, 209): "Household" for everyone, the names for a named few, never a servings count on a household line ---------- */
function who(c){if(c.forw==="all"){if(!c.part)return "Household";var n=c.part;return n.length>3?n.slice(0,2).join(", ")+" +"+(n.length-2):n.join(", ")}return c.forw+" · "+c.n+(c.n===1?" person":" people")}
/* a household meal shows for everyone it names (and for all, unnamed), in Household and in each named person's plan; an individual meal only in its owner's (phone 210, a Proposal there too) */
function vis(c,view){if(view==="all")return true;var w=view==="mine"?ME:view;if(c.forw==="all")return !c.part||c.part.indexOf(w)>-1;return c.by===w}
/* Surprise me or a drop on a Not cooking night opens it first (phone 154, 183: that card offers Ask AI and Surprise me) */
function openNight(d){var S=P.S(),k=u.okey(d,ME),usual=S.stencil.Sam.indexOf(d)>-1;if(!u.isBlocked(d,ME))return;if(usual)S.ov[k]=false;else delete S.ov[k]}

/* ---------- "just dropped in" cue (decision 156): any tile whose content changes (drag-drop, Replan then fill, Surprise me, Ask AI, undo, copy) shows a brief drop and wash. Sample-side detection: a tile is "new" when its key (card, day, meal) was not in the last render of the same week and tab. ---------- */
var DROP=P.bDrop={ctx:null,seen:{},t:{},n:[],tm:null},DROPMS=1500;
function dropScan(){var S=P.S(),ctx=S.wk+"|"+S.view,cur={},now=Date.now(),fr=[];
 DN.forEach(function(d){u.dayCards(d).forEach(function(c){var k=c.id+"|"+d+"|"+c.r;cur[k]=1;if(DROP.ctx===ctx&&!DROP.seen[k]){DROP.t[c.id]=now;fr.push(R[c.r].n+" on "+d)}})});
 DROP.ctx=ctx;DROP.seen=cur;if(fr.length)DROP.n=fr}
function dropAge(c){var t=DROP.t[c.id],a=t?Date.now()-t:DROPMS;return a<DROPMS?a:-1}
/* ---------- the one status of a meal (decisions 112, 116): the tile and the top of the detail say it the same way (14 Oct 2026, same order on phone and desktop) ---------- */
/* headline priority is a Proposal: missing (nothing actioned) > use-by > on the list > all on hand (quiet). A tile never shows missing and on the list together. */
function stat(c){var m=u.missing(c),rk=u.risk(c),past=u.pastCard(c),left=u.srcOf(c)==="left",open=m.filter(function(i){return !u.onList(c,i)}),listed=m.filter(function(i){return u.onList(c,i)});
 if(left)return '<span class="stq">Reheat, no shopping</span>';
 if(past)return "";
 if(open.length)return pill("miss",I.miss,"Missing "+names(open));
 if(rk.length)return pill("soon",I.clock,"Use by "+u.ubText(rk[0])+": "+names(rk));
 if(listed.length)return pill("also",I.cart,"On the list: "+names(listed));
 return '<span class="stq">'+sm(TICK,13)+'All on hand</span>'}
P.bStatus=stat;
/* ---------- the tile (decisions 112, 113): left = one status; right = persistent actions ---------- */
function tile(c,v){var S=P.S(),r=R[c.r],m=u.missing(c),rk=u.risk(c),ro=u.roCard(c),act=u.can(c)&&!ro,past=u.pastCard(c),sel=S.sel===c.id,off=u.offline(),left=u.srcOf(c)==="left",pv=u.person(),
 open=m.filter(function(i){return !u.onList(c,i)}),listed=m.filter(function(i){return u.onList(c,i)}),st="",sub="",cf=past&&u.can(c)&&!off;
 st=stat(c);
 if(!past&&!left&&open.length&&rk.length)sub='<span class="ubi">'+sm(I.clock,13)+esc(names(rk))+' use by '+u.ubText(rk[0])+'</span>';
 var vo=!ro&&!act,cls="mcw "+(ro?"ro ":act?"mine ":"theirs ")+(cf?"cf ":"")+(sel?"sel ":"")+(past?"past ":"")+(S.drag&&S.drag.id===c.id?"lifted ":"")+(S.fresh===c.id?"fresh ":"")+(v?"v-"+v:"");
 var age=v==="ghost"?-1:dropAge(c);if(age>-1)cls+=" dropped";
 var lab=r.n+", "+c.day+", "+u.meta(c)+(open.length?", missing "+open.join(", "):listed.length&&!rk.length?", on the shopping list: "+listed.join(", "):"")+(rk.length?", use by "+u.ubText(rk[0])+": "+rk.join(", "):"")+(!open.length&&!listed.length&&!rk.length&&!left&&!past?", all on hand":"")+(c.res?", held":"")+(ro?", view only":act?". Enter to open. Space to lift and move.":", view only, "+(pv?S.view+"'s plan":"planned by "+c.by));
 var A="";
 if(act){var hl=c.res?"Release hold":"Hold";
  A='<div class="ra persist" role="toolbar" aria-label="Actions for '+esc(r.n)+'">'
  +((!left&&open.length)?btn("addmissing",c.id,I.cart,"Add "+open.length+" missing to the shopping list","Add missing to list (L)","cart",{dis:off}):'<span class="rb gap" aria-hidden="true"></span>')
  +(!left?btn("hold",c.id,I.held,hl,hl+" (H)","h",{pressed:!!c.res,dis:off}):'<span class="rb gap" aria-hidden="true"></span>')
  +btn("replan",c.id,I.refresh,"Replan: remove this meal, keep the night open","Replan (X)","r",{dis:off})
  +btn("notcooking",c.id,MOON,"Remove and mark the night not cooking","Not cooking (Shift X)","n",{dis:off})+'</div>'}
 else if(cf)A='<div class="ra persist" role="toolbar" aria-label="Actions for '+esc(r.n)+'">'+btn("cfwd",c.id,I.copy,"Copy forward: put a copy on a coming day","Copy forward","cf")+'</div>';
 return '<div class="'+cls+'" data-cw="'+c.id+'"'+(age>-1?' style="--age:-'+age+'ms"':"")+'><button class="mc" data-card="'+c.id+'" data-fk="card:'+c.id+'" aria-label="'+esc(lab)+'" aria-pressed="'+sel+'"><span class="e">'+r.e+'</span><span class="t"><b>'+esc(r.n)+'</b>'+(st?'<span class="stt">'+st+'</span>':"")
  +'<small class="meta">'+u.avatar(c.by===ME&&c.forw==="all"?"all":c.by)+'<span>'+esc(u.meta(c))+'</span>'+sub+'</small></span></button>'+A
  +(vo?'<span class="eye" aria-hidden="true" title="View only">'+sm(EYE,15)+'</span>':"")+'</div>'}

/* ---------- a day's content: the day states (decisions 116, 119; phone 183, 187, 190, 196, 215) ---------- */
function ctas(d,more){var S0=P.S(),jd=S0.just&&S0.just.day===d&&S0.just.wk===S0.wk;
 /* an empty week asks once, for the whole week (decisions 282, 283): no Surprise me or Ask AI on every night, except the night that was just cleared, which keeps its own prompt */
 if(!jd&&WK.empty().on)return more?'<span class="ctas">'+more+'</span>':"";
 return '<span class="ctas"><button class="mini cta" data-act="surprise" data-day="'+d+'" data-fk="sp:'+d+'" data-tip="Surprise me: the app proposes a meal">'+sm(SURP,15)+'Surprise me</button>'
 +'<button class="mini cta" data-act="askai" data-day="'+d+'" aria-pressed="'+!!(P.S().aiNote&&P.S().aiNote.day===d&&P.S().aiNote.wk===P.S().wk)+'" data-fk="ai:'+d+'" data-tip="Ask AI (A): hands off to your default AI app">'+sm(BI.SPARK,14)+'Ask AI</button>'+(more||"")+'</span>'}
function dayStack(d){var S=P.S(),cs=u.dayCards(d),view=S.view,pv=u.person(),who=pv?view:ME,b=u.isBlocked(d,who),rw=u.weekRo(),i=DN.indexOf(d),dd=u.dt(S.wk,i),pastD=dd<u.TODAYD&&!rw,ro=rw||pastD,h="",
 stencil=(S.stencil[who]||[]).indexOf(d)>-1,ov=S.ov[u.okey(d,who)],once=b&&ov===true&&!stencil;
 if(view==="mine"&&!ro&&!b&&stencil&&ov===false)h+='<div class="ovt">'+sm(REPEAT,13)+'Usual day off, cooking this week</div>';
 if((view==="mine"||pv)&&b){
  var inner=(once?MOON:REPEAT)+'<span class="bt"><b>Not cooking</b><small>'+(once?"This week only":"Every week, usual day off")+'</small></span>',cl="blocked "+(once?"once":"usual");
  if(ro||pv)h+='<div class="'+cl+(pv&&!ro?" vo":"")+'" data-slot="'+d+'" tabindex="0" data-fk="slot:'+d+'" role="group" aria-label="Not cooking '+DF[i]+(once?", this week only":", every week, usual day off")+(pv&&!ro?", view only, "+esc(view)+"'s plan":"")+'">'+inner+(pv&&!ro?'<span class="eye" aria-hidden="true">'+sm(EYE,15)+'</span>':"")+'</div>';
  else h+='<div class="'+cl+'" data-slot="'+d+'" tabindex="0" data-fk="slot:'+d+'" role="group" aria-label="Not cooking '+DF[i]+(once?", this week only":", every week, usual day off")+'">'+inner
   +ctas(d,'<button class="mini quiet" data-unblock="'+d+'" data-fk="mo:'+d+'" data-tip="Open this night for this week'+(once?"":". The usual day off stays")+'">'+sm(UNLOCK,15)+'Mark as open</button>')+'</div>'}
 else if(view==="all"&&b&&!cs.some(function(c){return c.by===ME}))h+='<div class="also-out">'+u.avatar(ME)+' Sam is out</div>';
 cs.forEach(function(c){h+=u.cardW(c,"row")});
 if(pv){if(!cs.length&&!b){
   if(ro)h+='<div class="slot past" data-slot="'+d+'" tabindex="0" data-fk="slot:'+d+'" aria-label="'+DF[i]+', nothing planned"><span class="ol">Nothing was planned</span></div>';
   else h+='<div class="slot open vo" data-slot="'+d+'" tabindex="0" data-fk="slot:'+d+'" role="img" aria-label="Open night, '+DF[i]+', view only, '+esc(view)+'\'s plan"><span class="ol">'+sm(UNLOCK,22)+'</span><span class="eye" aria-hidden="true">'+sm(EYE,15)+'</span></div>'}}
 else if(!cs.length&&!(view==="mine"&&b)){
  if(ro)h+='<div class="slot past" data-slot="'+d+'" tabindex="0" data-fk="slot:'+d+'" aria-label="'+DF[i]+', nothing planned"><span class="ol">Nothing was planned</span></div>';
  else if(S.prop&&S.prop.day===d){var pr=S.prop,pc=R[pr.r];
   h+='<div class="slot prop" data-slot="'+d+'" data-fk="slot:'+d+'" tabindex="0" role="group" aria-label="Surprise proposal for '+DF[i]+': '+esc(pc.n)+'"><span class="e">'+pc.e+'</span><span class="pt"><b>'+esc(pc.n)+'</b><small>'+esc(pr.why)+' Not planned yet.</small></span><span class="ctas"><button class="mini cta yes" data-act="propyes" data-fk="py:'+d+'">Use this</button><button class="mini cta" data-act="propnext" data-fk="pn:'+d+'">Another</button><button class="mini quiet" data-act="propno" data-fk="px:'+d+'">No thanks</button></span></div>'}
  /* an open night offers Ask AI and Surprise me only, no Not cooking button (phone 187 to 189, owner-stated): Not cooking is the right-click menu, B, or Shift X on the focused night */
  else h+='<div class="slot open" data-slot="'+d+'" data-fk="slot:'+d+'" tabindex="0" role="group" aria-label="'+DF[i]+', open night" aria-keyshortcuts="Shift+X" aria-description="Shift X marks this night Not cooking"><span class="ol">'+sm(UNLOCK,22)+'<span>'+(S.just&&S.just.day===d&&S.just.wk===S.wk?"Meal cleared. Fill this night?":"Open night")+'</span></span>'+ctas(d)+'</div>'}
 return h+H.noteHtml(d)}

/* ---------- This week at a glance (decisions 108, 109, 111; wording and colour 14 Oct 2026) ---------- */
function shop(){return u.shopping(u.person())}
function tally(){var sh=shop();return{buy:sh.filter(function(x){return !x.list}).length,list:sh.filter(function(x){return x.list}).length,held:u.scopeCards().filter(function(c){return c.res&&u.can(c)&&!u.roCard(c)}).length,ub:u.risks().length}}
function firstIdx(x){return Math.min.apply(null,x.days.map(function(d){return DN.indexOf(d)}))}
function missWords(n){return n?n+" missing":"nothing missing"}
P.sumHtml=function(){var S=P.S(),pv=u.person(),sh=shop(),rk=u.risks(),T=tally(),prev=P._tl,h="",
 cs=u.scopeCards().filter(function(c){return !u.roCard(c)}),scope=S.view==="mine"?"Mine":S.view==="all"?W("everyone","Everyone"):esc(S.view);
 h+='<div class="sumhead"><span class="sumic">'+CALW+'</span><div><h2>This week at a glance</h2><p>Week of '+u.dstr(S.wk,0)+' · '+scope+'</p></div></div>';
 if(pv&&!u.weekRo())h+='<span class="tg mute lockline vo">'+sm(EYE,14)+'<span>View only, '+esc(S.view)+'\'s plan</span></span>';
 if(u.weekRo())return h+'<p class="hint" style="margin-left:0">Last week is view only. Open a meal to look at it.</p>';
 if(!cs.length){var E=WK.empty(),fm=WK.fillMode();
  if(E.on)return h+'<p class="hint" style="margin-left:0">Nothing planned yet.'+(fm==="card"?" Surprise me and Ask AI for the whole week are above the nights.":fm==="header"?" Surprise me and Ask AI for the whole week are under the week title.":"")+'</p>'+WK.fillGutter();
  return h+'<p class="hint" style="margin-left:0">Nothing planned yet. Pick a night, then Surprise me or Ask AI.</p>'+WK.tools()}
 function cell(k,n,lab,key,zero){return '<div class="st '+k+(prev&&prev[key]!==n?" bump":"")+(zero?" zero":"")+'">'+(zero?'<b>'+zero+'</b>':'<b>'+n+'</b><span>'+lab+'</span>')+'</div>'}
 /* the count is labelled by what it counts: the items on the shopping list, "in the cart" (owner, 12 to 13 Oct); zero missing reads "Nothing missing", never "0 to buy"; Missing (nothing actioned) stays apart from the cart */
 h+='<div class="tally'+(pv?" one":"")+'" role="group" aria-label="Tally: '+missWords(T.buy)+(pv?"":", "+T.list+" in the shopping cart, "+T.held+(T.held===1?" meal":" meals")+" held")+'">'+cell("miss",T.buy,"Missing","buy",T.buy?0:"Nothing missing")
  +(pv?"":cell("also",T.list,"In the cart","list")+cell("held",T.held,T.held===1?"Meal held":"Meals held","held"))+'</div>';
 h+='<section class="sumsec"><h3>Missing, by day</h3>';
 if(!sh.length)h+='<div class="sumok">Everything on the plan is on hand.</div>';
 var groups={};sh.forEach(function(x){var k=firstIdx(x);(groups[k]=groups[k]||[]).push(x)});
 Object.keys(groups).sort(function(a,b){return a-b}).forEach(function(k){var d=DN[k];
  h+='<div class="dayg"><div class="dgh"><b>'+d+'</b><span>'+u.dstr(S.wk,+k)+'</span></div>';
  groups[k].forEach(function(x){var later=x.days.filter(function(dy,j){return x.days.indexOf(dy)===j&&dy!==d});
   h+='<div class="sumrow'+(x.list?" listed":"")+'"><span class="nm">'+esc(x.name)+(x.qty?' <span class="q">'+esc(x.qty)+'</span>':"")+(later.length?'<span class="sub">also '+later.join(", ")+'</span>':"")+'</span>'
   +(pv?"":'<button class="mini cart" data-act="addlist" data-all="1" data-i="'+esc(x.name)+'" data-id="'+x.cards[0]+'" aria-pressed="'+x.list+'" aria-label="'+(x.list?esc(x.name)+" is in the shopping cart. Press to take it out":"Add "+esc(x.name)+" to the shopping list")+'" data-fk="s:'+esc(x.name)+'">'+(x.list?TICK:I.cart)+'</button>')+'</div>'});
  h+='</div>'});
 h+=WK.bulkHtml()+'</section>'+WK.tools()+'<section class="sumsec"><h3>Use-by pressure '+(rk.length?'<span class="n">'+rk.length+'</span>':"")+'</h3>';
 if(!rk.length)h+='<div class="sumok">Nothing will pass its use-by before it is cooked.</div>';
 rk.forEach(function(x){h+='<button class="sumrow ub" data-card="'+x.c.id+'" data-hl="'+x.days.join(",")+'" data-fk="u:'+x.c.id+x.ing+'"><span class="ubd">'+esc(x.ub)+'</span><span class="nm">'+esc(x.ing)+'<span class="sub soonish">'+esc(u.lbl(x.c))+' is planned '+x.c.day+'. '+(x.days.length?"Cook it by "+x.days[x.days.length-1]+".":"Already past.")+'</span></span></button>'});
 return h+'</section>'};

/* ---------- columns: agenda | detail | summary (decision 110) ---------- */
function three(){return !!(P.layout.three&&P.layout.three())}
/* gut-on = the week-at-a-glance gutter is on screen AND its rendered body carries the Week actions group (Copy last week, Clear week; an empty week, last week and another person's plan do not draw it); then the top copies in the header and the empty-week card are hidden by CSS (decision 287). Only a class; the actions have one code path. */
function lanes(){var S=P.S(),tr=three(),picked=!!((S.sel&&u.cardById(S.sel))||S.ing),rz='<div class="rz" id="rz" role="separator" aria-orientation="vertical" aria-label="Resize the side panel" tabindex="0" aria-valuenow="'+P.laneW()+'" aria-valuemin="320" aria-valuemax="560" data-fk="rz"></div>';
 var sumBody=S.loading?P.laneBody():P.sumHtml(),g=(!S.loading&&sumBody.indexOf('aria-label="Week actions"')>-1)?" gut-on":" gut-off";
 if(tr)return{cls:"three"+g+" "+(picked?"has-detail":"no-detail"),html:(picked?'<aside class="panel detail" id="panel" aria-label="'+P.laneAria()+'" tabindex="-1">'+rz+P.laneBody()+'</aside>':"")+'<aside class="panel sumcol" id="panel2" aria-label="This week at a glance" tabindex="-1">'+sumBody+'</aside>'};
 if(picked&&S.sumPeek){var c=u.cardById(S.sel);return{cls:"tucked peeking"+g,html:'<aside class="panel sumcol" id="panel" aria-label="This week at a glance" tabindex="-1">'+rz+'<button class="btn ghost back" data-act="sumback" data-fk="lane:back">'+sm(BACK,16)+' Back to '+(c?esc(u.lbl(c)):"the meal")+'</button>'+sumBody+'</aside>'}}
 if(picked)return{cls:"tucked gut-off",html:'<aside class="panel detail" id="panel" aria-label="'+P.laneAria()+'" tabindex="-1">'+rz+P.laneBody()+'</aside>'};
 return{cls:"tucked"+g,html:'<aside class="panel sumcol" id="panel" aria-label="This week at a glance" tabindex="-1">'+rz+sumBody+'</aside>'}}
function peek(){if(three())return "";var n=tally().buy,l=tally().list;return '<button class="peekbar" data-act="sumpeek" aria-label="This week at a glance: '+missWords(n)+', '+l+' in the cart" data-tip="This week at a glance (G)" data-fk="lane:peek">'+sm(CALW,16)+'<span>This week at a glance</span>'+(n?'<span class="n">'+n+' missing</span>':'')+'<span class="chev">'+sm(OPEN,14)+'</span></button>'}
function glance(){var S=P.S(),pn;
 if(three()){pn=document.getElementById("panel2");if(pn)pn.focus();return}
 if(S.sel||S.ing){S.sumPeek=true;P.render();pn=document.getElementById("panel");if(pn)pn.focus();return}
 pn=document.getElementById("panel");if(pn)pn.focus()}
function after(){var dr=document.querySelectorAll(".mcw.dropped"),left=0,S=P.S(),lv=document.getElementById("live");
 if(DROP.n.length){if(lv)lv.textContent="Dropped in: "+DROP.n.join(", ");DROP.n=[]}
 if(S.aiSay){if(lv)lv.textContent=S.aiSay;S.aiSay=null}
 [].forEach.call(dr,function(e){left=Math.max(left,DROPMS-(Date.now()-(DROP.t[e.dataset.cw]||0)))});clearTimeout(DROP.tm);
 if(dr.length)DROP.tm=setTimeout(function(){[].forEach.call(document.querySelectorAll(".mcw.dropped"),function(e){e.classList.remove("dropped");e.removeAttribute("style")})},Math.max(left,50));
 var T=tally(),p=P._tl;P._tl=T;if(p&&(p.buy!==T.buy||p.list!==T.list||p.held!==T.held)){var l=document.getElementById("live");if(l)l.textContent="This week: "+missWords(T.buy)+", "+T.list+" in the shopping cart, "+T.held+" held"}}

/* sample-only set-up: the usual day (Fri) is drawn as a plain usual day off, Sat is a one-week Not cooking, Sun is open; ?fri=cook restores the leftovers meal and the "cooking this week" line.
   A third household member (Priya) and a named-few meal (Salmon patties for Sam and Jane) make the phone's participants (208) real on the next week. */
function init(S,Q){P.surpriseMode=Q.get("surprise")==="confirm"?"confirm":"lock";
 if(Q.get("fri")!=="cook"){S.cards=S.cards.filter(function(c){return !(c.wk===1&&c.day==="Fri"&&c.r==="left")});delete S.ov["1|Sam|Fri"]}
 S.people.push("Priya");S.stencil.Priya=[];S.cards.push(u.mkCard(1,"Wed","rice","Priya","Priya",1));
 S.cards.forEach(function(c){if(c.wk===1&&c.day==="Thu"&&c.r==="patty")c.part=["Sam","Jane"]});
 if(Q.get("sum")==="1")S.sumPeek=true;
 if(Q.get("prop")&&DN.indexOf(Q.get("prop"))>-1&&P.surpriseMode==="confirm"){S.prop={day:Q.get("prop"),r:"stir",why:"Something new, not cooked in the last 7 days.",seen:["stir"]}}
 if(Q.get("cleared")&&DN.indexOf(Q.get("cleared"))>-1){var cd=Q.get("cleared");S.cards=S.cards.filter(function(c){return !(c.wk===S.wk&&c.day===cd&&c.by===ME)});S.just={wk:S.wk,day:cd}}
 /* the shopping list sample (14 Oct 2026, replan cleanup): feta is on the list for Shakshuka alone (a single-use line); lemon is on the list for BOTH Thursday meals (1 for Salmon patties + 1/2 for Tuna salad, a shared line); chicken thighs were bought on Friday for Chicken curry (in Pantry, never touched); milk was added by hand. */
 S.cards.forEach(function(c){if(c.wk===1&&c.day==="Thu"&&(c.r==="patty"||c.r==="tuna"))c.l_lemon=true});
 S.bought["chicken thighs"]={day:"Fri 9 Oct",cards:["wed-curry"]};S.extras=[{name:"milk",q:"2 L"}];
 if(Q.get("listed")==="1"){["curry sauce","jasmine rice","lemon"].forEach(function(i){S.cards.forEach(function(c){if(u.me(c)&&!u.roCard(c)&&u.missing(c).indexOf(i)>-1)c["l_"+i]=true})})}
 if(Q.get("ask")&&DN.indexOf(Q.get("ask"))>-1)H.askNote(Q.get("ask"))}

P.start({name:"b",flat:true,v2:true,noAssistantBtn:true,moon:MOON,card:tile,lanes:lanes,peek:peek,glance:glance,after:after,init:init,
 wmax:3,cart:true,actOnly:true,readOnlyPeople:true,noBlockedHold:true,landFirst:true,surpriseNeedsOpen:true,ncMs:3000,
 who:who,vis:vis,openNight:openNight,headTools:WK.headTools,chips:WK.chips,copy:WK.copy,clearWeek:WK.clearWeek,
 askNote:H.askNote,weekNote:H.weekNote,onToday:H.onToday,dragMove:H.dragMove,cfMenu:H.cfMenu,cfAct:H.cfAct,
 words:{curtain:"Ask AI to plan this week.",menu:"Ask AI for this night",menuCard:"Ask AI",helpA:"Ask AI, for the night in view (hands off to your default AI app)",everyone:"Household",pickHead:"Planning window: last week and the next four weeks, five in all"},
 help:{
  meal:[["H","Hold, or release the hold"],["X","Replan: remove, keep the night open"],["Shift X","Remove and mark the night not cooking; on a focused open night, mark it not cooking"],["B","Not cooking this night, this week only"],["L","Add this meal's missing items to the list"],["Space","Lift the meal, ← → to carry, Space to drop (Esc cancels)"],["Z","Undo the last change"]],
  weeks:[["[ ]","Previous or next week (also Page Up, Page Down)"],["T","Back to this week; today's night pulses once"],["W","Week picker"],["1 2 3","Mine, Household, then each person (view only)"],["C","Copy last week into empty nights; the button turns into Undo for 14 s"],["Shift C","Clear the week from today on (mine, or the household's, by what is chosen)"]],
  mouse:[["~Persistent icons","Add missing, Hold, Replan and Not cooking sit at the right of each tile; a past tile has Copy forward"],["~Right-click","Same actions as a menu, with keys shown. On an open night: Surprise me, Ask AI, Not cooking"],["~Drag","Move to another day; the torn edge shows what you pulled out. Alt or Option drag copies"],["~Click a count","The moon count and the padlock count jump to the first night of that kind"],["~Two-finger swipe","Sideways on the header or board: previous or next week"],["~Click title","Week picker. ‹ › step one week"]]},
 skeleton:function(){var h='<div class="agenda">';DN.forEach(function(d){h+='<section class="arow"><div class="adate"><b>'+d+'</b></div><div class="astack"><div class="sk"></div></div></section>'});return h+'</div>'},
 main:function(){dropScan();var h=WK.fillCard()+'<div class="agenda" role="list" aria-label="Week agenda">';
  DN.forEach(function(d){var hd=u.dayHeadTxt(d);h+='<section class="arow'+(hd.today?" is-today":"")+'" data-day="'+d+'" data-drop-day="'+d+'" aria-label="'+hd.full+' '+hd.date+'"><div class="adate"><b>'+d+'</b><span>'+hd.date+'</span>'+(hd.today?'<span class="today">Today</span>':"")+'<span class="dh-hint"></span></div><div class="astack">'+dayStack(d)+'</div></section>'});
  return h+'</div>'}});
/* three columns only where there is room (1440 and up): the check lives in its own file, fetched only then */
P.vpScript("(min-width:1440px)","b-three-1440.js");
})();
