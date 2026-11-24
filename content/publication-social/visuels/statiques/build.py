"""Visuels fixes manquants de la campagne « Pas de -50 % » (IG, FB, X, LinkedIn).
Usage : uv run --with pillow python build.py [J45 J47 ...]  → écrit ../AAAA-MM-JJ/jNN_*.jpg"""
import sys, datetime, os
from moteur import *; from scenes import *
HERE = os.path.dirname(os.path.abspath(__file__)); ONLY = set(sys.argv[1:])
J = {}
def jour(n):
    def deco(f): J[n] = f; return f
    return deco
class Out:
    def __init__(s, n): s.n = n; s.d = os.path.join(HERE, "..", str(datetime.date(2026, 10, 15) + datetime.timedelta(n-1)))
    def ig(s, ims):
        if not isinstance(ims, list): save(ims, f"{s.d}/j{s.n}_instagram.jpg"); return
        for i, im in enumerate(ims, 1): save(im, f"{s.d}/j{s.n}_ig_{i}.jpg")
    def fb(s, im): save(im, f"{s.d}/j{s.n}_facebook.jpg")
    def x(s, im): save(im, f"{s.d}/j{s.n}_x.jpg")
    def li(s, ims):
        if not isinstance(ims, list): save(ims, f"{s.d}/j{s.n}_linkedin.jpg"); return
        pdf(ims, f"{s.d}/j{s.n}_linkedin.pdf")
        if os.environ.get("REVUE"):
            for i, im in enumerate(ims, 1): save(im, f"{os.environ['REVUE']}/j{s.n:02d}_li_{i}.jpg")
CTA = "Étude gratuite : lien en bio."
XW, XH = 1600, 900
aff_x = lambda big, art="", sm=None, bg=DEEP, size=190, eb=None: affiche(big, art, eb, sm, bg, XW, XH, size)
ctr = lambda s, w=400, k=1, y=0: G(s, 460-w*k/2, y, k)
def porte_art(n, inner): return G(porte(n, inner), 10, 0, .98)
def tags5(y=40): return "".join(G(etiquette(t, f="#e2c79b" if k < 2 else PAPER), k*172, y+(k % 2)*265, .95) for k, t in enumerate(("Abonnement", "kWh", "TURPE", "Accise", "TVA")))
def tableau(rows, cols, y0=150, rh=150, xs=(0, 330, 560), fs=34, head=INK):
    s = "".join(T(xs[i], y0-40, c, 26, TEAL, "start") for i, c in enumerate(cols))
    for k, r in enumerate(rows):
        y = y0+k*rh; s += P(f"M0 {y-18}H920", INK, 3)
        for i, c in enumerate(r): s += T(xs[i], y+rh/2-2, c, fs*(1.45 if i == 0 else 1), (INK if i != 1 else (TEAL if c.startswith("Oui") else RED)), "start", "s" if i == 0 else "")
    return s

# ======== Rattrapage LinkedIn J1-J19 ========
@jour(1)
def f(o): o.li(ticket([(None, "71 % des commerçants indépendants participants n'avaient *pas le choix*.", "Black Friday 2025. Source : L'echommerces / Boutique2Mode", "Pas le choix::71 %"), (None, "Seuls 8 % le jugent « intéressant ».", "Source : L'echommerces / Boutique2Mode", "« Intéressant »::8 %"), (None, "Cette année, pas de promo de plus à subir.", None, "Promo de plus::0"), (None, "Un courtier n'a rien à solder.", "Nous ne vendons pas d'énergie, nous la négocions.", "Énergie à solder::0"), (None, "Du 15 octobre au 31 décembre : un contenu par jour.", "Sur la charge que personne ne vous négocie.", "Contenus::78"), (None, "Pas de -50 %. Juste le bon prix.", "Pour toute la durée du contrat.")], head="BLACK FRIDAY", bg=DEEP, foot="SANS DATE LIMITE"))
@jour(3)
def f(o): o.li(affiche("Les postes discrets d'un point de vente.", G(devanture(INK, "#fff", SUN), 20, 40, .9)+T(165, 440, "éclairage de vitrine", 30, INK)+G(ampoule(), 395, 110, 1)+T(495, 440, "réserve éclairée", 30, INK)+T(495, 480, "sans présence", 30, INK)+G(prise(), 700, 90, 1)+T(790, 440, "équipements", 30, INK)+T(790, 480, "en veille", 30, INK), "Infographie", "Ce qui reste allumé quand vous fermez.", vh=500))
@jour(5)
def f(o): o.li(ticket([(None, "Votre facture d'électricité pro, *en 5 blocs*."), ("Bloc 1", "Identification", "N° client, point de livraison, période.", "Identification::qui, où, quand"), ("Bloc 2", "Abonnement", "La puissance souscrite.", "Abonnement::kVA"), ("Bloc 3", "Consommation", "Le prix du kWh.", "Consommation::kWh"), ("Bloc 4", "Acheminement", "Le TURPE.", "Acheminement::TURPE"), ("Bloc 5", "Taxes, contributions, TVA", None, "Taxes::accise, TVA"), (None, "Avant de négocier une facture, il faut *savoir la lire*.")], head="FACTURE PRO", bg=TEAL, foot="5 BLOCS, 5 MINUTES"))
@jour(8)
def f(o): o.li(pano([(None, "Un restaurant fermé consomme encore."), (None, "Cuisine : souvent *40 à 50 %* de la consommation."), (None, "Froid : 24h/24, jours de fermeture compris."), (None, "*-1 °C* sur la consigne = +3 à 5 % de consommation."), (None, "Qui vérifie les consignes, établissement par établissement ?"), (None, "Avant de parler contrat, réglez ce qui se règle.")], sc_froid))
@jour(10)
def f(o):
    four = R(0, 60, 260, 300, PAPER, INK, 8, 14)+R(35, 160, 190, 130, SUN, INK, 7, 10)+"".join(C(50+k*54, 110, 14, INK) for k in range(4))
    o.li(affiche("Les 3 postes d'une boulangerie.", G(four, 20, 60)+T(150, 480, "1. Le four", 44, INK, k="s")+G(R(0, 0, 200, 340, "#fff", INK, 8, 14)+P("M0 120H200", INK, 8)+R(160, 30, 14, 70, INK)+R(160, 150, 14, 100, INK), 375, 80)+T(475, 480, "2. Le froid", 44, INK, k="s")+G(ampoule(), 690, 130, 1.05)+T(795, 480, "3. Éclairage", 44, INK, k="s")+T(795, 530, "et chauffage", 44, INK, k="s"), "Boulangers"))
