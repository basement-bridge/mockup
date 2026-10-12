/* Ultrawide only (2200px and up), fetched only then: the week summary becomes its own lane, so it stays in view while a meal is open. Used by options A, B and C. */
(function(){var P=PLAN;P.layout.lane2=function(){return window.matchMedia("(min-width:2200px)").matches?P.sumLane():""};})();
