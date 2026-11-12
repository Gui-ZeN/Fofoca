import { describe, expect, it } from 'vitest';
import { espalhar, type Fase, type Vizinho } from './motor';
import { falhas, medirQuase, quaseBasta } from './quase';
import { ESTOQUE } from './campanha';

const v = (id: string, tipo: Vizinho['tipo'], pos: [number, number], extra: Partial<Vizinho> = {}): Vizinho => ({ id, nome: id, tipo, pos, ...extra });
// corredor r → a → c (estrela) com o Zé colado na c
const corredor = (extraA: Partial<Vizinho> = {}, extraC: Partial<Vizinho> = {}): Fase => ({
  titulo: '', boato: '', giros: 0, origens: ['r'],
  vizinhos: [v('r', 'comum', [0, 0]), v('a', 'comum', [1, 0], extraA), v('c', 'comum', [2, 0], { interesse: {}, ...extraC }), v('z', 'assunto', [2, 1])],
  amizades: [['r', 'a'], ['a', 'c'], ['c', 'z']],
});

describe('o que conta como "quase de verdade"', () => {
  it('a estrela sem notícia NÃO é quase de verdade (qualquer plano incompleto cai nisso)', () => {
    const f = corredor();
    expect(falhas(f, espalhar(f, { origem: 'r', setas: { r: 'a' } }))).toEqual(['sem notícia']);
  });

  it('recado perdido na padaria — da estrela ou de quem está no meio do caminho — é "chegou cedo"', () => {
    const estrelaFora = corredor({}, { chega: 5 });
    const plano = { r: 'a', a: 'c' };
    expect(falhas(estrelaFora, espalhar(estrelaFora, { origem: 'r', setas: plano }), plano)).toEqual(['chegou cedo']);
    const meioFora = corredor({ chega: 3 });
    expect(falhas(meioFora, espalhar(meioFora, { origem: 'r', setas: plano }), plano)).toEqual(['chegou cedo']);
  });

  it('recado perdido que NÃO ia pra estrela não vira "chegou cedo" (falso positivo que o Astra achou)', () => {
    // o Zé está na padaria e a Rita conta só pra ele: ninguém mandou nada na direção da estrela
    const f: Fase = {
      titulo: '', boato: '', giros: 0, origens: ['r'],
      vizinhos: [v('r', 'comum', [0, 0]), v('z', 'assunto', [1, 0], { chega: 5 }), v('a', 'comum', [0, 1]), v('c', 'comum', [1, 1], { interesse: {} })],
      amizades: [['r', 'z'], ['r', 'a'], ['a', 'c']],
    };
    const plano = { r: 'z' };
    expect(falhas(f, espalhar(f, { origem: 'r', setas: plano }), plano)).toEqual(['sem notícia']);
  });

  it('a Raquel sem a 2ª fonte e a vizinha da Dona Norma depois da hora também são quase de verdade', () => {
    const plano = { r: 'a', a: 'c' };
    const raquel = corredor({ desconfia: true });
    expect(falhas(raquel, espalhar(raquel, { origem: 'r', setas: plano }), plano)).toEqual(['faltou a 2ª fonte']);
    const norma: Fase = { ...corredor(), vizinhos: corredor().vizinhos.map((x) => (x.id === 'z' ? { ...x, recolhe: 1, pos: [1, 1] as [number, number] } : x)), amizades: [['r', 'a'], ['a', 'c'], ['a', 'z']] };
    expect(falhas(norma, espalhar(norma, { origem: 'r', setas: plano }), plano)).toEqual(['passou da hora']);
  });

  it('o Zé ouvindo DEPOIS de a estrela saber é "no finzinho"; antes, é só "vítima ouviu"', () => {
    const f = corredor();
    expect(falhas(f, espalhar(f, { origem: 'r', setas: { r: 'a', a: 'c', c: 'z' } }))).toEqual(['vítima no finzinho']);
    const cedo: Fase = { ...f, amizades: [...f.amizades, ['a', 'z']] };
    expect(falhas(cedo, espalhar(cedo, { origem: 'r', setas: { r: 'a', a: 'z' } }))).toContain('vítima ouviu');
  });
});

describe('estoque: todo andar tem o "quaseee"', () => {
  it('≥ 3 quases de verdade (resultados diferentes) e o caminho óbvio também quase acerta', () => {
    const ruins = ESTOQUE.flatMap((f, i) => (quaseBasta(medirQuase(f)) ? [] : [i]));
    expect(ruins).toEqual([]);
  }, 600_000);
});
