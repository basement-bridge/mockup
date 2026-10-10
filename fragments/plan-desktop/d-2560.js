/* Ultrawide only (2200 and up), fetched only then: the prep-ahead and shop-by-day notes become their own lane, so they stay in view while a meal is open. */
(function(){var P=PLAN;P.layout.lane2=function(){return window.matchMedia("(min-width:2200px)").matches?'<aside class="panel p2" id="panel2" aria-label="Prep ahead">'+P.layout.idle()+'</aside>':""};})();
