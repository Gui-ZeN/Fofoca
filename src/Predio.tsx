import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { abafados, amigosDe, colados, espalhar, girosUsados, podeGirar, podeSerOrigem, porCelular, quemContou, type Fase, type Resultado, type Tamanho, type Vizinho } from './motor';
import { Personagem, type Expressao } from './Personagem';
import { Boato, Estrela, Girar, Telefone } from './Icones';
import { Vazio } from './Vazio';
import { explicar, type Explicacao } from './explicar';
import { ARTE, CENARIO, urlArte } from './arte';

// Prédio em corte: cada célula da grade é um apartamento visto por dentro.
// Paredes e lajes em tinta; porta = a parede some (batente e folha aberta); escada = um lance que sobe
// do chão de baixo e atravessa a laje. Os papéis se leem pela forma: origem = selo de balão,
// vítima = octógono, estrela; selecionado = cantoneiras; pra quem pode contar = tracejado.
const L = 120; // largura de um apartamento
// ⚠️ Apartamento BAIXO é o padrão desde 2026-11-12 (Consulta 8, a "terceira saída" do Astra; aprovado pelo dono): num
// celular de verdade, com a barra do navegador (390×720), o prédio de 5 andares rolava. O cômodo perdeu altura
// (136 → 112) e o morador encolheu junto (×0,8); largura, plaquinha e texto ficaram do mesmo tamanho. Medido: o chefão
// 3×5 passou a caber (personagem 96 → 77 px na tela). `?alto` mostra o formato antigo, pra comparar.
// ⚠️ SEM NOMES é o padrão desde 2026-11-12 (ideia do dono, aprovada depois de comparar): na tela ficam só os símbolos
// de papel e de regra; o nome aparece em quem está selecionado e, no fim, em todo mundo (o texto do desfecho cita
// nomes). Nome só em quem tem regra viraria dica ("quem tem plaquinha é o caminho"), por isso é ninguém. `?nomes`
// mostra os nomes o tempo todo, como era.
export const SEM_NOMES = typeof location !== 'undefined' && !new URLSearchParams(location.search).has('nomes');
export const ALTO = typeof location !== 'undefined' && new URLSearchParams(location.search).has('alto');
export const A = ALTO ? 136 : 112;
const D = A - 136; // o que fica no meio do cômodo (cabeça, porta) sobe junto com o chão
// ⚠️ o balão sobe MENOS que o chão: subindo tudo, caía em cima do nome
const DB = D / 2; // altura (mais alto que largo: o corpo dos moradores novos tem ~2,5 cabeças)
const ESCALA = ALTO ? 1.08 : 0.86; // cabeça ≈ 37 no desenho
const RAIO = 28; // de onde a ligação de celular sai, a partir da cabeça

// ⚠️ O tamanho do meio não pode se chamar "boato": é o nome da coisa toda, e o Sol (jogando por texto)
// concluiu que o boato já começava no tamanho 2 e errou as fases do Exagerado. Começa sempre em cochicho.
export const TAMANHO: Record<Tamanho, string> = { 1: 'um cochicho', 2: 'uma fofoca', 3: 'um escândalo' };
export const NOME_TAMANHO: Record<Tamanho, string> = { 1: 'cochicho', 2: 'fofoca', 3: 'escândalo' };

// Quem a explicação da derrota cita (além do culpado, que o cômodo vermelho já mostra): ganha uma moldura.
// ⚠️ Até 2026-11-12 cada um ganhava uma PLAQUINHA com texto em cima do personagem ("veio na 3 · volta na 4", "ouviu de
// 1 só"…). O dono pediu pra tirar: tapava o personagem, o texto curto virava enigma e era poluição visual. A
// explicação por extenso fica só no quadro do desfecho, embaixo do título.
function citados(e: Explicacao): string[] {
  if (e.tipo === 'ordem') return [e.antes, e.depois];
  if (e.tipo === 'vitima') return [];
  return [e.id];
}

// Altura da cabeça (de onde sai a ligação, pra onde o olhar aponta); o corpo pisa em y0 + A - 8.
const cabeca = (v: Vizinho) => ({ x: v.pos[0] * L + L / 2, y: v.pos[1] * A + 74 + D });
const pes = (v: Vizinho) => ({ x: v.pos[0] * L + L / 2 + 2, y: v.pos[1] * A + A - 8 });

// Onde fica a passagem entre dois vizinhos: porta (lado a lado), escada (empilhados, no canto direito) ou telefone.
function passagem(a: Vizinho, b: Vizinho) {
  const [ca, ra] = a.pos, [cb, rb] = b.pos;
  if (ra === rb && Math.abs(ca - cb) === 1) return { tipo: 'parede' as const, x: Math.max(ca, cb) * L, y: ra * A + 98 + D };
  if (ca === cb && Math.abs(ra - rb) === 1) return { tipo: 'escada' as const, x: ca * L + L - 14, y: Math.max(ra, rb) * A };
  const pa = cabeca(a), pb = cabeca(b);
  return { tipo: 'telefone' as const, x: (pa.x + pb.x) / 2, y: (pa.y + pb.y) / 2 };
}

// Caminho de uma seta de quem conta até quem ouve: na altura do peito pela porta; pela escada, no canto.
function trajeto(de: Vizinho, para: Vizinho): [number, number, number, number] {
  const q = passagem(de, para), p = cabeca(de);
  if (q.tipo === 'parede') {
    const dir = Math.sign(q.x - p.x);
    return [p.x + dir * 26, q.y, q.x + dir * 22, q.y];
  }
  if (q.tipo === 'escada') {
    const desce = para.pos[1] > de.pos[1];
    return desce ? [q.x, de.pos[1] * A + 96 + D, q.x, q.y + 42] : [q.x, de.pos[1] * A + 52 + D, q.x, q.y - 30];
  }
  const r = cabeca(para), d = Math.hypot(r.x - p.x, r.y - p.y) || 1, ux = (r.x - p.x) / d, uy = (r.y - p.y) / d;
  return [p.x + ux * RAIO, p.y + uy * RAIO, r.x - ux * 34, r.y - uy * 34];
}
const ponta = (x1: number, y1: number, x2: number, y2: number) =>
  `translate(${x2} ${y2}) rotate(${(Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI})`;

