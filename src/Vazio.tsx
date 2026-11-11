import { DonaGloria } from './Personagem';

// Apartamentos sem morador: luz apagada, janela de noite e uma cena que conta por que está vazio.

const T = '#283C36';
const C = { stroke: T, strokeWidth: 2, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const };

function Janela({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <rect x={x} y={y} width={34} height={28} rx={1} fill="#3E5A66" {...C} />
      <circle cx={x + 24} cy={y + 8} r={4} fill="#FBF4E5" />
      <circle cx={x + 26} cy={y + 7} r={3.4} fill="#3E5A66" />
      <path d={`M${x + 17},${y} V${y + 28} M${x},${y + 14} H${x + 34}`} stroke={T} strokeWidth={2} />
    </g>
  );
}

const caixa = (x: number, y: number, w: number, h: number) => (
  <g key={`${x}${y}`}>
    <rect x={x} y={y} width={w} height={h} fill="#C9A26E" {...C} />
    <path d={`M${x + w / 2},${y} V${y + h}`} stroke="#E8D2A8" strokeWidth={4} />
  </g>
);

// `chao`: onde o piso começa (y do rodapé)
export function Vazio({ x0, y0, chao, cena }: { x0: number; y0: number; chao: number; cena: number }) {
  switch (cena % 4) {
    case 0: // aluga-se: placa com a chave pendurada
      return (
        <g>
          <Janela x={x0 + 16} y={y0 + 26} />
          <path d={`M${x0 + 86},${y0 + 24} L${x0 + 80},${y0 + 40} M${x0 + 86},${y0 + 24} L${x0 + 92},${y0 + 40}`} stroke={T} strokeWidth={1.6} />
          <rect x={x0 + 70} y={y0 + 40} width={32} height={20} fill="#FBF4E5" {...C} />
          <text x={x0 + 86} y={y0 + 54} className="aluga">ALUGA</text>
        </g>
      );
    case 1: // mudança: caixas empilhadas
      return (
        <g>
          <Janela x={x0 + 70} y={y0 + 26} />
          {caixa(x0 + 16, chao - 28, 32, 28)}
          {caixa(x0 + 50, chao - 20, 24, 20)}
          {caixa(x0 + 22, chao - 50, 24, 22)}
        </g>
      );
    case 2: // a Dona Glória, a samambaia que o síndico trata como moradora, num banquinho
      return (
        <g>
          <Janela x={x0 + 16} y={y0 + 22} />
          <rect x={x0 + 56} y={chao - 30} width={40} height={6} fill="#B98F62" {...C} strokeWidth={1.6} />
          <path d={`M${x0 + 60},${chao - 24} V${chao} M${x0 + 92},${chao - 24} V${chao}`} stroke={T} strokeWidth={2.4} />
          <g transform={`translate(${x0 + 76} ${chao - 29})`}><DonaGloria /></g>
        </g>
      );
    default: // gato dormindo na poltrona
      return (
        <g>
          <Janela x={x0 + 14} y={y0 + 24} />
          <path d={`M${x0 + 56},${chao} v-26 q0,-8 8,-8 h30 q8,0 8,8 v26 Z`} fill="#5F7D72" {...C} />
          <rect x={x0 + 52} y={chao - 20} width={58} height={12} rx={6} fill="#7E9C90" {...C} />
          <path d={`M${x0 + 64},${chao - 20} q2,-12 16,-12 q14,0 16,10 Z`} fill="#D9A04E" {...C} strokeWidth={1.8} />
          <path d={`M${x0 + 90},${chao - 30} l3,-6 l2,6 M${x0 + 96},${chao - 26} l4,-5 l1,6`} fill="#D9A04E" stroke={T} strokeWidth={1.6} strokeLinejoin="round" />
          <text x={x0 + 100} y={y0 + 44} className="zzz">z</text>
          <text x={x0 + 106} y={y0 + 34} className="zzz pequeno">z</text>
        </g>
      );
  }
}
