/* Edit by hand (owner, 11 Oct 2026, voice: REVERSES "assistant-only authoring" for editing). The assistant is still how a recipe is started;
   every part of a version can now be edited by hand in Kitchie. The data model does not change: the same version / revision / change-set model
   and the same Recipe service methods (patch_version and friends); the app is just another caller, with a member as the author.
   Rules kept: a try edits in place; a keeper asks at save (fix this one / keep both / different dish, V2 C); every save is one revision with
   per-change undo; nothing is hard-deleted (removing a saved row is a change in the revision, and History can undo it); a hand edit and an
   assistant edit land in the same History, with who did it shown. Notes use the single 4,000 character scrolling box (T7).
   Photos are not part of a revision (P6): they apply at once, undo for 5 minutes, and have their own sheet (edit-photo.js, fetched on first use).
   Picks used here (recommended defaults, owner to say yay, nay or combine): E-O1 one edit screen opened at the section you tapped; E-O2 Reorder
   mode with move arrows; E-O3 a fixed-frame crop you pan and zoom, plus rotate; E-O4 the keeper question as a sheet at Save; E-O5 desktop adds a
   changes lane. URL options: ?ask=sheet|inline  ?reorder=arrows|menu  ?sec=det|ing|met|not|pho  ?demo=changed|ask.
   Performance: this screen is its own route. Default path loads recipe.js, versions.js (state), this file and edit.css. Deferred: edit-photo.js
   and photos.css (first photo action), edit-desktop.js and .css (only at 1024px and up with a hover pointer), keys.js (already so). */
