/* Theme picker shared by every page. Choice is remembered on this device. Default follows the device's light/dark setting. */
(function(){
  var T=[["kitchie","Kitchie Night"],["kitchie-day","Kitchie Day"],["marmalade","Marmalade"],["blueberry","Blueberry"],["herb","Herb Garden"]];
  var get=function(){try{return localStorage.getItem("theme")}catch(e){return null}};
  var set=function(v){try{localStorage.setItem("theme",v)}catch(e){}};
  var cur=get();
  if(!T.some(function(t){return t[0]===cur})) cur=matchMedia("(prefers-color-scheme: light)").matches?"kitchie-day":"kitchie";
  var apply=function(v){document.documentElement.setAttribute("data-theme",v);cur=v;document.querySelectorAll("[data-theme-pick]").forEach(function(b){b.setAttribute("aria-pressed",String(b.dataset.themePick===v))})};
  apply(cur);
  window.themeHtml=function(){return T.map(function(t){return '<button type="button" class="tpick" data-theme-pick="'+t[0]+'" aria-pressed="'+(t[0]===cur)+'"><i class="tsw" data-sw="'+t[0]+'"></i>'+t[1]+'</button>'}).join("")};
  document.addEventListener("click",function(e){var b=e.target.closest&&e.target.closest("[data-theme-pick]");if(b){set(b.dataset.themePick);apply(b.dataset.themePick)}});
  window.themeApply=function(){apply(cur)};
})();