@jour(12)
def f(o): o.li(pano([(None, "Une ligne de votre contrat n'a pas bougé *depuis l'ouverture*."), (None, "La puissance souscrite, en kVA."), (None, "Elle fixe l'abonnement ET le TURPE.", "Que vous consommiez ou non."), (None, "Trop haute : vous payez pour rien, *chaque mois*."), (None, "Trop basse : dépassements facturés au prix fort."), (None, "La bonne : vos pics réels des 12 derniers mois.")], sc_niveau))
@jour(19)
def f(o): o.li(ticket([(None, "Vous baissez vos prix en novembre. *Qui baisse les vôtres ?*"), ("Novembre 2025", "-5,3 % de chiffre d'affaires", "Commerçants de mode indépendants. « Pas d'effet Black Friday. » (FNH)", "Mode indép. nov. 2025::-5,3 %"), (None, "71 % disent ne pas avoir eu le choix.", "Indépendants participants. Source : L'echommerces / Boutique2Mode", "Pas le choix::71 %"), (None, "La remise : on la *pilote*.", None, "Remise::pilotée"), (None, "Le contrat d'énergie : on le *subit*, tous les mois.", None, "Énergie::subie"), (None, "4 semaines sur la charge que personne ne vous négocie.", None, "À suivre::4 semaines"), (None, "Étape 1 : 3 minutes, le calculateur.")], head="NOVEMBRE", bg=DEEP, foot="CABINETMS.FR"))

# ======== J14 - J36 ========
@jour(14)
def f(o): o.ig(pano([(None, "La question que personne ne pose à *son courtier*."), (None, "Fournisseur A, B ou C : même commission."), (None, "Aucune raison de vous en pousser un."), (None, "Même pas de vous faire changer.", CTA)], sc_cartes))
@jour(15)
def f(o):
    o.li(pano([(None, "Quand renégocier un contrat d'énergie ?"), (None, "Réponse habituelle : à l'échéance."), (None, "Problème : à J-1, on signe ce qu'on vous propose."), (None, "La bonne fenêtre : *12 à 24 mois* avant."), (None, "Depuis la fin de l'ARENH, le moment de signer pèse davantage."), (None, "Où se situe votre contrat ? *3 minutes.*")], sc_frise))
    fr = P("M20 230H900", INK, 8)+R(170, 190, 390, 80, SUN, r=40)+"".join(C(60+k*158, 230, 24, c, INK, 6)+T(60+k*158, 150, a, 58, INK, k="s")+T(60+k*158, 330, b, 27, TEAL) for k, (a, b, c) in enumerate((("J-36", "anticipé", TEAL), ("J-24", "idéal", SUN), ("J-18", "idéal", SUN), ("J-12", "optimal", SUN), ("J-6", "tardif", "#e08a45"), ("J-1", "critique", RED))))
    o.ig(affiche("La bonne fenêtre n'est pas celle qu'on croit.", fr, "Renégocier", "En mois avant l’échéance.", size=150, vh=450))
    o.fb(affiche("12 à 24 mois avant.", ctr(page_cal("31", sub="échéance"), 220, 1.9, 60)+P("M140 480C20 420 30 220 190 170M190 170l-60 -10M190 170l-30 54", RED, 12), "La date à entourer", "Pas la veille de l'échéance.", bg=MINT, layout="bas"))
    o.x(aff_x("12-24 mois", ctr(page_cal("31", sub="échéance"), 520, 2.1, 60), "avant l'échéance : la bonne fenêtre pour renégocier un contrat d'énergie pro."))
