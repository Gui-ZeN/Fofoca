// Motor da Fofoca: regras puras e determinísticas. O mesmo código serve o jogo,
// os testes e (depois) o gerador de fases.

export type Tipo = 'comum' | 'fofoqueira' | 'exagerado' | 'docontra' | 'tumulo' | 'assunto';
export type Versao = 'normal' | 'invertida';
export type Tamanho = 1 | 2 | 3; // cochicho, boato, escândalo

export interface Interesse {
  minTamanho?: Tamanho; // mecânica antiga: aceita esse tamanho ou maior
  tamanho?: Tamanho; // trilho: quer exatamente esse tamanho (quem pede boato não aceita escândalo)
  versao?: Versao;
  ordem?: number; // bloco Ordem: quem tem número menor precisa ouvir ANTES (empate perde)
}

export interface Vizinho {
  id: string;
  nome: string;
  tipo: Tipo;
  pos: [coluna: number, andar: number]; // andar 0 = topo
  seta?: string; // melhor amigo (comum, exagerado, docontra)
  interesse?: Interesse; // presente = precisa ouvir
  chega?: number; // fora de casa até esta batida: recado que chega antes se perde
  celular?: string[]; // trilho: pode ligar pra um destes (sem passagem), em vez de contar pra um vizinho
}

export interface Fase {
  titulo: string;
  boato: string;
  dica?: string; // tutorial: a regra em uma frase, até a primeira seta
  novidade?: string; // depois do tutorial: só sinaliza a regra nova, numa etiqueta "NOVO"
  giros: number;
  vizinhos: Vizinho[];
  amizades: [string, string][];
  origens?: string[]; // quem você encontrou hoje: só eles podem ouvir primeiro (sem a lista, qualquer um)
  // Trilho: o jogador desenha quem conta pra quem, com até `setas` setas. A origem é origens[0].
  // Sem este campo, a fase é da mecânica antiga (setas prontas + giros).
  setas?: number;
}

export interface Jogada {
  origem: string;
  setas: Record<string, string>; // só as setas que o jogador mudou
}

export interface Mensagem {
  de: string;
  para: string;
  tamanho: Tamanho;
  versao: Versao;
}

export interface Ouvido {
  tamanho: Tamanho;
  versao: Versao;
  batida: number;
  // de quem ouviu de fato (a mensagem aceita, já com o desempate de tamanho/versão); a origem não ouviu de ninguém.
  // ⚠️ `batidas` guarda os ENVIOS, inclusive os ignorados (já ouviu, fora de casa, perdeu o desempate): não use pra culpar ninguém.
  de: string | null;
}

export type Motivo = 'assunto_ouviu' | 'interessado_nao_ouviu' | 'tamanho_errado' | 'versao_errada' | 'ordem_errada';

export interface Resultado {
  batidas: Mensagem[][]; // batida 1, 2, ... (a origem ouve na batida 0)
  ouviu: Record<string, Ouvido>;
  vitoria: boolean;
  motivo?: Motivo;
  culpado?: string; // quem causou a derrota (assunto ou interessado)
  antes?: string; // ordem_errada: quem tinha que ter sabido primeiro
}

export const amigosDe = (fase: Fase, id: string): string[] =>
  fase.amizades.flatMap(([a, b]) => (a === id ? [b] : b === id ? [a] : []));

const temSeta = (t: Tipo) => t === 'comum' || t === 'exagerado' || t === 'docontra';

// Trilho: quem aceita seta desenhada (a Fofoqueira conta sozinha; Padre e Seu Zé não contam).
export const controlavel = (v: Vizinho) => temSeta(v.tipo);

// Pra quem cada um pode contar no trilho: vizinhos de passagem e, se tiver celular, os destinos dele.
export const alvosDe = (fase: Fase, v: Vizinho): string[] =>
  controlavel(v) ? [...new Set([...amigosDe(fase, v.id), ...(v.celular ?? [])])] : [];

// Ligação de celular: a seta vai pra alguém que não é vizinho de passagem.
export const porCelular = (fase: Fase, de: string, para: string) => !amigosDe(fase, de).includes(para);

// Só gira quem já tem seta: girar não pode fazer quem não conta nada passar a contar.
export const podeGirar = (fase: Fase, v: Vizinho) => temSeta(v.tipo) && !!v.seta && amigosDe(fase, v.id).length > 1;

// Não dá pra contar direto pra quem quer saber (ficaria óbvio que foi você) nem pro assunto.
// Se a fase diz quem você encontrou hoje, só essas pessoas podem ouvir primeiro.
export const podeSerOrigem = (fase: Fase, v: Vizinho) =>
  v.tipo !== 'assunto' && !v.interesse && (!fase.origens || fase.origens.includes(v.id));

export const girosUsados = (fase: Fase, setas: Record<string, string>) =>
  fase.vizinhos.filter((v) => setas[v.id] !== undefined && setas[v.id] !== v.seta).length;

const inverter = (v: Versao): Versao => (v === 'normal' ? 'invertida' : 'normal');

// Quando várias mensagens chegam juntas: maior tamanho vence; empate, a versão normal.
const melhor = (a: Mensagem, b: Mensagem) =>
  b.tamanho > a.tamanho || (b.tamanho === a.tamanho && b.versao === 'normal' && a.versao !== 'normal') ? b : a;

