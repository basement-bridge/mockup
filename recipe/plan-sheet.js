/* Plan it: a day picker sheet, shared by the list (swipe right) and the recipe page (Plan button).
   Built only when opened (DESIGN.md section 6): no markup for it exists until the person asks.
   Reads Kitchie's plan (this week) and writes one plan entry; Recipe is never told about the plan. */
(function () {
  var X = window.RCP, ic = X.ic, esc = X.esc;
  window.planSheet = function (r, opts) {
    opts = opts || {};
    var wk = 0, day = null, people = r.batch ? 1 : 2, hold = true;
    var vname = opts.version || (r.vers.filter(function (v) { return v.def; })[0] || r.vers[0]).name;
    var draw = function (s) {
      var days = X.WEEK.map(function (d, i) {
        var past = wk === 0 && i < X.TODAY;
        var cls = d[2] && wk === 0 ? "full" : d[3] && wk === 0 ? "off" : "";
        var sub = wk === 0 ? (d[2] ? esc(d[2].split(" ")[0]) : d[3] ? "Off" : "Free") : "Free";
        return '<button type="button" data-day="' + i + '" class="' + cls + '" aria-pressed="' + (day === i) + '"' + (past ? " disabled" : "") + ' aria-label="' + d[0] + (sub ? ", " + sub : "") + '">' + d[0] + "<small>" + (wk === 0 ? d[1] : d[1] + 7 * wk) + "</small><small>" + sub + "</small></button>";
      }).join("");
      var picked = day != null ? X.WEEK[day][0] : null;
      var clash = day != null && wk === 0 && X.WEEK[day][2];
      var off = day != null && wk === 0 && X.WEEK[day][3];
      s.querySelector(".pb").innerHTML =
        '<h3>Plan ' + esc(r.name) + "</h3>" +
        '<p style="font-size:13px">' + esc(vname) + " version" + (r.vers.length > 1 ? ' · <button type="button" class="back" style="min-height:36px;font-size:13px" data-vpick>change</button>' : "") + "</p>" +
        '<div style="display:flex;align-items:center;gap:6px;margin-top:10px"><button type="button" class="ib bare" data-wk="-1" aria-label="Previous week"' + (wk === 0 ? " disabled" : "") + ">" + ic("back", "s") + '</button><b style="flex:1;text-align:center">' + (wk === 0 ? "This week" : wk === 1 ? "Next week" : "In " + wk + " weeks") + '</b><button type="button" class="ib bare" data-wk="1" aria-label="Next week"' + (wk === 4 ? " disabled" : "") + ">" + ic("chev", "s") + "</button></div>" +
        '<div class="days" role="group" aria-label="Day">' + days + "</div>" +
        (clash ? '<p style="font-size:13px;margin-bottom:6px">' + esc(X.WEEK[day][2]) + " is already on " + picked + ". This adds a second meal; it does not replace it.</p>" : "") +
        (off ? '<p style="font-size:13px;margin-bottom:6px">' + picked + " is a usual day off. Planning it cooks this week only.</p>" : "") +
        '<div class="lblrow" style="margin-top:0"><span class="lbl">' + (r.batch ? "Batches" : "People") + '</span><span class="serves"><button type="button" data-pp="-1" aria-label="Fewer">−</button><span>' + (r.batch ? people + " × " + r.serves + " portions" : people + " people") + '</span><button type="button" data-pp="1" aria-label="More">+</button></span></div>' +
        '<div class="lblrow"><span><b style="font-size:14px">Hold what is in</b><small style="display:block;color:var(--muted);font-size:12px">Keeps it for this meal; nothing else can claim it.</small></span><button type="button" class="mini" data-hold aria-pressed="' + hold + '">' + ic("hold", "xs") + (hold ? "Held" : "Hold") + "</button></div>" +
        '<div style="display:flex;gap:8px;margin-top:14px"><button type="button" class="btn ghost" data-close>Cancel</button><button type="button" class="btn" data-ok' + (day == null ? " disabled" : "") + ">" + (picked ? "Plan for " + picked : "Pick a day") + "</button></div>";
    };
    X.sheet('<div class="pb"></div>', function (s, close) {
      draw(s);
      s.addEventListener("click", function (e) {
        var t = e.target.closest("button"); if (!t) return;
        if (t.dataset.day != null) { day = +t.dataset.day; draw(s); }
        else if (t.dataset.wk) { wk = Math.max(0, Math.min(4, wk + +t.dataset.wk)); day = null; draw(s); }
        else if (t.dataset.pp) { people = Math.max(1, Math.min(12, people + +t.dataset.pp)); draw(s); }
        else if (t.hasAttribute("data-hold")) { hold = !hold; draw(s); }
        else if (t.hasAttribute("data-vpick")) { X.toast("Pick the version on the recipe page first"); }
        else if (t.hasAttribute("data-ok")) {
          var d = X.WEEK[day][0]; close();
          X.toast("Planned for " + d + (wk ? " (" + (wk === 1 ? "next week" : "in " + wk + " weeks") + ")" : "") + (hold ? ", what is in is held" : ""), function () { X.toast("Removed from the plan"); });
          if (opts.onDone) opts.onDone(d);
        }
      });
    });
  };
})();