FR = ["La reconduction tacite.", "La puissance fantôme.", "L'accise mal classée.", "La régularisation surprise."]
@jour(17)
def f(o):
    o.ig(ticket([(None, "4 frissons."), ("Frisson 1", FR[0], None, "Reconduction::tacite"), ("Frisson 2", FR[1], None, "Puissance::fantôme"), ("Frisson 3", FR[2], None, "Accise::mal classée"), ("Frisson 4", FR[3], "Ces lignes-là se vérifient.")], head="FACTURE D'OCTOBRE", bg=BLACK, foot="BONNE NUIT"))
    art = "".join(T(0, 90+k*130, f"{k+1}", 90, SUN, "start", "s")+T(90, 90+k*130, t, 66, "#fff", "start", "s")+P(f"M0 {122+k*130}H920", "#fff", 2, o=.3) for k, t in enumerate(FR))
    im = affiche("Les 4 frissons de la facture d'énergie.", art, "Halloween", bg=BLACK); o.li(im)
    o.fb(affiche("Les lignes qui font vraiment peur.", ctr(facture("#fff", "#222", 2), 290, 1.35, 20), "Halloween", "La décoration, elle, se range le 1er novembre.", bg=BLACK, layout="bas"))
@jour(21)
def f(o): o.ig(ticket([(None, "La ligne qui n'existe sur *aucune facture*.", None, "Abonnement::facturé"), (None, "« Surcoût lié à l'absence de négociation »", None, "Surcoût non négocié::absent"), ("Le calculateur", "Conso, prix au MWh, puissance, date du contrat.", "Quatre lignes de votre facture.", "4 lignes à saisir::OK"), (None, "*3 minutes* pour l'estimer.", "Calculateur gratuit : lien en bio.")], head="FACTURE", bg=TEAL, foot="ESTIMATION GRATUITE"))
BOUT = G(devanture(INK, "#fff", SUN, 360), 20, 60, 1.05)+G(devanture(INK, "#fff", SUN, 360), 560, 60, 1.05)+G(facture(INK, "#fff", h=210), 120, 455, .5)+G(facture(INK, SUN, h=420), 660, 455, .5).replace("<g ", "<g ", 1)
@jour(22)
def f(o):
    o.li(ticket([(None, "Deux commerces identiques. *Deux prix différents.*", None, "Commerce::identique"), ("Critère 1", "Le marché le jour de la signature.", None, "1. Marché::jour J"), ("Critère 2", "Le temps restant avant l'échéance.", None, "2. Échéance::temps restant"), ("Critère 3", "Le volume négocié.", None, "3. Volume::négocié"), (None, "Aucun ne dépend de vos équipements.", None, "Équipements::sans effet"), (None, "Tous dépendent de la *façon d'acheter*.")], head="PRIX DU CONTRAT", bg=DEEP, foot="ACHETER MIEUX"))
    o.ig(affiche("Même boutique. Pas le même prix.", BOUT, None, None, size=170))
    o.fb(affiche("Deux boutiques jumelles, deux factures.", BOUT, None, None, bg=MINT, size=130))
    o.x(aff_x("3 critères", G(BOUT, 0, 110, .65), "fixent le prix d'un contrat d'énergie pro, sans rapport avec vos équipements.", bg=PAPER))
@jour(24)
def f(o):
    o.ig(pano([(None, "Pas le temps ?", "Samedi, comptoir plein."), (None, "C'est *le principe*."), ("Vous", "Une photo de facture."), ("Nous : tout le reste", "Vous : *la décision*.", CTA)], sc_chemin))
    def col(x, t, xs, f_): return R(x, 0, 440, 600, f_, INK, 6, 20)+T(x+220, 70, t, 46, INK, k="s")+"".join(R(x+30, 110+k*(96), 380, 78, "#fff", INK, 4, 12)+T(x+220, 160+k*96, a, 29, INK) for k, a in enumerate(xs))
    o.li(affiche("Vous n'avez pas le temps. C'est le principe.", col(0, "Ce que vous faites", ["envoyer une facture", "décider"], SUN)+col(480, "Ce que nous faisons", ["analyse", "appel d'offres", "comparatif", "démarches", "suivi"], MINT), "Qui fait quoi", size=110, th=340))
    o.fb(affiche("Samedi de rush ? Une photo de facture suffit.", G(devanture(INK, "#fff", SUN), 40, 120, 1.25)+G(telephone(G(facture(), 60, 110, .48)), 580, 60, 1.05), None, "On s'occupe du reste, vous décidez.", bg=SUN, layout="bas"))
def deck_tag(nom, verso, verdict): return objet([("Les étiquettes cachées", nom), ("Au verso", verso), ("Verdict", verdict)])
FBTAG = lambda nom, sm, extra="", bg=MINT: affiche(sm, ctr(facture("#8aa5a8", "#fff"), 290, 1.45, 10)+G(etiquette(nom), 380, 170, 1.45, -8)+extra, "Les étiquettes cachées", None, bg=bg, layout="bas", size=110)
@jour(26)
def f(o):
    o.ig(deck_tag("Abonnement", "Dépend de : la puissance souscrite.", "Se négocie : oui.|Se calibre : oui."))
    o.fb(FBTAG("Abonnement", "L'abonnement se paie même un mois sans activité."))
    o.li(objet([("Les étiquettes cachées", "L'abonnement"), ("Au verso", "Payé même un mois *sans activité*."), ("Calcul", "Sur la puissance souscrite (kVA)."), ("Verdict", "Se négocie avec la fourniture.", "Se calibre sur vos pics réels."), ("À savoir", "Au-delà de 36 kVA : autre grille tarifaire.")]))
