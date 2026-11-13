import { describe, expect, it } from 'vitest';
import { alvosDe, amigosDe, type Vizinho } from './motor';
import { ELENCO, FOLGA, papelDoZe, personagemDoAndar } from './fabrica';
import { formatoDe, vaziosEspalhados } from './planta';
import { custo, jogar, resolverTrilho, type FaseTrilho } from './trilho';
import estoque from './andares.json';
import manifesto from '../public/arte/manifesto.json';

// Recertifica o estoque gerado sem confiar no gerador: as mesmas garantias das fases feitas à mão.
const fases = (estoque as unknown as { pos: number; peso: string; fase: FaseTrilho }[]);

// 2026-11-13: quem tem regra de personagem no andar (a ordem é a de estreia: o índice é o bloco em que cada um entra)
const ESTREIA = { vera: 0, nando: 1, raquel: 2, saida: 3, arnaldo: 4, norma: 5 } as const;
type Quem = keyof typeof ESTREIA;
const ordem = Object.keys(ESTREIA) as Quem[];
const presentes = (f: FaseTrilho): Quem[] => ordem.filter((q) => f.vizinhos.some((v) =>
  q === 'vera' ? v.vigia : q === 'nando' ? v.tipo === 'apressado' : q === 'raquel' ? v.desconfia : q === 'saida' ? v.sai !== undefined : q === 'arnaldo' ? v.abafa : v.recolhe));

