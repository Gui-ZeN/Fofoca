// Migração do progresso salvo no aparelho (`fofoca.campanha.*`) quando a ordem do prédio mudou.
//
// Versão 3 (2026-11-13): as estreias (Nando, Raquel+Duplas, saída, Arnaldo, Dona Norma) entraram no meio do estoque
// gerado, que foi regerado com o elenco liberado até ali. O que o aparelho guardava era um ÍNDICE do andar (`liberada`) e
// rótulos (`primeira`, `tentativas`, `visto.<rótulo>`); os rótulos E1..E150 continuam existindo, mas apontam pra outros
// andares (o estoque é outro) e os índices deslocaram.
//
// Versão 4 (2026-11-17, Consulta 10): entra o capítulo do Interfone (I1–I3 + IF1…) logo depois do bloco 0, e o progresso passa de
// "um índice" pra "andares vencidos" (`vencidos`: lista de rótulos, únicos por ocorrência). Do `liberada` v3 saem os vencidos =
// todos os rótulos abaixo dele, na ordem v3 (o prédio de hoje SEM o capítulo novo, `ORDEM_V3`). Quem estava além do 56 vê I1 como
// próximo e o que já tinha vencido continua vencido e aberto. As aberturas de capítulo vistas do 7 em diante andam uma casa (o 7 agora é o
// Interfone). `liberada` e o resto das chaves antigas ficam onde estão (nada é apagado, exceto o que já era descartado na v3).
//
// ⚠️ Recuperável e idempotente: antes de mexer em qualquer coisa, a migração guarda uma cópia de todas as chaves da campanha em
// `<campanha>.v3.backup` (só se há o que guardar). Tudo é calculado A PARTIR DA CÓPIA, em memória, e a versão só é marcada por último:
// se a gravação falhar no meio, o próximo carregamento recalcula da cópia e chega no mesmo resultado (rodar de novo não desloca nada
// duas vezes). Se nem a cópia grava, nada é alterado. Limite: jogadas feitas entre uma falha e a nova tentativa são sobrescritas
// pelo cálculo da cópia (a falha de gravação já as teria perdido).
//
// Formatos antigos, sem chave de versão: v1 = 28 feitos à mão + estoque; v2 = 31 feitos à mão (entraram V1–V3, nas
// posições 28–30) + estoque. ⚠️ Sem a chave não dá pra saber qual dos dois é; trata como v2, que é o que está
// publicado desde 13/11/2026. Quem ainda estava no v1 e tinha `liberada` > 28 cai uns andares adiante do que esperava
// (nunca atrás) — aceito: os andares anteriores continuam abertos. `liberada` ≤ 30 não muda nos dois formatos.
// v1/v2 passam pelos dois passos (v3 e depois v4) numa tacada só.
// O modo `?pesquisa` (`fofoca.pesquisa`) NÃO migra: o participante sempre começa do zero (`&zerar`).

import { armazemDoNavegador, type Armazem } from './ajustes';
import { PREDIO, SEGMENTOS } from './campanha';

export const VERSAO = 4;
const CAMPANHA = 'fofoca.campanha';
const FEITOS_V2 = 31;
const ESTOQUE_V2 = 150; // o estoque antigo, em blocos: as voltas começam no índice 31 + 150 (histórico: não depende do estoque de hoje)

// A ordem do prédio na versão 3: o de hoje sem os segmentos do Interfone (a estreia e o bloco gerado). Não depende de quantos andares
// o JSON do Interfone tem.
const DO_INTERFONE = SEGMENTOS.filter((s) => s.id === 'interfone' || s.id === 'blocoInterfone');
export const ORDEM_V3: string[] = PREDIO.filter((_, i) => !DO_INTERFONE.some((s) => i >= s.inicio && i < s.fim)).map((a) => a.rotulo);

const parse = (bruto: string | null | undefined): unknown => { try { return bruto == null ? undefined : JSON.parse(bruto); } catch { return undefined; } };

// o rótulo do andar de índice `i` no formato v2 (os 31 primeiros não mudaram)
function rotuloV2(i: number): string {
  if (i < FEITOS_V2) return ORDEM_V3[i];
  const volta = Math.floor((i - FEITOS_V2) / ESTOQUE_V2);
  const n = ((i - FEITOS_V2) % ESTOQUE_V2) + 1;
  return volta ? `E${n}.${volta + 1}` : `E${n}`;
}

let indicePorRotulo: Map<string, number> | undefined;
// índice v3 do MESMO rótulo (em ORDEM_V3); sem rótulo no prédio de hoje (não deveria), fica como estava
export function indiceNovo(i: number): number {
  if (i < FEITOS_V2) return i;
  indicePorRotulo ??= new Map(ORDEM_V3.map((r, j) => [r, j]));
  return indicePorRotulo.get(rotuloV2(i)) ?? i;
}

export const marcarVersao = (armazem: Armazem, campanha = CAMPANHA) => {
  try { armazem.setItem(`${campanha}.versao`, String(VERSAO)); } catch { /* sem armazenamento: vale só nesta sessão */ }
};

