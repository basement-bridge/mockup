/* Theme picker shared by every page. Tucked behind one small button, bottom right, same spot everywhere
   (the household flow keeps it inside its Controls panel). Choice is remembered on this device. */
(function(){
  var T=[["kitchie","Kitchie Night","#0F1E19","#F2B84B"],["kitchie-day","Kitchie Day","#F6F1E6","#8A5600"],["marmalade","Marmalade","#FBF1E3","#C2410C"],["blueberry","Blueberry","#14142B","#F48FB1"],["herb","Herb Garden","#EEF4E6","#2F7D32"],["cappuccino","Cappuccino","#F3E9DD","#8B5A2B"],["tokyo-midnight","Tokyo Midnight","#0B0F1E","#5CE1E6"],["paprika","Paprika","#1F1410","#FF8A4C"],["sea-salt","Sea Salt","#EAF2F4","#0F766E"],["lavender-fog","Lavender Fog","#F1EEF7","#6D28D9"]];
  var get=function(){try{return localStorage.getItem("theme")}catch(e){return null}};
  var set=function(v){try{localStorage.setItem("theme",v)}catch(e){}};
  var cur=get();
  if(!T.some(function(t){return t[0]===cur})) cur=matchMedia("(prefers-color-scheme: light)").matches?"kitchie-day":"kitchie";
  var apply=function(v){document.documentElement.setAttribute("data-theme",v);cur=v;document.querySelectorAll("[data-theme-pick]").forEach(function(b){b.setAttribute("aria-pressed",String(b.dataset.themePick===v))})};
  apply(cur);
  var sw=function(t){return '<i class="tsw" style="background:linear-gradient(135deg,'+t[2]+' 50%,'+t[3]+' 50%)"></i>'};
  window.themeHtml=function(){return T.map(function(t){return '<button type="button" class="tpick" data-theme-pick="'+t[0]+'" aria-pressed="'+(t[0]===cur)+'">'+sw(t)+t[1]+'</button>'}).join("")};
  document.addEventListener("click",function(e){var b=e.target.closest&&e.target.closest("[data-theme-pick]");if(b){set(b.dataset.themePick);apply(b.dataset.themePick)}});
  window.themeApply=function(){apply(cur)};
  document.addEventListener("DOMContentLoaded",function(){
    if(document.body.hasAttribute("data-no-theme-fab")) return;
    var cu=T.filter(function(t){return t[0]===cur})[0];
    var fab=document.createElement("button");fab.type="button";fab.className="tfab";fab.setAttribute("aria-expanded","false");fab.setAttribute("aria-controls","tpop");
    fab.innerHTML='<span class="tsw" style="background:linear-gradient(135deg,var(--bg) 50%,var(--accent) 50%)"></span>Theme';
    var pop=document.createElement("div");pop.id="tpop";pop.className="tpop";pop.hidden=true;pop.setAttribute("role","group");pop.setAttribute("aria-label","Theme");
    pop.innerHTML='<h3>Theme</h3><div class="tgrid">'+themeHtml()+'</div>';
    document.body.appendChild(pop);document.body.appendChild(fab);
    var close=function(){pop.hidden=true;fab.setAttribute("aria-expanded","false")};
    fab.addEventListener("click",function(){pop.hidden=!pop.hidden;fab.setAttribute("aria-expanded",String(!pop.hidden))});
    document.addEventListener("keydown",function(e){if(e.key==="Escape")close()});
    document.addEventListener("click",function(e){if(!pop.hidden&&!pop.contains(e.target)&&!fab.contains(e.target))close()});
  });
})();
