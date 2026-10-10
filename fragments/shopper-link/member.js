// Shopper link, the member's Shopping screen. NEW FOR THE BUILD: fold into assets/shopping.js.
// Share, Cancel and Dismiss are plain form posts, so they work without this file (the server then answers Share with a page that shows the text
// to copy, and redirects back after the other two). With it:
//   - Share: POST <base>/shopping/share with Accept: application/json answers { url, text, expires_at }. The text (the list, then the link line)
//     goes to the phone's own share sheet; with no share sheet it is copied; if neither works it is shown to copy by hand. The link exists from
//     the moment the server answers, whatever the person then does with the sheet, so the page is drawn again to show the live line.
//   - Cancel and Dismiss: POST with the field link (the first 8 hex of the link's hash), then the line or the card goes away in place.
// Nothing is fetched on load: this file only listens.
(function () {
  "use strict";
  var toastEl = document.getElementById("toast"), timer = 0;
  function say(text) {
    if (!toastEl) return;
    toastEl.textContent = text; toastEl.hidden = false;
    clearTimeout(timer);
    timer = setTimeout(function () { toastEl.hidden = true; }, 2800);
  }
  function post(form, json) {
    return fetch(form.getAttribute("action"), { method: "POST", headers: json ? { accept: "application/json" } : {}, body: new URLSearchParams(new FormData(form)), credentials: "same-origin" })
      .then(function (res) { if (!res.ok) throw res; return json ? res.json() : res; });
  }
  function hours(iso) { return Math.max(1, Math.round((new Date(iso).getTime() - Date.now()) / 3600000)); }
  // Draw the screen again so the server's own live line (with its Cancel form) is on it.
  function redraw() { location.reload(); }

  function hand(made) {
    var left = "The link works for " + hours(made.expires_at) + " hours.";
    if (navigator.share) {
      return navigator.share({ text: made.text }).then(function () { say("Shared. " + left); }, function (err) { if (!err || err.name !== "AbortError") throw err; });
    }
    if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(made.text).then(function () { say("Copied, link and all. Paste it in the chat."); });
    return Promise.reject(new Error("no way to share"));
  }
  function byHand(made) {
    var box = document.getElementById("sl-sharebox");
    if (!box) return false;
    box.querySelector("[data-sl-sharetext]").value = made.text;
    box.hidden = false; box.scrollIntoView({ block: "nearest" });
    return true;
  }

  document.addEventListener("submit", function (e) {
    var form = e.target, btn = form.querySelector("button[type=submit]");
    if (form.matches("[data-sl-share]")) {
      e.preventDefault();
      btn.disabled = true;
      post(form, true).then(function (made) {
        return hand(made).then(function () { setTimeout(redraw, 1200); }, function () { if (!byHand(made)) redraw(); });
      }, function (res) {
        say(res && res.status === 409 ? "3 links are live, the most at once. Cancel one first." : "Couldn't make the link. Try again.");
      }).then(function () { btn.disabled = false; });
    } else if (form.matches("[data-sl-cancel],[data-sl-dismiss]")) {
      e.preventDefault();
      btn.disabled = true;
      var gone = form.closest("[data-sl-link]"), cancel = form.matches("[data-sl-cancel]");
      post(form, false).then(function () {
        gone.remove();
        if (cancel) { say("Link cancelled."); var full = document.querySelector("[data-sl-full]"), share = document.querySelector(".sl-top [data-sl-share]"); if (full) full.hidden = true; if (share) share.hidden = false; }
      }, function () { btn.disabled = false; say("That didn't work. Try again."); });
    }
  });
  document.addEventListener("click", function (e) {
    if (e.target.closest && e.target.closest("[data-sl-shareclose]")) redraw();
  });
})();