@jour(28)
def f(o): o.ig(objet([("Les étiquettes cachées", "TURPE"), ("Au verso", "Le péage du réseau.", "Deux réglages : la puissance, l'option."), ("Verdict", "Se négocie : non. *Se réduit : oui.*", "Via la puissance et l'option tarifaire.")], bg=TEAL, acc="#fff"))
@jour(29)
def f(o):
    o.li(objet([("Les étiquettes cachées", "L'accise"), ("Au verso", "Ex-TICFE et ex-TICGN.", "Électricité et gaz."), ("Le taux", "30,62 €/MWh HT", "Jusqu'à 36 kVA, depuis le 1er août 2026."), ("Attention", "Taux selon le profil déclaré.", "Une erreur de classification est possible."), ("Verdict", "Ne se négocie pas. *Se vérifie toujours.*")]))
    o.ig(affiche("Se négocie : non.|Se vérifie : *toujours*.", G(etiquette("Accise"), 250, 20, 1.75, -6)+G(loupe(), 560, 290, 1.1), "Les étiquettes cachées", bg=DEEP, layout="bas"))
    o.fb(FBTAG("Accise", "L'accise ne se négocie pas. Elle se vérifie.", G(loupe(), 640, 330, 1)))
    o.x(aff_x("30,62 €/MWh", G(etiquette("Accise"), 110, 60, 1.6, -6)+G(loupe("#fff"), 330, 330, 1), "Accise sur l'électricité, HT, jusqu'à 36 kVA, depuis le 1er août 2026.", size=170))
@jour(31)
def f(o):
    o.ig(objet([("Le récap", "5 étiquettes. Lesquelles se négocient ?"), ("Se négocie", "Abonnement", "Calibrer la puissance, comparer."), ("Se négocie", "Prix du kWh", "Mettre en concurrence."), ("Se vérifie", "TURPE", "Calibrer la puissance, choisir l'option."), ("Se vérifie", "Accise", "Vérifier la classification."), ("Se vérifie", "TVA", "Vérifier le taux (20 %).")], bg=DEEP))
    o.li(affiche("Sur 5 étiquettes, deux se négocient.", tableau([("Abonnement", "Oui", "Calibrer, comparer"), ("Prix du kWh", "Oui", "Mettre en concurrence"), ("TURPE", "Non", "Puissance et option"), ("Accise", "Non", "Vérifier la classification"), ("TVA", "Non", "Vérifier le taux (20 %)")], ("Étiquette", "Se négocie ?", "À faire"), 60, 106, (0, 330, 530), 29), "Récap", size=120, th=360))
    o.fb(affiche("Lesquelles se négocient vraiment ?", tags5(10), "Les 5 étiquettes", None, bg=SUN, layout="haut", size=140))
@jour(33)
def f(o):
    o.ig(pano([(None, "Un prix fixe *fige* le prix."), (None, "Et le moment où vous l'avez signé."), (None, "Choisissez le moment. *Ne le subissez pas.*", CTA)], sc_fige))
    o.li(pano([("Le vrai prix", "Le moment de signer compte autant que la formule."), (None, "Un prix fixe fige le prix…"), (None, "…et *le moment* où vous l'avez signé."), (None, "Depuis la fin de l'ARENH, le marché pèse davantage dans les offres."), (None, "Anticiper, c'est choisir son moment au lieu de le subir.")], sc_fige, bg=PAPER, fg=INK, acc=TEAL))
    o.fb(affiche("Un prix fixe fige aussi le moment.", ctr(cadenas(), 250, 1.45, 10), None, "Choisissez-le avant de le subir.", bg=MINT, layout="bas"))
@jour(35)
def f(o): o.ig(objet([("Lexique", "VNU (n.)", "Versement nucléaire universel."), ("Ce qu'il fait", "Il redistribue au lieu de vendre."), ("Deux enveloppes", "Identiques dehors. Pas dedans.", "Chaque fournisseur l'intègre à sa façon."), ("À retenir", "Même prix affiché, *pas la même offre*.", CTA)], "carte"))
@jour(36)
def f(o):
    o.li(pano([(None, "« C'est le moment de signer. » *Vérifiez-le vous-même.*"), (None, "Électricité : moyenne mensuelle du day-ahead France.", "Source : ENTSO-E"), (None, "Gaz : moyenne trimestrielle, PEG Month-Ahead.", "Source : CRE"), (None, "Trois mois publiés, en €/MWh.", "Dernière valeur publiée : septembre 2026."), (None, "Une tendance, pas un devis.", "Gratuit, sans inscription.")], sc_baro))
    bars = "".join((R(30+k*225, 520-v*3, 180, v*3, SUN if k == 3 else TEAL)+T(120+k*225, 500-v*3, f"{v:.2f}".replace(".", ","), 50, "#fff", k="s") if v else R(30+k*225, 380, 180, 140, "none", MINT, 4)+T(120+k*225, 460, "non publié", 26, MINT))+T(120+k*225, 565, m, 30, MINT) for k, (m, v) in enumerate((("juin", 73.66), ("juil.", 103.9), ("août", None), ("sept.", 149.75))))
    src = "Moyenne mensuelle day-ahead France, €/MWh. Source : ENTSO-E. Dernière valeur publiée : septembre 2026."
    o.ig(affiche("Le Baromètre, sans inscription.", bars, None, src, bg=DEEP)); o.fb(affiche("Vérifiez-le vous-même.", bars, "Le Baromètre de l'énergie", src, bg=DEEP))
    o.x(aff_x("149,75 €/MWh", G(bars, 0, 120, .65), "Électricité, moyenne de septembre 2026 (day-ahead France, ENTSO-E). Dernière valeur publiée.", size=150))

