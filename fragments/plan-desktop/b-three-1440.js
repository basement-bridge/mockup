/* Option B, 1440 and up only (fetched only then): there is room for agenda | meal detail | summary side by side. Below this the summary tucks behind the meal detail. */
(function(){var P=PLAN;P.layout.three=function(){return window.matchMedia("(min-width:1440px)").matches};})();
