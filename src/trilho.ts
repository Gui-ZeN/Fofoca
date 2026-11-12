// Protótipo do trilho: o jogador desenha quem conta pra quem, a partir de quem ele encontrou hoje.
// Tutorial só até a fase 5 (dica com a regra, nunca com a jogada). Depois, regra nova só é sinalizada
// (`novidade`, uma linha); quem não ler e errar, aprende errando — decisão do usuário, 2026-11-10.
// 10 fases feitas à mão (Consulta 1 com o Sol, 2026-11-10) para o teste com pessoas, antes de
// migrar o gerador. Cada fase traz a solução pretendida e a armadilha que ela ensina a evitar;
// os testes conferem as duas com o resolvedor.

import { alvosDe, controlavel, espalhar, type Fase, type Vizinho } from './motor';

export type Plano = Record<string, string>; // quem → pra quem (cada um no máximo uma seta)

export interface FaseTrilho extends Fase {
  setas: number;
  origens: [string];
  solucao: Plano;
  armadilha?: Plano; // o caminho tentador que perde (ou não cabe nas setas)
  folga?: boolean; // sobra seta de propósito (pra mostrar que não precisa gastar tudo)
}

export const jogar = (fase: Fase, plano: Plano) => espalhar(fase, { origem: fase.origens![0], setas: plano });
export const custo = (plano: Plano) => Object.keys(plano).length;

// Todas as vitórias mínimas (tirar qualquer seta faz perder) com até `setas` setas.
// Só decide a seta de quem de fato ouve, na ordem em que ouve: seta de quem nunca ouve não muda nada
// (seria redundante), e acrescentar setas nunca faz alguém deixar de ouvir. Conferido contra a força
// bruta antiga em 485 casos (todas as fases e prédios aleatórios), sem diferença; prédio 3×4 cabe.
export function resolverTrilho(fase: Fase, limite = fase.setas ?? 0): Plano[] {
  const vitorias: Plano[] = [];
  const decidir = (plano: Plano, decididos: Set<string>, usadas: number) => {
    const r = jogar(fase, plano);
    let prox: Vizinho | undefined, quando = Infinity;
    for (const v of fase.vizinhos) {
      const o = r.ouviu[v.id];
      if (o && controlavel(v) && !decididos.has(v.id) && o.batida < quando) { prox = v; quando = o.batida; }
    }
    if (!prox) { if (r.vitoria) vitorias.push(plano); return; }
    const d = new Set(decididos).add(prox.id);
    decidir(plano, d, usadas); // guarda pra si
    if (usadas < limite) for (const alvo of alvosDe(fase, prox)) decidir({ ...plano, [prox.id]: alvo }, d, usadas + 1);
  };
  decidir({}, new Set(), 0);
  return vitorias.filter((plano) => Object.keys(plano).every((id) => {
    const { [id]: _, ...sem } = plano;
    return !jogar(fase, sem).vitoria;
  }));
}

// Variação ao abrir a fase: espelhar o prédio inteiro preserva exatamente o quebra-cabeça.
export function espelhar<F extends Fase>(fase: F): F {
  const largura = Math.max(...fase.vizinhos.map((v) => v.pos[0]));
  return { ...fase, vizinhos: fase.vizinhos.map((v) => ({ ...v, pos: [largura - v.pos[0], v.pos[1]] })) };
}

const v = (id: string, nome: string, tipo: Vizinho['tipo'], pos: [number, number], extra: Partial<Vizinho> = {}): Vizinho =>
  ({ id, nome, tipo, pos, ...extra });
const ze = (pos: [number, number]) => v('z', 'Seu Zé', 'assunto', pos);
const quer = { interesse: {} };

