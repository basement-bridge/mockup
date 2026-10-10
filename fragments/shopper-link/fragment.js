// Shopper link fragment: the fragment page's own script (index.html). Nothing here is for the build.
// "Start again" empties the live demo's pretend server (shared by the three phones, kept in this browser like a real phone keeps its page) and reloads the three phones.
(function () {
  "use strict";
  var reset = document.getElementById("sl-reset");
  var frames = ["sl-live-phone", "sl-live-phone-b", "sl-live-member"].map(function (id) { return document.getElementById(id); });
  if (!reset || !frames[0]) return;
  reset.addEventListener("click", function () {
    try { localStorage.removeItem("kitchie.sl.srv:live"); } catch (e) { /* no storage: nothing was kept */ }
    frames.forEach(function (f) { if (f && f.contentWindow) f.contentWindow.location.reload(); });
  });
})();
