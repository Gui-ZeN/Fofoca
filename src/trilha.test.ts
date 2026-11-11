import { describe, expect, it } from 'vitest';
import { amigosDe, resolver } from './motor';
import { fases as tutoriais } from './fases';
import { gerar, dificuldade } from './gerador';
import { BLOCOS, blocoDa, faseDaTrilha, pedidoDa, TAMANHO_BLOCO } from './trilha';
import { justa } from './variar';

const N = 125;
const trilha = Array.from({ length: N }, (_, i) => faseDaTrilha(i + 1));

describe('trilha de 125 fases', () => {
  it('no bloco da padaria, toda fase tem o Seu Zé fora de casa, e o horário importa', () => {
    trilha.slice(100, 125).forEach((f, i) => {
      const ze = f.vizinhos.find((v) => v.tipo === 'assunto')!;
      expect(ze.chega, `fase ${101 + i}`).toBeGreaterThanOrEqual(2);
      expect(justa(f), `fase ${101 + i}`).toBe(true); // justa já exige que alguma solução dependa do horário
    });
  });

  it('antes da padaria ninguém tem horário', () => {
    trilha.slice(0, 100).forEach((f, i) => expect(f.vizinhos.some((v) => v.chega), `fase ${i + 1}`).toBe(false));
  });

  it('toda fase é justa (1 a 3 soluções, giros necessários, armadilha)', () => {
    trilha.forEach((f, i) => expect(justa(f, i === 0), `fase ${i + 1}`).toBe(true));
  });

  it('toda fase é bem formada', () => {
    trilha.forEach((f, i) => {
      const ids = f.vizinhos.map((v) => v.id);
      expect(new Set(ids).size, `fase ${i + 1}`).toBe(ids.length);
      expect(new Set(f.vizinhos.map((v) => v.nome)).size, `nomes repetidos na fase ${i + 1}`).toBe(ids.length);
      expect(new Set(f.vizinhos.map((v) => v.pos.join())).size).toBe(ids.length);
      // fases geradas sempre têm o Seu Zé; alguns tutoriais ensinam sem ele
      const zes = f.vizinhos.filter((v) => v.tipo === 'assunto').length;
      if (tutoriais.includes(f)) expect(zes).toBeLessThanOrEqual(1);
      else expect(zes, `fase ${i + 1}`).toBe(1);
      for (const v of f.vizinhos) if (v.seta) expect(amigosDe(f, v.id)).toContain(v.seta);
      // ninguém isolado: todo mundo tem pelo menos uma passagem
      for (const v of f.vizinhos) expect(amigosDe(f, v.id).length, `${v.nome} isolado na fase ${i + 1}`).toBeGreaterThan(0);
    });
  });

  it('nenhuma passagem atravessa outro apartamento', () => {
    trilha.forEach((f, i) => {
      const p = Object.fromEntries(f.vizinhos.map((v) => [v.id, v.pos]));
      for (const [a, b] of f.amizades) {
        const [ax, ay] = p[a], [bx, by] = p[b];
        expect(Math.max(Math.abs(ax - bx), Math.abs(ay - by)), `fase ${i + 1} ${a}-${b}`).toBe(1);
      }
    });
  });

  it('a mesma fase sai igual sempre (é a semente que decide)', () => {
    const p = pedidoDa(37);
    expect(JSON.stringify(gerar(p, 999))).toBe(JSON.stringify(gerar(p, 999)));
  });

  it('as fases desenhadas à mão abrem os blocos', () => {
    for (const b of BLOCOS) for (const [n, k] of Object.entries(b.tutoriais)) expect(trilha[+n - 1]).toBe(tutoriais[k]);
  });

  it('a novidade do bloco aparece em todas as fases geradas dele', () => {
    trilha.forEach((f, i) => {
      const b = blocoDa(i + 1);
      if (b.novo && !tutoriais.includes(f)) expect(f.vizinhos.some((v) => v.tipo === b.novo), `fase ${i + 1}`).toBe(true);
    });
  });

  it('só aparece tipo já liberado no bloco', () => {
    trilha.forEach((f, i) => {
      const liberados = new Set(['comum', 'assunto', ...blocoDa(i + 1).tipos]);
      for (const v of f.vizinhos) expect(liberados.has(v.tipo), `${v.tipo} na fase ${i + 1}`).toBe(true);
    });
  });

  it('a dificuldade sobe dentro de cada bloco', () => {
    for (let b = 0; b < 5; b++) {
      const notas = trilha.slice(b * TAMANHO_BLOCO, (b + 1) * TAMANHO_BLOCO).map(dificuldade);
      const media = (xs: number[]) => xs.reduce((s, x) => s + x, 0) / xs.length;
      expect(media(notas.slice(-8)), `bloco ${b + 1}`).toBeGreaterThan(media(notas.slice(0, 8)));
    }
  });

  it('nenhum par de fases geradas é idêntico', () => {
    const vistas = new Set(trilha.map((f) => JSON.stringify([f.vizinhos.map((v) => [v.tipo, v.pos, v.seta]), f.amizades, f.giros])));
    expect(vistas.size).toBe(N);
  });

  it('a trilha continua depois do último bloco', () => {
    const f = faseDaTrilha(137);
    expect(justa(f)).toBe(true);
    expect(resolver(f).length).toBeGreaterThan(0);
  });
});
