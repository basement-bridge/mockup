/* Profile window: two-pane, settings-style (owner decision, 9 October 2026). Static sample data, no storage, no libraries.
   Reusable: load profile.css + profile.js on any page and call window.KProfile.open(opener) / .close(). The window is built only when opened.
   Modal rules: scrim covers the whole window, the page behind is inert, focus is trapped and handed back to the opener; Ctrl/Cmd+Esc, the x button and a scrim click close (plain Esc closes nothing). Full screen with a small buffer (11 Oct 2026).
   Standalone page (the mockup Pantry): ?open=1|me|settings|preferences|household|data|shortcuts opens it at load.
   11 Oct 2026 (owner): Preferences is its own section, right after Settings, so the sections are numbered 1 to 6 and the number keys jump to them (the same keys the built window uses).
   11 Oct 2026 (owner, round 4): History leaves the section list and is docked at the bottom of the left gutter, right above the keys line (behaviour pending the owner); Settings expands under itself in the gutter (Looks, Kitchen setup: Categories, Locations and spots, Install) and the detail of a row is a flyout in the main area; Install knows desktop from phone and tablet; Preferences has three desktop layouts to choose from (footer control, ?pref=a|b|c). The sub-screens are drawn by profile-subs.js, loaded on first need.
   12 Oct 2026 (owner, round 7, mockup only): proposing for a housemate lives on that housemate's row (Mine no longer has it); layout A has its own phone and tablet layout under 900px (profile-prefs-m.js + .css, loaded only then; ?pref=a, &pq=rice opens the picker with a search typed). Notes: docs/knowledge/settings-window.md SW-47 on.
   ?open=settings&sub=looks|cats|locs|install, &sel=cat:dairy|loc:fridge|spot:fridge.door, &os=chrome|edge|safari|firefox|ios|android, &pref=a|b|c (&psub=mine|hh|members, &ptab=mine|hh, &as=arjan|sam).
   Preferences is drawn by the Preferences mockup itself (fragments/preferences-mine-household, embed mode), loaded in a frame only when the section is first shown.
   12 Oct 2026 (owner, round 5, mockup only): Preferences layout A is the chosen one and is redrawn in profile-prefs.js (+ .css, loaded only for ?pref=a): Mine in full, Household, one gutter row per housemate who has food to show; ?psub=mine|hh|sam|maya|arjan, &chg=0|2 (the dot for what changed since last seen; 0 = all seen; the old 1 and 3, badge and summary, now draw the dot too), &sel=a:... for a flyout. Profile: the name edits in place; AI assistants show who is connected and the default (&ai=none|one|many|choose). Locations: rows are names only, one form to add and edit (&sel=loc:new). */
