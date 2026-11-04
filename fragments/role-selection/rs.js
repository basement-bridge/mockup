/* Role selection mockup: the smallest script that makes the frames feel real. No requests. */
(function(){
  /* scale the 1280px desktop windows to fit */
  function fit(){document.querySelectorAll('.rs-sc').forEach(function(sc){var inn=sc.firstElementChild,k=Math.min(1,sc.clientWidth/1280);inn.style.transform='scale('+k+')';sc.style.height=Math.round(inn.offsetHeight*k)+'px';});}
  fit();addEventListener('resize',fit);
  function toast(d,msg){var t=d.querySelector('.rl-toast');if(!t){t=document.createElement('div');t.className='rl-toast';t.setAttribute('role','status');d.closest('.rs-pin,.rs-in').appendChild(t);}t.textContent=msg;t.hidden=false;clearTimeout(t._t);t._t=setTimeout(function(){t.hidden=true},1800);}
  document.querySelectorAll('.rs-demo').forEach(function(d){
    d.addEventListener('click',function(e){var b=e.target.closest('[data-act]');if(!b||b.disabled)return;toast(d,b.dataset.act==='skip'?'Skipped. You can set a role any time in Menu. (mockup)':'Saved. (mockup)');});
    /* A: tiles */
    var tiles=d.querySelectorAll('.rl-tile');
    if(tiles.length){
      var prev=d.querySelector('.rl-prev'),save=d.querySelector('[data-act=save]');
      var pick=function(t){tiles.forEach(function(x){x.setAttribute('aria-checked',x===t?'true':'false')});
        prev.removeAttribute('data-empty');prev.querySelector('.rl-pt b').textContent=t.dataset.title;prev.querySelector('.rl-pt span').textContent=t.dataset.tagline;
        prev.querySelector('.rl-ic').innerHTML=t.querySelector('.rl-ic').innerHTML;
        var f=d.querySelectorAll('.rl-edit .rl-field');if(f.length){f[0].value=t.dataset.title;f[1].value=t.dataset.tagline;d.querySelector('.rl-edit .rl-ic').innerHTML=t.querySelector('.rl-ic').innerHTML;}
        if(save)save.disabled=false;};
      tiles.forEach(function(t){t.addEventListener('click',function(){pick(t)});});
      if(d.dataset.sel!==undefined&&d.dataset.sel!==''){pick(tiles[+d.dataset.sel]);}
      d.querySelectorAll('.rl-pencil').forEach(function(p){p.addEventListener('click',function(){var ed=d.querySelector('.rl-edit');if(ed)ed.hidden=!ed.hidden;});});
    }
    /* B: rotary */
    var rot=d.querySelector('.rl-rot');
    if(rot){
      var cards=rot.children,go=function(i){i=Math.max(0,Math.min(cards.length-1,i));rot.scrollTo({left:cards[i].offsetLeft-rot.offsetLeft,behavior:'auto'});mark(i);};
      var cur=function(){return Math.round(rot.scrollLeft/rot.clientWidth)};
      var chips=d.querySelectorAll('.rl-strip .rl-chip');
      var dots=d.querySelectorAll('.rl-dots i'),pos=d.querySelector('.rl-pos');
      function mark(i){chips.forEach(function(c,n){c.setAttribute('aria-checked',n===i?'true':'false')});dots.forEach(function(x,n){x.classList.toggle('on',n===i)});if(pos)pos.textContent=(i+1)+' of '+cards.length;}
      go(+rot.dataset.start||0);
      rot.addEventListener('scroll',function(){clearTimeout(rot._s);rot._s=setTimeout(function(){mark(cur())},80)});
      rot.addEventListener('keydown',function(e){if(e.key==='ArrowRight'){e.preventDefault();go(cur()+1)}if(e.key==='ArrowLeft'){e.preventDefault();go(cur()-1)}});
      d.querySelectorAll('.rl-arrow').forEach(function(a){a.addEventListener('click',function(){go(cur()+ +a.dataset.dir)})});
      chips.forEach(function(c,n){c.addEventListener('click',function(){go(n)})});
      if('IntersectionObserver' in window){new IntersectionObserver(function(en,o){if(en[0].isIntersecting){rot.classList.add('wig');o.disconnect();}},{threshold:.6}).observe(rot);}
    }
    /* C: the Home card */
    var n=d.querySelector('.rl-nudge');
    if(n){
      var ask=n.querySelector('.rl-ask'),done=n.querySelector('.rl-done');
      n.querySelectorAll('.rl-chip').forEach(function(c){c.addEventListener('click',function(){
        ask.hidden=true;done.hidden=false;done.querySelector('[data-fill]').innerHTML=c.innerHTML;done.querySelector('[data-name]').textContent=c.getAttribute('aria-label');});});
      n.querySelector('.rl-undo').addEventListener('click',function(){done.hidden=true;ask.hidden=false;});
      n.querySelector('.rl-x').addEventListener('click',function(){n.hidden=true;toast(d,'Dismissed for good. Change it any time in Menu. (mockup)');});
    }
  });
})();
