// O "quaseee": entre todos os planos que cabem nas setas, os que erram por UM detalhe só — o boato chegou e errou
// no tamanho, na ordem, na hora (recado que chegou antes da pessoa voltar) ou o Zé ouviu só no finzinho, depois
// de todas as estrelas. Pedido do dono (2026-11-12): "quero fazer a pessoa pensar, testar e falar quaseee".
// ⚠️ "A estrela ficou sem notícia" NÃO conta: qualquer plano incompleto cai nisso, e quem perde assim não sente que
// chegou perto (medido: era o "quase" de 177 dos 178 andares, e mascarava andares sem nenhum quase de verdade).

import { alvosDe, controlavel, type Fase, type Resultado, type Vizinho } from './motor';
import { jogar, type FaseTrilho, type Plano } from './trilho';

// Todos os planos "folha" dentro de K setas (a mesma busca do resolvedor: decide a seta de quem ouve, na ordem).
export function planos(f: Fase, K: number): Plano[] {
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

export type Falha = 'gente demais' | 'sem notícia' | 'chegou cedo' | 'faltou a 2ª fonte' | 'passou da hora' | 'tamanho' | 'versão' | 'ordem' | 'vítima ouviu' | 'vítima no finzinho';
export const DE_VERDADE = new Set<Falha>(['gente demais', 'chegou cedo', 'faltou a 2ª fonte', 'passou da hora', 'tamanho', 'versão', 'ordem', 'vítima no finzinho']);

// Por que a estrela ficou sem notícia? Contrafactual: tira UMA regra de bloqueio e joga o MESMO plano; se aí ela
// ouve, foi aquela regra que barrou — é um quase de verdade. ⚠️ Antes (Consulta 8, Astra) qualquer recado perdido
// na padaria, até um mandado pro Zé, fazia a estrela contar como "chegou cedo", sem relação entre as duas coisas.
const BLOQUEIOS: [Falha, (v: Vizinho) => Vizinho][] = [
  ['chegou cedo', (v) => (v.tipo === 'assunto' ? v : { ...v, chega: undefined })],
  ['faltou a 2ª fonte', (v) => ({ ...v, desconfia: undefined })],
  ['passou da hora', (v) => ({ ...v, recolhe: undefined })],
];
function barrada(f: Fase, plano: Plano, estrela: string): Falha {
  for (const [nome, tira] of BLOQUEIOS) {
    const g = { ...f, vizinhos: f.vizinhos.map(tira) };
    if (JSON.stringify(g.vizinhos) !== JSON.stringify(f.vizinhos) && jogar(g, plano).ouviu[estrela]) return nome;
  }
  return 'sem notícia';
}

// O que deu errado num resultado (vazio = venceu). `plano` = o que foi jogado (pra achar a causa do "sem notícia").
export function falhas(f: Fase, r: Resultado, plano?: Plano): Falha[] {
  const out: Falha[] = [];
  const ultimaEstrela = Math.max(0, ...f.vizinhos.filter((v) => v.interesse).map((v) => r.ouviu[v.id]?.batida ?? Infinity));
  for (const v of f.vizinhos) if (v.tipo === 'assunto' && r.ouviu[v.id]) out.push(r.ouviu[v.id].batida > ultimaEstrela ? 'vítima no finzinho' : 'vítima ouviu');
  for (const v of f.vizinhos) {
    if (!v.interesse) continue;
    const o = r.ouviu[v.id];
    if (!o) { out.push(plano ? barrada(f, plano, v.id) : 'sem notícia'); continue; }
    const t = v.interesse.tamanho ?? v.interesse.minTamanho;
    if (t && (v.interesse.tamanho ? o.tamanho !== t : o.tamanho < t)) out.push('tamanho');
    if (v.interesse.versao && o.versao !== v.interesse.versao) out.push('versão');
  }
  const fila = f.vizinhos.filter((v) => v.interesse?.ordem && r.ouviu[v.id]).sort((a, b) => a.interesse!.ordem! - b.interesse!.ordem!);
  for (let i = 1; i < fila.length; i++) if (r.ouviu[fila[i].id].batida <= r.ouviu[fila[i - 1].id].batida) out.push('ordem');
  if (f.vizinhos.some((v) => v.teto && Object.keys(r.ouviu).length > v.teto)) out.push('gente demais');
  return out;
}

export interface Quase { deVerdade: number; tipos: Falha[]; armadilhaDeVerdade: boolean }

export function medirQuase(f: FaseTrilho): Quase {
  // ⚠️ conta RESULTADOS diferentes, não planos: dois planos que só diferem por uma seta inútil dão o mesmo
  // espalhamento e contavam em dobro (Astra: 8 planos "quase" eram 4 resultados)
  const vistos = new Set<string>();
  const tipos = new Set<Falha>();
  for (const p of planos(f, f.setas)) {
    const r = jogar(f, p);
    const fs = falhas(f, r, p);
    if (fs.length !== 1 || !DE_VERDADE.has(fs[0])) continue;
    vistos.add(JSON.stringify(Object.entries(r.ouviu).map(([id, o]) => [id, o.batida, o.tamanho, o.versao]).sort()));
    tipos.add(fs[0]);
  }
  const deVerdade = vistos.size;
  const fa = f.armadilha ? falhas(f, jogar(f, f.armadilha), f.armadilha) : [];
  return { deVerdade, tipos: [...tipos], armadilhaDeVerdade: fa.length === 1 && DE_VERDADE.has(fa[0]) };
}

// Critério da fábrica: pelo menos 3 quases de verdade (resultados diferentes) e a armadilha (o caminho óbvio) também
// quase acerta, errando por um detalhe. ⚠️ Saiu a exigência de 2 TIPOS das médias pra cima (Consulta 8, Astra): uma
// fase difícil sobre uma ideia só pode ser ótima, e a exigência empurrava a misturar regras, contra o teto de leitura.
// É filtro auxiliar: 3 quases não provam vontade de tentar de novo — isso só o teste com pessoas diz.
export const QUASE_MIN = 3;
export const quaseBasta = (q: Quase, _peso?: string) => q.deVerdade >= QUASE_MIN && q.armadilhaDeVerdade;
