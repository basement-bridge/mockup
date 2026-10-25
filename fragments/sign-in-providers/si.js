/* MOCKUP ONLY: sample data, and the function that draws one frame. Settings come from the address hash, e.g. screen.html#o=b&s=busy&p=facebook&t=night
     o   option: a | b | c | d  (built-platform | built-kitchie draw the screens as they are on uat, read from code)
     s   state: default | busy | back | error | expired | member | last | down (option D: one vendor failing)
     p   the provider that was pressed (busy) or last used (last): google | facebook | microsoft | x | tiktok
     r   option D: the providers this browser remembers, most recent first, e.g. r=facebook,x (none = first visit)
     on  option D and others: the providers whose keys are configured, e.g. on=google (only direct Google = today's single button)
     fail option D: a provider that is failing or unavailable, e.g. fail=facebook
     live=1  option D: read and write the real browser store (localStorage key kitchie.signin.providers) so a press is remembered
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
  /* Official marks, inline SVG (no request). Facebook and X and TikTok marks are drawn from the public brand shapes; confirm each against the vendor's current asset before launch (index.html section 5, brand sources). */
  var TT = "M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z";
  var MARK = {
    google: '<svg class="lg lg-google" viewBox="0 0 48 48" aria-hidden="true" focusable="false"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>',
    facebook: '<svg class="lg lg-facebook" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="#fff" d="M16.671 15.469l.547-3.469h-3.328V9.75c0-.949.465-1.875 1.953-1.875h1.516V4.922s-1.375-.234-2.688-.234c-2.75 0-4.547 1.656-4.547 4.664V12H7.078v3.469h3.046V24h3.766v-8.531z"/></svg>',
    microsoft: '<svg class="lg lg-microsoft" viewBox="0 0 23 23" aria-hidden="true" focusable="false"><path fill="#f35325" d="M1 1h10v10H1z"/><path fill="#81bc06" d="M12 1h10v10H12z"/><path fill="#05a6f0" d="M1 12h10v10H1z"/><path fill="#ffba08" d="M12 12h10v10H12z"/></svg>',
    x: '<svg class="lg lg-x" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>',
    tiktok: '<svg class="lg lg-tiktok" viewBox="-1 -1 26 26" aria-hidden="true" focusable="false"><path fill="#25F4EE" transform="translate(-.8 -.8)" d="' + TT + '"/><path fill="#FE2C55" transform="translate(.8 .8)" d="' + TT + '"/><path fill="currentColor" d="' + TT + '"/></svg>'
  };
  var NAME = { google: "Google", facebook: "Facebook", microsoft: "Microsoft", x: "X", tiktok: "TikTok" };
  /* The fixed order (SP-2, Apple dropped: five providers). Which vendor serves each is the build's concern: Google and Microsoft are WorkOS; Facebook, X and TikTok are Clerk (platform authn-vendors.ts). */
  var ORDER = [["google", "workos"], ["facebook", "clerk"], ["microsoft", "workos"], ["x", "clerk"], ["tiktok", "clerk"]];
  var ARROW = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';
  var INFO = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8v.5"/></svg>';
  var TICK = '<span class="lu" title="Last used"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.500l4.500 4.500L19 7.500"/></svg><span class="vh">Last used</span></span>';
  var SCENE = '<svg class="scene" viewBox="0 0 360 150" role="img" aria-label="A friendly kitchen: a pot on the stove, a plant and jars on a shelf"><g class="sh"><rect x="8" y="104" width="124" height="7" rx="3"/><rect x="236" y="112" width="116" height="7" rx="3"/><rect x="0" y="144" width="360" height="3" rx="1.5"/></g><g class="plant"><path class="lf" d="M38 78c-8-8-9-18-5-24 8 3 11 14 5 24zM44 76c0-10 5-18 12-22 3 8-1 17-12 22z"/><rect class="pt" x="32" y="80" width="22" height="22" rx="4"/></g><g><rect class="jar j1" x="70" y="84" width="16" height="20" rx="4"/><rect class="jar j2" x="90" y="80" width="16" height="24" rx="4"/><rect class="jar j3" x="110" y="70" width="18" height="34" rx="5"/></g><g class="steam"><path d="M156 52c-4-6 4-10 0-16"/><path d="M180 48c-4-6 4-10 0-16"/><path d="M204 52c-4-6 4-10 0-16"/></g><g class="pot"><g class="lid"><path d="M146 80c8-12 60-12 68 0z"/><circle cx="180" cy="64" r="3.5"/></g><path class="body" d="M146 82h68v38c0 14-10 24-34 24s-34-10-34-24z"/><path class="hd" d="M146 94h-8a5 5 0 0 0 0 10h8M214 94h8a5 5 0 0 1 0 10h-8"/></g><g class="hearts"><path class="h1" d="M236 62c-5-5-11 1-6 6l6 5 6-5c5-5-1-11-6-6z"/><path class="h2" d="M252 44c-4-4-9 1-5 5l5 4 5-4c4-4-1-9-5-5z"/></g><g class="pan"><rect x="264" y="92" width="52" height="20" rx="4"/><rect x="258" y="88" width="64" height="5" rx="2.5"/></g><g class="cups"><rect x="262" y="74" width="12" height="14" rx="3"/><rect x="280" y="78" width="14" height="10" rx="3"/></g></svg>';
  var ENV = '<svg class="scene env" viewBox="0 0 240 150" role="img" aria-label="An invite letter arriving in an envelope"><g class="sparks"><path class="s1" d="M40 58l4-9 4 9 9 4-9 4-4 9-4-9-9-4z"/><path class="s2" d="M196 40l3-7 3 7 7 3-7 3-3 7-3-7-7-3z"/><circle class="s3" cx="206" cy="92" r="4"/><circle class="s4" cx="30" cy="104" r="3"/><path class="s5" d="M60 24l5 12M120 12v12M176 22l-6 12M214 64l-12 4"/></g><g class="letter"><rect x="70" y="8" width="100" height="96" rx="8"/><g class="lp" transform="translate(0,-66)"><path d="M98 78h44v12c0 8-6 13-22 13s-22-5-22-13z"/><path d="M92 82h-5a3 3 0 0 0 0 6h5M148 82h5a3 3 0 0 1 0 6h-5"/><path d="M96 74c8-8 40-8 48 0z"/></g></g><path class="back" d="M52 70l68-30 68 30v62a8 8 0 0 1-8 8H60a8 8 0 0 1-8-8z"/><path class="flap" d="M52 74l68 44 68-44v58a8 8 0 0 1-8 8H60a8 8 0 0 1-8-8z"/><path class="fold" d="M52 132l50-36M188 132l-50-36"/></svg>';

  function list() {
    var on = q.on ? q.on.split(",") : null;
    return ORDER.filter(function (r) { return !(off === "all" || off === r[1]) && (!on || on.indexOf(r[0]) > -1); }).map(function (r) { return r[0]; });
  }
  var WARN = '<span class="lu dn" title="Not available right now"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 7v6M12 17v.5"/></svg><span class="vh">Not available right now</span></span>';
  function btn(id, primary, busyId) {
    var busy = busyId === id, down = s === "down" && q.fail === id;
    return '<a class="btn prov-' + id + (down ? " is-down" : "") + '" href="#" data-p="' + id + '"' + (busy ? ' aria-busy="true"' : "") + (down ? ' aria-disabled="true" tabindex="-1"' : "") + '>' +
      '<span class="g">' + MARK[id] + '</span><span class="n">' + (busy ? "Opening…" : NAME[id]) + '</span>' + (s === "last" && q.p === id ? TICK : "") + (down ? WARN : "") + '<span class="spin" aria-hidden="true"></span></a>';
  }
  /* Option D. remembered = providers used in this browser, most recent first. Rule: first visit (none) shows all, two across;
     otherwise remembered lead in pairs, an odd slot is filled by the next provider in the fixed order, the rest sit under "Other ways". */
  var KEY = "kitchie.signin.providers";
  function readUsed() { try { var v = JSON.parse(localStorage.getItem(KEY) || "[]"); return Array.isArray(v) ? v.filter(function (id) { return NAME[id]; }) : []; } catch (e) { return []; } }
  function saveUsed(id) { try { var a = readUsed().filter(function (x) { return x !== id; }); a.unshift(id); localStorage.setItem(KEY, JSON.stringify(a)); } catch (e) {} }
  function remembered(ids) {
    var r = q.live === "1" ? readUsed() : (q.r ? q.r.split(",") : []);
    var seen = {}; return r.filter(function (id) { if (ids.indexOf(id) < 0 || seen[id]) return false; seen[id] = 1; return true; });
  }
  function split(ids) {
    var shown = remembered(ids);
    if (shown.length === 0) return { shown: ids.slice(), rest: [], first: true };
    if (shown.length % 2 === 1) { var f = ids.filter(function (id) { return shown.indexOf(id) < 0; })[0]; if (f) shown.push(f); }
    return { shown: shown, rest: ids.filter(function (id) { return shown.indexOf(id) < 0; }), first: false };
  }
  function acts(ids) {
    if (ids.length === 0) return '<p class="note" role="status">Sign-in isn’t available right now. Please try again in a little while.</p>';
    var primary = o === "d" ? "" : ((s === "last" && ids.indexOf(q.p) > -1) ? q.p : ids[0]);
    var busyId = s === "busy" ? (q.p || "facebook") : "";
    var items = function (a) { return a.map(function (id) { return '<li>' + btn(id, id === primary, busyId) + '</li>'; }).join(""); };
    var lead = ids.length > 1 ? '<p class="lead" id="si-l">Continue with</p>' : "";
    var label = ids.length > 1 ? ' aria-labelledby="si-l"' : ' aria-label="Sign in"';
    var body;
    if (ids.length === 1) {
      body = '<ul class="pv"' + label + '><li><a class="btn prov-' + ids[0] + '" href="#" data-p="' + ids[0] + '"><span class="g">' + MARK[ids[0]] + '</span><span class="n">Continue with ' + NAME[ids[0]] + '</span></a></li></ul>';
    } else if (o === "d") {
      var sp = split(ids), dn = s === "down" ? q.fail : "", openD = q.open === "1" || sp.rest.indexOf(dn) > -1;
      body = '<p class="lead" id="si-l">Continue with</p><ul class="pv pv-grid" aria-labelledby="si-l"' + (busyId ? " data-busy" : "") + '>' + items(sp.shown) + '</ul>' +
        (sp.rest.length ? '<details class="qa"' + (openD ? " open" : "") + '><summary>Other ways' + ARROW + '</summary><ul class="pv pv-grid" aria-label="Other ways to sign in"' + (busyId ? " data-busy" : "") + '>' + items(sp.rest) + '</ul></details>' : "");
      lead = "";
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
      : s === "down" ? '<p class="note" role="status">That one isn’t answering right now. The others still work.</p>'
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

  var root = document.getElementById("si-root");
  function draw() {
    var inner = o === "built-platform" ? builtPlatform() : o === "built-kitchie" ? builtKitchie() : s === "member" ? member() : s === "back" ? back() : signin();
    if (q.live === "1") inner += '<p class="dev">Mockup only: this frame uses this browser’s real store. <a href="#" data-forget>Forget this browser</a></p>';
    root.className = "skin si" + (s === "member" ? " nm" : "") + (o === "built-platform" ? " pp" : "");
    root.setAttribute("data-opt", o);
    root.innerHTML = inner;
  }
  draw();
  document.title = "Sign in: option " + o.toUpperCase() + ", " + s;

  /* In a frame a press shows the redirecting state for two seconds, then returns. In the app the link simply navigates. In option D with live=1 a press also remembers the provider (the app does this before it navigates). */
  document.addEventListener("click", function (e) {
    var fg = e.target.closest && e.target.closest("a[data-forget]");
    if (fg) { e.preventDefault(); try { localStorage.removeItem(KEY); } catch (x) {} draw(); return; }
    var a = e.target.closest && e.target.closest("a[data-p]"); if (!a) return;
    e.preventDefault();
    if (a.getAttribute("aria-disabled") === "true") return;
    var list = a.closest(".pv"); if (!list || s !== "default" && s !== "last") return;
    var all = document.querySelectorAll(".pv"); var name = a.querySelector(".n"); var was = name.textContent;
    var id = a.getAttribute("data-p");
    all.forEach(function (u) { u.setAttribute("data-busy", ""); }); a.setAttribute("aria-busy", "true"); name.textContent = "Opening…";
    setTimeout(function () {
      if (q.live === "1") { saveUsed(id); draw(); return; }
      all.forEach(function (u) { u.removeAttribute("data-busy"); }); a.removeAttribute("aria-busy"); name.textContent = was;
    }, 2000);
  });
})();
