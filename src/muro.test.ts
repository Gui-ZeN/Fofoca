import { describe, expect, it } from 'vitest';
import type { Fase, Vizinho } from './motor';
import { explicar } from './explicar';
import { fasesMuro } from './muro';
import { fasesInterfone } from './interfone';
import { fasesEsfria } from './esfria';
import { jogar, resolverTrilho, type FaseTrilho } from './trilho';


// A M3 antiga (até 2026-11-17), mantida aqui só como cenário dos testes do MOTOR abaixo (Fofoqueira no muro, ronda passando no
// muro): a fase de verdade foi refeita (src/muro.ts), mas esses defeitos foram achados e provados neste prédio.
const vv = (id: string, nome: string, tipo: Vizinho['tipo'], pos: [number, number], extra: Partial<Vizinho> = {}): Vizinho => ({ id, nome, tipo, pos, ...extra });
const escandaloT = { interesse: { tamanho: 3 as const } };
const M3_ANTIGA: FaseTrilho = {
    // Dois muros: o do Rui (colado no Zé) entrega a vítima, o do Caio (colado na Cida) leva o escândalo até ela. A Neide espalha o
    // boato pro prédio todo sem custar seta. O tentador é o Beto contar pro Rui, que mora na porta da Cida: o escândalo vaza pro Zé.
    // O Caio, que não toca no Zé, é quem conta o escândalo pro Beto de volta, e a Cida ouve pela parede dele.
    titulo: 'Duas paredes',
    boato: 'O Seu Zé aluga a vaga da garagem em dobro',
    // ⚠️ tinha a Lu de segunda Fofoqueira (achado do auditor, 2026-11-17): com ela comum a solução é a mesma e única, e o muro
    // continua decidindo. Uma regra a menos pra ler. (No esfria as duas ficam: lá o par é o que faz o prazo pesar.)
    giros: 0, setas: 4, origens: ['r'],
    vizinhos: [
      vv('b', 'Otávio', 'comum', [0, 0]), vv('f', 'Ana', 'comum', [1, 0]), vv('m', 'Jandira', 'comum', [2, 0]),
      vv('z', 'Seu Zé', 'assunto', [0, 1]), vv('r', 'Rita', 'comum', [1, 1]), vv('n', 'Neide', 'fofoqueira', [2, 1]), vv('d', 'Marlene', 'comum', [3, 1]),
      vv('g', 'Rui', 'comum', [0, 2]), vv('e', 'Beto', 'exagerado', [1, 2]), vv('l', 'Lúcia', 'exagerado', [2, 2]), vv('h', 'Solange', 'comum', [3, 2]),
      vv('s', 'Cida', 'comum', [0, 3], escandaloT), vv('c', 'Caio', 'comum', [1, 3]), vv('a', 'Edu', 'comum', [3, 3]),
    ],
    // ⚠️ o Edu tinha zero portas (achado do auditor, 2026-11-17); a porta pra Solange não muda a solução.
    amizades: [['r', 'e'], ['r', 'n'], ['r', 'f'], ['e', 'l'], ['e', 'c'], ['e', 'g'], ['l', 'n'], ['l', 'h'], ['s', 'g'], ['z', 'b'], ['n', 'm'], ['n', 'd'], ['m', 'f'], ['a', 'h']],
    murosFinos: [['z', 'g'], ['s', 'c']],
    solucao: { r: 'n', l: 'e', e: 'c', c: 'e' },
    armadilha: { r: 'n', l: 'e', e: 'g', g: 's' }, // o Rui conta escândalo pra Cida e o Zé, colado nele, ouve junto
  };

