/* Plan UI review: status language, shared markup for desktop.html and phone.html (owner 12 Oct 2026: Missing / Use-by is "not landed", so four options).
   Markup and class names only; no viewport rules (they live in d.css and phone.css). Modes:
   labels   (a) labelled text chips: "Missing 2", "Use by Tue 13", coloured by urgency
   badge    (b) icon plus count badge, words only in the tooltip and the screen-reader label
   edge     (c) one edge strip and one dot per card, specifics only in the detail
   progress (d) "5 of 7 ingredients ready" with a thin bar, plus one use-by line
   line         one sentence (the earlier alternate, desktop)
   Urgency (use-by): today or overdue = hot (danger), within two days = warm (accent), later = calm (muted). */
(function () {
  var P = window.PUR, ic = P.icons;
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
  function num(t) { var m = /(\d+)\s*$/.exec(t || ''); return m ? +m[1] : 99; }
  function urg(m, today) {
    if (!m.useby.length) return null; var d = num(m.useby[0][1]) - today;
    return d <= 0 ? 'hot' : d <= 2 ? 'warm' : 'calm';
  }
  function edge(m, today) { return m.miss.length ? 'bad' : (urg(m, today) === 'hot' || urg(m, today) === 'warm') ? 'warm' : 'ok'; }
  function total(m) { return m.have.length + m.miss.length; }
  function label(m, today) {
    var a = [], u = urg(m, today);
    a.push(m.miss.length ? m.miss.length + ' missing: ' + m.miss.map(function (x) { return x[0]; }).join(', ') : 'all on hand');
    if (m.useby.length) a.push(m.useby[0][0] + ' use by ' + m.useby[0][1]);
    if (m.list) a.push(m.list + ' on the shopping list'); if (m.held) a.push('held');
    return a.join('; ');
  }
  function names(m) { return m.miss.length ? '<div class="names">Missing: ' + esc(m.miss.map(function (x) { return x[0]; }).join(', ')) + '</div>' : ''; }
  function html(m, mode, today) {
    var mc = m.miss.length, u = urg(m, today), ubt = m.useby.length ? m.useby[0][1] : '';
    function c(cls, i, t, tip) { return '<span class="tg ' + cls + '" title="' + esc(tip) + '" aria-label="' + esc(tip) + '">' + i + (t === '' ? '' : '<b>' + t + '</b>') + '</span>'; }
    if (mode === 'labels') {
      var o = mc ? c('bad', ic.warn, 'Missing ' + mc, mc + ' missing') : c('ok', ic.check, 'All on hand', 'All on hand');
      if (m.useby.length) o += c('ub ' + u, ic.clock, 'Use by ' + esc(ubt), esc(m.useby[0][0]) + ' use by ' + esc(ubt));
      var q = []; if (m.list) q.push('On list ' + m.list); if (m.held) q.push('Held');
      return '<div class="chs">' + o + '</div>' + names(m) + (q.length ? '<div class="quiet">' + q.join(' · ') + '</div>' : '');
    }
    if (mode === 'badge') {
      var b = mc ? c('bad', ic.warn, mc, mc + ' missing: ' + m.miss.map(function (x) { return x[0]; }).join(', ')) : c('ok', ic.check, '', 'All on hand');
      if (m.useby.length) b += c('ub ' + u, ic.clock, m.useby.length, m.useby[0][0] + ' use by ' + ubt);
      if (m.list) b += c('list', ic.cart, m.list, m.list + ' on the shopping list'); if (m.held) b += c('held', ic.mark, '', 'Held');
      return '<div class="chs badges">' + b + '</div>';
    }
    if (mode === 'edge') return '<span class="sdot ' + edge(m, today) + '" role="img" aria-label="' + esc(label(m, today)) + '" title="' + esc(label(m, today)) + '"></span>';
    if (mode === 'progress') {
      var t = total(m), r = m.have.length;
      return '<div class="prog"><div class="pr"><span class="bar" aria-hidden="true"><i class="' + (mc ? 'bad' : 'ok') + '" style="width:' + Math.round(100 * r / t) + '%"></i></span><b>' + (mc ? r + ' of ' + t + ' ingredients ready' : (t === 1 ? 'Ingredient ready' : 'All ' + t + ' ingredients ready')) + '</b></div>' +
        (m.useby.length ? '<div class="pu ' + u + '">' + ic.clock + ' Use ' + esc(m.useby[0][0]) + ' by ' + esc(ubt) + '</div>' : '') + '</div>';
    }
    /* line */
    var parts = [];
    if (mc) parts.push('<span class="st bad">' + ic.warn + ' Missing ' + esc(m.miss.map(function (x) { return x[0]; }).join(', ')) + '</span>'); else parts.push('<span class="st ok">' + ic.check + ' All on hand</span>');
    var s2 = []; if (m.list) s2.push(m.list + ' on list'); if (m.held) s2.push('held'); if (m.useby.length) s2.push('use ' + esc(m.useby[0][0]) + ' by ' + esc(ubt));
    if (s2.length) parts.push('<span class="st sub">' + s2.join(' · ') + '</span>');
    return '<div class="stl">' + parts.join('') + '</div>';
  }
  P.status = { html: html, edge: edge, urg: urg, total: total, label: label, MODES: [['labels', 'a Labelled chips (recommended)'], ['badge', 'b Icon + count badge'], ['edge', 'c Edge strip + dot'], ['progress', 'd Progress, "5 of 7 ready"'], ['line', 'One status line (earlier alternate)']] };
})();
