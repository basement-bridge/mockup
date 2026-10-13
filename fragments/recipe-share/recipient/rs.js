/* Recipient page (mockup). Sample data lives here only (AGENTS.md). Nothing is sent, stored or signed in: the state comes from the URL.
   The markup and class names (rs-*) are what the build's server would draw; the loading phases and the bar are the only script the page needs. */
(function(){
var q=new URLSearchParams(location.search);
var opt=/^[abc]$/.test(q.get("opt"))?q.get("opt"):"a";
var st=/^(anon|member|norecipes|expiring|expired|cancelled|loading|preview)$/.test(q.get("s"))?q.get("s"):"anon";
var IMG="../../../recipe-photos/img/";
var LINK="https://kitchie.example/s/k7Qm-sample";
var R={title:"Egg fried rice (with peas)",min:20,serves:2,
 blurb:"Day-old rice, eggs and a handful of peas, all in one pan.",
 banner:{id:"efr-2",pc:"#cba772"},
 ings:[["Eggs","1½"],["Basmati rice, cooked and cooled","150 g"],["Onion","½"],["Spring onions","1"],["Frozen peas","40 g"],["Soy sauce","1 tbsp"],["Oil","½ tbsp"]],
 steps:[["Beat the eggs with a pinch of salt.",{id:"efr-s1",pc:"#bfa98c"}],["Chop the onion and fry it in the oil until soft.",{id:"efr-s2",pc:"#5e5855"}],["Push the onion aside, pour in the eggs and stir until just set."],["Tip in the cold rice and the peas and break up any lumps. Keep the heat high.",{id:"efr-s4",pc:"#736b62"}],["Splash in the soy sauce, toss in the spring onions and serve."]],
 notes:["Day-old rice really is better. Fresh rice goes mushy.","The kids like it with frozen peas thrown in at step 4."]};
var E=function(s){return String(s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})};
var P={
 logo:'<path d="M7 14a4 4 0 0 1-1-7.7 4.5 4.5 0 0 1 8.6-1.3 4 4 0 0 1 3.4 5.5A4 4 0 0 1 17 14v5H7z"/><path d="M7 17h10"/>',
 clock:'<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
 users:'<circle cx="9" cy="8" r="3.2"/><path d="M3 19c.5-3.4 3-5 6-5s5.5 1.6 6 5"/><path d="M16 5.3a3 3 0 0 1 0 5.4M18 14.3c1.7.6 2.8 2.2 3 4.7"/>',
 x:'<path d="M6 6l12 12M18 6L6 18"/>',
 bell:'<path d="M6 17V11a6 6 0 0 1 12 0v6l1.5 2h-15z"/><path d="M10 21h4"/>',
 print:'<path d="M7 9V4h10v5M7 17H5a1.5 1.5 0 0 1-1.5-1.5v-5A1.5 1.5 0 0 1 5 9h14a1.5 1.5 0 0 1 1.5 1.5v5A1.5 1.5 0 0 1 19 17h-2"/><rect x="7" y="14" width="10" height="6" rx="1"/>',
 save:'<path d="M6 4h12v17l-6-4-6 4z"/>',
 check:'<path d="M5 12.5l4.5 4.5L19 7.5"/>',
 pot:'<path d="M4 11h16v5a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z"/><path d="M2.5 11h19M9 7c0-1.5 1-1.5 1-3M14 7c0-1.5 1-1.5 1-3"/>',
 chat:'<path d="M4 5h16v11H9l-5 4z"/>',
 copy:'<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/>'
};
var ic=function(n,s){s=s||20;return '<svg width="'+s+'" height="'+s+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">'+P[n]+'</svg>'};
var member=st==="member",gone=st==="expired"||st==="cancelled",pf=function(p,sz,cls,alt){return '<span class="pf '+(cls||'')+'" style="--pc:'+p.pc+'" data-img="'+IMG+p.id+'-'+sz+'.webp" data-alt="'+E(alt)+'" role="img" aria-label="'+E(alt)+'"></span>'};

/* The invitation or the save, per option. Member sees Save instead; a member without Recipes sees nothing (no upsell to someone signed in). */
var slot=(function(){
 if(st==="norecipes"||st==="preview")return "";
 var mem=member||st==="norecipes";
 if(opt==="a")return mem
  ?'<aside class="rs-end" aria-labelledby="rs-endh"><span class="rs-eic">'+ic("save",28)+'</span><div><h2 id="rs-endh">Want this one in your kitchen?</h2><p>Saved as your own copy. Change it however you like; the original stays as it is.</p></div><button type="button" class="rs-btn" data-save>'+ic("save")+'<span>Save to my recipes</span></button></aside>'
  :'<aside class="rs-end" aria-labelledby="rs-endh"><span class="rs-eic">'+ic("logo",28)+'</span><div><h2 id="rs-endh">Liked it? Keep it in Kitchie.</h2><p>Kitchie is a kitchen notebook for your household: your recipes, what you have in, and a shopping list that follows.</p></div><div class="rs-acts"><a class="rs-btn" href="#">Try Kitchie</a><a class="rs-lnk" href="#">I have an account</a></div></aside>';
 if(opt==="b")return '<aside class="rs-bar" data-bar hidden aria-label="Kitchie">'+(mem
  ?'<span class="rs-bt"><b>Want it in your kitchen?</b></span><button type="button" class="rs-btn" data-save>'+ic("save")+'<span>Save to my recipes</span></button>'
  :'<span class="rs-bt"><b>Keep this recipe in Kitchie</b><small>Free to try. No card.</small></span><a class="rs-btn" href="#">Try Kitchie</a>')+'<button type="button" class="rs-x" data-dismiss aria-label="Dismiss">'+ic("x",18)+'</button></aside>';
 return '<aside class="rs-ban" data-ban aria-label="Kitchie">'+(mem
  ?'<span class="rs-eic">'+ic("save",24)+'</span><p><b>Want this one in your kitchen?</b> Save it as your own copy.</p><button type="button" class="rs-btn" data-save>'+ic("save")+'<span>Save to my recipes</span></button>'
  :'<span class="rs-eic">'+ic("logo",24)+'</span><p><b>New to Kitchie?</b> It keeps your recipes, pantry and shopping list in one place.</p><a class="rs-btn" href="#">Take a look</a>')+'<button type="button" class="rs-x" data-dismiss aria-label="Dismiss">'+ic("x",18)+'</button></aside>';
})();

var top='<header class="rs-top"><a class="rs-brand" href="#">'+ic("logo",24)+'<span>Kitchie</span></a>'+(member||st==="norecipes"?'<a class="rs-lnk" href="#">Open my kitchen</a>':'<a class="rs-lnk" href="#">Sign in</a>')+'</header>';

function page(){
 var note=st==="expiring"?'<p class="rs-note" role="status">'+ic("bell",18)+'<span>This link stops working in 5 hours (9:00 pm tonight). Print the recipe if you want to keep a copy.</span></p>':'';
 var ings=R.ings.map(function(i){return '<li><span>'+E(i[0])+'</span><b>'+E(i[1])+'</b></li>'}).join("");
 var steps=R.steps.map(function(s,k){return '<li><span class="rs-n">'+(k+1)+'</span><div><p>'+E(s[0])+'</p>'+(s[1]?'<div class="rs-sp">'+pf(s[1],"m","","Photo of step "+(k+1))+'</div>':'')+'</div></li>'}).join("");
 var notes=R.notes.map(function(n){return '<li>'+E(n)+'</li>'}).join("");
 return top+(opt==="c"?slot:'')+'<main class="rs-page" id="rs-main">'+note+
  '<div class="rs-hero">'+pf(R.banner,"l","lq","Photo of the finished dish")+'</div>'+
  '<div class="rs-head"><h1>'+E(R.title)+'</h1><p class="rs-bl">'+E(R.blurb)+'</p><div class="rs-meta"><span>'+ic("clock",18)+R.min+' min</span><span>'+ic("users",18)+'serves '+R.serves+'</span><button type="button" class="rs-ghost" onclick="window.print&&window.print()">'+ic("print",18)+'Print</button></div></div>'+
  '<div class="rs-cols"><section class="rs-ing" aria-labelledby="h-ing"><h2 id="h-ing">Ingredients</h2><ul>'+ings+'</ul></section>'+
  '<section class="rs-met" aria-labelledby="h-met"><h2 id="h-met">Method</h2><ol>'+steps+'</ol></section></div>'+
  '<section class="rs-nts" aria-labelledby="h-nts"><h2 id="h-nts">Notes from the cook</h2><ul>'+notes+'</ul></section>'+
  (opt==="a"?slot:'')+
  '<footer class="rs-foot"><p>Shared with you from a Kitchie kitchen. This link works until Fri 16 Oct, 9:00 pm.</p></footer></main>'+(opt==="b"?slot:'');
}

function goneView(){
 var msg=encodeURIComponent("Hi! The recipe link you sent me has stopped working. Could you send me a fresh one? "+LINK);
 return top+(opt==="c"?slot:'')+'<main class="rs-page rs-gone" id="rs-main"><div class="rs-gc"><span class="rs-pot">'+ic("pot",44)+'</span><h1>This link has run out</h1>'+
  '<p>Links to shared recipes stop working after a while, or when the sender turns them off. That keeps a recipe from staying open to everyone for ever.</p>'+
  '<p>The recipe is still with whoever sent it. Ask them for a fresh link.</p>'+
  '<button type="button" class="rs-btn" data-ask aria-expanded="false" aria-controls="rs-draft">'+ic("chat")+'<span>Ask for a new link</span></button>'+
  '<div class="rs-draft" id="rs-draft" hidden><p class="rs-dl">This message is ready to send from your own messages app:</p><blockquote>Hi! The recipe link you sent me has stopped working. Could you send me a fresh one? '+LINK+'</blockquote><div class="rs-acts"><a class="rs-btn" href="sms:?&body='+msg+'">'+ic("chat")+'<span>Open messages</span></a><button type="button" class="rs-ghost" data-copy>'+ic("copy",18)+'<span>Copy message</span></button></div><p class="rs-sm">Kitchie does not see this message or know who sent the link.</p></div></div>'+
  (opt==="a"?slot:'')+'</main>'+(opt==="b"?slot:'');
}

function previewView(){
 return '<main class="rs-pv"><p class="rs-sm">What a messaging app shows under the link</p>'+
 '<a class="rs-card" href="#"><span class="rs-ci">'+pf(R.banner,"l","lq in","Photo of the finished dish").replace('data-img=','data-now=')+'</span><span class="rs-cb"><small>kitchie.example</small><b>'+E(R.title)+'</b><span>20 min, serves 2. '+E(R.blurb)+'</span></span></a>'+
 '<p class="rs-sm">If the link has expired or been turned off, the preview gives nothing away about the recipe:</p>'+
 '<a class="rs-card plain" href="#"><span class="rs-cb"><small>kitchie.example</small><b>A shared recipe</b><span>Open the link to see it. Kitchie keeps recipes, pantry and shopping lists in one place.</span></span></a></main>';
}

var root=document.getElementById("rs-root");
root.innerHTML=st==="preview"?previewView():gone?goneView():page();
document.body.setAttribute("data-s",st);document.body.setAttribute("data-opt",opt);

/* Loading order (decided: text first, then step photos, then the banner last). The words are already on the page; boxes are sized and coloured from the first paint. */
function load(kind){document.querySelectorAll(".rs-"+(kind==="step"?"sp":"hero")+" .pf").forEach(function(f){var s=f.getAttribute("data-img");if(!s)return;var i=new Image();i.className="pi";i.alt="";i.onload=function(){f.classList.add("in")};i.src=s;f.appendChild(i)})}
document.querySelectorAll("[data-now]").forEach(function(f){var i=new Image();i.className="pi";i.alt="";i.onload=function(){f.classList.add("in")};i.src=f.getAttribute("data-now");f.appendChild(i)});
var ph=q.get("phase"),slow=st==="loading",T=slow?[900,1900]:[0,60];
if(ph==="text"){}else if(ph==="steps"){load("step")}else if(slow){setTimeout(function(){load("step")},T[0]);setTimeout(function(){load("banner")},T[1])}else{setTimeout(function(){load("step")},T[0]);setTimeout(function(){load("banner")},T[1])}
if(ph==="banner"){load("step");load("banner")}

/* In place, no refresh (DESIGN.md 6a): save, ask and dismiss change the page where it is. */
root.addEventListener("click",function(e){
 var b=e.target.closest("button,a");if(!b)return;
 if(b.hasAttribute("data-save")){var done=b.getAttribute("data-done")!=="1";b.setAttribute("data-done",done?"1":"0");b.querySelector("span").textContent=done?"Saved. Open in Recipes":"Save to my recipes";var svg=b.querySelector("svg");if(svg)svg.outerHTML=ic(done?"check":"save");b.classList.toggle("done",done)}
 if(b.hasAttribute("data-dismiss")){var bx=b.closest("[data-bar],[data-ban]");if(bx){bx.hidden=true;bx.setAttribute("data-gone","1");try{sessionStorage.setItem("rs-dismiss","1")}catch(x){}}}
 if(b.hasAttribute("data-ask")){var d=document.getElementById("rs-draft"),o=d.hidden;d.hidden=!o;b.setAttribute("aria-expanded",String(o))}
 if(b.hasAttribute("data-copy")){var s=b.querySelector("span");s.textContent="Copied";setTimeout(function(){s.textContent="Copy message"},1500)}
});
if(q.get("ask")==="1"){var ab=document.querySelector("[data-ask]");if(ab)ab.click()}

/* Option B: the bar waits until the person has read the ingredients (scrolled past 35%), never before. A dismiss lasts the visit. */
var bar=document.querySelector("[data-bar]");
if(bar){var off=false;try{off=sessionStorage.getItem("rs-dismiss")==="1"}catch(x){}
 var chk=function(){if(off||bar.getAttribute("data-gone"))return;var h=document.documentElement.scrollHeight-innerHeight;bar.hidden=!(gone||q.get("bar")==="1"||(h>0&&scrollY/h>.35))};
 addEventListener("scroll",chk,{passive:true});chk()}
if(q.get("scroll")==="mid")setTimeout(function(){scrollTo(0,(document.documentElement.scrollHeight-innerHeight)*.5)},40);
if(q.get("scroll")==="end")setTimeout(function(){scrollTo(0,1e6)},40);
})();
