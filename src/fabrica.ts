// Fábrica de fases do trilho: monta prédios aleatórios e só aceita os que passam no "certificado".
// É o buscador das Consultas 2–3 trazido pro projeto. Roda fora do jogo (scripts/gerarAndares.ts),
// porque achar uma fase pesada leva de segundos a minutos — lento demais pra um celular na hora.
// O estoque gerado vai em src/andares.json; o jogo só lê.
//
// Certificado de uma fase:
//  - uma única solução sem seta sobrando, no menor número de setas K (dentro da faixa do molde);
//  - o jogador recebe K + FOLGA setas, e com elas há no máximo 2 soluções (a folga não abre a porteira);
//  - o caminho mais curto até as estrelas (ignorando vítima, horário, ordem e tamanho) PERDE, mesmo com a folga;
//  - nas pesadas, quem só aprendeu "não cutucar o Zé nem a Fofoqueira colada nele" também perde;
//  - cada regra presente (padaria, ordem, tamanho, Fofoqueira) muda a jogada — senão ela é enfeite.
//
// ⚠️ Padrões que o Fable achou jogando (2026-11-11) e que a fábrica agora barra — não "simplifique" de volta:
//  - setas = K exato: contar as setas entregava o tamanho do caminho. Agora sobra FOLGA, e a ★ fica pra quem usa só K;
//  - a 1ª Fofoqueira sempre colada no Zé virava placa de "não toque" (em 73% ela nem ouvia). Agora ela mora
//    longe dele e precisa mudar a jogada — atalho que o jogador tem que descobrir. Mas sempre atalho também
//    vira padrão: 1 andar em 3 (`fofArmadilha`) ela é armadilha — ninguém dela ouve na solução;
//  - Zé no canto com uma porta só (43%): bastava não ir pra lá. Agora ele nunca fica no canto e tem 2+ portas.

import { alvosDe, amigosDe, controlavel, type Fase, type Tamanho, type Vizinho } from './motor';
import { jogar, resolverTrilho, type FaseTrilho, type Plano } from './trilho';
import { celulas, FORMATOS, type Formato } from './planta';

// setas além do mínimo (K): o contador deixa de entregar o tamanho do caminho
export const FOLGA = 1;

export type Tema = 'cadeia' | 'padaria' | 'ordem' | 'tamanho' | 'padaria+ordem';
export type Peso = 'leve' | 'media' | 'pesada' | 'chefe';

export interface Molde {
  andares: number; // altura do prédio (de 5 andares pra cima o palco rola na vertical)
  colunas?: number; // largura (padrão 3). 4 é experimento de 2026-11-12: "expandir o prédio pros lados?"
  n: [number, number]; // moradores
  fof: number; // Fofoqueiras (a 1ª mora longe do Zé; a 2ª, onde cair)
  estrelas: number;
  k: [number, number]; // faixa de setas da solução
  tema: Tema;
  zeMeio: boolean; // Zé numa célula do meio, com 3+ portas
  aprendeu: boolean; // exigir que o jogador "que aprendeu a T4" também perca
  // a Fofoqueira é armadilha (ninguém dela ouve na solução) em vez de atalho. ⚠️ Sem isso, longe do Zé ela
  // virou o atalho em 92% dos andares — "a saída é sempre por ela" (2026-11-12). A armadilha TAMBÉM mora longe
  // do Zé: deixada onde cair, ela caía colada nele em 54 de 58 e voltava a ser a placa de "não toque".
  fofArmadilha?: boolean;
  // a vítima é a Vera, a vigia (fiscais.ts): escuta quando um vizinho dela CONTA algo. É a vilã que pesa pela posição —
  // passar perto dela é o risco, sem depender da Fofoqueira (2026-11-12, "o vilão é um pedaço de nada").
  vera?: boolean;
  // último recurso do gerador: aceitar o andar mesmo com o Zé de enfeite (papelDoZe). Só o prédio de 3 andares usa,
  // quando nada sai no prazo — ali quase não sobra caminho alternativo pra ele cortar.
  zeLivre?: boolean;
  formato?: Formato; // a planta do prédio (planta.ts); sem isso, sorteia uma que caiba na lotação do molde
}

