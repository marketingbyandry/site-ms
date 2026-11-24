"""Scènes continues (pano) et dessins au trait (affiches). Tout est stylisé : aucune donnée inventée."""
import math
from moteur import *
def T(x, y, t, s, c, a="middle", k="", o=1): return f'<text class="{k}" x="{x}" y="{y}" font-size="{s}" fill="{c}" fill-opacity="{o}" text-anchor="{a}">{t.replace("&","&amp;")}</text>'
def R(x, y, w, h, f="none", st="none", sw=6, r=0, o=1): return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" fill="{f}" stroke="{st}" stroke-width="{sw}" opacity="{o}"/>'
def C(x, y, r, f="none", st="none", sw=6): return f'<circle cx="{x}" cy="{y}" r="{r}" fill="{f}" stroke="{st}" stroke-width="{sw}"/>'
def P(d, st="none", sw=6, f="none", dash="", o=1): return f'<path d="{d}" fill="{f}" stroke="{st}" stroke-width="{sw}" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="{dash}" opacity="{o}"/>'
def G(inner, x=0, y=0, s=1, rot=0): return f'<g transform="translate({x} {y}) rotate({rot}) scale({s})">{inner}</g>'
curve = lambda pts: "M" + " L".join(f"{x:.1f} {y:.1f}" for x, y in pts)

# --- objets réutilisables (origine = coin haut gauche, env. 300x400) ---
def facture(c=INK, p="#fff", hl=None, h=380):
    s = P(f"M0 0H230L290 60V{h}H0Z", c, 6, p) + P("M230 0V60H290", c, 6) + R(30, 40, 120, 22, c)
    for k in range(5):
        y = 110 + k*48
        if y > h-40: break
        if hl == k: s += R(18, y-14, 254, 40, SUN)
        s += R(30, y, 130, 10, c) + R(210, y, 50, 10, c)
    return s
def telephone(inner="", c=INK, p="#fff"): return R(0, 0, 260, 480, p, c, 8, 34) + R(90, 18, 80, 12, c, r=6) + inner
def cadenas(c=INK, f=SUN): return P("M50 170V105A75 75 0 0 1 200 105V170", c, 26) + R(0, 165, 250, 210, f, c, 8, 22) + C(125, 250, 26, c) + R(114, 255, 22, 70, c, r=8)
def ampoule(c=INK, f=SUN): return C(100, 100, 92, f, c, 8) + P("M68 190H132M72 216H128M82 240H118", c, 12) + P("M75 110L100 135L125 110M100 135V182", c, 7)
def devanture(c=INK, f="#fff", lit=SUN, h=360):
    s = R(0, 60, 320, h-60, f, c, 7)
    for k in range(8): s += P(f"M{k*40} 60h40v45a20 20 0 0 1 -40 0Z", c, 4, TEAL if k % 2 else "#fff")
    return s + R(0, 20, 320, 42, f, c, 7) + R(25, 150, 160, 130, lit, c, 6) + R(215, 150, 75, h-150, lit, c, 6) + C(230, 260, 5, c)
def loupe(c=INK): return C(90, 90, 80, "rgba(255,255,255,.35)", c, 14) + P("M150 150L240 240", c, 26)
def horloge(c=INK, h=12, m=0):
    a, b = math.radians(h*30+m/2-90), math.radians(m*6-90)
    return C(120, 120, 112, "#fff", c, 10) + P(f"M120 120L{120+55*math.cos(a)} {120+55*math.sin(a)}M120 120L{120+85*math.cos(b)} {120+85*math.sin(b)}", c, 10)
def coche(c=TEAL): return P("M0 40L35 75L100 0", c, 18)
def croix(c=RED): return P("M0 0L80 80M80 0L0 80", c, 18)
def page_cal(t, c=INK, f="#fff", sub=""): return R(0, 20, 220, 220, f, c, 7, 14) + R(0, 20, 220, 60, RED, c, 7, 14) + P("M55 0V45M165 0V45", c, 12) + T(110, 180, t, 84, c, k="s") + T(110, 222, sub, 24, c)
def prise(c=INK): return P("M60 0V60M120 0V60", c, 16) + P("M25 60H155V110A65 65 0 0 1 25 110Z", c, 8, SUN) + P("M90 175V260", c, 14)
def enveloppe(c=INK, f="#e2c79b", inside=None): return R(0, 80, 340, 230, f, c, 7, 10) + (inside or "") + P("M0 85L170 220L340 85", c, 7)
def etiquette(t, c=INK, f="#e2c79b"): return P("M40 0H200L240 45V250H0V45Z", c, 6, f) + C(120, 40, 14, DEEP, c, 4) + T(120, 160, t, 44 if len(t) < 7 else 34, c, k="s")
def bouton(c=INK, a=-40): return C(170, 170, 150, "#fff", c, 10) + "".join(P(f"M{170+166*math.cos(math.radians(d))} {170+166*math.sin(math.radians(d))}L{170+190*math.cos(math.radians(d))} {170+190*math.sin(math.radians(d))}", c, 7) for d in range(140, 401, 26)) + P(f"M170 170L{170+120*math.cos(math.radians(a))} {170+120*math.sin(math.radians(a))}", SUN, 22)
def porte(n, inner="", ouvert=True):
    s = R(250, 0, 520, 560, PAPER, INK, 6) + inner
    s += P("M250 0L60 50V610L250 560Z", INK, 6, "#b5462f") + T(150, 350, str(n), 150, "#fff", k="s")
    return s