export function espalhar(fase: Fase, jogada: Jogada): Resultado {
  const porId = new Map(fase.vizinhos.map((v) => [v.id, v]));
  const ouviu: Record<string, Ouvido> = { [jogada.origem]: { tamanho: 1, versao: 'normal', batida: 0, de: null } };
  const batidas: Mensagem[][] = [];
  let fronteira = [jogada.origem];

  for (let batida = 1; fronteira.length > 0; batida++) {
    const saindo: Mensagem[] = [];
    for (const id of fronteira) {
      const v = porId.get(id)!;
      const { tamanho, versao } = ouviu[id];
      const seta = jogada.setas[id] ?? v.seta;
      if (v.tipo === 'fofoqueira') {
        for (const para of amigosDe(fase, id)) saindo.push({ de: id, para, tamanho, versao });
      } else if (temSeta(v.tipo) && seta) {
        saindo.push({
          de: id,
          para: seta,
          tamanho: v.tipo === 'exagerado' ? (Math.min(3, tamanho + 1) as Tamanho) : tamanho,
          versao: v.tipo === 'docontra' ? inverter(versao) : versao,
        });
      }
      // túmulo e assunto não contam pra ninguém
    }
    const chegou = new Map<string, Mensagem>();
    for (const m of saindo) {
      if (ouviu[m.para]) continue; // cada um ouve uma vez só
      if ((porId.get(m.para)!.chega ?? 0) > batida) continue; // ninguém em casa: o recado se perde
      const atual = chegou.get(m.para);
      chegou.set(m.para, atual ? melhor(atual, m) : m);
    }
    if (saindo.length) batidas.push(saindo);
    for (const m of chegou.values()) ouviu[m.para] = { tamanho: m.tamanho, versao: m.versao, batida, de: m.de };
    fronteira = [...chegou.keys()];
  }

  return { batidas, ouviu, ...avaliar(fase, ouviu) };
}

function avaliar(fase: Fase, ouviu: Record<string, Ouvido>): Pick<Resultado, 'vitoria' | 'motivo' | 'culpado' | 'antes'> {
  for (const v of fase.vizinhos) {
    if (v.tipo === 'assunto' && ouviu[v.id]) return { vitoria: false, motivo: 'assunto_ouviu', culpado: v.id };
  }
  for (const v of fase.vizinhos) {
    if (!v.interesse) continue;
    const o = ouviu[v.id];
    if (!o) return { vitoria: false, motivo: 'interessado_nao_ouviu', culpado: v.id };
    if (v.interesse.minTamanho && o.tamanho < v.interesse.minTamanho)
      return { vitoria: false, motivo: 'tamanho_errado', culpado: v.id };
    if (v.interesse.tamanho && o.tamanho !== v.interesse.tamanho)
      return { vitoria: false, motivo: 'tamanho_errado', culpado: v.id };
    if (v.interesse.versao && o.versao !== v.interesse.versao)
      return { vitoria: false, motivo: 'versao_errada', culpado: v.id };
  }
  // Ordem: cada número precisa ouvir numa batida depois do anterior. Culpado = quem soube cedo demais
  // (ou junto); `antes` = quem tinha a vez.
  const fila = fase.vizinhos.filter((v) => v.interesse?.ordem).sort((a, b) => a.interesse!.ordem! - b.interesse!.ordem!);
  for (let i = 1; i < fila.length; i++)
    if (ouviu[fila[i].id].batida <= ouviu[fila[i - 1].id].batida)
      return { vitoria: false, motivo: 'ordem_errada', culpado: fila[i].id, antes: fila[i - 1].id };
  return { vitoria: true };
}

// Quem contou pra `id` na batida em que ele ouviu. Normalmente um só (o `de`); se outros entregaram o mesmo
// tamanho e versão na mesma batida, todos entram — nenhum deles sozinho "causou" (retirar um não evitaria).
export function quemContou(r: Resultado, id: string): string[] {
  const o = r.ouviu[id];
  if (!o || o.de === null) return [];
  const juntos = (r.batidas[o.batida - 1] ?? []).filter((m) => m.para === id && m.tamanho === o.tamanho && m.versao === o.versao).map((m) => m.de);
  return [...new Set([o.de, ...juntos])];
}

// Todas as jogadas vencedoras mínimas (nenhum giro sobrando) dentro do limite de giros.
export function resolver(fase: Fase): Jogada[] {
  const giraveis = fase.vizinhos.filter((v) => podeGirar(fase, v));
  const configs: Record<string, string>[] = [];
  const montar = (i: number, setas: Record<string, string>, usados: number) => {
    if (i === giraveis.length) return void configs.push(setas);
    const v = giraveis[i];
    montar(i + 1, setas, usados);
    if (usados < fase.giros)
      for (const alvo of amigosDe(fase, v.id))
        if (alvo !== v.seta) montar(i + 1, { ...setas, [v.id]: alvo }, usados + 1);
  };
  montar(0, {}, 0);

  const vence = (j: Jogada) => espalhar(fase, j).vitoria;
  const solucoes: Jogada[] = [];
  for (const origem of fase.vizinhos.filter((v) => podeSerOrigem(fase, v)).map((v) => v.id))
    for (const setas of configs) {
      const j = { origem, setas };
      if (!vence(j)) continue;
      const minima = Object.keys(setas).every((id) => {
        const { [id]: _, ...sem } = setas;
        return !vence({ origem, setas: sem });
      });
      if (minima) solucoes.push(j);
    }
  return solucoes;
}
