/* Option B (refined 12 Oct 2026, decisions 110 to 120 and 156 in docs/knowledge/jobs-to-be-done/plan-desktop.md): agenda (main swim lane, one row per day) + meal detail + "This week at a glance".
   Three columns from 1440 (b-three-1440.js), two below: the summary then tucks behind the meal detail. Sample data and sample-only logic stay in init() here; shared behaviour is in plan.js. */
(function(){var P=PLAN,u=P.u,DN=u.DN,DF=u.DF,I=u.I,esc=u.esc,R=u.R,ME=u.ME;
function svg(p){return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+p+'</svg>'}
var MOON=svg('<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>');
var REPEAT=svg('<path d="M17 2l3 3-3 3M3 11V9a4 4 0 0 1 4-4h13M7 22l-3-3 3-3M21 13v2a4 4 0 0 1-4 4H4"/>');
var CALW=svg('<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4M8 15h3M13 15h3"/>');
var SURP=svg('<path d="M12 3l1.9 5.6L19.5 10l-5.6 1.9L12 17.5l-1.9-5.6L4.5 10l5.6-1.4z"/><path d="M18.5 16l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z"/>');
var TICK=svg('<path d="M5 12.5l4.5 4.5L19 7.5"/>');
var OPEN=svg('<path d="M9 6l6 6-6 6"/>');
var BACK=svg('<path d="M15 6l-6 6 6 6"/>');
function sm(i,w){return i.replace("<svg","<svg width=\""+w+"\" height=\""+w+"\"")}
function names(l){return l.length>2?l.slice(0,2).join(", ")+" +"+(l.length-2):l.join(", ")}
function pill(cls,ic,txt){return '<span class="tg '+cls+'">'+ic+'<span>'+esc(txt)+'</span></span>'}
function btn(act,id,ic,label,tip,fk,o){o=o||{};return '<button class="rb" data-act="'+act+'" data-id="'+id+'"'+(o.pressed!==undefined?' aria-pressed="'+o.pressed+'"':'')+(o.dis?' disabled':'')+' aria-label="'+esc(label)+'" data-tip="'+esc(tip)+'" data-fk="'+fk+':'+id+'">'+ic+'</button>'}

/* ---------- "just dropped in" cue (decision 156): any tile whose content changes (drag-drop, Replan then fill, Surprise me, Ask AI, undo, copy) shows a brief drop and wash. Sample-side detection: a tile is "new" when its key (card, day, meal) was not in the last render of the same week and tab. ---------- */
var DROP={ctx:null,seen:{},t:{},n:[],tm:null},DROPMS=1500;
function dropScan(){var S=P.S(),ctx=S.wk+"|"+S.view,cur={},now=Date.now(),fr=[];
 DN.forEach(function(d){u.dayCards(d).forEach(function(c){var k=c.id+"|"+d+"|"+c.r;cur[k]=1;if(DROP.ctx===ctx&&!DROP.seen[k]){DROP.t[c.id]=now;fr.push(R[c.r].n+" on "+d)}})});
 DROP.ctx=ctx;DROP.seen=cur;if(fr.length)DROP.n=fr}
function dropAge(c){var t=DROP.t[c.id],a=t?Date.now()-t:DROPMS;return a<DROPMS?a:-1}
/* ---------- the tile (decisions 112, 113): left = one status; right = persistent actions ---------- */
function tile(c,v){var S=P.S(),r=R[c.r],m=u.missing(c),rk=u.risk(c),ro=u.roCard(c),mine=c.by===ME&&!ro,past=u.pastCard(c),sel=S.sel===c.id,off=u.offline(),left=u.srcOf(c)==="left",
 open=m.filter(function(i){return !u.onList(c,i)}),listed=m.filter(function(i){return u.onList(c,i)}),st="",sub="";
 /* headline priority is a Proposal: missing (nothing actioned) > use-by > on the list > all on hand (quiet). A tile never shows missing and on the list together. */
 if(left)st='<span class="stq">Reheat, no shopping</span>';
 else if(past)st="";
 else if(open.length)st=pill("miss",I.miss,"Missing "+names(open));
 else if(rk.length)st=pill("soon",I.clock,"Use by "+u.ubText(rk[0])+": "+names(rk));
 else if(listed.length)st=pill("also",I.cart,"On the list: "+names(listed));
 else st='<span class="stq">'+sm(TICK,13)+'All on hand</span>';
 if(!past&&!left&&open.length&&rk.length)sub='<span class="ubi">'+sm(I.clock,13)+esc(names(rk))+' use by '+u.ubText(rk[0])+'</span>';
 var cls="mcw "+(ro?"ro ":mine?"mine ":"theirs ")+(sel?"sel ":"")+(past?"past ":"")+(S.drag&&S.drag.id===c.id?"lifted ":"")+(S.fresh===c.id?"fresh ":"")+(v?"v-"+v:"");
 var age=v==="ghost"?-1:dropAge(c);if(age>-1)cls+=" dropped";
 var lab=r.n+", "+c.day+", "+u.meta(c)+(open.length?", missing "+open.join(", "):listed.length&&!rk.length?", on the shopping list: "+listed.join(", "):"")+(rk.length?", use by "+u.ubText(rk[0])+": "+rk.join(", "):"")+(!open.length&&!listed.length&&!rk.length&&!left&&!past?", all on hand":"")+(c.res?", held":"")+(ro?", view only":mine?". Enter to open. Space to lift and move.":", planned by "+c.by+", view only");
 var A="";
 if(mine){var hd=!c.res&&u.conflicts(c).length,hl=c.res?"Release hold":"Hold";
  A='<div class="ra persist" role="toolbar" aria-label="Actions for '+esc(r.n)+'">'
  +((!left&&open.length)?btn("addmissing",c.id,I.cart,"Add "+open.length+" missing to the shopping list","Add missing to list (L)","cart",{dis:off}):'<span class="rb gap" aria-hidden="true"></span>')
  +(!left?btn("hold",c.id,I.held,hl,hd?"Already held for another meal":hl+" (H)","h",{pressed:!!c.res,dis:hd||off}):'<span class="rb gap" aria-hidden="true"></span>')
  +btn("replan",c.id,I.refresh,"Replan: remove this meal, keep the night open","Replan (X)","r",{dis:off})
  +btn("notcooking",c.id,MOON,"Remove and mark the night not cooking","Not cooking (Shift X)","n",{dis:off})+'</div>'}
 return '<div class="'+cls+'" data-cw="'+c.id+'"'+(age>-1?' style="--age:-'+age+'ms"':"")+'><button class="mc" data-card="'+c.id+'" data-fk="card:'+c.id+'" aria-label="'+esc(lab)+'" aria-pressed="'+sel+'"><span class="e">'+r.e+'</span><span class="t"><b>'+esc(r.n)+'</b>'+(st?'<span class="stt">'+st+'</span>':"")
  +'<small class="meta">'+u.avatar(c.by===ME&&c.forw==="all"?"all":c.by)+'<span>'+u.meta(c)+((mine||ro)?"":" · view only")+'</span>'+sub+'</small></span></button>'+A+'</div>'}

/* ---------- a day's content: the four day states (decision 116) ---------- */
function dayStack(d){var S=P.S(),cs=u.dayCards(d),b=u.isBlocked(d,ME),rw=u.weekRo(),i=DN.indexOf(d),dd=u.dt(S.wk,i),pastD=dd<u.TODAYD&&!rw,ro=rw||pastD,h="",
 stencil=S.stencil.Sam.indexOf(d)>-1,ov=S.ov[u.okey(d,ME)],once=b&&ov===true&&!stencil,view=S.view,person=view!=="mine"&&view!=="all";
 if(view==="mine"&&!ro&&!b&&stencil&&ov===false)h+='<div class="ovt">'+sm(REPEAT,13)+'Usual day off, cooking this week</div>';
 if(view==="mine"&&b){
  var inner=once?MOON+'<span class="bt"><b>Not cooking</b><small>This week only</small></span>':REPEAT+'<span class="bt"><b>Usual day off</b><small>From Settings, every week</small></span>';
  h+=ro?'<div class="blocked '+(once?"once":"usual")+'" data-slot="'+d+'" tabindex="0" data-fk="slot:'+d+'">'+inner+'</div>'
   :'<button class="blocked '+(once?"once":"usual")+'" data-unblock="'+d+'" data-slot="'+d+'" data-fk="slot:'+d+'" aria-label="'+(once?"Not cooking "+DF[i]+", this week only":"Usual day off "+DF[i]+", from Settings")+'. Click to cook this week" data-tip="Cook this week">'+inner+'<span class="bh">Click to cook this week</span></button>'}
 else if(view==="all"&&b&&!cs.some(function(c){return c.by===ME}))h+='<div class="also-out">'+u.avatar(ME)+' Sam is out</div>';
 cs.forEach(function(c){h+=u.cardW(c,"row")});
 if(person){if(!cs.length)h+='<div class="also-out" style="opacity:.8">Nothing planned by '+esc(view)+'</div>'}
 else if(!cs.length&&!(view==="mine"&&b)){
  if(ro)h+='<div class="slot" data-slot="'+d+'" tabindex="0" data-fk="slot:'+d+'" aria-label="'+DF[i]+', nothing planned"><span class="ol">Nothing was planned</span></div>';
  else if(S.prop&&S.prop.day===d){var pr=S.prop,pc=R[pr.r];
   h+='<div class="slot prop" data-slot="'+d+'" data-fk="slot:'+d+'" tabindex="0" role="group" aria-label="Surprise proposal for '+DF[i]+': '+esc(pc.n)+'"><span class="e">'+pc.e+'</span><span class="pt"><b>'+esc(pc.n)+'</b><small>'+esc(pr.why)+' Not planned yet.</small></span><span class="ctas"><button class="mini cta yes" data-act="propyes" data-fk="py:'+d+'">Use this</button><button class="mini cta" data-act="propnext" data-fk="pn:'+d+'">Another</button><button class="mini quiet" data-act="propno" data-fk="px:'+d+'">No thanks</button></span></div>'}
  else h+='<div class="slot open" data-slot="'+d+'" data-fk="slot:'+d+'" tabindex="0" role="group" aria-label="'+DF[i]+', open night"><span class="ol">'+(S.just&&S.just.day===d&&S.just.wk===S.wk?"Meal cleared. Fill this night?":"Open night")+'</span><span class="ctas">'
   +'<button class="mini cta" data-act="surprise" data-day="'+d+'" data-fk="sp:'+d+'" data-tip="Surprise me: the app proposes a meal">'+sm(SURP,15)+'Surprise me</button>'
   +'<button class="mini cta" data-act="askai" data-day="'+d+'" data-fk="ai:'+d+'" data-tip="Ask AI (A)">'+sm(I.spark,14)+'Ask AI</button>'
   +'<button class="mini quiet" data-block="'+d+'" data-fk="nc:'+d+'" data-tip="Not cooking, this week only (B)">'+sm(MOON,15)+'Not cooking</button></span></div>'}
 return h}

/* ---------- This week at a glance (decisions 108, 109, 111) ---------- */
function tally(){var sh=u.shopping();return{buy:sh.filter(function(x){return !x.list}).length,list:sh.filter(function(x){return x.list}).length,held:u.scopeCards().filter(function(c){return c.res}).length,ub:u.risks().length}}
function firstIdx(x){return Math.min.apply(null,x.days.map(function(d){return DN.indexOf(d)}))}
P.sumHtml=function(){var S=P.S(),sh=u.shopping(),rk=u.risks(),T=tally(),prev=P._tl,h="",
 cs=u.scopeCards().filter(function(c){return !u.roCard(c)}),scope=S.view==="mine"?"Mine":S.view==="all"?"Everyone":esc(S.view);
 h+='<div class="sumhead"><span class="sumic">'+CALW+'</span><div><h2>This week at a glance</h2><p>Week of '+u.dstr(S.wk,0)+' · '+scope+'</p></div></div>';
 if(u.weekRo())return h+'<p class="hint" style="margin-left:0">Last week is read-only. Open a meal to look at it.</p>';
 if(!cs.length)return h+'<p class="hint" style="margin-left:0">Nothing planned yet. Pick a night, then Surprise me or Ask AI.</p>';
 function st(k,n,lab,key){return '<div class="st '+k+(prev&&prev[key]!==n?" bump":"")+'"><b>'+n+'</b><span>'+lab+'</span></div>'}
 h+='<div class="tally" role="group" aria-label="Tally: '+T.buy+' to buy, '+T.list+' on the shopping list, '+T.held+' held">'+st("miss",T.buy,"to buy","buy")+st("also",T.list,"on the list","list")+st("held",T.held,T.held===1?"meal held":"meals held","held")+'</div>';
 h+='<section class="sumsec"><h3>What to buy, by day</h3>';
 if(!sh.length)h+='<div class="sumok">Everything on the plan is on hand.</div>';
 var groups={};sh.forEach(function(x){var k=firstIdx(x);(groups[k]=groups[k]||[]).push(x)});
 Object.keys(groups).sort(function(a,b){return a-b}).forEach(function(k){var d=DN[k];
  h+='<div class="dayg"><div class="dgh"><b>'+d+'</b><span>'+u.dstr(S.wk,+k)+'</span></div>';
  groups[k].forEach(function(x){var later=x.days.filter(function(dy,j){return x.days.indexOf(dy)===j&&dy!==d});
   h+='<div class="sumrow'+(x.list?" listed":"")+'"><span class="nm">'+esc(x.name)+(x.qty?' <span class="q">'+esc(x.qty)+'</span>':"")+(later.length?'<span class="sub">also '+later.join(", ")+'</span>':"")+'</span><button class="mini cart" data-act="addlist" data-i="'+esc(x.name)+'" data-id="'+x.cards[0]+'" aria-pressed="'+x.list+'" aria-label="'+(x.list?esc(x.name)+" is on the shopping list. Press to take it off":"Add "+esc(x.name)+" to the shopping list")+'" data-fk="s:'+esc(x.name)+'">'+(x.list?TICK:I.cart)+'</button></div>'});
  h+='</div>'});
 if(T.buy)h+='<button class="btn pri sumcta" data-act="addall" data-fk="addall">'+sm(I.cart,18)+' Add '+T.buy+' to the shopping list</button>';
 h+='</section><section class="sumsec"><h3>Use-by pressure '+(rk.length?'<span class="n">'+rk.length+'</span>':"")+'</h3>';
 if(!rk.length)h+='<div class="sumok">Nothing will pass its use-by before it is cooked.</div>';
 rk.forEach(function(x){h+='<button class="sumrow ub" data-card="'+x.c.id+'" data-hl="'+x.days.join(",")+'" data-fk="u:'+x.c.id+x.ing+'"><span class="ubd">'+esc(x.ub)+'</span><span class="nm">'+esc(x.ing)+'<span class="sub bad">'+esc(u.lbl(x.c))+' is planned '+x.c.day+'. '+(x.days.length?"Cook it by "+x.days[x.days.length-1]+".":"Already past.")+'</span></span></button>'});
 return h+'</section>'};

/* ---------- columns: agenda | detail | summary (decision 110) ---------- */
function three(){return !!(P.layout.three&&P.layout.three())}
function lanes(){var S=P.S(),tr=three(),picked=!!((S.sel&&u.cardById(S.sel))||S.ing),rz='<div class="rz" id="rz" role="separator" aria-orientation="vertical" aria-label="Resize the side panel" tabindex="0" aria-valuenow="'+P.laneW()+'" aria-valuemin="320" aria-valuemax="560" data-fk="rz"></div>';
 var sumBody=S.loading?P.laneBody():P.sumHtml();
 if(tr)return{cls:"three "+(picked?"has-detail":"no-detail"),html:(picked?'<aside class="panel detail" id="panel" aria-label="'+P.laneAria()+'" tabindex="-1">'+rz+P.laneBody()+'</aside>':"")+'<aside class="panel sumcol" id="panel2" aria-label="This week at a glance" tabindex="-1">'+sumBody+'</aside>'};
 if(picked&&S.sumPeek){var c=u.cardById(S.sel);return{cls:"tucked peeking",html:'<aside class="panel sumcol" id="panel" aria-label="This week at a glance" tabindex="-1">'+rz+'<button class="btn ghost back" data-act="sumback" data-fk="lane:back">'+sm(BACK,16)+' Back to '+(c?esc(u.lbl(c)):"the meal")+'</button>'+sumBody+'</aside>'}}
 if(picked)return{cls:"tucked",html:'<aside class="panel detail" id="panel" aria-label="'+P.laneAria()+'" tabindex="-1">'+rz+P.laneBody()+'</aside>'};
 return{cls:"tucked",html:'<aside class="panel sumcol" id="panel" aria-label="This week at a glance" tabindex="-1">'+rz+sumBody+'</aside>'}}
function peek(){if(three())return "";var n=tally().buy,l=tally().list;return '<button class="peekbar" data-act="sumpeek" aria-label="This week at a glance: '+n+' to buy, '+l+' on the list" data-tip="This week at a glance (G)" data-fk="lane:peek">'+sm(CALW,16)+'<span>This week at a glance</span>'+(n?'<span class="n">'+n+' to buy</span>':'')+'<span class="chev">'+sm(OPEN,14)+'</span></button>'}
function glance(){var S=P.S(),pn;
 if(three()){pn=document.getElementById("panel2");if(pn)pn.focus();return}
 if(S.sel||S.ing){S.sumPeek=true;P.render();pn=document.getElementById("panel");if(pn)pn.focus();return}
 pn=document.getElementById("panel");if(pn)pn.focus()}
function after(){var dr=document.querySelectorAll(".mcw.dropped"),left=0;
 if(DROP.n.length){var lv=document.getElementById("live");if(lv)lv.textContent="Dropped in: "+DROP.n.join(", ");DROP.n=[]}
 [].forEach.call(dr,function(e){left=Math.max(left,DROPMS-(Date.now()-(DROP.t[e.dataset.cw]||0)))});clearTimeout(DROP.tm);
 if(dr.length)DROP.tm=setTimeout(function(){[].forEach.call(document.querySelectorAll(".mcw.dropped"),function(e){e.classList.remove("dropped");e.removeAttribute("style")})},Math.max(left,50));
 var T=tally(),p=P._tl;P._tl=T;if(p&&(p.buy!==T.buy||p.list!==T.list||p.held!==T.held)){var l=document.getElementById("live");if(l)l.textContent="This week: "+T.buy+" to buy, "+T.list+" on the shopping list, "+T.held+" held"}}

/* sample-only set-up: the usual day (Fri) is drawn as a plain usual day off, Sat is a one-week Not cooking, Sun is open; ?fri=cook restores the leftovers meal and the "cooking this week" line */
function init(S,Q){P.surpriseMode=Q.get("surprise")==="confirm"?"confirm":"lock";
 if(Q.get("fri")!=="cook"){S.cards=S.cards.filter(function(c){return !(c.wk===1&&c.day==="Fri"&&c.r==="left")});delete S.ov["1|Sam|Fri"]}
 if(Q.get("sum")==="1")S.sumPeek=true;
 if(Q.get("prop")&&DN.indexOf(Q.get("prop"))>-1&&P.surpriseMode==="confirm"){S.prop={day:Q.get("prop"),r:"stir",why:"Something new, not cooked in the last 7 days.",seen:["stir"]}}
 if(Q.get("cleared")&&DN.indexOf(Q.get("cleared"))>-1){var cd=Q.get("cleared");S.cards=S.cards.filter(function(c){return !(c.wk===S.wk&&c.day===cd&&c.by===ME)});S.just={wk:S.wk,day:cd}}
 if(Q.get("listed")==="1"){S.list["curry sauce"]=true;S.list["jasmine rice"]=true;S.list.lemon=true}}

P.start({name:"b",flat:true,v2:true,noAssistantBtn:true,moon:MOON,card:tile,lanes:lanes,peek:peek,glance:glance,after:after,init:init,
 words:{curtain:"Ask AI to plan this week.",menu:"Ask AI for this night",menuCard:"Ask AI",helpA:"Ask AI, for the night in view (opens your default AI app)"},
 skeleton:function(){var h='<div class="agenda">';DN.forEach(function(d){h+='<section class="arow"><div class="adate"><b>'+d+'</b></div><div class="astack"><div class="sk"></div></div></section>'});return h+'</div>'},
 main:function(){dropScan();var h='<div class="agenda" role="list" aria-label="Week agenda">';
  DN.forEach(function(d){var hd=u.dayHeadTxt(d);h+='<section class="arow'+(hd.today?" is-today":"")+'" data-day="'+d+'" data-drop-day="'+d+'" aria-label="'+hd.full+' '+hd.date+'"><div class="adate"><b>'+d+'</b><span>'+hd.date+'</span>'+(hd.today?'<span class="today">Today</span>':"")+'<span class="dh-hint"></span></div><div class="astack">'+dayStack(d)+'</div></section>'});
  return h+'</div>'}});
/* three columns only where there is room (1440 and up): the check lives in its own file, fetched only then */
P.vpScript("(min-width:1440px)","b-three-1440.js");
})();
