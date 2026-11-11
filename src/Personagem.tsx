import { createContext, useContext, type ReactNode } from 'react';
import type { Vizinho } from './motor';
import { ELAS, SEU_ZE } from './elenco';

// Para onde o morador olha (direção de quem ele conta), sem passar por todos os desenhos.
const Olhar = createContext<[number, number]>([0, 0]);

// Cabeçudos de charge com silhueta própria: cada tipo (e cada vizinho comum) tem corpo,
// altura, cabeça, cabelo e objeto diferentes, não só outra cor.
// Coordenadas locais: (0,0) é o ponto de ancoragem das setas; os pés pisam em y = 48.

export type Expressao = 'neutro' | 'ouvindo' | 'contando' | 'chocado' | 'bravo';

const T = '#2b2622';
const C = { stroke: T, strokeWidth: 2.4, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const };
// O tom mais escuro ainda deixa ler sobrancelha, olho fechado e boca no traço escuro.
const PELES = ['#f3cba5', '#e0ac7e', '#b57a4f', '#8f5a38'];

const semente = (s: string) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
type P = [number, number];

// ---------- peças compartilhadas ----------

function Braco({ de, ate, manga, pele, grosso = 7 }: { de: P; ate: P; manga: string; pele: string; grosso?: number }) {
  const d = `M${de[0]},${de[1]} L${ate[0]},${ate[1]}`;
  return (
    <g>
      <path d={d} stroke={T} strokeWidth={grosso + 3.5} strokeLinecap="round" />
      <path d={d} stroke={manga} strokeWidth={grosso} strokeLinecap="round" />
      <circle cx={ate[0]} cy={ate[1]} r={4.4} fill={pele} {...C} strokeWidth={2} />
    </g>
  );
}

// Onde vão as mãos em cada expressão, a partir dos ombros e da cabeça.
function maos(e: Expressao, oe: P, od: P, cy: number, rx: number): [P, P] {
  switch (e) {
    case 'ouvindo': return [[oe[0] - 4, oe[1] + 20], [rx + 6, cy + 2]];
    case 'contando': return [[oe[0] - 4, oe[1] + 20], [13, cy + 15]];
    case 'chocado': return [[-rx - 5, cy + 6], [rx + 5, cy + 6]];
    case 'bravo': return [[-rx - 3, cy + 24], [rx + 3, cy + 24]];
    default: return [[oe[0] - 4, oe[1] + 20], [od[0] + 4, od[1] + 20]];
  }
}

function Bracos({ e, oe, od, cy, rx, manga, pele, grosso }: { e: Expressao; oe: P; od: P; cy: number; rx: number; manga: string; pele: string; grosso?: number }) {
  const [me, md] = maos(e, oe, od, cy, rx);
  return <g><Braco de={oe} ate={me} manga={manga} pele={pele} grosso={grosso} /><Braco de={od} ate={md} manga={manga} pele={pele} grosso={grosso} /></g>;
}

type Olhos = 'normal' | 'sono' | 'pontinho' | 'redondo' | 'gatinho' | 'garrafa';
type Sobr = 'fina' | 'grossa' | 'monocelha' | 'cetica';

