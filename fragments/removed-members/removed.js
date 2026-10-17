/* Removed members (Kitchie #85). One renderer for the phone page (app.html) and the Profile window (desktop.html).
   The built page is server-rendered and has no script: every button below is a link or a form post there, and the in-place confirm is a <details>.
   The script exists only to move the sample data between states.
   Open a state directly:
   ?screen=household|remove|erase|history   ?who=sam|jo|maya (remove, erase)   ?removed=none|one|two (who is held; default two)
   ?open=sam|jo    the Restore confirm under that row is open     ?restored=sam   Sam was just restored     ?removedmaya=1   Maya was just removed
   ?dz=1    the Danger zone is open     ?erase=1   draw the Erase now option (proposal RM-P12, off by default)     ?typed=Sam   text already in the name box
   ?wrong=1  the typed name did not match   ?reset=1  start over. */
(function(){
var Q=new URLSearchParams(location.search),FORM=document.body.dataset.form||"phone";
var esc=function(s){return String(s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})};
var D=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],M=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
/* The sample clock: Sat 17 Oct 2026, 5:40 pm, household time. All times are minutes from a UTC date so the sample reads the same everywhere. */
var at=function(d,h,m){return Date.UTC(2026,9,d,h,m)/6e4};
var NOW=at(17,17,40),WEEK=7*24*60;
var day=function(t){var x=new Date(t*6e4);return D[x.getUTCDay()]+" "+x.getUTCDate()+" "+M[x.getUTCMonth()]};
var clock=function(t){var x=new Date(t*6e4),h=x.getUTCHours(),m=x.getUTCMinutes();return (h%12||12)+":"+(m<10?"0":"")+m+(h<12?" am":" pm")};
var when=function(t){return day(t)+", "+clock(t)};
/* RM-P2: how long is left. Whole days while there are two or more, then hours, then "Less than an hour". The last 24 hours read in the danger colour. */
var left=function(end){var m=end-NOW;if(m>=2*1440)return Math.floor(m/1440)+" days left";if(m>=1440)return "1 day left";if(m>=120)return Math.floor(m/60)+" hours left";if(m>=60)return "1 hour left";return "Less than an hour left"};
var PEOPLE={arjan:"Arjan",maya:"Maya",sam:"Sam",jo:"Jo"};
var S={members:["arjan","maya"],held:[],by:{},note:"",open:null,screen:Q.get("screen")||"household",who:Q.get("who")||"maya",wrong:Q.get("wrong")==="1",typed:Q.get("typed")||""};
S.held=[{id:"jo",at:at(10,20,30),by:"Maya"},{id:"sam",at:at(14,9,15),by:"Arjan"}];
var rm=Q.get("removed");if(rm==="none")S.held=[];else if(rm==="one")S.held=S.held.filter(function(h){return h.id==="sam"});
if(Q.get("removedmaya")==="1"){S.members=["arjan"];S.held.push({id:"maya",at:NOW,by:"Arjan"});S.note="removed"}
if(Q.get("restored")){var id=Q.get("restored");S.held=S.held.filter(function(h){return h.id!==id});S.members.push(id);S.note="restored:"+id;S.back=S.back||{};S.back[id]=1}
S.open=Q.get("open");
var ERASE=Q.get("erase")==="1",ONEXTRA=FORM==="desktop";
var name=function(id){return PEOPLE[id]};
var held=function(){return S.held.slice().sort(function(a,b){return a.at-b.at})};   /* RM-P6: the one erased soonest is first */
var chev='<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>';
var star='<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" style="vertical-align:-1px"><path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/></svg>';
var frame=function(title,back,inner){return '<div class="mtop"><a class="back" href="#" data-go="'+back+'">&lsaquo; Back</a><span class="ttl">'+esc(title)+'</span><span style="width:64px"></span></div><main class="mbody">'+inner+'</main>'};

