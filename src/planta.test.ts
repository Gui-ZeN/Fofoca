import { describe, expect, it } from 'vitest';
import type { Fase, Vizinho } from './motor';
import { celulas, FORMATOS, formatoDe, temGargalo, vaziosEspalhados } from './planta';

const v = (id: string, pos: [number, number], extra: Partial<Vizinho> = {}): Vizinho => ({ id, nome: id, pos, tipo: 'comum', ...extra });
const fase = (vizinhos: Vizinho[], amizades: [string, string][]): Fase => ({ titulo: '', boato: '', giros: 0, vizinhos, amizades, origens: ['o'] });

describe('planta do prédio', () => {
  it.each(FORMATOS.flatMap((f) => [3, 4, 5].map((a) => [f, a] as const)))('%s com %i andares: térreo inteiro, alguém no alto, tudo ligado, e tem cômodo vazio', (formato, andares) => {
    for (const espelhado of [false, true]) {
      const cel = celulas(formato, andares, espelhado);
      const tem = new Set(cel.map((p) => p.join()));
      expect([0, 1, 2].every((c) => tem.has(`${c},${andares - 1}`))).toBe(true);
      expect(cel.some(([, r]) => r === 0)).toBe(true);
      expect(cel.length).toBeLessThan(3 * andares);
      const visto = new Set([cel[0].join()]); const fila = [cel[0]];
      while (fila.length) { const [c, r] = fila.shift()!; for (const [x, y] of [[c + 1, r], [c - 1, r], [c, r + 1], [c, r - 1]]) if (tem.has(`${x},${y}`) && !visto.has(`${x},${y}`)) { visto.add(`${x},${y}`); fila.push([x, y]); } }
      expect(visto.size).toBe(cel.length);
    }
  });

  it('gargalo: corredor tem, quarteirão com duas voltas não tem', () => {
    const estrela = { interesse: {} };
    const corredor = fase([v('o', [0, 0]), v('a', [1, 0]), v('e', [2, 0], estrela)], [['o', 'a'], ['a', 'e']]);
    expect(temGargalo(corredor)).toBe(true);
    const volta = fase([v('o', [0, 0]), v('a', [1, 0]), v('b', [0, 1]), v('e', [1, 1], estrela)], [['o', 'a'], ['o', 'b'], ['a', 'e'], ['b', 'e']]);
    expect(temGargalo(volta)).toBe(false);
  });

  it('vazios espalhados: 2 ou mais, nenhum colado em outro; planta de vazios juntos não conta', () => {
    const mora = (cel: [number, number][]) => fase(cel.map((p, i) => v(i ? `m${i}` : 'o', p)), []);
    const grade = celulas('cheio', 4, false);
    const sem = (fora: string[]) => mora(grade.filter((p) => !fora.includes(p.join())));
    expect(vaziosEspalhados(sem(['0,0', '2,1', '1,3']))).toBe(true); // três vazios soltos, um deles no térreo
    expect(vaziosEspalhados(sem(['1,1', '2,2']))).toBe(true); // em diagonal não é colado
    expect(vaziosEspalhados(sem(['1,1', '1,2']))).toBe(false); // um em cima do outro
    expect(vaziosEspalhados(sem(['1,1']))).toBe(false); // um só não espalha nada
    expect(vaziosEspalhados(mora(celulas('degraus', 4, false)))).toBe(false); // os vazios do canto são vizinhos
  });

  it('formatoDe reconhece a planta (também espelhada, e com 1 cômodo sobrando) e recusa a grade com furos soltos', () => {
    const mora = (cel: [number, number][]) => fase(cel.map((p, i) => v(i ? `m${i}` : 'o', p)), []);
    expect(formatoDe(mora(celulas('L', 4, true)))).toBe('L');
    expect(formatoDe(mora(celulas('poco', 5, false).filter(([c, r]) => !(c === 2 && r === 2))))).toBe('poco');
    expect(formatoDe(mora(celulas('cheio', 4, false).filter(([c, r]) => !(c === 2 && r === 0) && !(c === 0 && r === 2) && !(c === 1 && r === 3))))).toBeUndefined();
  });
});
