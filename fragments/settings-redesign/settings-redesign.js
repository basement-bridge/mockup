/* Settings redesign options. Mockup only: no storage, no network beyond theme.js's own theme files and the deferred data.js (the ledger).
   Every frame draws from one small state object per option (st), so a control changes the sample rows next to it: the point of the original complaint is that
   a setting must visibly do something. The frame renderers return strings in the app's own class names (see settings-redesign.css). */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var CH = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>';
  var CHS = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>';
  var ITEMS = [
    { n: "beef mince", e: "🥩", amt: "500 g", spot: "Fridge · Shelf 2", by: "Use by Sun 25 Oct", sm: "goes off Sunday" },
    { n: "milk", e: "🥛", amt: "2 L", spot: "Fridge · Door", by: "Use by Sat 24 Oct", sm: "goes off tomorrow" },
    { n: "basmati rice", e: "🍚", amt: "1 kg", spot: "Pantry · Shelf 1", by: "", sm: "plenty" },
    { n: "basil", e: "🌿", amt: "1 bunch", spot: "Fridge · Drawer", by: "", sm: "plenty" }
  ];
  var OPTS = ["today", "A", "B", "C", "D"];
  var S = {};
  function fresh() { return { mode: "system", size: "normal", emoji: true, motion: false, spot: true, amount: true, useby: true, activity: true, compact: false, rowsMode: "standard", conn: 1, checks: true, more: false, screen: "pantry", q: "", samples: true, aa: false, dup: false, osz: "normal", toast: "" }; }
  OPTS.forEach(function (o) { S[o] = { st: fresh(), devs: [] }; });
  S.B.st.size = "normal";

  /* ---------- small builders ---------- */
  function sw(opt, dev, k, label, on, sub) {
    return '<label class="srow"><span>' + esc(label) + (sub ? "<small>" + esc(sub) + "</small>" : "") + '</span><input type="checkbox" role="switch" data-k="' + k + '"' + (on ? " checked" : "") + '><span class="swt" aria-hidden="true"></span></label>';
  }
  function seg(opt, dev, k, label, options, val, extra) {
    var nm = opt + dev + k;
    return '<div class="seg2 wide" role="radiogroup" aria-label="' + esc(label) + '" data-seg="' + k + '"' + (extra || "") + '>' + options.map(function (o) {
      return '<label><input type="radio" name="' + nm + '" data-k="' + k + '" value="' + o[0] + '"' + (o[0] === val ? " checked" : "") + '><span>' + esc(o[1]) + '</span></label>';
    }).join("") + '</div>';
  }
  function themeBlock(withLabel) {
    return '<fieldset class="tgroup" style="border:0;margin:0;padding:0;min-width:0">' + (withLabel === false ? "" : '<legend class="lbl" style="padding:0 0 8px">Theme</legend>') + '<div class="tgrid swatches" data-themes>' + (window.themeHtml ? window.themeHtml(null, true) : "") + '</div><p class="small" style="margin-top:8px" aria-live="polite"><span data-theme-name>' + esc(window.themeName ? window.themeName() : "") + '</span></p></fieldset>';
  }
  var MODE = [["system", "System"], ["light", "Light"], ["dark", "Dark"]];
  function modeRow(opt, dev, st) {
    return '<div class="srow plain" role="group"><span>Light or dark</span>' + seg(opt, dev, "mode", "Light or dark", MODE, st.mode) + '</div><p class="small" data-mode-say>' + esc(modeSay(st)) + '</p>';
  }
  function modeSay(st) { return st.mode === "system" ? "Following your phone (it is " + (matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark") + " now)." : "Always " + st.mode + ", whatever the phone says. Drawn for all ten looks in mockup#285; here it switches Kitchie Night and Day."; }
  function mtop(back, title, act) { return '<div class="mtop">' + (back ? '<button type="button" class="bk" data-a="nav:' + back[1] + '">&lsaquo; ' + esc(back[0]) + '</button>' : '<span style="width:64px"></span>') + '<h1 class="ttl">' + esc(title) + '</h1><span style="width:64px"></span></div>'; }
  function mi(label, o) { o = o || {}; return '<button type="button" class="mi' + (o.dup ? " dup" : "") + '" data-a="' + (o.a || "link:" + label) + '"><span>' + (o.icon || "") + esc(label) + (o.dup ? '<span class="dupt">also in Settings</span>' : "") + '</span><span style="display:inline-flex;align-items:center">' + (o.val ? '<span class="val">' + esc(o.val) + '</span>' : "") + (o.chip ? '<span class="chip">' + esc(o.chip) + '</span>' : "") + '<span class="chev">' + CH + '</span></span></button>'; }
  function who(name, sub) { return '<div style="display:flex;gap:12px;align-items:center"><span class="av" style="width:56px;height:56px;font-size:20px">A</span><div><b style="font-size:1.25em">' + esc(name) + '</b><p class="small" style="margin-top:2px">' + esc(sub) + '</p></div></div>'; }

  /* ---------- sample rows (what the setting is for) ---------- */
  function rowsHtml(st) {
    return '<ul class="rows">' + ITEMS.map(function (i) {
      var parts = []; if (st.amount) parts.push(i.amt); if (st.spot) parts.push(i.spot);
      return '<li data-row><a class="rowlink" href="#" tabindex="-1" aria-hidden="false"><div class="main"><div class="name">' + (st.emoji ? '<span class="emo" aria-hidden="true">' + i.e + '</span> ' : "") + esc(i.n) + '</div><div class="meta">' + esc(parts.join(" · ")) + '</div></div>' + (i.by ? '<span class="due">' + esc(i.by) + '</span>' : "") + '<span class="chev">' + CHS + '</span></a></li>';
    }).join("") + '</ul>';
  }
  function homeRows(st) {
    return ITEMS.slice(0, 3).map(function (i) { return '<div class="hrow"><span class="ic" aria-hidden="true">' + (st.emoji ? i.e : "·") + '</span><span class="nm">' + esc(i.n) + '</span><span class="sm">' + esc(i.sm) + '</span></div>'; }).join("");
  }
  function shopRows(st) {
    return ITEMS.slice(1, 4).map(function (i) { return '<div class="hrow"><span class="ic" aria-hidden="true">○</span><span class="nm">' + (st.emoji ? i.e + " " : "") + esc(i.n) + '</span><span class="sm">' + esc(i.amt) + '</span></div>'; }).join("");
  }
  function preview(opt, st, cap) {
    var scr = st.screen, tabs = [["pantry", "Pantry list"], ["home", "Home"], ["shop", "Shopping"]];
    return '<div class="prev" data-prev><div class="lbl"><span>Preview, not part of the app</span><span class="tabs" role="group" aria-label="Pretend screen">' + tabs.map(function (t) { return '<button type="button" data-a="tab:' + t[0] + '" aria-pressed="' + (scr === t[0]) + '">' + t[1] + '</button>'; }).join("") + '</span></div>' +
      '<div data-sample="' + scr + '">' + (scr === "pantry" ? rowsHtml(st) : scr === "home" ? homeRows(st) : shopRows(st)) + '</div>' + (cap ? '<p class="cap">' + cap + '</p>' : "") + '</div>';
  }
  var TODAYCAP = 'Same item, three screens. <b>Item name size changes the Pantry list only</b>; Home and Shopping do not use <code>li .name</code> (measured: 0 text nodes change).';

  /* ---------- the Looks card, per option ---------- */
  function todayLooks(opt, dev, st) {
    return '<p class="small">These stay on this device. Only your theme and the emoji setting also travel with you, so pages open in the right colours.</p>' +
      '<section class="card sgroup">' + themeBlock() +
      '<div class="srow plain" role="group"><span>Item name size</span>' + seg(opt, dev, "size", "Item name size", [["small", "Small"], ["normal", "Normal"], ["large", "Large"]], st.size) + '</div>' +
      sw(opt, dev, "emoji", "Show emoji", st.emoji) + sw(opt, dev, "motion", "Reduce motion", st.motion) + sw(opt, dev, "spot", "Show the spot", st.spot) + sw(opt, dev, "amount", "Show the amount", st.amount) + sw(opt, dev, "useby", "Show the use-by date", st.useby) + sw(opt, dev, "activity", "Show household activity", st.activity) + sw(opt, dev, "compact", "Compact rows", st.compact) +
      '<button type="button" class="btn ghost" data-a="reset">Reset to defaults</button></section>';
  }
  function aLooks(opt, dev, st) {
    var two = st.conn >= 2;
    return '<section class="card sgroup" data-essentials>' + themeBlock() + modeRow(opt, dev, st) + sw(opt, dev, "emoji", "Show emoji", st.emoji) + '</section>' +
      '<div class="note-os"><span aria-hidden="true">📱</span><span><b>Text size, motion and dark at night follow your phone.</b> Change them in your phone’s settings and every screen of Kitchie keeps up.</span></div>' +
      (two ? '<section class="card" data-assistant><span class="lbl">Default assistant</span><p class="small">You have two connected, so Kitchie asks once which one the Plan button opens.</p>' + seg(opt, dev, "assistant", "Default assistant", [["claude", "Claude"], ["chatgpt", "ChatGPT"]], "claude") + '</section>' : "");
  }
  function bLooks(opt, dev, st) {
    return '<section class="card sgroup" data-essentials>' + themeBlock() + modeRow(opt, dev, st) + sw(opt, dev, "emoji", "Show emoji", st.emoji) + '</section>' +
      '<button type="button" class="more" data-a="more" aria-expanded="' + st.more + '" aria-controls="' + opt + dev + 'more">' + CHS + ' More</button>' +
      (st.more ? '<section class="card" id="' + opt + dev + 'more" data-more><div class="srow plain" role="group"><span>Text size<small>Whole app. Match my phone is the default.</small></span>' + seg(opt, dev, "size", "Text size", [["normal", "Match my phone"], ["large", "Larger"]], st.size === "large" ? "large" : "normal") + '</div>' +
        '<div class="srow plain" role="group"><span>Rows<small>One choice instead of four switches.</small></span>' + seg(opt, dev, "rowsMode", "Rows", [["standard", "Standard"], ["compact", "Compact"], ["names", "Names only"]], st.rowsMode) + '</div>' +
        '<button type="button" class="btn ghost" data-a="reset">Reset looks</button></section>' : "");
  }
  function bBehaves(opt, dev, st) {
    return '<section class="card sgroup">' + sw(opt, dev, "checks", "Ask me to check amounts", st.checks, "Preferences, unchanged") + '</section>' +
      '<div class="menu card">' + mi("Quiet hours", { val: "22:00 to 06:00" }) + mi("Most suggestions per day", { val: "3" }) + '</div>' +
      '<section class="card sgroup">' + sw(opt, dev, "activity", "Bell when someone else changes something", st.activity) + '</section>' +
      '<button type="button" class="more" data-a="more" aria-expanded="' + st.more + '">' + CHS + ' More</button>' + (st.more ? '<div class="menu card">' + mi("Check rules by place") + mi("Switched-off checks", { chip: "2" }) + '</div>' : "") +
      '<p class="small">These are the owner-designed Preferences stock-check dials. Nothing about them changes here; they only gain one front door.</p>';
  }
  function bHousehold(opt, dev, st) {
    return '<div class="menu card">' + mi("Household name", { val: "Henderson kitchen" }) + mi("Members and admins", { chip: "3" }) + mi("Categories", { val: "12" }) + mi("Locations and spots", { val: "4" }) + (st.samples ? mi("Sample items", { val: "4 left" }) : "") + '</div><p class="small">The household name has one home here; today it is also on the Settings page and in Preferences.</p>';
  }
  function bAssist(opt, dev, st) {
    var c = st.conn;
    return '<div class="menu card">' + mi("Claude", { chip: c >= 1 ? "Connected" : "Connect" }) + mi("ChatGPT", { chip: c >= 2 ? "Connected" : "Connect" }) + mi("Gemini", { chip: "Connect" }) + '</div>' +
      (c >= 2 ? '<section class="card"><span class="lbl">Default</span>' + seg(opt, dev, "assistant", "Default assistant", [["claude", "Claude"], ["chatgpt", "ChatGPT"]], "claude") + '</section>' : '<p class="small">' + (c === 1 ? "One is connected, so Kitchie uses it. No question to answer." : "None connected yet. Connect one to use Ask assistant.") + '</p>');
  }

  /* ---------- Option C: the index (every knob stays, found by typing) ---------- */
  var INDEX = [
    { id: "theme", t: "Theme", kw: "colour color look palette marmalade blueberry night day", where: "Looks", ctl: "theme", common: 1 },
    { id: "mode", t: "Light or dark", kw: "dark light night mode system follow phone", where: "Looks", ctl: "mode", common: 1 },
    { id: "emoji", t: "Show emoji", kw: "emoji icons pictures", where: "Looks", ctl: "emoji", common: 1 },
    { id: "size", t: "Item name size", kw: "text size bigger larger font small readable", where: "Looks", ctl: "size", common: 1 },
    { id: "motion", t: "Reduce motion", kw: "animation animations movement transitions", where: "Looks", ctl: "motion" },
    { id: "spot", t: "Show the spot", kw: "location shelf where", where: "Looks", ctl: "spot" },
    { id: "amount", t: "Show the amount", kw: "quantity how much", where: "Looks", ctl: "amount" },
    { id: "useby", t: "Show the use-by date", kw: "expiry date goes off", where: "Looks", ctl: "useby" },
    { id: "activity", t: "Show household activity", kw: "bell badge notifications changes", where: "Looks", ctl: "activity" },
    { id: "compact", t: "Compact rows", kw: "density tight rows smaller", where: "Looks", ctl: "compact" },
    { id: "quiet", t: "Quiet hours", kw: "notifications night sleep do not disturb checks", where: "Preferences", link: 1, common: 1 },
    { id: "hh", t: "Household name", kw: "kitchen name rename", where: "Household", link: 1, common: 1 },
    { id: "checks", t: "Ask me to check amounts", kw: "stock checks questions", where: "Preferences", ctl: "checks" },
    { id: "cap", t: "Most suggestions per day", kw: "limit checks daily", where: "Preferences", link: 1 },
    { id: "rules", t: "Check rules by place", kw: "frequency category location", where: "Preferences", link: 1 },
    { id: "food", t: "Food: avoids, dislikes, likes", kw: "allergy diet hard soft avoid", where: "Preferences", link: 1 },
    { id: "assistant", t: "My assistant", kw: "claude chatgpt gemini ai default", where: "Assistants", link: 1 },
    { id: "cats", t: "Categories", kw: "rename merge group", where: "Kitchen setup", link: 1 },
    { id: "locs", t: "Locations and spots", kw: "fridge freezer pantry shelf", where: "Kitchen setup", link: 1 },
    { id: "members", t: "Members and admins", kw: "people invite leave", where: "Household", link: 1 },
    { id: "samples", t: "Sample items", kw: "starter examples clear", where: "Kitchen setup", link: 1 },
    { id: "install", t: "Install on the home screen", kw: "app pwa add to home", where: "App", link: 1 },
    { id: "csv", t: "Download inventory CSV", kw: "export data spreadsheet", where: "My data", link: 1 },
    { id: "me", t: "My name and picture", kw: "profile avatar", where: "Profile", link: 1 },
    { id: "sort", t: "Sort order", kw: "order list sorting", where: "Pantry list", link: 1 },
    { id: "signout", t: "Sign out", kw: "log out", where: "Profile", link: 1 },
    { id: "reset", t: "Reset to defaults", kw: "undo changes restore", where: "Looks", ctl: "reset" }
  ];
  function ctlHtml(opt, dev, e, st) {
    switch (e.ctl) {
      case "theme": return themeBlock(false);
      case "mode": return seg(opt, dev, "mode", "Light or dark", MODE, st.mode);
      case "size": return seg(opt, dev, "size", "Item name size", [["small", "Small"], ["normal", "Normal"], ["large", "Large"]], st.size);
      case "reset": return '<button type="button" class="btn ghost" data-a="reset">Reset to defaults</button>';
      default: return sw(opt, dev, e.ctl, e.t, !!st[e.ctl]);
    }
  }
  function entryHtml(opt, dev, e, st) {
    var head = '<div class="why">' + esc(e.where) + (e.ctl ? "" : " · opens the existing screen") + '</div>';
    if (e.ctl === "theme" || e.ctl === "mode" || e.ctl === "size") return '<div class="rw" data-entry="' + e.id + '"><b>' + esc(e.t) + '</b>' + head + ctlHtml(opt, dev, e, st) + '</div>';
    if (e.ctl) return '<div class="rw" data-entry="' + e.id + '">' + (e.ctl === "reset" ? '<b>' + esc(e.t) + '</b>' + head : head) + ctlHtml(opt, dev, e, st) + '</div>';
    return '<div class="rw" data-entry="' + e.id + '">' + mi(e.t, { a: "link:" + e.t }).replace('class="mi"', 'class="mi" style="border:0;min-height:48px"') + head + '</div>';
  }
  function matches(q) {
    q = q.trim().toLowerCase(); if (!q) return [];
    var toks = q.split(/\s+/);
    return INDEX.filter(function (e) { var hay = (e.t + " " + e.kw + " " + e.where).toLowerCase(); return toks.every(function (t) { return hay.indexOf(t) !== -1; }); });
  }
  function cFind(opt, dev, st) {
    var list, body;
    var m = matches(st.q);
    if (st.q.trim()) body = m.length ? '<div class="res" data-results>' + m.map(function (e) { return entryHtml(opt, dev, e, st); }).join("") + '</div>' : '<div class="res"><p class="none" data-empty>Nothing called “' + esc(st.q) + '”. Try fewer letters, or “dark”, “text”, “quiet”.</p></div>';
    else body = '<span class="lbl">Common</span><div class="card" data-common>' + INDEX.filter(function (e) { return e.common; }).map(function (e) { return e.ctl ? entryHtml(opt, dev, e, st).replace('class="rw"', 'class="rw" style="padding:6px 0"') : entryHtml(opt, dev, e, st); }).join("") + '</div><p class="small">' + INDEX.length + ' things can be changed. Type to find any of them.</p>';
    return '<label class="find"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg><input type="search" data-q placeholder="What do you want to change?" aria-label="Find a setting" value="' + esc(st.q) + '" autocomplete="off"></label>' + body;
  }

  /* ---------- Option D: the thin pages and the contextual menus ---------- */
  function dPantry(opt, dev, st, desk) {
    var pop = st.aa ? '<div class="pop" role="dialog" aria-label="This list" data-aa><div class="ph2"><h4>This list</h4><button type="button" class="pill" data-a="aa" aria-label="Close">Done</button></div>' +
      '<div class="lbl">Text size</div>' + seg(opt, dev, "size", "Text size, this list", [["small", "Small"], ["normal", "Normal"], ["large", "Large"]], st.size) +
      '<div class="lbl">Rows show</div><div class="tog" role="group" aria-label="Rows show">' + [["amount", "Amount"], ["spot", "Spot"], ["useby", "Use-by"]].map(function (x) { return '<button type="button" data-t="' + x[0] + '" aria-pressed="' + st[x[0]] + '">' + x[1] + '</button>'; }).join("") + '<button type="button" data-t="compact" aria-pressed="' + st.compact + '">Compact</button></div>' +
      '<button type="button" class="btn ghost" data-a="reset">Back to default</button><p class="small">Changes this list only, and says so. Phone text size does the rest of the app.</p></div>' : "";
    var head = '<div class="listhead"><h3>Pantry</h3><button type="button" class="pill" data-a="link:Sort">Sort: name ▾</button><button type="button" class="pill" data-a="aa" aria-expanded="' + st.aa + '" aria-label="Text and rows for this list">' + (desk ? "View" : "Aa") + '</button></div>';
    return head + rowsHtml(st) + pop;
  }
  function dProfile(opt, dev, st) {
    return who("Alex", "Henderson kitchen") +
      '<div><span class="lbl">Looks</span><section class="card sgroup" style="margin-top:8px" data-quick>' + themeBlock(false) + modeRow(opt, dev, st) + sw(opt, dev, "emoji", "Show emoji", st.emoji) + '</section></div>' +
      '<div><span class="lbl">App</span><div class="menu card">' + mi("Settings") + mi("History") + mi("Preferences") + '</div></div>' +
      '<div><span class="lbl">People</span><div class="menu card">' + mi("Me", { chip: "Alex" }) + mi("Household", { chip: "3" }) + '</div></div>';
  }
  function dThin(opt, dev, st) {
    return '<div class="menu card" data-thin>' + mi("Kitchen setup", { val: "Categories, Locations" }) + mi("Household", { val: "Henderson kitchen" }) + mi("Assistants", { val: st.conn === 0 ? "None" : st.conn === 1 ? "Claude" : "Claude, ChatGPT" }) + mi("Install on the home screen") + mi("Download inventory CSV") + (st.samples ? mi("Sample items", { val: "4 left" }) : "") + '</div>' +
      '<p class="small">No display settings here. Looks live on the avatar, row and text options live on the list they change.</p>';
  }

  /* ---------- phones and windows ---------- */
  function phone(opt, d) {
    var st = S[opt].st, p = d.page, top = "", body = "";
    if (opt === "today") {
      if (p === "menu") { top = mtop(null, ""); body = who("Alex", "Henderson kitchen") + '<div><span class="lbl">App</span><div class="menu card">' + mi("Settings", { a: "nav:settings" }) + mi("History") + mi("Looks", { a: "nav:looks", dup: 1 }) + '<div class="msub" role="group"><span class="lbl">Kitchen setup</span>' + mi("Categories", { dup: 1 }) + mi("Locations and spots", { dup: 1 }) + '</div>' + mi("Install", { dup: 1 }) + '</div></div><div><span class="lbl">Preferences</span><div class="menu card">' + mi("Preferences") + '</div></div><div><span class="lbl">People</span><div class="menu card">' + mi("Me", { chip: "Alex" }) + mi("Household", { chip: "3" }) + '</div></div><div><span class="lbl">My data</span><div class="menu card">' + mi("Download inventory CSV") + '</div></div><button type="button" class="danger dup">Sign out<span class="dupt">also in Settings</span></button>'; }
      else if (p === "settings") { top = mtop(["Back", "menu"], "Settings"); body = '<div><span class="lbl">App</span><div class="menu card">' + mi("Looks", { a: "nav:looks", dup: 1 }) + '<div class="msub" role="group"><span class="lbl">Kitchen setup</span>' + mi("Categories", { dup: 1 }) + mi("Locations and spots", { dup: 1 }) + '</div>' + mi("Install", { dup: 1 }) + '</div></div><p class="small">Categories and Locations and spots are the household’s, not just this device’s. Preferences is its own section in the profile menu.</p>' + (st.samples ? '<section><h2 style="margin:0 0 6px;font-size:1.1em">Sample items</h2><p class="small">4 sample items left. They count toward nothing until you change one.</p><p style="margin-top:8px"><button type="button" class="btn" data-a="link:Clear sample items">Clear sample items</button></p></section>' : "") + '<button type="button" class="btn ghost" data-a="link:Back to Kitchie">Back to Kitchie</button><button type="button" class="danger dup">Sign out<span class="dupt">also on the menu</span></button>'; }
      else { top = mtop(["Settings", "settings"], "Looks"); body = todayLooks(opt, d.i, st); }
    } else if (opt === "A") {
      if (p === "menu") { top = mtop(null, ""); body = who("Alex", "Henderson kitchen") + '<div><span class="lbl">App</span><div class="menu card">' + mi("History") + mi("Looks", { a: "nav:looks" }) + '<div class="msub" role="group"><span class="lbl">Kitchen setup</span>' + mi("Categories") + mi("Locations and spots") + '</div>' + mi("Install") + '</div></div><div><span class="lbl">Preferences</span><div class="menu card">' + mi("Preferences") + '</div></div><div><span class="lbl">People</span><div class="menu card">' + mi("Me", { chip: "Alex" }) + mi("Household", { chip: "3" }) + '</div></div><div><span class="lbl">My data</span><div class="menu card">' + mi("Download inventory CSV") + '</div></div><button type="button" class="danger">Sign out</button>'; }
      else { top = mtop(["Back", "menu"], "Looks"); body = aLooks(opt, d.i, st); }
    } else if (opt === "B") {
      if (p === "home") { top = mtop(null, "Settings"); body = '<div class="menu card" data-jobs>' + mi("How it looks", { a: "nav:looks", val: (window.themeName ? window.themeName() : "") + " · " + (st.mode === "system" ? "follows phone" : st.mode) }) + mi("How it behaves", { a: "nav:behaves", val: "Checks " + (st.checks ? "on" : "off") }) + mi("My household", { a: "nav:household", val: "Henderson kitchen" }) + mi("Assistants", { a: "nav:assist", val: st.conn === 0 ? "None" : st.conn === 1 ? "Claude" : "Claude, ChatGPT" }) + '</div><p class="small">Four jobs. Each page leads with the two or three things people change; the rest is under More.</p>'; }
      else { var T = { looks: "How it looks", behaves: "How it behaves", household: "My household", assist: "Assistants" }; top = mtop(["Settings", "home"], T[p]); body = p === "looks" ? bLooks(opt, d.i, st) : p === "behaves" ? bBehaves(opt, d.i, st) : p === "household" ? bHousehold(opt, d.i, st) : bAssist(opt, d.i, st); }
    } else if (opt === "C") {
      top = mtop(null, "Settings"); body = cFind(opt, d.i, st);
    } else if (opt === "D") {
      if (p === "pantry") { top = ""; body = dPantry(opt, d.i, st, false); }
      else if (p === "profile") { top = mtop(["Back", "pantry"], ""); body = dProfile(opt, d.i, st); }
      else { top = mtop(["Back", "profile"], "Settings"); body = dThin(opt, d.i, st); }
    }
    return top + '<div class="mbody" style="padding-top:' + (top ? 18 : 6) + 'px">' + body + '</div>';
  }
  function gutter(opt, cur, d) {
    var rows = opt === "A" ? ["Profile", "Looks", "Preferences", "History", "Household", "My data"] : ["Profile", "Settings", "Preferences", "History", "Household", "My data"];
    return '<nav class="gut" aria-label="Settings sections"><div class="who"><span class="av">A</span><b>Alex</b></div>' + rows.map(function (r, i) { return '<button type="button" class="gi" ' + (r === cur ? 'aria-current="true"' : "") + ' data-a="link:' + r + '">' + r + '<span class="kbd">' + (i + 1) + '</span></button>'; }).join("") + '</nav>';
  }
  function deskPane(opt, d) {
    var st = S[opt].st, p = d.page, main = "", side = "", cur = "Settings", gsub = "";
    if (opt === "today") { main = '<h3 class="ph">Looks</h3><div style="max-width:520px;display:flex;flex-direction:column;gap:14px">' + todayLooks(opt, d.i, st) + '</div>'; side = preview(opt, st, TODAYCAP); gsub = ["Looks", "Categories", "Locations and spots"]; }
    else if (opt === "A") { cur = "Looks"; main = '<h3 class="ph">Looks</h3><div style="max-width:520px;display:flex;flex-direction:column;gap:14px">' + aLooks(opt, d.i, st) + '</div>'; side = preview(opt, st, 'Three controls. Text size, motion and dark at night come from the phone or computer.'); }
    else if (opt === "B") { var T = { looks: "How it looks", behaves: "How it behaves", household: "My household", assist: "Assistants" }, pg = p === "home" ? "looks" : p;
      main = '<div style="display:flex;gap:24px"><div role="tablist" aria-label="Settings jobs" style="width:170px;flex:none;display:flex;flex-direction:column;gap:2px">' + Object.keys(T).map(function (k) { return '<button type="button" class="gi" style="min-height:44px;padding:0 10px;border-radius:12px;border:0;background:' + (k === pg ? "var(--surface)" : "none") + ';color:var(--fg);font:600 1em var(--body);text-align:left;cursor:pointer" ' + (k === pg ? 'aria-current="true"' : "") + ' data-a="nav:' + k + '">' + T[k] + '</button>'; }).join("") + '</div><div style="flex:1;max-width:520px;display:flex;flex-direction:column;gap:14px"><h3 class="ph" style="margin:0">' + T[pg] + '</h3>' + (pg === "looks" ? bLooks(opt, d.i, st) : pg === "behaves" ? bBehaves(opt, d.i, st) : pg === "household" ? bHousehold(opt, d.i, st) : bAssist(opt, d.i, st)) + '</div></div>'; side = preview(opt, st, 'Text size here is the whole app, not one list.'); }
    else if (opt === "C") { main = '<div style="max-width:560px;display:flex;flex-direction:column;gap:14px"><h3 class="ph" style="margin:0">Settings <span class="kbd" style="margin-left:8px">/</span></h3>' + cFind(opt, d.i, st) + '</div>'; side = preview(opt, st, 'Option C keeps every knob, so Item name size is still Pantry-only here. Search hides the clutter; it does not fix what a knob does.'); }
    else if (opt === "D") { if (p === "pantry") { return '<div class="pane"><div class="main" style="position:relative;padding:18px 28px"><div class="listhead"><h3>Pantry</h3><button type="button" class="pill" data-a="link:Search">Search /</button><button type="button" class="pill" data-a="link:Sort">Sort: name ▾</button><button type="button" class="pill" data-a="aa" aria-expanded="' + st.aa + '">View ▾</button></div>' + rowsHtml(st) + (st.aa ? dPantry(opt, d.i, st, true).split('<div class="pop"')[1].replace(/^/, '<div class="pop"') : "") + '</div></div>'; }
      cur = "Settings"; main = '<h3 class="ph">Settings</h3><div style="max-width:520px;display:flex;flex-direction:column;gap:14px">' + dThin(opt, d.i, st) + '</div>'; }
    var g = gutter(opt, cur, d);
    if (gsub) g = g.replace('</button><button type="button" class="gi" data-a="link:Preferences"', '</button>' + gsub.map(function (s, i) { return '<button type="button" class="gi gsub" ' + (i === 0 ? 'aria-current="true"' : "") + ' data-a="link:' + s + '">' + s + '</button>'; }).join("") + '<button type="button" class="gi" data-a="link:Preferences"');
    return g + '<div class="pane"><div class="main">' + main + '</div>' + (side ? '<aside class="side">' + side + '</aside>' : "") + '</div>';
  }

  /* ---------- frame assembly ---------- */
  var LAYOUT = {
    today: [["phone", "menu", "<b>Today, phone.</b> Profile menu, then Settings, then Looks. Tap through; “Mark duplicates” shows rows listed twice."], ["prev"], ["desk", "looks", "<b>Today, desktop.</b> The Settings window: Looks in the tree, Categories and Locations beneath it."]],
    A: [["phone", "menu", "<b>A, phone.</b> The Settings row goes; Looks has three controls."], ["phone", "looks", "<b>A, Looks.</b> Everything that is left."], ["prev"], ["desk", "looks", "<b>A, desktop.</b> The gutter’s Settings becomes Looks."]],
    B: [["phone", "home", "<b>B, phone.</b> Four jobs, each with its current state."], ["phone", "looks", "<b>B, How it looks.</b> Two controls and a mode, the rest under More."], ["prev"], ["desk", "looks", "<b>B, desktop.</b> The four jobs as a sub-list; same pages."]],
    C: [["phone", "find", "<b>C, phone.</b> Search first; six common things; type to reach all " + INDEX.length + "."], ["prev"], ["desk", "find", "<b>C, desktop.</b> Press / to search."]],
    D: [["phone", "pantry", "<b>D, the Pantry.</b> The Aa button opens text and row options right where they show."], ["phone", "profile", "<b>D, the avatar.</b> Looks sit at the top of the profile menu."], ["phone", "thin", "<b>D, Settings, thin.</b> Only what is not about looks or a list."], ["desk", "pantry", "<b>D, desktop Pantry.</b> A View menu beside Sort."], ["desk", "thin", "<b>D, desktop Settings.</b> The same thin page in the window."]]
  };
  var uid = 0;
  function buildFrame(opt) {
    var root = $("#opt-" + opt), pair = $(".pair", root) || (function () { var p = document.createElement("div"); p.className = "pair"; root.appendChild(p); return p; })();
    S[opt].devs = []; var html = "";
    LAYOUT[opt].forEach(function (spec) {
      if (spec[0] === "prev") { html += '<div data-slot="prev"></div>'; return; }
      var i = ++uid; S[opt].devs.push({ kind: spec[0], page: spec[1], i: i, cap: spec[2] });
      html += spec[0] === "phone" ? '<figure class="fig"><figcaption>' + spec[2] + '</figcaption><div class="phone" data-dev="' + i + '"><div class="scr"></div></div></figure>' : '<figure class="fig deskfig" style="flex-basis:100%"><figcaption>' + spec[2] + '</figcaption><div class="deskwrap"><div class="desk" data-dev="' + i + '"></div></div></figure>';
    });
    pair.innerHTML = html;
    var ctl = $(".aids", root); if (ctl) { /* static controls already in the HTML */ }
  }
  var PREVCAP = { today: TODAYCAP, A: 'Text size is the phone’s: use “Pretend phone text” in the bar. Every screen grows, not just this list.', B: 'Text size here is the whole app (Larger). Rows is one choice.', C: 'Option C keeps every knob, so Item name size is still Pantry-only. Search hides the clutter; it does not fix what a knob does.', D: "" };
  function applyAttrs(opt) {
    var root = $("#opt-" + opt), st = S[opt].st, eff = effective(opt, st);
    root.toggleAttribute("data-compact", !!eff.compact);
    if (eff.size !== "normal") root.setAttribute("data-size", eff.size); else root.removeAttribute("data-size");
    root.toggleAttribute("data-whole", opt === "B");
    root.setAttribute("data-hide", eff.useby ? "" : "useby");
    if (eff.motion) root.setAttribute("data-motion", "reduce"); else root.removeAttribute("data-motion");
    root.classList.toggle("showdup", !!st.dup);
  }
  function effective(opt, st) {
    var e = { size: st.size, compact: st.compact, useby: st.useby, motion: st.motion }, out = {};
    if (opt === "A") { e.size = "normal"; e.compact = false; e.useby = true; e.motion = false; }
    if (opt === "B") { e.compact = st.rowsMode === "compact"; e.useby = st.rowsMode !== "names"; }
    return e;
  }
  function effState(opt, st) {
    var s = Object.assign({}, st);
    if (opt === "A") { s.spot = true; s.amount = true; }
    if (opt === "B") { s.spot = st.rowsMode === "standard"; s.amount = st.rowsMode !== "names"; }
    return s;
  }
  function render(opt) {
    var o = S[opt], st = o.st, root = $("#opt-" + opt), es = effState(opt, st);
    var ae = document.activeElement, keep = ae && root.contains(ae) ? { k: ae.getAttribute("data-k"), a: ae.getAttribute("data-a"), q: ae.hasAttribute("data-q"), v: ae.getAttribute("value"), dev: (ae.closest("[data-dev]") || {}).dataset ? ae.closest("[data-dev]").dataset.dev : null } : null;
    var scrolls = {}; $$("[data-dev]", root).forEach(function (n) { var s = n.querySelector(".scr") || n.querySelector(".main"); if (s) scrolls[n.dataset.dev] = s.scrollTop; });
    applyAttrs(opt);
    o.devs.forEach(function (d) {
      var el = $('[data-dev="' + d.i + '"]', root); if (!el) return;
      if (d.kind === "phone") { $(".scr", el).innerHTML = phoneWith(opt, d, es); } else { el.innerHTML = deskWith(opt, d, es); }
      var s = el.querySelector(".scr") || el.querySelector(".main"); if (s && scrolls[d.i] != null) s.scrollTop = scrolls[d.i];
      if (st.toast && d.kind === "phone" && d === o.devs.filter(function (x) { return x.kind === "phone"; })[0]) { var t = document.createElement("div"); t.className = "toast"; t.setAttribute("role", "status"); t.textContent = st.toast; el.appendChild(t); }
    });
    var slot = $('[data-slot="prev"]', root); if (slot) slot.innerHTML = preview(opt, es, PREVCAP[opt]);
    if (keep) { var sel = keep.q ? "[data-q]" : keep.k ? '[data-k="' + keep.k + '"]' + (keep.v ? '[value="' + keep.v + '"]' : "") : keep.a ? '[data-a="' + keep.a + '"]' : null; var scope = keep.dev ? $('[data-dev="' + keep.dev + '"]', root) : root; var n = sel && scope ? $(sel, scope) : null; if (n) { n.focus(); if (keep.q && n.setSelectionRange) { var L = n.value.length; n.setSelectionRange(L, L); } } }
    if (!st.toast) return; clearTimeout(o.tt); o.tt = setTimeout(function () { st.toast = ""; $$(".toast", root).forEach(function (t) { t.remove(); }); }, 2200);
  }
  function phoneWith(opt, d, es) { var keepSt = S[opt].st; S[opt].st = es; try { return phone(opt, d); } finally { S[opt].st = keepSt; } }
  function deskWith(opt, d, es) { var keepSt = S[opt].st; S[opt].st = es; try { return deskPane(opt, d); } finally { S[opt].st = keepSt; } }

  /* ---------- events ---------- */
  function setMode(st, m) {
    st.mode = m; var cur = document.documentElement.getAttribute("data-theme");
    if (cur !== "kitchie" && cur !== "kitchie-day") return;
    var want = m === "light" ? "kitchie-day" : m === "dark" ? "kitchie" : (matchMedia("(prefers-color-scheme: light)").matches ? "kitchie-day" : "kitchie");
    var b = document.createElement("button"); b.setAttribute("data-theme-pick", want); b.hidden = true; document.body.appendChild(b); b.click(); b.remove();
  }
  function optOf(n) { var f = n.closest(".fr"); return f && OPTS.indexOf(f.dataset.opt) > -1 ? f.dataset.opt : null; }
  function devOf(opt, n) { var el = n.closest("[data-dev]"); return el ? S[opt].devs.filter(function (d) { return String(d.i) === el.dataset.dev; })[0] : null; }
  function onChange(e) {
    var n = e.target, opt = optOf(n); if (!opt || !n.hasAttribute("data-k")) return; var k = n.getAttribute("data-k"), st = S[opt].st;
    var v = n.type === "checkbox" ? n.checked : n.value;
    if (k === "mode") setMode(st, v); else if (k === "assistant") { /* drawn only */ } else st[k] = v;
    if (opt === "B" && k === "size") st.size = v;
    if (k === "emoji") st.emoji = !!v; render(opt);
  }
  function onClick(e) {
    var b = e.target.closest("[data-a],[data-t]"); if (!b) return; var opt = optOf(b); if (!opt) return; var st = S[opt].st, a = b.getAttribute("data-a");
    if (b.hasAttribute("data-t")) { var t = b.getAttribute("data-t"); st[t] = !st[t]; render(opt); return; }
    if (a === "more") { st.more = !st.more; render(opt); return; }
    if (a === "aa") { st.aa = !st.aa; render(opt); return; }
    if (a === "reset") { var f = fresh(); ["size", "emoji", "motion", "spot", "amount", "useby", "activity", "compact", "rowsMode", "mode"].forEach(function (k) { st[k] = f[k]; }); render(opt); return; }
    if (a.indexOf("tab:") === 0) { st.screen = a.slice(4); render(opt); return; }
    if (a.indexOf("nav:") === 0) { var d = devOf(opt, b); if (d) { d.page = a.slice(4); } else { S[opt].devs.forEach(function (x) { if (x.kind === "desk") x.page = a.slice(4); }); } render(opt); return; }
    if (a.indexOf("link:") === 0) { st.toast = "Opens “" + a.slice(5) + "”, unchanged."; render(opt); return; }
  }
  function onInput(e) { var n = e.target; if (!n.hasAttribute("data-q")) return; var opt = optOf(n); if (!opt) return; S[opt].st.q = n.value; render(opt); }
  function onKey(e) {
    if (e.key === "Escape") { OPTS.forEach(function (o) { if (S[o].st.aa) { S[o].st.aa = false; render(o); } }); }
    if (e.key === "/" && window.SR_ACTIVE_OPT !== "E" && !/INPUT|TEXTAREA/.test((document.activeElement || {}).tagName || "")) { var inp = $("#opt-C [data-dev='" + (S.C.devs[1] ? S.C.devs[1].i : "") + "'] [data-q]") || $("#opt-C [data-q]"); if (inp) { e.preventDefault(); inp.focus(); } }
  }
  /* page-level mockup aids */
  function aids() {
    $$("[data-aid-os]").forEach(function (b) { b.addEventListener("click", function () { var big = b.dataset.aidOs === "large"; document.documentElement.style.setProperty("--os", big ? "1.2" : "1"); $$("[data-aid-os]").forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); }); }); });
    $$("[data-aid-conn]").forEach(function (b) { b.addEventListener("click", function () { var n = +b.dataset.aidConn; ["A", "B", "D"].forEach(function (o) { S[o].st.conn = n; render(o); }); $$("[data-aid-conn]").forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); }); }); });
    $$("[data-aid-dup]").forEach(function (b) { b.addEventListener("click", function () { var on = b.getAttribute("aria-pressed") !== "true"; b.setAttribute("aria-pressed", String(on)); S.today.st.dup = on; render("today"); }); });
    $$("[data-aid-samples]").forEach(function (b) { b.addEventListener("click", function () { var on = b.getAttribute("aria-pressed") !== "true"; b.setAttribute("aria-pressed", String(on)); OPTS.forEach(function (o) { S[o].st.samples = on; render(o); }); }); });
  }
  /* ledger (deferred data) */
  function ledger() {
    var K = window.SR_KNOBS; var tb = $("#ledger tbody"); if (!K || !tb) return;
    var word = { stay: "stays", gone: "gone", auto: "automatic", merge: "merged", ctx: "in context", search: "by search", adv: "under More", pin: "pinnable" };
    tb.innerHTML = K.map(function (k) { return "<tr><td>" + k.id + "</td><td>" + esc(k.name) + '</td><td><span class="v ' + k.verdict + '">' + k.verdict + "</span></td>" + ["A", "B", "C", "D", "E"].map(function (o) { return '<td class="o-' + k.o[o] + '">' + word[k.o[o]] + "</td>"; }).join("") + "</tr>"; }).join("");
    var words = { stay: "stay", gone: "gone", auto: "automatic", merge: "merged", ctx: "in context", search: "by search", adv: "under More", pin: "pinnable" };
    ["A", "B", "C", "D", "E"].forEach(function (o) { var t = {}; K.forEach(function (k) { t[k.o[o]] = (t[k.o[o]] || 0) + 1; }); var cell = $("#l" + o); if (cell) cell.textContent = Object.keys(t).map(function (w) { return t[w] + " " + words[w]; }).join(", "); });
    var n = $("#ledger-note"); if (n) n.textContent = "Loaded.";
  }
  function init() {
    OPTS.forEach(buildFrame);
    document.addEventListener("change", onChange); document.addEventListener("click", onClick); document.addEventListener("input", onInput); document.addEventListener("keydown", onKey);
    aids();
    OPTS.forEach(render);
    if (window.themeWarm) $$(".fr").forEach(function (f) { f.addEventListener("pointerenter", window.themeWarm, { once: true }); });
    var go = function () { var s = document.createElement("script"); s.src = "data.js"; s.onload = ledger; document.head.appendChild(s); };
    if ("IntersectionObserver" in window && $("#ledger")) { var io = new IntersectionObserver(function (en) { if (en[0].isIntersecting) { io.disconnect(); go(); } }, { rootMargin: "400px" }); io.observe($("#ledger")); } else go();
    document.body.setAttribute("data-ready", "1");
    var q = new URLSearchParams(location.search); if (q.get("o")) { var t = document.getElementById("opt-" + q.get("o")); if (t) t.scrollIntoView(); }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
