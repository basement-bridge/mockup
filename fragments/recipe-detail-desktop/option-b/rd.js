/* Option B, three zones. Draws the page from RD (rd-data.js) and wires the few behaviours the mockup shows.
   Query: ?r=short|typical|long|notes|cooked|nocooked  &t=dark|light  &v=kept|trying|away  &empty=collapse|keep  &sv=2 (stock unknown) */
(function(){
var P=new URLSearchParams(location.search);
var R=P.get('r')||'typical'; if(!RD.recipes[R])R='typical';
var rec=RD.recipes[R], soc=RD.social[R];
var VS=P.get('v')||'kept', EMPTY=P.get('empty')||'collapse', STOCK=P.get('sv')!=='unknown';
var n=rec.serves, planned=P.get('planned')==='1';
var $=function(s,r){return (r||document).querySelector(s)}, $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};

/* ---- icons (stroke family used by the other recipe mockups) ---- */
var P2={
 back:'<path d="M15 5l-7 7 7 7"/>',star:'<path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.9-5.2-2.8-5.3 2.8 1.1-5.9-4.3-4.1 5.9-.8z"/>',
 edit:'<path d="M4 20l1-4L16.5 4.5a2 2 0 0 1 3 3L8 19z"/>',share:'<path d="M12 15V4M8 8l4-4 4 4M5 12v7h14v-7"/>',
 more:'<circle cx="5" cy="12" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="19" cy="12" r="1.4"/>',
 note:'<path d="M5 4h14v12l-5 4H5z"/><path d="M14 20v-4h5"/>',up:'<path d="M7 11v9H4v-9zM7 11l4-8c2 0 3 1.5 2.5 3.5L13 9h6a2 2 0 0 1 2 2.4l-1.3 6.4A2 2 0 0 1 17.8 19H7"/>',
 dn:'<path d="M7 13V4H4v9zM7 13l4 8c2 0 3-1.5 2.5-3.5L13 15h6a2 2 0 0 0 2-2.4L19.7 6.2A2 2 0 0 0 17.8 5H7"/>',
 clock:'<circle cx="12" cy="12" r="8.5"/><path d="M12 7v5l3 2"/>',cart:'<path d="M4 5h2l2 10h9l2-7H7"/><circle cx="10" cy="19" r="1"/><circle cx="17" cy="19" r="1"/>',
 plus:'<path d="M12 5v14M5 12h14"/>',cam:'<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
 hist:'<path d="M4 12a8 8 0 1 0 3-6.2M4 4v4h4"/><path d="M12 8v4l3 2"/>',cal:'<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/>',
 cook:'<path d="M5 13h14a0 0 0 0 1 0 0 7 7 0 0 1-14 0zM9 9c0-2 2-2 2-4M14 9c0-2 2-2 2-4"/>',
 branch:'<circle cx="6" cy="5" r="2"/><circle cx="6" cy="19" r="2"/><circle cx="18" cy="9" r="2"/><path d="M6 7v10M18 11c0 4-6 3-12 6"/>',
 x:'<path d="M6 6l12 12M18 6L6 18"/>',cooked:'<path d="M5 12l4 4 10-10"/>'
};
var ic=function(k,s){s=s||20;return '<svg class="ic" width="'+s+'" height="'+s+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+P2[k]+'</svg>'};
var esc=function(s){return String(s).replace(/[&<>]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;'}[c]})};
var fmt=function(q){var v=Math.round(q*100)/100;return String(v).replace(/\.0+$/,'')};
var mins=function(m){return m>=120?(m/60)+' h':m+' min'};
var pf=function(c,cls,extra){return '<span class="pf in '+(cls||'')+'" style="--pc:'+c+'" '+(extra||'')+'></span>'};

/* ---- derived state, decided by the "server" (all of this is known at render time) ---- */
var hasNotes=soc.notes.length>0, hasCooks=soc.cooks.length>0;
var nIn=rec.ing.filter(function(i){return !i.miss}).length, nMiss=rec.ing.filter(function(i){return i.miss}).length;
var groups=rec.ing.some(function(i){return i.g});
var roomy=rec.ing.length<=5&&rec.steps.length<=3;                       /* short recipe: roomy mode */
var photoCount=(rec.hasBanner?1:0)+rec.gallery.length+rec.cookedPh.length;
var railNone=!hasNotes&&!hasCooks&&EMPTY!=='keep';                      /* right rail collapses */
var fresh=VS==='trying'?{cls:'trying',txt:'Trying since 28 Sep · cooked 1×',btn:'Keep it'}:VS==='away'?{cls:'away',txt:'This version is put away',btn:'Bring back'}:null;

/* ---- pieces ---- */
function head(){
 var cnt=function(k,v){return '<i class="'+k+'">'+ic(k==='u'?'up':k==='d'?'dn':'note',14)+v+'</i>'};
 var nr=soc.react;
 return '<header class="top" role="banner">'
 +'<a class="back" href="#" data-back aria-label="Back to Recipes" title="Back to Recipes">'+ic('back')+'<span>Recipes</span></a>'
 +'<div class="ttlw"><h1 data-vt="title" title="'+esc(rec.name)+'">'+esc(rec.name)+'</h1></div>'
 +'<span class="mc ro" title="Total time">'+ic('clock',16)+mins(rec.min)+'</span>'
 +'<button class="rb-notesbtn re-a" data-notes aria-label="Notes and reactions: '+soc.notes.length+' notes, '+nr.likedBy+' thumbs up, '+nr.notKeen+' not for me" title="Notes and reactions (N)">'+ic('note')+'<span class="nl">Notes and reactions</span><span class="rb-pillcnt">'+cnt('n',soc.notes.length)+cnt('u',nr.likedBy)+(nr.notKeen?cnt('d',nr.notKeen):'')+'</span></button>'
 +'<button class="ib bare" data-star aria-pressed="'+(soc.react.mine==='up')+'" aria-label="Liked by me" title="I like this version">'+ic('star')+'</button>'
 +'<a class="ib bare" data-key="e" href="#" aria-label="Edit (E)" title="Edit (E)">'+ic('edit')+'</a>'
 +'<button class="shr-chip'+(soc.shared?' on':'')+'" data-share>'+ic('share',18)+'<span>Share</span>'+(soc.shared?'<b class="shr-n">'+soc.shared+'</b>':'')+'<span class="kbd">S</span></button>'
 +'<button class="ib bare" data-more aria-label="More" title="More">'+ic('more')+'</button>'
 +'<span class="sep"></span>'
 +'<button class="btn ghost sm" data-plan>'+ic('cal',18)+(planned?'Planned Tue':'Plan it')+'</button>'
 +'<a class="btn sm" data-cook href="#">'+ic('cook',18)+'Cook it</a>'
 +'</header>'
 +(fresh?'<div class="band '+fresh.cls+'"><span>'+fresh.txt+'</span><button class="mini" data-keep>'+fresh.btn+'</button></div>':'');
}

function ingredients(){
 var cur=null,rows='';
 rec.ing.forEach(function(i){
  if(groups&&i.g!==cur){cur=i.g;var c=rec.ing.filter(function(x){return x.g===cur}).length;rows+='<div class="grp" role="heading" aria-level="3">'+esc(cur)+'<small>'+c+'</small></div>'}
  var amt=i.unk?'<span class="q unk">amount?</span>':'<span class="q" data-a="'+i.q+'">'+(i.q==null?'':fmt(i.q*n/rec.serves))+(i.u?' '+i.u:'')+'</span>';
  var dot=!STOCK?'':i.miss?'<span class="dot no" title="Missing"></span>':'<span class="dot" title="In stock"></span>';
  rows+='<div class="ing'+(i.miss?' miss':'')+'">'+dot+'<span class="nm">'+esc(i.n)+(i.opt?' <em>(optional)</em>':'')+'</span>'+(i.miss&&STOCK?'<button class="mini ico cart" data-cart aria-label="Add '+esc(i.n)+' to shopping">'+ic('cart',18)+'</button>':'')+amt+'</div>';
 });
 var tag=!STOCK?'':nMiss?'<span class="tg miss">'+nIn+' of '+rec.ing.length+' in</span>':'<span class="tg">all in</span>';
 return '<section class="rd-z rd-l" id="ing" aria-labelledby="ingh">'
 +'<div class="zh"><h2 class="lbl" id="ingh">Ingredients</h2>'+tag+'<a class="mini ico" href="#" aria-label="Edit ingredients" title="Edit ingredients">'+ic('edit',18)+'</a></div>'
 +'<div class="zs"><div class="serves" role="group" aria-label="Serves"><button type="button" data-n="-1" aria-label="Fewer servings">−</button><span data-sv>Serves '+n+'</span><button type="button" data-n="1" aria-label="More servings">+</button></div></div>'
 +'<div class="zb" id="ingb">'+rows+'</div>'
 +(nMiss>1&&STOCK?'<div class="zf"><button class="pmore" data-cartall>'+ic('cart',18)+'Add all '+nMiss+' missing to shopping</button><p class="hint">Talk to your assistant about substitutes</p></div>':'')
 +(railNone&&rec.source?'<p class="src lsrc">Source: '+esc(rec.source)+'</p>':'')
 +(roomy&&rec.hasBanner?'<div class="rd-banner">'+pf(rec.banner,'hb')+'</div>':'')
 +'</section>';
}

function method(){
 var cur=null,rows='',tot=0;
 rec.steps.forEach(function(s,k){
  tot+=s.m||0;
  if(groups&&s.g&&s.g!==cur){cur=s.g;rows+='<div class="grp" role="heading" aria-level="3">'+esc(cur)+'</div>'}
  var ph=s.ph?'<button class="psp" data-psp aria-label="Show the photo for step '+(k+1)+'">'+pf(s.ph,'',s.fy?'style="--pc:'+s.ph+'"':'')+'</button>'
        :s.prep?'<span class="psp prep" role="status">'+pf('var(--surface)','prep')+'<span class="pprep">Photo is being prepared</span></span>':'';
  rows+='<div class="stp"><span class="nb">'+(k+1)+'</span><div class="tx"><p>'+esc(s.t)+'</p>'+(s.m?'<span class="timer">'+ic('clock',14)+mins(s.m)+'</span>':'')+'</div>'+ph+'</div>';
 });
 return '<section class="rd-c" id="met" aria-labelledby="meth">'
 +'<div class="zh"><h2 class="lbl" id="meth">Method</h2><span class="cnt">'+rec.steps.length+' steps'+(tot?' · '+mins(tot)+' of timers':'')+'</span><a class="mini ico" href="#" aria-label="Edit method" title="Edit method">'+ic('edit',18)+'</a></div>'
 +'<div class="zb" id="metb">'+rows+'</div>'
 +(railNone?emptyBar():'')
 +'</section>';
}

function noteCard(x){
 var body=x.t.map(function(t){return '<p>'+t+'</p>'}).join('')+(x.li?'<ul>'+x.li.map(function(l){return '<li>'+l+'</li>'}).join('')+'</ul>':'');
 return '<div class="note'+(x.inh?' inh':'')+'">'+body+'<small>'+x.by+' · '+x.at+(x.inh?' <span class="from">'+ic('branch',12)+'from '+x.w+'</span>':x.re?' <span class="from">changed in this version</span>':'')+'</small></div>';
}
function thumb(k){return k==='up'?'<span class="rb-th up" title="Kept it">'+ic('up',15)+'</span>':k==='dn'?'<span class="rb-th dn" title="Not for us">'+ic('dn',15)+'</span>':k==='work'?'<span class="rb-th wk" title="Needed work">!</span>':'<span class="rb-th no" title="No verdict"></span>'}

function notesBlock(){
 var h='<div class="zh"><h2 class="lbl">Notes</h2><span class="cnt">'+soc.notes.length+'</span><button class="mini" data-note>'+ic('plus',14)+'Add a note</button></div>';
 if(!hasNotes)return '<div class="rd-nb empty">'+h.replace(/<span class="cnt">0<\/span>/,'')+'<div class="zs"><p class="none">No notes yet. Anything you learn goes here.</p></div></div>';
 return '<div class="rd-nb" id="not">'+h+'<div class="zb" id="notb">'+soc.notes.map(noteCard).join('')+'</div></div>';
}
function cookedBlock(){
 var c=soc.cooks, r=soc.react;
 if(!hasCooks)return '<div class="rd-cb empty"><div class="zh"><h2 class="lbl">Cooked</h2></div><div class="zs"><p class="none">Not cooked yet. Cook it once and the thumbs and notes start here.</p></div></div>';
 var dots=c.slice(0,8).reverse().map(function(x,i,a){return '<i class="rb-dot'+(i===a.length-1?' last':'')+'"></i>'}).join('');
 var chips=r.chips.map(function(x){return '<span class="rb-rc"><span class="rb-av m'+x.m+'">'+x.who[0]+'</span><span class="rb-th up">'+ic('up',12)+'</span></span>'}).join('')+(r.notKeen?'<span class="rb-rc oth"><span class="rb-th dn">'+ic('dn',12)+'</span>'+r.notKeen+' other</span>':'');
 var rows=c.slice(0,3).map(function(x){return '<div class="hist"><span class="d">'+(x.d?x.d+' '+x.m:x.m)+'</span><span class="t"><b>'+x.by+'</b> · '+esc(x.v)+(x.line?'<small>“'+esc(x.line)+'”</small>':'')+'</span>'+(x.ate?'<small class="ate">'+x.ate+' ate</small>':'')+thumb(x.verdict==='keep'?'up':x.verdict==='work'?'work':x.verdict==='no'?'dn':null)+'</div>'}).join('');
 var more=c.length>3?'<button class="rd-lnk" data-allcooks>'+(c.length-3)+' earlier</button>':'';
 return '<div class="rd-cb" id="his"><div class="zh"><h2 class="lbl">Cooked</h2><span class="cnt">'+c.length+'×'+(c[0].ago?' · last '+c[0].ago:'')+'</span><span class="rb-dots" aria-label="'+c.length+' cooks, oldest to newest">'+dots+'</span></div>'
  +'<div class="zs react">'+(r.fav?'<span class="tg acc">household favourite</span>':'')+'<div class="rb-react">'+chips+'</div></div>'+'<div class="zs">'+rows+more+'</div></div>';
}
function photosBlock(){
 var t=[];
 if(rec.hasBanner&&!roomy)t.push({c:rec.banner,b:'Banner'});
 rec.gallery.forEach(function(c){t.push({c:c})}); rec.cookedPh.forEach(function(c){t.push({c:c,k:1})});
 if(!t.length)return '';
 var show=t.slice(0,4).map(function(x){return '<button class="pt" data-photo aria-label="Open photo">'+pf(x.c)+(x.b?'<em>'+x.b+'</em>':'')+'</button>'}).join('');
 var extra=t.length>4?'<button class="pt more" data-photos>+'+(t.length-4)+'</button>':'';
 return '<div class="rd-pb" id="pho"><div class="zh"><h2 class="lbl">Photos</h2><span class="cnt">'+t.length+'</span><button class="mini" data-photos>Show all</button></div><div class="zs ph">'+show+extra+'</div></div>';
}
function historyBlock(){
 var vs=rec.versions.map(function(v){
  return '<button class="vb'+(v.id===rec.cur?' on':'')+'" data-ver>'+(v.usual?'<span class="us" title="Our usual">\u2605</span>':'')+esc(v.name)+(v.review&&v.id===rec.cur?'<span class="rv" title="Has a change to review"></span>':'')+'</button>';
 }).join('');
 var rv=rec.versions.some(function(v){return v.review});
 return '<div class="rd-hb" id="hist"><div class="zh"><h2 class="lbl">History</h2>'+(rec.versions.length>1?'<span class="cnt">'+rec.versions.length+' versions</span>':'')+(rv?'<a class="tg acc" href="#">To review \u00b7 2</a>':'')+'<a class="rd-lnk" href="#" data-key=",">Open <span class="kbd">,</span></a></div>'
  +(rec.versions.length>1?'<div class="zs vs" role="group" aria-label="Versions">'+vs+'</div>':'')
  +'<div class="zs"><p class="src">'+(rec.versions.length>1?'From Original':'One version')+(rec.source?' \u00b7 Source: '+esc(rec.source):'')+'</p></div></div>';
}
function right(){
 return '<aside class="rd-z rd-r" id="right" aria-label="Your history with this recipe">'
 +'<button class="x" data-close aria-label="Close" title="Close (Ctrl+Enter)">'+ic('x',18)+'</button>'
 +notesBlock()+cookedBlock()+photosBlock()+historyBlock()
 +'<div class="rd-pgrid" hidden><div class="zh"><h2 class="lbl">Photos</h2><button class="mini" data-photos-close>Back</button></div><div class="pgrid">'
 +[rec.banner].concat(rec.gallery,rec.cookedPh,['#cdb48e','#bda47c']).slice(0,9).map(function(c){return '<button class="pt">'+pf(c)+'</button>'}).join('')+'</div></div>'
 +'</aside>';
}
function emptyBar(){
 var vs=rec.versions.length>1?'<span class="cnt">'+rec.versions.length+' versions</span>':'';
 return '<div class="rd-foot" id="hist">'
  +'<span class="it"><b>Not cooked yet.</b> Cook it once and the thumbs and notes start here.</span>'
  +'<button class="mini" data-note>'+ic('plus',14)+'Add a note</button>'
  +(photoCount>1?'<button class="mini" data-photos>'+ic('cam',16)+'Photos '+photoCount+'</button>':'')
  +'<a class="mini" href="#" data-key=",">'+ic('hist',16)+'History '+vs+' <span class="kbd">,</span></a>'
  +'</div>';
}
function rail(){
 var nv=function(on,d,t){return '<span class="rb-nv'+(on?' on':'')+'"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="'+d+'"/></svg>'+t+'</span>'};
 return '<nav class="rb-rail" aria-label="Main"><div class="rb-brand">Our<br>kitchen</div>'
 +nv(0,'M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z','Home')+nv(0,'M5 8h14v12H5zM8 8V5h8v3','Pantry')+nv(1,'M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z','Recipes')+nv(0,'M4 5h2l2 10h9l2-7H7','Shopping')
 +'<div class="mockctl"><button class="mc-b" data-mc aria-expanded="false" aria-label="Mockup controls" title="Mockup controls">⚙</button></div></nav>';
}
function controls(){
 var o=function(k,l){return '<a href="?r='+k+'&'+rest('r')+'" class="'+(R===k?'on':'')+'">'+l+'</a>'};
 return '<div class="mcpop" id="mcpop" hidden><h3>Mockup controls</h3>'
 +'<div class="g"><span>Recipe state</span>'+[['short','short'],['typical','typical'],['long','long'],['notes','notes'],['cooked','cooked'],['nocooked','not cooked']].map(function(a){return o(a[0],a[1])}).join('')+'</div>'
 +'<div class="g"><span>Theme</span><button data-theme-pick="kitchie">dark</button><button data-theme-pick="kitchie-day">light</button></div>'
 +'<div class="g"><span>Version</span>'+['kept','trying','away'].map(function(v){return '<a href="?'+rest('v')+'&v='+v+'" class="'+(VS===v?'on':'')+'">'+v+'</a>'}).join('')+'</div>'
 +'<div class="g"><span>Empty rail</span>'+['collapse','keep'].map(function(v){return '<a href="?'+rest('empty')+'&empty='+v+'" class="'+(EMPTY===v?'on':'')+'">'+v+'</a>'}).join('')+'</div>'
 +'</div>';
}
function rest(skip){var o=[];P.forEach(function(v,k){if(k!==skip&&k!=='t')o.push(k+'='+encodeURIComponent(v))});if(P.get('r')==null&&skip!=='r')o.push('r='+R);return o.join('&')}

/* ---- draw ---- */
var app=$('#app');
app.innerHTML=rail()+'<div class="rtab rd" id="rtab" data-screen="recipe" data-right="'+(railNone?'none':'on')+'" data-fit="'+(roomy?'roomy':'std')+'">'+head()
 +'<main class="rd-zones">'+ingredients()+method()+(railNone?'':right())+'</main></div>'+controls();
document.title='Recipe detail, desktop: option B, three zones';

/* ---- behaviour (mockup only; nothing here fetches) ---- */
var rd=$('#rtab');
document.addEventListener('click',function(e){
 var t=e.target;
 var nb=t.closest('[data-n]'); if(nb){var d=+nb.dataset.n;var step=1;n=Math.max(1,Math.min(12,n+d*step));$('[data-sv]').textContent='Serves '+n;$$('.ing .q[data-a]').forEach(function(q){var i=rec.ing.filter(function(x){return String(x.q)===q.dataset.a})[0];if(!i)return;q.textContent=fmt(i.q*n/rec.serves)+(i.u?' '+i.u:'')});return}
 if(t.closest('[data-psp]')){var s=t.closest('.stp');s.classList.toggle('open');fit();return}
 if(t.closest('[data-notes]')){if(railNone){note();return}var open=rd.dataset.open==='right';rd.dataset.open=open?'':'right';pulse();return}
 if(t.closest('[data-close]')){rd.dataset.open='';return}
 if(t.closest('[data-note]')){note();return}
 if(t.closest('[data-photos]')){var g=$('.rd-pgrid');if(g){g.hidden=false;rd.classList.add('pg')}return}
 if(t.closest('[data-photos-close]')){$('.rd-pgrid').hidden=true;rd.classList.remove('pg');return}
 if(t.closest('[data-star]')){var b=t.closest('[data-star]');b.setAttribute('aria-pressed',b.getAttribute('aria-pressed')!=='true');return}
 if(t.closest('[data-plan]')){var pb=t.closest('[data-plan]');pb.lastChild.textContent='Planned Tue';return}
 if(t.closest('[data-mc]')){var p=$('#mcpop');p.hidden=!p.hidden;return}
 if(t.closest('[data-cart]')){var c=t.closest('.ing');c.classList.remove('miss');var dd=$('.dot',c);if(dd)dd.classList.remove('no');t.closest('[data-cart]').remove();return}
 if(t.closest('a[href="#"]'))e.preventDefault();
});
function note(){var nb=$('#notb')||$('.rd-nb');if(!nb)return;var el=document.createElement('div');el.className='note new';el.innerHTML='<p>(Add a note sheet opens here: same bottom sheet as today, 4,000 characters, this version or every version.)</p><small>You · now</small>';if($('#notb')){$('#notb').prepend(el);$('#notb').scrollTop=0}else if($('.rd-foot')){$('.rd-foot').insertAdjacentElement('beforebegin',el)}fit()}
function pulse(){var r=$('#right');r.classList.add('pulse');setTimeout(function(){r.classList.remove('pulse')},700)}
document.addEventListener('keydown',function(e){
 if(/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)||e.ctrlKey||e.metaKey||e.altKey)return;
 if(e.key==='n'||e.key==='N'){var b=$('[data-notes]');b&&b.click()}
 if(e.key==='Escape'){var g=$('.rd-pgrid');if(g&&!g.hidden){g.hidden=true;rd.classList.remove('pg')}else $$('.stp.open').forEach(function(s){s.classList.remove('open')});fit()}
});
/* scroll cue: a fade shows at the foot / head of any inner column that has more to see */
function cue(el){var s=el.scrollHeight>el.clientHeight+2;el.dataset.more=!s?'':el.scrollTop<4?'down':el.scrollTop+el.clientHeight>=el.scrollHeight-4?'up':'both'}
function fit(){$$('.zb').forEach(cue)}
$$('.zb').forEach(function(z){z.addEventListener('scroll',function(){cue(z)},{passive:true})});
addEventListener('resize',fit);fit();setTimeout(fit,120);
/* measured by tools (screenshots/measure.py) */
window.RDinfo=function(){var o={};['#ingb','#metb','#notb','#right'].forEach(function(s){var e=$(s);if(e)o[s]=e.scrollHeight-e.clientHeight});o.page=document.documentElement.scrollHeight-innerHeight;o.hx=document.documentElement.scrollWidth-innerWidth;return o};
})();
