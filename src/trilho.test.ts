import { describe, expect, it } from 'vitest';
import { alvosDe, amigosDe } from './motor';
import { custo, espelhar, fasesTrilho, jogar, resolverTrilho } from './trilho';
import { fasesHora } from './horaCerta';
import { fasesOrdem } from './ordem';
import { fasesDificil } from './dificil';

describe('regras do trilho', () => {
  it('sem seta, guarda: a Cida ouve e não conta pro Seu Zé', () => {
    const f = fasesTrilho[1];
    expect(jogar(f, { r: 'a', a: 'c' }).vitoria).toBe(true);
    expect(jogar(f, { r: 'a', a: 'c', c: 'z' }).motivo).toBe('assunto_ouviu');
  });

  it('a Fofoqueira conta sozinha pra todo mundo ligado, sem gastar seta', () => {
    const r = jogar(fasesTrilho[3], { r: 'n' });
    expect(r.ouviu.z).toBeDefined();
    expect(r.ouviu.a).toBeDefined();
    expect(r.motivo).toBe('assunto_ouviu');
  });

  it('tamanho exato: escândalo não serve pra quem quer boato', () => {
    const f = fasesTrilho[7];
    expect(jogar(f, { r: 'e', e: 'd', d: 'c' }).ouviu.c.tamanho).toBe(2);
    const demais = jogar(f, { r: 'e', e: 'l', l: 'c' });
    expect(demais.ouviu.c.tamanho).toBe(3);
    expect(demais.motivo).toBe('tamanho_errado');
  });

  it('celular: a Bia liga pra Cida sem passagem entre elas', () => {
    const f = fasesTrilho[9];
    const bia = f.vizinhos.find((v) => v.id === 'b')!;
    expect(amigosDe(f, 'b')).not.toContain('c');
    expect(alvosDe(f, bia)).toContain('c');
    expect(jogar(f, f.solucao).vitoria).toBe(true); // Rita → Ana → Bia, e a Bia liga (a Bia saiu de baixo da Rita em 2026-11-13: Rita → Bia já não é porta)
    expect(f.solucao).toMatchObject({ b: 'c' });
  });

  it('quem não é controlável não recebe seta', () => {
    const f = fasesTrilho[3];
    expect(alvosDe(f, f.vizinhos.find((v) => v.tipo === 'fofoqueira')!)).toEqual([]);
    expect(alvosDe(f, f.vizinhos.find((v) => v.tipo === 'assunto')!)).toEqual([]);
  });
});

// as mesmas garantias valem pros blocos "Hora certa" (H1–H6), "Ordem" (O1–O6) e "Prédio cheio" (D1–D6)
const todas = [
  ...fasesTrilho.map((f, i) => [`T${i + 1}`, f.titulo, f] as const),
  ...fasesHora.map((f, i) => [`H${i + 1}`, f.titulo, f] as const),
  ...fasesOrdem.map((f, i) => [`O${i + 1}`, f.titulo, f] as const),
  ...fasesDificil.map((f, i) => [`D${i + 1}`, f.titulo, f] as const),
];
describe.each(todas)('fase %s (%s)', (_n, _t, f) => {
  it('bem montada: posições únicas, passagens só entre vizinhos de porta, setas válidas', () => {
    const pos = Object.fromEntries(f.vizinhos.map((v) => [v.id, v.pos]));
    expect(new Set(f.vizinhos.map((v) => v.pos.join())).size).toBe(f.vizinhos.length);
    for (const [a, b] of f.amizades) {
      const [ax, ay] = pos[a], [bx, by] = pos[b];
      expect(Math.abs(ax - bx) + Math.abs(ay - by), `${a}-${b}`).toBe(1);
    }
    expect(f.vizinhos.some((v) => v.id === f.origens[0] && !v.interesse && v.tipo === 'comum')).toBe(true);
    for (const [de, para] of Object.entries(f.solucao)) {
      expect(alvosDe(f, f.vizinhos.find((v) => v.id === de)!), `${de}→${para}`).toContain(para);
    }
  });

  it('a solução pretendida vence e cabe nas setas', () => {
    expect(jogar(f, f.solucao).vitoria).toBe(true);
    expect(custo(f.solucao)).toBeLessThanOrEqual(f.setas);
  });

  it('é a única vitória que cabe nas setas', () => {
    const vitorias = resolverTrilho(f);
    expect(vitorias.map((p) => JSON.stringify(Object.entries(p).sort()))).toEqual([JSON.stringify(Object.entries(f.solucao).sort())]);
  });

  it('as setas são justas: com uma a menos não dá (exceto onde a folga é a lição)', () => {
    if (f.folga) return;
    expect(resolverTrilho(f, f.setas - 1)).toHaveLength(0);
  });

  it('a armadilha perde (ou não cabe nas setas)', () => {
    if (!f.armadilha) return;
    expect(!jogar(f, f.armadilha).vitoria || custo(f.armadilha) > f.setas).toBe(true);
  });

  it('espelhado continua o mesmo quebra-cabeça', () => {
    const e = espelhar(f);
    expect(jogar(e, f.solucao).vitoria).toBe(true);
    expect(resolverTrilho(e)).toHaveLength(1);
  });
});
