(function(){
var F="../desktop-filters/index.html",P="../desktop-profile/index.html",D="pantry.html";
var DEC=[
{id:"filters-window",t:"Filters and Sort window",why:"Owner: it must block the whole page, not pop out on the right. Issue #408.",rec:"a",cost:"Medium. B and C change the layout and the code; A reuses the phone content.",o:[
 {k:"a",l:"A. Centred compact",d:"Two columns, no tabs. Closest to the phone sheet, cheapest.",u:F+"?opt=a&open=1"},
 {k:"b",l:"B. Large two-pane",d:"Section list on the left, one section at a time, chosen filters as chips. Scales if filters grow.",u:F+"?opt=b&open=1"},
 {k:"c",l:"C. Wide with live preview",d:"Controls beside the matching items, updating on every click. Widest, needs a second list renderer.",u:F+"?opt=c&open=1"}]},
{id:"filters-place",t:"Where Option A sits",why:"Owner said it pops out where item details are shown, and also that it blocks everything.",rec:"centre",cost:"Low. One setting.",o:[
 {k:"centre",l:"Centred over the page",d:"A normal modal.",u:F+"?opt=a&open=1"},
 {k:"lane",l:"Tall, over the detail lane",d:"Same controls in one column where the item panel is, still blocking everything.",u:F+"?opt=a&open=1&place=lane"}]},
{id:"filters-esc",t:"Esc or a click outside the Filters window",why:"Unsaved picks are lost or kept.",rec:"discard",cost:"Low, but annoying either way if wrong.",o:[
 {k:"discard",l:"Close without applying",d:"Show N items is the only way to apply, as on the phone.",u:F+"?opt=a&open=1"},
 {k:"keep",l:"Keep the picks and apply",d:"Fewer lost picks, but Esc then changes the list.",u:""},
 {k:"ask",l:"Ask first",d:"Safe, one more click.",u:""}]},
{id:"status-ctl",t:"Status rows (Running low, Expiring soon, Recently added)",why:"Drawn as circles like the phone, though several can be on at once.",rec:"box",cost:"Low.",o:[
 {k:"circle",l:"Circle (looks like pick one)",d:"As on the phone today.",u:F+"?opt=a&open=1"},
 {k:"box",l:"Box (pick several)",d:"Matches how it behaves: several statuses combine.",u:""}]},
{id:"pill-click",t:"Clicking a location pill",why:"Owner: Ctrl or Cmd click for several. The phone toggles on a plain click.",rec:"replace",cost:"Medium. Friction for whoever expects the other.",o:[
 {k:"replace",l:"Plain click picks just that one",d:"Ctrl or Cmd click adds. Click the only picked pill again to clear.",u:D+"?sel=butter"},
 {k:"toggle",l:"Plain click toggles, like the phone",d:"Two clicks give two pills; Ctrl and Cmd are not needed.",u:F+"?opt=a&open=1&mode=toggle"}]},
{id:"profile",t:"Profile window",why:"Owner: dialogs block everything behind them. Issue #409. DECIDED by the owner, 9 October 2026: Option B.",rec:"a",decided:"b",cost:"A low (panes reused later), B highest, C medium and not fully blocking.",o:[
 {k:"a",l:"A. Account card",d:"The phone page widened, drill in and back.",u:P+"?o=a&open=1"},
 {k:"b",l:"B. Settings-style two-pane",d:"Left list, right content; room to grow, heaviest build.",u:P+"?o=b&open=settings"},
 {k:"c",l:"C. Menu, then window",d:"Quick actions in a menu beside the rail; the menu itself does not block the page.",u:P+"?o=c&menu=1&open=settings"}]},
{id:"row-actions",t:"Use one, Used up, Add to shopping list on desktop",why:"Owner: not buttons in the panel; asked for desktop-friendly ways. Issue #404.",rec:"a",cost:"Medium. A is drawn; B to D are described only.",o:[
 {k:"a",l:"A. Buttons on the row, plus U D S keys",d:"Appear on hover, focus and the open row; Undo toast, no confirm. Fastest for one item.",u:D+"?sel=butter"},
 {k:"b",l:"B. Toolbar at the top of the panel",d:"Same three, always visible, but only for the open item.",u:""},
 {k:"c",l:"C. Right-click menu on a row",d:"Familiar on desktop; hidden until found.",u:""},
 {k:"d",l:"D. Tick several rows (X), act on all",d:"The only option that helps with ten items. Can come after A.",u:""}]},
{id:"weighed",t:"\"Use one\" for a weighed item (250 g of butter)",why:"One has no meaning for grams or litres.",rec:"quantity",cost:"Medium. It is the most common action.",o:[
 {k:"quantity",l:"Open Quantity to set what is left",d:"Drawn. Always right, one more step.",u:D+"?sel=butter"},
 {k:"portion",l:"Use a stored portion",d:"Needs a portion size per item (new data).",u:""},
 {k:"hide",l:"No use-one for weighed items",d:"Simplest; Used up only.",u:""}]},
{id:"edit-save",t:"Editing fields in the panel",why:"Issue #405.",rec:"live",cost:"Low.",o:[
 {k:"live",l:"Saves as you go",d:"Drawn. No Save button; Esc closes.",u:D+"?sel=butter"},
 {k:"button",l:"Save button",d:"Matches the phone page, one more click.",u:""}]},
{id:"help-key",t:"Key for the shortcuts list",why:"Owner: ? or h. H is also the second key in G then H (Home).",rec:"both",cost:"Low.",o:[
 {k:"both",l:"? and H",d:"Drawn.",u:D+"?sel=butter"},
 {k:"q",l:"? only",d:"No clash with G then H.",u:""}]},
{id:"wide",t:"Very wide windows",why:"Owner: a defined gap, the left oriented to it. Built that way.",rec:"left",cost:"Medium. An empty band on the right of big monitors.",o:[
 {k:"left",l:"Group stays left, free space on the right",d:"Built (Kitchie v0.51.2).",u:D+"?sel=butter&vp=2560"},
 {k:"centre",l:"Centre the whole group",d:"Balanced, but the rail is no longer at the screen edge.",u:""},
 {k:"inset",l:"Grow a left inset",d:"Earlier 14vw idea; the rail floats in from the edge.",u:""}]},
{id:"tablet",t:"Tablet (768 to 1023px)",why:"Not drawn. Issue: AGENTS.md says it keeps the bottom bar and the relaxed column.",rec:"keep",cost:"High if guessed: a rail on a 768px screen leaves little room.",o:[
 {k:"keep",l:"Keep the bottom bar and relaxed column",d:"Built today.",u:""},
 {k:"rail",l:"Rail, detail still a sheet",d:"Needs a mockup.",u:""},
 {k:"full",l:"Rail and panel from 900px",d:"Needs a mockup; narrow column.",u:""}]}];
var KEY="desktop-decisions-v1",pick={};
function load(){try{pick=JSON.parse(localStorage.getItem(KEY)||"{}")}catch(e){pick={}}DEC.forEach(function(d){if(d.decided)pick[d.id]=d.decided})}
function save(){try{localStorage.setItem(KEY,JSON.stringify(pick))}catch(e){}}
function esc(s){return String(s).replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;")}
function href(u){var w=document.getElementById("vpw").value;if(!u)return"";return u+(u.indexOf("vp=")>-1||w==="0"?"":(u.indexOf("?")>-1?"&":"?")+"vp="+w)}
function render(){document.getElementById("list").innerHTML=DEC.map(function(d,n){return '<section class="dc" aria-labelledby="h'+n+'"><h2 id="h'+n+'">'+(n+1)+'. '+esc(d.t)+'</h2><p class="why">'+esc(d.why)+'</p>'+d.o.map(function(o){var h=href(o.u);return '<label><input type="radio" name="'+d.id+'" value="'+o.k+'"'+(pick[d.id]===o.k?" checked":"")+'><span class="ot"><b>'+esc(o.l)+(d.decided===o.k?'<span class="rec">Decided</span>':d.rec===o.k?'<span class="rec">Recommended</span>':"")+'</b><span>'+esc(o.d)+'</span></span>'+(h?'<a class="open" href="'+esc(h)+'">Open &rsaquo;</a>':'<span class="open" style="color:var(--muted);font-weight:500">not drawn</span>')+'</label>'}).join("")+'<p class="cost">Cost of a wrong guess: '+esc(d.cost)+'</p></section>'}).join("");summary()}
function summary(){var n=0,t=[];DEC.forEach(function(d,i){var o=d.o.filter(function(x){return x.k===pick[d.id]})[0];if(o){n++;t.push((i+1)+". "+d.t+": "+o.l+(d.decided===o.k?" (decided by the owner)":d.rec===o.k?" (recommended)":""))}else t.push((i+1)+". "+d.t+": undecided")});document.getElementById("count").textContent=n+" of "+DEC.length+" picked";document.getElementById("out").value="Desktop choices (owner)\n"+t.join("\n")}
document.addEventListener("change",function(e){if(e.target.type==="radio"){pick[e.target.name]=e.target.value;save();summary()}});
document.getElementById("vpw").addEventListener("change",render);
document.getElementById("clear").addEventListener("click",function(){pick={};DEC.forEach(function(d){if(d.decided)pick[d.id]=d.decided});save();render()});
document.getElementById("copy").addEventListener("click",function(){var o=document.getElementById("out"),m=document.getElementById("msg");o.select();var ok=false;try{ok=document.execCommand("copy")}catch(e){}m.textContent=ok?"Copied.":"Select the text and copy it."});
load();render();
})();
