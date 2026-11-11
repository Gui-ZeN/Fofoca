import { createContext, useContext, type ReactNode } from 'react';
import type { Vizinho } from './motor';
import { ELAS, SEU_ZE } from './elenco';
import { ARTE, SPRITES, urlArte, type Sprite } from './arte';

// O elenco do Edifício Primavera (direção "Conforme o regulamento", Consulta 5).
// Cabeçudo de charge evoluído: cada um tem silhueta própria e um adereço que diz quem é;
// traço externo ~2,4 e interno ~1,3; massas chapadas; pele e roupa FIXAS por pessoa (antes a pele
// saía do nome sorteado e o elenco mudava de cara a cada abertura).
// Coordenadas: origem nos pés (0,0), y negativo pra cima; cabeça ~34 de largura, corpo ~2,5 cabeças.
// ⚠️ Prova de leitura: as silhuetas em preto têm que distinguir uns dos outros (bigode e chaveiro
// do Zé, cunha da Neide, regador da Cida, cachorro da Bia, cavaquinho do Rui, braços abertos dos exagerados).

export type Expressao = 'neutro' | 'ouvindo' | 'contando' | 'chocado' | 'bravo';
export const TINTA = '#283C36';
const E = { stroke: TINTA, strokeWidth: 2.4, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const };
const I = { stroke: TINTA, strokeWidth: 1.3, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const, fill: 'none' };
const BOCA = '#5E1F22';

// expressão e direção do olhar (de quem a pessoa conta), sem passar por todos os desenhos
const Jeito = createContext<{ e: Expressao; olhar: [number, number] }>({ e: 'neutro', olhar: [0, 0] });

// ---------- rosto: olhos, boca e sobrancelhas mudam com a expressão ----------

function Olho({ x, y, r = 3.4, base = [0, 0] as [number, number], lado = 1 }: { x: number; y: number; r?: number; base?: [number, number]; lado?: 1 | -1 }) {
  const { e, olhar } = useContext(Jeito);
  const susto = e === 'chocado', bravo = e === 'bravo';
  const px = x + base[0] + olhar[0] * 1.4, py = y + base[1] + olhar[1] * 1.2;
  return (
    <g className="olho">
      <ellipse cx={x} cy={y} rx={susto ? r + 1.2 : r} ry={susto ? r + 2 : bravo ? r * 0.75 : r + 0.8} fill="#FFFDF7" {...E} strokeWidth={1.5} />
      <circle cx={px} cy={py} r={susto ? 1.5 : 1.9} fill={TINTA} />
      {bravo && <path d={`M${x - r - 1},${y - r + lado * 1.5} L${x + r + 1},${y - r - lado * 1.5}`} {...I} strokeWidth={2} />}
    </g>
  );
}
// olho de pontinho (Seu Zé, Davi): no susto vira olho arregalado
function Ponto({ x, y, lado = 1 }: { x: number; y: number; lado?: 1 | -1 }) {
  const { e, olhar } = useContext(Jeito);
  if (e === 'chocado' || e === 'bravo') return <Olho x={x} y={y} r={3.6} lado={lado} />;
  return <circle className="olho" cx={x + olhar[0] * 1.5} cy={y + olhar[1] * 1.2} r={2.3} fill={TINTA} />;
}
function Boca({ x, y, w = 8, calma = 'sorriso', cor = TINTA }: { x: number; y: number; w?: number; calma?: 'sorriso' | 'reta'; cor?: string }) {
  const { e } = useContext(Jeito);
  const m = w / 2;
  if (e === 'chocado') return <ellipse cx={x} cy={y + 1} rx={3} ry={3.6} fill={BOCA} {...E} strokeWidth={1.4} />;
  if (e === 'bravo') {
    return (
      <g>
        <path d={`M${x - m - 1},${y - 1} h${w + 2} q0,8 ${-m - 1},8 q${-m - 1},0 ${-m - 1},-8 Z`} fill={BOCA} {...E} strokeWidth={1.4} />
        <path d={`M${x - m + 1},${y + 0.6} h${w - 2}`} stroke="#FFFDF7" strokeWidth={1.8} />
      </g>
    );
  }
  if (e === 'contando') return <path d={`M${x - m},${y - 1} q${m},7 ${w},0 Z`} fill={BOCA} {...E} strokeWidth={1.4} />;
  if (e === 'ouvindo') return <path d={`M${x - 2.5},${y} h5`} {...I} stroke={cor} />;
  return <path d={calma === 'reta' ? `M${x - m + 1},${y} h${w - 2}` : `M${x - m},${y - 1} q${m},3.5 ${w},0`} {...I} stroke={cor} />;
}
// sobrancelhas: quem tem fixa sempre mostra; os outros só aparecem no susto e na raiva
function Sobr({ x, y, fixa, grossa = 1.8, cor = TINTA }: { x: number; y: number; fixa?: boolean; grossa?: number; cor?: string }) {
  const { e } = useContext(Jeito);
  const s = { ...I, stroke: cor, strokeWidth: grossa };
  if (e === 'chocado') return <path d={`M${-x - 4},${y - 3} q4,-3 8,0 M${x - 4},${y - 3} q4,-3 8,0`} {...s} />;
  if (e === 'bravo') return <path d={`M${-x - 4},${y - 2} l8,3 M${x + 4},${y - 2} l-8,3`} {...s} strokeWidth={grossa + 0.6} />;
  if (e === 'contando' && fixa) return <path d={`M${-x - 4},${y - 1} q4,-2 8,0 M${x - 4},${y - 1} q4,-2 8,0`} {...s} />;
  return fixa ? <path d={`M${-x - 4},${y} h8 M${x - 4},${y} h8`} {...s} /> : null;
}

// ---------- peças do corpo ----------

