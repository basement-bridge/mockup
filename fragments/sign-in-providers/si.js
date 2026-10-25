/* MOCKUP ONLY: sample data, and the function that draws one frame. Settings come from the address hash, e.g. screen.html#o=b&s=busy&p=facebook&t=night
     o   option: a | b | c  (built-platform | built-kitchie draw the screens as they are on uat, read from code)
     s   state: default | busy | back | error | expired | member | last
     p   the provider that was pressed (busy) or last used (last): google | apple | facebook | microsoft | x | tiktok
     off which vendor is switched off (its key is not set): clerk | workos | all
     x   the "two buttons, two members" line: n1 none | n2 a line under the buttons | n3 a line on the not-a-member screen only
     t   day | night (fixed in a frame so the options page can show both)
   The markup mirrors what Kitchie's sign-in page (server/src/skin.ts signInPageHtml) would write: .skin, .hero, .hello, .acts, a.btn, plus the new .pv list.
   Nothing here is lifted into the app. Links go nowhere; nothing is sent or stored. */
(function () {
  var q = {}; (location.hash || "").slice(1).split("&").forEach(function (kv) { var a = kv.split("="); if (a[0]) q[a[0]] = decodeURIComponent(a[1] || ""); });
  var o = q.o || "b", s = q.s || "default", x = q.x || "n3", off = q.off || "";
  if (q.t === "day" || q.t === "night") document.documentElement.setAttribute("data-theme", q.t === "day" ? "kitchie-day" : "kitchie");
  var G = function (b) { return '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + b + "</svg>"; };
  /* Stand-in marks, one colour (the text colour). Not the vendors' real marks: those come with each vendor's brand rules before anything is built. */
  var MARK = {
    google: G('<path d="M18.5 8.5A7 7 0 1 0 19 12h-6.5"/>'),
    apple: G('<path class="f" d="M16.6 12.7c0-2.100 1.700-3.100 1.800-3.200-1-1.400-2.500-1.600-3-1.600-1.300-.1-2.500.8-3.100.8s-1.600-.7-2.700-.7C7.200 8 5.600 9.500 5.600 12.300c0 1.700.6 3.400 1.400 4.500.7 1 1.400 1.800 2.300 1.800s1.300-.6 2.400-.6 1.400.6 2.400.6 1.600-.9 2.200-1.800c.7-1 1-2 1-2.100 0 0-1.700-.7-1.700-2.400zM14.500 6.200c.5-.6.8-1.500.7-2.400-.8 0-1.700.5-2.200 1.100-.5.600-.9 1.500-.8 2.300.9.100 1.700-.400 2.300-1z"/>'),
    facebook: G('<path class="f" d="M13.600 20.500v-7.200h2.400l.4-2.900h-2.800V8.600c0-.8.300-1.400 1.400-1.400h1.500V4.700c-.3 0-1.100-.1-2.200-.1-2.200 0-3.600 1.300-3.600 3.700v2.100H8.300v2.900h2.400v7.200z"/>'),
    microsoft: G('<rect class="f" x="4" y="4" width="7.200" height="7.200" rx="1"/><rect class="f" x="12.800" y="4" width="7.200" height="7.200" rx="1"/><rect class="f" x="4" y="12.800" width="7.200" height="7.200" rx="1"/><rect class="f" x="12.800" y="12.800" width="7.200" height="7.200" rx="1"/>'),
    x: G('<path d="M5 4.500l14 15M19 4.500l-14 15"/>'),
    tiktok: G('<path d="M14 4v10.500a3.500 3.500 0 1 1-3.500-3.500M14 4c.4 2.400 2 3.800 4.500 4"/>')
  };
  var NAME = { google: "Google", apple: "Apple", facebook: "Facebook", microsoft: "Microsoft", x: "X", tiktok: "TikTok" };
  /* The proposed order, fixed (SP-2). Which vendor serves each is the build's concern: the three left are WorkOS, the three right Clerk (platform authn-vendors.ts). */
  var ORDER = [["google", "workos"], ["apple", "workos"], ["facebook", "clerk"], ["microsoft", "workos"], ["x", "clerk"], ["tiktok", "clerk"]];
  var ARROW = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';
  var INFO = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8v.5"/></svg>';
  var TICK = '<span class="lu" title="Last used"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.500l4.500 4.500L19 7.500"/></svg><span class="vh">Last used</span></span>';
  var SCENE = '<svg class="scene" viewBox="0 0 360 150" role="img" aria-label="A friendly kitchen: a pot on the stove, a plant and jars on a shelf"><g class="sh"><rect x="8" y="104" width="124" height="7" rx="3"/><rect x="236" y="112" width="116" height="7" rx="3"/><rect x="0" y="144" width="360" height="3" rx="1.5"/></g><g class="plant"><path class="lf" d="M38 78c-8-8-9-18-5-24 8 3 11 14 5 24zM44 76c0-10 5-18 12-22 3 8-1 17-12 22z"/><rect class="pt" x="32" y="80" width="22" height="22" rx="4"/></g><g><rect class="jar j1" x="70" y="84" width="16" height="20" rx="4"/><rect class="jar j2" x="90" y="80" width="16" height="24" rx="4"/><rect class="jar j3" x="110" y="70" width="18" height="34" rx="5"/></g><g class="steam"><path d="M156 52c-4-6 4-10 0-16"/><path d="M180 48c-4-6 4-10 0-16"/><path d="M204 52c-4-6 4-10 0-16"/></g><g class="pot"><g class="lid"><path d="M146 80c8-12 60-12 68 0z"/><circle cx="180" cy="64" r="3.5"/></g><path class="body" d="M146 82h68v38c0 14-10 24-34 24s-34-10-34-24z"/><path class="hd" d="M146 94h-8a5 5 0 0 0 0 10h8M214 94h8a5 5 0 0 1 0 10h-8"/></g><g class="hearts"><path class="h1" d="M236 62c-5-5-11 1-6 6l6 5 6-5c5-5-1-11-6-6z"/><path class="h2" d="M252 44c-4-4-9 1-5 5l5 4 5-4c4-4-1-9-5-5z"/></g><g class="pan"><rect x="264" y="92" width="52" height="20" rx="4"/><rect x="258" y="88" width="64" height="5" rx="2.5"/></g><g class="cups"><rect x="262" y="74" width="12" height="14" rx="3"/><rect x="280" y="78" width="14" height="10" rx="3"/></g></svg>';
  var ENV = '<svg class="scene env" viewBox="0 0 240 150" role="img" aria-label="An invite letter arriving in an envelope"><g class="sparks"><path class="s1" d="M40 58l4-9 4 9 9 4-9 4-4 9-4-9-9-4z"/><path class="s2" d="M196 40l3-7 3 7 7 3-7 3-3 7-3-7-7-3z"/><circle class="s3" cx="206" cy="92" r="4"/><circle class="s4" cx="30" cy="104" r="3"/><path class="s5" d="M60 24l5 12M120 12v12M176 22l-6 12M214 64l-12 4"/></g><g class="letter"><rect x="70" y="8" width="100" height="96" rx="8"/><g class="lp" transform="translate(0,-66)"><path d="M98 78h44v12c0 8-6 13-22 13s-22-5-22-13z"/><path d="M92 82h-5a3 3 0 0 0 0 6h5M148 82h5a3 3 0 0 1 0 6h-5"/><path d="M96 74c8-8 40-8 48 0z"/></g></g><path class="back" d="M52 70l68-30 68 30v62a8 8 0 0 1-8 8H60a8 8 0 0 1-8-8z"/><path class="flap" d="M52 74l68 44 68-44v58a8 8 0 0 1-8 8H60a8 8 0 0 1-8-8z"/><path class="fold" d="M52 132l50-36M188 132l-50-36"/></svg>';

  function list() {
    return ORDER.filter(function (r) { return !(off === "all" || off === r[1]); }).map(function (r) { return r[0]; });
  }
  function btn(id, primary, busyId) {
    var busy = busyId === id;
    return '<a class="btn' + (primary ? " primary" : "") + '" href="#" data-p="' + id + '"' + (busy ? ' aria-busy="true"' : "") + '>' +
      '<span class="g">' + MARK[id] + '</span><span class="n">' + (busy ? "Opening…" : NAME[id]) + '</span>' + (s === "last" && q.p === id ? TICK : "") + '<span class="spin" aria-hidden="true"></span></a>';
  }
  function acts(ids) {
    if (ids.length === 0) return '<p class="note" role="status">Sign-in isn’t available right now. Please try again in a little while.</p>';
    var primary = (s === "last" && ids.indexOf(q.p) > -1) ? q.p : ids[0];
    var busyId = s === "busy" ? (q.p || "facebook") : "";
    var items = function (a) { return a.map(function (id) { return '<li>' + btn(id, id === primary, busyId) + '</li>'; }).join(""); };
    var lead = ids.length > 1 ? '<p class="lead" id="si-l">Continue with</p>' : "";
    var label = ids.length > 1 ? ' aria-labelledby="si-l"' : ' aria-label="Sign in"';
    var body;
    if (ids.length === 1) {
      body = '<ul class="pv"' + label + '><li><a class="btn primary" href="#" data-p="' + ids[0] + '"><span class="g">' + MARK[ids[0]] + '</span><span class="n">Continue with ' + NAME[ids[0]] + '</span></a></li></ul>';
    } else if (o === "c") {
      var rest = ids.filter(function (id) { return id !== primary; });
      body = '<ul class="pv" aria-label="Sign in"><li>' + btn(primary, true, busyId) + '</li></ul><details class="qa"' + (q.open === "1" ? " open" : "") + '><summary>Other ways' + ARROW + '</summary><ul class="pv" aria-label="Other ways to sign in">' + items(rest) + '</ul></details>';
      lead = "";
    } else {
      body = lead + '<ul class="pv"' + label + (busyId ? " data-busy" : "") + '>' + items(ids) + '</ul>';
      lead = "";
    }
    if (busyId && o === "c") body = body.replace('<ul class="pv"', '<ul class="pv" data-busy');
    var cq = x === "n2" && ids.length > 1 ? '<p class="cq">' + INFO + 'Each button is its own account.</p>' : "";
    return body + cq;
  }

  function signin() {
    var notice = s === "error" ? '<p class="note" role="status">That sign-in didn’t work. Please try again.</p>'
      : s === "expired" ? '<p class="note" role="status">Your sign-in ended. Sign in again to carry on.</p>' : "";
    return '<div class="hero">' + SCENE + '</div><div class="hello"><h1>Welcome to Kitchie</h1><p>Share what’s in the fridge and pantry, and cook from it together.</p></div>' +
      notice + '<div class="acts">' + acts(list()) + '</div><p class="small">Kitchie is invite only. We never see your password.</p>';
  }
  function back() {
    var from = NAME[q.p || "facebook"];
    return '<div class="hero">' + SCENE + '</div><div class="hello"><h1>Checking it’s you</h1><p>Back from ' + from + '.</p></div><div class="acts" role="status" aria-live="polite"><span class="wire" aria-hidden="true"><i></i><i></i><i></i></span></div><p class="small">Kitchie is invite only. We never see your password.</p>';
  }
  function member() {
    var line = x === "n3" ? '<p class="note" role="status">Each button is its own account.</p>' : "";
    return '<div class="hero">' + ENV + '</div><div class="hello"><span class="pill"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>By invite only</span><h1>Good kitchens start with an invite.</h1><p>This account isn’t in a household yet.</p></div>' +
      line + '<div class="acts"><a class="btn primary" href="#">I have an invite code</a><a class="btn ghost" href="#">' + (q.was === "built" ? "Use a different Google account" : "Try another sign-in") + '</a></div>';
  }
  function builtPlatform() {
    var rows = [["Sign in with Google"], ["Sign in with Google (WorkOS)"], ["Sign in with Microsoft"], ["Sign in with Apple"], ["Sign in with Facebook"], ["Sign in with X"], ["Sign in with TikTok"]];
    return '<main class="pp-built"><h1>Platform</h1><p>Sign in to see what your household has.</p>' + rows.map(function (r) { return '<p><a class="btn" href="#">' + r[0] + '</a></p>'; }).join("") + '</main>';
  }
  function builtKitchie() {
    return '<div class="hero">' + SCENE + '</div><div class="hello"><h1>Welcome to Kitchie</h1><p>Share what’s in the fridge and pantry, and cook from it together.</p></div><div class="acts"><a class="btn primary" href="#">Continue with Google<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a></div><p class="small">Kitchie is invite only. We never see your password.</p>';
  }

  var inner = o === "built-platform" ? builtPlatform() : o === "built-kitchie" ? builtKitchie() : s === "member" ? member() : s === "back" ? back() : signin();
  var root = document.getElementById("si-root");
  root.className = "skin si" + (s === "member" ? " nm" : "") + (o === "built-platform" ? " pp" : "");
  root.setAttribute("data-opt", o);
  root.innerHTML = inner;
  document.title = "Sign in: option " + o.toUpperCase() + ", " + s;

  /* In a frame a press shows the redirecting state for two seconds, then returns. In the app the link simply navigates; this is only what the frame shows. */
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("a[data-p]"); if (!a) return;
    e.preventDefault();
    var list = a.closest(".pv"); if (!list || s !== "default" && s !== "last") return;
    var all = document.querySelectorAll(".pv"); var name = a.querySelector(".n"); var was = name.textContent;
    all.forEach(function (u) { u.setAttribute("data-busy", ""); }); a.setAttribute("aria-busy", "true"); name.textContent = "Opening…";
    setTimeout(function () { all.forEach(function (u) { u.removeAttribute("data-busy"); }); a.removeAttribute("aria-busy"); name.textContent = was; }, 2000);
  });
})();
