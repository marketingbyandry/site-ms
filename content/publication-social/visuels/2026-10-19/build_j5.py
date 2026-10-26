"""J5 « lire sa facture en 5 blocs » : carrousel Instagram (6 slides 1080x1350), visuel Facebook (1080x1350), visuel X (1600x900).
Facture stylisée, pas une vraie facture de fournisseur : les montants sont des barres grises, aucun chiffre inventé."""
from PIL import Image, ImageDraw, ImageFont
import os, sys
OUT = sys.argv[1]; os.makedirs(OUT, exist_ok=True)
FONTS = "/Users/andry/.claude/jobs/c40c58ba/tmp/j2v/fonts"
DEEP, MINT, PAPER, INK, TEAL, GREY = (13, 61, 71), (212, 236, 238), (243, 238, 228), (15, 42, 49), (26, 122, 138), (196, 204, 206)
MARK = [(26, 122, 138), (214, 120, 46), (178, 71, 122), (59, 91, 181), (163, 67, 47)]
BLOCS = [("Identification", ["N° client", "Point de livraison", "Période facturée"]),
         ("Abonnement", ["Puissance souscrite (kVA)"]),
         ("Consommation", ["kWh consommés × prix du kWh"]),
         ("Acheminement (TURPE)", ["Transport et distribution"]),
         ("Taxes et TVA", ["Accise, contributions, TVA"])]
PHRASES = [("Qui, où,", "quelle période."), ("Votre puissance", "souscrite, chaque mois."), ("Vos kWh multipliés", "par leur prix."),
           ("Le transport", "de l’électricité."), ("Accise, contributions,", "puis TVA.")]

def font(name, size, weight=None):
    f = ImageFont.truetype(f"{FONTS}/{name}", size)
    if weight:
        try: f.set_variation_by_axes([weight])
        except Exception: pass
    return f
SERIF = lambda s: font("InstrumentSerif-Regular.ttf", s)
SANS = lambda s, w=600: font("Manrope.ttf", s, w)

def invoice(d, x, y, w, k=1.0, only=None, numbers=True):
    """Dessine la facture stylisée dans (x, y, largeur w) ; k = échelle. only = index du bloc surligné (les autres estompés)."""
    s = lambda v: int(v * k)
    rows = [s(150), s(70), s(70), s(70), s(70)]
    h = s(40) + s(60) + sum(rows) + s(30) * 5 + s(90)
    d.rounded_rectangle((x, y, x + w, y + h), radius=s(18), fill=(255, 255, 255))
    d.text((x + s(36), y + s(30)), "FACTURE D’ÉLECTRICITÉ PRO", font=SANS(s(26), 800), fill=INK)
    cy = y + s(100)
    for i, ((title, subs), rh) in enumerate(zip(BLOCS, rows)):
        dim = only is not None and only != i
        tc = GREY if dim else INK
        d.text((x + s(36), cy), title, font=SANS(s(26), 700), fill=tc)
        for j, sub in enumerate(subs):
            d.text((x + s(36), cy + s(36) + j * s(34)), sub, font=SANS(s(21), 500), fill=GREY if dim else (86, 112, 122))
        d.rounded_rectangle((x + w - s(170), cy + s(6), x + w - s(36), cy + s(26)), radius=s(8), fill=(230, 234, 235) if dim else GREY)
        if not dim and (only is not None or numbers):
            c = MARK[i]
            d.rounded_rectangle((x + s(14), cy - s(14), x + w - s(14), cy + rh + s(6)), radius=s(14), outline=c, width=max(3, s(6)))
            if numbers:
                r = s(28); cx, cyy = x + w - s(14), cy - s(14)
                d.ellipse((cx - r, cyy - r, cx + r, cyy + r), fill=c)
                t = str(i + 1); f = SANS(s(30), 800)
                d.text((cx - d.textlength(t, font=f) / 2, cyy - s(21)), t, font=f, fill=(255, 255, 255))
        cy += rh + s(30)
    d.line((x + s(36), cy, x + w - s(36), cy), fill=GREY, width=2)
    d.text((x + s(36), cy + s(22)), "TOTAL À PAYER", font=SANS(s(26), 800), fill=GREY if only is not None else INK)
    d.rounded_rectangle((x + w - s(220), cy + s(24), x + w - s(36), cy + s(52)), radius=s(8), fill=GREY)
    return h

def chrome(d, fg, n, W, H):
    d.text((80, 70), "M&S Strategy", font=SERIF(46), fill=fg)
    if n:
        t = f"{n}/6"; d.text((W - 80 - d.textlength(t, font=SANS(30, 700)), 82), t, font=SANS(30, 700), fill=fg)
    d.text((80, H - 110), "cabinetms.fr", font=SANS(30, 600), fill=fg)

W, H = 1080, 1350
# IG 1 : titre + facture numérotée
im = Image.new("RGB", (W, H), DEEP); d = ImageDraw.Draw(im); chrome(d, MINT, 1, W, H)
d.text((80, 170), "Votre facture,", font=SERIF(120), fill=(255, 255, 255))
d.text((80, 290), "en 5 blocs.", font=SERIF(120), fill=(255, 255, 255))
invoice(d, 150, 470, 780, k=0.95)
im.save(f"{OUT}/j5_ig_1.jpg", quality=92)
# IG 2 à 6 : un bloc par slide
for i in range(5):
    im = Image.new("RGB", (W, H), PAPER); d = ImageDraw.Draw(im); chrome(d, INK, i + 2, W, H)
    d.text((80, 170), f"BLOC {i + 1} · {BLOCS[i][0].upper()}", font=SANS(32, 800), fill=MARK[i])
    l1, l2 = PHRASES[i]
    d.text((80, 225), l1, font=SERIF(96), fill=INK)
    d.text((80, 325), l2, font=SERIF(96), fill=INK)
    invoice(d, 150, 490, 780, k=0.95, only=i, numbers=False)
    im.save(f"{OUT}/j5_ig_{i + 2}.jpg", quality=92)
# Facebook : la facture entourée et numérotée, 4:5
im = Image.new("RGB", (W, H), PAPER); d = ImageDraw.Draw(im); chrome(d, INK, None, W, H)
d.text((80, 160), "Entourez ces 5 blocs.", font=SERIF(96), fill=INK)
invoice(d, 110, 330, 860, k=1.05)
im.save(f"{OUT}/j5_facebook.jpg", quality=92)
# X : 16:9
W2, H2 = 1600, 900
im = Image.new("RGB", (W2, H2), DEEP); d = ImageDraw.Draw(im)
d.text((80, 70), "M&S Strategy", font=SERIF(46), fill=MINT)
d.text((80, 250), "5 blocs.", font=SERIF(140), fill=(255, 255, 255))
d.text((80, 400), "On n’en lit qu’un :", font=SERIF(76), fill=MINT)
d.text((80, 490), "le total.", font=SERIF(76), fill=MINT)
d.text((80, H2 - 110), "cabinetms.fr", font=SANS(30, 600), fill=MINT)
invoice(d, 880, 90, 640, k=0.78)
im.save(f"{OUT}/j5_x.jpg", quality=92)
print("ok", sorted(os.listdir(OUT)))
