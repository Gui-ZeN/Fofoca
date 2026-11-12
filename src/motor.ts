// Motor da Fofoca: regras puras e determinísticas. O mesmo código serve o jogo,
// os testes e (depois) o gerador de fases.

// apressado (Nando, 2026-11-12): não aceita seta; conta sozinho pra quem mora do lado OPOSTO de quem contou pra ele
export type Tipo = 'comum' | 'fofoqueira' | 'exagerado' | 'docontra' | 'tumulo' | 'assunto' | 'apressado';
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
  // Arnaldo, o fiscal do barulho (Consulta 6): quem está colado nele (por passagem) conta um tamanho menor.
  // Vale pro tamanho ENVIADO (Exagerado aumenta antes, ele reduz depois); cochicho continua cochicho.
  abafa?: boolean;
  // Raquel, a desconfiada (2026-11-12): só ACREDITA quando ouviu de duas pessoas diferentes (somando batidas).
  // Na 1ª ela fica em dúvida: não repassa e, se tiver estrela, ainda não conta como "ficou sabendo". Duas chegando
  // na mesma batida já convencem. ⚠️ Ela acredita no MAIOR dos recados que ouviu (empate: no primeiro) — antes era
  // "o maior" na mesma batida e "o segundo" em batidas diferentes, um desempate que ninguém via (Consulta 7).
  desconfia?: boolean;
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
  // desconfiados: a 1ª fonte, que não bastou. Fica mesmo se ela acreditar depois (a tela mostra a dúvida entre
  // uma e outra); "não acreditou até o fim" = está aqui e NÃO está em `ouviu`.
  duvida?: Record<string, Ouvido>;
}

export const amigosDe = (fase: Fase, id: string): string[] =>
  fase.amizades.flatMap(([a, b]) => (a === id ? [b] : b === id ? [a] : []));

// Quem está colado em alguém que abafa (Arnaldo): conta um tamanho menor.
export const abafados = (fase: Fase): Set<string> =>
  new Set(fase.vizinhos.filter((w) => w.abafa).flatMap((w) => amigosDe(fase, w.id)));

const temSeta = (t: Tipo) => t === 'comum' || t === 'exagerado' || t === 'docontra';

// Trilho: quem aceita seta desenhada (a Fofoqueira conta sozinha; Padre e Seu Zé não contam).
export const controlavel = (v: Vizinho) => temSeta(v.tipo);

// Pra quem cada um pode contar no trilho: vizinhos de passagem e, se tiver celular, os destinos dele.
// Apressado: pra quem ele passa reto, vindo de `de` — o vizinho do outro lado, se houver passagem até ele.
// ⚠️ Só vale vindo de vizinho de porta/escada (de celular não há "lado": ele guarda). A ideia veio do Sporos
// (estudo do Fable, 2026-11-12): a única regra em que o LADO por onde o boato entra decide pra onde ele sai.
export function reto(fase: Fase, v: Vizinho, de: string): string | undefined {
  const d = fase.vizinhos.find((w) => w.id === de);
  if (!d || !amigosDe(fase, v.id).includes(de)) return;
  const [dx, dy] = [v.pos[0] - d.pos[0], v.pos[1] - d.pos[1]];
  if (Math.abs(dx) + Math.abs(dy) !== 1) return;
  const outro = fase.vizinhos.find((w) => w.pos[0] === v.pos[0] + dx && w.pos[1] === v.pos[1] + dy);
  return outro && amigosDe(fase, v.id).includes(outro.id) ? outro.id : undefined;
}

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
  const duvida: Record<string, Ouvido> = {};
  const atrapalhados = new Set<string>();
  const batidas: Mensagem[][] = [];
  let fronteira = [jogada.origem];
  const baixo = abafados(fase);
  // ⚠️ ordem fixa: o Exagerado aumenta primeiro e o Arnaldo reduz depois. Com o teto em escândalo, +1 e −1
  // nem sempre se anulam (escândalo → escândalo → fofoca).
  const enviado = (id: string, t: Tamanho) => (baixo.has(id) ? (Math.max(1, t - 1) as Tamanho) : t);

  for (let batida = 1; fronteira.length > 0; batida++) {
    const saindo: Mensagem[] = [];
    for (const id of fronteira) {
      const v = porId.get(id)!;
      const { tamanho, versao } = ouviu[id];
      const seta = jogada.setas[id] ?? v.seta;
      if (v.tipo === 'fofoqueira') {
        for (const para of amigosDe(fase, id)) saindo.push({ de: id, para, tamanho: enviado(id, tamanho), versao });
      } else if (v.tipo === 'apressado') {
        const para = ouviu[id].de && !atrapalhados.has(id) ? reto(fase, v, ouviu[id].de!) : undefined;
        if (para) saindo.push({ de: id, para, tamanho: enviado(id, tamanho), versao });
      } else if (temSeta(v.tipo) && seta) {
        saindo.push({
          de: id,
          para: seta,
          tamanho: enviado(id, v.tipo === 'exagerado' ? (Math.min(3, tamanho + 1) as Tamanho) : tamanho),
          versao: v.tipo === 'docontra' ? inverter(versao) : versao,
        });
      }
      // túmulo e assunto não contam pra ninguém
    }
    const chegou = new Map<string, Mensagem>();
    const fontes = new Map<string, Set<string>>(); // desconfiados: de quem ouviram nesta batida
    const pressa = new Map<string, Set<string>>(); // apressados: de quem ouviram nesta batida
    for (const m of saindo) {
      if (ouviu[m.para]) continue; // cada um ouve uma vez só
      const quem = porId.get(m.para)!;
      if ((quem.chega ?? 0) > batida) continue; // ninguém em casa: o recado se perde
      if (quem.desconfia) fontes.set(m.para, (fontes.get(m.para) ?? new Set()).add(m.de));
      if (quem.tipo === 'apressado') pressa.set(m.para, (pressa.get(m.para) ?? new Set()).add(m.de));
      const atual = chegou.get(m.para);
      chegou.set(m.para, atual ? melhor(atual, m) : m);
    }
    // desconfiado com uma fonte só (contando a de antes): fica em dúvida e não entra na fronteira
    for (const [id, de] of fontes) {
      const m = chegou.get(id)!;
      if ((duvida[id] ? 1 : 0) + de.size >= 2) { // acreditou: no maior dos recados (o de antes entra na conta)
        const antes = duvida[id];
        if (antes) chegou.set(id, melhor({ de: antes.de!, para: id, tamanho: antes.tamanho, versao: antes.versao }, m));
        continue;
      }
      chegou.delete(id);
      duvida[id] = { tamanho: m.tamanho, versao: m.versao, batida, de: m.de };
    }
    // ⚠️ Nando com dois recados na mesma batida: não tem "um lado" de onde veio — ele se atrapalha e GUARDA.
    // Antes saía pro lado de quem ganhava o desempate interno (tamanho, versão, ordem da lista): invisível (Consulta 7).
    for (const [id, de] of pressa) if (de.size >= 2 && chegou.has(id)) atrapalhados.add(id);
    if (saindo.length) batidas.push(saindo);
    for (const m of chegou.values()) ouviu[m.para] = { tamanho: m.tamanho, versao: m.versao, batida, de: m.de };
    fronteira = [...chegou.keys()];
  }

  return { batidas, ouviu, ...(Object.keys(duvida).length ? { duvida } : {}), ...avaliar(fase, ouviu) };
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
