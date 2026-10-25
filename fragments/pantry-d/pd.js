/* Pantry D (fragment): variant D "Table" of the list language, locked by the owner (voice, 25 Oct 2026), drawn for Pantry, Recipes and Home.
   Base styles come from ../list-language/ll.css (tokens, rows, flags, sheet, tab bar, toast); pd.css is D plus the 25 Oct decisions.
   Forked from ../list-language/ll.js so the comparison page stays exactly as it was reviewed. Nothing is saved or fetched.
   Performance (DESIGN.md section 6): the page draws one screen; the Filters sheet, the sort menu and the basis strip are built when opened. */
(function () {
  "use strict";
  const D = window.LL_DATA;
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const svg = (p, x) => '<svg class="ic' + (x ? " " + x : "") + '" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + p + "</svg>";
  const IC = {
    filter: '<path d="M4 6h16M7 12h10M10 18h4"/>', plus: '<path d="M12 5v14M5 12h14"/>', glass: '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/>',
    tag: '<path d="M3.5 12.5V4.5h8l9 9-8 8z"/><circle cx="8" cy="9" r="1.2"/>', pin: '<path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/>',
    layers: '<path d="M12 3.5l9 4.5-9 4.5L3 8z"/><path d="M3 12.5l9 4.5 9-4.5M3 16.5l9 4.5 9-4.5"/>', chev: '<path d="M9 5l7 7-7 7"/>', fold: '<path d="M5 9l7 7 7-7"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>', sparkle: '<path d="M12 3l1.9 5.6L19.5 10.5l-5.6 1.9L12 18l-1.9-5.6L4.5 10.5l5.6-1.9z"/><path d="M19 3v4M17 5h4"/>',
    copy: '<rect x="8" y="8" width="12" height="12" rx="2.5"/><path d="M16 8V6.5A2.5 2.5 0 0 0 13.5 4h-7A2.5 2.5 0 0 0 4 6.5v7A2.5 2.5 0 0 0 6.5 16H8"/>',
    sel: '<rect x="4" y="4" width="16" height="16" rx="4"/><path d="M8 12.5l3 3 5-6"/>', up: '<path d="M12 19V6M6 11l6-6 6 6"/>', down: '<path d="M12 5v13M6 13l6 6 6-6"/>',
    x: '<path d="M6 6l12 12M18 6L6 18"/>', star: '<path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8-5.2-2.8-5.2 2.8 1-5.8L3.5 9.7l5.9-.8z"/>',
    snow: '<path d="M12 3v18M4.2 7.5l15.6 9M19.8 7.5l-15.6 9"/>', branch: '<circle cx="7" cy="6" r="2"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="9" r="2"/><path d="M7 8v8M17 11c0 4-10 2-10 5"/>',
    clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>', basket: '<path d="M4 9h16l-1.6 9.5a2 2 0 0 1-2 1.5H7.6a2 2 0 0 1-2-1.5z"/><path d="M8.5 9l2.5-5M15.5 9L13 4"/>',
    chef: '<path d="M7 14.5a4 4 0 1 1 1.2-7.8 4.2 4.2 0 0 1 7.6 0A4 4 0 1 1 17 14.5V19H7z"/><path d="M7 16.5h10"/>', home: '<path d="M4 11l8-7 8 7v8.5a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z"/>',
    jar: '<path d="M8 4h8v3H8zM7 7h10v12a1.5 1.5 0 0 1-1.5 1.5h-7A1.5 1.5 0 0 1 7 19z"/><path d="M7 12h10"/>', plan: '<rect x="4" y="5.5" width="16" height="14.5" rx="2.5"/><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4"/>',
    book: '<path d="M5 4.5h11a3 3 0 0 1 3 3V20H8a3 3 0 0 1-3-3z"/><path d="M5 17a3 3 0 0 1 3-3h11"/>', cart: '<path d="M3.5 4.5h2.4l2 10.5h9.6l1.8-7.5H7"/><circle cx="9.5" cy="19" r="1.3"/><circle cx="16.5" cy="19" r="1.3"/>',
    mic: '<rect x="9" y="3.5" width="6" height="11" rx="3"/><path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3"/>', swap: '<path d="M4 8h14M14 4l4 4-4 4M20 16H6M10 12l-4 4 4 4"/>',
    undo: '<path d="M9 7L4.5 11.5 9 16M5 11.5h9a5 5 0 0 1 0 10h-2"/>', grip: '<circle cx="9" cy="7" r="1.3"/><circle cx="15" cy="7" r="1.3"/><circle cx="9" cy="12" r="1.3"/><circle cx="15" cy="12" r="1.3"/><circle cx="9" cy="17" r="1.3"/><circle cx="15" cy="17" r="1.3"/>'
  };
  const ic = (n, x) => svg(IC[n], x);
  const LV = { plenty: [3, "plenty", "Plenty"], some: [2, "some", "Some"], low: [1, "low", "Running low"], out: [0, "out", "Out"] };
  const lvIc = (k) => { const l = LV[k]; if (!l) return ""; let s = ""; for (let i = 0; i < 3; i++) s += '<i class="' + (i < l[0] ? "on" : "") + '"></i>'; return '<span class="lv lv-' + l[1] + '" role="img" aria-label="Level: ' + l[2] + '">' + s + "</span>"; };
  const RANK = { out: 0, low: 1, some: 2, plenty: 3 };
  /* the panel under a swiped row: UAT's words and marks only (swipe.js underFor): a minus and "Use one", a tick and "Used up", the cart and "Add to list" */
  const kbHtml = (acts) => '<span class="r-kb" role="group" aria-label="Actions">' + acts.map((a) => '<button type="button" data-a="kb" data-k="' + a[0] + '">' + a[1] + "</button>").join("") + "</span>";
  const underHtml = (home) => '<div class="swipe-under" aria-hidden="true">' + (home ? '<span class="su-rm">Remove</span><span class="su-hide">Don\u2019t remind me</span>' : '<span class="su-one">\u2212 Use one</span><span class="su-all">\u2713 Used up</span>') + '<span class="su-shop">' + ic("cart") + "Add to list</span></div>";

  /* ---------- use-by in short counts (owner, 25 Oct 2026): 1D, 5D ... 1W, 2W, 3W, 1M; a minus sign and a red pill when past ---------- */
  function ub(d) {
    if (d == null) return null;
    const a = Math.abs(d), neg = d < 0;
    const t = a === 0 ? "Today" : a < 7 ? a + "D" : a < 28 ? Math.floor(a / 7) + "W" : Math.max(1, Math.round(a / 30)) + "M";
    const say = neg ? "Past use by " + a + (a === 1 ? " day" : " days") : d === 0 ? "Use today" : "Use within " + a + (a === 1 ? " day" : " days");
    return { t: (neg ? "−" : "") + t, tone: neg ? "danger" : d <= 3 ? "accent" : "mut", say };
  }
  const ubHtml = (d) => { const u = ub(d); return u ? '<span class="ub ub-' + u.tone + '" role="img" aria-label="' + u.say + '">' + u.t + "</span>" : ""; };

  const SORTS = {
    pantry: [["name", "Name", ["A to Z", "Z to A"], ["A–Z", "Z–A"]], ["amt", "Amount", ["Least first", "Most first"], ["Least", "Most"]], ["use", "Use by", ["Soonest first", "Latest first"], ["Use by", "Use by"]], ["added", "Added", ["Newest first", "Oldest first"], ["Added", "Added"]]],
    recipes: [["best", "Best match", ["Ready first, then not cooked lately"], ["Best match"]], ["name", "Name", ["A to Z", "Z to A"], ["A–Z", "Z–A"]], ["time", "Time", ["Quickest first", "Longest first"], ["Time", "Time"]], ["last", "Last cooked", ["Cooked recently", "Not cooked lately"], ["Cooked", "Cooked"]]]
  };
  const num = (a) => { const m = /^\s*([\d.]+)/.exec(a || ""); return m ? parseFloat(m[1]) : 1e9; };
  const CMP = {
    pantry: {
      name: (a, b) => a.name.localeCompare(b.name),
      /* level first (lowest first), then the amount (owner has not confirmed this order) */
      amt: (a, b) => RANK[a.lvl] - RANK[b.lvl] || num(a.amt) - num(b.amt) || a.name.localeCompare(b.name),
      use: (a, b) => (a.days == null ? 1e9 : a.days) - (b.days == null ? 1e9 : b.days) || a.name.localeCompare(b.name),
      added: (a, b) => b.upd - a.upd
    },
    recipes: { best: (a, b) => a.miss - b.miss || a.last - b.last, name: (a, b) => a.name.localeCompare(b.name), time: (a, b) => a.min - b.min, last: (a, b) => a.last - b.last }
  };
  /* Filters are exactly the list-language ones (owner: do not change how filters work in UAT) */
  const STATUS = {
    pantry: [["low", "Running low", (i) => i.low], ["soon", "Expiring soon", (i) => i.days != null && i.days <= 3], ["recent", "Recently added", (i) => i.recent]],
    recipes: [["ready", "Ready now", (r) => r.miss === 0], ["star", "Starred", (r) => r.star], ["freeze", "Freezes", (r) => r.freeze], ["vers", "Has versions", (r) => r.ver > 1]]
  };
  const CHIPS = { recipes: [["all", "All"], ["ready", "Ready now"], ["star", "Starred"], ["batch", "Batch"], ["quick", "Under 30"], ["mine", "Added by me"]] };
  const CHIPTEST = { ready: (r) => r.miss === 0, star: (r) => r.star, batch: (r) => r.batch, quick: (r) => r.min <= 30, mine: (r) => r.mine };
  const reduced = () => !!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);
  /* the jiggle hints that more ideas sit behind Swap, in the first week only (owner, 25 Oct 2026). The build keeps a first-seen date per person; the mockup keeps it per browser. */
  const hintOn = () => { try { const k = "pd.hint.first", n = Date.now(); let f = Number(localStorage.getItem(k)); if (!f) { f = n; localStorage.setItem(k, String(f)); } return n - f < 7 * 864e5; } catch (e) { return true; } };
  const ago = (d) => (d <= 7 ? d + "d ago" : d <= 21 ? Math.round(d / 7) + "w ago" : "a while ago");
  const UNDO_MS = 5000; /* UAT: the bar at the top offers Undo for 5 seconds (swipe.js) */
  const THRESHOLD = 90, DEEP = 190; /* UAT swipe distances */

  function Phone(el, o) {
    this.el = el; this.s = o.s; this.o = o;
    const P = this.s === "pantry";
    this.data = D.pantry.map((i) => Object.assign({}, i));
    this.S = {
      sort: { k: P ? "name" : "best", d: 0 }, group: P ? "cat" : "flat", chip: "all", q: "", search: false, folded: {}, sel: null, sheet: false, menu: false, st: {}, toast: "",
      order: {}, catch: false, seen: false, chips: "tabs", hero: o.hero === "top" ? "top" : "left", hidden: new Set(),
      plan: o.plan || "today", lean: "balanced", basis: false, ready: false, planned: "omelette", onList: new Set(D.home.onList), basisStyle: o.basis || "carousel"
    };
    if (o.group && P) this.S.group = o.group === "loc" ? "loc" : "cat";
    if (o.chip) this.S.chip = o.chip;
    this.draw();
    if (o.state) this.setState(o.state, o);
  }
  const P_ = Phone.prototype;
  P_.custom = function () { const S = this.S, d = this.s === "pantry" ? { k: "name", d: 0 } : { k: "best", d: 0 }; return S.sort.k !== d.k || S.sort.d !== d.d || Object.keys(S.st).some((k) => S.st[k]); };
  P_.chipList = function () {
    if (this.s === "recipes") return CHIPS.recipes.map((c) => ({ id: c[0], label: c[1], n: c[0] === "all" ? D.recipes.length : D.recipes.filter(CHIPTEST[c[0]]).length }));
    const loc = this.S.group === "loc", key = loc ? "loc" : "cat", order = loc ? D.locOrder : D.catOrder;
    const vals = order.filter((v) => this.data.some((i) => i[key] === v));
    return [{ id: "all", label: "All", n: this.data.length }].concat(vals.map((v) => ({ id: v, label: v, n: this.data.filter((i) => i[key] === v).length })));
  };
  P_.changed = function () { return this.data.filter((i) => i.chg); };
  P_.items = function () {
    const S = this.S, q = S.q.trim().toLowerCase(), P = this.s === "pantry";
    let a = P ? this.data.slice() : D.recipes.slice();
    if (P && S.catch) return a.filter((i) => i.chg).sort((x, y) => y.upd - x.upd);
    if (S.chip !== "all") { if (P) { const key = S.group === "loc" ? "loc" : "cat"; a = a.filter((i) => i[key] === S.chip); } else a = a.filter(CHIPTEST[S.chip]); }
    if (q) a = a.filter((i) => i.name.toLowerCase().indexOf(q) > -1 || (P && i.cat.toLowerCase().indexOf(q) > -1));
    const on = STATUS[this.s].filter((t) => S.st[t[0]]);
    if (on.length) a = a.filter((i) => on.some((t) => t[2](i)));
    const f = CMP[this.s][S.sort.k];
    a.sort((x, y) => (S.sort.d ? -1 : 1) * f(x, y));
    return a;
  };
  P_.groups = function (items) {
    const S = this.S, P = this.s === "pantry";
    if (S.catch || this.custom()) return [{ id: "", label: "", items }];
    if (P) {
      const key = S.group === "loc" ? "loc" : "cat", base = S.group === "loc" ? D.locOrder : D.catOrder, ord = S.order[S.group] || base;
      return ord.map((v) => ({ id: v, label: v, items: items.filter((i) => i[key] === v) })).filter((g) => g.items.length);
    }
    return [{ id: "", label: "", items }];
  };

  /* ---------- rows ---------- */
  const fl = (tone, txt, short, prim, icon) => '<span class="fl fl-' + tone + (prim ? " fl--p" : "") + '">' + (icon ? ic(icon) : "") + '<span class="fl-t">' + esc(txt) + "</span></span>";
  P_.rowHtml = function (i) {
    const S = this.S, P = this.s === "pantry", sel = S.sel && S.sel.has(i.id), flat = !S.catch && !this.custom() ? false : true;
    let second, ar, tile, tail;
    const name = esc(i.name);
    if (P) {
      /* the second line carries the other dimension: category when grouped by location, location when grouped by category (owner, 25 Oct) */
      second = flat ? i.cat + " · " + i.loc : S.group === "loc" ? i.cat : i.loc + " · " + i.spot;
      const top = /^Level/.test(i.amt) ? "" : i.amt.split(",")[0];
      tile = '<span class="r-lead" aria-hidden="true">' + (i.e ? "<span>" + i.e + "</span>" : '<span class="r-ltr">' + esc(i.name.charAt(0)) + "</span>") + "</span>";
      tail = '<span class="r-amt"><span class="am-n">' + esc(top) + "</span>" + lvIc(i.lvl) + '</span><span class="r-ub">' + ubHtml(i.days) + "</span>";
      ar = i.name + ", " + (top || "level " + LV[i.lvl][2]) + (i.days != null ? ", " + ub(i.days).say : "");
    } else {
      second = "cooked " + ago(i.last);
      tile = '<span class="r-lead th" aria-hidden="true"><span>' + i.e + "</span></span>";
      const missing = i.miss === 0 ? '<span class="rd rd-ok" role="img" aria-label="All ingredients in">' + ic("check") + "</span>" : '<span class="rd rd-miss" role="img" aria-label="' + i.miss + ' missing">' + i.miss + " missing</span>";
      tail = '<span class="r-amt"><span class="am-n">' + i.min + " min</span></span><span class=\"r-ub\">" + missing + "</span>";
      ar = i.name + ", " + i.min + " min" + (i.miss ? ", " + i.miss + " missing" : ", all in") + (i.star ? ", starred" : "");
    }
    const cue = P && i.recent ? '<span class="cue" role="img" aria-label="Added in the last 24 hours">' + ic("up") + "</span>" : "";
    const star = !P && i.star ? '<span class="nm-star" role="img" aria-label="Starred">' + ic("star") + "</span>" : "";
    const out = P && i.lvl === "out" ? " is-out" : "";
    return '<li class="r' + (sel ? " is-sel" : "") + out + '" data-id="' + i.id + '">' + (P ? underHtml(false) : "") +
      '<button type="button" class="r-main" data-a="row" data-id="' + i.id + '"' + (P ? " data-swipe=\"1\"" : "") + ' aria-label="' + esc(ar) + '"' + (S.sel ? ' aria-pressed="' + !!sel + '"' : "") + ">" +
      '<span class="r-sel" aria-hidden="true">' + (sel ? ic("check") : "") + "</span>" + tile +
      '<span class="r-text"><b class="r-name"><span class="nm">' + name + "</span>" + star + cue + '</b><small class="r-meta">' + esc(second) + "</small></span>" + tail + "</button>" + (P ? kbHtml([["shop", "Add to list"]].concat(useKind(i) === "one" ? [["one", "Use one"]] : []).concat([["all", "Used up"]])) : "") + "</li>";
  };
  P_.bodyHtml = function () {
    const S = this.S, P = this.s === "pantry", items = this.items(), gs = this.groups(items);
    if (!items.length) {
      const q = S.q.trim();
      return '<div class="ll-empty"><p>Nothing matches' + (q ? " “" + esc(q) + "”" : "") + ".</p>" + (P ? '<div class="ll-empty-acts"><button type="button" class="btn pri" data-a="toast" data-t="Add item opens with “' + esc(q) + '” filled in">Add as a new item</button><button type="button" class="btn" data-a="toast" data-t="Added to the shopping list">Add to shopping list</button></div>' : '<div class="ll-empty-acts"><button type="button" class="btn pri" data-a="toast" data-t="Opens your AI app">Ask your assistant to add one</button></div>') + "</div>";
    }
    let h = "";
    if (P && S.catch) h += '<div class="ca-band"><span>Since ' + esc(D.lastSeen) + "</span><button type=\"button\" data-a=\"caughtup\">Clear</button></div>";
    else if (P && !S.seen && !this.custom() && S.chip === "all" && !S.q) h += '<div class="ca-div"><span>You were here on ' + esc(D.lastSeen) + '</span><button type="button" data-a="catch">' + this.changed().length + " new</button></div>";
    const allShut = gs.length > 0 && gs[0].id !== "" && gs.every((g) => S.folded[g.id]);
    this._allShut = allShut;
    return h + gs.map((g) => {
      if (!g.id && !g.label) return '<ul class="rows">' + g.items.map((i) => this.rowHtml(i)).join("") + "</ul>";
      const shut = !!S.folded[g.id], nr = g.items.filter((i) => i.recent).length, np = S.sel ? g.items.filter((i) => S.sel.has(i.id)).length : 0;
      return '<section class="g' + (shut ? " shut" : "") + '" data-g="' + esc(g.id) + '"><button type="button" class="g-h" data-a="fold" data-g="' + esc(g.id) + '" aria-expanded="' + !shut + '"><span class="g-grip" aria-hidden="true">' + ic("grip") + "</span><h2>" + esc(g.label) + '</h2><small class="g-n">' + g.items.length + "</small>" +
        (np ? '<span class="g-pick" role="img" aria-label="' + np + ' picked">' + ic("check") + np + "</span>" : "") + (nr ? '<span class="g-new" role="img" aria-label="' + nr + ' added in the last 24 hours">' + ic("up") + nr + "</span>" : "") + '<span class="g-fold">' + ic("fold") + '</span></button><ul class="rows">' + g.items.map((i) => this.rowHtml(i)).join("") + "</ul></section>";
    }).join("");
  };

  /* ---------- chrome ---------- */
  const sortLabel = (s, k, d, short) => { const t = SORTS[s].filter((x) => x[0] === k)[0]; return short ? t[3][d] || t[3][0] : t[2][d] || t[2][0]; };
  P_.topHtml = function () {
    const S = this.S, P = this.s === "pantry", nst = Object.keys(S.st).filter((k) => S.st[k]).length;
    const add = P ? '<button type="button" class="tp-add" data-a="add" aria-label="Add an item">' + ic("plus") + "</button>" : '<button type="button" class="tp-add ask" data-a="ask" aria-label="Ask your assistant (opens your AI app)">' + ic("sparkle") + "</button>";
    return '<header class="ll-top"><div class="tp-rest"><button type="button" class="tp-filters" data-a="sheet" aria-haspopup="dialog">' + ic("filter") + "<span>Filters</span>" + (nst ? '<i class="tp-n">' + nst + "</i>" : "") + '</button><span class="tp-sp"></span>' + add +
      '<button type="button" class="tp-find" data-a="search" aria-label="Search ' + (P ? "the pantry" : "recipes") + '">' + ic("glass") + "</button></div>" +
      '<div class="tp-search"><button type="button" class="tp-x" data-a="closesearch" aria-label="Close search">' + ic("x") + '</button><label class="tp-field">' + ic("glass") + '<span class="vh">Search</span><input type="search" class="tp-q" placeholder="' + (P ? "Search the pantry" : "Search recipes or ingredients") + '" autocomplete="off" value="' + esc(S.q) + '"></label><button type="button" class="tp-mic" aria-label="Speak your search">' + ic("mic") + "</button></div></header>";
  };
  P_.chipsHtml = function () {
    const S = this.S, P = this.s === "pantry", cl = this.chipList();
    const mi = P ? (S.group === "loc" ? "pin" : "tag") : "layers", ml = P ? (S.group === "loc" ? "Showing locations. Switch to categories" : "Showing categories. Switch to locations") : "Recipe filters";
    const lead = () => "";
    return '<div class="ll-chips"><button type="button" class="ch-mode" data-a="mode" aria-label="' + ml + '" title="' + ml + '"' + (P ? "" : " disabled") + ">" + ic(mi) + '</button><div class="ch-scroll" role="group" aria-label="' + (P ? (S.group === "loc" ? "Location" : "Category") : "Show") + '">' +
      cl.map((c) => '<button type="button" class="ch" data-a="chip" data-c="' + esc(c.id) + '" aria-pressed="' + (S.chip === c.id) + '"><span>' + lead(c) + esc(c.label) + "<i>" + c.n + "</i></span></button>").join("") + "</div></div>";
  };
  P_.cvHtml = function () {
    if (!this.custom()) return "";
    const S = this.S, pills = [];
    if (S.sort.k !== (this.s === "pantry" ? "name" : "best") || S.sort.d) pills.push(["sort", sortLabel(this.s, S.sort.k, S.sort.d)]);
    STATUS[this.s].forEach((t) => { if (S.st[t[0]]) pills.push([t[0], t[1]]); });
    return '<div class="ll-cv"><span class="cv-t">Custom view</span><div class="cv-pills">' + pills.map((p) => '<button type="button" class="cv-p" data-a="rm" data-k="' + p[0] + '" aria-label="Remove ' + esc(p[1]) + '">' + esc(p[1]) + ic("x") + "</button>").join("") + '</div><button type="button" class="cv-clear" data-a="clear">Clear</button></div>';
  };
  P_.headHtml = function () {
    const S = this.S, P = this.s === "pantry";
    const col = (k, t, cls) => { const on = S.sort.k === k; return '<button type="button" class="hd ' + cls + '" data-a="sorthd" data-k="' + k + '" aria-label="Sort by ' + t + (on ? ", " + (S.sort.d ? "descending" : "ascending") : "") + '"><span>' + t + "</span>" + (on ? ic(S.sort.d ? "down" : "up", "dir") : "") + "</button>"; };
    return '<div class="ll-colhead"><button type="button" class="hd hd-sel" data-a="select" aria-pressed="' + !!S.sel + '" aria-label="' + (S.sel ? "Cancel picking" : "Pick several") + '">' + ic(S.sel ? "x" : "sel") + "</button>" + col("name", "Name", "hd-name") + (P ? col("amt", "Amount", "hd-amt") + col("use", "Use by", "hd-flag") : col("time", "Time", "hd-amt") + col("best", "Ready", "hd-flag")) + "</div>";
  };
  const TABS = [["Home", "home"], ["Pantry", "jar"], ["Plan", "plan"], ["Recipes", "book"], ["Shopping", "cart"]];
  P_.tabsHtml = function (cur) {
    return '<nav class="ll-tabs" aria-label="Main">' + TABS.map((t) => '<a href="#" data-a="tab" class="' + (t[0].toLowerCase() === cur ? "on" : "") + '"' + (t[0].toLowerCase() === cur ? ' aria-current="page"' : "") + ">" + ic(t[1]) + "<span>" + t[0] + "</span>" + (t[0] === "Shopping" ? '<i class="badge" aria-label="' + D.badge + ' on the list">' + D.badge + "</i>" : "") + "</a>").join("") + "</nav>";
  };
  /* The bar takes the tab bar's place while picking. Icons only (owner, 25 Oct 2026): cart = add to list, copy, tick = Done. Nothing clears until Done or Cancel. */
  P_.selbarHtml = function () {
    const n = this.S.sel ? this.S.sel.size : 0;
    const b = (a, icn, label) => '<button type="button" class="sb-a" data-a="selact" data-t="' + a + '" aria-label="' + label + '"' + (n ? "" : " disabled") + ">" + ic(icn) + "</button>";
    return '<div class="ll-selbar" role="toolbar" aria-label="Picked items"><span class="sb-n" aria-live="polite">' + n + '</span>' + b("cart", "cart", "Add to list") + b("copy", "copy", "Copy") + '<button type="button" class="sb-done" data-a="done" aria-label="Done, clear the picks">' + ic("check") + "</button></div>";
  };
  P_.sheetHtml = function () {
    const S = this.S, P = this.s === "pantry", n = this.items().length, sorts = SORTS[this.s];
    return '<div class="ll-scrim" data-a="sheet"></div><div class="ll-sheet" role="dialog" aria-modal="true" aria-label="Filters"><div class="sh-grab" aria-hidden="true"></div><div class="sh-h"><h2>Filters</h2><button type="button" class="sh-x" data-a="sheet" aria-label="Close">' + ic("x") + "</button></div>" +
      '<h3 class="sh-l">Sort</h3><div class="sh-row"><div class="sh-seg" role="radiogroup" aria-label="Sort by">' + sorts.map((t) => '<button type="button" role="radio" aria-checked="' + (S.sort.k === t[0]) + '" data-a="sortk" data-k="' + t[0] + '"><span>' + t[1] + "</span></button>").join("") + "</div>" +
      (S.sort.k !== "best" ? '<button type="button" class="sh-dir" data-a="dir" aria-label="Reverse the order">' + ic(S.sort.d ? "down" : "up") + "<span>" + esc(sortLabel(this.s, S.sort.k, S.sort.d)) + "</span></button>" : "") + "</div>" +
      '<h3 class="sh-l">Show</h3><div class="sh-st">' + STATUS[this.s].map((t) => '<button type="button" class="sh-p" data-a="st" data-k="' + t[0] + '" aria-pressed="' + !!S.st[t[0]] + '"><span class="sh-box">' + (S.st[t[0]] ? ic("check") : "") + "</span><span>" + t[1] + "</span></button>").join("") + "</div>" +
      '<div class="sh-f"><button type="button" class="btn" data-a="clear">Clear</button><button type="button" class="btn pri" data-a="sheet">' + (n ? "Show " + n + (P ? " items" : " recipes") : "No items match") + "</button></div></div>";
  };

  /* ---------- Home: B's hero card (one surface), On the way out as a carousel, Running low as a list ---------- */
  const pItem = (id) => D.pantry.filter((i) => i.id === id)[0], rItem = (id) => D.recipes.filter((r) => r.id === id)[0];
  P_.idea = function () { return rItem(this.S.lean === "balanced" && this.S.plan !== "none" && this.S.planned ? this.S.planned : D.leanIdea[this.S.lean]) || rItem("omelette"); };
  P_.actsHtml = function () {
    const S = this.S, plan = S.plan, sw = (acc) => '<button type="button" class="hb sw' + (acc ? " acc" : "") + '" data-a="swap" aria-label="Swap, try something else" aria-expanded="' + S.basis + '">' + ic("swap") + '<span class="hb-l">Swap</span></button>';
    const mk = (acc) => '<button type="button" class="hb mk' + (acc ? " acc" : "") + '" data-a="makeit" aria-label="Make it">' + ic("chef") + '<span class="hb-l">Make it</span></button>';
    const ap = '<button type="button" class="hb ap acc" data-a="addplan">' + ic("plan") + '<span class="hb-l">Add to plan</span></button>';
    const cf = '<button type="button" class="hb cf' + (S.ready ? " acc" : "") + '" data-a="confirm"' + (S.ready ? "" : " disabled") + ">" + ic("check") + '<span class="hb-l">Confirm</span></button>';
    if (S.basis) return cf + (plan === "today" ? mk(false) : "") + '<button type="button" class="hb sw" data-a="swap" aria-label="Close ideas">' + ic("x") + "</button>";
    if (plan === "today") return mk(true) + sw(false);
    if (plan === "other") return sw(true);
    return ap + mk(false);
  };
  P_.basisHtml = function () {
    const S = this.S, st = S.basisStyle, L = D.leans, cur = S.lean;
    const items = L.map((l) => '<button type="button" class="bs-i" role="radio" data-a="lean" data-l="' + l[0] + '" aria-checked="' + (cur === l[0]) + '" aria-selected="' + (cur === l[0]) + '" tabindex="' + (cur === l[0] ? 0 : -1) + '">' + esc(l[1]) + "</button>").join("");
    if (st === "chips") return '<div class="bs bs-chips" role="radiogroup" aria-label="Based on">' + items + "</div>";
    return '<div class="bs bs-' + st + '" role="radiogroup" aria-label="Based on"><div class="bs-track">' + items + '</div></div>';
  };
  P_.heroMeta = function (i) { const inf = (D.ideaInfo || {})[i.id] || {}; return i.min + " min \u00b7 " + (i.miss ? i.miss + " missing" + (inf.miss && inf.miss.length ? ": " + inf.miss.join(", ") : "") : "all in"); };
  P_.heroHtml = function () {
    const S = this.S, idea = this.idea(), plan = S.plan, inf = (D.ideaInfo || {})[idea.id] || {};
    return '<section class="hm-hero hero-' + S.hero + '" id="hero"><div class="hm-top"><span class="r-lead th" aria-hidden="true"><span id="hi-e">' + idea.e + '</span></span><div class="hm-it"><span class="hm-k">' + (S.basis ? "Trying" : plan === "other" ? "Planned Saturday" : plan === "today" ? "Tonight, planned" : "Tonight") + '</span><b id="hi-n">' + esc(idea.name) + '</b><small id="hi-m">' + esc(this.heroMeta(idea)) + '</small><span class="hm-why" id="hi-w">' + esc(inf.why || "") + '</span></div></div>' +
      '<div class="hm-based" id="based"' + (S.basis ? "" : " hidden") + '><span class="bs-k">Based on</span><div id="basis"></div></div><div class="hm-acts" id="acts">' + this.actsHtml() + "</div></section>";
  };
  P_.outHtml = function () {
    const cards = D.home.out.map(pItem).map((i) => {
      const auto = D.home.override.indexOf(i.id) < 0, q = /^Level/.test(i.amt) ? "" : i.amt.split(",")[0];
      return '<li class="oc"><button type="button" class="oc-b" data-a="toast" data-t="Opens ' + esc(i.name) + '"><span class="oc-e" aria-hidden="true">' + (i.e || '<span class="r-ltr">' + esc(i.name.charAt(0)) + "</span>") + '</span><span class="oc-t"><span class="oc-1"><b>' + esc(i.name) + "</b>" + ubHtml(i.days) + '</span><span class="oc-2"><small>' + esc(i.spot) + '</small><span class="oc-q">' + (auto ? esc(q) : lvIc(i.lvl)) + "</span></span></span></button></li>";
    }).join("");
    return '<ul class="oc-track">' + cards + "</ul>";
  };
  P_.lowHtml = function () {
    const list = D.home.low.filter((id) => !this.S.hidden.has(id)); if (!list.length) return "";
    return '<ul class="rows hm-low-rows">' + list.map(pItem).map((i) => {
      const on = this.S.onList.has(i.id), q = /^Level/.test(i.amt) ? "" : i.amt.split(",")[0];
      return '<li class="r lw" data-id="' + i.id + '">' + underHtml(true) + "<button type=\"button\" class=\"r-main\" data-swipe=\"1\" data-home=\"1\" data-a=\"toast\" data-t=\"Opens " + esc(i.name) + "\" aria-label=\"" + esc(i.name) + ", " + esc(q) + (on ? ", on the shopping list" : ", not on the list") + '"><span class="r-lead" aria-hidden="true"><span>' + (i.e || '<span class="r-ltr">' + esc(i.name.charAt(0)) + "</span>") + '</span></span><span class="r-text"><b class="r-name"><span class="nm">' + esc(i.name) + '</span></b></span><span class="lw-q">' + esc(q) + '</span><span class="lw-c' + (on ? " on" : "") + '" role="img" aria-label="' + (on ? "On the shopping list" : "Not on the list") + '">' + ic("cart") + "</span></button>" + kbHtml(on ? [["rm", "Remove from list"]] : [["shop", "Add to list"], ["hide", "Don\u2019t remind me"]]) + "</li>";
    }).join("") + "</ul>";
  };
  P_.homeHtml = function () {
    const sec = (cls, icn, t, body) => body ? '<section class="hm-sec ' + cls + '"><div class="hm-h"><span class="hm-i">' + ic(icn) + "</span><h2>" + t + "</h2></div>" + body + "</section>" : "";
    return '<div class="hm"><h1 class="hm-hi">Good evening, ' + esc(D.me) + ".</h1>" + this.heroHtml() + sec("hm-out", "clock", "On the way out", this.outHtml()) + sec("hm-low", "basket", "Running low", this.lowHtml()) + "</div>";
  };

  /* ---------- draw ---------- */
  const dsel = (d) => { let q = '[data-a="' + d.a + '"]'; ["k", "id", "g", "c", "l", "t"].forEach((x) => { if (d[x] != null) q += "[data-" + x + '="' + String(d[x]).replace(/"/g, '\\"') + '"]'; }); return q; };
  P_.draw = function () {
    const S = this.S, keep = this.el.querySelector(".ll-body"), top = keep ? keep.scrollTop : 0, oct = this.el.querySelector(".oc-track"), ocl = oct ? oct.scrollLeft : 0;
    const ae = document.activeElement, had = ae && this.el.contains(ae) && ae.dataset && ae.dataset.a ? Object.assign({}, ae.dataset) : null, wasSheet = !!this._sheetWas;
    const cur = this.s;
    let h;
    if (this.s === "home") h = '<div class="ll-body" tabindex="-1">' + this.homeHtml() + '<div class="ll-end"></div></div>' + this.tabsHtml(cur);
    else h = this.topHtml() + this.chipsHtml() + this.cvHtml() + this.headHtml() + '<div class="ll-body" tabindex="-1">' + this.bodyHtml() + '<div class="ll-end"></div></div>' + (S.sel ? this.selbarHtml() : this.tabsHtml(cur)) + (S.sheet ? this.sheetHtml() : "");
    this.el.innerHTML = h + '<div class="ll-undo" role="status" aria-live="polite" hidden></div><div class="ll-toast" role="status" aria-live="polite"></div>';
    const d = this.el.dataset;
    d.search = S.search ? "1" : "0"; d.sel = S.sel ? "1" : "0"; d.custom = this.custom() ? "1" : "0"; d.v = "d"; d.s = this.s; d.chips = S.chips; d.shut = this._allShut ? "1" : "0";
    const b = this.el.querySelector(".ll-body"); if (b) b.scrollTop = top;
    const oc2 = this.el.querySelector(".oc-track"); if (oc2 && ocl) oc2.scrollLeft = ocl;
    if (S.search) { const q = this.el.querySelector(".tp-q"); if (q) { q.focus({ preventScroll: true }); try { q.setSelectionRange(q.value.length, q.value.length); } catch (e) {} } }
    if (this.s === "home" && S.basis) this.mountBasis(false);
    this._sheetWas = S.sheet;
    /* a redraw must not drop keyboard focus: open the sheet onto its close button, give focus back to the control that opened it, else to the same control */
    if (S.sheet && !wasSheet) { const x = this.el.querySelector(".sh-x"); if (x) x.focus({ preventScroll: true }); }
    else if (!S.sheet && wasSheet) { const f = this.el.querySelector(".tp-filters"); if (f) f.focus({ preventScroll: true }); }
    else if (had && !S.search) { const t = this.el.querySelector(dsel(had)); if (t) t.focus({ preventScroll: true }); }
    const cp = this.el.querySelector('.ch[aria-pressed="true"]'); if (cp && cp.scrollIntoView) { try { cp.scrollIntoView({ inline: "nearest", block: "nearest" }); } catch (e) {} }
  };
  P_.redrawList = function () { const b = this.el.querySelector(".ll-body"); if (!b) return; b.innerHTML = this.bodyHtml() + '<div class="ll-end"></div>'; this.el.dataset.shut = this._allShut ? "1" : "0"; };
  P_.say = function (t, undo) {
    const el = this.el.querySelector(".ll-toast"); if (!el) return;
    el.innerHTML = esc(t) + (undo ? ' <button type="button" class="tu" data-a="undo">' + ic("undo") + "Undo</button>" : "");
    el.classList.add("on"); el.classList.toggle("has-undo", !!undo); this._undo = undo || null;
    clearTimeout(this._t); this._t = setTimeout(() => { el.classList.remove("on"); this._undo = null; }, undo ? UNDO_MS : 1800);
  };
  P_.setState = function (name, o) {
    const S = this.S; o = o || {};
    if (name === "search") { S.search = true; S.q = o.q || ""; }
    if (name === "select") S.sel = new Set(o.pick ? o.pick.split(",") : []);
    if (name === "filters") S.sheet = true;
    if (name === "sorted") S.sort = { k: "amt", d: 0 };
    if (name === "collapsed") this.data.length && this.groups(this.items()).forEach((g) => { S.folded[g.id] = true; });
    if (name === "catch") S.catch = true;
    if (name === "swap") { S.basis = true; }
    if (o.group) S.group = o.group;
    if (o.chip) S.chip = o.chip;
    this.draw();
  };

  /* ---------- Home: the basis strip ---------- */
  P_.mountBasis = function (animate) {
    const host = this.el.querySelector("#basis"), box = this.el.querySelector("#based"); if (!host) return;
    box.hidden = false; host.innerHTML = this.basisHtml();
    const tr = host.querySelector(".bs-track"); if (!tr) return;
    const on = tr.querySelector('[aria-selected="true"]'); if (on) tr.scrollLeft = on.offsetLeft - (tr.clientWidth - on.offsetWidth) / 2;
    let t = 0; const self = this;
    tr.addEventListener("scroll", () => { clearTimeout(t); t = setTimeout(() => {
      const mid = tr.scrollLeft + tr.clientWidth / 2; let best = null, bd = 1e9;
      [].forEach.call(tr.children, (c) => { const d = Math.abs(c.offsetLeft + c.offsetWidth / 2 - mid); if (d < bd) { bd = d; best = c; } });
      if (best && best.dataset.l !== self.S.lean) self.setLean(best.dataset.l, true);
    }, 110); }, { passive: true });
    if (animate && !reduced() && this.o.hint !== "0" && hintOn()) { tr.classList.add("jig"); setTimeout(() => tr.classList.remove("jig"), 1500); }
  };
  P_.setLean = function (l, fromScroll) {
    const S = this.S; S.lean = l; S.ready = false; clearTimeout(this._cf);
    this.heroPatch();
    this.el.querySelectorAll(".bs-i").forEach((b) => { const on = b.dataset.l === l; b.setAttribute("aria-selected", String(on)); b.setAttribute("aria-checked", String(on)); b.tabIndex = on ? 0 : -1; });
    if (!fromScroll) { const b = this.el.querySelector('.bs-i[data-l="' + l + '"]'), tr = this.el.querySelector(".bs-track"); if (b && tr) tr.scrollTo({ left: b.offsetLeft - (tr.clientWidth - b.offsetWidth) / 2, behavior: reduced() ? "auto" : "smooth" }); }
    /* nothing locks in on its own: after 3 seconds of no movement, Confirm lights up and waits for a tap */
    this._cf = setTimeout(() => { S.ready = true; this.actsPatch(); }, 3000);
  };
  P_.heroPatch = function () {
    const i = this.idea(), q = (s) => this.el.querySelector(s);
    if (q("#hi-e")) q("#hi-e").textContent = i.e; if (q("#hi-n")) q("#hi-n").textContent = i.name; if (q("#hi-m")) q("#hi-m").textContent = this.heroMeta(i); if (q("#hi-w")) q("#hi-w").textContent = ((D.ideaInfo || {})[i.id] || {}).why || "";
    this.actsPatch();
  };
  P_.actsPatch = function () { const a = this.el.querySelector("#acts"); if (a) a.innerHTML = this.actsHtml(); };

  /* ---------- actions ---------- */
  const A = {
    row(p, t) {
      if (p._swallow) return; const S = p.S, id = t.dataset.id;
      if (S.sel) { if (S.sel.has(id)) S.sel.delete(id); else S.sel.add(id); p.draw(); return; }
      p.say(p.s === "pantry" ? "Opens the item sheet (unchanged)" : "Opens the recipe page (unchanged)");
    },
    fold(p, t) { if (p._swallow) return; const g = t.dataset.g; p.S.folded[g] = !p.S.folded[g]; p.draw(); },
    sheet(p) { p.S.sheet = !p.S.sheet; p.draw(); },
    select(p) { p.S.sel = p.S.sel ? null : new Set(); p.draw(); },
    /* an action leaves the picks as they are (owner, 25 Oct 2026); only Done or Cancel clears them */
    selact(p, t) { const n = p.S.sel.size, w = t.dataset.t; p.say((w === "cart" ? "Added to the list: " : "Copied: ") + n + (n === 1 ? " item" : " items")); },
    done(p) { p.S.sel = null; p.draw(); },
    search(p) { p.S.search = true; p.draw(); },
    closesearch(p) { p.S.search = false; p.S.q = ""; p.draw(); },
    chip(p, t) { p.S.chip = t.dataset.c; p.draw(); },
    mode(p) { const S = p.S; if (p.s === "pantry") { S.group = S.group === "loc" ? "cat" : "loc"; S.chip = "all"; p.draw(); } },
    sortk(p, t) { const S = p.S; S.catch = false; if (S.sort.k === t.dataset.k) S.sort.d = S.sort.d ? 0 : 1; else S.sort = { k: t.dataset.k, d: 0 }; p.draw(); },
    sorthd(p, t) { A.sortk(p, t); },
    dir(p) { p.S.sort.d = p.S.sort.d ? 0 : 1; p.draw(); },
    st(p, t) { const k = t.dataset.k; p.S.st[k] = !p.S.st[k]; p.draw(); },
    rm(p, t) { const k = t.dataset.k; if (k === "sort") p.S.sort = { k: p.s === "pantry" ? "name" : "best", d: 0 }; else p.S.st[k] = false; p.draw(); },
    clear(p) { p.S.st = {}; p.S.sort = { k: p.s === "pantry" ? "name" : "best", d: 0 }; p.draw(); },
    add(p) { p.say("Add item opens (receipt scan lives inside it)"); },
    ask(p) { p.say("Opens your AI app"); },
    tab(p, t) { p.say("Goes to " + t.textContent.replace(/\d+$/, "").trim()); },
    toast(p, t) { if (p._swallow) return; p.say(t.dataset.t); },
    catch(p) { p.S.catch = true; p.draw(); },
    caughtup(p) { p.S.catch = false; p.S.seen = true; p.draw(); },
    undo(p) { const u = p._undo; p._undo = null; if (u) u(); },
    kb(p, t) { const row = t.closest(".r").querySelector(".r-main"); p.swDo(row, t.dataset.k); },
    ubar(p) { const u = p._ubar; p._ubar = null; clearTimeout(p._ut); if (u) { u(); p.undoBar("Undone"); } },
    /* Home */
    swap(p) { const S = p.S; S.basis = !S.basis; S.ready = false; clearTimeout(p._cf); const box = p.el.querySelector("#based"); if (S.basis) { p.mountBasis(true); p.actsPatch(); p.setLean(S.lean, true); } else { box.hidden = true; p.actsPatch(); } },
    lean(p, t) { p.setLean(t.dataset.l); },
    confirm(p) { const S = p.S, i = p.idea(), prev = { planned: S.planned, plan: S.plan, lean: S.lean }; S.planned = i.id; S.basis = false; S.ready = false; clearTimeout(p._cf); p.draw(); p.say((S.plan === "other" ? "Saturday: " : "Tonight: ") + i.name, () => { Object.assign(S, prev); p.draw(); }); },
    makeit(p) { const S = p.S; if (S.basis) { const i = p.idea(); S.planned = i.id; S.basis = false; S.ready = false; clearTimeout(p._cf); p.draw(); } p.say("Starts Make it"); },
    addplan(p) { const S = p.S; S.plan = "today"; S.planned = p.idea().id; p.draw(); p.say("Added to tonight", () => { S.plan = "none"; p.draw(); }); }
  };

  /* Swipe: UAT's, copied (swipe.js d14049a). Pantry rows: right 90px = add to list; left 90px = use one (used up when it cannot step down); left 190px = used up.
     Home Running low rows (owner, 25 Oct 2026): right 90px = add (only when NOT on the list); right 190px = don't remind me; left = remove (only when ON the list). Works while picking. */
  /* "Use one", UAT's rule (quantity.ts useOne / useAfter, server/config/unit-rules.json): an exact amount comes down one configured step (g and mL 50, kg and L 0.25, packs 1); when that is all there is, it is used up.
     Free text keeps the old rule (reduce.ts): "3 tubs" becomes "2 tubs", "1 tub" is used up. */
  const STEP = { g: 50, kg: 0.25, ml: 50, l: 0.25, pack: 1, tin: 1, jar: 1, bottle: 1, bag: 1, box: 1, carton: 1, bunch: 1, roll: 1 };
  const useStep = (d) => {
    const a = ((d && d.amt) || "").trim(), m = /^(\d+(?:\.\d+)?)\s*([A-Za-z]*)\b(.*)$/.exec(a); if (!m) return { kind: "all" };
    const n = Number(m[1]), u = m[2], key = u.toLowerCase().replace(/s$/, ""), step = STEP[u.toLowerCase()] || STEP[key];
    if (step) { if (n <= step) return { kind: "all" }; const left = Math.round((n - step) * 1000) / 1000; return { kind: "one", left: left + " " + u + (m[3] || "") }; }
    const f = /^(\d{1,4})(?=$|\s)([\s\S]*)$/.exec(a); if (!f || Number(f[1]) < 2) return { kind: "all" };
    return { kind: "one", left: (Number(f[1]) - 1) + f[2] };
  };
  const useKind = (d) => useStep(d).kind;
  const memory = () => { try { return JSON.parse(localStorage.getItem("kitchie.swipe") || "{}") || {}; } catch (e) { return {}; } };
  const remember = (k) => { try { const m = memory(); m[k] = (m[k] || 0) + 1; localStorage.setItem("kitchie.swipe", JSON.stringify(m)); } catch (e) {} };
  P_.swBlocked = function (row, dx) { if (!row.dataset.home) return false; const on = this.S.onList.has(row.closest(".r").dataset.id); return on ? dx > 0 : dx < 0; };
  P_.swLimit = function (row, dx) { return this.swBlocked(row, dx) ? 0 : dx; };
  P_.swAction = function (row, dx) {
    const id = row.closest(".r").dataset.id;
    if (row.dataset.home) { if (this.S.onList.has(id)) return dx <= -THRESHOLD ? "rm" : ""; return dx >= DEEP ? "hide" : dx >= THRESHOLD ? "shop" : ""; }
    if (dx >= THRESHOLD) return "shop"; if (dx <= -DEEP) return "all";
    if (dx <= -THRESHOLD) return useKind(this.data.filter((x) => x.id === id)[0]) === "all" ? "all" : "one";
    return "";
  };
  P_.swPaint = function (row, raw) {
    const li = row.closest(".r"), un = li.querySelector(".swipe-under"), blocked = this.swBlocked(row, raw), dx = this.swLimit(row, raw), act = this.swAction(row, dx);
    if (blocked) { /* nothing to do this way: the row only gives a little, then holds */ row.style.transform = "translateX(" + Math.sign(raw) * Math.min(8, Math.abs(raw) / 8) + "px)"; return; }
    const kind = row.dataset.home ? "" : useKind(this.data.filter((x) => x.id === li.dataset.id)[0]);
    li.setAttribute("data-dragging", "");
    un.dataset.dir = act || (dx > 0 ? "shop" : row.dataset.home ? "rm" : kind === "all" ? "all" : "one");
    un.dataset.armed = act ? "yes" : ""; un.style.opacity = String(Math.min(1, Math.abs(dx) / THRESHOLD));
    row.style.transform = "translateX(" + Math.max(-240, Math.min(160, dx)) + "px)";
    if (act) li.setAttribute("data-swipe-now", act); else li.removeAttribute("data-swipe-now");
    if (act && act !== this._stage && navigator.vibrate) { try { navigator.vibrate(act === "all" || act === "hide" ? 14 : 8); } catch (e) {} }
    this._stage = act;
  };
  P_.swClear = function (row) {
    const li = row.closest(".r"); if (!li) return; const un = li.querySelector(".swipe-under");
    row.classList.remove("snap"); row.style.transform = ""; row.style.opacity = ""; li.removeAttribute("data-dragging"); li.removeAttribute("data-swipe-now");
    if (un) { un.style.opacity = ""; un.dataset.dir = ""; un.dataset.armed = ""; } this._stage = "";
  };
  P_.swSettle = function (row, to, then) {
    if (reduced()) { row.style.transform = to || ""; this.swClear(row); if (then) then(); return; }
    row.classList.add("snap"); row.style.transform = to || "";
    setTimeout(() => { this.swClear(row); if (then) then(); }, 220);
  };
  P_.swEnd = function (row, raw) {
    const dx = this.swLimit(row, raw), act = this.swAction(row, dx), p = this;
    if (!act) { this.swSettle(row, "", null); return; }
    remember("swipes");
    if (act === "shop" || act === "rm" || act === "one") { this.swSettle(row, "", () => p.swDo(row, act)); return; }
    /* used up / hidden: the row leaves, then the change is made */
    if (reduced()) { this.swClear(row); this.swDo(row, act); return; }
    row.classList.add("snap"); row.style.transform = "translateX(" + (act === "hide" ? "110%" : "-110%") + ")"; row.style.opacity = "0";
    setTimeout(() => { p.swClear(row); p.swDo(row, act); }, 180);
  };
  P_.swDo = function (row, act) {
    const li = row.closest(".r"), id = li.dataset.id, it = pItem(id), S = this.S;
    if (row.dataset.home) {
      const on = S.onList, nm = it.name;
      if (act === "shop") { on.add(id); this.draw(); this.undoBar(nm + " added to your list", () => { on.delete(id); this.draw(); }); }
      else if (act === "rm") { on.delete(id); this.draw(); this.undoBar(nm + " taken off your list", () => { on.add(id); this.draw(); }); }
      else if (act === "hide") { S.hidden.add(id); this.draw(); this.undoBar(nm + " hidden until it changes", () => { S.hidden.delete(id); this.draw(); }); }
      return;
    }
    const d = this.data.filter((x) => x.id === id)[0]; if (!d) return;
    if (act === "shop") { const L = S.listed || (S.listed = new Set()); if (L.has(id)) { this.undoBar(d.name + " is already on your list"); return; } L.add(id); this.undoBar(d.name + " added to your list", () => { L.delete(id); }); return; }
    const prev = { amt: d.amt, lvl: d.lvl, low: d.low }, lname = d.name.toLowerCase();
    if (act === "all") { d.lvl = "out"; d.amt = "0"; this.draw(); this.undoBar(lname + " used up", () => { Object.assign(d, prev); this.draw(); }); }
    else { const left = useStep(d).left; d.amt = left; this.draw(); this.undoBar(lname + ": " + left + " left", () => { Object.assign(d, prev); this.draw(); }); }
  };
  /* UAT's Undo bar: at the top of the screen, 5 seconds; "Undone" for 3 */
  P_.undoBar = function (t, undo) {
    const el = this.el.querySelector(".ll-undo"); if (!el) return;
    clearTimeout(this._ut); el.innerHTML = '<span class="u-t"></span>' + (undo ? '<button type="button" data-a="ubar">Undo</button>' : ""); el.firstChild.textContent = t;
    el.hidden = false; this._ubar = undo || null;
    this._ut = setTimeout(() => { el.hidden = true; this._ubar = null; }, undo ? UNDO_MS : 3000);
  };
  /* UAT's nudge: after a pause, the row nearest the middle moves a little each way once per visit, at most four visits, never after three real swipes */
  P_.nudge = function () {
    if (this.s !== "pantry" || this.o.hint === "0" || reduced() || this.S.sel || this.S.sheet || this._nudged || this._down) return;
    const m = memory(); if ((m.swipes || 0) >= 3 || (m.hints || 0) >= 4) return;
    const body = this.el.querySelector(".ll-body"); if (!body) return; const br = body.getBoundingClientRect(), mid = br.top + br.height * 0.45; let best = null, bd = 1e9;
    [].forEach.call(this.el.querySelectorAll(".r-main[data-swipe]"), (r) => { const q = r.getBoundingClientRect(); if (q.height === 0 || q.top < br.top + 20 || q.bottom > br.bottom - 20) return; const d = Math.abs(q.top + q.height / 2 - mid); if (d < bd) { bd = d; best = r; } });
    if (!best) return; this._nudged = true; remember("hints");
    const steps = [[-46, 260], [46, 420], [0, 300]], p = this; let n = 0;
    (function next() {
      if (p._down || !best.isConnected) { if (best.isConnected) p.swClear(best); return; }
      if (n === steps.length) { p.swSettle(best, "", null); return; }
      const s = steps[n++]; best.classList.add("snap"); p.swPaint(best, s[0] * 1.2); best.style.transform = "translateX(" + s[0] + "px)"; setTimeout(next, s[1]);
    })();
  };
  P_.longHold = function (g) {
    const S = this.S, secs = [].slice.call(this.el.querySelectorAll(".g"));
    if (!secs.length) return; g.held = true; this._swallow = true; if (navigator.vibrate) { try { navigator.vibrate(12); } catch (e) {} }
    const open = secs.filter((s) => !s.classList.contains("shut"));
    if (open.length) { /* any group open: a long hold collapses everything */ secs.forEach((s) => { S.folded[s.dataset.g] = true; }); g.done = true; this.draw(); this.say("All collapsed"); return; }
    /* all collapsed: the held heading lifts and can be dragged */
    g.lift = g.head.closest(".g"); g.lift.classList.add("lift"); try { g.head.setPointerCapture(g.id); } catch (e) {}
  };
  P_.bindGestures = function () {
    const p = this, el = this.el; let g = null;
    el.addEventListener("pointerdown", (e) => {
      if (e.button) return;
      const row = e.target.closest(".r-main[data-swipe]"), head = e.target.closest(".g-h"); p._down = true;
      if (row) g = { t: "row", row, x: e.clientX, y: e.clientY, id: e.pointerId, drag: false };
      else if (head && p.s === "pantry") { g = { t: "head", head, x: e.clientX, y: e.clientY, id: e.pointerId, held: false }; g.timer = setTimeout(() => p.longHold(g), 480); }
    });
    el.addEventListener("pointermove", (e) => {
      if (!g || e.pointerId !== g.id) return; const dx = e.clientX - g.x, dy = e.clientY - g.y;
      if (g.t === "row") {
        if (!g.drag) { if (Math.abs(dy) > 10 && Math.abs(dy) > Math.abs(dx)) { g = null; return; } if (Math.abs(dx) > 8) { g.drag = true; try { g.row.setPointerCapture(g.id); } catch (er) {} } }
        if (g.drag) { p.swPaint(g.row, dx); g.dx = dx; }
      } else if (g.t === "head") {
        if (!g.held && (Math.abs(dx) > 10 || Math.abs(dy) > 10)) { clearTimeout(g.timer); g = null; return; }
        if (g.lift) g.lift.style.transform = "translateY(" + dy + "px)";
      }
    });
    const end = (e) => {
      if (!g || e.pointerId !== g.id) return; clearTimeout(g.timer);
      if (g.t === "row" && g.drag) { p._swallow = true; setTimeout(() => { p._swallow = false; }, 60); p.swEnd(g.row, e.type === "pointerup" ? (g.dx || 0) : 0); }
      if (g.t === "head" && g.held) {
        if (g.lift && e.type === "pointerup") {
          const secs = [].slice.call(el.querySelectorAll(".g")), me = g.lift, r = me.getBoundingClientRect(), cy = r.top + r.height / 2;
          const others = secs.filter((s) => s !== me), idx = others.filter((s) => { const q = s.getBoundingClientRect(); return q.top + q.height / 2 < cy; }).length;
          const ids = others.map((s) => s.dataset.g); ids.splice(idx, 0, me.dataset.g); p.S.order[p.S.group] = ids; p.draw(); p.say("Moved: " + me.dataset.g);
        } else if (g.lift) { g.lift.classList.remove("lift"); g.lift.style.transform = ""; }
        setTimeout(() => { p._swallow = false; }, 60);
      }
      g = null;
    };
    el.addEventListener("pointerup", end); el.addEventListener("pointercancel", end);
    document.addEventListener("pointerup", () => { p._down = false; }); document.addEventListener("pointercancel", () => { p._down = false; });
    el.addEventListener("contextmenu", (e) => { if (e.target.closest(".g-h")) e.preventDefault(); });
  };
  P_.bind = function () {
    const p = this;
    this.el.addEventListener("click", (e) => {
      const t = e.target.closest("[data-a]"); if (!t || !p.el.contains(t)) return;
      const f = A[t.dataset.a]; if (!f) return; e.preventDefault(); f(p, t);
    });
    this.el.addEventListener("input", (e) => { if (e.target.classList.contains("tp-q")) { p.S.q = e.target.value; p.redrawList(); } });
    document.addEventListener("keydown", (e) => {
      const S = p.S;
      if (e.key === "Escape") { if (S.sheet) { S.sheet = false; p.draw(); } else if (S.search) { S.search = false; S.q = ""; p.draw(); } else if (S.sel) { S.sel = null; p.draw(); } return; }
      if (e.key === "Tab" && S.sheet) { const f = [].slice.call(p.el.querySelectorAll(".ll-sheet button")); if (!f.length) return; const i = f.indexOf(document.activeElement); if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); } else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); } return; }
      /* the keyboard way to the two hold gestures (never gesture-only): on a group heading, Shift+Enter folds or opens all; with all folded, Alt+Up or Alt+Down moves it */
      const h = e.target.closest && e.target.closest(".g-h"); if (!h || !p.el.contains(h)) return;
      const secs = [].slice.call(p.el.querySelectorAll(".g")), id = h.dataset.g;
      if (e.key === "Enter" && e.shiftKey) { e.preventDefault(); const anyOpen = secs.some((x) => !x.classList.contains("shut")); secs.forEach((x) => { S.folded[x.dataset.g] = anyOpen; }); p.draw(); p.say(anyOpen ? "All collapsed" : "All open"); }
      else if (e.altKey && (e.key === "ArrowUp" || e.key === "ArrowDown") && p._allShut) { e.preventDefault(); const ids = secs.map((x) => x.dataset.g), i = ids.indexOf(id), j = i + (e.key === "ArrowUp" ? -1 : 1); if (j < 0 || j >= ids.length) return; ids.splice(i, 1); ids.splice(j, 0, id); S.order[S.group] = ids; p.draw(); p.say("Moved: " + id); }
    });
    this.bindGestures();
  };
  window.PD = { mount(el, o) { const p = new Phone(el, o); p.bind(); el._pd = p; setTimeout(() => p.nudge(), 4000); return p; } };
})();
