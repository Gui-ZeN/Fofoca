import type { Fase, Vizinho } from './motor';
import { Personagem, type Expressao } from './Personagem';
import { Boato, Estrela, Telefone } from './Icones';
import { Padaria } from './Predio';
import { o } from './elenco';

// Cena de chegada: quando algo novo estreia na campanha, antes da fase, um morador chega no prédio
// (ou mostra a regra) numa animação curta. Ideia do usuário (2026-11-11): "o jogador já fica pronto
// pra algo novo". Uma vez só por estreia; "Bora!" pula a qualquer momento. A etiqueta NOVO continua na fase.
// Quem aparece é o morador da própria fase (já com o nome sorteado), achado pelo papel.

type Demo = 'espalha' | 'aumenta' | 'abafa' | 'inverte' | 'padaria' | 'celular' | 'fila' | 'duvida' | 'reto' | 'fiscal';
export interface Apresentacao {
  demo: Demo;
  titulo: string;
  quem: (f: Fase) => Vizinho | undefined;
  fala: string;
  regra: (v: Vizinho) => string;
}

export const APRESENTACOES: Record<string, Apresentacao> = {
  T4: {
    demo: 'espalha', titulo: 'Moradora nova!',
    quem: (f) => f.vizinhos.find((v) => v.tipo === 'fofoqueira'),
    fala: 'Cheguei! E já tô sabendo de tudo.',
    regra: (v) => `${v.nome} é fofoqueira: conta pra todo mundo em volta, sem você mandar.`,
  },
  T8: {
    demo: 'aumenta', titulo: 'Morador novo!',
    quem: (f) => f.vizinhos.find((v) => v.tipo === 'exagerado'),
    fala: 'Cochicho? Comigo vira fofoca!',
    regra: (v) => `${v.nome} é ${o(v.nome) === 'a' ? 'exagerada' : 'exagerado'}: passa o boato um tamanho maior.`,
  },
  H2: {
    demo: 'padaria', titulo: 'Hora do pão',
    quem: (f) => f.vizinhos.find((v) => v.chega && v.interesse) ?? f.vizinhos.find((v) => v.chega),
    fala: 'Vou ali na padaria e já volto!',
    regra: () => 'Quem saiu só ouve quando voltar: recado que chega antes do número da placa se perde.',
  },
  T10: {
    demo: 'celular', titulo: 'Celular novo',
    quem: (f) => f.vizinhos.find((v) => v.celular),
    fala: 'Agora eu ligo pra quem eu quiser!',
    regra: (v) => `${v.nome} pode ligar pra alguém longe, no lugar de contar pro vizinho.`,
  },
  O1: {
    demo: 'fila', titulo: 'Fila da fofoca',
    quem: (f) => f.vizinhos.find((v) => v.interesse?.ordem === 1),
    fala: 'Eu primeiro, viu?',
    regra: () => 'O número na estrela diz quem tem que saber primeiro. Junto não vale.',
  },
};

