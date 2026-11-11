// Fábrica de fases do trilho: monta prédios aleatórios e só aceita os que passam no "certificado".
// É o buscador das Consultas 2–3 trazido pro projeto. Roda fora do jogo (scripts/gerarAndares.ts),
// porque achar uma fase pesada leva de segundos a minutos — lento demais pra um celular na hora.
// O estoque gerado vai em src/andares.json; o jogo só lê.
//
// Certificado de uma fase:
//  - uma única solução sem seta sobrando, no menor número de setas K (dentro da faixa do molde);
//  - com uma seta a mais, no máximo 2 soluções (o K não é folga disfarçada);
//  - o caminho mais curto até as estrelas (ignorando vítima, horário, ordem e tamanho) PERDE;
//  - nas pesadas, quem só aprendeu "não cutucar o Zé nem a Fofoqueira colada nele" também perde;
//  - cada regra presente (padaria, ordem, tamanho) muda a jogada — senão ela é enfeite.

import { alvosDe, amigosDe, controlavel, type Fase, type Tamanho, type Vizinho } from './motor';
import { jogar, resolverTrilho, type FaseTrilho, type Plano } from './trilho';

export type Tema = 'cadeia' | 'padaria' | 'ordem' | 'tamanho' | 'padaria+ordem';
export type Peso = 'leve' | 'media' | 'pesada' | 'chefe';

export interface Molde {
  andares: number; // altura do prédio (3 colunas sempre; de 5 andares pra cima o palco rola na vertical)
  n: [number, number]; // moradores
  fof: number; // Fofoqueiras (a 1ª fica colada no Zé)
  estrelas: number;
  k: [number, number]; // faixa de setas da solução
  tema: Tema;
  zeMeio: boolean; // Zé numa célula do meio, com 3+ portas
  aprendeu: boolean; // exigir que o jogador "que aprendeu a T4" também perca
}

export function moldeDe(peso: Peso, tema: Tema): Molde {
  const base: Record<Peso, Omit<Molde, 'tema'>> = {
    // Prédio cresce com o peso (2026-11-11, "a fábrica com prédios maiores"): mais andares = caminhos mais
    // longos e mais lugar pra armadilha. 5 e 6 andares rolam na tela (Cena.tsx), com cômodo de ≥100 px.
    leve: { andares: 3, n: [6, 7], fof: 1, estrelas: 1, k: [3, 4], zeMeio: false, aprendeu: false },
    media: { andares: 4, n: [8, 10], fof: 1, estrelas: 1, k: [4, 5], zeMeio: false, aprendeu: false },
    pesada: { andares: 5, n: [10, 12], fof: 2, estrelas: 1, k: [5, 6], zeMeio: true, aprendeu: true },
    chefe: { andares: 6, n: [11, 13], fof: 2, estrelas: 2, k: [6, 7], zeMeio: true, aprendeu: true },
  };
  const m = { ...base[peso], tema };
  if (tema === 'ordem' || tema === 'padaria+ordem') m.estrelas = Math.max(2, m.estrelas);
  return m;
}

