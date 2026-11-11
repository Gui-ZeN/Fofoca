import { describe, expect, it } from 'vitest';
import { fasesTrilho, jogar, resolverTrilho } from './trilho';
import { fasesGiros } from './comparacao';
import { resolver } from './motor';
import { ELAS, SEU_ZE, vestir } from './elenco';
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
    const conhecidos = ['Rita', 'Ana', 'Bia', 'Cida', 'Lia', 'Davi', 'Rui', 'Edu', 'Neide', 'Beto', 'Lúcia', 'Padre', SEU_ZE,
      'Marlene', 'Jandira', 'Celina', 'Solange', 'Caio', 'Otávio', 'Nando', 'Ivo', 'Vera', 'Dona Norma', 'Dr. Álvaro'];
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
      // nome de duas palavras também ("A Dona Norma", "O Dr. Álvaro")
      expect(v.boato).toBe(`${ELAS.has(vitima) ? 'A' : 'O'} ${vitima} pinta o bigode`);
    }
  });

  it('a vítima pode ser um fiscal (nunca o Arnaldo) ou morador novo, com o artigo certo', () => {
    const f = { ...comZe[0], boato: 'O Seu Zé pinta o bigode', dica: 'Ninguém conta pro Seu Zé.' };
    const vistos = new Set<string>();
    for (let s = 1; s < 400; s++) {
      const v = vestir(f, aleatorio(s), 1);
      const vitima = v.vizinhos.find((x) => x.tipo === 'assunto')!.nome;
      vistos.add(vitima);
      expect(vitima).not.toBe('Arnaldo');
      expect(v.dica).toBe(`Ninguém conta ${ELAS.has(vitima) ? 'pra' : 'pro'} ${vitima}.`);
    }
    for (const fiscal of ['Vera', 'Dona Norma', 'Dr. Álvaro']) expect(vistos.has(fiscal), fiscal).toBe(true);
    expect([...vistos].some((n) => ['Marlene', 'Caio', 'Jandira', 'Otávio', 'Celina', 'Nando', 'Solange', 'Ivo'].includes(n))).toBe(true);
  });

  it('os moradores novos entram na troca de nomes', () => {
    const nomes = new Set<string>();
    for (const base of fasesTrilho) for (const s of SEMENTES) for (const x of vestir(base, aleatorio(s)).vizinhos) nomes.add(x.nome);
    for (const n of ['Marlene', 'Jandira', 'Celina', 'Solange', 'Caio', 'Otávio', 'Nando', 'Ivo']) expect(nomes.has(n), n).toBe(true);
  });

  it('título que fala só "Zé" acompanha a vítima sorteada', () => {
    const f = { ...comZe[0], titulo: 'Antes do Zé voltar', boato: 'O Seu Zé saiu' };
    for (const s of SEMENTES) {
      const v = vestir(f, aleatorio(s), 1);
      const vitima = v.vizinhos.find((x) => x.tipo === 'assunto')!.nome;
      if (vitima === SEU_ZE) continue;
      expect(v.titulo).toBe(`Antes d${ELAS.has(vitima) ? 'a' : 'o'} ${vitima} voltar`);
    }
  });

  it('o Arnaldo, vítima com regra, nunca é renomeado', () => {
    const f = { ...comZe[0], vizinhos: comZe[0].vizinhos.map((x) => (x.tipo === 'assunto' ? { ...x, nome: 'Arnaldo', abafa: true } : x)) };
    for (const s of SEMENTES) expect(vestir(f, aleatorio(s), 1).vizinhos.find((x) => x.tipo === 'assunto')!.nome).toBe('Arnaldo');
  });

  it('nas fases de giros, a troca de nomes também preserva o quebra-cabeça', () => {
    for (const base of fasesGiros) for (const s of SEMENTES.slice(0, 10)) expect(resolver(vestir(base, aleatorio(s)))).toHaveLength(1);
  });
});