// braço com contorno: traço de tinta por baixo e a manga por cima (chapado sem contorno parecia colado)
const Braco = ({ d, cor, w }: { d: string; cor: string; w: number }) => (
  <g fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} stroke={TINTA} strokeWidth={w + 4.4} />
    <path d={d} stroke={cor} strokeWidth={w} />
  </g>
);
const Mao = ({ x, y, pele, r = 3.6 }: { x: number; y: number; pele: string; r?: number }) => (
  <circle cx={x} cy={y} r={r} fill={pele} {...E} strokeWidth={1.6} />
);
const Sapatos = ({ dx = 8, cor = TINTA }: { dx?: number; cor?: string }) => (
  <g fill={cor} {...E}>
    <path d={`M${-dx - 7},-1 q0,-5 6,-5 h3 q2,0 2,3 v2 Z`} />
    <path d={`M${dx + 7},-1 q0,-5 -6,-5 h-3 q-2,0 -2,3 v2 Z`} />
  </g>
);

// ---------------- Seu Zé: síndico que transforma curiosidade em procedimento ----------------
function SeuZe() {
  const { e } = useContext(Jeito);
  const pele = '#C68A5E', camisa = '#334F46';
  const que = e === 'bravo' || e === 'chocado', ouve = e === 'ouvindo';
  return (
    <g transform={que ? 'rotate(-6)' : undefined}>
      <Sapatos />
      <g fill="#C9B994" {...E}>
        <rect x={-13} y={-22} width={11} height={18} rx={2} />
        <rect x={2} y={-22} width={11} height={18} rx={2} />
      </g>
      {/* tronco quase quadrado, postura reta */}
      <rect x={-19} y={-56} width={38} height={36} rx={5} fill={camisa} {...E} />
      <path d="M-7,-56 L0,-48 L7,-56" fill="#FBF4E5" {...E} strokeWidth={1.6} />
      <line x1={0} y1={-47} x2={0} y2={-22} {...I} stroke="#1F332C" />
      {/* chaveiro gigante na cintura (balança no susto): vazado, lê até em preto */}
      <g transform={que ? 'rotate(-35 19 -26)' : undefined}>
        <path d="M19,-26 v5" {...I} strokeWidth={1.6} />
        <circle cx={22} cy={-15} r={6.5} fill="none" stroke={TINTA} strokeWidth={4.2} />
        <circle cx={22} cy={-15} r={6.5} fill="none" stroke="#C9A24E" strokeWidth={1.8} />
        <g fill="#C9A24E" stroke={TINTA} strokeWidth={1.2}>
          <rect x={25} y={-11} width={3.5} height={11} rx={1} transform="rotate(-25 26 -11)" />
          <rect x={20} y={-9} width={3.5} height={12} rx={1} />
          <rect x={15} y={-11} width={3.5} height={10} rx={1} transform="rotate(25 17 -11)" />
        </g>
      </g>
      <g transform={ouve ? 'translate(4 -1) rotate(5 0 -56)' : undefined}>
        {/* cabeça retangular baixa */}
        <circle cx={-17} cy={-73} r={3.8} fill={pele} {...E} strokeWidth={1.8} />
        <circle cx={17} cy={-73} r={3.8} fill={pele} {...E} strokeWidth={1.8} />
        <rect x={-16} y={-90} width={32} height={33} rx={10} fill={pele} {...E} />
        <ellipse cx={-15} cy={-81} rx={5} ry={6.5} fill="#ECE7DC" {...E} strokeWidth={1.6} />
        <ellipse cx={15} cy={-81} rx={5} ry={6.5} fill="#ECE7DC" {...E} strokeWidth={1.6} />
        <Sobr x={8} y={-82} fixa grossa={2.8} />
        <Ponto x={-7} y={-75} lado={-1} />
        <Ponto x={7} y={-75} />
        <path d="M0,-74 q4,4 0,6" {...I} />
        {que && <ellipse cx={0} cy={-60} rx={5.5} ry={6} fill={BOCA} {...E} strokeWidth={1.6} />}
        {e === 'contando' && <ellipse cx={0} cy={-61} rx={4} ry={3} fill={BOCA} {...E} strokeWidth={1.4} />}
        {/* bigode mais largo que o rosto, pontas viradas: a marca dele na silhueta */}
        {que
          ? <path d="M-23,-72 q4,7 11,6 q6,-1 12,3 q6,-4 12,-3 q7,1 11,-6 q-2,10 -11,11 q-6,0 -12,-3 q-6,3 -12,3 q-9,-1 -11,-11 Z" fill="#3B3A36" {...E} strokeWidth={1.6} />
          : <path d="M-25,-69 q3,6 11,4 q7,-3 14,1 q7,-4 14,-1 q8,2 11,-4 q0,9 -11,9 q-7,0 -14,-3 q-7,3 -14,3 q-11,0 -11,-9 Z" fill="#3B3A36" {...E} strokeWidth={1.6} />}
      </g>
      {/* braços e prancheta: alinhada no peito; no susto, cai */}
      <g transform={que ? 'translate(2 16) rotate(28 4 -38)' : ouve ? 'translate(4 -2) rotate(6 4 -38)' : undefined}>
        <Braco d="M-18,-50 q-7,13 6,17" cor={camisa} w={8} />
        <g transform="translate(5 -40) rotate(-5)">
          <rect x={-11} y={-14} width={22} height={28} rx={2} fill="#A27B4E" {...E} />
          <rect x={-8} y={-10} width={16} height={21} fill="#FBF4E5" {...E} strokeWidth={1.2} />
          <path d="M-5,-5 h10 M-5,-1 h10 M-5,3 h7" {...I} strokeWidth={1} />
          <rect x={-5} y={-16} width={10} height={4} rx={1} fill="#9AA39C" {...E} strokeWidth={1.2} />
        </g>
        <Mao x={-12} y={-33} pele={pele} r={4.2} />
        <Braco d="M18,-50 q6,10 -3,15" cor={camisa} w={8} />
        <Mao x={14} y={-35} pele={pele} r={4.2} />
      </g>
      {que && <path d="M-26,-96 l-5,-5 M-22,-102 l-2,-7 M24,-98 l6,-4" {...I} strokeWidth={2.2} />}
    </g>
  );
}

