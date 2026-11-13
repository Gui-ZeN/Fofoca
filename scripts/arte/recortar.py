# Recorta as folhas de pose (fundo branco) em sprites com fundo transparente e grava o manifesto
# (public/arte/manifesto.json) que o jogo lê. Precisa de numpy, pillow e scipy.
#
# As folhas originais ficam em arte-fonte/ (FORA do Git: o repo é público e os recortes já estão nele):
#   arte-fonte/folhas/N.webp  → tabela FOLHAS (uma folha por personagem, numeradas na ordem em que chegaram)
#   arte-fonte/zip/NN.png     → tabela FOLHAS_ZIP (a 2ª leva, com o cochicho; vale com --zip)
#   arte-fonte/leva3/NN.png   → tabela FOLHAS_LEVA3 (2026-11-13: 11 moradores novos + o Soneca; vale com --leva3),
#                               mais ze-ronda.webp (pose "ronda" do Seu Zé, de lanterna) e interfone.webp (o aparelho)
#
# Refazer tudo (da pasta Fofoca), nesta ordem — a 2ª passada só refaz quem não está no zip:
#   python -I scripts/arte/recortar.py arte-fonte/zip <saida> --zip
#   python -I scripts/arte/recortar.py arte-fonte/folhas <saida> 42 43 44 46
#   python -I scripts/arte/recortar.py arte-fonte/leva3 <saida> --leva3
#   python -I scripts/arte/cenario.py arte-fonte/folhas <saida>        (fundos dos cômodos, telhado e bairro)
# Personagem novo: acrescente a folha em FOLHAS e rode só ela (ex.: ... arte-fonte/folhas <saida> 47).
#
# ⚠️ Grave numa CÓPIA de public/arte e copie de volta: gravando direto, com o servidor de desenvolvimento aberto,
# o codificador WebP falhou ("encoding error 1") e deixou arquivos pela metade (a Bia sumiu do prédio).
# Pra conferir o que vira fundo antes de recortar: scripts/arte/ver_buracos.py pinta de vermelho.
import json, sys, unicodedata
from pathlib import Path
import numpy as np
from PIL import Image
from scipy import ndimage

ORIG, SAIDA = Path(sys.argv[1]), Path(sys.argv[2])
SAIDA.mkdir(parents=True, exist_ok=True)

