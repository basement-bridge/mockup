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
   27 Oct 2026 (options E and F, both built on D; proposed, owner silent on anything not quoted in the notes):
     o=e option E: D on a phone (unchanged), and on a desktop (64rem and up) heading first then the pot, a centred narrower block, at least four providers first, extras join the grid.
     o=f option F: E's page with Email as a plain button, an "or" line, then a compact row of logo-only provider buttons (four to a row).
     bw  desktop button block width: s 20rem | m 22rem (default) | l 24rem
     ft  E on desktop: ft=wide makes the last-used button span both columns (default: same size, accent ring)
     (co=1, a "Fewer ways" control, was removed 27 Oct 2026: owner rule for D, E and F, once "Other ways" is pressed the label goes and the extras join the grid; nothing collapses.)
     open=1 draws the open state; a press on Other ways opens it in a frame too
   D, E and F use the order Email, Facebook, Google, Microsoft, X, TikTok (SP-D13, SP-D22). F is the owner's pick (SP-D20).
   SP-D10: in option D the first remembered provider (the most recent) carries the small "Last used" tick (span.lu, visually hidden words), only when something is remembered and only on that one button. Logging out never clears the memory or changes the screen.
   The markup mirrors what Kitchie's sign-in page (server/src/skin.ts signInPageHtml) would write: .skin, .hero, .hello, .acts, a.btn, plus the new .pv list.
   Nothing here is lifted into the app. Links go nowhere; nothing is sent or stored. */