# ======== J45 - J47 ========
@jour(45)
def f(o):
    o.ig(ticket([(None, "Ne lisez pas ce post aujourd'hui.", None, "Samedi::rush"), (None, "Enregistrez ce post.", "Le signet, en bas à droite.", "Post::enregistré"), ("Lundi", "3 minutes, une facture, *le calculateur*.")], head="SAMEDI 28 NOVEMBRE", bg=SUN, acc=INK, foot="À LUNDI"))
    steps = ["Ouvrir la dernière facture", "Noter conso, prix au MWh, puissance", "Les saisir dans le calculateur"]
    o.li(affiche("Checklist de lundi, 3 minutes.", "".join(C(60, 90+k*180, 54, SUN, INK, 6)+T(60, 112+k*180, str(k+1), 70, INK, k="s")+T(150, 102+k*180, t, 36, INK, "start")+P(f"M150 {160+k*180}H920", INK, 2, o=.3) for k, t in enumerate(steps)), "À enregistrer"))
    o.fb(affiche("Aujourd'hui, occupez-vous de vos clients.", "".join(G(devanture(INK, "#fff", SUN), -30+k*250, 140, .75) for k in range(4))+P("M0 412H920", INK, 6), "Samedi de rush", "La facture attendra lundi : 3 minutes suffisent.", bg=MINT, layout="bas"))
@jour(47)
def f(o):
    o.ig(pano([("Cyber Monday", "3 minutes."), (None, "Le seul achat en ligne *gratuit* du jour."), (None, "Anticipé, optimal ou critique ?"), (None, "Demain : l'Avent des charges commence.", "Calculateur : lien en bio.")], sc_jauge))
    o.li(pano([("Cyber Monday", "Notre seul « achat en ligne » : *3 minutes*, gratuit."), ("Ligne 1", "Consommation annuelle.", "Sur la facture : « énergie consommée »."), ("Ligne 2", "Prix actuel au MWh, ou moyenne de marché."), ("Ligne 3", "Puissance souscrite et date du dernier renouvellement."), ("Résultat", "Surcoût estimé, économie potentielle, position dans la fenêtre."), (None, "Demain : l'Avent des charges, 24 leviers en 24 jours.")], sc_jauge, bg=PAPER, fg=INK, acc=TEAL))
    o.fb(affiche("3 minutes en ligne, la facture sous la main.", G(telephone(R(40, 70, 180, 26, TEAL)+"".join(R(40, 120+k*76, 180, 52, PAPER, INK, 4) for k in range(3))+R(40, 370, 180, 54, SUN)+T(130, 406, "exemple", 24, INK)), 480, 40, 1.1)+G(facture(), 130, 110, 1.1, -6), "Cyber Monday", "Le calculateur est gratuit.", bg=SUN, layout="bas"))

# ======== L'Avent des charges ========
def avent_fb(n, big, inner, sm=None, bg=DEEP): return affiche(big, porte_art(n, inner), f"L'Avent des charges · case {n}/24", sm, bg=bg, layout="bas", size=110)
def avent_ig(n, big, sm=None): return affiche(big, porte_art(n, AV[n]), f"L'Avent des charges · case {n}/24", sm, bg="#8f3524", layout="bas", size=120)
AV = {3: G(facture(INK, "#fff"), 350, 90, .85)+G(croix(), 560, 330, 1.1),
 5: G(ampoule(), 390, 100, 1.3), 7: R(470, 70, 60, 330, "#fff", INK, 8, 30)+R(484, 230, 32, 190, TEAL)+C(500, 430, 60, TEAL, INK, 8),
 9: "".join(P(f"M{510} 280L{510+170*math.cos(a*math.pi/3)} {280+170*math.sin(a*math.pi/3)}", TEAL, 14) for a in range(6)),
 10: G(facture(INK, "#fff"), 330, 70, .95)+G(R(0, 0, 330, 110, "none", RED, 8, 10)+T(165, 48, "Vérifier les CEE", 34, RED)+T(165, 90, "d'abord", 34, RED), 350, 330, 1, -10),
 12: G(jauge(.95), 290, 130, .75), 14: G(page_cal("12", sub="mars"), 280, 60, .8)+G(page_cal("28", sub="juin"), 540, 60, .8)+P("M370 270L490 380M630 270L520 380", INK, 8)+C(505, 430, 50, SUN, INK, 8),
 17: R(320, 70, 190, 300, TEAL, INK, 8, 24)+T(415, 275, "P", 190, "#fff", k="s")+G(prise(), 550, 110, 1),
 19: T(510, 130, "relevé", 40, TEAL)+G(index("48213", True), 285, 150, .98)+T(510, 345, "estimé ?", 40, RED)+G(index("48???", False), 285, 365, .98),
 21: G(devanture(INK, "#16333a", "#0c2228", 400), 330, 80, 1)+C(610, 330, 26, SUN), 24: R(330, 120, 360, 240, "#fff", INK, 6, 12)+T(510, 190, "Rappel", 34, TEAL)+T(510, 255, "votre prochaine", 48, INK, k="s")+T(510, 310, "échéance", 48, INK, k="s")}