# folha -> (nome, poses na ordem, pra onde olha, altura relativa)
FOLHAS = {
    9: ('Lúcia', ['parado', 'susto'], 1, 0.95),
    10: ('Lia', ['parado', 'susto'], 1, 0.9),
    11: ('Cida', ['parado', 'susto', 'bravo'], 1, 0.8),
    12: ('Lu', ['parado', 'susto'], 1, 0.9),
    13: ('Ana', ['parado', 'susto', 'bravo'], 1, 0.96),
    15: ('Bia', ['parado', 'susto', 'bravo'], 1, 0.88),
    16: ('Neide', ['parado', 'susto', 'ouvindo'], 1, 0.88),
    17: ('Davi', ['parado', 'susto', 'bravo'], 1, 0.92),
    18: ('Rita', ['parado', 'susto', 'bravo'], 1, 0.95),
    19: ('Rui', ['parado', 'susto', 'bravo'], -1, 1.0),
    29: ('Beto', ['parado', 'susto'], 1, 0.92),  # a 23 (mão no bolso) foi trocada por esta, de braços abertos
    28: ('Edu', ['parado', 'susto', 'bravo'], 1, 0.95),
    # os 12 novos (2026-11-11): 4 fiscais + 8 moradores
    30: ('Vera', ['parado', 'susto', 'bravo'], 1, 0.9),
    31: ('Dr. Álvaro', ['parado', 'susto', 'bravo'], 1, 0.95),
    32: ('Arnaldo', ['parado', 'susto', 'bravo'], 1, 0.88),
    33: ('Solange', ['parado', 'susto', 'bravo'], 1, 0.9),
    34: ('Ivo', ['parado', 'susto', 'bravo'], 1, 0.9),
    35: ('Dona Norma', ['parado', 'susto', 'bravo'], 1, 0.88),
    36: ('Otávio', ['parado', 'susto', 'bravo'], 1, 0.9),
    37: ('Celina', ['parado', 'susto', 'bravo'], 1, 0.92),
    38: ('Nando', ['parado', 'susto', 'bravo'], 1, 0.95),
    39: ('Jandira', ['parado', 'susto', 'bravo'], 1, 0.85),
    40: ('Caio', ['parado', 'susto', 'bravo'], 1, 0.9),
    41: ('Marlene', ['parado', 'susto', 'bravo'], 1, 0.9),
    24: ('Seu Zé', ['parado', 'susto', 'bravo'], 1, 0.9),
    # com o cochicho: o Do Contra (desenho próprio, vale pra quem tiver esse tipo) e o Edu refeito
    42: ('Nonato', ['parado', 'susto', 'bravo', 'cochicho'], 1, 0.88),
    43: ('Edu', ['parado', 'susto', 'bravo', 'cochicho'], 1, 0.95),
    44: ('Padre', ['parado', 'susto', 'bravo', 'cochicho'], 1, 0.92),
    # Raquel, a desconfiada (2026-11-12): com o Yorkshire do lado em todas as poses
    46: ('Raquel', ['parado', 'susto', 'bravo', 'cochicho'], 1, 0.92),
}
# folhas em que uma figura encosta na outra (o cachorro da 3ª pose quase toca a 4ª): corte forçado nessas colunas
CORTES = {46: [1463]}
# 2ª leva (zip "nova pose de cochicho", 2026-11-11): a folha inteira de cada um, com olhos corrigidos e o cochicho.
# Arquivos NN.png extraídos do zip; repetidas: Cida 08 (duas mãos), Lia 07, Rui 09, Davi 10 (olhos corrigidos).
FOLHAS_ZIP = {
    8: ('Cida', ['parado', 'susto', 'bravo', 'cochicho'], 1, 0.8),
    1: ('Ana', ['parado', 'susto', 'bravo', 'cochicho'], 1, 0.96),
    2: ('Beto', ['parado', 'susto', 'cochicho'], 1, 0.92),
    3: ('Bia', ['parado', 'susto', 'bravo', 'cochicho'], 1, 0.88),
    4: ('Neide', ['parado', 'susto', 'ouvindo', 'cochicho'], 1, 0.88),
    5: ('Seu Zé', ['parado', 'susto', 'bravo', 'cochicho'], 1, 0.9),
    6: ('Lu', ['parado', 'susto', 'cochicho'], 1, 0.9),
    7: ('Lia', ['parado', 'susto', 'cochicho'], 1, 0.9),
    9: ('Rui', ['parado', 'susto', 'bravo', 'cochicho'], -1, 1.0),
    10: ('Davi', ['parado', 'susto', 'bravo', 'cochicho'], 1, 0.92),
    11: ('Dona Norma', ['parado', 'susto', 'bravo', 'cochicho'], 1, 0.88),
    12: ('Vera', ['parado', 'susto', 'bravo', 'cochicho'], 1, 0.9),
    13: ('Dr. Álvaro', ['parado', 'susto', 'bravo', 'cochicho'], 1, 0.95),
    14: ('Ivo', ['parado', 'susto', 'bravo', 'cochicho'], 1, 0.9),
    15: ('Arnaldo', ['parado', 'susto', 'bravo', 'cochicho'], 1, 0.88),
    16: ('Solange', ['parado', 'susto', 'bravo', 'cochicho'], 1, 0.9),
    17: ('Nando', ['parado', 'susto', 'bravo', 'cochicho'], 1, 0.95),
    18: ('Caio', ['parado', 'susto', 'bravo', 'cochicho'], 1, 0.9),
    19: ('Jandira', ['parado', 'susto', 'bravo', 'cochicho'], 1, 0.85),
    20: ('Otávio', ['parado', 'susto', 'bravo', 'cochicho'], 1, 0.9),
    21: ('Celina', ['parado', 'susto', 'bravo', 'cochicho'], 1, 0.92),
    23: ('Marlene', ['parado', 'susto', 'bravo', 'cochicho'], 1, 0.9),
    24: ('Lúcia', ['parado', 'susto', 'cochicho'], 1, 0.95),
    25: ('Rita', ['parado', 'susto', 'bravo', 'cochicho'], 1, 0.95),
}
# 3ª leva (zip do dono, 2026-11-13): moradores comuns pra encher os prédios de 5 colunas, e o Soneca (a mecânica).
# Todos com parado, cochicho e susto, olhando pra direita. ⚠️ Sem "bravo": nenhum deles é vítima sorteada.
FOLHAS_LEVA3 = {
    1: ('Dona Zefa', ['parado', 'cochicho', 'susto'], 1, 0.8),
    2: ('Dudu', ['parado', 'cochicho', 'susto'], 1, 0.92),
    3: ('Íris', ['parado', 'cochicho', 'susto'], 1, 0.9),
    4: ('Kátia', ['parado', 'cochicho', 'susto'], 1, 0.92),
    5: ('Mirela', ['parado', 'cochicho', 'susto'], 1, 0.9),
    6: ('Paulo', ['parado', 'cochicho', 'susto'], 1, 0.95),
    7: ('Seu Chico', ['parado', 'cochicho', 'susto'], 1, 0.85),
    8: ('Tânia', ['parado', 'cochicho', 'susto'], 1, 0.9),
    9: ('Tetê', ['parado', 'cochicho', 'susto'], 1, 0.85),
    10: ('Wesley', ['parado', 'cochicho', 'susto'], 1, 0.92),
    11: ('Zeca', ['parado', 'cochicho', 'susto'], 1, 0.92),
    12: ('Soneca', ['parado', 'cochicho', 'susto'], 1, 0.82),
}
# pose que olha pro lado contrário do resto da folha
OLHA_POSE = {('Rui', 'cochicho'): 1}
LEVA3 = '--leva3' in sys.argv
ZIP = '--zip' in sys.argv or LEVA3  # as duas levas de zip têm arquivos NN.png e somam ao manifesto que já existe
if LEVA3:
    FOLHAS = FOLHAS_LEVA3
