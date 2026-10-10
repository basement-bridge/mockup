// Shopper link fragment: the fragment page's own script (index.html). Nothing here is for the build.
// "Start again" empties the working phone's ticks (they are kept in this browser, as on a real phone) and puts it back on the list.
(function () {
  "use strict";
  var phone = document.getElementById("sl-live-phone"), reset = document.getElementById("sl-reset");
  if (!phone || !reset) return;
  reset.addEventListener("click", function () {
    try { localStorage.removeItem("kitchie.sl:demo-list"); } catch (e) { /* no storage: nothing was kept */ }
    phone.contentWindow.location.replace("list.html");
  });
})();
