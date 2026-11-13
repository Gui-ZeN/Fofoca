import { describe, expect, it } from 'vitest';
import type { Fase } from './motor';
import { fasesSoneca } from './soneca';
import { jogar, resolverTrilho } from './trilho';
import manifesto from '../public/arte/manifesto.json';

const rotulos = fasesSoneca.map((f, i) => [`N${i + 1}`, f.titulo, f] as const);
const semSoneca = <F extends Fase>(f: F): F => ({ ...f, vizinhos: f.vizinhos.map((x) => ({ ...x, soneca: undefined })) });
// tira só o relógio (padaria, saída, ordem): o que sobra é a geografia
const semTempo = <F extends Fase>(f: F): F => ({
  ...f,
  vizinhos: f.vizinhos.map((x) => ({ ...x, chega: undefined, sai: undefined, interesse: x.interesse ? { ...x.interesse, ordem: undefined } : undefined })),
});
const mesma = (a: Record<string, string>[], b: Record<string, string>) =>
  a.length === 1 && JSON.stringify(Object.entries(a[0]).sort()) === JSON.stringify(Object.entries(b).sort());
const tamanho = (f: Fase) => [Math.max(...f.vizinhos.map((x) => x.pos[0])) + 1, Math.max(...f.vizinhos.map((x) => x.pos[1])) + 1];
const regrasDeTempo = (f: Fase) => new Set(f.vizinhos.flatMap((x) => [x.chega ? 'padaria' : '', x.sai !== undefined ? 'saída' : '', x.interesse?.ordem ? 'ordem' : ''].filter(Boolean)));

