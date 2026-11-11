import type { Capitulo } from './capitulos';
import type { Vizinho } from './motor';
import { Personagem } from './Personagem';

const ZE = { id: 'z', nome: 'Seu Zé', tipo: 'assunto', pos: [0, 0] } as Vizinho;

// Abertura de capítulo: na 1ª vez que se entra no 1º andar do capítulo (uma vez por aparelho), antes da
// cena de chegada se houver. O aviso do síndico dá o tema na voz "Conforme o regulamento"; "Bora!" segue.
export function AberturaCapitulo({ cap, aoFechar }: { cap: Capitulo; aoFechar: () => void }) {
  return (
    <div className="chegada abertura-capitulo" role="dialog" aria-label={`Capítulo ${cap.numero}: ${cap.titulo}`}>
      <p className="cap-numero">Capítulo {cap.numero}</p>
      <h2 className="cap-titulo">{cap.titulo}</h2>
      {/* o síndico ao lado do aviso que ele acabou de pregar */}
      <div className="cap-cena">
        <svg viewBox="-70 -150 140 156" className="cap-ze" aria-hidden="true"><Personagem v={ZE} expressao="neutro" x={0} y={0} escala={1.15} /></svg>
        <div className="mural cap-mural">
          <div className="papel-aviso">
            <span className="de">AVISO DA ADMINISTRAÇÃO</span>
            <p>{cap.aviso}</p>
          </div>
        </div>
      </div>
      <p className="cap-andares">Andares {cap.inicio + 1} a {cap.fim}</p>
      <button className="principal" onClick={aoFechar}>Bora!</button>
    </div>
  );
}