elif ZIP:
    FOLHAS = FOLHAS_ZIP
ALT = 460  # px de altura do sprite: ⚠️ 300 borrava em celular de tela 3x (o morador aparece com ~340 px reais)


def figuras(tinta):
    """faixas de colunas com desenho, juntando buracos pequenos (a Bia e o cachorro ficam juntos)"""
    cols = tinta.sum(0) > 2
    faixas, ini = [], None
    for x, c in enumerate(list(cols) + [False]):
        if c and ini is None: ini = x
        if not c and ini is not None: faixas.append([ini, x]); ini = None
    juntas = []
    for f in faixas:
        if juntas and f[0] - juntas[-1][1] < 40: juntas[-1][1] = f[1]
        else: juntas.append(f)
    return [f for f in juntas if f[1] - f[0] > 80]


def sem_fundo(rgb):
    """apaga o branco ligado à borda (o branco de dentro, olho e avental, fica: está fechado pelo traço)"""
    claro = (rgb >= 200).all(axis=2)
    fundo = np.zeros_like(claro)
    fundo[0, :] = claro[0, :]; fundo[-1, :] = claro[-1, :]; fundo[:, 0] = claro[:, 0]; fundo[:, -1] = claro[:, -1]
    while True:
        g = fundo.copy()
        g[1:, :] |= fundo[:-1, :]; g[:-1, :] |= fundo[1:, :]; g[:, 1:] |= fundo[:, :-1]; g[:, :-1] |= fundo[:, 1:]
        g &= claro
        if (g == fundo).all(): return fundo
        fundo = g


def presos(rgb, fundo):
    """fundo preso: branco fechado pelo traço que é FUNDO, não desenho — o vão entre o braço e o corpo (mão na
    cintura) e entre as pernas. ⚠️ Olho, dente e avental também são brancos fechados; o que separa:
    - o fundo é cinza-branco neutro (r ≈ b); olho e dente deste traço são creme (r − b ≈ 30);
    - só da altura dos ombros pra baixo: na cabeça, o branco neutro é olho arregalado (Davi) ou lente de óculos (Lu)."""
    claro = (rgb >= 200).all(axis=2) & ~fundo
    rot, n = ndimage.label(claro)
    linhas = np.nonzero((~fundo).any(axis=1))[0]
    ombro = linhas.min() + 0.3 * (linhas.max() - linhas.min())
    out = np.zeros(fundo.shape, bool)
    for i in range(1, n + 1):
        m = rot == i
        if m.sum() < 300: continue
        mu = rgb[m].astype(int).mean(0)
        if mu.mean() >= 245 and abs(mu[0] - mu[2]) < 4 and np.nonzero(m)[0].mean() > ombro: out |= m
    return out