describe('bloco Soneca', () => {
  it('são três; o Ivo é o único Soneca de cada uma (o mesmo rosto) e é morador comum', () => {
    expect(fasesSoneca).toHaveLength(3);
    for (const f of fasesSoneca) {
      const sonecas = f.vizinhos.filter((x) => x.soneca);
      expect(sonecas.map((x) => [x.id, x.nome, x.tipo, !x.interesse])).toEqual([['i', 'Soneca', 'comum', true]]); // desde 2026-11-13 ele tem desenho próprio; antes era o Ivo emprestado
    }
  });

  it('tamanhos: 3×3, 4×3 ou 3×4, e 4×4 ou 5×4 com no máximo 15 moradores', () => {
    expect(tamanho(fasesSoneca[0])).toEqual([3, 3]);
    expect(['4x3', '3x4']).toContain(tamanho(fasesSoneca[1]).join('x'));
    expect(['4x4', '5x4']).toContain(tamanho(fasesSoneca[2]).join('x'));
    expect(fasesSoneca[2].vizinhos.length).toBeLessThanOrEqual(15);
    for (const f of fasesSoneca) {
      const celulas = f.vizinhos.map((x) => x.pos.join(','));
      expect(new Set(celulas).size).toBe(celulas.length); // ninguém divide apartamento
    }
  });

  it.each(rotulos)('%s (%s): solução única dentro das setas, e nenhuma com uma a menos', (_n, _t, f) => {
    expect(mesma(resolverTrilho(f), f.solucao)).toBe(true);
    expect(Object.keys(f.solucao).length).toBe(f.setas);
    expect(resolverTrilho(f, f.setas - 1)).toEqual([]);
    expect(jogar(f, f.solucao).vitoria).toBe(true);
  });

  it.each(rotulos)('%s (%s): tirando o `soneca` (todos comuns), a solução deixa de ser a mesma', (_n, _t, f) => {
    expect(mesma(resolverTrilho(semSoneca(f)), f.solucao)).toBe(false);
  });

  it.each(rotulos)('%s (%s): a armadilha perde por causa do tempo (sem o relógio ela venceria)', (_n, _t, f) => {
    const arm = f.armadilha!;
    expect(arm).toBeDefined();
    expect(Object.keys(arm).length).toBeLessThanOrEqual(f.setas);
    const r = jogar(f, arm);
    expect(r.vitoria).toBe(false);
    expect(r.motivo).toBe('interessado_nao_ouviu');
    expect(r.ouviu.z).toBeUndefined(); // não foi o Seu Zé
    expect(jogar(semTempo(f), arm).vitoria).toBe(true);
  });

  it('N1 (padaria): dois caminhos com as mesmas setas; só o do Ivo chega na hora, e na hora exata', () => {
    const f = fasesSoneca[0];
    const cida = f.vizinhos.find((x) => x.id === 's')!;
    expect(Object.keys(f.armadilha!).length).toBe(f.setas);
    const s = jogar(f, f.solucao);
    expect(s.ouviu.i.batida).toBe(2);
    expect(s.ouviu.s.batida).toBe(cida.chega); // ouve na primeira batida em que ela está em casa
    expect(jogar(f, f.armadilha!).ouviu.s).toBeUndefined();
    // o recado do atalho chegaria uma batida antes da volta (e se perderia)
    expect(jogar(semTempo(f), f.armadilha!).ouviu.s.batida).toBe(cida.chega! - 1);
  });

  it('N2 (saída): a solução NÃO passa pelo Ivo; o caminho dele tem as mesmas setas e chega depois que a Cida saiu', () => {
    const f = fasesSoneca[1];
    const cida = f.vizinhos.find((x) => x.id === 's')!;
    expect(f.vizinhos.some((x) => x.id === 's' && x.sai !== undefined)).toBe(true);
    expect(jogar(f, f.solucao).ouviu.i).toBeUndefined();
    expect(jogar(f, f.solucao).ouviu.s.batida).toBe(cida.sai! - 1); // na última batida em que ela está em casa
    const a = jogar(f, f.armadilha!);
    expect(a.ouviu.i).toBeDefined(); // o Ivo ouve e cochila
    expect(Object.keys(f.armadilha!).length).toBe(f.setas);
    expect(a.saidas).toEqual([{ id: 's', batida: cida.sai!, contando: false }]);
    // sem o Soneca a armadilha vence: é o cochilo que a derruba
    expect(jogar(semSoneca(f), f.armadilha!).vitoria).toBe(true);
  });

  it('N3 (volta pela Neide): o atalho pelo Ivo chega cedo; a solução usa a Fofoqueira e o Ivo, e a Cida ouve na hora', () => {
    const f = fasesSoneca[2];
    const cida = f.vizinhos.find((x) => x.id === 's')!;
    const s = jogar(f, f.solucao);
    expect(s.ouviu.n).toBeDefined(); // a Neide ouve e entrega pro Ivo
    expect(s.ouviu.i.de).toBe('n');
    expect(s.ouviu.s.batida).toBe(cida.chega);
    expect(Object.keys(f.armadilha!).length).toBeLessThan(f.setas); // o atalho é mais curto: é isso que tenta
    expect(jogar(f, f.armadilha!).ouviu.i).toBeDefined(); // também passa pelo Ivo: o Soneca sozinho não resolve
    expect(f.vizinhos.filter((x) => x.tipo === 'fofoqueira').map((x) => x.nome)).toEqual(['Neide']);
  });

  it('o Soneca ouve na solução das fases 1 e 3 e não ouve na da fase 2', () => {
    expect(jogar(fasesSoneca[0], fasesSoneca[0].solucao).ouviu.i).toBeDefined();
    expect(jogar(fasesSoneca[1], fasesSoneca[1].solucao).ouviu.i).toBeUndefined();
    expect(jogar(fasesSoneca[2], fasesSoneca[2].solucao).ouviu.i).toBeDefined();
  });

  it('o relógio da tela: o Soneca fica uma batida calado (a batida vazia entra em `batidas`)', () => {
    const f = fasesSoneca[0];
    const r = jogar(f, f.solucao);
    expect(r.batidas).toHaveLength(4);
    expect(r.batidas[2].map((m) => m.de)).toEqual([]); // ouviu na 2, só conta na 4 (batidas[3])
    expect(r.batidas[3].map((m) => [m.de, m.para])).toEqual([['i', 's']]);
  });

  it('as regras são de tempo e cabem no teto (Fofoqueira + 2 regras): Soneca + 1 de tempo, e cada fase tem a sua', () => {
    for (const f of fasesSoneca) expect(regrasDeTempo(f).size).toBe(1);
    expect([...regrasDeTempo(fasesSoneca[0])]).toEqual(['padaria']);
    expect([...regrasDeTempo(fasesSoneca[1])]).toEqual(['saída']);
    expect([...regrasDeTempo(fasesSoneca[2])]).toEqual(['padaria']);
  });

  it('o Seu Zé é id `z`, único, e há um único morador com estrela; ids de uma letra e únicos', () => {
    for (const f of fasesSoneca) {
      const ids = f.vizinhos.map((x) => x.id);
      expect(new Set(ids).size).toBe(ids.length);
      expect(ids.every((x) => x.length === 1)).toBe(true);
      expect(f.vizinhos.filter((x) => x.tipo === 'assunto').map((x) => [x.id, x.nome])).toEqual([['z', 'Seu Zé']]);
      expect(f.vizinhos.filter((x) => x.interesse).map((x) => x.nome)).toEqual(['Cida']);
      expect(f.origens).toEqual(['r']);
      for (const [a, b] of f.amizades) { expect(ids).toContain(a); expect(ids).toContain(b); }
    }
  });

  it('só usa nomes que já têm desenho (manifesto da arte)', () => {
    const comArte = new Set(Object.keys(manifesto).filter((k) => k !== '_cenario'));
    for (const f of fasesSoneca) for (const x of f.vizinhos) expect(comArte.has(x.nome), x.nome).toBe(true);
  });

  it('a primeira fase traz a novidade, e só ela', () => {
    expect(fasesSoneca[0].novidade).toBe('Soneca: ouve e demora uma batida a mais pra contar');
    expect(fasesSoneca.slice(1).every((f) => !f.novidade)).toBe(true);
  });
});
