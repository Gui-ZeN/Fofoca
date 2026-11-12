# Pinta de vermelho os buracos que o recortar.py apagaria (fundo preso), pra conferir no olho antes de recortar.
# ⚠️ Olha a folha inteira, sem a regra dos ombros do recortar.py (que poupa olho e óculos): na cabeça, vermelho aqui NÃO é apagado lá.
# Uso: python -I ver_buracos.py <saida.png> <folha1> <folha2> ...
import sys
import numpy as np
from PIL import Image
from scipy import ndimage

AREA, CLARO, NEUTRO = 300, 245, 4


def presos(img):
    claro = (img >= 200).all(axis=2)
    rot, n = ndimage.label(claro)
    borda = set(np.unique(np.concatenate([rot[0], rot[-1], rot[:, 0], rot[:, -1]]))) - {0}
    out = np.zeros(claro.shape, bool)
    for i in range(1, n + 1):
        if i in borda: continue
        m = rot == i
        if m.sum() < AREA: continue
        mu = img[m].mean(0)
        if mu.mean() >= CLARO and abs(mu[0] - mu[2]) < NEUTRO: out |= m
    return out


faixas = []
for f in sys.argv[2:]:
    img = np.asarray(Image.open(f).convert('RGB')).astype(int)
    m = presos(img)
    vis = img.copy(); vis[m] = [230, 30, 30]
    im = Image.fromarray(vis.astype(np.uint8))
    faixas.append(im.resize((1000, round(im.height * 1000 / im.width))))
W = 1000; H = sum(i.height for i in faixas)
out = Image.new('RGB', (W, H), 'white'); y = 0
for i in faixas: out.paste(i, (0, y)); y += i.height
out.save(sys.argv[1])
