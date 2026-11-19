"""Visuels fixes de la semaine J37-J43 (20 → 26/11/2026), même DA que J7-J19.
J37, J39, J41 sont des vidéos (lot J13-J76, ~/Movies/M&S Strategy/Campagne Pas de -50/).
Aucune photo ni chiffre inventé : courbe de charge stylisée sans valeurs, chiffres 48 % / 8 % sourcés
(L'echommerces / Boutique2Mode, fait n°8).
Usage : python3 build_j37-j43.py <dossier visuels>  → écrit 2026-11-21/, 2026-11-23/, 2026-11-25/, 2026-11-26/"""
import os, sys, math
from PIL import Image, ImageDraw

ROOT = sys.argv[1]
src = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "build_j7-j12.py")).read()
helpers = src.split("# ---------- J7")[0].replace("ROOT = sys.argv[1]", "ROOT = None")
g = {}; exec(helpers, g)
W, H, DEEP, MINT, PAPER, INK, TEAL, SUN, GREY = (g[k] for k in ("W", "H", "DEEP", "MINT", "PAPER", "INK", "TEAL", "SUN", "GREY"))
SERIF, SANS, chrome, lines, text_slide = g["SERIF"], g["SANS"], g["chrome"], g["lines"], g["text_slide"]
BLACK, WHITE = (12, 12, 12), (255, 255, 255)
XW, XH = 1600, 900


def out(day):
    o = f"{ROOT}/{day}"; os.makedirs(o, exist_ok=True); return o


def pdf(paths, dest):
    ims = [Image.open(p).convert("RGB") for p in paths]
    ims[0].save(dest, save_all=True, append_images=ims[1:], resolution=150)


def centered(d, text, y, f, fill, w=W):
    d.text(((w - d.textlength(text, font=f)) / 2, y), text, font=f, fill=fill)


def wrap(d, text, f, maxw):
    words, rows, cur = text.split(), [], ""
    for w_ in words:
        t = (cur + " " + w_).strip()
        if d.textlength(t, font=f) <= maxw: cur = t
        else: rows.append(cur); cur = w_
    rows.append(cur); return rows


# ---------- J38 · samedi 21/11 · Restaurateurs : pointes et plages horaires
o = out("2026-11-21")

def load(h):  # courbe stylisée d'un restaurant : base + pointe du midi + pointe du soir, sans valeurs
    return 0.18 + 0.75 * math.exp(-((h - 12.8) / 1.3) ** 2) + 0.9 * math.exp(-((h - 20.3) / 1.5) ** 2) + 0.12 * math.exp(-((h - 9.5) / 1.2) ** 2)

im = Image.new("RGB", (W, H), PAPER); d = ImageDraw.Draw(im); chrome(d, TEAL)
d.text((80, 190), "RESTAURATEURS", font=SANS(32, 800), fill=TEAL)
lines(d, ["Vos pointes tombent", "en heures pleines."], 80, 250, SERIF(92), INK, 98)
x0, x1, y0, y1 = 80, W - 80, 560, 1060
hx = lambda h: x0 + (x1 - x0) * h / 24
d.rectangle([x0, y0, x1, y1], fill=(232, 226, 214))
for a, b in ((6, 22),):  # plage d'heures pleines type (HPH), le reste en heures creuses
    d.rectangle([hx(a), y0, hx(b), y1], fill=(250, 223, 170))
d.text((hx(6) + 14, y0 + 14), "HEURES PLEINES", font=SANS(26, 800), fill=(140, 96, 20))
d.text((x0 + 10, y0 + 14), "CREUSES", font=SANS(22, 800), fill=TEAL)
d.text((hx(22) + 8, y0 + 14), "CREUSES", font=SANS(22, 800), fill=TEAL)
pts = [(hx(h / 10), y1 - (y1 - y0 - 90) * load(h / 10) / 1.15) for h in range(0, 241)]
d.polygon(pts + [(x1, y1), (x0, y1)], fill=(186, 214, 214))
d.line(pts, fill=DEEP, width=7, joint="curve")
for h, lab in ((12.8, "service du midi"), (20.3, "service du soir")):
    x, y = hx(h), y1 - (y1 - y0 - 90) * load(h) / 1.15
    d.ellipse([x - 12, y - 12, x + 12, y + 12], fill=DEEP)
    centered(d, lab, y - 62, SANS(28, 700), DEEP, w=2 * x)
for h in (0, 6, 12, 18, 24):
    t = f"{h}h"; d.text((hx(h) - d.textlength(t, font=SANS(26, 600)) / 2, y1 + 14), t, font=SANS(26, 600), fill=INK)