@jour(49)
def f(o): o.ig(objet([("L'Avent des charges", "Le délai qui piège."), (None, "Échéance moins préavis = *votre vraie date limite*."), (None, "Après : reconduction automatique.", CTA)], "door", num=2))
@jour(50)
def f(o):
    o.ig(avent_ig(3, "Sortir coûte combien ?", "Chiffrez avant de décider.")); o.fb(avent_fb(3, "Sortir d'un prix fixe : combien ?", AV[3], "Chiffrez avant de décider."))
    o.x(aff_x("Gain sur la durée restante - pénalités de sortie = *décision*", "", "Avant de rompre un contrat fixe, chiffrez les deux.", size=130))
    o.li(ticket([("Levier 3/24", "Chiffrer la sortie *avant* de décider."), (None, "Contrat fixe pluriannuel = pénalités de sortie anticipée.", None, "Pénalités::à chiffrer"), (None, "Elles peuvent représenter une part non négligeable du montant restant dû.", None, "Montant restant::à vérifier"), (None, "Coût de sortie contre gain sur la durée restante.", None, "Gain restant::à comparer"), (None, "Parfois, la bonne décision est *d'attendre* et de préparer.")], head="SORTIE ANTICIPÉE", bg="#8f3524", foot="CALCULER, PUIS DÉCIDER"))
@jour(52)
def f(o):
    o.ig(pano([("L'Avent · case 5/24", "La lumière que personne ne regarde."), (None, "Minuterie sur la vitrine."), (None, "Détecteur dans la *réserve*.")], sc_boutique))
    pl = R(0, 20, 920, 560, "#fff", INK, 10)+P("M0 200H300V20M620 20V200H920", INK, 8)+T(150, 120, "réserve", 34, INK)+T(770, 120, "sanitaires", 34, INK)+T(460, 350, "surface de vente", 44, INK, k="s")+R(90, 540, 740, 40, SUN, INK, 6)+T(460, 515, "vitrine", 34, INK)+G(horloge(INK, 21, 0), 780, 440, .42)+"".join(C(x, 165, 16, TEAL)+P(f"M{x-34} 165a34 34 0 0 1 68 0", TEAL, 6) for x in (150, 770))
    o.li(affiche("Où la lumière travaille pour rien.", pl, "Case 5/24", "Horloge : minuterie. Points verts : détecteurs de présence."))
    o.fb(avent_fb(5, "Réserve, sanitaires, vitrine : qui éteint ?", AV[5]))
@jour(54)
def f(o):
    o.ig(pano([("L'Avent · case 7/24", "La consigne de la chambre froide."), (None, "-1 °C =|*+3 à 5 %*", "de consommation."), (None, "Réglez sur vos produits. Pas sur vos craintes.")], sc_thermo))
    o.li(pano([("Levier 7/24", "Le plus rapide de la série."), (None, "-1 °C =|*+3 à 5 %*", "de consommation."), ("1", "Relever la consigne de chaque équipement."), ("2", "La comparer à la température requise pour les produits."), ("3", "Ajuster, puis vérifier une semaine plus tard.")], sc_thermo, bg=PAPER, fg=INK, acc=TEAL))
    o.fb(avent_fb(7, "-1 °C = +3 à 5 %", AV[7], "De consommation, sur une chambre froide."))
@jour(56)
def f(o): o.ig(objet([("L'Avent des charges", "La ligne des grands froids."), (None, "Capacité", "Ce qui garantit assez de puissance les jours de pointe."), (None, "Incluse ou en plus ? *Posez la question.*", CTA)], "door", num=9, bg="#123a5a", acc="#d4e6f4"))
@jour(57)
def f(o):
    o.ig(avent_ig(10, "CEE : vérifiez avant de signer le devis.")); o.fb(avent_fb(10, "Le devis attendra. Les CEE, non.", AV[10], "À vérifier avant de signer."))
    o.x(aff_x("Devis -> vérification CEE -> signature", G(T(300, 120, "devis", 60, "#fff", k="s")+T(300, 280, "signature", 60, "#fff", k="s")+T(300, 440, "CEE ?", 60, "#fff", k="s")+P("M300 150V215M300 310V375M280 195l20 24l20 -24M280 355l20 24l20 -24", MINT, 7)+P("M120 60L480 480M480 60L120 480", RED, 14, o=.85), 0, 60), "Dans cet ordre, pas l'inverse.", size=120))
    o.li(ticket([("Levier 10/24", "Vérifier les CEE *avant* de signer un devis."), (None, "Les fournisseurs d'énergie financent des économies chez leurs clients.", "On les appelle les « obligés ».", "Payeurs::obligés"), ("Éligibles", "LED, chauffage, ventilation, isolation, variateurs…", None, "Travaux::éligibles"), (None, "Une fiche standardisée fixe les conditions et le montant théorique.", None, "Fiche::standardisée"), (None, "Après la signature du devis, c'est souvent *trop tard*.")], head="DEVIS", bg=DEEP, foot="CEE D'ABORD, SIGNATURE ENSUITE"))
@jour(59)
def f(o):
    o.ig(pano([("L'Avent · case 12/24", "Ouvert le dimanche ?"), (None, "Trop haute : vous payez pour rien."), (None, "Trop juste : vous payez des pénalités. *En décembre.*")], sc_pics))
    a = "".join(R(20+k*128, 560-h, 96, h, RED if k == 6 else TEAL)+T(68+k*128, 598, d, 30, INK) for k, (d, h) in enumerate(zip("LMMJVSD", (210, 190, 220, 230, 270, 350, 480))))+P("M0 190H920", RED, 8, dash="24 14")+T(0, 165, "puissance souscrite", 32, RED, "start")
    o.li(affiche("Un dimanche de décembre, et ça dépasse.", a, "Case 12/24", "Schéma stylisé, sans valeurs. Vérifiez vos pics réels.", size=130))
    o.fb(avent_fb(12, "Ouvert dimanche ? Regardez la jauge.", AV[12]))
