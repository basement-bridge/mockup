/* Sample data for the Recommended layout. Mockup-only: plain names for the sample live here, never in the stylesheets.
   Shapes follow kitchie recipe-tab/types.ts (RecipeDetail); names and numbers are invented (fragment notes.md section 3.4).
   Ingredient and step `group` are NOT on the page today (gap, notes.md section 3.2): drawn here, needs the wire change.
   Ingredient row: [name, amount|null, unit, flag("miss"), optional, unknownLabel, group]. Step row: [text, minutes|0, photo, group].
   Photo: "#rrggbb" colour block, "img:<file>" real sample thumb, "prep" = being prepared. */
(function(){
var IMG="../../../recipe-photos/img/";
var VERS=[{id:"o",name:"Original",st:"kept",parent:null},{id:"p",name:"With peas",st:"kept",usual:true,review:true,parent:"Original"},{id:"l",name:"Less soy, more garlic",st:"trying",parent:"With peas"}];
var NOTES=[
 {on:"Original",by:"Sam",at:"12 Sep",inh:true,b:["Day-old rice really is better. Fresh rice goes mushy."]},
 {on:"With peas",by:"Jane",at:"20 Sep",b:["Kids like it with **frozen peas** thrown in at step 5."]},
 {on:"With peas",by:"Alex",at:"28 Sep",reworded:true,b:["Peas straight from frozen is fine, no need to thaw."]},
 {on:"Original",by:"Priya",at:"2 Oct",inh:true,b:["Things that go well on the side:"],li:["Cucumber in rice vinegar","A soft-boiled egg on top","Kimchi"]},
 {on:"With peas",by:"You",at:"14 Oct",b:["Doubled for 4 people in the big pan and had to fry the rice in two batches. Do not crowd the pan."]}
];
var COOKS=[
 {d:"9",m:"Oct",by:"Jane",v:"With peas",line:"used leftover rice",ate:3,ago:"2 days ago"},
 {d:"28",m:"Sep",by:"Sam",v:"Less soy, more garlic",line:"",verdict:"Kept it",ate:3},
 {d:"20",m:"Sep",by:"You",v:"Original",line:"too salty first time, halved the soy",verdict:"Needed work",ate:2},
 {d:"",m:"Earlier",by:"Sam",v:"Original",line:""}
];
/* only people who actually rated are listed; quiet members (Priya) never appear. up = liked it, dn = not for me. */
var REACT={mine:"up",people:[["Jane","up","9 Oct"],["Sam","up","28 Sep"],["You","up","20 Sep"],["Alex","dn","1 Oct"]],household:5,fav:"Liked by 3 of 5, a household favourite."};
window.RECIPES={
 typical:{name:"Egg fried rice",min:"20 min",serves:2,banner:"img/banner-typical.webp",emoji:"\u{1F35A}",vers:VERS,ver:"p",planned:"Tue",pantryKnown:true,
  ing:[["Eggs",3,""],["Basmati rice, cooked and cooled",300,"g"],["Onion",1,""],["Spring onions",2,"","miss"],["Soy sauce",2,"tbsp"],["Oil",1,"tbsp"],["Frozen peas",80,"g"],["Garlic cloves",2,""],["Sesame oil",1,"tsp","miss","opt"],["Chilli flakes",null,"","","","amount?"]],
  steps:[["Beat the eggs with a pinch of salt.",0,"img:efr-s1"],["Chop the onion and fry it in the oil until soft.",3,"img:efr-s2"],["Push the onion aside, pour in the eggs and stir until just set.",1,"prep"],["Tip in the cold rice and break up any lumps. Keep the heat high.",4,"img:efr-s4"],["Splash in the soy sauce and add the peas.",2],["Toss through the spring onions and serve.",0]],
  notes:NOTES,cooks:COOKS,react:REACT,photosN:6,photos:['efr-1','efr-2','efr-3','efr-c1','efr-c2','efr-c3'],source:"Adapted from a recipe card, Sam, 2024",share:2},
 short:{name:"Garlic toast eggs",min:"10 min",serves:2,banner:"img/banner-short.webp",emoji:"\u{1F373}",vers:[{id:"o",name:"Original",st:"kept",usual:true,parent:null}],ver:"o",pantryKnown:true,
  ing:[["Eggs",4,""],["Sourdough",4,"slices"]],
  steps:[["Toast the bread and rub it with a cut garlic clove.",3,"img:efr-s1"],["Fry the eggs in butter until the whites are set; lay on the toast.",4,"img:efr-s2"]],
  notes:[],cooks:[],react:{mine:null,people:[],household:3},photosN:2,photos:['efr-1','efr-2'],source:"",share:null},
 long:{name:"Slow lamb shoulder with white beans and salsa verde",min:"4 h 30",serves:8,banner:"img/banner-long.webp",emoji:"\u{1F356}",vers:[{id:"o",name:"Original",st:"kept",usual:true,parent:null}],ver:"o",pantryKnown:true,groups:true,
  ing:[["Lamb shoulder, bone in",2.2,"kg",0,0,0,"Lamb"],["Garlic cloves",8,""],["Rosemary sprigs",4,""],["Anchovy fillets",6,"","","opt"],["Olive oil",3,"tbsp"],["Salt",2,"tsp"],["Black pepper",1,"tsp"],["White wine",250,"ml"],
   ["Cannellini beans",3,"tins","miss",0,0,"Beans"],["Onion, finely sliced",2,""],["Celery sticks",2,"","miss"],["Carrot",2,""],["Tomato paste",2,"tbsp"],["Chicken stock",500,"ml"],["Bay leaves",2,""],["Lemon, zest of",1,""],["Chilli flakes",null,"","","","amount?"],
   ["Flat-leaf parsley, large bunch",1,"","miss",0,0,"Salsa verde"],["Mint leaves",20,"g","miss"],["Capers",2,"tbsp"],["Garlic cloves",1,""],["Red wine vinegar",2,"tbsp","miss"],["Olive oil",120,"ml"],["Sea salt",1,"pinch"]],
  steps:[["Heat the oven to 160C.",5,0,"Lamb"],["Pound the garlic, rosemary and anchovies to a rough paste with the oil.",0],["Score the lamb and rub the paste in; season well.",0],["Brown the lamb on all sides in a heavy pot.",15,"#a98a66"],["Deglaze with the wine and let it bubble down by half.",5],["Cover tightly and roast.",180],
   ["Meanwhile soften onion, celery and carrot in a pan.",12,0,"Beans"],["Add paste, stock, bay and beans; simmer.",20],["Lift the lamb out, rest it under foil.",20,"#9a7c5a"],["Tip the beans into the pot and return to the oven, lid off.",30],
   ["Chop herbs, capers and garlic together.",8,0,"Salsa verde"],["Stir in vinegar and oil; season with the salt.",0],["Pull the lamb into large pieces over the beans.",5,"#b08f68",""],["Spoon salsa verde over and serve with lemon wedges.",0]],
  notes:[NOTES[0],{on:"Original",by:"You",at:"3 Oct",b:["Rest it a full 20 minutes or it shreds badly."]}],
  cooks:[{d:"11",m:"Oct",by:"Sam",v:"Original",line:"fell off the bone",verdict:"Kept it",ate:8,ago:"6 days ago"},{d:"6",m:"Sep",by:"You",v:"Original",line:"",verdict:"Kept it",ate:6}],
  react:{mine:"up",people:[["Sam","up","11 Oct"],["You","up","6 Sep"]],household:5,fav:"Liked by 2 of 5."},photosN:4,photos:['len-1','sha-1','rag-1','cur-1'],source:"Slow Sundays, a family recipe",share:1}
};
window.RECIPES.IMG=IMG;
})();
