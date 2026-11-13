import { describe, expect, it } from 'vitest';
import { alvosDe, amigosDe, portaDe, porInterfone, type Fase } from './motor';
import { fasesInterfone } from './interfone';
import { custo, jogar, resolverTrilho, type FaseTrilho, type Plano } from './trilho';

const rotulos = fasesInterfone.map((f, i) => [`I${i + 1}`, f.titulo, f] as const);
const semFio = <F extends Fase>(f: F, tirar?: [string, string][]): F => {
  const resta = tirar ? (f.interfones ?? []).filter((x) => !tirar.includes(x)) : [];
  return { ...f, interfones: resta.length ? resta : undefined };
};
const mesma = (a: Plano[], b: Plano) =>
  a.length === 1 && JSON.stringify(Object.entries(a[0]).sort()) === JSON.stringify(Object.entries(b).sort());
const dist = (f: Fase, a: string, b: string) => {
  const [p, q] = [a, b].map((id) => f.vizinhos.find((x) => x.id === id)!.pos);
  return Math.abs(p[0] - q[0]) + Math.abs(p[1] - q[1]);
};
const colunas = (f: Fase) => Math.max(...f.vizinhos.map((x) => x.pos[0])) + 1;
const andares = (f: Fase) => Math.max(...f.vizinhos.map((x) => x.pos[1])) + 1;
// nomes com desenho (as fases à mão + o elenco de elenco.ts, que o gerador também usa)
const COM_DESENHO = new Set(['Rita', 'Cida', 'Bia', 'Ana', 'Neide', 'Lu', 'Beto', 'Lúcia', 'Davi', 'Rui', 'Edu', 'Lia', 'Marlene', 'Caio', 'Jandira', 'Otávio', 'Celina', 'Solange', 'Ivo', 'Seu Zé']);
// o plano tem alguma seta que a fase não permite? (o motor não confere: quem confere é a tela, por `alvosDe`)
const ilegal = (f: Fase, p: Plano) =>
  Object.entries(p).some(([a, b]) => !alvosDe(f, f.vizinhos.find((x) => x.id === a)!).includes(b));
// quantas setas do plano vão por um fio
const porFio = (f: Fase, p: Plano) => Object.entries(p).filter(([a, b]) => porInterfone(f, a, b)).length;
// o fio foi usado de verdade (seta ou Fofoqueira espalhando) em alguma batida?
const fiosUsados = (f: FaseTrilho, p: Plano) => {
  const msgs = jogar(f, p).batidas.flat();
  return (f.interfones ?? []).filter(([a, b]) => msgs.some((m) => (m.de === a && m.para === b) || (m.de === b && m.para === a)));
};

describe('motor: interfone (o que as fases daqui dependem)', () => {
  it('os dois do par viram vizinhos um do outro; a porta já existente não duplica', () => {
    const f: Fase = {
      titulo: '', boato: '', giros: 0, interfones: [['a', 'c'], ['a', 'b']],
      vizinhos: ['a', 'b', 'c'].map((id, i) => ({ id, nome: id, tipo: 'comum' as const, pos: [i * 2, 0] as [number, number] })),
      amizades: [['a', 'b']],
    };
    expect(amigosDe(f, 'a')).toEqual(['b', 'c']);
    expect(portaDe(f, 'a')).toEqual(['b']);
    expect(porInterfone(f, 'a', 'c')).toBe(true);
    expect(porInterfone(f, 'a', 'b')).toBe(false); // tem porta: vale a porta
  });
});

