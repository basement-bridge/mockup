/* Option B: agenda and detail (master-detail). One row per day, rich cards that show what is on hand and missing without opening; the pane on the right is always there. Idle pane = week summary. */
(function(){var P=PLAN,u=P.u,DN=u.DN;
P.start({name:"b",flat:true,
 skeleton:function(){var h='<div class="agenda">';DN.forEach(function(d){h+='<section class="arow"><div class="adate"><b>'+d+'</b></div><div class="astack"><div class="sk"></div></div></section>'});return h+'</div>'},
 main:function(){var h='<div class="agenda" role="list" aria-label="Week agenda">';
  DN.forEach(function(d){var hd=u.dayHeadTxt(d);h+='<section class="arow'+(hd.today?" is-today":"")+'" data-day="'+d+'" data-drop-day="'+d+'" aria-label="'+hd.full+' '+hd.date+'"><div class="adate"><b>'+d+'</b><span>'+hd.date+'</span>'+(hd.today?'<span class="today">Today</span>':"")+'<span class="dh-hint"></span></div><div class="astack">'+u.dayStack(d,"row")+'</div></section>'});
  return h+'</div>'}});
P.vpScript("(min-width:2200px)","lane-summary-2200.js");
})();
