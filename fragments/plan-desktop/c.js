/* Option C: week strip, one focused day, Pantry-style flyout. The strip is also the drop-target row. The flyout is the same panel as Pantry's item panel (right lane, pushes, x closes). */
(function(){var P=PLAN,u=P.u,DN=u.DN,I=u.I,esc=u.esc,DF=u.DF;
function bigx(c){var oh=u.onhand(c),ms=u.missing(c),h='';if(u.srcOf(c)==="left")return '';
 h+='<div class="bigx"><div class="bx"><div class="lbl">On hand</div>'+(oh.length?oh.map(function(i){var rk=u.risk(c).indexOf(i)>-1;return '<div class="bxr"><span>'+esc(i)+' <span class="q">'+u.qty(i,c.n)+'</span></span>'+(rk?'<span class="tg soon">'+I.clock+u.ubText(i)+'</span>':"")+'</div>'}).join(""):'<div class="bxr"><span class="q">nothing needed</span></div>')+'</div>';
 h+='<div class="bx"><div class="lbl">Missing</div>'+(ms.length?ms.map(function(i){var on=u.onList(c,i);return '<div class="bxr miss"><span>'+esc(i)+' <span class="q">'+u.qty(i,c.n)+'</span></span><button class="mini cart" data-act="addlist" data-i="'+esc(i)+'" data-id="'+c.id+'" aria-pressed="'+on+'" aria-label="'+(on?esc(i)+' is on the shopping list':'Add '+esc(i)+' to the shopping list')+'" data-fk="bx:'+c.id+i+'">'+(on?"✓":I.cart)+'</button></div>'}).join(""):'<div class="bxr"><span class="sumok">All on hand</span></div>')+'</div></div>';return h}
function mise(d,cs){var h='<aside class="mise" aria-label="Before you cook"><h3>Mise en place</h3>',n=0,i0=DN.indexOf(d),by=i0===0?"Sunday":DF[i0-1];
 cs.forEach(function(c){if(u.srcOf(c)==="left"||u.pastCard(c))return;var ms=u.missing(c),rk=u.risk(c),lp=u.leftoverPortions(c);
  if(ms.length){n++;h+='<div class="mrow"><b>Buy by '+by+'</b><span>'+esc(ms.join(", "))+' for '+esc(u.lbl(c))+'</span></div>'}
  if(rk.length){n++;h+='<div class="mrow bad"><b>Past use-by on '+d+'</b><span>'+esc(rk.map(function(i){return i+" (use by "+u.ubText(i)+")"}).join(", "))+'. Cook '+esc(u.lbl(c))+' earlier.</span></div>'}
  if(lp){n++;h+='<div class="mrow"><b>Cook for '+(c.n+lp)+'</b><span>'+c.n+' now, '+lp+' for the leftovers later this week.</span></div>'}});
 if(!n)h+='<div class="mrow"><span class="sumok">Nothing to do before cooking.</span></div>';
 return h+'</aside>'}
P.start({name:"c",dayNav:true,useDay:true,
 skeleton:function(){return '<div class="wstrip">'+DN.map(function(d){return '<div class="dtab"><b>'+d+'</b></div>'}).join("")+'</div><div class="fwrap"><div class="focus"><div class="sk"></div><div class="sk" style="margin-top:12px"></div></div></div>'},
 main:function(){var S=P.S(),d=S.cur&&S.cur.day||S.day||"Wed",h='<nav class="wstrip" role="tablist" aria-label="Days of the week">';
  DN.forEach(function(x){var hd=u.dayHeadTxt(x),cs=u.dayCards(x),b=u.isBlocked(x,u.ME)&&S.view==="mine",marks="",em=cs.map(function(c){return u.R[c.r].e}).join(""),ms=cs.filter(function(c){return !u.pastCard(c)&&u.missing(c).length}).length,rk=cs.filter(function(c){return u.risk(c).length}).length,hh=cs.some(function(c){return c.res});
   if(ms)marks+='<i class="m miss" aria-label="'+ms+' with missing items"></i>';if(rk)marks+='<i class="m soon" aria-label="use-by"></i>';if(hh)marks+='<i class="m held" aria-label="held"></i>';
   h+='<button class="dtab'+(x===d?" on":"")+(b?" off":"")+(hd.today?" is-today":"")+'" role="tab" aria-selected="'+(x===d)+'" data-pickday="'+x+'" data-day="'+x+'" data-drop-day="'+x+'" data-fk="tab:'+x+'" aria-label="'+hd.full+' '+hd.date+', '+cs.length+' meals"><b>'+x+'</b><span class="dtd">'+hd.date.split(" ")[0]+'</span><span class="dte">'+(em||(b?"–":""))+'</span><span class="dtm">'+marks+'</span><span class="dh-hint"></span></button>'});
  h+='</nav>';
  var hd=u.dayHeadTxt(d),cs=u.dayCards(d),note=(S.view==="mine"&&S.ov[S.wk+"|Sam|"+d]===false&&S.stencil.Sam.indexOf(d)>-1)?'<div class="ovt">Usual day off, cooking this week</div>':"";
  h+='<div class="fwrap"><section class="focus" data-day="'+d+'" data-drop-day="'+d+'" role="tabpanel" aria-label="'+hd.full+' '+hd.date+'"><div class="fh"><h2>'+hd.full+' <small>'+hd.date+'</small>'+(hd.today?' <span class="today">Today</span>':"")+'</h2></div><div class="fstack">'+note;
  if(cs.length)cs.forEach(function(c){h+='<div class="bigw">'+u.cardW(c,"big")+bigx(c)+'</div>'});else h+=u.dayStack(d,"big").replace(note,"");
  h+='</div></section>'+(cs.length?mise(d,cs):"")+'</div>';
  return h}});
P.vpScript("(min-width:2200px)","lane-summary-2200.js");
})();