(function () {
  var q = {}; (location.hash || "").slice(1).split("&").forEach(function (kv) { var a = kv.split("="); if (a[0]) q[a[0]] = decodeURIComponent(a[1] || ""); });
  var o = q.o || "b", s = q.s || "default", x = q.x || "n3", off = q.off || "";
  var v = (o === "e" || o === "f") ? o : ""; if (v) o = "d"; /* E and F reuse every D rule and add their own under [data-v] */
  var wideMQ = window.matchMedia ? window.matchMedia("(min-width:64rem)") : { matches: false };
  var openX = q.open === "1", restN = 0;
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
  MARK.email = '<svg class="lg lg-email" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" d="M3 6.5h18v11H3zM3.5 7l8.5 6.5L20.5 7"/></svg>';
  var NAME = { google: "Google", facebook: "Facebook", microsoft: "Microsoft", x: "X", tiktok: "TikTok", email: "Email" };
  /* The fixed order (SP-2, Apple dropped: five providers). Which vendor serves each is the build's concern: Google and Microsoft are WorkOS; Facebook, X and TikTok are Clerk (platform authn-vendors.ts). */
  var ORDER = [["google", "workos"], ["facebook", "clerk"], ["microsoft", "workos"], ["x", "clerk"], ["tiktok", "clerk"], ["email", "workos"]];
  /* SP-D13 (proposed): E and F lead with Email, then Facebook (owner), then the rest in a fixed order (owner gave none: Google, Microsoft, X, TikTok is a proposal). */
  var ORDER_E = [["email", "workos"], ["facebook", "clerk"], ["google", "workos"], ["microsoft", "workos"], ["x", "clerk"], ["tiktok", "clerk"]];
  var ARROW = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';
  var INFO = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8v.5"/></svg>';
  var TICK = '<span class="lu" title="Last used"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.500l4.500 4.500L19 7.500"/></svg><span class="vh">Last used</span></span>';
  var SCENE = '<svg class="scene" viewBox="0 0 360 150" role="img" aria-label="A friendly kitchen: a pot on the stove, a plant and jars on a shelf"><g class="sh"><rect x="8" y="104" width="124" height="7" rx="3"/><rect x="236" y="112" width="116" height="7" rx="3"/><rect x="0" y="144" width="360" height="3" rx="1.5"/></g><g class="plant"><path class="lf" d="M38 78c-8-8-9-18-5-24 8 3 11 14 5 24zM44 76c0-10 5-18 12-22 3 8-1 17-12 22z"/><rect class="pt" x="32" y="80" width="22" height="22" rx="4"/></g><g><rect class="jar j1" x="70" y="84" width="16" height="20" rx="4"/><rect class="jar j2" x="90" y="80" width="16" height="24" rx="4"/><rect class="jar j3" x="110" y="70" width="18" height="34" rx="5"/></g><g class="steam"><path d="M156 52c-4-6 4-10 0-16"/><path d="M180 48c-4-6 4-10 0-16"/><path d="M204 52c-4-6 4-10 0-16"/></g><g class="pot"><g class="lid"><path d="M146 80c8-12 60-12 68 0z"/><circle cx="180" cy="64" r="3.5"/></g><path class="body" d="M146 82h68v38c0 14-10 24-34 24s-34-10-34-24z"/><path class="hd" d="M146 94h-8a5 5 0 0 0 0 10h8M214 94h8a5 5 0 0 1 0 10h-8"/></g><g class="hearts"><path class="h1" d="M236 62c-5-5-11 1-6 6l6 5 6-5c5-5-1-11-6-6z"/><path class="h2" d="M252 44c-4-4-9 1-5 5l5 4 5-4c4-4-1-9-5-5z"/></g><g class="pan"><rect x="264" y="92" width="52" height="20" rx="4"/><rect x="258" y="88" width="64" height="5" rx="2.5"/></g><g class="cups"><rect x="262" y="74" width="12" height="14" rx="3"/><rect x="280" y="78" width="14" height="10" rx="3"/></g></svg>';
  var ENV = '<svg class="scene env" viewBox="0 0 240 150" role="img" aria-label="An invite letter arriving in an envelope"><g class="sparks"><path class="s1" d="M40 58l4-9 4 9 9 4-9 4-4 9-4-9-9-4z"/><path class="s2" d="M196 40l3-7 3 7 7 3-7 3-3 7-3-7-7-3z"/><circle class="s3" cx="206" cy="92" r="4"/><circle class="s4" cx="30" cy="104" r="3"/><path class="s5" d="M60 24l5 12M120 12v12M176 22l-6 12M214 64l-12 4"/></g><g class="letter"><rect x="70" y="8" width="100" height="96" rx="8"/><g class="lp" transform="translate(0,-66)"><path d="M98 78h44v12c0 8-6 13-22 13s-22-5-22-13z"/><path d="M92 82h-5a3 3 0 0 0 0 6h5M148 82h5a3 3 0 0 1 0 6h-5"/><path d="M96 74c8-8 40-8 48 0z"/></g></g><path class="back" d="M52 70l68-30 68 30v62a8 8 0 0 1-8 8H60a8 8 0 0 1-8-8z"/><path class="flap" d="M52 74l68 44 68-44v58a8 8 0 0 1-8 8H60a8 8 0 0 1-8-8z"/><path class="fold" d="M52 132l50-36M188 132l-50-36"/></svg>';

  function list() {
    var on = q.on ? q.on.split(",") : null;
    return (o === "d" ? ORDER_E : ORDER).filter(function (r) { return !(off === "all" || off === r[1]) && (r[0] !== "email" || o === "d") && (!on || on.indexOf(r[0]) > -1); }).map(function (r) { return r[0]; });
  }
  /* SP-D11: in option D the tick carries visible words (small, under the name); the other options keep the ticked circle. */
  var TICKD = '<span class="lu"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.500l4.500 4.500L19 7.500"/></svg>Last used</span>';
  var WARN = '<span class="lu dn" title="Not available right now"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 7v6M12 17v.5"/></svg><span class="vh">Not available right now</span></span>';
  var lastD = ""; /* option D (SP-D10): the most recent remembered provider, the one that wears the "Last used" tick; empty on a first visit */
  function btn(id, primary, busyId) {
    var busy = busyId === id, down = s === "down" && q.fail === id;
    return '<a class="btn prov-' + id + (down ? " is-down" : "") + (v && lastD === id ? " is-last" : "") + '" href="#" data-p="' + id + '"' + (busy ? ' aria-busy="true"' : "") + (down ? ' aria-disabled="true" tabindex="-1"' : "") + '>' +
      '<span class="g">' + MARK[id] + '</span><span class="n">' + (busy ? "Opening…" : NAME[id]) + '</span>' + ((s === "last" && q.p === id) || lastD === id ? (o === "d" ? TICKD : TICK) : "") + (down ? WARN : "") + '<span class="spin" aria-hidden="true"></span></a>';
  }
  /* Option D. remembered = providers used in this browser, most recent first. Rule: first visit (none) shows all, two across;
     otherwise the remembered ones lead, two across, the rest sit under "Other ways". No filler provider: an odd last button is centred at one column width by the CSS (SP-D9). */
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
    return { shown: shown, rest: ids.filter(function (id) { return shown.indexOf(id) < 0; }), first: false };
  }
  var CHECK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.500l4.500 4.500L19 7.500"/></svg>';
  /* Option E on a desktop: the remembered providers lead (most recent first, the last used the first and marked), then the fixed order fills up to four (five when the last used is drawn wide);
     the rest are li items that join the SAME grid when "Other ways" is pressed; the label goes once open. A short script is needed (hidden items plus one button); without it all buttons show. */
  function wideBody(ids, busyId) {
    var rem = remembered(ids), wideFeat = q.ft === "wide" && rem.length > 0, min = wideFeat ? 5 : 4;
    var shown = rem.slice(); ids.forEach(function (id) { if (shown.length < min && shown.indexOf(id) < 0) shown.push(id); });
    var rest = ids.filter(function (id) { return shown.indexOf(id) < 0; });
    var evenN = wideFeat ? shown.length - 1 : shown.length;
    if (evenN % 2 && rest.length) shown.push(rest.shift());
    lastD = rem.length ? rem[0] : ""; restN = rest.length;
    var dn = s === "down" ? q.fail : "", open = openX || rest.indexOf(dn) > -1;
    var all = open ? shown.concat(rest) : shown;
    var li = all.map(function (id, i) { return '<li' + (wideFeat && i === 0 ? ' class="feat"' : "") + '>' + btn(id, false, busyId) + '</li>'; }).join("");
    if (rest.length && !open) li += '<li class="more"><button type="button" class="ow" aria-expanded="false" data-ow="open">Other ways' + ARROW + '</button></li>';
    return '<p class="lead" id="si-l">Continue with</p><ul class="pv pv-grid" aria-labelledby="si-l"' + (busyId ? " data-busy" : "") + (wideFeat ? ' data-feat' : "") + '>' + li + '</ul>';
  }
  /* Option F: Email is a plain button (hands off to WorkOS AuthKit; no field on our page), then "or", then a row of logo-only provider buttons, four to a row. */
  function iconBtn(id, last, busy) {
    var nm = NAME[id];
    return '<a class="btn ib prov-' + id + (last ? " is-last" : "") + '" href="#" data-p="' + id + '" aria-label="Continue with ' + nm + (last ? ", last used" : "") + '" title="' + nm + (last ? " (last used)" : "") + '"' + (busy ? ' aria-busy="true"' : "") + '><span class="g">' + MARK[id] + '</span>' + (last ? '<span class="lu" aria-hidden="true">' + CHECK + '</span>' : "") + '<span class="spin" aria-hidden="true"></span></a>';
  }
  function iconBody(ids, busyId) {
    var rem = remembered(ids), em = ids.indexOf("email") > -1, icons = ids.filter(function (id) { return id !== "email"; });
    var remI = rem.filter(function (id) { return id !== "email"; });
    var shown = remI.slice(); icons.forEach(function (id) { if (shown.length < 4 && shown.indexOf(id) < 0) shown.push(id); });
    var rest = icons.filter(function (id) { return shown.indexOf(id) < 0; });
    var lastI = rem.length && rem[0] !== "email" ? rem[0] : ""; restN = rest.length;
    var dn = s === "down" ? q.fail : "", open = openX || rest.indexOf(dn) > -1;
    var all = open ? shown.concat(rest) : shown;
    var html = "";
    if (em) {
      var lastE = rem[0] === "email", bz = busyId === "email";
      html += '<ul class="pv pv-grid pv-one" aria-label="Email"' + (busyId ? " data-busy" : "") + '><li><a class="btn prov-email' + (lastE ? " is-last" : "") + '" href="#" data-p="email"' + (bz ? ' aria-busy="true"' : "") + '><span class="g">' + MARK.email + '</span><span class="n">' + (bz ? "Opening…" : "Continue with email") + '</span>' + (lastE ? TICKD : "") + '<span class="spin" aria-hidden="true"></span></a></li></ul>';
      if (icons.length) html += '<p class="or" aria-hidden="true"><span>or</span></p>';
    }
    if (icons.length) {
      var li = all.map(function (id) { return '<li>' + iconBtn(id, id === lastI, busyId === id) + '</li>'; }).join("");
      if (rest.length && !open) li += '<li class="more"><button type="button" class="ow" aria-expanded="false" data-ow="open">Other ways' + ARROW + '</button></li>';
      if (lastI) li = li.replace(/<li class="more">/, '<li class="cap">' + CHECK + 'Last used: <b>' + NAME[lastI] + '</b></li><li class="more">') + (rest.length && li.indexOf('class="more"') > -1 ? "" : '');
      if (lastI && li.indexOf('class="cap"') < 0) li += '<li class="cap">' + CHECK + 'Last used: <b>' + NAME[lastI] + '</b></li>';
      html += '<ul class="pv pv-ic" aria-label="Sign in with"' + (busyId ? " data-busy" : "") + '>' + li + '</ul>';
    }
    return html;
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
    } else if (v === "f") {
      body = iconBody(ids, busyId); lead = "";
    } else if (v === "e" && wideMQ.matches) {
      body = wideBody(ids, busyId); lead = "";
    } else if (o === "d") {
      var sp = split(ids); lastD = sp.first ? "" : sp.shown[0]; restN = sp.rest.length;
      var dn = s === "down" ? q.fail : "", openD = openX || sp.rest.indexOf(dn) > -1;
      var allD = openD ? sp.shown.concat(sp.rest) : sp.shown.slice();
      /* Owner rule, 27 Oct 2026: "Other ways" is one button in the same grid; once pressed it goes and the extras join the grid. No collapse control. An odd last button is centred (SP-D9, class solo). */
      var liD = allD.map(function (id, i) { return '<li' + (allD.length % 2 && i === allD.length - 1 ? ' class="solo"' : "") + '>' + btn(id, false, busyId) + '</li>'; }).join("");
      if (sp.rest.length && !openD) liD += '<li class="more"><button type="button" class="ow" aria-expanded="false" data-ow="open">Other ways' + ARROW + '</button></li>';
      body = '<p class="lead" id="si-l">Continue with</p><ul class="pv pv-grid" aria-labelledby="si-l"' + (busyId ? " data-busy" : "") + '>' + liD + '</ul>';
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
    if (v) { root.setAttribute("data-v", v); root.setAttribute("data-bw", q.bw || "m"); }
    root.innerHTML = inner;
  }
  draw();
  if (v && wideMQ.addEventListener) wideMQ.addEventListener("change", function () { draw(); });
  document.title = "Sign in: option " + o.toUpperCase() + ", " + s;

  /* In a frame a press shows the redirecting state for two seconds, then returns. In the app the link simply navigates. In option D with live=1 a press also remembers the provider (the app does this before it navigates). */
  document.addEventListener("click", function (e) {
    var fg = e.target.closest && e.target.closest("a[data-forget]");
    if (fg) { e.preventDefault(); try { localStorage.removeItem(KEY); } catch (x) {} draw(); return; }
    var ow = e.target.closest && e.target.closest("button[data-ow]");
    if (ow) { e.preventDefault(); var opening = ow.getAttribute("data-ow") === "open"; openX = opening; draw();
      var t; if (opening) { var items = root.querySelectorAll(".pv:not(.pv-one) li:not(.more)"); var first = items[Math.max(0, items.length - restN)]; t = first && first.querySelector(".btn"); } else t = root.querySelector("button[data-ow]");
      if (t) t.focus(); return; }
    var a = e.target.closest && e.target.closest("a[data-p]"); if (!a) return;
    e.preventDefault();
    if (a.getAttribute("aria-disabled") === "true") return;
    var list = a.closest(".pv"); if (!list || s !== "default" && s !== "last") return;
    var all = document.querySelectorAll(".pv"); var name = a.querySelector(".n"); var was = name ? name.textContent : "";
    var id = a.getAttribute("data-p");
    all.forEach(function (u) { u.setAttribute("data-busy", ""); }); a.setAttribute("aria-busy", "true"); if (name) name.textContent = "Opening…";
    setTimeout(function () {
      if (q.live === "1") { saveUsed(id); draw(); return; }
      all.forEach(function (u) { u.removeAttribute("data-busy"); }); a.removeAttribute("aria-busy"); if (name) name.textContent = was;
    }, 2000);
  });
})();
