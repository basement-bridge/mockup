/* Home asks for recipe.js next to the page. The real file is ../../home-detail-panel/recipe.js, loaded by home.html. If that static load did not finish (slow or failed), this shim fetches it and redraws once, so the detail pane never stays on the skeleton and the host never has to call back into a view that is not defined. */
(function () {
  var H = window.HDP; if (!H || H.recipeHtml) return;
  var s = document.createElement("script"); s.src = "../../home-detail-panel/recipe.js";
  s.onload = function () { if (H.recipeHtml && H.set) H.set({}); };
  document.head.appendChild(s);
})();
