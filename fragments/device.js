/* Device mode for the household flow and the desktop screens. Pick a target size (Phone, Tablet or a desktop size); the page loads itself in a frame of
   exactly that size, scaled down to fit the window, so its own width rules run for that size. Phone and Tablet show the household flow; desktop sizes show
   the desktop Pantry. The control is hidden: move to the top edge, press ` (backtick) or Tab to it. "Full window" is the real window.
   URL: ?vp=<width> (0 or missing = full window). Inside the frame the page gets ?embed=1 and shows no chrome. No storage. */
(function(){
var SZ={390:[390,844],768:[768,1024],1024:[1024,768],1280:[1280,800],1440:[1440,900],1920:[1920,1080],2560:[2560,1440]};
var Q=new URLSearchParams(location.search),VP=parseInt(Q.get("vp"),10)||0,EMBED=Q.get("embed")==="1";
var ROOT=document.currentScript.src.replace(/device\.js.*$/,""),FLOW=ROOT+"../flows/household/index.html",DESK=ROOT+"desktop/pantry.html";
var ISFLOW=/\/flows\/household\//.test(location.pathname),WIDE=VP>=1024;
function url(base,v){var u=new URL(base,location.href);if(v)u.searchParams.set("vp",v);return u}
function to(v){var base=v>=1024?DESK:v>0?FLOW:(ISFLOW?FLOW:location.href.split("?")[0]);location.href=url(base,v).href}
if(VP&&ISFLOW===WIDE&&!EMBED){location.replace(url(WIDE?DESK:FLOW,VP).href);return}
if(EMBED){document.documentElement.dataset.embed="1";var st=document.createElement("style");st.textContent="html[data-embed] .tfab,html[data-embed] .tpop,html[data-embed] .gear{display:none!important}";document.head.appendChild(st);
 window.addEventListener("message",function(e){var d=e.data||{};if(d.k==="help")document.dispatchEvent(new CustomEvent("kitchie-help"));if(d.k==="controls"){var p=document.getElementById("panel");if(p&&ISFLOW)p.classList.toggle("open")}});return}
var css=document.createElement("style");css.textContent=".dvh{position:fixed;top:0;left:50%;transform:translateX(-50%);z-index:9998;width:200px;height:14px;border:0;background:none;padding:0;opacity:0}.dvh::after{content:'';position:absolute;left:50%;top:3px;width:48px;height:4px;border-radius:4px;background:var(--accent,#a60);transform:translateX(-50%)}.dvh:hover,.dvh:focus-visible{opacity:.8}.dvh:focus-visible{outline:2px solid var(--accent,#a60)}"
+".dvp{position:fixed;top:8px;left:50%;transform:translateX(-50%);z-index:9999;width:min(560px,calc(100vw - 24px));max-height:calc(100vh - 24px);overflow:auto;padding:14px;border-radius:var(--r-card,16px);border:1px solid var(--border,#888);background:var(--surface,#fff);color:var(--fg,#000);font:14px var(--body,system-ui);box-shadow:0 18px 50px rgba(0,0,0,.35);display:flex;flex-direction:column;gap:12px}.dvp[hidden]{display:none}"
+".dvp h3{margin:0 0 6px;font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted,#666)}.dvc{display:flex;flex-wrap:wrap;gap:6px}.dvp button,.dvp a.dvb{min-height:40px;padding:0 14px;border-radius:99px;border:1px solid var(--border,#888);background:var(--bg,#fff);color:var(--fg,#000);font:600 13px var(--body,system-ui);display:inline-flex;align-items:center;gap:6px;text-decoration:none;cursor:pointer}"
+".dvp button[aria-pressed=true]{border-color:var(--accent,#a60);color:var(--accent,#a60);box-shadow:inset 0 0 0 1px var(--accent,#a60)}.dvp button small{font-weight:500;color:var(--muted,#666)}.dvp button:focus-visible,.dvp a:focus-visible{outline:2px solid var(--accent,#a60);outline-offset:1px}.dvi{color:var(--muted,#666);font-size:12px}"
+".dvwrap{position:fixed;inset:0;display:grid;place-items:center;overflow:hidden;background:var(--stage,#ddd)}.dvwrap iframe{border:0;background:var(--bg,#fff);transform-origin:50% 50%;display:block;flex:none}";
document.head.appendChild(css);
var ifr=null;
function chip(w,label){var s=SZ[w];return '<button type="button" data-vp="'+w+'" aria-pressed="'+(w===VP)+'">'+label+' <small>'+s[0]+' × '+s[1]+'</small></button>'}
function panel(){var p=document.createElement("div");p.className="dvp";p.id="dvp";p.hidden=true;p.setAttribute("role","dialog");p.setAttribute("aria-label","Device size and controls");
 p.innerHTML='<div><h3>Device</h3><div class="dvc"><button type="button" data-vp="0" aria-pressed="'+(!VP)+'">Full window</button>'+chip(390,"Phone")+chip(768,"Tablet")+'</div></div>'
 +'<div><h3>Desktop</h3><div class="dvc">'+[1024,1280,1440,1920,2560].map(function(w){return chip(w,w===1024?"Small":w===1280?"Laptop":w===1440?"Wide":w===1920?"Full HD":"QHD")}).join("")+'</div></div>'
 +'<div class="dvc">'+(ISFLOW||VP?'<button type="button" data-dv="controls">Prototype controls</button>':"")+(ISFLOW&&!VP?"":'<button type="button" data-dv="help">Shortcuts <small>?</small></button>')+'<a class="dvb" href="'+ROOT+'../index.html">All mockups</a></div>'
 +(window.themeHtml?'<div><h3>Theme</h3><div class="tgrid">'+(window.themeWarm&&window.themeWarm(),window.themeHtml())+'</div></div>':"")
 +'<div class="dvi" id="dvi"></div>';return p}
function toggle(on){var p=document.getElementById("dvp");on=on===undefined?p.hidden:on;p.hidden=!on;if(on){var b=p.querySelector("[aria-pressed=true]");if(b)b.focus()}}
function send(k){if(ifr&&ifr.contentWindow)ifr.contentWindow.postMessage({k:k},"*");else if(k==="help")document.dispatchEvent(new CustomEvent("kitchie-help"));else if(k==="controls"){var c=document.getElementById("panel");if(c)c.classList.toggle("open")}}
document.addEventListener("DOMContentLoaded",function(){
 if(VP){var u=new URL(location.href);u.searchParams.delete("vp");u.searchParams.set("embed","1");var sz=SZ[VP]||[VP,800];
  document.body.innerHTML='<div class="dvwrap"><iframe title="'+sz[0]+' by '+sz[1]+' pixels" src="'+u.href.replace(/"/g,"&quot;")+'"></iframe></div>';
  ifr=document.querySelector("iframe");function fit(){var s=Math.min(1,window.innerWidth/sz[0],window.innerHeight/sz[1]);ifr.style.width=sz[0]+"px";ifr.style.height=sz[1]+"px";ifr.style.transform="scale("+s+")";var i=document.getElementById("dvi");if(i)i.textContent=sz[0]+" × "+sz[1]+(s<1?", shown at "+Math.round(s*100)+"%":", shown at full size")}
  window.addEventListener("resize",fit);document.body.dataset.noThemeFab="";fit()}
 var h=document.createElement("button");h.type="button";h.className="dvh";h.setAttribute("aria-label","Device size and controls (press the backtick key)");h.addEventListener("click",function(){toggle()});
 var p=panel();document.body.appendChild(h);document.body.appendChild(p);
 p.addEventListener("click",function(e){var th=e.target.closest("[data-theme-pick]");if(th&&ifr){setTimeout(function(){try{ifr.contentWindow.location.reload()}catch(x){}},150)}var b=e.target.closest("[data-vp]");if(b){to(parseInt(b.dataset.vp,10)||0);return}var d=e.target.closest("[data-dv]");if(d){toggle(false);send(d.dataset.dv)}});
 document.addEventListener("keydown",function(e){var t=e.target;if(e.key==="`"&&!(t.closest&&t.closest("input,textarea,select,[contenteditable]"))){e.preventDefault();toggle()}else if(e.key==="Escape"&&!p.hidden){e.stopPropagation();toggle(false)}},true);
 document.addEventListener("click",function(e){if(!p.hidden&&!e.target.closest("#dvp,.dvh"))toggle(false)});
 window.addEventListener("message",function(e){if(e.data&&e.data.k==="device-toggle")toggle()});
 if(VP){var fit0=document.querySelector("iframe");if(fit0)fit0.addEventListener("load",function(){try{fit0.contentWindow.document.addEventListener("keydown",function(ev){if(ev.key==="`"){ev.preventDefault();toggle()}})}catch(x){}})}
});
})();
