/* Plan it / Make it overlay, shared by variants a, b, c (the variant is set on <html data-ov>). Runs after recommended.js has drawn the page.
   Mockup-only: in the build the hero template would draw this markup directly. It moves the EXISTING Plan it / Make it elements (handlers, labels and the "Planned Tue" state stay),
   so the DOM order, and therefore the keyboard order, is the same as today: title row, Serves row, then Plan it, Make it, then the rail. The banner is one button in the page (first tab stop).
   No banner (?banner=none, or a recipe without a photo): nothing is overlaid and Plan it / Make it stay in row two at the right, exactly as in recommended/. */
(function(){
"use strict";
var hero=document.getElementById("hero");if(!hero)return;
var ph=hero.querySelector(".hphoto"),go=hero.querySelector(".hgo");
if(!ph||!go){hero.classList.add("ov-none");return}
hero.classList.add("has-ov");document.title=document.title.replace("recommended","Plan it / Make it overlay "+(document.documentElement.dataset.ov||"").toUpperCase());
ph.removeAttribute("aria-hidden");
var scrim=document.createElement("span");scrim.className="ban-scrim";scrim.setAttribute("aria-hidden","true");ph.appendChild(scrim);
var open=document.createElement("button");open.type="button";open.className="ban-open";open.setAttribute("aria-label","Enlarge banner photo");open.title="Enlarge photo";
open.innerHTML='<span class="ban-zoom" aria-hidden="true"><svg class="ic" viewBox="0 0 24 24"><circle cx="11" cy="11" r="6"/><path d="M20 20l-4-4M11 8v6M8 11h6"/></svg></span>';
ph.appendChild(open);
/* the overlay layer sits over the banner but is a later sibling, so focus order is unchanged */
var pc=document.createElement("div");pc.className="pc";pc.setAttribute("data-pc","");
go.className="pc-go";go.setAttribute("role","group");go.setAttribute("aria-label","Plan it or make it");
pc.appendChild(go);hero.appendChild(pc);
/* Enlarge: reuse the Photos tab's viewer (the banner is photo 1 there). The viewer returns focus to its opener, which is a hidden grid button, so put it back on the banner. */
open.addEventListener("click",function(){
 var pm=document.querySelector("[data-pmore]");if(!pm)return;
 pm.click();var first=document.querySelector("[data-ph='0']");if(first)first.click();
 var lb=document.querySelector(".lbx");if(!lb)return;
 var mo=new MutationObserver(function(){if(lb.hidden){mo.disconnect();open.focus()}});mo.observe(lb,{attributes:true,attributeFilter:["hidden"]})
});
})();
