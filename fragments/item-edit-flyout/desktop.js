/* Desktop host (1024px and up). Fetched only at these sizes; phone.js is the other host. Everything here is about the keyboard and the pointer.
   Keys follow the Pantry (docs/handover/desktop.md section 3): E edit, the comma History, U use one, D used up, S shopping list, Z undo, N add, M the first item in the main column, ? or H the list.
   Close is Ctrl or Cmd plus Enter: the edit or history first, then the item. Plain Esc closes nothing. Letters do nothing while you type in a box. */
(function () {
"use strict";
var IEF = window.IEF, $ = IEF.$, esc = IEF.esc, S = IEF.S;
var MAC = /Mac|iPhone|iPad/.test(navigator.platform || ""), CLOSE = MAC ? "&#8984; Enter" : "Ctrl Enter";
var NAV = [["home", "Home"], ["pantry", "Pantry"], ["recipes", "Recipes"], ["cartnav", "Shopping"]];
function G(t, rows) {
  return '<section class="kbs"><h3>' + t + "</h3>" + rows.map(function (r) {
    var k = r[0].split(" ").map(function (w) { return /^(then|or|and)$/.test(w) ? "<em>" + w + "</em>" : "<kbd>" + w + "</kbd>"; }).join(" ");
    return '<div class="kbr"><span class="kk">' + k + "</span><span>" + r[1] + "</span></div>";
  }).join("") + "</section>";
}
var HELP = '<div class="kb" id="ief-help" role="dialog" aria-modal="true" aria-label="Keyboard shortcuts" hidden><div class="kbc"><div class="kbh"><h2>Shortcuts</h2><button type="button" class="x" data-ief="closehelp" aria-label="Close the list" title="Close the list">' + IEF.sv(IEF.IC.x, "", 20) + '</button></div><div class="kbg">'
  + G("The open item", [["E", "Edit: opens the edit flyout under the item"], [",", "History: opens the history flyout (press again to close)"], ["U", "Use one (counted items)"], ["D", "Used up"], ["S", "Add to the shopping list"], ["Z", "Undo"]])
  + G("Move", [["&uarr; &darr; or J K", "Previous or next item"], ["Enter", "Open the focused row"], ["M", "Focus the first item in the main column"], ["N", "Add an item"]])
  + G("Close", [["Ctrl Enter", "Close the edit or history, then the item. Cmd Enter on a Mac"], ["Esc", "Closes nothing; it only leaves a box you are typing in"]])
  + G("General", [["? or H", "This list"]])
  + '</div><div class="kbt"><span>Show key hints on buttons and icons</span><button type="button" class="sw2" role="switch" aria-checked="true" data-ief="cues">On</button></div></div></div>';

IEF.host = {
  keys: true, closeLabel: CLOSE,
  shell: function (p) {
    return '<div class="app" id="ief-app"><nav class="rail" aria-label="Main"><div class="brand">Our<br>kitchen</div>'
      + NAV.map(function (n) { return '<span class="nv' + (n[0] === "pantry" ? " on" : "") + '"><svg viewBox="0 0 24 24" aria-hidden="true">' + IEF.IC[n[0]] + "</svg><span>" + n[1] + "</span></span>"; }).join("")
      + '<div class="me"><button type="button" class="nv" data-ief="help" aria-label="Keyboard shortcuts"><span class="qk">?</span><span>Keys</span></button><span class="av" aria-hidden="true">S</span></div></nav>'
      + '<main class="main"><div class="col">' + p.list + "</div></main>"
      + '<aside class="panel" id="ief-panel" aria-label="Item detail" data-empty="1"></aside>'
      + '<aside class="ief-child" id="ief-child" aria-label="Edit item" hidden></aside></div>'
      + '<div class="toast" id="ief-toast" role="status" hidden></div>' + HELP;
  },
  itemOpened: function (o) { if (o && o.from && o.from.classList && o.from.classList.contains("row")) { var r = $('.row[data-id="' + S.sel + '"]'); if (r) r.focus({ preventScroll: true }); } },
  itemClosed: function (id) { var r = $('.row[data-id="' + id + '"]'); if (r) r.focus({ preventScroll: true }); },
  addReady: function () { var n = $('#ief-panel [data-f="name"]'); if (n) n.focus(); },
  addClosed: function () { },
  /* a keyboard user lands in the field they asked for (the name first); the pointer user gets the same, with the field highlighted */
  childReady: function (kind, o) {
    if (kind === "history") { var x = $('#ief-child .x'); if (x) x.focus({ preventScroll: true }); return; }
    IEF.form.focusField(o.field || "", true);
  },
  booted: function () { if (new URLSearchParams(location.search).get("help") === "1") help(true); }
};
if (new URLSearchParams(location.search).get("cues") === "0") document.body.classList.add("nocues");

function help(on) { var h = $("#ief-help"); on = on === undefined ? h.hidden : on; h.hidden = !on; if (on) { var b = $("#ief-help .x"); if (b) b.focus(); } }
function cues() { var off = document.body.classList.toggle("nocues"), b = $('[data-ief="cues"]'); if (b) { b.setAttribute("aria-checked", !off); b.textContent = off ? "Off" : "On"; } }
IEF.act.help = function () { help(); }; IEF.act.closehelp = function () { help(false); }; IEF.act.cues = cues;

function visible() { return Array.prototype.map.call(document.querySelectorAll("#ief-list .row"), function (r) { return r.dataset.id; }); }
function move(d) {
  var ids = visible(); if (!ids.length) return; var i = ids.indexOf(S.sel), n = i < 0 ? (d > 0 ? 0 : ids.length - 1) : Math.max(0, Math.min(ids.length - 1, i + d));
  IEF.openItem(ids[n], {}); var r = $('.row[data-id="' + ids[n] + '"]'); if (r) { r.focus({ preventScroll: true }); r.scrollIntoView({ block: "nearest" }); }
}
function useOne() {
  var it = IEF.cur(); if (!it || !IEF.counted(it) || !(it.amount > 0)) return;
  var s = IEF.snap(), from = IEF.qtyText(it); it.amount -= 1; IEF.reviseQty(it); IEF.log(it, "Quantity", from, IEF.qtyText(it)); IEF.syncParent();
  if (S.child === "edit") IEF.form.fill(it);
  IEF.toast(esc(it.name) + ": " + esc(IEF.qtyText(it) || "Out") + " left.", s);
}
document.addEventListener("keydown", function (e) {
  var t = e.target, typing = t.closest && t.closest("input,textarea,select,[contenteditable]");
  if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
    e.preventDefault(); if (!$("#ief-help").hidden) { help(false); return; }
    IEF.closeTop(); return;
  }
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  if (typing) { if (e.key === "Escape") t.blur(); return; }
  if (!$("#ief-help").hidden) { if (e.key === "?" || e.key.toLowerCase() === "h") { e.preventDefault(); help(false); } return; }
  var k = e.key, kl = k.length === 1 ? k.toLowerCase() : k;
  if (k === "?" || kl === "h") { e.preventDefault(); help(true); return; }
  if (S.mode === "add") return;
  if (k === "ArrowDown" || kl === "j") { e.preventDefault(); move(1); }
  else if (k === "ArrowUp" || kl === "k") { e.preventDefault(); move(-1); }
  else if (kl === "n") { e.preventDefault(); IEF.startAdd(); }
  else if (kl === "m") { e.preventDefault(); var f = $("#ief-list .row"); if (f) f.focus(); }
  else if (!IEF.cur()) return;
  else if (kl === "e") { e.preventDefault(); IEF.toggleChild("edit", $('#ief-head [data-ief="edit"]')); }
  else if (k === ",") { e.preventDefault(); IEF.toggleChild("history", $('#ief-head [data-ief="history"]')); }
  else if (kl === "u") { e.preventDefault(); useOne(); }
  else if (kl === "d") { e.preventDefault(); IEF.usedUp(); }
  else if (kl === "s") { e.preventDefault(); IEF.shopQuick(); }
  else if (kl === "z") { e.preventDefault(); IEF.undo(); }
});
})();
