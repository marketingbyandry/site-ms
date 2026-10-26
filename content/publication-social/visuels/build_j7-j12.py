"""Visuels fixes J7, J8, J10, J12 de la campagne « Pas de -50 % » (même DA que J3/J5).
Photos J8 et J10 : Savee (voir CREDITS.txt du dossier Photos J6-J12). Facture J12 stylisée : aucun vrai fournisseur.
Usage : python3 build_j7-j12.py <dossier visuels>  → écrit 2026-10-21/, 2026-10-22/, 2026-10-24/, 2026-10-26/"""
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import os, sys, subprocess
ROOT = sys.argv[1]
FONTS = "/Users/andry/Movies/M&S Strategy/Campagne Pas de -50/J6 ce qui se negocie/sources/fonts"
PHOTOS = "/Users/andry/Movies/M&S Strategy/Campagne Pas de -50/Photos J6-J12"
W, H = 1080, 1350
DEEP, MINT, PAPER, INK, TEAL, SUN, GREY = (13, 61, 71), (212, 236, 238), (243, 238, 228), (15, 42, 49), (26, 122, 138), (244, 196, 98), (196, 204, 206)

def font(name, size, weight=None):
    f = ImageFont.truetype(f"{FONTS}/{name}", size)
    if weight:
        try: f.set_variation_by_axes([weight])
        except Exception: pass
    return f
SERIF = lambda s: font("InstrumentSerif-Regular.ttf", s)
SANS = lambda s, w=600: font("Manrope.ttf", s, w)

def chrome(d, fg, n=None, total=None, w=W, h=H):
    d.text((80, 70), "M&S Strategy", font=SERIF(46), fill=fg)
    if n:
        t = f"{n}/{total}"; d.text((w - 80 - d.textlength(t, font=SANS(30, 700)), 82), t, font=SANS(30, 700), fill=fg)
    d.text((80, h - 110), "cabinetms.fr", font=SANS(30, 600), fill=fg)

def lines(d, xs, x, y, f, fill, lh):
    for l in xs: d.text((x, y), l, font=f, fill=fill); y += lh
    return y

def text_slide(path, n, total, eyebrow, big, small=None, bg=DEEP, fg=(255, 255, 255), acc=MINT, size=150):
    im = Image.new("RGB", (W, H), bg); d = ImageDraw.Draw(im); chrome(d, acc, n, total)
    y = 330
    if eyebrow: d.text((80, y), eyebrow, font=SANS(32, 800), fill=acc); y += 80
    y = lines(d, big, 80, y, SERIF(size), fg, int(size * 1.05))
    if small: lines(d, small, 80, y + 40, SANS(44, 600), acc, 62)
    im.save(path, quality=92)

def cover(src, w, h, ax=0.5, ay=0.5):
    im = Image.open(src).convert("RGB"); sw, sh = im.size
    k = max(w / sw, h / sh); im = im.resize((round(sw * k), round(sh * k)), Image.LANCZOS)
    x = round((im.width - w) * ax); y = round((im.height - h) * ay)
    return im.crop((x, y, x + w, y + h))

def shade(im, frac=0.5, alpha=170):
    w, h = im.size; g = Image.new("L", (1, h))
    for y in range(h): g.putpixel((0, y), int(alpha * max(0, (y - h * frac) / (h * (1 - frac)))))
    return Image.composite(Image.new("RGB", (w, h), (0, 0, 0)), im, g.resize((w, h)))