// ---------------- Neide: curiosidade impossível de disfarçar ----------------
// sem bobes nem florzinhas (estereótipo apontado antes); cabelo alto em cunha, óculos de ponta,
// corpo em "C" já inclinado, caneca esmaltada: no peito, na orelha (ouvindo) ou na frente como álibi (descoberta)
function Neide() {
  const { e } = useContext(Jeito);
  const pele = '#E8B795', roupa = '#D8B75B', cabelo = '#6B3A2E';
  const ouve = e === 'ouvindo', que = e === 'chocado' || e === 'bravo';
  return (
    <g transform={ouve ? 'rotate(9)' : que ? 'rotate(-3)' : 'rotate(4)'}>
      <Sapatos dx={6} cor="#4A3B33" />
      <g fill="#2F4A40" {...E}>
        <rect x={-10} y={-20} width={8} height={16} rx={2} />
        <rect x={2} y={-20} width={8} height={16} rx={2} />
      </g>
      <path d="M-13,-54 C-23,-40 -21,-22 -13,-17 L13,-17 C17,-27 16,-42 7,-55 Z" fill={roupa} {...E} />
      <path d="M-6,-53 q6,5 12,-1" {...I} />
      <g transform={ouve ? 'translate(3 2) rotate(6 0 -56)' : undefined}>
        <path d="M-14,-86 C-15,-72 -8,-59 0,-57 C8,-59 15,-72 14,-86 C10,-94 -10,-94 -14,-86 Z" fill={pele} {...E} />
        <path d="M-16,-82 C-20,-93 -15,-103 -7,-108 L13,-116 C20,-119 25,-113 22,-106 L18,-86 C10,-94 -6,-94 -16,-82 Z" fill={cabelo} {...E} />
        <path d="M-6,-100 L12,-112 M-2,-94 L16,-104" {...I} stroke="#4A2820" />
        <Olho x={-6} y={-78} base={[1, 0]} lado={-1} />
        <Olho x={7} y={-78} base={[1, 0]} />
        {/* óculos de ponta levantada */}
        <path d="M-13,-80 q5,-5 12,-1 q-1,7 -6,7 q-6,0 -6,-6 Z M1,-81 q7,-4 12,1 q0,6 -6,6 q-5,0 -6,-7 Z" fill="none" {...E} strokeWidth={1.6} />
        <path d="M-13,-80 l-3,-4 M13,-80 l3,-4 M-1,-80 h2" {...I} strokeWidth={1.6} />
        <Sobr x={7} y={-86} />
        <Boca x={0} y={-65} />
      </g>
      {ouve ? (
        <>
          <Braco d="M8,-50 q18,-2 17,-22" cor={roupa} w={7} />
          <Caneca x={24} y={-80} rot={-80} />
          <Mao x={25} y={-71} pele={pele} r={3.8} />
          <Braco d="M-11,-48 q-6,12 2,18" cor={roupa} w={7} />
          <Mao x={-9} y={-30} pele={pele} />
        </>
      ) : que ? (
        <>
          <Braco d="M-11,-48 q-2,12 9,12 M11,-48 q2,12 -9,12" cor={roupa} w={7} />
          <Caneca x={0} y={-36} rot={0} />
          <Mao x={-6} y={-34} pele={pele} />
          <Mao x={6} y={-34} pele={pele} />
        </>
      ) : (
        <>
          <Braco d="M-11,-48 q-4,12 7,14 M11,-48 q2,10 -4,13" cor={roupa} w={7} />
          <Caneca x={1} y={-38} rot={0} />
          <Mao x={-4} y={-35} pele={pele} />
          <Mao x={8} y={-35} pele={pele} />
        </>
      )}
    </g>
  );
}
function Caneca({ x, y, rot }: { x: number; y: number; rot: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <path d="M5,-3 q6,0 6,5 q0,5 -6,5" fill="none" {...E} strokeWidth={1.8} />
      <rect x={-6} y={-6} width={12} height={13} rx={2} fill="#F5F1E8" {...E} strokeWidth={1.8} />
      <rect x={-6} y={-6} width={12} height={3} fill="#90ABA0" {...E} strokeWidth={1.4} />
    </g>
  );
}

// ---------------- Lu: a outra fofoqueira, a do treino (rabo de cavalo alto, faixa, halter) ----------------
function Lu() {
  const pele = '#C99070', roupa = '#D9785B';
  return (
    <g>
      <Sapatos dx={5} cor="#F5F1E8" />
      <g fill="#2F3B37" {...E}>
        <path d="M-9,-30 L-10,-4 h8 L-1,-30 Z" />
        <path d="M9,-30 L10,-4 h-8 L1,-30 Z" />
      </g>
      <path d="M-17,-62 L17,-62 L9,-28 L-9,-28 Z" fill={roupa} {...E} />
      <path d="M8,-94 q20,-8 23,8 q-3,11 -12,15 q4,-12 -11,-17 Z" fill="#3A2A22" {...E} />
      <ellipse cx={0} cy={-79} rx={14} ry={15} fill={pele} {...E} />
      <path d="M-14,-82 C-14,-97 14,-97 14,-82 C8,-89 -8,-89 -14,-82 Z" fill="#3A2A22" {...E} />
      <rect x={-15} y={-89} width={30} height={6} rx={2} fill="#FBF4E5" {...E} strokeWidth={1.6} />
      <Olho x={-5} y={-77} base={[1, 0]} lado={-1} />
      <Olho x={6} y={-77} base={[1, 0]} />
      <Sobr x={6} y={-81} />
      <Boca x={0} y={-67} />
      <Braco d="M-15,-58 q-9,10 -5,22" cor={pele} w={6} />
      <Braco d="M15,-58 q8,10 5,22" cor={pele} w={6} />
      <g transform="translate(21 -34)" {...E} strokeWidth={1.6}>
        <rect x={-9} y={-1.5} width={18} height={3} fill="#9AA39C" />
        <rect x={-12} y={-6} width={5} height={12} rx={1.5} fill="#3E4A46" />
        <rect x={7} y={-6} width={5} height={12} rx={1.5} fill="#3E4A46" />
      </g>
      <Mao x={-20} y={-35} pele={pele} r={3.4} />
    </g>
  );
}

