/* Standalone day rows (sample data, nothing saved). Option F uses the same markup, built from the host's calendar (pick-f.js). */
(function () {
  var DN = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], Q = new URLSearchParams(location.search);
  var t = +Q.get("today"); if (!(t >= 0 && t <= 6) || Q.get("today") === null) t = 2;
  var M = { 0: ["Shakshuka with warm flatbread, feta and herbs from the garden (Everyone)"], 2: [], 4: ["Salmon patties (yours)"], 6: ["Chilli noodles (Jo)", "Pizza night (Everyone)"], 3: [] };
  var el = document.getElementById("demo"), sel = null, h = '<div class="rows" role="group" aria-label="Day">';
  for (var i = 0; i < 7; i++) {
    var d = (t + i) % 7, meals = M[d] || [], off = d === 3 && !meals.length;
    h += '<button type="button" class="row-d' + (i === 0 ? " today" : "") + (!meals.length && !off ? " open" : "") + (off ? " off" : "") + '" data-i="' + i + '" aria-pressed="false" aria-label="' + DN[d] + ", " + (meals.length ? meals.join(" and ") : off ? "usual day off" : "open") + '"><span class="dl">' + DN[d] + '</span><span class="dt">' + (meals.length ? meals.map(function (m) { return "<span>" + m + "</span>"; }).join("") : off ? "<em>Usual day off</em>" : "<em>Open</em>") + "</span></button>";
  }
  el.innerHTML = h + "</div>";
  var rows = [].slice.call(el.querySelectorAll(".row-d"));
  function pick(i) { sel = i; rows.forEach(function (r, k) { r.setAttribute("aria-pressed", k === i); }); rows[i].focus(); }
  el.addEventListener("click", function (e) { var b = e.target.closest(".row-d"); if (b) pick(+b.dataset.i); });
  el.addEventListener("keydown", function (e) {
    var i = rows.indexOf(document.activeElement); if (i < 0) return;
    if (e.key === "ArrowDown") { e.preventDefault(); rows[Math.min(6, i + 1)].focus(); } else if (e.key === "ArrowUp") { e.preventDefault(); rows[Math.max(0, i - 1)].focus(); }
  });
})();