def jauge(v, c=INK):
    s = ""
    for k, col in enumerate((TEAL, TEAL, "#7fb5a4", SUN, "#e08a45", RED)):
        a, b = math.pi + k*math.pi/6, math.pi + (k+1)*math.pi/6 - .03
        s += P(f"M{300+250*math.cos(a)} {300+250*math.sin(a)}A250 250 0 0 1 {300+250*math.cos(b)} {300+250*math.sin(b)}", col, 60).replace('linecap="round"', 'linecap="butt"')
    a = math.pi + v*math.pi
    return s + P(f"M300 300L{300+190*math.cos(a)} {300+190*math.sin(a)}", c, 12) + C(300, 300, 22, c)
def index(t, ok, c=INK):
    s = ""
    for k, ch in enumerate(t): s += R(k*92, 0, 82, 118, "#fff" if ok else "none", c, 6, 8) + T(k*92+41, 88, ch, 80, c, k="s")
    return s

# --- scènes continues ---
def sc_cartes(n, fg, acc):
    s = P(f"M0 1130H{W*n}", acc, 4, o=.5)
    for k in range(n*2-1):
        x = 330 + k*(W*n-660-400)/(n*2-2); rot = -5 if k % 2 else 4
        s += G(R(0, 0, 400, 430, PAPER, "none", r=24) + T(200, 130, "Fournisseur", 46, INK, k="s") + T(200, 235, "ABCDEFGHI"[k], 120, TEAL, k="s") + R(40, 300, 320, 92, SUN, r=12) + T(200, 338, "COMMISSION", 24, INK) + T(200, 374, "identique", 34, INK, k="s"), x, 660, 1, rot)
    return s
def sc_chemin(n, fg, acc):
    y = lambda x: 960 + 110*math.sin(x/430)
    s = P(curve([(x, y(x)) for x in range(0, W*n+1, 12)]), SUN, 14)
    obj = [G(facture(INK, "#fff"), -145, -200, .9), G(telephone(facture(INK, PAPER, h=260).join(["<g transform='translate(50 90) scale(.55)'>", "</g>"])), -130, -240, .9), G(loupe("#fff"), -120, -120, 1.3), G(C(0, 0, 150, SUN) + G(coche(INK), -80, -60, 1.6))]
    for i in range(n): s += G(obj[min(i, 3)] if i < n-1 else obj[3], W*i+640, y(W*i+640))
    return s
def sc_fige(n, fg, acc):
    xc = int(W*(n-1)*.5)+300; y = lambda x: 930 + 90*math.sin(x/95) + 60*math.sin(x/41)
    yl = y(xc); pts = [(x, y(x)) for x in range(0, xc, 5)]
    return P(curve(pts), acc, 10) + P(f"M{xc} {yl}H{W*n}", SUN, 14) + P(curve([(x, y(x)) for x in range(xc, W*n, 5)]), acc, 6, dash="4 18", o=.6) + G(cadenas(fg if fg != "#fff" else INK, SUN), xc-60, yl-230, .95) + T(W*n-90, yl-36, "le prix signé", 34, SUN if fg == "#fff" else TEAL, "end") + T(W*n-90, 1130, "le marché, lui, continue", 34, acc, "end")
def sc_frise(n, fg, acc, labs=(("J-36", "anticipé"), ("J-24", "idéal"), ("J-18", "idéal"), ("J-12", "optimal"), ("J-6", "tardif"), ("J-1", "critique"))):
    s = P(f"M0 960H{W*n}", acc, 8); m = len(labs); col = [TEAL, SUN, SUN, SUN, "#e08a45", RED]
    x = lambda k: W*n*(k+.5)/m
    s += R(x(1)-30, 925, x(3)-x(1)+60, 70, SUN, r=35)
    for k, (a, b) in enumerate(labs): s += C(x(k), 960, 34, col[k], fg, 8) + T(x(k), 870, a, 84, fg, k="s") + T(x(k), 1070, b, 40, acc)
    return s + T(W*n-60, 1180, "mois avant l'échéance", 30, acc, "end")