// ---------------- Cida: moradora experiente, com interesses próprios (regador de bico curto) ----------------
function Cida() {
  const pele = '#8D5A3B', roupa = '#716483';
  return (
    <g>
      <Sapatos dx={6} cor="#3E3530" />
      <rect x={-9} y={-12} width={18} height={8} fill="#5A4E46" {...E} strokeWidth={1.6} />
      <path d="M0,-52 C-11,-50 -21,-28 -18,-12 L18,-12 C21,-28 11,-50 0,-52 Z" fill={roupa} {...E} />
      <path d="M-14,-24 q14,5 28,0" {...I} />
      <circle cx={0} cy={-68} r={15} fill={pele} {...E} />
      <path d="M-15,-70 C-16,-86 14,-88 15,-72 C8,-80 -6,-80 -15,-70 Z" fill="#E9E4DA" {...E} />
      <circle cx={-13} cy={-85} r={7} fill="#E9E4DA" {...E} />
      <Olho x={-6} y={-67} base={[1, 1.2]} lado={-1} />
      <Olho x={6} y={-67} base={[1, 1.2]} />
      <Sobr x={7} y={-74} fixa grossa={1.4} cor="#E9E4DA" />
      <Boca x={0} y={-58} w={6} cor="#FBF4E5" />
      <Braco d="M-14,-44 q-6,10 2,16" cor={roupa} w={7} />
      <Braco d="M14,-44 q8,8 6,16" cor={roupa} w={7} />
      <g transform="translate(22 -26)">
        <path d="M5,-4 l9,-6" stroke={TINTA} strokeWidth={4.5} strokeLinecap="round" />
        <path d="M5,-4 l9,-6" stroke="#90ABA0" strokeWidth={2.4} strokeLinecap="round" />
        <rect x={-7} y={-6} width={13} height={12} rx={3} fill="#90ABA0" {...E} strokeWidth={1.8} />
        <path d="M-5,-6 q1,-7 7,-6" fill="none" {...E} strokeWidth={1.6} />
      </g>
      <Mao x={20} y={-28} pele={pele} />
      <Mao x={-11} y={-28} pele={pele} />
    </g>
  );
}

// ---------------- Rita: universitária que estava tentando estudar (tranças, fone grande) ----------------
function Rita() {
  const pele = '#5E3A26', camiseta = '#2F6874';
  return (
    <g>
      <Sapatos dx={5} cor="#F5F1E8" />
      <g fill="#E8DFC9" {...E}>
        <rect x={-9} y={-24} width={8} height={20} rx={2} />
        <rect x={1} y={-24} width={8} height={20} rx={2} transform="rotate(-6 5 -4)" />
      </g>
      <rect x={-13} y={-60} width={26} height={38} rx={6} fill={camiseta} {...E} />
      <path d="M-13,-88 q-10,14 -7,40 q4,4 8,0 q-2,-22 4,-34 Z" fill="#2B1D18" {...E} />
      <path d="M13,-88 q9,12 6,28 q-4,3 -8,0 q2,-14 -3,-24 Z" fill="#2B1D18" {...E} />
      <ellipse cx={0} cy={-80} rx={13} ry={17} fill={pele} {...E} />
      <path d="M-13,-84 C-13,-100 13,-100 13,-84 C7,-92 -7,-92 -13,-84 Z" fill="#2B1D18" {...E} />
      <Olho x={-5} y={-80} r={3.6} base={[0, 1.4]} lado={-1} />
      <Olho x={6} y={-80} r={3.6} base={[0, 1.4]} />
      <Sobr x={6} y={-85} />
      <Boca x={0} y={-69} w={6} cor="#FBF4E5" />
      <path d="M-12,-60 q12,8 24,0" fill="none" {...E} strokeWidth={3.2} />
      <rect x={-17} y={-64} width={7} height={10} rx={3} fill="#E5B74F" {...E} strokeWidth={1.6} />
      <rect x={10} y={-64} width={7} height={10} rx={3} fill="#E5B74F" {...E} strokeWidth={1.6} />
      <Braco d="M-11,-50 q-3,8 5,12 M11,-50 q3,8 -5,12" cor={camiseta} w={6} />
      <g transform="translate(0 -38)">
        <path d="M0,-2 L-12,-6 L-12,6 L0,9 Z" fill="#FBF4E5" {...E} strokeWidth={1.6} />
        <path d="M0,-2 L12,-6 L12,6 L0,9 Z" fill="#FBF4E5" {...E} strokeWidth={1.6} />
        <path d="M-9,-2 l6,2 M-9,1 l6,2 M3,0 l6,-2 M3,3 l6,-2" {...I} strokeWidth={0.9} />
      </g>
      <Mao x={-7} y={-36} pele={pele} r={3.3} />
      <Mao x={7} y={-36} pele={pele} r={3.3} />
    </g>
  );
}

