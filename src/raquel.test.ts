import { describe, expect, it } from 'vitest';
import { espalhar, type Fase, type Vizinho } from './motor';
import { explicar } from './explicar';
import { fasesRaquel } from './raquel';
import { jogar, resolverTrilho } from './trilho';

// a mesma fase com a Raquel acreditando de primeira (sem a regra)
const semDuvida = <F extends Fase>(f: F): F => ({ ...f, vizinhos: f.vizinhos.map((v) => ({ ...v, desconfia: undefined })) });
const mesma = (a: Record<string, string>[], b: Record<string, string>) =>
  a.length === 1 && JSON.stringify(Object.entries(a[0]).sort()) === JSON.stringify(Object.entries(b).sort());
const rotulos = fasesRaquel.map((f, i) => [`R${i + 1}`, f.titulo, f] as const);

// prédio mínimo: r conta pra a e pra b (a Fofoqueira f abre os dois galhos), os dois chegam na Raquel q
const v = (id: string, tipo: Vizinho['tipo'], pos: [number, number], extra: Partial<Vizinho> = {}): Vizinho => ({ id, nome: id, tipo, pos, ...extra });
const losango: Fase = {
  titulo: '', boato: '', giros: 0,
  vizinhos: [v('f', 'fofoqueira', [1, 0]), v('a', 'comum', [0, 1]), v('b', 'exagerado', [2, 1]), v('q', 'comum', [1, 1], { desconfia: true }), v('c', 'comum', [1, 2], { interesse: {} })],
  amizades: [['f', 'a'], ['f', 'b'], ['a', 'q'], ['b', 'q'], ['q', 'c']],
};

describe('motor: a desconfiada', () => {
  it('uma fonte só: fica em dúvida, não conta como ouviu e não repassa', () => {
    const r = espalhar(losango, { origem: 'f', setas: { a: 'q', q: 'c' } });
    expect(r.ouviu.q).toBeUndefined();
    expect(r.duvida?.q).toMatchObject({ de: 'a', batida: 2 });
    expect(r.ouviu.c).toBeUndefined();
  });

  it('duas fontes na mesma batida: acredita e repassa; o que vale é o recado que convenceu (o maior)', () => {
    const r = espalhar(losango, { origem: 'f', setas: { a: 'q', b: 'q', q: 'c' } });
    expect(r.ouviu.q).toMatchObject({ batida: 2, tamanho: 2, de: 'b' }); // o Exagerado b mandou fofoca
    expect(r.duvida).toBeUndefined(); // acreditou na hora: nunca esteve em dúvida
    expect(r.ouviu.c.tamanho).toBe(2);
    expect(r.vitoria).toBe(true);
  });

  it('duas fontes em batidas diferentes também convencem (a dúvida espera)', () => {
    const fase = fasesRaquel[0];
    const r = jogar(fase, fase.solucao);
    expect(r.ouviu.q.batida).toBe(4); // a Neide contou na 2, a Bia na 4
    expect(r.ouviu.q.de).toBe('n'); // dois cochichos: empate, vale o primeiro
    expect(r.duvida?.q).toMatchObject({ batida: 2, de: 'n' }); // entre a 2 e a 4, em dúvida (a tela mostra)
  });

  it('acredita no MAIOR dos dois recados, mesmo vindo em batidas diferentes (sem desempate escondido)', () => {
    // f conta pro Exagerado b e pra a (batida 1); b conta FOFOCA pra q na 2 (1º recado, o maior);
    // a conta pra e (2) e e conta COCHICHO pra q na 3 (2º recado). Antes valia o 2º; agora vale o maior.
    const w = (id: string, tipo: Vizinho['tipo'], pos: [number, number], extra: Partial<Vizinho> = {}): Vizinho => ({ id, nome: id, tipo, pos, ...extra });
    const f: Fase = {
      titulo: '', boato: '', giros: 0,
      vizinhos: [w('f', 'fofoqueira', [0, 0]), w('a', 'comum', [0, 1]), w('b', 'exagerado', [1, 0]), w('e', 'comum', [1, 1]), w('q', 'comum', [2, 1], { desconfia: true })],
      amizades: [['f', 'a'], ['f', 'b'], ['a', 'e'], ['e', 'q'], ['b', 'q']],
    };
    const r = espalhar(f, { origem: 'f', setas: { a: 'e', e: 'q', b: 'q' } });
    expect(r.duvida?.q).toMatchObject({ batida: 2, tamanho: 2, de: 'b' });
    expect(r.ouviu.q).toMatchObject({ batida: 3, tamanho: 2, de: 'b' }); // convenceu na 3, mas vale a fofoca do Beto
  });

  it('quem não desconfia continua acreditando de primeira', () => {
    const r = espalhar(semDuvida(losango), { origem: 'f', setas: { a: 'q', q: 'c' } });
    expect(r.ouviu.q).toBeDefined();
    expect(r.vitoria).toBe(true);
  });
});

describe('bloco Raquel', () => {
  it.each(rotulos)('%s (%s): uma solução só, dentro das setas', (_n, _t, f) => {
    expect(mesma(resolverTrilho(f), f.solucao)).toBe(true);
    expect(jogar(f, f.solucao).vitoria).toBe(true);
  });

  it.each(rotulos)('%s (%s): sem a desconfiança, a jogada muda', (_n, _t, f) => {
    expect(mesma(resolverTrilho(semDuvida(f)), f.solucao)).toBe(false);
  });

  it.each(rotulos)('%s (%s): a armadilha perde porque a Raquel ouviu de uma pessoa só', (_n, _t, f) => {
    const r = jogar(f, f.armadilha!);
    expect(r.vitoria).toBe(false);
    expect(r.duvida?.q).toBeDefined();
    expect(r.ouviu.z).toBeUndefined(); // não foi a vítima: foi a dúvida
  });

  it('a derrota explica: estrela desconfiada que ouviu de um só "não acreditou"', () => {
    const f = fasesRaquel[0];
    expect(explicar(f, jogar(f, f.armadilha!))).toEqual({ tipo: 'duvida', id: 'q', de: 'n' });
    // quando a estrela é outra, ela simplesmente não ouviu (a Raquel aparece em dúvida no prédio)
    const g = fasesRaquel[2];
    expect(explicar(g, jogar(g, g.armadilha!))).toEqual({ tipo: 'sem_noticia', id: 'c' });
  });

  it('só a Raquel desconfia, e ela usa a arte dela', () => {
    for (const f of fasesRaquel) expect(f.vizinhos.filter((x) => x.desconfia).map((x) => x.nome)).toEqual(['Raquel']);
  });
});
