// Apartamentos sem morador: luz apagada, janela de noite e uma cena que conta por que está vazio.

const T = '#2b2622';
const C = { stroke: T, strokeWidth: 2, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const };

function Janela({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <rect x={x} y={y} width={34} height={28} rx={2} fill="#26355e" {...C} />
      <circle cx={x + 24} cy={y + 8} r={4} fill="#f2e6c9" />
      <circle cx={x + 26} cy={y + 7} r={3.4} fill="#26355e" />
      <path d={`M${x + 17},${y} V${y + 28} M${x},${y + 14} H${x + 34}`} stroke={T} strokeWidth={2} />
      {/* cortina meio fechada */}
      <path d={`M${x - 3},${y - 3} Q${x + 6},${y + 14} ${x + 2},${y + 31} L${x - 3},${y + 31} Z`} fill="#7d6b8f" {...C} strokeWidth={1.6} />
      <path d={`M${x + 37},${y - 3} Q${x + 28},${y + 14} ${x + 32},${y + 31} L${x + 37},${y + 31} Z`} fill="#7d6b8f" {...C} strokeWidth={1.6} />
    </g>
  );
}

const caixa = (x: number, y: number, w: number, h: number) => (
  <g key={`${x}${y}`}>
    <rect x={x} y={y} width={w} height={h} rx={1.5} fill="#c9935a" {...C} />
    <path d={`M${x + w / 2},${y} V${y + h}`} stroke="#e8d2a8" strokeWidth={4} />
    <path d={`M${x + 4},${y + h - 6} h${w / 3}`} stroke="#7a5230" strokeWidth={1.6} />
  </g>
);

export function Vazio({ x0, y0, cena }: { x0: number; y0: number; cena: number }) {
  const chao = y0 + 112;
  switch (cena % 4) {
    case 0: // aluga-se: placa com a chave pendurada
      return (
        <g>
          <Janela x={x0 + 14} y={y0 + 22} />
          <path d={`M${x0 + 86},${y0 + 20} L${x0 + 80},${y0 + 36} M${x0 + 86},${y0 + 20} L${x0 + 92},${y0 + 36}`} stroke={T} strokeWidth={1.6} />
          <rect x={x0 + 72} y={y0 + 36} width={28} height={22} rx={3} fill="#e63946" {...C} />
          <circle cx={x0 + 81} cy={y0 + 47} r={4} fill="none" stroke="#fff" strokeWidth={2.4} />
          <path d={`M${x0 + 85},${y0 + 47} h9 M${x0 + 91},${y0 + 47} v3`} stroke="#fff" strokeWidth={2.4} strokeLinecap="round" />
          <path d={`M${x0 + 18},${chao} h84`} stroke="#8a7a6a" strokeWidth={3} strokeLinecap="round" />
        </g>
      );
    case 1: // mudança: caixas empilhadas
      return (
        <g>
          <Janela x={x0 + 70} y={y0 + 22} />
          {caixa(x0 + 14, chao - 24, 34, 24)}
          {caixa(x0 + 50, chao - 18, 26, 18)}
          {caixa(x0 + 20, chao - 44, 26, 20)}
          <path d={`M${x0 + 80},${chao - 2} q8,-14 18,-6`} fill="none" stroke="#2f9e5a" strokeWidth={2.4} />
          <path d={`M${x0 + 78},${chao} h22 l-3,-8 h-16 Z`} fill="#b5562b" {...C} strokeWidth={1.6} />
        </g>
      );
    case 2: // móveis cobertos com lençol
      return (
        <g>
          <Janela x={x0 + 43} y={y0 + 18} />
          <path d={`M${x0 + 12},${chao} Q${x0 + 10},${chao - 30} ${x0 + 24},${chao - 32} Q${x0 + 40},${chao - 22} ${x0 + 56},${chao - 32} Q${x0 + 70},${chao - 30} ${x0 + 68},${chao} Z`} fill="#eeeae2" {...C} />
          <path d={`M${x0 + 22},${chao - 2} q4,-8 0,-16 M${x0 + 44},${chao - 2} q-3,-10 1,-18`} fill="none" stroke="#c9c2b6" strokeWidth={1.6} />
          <path d={`M${x0 + 84},${chao} L${x0 + 86},${chao - 34} Q${x0 + 93},${chao - 48} ${x0 + 100},${chao - 34} L${x0 + 102},${chao} Z`} fill="#eeeae2" {...C} />
        </g>
      );
    default: // gato dormindo na poltrona
      return (
        <g>
          <Janela x={x0 + 14} y={y0 + 20} />
          <path d={`M${x0 + 56},${chao} v-26 q0,-8 8,-8 h30 q8,0 8,8 v26 Z`} fill="#3f7f6e" {...C} />
          <rect x={x0 + 52} y={chao - 20} width={58} height={12} rx={6} fill="#4f9a86" {...C} />
          <path d={`M${x0 + 64},${chao - 20} q2,-12 16,-12 q14,0 16,10 Z`} fill="#f4a340" {...C} strokeWidth={1.8} />
          <path d={`M${x0 + 90},${chao - 30} l3,-6 l2,6 M${x0 + 96},${chao - 26} l4,-5 l1,6`} fill="#f4a340" stroke={T} strokeWidth={1.6} strokeLinejoin="round" />
          <path d={`M${x0 + 64},${chao - 21} q-8,-2 -6,-8`} fill="none" stroke="#f4a340" strokeWidth={3} strokeLinecap="round" />
          <text x={x0 + 100} y={y0 + 40} className="zzz">z</text>
          <text x={x0 + 106} y={y0 + 30} className="zzz pequeno">z</text>
        </g>
      );
  }
}