# só as folhas pedidas (ex.: 28 29), somando ao manifesto que já existe
SO = {int(a) for a in sys.argv[3:] if not a.startswith('--')}
arq_m = SAIDA / 'manifesto.json'
manifesto = json.loads(arq_m.read_text(encoding='utf-8')) if (SO or ZIP) and arq_m.exists() else {}
for n, (nome, poses, olha, alt) in FOLHAS.items():
    if SO and n not in SO: continue
    img = np.asarray(Image.open(ORIG / (f'{n:02d}.png' if ZIP else f'{n}.webp')).convert('RGB'))
    tinta = ~(img >= 225).all(axis=2)
    fs = figuras(tinta)
    for x in CORTES.get(n, []) if not ZIP else []:
        fs = [g for f in fs for g in ([[f[0], x], [x, f[1]]] if f[0] < x < f[1] else [f])]
    if len(fs) != len(poses):
        print(f'⚠️ {n} {nome}: achei {len(fs)} figuras, esperava {len(poses)}', [f for f in fs])
        continue
    manifesto[nome] = {'olha': olha, 'alt': alt, 'poses': {}}
    for (x0, x1), pose in zip(fs, poses):
        rgb = img[:, max(0, x0 - 12):x1 + 12]
        fundo = sem_fundo(rgb)
        fundo |= presos(rgb, fundo)
        a = np.where(fundo, 0, 255).astype(np.uint8)
        ys, xs = np.nonzero(a)
        rgba = np.dstack([rgb, a])[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
        im = Image.fromarray(rgba, 'RGBA')
        im = im.resize((round(im.width * ALT / im.height), ALT), Image.LANCZOS)
        # nome de arquivo sem acento, ponto nem espaço ("Dr. Álvaro" → "dr-alvaro")
        base = unicodedata.normalize('NFKD', nome.lower()).encode('ascii', 'ignore').decode().replace('.', '').replace(' ', '-')
        arq = f"{base}-{pose}.webp"
        # ⚠️ o codificador às vezes falha com method=6 ("encoding error 1"); o 4 é quase igual e não falha
        try: im.save(SAIDA / arq, 'WEBP', quality=82, method=6)
        except ValueError: im.save(SAIDA / arq, 'WEBP', quality=82, method=4)
        manifesto[nome]['poses'][pose] = {'f': arq, 'w': im.width, 'h': im.height, **({'olha': OLHA_POSE[(nome, pose)]} if (nome, pose) in OLHA_POSE else {})}
        print(nome, pose, im.size, (SAIDA / arq).stat().st_size // 1024, 'KB')



def recorte(arq, altura):
    """uma figura só numa imagem de fundo branco -> RGBA recortado, na altura pedida"""
    # ⚠️ imagem que já vem com fundo transparente (o interfone): convertida direto pra RGB o fundo vira PRETO e não sai
    orig = Image.open(arq).convert('RGBA')
    branco = Image.new('RGBA', orig.size, (255, 255, 255, 255)); branco.alpha_composite(orig)
    rgb = np.asarray(branco.convert('RGB'))
    fundo = sem_fundo(rgb)
    fundo |= presos(rgb, fundo)
    a = np.where(fundo, 0, 255).astype(np.uint8)
    ys, xs = np.nonzero(a)
    im = Image.fromarray(np.dstack([rgb, a])[ys.min():ys.max() + 1, xs.min():xs.max() + 1], 'RGBA')
    return im.resize((round(im.width * altura / im.height), altura), Image.LANCZOS)


if LEVA3 and not SO:
    # o Seu Zé andando de lanterna: pose "ronda" (a mecânica em que o vilão percorre o prédio)
    im = recorte(ORIG / 'ze-ronda.webp', ALT)
    im.save(SAIDA / 'seu-ze-ronda.webp', 'WEBP', quality=82, method=4)
    manifesto['Seu Zé']['poses']['ronda'] = {'f': 'seu-ze-ronda.webp', 'w': im.width, 'h': im.height}
    print('Seu Zé ronda', im.size)
    # o aparelho de interfone: objeto de cenário, fora do manifesto (o jogo chama pelo nome do arquivo)
    im = recorte(ORIG / 'interfone.webp', 200)
    im.save(SAIDA / 'interfone.webp', 'WEBP', quality=82, method=4)
    print('interfone', im.size)

(SAIDA / 'manifesto.json').write_text(json.dumps(manifesto, ensure_ascii=False, indent=1), encoding='utf-8')
print('total', sum(f.stat().st_size for f in SAIDA.glob('*.webp')) // 1024, 'KB')
