"""Capture README screenshots of the real card from the local dev harness.

Headless Chrome renders http://localhost:5173/#shot=<view> (see dev/main.ts shot
mode) at 2x, then each image is cropped to the card's own bounding box so the
README shows the component, not the harness page.
"""
import os
import subprocess
import sys
import tempfile

from PIL import Image

CHROME = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
OUT_DIR = sys.argv[1]
SHOTS = sys.argv[2].split(",")
SCALE = 2
MARGIN = 10 * SCALE

os.makedirs(OUT_DIR, exist_ok=True)
profile = tempfile.mkdtemp(prefix="mzcs-shot-")

for shot in SHOTS:
    raw = os.path.join(OUT_DIR, f"_raw_{shot}.png")
    cmd = [
        CHROME,
        "--headless=new",
        "--disable-gpu",
        "--hide-scrollbars",
        f"--user-data-dir={profile}",
        f"--force-device-scale-factor={SCALE}",
        "--window-size=560,1600",
        "--virtual-time-budget=8000",
        f"--screenshot={raw}",
        f"http://localhost:5173/#shot={shot}",
    ]
    subprocess.run(cmd, capture_output=True, timeout=120)
    if not os.path.exists(raw):
        print(f"FAIL {shot}: no file produced")
        continue

    im = Image.open(raw).convert("RGB")
    bg = im.getpixel((2, 2))

    def differs(px):
        return abs(px[0] - bg[0]) + abs(px[1] - bg[1]) + abs(px[2] - bg[2]) > 12

    w, h = im.size
    px = im.load()
    top, bottom, left, right = None, None, w, 0
    for y in range(h):
        row_hit = False
        for x in range(0, w, 2):
            if differs(px[x, y]):
                row_hit = True
                if x < left:
                    left = x
                if x > right:
                    right = x
        if row_hit:
            if top is None:
                top = y
            bottom = y
    if top is None:
        print(f"FAIL {shot}: blank render")
        continue

    box = (
        max(0, left - MARGIN),
        max(0, top - MARGIN),
        min(w, right + MARGIN),
        min(h, bottom + MARGIN),
    )
    out = os.path.join(OUT_DIR, f"{shot}.png")
    im.crop(box).save(out, optimize=True)
    os.remove(raw)
    cw, ch = Image.open(out).size
    print(f"OK {shot}: {cw}x{ch} ({os.path.getsize(out) // 1024} KB) -> {out}")
