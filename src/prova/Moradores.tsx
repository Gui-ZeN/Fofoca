// Prova de direção (Consulta 5, "Conforme o regulamento"): o elenco redesenhado.
// Cabeçudo de charge evoluído: silhueta própria, um adereço que diz quem é, corpo atuando.
// Traço externo ~2,4 e interno ~1,3; massas chapadas; pele fixa por identidade.
// Coordenadas: origem nos pés (0,0), y negativo pra cima; cabeça ~34 de largura, corpo ~2,5 cabeças.

import type { ReactNode } from 'react';

export const TINTA = '#283C36';
const E = { stroke: TINTA, strokeWidth: 2.4, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const };
const I = { stroke: TINTA, strokeWidth: 1.3, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const, fill: 'none' };

export type Pose = 'espera' | 'ouvindo' | 'que';

// olho com branco e pupila (olhar: deslocamento da pupila)
const Olho = ({ x, y, olhar = [0, 0], r = 4.2, arregalado = false }: { x: number; y: number; olhar?: [number, number]; r?: number; arregalado?: boolean }) => (
  <g>
    <ellipse cx={x} cy={y} rx={arregalado ? r + 1.2 : r} ry={arregalado ? r + 2 : r + 0.8} fill="#FFFDF7" {...E} strokeWidth={1.5} />
    <circle cx={x + olhar[0]} cy={y + olhar[1]} r={arregalado ? 1.7 : 2.1} fill={TINTA} />
  </g>
);
// braço com contorno: traço de tinta por baixo e a manga por cima (chapado sem contorno parecia colado)
const Braco = ({ d, cor, w }: { d: string; cor: string; w: number }) => (
  <g fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} stroke={TINTA} strokeWidth={w + 4.4} />
    <path d={d} stroke={cor} strokeWidth={w} />
  </g>
);
const Sapatos = ({ dx = 8, cor = TINTA }: { dx?: number; cor?: string }) => (
  <g fill={cor} {...E}>
    <path d={`M${-dx - 7},-1 q0,-5 6,-5 h3 q2,0 2,3 v2 Z`} />
    <path d={`M${dx + 7},-1 q0,-5 -6,-5 h-3 q-2,0 -2,3 v2 Z`} />
  </g>
);

// ---------------- Seu Zé: síndico que transforma curiosidade em procedimento ----------------
export function SeuZe({ pose = 'espera' }: { pose?: Pose }) {
  const pele = '#C68A5E', camisa = '#334F46';
  const que = pose === 'que', ouve = pose === 'ouvindo';
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
        {/* sobrancelhas grossas: retas na ordem, pra cima no susto */}
        {que
          ? <path d="M-12,-86 l8,-3 M4,-89 l8,3" {...I} strokeWidth={2.8} />
          : <path d="M-12,-81 h8 M4,-81 h8" {...I} strokeWidth={2.8} />}
        {que ? (
          <>
            <Olho x={-7} y={-75} arregalado />
            <Olho x={7} y={-75} arregalado />
          </>
        ) : (
          <>
            <circle cx={ouve ? -5 : -7} cy={-75} r={2.3} fill={TINTA} />
            <circle cx={ouve ? 9 : 7} cy={-75} r={2.3} fill={TINTA} />
          </>
        )}
        <path d="M0,-74 q4,4 0,6" {...I} />
        {que && <ellipse cx={0} cy={-60} rx={5.5} ry={6} fill="#5E1F22" {...E} strokeWidth={1.6} />}
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
        <circle cx={-12} cy={-33} r={4.2} fill={pele} {...E} strokeWidth={1.8} />
        <Braco d="M18,-50 q6,10 -3,15" cor={camisa} w={8} />
        <circle cx={14} cy={-35} r={4.2} fill={pele} {...E} strokeWidth={1.8} />
      </g>
      {que && <path d="M-26,-96 l-5,-5 M-22,-102 l-2,-7 M24,-98 l6,-4" {...I} strokeWidth={2.2} />}
    </g>
  );
}

