import { describe, expect, it } from 'vitest';
import { espalhar, reto, type Fase, type Vizinho } from './motor';
import { vestir } from './elenco';
import { aleatorio } from './variar';
import { fasesApressado } from './apressado';
import { jogar, resolverTrilho } from './trilho';

// a mesma fase com o Nando virando um morador comum (aceita seta e não passa sozinho)
const semPressa = <F extends Fase>(f: F): F => ({ ...f, vizinhos: f.vizinhos.map((v) => (v.tipo === 'apressado' ? { ...v, tipo: 'comum' } : v)) });
const mesma = (a: Record<string, string>[], b: Record<string, string>) =>
  a.length === 1 && JSON.stringify(Object.entries(a[0]).sort()) === JSON.stringify(Object.entries(b).sort());
const rotulos = fasesApressado.map((f, i) => [`P${i + 1}`, f.titulo, f] as const);

// cruz: o Nando no meio, um vizinho em cada lado (esquerda e, f direita, c cima, b baixo), todos com passagem
const v = (id: string, tipo: Vizinho['tipo'], pos: [number, number]): Vizinho => ({ id, nome: id, tipo, pos });
const cruz: Fase = {
  titulo: '', boato: '', giros: 0,
  vizinhos: [v('p', 'apressado', [1, 1]), v('e', 'comum', [0, 1]), v('f', 'comum', [2, 1]), v('c', 'comum', [1, 0]), v('b', 'comum', [1, 2])],
  amizades: [['p', 'e'], ['p', 'f'], ['p', 'c'], ['p', 'b']],
};

describe('motor: o apressado passa reto', () => {
  it('pro lado oposto de quem contou, nos quatro sentidos', () => {
    const nando = cruz.vizinhos[0];
    expect(reto(cruz, nando, 'e')).toBe('f');
    expect(reto(cruz, nando, 'f')).toBe('e');
    expect(reto(cruz, nando, 'c')).toBe('b');
    expect(reto(cruz, nando, 'b')).toBe('c');
  });

  it('sem passagem do outro lado, guarda', () => {
    const semSaida: Fase = { ...cruz, amizades: cruz.amizades.filter(([, b]) => b !== 'f') };
    const r = espalhar(semSaida, { origem: 'e', setas: { e: 'p' } });
    expect(r.ouviu.p).toBeDefined();
    expect(r.ouviu.f).toBeUndefined();
    expect(r.batidas.flat().some((m) => m.de === 'p')).toBe(false);
  });

  it('conta sozinho na batida seguinte, sem gastar seta', () => {
    const r = espalhar(cruz, { origem: 'c', setas: { c: 'p' } });
    expect(r.ouviu.b).toMatchObject({ batida: 2, de: 'p' });
  });

  it('não aceita seta desenhada', () => {
    const r = espalhar(cruz, { origem: 'c', setas: { c: 'p', p: 'e' } });
    expect(r.ouviu.e).toBeUndefined();
  });
});

describe('bloco Apressado', () => {
  it.each(rotulos)('%s (%s): uma solução só, dentro das setas', (_n, _t, f) => {
    expect(mesma(resolverTrilho(f), f.solucao)).toBe(true);
    expect(jogar(f, f.solucao).vitoria).toBe(true);
  });

  it.each(rotulos)('%s (%s): com o Nando comum, a jogada muda', (_n, _t, f) => {
    expect(mesma(resolverTrilho(semPressa(f)), f.solucao)).toBe(false);
  });

  it.each(rotulos)('%s (%s): a armadilha perde', (_n, _t, f) => {
    expect(jogar(f, f.armadilha!).vitoria).toBe(false);
  });

  it('P1: o Nando entrega pra estrela; P2 e P3: a armadilha vaza pelo Nando, pro Zé', () => {
    expect(jogar(fasesApressado[0], fasesApressado[0].solucao).ouviu.b.de).toBe('p');
    for (const f of fasesApressado.slice(1)) expect(jogar(f, f.armadilha!)).toMatchObject({ motivo: 'assunto_ouviu', culpado: 'z' });
    for (const f of fasesApressado.slice(1)) expect(jogar(f, f.armadilha!).ouviu.z.de).toBe('p');
  });

  it('o Nando continua Nando no sorteio do elenco, e ninguém mais vira Nando', () => {
    for (const f of fasesApressado) for (let s = 1; s < 40; s++) expect(vestir(f, aleatorio(s)).vizinhos.filter((v) => v.nome === 'Nando')).toHaveLength(1);
  });
});