// ---------------- Davi: cozinheiro cuidadoso que ocupa bastante espaço (espátula larga) ----------------
function Davi() {
  const pele = '#A9714B', camisa = '#77877B';
  return (
    <g>
      <Sapatos dx={7} />
      <g fill="#3F4A45" {...E}>
        <rect x={-12} y={-18} width={10} height={14} rx={2} />
        <rect x={2} y={-18} width={10} height={14} rx={2} />
      </g>
      <path d="M-26,-55 L26,-55 L17,-16 L-17,-16 Z" fill={camisa} {...E} />
      <path d="M-12,-50 L12,-50 L14,-16 L-14,-16 Z" fill="#F3EAD6" {...E} strokeWidth={1.8} />
      <path d="M-12,-50 L-16,-55 M12,-50 L16,-55" {...I} />
      <rect x={-13} y={-84} width={26} height={27} rx={8} fill={pele} {...E} />
      <path d="M-13,-80 q0,-10 13,-10 q13,0 13,10 q-6,-4 -13,-4 q-7,0 -13,4 Z" fill="#2B2320" {...E} strokeWidth={1.8} />
      <path d="M-13,-70 h26 v8 q0,6 -6,6 h-14 q-6,0 -6,-6 Z" fill="#2B2320" {...E} strokeWidth={1.8} />
      <Boca x={0} y={-64} w={6} cor="#F3EAD6" />
      <Ponto x={-5} y={-74} lado={-1} />
      <Ponto x={5} y={-74} />
      <Sobr x={5} y={-78} fixa />
      <Braco d="M-24,-50 q-6,16 4,22" cor={camisa} w={9} />
      <Braco d="M24,-50 q8,6 4,18" cor={camisa} w={9} />
      <g transform="translate(28 -46)">
        <rect x={-1.6} y={-2} width={3.2} height={16} rx={1.4} fill="#8A5A3B" {...E} strokeWidth={1.4} />
        <rect x={-6} y={-16} width={12} height={14} rx={2} fill="#C3C9C2" {...E} strokeWidth={1.6} />
        <path d="M-3,-12 v6 M0,-12 v6 M3,-12 v6" {...I} strokeWidth={0.9} />
      </g>
      <Mao x={28} y={-30} pele={pele} r={4.4} />
      <Mao x={-20} y={-28} pele={pele} r={4.4} />
    </g>
  );
}

// ---------------- Ana: black power com argolas ----------------
function Ana() {
  const pele = '#7A4A2E', roupa = '#C4694A';
  return (
    <g>
      <Sapatos dx={5} cor="#3E3530" />
      <path d="M-8,-20 L-12,-4 h9 l2,-16 Z M8,-20 L12,-4 h-9 l-2,-16 Z" fill={pele} {...E} strokeWidth={1.8} />
      <path d="M-11,-54 L11,-54 L17,-18 L-17,-18 Z" fill={roupa} {...E} />
      <circle cx={0} cy={-77} r={20} fill="#2B1D18" {...E} />
      <ellipse cx={0} cy={-73} rx={13} ry={15} fill={pele} {...E} />
      <circle cx={-14} cy={-66} r={4} fill="none" stroke="#E5B74F" strokeWidth={2.4} />
      <circle cx={14} cy={-66} r={4} fill="none" stroke="#E5B74F" strokeWidth={2.4} />
      <Olho x={-5} y={-75} base={[-1, 0]} lado={-1} />
      <Olho x={6} y={-75} base={[-1, 0]} />
      <Sobr x={6} y={-80} />
      <Boca x={0} y={-64} cor="#FBF4E5" />
      <Braco d="M-10,-48 q-8,10 -2,18 M10,-48 q7,6 6,16" cor={roupa} w={6} />
      <Mao x={-12} y={-30} pele={pele} r={3.4} />
      <Mao x={16} y={-32} pele={pele} r={3.4} />
    </g>
  );
}

// ---------------- Edu: senhor comprido de óculos fundo de garrafa ----------------
function Edu() {
  const pele = '#B7845F', roupa = '#8A7A5C';
  return (
    <g transform="rotate(-3)">
      <Sapatos dx={5} />
      <g fill="#5A5A52" {...E}>
        <rect x={-8} y={-26} width={7} height={22} rx={2} />
        <rect x={1} y={-26} width={7} height={22} rx={2} />
      </g>
      <path d="M-11,-64 Q-14,-44 -11,-24 L11,-24 Q13,-44 9,-64 Z" fill={roupa} {...E} />
      <path d="M0,-62 V-26" {...I} />
      <circle cx={-3} cy={-50} r={1.3} fill={TINTA} /><circle cx={-3} cy={-42} r={1.3} fill={TINTA} />
      <ellipse cx={1} cy={-82} rx={13} ry={15} fill={pele} {...E} />
      <path d="M-12,-88 q-2,-8 4,-10 M12,-88 q3,-8 -3,-10" fill="none" stroke="#D9D6CE" strokeWidth={4} strokeLinecap="round" />
      <Olho x={-4} y={-82} r={4.6} lado={-1} />
      <Olho x={8} y={-82} r={4.6} />
      <path d="M1.5,-82 h1" {...I} strokeWidth={1.8} />
      <Sobr x={8} y={-89} cor="#9A948D" />
      <Boca x={2} y={-71} w={6} />
      <Braco d="M-10,-58 q-5,12 0,20" cor={roupa} w={6} />
      <Braco d="M10,-58 q4,10 0,18" cor={roupa} w={6} />
      <Mao x={-10} y={-37} pele={pele} r={3.2} />
      <Mao x={10} y={-39} pele={pele} r={3.2} />
    </g>
  );
}