@jour(61)
def f(o):
    o.ig(pano([("L'Avent · case 14/24", "Deux contrats."), (None, "Deux dates différentes."), (None, "Élec. + gaz = *un seul* calendrier.", CTA)], sc_fusion))
    o.li(pano([("Levier 14/24", "Un seul calendrier pour l'électricité et le gaz."), (None, "Deux contrats, souvent deux fournisseurs, deux échéances."), (None, "Deux préavis, deux négociations, aucune vision globale."), (None, "Au renouvellement : choisir la durée qui *aligne les deux*."), (None, "Un calendrier, une négociation, un budget lisible.")], sc_fusion))
    o.fb(avent_fb(14, "Deux dates qui n'en font plus qu'une.", AV[14]))
@jour(63)
def f(o): o.ig(pano([("L'Avent · case 16/24", "Vous avez mesuré ?"), (None, "*1 000 m²* et plus, cumulés.", "Le décret tertiaire."), (None, "Propriétaire ou locataire : concerné.", "Les détails : lien en bio.")], sc_metre))
@jour(64)
def f(o):
    o.ig(avent_ig(17, "Parking + loi LOM = bornes à prévoir.", "Et bornes = puissance à prévoir.")); o.fb(avent_fb(17, "Un parking ? Pensez à la puissance.", AV[17]))
    ch = ["parking", "loi LOM", "bornes", "+ puissance", "contrat"]
    o.x(aff_x("Un parking finit dans le contrat.", "".join(R(130, k*128, 340, 88, SUN if k == 4 else "none", "#fff", 5, 44)+T(300, 58+k*128, t, 40, INK if k == 4 else "#fff", k="s")+(P(f"M300 {92+k*128}v30", MINT, 7) if k < 4 else "") for k, t in enumerate(ch)), "La chaîne à anticiper, dans cet ordre.", size=130))
    o.li(pano([("Levier 17/24", "Regarder son parking avec les yeux de la loi LOM."), (None, "Bâtiments non résidentiels avec parking : obligations de recharge."), ("Selon les cas", "Pré-équipement ou bornes opérationnelles.", "Fourreaux, câbles, capacité."), ("Seuils et calendrier", "Taille du parking, date de construction, usage."), (None, "Des bornes = de la *puissance en plus*.", "À anticiper dans le contrat.")], sc_parking))
@jour(66)
def f(o):
    o.ig(ticket([("L'Avent · case 19/24", "Regardez sous l'index."), (None, "Relevé :|*tout va bien*.", None, "Index relevé::OK"), (None, "Estimé ?|Régularisation à venir.", CTA)], head="FACTURE", bg="#8f3524", foot="RELEVÉ OU ESTIMÉ ?"))
    o.li(affiche("Relevé ou estimé ? Deux mots à chercher.", T(0, 60, "index relevé", 38, TEAL, "start")+G(index("48213", True), 0, 90, 1.5)+G(coche(), 760, 130, 1.2)+T(0, 360, "index estimé", 38, RED, "start")+G(index("48???", False), 0, 390, 1.5)+G(loupe(), 720, 370, .75), "Case 19/24", "Extrait stylisé, valeurs fictives.", size=120))
    o.fb(avent_fb(19, "Relevé ou estimé ?", AV[19], "Un coup d'œil au compteur suffit."))
@jour(68)
def f(o):
    o.ig(pano([("L'Avent · case 21/24", "Le jour le plus court."), (None, "Le dernier client est parti."), (None, "Et *la lumière* ?")], sc_nuit, bg="#0a2830"))
    o.li(pano([("Solstice d'hiver", "Le jour où l'éclairage d'un commerce travaille le plus longtemps."), ("Audit du soir, 1", "Qu'est-ce qui reste allumé après le dernier client ?"), ("Audit du soir, 2", "Les équipements de cuisson s'éteignent-ils hors service ?"), ("Audit du soir, 3", "Réserves et sanitaires ont-ils des détecteurs ?"), (None, "Demain, les jours rallongent. *Les bonnes habitudes restent.*")], sc_nuit, bg="#0a2830"))
    o.fb(avent_fb(21, "Une seule lampe. Toute la nuit ?", AV[21], bg="#0a2830"))
@jour(70)
def f(o): o.ig(ticket([("L'Avent · case 23/24", "*1* facture.", None, "Facture::1"), (None, "24 h.|1 comparatif.", None, "Comparatif::1"), (None, "Gratuit. Sans engagement. *Sans date limite.*", CTA)], head="23 DÉCEMBRE", bg="#8f3524", foot="TOTAL : 0 €"))
@jour(71)
def f(o):
    o.ig(avent_ig(24, "Le cadeau : une alerte 12 à 24 mois avant.")); o.fb(avent_fb(24, "La dernière case : un rappel.", AV[24], "12 à 24 mois avant votre échéance."))
    o.x(aff_x("12-24 mois", G(porte(24, AV[24]), -60, 40, .85), "avant l'échéance : le moment où nous alertons nos clients.", bg="#8f3524"))
    o.li(objet([("Levier 24/24", "Le cadeau."), (None, "Une alerte *12 à 24 mois* avant votre prochaine échéance."), (None, "Le contraire exact de la reconduction tacite."), ("Joyeux réveillon", "On ne négocie bien que lorsqu'on n'est *pas pressé*.")], "door", num=24))

