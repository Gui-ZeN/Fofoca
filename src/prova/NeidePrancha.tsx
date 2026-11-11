// Teste: a Neide redesenhada em SVG a partir da prancha ilustrada que o Guilherme mandou
// (corpo inclinado, mão em concha na boca, vestido florido, bobes, argola, pantufa).
// Origem nos pés, y negativo pra cima. Traço externo 2,6 e interno 1,2 (espessura variando, como na prancha).
import type { ReactNode } from 'react';
import { Personagem } from '../Personagem';
import type { Vizinho } from '../motor';

const T = '#283C36';
const E = { stroke: T, strokeWidth: 2.6, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const };
const I = { stroke: T, strokeWidth: 1.2, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const, fill: 'none' };
const PELE = '#EDB592', SOMBRA = '#D9967A';

function Bobe({ x, y, r }: { x: number; y: number; r: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${r})`}>
      <rect x={-7} y={-5} width={14} height={10} rx={4} fill="#E7A3C4" {...E} strokeWidth={1.8} />
      <path d="M-3,-5 v10 M1,-5 v10" {...I} stroke="#B86A92" strokeWidth={1.1} />
      <ellipse cx={6.5} cy={0} rx={1.8} ry={4.4} fill="#F3C6DA" {...E} strokeWidth={1.2} />
    </g>
  );
}
const Pantufa = ({ x }: { x: number }) => (
  <g transform={`translate(${x} 0)`}>
    <path d="M-9,0 q-1,-7 8,-8 q9,0 10,8 Z" fill="#F4A7B9" {...E} strokeWidth={2} />
    <g fill="#F9CAD5" {...E} strokeWidth={1.2}>
      <circle cx={-4} cy={-7} r={2.6} /><circle cx={0} cy={-8.5} r={2.8} /><circle cx={4} cy={-7} r={2.6} />
    </g>
  </g>
);

export function NeidePrancha({ id = 'a' }: { id?: string }) {
  const flor = `florido-${id}`;
  return (
    <g>
      <defs>
        {/* estampa de flor: o vestido da prancha, simplificado pra ler pequeno */}
        <pattern id={flor} width={13} height={13} patternUnits="userSpaceOnUse" patternTransform="rotate(12)">
          <rect width={13} height={13} fill="#F2B3A3" />
          {[0, 72, 144, 216, 288].map((a) => (
            <circle key={a} cx={6.5 + 2.4 * Math.cos((a * Math.PI) / 180)} cy={6.5 + 2.4 * Math.sin((a * Math.PI) / 180)} r={1.9} fill="#FBF4E5" />
          ))}
          <circle cx={6.5} cy={6.5} r={1.2} fill="#E5B74F" />
        </pattern>
      </defs>
      {/* pernas e pantufas (não inclinam) */}
      <g fill={PELE} {...E} strokeWidth={2}>
        <path d="M-13,-30 L-12,-7 h7 L-4,-30 Z" />
        <path d="M3,-30 L4,-7 h7 L12,-30 Z" />
      </g>
      <Pantufa x={-8} />
      <Pantufa x={9} />

      {/* o corpo inteiro debruça pra frente, pro lado de quem ouve */}
      <g transform="rotate(11 0 -30)">
        {/* braço de trás: mão na cintura */}
        <path d="M-15,-73 q-12,9 -8,23" fill="none" stroke={T} strokeWidth={9.4} strokeLinecap="round" />
        <path d="M-15,-73 q-12,9 -8,23" fill="none" stroke={PELE} strokeWidth={5} strokeLinecap="round" />
        <path d="M-25,-52 q2,-5 6,-3 l3,6 q-3,4 -7,2 Z" fill={PELE} {...E} strokeWidth={1.8} />
        {/* vestido florido: busto, cintura marcada, quadril largo */}
        <path d="M-15,-78 C-22,-74 -22,-63 -17,-58 C-15,-52 -22,-46 -23,-38 L-25,-27 Q0,-22 25,-27 L23,-38 C22,-46 15,-52 17,-58 C22,-63 22,-74 15,-78 Q0,-74 -15,-78 Z" fill={`url(#${flor})`} {...E} />
        <path d="M-14,-56 Q0,-52 15,-56" {...I} />
        <path d="M-7,-78 L0,-68 L7,-78 Z" fill={PELE} {...E} strokeWidth={1.6} />
        <path d="M-2,-72 q2,2 4,0" {...I} stroke={SOMBRA} />
        {/* mangas bufantes */}
        <ellipse cx={-15} cy={-73} rx={6.5} ry={5.5} fill={`url(#${flor})`} {...E} strokeWidth={2} />

        {/* cabelo de trás, em cachos */}
        <g fill="#6B3A2E" {...E} strokeWidth={2}>
          {[[-17, -104, 8], [-19, -92, 7], [-12, -116, 8], [21, -106, 7], [20, -94, 6], [2, -122, 9], [14, -118, 8], [-6, -121, 8]].map(([x, y, r]) => (
            <circle key={`${x},${y}`} cx={x} cy={y} r={r} />
          ))}
        </g>
        <rect x={-4} y={-84} width={9} height={8} fill={PELE} {...E} strokeWidth={1.8} />
        {/* orelha e argola */}
        <ellipse cx={-13} cy={-97} rx={3.6} ry={5} fill={PELE} {...E} strokeWidth={1.8} />
        <circle cx={-13} cy={-88} r={4.2} fill="none" stroke={T} strokeWidth={4.2} />
        <circle cx={-13} cy={-88} r={4.2} fill="none" stroke="#E5B74F" strokeWidth={2} />
        {/* rosto */}
        <path d="M-12,-104 C-13,-90 -6,-80 4,-79 C15,-80 20,-90 19,-104 C17,-116 -10,-117 -12,-104 Z" fill={PELE} {...E} />
        <ellipse cx={-5} cy={-91} rx={4} ry={2.4} fill="#E9967A" opacity={0.55} />
        <ellipse cx={15} cy={-91} rx={3.4} ry={2.2} fill="#E9967A" opacity={0.55} />
        {/* olhos de canto, pálpebra baixa: "escuta essa" */}
        {[[-2, -99], [11, -99]].map(([x, y]) => (
          <g key={x}>
            <path d={`M${x - 5.5},${y} q5.5,-7 11,0 q-5.5,5 -11,0 Z`} fill="#FFFDF7" {...E} strokeWidth={1.4} />
            <circle cx={x + 2.4} cy={y - 0.6} r={2.5} fill={T} />
            <circle cx={x + 3.2} cy={y - 1.6} r={0.8} fill="#FFFDF7" />
            <path d={`M${x - 5.5},${y - 1.2} q5.5,-5.6 11,0`} {...I} strokeWidth={1.8} />
            <path d={`M${x + 5.2},${y - 1.8} l2.4,-1.8`} {...I} strokeWidth={1.4} />
          </g>
        ))}
        {/* uma sobrancelha sobe: "escuta essa" */}
        <path d="M-7,-108 q4,-3 9,-0.5 M7,-111 q5,-4 10,0" {...I} strokeWidth={1.8} />
        <path d="M6,-95 q3,3 -1,5" {...I} strokeWidth={1.4} />
        {/* boca falando de lado */}
        <path d="M-1,-87 q7,-2 13,1 q-3,7 -7,7 q-5,0 -6,-8 Z" fill="#8B2E35" {...E} strokeWidth={1.6} />
        <path d="M1,-86.5 q5,-1 9,0.6" stroke="#FFFDF7" strokeWidth={1.6} fill="none" />
        {/* franja e bobes por cima */}
        <path d="M-12,-104 q2,-10 10,-11 q4,5 0,9 q6,-7 13,-5 q4,4 -1,8 q8,-4 9,3 q-6,-9 -31,-4 Z" fill="#6B3A2E" {...E} strokeWidth={2} />
        <Bobe x={-11} y={-117} r={-50} />
        <Bobe x={0} y={-124} r={-14} />
        <Bobe x={12} y={-122} r={18} />
        <Bobe x={21} y={-112} r={58} />

        {/* braço da frente: mão em concha do lado da boca */}
        <path d="M15,-74 L27,-63 L20,-82" fill="none" stroke={T} strokeWidth={9.4} strokeLinecap="round" strokeLinejoin="round" />
        <path d="M15,-74 L27,-63 L20,-82" fill="none" stroke={PELE} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
        <ellipse cx={15} cy={-73} rx={6.5} ry={5.5} fill={`url(#${flor})`} {...E} strokeWidth={2} />
        <path d="M15,-81 q-2,-9 3,-13 q4,-2 7,1 l2,10 q0,5 -5,6 q-5,1 -7,-4 Z" fill={PELE} {...E} strokeWidth={1.8} />
        <path d="M19,-92 l1,8 M22,-93 l1,8" {...I} stroke={SOMBRA} strokeWidth={1.1} />
      </g>
    </g>
  );
}

