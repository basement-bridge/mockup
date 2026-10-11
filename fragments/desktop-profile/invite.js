/* "Set someone up with their own household" (mockup, 12 Oct 2026). Loaded by profile.js only when the gutter entry (or the Me row) is pressed. Static, no storage, no network.
   A GROWTH feature (owner, 12 Oct 2026): a way to get new households set up, not a utility tweak. A pop-up modal over the settings window (its own scrim; the window behind is inert) that makes a shareable link
   which lands the recipient on sign-up and ends with them creating their own household. The personal message stays attached to the link and is shown to them during sign-up
   (fragments/invite-new-household/start.html). Clearly not the "invite someone to my household" flow, and one press away from it (data-inv="back").
   States: empty, filled, created (link ready), copied. Notes and open questions: docs/knowledge/invite-new-household.md. Sample link only, never a real address. */
(function(){
"use strict";
var $=function(s,r){return(r||document).querySelector(s)};
var H=function(){return window.KProfileH};
var P={sprout:'<path d="M12 21v-8"/><path d="M12 13c0-4 2.5-6.500 7-6.500 0 4-2.500 6.500-7 6.500z"/><path d="M12 15c0-3-2-5-6-5 0 3 2 5 6 5z"/>',
 copy:'<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h8"/>',check:'<path d="M5 12.500l4.500 4.500L19 7"/>',link:'<path d="M10 14a4 4 0 0 0 5.700 0l3-3a4 4 0 0 0-5.700-5.700l-1 1"/><path d="M14 10a4 4 0 0 0-5.700 0l-3 3a4 4 0 0 0 5.700 5.700l1-1"/>',
 home:'<path d="M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',arrow:'<path d="M5 12h14M13 6l6 6-6 6"/>',spark:'<path d="M12 3l1.800 5.200L19 10l-5.200 1.800L12 17l-1.800-5.200L5 10l5.200-1.800z"/>',
 people:'<circle cx="9" cy="8" r="3.500"/><path d="M2.500 20c0-3.600 2.900-6 6.500-6s6.500 2.400 6.500 6"/><circle cx="17" cy="9" r="2.600"/><path d="M17 14c2.800 0 4.500 1.900 4.500 5"/>'};
function ic(k,s){s=s||18;return '<svg class="pf-i" viewBox="0 0 24 24" width="'+s+'" height="'+s+'" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">'+P[k]+'</svg>'}
function narrow(){return window.matchMedia&&window.matchMedia("(max-width:600px)").matches}
function esc(t){return String(t).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}

var MAX=280;
var SAMPLE="Hi Priya, this is what I use to keep track of our fridge and what to cook. I thought you might like a kitchen of your own. It takes about two minutes to set up. Arjan";
var LINK="kitchie.example/start/sample-link";
var INV={state:"empty",msg:""};
function setState(s){INV.state=s;if(s==="empty")INV.msg="";else if(!INV.msg.trim())INV.msg=SAMPLE}
function init(st){if(/^(empty|filled|created|copied)$/.test(st))setState(st)}
function recvHref(){return "../invite-new-household/start.html?s=landing"+(INV.msg.trim()?"&m="+encodeURIComponent(INV.msg.trim()):"&msg=none")}

/* the picture that says what this is: two separate households, nothing joined */
function diagram(){
 return '<div class="pf-invdia" aria-hidden="true"><div class="pf-invhh"><b>Our kitchen</b><span class="pf-invppl"><i>A</i><i>S</i><i>M</i><i>J</i></span><small>Yours. Stays as it is.</small></div>'
  +'<div class="pf-invgap"><span></span><em>not joined</em><span></span></div>'
  +'<div class="pf-invhh new"><b>Their household</b><span class="pf-invppl"><i class="q">?</i></span><small>Brand new and empty.</small></div></div>'}
function wrong(created){
 return '<div class="pf-invwrong">'+ic("people",22)+'<div class="pf-t">Want them in Our kitchen, sharing your pantry and list?<small>That is a different invite: it adds them to your household.</small></div><button type="button" class="pf-btn" data-inv="back">Invite someone to Our kitchen'+ic("arrow",16)+'</button></div>'}

function form(){
 var len=INV.msg.length;
 return '<div class="pf-invkick"><span class="pf-invpill">'+ic("sprout",15)+' Their own household</span><span class="pf-small">Not joining Our kitchen</span></div>'
  +'<p class="pf-invlead">They get a brand-new household of their own: their own pantry, shopping list and recipes. You are not a member of it and cannot see what is in it.</p>'
  +diagram()+wrong()
  +'<label class="pf-field pf-invmsg"><span class="pf-lbl">Your message to them</span><textarea class="pf-in pf-ta" id="inv-msg"'+(narrow()?'':' data-focus')+' rows="4" maxlength="'+MAX+'" data-invmsg placeholder="For example: Hi Priya, this is what I use to keep track of our fridge. I thought you might like one of your own." aria-describedby="inv-help inv-count">'+esc(INV.msg)+'</textarea></label>'
  +'<div class="pf-invmeta"><span class="pf-small" id="inv-help">They read this when they open the link, and again while they sign up. It stays with the link. You can leave it empty.</span><span class="pf-small pf-invcount" id="inv-count" aria-live="polite"><span data-invcount>'+len+'</span> of '+MAX+'</span></div>'}

function created(copied){
 var has=!!INV.msg.trim();
 return '<div class="pf-invkick"><span class="pf-invpill ok">'+ic("check",15)+' Link ready</span><span class="pf-small">For someone starting their own household</span></div>'
  +'<div class="pf-invlink"><span class="pf-ico">'+ic("link",18)+'</span><input class="pf-in" id="inv-link" type="text" readonly value="'+LINK+'" aria-label="Their link (sample, not a real address)"><button type="button" class="pf-btn pri" data-focus data-inv="copy" aria-describedby="inv-copied">'+(copied?ic("check",18)+' Copied':ic("copy",18)+' Copy link')+'</button></div>'
  +'<p class="pf-small pf-invcopied" id="inv-copied" role="status">'+(copied?'Copied. Paste it into a message to them.':'Send it to them yourself, in whatever you already use.')+'</p>'
  +'<div class="pf-invprev"><span class="pf-lbl">What they will see, next to the sign-up button</span>'+(has?'<blockquote class="pf-invq"><i aria-hidden="true">A</i><span>'+esc(INV.msg.trim())+'</span></blockquote>':'<p class="pf-small pf-invnone">No message. They see the standard invitation only.</p>')+'<a class="pf-lnk" href="'+recvHref()+'" target="_blank" rel="noopener">See their sign-up screen</a></div>'
  +'<ul class="pf-invfacts"><li>'+ic("link",16)+'<span><b>Works once</b> and expires after 48 hours.</span></li><li>'+ic("home",16)+'<span><b>They get their own household.</b> You will not be a member of it and cannot see its items.</span></li></ul>'+wrong()}

function foot(){
 if(INV.state==="created"||INV.state==="copied")return '<button type="button" class="pf-btn" data-inv="another">Make another link</button><button type="button" class="pf-btn pri" data-inv="done">Done</button>';
 return '<button type="button" class="pf-btn" data-close>Cancel</button><button type="button" class="pf-btn pri" data-inv="create">'+ic("link",18)+' Create their link</button>'}
function mock(){
 var o=INV.state;
 return '<span class="pf-mock pf-mockf pf-invmock"><span>Mockup only. State</span><span class="pf-seg" role="radiogroup" aria-label="Pretend the modal is">'+[["empty","Empty"],["filled","Filled"],["created","Link ready"],["copied","Copied"]].map(function(x){return '<button type="button" role="radio" aria-checked="'+(o===x[0])+'" data-inv="state" data-v="'+x[0]+'">'+x[1]+'</button>'}).join("")+'</span></span>'}

function render(){
 var done=INV.state==="created"||INV.state==="copied";
 return '<div class="pf-head"><span class="pf-ico">'+ic("sprout",20)+'</span><div class="pf-who"><span class="pf-invcr">A household of their own</span><h2 id="pf-inv-t">Set someone up with their own household</h2></div>'+H().xbtn()+'</div>'
  +'<div class="pf-body pf-invb">'+(done?created(INV.state==="copied"):form())+'</div>'
  +'<div class="pf-foot pf-invf"><span class="pf-invbtns">'+foot()+'</span>'+mock()+'</div>'}

function click(m,el,Hh){
 var a=el.dataset.inv;if(!a)return false;
 if(a==="create"){INV.state="created";Hh.paint(m,false,'[data-inv="copy"]');return true}
 if(a==="copy"){INV.state="copied";Hh.paint(m,false,'[data-inv="copy"]');return true}
 if(a==="another"){setState("empty");Hh.paint(m,false,"#inv-msg");return true}
 if(a==="done"){setState("empty");Hh.closeTop();return true}
 if(a==="back"){Hh.inviteBack();return true}
 if(a==="state"){setState(el.dataset.v);Hh.paint(m,false,'[data-inv="state"][data-v="'+el.dataset.v+'"]');return true}
 return false}
document.addEventListener("input",function(e){
 var t=e.target;if(!t||!t.hasAttribute||!t.hasAttribute("data-invmsg"))return;
 INV.msg=t.value;INV.state=t.value.trim()?"filled":"empty";
 var c=$("[data-invcount]");if(c)c.textContent=t.value.length;
 var r=$$s('[data-inv="state"]');r.forEach(function(b){b.setAttribute("aria-checked",String(b.dataset.v===INV.state))})});
function $$s(s){return Array.prototype.slice.call(document.querySelectorAll(s))}

window.KProfileInvite={render:render,click:click,init:init};
})();
