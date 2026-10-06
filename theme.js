/* Theme picker shared by every page. Tucked behind one small button, bottom right, same spot everywhere
   (the household flow keeps it inside its Controls panel). Choice is remembered on this device. */
(function(){
  /* Performance (DESIGN.md section 6). Only the two default themes ship inside theme.css, so the default path loads nothing extra.
     Every other theme is its own small file under themes/, fetched when it is chosen, and warmed in the background the first time the
     person engages the picker. A saved choice is loaded before first paint, so there is no flash of the default theme. */
  var INLINE={"kitchie":1,"kitchie-day":1};
  var src=document.currentScript&&document.currentScript.src||"";
  var BASE=src.replace(/theme\.js(\?.*)?$/,"");
  var done={},warmed=false;
  var url=function(id){return BASE+"themes/"+id+".css"};
  var ensure=function(id,cb,sync){
    if(INLINE[id]||done[id]){cb();return}
    if(sync&&document.readyState==="loading"){document.write('<link rel="stylesheet" href="'+url(id)+'">');done[id]=1;cb();return}
    var l=document.createElement("link");l.rel="stylesheet";l.href=url(id);
    l.onload=function(){done[id]=1;cb()};l.onerror=function(){cb()};
    document.head.appendChild(l);
  };
  var warm=function(){
    if(warmed)return;warmed=true;
    var go=function(){T.forEach(function(t){if(INLINE[t[0]])return;var l=document.createElement("link");l.rel="prefetch";l.as="style";l.href=url(t[0]);document.head.appendChild(l)})};
    (window.requestIdleCallback||function(f){setTimeout(f,200)})(go);
  };
  var T=[["kitchie","Kitchie Night","#0F1E19","#F2B84B"],["kitchie-day","Kitchie Day","#F6F1E6","#8A5600"],["marmalade","Marmalade","#FBF1E3","#C2410C"],["blueberry","Blueberry","#14142B","#F48FB1"],["herb","Herb Garden","#EEF4E6","#2F7D32"],["cappuccino","Cappuccino","#F3E9DD","#8B5A2B"],["tokyo-midnight","Tokyo Midnight","#0B0F1E","#5CE1E6"],["paprika","Paprika","#1F1410","#FF8A4C"],["sea-salt","Sea Salt","#EAF2F4","#0F766E"],["lavender-fog","Lavender Fog","#F1EEF7","#6D28D9"]];
  var get=function(){try{return localStorage.getItem("theme")}catch(e){return null}};
  var set=function(v){try{localStorage.setItem("theme",v)}catch(e){}};
  var cur=get();
  if(!T.some(function(t){return t[0]===cur})) cur=matchMedia("(prefers-color-scheme: light)").matches?"kitchie-day":"kitchie";
  var show=function(v){document.documentElement.setAttribute("data-theme",v);cur=v;document.querySelectorAll("[data-theme-pick]").forEach(function(b){b.setAttribute("aria-pressed",String(b.dataset.themePick===v))})};
  var apply=function(v,sync){ensure(v,function(){show(v)},sync)};
  apply(cur,true);
  var sw=function(t){return '<i class="tsw" style="background:linear-gradient(135deg,'+t[2]+' 50%,'+t[3]+' 50%)"></i>'};
  window.themeWarm=warm;
  window.themeHtml=function(ids){return T.filter(function(t){return !ids||ids.indexOf(t[0])>-1}).map(function(t){return '<button type="button" class="tpick" data-theme-pick="'+t[0]+'" aria-pressed="'+(t[0]===cur)+'">'+sw(t)+t[1]+'</button>'}).join("")};
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
    ["pointerenter","focus"].forEach(function(n){fab.addEventListener(n,warm,{once:true})});
    fab.addEventListener("click",function(){pop.hidden=!pop.hidden;fab.setAttribute("aria-expanded",String(!pop.hidden))});
    document.addEventListener("keydown",function(e){if(e.key==="Escape")close()});
    document.addEventListener("click",function(e){if(!pop.hidden&&!pop.contains(e.target)&&!fab.contains(e.target))close()});
  });
})();
