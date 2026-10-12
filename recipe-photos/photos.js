/* Recipe photos slice: sample photo data, the phased loader, and the shared pieces (frame, viewer, removal with undo).
   Needs ../recipe/recipe.js (RCP) first. Sample names and bytes live here only (AGENTS.md).
   Owner's typed decisions of 10 Oct 2026 applied: P-D1 A, P-D2 A plus a blob port, P-D6 A varied (banner l + t; every other photo m + t),
   P-D7 C (phone first, server derives in the background), P-D9 A, P-D10 B, P-D12 A refined, P-D15 A plus an MCP read tool, P-D8 limits,
   P-D17 B (undo for 5 minutes), P-D18 B, P-D20 A with text-first loading, P-D21 with the list loading order.
   Build note: frame() is the markup the app renders server-side; load() is the small deferred loader the app needs. */
(function () {
  var X = window.RCP;
  /* Per photo: dominant colour (c), bytes of the stored sizes t/m/l (b; 0 = not kept for this photo), the tiny inline preview (lq).
     In the build these come back from Recipe with the recipe, so the page paints the placeholder with no extra request (P-D5). */
  var META = {
    "efr-1": { c: "#ba976b", b: [1796, 6268, 12060], lq: "data:image/webp;base64,UklGRpIAAABXRUJQVlA4IIYAAADwBACdASoYABIAPu1osFAppaSiqAqpMB2JagCxHw4wN0oAFiQREAYh17c1V0CYRAAA/FpOMCMz2wqmFzO5IpbtKsEOVGjeL1o31wCO+iL2SPqUxGD5wBqm8/zQni9qkM99CRVURKWyl/SBcpK1rl9pAnpOo1HC0y/j4+j0leU2lBHAFiwAAA==" },
    "efr-2": { c: "#cba772", b: [1956, 6362, 12122], lq: "data:image/webp;base64,UklGRpwAAABXRUJQVlA4IJAAAACwBACdASoYABIAPu1qrlCppiQiqAqpMB2JbACxHoR4GBTZKrPV7CZwRjy1mQgAAP6wXxWheBR6J6ZVgWoVccjxRtOyfwHGGHct8jh2CO2xHSVbxeXutEzcwQ9kRffhyLqwm7BVK1D2eC8PUBHB1YHCwE3Ux+0vfy61a9sFvct9obrTBJUi2C+ejvIiMDAYAAA=" },
    "efr-3": { c: "#a67e62", b: [2150, 6824, 12648], lq: "data:image/webp;base64,UklGRpYAAABXRUJQVlA4IIoAAABwBACdASoYABIAPu1srVCppiQiqAqpMB2JZACw7YuuTHaE2H2nhAWqDjJDQABhqpfFgsybgbxhedzphIKZFsuRYGM04a5QCpn/eSJH/l1BoSoh3P1wymLDwICRxCzvGR4ABJRhS4kOcFOz/XPNtb5iMR2G6JMAmzgF78P5OZlQMEr7KeFNcgAAAAA=" },
    "efr-c1": { c: "#9aa87f", b: [1598, 5668, 11102], lq: "data:image/webp;base64,UklGRoAAAABXRUJQVlA4IHQAAAAwBACdASoYABIAPu1mq08ppaOiKA1RMB2JQBdgAiKPmUg1ExjaMCQLQoAA/dd6XsIaAa3+c3HvbAvskGd7WTw16ecxGIKD4l2K9bq4Tz9+8EjafS99qJtnyYVSpmzk5uxbhv8U381zTvypUJ63M6l9XoAAAA==" },
    "efr-c2": { c: "#8aad7b", b: [1932, 6540, 12668], lq: "data:image/webp;base64,UklGRoIAAABXRUJQVlA4IHYAAACQBACdASoYABIAPu1irE4ppaSiKA1RMB2JZACdM4UGUBSrsVPxaOzs6nkq36AA/dd7qTtQj0GTbcd/Is6iyTY4Tq4Jbqra+nEIgIhIJsmvsnn4/ogogG2s7I0Y3y/kjG04xoI+KsCfiVt6WAgf+Gin8hXdgAAA" },
    "efr-c3": { c: "#bc8b6c", b: [2250, 7844, 14544], lq: "data:image/webp;base64,UklGRpgAAABXRUJQVlA4IIwAAABwBACdASoYABIAPu1sqlGppaOiqAqpMB2JaACdL9SAkrL7IVVKA2yXVK2CAAD3BCFMLCVsX9W1j4fwpJ/x6Z1vp9hXMg8vIx05VQcbWSOVZWSa+Q4G5x6ziaQVMAOai804DiHw+XBTdRCO3PdeLoCPEPMjnSaOOWyff3cHKHv90lT4uK+rqoaL462AAA==" },
    "cur-1": { c: "#c18e5b", b: [2304, 7632, 14656], lq: "data:image/webp;base64,UklGRpAAAABXRUJQVlA4IIQAAADQBACdASoYABIAPu1qrlCppaQiqAqpMB2JbACxG68A5l/AFYY3SX9BB8eDLBM8AAD8a/oLG7eO78UGsOj1PoLzacOCDsmDrFa9vk/4rDCqZNBIqe27xQHwEt8SoUbyutQT9tNprUWmbljsbStc6xlhHiohJPFLLvY3iR0dDSTcRCBAAAA=" },
    "sha-1": { c: "#b76f60", b: [2110, 7088, 13574], lq: "data:image/webp;base64,UklGRqAAAABXRUJQVlA4IJQAAACQBACdASoYABIAPu1kq06ppaQiKA1RMB2JbACdMoSFAc90JhbXciCrjeMwSAAA7KUj8y1HJv7K/0NSHPrsJUd9dbMYsK8clAnRpb/mK9S7A0wYhNTgFBZnHTTffrcPjVjXGt+sU7GrJk/9TUPXsCawWyAUY31eZx2AuACGFwyfYWqYnXzu37dCuSMzD+P5o1l5IAAA" },
    "rag-1": { c: "#9e6452", b: [2948, 10010, 18970], lq: "data:image/webp;base64,UklGRpwAAABXRUJQVlA4IJAAAADwBACdASoYABIAPu1kq0+ppSOiMBgIATAdiWgAuy/UgOhlkLxQntuMZ9RKLOR5zAAA/g+Ov6ROvF/VC0Xxby49DK0MJ7LP0HNAwmjJltGwJK8OI+8VVMF70+LUdss4Fgr4iu/c5kokLaJ0/dUUJ5IZnA+9eiQDYt3fhTIPC/5Iw60Yw5n23IqJys9aLKAAAAA=" },
    "len-1": { c: "#be875f", b: [2254, 7352, 13770], lq: "data:image/webp;base64,UklGRo4AAABXRUJQVlA4IIIAAACwBACdASoYABIAPu1kq06ppaOiKA1RMB2JbACdMoSBgBMqpftTMH9LVBqcPcMAAPcI+5YrIBk2i6L982GN30ogyxz5H7YuiNsio6bj0EtUr6eFHqVGum2Y7Jo/RPHflMlnyTbP80iU4HIsO128ji6Xfh7OjZnAeZFKpf2//ksUoAAA" },
    "efr-s1": { c: "#bfa98c", b: [1800, 6474, 0], lq: "data:image/webp;base64,UklGRmgAAABXRUJQVlA4IFwAAAAwBACdASoYABIAPu1mq0+ppSOiMBgIATAdiWMArAAQ6KVfMM9JegxGkwAA/lDh0B/bWF25Nd5xHWTDvuAUa09hhp7+Deu5vDf6sE7fPUIC8nbLslshk8vumqTAAA==" },
    "efr-s2": { c: "#5e5855", b: [3284, 10810, 0], lq: "data:image/webp;base64,UklGRmIAAABXRUJQVlA4IFYAAADQAwCdASoYABIAPu1qsVAppiUiqAqpMB2JZwDBzA3ng79kQC5iAAAA/RyPfFOOINjfhJceWj8IVKq6ak58+03BcYzr8wjZ+tOJkBJQ6cVrjz1IAAAAAA==" },
    "efr-s4": { c: "#736b62", b: [5158, 17016, 0], lq: "data:image/webp;base64,UklGRnAAAABXRUJQVlA4IGQAAAAQBACdASoYABIAPu1krE+ppSQiMBgIATAdiWUAzjgN0qmX67UnR8VHMAD519DJISvea1OxxhXgs4a/e8PL0x0AsOYvvvWTsBihSBgeGjmmOjlM4gsbYc1ZgC9FkvKRhKCAAAAA" }
  };
  /* Photos per recipe family (sample). k:
       "banner"  the version's one banner (P-D8: one per version). Kept as l + t (P-D6 as locked).
       "step"    one photo for one step (step: the step's position in the sample; its stable item id in the build), at most 10 per version.
       "more"    any other photo of the version (the gallery). Kept as m + t.
       "cooked"  attached to one cook (cook: its date in the sample, its id in the build), up to 3 per cook. Kept as m + t.
     v: the version it is attached to (P-D9: a version or a cook, never a revision).
     prep: uploaded, the derived sizes are not made yet (P-D7 as locked: the server makes them when it is free).
     A version with no banner of its own shows its nearest ancestor's, marked with a small icon (P-D10 as locked). No cooked photo ever stands in. */
  var PH = {
    efr: [
      { id: "efr-1", k: "banner", v: "v1", by: "Jane", when: "20 Sep" },
      { id: "efr-2", k: "banner", v: "v0", by: "Sam", when: "3 Sep" },
      { id: "efr-3", k: "more", v: "v0", by: "Sam", when: "3 Sep" },
      { id: "efr-s1", k: "step", step: 0, v: "v0", by: "Sam", when: "3 Sep" },
      { id: "efr-s2", k: "step", step: 1, v: "v0", by: "Sam", when: "3 Sep" },
      { id: "efr-s4", k: "step", step: 3, v: "v1", by: "Jane", when: "20 Sep" },
      { id: "efr-c1", k: "cooked", cook: "8 Oct", v: "v1", by: "Sam", when: "8 Oct", line: "Used brown rice, fine." },
      { id: "efr-c2", k: "cooked", cook: "29 Sep", v: "v1", by: "Jane", when: "29 Sep" },
      { id: "efr-c3", k: "cooked", cook: "21 Sep", v: "v0", by: "Sam", when: "21 Sep", line: "Doubled it for lunches." }
    ],
    cur: [{ id: "cur-1", k: "banner", v: "v0", by: "Priya", when: "14 Aug" }],
    sha: [{ id: "sha-1", k: "banner", v: "v0", by: "Alex", when: "2 Sep" }],
    rag: [{ id: "rag-1", k: "cooked", cook: "5 Sep", v: "v0", by: "Priya", when: "5 Sep", line: "10 portions." }],
    pas: [], fri: [], oml: []
  };
  /* Kept sizes per kind (P-D6 as locked, owner, typed, 10 Oct 2026): only the banner keeps the large size. No originals. */
  var KEEP = { banner: ["l", "t"], step: ["m", "t"], more: ["m", "t"], cooked: ["m", "t"] };
  var big = function (p) { return p.k === "banner" ? "l" : "m"; }; /* the size a photo is shown at, full width or in the viewer */
  /* Notes (P-D26, P-D27): sample only; the flow slice's notes in recipe.js are shown too. */
  var NOTES = {
    efr: [{ id: "n-efr-1", by: "Sam", when: "8 Oct", cook: "8 Oct", body: "**Brown rice works** if it is day-old.\n- 2 tbsp more soy\n- Fry the rice longer\n[photo:efr-c1]" }]
  };
  var Q = X.Q;
  /* photos | prep (sizes still being made) | none | slow */
  var state = Q.get("state") || X.store.get("pstate", "photos");
  if (Q.get("state")) X.store.set("pstate", state);
  var DELAY = state === "slow" ? 1400 : 0;

  /* Removed photos: hidden at once, Undo for 5 minutes, then gone (P-D17 B). The mockup keeps the removal time per photo. */
  var UNDO_MS = 5 * 60 * 1000;
  var removedAt = function () { try { return JSON.parse(sessionStorage.getItem("pho-removed") || "{}"); } catch (e) { return {}; } };
  var saveRemoved = function (o) { try { sessionStorage.setItem("pho-removed", JSON.stringify(o)); } catch (e) {} };
  (function () { var q = Q.get("removed"); if (q) { var o = removedAt(); q.split(",").forEach(function (id) { if (!o[id]) o[id] = Date.now() - 20000; }); saveRemoved(o); } })();
  var isRemoved = function (id) { return !!removedAt()[id]; };
  var remove = function (id) { var o = removedAt(); o[id] = Date.now(); saveRemoved(o); };
  var restore = function (id) { var o = removedAt(); delete o[id]; saveRemoved(o); };
  var undoLeft = function (id) { var t = removedAt()[id]; return t ? Math.max(0, UNDO_MS - (Date.now() - t)) : 0; };

  var photos = function (r) {
    if (state === "none") return [];
    var ov = X.bannerOv(), live = (PH[r.id] || []).filter(function (p) { return !isRemoved(p.id); });
    var chosen = function (v) { var id = ov[r.id + ":" + v]; return id && live.some(function (q) { return q.id === id; }) ? id : null; };
    return live.map(function (p) {
      /* Make banner: the version's old banner photo stays, as a plain gallery photo */
      if (p.k === "banner" && chosen(p.v) && chosen(p.v) !== p.id) p = Object.assign({}, p, { k: "more" });
      return p;
    }).map(function (p) {
      /* "Being prepared" state: the banner and the step photos of this sample arrived without their sizes (an assistant upload). */
      return state === "prep" && (p.k === "banner" || p.k === "step") ? Object.assign({}, p, { prep: 1 }) : p;
    });
  };
  var chain = function (r, vid) {
    var v = r.vers.filter(function (x) { return x.id === vid; })[0] || r.vers.filter(function (x) { return x.def; })[0] || r.vers[0];
    var c = []; for (var d = 0; d <= v.depth; d++) c.push(d === v.depth ? v : r.vers.filter(function (x) { return x.depth === d; })[0]);
    return c;
  };
  /* nearest in the lineage: this version's own, else its parent's (marked), and so on. Never a cooked photo (P-D10 B). */
  var inherit = function (r, vid, test) {
    var c = chain(r, vid), all = photos(r);
    for (var i = c.length - 1; i >= 0; i--) { var p = all.filter(function (x) { return x.v === c[i].id && test(x); })[0]; if (p) return { p: p, inherited: i < c.length - 1, from: c[i] }; }
    return null;
  };
  /* the version's banner: its explicit Make banner choice if any (any photo of the recipe), else its own banner photo, else the nearest ancestor's */
  var bannerFor = function (r, vid) {
    var c = chain(r, vid), all = photos(r), ov = X.bannerOv();
    for (var i = c.length - 1; i >= 0; i--) {
      var id = ov[r.id + ":" + c[i].id], p = id && all.filter(function (x) { return x.id === id; })[0];
      if (!p) p = all.filter(function (x) { return x.v === c[i].id && x.k === "banner"; })[0];
      if (p) return { p: p, inherited: i < c.length - 1, from: c[i] };
    }
    return null;
  };
  var coverFor = bannerFor; /* older name, kept for links in other slices */
  var stepFor = function (r, vid, k) { return inherit(r, vid, function (p) { return p.k === "step" && p.step === k; }); };
  var stepCount = function (r, vid) { return photos(r).filter(function (p) { return p.k === "step" && p.v === vid; }).length; };

  /* Loaded-bytes meter, by loading phase: proves the default path's cost (DESIGN.md section 6). Prototype only. */
  var loaded = {}, total = 0, byPhase = {};
  var PHASES = [["text", "Text and placeholders"], ["plan", "Planned this week"], ["near", "On screen + next 5"], ["step", "Step photos"], ["banner", "Banner"], ["scroll", "Scrolled into view"], ["demand", "On demand (a tap)"]];
  var meter = function () {
    var m = document.getElementById("pmeter"); if (!m) return;
    m.innerHTML = "<b>" + Object.keys(loaded).length + "</b> photo files, <b>" + (total / 1024).toFixed(1) + " KB</b> in the order they loaded:" +
      '<ol class="mphase">' + PHASES.map(function (ph) { var x = byPhase[ph[0]]; return ph[0] === "text" ? '<li><span>1 ' + ph[1] + "</span><b>0 requests</b></li>" : x ? "<li><span>" + ph[1] + "</span><b>" + x.n + " · " + (x.b / 1024).toFixed(1) + " KB</b></li>" : ""; }).join("") + "</ol>";
  };
  var SZ = { t: 0, m: 1, l: 2 };

  /* Frame: size known up front (no jump), the photo's colour underneath (no request). Options:
     phase  when it loads: step | banner | plan | near | scroll | demand (never by itself)
     lq     the inline 24px preview under the image (banner only)
     inh    the version name it is inherited from: a small icon with a title until this version has its own (P-D10 B)
     stock  the list's stock placeholder until its turn (P-D21)
     prep   the derived sizes are not made yet: a calm line, no spinner, no request (P-D7 C) */
  var frame = function (pid, size, o) {
    o = o || {}; var m = META[pid] || { c: "" };
    var st = "--pc:" + m.c + (o.lq && m.lq ? ";--lq:url(" + m.lq + ")" : "");
    var inh = o.inh ? '<span class="pinh" title="Photo of ' + X.esc(o.inh) + ', until this version has its own">' + X.ic("branch", "xs") + '<span class="vh">Photo of ' + X.esc(o.inh) + ", until this version has its own</span></span>" : "";
    if (o.prep) return '<span class="pf prep" style="' + st + '" role="img" aria-label="Photo is being prepared"><span class="pprep">' + X.ic("img", "xs") + '<span data-prepline>' + (o.small ? "Soon" : "Photo is being prepared") + "</span></span>" + inh + "</span>";
    return '<span class="pf' + (o.lq && m.lq ? " lq" : "") + (o.stock ? " stock" : "") + '" style="' + st + '" data-pid="' + pid + '" data-size="' + size + '" data-phase="' + (o.phase || "scroll") + '">' +
      (o.stock ? X.ic("chef") : "") +
      '<img class="pi" alt="' + X.esc(o.alt || "") + '" decoding="async"' + (size === "t" ? ' width="240" height="240"' : size === "m" ? ' width="960" height="720"' : ' width="1600" height="1200"') + ">" + inh + "</span>";
  };
  var fetchOne = function (el, phase) {
    if (!el || el.dataset.go) return Promise.resolve(); el.dataset.go = 1;
    var pid = el.dataset.pid, size = el.dataset.size, img = el.querySelector("img"); phase = phase || el.dataset.phase;
    return new Promise(function (done) {
      img.onload = function () {
        el.classList.add("in"); var k = pid + "-" + size;
        if (!loaded[k]) { loaded[k] = 1; var b = (META[pid].b[SZ[size]] || 0); total += b; var x = byPhase[phase] = byPhase[phase] || { n: 0, b: 0 }; x.n++; x.b += b; meter(); }
        done();
      };
      img.onerror = function () { done(); };
      setTimeout(function () { img.src = "img/" + (META[pid].f || pid) + "-" + size + ".webp"; }, DELAY); /* f: a sample row reusing another sample file */
    });
  };
  var io = null, ioRoot = null;
  /* phase(root, name): fetch every frame of that phase now, in document order; resolves when all have arrived */
  var phase = function (root, name) { return Promise.all([].map.call((root || document).querySelectorAll('.pf[data-phase="' + name + '"]:not([data-go])'), function (el) { return fetchOne(el, name); })); };
  /* watch(root): "scroll" frames load only when they come within 200px of the screen */
  var watch = function (root, scroller) {
    var els = [].slice.call((root || document).querySelectorAll('.pf[data-phase="scroll"]:not([data-go])'));
    if (!("IntersectionObserver" in window)) { els.forEach(function (el) { fetchOne(el); }); return; }
    if (!io || ioRoot !== (scroller || null)) { if (io) io.disconnect(); ioRoot = scroller || null; io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { io.unobserve(e.target); fetchOne(e.target, "scroll"); } }); }, { root: ioRoot, rootMargin: "200px 0px" }); }
    els.forEach(function (el) { io.observe(el); });
  };
  /* after the text has painted (two frames), so the words are on screen before the first image request */
  var afterPaint = function (fn) { requestAnimationFrame(function () { requestAnimationFrame(function () { setTimeout(fn, 0); }); }); };
  /* compatibility for screens that only need "load what is visible": eager frames now, the rest as they scroll in */
  var load = function (root) {
    (root || document).querySelectorAll(".pf:not([data-go])").forEach(function (el) {
      var ph = el.dataset.phase;
      if (ph === "demand" || ph === "step" || ph === "banner" || ph === "plan" || ph === "near") { if (el.hasAttribute("data-eager")) fetchOne(el); return; }
    });
    watch(root);
  };
  /* eager(root): a screen or sheet the person just opened by a tap: everything in it loads now (counted as "on demand") */
  var eager = function (root) { (root || document).querySelectorAll(".pf:not([data-go]):not(.prep)").forEach(function (el) { fetchOne(el, "demand"); }); };

  /* "Being prepared" (P-D7 C): no spinner that never ends. The page checks back a few times (30 s, 1, 2 min in the build; a few seconds
     in the mockup), then stops and the line says "Photo will appear later". When the sizes arrive, the image fades in; the box was
     already its size, so nothing moves. */
  var prepWatch = function (root, onReady) {
    var els = (root || document).querySelectorAll(".pf.prep"); if (!els.length) return;
    var demoReady = Q.get("arrive") === "1";
    setTimeout(function () {
      if (demoReady && onReady) { onReady(); return; }
      (root || document).querySelectorAll(".pf.prep [data-prepline]").forEach(function (s) { if (!s.closest(".th")) s.textContent = "Photo will appear later"; });
    }, demoReady ? 2500 : 6000);
  };

  /* Viewer: the photo's own big size (l for a banner, m for anything else) loads only here, only for the photo opened.
     Replace and Remove for every member (L5). Remove: hidden at once, Undo for 5 minutes, then gone (P-D17 B). */
  var label = function (r, p) {
    var vname = (r.vers.filter(function (x) { return x.id === p.v; })[0] || {}).name || "";
    if (p.k === "cooked") return "Cooked " + p.when + " by " + p.by;
    if (p.k === "banner") return "Banner of " + vname;
    if (p.k === "step") return "Step " + (p.step + 1) + " of " + vname;
    return "Photo of " + vname;
  };
  var viewer = function (r, p, opts) {
    opts = opts || {};
    var ph = document.querySelector(".phone");
    var vname = (r.vers.filter(function (x) { return x.id === p.v; })[0] || {}).name || "";
    var d = document.createElement("div"); d.className = "pv"; d.setAttribute("role", "dialog"); d.setAttribute("aria-modal", "true"); d.setAttribute("aria-label", "Photo");
    var cur = bannerFor(r, opts.vid || p.v), isBanner = !!cur && cur.p.id === p.id && !cur.inherited;
    var canMake = !isBanner && !opts.inheritedFrom && opts.vid;
    var rep = p.k === "banner" ? "Replace banner" : p.k === "step" ? "Replace step photo" : "Replace";
    var kindQ = p.k === "banner" ? "banner" : p.k === "step" ? "step&sn=" + p.step : p.k === "cooked" ? "cooked&cook=" + encodeURIComponent(p.cook) : "more";
    var kb = META[p.id] ? Math.round((META[p.id].b[0] + (META[p.id].b[SZ[big(p)]] || 0)) / 1024 * 10) / 10 : 0;
    d.innerHTML = '<div class="top"><button type="button" class="ib bare" data-x aria-label="Close">' + X.ic("x") + '</button><span class="ttl">' + X.esc(r.name) + '</span><span style="width:44px"></span></div>' +
      '<div class="stagep">' + (p.prep ? frame(p.id, big(p), { prep: 1 }) : frame(p.id, big(p), { phase: "demand", alt: label(r, p) })) + "</div>" +
      '<div class="meta2"><b>' + X.esc(label(r, p)) + "</b>" + (p.k === "cooked" ? " · " + X.esc(vname) : " · added by " + X.esc(p.by) + ", " + p.when) + (p.line ? '<br>"' + X.esc(p.line) + '"' : "") +
      (isBanner ? '<br><span class="pinl">' + X.ic("img", "xs") + " This is the banner. A version always has one: replace it, or make another photo the banner.</span>" : "") + (opts.inheritedFrom ? '<br><span class="pinl">' + X.ic("branch", "xs") + " This is " + X.esc(opts.inheritedFrom) + "'s photo. " + X.esc(opts.viewing) + " shows it until it has its own.</span>" : "") +
      '<br><small>Kept as ' + KEEP[p.k].map(function (s) { return { l: "large", m: "medium", t: "square" }[s]; }).join(" and ") + (kb ? ", about " + kb + " KB on the server (mockup files)" : "") + "</small></div>" +
      '<div class="acts">' + (canMake ? '<button type="button" class="btn mb" data-mb>' + X.ic("img", "s") + "Make banner</button>" : "") +
        (opts.inheritedFrom ? '<a class="btn" href="add.html?to=' + r.id + "&kind=" + kindQ + "&v=" + opts.vid + '">' + X.ic("cam", "s") + "Add its own</a>" :
          '<a class="btn ghost" href="add.html?to=' + r.id + "&kind=" + kindQ + "&v=" + p.v + "&replace=" + p.id + '">' + X.ic("cam", "s") + rep + "</a>" +
          (isBanner ? "" : '<button type="button" class="btn ghost" data-rm>' + X.ic("x", "s") + "Remove</button>")) +
      "</div>";
    ph.appendChild(d); phase(d, "demand");
    var close = function () { d.remove(); };
    d.addEventListener("click", function (e) {
      var t = e.target.closest("button"); if (!t) return;
      if (t.hasAttribute("data-x")) close();
      else if (t.hasAttribute("data-mb")) { var prev = X.setBanner(r, opts.vid, p.id); close(); if (opts.onBanner) opts.onBanner(function () { X.setBanner(r, opts.vid, prev); }); }
      else if (t.hasAttribute("data-rm")) X.sheet('<h3>Remove this photo?</h3><p style="font-size:13px">It disappears for everyone in the household now. You can undo it for <b>5 minutes</b>; after that it is gone for good. The recipe and its history stay as they are.</p>' +
          (p.k === "banner" ? '<p style="font-size:13px;margin-top:6px">It is the banner, so ' + X.esc(vname) + " will show " + (opts.nextBanner || "no photo at the top") + " instead.</p>" : "") +
          '<div style="display:flex;gap:8px;margin-top:14px"><button class="btn ghost" data-close>Keep it</button><button class="btn" data-close data-really>Remove</button></div>',
        function (s) { s.addEventListener("click", function (e) { if (e.target.closest("[data-really]")) { close(); remove(p.id); if (opts.onRemove) opts.onRemove(p); } }); });
    });
    d.querySelector("[data-x]").focus();
  };
  /* The undo line: one slim row while any photo was removed in the last 5 minutes, with the time left. */
  var undoBar = function (r) {
    var ids = (r ? (PH[r.id] || []) : Object.keys(PH).reduce(function (a, k) { return a.concat(PH[k]); }, [])).filter(function (p) { return undoLeft(p.id) > 0; });
    if (!ids.length) return "";
    var left = Math.max.apply(null, ids.map(function (p) { return undoLeft(p.id); }));
    var mm = Math.floor(left / 60000), ss = Math.floor(left % 60000 / 1000);
    return '<div class="pundo" role="status">' + X.ic("undo", "s") + '<span class="t"><b>' + (ids.length > 1 ? ids.length + " photos removed" : "Photo removed") + '</b><small>Undo for <span data-left>' + mm + ":" + (ss < 10 ? "0" : "") + ss + "</span>, then gone for good</small></span>" +
      '<button type="button" class="mini" data-undo="' + ids.map(function (p) { return p.id; }).join(",") + '">Undo</button></div>';
  };
  var tickUndo = function (root, redraw) {
    clearInterval(tickUndo.t);
    tickUndo.t = setInterval(function () {
      var el = (root || document).querySelector("[data-left]"); if (!el) return;
      var ids = el.closest(".pundo").querySelector("[data-undo]").dataset.undo.split(","), left = Math.max.apply(null, ids.map(undoLeft));
      if (left <= 0) { clearInterval(tickUndo.t); if (redraw) redraw(); return; }
      el.textContent = Math.floor(left / 60000) + ":" + ("0" + Math.floor(left % 60000 / 1000)).slice(-2);
    }, 1000);
  };

  /* Add-photo links. P-D25: after-cook photos lead; every add door opens the phone's own camera or picker, aimed. */
  var addHref = function (r, o) {
    o = o || {};
    return "add.html?to=" + r.id + "&kind=" + (o.kind || "cooked") + (o.cook ? "&cook=" + encodeURIComponent(o.cook) : "") + (o.sn != null ? "&sn=" + o.sn : "") + (o.v ? "&v=" + o.v : "") + (o.from ? "&from=" + o.from : "");
  };
  var noteHref = function (r, o) { o = o || {}; return "note.html?to=" + r.id + (o.from ? "&from=" + o.from : "") + (o.cook ? "&cook=" + encodeURIComponent(o.cook) : ""); };
  var addSheet = function (r, kind) { location.href = addHref(r, { kind: kind === "dish" || kind === "banner" ? "banner" : "cooked" }); };

  /* Note body: the tiny Markdown subset to safe HTML. Text escaped first; only bold, list lines and photo references become markup.
     A photo in a note loads on demand (a tap). A [photo:<id>] whose photo was removed renders nothing (the text stays). */
  var noteHtml = function (body, gone) {
    gone = gone || {};
    var out = [], list = [];
    var flush = function () { if (list.length) { out.push("<ul>" + list.join("") + "</ul>"); list = []; } };
    var inline = function (t) { return X.esc(t).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>"); };
    String(body).split("\n").forEach(function (ln) {
      var m = ln.match(/^\[photo:([\w-]+)\]$/);
      if (m) { flush(); if (META[m[1]] && !gone[m[1]] && !isRemoved(m[1]) && state !== "none") out.push('<button type="button" class="nph" data-open="' + m[1] + '" aria-label="Photo in this note, tap to open">' + frame(m[1], "t", { phase: "demand", alt: "" }) + "</button>"); return; }
      if (/^- /.test(ln)) { list.push("<li>" + inline(ln.slice(2)) + "</li>"); return; }
      flush(); if (ln.trim()) out.push("<p>" + inline(ln) + "</p>");
    });
    flush(); return '<div class="nbody">' + out.join("") + "</div>";
  };

  /* Prototype controls, same button and panel as the rest of recipe/ (classes .mockb / .mockp from recipe.css). */
  var controls = function (extra) {
    var seg = function (k, cur, opts) { return '<div class="seg" role="group">' + opts.map(function (o) { return '<button type="button" data-pset="' + k + '" data-v="' + o[0] + '" aria-pressed="' + (cur === o[0]) + '">' + o[1] + "</button>"; }).join("") + "</div>"; };
    var b = document.createElement("button"); b.type = "button"; b.className = "mockb"; b.textContent = "Mockup"; b.setAttribute("aria-expanded", "false");
    var p = document.createElement("div"); p.className = "mockp"; p.hidden = true;
    p.innerHTML = '<h4>What this screen loaded</h4><div class="meter" id="pmeter"></div>' +
      "<h4>Photo state</h4>" + seg("state", state, [["photos", "Has photos"], ["prep", "Being prepared"], ["none", "No photos yet"], ["slow", "Slow network"]]) +
      "<h4>Who is using it</h4>" + seg("persona", X.P.persona, X.PERSONAS.map(function (x) { return [x[0], x[2]]; })) +
      (extra || "") +
      '<h4>Theme</h4><div class="tgrid swatches">' + (window.themeHtml ? themeHtml(null, true) : "") + "</div>" +
      '<h4>Screens</h4><p><a href="index.html">Photos: decisions</a> · <a href="list.html">List</a> · <a href="recipe.html?id=efr">Recipe</a> · <a href="add.html?to=efr&kind=cooked">Add a photo</a> · <a href="note.html?to=efr">Add a note</a> · <a href="done.html?to=efr&kind=cooked">Saved</a> · <a href="assistant.html">From the assistant</a> · <a href="free.html">Free up space</a> · <a href="../recipe/index.html">Recipe tab</a></p>';
    document.body.appendChild(p); document.body.appendChild(b); meter();
    b.addEventListener("click", function () { p.hidden = !p.hidden; b.setAttribute("aria-expanded", String(!p.hidden)); if (window.themeWarm) themeWarm(); });
    p.addEventListener("click", function (e) {
      var x = e.target.closest("[data-pset]"); if (!x) return;
      var u = new URL(location.href);
      if (x.dataset.pset === "state") { X.store.set("pstate", x.dataset.v); u.searchParams.delete("state"); }
      else { X.store.set(x.dataset.pset, x.dataset.v); u.searchParams.delete(x.dataset.pset); }
      location.href = u.toString();
    });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") p.hidden = true; });
  };

  window.PHO = { META: META, PH: PH, KEEP: KEEP, big: big, NOTES: NOTES, state: state, photos: photos, chain: chain, bannerFor: bannerFor, coverFor: coverFor, stepFor: stepFor, stepCount: stepCount,
    frame: frame, fetchOne: fetchOne, phase: phase, watch: watch, afterPaint: afterPaint, load: load, eager: eager, prepWatch: prepWatch, viewer: viewer, label: label,
    isRemoved: isRemoved, remove: remove, restore: restore, undoLeft: undoLeft, undoBar: undoBar, undoBarAll: function () { return undoBar(null); }, tickUndo: tickUndo, UNDO_MS: UNDO_MS,
    addSheet: addSheet, addHref: addHref, noteHref: noteHref, noteHtml: noteHtml, controls: controls, meter: meter };
})();