export const fasesTrilho: FaseTrilho[] = [
  {
    titulo: 'Primeira ligação',
    boato: 'O Seu Zé dá bom dia pro elevador', // nada de aparência como piada (PRODUCT.md)
    // o objetivo em uma frase: a 1ª fase não dizia o que fazer (Consulta 4, Astra)
    dica: 'Faça o boato chegar em quem tem a estrela.',
    giros: 0, setas: 2, origens: ['r'],
    vizinhos: [v('r', 'Rita', 'comum', [0, 0]), v('a', 'Ana', 'comum', [1, 0]), v('c', 'Cida', 'comum', [2, 0], quer)],
    amizades: [['r', 'a'], ['a', 'c']],
    solucao: { r: 'a', a: 'c' },
  },
  {
    titulo: 'Sem seta, guarda',
    boato: 'O Seu Zé dorme de touca',
    dica: 'Quem fica sem seta guarda o boato pra si.',
    giros: 0, setas: 3, origens: ['r'], folga: true,
    vizinhos: [v('r', 'Rita', 'comum', [0, 0]), v('a', 'Ana', 'comum', [1, 0]), v('c', 'Cida', 'comum', [2, 0], quer), ze([2, 1])],
    amizades: [['r', 'a'], ['a', 'c'], ['c', 'z']],
    solucao: { r: 'a', a: 'c' },
    armadilha: { r: 'a', a: 'c', c: 'z' },
  },
  {
    titulo: 'Passa adiante',
    boato: 'O Seu Zé chorou na novela',
    dica: 'Quem quer saber também pode passar adiante.',
    giros: 0, setas: 3, origens: ['r'],
    vizinhos: [
      v('r', 'Rita', 'comum', [0, 0]), v('a', 'Ana', 'comum', [1, 0]), v('c', 'Cida', 'comum', [2, 0], quer),
      ze([1, 1]), v('b', 'Bia', 'comum', [2, 1], quer),
    ],
    amizades: [['r', 'a'], ['a', 'c'], ['c', 'b'], ['a', 'z']],
    solucao: { r: 'a', a: 'c', c: 'b' },
    armadilha: { r: 'a', a: 'z' },
  },
  {
    titulo: 'A fofoqueira',
    boato: 'O Seu Zé tem medo de pombo',
    dica: 'A Neide é fofoqueira: conta pra todo mundo em volta, sem você mandar.',
    giros: 0, setas: 3, origens: ['r'],
    vizinhos: [
      v('r', 'Rita', 'comum', [0, 0]), v('n', 'Neide', 'fofoqueira', [1, 0]), ze([2, 0]),
      v('d', 'Davi', 'comum', [0, 1]), v('a', 'Ana', 'comum', [1, 1]), v('c', 'Cida', 'comum', [2, 1], quer),
    ],
    amizades: [['r', 'n'], ['n', 'z'], ['n', 'a'], ['r', 'd'], ['d', 'a'], ['a', 'c']],
    solucao: { r: 'd', d: 'a', a: 'c' },
    armadilha: { r: 'n', a: 'c' },
  },
  {
    titulo: 'Fofoqueira do bem',
    boato: 'O Seu Zé canta no chuveiro',
    dica: 'Duas pessoas querem saber.',
    giros: 0, setas: 2, origens: ['r'],
    vizinhos: [
      v('c', 'Cida', 'comum', [0, 0], quer), v('n', 'Neide', 'fofoqueira', [1, 0]), v('b', 'Bia', 'comum', [2, 0], quer),
      v('r', 'Rita', 'comum', [0, 1]), v('a', 'Ana', 'comum', [1, 1]), ze([2, 1]),
    ],
    amizades: [['c', 'n'], ['n', 'b'], ['r', 'a'], ['a', 'n'], ['a', 'z']],
    solucao: { r: 'a', a: 'n' },
    armadilha: { r: 'a', a: 'z' },
  },
  {
    titulo: 'Só três setas',
    boato: 'O Seu Zé ensaia karaokê na garagem',
    giros: 0, setas: 3, origens: ['r'],
    vizinhos: [
      v('c', 'Cida', 'comum', [0, 0], quer), v('d', 'Davi', 'comum', [1, 0]), v('b', 'Bia', 'comum', [2, 0], quer),
      v('r', 'Rita', 'comum', [0, 1]), v('n', 'Neide', 'fofoqueira', [1, 1]), v('u', 'Rui', 'comum', [2, 1]),
      ze([0, 2]),
    ],
    amizades: [['r', 'n'], ['n', 'd'], ['n', 'u'], ['d', 'c'], ['u', 'b'], ['r', 'c'], ['r', 'z']],
    solucao: { r: 'n', d: 'c', u: 'b' },
    armadilha: { r: 'c', c: 'd', d: 'n', u: 'b' }, // atender a Cida primeiro custa 4
  },
  {
    titulo: 'Recado na portaria',
    boato: 'O Seu Zé ganhou na rifa e não contou',
    giros: 0, setas: 4, origens: ['r'],
    vizinhos: [
      v('r', 'Rita', 'comum', [0, 0]), v('n', 'Neide', 'fofoqueira', [1, 0]), ze([2, 0]),
      v('d', 'Davi', 'comum', [0, 1]), v('c', 'Cida', 'comum', [1, 1], quer),
      v('a', 'Ana', 'comum', [0, 2]), v('b', 'Bia', 'comum', [1, 2]),
    ],
    amizades: [['r', 'n'], ['n', 'c'], ['n', 'z'], ['r', 'd'], ['d', 'a'], ['a', 'b'], ['b', 'c']],
    solucao: { r: 'd', d: 'a', a: 'b', b: 'c' },
    armadilha: { r: 'n' },
  },
  {
    titulo: 'Boato na medida',
    boato: 'O Seu Zé dança forró escondido',
    novidade: 'Exagerado: aumenta o boato um tamanho',
    giros: 0, setas: 3, origens: ['r'],
    vizinhos: [
      v('r', 'Rita', 'comum', [0, 0]), v('e', 'Beto', 'exagerado', [1, 0]), v('l', 'Lúcia', 'exagerado', [2, 0]),
      v('a', 'Ana', 'comum', [0, 1]), v('d', 'Davi', 'comum', [1, 1]), v('c', 'Cida', 'comum', [2, 1], { interesse: { tamanho: 2 } }),
    ],
    amizades: [['r', 'e'], ['e', 'l'], ['l', 'c'], ['r', 'a'], ['a', 'd'], ['d', 'c'], ['e', 'd']],
    solucao: { r: 'e', e: 'd', d: 'c' },
    armadilha: { r: 'e', e: 'l', l: 'c' }, // dois exagerados viram escândalo
  },
  {
    titulo: 'Escândalo na medida',
    boato: 'O Seu Zé conversa com as plantas',
    giros: 0, setas: 4, origens: ['r'],
    vizinhos: [
      v('r', 'Rita', 'comum', [0, 0]), v('e', 'Beto', 'exagerado', [1, 0]), v('n', 'Neide', 'fofoqueira', [2, 0]),
      v('a', 'Ana', 'comum', [0, 1]), v('l', 'Lúcia', 'exagerado', [1, 1]), ze([2, 1]),
      v('d', 'Davi', 'comum', [0, 2]), v('u', 'Rui', 'comum', [1, 2]), v('c', 'Cida', 'comum', [2, 2], { interesse: { tamanho: 3 } }),
    ],
    amizades: [['r', 'e'], ['e', 'n'], ['n', 'z'], ['e', 'l'], ['r', 'a'], ['a', 'l'], ['l', 'u'], ['a', 'd'], ['d', 'u'], ['u', 'c']],
    solucao: { r: 'e', e: 'l', l: 'u', u: 'c' },
    armadilha: { r: 'a', a: 'l', l: 'u', u: 'c' }, // um exagerado só: chega boato, não escândalo
  },
  {
    titulo: 'Liga pra ela',
    boato: 'O Seu Zé tem uma tartaruga chamada Dona Flor',
    novidade: 'Celular: liga pra alguém longe, no lugar de contar pro vizinho',
    giros: 0, setas: 2, origens: ['r'],
    vizinhos: [
      v('r', 'Rita', 'comum', [0, 0]), v('a', 'Ana', 'comum', [1, 0]), ze([2, 0]),
      v('b', 'Bia', 'comum', [0, 1], { celular: ['c', 'z'] }), v('c', 'Cida', 'comum', [2, 1], quer),
    ],
    amizades: [['r', 'a'], ['a', 'z'], ['z', 'c'], ['r', 'b']],
    solucao: { r: 'b', b: 'c' },
    armadilha: { r: 'a', a: 'z' },
  },
];
