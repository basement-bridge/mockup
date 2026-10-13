/* Option B, the meal detail (realigned with the phone Plan, 14 Oct 2026; decisions 259 to 275).
   Replaces P.mealHtml for B only (A, C and D keep the shared one). What carried over from the phone, in the owner's words where he gave them:
   one combined ingredient list, missing first, no ON HAND and MISSING headings (123); one Total time (124); the bottom is Hold N and Add N, labelled Release once held (126, 174);
   Replan and Not cooking are not repeated in the detail (126: they are the tile icons, the menu and the keys); Open recipe is a real action (127);
   another person's plan is fully view only: an eye and one line, no Hold, no Add, no stepper (190, 206); the blocked hold state is gone (207).
   Desktop keeps its key badges (127: "Desktop menus are unchanged"). Tokens only, no size rules. */
(function(){var P=PLAN,u=P.u,BI=P.bi,DN=u.DN,DF=u.DF,I=u.I,R=u.R,esc=u.esc,sm=BI.sm;
var RID={shak:"sha",pasta:"pas",rice:"efr"};   /* sample meals that have a recipe page in the mockup (the phone maps the same three) */
var MIN={shak:25,pasta:30,curry:45,patty:35,tuna:15,left:10,stir:25,soup:60,rice:20,fritt:30};   /* Total time, one figure (124); sample values */
function mins(n){return n<60?n+" min":Math.floor(n/60)+" h"+(n%60?" "+(n%60)+" min":"")}
P.bMins=function(r){return MIN[r]?mins(MIN[r]):""};
function voLine(c){var S=P.S();
 if(u.roCard(c))return c.wk<0?"Last week is view only. You can look, not change.":"This night has passed. You can look, not change.";
 if(u.person())return "View only, "+S.view+"'s plan. You can look, not change.";
 return c.by+" planned this. View only."}
P.mealHtml=function(c){var S=P.S(),r=R[c.r],act=u.can(c)&&!u.roCard(c),sr=u.srcOf(c),oh=u.onhand(c),ms=u.missing(c),dis=u.offline(),left=sr==="left",i=DN.indexOf(c.day),h="",
 open=ms.filter(function(x){return !u.onList(c,x)});
 h+=(P.layout.peek?P.layout.peek():"")+'<div class="top"><span class="ph">'+r.e+'</span><div><h2>'+esc(r.n)+'</h2><p>'+DF[i].slice(0,3)+' '+u.dstr(c.wk,i)+' · '+esc(u.meta(c))+'</p></div><button class="x" data-close aria-label="Close ('+P.mod+' Enter)" data-tip="Close ('+P.mod+' Enter)" data-fk="lane:x">&times;</button></div>';
 if(MIN[c.r])h+='<div class="tt" title="Total time">'+sm(BI.CLOCK,15)+'<span>Total time</span><b>'+mins(MIN[c.r])+'</b></div>';
 if(!act)h+='<span class="tg mute lockline vo">'+sm(BI.EYE,14)+'<span>'+esc(voLine(c))+'</span></span>';
 if(sr==="saved"||sr==="mod")h+='<div class="srcbox">'+(sr==="mod"?'<span class="tg also">Modified by assistant</span><span>Swaps are kept with this meal on '+c.day+' and shown on the rows below.</span>':'')+'<button class="lnk" data-act="viewrec" data-rid="'+(RID[c.r]||"")+'" data-fk="lane:rec">'+sm(BI.OPEN,14)+' Open recipe'+(sr==="mod"?" (the original)":"")+'</button></div>';
 if(sr==="made")h+='<div class="srcbox"><span class="tg also">Made up by your assistant</span><span>Not a saved recipe.</span></div>';
 if(left)h+='<div class="srcbox"><span class="tg mute">Category: Leftovers (protected)</span><span>Reheats the '+esc(R[R[c.r].from].n)+' cooked earlier. No recipe, no shopping, no hold.</span></div>';
 if(act&&!left)h+='<div class="ppl"><span class="lbl" style="margin:0">People</span><button class="mini" data-act="ppl" data-d="-1" aria-label="Fewer people" data-fk="lane:p-"'+(c.n<=1||dis?" disabled":"")+'>−</button><b>'+c.n+'</b><button class="mini" data-act="ppl" data-d="1" aria-label="More people" data-fk="lane:p+"'+(c.n>=8||dis?" disabled":"")+'>+</button></div>';
 /* one list: what is missing first (red only while nothing is done about it, 121 to 123), a hairline, then what is on hand (use-by is plain words, accent when it matters, never red) */
 if(ms.length||oh.length){h+='<div class="ings" role="list" aria-label="Ingredients">';
  ms.forEach(function(x){var al=u.also(c,x),on=u.onList(c,x),o=u.orig(c,x);
   h+='<div class="ing ind miss'+(on?" listed":"")+'" role="listitem"><span class="nm">'+esc(x)+(o?' <span class="was">(<s>'+esc(o)+'</s>)</span>':"")+' <span class="q">'+u.qty(x,c.n)+'</span>'+(on&&!act?'<span class="sub">on the shopping list</span>':"")+(al.length?'<span class="sub">also needed '+al.join(", ")+'</span>':"")+'</span><span class="rt">'
   +(act?'<button class="mini cart" data-act="addlist" data-i="'+esc(x)+'" data-id="'+c.id+'" aria-pressed="'+on+'" aria-label="'+(on?esc(x)+" is on the shopping list. Press to take it off":"Add "+esc(x)+" to the shopping list")+'" data-fk="lane:c:'+esc(x)+'"'+(dis?" disabled":"")+'>'+(on?BI.TICK:I.cart)+'</button>':(on?'<span class="lm" aria-hidden="true">'+BI.TICK+'</span>':""))+'</span></div>'});
  if(ms.length&&oh.length)h+='<hr class="isep">';
  oh.forEach(function(x){var al=u.also(c,x),bad=u.risk(c).indexOf(x)>-1,st=u.STOCK[x],o=u.orig(c,x);
   h+='<div class="ing ind" role="listitem"><span class="nm">'+esc(x)+(o?' <span class="was">(<s>'+esc(o)+'</s>)</span>':"")+' <span class="q">'+u.qty(x,c.n)+'</span>'+(st.ub?'<span class="sub'+(bad?" soonish":"")+'">use by '+u.ubText(x)+(bad?", before "+c.day:"")+'</span>':"")+(al.length?'<span class="sub">also '+al.join(", ")+'</span>':"")+'</span></div>'});
  h+='</div>'}
 else h+='<p style="margin-top:12px;font-size:13px">Leftovers need no shopping and no hold.</p>';
 /* the bottom is Hold N and Add N (126): the number is what the button will touch; Release once held (174); nothing is drawn when it does not apply */
 if(act&&!left&&(oh.length||open.length)){h+='<div class="foot">'
  +(oh.length?'<button class="btn'+(c.res?" held":"")+'" data-act="hold" data-id="'+c.id+'" data-fk="lane:hold" aria-label="'+(c.res?"Release the hold on "+oh.length+" on-hand ingredients":"Hold "+oh.length+" on-hand ingredients")+'"'+(dis?" disabled":"")+'>'+sm(I.held,16)+(c.res?"Release ":"Hold ")+oh.length+' <span class="kbd">H</span></button>':"")
  +(open.length?'<button class="btn" data-act="addmissing" data-id="'+c.id+'" data-fk="lane:addall" aria-label="Add the '+open.length+' missing ingredients to the shopping list"'+(dis?" disabled":"")+'>'+sm(I.cart,16)+'Add '+open.length+' <span class="kbd">L</span></button>':"")+'</div>'
  +(c.res?'<p class="hint" style="margin-left:0;margin-top:8px">Replan or Not cooking also releases this hold.</p>':"")}
 return h};
/* Open recipe is a real action for the sample meals that have a page (127); the others say so, as the phone does */
document.addEventListener("click",function(e){var l=e.target.closest&&e.target.closest("[data-act=viewrec]");if(!l)return;if(l.dataset.rid){e.stopPropagation();location.href="../../recipe/detail.html?id="+l.dataset.rid+"&from=plan"}},true);
})();
