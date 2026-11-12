import { describe, expect, it } from 'vitest';
import { abafados, espalhar, type Fase } from './motor';
import { fasesArnaldo } from './arnaldo';
import { jogar, resolverTrilho } from './trilho';

// a mesma fase sem a regra do Arnaldo (ele vira uma vítima comum)
const semAbafa = <F extends Fase>(f: F): F => ({ ...f, vizinhos: f.vizinhos.map((v) => ({ ...v, abafa: undefined })) });
const mesma = (a: Record<string, string>[], b: Record<string, string>) =>
  a.length === 1 && JSON.stringify(Object.entries(a[0]).sort()) === JSON.stringify(Object.entries(b).sort());
const rotulos = fasesArnaldo.map((f, i) => [`A${i + 1}`, f.titulo, f] as const);

describe('regra do Arnaldo no motor', () => {
  // linha: o (origem) — x — y, com o Arnaldo colado no x
  const linha = (tipoX: 'comum' | 'exagerado' | 'fofoqueira', tamanhoOrigem: 1 | 2 | 3 = 1): Fase => ({
    titulo: '', boato: '', giros: 0,
    vizinhos: [
      { id: 'o', nome: 'O', tipo: 'comum', pos: [0, 0] }, { id: 'x', nome: 'X', tipo: tipoX, pos: [1, 0] },
      { id: 'y', nome: 'Y', tipo: 'comum', pos: [2, 0], interesse: {} }, { id: 'z', nome: 'Arnaldo', tipo: 'assunto', pos: [1, 1], abafa: true },
      ...(tamanhoOrigem > 1 ? [] : []),
    ],
    amizades: [['o', 'x'], ['x', 'y'], ['x', 'z']],
  });

  it('quem está colado nele é marcado; quem não está, não', () => {
    expect([...abafados(linha('comum'))]).toEqual(['x']);
  });

  it('cochicho continua cochicho', () => {
    const r = espalhar(linha('comum'), { origem: 'o', setas: { o: 'x', x: 'y' } });
    expect(r.ouviu.y.tamanho).toBe(1);
  });

  it('Exagerado colado nele: aumenta primeiro, reduz depois (cochicho → fofoca → cochicho)', () => {
    const r = espalhar(linha('exagerado'), { origem: 'o', setas: { o: 'x', x: 'y' } });
    expect(r.ouviu.y.tamanho).toBe(1);
  });

  it('com o teto em escândalo, +1 e −1 não se anulam (escândalo → escândalo → fofoca)', () => {
    const f = linha('exagerado');
    // escândalo chegando no X: uma corrente de dois Exagerados antes
    const g: Fase = {
      ...f,
      vizinhos: [
        { id: 'p', nome: 'P', tipo: 'exagerado', pos: [0, 1] }, { id: 'q', nome: 'Q', tipo: 'exagerado', pos: [0, 2] },
        ...f.vizinhos,
      ],
      amizades: [['p', 'q'], ['q', 'o'], ...f.amizades],
    };
    const r = espalhar(g, { origem: 'p', setas: { p: 'q', q: 'o', o: 'x', x: 'y' } });
    expect(r.ouviu.x.tamanho).toBe(3);
    expect(r.ouviu.y.tamanho).toBe(2);
  });

  it('a Fofoqueira colada nele espalha tudo reduzido (e conta pra ele: perde)', () => {
    const f = linha('fofoqueira');
    const g: Fase = { ...f, vizinhos: [{ id: 'p', nome: 'P', tipo: 'exagerado', pos: [0, 1] }, ...f.vizinhos], amizades: [['p', 'o'], ...f.amizades] };
    const r = espalhar(g, { origem: 'p', setas: { p: 'o', o: 'x' } });
    expect(r.ouviu.x.tamanho).toBe(2);
    expect(r.ouviu.y.tamanho).toBe(1);
    expect(r.motivo).toBe('assunto_ouviu');
  });
});

describe('bloco Arnaldo', () => {
  it.each(rotulos)('%s (%s): uma solução só, dentro das setas', (_n, _t, f) => {
    expect(mesma(resolverTrilho(f), f.solucao)).toBe(true);
    expect(jogar(f, f.solucao).vitoria).toBe(true);
  });

  it.each(rotulos)('%s (%s): sem a regra do Arnaldo, a jogada muda', (_n, _t, f) => {
    expect(mesma(resolverTrilho(semAbafa(f)), f.solucao)).toBe(false);
  });

  it.each(rotulos.filter(([, , f]) => f.armadilha))('%s (%s): a armadilha perde pelo tamanho', (_n, _t, f) => {
    expect(jogar(f, f.armadilha!).motivo).toBe('tamanho_errado');
  });

  // ⚠️ Consulta 7: com o teto em escândalo, um Exagerado colado no Arnaldo que já recebe escândalo não aumenta e o
  // Arnaldo ainda tira 1 (escândalo → escândalo → fofoca). Regra certa, mas invisível: nenhuma fase pode depender dela.
  it.each(rotulos)('%s (%s): nem a solução nem a armadilha passam pelo teto (Exagerado colado no Arnaldo recebendo escândalo)', (_n, _t, f) => {
    const baixo = abafados(f);
    for (const plano of [f.solucao, f.armadilha].filter(Boolean)) {
      const r = jogar(f, plano!);
      const noTeto = r.batidas.flat().filter((m) => {
        const v = f.vizinhos.find((x) => x.id === m.de)!;
        return v.tipo === 'exagerado' && baixo.has(v.id) && r.ouviu[v.id].tamanho === 3;
      });
      expect(noTeto).toEqual([]);
    }
  });

  it('A1: o Beto aumenta, mas sai cochicho (ele mora colado no Arnaldo)', () => {
    const r = jogar(fasesArnaldo[0], fasesArnaldo[0].solucao);
    expect(r.ouviu.a.tamanho).toBe(1);
  });

  it('A3: só entrando na área o escândalo vira fofoca', () => {
    const r = jogar(fasesArnaldo[2], fasesArnaldo[2].solucao);
    expect(r.ouviu.x.tamanho).toBe(3);
    expect(r.ouviu.c.tamanho).toBe(2);
  });
});
