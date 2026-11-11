"""Cut the showroom walkthrough into scroll sequences, stills and posters.

Every frame is cropped to x=192..3648, y=216..2160 of the 4K source (keeps 16:9,
drops the top band that carries the production-house bug) before scaling.
"""
import cv2, os, json, sys
import numpy as np
from PIL import Image

V = sys.argv[1]
OUT = sys.argv[2]
CROP = (192, 216, 3456, 1944)  # x, y, w, h

cap = cv2.VideoCapture(V)
FPS = cap.get(cv2.CAP_PROP_FPS)


def grab(t):
    cap.set(cv2.CAP_PROP_POS_MSEC, t * 1000)
    ok, f = cap.read()
    if not ok:
        raise RuntimeError(f"no frame at {t}")
    x, y, w, h = CROP
    return f[y:y + h, x:x + w]


def to_pil(f, width, crop=None):
    if crop:  # fractional crop (x0,y0,x1,y1) of the 16:9 frame
        H, W = f.shape[:2]
        f = f[int(crop[1] * H):int(crop[3] * H), int(crop[0] * W):int(crop[2] * W)]
    h = round(f.shape[0] * width / f.shape[1])
    f = cv2.resize(f, (width, h), interpolation=cv2.INTER_AREA)
    return Image.fromarray(cv2.cvtColor(f, cv2.COLOR_BGR2RGB))


def save(img, path, q):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    img.save(path, "WEBP", quality=q, method=6)


def sequence(name, shots, per_shot, blend=3):
    """shots: list of (start, end). Samples per_shot frames from each and
    cross-dissolves `blend` frames across each cut so scrubbing never pops."""
    frames = []
    for (a, b) in shots:
        ts = np.linspace(a, b, per_shot)
        frames.append([grab(float(t)) for t in ts])
    seq = []
    for i, shot in enumerate(frames):
        if i > 0 and blend:
            prev = frames[i - 1]
            for k in range(blend):
                w = (k + 1) / (blend + 1)
                seq.append(cv2.addWeighted(prev[-1], 1 - w, shot[0], w, 0))
        seq.extend(shot)
    for i, f in enumerate(seq):
        save(to_pil(f, 1600), f"{OUT}/seq/{name}/d/{i:03d}.webp", 62)
        save(to_pil(f, 800), f"{OUT}/seq/{name}/m/{i:03d}.webp", 55)
    # index of the first frame of each shot, for choreography
    marks, n = [], 0
    for i, shot in enumerate(frames):
        if i > 0:
            n += blend
        marks.append(n)
        n += len(shot)
    print(name, "frames", len(seq), "marks", marks, flush=True)
    return {"count": len(seq), "marks": marks}


def still(name, t, crop=None, widths=(2000, 1000), q=80):
    f = grab(t)
    for w in widths:
        save(to_pil(f, w, crop), f"{OUT}/img/{name}-{w}.webp", q)
    print("still", name, flush=True)


meta = {}
which = sys.argv[3] if len(sys.argv) > 3 else "all"

if which in ("all", "seq"):
    meta["arrive"] = sequence("arrive", [
        (8.30, 10.75),    # illuminated fascia lettering
        (10.95, 13.40),   # facade from the pavement
        (13.60, 16.15),   # glass doors
        (16.40, 18.85),   # double-height lobby
        (21.85, 24.35),   # crystal chandelier
    ], 26)
    meta["gold"] = sequence("gold", [
        (27.20, 29.70),   # long gold hall
        (29.95, 32.35),   # chains wall
        (35.25, 37.70),   # rings counter
        (45.95, 48.40),   # necklace niches
        (51.35, 53.80),   # earrings wall
    ], 22)
    meta["ascend"] = sequence("ascend", [
        (56.85, 59.35),   # staircase and brass rail
        (64.85, 67.30),   # arriving on the silver floor
        (105.2, 107.8),   # diamond gallery
        (113.25, 115.8),  # diamonds wall
        (134.5, 137.05),  # bridal niche
    ], 20)
    json.dump(meta, open(f"{OUT}/seq/meta.json", "w"))

if which in ("all", "img"):
    still("sign", 9.2)
    still("facade", 12.0)
    still("doors", 14.8)
    still("lobby", 17.5)
    still("chandelier", 23.0)
    still("hall", 28.4)
    still("chains", 31.0)
    still("chains-close", 33.4)
    still("rings", 36.4)
    still("rings-wall", 39.0)
    still("necklaces", 46.6)
    still("earrings", 52.4)
    still("stairs", 58.0)
    still("bangles", 60.6)
    still("silver-hall", 68.6)
    still("silverware", 71.4)
    still("silver-counter", 74.0)
    still("busts", 81.6)
    still("busts-b", 82.9)
    still("atrium", 85.0)
    still("frames", 89.6)
    still("stair-top", 103.4)
    still("diamond-hall", 109.0)
    still("diamonds", 114.4)
    still("diamond-counter", 119.6)
    still("niche", 122.2)
    still("niches-row", 124.8)
    still("bridal-room", 132.6)
    still("bridal", 135.4)
    still("bridal-b", 138.2)
    still("script", 149.5)
    still("stairwell", 163.5)
    # macro crops for the craftsmanship scene (fractions of the cropped frame)
    still("macro-niche", 122.2, (0.30, 0.22, 0.70, 0.98), (1400, 800), 84)
    still("macro-bridal", 135.4, (0.27, 0.22, 0.77, 0.78), (1600, 800), 84)
    still("macro-busts", 81.6, (0.18, 0.30, 0.68, 0.86), (1600, 800), 84)
    still("macro-heritage", 46.6, (0.36, 0.02, 0.60, 0.62), (1200, 700), 84)

cap.release()