lines(d, ["Courbe type, sans valeurs. Plages HP/HC selon votre contrat.", "Vérifiez votre option tarifaire."], 80, 1110, SANS(30, 600), TEAL, 44)
im.save(f"{o}/j38_linkedin.jpg", quality=92)
im.save(f"{o}/j38_facebook.jpg", quality=92)  # repli : la photo réelle de salle de restaurant n'existe pas encore

# Carrousel Instagram (4)
im = Image.new("RGB", (W, H), DEEP); d = ImageDraw.Draw(im); chrome(d, MINT, 1, 4)
lines(d, ["Vos heures", "de pointe."], 80, 190, SERIF(110), WHITE, 112)
cx, cy, r = W // 2, 790, 270
d.ellipse([cx - r, cy - r, cx + r, cy + r], outline=MINT, width=6)
for h in range(24):
    a = math.radians(h * 15 - 90); k = 0.9 if h % 6 else 0.84
    d.line([(cx + r * k * math.cos(a), cy + r * k * math.sin(a)), (cx + r * math.cos(a), cy + r * math.sin(a))], fill=MINT, width=4 if h % 6 == 0 else 2)
for h, lab in ((0, "0h"), (6, "6h"), (12, "12h"), (18, "18h")):
    a = math.radians(h * 15 - 90); t = lab; f = SANS(30, 700)
    d.text((cx + (r - 80) * math.cos(a) - d.textlength(t, font=f) / 2, cy + (r - 80) * math.sin(a) - 18), t, font=f, fill=MINT)
for a, b, lab in ((12, 14, "12h-14h"), (19, 22, "19h-22h")):
    d.arc([cx - r - 34, cy - r - 34, cx + r + 34, cy + r + 34], a * 15 - 90, b * 15 - 90, fill=SUN, width=36)
    m = math.radians((a + b) / 2 * 15 - 90); f = SANS(34, 800)
    d.text((cx + (r + 110) * math.cos(m) - d.textlength(lab, font=f) / 2, cy + (r + 110) * math.sin(m) - 20), lab, font=f, fill=SUN)
im.save(f"{o}/j38_ig_1.jpg", quality=92)
text_slide(f"{o}/j38_ig_2.jpg", 2, 4, "LA QUESTION", ["Et celles", "de votre", "contrat ?"], size=170)
text_slide(f"{o}/j38_ig_3.jpg", 3, 4, "LES PLAGES DE VOTRE FACTURE", ["HPH · HCH", "HPE · HCE"], ["Heures pleines et creuses,", "hiver et été."], bg=PAPER, fg=INK, acc=TEAL, size=150)
text_slide(f"{o}/j38_ig_4.jpg", 4, 4, "À VÉRIFIER", ["Une option", "par défaut", "peut coûter", "cher en", "plein service."], ["Étude gratuite : lien en bio."], size=118)

# ---------- J40 · lundi 23/11 · Black Week à l'envers
o = out("2026-11-23")

def black(path, big, n=None, total=None, small=None, size=150, w=W, h=H):
    im = Image.new("RGB", (w, h), BLACK); d = ImageDraw.Draw(im); chrome(d, WHITE, n, total, w=w, h=h)
    f = SERIF(size); rows = [r for b in big for r in wrap(d, b, f, w - 160)]
    y = (h - len(rows) * int(size * 1.08)) / 2 - 20
    lines(d, rows, 80, y, f, WHITE, int(size * 1.08))
    if small: lines(d, small, 80, h - 230, SANS(34, 600), GREY, 48)
    im.save(path, quality=92); return path

li = [black(f"{o}/j40_li_{i}.jpg", b, i, 6, s, size=sz) for i, (b, s, sz) in enumerate([
    (["Black Week", "à l'envers."], None, 150),
    (["Réduction", "promise : 0 %."], None, 140),
    (["Date limite :", "aucune."], None, 140),
    (["Stock limité : non."], None, 140),
    (["48 % des indépendants qui ont fait le Black Friday 2025 l'ont fait parce que leurs concurrents le faisaient."], ["Source : L'echommerces, consultation Boutique2Mode."], 88),
    (["Notre offre de la semaine sera la même en février."], ["Étude gratuite toute l'année · cabinetms.fr"], 110),
], 1)]
pdf(li, f"{o}/j40_linkedin.pdf")
im = Image.new("RGB", (W, H), BLACK); d = ImageDraw.Draw(im); chrome(d, WHITE)
y = 360
for t in ("Réduction : 0 %", "Date limite : aucune", "Étude gratuite", "toute l'année"):
    d.text((80, y), t, font=SERIF(124), fill=WHITE); y += 150
d.line([(80, y + 30), (W - 80, y + 30)], fill=GREY, width=2)
d.text((80, y + 60), "Black Week à l'envers.", font=SANS(40, 700), fill=GREY)
im.save(f"{o}/j40_facebook.jpg", quality=92)
for i, b in enumerate((["Réduction :", "0 %"], ["Date limite :", "aucune"], ["Étude gratuite.", "Toute l'année."]), 1):
    black(f"{o}/j40_ig_{i}.jpg", b, i, 3, size=150)

