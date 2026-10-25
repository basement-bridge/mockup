/* kitchie #1102 mockup: Undo and Redo in History. Sample data only. */
(function () {
  var q = new URLSearchParams(location.search), list = document.getElementById("list"),
    toast = document.getElementById("toast"), tt = document.getElementById("toast-text"), tu = document.getElementById("toast-undo"), timer;
  if (q.get("mode") === "redo-word") { var w = list.querySelector("[data-word]"); if (w) w.textContent = "Undo"; }
  function show(msg, withUndo) {
    clearTimeout(timer); tt.textContent = msg; tu.hidden = !withUndo; toast.classList.remove("err"); toast.hidden = false;
    timer = setTimeout(function () { toast.hidden = true; }, 5000);
  }
  function undoneChip() {
    return '<span class="chip undone"><svg class="sm" viewBox="0 0 24 24"><path d="M9 14L4 9l5-5"/><path d="M4 9h10a6 6 0 010 12h-3"/></svg>Undone</span>';
  }
  list.addEventListener("click", function (e) {
    var b = e.target.closest("[data-act]"); if (!b) return;
    var ev = b.closest(".ev"), name = ev.querySelector(".ln b:last-child").textContent, meta = ev.querySelector(".meta");
    if (ev.getAttribute("data-kind") === "undo") { ev.classList.add("is-undone"); meta.innerHTML = undoneChip(); show("Put back: " + name, true); }
    else { meta.innerHTML = ""; show("Used up: " + name, true); }
  });
  tu.addEventListener("click", function () { show("Undone", false); });
  if (q.get("state") === "gone") { var f = list.querySelector("[data-act]"); if (f) f.click(); }
})();
