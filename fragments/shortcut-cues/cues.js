/* Global shortcut cues: Shift + ? from anywhere (owner, voice, 11 Oct 2026). Written as the build will have it (server/src/assets/keys-global.js asks for keys-help.js the same way).
   WHAT IT DOES: Shift+? (or H) opens the Shortcuts list on whatever screen, flyout, modal or sub-screen is up; the same key (or Ctrl/Cmd+Esc, the x, a click outside) closes it.
   If the cue switch is Off, the cues come on for THIS VISIT while the list is up and stay on until the page is left; the stored switch is only changed by the switch itself.
   WHEN IT STAYS OUT OF THE WAY: while you type (a text box, search, number, date, textarea, contenteditable, a role=textbox/combobox), while an IME is composing, with Ctrl/Cmd/Alt held, on key repeat,
   and when another handler already took the press (Profile window has its own list, an inline edit). A checkbox, radio, button or range is not typing.
   LAYOUTS: the key is read from what the press PRODUCES (event.key === "?"), never from the physical key, so Shift+/ on US/UK, Shift+, on French, Shift+ss on German, Shift+' on Spanish and so on all work.
   A layout that needs AltGr for ? works too (AltGraph is allowed). A layout with no ? at all uses H, or the Keys button.
   API for a screen: Cues.screen("Pantry", [["E","Edit the open item"], ...]) names the keys this screen has; rows from an open flyout/modal are added with Cues.layer(id, rows) and removed with Cues.layer(id, null). */
