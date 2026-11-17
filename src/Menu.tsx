import { useEffect, useRef, useState } from 'react';
import { MAX, relogio } from './advertencias';
import { Cartao } from './Icones';
import { Personagem, type Expressao } from './Personagem';
import type { Tipo, Vizinho } from './motor';
import { capituloDe, estrelas, type Capitulo } from './capitulos';
import { estadoDoAndar, proximoAndar } from './campanha';
import { ARTE } from './arte';
import { aplicarMovimento, armazemDoNavegador, gravarAjustes, lerAjustes, type Ajustes as ValoresAjustes } from './ajustes';

declare const __VERSAO__: string; // vite.config: commit no GitHub, "local" no computador

export interface Vidas { restam: number; falta?: number; gastar: () => number }

// Os cartões mostram as advertências RECEBIDAS (papel vermelho); 3 recebidas = suspenso até o síndico tirar uma.
export function CartoesAdvertencia({ restam }: { restam: number }) {
  const recebidas = MAX - restam;
  return (
    <span className="cartoes" aria-label={`${recebidas} de ${MAX} advertências do síndico`}>
      {Array.from({ length: MAX }, (_, i) => <Cartao key={i} recebido={i < recebidas} />)}
    </span>
  );
}

// O aviso do síndico e a resposta de um morador (bíblia do humor, Consulta 5): um por vez.
// A piada nunca é aparência, idade, gênero, doença; e nunca toma o lugar de uma instrução.
const AVISOS: [string, string][] = [
  ['PROIBIDO OUVIR ATRÁS DA PORTA.', 'Na frente pode?'],
  ['A REUNIÃO SERÁ BREVE.', 'Trouxe o jantar.'],
  ['ASSUNTO ENCERRADO.', 'Qual assunto?'],
  ['A PLANTA NÃO TEM DIREITO A VOTO.', 'Ela pediu a palavra.'],
  ['FAVOR NÃO COMENTAR ESTE AVISO.', 'Comentaram.'],
];
function avisoDo(liberada: number, vidas?: Vidas): [string, string] {
  if (vidas && vidas.restam <= 0) return ['MORADOR SUSPENSO.', 'Até quando?'];
  if (vidas && vidas.restam < MAX) return ['TRÊS ADVERTÊNCIAS = SUSPENSÃO.', 'E quatro?'];
  return AVISOS[liberada % AVISOS.length];
}

// ---------- a tela inicial: o corredor do andar da vez ----------
// A porta do andar que vem, com o número na plaquinha de latão, e a Neide em flagrante: NA FRENTE da porta (o aviso só
// proíbe atrás). Tocar em Jogar abre a porta. ⚠️ Até 2026-11-17 era uma janela com três andares em corte e o elevador: no
// celular o prédio saía cortado à direita e o dono achou "meio bugada". O prédio inteiro mora em "Ver andares".
const T = ARTE ? '#2B1E16' : '#283C36'; // arte ilustrada: tinta marrom, como a ilustração
const CW = 360, CH = 300, CHAO = 278;
const gente = (nome: string, tipo: Tipo = 'comum') => ({ id: nome, nome, tipo, pos: [0, 0] }) as Vizinho;
const morador = (nome: string, x: number, y: number, e: Expressao = 'neutro', tipo?: Tipo, escala = 1.08) =>
  <Personagem v={gente(nome, tipo)} expressao={e} x={x} y={y} escala={escala} />;