// Fora da campanha (blocos de teste): a cena só aparece no link do bloco. Quando a regra entrar na campanha,
// a cena passa pra APRESENTACOES (e o chegada.test, que confere as estreias, passa a cobrir ela).
export const CHEGADAS_DE_TESTE: Record<string, Apresentacao> = {
  A1: {
    demo: 'abafa', titulo: 'Fiscal novo!',
    quem: (f) => f.vizinhos.find((v) => v.abafa),
    fala: 'Psiu! Aqui ninguém grita.',
    regra: (v) => `${v.nome} reclama de barulho: quem mora colado nele conta um tamanho menor. E o boato é sobre ele.`,
  },
  N1: {
    demo: 'inverte', titulo: 'Morador novo!',
    quem: (f) => f.vizinhos.find((v) => v.tipo === 'docontra'),
    fala: 'Isso aí? Foi o contrário.',
    regra: (v) => `${v.nome} é do contra: conta tudo ao contrário. A estrela mostra se quer a versão certa ou a ao contrário.`,
  },
  V1: {
    demo: 'fiscal', titulo: 'Fiscal nova!',
    quem: (f) => f.vizinhos.find((v) => v.vigia),
    fala: 'Eu não durmo. Eu escuto.',
    regra: (v) => `${v.nome} escuta quando um vizinho dela conta algo. Ouvir e guardar do lado dela pode; contar, não. E o boato é sobre ela.`,
  },
  M1: {
    demo: 'fiscal', titulo: 'Fiscal nova!',
    quem: (f) => f.vizinhos.find((v) => v.recolhe),
    fala: 'Passou da hora, acabou a conversa.',
    regra: (v) => `Depois da batida ${v.recolhe}, quem mora colado na ${v.nome} não conta mais nada. E o boato é sobre ela.`,
  },
  L1: {
    demo: 'fiscal', titulo: 'Fiscal novo!',
    quem: (f) => f.vizinhos.find((v) => v.teto),
    fala: 'Isso é assunto reservado.',
    regra: (v) => `${v.nome} só tolera ${v.teto} pessoas sabendo (contando quem você contou). Passou disso, ele descobre. E o boato é sobre ele.`,
  },
  P1: {
    demo: 'reto', titulo: 'Morador novo!',
    quem: (f) => f.vizinhos.find((v) => v.tipo === 'apressado'),
    fala: 'Tô com pressa! Conto pro primeiro que aparecer.',
    regra: (v) => `${v.nome} não espera seta: conta sozinho pra quem mora do outro lado. Ouviu da esquerda, conta pra direita; de baixo, pra cima. Se dois contam juntos, ele se atrapalha e guarda.`,
  },
  R1: {
    demo: 'duvida', titulo: 'Moradora nova!',
    quem: (f) => f.vizinhos.find((v) => v.desconfia),
    fala: 'Hum… quem mais te contou?',
    regra: (v) => `${v.nome} só acredita ouvindo de duas pessoas diferentes. Com uma só, fica na dúvida e não passa adiante.`,
  },
};

const CHAO = 226;
const PARADA = 120; // onde o morador para, no meio da calçada
const SEGUNDO = 212; // na cena da fila, onde a estrela 2 espera (na frente da porta)

