import { describe, expect, it } from 'vitest';
import { espalhar, type Fase, type Vizinho } from './motor';
import { explicar } from './explicar';
import { fasesAlvaro, fasesNorma, fasesVera } from './fiscais';
import { jogar, resolverTrilho } from './trilho';

const semRegra = <F extends Fase>(f: F): F => ({ ...f, vizinhos: f.vizinhos.map((v) => ({ ...v, vigia: undefined, recolhe: undefined, teto: undefined })) });
const mesma = (a: Record<string, string>[], b: Record<string, string>) =>
  a.length === 1 && JSON.stringify(Object.entries(a[0]).sort()) === JSON.stringify(Object.entries(b).sort());
const v = (id: string, tipo: Vizinho['tipo'], pos: [number, number], extra: Partial<Vizinho> = {}): Vizinho => ({ id, nome: id, tipo, pos, ...extra });
// r → a → c em linha; a vítima z mora embaixo do a (colada nele)
const linha = (z: Partial<Vizinho>): Fase => ({
  titulo: '', boato: '', giros: 0, origens: ['r'],
  vizinhos: [v('r', 'comum', [0, 0]), v('a', 'comum', [1, 0]), v('c', 'comum', [2, 0], { interesse: {} }), v('z', 'assunto', [1, 1], z)],
  amizades: [['r', 'a'], ['a', 'c'], ['a', 'z']],
});

describe('Vera, a vigia', () => {
  it('escuta quando o vizinho dela CONTA pra outra pessoa', () => {
    const r = espalhar(linha({ vigia: true }), { origem: 'r', setas: { r: 'a', a: 'c' } });
    expect(r).toMatchObject({ vitoria: false, motivo: 'assunto_ouviu', culpado: 'z' });
    expect(r.ouviu.z.de).toBe('a');
    expect(r.batidas.flat().some((m) => m.escuta && m.de === 'a' && m.para === 'z')).toBe(true);
  });

  it('o vizinho que só recebe e guarda não é escutado', () => {
    const r = espalhar(linha({ vigia: true }), { origem: 'r', setas: { r: 'a' } });
    expect(r.ouviu.a).toBeDefined();
    expect(r.ouviu.z).toBeUndefined();
  });

  it('sem a regra, o mesmo plano vence', () => {
    expect(espalhar(linha({}), { origem: 'r', setas: { r: 'a', a: 'c' } }).vitoria).toBe(true);
  });
});

describe('Dona Norma, o toque de recolher', () => {
  it('depois da batida N, quem mora colado nela não conta mais nada', () => {
    const r = espalhar(linha({ recolhe: 1 }), { origem: 'r', setas: { r: 'a', a: 'c' } }); // o a contaria na batida 2
    expect(r.ouviu.a).toBeDefined();
    expect(r.ouviu.c).toBeUndefined();
    expect(r.motivo).toBe('interessado_nao_ouviu');
  });

  it('a derrota mostra quem foi calado e a que horas', () => {
    const f = linha({ recolhe: 1 });
    expect(explicar(f, espalhar(f, { origem: 'r', setas: { r: 'a', a: 'c' } }))).toEqual({ tipo: 'toque', id: 'a', batida: 2, hora: 1, norma: 'z' });
  });

  it('até a batida N, conta normalmente', () => {
    expect(espalhar(linha({ recolhe: 2 }), { origem: 'r', setas: { r: 'a', a: 'c' } }).vitoria).toBe(true);
  });
});

describe('Dr. Álvaro, a lotação', () => {
  it('passou do teto de pessoas sabendo, perde por gente demais (a origem conta)', () => {
    const r = espalhar(linha({ teto: 2 }), { origem: 'r', setas: { r: 'a', a: 'c' } }); // r, a, c = 3
    expect(r).toMatchObject({ vitoria: false, motivo: 'gente_demais', culpado: 'z' });
    expect(explicar(linha({ teto: 2 }), r)).toEqual({ tipo: 'demais', id: 'z', souberam: 3, teto: 2 });
  });

  it('no teto exato, vence', () => {
    expect(espalhar(linha({ teto: 3 }), { origem: 'r', setas: { r: 'a', a: 'c' } }).vitoria).toBe(true);
  });
});

describe.each([['Vera', fasesVera, 'assunto_ouviu'], ['Dona Norma', fasesNorma, 'interessado_nao_ouviu'], ['Dr. Álvaro', fasesAlvaro, 'gente_demais']] as const)('bloco %s', (nome, fases, motivo) => {
  it.each(fases.map((f) => [f.titulo, f] as const))('%s: uma solução só, nas setas justas', (_t, f) => {
    expect(mesma(resolverTrilho(f), f.solucao)).toBe(true);
    expect(resolverTrilho(f, f.setas - 1)).toHaveLength(0);
  });

  it.each(fases.map((f) => [f.titulo, f] as const))('%s: a armadilha vence sem a regra e perde por causa dela', (_t, f) => {
    expect(jogar(semRegra(f), f.armadilha!).vitoria).toBe(true);
    expect(jogar(f, f.armadilha!).motivo).toBe(motivo);
  });

  it('a vítima é o fiscal, com a regra dele', () => {
    for (const f of fases) {
      const z = f.vizinhos.find((x) => x.tipo === 'assunto')!;
      expect(z.nome).toBe(nome);
      expect(!!(z.vigia || z.recolhe || z.teto)).toBe(true);
    }
  });
});