function Rosto(props: {
  e: Expressao; cy: number; pele: string; olhos?: Olhos; sobr?: Sobr; corSobr?: string;
  nariz?: 'bola' | 'grande' | 'fino'; batom?: boolean; bigode?: 'bigodao' | 'bigodinho'; corado?: boolean; pinta?: boolean;
}) {
  const { e, cy, pele, olhos = 'normal', sobr = 'fina', corSobr = T, nariz = 'bola' } = props;
  const susto = e === 'chocado';
  const [ox, oy0] = useContext(Olhar);
  // parado ou contando, olha pra quem vai ouvir dele; ouvindo, vira a orelha
  const olhar = e === 'ouvindo' ? 2.6 : e === 'neutro' || e === 'contando' ? ox * 2.4 : 0;
  const olharY = e === 'neutro' || e === 'contando' ? oy0 * 1.8 : 0;
  const oy = cy - 3;
  const olho = (x: number) => {
    if (olhos === 'pontinho' && !susto) return <circle key={x} cx={x + olhar / 2} cy={oy + olharY / 2} r={2.4} fill={T} />;
    const grande = susto || olhos === 'garrafa';
    const rx = grande ? 6.6 : 5.2, ry = grande ? 7.4 : 6.2;
    return (
      <g key={x} className={olhos === 'sono' && !susto ? undefined : 'olho'}>
        <ellipse cx={x} cy={oy} rx={rx} ry={ry} fill="#fff" stroke={T} strokeWidth={1.9} />
        <circle cx={x + olhar} cy={(e === 'bravo' ? oy + 1.5 : oy + 0.5) + olharY} r={susto ? 1.6 : 2.4} fill={T} />
        {olhos === 'sono' && !susto && <path d={`M${x - rx - 0.5},${oy} A${rx + 0.5},${ry} 0 0 1 ${x + rx + 0.5},${oy} Z`} fill={pele} stroke={T} strokeWidth={1.9} />}
      </g>
    );
  };
  const sob: Record<Expressao, [string, string]> = {
    neutro: [`M-12,${cy - 12} Q-7.5,${cy - 14} -3,${cy - 12}`, `M3,${cy - 12} Q7.5,${cy - 14} 12,${cy - 12}`],
    ouvindo: [`M-12,${cy - 12} Q-7.5,${cy - 13} -3,${cy - 12}`, `M3,${cy - 15} Q7.5,${cy - 19} 12,${cy - 15}`],
    contando: [`M-12,${cy - 14} Q-7.5,${cy - 18} -3,${cy - 15}`, `M3,${cy - 15} Q7.5,${cy - 18} 12,${cy - 14}`],
    chocado: [`M-13,${cy - 18} Q-7.5,${cy - 22} -3,${cy - 18}`, `M3,${cy - 18} Q7.5,${cy - 22} 13,${cy - 18}`],
    bravo: [`M-12,${cy - 15} L-3,${cy - 10}`, `M3,${cy - 10} L12,${cy - 15}`],
  };
  const [s1, s2] = sobr === 'cetica' && e === 'neutro' ? [sob.neutro[0], sob.ouvindo[1]] : sob[e];
  const wS = sobr === 'grossa' || sobr === 'monocelha' ? 4.2 : 2.5;
  const my = cy + 13;
  const labio = props.batom ? '#c23a5e' : T;
  const boca = (() => {
    switch (e) {
      case 'ouvindo': return <ellipse cx={1} cy={my} rx={2.5} ry={3} fill={labio} />;
      case 'contando': return <g><path d={`M-7.5,${my - 2} Q0,${my + 10} 7.5,${my - 2} Z`} fill="#5e1f22" stroke={labio} strokeWidth={2.1} strokeLinejoin="round" /><path d={`M-3,${my + 3.5} Q0,${my + 1.5} 3,${my + 3.5} Q0,${my + 6} -3,${my + 3.5} Z`} fill="#e9837a" /></g>;
      case 'chocado': return <ellipse cx={0} cy={my + 2} rx={4.8} ry={6.2} fill="#5e1f22" stroke={labio} strokeWidth={2.1} />;
      case 'bravo': return <g><rect x={-8} y={my - 1} width={16} height={6} rx={2} fill="#fff" stroke={T} strokeWidth={1.9} /><path d={`M-3,${my - 1} v6 M2,${my - 1} v6`} stroke={T} strokeWidth={1.3} /></g>;
      default: return <path d={`M-5.5,${my} Q0,${my + 4.5} 5.5,${my}`} fill="none" stroke={labio} strokeWidth={2.3} strokeLinecap="round" />;
    }
  })();
  const ny = cy + 4;
  return (
    <g>
      {(props.corado || e === 'contando' || e === 'chocado' || e === 'bravo') && (
        <g fill={e === 'bravo' ? '#e0574a' : '#e9837a'} opacity={0.42}><circle cx={-13} cy={cy + 8} r={4.3} /><circle cx={13} cy={cy + 8} r={4.3} /></g>
      )}
      {olho(-7.5)}{olho(7.5)}
      {olhos === 'redondo' && <g fill="none" stroke={T} strokeWidth={1.8}><circle cx={-7.5} cy={oy} r={7.8} /><circle cx={7.5} cy={oy} r={7.8} /><path d={`M-0.5,${oy} h1`} /></g>}
      {olhos === 'garrafa' && <g fill="#bfe3f2" fillOpacity={0.3} stroke={T} strokeWidth={3}><circle cx={-8} cy={oy} r={9} /><circle cx={8} cy={oy} r={9} /></g>}
      {olhos === 'gatinho' && (
        <g fill="none" stroke="#c23a5e" strokeWidth={2.6} strokeLinejoin="round">
          <path d={`M-15,${oy - 6} L-2,${oy - 5} Q-1,${oy + 6} -8,${oy + 6} Q-14,${oy + 5} -15,${oy - 6} Z`} />
          <path d={`M15,${oy - 6} L2,${oy - 5} Q1,${oy + 6} 8,${oy + 6} Q14,${oy + 5} 15,${oy - 6} Z`} />
        </g>
      )}
      {sobr === 'monocelha' && e !== 'chocado'
        ? <path d={`M-12,${cy - 12} Q0,${cy - 9} 12,${cy - 12}`} fill="none" stroke={corSobr} strokeWidth={wS} strokeLinecap="round" />
        : <g fill="none" stroke={corSobr} strokeWidth={wS} strokeLinecap="round"><path d={s1} /><path d={s2} /></g>}
      {nariz === 'fino'
        ? <path d={`M0,${ny - 6} Q4,${ny + 3} -1,${ny + 4}`} fill="none" stroke={T} strokeWidth={2} strokeLinecap="round" />
        : <ellipse cx={0} cy={ny} rx={nariz === 'grande' ? 7 : 4.8} ry={nariz === 'grande' ? 5.8 : 4.3} fill={pele} {...C} strokeWidth={1.9} />}
      {boca}
      {props.bigode === 'bigodao' && <path d={`M-16,${cy + 11} Q-9,${cy + 4} 0,${cy + 8} Q9,${cy + 4} 16,${cy + 11} Q10,${cy + 15} 0,${cy + 11} Q-10,${cy + 15} -16,${cy + 11} Z`} fill={T} stroke={T} strokeWidth={1.4} strokeLinejoin="round" />}
      {props.bigode === 'bigodinho' && <path d={`M-7,${cy + 9.5} Q0,${cy + 7} 7,${cy + 9.5}`} fill="none" stroke={T} strokeWidth={2.4} strokeLinecap="round" />}
      {props.pinta && <circle cx={10} cy={cy + 12} r={1.3} fill={T} />}
    </g>
  );
}

const cabeca = (cy: number, rx: number, ry: number, pele: string, orelhas = true) => (
  <g>
    {orelhas && <><circle cx={-rx} cy={cy + 3} r={5} fill={pele} {...C} /><circle cx={rx} cy={cy + 3} r={5} fill={pele} {...C} /></>}
    <ellipse cx={0} cy={cy} rx={rx} ry={ry} fill={pele} {...C} />
  </g>
);

