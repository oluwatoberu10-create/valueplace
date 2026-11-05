"""Trim baked-in white borders from the supplied Drive photos and name them by content.

Usage: python -I prepare-images.py <raw_dir> <public_images_dir>
unnamed_10 (Vecteezy watermark) and unnamed_17 (exact duplicate of 15) are deliberately skipped.
"""
import sys
from pathlib import Path
from PIL import Image, ImageChops

MAP = {
    "unnamed.webp": "restaurant/serving-counter.webp",
    "unnamed_1.webp": "restaurant/exterior-front.webp",
    "unnamed_3.webp": "restaurant/exterior-signage.webp",
    "unnamed_2.webp": "menu/fried-rice.webp",
    "unnamed_4.webp": "menu/vegetable-soup.webp",
    "unnamed_5.webp": "menu/glazed-wings.webp",
    "unnamed_6.webp": "menu/peppered-beef.webp",
    "unnamed_7.webp": "menu/jollof-rice.webp",
    "unnamed_8.webp": "menu/yam-porridge.webp",
    "unnamed_9.webp": "menu/peppered-fish.webp",
    "unnamed_11.webp": "menu/peppered-ponmo.webp",
    "unnamed_12.webp": "menu/peppered-snail.webp",
    "unnamed_13.webp": "menu/crispy-prawns.webp",
    "unnamed_14.webp": "menu/beef-skewers.webp",
    "unnamed_15.webp": "menu/banga-soup.webp",
    "unnamed_16.webp": "menu/egusi-soup.webp",
}
raw, out = Path(sys.argv[1]), Path(sys.argv[2])
for src, dest in MAP.items():
    im = Image.open(raw / src).convert("RGB")
    diff = ImageChops.difference(im, Image.new("RGB", im.size, (255, 255, 255))).convert("L")
    l, t, r, b = diff.point(lambda p: 255 if p > 12 else 0).getbbox()
    inset = 2  # drop the anti-aliased edge row left by the padding
    box = (l + inset if l else 0, t + inset if t else 0,
           r - inset if r < im.width else r, b - inset if b < im.height else b)
    target = out / dest
    target.parent.mkdir(parents=True, exist_ok=True)
    im.crop(box).save(target, "WEBP", quality=90, method=6)
    print(dest, im.crop(box).size, target.stat().st_size // 1024, "KB")
