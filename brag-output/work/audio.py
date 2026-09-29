"""Bande-son /brag M&S Strategy : 21 s, 120 BPM, ré mineur -> fa majeur.
Musique et effets synthétisés ensemble, dans la même tonalité et la même réverb."""
import numpy as np
from scipy.signal import butter, sosfilt, fftconvolve
import wave

SR = 48000
DUR = 21.0
N = int(SR * DUR)
rng = np.random.default_rng(7)
t_all = np.arange(N) / SR


def hz(m):  # note MIDI -> Hz
    return 440.0 * 2 ** ((m - 69) / 12)


def lp(x, f, order=2):
    return sosfilt(butter(order, f, 'low', fs=SR, output='sos'), x)


def hp(x, f, order=2):
    return sosfilt(butter(order, f, 'high', fs=SR, output='sos'), x)


def bp(x, lo, hi):
    return sosfilt(butter(2, [lo, hi], 'band', fs=SR, output='sos'), x)


def env_adsr(n, a, r, sustain=1.0):
    e = np.ones(n) * sustain
    na, nr = int(a * SR), int(r * SR)
    na = min(na, n); nr = min(nr, n - na)
    e[:na] = np.linspace(0, sustain, na)
    if nr > 0:
        e[n - nr:] = np.linspace(sustain, 0, nr) ** 1.5
    return e


def put(buf, sig, start):
    i = int(start * SR)
    if i >= len(buf):
        return
    sig = sig[: len(buf) - i]
    buf[i:i + len(sig)] += sig


pad = np.zeros(N); bass = np.zeros(N); drums = np.zeros(N); sfx = np.zeros(N); keys = np.zeros(N)

# ---------- harmonie ----------
# (début, fin, notes du pad en MIDI, fondamentale basse)
D, F, G, A, Bb, C = 50, 53, 55, 57, 58, 48
CHORDS = [
    (0.0, 2.0, [62, 65, 69, 74], 38),      # Dm
    (2.0, 4.0, [62, 65, 70, 74], 34),      # Bb
    (4.0, 6.0, [62, 67, 70, 74], 43),      # Gm
    (6.0, 8.0, [61, 64, 69, 76], 45),      # A (dominante, tension)
    (8.0, 10.0, [60, 65, 69, 72], 41),     # F  <- révélation
    (10.0, 12.0, [60, 64, 67, 72], 36),    # C
    (12.0, 14.0, [62, 65, 69, 74], 38),    # Dm
    (14.0, 16.0, [62, 65, 70, 77], 34),    # Bb
    (16.0, 17.5, [62, 67, 70, 74], 43),    # Gm
    (17.5, 19.2, [60, 65, 67, 72], 36),    # Csus4
    (19.2, 21.0, [60, 65, 69, 72, 77], 41),  # F  <- résolution sur le tap
]


def pad_voice(f, n):
    tt = np.arange(n) / SR
    s = np.zeros(n)
    for det in (-0.07, 0.0, 0.08):  # léger désaccord = chaleur
        ff = f * 2 ** (det / 12)
        for h, amp in ((1, 1), (2, .45), (3, .22), (4, .12), (5, .06)):
            s += amp * np.sin(2 * np.pi * ff * h * tt + rng.uniform(0, 6.28))
    return s


for (a, b, notes, root) in CHORDS:
    n = int((b - a + .35) * SR)
    ch = sum(pad_voice(hz(m), n) for m in notes) / len(notes)
    ch *= env_adsr(n, .25 if a > 0 else .6, .45)
    put(pad, ch, a)

    # basse : note tenue (scènes 1-2), croches pulsées (révélation -> preuves)
    if a < 8.0 or (15.0 <= a < 17.5):
        nb = int((b - a) * SR)
        tt = np.arange(nb) / SR
        s = np.sin(2 * np.pi * hz(root) * tt) + .25 * np.sin(2 * np.pi * hz(root) * 2 * tt)
        put(bass, s * env_adsr(nb, .05, .3) * .9, a)
    else:
        step = .25
        k = 0
        while a + k * step < b - 1e-6:
            nb = int(.22 * SR)
            tt = np.arange(nb) / SR
            m = root + (12 if k % 4 == 3 else 0)
            s = np.sin(2 * np.pi * hz(m) * tt) + .3 * np.sin(2 * np.pi * hz(m) * 2 * tt)
            s *= np.exp(-tt * 9) * (1 if k % 2 == 0 else .7)
            put(bass, s, a + k * step)
            k += 1

pad = lp(pad, 2400)

# ---------- percussions ----------


def kick(level=1.0):
    n = int(.45 * SR); tt = np.arange(n) / SR
    f = 45 + 95 * np.exp(-tt * 30)
    ph = 2 * np.pi * np.cumsum(f) / SR
    return level * np.sin(ph) * np.exp(-tt * 7.5)


