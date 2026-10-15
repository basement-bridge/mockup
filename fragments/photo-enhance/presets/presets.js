/* Photo Enhance presets: the data. Plain script, no module, so the app can lift it as is.
 * Each preset is a "recipe" of the same few knobs. Knob meanings (all optional, 0 = off):
 *   auto       0 to 1  how much of the measured fix to keep (exposure, colour cast, shadows, highlights, colour, grain, sharpness)
 *   ev         stops   extra brightness on top, in linear light (+0.3 is a small lift, +0.7 is a lot)
 *   warm       -1..1   white balance toward orange (+) or blue (-); green is left alone so it warms without going yellow
 *   contrast   -1..1   S-curve on brightness only (negative flattens), colour kept
 *   sat        -1..1   all colours richer, dull colours more than strong ones
 *   vib        0..1    colours richer, reds and oranges protected (tomatoes, meat, skin stay put)
 *   shadows    0..1    lift the dark parts
 *   highlights 0..1    calm the bright parts so plates and sauce do not blow out
 *   clarity    -1..1   local contrast at a wide radius: + crisps texture, - softens
 *   sharp      0..1    fine edge sharpening on top of the auto amount
 * Every number is a Proposal; the owner picks by eye on his own photo. */
(function () {
  "use strict";
  var PRESETS = [
    { id: "natural", name: "Natural", spec: { auto: 1 },
      why: "The engine's honest fix and nothing more: exposure, cast, shadows. Identical to today's Full; the baseline every other look is judged against." },
    { id: "lift", name: "Lift", spec: { auto: 0.8, ev: 0.25, highlights: 0.1 },
      why: "A small lift. Kitchen lights are dim and food looks darker on a phone than on the plate; this brings it back." },
    { id: "bright", name: "Bright", spec: { auto: 1, ev: 0.45, highlights: 0.3, vib: 0.1 },
      why: "Clearly brighter. White plates read white, sauces stay glossy not blown. The 'little brighter' ask." },
    { id: "airy", name: "Light and airy", spec: { auto: 1, ev: 0.65, highlights: 0.5, contrast: -0.15, shadows: 0.2, vib: 0.1 },
      why: "Window-light brunch look: high key, soft shadows. Suits pancakes, eggs, salads, bakes on a pale table." },
    { id: "warm", name: "Warm table", spec: { auto: 0.8, ev: 0.3, warm: 0.45, highlights: 0.15 },
      why: "Warms toward orange, never yellow. Bread, roasts, curries and anything golden look cooked, not pale." },
    { id: "golden", name: "Golden hour", spec: { auto: 0.7, ev: 0.25, warm: 0.9, contrast: 0.15, highlights: 0.2 },
      why: "The strong version of Warm table. Dinner-party glow; too much for greens and fish, great for roasts." },
    { id: "clean", name: "Clean daylight", spec: { auto: 1, ev: 0.4, warm: -0.3, highlights: 0.25 },
      why: "Cooler and neutral, whites truly white. Fish, salads, dairy, anything shot under a warm bulb." },
    { id: "deep", name: "Rich and deep", spec: { auto: 0.9, ev: 0.15, contrast: 0.4, sat: 0.15, shadows: 0.15, highlights: 0.15 },
      why: "Depth in the dark parts without losing them. Stews, chocolate, braises, grilled meat." },
    { id: "dim", name: "Dim-room rescue", spec: { auto: 1, ev: 0.7, shadows: 0.7, highlights: 0.3, vib: 0.2 },
      why: "For the restaurant or evening photo. Lifts the shadows hard; grain smoothing is on automatically." },
    { id: "greens", name: "Fresh greens", spec: { auto: 1, ev: 0.3, warm: -0.15, vib: 0.6, highlights: 0.2 },
      why: "Colour goes up on the dull pixels (leaves, herbs, citrus) while reds stay as they were. Salads, soups, fruit." },
    { id: "juicy", name: "Juicy", spec: { auto: 0.9, ev: 0.25, sat: 0.3, contrast: 0.2, highlights: 0.2 },
      why: "Everything richer, reds included. Berries, tomatoes, steak, sauces. Easy to overdo, so look at skin and plates." },
    { id: "crisp", name: "Crisp", spec: { auto: 1, ev: 0.25, clarity: 0.5, sharp: 0.35 },
      why: "Texture reads: crusts, roasted vegetables, bread crumb, crackling. A phone photo is soft; this fixes that." },
    { id: "soft", name: "Soft cream", spec: { auto: 0.9, ev: 0.4, clarity: -0.35, highlights: 0.4, contrast: -0.1 },
      why: "A gentle, creamy finish. Cakes, custards, soups, ice cream. Gentle on skin tones if hands are in shot." },
    { id: "bakery", name: "Bakery", spec: { auto: 0.9, ev: 0.3, warm: 0.4, contrast: 0.2, clarity: 0.3, highlights: 0.2 },
      why: "Warm crust plus texture: bread, pastry, pies. Golden-brown reads golden-brown." },
    { id: "pop", name: "Menu pop", spec: { auto: 1, ev: 0.35, warm: 0.2, contrast: 0.25, vib: 0.35, clarity: 0.25, sharp: 0.2, highlights: 0.25 },
      why: "A little of everything, what a food editor would do by hand. The most 'finished' look; also the one most likely to look edited." }
  ];
  var TODAY = [
    { id: "off", name: "Original", why: "Your photo, untouched." },
    { id: "light", name: "Light (today)", why: "The shipped Light level, strength 0.4 of the measured fix." },
    { id: "balanced", name: "Balanced (today)", why: "The shipped Balanced level, 0.7 of the measured fix." },
    { id: "full", name: "Full (today)", why: "The shipped Full level, the whole measured fix. Compare against the presets." }
  ];
  var KNOBS = [
    ["ev", "Brightness", function (v) { return (v > 0 ? "+" : "") + v.toFixed(2) + " stop"; }],
    ["warm", "Warmth", function (v) { return (v > 0 ? "warmer " : "cooler ") + Math.round(Math.abs(v) * 100) + "%"; }],
    ["contrast", "Contrast", function (v) { return (v > 0 ? "+" : "") + Math.round(v * 100) + "%"; }],
    ["sat", "Colour richness", function (v) { return (v > 0 ? "+" : "") + Math.round(v * 100) + "%"; }],
    ["vib", "Colour (reds protected)", function (v) { return "+" + Math.round(v * 100) + "%"; }],
    ["shadows", "Shadows lifted", function (v) { return Math.round(v * 100) + "%"; }],
    ["highlights", "Highlights calmed", function (v) { return Math.round(v * 100) + "%"; }],
    ["clarity", "Texture", function (v) { return (v > 0 ? "crisper " : "softer ") + Math.round(Math.abs(v) * 100) + "%"; }],
    ["sharp", "Sharpness", function (v) { return "+" + Math.round(v * 100) + "%"; }],
    ["auto", "Measured fix kept", function (v) { return Math.round(v * 100) + "%"; }]
  ];
  function describe(spec) {
    var out = [];
    KNOBS.forEach(function (k) { var v = spec[k[0]]; if (v) out.push({ key: k[0], label: k[1], text: k[2](v) }); });
    return out;
  }
  window.PhotoPresets = { PRESETS: PRESETS, TODAY: TODAY, describe: describe, DEFAULT: "bright" };
})();
