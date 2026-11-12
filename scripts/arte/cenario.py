# Recorta as peças do prédio: fundos de apartamento, vazios à noite, telhado e bairro.
# Uso (da pasta Fofoca): python -I scripts/arte/cenario.py arte-fonte/folhas <pasta-de-saida>
import json, sys
from pathlib import Path
import numpy as np
from PIL import Image

ORIG, SAIDA = Path(sys.argv[1]), Path(sys.argv[2])
ASPECTO = 112 / 128  # largura/altura do interior do cômodo


def paineis(img):
    """painéis separados por colunas totalmente brancas"""
    tinta = ~(img >= 235).all(axis=2)
    cols = tinta.sum(0) > 5
    faixas, ini = [], None
    for x, c in enumerate(list(cols) + [False]):
        if c and ini is None: ini = x
        if not c and ini is not None: faixas.append((ini, x)); ini = None
    out = []
    for x0, x1 in faixas:
        if x1 - x0 < 300: continue
        linhas = np.nonzero(tinta[:, x0:x1].sum(1) > 5)[0]
        out.append(img[linhas.min() + 4:linhas.max() - 3, x0 + 4:x1 - 4])
    return out


def sem_fundo(rgb):
    claro = (rgb >= 215).all(axis=2)
    fundo = np.zeros_like(claro)
    fundo[0, :] = claro[0, :]; fundo[-1, :] = claro[-1, :]; fundo[:, 0] = claro[:, 0]; fundo[:, -1] = claro[:, -1]
    while True:
        g = fundo.copy()
        g[1:, :] |= fundo[:-1, :]; g[:-1, :] |= fundo[1:, :]; g[:, 1:] |= fundo[:, :-1]; g[:, :-1] |= fundo[:, 1:]
        g &= claro
        if (g == fundo).all(): return fundo
        fundo = g


def comodo(painel, nome):
    h, w = painel.shape[:2]
    # tira um pouco do alto (parede lisa) e achata de leve pro formato do cômodo
    corte = max(0, int(h - w / ASPECTO / 0.93))
    im = Image.fromarray(painel[corte:]).resize((420, round(420 / ASPECTO)), Image.LANCZOS)  # 420: 280 borrava em tela 3x
    im.save(SAIDA / f'{nome}.webp', 'WEBP', quality=86, method=6)
    meio = painel[int(h * 0.35):int(h * 0.6), int(w * 0.3):int(w * 0.7)].reshape(-1, 3)
    cor = '#%02X%02X%02X' % tuple(int(v) for v in np.median(meio, axis=0))
    return {'f': f'{nome}.webp', 'cor': cor}


manifesto = json.loads((SAIDA / 'manifesto.json').read_text(encoding='utf-8'))
cen = {'quartos': [], 'vazios': []}
for i, p in enumerate(paineis(np.asarray(Image.open(ORIG / '26.webp').convert('RGB')))):
    cen['quartos'].append(comodo(p, f'quarto-{i + 1}'))
for i, p in enumerate(paineis(np.asarray(Image.open(ORIG / '27.webp').convert('RGB')))):
    cen['vazios'].append(comodo(p, f'vazio-{i + 1}'))

# telhado (metade de cima) e bairro (metade de baixo), com o branco de fora transparente
faixas = np.asarray(Image.open(ORIG / '25.webp').convert('RGB'))
H = faixas.shape[0]
for nome, (a, b) in {'telhado': (0, H // 2), 'bairro': (H // 2, H)}.items():
    rgb = faixas[a:b]
    alfa = np.where(sem_fundo(rgb), 0, 255).astype(np.uint8)
    ys, xs = np.nonzero(alfa)
    rgba = np.dstack([rgb, alfa])[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
    im = Image.fromarray(rgba, 'RGBA')
    im = im.resize((1400, round(im.height * 1400 / im.width)), Image.LANCZOS)
    im.save(SAIDA / f'{nome}.webp', 'WEBP', quality=86, method=6)
    cen[nome] = {'f': f'{nome}.webp', 'w': im.width, 'h': im.height}

manifesto['_cenario'] = cen
(SAIDA / 'manifesto.json').write_text(json.dumps(manifesto, ensure_ascii=False, indent=1), encoding='utf-8')
print(json.dumps(cen, indent=1))