describe('bloco Muro fino', () => {
  const rotulos = fasesMuro.map((f, i) => [`M${i + 1}`, f.titulo, f] as const);
  const semMuros = <F extends Fase>(f: F): F => ({ ...f, murosFinos: undefined });
  const semUm = <F extends Fase>(f: F, i: number): F => ({ ...f, murosFinos: f.murosFinos!.filter((_, j) => j !== i) });
  const mesma = (a: Record<string, string>[], b: Record<string, string>) =>
    a.length === 1 && JSON.stringify(Object.entries(a[0]).sort()) === JSON.stringify(Object.entries(b).sort());
  const dim = (f: Fase) => [Math.max(...f.vizinhos.map((x) => x.pos[0])) + 1, Math.max(...f.vizinhos.map((x) => x.pos[1])) + 1];

  it('Fofoqueira no muro: o escândalo vaza UMA vez, não uma por vizinho pra quem ela contou', () => {
    // ⚠️ achado do auditor (2026-11-17): a Neide contando pra 4 vizinhos gerava 4 vazamentos iguais pro outro lado da
    // parede (o desfecho era o mesmo, mas a cena e o "Rever" mostravam 4 balões). Nenhuma fase combina os dois hoje.
    const f = { ...M3_ANTIGA, murosFinos: [['n', 'a']] as [string, string][] };
    const r = jogar(f, { r: 'e', e: 'l', l: 'n' });
    const vazou = r.batidas.flatMap((b, i) => b.filter((m) => m.vazou).map((m) => `${i + 1}:${m.de}>${m.para}`));
    expect(vazou).toEqual(['4:n>a']);
  });

  it('ronda passando no muro: a vítima escuta o vazamento como RONDA, não como se tivesse vazado pra ela', () => {
    // ⚠️ achado do auditor (2026-11-17): a mensagem da ronda copiava `vazou: true` do vazamento que escutou, e `explicar`
    // dizia "vazou pela parede pro Zé" quando ele estava visitando o Edu. Nenhuma fase combina ronda e muro hoje.
    const f = { ...M3_ANTIGA, murosFinos: [['n', 'a']] as [string, string][],
      vizinhos: M3_ANTIGA.vizinhos.map((x) => (x.id === 'z' ? { ...x, ronda: ['z', 'z', 'z', 'a'] } : x)) };
    const r = jogar(f, { r: 'e', e: 'l', l: 'n' });
    expect(r.batidas.flat().filter((m) => m.ronda).map((m) => [m.de, m.para, !!m.vazou])).toEqual([['n', 'z', false]]);
    expect(explicar(f, r)).toMatchObject({ tipo: 'ronda', id: 'a', vitima: 'z', batida: 4 });
  });

  it('são três: estreia (perigo), atalho e as duas paredes juntas', () => {
    expect(fasesMuro).toHaveLength(3);
    expect(fasesMuro.map((f) => f.murosFinos!.length)).toEqual([1, 1, 2]);
  });

  it('tamanhos: 3×3 ou 4×3, 4×3 ou 4×4, 4×4 ou 5×4 (até 15 moradores)', () => {
    expect(dim(fasesMuro[0])).toEqual([3, 3]);
    expect(dim(fasesMuro[1])).toEqual([4, 3]);
    expect(dim(fasesMuro[2])).toEqual([4, 4]);
    for (const f of fasesMuro) expect(f.vizinhos.length).toBeLessThanOrEqual(15);
  });

  it.each(rotulos)('%s (%s): solução única dentro das setas, e nenhuma com uma a menos', (_n, _t, f) => {
    expect(mesma(resolverTrilho(f), f.solucao)).toBe(true);
    // setas = K (justo) ou K+1 (folga, como a M3 refeita: deixa a armadilha caber na mão), igual ao conferidor
    const K = Object.keys(f.solucao).length;
    expect([K, K + 1]).toContain(f.setas);
    expect(resolverTrilho(f, K - 1)).toEqual([]);
    expect(jogar(f, f.solucao).vitoria).toBe(true);
  });

  it.each(rotulos)('%s (%s): ids de uma letra e únicos; quem tem nome tem desenho', (_n, _t, f) => {
    const ids = f.vizinhos.map((x) => x.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id).toHaveLength(1);
    const conhecidos = new Set(['Rita', 'Cida', 'Bia', 'Ana', 'Neide', 'Lu', 'Beto', 'Lúcia', 'Davi', 'Rui', 'Edu', 'Lia', 'Marlene', 'Caio',
      'Jandira', 'Otávio', 'Celina', 'Solange', 'Ivo', 'Seu Zé']);
    for (const x of f.vizinhos) expect(conhecidos.has(x.nome), x.nome).toBe(true);
    const nomes = f.vizinhos.map((x) => x.nome);
    expect(new Set(nomes).size).toBe(nomes.length);
  });

  it.each(rotulos)('%s (%s): cada muro liga cômodos colados e SEM passagem', (_n, _t, f) => {
    for (const [a, b] of f.murosFinos!) {
      const [x, y] = [f.vizinhos.find((w) => w.id === a)!, f.vizinhos.find((w) => w.id === b)!];
      expect(Math.abs(x.pos[0] - y.pos[0]) + Math.abs(x.pos[1] - y.pos[1])).toBe(1);
      expect(f.amizades.some(([p, q]) => (p === a && q === b) || (p === b && q === a))).toBe(false);
    }
  });

  it.each(rotulos)('%s (%s): a armadilha perde', (_n, _t, f) => {
    expect(jogar(f, f.armadilha!).vitoria).toBe(false);
    expect(Object.keys(f.armadilha!).length).toBeLessThanOrEqual(f.setas);
  });

  it('M1 e M3: a armadilha perde porque o escândalo vazou pro Zé, e sem o muro ela venceria', () => {
    for (const f of [fasesMuro[0], fasesMuro[2]]) {
      const r = jogar(f, f.armadilha!);
      expect(r.motivo).toBe('assunto_ouviu');
      expect(explicar(f, r)).toMatchObject({ tipo: 'vazou', para: 'z' });
      expect(jogar(semMuros(f), f.armadilha!).vitoria).toBe(true);
      expect(mesma(resolverTrilho(semMuros(f)), f.solucao)).toBe(false); // sem o muro a solução deixa de ser a mesma
      expect(jogar(f, f.solucao).ouviu.z).toBeUndefined();
    }
  });

  it('M1 (perigo): a solução não vaza nada; o Beto, colado no Zé, só conta cochicho/boato', () => {
    const f = fasesMuro[0];
    expect(jogar(f, f.solucao).batidas.flat().some((m) => m.vazou)).toBe(false);
    expect(jogar(f, f.solucao).batidas.flat().filter((m) => m.de === 'e').every((m) => m.tamanho < 3)).toBe(true);
    expect(fasesMuro[0].vizinhos.filter((x) => x.tipo === 'exagerado')).toHaveLength(2);
  });

  // achados por papel: os ids das fases refeitas saíram da busca (a Neide pode ser `z`)
  const papel = (f: FaseTrilho) => ({
    ze: f.vizinhos.find((x) => x.tipo === 'assunto')!.id,
    escandalo: f.vizinhos.find((x) => x.interesse?.tamanho === 3)!.id,
    outra: f.vizinhos.find((x) => x.interesse && !x.interesse.tamanho)?.id,
  });
  const quemJaSabia = (f: FaseTrilho) => {
    const r = jogar(f, f.solucao);
    return Object.entries(f.solucao).filter(([de, para]) => {
      const i = r.batidas.findIndex((ms) => ms.some((m) => m.de === de && m.para === para && !m.vazou && !m.escuta));
      return i >= 0 && r.ouviu[para] && r.ouviu[para].batida < i + 1;
    });
  };

  it.each(rotulos)('%s (%s): nenhuma seta da solução vai pra quem já sabia (o vício das antigas M2 e M3)', (_n, _t, f) => {
    expect(quemJaSabia(f)).toEqual([]);
  });

  it('M2 (atalho): sem o muro não há solução; a estrela sem tamanho ouve pela parede, e a armadilha é o atalho pela Neide', () => {
    const f = fasesMuro[1], { ze, outra } = papel(f);
    expect(resolverTrilho(semMuros(f))).toEqual([]);
    const r = jogar(f, f.solucao);
    expect(r.batidas.flat().some((m) => m.vazou && m.para === outra)).toBe(true);
    expect(r.ouviu[ze]).toBeUndefined();
    const ra = jogar(f, f.armadilha!);
    expect(ra.motivo).toBe('assunto_ouviu');
    expect(f.vizinhos.find((x) => x.id === Object.values(f.armadilha!)[0])!.tipo).toBe('fofoqueira'); // a 1ª seta da armadilha vai pra Neide
  });

  it('M3 (dois muros): cada um é necessário; o da porta da Cida vaza pro Zé, o da Neide leva a estrela', () => {
    const f = fasesMuro[2], { ze, escandalo } = papel(f);
    f.murosFinos!.forEach((_, i) => expect(mesma(resolverTrilho(semUm(f, i)), f.solucao)).toBe(false));
    expect(f.murosFinos!.some((m) => m.includes(ze))).toBe(true);
    expect(f.murosFinos!.some((m) => m.includes(escandalo))).toBe(true);
    expect(jogar(f, f.solucao).batidas.flat().some((m) => m.vazou && m.para === escandalo)).toBe(true);
    const ra = jogar(f, f.armadilha!);
    expect(ra.motivo).toBe('assunto_ouviu');
    expect(ra.batidas.flat().some((m) => m.vazou && m.para === ze)).toBe(true); // perde PELO muro
    expect(f.vizinhos.filter((x) => x.tipo === 'fofoqueira').length).toBeGreaterThan(0);
  });

  it('teto de leitura: tamanho é a única regra especial (o Exagerado só pesa por causa dele)', () => {
    for (const f of fasesMuro) {
      expect(f.vizinhos.every((x) => !x.chega && !x.celular && !x.sai && !x.abafa && !x.desconfia && !x.vigia && !x.recolhe && !x.teto && !x.ronda && !x.soneca)).toBe(true);
      expect(f.vizinhos.some((x) => x.interesse?.tamanho === 3)).toBe(true);
    }
  });

  it('a primeira fase traz a novidade, e só ela', () => {
    expect(fasesMuro[0].novidade).toBe('Muro fino: escândalo contado ali vaza pro vizinho do outro lado');
    expect(fasesMuro.slice(1).every((f) => !f.novidade)).toBe(true);
  });
});

describe('ninguém solto nas fases das mecânicas de prédio grande', () => {
  // ⚠️ Bia (I2), Ivo (M2) e Edu (M3) estavam sem porta nenhuma, corrigido em 2026-11-17; a Lu da M3 virou comum (auditor pediu a guarda)
  it.each([...fasesInterfone, ...fasesMuro, ...fasesEsfria].map((f) => [f.titulo, f] as const))('%s: todo morador tem porta, fio ou muro', (_t, f) => {
    const ligados = new Set([...(f.amizades ?? []), ...(f.interfones ?? []), ...(f.murosFinos ?? [])].flat());
    expect(f.vizinhos.filter((v) => !ligados.has(v.id)).map((v) => v.nome)).toEqual([]);
  });
  it('a M3 tem uma Fofoqueira só (a Neide)', () => {
    expect(fasesMuro[2].vizinhos.filter((v) => v.tipo === 'fofoqueira').map((v) => v.nome)).toEqual(['Neide']);
  });
});