// selos de papel (os mesmos do cabeçalho)
export function SeloOrigem() {
  return (
    <g>
      <path d="M-5,6.9 L-9,12 L0.5,8 A10,8 0 1 0 -5,6.9 Z" fill="#E5B74F" stroke="#283C36" strokeWidth={1.8} strokeLinejoin="round" />
      <circle cx={-4} cy={0} r={1.4} fill="#283C36" /><circle cx={0} cy={0} r={1.4} fill="#283C36" /><circle cx={4} cy={0} r={1.4} fill="#283C36" />
    </g>
  );
}
const OCT = Array.from({ length: 8 }, (_, k) => {
  const a = (Math.PI / 4) * k + Math.PI / 8;
  return `${(10 * Math.cos(a)).toFixed(2)},${(10 * Math.sin(a)).toFixed(2)}`;
}).join(' ');
// Fofoqueira: um megafone (conta pra todo mundo em volta, sem seta). ⚠️ Antes ela não tinha marca nenhuma na
// plaquinha — o jogador só sabia quem era pelo nome da fase (Fable, 2026-11-11).
export function SeloFofoqueira() {
  return (
    <g strokeLinejoin="round" strokeLinecap="round">
      <path d="M-10,-3 H-5 L3,-8 V8 L-5,3 H-10 Z" fill="#E08A5E" stroke="#283C36" strokeWidth={1.6} />
      <path d="M-8,3 L-6.5,8" stroke="#283C36" strokeWidth={1.8} />
      <path d="M5.5,-3 Q7.5,0 5.5,3 M8,-6 Q11.5,0 8,6" fill="none" stroke="#283C36" strokeWidth={1.5} />
    </g>
  );
}

export function SeloVitima() {
  return (
    <g>
      <polygon points={OCT} fill="#A53D3D" stroke="#283C36" strokeWidth={1.6} strokeLinejoin="round" />
      <rect x={-1.6} y={-6} width={3.2} height={7.5} rx={1.4} fill="#FBF4E5" />
      <circle cx={0} cy={4.4} r={1.7} fill="#FBF4E5" />
    </g>
  );
}

// Largura de um texto do SVG, medida de verdade (e de novo quando a fonte chega).
// ⚠️ Antes era `nome.length * 7.6`: chute por caractere quebra com fonte nova e com tradução.
function useLargura(texto: string, chute: number) {
  const ref = useRef<SVGTextElement>(null);
  const [w, setW] = useState(chute);
  useLayoutEffect(() => {
    let vivo = true;
    const medir = () => { if (vivo && ref.current) setW(ref.current.getComputedTextLength()); };
    medir();
    document.fonts?.ready.then(medir);
    return () => { vivo = false; };
  }, [texto]);
  return [ref, w] as const;
}