(function () {
"use strict";
var MAC = /Mac|iPhone|iPad/.test(navigator.platform || ""), CLOSE = MAC ? "⌘ Esc" : "Ctrl Esc";
var NOTYPE = /^(button|checkbox|radio|range|color|file|submit|reset|image)$/;
var body = document.body, st = { screen: "This screen", rows: [], layers: {}, peek: false, kb: null, from: null };
var stored = function () { try { return localStorage.getItem("cues") !== "off"; } catch (e) { return true; } };
var $ = function (s, r) { return (r || document).querySelector(s); };

function typing(t) {
  var el = t && t.closest && t.closest('input,textarea,select,[contenteditable],[role="textbox"],[role="combobox"],[role="searchbox"]');
  if (!el) return false;
  if (el.tagName === "INPUT") return !NOTYPE.test((el.getAttribute("type") || "text").toLowerCase());
  if (el.hasAttribute("contenteditable")) return el.getAttribute("contenteditable") !== "false";
  return true;
}
function apply() { body.classList.toggle("nocues", !(stored() || st.peek)); }

function row(r) {
  var k = String(r[0]).split(" ").map(function (w) { return /^(then|or|and|to)$/.test(w) ? "<em>" + w + "</em>" : "<kbd>" + w + "</kbd>"; }).join(" ");
  return '<div class="kbr"><span class="kk">' + k + "</span><span>" + r[1] + "</span></div>";
}
function sec(t, rows) { return rows.length ? '<section class="kbs"><h3>' + t + "</h3>" + rows.map(row).join("") + "</section>" : ""; }
function layerRows() { var out = []; Object.keys(st.layers).forEach(function (id) { out = out.concat(st.layers[id]); }); return out; }
function html() {
  var own = layerRows().concat(st.rows);
  return '<div class="kbc" role="dialog" aria-modal="true" aria-labelledby="kbt"><div class="kbh"><h2 id="kbt">Keyboard shortcuts</h2><button type="button" class="x" data-cues="close" aria-label="Close" title="Close (' + CLOSE + ')">&times;</button></div>'
    + '<p class="kbn" id="kbscreen">On: <b>' + st.screen + "</b></p>"
    + (st.peekNote ? '<p class="kbn peek">Cues were switched off. They are on for this visit; the switch below is what you saved.</p>' : "")
    + '<div class="kbg">'
    + (own.length ? sec("On this screen", own) : sec("On this screen", []) + '<section class="kbs"><h3>On this screen</h3><p class="kbn">No keys of its own here. The ones below work everywhere.</p></section>')
    + sec("Anywhere", [["Shift ?", "This list (or H). Pressing it again closes it"], ["Shift Space", "Key hints on or off (cue-key.js; not while you type, or on a button or link)"], [CLOSE, "Close this list, then the open panel"], ["Tab", "Move to the next control; Shift Tab goes back"], ["Enter", "Press the control you are on"]])
    + '</div><div class="kbt"><span id="cuel">Show shortcut cues on buttons and hints</span><button type="button" class="sw2" role="switch" aria-labelledby="cuel" aria-checked="' + stored() + '" data-cues="sw">' + (stored() ? "On" : "Off") + "</button></div>"
    + '<p class="kbf">Shortcuts pause while you type in a box, so ? still types a ?. Click outside the box or press Tab to leave it first.</p></div>';
}
function open() {
  if (st.kb && !st.kb.hidden) return;
  st.peekNote = !stored(); st.peek = true; apply();
  if (!st.kb) { st.kb = document.createElement("div"); st.kb.className = "kb"; st.kb.id = "kb"; body.appendChild(st.kb); }
  st.kb.innerHTML = html(); st.kb.hidden = false; st.from = document.activeElement;
  var x = $(".x", st.kb); if (x) x.focus();
  document.dispatchEvent(new CustomEvent("cues:open"));
}
function close() {
  if (!st.kb || st.kb.hidden) return false;
  st.kb.hidden = true; if (st.from && document.contains(st.from) && st.from.focus) st.from.focus();
  document.dispatchEvent(new CustomEvent("cues:close")); return true;
}
function toggle() { if (st.kb && !st.kb.hidden) close(); else open(); }
function setStored(on) { try { localStorage.setItem("cues", on ? "on" : "off"); } catch (e) {} st.peek = false; st.peekNote = false; apply(); }

document.addEventListener("click", function (e) {
  var b = e.target.closest && e.target.closest("[data-cues]");
  if (b) { var a = b.dataset.cues; if (a === "close") close(); else if (a === "sw") { setStored(b.getAttribute("aria-checked") !== "true"); b.setAttribute("aria-checked", String(stored())); b.textContent = stored() ? "On" : "Off"; var n = $(".kbn.peek", st.kb); if (n) n.remove(); } else if (a === "open") open(); return; }
  if (st.kb && e.target === st.kb) close();
});
/* The list is on top, so while it is up the close chord is ITS (capture phase, before any page handler): one Ctrl/Cmd+Esc closes the list and nothing behind it. */
window.addEventListener("keydown", function (e) {
  if (st.kb && !st.kb.hidden && (e.ctrlKey || e.metaKey) && (e.key === "Escape" || e.key === "Enter")) { e.preventDefault(); e.stopPropagation(); close(); }
}, true);
/* bubble phase on window: a handler that already took the press (preventDefault) wins, and the Profile window, which stops the press, keeps its own list */
window.addEventListener("keydown", function (e) {
  if (e.defaultPrevented || e.isComposing || e.keyCode === 229 || e.repeat) return;
  var altgr = e.getModifierState && e.getModifierState("AltGraph");
  if (e.metaKey || (e.ctrlKey && !altgr) || (e.altKey && !altgr)) return;
  var q = e.key === "?", h = (e.key === "h" || e.key === "H") && !altgr;
  if (!q && !h) return;
  if (typing(e.target)) return;
  e.preventDefault(); toggle();
});
window.Cues = {
  screen: function (name, rows) { st.screen = name; st.rows = rows || []; if (st.kb && !st.kb.hidden) st.kb.innerHTML = html(); },
  layer: function (id, rows) { if (rows) st.layers[id] = rows; else delete st.layers[id]; if (st.kb && !st.kb.hidden) st.kb.innerHTML = html(); },
  set: function (on) { setStored(on); var b = st.kb && $('[data-cues="sw"]', st.kb); if (b) { b.setAttribute("aria-checked", String(on)); b.textContent = on ? "On" : "Off"; } },
  open: open, close: close, toggle: toggle, typing: typing, stored: stored
};
apply();
})();
