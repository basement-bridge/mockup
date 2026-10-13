#!/usr/bin/env python3
"""Builds samples/*.jpg from the existing mockup food illustrations (recipe-photos/img/*-l.webp).
Deterministic (fixed seed), no network. Run from the repo root:  python3 fragments/photo-enhance/engine/make-samples.py
Each sample is the same base picture with a deliberate flaw added on top of a natural-looking texture
(table grain, vignette, soft shadow) so noise reduction and sharpening have something real to act on."""
import json, os, numpy as np
from PIL import Image, ImageFilter
ROOT = os.path.join(os.path.dirname(__file__), "..", "..", "..")
IMG = os.path.join(ROOT, "recipe-photos", "img")
OUT = os.path.join(os.path.dirname(__file__), "samples")
os.makedirs(OUT, exist_ok=True)
rng = np.random.default_rng(14102026)

def load(n, size=None):
    im = Image.open(os.path.join(IMG, n + "-l.webp")).convert("RGB")
    return im.resize(size, Image.LANCZOS) if size else im

def photoify(im):
    """texture + vignette + soft shadow so it is not a flat vector"""
    a = np.asarray(im).astype(np.float32) / 255
    h, w, _ = a.shape
    g = np.zeros((h, w), np.float32)
    for s, amp in ((4, 0.03), (16, 0.025), (64, 0.02)):           # multi-scale grain, like a cloth / wooden board
        small = rng.standard_normal((h // s + 2, w // s + 2)).astype(np.float32)
        g += amp * np.asarray(Image.fromarray(small).resize((w, h), Image.BICUBIC))
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    v = 1 - 0.28 * (((xx - w / 2) / (w / 2)) ** 2 + ((yy - h / 2) / (h / 2)) ** 2) / 2
    a = a * (1 + g[..., None]) * v[..., None]
    return np.clip(a, 0, 1)

def to_img(a): return Image.fromarray((np.clip(a, 0, 1) * 255 + 0.5).astype(np.uint8))
def lin(a): return np.where(a <= 0.04045, a / 12.92, ((a + 0.055) / 1.055) ** 2.4)
def gam(a): return np.where(a <= 0.0031308, a * 12.92, 1.055 * np.maximum(a, 0) ** (1 / 2.4) - 0.055)
def noise(a, luma, chroma):
    h, w, _ = a.shape
    n = rng.standard_normal((h, w, 1)).astype(np.float32) * luma + rng.standard_normal((h, w, 3)).astype(np.float32) * chroma
    return a + n

samples = []
def save(name, a, label, flaw, q=88, size=None):
    im = to_img(a)
    if size: im = im.resize(size, Image.LANCZOS)
    p = os.path.join(OUT, name); im.save(p, quality=q, optimize=True, progressive=True)
    samples.append({"file": name, "label": label, "flaw": flaw, "width": im.size[0], "height": im.size[1], "bytes": os.path.getsize(p)})

# dark and flat: under-exposed, low contrast
a = photoify(load("len-1"))
l = lin(a) * 0.38
mid = l.mean()
save("dark.jpg", gam(0.7 * l + 0.3 * mid), "Dark and flat", "Under-exposed (about 1.4 stops) and low contrast")

# warm yellow cast (indoor bulb): red up, blue down
a = photoify(load("efr-c1"))
l = lin(a) * np.array([1.2, 1.0, 0.66], np.float32)
save("warm.jpg", gam(l), "Warm yellow cast", "Indoor light: red up, blue down")

# blown highlights: pushed 1.8 stops, plate clips
a = photoify(load("efr-2"))
save("blown.jpg", gam(lin(a) * 3.4 + 0.02), "Blown highlights", "Over-exposed; the plate and sky-bright background clip to white")

# noisy low light: dark, high ISO luma + colour noise
a = photoify(load("cur-1"))
l = lin(a) * 0.22
save("noisy.jpg", np.clip(noise(gam(l), 0.07, 0.045), 0, 1), "Noisy low light", "Dim kitchen, high ISO: grain and colour speckle", q=90)

# already good: gentle grain only
a = photoify(load("efr-1"))
save("good.jpg", np.clip(noise(a, 0.006, 0.003), 0, 1), "Already good", "Nothing to fix; Enhance should say so", q=88)

# large: 4800 x 3600, moderate quality, fine texture; modest dim cast so it has something to do
a = photoify(load("sha-1", (4800, 3600)))
a = gam(lin(a) * 0.45 * np.array([1.1, 1.0, 0.82], np.float32))
save("large.jpg", np.clip(noise(a, 0.012, 0.006), 0, 1), "Large photo (4800 px)", "Big phone-camera sized photo, a bit dark and warm; tests the large-photo path", q=55)

json.dump([{k: s[k] for k in ("file", "label", "flaw")} for s in samples], open(os.path.join(OUT, "samples.json"), "w"), indent=2)
tot = sum(s["bytes"] for s in samples)
for s in samples: print(s["file"], s["width"], s["height"], s["bytes"] // 1024, "KB")
print("total", tot // 1024, "KB")
