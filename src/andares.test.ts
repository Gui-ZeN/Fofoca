import { describe, expect, it } from 'vitest';
import { alvosDe, amigosDe } from './motor';
import { FOLGA } from './fabrica';
import { custo, jogar, resolverTrilho, type FaseTrilho } from './trilho';
import estoque from './andares.json';
import manifesto from '../public/arte/manifesto.json';

// Recertifica o estoque gerado sem confiar no gerador: as mesmas garantias das fases feitas à mão.
const fases = (estoque as unknown as { pos: number; peso: string; fase: FaseTrilho }[]);

describe('estoque de andares gerados', () => {
  it('150 andares, nas posições 0..149, com a escada leve/média/pesada e um chefão por bloco de 25', () => {
    expect(fases).toHaveLength(150);
    fases.forEach((a, i) => expect(a.pos).toBe(i));
    expect(fases.filter((a) => a.peso === 'chefe').map((a) => a.pos)).toEqual([24, 49, 74, 99, 124, 149]);
  });

  it('o prédio cresce com o peso: leve 3 andares, média 4, pesada e chefão 5 (sem rolar; Consulta 7)', () => {
    const altura = { leve: 3, media: 4, pesada: 5, chefe: 5 } as Record<string, number>;
    // `saiu` = o peso que de fato saiu (se a fábrica não achar no prazo, ela desce um peso)
    for (const a of fases as unknown as { pos: number; saiu: string; fase: FaseTrilho }[]) {
      expect(Math.max(...a.fase.vizinhos.map((v) => v.pos[1])) + 1, `andar ${a.pos}`).toBeLessThanOrEqual(altura[a.saiu]);
    }
    expect(fases.filter((a) => Math.max(...a.fase.vizinhos.map((v) => v.pos[1])) + 1 >= 5).length).toBeGreaterThan(20);
  });

  it('todo morador tem desenho ilustrado e ninguém repete no mesmo prédio', () => {
    const comArte = new Set(Object.keys(manifesto).filter((k) => k !== '_cenario'));
    for (const a of fases) {
      for (const v of a.fase.vizinhos) expect(comArte.has(v.nome), `${v.nome} (andar ${a.pos})`).toBe(true);
      expect(new Set(a.fase.vizinhos.map((v) => v.nome)).size).toBe(a.fase.vizinhos.length);
    }
  });

  it('a Fofoqueira não tem papel fixo: é atalho na maioria, armadilha em boa parte, e quase nunca colada no Zé', () => {
    // ⚠️ crítica do Fable (2026-11-11): colada no Zé em 100% virava placa de "não toque"; longe dele e sempre usada
    // (92%) virava "a saída é sempre por ela". Medido em 2026-11-12, depois do equilíbrio.
    const com = fases.filter((a) => a.fase.vizinhos.some((v) => v.tipo === 'fofoqueira'));
    const atalho = com.filter((a) => a.fase.vizinhos.some((v) => v.tipo === 'fofoqueira' && jogar(a.fase, a.fase.solucao).ouviu[v.id]));
    const colada = com.filter((a) => a.fase.vizinhos.some((v) => v.tipo === 'fofoqueira' && amigosDe(a.fase, v.id).includes('z')));
    expect(atalho.length / com.length).toBeGreaterThan(0.5);
    expect(atalho.length / com.length).toBeLessThan(0.8);
    expect(colada.length / com.length).toBeLessThan(0.35);
  });

  it.each(fases.map((a) => [a.pos, a.fase.titulo, a.fase] as const))('andar gerado %i (%s)', (_p, _t, f) => {
    // bem montado: posições únicas, passagens só entre vizinhos de porta, origem comum sem estrela
    expect(new Set(f.vizinhos.map((v) => v.pos.join())).size).toBe(f.vizinhos.length);
    const pos = Object.fromEntries(f.vizinhos.map((v) => [v.id, v.pos]));
    for (const [a, b] of f.amizades) expect(Math.abs(pos[a][0] - pos[b][0]) + Math.abs(pos[a][1] - pos[b][1])).toBe(1);
    expect(f.vizinhos.some((v) => v.id === f.origens[0] && v.tipo === 'comum' && !v.interesse)).toBe(true);
    for (const [de, para] of Object.entries(f.solucao)) expect(alvosDe(f, f.vizinhos.find((v) => v.id === de)!)).toContain(para);
    // a solução vence e é a única no mínimo (K); com uma a menos não dá. O jogador recebe K + FOLGA setas
    // (o contador não entrega o tamanho do caminho), e mesmo com elas há no máximo outra saída.
    const K = custo(f.solucao);
    expect(jogar(f, f.solucao).vitoria).toBe(true);
    expect(f.setas).toBe(K + FOLGA);
    expect(resolverTrilho(f, K)).toHaveLength(1);
    expect(resolverTrilho(f, K - 1)).toHaveLength(0);
    expect(resolverTrilho(f).length).toBeLessThanOrEqual(2);
    // Zé fora do canto e com 2+ portas; a Fofoqueira muda a jogada (atalho ou armadilha, nunca enfeite)
    const z = f.vizinhos.find((v) => v.id === 'z')!;
    const W = Math.max(...f.vizinhos.map((v) => v.pos[0])), H = Math.max(...f.vizinhos.map((v) => v.pos[1]));
    expect((z.pos[0] === 0 || z.pos[0] === W) && (z.pos[1] === 0 || z.pos[1] === H)).toBe(false);
    expect(amigosDe(f, 'z').length).toBeGreaterThanOrEqual(2);
    const fofs = f.vizinhos.filter((v) => v.tipo === 'fofoqueira');
    if (fofs.length) {
      const comum = { ...f, vizinhos: f.vizinhos.map((v) => (v.tipo === 'fofoqueira' ? { ...v, tipo: 'comum' as const } : v)) };
      expect(JSON.stringify(resolverTrilho(comum, K))).not.toBe(JSON.stringify([f.solucao]));
    }
    // a armadilha (o caminho mais curto) perde
    expect(jogar(f, f.armadilha!).vitoria).toBe(false);
    // texto sem aparência como piada (PRODUCT.md)
    expect(f.boato).not.toMatch(/bigode|peruca|careca|gord|magr|feio|nariz|barriga/i);
  });
});
