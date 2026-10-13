/* Claim flow (mockup, nothing is sent or stored): 1 create the account, 2 name the household, 3 done. Replaces the recipe in place (DESIGN.md 6a);
   "Back to the recipe" restores it. The invite is drawn as claimed when step 1 is passed (see notes: proposal). Sample names are fictional. */
(function(){
window.RSClaim={init:function(o){
 var root=o.root,ic=o.ic,E=o.E,name="The Naidoo kitchen",step=1;
 function dots(n){return '<div class="rs-dots" aria-label="Step '+n+' of 3">'+[1,2,3].map(function(i){return '<i'+(i<=n?' class="on"':'')+'></i>'}).join("")+'<span>Step '+n+' of 3</span></div>'}
 function back(){return '<button type="button" class="rs-ghost rs-back" data-back>Back to the recipe</button>'}
 function view(){
  if(step===1)return '<main class="rs-page rs-flow" id="rs-main"><form class="rs-fc" data-f1>'+dots(1)+'<h1>Start your own household</h1><p>The invite sets up a new household that is yours. It never adds you to anyone else\'s.</p><label class="rs-fld">Your email<input type="email" name="e" value="sam@example.com" autocomplete="email"></label><button type="submit" class="rs-btn">'+ic("logo")+'<span>Create my account</span></button><p class="rs-sm">Once you continue, the invite is yours and nobody else can use it.</p>'+back()+'</form></main>';
  if(step===2)return '<main class="rs-page rs-flow" id="rs-main"><form class="rs-fc" data-f2>'+dots(2)+'<h1>Name your household</h1><p>This is what the people you add later will see. You can change it any time.</p><label class="rs-fld">Household name<input name="n" value="'+E(name)+'" maxlength="40" autocomplete="off"></label><button type="submit" class="rs-btn"><span>Create household</span></button></form></main>';
  return '<main class="rs-page rs-flow" id="rs-main"><section class="rs-fc">'+dots(3)+'<span class="rs-pot">'+ic("check",44)+'</span><h1>'+E(name)+' is ready</h1><ul class="rs-ok"><li>'+ic("check",18)+'<span>Your household is new and yours. Nobody is in it but you.</span></li><li>'+ic("check",18)+'<span>'+E(o.title)+' is in your Recipes, as your own copy.</span></li></ul><a class="rs-btn" href="#">Open my kitchen</a></section></main>';
 }
 function draw(){root.innerHTML=o.top+view();document.body.setAttribute("data-flow",step)}
 root.addEventListener("submit",function(e){
  var f=e.target;if(f.hasAttribute("data-f1")){e.preventDefault();step=2;draw()}
  else if(f.hasAttribute("data-f2")){e.preventDefault();name=(f.n.value||"").trim()||name;step=3;draw()}
 });
 root.addEventListener("click",function(e){if(e.target.closest("[data-back]")){root.innerHTML=o.top+o.page();document.body.removeAttribute("data-flow");root.dispatchEvent(new Event("rs-restored"))}});
 return {show:function(n){step=n;draw()}};
}};
})();
