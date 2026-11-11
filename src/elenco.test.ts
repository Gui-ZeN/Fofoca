import { describe, expect, it } from 'vitest';
import { fasesTrilho, jogar, resolverTrilho } from './trilho';
import { fasesGiros } from './comparacao';
import { resolver } from './motor';
import { SEU_ZE, vestir } from './elenco';
import { aleatorio } from './variar';

const SEMENTES = Array.from({ length: 40 }, (_, i) => i * 7919 + 3);

describe.each(fasesTrilho.map((f, i) => [i + 1, f.titulo, f] as const))('elenco da fase %i (%s)', (_n, _t, base) => {
  it('trocar quem é quem não muda o quebra-cabeça', () => {
    for (const s of SEMENTES) {
      const f = vestir(base, aleatorio(s));
      expect(jogar(f, base.solucao).vitoria, `semente ${s}`).toBe(true);
      expect(resolverTrilho(f)).toHaveLength(1);
      expect(f.vizinhos.map((v) => [v.id, v.tipo, v.pos.join()])).toEqual(base.vizinhos.map((v) => [v.id, v.tipo, v.pos.join()]));
    }
  });

  it('ninguém repete nome e as dicas só citam quem está no prédio', () => {
    const conhecidos = ['Rita', 'Ana', 'Bia', 'Cida', 'Lia', 'Davi', 'Rui', 'Edu', 'Neide', 'Beto', 'Lúcia', 'Padre', SEU_ZE];
    for (const s of SEMENTES) {
      const f = vestir(base, aleatorio(s));
      const nomes = f.vizinhos.map((v) => v.nome);
      expect(new Set(nomes).size).toBe(nomes.length);
      // o boato pode ser sobre o Seu Zé numa fase em que ele nem mora no prédio
      const semVitima = !f.vizinhos.some((v) => v.tipo === 'assunto');
      for (const texto of [f.dica ?? '', f.boato]) {
        for (const n of conhecidos) {
          if (n === SEU_ZE && semVitima && texto === f.boato) continue;
          if (texto.includes(n)) expect(nomes, `"${texto}" cita ${n}`).toContain(n);
        }
      }
    }
  });
});

describe('sorteio do elenco', () => {
  const comZe = fasesTrilho.filter((f) => f.vizinhos.some((v) => v.tipo === 'assunto'));

  it('às vezes a vítima é outra pessoa, e o boato passa a falar dela', () => {
    const vitimas = new Set<string>();
    for (const s of SEMENTES) {
      const f = vestir(comZe[0], aleatorio(s));
      const vitima = f.vizinhos.find((v) => v.tipo === 'assunto')!.nome;
      vitimas.add(vitima);
      if (vitima !== SEU_ZE) expect(f.boato).toContain(vitima);
      else expect(f.boato).toContain(SEU_ZE);
    }
    expect(vitimas.has(SEU_ZE)).toBe(true);
    expect(vitimas.size).toBeGreaterThan(1);
  });

  it('quem ouve primeiro varia de nome', () => {
    const f0 = fasesTrilho[0];
    const origens = new Set(SEMENTES.map((s) => vestir(f0, aleatorio(s)).vizinhos.find((v) => v.id === f0.origens[0])!.nome));
    expect(origens.size).toBeGreaterThan(1);
  });

  it('concordância: "A Cida", "O Davi"', () => {
    const f = { ...comZe[0], boato: 'O Seu Zé pinta o bigode' };
    for (const s of SEMENTES) {
      const v = vestir(f, aleatorio(s));
      const vitima = v.vizinhos.find((x) => x.tipo === 'assunto')!.nome;
      if (vitima === SEU_ZE) continue;
      expect(v.boato).toMatch(/^(A|O) \S+ pinta o bigode$/);
      expect(v.boato.startsWith(['Rita', 'Ana', 'Bia', 'Cida'].includes(vitima) ? 'A ' : 'O ')).toBe(true);
    }
  });

  it('nas fases de giros, a troca de nomes também preserva o quebra-cabeça', () => {
    for (const base of fasesGiros) for (const s of SEMENTES.slice(0, 10)) expect(resolver(vestir(base, aleatorio(s)))).toHaveLength(1);
  });
});