const pernas = (x: number, de: number, cor = T, sapato = '#3b2c22') => (
  <g>
    <path d={`M${-x},${de} L${-x},46 M${x},${de} L${x},46`} stroke={cor} strokeWidth={6} strokeLinecap="round" />
    <ellipse cx={-x - 2} cy={46.5} rx={5.5} ry={2.8} fill={sapato} stroke={T} strokeWidth={1.6} />
    <ellipse cx={x + 2} cy={46.5} rx={5.5} ry={2.8} fill={sapato} stroke={T} strokeWidth={1.6} />
  </g>
);

const flores = (pts: P[], cor: string, miolo = '#f4c430') => (
  <g>{pts.map(([x, y]) => (
    <g key={`${x},${y}`}>
      {[0, 72, 144, 216, 288].map((a) => <circle key={a} cx={x + 3 * Math.cos((a * Math.PI) / 180)} cy={y + 3 * Math.sin((a * Math.PI) / 180)} r={2.3} fill={cor} />)}
      <circle cx={x} cy={y} r={1.5} fill={miolo} />
    </g>
  ))}</g>
);

// ---------- os personagens ----------

type Props = { e: Expressao; pele: string };

function Fofoqueira({ e, pele }: Props) {
  const cy = -6;
  return (
    <g>
      {/* cabelão armado por baixo do lenço */}
      <ellipse cx={0} cy={-24} rx={25} ry={15} fill="#6b3a2a" {...C} />
      <path d="M-14,8 Q-30,30 -27,47 L27,47 Q30,30 14,8 Z" fill="#e8607a" {...C} />
      {flores([[-15, 26], [10, 20], [-4, 38], [17, 38], [-20, 42]], '#fff2f5')}
      {e === 'neutro' ? (
        // cafezinho
        <g>
          <Braco de={[-14, 14]} ate={[-6, 27]} manga="#e8607a" pele={pele} />
          <Braco de={[14, 14]} ate={[6, 27]} manga="#e8607a" pele={pele} />
          <path d="M-5,20 h10 v7 a5,5 0 0 1 -10,0 Z" fill="#fff" {...C} strokeWidth={1.8} />
          <path d="M5,22 q4,0 3,4" fill="none" stroke={T} strokeWidth={1.6} />
        </g>
      ) : e === 'ouvindo' ? (
        // copo na parede
        <g>
          <Braco de={[-14, 14]} ate={[-18, 33]} manga="#e8607a" pele={pele} />
          <Braco de={[14, 14]} ate={[27, -2]} manga="#e8607a" pele={pele} />
          <path d="M22,-12 L34,-15 L34,6 L22,3 Z" fill="#cfeaf5" fillOpacity={0.85} {...C} strokeWidth={1.8} />
        </g>
      ) : (
        <Bracos e={e} oe={[-14, 14]} od={[14, 14]} cy={cy} rx={20} manga="#e8607a" pele={pele} />
      )}
      {cabeca(cy, 20, 21, pele)}
      {/* bobes e lenço amarrado no alto */}
      <g fill="#f29bb5" stroke={T} strokeWidth={1.8}>
        <rect x={-17} y={-26} width={9} height={7} rx={3} /><rect x={-4.5} y={-28} width={9} height={7} rx={3} /><rect x={8} y={-26} width={9} height={7} rx={3} />
      </g>
      <path d="M-26,-22 Q0,-48 26,-22 Q0,-34 -26,-22 Z" fill="#2f6fd6" {...C} />
      <g fill="#fff"><circle cx={-12} cy={-31} r={1.6} /><circle cx={0} cy={-36} r={1.6} /><circle cx={12} cy={-31} r={1.6} /></g>
      <ellipse cx={-5} cy={-42} rx={5} ry={3.5} fill="#2f6fd6" {...C} strokeWidth={1.8} transform="rotate(-25 -5 -42)" />
      <ellipse cx={5} cy={-42} rx={5} ry={3.5} fill="#2f6fd6" {...C} strokeWidth={1.8} transform="rotate(25 5 -42)" />
      <Rosto e={e} cy={cy} pele={pele} olhos="gatinho" batom pinta />
      <g fill="#f4c430" stroke={T} strokeWidth={1.4}><circle cx={-20} cy={cy + 11} r={2.8} /><circle cx={20} cy={cy + 11} r={2.8} /></g>
    </g>
  );
}

function ExageradoEle({ e, pele }: Props) {
  const cy = -15;
  const camisa = '#ff8a1f';
  const [me, md] = e === 'neutro' ? ([[-24, 4], [24, 4]] as [P, P]) : maos(e, [-11, 12], [11, 12], cy, 19);
  return (
    <g>
      {pernas(5, 34, '#3d4a8a')}
      <path d="M-12,10 L-13,36 L13,36 L12,10 Q0,6 -12,10 Z" fill={camisa} {...C} />
      {flores([[-6, 18], [6, 28], [7, 15], [-7, 31]], '#fff', '#2f9e5a')}
      <rect x={-3.5} y={2} width={7} height={9} fill={pele} {...C} strokeWidth={2} />
      <Braco de={[-11, 12]} ate={me} manga={camisa} pele={pele} grosso={5} />
      <Braco de={[11, 12]} ate={md} manga={camisa} pele={pele} grosso={5} />
      {cabeca(cy, 18, 22, pele)}
      {/* topete enorme pra frente */}
      <path d="M-18,-22 Q-24,-46 2,-50 Q30,-50 28,-34 Q20,-40 10,-35 Q16,-28 18,-22 Q4,-32 -18,-22 Z" fill="#1d1a18" {...C} />
      <path d="M-18,-20 L-18,-8 M18,-20 L18,-8" stroke="#1d1a18" strokeWidth={4} strokeLinecap="round" />
      <Rosto e={e === 'neutro' ? 'chocado' : e} cy={cy} pele={pele} sobr="grossa" nariz="grande" />
    </g>
  );
}

