import type { ComponentProps } from 'react';
import { Predio, medidas } from './Predio';

// A rua do prédio: céu, prédios ao fundo, calçada e asfalto. O prédio pisa na calçada e cresce
// até ocupar o espaço livre. O desenho tem 400 de largura e transborda para os lados, então em
// tela larga o chão e o céu continuam em vez de o prédio flutuar numa caixa.

const W = 400, H = 620, CHAO = 540;

function Nuvem({ x, y, s, dur, atraso }: { x: number; y: number; s: number; dur: number; atraso: number }) {
  return (
    <g className="nuvem" style={{ animationDuration: `${dur}s`, animationDelay: `${-atraso}s` }}>
      <g transform={`translate(${x} ${y}) scale(${s})`}>
        <path d="M0,0 q4,-16 20,-12 q8,-14 24,-6 q14,-6 18,8 q12,2 8,10 h-74 q-6,-2 4,0 Z" />
      </g>
    </g>
  );
}

// Silhuetas dos prédios do bairro, sem detalhe para não disputar com o tabuleiro.
const FUNDO: [number, number, number][] = [
  [-260, 150, 90], [-160, 210, 70], [-80, 120, 60], [-10, 180, 80], [80, 140, 50], [140, 230, 90],
  [240, 160, 70], [320, 200, 60], [390, 130, 80], [480, 190, 70], [560, 150, 90],
];

export function Cena(props: ComponentProps<typeof Predio>) {
  const { largura, altura } = medidas(props.fase);
  const lw = largura + 20, lh = altura + 46; // com beiral e caixa d'água
  // prédio estreito (2 colunas) pode crescer até 1,6×; com 3 colunas é a largura do celular que manda
  // ⚠️ 80 de folga no alto (era 120): com 4 andares a altura é que manda, e com 120 o prédio encolhia
  // pra 0,80 e os nomes caíam pra ~10 px com céu vazio em cima. Nos prédios menores a largura manda e nada muda.
  const s = Math.min((W - 16) / lw, (CHAO - 80) / lh, 1.6);
  const x = W / 2 - (largura * s) / 2;
  const y = CHAO - altura * s;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMax meet" className="tabuleiro" role="img" aria-label="Prédio em corte com os vizinhos">
      <g aria-hidden="true">
        <circle cx={330} cy={70} r={30} className="sol" />
        <Nuvem x={-40} y={90} s={1.1} dur={70} atraso={10} />
        <Nuvem x={150} y={50} s={0.8} dur={90} atraso={50} />
        <Nuvem x={260} y={150} s={0.65} dur={110} atraso={80} />
        {FUNDO.map(([fx, fh, fw]) => <rect key={fx} x={fx} y={CHAO - fh} width={fw} height={fh} className="bairro" />)}
        {/* calçada, meio-fio e rua, largos o bastante para qualquer tela */}
        <rect x={-1200} y={CHAO} width={W + 2400} height={16} className="calcada" />
        <rect x={-1200} y={CHAO + 16} width={W + 2400} height={6} className="meiofio" />
        <rect x={-1200} y={CHAO + 22} width={W + 2400} height={400} className="rua" />
        <path d={`M-1200,${CHAO + 58} H${W + 1200}`} className="faixa" />
        {/* poste */}
        <g className="poste">
          <rect x={x - 34} y={CHAO - 150} width={6} height={150} />
          <path d={`M${x - 31},${CHAO - 150} q0,-14 18,-12`} fill="none" />
          <ellipse cx={x - 12} cy={CHAO - 160} rx={9} ry={5} className="lampada" />
        </g>
      </g>
      <g transform={`translate(${x} ${y}) scale(${s})`}>
        <Predio {...props} />
      </g>
    </svg>
  );
}
