/* One list language, four visual systems (fragment). One engine draws Pantry, Recipes and Home for variants a, b, c and d.
   The same DOM and the same behaviour in every variant; a variant is only its stylesheet (v-a.css ... v-d.css) and, for Home, its layout.
   Nothing is saved or fetched. Sample data is ll-data.js. Class names use the ll- / r- / fl- prefixes the build would use.
   Performance (DESIGN.md section 6): a phone is drawn when it scrolls into view (comparison page) or at once (app.html); the Filters sheet,
   the sort menu and the selection bar are built when opened, never on first paint. */
(function () {
  "use strict";
  const D = window.LL_DATA;
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const svg = (p, x) => '<svg class="ic' + (x ? " " + x : "") + '" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + p + "</svg>";
  const IC = {
    filter: '<path d="M4 6h16M7 12h10M10 18h4"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    glass: '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/>',
    tag: '<path d="M3.5 12.5V4.5h8l9 9-8 8z"/><circle cx="8" cy="9" r="1.2"/>',
    pin: '<path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/>',
    layers: '<path d="M12 3.5l9 4.5-9 4.5L3 8z"/><path d="M3 12.5l9 4.5 9-4.5M3 16.5l9 4.5 9-4.5"/>',
    chev: '<path d="M9 5l7 7-7 7"/>',
    fold: '<path d="M5 9l7 7 7-7"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    sparkle: '<path d="M12 3l1.9 5.6L19.5 10.5l-5.6 1.9L12 18l-1.9-5.6L4.5 10.5l5.6-1.9z"/><path d="M19 3v4M17 5h4"/>',
    copy: '<rect x="8" y="8" width="12" height="12" rx="2.5"/><path d="M16 8V6.5A2.5 2.5 0 0 0 13.5 4h-7A2.5 2.5 0 0 0 4 6.5v7A2.5 2.5 0 0 0 6.5 16H8"/>',
    sel: '<rect x="4" y="4" width="16" height="16" rx="4"/><path d="M8 12.5l3 3 5-6"/>',
    sort: '<path d="M7 5v14M7 19l-3-3M7 19l3-3M17 19V5M17 5l-3 3M17 5l3 3"/>',
    up: '<path d="M12 19V6M6 11l6-6 6 6"/>',
    down: '<path d="M12 5v13M6 13l6 6 6-6"/>',
    x: '<path d="M6 6l12 12M18 6L6 18"/>',
    star: '<path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8-5.2-2.8-5.2 2.8 1-5.8L3.5 9.7l5.9-.8z"/>',
    snow: '<path d="M12 3v18M4.2 7.5l15.6 9M19.8 7.5l-15.6 9"/>',
    branch: '<circle cx="7" cy="6" r="2"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="9" r="2"/><path d="M7 8v8M17 11c0 4-10 2-10 5"/>',
    clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
    basket: '<path d="M4 9h16l-1.6 9.5a2 2 0 0 1-2 1.5H7.6a2 2 0 0 1-2-1.5z"/><path d="M8.5 9l2.5-5M15.5 9L13 4"/>',
    chef: '<path d="M7 14.5a4 4 0 1 1 1.2-7.8 4.2 4.2 0 0 1 7.6 0A4 4 0 1 1 17 14.5V19H7z"/><path d="M7 16.5h10"/>',
    home: '<path d="M4 11l8-7 8 7v8.5a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z"/>',
    jar: '<path d="M8 4h8v3H8zM7 7h10v12a1.5 1.5 0 0 1-1.5 1.5h-7A1.5 1.5 0 0 1 7 19z"/><path d="M7 12h10"/>',
    plan: '<rect x="4" y="5.5" width="16" height="14.5" rx="2.5"/><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4"/>',
    book: '<path d="M5 4.5h11a3 3 0 0 1 3 3V20H8a3 3 0 0 1-3-3z"/><path d="M5 17a3 3 0 0 1 3-3h11"/>',
    cart: '<path d="M3.5 4.5h2.4l2 10.5h9.6l1.8-7.5H7"/><circle cx="9.5" cy="19" r="1.3"/><circle cx="16.5" cy="19" r="1.3"/>',
    mic: '<rect x="9" y="3.5" width="6" height="11" rx="3"/><path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3"/>',
    dots: '<circle cx="6" cy="12" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="18" cy="12" r="1.4"/>'
  };
  const ic = (n, x) => svg(IC[n], x);
  /* three squares (owner, 16 Oct 2026): Plenty 3, Some 2, Running low 1, Out 0 */
  const LV = { plenty: [3, "plenty", "Plenty"], some: [2, "some", "Some"], low: [1, "low", "Running low"], out: [0, "out", "Out"] };
  const lvIc = (k) => { const l = LV[k]; if (!l) return ""; let s = ""; for (let i = 0; i < 3; i++) s += '<i class="' + (i < l[0] ? "on" : "") + '"></i>'; return '<span class="lv lv-' + l[1] + '" role="img" aria-label="Level: ' + l[2] + '">' + s + "</span>"; };

  /* ---------- sorts ---------- */
  const SORTS = {
    pantry: [["name", "Name", ["A to Z", "Z to A"], ["A–Z", "Z–A"]], ["use", "Use by", ["Soonest first", "Latest first"], ["Use by", "Use by"]], ["added", "Added", ["Newest first", "Oldest first"], ["Added", "Added"]]],
    recipes: [["best", "Best match", ["Ready first, then not cooked lately"], ["Best match"]], ["name", "Name", ["A to Z", "Z to A"], ["A–Z", "Z–A"]], ["time", "Time", ["Quickest first", "Longest first"], ["Time", "Time"]], ["last", "Last cooked", ["Cooked recently", "Not cooked lately"], ["Cooked", "Cooked"]]]
  };
  const CMP = {
    pantry: {
      name: (a, b) => a.name.localeCompare(b.name),
      use: (a, b) => (a.days == null ? 1e9 : a.days) - (b.days == null ? 1e9 : b.days) || a.name.localeCompare(b.name),
      added: (a, b) => b.upd - a.upd
    },
    recipes: {
      best: (a, b) => a.miss - b.miss || a.last - b.last,
      name: (a, b) => a.name.localeCompare(b.name),
      time: (a, b) => a.min - b.min,
      last: (a, b) => a.last - b.last
    }
  };
  const STATUS = {
    pantry: [["low", "Running low", (i) => i.low], ["soon", "Expiring soon", (i) => i.days != null && i.days <= 3], ["recent", "Recently added", (i) => i.recent]],
    recipes: [["ready", "Ready now", (r) => r.miss === 0], ["star", "Starred", (r) => r.star], ["freeze", "Freezes", (r) => r.freeze], ["vers", "Has versions", (r) => r.ver > 1]]
  };
  const CHIPS = {
    recipes: [["all", "All"], ["ready", "Ready now"], ["star", "Starred"], ["batch", "Batch"], ["quick", "Under 30"], ["mine", "Added by me"]]
  };
  const CHIPTEST = { ready: (r) => r.miss === 0, star: (r) => r.star, batch: (r) => r.batch, quick: (r) => r.min <= 30, mine: (r) => r.mine };

  /* ---------- the phone ---------- */
  function Phone(el, o) {
    this.el = el; this.v = o.v; this.s = o.s;
    const P = this.s === "pantry";
    this.S = {
      sort: { k: P ? "name" : "best", d: 0 },
      group: P ? "cat" : (this.v === "c" ? "ready" : "flat"),   /* pantry: cat | loc | use ; recipes: flat | ready (C opens on readiness: same order as the ranked list, with headers) */
      chip: "all", q: "", search: false, folded: {}, sel: null, sheet: false, menu: false, st: {}, toast: ""
    };
    this.draw();
    if (o.state) this.setState(o.state, o);
  }
  const P_ = Phone.prototype;

  P_.custom = function () {
    const S = this.S, d = this.s === "pantry" ? { k: "name", d: 0 } : { k: "best", d: 0 };
    return S.sort.k !== d.k || S.sort.d !== d.d || Object.keys(S.st).some((k) => S.st[k]);
  };
  P_.chipList = function () {
    if (this.s === "recipes") return CHIPS.recipes.map((c) => ({ id: c[0], label: c[1], n: c[0] === "all" ? D.recipes.length : D.recipes.filter(CHIPTEST[c[0]]).length }));
    const loc = this.S.group === "loc", key = loc ? "loc" : "cat", order = loc ? D.locOrder : D.catOrder;
    const vals = order.filter((v) => D.pantry.some((i) => i[key] === v));
    return [{ id: "all", label: "All", n: D.pantry.length }].concat(vals.map((v) => ({ id: v, label: v, n: D.pantry.filter((i) => i[key] === v).length })));
  };
  P_.items = function () {
    const S = this.S, q = S.q.trim().toLowerCase(), P = this.s === "pantry";
    let a = P ? D.pantry.slice() : D.recipes.slice();
    if (S.chip !== "all") {
      if (P) { const key = S.group === "loc" ? "loc" : "cat"; a = a.filter((i) => i[key] === S.chip); } else a = a.filter(CHIPTEST[S.chip]);
    }
    if (q) a = a.filter((i) => i.name.toLowerCase().indexOf(q) > -1 || (P && i.cat.toLowerCase().indexOf(q) > -1));
    const on = STATUS[this.s].filter((t) => S.st[t[0]]);
    if (on.length) a = a.filter((i) => on.some((t) => t[2](i)));
    const f = CMP[this.s][S.sort.k];
    a.sort((x, y) => (S.sort.d ? -1 : 1) * f(x, y));
    return a;
  };
  P_.groups = function (items) {
    const S = this.S, P = this.s === "pantry";
    if (this.custom()) return [{ id: "", label: "", items }];
    if (P && S.group === "use") {
      const bands = [["Past use by", (i) => i.days != null && i.days < 0], ["Use soon", (i) => i.days != null && i.days >= 0 && i.days <= 3], ["Later", (i) => i.days != null && i.days > 3], ["No date", (i) => i.days == null]];
      return bands.map((b) => ({ id: b[0], label: b[0], items: items.filter(b[1]) })).filter((g) => g.items.length);
    }
    if (P) {
      const key = S.group === "loc" ? "loc" : "cat", order = S.group === "loc" ? D.locOrder : D.catOrder;
      return order.map((v) => ({ id: v, label: v, items: items.filter((i) => i[key] === v) })).filter((g) => g.items.length);
    }
    if (S.group === "ready") {
      const bands = [["Ready now", (r) => r.miss === 0], ["One or two missing", (r) => r.miss > 0 && r.miss < 3], ["Needs shopping", (r) => r.miss >= 3]];
      return bands.map((b) => ({ id: b[0], label: b[0], items: items.filter(b[1]) })).filter((g) => g.items.length);
    }
    return [{ id: "", label: "", items }];
  };

  /* ---------- flags (one component, four skins) ---------- */
  const fl = (tone, txt, short, prim, icon) => '<span class="fl fl-' + tone + (prim ? " fl--p" : "") + '">' + (icon ? ic(icon) : "") + '<span class="fl-t">' + esc(txt) + '</span>' + (short ? '<span class="fl-s">' + esc(short) + "</span>" : "") + "</span>";
  function pFlags(i) {
    let f = "", p = true;
    if (i.days != null) {
      if (i.days < 0) { const n = -i.days, t = "Past use by " + n + (n === 1 ? " day" : " days"); f += fl("danger", t, "Past " + n + "d", p); }
      else if (i.days === 0) f += fl("accent", "Use today", "Today", p);
      else if (i.days === 1) f += fl("accent", "Use tomorrow", "Tmrw", p);
      else f += fl(i.days <= 3 ? "accent" : "mut", "Use within " + i.days + " days", i.days + " days", p);
      p = false;
    }
    if (i.low && i.lvl === "low" && p) { f += fl("accent", "Running low", "Low", p); p = false; }
    return f;
  }
  function rFlags(r) {
    let f = r.miss === 0 ? fl("sage", "All in", "All in", true, "check") : fl("danger", r.miss + " missing", r.miss + " missing", true);
    if (r.star) f += '<span class="fl fl-acc-i" role="img" aria-label="Starred">' + ic("star") + "</span>";
    if (r.freeze) f += fl("mut", "Freezes", "", false, "snow");
    if (r.ver > 1) f += '<span class="fl fl-mut" role="img" aria-label="' + r.ver + ' versions">' + ic("branch") + '<span class="fl-t">' + r.ver + "</span></span>";
    return f;
  }
  const ago = (d) => (d <= 7 ? d + " days ago" : d <= 21 ? Math.round(d / 7) + " wk ago" : "a while ago");

  P_.rowHtml = function (i, g) {
    const S = this.S, P = this.s === "pantry", sel = S.sel && S.sel.has(i.id);
    let amt, where, grp, flags, lvl = "", lead, name = esc(i.name), ar;
    if (P) {
      amt = i.amt; where = i.spot; grp = S.group === "cat" && !this.custom() ? "" : i.cat; if (S.group === "loc" && !this.custom()) grp = i.cat;
      flags = pFlags(i); lvl = i.lvl ? lvIc(i.lvl) : "";
      lead = '<span class="r-lead" aria-hidden="true">' + (i.e ? '<span>' + i.e + "</span>" : '<span class="r-ltr">' + esc(i.name.charAt(0)) + "</span>") + "</span>";
      ar = i.name + ", " + i.amt + (i.days != null && i.days < 0 ? ", past use by" : "");
    } else {
      amt = i.min + " min"; where = (i.batch ? "makes " : "serves ") + i.serves; grp = "cooked " + ago(i.last);
      flags = rFlags(i);
      lead = i.ban ? '<span class="r-lead th" aria-hidden="true"><span>' + i.e + "</span></span>" : "";
      ar = i.name + ", " + amt + (i.miss ? ", " + i.miss + " missing" : ", all in");
    }
    const em = P && i.e ? '<span class="em" aria-hidden="true">' + i.e + "</span>" : "";
    const cue = i.recent ? '<span class="cue" role="img" aria-label="Added in the last 24 hours">' + ic("up") + "</span>" : "";
    return '<li class="r' + (sel ? " is-sel" : "") + '" data-id="' + i.id + '"><button type="button" class="r-main" data-a="row" data-id="' + i.id + '" aria-label="' + esc(ar) + '"' + (S.sel ? ' aria-pressed="' + !!sel + '"' : "") + ">" +
      '<span class="r-sel" aria-hidden="true">' + (sel ? ic("check") : "") + "</span>" + lead +
      '<span class="r-text"><b class="r-name">' + em + '<span class="nm">' + name + "</span>" + cue + '</b><small class="r-meta"><span class="m-amt">' + esc(amt) + "</span>" + (where ? '<span class="m-where">' + esc(where) + "</span>" : "") + (grp ? '<span class="m-grp">' + esc(grp) + "</span>" : "") + "</small></span>" +
      '<span class="r-flags">' + flags + "</span>" + lvl + '<span class="r-chev" aria-hidden="true">' + ic("chev") + "</span></button></li>";
  };
  P_.bodyHtml = function () {
    const S = this.S, P = this.s === "pantry", items = this.items(), gs = this.groups(items);
    if (!items.length) {
      const q = S.q.trim();
      return '<div class="ll-empty"><p>Nothing matches' + (q ? " “" + esc(q) + "”" : "") + ".</p>" + (P ? '<div class="ll-empty-acts"><button type="button" class="btn pri" data-a="toast" data-t="Add item opens with “' + esc(q) + '” filled in">Add as a new item</button><button type="button" class="btn" data-a="toast" data-t="Added to the shopping list">Add to shopping list</button></div>' : '<div class="ll-empty-acts"><button type="button" class="btn pri" data-a="toast" data-t="Opens your AI app">Ask your assistant to add one</button></div>') + "</div>";
    }
    return gs.map((g) => {
      if (!g.id && !g.label) return '<ul class="rows">' + g.items.map((i) => this.rowHtml(i, g)).join("") + "</ul>";
      const shut = !!S.folded[g.id], nr = g.items.filter((i) => i.recent).length;
      return '<section class="g' + (shut ? " shut" : "") + '"><button type="button" class="g-h" data-a="fold" data-g="' + esc(g.id) + '" aria-expanded="' + !shut + '"><h2>' + esc(g.label) + '</h2><small class="g-n">' + g.items.length + "</small>" +
        (nr ? '<span class="g-new" role="img" aria-label="' + nr + ' added in the last 24 hours">' + ic("up") + nr + "</span>" : "") + '<span class="g-fold">' + ic("fold") + '</span></button><ul class="rows">' + g.items.map((i) => this.rowHtml(i, g)).join("") + "</ul></section>";
    }).join("");
  };

  /* ---------- chrome ---------- */
  const sortLabel = (s, k, d, short) => { const t = SORTS[s].filter((x) => x[0] === k)[0]; return short ? t[3][d] || t[3][0] : t[2][d] || t[2][0]; };
  P_.topHtml = function () {
    const S = this.S, P = this.s === "pantry", nst = Object.keys(S.st).filter((k) => S.st[k]).length, n = this.items().length;
    const so = sortLabel(this.s, S.sort.k, S.sort.d, true), hasDir = S.sort.k !== "best";
    const add = P ? '<button type="button" class="tp-add" data-a="add" aria-label="Add an item">' + ic("plus") + "</button>" : '<button type="button" class="tp-add ask" data-a="ask" aria-label="Ask your assistant (opens your AI app)">' + ic("sparkle") + "</button>";
    return '<header class="ll-top"><div class="tp-rest">' +
      '<button type="button" class="tp-filters" data-a="sheet" aria-haspopup="dialog">' + ic("filter") + "<span>Filters</span>" + (nst ? '<i class="tp-n">' + nst + "</i>" : "") + "</button>" +
      '<button type="button" class="tp-sort" data-a="menu" aria-haspopup="menu" aria-expanded="' + S.menu + '" aria-label="Sort: ' + esc(sortLabel(this.s, S.sort.k, S.sort.d)) + '">' + ic("sort") + "<span>" + esc(so) + "</span>" + (hasDir ? ic(S.sort.d ? "down" : "up", "dir") : "") + "</button>" +
      '<span class="tp-sp"></span><span class="tp-count" aria-live="polite">' + n + (P ? " items" : " recipes") + "</span>" +
      '<button type="button" class="tp-sel" data-a="select" aria-pressed="' + !!S.sel + '">' + ic("sel") + "<span>Select</span></button>" + add +
      '<button type="button" class="tp-find" data-a="search" aria-label="Search ' + (P ? "the pantry" : "recipes") + '">' + ic("glass") + "</button></div>" +
      '<div class="tp-search"><button type="button" class="tp-x" data-a="closesearch" aria-label="Close search">' + ic("x") + '</button><label class="tp-field">' + ic("glass") + '<span class="vh">Search</span><input type="search" class="tp-q" placeholder="' + (P ? "Search the pantry" : "Search recipes or ingredients") + '" autocomplete="off" value="' + esc(S.q) + '"></label><button type="button" class="tp-mic" aria-label="Speak your search">' + ic("mic") + "</button></div></header>";
  };
  P_.segHtml = function () {
    const S = this.S, P = this.s === "pantry";
    const segs = P ? [["loc", "Location"], ["cat", "Category"], ["use", "Use by"]] : [["flat", "Ranked"], ["ready", "Readiness"]];
    return '<div class="ll-seg" role="radiogroup" aria-label="Group by">' + segs.map((x) => '<button type="button" role="radio" aria-checked="' + (S.group === x[0]) + '" data-a="group" data-g="' + x[0] + '"><span>' + x[1] + "</span></button>").join("") + "</div>";
  };
  P_.chipsHtml = function () {
    const S = this.S, P = this.s === "pantry", cl = this.chipList();
    const mi = P ? (S.group === "loc" ? "pin" : "tag") : "layers", ml = P ? (S.group === "loc" ? "Showing locations. Switch to categories" : "Showing categories. Switch to locations") : (S.group === "ready" ? "Grouped by readiness. Switch to one ranked list" : "One ranked list. Group by readiness");
    return '<div class="ll-chips"><button type="button" class="ch-mode" data-a="mode" aria-label="' + ml + '" title="' + ml + '">' + ic(mi) + '</button><div class="ch-scroll" role="group" aria-label="' + (P ? (S.group === "loc" ? "Location" : "Category") : "Show") + '">' +
      cl.map((c) => '<button type="button" class="ch" data-a="chip" data-c="' + esc(c.id) + '" aria-pressed="' + (S.chip === c.id) + '"><span>' + esc(c.label) + "<i>" + c.n + "</i></span></button>").join("") + '</div><button type="button" class="ch-sel" data-a="select" aria-pressed="' + !!S.sel + '" aria-label="Pick several">' + ic("sel") + "</button></div>";
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
    const col = (k, t, cls) => { const on = S.sort.k === k, ok = SORTS[this.s].some((x) => x[0] === k); return '<button type="button" class="hd ' + cls + '"' + (ok ? ' data-a="sorthd" data-k="' + k + '" aria-label="Sort by ' + t + '"' : " disabled") + (on ? ' aria-sort="' + (S.sort.d ? "descending" : "ascending") + '"' : "") + "><span>" + t + "</span>" + (on ? ic(S.sort.d ? "down" : "up", "dir") : "") + "</button>"; };
    return '<div class="ll-colhead" role="row"><button type="button" class="hd hd-sel" data-a="select" aria-pressed="' + !!S.sel + '" aria-label="Pick several">' + ic("sel") + "</button>" + col(P ? "name" : "name", "Name", "hd-name") + (P ? col("amt", "Amount", "hd-amt") + col("use", "Use by", "hd-flag") : col("time", "Time", "hd-amt") + col("best", "Ready", "hd-flag")) + "</div>";
  };
  const TABS = [["Home", "home"], ["Pantry", "jar"], ["Plan", "plan"], ["Recipes", "book"], ["Shopping", "cart"]];
  P_.tabsHtml = function (cur) {
    return '<nav class="ll-tabs" aria-label="Main">' + TABS.map((t) => '<a href="#" data-a="tab" class="' + (t[0].toLowerCase() === cur ? "on" : "") + '"' + (t[0].toLowerCase() === cur ? ' aria-current="page"' : "") + ">" + ic(t[1]) + "<span>" + t[0] + "</span>" + (t[0] === "Shopping" ? '<i class="badge" aria-label="' + D.badge + ' on the list">' + D.badge + "</i>" : "") + "</a>").join("") + "</nav>";
  };
  P_.selbarHtml = function () {
    const n = this.S.sel ? this.S.sel.size : 0, P = this.s === "pantry";
    const acts = P ? [["Add to list", "cart"], ["Copy", "copy"], ["Used up", "check"]] : [["Plan", "plan"], ["Add missing", "cart"], ["Copy", "copy"]];
    return '<div class="ll-selbar" role="toolbar" aria-label="Picked items"><span class="sb-n">' + (n ? n + " picked" : "Tap to pick") + "</span>" + acts.map((a) => '<button type="button" class="sb-a" data-a="selact" data-t="' + a[0] + '"' + (n ? "" : " disabled") + ">" + ic(a[1]) + "<span>" + a[0] + "</span></button>").join("") + '<button type="button" class="sb-done" data-a="select">Done</button></div>';
  };
  P_.sheetHtml = function () {
    const S = this.S, P = this.s === "pantry", n = this.items().length;
    const sorts = SORTS[this.s];
    return '<div class="ll-scrim" data-a="sheet"></div><div class="ll-sheet" role="dialog" aria-modal="true" aria-label="Filters"><div class="sh-grab" aria-hidden="true"></div><div class="sh-h"><h2>Filters</h2><button type="button" class="sh-x" data-a="sheet" aria-label="Close">' + ic("x") + "</button></div>" +
      '<h3 class="sh-l">Sort</h3><div class="sh-row"><div class="sh-seg" role="radiogroup" aria-label="Sort by">' + sorts.map((t) => '<button type="button" role="radio" aria-checked="' + (S.sort.k === t[0]) + '" data-a="sortk" data-k="' + t[0] + '"><span>' + t[1] + "</span></button>").join("") + "</div>" +
      (S.sort.k !== "best" ? '<button type="button" class="sh-dir" data-a="dir" aria-label="Reverse the order">' + ic(S.sort.d ? "down" : "up") + "<span>" + esc(sortLabel(this.s, S.sort.k, S.sort.d)) + "</span></button>" : "") + "</div>" +
      '<h3 class="sh-l">Show</h3><div class="sh-st">' + STATUS[this.s].map((t) => '<button type="button" class="sh-p" data-a="st" data-k="' + t[0] + '" aria-pressed="' + !!S.st[t[0]] + '"><span class="sh-box">' + (S.st[t[0]] ? ic("check") : "") + "</span><span>" + t[1] + "</span></button>").join("") + "</div>" +
      '<div class="sh-f"><button type="button" class="btn" data-a="clear">Clear</button><button type="button" class="btn pri" data-a="sheet">' + (n ? "Show " + n + (P ? " items" : " recipes") : "No items match") + "</button></div></div>";
  };
  P_.menuHtml = function () {
    const S = this.S, sorts = SORTS[this.s];
    return '<div class="ll-scrim clear" data-a="menu"></div><div class="ll-menu" role="menu" aria-label="Sort">' + sorts.map((t) => '<button type="button" role="menuitemradio" aria-checked="' + (S.sort.k === t[0]) + '" data-a="sortk" data-k="' + t[0] + '"><span class="mk">' + (S.sort.k === t[0] ? ic("check") : "") + "</span><span>" + t[1] + "</span></button>").join("") +
      (S.sort.k !== "best" ? '<button type="button" role="menuitem" class="mdir" data-a="dir">' + ic(S.sort.d ? "down" : "up") + "<span>" + esc(sortLabel(this.s, S.sort.k, S.sort.d)) + "</span></button>" : "") + "</div>";
  };

  /* ---------- Home (curated: may differ in layout, shares tokens and components) ---------- */
  const pItem = (id) => D.pantry.filter((i) => i.id === id)[0], rItem = (id) => D.recipes.filter((r) => r.id === id)[0];
  P_.homeRow = function (i, note) {
    const f = pFlags(i) || (i.low ? fl("accent", "Running low", "Low", true) : "");
    return '<li class="r"><button type="button" class="r-main" data-a="toast" data-t="Opens ' + esc(i.name) + '"><span class="r-lead" aria-hidden="true"><span>' + (i.e || '<span class="r-ltr">' + esc(i.name.charAt(0)) + "</span>") + '</span></span><span class="r-text"><b class="r-name">' + (i.e ? '<span class="em" aria-hidden="true">' + i.e + "</span>" : "") + '<span class="nm">' + esc(i.name) + '</span></b><small class="r-meta"><span class="m-amt">' + esc(i.amt) + '</span><span class="m-where">' + esc(i.spot) + '</span></small></span><span class="r-flags">' + f + (note || "") + (i.lvl ? lvIc(i.lvl) : "") + '</span><span class="r-chev" aria-hidden="true">' + ic("chev") + "</span></button></li>";
  };
  P_.homeHtml = function () {
    const H = D.home, idea = rItem(H.idea), alts = H.alts.map(rItem), hr = "Good evening";
    const out = H.out.map(pItem).map((i) => this.homeRow(i)).join(""), low = H.low.map(pItem).map((i) => this.homeRow(i, i.id === "milk" ? '<span class="fl fl-mut"><span class="fl-t">On your list</span></span>' : "")).join("");
    const sec = (cls, icn, t, body, more) => '<section class="hm-sec ' + cls + '"><div class="hm-h"><span class="hm-i">' + ic(icn) + "</span><h2>" + t + '</h2><button type="button" class="hm-va" data-a="toast" data-t="' + (more || "Opens the list") + '">View all</button></div>' + body + "</section>";
    const lead = '<div class="hm-idea"><span class="r-lead th" aria-hidden="true"><span>' + idea.e + '</span></span><div class="hm-it"><span class="hm-k">Tonight</span><b>' + esc(idea.name) + "</b><small>" + idea.min + " min · serves " + idea.serves + " · cooked " + ago(idea.last) + '</small><span class="r-flags">' + rFlags(idea) + '</span></div><div class="hm-acts"><button type="button" class="btn pri" data-a="toast" data-t="Opens the Plan flow">Plan</button><button type="button" class="btn" data-a="toast" data-t="Starts Make it now">Make it</button></div></div>';
    const altsH = '<ul class="rows hm-alts">' + alts.map((r) => '<li class="r"><button type="button" class="r-main" data-a="toast" data-t="Opens ' + esc(r.name) + '">' + (r.ban ? '<span class="r-lead th" aria-hidden="true"><span>' + r.e + "</span></span>" : "") + '<span class="r-text"><b class="r-name"><span class="nm">' + esc(r.name) + '</span></b><small class="r-meta"><span class="m-amt">' + r.min + ' min</span><span class="m-where">serves ' + r.serves + '</span></small></span><span class="r-flags">' + rFlags(r) + '</span><span class="r-chev" aria-hidden="true">' + ic("chev") + "</span></button></li>").join("") + "</ul>";
    return '<div class="hm"><h1 class="hm-hi">' + hr + ", " + esc(D.me) + '.</h1>' +
      sec("hm-out", "clock", "On the way out", '<ul class="rows">' + out + "</ul>", "Opens Pantry sorted by Use by") +
      sec("hm-idea-s", "chef", "Cooking ideas for you", lead + altsH + '<button type="button" class="hm-tune" data-a="toast" data-t="Tune ideas opens inline">Tune ideas</button>', "Opens Recipes") +
      sec("hm-low", "basket", "Running low", '<ul class="rows">' + low + "</ul>", "Opens Pantry on Running low") + "</div>";
  };

  /* ---------- draw ---------- */
  P_.draw = function () {
    const S = this.S, keep = this.el.querySelector(".ll-body"), top = keep ? keep.scrollTop : 0;
    const cur = this.s === "pantry" ? "pantry" : this.s === "recipes" ? "recipes" : "home";
    let h;
    if (this.s === "home") {
      h = '<div class="ll-body" tabindex="-1">' + this.homeHtml() + "</div>" + this.tabsHtml(cur);
    } else {
      h = this.topHtml() + (this.v === "c" ? this.segHtml() : "") + this.chipsHtml() + this.cvHtml() + (this.v === "d" ? this.headHtml() : "") +
        '<div class="ll-body" tabindex="-1">' + this.bodyHtml() + '<div class="ll-end"></div></div>' +
        '<button type="button" class="ll-fab" data-a="select" aria-pressed="' + !!S.sel + '" aria-label="Pick several or copy a list">' + ic(S.sel ? "check" : "copy") + "</button>" +
        (S.sel ? this.selbarHtml() : this.tabsHtml(cur)) + (S.sheet ? this.sheetHtml() : "") + (S.menu ? this.menuHtml() : "");
    }
    this.el.innerHTML = h + '<div class="ll-toast" role="status" aria-live="polite">' + esc(S.toast) + "</div>";
    this.el.dataset.search = S.search ? "1" : "0"; this.el.dataset.sel = S.sel ? "1" : "0"; this.el.dataset.custom = this.custom() ? "1" : "0";
    this.el.dataset.v = this.v; this.el.dataset.s = this.s;
    const b = this.el.querySelector(".ll-body"); if (b) b.scrollTop = top;
    if (S.search) { const q = this.el.querySelector(".tp-q"); if (q) { q.focus({ preventScroll: true }); try { q.setSelectionRange(q.value.length, q.value.length); } catch (e) {} } }
  };
  P_.redrawList = function () { /* typing in search: only the list and the count change, so the field keeps focus */
    const b = this.el.querySelector(".ll-body"); if (!b) return;
    b.innerHTML = this.bodyHtml() + '<div class="ll-end"></div>';
    const c = this.el.querySelector(".tp-count"); if (c) c.textContent = this.items().length + (this.s === "pantry" ? " items" : " recipes");
    this.el.dataset.custom = this.custom() ? "1" : "0";
  };
  P_.say = function (t) {
    const el = this.el.querySelector(".ll-toast"); if (!el) return; el.textContent = t; el.classList.add("on");
    clearTimeout(this._t); this._t = setTimeout(() => el.classList.remove("on"), 1800);
  };
  P_.setState = function (name, o) {
    const S = this.S; o = o || {};
    S.search = false; S.sel = null; S.sheet = false; S.menu = false; S.q = ""; S.chip = "all"; S.st = {}; S.folded = {}; S.sort = { k: this.s === "pantry" ? "name" : "best", d: 0 };
    S.group = this.s === "pantry" ? (o.group || "cat") : (o.group || (this.v === "c" ? "ready" : "flat"));
    if (name === "search") { S.search = true; S.q = o.q || ""; }
    if (name === "select") S.sel = new Set(o.pick ? o.pick.split(",") : []);
    if (name === "filters") S.sheet = true;
    if (name === "sort") { if (this.v === "c") S.sheet = true; else if (this.v === "d") S.sort = { k: this.s === "pantry" ? "use" : "time", d: 0 }; else S.menu = true; } /* C sorts in its sheet, D by its column heads */
    if (name === "custom") { S.st = this.s === "pantry" ? { soon: true } : { ready: true }; if (this.s === "pantry") S.sort = { k: "use", d: 0 }; }
    if (name === "folded") { const g = this.groups(this.items()); if (g[0]) S.folded[g[0].id] = true; }
    if (o.chip) S.chip = o.chip;
    this.draw();
  };

  /* ---------- events (one listener per phone) ---------- */
  const A = {
    row(p, t) {
      const S = p.S, id = t.dataset.id;
      if (S.sel) { if (S.sel.has(id)) S.sel.delete(id); else S.sel.add(id); p.draw(); return; }
      p.say(p.s === "pantry" ? "Opens the item sheet (unchanged)" : "Opens the recipe page (unchanged)");
    },
    fold(p, t) { const g = t.dataset.g; p.S.folded[g] = !p.S.folded[g]; p.draw(); },
    sheet(p) { p.S.sheet = !p.S.sheet; p.S.menu = false; p.draw(); },
    menu(p) { p.S.menu = !p.S.menu; p.draw(); },
    select(p) { p.S.sel = p.S.sel ? null : new Set(); p.S.menu = false; p.draw(); },
    selact(p, t) { const n = p.S.sel.size; p.S.sel = null; p.draw(); p.say(t.dataset.t + ": " + n + (n === 1 ? " item" : " items")); },
    search(p) { p.S.search = true; p.draw(); },
    closesearch(p) { p.S.search = false; p.S.q = ""; p.draw(); },
    chip(p, t) { p.S.chip = t.dataset.c; p.draw(); },
    mode(p) { const S = p.S; if (p.s === "pantry") { S.group = S.group === "loc" ? "cat" : "loc"; S.chip = "all"; } else S.group = S.group === "ready" ? "flat" : "ready"; p.draw(); },
    group(p, t) { p.S.group = t.dataset.g; if (p.s === "pantry") p.S.chip = "all"; p.draw(); },
    sortk(p, t) { const S = p.S; if (S.sort.k === t.dataset.k) S.sort.d = S.sort.d ? 0 : 1; else S.sort = { k: t.dataset.k, d: 0 }; S.menu = false; p.draw(); },
    sorthd(p, t) { A.sortk(p, t); },
    dir(p) { p.S.sort.d = p.S.sort.d ? 0 : 1; p.draw(); },
    st(p, t) { const k = t.dataset.k; p.S.st[k] = !p.S.st[k]; p.draw(); },
    rm(p, t) { const k = t.dataset.k; if (k === "sort") p.S.sort = { k: p.s === "pantry" ? "name" : "best", d: 0 }; else p.S.st[k] = false; p.draw(); },
    clear(p) { p.S.st = {}; p.S.sort = { k: p.s === "pantry" ? "name" : "best", d: 0 }; p.draw(); },
    add(p) { p.say("Add item opens (receipt scan lives inside it)"); },
    ask(p) { p.say("Opens your AI app (no in-app add for recipes)"); },
    tab(p, t) { p.say("Goes to " + t.textContent.replace(/\d+$/, "").trim()); },
    toast(p, t) { p.say(t.dataset.t); }
  };
  Phone.prototype.bind = function () {
    const p = this;
    this.el.addEventListener("click", (e) => {
      const t = e.target.closest("[data-a]"); if (!t || !p.el.contains(t)) return;
      const f = A[t.dataset.a]; if (!f) return; e.preventDefault(); f(p, t);
    });
    this.el.addEventListener("input", (e) => { if (e.target.classList.contains("tp-q")) { p.S.q = e.target.value; p.redrawList(); } });
    this.el.addEventListener("keydown", (e) => {
      if (e.key !== "Escape") return; const S = p.S;
      if (S.sheet || S.menu) { S.sheet = S.menu = false; p.draw(); } else if (S.search) { S.search = false; S.q = ""; p.draw(); } else if (S.sel) { S.sel = null; p.draw(); }
    });
  };
  window.LL = {
    mount(el, o) { const p = new Phone(el, o); p.bind(); el._ll = p; return p; },
    states: ["rest", "search", "select", "filters", "sort", "custom", "folded"]
  };
})();