export function moldeDe(peso: Peso, tema: Tema, largo = false): Molde {
  const base: Record<Peso, Omit<Molde, 'tema'>> = {
    // Prédio cresce com o peso (2026-11-11, "a fábrica com prédios maiores"): mais andares = caminhos mais
    // longos e mais lugar pra armadilha. 5 e 6 andares rolam na tela (Cena.tsx), com cômodo de ≥100 px.
    // ⚠️ o leve é 4×3 (largo), não 3×3 (2026-11-13): no 3×3 a Vera não rendia NENHUM andar e o Zé só pesava com a
    // padaria — não sobra caminho alternativo. Medido com a máquina livre, exigindo o vilão pesando: 4×3 rende 127
    // andares com o Zé e 65 com a Vera, em L, H e degraus; o 3×4 rende 45 e 3, só em degraus. (Na véspera, com a
    // máquina ocupada, a conta tinha saído ao contrário — não confie em medição feita com o gerador rodando.)
    leve: { andares: 3, colunas: 4, n: [8, 10], fof: 1, estrelas: 1, k: [3, 4], zeMeio: false, aprendeu: false },
    media: { andares: 4, n: [8, 10], fof: 1, estrelas: 1, k: [4, 5], zeMeio: false, aprendeu: false },
    pesada: { andares: 5, n: [10, 12], fof: 2, estrelas: 1, k: [5, 6], zeMeio: true, aprendeu: true },
    // ⚠️ chefão em 5 andares, não 6 (Consulta 7, 20 de 20 designers): o 3×6 rolava na tela — o clímax do capítulo
    // jogado sem ver origem, estrela e Zé juntos, e com o arrasto vertical virando rolagem. Medido: o 3×6 tinha
    // a mesma rede que o 3×5 (+1 morador, +1 passagem); a altura só comprava rolagem.
    chefe: { andares: 5, n: [11, 12], fof: 2, estrelas: 2, k: [6, 7], zeMeio: true, aprendeu: true },
  };
  // `largo`: a variante de 4 colunas do médio e do pesado (o dono achou legível no celular, 2026-11-12). Rende um pouco
  // menos que a de 3, mas em plantas que a de 3 não dá (L e U no médio; U e poço no pesado) — o gerador alterna as duas.
  // O chefão fica em 3×5: em 4×5 quase nada certifica (5 andares em 20 s, contra 26).
  const larga: Partial<Record<Peso, Partial<Molde>>> = { media: { andares: 4, colunas: 4, n: [10, 12] }, pesada: { andares: 4, colunas: 4, n: [11, 13] } };
  const m = { ...base[peso], ...(largo ? larga[peso] : {}), tema };
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
  // ⚠️ o vazio é PAREDE desenhada (planta.ts): o prédio tem formato e só sobra, no máximo, 1 cômodo vazio fora dele.
  // Antes as células vazias eram sobra do sorteio numa grade cheia — furos que não decidiam nada.
  const colunas = m.colunas ?? 3;
  const cabe = (fo: Formato) => { const t = celulas(fo, m.andares, false, colunas).length; return t >= m.n[0] && t <= m.n[1] + 1; };
  // ⚠️ no 3×4 a grade cheia (com furos) também entra: com o Zé obrigado a pesar (papelDoZe), das plantas só os degraus
  // rendem nesse tamanho, e o médio estreito ficaria todo igual (medido em 2026-11-12). Nos largos não precisa.
  const formato = m.formato ?? pick([...FORMATOS.filter(cabe), ...(colunas === 3 && m.andares <= 4 ? ['cheio' as Formato] : [])], sorte);
  const cel = celulas(formato, m.andares, sorte() < 0.5, colunas);
  const portas = ([c, r]: [number, number]) => cel.filter(([x, y]) => Math.abs(x - c) + Math.abs(y - r) === 1).length;
  const canto = ([c, r]: [number, number]) => (c === 0 || c === colunas - 1) && (r === 0 || r === m.andares - 1);
  // o Zé "do meio" é o que tem 3+ portas possíveis (numa planta com poço, a coluna do meio pode nem existir)
  const paraZe = cel.filter((x) => !canto(x) && portas(x) >= (m.zeMeio ? 3 : 2));
  if (!paraZe.length) return null;
  const vitPos = pick(paraZe, sorte);
  // ⚠️ numa planta sobra no MÁXIMO 1 cômodo: com a lotação sorteada solta sobravam 2 ou 3 e o desenho se desfazia
  // (4 andares do estoque de 2026-11-13 saíram sem planta reconhecível)
  const sorteado = m.n[0] + Math.floor(sorte() * (m.n[1] - m.n[0] + 1));
  const n = Math.min(cel.length, formato === 'cheio' ? sorteado : Math.max(sorteado, cel.length - 1));
  const usados = [vitPos, ...embaralha(cel.filter(([c, r]) => !(c === vitPos[0] && r === vitPos[1])), sorte).slice(0, n - 1)];
  // ⚠️ canto de VERDADE é o do prédio desenhado: com a última coluna ou o último andar vazios, o prédio encolhe
  // (Predio.medidas) e o Zé "do meio da borda" vira canto (3 de 150 na 1ª geração)
  const W = Math.max(...usados.map(([c]) => c)), H = Math.max(...usados.map(([, r]) => r));
  // o cômodo que sobra vazio não pode ser a ponta de cima da planta (a torre do L, o alto dos degraus): o prédio
  // perderia um andar e o formato com ele
  if (!usados.some(([, r]) => r === 0)) return null;
  // …nem uma coluna inteira (o prédio largo viraria estreito, ou ficaria com uma faixa vazia do lado), nem o térreo
  for (let c = 0; c < colunas; c++) if (!usados.some(([x]) => x === c)) return null;
  if (formato !== 'cheio' && usados.filter(([, r]) => r === m.andares - 1).length < colunas) return null;
  if ((vitPos[0] === 0 || vitPos[0] === W) && (vitPos[1] === 0 || vitPos[1] === H)) return null;
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
  if (adj('z').length < (m.zeMeio ? 3 : 2)) return null;
  const resto = embaralha(ids.slice(1), sorte);
  const origem = resto[0];
  const dO = dist(origem);
  // estrela longe da origem: 2 passos num prédio de 3 andares, 3 com 4, 4 do 5º andar pra cima
  const longe = resto.filter((x) => dO[x] >= Math.min(4, m.andares - 1));
  if (longe.length < m.estrelas) return null;
  const est = embaralha(longe, sorte).slice(0, m.estrelas);
  const livres = resto.filter((x) => x !== origem && !est.includes(x));
  const longeDoZe = livres.filter((x) => dist('z')[x] >= 2);
  if (!longeDoZe.length || livres.length < m.fof) return null;
  const f1 = pick(longeDoZe, sorte);
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
    ...(id === 'z' && m.vera ? { vigia: true } : {}),
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

// O Zé PESA na jogada? Refaz a conta com o mesmo prédio e o Zé virando um morador qualquer (pode ouvir e passar adiante):
//  - 'desvio': sem a ameaça existe solução com menos setas — ele obriga a dar a volta;
//  - 'corta': com as mesmas setas aparecem outras soluções — ele elimina caminhos que davam certo;
//  - undefined: nada muda. O Zé é enfeite e o andar é recusado.
// ⚠️ Antes disso o Zé era "um pedaço de nada" (dono jogando, 2026-11-12): só precisava não apontar pra ele. Em 150
// andares, o caminho óbvio só perdia por causa dele em 13, e com as plantas ele foi parar na borda em 129.
// ⚠️ Não troque por "o Zé bloqueia TODO caminho mais curto": aí a volta é o único caminho, o óbvio vira a solução e o
// certificado recusa tudo (0 andares leves e médios em 3 milhões de tentativas).
export function papelDoZe(f: Fase, K: number, solucao: Plano): 'desvio' | 'corta' | undefined {
  const semAmeaca: Fase = { ...f, vizinhos: f.vizinhos.map((v) => (v.tipo === 'assunto' ? { ...v, tipo: 'comum', vigia: undefined } : v)) };
  for (let k = 2; k < K; k++) if (resolverTrilho(semAmeaca, k).length) return 'desvio';
  return mesma(resolverTrilho(semAmeaca, K), solucao) ? undefined : 'corta';
}

export function certificar(f: Fase, m: Molde): Certificado | undefined {
  let K = 0, sol: Plano[] = [];
  for (K = 2; K <= m.k[1]; K++) { sol = resolverTrilho(f, K); if (sol.length) break; }
  if (sol.length !== 1 || K < m.k[0]) return;
  const p = sol[0];
  const fofs = f.vizinhos.filter((v) => v.tipo === 'fofoqueira');
  if (m.fofArmadilha && fofs.some((v) => jogar(f, p).ouviu[v.id])) return;
  const S = K + FOLGA; // o que o jogador recebe
  if (resolverTrilho(f, S).length > 2) return;
  const ingenuos = obvios(f, S, []);
  if (!ingenuos.length || ingenuos.some((q) => jogar(f, q).vitoria)) return;
  if (m.aprendeu) {
    const coladas = f.vizinhos.filter((v) => v.tipo === 'fofoqueira' && amigosDe(f, v.id).includes('z')).map((v) => v.id);
    if (obvios(f, S, ['z', ...coladas]).some((q) => jogar(f, q).vitoria)) return;
  }
  if (f.vizinhos.some((v) => v.chega) && mesma(resolverTrilho(sem(f, 'chega'), K), p)) return;
  if (f.vizinhos.some((v) => v.interesse?.ordem) && mesma(resolverTrilho(sem(f, 'ordem'), K), p)) return;
  if (f.vizinhos.some((v) => v.interesse?.tamanho) && mesma(resolverTrilho(sem(f, 'tamanho'), K), p)) return;
  const comum: Fase = { ...f, vizinhos: f.vizinhos.map((v) => (v.tipo === 'fofoqueira' ? { ...v, tipo: 'comum' } : v)) };
  if (fofs.length && mesma(resolverTrilho(comum, K), p)) return;
  // a Vera: sem a escuta dela (só "não contar pra ela"), a jogada tem que ser outra
  if (f.vizinhos.some((v) => v.vigia) && mesma(resolverTrilho({ ...f, vizinhos: f.vizinhos.map((v) => ({ ...v, vigia: undefined })) }, K), p)) return;
  if (!m.zeLivre && !papelDoZe(f, K, p)) return; // por último: é a conta mais cara
  return { K, solucao: p, armadilha: ingenuos[0] };
}

// Nomes de verdade (o elenco ainda troca ao abrir): origem Rita, estrelas Bia/Cida/Ana,
// Fofoqueiras Neide/Lu, Exagerados Beto/Lúcia, o resto em ordem. Os ids viram a inicial.
// Só nomes com arte ilustrada (⚠️ antes havia Gil, Tião e Juca, sem desenho). A ordem alterna gênero; na tela
// o elenco ainda troca dentro do mesmo gênero (elenco.ts). Os ids viram uma letra fixa por nome.
// ⚠️ sem o Nando (é o apressado; ver elenco.ts)
const COMUNS = ['Ana', 'Davi', 'Bia', 'Rui', 'Lia', 'Edu', 'Marlene', 'Caio', 'Jandira', 'Otávio', 'Celina', 'Solange', 'Ivo'];
const ID: Record<string, string> = {
  Rita: 'r', Bia: 'b', Cida: 'c', Ana: 'a', Neide: 'n', Lu: 'l', Beto: 'o', 'Lúcia': 'u',
  Davi: 'd', Rui: 'y', Edu: 'e', Lia: 'i', 'Seu Zé': 'z', Vera: 'z',
  Marlene: 'm', Caio: 'k', Jandira: 'j', 'Otávio': 'v', Celina: 'x', Nando: 'w', Solange: 's', Ivo: 'h',
};

export function batizar(f: Fase, c: Certificado, titulo: string, boato: string): FaseTrilho {
  const vera = f.vizinhos.some((v) => v.vigia);
  const nome: Record<string, string> = { z: vera ? 'Vera' : 'Seu Zé', [f.origens![0]]: 'Rita' };
  const ests = f.vizinhos.filter((v) => v.interesse).sort((a, b) => (a.interesse!.ordem ?? 0) - (b.interesse!.ordem ?? 0));
  ests.forEach((v, i) => (nome[v.id] = ests.length === 1 ? 'Cida' : ['Bia', 'Cida', 'Ana'][i]));
  f.vizinhos.filter((v) => v.tipo === 'fofoqueira').forEach((v, i) => (nome[v.id] = ['Neide', 'Lu'][i]));
  f.vizinhos.filter((v) => v.tipo === 'exagerado').forEach((v, i) => (nome[v.id] = ['Beto', 'Lúcia'][i]));
  const livres = COMUNS.filter((x) => !Object.values(nome).includes(x));
  for (const v of f.vizinhos) if (!nome[v.id]) nome[v.id] = livres.shift()!;
  const novo = (id: string) => ID[nome[id]];
  const plano = (p: Plano) => Object.fromEntries(Object.entries(p).map(([a, b]) => [novo(a), novo(b)]));
  return {
    titulo, boato: vera ? boato.replace('O Seu Zé', 'A Vera') : boato, giros: 0, setas: c.K + FOLGA, origens: [novo(f.origens![0])],
    vizinhos: f.vizinhos.map((v) => ({ ...v, id: novo(v.id), nome: nome[v.id] })),
    amizades: f.amizades.map(([a, b]) => [novo(a), novo(b)] as [string, string]),
    solucao: plano(c.solucao),
    armadilha: plano(c.armadilha),
  };
}

// Fabrica uma fase do molde dentro de um prazo; se não achar, tenta um molde mais leve.
// `aceita`: filtro extra de quem chama (a régua de raciocínio e o "quase" do gerador) — a busca continua até o prazo.
export function fabricar(m: Molde, sorte: () => number, prazoMs: number, aceita?: (f: Fase, c: Certificado) => boolean): { f: Fase; c: Certificado; molde: Molde } | undefined {
  const fim = Date.now() + prazoMs;
  while (Date.now() < fim) {
    const f = montar(m, sorte);
    if (!f) continue;
    const c = certificar(f, m);
    if (c && (!aceita || aceita(f, c))) return { f, c, molde: m };
  }
}

// Escada de cada bloco de 25 andares: leve, média, pesada, leve, média… e um chefão no fim.
export function pesoDoAndar(posNoEstoque: number): Peso {
  const p = posNoEstoque % 25;
  return p === 24 ? 'chefe' : (['leve', 'media', 'pesada', 'leve', 'media'] as Peso[])[p % 5];
}
