/* Size frame for the Plan desktop mockups. ?vp=<width> loads the same page in an iframe of exactly that size (width x height),
   scaled down to fit the window, so the page's own width rules run for that size (same idea as fragments/device.js, which is tied to the Pantry).
   Sizes: 1024 x 768, 1280 x 800, 1366 x 768 (short laptop), 1440 x 900, 1920 x 1080, 2560 x 1440. The control is hidden: move to the top edge or press the backtick key. */
(function(){
var SZ={1024:[1024,768],1280:[1280,800],1366:[1366,768],1440:[1440,900],1920:[1920,1080],2560:[2560,1440]},NM={1024:"Small",1280:"Laptop",1366:"Short laptop",1440:"Wide",1920:"Full HD",2560:"Ultrawide"};
var Q=new URLSearchParams(location.search),VP=parseInt(Q.get("vp"),10)||0,EMBED=Q.get("embed")==="1";
if(EMBED){document.documentElement.dataset.embed="1";return}
var css=document.createElement("style");css.textContent=".dvh{position:fixed;top:0;left:50%;transform:translateX(-50%);z-index:9998;width:200px;height:14px;border:0;background:none;padding:0;opacity:0}.dvh::after{content:'';position:absolute;left:50%;top:3px;width:48px;height:4px;border-radius:4px;background:var(--accent,#a60);transform:translateX(-50%)}.dvh:hover,.dvh:focus-visible{opacity:.8}"
+".dvp{position:fixed;top:8px;left:50%;transform:translateX(-50%);z-index:9999;width:min(600px,calc(100vw - 24px));padding:14px;border-radius:var(--r-card,16px);border:1px solid var(--border,#888);background:var(--surface,#fff);color:var(--fg,#000);font:14px var(--body,system-ui);box-shadow:0 18px 50px rgba(0,0,0,.35)}.dvp[hidden]{display:none}.dvp h3{margin:0 0 6px;font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted,#666)}.dvc{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px}"
+".dvp a,.dvp button{min-height:40px;padding:0 14px;border-radius:99px;border:1px solid var(--border,#888);background:var(--bg,#fff);color:var(--fg,#000);font:600 13px var(--body,system-ui);display:inline-flex;align-items:center;gap:6px;text-decoration:none;cursor:pointer}.dvp [aria-current=true]{border-color:var(--accent,#a60);color:var(--accent,#a60);box-shadow:inset 0 0 0 1px var(--accent,#a60)}.dvp small{font-weight:500;color:var(--muted,#666)}.dvi{color:var(--muted,#666);font-size:12px}"
+".dvwrap{position:fixed;inset:0;display:grid;place-items:center;overflow:hidden;background:var(--stage,#ddd)}.dvwrap iframe{border:0;background:var(--bg,#fff);transform-origin:50% 50%;display:block;flex:none}";
document.head.appendChild(css);
function link(w){var u=new URL(location.href);if(w)u.searchParams.set("vp",w);else u.searchParams.delete("vp");u.searchParams.delete("embed");return u.href}
document.addEventListener("DOMContentLoaded",function(){
 var sz=SZ[VP]||(VP?[VP,800]:null);
 if(VP){var u=new URL(location.href);u.searchParams.delete("vp");u.searchParams.set("embed","1");
  document.body.innerHTML='<div class="dvwrap"><iframe title="'+sz[0]+' by '+sz[1]+' pixels" src="'+u.href.replace(/"/g,"&quot;")+'"></iframe></div>';
  var ifr=document.querySelector("iframe");var fit=function(){var s=Math.min(1,innerWidth/sz[0],innerHeight/sz[1]);ifr.style.width=sz[0]+"px";ifr.style.height=sz[1]+"px";ifr.style.transform="scale("+s+")";var i=document.getElementById("dvi");if(i)i.textContent=sz[0]+" × "+sz[1]+(s<1?", shown at "+Math.round(s*100)+"%":", shown at full size")};
  addEventListener("resize",fit);fit()}
 var h=document.createElement("button");h.type="button";h.className="dvh";h.setAttribute("aria-label","Size and theme (press the backtick key)");
 var p=document.createElement("div");p.className="dvp";p.hidden=true;p.setAttribute("role","dialog");p.setAttribute("aria-label","Window size and theme");
 p.innerHTML='<h3>Window size</h3><div class="dvc"><a href="'+link(0)+'" aria-current="'+(!VP)+'">Full window</a>'+Object.keys(SZ).map(function(w){return '<a href="'+link(w)+'" aria-current="'+(+w===VP)+'">'+NM[w]+' <small>'+SZ[w][0]+' × '+SZ[w][1]+'</small></a>'}).join("")+'</div><div class="dvc"><a href="index.html">All Plan options</a></div>'+(window.themeHtml?'<h3>Theme</h3><div class="tgrid">'+(window.themeWarm&&window.themeWarm(),window.themeHtml())+'</div>':"")+'<div class="dvi" id="dvi"></div>';
 document.body.appendChild(h);document.body.appendChild(p);
 var tg=function(on){on=on===undefined?p.hidden:on;p.hidden=!on;if(on){var b=p.querySelector("[aria-current=true]");if(b)b.focus()}};
 h.addEventListener("click",function(){tg()});
 document.addEventListener("keydown",function(e){if(e.key==="`"&&!(e.target.closest&&e.target.closest("input,textarea,select"))){e.preventDefault();tg()}else if(e.key==="Escape"&&!p.hidden){tg(false)}},true);
 document.addEventListener("click",function(e){if(!p.hidden&&!e.target.closest(".dvp,.dvh"))tg(false)});
 if(VP){var f=document.querySelector("iframe");f.addEventListener("load",function(){try{f.contentWindow.document.addEventListener("keydown",function(ev){if(ev.key==="`"){ev.preventDefault();tg()}})}catch(x){}})}
});
})();
