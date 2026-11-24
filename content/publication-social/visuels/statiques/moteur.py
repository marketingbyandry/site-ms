"""Moteur des visuels fixes : HTML/SVG rendus par Chrome (aucune image générée, 0 crédit).
3 formats de carrousel : pano (scène continue), objet (recto-verso), ticket (qui s'imprime)."""
import os, re, subprocess, tempfile, html, math
from PIL import Image
FONTS = "/Users/andry/Movies/M&S Strategy/Campagne Pas de -50/J6 ce qui se negocie/sources/fonts"
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
W, H = 1080, 1350
DEEP, MINT, PAPER, INK, TEAL, SUN, BLACK, RED = "#0d3d47", "#d4ecee", "#f3eee4", "#0f2a31", "#1a7a8a", "#f4c462", "#0c0c0c", "#c8452f"
NB = " "
def typo(t):
    t = html.escape(t, quote=False).replace("'", "’")
    t = re.sub(r" ([?!:;%»€])", NB + r"\1", t).replace("« ", "«" + NB)
    t = re.sub(r"(\d) (kVA|mois|m²|jours|minutes|€|h\b)", r"\1" + NB + r"\2", t)
    t = t.replace("-&gt;", '<svg class="ar" viewBox="0 0 60 30"><path d="M2 15H54M42 3L56 15L42 27" fill="none" stroke="currentColor" stroke-width="5"/></svg>')
    t = re.sub(r"(?<![\w<=\"/])([^\W\d_]+-[^\W\d_]+)(?![\w=\"])", r'<span style="white-space:nowrap">\1</span>', t) if "<svg" not in t else t
    return re.sub(r"\*(.+?)\*", r"<mark>\1</mark>", t).replace("|", "<br>")

CSS = f"""@font-face{{font-family:IS;src:url('file://{FONTS}/InstrumentSerif-Regular.ttf')}}
@font-face{{font-family:MR;src:url('file://{FONTS}/Manrope.ttf');font-weight:200 800}}
*{{box-sizing:border-box;margin:0;padding:0}} html,body{{overflow:hidden;background:#fff}} body{{position:relative;font-family:MR;-webkit-font-smoothing:antialiased}}
.abs{{position:absolute}} .big{{font-family:IS;line-height:1.02;padding-top:.14em;margin-top:-.14em;letter-spacing:-.012em;text-wrap:balance}} .eb{{font-weight:800;font-size:29px;letter-spacing:.07em;text-transform:uppercase}}
.sm{{font-weight:600;font-size:40px;line-height:1.35}} mark{{background:none;color:{SUN}}} .ar{{height:.5em;display:inline-block;vertical-align:.08em;margin:0 .12em}}
.mono{{font-family:Menlo,monospace}} .fit{{overflow:hidden}} svg text{{font-family:MR;font-weight:700}} svg .s{{font-family:IS;font-weight:400}}
.lp mark{{color:{TEAL}}}"""
JS = """document.fonts.ready.then(async()=>{await Promise.all([document.fonts.load('50px IS'),document.fonts.load('700 50px MR')]);
for(const e of document.querySelectorAll('.fit')){let s=+e.dataset.s;e.style.fontSize=s+'px';while((e.scrollHeight>e.clientHeight||e.scrollWidth>e.clientWidth)&&s>26){s-=2;e.style.fontSize=s+'px'}}})"""

def shoot(body, w, h):
    with tempfile.TemporaryDirectory() as t:
        p, o = f"{t}/a.html", f"{t}/a.png"
        open(p, "w").write(f"<!doctype html><meta charset=utf-8><style>{CSS} body{{width:{w}px;height:{h}px}}</style><body>{body}<script>{JS}</script>")
        subprocess.run([CHROME, "--headless=new", "--disable-gpu", "--hide-scrollbars", "--force-device-scale-factor=1", f"--user-data-dir={t}/u", f"--window-size={w},{h+120}", "--virtual-time-budget=3000", f"--screenshot={o}", "file://" + p], capture_output=True, timeout=90)
        return Image.open(o).convert("RGB").crop((0, 0, w, h))

def chrome(x, fg, n=None, tot=None, w=W, h=H):
    r = f'<div class="abs" style="left:{x+w-240}px;top:78px;width:160px;text-align:right;font-weight:700;font-size:30px;color:{fg}">{n}/{tot}</div>' if n and tot > 1 else ""
    return f'<div class="abs" style="left:{x+80}px;top:62px;font:46px IS;color:{fg}">M&amp;S Strategy</div>{r}<div class="abs" style="left:{x+80}px;top:{h-112}px;font-weight:600;font-size:30px;color:{fg}">cabinetms.fr</div>'

