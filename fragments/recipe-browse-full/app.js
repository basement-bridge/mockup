/* Prototype behaviour for the live frame only. Static frames above need no script. Nothing is saved or fetched. */
(function(){
  var f=document.querySelector('.rb-demo'); if(!f) return;
  var $=function(s,r){return (r||document).querySelector(s)};
  var was=null; /* was the browse flyout open when the page opened (Back reopens it) */
  var set=function(k,v){f.setAttribute('data-'+k,v)};
  var view=function(){return f.getAttribute('data-view')}, fly=function(){return f.getAttribute('data-fly')};
  var sync=function(){var on=fly()==='notes';f.querySelectorAll('[data-notes]').forEach(function(b){b.setAttribute('aria-pressed',on?'true':'false')})};
  var openBrowse=function(){if(view()==='list'){set('fly','browse');sync()}};
  var openFull=function(){if(view()!=='list'||fly()!=='browse')return;was=true;set('fly','none');set('view','page');sync();var h=$('.rb-page:not([style*=none]) h1',f);};
  var back=function(){if(view()!=='page')return;set('view','list');set('fly',was?'browse':'none');sync()};
  var notes=function(){if(view()!=='page')return;set('fly',fly()==='notes'?'none':'notes');sync()};
  var closeFly=function(){if(fly()!=='none'){set('fly','none');sync();return true}return false};
  f.addEventListener('click',function(e){
    var t=e.target;
    if(t.closest('[data-open="browse"]')){openBrowse();return}
    if(t.closest('[data-open-full]')){e.preventDefault();openFull();return}
    if(t.closest('[data-back]')){e.preventDefault();back();return}
    if(t.closest('[data-notes]')){notes();return}
    if(t.closest('[data-close]')){closeFly();return}
  });
  document.addEventListener('keydown',function(e){
    var typing=/^(INPUT|TEXTAREA|SELECT)$/.test((e.target.tagName||''));
    var mod=e.ctrlKey||e.metaKey;
    if(mod&&(e.key==='Escape'||e.key==='Enter')){if(closeFly())e.preventDefault();return}
    if(typing||mod||e.shiftKey)return;
    if(e.altKey&&e.key==='ArrowLeft'){back();e.preventDefault();return}
    if(e.altKey)return;
    var inF=f.contains(document.activeElement)||document.activeElement===document.body;
    if(!inF)return;
    if(e.key==='o'||e.key==='O'){openFull()}
    else if(e.key==='n'||e.key==='N'){notes()}
    else if(e.key==='Enter'&&document.activeElement.classList.contains('rb-rr')){openBrowse()}
  });
  document.querySelectorAll('.rb-sw').forEach(function(b){b.addEventListener('click',function(){
    var n=b.dataset.set; set(n,b.dataset.v);
    document.querySelectorAll('.rb-sw[data-set="'+n+'"]').forEach(function(x){var on=x===b;x.classList.toggle('on',on);x.setAttribute('aria-pressed',on?'true':'false')});
  })});
  sync();
})();