var memberRow=function(id){
  var me=id==="arjan",n=esc(name(id));
  var sub=id==="arjan"?"Pantry Marshal":(S.back&&S.back[id]?"Has to sign in again":"");
  return '<div class="mrow plain" data-member="'+id+'"><span class="who2"><span class="av sm" aria-hidden="true">'+n[0]+'</span><div><b>'+n+'</b>'+(me?' <span class="chip">You</span> <span class="chip fchip">'+star+' Founding member</span>':'')+(sub?'<span class="sub">'+sub+'</span>':'')+'</div></span></div>';
};
/* The Removed card (RM-D6). Drawn only while someone is held; an empty section is not drawn (#82). */
var heldRow=function(h){
  var end=h.at+WEEK,n=esc(name(h.id)),soon=end-NOW<1440,open=S.open===h.id;
  return '<div class="mrow plain adm-row held'+(ERASE?' two':'')+'" data-held="'+h.id+'"><span class="who2"><span class="av sm dash" aria-hidden="true">'+n[0]+'</span><div><b>'+n+'</b>'+
    '<span class="sub">'+esc(h.by)+' removed '+n+' on '+day(h.at)+'.</span>'+
    '<span class="sub'+(soon?' soon':'')+'">Can be restored until '+when(end)+' &middot; '+left(end)+'</span></div></span>'+
    '<details class="adm"'+(open?' open':'')+'><summary aria-label="Restore '+n+'"><span class="o">Restore</span><span class="c">Cancel</span></summary>'+
    '<div class="admbox"><b>Restore '+n+'?</b><p class="small">'+n+' comes back as a member, with the same name. '+n+' has to sign in again to get in. Nothing else is sent to '+n+'.</p><button class="btn go" type="button" data-restore="'+h.id+'">Restore '+n+'</button></div></details>'+
    (ERASE?'<a class="dg" href="#" data-go="erase" data-who="'+h.id+'" aria-label="Erase '+n+' now">Erase now</a>':'')+'</div>';
};
var removedCard=function(){
  var hs=held();if(!hs.length)return "";
  return '<div id="removed"><span class="lbl">Removed</span><div class="menu card">'+hs.map(heldRow).join("")+'</div>'+
    '<p class="small" style="margin-top:8px">A removed person can be restored for 7 days. After that their name, sign-in and links are erased for good. What they added stays, shown as &ldquo;a former member&rdquo;.</p></div>';
};
var noteHtml=function(){
  var n=S.note;if(!n)return "";
  if(n==="removed"){var h=S.held.filter(function(x){return x.id==="maya"})[0];return '<div class="note" role="status">Maya removed. You can restore Maya until '+when(h.at+WEEK)+'.</div>'}
  if(n.indexOf("restored:")===0){var w=esc(name(n.slice(9)));return '<div class="note" role="status">'+w+' is back in Our kitchen. '+w+' has to sign in again.</div>'}
  if(n.indexOf("erased:")===0){return '<div class="note" role="status">'+esc(name(n.slice(7)))+' erased.</div>'}
  return "";
};
var household=function(){
  var others=S.members.filter(function(x){return x!=="arjan"});
  var dz=others.length?'<div class="dz"><details id="danger-zone"'+(Q.get("dz")==="1"?' open':'')+'><summary>Danger zone</summary><div class="stack"><p class="small">Remove someone from Our kitchen. They lose access to everything in it now. You can restore them for 7 days, then they are erased. You will be asked to confirm first.</p>'+
    others.map(function(x){return '<a class="btn ghost danger" href="#" data-go="remove" data-who="'+x+'" aria-label="Remove '+esc(name(x))+' from Our kitchen">Remove '+esc(name(x))+'</a>'}).join("")+'</div></details></div>':'';
  return frame("Household","back",
    noteHtml()+
    '<div><h1 class="hh">Our kitchen</h1><p>'+S.members.length+' member'+(S.members.length===1?'':'s')+'</p></div>'+
    '<div><span class="lbl">Members</span><div class="menu card">'+S.members.map(memberRow).join("")+'</div></div>'+
    removedCard()+
    '<div class="stack"><a class="btn go" href="#" data-go="invite">Invite someone</a></div>'+dz);
};
/* RM-P9: the confirm page says the week, the date and what the erase covers, so the person removing knows before typing. */
var removePage=function(){
  var id=S.who,n=esc(name(id)),end=NOW+WEEK;
  return frame("Remove member","household",
    '<div><h2>Remove '+n+' from Our kitchen?</h2></div>'+
    (S.wrong?'<div class="note bad" role="alert">Nothing changed: the name typed did not match.</div>':'')+
    '<ul class="facts"><li><b>Now</b>'+n+' is signed out everywhere. Their assistant link and any invites they have stop working. Anything they added stays.</li>'+
    '<li><b>You have a week to change your mind</b>Until '+when(end)+', anyone here can restore '+n+' from the Household page. '+n+' would have to sign in again.</li>'+
    '<li class="erase"><b>After that, '+n+' is erased</b>Their name, sign-in, assistant link, invites and notices that name them are deleted for good. What they added or changed stays in History, shown as &ldquo;a former member&rdquo;.</li></ul>'+
    '<div class="stack"><a class="btn go" href="#" data-go="household" autofocus>Cancel</a>'+
    '<label class="small" for="rmname">Type <b>'+n+'</b> to confirm</label><input class="fld" id="rmname" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="'+n+'" aria-label="Type their name to confirm" value="'+esc(S.typed)+'">'+
    '<button class="btn ghost danger" type="button" data-removego="'+id+'">Remove '+n+'</button></div>');
};
/* RM-P12: Erase now, only drawn when ?erase=1. */
var erasePage=function(){
  var id=S.who,n=esc(name(id)),h=S.held.filter(function(x){return x.id===id})[0],end=h?h.at+WEEK:NOW;
  return frame("Erase now","household",
    '<div><h2>Erase '+n+' now?</h2></div>'+
    (S.wrong?'<div class="note bad" role="alert">Nothing changed: the name typed did not match.</div>':'')+
    '<ul class="facts"><li class="erase"><b>This cannot be undone</b>'+n+' would be erased now, not on '+when(end)+'. Their name, sign-in, assistant link, invites and notices that name them are deleted. What they added stays in History, shown as &ldquo;a former member&rdquo;.</li></ul>'+
    '<div class="stack"><a class="btn go" href="#" data-go="household" autofocus>Keep '+n+' for now</a>'+
    '<label class="small" for="rmname">Type <b>'+n+'</b> to confirm</label><input class="fld" id="rmname" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="'+n+'" aria-label="Type their name to confirm" value="'+esc(S.typed)+'">'+
    '<button class="btn alert" type="button" data-erasego="'+id+'">Erase '+n+' now</button></div>');
};
/* RM-P10: after the erase, History says "a former member" in the place of the name, and nothing else changes. */
var historyPage=function(){
  var rows=[["Milk","Added 2 L","Maya","Sat 17 Oct, 4:10 pm"],["Eggs","Used 6","a former member","Thu 15 Oct, 7:30 pm"],["Spinach","Added 200 g","Arjan","Wed 14 Oct, 6:05 pm"],["Butter","Used 50 g","a former member","Tue 13 Oct, 8:20 am"],["Rice","Moved to Pantry","Maya","Mon 12 Oct, 12:00 pm"]];
  return frame("History","household",'<div><h2>History</h2><p class="small" style="margin-top:4px">Sample rows. Anything an erased member did keeps its item and its change.</p></div><div class="menu card">'+rows.map(function(r){
    var fm=r[2]==="a former member";return '<div class="mrow plain hrow"><div><b>'+esc(r[0])+'</b><span class="sub">'+r[1]+' &middot; by '+(fm?'<em data-former>'+r[2]+'</em>':esc(r[2]))+'</span><span class="sub">'+r[3]+'</span></div></div>'}).join("")+'</div>');
};
var SCREENS={household:household,remove:removePage,erase:erasePage,history:historyPage};
var root=document.getElementById("app");
var draw=function(){
  var h=(SCREENS[S.screen]||household)();
  root.innerHTML=h;
  if(FORM==="desktop"){var wp=document.querySelector(".win");if(wp)wp.setAttribute("data-screen",S.screen)}
  document.body.setAttribute("data-screen",S.screen);
};
document.addEventListener("click",function(e){
  var g=e.target.closest("[data-go]");
  if(g){e.preventDefault();var t=g.dataset.go;if(t==="back")t="household";if(t==="invite"){return}
    if(g.dataset.who)S.who=g.dataset.who;S.screen=t;S.wrong=false;S.typed="";draw();root.querySelector(".mbody")&&(root.querySelector(".mbody").scrollTop=0);return}
  var r=e.target.closest("[data-restore]");
  if(r){var id=r.dataset.restore;S.held=S.held.filter(function(h){return h.id!==id});S.members.push(id);S.back=S.back||{};S.back[id]=1;S.note="restored:"+id;S.open=null;draw();return}
  var x=e.target.closest("[data-removego]");
  if(x){var v=document.getElementById("rmname").value.trim().toLowerCase().replace(/\s+/g," "),id2=x.dataset.removego;S.typed=document.getElementById("rmname").value;
    if(v!==name(id2).toLowerCase()){S.wrong=true;draw();return}
    S.members=S.members.filter(function(m){return m!==id2});S.held.push({id:id2,at:NOW,by:"Arjan"});S.note="removed";S.screen="household";S.wrong=false;S.typed="";draw();return}
  var z=e.target.closest("[data-erasego]");
  if(z){var v2=document.getElementById("rmname").value.trim().toLowerCase(),id3=z.dataset.erasego;S.typed=document.getElementById("rmname").value;
    if(v2!==name(id3).toLowerCase()){S.wrong=true;draw();return}
    S.held=S.held.filter(function(h){return h.id!==id3});S.note="erased:"+id3;S.screen="household";S.wrong=false;S.typed="";draw()}
});
draw();
})();