export function Corredor({ n, abrindo }: { n: number; abrindo: boolean }) {
  const px = 200, py = 78, pw = 112, ph = CHAO - py; // a porta
  const placa = 34 + String(n).length * 15; // a plaquinha cresce com o número (o prédio vai até o 3.049º)
  return (
    <svg className="corredor-cena" viewBox={`0 0 ${CW} ${CH}`} preserveAspectRatio="xMidYMax meet" role="img"
      aria-label={`A porta do ${n}º andar, com a Neide ouvindo`}>
      {/* ⚠️ a parede sobe além do desenho: em celular alto a cena fica embaixo (xMidYMax) e sobrava uma faixa vazia em cima */}
      <rect y={-2000} width={CW} height={CH + 2000} className="parede" />
      {/* arandela acima da porta: é dela a luz que cai no corredor */}
      <path d={`M${200 + 56 - 16},${78 - 74} h32 l-6,-14 h-20 Z`} fill="#F6E9B8" stroke={T} strokeWidth={2} />
      <path d={`M${200 + 56},${78 - 88} v-30`} stroke={T} strokeWidth={2} />
      <rect y={CHAO - 74} width={CW} height={74} className="lambri" />
      {Array.from({ length: 8 }, (_, i) => <path key={i} d={`M${i * 44 + 12},${CHAO - 74} V${CHAO}`} className="ripa" />)}
      <path d={`M0,${CHAO - 74} H${CW}`} stroke={T} strokeWidth={2} />
      <rect y={CHAO} width={CW} height={CH - CHAO} className="piso" />
      <path d={`M0,${CHAO} H${CW}`} stroke={T} strokeWidth={2.4} />
      {/* arandela: a luz do corredor cai na porta */}
      <ellipse cx={px + pw / 2} cy={py + 70} rx={110} ry={150} className="luz" />
      {/* batente, o escuro de dentro e a folha, que gira na dobradiça quando a pessoa toca em Jogar */}
      <rect x={px - 9} y={py - 9} width={pw + 18} height={ph + 9} fill="#8A5A3B" stroke={T} strokeWidth={2.4} />
      <rect x={px} y={py} width={pw} height={ph} className="dentro" />
      <g className={abrindo ? 'folha abrindo' : 'folha'}>
        <rect x={px} y={py} width={pw} height={ph} className="madeira" stroke={T} strokeWidth={2.4} />
        <rect x={px + 14} y={py + 16} width={pw - 28} height={ph * 0.36} fill="none" stroke={T} strokeWidth={1.6} opacity={0.4} />
        <rect x={px + 14} y={py + ph * 0.36 + 32} width={pw - 28} height={ph * 0.42} fill="none" stroke={T} strokeWidth={1.6} opacity={0.4} />
        <circle cx={px + pw - 15} cy={py + ph * 0.56} r={5} fill="#E5B74F" stroke={T} strokeWidth={1.6} />
        <circle cx={px + pw / 2} cy={py + ph * 0.26} r={3.4} fill={T} opacity={0.75} />
      </g>
      {/* capacho */}
      <rect x={px - 6} y={CHAO - 3} width={pw + 12} height={9} rx={3} fill="#A86B4F" stroke={T} strokeWidth={1.6} />
      {/* a plaquinha de latão: o número do andar da vez */}
      <rect x={px + pw / 2 - placa / 2} y={py - 56} width={placa} height={38} rx={5} fill="#E5B74F" stroke={T} strokeWidth={2.2} />
      <text x={px + pw / 2} y={py - 28} className="placa-num">{n}º</text>
      {/* ela escutando */}
      <path d={`M${px - 16},${py + 98} q-7,7 0,14 M${px - 25},${py + 92} q-11,13 0,26`} fill="none" stroke={T} strokeWidth={2.4} strokeLinecap="round" className="escuta" />
      {morador('Neide', 128, CHAO, 'ouvindo', 'fofoqueira', 2.05)}
    </svg>
  );
}

