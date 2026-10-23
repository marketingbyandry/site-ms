"""Carrousel Instagram J3 « la vitrine qui reste allumée » (4 slides 1080x1350) + visuel Facebook."""
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import os, sys
OUT = sys.argv[1]; os.makedirs(OUT, exist_ok=True)
FONTS = "/Users/andry/.claude/jobs/c40c58ba/tmp/j2v/fonts"
PHOTO = "/Users/andry/Movies/M&S Strategy/Campagne Pas de -50/Photos J1-J5/j3_devanture-heure-bleue.jpg"
W, H = 1080, 1350
DEEP, MINT, PAPER, INK, TEAL = (13, 61, 71), (212, 236, 238), (243, 238, 228), (15, 42, 49), (26, 122, 138)

def font(name, size, weight=None):
    f = ImageFont.truetype(f"{FONTS}/{name}", size)
    if weight:
        try: f.set_variation_by_axes([weight])
        except Exception: pass
    return f

SERIF = lambda s: font("InstrumentSerif-Regular.ttf", s)
SANS = lambda s, w=600: font("Manrope.ttf", s, w)

def chrome(d, fg, n):
    d.text((80, 70), "M&S Strategy", font=SERIF(46), fill=fg)
    t = f"{n}/4"; d.text((W - 80 - d.textlength(t, font=SANS(30, 700)), 82), t, font=SANS(30, 700), fill=fg)
    d.text((80, H - 110), "cabinetms.fr", font=SANS(30, 600), fill=fg)

def lines(d, xs, y, f, fill, lh):
    for l in xs: d.text((80, y), l, font=f, fill=fill); y += lh
    return y

# 1 : photo + « 20h. »
im = Image.open(PHOTO).convert("RGB").resize((W, H))
grad = Image.new("L", (1, H)); [grad.putpixel((0, y), int(150 * max(0, (y - H * 0.55) / (H * 0.45)))) for y in range(H)]
im = Image.composite(Image.new("RGB", (W, H), (0, 0, 0)), im, grad.resize((W, H)))
d = ImageDraw.Draw(im); chrome(d, (255, 255, 255), 1)
d.text((80, H - 420), "20h.", font=SERIF(260), fill=(255, 255, 255))
im.save(f"{OUT}/j3_ig_1.jpg", quality=92)

# 2 : « La rue dort. »
im = Image.new("RGB", (W, H), DEEP); d = ImageDraw.Draw(im); chrome(d, MINT, 2)
lines(d, ["La rue", "dort."], 470, SERIF(190), (255, 255, 255), 200)
im.save(f"{OUT}/j3_ig_2.jpg", quality=92)

# 3 : « Votre vitrine travaille encore. »
im = Image.new("RGB", (W, H), DEEP); d = ImageDraw.Draw(im); chrome(d, MINT, 3)
y = lines(d, ["Votre vitrine", "travaille", "encore."], 380, SERIF(170), (255, 255, 255), 178)
d.rounded_rectangle((80, y + 40, 80 + 160, y + 52), radius=6, fill=(244, 196, 98))
im.save(f"{OUT}/j3_ig_3.jpg", quality=92)

# 4 : « Une minuterie. Réglée une fois. Utile tout l'hiver. »
im = Image.new("RGB", (W, H), PAPER); d = ImageDraw.Draw(im); chrome(d, INK, 4)
d.text((80, 330), "LE BON RÉFLEXE", font=SANS(32, 700), fill=TEAL)
lines(d, ["Une minuterie.", "Réglée une fois.", "Utile tout l’hiver."], 420, SERIF(132), INK, 150)
im.save(f"{OUT}/j3_ig_4.jpg", quality=92)

# Facebook : la photo seule, 4:5
Image.open(PHOTO).convert("RGB").resize((W, H)).save(f"{OUT}/j3_facebook.jpg", quality=92)
print("ok", sorted(os.listdir(OUT)))