# ---------- J7 · un courtier gratuit, ça cache quoi ? ----------
o = f"{ROOT}/2026-10-21"; os.makedirs(o, exist_ok=True)
text_slide(f"{o}/j7_ig_1.jpg", 1, 5, None, ["Gratuit,", "ça cache", "quoi ?"], size=190)
text_slide(f"{o}/j7_ig_2.jpg", 2, 5, "LA RÉPONSE", ["Une commission."], ["Payée par le fournisseur", "que vous choisissez."], bg=PAPER, fg=INK, acc=TEAL, size=150)
text_slide(f"{o}/j7_ig_4.jpg", 4, 5, "CE QUI CHANGE TOUT", ["Même", "commission,", "quel que soit", "le fournisseur."], size=130)
text_slide(f"{o}/j7_ig_5.jpg", 5, 5, "LA QUESTION À POSER", ["Comment", "êtes-vous", "payé ?"], ["À tout courtier, à tout comparateur."], bg=PAPER, fg=INK, acc=TEAL, size=170)
# slide 3 : clip 6 s, trois cartes fournisseur, la même étiquette tombe sur chacune
fd = f"{o}/_clip"; os.makedirs(fd, exist_ok=True)
FPS = 25
def card_frame(t):
    im = Image.new("RGB", (W, H), DEEP); d = ImageDraw.Draw(im); chrome(d, MINT, 3, 5)
    d.text((80, 200), "Trois fournisseurs,", font=SERIF(96), fill=(255, 255, 255))
    d.text((80, 300), "une seule commission.", font=SERIF(96), fill=MINT)
    cw, ch, gap = 270, 420, 45; x0 = (W - 3 * cw - 2 * gap) // 2; y0 = 520
    for i, lab in enumerate("ABC"):
        x = x0 + i * (cw + gap)
        d.rounded_rectangle((x, y0, x + cw, y0 + ch), radius=22, fill=PAPER)
        d.text((x + 30, y0 + 34), "FOURNISSEUR", font=SANS(26, 800), fill=TEAL)
        d.text((x + 30, y0 + 70), lab, font=SERIF(190), fill=INK)
        # étiquette identique qui tombe, décalée par carte
        p = min(1, max(0, (t - 1.0 - i * 0.9) / 0.5)); p = 1 - (1 - p) ** 3
        if p > 0:
            ty = int(y0 - 260 + (y0 + ch - 150 - (y0 - 260)) * p)
            d.rounded_rectangle((x + 20, ty, x + cw - 20, ty + 110), radius=16, fill=SUN)
            d.text((x + 40, ty + 18), "Même", font=SANS(30, 800), fill=INK)
            d.text((x + 40, ty + 56), "commission", font=SANS(30, 800), fill=INK)
    return im
for k in range(6 * FPS): card_frame(k / FPS).save(f"{fd}/c{k:04d}.png")
subprocess.run(["ffmpeg", "-v", "error", "-y", "-framerate", str(FPS), "-i", f"{fd}/c%04d.png", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "20", "-movflags", "+faststart", f"{o}/j7_ig_3.mp4"], check=True)
subprocess.run(["rm", "-rf", fd])

# ---------- J8 · le froid tourne même quand vous fermez (photo Savee py2f07L) ----------
o = f"{ROOT}/2026-10-22"; os.makedirs(o, exist_ok=True)
givre = f"{PHOTOS}/j8_givre_savee.jpg"
im = shade(cover(givre, W, H), 0.45, 190); d = ImageDraw.Draw(im); chrome(d, (255, 255, 255))
d.text((80, H - 560), "-1 °C", font=SERIF(240), fill=(255, 255, 255))
d.text((80, H - 330), "= environ +3 % d’énergie", font=SERIF(88), fill=MINT)
d.text((80, H - 200), "Source : Office fédéral de l’énergie (Suisse)", font=SANS(26, 600), fill=(230, 236, 238))
im.save(f"{o}/j8_instagram.jpg", quality=92)
im = cover(givre, W, H); d = ImageDraw.Draw(im)
im.save(f"{o}/j8_facebook.jpg", quality=92)
im = Image.new("RGB", (1600, 900), DEEP); d = ImageDraw.Draw(im)
im.paste(cover(givre, 560, 900), (1040, 0))
d.text((80, 70), "M&S Strategy", font=SERIF(46), fill=MINT)
d.text((80, 160), "ENVIRON", font=SANS(40, 800), fill=MINT)
d.text((80, 210), "3 %", font=SERIF(260), fill=(255, 255, 255))
lines(d, ["d’énergie en plus pour chaque", "degré de moins sur une", "chambre froide."], 80, 470, SANS(44, 600), MINT, 60)
d.text((80, 790), "Source : Office fédéral de l’énergie (Suisse) · cabinetms.fr", font=SANS(26, 600), fill=MINT)
im.save(f"{o}/j8_x.jpg", quality=92)