function ExageradaEla({ e, pele }: Props) {
  const cy = -8;
  return (
    <g>
      {/* nuvem de cachos maior que a cabeça */}
      <g fill="#7a3b1e" {...C}>
        {[[-24, -14], [-18, -30], [-4, -38], [12, -36], [24, -24], [27, -8], [-27, 0], [25, 6]].map(([x, y]) => <circle key={`${x}${y}`} cx={x} cy={y} r={11} />)}
        <ellipse cx={0} cy={-18} rx={24} ry={20} stroke="none" />
      </g>
      <path d="M-11,12 L-26,47 L26,47 L11,12 Q0,8 -11,12 Z" fill="#7a5cb8" {...C} />
      <path d="M-20,34 l6,-5 l6,5 l6,-5 l6,5 l6,-5 l6,5" fill="none" stroke="#f4c430" strokeWidth={2.4} />
      <Bracos e={e === 'neutro' ? 'chocado' : e} oe={[-11, 13]} od={[11, 13]} cy={cy} rx={19} manga="#7a5cb8" pele={pele} grosso={5} />
      {cabeca(cy, 19, 21, pele, false)}
      {/* óculos escuros em cima do cabelo */}
      <g fill="#1d1a18" stroke={T} strokeWidth={1.6}><ellipse cx={-8} cy={-29} rx={7} ry={4.5} /><ellipse cx={8} cy={-29} rx={7} ry={4.5} /></g>
      <Rosto e={e} cy={cy} pele={pele} batom sobr="grossa" corado />
      <g fill="none" stroke="#f4c430" strokeWidth={2.6}><circle cx={-19} cy={cy + 14} r={5} /><circle cx={19} cy={cy + 14} r={5} /></g>
    </g>
  );
}

function DoContraMoleque({ e, pele }: Props) {
  const cy = -4;
  const moletom = '#4d5560';
  const cruzado = e === 'neutro' || e === 'contando';
  return (
    <g>
      {pernas(6, 36, '#2f3e66', '#f2f2f2')}
      <path d="M-20,12 Q-24,30 -20,40 L20,40 Q24,30 20,12 Q0,6 -20,12 Z" fill={moletom} {...C} />
      <path d="M-9,28 h18 v8 h-18 Z" fill="none" stroke={T} strokeWidth={1.8} />
      {cruzado ? (
        <g>
          <rect x={-21} y={18} width={42} height={9} rx={4.5} fill={moletom} {...C} />
          <circle cx={-17} cy={22.5} r={4.2} fill={pele} {...C} strokeWidth={1.8} />
          <circle cx={17} cy={22.5} r={4.2} fill={pele} {...C} strokeWidth={1.8} />
        </g>
      ) : <Bracos e={e} oe={[-17, 15]} od={[17, 15]} cy={cy} rx={22} manga={moletom} pele={pele} />}
      {/* capuz por cima */}
      <path d="M-27,6 Q-32,-34 0,-36 Q32,-34 27,6 Q20,14 0,14 Q-20,14 -27,6 Z" fill={moletom} {...C} />
      {cabeca(cy, 18, 19, pele, false)}
      <path d="M-4,14 l-1,8 M4,14 l1,8" stroke="#f2f2f2" strokeWidth={1.8} strokeLinecap="round" />
      {/* fone de ouvido por cima do capuz */}
      <path d="M-25,-4 Q-26,-38 0,-38 Q26,-38 25,-4" fill="none" stroke="#e63946" strokeWidth={4} />
      <rect x={-31} y={-10} width={9} height={15} rx={4} fill="#e63946" {...C} strokeWidth={1.8} />
      {e !== 'ouvindo' && <rect x={22} y={-10} width={9} height={15} rx={4} fill="#e63946" {...C} strokeWidth={1.8} />}
      <Rosto e={e} cy={cy} pele={pele} olhos="sono" />
      {e === 'neutro' && <circle cx={6} cy={cy + 16} r={6} fill="#ff9ec7" stroke={T} strokeWidth={1.6} />}
    </g>
  );
}

function DoContraRabugento({ e, pele }: Props) {
  const cy = -2;
  const casaco = '#8a6a3c';
  return (
    <g>
      {pernas(7, 36, '#5a5048')}
      <path d="M-22,12 L-22,40 L22,40 L22,12 Q0,6 -22,12 Z" fill={casaco} {...C} />
      <path d="M0,10 L0,40" stroke={T} strokeWidth={1.6} />
      <g fill="#f2e6c9">{[18, 26, 34].map((y) => <circle key={y} cx={3.5} cy={y} r={1.6} />)}</g>
      {e === 'neutro' || e === 'ouvindo'
        ? <g><rect x={-23} y={19} width={46} height={10} rx={5} fill={casaco} {...C} /><circle cx={-18} cy={24} r={4.4} fill={pele} {...C} strokeWidth={1.8} /><circle cx={18} cy={24} r={4.4} fill={pele} {...C} strokeWidth={1.8} /></g>
        : <Bracos e={e} oe={[-19, 15]} od={[19, 15]} cy={cy} rx={21} manga={casaco} pele={pele} />}
      {/* cabeça quadrada */}
      <rect x={-21} y={cy - 20} width={42} height={40} rx={14} fill={pele} {...C} />
      <circle cx={-21} cy={cy + 3} r={5} fill={pele} {...C} /><circle cx={21} cy={cy + 3} r={5} fill={pele} {...C} />
      {/* boina achatada */}
      <path d={`M-23,${cy - 12} Q-20,${cy - 25} 0,${cy - 25} Q22,${cy - 25} 26,${cy - 12} Q12,${cy - 9} -23,${cy - 12} Z`} fill="#4a4a4a" {...C} />
      <Rosto e={e === 'neutro' ? 'bravo' : e} cy={cy} pele={pele} sobr="monocelha" nariz="grande" />
    </g>
  );
}