def fit(x, y, w, h, t, s, fg, cls="big", extra=""):
    return f'<div class="abs fit {cls}" data-s="{s}" style="left:{x}px;top:{y}px;width:{w}px;max-height:{h}px;height:{h}px;color:{fg};{extra}">{("<div>"+typo(t)+"</div>") if "flex" in extra else typo(t)}</div>'
def svg(x, y, w, h, inner, extra=""):
    return f'<svg class="abs" style="left:{x}px;top:{y}px;{extra}" width="{w}" height="{h}" viewBox="0 0 {w} {h}">{inner}</svg>'

# ---------- FORMAT 1 : PANORAMA ----------
def pano(slides, scene, bg=DEEP, fg="#fff", acc=MINT):
    """Texte en haut ; scene(largeur, accent) dessine une bande continue entre y=640 et y=1210, qui traverse les coupures."""
    n = len(slides); lp = "lp" if bg == PAPER else ""
    b = f'<div class="abs {lp}" style="left:0;top:0;width:{W*n}px;height:{H}px;background:{bg}">' + svg(0, 0, W*n, H, scene(n, fg, acc))
    for i, s in enumerate(slides):
        eb, big, sm = (list(s) + [None, None])[:3]; x = W*i
        b += chrome(x, acc, i+1, n)
        if eb: b += f'<div class="abs eb" style="left:{x+80}px;top:178px;width:900px;color:{acc}">{typo(eb)}</div>'
        b += fit(x+80, 235, 920, 330 if sm else 400, big, 138, fg)
        if sm: b += fit(x+80, 575, 900, 110, sm, 36, acc, "sm")
    return cut(shoot(b + "</div>", W*n, H), n)
def cut(im, n): return [im.crop((W*i, 0, W*(i+1), H)) for i in range(n)]

