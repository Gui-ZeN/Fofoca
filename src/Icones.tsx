import type { ReactNode } from 'react';
import type { Tamanho } from './motor';

// Ícones desenhados no mesmo traço dos personagens (contorno em tinta, cor chapada).
// Todos em coordenadas locais centradas em (0,0), cabendo num quadrado de ~24.

const T = '#283C36';
const PAPEL = '#FBF4E5';
const C = { stroke: T, strokeWidth: 2, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const };

// A forma diz o tamanho: cochicho = balão achatado de contorno pontilhado (fala baixinho);
// fofoca = balão redondo com "!"; escândalo = estouro pontudo com "!!".
// Versão ao contrário (Do Contra): fundo azul e o selinho de setas trocadas.
const ESTOURO = Array.from({ length: 14 }, (_, k) => {
  const a = (Math.PI / 7) * k, r = k % 2 ? 8 : 14;
  return `${(r * 1.1 * Math.cos(a)).toFixed(2)},${(r * 0.92 * Math.sin(a)).toFixed(2)}`;
}).join(' ');
export function Boato({ tamanho, invertida = false }: { tamanho: Tamanho; invertida?: boolean }) {
  const fundo = invertida ? '#245A73' : PAPEL;
  const tinta = invertida ? PAPEL : T;
  const marca = invertida && (
    // setinhas trocadas: a versão chegou ao contrário
    <g transform="translate(11 -9)">
      <circle r={6} fill="#E5B74F" {...C} strokeWidth={1.6} />
      <path d="M-3,-1.5 h5 l-1.8,-1.8 M3,1.5 h-5 l1.8,1.8" fill="none" stroke={T} strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
  if (tamanho === 1) {
    return (
      <g>
        <rect x={-12} y={-5.5} width={24} height={11} rx={5.5} fill={fundo} {...C} strokeWidth={1.8} strokeDasharray="1.6 2.6" />
        <g fill={tinta}><circle cx={-4} cy={0} r={1.3} /><circle cx={0} cy={0} r={1.3} /><circle cx={4} cy={0} r={1.3} /></g>
        {marca}
      </g>
    );
  }
  if (tamanho === 2) {
    return (
      <g>
        <path d="M-6,8.4 L-10,14 L0.5,9.8 A13,10 0 1 0 -6,8.4 Z" fill={fundo} {...C} />
        <path d="M0,-5.5 v6" stroke={tinta} strokeWidth={2.8} strokeLinecap="round" />
        <circle cx={0} cy={4.5} r={1.6} fill={tinta} />
        {marca}
      </g>
    );
  }
  return (
    <g>
      <polygon points={ESTOURO} fill={invertida ? fundo : '#E5B74F'} {...C} />
      <g stroke={tinta} strokeWidth={2.6} strokeLinecap="round"><path d="M-2.5,-5 v5.5" /><path d="M2.5,-5 v5.5" /></g>
      <g fill={tinta}><circle cx={-2.5} cy={4.2} r={1.5} /><circle cx={2.5} cy={4.2} r={1.5} /></g>
      {marca}
    </g>
  );
}

export function Telefone() {
  return (
    <g>
      <circle r={12} fill={PAPEL} {...C} />
      <path d="M-6,-5 q-1,-3 2,-4 l2,3 q0.5,1 -0.8,2 q1.5,4 5,6 q1,-1.2 2,-0.8 l3,2 q-1,3 -4,2 q-8,-3 -9.2,-10.2 Z" fill="#A53D3D" stroke={T} strokeWidth={1.5} strokeLinejoin="round" />
    </g>
  );
}

export function Estrela({ r = 7 }: { r?: number }) {
  const pts = Array.from({ length: 10 }, (_, i) => {
    const a = (Math.PI / 5) * i - Math.PI / 2;
    const raio = i % 2 ? r * 0.45 : r;
    return `${(raio * Math.cos(a)).toFixed(2)},${(raio * Math.sin(a)).toFixed(2)}`;
  });
  return <polygon points={pts.join(' ')} fill="#E5B74F" {...C} strokeWidth={1.6} />;
}

export function Girar() {
  return (
    <g fill="none" stroke={PAPEL} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
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
export const GirarMini = () => <Mini tamanho={20}><circle r={13} fill="#245A73" /><Girar /></Mini>;
export const Seta = ({ lado }: { lado: 'esq' | 'dir' }) => (
  <Mini tamanho={20} caixa={24}>
    <path d={lado === 'esq' ? 'M4,-7 L-4,0 L4,7' : 'M-4,-7 L4,0 L-4,7'} fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
  </Mini>
);
// Advertência do síndico: papel de aviso preenchido (recebida) ou só o contorno tracejado (ainda não).
export const Cartao = ({ recebido }: { recebido: boolean }) => (
  <Mini tamanho={18} caixa={24}>
    <rect x={-6.5} y={-9} width={13} height={17} rx={1.5} fill={recebido ? '#A53D3D' : PAPEL} {...C} strokeWidth={1.6} strokeDasharray={recebido ? undefined : '3 2.5'} />
    {recebido && <path d="M-3,-4 h6 M-3,0 h6 M-3,4 h4" stroke={PAPEL} strokeWidth={1.3} strokeLinecap="round" />}
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
const OCT = Array.from({ length: 8 }, (_, k) => {
  const a = (Math.PI / 4) * k + Math.PI / 8;
  return `${(13 * Math.cos(a)).toFixed(2)},${(13 * Math.sin(a)).toFixed(2)}`;
}).join(' ');
// derrota = o octógono da vítima com "!" (a mesma forma do prédio)
export const Derrota = () => (
  <Mini tamanho={26}>
    <polygon points={OCT} fill="#A53D3D" {...C} />
    <rect x={-2} y={-7.5} width={4} height={9} rx={1.8} fill={PAPEL} />
    <circle cx={0} cy={5.5} r={2.2} fill={PAPEL} />
  </Mini>
);
// boato com o selo de origem (cabeçalho da fase)
export const OrigemMini = () => (
  <Mini tamanho={24} caixa={28}>
    <path d="M-5,6.9 L-9,12 L0.5,8 A10,8 0 1 0 -5,6.9 Z" fill="#E5B74F" {...C} strokeWidth={1.8} />
    <circle cx={-4} cy={0} r={1.4} fill={T} /><circle cx={0} cy={0} r={1.4} fill={T} /><circle cx={4} cy={0} r={1.4} fill={T} />
  </Mini>
);

// BOATO QUE ESFRIA (2026-11-13): o floco de neve e a ficha do topo. Montando mostra só o prazo (N); espalhando, a batida
// de agora contra o prazo (3/5). Passou do prazo (a batida em que o recado esfria): a ficha fica vermelha, como o "Setas" cheio.
// ⚠️ A ficha mora aqui, e não em App.tsx, porque o App roda coisa do navegador ao ser importado e não dá pra testá-lo no node.
export const Floco = () => (
  <Mini tamanho={18} caixa={24}>
    <path d="M0,-9 V9 M-7.8,-4.5 L7.8,4.5 M-7.8,4.5 L7.8,-4.5 M-2.4,-7 L0,-4.6 L2.4,-7 M-2.4,7 L0,4.6 L2.4,7" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Mini>
);
export function FichaValidade({ validade, batida, montando }: { validade: number; batida: number; montando: boolean }) {
  const andando = !montando && batida >= 1;
  return (
    <span className={andando && batida > validade ? 'ficha validade fria' : 'ficha validade'}
      aria-label={andando ? `O boato vale até a batida ${validade}; agora é a ${batida}` : `O boato só vale até a batida ${validade}`}>
      <Floco />{andando ? `${batida}/${validade}` : validade}
    </span>
  );
}