function DoContraCetica({ e, pele }: Props) {
  const cy = -9;
  const gola = '#1f6f6b';
  return (
    <g>
      {pernas(5, 36, '#2b2b2b')}
      <path d="M-14,10 L-16,38 L16,38 L14,10 Q0,5 -14,10 Z" fill={gola} {...C} />
      <rect x={-7} y={6} width={14} height={7} rx={3} fill={gola} {...C} strokeWidth={2} />
      {e === 'chocado' || e === 'contando'
        ? <Bracos e={e} oe={[-13, 13]} od={[13, 13]} cy={cy} rx={18} manga={gola} pele={pele} grosso={5} />
        : <g><rect x={-17} y={17} width={34} height={8} rx={4} fill={gola} {...C} /><circle cx={-13} cy={21} r={4} fill={pele} {...C} strokeWidth={1.8} /><circle cx={13} cy={21} r={4} fill={pele} {...C} strokeWidth={1.8} /></g>}
      {cabeca(cy, 18, 21, pele, false)}
      {/* chanel reto e anguloso */}
      <path d="M-21,10 L-22,-14 Q-20,-33 0,-33 Q20,-33 22,-14 L21,10 L13,10 L14,-14 Q2,-20 -14,-14 L-13,10 Z" fill="#111" {...C} />
      <Rosto e={e} cy={cy} pele={pele} sobr="cetica" batom nariz="fino" />
    </g>
  );
}

function Padre({ e, pele }: Props) {
  const cy = -10;
  return (
    <g>
      {/* batina em forma de sino até o chão */}
      <path d="M-10,10 Q-14,22 -25,47 L25,47 Q14,22 10,10 Q0,6 -10,10 Z" fill="#26232b" {...C} />
      <g fill="#8b8794">{[20, 27, 34, 41].map((y) => <circle key={y} cx={0} cy={y} r={1.4} />)}</g>
      <rect x={-4} y={7} width={8} height={5} rx={1.2} fill="#fff" stroke={T} strokeWidth={1.6} />
      {e === 'neutro'
        ? <g><Braco de={[-10, 14]} ate={[-2, 25]} manga="#26232b" pele={pele} grosso={5} /><Braco de={[10, 14]} ate={[2, 25]} manga="#26232b" pele={pele} grosso={5} /></g>
        : <Bracos e={e} oe={[-10, 14]} od={[10, 14]} cy={cy} rx={17} manga="#26232b" pele={pele} grosso={5} />}
      {/* rosto comprido e orelhas de abano */}
      <ellipse cx={-17} cy={cy + 2} rx={6.5} ry={8} fill={pele} {...C} />
      <ellipse cx={17} cy={cy + 2} rx={6.5} ry={8} fill={pele} {...C} />
      <ellipse cx={0} cy={cy} rx={16} ry={23} fill={pele} {...C} />
      <path d="M-16,-12 Q-20,-20 -12,-25 M16,-12 Q20,-20 12,-25" fill="none" stroke="#cfcac2" strokeWidth={4.5} strokeLinecap="round" />
      {e === 'neutro' ? (
        <g fill="none" stroke={T} strokeWidth={2.3} strokeLinecap="round">
          <path d={`M-11,${cy - 3} Q-7.5,${cy} -4,${cy - 3}`} /><path d={`M4,${cy - 3} Q7.5,${cy} 11,${cy - 3}`} />
          <circle cx={-7.5} cy={cy - 3} r={7} strokeWidth={1.7} /><circle cx={7.5} cy={cy - 3} r={7} strokeWidth={1.7} />
          <path d={`M-5,${cy + 13} Q0,${cy + 16} 5,${cy + 13}`} />
          <ellipse cx={0} cy={cy + 5} rx={3.5} ry={5} fill={pele} strokeWidth={1.8} />
        </g>
      ) : <Rosto e={e} cy={cy} pele={pele} olhos="redondo" nariz="fino" />}
    </g>
  );
}