# ---------- FORMAT 2 : OBJET (recto-verso) ----------
def objet(slides, kind="tag", bg=DEEP, acc=MINT, num=None):
    n = len(slides); b = f'<div class="abs" style="left:0;top:0;width:{W*n}px;height:{H}px;background:{bg}">'
    tilt = [-4, 3, -2, 3, -3, 2]
    if kind == "tag":   # ficelle continue
        pts = "M-20 330 " + " ".join(f"Q{W*i+W//2} {250 if i%2 else 190} {W*(i+1)} 330" for i in range(n))
        b += svg(0, 0, W*n, H, f'<path d="{pts}" fill="none" stroke="{acc}" stroke-width="5" opacity=".75"/>')
    for i, s in enumerate(slides):
        eb, big, sm = (list(s) + [None, None])[:3]; x = W*i; back = i > 0
        b += chrome(x, acc, i+1, n)
        if kind == "tag":
            face = "#e2c79b" if not back else PAPER
            inner = svg(0, 0, 800, 800, f'<path d="M130 0H670L800 130V760Q800 800 760 800H40Q0 800 0 760V130Z" fill="{face}"/><path d="M144 26H656L774 144V750Q774 774 750 774H50Q26 774 26 750V144Z" fill="none" stroke="{INK}" stroke-opacity=".25" stroke-width="3" stroke-dasharray="10 9"/><circle cx="400" cy="92" r="32" fill="{bg}"/><circle cx="400" cy="92" r="42" fill="none" stroke="{TEAL}" stroke-width="9"/>')
            inner += f'<div class="abs eb" style="left:70px;top:190px;width:660px;text-align:center;color:{TEAL}">{typo(eb or "")}</div>'
            inner += fit(60, 250, 680, 330 if sm else 460, big, 150, INK, "big lp", "text-align:center;display:flex;align-items:center;justify-content:center;flex-direction:column")
            if sm: inner += fit(80, 600, 640, 140, sm, 38, INK, "sm", "text-align:center")
            b += svg(x, 150, W, 400, f'<path d="M540 108Q{520 if i%2 else 565} 170 540 230" fill="none" stroke="{acc}" stroke-width="5"/>')
            b += f'<div class="abs" style="left:{x+140}px;top:290px;width:800px;height:800px;transform:rotate({tilt[i%6]}deg);transform-origin:400px 92px;filter:drop-shadow(0 28px 34px rgba(0,0,0,.35))">{inner}</div>'
        elif kind == "door":
            # calendrier : grille de petites portes en fond, grande porte au centre
            g = ""
            for r in range(1, 6):
                for c in range(5):
                    k = r*5+c
                    g += f'<rect x="{30+c*208}" y="{160+r*180}" width="188" height="160" rx="8" fill="none" stroke="{acc}" stroke-opacity=".16" stroke-width="3"/><text class="s" x="{124+c*208}" y="{262+r*180}" font-size="66" fill="{acc}" fill-opacity=".13" text-anchor="middle">{(k*7+i*3)%24+1}</text>'
            b += svg(x, 0, W, H, g)
            if not back:
                d = f'<rect x="150" y="270" width="780" height="850" fill="{SUN}"/><path d="M150 270L760 330V1180L150 1120Z" fill="#b5462f"/><path d="M190 318L722 370V1126L190 1076Z" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="4"/><circle cx="705" cy="760" r="17" fill="{SUN}"/><text class="s" x="455" y="850" font-size="420" fill="#fff" text-anchor="middle" transform="skewY(5.6)" transform-origin="455 730">{num}</text>'
                b += svg(x, 45, W, H, d, "filter:drop-shadow(0 24px 34px rgba(0,0,0,.4))")
                b += f'<div class="abs eb" style="left:{x+80}px;top:160px;color:{acc}">{typo(eb or "L’Avent des charges")}</div>'
                b += fit(x+80, 212, 920, 100, big, 78, "#fff") if big else ""
            else:
                d = f'<path d="M20 330L150 270V1120L20 1180Z" fill="#8f3524"/><rect x="150" y="270" width="780" height="850" fill="{PAPER}"/><rect x="150" y="270" width="780" height="24" fill="#000" opacity=".12"/><rect x="150" y="270" width="18" height="850" fill="#000" opacity=".12"/>'
                b += svg(x, 0, W, H, d, "filter:drop-shadow(0 24px 34px rgba(0,0,0,.4))")
                b += f'<div class="abs eb" style="left:{x+220}px;top:350px;width:660px;color:{TEAL}">{typo(eb or f"Case {num}")}</div>'
                b += fit(x+220, 430, 660, 440 if sm else 620, big, 140, INK, "big lp")
                if sm: b += fit(x+220, 900, 650, 180, sm, 38, TEAL, "sm")
        else:  # carte lexique : pile de cartes
            for k, (rot, col) in enumerate(((7, TEAL), (-5, SUN), (0, PAPER))):
                off = tilt[i % 6] * .5
                inner = ""
                if k == 2:
                    inner = f'<div class="abs eb" style="left:64px;top:64px;color:{TEAL}">{typo(eb or "Lexique")}</div><div class="abs" style="left:64px;right:64px;top:124px;height:3px;background:{INK}"></div>'
                    inner += fit(64, 190, 692, 420 if sm else 640, big, 160, INK, "big lp")
                    if sm: inner += fit(64, 640, 692, 210, sm, 42, TEAL, "sm")
                b += f'<div class="abs" style="left:{x+130}px;top:230px;width:820px;height:900px;border-radius:26px;background:{col};transform:rotate({rot+off}deg);box-shadow:0 18px 40px rgba(0,0,0,.25)">{inner}</div>'
    return cut(shoot(b + "</div>", W*n, H), n)

