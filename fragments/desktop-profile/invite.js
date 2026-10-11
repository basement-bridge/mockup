/* "Invite someone to a household of their own" (mockup, 12 Oct 2026; trimmed and extended the same day, round 9). Loaded by profile.js only when the gutter entry (or the Me row) is pressed. Static, no storage, no network.
   A GROWTH feature (owner): a way to get new households set up. A pop-up modal over the settings window (its own scrim; the window behind is inert) that makes a shareable link which lands the recipient on sign-up
   and ends with them creating their own household. The personal message stays with the link and is shown to them during sign-up (fragments/invite-new-household/start.html).
   Round 9 (owner, voice, 12 Oct 2026): the top of the modal is only the title, one line ("They get their own brand new household") and the message field; the way back is one plain low-key line; the link works once (used when they
   COMPLETE sign-up, opening it does not use it) and expires after one month if unused (never shown on the Link ready screen); the SAME gutter entry reads "Invite someone" until the person has sent an invite of any status, then
   "My invites", which opens the list of invites with a status each (Pending, Used, Expired); at most three pending at once (the send action is disabled at three, and says which invite frees a slot); the inviter has no link to the new household afterwards;
   the icon is a paper plane. States (inv= in the address): empty, filled, created, copied, list (My invites), limit (My invites at three pending). invs=none|some|full (profile.js) sets what has been sent, which sets the gutter and Me-row label.
   Notes and open questions: docs/knowledge/invite-new-household.md. Sample links and dates only, never a real address. */