def hat(level=1.0):
    n = int(.08 * SR); tt = np.arange(n) / SR
    return level * hp(rng.standard_normal(n), 7000) * np.exp(-tt * 60)


b = 8.0
while b < 15.0 - 1e-6:
    put(drums, kick(.9), b)
    put(drums, hat(.16), b + .25)
    b += .5
b = 17.5
while b < 19.2 - 1e-6:
    put(drums, kick(.55), b)
    b += .5
put(drums, kick(1.0), 19.2)
# pulsation discrète pendant la tension (scène 2)
for k in range(8):
    put(drums, kick(.28), 4.0 + k * .5)

# ---------- effets sonores (dans la tonalité) ----------


def blip(m, level, decay=40, dur=.12):
    n = int(dur * SR); tt = np.arange(n) / SR
    s = np.sin(2 * np.pi * hz(m) * tt) + .2 * np.sin(2 * np.pi * hz(m) * 3 * tt)
    return level * s * np.exp(-tt * decay)


def mallet(m, level):
    n = int(1.2 * SR); tt = np.arange(n) / SR
    s = np.sin(2 * np.pi * hz(m) * tt) + .35 * np.sin(2 * np.pi * hz(m) * 4.0 * tt) * np.exp(-tt * 18)
    return level * s * np.exp(-tt * 4.5)


def whoosh(dur, level, rise=True):
    n = int(dur * SR); tt = np.arange(n) / SR
    x = rng.standard_normal(n)
    x = bp(x, 400, 3500)
    e = (tt / dur) ** 2 if rise else np.exp(-tt * 6)
    return level * x * e


# tics du taximètre : A5 feutré, rythme qui ralentit avec le compteur
tc = .7
while tc < 3.2:
    put(sfx, blip(81, .10, decay=70, dur=.05), tc)
    prog = (tc - .7) / 2.5
    tc += .0625 + .19 * prog ** 2
# callout 80 % : deux notes de ré (tension douce)
put(sfx, mallet(74, .30), 5.75); put(sfx, mallet(69, .18), 5.87)
# montée vers la révélation
put(sfx, lp(whoosh(.9, .22), 3000), 7.1)
# passages de scène
for tw in (3.72, 10.72, 14.72, 17.22):
    put(sfx, lp(whoosh(.35, .10), 2200), tw - .12)
# chiffres des preuves : fa, la, do (accord de fa)
for tm, m in ((11.3, 77), (11.95, 81), (12.6, 84)):
    put(sfx, mallet(m, .22), tm)
# le tap : clic feutré + cloche en fa majeur
put(sfx, blip(89, .12, decay=120, dur=.04), 19.2)
for m, lv in ((77, .26), (81, .18), (84, .14), (89, .07)):
    put(sfx, mallet(m, lv), 19.24)

# ---------- espace commun : même réverb pour musique et effets ----------
irn = int(1.9 * SR)
ir = rng.standard_normal(irn) * np.exp(-np.arange(irn) / SR * 3.2)
ir = lp(ir, 5000); ir /= np.sqrt((ir ** 2).sum())


def verb(x, wet):
    return x + wet * fftconvolve(x, ir)[:N]


pad_v = verb(pad * .55, .6)
sfx_v = verb(sfx, .45)
keys_v = verb(keys, .4)
bass = lp(bass, 900) * .55
drums = lp(drums, 9000) * .6

# ducking léger du pad sous la grosse caisse (le mix respire)
duck = np.ones(N)
b = 8.0
while b < 15.0:
    i = int(b * SR); n = int(.3 * SR)
    duck[i:i + n] = np.minimum(duck[i:i + n], 1 - .35 * np.exp(-np.arange(n) / SR * 14))
    b += .5

mix = pad_v * duck + bass + drums + sfx_v * .8 + keys_v
mix = hp(mix, 30)
# fondus
fi = int(.15 * SR); mix[:fi] *= np.linspace(0, 1, fi)
fo = int(.9 * SR); mix[-fo:] *= np.linspace(1, 0, fo) ** 2
mix = np.tanh(mix * 1.1) / np.tanh(1.1)
mix /= np.abs(mix).max() / .89

# stéréo : léger élargissement par délai (Haas) sur le pad
w = int(.011 * SR)
L = mix.copy(); R = mix.copy()
side = np.zeros(N); side[w:] = (pad_v * duck)[:-w] * .12
L += side; R -= side
st = np.stack([L, R], 1)
st /= np.abs(st).max() / .89
with wave.open('music.wav', 'wb') as f:
    f.setnchannels(2); f.setsampwidth(2); f.setframerate(SR)
    f.writeframes((st * 32767).astype('<i2').tobytes())
print('ok', st.shape)
