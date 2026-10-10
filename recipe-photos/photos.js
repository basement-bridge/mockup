/* Recipe photos slice: sample photo data, the lazy loader, and the shared pieces (frame, viewer, add sheet).
   Needs ../recipe/recipe.js (RCP) first. Sample names and bytes live here only (AGENTS.md).
   Build note: frame() is the markup the app should render server-side; load() is the ~40 lines of deferred JS the app needs. */
(function () {
  var X = window.RCP;
  /* Per photo: dominant colour (c), bytes of the three derived sizes t/m/l (b), and the tiny inline preview (lq, hero only).
     In the build these come back from Recipe with the recipe, so the page can paint the placeholder with no extra request (P-D5). */
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
    "len-1": { c: "#be875f", b: [2254, 7352, 13770], lq: "data:image/webp;base64,UklGRo4AAABXRUJQVlA4IIIAAACwBACdASoYABIAPu1kq06ppaOiKA1RMB2JbACdMoSBgBMqpftTMH9LVBqcPcMAAPcI+5YrIBk2i6L982GN30ogyxz5H7YuiNsio6bj0EtUr6eFHqVGum2Y7Jo/RPHflMlnyTbP80iU4HIsO128ji6Xfh7OjZnAeZFKpf2//ksUoAAA" }
  };
  /* Photos per recipe family. k: "dish" (the recipe's own photos; one per version can be its cover) or "cooked" (attached to one cook).
     v: the version it belongs to. cover: this photo is that version's cover. A version with no cover inherits the nearest ancestor's (P-D9). */
  var PH = {
    efr: [
      { id: "efr-1", k: "dish", v: "v1", cover: 1, by: "Jane", when: "20 Sep" },
      { id: "efr-2", k: "dish", v: "v0", cover: 1, by: "Sam", when: "3 Sep" },
      { id: "efr-3", k: "dish", v: "v0", by: "Sam", when: "3 Sep" },
      { id: "efr-c1", k: "cooked", v: "v1", by: "Sam", when: "8 Oct", line: "Used brown rice, fine." },
      { id: "efr-c2", k: "cooked", v: "v1", by: "Jane", when: "29 Sep" },
      { id: "efr-c3", k: "cooked", v: "v0", by: "Sam", when: "21 Sep", line: "Doubled it for lunches." }
    ],
    cur: [{ id: "cur-1", k: "dish", v: "v0", cover: 1, by: "Priya", when: "14 Aug" }],
    sha: [{ id: "sha-1", k: "dish", v: "v0", cover: 1, by: "Alex", when: "2 Sep" }],
    rag: [{ id: "rag-1", k: "cooked", v: "v0", by: "Priya", when: "5 Sep", line: "10 portions." }],
    pas: [], fri: [], oml: []
  };
  /* Notes (P-D26, P-D27): the household's, on the family (R-D24), shown on every version. Simple rich text: a tiny Markdown
     subset (**bold**, "- " list lines) and photos by reference, [photo:<id>], never bytes. cook: the cook it was written after
     (a reference, shown as a tag), or null. Sample only; the flow slice's plain notes in recipe.js are shown first. */
  var NOTES = {
    efr: [{ id: "n-efr-1", by: "Sam", when: "8 Oct", cook: "8 Oct", body: "**Brown rice works** if it is day-old.\n- 2 tbsp more soy\n- Fry the rice longer\n[photo:efr-c1]" }]
  };
  var Q = X.Q;
  var state = Q.get("state") || X.store.get("pstate", "photos"); /* photos | none | slow */
  if (Q.get("state")) X.store.set("pstate", state);
  var DELAY = state === "slow" ? 2600 : 0;

  /* cover for a version: its own, else the nearest ancestor's (depth order in the sample) */
  var coverFor = function (r, vid) {
    var list = (PH[r.id] || []);
    if (state === "none") return null;
    var v = r.vers.filter(function (x) { return x.id === vid; })[0] || r.vers[0];
    for (var d = v.depth; d >= 0; d--) {
      var anc = d === v.depth ? v : r.vers.filter(function (x) { return x.depth === d; })[0];
      var c = list.filter(function (p) { return p.cover && p.v === anc.id; })[0];
      if (c) return { p: c, inherited: anc.id !== v.id, from: anc };
    }
    /* P-D10 C: no cover anywhere up the line, so the newest cooked photo stands in, labelled with its date */
    var ck = list.filter(function (p) { return p.k === "cooked"; })[0];
    return ck ? { p: ck, inherited: false, from: v, cooked: true } : null;
  };
  var photos = function (r) { return state === "none" ? [] : (PH[r.id] || []); };

  /* Loaded-bytes meter: proves the default path's cost (DESIGN.md section 6). Prototype only. */
  var loaded = {}, total = 0;
  var meter = function () { var m = document.getElementById("pmeter"); if (m) m.innerHTML = "<b>" + Object.keys(loaded).length + "</b> photo files loaded, <b>" + (total / 1024).toFixed(1) + " KB</b> (placeholders: 0 requests)"; };
  var SZ = { t: 0, m: 1, l: 2 };

  /* P-D14 frame: size known up front, colour underneath, image fetched only when near the viewport (or on demand). */
  var frame = function (pid, size, o) {
    o = o || {}; var m = META[pid];
    var st = "--pc:" + m.c + (o.lq ? ';--lq:url(' + m.lq + ')' : "");
    return '<span class="pf' + (o.lq ? " lq" : "") + '" style="' + st + '" data-pid="' + pid + '" data-size="' + size + '"' + (o.eager ? ' data-eager' : '') + (o.ondemand ? ' data-ondemand' : '') + '>' +
      '<img class="pi" alt="' + X.esc(o.alt || "") + '" decoding="async"' + (size === "t" ? ' width="240" height="240"' : size === "m" ? ' width="960" height="720"' : ' width="1600" height="1200"') + '>' +
      (DELAY ? '<span class="spin" aria-hidden="true"></span>' : '') + '</span>';
  };
  var fetchOne = function (el) {
    if (el.dataset.go) return; el.dataset.go = 1;
    var pid = el.dataset.pid, size = el.dataset.size, img = el.querySelector("img");
    img.onload = function () { el.classList.add("in"); var k = pid + "-" + size; if (!loaded[k]) { loaded[k] = 1; total += META[pid].b[SZ[size]]; meter(); } };
    setTimeout(function () { img.src = "img/" + pid + "-" + size + ".webp"; }, DELAY);
  };
  var io = "IntersectionObserver" in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { io.unobserve(e.target); fetchOne(e.target); } });
  }, { rootMargin: "200px 0px" }) : null;
  /* load(): eager frames now (the one above-the-fold hero), others when within 200px of the viewport; on-demand ones never by themselves */
  var load = function (root) {
    (root || document).querySelectorAll(".pf:not([data-go])").forEach(function (el) {
      if (el.hasAttribute("data-ondemand")) return;
      if (el.hasAttribute("data-eager") || !io) fetchOne(el); else io.observe(el);
    });
  };

  /* Viewer: the large size loads only here, only for the photo opened (P-D14). */
  var viewer = function (r, p, opts) {
    opts = opts || {};
    var ph = document.querySelector(".phone");
    /* P-D17 as changed by owner decision L5 (10 Oct 2026): the person who added it, or any member for now (restrictions later). */
    var me = X.me[2], mine = p.by === me;
    var vname = (r.vers.filter(function (x) { return x.id === p.v; })[0] || {}).name || "";
    var d = document.createElement("div"); d.className = "pv"; d.setAttribute("role", "dialog"); d.setAttribute("aria-modal", "true"); d.setAttribute("aria-label", "Photo");
    d.innerHTML = '<div class="top"><button type="button" class="ib bare" data-x aria-label="Close">' + X.ic("x") + '</button><span class="ttl">' + X.esc(r.name) + '</span><span style="width:44px"></span></div>' +
      '<div class="stagep">' + frame(p.id, "l", { eager: 1, alt: (p.k === "cooked" ? "Cooked by " + p.by + ", " + p.when : "Photo of " + r.name) }) + '</div>' +
      '<div class="meta2">' + (p.k === "cooked" ? '<b>Cooked ' + p.when + '</b> by ' + X.esc(p.by) + ' · ' + X.esc(vname) + (p.line ? '<br>"' + X.esc(p.line) + '"' : '') : '<b>' + (p.cover ? "Cover of " + X.esc(vname) : "Photo of " + X.esc(vname)) + '</b> · added by ' + X.esc(p.by) + ', ' + p.when) +
      (mine ? '' : '<br>Anyone in the household can remove it.') + '</div>' +
      '<div class="acts">' +
        (p.cover ? '<a class="btn ghost" href="add.html?to=' + r.id + '&kind=dish&cover=1&replace=' + p.id + '">' + X.ic("cam", "s") + 'Replace cover</a>' : '<button type="button" class="btn ghost" data-cover>' + X.ic("img", "s") + 'Use as cover</button>') +
        '<button type="button" class="btn ghost" data-rm>' + X.ic("x", "s") + 'Remove</button>' +
      '</div>';
    ph.appendChild(d); load(d);
    var close = function () { d.remove(); };
    d.addEventListener("click", function (e) {
      var t = e.target.closest("button"); if (!t) return;
      if (t.hasAttribute("data-x")) close();
      else if (t.hasAttribute("data-cover")) { close(); if (opts.onCover) opts.onCover(p); }
      else if (t.hasAttribute("data-rm")) X.sheet('<h3>Remove this photo?</h3><p style="font-size:13px">It disappears for everyone in the household now. You can bring it back from Removed photos for 30 days; after that it is gone for good.</p>' +
          (p.cover ? '<p style="font-size:13px;margin-top:6px">It is the cover, so ' + X.esc(vname) + ' will show ' + (opts.nextCover || "no photo") + ' instead.</p>' : '') +
          '<div style="display:flex;gap:8px;margin-top:14px"><button class="btn ghost" data-close>Keep it</button><button class="btn" data-close data-really>Remove</button></div>' +
          '<button type="button" class="back" data-close data-now style="font-size:13px;margin-top:6px">Delete it for good now (for a photo that should not be here)</button>',
        function (s, cl) { s.addEventListener("click", function (e) { if (e.target.closest("[data-really]")) { close(); if (opts.onRemove) opts.onRemove(p, false); } else if (e.target.closest("[data-now]")) { close(); if (opts.onRemove) opts.onRemove(p, true); } }); });
    });
    d.querySelector("[data-x]").focus();
  };

  /* Add a photo. P-D25 (after-cook photos lead): every add door goes straight to the phone's own camera or picker, aimed at the
     newest cook ("what you made tonight"). No sheet in between. The cover is the secondary path (P-D11 as changed): a link on the
     add screen and Replace cover in the viewer. cook: the cook's date in the sample (its id in the build). */
  var addHref = function (r, o) {
    o = o || {};
    return "add.html?to=" + r.id + "&kind=" + (o.kind || "cooked") + (o.cook ? "&cook=" + encodeURIComponent(o.cook) : "") + (o.v ? "&v=" + o.v : "") + (o.from ? "&from=" + o.from : "");
  };
  var noteHref = function (r, o) { o = o || {}; return "note.html?to=" + r.id + (o.from ? "&from=" + o.from : "") + (o.cook ? "&cook=" + encodeURIComponent(o.cook) : ""); };
  /* kept for older links: opens the add route directly (the sheet's three doors were dropped with P-D25) */
  var addSheet = function (r, kind) { location.href = addHref(r, { kind: kind === "dish" ? "dish" : "cooked" }); };

  /* Note body: the tiny Markdown subset to safe HTML. Text is escaped first; only bold, list lines and photo references
     become markup. A [photo:<id>] whose photo was removed renders nothing (the note's text stays). */
  var noteHtml = function (body, gone) {
    gone = gone || {};
    var out = [], list = [];
    var flush = function () { if (list.length) { out.push("<ul>" + list.join("") + "</ul>"); list = []; } };
    var inline = function (t) { return X.esc(t).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>"); };
    String(body).split("\n").forEach(function (ln) {
      var m = ln.match(/^\[photo:([\w-]+)\]$/);
      if (m) { flush(); if (META[m[1]] && !gone[m[1]] && state !== "none") out.push('<button type="button" class="nph" data-open="' + m[1] + '" aria-label="Photo in this note">' + frame(m[1], "t", { alt: "" }) + "</button>"); return; }
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
      "<h4>Photo state</h4>" + seg("state", state, [["photos", "Has photos"], ["none", "No photos yet"], ["slow", "Slow network"]]) +
      "<h4>Who is using it</h4>" + seg("persona", X.P.persona, X.PERSONAS.map(function (x) { return [x[0], x[2]]; })) +
      (extra || "") +
      '<h4>Theme</h4><div class="tgrid swatches">' + (window.themeHtml ? themeHtml(null, true) : "") + "</div>" +
      '<h4>Screens</h4><p><a href="index.html">Photos: decisions</a> · <a href="list.html">List</a> · <a href="recipe.html?id=efr">Recipe</a> · <a href="add.html?to=efr&kind=cooked">Add a photo</a> · <a href="note.html?to=efr">Add a note</a> · <a href="done.html?to=efr&kind=cooked&n=2">Saved</a> · <a href="assistant.html?to=rag">From the assistant</a> · <a href="../recipe/index.html">Recipe tab</a></p>';
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

  window.PHO = { META: META, PH: PH, NOTES: NOTES, state: state, coverFor: coverFor, photos: photos, frame: frame, load: load, viewer: viewer, addSheet: addSheet, addHref: addHref, noteHref: noteHref, noteHtml: noteHtml, controls: controls };
})();