(function () {
"use strict";
var X = RCP, V = VER, ic = X.ic, esc = X.esc, Q = X.Q;
var BASE = (function () { var s = document.currentScript && document.currentScript.src; return s ? s.replace(/[^\/]*$/, "") : ""; })();
var r = X.byId(Q.get("id") || "efr") || X.R[0];
var res = X.resolve(r, Q.get("v")), v = res.v;
var vv = V.byId && V.byId(v.id);
var keeper = v.state !== "trying", usual = !!v.def;
var headN = vv ? V.head(vv).n : 1;
var multi = r.vers.length > 1;
var ph = document.getElementById("ph");
var askMode = Q.get("ask") === "inline" ? "inline" : "sheet";
var reorderMode = Q.get("reorder") === "menu" ? "menu" : "arrows";
var UNITS = ["", "g", "kg", "ml", "l", "tsp", "tbsp", "cup", "tin", "stick", "pinch"];
var TAGS = ["Quick", "Batch", "Freezes", "Make ahead"];
var MAXSTEPPH = 10, MAXGAL = 3;
var uid = 0, rnd = function (n) { return Math.round(n * 100) / 100; };
var back = "detail.html?id=" + r.id + "&v=" + v.id;

/* ---- the draft: a copy of what the version resolves to now, edited in place; saving turns the difference into one revision ---- */
var D, O;
function load() {
  var sc = r.serves; /* amounts are typed for the recipe's own serving count; Recipe stores them per serving (the build converts) */
  D = {
    name: r.name, vname: v.name, min: String(r.min), serves: String(r.serves), src: r.src, tags: (r.tags || []).slice(),
    ings: res.ings.map(function (x) { return { id: "i" + (uid++), key: x.i[0], name: x.i[1], q: x.i[2] == null ? "" : String(rnd(x.i[2] * sc)), u: x.i[3] || "", unk: x.i[2] == null, st: "", was: x.was }; }),
    steps: r.steps.map(function (s, k) { var p = X.stepPhoto(r, v.id, k); return { id: "s" + (uid++), t: s[0], m: s[2] ? String(s[2]) : "", ph: p ? { p: p.p, inh: p.inherited, from: p.from && p.from.name } : null, st: "" }; }),
    notes: X.notesFor(r, v.id).map(function (n) { return { id: "n" + (uid++), body: n.body, by: n.by, when: n.when, from: n.from, parent: n.parent, cook: n.cook, st: "", edit: false }; })
  };
  O = JSON.parse(JSON.stringify(D));
  D.steps.forEach(function (s, k) { O.steps[k].ph = null; }); /* photos are not part of a revision */
}
var orig = function (list, id) { return O[list].filter(function (x) { return x.id === id; })[0]; };
var qty = function (i) { return i.unk || i.q === "" ? "" : i.q + (i.u ? " " + i.u : ""); };
var ingText = function (i) { return (i.name || "(no name)") + (qty(i) ? " " + qty(i) : i.unk ? " (amount?)" : ""); };
var short = function (s, n) { s = String(s).replace(/\s+/g, " ").trim(); return s.length > (n || 60) ? s.slice(0, (n || 60) - 1) + "…" : s; };
var ingChanged = function (i) { var o = orig("ings", i.id); return !o || o.name !== i.name || o.q !== i.q || o.u !== i.u || o.unk !== i.unk; };
var stepChanged = function (s) { var o = orig("steps", s.id); return !o || o.t !== s.t || o.m !== s.m; };
var noteChanged = function (n) { var o = orig("notes", n.id); return !o || o.body !== n.body; };

/* ---- the change set: what Save would write. Same shape the versions slice draws: [kind, text, was] ---- */
function diff() {
  var out = [];
  var f = function (label, a, b) { if (String(a).trim() !== String(b).trim()) out.push(["chg", label + " " + a, b ? String(b) : ""]); };
  f("Name:", D.name, O.name); if (multi) f("Version name:", D.vname, O.vname);
  if (D.min !== O.min) out.push(["chg", "Time " + D.min + " min", O.min + " min"]);
  if (D.serves !== O.serves) out.push(["chg", (r.batch ? "Makes " : "Serves ") + D.serves, O.serves]);
  D.tags.forEach(function (t) { if (O.tags.indexOf(t) < 0) out.push(["add", "Tag: " + t]); });
  O.tags.forEach(function (t) { if (D.tags.indexOf(t) < 0) out.push(["rm", "Tag: " + t]); });
  if (D.src.trim() !== O.src.trim()) out.push(["chg", "Where it came from: " + short(D.src, 40), short(O.src, 30)]);
  D.ings.forEach(function (i) {
    var o = orig("ings", i.id);
    if (!o) { if (i.st !== "rm" && i.name.trim()) out.push(["add", ingText(i)]); }
    else if (i.st === "rm") out.push(["rm", ingText(o)]);
    else if (ingChanged(i)) out.push(["chg", ingText(i), ingText(o)]);
  });
  var order = function (list, key) {
    var a = O[list].filter(function (x) { return !x.new; }).map(function (x) { return x.id; });
    var b = D[list].filter(function (x) { return orig(list, x.id) && x.st !== "rm"; }).map(function (x) { return x.id; });
    var a2 = a.filter(function (id) { return b.indexOf(id) > -1; });
    return a2.join() !== b.join() ? [["chg", key + " in a new order"]] : [];
  };
  out = out.concat(order("ings", "Ingredients"));
  var n = 0;
  D.steps.forEach(function (s) {
    var o = orig("steps", s.id);
    if (s.st !== "rm") n++;
    if (!o) { if (s.st !== "rm" && s.t.trim()) out.push(["add", "Step " + n + ": " + short(s.t)]); }
    else if (s.st === "rm") out.push(["rm", "Step " + (O.steps.indexOf(o) + 1) + ": " + short(o.t)]);
    else if (stepChanged(s)) out.push(["chg", "Step " + n + ": " + short(s.t) + (s.m !== o.m ? " (" + (s.m ? s.m + " min" : "no timer") + ")" : ""), short(o.t)]);
  });
  out = out.concat(order("steps", "Method"));
  D.notes.forEach(function (nt) {
    var o = orig("notes", nt.id);
    if (!o) { if (nt.st !== "rm" && nt.body.trim()) out.push(["add", "Note: " + short(nt.body, 50)]); }
    else if (nt.st === "rm") out.push(["rm", "Note taken off this version: " + short(o.body, 40)]);
    else if (noteChanged(nt)) out.push(["chg", "Note: " + short(nt.body, 50), short(o.body, 30)]);
  });
  return out;
}

/* ---- render ---- */
var reord = { ing: false, met: false }, openSec = Q.get("sec") || "det", didScroll = false, asking = false, pick = null;
var PS = { undo: null }; /* photo state shared with edit-photo.js */

function band() {
  return keeper
    ? '<div class="band sage">' + ic("check", "s") + '<span class="t"><b>' + esc(v.name) + ' is a keeper' + (usual ? ' and our usual' : '') + '</b><small>When you save, you choose: fix this one, keep both, or a different dish.</small></span></div>'
    : '<div class="band">' + ic("flame", "s") + '<span class="t"><b>' + esc(v.name) + ' is a try</b><small>Your changes go straight in as revision ' + (headN + 1) + '. The old one stays in History.</small></span></div>';
}
function field(f, label, val, o) {
  o = o || {};
  return '<label class="edf"><span class="edlab">' + label + '</span><input class="field" data-f="' + f + '" value="' + esc(val) + '"' + (o.mode ? ' inputmode="' + o.mode + '"' : '') + (o.max ? ' maxlength="' + o.max + '"' : '') + ' autocomplete="off">' + (o.hint ? '<span class="hint">' + o.hint + '</span>' : '') + '</label>';
}
function secHead(label, extra) { return '<div class="lblrow"><span class="lbl">' + label + '</span>' + (extra || '') + '</div>'; }
function reorderBtn(k) {
  if (reorderMode === "menu") return "";
  return '<button type="button" class="mini" data-reord="' + k + '" aria-pressed="' + reord[k] + '">' + ic("down", "xs") + (reord[k] ? "Done" : "Reorder") + '</button>';
}
function actBtns(list, x, i, n) {
  /* the move arrows exist in Reorder mode (pattern A) or behind the row menu (pattern B); remove is always one tap and always undoable */
  var mv = reorderMode === "menu" ? '<button type="button" class="mini ico" data-menu="' + list + ":" + x.id + '" aria-label="More for this row" aria-haspopup="dialog">' + ic("dots", "s") + '</button>' :
    '<button type="button" class="mini ico mv" data-mv="' + list + ":" + x.id + ':-1" aria-label="Move up"' + (i === 0 ? ' disabled style="opacity:.35"' : '') + '><svg class="ic s" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 15l6-6 6 6"/></svg></button>' +
    '<button type="button" class="mini ico mv" data-mv="' + list + ":" + x.id + ':1" aria-label="Move down"' + (i === n - 1 ? ' disabled style="opacity:.35"' : '') + '>' + ic("down", "s") + '</button>';
  return mv + (reorderMode === "menu" ? "" : '<button type="button" class="mini ico rmv" data-rm="' + list + ":" + x.id + '" aria-label="Remove ' + esc(list === "ings" ? (x.name || "this ingredient") : "this step") + '">' + ic("x", "s") + '</button>');
}
function ingRow(x, i, n) {
  var o = orig("ings", x.id), cls = "edrow" + (x.st === "rm" ? " rm" : "") + (x.st !== "rm" && (!o || ingChanged(x)) ? " chg" : "");
  if (x.st === "rm") return '<div class="' + cls + '" data-row="ings:' + x.id + '"><div class="edmain"><input class="field" value="' + esc(x.name) + '" disabled aria-label="Removed ingredient"></div><span class="rmnote">Removed when you save. It stays in History.</span><div class="edact"><button type="button" class="mini" data-put="ings:' + x.id + '">' + ic("undo", "xs") + 'Put back</button></div></div>';
  return '<div class="' + cls + '" data-row="ings:' + x.id + '"><div class="edmain"><input class="field" data-i="name" data-id="' + x.id + '" value="' + esc(x.name) + '" placeholder="Ingredient" aria-label="Ingredient name" autocomplete="off"></div>' +
    '<div class="edmeta"><input class="field" data-i="q" data-id="' + x.id + '" value="' + esc(x.q) + '" inputmode="decimal" placeholder="Amount" aria-label="Amount"' + (x.unk ? ' disabled' : '') + '>' +
    '<select class="field" data-i="u" data-id="' + x.id + '" aria-label="Unit"' + (x.unk ? ' disabled' : '') + '>' + UNITS.map(function (u) { return '<option value="' + u + '"' + (u === x.u ? ' selected' : '') + '>' + (u || "(count)") + '</option>'; }).join("") + '</select>' +
    '<button type="button" class="mini" data-unk="' + x.id + '" aria-pressed="' + x.unk + '" title="The source did not say. Never guessed.">Amount?</button></div>' +
    '<div class="edact">' + actBtns("ings", x, i, n) + '</div></div>';
}
function stepRow(s, i, n) {
  var o = orig("steps", s.id), cls = "edrow" + (s.st === "rm" ? " rm" : "") + (s.st !== "rm" && (!o || stepChanged(s)) ? " chg" : "");
  var num = D.steps.slice(0, i + 1).filter(function (z) { return z.st !== "rm"; }).length;
  if (s.st === "rm") return '<div class="' + cls + '" data-row="steps:' + s.id + '"><div class="edmain"><span class="nb" aria-hidden="true">–</span><p style="margin-top:6px">' + esc(short(s.t, 70)) + '</p></div><span class="rmnote">Removed when you save. It stays in History.</span><div class="edact"><button type="button" class="mini" data-put="steps:' + s.id + '">' + ic("undo", "xs") + 'Put back</button></div></div>';
  var p = s.ph, hasP = !!p;
  var pb = hasP ? '<button type="button" class="edph has" data-sph="' + s.id + '" aria-label="Photo of step ' + num + ', change it">' + X.frame(p.p, "m", { phase: "step", inh: p.inh ? p.from : "", alt: "Step " + num }) + '</button>'
    : '<button type="button" class="edph' + (stepPhotoCount() >= MAXSTEPPH ? ' dis' : '') + '" data-sph="' + s.id + '" aria-label="Add a photo to step ' + num + '">' + ic("cam") + '</button>';
  return '<div class="' + cls + '" data-row="steps:' + s.id + '"><div class="edmain"><span class="nb">' + num + '</span><textarea class="field ta" data-s="t" data-id="' + s.id + '" rows="2" aria-label="Step ' + num + '" placeholder="What to do">' + esc(s.t) + '</textarea></div>' +
    '<div class="edmeta"><input class="field tm" data-s="m" data-id="' + s.id + '" value="' + esc(s.m) + '" inputmode="numeric" placeholder="min" aria-label="Timer in minutes"><span class="hint" style="margin:0">min timer</span>' + pb + '</div>' +
    '<div class="edact">' + actBtns("steps", s, i, n) + '</div></div>';
}
var stepPhotoCount = function () { return D.steps.filter(function (s) { return s.ph && s.st !== "rm"; }).length; };
function noteCard(n) {
  var o = orig("notes", n.id), cls = "ednote" + (n.st === "rm" ? " rm" : "") + (n.st !== "rm" && (!o || noteChanged(n)) ? " chg" : "");
  var from = n.from ? '<span class="from">' + ic("branch", "xs") + (n.parent ? "from the parent version" : "from " + esc(n.from.name)) + "</span>" : "";
  if (n.st === "rm") return '<div class="' + cls + '" data-note-id="' + n.id + '"><div class="nbody">' + X.noteHtml(n.body) + '</div><small>Taken off ' + esc(v.name) + ' when you save. It stays in History.</small><div class="acts"><button type="button" class="mini" data-nput="' + n.id + '">' + ic("undo", "xs") + 'Put back</button></div></div>';
  if (n.edit) return '<div class="' + cls + '" data-note-id="' + n.id + '"><span class="edlab" style="margin:0">' + (o ? "Edit the note" : "New note") + '</span><textarea class="field nbox" maxlength="' + X.NOTE_MAX + '" data-n="' + n.id + '" aria-label="Note">' + esc(n.body) + '</textarea><p class="ncount" data-ncount hidden></p>' +
    (n.from ? '<span class="hint">This note was written on ' + esc(n.from.name) + '. Changing it here rewords it for ' + esc(v.name) + ' and the versions below it; ' + esc(n.from.name) + ' keeps its own.</span>' : '') +
    '<div class="acts"><button type="button" class="mini" data-ndone="' + n.id + '">' + ic("check", "xs") + 'Done</button></div></div>';
  return '<div class="' + cls + '" data-note-id="' + n.id + '"><div class="nbody">' + X.noteHtml(n.body) + '</div><small>' + esc(n.by) + ' · ' + n.when + from + (o && noteChanged(n) ? ' · edited by you' : '') + '</small>' +
    '<div class="acts"><button type="button" class="mini" data-nedit="' + n.id + '">' + ic("pen", "xs") + 'Edit</button><button type="button" class="mini" data-nrm="' + n.id + '">' + ic("x", "xs") + 'Take off</button></div></div>';
}
function photosSec() {
  var bn = bannerNow(), mp = galleryNow();
  var ban = bn ? '<button type="button" class="edban" data-bph aria-label="Banner, change it">' + X.frame(bn.p, "l", { phase: "banner", inh: bn.inherited ? bn.from.name : "", alt: "Banner" }) + '</button>'
    : '<div class="edban stock">' + ic("chef") + 'No banner: the stock picture shows</div>';
  return secHead("Photos") + '<p class="hint">Photo changes apply at once and are not part of Save. You can undo one for 5 minutes.</p>' +
    '<span class="edlab" style="margin-top:8px">Banner' + (bn && bn.inherited ? ' · photo of ' + esc(bn.from.name) + ', until this version has its own' : '') + '</span>' + ban +
    '<div class="edpacts"><button type="button" class="mini" data-bph>' + ic("cam", "xs") + (bn ? "Replace or crop" : "Add a banner") + '</button></div>' +
    '<p class="edcnt">Step photos ' + stepPhotoCount() + ' of ' + MAXSTEPPH + '. Add or change them on each step in Method.</p>' +
    '<span class="edlab" style="margin-top:12px">Other photos</span>' +
    '<div class="pgrid">' + mp.map(function (id) { return '<button type="button" data-gph="' + id + '" aria-label="Photo, change it">' + X.frame({ id: id, prep: PS.prep && PS.prep[id] }, "t", { phase: "more" }) + '</button>'; }).join("") +
    '<a class="add" href="../recipe-photos/add.html?to=' + r.id + '" aria-label="Add a photo">' + ic("cam") + '<span>Add</span></a></div>' +
    '<div id="pundo"></div>';
}
var galGone = [];
function bannerNow() { if (PS.banner === 0) return null; return PS.banner || X.banner(r, v.id); }
function galleryNow() { return X.morePhotos(r).filter(function (id) { return galGone.indexOf(id) < 0; }); }

function render(keepY) {
  var b = document.getElementById("body"), y = keepY && b ? b.scrollTop : 0;
  var n1 = D.ings.length, n2 = D.steps.length;
  var secs = [["det", "Details"], ["ing", "Ingredients"], ["met", "Method"], ["not", "Notes"], ["pho", "Photos"]];
  var det = secHead("Details") +
    field("name", "Name", D.name, { max: 80, hint: multi ? "Renames the recipe for every version." : "" }) +
    (multi ? field("vname", "Version name", D.vname, { max: 60, hint: "Only this version's name." }) : "") +
    '<div class="ed2">' + field("min", "Time (minutes)", D.min, { mode: "numeric" }) + field("serves", r.batch ? "Makes (portions)" : "Serves", D.serves, { mode: "numeric" }) + '</div>' +
    '<div class="edf"><span class="edlab">Tags</span><div class="edtags" role="group" aria-label="Tags">' +
    TAGS.concat(D.tags.filter(function (t) { return TAGS.indexOf(t) < 0; })).map(function (t) { return '<button type="button" class="mini" data-tag="' + esc(t) + '" aria-pressed="' + (D.tags.indexOf(t) > -1) + '">' + esc(t) + '</button>'; }).join("") +
    '<input class="field" id="newtag" placeholder="Add a tag" maxlength="24" aria-label="Add a tag"></div></div>' +
    field("src", "Where it came from", D.src, { max: 160, hint: "Shown at the bottom of the recipe." });
  var ing = secHead("Ingredients · for " + (r.batch ? "the pot" : r.serves), reorderBtn("ing")) + (reord.ing ? '<p class="hint">Use the arrows to move a row. Tap Done when it is right.</p>' : '<p class="hint">Typed for ' + (r.batch ? "the whole pot (" + r.serves + " portions)" : r.serves + " serving" + (r.serves > 1 ? "s" : "")) + '. "Amount?" keeps a missing amount honest.</p>') +
    '<div class="edlist' + (reord.ing ? " reord" : "") + '" id="l-ings">' + D.ings.map(function (x, i) { return ingRow(x, i, n1); }).join("") + '</div>' +
    '<button type="button" class="edadd" data-add="ings">' + ic("plus", "s") + 'Add an ingredient</button>';
  var met = secHead("Method", reorderBtn("met")) + (reord.met ? '<p class="hint">Use the arrows to move a step. Its photo moves with it.</p>' : '<p class="hint">Step photos ' + stepPhotoCount() + ' of ' + MAXSTEPPH + ', one per step. A timer is optional and never guessed.</p>') +
    '<div class="edlist' + (reord.met ? " reord" : "") + '" id="l-steps">' + D.steps.map(function (x, i) { return stepRow(x, i, n2); }).join("") + '</div>' +
    '<button type="button" class="edadd" data-add="steps">' + ic("plus", "s") + 'Add a step</button>';
  var vis = D.notes.filter(function (n) { return !(n.st === "rm" && !orig("notes", n.id)); });
  var nts = secHead("Notes · " + vis.filter(function (n) { return n.st !== "rm"; }).length) + '<p class="hint">One box, up to 4,000 characters. A note shows on this version and the ones below it.</p>' +
    (vis.map(noteCard).join("") || '<p style="font-size:13px">No notes yet.</p>') + '<button type="button" class="edadd" data-add="notes">' + ic("note", "s") + 'Add a note</button>';
  var html = band() +
    '<nav class="jumps" aria-label="Sections">' + secs.map(function (s) { return '<a href="#' + s[0] + '">' + s[1] + '</a>'; }).join("") + '</nav>' +
    '<section class="sec" id="det">' + det + '</section><section class="sec" id="ing">' + ing + '</section><section class="sec" id="met">' + met + '</section><section class="sec" id="not">' + nts + '</section><section class="sec" id="pho">' + photosSec() + '</section>' +
    '<div class="sec"><p class="src" style="padding-bottom:0">' + ic("spark", "xs") + ' Prefer to say it? <a href="../recipe-versions/change.html?v=' + v.id + '&step=chat" style="text-decoration:underline;color:var(--accent);font-weight:700">Change it with your assistant</a>. Its edits and yours share one History, with who made each.</p></div>' +
    '<div style="height:24px"></div>';
  if (!document.getElementById("body")) {
    ph.innerHTML = '<div class="top"><a class="back" href="' + back + '" data-leave>' + ic("back", "s") + esc(v.name) + '</a><span class="ttl">Edit</span><span style="width:64px"></span></div>' +
      '<div class="body" id="body"></div><div id="askin"></div>' +
      '<div class="act"><button type="button" class="btn ghost" data-leave>Cancel</button><button type="button" class="btn sv" id="sv" disabled>Save</button></div>';
    b = document.getElementById("body");
  }
  b.innerHTML = html; b.scrollTop = y;
  autosize(); noteCaps(); refresh(); jumpwatch(b);
  X.afterPaint(function () { X.loadPhase(ph, "step").then(function () { return X.loadPhase(ph, "banner"); }).then(function () { applyTf(); }); });
  if (EDIT.after) EDIT.after();
  if (!didScroll) { didScroll = true; scrollSec(); }
  undoBar();
}
function scrollSec() { var b = document.getElementById("body"), el = document.getElementById(openSec); if (el && openSec !== "det") { var jr = b.querySelector(".jumps"); b.scrollTop = el.offsetTop - (jr ? jr.offsetHeight : 0); } }
function noteCaps() { [].forEach.call(ph.querySelectorAll("textarea.nbox"), function (ta) { var out = ta.parentNode.querySelector("[data-ncount]"); X.noteCap(ta, out); }); }
function autosize() { [].forEach.call(ph.querySelectorAll("textarea.ta"), function (t) { t.style.height = "auto"; t.style.height = Math.max(44, t.scrollHeight + 2) + "px"; }); }
function jumpwatch(b) {
  var jr = b.querySelector(".jumps"), secs = ["det", "ing", "met", "not", "pho"];
  var on = function () {
    var cur = "det"; secs.forEach(function (k) { var el = document.getElementById(k); if (el && el.offsetTop - jr.offsetHeight - 6 <= b.scrollTop) cur = k; });
    if (b.scrollTop + b.clientHeight >= b.scrollHeight - 2) cur = "pho";
    jr.querySelectorAll("a").forEach(function (a) { a.classList.toggle("on", a.getAttribute("href") === "#" + cur); });
    jr.classList.toggle("docked", b.scrollTop > 4);
    if (cur === "pho") X.loadPhase(ph, "more");
  };
  b.onscroll = on; on();
  jr.querySelectorAll("a").forEach(function (a) { a.onclick = function (e) { e.preventDefault(); var el = document.getElementById(a.getAttribute("href").slice(1)); if (el) b.scrollTop = el.offsetTop - jr.offsetHeight; }; });
}

/* the Save button, tints and the count follow every keystroke without rebuilding the page (so focus stays) */
function refresh() {
  var rows = diff(), n = rows.length, sv = document.getElementById("sv");
  if (sv) {
    var lbl = n ? "Save " + n + " change" + (n > 1 ? "s" : "") : "Save";
    if (askMode === "inline" && keeper && asking) lbl = pick ? ({ fix: "Save as revision " + (headN + 1), both: "Save as a new version", own: "Make its own recipe" })[pick] : "Choose where it goes";
    sv.textContent = lbl; sv.disabled = !n || (askMode === "inline" && keeper && asking && !pick);
  }
  [].forEach.call(ph.querySelectorAll("[data-row]"), function (el) {
    var a = el.dataset.row.split(":"), x = D[a[0]].filter(function (z) { return z.id === a[1]; })[0];
    if (x && x.st !== "rm") el.classList.toggle("chg", a[0] === "ings" ? ingChanged(x) : stepChanged(x));
  });
  EDIT.changes = rows;
  EDIT.listeners.forEach(function (f) { f(rows); });
}

/* ---- events ---- */
var find = function (list, id) { return D[list].filter(function (x) { return x.id === id; })[0]; };
ph.addEventListener("input", function (e) {
  var t = e.target, id = t.dataset.id;
  if (t.dataset.f) D[t.dataset.f] = t.value;
  else if (t.dataset.i) find("ings", id)[t.dataset.i] = t.value;
  else if (t.dataset.s) { find("steps", id)[t.dataset.s] = t.value; if (t.dataset.s === "t") autosize(); }
  else if (t.dataset.n) find("notes", t.dataset.n).body = t.value;
  else return;
  refresh();
});
ph.addEventListener("change", function (e) { var t = e.target; if (t.dataset.i === "u") { find("ings", t.dataset.id).u = t.value; refresh(); } });
ph.addEventListener("keydown", function (e) {
  if (e.target.id === "newtag" && e.key === "Enter") { e.preventDefault(); var t = e.target.value.trim(); if (t && D.tags.indexOf(t) < 0) { D.tags.push(t); render(true); } }
});
function dirty() { return diff().length > 0; }
function leave() { location.href = back; }
function discardSheet() {
  X.sheet('<h3>Leave without saving?</h3><p style="font-size:13px">You have ' + diff().length + ' change' + (diff().length > 1 ? "s" : "") + ' that are not saved. Nothing has been written to ' + esc(v.name) + '.</p><div style="display:flex;gap:8px;margin-top:14px"><button class="btn ghost" data-close>Keep editing</button><button class="btn" data-ok>Discard them</button></div>',
    function (s) { s.querySelector("[data-ok]").onclick = leave; });
}
function addRow(list) {
  if (list === "ings") D.ings.push({ id: "i" + (uid++), key: "new", name: "", q: "", u: "", unk: false, st: "", new: true });
  else if (list === "steps") D.steps.push({ id: "s" + (uid++), t: "", m: "", ph: null, st: "", new: true });
  else D.notes.push({ id: "n" + (uid++), body: "", by: V.WHO[V.ME][0], when: "now", st: "", edit: true, new: true });
  render(true);
  var sel = { ings: "#l-ings .edrow:last-child [data-i=name]", steps: "#l-steps .edrow:last-child textarea", notes: ".ednote:last-of-type textarea" }[list];
  var el = ph.querySelector(sel); if (el) { el.focus(); if (el.scrollIntoView) el.scrollIntoView({ block: "center" }); }
}
function move(list, id, d) {
  var a = D[list], i = a.map(function (x) { return x.id; }).indexOf(id), j = i + d; if (j < 0 || j >= a.length) return;
  var t = a[i]; a[i] = a[j]; a[j] = t; render(true);
  var el = ph.querySelector('[data-mv="' + list + ":" + id + ":" + d + '"]') || ph.querySelector('[data-mv="' + list + ":" + id + ":" + -d + '"]'); if (el && !el.disabled) el.focus();
}
function removeRow(list, id) {
  var x = find(list, id), o = orig(list, id);
  if (!o) D[list] = D[list].filter(function (z) { return z.id !== id; }); /* never saved: just gone from the draft */
  else x.st = "rm";
  render(true);
}
function rowMenu(list, id) {
  var a = D[list], i = a.map(function (x) { return x.id; }).indexOf(id), noun = list === "ings" ? "ingredient" : "step";
  X.sheet('<h3>This ' + noun + '</h3>' +
    '<button type="button" class="opt" data-a="up"' + (i === 0 ? ' disabled style="opacity:.4"' : '') + '><svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 15l6-6 6 6"/></svg>' + '<span class="t"><b>Move up</b></span></button>' +
    '<button type="button" class="opt" data-a="down"' + (i === a.length - 1 ? ' disabled style="opacity:.4"' : '') + '>' + ic("down") + '<span class="t"><b>Move down</b></span></button>' +
    '<button type="button" class="opt" data-a="rm">' + ic("x") + '<span class="t"><b>Remove</b><small>It stays in History, and you can put it back</small></span></button>',
    function (s, close) { s.addEventListener("click", function (e) { var b = e.target.closest("[data-a]"); if (!b || b.disabled) return; close(); var k = b.dataset.a; if (k === "rm") removeRow(list, id); else move(list, id, k === "up" ? -1 : 1); }); });
}
ph.addEventListener("click", function (e) {
  var t = e.target.closest("button,a"); if (!t) return;
  if (t.hasAttribute("data-leave")) { if (dirty()) { e.preventDefault(); discardSheet(); } else if (t.tagName === "BUTTON") leave(); return; }
  if (t.hasAttribute("data-reord")) { var k = t.dataset.reord; reord[k] = !reord[k]; render(true); return; }
  if (t.dataset.mv) { var m = t.dataset.mv.split(":"); move(m[0], m[1], +m[2]); return; }
  if (t.dataset.menu) { var q = t.dataset.menu.split(":"); rowMenu(q[0], q[1]); return; }
  if (t.dataset.rm) { var a = t.dataset.rm.split(":"); removeRow(a[0], a[1]); return; }
  if (t.dataset.put) { var p = t.dataset.put.split(":"); find(p[0], p[1]).st = ""; render(true); return; }
  if (t.dataset.add) { addRow(t.dataset.add); return; }
  if (t.dataset.unk) { var i = find("ings", t.dataset.unk); i.unk = !i.unk; if (i.unk) i.q = ""; render(true); return; }
  if (t.dataset.tag) { var g = t.dataset.tag, at = D.tags.indexOf(g); if (at > -1) D.tags.splice(at, 1); else D.tags.push(g); render(true); return; }
  if (t.dataset.nedit) { find("notes", t.dataset.nedit).edit = true; render(true); var ta = ph.querySelector('[data-n="' + t.dataset.nedit + '"]'); if (ta) ta.focus(); return; }
  if (t.dataset.ndone) { var nn = find("notes", t.dataset.ndone); if (!nn.body.trim() && nn.new) D.notes = D.notes.filter(function (z) { return z !== nn; }); else nn.edit = false; render(true); return; }
  if (t.dataset.nrm) { var n2 = find("notes", t.dataset.nrm); if (!orig("notes", n2.id)) D.notes = D.notes.filter(function (z) { return z !== n2; }); else n2.st = "rm"; render(true); return; }
  if (t.dataset.nput) { find("notes", t.dataset.nput).st = ""; render(true); return; }
  if (t.dataset.sph) { photoStep(t.dataset.sph); return; }
  if (t.hasAttribute("data-bph")) { photoBanner(); return; }
  if (t.dataset.gph) { photoGallery(t.dataset.gph); return; }
  if (t.hasAttribute("data-undophoto")) { if (PS.undo) { var f = PS.undo.fn; PS.undo = null; f(); } return; }
  if (t.id === "sv") { requestSave(); return; }
});

/* ---- saving ---- */
var EDIT = window.EDIT = { scrollSec: scrollSec, listeners: [], changes: [], keeper: keeper, usual: usual, headN: headN, name: v.name, who: V.WHO[V.ME][0], diffHtml: function (rows) { return V.diff(rows); }, commit: commit, ic: ic, esc: esc, X: X };
function suggestName() {
  var a = diff().filter(function (d) { return d[0] === "add" && /^[A-Z]/.test(d[1]) && !/^(Tag|Note|Step)/.test(d[1]); })[0];
  if (a) return "With " + a[1].replace(/\s[\d½¼¾.]+.*$/, "").toLowerCase();
  return v.name + ", tweaked";
}
EDIT.suggestName = suggestName;
function requestSave() {
  if (!dirty()) return;
  if (!keeper) { commit("fix"); return; }
  if (EDIT.ask) { EDIT.ask(); return; } /* desktop: the question is already in the lane */
  if (askMode === "inline") {
    if (!asking) { asking = true; pick = null; inlineAsk(); refresh(); return; }
    if (pick) commit(pick); return;
  }
  saveSheet();
}
function inlineAsk() {
  var el = document.getElementById("askin");
  if (!asking) { el.innerHTML = ""; return; }
  el.innerHTML = '<div class="askin"><b>' + esc(v.name) + ' is a keeper' + (usual ? ' and our usual' : '') + '. Where should this go?</b><div class="seg3" role="group" aria-label="Where should it go">' +
    [["fix", "Fix this one", "revision " + (headN + 1)], ["both", "Keep both", "new version"], ["own", "Different dish", "own recipe"]].map(function (o) { return '<button type="button" data-ask="' + o[0] + '" aria-pressed="' + (pick === o[0]) + '">' + o[1] + '<small>' + o[2] + '</small></button>'; }).join("") + '</div></div>';
  el.onclick = function (e) { var b = e.target.closest("[data-ask]"); if (!b) return; pick = b.dataset.ask; inlineAsk(); refresh(); };
}
var WHY = { fix: "What did you change? (optional)", both: "Why keep it? (optional)", own: "Why is it a different dish? (optional)" };
function saveSheet() {
  var rows = diff(), choice = null;
  X.sheet('<div class="saveq"><h3>Where should this go?</h3><p style="font-size:13px;margin-top:4px"><b style="color:var(--fg)">' + esc(v.name) + '</b> is a keeper' + (usual ? ' and our usual' : '') + ', so you choose. Nothing is saved yet.</p>' + V.diff(rows.slice(0, 4)) + (rows.length > 4 ? '<p style="font-size:12.5px;margin-top:6px">and ' + (rows.length - 4) + ' more</p>' : '') +
    [["fix", "star", "Fix " + esc(v.name), "Revision " + (headN + 1) + " of the same version. Everyone cooking it gets the fix. Saved by you, so it needs no review."], ["both", "branch", "Keep both", "A new version that starts as Trying. " + esc(v.name) + " stays exactly as it is."], ["own", "spark", "It is a different dish now", "Its own recipe, linked back to " + esc(r.name) + "."]].map(function (o) {
      return '<button type="button" class="ch" data-p="' + o[0] + '" aria-pressed="false">' + ic(o[1]) + '<span class="t"><b>' + o[2] + '</b><small>' + o[3] + '</small></span><span class="rad" aria-hidden="true"></span></button>';
    }).join("") + '<div id="follow"></div>' +
    '<div class="row2" style="grid-template-columns:1fr 1.4fr"><button class="btn ghost" data-close>Back to editing</button><button class="btn" data-ok disabled>Choose one</button></div></div>',
  function (s, close) {
    var follow = s.querySelector("#follow"), ok = s.querySelector("[data-ok]");
    s.addEventListener("click", function (e) {
      var b = e.target.closest("[data-p]"); if (!b) return; choice = b.dataset.p;
      [].forEach.call(s.querySelectorAll("[data-p]"), function (x) { x.setAttribute("aria-pressed", String(x === b)); });
      follow.innerHTML = (choice === "both" ? '<label class="edf"><span class="edlab">Name the new version</span><input class="field" id="nm" value="' + esc(suggestName()) + '"></label>' : choice === "own" ? '<label class="edf"><span class="edlab">Name the new recipe</span><input class="field" id="nm" value="' + esc(r.name + ", " + suggestName().toLowerCase()) + '"></label>' : '') +
        '<label class="edf"><span class="edlab">' + WHY[choice] + '</span><input class="field" id="why" placeholder="In your words" maxlength="200"></label>';
      ok.disabled = false; ok.textContent = { fix: "Save as revision " + (headN + 1), both: "Save new version", own: "Make its own recipe" }[choice];
    });
    ok.onclick = function () { var nm = s.querySelector("#nm"), why = s.querySelector("#why"); close(); commit(choice, { name: nm && nm.value, why: why && why.value }); };
  });
}
function commit(how, o) {
  o = o || {};
  var rows = diff(), u = "detail.html?id=" + r.id + "&v=" + v.id + "&saved=" + (headN + 1) + "&how=" + how + "&n=" + rows.length;
  if (o.name) u += "&nm=" + encodeURIComponent(o.name);
  location.href = u;
}

/* ---- photos: fetched on the first photo action (edit-photo.js + photos.css), so the default path never carries crop or rotate ---- */
var EDPp;
function needPhoto() {
  if (EDPp) return EDPp;
  EDPp = new Promise(function (ok) {
    var l = document.createElement("link"); l.rel = "stylesheet"; l.href = BASE + "../recipe-photos/photos.css"; document.head.appendChild(l);
    var l2 = document.createElement("link"); l2.rel = "stylesheet"; l2.href = BASE + "edit-photo.css"; document.head.appendChild(l2);
    var s = document.createElement("script"); s.src = BASE + "edit-photo.js"; s.onload = function () { ok(window.EDP); }; document.head.appendChild(s);
  });
  return EDPp;
}
var tf = {}; /* crop and rotate per photo id: the mockup applies them as a transform; the build re-saves the stored copy */
function applyTf(root) {
  [].forEach.call((root || ph).querySelectorAll(".rph[data-pid]"), function (f) {
    var t = tf[f.dataset.pid], img = f.querySelector("img"); if (!img) return;
    /* the stored copy is 4 to 3; in a box of another shape a sideways photo needs extra scale to cover it (the build re-saves the file instead) */
    var bw = f.offsetWidth || 4, bh = f.offsetHeight || 3, odd = t && t.rot % 180, sc = t ? (odd ? t.z / (4 / 3) * Math.max(bw / bh, bh / bw) : t.z) : 1;
    img.style.transform = t ? "translate(" + t.x + "%," + t.y + "%) rotate(" + t.rot + "deg) scale(" + sc + ")" : "";
  });
}
function setUndo(msg, fn) {
  PS.undo = { msg: msg, until: Date.now() + 300000, fn: fn }; undoBar(); X.toast(msg, function () { PS.undo = null; fn(); });
}
function undoBar() {
  var el = document.getElementById("pundo"); if (!el) return;
  if (!PS.undo || PS.undo.until < Date.now()) { el.innerHTML = ""; return; }
  var left = Math.max(0, PS.undo.until - Date.now());
  el.innerHTML = '<div class="pundo" role="status">' + ic("undo", "s") + '<span class="t"><b>' + esc(PS.undo.msg) + '</b><small>Undo for ' + Math.floor(left / 60000) + ':' + ("0" + Math.floor(left % 60000 / 1000)).slice(-2) + ', then it is final</small></span><button type="button" class="mini" data-undophoto>Undo</button></div>';
}
setInterval(function () { if (PS.undo) undoBar(); }, 1000);
function ctxBase(o) { return Object.assign({ X: X, r: r, v: v, tf: tf, applyTf: applyTf, redraw: function () { render(true); }, setUndo: setUndo, PS: PS, esc: esc, ic: ic }, o); }
function photoStep(id) {
  var s = find("steps", id), k = D.steps.indexOf(s), num = D.steps.slice(0, k + 1).filter(function (z) { return z.st !== "rm"; }).length;
  if (!s.ph && stepPhotoCount() >= MAXSTEPPH) { X.toast("A version holds at most 10 step photos. Remove one first."); return; }
  needPhoto().then(function (E) {
    E.open(ctxBase({
      kind: "step", label: "Photo of step " + num, p: s.ph && s.ph.p, inherited: s.ph && s.ph.inh, from: s.ph && s.ph.from, canMake: true,
      onReplace: function (np) { var was = s.ph; s.ph = { p: np, inh: false }; render(true); setUndo(was ? "Step photo replaced" : "Step photo added", function () { s.ph = was; render(true); }); },
      onRemove: function () { var was = s.ph; s.ph = null; render(true); setUndo("Step photo removed", function () { s.ph = was; render(true); }); },
      onMake: function () { makeBanner(s.ph.p.id); }
    }));
  });
}
function makeBanner(pid) {
  var prev = X.setBanner(r, v.id, pid); PS.banner = undefined; render(true);
  setUndo("Banner changed", function () { X.setBanner(r, v.id, prev); render(true); });
}
function photoBanner() {
  var bn = bannerNow();
  needPhoto().then(function (E) {
    E.open(ctxBase({
      kind: "banner", label: "Banner of " + v.name, p: bn && bn.p, inherited: bn && bn.inherited, from: bn && bn.from && bn.from.name, canMake: false,
      gallery: galleryNow(),
      onReplace: function (np) { var was = PS.banner; PS.banner = { p: np, inherited: false }; render(true); setUndo("Banner replaced", function () { PS.banner = was; render(true); }); },
      onMakeFrom: function (id) { makeBanner(id); }
    }));
  });
}
function photoGallery(id) {
  needPhoto().then(function (E) {
    E.open(ctxBase({
      kind: "gallery", label: "Photo of " + r.name, p: { id: id, prep: PS.prep && PS.prep[id] }, canMake: true,
      onReplace: function (np) { PS.prep = PS.prep || {}; PS.prep[id] = 1; render(true); setUndo("Photo replaced", function () { delete PS.prep[id]; render(true); }); },
      onRemove: function () { galGone.push(id); render(true); setUndo("Photo removed", function () { galGone = galGone.filter(function (z) { return z !== id; }); render(true); }); },
      onMake: function () { makeBanner(id); }
    }));
  });
}

/* ---- start ---- */
load();
render();
(function demo() {
  var d = Q.get("demo"); if (!d) return;
  find("ings", D.ings[4].id).q = "0.5"; find("ings", D.ings[4].id).u = "tbsp";
  D.ings.push({ id: "i" + (uid++), key: "garlic", name: "Garlic cloves", q: "1", u: "", unk: false, st: "", new: true });
  D.steps[1].t = "Chop the onion and fry it in the oil for 3 minutes, then add the garlic for the last minute."; D.steps[1].m = "4";
  D.ings[5].st = "rm"; D.tags.push("Make ahead");
  render(true);
  if (d === "ask") requestSave();
})();
if (Q.get("sec") === "pho") { var bb = document.getElementById("body"); bb && X.loadPhase(ph, "more"); }
X.controls('<h4>Edit by hand (owner, 11 Oct): options</h4><p>Defaults are used. <a href="edit-options.html">See the five options</a></p>' +
  '<p style="margin-top:6px">Keeper question: <a href="?id=' + r.id + '&v=' + v.id + '&ask=sheet&demo=ask">sheet (default)</a> · <a href="?id=' + r.id + '&v=' + v.id + '&ask=inline&demo=changed">inline above Save</a></p>' +
  '<p style="margin-top:6px">Reorder: <a href="?id=' + r.id + '&v=' + v.id + '&reorder=arrows&sec=ing">Reorder mode (default)</a> · <a href="?id=' + r.id + '&v=' + v.id + '&reorder=menu&sec=ing">row menu</a></p>' +
  '<p style="margin-top:6px">A try, a keeper: <a href="?id=efr&v=v2">Less soy (a try)</a> · <a href="?id=efr&v=v1">With peas (keeper, our usual)</a> · <a href="?id=cur&v=v0">Chickpea curry (one version)</a></p>' +
  '<p style="margin-top:6px">With changes: <a href="?id=efr&v=v1&demo=changed">keeper</a> · <a href="?id=efr&v=v2&demo=changed">try</a></p>');
/* the desktop layout is its own file, fetched at 1024px and up with a hover pointer; a phone never loads it */
if (window.matchMedia && matchMedia("(min-width:1024px) and (hover:hover)").matches) {
  var dl = document.createElement("link"); dl.rel = "stylesheet"; dl.href = BASE + "edit-desktop.css"; document.head.appendChild(dl);
  var ds = document.createElement("script"); ds.src = BASE + "edit-desktop.js"; document.head.appendChild(ds);
}
})();
