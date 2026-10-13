/* Recipe share links, management view. MOCKUP ONLY: sample data, nothing is sent or stored; every link is a placeholder at kitchie.example.
   Shared by all three options and both form factors: the sample states, the list (row, inline rename, copy, cancel with undo, renew, remove from view)
   and the page chrome (option tabs, state chips, phone / desktop). The option drawings are in phone.js and desktop.js, loaded only for the form factor on screen
   (DESIGN.md section 6: load on engagement). Cancel follows the photos pattern (P-D17): hidden at once, Undo for 5 minutes, then gone from view. */
(function () {
  "use strict";
  var UNDO_S = 300, SOON_H = 24, RENEW_H = 168, MAXINV = 3; /* the member's maximum-invites limit (sample) */
  var ICONS = {
    link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
    copy: '<rect x="8" y="8" width="12" height="12" rx="2.5"/><path d="M16 8V6.5A2.5 2.5 0 0 0 13.5 4h-7A2.5 2.5 0 0 0 4 6.5v7A2.5 2.5 0 0 0 6.5 16H8"/>',
    pencil: '<path d="M4 20l1-4L16.5 4.5a2.1 2.1 0 0 1 3 3L8 19z"/><path d="M14.5 6.5l3 3"/>',
    clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    undo: '<path d="M9 7L4 12l5 5"/><path d="M4 12h10.500a4.500 4.500 0 0 1 0 9H10"/>',
    share: '<path d="M12 15V4M8 8l4-4 4 4"/><path d="M5 13v5.500A1.500 1.500 0 0 0 6.500 20h11a1.500 1.500 0 0 0 1.500-1.500V13"/>',
    back: '<path d="M15 5l-7 7 7 7"/>',
    close: '<path d="M6 6l12 12M18 6L6 18"/>',
    renew: '<path d="M19 12a7 7 0 1 1-2.1-5"/><path d="M19 4.500V8h-3.500"/>',
    chev: '<path d="M6 9l6 6 6-6"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    eyeoff: '<path d="M3 12s3.500-6 9-6 9 6 9 6-3.500 6-9 6-9-6-9-6z"/><circle cx="12" cy="12" r="2.500"/>',
    home: '<path d="M4 11l8-7 8 7v8.500a1.500 1.500 0 0 1-1.500 1.500H15v-6H9v6H5.500A1.500 1.500 0 0 1 4 19.500z"/>',
    book: '<path d="M7 14a4 4 0 0 1-1-7.700 4.500 4.500 0 0 1 8.600-1.300 4 4 0 0 1 3.400 5.500A4 4 0 0 1 17 14v5H7z"/>',
    ticket: '<path d="M4 8.500a2 2 0 0 1 0 4v0a2 2 0 0 1 0 4V18h16v-1.500a2 2 0 0 1 0-4v0a2 2 0 0 1 0-4V6H4z"/><path d="M14 6.500v11" stroke-dasharray="1.800 2.200"/>',
    cart: '<circle cx="9" cy="20" r="1.500"/><circle cx="18" cy="20" r="1.500"/><path d="M3 4h2.500l2.200 10.200a1 1 0 0 0 .8.8h8.800a1 1 0 0 0 1-.8L20 8H6.200"/>'
  };
  function ic(n, c) { return '<svg class="rs-ic' + (c ? " " + c : "") + '" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + ICONS[n] + "</svg>"; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  /* The sample recipe's links. hours = hours until it ends (negative: ended that long ago); last = hours since it was last opened (null: never). */
  /* x = { inv: { s: "unclaimed" | "claimed" | "withdrawn", d: "Mon 12 Oct" }, ver: "With peas" }. No inv: the link carries no invite. No ver: it points at the usual version. */
  function L(id, name, hours, opens, last, x) { x = x || {}; return { id: id, name: name, hours: hours, opens: opens, last: last, cancelLeft: 0, gone: false, inv: x.inv || null, ver: x.ver || null }; }
  var STATES = {
    empty: { label: "Empty", cap: "No links yet.", make: function () { return []; } },
    three: { label: "3 active", cap: "Three links out, none close to ending.", make: function () { return [L(1, "For Mum", 140, 4, 2), L(2, "Book club", 71, 12, 26), L(3, "Work lunch group", 310, 0, null)]; } },
    soon: { label: "Ends soon", cap: "One link ends in under a day (the threshold is a proposal).", make: function () { return [L(1, "For Mum", 140, 4, 2), L(2, "Neighbours", 9, 1, 7), L(3, "Work lunch group", 310, 0, null)]; } },
    expired: { label: "One expired", cap: "An ended link stays, greyed, until it is renewed or removed from view.", make: function () { return [L(1, "For Mum", 140, 4, 2), L(2, "Book club", 71, 12, 26), L(3, "Work lunch group", 310, 0, null), L(4, "Sam's flat", -52, 7, 540)]; } },
    invites: { label: "Invites", cap: "Three links: one with an unclaimed invite (pointing at a chosen version), one whose invite was claimed, one with no invite. Two of three invites are spoken for.", make: function () { return [L(1, "For Mum", 140, 4, 2, { inv: { s: "unclaimed" }, ver: "With peas" }), L(2, "Book club", 71, 12, 26, { inv: { s: "claimed", d: "Mon 12 Oct" } }), L(3, "Work lunch group", 310, 0, null)]; } },
    invcancel: { label: "Cancel, invite", cap: "A link with an unclaimed invite was just cancelled: the invite is withdrawn and back in the allowance (undo takes it back). Cancelling a link whose invite was claimed leaves it claimed.", make: function () { var a = [L(1, "For Mum", 140, 4, 2, { inv: { s: "claimed", d: "Mon 12 Oct" } }), L(2, "Neighbours", 9, 1, 7, { inv: { s: "unclaimed" } }), L(3, "Work lunch group", 310, 0, null)]; a[1].cancelLeft = 252; return a; } },
    invend: { label: "Invite ended", cap: "An invite withdrawn by hand on a live link, and an invite that ended with its expired link (back in the allowance; Renew brings it back if one is left).", make: function () { return [L(1, "For Mum", 140, 4, 2, { inv: { s: "withdrawn" } }), L(2, "Book club", 71, 12, 26, { inv: { s: "claimed", d: "Mon 12 Oct" } }), L(3, "Sam's flat", -52, 7, 540, { inv: { s: "unclaimed" }, ver: "Less soy more garlic" })]; } },
    invnone: { label: "None left", cap: "All three invites are spoken for (two waiting, one claimed). The list still works; a new link can be made without an invite.", make: function () { return [L(1, "For Mum", 140, 4, 2, { inv: { s: "unclaimed" } }), L(2, "Book club", 71, 12, 26, { inv: { s: "claimed", d: "Mon 12 Oct" } }), L(3, "Neighbours", 200, 0, null, { inv: { s: "unclaimed" }, ver: "With peas" }), L(4, "Work lunch group", 310, 0, null)]; } },
    cancelled: { label: "Cancelled, undo", cap: "A link was just cancelled: its row is an Undo line for 5 minutes.", make: function () { var a = [L(1, "For Mum", 140, 4, 2), L(2, "Neighbours", 9, 1, 7), L(3, "Work lunch group", 310, 0, null)]; a[1].cancelLeft = 252; return a; } }
  };

  /* The invite's state as the sender sees it. An unclaimed invite on an ended link has ended with it. */
  function inv(l) { if (!l.inv) return null; if (l.inv.s === "claimed" || l.inv.s === "withdrawn") return l.inv.s; return l.hours < 0 ? "ended" : "unclaimed"; }
  function held(l) { var v = inv(l); return v === "claimed" || (v === "unclaimed" && !(l.cancelLeft > 0) && !l.gone); } // counts against the allowance
  function left(st) { return MAXINV - st.links.filter(held).length; }
  function kind(l) { return l.hours < 0 ? "expired" : l.hours < SOON_H ? "soon" : "live"; }
  function plural(n, w) { return n + " " + w + (n === 1 ? "" : "s"); }
  function ago(h) { // hours ago, in the words a person says
    if (h < 1) return "just now";
    if (h < 24) return Math.round(h) + " h ago";
    var d = Math.round(h / 24);
    return d === 1 ? "yesterday" : d < 14 ? d + " days ago" : Math.round(d / 7) + " weeks ago";
  }
  function leftText(h) {
    if (h < 1) return Math.max(1, Math.round(h * 60)) + " min left";
    if (h < SOON_H) return Math.round(h) + " h left";
    return Math.ceil(h / 24) + " days left";
  }
  function when(l) { // exact end, for the title and the screen reader
    var d = new Date(Date.UTC(2026, 9, 13, 10, 0) + l.hours * 3600000);
    return d.toUTCString().replace(/ GMT$/, "").replace(/:\d\d$/, "");
  }
  function mmss(s) { return Math.floor(s / 60) + ":" + (s % 60 < 10 ? "0" : "") + (s % 60); }

  /* ---- rows ---- */
  function row(l, st) {
    var k = kind(l), editing = st.editing === l.id, name = esc(l.name);
    if (l.cancelLeft > 0) return '<li class="rs-undo" role="status" data-id="' + l.id + '">' + ic("undo") + '<span class="t"><b>' + (l.removed ? "Removed from view" : "Link cancelled") + '</b><small>' + (l.removed ? "“" + name + "” is out of this list." : "“" + name + "” no longer opens." + (inv(l) === "unclaimed" ? " Its invite is withdrawn and back with you." : inv(l) === "claimed" ? " Its invite stays claimed." : "")) + ' Undo for <span data-left="' + l.id + '">' + mmss(l.cancelLeft) + '</span>, then it stays ' + (l.removed ? "removed" : "cancelled") + '</small></span><button type="button" class="rs-mini" data-act="undo" data-id="' + l.id + '">Undo</button></li>';
    if (l.gone) return "";
    var top = editing
      ? '<form class="rs-edit" data-act="save" data-id="' + l.id + '"><input name="n" value="' + name + '" maxlength="40" aria-label="Link name" autocomplete="off"><button type="submit" class="rs-save">' + ic("check") + 'Save</button><button type="button" class="rs-keep" data-act="keep" aria-label="Keep the old name">Keep</button></form>'
      : '<button type="button" class="rs-name" data-act="rename" data-id="' + l.id + '" aria-label="Rename ' + name + '"><span>' + name + '</span>' + ic("pencil") + '</button>' +
        (k === "expired" ? '<span class="rs-left" title="Ended ' + when(l) + '">' + ic("clock") + 'Ended ' + ago(-l.hours) + '</span>' : '<span class="rs-left" title="Ends ' + when(l) + '">' + ic("clock") + leftText(l.hours) + '</span>');
    var stats = (l.ver ? '<span class="rs-ver">' + esc(l.ver) + "</span>" : "") + (l.opens === 0 ? "Not opened yet" : plural(l.opens, "open") + " · last " + ago(l.last));
    var v = inv(l), iv = "";
    if (v) {
      var IT = { unclaimed: "Invite waiting. The first person to open the link can claim it.", claimed: "Invite claimed " + (l.inv.d || "") + ". A new household started from it.", ended: "Invite ended with the link.", withdrawn: "Invite withdrawn." };
      var short = { unclaimed: "Invite waiting", claimed: "Invite claimed " + (l.inv.d || ""), ended: "Invite ended with the link", withdrawn: "Invite withdrawn" };
      iv = '<div class="rs-inv" data-inv="' + v + '" title="' + IT[v] + '">' + ic("ticket") + '<span>' + short[v] + "</span>" + (v === "unclaimed" ? '<button type="button" class="rs-act rs-quiet" data-act="withdraw" data-id="' + l.id + '" aria-label="Withdraw the invite on ' + name + '">Withdraw</button>' : "") + "</div>";
    }
    var acts = k === "expired"
      ? '<button type="button" class="rs-act" data-act="renew" data-id="' + l.id + '" aria-label="Renew ' + name + '">' + ic("renew") + 'Renew</button><button type="button" class="rs-act rs-quiet rs-end" data-act="remove" data-id="' + l.id + '" aria-label="Remove ' + name + ' from view">' + ic("eyeoff") + 'Remove from view</button>'
      : '<button type="button" class="rs-act" data-act="copy" data-id="' + l.id + '" aria-label="Copy link ' + name + '">' + ic("copy") + 'Copy link</button><button type="button" class="rs-act rs-end" data-act="cancel" data-id="' + l.id + '" aria-label="Cancel link ' + name + '">Cancel link</button>';
    return '<li class="rs-row" data-kind="' + k + '" data-id="' + l.id + '"><div class="rs-top">' + top + '</div><div class="rs-stats">' + stats + "</div>" + iv + '<div class="rs-acts">' + acts + '</div></li>';
  }
  function shown(st) { return st.links.filter(function (l) { return !l.gone || l.cancelLeft > 0; }); }
  function counts(st) {
    var live = 0, soon = 0, gone = 0;
    st.links.forEach(function (l) { if (l.cancelLeft > 0 || l.gone) return; gone++; if (l.hours >= 0) { live++; if (l.hours < SOON_H) soon++; } });
    return { live: live, soon: soon, listed: gone };
  }
  function list(st) {
    // active links first (soonest to end first would reorder under the person's hands, so: the order they were made), ended ones last
    var a = st.links.slice().sort(function (x, y) { return (x.hours < 0) - (y.hours < 0); });
    return '<ul class="rs-list" aria-label="Share links">' + a.map(function (l) { return row(l, st); }).join("") + "</ul>";
  }
  function empty() {
    return '<div class="rs-empty">' + ic("link") + '<b>Not shared with anyone yet</b><p>Links you make with Share show up here, with who opened them.</p></div>';
  }
  function help(st) {
    var n = st ? left(st) : MAXINV;
    return '<p class="rs-help">Anyone with a link can open this recipe, no sign-in. Each link ends by itself.</p><p class="rs-allow" data-allow="' + n + '">' + ic("ticket") + "<b>" + n + " of " + MAXINV + " invites left</b><span>Cancel a link and its unused invite comes back.</span></p>";
  }

  /* ---- a frame: one drawing of the recipe page with its own copy of the sample state ---- */
  var frames = [], tick = 0;
  function mount(el, draw, stateKey) {
    var f = { el: el, draw: draw, st: { links: STATES[stateKey].make(), editing: null, open: true, toast: "" } };
    frames.push(f); render(f); return f;
  }
  function render(f) {
    var y = [].map.call(f.el.querySelectorAll(".rs-scroll,.rs-panel-b"), function (s) { return s.scrollTop; });
    var edit = f.st.editing;
    f.el.innerHTML = f.draw(f.st);
    [].forEach.call(f.el.querySelectorAll(".rs-scroll,.rs-panel-b"), function (s, i) { if (y[i]) s.scrollTop = y[i]; });
    if (edit) { var inp = f.el.querySelector(".rs-edit input"); if (inp) { inp.focus(); inp.select(); } }
  }
  function say(f, t) { f.st.toast = t; render(f); clearTimeout(f.t); f.t = setTimeout(function () { f.st.toast = ""; render(f); }, 2200); }
  function find(f, id) { return f.st.links.filter(function (l) { return String(l.id) === String(id); })[0]; }

  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest("[data-act],[data-toggle]");
    if (!b) return;
    var fe = b.closest(".rs-frame"); if (!fe) return;
    var f = frames.filter(function (x) { return x.el === fe; })[0]; if (!f) return;
    if (b.dataset.toggle) { f.st[b.dataset.toggle] = !f.st[b.dataset.toggle]; render(f); return; }
    var a = b.dataset.act, l = find(f, b.dataset.id);
    if (a === "rename") { f.st.editing = l.id; render(f); }
    else if (a === "keep") { f.st.editing = null; render(f); }
    else if (a === "copy") say(f, "Link copied. Paste it in a message.");
    else if (a === "cancel") { l.cancelLeft = UNDO_S; l.removed = false; f.st.editing = null; render(f); }
    else if (a === "remove") { l.cancelLeft = UNDO_S; l.removed = true; render(f); }
    else if (a === "undo") { l.cancelLeft = 0; l.removed = false; render(f); }
    else if (a === "withdraw") { l.inv.s = "withdrawn"; render(f); say(f, "Invite withdrawn. It is back in your allowance. The link still opens the recipe."); }
    else if (a === "renew") {
      var had = inv(l) === "ended"; l.hours = RENEW_H;
      if (had && left(f.st) < 0) { l.inv.s = "withdrawn"; say(f, "Renewed for 7 days. No invite left to bring back, so the link opens the recipe only."); }
      else say(f, had ? "Renewed for 7 days. The invite is waiting again." : "Renewed for 7 days. The same link works again.");
    }
    else if (a === "new") say(f, "Making a link is the create sheet (another slice).");
  });
  document.addEventListener("submit", function (e) {
    var form = e.target.closest && e.target.closest("form[data-act=save]");
    if (!form) return;
    e.preventDefault();
    var fe = form.closest(".rs-frame"), f = frames.filter(function (x) { return x.el === fe; })[0], l = find(f, form.dataset.id);
    var v = form.n.value.trim();
    if (v) l.name = v;
    f.st.editing = null; render(f);
    say(f, v ? "Renamed." : "A link needs a name, so the old one stays.");
  });
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    var fe = e.target.closest && e.target.closest(".rs-frame"); if (!fe) return;
    var f = frames.filter(function (x) { return x.el === fe; })[0];
    if (f && f.st.editing) { f.st.editing = null; render(f); }
  });
  // The undo clocks: one timer for the whole page, only while some Undo line is showing.
  setInterval(function () {
    frames.forEach(function (f) {
      var changed = false;
      f.st.links.forEach(function (l) {
        if (l.cancelLeft > 0) { l.cancelLeft--; if (l.cancelLeft === 0) { l.gone = true; changed = true; } else { var s = f.el.querySelector('[data-left="' + l.id + '"]'); if (s) s.textContent = mmss(l.cancelLeft); } }
      });
      if (changed) render(f);
    });
  }, 1000);


  /* ---- pieces of the recipe page the drawings share (context only; the Share button itself is another slice's) ---- */
  function bar(share) {
    return '<div class="rs-bar"><span class="rs-iconbtn" aria-hidden="true">' + ic("back") + '</span><h3>Egg fried rice</h3>' + share + "</div>";
  }
  function shareBtn(n, toggle, open) {
    var inner = ic("share") + "Share" + (n ? ' <span class="rs-n" aria-label="' + n + ' links out">' + n + "</span>" : "");
    return toggle ? '<button type="button" class="rs-sharebtn" data-toggle="open" aria-expanded="' + !!open + '" aria-haspopup="dialog">' + inner + "</button>" : '<span class="rs-sharebtn">' + inner + "</span>";
  }
  function chips() { return '<div class="rs-meta-chips"><span>2 servings</span><span>20 min</span><span>Our usual</span></div>'; }
  function jumps(chip, on) {
    var t = ["Ingredients", "Method", "Notes", "Cooked", "Photos"].map(function (x, i) { return '<a href="#" onclick="return false"' + (i === (chip ? -1 : on || 0) ? ' class="on"' : "") + ">" + x + "</a>"; }).join("");
    return '<nav class="rs-jumps" aria-label="Sections">' + t + (chip ? '<a href="#shared" onclick="return false" class="on">Shared' + (chip.n ? ' <span class="rs-n">' + chip.n + "</span>" : "") + "</a>" : "") + "</nav>";
  }
  function stub(label, n) { var i = ""; for (var k = 0; k < n; k++) i += '<i style="width:' + (92 - k * 17) + '%"></i>'; return '<div class="rs-stub"><b>' + label + "</b>" + i + "</div>"; }
  function toast(st) { return st.toast ? '<div class="rs-toast" role="status">' + esc(st.toast) + "</div>" : ""; }
  function sectionA(st) { // option A's section
    var c = counts(st);
    return '<section class="rs-sec" id="shared" aria-labelledby="shared-h"><div class="rs-sec-h"><h4 id="shared-h">Shared</h4><span>' + (c.live ? plural(c.live, "link") + " out" : "none out") + "</span></div>" + help(st) + list(st) + "</section>";
  }
  function cardC(st) {
    var c = counts(st), x = shown(st).length, ended = c.listed - c.live;
    var sub = (c.live ? plural(c.live, "link") + " out" : "None out") + (ended ? " · " + ended + " ended" : "");
    return '<section class="rs-card" data-open="' + st.open + '" aria-label="Shared outside the household"><button type="button" data-toggle="open" aria-expanded="' + st.open + '">' + ic("link") + '<span class="t"><b>Shared outside the household</b><small>' + sub + "</small>" + (c.soon ? '<small class="hot">' + c.soon + " ends within a day</small>" : "") + "</span>" + ic("chev", "rs-chev") + "</button>" + (st.open ? '<div class="rs-card-b">' + help(st) + list(st) + "</div>" : "") + "</section>";
  }
  function panelBody(st) { return (shown(st).length ? help(st) + list(st) : empty()); }
  function panelHead(title) { return '<div class="rs-panel-h"><h4>' + title + '</h4><button type="button" class="rs-new" data-act="new">' + ic("plus") + 'New link</button><button type="button" class="rs-iconbtn" data-toggle="open" aria-label="Close shared links">' + ic("close") + "</button></div>"; }

  window.RS = { bar: bar, shareBtn: shareBtn, chips: chips, jumps: jumps, stub: stub, toast: toast, sectionA: sectionA, cardC: cardC, panelBody: panelBody, panelHead: panelHead, ic: ic, esc: esc, STATES: STATES, row: row, list: list, empty: empty, help: help, counts: counts, shown: shown, mount: mount, render: render, forms: {}, SOON_H: SOON_H, leftText: leftText };

  /* ---- the page chrome ---- */
  var q = new URLSearchParams(location.search);
  var cur = { opt: ["A", "B", "C"].indexOf(q.get("opt")) >= 0 ? q.get("opt") : "A", state: STATES[q.get("state")] ? q.get("state") : "three", form: q.get("form") || (matchMedia("(min-width:1024px)").matches ? "desktop" : "phone") };
  var CAPS = { A: "Egg fried rice, scrolled to the end: the Shared section and its jump-row chip.", B: "Egg fried rice with the Share button's panel open.", C: "Egg fried rice, top of the page: the card in its details, open." };
  function pressed(attr, val) { [].forEach.call(document.querySelectorAll("[data-" + attr + "]"), function (b) { b.setAttribute("aria-pressed", String(b.dataset[attr] === val)); }); }
  function show() {
    pressed("opt", cur.opt); pressed("state", cur.state); pressed("form", cur.form);
    [].forEach.call(document.querySelectorAll("[data-why]"), function (s) { s.hidden = s.dataset.why !== cur.opt; });
    history.replaceState(null, "", "?opt=" + cur.opt + "&state=" + cur.state + "&form=" + cur.form);
    var stage = document.getElementById("rs-stage"), cap = document.getElementById("rs-cap");
    frames = []; stage.innerHTML = "";
    var go = function () {
      var draw = RS.forms[cur.form][cur.opt];
      var host = RS.forms[cur.form].host(stage);
      mount(host, draw, cur.state);
      cap.textContent = CAPS[cur.opt] + " " + STATES[cur.state].cap + (cur.opt !== "B" && cur.state === "empty" ? " Options A and C draw nothing when there is nothing to show; only B has an empty state." : "");
    };
    if (RS.forms[cur.form]) return go();
    var lk = document.createElement("link"); lk.rel = "stylesheet"; lk.href = cur.form + ".css"; document.head.appendChild(lk);
    var s = document.createElement("script"); s.src = cur.form + ".js"; s.onload = go; document.head.appendChild(s); // phone.js or desktop.js, fetched only when that form factor is shown
  }
  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest("[data-opt],[data-state],[data-form]");
    if (!b || b.closest(".rs-frame")) return;
    if (b.dataset.opt) cur.opt = b.dataset.opt; if (b.dataset.state) cur.state = b.dataset.state; if (b.dataset.form) cur.form = b.dataset.form;
    show();
  });
  document.addEventListener("DOMContentLoaded", function () {
    var st = document.getElementById("rs-states");
    st.innerHTML = Object.keys(STATES).map(function (k) { return '<button type="button" data-state="' + k + '" aria-pressed="false">' + STATES[k].label + "</button>"; }).join("");
    show();
  });
})();
