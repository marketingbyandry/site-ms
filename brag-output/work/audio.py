"""Bande-son /brag M&S Strategy — version « keynote halo ».
Nappe feutrée + effets synthétisés dans la même tonalité (ré majeur), calés sur timings.js.
Si vo.wav existe, la voix off est mixée par-dessus avec un ducking doux de la musique."""
import json, os, re, wave
import numpy as np
from scipy.signal import butter, sosfilt, fftconvolve

T = json.loads(re.sub(r'^\s*window\.T\s*=\s*', '', open('timings.js').read()))
SR = 48000
DUR = T['dur']
N = int(SR * DUR)
rng = np.random.default_rng(11)


def hz(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def lp(x, f, o=2):
    return sosfilt(butter(o, f, 'low', fs=SR, output='sos'), x)


def hp(x, f, o=2):
    return sosfilt(butter(o, f, 'high', fs=SR, output='sos'), x)


def bp(x, lo, hi):
    return sosfilt(butter(2, [lo, hi], 'band', fs=SR, output='sos'), x)


def put(buf, sig, start):
    i = int(start * SR)
    if i >= len(buf) or i < 0:
        return
    sig = sig[: len(buf) - i]
    buf[i:i + len(sig)] += sig


def curve(points):
    """Enveloppe par points (temps, gain) interpolée linéairement."""
    ts, gs = zip(*points)
    return np.interp(np.arange(N) / SR, ts, gs)


pad = np.zeros(N); bass = np.zeros(N); sfx = np.zeros(N)

# ---------- harmonie : accords longs qui changent avec les scènes ----------
s2, s3, s4, s5 = T['s2'], T['s3'], T['s4'], T['s5']
CHORDS = [
    (0.0, s2, [62, 69, 74, 76], 38),              # Dadd9 (suspendu, halo)
    (s2, (s2 + s3) / 2, [62, 66, 69, 73], 38),    # Dmaj7 — fixation du wordmark
    ((s2 + s3) / 2, s3, [59, 62, 66, 69], 35),    # Bm7
    (s3, (s3 + s4) / 2, [55, 62, 66, 69], 43),    # Gmaj7 — preuves
    ((s3 + s4) / 2, s4, [57, 61, 64, 69], 45),    # A
    (s4, s5 - .3, [59, 62, 66, 71], 35),          # Bm — secteurs
    (s5, DUR, [62, 66, 69, 73, 78], 38),          # Dmaj9 — retour du logo
]


def pad_voice(f, n):
    tt = np.arange(n) / SR
    s = np.zeros(n)
    for det in (-0.06, 0.0, 0.07):
        ff = f * 2 ** (det / 12)
        for h, amp in ((1, 1), (2, .35), (3, .15), (4, .06)):
            s += amp * np.sin(2 * np.pi * ff * h * tt + rng.uniform(0, 6.28))
    return s


for (a, b, notes, root) in CHORDS:
    n = int((b - a + .8) * SR)
    ch = sum(pad_voice(hz(m), n) for m in notes) / len(notes)
    att, rel = int(.9 * SR), int(.9 * SR)
    e = np.ones(n); e[:att] = np.linspace(0, 1, att) ** 2; e[-rel:] = np.linspace(1, 0, rel) ** 2
    put(pad, ch * e, max(a - .2, 0))
    nb = int((b - a + .6) * SR); tt = np.arange(nb) / SR
    bs = (np.sin(2 * np.pi * hz(root) * tt) + .2 * np.sin(4 * np.pi * hz(root) * tt))
    eb = np.ones(nb); eb[:int(.5 * SR)] = np.linspace(0, 1, int(.5 * SR)); eb[-int(.6 * SR):] = np.linspace(1, 0, int(.6 * SR))
    if a >= s2:
        put(bass, bs * eb, a - .1)

pad = lp(pad, 1900)
# lente respiration de filtre : la nappe « s'ouvre » un peu sur les preuves
pad = pad * curve([(0, .35), (s2, .7), (s3, .8), (s5 - .3, .8), (s5, 1.0), (DUR, 1.0)])

# pulsation très discrète (métronome feutré) pendant les preuves
pulse = np.zeros(N)
bt = s3
while bt < s5 - .5:
    n = int(.3 * SR); tt = np.arange(n) / SR
    f = 50 + 60 * np.exp(-tt * 35)
    put(pulse, np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 10) * .35, bt)
    bt += .5