// Plaquinha com o nome (e o que a pessoa exige para acreditar), no canto de cima.
// No trilho o tamanho é exato e aparece com "=" ("quer exatamente um boato"); na mecânica antiga é mínimo.
function Etiqueta({ v, x0, y0, contou, menos, perto, comNome = true }: { v: Vizinho; x0: number; y0: number; contou?: boolean; menos?: boolean; perto?: string; comNome?: boolean }) {
  const exato = v.interesse?.tamanho;
  const versao = v.interesse?.versao; // quer a versão certa ou a ao contrário: o balão mostra qual
  const req = exato ?? v.interesse?.minTamanho ?? (versao ? 1 : undefined);
  const contra = v.tipo === 'docontra'; // selo ⇄: conta ao contrário
  const mais = v.tipo === 'exagerado'; // selo "+1" fixo: a cor do apartamento some quando ele ouve
  const vez = v.interesse?.ordem; // bloco Ordem: o número da vez colado na estrela
  const vitima = v.tipo === 'assunto';
  const fofoqueira = v.tipo === 'fofoqueira';
  const selo = contou || vitima || v.interesse || fofoqueira ? 21 : 0;
  const [ref, larguraDoNome] = useLargura(v.nome, v.nome.length * 7.4);
  const nome = comNome ? larguraDoNome : -6; // sem nome, a plaquinha fica só com os símbolos
  const tx = x0 + 14 + selo + (vez ? 9 : 0);
  const fimNome = tx + nome + 6;
  const duas = v.desconfia; // selo "2×": a Raquel só acredita ouvindo de duas pessoas
  // selo ⚡ (pressa): o Nando passa reto, sozinho. ⚠️ Era "»", e quem jogou leu "sempre pra direita" — a regra é
  // "pro lado oposto de onde veio"; o caminho de verdade aparece na seta tracejada que sai dele (abaixo)
  const passa = v.tipo === 'apressado';
  // fiscais: a regra dele(a) em duas palavras, na própria plaquinha (Vera "ouve", Dona Norma "até 2", Dr. Álvaro "máx 4")
  const fiscal = v.vigia ? 'ouve' : v.recolhe ? `até ${v.recolhe}` : v.teto ? `máx ${v.teto}` : undefined;
  // ⚠️ o selo do fiscal fica numa etiqueta própria, EMBAIXO do nome: do lado, "Dona Norma" + "até 3" passava do cômodo
  // e a plaquinha inteira encolhia até não dar pra ler — justo onde está a regra do vilão (achado jogando, 2026-11-12)
  const fim = fimNome + (duas ? 26 : 0) + (passa ? 26 : 0);
  const xPerto = fim + (mais ? 26 : 0) + (menos ? 26 : 0);
  // "−1": mora colado no Arnaldo e fala um tamanho menor (o efeito no tabuleiro, não só no personagem)
  const xMenos = fim + (mais ? 26 : 0);
  const w = fim - (x0 + 8) + (mais ? 26 : 0) + (menos ? 26 : 0) + (perto ? 34 : 0) + (contra ? 22 : 0) + (exato ? 11 : 0) + (req ? 27 : 0);
  if (!comNome && w < 10 && !fiscal) return null; // morador comum sem papel nem regra: nada
  return (
    // ⚠️ plaquinha mais larga que o cômodo (estrela + nome comprido + "=" + tamanho, ou +1/−1/⇄) invadia o vizinho:
    // encolhe inteira, a partir da ponta esquerda, até caber (L − 10)
    <g className={contou ? 'etiqueta contou' : vitima ? 'etiqueta vitima' : 'etiqueta'}
      transform={w > L - 10 ? `translate(${x0 + 8} ${y0 + 19}) scale(${(L - 10) / w}) translate(${-(x0 + 8)} ${-(y0 + 19)})` : undefined}
      aria-label={contou ? `${v.nome}: você contou` : vitima ? `${v.nome}: o boato é sobre essa pessoa` : undefined}>
      <rect x={x0 + 8} y={y0 + 8} width={w} height={22} rx={3} />
      {contou && <g transform={`translate(${x0 + 21} ${y0 + 18}) scale(0.82)`}><SeloOrigem /></g>}
      {!contou && vitima && <g transform={`translate(${x0 + 20} ${y0 + 19}) scale(0.82)`}><SeloVitima /></g>}
      {!contou && !vitima && v.interesse && <g transform={`translate(${x0 + 20} ${y0 + 19.5})`}><Estrela r={8.5} /></g>}
      {!contou && !vitima && !v.interesse && fofoqueira && <g transform={`translate(${x0 + 20} ${y0 + 19})`} aria-label="fofoqueira: conta pra todo mundo em volta"><SeloFofoqueira /></g>}
      {vez && <text x={x0 + 32} y={y0 + 24} className="vez">{vez}</text>}
      {comNome && <text ref={ref} x={tx} y={y0 + 24}>{v.nome}</text>}
      {duas && (
        <g className="duas" aria-label="só acredita ouvindo de duas pessoas">
          <rect x={fimNome} y={y0 + 12} width={22} height={14} rx={3} />
          <text x={fimNome + 11} y={y0 + 23}>2×</text>
        </g>
      )}
      {fiscal && (
        <g className="fiscal" aria-label={v.vigia ? 'escuta quando um vizinho dela conta algo' : v.recolhe ? `depois da batida ${v.recolhe}, quem mora colado nela não conta mais nada` : `no máximo ${v.teto} pessoas podem ficar sabendo`}>
          <rect x={x0 + 8} y={y0 + 31} width={46} height={16} rx={3} />
          <text x={x0 + 31} y={y0 + 43}>{fiscal}</text>
        </g>
      )}
      {perto && (
        // mora colado (por porta ou escada) na Vera ("psiu": não pode contar) ou na Dona Norma ("até N")
        <g className="perto" aria-label={perto === 'psiu' ? 'mora colado na Vera: se contar, ela escuta' : `mora colado na Dona Norma: só conta ${perto}`}>
          <rect x={xPerto} y={y0 + 12} width={30} height={14} rx={3} />
          <text x={xPerto + 15} y={y0 + 23}>{perto}</text>
        </g>
      )}
      {passa && (
        <g className="passa" aria-label="passa reto: conta sozinho pra quem está do outro lado">
          <rect x={fimNome} y={y0 + 12} width={22} height={14} rx={3} />
          <path d={`M${fimNome + 12.5},${y0 + 13.5} L${fimNome + 7.5},${y0 + 20} H${fimNome + 11} L${fimNome + 9.5},${y0 + 24.5} L${fimNome + 14.5},${y0 + 18} H${fimNome + 11} Z`} />
        </g>
      )}
      {mais && (
        <g className="exagera" aria-label="aumenta o boato um tamanho">
          <rect x={fim} y={y0 + 12} width={22} height={14} rx={3} />
          <text x={fim + 11} y={y0 + 23}>+1</text>
        </g>
      )}
      {menos && (
        <g className="abafa" aria-label="fala um tamanho menor (mora colado no Arnaldo)">
          <rect x={xMenos} y={y0 + 12} width={22} height={14} rx={3} />
          <text x={xMenos + 11} y={y0 + 23}>−1</text>
        </g>
      )}
      {exato && <text x={fim + (mais ? 26 : 0) + (menos ? 26 : 0) + 4} y={y0 + 24} className="igual">=</text>}
      {contra && (
        <g transform={`translate(${fim + (mais ? 26 : 0) + (menos ? 26 : 0) + 10} ${y0 + 19})`} aria-label="conta a versão ao contrário">
          <circle r={7} fill="#E5B74F" stroke="#283C36" strokeWidth={1.4} />
          <path d="M-3.5,-1.8 h6 l-2,-2 M3.5,1.8 h-6 l2,2" fill="none" stroke="#283C36" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" />
        </g>
      )}
      {/* tamanho que a pessoa quer: ⚠️ era 0,62 e quase não se lia no celular (Fable) */}
      {req && <g transform={`translate(${x0 + 8 + w - 15} ${y0 + 19}) scale(0.82)`}><Boato tamanho={req as Tamanho} invertida={versao === 'invertida'} /></g>}
    </g>
  );
}

// Placa pendurada de quem foi na padaria: um pão e quantas batidas faltam para voltar.
export function Padaria({ x, y, faltam, batendo }: { x: number; y: number; faltam: number; batendo: boolean }) {
  return (
    <g className="padaria" aria-label={`Volta em ${faltam} batida${faltam > 1 ? 's' : ''}`}>
      <path d={`M${x - 12},${y - 20} L${x},${y - 30} L${x + 12},${y - 20}`} fill="none" stroke="#283C36" strokeWidth={1.8} />
      <rect x={x - 26} y={y - 20} width={52} height={40} rx={4} className="placa" />
      {/* pão francês */}
      <ellipse cx={x - 9} cy={y} rx={11} ry={6.5} fill="#D9A04E" stroke="#283C36" strokeWidth={1.8} transform={`rotate(-18 ${x - 9} ${y})`} />
      <path d={`M${x - 15},${y + 1} l3,-4 M${x - 10},${y + 2} l3,-5 M${x - 5},${y} l3,-4`} stroke="#8A5A22" strokeWidth={1.6} strokeLinecap="round" />
      <text x={x + 13} y={y + 1} className="faltam">{faltam}</text>
      {batendo && <text x={x + 30} y={y - 34} className="toc">toc toc</text>}
    </g>
  );
}