def sc_boutique(n, fg, acc):
    s = P(f"M0 1180H{W*n}", acc, 5)
    for i in range(n):
        x = W*i
        s += R(x+50, 680, 980, 500, "none", acc, 6)
        if i == 0: s += G(devanture(INK, PAPER, SUN, 430), x+330, 750, 1.2)
        elif i == 1: s += R(x+150, 780, 560, 330, SUN, fg, 8, o=1) + "".join(R(x+200+k*120, 960-k%2*40, 80, 150+k%2*40, PAPER, INK, 5) for k in range(4)) + G(horloge(INK, 21, 0), x+760, 820)
        else: s += "".join(P(f"M{x+130} {800+k*130}H{x+600}", fg, 10) + "".join(R(x+150+q*105, 720+k*130, 80, 76, "#c9a77a", INK, 4) for q in range(4)) for k in range(3)) + C(x+810, 800, 46, SUN) + P(f"M{x+810} 846L{x+640} 1150H{x+980}Z", f=SUN, o=.28) + P(f"M{x+800} 1060v-70a22 22 0 1 1 20 0v70M{x+770} 1150l30-90h20l30 90", fg, 14)
    return s
def sc_thermo(n, fg, acc):
    L = W*n; s = R(110, 880, L-220, 110, "#fff", INK, 8, 55) + C(150, 935, 105, TEAL, INK, 8)
    s += R(150, 907, (L-400), 56, TEAL, r=28)
    for k in range(0, (L-420)//60): s += P(f"M{330+k*60} 1010v{46 if k%5==0 else 26}", acc, 6)
    return s + T(L-330, 1130, "moins froid", 38, acc) + T(400, 1130, "très froid", 38, acc)
def sc_pics(n, fg, acc):
    L = W*n; y = lambda x: 1150 - 150 - 60*math.sin(x/170)**2 - 60*abs(math.sin(x/60)) - 190*math.exp(-((x-(L-480))/150)**2)
    pts = [(x, y(x)) for x in range(0, L+1, 6)]
    return P(curve(pts)+f" L{L} 1180 L0 1180Z", f=TEAL, o=.8) + P(curve(pts), acc, 8) + P(f"M0 880H{L}", RED, 8, dash="26 16") + T(90, 850, "puissance souscrite", 36, fg, "start") + G(T(0, 0, "un dimanche de décembre", 34, SUN), L-480, 690)
def sc_fusion(n, fg, acc):
    L = W*n; xm = L-W+200
    s = P(f"M0 800H{xm-500}C{xm-200} 800 {xm-300} 960 {xm} 960", SUN, 16) + P(f"M0 1110H{xm-500}C{xm-200} 1110 {xm-300} 960 {xm} 960", acc, 16) + P(f"M{xm} 960H{L}", fg, 24)
    s += T(90, 770, "électricité", 40, SUN, "start") + T(90, 1080, "gaz", 40, acc, "start")
    for x, yy, c in ((500, 800, SUN), (880, 1110, acc)): s += C(x, yy, 30, DEEP, c, 12)
    for k in range(1, n-1): s += C(W*k+300, 800, 30, DEEP, SUN, 12) + C(W*k+760 if W*k+760 < xm-500 else xm-520, 1110, 30, DEEP, acc, 12)
    return s + C(xm+430, 960, 62, SUN, fg, 14)
def sc_metre(n, fg, acc):
    L = W*n; s = C(250, 900, 190, SUN, INK, 10) + C(250, 900, 70, PAPER, INK, 10) + R(250, 985, L-250, 105, SUN, INK, 8)
    for k in range((L-520)//36): s += P(f"M{500+k*36} 985v{58 if k%5==0 else 32}", INK, 5)
    for k in range(n*2):
        x = 500+36*15*k
        if 600 < x < L-100: x = clair(x, 150); s += T(x+8, 1075, f"{k*250} m²", 34, INK, "start")
    return s
def sc_nuit(n, fg, acc):
    L = W*n; s = R(0, 1185, L, 170, "#000", o=.35)
    for k in range(L//430+1):
        x = k*430+20; last = k == L//430-1
        s += G(devanture("#3b5a61", "#16333a", SUN if last else "#0c2228", 420), x, 745, 1.05)
        if last: s += P(f"M{x+30} 1040L{x-60} 1215H{x+300}L{x+215} 1040Z", f=SUN, o=.25)
    for k in range(n*14): s += C((k*313) % L, 620+(k*97) % 130, 3, "#fff")
    return s
def sc_parking(n, fg, acc):
    L = W*n; s = R(0, 740, L, 450, "#000", o=.25)
    for k in range(L//300+1): s += P(f"M{k*300} 760V1170", fg, 9)
    for k in range(L//300):
        x = k*300+150
        if k % 3 == 2: s += G(prise(fg), x-80, 850, .9)
        elif k % 3 == 0: s += T(x, 1010, "P", 150, SUN, k="s")
        else: s += R(x-85, 820, 170, 310, TEAL, fg, 7, 50) + R(x-62, 890, 124, 70, MINT, r=16) + R(x-62, 1030, 124, 50, MINT, r=16)
    return s
def sc_froid(n, fg, acc):
    L = W*n; s = P(f"M0 1180H{L}", acc, 5)
    for k in range(n):
        x = W*k+260; open_ = k == 0
        s += R(x, 690, 420, 490, PAPER, INK, 8, 18) + P(f"M{x} 900H{x+420}", INK, 8) + R(x+350, 740, 22, 110, INK, r=8) + R(x+350, 940, 22, 150, INK, r=8) + T(x+150, 830, "24h/24", 76, TEAL, k="s")
        for q in range(3): s += P(f"M{x-150+q*30} {780+q*110}q30 -28 60 0t60 0", acc, 8) + P(f"M{x+470+q*30} {780+q*110}q30 -28 60 0t60 0", acc, 8)
    return s
def sc_niveau(n, fg, acc):
    L = W*n; s = ""
    pts = [(x, 1060-60*math.sin(x/120)-80*math.sin(x/310)) for x in range(0, L+1, 6)]
    s += P(curve(pts)+f" L{L} 1190 L0 1190Z", f=TEAL) + P(curve(pts), acc, 8)
    for k in range(n):
        y = [760, 760, 760, 730, 1040, 905][k % 6]; nx = W*(k+1)
        s += P(f"M{W*k} {y}H{nx}", SUN, 14) + (P(f"M{nx} {y}V{[760,760,730,1040,905,905][k%6]}", SUN, 14) if k < n-1 else "")
    return s + T(90, 735, "puissance souscrite", 34, SUN, "start") + T(90, 1170, "pics réels", 34, "#fff", "start")
def clair(x, m=130):
    r = x % W
    return x + (m-r if r < m else (W-m-r if r > W-m else 0))
def sc_jauge(n, fg, acc):
    L = W*n; m = 5; labs = ["anticipé", "idéal", "optimal", "tardif", "critique"]; col = [TEAL, "#5fae9a", SUN, "#e08a45", RED]; s = ""
    for k in range(m): s += R(L*k/m, 1060, L/m, 70, col[k]) + T(clair(L*(k+.5)/m), 1180, labs[k], 38, fg)
    s += G(telephone(R(40, 70, 180, 26, TEAL) + R(40, 130, 180, 60, PAPER, INK, 4) + R(40, 215, 180, 60, PAPER, INK, 4) + R(40, 300, 180, 60, PAPER, INK, 4) + R(40, 385, 180, 50, SUN) + T(130, 418, "exemple", 24, INK)), W+380 if n > 2 else 380, 640, .82)
    obj = {0: G(horloge(INK, 12, 15), 400, 740, 1.1), 2: G(jauge(.5, fg), 270, 700, .9) if n < 6 else G(facture(), 400, 700, .85), 3: G(page_cal("1", sub="décembre"), 420, 740, 1.1) if n < 6 else G(page_cal("24", sub="mois"), 420, 740, 1.1), 4: G(jauge(.5, fg), 270, 700, .9), 5: G(page_cal("1", sub="décembre"), 420, 740, 1.1)}
    return s + "".join(G(obj[i], W*i, 0) for i in obj if i < n)
def sc_baro(n, fg, acc):
    L = W*n; s = P(f"M0 1140H{L}", acc, 5); data = [("juin", 73.66), ("juil.", 103.90), ("août", None), ("sept.", 149.75)]
    s += G(loupe(fg), 400, 780, 1.3) + G(page_cal("mois", sub="électricité"), W+400, 760, 1.35) + G(page_cal("trim.", sub="gaz"), 2*W+400, 760, 1.35) + C(4*W+540, 920, 160, SUN) + G(coche(INK), 4*W+455, 865, 1.6)
    for k, (m, v) in enumerate(data):
        x = 3*W+85+k*235
        if v: s += R(x, 1140-v*2.4, 190, v*2.4, SUN if k == 3 else acc) + T(x+95, 1140-v*2.4-18, f"{v:.2f}".replace(".", ","), 50, fg, k="s")
        else: s += R(x, 1000, 190, 140, "none", acc, 4) + T(x+95, 1080, "non publié", 28, acc)
        s += T(x+95, 1185, m, 32, acc)
    return s