function SeuZe({ e, pele }: Props) {
  const cy = 0;
  return (
    <g>
      <path d="M-8,40 L-8,46 M8,40 L8,46" stroke={pele} strokeWidth={6} strokeLinecap="round" />
      <path d="M-15,46.5 h12 M3,46.5 h12" stroke="#2f9e5a" strokeWidth={4} strokeLinecap="round" />
      {/* barrigão de regata */}
      <ellipse cx={0} cy={30} rx={25} ry={14} fill="#f7f4ee" {...C} />
      <path d="M-10,16 Q0,24 10,16" fill={pele} {...C} strokeWidth={1.8} />
      <circle cx={0} cy={35} r={1.6} fill={T} />
      {e === 'neutro' ? (
        // lendo o jornal
        <g>
          <Braco de={[-19, 22]} ate={[-15, 30]} manga={pele} pele={pele} grosso={6} />
          <Braco de={[19, 22]} ate={[15, 30]} manga={pele} pele={pele} grosso={6} />
          <path d="M-16,22 L0,25 L16,22 L16,38 L0,41 L-16,38 Z" fill="#ecebe4" {...C} strokeWidth={1.8} />
          <path d="M0,25 V41 M-13,27 h9 M-13,31 h9 M3,27 h9 M3,31 h9 M3,35 h9" stroke="#8b8794" strokeWidth={1.4} />
        </g>
      ) : <Bracos e={e} oe={[-20, 20]} od={[20, 20]} cy={cy} rx={23} manga={pele} pele={pele} grosso={6} />}
      {/* careca brilhante com três fios penteados */}
      {cabeca(cy, 23, 21, pele)}
      <path d="M-23,-4 Q-27,4 -22,10 M23,-4 Q27,4 22,10" fill="none" stroke="#cfcac2" strokeWidth={5} strokeLinecap="round" />
      <path d="M-14,-17 Q0,-24 15,-15 M-12,-14 Q0,-21 14,-12 M-10,-11 Q2,-17 12,-9" fill="none" stroke={T} strokeWidth={1.5} strokeLinecap="round" />
      <ellipse cx={-9} cy={-13} rx={5} ry={2.4} fill="#fff" opacity={0.5} />
      <Rosto e={e} cy={cy} pele={pele} sobr="grossa" nariz="grande" bigode="bigodao" />
    </g>
  );
}

function Vovo({ e, pele }: Props) {
  const cy = 6;
  return (
    <g>
      {/* bengala */}
      <path d="M22,24 L24,47 M22,24 q-6,-3 -6,3" fill="none" stroke="#8a5a2b" strokeWidth={3} strokeLinecap="round" />
      <path d="M-12,24 Q-18,36 -18,47 L18,47 Q18,36 12,24 Q0,20 -12,24 Z" fill="#7b5ea7" {...C} />
      <path d="M-13,24 Q0,34 13,24" fill="none" stroke="#f2e6c9" strokeWidth={2.4} />
      {e === 'neutro'
        ? <g><Braco de={[-11, 26]} ate={[-14, 38]} manga="#b39ddb" pele={pele} grosso={5} /><Braco de={[11, 26]} ate={[22, 26]} manga="#b39ddb" pele={pele} grosso={5} /></g>
        : <Bracos e={e} oe={[-11, 26]} od={[11, 26]} cy={cy} rx={18} manga="#b39ddb" pele={pele} grosso={5} />}
      {cabeca(cy, 18, 18, pele)}
      <path d="M-18,4 Q-20,-14 0,-14 Q20,-14 18,4 Q10,-6 0,-6 Q-10,-6 -18,4 Z" fill="#eeeeee" {...C} />
      <circle cx={0} cy={-17} r={7.5} fill="#eeeeee" {...C} />
      <Rosto e={e} cy={cy} pele={pele} olhos="redondo" corado />
    </g>
  );
}

function BlackPower({ e, pele }: Props) {
  const cy = -8;
  return (
    <g>
      <circle cx={0} cy={-16} r={29} fill="#1d1a18" {...C} />
      {pernas(5, 34, '#2f3e66', '#f4c430')}
      <path d="M-12,10 L-14,36 L14,36 L12,10 Q0,6 -12,10 Z" fill="#f4c430" {...C} />
      <path d="M-4,10 L0,20 L4,10" fill="none" stroke={T} strokeWidth={1.6} />
      {e === 'neutro' ? (
        // olhando o celular
        <g>
          <Braco de={[-11, 13]} ate={[-15, 30]} manga="#f4c430" pele={pele} grosso={5} />
          <Braco de={[11, 13]} ate={[7, 22]} manga="#f4c430" pele={pele} grosso={5} />
          <rect x={4} y={14} width={8} height={12} rx={2} fill="#2b2622" stroke={T} strokeWidth={1.4} />
        </g>
      ) : <Bracos e={e} oe={[-11, 13]} od={[11, 13]} cy={cy} rx={18} manga="#f4c430" pele={pele} grosso={5} />}
      {cabeca(cy, 18, 20, pele, false)}
      <Rosto e={e} cy={cy} pele={pele} batom />
      <g fill="none" stroke="#f4c430" strokeWidth={2.4}><circle cx={-18} cy={cy + 12} r={5.5} /><circle cx={18} cy={cy + 12} r={5.5} /></g>
    </g>
  );
}

function DonaDoCachorro({ e, pele }: Props) {
  const cy = -7;
  const blusa = '#2aa79b';
  return (
    <g>
      {/* rabo de cavalo alto */}
      <path d="M8,-26 Q34,-30 30,0 Q26,-14 14,-18 Z" fill="#b4562c" {...C} />
      {pernas(5, 34, '#1d1a18', '#fff')}
      <path d="M-12,10 L-13,36 L13,36 L12,10 Q0,6 -12,10 Z" fill={blusa} {...C} />
      {/* cachorrinho no colo */}
      <g>
        <ellipse cx={0} cy={26} rx={11} ry={7} fill="#f2e6c9" {...C} strokeWidth={2} />
        <circle cx={-4} cy={19} r={7} fill="#f2e6c9" {...C} strokeWidth={2} />
        <path d="M-10,14 q-4,6 1,9 M2,14 q4,6 -1,9" fill="#8a5a2b" stroke={T} strokeWidth={1.6} />
        <circle cx={-6} cy={18.5} r={1.3} fill={T} /><circle cx={-2} cy={18.5} r={1.3} fill={T} />
        <circle cx={-4} cy={21.5} r={1.4} fill={T} />
        {(e === 'chocado' || e === 'bravo') && <path d="M-9,10 l-2,-3 M1,10 l2,-3" stroke={T} strokeWidth={1.4} />}
      </g>
      {e === 'neutro' || e === 'ouvindo'
        ? <g><Braco de={[-11, 13]} ate={[-9, 28]} manga={blusa} pele={pele} grosso={5} />{e === 'ouvindo' ? <Braco de={[11, 13]} ate={[24, cy + 2]} manga={blusa} pele={pele} grosso={5} /> : <Braco de={[11, 13]} ate={[9, 28]} manga={blusa} pele={pele} grosso={5} />}</g>
        : <Bracos e={e} oe={[-11, 13]} od={[11, 13]} cy={cy} rx={18} manga={blusa} pele={pele} grosso={5} />}
      {cabeca(cy, 18, 20, pele)}
      <path d="M-18,-6 Q-19,-28 0,-28 Q20,-28 18,-6 Q14,-18 2,-19 Q-8,-14 -18,-6 Z" fill="#b4562c" {...C} />
      <Rosto e={e} cy={cy} pele={pele} sobr="fina" corSobr="#7a3b1e" />
    </g>
  );
}

