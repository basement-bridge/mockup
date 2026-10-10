/* Plan on desktop: shared model, renderers and behaviour for options A to D (fragments/plan-desktop/).
   Sample data only, nothing stored. The layout of each option (what sits in the main column) is in a.js, b.js, c.js, d.js;
   width and height rules are in the option's own CSS files. Standing rules honoured: no in-app agent (42), "Open your assistant"
   opens the person's default AI app (45), data-model work only for the weeks the plan covers (44), AI-made meals are labelled
   "Made up by your assistant" and are not saved recipes, the Plan is shared by Mine / Everyone / per-member tabs (48).
   Close key follows Pantry: Ctrl/Cmd+Enter (plain Esc only cancels a drag or closes a menu). */
(function(){
"use strict";
var P=window.PLAN={},Q=new URLSearchParams(location.search);
var DN=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],DF=["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],MON=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
var WMIN=-1,WMAX=4,ME="Sam",ALL=2,TODAYD=new Date(2026,9,10),CURWK=0,DEFWK=1; /* week 0 = Mon 5 Oct (this week); the page opens on 12 Oct, "Next week", as the owner's screenshot */
function dt(w,i){return new Date(2026,9,5+7*w+i)}
function dstr(w,i){var d=dt(w,i);return d.getDate()+" "+MON[d.getMonth()]}
function iso(d){var m=d.getMonth()+1,n=d.getDate();return d.getFullYear()+"-"+(m<10?"0":"")+m+"-"+(n<10?"0":"")+n}
function labelW(w){return w===0?"This week":w===-1?"Last week":w===1?"Next week":"In "+w+" weeks"}
function esc(s){return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/"/g,"&quot;")}
function q(s,r){return (r||document).querySelector(s)}
function qa(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))}

/* ---------------- sample data ---------------- */
var STOCK={eggs:{q:"12",ub:"2026-10-30"},tomatoes:{q:"4 tins"},onion:{q:"6"},pasta:{q:"500 g"},carrots:{q:"1 bag",ub:"2026-10-20"},cream:{q:"300 ml",ub:"2026-10-14"},"chicken thighs":{q:"600 g",ub:"2026-10-13"},"veg bag":{q:"1 bag",ub:"2026-10-15"},potatoes:{q:"1 kg"},"canned salmon":{q:"2 tins"},tuna:{q:"2 tins"},"mixed leaves":{q:"1 bag",ub:"2026-10-13"},rice:{q:"5 kg"},stock:{q:"1 L"},spinach:{q:"50 g",ub:"2026-10-11"}};
var R={
 shak:{e:"🥚",n:"Shakshuka",ing:["eggs","tomatoes","onion","feta"]},
 pasta:{e:"🍝",n:"Mushroom pasta",ing:["pasta","mushrooms","cream"]},
 curry:{e:"🍛",n:"Chicken curry",ing:["chicken thighs","veg bag","curry sauce","jasmine rice"],src:"made"},
 patty:{e:"🐟",n:"Salmon patties",ing:["canned salmon","potatoes","eggs","dill","lemon"]},
 tuna:{e:"🥗",n:"Tuna salad",ing:["tuna","mixed leaves","lemon"]},
 left:{e:"♻️",n:"Leftovers: chicken curry",ing:[],src:"left",from:"curry"},
 stir:{e:"🥘",n:"Veg stir-fry",ing:["rice","carrots","onion","soy sauce"],src:"made"},
 soup:{e:"🍲",n:"Chicken soup",ing:["chicken thighs","carrots","onion","stock"]},
 rice:{e:"🍳",n:"Egg fried rice",ing:["eggs","rice","onion"]},
 fritt:{e:"🥬",n:"Spinach frittata",ing:["eggs","spinach","onion"]}
};
/* quantity per person (decision 10): the stored shape the real entries must have */
var QPP={eggs:[1,""],tomatoes:[100,"g"],onion:[.5,""],feta:[50,"g"],pasta:[90,"g"],mushrooms:[60,"g"],cream:[30,"ml"],carrots:[1,""],"chicken thighs":[300,"g"],"veg bag":[.5,"bag"],"curry sauce":[100,"g"],"jasmine rice":[.5,"cup"],"canned salmon":[.5,"tin"],potatoes:[200,"g"],dill:[.25,"bunch"],lemon:[.5,""],tuna:[.5,"tin"],"mixed leaves":[.5,"bag"],rice:[75,"g"],"soy sauce":[15,"ml"],stock:[250,"ml"],spinach:[50,"g"]};
var S;
function fmtN(v){var w=Math.floor(v+1e-9),f=v-w;if(f>=.25&&f<.75)return w?w+"½":"½";return String(Math.round(v))}
function qty(i,n){var p=QPP[i];if(!p)return"";var v=p[0]*n,u=p[1];if(u==="g"||u==="ml")return Math.round(v/5)*5+" "+u;var s=fmtN(v);return s+(u?" "+u+((u==="tin"||u==="bag"||u==="cup")&&v>1.2?"s":""):"")}
function mkCard(wk,day,r,by,forw,n,x){var c={id:(wk===1?"":"w"+(wk<0?"m"+(-wk):wk)+"-")+day.toLowerCase()+"-"+r,wk:wk,day:day,r:r,by:by,forw:forw,n:n,res:false,mod:null};if(x)for(var k in x)c[k]=x[k];return c}
function fresh(){
 var s={wk:DEFWK,view:"mine",cards:[],ov:{},stencil:{Sam:["Fri"],Jane:[]},people:["Jane"],list:{},copied:{},sel:null,ing:null,cur:null,day:null,laneOpen:false,sync:"live",loading:false,menu:null,drag:null,toast:null,wkpick:false,help:false,settings:false,nudge:false,nudgeDone:false,fresh:null,undo:[],lastSync:"12:41",laneW:null,tip:null,demoNote:null};
 var C=s.cards;
 C.push(mkCard(1,"Mon","shak",ME,"all",2,{res:true,l_feta:true}),mkCard(1,"Tue","pasta",ME,"all",2,{mod:{mushrooms:"carrots"}}),mkCard(1,"Wed","curry",ME,"all",2),mkCard(1,"Thu","patty",ME,"all",2),mkCard(1,"Thu","tuna",ME,ME,1),mkCard(1,"Fri","left",ME,ME,1),mkCard(1,"Sun","stir","Jane","Jane",1));
 C.push(mkCard(0,"Mon","soup",ME,"all",2),mkCard(0,"Tue","rice",ME,"all",2),mkCard(0,"Wed","pasta",ME,ME,1),mkCard(0,"Thu","fritt",ME,"all",2),mkCard(0,"Sat","rice",ME,"all",2),mkCard(0,"Sun","fritt","Jane","Jane",1));
 C.push(mkCard(-1,"Mon","shak",ME,"all",2),mkCard(-1,"Tue","rice",ME,"all",2),mkCard(-1,"Wed","pasta",ME,ME,1),mkCard(-1,"Thu","fritt",ME,"all",2),mkCard(-1,"Fri","soup",ME,"all",2));
 s.ov["1|Sam|Fri"]=false;s.ov["1|Sam|Sat"]=true;
 return s}
S=fresh();
function card(id){return S.cards.filter(function(c){return c.id===id})[0]}
function me(c){return c.by===ME}
function ings(c){var b=R[c.r].ing;return c.mod?b.map(function(i){return c.mod[i]||i}):b}
function orig(c,i){if(!c.mod)return null;var k=Object.keys(c.mod).filter(function(x){return c.mod[x]===i})[0];return k||null}
function srcOf(c){return c.mod?"mod":(R[c.r].src||"saved")}
function onhand(c){return ings(c).filter(function(i){return STOCK[i]})}
function missing(c){return ings(c).filter(function(i){return !STOCK[i]})}
function cdate(c){return dt(c.wk,DN.indexOf(c.day))}
function pastCard(c){return cdate(c)<TODAYD}
function roCard(c){return c.wk<0||pastCard(c)}
function ubDate(i){var s=STOCK[i];return s&&s.ub?new Date(s.ub+"T00:00:00"):null}
function ubText(i){var d=ubDate(i);return d?DN[(d.getDay()+6)%7]+" "+d.getDate():""}
function riskAt(c,date){return onhand(c).filter(function(i){var u=ubDate(i);return u&&u<date})}
function risk(c){return roCard(c)?[]:riskAt(c,cdate(c))}
function meta(c){var w=c.forw==="all"?"Everyone":c.forw;return w+" · "+c.n+(c.n===1?" person":" people")}
function onList(c,i){return !!(c["l_"+i]||S.list[i])}
function heldBy(c,i){var o=S.cards.filter(function(x){return x.id!==c.id&&x.res&&ings(x).indexOf(i)>-1})[0];return o?(o.wk===c.wk?o.day:dstr(o.wk,DN.indexOf(o.day))):null}
function conflicts(c){return onhand(c).filter(function(i){return heldBy(c,i)})}
function also(c,i){return S.cards.filter(function(o){return o.id!==c.id&&o.wk===c.wk&&ings(o).indexOf(i)>-1}).map(function(o){return o.day})}
function person(){return S.view!=="mine"&&S.view!=="all"}
function okey(day,p,wk){return (wk===undefined?S.wk:wk)+"|"+p+"|"+day}
function isBlocked(day,p,wk){var k=okey(day,p,wk);if(k in S.ov)return S.ov[k];return (S.stencil[p]||[]).indexOf(day)>-1}
function vis(c){return c.wk===S.wk&&(S.view==="all"||(person()?c.by===S.view:me(c)))}
function dayCards(d){return S.cards.filter(function(c){return vis(c)&&c.day===d})}
function scopeCards(){return S.cards.filter(vis)}
function weekRo(){return S.wk<0}
function offline(){return S.sync==="offline"}
function dayFix(c,d){var date=dt(S.wk,DN.indexOf(d));var rk=riskAt(c,date);
 if(risk(c).length&&c.day!==d){return rk.length?{cls:"bad",txt:"after use-by"}:{cls:"fix",txt:"fixes use-by"}}
 if(c.day===d)return{cls:"",txt:"here now"};
 if(isBlocked(d,ME))return{cls:"",txt:"cooks this week"};
 if(dayCards(d).length)return{cls:"",txt:"second meal"};
 return{cls:"",txt:"free night"}}
function canDrop(c,d){return me(c)&&!roCard(c)&&!weekRo()&&c.day!==d&&dt(S.wk,DN.indexOf(d))>=TODAYD}
function lbl(c){return R[c.r].n}

/* ---------------- icons ---------------- */
var I={
 miss:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7.5v5.5M12 16.5v.3"/></svg>',
 cart:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="9" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/><path d="M3 4h2.5l2.2 11h10.6l2-8H6.2"/></svg>',
 held:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 4h10v16l-5-3.5L7 20z"/></svg>',
 clock:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
 cog:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>',
 copy:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2.5"/><path d="M5 15V6.5A2.5 2.5 0 0 1 7.5 4H15"/></svg>',
 chev:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>',
 dots:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="5" cy="12" r="1.6" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none"/><circle cx="19" cy="12" r="1.6" fill="currentColor" stroke="none"/></svg>',
 x:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
 refresh:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 11a8 8 0 0 0-14.5-4M4 5v4h4M4 13a8 8 0 0 0 14.5 4M20 19v-4h-4"/></svg>',
 slash:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8"/><path d="M6.3 6.3l11.4 11.4"/></svg>',
 spark:'<svg viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden="true"><path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8z"/></svg>',
 open:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
 lift:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v18M5 10l7-7 7 7M5 14l7 7 7-7"/></svg>',
 plan:'<path d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1zM4 10h16M8 3v3M16 3v3M8 14h3M13 14h3M8 17h3"/>',
 home:'<path d="M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
 pantry:'<path d="M7 3h10v3H7zM6 6h12v14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1zM9 11h6v5H9z"/>',
 recipes:'<path d="M7 14a4 4 0 1 1 2-7 4 4 0 0 1 6 0 4 4 0 1 1 2 7v6H7z"/>',
 cartn:'<path d="M3 4h2l2.4 11h10l2-8H6.2M9 20h.01M17 20h.01"/>'
};
function pill(cls,ic,n,label){return '<span class="tg '+cls+'" role="img" aria-label="'+esc(label)+'">'+ic+(n===""?"":n)+'</span>'}
function avatar(w){if(w==="all")return '<span class="av all" title="Everyone">👥</span>';if(w===ME)return '<span class="av" title="Sam">S</span>';return '<span class="av j" title="'+esc(w)+'">'+esc(w.charAt(0))+'</span>'}

/* ---------------- the meal card (one markup, three densities via the option's CSS) ---------------- */
function nl(c){return Object.keys(c).filter(function(k){return k.indexOf("l_")===0&&c[k]}).length}
function cardW(c,v){var r=R[c.r],m=missing(c),rk=risk(c),mine=me(c)&&!roCard(c),ro=roCard(c),past=pastCard(c),pills="",sel=S.sel===c.id;
 if(!past&&m.length)pills+=pill("miss",I.miss,m.length,m.length+" ingredients missing");
 if(!past&&rk.length)pills+=pill("soon",I.clock,rk.length,rk.length+" ingredients past use-by on the day");
 if(!past&&nl(c))pills+=pill("also",I.cart,nl(c),nl(c)+" on the shopping list");
 if(c.res)pills+=pill("",I.held,"","Held");
 var oh=onhand(c),line=r.src==="left"?"Reheat; no shopping":(m.length?'<em>Missing</em> '+esc(m.join(", ")):'<span>On hand: '+esc(oh.join(", "))+'</span>');
 var cls="mcw "+(ro?"ro ":mine?"mine ":"theirs ")+(sel?"sel ":"")+(past?"past ":"")+(S.drag&&S.drag.id===c.id?"lifted ":"")+(S.fresh===c.id?"fresh ":"")+(v?"v-"+v:"");
 var lab=r.n+", "+c.day+", "+meta(c)+(m.length?", "+m.length+" missing":"")+(rk.length?", "+rk.length+" past use-by":"")+(c.res?", held":"")+(ro?", view only":mine?". Enter to open. Space to lift and move.":", planned by "+c.by+", view only");
 var tb="";
 if(mine&&!offline()){var hd=!c.res&&conflicts(c).length;
  tb='<div class="ra" role="toolbar" aria-label="Actions for '+esc(r.n)+'">'
  +(srcOf(c)!=="left"?'<button class="rb" data-act="hold" data-id="'+c.id+'" aria-pressed="'+!!c.res+'"'+(hd?" disabled":"")+' aria-label="'+(c.res?"Release hold":"Hold")+'" data-tip="'+(c.res?"Release hold":hd?"Already held for another meal":"Hold")+' (H)" data-fk="h:'+c.id+'">'+I.held+'</button>':"")
  +'<button class="rb" data-act="replan" data-id="'+c.id+'" aria-label="Replan: remove this meal, keep the night open" data-tip="Replan (X)" data-fk="r:'+c.id+'">'+I.x+'</button>'
  +'<button class="rb" data-act="more" data-id="'+c.id+'" aria-haspopup="menu" aria-label="More actions" data-tip="More (right-click)" data-fk="m:'+c.id+'">'+I.dots+'</button></div>'}
 return '<div class="'+cls+'" data-cw="'+c.id+'"><button class="mc" data-card="'+c.id+'" data-fk="card:'+c.id+'" aria-label="'+esc(lab)+'" aria-pressed="'+sel+'"><span class="e">'+r.e+'</span><span class="t"><b>'+esc(r.n)+'</b><small>'+meta(c)+'</small><span class="ingl">'+line+'</span>'+(pills?'<span class="chips">'+pills+'</span>':'')+'</span>'+avatar(c.by===ME&&c.forw==="all"?"all":c.by)+((mine||ro)?'':'<span class="lock" aria-hidden="true">🔒</span>')+'</button>'+tb+'</div>'}
/* everything a day holds, as the phone shows it (decisions 14, 23, 24, 34, 35, 36); the caller wraps it in the day's drop zone */
function dayStack(d,v){var cs=dayCards(d),h="",b=isBlocked(d,ME),rw=weekRo(),i=DN.indexOf(d),dd=dt(S.wk,i),pastD=dd<TODAYD&&!rw;
 var once=b&&S.ov[okey(d,ME)]===true&&S.stencil.Sam.indexOf(d)<0;
 if(S.view==="mine"&&!rw&&!pastD&&!b&&S.stencil.Sam.indexOf(d)>-1&&S.ov[okey(d,ME)]===false)h+='<div class="ovt">Usual day off, cooking this week</div>';
 if(S.view==="mine"&&b){h+=(rw||pastD)?'<div class="blocked'+(once?" once":"")+'" data-slot="'+d+'" tabindex="0" data-fk="slot:'+d+'"><span>Not cooking</span></div>':'<button class="blocked'+(once?" once":"")+'" data-unblock="'+d+'" data-slot="'+d+'" data-fk="slot:'+d+'" aria-label="Not cooking '+DF[i]+(once?", this week only":", usual day off")+'. Click to cook this week" data-tip="Cook this week"><span>Not cooking</span></button>'}
 else if(S.view==="all"&&b&&!cs.some(me))h+='<div class="also-out">'+avatar(ME)+' Sam is out</div>';
 cs.forEach(function(c){h+=cardW(c,v)});
 if(person()){if(!cs.length)h+='<div class="also-out" style="opacity:.8">Nothing planned by '+esc(S.view)+'</div>'}
 else if(!cs.length&&!(S.view==="mine"&&b)){h+=(rw||pastD)?'<div class="slot" data-slot="'+d+'" tabindex="0" data-fk="slot:'+d+'" aria-label="'+DF[i]+', nothing planned"></div>':'<button class="slot" data-block="'+d+'" data-slot="'+d+'" data-fk="slot:'+d+'" aria-label="'+DF[i]+', empty. Click: not cooking, this week only" data-tip="Not cooking (B)"></button>'}
 return h}
function dayHeadTxt(d){var i=DN.indexOf(d);return {name:d,full:DF[i],date:dstr(S.wk,i),today:S.wk===CURWK&&i===5}}

/* ---------------- week summary (the lane when nothing is open) ---------------- */
function shopping(){var map={},order=[];scopeCards().forEach(function(c){if(roCard(c))return;missing(c).forEach(function(i){if(!map[i]){map[i]={name:i,tot:0,n:0,days:[],list:false,cards:[]};order.push(i)}var m=map[i],p=QPP[i];m.tot+=p?p[0]*c.n:0;m.days.push(c.day);m.cards.push(c.id);if(onList(c,i))m.list=true})});
 return order.map(function(i){var m=map[i],p=QPP[i],u=p?p[1]:"";m.qty=p?(u==="g"||u==="ml"?Math.round(m.tot/5)*5+" "+u:fmtN(m.tot)+(u?" "+u+(m.tot>1.2&&/tin|bag|cup/.test(u)?"s":""):"")):"";return m})}
function risks(){var out=[];scopeCards().forEach(function(c){risk(c).forEach(function(i){out.push({ing:i,c:c,ub:ubText(i),days:DN.filter(function(d,k){var u=ubDate(i);return u&&dt(S.wk,k)<=u&&dt(S.wk,k)>=TODAYD})})})});return out}
function status(c){var m=missing(c).length,rk=risk(c).length;return rk?{cls:"soon",t:"use-by"}:m?{cls:"miss",t:m+" to buy"}:{cls:"ok",t:"ready"}}
P.sumHtml=function(){var sh=shopping(),rk=risks(),cs=scopeCards().filter(function(c){return !roCard(c)}).sort(function(a,b){return DN.indexOf(a.day)-DN.indexOf(b.day)}),h="";
 var todo=sh.filter(function(x){return !x.list}).length;
 h+='<div class="idle-title"><h2>This week at a glance</h2><p>Week of '+dstr(S.wk,0)+' · '+(S.view==="mine"?"Mine":S.view==="all"?"Everyone":esc(S.view))+'</p></div>';
 if(weekRo())return h+'<p class="hint" style="margin-left:0">Last week is read-only. Open a meal to look at it.</p>';
 if(!cs.length)return h+'<p class="hint" style="margin-left:0">Nothing planned yet.</p>';
 h+='<section class="sumsec"><h3>To buy '+(sh.length?'<span class="n">'+sh.length+'</span>':"")+'</h3>';
 if(!sh.length)h+='<div class="sumok">Everything on the plan is on hand.</div>';
 sh.forEach(function(x){h+='<div class="sumrow"><span class="nm">'+esc(x.name)+(x.qty?' <span class="q">'+esc(x.qty)+'</span>':"")+'<span class="sub">for '+esc(x.days.join(", "))+'</span></span><button class="mini cart" data-act="addlist" data-i="'+esc(x.name)+'" data-id="'+x.cards[0]+'" aria-pressed="'+x.list+'" aria-label="'+(x.list?esc(x.name)+" is on the shopping list":"Add "+esc(x.name)+" to the shopping list")+'" data-fk="s:'+esc(x.name)+'">'+(x.list?"✓":I.cart)+'</button></div>'});
 if(todo)h+='<button class="btn pri sumcta" data-act="addall" data-fk="addall">'+I.cart.replace("<svg","<svg width=\"18\" height=\"18\"")+' Add '+todo+' to the shopping list</button>';
 h+='</section><section class="sumsec"><h3>Use-by pressure '+(rk.length?'<span class="n">'+rk.length+'</span>':"")+'</h3>';
 if(!rk.length)h+='<div class="sumok">Nothing will pass its use-by before it is cooked.</div>';
 rk.forEach(function(x){h+='<button class="sumrow" data-card="'+x.c.id+'" data-hl="'+x.days.join(",")+'" data-fk="u:'+x.c.id+x.ing+'"><span class="e">'+R[x.c.r].e+'</span><span class="nm">'+esc(x.ing)+' <span class="q">use by '+x.ub+'</span><span class="sub bad">'+esc(lbl(x.c))+' is planned '+x.c.day+'. '+(x.days.length?"Cook it by "+x.days[x.days.length-1]+".":"Already past.")+'</span></span></button>'});
 h+='</section><section class="sumsec"><h3>Cook order</h3>';
 cs.forEach(function(c){var s=status(c);h+='<button class="sumrow" data-card="'+c.id+'" data-fk="o:'+c.id+'"><span class="e">'+R[c.r].e+'</span><span class="nm"><b style="font-weight:700">'+c.day+'</b> '+esc(lbl(c))+'<span class="sub">'+meta(c)+'</span></span><span class="tg '+(s.cls==="ok"?"":s.cls)+'">'+(s.cls==="miss"?I.miss:s.cls==="soon"?I.clock:"")+s.t+'</span></button>'});
 return h+'</section>'};

/* ---------------- the inspector for one meal ---------------- */
P.mealHtml=function(c){var r=R[c.r],mine=me(c)&&!roCard(c),sr=srcOf(c),oh=onhand(c),ms=missing(c),rk=risk(c),h="",dis=offline();
 h+='<div class="top"><span class="ph">'+r.e+'</span><div><h2>'+esc(r.n)+'</h2><p>'+DF[DN.indexOf(c.day)].slice(0,3)+' '+dstr(c.wk,DN.indexOf(c.day))+' · '+meta(c)+'</p></div><button class="x" data-close aria-label="Close ('+P.mod+' Enter)" data-tip="Close ('+P.mod+' Enter)" data-fk="lane:x">&times;</button></div>';
 if(!mine)h+='<span class="tg mute lockline">🔒 '+(roCard(c)?(c.wk<0?"Last week is read-only. You can look, not change.":"This night has passed. You can look, not change."):esc(c.by)+" planned this. You can look, not change.")+'</span>';
 if(sr==="saved")h+='<div class="srcbox"><button class="lnk" data-act="viewrec" data-fk="lane:rec">📖 View recipe ›</button></div>';
 if(sr==="mod")h+='<div class="srcbox"><span class="tg also">Modified by assistant</span><span>Swaps are kept with this meal on '+c.day+' and shown on the rows below.</span><button class="lnk" data-act="viewrec" data-fk="lane:rec">📖 View original recipe ›</button></div>';
 if(sr==="made")h+='<div class="srcbox"><span class="tg also">Made up by your assistant</span><span>Not a saved recipe.</span></div>';
 if(sr==="left")h+='<div class="srcbox"><span class="tg mute">🔒 Category: Leftovers (protected)</span><span>Reheats the '+esc(R[R[c.r].from].n)+' cooked earlier. No recipe, no shopping, no hold.</span></div>';
 if(mine&&sr!=="left")h+='<div class="ppl"><span class="lbl" style="margin:0">People</span><button class="mini" data-act="ppl" data-d="-1" aria-label="Fewer people" data-fk="lane:p-"'+(c.n<=1||dis?" disabled":"")+'>−</button><b>'+c.n+'</b><button class="mini" data-act="ppl" data-d="1" aria-label="More people" data-fk="lane:p+"'+(c.n>=8||dis?" disabled":"")+'>+</button></div>';
 if(oh.length){var hd=!c.res&&conflicts(c).length;h+='<div class="lblrow"><div class="lbl">On hand</div>'+(mine?'<button class="mini" data-act="hold" data-id="'+c.id+'" aria-pressed="'+!!c.res+'"'+((hd||dis)?" disabled":"")+' data-fk="lane:hold">'+I.held.replace("<svg","<svg width=\"15\" height=\"15\"")+(c.res?"Held":"Hold")+' <span class="kbd">H</span></button>':"")+'</div>'+((mine&&hd)?'<p class="hint">'+esc(conflicts(c).join(", "))+' already held for another meal.</p>':"");
  oh.forEach(function(i){var a=heldBy(c,i),al=also(c,i),bad=riskAt(c,cdate(c)).indexOf(i)>-1&&!roCard(c);h+='<div class="ing ind"><span class="nm">'+esc(i)+(orig(c,i)?' <span class="was">(<s>'+esc(orig(c,i))+'</s>)</span>':"")+' <span class="q">'+qty(i,c.n)+'</span>'+(STOCK[i].ub?'<span class="sub'+(bad?" bad":"")+'">use by '+ubText(i)+(bad?", before "+c.day:"")+'</span>':"")+(al.length?'<span class="sub">also '+al.join(", ")+'</span>':"")+'</span><span class="rt">'+(a?'<span class="tg also">held for '+esc(a)+'</span>':"")+(bad?'<span class="tg soon">'+I.clock+'use-by</span>':"")+'</span></div>'})}
 if(ms.length){h+='<div class="lbl">Missing</div><p class="hint">Talk to your assistant about substitutes</p>';ms.forEach(function(i){var al=also(c,i);h+='<div class="ing ind miss"><span class="nm">'+esc(i)+(orig(c,i)?' <span class="was">(<s>'+esc(orig(c,i))+'</s>)</span>':"")+' <span class="q">'+qty(i,c.n)+'</span>'+(al.length?'<span class="sub">also needed '+al.join(", ")+'</span>':"")+'</span><span class="rt">'+(mine?'<button class="mini cart" data-act="addlist" data-i="'+esc(i)+'" data-id="'+c.id+'" aria-pressed="'+onList(c,i)+'" aria-label="'+(onList(c,i)?esc(i)+" is on the shopping list":"Add "+esc(i)+" to the shopping list")+'" data-fk="lane:c:'+esc(i)+'"'+(dis?" disabled":"")+'>'+(onList(c,i)?"✓":I.cart)+'</button>':"")+'</span></div>'})}
 if(!oh.length&&!ms.length)h+='<p style="margin-top:12px;font-size:13px">Leftovers need no shopping and no reservation.</p>';
 if(mine)h+='<button class="btn ghost rmbtn" data-act="replan" data-id="'+c.id+'" data-fk="lane:rm"'+(dis?" disabled":"")+'>Remove <span class="kbd">X</span></button>';
 return h};
P.ingHtml=function(name){var st=STOCK[name],users=scopeCards().filter(function(c){return ings(c).indexOf(name)>-1&&!roCard(c)}).sort(function(a,b){return DN.indexOf(a.day)-DN.indexOf(b.day)}),h="";
 h+='<div class="top"><span class="ph">🧺</span><div><h2>'+esc(name)+'</h2><p>'+(st?"On hand: "+esc(st.q)+(st.ub?" · use by "+ubText(name):""):"Not in the pantry")+'</p></div><button class="x" data-close aria-label="Close ('+P.mod+' Enter)" data-tip="Close ('+P.mod+' Enter)" data-fk="lane:x">&times;</button></div>';
 h+='<div class="lbl">Used this week</div>';
 users.forEach(function(c){var bad=risk(c).indexOf(name)>-1;h+='<button class="sumrow" data-card="'+c.id+'" data-fk="iu:'+c.id+'"><span class="e">'+R[c.r].e+'</span><span class="nm"><b style="font-weight:700">'+c.day+'</b> '+esc(lbl(c))+' <span class="q">'+qty(name,c.n)+'</span>'+(bad?'<span class="sub bad">after its use-by ('+ubText(name)+')</span>':"")+'</span></button>'});
 if(!st){var shop=DN.indexOf(users[0]?users[0].day:"Mon")-1;h+='<p class="hint" style="margin-left:0;margin-top:10px">Needed from '+(users[0]?users[0].day:"")+'. Buy by '+(shop<0?"Sunday":DF[shop])+'.</p><button class="btn pri sumcta" data-act="addlist" data-i="'+esc(name)+'" data-id="'+(users[0]?users[0].id:"")+'" data-fk="lane:buy">'+I.cart.replace("<svg","<svg width=\"18\" height=\"18\"")+' Add to the shopping list</button>'}
 return h};
try{P.nocues=localStorage.getItem("desktop-cues")==="0"}catch(e){}
P.mod=/Mac|iP(hone|ad)/.test(navigator.platform||"")?"⌘":"Ctrl";

/* ---------------- header ---------------- */
function ghosts(){var h="";for(var w=WMIN;w<=WMAX;w++)h+='<span class="gh" aria-hidden="true"><b>Week of '+dstr(w,0)+'</b><small>'+labelW(w)+' ⌄</small></span>';return h}
function wkPickHtml(){var h='<div class="pop" role="menu" aria-label="Pick a week" style="top:calc(100% + 6px);left:0"><div class="poph">Planning window: last week to four weeks ahead</div>';
 for(var w=WMIN;w<=WMAX;w++){var n=S.cards.filter(function(c){return c.wk===w&&me(c)}).length;h+='<button class="wk" role="menuitem" data-wkpick="'+w+'" aria-current="'+(w===S.wk)+'" data-fk="wp:'+w+'"><span><b>Week of '+dstr(w,0)+'</b><small>'+labelW(w)+(w<0?" · read-only":"")+'</small></span><span class="rt">'+(n?n+" meal"+(n>1?"s":""):"empty")+'</span></button>'}
 return h+'</div>'}
function syncLabel(){return S.sync==="syncing"?"Syncing…":S.sync==="offline"?"Offline":S.sync==="ai"?"Updated by your assistant":"Live"}
function syncHtml(){return '<button class="sync '+S.sync+'" data-act="refresh" data-fk="hdr:sync" aria-label="Refresh the plan. Status: '+syncLabel()+(S.sync==="live"?", last synced "+S.lastSync:"")+'" data-tip="Refresh (R)"><i></i>'+syncLabel()+(S.sync==="live"?' <span style="font-weight:500">'+S.lastSync+'</span>':"")+'</button>'}
function segHtml(){var h='<button data-view="mine" aria-pressed="'+(S.view==="mine")+'" data-fk="v:mine">Mine <span class="kbd">1</span></button><i class="sd" aria-hidden="true"></i><button data-view="all" aria-pressed="'+(S.view==="all")+'" data-fk="v:all">Everyone <span class="kbd">2</span></button>';
 if(S.people.length)h+='<i class="sd" aria-hidden="true"></i>';
 S.people.forEach(function(n,k){h+='<button data-view="'+esc(n)+'" aria-pressed="'+(S.view===n)+'" data-fk="v:'+esc(n)+'">'+esc(n)+' <span class="kbd">'+(k+3)+'</span></button>'});
 return '<div class="seg" role="group" aria-label="View"><div class="segl">'+h+'</div></div>'}
function chipsHtml(){var sc=scopeCards().filter(function(c){return !roCard(c)}),sh=shopping().length,rk=risks().length,ms=sc.filter(function(c){return missing(c).length}).length;
 if(!sc.length)return "";
 return '<div class="wst" role="group" aria-label="This week">'+(sh?'<button class="chipb miss" data-act="sum" data-fk="hdr:sh">'+I.miss+sh+' to buy</button>':'')+(rk?'<button class="chipb soon" data-act="sum" data-fk="hdr:rk">'+I.clock+rk+' use-by</button>':'')+(!sh&&!rk?'<span class="chipb ok">All on hand</span>':'')+'</div>'}
function headHtml(){var cp=!!S.copied[S.wk],h='';
 h+='<div class="wkbar"><button class="ib sm" data-wk="-1" aria-label="Previous week" data-tip="Previous week ([)" data-fk="hdr:prev"'+(S.wk<=WMIN?" disabled":"")+'>‹</button>'
 +'<div class="wkpick"><button class="wkh" data-act="wkpick" aria-haspopup="menu" aria-expanded="'+S.wkpick+'" aria-label="Week of '+dstr(S.wk,0)+', '+labelW(S.wk)+'. Pick a week" data-tip="Pick a week (W)" data-fk="hdr:title"><span><b>Week of '+dstr(S.wk,0)+'</b><small>'+labelW(S.wk)+' ⌄</small></span>'+ghosts()+'</button>'+(S.wkpick?wkPickHtml():"")+'</div>'
 +'<button class="ib sm" data-wk="1" aria-label="Next week" data-tip="Next week (])" data-fk="hdr:next"'+(S.wk>=WMAX?" disabled":"")+'>›</button>'
 +'<span class="sp"></span>'+syncHtml()
 +'<button class="ib" data-act="copy" aria-pressed="'+cp+'" aria-label="Copy last week'+(cp?" (applied, press again to clear)":"")+'" data-tip="Copy last week (C)" data-fk="hdr:copy"'+((weekRo()||offline())?" disabled":"")+'>'+I.copy+'</button>'
 +'<button class="ib" data-act="settings" aria-label="Settings, usual days" data-tip="Usual days (S)" data-fk="hdr:cog">'+I.cog+'</button>'
 +((person()||weekRo())?"":'<button class="btn" data-act="assistant" data-fk="hdr:ai">'+I.spark.replace("<svg","<svg width=\"16\" height=\"16\"")+' Open your assistant <span class="kbd">A</span></button>')+'</div>';
 h+='<div class="hrow">'+segHtml()+chipsHtml()+'</div>';
 if(S.nudge)h+='<div class="cslot"><button class="curtain" data-act="assistant" data-fk="nudge">✦ Plan with your AI assistant. <span class="kbd">A</span></button></div>';
 if(weekRo())h+='<div class="ro-note">🔒 Last week is read-only. You can look, not change.</div>';
 if(offline())h+='<div class="offbar" role="status">Offline. Showing the last plan saved here ('+S.lastSync+'). Changes are paused until you are back.</div>';
 return h}

/* ---------------- shell and render cycle ---------------- */
function railHtml(){var NAV=[["home","Home",0],["pantry","Pantry",0],["plan","Plan",0],["recipes","Recipes",2],["cartn","Shopping",Object.keys(S.list).length+3]];
 return '<nav class="rail" aria-label="Main"><div class="brand">Our<br>kitchen</div>'+NAV.map(function(n){var on=n[0]==="plan";return '<button class="nv '+(on?"on":"")+'" '+(on?'aria-current="page"':"")+'><svg viewBox="0 0 24 24" aria-hidden="true">'+I[n[0]]+'</svg><span>'+n[1]+'</span>'+(n[2]?'<i class="n">'+n[2]+'</i>':"")+'</button>'}).join("")+'<div class="me"><button class="nv" data-act="help" aria-label="Keyboard shortcuts" data-fk="rail:help"><span class="qk">?</span><span>Keys</span></button><button class="av" aria-label="Profile and settings" aria-haspopup="dialog">S</button></div></nav>'}
function laneBody(){if(S.loading)return '<div class="sk" style="height:52px;margin-bottom:12px"></div><div class="sk" style="height:140px;margin-bottom:12px"></div><div class="sk" style="height:140px"></div>';
 if(S.sel&&card(S.sel))return P.mealHtml(card(S.sel));
 if(S.ing)return P.ingHtml(S.ing);
 if(P.layout.lane2&&P.layout.lane2())return '<p class="empty">Pick a meal to see it here</p>';
 return P.layout.idle?P.layout.idle():P.sumHtml()}
function laneAria(){return S.sel?"Meal":S.ing?"Ingredient":P.layout.idleLabel||"Week summary"}
function menuHtml(){var m=S.menu;if(!m)return "";var h='<div class="cm" role="menu" id="cm" style="left:'+(m.x||0)+'px;top:'+(m.y||0)+'px">';
 if(m.kind==="day"){var d=m.day;h+='<div class="cmh">'+DF[DN.indexOf(d)]+'</div><button role="menuitem" data-mi="block" data-fk="mi:b"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8"/><path d="M6.3 6.3l11.4 11.4"/></svg>Not cooking, this week only<span class="kbd">B</span></button><button role="menuitem" data-mi="assistant" data-fk="mi:a">'+I.spark.replace("<svg","<svg style=\"fill:currentColor;stroke:none\"")+'Plan with your assistant<span class="kbd">A</span></button>';return h+'</div>'}
 var c=card(m.id);if(!c)return "";var mine=me(c)&&!roCard(c),hd=!c.res&&conflicts(c).length,ms=missing(c).filter(function(i){return !onList(c,i)});
 h+='<div class="cmh">'+R[c.r].e+' '+esc(R[c.r].n)+' · '+c.day+'</div>'
 +'<button role="menuitem" data-mi="open" data-fk="mi:o"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>Open<span class="kbd">Enter</span></button>';
 if(mine&&!offline()){h+=(srcOf(c)!=="left"?'<button role="menuitem" data-mi="hold"'+(hd?" disabled":"")+' data-fk="mi:h"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4h10v16l-5-3.5L7 20z"/></svg>'+(c.res?"Release hold":"Hold")+'<span class="kbd">H</span></button>':"")
  +(ms.length?'<button role="menuitem" data-mi="addmissing" data-fk="mi:l"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/><path d="M3 4h2.5l2.2 11h10.6l2-8H6.2"/></svg>Add '+ms.length+' missing to the list<span class="kbd">L</span></button>':"")
  +'<hr><button role="menuitem" data-mi="replan" data-fk="mi:r"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>Replan: remove, keep the night open<span class="kbd">X</span></button>'
  +'<button role="menuitem" data-mi="notcooking" data-fk="mi:n"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8"/><path d="M6.3 6.3l11.4 11.4"/></svg>Remove and mark not cooking<span class="kbd">Shift X</span></button>'}
 h+='<hr><button role="menuitem" data-mi="assistant" data-fk="mi:a">'+I.spark.replace("<svg","<svg style=\"fill:currentColor;stroke:none\"")+'Open your assistant<span class="kbd">A</span></button>';
 return h+'</div>'}
function G(t,rows){return '<section class="kbs"><h3>'+t+'</h3>'+rows.map(function(x){var k=x[0].charAt(0)==="~"?x[0].slice(1):x[0].split(" ").map(function(w){return /^(then|or|and|to|plus)$/.test(w)?'<em>'+w+'</em>':'<kbd>'+w+'</kbd>'}).join(" ");return '<div class="kbr"><span class="kk">'+k+'</span><span>'+x[1]+'</span></div>'}).join("")+'</section>'}
function helpHtml(){var m=P.mod;return '<div class="kb" id="kb"><div class="kbc" role="dialog" aria-modal="true" aria-labelledby="kbt"><div class="kbh"><h2 id="kbt">Plan: keyboard and mouse</h2><button class="x" data-close aria-label="Close ('+m+' Enter)" data-fk="kb:x">&times;</button></div><div class="kbg">'
 +G("Move around",[["← → ↑ ↓","Between days and meals; the lane follows"],["J K","Next or previous meal (same as ↓ ↑)"],["Enter","Open the meal; again, move into the lane"],["M","Focus the first meal in the main column"],["Home End","First or last meal of the week"]])
 +G("The meal",[["H","Hold or release the hold"],["X","Replan: remove, keep the night open"],["Shift X","Remove and mark the night not cooking"],["B","Not cooking this night, this week only"],["L","Add this meal's missing items to the list"],["Space","Lift the meal, ← → to carry, Space to drop (Esc cancels)"],["Z","Undo the last change"]])
 +G("Weeks and people",[["[ ]","Previous or next week (also Page Up, Page Down)"],["T","Back to this week"],["W","Week picker"],["1 2 3","Mine, Everyone, then each person"],["C","Copy last week; again clears what it added"]])
 +G("General",[["A","Open your assistant (your default AI app)"],["R","Refresh now"],["S","Usual days (Settings)"],["?","This list"],[m+" Enter","Close the lane, menu, picker or this list"],["Esc","Cancel a drag or lift, close a menu or picker only"]])
 +G("Mouse and trackpad",[["~Hover","Hold, Replan and More appear on the card"],["~Right-click","Same actions as a menu, with keys shown"],["~Drag","Move to another day. Alt or Option drag copies"],["~Two-finger swipe","Sideways on the header or board: previous or next week"],["~Click title","Week picker. ‹ › step one week"]])
 +'</div><div class="kbt" style="display:flex;justify-content:space-between;align-items:center;margin-top:14px;padding-top:12px;border-top:1px solid var(--border);font-weight:600"><span id="cuel">Show shortcut cues on buttons and hints</span><button type="button" class="mini" role="switch" aria-checked="'+(!P.nocues)+'" aria-labelledby="cuel" data-cues data-fk="kb:cues">'+(P.nocues?"Off":"On")+'</button></div><p class="kbf">Shortcuts pause while you type in a box. Moving a meal has no button: dragging, or lifting with Space (decision 6, with a keyboard way to drag).</p></div></div>'}
function settingsHtml(){var h='<div class="kb" id="kb"><div class="kbc" role="dialog" aria-modal="true" aria-labelledby="kbt" style="width:min(560px,calc(100vw - 48px))"><div class="kbh"><h2 id="kbt">Meal planning</h2><button class="x" data-close aria-label="Close ('+P.mod+' Enter)" data-fk="kb:x">&times;</button></div><p>Usual days off cooking. Each week starts with these blocked. Repeating days are set only here; the board changes one week at a time.</p>';
 ["Sam","Jane"].forEach(function(p){h+='<div class="lbl">'+(p==="Sam"?"You (Sam)":"Jane · only Jane can change")+'</div><div class="stl">'+DN.map(function(d){return '<button '+(p!=="Sam"?"disabled":'data-stl="'+d+'"')+' aria-pressed="'+(S.stencil[p].indexOf(d)>-1)+'" data-fk="stl:'+p+d+'">'+d+'</button>'}).join("")+'</div>'});
 return h+'<div class="lbl">Categories</div><div class="ing"><span class="nm">🔒 Leftovers</span><button class="mini" disabled>Rename</button></div><p class="hint" style="margin-left:0">Rename it to anything. It can never be deleted, and the app still treats it as Leftovers.</p></div></div>'}
function toastHtml(){return S.toast?'<div class="toast" role="status"><span>'+S.toast.msg+'</span>'+(S.toast.undo?'<button data-act="undo" data-fk="toast:undo">Undo <span class="kbd">Z</span></button>':"")+'</div>':""}

var TT=null,NT=null,SYT=null;
function openLane(){return !!(S.sel||S.ing||S.laneOpen)}
P.render=function(){var root=document.getElementById("root");if(!root)return;
 var ae=document.activeElement,fk=ae&&ae.closest?(ae.closest("[data-fk]")||{}).dataset:null;fk=fk&&fk.fk;
 var sy=window.scrollY,pn=q("#panel"),pt=pn?pn.scrollTop:0,hs=q("[data-hscroll]"),hl=hs?hs.scrollLeft:0;
 var L=P.layout,l2=L.lane2?L.lane2():"",lane=L.lane===false?"":'<aside class="panel" id="panel" aria-label="'+laneAria()+'" tabindex="-1"><div class="rz" id="rz" role="separator" aria-orientation="vertical" aria-label="Resize the side panel" tabindex="0" aria-valuenow="'+(laneW())+'" aria-valuemin="320" aria-valuemax="560" data-fk="rz"></div>'+laneBody()+'</aside>'+l2;
 var cls="app"+(l2?" has-lane2":"")+(openLane()?" lane-open":"")+(L.lane===false?" nolane":"")+(S.drag?" is-drag":"");
 root.innerHTML='<div class="'+cls+'" id="app"'+(S.laneW?' style="--lane:'+S.laneW+'px"':"")+'>'+railHtml()+'<main class="main" id="main" tabindex="-1">'+headHtml()+(S.loading?L.skeleton():L.main())+'</main>'+lane+'</div>'+menuHtml()+(S.help?helpHtml():S.settings?settingsHtml():"")+toastHtml()+'<div class="live" id="live" role="status" aria-live="polite"></div>';
 window.scrollTo(0,sy);pn=q("#panel");if(pn)pn.scrollTop=pt;hs=q("[data-hscroll]");if(hs)hs.scrollLeft=hl;
 if(L.after)L.after();
 if(L.overlayAfter)L.overlayAfter();
  if(S.tip){var te=q(S.tip);if(te)te.classList.add("tipshow")}
 paintDrag();placeMenu();
 if(S.help||S.settings){var f=q(".kbc .x");if(f&&!S._focusDone){f.focus();S._focusDone=true}}else S._focusDone=false;
 if(fk&&!S._skipFocus){var el=q('[data-fk="'+fk.replace(/"/g,'\\"')+'"]');if(el&&el!==document.activeElement)el.focus({preventScroll:true})}
 S._skipFocus=false;
 syncUrl();armNudge()};
function laneW(){return S.laneW||parseInt(getComputedStyle(document.documentElement).getPropertyValue("--lane"))||400}
function say(t){var l=q("#live");if(l)l.textContent=t}
function syncUrl(){try{var u=new URL(location.href);var set=function(k,v,d){if(v===null||v===undefined||v===d)u.searchParams.delete(k);else u.searchParams.set(k,v)};set("week",iso(dt(S.wk,0)),iso(dt(DEFWK,0)));set("view",S.view,"mine");set("sel",S.sel,null);set("ing",S.ing,null);set("day",P.layout.useDay?S.day:null,null);history.replaceState(null,"",u)}catch(e){}}

/* ---------------- state changes ---------------- */
function snap(){return JSON.stringify([S.cards,S.ov,S.copied,S.list])}
function restore(j){var a=JSON.parse(j);S.cards=a[0];S.ov=a[1];S.copied=a[2];S.list=a[3]}
function pushUndo(){S.undo.push(snap());if(S.undo.length>20)S.undo.shift()}
function toast(msg,undo){S.toast={msg:msg,undo:!!undo};clearTimeout(TT);TT=setTimeout(function(){S.toast=null;P.render()},6000)}
function guard(){if(offline()){toast("Offline. Changes are paused until you are back.");P.render();return true}if(weekRo()){return true}return false}
function pulseSync(){if(offline())return;S.sync="syncing";clearTimeout(SYT);SYT=setTimeout(function(){S.sync="live";S.lastSync="12:42";P.render()},1100)}
function setWk(n){S.wk=Math.max(WMIN,Math.min(WMAX,n));S.sel=null;S.ing=null;S.menu=null;S.wkpick=false;S.nudge=false;S.nudgeDone=false;if(P.layout.onWeek)P.layout.onWeek();P.render();say("Week of "+dstr(S.wk,0)+", "+labelW(S.wk))}
function select(id,opts){var c=card(id);if(!c)return;S.sel=id;S.ing=null;S.cur={day:c.day};S.day=c.day;S.menu=null;S.nudge=false;if(opts&&opts.focus)S._focusId=id;P.render();if(opts&&opts.say)say(R[c.r].n+", "+c.day+", "+meta(c))}
function deselect(){S.sel=null;S.ing=null;S.laneOpen=false;S.menu=null;P.render()}
function setView(v){S.view=v;S.sel=null;S.ing=null;P.render();say("Showing "+(v==="mine"?"Mine":v==="all"?"Everyone":v))}
function removeCard(id,block){var c=card(id);if(!c||!me(c)||guard())return;pushUndo();S.cards=S.cards.filter(function(x){return x.id!==id});if(block)S.ov[okey(c.day,ME,c.wk)]=true;if(S.sel===id)S.sel=null;toast((block?"Removed "+esc(lbl(c))+" and marked "+c.day+" not cooking.":"Replanned "+c.day+": "+esc(lbl(c))+" removed, the night is open.")+" ",true);pulseSync();P.render();say("Removed")}
function holdCard(id){var c=card(id);if(!c||!me(c)||guard())return;if(!c.res&&conflicts(c).length)return;pushUndo();c.res=!c.res;toast((c.res?"Held ":"Released ")+esc(lbl(c))+" "+c.day+".",true);pulseSync();P.render()}
function moveCard(id,d,copy){var c=card(id);if(!c||guard())return;pushUndo();var from=c.day;if(copy){var n=JSON.parse(JSON.stringify(c));n.day=d;n.id=c.id+"-copy"+Date.now()%1000;n.res=false;S.cards.push(n);S.sel=n.id}else{c.day=d;if(S.ov[okey(d,ME,c.wk)]===true||(isBlocked(d,ME,c.wk)&&S.view==="mine"))S.ov[okey(d,ME,c.wk)]=false;S.sel=c.id}
 S.cur={day:d};S.day=d;var fx=riskAt(c,cdate(c));toast((copy?"Copied ":"Moved ")+esc(lbl(c))+" "+(copy?"to ":"from "+from+" to ")+d+"."+(risk(c).length===0&&fx.length===0&&from!==d&&false?"":"")+" ",true);pulseSync();P.render();say((copy?"Copied":"Moved")+" to "+DF[DN.indexOf(d)])}
function blockDay(d){if(guard())return;pushUndo();var cs=S.cards.filter(function(c){return c.wk===S.wk&&c.day===d&&me(c)});S.cards=S.cards.filter(function(c){return !(c.wk===S.wk&&c.day===d&&me(c))});S.ov[okey(d,ME)]=true;S.sel=null;toast("Not cooking "+DF[DN.indexOf(d)]+", this week only. Usual days are set in Settings. ",true);pulseSync();P.render()}
function unblockDay(d){if(guard())return;pushUndo();var usual=S.stencil.Sam.indexOf(d)>-1;if(usual)S.ov[okey(d,ME)]=false;else delete S.ov[okey(d,ME)];toast(DF[DN.indexOf(d)]+": cooking this week. ",true);P.render()}
function addList(i,id){if(guard())return;var c=card(id);pushUndo();if(c&&c["l_"+i])delete c["l_"+i];else if(S.list[i])delete S.list[i];else{if(c)c["l_"+i]=true;else S.list[i]=true}P.render()}
function addAll(){if(guard())return;pushUndo();var n=0;shopping().forEach(function(x){if(!x.list){S.list[x.name]=true;n++}});toast("Added "+n+" to the shopping list. ",true);pulseSync();P.render()}
function addMissing(id){var c=card(id);if(!c||guard())return;pushUndo();missing(c).forEach(function(i){S.list[i]=true});toast("Added "+missing(c).length+" for "+esc(lbl(c))+" to the shopping list. ",true);P.render()}
function setPpl(id,d){var c=card(id);if(!c||guard())return;pushUndo();c.n=Math.max(1,Math.min(8,c.n+d));P.render()}
function undo(){var j=S.undo.pop();if(!j){toast("Nothing to undo.");P.render();return}restore(j);S.toast=null;if(S.sel&&!card(S.sel))S.sel=null;P.render();say("Undone")}
function copyLast(){if(guard())return;pushUndo();if(S.copied[S.wk]){S.cards=S.cards.filter(function(c){return !(c.wk===S.wk&&c.fromCopy)});S.copied[S.wk]=false;toast("Cleared what Copy last week added. ",true)}else{var LAST=[["Mon","shak","all",2],["Tue","rice","all",2],["Wed","pasta","Sam",1],["Thu","fritt","all",2],["Fri","soup","all",2]],sk=[];LAST.forEach(function(l){if(isBlocked(l[0],ME)){sk.push(l[0]);return}if(S.cards.some(function(c){return c.wk===S.wk&&c.day===l[0]&&c.r===l[1]&&me(c)}))return;var n=mkCard(S.wk,l[0],l[1],ME,l[2]==="all"?"all":ME,l[3],{fromCopy:true});S.cards.push(n)});S.copied[S.wk]=true;toast("Copied last week."+(sk.length?" Skipped "+sk.join(", ")+" (usual day off). ":" "),true)}pulseSync();P.render()}
function refresh(){if(offline()){S.sync="syncing";P.render();clearTimeout(SYT);SYT=setTimeout(function(){S.sync="offline";toast("Still offline.");P.render()},900);return}S.sync="syncing";P.render();clearTimeout(SYT);SYT=setTimeout(function(){S.sync="live";S.lastSync="12:42";P.render()},1000);say("Refreshing")}
function assistant(){S.nudge=false;S.nudgeDone=true;toast("Opening your default AI app. (Mockup: nothing opens.) ");P.render()}
function canNudge(){return S.view==="mine"&&!weekRo()&&!S.sel&&!S.toast&&!S.nudge&&!S.nudgeDone&&!S.loading&&DN.some(function(d){return !isBlocked(d,ME)&&!S.cards.some(function(c){return c.wk===S.wk&&c.day===d&&me(c)})})&&S.cards.filter(function(c){return c.wk===S.wk}).length===0}
function armNudge(){clearTimeout(NT);if(canNudge())NT=setTimeout(function(){if(canNudge()){S.nudge=true;S.nudgeDone=true;P.render()}},5000)}

/* ---------------- keyboard nav: stops are meals, or an empty night ---------------- */
function stops(){var out=[];DN.forEach(function(d){var cs=dayCards(d);if(cs.length)cs.forEach(function(c){out.push({day:d,id:c.id})});else out.push({day:d,slot:true})});return out}
function curStop(){var st=stops();if(S.sel){var k=st.findIndex(function(s){return s.id===S.sel});if(k>-1)return k}if(S.cur){var j=st.findIndex(function(s){return s.day===S.cur.day});if(j>-1)return j}return -1}
function goStop(s){if(!s)return;if(s.id){S._focusFk="card:"+s.id;select(s.id,{say:true})}else{S.sel=null;S.cur={day:s.day};S.day=s.day;S._focusFk="slot:"+s.day;P.render();say(DF[DN.indexOf(s.day)]+", nothing planned")}
 var el=q('[data-fk="'+S._focusFk+'"]');if(el){el.focus({preventScroll:true});el.scrollIntoView({block:"nearest",inline:"nearest"})}}
function navKey(dx,dy,flat){var st=stops(),k=curStop();
 if(P.layout.dayNav&&dx){var di0=Math.max(0,Math.min(6,DN.indexOf(S.cur&&S.cur.day||S.day)+dx));S.day=DN[di0];S.cur={day:S.day};S.sel=null;S.ing=null;P.render();var te=q('[data-fk="tab:'+S.day+'"]');if(te)te.focus({preventScroll:true});say(DF[di0]);return}if(k<0){goStop(st[0]);return}var c=st[k];
 if(flat||P.layout.flat){var n=dy||dx;goStop(st[Math.max(0,Math.min(st.length-1,k+n))]);return}
 if(dy){var same=st.filter(function(s){return s.day===c.day}),j=same.indexOf(c);goStop(same[Math.max(0,Math.min(same.length-1,j+dy))]);return}
 var di=DN.indexOf(c.day)+dx;if(di<0||di>6)return;var same2=st.filter(function(s){return s.day===DN[di]}),j2=st.filter(function(s){return s.day===c.day}).indexOf(c);goStop(same2[Math.min(same2.length-1,Math.max(0,j2))])}

/* ---------------- drag and lift ---------------- */
function paintDrag(){var d=S.drag;document.body.classList.toggle("dragging",!!d);
 qa("[data-drop-day]").forEach(function(z){z.classList.remove("drop-ok","drop-fix","drop-no");var h=q(".dh-hint",z);if(h){h.textContent="";h.className="dh-hint"}});
 var og=q("#ghost");if(og)og.remove();if(!d)return;
 var c=card(d.id);if(!c)return;
 qa("[data-drop-day]").forEach(function(z){var day=z.dataset.dropDay,ok=canDrop(c,day),fx=dayFix(c,day),h=q(".dh-hint",z);
  if(!ok&&day!==c.day){z.classList.add("drop-no")}
  if(h&&day!==c.day){h.textContent=ok?fx.txt:"not allowed";h.className="dh-hint "+(ok?fx.cls:"bad")}
  if(d.over===day&&ok)z.classList.add(fx.cls==="fix"?"drop-fix":"drop-ok")});
 var src=q('[data-cw="'+c.id+'"]'),zone=d.over?q('[data-drop-day="'+d.over+'"]'):null;
 var g=document.createElement("div");g.id="ghost";g.className="dragghost";g.innerHTML=cardW(c,"ghost").replace("data-cw=","data-gw=").replace(" lifted ","  ")+(d.copy?'<span class="kb-copy">+ copy</span>':"");
 var x=d.x,y=d.y;if(x==null){var r=(zone||src||document.body).getBoundingClientRect();x=r.left+Math.max(8,(r.width-200)/2);y=r.top+(zone?Math.min(140,r.height/3):20)}else{x=x-100;y=y-24}
 g.style.left=x+"px";g.style.top=y+"px";document.body.appendChild(g);
 if(d.kb)say(DF[DN.indexOf(d.over)]+(canDrop(c,d.over)?": "+dayFix(c,d.over).txt:""));
 qa('[data-cw="'+c.id+'"]').forEach(function(e){e.classList.add("lifted")})}
function startDrag(id,x,y,copy){S.drag={id:id,over:null,x:x,y:y,copy:copy};S.menu=null;paintDrag()}
function endDrag(drop){var d=S.drag;S.drag=null;if(!d){paintDrag();return}var c=card(d.id);S.justDragged=Date.now();if(drop&&d.over&&c&&canDrop(c,d.over)){moveCard(d.id,d.over,d.copy)}else{P.render();if(!drop)say("Move cancelled")}}
function zoneAt(x,y){var e=document.elementFromPoint(x,y);return e&&e.closest?e.closest("[data-drop-day]"):null}
var PD=null;
document.addEventListener("pointerdown",function(e){if(e.button!==0||S.help||S.settings)return;var m=e.target.closest&&e.target.closest(".mcw.mine .mc");if(!m||e.target.closest(".ra"))return;PD={id:m.dataset.card,x:e.clientX,y:e.clientY,on:false}});
document.addEventListener("pointermove",function(e){if(!PD)return;if(!PD.on){if(Math.abs(e.clientX-PD.x)+Math.abs(e.clientY-PD.y)<8)return;PD.on=true;startDrag(PD.id,e.clientX,e.clientY,e.altKey)}
 var d=S.drag;if(!d)return;d.x=e.clientX;d.y=e.clientY;d.copy=e.altKey;var z=zoneAt(e.clientX,e.clientY),day=z?z.dataset.dropDay:null;var g=q("#ghost");if(g){g.style.left=(e.clientX-100)+"px";g.style.top=(e.clientY-24)+"px";var k=q(".kb-copy",g);if(e.altKey&&!k){var s=document.createElement("span");s.className="kb-copy";s.textContent="+ copy";g.appendChild(s)}else if(!e.altKey&&k)k.remove()}
 if(day!==d.over){d.over=day;var gx=d.x,gy=d.y;paintDragKeep(gx,gy)}});
function paintDragKeep(x,y){var d=S.drag;if(!d)return;paintDrag();var g=q("#ghost");if(g){g.style.left=(x-100)+"px";g.style.top=(y-24)+"px"}}
document.addEventListener("pointerup",function(e){if(!PD)return;var was=PD.on;PD=null;if(was)endDrag(true)});
document.addEventListener("click",function(e){if(S.justDragged&&Date.now()-S.justDragged<350){e.stopPropagation();e.preventDefault()}},true);

/* ---------------- events ---------------- */
function placeMenu(){var m=q("#cm");if(!m||!S.menu)return;var r=m.getBoundingClientRect(),x=S.menu.x,y=S.menu.y;if(x+r.width>innerWidth-8)x=innerWidth-r.width-8;if(y+r.height>innerHeight-8)y=Math.max(8,innerHeight-r.height-8);m.style.left=x+"px";m.style.top=y+"px";var f=m.querySelector("button:not(:disabled)");if(f&&S.menu.focus){f.focus();S.menu.focus=false}}
function openMenuFor(id,x,y,focus){S.menu={kind:"card",id:id,x:x,y:y,focus:focus};S.sel=id;S.cur={day:card(id).day};S.day=card(id).day;P.render()}
document.addEventListener("click",function(e){var t=e.target,x;
 if(!t.closest)return;
 if(S.menu&&!t.closest(".cm")){S.menu=null;if(!t.closest("[data-act=more]")){P.render()}}
 if(S.wkpick&&!t.closest(".wkpick")){S.wkpick=false;P.render()}
 if(x=t.closest("[data-mi]")){menuAct(x.dataset.mi);return}
 if(x=t.closest("[data-wkpick]")){setWk(Number(x.dataset.wkpick));return}
 if(x=t.closest("[data-wk]")){setWk(S.wk+Number(x.dataset.wk));return}
 if(x=t.closest("[data-view]")){setView(x.dataset.view);return}
 if(x=t.closest("[data-stl]")){pushUndo();var a=S.stencil.Sam,d=x.dataset.stl,k=a.indexOf(d);if(k>-1)a.splice(k,1);else a.push(d);P.render();return}
 if(t.closest("[data-cues]")){P.nocues=!P.nocues;try{localStorage.setItem("desktop-cues",P.nocues?"0":"1")}catch(e){}document.body.classList.toggle("nocues",P.nocues);P.render();return}
 if(x=t.closest("[data-toggle]")){S.tog=S.tog||{};S.tog[x.dataset.toggle]=!S.tog[x.dataset.toggle];P.render();return}
 if(x=t.closest("[data-pickday]")){S.day=x.dataset.pickday;S.cur={day:S.day};S.sel=null;S.ing=null;S.menu=null;P.render();say(DF[DN.indexOf(S.day)]);return}
 if(x=t.closest("[data-unblock]")){unblockDay(x.dataset.unblock);return}
 if(x=t.closest("[data-block]")){blockDay(x.dataset.block);return}
 if(t.closest("[data-close]")){closeTop();return}
 if(x=t.closest("[data-act]")){var a2=x.dataset.act,id=x.dataset.id;
  if(a2==="hold")holdCard(id||S.sel);else if(a2==="replan")removeCard(id||S.sel,false);else if(a2==="more"){var r=x.getBoundingClientRect();if(S.menu&&S.menu.id===id){S.menu=null;P.render()}else openMenuFor(id,r.left,r.bottom+4,true)}
  else if(a2==="addlist")addList(x.dataset.i,id||S.sel);else if(a2==="addall")addAll();else if(a2==="ppl")setPpl(S.sel,Number(x.dataset.d));
  else if(a2==="undo")undo();else if(a2==="copy")copyLast();else if(a2==="refresh")refresh();else if(a2==="assistant")assistant();else if(a2==="help"){S.help=true;P.render()}
  else if(a2==="settings"){S.settings=true;P.render()}else if(a2==="wkpick"){S.wkpick=!S.wkpick;P.render();if(S.wkpick){var cur=q('.pop .wk[aria-current="true"]');if(cur)cur.focus()}}
  else if(a2==="sum"){S.sel=null;S.ing=null;S.laneOpen=true;P.render()}else if(a2==="viewrec")toast("Opens the saved recipe. (Mockup: nothing opens.)");
  if(a2!=="more"&&a2!=="wkpick"&&a2!=="help"&&a2!=="settings")return}
 if(x=t.closest("[data-ing]")){S.ing=x.dataset.ing;S.sel=null;S.menu=null;P.render();return}
 if(x=t.closest("[data-card]")){if(x.closest(".sumrow")||true){select(x.dataset.card)}return}
});
document.addEventListener("dblclick",function(e){var x=e.target.closest&&e.target.closest("[data-card]");if(x){var el=q("#panel");if(el)el.focus()}});
document.addEventListener("contextmenu",function(e){var x=e.target.closest&&e.target.closest("[data-cw]"),sl=e.target.closest&&e.target.closest("[data-slot]");
 if(S.help||S.settings)return;
 if(x){e.preventDefault();openMenuFor(x.dataset.cw,e.clientX,e.clientY,true)}
 else if(sl&&!weekRo()&&sl.dataset.slot&&!sl.classList.contains("slot")===false){e.preventDefault();S.menu={kind:"day",day:sl.dataset.slot,x:e.clientX,y:e.clientY,focus:true};P.render()}});
function menuAct(a){var m=S.menu;S.menu=null;if(!m){return}
 if(m.kind==="day"){if(a==="block")blockDay(m.day);else if(a==="assistant")assistant();else P.render();return}
 var id=m.id;if(a==="open"){select(id);var p=q("#panel");if(p)p.focus()}else if(a==="hold")holdCard(id);else if(a==="addmissing")addMissing(id);else if(a==="replan")removeCard(id,false);else if(a==="notcooking")removeCard(id,true);else if(a==="assistant")assistant();else P.render()}
function closeTop(){var m=P.mod;if(S.help){S.help=false;P.render();return true}if(S.settings){S.settings=false;P.render();return true}if(S.menu){S.menu=null;P.render();return true}if(S.wkpick){S.wkpick=false;P.render();return true}
 if(S.sel||S.ing||S.laneOpen){var back=S.sel?'card:'+S.sel:null;S.sel=null;S.ing=null;S.laneOpen=false;P.render();if(back){var el=q('[data-fk="'+back+'"]');if(el)el.focus({preventScroll:true})}return true}return false}
document.addEventListener("keydown",function(e){var t=e.target,k=e.key,typing=t.closest&&t.closest("input,textarea,select,[contenteditable]");
 if(k==="Enter"&&(e.ctrlKey||e.metaKey)){if(closeTop()){e.preventDefault()}return}
 if(typing)return;
 if(S.drag&&S.drag.kb){var c=card(S.drag.id);
  if(k==="Escape"){e.preventDefault();endDrag(false);return}
  if(k===" "||k==="Enter"){e.preventDefault();endDrag(true);return}
  if(k==="ArrowLeft"||k==="ArrowRight"){e.preventDefault();var i=DN.indexOf(S.drag.over||c.day),dir=k==="ArrowRight"?1:-1;for(var n=i+dir;n>=0&&n<7;n+=dir){if(canDrop(c,DN[n])){S.drag.over=DN[n];S.drag.x=null;paintDrag();break}}return}
  return}
 if(S.drag&&k==="Escape"){endDrag(false);return}
 if(S.help||S.settings){if(k==="Escape"){}return}
 if(S.menu){var items=qa("#cm button:not(:disabled)"),ix=items.indexOf(document.activeElement);
  if(k==="Escape"){e.preventDefault();S.menu=null;P.render();return}
  if(k==="ArrowDown"){e.preventDefault();items[(ix+1)%items.length].focus();return}
  if(k==="ArrowUp"){e.preventDefault();items[(ix-1+items.length)%items.length].focus();return}
  return}
 if(S.wkpick){var wk=qa(".pop .wk"),wi=wk.indexOf(document.activeElement);
  if(k==="Escape"){e.preventDefault();S.wkpick=false;P.render();var b=q('[data-fk="hdr:title"]');if(b)b.focus();return}
  if(k==="ArrowDown"){e.preventDefault();wk[Math.min(wk.length-1,wi+1)].focus();return}
  if(k==="ArrowUp"){e.preventDefault();wk[Math.max(0,wi-1)].focus();return}
  return}
 if(e.ctrlKey||e.metaKey||e.altKey)return;
 var onBtn=t.closest&&t.closest("button")&&!t.closest("[data-card],[data-slot]");
 var sel=S.sel?card(S.sel):null;
 if(k==="ArrowLeft"||k==="ArrowRight"){if(onBtn&&t.closest(".seg,.rz"))return;if(t.closest&&t.closest("#rz"))return;e.preventDefault();navKey(k==="ArrowRight"?1:-1,0);return}
 if(k==="ArrowDown"||k==="j"){if(t.closest&&t.closest("#panel")&&k!=="j")return;if(t.closest&&t.closest("#panel"))return;e.preventDefault();navKey(0,1);return}
 if(k==="ArrowUp"||k==="k"){if(t.closest&&t.closest("#panel"))return;e.preventDefault();navKey(0,-1);return}
 if(k==="Home"||k==="End"){var st=stops();e.preventDefault();goStop(k==="Home"?st[0]:st[st.length-1]);return}
 if(k==="Enter"){if(onBtn)return;if(sel){e.preventDefault();var p=q("#panel");if(!openLane()||!p)return;if(!p.contains(document.activeElement)){p.focus();var f=q("#panel button:not(:disabled)");if(f)f.focus()}else{}}return}
 if(k===" "&&sel&&me(sel)&&!roCard(sel)&&(t.closest("[data-card]"))){e.preventDefault();S.drag={id:sel.id,over:sel.day,kb:true,x:null};paintDrag();say("Lifted "+lbl(sel)+". Left and right arrows to carry, Space to drop, Escape to cancel.");return}
 if(k==="Escape"){if(S.menu||S.wkpick)return;return}
 if(k==="?"){S.help=true;P.render();return}
 if(k==="h"||k==="H"){if(sel)holdCard(sel.id);return}
 if(k==="x"||k==="X"||k==="Delete"||k==="Backspace"){if(sel){e.preventDefault();removeCard(sel.id,e.shiftKey)}return}
 if(k==="b"||k==="B"){var d=sel?sel.day:S.cur&&S.cur.day;if(d&&!weekRo()){if(isBlocked(d,ME)&&!dayCards(d).length)unblockDay(d);else blockDay(d)}return}
 if(k==="l"||k==="L"){if(sel)addMissing(sel.id);return}
 if(k==="z"||k==="Z"){undo();return}
 if(k==="["||k==="PageUp"){e.preventDefault();setWk(S.wk-1);return}
 if(k==="]"||k==="PageDown"){e.preventDefault();setWk(S.wk+1);return}
 if(k==="t"||k==="T"){setWk(CURWK);return}
 if(k==="w"||k==="W"){S.wkpick=true;P.render();var cu=q('.pop .wk[aria-current="true"]');if(cu)cu.focus();return}
 if(k==="1"){setView("mine");return}
 if(k==="2"){setView("all");return}
 if(/^[3-9]$/.test(k)&&S.people[+k-3]){setView(S.people[+k-3]);return}
 if(k==="c"||k==="C"){copyLast();return}
 if(k==="a"||k==="A"){assistant();return}
 if(k==="r"||k==="R"){refresh();return}
 if(k==="s"||k==="S"){S.settings=true;P.render();return}
 if(k==="m"||k==="M"){var f1=q("#main .mc");if(f1){e.preventDefault();f1.focus();f1.scrollIntoView({block:"nearest"})}return}
 if(k==="i"||k==="I"){if(P.layout.toggleLane){S.laneOpen=!S.laneOpen;if(!S.laneOpen){S.sel=null;S.ing=null}P.render()}return}
});
/* hovering a use-by row lights the nights that would fix it */
document.addEventListener("mouseover",function(e){var h=e.target.closest&&e.target.closest("[data-hl]");qa("[data-drop-day].hl").forEach(function(z){z.classList.remove("hl")});if(h){h.dataset.hl.split(",").forEach(function(d){qa('[data-drop-day="'+d+'"]').forEach(function(z){z.classList.add("hl")})})}});
document.addEventListener("focusin",function(e){var h=e.target.closest&&e.target.closest("[data-hl]");qa("[data-drop-day].hl").forEach(function(z){z.classList.remove("hl")});if(h){h.dataset.hl.split(",").forEach(function(d){qa('[data-drop-day="'+d+'"]').forEach(function(z){z.classList.add("hl")})})}});
/* trackpad: two-finger sideways swipe over the page steps the week (not where a pane scrolls sideways) */
var WX=0,WT=0;
document.addEventListener("wheel",function(e){if(Math.abs(e.deltaX)<=Math.abs(e.deltaY)||e.target.closest&&e.target.closest("[data-hscroll],.panel,.segl"))return;var now=Date.now();if(now-WT>500)WX=0;WT=now;WX+=e.deltaX;if(Math.abs(WX)>160){var dir=WX>0?1:-1;WX=0;WT=now+700;setWk(S.wk+dir)}},{passive:true});
/* resize the lane: drag the edge, or focus it and use the arrow keys; double-click resets */
(function(){var on=false;document.addEventListener("pointerdown",function(e){var r=e.target.closest&&e.target.closest("#rz");if(!r)return;on=true;r.classList.add("on");r.setPointerCapture&&r.setPointerCapture(e.pointerId);e.preventDefault()});
 document.addEventListener("pointermove",function(e){if(!on)return;var w=Math.max(320,Math.min(560,innerWidth-e.clientX));var a=q("#app");if(a)a.style.setProperty("--lane",w+"px");S.laneW=w});
 document.addEventListener("pointerup",function(){if(on){on=false;var r=q("#rz");if(r)r.classList.remove("on");P.render()}});
 document.addEventListener("keydown",function(e){if(e.target.id!=="rz")return;var d=e.key==="ArrowLeft"?16:e.key==="ArrowRight"?-16:0;if(d){e.preventDefault();S.laneW=Math.max(320,Math.min(560,laneW()+d));S._skipFocus=false;P.render()}});
 document.addEventListener("dblclick",function(e){if(e.target.id==="rz"){S.laneW=null;P.render()}})})();

function leftoverPortions(c){var x=S.cards.filter(function(o){return o.wk===c.wk&&R[o.r].from===c.r});return x.reduce(function(a,o){return a+o.n},0)}
/* viewport-specific behaviour lives in its own file, fetched only when the media query matches (and again if the window grows into it) */
var LOADED={};
P.vpScript=function(query,src){var m=window.matchMedia(query),go=function(){if(m.matches&&!LOADED[src]){LOADED[src]=1;var s=document.createElement("script");s.src=src;s.onload=function(){P.render()};document.head.appendChild(s)}else P.render()};m.addEventListener("change",go);if(m.matches)go()};
P.sumLane=function(){return '<aside class="panel p2" id="panel2" aria-label="Week summary">'+P.sumHtml()+'</aside>'};
/* ---------------- start ---------------- */
P.S=function(){return S};P.u={dtEnd:function(){return dt(S.wk,6)},leftoverPortions:leftoverPortions,DN:DN,DF:DF,q:q,qa:qa,esc:esc,dstr:dstr,dt:dt,cardW:cardW,dayStack:dayStack,dayHeadTxt:dayHeadTxt,dayCards:dayCards,scopeCards:scopeCards,I:I,R:R,STOCK:STOCK,ings:ings,missing:missing,onhand:onhand,risk:risk,qty:qty,shopping:shopping,risks:risks,status:status,lbl:lbl,meta:meta,ubText:ubText,srcOf:srcOf,pill:pill,avatar:avatar,isBlocked:isBlocked,labelW:labelW,onList:onList,roCard:roCard,weekRo:weekRo,ME:ME,CURWK:CURWK,pastCard:pastCard,cdate:cdate,TODAYD:TODAYD,fmtN:fmtN,select:select,deselect:deselect};
P.start=function(layout){P.layout=layout;if(Q.get("vp")&&Q.get("embed")!=="1")return;
 var wk=Q.get("week");if(wk){for(var w=WMIN;w<=WMAX;w++)if(iso(dt(w,0))===wk)S.wk=w}
 var v=Q.get("view");if(v==="all"||v==="mine"||S.people.indexOf(v)>-1)S.view=v;
 if(Q.get("sel")&&card(Q.get("sel")))S.sel=Q.get("sel");
 if(Q.get("ing"))S.ing=Q.get("ing");
 S.day=Q.get("day")||(S.wk===CURWK?"Sat":"Wed");S.cur={day:S.day};
 if(layout.init)layout.init(S,Q);
 var st=Q.get("state");
 if(st==="empty"){S.wk=2;S.sel=null}
 if(st==="loading")S.loading=true;
 if(st==="offline")S.sync="offline";
 if(st==="syncing")S.sync="syncing";
 if(st==="assistant"){S.sync="ai";S.fresh="wed-curry"}
 if(st==="past"){S.wk=-1;S.sel=null}
 if(st==="today"){S.wk=0}
 if(Q.get("nudge")==="1"||st==="empty"&&Q.get("nudge")!=="0"&&false){S.nudge=true;S.nudgeDone=true}
 if(Q.get("lane")==="1")S.laneOpen=true;
 if(Q.get("exp")==="1"){S.tog=S.tog||{};S.tog.rest=true}
 if(Q.get("lw"))S.laneW=Math.max(320,Math.min(560,+Q.get("lw")));
 if(Q.get("help")==="1")S.help=true;
 if(Q.get("settings")==="1")S.settings=true;
 if(Q.get("picker")==="1")S.wkpick=true;
 if(Q.get("tip"))S.tip=Q.get("tip");
 if(Q.get("toast")==="1"){S.undo.push(snap());S.toast={msg:"Moved Chicken curry from Wed to Tue. ",undo:true}}
 if(Q.get("drag")&&card(Q.get("drag"))){S.drag={id:Q.get("drag"),over:Q.get("over")||null,x:null,copy:Q.get("copy")==="1",kb:Q.get("kb")==="1"}}
 if(Q.get("menu")&&card(Q.get("menu"))){S.menu={kind:"card",id:Q.get("menu"),x:+Q.get("mx")||0,y:+Q.get("my")||0,focus:false,auto:true}}
 if(Q.get("embed")==="1")document.documentElement.dataset.embed="1";
 document.body.classList.toggle("nocues",!!P.nocues);
 P.render();
 if(S.menu&&S.menu.auto&&!(+Q.get("mx"))){var cw=q('[data-cw="'+S.menu.id+'"]');if(cw){var r=cw.getBoundingClientRect();S.menu.x=r.left+Math.min(80,r.width/2);S.menu.y=r.top+r.height*0.6;P.render()}}
 var fd=Q.get("focus");if(fd){var el=q('[data-fk="'+fd+'"]');if(el)el.focus()}
 window.addEventListener("resize",function(){placeMenu()})}
})();
