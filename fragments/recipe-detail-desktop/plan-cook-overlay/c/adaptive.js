/* C: adaptive contrast for the top-right Plan it / Make it stack. Loaded after ../overlay.js. Mockup-only; in the build this would be a small hero behaviour.
   What it does: draws the banner region BEHIND the button stack (mapped through object-fit / object-position, so the crop and a resize are accounted for) onto a 32px canvas,
   reads its relative luminance (mean, 10th and 90th percentile), then picks one of two button styles:
     on-dark  = the photo is dark here   -> light buttons (cream Plan it, amber Make it) with a white edge
     on-light = the photo is light here  -> dark buttons (ink Plan it, deep amber Make it) with a near-black edge
   Hysteresis: switches to on-light only above mean luminance 0.24, back to on-dark only below 0.15 (the two styles break even at about 0.19), so a resize drag across the line does not flicker.
   A subtle scrim (30%, or 50% when still short of 3:1) is added in the opposite tone when the region is mid-tone or busy, or when its worst pixel would leave the button edge under 3:1; it only steps down again once the lower step clears 3.3:1.
   Contrast it keeps: label text on its button fill >= 4.5:1 (fixed palette, checked below), button edge against the worst photo pixel in the region (after the scrim) >= 3:1.
   Falls back, safely, to the fixed look (theme buttons on the fixed dark corner scrim) when the canvas cannot be read (cross-origin image without CORS, which taints the canvas), the image is not loaded, or the banner has no size. Marked data-ov-adapt="fallback".
   Re-samples when: the image loads or its src changes, the banner or the stack changes size (ResizeObserver), the label changes ("Planned Tue"), and when the theme changes. Transitions are .28s and are off under prefers-reduced-motion. */