function Estudante({ e, pele }: Props) {
  const cy = -7;
  return (
    <g>
      {/* duas tranças */}
      <path d="M-16,-4 Q-24,14 -18,30 M16,-4 Q24,14 18,30" fill="none" stroke="#3a2418" strokeWidth={7} strokeLinecap="round" />
      <circle cx={-18} cy={31} r={3} fill="#e63946" stroke={T} strokeWidth={1.4} /><circle cx={18} cy={31} r={3} fill="#e63946" stroke={T} strokeWidth={1.4} />
      {pernas(5, 34, '#3d4a8a', '#c94f4f')}
      <path d="M-13,10 L-14,36 L14,36 L13,10 Q0,6 -13,10 Z" fill="#f6efe2" {...C} />
      <path d="M-13,18 h27 M-14,26 h28 M-14,33 h28" stroke="#e63946" strokeWidth={2.6} />
      {e === 'neutro' ? (
        // pilha de livros
        <g>
          <Braco de={[-12, 13]} ate={[-8, 26]} manga="#f6efe2" pele={pele} grosso={5} />
          <Braco de={[12, 13]} ate={[8, 26]} manga="#f6efe2" pele={pele} grosso={5} />
          <rect x={-10} y={23} width={20} height={5} rx={1} fill="#2f6fd6" stroke={T} strokeWidth={1.5} />
          <rect x={-9} y={18} width={18} height={5} rx={1} fill="#2f9e5a" stroke={T} strokeWidth={1.5} />
        </g>
      ) : <Bracos e={e} oe={[-12, 13]} od={[12, 13]} cy={cy} rx={18} manga="#f6efe2" pele={pele} grosso={5} />}
      {cabeca(cy, 18, 20, pele)}
      <path d="M-18,-4 Q-18,-28 0,-28 Q18,-28 18,-4 Q10,-16 0,-12 Q-10,-16 -18,-4 Z" fill="#3a2418" {...C} />
      <Rosto e={e} cy={cy} pele={pele} olhos="redondo" corSobr="#3a2418" />
    </g>
  );
}

function Grandalhao({ e, pele }: Props) {
  const cy = -9;
  return (
    <g>
      {pernas(9, 36, '#3b3b3b')}
      <path d="M-25,12 Q-29,30 -24,40 L24,40 Q29,30 25,12 Q0,4 -25,12 Z" fill="#c94f4f" {...C} />
      {/* avental de cozinheiro */}
      <path d="M-14,16 L14,16 L16,40 L-16,40 Z" fill="#fff" {...C} strokeWidth={2} />
      <path d="M-14,16 Q0,6 14,16" fill="none" stroke={T} strokeWidth={1.6} />
      {e === 'neutro' ? (
        <g>
          <Braco de={[-23, 15]} ate={[-26, 36]} manga="#c94f4f" pele={pele} grosso={9} />
          <Braco de={[23, 15]} ate={[28, 20]} manga="#c94f4f" pele={pele} grosso={9} />
          <path d="M28,18 L33,-4" stroke="#8b8794" strokeWidth={2.6} strokeLinecap="round" />
          <rect x={29} y={-12} width={9} height={8} rx={1.5} fill="#8b8794" stroke={T} strokeWidth={1.4} transform="rotate(14 33 -8)" />
        </g>
      ) : <Bracos e={e} oe={[-23, 15]} od={[23, 15]} cy={cy} rx={23} manga="#c94f4f" pele={pele} grosso={9} />}
      {/* cabeça quadrada com barba cheia */}
      <rect x={-22} y={cy - 21} width={44} height={42} rx={16} fill={pele} {...C} />
      <path d={`M-22,${cy} Q-23,${cy + 24} 0,${cy + 26} Q23,${cy + 24} 22,${cy} Q14,${cy + 8} 0,${cy + 8} Q-14,${cy + 8} -22,${cy} Z`} fill="#6b4a33" {...C} />
      <path d={`M-20,${cy - 10} Q-20,${cy - 24} 0,${cy - 24} Q20,${cy - 24} 20,${cy - 10} Q10,${cy - 16} 0,${cy - 16} Q-10,${cy - 16} -20,${cy - 10} Z`} fill="#6b4a33" {...C} />
      <Rosto e={e} cy={cy} pele={pele} olhos="pontinho" sobr="grossa" />
    </g>
  );
}

