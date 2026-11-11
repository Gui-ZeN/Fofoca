import { createRoot } from 'react-dom/client';
import { App } from './App';
// Patua One (marca, títulos, "QUÊ?!") + Asap (interface): fora da lista de fontes batidas (Consulta 5)
import '@fontsource/patua-one/400.css';
import '@fontsource/asap/400.css';
import '@fontsource/asap/600.css';
import '@fontsource/asap/700.css';
import './estilo.css';
import { ARTE, carregarArte } from './arte';

const raiz = createRoot(document.getElementById('root')!);
// ?prova: prova estática da direção visual nova, carregada à parte (não entra no jogo)
if (new URLSearchParams(location.search).has('prova')) import('./prova/Prova').then((m) => raiz.render(<m.Prova />));
// a arte ilustrada é o padrão; ?vetor mostra o desenho antigo em SVG
else if (ARTE) { document.documentElement.classList.add('arte'); carregarArte().then(() => raiz.render(<App />)); }
else raiz.render(<App />);