// Menu = a tela inicial: o aviso do síndico, o corredor do andar da vez e o Jogar grande. Com a Fofoca do dia liberada, ela
// vem logo embaixo, ao lado de "Ver andares" (onde está o prédio inteiro, por capítulo).
// Sem `vidas` (pesquisa com pessoas), nada de advertência no menu.
// `pesquisa`: pro observador do teste, o código do participante e o botão de baixar o registro das jogadas.
export function Menu({ titulos, vencidos, vidas, aoJogar, pesquisa, aoApagar, capitulos, primeira, rotulos, dia }: {
  titulos: string[]; vencidos: ReadonlySet<string>; vidas?: Vidas; aoJogar: (andar: number) => void; aoApagar?: () => void;
  capitulos: Capitulo[]; primeira: Set<string>; rotulos: string[];
  dia?: { feita: number; estrela: boolean; aoJogar: () => void }; // Fofoca do dia (feita = em quantas tentativas; 0 = ainda não; estrela = ganhou a ★)
  pesquisa?: { participante: string; aoExportar: () => void; aoDificeis?: () => void }; // aoDificeis: o kit dos 5 desenhados (src/amostra.ts)
}) {
  // o andar da vez = o primeiro do prédio ainda não vencido (não um índice guardado): ver campanha.ts, proximoAndar
  const proximo = proximoAndar(rotulos, vencidos);
  const zerou = proximo >= titulos.length;
  const atual = zerou ? 0 : proximo;
  const [sel, setSel] = useState(atual);
  const [indice, setIndice] = useState(false);
  const [ajustes, setAjustes] = useState(false);
  const suspenso = !!vidas && vidas.restam <= 0;
  const [aviso, resposta] = avisoDo(proximo, vidas);
  const [abrindo, setAbrindo] = useState(false);
  // a porta abre e aí o andar começa; sem animação (ajuste ou sistema), começa na hora
  const jogar = () => {
    if (abrindo) return;
    const parado = document.documentElement.classList.contains('reduzir') || matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (parado) { aoJogar(sel); return; }
    setAbrindo(true);
    setTimeout(() => aoJogar(sel), 420);
  };

  return (
    <main className="menu">
      <header className="menu-topo">
        <div>
          <h1 className="marca">Fofoca!</h1>
          <div className="predio-nome">EDIFÍCIO PRIMAVERA</div>
        </div>
        <div className="menu-direita">
        {vidas && (
          <div className="menu-advertencias">
            <CartoesAdvertencia restam={vidas.restam} />
            <span className="rotulo">advertências</span>
            {vidas.falta !== undefined && <span className="volta">{suspenso ? 'suspenso' : '−1'} em {relogio(vidas.falta)}</span>}
          </div>
        )}
        <button className="engrenagem" onClick={() => setAjustes(true)} aria-label="Ajustes">
          <svg width={22} height={22} viewBox="-12 -12 24 24" aria-hidden="true">
            <path d="M-1.6,-10 h3.2 l.6,2.6 2,.9 2.3,-1.4 2.2,2.2 -1.4,2.3 .9,2 2.6,.6 v3.2 l-2.6,.6 -.9,2 1.4,2.3 -2.2,2.2 -2.3,-1.4 -2,.9 -.6,2.6 h-3.2 l-.6,-2.6 -2,-.9 -2.3,1.4 -2.2,-2.2 1.4,-2.3 -.9,-2 -2.6,-.6 v-3.2 l2.6,-.6 .9,-2 -1.4,-2.3 2.2,-2.2 2.3,1.4 2,-.9 Z" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinejoin="round" />
            <circle r={3.2} fill="none" stroke="currentColor" strokeWidth={1.8} />
          </svg>
        </button>
        </div>
      </header>

      <div className="mural" aria-label="Aviso da administração">
        <div className="papel-aviso">
          <span className="de">AVISO DA ADMINISTRAÇÃO</span>
          <p>{aviso}</p>
        </div>
        <p className="resposta">{resposta}</p>
      </div>

      <section className="corredor">
        <Corredor n={sel + 1} abrindo={abrindo} />
      </section>

      <div className="placa-andar">
        <span>capítulo {capituloDe(capitulos, sel)?.numero}</span>
        <strong>{titulos[sel]}</strong>
      </div>

      <footer className="menu-acoes">
        <button className="principal jogar" onClick={jogar}>
          {zerou && sel === 0 ? 'Jogar de novo' : 'Jogar'}<small>{sel + 1}º andar</small>
        </button>
        <div className="secundarios">
          {dia && (
            <button className={dia.feita ? 'dia feita' : 'dia'} onClick={dia.aoJogar}>
              Fofoca do dia{dia.feita > 0 && <small>{dia.estrela ? 'feita de primeira ★' : dia.feita === 1 ? 'feita de primeira' : 'feita'}</small>}
            </button>
          )}
          <button className="ver-andares" onClick={() => setIndice(true)}>Ver andares</button>
          {pesquisa?.aoDificeis && <button className="ver-andares" onClick={pesquisa.aoDificeis}>Andares difíceis</button>}
        </div>
        {pesquisa && (
          <button className="exportar" onClick={pesquisa.aoExportar}>
            Participante {pesquisa.participante} · exportar registro
          </button>
        )}
      </footer>

      {ajustes && <Ajustes aoFechar={() => setAjustes(false)} aoApagar={aoApagar} />}
      {indice && (
        <Indice total={titulos.length} vencidos={vencidos} proximo={proximo} sel={sel} capitulos={capitulos} primeira={primeira} rotulos={rotulos}
          aoIr={(i) => { setSel(i); setIndice(false); }} aoFechar={() => setIndice(false)} />
      )}
    </main>
  );
}

