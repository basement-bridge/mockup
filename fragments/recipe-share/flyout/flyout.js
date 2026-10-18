/* Recipe share, summary-flyout slice. MOCKUP ONLY: sample data, nothing is sent or saved, every link is a placeholder at kitchie.example.
   The summary flyout's markup and the share panel's content, as plain builders (window.FL). The panel is the REAL content, lifted from two earlier slices:
   the links list with rename, copy and cancel with Undo (manage, option A) and the create form, link made, Copy and Share, Done (sheet, option A).
   Layout, keys and the frame are desktop.js (fetched only at 1024px and up, DESIGN.md sections 6 and 7). */
(function () {
  "use strict";
  var UNDO_S = 300, SOON_H = 24, MAXINV = 3;   /* MAXINV: the member's maximum-invites limit (sample), the same 3 as the manage slice */
  var ICONS = {
    link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
    copy: '<rect x="8" y="8" width="12" height="12" rx="2.5"/><path d="M16 8V6.5A2.5 2.5 0 0 0 13.5 4h-7A2.5 2.5 0 0 0 4 6.5v7A2.5 2.5 0 0 0 6.5 16H8"/>',
    pencil: '<path d="M4 20l1-4L16.5 4.5a2.1 2.1 0 0 1 3 3L8 19z"/><path d="M14.5 6.5l3 3"/>',
    clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    undo: '<path d="M9 7L4 12l5 5"/><path d="M4 12h10.5a4.5 4.5 0 0 1 0 9H10"/>',
    share: '<path d="M12 15V4M8 8l4-4 4 4"/><path d="M5 13v5.5A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5V13"/>',
    back: '<path d="M15 5l-7 7 7 7"/>',
    close: '<path d="M6 6l12 12M18 6L6 18"/>',
    renew: '<path d="M19 12a7 7 0 1 1-2.1-5"/><path d="M19 4.5V8h-3.5"/>',
    eyeoff: '<path d="M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6z"/><circle cx="12" cy="12" r="2.5"/>',
    eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="2.8"/>',
    pin: '<path d="M9 4h6l-1 6 3 3H7l3-3z"/><path d="M12 13v7"/>',
    home: '<path d="M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
    jar: '<path d="M5 8h14v12H5zM8 8V5h8v3"/>',
    book: '<path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z"/>',
    cart: '<path d="M4 5h2l2 10h9l2-7H7"/><circle cx="10" cy="19" r="1"/><circle cx="17" cy="19" r="1"/>',
    ticket: '<path d="M4 8.5a2 2 0 0 1 0 4v0a2 2 0 0 1 0 4V18h16v-1.5a2 2 0 0 1 0-4v0a2 2 0 0 1 0-4V6H4z"/><path d="M14 6.5v11" stroke-dasharray="1.8 2.2"/>',
    warn: '<path d="M12 4l9 16H3z"/><path d="M12 10v4M12 17v.5"/>',
    search: '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4 4"/>'
  };
  function ic(n, c) { return '<svg class="ic' + (c ? " " + c : "") + '" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + ICONS[n] + "</svg>"; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  var MAC = /Mac|iPhone|iPad/.test(navigator.platform || ""), MOD = MAC ? "⌘" : "Ctrl";

  /* ---- sample data. Today in the mockup is fixed: Tuesday 13 October 2026, 9:41 am. ---- */
  var VERSIONS = [["usual", "Original"], ["air", "Air fryer"]];   /* sample: used only by the "versions" presets; the recipe has one version otherwise */
  var RECIPE = { e: "🍗", name: "Honey soy chicken thighs with smashed cucumber and wilted spinach", meta: "20 min · serves 2", short: "Honey soy chicken" };
  var ROWS = [["🍗", RECIPE.name, "20 min · serves 2 · cooked today", "Planned"], ["🍝", "Spaghetti aglio e olio", "20 min · serves 2", ""], ["🍳", "Egg fried rice", "15 min · serves 2", ""], ["🥘", "Chickpea curry", "35 min · makes 6", ""]];
  var EXP = [["24h", "24 hours", 24], ["7d", "7 days", 168], ["30d", "30 days", 720]];
  var DAY = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var NOW = new Date(2026, 9, 13, 9, 41);
  function plus(n) { var d = new Date(NOW); d.setDate(d.getDate() + n); return d; }
  function dlab(d) { return DAY[d.getDay()] + " " + d.getDate() + " " + MON[d.getMonth()]; }
  var URLS = "https://kitchie.example/s/hs-";
  function L(id, name, hours, opens, last, inv) { return { id: id, name: name, hours: hours, opens: opens, last: last, cancelLeft: 0, gone: false, inv: inv || null }; }
  var PRESETS = {
    none: { label: "Summary, no links", cap: "The summary flyout, nothing shared yet: Share sits beside Open full recipe, no count.", make: function () { return { layer: "summary", step: "list", links: [] }; } },
    two: { label: "Summary, 2 links", cap: "Two links are out: the Share button carries a count and an accent outline.", make: function () { return { layer: "summary", step: "list", links: [L(1, "For the neighbours", 120, 6, 3, { s: "unclaimed" }), L(2, "Book club", 288, 0, null)] }; } },
    panel: { label: "Share panel", cap: "S or the button drills the share panel into the same lane. The summary is one step behind: Back or Esc returns to it.", make: function () { return { layer: "share", step: "list", links: [L(1, "For the neighbours", 120, 6, 3, { s: "unclaimed" }), L(2, "Book club", 288, 0, null)] }; } },
    empty: { label: "Panel, no links", cap: "The panel when nothing is shared: an empty state and one button.", make: function () { return { layer: "share", step: "list", links: [] }; } },
    rename: { label: "Renaming", cap: "Tap a name (pencil) to rename. Enter or Save keeps it, Esc or Keep leaves it.", make: function () { return { layer: "share", step: "list", editing: 1, links: [L(1, "For the neighbours", 120, 6, 3, { s: "unclaimed" }), L(2, "Book club", 288, 0, null)] }; } },
    undo: { label: "Cancelled, undo", cap: "Cancel link is one tap with no confirm; the row becomes an Undo line for 5 minutes.", make: function () { var a = [L(1, "For the neighbours", 120, 6, 3, { s: "unclaimed" }), L(2, "Book club", 288, 0, null)]; a[1].cancelLeft = 252; return { layer: "share", step: "list", links: a }; } },
    form: { label: "Make a link", cap: "Make another link (sheet option C): name, how long it works, the optional invite. One version, so no version choice. One Create.", make: function () { return { layer: "share", step: "form", links: [L(1, "For the neighbours", 120, 6, 3, { s: "unclaimed" }), L(2, "Book club", 288, 0, null)] }; } },
    forminv: { label: "Invite on", cap: "Include an invite is on: the count says what is left after this link. Off by default.", make: function () { return { layer: "share", step: "form", inv: true, links: [L(1, "For the neighbours", 120, 6, 3, { s: "unclaimed" }), L(2, "Book club", 288, 0, null)] }; } },
    formlimit: { label: "Invite limit", cap: "All 3 invites are in use: the switch is disabled with its reason. A link can still be made without one.", make: function () { return { layer: "share", step: "form", links: [L(1, "For the neighbours", 120, 6, 3, { s: "unclaimed" }), L(2, "Book club", 288, 2, 5, { s: "unclaimed" }), L(3, "Mum", 400, 3, 20, { s: "claimed", d: "Sun 11 Oct" })] }; } },
    formver: { label: "Form, versions", cap: "A recipe with other versions: a Which version row appears, The usual preselected. Only then.", make: function () { return { layer: "share", step: "form", multi: true, links: [L(1, "For the neighbours", 120, 6, 3, { s: "unclaimed" }), L(2, "Book club", 288, 0, null)] }; } },
    created: { label: "Link made", cap: "Link ready, with Copy link and Share, then Done. No invite on this one.", make: function () { return { layer: "share", step: "created", made: 3, links: [L(1, "For the neighbours", 120, 6, 3, { s: "unclaimed" }), L(2, "Book club", 288, 0, null), L(3, "Link 3", 168, 0, null)] }; } },
    createdinv: { label: "Made, with invite", cap: "Link ready with an invite: an invite line under the link, and the same line on the new row in the list.", make: function () { return { layer: "share", step: "created", made: 3, inv: true, links: [L(1, "For the neighbours", 120, 6, 3, { s: "unclaimed" }), L(2, "Book club", 288, 0, null), L(3, "Link 3", 168, 0, null, { s: "unclaimed" })] }; } },
    copied: { label: "Copied", cap: "Copy link pressed: the button says Copied and a line confirms it.", make: function () { return { layer: "share", step: "created", made: 3, copied: true, links: [L(1, "For the neighbours", 120, 6, 3, { s: "unclaimed" }), L(2, "Book club", 288, 0, null), L(3, "Link 3", 168, 0, null)] }; } },
    error: { label: "Error", cap: "Create failed: nothing was made, no invite was used, the form stays filled in. Try again.", make: function () { return { layer: "share", step: "form", inv: true, err: true, links: [L(1, "For the neighbours", 120, 6, 3, { s: "unclaimed" }), L(2, "Book club", 288, 0, null)] }; } },
    help: { label: "Shortcuts (?)", cap: "The ? list now has S, Share this recipe, on the recipe summary flyout.", make: function () { return { layer: "summary", step: "list", help: true, links: [L(1, "For the neighbours", 120, 6, 3, { s: "unclaimed" }), L(2, "Book club", 288, 0, null)] }; } }
  };

  /* ---- state ---- */
  var S = { open: true, layer: "summary", step: "list", links: [], editing: null, form: { name: "", exp: "7d", pin: true }, creating: false, copied: false, inv: false, err: false, multi: false, ver: "usual", failNext: false, made: 0, toast: "", help: false, cues: true, nextId: 10 };
  function load(key) {
    var p = PRESETS[key] || PRESETS.none, o = p.make();
    S.open = true; S.layer = o.layer; S.step = o.step; S.links = o.links; S.editing = o.editing || null; S.copied = !!o.copied; S.made = o.made || 0; S.help = !!o.help; S.creating = false; S.toast = ""; S.inv = !!o.inv; S.err = !!o.err; S.multi = !!o.multi; S.ver = "usual"; S.failNext = false;
    S.form = { name: "Link " + (S.links.length + 1), exp: "7d", pin: true };
    if (S.step === "created") S.form.name = S.links[S.links.length - 1].name;
    S.key = key;
  }

  /* ---- link helpers (from manage) ---- */
  function kind(l) { return l.hours < 0 ? "expired" : l.hours < SOON_H ? "soon" : "live"; }
  function plural(n, w) { return n + " " + w + (n === 1 ? "" : "s"); }
  function ago(h) { if (h < 1) return "just now"; if (h < 24) return Math.round(h) + " h ago"; var d = Math.round(h / 24); return d === 1 ? "yesterday" : d < 14 ? d + " days ago" : Math.round(d / 7) + " weeks ago"; }
  function leftText(h) { if (h < 1) return Math.max(1, Math.round(h * 60)) + " min left"; if (h < SOON_H) return Math.round(h) + " h left"; return Math.ceil(h / 24) + " days left"; }
  function when(l) { var d = new Date(Date.UTC(2026, 9, 13, 9, 41) + l.hours * 3600000); return d.toUTCString().replace(/ GMT$/, "").replace(/:\d\d$/, ""); }
  function mmss(s) { return Math.floor(s / 60) + ":" + (s % 60 < 10 ? "0" : "") + (s % 60); }
  function live(st) { return st.links.filter(function (l) { return !l.gone && l.cancelLeft <= 0 && l.hours >= 0; }).length; }
  /* invites: the allowance counts invites waiting plus claimed (as in manage); a cancelled or removed link frees its unclaimed invite */
  function used(st) { return st.links.filter(function (l) { return l.inv && (l.inv.s === "claimed" || (l.inv.s === "unclaimed" && !l.gone && l.cancelLeft <= 0 && l.hours >= 0)); }).length; }
  function allowance(st) {
    var n = Math.max(0, MAXINV - used(st));
    return '<p class="rs-allow" data-allow="' + n + '">' + ic("ticket") + "<b>" + n + " of " + MAXINV + " invites left</b><span>Cancel a link and its unused invite comes back.</span></p>";
  }
  function shown(st) { return st.links.filter(function (l) { return !l.gone || l.cancelLeft > 0; }); }

  function row(l, st) {
    var k = kind(l), editing = st.editing === l.id, name = esc(l.name);
    if (l.cancelLeft > 0) return '<li class="rs-undo" role="status" data-id="' + l.id + '">' + ic("undo") + '<span class="t"><b>' + (l.removed ? "Removed from view" : "Link cancelled") + "</b><small>“" + name + (l.removed ? "” is out of this list." : "” no longer opens.") + ' Undo for <span data-left="' + l.id + '">' + mmss(l.cancelLeft) + "</span>, then it stays " + (l.removed ? "removed" : "cancelled") + '</small></span><button type="button" class="rs-mini" data-act="undo" data-id="' + l.id + '">Undo</button></li>';
    if (l.gone) return "";
    var top = editing
      ? '<form class="rs-edit" data-act="save" data-id="' + l.id + '"><input name="n" value="' + name + '" maxlength="40" aria-label="Link name" autocomplete="off"><button type="submit" class="rs-save">' + ic("check") + 'Save</button><button type="button" class="rs-keep" data-act="keep" aria-label="Keep the old name">Keep</button></form>'
      : '<button type="button" class="rs-name" data-act="rename" data-id="' + l.id + '" aria-label="Rename ' + name + '"><span>' + name + "</span>" + ic("pencil") + "</button>" +
        (k === "expired" ? '<span class="rs-left" title="Ended ' + when(l) + '">' + ic("clock") + "Ended " + ago(-l.hours) + "</span>" : '<span class="rs-left" title="Ends ' + when(l) + '">' + ic("clock") + leftText(l.hours) + "</span>");
    var stats = l.opens === 0 ? "Not opened yet" : plural(l.opens, "open") + " · last " + ago(l.last);
    var iv = "";
    if (l.inv) {
      var v = l.inv.s === "unclaimed" && k === "expired" ? "ended" : l.inv.s, T = { unclaimed: "Invite waiting", claimed: "Invite claimed " + (l.inv.d || ""), ended: "Invite ended with the link" };
      iv = '<div class="rs-inv" data-inv="' + v + '">' + ic("ticket") + "<span>" + T[v] + "</span></div>";
    }
    var acts = k === "expired"
      ? '<button type="button" class="rs-act" data-act="renew" data-id="' + l.id + '" aria-label="Renew ' + name + '">' + ic("renew") + 'Renew</button><button type="button" class="rs-act rs-quiet rs-end" data-act="remove" data-id="' + l.id + '" aria-label="Remove ' + name + ' from view">' + ic("eyeoff") + "Remove from view</button>"
      : '<button type="button" class="rs-act" data-act="copy" data-id="' + l.id + '" aria-label="Copy link ' + name + '">' + ic("copy") + 'Copy link</button><button type="button" class="rs-act rs-end" data-act="cancel" data-id="' + l.id + '" aria-label="Cancel link ' + name + '">Cancel link</button>';
    return '<li class="rs-row" data-kind="' + k + '" data-id="' + l.id + '"><div class="rs-top">' + top + '</div><div class="rs-stats">' + stats + "</div>" + iv + '<div class="rs-acts">' + acts + "</div></li>";
  }
  function list(st) {
    var a = st.links.slice().sort(function (x, y) { return (x.hours < 0) - (y.hours < 0); });
    return '<ul class="rs-list" aria-label="Share links">' + a.map(function (l) { return row(l, st); }).join("") + "</ul>";
  }

  /* ---- the create form and the link made (from sheet option A) ---- */
  function expOf() { return EXP.filter(function (e) { return e[0] === S.form.exp; })[0]; }
  function endLabel() { return S.form.exp === "24h" ? "Ends tomorrow, 9:41 am" : "Ends " + dlab(plus(S.form.exp === "7d" ? 7 : 30)); }
  function seg() {
    return '<div class="sh-seg" role="group" aria-label="Link works for">' + EXP.map(function (e) { return '<button type="button" data-act="exp" data-v="' + e[0] + '" aria-pressed="' + (S.form.exp === e[0]) + '">' + e[1] + "</button>"; }).join("") + "</div>";
  }
  function verOf() { return S.multi && S.ver !== "usual" ? VERSIONS.filter(function (v) { return v[0] === S.ver; })[0][1] : VERSIONS[0][1]; }
  function errBox() {
    return '<div class="sh-err" role="alert"><span class="sh-ri">' + ic("warn") + '</span><div class="t"><b>Link not made</b><small>Nothing was shared' + (S.inv ? ", and no invite was used" : "") + '. Check your connection.</small></div><button type="submit" class="btn sm">Try again</button></div>';
  }
  function invRow() {
    var out = used(S) >= MAXINV, on = S.inv && !out, left = MAXINV - used(S) - (on ? 1 : 0);
    return '<div class="sh-row sh-inv" data-state="' + (out ? "limit" : on ? "on" : "off") + '"><span class="sh-ri">' + ic("ticket") + '</span><div class="t"><b>Include an invite</b><small id="fl-inv-why">' +
      (out ? "All " + MAXINV + " are in use. Cancel a link or withdraw an invite to free one." : "One person starts a household of their own. Only the first to use the link.") + '</small><small class="sh-cnt">' + left + " of " + MAXINV + " invites left" + (on ? " after this" : "") + "</small></div>" +
      '<button type="button" class="sw2" role="switch" aria-checked="' + on + '" aria-label="Include an invite"' + (out ? ' disabled aria-describedby="fl-inv-why"' : "") + ' data-act="inv">' + (on ? "On" : "Off") + "</button></div>";
  }
  function sumLine() { return '<p class="sh-sum">' + ic("eye", "s") + "<span>View only, no sign-in. " + esc(RECIPE.short) + (S.multi ? ", " + esc(verOf()) + (S.ver === "usual" ? " (the usual)" : "") : "") + ".</span></p>"; }
  function formHtml() {
    var f = S.form, pick = "";
    if (S.multi) {
      pick = '<div class="sh-f"><span class="sh-lbl">Which version</span><div class="sh-seg" role="group" aria-label="Which version">' + VERSIONS.map(function (v, i) { return '<button type="button" data-act="ver" data-v="' + v[0] + '" aria-pressed="' + (S.ver === v[0]) + '">' + (i === 0 ? "The usual" : v[1]) + "</button>"; }).join("") +
        '</div><p class="sh-help">' + (S.ver === "usual" ? "The usual is " + esc(VERSIONS[0][1]) + "." : "Fixed to " + esc(verOf()) + ", not your usual.") + "</p></div>";
    }
    return '<form class="sh sh-body" data-act="create" novalidate>' + (S.err ? errBox() : "") + '<div class="sh-f"><label class="sh-lbl" for="fl-name">Link name</label><input id="fl-name" name="n" class="field" maxlength="60" autocomplete="off" value="' + esc(f.name) + '">' +
      '<p class="sh-help">For you. It tells your links apart. The people you send it to do not see it.</p></div>' + pick +
      '<div class="sh-f"><span class="sh-lbl">Link works for</span>' + seg() + '<p class="sh-end">' + ic("clock", "s") + endLabel() + "</p></div>" +
      invRow() + sumLine() +
      '<button type="submit" class="btn sh-go"' + (S.creating ? " disabled" : "") + ">" + ic("link") + (S.creating ? "Making the link" : "Create link") + "</button></form>";
  }
  function createdHtml() {
    var l = S.links.filter(function (x) { return x.id === S.made; })[0] || S.links[S.links.length - 1];
    return '<div class="sh sh-body"><div class="sh-ok"><span class="sh-okic">' + ic("check") + '</span><div class="t"><b>Link ready</b><small class="trunc">' + esc(l.name) + " · ends " + dlab(plus(Math.round(l.hours / 24))) + "</small></div></div>" +
      '<input class="field sh-url" readonly value="' + URLS + 'Hq2xK9mPz" aria-label="The link" onfocus="this.select()">' +
      '<div><div class="sh-acts"><button type="button" class="btn" id="fl-copy" data-act="copynew">' + (S.copied ? ic("check") + "Copied" : ic("copy") + "Copy link") + '</button><button type="button" class="btn ghost" data-act="sharenew">' + ic("share") + "Share</button></div>" +
      '<p class="sh-live" role="status" aria-live="polite">' + (S.copied ? "Link copied. Paste it anywhere." : "") + "</p></div>" +
      (l.inv ? '<p class="sh-invm" data-inv="unclaimed">' + ic("ticket", "s") + "<span>Invite included. Only the first person to use it starts a household.</span></p>" : "") + sumLine() +
      '<button type="button" class="btn ghost sh-go" data-act="done">Done</button></div>';
  }

  /* ---- the two lanes of the flyout ---- */
  function chip() {
    var n = live(S);
    return '<button type="button" class="shr-chip fl-sharebtn' + (n ? " on" : "") + '" data-act="share" aria-haspopup="dialog" aria-label="Share this recipe' + (n ? ", " + plural(n, "link") + " out" : "") + '">' + ic("share") + "Share" + (n ? '<span class="shr-n" aria-hidden="true">' + n + "</span>" : "") + '<span class="kbd" aria-hidden="true">S</span></button>';
  }
  function summaryHtml() {
    var m = '<div class="rb-mem"><span class="rb-av">3</span><b>3 members</b><span class="rb-lbl">Did not say</span><span class="rb-th no" role="img" aria-label="Did not say"></span></div>';
    var ing = [["Chicken thighs, honey soy marinated", "500 g"], ["Cucumbers", "2½ piece"], ["Chilli oil, Chiu Chow style", "2 tsp"], ["Soy sauce", "1 tbsp"], ["Spinach leaves", "120 g"], ["Green onions, sliced (optional)", "2 tbsp"]]
      .map(function (x) { return "<li><span>&#10003;</span><span>" + esc(x[0]) + "</span><b>" + x[1] + "</b></li>"; }).join("");
    return '<aside class="rb-fly fl-sum" aria-label="Recipe summary"><div class="fl-banner" role="img" aria-label="Recipe photo (placeholder)">' + RECIPE.e + '</div>' +
      '<header class="rb-fh"><div class="rb-ft"><h3 id="fl-title" tabindex="-1">' + esc(RECIPE.name) + "</h3><small>" + RECIPE.meta + '</small></div><button type="button" class="rb-x" data-act="close" aria-label="Close" title="Close (' + MOD + ' Esc)">' + ic("close") + "</button></header>" +
      '<div class="rb-fb"><section class="rb-sec"><h4 class="rb-h4">Household says</h4><div class="rb-cooked"><div><b class="rb-big">1&times;</b><small>times cooked</small></div><div><b class="rb-big s">today</b><small>last cooked, 13 Oct</small></div></div>' + m +
      '<h4 class="rb-h4 sub">Notes <span class="n">1</span></h4><blockquote class="rb-q"><span class="rb-av">Y</span><div><b>You</b> <small>13 Oct</small><p>If the spring onions have been frozen, cook them into the dish. Do not sprinkle on top, the texture changes.</p></div></blockquote></section>' +
      '<section class="rb-sec" aria-label="Ingredients"><h4 class="rb-h4">Ingredients <span class="rb-tg">Stock unknown</span></h4><ul class="rb-ing two">' + ing + "</ul></section></div>" +
      '<footer class="rb-ff"><div class="rb-acts"><button type="button" class="rb-btn pri" data-act="cook">Make it</button><button type="button" class="rb-btn pri" data-act="plan">Plan</button></div>' +
      '<div class="fl-ofrow"><a class="rb-open" href="#" data-act="openrecipe">Open full recipe <span class="kbd">O</span></a><span id="fl-chip">' + chip() + "</span></div>" +
      '<p class="phint"><span class="kbd">' + MOD + ' Esc</span> to close, <span class="kbd">?</span> for all shortcuts</p></footer></aside>';
  }
  var TITLES = { list: "Share this recipe", form: "Make a link", created: "Your link" };
  var BACKS = { list: "Back to the recipe", form: "Back to the links", created: "Back to the links" };
  function panelHtml() {
    var st = S, body, hint;
    if (st.step === "form") { body = formHtml(); hint = '<span class="kbd">Enter</span> to create, <span class="kbd">Esc</span> back, <span class="kbd">' + MOD + " Esc</span> to close"; }
    else if (st.step === "created") { body = createdHtml(); hint = '<span class="kbd">Esc</span> back, <span class="kbd">' + MOD + " Esc</span> to close"; }
    else {
      var has = shown(st).length > 0;
      body = '<p class="fl-lead">Anyone with a link can read it, with no sign-in. A link works more than once and then expires.</p>' +
        (has ? allowance(st) + list(st) : '<div class="rs-empty">' + ic("link") + "<b>Not shared with anyone yet</b><p>Links you make with Share show up here, with who opened them.</p></div>") +
        '<button type="button" class="rb-btn pri fl-make" data-act="make">' + ic("link") + (has ? "Make another link" : "Make a link") + "</button>" +
        '<p class="fl-foot">The household sees every link here and can cancel it.</p>';
      hint = '<span class="kbd">Esc</span> back, <span class="kbd">' + MOD + " Esc</span> to close";
    }
    return '<aside class="rb-fly fl-share" role="dialog" aria-labelledby="fl-share-t" aria-label="Share this recipe" data-step="' + st.step + '"><header class="rb-fh"><button type="button" class="rb-x" data-act="back" aria-label="' + BACKS[st.step] + '" title="Back (Esc)">' + ic("back") + '</button><div class="rb-ft">' + ic("share") + '<h3 id="fl-share-t" tabindex="-1">' + TITLES[st.step] + '</h3></div><button type="button" class="rb-x" data-act="close" aria-label="Close" title="Close (' + MOD + ' Esc)">' + ic("close") + "</button></header>" +
      '<div class="rb-fb" data-scroll>' + body + '</div><footer class="rb-ff"><p class="phint">' + hint + "</p></footer></aside>";
  }
  function helpHtml() {
    var r = function (k, t, n) { return '<div class="kbr' + (n ? " new" : "") + '"><span class="kk">' + k + "</span><span>" + t + (n ? '<i class="kbnew">New</i>' : "") + "</span></div>"; };
    return '<div class="kb" role="dialog" aria-modal="true" aria-label="Shortcuts" data-act="helpscrim"><div class="kbc"><div class="kbh"><h3>Shortcuts</h3><button type="button" class="rb-x" data-act="helpclose" aria-label="Close the list">' + ic("close") + '</button></div><div class="kbg"><div class="kbs"><h4>On the recipe summary</h4>' +
      r("<kbd>O</kbd>", "Open full recipe") + r("<kbd>S</kbd>", "Share this recipe: opens the share panel", true) + r("<kbd>" + MOD + "</kbd> <kbd>Esc</kbd>", "Close the flyout") +
      '</div><div class="kbs"><h4>In the share panel</h4>' + r("<kbd>Esc</kbd>", "Back one step (cancels a rename first)", true) + r("<kbd>Enter</kbd>", "Save a name, or Create link", true) + r("<kbd>" + MOD + "</kbd> <kbd>Esc</kbd>", "Close the flyout") +
      '</div><div class="kbs"><h4>Anywhere</h4>' + r("<kbd>?</kbd> <em>or</em> <kbd>H</kbd>", "This list") + r("<kbd>Tab</kbd>", "Next control") + '</div></div><div class="kbt"><span>Show shortcut cues on buttons and hints</span><button type="button" class="sw2" role="switch" aria-checked="' + S.cues + '" data-act="cues">' + (S.cues ? "On" : "Off") + "</button></div></div></div>";
  }

  window.FL = { used: used, MAXINV: MAXINV, verOf: verOf, S: S, ic: ic, esc: esc, MOD: MOD, PRESETS: PRESETS, ROWS: ROWS, RECIPE: RECIPE, load: load, summaryHtml: summaryHtml, panelHtml: panelHtml, helpHtml: helpHtml, chip: chip, live: live, shown: shown,
    UNDO_S: UNDO_S, mmss: mmss, expOf: expOf, endLabel: endLabel, plus: plus, URLS: URLS, dlab: dlab };

  /* ---- bootstrap: the frame and the keys are desktop only; under 1024px nothing is fetched ---- */
  var q = new URLSearchParams(location.search);
  FL.freeze = q.get("freeze") === "1"; FL.failParam = q.get("fail") === "1";   /* ?fail=1: the first Create fails, so Try again can be seen */
  function start() {
    var stage = document.getElementById("fl-stage"), cap = document.getElementById("fl-cap");
    var sw = document.getElementById("fl-states");
    sw.innerHTML = Object.keys(PRESETS).map(function (k) { return '<button type="button" data-preset="' + k + '" aria-pressed="false">' + PRESETS[k].label + "</button>"; }).join("");
    FL.cap = cap;
    if (!matchMedia("(min-width:1024px)").matches) { stage.innerHTML = '<p class="fl-narrow">Desktop only. On a phone or tablet there is no summary flyout: a tap on a recipe row opens the full recipe page, where Share already lives (placement slice, option A). Open this page in a window at least 1024px wide.</p>'; sw.hidden = true; return; }
    var lk = document.createElement("link"); lk.rel = "stylesheet"; lk.href = "desktop.css"; document.head.appendChild(lk);
    var s = document.createElement("script"); s.src = "desktop.js"; document.body.appendChild(s);
  }
  document.addEventListener("DOMContentLoaded", start);
})();
