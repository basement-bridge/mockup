/* Sign-up side of "Set someone up with their own household" (mockup). Draws two steps from the address; the personal message is data and is set with textContent. */
(function(){
"use strict";
var q=new URLSearchParams(location.search),step=/^(household|expired|used)$/.test(q.get("s"))?q.get("s"):"landing";
var SAMPLE="Hi Priya, this is what I use to keep track of our fridge and what to cook. I thought you might like a kitchen of your own. It takes about two minutes to set up. Arjan";
var none=q.get("msg")==="none",msg=none?"":(q.get("m")||SAMPLE).slice(0,280);
var root=document.getElementById("st");
function el(t,c,x){var n=document.createElement(t);if(c)n.className=c;if(x!==undefined)n.textContent=x;return n}
function glyph(){var s='<svg width="26" height="26" viewBox="0 0 32 32" aria-hidden="true" focusable="false"><path d="M3 20l13 7 13-7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" opacity=".4"/><path d="M3 15l13 7 13-7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" opacity=".7"/><path d="M16 3l13 7-13 7L3 10z" fill="currentColor" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>';var w=el("span","st-glyph");w.innerHTML=s;return w}
function note(compact){
 if(!msg)return null;
 var d=el("figure","st-note"+(compact?" compact":""));d.id="st-note";
 d.setAttribute("aria-label","A note from Arjan");
 var who=el("figcaption","st-notehd");who.appendChild(el("i","","A"));who.appendChild(el("span","","A note from Arjan, written for you"));
 d.appendChild(who);d.appendChild(el("blockquote","st-notebody",msg));return d}
function build(){
 root.textContent="";
 var brand=el("div","st-brand");brand.appendChild(glyph());brand.appendChild(el("span","","Kitchie"));root.appendChild(brand);
 var c=el("section","st-card");
 if(step==="landing"){
  var iv=el("p","st-pill");iv.appendChild(el("i","","A"));iv.appendChild(el("span","","Arjan\u2019s kitchen is in order. Now it\u2019s your turn."));c.appendChild(iv);
  c.appendChild(el("h1","","Your kitchen. Now your AI knows what\u2019s in\u00a0it."));
  c.appendChild(el("p","st-lead","You can drive Kitchie on the web, or with your favourite AI."));
  var n=note(false);if(n)c.appendChild(n);
  var b=el("a","st-btn","Start my kitchen");b.href="?s=household"+(none?"&msg=none":"&m="+encodeURIComponent(msg));b.id="st-go";c.appendChild(b);
  c.appendChild(el("p","st-small","Free while we\u2019re building Kitchie. No name or email needed."));
  var dt=el("details","st-more");dt.appendChild(el("summary","","What you should know"));
  var ul=el("ul");["This link works once. It is used up when you finish signing up, not when you open it.","It stops working a month after it was sent.","Your kitchen starts empty. Only the people you invite will see it. Arjan won\u2019t be a member and can\u2019t see your items."].forEach(function(t){ul.appendChild(el("li","",t))});dt.appendChild(ul);c.appendChild(dt)}
 else if(step==="expired"||step==="used"){
  var ex=step==="expired";
  c.appendChild(el("p","st-pill gone",ex?"This invitation has expired":"This invitation has been used"));
  c.appendChild(el("h1","",ex?"This link has run out":"This link has already been used"));
  c.appendChild(el("p","st-lead",ex?"An invitation stops working a month after it was sent. Ask Arjan to send you a new one and you can start your kitchen straight away.":"Each invitation works once, and this one was used when someone finished signing up. If that was you, sign in to carry on. If not, ask Arjan to send you a new one."));
  var b3=el("a","st-btn"+(ex?" st-quiet":""),ex?"Go to Kitchie":"Sign in with Google");b3.href="#";b3.id="st-gone";b3.addEventListener("click",function(e){e.preventDefault();var t=document.getElementById("st-done");t.hidden=false;t.textContent="Mockup: this goes to the Kitchie sign-in page."});c.appendChild(b3);
  var dn2=el("p","st-done");dn2.id="st-done";dn2.hidden=true;dn2.setAttribute("role","status");c.appendChild(dn2)}
 else{
  c.appendChild(el("p","st-pill ok","You are signed in. One last step"));
  c.appendChild(el("h1","","Your very own kitchen"));
  var n2=note(true);if(n2)c.appendChild(n2);
  c.appendChild(el("p","st-lead","Arjan thought you would like one. Zero peer pressure."));
  var f=el("label","st-field");f.appendChild(el("span","st-lbl","What should your household be called?"));
  var i=el("input");i.type="text";i.value="My kitchen";i.maxLength=40;i.autocomplete="off";i.id="st-name";f.appendChild(i);c.appendChild(f);
  c.appendChild(el("p","st-small","You can change it any time."));
  var b2=el("button","st-btn","Create my household");b2.type="button";b2.id="st-create";b2.addEventListener("click",function(){var t=document.getElementById("st-done");t.hidden=false;t.textContent="Mockup: this creates your household and opens it, empty and yours."});c.appendChild(b2);
  var dn=el("p","st-done");dn.id="st-done";dn.hidden=true;dn.setAttribute("role","status");c.appendChild(dn);
  c.appendChild(el("p","st-small","Arjan is not added to it."))}
 root.appendChild(c);
 var nav=el("p","st-mock");nav.appendChild(el("span","","Mockup only:"));
 [["landing","The link opens"],["household","After sign-in"],["expired","Expired"],["used","Already used"]].forEach(function(s){var a=el("a","",s[1]);a.href="?s="+s[0]+(none?"&msg=none":"&m="+encodeURIComponent(msg));if(s[0]===step)a.setAttribute("aria-current","page");nav.appendChild(a)});
 if(step==="landing"||step==="household"){var a2=el("a","",none?"With a message":"Without a message");a2.href="?s="+step+(none?"":"&msg=none");nav.appendChild(a2)}
 root.appendChild(nav)}
build();
})();