# ---------- FORMAT 3 : TICKET ----------
def ticket(slides, head="TICKET", bg=TEAL, acc="#fff", paper="#fbfaf6", foot="MERCI DE VOTRE VISITE"):
    """Chaque slide imprime une ligne de plus ; les lignes passées remontent en petit, la nouvelle est en grand."""
    n = len(slides); b = f'<div class="abs" style="left:0;top:0;width:{W*n}px;height:{H}px;background:{bg}">'
    for i, s in enumerate(slides):
        eb, big, sm = (list(s) + [None, None])[:3]; x = W*i; last = i == n-1
        prev = [p[3] for p in slides[:i] if len(p) > 3 and p[3]]
        Y0 = 170; bot = 1180 if last else min(1180, int(760 + 420*i/max(1,n-1)))
        zig = "".join(f"L{820-20*k} {bot-Y0-(18 if k%2 else 0)}" for k in range(0, 42))
        b += svg(x+130, Y0, 820, bot-Y0+10, f'<path d="M0 0H820V{bot-Y0} {zig} L0 0Z" fill="{paper}"/>', "filter:drop-shadow(0 20px 26px rgba(0,0,0,.28))")
        b += f'<div class="abs" style="left:{x+96}px;top:150px;width:888px;height:34px;border-radius:17px;background:{INK}"></div><div class="abs" style="left:{x+130}px;top:167px;width:820px;height:10px;background:linear-gradient(rgba(0,0,0,.35),transparent);top:184px"></div>'
        b += chrome(x, acc, i+1, n)
        b += f'<div class="abs mono" style="left:{x+190}px;top:222px;width:700px;display:flex;justify-content:space-between;font-size:27px;letter-spacing:.05em;color:{INK}"><b>{typo(head)}</b><span>{i+1:02d}/{n:02d}</span></div><div class="abs" style="left:{x+190}px;top:276px;width:700px;border-top:4px dashed {INK}"></div>'
        for k, p in enumerate(prev):
            a, _, c = p.partition("::")
            b += f'<div class="abs mono" style="left:{x+190}px;top:{298+47*k}px;width:700px;display:flex;justify-content:space-between;font-size:27px;color:{INK};opacity:.62;white-space:nowrap"><span>{typo(a)}</span><span>{typo(c)}</span></div>'
        y = 310 + 47*len(prev) + (30 if prev else 10)
        if prev: b += f'<div class="abs" style="left:{x+190}px;top:{y-18}px;width:700px;border-top:3px dashed {INK};opacity:.5"></div>'
        if eb: b += f'<div class="abs eb" style="left:{x+190}px;top:{y+16}px;width:700px;color:{TEAL}">{typo(eb)}</div>'; y += 74
        end = bot - (215 if last else 40); room = end - y - (170 if sm else 0)
        room = max(room, 180)
        b += fit(x+190, y+10, 700, room, big, 150, INK, "big lp")
        if sm: b += fit(x+190, end-160, 700, 150, sm, 36, TEAL, "sm")
        if last:
            bars = "".join(f'<rect x="{6+q*11}" width="{[3,6,2,8,4][q*q%5]}" height="80" fill="{INK}"/>' for q in range(63))
            b += svg(x+190, bot-190, 700, 80, bars) + f'<div class="abs mono" style="left:{x+190}px;top:{bot-92}px;width:700px;text-align:center;font-size:24px;letter-spacing:.08em;color:{INK}">{typo(foot)}</div>'
    return cut(shoot(b + "</div>", W*n, H), n)

# ---------- IMAGE UNIQUE ----------
def affiche(big, art="", eb=None, sm=None, bg=PAPER, w=W, h=H, size=150, layout="haut", th=None, vh=600):
    light = bg in (PAPER, MINT, SUN); fg, acc = (INK, TEAL) if light else ("#fff", MINT)
    if bg == SUN: acc = INK
    b = f'<div class="abs {"lp" if light else ""}" style="left:0;top:0;width:{w}px;height:{h}px;background:{bg}">' + chrome(0, acc, w=w, h=h)
    if w > h:     # X 16:9 : texte à gauche, dessin à droite
        tw = 820 if art else w-160
        if eb: b += f'<div class="abs eb" style="left:80px;top:170px;color:{acc}">{typo(eb)}</div>'
        b += f'<div class="abs" style="left:80px;top:215px;width:{tw}px;height:520px;display:flex;flex-direction:column;justify-content:center;gap:34px"><div class="big" style="font-size:{size}px;color:{fg}">{typo(big)}</div><div class="sm" style="font-size:44px;color:{acc}">{typo(sm or "")}</div></div>' + (svg(940, 130, 600, 660, art) if art else "")
    else:
        th = th or 380
        if layout == "haut":
            if eb: b += f'<div class="abs eb" style="left:80px;top:178px;width:920px;color:{acc}">{typo(eb)}</div>'
            b += f'<svg class="abs" style="left:80px;top:{640 if sm else 630}px" width="920" height="{450 if sm else 580}" viewBox="0 0 920 {vh}">{art}</svg>' + fit(80, 235, 920, th, big, size, fg)
            if sm: b += fit(80, 1120, 920, 110, sm, 34, acc, "sm")
        elif layout == "bas":
            b += svg(80, 160, 920, 600, art)
            if eb: b += f'<div class="abs eb" style="left:80px;top:790px;width:920px;color:{acc}">{typo(eb)}</div>'
            b += fit(80, 840, 920, 260, big, size, fg)
            if sm: b += fit(80, 1115, 920, 110, sm, 36, acc, "sm")
    return shoot(b + "</div>", w, h)

def save(im, path): os.makedirs(os.path.dirname(path), exist_ok=True); im.save(path, quality=92)
def pdf(ims, path): os.makedirs(os.path.dirname(path), exist_ok=True); ims[0].save(path, save_all=True, append_images=ims[1:], resolution=150)