function Magrelo({ e, pele }: Props) {
  const cy = -15;
  const [me, md] = maos(e, [-10, 12], [10, 12], cy, 16);
  return (
    <g>
      {pernas(4, 34, '#2b2b2b')}
      <path d="M-10,8 L-11,36 L11,36 L10,8 Q0,4 -10,8 Z" fill="#f6efe2" {...C} />
      <path d="M-11,14 h21 M-11,20 h22 M-11,26 h22 M-11,32 h22" stroke="#2f6fd6" strokeWidth={2.2} />
      <Braco de={[-10, 12]} ate={me} manga="#f6efe2" pele={pele} grosso={4} />
      <Braco de={[10, 12]} ate={md} manga="#f6efe2" pele={pele} grosso={4} />
      {/* cachecol */}
      <path d="M-11,6 Q0,12 11,6 L11,10 Q0,16 -11,10 Z M5,10 L8,24 L3,24 Z" fill="#e63946" {...C} strokeWidth={1.8} />
      {cabeca(cy, 15, 23, pele)}
      {/* boina caída de lado */}
      <path d={`M-17,${cy - 15} Q-12,${cy - 32} 8,${cy - 30} Q24,${cy - 28} 22,${cy - 18} Q4,${cy - 22} -17,${cy - 15} Z`} fill="#1d1a18" {...C} />
      <circle cx={6} cy={cy - 31} r={2} fill="#1d1a18" />
      <Rosto e={e} cy={cy + 2} pele={pele} nariz="fino" bigode="bigodinho" />
    </g>
  );
}

function SenhorDeOculos({ e, pele }: Props) {
  const cy = -5;
  return (
    <g>
      {pernas(6, 36, '#5a5048')}
      <path d="M-15,10 L-16,38 L16,38 L15,10 Q0,6 -15,10 Z" fill="#f6efe2" {...C} />
      <path d="M-15,12 L-16,38 L-5,38 L0,18 L5,38 L16,38 L15,12 Q8,9 3,10 L0,16 L-3,10 Q-8,9 -15,12 Z" fill="#2f9e5a" {...C} strokeWidth={2} />
      <path d="M-6,10 L0,13 L-6,16 Z M6,10 L0,13 L6,16 Z" fill="#e63946" stroke={T} strokeWidth={1.4} />
      <Bracos e={e} oe={[-14, 14]} od={[14, 14]} cy={cy} rx={19} manga="#f6efe2" pele={pele} grosso={5} />
      {cabeca(cy, 19, 20, pele)}
      <path d={`M-19,${cy - 2} Q-20,${cy - 24} 2,${cy - 22} Q20,${cy - 22} 19,${cy - 4} Q12,${cy - 14} -4,${cy - 16} Q-12,${cy - 10} -19,${cy - 2} Z`} fill="#9a948d" {...C} />
      <Rosto e={e} cy={cy} pele={pele} olhos="garrafa" corSobr="#9a948d" />
    </g>
  );
}

// ---------- quem é quem ----------

const COMUNS: Record<string, (p: Props) => ReactNode> = {
  // ⚠️ nomes que aparecem juntos numa fase precisam de desenhos diferentes (Rita e Bia já foram iguais)
  Cida: Vovo, Ana: BlackPower, Bia: DonaDoCachorro, Rita: Estudante, Lia: Estudante,
  Davi: Grandalhao, Rui: Magrelo, Edu: SenhorDeOculos,
};
// Nome sem desenho próprio (Gil, Tião, Juca…): um dos desenhos do mesmo gênero.
// ⚠️ Antes sorteava entre todos: o Gil saía com o desenho da Ana. Só existem 7 desenhos de comum,
// por isso a fábrica de fases não põe mais de 7 comuns num prédio.
const RESERVA_ELAS = [Estudante, DonaDoCachorro, BlackPower, Vovo];
const RESERVA_ELES = [SenhorDeOculos, Grandalhao, Magrelo];
const reserva = (nome: string) => { const r = ELAS.has(nome) ? RESERVA_ELAS : RESERVA_ELES; return r[semente(nome) % r.length]; };

function escolher(v: Vizinho): (p: Props) => ReactNode {
  switch (v.tipo) {
    case 'fofoqueira': return Fofoqueira;
    case 'exagerado': return ELAS.has(v.nome) ? ExageradaEla : ExageradoEle;
    case 'docontra': return ELAS.has(v.nome) ? DoContraCetica : v.nome === 'Davi' ? DoContraRabugento : DoContraMoleque;
    case 'tumulo': return Padre;
    // a vítima nem sempre é o Seu Zé: quando é outra pessoa, ela aparece com o próprio desenho
    case 'assunto': return v.nome === SEU_ZE ? SeuZe : COMUNS[v.nome] ?? reserva(v.nome);
    default: return COMUNS[v.nome] ?? reserva(v.nome);
  }
}

export function Personagem({ v, expressao, x, y, olha = [0, 0] }: { v: Vizinho; expressao: Expressao; x: number; y: number; olha?: [number, number] }) {
  const Desenho = escolher(v);
  const pele = PELES[semente(v.nome) % PELES.length];
  return (
    <Olhar.Provider value={olha}>
    <g transform={`translate(${x} ${y})`} className="personagem" aria-hidden="true">
      {/* cada um respira e pisca no seu tempo, pra o prédio não parecer coreografado */}
      <g className="vivo" style={{ animationDelay: `${-(semente(v.nome) % 32) / 10}s` }}>
        <Desenho e={expressao} pele={pele} />
      </g>
      {expressao === 'chocado' && <path d="M24,-30 q3.5,6 0,8 q-3.5,-2 0,-8 Z" fill="#7cc4e8" stroke={T} strokeWidth={1.4} />}
    </g>
    </Olhar.Provider>
  );
}
