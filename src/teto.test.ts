import { describe, expect, it } from 'vitest';
import { abafados, type Fase } from './motor';
import { CAMPANHA, ESTOQUE } from './campanha';
import { fasesArnaldo } from './arnaldo';
import { fasesNonato } from './nonato';
import { fasesRaquel } from './raquel';
import { fasesApressado } from './apressado';
import { fasesAlvaro, fasesNorma, fasesVera } from './fiscais';
import { assinatura, repetidos } from './assinatura';

// Teto de leitura (Consulta 7, 17 de 20 designers): no máximo a Fofoqueira + 2 regras especiais por andar, e no máximo
// 2 selos numa plaquinha. ⚠️ O "muita informação" que afastou o dono do Rumor Mill é o que esse teto evita.
const regras = (f: Fase) => {
  const r = new Set<string>();
  for (const v of f.vizinhos) {
    if (v.chega) r.add('padaria');
    if (v.interesse?.ordem) r.add('ordem');
    if (v.interesse?.tamanho || v.interesse?.minTamanho) r.add('tamanho'); // o Exagerado só pesa quando o tamanho importa
    if (v.celular) r.add('celular');
    if (v.tipo === 'docontra' || v.interesse?.versao) r.add('versão');
    if (v.abafa) r.add('arnaldo');
    if (v.desconfia) r.add('raquel');
    if (v.tipo === 'apressado') r.add('nando');
    if (v.vigia) r.add('vera');
    if (v.recolhe) r.add('norma');
    if (v.teto) r.add('álvaro');
  }
  return [...r];
};
// selos à direita do nome: +1, −1, ⇄, 2×, ⚡ e o tamanho/versão pedido
const selos = (f: Fase) => {
  const baixo = abafados(f);
  return f.vizinhos.map((v) => [v.tipo === 'exagerado', baixo.has(v.id) && v.tipo !== 'assunto', v.tipo === 'docontra', !!v.desconfia, v.tipo === 'apressado',
    !!(v.interesse?.tamanho || v.interesse?.minTamanho || v.interesse?.versao)].filter(Boolean).length);
};

const todas: [string, Fase][] = [
  ...CAMPANHA.map((a, i) => [`andar ${i + 1} (${a.rotulo})`, a.fase] as [string, Fase]),
  ...ESTOQUE.map((f, i) => [`estoque ${i}`, f] as [string, Fase]),
  ...[fasesArnaldo, fasesNonato, fasesRaquel, fasesApressado, fasesVera, fasesNorma, fasesAlvaro].flat().map((f) => [`protótipo "${f.titulo}"`, f] as [string, Fase]),
];

describe('teto de leitura por andar', () => {
  it.each(todas)('%s: no máximo 2 regras especiais além da Fofoqueira', (_n, f) => {
    expect(regras(f).length).toBeLessThanOrEqual(2);
  });

  it.each(todas)('%s: no máximo 2 selos numa plaquinha', (_n, f) => {
    expect(Math.max(...selos(f))).toBeLessThanOrEqual(2);
  });
});

describe('régua de raciocínio (assinatura)', () => {
  it('feitos à mão: só as repetições conhecidas (fora o tutorial) — a lista não pode crescer', () => {
    // ⚠️ conhecidas: 6 e 8 repetem a Fofoqueira logo depois de ensinada (aceito, é fixação). O 24 ("Café da tarde")
    // repetia a 22 e foi refeito em 2026-11-12 (padaria no meio do caminho, sem Fofoqueira).
    // Calibrada nas versões antigas (commit 2fe1333): lá ela reprovava também 18, 19, 20 e 24.
    const as = CAMPANHA.map((a) => assinatura(a.fase));
    expect(repetidos(as).filter((i) => i >= 5).map((i) => i + 1)).toEqual([6, 8]);
  });

  it('a régua separa quem está na padaria: o Zé fora (H3) não é o mesmo raciocínio do meio do caminho (H4)', () => {
    const h3 = CAMPANHA.find((a) => a.rotulo === 'H3')!.fase, h4 = CAMPANHA.find((a) => a.rotulo === 'H4')!.fase;
    expect(assinatura(h3)).toContain('padaria(zé)');
    expect(assinatura(h4)).toContain('padaria(meio)');
  });

  it('estoque: dentro de cada capítulo (25), nenhum andar repete os 2 anteriores e nenhuma assinatura passa de 6', () => {
    const as = ESTOQUE.map((f) => assinatura(f));
    for (let c = 0; c < as.length; c += 25) {
      const cap = as.slice(c, c + 25);
      expect(repetidos(cap), `capítulo do estoque ${c / 25}`).toEqual([]);
      const conta = cap.reduce((m, a) => m.set(a, (m.get(a) ?? 0) + 1), new Map<string, number>());
      expect(Math.max(...conta.values()), `capítulo do estoque ${c / 25}`).toBeLessThanOrEqual(6);
    }
  }, 120_000);
});
