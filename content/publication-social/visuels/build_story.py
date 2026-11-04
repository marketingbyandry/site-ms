"""Story Instagram « Nouveau post » : aperçu de la slide 1 d'un post, 1080x1920, DA J7-J12.
Usage : python3 build_story.py <slide.jpg> <sortie.jpg> "<ligne 1>" "<ligne 2>" """
import os, sys
from PIL import Image, ImageDraw, ImageFilter
SLIDE, OUT, L1, L2 = sys.argv[1:5]
src = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "build_j7-j12.py")).read()
g = {}; exec(src.split("# ---------- J7")[0].replace("ROOT = sys.argv[1]", "ROOT = None"), g)
W, H = 1080, 1920; DEEP, MINT = g["DEEP"], g["MINT"]
im = Image.new("RGB", (W, H), DEEP); d = ImageDraw.Draw(im)
d.text((80, 110), "M&S Strategy", font=g["SERIF"](52), fill=MINT)
# pastille « NOUVEAU POST »
f = g["SANS"](34, 800); t = "NOUVEAU POST"; tw = d.textlength(t, font=f)
d.rounded_rectangle((80, 230, 80 + tw + 56, 230 + 70), radius=35, fill=MINT); d.text((108, 245), t, font=f, fill=DEEP)
# aperçu : slide 1 en carte arrondie avec ombre
pw, ph = 760, 950; px, py = (W - pw) // 2, 380
card = Image.open(SLIDE).convert("RGB").resize((pw, ph), Image.LANCZOS)
sh = Image.new("L", (W, H), 0); ImageDraw.Draw(sh).rounded_rectangle((px + 10, py + 24, px + pw + 10, py + ph + 24), 40, fill=150)
im = Image.composite(Image.new("RGB", (W, H), (4, 24, 29)), im, sh.filter(ImageFilter.GaussianBlur(28)))
m = Image.new("L", (pw, ph), 0); ImageDraw.Draw(m).rounded_rectangle((0, 0, pw, ph), 40, fill=255)
im.paste(card, (px, py), m); d = ImageDraw.Draw(im)
y = py + ph + 90
for l in [x for x in (L1, L2) if x]:
    s = g["SERIF"](84); d.text(((W - d.textlength(l, font=s)) // 2, y), l, font=s, fill=(255, 255, 255)); y += 92
c = "À voir sur notre profil →"; s = g["SANS"](38, 700); d.text(((W - d.textlength(c, font=s)) // 2, y + 40), c, font=s, fill=MINT)
im.save(OUT, quality=92); print("ok", OUT)