const NEIDE = { id: 'n', nome: 'Neide', tipo: 'fofoqueira', pos: [0, 0] } as Vizinho;
const Celula = ({ x, children }: { x: number; children: ReactNode }) => (
  <g transform={`translate(${x} 0)`}>
    <rect x={-6} y={-12} width={132} height={160} fill={T} />
    <rect x={0} y={0} width={120} height={136} fill="#FBF4E5" />
    <rect x={0} y={126} width={120} height={6} fill="#00000012" />
    <rect x={8} y={8} width={52} height={22} rx={3} fill="#FBF4E5" stroke={T} strokeWidth={1.6} />
    <text x={14} y={24} fontFamily="Asap, sans-serif" fontWeight={700} fontSize={13} fill={T}>Neide</text>
    {children}
  </g>
);

// página de comparação (?prova=6)
export function ComparaNeide() {
  return (
    <svg viewBox="0 0 390 760" className="prova-tela" role="img" aria-label="Neide no estilo da prancha">
      <defs><filter id="silhueta-n"><feFlood floodColor="#111" /><feComposite in2="SourceAlpha" operator="in" /></filter></defs>
      <rect width={390} height={760} fill="#E8DFC9" />
      <text x={20} y={40} fontFamily="'Patua One', serif" fontSize={22} fill={T}>Neide no estilo da prancha</text>
      <g transform="translate(140 400) scale(2.6)"><NeidePrancha id="g" /></g>
      <g transform="translate(320 400) scale(1.4)" filter="url(#silhueta-n)"><NeidePrancha id="s" /></g>
      <text x={290} y={430} fontFamily="Asap, sans-serif" fontWeight={600} fontSize={12} fill="#3D564D">silhueta</text>
      <text x={20} y={478} fontFamily="Asap, sans-serif" fontWeight={700} fontSize={14} fill={T}>No tamanho do cômodo, como no jogo:</text>
      <g transform="translate(0 510)">
        <Celula x={58}><g transform="translate(62 128) scale(0.95)"><NeidePrancha id="c" /></g></Celula>
        <Celula x={212}><Personagem v={NEIDE} expressao="neutro" x={62} y={128} escala={1.08} /></Celula>
      </g>
      <text x={118} y={690} textAnchor="middle" fontFamily="Asap, sans-serif" fontWeight={600} fontSize={12} fill="#3D564D">nova (prancha)</text>
      <text x={272} y={690} textAnchor="middle" fontFamily="Asap, sans-serif" fontWeight={600} fontSize={12} fill="#3D564D">atual</text>
    </svg>
  );
}
