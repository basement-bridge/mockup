/* Recipe screens use the app's own keys; nothing Recipe-specific is invented (owner, 11 Oct 2026; keys from docs/handover/desktop.md section 3
   and the item flyout): E edit, the comma History, M focus the main column, ? or H the list, Ctrl or Cmd plus Enter closes (plain Esc closes nothing).
   A screen opts in with data-key="e" or data-key="," on the control that does it, so a hint and the key only exist where the control does.
   Loaded by recipe.js at 1024px and up with a hover pointer; a phone never fetches this. */
(function () {
"use strict";
var MAC = /Mac|iPhone|iPad/.test(navigator.platform || ""), CLOSE = MAC ? "&#8984; Enter" : "Ctrl Enter";
var $ = function (s, r) { return (r || document).querySelector(s); };
var sv = function (name) { return (window.RCP && RCP.ic) ? RCP.ic(name) : ""; };
var cues = true; try { cues = localStorage.getItem("rcp-cues") !== "off"; } catch (e) {}
var root = document.documentElement; root.classList.toggle("nocues", !cues);
function G(t, rows) {
  return '<section class="kbs"><h3>' + t + "</h3>" + rows.map(function (r) {
    var k = r[0].split(" ").map(function (w) { return /^(then|or|and)$/.test(w) ? "<em>" + w + "</em>" : "<kbd>" + w + "</kbd>"; }).join(" ");
    return '<div class="kbr"><span class="kk">' + k + "</span><span>" + r[1] + "</span></div>";
  }).join("") + "</section>";
}
function helpHtml() {
  var open = [];
  if ($('[data-key="e"]')) open.push(["E", "Change this version"]);
  if ($('[data-key=","]')) open.push([",", "History (press again to go back)"]);
  return '<div class="kb" id="rk-help" role="dialog" aria-modal="true" aria-label="Keyboard shortcuts" hidden><div class="kbc"><div class="kbh"><h2>Shortcuts</h2><button type="button" class="x" data-rk="closehelp" aria-label="Close the list" title="Close the list">' + sv("x") + "</button></div>"
    + (open.length ? G("This version", open) : "")
    + G("Move", [["M", "Focus the first item on the page"]])
    + G("Close", [[CLOSE.replace("&#8984;", "Cmd"), "Close the sheet or photo, or go back one screen. Ctrl on Windows and Linux, Cmd on a Mac"], ["Esc", "Closes nothing; it only leaves a box you are typing in"]])
    + G("General", [["? or H", "This list"]])
    + '<div class="kbt"><span>Show key hints on buttons and links</span><button type="button" class="sw2" role="switch" aria-checked="' + cues + '" data-rk="cues">' + (cues ? "On" : "Off") + "</button></div></div></div>";
}
function chips() {
  [].forEach.call(document.querySelectorAll("[data-key]"), function (el) {
    if (el.querySelector(":scope > .kbd")) return;
    var k = el.getAttribute("data-key"); el.insertAdjacentHTML("beforeend", '<span class="kbd" aria-hidden="true">' + (k === "," ? "," : k.toUpperCase()) + "</span>");
  });
}
function ensure() {
  chips();
  if (!$("#rk-help")) document.body.insertAdjacentHTML("beforeend", helpHtml());
  if (!$(".keyhint")) document.body.insertAdjacentHTML("beforeend", '<button type="button" class="kbd keyhint keep" data-rk="help" aria-label="Keyboard shortcuts"><b>?</b> Keys</button>');
}
function help(on) { var h = $("#rk-help"); on = on === undefined ? h.hidden : on; h.hidden = !on; if (on) { var b = $("#rk-help .x"); if (b) b.focus(); } }
function cuesToggle() {
  cues = !cues; try { localStorage.setItem("rcp-cues", cues ? "on" : "off"); } catch (e) {}
  root.classList.toggle("nocues", !cues); var s = $("[data-rk=cues]"); s.setAttribute("aria-checked", String(cues)); s.textContent = cues ? "On" : "Off";
}
/* close the top thing: the list, then a sheet, then a photo viewer, then go back one screen (the top bar's back link) */
function closeTop() {
  if (!$("#rk-help").hidden) { help(false); return; }
  var ph = $(".phone"); if (!ph) return;
  var sc = ph.querySelector(".scrim[data-close]"); if (sc) { sc.click(); return; }
  var pv = ph.querySelector(".pv [data-x]"); if (pv) { pv.click(); return; }
  var nt = $("#nt"); if (nt && nt.value.trim() && window.RCP) { RCP.toast("Your note is not saved yet. Use Cancel to leave without it."); return; }
  var bk = ph.querySelector(".top .back"); if (bk) bk.click();
}
document.addEventListener("click", function (e) {
  var b = e.target.closest("[data-rk]"); if (!b) return; var a = b.dataset.rk;
  if (a === "help") help(true); else if (a === "closehelp") help(false); else if (a === "cues") cuesToggle();
});
document.addEventListener("keydown", function (e) {
  var t = e.target, typing = t.closest && t.closest("input,textarea,select,[contenteditable]");
  if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) { e.preventDefault(); closeTop(); return; }
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  if (typing) { if (e.key === "Escape") t.blur(); return; }
  var k = e.key, kl = k.length === 1 ? k.toLowerCase() : k;
  if (!$("#rk-help").hidden) { if (k === "?" || kl === "h") { e.preventDefault(); help(false); } return; }
  if (k === "?" || kl === "h") { e.preventDefault(); help(true); return; }
  if (document.querySelector(".phone .sheet,.phone .pv")) return;
  var el;
  if (kl === "m") { e.preventDefault(); el = $(".phone #body a[href],.phone #body button,.phone .body a[href],.phone .body button"); if (el) el.focus(); }
  else if (kl === "e") { el = $('[data-key="e"]'); if (el) { e.preventDefault(); el.click(); } }
  else if (k === ",") { el = $('[data-key=","]'); if (el) { e.preventDefault(); el.click(); } }
});
ensure();
var ph = $(".phone"), raf;
if (ph && window.MutationObserver) new MutationObserver(function () { cancelAnimationFrame(raf); raf = requestAnimationFrame(chips); }).observe(ph, { childList: true, subtree: true });
})();