# ---------- effets sonores ----------
def tick(m, level, decay=28):
    n = int(.9 * SR); tt = np.arange(n) / SR
    s = np.sin(2 * np.pi * hz(m) * tt) + .25 * np.sin(2 * np.pi * hz(m) * 2.76 * tt) * np.exp(-tt * 40)
    return level * s * np.exp(-tt * decay / 5)


def breath(dur, level):
    n = int(dur * SR); tt = np.arange(n) / SR
    x = bp(rng.standard_normal(n), 300, 2200)
    e = np.sin(np.pi * tt / dur) ** 2
    return level * x * e


# souffle discret à l'apparition du logo (S2) et à son retour (S5)
put(sfx, breath(1.2, .10), s2 - .5)
put(sfx, breath(1.6, .12), s5 - .4)
# texture haute du trait de lumière pendant l'écriture de la tagline
wa, wb = T['tag_a'], T['tag_b']
n = int((wb - wa) * SR); tt = np.arange(n) / SR
shimmer = hp(rng.standard_normal(n), 6000) * .018 * np.sin(np.pi * tt / (wb - wa)) ** .5
put(sfx, shimmer, wa)
# ticks des chiffres : micro-intervalles montants (la, si, do#)
put(sfx, tick(81, .20), T['n19'] + .7)
put(sfx, tick(83, .20), T['n94'] + .5)
put(sfx, tick(85, .22), T['n100k'] + .75)
# ticks des secteurs : une quinte plus bas (ré, mi, fa#)
for key, m in (('tag1', 74), ('tag2', 76), ('tag3', 78)):
    put(sfx, tick(m, .18), T[key] + .05)

# ---------- espace commun ----------
irn = int(2.4 * SR)
ir = rng.standard_normal(irn) * np.exp(-np.arange(irn) / SR * 2.6)
ir = lp(ir, 4500); ir /= np.sqrt((ir ** 2).sum())


def verb(x, wet):
    return x + wet * fftconvolve(x, ir)[:N]


music = verb(pad * .5, .7) + lp(bass, 400) * .22 + lp(pulse, 2000) * .25
sfx_v = verb(sfx, .55)

# dynamique : entrée sous -30 dB, stable sous la voix, swell sur S5, fade sur le noir final
fade_end = T['fade'] + 1.5
music *= curve([(0, 0), (.4, .03), (T['vo_start'], .12), (s2 + .5, .45), (s5 - .3, .45),
                (s5 + 1.2, .85), (T['fade'], .7), (fade_end, 0), (DUR, 0)])
sfx_v *= curve([(0, 1), (T['fade'], 1), (fade_end, 0), (DUR, 0)])

mix = music + sfx_v * .9

# ---------- voix off ----------
if os.path.exists('vo.wav'):
    with wave.open('vo.wav') as w:
        assert w.getframerate() == SR and w.getnchannels() == 1
        vo = np.frombuffer(w.readframes(w.getnframes()), '<i2').astype(float) / 32768
    vbuf = np.zeros(N); put(vbuf, vo, T['vo_start'])
    # ducking doux : enveloppe de la voix lissée (≈ -5 dB sous la parole)
    env = lp(np.abs(vbuf), 3, 1); env /= env.max() + 1e-9
    duck = 1 - .45 * np.clip(env * 4, 0, 1)
    vbuf = hp(vbuf, 80)
    mix = mix * duck + vbuf * (0.9 / (np.abs(vbuf).max() + 1e-9)) * .75

mix = hp(mix, 30)
mix = np.tanh(mix * 1.05) / np.tanh(1.05)
mix /= np.abs(mix).max() / .89
w_ = int(.012 * SR)
side = np.zeros(N); side[w_:] = music[:-w_] * .08
st = np.stack([mix + side, mix - side], 1)
st /= np.abs(st).max() / .89
with wave.open('music.wav', 'wb') as f:
    f.setnchannels(2); f.setsampwidth(2); f.setframerate(SR)
    f.writeframes((st * 32767).astype('<i2').tobytes())
print('ok', st.shape, 'voix' if os.path.exists('vo.wav') else 'sans voix')