export function Chegada({ fase, apresentacao, aoFechar }: { fase: Fase; apresentacao: Apresentacao; aoFechar: () => void }) {
  const v = apresentacao.quem(fase);
  if (!v) return null;
  const segundo = fase.vizinhos.find((x) => x.interesse?.ordem === 2);
  const expressao: Expressao = apresentacao.demo === 'abafa' || apresentacao.demo === 'duvida' || apresentacao.demo === 'fiscal' ? 'bravo' : apresentacao.demo === 'espalha' || apresentacao.demo === 'fila' || apresentacao.demo === 'reto' ? 'contando' : 'ouvindo';
  return (
    <div className="chegada" role="dialog" aria-label={apresentacao.titulo}>
      <p className="chegada-titulo">{apresentacao.titulo}</p>
      <svg viewBox="0 0 360 250" className={`chegada-cena demo-${apresentacao.demo}`} aria-hidden="true">
        {/* rua e fachada do prédio com a porta */}
        <rect x={0} y={CHAO} width={360} height={24} className="chegada-calcada" />
        <rect x={250} y={30} width={110} height={CHAO - 30} className="chegada-fachada" />
        <rect x={262} y={50} width={36} height={30} rx={3} className="chegada-janela" />
        <rect x={312} y={50} width={36} height={30} rx={3} className="chegada-janela" />
        <rect x={262} y={100} width={36} height={30} rx={3} className="chegada-janela" />
        <rect x={312} y={100} width={36} height={30} rx={3} className="chegada-janela" />
        <rect x={280} y={160} width={44} height={CHAO - 160} rx={3} className="chegada-porta" />

        {/* o morador entra andando pela calçada */}
        <g className="chegada-quem"><g className="anda">
          {/* 40% maior que no prédio, crescendo a partir dos pés */}
          <g transform={`translate(0 ${CHAO}) scale(1.4) translate(0 ${-CHAO})`}>
            <Personagem v={v} expressao={expressao} x={0} y={CHAO} />
          </g>
        </g></g>

        {apresentacao.demo === 'espalha' && [[-80, -70], [80, -80], [-95, 5], [95, 0]].map(([dx, dy], i) => (
          <g key={i} transform={`translate(${PARADA} ${CHAO - 110})`}>
            <g className="voa" style={{ ['--dx' as string]: `${dx}px`, ['--dy' as string]: `${dy}px`, animationDelay: `${1.4 + i * 0.15}s` }}><Boato tamanho={1} /></g>
          </g>
        ))}
        {apresentacao.demo === 'aumenta' && (
          <>
            <g transform={`translate(${PARADA - 90} ${CHAO - 110})`}><g className="entra-balao"><Boato tamanho={1} /></g></g>
            <g transform={`translate(${PARADA + 70} ${CHAO - 120})`}><g className="sai-balao"><g transform="scale(1.3)"><Boato tamanho={2} /></g></g></g>
          </>
        )}
        {apresentacao.demo === 'abafa' && (
          // o avesso do Exagerado: entra uma fofoca, sai um cochicho
          <>
            <g transform={`translate(${PARADA - 90} ${CHAO - 110})`}><g className="entra-balao"><g transform="scale(1.3)"><Boato tamanho={2} /></g></g></g>
            <g transform={`translate(${PARADA + 70} ${CHAO - 120})`}><g className="sai-balao"><Boato tamanho={1} /></g></g>
          </>
        )}
        {apresentacao.demo === 'inverte' && (
          // entra a versão certa, sai a ao contrário (azul, com as setinhas trocadas)
          <>
            <g transform={`translate(${PARADA - 90} ${CHAO - 110})`}><g className="entra-balao"><g transform="scale(1.3)"><Boato tamanho={2} /></g></g></g>
            <g transform={`translate(${PARADA + 70} ${CHAO - 120})`}><g className="sai-balao"><g transform="scale(1.3)"><Boato tamanho={2} invertida /></g></g></g>
          </>
        )}
        {apresentacao.demo === 'reto' && (
          // entra por um lado, sai pelo outro, do mesmo tamanho
          <>
            <g transform={`translate(${PARADA - 90} ${CHAO - 110})`}><g className="entra-balao"><Boato tamanho={1} /></g></g>
            <g transform={`translate(${PARADA + 70} ${CHAO - 110})`}><g className="sai-balao"><Boato tamanho={1} /></g></g>
          </>
        )}
        {apresentacao.demo === 'duvida' && (
          // um balão chega e fica a dúvida; o segundo, do outro lado, convence
          <>
            <g transform={`translate(${PARADA - 90} ${CHAO - 110})`}><g className="entra-balao"><Boato tamanho={1} /></g></g>
            <g className="placa-aparece"><text x={PARADA + 30} y={CHAO - 150} className="chegada-duvida">?</text></g>
            <g transform={`translate(${PARADA + 90} ${CHAO - 110})`}><g className="entra-balao segundo"><Boato tamanho={1} /></g></g>
          </>
        )}
        {apresentacao.demo === 'padaria' && (
          <g className="placa-aparece"><Padaria x={302} y={150} faltam={3} batendo={false} /></g>
        )}
        {apresentacao.demo === 'celular' && (
          <g transform={`translate(${PARADA + 36} ${CHAO - 92})`}><g className="toca"><Telefone /></g></g>
        )}
        {apresentacao.demo === 'fila' && segundo && (
          <>
            {/* a 2 já está na porta; quem chega é a 1, e o boato passa por ela antes */}
            <g transform={`translate(0 ${CHAO}) scale(1.4) translate(0 ${-CHAO})`}>
              <Personagem v={segundo} expressao="ouvindo" x={SEGUNDO / 1.4} y={CHAO} />
            </g>
            <g className="placa-aparece">
              <g transform={`translate(${PARADA - 6} ${CHAO - 138})`}><Estrela r={10} /><text className="chegada-vez" x={12} y={5}>1</text></g>
              <g transform={`translate(${SEGUNDO - 6} ${CHAO - 138})`}><Estrela r={10} /><text className="chegada-vez" x={12} y={5}>2</text></g>
            </g>
            <g transform={`translate(${PARADA} ${CHAO - 168})`}><g className="fila-balao"><Boato tamanho={1} /></g></g>
          </>
        )}
      </svg>
      <p className="chegada-fala">“{apresentacao.fala}”</p>
      <p className="chegada-regra">{apresentacao.regra(v)}</p>
      <button className="principal" onClick={aoFechar}>Bora!</button>
    </div>
  );
}
