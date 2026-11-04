"""Visuels J19 (« Vous baissez vos prix. Qui baisse les vôtres ? »), même DA que J7-J12.
Photos : IA générées (ElevenLabs, Seedream 4.5), flow « M&S · J13-J76 ».
Usage : python3 build_j19.py <dossier visuels> <photo_barree> <photo_energie>"""
import os, sys, importlib.util
from PIL import ImageDraw
ROOT, BARREE, ENERGIE = sys.argv[1:4]
src = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "build_j7-j12.py")).read()
helpers = src.split("# ---------- J7")[0].replace("ROOT = sys.argv[1]", "ROOT = None")
g = {}; exec(helpers, g)
W, H, DEEP, MINT, PAPER, INK, TEAL = g["W"], g["H"], g["DEEP"], g["MINT"], g["PAPER"], g["INK"], g["TEAL"]
from PIL import Image
# Photo barrée : fausse enseigne en haut à droite -> on garde y 20-100 %, x centré sur l'étiquette
_b = Image.open(BARREE).convert("RGB"); bw, bh = _b.size; ch = int(bh * 0.80); cw = int(ch * W / H); cx = int(bw * 0.64)
_bp = BARREE.replace(".jpg", "_crop.jpg"); _b.crop((cx - cw // 2, bh - ch, cx + cw // 2, bh)).save(_bp, quality=95); BARREE = _bp
o = f"{ROOT}/2026-11-02"; os.makedirs(o, exist_ok=True)
def photo_slide(path, src, n, big, ay=0.5, ax=0.5):
    im = g["shade"](g["cover"](src, W, H, ax=ax, ay=ay), 0.45, 200)
    im = g["shade"](im.transpose(Image.FLIP_TOP_BOTTOM), 0.82, 150).transpose(Image.FLIP_TOP_BOTTOM); d = ImageDraw.Draw(im); g["chrome"](d, (255, 255, 255), n, 5)
    g["lines"](d, big, 80, H - 120 - 122 * len(big) - 40, g["SERIF"](116), (255, 255, 255), 122)
    im.save(path, quality=92)
photo_slide(f"{o}/j19_ig_1.jpg", BARREE, 1, ["Vous baissez", "vos prix."])
photo_slide(f"{o}/j19_ig_2.jpg", ENERGIE, 2, ["Qui baisse", "les vôtres ?"], ax=0.12)
g["text_slide"](f"{o}/j19_ig_3.jpg", 3, 5, "LA REMISE", ["Elle se", "pilote."], ["Vous choisissez quand,", "combien, sur quoi."], size=170)
g["text_slide"](f"{o}/j19_ig_4.jpg", 4, 5, "LA CHARGE D’ÉNERGIE", ["Elle se", "subit."], ["Tous les mois, que vous", "vendiez ou non."], bg=PAPER, fg=INK, acc=TEAL, size=170)
g["text_slide"](f"{o}/j19_ig_5.jpg", 5, 5, "4 SEMAINES, ZÉRO REMISE", ["Le contre-", "Black Friday", "commence."], ["Calculateur en lien en bio."], size=150)
g["cover"](BARREE, W, H).save(f"{o}/j19_facebook.jpg", quality=92)
print("ok", sorted(os.listdir(o)))
