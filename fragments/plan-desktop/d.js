/* Option D: cook sheet. Rows are ingredients, columns are days; the header holds each day's meals (and is the drop target). Shows what the week shares, what must be used first, what to buy and by when, and the leftovers chain.
   Idle lane = prep ahead and shop by day. Below 1440 the lane overlays (d-overlay.js, fetched only then). */
(function(){var P=PLAN,u=P.u,DN=u.DN,DF=u.DF,I=u.I,esc=u.esc,ST=u.STOCK;
function rows(){var S=P.S(),map={},list=[],end=u.dtEnd();
 u.scopeCards().filter(function(c){return !u.pastCard(c)&&u.ings(c).length}).forEach(function(c){u.ings(c).forEach(function(i){if(!map[i]){map[i]={name:i,uses:[]};list.push(map[i])}map[i].uses.push(c)})});
 list.forEach(function(r){var s=ST[r.name];r.st=s;r.ub=s&&s.ub?new Date(s.ub+"T00:00:00"):null;r.uses.sort(function(a,b){return DN.indexOf(a.day)-DN.indexOf(b.day)});r.first=DN.indexOf(r.uses[0].day);
  r.g=!s?"buy":(r.ub&&r.ub<=end)?"first":r.uses.length>1?"shared":"rest"});
 return list}
function sortG(g,a){if(g==="first")return a.sort(function(x,y){return x.ub-y.ub});if(g==="buy")return a.sort(function(x,y){return x.first-y.first});if(g==="shared")return a.sort(function(x,y){return y.uses.length-x.uses.length});return a.sort(function(x,y){return x.name<y.name?-1:1})}
function cell(r,k){var S=P.S(),d=DN[k],date=u.dt(S.wk,k),us=r.uses.filter(function(c){return c.day===d}),h='',after=r.ub&&date>r.ub,ubm=r.ub&&u.dt(S.wk,k).getTime()===r.ub.getTime();
 us.forEach(function(c){var bad=u.risk(c).indexOf(r.name)>-1;h+='<button class="use'+(!r.st?" miss":"")+(bad?" bad":"")+(c.res?" held":"")+(S.sel===c.id?" sel":"")+'" data-card="'+c.id+'" data-fk="cell:'+c.id+':'+esc(r.name)+'" aria-label="'+esc(r.name)+' '+u.qty(r.name,c.n)+' for '+esc(u.lbl(c))+' on '+DF[k]+(bad?', after its use-by':'')+(!r.st?', missing':'')+'" data-tip="'+esc(u.lbl(c))+'">'+(u.qty(r.name,c.n)||"•")+'</button>'});
 if(ubm)h+='<span class="ubm" title="Use by">'+I.clock+'use by</span>';
 if(!r.st&&k===r.first-1)h+='<span class="buym" title="Buy by this day">'+I.cart+'buy by</span>';
 return '<div class="cs-cell'+(after?" after":"")+'" data-drop-day="'+d+'">'+h+'</div>'}
function label(r){var sub=r.st?esc(r.st.q)+(r.ub?' · use by '+u.ubText(r.name):""):"buy by "+(r.first===0?"Sun":DN[r.first-1]);var on=P.S().ing===r.name;
 return '<button class="cs-lab'+(on?" sel":"")+'" data-ing="'+esc(r.name)+'" data-fk="ing:'+esc(r.name)+'"><b>'+esc(r.name)+'</b><small>'+sub+'</small></button>'}
function chain(){var S=P.S(),h="";u.scopeCards().forEach(function(c){var from=u.R[c.r].from;if(!from)return;var src=S.cards.filter(function(o){return o.wk===c.wk&&o.r===from})[0];if(!src)return;var a=DN.indexOf(src.day),b=DN.indexOf(c.day);
 h+='<div class="cs-lab chain-l"><b>Leftovers</b><small>cook once, eat twice</small></div><div class="chain" style="grid-column:'+(a+2)+' / '+(b+3)+'"><span>'+u.R[src.r].e+' '+esc(u.lbl(src))+' · cook for '+(src.n+u.leftoverPortions(src))+'</span><i>→</i><span>'+u.R[c.r].e+' '+esc(DN[b])+'</span></div>'});return h}
var GL={first:["Use first","goes off this week"],buy:["To buy","not in the pantry"],shared:["Shared","used by two or more meals"],rest:["Everything else","on hand, used once"]};
function sheet(){var S=P.S(),rs=rows(),h='<div class="cs-scroll" data-hscroll tabindex="-1"><div class="cs" role="table" aria-label="Cook sheet">';
 h+='<div class="cs-corner"><b>Ingredients</b><small>by day</small></div>';
 DN.forEach(function(d){var hd=u.dayHeadTxt(d);h+='<div class="dcol'+(hd.today?" is-today":"")+'" data-day="'+d+'" data-drop-day="'+d+'" role="columnheader" aria-label="'+hd.full+' '+hd.date+'"><div class="dhh"><b>'+d+'</b><span>'+hd.date.split(" ")[0]+'</span>'+(hd.today?'<span class="today">Today</span>':"")+'<span class="dh-hint"></span></div><div class="dstack">'+u.dayStack(d,"chip")+'</div></div>'});
 var ch=chain();if(ch)h+=ch;
 ["first","buy","shared","rest"].forEach(function(g){var a=sortG(g,rs.filter(function(r){return r.g===g}));if(!a.length)return;
  var coll=g==="rest"&&!(S.tog&&S.tog.rest);
  h+='<div class="cs-g"><h3>'+GL[g][0]+' <span class="n">'+a.length+'</span></h3><span>'+GL[g][1]+'</span>'+(g==="rest"?'<button class="mini" data-toggle="rest" aria-expanded="'+!coll+'" data-fk="tog:rest">'+(coll?"Show":"Hide")+'</button>':"")+'</div>';
  if(coll)return;
  a.forEach(function(r){h+=label(r);for(var k=0;k<7;k++)h+=cell(r,k)})});
 return h+'</div></div>'}
function prep(){var S=P.S(),sh=u.shopping(),h='<div class="idle-title"><h2>Prep ahead and shop by day</h2><p>Week of '+u.dstr(S.wk,0)+'</p></div>',by={};
 rows().filter(function(r){return r.g==="buy"}).forEach(function(r){var k=r.first===0?"Sunday":DF[r.first-1];(by[k]=by[k]||[]).push(r)});
 h+='<section class="sumsec"><h3>Shop by day</h3>';var ks=Object.keys(by);if(!ks.length)h+='<div class="sumok">Nothing to buy.</div>';
 ks.forEach(function(k){h+='<div class="sumrow"><span class="nm"><b style="font-weight:700">By '+k+'</b><span class="sub">'+by[k].map(function(r){return esc(r.name)+" (for "+r.uses[0].day+(r.uses.length>1?", "+r.uses.slice(1).map(function(c){return c.day}).join(", "):"")+")"}).join(" · ")+'</span></span></div>'});
 h+='</section><section class="sumsec"><h3>Cook once, use twice</h3>';var any=false;
 rows().filter(function(r){return r.uses.length>1}).slice(0,5).forEach(function(r){any=true;h+='<div class="sumrow"><span class="nm">'+esc(r.name)+'<span class="sub">'+r.uses.map(function(c){return c.day+" "+esc(u.lbl(c))}).join(", ")+'</span></span></div>'});
 u.scopeCards().forEach(function(c){var lp=u.leftoverPortions(c);if(lp){any=true;h+='<div class="sumrow"><span class="nm">'+esc(u.lbl(c))+' for '+(c.n+lp)+'<span class="sub">'+c.n+' on '+c.day+', '+lp+' reheated later. One cook, one clean-up.</span></span></div>'}});
 if(!any)h+='<div class="sumok">Nothing shared this week.</div>';
 h+='</section><section class="sumsec"><h3>Use first</h3>';var f=rows().filter(function(r){return r.g==="first"});
 f.forEach(function(r){var bad=r.uses.filter(function(c){return u.risk(c).indexOf(r.name)>-1});h+='<button class="sumrow" data-ing="'+esc(r.name)+'" data-fk="pf:'+esc(r.name)+'"><span class="nm">'+esc(r.name)+' <span class="q">use by '+u.ubText(r.name)+'</span>'+(bad.length?'<span class="sub bad">'+esc(u.lbl(bad[0]))+' is planned '+bad[0].day+', after it. Cook it earlier.</span>':'<span class="sub">planned in time</span>')+'</span></button>'});
 if(!f.length)h+='<div class="sumok">Nothing goes off before it is used.</div>';
 return h+'</section>'}
P.start({name:"d",idle:prep,idleLabel:"Prep ahead",
 skeleton:function(){return '<div class="cs-scroll"><div class="sk" style="height:120px"></div><div class="sk" style="height:300px;margin-top:10px"></div></div>'},
 main:sheet});
P.vpScript("(max-width:1439px)","d-overlay.js");
P.vpScript("(min-width:2200px)","d-2560.js");
})();
