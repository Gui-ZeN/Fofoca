import { Component, type ErrorInfo, type ReactNode } from 'react';
import { registro } from './registro';

// Se algum pedaço da tela quebrar, em vez de tela branca: uma explicação curta e o caminho de volta.
// ⚠️ Já aconteceu uma tela branca no menu nesta fase do projeto (useEffect devolvendo Promise); na frente
// de um participante do teste, tela branca encerra a sessão. Na pesquisa, o erro também vai pro registro.
export class Protecao extends Component<{ children: ReactNode }, { erro?: Error }> {
  state: { erro?: Error } = {};

  static getDerivedStateFromError(erro: Error) {
    return { erro };
  }

  componentDidCatch(erro: Error, info: ErrorInfo) {
    registro.registrar('error', { mensagem: String(erro?.message ?? erro).slice(0, 300), onde: (info.componentStack ?? '').trim().split('\n')[0]?.trim().slice(0, 120) });
    console.error(erro);
  }

  render() {
    if (!this.state.erro) return this.props.children;
    return (
      <main className="protecao" role="alert">
        <h1>O elevador travou.</h1>
        <p>Alguma coisa deu errado aqui. Seu progresso está guardado.</p>
        {/* recarrega a página no mesmo endereço (mantém ?pesquisa, ?bloco…): volta pro prédio */}
        <button className="principal" onClick={() => location.reload()}>Voltar ao prédio</button>
        <p className="detalhe">{String(this.state.erro.message ?? this.state.erro).slice(0, 160)}</p>
      </main>
    );
  }
}