// ---------------- Bia: chanel com franja reta e um salsicha na coleira ----------------
function Bia() {
  const pele = '#F0C9A8', roupa = '#B5562F';
  return (
    <g>
      <Sapatos dx={5} cor="#3E3530" />
      <g fill={pele} {...E} strokeWidth={1.8}>
        <rect x={-8} y={-22} width={6} height={18} rx={2} />
        <rect x={2} y={-22} width={6} height={18} rx={2} />
      </g>
      <path d="M-10,-58 L10,-58 L18,-20 L-18,-20 Z" fill={roupa} {...E} />
      <circle cx={0} cy={-75} r={14} fill={pele} {...E} />
      <path d="M-17,-64 L-17,-80 C-17,-97 17,-97 17,-80 L17,-64 L11,-64 L11,-79 L-11,-79 L-11,-64 Z" fill="#1F1B1A" {...E} />
      <Olho x={-5} y={-72} base={[-1.5, 1]} lado={-1} />
      <Olho x={6} y={-72} base={[-1.5, 1]} />
      <Boca x={0} y={-63} w={6} />
      <Braco d="M-9,-54 q-8,8 -6,18" cor={roupa} w={6} />
      <Braco d="M9,-54 q6,8 3,18" cor={roupa} w={6} />
      <Mao x={-15} y={-36} pele={pele} r={3.4} />
      <Mao x={12} y={-36} pele={pele} r={3.4} />
      {/* coleira e o salsicha, que também está prestando atenção */}
      <path d="M-15,-34 q-10,10 -20,20" {...I} strokeWidth={1.2} />
      <g transform="translate(-38 -2)">
        <rect x={-12} y={-14} width={22} height={9} rx={4.5} fill="#8A5A3B" {...E} strokeWidth={1.6} />
        <path d="M-10,-6 v5 M-4,-6 v5 M2,-6 v5 M7,-6 v5" {...I} strokeWidth={2} />
        <path d="M-12,-11 q-6,-4 -4,-9" fill="none" {...E} strokeWidth={1.6} />
        <ellipse cx={11} cy={-16} rx={6} ry={5} fill="#8A5A3B" {...E} strokeWidth={1.6} />
        <path d="M9,-19 q-2,8 -6,4 q2,-4 6,-4 Z" fill="#5E3A26" {...E} strokeWidth={1.2} />
        <circle cx={13} cy={-17} r={1.1} fill={TINTA} />
        <circle cx={17} cy={-15} r={1.3} fill={TINTA} />
      </g>
    </g>
  );
}

// ---------------- Lia: cachos curtos e o gato no colo (o gato também quer saber) ----------------
function Lia() {
  const pele = '#E0A67A', roupa = '#4F7F6B', gato = '#D9A04E';
  return (
    <g>
      <Sapatos dx={5} cor="#5A4636" />
      <g fill="#3E4A46" {...E}>
        <rect x={-9} y={-24} width={8} height={20} rx={2} />
        <rect x={1} y={-24} width={8} height={20} rx={2} />
      </g>
      <rect x={-14} y={-58} width={28} height={36} rx={7} fill={roupa} {...E} />
      {/* cachos em bolotas */}
      <g fill="#3A2A22" {...E}>
        <circle cx={-12} cy={-84} r={7} /><circle cx={12} cy={-84} r={7} /><circle cx={-6} cy={-92} r={7} /><circle cx={6} cy={-92} r={7} /><circle cx={-14} cy={-74} r={6} /><circle cx={14} cy={-74} r={6} />
      </g>
      <circle cx={0} cy={-76} r={13} fill={pele} {...E} />
      <path d="M-11,-82 q5,-7 11,-5 q6,-2 11,5 q-5,-3 -11,-2 q-6,-1 -11,2 Z" fill="#3A2A22" {...E} strokeWidth={1.4} />
      <Olho x={-5} y={-76} base={[1, 0.6]} lado={-1} />
      <Olho x={5} y={-76} base={[1, 0.6]} />
      <Sobr x={5} y={-81} />
      <Boca x={0} y={-67} w={6} />
      {/* o gato no colo, olhando pro mesmo lado */}
      <g transform="translate(2 -38)">
        <ellipse cx={0} cy={0} rx={13} ry={8} fill={gato} {...E} strokeWidth={1.8} />
        <path d="M12,-2 q9,-2 8,-12" fill="none" stroke={TINTA} strokeWidth={4.4} strokeLinecap="round" />
        <path d="M12,-2 q9,-2 8,-12" fill="none" stroke={gato} strokeWidth={2.2} strokeLinecap="round" />
        <circle cx={-12} cy={-6} r={7} fill={gato} {...E} strokeWidth={1.8} />
        <path d="M-18,-10 l1,-7 l5,4 M-6,-10 l-1,-7 l-5,4" fill={gato} {...E} strokeWidth={1.4} />
        <circle cx={-14} cy={-6} r={1} fill={TINTA} /><circle cx={-10} cy={-6} r={1} fill={TINTA} />
      </g>
      <Braco d="M-12,-52 q-6,10 0,16" cor={roupa} w={6} />
      <Braco d="M12,-52 q6,10 0,16" cor={roupa} w={6} />
      <Mao x={-11} y={-35} pele={pele} r={3.3} />
      <Mao x={11} y={-35} pele={pele} r={3.3} />
    </g>
  );
}

// ---------------- Rui: magro e comprido, chapéu e cavaquinho atravessado no peito ----------------
function Rui() {
  const pele = '#D9A57E', camisa = '#6E7FA3';
  return (
    <g>
      <Sapatos dx={5} cor="#5A4636" />
      <g fill="#3E4A46" {...E}>
        <rect x={-8} y={-28} width={7} height={24} rx={2} />
        <rect x={1} y={-28} width={7} height={24} rx={2} />
      </g>
      <rect x={-12} y={-64} width={24} height={38} rx={5} fill={camisa} {...E} />
      <ellipse cx={0} cy={-80} rx={12} ry={14} fill={pele} {...E} />
      {/* chapéu de aba curta */}
      <path d="M-19,-88 h38" {...E} strokeWidth={3.4} />
      <path d="M-11,-88 v-9 q0,-5 5,-5 h12 q5,0 5,5 v9 Z" fill="#3B3A36" {...E} />
      <path d="M-11,-91 h22" stroke="#C4694A" strokeWidth={2.4} />
      <Olho x={-4} y={-79} r={3.2} base={[0.6, 0]} lado={-1} />
      <Olho x={6} y={-79} r={3.2} base={[0.6, 0]} />
      <Sobr x={5} y={-84} />
      <path d="M-4,-71 q4,2 8,0" {...I} strokeWidth={1.8} stroke="#3B3A36" />
      <Boca x={0} y={-68} w={6} />
      {/* cavaquinho atravessado */}
      <g transform="translate(2 -44) rotate(-35)">
        <rect x={6} y={-2.5} width={26} height={5} rx={1.5} fill="#8A5A3B" {...E} strokeWidth={1.4} />
        <rect x={30} y={-4} width={7} height={8} rx={1.5} fill="#5A3C28" {...E} strokeWidth={1.4} />
        <path d="M-12,0 c0,-9 7,-10 10,-6 c3,-5 11,-4 11,6 c0,10 -8,11 -11,6 c-3,4 -10,3 -10,-6 Z" fill="#B98F62" {...E} strokeWidth={1.8} />
        <circle cx={1} cy={0} r={2.4} fill={TINTA} />
      </g>
      <Braco d="M-11,-58 q-8,8 -2,18" cor={camisa} w={6} />
      <Braco d="M11,-58 q6,4 2,12" cor={camisa} w={6} />
      <Mao x={-12} y={-40} pele={pele} r={3.3} />
      <Mao x={13} y={-46} pele={pele} r={3.3} />
    </g>
  );
}

