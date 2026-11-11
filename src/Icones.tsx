import type { ReactNode } from 'react';
import type { Tamanho } from './motor';

// Ícones desenhados no mesmo traço dos personagens (contorno escuro, cor chapada).
// Todos em coordenadas locais centradas em (0,0), cabendo num quadrado de ~24.

const T = '#2b2622';
const C = { stroke: T, strokeWidth: 2, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const };

// Cochicho: balão pequeno com reticências. Boato: balão com exclamação. Escândalo: estouro com duas.
export function Boato({ tamanho, invertida = false }: { tamanho: Tamanho; invertida?: boolean }) {
  const fundo = invertida ? '#3b6ea5' : '#fff';
  const tinta = invertida ? '#fff' : T;
  const marca = invertida && (
    // setinhas trocadas: a versão chegou ao contrário
    <g transform="translate(10 -9)">
      <circle r={6} fill="#f4c430" {...C} strokeWidth={1.6} />
      <path d="M-3,-1.5 h5 l-1.8,-1.8 M3,1.5 h-5 l1.8,1.8" fill="none" stroke={T} strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
  if (tamanho === 1) {
    return (
      <g>
        <path d="M-8,-6 h16 a4,4 0 0 1 4,4 v5 a4,4 0 0 1 -4,4 h-9 l-4,4 v-4 h-3 a4,4 0 0 1 -4,-4 v-5 a4,4 0 0 1 4,-4 Z" fill={fundo} {...C} />
        <g fill={tinta}><circle cx={-4} cy={0.5} r={1.4} /><circle cx={0} cy={0.5} r={1.4} /><circle cx={4} cy={0.5} r={1.4} /></g>
        {marca}
      </g>
    );
  }
  if (tamanho === 2) {
    return (
      <g>
        <path d="M-10,-9 h20 a5,5 0 0 1 5,5 v8 a5,5 0 0 1 -5,5 h-11 l-6,5 v-5 h-3 a5,5 0 0 1 -5,-5 v-8 a5,5 0 0 1 5,-5 Z" fill={fundo} {...C} />
        <path d="M0,-5.5 v6" stroke={tinta} strokeWidth={2.8} strokeLinecap="round" />
        <circle cx={0} cy={4.5} r={1.6} fill={tinta} />
        {marca}
      </g>
    );
  }
  return (
    <g>
      <path d="M0,-13 L4,-7 L11,-10 L9,-3 L15,0 L9,3 L11,10 L4,7 L0,13 L-4,7 L-11,10 L-9,3 L-15,0 L-9,-3 L-11,-10 L-4,-7 Z" fill={invertida ? fundo : '#f4c430'} {...C} />
      <g stroke={tinta} strokeWidth={2.6} strokeLinecap="round"><path d="M-2.5,-5 v5.5" /><path d="M2.5,-5 v5.5" /></g>
      <g fill={tinta}><circle cx={-2.5} cy={4.2} r={1.5} /><circle cx={2.5} cy={4.2} r={1.5} /></g>
      {marca}
    </g>
  );
}

export function Telefone() {
  return (
    <g>
      <circle r={12} fill="#fff" {...C} />
      <path d="M-6,-5 q-1,-3 2,-4 l2,3 q0.5,1 -0.8,2 q1.5,4 5,6 q1,-1.2 2,-0.8 l3,2 q-1,3 -4,2 q-8,-3 -9.2,-10.2 Z" fill="#e63946" stroke={T} strokeWidth={1.5} strokeLinejoin="round" />
    </g>
  );
}

export function Estrela({ r = 7 }: { r?: number }) {
  const pts = Array.from({ length: 10 }, (_, i) => {
    const a = (Math.PI / 5) * i - Math.PI / 2;
    const raio = i % 2 ? r * 0.45 : r;
    return `${(raio * Math.cos(a)).toFixed(2)},${(raio * Math.sin(a)).toFixed(2)}`;
  });
  return <polygon points={pts.join(' ')} fill="#f4c430" {...C} strokeWidth={1.6} />;
}

export function Girar() {
  return (
    <g fill="none" stroke="#fff" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
      <path d="M6,-3 A6.5,6.5 0 1 0 6.5,3" />
      <path d="M2,-4.5 L6.5,-3 L7.5,-7.5" />
    </g>
  );
}

// Versões para HTML (texto e botões fora do prédio).
const Mini = ({ children, tamanho = 22, caixa = 32 }: { children: ReactNode; tamanho?: number; caixa?: number }) => (
  <svg width={tamanho} height={tamanho} viewBox={`${-caixa / 2} ${-caixa / 2} ${caixa} ${caixa}`} aria-hidden="true" className="icone">{children}</svg>
);

export const BoatoMini = (p: { tamanho: Tamanho; invertida?: boolean }) => <Mini><Boato {...p} /></Mini>;
export const EstrelaMini = () => <Mini tamanho={20}><Estrela r={11} /></Mini>;
export const GirarMini = () => <Mini tamanho={20}><circle r={13} fill="#3b6ea5" /><Girar /></Mini>;
export const Seta = ({ lado }: { lado: 'esq' | 'dir' }) => (
  <Mini tamanho={20} caixa={24}>
    <path d={lado === 'esq' ? 'M4,-7 L-4,0 L4,7' : 'M-4,-7 L4,0 L-4,7'} fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
  </Mini>
);
// Advertência do síndico: cartãozinho amarelo (recebido) ou só o contorno (ainda não).
export const Cartao = ({ recebido }: { recebido: boolean }) => (
  <Mini tamanho={18} caixa={24}>
    <rect x={-6} y={-9} width={12} height={17} rx={2} transform="rotate(8)" fill={recebido ? '#f4c430' : 'none'} {...C} stroke={recebido ? T : 'currentColor'} strokeDasharray={recebido ? undefined : '3 2.5'} />
  </Mini>
);
// Voltar pro prédio (menu).
export const Casa = () => (
  <Mini tamanho={20} caixa={24}>
    <path d="M-8,-1 L0,-8 L8,-1 M-6,-2.5 V7 H6 V-2.5" fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
  </Mini>
);
export const Cadeado = () => (
  <Mini tamanho={18} caixa={24}>
    <path d="M-4.5,-2 V-5 a4.5,4.5 0 0 1 9,0 V-2" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" />
    <rect x={-7} y={-2} width={14} height={11} rx={2.5} fill="currentColor" />
  </Mini>
);
export const Vitoria = () => <Mini tamanho={26}><Estrela r={13} /></Mini>;
export const Derrota = () => (
  <Mini tamanho={26}>
    <circle r={12} fill="#e63946" {...C} />
    <path d="M-4.5,-4.5 L4.5,4.5 M4.5,-4.5 L-4.5,4.5" stroke="#fff" strokeWidth={3} strokeLinecap="round" />
  </Mini>
);