// a cópia de segurança: a versão que estava gravada (null = nenhuma) e todas as chaves da campanha, como texto
interface Copia { versao: number | null; chaves: Record<string, string> }
const ehCopia = (x: unknown): x is Copia => !!x && typeof x === 'object' && 'chaves' in x && typeof (x as Copia).chaves === 'object' && (x as Copia).chaves !== null;

function copiar(armazem: Armazem, campanha: string): Copia {
  const versao = Number(armazem.getItem(`${campanha}.versao`));
  const chaves: Record<string, string> = {};
  const todas: string[] = [];
  for (let i = 0; i < armazem.length; i++) { const k = armazem.key(i); if (k) todas.push(k); }
  for (const k of todas) {
    if (!k.startsWith(`${campanha}.`) || k === `${campanha}.versao` || k === `${campanha}.v3.backup`) continue;
    const v = armazem.getItem(k);
    if (v !== null) chaves[k] = v;
  }
  return { versao: armazem.getItem(`${campanha}.versao`) !== null && Number.isInteger(versao) ? versao : null, chaves };
}

// O que gravar e o que apagar, calculado só da cópia (puro). v < 3 também faz o passo v3.
function calcular(copia: Copia, campanha: string): { definir: [string, string][]; remover: string[] } {
  const v = copia.versao ?? 2; // sem versão = v2 (ver acima)
  const definir: [string, string][] = [];
  const remover: string[] = [];
  const get = (nome: string) => parse(copia.chaves[`${campanha}.${nome}`]);

  const liberada = get('liberada');
  let l3: number | undefined; // `liberada` no formato v3 (índice em ORDEM_V3)
  if (typeof liberada === 'number' && Number.isInteger(liberada) && liberada > 0) {
    l3 = v < 3 ? indiceNovo(liberada) : liberada;
    if (l3 !== liberada) definir.push([`${campanha}.liberada`, JSON.stringify(l3)]);
    definir.push([`${campanha}.vencidos`, JSON.stringify(ORDEM_V3.slice(0, l3))]);
  }

  if (v < 3) {
    // o estoque foi regerado: o E7 de hoje é outro quebra-cabeça, então "de primeira" e tentativas dele não valem
    const doEstoque = (r: unknown) => typeof r === 'string' && r.startsWith('E');
    const primeira = get('primeira');
    if (Array.isArray(primeira) && primeira.some(doEstoque)) definir.push([`${campanha}.primeira`, JSON.stringify(primeira.filter((r) => !doEstoque(r)))]);
    const tentativas = get('tentativas');
    if (tentativas && typeof tentativas === 'object' && !Array.isArray(tentativas)) {
      const resto = Object.fromEntries(Object.entries(tentativas).filter(([r]) => !doEstoque(r)));
      if (Object.keys(resto).length !== Object.keys(tentativas).length) definir.push([`${campanha}.tentativas`, JSON.stringify(resto)]);
    }
  }

  // abertura de capítulo já vista: v<3, do 6 em diante mudou de conteúdo (1–5 são os feitos à mão); v3, o capítulo 7 agora é o
  // Interfone, então do 7 em diante cada número anda uma casa (quem viu a do Nando não revê a abertura dele, e vê a do Interfone)
  const prefixo = `${campanha}.visto.cap`;
  const sobem: [string, string][] = [];
  for (const [k, valor] of Object.entries(copia.chaves)) {
    if (!k.startsWith(prefixo) || !/^\d+$/.test(k.slice(prefixo.length))) continue;
    const n = Number(k.slice(prefixo.length));
    if (v < 3 ? n >= 6 : n >= 7) { remover.push(k); if (v >= 3) sobem.push([`${prefixo}${n + 1}`, valor]); }
  }
  for (const [k, valor] of sobem) definir.push([k, valor]);
  return { definir, remover };
}

// Roda uma vez por aparelho (grava `<campanha>.versao` por último). Devolve se migrou. Nunca lança.
export function migrar(armazem: Armazem = armazemDoNavegador, campanha = CAMPANHA): boolean {
  try {
    const versao = Number(armazem.getItem(`${campanha}.versao`));
    if (Number.isInteger(versao) && versao >= VERSAO) return false;

    // a cópia: se já existe (uma tentativa anterior falhou no meio), ela é a verdade; senão tira agora, ANTES de qualquer mudança
    const guardada = parse(armazem.getItem(`${campanha}.v3.backup`));
    let copia: Copia;
    if (ehCopia(guardada)) copia = guardada;
    else {
      copia = copiar(armazem, campanha);
      if (Object.keys(copia.chaves).length) armazem.setItem(`${campanha}.v3.backup`, JSON.stringify(copia)); // falhou? cai no catch: nada mudou
    }

    const { definir, remover } = calcular(copia, campanha);
    for (const k of remover) armazem.removeItem(k);
    for (const [k, valor] of definir) armazem.setItem(k, valor);
    armazem.setItem(`${campanha}.versao`, String(VERSAO));
    return true;
  } catch {
    return false;
  }
}
