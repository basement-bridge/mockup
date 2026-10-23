/* Sample for the stacked-night cue options only (invented meals). Runs right after ../data.js. Today is Wed 14 Oct, so the seven rows are Wed to Tue.
   Mon (n 7) already had Prawn curry for everyone but Jo plus Jo's Cheese toastie; here Sam has an own plan too (3 meals). Sat (n 5) gets a Sam own plan on the household meal (2 meals). ?sample=base keeps ../data.js as it is. */
(function () {
  var P = window.PKD, Q = new URLSearchParams(location.search);
  if (!P || Q.get("sample") === "base") return;
  P.meals[7] = [{ name: "Prawn curry", who: "all", notFor: ["Jo", "Sam"] }, { name: "Cheese toastie", who: "Jo" }, { name: "Leftover rice", who: "me" }];
  P.meals[5] = [{ name: "Veg stir-fry", who: "all", notFor: ["Sam"] }, { name: "Salmon patties", who: "me" }];
})();
