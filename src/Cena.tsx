import type { ComponentProps } from 'react';
import { Predio, medidas } from './Predio';
import { CENARIO, urlArte } from './arte';

// A rua do prédio. O desenho envolve só o prédio (mais o telhado e a calçada), então ele ocupa
// todo o palco e o céu fica pouco — a Consulta 5 cortou o céu que ocupava meia tela.
// Bairro, calçada e rua transbordam pros lados e pra baixo (overflow visível): em tela larga
// o chão continua em vez de o prédio flutuar numa caixa; embaixo, o rodapé cobre a rua.

const TOPO = 50; // caixa d'água
const BASE = 22; // calçada e meio-fio
const MIN = 400; // ⚠️ largura mínima: sem ela, um prédio de 2 colunas crescia até cada cômodo ter ~170 px

// Silhuetas dos prédios do bairro, sem detalhe para não disputar com o tabuleiro (altura em fração do prédio).
const FUNDO: [number, number, number][] = [
  [-620, 0.5, 90], [-520, 0.7, 70], [-430, 0.4, 60], [-350, 0.6, 80], [-250, 0.45, 50], [-180, 0.75, 90], [-70, 0.55, 60],
  [40, 0.65, 70], [120, 0.5, 60], [190, 0.7, 80], [280, 0.4, 70], [360, 0.6, 90], [470, 0.5, 60], [540, 0.7, 80], [640, 0.45, 70],
];

// Céu: nas fases pequenas (1 ou 2 andares) sobra tela em cima do prédio; umas nuvens lentas e o sol
// ocupam o vazio sem disputar com o tabuleiro. Ficam acima do desenho (overflow visível): em tela baixa somem.
function Nuvem({ x, y, s, dur, atraso }: { x: number; y: number; s: number; dur: number; atraso: number }) {
  return (
    <g className="nuvem" style={{ animationDuration: `${dur}s`, animationDelay: `${-atraso}s` }}>
      <path transform={`translate(${x} ${y}) scale(${s})`} d="M0,0 q4,-16 20,-12 q8,-14 24,-6 q14,-6 18,8 q12,2 8,10 h-74 q-6,-2 4,0 Z" />
    </g>
  );
}

export function Cena(props: ComponentProps<typeof Predio>) {
  const { largura, altura } = medidas(props.fase);
  const W = Math.max(largura + 36, MIN);
  const x0 = (W - largura) / 2;
  const topo = CENARIO ? 66 : TOPO; // o telhado ilustrado é mais alto que a caixa d'água
  const chao = topo + altura + 4;
  const H = chao + BASE;

  return (
    // ⚠️ assentado na calçada (YMax): preso no alto, num prédio de 3 andares sobrava um bloco de asfalto
    // embaixo; o que sobra fica de céu em cima, onde a dica aparece
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMax meet" className="tabuleiro" role="img" aria-label="Prédio em corte com os vizinhos">
      <g aria-hidden="true">
        {CENARIO && (
          <g>
            <circle cx={W - 80} cy={-150} r={26} className="sol" />
            <Nuvem x={20} y={-30} s={1.1} dur={90} atraso={20} />
            <Nuvem x={180} y={-190} s={0.8} dur={120} atraso={70} />
            <Nuvem x={-80} y={-320} s={0.9} dur={140} atraso={40} />
            <Nuvem x={120} y={-440} s={0.7} dur={160} atraso={110} />
          </g>
        )}
        {CENARIO ? (
          // faixa ilustrada do bairro, repetida pros lados
          [-2, -1, 0, 1].map((k) => {
            const h = 110, w = (h * CENARIO!.bairro.w) / CENARIO!.bairro.h;
            return <image key={k} href={urlArte(CENARIO!.bairro.f)} x={W / 2 + k * w} y={chao - h} width={w} height={h} />;
          })
        ) : FUNDO.map(([fx, fh, fw]) => <rect key={fx} x={W / 2 + fx} y={chao - altura * fh} width={fw} height={altura * fh} className="bairro" />)}
        {/* calçada, meio-fio e rua, largos o bastante para qualquer tela */}
        <rect x={-1200} y={chao} width={W + 2400} height={16} className="calcada" />
        <rect x={-1200} y={chao + 16} width={W + 2400} height={6} className="meiofio" />
        <rect x={-1200} y={chao + 22} width={W + 2400} height={400} className="rua" />
        {/* poste */}
        <g className="poste">
          <rect x={x0 - 30} y={chao - 150} width={6} height={150} />
          <path d={`M${x0 - 27},${chao - 150} q0,-14 18,-12`} fill="none" />
          <ellipse cx={x0 - 8} cy={chao - 160} rx={9} ry={5} className="lampada" />
        </g>
      </g>
      <g transform={`translate(${x0} ${topo})`}>
        <Predio {...props} />
      </g>
    </svg>
  );
}