// Reserva (arte sem as peças ilustradas): um móvel de fundo por apartamento (parede e chão), no traço da ilustração e apagado,
// pra casa parecer de alguém sem disputar com o morador. Parede: à direita do meio (a plaquinha fica à
// esquerda); chão: canto de baixo à esquerda (a escada sobe pela direita).
function Movel({ x0, y0, n }: { x0: number; y0: number; n: number }) {
  const t = { stroke: '#2B1E16', strokeWidth: 1.6, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const };
  const px = x0 + 64, py = y0 + 36, chao = y0 + A - 12, fx = x0 + 18;
  const parede = [
    <g key="q">{/* quadro com paisagem */}
      <rect x={px} y={py} width={26} height={20} fill="#B98552" {...t} />
      <rect x={px + 3} y={py + 3} width={20} height={14} fill="#CFE0D8" {...t} strokeWidth={1} />
      <path d={`M${px + 3},${py + 14} l6,-6 l5,4 l3,-3 l6,6 Z`} fill="#8DAA6E" />
    </g>,
    <g key="r">{/* relógio */}
      <circle cx={px + 12} cy={py + 10} r={10} fill="#FFF6E6" {...t} />
      <path d={`M${px + 12},${py + 10} v-6 M${px + 12},${py + 10} h5`} {...t} fill="none" />
    </g>,
    <g key="p">{/* prateleira com vasinhos */}
      <rect x={px - 2} y={py + 16} width={30} height={4} fill="#B98552" {...t} />
      <rect x={px + 2} y={py + 6} width={8} height={10} rx={1.5} fill="#C9694A" {...t} />
      <path d={`M${px + 6},${py + 6} q-4,-6 -1,-9 M${px + 6},${py + 6} q3,-7 6,-6`} stroke="#5E7D4A" strokeWidth={2} fill="none" />
      <rect x={px + 15} y={py + 9} width={9} height={7} rx={1} fill="#E9C46A" {...t} />
    </g>,
    <g key="j">{/* janelinha com cortina */}
      <rect x={px} y={py - 2} width={24} height={24} fill="#CFE0D8" {...t} />
      <path d={`M${px},${py - 2} q6,12 0,24 Z M${px + 24},${py - 2} q-6,12 0,24 Z`} fill="#D98C7A" {...t} strokeWidth={1.2} />
    </g>,
  ];
  const chaoMoveis = [
    <g key="v">{/* vaso com planta */}
      <path d={`M${fx - 7},${chao} l-2,-12 h18 l-2,12 Z`} fill="#C9694A" {...t} />
      <path d={`M${fx},${chao - 12} q-8,-14 -12,-12 M${fx},${chao - 12} q2,-18 7,-18 M${fx},${chao - 12} q9,-10 12,-8`} stroke="#5E7D4A" strokeWidth={2.4} fill="none" strokeLinecap="round" />
    </g>,
    <g key="a">{/* abajur de pé */}
      <path d={`M${fx},${chao} v-46 M${fx - 7},${chao} h14`} {...t} fill="none" strokeWidth={2} />
      <path d={`M${fx - 9},${chao - 46} l4,-12 h10 l4,12 Z`} fill="#F2C879" {...t} />
    </g>,
    <g key="b">{/* banquinho */}
      <rect x={fx - 10} y={chao - 18} width={20} height={5} rx={2} fill="#B98552" {...t} />
      <path d={`M${fx - 7},${chao - 13} l-2,13 M${fx + 7},${chao - 13} l2,13`} {...t} fill="none" strokeWidth={2} />
    </g>,
  ];
  return (
    <g className="movel" aria-hidden="true">
      {parede[n % parede.length]}
      {n % 4 !== 3 && chaoMoveis[n % chaoMoveis.length]}
    </g>
  );
}

// "QUÊ?!" em letras soltas que furam a laje
function Que({ x, y }: { x: number; y: number }) {
  const letras: [string, number, number, number][] = [['Q', 0, 4, -14], ['U', 20, -6, -5], ['Ê', 39, -10, 5], ['?', 59, -6, 13], ['!', 74, 2, 20]];
  return (
    <g className="grito" aria-hidden="true">
      <path d={`M${x - 10},${y - 12} l-7,-6 M${x - 8},${y + 2} l-9,1 M${x + 92},${y - 8} l8,-6 M${x + 92},${y + 6} l9,0`} className="impacto" />
      {letras.map(([l, dx, dy, r]) => (
        <text key={l} x={x + dx} y={y + dy} transform={`rotate(${r} ${x + dx + 8} ${y + dy - 10})`}>{l}</text>
      ))}
    </g>
  );
}

// Trilho: apertar, tocar e arrastar de um apartamento até outro pra desenhar quem conta pra quem.
export interface Desenho {
  selecionado?: string;
  alvos: string[]; // pra quem o selecionado pode contar (vizinhos e destinos do celular)
  aoApertar: (v: Vizinho) => void;
  aoTocar: (v: Vizinho) => void;
  aoSoltar: (de: string, para: string) => void;
  aoApagar: (de: string) => void; // um toque na seta tira ela (no celular, dois toques pra desfazer era demais)
}

