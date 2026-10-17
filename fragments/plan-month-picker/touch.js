/* Touch behaviour for the tablet and phone sheets (loaded by tablet.html and phone.html only, never by the desktop page). There is no hover on a touch screen, so a planned night or a day off shows what is on it first, and the
   second tap plans it (an open night plans at once, and the open nights lead: a shortcut to the first one sits above the grid). There is no keyboard line either. pick-month.js reads these flags. */
(function () { "use strict"; var PK = window.PK; PK.touch = true; PK.rich = document.body.dataset.ff === "tablet"; })();
