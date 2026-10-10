/* Below 1440 only (fetched only then): the lane overlays the cook sheet instead of docking, because the sheet needs its width. The sheet gets right padding (CSS) so nothing is permanently hidden, and when a meal is picked the sheet scrolls so that meal's day column stays in the visible part, left of the lane. */
(function(){var P=PLAN,q=P.u.q;
P.layout.overlayAfter=function(){var S=P.S();if(!S.sel||!window.matchMedia("(max-width:1439px)").matches)return;
 var sc=q("[data-hscroll]"),el=q('.dcol [data-card="'+S.sel+'"]'),day=el&&el.closest(".dcol");if(!sc||!day)return;
 var lane=q("#panel"),lw=lane?lane.getBoundingClientRect().width:340,sr=sc.getBoundingClientRect(),dr=day.getBoundingClientRect(),vis=sr.right-lw;
 if(dr.right>vis-8)sc.scrollLeft+=dr.right-vis+16;else if(dr.left<sr.left+190)sc.scrollLeft-=sr.left+190-dr.left};
P.render();
})();