const pick = <T,>(xs: T[], sorte: () => number) => xs[Math.floor(sorte() * xs.length)];
const embaralha = <T,>(xs: T[], sorte: () => number) => {
  const a = [...xs];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(sorte() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
};

// Prédio aleatório no formato do molde (ids provisórios; os nomes vêm depois, em `vestirFabricada`).
export function montar(m: Molde, sorte: () => number): Fase | null {
  const cel: [number, number][] = [];
  for (let r = 0; r < m.andares; r++) for (let c = 0; c < 3; c++) cel.push([c, r]);
  const meio = cel.filter(([c, r]) => c === 1 && r > 0 && r < m.andares - 1);
  const vitPos = m.zeMeio ? pick(meio, sorte) : pick(cel, sorte);
  const n = m.n[0] + Math.floor(sorte() * (m.n[1] - m.n[0] + 1));
  const usados = [vitPos, ...embaralha(cel.filter(([c, r]) => !(c === vitPos[0] && r === vitPos[1])), sorte).slice(0, n - 1)];
  const ids = 'zabcdefghijklmnop'.slice(0, n).split('');
  const am: [string, string][] = [];
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
    const [a, b] = [usados[i], usados[j]];
    if (Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) === 1 && sorte() < 0.8) am.push([ids[i], ids[j]]);
  }
  const adj = (x: string) => am.flatMap(([a, b]) => (a === x ? [b] : b === x ? [a] : []));
  const dist = (o: string) => {
    const d: Record<string, number> = { [o]: 0 }; const q = [o];
    while (q.length) { const x = q.shift()!; for (const y of adj(x)) if (d[y] === undefined) { d[y] = d[x] + 1; q.push(y); } }
    return d;
  };
  if (Object.keys(dist('z')).length < n) return null;
  if (m.zeMeio && adj('z').length < 3) return null;
  const resto = embaralha(ids.slice(1), sorte);
  const origem = resto[0];
  const dO = dist(origem);
  // estrela longe da origem: 2 passos num prédio de 3 andares, 3 com 4, 4 do 5º andar pra cima
  const longe = resto.filter((x) => dO[x] >= Math.min(4, m.andares - 1));
  if (longe.length < m.estrelas) return null;
  const est = embaralha(longe, sorte).slice(0, m.estrelas);
  const livres = resto.filter((x) => x !== origem && !est.includes(x));
  const coladas = livres.filter((x) => adj('z').includes(x));
  if (!coladas.length || livres.length < m.fof) return null;
  const f1 = pick(coladas, sorte);
  const fofs = [f1, ...embaralha(livres.filter((x) => x !== f1), sorte).slice(0, m.fof - 1)];
  const temTamanho = m.tema === 'tamanho';
  const exag = temTamanho ? embaralha(livres.filter((x) => !fofs.includes(x)), sorte).slice(0, 2) : [];
  // cada morador comum precisa de um nome com desenho próprio (COMUNS): mais que isso repetiria rosto
  if (n - 1 - fofs.length - exag.length > COMUNS.length) return null;
  const ordem = m.tema === 'ordem' || m.tema === 'padaria+ordem';
  const padaria = m.tema === 'padaria' || m.tema === 'padaria+ordem';
  // padaria: às vezes no Zé, às vezes na 1ª estrela, às vezes nos dois
  const quem = padaria ? pick(['z', 'e', 'ze'], sorte) : '';
  const vizinhos: Vizinho[] = ids.map((id, i) => ({
    id, nome: id, pos: usados[i],
    tipo: id === 'z' ? 'assunto' : fofs.includes(id) ? 'fofoqueira' : exag.includes(id) ? 'exagerado' : 'comum',
    ...(est.includes(id) ? { interesse: { ...(ordem ? { ordem: est.indexOf(id) + 1 } : {}), ...(temTamanho ? { tamanho: 2 as Tamanho } : {}) } } : {}),
    ...(id === 'z' && quem.includes('z') ? { chega: 2 + Math.floor(sorte() * 3) } : {}),
    ...(id === est[0] && quem.includes('e') ? { chega: 3 + Math.floor(sorte() * 3) } : {}),
  }));
  return { titulo: '', boato: '', giros: 0, vizinhos, amizades: am, origens: [origem] };
}

// Planos em que só quem ouve tem seta (a mesma busca do resolvedor, sem filtrar vitória).
function folhas(f: Fase, K: number): Plano[] {
  const out: Plano[] = [];
  const decidir = (plano: Plano, dec: Set<string>, u: number) => {
    const r = jogar(f, plano);
    let prox: Vizinho | undefined, q = Infinity;
    for (const v of f.vizinhos) { const o = r.ouviu[v.id]; if (o && controlavel(v) && !dec.has(v.id) && o.batida < q) { prox = v; q = o.batida; } }
    if (!prox) return void out.push(plano);
    const d = new Set(dec).add(prox.id);
    decidir(plano, d, u);
    if (u < K) for (const a of alvosDe(f, prox)) decidir({ ...plano, [prox.id]: a }, d, u + 1);
  };
  decidir({}, new Set(), 0);
  return out;
}
const relaxada = (f: Fase): Fase => ({ ...f, vizinhos: f.vizinhos.map((v) => ({ ...v, chega: undefined, ...(v.interesse ? { interesse: {} } : {}) })) });
const sem = (f: Fase, o: 'chega' | 'ordem' | 'tamanho'): Fase =>
  ({ ...f, vizinhos: f.vizinhos.map((v) => (o === 'chega' ? { ...v, chega: undefined } : v.interesse ? { ...v, interesse: { ...v.interesse, [o]: undefined } } : v)) });
const mesma = (s: Plano[], p: Plano) => s.length === 1 && JSON.stringify(Object.entries(s[0]).sort()) === JSON.stringify(Object.entries(p).sort());

// Os planos "óbvios": estrelas ouvindo o mais cedo possível, com menos setas, sem pensar em
// vítima/horário/ordem/tamanho; `evita` = pra onde esse jogador não manda seta.
function obvios(f: Fase, K: number, evita: string[]): Plano[] {
  const rf = relaxada(f);
  const est = f.vizinhos.filter((v) => v.interesse).map((v) => v.id);
  const ok = folhas(rf, K).filter((p) => !Object.values(p).some((x) => evita.includes(x)))
    .map((p) => ({ p, r: jogar(rf, p) })).filter(({ r }) => est.every((s) => r.ouviu[s]));
  if (!ok.length) return [];
  const nota = ({ p, r }: typeof ok[0]) => Math.max(...est.map((s) => r.ouviu[s].batida)) * 100 + Object.keys(p).length;
  const mn = Math.min(...ok.map(nota));
  return ok.filter((x) => nota(x) === mn).map((x) => x.p);
}

export interface Certificado { K: number; solucao: Plano; armadilha: Plano }

