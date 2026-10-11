/* Settings window, Preferences layout A on a phone or tablet (mockup, 12 Oct 2026, round 7). Loaded by profile.js only when ?pref=a is shown under 900px, after profile-prefs.js, whose data, rows and rules it borrows (KProfilePrefs.x).
   Owner (voice, 12 Oct 2026): mobile has no housemate view at all today (uat v0.85.0, read-only audit); design it. The phone's pattern is inline accordion rows and full-page sub-screens with a back link; the desktop flyout beside the row does not apply.
   Shape (all Proposals unless the owner said it, SW-47 on): two tabs, Mine and Household, as on the phone page today. A Housemates group sits at the top of the Household tab (name, food count, N waiting, the dot);
   a housemate opens as a full-page sub-screen with a back link (food only, Propose something for <name>, pending proposals). The propose form opens in place under its button. Someone else is an accordion row for housemates with nothing to show.
   Every other row opens a full-page sub-screen (the desktop flyout's content, in a page with Back and a Done bar). The add-rule and What applies pickers are the scoped, searchable ones, in that page.
   Static sample data, no storage, no network. */
(function(){
"use strict";
var K=window.KProfilePrefs,X=K.x;
var $=function(s,r){return(r||document).querySelector(s)};
var ic=X.ic,esc=X.esc,PPL=X.PPL,CHEV=X.CHEV;
function phone(m){return window.matchMedia("(max-width:900px)").matches&&m.pref==="a"}
function dot(label){return X.dotEl(label)}
function anyMemberDot(m){var v=X.viewer(m);return X.memberIds(v).some(function(id){return X.memberDot(m,id)})}
function hhDot(m){return X.chgMode(m)==="2"&&(X.unseen().length>0||anyMemberDot(m))}

/* the Housemates group, at the top of the Household tab */
function group(m){
 var v=X.viewer(m),ids=X.memberIds(v),more=X.elseIds(v).filter(function(id){return ids.indexOf(id)<0});
 if(!ids.length&&!more.length)return "";
 var any=ids.some(function(id){return X.memberDot(m,id)});
 var rows=ids.map(function(id){
  var own=X.foodOf(id).filter(function(f){return f.r!=="sub"}).length,n=X.between(v,id).length,d=X.memberDot(m,id);
  return '<li class="'+(d?"pf-unseen":"")+'"><button type="button" class="pf-item pm-mrow" data-pa="gomember" data-id="'+id+'"><span class="pf-ini" aria-hidden="true">'+PPL[id].charAt(0)+'</span><span class="pf-t">'+PPL[id]+'<small>'+(own?own+(own===1?" food item":" food items"):"Nothing of their own yet")+'</small></span>'
   +(d?dot(PPL[id]+" has something new"):"")+(n?'<span class="pf-chip wait">'+n+' waiting</span>':"")+CHEV+'</button></li>'}).join("");
 var els="";
 if(more.length){
  var open=!!m.melse;
  els='<li class="pm-else"><button type="button" class="pf-item pf-acch" data-pa="melse" aria-expanded="'+open+'" aria-controls="pm-else-p"><span class="pf-ico sm">'+ic("plus",16)+'</span><span class="pf-t">Someone else<small>'+more.map(function(i){return PPL[i]}).join(", ")+' · nothing to show yet</small></span><span class="pf-chev pf-rot">'+ic("chev",18)+'</span></button>'
   +'<div class="pm-elsep" id="pm-else-p" role="region" aria-label="Housemates with nothing to show yet"'+(open?"":" hidden")+'>'+(open?'<p class="pf-small">They have told Kitchie nothing about food yet. Pick one to propose something for them.</p><ul class="pf-list">'+more.map(function(id){return '<li><button type="button" class="pf-item pm-mrow" data-pa="gomember" data-id="'+id+'"><span class="pf-ini" aria-hidden="true">'+PPL[id].charAt(0)+'</span><span class="pf-t">'+PPL[id]+'<small>Nothing of their own yet</small></span>'+CHEV+'</button></li>'}).join("")+'</ul>':"")+'</div></li>'}
 return '<div class="pm-hm"><span class="pf-lbl">Housemates'+(any?dot("A housemate has something new"):"")+'</span><ul class="pf-list pf-picks">'+rows+els+'</ul><p class="pf-small pf-note2">Food only. Read what each person has told Kitchie, and propose something for them.</p></div>'}

/* mockup-only strip: what the footer says on a desktop */
function ctl(m){
 var seg=function(label,attr,cur,items){return '<span>'+label+'</span><span class="pf-seg" role="radiogroup" aria-label="'+label+'">'+items.map(function(x){return '<button type="button" role="radio" aria-checked="'+(cur===x[0])+'" data-'+attr+'="'+x[0]+'">'+x[1]+'</button>'}).join("")+'</span>'};
 return '<div class="pf-mock pm-ctl">'+seg("Dots (changed since last seen)","chg",X.chgMode(m)==="0"?"0":"2",[["2","Show"],["0","All seen"]])+seg("Viewing as","as",m.as,[["arjan","Arjan (admin)"],["sam","Sam"]])+'</div>'}
function tag(){return '<p class="pf-mock pm-tag">Mockup: the phone and tablet layout of Preferences (layout A)</p>'}

function sub(m,o,back,pa){
 var foot=o.foot==="Close"?'<button type="button" class="pf-btn pri" data-flyclose>Done</button>':o.foot;
 return '<div class="pm pm-in pm-sub" data-screen="'+esc(m.sel||"")+'"><button type="button" class="pm-back" '+(pa?'data-pa="'+pa+'"':'data-flyclose')+' data-subfocus>'+ic("back",20)+'<span>'+back+'</span></button>'
  +'<div class="pm-subh">'+(o.crumb?'<span class="pf-crumb">'+o.crumb+'</span>':"")+'<h3>'+esc(o.t)+'</h3></div><div class="pf-ed">'+o.body+'</div>'+(foot?'<div class="pm-foot">'+foot+'</div>':"")+'</div>'}

function pane(m){
 if(m.psub==="else"){m.psub="hh";m.melse=true}
 X.prep(m);
 var sub0=m.psub,v=X.viewer(m);
 if(X.isMember(m,sub0)){
  if(m.sel&&m.sel!=="a:give")m.sel=null;
  var nm=PPL[sub0];
  return tag()+'<div class="pm pm-in pm-sub" data-screen="member:'+sub0+'"><button type="button" class="pm-back" data-pa="mback" data-subfocus>'+ic("back",20)+'<span>Household</span></button>'
   +'<div class="pm-subh"><span class="pf-crumb">Housemates</span><h3>'+nm+'</h3></div>'+X.memberPane(m,sub0,true)+'</div>'+ctl(m)}
 if(m.sel){
  var o=X.flyParts(m);
  if(o)return tag()+sub(m,o,sub0==="hh"?"Household":"Mine")}
 var body=sub0==="hh"?X.mkHh(m,group(m)):X.mine(m);
 return tag()+'<div class="pm pm-in" data-screen="'+sub0+'"><div class="pf-seg pm-tabs" role="radiogroup" aria-label="Preferences">'
  +'<button type="button" role="radio" aria-checked="'+(sub0==="mine")+'" data-pa="mtab" data-v="mine">Mine</button>'
  +'<button type="button" role="radio" aria-checked="'+(sub0==="hh")+'" data-pa="mtab" data-v="hh">Household'+(hhDot(m)?dot("Something changed since you last looked"):"")+'</button></div>'
  +'<div class="pm-in">'+body+'</div></div>'+ctl(m)}

function bodyEl(m){return $(".pf-body",m.frame)}
function click(m,el,H){
 if(!phone(m))return false;
 var pa=el.dataset.pa,id=el.dataset.id;
 if(pa==="mtab"){m.psub=el.dataset.v;m.sel=null;m.melse=false;H.paint(m,false);var b=$('[data-pa="mtab"][data-v="'+el.dataset.v+'"]',m.frame);if(b)b.focus();return true}
 if(pa==="melse"){m.melse=!m.melse;H.paint(m,false);var e=$('[data-pa="melse"]',m.frame);if(e)e.focus();return true}
 if(pa==="gomember"){var b0=bodyEl(m);m._y=b0?b0.scrollTop:0;m._who=id;m.psub=id;m.sel=null;H.paint(m,true);var b1=bodyEl(m);if(b1)b1.scrollTop=0;return true}
 if(pa==="mback"){m.psub="hh";m.sel=null;var who=m._who;H.paint(m,true,'[data-pa="gomember"][data-id="'+(who||"")+'"]');var b2=bodyEl(m);if(b2)b2.scrollTop=m._y||0;return true}
 return false}
window.KProfilePrefsM={pane:pane,click:click};
})();