describe('estoque de andares gerados', () => {
  it('150 andares, nas posições 0..149, com a escada leve/média/pesada e um chefão por bloco de 25', () => {
    expect(fases).toHaveLength(150);
    fases.forEach((a, i) => expect(a.pos).toBe(i));
    expect(fases.filter((a) => a.peso === 'chefe').map((a) => a.pos)).toEqual([24, 49, 74, 99, 124, 149]);
  });

  it('o prédio cresce com o peso: leve 3 andares, média 4, pesada e chefão 5 (sem rolar; Consulta 7), e nunca passa de 4 colunas', () => {
    const altura = { leve: 3, media: 4, pesada: 5, chefe: 5 } as Record<string, number>;
    // `saiu` = o peso que de fato saiu (se a fábrica não achar no prazo, ela desce um peso)
    for (const a of fases as unknown as { pos: number; saiu: string; fase: FaseTrilho }[]) {
      expect(Math.max(...a.fase.vizinhos.map((v) => v.pos[1])) + 1, `andar ${a.pos}`).toBeLessThanOrEqual(altura[a.saiu]);
    }
    expect(fases.filter((a) => Math.max(...a.fase.vizinhos.map((v) => v.pos[1])) + 1 >= 5).length).toBeGreaterThan(15);
    // ⚠️ 4 colunas é o teto: num celular de 390 de largura o cômodo cai pra ~93 e os selos ficam no limite de leitura
    const colunas = fases.map((a) => Math.max(...a.fase.vizinhos.map((v) => v.pos[0])) + 1);
    expect(Math.max(...colunas)).toBe(4);
    expect(colunas.filter((c) => c === 3).length).toBeGreaterThan(20); // os dois formatos aparecem
  });

  it('o vazio é parede: fora o 3×4, todo prédio tem planta (L, U, poço, H ou degraus), e no estoque há 4 ou mais', () => {
    // ⚠️ antes (2026-11-12) os vazios eram furos sorteados numa grade cheia. Só o 3×4 ainda pode ser a grade com furos
    // (fabrica.ts, montar): ali, com o Zé pesando na jogada, só os degraus rendem.
    const altos = fases.filter((a) => Math.max(...a.fase.vizinhos.map((v) => v.pos[1])) !== 3 || Math.max(...a.fase.vizinhos.map((v) => v.pos[0])) !== 2);
    expect(altos.filter((a) => !formatoDe(a.fase) && !vaziosEspalhados(a.fase)).map((a) => a.pos)).toEqual([]);
    expect(new Set(fases.map((a) => formatoDe(a.fase)).filter(Boolean)).size).toBeGreaterThanOrEqual(4);
  });

  it('os vazios ficam SEPARADOS na maioria dos andares (nenhum colado em outro), não amontoados num canto', () => {
    // ⚠️ o dono, jogando (2026-11-13): "por que os apartamentos vazios sempre estão juntos? seria bem melhor se fossem
    // separados". Antes eram 0 de 150: toda planta (L, degraus…) junta os vazios, e o prédio virava só um prédio menor.
    expect(fases.filter((a) => vaziosEspalhados(a.fase)).length).toBeGreaterThan(75);
  });

  it('o prédio não tem coluna vazia nem buraco no térreo (fora o 3×4, que pode ser a grade com furos)', () => {
    // ⚠️ o auditor achou 5 andares assim em 2026-11-13 (42, 51, 54, 98 e 145): tinham sido gerados antes de a fábrica
    // barrar esses casos, e o teste da planta deixava passar porque aceita 1 cômodo sobrando em qualquer lugar.
    const ruins = fases.filter((a) => {
      const v = a.fase.vizinhos, W = Math.max(...v.map((x) => x.pos[0])) + 1, H = Math.max(...v.map((x) => x.pos[1])) + 1;
      const colunaVazia = Array.from({ length: W }, (_, c) => c).some((c) => !v.some((x) => x.pos[0] === c));
      const terreo = v.filter((x) => x.pos[1] === H - 1).length;
      // nos vazios espalhados o térreo pode ter um apartamento vazio: é um vazio no meio do caminho, de propósito
      return colunaVazia || (terreo < W && !(W === 3 && H === 4) && !vaziosEspalhados(a.fase));
    }).map((a) => a.pos);
    expect(ruins).toEqual([]);
  });

  it('o Zé pesa em todo andar: sem a ameaça dele, a solução seria mais curta ou haveria outras', () => {
    // ⚠️ antes (2026-11-12) ele era enfeite em 111 de 150: bastava não apontar pra ele
    const enfeite = fases.filter((a) => !papelDoZe(a.fase, a.fase.setas - FOLGA, a.fase.solucao)).map((a) => a.pos);
    expect(enfeite).toEqual([]);
  });

  it('todo morador tem desenho ilustrado e ninguém repete no mesmo prédio', () => {
    const comArte = new Set(Object.keys(manifesto).filter((k) => k !== '_cenario'));
    for (const a of fases) {
      for (const v of a.fase.vizinhos) expect(comArte.has(v.nome), `${v.nome} (andar ${a.pos})`).toBe(true);
      expect(new Set(a.fase.vizinhos.map((v) => v.nome)).size).toBe(a.fase.vizinhos.length);
    }
  });

  it('a Fofoqueira não tem papel fixo: é atalho na maioria, armadilha em boa parte, e quase nunca colada no Zé (nos andares só do básico)', () => {
    // ⚠️ 2026-11-13: medido SÓ nos andares sem personagem (Zé, Fofoqueira e um tema), com os mesmos limites de antes. Com Vera, Nando,
    // Raquel, saída, Arnaldo ou Norma a Fofoqueira quase nunca sai como armadilha (a fábrica só a tenta no básico: 0 a 5 andares
    // por 10 s, contra 0 a 3 com personagem), então contar os andares com personagem puxaria a conta pra ~90% de atalho sem que o básico mudasse.
    // ⚠️ crítica do Fable (2026-11-11): colada no Zé em 100% virava placa de "não toque"; longe dele e sempre usada
    // (92%) virava "a saída é sempre por ela". Medido em 2026-11-12, depois do equilíbrio.
    const com = fases.filter((a) => !presentes(a.fase).length && a.fase.vizinhos.some((v) => v.tipo === 'fofoqueira'));
    const atalho = com.filter((a) => a.fase.vizinhos.some((v) => v.tipo === 'fofoqueira' && jogar(a.fase, a.fase.solucao).ouviu[v.id]));
    const colada = com.filter((a) => a.fase.vizinhos.some((v) => v.tipo === 'fofoqueira' && amigosDe(a.fase, v.id).includes('z')));
    expect(atalho.length / com.length).toBeGreaterThan(0.5);
    expect(atalho.length / com.length).toBeLessThan(0.8);
    expect(colada.length / com.length).toBeLessThan(0.35);
  });

  describe('o elenco por bloco de 25 (contrato com a campanha: campanha.ts, ESTREIAS)', () => {
    // 2026-11-13: bloco 0 Zé e Vera; 1 + Nando; 2 + Raquel; 3 + sai pra padaria; 4 + Arnaldo; 5 + Dona Norma.
    const bloco = (b: number) => fases.filter((a) => Math.floor(a.pos / 25) === b);

    it('cada personagem só aparece do bloco da estreia dele em diante', () => {
      // ⚠️ hoje passa (a fábrica antiga só faz Zé e Vera); o teste trava o contrato depois de a fábrica nova gerar o estoque
      const fora = fases.flatMap((a) => presentes(a.fase).filter((q) => Math.floor(a.pos / 25) < ESTREIA[q]).map((q) => `${q}@${a.pos}`));
      expect(fora).toEqual([]);
    });

    it('nome, regra e boato batem: a vítima com regra tem o nome e o boato dela; Nando é o apressado; Raquel é a desconfiada', () => {
      // ⚠️ o auditor mostrou (2026-11-13) que nenhum teste cobria isso: o elenco.ts não troca o nome de quem tem papel, então um
      // "Arnaldo" sem `abafa` (ou o contrário) ensinaria a regra errada
      const erros: string[] = [];
      for (const { pos, fase: f } of fases) {
        const z = f.vizinhos.find((v) => v.id === 'z')!;
        const [nome, falaDele] = z.vigia ? ['Vera', 'A Vera'] : z.abafa ? ['Arnaldo', 'O Arnaldo'] : z.recolhe ? ['Dona Norma', 'A Dona Norma'] : ['Seu Zé', 'O Seu Zé'];
        if (z.nome !== nome) erros.push(`${pos}: vítima ${z.nome}, devia ser ${nome}`);
        if (!f.boato.includes(falaDele)) erros.push(`${pos}: boato "${f.boato}" não fala de ${nome}`);
        if (nome !== 'Seu Zé' && /Seu Zé/.test(f.boato)) erros.push(`${pos}: boato fala do Zé, a vítima é ${nome}`);
        if ([z.vigia, z.abafa, z.recolhe].filter(Boolean).length > 1) erros.push(`${pos}: a vítima tem duas regras`);
        // as regras de vítima só moram na vítima
        if (f.vizinhos.some((v) => v.id !== 'z' && (v.vigia || v.abafa || v.recolhe))) erros.push(`${pos}: regra de vítima em quem não é vítima`);
        for (const v of f.vizinhos) {
          if ((v.tipo === 'apressado') !== (v.nome === 'Nando')) erros.push(`${pos}: ${v.nome} / ${v.tipo}`);
          if (!!v.desconfia !== (v.nome === 'Raquel')) erros.push(`${pos}: ${v.nome} / desconfia=${v.desconfia}`);
        }
      }
      expect(erros).toEqual([]);
    });

    it('cada personagem presente muda a jogada: tirada a regra, a solução deixa de ser a mesma (não é enfeite)', () => {
      const tira: Record<Quem, (v: Vizinho) => Vizinho> = {
        vera: (v) => ({ ...v, vigia: undefined }), nando: (v) => (v.tipo === 'apressado' ? { ...v, tipo: 'comum' } : v), raquel: (v) => ({ ...v, desconfia: undefined }),
        saida: (v) => ({ ...v, sai: undefined }), arnaldo: (v) => ({ ...v, abafa: undefined }), norma: (v) => ({ ...v, recolhe: undefined }),
      };
      const enfeites: string[] = [];
      for (const { pos, fase: f } of fases) for (const q of presentes(f)) {
        const K = custo(f.solucao);
        const outra = resolverTrilho({ ...f, vizinhos: f.vizinhos.map(tira[q]) }, K);
        if (outra.length === 1 && JSON.stringify(Object.entries(outra[0]).sort()) === JSON.stringify(Object.entries(f.solucao).sort())) enfeites.push(`${q}@${pos}`);
      }
      expect(enfeites).toEqual([]);
    });

    it.each([1, 2, 3, 4, 5])('bloco %i: o personagem que estreia aparece em pelo menos 5 andares (e em no máximo 14)', (b) => {
      const novo = ordem.find((q) => ESTREIA[q] === b)!;
      const n = bloco(b).filter((a) => presentes(a.fase).includes(novo)).length;
      expect(n, `${novo} no bloco ${b}`).toBeGreaterThanOrEqual(5);
      expect(n, `${novo} no bloco ${b}`).toBeLessThanOrEqual(14);
    });

    it.each([0, 1, 2, 3, 4, 5])('bloco %i: pelo menos 5 andares só com o básico (Zé, Fofoqueira e um tema) pra dar respiro', (b) => {
      // ⚠️ o pedido era uns 8; o piso é 5 porque um andar com personagem que não sai no prazo cai pro básico (só aumenta)
      const basicos = bloco(b).filter((a) => !presentes(a.fase).length && a.fase.vizinhos.some((v) => v.nome === 'Seu Zé'));
      expect(basicos.length).toBeGreaterThanOrEqual(5);
    });
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

describe('roteiro do elenco por bloco (fabrica.ts, personagemDoAndar)', () => {
  const doBloco = (b: number) => Array.from({ length: 25 }, (_, p) => personagemDoAndar(b * 25 + p));
  it('bloco 0: só a Vera (1 andar em 3); do 1 ao 5, só quem já estreou', () => {
    expect(new Set(doBloco(0).filter(Boolean))).toEqual(new Set(['vera']));
    for (let b = 1; b < ELENCO.length; b++) for (const q of doBloco(b)) if (q) expect(ELENCO.indexOf(q), `bloco ${b}`).toBeLessThanOrEqual(b);
  });
  it.each([1, 2, 3, 4, 5])('bloco %i: o novo em 8 a 10 andares (o chefão incluso), os anteriores em menos, 8 só com o básico', (b) => {
    const r = doBloco(b), conta = (q: string) => r.filter((x) => x === q).length;
    expect(conta(ELENCO[b])).toBeGreaterThanOrEqual(8);
    expect(conta(ELENCO[b])).toBeLessThanOrEqual(10);
    expect(r[24]).toBe(ELENCO[b]);
    for (const q of ELENCO.slice(0, b)) expect(conta(q), q).toBeLessThan(conta(ELENCO[b]));
    expect(r.filter((x) => !x)).toHaveLength(8);
  });
});