export function certificar(f: Fase, m: Molde): Certificado | undefined {
  let K = 0, sol: Plano[] = [];
  for (K = 2; K <= m.k[1]; K++) { sol = resolverTrilho(f, K); if (sol.length) break; }
  if (sol.length !== 1 || K < m.k[0]) return;
  if (resolverTrilho(f, K + 1).length > 2) return;
  const p = sol[0];
  const ingenuos = obvios(f, K, []);
  if (!ingenuos.length || ingenuos.some((q) => jogar(f, q).vitoria)) return;
  if (m.aprendeu) {
    const coladas = f.vizinhos.filter((v) => v.tipo === 'fofoqueira' && amigosDe(f, v.id).includes('z')).map((v) => v.id);
    if (obvios(f, K, ['z', ...coladas]).some((q) => jogar(f, q).vitoria)) return;
  }
  if (f.vizinhos.some((v) => v.chega) && mesma(resolverTrilho(sem(f, 'chega'), K), p)) return;
  if (f.vizinhos.some((v) => v.interesse?.ordem) && mesma(resolverTrilho(sem(f, 'ordem'), K), p)) return;
  if (f.vizinhos.some((v) => v.interesse?.tamanho) && mesma(resolverTrilho(sem(f, 'tamanho'), K), p)) return;
  return { K, solucao: p, armadilha: ingenuos[0] };
}

// Nomes de verdade (o elenco ainda troca ao abrir): origem Rita, estrelas Bia/Cida/Ana,
// Fofoqueiras Neide/Lu, Exagerados Beto/Lúcia, o resto em ordem. Os ids viram a inicial.
// Só nomes com arte ilustrada (⚠️ antes havia Gil, Tião e Juca, sem desenho). A ordem alterna gênero; na tela
// o elenco ainda troca dentro do mesmo gênero (elenco.ts). Os ids viram uma letra fixa por nome.
const COMUNS = ['Ana', 'Davi', 'Bia', 'Rui', 'Lia', 'Edu', 'Marlene', 'Caio', 'Jandira', 'Otávio', 'Celina', 'Nando', 'Solange', 'Ivo'];
const ID: Record<string, string> = {
  Rita: 'r', Bia: 'b', Cida: 'c', Ana: 'a', Neide: 'n', Lu: 'l', Beto: 'o', 'Lúcia': 'u',
  Davi: 'd', Rui: 'y', Edu: 'e', Lia: 'i', 'Seu Zé': 'z',
  Marlene: 'm', Caio: 'k', Jandira: 'j', 'Otávio': 'v', Celina: 'x', Nando: 'w', Solange: 's', Ivo: 'h',
};

export function batizar(f: Fase, c: Certificado, titulo: string, boato: string): FaseTrilho {
  const nome: Record<string, string> = { z: 'Seu Zé', [f.origens![0]]: 'Rita' };
  const ests = f.vizinhos.filter((v) => v.interesse).sort((a, b) => (a.interesse!.ordem ?? 0) - (b.interesse!.ordem ?? 0));
  ests.forEach((v, i) => (nome[v.id] = ests.length === 1 ? 'Cida' : ['Bia', 'Cida', 'Ana'][i]));
  f.vizinhos.filter((v) => v.tipo === 'fofoqueira').forEach((v, i) => (nome[v.id] = ['Neide', 'Lu'][i]));
  f.vizinhos.filter((v) => v.tipo === 'exagerado').forEach((v, i) => (nome[v.id] = ['Beto', 'Lúcia'][i]));
  const livres = COMUNS.filter((x) => !Object.values(nome).includes(x));
  for (const v of f.vizinhos) if (!nome[v.id]) nome[v.id] = livres.shift()!;
  const novo = (id: string) => ID[nome[id]];
  const plano = (p: Plano) => Object.fromEntries(Object.entries(p).map(([a, b]) => [novo(a), novo(b)]));
  return {
    titulo, boato, giros: 0, setas: c.K, origens: [novo(f.origens![0])],
    vizinhos: f.vizinhos.map((v) => ({ ...v, id: novo(v.id), nome: nome[v.id] })),
    amizades: f.amizades.map(([a, b]) => [novo(a), novo(b)] as [string, string]),
    solucao: plano(c.solucao),
    armadilha: plano(c.armadilha),
  };
}

// Fabrica uma fase do molde dentro de um prazo; se não achar, tenta um molde mais leve.
export function fabricar(m: Molde, sorte: () => number, prazoMs: number): { f: Fase; c: Certificado; molde: Molde } | undefined {
  const fim = Date.now() + prazoMs;
  while (Date.now() < fim) {
    const f = montar(m, sorte);
    if (!f) continue;
    const c = certificar(f, m);
    if (c) return { f, c, molde: m };
  }
}

// Escada de cada bloco de 25 andares: leve, média, pesada, leve, média… e um chefão no fim.
export function pesoDoAndar(posNoEstoque: number): Peso {
  const p = posNoEstoque % 25;
  return p === 24 ? 'chefe' : (['leve', 'media', 'pesada', 'leve', 'media'] as Peso[])[p % 5];
}