describe('bloco Interfone', () => {
  it('são três, na ordem: o atalho que vale, o atalho que é armadilha, o atalho certo entre dois', () => {
    expect(fasesInterfone).toHaveLength(3);
    expect(fasesInterfone.map((f) => f.interfones!.length)).toEqual([1, 1, 2]);
  });

  it.each(rotulos)('%s (%s): solução única dentro das setas, e nenhuma com uma a menos', (_n, _t, f) => {
    expect(mesma(resolverTrilho(f), f.solucao)).toBe(true);
    expect(custo(f.solucao)).toBe(f.setas);
    expect(resolverTrilho(f, f.setas - 1)).toEqual([]);
    expect(jogar(f, f.solucao).vitoria).toBe(true);
  });

  it.each(rotulos)('%s (%s): cada fio liga dois moradores que NÃO são vizinhos de parede (≥ 2 cômodos de distância)', (_n, _t, f) => {
    for (const [a, b] of f.interfones!) {
      expect(f.vizinhos.some((x) => x.id === a) && f.vizinhos.some((x) => x.id === b)).toBe(true);
      expect(portaDe(f, a)).not.toContain(b);
      expect(dist(f, a, b)).toBeGreaterThanOrEqual(2);
      expect(a === 'z' || b === 'z').toBe(false); // o fio nunca é da vítima
    }
    // uma ponta só em cada fio (um morador não tem dois fios)
    const pontas = f.interfones!.flat();
    expect(new Set(pontas).size).toBe(pontas.length);
  });

  it.each(rotulos)('%s (%s): ids de uma letra, únicos; só nomes que já têm desenho nas outras fases', (_n, _t, f) => {
    const ids = f.vizinhos.map((x) => x.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const x of f.vizinhos) { expect(x.id).toHaveLength(1); expect(COM_DESENHO.has(x.nome), x.nome).toBe(true); }
    expect(f.vizinhos.filter((x) => x.tipo === 'assunto').map((x) => [x.id, x.nome])).toEqual([['z', 'Seu Zé']]);
    expect(f.vizinhos.find((x) => x.id === f.origens[0])!.nome).toBe('Rita');
  });

  it('prédios largos: I1 4×3, I2 4×3 ou 4×4, I3 5×4 (até 15 moradores)', () => {
    const [a, b, c] = fasesInterfone;
    expect([colunas(a), andares(a)]).toEqual([4, 3]);
    expect(colunas(b)).toBe(4);
    expect([3, 4]).toContain(andares(b));
    expect([colunas(c), andares(c)]).toEqual([5, 4]);
    expect(c.vizinhos.length).toBeLessThanOrEqual(15);
  });

  it('só a primeira fase traz a novidade', () => {
    expect(fasesInterfone[0].novidade).toBe('Interfone: dois apartamentos longe um do outro viram vizinhos');
    expect(fasesInterfone.slice(1).every((f) => !f.novidade)).toBe(true);
  });

  it('teto de leitura: no máximo a Fofoqueira + 2 regras (o interfone conta 1)', () => {
    for (const f of fasesInterfone) {
      const regras = new Set<string>(['interfone']);
      for (const x of f.vizinhos) {
        if (x.sai !== undefined) regras.add('saída');
        if (x.chega) regras.add('padaria');
        if (x.interesse?.tamanho || x.interesse?.minTamanho || x.interesse?.ordem) regras.add('tamanho/ordem');
        if (x.celular) regras.add('celular');
        if (x.tipo === 'docontra' || x.interesse?.versao) regras.add('versão');
        if (x.abafa || x.desconfia || x.vigia || x.recolhe || x.teto || x.tipo === 'apressado' || x.tipo === 'exagerado') regras.add('outra');
      }
      expect(regras.size).toBeLessThanOrEqual(3);
    }
  });

  it('I1 (estreia): sem o fio não há solução dentro das setas, e a solução tem uma seta por ele', () => {
    const f = fasesInterfone[0];
    expect(resolverTrilho(semFio(f))).toEqual([]);
    expect(porFio(f, f.solucao)).toBe(1);
    // o caminho a pé existe, mas custa mais do que as setas dão: a armadilha é gastar a mais, não perder pra vítima
    expect(custo(f.armadilha!)).toBeGreaterThan(f.setas);
    expect(fiosUsados(f, f.armadilha!)).toEqual([]);
    expect(jogar(semFio(f), f.armadilha!).vitoria).toBe(true);
  });

  it('I2 (fio armadilha): a solução vai a pé; quem usa o atalho faz o boato chegar na vítima', () => {
    const f = fasesInterfone[1];
    expect(porFio(f, f.solucao)).toBe(0);
    expect(fiosUsados(f, f.solucao)).toEqual([]);
    expect(custo(f.armadilha!)).toBeLessThan(f.setas); // o atalho economiza setas: é isso que tenta
    const r = jogar(f, f.armadilha!);
    expect(r.vitoria).toBe(false);
    expect(r.motivo).toBe('assunto_ouviu');
    expect(fiosUsados(f, f.armadilha!)).toHaveLength(1);
    // o fio é a causa: sem ele a última seta da armadilha nem existe (o Davi só conta pra Neide por interfone)
    expect(ilegal(semFio(f), f.armadilha!)).toBe(true);
    expect(ilegal(semFio(f), f.solucao)).toBe(false);
    // uma das pontas é a Fofoqueira, e ela mora colada na vítima
    const [a, b] = f.interfones![0];
    const fof = [a, b].find((id) => f.vizinhos.find((x) => x.id === id)!.tipo === 'fofoqueira')!;
    expect(fof).toBeDefined();
    expect(portaDe(f, fof)).toContain('z');
    // a presença do fio muda o quebra-cabeça: com ele existe um plano que custa menos e perde; sem ele, o único caminho é a pé
    expect(mesma(resolverTrilho(semFio(f)), f.solucao)).toBe(true);
  });

  it('I3 (dois fios): a solução usa um e evita o outro; sem o fio usado, ou sem nenhum, a solução muda', () => {
    const f = fasesInterfone[2];
    const [usado] = fiosUsados(f, f.solucao);
    expect(fiosUsados(f, f.solucao)).toHaveLength(1);
    expect(porFio(f, f.solucao)).toBe(1);
    const livre = f.interfones!.find((x) => x !== usado)!;
    expect(fiosUsados(f, f.armadilha!)).toContain(livre);
    const r = jogar(f, f.armadilha!);
    expect(r.vitoria).toBe(false);
    expect(r.motivo).toBe('assunto_ouviu');
    expect(custo(f.armadilha!)).toBeLessThan(f.setas);
    expect(ilegal(semFio(f, [livre]), f.armadilha!)).toBe(true); // o fio errado é a causa: sem ele a seta não existe
    expect(ilegal(semFio(f, [livre]), f.solucao)).toBe(false);
    expect(resolverTrilho(semFio(f))).toEqual([]); // sem fio nenhum, não há como
    expect(mesma(resolverTrilho(semFio(f, [usado])), f.solucao)).toBe(false);
    expect(f.vizinhos.some((x) => x.tipo === 'fofoqueira')).toBe(true);
  });
});
