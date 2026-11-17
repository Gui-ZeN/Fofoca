// Designer 4 — "o boato muda no caminho" (2026-11-17). Tamanho e versão mudam a cada passo (Exagerado +1, Do Contra inverte,
// Arnaldo −1 em quem mora colado) e o vilão fica NO caminho: o "aha" é a ORDEM em que o boato passa por quem mexe nele.
import type { Vizinho } from '../motor';
import type { AndarDesenhado } from './tipo';

const v = (id: string, nome: string, tipo: Vizinho['tipo'], pos: [number, number], extra: Partial<Vizinho> = {}): Vizinho =>
  ({ id, nome, tipo, pos, ...extra });
const arnaldo = (id: string, pos: [number, number]) => v(id, 'Arnaldo', 'assunto', pos, { abafa: true });
const vera = (id: string, pos: [number, number]) => v(id, 'Vera', 'assunto', pos, { vigia: true });

export const andares: AndarDesenhado[] = [
  {
    // FÁCIL 1 — 3×3. Cida quer boato (2). Beto aumenta, mas mora colado no Arnaldo e fala baixo de novo.
    //   Ana    Beto*   Cida(2)         * = colado no Arnaldo (abafa)
    //   Rita*  Arnaldo Tânia           Rita também mora colada nele (corredor), mas ela só tem 1 mesmo.
    //   Davi   Lúcia   Bia
    // Atalho: Rita → Ana → Beto → Cida (3 setas) chega cochicho. A volta é por baixo, pela Lúcia, que aumenta longe do Arnaldo.
    dificuldade: 'facil',
    referencia: 'Baba Is You: a regra que você lê pelo efeito (o Beto sempre aumenta, só que aqui o vizinho do Arnaldo desfaz).',
    ideia: 'Quem aumenta o boato precisa estar longe do Arnaldo: a Lúcia, lá embaixo, entrega o tamanho que o Beto perde.',
    vilao: 'O Arnaldo está no meio do prédio e o Beto, o caminho curto, mora colado nele: a fofoca nasce e morre no mesmo passo.',
    fase: {
      titulo: 'Fala baixo, Beto',
      boato: 'O Arnaldo ensaia ópera no chuveiro',
      giros: 0, setas: 5, origens: ['r'],
      vizinhos: [
        v('a', 'Ana', 'comum', [0, 0]), v('b', 'Beto', 'exagerado', [1, 0]), v('c', 'Cida', 'comum', [2, 0], { interesse: { tamanho: 2 } }),
        v('r', 'Rita', 'comum', [0, 1]), arnaldo('z', [1, 1]), v('t', 'Tânia', 'comum', [2, 1]),
        v('d', 'Davi', 'comum', [0, 2]), v('l', 'Lúcia', 'exagerado', [1, 2]), v('i', 'Bia', 'comum', [2, 2]),
      ],
      amizades: [['r', 'a'], ['a', 'b'], ['b', 'c'], ['r', 'z'], ['z', 'b'], ['r', 'd'], ['d', 'l'], ['l', 'i'], ['i', 't'], ['t', 'c']],
      solucao: { r: 'd', d: 'l', l: 'i', i: 't', t: 'c' },
      armadilha: { r: 'a', a: 'b', b: 'c' },
    },
  },
  {
    // FÁCIL 2 — 4×3. Cida quer a versão invertida. Só o Nonato inverte. O Edu é a porta do Nonato, mas mora colado na Vera:
    // quando ele conta pro Nonato, ela escuta. A volta pela Ana é mais longa e passa longe dela.
    //   Ana     Nonato  Cida(inv)  Davi
    //   Bia     Edu*    Vera       Tânia      * = colado na Vera
    //   Dudu    Rita    Íris       Tetê
    dificuldade: 'facil',
    referencia: 'Baba Is You: o efeito mostra a regra (só o Do Contra vira o boato do avesso).',
    ideia: 'O caminho até o Do Contra é o mesmo de sempre, mas a porta que o leva passa na frente da Vera: tem que ir pelo outro lado.',
    vilao: 'A Vera escuta o Edu contar pro Nonato; o atalho de 3 setas é justamente o que passa pelo Edu.',
    fase: {
      titulo: 'Do avesso, sem a Vera',
      boato: 'A Vera coleciona bilhete premiado de rifa',
      giros: 0, setas: 5, origens: ['r'],
      vizinhos: [
        v('a', 'Ana', 'comum', [0, 0]), v('n', 'Nonato', 'docontra', [1, 0]), v('c', 'Cida', 'comum', [2, 0], { interesse: { versao: 'invertida' } }), v('w', 'Davi', 'comum', [3, 0]),
        v('b', 'Bia', 'comum', [0, 1]), v('e', 'Edu', 'comum', [1, 1]), vera('x', [2, 1]), v('t', 'Tânia', 'comum', [3, 1]),
        v('d', 'Dudu', 'comum', [0, 2]), v('r', 'Rita', 'comum', [1, 2]), v('i', 'Íris', 'comum', [2, 2]), v('u', 'Tetê', 'comum', [3, 2]),
      ],
      amizades: [['r', 'e'], ['e', 'x'], ['e', 'n'], ['n', 'c'], ['n', 'a'], ['a', 'b'], ['b', 'd'], ['d', 'r'], ['c', 'w'], ['w', 't'], ['t', 'u'], ['u', 'i'], ['i', 'r']],
      solucao: { r: 'd', d: 'b', b: 'a', a: 'n', n: 'c' },
      armadilha: { r: 'e', e: 'n', n: 'c' },
    },
  },
  // ⚠️ "A volta por baixo" (médio, muro fino) saiu em 2026-11-17: a última seta da solução voltava pra quem já sabia, só pra o
  // escândalo vazar pelo muro — o dono travou ("esse não tem como"), e o conferidor agora reprova seta pra quem já sabe.
  {
    // MÉDIO 2 — 3×4. Cida quer boato (2) E invertido. O Nonato mora colado no Arnaldo: inverte, mas fala baixo (tira 1).
    //   Ana    Rui     Cida(2, avesso)     * = colado no Arnaldo: só o Nonato
    //   Edu    Arnaldo Marlene
    //   Lúcia  Nonato* Bia
    //   Davi   Rita    Kátia
    // Certa (6): Rita → Nonato (1, fica 1: já é o piso) → Lúcia (2) → Edu → Ana → Rui → Cida: 2 e invertido.
    // Tentadora (6, mesmo tamanho): Rita → Davi → Lúcia (2) → Nonato (inverte, mas o Arnaldo derruba pra 1) → Bia → Marlene → Cida.
    // O Nonato é o mesmo, a ORDEM muda: abafar antes de aumentar não custa nada; depois, custa o tamanho.
    dificuldade: 'medio',
    referencia: 'Baba Is You: as mesmas duas regras em ordem trocada dão resultados diferentes (Nonato antes ou depois da Lúcia).',
    ideia: 'Quem inverte mora colado no Arnaldo: passe por ele ANTES da Lúcia, quando o boato ainda é o menor possível.',
    vilao: 'O Arnaldo está no meio do prédio, colado na única porta do Nonato: o caminho de sempre (Lúcia e depois o Nonato) o faz falar baixo.',
    fase: {
      titulo: 'Nonato primeiro',
      boato: 'O Arnaldo afina o violão às seis da manhã',
      giros: 0, setas: 6, origens: ['r'],
      vizinhos: [
        v('a', 'Ana', 'comum', [0, 0]), v('u', 'Rui', 'comum', [1, 0]), v('c', 'Cida', 'comum', [2, 0], { interesse: { tamanho: 2, versao: 'invertida' } }),
        v('e', 'Edu', 'comum', [0, 1]), arnaldo('z', [1, 1]), v('d', 'Marlene', 'comum', [2, 1]),
        v('l', 'Lúcia', 'exagerado', [0, 2]), v('n', 'Nonato', 'docontra', [1, 2]), v('f', 'Bia', 'comum', [2, 2]),
        v('w', 'Davi', 'comum', [0, 3]), v('r', 'Rita', 'comum', [1, 3]), v('k', 'Kátia', 'comum', [2, 3]),
      ],
      amizades: [['a', 'u'], ['u', 'c'], ['e', 'a'], ['l', 'e'], ['l', 'n'], ['n', 'f'], ['f', 'd'], ['d', 'c'], ['z', 'n'], ['r', 'n'], ['r', 'w'], ['w', 'l'], ['r', 'k'], ['k', 'f']],
      solucao: { r: 'n', n: 'l', l: 'e', e: 'a', a: 'u', u: 'c' },
      armadilha: { r: 'w', w: 'l', l: 'n', n: 'f', f: 'd', d: 'c' },
    },
  },
  {
    // DIFÍCIL 1 — 4×4. O Edu quer boato (2) E invertido; o Arnaldo mora embaixo e tem um colado em cada saída: Lúcia, Paulo e Rita.
    //   Kátia  Cida    Jandira  Bia
    //   Tetê   Lia     Edu(2,avesso) Beto
    //   Nonato Lúcia*  Wesley   Mirela        * = colado no Arnaldo (abafa): Lúcia, Paulo, Rita
    //   Paulo* Arnaldo Rita*    Rui
    // Curto (2): Rita → Wesley → Edu chega 1 e normal. A Lúcia aumenta mas mora colada no Arnaldo: +1 e −1 se anulam. Quem aumenta de verdade é o Beto,
    // e só no fim: Rita → Wesley → Lúcia (1) → Nonato (inverte) → Tetê → Kátia → Cida → Jandira → Bia → Beto (2) → Edu. É a volta toda.
    dificuldade: 'dificil',
    referencia: 'The Witness: cada vizinho tem uma regra que se lê pelo efeito, e o caminho certo é o que usa todas na ordem que o desenho permite.',
    ideia: 'Quem aumenta tem que estar longe do Arnaldo: a Lúcia, colada nele, desperdiça o +1; o Beto, no fim da volta, entrega o tamanho.',
    vilao: 'O Arnaldo tem um colado em cada saída do centro: o caminho curto passa por eles e a Lúcia aumenta e abafa no mesmo passo.',
    fase: {
      titulo: 'Do avesso, devagar',
      boato: 'O Arnaldo guarda o gato da vizinha no armário',
      giros: 0, setas: 10, origens: ['k'],
      vizinhos: [
        v('a', 'Kátia', 'comum', [0, 0]), v('u', 'Cida', 'comum', [1, 0]), v('c', 'Jandira', 'comum', [2, 0]), v('q', 'Bia', 'comum', [3, 0]),
        v('e', 'Tetê', 'comum', [0, 1]), v('z', 'Lia', 'comum', [1, 1]), v('d', 'Edu', 'comum', [2, 1], { interesse: { tamanho: 2, versao: 'invertida' } }), v('i', 'Beto', 'exagerado', [3, 1]),
        v('b', 'Nonato', 'docontra', [0, 2]), v('n', 'Lúcia', 'exagerado', [1, 2]), v('l', 'Wesley', 'comum', [2, 2]), v('x', 'Mirela', 'comum', [3, 2]),
        v('w', 'Paulo', 'comum', [0, 3]), arnaldo('r', [1, 3]), v('k', 'Rita', 'comum', [2, 3]), v('t', 'Rui', 'comum', [3, 3]),
      ],
      amizades: [['a', 'u'], ['u', 'c'], ['e', 'a'], ['b', 'e'], ['b', 'n'], ['n', 'l'], ['l', 'd'], ['d', 'c'], ['z', 'n'], ['r', 'n'], ['r', 'w'], ['w', 'b'], ['r', 'k'], ['k', 'l'], ['c', 'q'], ['q', 'i'], ['i', 'x'], ['x', 'l'], ['x', 't'], ['t', 'k'], ['i', 'd']],
      solucao: { k: 'l', l: 'n', n: 'b', b: 'e', e: 'a', a: 'u', u: 'c', c: 'q', q: 'i', i: 'd' },
      armadilha: { k: 'l', l: 'd' },
    },
  },
  {
    // DIFÍCIL 2 — 4×4. Wesley quer ESCÂNDALO (3) e invertido. Beto e Lúcia têm que aumentar em sequência, sem o Seu Chico (colado no Arnaldo) no meio.
    //   Mirela  Caio    Nonato   Wesley(3,avesso)
    //   Rita    Arnaldo Paulo    Jandira
    //   Beto    Chico*  Lúcia    Edu          * = colado no Arnaldo (abafa): só o Seu Chico
    //   Tetê    Solange Zefa     Íris
    // Tentadora (4): Rita → Mirela → Caio → Nonato → Wesley chega 1 e invertido. Pelo meio, Beto → Seu Chico derruba o +1 do Beto.
    // Certa (8): Rita → Beto (2) → Tetê → Solange → Zefa → Lúcia (3) → Paulo → Nonato (inverte) → Wesley: a volta por baixo contorna o Seu Chico.
    dificuldade: 'dificil',
    referencia: 'A Monster Expedition: o atalho existe e é o caminho que o puzzle proíbe; Baba Is You: duas regras de aumento que só valem juntas.',
    ideia: 'Para chegar ao escândalo, Beto e Lúcia têm que aumentar seguidos; o Seu Chico, colado no Arnaldo, quebra a sequência: contorne por baixo.',
    vilao: 'O Arnaldo no meio do prédio e o Seu Chico entre o Beto e a Lúcia: o caminho do meio os une e desfaz o aumento.',
    fase: {
      titulo: 'Dois exagerados, uma fresta',
      boato: 'O Arnaldo faz churrasco no corredor',
      giros: 0, setas: 8, origens: ['e'],
      vizinhos: [
        v('a', 'Mirela', 'comum', [0, 0]), v('u', 'Caio', 'comum', [1, 0]), v('c', 'Nonato', 'docontra', [2, 0]), v('q', 'Wesley', 'comum', [3, 0], { interesse: { tamanho: 3, versao: 'invertida' } }),
        v('e', 'Rita', 'comum', [0, 1]), arnaldo('z', [1, 1]), v('d', 'Paulo', 'comum', [2, 1]), v('i', 'Jandira', 'comum', [3, 1]),
        v('b', 'Beto', 'exagerado', [0, 2]), v('n', 'Seu Chico', 'comum', [1, 2]), v('l', 'Lúcia', 'exagerado', [2, 2]), v('x', 'Edu', 'comum', [3, 2]),
        v('w', 'Tetê', 'comum', [0, 3]), v('r', 'Solange', 'comum', [1, 3]), v('k', 'Dona Zefa', 'comum', [2, 3]), v('t', 'Íris', 'comum', [3, 3]),
      ],
      amizades: [['a', 'u'], ['u', 'c'], ['e', 'a'], ['b', 'e'], ['b', 'n'], ['n', 'l'], ['l', 'd'], ['d', 'c'], ['z', 'n'], ['r', 'n'], ['r', 'w'], ['w', 'b'], ['r', 'k'], ['k', 'l'], ['c', 'q'], ['q', 'i'], ['i', 'x'], ['x', 'l'], ['x', 't'], ['t', 'k'], ['i', 'd']],
      solucao: { e: 'b', b: 'w', w: 'r', r: 'k', k: 'l', l: 'd', d: 'c', c: 'q' },
      armadilha: { e: 'a', a: 'u', u: 'c', c: 'q' },
    },
  },
];