(function(){
"use strict";
var $=function(s,r){return(r||document).querySelector(s)};
var H=function(){return window.KProfileH};
var P={send:'<path d="M21.500 2.500L10.500 13.500"/><path d="M21.500 2.500l-7 19-4-8.500-8.500-4z"/>',
 copy:'<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h8"/>',check:'<path d="M5 12.500l4.500 4.500L19 7"/>',link:'<path d="M10 14a4 4 0 0 0 5.700 0l3-3a4 4 0 0 0-5.700-5.700l-1 1"/><path d="M14 10a4 4 0 0 0-5.700 0l-3 3a4 4 0 0 0 5.700 5.700l1-1"/>',
 clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',hourglass:'<path d="M6 3h12M6 21h12M7 3c0 5 5 6 5 9s-5 4-5 9M17 3c0 5-5 6-5 9s5 4 5 9"/>',lock:'<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
 plus:'<path d="M12 5v14M5 12h14"/>'};
function ic(k,s){s=s||18;return '<svg class="pf-i" viewBox="0 0 24 24" width="'+s+'" height="'+s+'" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">'+P[k]+'</svg>'}
function narrow(){return window.matchMedia&&window.matchMedia("(max-width:600px)").matches}
function esc(t){return String(t).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}

var MAX=280,SLOTS=3;
var SAMPLE="Hi Priya, this is what I use to keep track of our fridge and what to cook. I thought you might like a kitchen of your own. It takes about two minutes to set up. Arjan";
var LINK="kitchie.example/start/sample-link";
var TODAY="12 Oct",TODAY_EXP="12 Nov";
/* Sample invites the person has sent (newest first). Dates are sample text. A link expires one month after it was sent; Used = the invited person finished sign-up. No names: the product never learns who it was for (INH-J7). */
var SEED={
 some:[{st:"pending",msg:"Hi Priya, this is what I use to keep track of our fridge and what to cook.",sent:"3 Oct",exp:"3 Nov"},
       {st:"used",msg:"Hi Sam, a kitchen of your own, two minutes to set up.",sent:"28 Sep",used:"30 Sep"},
       {st:"expired",msg:"",sent:"2 Sep",exp:"2 Oct"}],
 full:[{st:"pending",msg:"Hi Jo, I thought you might like this for the weekend shop.",sent:"9 Oct",exp:"9 Nov"},
       {st:"pending",msg:"Hi Priya, this is what I use to keep track of our fridge and what to cook.",sent:"3 Oct",exp:"3 Nov"},
       {st:"used",msg:"Hi Sam, a kitchen of your own, two minutes to set up.",sent:"28 Sep",used:"30 Sep"},
       {st:"pending",msg:"",sent:"20 Sep",exp:"20 Oct"},
       {st:"expired",msg:"Hi Lee, try this.",sent:"2 Sep",exp:"2 Oct"}]};
var INV={state:"empty",msg:"",items:null};
function items(){if(!INV.items){var m=H().invMode();INV.items=(SEED[m]||[]).map(function(x){return Object.assign({},x)})}return INV.items}
function pending(){return items().filter(function(x){return x.st==="pending"})}
function slotsLeft(){return SLOTS-pending().length}
function sync(){var n=items().length;H().invSet(!n?"none":(pending().length>=SLOTS?"full":"some"))}
function reseed(mode){INV.items=(SEED[mode]||[]).map(function(x){return Object.assign({},x)});sync()}
function setState(s){INV.state=s;if(s==="empty")INV.msg="";else if((s==="filled"||s==="created"||s==="copied")&&!INV.msg.trim())INV.msg=SAMPLE}
/* from the address (inv=): the pretend-sent list follows the state asked for */
function init(st){
 if(st==="limit"){reseed("full");INV.state="list";return}
 if(st==="list"){if(!items().length)reseed("some");INV.state="list";return}
 if(/^(empty|filled|created|copied)$/.test(st)){setState(st);if(st==="created"||st==="copied")addNew(true)}}
/* pressed from the gutter or the Me row: once something has been sent it opens My invites, otherwise the form; a link just made stays on screen if you went to the way back and returned */
function open(st){
 if(st){init(st);return}
 if(INV.state==="created"||INV.state==="copied")return;
 INV.state=items().length?"list":"empty";if(INV.state==="empty")INV.msg=""}
function addNew(quiet){
 var its=items();
 if(quiet&&its.some(function(x){return x._mine}))return;
 its.unshift({st:"pending",msg:INV.msg.trim(),sent:TODAY,exp:TODAY_EXP,_mine:true});sync()}
function title(){return INV.state==="list"?"My invites":"Invite someone to a household of their own"}

/* the way back: one plain, low-key line (owner, 12 Oct 2026). It is not a card. */
function wrong(){
 return '<p class="pf-invwrong">Want to invite them to your household instead? <button type="button" class="pf-invlk" data-inv="back">Click here</button></p>'}

function form(){
 var len=INV.msg.length;
 return '<label class="pf-field pf-invmsg"><span class="pf-lbl">Your message to them</span><textarea class="pf-in pf-ta" id="inv-msg"'+(narrow()?'':' data-focus')+' rows="4" maxlength="'+MAX+'" data-invmsg placeholder="For example: Hi Priya, this is what I use to keep track of our fridge. I thought you might like one of your own." aria-describedby="inv-help inv-count">'+esc(INV.msg)+'</textarea></label>'
  +'<div class="pf-invmeta"><span class="pf-small" id="inv-help">They see it next to the sign-up button. Optional.</span><span class="pf-small pf-invcount" id="inv-count" aria-live="polite"><span data-invcount>'+len+'</span> of '+MAX+'</span></div>'
  +wrong()}

function created(copied){
 var has=!!INV.msg.trim();
 return '<div class="pf-invkick"><span class="pf-invpill ok">'+ic("check",15)+' Link ready</span></div>'
  +'<div class="pf-invlink"><span class="pf-ico">'+ic("link",18)+'</span><input class="pf-in" id="inv-link" type="text" readonly value="'+LINK+'" aria-label="Their link (sample, not a real address)"><button type="button" class="pf-btn pri" data-focus data-inv="copy" aria-describedby="inv-copied">'+(copied?ic("check",18)+' Copied':ic("copy",18)+' Copy link')+'</button></div>'
  +'<p class="pf-small pf-invcopied" id="inv-copied" role="status">'+(copied?'Copied. Paste it into a message to them.':'Send it to them yourself, in whatever you already use.')+'</p>'
  +'<p class="pf-invonce">'+ic("lock",16)+'<span><b>Works once.</b> Opening it does not use it up; finishing sign-up does.</span></p>'
  +'<div class="pf-invprev"><span class="pf-lbl">What they will see, next to the sign-up button</span>'+(has?'<blockquote class="pf-invq"><i aria-hidden="true">A</i><span>'+esc(INV.msg.trim())+'</span></blockquote>':'<p class="pf-small pf-invnone">No message. They see the standard invitation only.</p>')+'</div>'
  +wrong()}

/* My invites: a list of invites sent, each with a status. Used is a record only: no name, no link to their household (owner: a clean handoff). */
var ST={pending:["clock","Pending"],used:["check","Used"],expired:["hourglass","Expired"]};
function when(x){return x.st==="pending"?"Expires "+x.exp:x.st==="used"?"Used "+x.used:"Expired "+x.exp}
function list(){
 var its=items(),pn=pending(),left=slotsLeft(),full=left<=0;
 var soon=pn.length?pn[pn.length-1]:null;
 var note=full
  ?'<p class="pf-invlim" id="inv-lim" role="status"><b>You have '+SLOTS+' invites pending, the most at one time.</b> You can send another when one is used or expires. The next to free a slot is the one sent '+soon.sent+', which expires '+soon.exp+'.</p>'
  :'<p class="pf-small pf-invslots" id="inv-lim">'+pn.length+' of '+SLOTS+' pending. A slot frees when an invite is used or expires.</p>';
 var rows=its.map(function(x,i){
  var s=ST[x.st],last=full&&x.st==="pending"&&x===soon;
  return '<li class="pf-invrow" data-st="'+x.st+'"><div class="pf-invrt"><span class="pf-invmsgt">'+(x.msg?esc(x.msg):'<i>No message</i>')+'</span><span class="pf-small">Sent '+x.sent+' &middot; '+when(x)+'</span>'
   +(full&&x.st==="pending"?'<span class="pf-small pf-invfree">Frees a slot when used'+(last?', or on '+x.exp+' when it expires':', or when it expires on '+x.exp)+'.</span>':'')
   +'</div><span class="pf-invbadge '+x.st+'">'+ic(s[0],14)+' '+s[1]+'</span>'
   +(x.st==="pending"?'<button type="button" class="pf-btn sm" data-inv="copyrow" data-i="'+i+'">'+ic("copy",16)+' Copy link</button>':'')+'</li>'}).join("");
 return note+'<ul class="pf-invlist" aria-label="Invites you have sent">'+rows+'</ul>'
  +'<p class="pf-small pf-invrec">Used is a record only. It does not link you to their household.</p>'}

function foot(){
 if(INV.state==="created"||INV.state==="copied")return (slotsLeft()>0?'<button type="button" class="pf-btn" data-inv="another">Make another link</button>':'<button type="button" class="pf-btn" data-inv="tolist">My invites</button>')+'<button type="button" class="pf-btn pri" data-inv="done">Done</button>';
 if(INV.state==="list"){var full=slotsLeft()<=0;
  return '<button type="button" class="pf-btn" data-close'+(full?' data-focus':'')+'>Done</button><button type="button" class="pf-btn pri" data-inv="new" '+(full?'disabled aria-disabled="true" aria-describedby="inv-lim"':'data-focus')+'>'+ic("send",18)+' Send a new invite</button>'}
 return (items().length?'<button type="button" class="pf-btn" data-inv="tolist">Cancel</button>':'<button type="button" class="pf-btn" data-close>Cancel</button>')+'<button type="button" class="pf-btn pri" data-inv="create">'+ic("send",18)+' Create their link</button>'}
function seg(label,name,opts,cur){
 return '<span class="pf-mock pf-mockf pf-invmock"><span>'+label+'</span><span class="pf-seg" role="radiogroup" aria-label="'+label+'">'+opts.map(function(x){return '<button type="button" role="radio" aria-checked="'+(cur===x[0])+'" data-inv="'+name+'" data-v="'+x[0]+'">'+x[1]+'</button>'}).join("")+'</span></span>'}
function mock(){
 var o=INV.state==="list"?(slotsLeft()<=0?"limit":"list"):INV.state;
 var m=H().invMode();
 return seg("Mockup only. Show","state",[["empty","Empty"],["filled","Filled"],["created","Link ready"],["copied","Copied"],["list","My invites"],["limit","At 3"]],o)
  +seg("Invites sent so far","mode",[["none","None"],["some","Some"],["full","3 pending"]],m)}

function render(){
 var done=INV.state==="created"||INV.state==="copied",lst=INV.state==="list";
 var sub=(!done&&!lst)?'<p class="pf-invone">They get their own brand new household</p>':'';
 return '<div class="pf-head"><span class="pf-ico">'+ic("send",20)+'</span><div class="pf-who"><h2 id="pf-inv-t">'+title()+'</h2>'+sub+'</div>'+H().xbtn()+'</div>'
  +'<div class="pf-body pf-invb">'+(done?created(INV.state==="copied"):lst?list():form())+'</div>'
  +'<div class="pf-foot pf-invf"><span class="pf-invbtns">'+foot()+'</span>'+mock()+'</div>'}

function click(m,el,Hh){
 var a=el.dataset.inv;if(!a)return false;
 if(a==="create"){INV.state="created";addNew(false);Hh.paint(m,false,'[data-inv="copy"]');return true}
 if(a==="copy"){INV.state="copied";Hh.paint(m,false,'[data-inv="copy"]');return true}
 if(a==="copyrow"){Hh.toast("Mockup: link copied (sample, nothing is copied)");return true}
 if(a==="another"||a==="new"){setState("empty");Hh.paint(m,false,"#inv-msg");return true}
 if(a==="tolist"){INV.state="list";Hh.paint(m,false,'[data-inv="new"]:not([disabled]),[data-close]');return true}
 if(a==="done"){setState("empty");Hh.closeTop();return true}
 if(a==="back"){Hh.inviteBack();return true}
 if(a==="state"){var v=el.dataset.v;
  if(v==="limit"){if(slotsLeft()>0)reseed("full");INV.state="list"}
  else if(v==="list"){if(!items().length||slotsLeft()<=0)reseed("some");INV.state="list"}
  else{setState(v);if((v==="created"||v==="copied")&&!items().some(function(x){return x._mine}))addNew(false)}
  Hh.paint(m,false,'[data-inv="state"][data-v="'+v+'"]');return true}
 if(a==="mode"){var md=el.dataset.v;reseed(md);if(md==="none")setState("empty");else INV.state="list";
  Hh.paint(m,false,'[data-inv="mode"][data-v="'+md+'"]');return true}
 return false}
document.addEventListener("input",function(e){
 var t=e.target;if(!t||!t.hasAttribute||!t.hasAttribute("data-invmsg"))return;
 INV.msg=t.value;INV.state=t.value.trim()?"filled":"empty";
 var c=$("[data-invcount]");if(c)c.textContent=t.value.length;
 var r=$$s('[data-inv="state"]');r.forEach(function(b){b.setAttribute("aria-checked",String(b.dataset.v===INV.state))})});
function $$s(s){return Array.prototype.slice.call(document.querySelectorAll(s))}

window.KProfileInvite={render:render,click:click,init:init,open:open,title:title};
})();
