// Quem é quem: a cada vez que a fase abre, os moradores comuns trocam de nome (e de desenho)
// e, às vezes, o boato passa a ser sobre outra pessoa em vez do Seu Zé — pra não parecer
// perseguição. Só muda a identidade: posições, tipos, passagens e setas ficam iguais, então o
// quebra-cabeça conferido pelos testes continua o mesmo.

import type { Fase } from './motor';

// Trocas só dentro do mesmo gênero, pra "a Cida" / "o Davi" continuarem certos nas dicas.
const FEMININAS = ['Rita', 'Ana', 'Bia', 'Cida'];
const MASCULINOS = ['Davi', 'Rui', 'Edu'];
export const ELAS = new Set(['Rita', 'Ana', 'Bia', 'Cida', 'Lia', 'Lúcia', 'Lu', 'Neide']);
export const SEU_ZE = 'Seu Zé';

const ela = (nome: string) => ELAS.has(nome);
// Concordância usada nos textos do jogo
export const o = (nome: string) => (ela(nome) ? 'a' : 'o');
export const pro = (nome: string) => (ela(nome) ? 'pra' : 'pro');
export const ele = (nome: string) => (ela(nome) ? 'ela' : 'ele');
export const dele = (nome: string) => (ela(nome) ? 'dela' : 'dele');
const maiuscula = (s: string) => s[0].toUpperCase() + s.slice(1);

const embaralhar = <T,>(xs: T[], sorte: () => number) => {
  const a = [...xs];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(sorte() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

export function vestir<F extends Fase>(fase: F, sorte: () => number, chanceVitima = 0.35): F {
  const comuns = fase.vizinhos.filter((v) => v.tipo === 'comum').map((v) => v.nome);
  const troca = new Map<string, string>();
  for (const grupo of [FEMININAS, MASCULINOS]) {
    const daqui = comuns.filter((n) => grupo.includes(n));
    embaralhar(grupo, sorte).slice(0, daqui.length).forEach((novo, i) => troca.set(daqui[i], novo));
  }

  // às vezes a vítima é outra pessoa, que não está no prédio com outro papel
  // ⚠️ só a vítima que é o Seu Zé troca de nome: um fiscal (Arnaldo…) é vítima com regra própria e continua ele
  const temZe = fase.vizinhos.some((v) => v.tipo === 'assunto' && v.nome === SEU_ZE);
  let vitima = SEU_ZE;
  if (temZe && sorte() < chanceVitima) {
    const usados = new Set([...fase.vizinhos.filter((v) => v.tipo !== 'comum').map((v) => v.nome), ...troca.values()]);
    const livres = [...FEMININAS, ...MASCULINOS].filter((n) => !usados.has(n));
    if (livres.length) vitima = livres[Math.floor(sorte() * livres.length)];
  }

  const nomes = [...troca.keys()];
  const texto = (s?: string) => {
    if (!s) return s;
    // uma passada só, pra Rita→Ana e Ana→Rita não se desfazerem
    let t = nomes.length ? s.replace(new RegExp(`\\b(${nomes.join('|')})\\b`, 'g'), (n) => troca.get(n) ?? n) : s;
    // ⚠️ a vítima entra depois das trocas: ela pode ter o nome antigo de alguém que foi trocado,
    // e se entrasse antes a troca a renomearia ("A Cida dorme de touca" com a Rita de vítima)
    if (vitima !== SEU_ZE) {
      t = t.replace(/\b(O|o|pro|do) Seu Zé/g, (_, antes: string) => {
        const novo = antes === 'pro' ? pro(vitima) : antes === 'do' ? `d${o(vitima)}` : o(vitima);
        return `${antes === 'O' ? maiuscula(novo) : novo} ${vitima}`;
      }).replace(/Seu Zé/g, vitima);
    }
    return t;
  };

  return {
    ...fase,
    titulo: texto(fase.titulo)!,
    boato: texto(fase.boato)!,
    dica: texto(fase.dica),
    vizinhos: fase.vizinhos.map((v) =>
      v.tipo === 'comum' ? { ...v, nome: troca.get(v.nome) ?? v.nome } : v.tipo === 'assunto' && v.nome === SEU_ZE ? { ...v, nome: vitima } : v),
  };
}
