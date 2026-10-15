/* Make it: one flow for chat and screen (Kitchie #781). Mockup only: nothing is saved or sent. Three flows, same story, side by side.
   The clock is simulated (minutes since 6:00 pm); the 45 minutes and the two slots are Kitchie's numbers (cooking-session.json, COOKING_SLOTS). */
(function () {
  "use strict";
  var MINUTES = 45, SLOTS = 2, T0 = 18 * 60;
  var esc = function (s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); };
  var ic = function (n) { return '<svg aria-hidden="true"><use href="#' + n + '"/></svg>'; };
  var fmt = function (m) { var t = T0 + m, h = Math.floor(t / 60) % 24, mm = t % 60; return (h % 12 || 12) + ":" + (mm < 10 ? "0" : "") + mm + (h < 12 ? " am" : " pm"); };

  var DISH = {
    rice: { k: "rice", t: "Egg fried rice", em: "\u{1F35A}", rid: "egg-fried-rice", meta: "20 min · Serves 2", slot: "Lunch", src: "From your saved recipes, as written.",
      ing: [["3", "Eggs"], ["300 g", "Basmati rice, cooked and cooled"], ["1", "Onion"], ["2", "Spring onions"], ["2 tbsp", "Soy sauce"], ["1 tbsp", "Oil"]],
      steps: [["Beat the eggs", "Beat the eggs with a pinch of salt.", "\u{1F95A}", null, ["Eggs"]], ["Soften the onion", "Chop the onion and fry it in the oil until soft.", "\u{1F9C5}", "3 min", ["Onion", "Oil"]],
        ["Scramble the eggs", "Push the onion aside, pour in the eggs and stir until just set.", "\u{1F373}", "1 min", ["Eggs"]], ["Add the rice", "Tip in the cold rice and break up any lumps. Keep the heat high.", "\u{1F35A}", "4 min", ["Basmati rice"]],
        ["Season and serve", "Splash in the soy sauce, toss in the spring onions and serve.", "\u{1F962}", null, ["Soy sauce", "Spring onions"]]] },
    noodles: { k: "noodles", t: "Garlic soy noodles", em: "\u{1F35C}", rid: null, meta: "", slot: "Dinner", src: "Made up in your chat. Not in your saved recipes.",
      ing: [["200 g", "Egg noodles"], ["3 cloves", "Garlic"], ["2 tbsp", "Soy sauce"], ["1 tbsp", "Sesame oil"], ["2", "Spring onions"]], steps: [] }
  };

  /* What each option does. sc: Make it on the screen starts a session. bc: the banner opens the cook page when a recipe id exists. de: Done on the cook page ends the session.
     dd: the same dish started twice joins the live one. chip: "Making now" shows on the recipe and the plan meal. */
  var OPTS = {
    1: { sc: true, bc: true, de: true, dd: true, chip: false, link: "Open the cook page", mk: "Starts Cooking now, then opens the steps.",
         tool: function (d) { return d.rid ? "The banner opens the recipe's cook page." : ""; } },
    2: { sc: false, bc: false, de: false, dd: false, chip: false, link: "Browse the recipe", mk: "Opens the steps. Starts nothing, as Cook now does today.",
         tool: function (d) { return d.rid ? "The person can open the saved recipe's steps from the screen." : ""; } },
    3: { sc: true, bc: true, de: true, dd: true, chip: true, link: "Open the cook page", mk: "Marks it as being made, then opens the steps.",
         tool: function (d) { return d.rid ? "Making is now on for this recipe and its plan entry. The banner opens the cook page." : "Making is now on for this dish."; } }
  };

  function Flow(n) { this.n = n; this.o = OPTS[n]; this.root = document.getElementById("flow" + n); this.reset(); }
  var P = Flow.prototype;

  P.reset = function () {
    this.s = { now: 0, page: "home", seq: 0, sess: [], ended: {}, chatIds: {}, cur: null, step: 0, front: 0, toast: "", expand: false, chat: [] };
    this.sys("New chat. Nothing is cooking.");
    this.render();
  };
  /* ---- the sessions (Kitchie's cooking.ts, as the mock needs it) ---- */
  P.live = function () { var s = this.s; return s.sess.filter(function (x) { return s.now - x.last < MINUTES; }); };
  P.forDish = function (k) { return this.live().filter(function (x) { return x.k === k; })[0]; };
  P.byId = function (id) { return this.s.sess.filter(function (x) { return x.id === id; })[0]; };
  P.prune = function () {
    var me = this, s = this.s;
    s.sess.slice().forEach(function (x) {
      if (s.now - x.last >= MINUTES) { s.sess.splice(s.sess.indexOf(x), 1); s.ended[x.id] = "clock"; me.sys("45 minutes passed. Kitchie cleared " + DISH[x.k].t + " by itself."); }
    });
  };
  P.end = function (x, by) { var s = this.s; s.sess.splice(s.sess.indexOf(x), 1); s.ended[x.id] = by; if (s.front >= this.live().length) s.front = 0; };
  P.begin = function (k, via) {
    var s = this.s; s.seq++;
    var x = { id: "s" + s.seq, k: k, via: via, last: s.now, start: s.now, ticks: {} }; s.sess.push(x); return x;
  };
  P.pos = function (x) { return this.live().indexOf(x) + 1; };
  P.dest = function (x) { return this.o.bc && DISH[x.k].rid ? "cook" : "cooking"; };
  /* ---- the chat ---- */
  P.say = function (r, h) { this.s.chat.push({ r: r, h: h }); };
  P.sys = function (h) { this.say("sys", esc(h)); };
  P.call = function (title, lines, ans, prop) {
    this.say("call", "<b>" + esc(title) + "</b><ul>" + lines.map(function (l) { return "<li>" + esc(l) + "</li>"; }).join("") + '</ul><div class="ans">Kitchie answers: <em>' + esc(ans) + "</em>" + (prop ? ' <span class="prop">Proposal</span> ' + esc(prop) : "") + "</div>");
  };
  P.chatStart = function (k) {
    var d = DISH[k], o = this.o, ex = this.forDish(k), s = this.s;
    this.say("user", esc(k === "rice" ? "Let's make my egg fried rice." : "I'm making garlic soy noodles, my own thing. Going now."));
    var lines = ["Dish: " + d.t, "Ingredients: all " + d.ing.length + ", each with its amount", d.rid ? "Saved recipe: yes, linked to your recipe in the vault" : "Saved recipe: no, made up in this chat, nothing linked", "Said by: the person"];
    var ans, prop = "", x;
    if (ex && ex.via === "chat") { lines.push("Same session as before"); x = ex; x.last = s.now; ans = "Kept: restarted for another 45 minutes (position " + this.pos(x) + ")."; }
    else if (ex && o.dd) { lines.push("New session asked for"); x = ex; x.last = s.now; ans = "Kept: this dish was already started on the screen, so this joined it (position " + this.pos(x) + ")."; prop = "Today a second call starts a second session. Joining the live one is a change to the service, not to the tool's shape."; }
    else {
      lines.push("New session"); x = this.begin(k, "chat"); s.chatIds[k] = x.id;
      var shown = this.pos(x) <= SLOTS;
      ans = shown ? "Now showing on the household's screen (position " + this.pos(x) + "). Clears in 45 minutes unless you call again with this session." : "Two dishes are already on the go, so yours won't show on the banner. It is kept, and shows once one of them finishes.";
      prop = o.tool(d);
    }
    s.chatIds[k] = x.id;
    this.call("Assistant uses Kitchie: start cooking", lines, ans, prop);
    this.say("ai", esc(d.t + " is on your screen now. " + (this.dest(x) === "cook" ? "Tap the banner for the steps." : "Tap the banner for the ingredients.")));
    this.render();
  };
  P.chatCheck = function (k) {
    var d = DISH[k], s = this.s, id = s.chatIds[k], x = this.byId(id), why = s.ended[id];
    this.say("ai", esc("Still going on your side? I'll let Kitchie know."));
    var ans;
    if (x && s.now - x.last < MINUTES) { x.last = s.now; ans = "Kept: restarted for another 45 minutes (position " + this.pos(x) + ")."; }
    else if (why === "person") ans = "The person dismissed this on screen a moment ago, so it stays closed. Do not declare it again unless they say they are cooking it.";
    else ans = "That session has already ended (" + (why === "ai" ? "you ended it" : "it cleared after 45 minutes") + "). Start a new one only if they are cooking it.";
    this.call("Assistant uses Kitchie: start cooking, same session", ["Dish: " + d.t, "Session: the one started earlier"], ans, "");
    this.render();
  };
  P.chatStop = function (k) {
    var d = DISH[k], s = this.s, id = s.chatIds[k], x = this.byId(id), live = x && s.now - x.last < MINUTES;
    this.say("user", esc(k === "rice" ? "That's the rice done." : "Noodles are done."));
    if (live) this.end(x, "ai");
    this.call("Assistant uses Kitchie: stop cooking", ["Session: the " + d.t + " one"], live ? "Ended. It is gone for everyone in the household. Nothing is used up from the pantry." : "Already ended, so nothing changed.", "");
    this.say("ai", esc("Lovely. Enjoy it."));
    this.render();
  };
  /* ---- the screen ---- */
  P.toast = function (t) { var me = this; this.s.toast = t; clearTimeout(this.tt); this.tt = setTimeout(function () { me.s.toast = ""; me.render(); }, 4200); };
  P.open = function (page, k, sid) { var s = this.s; s.prev = s.page; s.page = page; s.cur = k ? { k: k, sid: sid || null } : null; s.step = 0; s.expand = false; };
  P.makeIt = function (k) {
    var o = this.o, d = DISH[k], s = this.s, x = this.forDish(k);
    if (!o.sc) { if (!d.rid) return; this.open("cook", k, x ? x.id : null); this.toast("Opened the steps. No Cooking now session was started."); this.render(); return; }
    if (x) { x.last = s.now; this.toast("Already making it. Back to it."); }
    else { x = this.begin(k, "screen"); this.toast("Started. Cooking now shows on every screen in the household."); }
    this.open(d.rid ? "cook" : "cooking", k, x.id); this.render();
  };
  P.banner = function (x, chev) {
    var l = this.live();
    if (l.length > 1 && !chev) { this.s.front = (this.s.front + 1) % Math.min(l.length, SLOTS); this.render(); return; }
    this.open(this.dest(x), x.k, x.id); this.render();
  };
  P.dismiss = function (x, msg) { this.end(x, "person"); this.s.page = "home"; this.s.cur = null; this.toast(msg || "Dismissed. Cleared for everyone."); this.render(); };
  P.doneCook = function () {
    var s = this.s, o = this.o, c = s.cur, d = DISH[c.k], x = c.sid && this.byId(c.sid);
    var used = "Used: " + d.ing.length + " ingredients taken out of the pantry.";
    var live = x && s.now - x.last < MINUTES;
    if (o.de && live) { this.end(x, "person"); used += this.n === 3 ? " Lunch marked as made. Cooking now cleared." : " Cooking now cleared."; }
    else if (live) used += " The banner stays until you tap Done cooking or it clears.";
    s.page = "recipes"; s.cur = null; this.toast(used); this.render();
  };
  P.advance = function (dx) { var s = this.s, d = DISH[s.cur.k], x = s.cur.sid && this.byId(s.cur.sid); if (x && s.now - x.last < MINUTES && this.o.sc) x.last = s.now; s.step = Math.max(0, Math.min(d.steps.length, s.step + dx)); if (s.step === d.steps.length) { this.doneCook(); return; } this.render(); };
  P.clock = function (m) { this.s.now += m; this.prune(); if (this.s.page === "cooking" || this.s.page === "cook") { /* page may show an ended note */ } this.render(); };

  /* ---- drawing ---- */
  P.bannerHtml = function () {
    var l = this.live().slice(0, SLOTS); if (!l.length) return "";
    var n = l.length, x = l[this.s.front % n];
    var tag = "Cooking now" + (n > 1 ? " <span>" + (l.indexOf(x) + 1) + " of " + n + "</span>" : "");
    return '<div class="cookbn" role="region" aria-label="Cooking now"><div class="cookbn-c"><button class="cookbn-go" data-a="ban" data-id="' + x.id + '"><span class="cookbn-dot" aria-hidden="true"></span><span class="cookbn-t"><b>' + tag + '</b><span class="cookbn-n">' + esc(DISH[x.k].t) + '</span></span></button>' +
      '<button class="cookbn-x" data-a="dis" data-id="' + x.id + '" aria-label="Dismiss ' + esc(DISH[x.k].t) + '" title="Dismiss">' + ic("x") + '</button><button class="cookbn-open" data-a="chev" data-id="' + x.id + '" aria-label="Open ' + esc(DISH[x.k].t) + '">' + ic("ch") + "</button></div>" + (n > 1 ? '<div class="cookbn-back"></div>' : "") + "</div>";
  };
  P.mealCard = function (k) {
    var d = DISH[k], o = this.o, x = this.forDish(k), btn = "", chip = "";
    var label = x && o.sc ? "Back to it" : "Make it";
    if (!o.sc && !d.rid) btn = '<span class="why">No saved steps to open.</span>';
    else btn = '<button class="mk' + (x && o.sc ? " back" : "") + '" data-a="make" data-k="' + k + '">' + ic("fl") + label + "</button>";
    if (o.chip && x) chip = '<div><span class="chipm"><i></i>Making now</span></div>';
    return '<div class="meal"><span class="em">' + d.em + '</span><div class="tx"><h3>' + esc(d.t) + "</h3><p>" + d.slot + " · " + (d.rid ? "Saved recipe" : "Made up with your AI") + "</p>" + chip + "</div>" + btn + "</div>";
  };
  P.pageHtml = function () {
    var s = this.s, o = this.o;
    if (s.page === "home") return '<div class="fp-pg"><h2>Our kitchen</h2><p>Nothing needs you right now.</p><div class="stand">Home is a stand-in. Its Make it buttons are drawn in fragments/make-it. Today on the Plan:</div><div style="margin-top:10px"><div class="meal"><span class="em">' + DISH.rice.em + '</span><div class="tx"><h3>Lunch · Egg fried rice</h3></div></div><div class="meal"><span class="em">' + DISH.noodles.em + '</span><div class="tx"><h3>Dinner · Garlic soy noodles</h3></div></div></div></div>';
    if (s.page === "plan") return '<div class="fp-pg"><h2>Today, Thursday 15 Oct</h2>' + this.mealCard("rice") + this.mealCard("noodles") + '<div class="stand">The Plan page is a stand-in; its Make it button is drawn in fragments/make-it.</div></div>';
    if (s.page === "recipes") return this.recipeHtml();
    if (s.page === "cooking") return this.cookingHtml();
    return this.cookHtml();
  };
  P.recipeHtml = function () {
    var d = DISH.rice, ings = d.ing.map(function (i) { return '<div class="ig"><span class="dot"></span><span class="n">' + esc(i[1]) + ' <span class="q">' + esc(i[0]) + '</span></span><span class="tag2">In pantry</span></div>'; }).join("");
    var x = this.forDish("rice"), o = this.o, chip = o.chip && x ? '<div style="margin-top:8px"><span class="chipm"><i></i>Making now</span></div>' : "";
    return '<div class="hero">' + d.em + '</div><div class="pad"><h3 class="t">Egg fried rice</h3><div class="meta"><span class="mc">' + ic("cl") + '20 min</span><span class="mc">' + ic("us") + 'Serves 2</span><span class="mc hot">' + ic("ck") + 'You have 6 of 6</span></div>' + chip + '<div class="rsec"><div class="lb2">Ingredients</div>' + ings + "</div></div>";
  };
  P.recipeFoot = function () {
    var x = this.forDish("rice"), o = this.o;
    return '<div class="cb"><button class="go" data-a="make" data-k="rice">' + ic("fl") + (x && o.sc ? "Back to it" : "Make it") + "</button><small>" + esc(o.mk) + "</small></div>";
  };
  P.cookingHtml = function () {
    var s = this.s, c = s.cur, x = c && c.sid && this.byId(c.sid), d = c && DISH[c.k], o = this.o;
    if (!x || s.now - x.last >= MINUTES) return '<div class="fp-pg"><div class="cv-empty"><b>Nothing is cooking right now</b><p>' + (c && s.ended[c.sid] === "ai" ? "Your assistant ended this one." : c && s.ended[c.sid] === "clock" ? "It cleared after 45 minutes." : "Start one from the Plan or your chat.") + '</p><button class="pillb" data-a="tab" data-p="home">Back to Home</button></div></div>';
    var lis = d.ing.map(function (r, i) { return '<li><label class="ci"><input type="checkbox" data-a="tick" data-i="' + i + '"' + (x.ticks[i] ? " checked" : "") + '><span class="ck" aria-hidden="true"><svg class="tick" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5 9-10"/></svg></span><span class="cn"><span class="nm">' + esc(r[1]) + '</span></span><span class="amt">' + esc(r[0]) + "</span></label></li>"; }).join("");
    var sec = d.rid ? '<button class="sec2" type="button" data-a="tocook">' + o.link + '<span aria-hidden="true">&rsaquo;</span></button>' : "";
    return '<div class="fp-pg"><div class="cv" data-cooking-screen><div><span class="now"><i></i>Cooking now</span><h1>' + esc(d.t) + '</h1><p class="src">' + esc(d.src) + '</p></div><ul class="ing" aria-label="Ingredients">' + lis + "</ul>" + sec + '<div class="done"><button type="button" data-a="donecook">' + ic("ck") + "Done cooking</button></div></div></div>";
  };
  P.cookHtml = function () {
    var s = this.s, c = s.cur, d = DISH[c.k], x = c.sid && this.byId(c.sid), live = x && s.now - x.last < MINUTES, st = d.steps[s.step], me = this;
    var strip = "";
    if (c.sid && !live && this.o.sc) strip = '<div class="strip">This cook ended (' + (s.ended[c.sid] === "ai" ? "your assistant ended it" : s.ended[c.sid] === "clock" ? "it cleared after 45 minutes" : "you ended it") + "). You can still tap Done to record what you used.</div>";
    var ingRow = '<div style="padding:8px 14px 0"><button class="bn" data-a="ings">' + ic("ck") + "<div>Ingredients<small>" + (live ? "Tick them off on the Cooking now screen" : "6 of 6 in your pantry. Tap to see all") + "</small></div></button></div>";
    var inl = s.expand && !live ? '<div class="card2" style="margin-top:8px">' + d.ing.map(function (i) { return '<div class="ig"><span class="n">' + esc(i[1]) + ' <span class="q">' + esc(i[0]) + "</span></span></div>"; }).join("") + "</div>" : "";
    var card = '<div class="card2"><div class="lb2">Step ' + (s.step + 1) + " of " + d.steps.length + '</div><div class="big">' + st[2] + "</div><b style=\"font-size:19px\">" + esc(st[0]) + '</b><p style="margin-top:4px;color:var(--fg)">' + esc(st[1]) + "</p>" + (st[3] ? '<span class="tm">' + ic("cl") + st[3] + "</span>" : "") + '<div class="use">' + st[4].map(function (u) { return "<span>" + esc(u) + "</span>"; }).join("") + '</div><div class="dots">' + d.steps.map(function (_, j) { return "<i" + (j === s.step ? ' class="on"' : "") + "></i>"; }).join("") + "</div></div>";
    return '<div class="cp-top"><button class="bk" data-a="cback" aria-label="Back">' + ic("bk") + '</button><div><h3>' + esc(d.t) + "</h3><span>" + d.meta + "</span></div></div>" + strip + ingRow + inl + card;
  };
  P.footHtml = function () {
    var s = this.s;
    if (s.page === "recipes") return this.recipeFoot();
    if (s.page === "cook") { var d = DISH[s.cur.k], last = s.step === d.steps.length - 1; return '<div class="cb"><div class="two"><button class="alt" data-a="prev">' + ic("bk") + 'Back</button><button class="go" data-a="next">' + (last ? ic("ck") + "Done" : "Next" + ic("ch")) + "</button></div>" + (last ? "<small>Done takes the used items out of your pantry." + (this.o.de ? " It also ends Cooking now." : "") + "</small>" : "") + "</div>"; }
    return "";
  };
  P.hoodHtml = function () {
    var me = this, s = this.s, l = this.live(), o = this.o;
    var h = this.n === 3 ? "<h3>What Kitchie holds: the making state</h3>" : "<h3>What Kitchie holds: cooking sessions</h3>";
    if (!l.length) h += '<div class="none">' + (this.n === 3 ? "Nothing is being made." : "No session. The banner is empty.") + "</div>";
    else h += "<table><tr><th>Dish</th><th>Started from</th><th>" + (this.n === 3 ? "Set on" : "Recipe link") + "</th><th>Clears in</th></tr>" + l.map(function (x) {
      var d = DISH[x.k], left = MINUTES - (s.now - x.last);
      return "<tr><td>" + esc(d.t) + "</td><td>" + (x.via === "chat" ? "Your assistant" : "The screen") + "</td><td>" + (me.n === 3 ? (d.rid ? "recipe and plan entry" : "plan entry only") : d.rid ? "yes, by recipe id" : "none") + "</td><td>" + left + " min</td></tr>";
    }).join("") + "</table>";
    h += "<p>" + (this.n === 1 ? "One store method starts a session; the chat tool and the Make it button both call it." : this.n === 2 ? "Only the chat tool starts a session. The cook page and the sessions only meet through the recipe link." : "One making state, set by either path. The banner, the Cooking now screen and the cook page are views of it.") + "</p>";
    return h;
  };
  P.chatHtml = function () {
    return this.s.chat.map(function (m) { return '<div class="' + (m.r === "call" ? "call" : "msg " + m.r) + '">' + m.h + "</div>"; }).join("");
  };
  P.qrHtml = function () {
    var s = this.s, h = "", n = this.n, b = function (a, k, t, c) { return '<button class="pillb sm sg" data-n="' + n + '" data-a="' + a + '" data-k="' + k + '">' + t + "</button>"; };
    h += b("cstart", "rice", "Say: make egg fried rice") + b("cstart", "noodles", "Say: making garlic soy noodles");
    Object.keys(s.chatIds).forEach(function (k) { h += b("ccheck", k, "Assistant checks in: " + DISH[k].t) + b("cstop", k, "Say: " + DISH[k].t + " is done"); });
    return h;
  };
  P.render = function () {
    var r = this.root, s = this.s, me = this;
    this.prune();
    var banner = (s.page === "home" || s.page === "plan" || s.page === "recipes") ? this.bannerHtml() : "";
    var tabs = (s.page === "cook") ? "" : '<div class="fp-tabs" role="tablist" aria-label="Pages">' + [["home", "Home"], ["plan", "Plan"], ["recipes", "Recipes"]].map(function (t) { return '<button role="tab" data-a="tab" data-p="' + t[0] + '" aria-selected="' + (s.page === t[0]) + '">' + t[1] + "</button>"; }).join("") + "</div>";
    var scr = this.pageHtml(), old = r.querySelector(".fp-scr"), keep = old && this.lastPage === s.page ? old.scrollTop : 0;
    r.querySelector(".fp").innerHTML = '<div class="fp-bar"><span>' + fmt(s.now) + '</span><span>Kitchie</span></div>' + tabs + banner + '<div class="fp-scr">' + scr + "</div>" + this.footHtml() + (s.toast ? '<div class="fp-toast" role="status">' + esc(s.toast) + "</div>" : "");
    var nw = r.querySelector(".fp-scr"); if (nw) nw.scrollTop = keep; this.lastPage = s.page;
    r.querySelector(".chat").innerHTML = this.chatHtml();
    r.querySelector(".qr").innerHTML = this.qrHtml();
    r.querySelector(".hood").innerHTML = this.hoodHtml();
    r.querySelector(".clock").textContent = fmt(s.now);
    var ch = r.querySelector(".chat"); ch.scrollTop = ch.scrollHeight;
  };
  P.handle = function (e) {
    var t = e.target.closest("[data-a]"); if (!t) return;
    var a = t.dataset.a, s = this.s, x = t.dataset.id && this.byId(t.dataset.id);
    if (a === "tick") { var c = s.cur && this.byId(s.cur.sid); if (c) { c.ticks[t.dataset.i] = t.checked; if (this.o.sc) c.last = s.now; } this.hoodOnly(); return; }
    if (a === "tab") { s.page = t.dataset.p; s.cur = null; this.render(); }
    else if (a === "make") this.makeIt(t.dataset.k);
    else if (a === "ban") { if (x) this.banner(x, false); }
    else if (a === "chev") { if (x) this.banner(x, true); }
    else if (a === "dis") { if (x) this.dismiss(x); }
    else if (a === "tocook") { s.prev = "cooking"; s.page = "cook"; this.render(); }
    else if (a === "donecook") { var y = s.cur && this.byId(s.cur.sid); if (y) this.dismiss(y, "Done cooking. Cleared for everyone."); }
    else if (a === "cback") { var pv = s.prev || "home", sx = s.cur && s.cur.sid && this.byId(s.cur.sid); if (pv === "cooking" && sx) { s.page = "cooking"; } else { s.page = pv === "cooking" ? "home" : pv; s.cur = null; } this.render(); }
    else if (a === "ings") { var z = s.cur.sid && this.byId(s.cur.sid); if (z && s.now - z.last < MINUTES) { s.page = "cooking"; } else s.expand = !s.expand; this.render(); }
    else if (a === "next") this.advance(1);
    else if (a === "prev") this.advance(-1);
    else if (a === "cstart") this.chatStart(t.dataset.k);
    else if (a === "ccheck") this.chatCheck(t.dataset.k);
    else if (a === "cstop") this.chatStop(t.dataset.k);
    else if (a === "t10") this.clock(10);
    else if (a === "t45") this.clock(45);
    else if (a === "reset") this.reset();
      };
  P.hoodOnly = function () { this.root.querySelector(".hood").innerHTML = this.hoodHtml(); };

  var flows = [1, 2, 3].map(function (n) { var f = new Flow(n); f.root.addEventListener("click", function (e) { f.handle(e); }); f.root.addEventListener("change", function (e) { f.handle(e); }); return f; });
  window.__flow = flows;
  var all = document.getElementById("allbar");
  if (all) all.addEventListener("click", function (e) {
    var t = e.target.closest("[data-all]"); if (!t) return; var w = t.dataset.all;
    flows.forEach(function (f) {
      if (w === "crice") f.chatStart("rice"); else if (w === "cnood") f.chatStart("noodles");
      else if (w === "mrice") { f.s.page = "recipes"; f.makeIt("rice"); } else if (w === "mnood") { f.s.page = "plan"; f.makeIt("noodles"); }
      else if (w === "t10") f.clock(10); else if (w === "t45") f.clock(45); else if (w === "reset") f.reset();
    });
  });
})();
