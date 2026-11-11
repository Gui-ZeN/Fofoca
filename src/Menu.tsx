import { useEffect, useRef } from 'react';
import { MAX, relogio } from './advertencias';
import { Cadeado, Cartao, EstrelaMini } from './Icones';

export interface Vidas { restam: number; falta?: number; gastar: () => number }

// Os cartões mostram as advertências RECEBIDAS (amarelo); 3 recebidas = suspenso até o síndico tirar uma.
export function CartoesAdvertencia({ restam }: { restam: number }) {
  const recebidas = MAX - restam;
  return (
    <span className="cartoes" aria-label={`${recebidas} de ${MAX} advertências do síndico`}>
      {Array.from({ length: MAX }, (_, i) => <Cartao key={i} recebido={i < recebidas} />)}
    </span>
  );
}

// Menu = o próprio prédio: cada andar é uma fase; o elevador fica parado no andar onde você está.
// Sobe de baixo pra cima: o térreo é a portaria do síndico.
// Sem `vidas` (pesquisa com pessoas), nada de advertência no menu: nem cartões, nem ameaça na portaria.
export function Menu({ titulos, liberada, vidas, aoJogar }: { titulos: string[]; liberada: number; vidas?: Vidas; aoJogar: (andar: number) => void }) {
  const atual = Math.min(liberada, titulos.length - 1);
  // o prédio vai crescendo: mostra os andares feitos, o atual e só uns poucos trancados em cima
  const visiveis = Math.min(titulos.length, liberada + 4);
  const aqui = useRef<HTMLLIElement>(null);
  // ⚠️ com chaves: no Chromium novo scrollIntoView devolve uma Promise, e o React a tomava por limpeza ("destroy is not a function" ao sair do menu)
  useEffect(() => { aqui.current?.scrollIntoView({ block: 'center' }); }, []);
  const suspenso = !!vidas && vidas.restam <= 0;

  return (
    <main className="menu">
      <header className="menu-topo">
        <div className="titulo">
          <div className="numero">Edifício Primavera</div>
          <h1>Fofoca!</h1>
        </div>
        {vidas && (
          <div className="menu-advertencias">
            <span className="rotulo">advertências</span>
            <CartoesAdvertencia restam={vidas.restam} />
            {vidas.falta !== undefined && <span className="volta">{suspenso ? 'suspenso' : '−1'} em {relogio(vidas.falta)}</span>}
          </div>
        )}
      </header>

      <section className="mapa" aria-label="Andares do prédio">
        <div className="telhado-menu" aria-hidden="true" />
        <ol className="andares" reversed>
          {[...Array(visiveis).keys()].reverse().map((i) => {
            const trancado = i > liberada;
            const feito = i < liberada;
            return (
              <li key={i} ref={i === atual ? aqui : undefined} className={i === atual ? 'andar atual' : trancado ? 'andar trancado' : 'andar'}>
                <span className="poco" aria-hidden="true">{i === atual && <span className="elevador" />}</span>
                <button disabled={trancado} onClick={() => aoJogar(i)} aria-label={`${i + 1}º andar: ${titulos[i]}${feito ? ', feito' : trancado ? ', trancado' : ''}`}>
                  <span className="num">{i + 1}</span>
                  <span className="nome">{trancado ? '· · ·' : titulos[i]}</span>
                  <span className="marca">{trancado ? <Cadeado /> : feito ? <EstrelaMini /> : null}</span>
                </button>
              </li>
            );
          })}
        </ol>
        <div className="portaria">
          <strong>Portaria</strong> · Síndico: Seu Zé. Odeia fofoca{vidas ? ': se a vítima descobrir, é advertência.' : '.'}
        </div>
      </section>

      <footer>
        <button className="principal" onClick={() => aoJogar(liberada >= titulos.length ? 0 : atual)}>
          {liberada >= titulos.length ? 'Jogar de novo · 1º andar' : `Jogar · ${atual + 1}º andar`}
        </button>
      </footer>
    </main>
  );
}