// ---------------- Beto e Lúcia, os exagerados: braços sempre abertos ("deste tamanho!") ----------------
function Beto() {
  const pele = '#B5764C', camisa = '#D0643B';
  return (
    <g>
      <Sapatos dx={7} />
      <g fill="#3E4A46" {...E}>
        <rect x={-12} y={-18} width={10} height={14} rx={2} />
        <rect x={2} y={-18} width={10} height={14} rx={2} />
      </g>
      {/* barrigudo, camisa estampada */}
      <ellipse cx={0} cy={-38} rx={21} ry={22} fill={camisa} {...E} />
      <g fill="#FBF4E5"><circle cx={-9} cy={-46} r={2} /><circle cx={6} cy={-50} r={2} /><circle cx={10} cy={-34} r={2} /><circle cx={-6} cy={-30} r={2} /><circle cx={0} cy={-40} r={2} /></g>
      <Braco d="M-17,-50 q-12,-4 -17,-18" cor={camisa} w={8} />
      <Braco d="M17,-50 q12,-4 17,-18" cor={camisa} w={8} />
      <Mao x={-35} y={-70} pele={pele} r={4.4} />
      <Mao x={35} y={-70} pele={pele} r={4.4} />
      <circle cx={0} cy={-72} r={15} fill={pele} {...E} />
      <path d="M-15,-70 q-2,-8 4,-10 M15,-70 q2,-8 -4,-10" fill="none" stroke="#3B3A36" strokeWidth={4} strokeLinecap="round" />
      <path d="M-2,-87 q2,-6 6,-4" fill="none" {...E} strokeWidth={2} />
      <Olho x={-5} y={-73} r={3.4} lado={-1} />
      <Olho x={6} y={-73} r={3.4} />
      <Sobr x={6} y={-79} fixa />
      <Boca x={0} y={-63} w={10} />
    </g>
  );
}
function Lucia() {
  const pele = '#F2C6A0', roupa = '#B23D82';
  return (
    <g>
      <Sapatos dx={5} cor="#3E3530" />
      <g fill={pele} {...E} strokeWidth={1.8}>
        <rect x={-8} y={-22} width={6} height={18} rx={2} />
        <rect x={2} y={-22} width={6} height={18} rx={2} />
      </g>
      <path d="M-9,-58 L9,-58 L19,-20 L-19,-20 Z" fill={roupa} {...E} />
      <Braco d="M-9,-54 q-14,-2 -22,-16" cor={roupa} w={6} />
      <Braco d="M9,-54 q14,-2 22,-16" cor={roupa} w={6} />
      <Mao x={-32} y={-71} pele={pele} r={3.6} />
      <Mao x={32} y={-71} pele={pele} r={3.6} />
      {/* nuvem de cachos */}
      <path d="M-20,-70 q-8,-10 0,-18 q-2,-12 12,-14 q6,-10 16,-2 q12,-4 14,8 q10,6 2,16 q4,10 -6,12 L-14,-60 q-10,0 -6,-10 Z" fill="#B5452F" {...E} />
      <ellipse cx={0} cy={-74} rx={12} ry={14} fill={pele} {...E} />
      <path d="M-12,-80 q4,-8 12,-6 q8,-2 12,6 q-6,-3 -12,-1 q-6,-2 -12,1 Z" fill="#B5452F" {...E} strokeWidth={1.6} />
      <Olho x={-5} y={-74} r={3.3} lado={-1} />
      <Olho x={5} y={-74} r={3.3} />
      <Sobr x={5} y={-80} fixa grossa={1.4} />
      <Boca x={0} y={-65} w={9} />
    </g>
  );
}

// ---------------- Padre (só nas fases antigas de "Boca de túmulo") ----------------
function Padre() {
  const pele = '#E3B48E';
  return (
    <g>
      <Sapatos dx={6} />
      <path d="M-13,-58 L13,-58 L18,-4 L-18,-4 Z" fill="#2E3532" {...E} />
      <rect x={-4} y={-58} width={8} height={5} fill="#FBF4E5" {...E} strokeWidth={1.4} />
      <circle cx={0} cy={-74} r={14} fill={pele} {...E} />
      <path d="M-14,-72 q-1,-8 4,-10 M14,-72 q1,-8 -4,-10" fill="none" stroke="#9A948D" strokeWidth={4} strokeLinecap="round" />
      <Olho x={-5} y={-74} r={3.2} lado={-1} />
      <Olho x={5} y={-74} r={3.2} />
      <path d="M-11,-76 a4.5,4.5 0 1 0 9,0 a4.5,4.5 0 1 0 -9,0 M2,-76 a4.5,4.5 0 1 0 9,0 a4.5,4.5 0 1 0 -9,0" {...I} strokeWidth={1.4} />
      <Boca x={0} y={-65} w={6} calma="reta" />
      <Braco d="M-12,-52 q-4,12 8,16 M12,-52 q4,12 -8,16" cor="#2E3532" w={7} />
      <rect x={-7} y={-42} width={14} height={11} rx={1.5} fill="#7A3B2E" {...E} strokeWidth={1.6} />
    </g>
  );
}

