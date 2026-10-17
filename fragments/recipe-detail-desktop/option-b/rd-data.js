/* Sample data for the mockup only (shapes follow kitchie recipe-tab/types.ts; values are the invented samples in ../notes.md section 3.4).
   Plain names that exist only for the mockup stay here, never in rd.css. */
(function(){
var I=function(n,q,u,o){o=o||{};o.n=n;o.q=q;o.u=u||'';return o};
var S=function(t,m,o){o=o||{};o.t=t;o.m=m||null;return o};

var eggs={ /* B. Typical: 10 ingredients, 6 steps (Egg fried rice) */
  name:'Egg fried rice',min:20,serves:2,banner:'#ba976b',
  ing:[I('Eggs',3),I('Basmati rice, cooked and cooled',300,'g'),I('Onion',1),I('Spring onions',2,'',{miss:1}),I('Soy sauce',2,'tbsp'),I('Oil',1,'tbsp'),I('Frozen peas',80,'g'),I('Garlic cloves',2),I('Sesame oil',1,'tsp',{opt:1,miss:1}),I('Chilli flakes',null,'',{unk:1})],
  steps:[S('Beat the eggs with a pinch of salt.',0,{ph:'#bfa98c'}),S('Chop the onion and fry it in the oil until soft.',3,{ph:'#d8c8c8'}),S('Push the onion aside, pour in the eggs and stir until just set.',1,{prep:1}),S('Tip in the cold rice and break up any lumps. Keep the heat high.',4,{ph:'#a8b890'}),S('Splash in the soy sauce and add the peas.',2),S('Toss through the spring onions and serve.',0)],
  versions:[{id:'o',name:'Original'},{id:'p',name:'With peas',usual:1,review:2},{id:'l',name:'Less soy, more garlic'}],cur:'p',
  source:'Sam’s notebook, 2024',
  gallery:['#c9a46e','#b98f5a'],cookedPh:['#d1b07a','#a9c08d'],
  hasBanner:1
};
var toast={ /* A. Short: 2 ingredients, 2 steps */
  name:'Garlic toast eggs',min:10,serves:2,banner:'#c8a86b',
  ing:[I('Eggs',4),I('Sourdough',4,'slices')],
  steps:[S('Toast the bread and rub it with a cut garlic clove.',3,{ph:'#bfa98c'}),S('Fry the eggs in butter until the whites are set; lay on the toast.',4,{ph:'#d8c8c8',fy:.4})],
  versions:[{id:'o',name:'Original',usual:1}],cur:'o',source:'',gallery:[],cookedPh:[],hasBanner:1
};
var lamb={ /* E. Long: 24 ingredients in 3 groups, 14 steps */
  name:'Slow lamb shoulder with white beans and salsa verde',min:270,serves:8,banner:'#8a6a4a',
  ing:[
   I('Lamb shoulder, bone in',2.2,'kg',{g:'Lamb'}),I('Garlic cloves',8,'',{g:'Lamb'}),I('Rosemary sprigs',4,'',{g:'Lamb'}),I('Anchovy fillets',6,'',{g:'Lamb',opt:1}),I('Olive oil',3,'tbsp',{g:'Lamb'}),I('Salt',2,'tsp',{g:'Lamb'}),I('Black pepper',1,'tsp',{g:'Lamb'}),I('White wine',250,'ml',{g:'Lamb',miss:1}),
   I('Cannellini beans',3,'tins',{g:'Beans',miss:1}),I('Onion, finely sliced',2,'',{g:'Beans'}),I('Celery sticks',2,'',{g:'Beans',miss:1}),I('Carrot',2,'',{g:'Beans'}),I('Tomato paste',2,'tbsp',{g:'Beans'}),I('Chicken stock',500,'ml',{g:'Beans'}),I('Bay leaves',2,'',{g:'Beans'}),I('Lemon, zest of',1,'',{g:'Beans'}),I('Chilli flakes',null,'',{g:'Beans',unk:1}),
   I('Flat-leaf parsley, large bunch',1,'',{g:'Salsa verde',miss:1}),I('Mint leaves',20,'g',{g:'Salsa verde',miss:1}),I('Capers',2,'tbsp',{g:'Salsa verde'}),I('Garlic clove',1,'',{g:'Salsa verde'}),I('Red wine vinegar',2,'tbsp',{g:'Salsa verde'}),I('Olive oil',120,'ml',{g:'Salsa verde'}),I('Sea salt',1,'pinch',{g:'Salsa verde'})],
  steps:[S('Heat the oven to 160C.',5,{g:'Lamb'}),S('Pound the garlic, rosemary and anchovies to a rough paste with the oil.',0,{g:'Lamb'}),S('Score the lamb and rub the paste in; season well.',0,{g:'Lamb'}),S('Brown the lamb on all sides in a heavy pot.',15,{g:'Lamb',ph:'#9a7a58'}),S('Deglaze with the wine and let it bubble down by half.',5,{g:'Lamb'}),S('Cover tightly and roast.',180,{g:'Lamb'}),
   S('Meanwhile soften onion, celery and carrot in a pan.',12,{g:'Beans'}),S('Add paste, stock, bay and beans; simmer.',20,{g:'Beans'}),S('Lift the lamb out, rest it under foil.',20,{g:'Beans',ph:'#b08a66'}),S('Tip the beans into the pot and return to the oven, lid off.',30,{g:'Beans'}),
   S('Chop herbs, capers and garlic together.',8,{g:'Salsa verde'}),S('Stir in vinegar and oil; season with the salt.',0,{g:'Salsa verde'}),S('Pull the lamb into large pieces over the beans.',5,{ph:'#a58560'}),S('Spoon salsa verde over and serve with lemon wedges.',0)],
  versions:[{id:'o',name:'Original',usual:1}],cur:'o',source:'Adapted from a Saturday Kitchen episode',gallery:['#8f6f50'],cookedPh:['#9c7c5a'],hasBanner:1,share:1
};

/* Notes (C) and cooks (D) */
var N5=[
 {w:'Original',by:'Sam',at:'12 Sep',inh:1,t:['Day-old rice really is better. Fresh rice goes mushy.']},
 {w:'With peas',by:'Jane',at:'20 Sep',t:['Kids like it with <b>frozen peas</b> thrown in at step 5.']},
 {w:'With peas',by:'Alex',at:'28 Sep',re:1,t:['Peas straight from frozen is fine, no need to thaw.']},
 {w:'Original',by:'Priya',at:'2 Oct',inh:1,t:['Things that go well on the side:'],li:['Cucumber in rice vinegar','A soft-boiled egg on top','Kimchi']},
 {w:'With peas',by:'You',at:'14 Oct',t:['Doubled for 4 people in the big pan and had to fry the rice in two batches. Do not crowd the pan.']}
];
var COOKS4=[
 {d:'9',m:'Oct',by:'Jane',v:'With peas',line:'used leftover rice',verdict:null,ate:3,ago:'2 days ago'},
 {d:'28',m:'Sep',by:'Sam',v:'Less soy, more garlic',line:'',verdict:'keep',ate:3},
 {d:'20',m:'Sep',by:'You',v:'Original',line:'too salty first time, halved the soy',verdict:'work',ate:2},
 {d:'',m:'Earlier',by:'Sam',v:'Original',line:'',verdict:null,ate:0}
];
var REACT={mine:'up',likedBy:2,of:3,fav:1,chips:[{who:'Jane',m:1,k:'up'},{who:'Sam',m:2,k:'up'},{who:'You',m:3,k:'up'}],notKeen:1};

window.RD={
  recipes:{short:toast,typical:eggs,long:lamb,notes:eggs,cooked:eggs,nocooked:eggs},
  /* social state per ?r= (the long recipe: 2 notes (one inherited), 2 cooks) */
  social:{
    typical:{notes:[N5[1],N5[4]],cooks:COOKS4.slice(0,3),react:REACT,shared:2},
    notes:{notes:N5,cooks:COOKS4,react:REACT,shared:2},
    cooked:{notes:[],cooks:COOKS4,react:REACT,shared:2},
    nocooked:{notes:[],cooks:[],react:{mine:null,likedBy:0,of:0,chips:[],notKeen:0},shared:null},
    short:{notes:[],cooks:[],react:{mine:null,likedBy:0,of:0,chips:[],notKeen:0},shared:null},
    long:{notes:[{w:'Original',by:'Sam',at:'3 Oct',t:['Rest it a full 20 minutes. Worth the wait.']},{w:'Original',by:'Priya',at:'3 Oct',inh:1,t:['Salsa verde keeps two days in the fridge; make it ahead.']}],
          cooks:[{d:'4',m:'Oct',by:'Sam',v:'Original',line:'fell off the bone',verdict:'keep',ate:8},{d:'6',m:'Sep',by:'Priya',v:'Original',line:'',verdict:'keep',ate:7}],
          react:{mine:'up',likedBy:2,of:3,fav:0,chips:[{who:'Sam',m:2,k:'up'},{who:'Priya',m:1,k:'up'}],notKeen:0},shared:1}
  }
};
})();
