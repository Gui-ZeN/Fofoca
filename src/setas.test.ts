// As setas em fita e a mira do arrasto (2026-11-17, o dono: "as setinhas estão muito fora do padrão", "arrastar é travado",
// "trocar ou apagar seta dá trabalho"). Geometria pura e o desenho renderizado em texto, sem navegador.
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import type { Fase, Vizinho } from './motor';
import { A, Predio, curvaDaSeta, escolherAlvo } from './Predio';

const L = 120;
const v = (id: string, nome: string, pos: [number, number], extra: Partial<Vizinho> = {}): Vizinho => ({ id, nome, tipo: 'comum', pos, ...extra });
const centro = (c: number, r: number) => ({ x: c * L + L / 2, y: r * A + A / 2 });

describe('mira do arrasto (escolherAlvo)', () => {
  const rita = v('r', 'Rita', [1, 1]);
  const dir = v('d', 'Davi', [2, 1]), esq = v('e', 'Edu', [0, 1]), cima = v('c', 'Cida', [1, 0]), baixo = v('b', 'Bia', [1, 2]);
  const alvos = [dir, esq, cima, baixo];

  it('soltar dentro do cômodo de um destino vale ele (como antes)', () => {
    expect(escolherAlvo(rita, alvos, centro(2, 1))).toBe('d');
  });
  it('soltar um pouco fora do cômodo ainda vale (folga na borda)', () => {
    expect(escolherAlvo(rita, alvos, { x: 3 * L + 10, y: 1 * A + 20 })).toBe('d'); // passou 10 da parede de fora
  });
  it('um puxão curto na direção certa vale, sem chegar no cômodo', () => {
    const o = centro(1, 1);
    expect(escolherAlvo(rita, alvos, { x: o.x + 45, y: o.y + 4 })).toBe('d');
    expect(escolherAlvo(rita, alvos, { x: o.x - 3, y: o.y - 40 })).toBe('c');
    expect(escolherAlvo(rita, alvos, { x: o.x + 2, y: o.y + 50 })).toBe('b');
  });
  it('puxão curtíssimo ou na diagonal entre dois destinos não chuta nada', () => {
    const o = centro(1, 1);
    expect(escolherAlvo(rita, alvos, { x: o.x + 20, y: o.y })).toBeUndefined();
    expect(escolherAlvo(rita, alvos, { x: o.x + 40, y: o.y - 40 })).toBeUndefined(); // entre o Davi e a Cida
  });
  it('soltar DENTRO do cômodo de um destino vale ele, mesmo com outro destino colado (a folga não rouba)', () => {
    // ⚠️ achado do auditor (2026-11-17): a folga de 14 do vizinho cobria a beira do cômodo do destino do interfone, e quem
    // vinha primeiro na lista ganhava. O resultado dependia da ordem.
    const viz = v('v', 'Vera', [1, 1]), longe = v('l', 'Lia', [2, 1]), de = v('o', 'Otávio', [0, 1]);
    expect(escolherAlvo(de, [viz, longe], { x: 2 * L + 3, y: A + 50 })).toBe('l');
    expect(escolherAlvo(de, [longe, viz], { x: 2 * L + 3, y: A + 50 })).toBe('l');
    expect(escolherAlvo(de, [viz, longe], { x: 2 * L - 3, y: A + 50 })).toBe('v');
  });
  it('na folga, fora dos dois cômodos, fica com o mais perto; na linha que divide os dois, não chuta', () => {
    const cima = v('a', 'Ana', [1, 0]), baixo = v('b', 'Bia', [1, 1]), de = v('o', 'Otávio', [0, 1]);
    const fora = 2 * L + 8; // 8 depois da parede direita da coluna dos dois
    expect(escolherAlvo(de, [cima, baixo], { x: fora, y: A + 3 })).toBe('b'); // 3 abaixo da laje: mais perto da Bia
    expect(escolherAlvo(de, [baixo, cima], { x: fora, y: A - 3 })).toBe('a');
    expect(escolherAlvo(de, [cima, baixo], { x: fora, y: A })).toBeUndefined(); // em cima da laje: empate
  });

  it('quem não é destino possível não é escolhido nem com o dedo em cima', () => {
    expect(escolherAlvo(rita, [cima], centro(2, 1))).toBeUndefined();
  });
});

describe('seta em fita', () => {
  it('a curva começa e termina nos pontos pedidos e a barriga sobe', () => {
    const c = curvaDaSeta(0, 100, 200, 100);
    expect(c.d.startsWith('M0,100 Q')).toBe(true);
    expect(c.d.endsWith(' 200,100')).toBe(true);
    expect(c.meio.y).toBeLessThan(100);
  });

  vi.stubGlobal('matchMedia', () => ({ matches: false }));
  const fase: Fase = { titulo: 't', boato: 'b', giros: 0, origens: ['a'], vizinhos: [v('a', 'Rita', [0, 0]), v('b', 'Davi', [1, 0]), v('c', 'Cida', [2, 0], { interesse: {} })],
    amizades: [['a', 'b'], ['b', 'c']] };
  const desenhar = (selecionado?: string) => renderToStaticMarkup(createElement(Predio, {
    fase, origem: 'a', setas: { a: 'b', b: 'c' }, batida: 0, montando: true, aoTocar: () => {}, aoGirar: () => {},
    trilho: { selecionado, alvos: [], aoApertar: () => {}, aoTocar: () => {}, aoSoltar: () => {}, aoApagar: () => {} },
  }));

  it('toda seta é fita: contorno, miolo e ponta, sem a linha fina antiga', () => {
    const html = desenhar();
    expect((html.match(/class="contorno"/g) ?? []).length).toBeGreaterThanOrEqual(2);
    expect(html).not.toContain('points="0,0 -11,-8 -8,0 -11,8"');
  });
  it('o "×" de apagar aparece só na seta de quem está escolhido', () => {
    expect((desenhar().match(/class="apagar-seta"/g) ?? []).length).toBe(0);
    expect((desenhar('b').match(/class="apagar-seta"/g) ?? []).length).toBe(1);
  });
});