// "Ver andares": os capítulos numa faixa, os andares do capítulo (★ = vencido de primeira) e o botão de ir
export function Indice({ total, vencidos, proximo, sel, aoIr, aoFechar, capitulos, primeira, rotulos }: {
  total: number; vencidos: ReadonlySet<string>; proximo: number; sel: number; aoIr: (i: number) => void; aoFechar: () => void;
  capitulos: Capitulo[]; primeira: Set<string>; rotulos: string[];
}) {
  const atual = capituloDe(capitulos, sel) ?? capitulos[0];
  const [numero, setNumero] = useState(atual.numero);
  const [marcado, setMarcado] = useState(sel);
  // a faixa mostra os capítulos até o da vez e o próximo (trancado), como o prédio que "cresce"
  // (andar vencido depois de um buraco continua aberto: o topo é o maior entre o próximo e o último vencido)
  const topo = rotulos.reduce((m, r, i) => (i > m && vencidos.has(r) ? i : m), proximo);
  const ultimo = Math.min((capituloDe(capitulos, Math.min(topo, total - 1))?.numero ?? 1) + 1, capitulos.length);
  const cap = capitulos[numero - 1];
  const faixa = useRef<HTMLDivElement>(null);
  // ⚠️ com chaves: no Chromium novo scrollIntoView devolve uma Promise, e o React a tomava por limpeza
  useEffect(() => { faixa.current?.querySelector('.atual')?.scrollIntoView({ inline: 'center', block: 'nearest' }); }, []);
  return (
    <div className="indice-fundo" onClick={aoFechar}>
      <div className="indice" role="dialog" aria-label="Ver andares" onClick={(e) => e.stopPropagation()}>
        <div className="indice-topo">
          <h2>Ver andares</h2>
          <button className="fechar" onClick={aoFechar}>Fechar</button>
        </div>
        <div className="dezenas" ref={faixa}>
          {capitulos.slice(0, ultimo).map((c) => (
            <button key={c.numero} className={c.numero === numero ? 'atual' : undefined} disabled={c.inicio > topo} onClick={() => setNumero(c.numero)}>
              Cap. {c.numero}{rotulos.slice(c.inicio, c.fim).every((r) => vencidos.has(r)) && <span aria-label=", concluído"> ✓</span>}
            </button>
          ))}
        </div>
        <p className="cap-indice"><b>{cap.titulo}</b> · ★ {estrelas(cap, rotulos, primeira)} de {cap.fim - cap.inicio} de primeira</p>
        <div className="andares-grade">
          {Array.from({ length: cap.fim - cap.inicio }, (_, k) => {
            const i = cap.inicio + k;
            const estado = estadoDoAndar(vencidos, rotulos[i], i, proximo);
            const cls = i === marcado ? 'marcado' : estado;
            const estrela = primeira.has(rotulos[i]);
            return (
              <button key={i} className={cls} disabled={estado === 'trancado'} onClick={() => setMarcado(i)}
                aria-label={`${i + 1}º andar${estrela ? ', de primeira' : estado === 'feito' ? ', feito' : estado === 'trancado' ? ', trancado' : ''}`}>
                <b>{i + 1}</b>
                <span className="portinha" aria-hidden="true" />
                {estado === 'feito' && <span className={estrela ? 'visto estrela' : 'visto'} aria-hidden="true">{estrela ? '★' : '✓'}</span>}
              </button>
            );
          })}
        </div>
        <button className="principal" onClick={() => aoIr(marcado)}>Ir ao andar {marcado + 1}</button>
      </div>
    </div>
  );
}