export function Predio(props: {
  fase: Fase; origem?: string; setas: Record<string, string>; resultado?: Resultado; batida: number; montando: boolean;
  aoTocar: (v: Vizinho) => void; aoGirar: (v: Vizinho) => void; trilho?: Desenho;
  ritmo?: number; // ms por batida (o balão que viaja acompanha o ×2)
}) {
  const { fase, origem, setas, resultado, batida, montando, trilho, ritmo = 850 } = props;

  // Arrasto: no toque, o navegador entrega o soltar pro elemento onde o dedo começou,
  // então o destino é achado pelo ponto onde o dedo saiu.
  const [arrasto, setArrasto] = useState<{ de: string; x: number; y: number }>();
  // ⚠️ a linha que segue o dedo e o destino que acende debaixo dele são mexidos DIRETO no desenho, sem estado: com
  // estado, cada movimento redesenhava o prédio inteiro. Antes não havia nada disso — o dedo arrastava no vazio e a seta
  // só aparecia ao soltar, o que o dono sentiu como "meio travado" no celular (2026-11-13).
  const raiz = useRef<SVGGElement>(null), guia = useRef<SVGLineElement>(null), mira = useRef<Element | null>(null);
  useEffect(() => {
    if (!arrasto || !trilho) return;
    const limpar = () => { guia.current?.classList.remove('viva'); mira.current?.classList.remove('mira'); mira.current = null; };
    const mover = (e: PointerEvent) => {
      const m = raiz.current?.getScreenCTM(), g = guia.current, de = porId[arrasto.de];
      if (!m || !g || !de || Math.hypot(e.clientX - arrasto.x, e.clientY - arrasto.y) <= 14) return;
      const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
      g.setAttribute('x1', String(de.pos[0] * L + L / 2)); g.setAttribute('y1', String(de.pos[1] * A + A / 2));
      g.setAttribute('x2', String(p.x)); g.setAttribute('y2', String(p.y));
      g.classList.add('viva');
      const sob = document.elementFromPoint(e.clientX, e.clientY)?.closest('[data-morador]') ?? null;
      const novo = sob?.classList.contains('alvo') ? sob : null;
      if (novo !== mira.current) { mira.current?.classList.remove('mira'); novo?.classList.add('mira'); mira.current = novo; }
    };
    const soltar = (e: PointerEvent) => {
      limpar();
      const alvo = document.elementFromPoint(e.clientX, e.clientY)?.closest('[data-morador]')?.getAttribute('data-morador');
      const andou = Math.hypot(e.clientX - arrasto.x, e.clientY - arrasto.y) > 14;
      if (alvo && alvo !== arrasto.de && andou) trilho.aoSoltar(arrasto.de, alvo);
      else if (!andou || alvo === arrasto.de) trilho.aoTocar(porId[arrasto.de]);
      setArrasto(undefined);
    };
    // se o navegador tomar o gesto (pointercancel), o arrasto morre; senão o próximo toque desenhava uma seta fantasma
    const cancelar = () => { limpar(); setArrasto(undefined); };
    window.addEventListener('pointermove', mover);
    window.addEventListener('pointerup', soltar);
    window.addEventListener('pointercancel', cancelar);
    return () => { window.removeEventListener('pointermove', mover); window.removeEventListener('pointerup', soltar); window.removeEventListener('pointercancel', cancelar); };
  }); // re-registra a cada render pra enxergar o trilho atual
  const porId = Object.fromEntries(fase.vizinhos.map((v) => [v.id, v]));
  const baixo = abafados(fase);
  // vizinhos de passagem da Vera e da Dona Norma: marcados na plaquinha, como o −1 do Arnaldo
  const daVera = colados(fase, 'vigia');
  const daNorma = new Map(fase.vizinhos.filter((w) => w.recolhe).flatMap((w) => amigosDe(fase, w.id).map((id) => [id, `até ${w.recolhe}`] as [string, string])));
  const colunas = Math.max(...fase.vizinhos.map((v) => v.pos[0])) + 1;
  const andares = Math.max(...fase.vizinhos.map((v) => v.pos[1])) + 1;
  const largura = colunas * L, altura = andares * A;
  const naCelula = (c: number, r: number) => fase.vizinhos.find((v) => v.pos[0] === c && v.pos[1] === r);
  const ouviuAte = (id: string) => {
    const o = resultado?.ouviu[id];
    return o && o.batida < batida ? o : undefined;
  };
  const falando = resultado?.batidas[batida - 1] ?? [];
  // desconfiada que já ouviu de uma pessoa (e ainda não acreditou, até esta batida)
  const emDuvida = (id: string) => { const d = resultado?.duvida?.[id]; return !!d && d.batida < batida; };
  const ativa = (a: string, b: string) => falando.some((m) => (m.de === a && m.para === b) || (m.de === b && m.para === a));
  const fim = resultado !== undefined && batida > resultado.batidas.length;
  const explicacao = fim && resultado ? explicar(fase, resultado) : undefined;
  const semGiro = girosUsados(fase, setas) >= fase.giros;
  // Fora de casa enquanto não deu a batida da volta (no fim, todo mundo já voltou).
  const fora = (v: Vizinho) => !!v.chega && !fim && (montando || batida < v.chega);
  // a cor do cômodo (as duas metades da porta usam a mesma, pra parede sumir de verdade)
  const comodo = (c: number, r: number) => {
    const v = naCelula(c, r);
    return ['comodo', ARTE && v && `parede-${(c + r * 2) % 4}`, !v && 'vazio', v && ouviuAte(v.id) && 'ouviu', v && fim && resultado.culpado === v.id && 'culpado'].filter(Boolean).join(' ');
  };
  // arte ilustrada: o fundo ilustrado de cada cômodo; a luz de quem ouviu vem por cima
  const fundo = (c: number, r: number) => {
    const lista = naCelula(c, r) ? CENARIO!.quartos : CENARIO!.vazios;
    return lista[(c + r * 2) % lista.length];
  };
  const luz = (c: number, r: number) => {
    const v = naCelula(c, r);
    return ['luz', v && ouviuAte(v.id) && 'ouviu', v && fim && resultado.culpado === v.id && 'culpado'].filter(Boolean).join(' ');
  };
  // metade de porta e buraco de escada: a cor dominante do fundo, pra parede sumir sem emenda
  const corDe = (c: number, r: number) => (CENARIO ? { fill: fundo(c, r).cor } : undefined);

  // direção (unitária) da passagem de quem o morador conta; quem não conta olha pra frente
  const olharPara = (v: Vizinho): [number, number] => {
    const alvo = setas[v.id] ?? v.seta;
    if (!alvo) return [0, 0];
    const p = cabeca(v), q = passagem(v, porId[alvo]);
    const d = Math.hypot(q.x - p.x, q.y - p.y) || 1;
    return [(q.x - p.x) / d, (q.y - p.y) / d];
  };

  const expressao = (v: Vizinho): Expressao => {
    const o = ouviuAte(v.id);
    if (fim && resultado.culpado === v.id && v.tipo === 'assunto') return 'bravo';
    if (falando.some((m) => m.de === v.id)) return 'contando';
    if (o && o.batida === batida - 1) return 'chocado'; // acabou de ouvir e não tem pra quem contar
    if (!o && emDuvida(v.id)) return 'bravo'; // ouviu de um só: cara de "sei…" até a 2ª fonte
    if (fim && resultado.vitoria && v.interesse) return 'chocado';
    if (montando && origem === v.id) return 'ouvindo';
    return 'neutro';
  };

  return (
    <g className="predio" ref={raiz}>
      {/* caixa d'água e a estrutura (lajes e paredes em corte); o chão é da cena */}
      {CENARIO ? (
        // telhado ilustrado (telhas, caixa d'água, antena, varal), apoiado na laje de cima
        <image href={urlArte(CENARIO.telhado.f)} x={-16} width={largura + 32} y={-6 - ((largura + 32) * CENARIO.telhado.h) / CENARIO.telhado.w}
          height={((largura + 32) * CENARIO.telhado.h) / CENARIO.telhado.w} preserveAspectRatio="none" />
      ) : (
        <g className="caixa">
          <rect x={largura - 70} y={-38} width={50} height={22} />
          <rect x={largura - 74} y={-42} width={58} height={6} />
        </g>
      )}
      <rect x={-6} y={-12} width={largura + 12} height={altura + 16} className="estrutura" />
      {ARTE && (
        <defs>
          <linearGradient id="sombra-laje" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#3A2618" stopOpacity={0.22} /><stop offset="1" stopColor="#3A2618" stopOpacity={0} />
          </linearGradient>
        </defs>
      )}

      {/* apartamentos: acende a luz de quem já ouviu */}
      {Array.from({ length: andares }, (_, r) => Array.from({ length: colunas }, (_, c) => {
        const v = naCelula(c, r);
        if (CENARIO) {
          return (
            <g key={`${c},${r}`}>
              <image href={urlArte(fundo(c, r).f)} x={c * L + 4} y={r * A + 4} width={L - 8} height={A - 8} preserveAspectRatio="none" />
              <rect x={c * L + 4} y={r * A + 4} width={L - 8} height={A - 8} className={luz(c, r)} />
              <rect x={c * L + 4} y={r * A + 4} width={L - 8} height={18} fill="url(#sombra-laje)" />
            </g>
          );
        }
        if (ARTE) {
          return (
            <g key={`${c},${r}`}>
              <rect x={c * L + 4} y={r * A + 4} width={L - 8} height={A - 8} className={comodo(c, r)} />
              {v && <Movel x0={c * L} y0={r * A} n={c * 5 + r * 3} />}
              <rect x={c * L + 4} y={r * A + 4} width={L - 8} height={20} fill="url(#sombra-laje)" />
              <rect x={c * L + 4} y={r * A + A - 12} width={L - 8} height={8} className={v ? 'rodape' : 'rodape apagado'} />
              <path d={`M${c * L + 4},${r * A + A - 12} h${L - 8}`} className="rodape-linha" />
              {!v && <Vazio x0={c * L} y0={r * A} chao={r * A + A - 8} cena={c * 3 + r * 5 + fase.titulo.length} />}
            </g>
          );
        }
        return (
          <g key={`${c},${r}`}>
            <rect x={c * L + 4} y={r * A + 4} width={L - 8} height={A - 8} className={comodo(c, r)} />
            <rect x={c * L + 4} y={r * A + A - 10} width={L - 8} height={6} className={v ? 'rodape' : 'rodape apagado'} />
            {!v && <Vazio x0={c * L} y0={r * A} chao={r * A + A - 6} cena={c * 3 + r * 5 + fase.titulo.length} />}
          </g>
        );
      }))}

      {/* passagens */}
      {fase.amizades.map(([a, b]) => {
        const va = porId[a], vb = porId[b], p = passagem(va, vb);
        // passagem por onde alguém vai contar fica marcada: o caminho se lê mesmo quando o rastro é curto (escada)
        const usada = [a, b].some((de) => (setas[de] ?? porId[de].seta) === (de === a ? b : a));
        const cls = (ativa(a, b) ? ' ativa' : '') + (usada ? ' usada' : '');
        if (p.tipo === 'parede') {
          const r = va.pos[1], c = Math.min(va.pos[0], vb.pos[0]);
          const gy = r * A + 54 + D, gb = r * A + A - 4, wx = p.x;
          return (
            <g key={a + b} className={'passagem porta' + cls}>
              <rect x={wx - 5} y={gy} width={5} height={gb - gy} className={comodo(c, r)} style={corDe(c, r)} />
              <rect x={wx} y={gy} width={5} height={gb - gy} className={comodo(c + 1, r)} style={corDe(c + 1, r)} />
              <path d={`M${wx - 6},${gb} V${gy + 4} q0,-5 5,-5 h2 q5,0 5,5 V${gb}`} className="batente" />
              <path d={`M${wx - 7.5},${gb} V${gy + 4} q0,-6.5 6.5,-6.5 h2 q6.5,0 6.5,6.5 V${gb}`} className="contorno" />
              <polygon points={`${wx + 6},${gy + 3} ${wx + 14},${gy + 8} ${wx + 14},${gb - 3} ${wx + 6},${gb}`} className="folha" />
              <circle cx={wx + 11.5} cy={(gy + gb) / 2 + 6} r={1.4} className="macaneta" />
            </g>
          );
        }
        if (p.tipo === 'escada') {
          // um lance de verdade, do chão de baixo até o buraco na laje; fica no fundo, atrás do morador
          const baixo = Math.max(va.pos[1], vb.pos[1]), c = va.pos[0];
          const dir = c * L + L - 4, chao = baixo * A + A - 4, topo = baixo * A - 4;
          const n = 11, degrau = (chao - topo) / n, passo = 6, x0 = dir - n * passo;
          // ⚠️ só o lance: os degraus por cima e a viga inclinada por baixo. Cheio até o chão (como era), cada escada
          // virava um bloco de madeira que tomava um terço do cômodo — poluição que o dono apontou (2026-11-12)
          const viga = 13;
          let d = `M${x0},${chao}`;
          for (let i = 0; i < n; i++) d += ` v${-degrau} h${passo}`;
          d += ` v${viga} L${x0 + passo * 2.2},${chao} Z`;
          return (
            <g key={a + b} className={'passagem escada' + cls}>
              <rect x={dir - 3 * passo - 2} y={topo} width={3 * passo + 2} height={8} className={comodo(c, baixo)} style={corDe(c, baixo)} />
              <path d={d} className="lance" />
              <path d={`M${x0 + 2},${chao - 20} L${dir - 2},${topo - 18}`} className="corrimao" />
            </g>
          );
        }
        const pa = cabeca(va), pb = cabeca(vb);
        return (
          <g key={a + b} className={'telefone' + cls}>
            <line x1={pa.x} y1={pa.y} x2={pb.x} y2={pb.y} />
            <g transform={`translate(${p.x} ${p.y})`}><Telefone /></g>
          </g>
        );
      })}

      {/* moradores */}
      {fase.vizinhos.map((v) => {
        const x0 = v.pos[0] * L, y0 = v.pos[1] * A;
        const perdeu = fim && resultado.culpado === v.id;
        const clicavel = montando && (trilho ? true : podeSerOrigem(fase, v));
        const selecionado = montando && trilho?.selecionado === v.id;
        const cls = [
          'morador', origem === v.id && 'origem', perdeu && 'culpado', clicavel && 'clicavel',
          // ⚠️ TODO destino possível acende igual, inclusive a vítima. Por um tempo ela ficou sem o destaque (parecia
          // convite), mas aí o destaque virava dica: acendia tudo menos ela = "não vá por ali" (dono, 2026-11-12).
          selecionado && 'selecionado', montando && trilho?.alvos.includes(v.id) && 'alvo',
        ];
        const pe = pes(v);
        return (
          <g key={v.id} data-morador={v.id} className={cls.filter(Boolean).join(' ')}
            onClick={trilho ? undefined : () => props.aoTocar(v)}
            onPointerDown={trilho && montando ? (e) => { setArrasto({ de: v.id, x: e.clientX, y: e.clientY }); trilho.aoApertar(v); } : undefined}>
            <rect x={x0 + 9} y={y0 + 9} width={L - 18} height={A - 18} className="toque" />
            {/* ⚠️ as cantoneiras vêm ANTES do morador e da plaquinha: por cima, a de cima cortava o nome */}
            {selecionado && (
              // seleção = 4 cantoneiras grossas (forma, não só cor)
              <g className="cantoneiras">
                {[[x0 + 3, y0 + 3, 1, 1], [x0 + L - 3, y0 + 3, -1, 1], [x0 + 3, y0 + A - 3, 1, -1], [x0 + L - 3, y0 + A - 3, -1, -1]].map(([x, y, sx, sy]) => (
                  // o contorno branco é um traço por baixo, não um filtro (ver estilo.css, .cantoneiras)
                  [<path key={`f${x},${y}`} className="fundo" d={`M${x},${y + sy * 18} V${y} H${x + sx * 18}`} />,
                    <path key={`${x},${y}`} d={`M${x},${y + sy * 18} V${y} H${x + sx * 18}`} />]
                ))}
              </g>
            )}
            {fora(v)
              ? <Padaria x={pe.x} y={y0 + 84 + D} faltam={montando ? v.chega! : v.chega! - batida} batendo={falando.some((m) => m.para === v.id)} />
              : <Personagem v={v} expressao={expressao(v)} x={pe.x} y={pe.y} olha={olharPara(v)} escala={ESCALA} />}
            {/* ⚠️ a plaquinha sobe 11 e fica meio em cima da laje: no lugar de antes (y0+8…30) ela tapava a testa
                e às vezes o olho — a cabeça do desenho começa em ~y0+9. Assim ela encosta só no alto do cabelo. */}
            <Etiqueta v={v} x0={x0} y0={y0 - 11} contou={!!fase.origens && origem === v.id} menos={baixo.has(v.id) && v.tipo !== 'assunto'}
              perto={v.tipo === 'assunto' ? undefined : daVera.has(v.id) ? 'psiu' : daNorma.get(v.id)}
              comNome={!SEM_NOMES || selecionado || fim} />
            {v.celular && <g transform={`translate(${x0 + 22} ${y0 + A - 28}) scale(0.9)`} className="tem-celular"><Telefone /></g>}
          </g>
        );
      })}

      {/* Nando (apressado), montando: com UMA seta chegando nele, a seta tracejada mostra pra onde ele vai passar reto.
          Ensina a regra na hora, sem tirar o problema (escolher por onde entrar). Com duas chegando, depende de quem
          chega primeiro: não mostra. */}
      {montando && trilho && origem && fase.vizinhos.filter((p) => p.tipo === 'apressado').map((p) => {
        // ⚠️ pela SIMULAÇÃO do plano inteiro, não só por seta desenhada direto pra ele: assim vale também quando quem
        // conta pra ele é a Fofoqueira ou outro Nando (Consulta 8, Astra)
        const para = espalhar(fase, { origem, setas }).batidas.flat().find((m) => m.de === p.id)?.para;
        if (!para) return null;
        const [x1, y1, x2, y2] = trajeto(p, porId[para]);
        return (
          <g key={'prevista' + p.id} className="seta prevista" aria-label={`${p.nome} vai passar pra ${porId[para].nome}`}>
            <line x1={x1} y1={y1} x2={x2} y2={y2} />
            <polygon points="0,0 -11,-8 -8,0 -11,8" transform={ponta(x1, y1, x2, y2)} />
          </g>
        );
      })}

      {/* setas por cima dos personagens: pra quem cada um conta */}
      {fase.vizinhos.map((v) => {
        const alvo = setas[v.id] ?? v.seta;
        if (!alvo) return null;
        if (trilho && porCelular(fase, v.id, alvo)) {
          // ligação de celular: o telefone fica com quem liga e a ponta aponta pra quem atende
          const p = cabeca(v), q = cabeca(porId[alvo]);
          const d = Math.hypot(q.x - p.x, q.y - p.y), ux = (q.x - p.x) / d, uy = (q.y - p.y) / d;
          const ligando = falando.some((m) => m.de === v.id && m.para === alvo);
          const [fx, fy] = [q.x - ux * 30, q.y - uy * 30];
          return (
            <g key={'s' + v.id} className={ligando ? 'seta ligacao ativa' : 'seta ligacao'}>
              <line x1={p.x + ux * 48} y1={p.y + uy * 48} x2={fx} y2={fy} />
              <path d="M-4,-6 L3,0 L-4,6" transform={ponta(p.x, p.y, fx, fy)} />
              <g transform={`translate(${p.x + ux * 37} ${p.y + uy * 37}) scale(0.7)`}><Telefone /></g>
            </g>
          );
        }
        const [x1, y1, x2, y2] = trajeto(v, porId[alvo]);
        const apagavel = trilho && montando && setas[v.id];
        return (
          <g key={'s' + v.id} className={setas[v.id] ? 'seta girada' : 'seta'}
            onPointerDown={apagavel ? (e) => { e.stopPropagation(); trilho.aoApagar(v.id); } : undefined}>
            {/* faixa larga e invisível: a seta tem 4,5 de traço, fina demais pro dedo */}
            {apagavel && <line x1={x1} y1={y1} x2={x2} y2={y2} className="pega" />}
            <line x1={x1} y1={y1} x2={x2} y2={y2} className="fundo" />
            <line x1={x1} y1={y1} x2={x2} y2={y2} />
            <polygon points="0,0 -11,-8 -8,0 -11,8" transform={ponta(x1, y1, x2, y2)} />
          </g>
        );
      })}

      {/* o boato andando: em cada batida, um balão do tamanho que foi enviado sai de quem conta e percorre a seta
          até quem ouve (a Fofoqueira manda vários de uma vez). ⚠️ A posição final também está no estilo base:
          com movimento reduzido a animação some e o balão aparece direto no destino, não no canto do prédio. */}
      {falando.map((m) => {
        const [x1, y1, x2, y2] = trajeto(porId[m.de], porId[m.para]);
        // o meio do caminho, levantado: de lado o balão dá um pulinho; pela escada, abre uma barriguinha pro lado
        const deLado = Math.abs(x2 - x1) > Math.abs(y2 - y1);
        const xm = (x1 + x2) / 2 + (deLado ? 0 : -12), ym = (y1 + y2) / 2 - 16 - (deLado ? 16 : 0);
        const estilo = {
          '--x1': `${x1}px`, '--y1': `${y1 - 16}px`, '--xm': `${xm}px`, '--ym': `${ym}px`, '--x2': `${x2}px`, '--y2': `${y2 - 16}px`,
          transform: `translate(${x2}px, ${y2 - 16}px)`, animationDuration: `${Math.round(ritmo * 0.8)}ms`,
        } as CSSProperties;
        return (
          <g key={`viaja${batida}-${m.de}-${m.para}`} className="viaja" style={estilo} aria-hidden="true">
            <g transform="scale(1.15)"><Boato tamanho={m.tamanho} invertida={m.versao === 'invertida'} /></g>
          </g>
        );
      })}

      {/* derrota pela vítima: o último elo, de quem contou de fato (inclusive a Fofoqueira) até ela, com direção.
          Fica enquanto o resultado está aberto. No empate, todos que entregaram juntos. */}
      {fim && resultado.motivo === 'assunto_ouviu' && quemContou(resultado, resultado.culpado!).map((de) => {
        const [x1, y1, x2, y2] = trajeto(porId[de], porId[resultado.culpado!]);
        return (
          <g key={'fatal' + de} className="elo-fatal" aria-hidden="true">
            <line x1={x1} y1={y1} x2={x2} y2={y2} className="fundo" />
            <line x1={x1} y1={y1} x2={x2} y2={y2} />
            <polygon points="0,0 -11,-8 -8,0 -11,8" transform={ponta(x1, y1, x2, y2)} />
          </g>
        );
      })}

      {/* derrota: só uma moldura em volta do apartamento de quem a explicação cita (o texto está no desfecho) */}
      {fim && explicacao && citados(explicacao).map((id) => {
        const v = porId[id];
        return <rect key={'cita' + id} x={v.pos[0] * L + 5} y={v.pos[1] * A + 5} width={L - 10} height={A - 10} rx={3} className="citado" aria-hidden="true" />;
      })}

      {/* balões e botões de girar, sempre na camada de cima */}
      {fase.vizinhos.map((v) => {
        const x0 = v.pos[0] * L, y0 = v.pos[1] * A;
        const o = ouviuAte(v.id);
        const perdeu = fim && resultado.culpado === v.id;
        if (o && perdeu && v.tipo === 'assunto') return <Que key={'b' + v.id} x={x0 + 18} y={y0 - 2} />;
        if (o || (montando && trilho && v.id === origem)) {
          // antes de espalhar, quem você contou já mostra o tamanho com que o boato começa: cochicho
          return (
            // a animação do balão usa transform do CSS, então a posição fica num grupo de fora
            <g key={'b' + v.id} transform={`translate(${x0 + 24} ${y0 + 48 + DB}) scale(1.1)`}>
              <g className="balao"><Boato tamanho={o ? o.tamanho : 1} invertida={o?.versao === 'invertida'} /></g>
            </g>
          );
        }
        if (emDuvida(v.id)) {
          const d = resultado!.duvida![v.id];
          return (
            <g key={'d' + v.id} transform={`translate(${x0 + 24} ${y0 + 48 + DB}) scale(1.1)`} className="em-duvida" aria-label={`${v.nome} ouviu de uma pessoa só e não acreditou`}>
              <g className="balao"><Boato tamanho={d.tamanho} invertida={d.versao === 'invertida'} /></g>
              <text x={16} y={9} className="interroga">?</text>
            </g>
          );
        }
        if (montando && fase.giros > 0 && podeGirar(fase, v)) {
          return (
            <g key={'g' + v.id} className={semGiro && !setas[v.id] ? 'girar esgotado' : 'girar'}
              onClick={(e) => { e.stopPropagation(); props.aoGirar(v); }}>
              {/* canto de baixo à esquerda, fora do corpo do morador (no centro do apartamento) */}
              <circle cx={x0 + 19} cy={y0 + A - 24} r={12} />
              <g transform={`translate(${x0 + 19} ${y0 + A - 24}) scale(0.85)`}><Girar /></g>
            </g>
          );
        }
        return null;
      })}
      <line ref={guia} className="guia" />
    </g>
  );
}

// Tamanho do prédio em unidades do desenho (sem telhado, que sobe 42 acima do 0).
export const medidas = (fase: Fase) => ({
  largura: (Math.max(...fase.vizinhos.map((v) => v.pos[0])) + 1) * L,
  altura: (Math.max(...fase.vizinhos.map((v) => v.pos[1])) + 1) * A,
});