// ---------- quem é quem ----------

const COMUNS: Record<string, () => ReactNode> = { Cida, Ana, Bia, Rita, Davi, Rui, Edu, Lia };
// nome sem desenho próprio: um do mesmo gênero (⚠️ antes sorteava entre todos e o Gil saía com o desenho da Ana)
const RESERVA_ELAS = [Rita, Ana, Bia, Cida];
const RESERVA_ELES = [Edu, Davi, Rui];
const semente = (s: string) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
const reserva = (nome: string) => { const r = ELAS.has(nome) ? RESERVA_ELAS : RESERVA_ELES; return r[semente(nome) % r.length]; };

function escolher(v: Vizinho): () => ReactNode {
  switch (v.tipo) {
    case 'fofoqueira': return v.nome === 'Lu' ? Lu : Neide;
    case 'exagerado': return ELAS.has(v.nome) ? Lucia : Beto;
    case 'tumulo': return Padre;
    // a vítima nem sempre é o Seu Zé: quando é outra pessoa, ela aparece com o próprio desenho
    case 'assunto': return v.nome === SEU_ZE ? SeuZe : COMUNS[v.nome] ?? reserva(v.nome);
    default: return COMUNS[v.nome] ?? reserva(v.nome);
  }
}

// Arte ilustrada: a pessoa em imagem ilustrada. Parado serve pra quieto e ouvindo; cochicho (mão em concha)
// pra quem está contando; susto pra quem acabou de ouvir; bravo pra vítima pega.
// A imagem vira pro lado de quem a pessoa conta (espelha quando precisa).
const POSE_ARTE: Record<Expressao, string[]> = {
  neutro: ['parado'], contando: ['cochicho', 'parado'], ouvindo: ['ouvindo', 'parado'], chocado: ['susto', 'parado'], bravo: ['bravo', 'susto', 'parado'],
};
const ALTURA_ARTE = 116; // ×1,08 do prédio = 125: cabe no cômodo (128 de parede)
function Ilustrado({ s, expressao, olha }: { s: Sprite; expressao: Expressao; olha: [number, number] }) {
  const p = POSE_ARTE[expressao].map((k) => s.poses[k]).find(Boolean) ?? Object.values(s.poses)[0];
  const h = ALTURA_ARTE * s.alt, w = (h * p.w) / p.h;
  const natural = p.olha ?? s.olha; // o Rui olha pra esquerda, mas cochicha pra direita
  const lado = olha[0] > 0.3 ? 1 : olha[0] < -0.3 ? -1 : natural;
  return (
    <g transform={lado === natural ? undefined : 'scale(-1 1)'}>
      <image href={urlArte(p.f)} x={-w / 2} y={-h} width={w} height={h} />
    </g>
  );
}

// Pré-carrega TODAS as poses de quem está na fase. ⚠️ Sem isso, cada pose só era buscada na hora em que
// aparecia: no celular (pela internet) o morador sumia por um instante ao trocar pra cochicho/susto/bravo.
const jaPedidas = new Set<string>();
export function precarregar(nomes: string[]) {
  if (!ARTE || typeof Image === 'undefined') return;
  for (const nome of nomes) {
    for (const p of Object.values(SPRITES[nome]?.poses ?? {})) {
      if (jaPedidas.has(p.f)) continue;
      jaPedidas.add(p.f);
      new Image().src = urlArte(p.f);
    }
  }
}

// (x, y) = onde os pés pisam
export function Personagem({ v, expressao, x, y, olha = [0, 0], escala = 1 }: {
  v: Vizinho; expressao: Expressao; x: number; y: number; olha?: [number, number]; escala?: number;
}) {
  // o Do Contra se chama Nonato (2026-11-11); as fases dele usam esse nome
  const sprite = ARTE ? SPRITES[v.nome] : undefined;
  if (sprite) {
    return (
      <g transform={`translate(${x} ${y}) scale(${escala})`} className="personagem" aria-hidden="true">
        <g className="vivo" style={{ animationDelay: `${-(semente(v.nome) % 32) / 10}s` }}>
          <Ilustrado s={sprite} expressao={expressao} olha={olha} />
        </g>
      </g>
    );
  }
  const Desenho = escolher(v);
  return (
    <Jeito.Provider value={{ e: expressao, olhar: olha }}>
      <g transform={`translate(${x} ${y}) scale(${escala})`} className="personagem" aria-hidden="true">
        {/* cada um respira e pisca no seu tempo, pra o prédio não parecer coreografado */}
        <g className="vivo" style={{ animationDelay: `${-(semente(v.nome) % 32) / 10}s` }}>
          <Desenho />
        </g>
        {expressao === 'chocado' && <path d="M22,-98 q3.5,6 0,8 q-3.5,-2 0,-8 Z" fill="#9CC9DE" stroke={TINTA} strokeWidth={1.4} />}
      </g>
    </Jeito.Provider>
  );
}

// Dona Glória: a samambaia que o Seu Zé trata como moradora (fundo, nunca joga)
export function DonaGloria() {
  const folhas = ['M0,-22 C-6,-40 -22,-46 -30,-40 C-20,-38 -10,-32 0,-22 Z', 'M0,-22 C6,-42 22,-48 30,-42 C20,-40 10,-32 0,-22 Z',
    'M0,-22 C-2,-46 6,-58 12,-60 C6,-48 4,-36 0,-22 Z', 'M0,-22 C-10,-30 -24,-28 -28,-20 C-18,-24 -8,-24 0,-22 Z',
    'M0,-22 C10,-30 24,-28 28,-20 C18,-24 8,-24 0,-22 Z'];
  return (
    <g>
      {folhas.map((d) => <path key={d} d={d} fill="#5E7D4A" {...E} strokeWidth={1.6} />)}
      <path d="M-11,-22 h22 l-3,20 h-16 Z" fill="#C4694A" {...E} />
      <path d="M-12,-22 h24" {...E} strokeWidth={3} />
    </g>
  );
}