(function(){
"use strict";
var SELF=document.currentScript&&document.currentScript.src||"";
var NAME="persian",SUB="Full Stack Cook",LETTER="P";
var $=function(s,r){return(r||document).querySelector(s)};
var $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};

/* ---------- icons ---------- */
var P={
user:'<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/>',
sliders:'<path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/>',
clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
people:'<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6"/><circle cx="17" cy="9" r="2.6"/><path d="M17 14c2.8 0 4.5 1.9 4.5 5"/>',
down:'<path d="M12 4v11M7 11l5 5 5-5M5 20h14"/>',
chev:'<path d="M9 6l6 6-6 6"/>',
back:'<path d="M15 6l-6 6 6 6"/>',
close:'<path d="M6 6l12 12M18 6L6 18"/>',
pencil:'<path d="M4 20l1-4L16 5l3 3L8 19z"/>',
copy:'<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h8"/>',
plus:'<path d="M12 5v14M5 12h14"/>',
spark:'<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/>',
hat:'<path d="M7 14a4 4 0 1 1 2-7 4 4 0 0 1 6 0 4 4 0 1 1 2 7v6H7z"/>',
door:'<path d="M10 4H5v16h5M15 8l4 4-4 4M19 12H9"/>',
kbd:'<rect x="2.5" y="6" width="19" height="12" rx="2"/><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M7 14h10"/>',
prefs:'<path d="M5 4v16M12 4v16M19 4v16"/><circle cx="5" cy="14" r="2"/><circle cx="12" cy="8" r="2"/><circle cx="19" cy="15" r="2"/>',
mail:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 7 9-7"/>',
look:'<circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 0 0 18z" fill="currentColor"/>',
tag:'<path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="8.5" r="1.2"/>',
pin:'<path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.800 12 21 12 21z"/><circle cx="12" cy="9.500" r="2.500"/>',
lock:'<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
up:'<path d="M6 15l6-6 6 6"/>',
downc:'<path d="M6 9l6 6 6-6"/>',
check:'<path d="M5 12.500l4.500 4.500L19 7"/>',
ext:'<path d="M14 4h6v6"/><path d="M20 4l-9 9"/><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
send:'<path d="M21.500 2.500L10.500 13.500"/><path d="M21.500 2.500l-7 19-4-8.500-8.500-4z"/>',
sprout:'<path d="M12 21v-8"/><path d="M12 13c0-4 2.5-6.500 7-6.500 0 4-2.500 6.500-7 6.500z"/><path d="M12 15c0-3-2-5-6-5 0 3 2 5 6 5z"/>'
};
function ic(k,s){s=s||20;return '<svg class="pf-i" viewBox="0 0 24 24" width="'+s+'" height="'+s+'" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">'+P[k]+'</svg>'}
/* The owner's badge: stacked layers with a letter on the top layer. Colours come from tokens in CSS. */
function badge(px){return '<svg class="pf-badge" viewBox="0 0 32 32" width="'+px+'" height="'+px+'" aria-hidden="true" focusable="false"><path class="l3" d="M3 20l13 7 13-7"/><path class="l2" d="M3 15l13 7 13-7"/><path class="l1" d="M16 3l13 7-13 7L3 10z"/><text x="16" y="13.2" text-anchor="middle">'+LETTER+'</text></svg>'}
function bw(px,inner){return '<span class="pf-badgewrap" style="width:'+px+'px;height:'+px+'px">'+badge(Math.round(px*.62))+'</span>'}

/* ---------- views and keys ---------- */
var VIEWS={
 me:{t:"Me",icon:"user",k:"M"},
 settings:{t:"Settings",icon:"sliders",k:"S"},
 preferences:{t:"Preferences",icon:"prefs",k:""},
 household:{t:"Household",icon:"people",k:"H"},
 data:{t:"My data",icon:"down",k:"D"}
};
/* Page-level shortcuts (no window open): G then a letter. Preferences has no letter, it is the 3 key inside the window. */
var KEYS={p:"profile",m:"me",s:"settings",h:"household",d:"data"};
/* Inside the open window: the number keys, in the order of the list (a Proposal, as in the built window). */
var ORDER=["me","settings","preferences","household","data"];
var NUM={};ORDER.forEach(function(k,i){NUM[String(i+1)]=k});
function num(k){return String(ORDER.indexOf(k)+1)}
function keys(k){return '<span class="pf-keys" aria-label="shortcut: G then '+k+'"><kbd>G</kbd><kbd>'+k+'</kbd></span>'}
function nkey(k){return '<span class="pf-keys" aria-label="shortcut: '+k+'"><kbd>'+k+'</kbd></span>'}
/* The one close key everywhere in Kitchie desktop: Ctrl+Esc, Cmd+Esc on a Mac (the build's platformKey()). Ctrl/Cmd+Enter is a silent alias, not shown anywhere. Plain Esc closes nothing. */
var ESCL=/Mac|iPhone|iPad/.test(navigator.platform||"")?"\u2318 Esc":"Ctrl Esc";

/* ---------- pane content (drawn on first view) ---------- */
function sw(label,on){return '<li><button type="button" class="pf-sw" role="switch" aria-checked="'+on+'"><span>'+label+'</span><i aria-hidden="true"></i></button></li>'}
function paneMe(){
 return '<div class="pf-metop"><button type="button" class="pf-avedit" data-toast="Mockup: this opens the picture picker" aria-label="Change your picture"><span class="pf-badgewrap">'+badge(52)+'</span><span class="pe" aria-hidden="true">'+ic("pencil",14)+'</span></button><div class="pf-who2" id="pf-who2">'+nameBtn()+'</div></div>'
 +'<div><span class="pf-lbl">Yours</span><ul class="pf-list">'
 +row("hat","Kitchen role",SUB,'',"Mockup: this opens the role picker")
 +rowInv()
 +'</ul></div>'
 +aiBlock()}
/* The name, in place (owner, 12 Oct 2026): the name sits where "tap the picture to change it" was, with a small pencil; pressing it turns it into a box right there, Enter or leaving the box keeps it. No separate Name field. */
function nameBtn(){return '<button type="button" class="pf-nameedit" data-act="editname" aria-label="Edit your name. Now '+esc(NAME)+'"><span class="pf-nm">'+esc(NAME)+'</span><span class="pf-nmp" aria-hidden="true">'+ic("pencil",16)+'</span></button>'}
function nameInp(){return '<input class="pf-in pf-nameinp" type="text" value="'+esc(NAME)+'" maxlength="24" autocomplete="off" spellcheck="false" aria-label="Your name" data-nameinp><span class="pf-small pf-namehint" role="status" data-namehint>Saves automatically. 24 characters at most.</span>'}
function esc(t){return String(t).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
/* AI assistants (owner, 12 Oct 2026, round 9: connect natively). Same rules as before (uat: server/src/preferences/profile-assistant.ts): one connected is used automatically (no radio), two or more need a default (the row is the radio), none connected says so. New in round 9 (SW-63 on): the only actions are Connect and Disconnect (Reset and link again, and Link another assistant, are gone: every assistant is listed, so connecting another is its own Connect); every row opens that assistant in place (a flyout beside the list, a page on a phone), so a connected row is never inert, and a connected row has a button that opens the assistant itself (Open in Claude is a real deep link; the others open the app and copy the message). Connect has four states per assistant: off, connecting (waiting for the assistant, in Kitchie), on, and failed (the person said No, or nothing came back). Drawn by profile-subs.js (the panel) and here (the list). Sample state only; nothing is sent. */
var AI={st:{claude:"on",chatgpt:"on",gemini:"off"},dflt:"claude",conf:null},AINAME={claude:"Claude",chatgpt:"ChatGPT",gemini:"Gemini"},AIIDS=["claude","chatgpt","gemini"],AIOPEN={claude:"Open in Claude",chatgpt:"Open ChatGPT",gemini:"Open Gemini"};
window.KProfileAIData={AI:AI,NAME:AINAME,IDS:AIIDS,OPEN:AIOPEN};
function aiSet(k){AI.st={claude:k!=="none"?"on":"off",chatgpt:(k==="many"||k==="choose")?"on":"off",gemini:"off"};AI.dflt=k==="many"?"claude":null;AI.conf=null}
function aiLinked(){return AIIDS.filter(function(i){return AI.st[i]==="on"})}
/* &aic=claude:connecting,chatgpt:late (off|connecting|on|cancelled|late) and &aidc=claude (the Disconnect question is open) */
function aiInit(I){
 if(I.aic)I.aic.split(",").forEach(function(p){var a=p.split(":");if(AIIDS.indexOf(a[0])>-1&&/^(off|connecting|on|cancelled|late)$/.test(a[1]))AI.st[a[0]]=a[1]});
 if(AIIDS.indexOf(I.aidc)>-1&&AI.st[I.aidc]==="on")AI.conf=I.aidc;
 if(!aiLinked().length||aiLinked().length===1)AI.dflt=null;
 else if(AI.dflt&&AI.st[AI.dflt]!=="on")AI.dflt=null}
function aiRow(id,many){
 var st=AI.st[id],nm=AINAME[id],d=AI.dflt===id;
 var chev='<button type="button" class="pf-aichev" data-sel="ai:'+id+'" aria-pressed="false" aria-label="'+nm+': details">'+ic("chev",18)+'</button>';
 if(st==="on"){
  var main=many
   ?'<button type="button" class="pf-arad" role="radio" aria-checked="'+d+'" data-ai="default" data-id="'+id+'"><span class="pf-ai-ck" aria-hidden="true"></span><span class="pf-t">'+nm+'<small>'+(d?'Your default':'Make it the default')+'</small></span></button>'
   :'<button type="button" class="pf-arad" data-sel="ai:'+id+'" aria-pressed="false"><span class="pf-ai-ck none" aria-hidden="true"></span><span class="pf-t">'+nm+'<small>Used automatically</small></span></button>';
  return '<li class="pf-ai'+(d?' dflt':'')+'"'+(many?' role="presentation"':'')+'>'+main+'<span class="pf-aiact"><span class="pf-chip ok">Connected</span><button type="button" class="pf-btn sm pf-aiopen" data-ai="open" data-id="'+id+'" aria-label="'+AIOPEN[id]+'">'+ic("ext",16)+'<span>'+AIOPEN[id]+'</span></button>'+chev+'</span></li>'}
 if(st==="connecting")
  return '<li class="pf-ai wait"><button type="button" class="pf-arad" data-sel="ai:'+id+'" aria-pressed="false"><span class="pf-ai-ck wait" aria-hidden="true"></span><span class="pf-t">'+nm+'<small>Waiting for '+nm+'</small></span></button><span class="pf-aiact"><span class="pf-chip acc">Connecting</span><button type="button" class="pf-btn sm" data-sel="ai:'+id+'" aria-pressed="false" aria-label="Continue connecting '+nm+'">Continue</button></span></li>';
 if(st==="cancelled"||st==="late")
  return '<li class="pf-ai bad"><button type="button" class="pf-arad" data-sel="ai:'+id+'" aria-pressed="false"><span class="pf-ai-ck off" aria-hidden="true"></span><span class="pf-t">'+nm+'<small class="pf-bad">'+(st==="cancelled"?'Cancelled. Nothing was connected':'Did not finish. Nothing was connected')+'</small></span></button><span class="pf-aiact"><button type="button" class="pf-btn sm pf-aigo" data-ai="connect" data-id="'+id+'" aria-label="Try connecting '+nm+' again">Try again</button></span></li>';
 return '<li class="pf-ai off"><button type="button" class="pf-arad" data-sel="ai:'+id+'" aria-pressed="false"><span class="pf-ai-ck off" aria-hidden="true"></span><span class="pf-t">'+nm+'<small>Not connected</small></span></button><span class="pf-aiact"><button type="button" class="pf-btn sm pf-aigo" data-ai="connect" data-id="'+id+'" aria-label="Connect '+nm+'">Connect</button></span></li>'}
function aiBlock(){
 var on=aiLinked(),many=on.length>1;
 var rows=AIIDS.map(function(id){return aiRow(id,many)}).join("");
 var note=!on.length?'<p class="pf-small">No assistant is connected yet. Connect one and it is used automatically.</p>'
  :!many?'<p class="pf-small">'+AINAME[on[0]]+' is the only one connected, so it is used automatically. There is nothing to pick.</p>'
  :AI.dflt?'<p class="pf-small">The plan button opens '+AINAME[AI.dflt]+'.</p>'
  :'<div class="pf-aihint" role="status">'+ic("spark",18)+' More than one is connected, so choose a default. The plan button opens it.</div>';
 return '<div><span class="pf-lbl">AI assistants</span><div class="pf-list pf-aibox"><p class="pf-ai-cap">Connected through sign-in</p><ul'+(many?' role="radiogroup" aria-label="Default assistant"':'')+'>'+rows+'</ul><div class="pf-ai-foot">'+note+'</div></div></div>'}
/* The actions in the list and in the panel (data-ai). Connect and Disconnect are the only ones that change what is connected; the rest open an app, copy, or move through the waiting steps. */
function aiShow(m,id){if(m.sel==="ai:"+id)paint(m,true);else openFly(m,"ai:"+id)}
function aiClick(m,el){
 var k=el.dataset.ai,id=el.dataset.id||(m.sel&&/^ai:/.test(m.sel)?m.sel.slice(3):"");
 if(AIIDS.indexOf(id)<0&&k!=="copy")return false;
 var nm=AINAME[id];
 if(k==="default"){AI.dflt=id;paint(m,false,'[data-ai="default"][data-id="'+id+'"]');return true}
 if(k==="open"){toast(id==="claude"?"Mockup: opens a new Claude chat with the starting message filled in. It is copied too.":"Mockup: opens "+nm+" and copies the starting message. Paste it into "+nm+".");return true}
 if(k==="connect"){AI.st[id]="connecting";AI.conf=null;aiShow(m,id);return true}
 if(k==="stop"){AI.st[id]="off";paint(m,true,'[data-flyfocus]');return true}
 if(k==="reopen"){toast(id==="claude"?"Mockup: opens Claude again, with Kitchie's address filled in.":"Mockup: opens "+nm+". Nothing can be filled in there.");return true}
 if(k==="copy"){toast("Copied Kitchie's address. (Sample: nothing is copied.)");return true}
 if(k==="sim"){var w=el.dataset.w;AI.st[id]=w==="ok"?"on":w==="no"?"cancelled":"late";if(w==="ok"){if(aiLinked().length<2)AI.dflt=null;toast(nm+" is connected.")}paint(m,true,'[data-flyfocus]');return true}
 if(k==="disc"){AI.conf=id;paint(m,true,'[data-flyfocus]');return true}
 if(k==="keep"){AI.conf=null;paint(m,true,'[data-flyfocus]');return true}
 if(k==="discyes"){AI.st[id]="off";AI.conf=null;if(AI.dflt===id)AI.dflt=null;if(aiLinked().length<2)AI.dflt=null;toast(nm+" is disconnected. It can be connected again any time.");paint(m,true,'[data-flyfocus]');return true}
 if(k==="close"){closeFly(m);return true}
 return false}
function rowInv(){var L=invLbl();return '<li><button type="button" class="pf-item" data-inv="open" aria-haspopup="dialog" title="'+L.tip+'"><span class="pf-ico">'+ic("send",18)+'</span><span class="pf-t"><span data-invlbl>'+L.t+'</span><small data-invsub>'+L.sub+'</small></span><span class="pf-chev">'+ic("chev",18)+'</span></button></li>'}
function row(icon,t,sub,chip,toast){return '<li><button type="button" class="pf-item" data-toast="'+toast+'"><span class="pf-ico">'+ic(icon,18)+'</span><span class="pf-t">'+t+(sub?'<small>'+sub+'</small>':'')+'</span>'+chip+'<span class="pf-chev">'+ic("chev",18)+'</span></button></li>'}
function paneLooks(){
 return '<div><span class="pf-lbl">Looks</span><div class="pf-list"><div class="pf-themes"><b>Theme</b><div class="tgrid swatches" role="group" aria-label="Theme">'+(window.themeHtml?window.themeHtml(["kitchie","kitchie-day","marmalade","blueberry","herb"],true):"")+'</div><p class="pf-small" data-theme-name>'+(window.themeName?window.themeName():"")+'</p></div>'
 +'<div class="pf-row2" style="border-top:1px solid var(--border)"><span>Item name size</span><div class="pf-seg" role="radiogroup" aria-label="Item name size"><button type="button" role="radio" aria-checked="false">Small</button><button type="button" role="radio" aria-checked="true">Normal</button><button type="button" role="radio" aria-checked="false">Large</button></div></div>'
 +'<ul style="border-top:1px solid var(--border)">'+sw("Show emoji",true)+sw("Reduce motion",false)+sw("Show the spot",true)+sw("Show the amount",true)+sw("Show the use-by date",true)+sw("Compact rows",false)+'</ul></div></div>'}
/* Settings. Desktop (900px and up): Looks only; Kitchen setup and Install are children of Settings in the left gutter (profile-subs.js draws them). Phone and tablet (under 900px): Looks, then Kitchen setup and Install as rows that open in place under themselves (profile-subs.js draws the open row). */
function paneSettings(m){
 var h=paneLooks();
 if(narrow()){
  var X=window.KProfileSubs;
  h+=(X?X.accs(m):accHeads(m))+'<div><button type="button" class="pf-btn" data-toast="Mockup: back to defaults">Reset to defaults</button></div>'}
 else h+='<div><button type="button" class="pf-btn" data-toast="Mockup: back to defaults">Reset to defaults</button></div>';
 return h}
function accHeads(m){return ''}
function paneHousehold(m){
 /* Who is looking and who holds the admin role (SW-85, SW-90 to SW-93). "Founder is no special" (owner, voice, 15 Oct 2026): the founding member is a label; an admin is whoever holds the role, the founding member included, and a household always keeps one.
    Mockup only: ?open=household&hhrole=founder (default: Arjan, with Maya an admin too) | admin (Maya, Arjan an admin too) | member (Sam) | last (Arjan, the only admin) | exfounder (Maya, the only admin; Arjan, the founding member, was revoked) */
 var who=m&&/^(admin|member|last|exfounder)$/.test(m.hhrole)?m.hhrole:"founder";
 var me={founder:"arjan",admin:"maya",member:"sam",last:"arjan",exfounder:"maya"}[who];
 var admins={founder:["arjan","maya"],admin:["arjan","maya"],member:["arjan","maya"],last:["arjan"],exfounder:["maya"]}[who];
 var isAd=function(w){return admins.indexOf(w)>=0},meAd=isAd(me),others=admins.length>1;
 var label={arjan:NAME,maya:"maya",sam:"sam",jo:"jo"};
 var ch=function(t,c){return ' <span class="pf-chip'+(c?' '+c:'')+'">'+t+'</span>'};
 var mem=function(ini,nm,chips,sub,btn,me){return '<li><button type="button" class="pf-item" data-toast="Mockup: this opens the member sheet"><span class="pf-ini'+(me?' me':'')+'" aria-hidden="true">'+ini+'</span><span class="pf-t">'+nm+chips+'<small>'+sub+'</small></span><span class="pf-chev">'+ic("chev",18)+'</span></button>'+(btn||'')+'</li>'};
 /* Make admin, Remove admin and Step down carry their confirm in a <details> under the row (no script in the build); the summary reads Cancel while it is open */
 var adm=function(n,ad,self){var q=ad?(self?"Step down as admin?":"Remove "+n+" as admin?"):"Make "+n+" an admin?";var aria=ad?(self?"Step down as admin":"Remove "+n+" as admin"):"Make "+n+" an admin";var o=ad?(self?"Step down":"Remove admin"):"Make admin";var words=ad?(self?"You stay in Our kitchen and keep your own preferences. You can no longer change what the household shares, or who else is an admin.":n+" stays in Our kitchen and keeps their own preferences. They can no longer change what the household shares."):"Admins can change what the whole household shares: its settings, notes and food rules, and who else is an admin. You can take it back.";return '<details class="pf-adm"><summary class="pf-btn sm" aria-label="'+aria+'"><span class="o">'+o+'</span><span class="c">Cancel</span></summary><div class="pf-admbox"><b>'+q+'</b><p class="pf-small">'+words+'</p><button type="button" class="pf-btn'+(ad?"":" pri")+' sm" data-toast="Mockup: '+(self?"you are no longer an admin":n+(ad?" is no longer an admin":" is now an admin"))+'">'+(ad?(self?"Step down":"Remove admin"):"Make "+n+" an admin")+'</button></div></details>'};
 /* what sits at the end of a row: another member, Make or Remove admin; the viewer's own row, Step down while another admin exists, else the line that says what to do first */
 var act=function(w){if(!meAd)return "";if(w!==me)return adm(label[w],isAd(w),false);return isAd(w)?(others?adm(label[w],true,true):'<p class="pf-small pf-lastadm">Make someone else an admin first.</p>'):""};
 var note=meAd?"Admins can make someone an admin, or take it back. A household always keeps one admin, so the last admin makes someone else one before stepping down.":"Only household admins can make someone an admin, or take it back. Admins: "+admins.map(function(w){return label[w]}).join(" and ")+".";
 return '<div><h3 class="pf-h">Our kitchen</h3><p>4 members</p></div>'
 +'<div><span class="pf-lbl">Members and admins</span><p class="pf-small pf-intro2">Admins can change what the whole household shares: its settings, notes and food rules. Everyone can always change their own preferences, whatever their role.</p><ul class="pf-list">'
 +mem("P",NAME,(me==="arjan"?ch("You"):"")+ch("Founding member",isAd("arjan")?"acc":""),SUB+" \u00b7 "+(isAd("arjan")?"Set the household up. An admin.":"Set the household up. Not an admin now."),act("arjan"),me==="arjan")
 +mem("M","maya",(me==="maya"?ch("You"):"")+ch(isAd("maya")?"Admin":"Member",isAd("maya")?"acc":""),"Kitchen helper \u00b7 "+(isAd("maya")?"Can change the household\u2019s values":"Can change their own preferences"),act("maya"),me==="maya")
 +mem("S","sam",(me==="sam"?ch("You"):"")+ch("Member"),"Sous chef \u00b7 Can change their own preferences",act("sam"),me==="sam")
 +mem("J","jo",ch("Member"),"Can change their own preferences",act("jo"))
 +'</ul><p class="pf-small" style="margin:8px 2px 0">'+note+'</p></div>'
 
 +'<div><span class="pf-lbl">Waiting to join</span><ul class="pf-list"><li><div class="pf-ev"><span class="pf-ico">'+ic("mail",18)+'</span><span class="pf-t"><span class="pf-code">482 913</span><small>Join Our kitchen, 20 hours left</small></span><button type="button" class="pf-btn sm" data-toast="Mockup: code copied">'+ic("copy",16)+' Copy</button><button type="button" class="pf-btn sm" data-toast="Mockup: invite cancelled">Cancel</button></div></li></ul></div>'
 +'<div><button type="button" class="pf-btn pri" data-hhinvite data-toast="Mockup: this opens the invite sheet (drawn in the household flow: Menu, Household, Invite someone)">'+ic("plus",18)+' Invite someone</button></div>'
 +'<div class="pf-danger"><b>Danger zone</b><p class="pf-small">You lose access to the pantry, shopping and recipes. Nothing is deleted. Someone has to invite you back.</p><button type="button" class="pf-btn dng" data-toast="Mockup: you would type your name to confirm">'+ic("door",18)+' Leave household</button></div>'}
function paneData(){
 return '<div class="pf-card"><span class="pf-ico">'+ic("down",18)+'</span><span class="pf-t">Inventory CSV<small>One file, one row per item: name, amount, place, use-by. 16 items.</small></span><button type="button" class="pf-btn pri" data-act="download">Download '+keys("D")+'</button></div>'
 +'<p class="pf-small">Sample only: nothing is downloaded in this mockup.</p>'}
/* Preferences: the Preferences mockup in embed mode (no page chrome, no phone frame, no Settings back link). Built when the section is first shown. The window is the founding member's. */
function panePrefs(){
 var src=SELF?new URL("../preferences-mine-household/index.html?embed=1&as=arjan&tab=mine",SELF).href:"";
 return '<iframe class="pf-frame" title="Preferences" src="'+src+'"></iframe>'}
var PANE={me:paneMe,settings:paneSettings,preferences:panePrefs,household:paneHousehold,data:paneData};
/* phone and tablet keep the embedded Preferences screen, except layout A, which has its own phone layout (profile-prefs-m.js, round 7) */
function pref(m){return narrow()?(m.pref==="a"?"a":"today"):(m.pref||"today")}
function phoneA(m){return narrow()&&m.view==="preferences"&&m.pref==="a"}
function narrow(){return window.matchMedia&&window.matchMedia("(max-width:900px)").matches}

/* ---------- state ---------- */
var stack=[],home=null,gTimer=null,toastTimer=null,toastEl=null;
/* Standalone mockup page only: the frame parameters (see the header). Used once, for the first window opened. */
/* The invite entry is one dual-purpose button (owner, 12 Oct 2026): "Invite someone" until the person has sent an invite of any status, then "My invites". INVMODE is the mockup's sample: none | some | full (three pending). ?invs= sets it; the modal (invite.js) changes it. */
var INVMODE="none";
function invSent(){return INVMODE!=="none"}
function invLbl(){return invSent()?{t:"My invites",sub:"Invites you have sent, and where they stand",tip:"My invites: the invites you have sent to people starting their own household"}:{t:"Invite someone",sub:"to set up their own household",tip:"Invite someone to set up their own household"}}
function invSet(mode){INVMODE=mode;var L=invLbl();$$("[data-inv=open]").forEach(function(b){var a=$("[data-invlbl]",b),c=$("[data-invsub]",b);if(a)a.textContent=L.t;if(c)c.textContent=L.sub;b.title=L.tip})}
var INIT=null;
function readInit(){var q=new URLSearchParams(location.search),g=function(k){return q.get(k)||""};
 INIT={sub:g("sub"),sel:g("sel"),pref:g("pref"),psub:g("psub"),ptab:g("ptab"),as:g("as"),os:g("os"),acc:g("acc"),done:g("done"),chg:g("chg"),ai:g("ai"),aic:g("aic"),aidc:g("aidc"),inv:g("inv"),invs:g("invs"),hhrole:g("hhrole")};
 if(/^(none|some|full)$/.test(INIT.invs))INVMODE=INIT.invs;
 if(INIT.inv==="list"&&INVMODE==="none")INVMODE="some";
 if(INIT.inv==="limit")INVMODE="full";
 if(/^(none|one|many|choose)$/.test(INIT.ai))aiSet(INIT.ai);aiInit(INIT)}
function newState(kind,view,root,opener){
 var m={kind:kind,view:view,sub:"looks",psub:"mine",ptab:"mine",pref:"today",sel:null,acc:null,as:"arjan",os:"",chg:"2",root:root,frame:root.firstChild,opener:opener};
 if(kind==="win"&&INIT){var I=INIT;INIT=null;
  if(/^(looks|cats|locs|install)$/.test(I.sub))m.sub=I.sub;
  if(/^(a|b|c)$/.test(I.pref))m.pref=I.pref;
  if(/^[a-z]{2,12}$/.test(I.psub))m.psub=I.psub==="members"?"hh":I.psub;
  if(/^[0-3]$/.test(I.chg))m.chg=I.chg;
  if(/^(mine|hh)$/.test(I.ptab))m.ptab=I.ptab;
  if(/^(arjan|sam)$/.test(I.as))m.as=I.as;
  if(/^(admin|member|last|exfounder)$/.test(I.hhrole))m.hhrole=I.hhrole;
  m.os=I.os;m.idone=I.done==="1";m.sel=I.sel||null;m.acc=/^(cats|locs|install)$/.test(I.acc)?I.acc:null;
  if(narrow()&&/^(cats|locs|install)$/.test(I.sub)&&!m.acc)m.acc=I.sub}
 return m}

/* ---------- renderers ---------- */
function xbtn(){return '<span class="pf-hx"><kbd>'+ESCL+'</kbd><button type="button" class="pf-x" data-close aria-label="Close" title="Close ('+ESCL+')">'+ic("close",20)+'</button></span>'}
/* The left gutter (the section list). Settings opens under itself (children and group labels); with the A layout Preferences does too. History is not a section: it is docked at the bottom, right above the keys line (owner, 11 Oct 2026; its behaviour is pending the owner). */
function kids(m){
 var X=window.KProfileSubs;
 if(m.view==="settings")return [{k:"looks",t:"Looks",icon:"look"},{g:"Kitchen setup"},{k:"cats",t:"Categories",icon:"tag"},{k:"locs",t:"Locations and spots",icon:"pin"},{g:"Install"},{k:"install",t:"Install Kitchie",icon:"down"}];
 if(m.view==="preferences"&&pref(m)==="a")return window.KProfilePrefs?window.KProfilePrefs.kids(m):[{k:"mine",t:"Mine",icon:"user"},{k:"hh",t:"Household",icon:"people"}];
 return []}
function curSub(m){return m.view==="preferences"?m.psub:m.sub}
function navHtml(m){
 var view=m.view;
 var tabs=ORDER.map(function(k){var v=VIEWS[k],on=view===k,label=k==="me"?"Profile":v.t,kd=on&&!narrow()?kids(m):[];
  var parent=on&&kd.length;
  var h='<button type="button" class="pf-nvt'+(parent?' pf-par':'')+'" role="tab" id="pf-tab-'+k+'" data-view="'+k+'" aria-selected="'+(on&&!parent)+'" '+(!narrow()&&(kd.length||k==="settings"||(k==="preferences"&&pref(m)==="a"))?'aria-expanded="'+(!!parent)+'" ':'')+'aria-controls="pf-panel" tabindex="'+(on&&!parent?0:-1)+'"'+(on&&!parent?' data-focus':'')+'>'+ic(v.icon,20)+'<span class="pf-t">'+label+'</span>'+(!narrow()&&(k==="settings"||(k==="preferences"&&pref(m)==="a"))?'<span class="pf-tw" aria-hidden="true">'+ic(parent?"downc":"chev",16)+'</span>':'')+nkey(num(k))+'</button>';
  if(parent){var sub=curSub(m);h+='<div class="pf-kids" role="presentation">'+kd.map(function(c){
   if(c.g)return '<span class="pf-ngl" role="presentation">'+c.g+'</span>';
   var cs=sub===c.k;return '<button type="button" class="pf-nvt pf-nvc" role="tab" id="pf-tab-'+k+'-'+c.k+'" data-view="'+k+'" data-sub="'+c.k+'" aria-selected="'+cs+'" aria-controls="pf-panel" tabindex="'+(cs?0:-1)+'"'+(cs?' data-focus':'')+'>'+(c.ini?'<span class="pf-ini sm" aria-hidden="true">'+c.ini+'</span>':ic(c.icon,18))+'<span class="pf-t">'+c.t+'</span>'+(c.dot?'<i class="pf-dot" role="img" aria-label="'+(c.dotLabel||'Changed since you last looked')+'"></i>':'')+(c.note?'<span class="pf-cn">'+c.note+'</span>':'')+'</button>'}).join("")+'</div>'}
  return h}).join("");
 return '<div class="pf-nav"><div class="pf-nwho">'+bw(48)+'<div><b>'+NAME+'</b><span class="pf-sub">'+SUB+'</span></div></div><div role="tablist" aria-orientation="vertical" aria-label="Profile sections">'+tabs+'</div><span class="pf-grow"></span>'
 +'<button type="button" class="pf-nvt pf-invent" data-inv="open" aria-haspopup="dialog" title="'+invLbl().tip+'"><span class="pf-ico" aria-hidden="true">'+ic("send",16)+'</span><span class="pf-t" data-invlbl>'+invLbl().t+'</span></button>'
 +'<button type="button" class="pf-nvt pf-dock" data-dock="history" aria-label="History (the owner will give instructions for it)">'+ic("clock",20)+'<span class="pf-t">History</span></button>'
 +'<p class="pf-small pf-keysl"><kbd>&uarr;</kbd> <kbd>&darr;</kbd> switch section</p></div>'}
function titleOf(m){
 if(m.view==="me")return ["Profile",""];
 if(m.view==="settings"&&!narrow()){var c=kids(m).filter(function(x){return x.k===m.sub})[0];if(c&&m.sub!=="looks")return [c.t,"Settings › "+(m.sub==="install"?"Install":"Kitchen setup")];return ["Settings",""]}
 if(m.view==="preferences"&&pref(m)==="a"&&!narrow()){var c2=kids(m).filter(function(x){return x.k===m.psub})[0];return [c2?c2.t:"Preferences","Preferences"]}
 return [VIEWS[m.view].t,""]}
function FOOTS(m){return '<span><kbd>'+ESCL+'</kbd> close'+(m.sel?' this panel':'')+'</span><span><kbd>Tab</kbd> move</span><span><kbd>1</kbd> to <kbd>'+ORDER.length+'</kbd> jump to a section</span><span><kbd>?</kbd> shortcuts</span>'}
function winHtml(m,bodyHtml,flyHtml){
 var view=m.view,t=titleOf(m);
 var flush=view==="preferences"&&pref(m)==="today";
 var X=window.KProfileSubs;
 return navHtml(m)+'<div class="pf-cont"><div class="pf-head"><div class="pf-who">'+(t[1]?'<span class="pf-crumb">'+t[1]+'</span>':'')+'<h2>'+t[0]+'</h2></div>'+xbtn()+'</div><div class="pf-row'+(flyHtml?' pf-hasfly':'')+'"><div class="pf-body'+(flush?' pf-flush':'')+'" id="pf-panel" role="tabpanel" aria-labelledby="pf-tab-'+view+(curSub(m)&&kids(m).length?'-'+curSub(m):'')+'" tabindex="0">'+bodyHtml+'</div>'+(flyHtml||'')+'</div><div class="pf-foot">'+FOOTS(m)+(X&&view==="preferences"?X.footCtl(m):'')+'</div></div>'}
function renderWin(m){
 var X=window.KProfileSubs,body,fly="";
 var aip=!!(m.sel&&/^ai:/.test(m.sel)&&narrow()&&X);
 if(aip)body=X.aiPage(m);
 else if(m.view==="settings"&&!narrow()&&m.sub!=="looks")body=X.pane(m);
 else if(m.view==="preferences"&&pref(m)!=="today")body=X.prefsPane(m);
 else body=PANE[m.view](m);
 if(m.sel&&X&&!phoneA(m)&&!aip)fly=X.fly(m);
 return winHtml(m,body,fly)}
function renderShortcuts(){
 var rows=ORDER.map(function(k){return [k==="me"?"Profile":VIEWS[k].t,num(k)]});
 return '<div class="pf-head"><span class="pf-ico">'+ic("kbd",18)+'</span><div class="pf-who"><h2 class="sm">Keyboard shortcuts</h2></div>'+xbtn()+'</div><div class="pf-body"><p class="pf-small">With the window open, press a number to jump to that section. They pause while you type in a box.</p><ul class="pf-list pf-sc">'
 +rows.map(function(r){return '<li><span>'+r[0]+'</span>'+nkey(r[1])+'</li>'}).join("")
 +'<li><span>Close the window</span><span class="pf-keys"><kbd>'+ESCL+'</kbd></span></li><li><span>Show this list</span><span class="pf-keys"><kbd>?</kbd></span></li></ul><p class="pf-small">On the page, with no window open, <kbd>G</kbd> then <kbd>P</kbd> opens the profile. <kbd>G</kbd> then <kbd>M</kbd>, <kbd>S</kbd>, <kbd>H</kbd> or <kbd>D</kbd> opens Me, Settings, Household or My data.</p></div><div class="pf-foot"><span>Press <kbd>'+ESCL+'</kbd> to go back</span></div>'}
function renderInvite(m){return window.KProfileInvite?window.KProfileInvite.render(m):""}
var RENDER={win:renderWin,s:renderShortcuts,inv:renderInvite};
function label(m){return m.kind==="inv"?(window.KProfileInvite?window.KProfileInvite.title():"Invite someone"):m.kind==="s"?"Keyboard shortcuts":"Profile, "+(m.view==="me"?"Profile":VIEWS[m.view].t)}
/* The sub-screens (Categories, Locations and spots, Install, the Preferences layouts, the open row on a phone) are drawn by profile-subs.js (+ .css), loaded the first time one is needed. Preferences layout A is drawn by profile-prefs.js (+ .css), loaded only when A is shown (after profile-subs.js, which hands it the work). */
var loadQ={};
function needsSubs(m){return m.kind==="win"&&((m.view==="settings"&&(narrow()||m.sub!=="looks"))||(m.view==="preferences"&&pref(m)!=="today")||!!m.sel)}
function needsPrefs(m){return m.kind==="win"&&m.view==="preferences"&&pref(m)==="a"}
function loadMod(base,flag,cb){
 if(window[flag])return cb();
 if(loadQ[flag]){loadQ[flag].push(cb);return}
 loadQ[flag]=[cb];
 var l=document.createElement("link");l.rel="stylesheet";l.href=new URL(base+".css",SELF).href;document.head.appendChild(l);
 var sc=document.createElement("script");sc.src=new URL(base+".js",SELF).href;
 sc.onload=function(){var q=loadQ[flag];loadQ[flag]=null;q.forEach(function(f){f()})};document.head.appendChild(sc)}
function ready(m){return (!needsSubs(m)||!!window.KProfileSubs)&&(!needsPrefs(m)||!!window.KProfilePrefs)&&(!phoneA(m)||!!window.KProfilePrefsM)}
function withMods(m,cb){loadMod("profile-subs","KProfileSubs",function(){if(needsPrefs(m))loadMod("profile-prefs","KProfilePrefs",function(){if(phoneA(m))loadMod("profile-prefs-m","KProfilePrefsM",cb);else cb()});else cb()})}

/* ---------- modal stack ---------- */
function syncInert(){
 var top=stack.length?stack[stack.length-1].root:null;
 $$("body > *").forEach(function(el){if(el.tagName==="SCRIPT"||el.id==="pf-toast")return;el.inert=!!top&&el!==top});
 document.documentElement.classList.toggle("pf-lock",!!top)}
function focusables(root){return $$('a[href],button:not([disabled]),input:not([disabled]),select,textarea,[tabindex]',root).filter(function(el){return el.tabIndex>=0&&el.getClientRects().length})}
function paint(m,focus,focusSel){
 if(!ready(m)){withMods(m,function(){paint(m,focus,focusSel)});return}
 m.frame.innerHTML=RENDER[m.kind](m);
 m.frame.setAttribute("aria-label",label(m));
 if(window.themeApply&&m.view==="settings")window.themeApply();
 if(window.KProfileSubs&&m.kind==="win")window.KProfileSubs.after(m);
 if(focus){var f=(focusSel&&$(focusSel,m.frame))||(m.sel&&($(".pf-fly [data-flyfocus]",m.frame)||$(".pf-aipg [data-flyfocus]",m.frame)||$(".pm-sub [data-flyfocus]",m.frame)))||(m.sel&&$(".pm-sub [data-subfocus]",m.frame))||$(".pm-sub [data-subfocus]",m.frame)||$("[data-focus]",m.frame)||focusables(m.frame)[0]||m.frame;f.focus()}}
function homeEl(){return home&&document.contains(home)?home:$("#pf-avatar")}
function openModal(kind,view,opener){
 toastNode();
 var root=document.createElement("div");root.className="pf-scrim";
 root.innerHTML='<div class="pf-dlg pf-'+kind+'" role="dialog" aria-modal="true" tabindex="-1"></div>';
 var m=newState(kind,view,root,opener||document.activeElement);
 document.body.appendChild(root);stack.push(m);syncInert();paint(m,true);return m}
function setView(m,view,sub){
 if(m.view===view&&!sub&&!(view==="settings"&&m.sub!=="looks"))return;
 m.view=view;m.sel=null;m.acc=null;
 if(view==="settings")m.sub=sub||"looks";
 if(view==="preferences"&&sub)m.psub=sub;
 paint(m,true)}
/* Within one section: another child, a flyout opened or closed, an open row on a phone. */
function setSub(m,sub){
 if(m.view==="preferences")m.psub=sub;else m.sub=sub;
 m.sel=null;m.acc=null;paint(m,true)}
function openFly(m,sel){var ph=phoneA(m);m.sel=sel;var body=$(".pf-body",m.frame),y=body?body.scrollTop:0;if(ph&&!m._pg)m._y=y;paint(m,true);var b2=$(".pf-body",m.frame);if(b2)b2.scrollTop=ph&&!m._pg?0:y}
function closeFly(m){var was=m.sel,ph=phoneA(m);m.sel=null;var body=$(".pf-body",m.frame),y=ph&&m._y!=null?m._y:(body?body.scrollTop:0);if(ph)m._y=null;paint(m,false);var b2=$(".pf-body",m.frame);if(b2)b2.scrollTop=y;
 var o=$('[data-sel="'+was+'"]',m.frame);if(o)o.focus();else{var f=$("[data-focus]",m.frame);if(f)f.focus()}}
function closeTop(){
 var m=stack.pop();if(!m)return;
 m.root.remove();syncInert();
 var o=m.opener;
 if(!(o&&document.contains(o)&&!o.inert&&o!==document.body)){var t=stack[stack.length-1];o=t?($("[data-focus]",t.frame)||t.frame):homeEl()}
 try{o.focus()}catch(e){}}
function closeAll(){while(stack.length)closeTop()}

/* ---------- actions ---------- */
function toastNode(){
 if(!toastEl){toastEl=$("#pf-toast");if(!toastEl){toastEl=document.createElement("div");toastEl.id="pf-toast";toastEl.className="pf-toast";toastEl.setAttribute("role","status");toastEl.setAttribute("aria-live","polite");document.body.appendChild(toastEl)}}
 return toastEl}
function toast(msg){var t=toastNode();t.textContent=msg;t.classList.add("on");clearTimeout(toastTimer);toastTimer=setTimeout(function(){t.classList.remove("on")},2200)}
function download(){toast("Inventory CSV saved (sample, nothing is downloaded)")}
function openProfile(opener){
 if(stack.length)return;
 if(opener)home=opener;
 openModal("win","me",homeEl()||document.activeElement)}
function go(v){
 var top=stack[stack.length-1];
 if(top&&top.kind!=="win")return;
 var view=v==="profile"?"me":v;
 if(top)setView(top,view);else openModal("win",view,homeEl()||document.activeElement)}
/* "Set someone up with their own household": a modal over the window (owner, 12 Oct 2026). The script and styles are fetched the first time it is opened. */
function openInvite(opener,state){
 if(stack.length&&stack[stack.length-1].kind==="inv")return;
 loadMod("invite","KProfileInvite",function(){window.KProfileInvite.open(state);openModal("inv","list",opener||document.activeElement)})}
/* the way back: close the modal, show Household with its existing "Invite someone" (join my household) button, and point at it */
function inviteBack(){
 closeTop();
 var w=stack[stack.length-1];if(!w||w.kind!=="win")return;
 setView(w,"household");
 var b=$("[data-hhinvite]",w.frame);
 if(b){b.focus();b.classList.remove("pf-flash");void b.offsetWidth;b.classList.add("pf-flash")}
 toast("This is the invite for your own household: Invite someone, below. (Mockup: its sheet is drawn in the household flow.)")}
function toggleShortcuts(){
 var top=stack[stack.length-1];
 if(top&&top.kind==="inv")return;
 if(top&&top.kind==="s"){closeTop();return}
 openModal("s","list",document.activeElement)}

/* What profile-subs.js may call. */
var H={toast:toast,paint:paint,openFly:openFly,closeFly:closeFly,setSub:setSub,setView:setView,$:$,$$:$$,ic:ic,badge:badge,xbtn:xbtn,closeTop:closeTop,inviteBack:inviteBack,invMode:function(){return INVMODE},invSet:invSet};
window.KProfileH=H;
if(window.matchMedia){var mq=window.matchMedia("(max-width:900px)"),onmq=function(){var t=stack[stack.length-1];if(t&&t.kind==="win"){if(!narrow()&&t.acc){t.sub=t.acc;t.acc=null}else if(narrow()&&t.view==="settings"&&/^(cats|locs|install)$/.test(t.sub)){t.acc=t.sub}paint(t,false)}};
 if(mq.addEventListener)mq.addEventListener("change",onmq)}

/* ---------- events ---------- */
document.addEventListener("click",function(e){
 var t=e.target;
 if(t.classList&&t.classList.contains("pf-scrim")){closeTop();return}
 var el=t.closest?t.closest("button"):null;if(!el)return;
 /* the inline window drawn on the Preferences mockup pages: its section list and close button only say what they would do */
 if(el.closest(".pf-inline .pf-nav, .pf-inline .pf-hx")){
  if(el.hasAttribute("data-close"))toast("Mockup: this closes the window");
  else if(el.dataset.view&&el.dataset.view!=="preferences")toast("Mockup: the other sections are in the Desktop profile mockup");
  return}
 var top=stack[stack.length-1];
 if(!top)return;
 if(el.hasAttribute("data-close")){closeTop();return}
 if(el.dataset.inv==="open"&&top.kind==="win"){openInvite(el);return}
 if(top.kind==="inv"){if(window.KProfileInvite&&window.KProfileInvite.click(top,el,H))return;return}
 if(el.dataset.act==="download"){download();return}
 if(el.dataset.act==="editname"){var w=$("#pf-who2",top.frame);if(w){w.innerHTML=nameInp();var ni=$("[data-nameinp]",w);ni.focus();ni.select()}return}
 if(el.dataset.ai&&aiClick(top,el))return;
 if(el.dataset.dock==="history"){toast("Mockup: History is docked here. What it does is waiting for the owner's instructions.");return}
 if(el.hasAttribute("data-flyclose")){closeFly(top);return}
 if(el.dataset.sel){if(top.sel===el.dataset.sel)closeFly(top);else openFly(top,el.dataset.sel);return}
 if(el.dataset.acc){top.acc=top.acc===el.dataset.acc?null:el.dataset.acc;top.sel=null;paint(top,false,'[data-acc="'+el.dataset.acc+'"]');return}
 if(el.dataset.pref){top.pref=el.dataset.pref;top.sel=null;top.acc=null;paint(top,false,'[data-pref="'+el.dataset.pref+'"]');return}
 if(window.KProfileSubs&&window.KProfileSubs.click(top,el,H))return;
 if(el.dataset.view){if(el.dataset.sub&&top.view===el.dataset.view){setSub(top,el.dataset.sub);return}setView(top,el.dataset.view,el.dataset.sub);return}
 if(el.dataset.toast){toast(el.dataset.toast);return}
 if(el.getAttribute("role")==="switch"){el.setAttribute("aria-checked",String(el.getAttribute("aria-checked")!=="true"));return}
 if(el.getAttribute("role")==="radio"){$$('[role=radio]',el.parentNode).forEach(function(b){b.setAttribute("aria-checked",String(b===el))});return}
});

/* the name box (Profile): saves automatically as you type (owner, 12 Oct 2026: no Save button), live in the section list; a line under the box says Saved. Enter, Esc or leaving the box only close the box; the saved name stays. An emptied box keeps the last saved name. Plain Esc closes nothing else. */
var nameWas="";
function nameLive(){$$(".pf-nwho b").forEach(function(b){b.textContent=NAME})}
function endName(inp,refocus){var w=inp.parentNode;if(!w||w.id!=="pf-who2")return;w.innerHTML=nameBtn();if(refocus){var b=$(".pf-nameedit",w);if(b)b.focus()}}
document.addEventListener("input",function(e){var t=e.target;if(t&&t.hasAttribute&&t.hasAttribute("data-nameinp")){var v=t.value.trim(),h=$("[data-namehint]");if(v){NAME=v;nameLive();if(h)h.textContent="Saved."}else if(h)h.textContent="A name cannot be empty. The saved name stays until you type one."}});
document.addEventListener("focusin",function(e){var t=e.target;if(t&&t.hasAttribute&&t.hasAttribute("data-nameinp"))nameWas=NAME});
document.addEventListener("focusout",function(e){var t=e.target;if(t&&t.hasAttribute&&t.hasAttribute("data-nameinp"))setTimeout(function(){if(t.parentNode&&document.activeElement!==t)endName(t,false)},0)});
document.addEventListener("keydown",function(e){var t=e.target;if(!t||!t.hasAttribute||!t.hasAttribute("data-nameinp")||e.ctrlKey||e.metaKey)return;
 if(e.key==="Enter"){e.preventDefault();endName(t,true)}
 else if(e.key==="Escape"){e.preventDefault();endName(t,true)}});

document.addEventListener("keydown",function(e){
 var top=stack[stack.length-1],t=e.target;
 if((e.key==="Escape"||e.key==="Enter")&&(e.ctrlKey||e.metaKey)&&top){e.preventDefault();e.stopPropagation();if(top.kind==="win"&&top.sel)closeFly(top);else closeTop();return}
 if(e.key==="Tab"&&top){
  var f=focusables(top.frame);if(!f.length){e.preventDefault();return}
  var i=f.indexOf(document.activeElement);
  if(e.shiftKey&&(i<=0)){e.preventDefault();f[f.length-1].focus()}
  else if(!e.shiftKey&&(i===f.length-1||i<0)){e.preventDefault();f[0].focus()}
  return}
 /* section tabs: arrows, Home, End */
 if(top&&t.getAttribute&&t.getAttribute("role")==="tab"&&/^(Arrow(Up|Down)|Home|End)$/.test(e.key)){
  var list=$$(".pf-nvt[role=tab]",top.frame),i2=list.indexOf(t),n=i2;
  if(e.key==="ArrowDown")n=(i2+1)%list.length;else if(e.key==="ArrowUp")n=(i2-1+list.length)%list.length;else if(e.key==="Home")n=0;else n=list.length-1;
  e.preventDefault();var nt=list[n];if(nt.dataset.sub&&top.view===nt.dataset.view)setSub(top,nt.dataset.sub);else setView(top,nt.dataset.view,nt.dataset.sub);return}
 /* shortcuts */
 if(e.ctrlKey||e.metaKey||e.altKey)return;
 if(t.matches&&t.matches("input,textarea,select,[contenteditable]"))return;
 if(e.key==="?"){e.preventDefault();toggleShortcuts();return}
 if(top&&top.kind!=="win")return;
 if(top&&NUM[e.key]){e.preventDefault();setView(top,NUM[e.key]);return}
 if(!top&&NUM[e.key]&&$(".pf-inline")){e.preventDefault();toast("Mockup: in the window, "+e.key+" jumps to "+(NUM[e.key]==="me"?"Profile":VIEWS[NUM[e.key]].t));return}
 if(gTimer){clearTimeout(gTimer);gTimer=null;toastNode().classList.remove("on");var v=KEYS[e.key.toLowerCase()];if(v){e.preventDefault();go(v)}return}
 if(e.key==="g"||e.key==="G"){gTimer=setTimeout(function(){gTimer=null;toastNode().classList.remove("on")},1500);toast("G, then P, M, S, H or D")}
},true);

/* Keys pressed inside the embedded Preferences frame are passed up, so the window keeps its own keys (Ctrl or Cmd Esc, the numbers, ?). */
window.addEventListener("message",function(ev){
 var d=ev.data,top=stack[stack.length-1];
 if(!d||d.kind!=="pf-key"||!top||top.kind!=="win")return;
 var f=$("iframe.pf-frame",top.frame);if(!f||ev.source!==f.contentWindow)return;
 if((d.key==="Escape"||d.key==="Enter")&&(d.ctrl||d.meta)){closeTop();return}
 if(d.key==="?"){toggleShortcuts();return}
 if(NUM[d.key])setView(top,NUM[d.key])});

/* The window drawn in place, not as a modal, for the Preferences mockup pages at desktop width: same markup and classes, Preferences selected, the page's own screen as the body. Returns the body element. */
function inline(host,view){
 var m={view:view,sub:"looks",psub:"mine",pref:"today",sel:null};
 host.innerHTML='<div class="pf-scrim pf-inline"><div class="pf-dlg pf-win" role="group" aria-label="Settings window (sample)">'+winHtml(m,"")+'</div></div>';
 return $("#pf-panel",host)}

window.KProfile={open:openProfile,close:closeAll,inline:inline};

/* ---------- standalone page only (the mockup Pantry): avatar, Open button, ?open= ---------- */
if($("#pf-app")){
 readInit();
 var avatar=$("#pf-avatar");
 avatar.innerHTML=badge(30);
 home=avatar;
 avatar.addEventListener("click",function(){openProfile(avatar)});
 $$("[data-open]").forEach(function(b){b.addEventListener("click",function(){openProfile(b)})});
 var op=new URLSearchParams(location.search).get("open");
 if(op==="shortcuts")toggleShortcuts();
 else if(op==="1")openProfile(avatar);
 else if(op==="invite"){var iv=INIT&&INIT.inv;openProfile(avatar);openInvite(avatar,iv)}
 else if(op&&VIEWS[op])go(op)}
})();
