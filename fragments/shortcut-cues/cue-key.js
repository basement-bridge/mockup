/* Shift + Space turns the key hints (the key-cap cues on icons and buttons) on and off (owner, by voice, 12 Oct 2026; decisions 120 to 124 in docs/knowledge/jobs-to-be-done/item-edit-flyout.md,
   findings in the same note). Written as the build will have it: the build puts the same rules in keys-global.js (every page), which also holds Shift + ?.
   WHAT IT DOES: flips the cues between shown (the default) and hidden, keeps the choice on this device (localStorage "desktop-cues", "0" is off, the key the Cues button already uses), and says so in a small
   status line ("Key hints on" / "Key hints off") that sits in an aria-live region, so a screen reader hears it too.
   WHERE: from 1024px up, where the hints are drawn (decision 68); a phone or tablet window has none, so the key does nothing there and the browser keeps Shift + Space.
   WHEN IT STAYS OUT OF THE WAY: Shift + Space types a space in a text box, so it does nothing while focus is in an input, textarea, select, contenteditable or a textbox/combobox/searchbox role. It does nothing on a
   button, link, checkbox, radio, switch, tab, menu item or summary either (Space is how those are pressed). It ignores Ctrl, Cmd and Alt chords, key repeat and an IME that is composing (keyCode 229).
   preventDefault only when it acts, so a press it ignores still scrolls the page up, as the browser does.
   A fragment with its own cue state registers it: CueKey.host = { get: function () { return on; }, set: function (on) { ... } }. With none, the host flips body.nocues and the stored switch. */
(function () {
"use strict";
if (window.CueKey) return;
var KEY = "desktop-cues", timer = 0, live = null;
var SKIP = 'input,textarea,select,button,summary,a[href],[contenteditable],[role="textbox"],[role="combobox"],[role="searchbox"],[role="button"],[role="link"],[role="checkbox"],[role="switch"],[role="radio"],[role="tab"],[role="menuitem"],[role="option"],[role="slider"],[role="spinbutton"]';

function skip(t) { return !!(t && t.closest && t.closest(SKIP)); }
var host = {
  get: function () { return !document.body.classList.contains("nocues"); },
  set: function (on) {
    document.body.classList.toggle("nocues", !on);
    try { localStorage.setItem(KEY, on ? "1" : "0"); } catch (e) { /* no storage: the choice lasts until the page closes */ }
  }
};
function style() {
  if (document.getElementById("cue-status-css")) return;
  var s = document.createElement("style"); s.id = "cue-status-css";
  s.textContent = ".cue-status{position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:60;max-width:calc(100vw - 32px);padding:10px 16px;border-radius:12px;background:var(--fg);color:var(--bg);font:600 14px var(--body);opacity:0;pointer-events:none;transition:opacity .15s}.cue-status.on{opacity:1}";
  document.head.appendChild(s);
}
function say(text) {
  style();
  if (!live) { live = document.createElement("div"); live.id = "cue-status"; live.className = "cue-status"; live.setAttribute("role", "status"); live.setAttribute("aria-live", "polite"); live.setAttribute("aria-atomic", "true"); document.body.appendChild(live); }
  clearTimeout(timer); live.classList.remove("on"); live.textContent = "";
  setTimeout(function () { live.textContent = text; live.classList.add("on"); }, 30); // the region is in the page already; a changed text is what a screen reader announces
  timer = setTimeout(function () { live.classList.remove("on"); live.textContent = ""; }, 2400);
}
function toggle() {
  var on = !host.get();
  host.set(on);
  say(on ? "Key hints on" : "Key hints off");
  document.dispatchEvent(new CustomEvent("cue-key", { detail: { on: on } }));
}
window.addEventListener("keydown", function (e) {
  if (e.key !== " " || !e.shiftKey || e.defaultPrevented || e.isComposing || e.keyCode === 229 || e.repeat) return;
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  if (!window.matchMedia("(min-width:1024px)").matches) return; // the key hints are drawn from 1024px up (decision 68); a phone or tablet has none to switch
  if (skip(e.target)) return;
  e.preventDefault(); // only now: an ignored Shift + Space keeps its normal job (scroll up)
  toggle();
});
window.CueKey = { toggle: toggle, skip: skip, say: say, get host() { return host; }, set host(h) { host = h; } };
})();