// ---------------- Neide: curiosidade impossível de disfarçar ----------------
// sem bobes nem florzinhas; cabelo alto em cunha, óculos de ponta, corpo em "C", caneca esmaltada
export function Neide({ pose = 'espera', lado = 1 }: { pose?: Pose; lado?: 1 | -1 }) {
  const pele = '#E8B795', roupa = '#D8B75B', cabelo = '#6B3A2E';
  const ouve = pose === 'ouvindo', que = pose === 'que';
  const olhar: [number, number] = ouve ? [2 * lado, 0] : que ? [0, -0.5] : [1, 0];
  return (
    <g transform={`scale(${lado} 1)`}>
      <g transform={ouve ? 'rotate(9)' : que ? 'rotate(-3)' : 'rotate(4)'}>
        <Sapatos dx={6} cor="#4A3B33" />
        <g fill="#2F4A40" {...E}>
          <rect x={-10} y={-20} width={8} height={16} rx={2} />
          <rect x={2} y={-20} width={8} height={16} rx={2} />
        </g>
        {/* corpo em "C": já inclinado pro lado da conversa */}
        <path d="M-13,-54 C-23,-40 -21,-22 -13,-17 L13,-17 C17,-27 16,-42 7,-55 Z" fill={roupa} {...E} />
        <path d="M-6,-53 q6,5 12,-1" {...I} />
        <g transform={ouve ? 'translate(3 2) rotate(6 0 -56)' : undefined}>
          {/* rosto afunilado */}
          <path d="M-14,-86 C-15,-72 -8,-59 0,-57 C8,-59 15,-72 14,-86 C10,-94 -10,-94 -14,-86 Z" fill={pele} {...E} />
          {/* cabelo alto em cunha, subindo pra um lado */}
          <path d="M-16,-82 C-20,-93 -15,-103 -7,-108 L13,-116 C20,-119 25,-113 22,-106 L18,-86 C10,-94 -6,-94 -16,-82 Z" fill={cabelo} {...E} />
          <path d="M-6,-100 L12,-112 M-2,-94 L16,-104" {...I} stroke="#4A2820" />
          <Olho x={-6} y={-78} olhar={olhar} r={3.4} arregalado={que} />
          <Olho x={7} y={-78} olhar={olhar} r={3.4} arregalado={que} />
          {/* óculos de ponta levantada */}
          <path d="M-13,-80 q5,-5 12,-1 q-1,7 -6,7 q-6,0 -6,-6 Z M1,-81 q7,-4 12,1 q0,6 -6,6 q-5,0 -6,-7 Z" fill="none" {...E} strokeWidth={1.6} />
          <path d="M-13,-80 l-3,-4 M13,-80 l3,-4 M-1,-80 h2" {...I} strokeWidth={1.6} />
          {que
            ? <ellipse cx={0} cy={-64} rx={3} ry={2.6} fill="#5E1F22" {...E} strokeWidth={1.3} />
            : <path d={ouve ? 'M-3,-64 q3,1.5 6,0' : 'M-4,-65 q4,3 8,-1'} {...I} />}
          {que && <path d="M-11,-88 q4,-3 7,-1 M4,-89 q4,-2 7,1" {...I} strokeWidth={1.8} />}
        </g>
        {/* caneca: no peito (espera), na orelha (ouvindo), na frente como álibi (descoberta) */}
        {ouve ? (
          <>
            <Braco d="M8,-50 q18,-2 17,-22" cor={roupa} w={7} />
            <Caneca x={24} y={-80} rot={-80} />
            <circle cx={25} cy={-71} r={3.8} fill={pele} {...E} strokeWidth={1.6} />
            <Braco d="M-11,-48 q-6,12 2,18" cor={roupa} w={7} />
            <circle cx={-9} cy={-30} r={3.6} fill={pele} {...E} strokeWidth={1.6} />
          </>
        ) : que ? (
          <>
            <Braco d="M-11,-48 q-2,12 9,12 M11,-48 q2,12 -9,12" cor={roupa} w={7} />
            <Caneca x={0} y={-36} rot={0} />
            <circle cx={-6} cy={-34} r={3.6} fill={pele} {...E} strokeWidth={1.6} />
            <circle cx={6} cy={-34} r={3.6} fill={pele} {...E} strokeWidth={1.6} />
          </>
        ) : (
          <>
            <Braco d="M-11,-48 q-4,12 7,14 M11,-48 q2,10 -4,13" cor={roupa} w={7} />
            <Caneca x={1} y={-38} rot={0} />
            <circle cx={-4} cy={-35} r={3.6} fill={pele} {...E} strokeWidth={1.6} />
            <circle cx={8} cy={-35} r={3.6} fill={pele} {...E} strokeWidth={1.6} />
          </>
        )}
      </g>
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

// ---------------- Cida: moradora experiente, com interesses próprios ----------------
export function Cida() {
  const pele = '#8D5A3B', roupa = '#716483';
  return (
    <g>
      <Sapatos dx={6} cor="#3E3530" />
      <rect x={-9} y={-12} width={18} height={8} fill="#5A4E46" {...E} strokeWidth={1.6} />
      {/* corpo baixo em gota */}
      <path d="M0,-52 C-11,-50 -21,-28 -18,-12 L18,-12 C21,-28 11,-50 0,-52 Z" fill={roupa} {...E} />
      <path d="M-14,-24 q14,5 28,0" {...I} />
      <circle cx={0} cy={-68} r={15} fill={pele} {...E} />
      {/* cabelo claro e um coque só, de lado */}
      <path d="M-15,-70 C-16,-86 14,-88 15,-72 C8,-80 -6,-80 -15,-70 Z" fill="#E9E4DA" {...E} />
      <circle cx={-13} cy={-85} r={7} fill="#E9E4DA" {...E} />
      <Olho x={-6} y={-67} olhar={[1, 1.4]} r={3.4} />
      <Olho x={6} y={-67} olhar={[1, 1.4]} r={3.4} />
      <path d="M-10,-74 q3,-2 6,0 M4,-74 q3,-2 6,0" {...I} />
      <path d="M-3,-58 q3,2 6,0" {...I} />
      {/* regador de bico curto */}
      <Braco d="M-14,-44 q-6,10 2,16" cor={roupa} w={7} />
      <Braco d="M14,-44 q8,8 6,16" cor={roupa} w={7} />
      <g transform="translate(22 -26)">
        <path d="M5,-4 l9,-6" stroke={TINTA} strokeWidth={4.5} strokeLinecap="round" />
        <path d="M5,-4 l9,-6" stroke="#90ABA0" strokeWidth={2.4} strokeLinecap="round" />
        <rect x={-7} y={-6} width={13} height={12} rx={3} fill="#90ABA0" {...E} strokeWidth={1.8} />
        <path d="M-5,-6 q1,-7 7,-6" fill="none" {...E} strokeWidth={1.6} />
      </g>
      <circle cx={20} cy={-28} r={3.6} fill={pele} {...E} strokeWidth={1.6} />
      <circle cx={-11} cy={-28} r={3.6} fill={pele} {...E} strokeWidth={1.6} />
    </g>
  );
}

// ---------------- Rita: universitária que estava tentando estudar ----------------
export function Rita() {
  const pele = '#5E3A26', camiseta = '#2F6874';
  return (
    <g>
      <Sapatos dx={5} cor="#F5F1E8" />
      <g fill="#E8DFC9" {...E}>
        <rect x={-9} y={-24} width={8} height={20} rx={2} />
        <rect x={1} y={-24} width={8} height={20} rx={2} transform="rotate(-6 5 -4)" />
      </g>
      {/* corpo alongado */}
      <rect x={-13} y={-60} width={26} height={38} rx={6} fill={camiseta} {...E} />
      {/* tranças grossas, caimentos diferentes */}
      <path d="M-13,-88 q-10,14 -7,40 q4,4 8,0 q-2,-22 4,-34 Z" fill="#2B1D18" {...E} />
      <path d="M13,-88 q9,12 6,28 q-4,3 -8,0 q2,-14 -3,-24 Z" fill="#2B1D18" {...E} />
      <ellipse cx={0} cy={-80} rx={13} ry={17} fill={pele} {...E} />
      <path d="M-13,-84 C-13,-100 13,-100 13,-84 C7,-92 -7,-92 -13,-84 Z" fill="#2B1D18" {...E} />
      <Olho x={-5} y={-80} olhar={[0, 1.6]} r={3.6} />
      <Olho x={6} y={-80} olhar={[0, 1.6]} r={3.6} />
      <path d="M-3,-69 q3,1.5 6,0" {...I} />
      {/* fone grande no pescoço */}
      <path d="M-12,-60 q12,8 24,0" fill="none" {...E} strokeWidth={3.2} />
      <rect x={-17} y={-64} width={7} height={10} rx={3} fill="#E5B74F" {...E} strokeWidth={1.6} />
      <rect x={10} y={-64} width={7} height={10} rx={3} fill="#E5B74F" {...E} strokeWidth={1.6} />
      {/* livro aberto, uma página marcada com o dedo */}
      <Braco d="M-11,-50 q-3,8 5,12 M11,-50 q3,8 -5,12" cor={camiseta} w={6} />
      <g transform="translate(0 -38)">
        <path d="M0,-2 L-12,-6 L-12,6 L0,9 Z" fill="#FBF4E5" {...E} strokeWidth={1.6} />
        <path d="M0,-2 L12,-6 L12,6 L0,9 Z" fill="#FBF4E5" {...E} strokeWidth={1.6} />
        <path d="M-9,-2 l6,2 M-9,1 l6,2 M3,0 l6,-2 M3,3 l6,-2" {...I} strokeWidth={0.9} />
      </g>
      <circle cx={-7} cy={-36} r={3.3} fill={pele} {...E} strokeWidth={1.5} />
      <circle cx={7} cy={-36} r={3.3} fill={pele} {...E} strokeWidth={1.5} />
    </g>
  );
}

// ---------------- Davi: cozinheiro cuidadoso que ocupa bastante espaço ----------------
export function Davi() {
  const pele = '#A9714B', camisa = '#77877B';
  return (
    <g>
      <Sapatos dx={7} />
      <g fill="#3F4A45" {...E}>
        <rect x={-12} y={-18} width={10} height={14} rx={2} />
        <rect x={2} y={-18} width={10} height={14} rx={2} />
      </g>
      {/* ombros largos em trapézio */}
      <path d="M-26,-55 L26,-55 L17,-16 L-17,-16 Z" fill={camisa} {...E} />
      <path d="M-12,-50 L12,-50 L14,-16 L-14,-16 Z" fill="#F3EAD6" {...E} strokeWidth={1.8} />
      <path d="M-12,-50 L-16,-55 M12,-50 L16,-55" {...I} />
      {/* cabeça menor; barba em massa quadrada */}
      <rect x={-13} y={-84} width={26} height={27} rx={8} fill={pele} {...E} />
      <path d="M-13,-80 q0,-10 13,-10 q13,0 13,10 q-6,-4 -13,-4 q-7,0 -13,4 Z" fill="#2B2320" {...E} strokeWidth={1.8} />
      <path d="M-13,-70 h26 v8 q0,6 -6,6 h-14 q-6,0 -6,-6 Z" fill="#2B2320" {...E} strokeWidth={1.8} />
      <path d="M-3,-64 q3,1.5 6,0" stroke="#F3EAD6" strokeWidth={1.3} fill="none" strokeLinecap="round" />
      <circle cx={-5} cy={-74} r={2} fill={TINTA} />
      <circle cx={5} cy={-74} r={2} fill={TINTA} />
      <path d="M-8,-78 h5 M3,-78 h5" {...I} strokeWidth={1.8} />
      {/* espátula larga, perfeitamente vertical */}
      <Braco d="M-24,-50 q-6,16 4,22" cor={camisa} w={9} />
      <Braco d="M24,-50 q8,6 4,18" cor={camisa} w={9} />
      <g transform="translate(28 -46)">
        <rect x={-1.6} y={-2} width={3.2} height={16} rx={1.4} fill="#8A5A3B" {...E} strokeWidth={1.4} />
        <rect x={-6} y={-16} width={12} height={14} rx={2} fill="#C3C9C2" {...E} strokeWidth={1.6} />
        <path d="M-3,-12 v6 M0,-12 v6 M3,-12 v6" {...I} strokeWidth={0.9} />
      </g>
      <circle cx={28} cy={-30} r={4.4} fill={pele} {...E} strokeWidth={1.8} />
      <circle cx={-20} cy={-28} r={4.4} fill={pele} {...E} strokeWidth={1.8} />
    </g>
  );
}

// ---------------- Ana e Edu (vizinhos de apoio, no mesmo sistema) ----------------
export function Ana() {
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
      <Olho x={-5} y={-75} olhar={[-1, 0]} r={3.4} />
      <Olho x={6} y={-75} olhar={[-1, 0]} r={3.4} />
      <path d="M-4,-63 q4,3 8,0" {...I} />
      <Braco d="M-10,-48 q-8,10 -2,18 M10,-48 q7,6 6,16" cor={roupa} w={6} />
      <circle cx={-12} cy={-30} r={3.4} fill={pele} {...E} strokeWidth={1.5} />
      <circle cx={16} cy={-32} r={3.4} fill={pele} {...E} strokeWidth={1.5} />
    </g>
  );
}
export function Edu() {
  const pele = '#B7845F', roupa = '#8A7A5C';
  return (
    <g transform="rotate(-3)">
      <Sapatos dx={5} />
      <g fill="#5A5A52" {...E}>
        <rect x={-8} y={-26} width={7} height={22} rx={2} />
        <rect x={1} y={-26} width={7} height={22} rx={2} />
      </g>
      {/* comprido e um pouco curvado */}
      <path d="M-11,-64 Q-14,-44 -11,-24 L11,-24 Q13,-44 9,-64 Z" fill={roupa} {...E} />
      <path d="M0,-62 V-26" {...I} />
      <circle cx={-3} cy={-50} r={1.3} fill={TINTA} /><circle cx={-3} cy={-42} r={1.3} fill={TINTA} />
      <ellipse cx={1} cy={-82} rx={13} ry={15} fill={pele} {...E} />
      <path d="M-12,-88 q-2,-8 4,-10 M12,-88 q3,-8 -3,-10" fill="none" stroke="#D9D6CE" strokeWidth={4} strokeLinecap="round" />
      <circle cx={-4} cy={-82} r={5.5} fill="#FFFDF7" {...E} strokeWidth={1.8} />
      <circle cx={8} cy={-82} r={5.5} fill="#FFFDF7" {...E} strokeWidth={1.8} />
      <path d="M1.5,-82 h1" {...I} strokeWidth={1.8} />
      <circle cx={-3} cy={-82} r={1.8} fill={TINTA} /><circle cx={9} cy={-82} r={1.8} fill={TINTA} />
      <path d="M-1,-71 q3,1.5 6,0" {...I} />
      <Braco d="M-10,-58 q-5,12 0,20" cor={roupa} w={6} />
      <Braco d="M10,-58 q4,10 0,18" cor={roupa} w={6} />
      <circle cx={-10} cy={-37} r={3.2} fill={pele} {...E} strokeWidth={1.5} />
      <circle cx={10} cy={-39} r={3.2} fill={pele} {...E} strokeWidth={1.5} />
    </g>
  );
}

// ---------------- Lu: a vizinha do treino (rabo de cavalo alto, faixa, halter) ----------------
export function Lu() {
  const pele = '#C99070', roupa = '#D9785B';
  return (
    <g>
      <Sapatos dx={5} cor="#F5F1E8" />
      <g fill="#2F3B37" {...E}>
        <path d="M-9,-30 L-10,-4 h8 L-1,-30 Z" />
        <path d="M9,-30 L10,-4 h-8 L1,-30 Z" />
      </g>
      {/* tronco em V: ombro largo, cintura fina */}
      <path d="M-17,-62 L17,-62 L9,-28 L-9,-28 Z" fill={roupa} {...E} />
      <path d="M8,-94 q20,-8 23,8 q-3,11 -12,15 q4,-12 -11,-17 Z" fill="#3A2A22" {...E} />
      <ellipse cx={0} cy={-79} rx={14} ry={15} fill={pele} {...E} />
      <path d="M-14,-82 C-14,-97 14,-97 14,-82 C8,-89 -8,-89 -14,-82 Z" fill="#3A2A22" {...E} />
      <rect x={-15} y={-89} width={30} height={6} rx={2} fill="#FBF4E5" {...E} strokeWidth={1.6} />
      <Olho x={-5} y={-77} olhar={[1, 0]} r={3.4} />
      <Olho x={6} y={-77} olhar={[1, 0]} r={3.4} />
      <path d="M-4,-67 q4,3 8,0" {...I} />
      <Braco d="M-15,-58 q-9,10 -5,22" cor={pele} w={6} />
      <Braco d="M15,-58 q8,10 5,22" cor={pele} w={6} />
      {/* halter */}
      <g transform="translate(21 -34)" {...E} strokeWidth={1.6}>
        <rect x={-9} y={-1.5} width={18} height={3} fill="#9AA39C" />
        <rect x={-12} y={-6} width={5} height={12} rx={1.5} fill="#3E4A46" />
        <rect x={7} y={-6} width={5} height={12} rx={1.5} fill="#3E4A46" />
      </g>
      <circle cx={-20} cy={-35} r={3.4} fill={pele} {...E} strokeWidth={1.5} />
    </g>
  );
}

// ---------------- Lia: chanel com franja reta e um cachorro salsicha na coleira ----------------
export function Lia() {
  const pele = '#F0C9A8', roupa = '#B5562F';
  return (
    <g>
      <Sapatos dx={5} cor="#3E3530" />
      <g fill={pele} {...E} strokeWidth={1.8}>
        <rect x={-8} y={-22} width={6} height={18} rx={2} />
        <rect x={2} y={-22} width={6} height={18} rx={2} />
      </g>
      {/* vestido em A */}
      <path d="M-10,-58 L10,-58 L18,-20 L-18,-20 Z" fill={roupa} {...E} />
      <circle cx={0} cy={-75} r={14} fill={pele} {...E} />
      {/* chanel com franja reta */}
      <path d="M-17,-64 L-17,-80 C-17,-97 17,-97 17,-80 L17,-64 L11,-64 L11,-79 L-11,-79 L-11,-64 Z" fill="#1F1B1A" {...E} />
      <Olho x={-5} y={-72} olhar={[-1.5, 1]} r={3.4} />
      <Olho x={6} y={-72} olhar={[-1.5, 1]} r={3.4} />
      <path d="M-3,-63 q3,2 6,0" {...I} />
      <Braco d="M-9,-54 q-8,8 -6,18" cor={roupa} w={6} />
      <Braco d="M9,-54 q6,8 3,18" cor={roupa} w={6} />
      <circle cx={-15} cy={-36} r={3.4} fill={pele} {...E} strokeWidth={1.5} />
      <circle cx={12} cy={-36} r={3.4} fill={pele} {...E} strokeWidth={1.5} />
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

// ---------------- Dona Glória: a samambaia (recorrente, de fundo) ----------------
export function DonaGloria() {
  const folha = (d: string, k: number) => <path key={k} d={d} fill="#5E7D4A" {...E} strokeWidth={1.6} />;
  return (
    <g>
      {['M0,-22 C-6,-40 -22,-46 -30,-40 C-20,-38 -10,-32 0,-22 Z', 'M0,-22 C6,-42 22,-48 30,-42 C20,-40 10,-32 0,-22 Z',
        'M0,-22 C-2,-46 6,-58 12,-60 C6,-48 4,-36 0,-22 Z', 'M0,-22 C-10,-30 -24,-28 -28,-20 C-18,-24 -8,-24 0,-22 Z',
        'M0,-22 C10,-30 24,-28 28,-20 C18,-24 8,-24 0,-22 Z'].map(folha)}
      <path d="M-11,-22 h22 l-3,20 h-16 Z" fill="#C4694A" {...E} />
      <path d="M-12,-22 h24" {...E} strokeWidth={3} />
    </g>
  );
}

// silhueta: o mesmo desenho, tudo em tinta (teste de leitura sem cor)
export const Silhueta = ({ children }: { children: ReactNode }) => (
  <g filter="url(#silhueta)">{children}</g>
);
