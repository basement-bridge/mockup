/* Option A: week board. Seven day columns, a docked inspector that pushes the board (never covers it). Idle inspector = week summary. */
(function(){var P=PLAN,u=P.u,DN=u.DN;
P.start({name:"a",toggleLane:true,
 skeleton:function(){var h='<div class="board">';DN.forEach(function(d){h+='<section class="day"><header class="dh"><span class="dn">'+d+'</span></header><div class="stack"><div class="sk"></div><div class="sk" style="opacity:.6"></div></div></section>'});return h+'</div>'},
 main:function(){var h='<div class="board" role="group" aria-label="Week board">';
  DN.forEach(function(d){var hd=u.dayHeadTxt(d);h+='<section class="day'+(hd.today?" is-today":"")+'" data-day="'+d+'" data-drop-day="'+d+'" aria-label="'+hd.full+' '+hd.date+'"><header class="dh"><span class="dn">'+d+'</span><span class="dd">'+hd.date+'</span>'+(hd.today?'<span class="today">Today</span>':"")+'<span class="dh-hint"></span></header><div class="stack">'+u.dayStack(d,"col")+'</div></section>'});
  return h+'</div>'}});
P.vpScript("(min-width:2200px)","lane-summary-2200.js");
})();