# ---------- J10 · le four, premier poste (photo Savee qOK8su-) ----------
o = f"{ROOT}/2026-10-24"; os.makedirs(o, exist_ok=True)
four = f"{PHOTOS}/j10_four_savee.jpg"
im = shade(cover(four, W, H, ay=0.45), 0.5, 190); d = ImageDraw.Draw(im); chrome(d, (255, 255, 255), 1, 4)
lines(d, ["Le premier poste", "de votre facture."], 80, H - 470, SERIF(116), (255, 255, 255), 122)
im.save(f"{o}/j10_ig_1.jpg", quality=92)
text_slide(f"{o}/j10_ig_2.jpg", 2, 4, "RÉFLEXE 1", ["Fournées", "regroupées."], ["Moins de préchauffes pour rien."], size=170)
text_slide(f"{o}/j10_ig_3.jpg", 3, 4, "RÉFLEXE 2", ["Joints", "vérifiés."], ["La chaleur reste dans le four."], size=170)
text_slide(f"{o}/j10_ig_4.jpg", 4, 4, "RÉFLEXE 3", ["Consignes", "ajustées."], ["Avant de changer de four,", "changez d’habitudes."], bg=PAPER, fg=INK, acc=TEAL, size=170)
cover(four, W, H, ay=0.45).save(f"{o}/j10_facebook.jpg", quality=92)

# ---------- J12 · la puissance souscrite que personne n'a revue ----------
o = f"{ROOT}/2026-10-26"; os.makedirs(o, exist_ok=True)
def invoice_kva(d, x, y, w):
    rows = [("Identification", "N° client · Point de livraison"), ("Puissance souscrite", "36 kVA"), ("Consommation", "kWh × prix du kWh"),
            ("Acheminement (TURPE)", "Transport et distribution"), ("Taxes et TVA", "Accise, contributions, TVA")]
    h = 110 + len(rows) * 120 + 60
    d.rounded_rectangle((x, y, x + w, y + h), radius=20, fill=(255, 255, 255))
    d.text((x + 40, y + 34), "FACTURE D’ÉLECTRICITÉ PRO", font=SANS(26, 800), fill=INK)
    cy = y + 110
    for i, (a, b) in enumerate(rows):
        hot = i == 1
        d.text((x + 40, cy), a, font=SANS(34 if hot else 28, 800 if hot else 600), fill=INK if hot else GREY)
        if hot:
            d.text((x + w - 40 - d.textlength(b, font=SANS(40, 800)), cy - 4), b, font=SANS(40, 800), fill=INK)
            d.rounded_rectangle((x + 16, cy - 26, x + w - 16, cy + 74), radius=40, outline=(214, 120, 46), width=8)
        else:
            d.text((x + 40, cy + 40), b, font=SANS(22, 500), fill=GREY)
            d.rounded_rectangle((x + w - 190, cy + 8, x + w - 40, cy + 28), radius=8, fill=(230, 234, 235))
        cy += 120
    return h
im = Image.new("RGB", (W, H), PAPER); d = ImageDraw.Draw(im); chrome(d, INK)
d.text((80, 170), "Elle date de", font=SERIF(104), fill=INK); d.text((80, 280), "l’ouverture ?", font=SERIF(104), fill=INK)
invoice_kva(d, 100, 460, 880)
im.save(f"{o}/j12_facebook.jpg", quality=92)
im = Image.new("RGB", (W, H), DEEP); d = ImageDraw.Draw(im); chrome(d, MINT, 1, 5)
d.text((60, 260), "kVA", font=SERIF(420), fill=(255, 255, 255))
lines(d, ["Choisie le jour de l’ouverture.", "Jamais revue ?"], 80, 820, SANS(52, 700), MINT, 72)
im.save(f"{o}/j12_ig_1.jpg", quality=92)
text_slide(f"{o}/j12_ig_2.jpg", 2, 5, "1", ["Elle fixe votre", "abonnement."], bg=PAPER, fg=INK, acc=TEAL, size=140)
text_slide(f"{o}/j12_ig_3.jpg", 3, 5, "2", ["Et votre", "TURPE."], bg=PAPER, fg=INK, acc=TEAL, size=170)
text_slide(f"{o}/j12_ig_4.jpg", 4, 5, "3", ["Même si vous", "ne consommez", "pas."], size=140)
text_slide(f"{o}/j12_ig_5.jpg", 5, 5, "LE BON RÉFLEXE", ["Comparez-la", "à vos pics", "réels."], bg=PAPER, fg=INK, acc=TEAL, size=150)
print("ok")
