// Comparação para o teste com pessoas (sugestão do Sol): os mesmos prédios de 3 fases do trilho,
// jogados na mecânica de origem fixa + giros (setas prontas, você só gira). Metade dos testadores
// joga o trilho primeiro, a outra metade os giros primeiro (ordem AB/BA), pra comparar o gosto
// sem que a ordem decida por eles.

import type { Fase, Vizinho } from './motor';
import { fasesTrilho, type FaseTrilho } from './trilho';

export interface FaseGiros extends Fase {
  origens: [string];
  solucao: Record<string, string>; // setas giradas (quem → pra quem)
  par?: string; // título da fase do trilho com o mesmo prédio
}

const v = (id: string, nome: string, tipo: Vizinho['tipo'], pos: [number, number], extra: Partial<Vizinho> = {}): Vizinho =>
  ({ id, nome, tipo, pos, ...extra });

// Mesmo prédio da fase do trilho, com as setas já desenhadas (do jeito errado) e N giros.
const doTrilho = (titulo: string, setas: Record<string, string>, giros: number, solucao: Record<string, string>, dica?: string): FaseGiros => {
  const t = fasesTrilho.find((f) => f.titulo === titulo) as FaseTrilho;
  return {
    titulo: `${t.titulo} (girando)`, boato: t.boato, dica, giros, origens: t.origens, amizades: t.amizades, par: t.titulo,
    vizinhos: t.vizinhos.map((p) => ({ ...p, seta: setas[p.id] })),
    solucao,
  };
};

export const fasesGiros: FaseGiros[] = [
  {
    titulo: 'Girar a seta',
    boato: 'O Seu Zé coleciona tampinhas',
    dica: 'Aqui as setas já vêm prontas. Toque no botão azul de girar pra mudar pra quem a Rita conta.',
    giros: 1, origens: ['r'],
    vizinhos: [v('r', 'Rita', 'comum', [0, 0], { seta: 'z' }), v('z', 'Seu Zé', 'assunto', [1, 0]), v('c', 'Cida', 'comum', [0, 1], { interesse: {} })],
    amizades: [['r', 'z'], ['r', 'c']],
    solucao: { r: 'c' },
  },
  // ⚠️ mesma dica da T4: sem ela, o grupo B descobria a Fofoqueira sem explicação e o A/B ficava viciado
  doTrilho('A fofoqueira', { r: 'n', d: 'r', a: 'c' }, 2, { r: 'd', d: 'a' },
    'A Neide é fofoqueira: conta pra todo mundo em volta, sem você mandar.'),
  doTrilho('Só três setas', { r: 'z', d: 'c', u: 'n' }, 2, { r: 'n', u: 'b' }),
  doTrilho('Recado na portaria', { r: 'n', d: 'r', a: 'b', b: 'a' }, 3, { r: 'd', d: 'a', b: 'c' }),
];
