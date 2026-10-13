/* Desktop host for the summary flyout with the share panel (1024px and up). Viewport-specific on purpose: the rail, the list column, the 400px right lane,
   and the keys (S, O, Esc, the close chord, ?). Fetched only when the window is 1024px or wider (DESIGN.md sections 6 and 7). */
(function () {
  "use strict";
  var FL = window.FL, S = FL.S, ic = FL.ic, esc = FL.esc, MOD = FL.MOD;
  var stage = document.getElementById("fl-stage"), tt, tick;
  var q = new URLSearchParams(location.search), start = FL.PRESETS[q.get("state")] ? q.get("state") : "none";

  function nv(i, t, on) { return '<span class="rb-nv' + (on ? " on" : "") + '">' + ic(i) + t + "</span>"; }
  function rows() {
    return FL.ROWS.map(function (r, i) {
      var inner = '<span class="rb-e">' + r[0] + '</span><span class="rb-t"><b>' + esc(r[1]) + "</b><small>" + r[2] + "</small>" + (r[3] ? '<span class="rb-tg">' + r[3] + "</span>" : "") + "</span>";
      return i === 0 ? '<button type="button" class="rb-rr sel" data-act="reopen" aria-label="' + esc(r[1]) + ', open the summary">' + inner + "</button>" : '<div class="rb-rr" aria-hidden="true">' + inner + "</div>";
    }).join("");
  }
  var wrap = document.createElement("div"); wrap.className = "fl-stagewrap";
  wrap.innerHTML = '<div class="rb-frame fl-frame" id="fl-frame" aria-label="Desktop window"><nav class="rb-rail" aria-label="Main"><div class="rb-brand">Our<br>kitchen</div>' + nv("home", "Home") + nv("jar", "Pantry") + nv("book", "Recipes", true) + nv("cart", "Shopping") +
    '</nav><div class="rb-stage"><div class="rb-col"><div class="rb-sb">' + ic("search", "s") + 'Search recipes or ingredients</div><div class="rb-chips"><span class="on">All</span><span>Ready now</span><span>Starred</span><span>Batch</span><span>Under 30</span></div><h3 class="rb-h3">All recipes <span class="n">42</span></h3><div id="fl-rows">' + rows() + '</div></div>' +
    '<div class="rb-lane" id="fl-lane" data-open="true" data-layer="summary"><div class="rb-lane-idle">Pick a recipe to see it here.</div><div id="fl-sumslot"></div><div id="fl-shareslot"></div></div></div><div id="fl-over"></div></div>';
  stage.innerHTML = ""; stage.appendChild(wrap);
  var frame = document.getElementById("fl-frame"), lane = document.getElementById("fl-lane"), over = document.getElementById("fl-over");
  document.getElementById("fl-sumslot").outerHTML = FL.summaryHtml();

  function slot() { return lane.querySelector(".fl-share"); }
  function draw(focus) {
    var old = slot(), y = 0, fb = old && old.querySelector("[data-scroll]"); if (fb) y = fb.scrollTop;
    var html = FL.panelHtml();
    if (old) old.outerHTML = html; else document.getElementById("fl-shareslot").outerHTML = html;
    var nb = slot().querySelector("[data-scroll]"); if (nb && y) nb.scrollTop = y;
    document.getElementById("fl-chip").innerHTML = FL.chip();
    lane.dataset.open = String(S.open); lane.dataset.layer = S.layer;
    frame.classList.toggle("nocues", !S.cues);
    over.innerHTML = (S.help ? FL.helpHtml() : "") + (S.toast ? '<div class="fl-toast" role="status">' + esc(S.toast) + "</div>" : "");
    var b = document.querySelector("[data-preset]"); [].forEach.call(document.querySelectorAll("[data-preset]"), function (x) { x.setAttribute("aria-pressed", String(x.dataset.preset === S.key)); });
    if (FL.cap) FL.cap.textContent = FL.PRESETS[S.key] ? FL.PRESETS[S.key].cap : "";
    if (S.editing) { var i = frame.querySelector(".rs-edit input"); if (i) { i.focus(); i.select(); } return; }
    if (focus) { var el = frame.querySelector(focus); if (el) el.focus({ preventScroll: true }); }
  }
  function say(t) { S.toast = t; draw(); clearTimeout(tt); if (!FL.freeze) tt = setTimeout(function () { S.toast = ""; draw(); }, 2400); }
  function find(id) { return S.links.filter(function (l) { return String(l.id) === String(id); })[0]; }
  function sync() { try { history.replaceState(null, "", "?state=" + S.key + (FL.freeze ? "&freeze=1" : "")); } catch (e) {} }
  function reset(key) { FL.load(key); sync(); draw(); }
  function openShare() { S.layer = "share"; S.step = "list"; S.editing = null; draw("#fl-share-t"); }
  function back() {
    if (S.editing) { S.editing = null; draw(); return; }
    if (S.layer !== "share") return;
    if (S.step !== "list") { S.step = "list"; S.copied = false; draw("#fl-share-t"); return; }
    S.layer = "summary"; draw(".fl-sharebtn");
  }
  function closeFly() { if (S.help) { S.help = false; draw(); return; } S.open = false; S.editing = null; draw('[data-act="reopen"]'); }
  function reopen() { S.open = true; S.layer = "summary"; draw("#fl-title"); }
  function copyText(u) { try { navigator.clipboard.writeText(u).catch(function () {}); } catch (e) {} }

  frame.addEventListener("click", function (e) {
    var b = e.target.closest("[data-act]"); if (!b || !frame.contains(b)) return;
    var a = b.dataset.act, l = find(b.dataset.id);
    if (a === "helpscrim") { if (e.target === b) { S.help = false; draw(); } return; }
    if (a === "save" || a === "create") return;           /* handled on submit */
    if (a === "openrecipe") e.preventDefault();
    if (a === "share") openShare();
    else if (a === "back") back();
    else if (a === "close") closeFly();
    else if (a === "reopen") reopen();
    else if (a === "openrecipe") say("Open full recipe is another screen (browse flyout to full page).");
    else if (a === "cook" || a === "plan") say((a === "cook" ? "Cook now" : "Plan") + " is another screen.");
    else if (a === "rename") { S.editing = l.id; draw(); }
    else if (a === "keep") { S.editing = null; draw(); }
    else if (a === "copy") { copyText(FL.URLS + "Hq2xK9mPz"); say("Link copied. Paste it in a message."); }
    else if (a === "cancel") { l.cancelLeft = FL.UNDO_S; l.removed = false; S.editing = null; draw(); }
    else if (a === "remove") { l.cancelLeft = FL.UNDO_S; l.removed = true; draw(); }
    else if (a === "undo") { l.cancelLeft = 0; l.removed = false; draw(); }
    else if (a === "renew") { l.hours = 168; say("Renewed for 7 days. The same link works again."); }
    else if (a === "make") { S.step = "form"; S.form = { name: "Link " + (S.links.length + 1), exp: "7d", pin: true }; S.creating = false; draw("#fl-name"); var i = document.getElementById("fl-name"); if (i) i.select(); }
    else if (a === "exp") { S.form.exp = b.dataset.v; draw('[data-act="exp"][aria-pressed="true"]'); }
    else if (a === "pin") { S.form.pin = !S.form.pin; draw('[data-act="pin"]'); }
    else if (a === "copynew") { copyText(FL.URLS + "Hq2xK9mPz"); S.copied = true; draw("#fl-copy"); clearTimeout(tt); if (!FL.freeze) tt = setTimeout(function () { S.copied = false; draw(); }, 2600); }
    else if (a === "sharenew") { try { navigator.share({ title: FL.RECIPE.short, url: FL.URLS + "Hq2xK9mPz" }).catch(function () {}); } catch (x) { say("The browser's share sheet opens here."); } }
    else if (a === "done") { var m = S.links[S.links.length - 1]; S.step = "list"; S.copied = false; say("Link ready. Anyone with it can view " + FL.RECIPE.short + " until " + FL.dlab(FL.plus(Math.round(m.hours / 24))) + "."); }
    else if (a === "cues") { S.cues = !S.cues; draw('[data-act="cues"]'); }
    else if (a === "helpclose") { S.help = false; draw(); }
  });
  frame.addEventListener("submit", function (e) {
    var f = e.target.closest("form[data-act]"); if (!f) return; e.preventDefault();
    if (f.dataset.act === "save") {
      var l = find(f.dataset.id), v = f.n.value.trim(); if (v) l.name = v; S.editing = null; say(v ? "Renamed." : "A link needs a name, so the old one stays.");
    } else if (f.dataset.act === "create") {
      if (S.creating) return;
      S.form.name = f.n.value.trim() || "Link " + (S.links.length + 1); S.creating = true; draw();
      var go = function () { var id = S.nextId++; S.links.push({ id: id, name: S.form.name, hours: FL.expOf()[2], opens: 0, last: null, cancelLeft: 0, gone: false }); S.made = id; S.step = "created"; S.creating = false; draw("#fl-copy"); };
      if (FL.freeze) go(); else setTimeout(go, 650);
    }
  });
  frame.addEventListener("input", function (e) { if (e.target.id === "fl-name") S.form.name = e.target.value; });

  document.addEventListener("keydown", function (e) {
    if (e.isComposing || e.keyCode === 229) return;
    var t = e.target, typing = /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName || ""), mod = e.ctrlKey || e.metaKey;
    var inF = frame.contains(t) || t === document.body;
    if (!inF) return;
    if (mod && (e.key === "Escape" || e.key === "Enter")) { e.preventDefault(); closeFly(); return; }
    if (e.key === "Escape") { if (S.help) { S.help = false; draw(); } else if (S.open && S.layer === "share") { e.preventDefault(); back(); } return; }
    if (typing || mod || e.altKey) return;
    if (e.key === "?" || ((e.key === "h" || e.key === "H") && !e.shiftKey)) { S.help = !S.help; draw(S.help ? '[data-act="helpclose"]' : null); return; }
    if (S.help || !S.open || S.layer !== "summary") return;
    if (e.key === "s" || e.key === "S") { e.preventDefault(); openShare(); }
    else if (e.key === "o" || e.key === "O") { say("Open full recipe is another screen (browse flyout to full page)."); }
  });
  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-preset]"); if (!b) return; reset(b.dataset.preset);
  });
  if (!FL.freeze) setInterval(function () {
    var ch = false;
    S.links.forEach(function (l) { if (l.cancelLeft > 0) { l.cancelLeft--; if (l.cancelLeft === 0) { l.gone = true; ch = true; } else { var s = frame.querySelector('[data-left="' + l.id + '"]'); if (s) s.textContent = FL.mmss(l.cancelLeft); } } });
    if (ch) draw();
  }, 1000);
  FL.load(start); draw();
})();