# ---------- J42 · mercredi 25/11 · Le déroulé exact (carrousel Instagram mixte)
o = out("2026-11-25")
steps = [
    ("1", "LE DÉROULÉ EXACT", ["De la facture", "au nouveau", "contrat."], None, DEEP),
    ("2", "ÉTAPE 1 · LA FACTURE", ["Une photo", "de votre", "facture."], ["Prise au téléphone, envoyée.", "C'est tout."], PAPER),  # repli du clip 5 s
    ("3", "ÉTAPE 2 · L'APPEL D'OFFRES", ["Tout le marché", "pertinent."], None, DEEP),
    ("4", "ÉTAPE 3 · LE COMPARATIF", ["Vous", "décidez."], None, PAPER),
    ("5", "ÉTAPE 4 · LE CHANGEMENT", ["Sans", "coupure."], None, DEEP),
    ("6", "ÉTAPE 5 · LE SUIVI", ["Alerte 12 à 24", "mois avant", "l'échéance."], ["Étude gratuite : lien en bio."], PAPER),
]
for n, eb, big, small, bg in steps:
    light = bg == PAPER
    text_slide(f"{o}/j42_ig_{n}.jpg", int(n), 6, eb, big, small, bg=bg, fg=INK if light else WHITE, acc=TEAL if light else MINT, size=150)

# ---------- J43 · jeudi 26/11 · Petit dictionnaire du Black Friday
o = out("2026-11-26")

def entry(path, word, definition, n=None, total=None, w=W, h=H, size=150):
    im = Image.new("RGB", (w, h), PAPER); d = ImageDraw.Draw(im); chrome(d, TEAL, n, total, w=w, h=h)
    d.text((80, 190), "PETIT DICTIONNAIRE DU BLACK FRIDAY", font=SANS(28, 800), fill=TEAL)
    d.line([(80, 250), (w - 80, 250)], fill=INK, width=2)
    f = SERIF(size); rows = wrap(d, word, f, w - 160)
    y = lines(d, rows, 80, 330, f, INK, int(size * 1.05))
    d.text((80, y + 10), "n.", font=SERIF(64), fill=TEAL)
    fd = SERIF(96); lines(d, wrap(d, definition, fd, w - 160), 80, y + 130, fd, INK, 108)
    im.save(path, quality=92); return path

li = [
    text_slide(f"{o}/j43_li_1.jpg", 1, 6, "À L'USAGE DES DIRIGEANTS", ["Petit", "dictionnaire", "du Black", "Friday."], bg=PAPER, fg=INK, acc=TEAL, size=150) or f"{o}/j43_li_1.jpg",
    entry(f"{o}/j43_li_2.jpg", "Offre exceptionnelle", "Offre de l'an prochain.", 2, 6),
    entry(f"{o}/j43_li_3.jpg", "Dernières heures", "Jusqu'à la prochaine opération.", 3, 6),
    entry(f"{o}/j43_li_4.jpg", "Prix jamais vus", "Vus l'an dernier.", 4, 6),
    text_slide(f"{o}/j43_li_5.jpg", 5, 6, "LE CHIFFRE", ["8 %"], ["des indépendants jugent le Black", "Friday « intéressant ».", "", "Source : L'echommerces / Boutique2Mode."], size=300) or f"{o}/j43_li_5.jpg",
    entry(f"{o}/j43_li_6.jpg", "Énergie", "Le bon prix se choisit, il ne se subit pas.", 6, 6),
]
pdf(li, f"{o}/j43_linkedin.pdf")
entry(f"{o}/j43_facebook.jpg", "Dernières heures", "Jusqu'à la prochaine fois.")
entry(f"{o}/j43_instagram.jpg", "Offre exceptionnelle", "Offre de l'an prochain.")
im = Image.new("RGB", (XW, XH), DEEP); d = ImageDraw.Draw(im); chrome(d, MINT, w=XW, h=XH)
d.text((80, 160), "8 %", font=SERIF(380), fill=WHITE)
lines(d, ["des commerçants indépendants jugent", "le Black Friday « intéressant »."], 80, 590, SANS(48, 600), MINT, 66)
d.text((XW - 80 - d.textlength("Source : L'echommerces / Boutique2Mode", font=SANS(26, 600)), XH - 106), "Source : L'echommerces / Boutique2Mode", font=SANS(26, 600), fill=MINT)
im.save(f"{o}/j43_x.jpg", quality=92)

for day in ("2026-11-21", "2026-11-23", "2026-11-25", "2026-11-26"):
    print(day, sorted(os.listdir(f"{ROOT}/{day}")))
