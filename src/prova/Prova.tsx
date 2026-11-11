// Prova estática da direção "Conforme o regulamento" (Consulta 5). Só abre com ?prova; não toca no jogo.
// ?prova=1..5 mostra uma tela em tamanho de celular; ?prova sozinho mostra as cinco lado a lado.
import '@fontsource/patua-one/400.css';
import '@fontsource/asap/400.css';
import '@fontsource/asap/600.css';
import '@fontsource/asap/700.css';
import './prova.css';
import type { ReactNode } from 'react';
import { Ana, Cida, Davi, Edu, Lia, Lu, Neide, Rita, SeuZe, Silhueta, type Pose } from './Moradores';
import { C, Txt } from './pecas';
import { TelaFase } from './TelaFase';
import { TelaMenu } from './TelaMenu';
import { ComparaNeide } from './NeidePrancha';

const ELENCO: [string, ReactNode][] = [
  ['Seu Zé', <SeuZe />], ['Neide', <Neide />], ['Cida', <Cida />], ['Rita', <Rita />], ['Davi', <Davi />],
  ['Ana', <Ana />], ['Edu', <Edu />], ['Lu', <Lu />], ['Lia', <Lia />],
];
const POSES: [string, Pose][] = [['espera', 'espera'], ['ouvindo', 'ouvindo'], ['QUÊ?!', 'que']];
const ESCALA = 1.15; // cabeça ≈ 40 px, como na fase

function Prancha() {
  const grade = (y0: number, preto: boolean) => ELENCO.map(([nome, corpo], k) => {
    const x = 65 + (k % 3) * 130, y = y0 + Math.floor(k / 3) * 150;
    return (
      <g key={nome}>
        <g transform={`translate(${x} ${y + 124}) scale(${ESCALA})`}>{preto ? <Silhueta>{corpo}</Silhueta> : corpo}</g>
        {!preto && <Txt x={x} y={y + 146} peso={700} tam={14} ancora="middle">{nome}</Txt>}
      </g>
    );
  });
  const poses = (y: number, nome: string, f: (p: Pose) => ReactNode) => (
    <g>
      <Txt x={20} y={y} patua tam={18}>{nome}</Txt>
      {POSES.map(([rotulo, p], k) => (
        <g key={p}>
          <g transform={`translate(${65 + k * 130} ${y + 140}) scale(${ESCALA})`}>{f(p)}</g>
          <Txt x={65 + k * 130} y={y + 162} peso={600} tam={13} ancora="middle" cor="#3D564D">{rotulo}</Txt>
        </g>
      ))}
    </g>
  );
  return (
    <svg viewBox="0 0 390 1440" className="prova-tela" role="img" aria-label="Prancha do elenco">
      <defs>
        <filter id="silhueta"><feFlood floodColor="#111" /><feComposite in2="SourceAlpha" operator="in" /></filter>
      </defs>
      <rect width={390} height={1440} fill={C.reboco} />
      <Txt x={20} y={42} patua tam={24}>Elenco do Edifício Primavera</Txt>
      <Txt x={20} y={62} peso={400} tam={13}>Na escala da fase. Pele e roupa fixas por pessoa.</Txt>
      {grade(84, false)}
      <Txt x={20} y={566} patua tam={18}>Sem nome e sem cor</Txt>
      <Txt x={20} y={584} peso={400} tam={13}>Dá pra dizer quem é quem só pela forma?</Txt>
      {grade(600, true)}
      {poses(1074, 'Neide', (p) => <Neide pose={p} />)}
      {poses(1258, 'Seu Zé', (p) => <SeuZe pose={p} />)}
    </svg>
  );
}

const TELAS: [string, () => ReactNode][] = [
  ['1 · Menu (andar 9)', () => <TelaMenu />],
  ['2 · Menu (andar 178) com o índice', () => <TelaMenu alto />],
  ['3 · Fase 3×4 montando', () => <TelaFase />],
  ['4 · Derrota da mesma fase', () => <TelaFase derrota />],
  ['5 · Prancha do elenco', () => <Prancha />],
  ['6 · Neide no estilo da prancha', () => <ComparaNeide />],
];

export function Prova() {
  const n = Number(new URLSearchParams(location.search).get('prova'));
  if (n >= 1 && n <= TELAS.length) return <main className="prova-uma">{TELAS[n - 1][1]()}</main>;
  return (
    <main className="prova-galeria">
      {TELAS.map(([titulo, tela], k) => (
        <section key={titulo}>
          <h2><a href={`?prova=${k + 1}`}>{titulo}</a></h2>
          {tela()}
        </section>
      ))}
    </main>
  );
}