# ======== J73 - J78 ========
COLS = ["Site", "Énergie", "Fournisseur", "Échéance", "Préavis", "kVA", "Option", "Formule", "Relevé / estimé"]
@jour(73)
def f(o):
    o.ig(ticket([("Inventaire", "Le stock.", None, "Stock::compté"), ("Inventaire", "Fournisseur, échéance, préavis, kVA, option, formule.", None, "Contrats::à compter"), (None, "Le stock. *Et les contrats.*", CTA)], head="26 DÉCEMBRE", bg=TEAL, foot="INVENTAIRE COMPLET"))
    g = "".join(R(0, k*66, 330, 66, SUN, INK, 3)+T(20, 45+k*66, c, 32, INK, "start")+R(330, k*66, 295, 66, "#fff", INK, 3)+R(625, k*66, 295, 66, "#fff", INK, 3) for k, c in enumerate(COLS))
    o.li(affiche("Inventaire énergie.", g, "Une colonne par contrat", None, th=360, size=150))
    o.fb(affiche("Vous comptez le stock. Comptez aussi les contrats.", R(260, 30, 400, 540, "#fff", INK, 8, 16)+R(380, 5, 160, 60, TEAL, INK, 7, 14)+"".join(R(300, 120+k*105, 50, 50, "none", INK, 6)+(G(coche(), 302, 105+k*105, .55) if k < 3 else "")+T(380, 158+k*105, t, 40, INK if k < 3 else RED, "start", "s") for k, t in enumerate(("rayons", "réserve", "caisse", "contrats ?"))), "Inventaire", None, bg=SUN, layout="bas", size=110))
@jour(75)
def f(o):
    o.ig(objet([("Lexique", "2026, l'année énergie."), ("ARENH", "Fin.", "Terminé au 31/12/2025."), ("VNU", "Début.", "Versement nucléaire universel."), ("TVA", "20 % partout.", "Abonnement compris."), ("2027", "Comparer devient *déterminant*.", CTA)], "carte"))
    o.li(objet([("Bilan", "L'année énergie 2026 pour un commerce, en 4 changements."), ("ARENH", "Terminé au 31/12/2025.", "Les prix suivent davantage le marché. (CRE)"), ("VNU", "Nouveau mécanisme de redistribution.", "Intégré différemment selon les fournisseurs."), ("TVA", "20 % sur toute la facture.", "Abonnement compris, depuis août 2025. (BOFiP)"), ("Accise", "30,62 €/MWh HT", "Électricité, jusqu'à 36 kVA, depuis le 1er août 2026."), ("2027", "Comparer devient plus exigeant, et *plus rentable*.")], "carte", bg=TEAL, acc="#fff"))
    o.fb(affiche("2026 en 4 mots.", "".join(R(k % 2*470, k//2*290, 440, 260, (SUN, "#fff", MINT, "#e2c79b")[k], INK, 6, 24)+T(k % 2*470+220, k//2*290+155, t, 96, INK, k="s") for k, t in enumerate(("ARENH", "VNU", "TVA", "Accise"))), "Bilan", size=170))
@jour(77)
def f(o): o.ig(ticket([(None, "78 jours.", None, "Jours::78"), ("Étiquettes, cases, cartes", "Un contenu par jour.", None, "Contenus::78"), (None, "*0 promo.*", None, "Promos::0"), (None, "Le sujet, ce n'est pas le prix. *C'est le moment.*")], head="DU 15/10 AU 31/12", bg=DEEP, foot="MERCI DE NOUS AVOIR LUS"))
def barre(w, y, s, c=INK): return T(w/2, y, "-50 %", s, c, k="s")+P(f"M{w/2-s*1.02} {y-s*.32}H{w/2+s*1.02}", c, 7)
@jour(78)
def f(o):
    b1 = affiche("", barre(920, 330, 330)); b = f
    mk = lambda t, sm=None: affiche(t, barre(920, 350, 330), None, sm, bg=PAPER, layout="bas", size=120)
    o.ig(mk("Pas cette année.|Ni l'année prochaine.")); o.fb(mk("Bonne année 2027."))
    o.li([mk(""), mk("Pas cette année."), mk("Ni l'année prochaine."), mk("Juste le bon prix, pour toute la durée du contrat.", "Étude gratuite, toute l'année 2027.")])
    o.x(affiche("0 promo en 78 jours.", barre(600, 400, 250), None, "Juste le bon prix, pour toute la durée du contrat.", PAPER, XW, XH, 170))

if __name__ == "__main__":
    from concurrent.futures import ThreadPoolExecutor
    todo = [n for n in sorted(J) if not ONLY or f"J{n}" in ONLY]
    def run(n):
        try: J[n](Out(n)); return None
        except Exception as e:
            import traceback; return f"J{n}: {traceback.format_exc()}"
    with ThreadPoolExecutor(5) as ex: errs = [e for e in ex.map(run, todo) if e]
    print(len(todo), "jours ;", "\n".join(errs) or "aucune erreur")