// Ajustes: velocidade do espalhar, menos animação, apagar progresso (com confirmação na própria tela) e versão.
function Ajustes({ aoFechar, aoApagar }: { aoFechar: () => void; aoApagar?: () => void }) {
  const [a, setA] = useState<ValoresAjustes>(() => lerAjustes(armazemDoNavegador));
  const [confirmar, setConfirmar] = useState(false);
  const mudar = (novo: ValoresAjustes) => { setA(novo); gravarAjustes(armazemDoNavegador, novo); aplicarMovimento(novo.reduzir); };
  return (
    <div className="indice-fundo" onClick={aoFechar}>
      <div className="indice ajustes" role="dialog" aria-label="Ajustes" onClick={(e) => e.stopPropagation()}>
        <div className="indice-topo">
          <h2>Ajustes</h2>
          <button className="fechar" onClick={aoFechar}>Fechar</button>
        </div>

        <div className="ajuste">
          <span className="rotulo-ajuste">Velocidade do espalhar</span>
          <div className="segmentos" role="radiogroup" aria-label="Velocidade do espalhar">
            <button role="radio" aria-checked={!a.rapido} className={a.rapido ? '' : 'marcado'} onClick={() => mudar({ ...a, rapido: false })}>Normal</button>
            <button role="radio" aria-checked={a.rapido} className={a.rapido ? 'marcado' : ''} onClick={() => mudar({ ...a, rapido: true })}>Rápida ×2</button>
          </div>
        </div>

        <label className="ajuste alternar">
          <span>
            <span className="rotulo-ajuste">Menos animação</span>
            <span className="nota-ajuste">Sem balão voando nem personagens se mexendo.</span>
          </span>
          <input type="checkbox" checked={a.reduzir} onChange={(e) => mudar({ ...a, reduzir: e.target.checked })} />
        </label>

        <label className="ajuste alternar">
          <span>
            <span className="rotulo-ajuste">Som</span>
            <span className="nota-ajuste">Uma nota a cada batida do boato.</span>
          </span>
          <input type="checkbox" checked={a.som} onChange={(e) => mudar({ ...a, som: e.target.checked })} />
        </label>

        <label className="ajuste alternar">
          <span>
            <span className="rotulo-ajuste">Música</span>
            <span className="nota-ajuste">Uma batida calma de fundo.</span>
          </span>
          <input type="checkbox" checked={a.musica} onChange={(e) => mudar({ ...a, musica: e.target.checked })} />
        </label>

        <label className="ajuste alternar">
          <span>
            <span className="rotulo-ajuste">Vibração</span>
            <span className="nota-ajuste">O celular treme quando a estrela ouve e quando a vítima descobre.</span>
          </span>
          <input type="checkbox" checked={a.vibrar} onChange={(e) => mudar({ ...a, vibrar: e.target.checked })} />
        </label>

        {aoApagar && (
          <div className="ajuste">
            <span className="rotulo-ajuste">Progresso</span>
            {/* depois de apagar, o menu se remonta já no 1º andar (e esta folha fecha): esse é o retorno */}
            {confirmar ? (
              <div className="confirmar">
                <span className="nota-ajuste">Apagar mesmo? Você volta pro 1º andar. As advertências continuam.</span>
                <div className="acoes">
                  <button onClick={() => setConfirmar(false)}>Cancelar</button>
                  <button className="perigo" onClick={aoApagar}>Apagar</button>
                </div>
              </div>
            ) : (
              <button className="secundario" onClick={() => setConfirmar(true)}>Apagar progresso</button>
            )}
          </div>
        )}

        <p className="versao">Versão {typeof __VERSAO__ === 'string' ? __VERSAO__ : 'local'}</p>
      </div>
    </div>
  );
}
