import { describe, expect, it } from 'vitest';
import { explicar } from './explicar';
import { fasesTrilho, jogar } from './trilho';
import { fasesHora } from './horaCerta';
import { fasesOrdem } from './ordem';

describe('explicar a derrota', () => {
  it('vitória não tem explicação', () => {
    const f = fasesTrilho[0];
    expect(explicar(f, jogar(f, f.solucao))).toBeUndefined();
  });

  it('vítima: quem contou de fato (inclusive a Fofoqueira)', () => {
    const f = fasesTrilho[3]; // T4: Rita → Neide, a Neide conta pro Zé
    expect(explicar(f, jogar(f, { r: 'n' }))).toEqual({ tipo: 'vitima', de: ['n'], para: 'z' });
  });

  it('tamanho: o que a estrela queria e o que veio', () => {
    const f = fasesTrilho[7]; // T8: dois Exagerados viram escândalo, a Cida queria fofoca
    expect(explicar(f, jogar(f, f.armadilha!))).toEqual({ tipo: 'tamanho', id: 'c', queria: 2, veio: 3 });
  });

  it('ordem: as batidas de quem tinha a vez e de quem soube cedo', () => {
    const f = fasesOrdem[0]; // O1: a Cida (2) sabe antes da Bia (1)
    const e = explicar(f, jogar(f, f.armadilha!));
    expect(e).toMatchObject({ tipo: 'ordem', antes: 'b', depois: 'c' });
    if (e?.tipo === 'ordem') expect(e.batidaDepois).toBeLessThan(e.batidaAntes);
  });

  it('ordem com empate: as duas batidas iguais', () => {
    const e = explicar(fasesOrdem[1], jogar(fasesOrdem[1], { r: 'n' })); // O2: a Neide entrega as duas juntas
    expect(e?.tipo === 'ordem' && e.batidaAntes === e.batidaDepois).toBe(true);
  });

  it('padaria: em que batida o recado chegou e em qual a pessoa voltou', () => {
    const f = fasesHora[1]; // H2: caminho curto chega na 2, a Cida volta na 3
    expect(explicar(f, jogar(f, f.armadilha!))).toEqual({ tipo: 'padaria', id: 'c', chegou: 2, volta: 3 });
  });

  it('padaria: acha a estrela que perdeu o recado mesmo quando o motor culpa outra (O5)', () => {
    const f = fasesOrdem[4]; // a Bia (1) na padaria; o motor culpa a Cida, que vem antes na lista
    const r = jogar(f, f.armadilha!);
    expect(r.culpado).toBe('c');
    expect(explicar(f, r)).toMatchObject({ tipo: 'padaria', id: 'b' });
  });

  it('estrela sem notícia (sem padaria): só aponta a estrela, sem inventar culpado', () => {
    const f = fasesTrilho[0]; // T1 sem nenhuma seta: a Cida não ouve
    expect(explicar(f, jogar(f, {}))).toEqual({ tipo: 'sem_noticia', id: 'c' });
  });
});
