/* Viewport picker for the desktop fragments. Pick a width and the page loads itself in a frame of that width, scaled to fit the window, so its own width queries run for that size. "Fit" is the real window. No storage; the choice is in the address (?vp=1440), so a link carries it. */
(function(){
var SIZES=[1024,1280,1440,1920,2560],Q=new URLSearchParams(location.search),VP=parseInt(Q.get("vp"),10)||0,EMBED=Q.get("embed")==="1";
if(EMBED){document.documentElement.dataset.embed="1";var st=document.createElement("style");st.textContent="html[data-embed] .sw{display:none!important}html[data-embed] .rail,html[data-embed] .panel{top:0!important;height:100vh!important}html[data-embed] .app{min-height:100vh!important}html[data-embed] .tfab,html[data-embed] .tpop{display:none!important}";document.head.appendChild(st)}
function to(v){var u=new URL(location.href);if(v)u.searchParams.set("vp",v);else u.searchParams.delete("vp");u.searchParams.delete("embed");location.href=u}
function picker(){var d=document.createElement("div");d.className="vpk";d.setAttribute("role","group");d.setAttribute("aria-label","Viewport width");
 d.innerHTML='<span class="vpl">Viewport</span>'+[0].concat(SIZES).map(function(s){return '<button type="button" data-vp="'+s+'" aria-pressed="'+(s===VP)+'">'+(s?s:"Fit")+'</button>'}).join("");
 d.addEventListener("click",function(e){var b=e.target.closest("[data-vp]");if(b)to(parseInt(b.dataset.vp,10)||0)});return d}
var css=document.createElement("style");css.textContent=".vpk{display:inline-flex;align-items:center;gap:4px;padding:3px;border:1px solid var(--border,#888);border-radius:99px;background:var(--surface,#fff);font:600 12px var(--body,system-ui)}.vpk .vpl{padding:0 8px;color:var(--muted,#666)}.vpk button{min-height:28px;padding:0 10px;border-radius:99px;border:1px solid transparent;background:none;color:var(--fg,#000);font:inherit;cursor:pointer}.vpk button[aria-pressed=true]{border-color:var(--accent,#a60);color:var(--accent,#a60);box-shadow:inset 0 0 0 1px var(--accent,#a60)}.vpk button:focus-visible{outline:2px solid var(--accent,#a60);outline-offset:1px}.vpfloat{position:fixed;left:12px;bottom:12px;z-index:9998}.vpbar{position:fixed;top:0;left:0;right:0;z-index:20;display:flex;align-items:center;gap:12px;height:46px;padding:0 16px;background:var(--stage,#ddd);border-bottom:1px solid var(--border,#888);font:13px var(--body,system-ui);color:var(--fg,#000)}.vpbar .sp{flex:1}.vpbar a{color:var(--fg,#000);font-weight:600}.vpwrap{position:fixed;top:46px;left:0;right:0;bottom:0;overflow:hidden;background:var(--stage,#ddd)}.vpwrap iframe{border:0;transform-origin:0 0;background:var(--bg,#fff);display:block}";
document.head.appendChild(css);
document.addEventListener("DOMContentLoaded",function(){
 if(EMBED)return;
 if(!VP){var sw=document.querySelector(".sw"),p=picker();if(sw){var sp=sw.querySelector(".sp");sp?sp.after(p):sw.appendChild(p)}else{p.classList.add("vpfloat");document.body.appendChild(p)}return}
 var u=new URL(location.href);u.searchParams.delete("vp");u.searchParams.set("embed","1");
 document.body.innerHTML='<div class="vpbar"><a href="#" data-fit>&lsaquo; Back to the full window</a><span class="sp"></span><span class="vpinfo"></span></div><div class="vpwrap"><iframe title="Page at '+VP+' pixels wide" src="'+u.href.replace(/"/g,"&quot;")+'"></iframe></div>';
 var bar=document.querySelector(".vpbar"),pk=picker();bar.insertBefore(pk,bar.querySelector(".sp"));
 bar.querySelector("[data-fit]").addEventListener("click",function(e){e.preventDefault();to(0)});
 var f=document.querySelector("iframe"),info=document.querySelector(".vpinfo");
 function fit(){var w=window.innerWidth,h=window.innerHeight-46,s=Math.min(1,w/VP);f.style.width=VP+"px";f.style.height=Math.round(h/s)+"px";f.style.transform="scale("+s+")";info.textContent=VP+" px wide"+(s<1?", shown at "+Math.round(s*100)+"%":"")}
 fit();window.addEventListener("resize",fit)});
})();