(function(){
"use strict";
var hero=document.getElementById("hero"),ph=hero&&hero.querySelector(".hphoto"),img=ph&&ph.querySelector("img"),pc=hero&&hero.querySelector("[data-pc]"),go=pc&&pc.querySelector(".pc-go");
if(!hero||!ph||!img||!pc||!go)return;
var PAL={
 "on-dark":{plan:["#F3EEE3","#0F1E19"],make:["#F2B84B","#0F1E19"],edge:"#FFFFFF",shadow:"rgba(0,0,0,.5)",scrim:"d"},
 "on-light":{plan:["#14231D","#F3EEE3"],make:["#6B4200","#FFFFFF"],edge:"#0B1511",shadow:"rgba(0,0,0,.28)",scrim:"l"}};
var LEVELS=[0,.3,.5],EDGE_MIN=3,EDGE_DOWN=3.3,TO_LIGHT=.24,TO_DARK=.15,PAD=8;
function lin(c){c/=255;return c<=.04045?c/12.92:Math.pow((c+.055)/1.055,2.4)}
function hexL(h){var n=parseInt(h.slice(1),16);return .2126*lin(n>>16&255)+.7152*lin(n>>8&255)+.0722*lin(n&255)}
function cr(a,b){var hi=Math.max(a,b),lo=Math.min(a,b);return (hi+.05)/(lo+.05)}
/* the label contrast is fixed by the palette; computed here so the file fails loudly if someone edits a colour below 4.5 */
Object.keys(PAL).forEach(function(k){var p=PAL[k];p.txt=Math.min(cr(hexL(p.plan[0]),hexL(p.plan[1])),cr(hexL(p.make[0]),hexL(p.make[1])));p.edgeL=hexL(p.edge);if(p.txt<4.5&&window.console)console.warn("overlay palette "+k+" label contrast "+p.txt.toFixed(2)+" is under 4.5")});

var cv=document.createElement("canvas"),ctx=cv.getContext("2d",{willReadFrequently:true});
var ad=document.createElement("span");ad.className="ban-adapt";ad.setAttribute("aria-hidden","true");ad.innerHTML="<i class='d'></i><i class='l'></i>";ph.insertBefore(ad,ph.querySelector(".ban-open"));
var state={tone:null,level:0},raf=0;

function posV(v,free){v=(v||"50%").trim();if(v==="left"||v==="top")return 0;if(v==="center")return .5;if(v==="right"||v==="bottom")return 1;if(/%$/.test(v))return parseFloat(v)/100;if(/px$/.test(v))return free?parseFloat(v)/free:.5;return .5}
/* the part of the banner behind the stack (plus PAD), in the picture's own pixels; null when it cannot be worked out */
function region(){
 var ib=img.getBoundingClientRect(),g=go.getBoundingClientRect(),iw=img.naturalWidth,ih=img.naturalHeight;
 if(!iw||!ih||ib.width<2||ib.height<2||!g.width)return null;
 var cs=getComputedStyle(img),fit=cs.objectFit,sx_,sy_;
 if(fit==="fill"){sx_=ib.width/iw;sy_=ib.height/ih}else{sx_=sy_=fit==="contain"?Math.min(ib.width/iw,ib.height/ih):Math.max(ib.width/iw,ib.height/ih)}
 var dw=iw*sx_,dh=ih*sy_,pp=(cs.objectPosition||"50% 50%").split(/\s+/);
 var ox=(ib.width-dw)*posV(pp[0],ib.width-dw),oy=(ib.height-dh)*posV(pp[1],ib.height-dh);
 var x0=Math.max(0,g.left-ib.left-PAD),y0=Math.max(0,g.top-ib.top-PAD),x1=Math.min(ib.width,g.right-ib.left+PAD),y1=Math.min(ib.height,g.bottom-ib.top+PAD);
 var a=Math.max(0,(x0-ox)/sx_),b=Math.max(0,(y0-oy)/sy_),c=Math.min(iw,(x1-ox)/sx_),d=Math.min(ih,(y1-oy)/sy_);
 if(c-a<1||d-b<1)return null;
 return {sx:a,sy:b,sw:c-a,sh:d-b,box:{x0:x0,y0:y0,x1:x1,y1:y1}};
}
function sample(r){
 var w=32,h=Math.max(2,Math.min(32,Math.round(32*r.sh/r.sw)));cv.width=w;cv.height=h;
 ctx.imageSmoothingQuality="high";ctx.clearRect(0,0,w,h);ctx.drawImage(img,r.sx,r.sy,r.sw,r.sh,0,0,w,h);
 var d=ctx.getImageData(0,0,w,h).data,L=[],sum=0;           /* throws SecurityError on a tainted canvas: caught by the caller */
 for(var i=0;i<d.length;i+=4){if(d[i+3]<128)continue;var l=.2126*lin(d[i])+.7152*lin(d[i+1])+.0722*lin(d[i+2]);L.push(l);sum+=l}
 if(!L.length)return null;L.sort(function(a,b){return a-b});
 return {mean:sum/L.length,lo:L[Math.floor(L.length*.1)],hi:L[Math.min(L.length-1,Math.floor(L.length*.9))]};
}
/* button edge against the worst pixel, after a scrim of alpha a in the opposite tone */
function edge(tone,s,a){return tone==="on-dark"?cr(PAL[tone].edgeL,s.hi*(1-a)):cr(s.lo+(1-s.lo)*a,PAL[tone].edgeL)}
function level(tone,s){
 var min=(s.mean>.08&&s.mean<.4)||(s.hi-s.lo)>.35?1:0,i=Math.max(min,0);
 for(;i<LEVELS.length-1;i++){if(edge(tone,s,LEVELS[i])>=EDGE_MIN)break}
 /* hysteresis on the way down: only step the scrim down when the lower step clears 3.3:1, not just 3:1 */
 if(state.tone===tone&&i<state.level&&edge(tone,s,LEVELS[i])<EDGE_DOWN)i=state.level;
 return i;
}
function decide(s){
 var tone=state.tone;
 if(!tone)tone=s.mean>=(TO_LIGHT+TO_DARK)/2?"on-light":"on-dark";
 else if(tone==="on-dark"&&s.mean>TO_LIGHT)tone="on-light";
 else if(tone==="on-light"&&s.mean<TO_DARK)tone="on-dark";
 var lv=level(tone,s),other=tone==="on-dark"?"on-light":"on-dark";
 if(edge(tone,s,LEVELS[lv])<EDGE_MIN){var lo=level(other,s);if(edge(other,s,LEVELS[lo])>edge(tone,s,LEVELS[lv])){tone=other;lv=lo}}
 return {tone:tone,level:lv};
}
function setFallback(why){
 state.tone=null;state.level=0;
 hero.setAttribute("data-ov-adapt","fallback");hero.removeAttribute("data-ov-tone");hero.setAttribute("data-ov-why",why);
 ["--ov-sd","--ov-sl"].forEach(function(k){hero.style.removeProperty(k)});
 ["lum","lo","hi","edge","text","level"].forEach(function(k){hero.removeAttribute("data-ov-"+k)});
}
function apply(s,r,res){
 var p=PAL[res.tone],st=hero.style,a=LEVELS[res.level];
 st.setProperty("--ov-plan-bg",p.plan[0]);st.setProperty("--ov-plan-fg",p.plan[1]);st.setProperty("--ov-make-bg",p.make[0]);st.setProperty("--ov-make-fg",p.make[1]);st.setProperty("--ov-edge",p.edge);st.setProperty("--ov-shadow",p.shadow);
 var b=r.box,cx=(b.x0+b.x1)/2,cy=(b.y0+b.y1)/2;
 st.setProperty("--ov-cx",cx+"px");st.setProperty("--ov-cy",cy+"px");st.setProperty("--ov-rx",(b.x1-b.x0)+"px");st.setProperty("--ov-ry",(b.y1-b.y0)+"px");
 st.setProperty("--ov-sd",p.scrim==="d"?a:0);st.setProperty("--ov-sl",p.scrim==="l"?a:0);
 hero.setAttribute("data-ov-adapt","sampled");hero.setAttribute("data-ov-tone",res.tone);hero.removeAttribute("data-ov-why");
 hero.setAttribute("data-ov-lum",s.mean.toFixed(3));hero.setAttribute("data-ov-lo",s.lo.toFixed(3));hero.setAttribute("data-ov-hi",s.hi.toFixed(3));
 hero.setAttribute("data-ov-edge",edge(res.tone,s,a).toFixed(2));hero.setAttribute("data-ov-text",p.txt.toFixed(2));hero.setAttribute("data-ov-level",String(res.level));
 state.tone=res.tone;state.level=res.level;
}
function run(){
 raf=0;
 if(!img.complete||!img.naturalWidth){setFallback("not-loaded");return}
 var r=region();if(!r){setFallback("no-region");return}
 var s;try{s=sample(r)}catch(e){setFallback("tainted");return}
 if(!s){setFallback("empty");return}
 apply(s,r,decide(s));
}
function schedule(){if(!raf)raf=requestAnimationFrame(run)}
setFallback("not-loaded");
/* ?adaptive=off keeps the fixed look, for side-by-side comparison in adaptive-test.html */
if(new URLSearchParams(location.search).get("adaptive")==="off"){setFallback("off");return}
img.addEventListener("load",schedule);img.addEventListener("error",function(){setFallback("error")});
if(window.ResizeObserver){var ro=new ResizeObserver(schedule);ro.observe(ph);ro.observe(go)}else window.addEventListener("resize",schedule);
new MutationObserver(schedule).observe(img,{attributes:true,attributeFilter:["src","srcset"]});
new MutationObserver(schedule).observe(go,{childList:true,characterData:true,subtree:true});
new MutationObserver(schedule).observe(document.documentElement,{attributes:true,attributeFilter:["data-theme"]});
schedule();
window.__ovAdaptive={run:run,state:state,palette:PAL};
})();
