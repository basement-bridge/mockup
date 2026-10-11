/* MOCKUP ONLY: sample data, and the function that writes the page's markup. The markup it writes is the markup the build writes
   (platform apps/portal/src/consent.ts), element for element and class for class. Nothing here is lifted into the app. */
(function () {
  var G = function (s) { return '<svg width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">'; };
  var ICON = {
    kitchie: '<rect x="6" y="2.5" width="12" height="19" rx="2.5"></rect><path d="M6 10h12M9 6v1.5M9 13v3"></path>',
    recipe: '<path d="M5 11h14v6a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3z"></path><path d="M3 11h18M9 7.5c0-1.6 1-1.6 1-3.2M14 7.5c0-1.6 1-1.6 1-3.2"></path>',
    lock: '<rect x="5" y="11" width="14" height="9" rx="2"></rect><path d="M8 11V8a4 4 0 0 1 8 0v3"></path>',
    pen: '<path d="M4 20l1-4L16.5 4.5a2.1 2.1 0 0 1 3 3L8 19z"></path><path d="M14 7l3 3"></path>',
    home: '<path d="M4 11l8-7 8 7"></path><path d="M6 10v9h12v-9"></path>',
    link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"></path><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"></path>',
    shield: '<path d="M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6z"></path><path d="M9 12l2 2 4-4"></path>'
  };
  var icon = function (k, s) { return G(s) + ICON[k] + "</svg>"; };
  var esc = function (t) { return String(t).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  var PRODUCTS = { kitchie: "Kitchie", recipe: "Recipe" };
  window.consentMarkup = function (d) {
    var P = PRODUCTS[d.product];
    var env = d.env ? '<span class="envslug" style="flex:none;overflow:visible;font-weight:400;font-size:.8em;color:var(--muted)">(' + esc(d.env) + ")</span>" : "";
    return '<a class="brandbar" href="#">' + icon("kitchie", 24) + "<span>Kitchie</span>" + env + "</a>" +
      '<main class="skin cn" data-product="' + esc(d.product) + '">' +
      '<div class="hero" aria-hidden="true"><div class="pair"><span class="ava who">' + esc(d.assistant.slice(0, 1)) + '</span><span class="wire"><i></i><i></i><i></i></span><span class="ava">' + icon(d.product, 30) + "</span></div></div>" +
      '<div class="hello"><span class="pill">' + icon("lock", 14) + "Connect an assistant</span><h1>Connect " + esc(d.assistant) + " to " + P + "?</h1><p>" + esc(d.assistant) + " is asking to connect to " + P + " as " + esc(d.member) + ".</p></div>" +
      '<dl class="facts"><div><dt>Assistant</dt><dd>' + esc(d.assistant) + "<small>" + esc(d.host) + "</small></dd></div><div><dt>Connecting to</dt><dd>" + P + "</dd></div><div><dt>As</dt><dd>" + esc(d.member) + "</dd></div><div><dt>Household</dt><dd>" + esc(d.household) + "</dd></div></dl>" +
      '<section class="can" aria-labelledby="cn-h"><h2 id="cn-h">If you agree</h2><ul class="cl">' +
      '<li><span class="ric">' + icon("pen", 20) + "</span><span>It can read and change what you can in " + P + ".</span></li>" +
      '<li><span class="ric t2">' + icon("home", 20) + "</span><span>It works for your household, " + esc(d.household) + ".</span></li>" +
      '<li><span class="ric">' + icon("link", 20) + "</span><span>It stays connected until you disconnect it.</span></li>" +
      '<li><span class="ric t2">' + icon("shield", 20) + "</span><span>It will not see your password or your sign-in.</span></li></ul></section>" +
      '<p class="how">You can disconnect it at any time from <a href="#">your connected assistants</a>.</p>' +
      '<div class="acts"><form method="post" action="#" onsubmit="return false"><button class="btn primary" name="decision" value="allow">Agree and connect</button></form><form method="post" action="#" onsubmit="return false"><button class="btn ghost" name="decision" value="deny">Cancel</button></form></div>' +
      '<p class="small">Only agree if you started this from the assistant yourself.</p></main>';
  };
})();
