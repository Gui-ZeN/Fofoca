// Designer 2 — "o relógio" (2026-11-17): andares desenhados à mão em que o QUANDO decide mais que o POR ONDE.
// Soneca, padaria (volta), saída, boato que esfria, ordem das estrelas, ronda do Seu Zé e toque de recolher da Dona Norma,
// misturados. Em todos o vilão está NO caminho natural: a armadilha perde por causa dele. Achados com um buscador sobre o motor
// (_busca/designer2) e conferidos por scripts/conferirAndar.ts. Referências: SpaceChem/Opus Magnum (sincronizar), Cosmic Express
// (sequência), Lemmings (hora de soltar), Into the Breach (o inimigo é previsível, o jogador escolhe o quando).
import type { AndarDesenhado } from './tipo';

export const andares: AndarDesenhado[] = [
  {
    // FACIL — Depois das dez. Prédio (! = vilão, ★ = quer saber):
    //   4:Tetê                        N:Dona Norma! recolhe3        r:Rita
    //   ·                             o:Caio                        S:Soneca zZ
    //   ·                             c:Cida★                       w:Wesley
    //   ·                             d:Davi                        t:Otávio
    // Rita está colada na Dona Norma (recolhe 3) e no Soneca. O atalho óbvio é Soneca → Otávio... o Soneca cochila e conta na batida 3; quem o ouve (colado na Norma) só conta na 4, depois do recolher, e cala.
    // O caminho certo passa pelo Soneca e vai direto pra quem está longe da Norma.
    dificuldade: 'facil',
    referencia: "Lemmings: a hora de soltar importa mais que o caminho. O Soneca é o relógio que atrasa sem querer.",
    ideia: "O Soneca atrasa o recado uma batida; o caminho que passa colado na Dona Norma só funciona se ele conta ANTES do recolher.",
    vilao: "A Dona Norma cala quem mora colado nela depois da batida 3; o caminho curto passa por esse vizinho já na hora errada.",
    fase: {
      titulo: "Depois das dez", boato: "A Dona Norma apaga a luz da escada às dez em ponto",
      novidade: "Soneca: ouve e demora uma batida a mais pra contar",
      giros: 0, setas: 3, origens: ['r'],
      vizinhos: [
      { id:"r", nome:"Rita", tipo:"comum", pos:[2, 0] },
      { id:"N", nome:"Dona Norma", tipo:"assunto", pos:[1, 0], recolhe:3 },
      { id:"c", nome:"Cida", tipo:"comum", pos:[1, 2], interesse:{} },
      { id:"S", nome:"Soneca", tipo:"comum", pos:[2, 1], soneca:true },
      { id:"4", nome:"Tetê", tipo:"comum", pos:[0, 0] },
      { id:"o", nome:"Caio", tipo:"comum", pos:[1, 1] },
      { id:"t", nome:"Otávio", tipo:"comum", pos:[2, 3] },
      { id:"w", nome:"Wesley", tipo:"comum", pos:[2, 2] },
      { id:"d", nome:"Davi", tipo:"comum", pos:[1, 3] },
      ],
      amizades: [['r', 'N'], ['r', 'S'], ['N', '4'], ['N', 'o'], ['c', 'o'], ['c', 'w'], ['c', 'd'], ['S', 'o'], ['S', 'w'], ['t', 'w'], ['t', 'd']],
      solucao: { r:'S', S:'w', w:'c' },
      armadilha: { r:'S', S:'o', o:'c' }, // o caminho pelo vizinho da Norma conta depois do recolher
    },
  },
  {
    // FACIL — A ronda e o cochilo. Prédio (! = vilão, ★ = quer saber):
    //   f:Zeca                        z:Seu Zé! ronda[zfwv]         r:Rita
    //   w:Wesley                      v:Ivo                         S:Soneca zZ
    //   a:Ana                         c:Cida★                       k:Celina
    // A ronda do Seu Zé ocupa a vizinhança da Rita. O Soneca entrega o recado no tempo em que o Zé já foi embora do apartamento por onde a outra rota passaria.
    dificuldade: 'facil',
    referencia: "Into the Breach: o inimigo anda por um padrão previsível e você escolhe a hora de passar.",
    ideia: "O cochilo do Soneca joga o recado pra uma batida em que o Seu Zé já saiu do apartamento do atalho.",
    vilao: "O Seu Zé faz ronda exatamente pelos apartamentos entre a Rita e a Cida; a rota sem cochilo cruza com ele.",
    fase: {
      titulo: "A ronda e o cochilo", boato: "O Seu Zé confere o relógio de luz toda noite",
      novidade: "Ronda: o vilão anda pelo prédio, um apartamento por batida",
      giros: 0, setas: 3, origens: ['r'],
      vizinhos: [
      { id:"r", nome:"Rita", tipo:"comum", pos:[2, 0] },
      { id:"z", nome:"Seu Zé", tipo:"assunto", pos:[1, 0], ronda:["z", "f", "w", "v"] },
      { id:"c", nome:"Cida", tipo:"comum", pos:[1, 2], interesse:{} },
      { id:"S", nome:"Soneca", tipo:"comum", pos:[2, 1], soneca:true },
      { id:"k", nome:"Celina", tipo:"comum", pos:[2, 2] },
      { id:"a", nome:"Ana", tipo:"comum", pos:[0, 2] },
      { id:"f", nome:"Zeca", tipo:"comum", pos:[0, 0] },
      { id:"w", nome:"Wesley", tipo:"comum", pos:[0, 1] },
      { id:"v", nome:"Ivo", tipo:"comum", pos:[1, 1] },
      ],
      amizades: [['r', 'z'], ['r', 'S'], ['z', 'f'], ['z', 'v'], ['c', 'k'], ['c', 'v'], ['S', 'k'], ['S', 'v'], ['a', 'w'], ['f', 'w'], ['w', 'v']],
      solucao: { r:'S', S:'k', k:'c' },
      armadilha: { r:'S', S:'v', v:'c' }, // o recado passa por onde o Seu Zé está na hora
    },
  },
  {
    // MEDIO — A Bia volta às cinco. Prédio (! = vilão, ★ = quer saber):
    //   ·                             a:Ana                         j:Rui                         t:Otávio                      ·
    //   e:Edu                         p:Paulo                       b:Bia★2 volta5                4:Tetê                        o:Caio
    //   ·                             5:Dona Zefa                   c:Cida★1                      r:Rita                        y:Íris
    //   d:Davi                        v:Ivo                         N:Dona Norma! recolhe2        ·                             ·
    // Ordem: Cida (1) antes da Bia (2). A Bia só volta da padaria na batida 5, e a Cida mora colada na Dona Norma (recolhe 2): depois da batida 2 ela não conta mais nada.
    // A Cida ouve na 1 e passa o recado pro vizinho de fora do alcance da Norma; dali o boato tem que dar a volta inteira (8 setas) pra chegar na Bia só depois que ela voltou.
    // O atalho Cida→Bia chega cedo e se perde; o caminho longo que parece 'sobrando seta' é o único que sincroniza.
    dificuldade: 'medio',
    referencia: "SpaceChem: dois fluxos que precisam chegar sincronizados; o caminho mais longo é o que casa os tempos.",
    ideia: "A Cida tem que ouvir cedo (antes do recolher da Norma) e a Bia tarde (depois da padaria): o boato precisa de uma volta longa só pra gastar tempo.",
    vilao: "A Dona Norma cala a Cida depois da batida 2: ouvir tarde a perde, e contar à Bia direto chega antes de a Bia voltar.",
    fase: {
      titulo: "A Bia volta às cinco", boato: "A Dona Norma conta os degraus da escada em voz alta",
      giros: 0, setas: 8, origens: ['r'],
      vizinhos: [
      { id:"r", nome:"Rita", tipo:"comum", pos:[3, 2] },
      { id:"N", nome:"Dona Norma", tipo:"assunto", pos:[2, 3], recolhe:2 },
      { id:"c", nome:"Cida", tipo:"comum", pos:[2, 2], interesse:{ ordem:1 } },
      { id:"b", nome:"Bia", tipo:"comum", pos:[2, 1], interesse:{ ordem:2 }, chega:5 },
      { id:"v", nome:"Ivo", tipo:"comum", pos:[1, 3] },
      { id:"4", nome:"Tetê", tipo:"comum", pos:[3, 1] },
      { id:"o", nome:"Caio", tipo:"comum", pos:[4, 1] },
      { id:"t", nome:"Otávio", tipo:"comum", pos:[3, 0] },
      { id:"p", nome:"Paulo", tipo:"comum", pos:[1, 1] },
      { id:"e", nome:"Edu", tipo:"comum", pos:[0, 1] },
      { id:"5", nome:"Dona Zefa", tipo:"comum", pos:[1, 2] },
      { id:"j", nome:"Rui", tipo:"comum", pos:[2, 0] },
      { id:"d", nome:"Davi", tipo:"comum", pos:[0, 3] },
      { id:"y", nome:"Íris", tipo:"comum", pos:[4, 2] },
      { id:"a", nome:"Ana", tipo:"comum", pos:[1, 0] },
      ],
      amizades: [['r', 'c'], ['4', 't'], ['c', 'b'], ['c', 'N'], ['c', '5'], ['b', 'p'], ['N', 'v'], ['5', 'p'], ['e', 'p'], ['b', '4'], ['t', 'j'], ['o', '4'], ['5', 'v'], ['d', 'v'], ['y', 'o'], ['4', 'r'], ['a', 'p'], ['a', 'j']],
      solucao: { 4:'b', 5:'p', r:'c', c:'5', p:'a', a:'j', j:'t', t:'4' },
      armadilha: { 4:'t', 5:'c', r:'4', t:'j', j:'a', a:'p', p:'5', c:'b' }, // a volta que passa pelo outro lado deixa a Cida ouvir tarde e a Norma já a calou
    },
  },
  {
    // MEDIO — Janela da padaria. Prédio (! = vilão, ★ = quer saber):
    //   z:Seu Zé! ronda[gzgz]         g:Solange                     v:Ivo                         ·
    //   f:Zeca                        c:Cida★ volta6                p:Paulo                       u:Rui
    //   ·                             4:Tetê                        b:Bia★ sai6                   o:Caio
    //   h:Ana                         t:Otávio                      r:Rita                        ·
    //   ·                             5:Dona Zefa                   q:Dudu                        ·
    // O Seu Zé faz ronda entre a casa dele (z) e o apartamento g: está em g nas batidas ímpares. A Bia sai de casa na batida 6 (tem que ouvir até a 5); a Cida só volta da padaria na 6 (ouvir só a partir daí).
    // O caminho curto até a Cida termina passando por g e chega na batida 7, quando o Seu Zé está lá escutando. O desvio pelo outro lado gasta as mesmas setas e entrega a Cida na mesma batida 7 sem passar por g.
    dificuldade: 'medio',
    referencia: "Lemmings + Into the Breach: duas janelas de tempo e um inimigo que patrulha em ritmo fixo.",
    ideia: "Duas pessoas com horários opostos (uma sai, outra volta) e a rota certa é a que passa pela janela, desviando da batida em que o Zé está de ronda.",
    vilao: "O Seu Zé vai e volta entre a casa dele e o apartamento g; o caminho mais curto pra Cida termina exatamente lá, na batida ímpar em que ele escuta.",
    fase: {
      titulo: "Janela da padaria", boato: "O Seu Zé decorou o horário da padaria",
      giros: 0, setas: 7, origens: ['r'],
      vizinhos: [
      { id:"r", nome:"Rita", tipo:"comum", pos:[2, 3] },
      { id:"z", nome:"Seu Zé", tipo:"assunto", pos:[0, 0], ronda:["g", "z", "g", "z"] },
      { id:"c", nome:"Cida", tipo:"comum", pos:[1, 1], interesse:{}, chega:6 },
      { id:"b", nome:"Bia", tipo:"comum", pos:[2, 2], interesse:{}, sai:6 },
      { id:"o", nome:"Caio", tipo:"comum", pos:[3, 2] },
      { id:"u", nome:"Rui", tipo:"comum", pos:[3, 1] },
      { id:"h", nome:"Ana", tipo:"comum", pos:[0, 3] },
      { id:"g", nome:"Solange", tipo:"comum", pos:[1, 0] },
      { id:"p", nome:"Paulo", tipo:"comum", pos:[2, 1] },
      { id:"v", nome:"Ivo", tipo:"comum", pos:[2, 0] },
      { id:"q", nome:"Dudu", tipo:"comum", pos:[2, 4] },
      { id:"t", nome:"Otávio", tipo:"comum", pos:[1, 3] },
      { id:"5", nome:"Dona Zefa", tipo:"comum", pos:[1, 4] },
      { id:"f", nome:"Zeca", tipo:"comum", pos:[0, 1] },
      { id:"4", nome:"Tetê", tipo:"comum", pos:[1, 2] },
      ],
      amizades: [['h', 't'], ['z', 'f'], ['z', 'g'], ['b', 'p'], ['b', 'o'], ['b', '4'], ['p', 'u'], ['p', 'c'], ['u', 'o'], ['g', 'v'], ['g', 'c'], ['r', 't'], ['t', '4'], ['q', 'r'], ['f', 'c'], ['5', 'q'], ['b', 'r'], ['t', '5'], ['v', 'p']],
      solucao: { 4:'b', r:'t', t:'4', b:'o', o:'u', u:'p', p:'c' },
      armadilha: { 4:'b', r:'t', t:'4', b:'p', p:'v', v:'g', g:'c' }, // o último passo conta no apartamento do Seu Zé, na batida em que ele está lá
    },
  },
  {
    // DIFICIL — A volta da Neide. Prédio (! = vilão, ★ = quer saber):
    //   ·                             a:Soneca zZ                   j:Rui                         e:Edu                         N:Dona Norma! recolhe7
    //   p:Paulo                       y:Íris                        b:Bia★2 volta5                4:Tetê                        2:Mirela
    //   ·                             5:Neide fofoca                c:Cida★1                      r:Rita                        ·
    //   v:Ivo                         t:Otávio                      ·                             ·                             ·
    // Ordem: a Cida (1) antes da Bia (2), e a Bia só volta da padaria na batida 5. A Dona Norma (recolhe 7) cala quem mora colado nela depois da batida 7.
    // Contar à Cida logo (batida 1) parece certo, mas aí o recado precisa chegar à Bia depois da 5 e só sobra o caminho de fora, que passa por um vizinho da Norma já calado.
    // A solução dá uma volta de 7 setas: passa pelo Soneca (que gasta uma batida a mais) e pela Neide, que entrega à Cida na 8; a Cida conta à Bia na 9, depois da padaria.
    dificuldade: 'dificil',
    referencia: "SpaceChem: dois fluxos sincronizados; o boato tem que gastar tempo de propósito e chegar nas duas estrelas na ordem.",
    ideia: "Quem tem que saber primeiro é o que menos pressa tem: o boato dá a volta pelo Soneca e pela Neide pra a Cida ouvir tarde, a Bia mais tarde ainda.",
    vilao: "A Dona Norma cala os vizinhos dela depois da batida 7: o caminho de fora, o único que sobra depois de avisar a Cida cedo, passa por um deles tarde demais.",
    fase: {
      titulo: "A volta da Neide", boato: "A Dona Norma racionou a luz do corredor",
      giros: 0, setas: 7, origens: ['r'],
      vizinhos: [
      { id:"r", nome:"Rita", tipo:"comum", pos:[3, 2] },
      { id:"N", nome:"Dona Norma", tipo:"assunto", pos:[4, 0], recolhe:7 },
      { id:"c", nome:"Cida", tipo:"comum", pos:[2, 2], interesse:{ ordem:1 } },
      { id:"b", nome:"Bia", tipo:"comum", pos:[2, 1], interesse:{ ordem:2 }, chega:5 },
      { id:"v", nome:"Ivo", tipo:"comum", pos:[0, 3] },
      { id:"4", nome:"Tetê", tipo:"comum", pos:[3, 1] },
      { id:"t", nome:"Otávio", tipo:"comum", pos:[1, 3] },
      { id:"p", nome:"Paulo", tipo:"comum", pos:[0, 1] },
      { id:"e", nome:"Edu", tipo:"comum", pos:[3, 0] },
      { id:"5", nome:"Neide", tipo:"fofoqueira", pos:[1, 2] },
      { id:"j", nome:"Rui", tipo:"comum", pos:[2, 0] },
      { id:"y", nome:"Íris", tipo:"comum", pos:[1, 1] },
      { id:"a", nome:"Soneca", tipo:"comum", pos:[1, 0], soneca:true },
      { id:"2", nome:"Mirela", tipo:"comum", pos:[4, 1] },
      ],
      amizades: [['r', 'c'], ['4', 'e'], ['c', 'b'], ['c', '5'], ['5', 'y'], ['p', 'y'], ['b', '4'], ['e', 'j'], ['v', 't'], ['a', 'y'], ['a', 'j'], ['r', '4'], ['2', '4'], ['5', 't'], ['b', 'y'], ['N', 'e'], ['N', '2']],
      solucao: { 4:'e', r:'4', e:'j', j:'a', a:'y', y:'5', c:'b' },
      armadilha: { 4:'b', r:'c', c:'5', y:'a', a:'j', j:'e', e:'4' }, // Cida primeiro e o resto pelo caminho de fora: o vizinho da Norma tenta contar na batida 8, depois do recolher
    },
  },
  {
    // DIFICIL — Ponto de ronda. Prédio (! = vilão, ★ = quer saber):
    //   z:Seu Zé! ronda[zgzu]         g:Solange                     t:Otávio                      f:Neide fofoca                ·
    //   u:Rui                         c:Cida★ volta8                p:Paulo                       5:Soneca zZ                   ·
    //   o:Caio                        v:Ivo                         4:Tetê                        a:Ana                         ·
    //   h:Lia                         b:Bia★ sai6                   r:Rita                        1:Kátia                       k:Celina
    // O Seu Zé faz ronda em ciclo de 4 batidas: casa, g, casa, u. A Bia sai de casa na batida 6 (precisa ouvir cedo), a Cida só volta da padaria na 8. O Soneca e a Neide ficam no meio do caminho.
    // O atalho (Rita, Bia, vizinho, Cida) chega à Cida na batida 3, antes de ela voltar.
    // A solução gasta 10 setas pra casar com os relógios: dá a volta pelo canto de baixo, passa pelo Soneca (uma batida a mais) e pela Neide, e chega à Cida na batida 12, evitando as batidas em que o Zé está em g e u.
    // Sem a ronda bastariam 8 setas: o Zé é o motivo de a volta ser comprida.
    dificuldade: 'dificil',
    referencia: "Opus Magnum + Into the Breach: um braço que gira em ciclo fixo e você coloca a peça na batida em que ele não está.",
    ideia: "São três relógios de uma vez (Bia sai, Cida volta, Zé patrulha); a rota certa gasta setas só pra chegar na hora em que os três deixam.",
    vilao: "O Seu Zé patrulha g e u, os dois apartamentos por onde o recado teria que passar; sem a ronda a solução teria 2 setas a menos.",
    fase: {
      titulo: "Ponto de ronda", boato: "O Seu Zé bate o ponto da portaria duas vezes",
      giros: 0, setas: 10, origens: ['r'],
      vizinhos: [
      { id:"r", nome:"Rita", tipo:"comum", pos:[2, 3] },
      { id:"z", nome:"Seu Zé", tipo:"assunto", pos:[0, 0], ronda:["z", "g", "z", "u"] },
      { id:"c", nome:"Cida", tipo:"comum", pos:[1, 1], interesse:{}, chega:8 },
      { id:"b", nome:"Bia", tipo:"comum", pos:[1, 3], interesse:{}, sai:6 },
      { id:"o", nome:"Caio", tipo:"comum", pos:[0, 2] },
      { id:"h", nome:"Lia", tipo:"comum", pos:[0, 3] },
      { id:"g", nome:"Solange", tipo:"comum", pos:[1, 0] },
      { id:"p", nome:"Paulo", tipo:"comum", pos:[2, 1] },
      { id:"v", nome:"Ivo", tipo:"comum", pos:[1, 2] },
      { id:"t", nome:"Otávio", tipo:"comum", pos:[2, 0] },
      { id:"5", nome:"Soneca", tipo:"comum", pos:[3, 1], soneca:true },
      { id:"f", nome:"Neide", tipo:"fofoqueira", pos:[3, 0] },
      { id:"4", nome:"Tetê", tipo:"comum", pos:[2, 2] },
      { id:"1", nome:"Kátia", tipo:"comum", pos:[3, 3] },
      { id:"u", nome:"Rui", tipo:"comum", pos:[0, 1] },
      { id:"a", nome:"Ana", tipo:"comum", pos:[3, 2] },
      { id:"k", nome:"Celina", tipo:"comum", pos:[4, 3] },
      ],
      amizades: [['h', 'b'], ['z', 'u'], ['z', 'g'], ['4', 'v'], ['g', 't'], ['g', 'c'], ['r', 'b'], ['b', 'v'], ['u', 'c'], ['t', 'p'], ['1', 'r'], ['o', 'h'], ['o', 'v'], ['f', 't'], ['v', 'c'], ['a', '1'], ['5', 'a'], ['5', 'p'], ['4', 'a'], ['k', '1'], ['4', 'r'], ['f', '5']],
      solucao: { 4:'a', 5:'f', r:'b', b:'h', h:'o', o:'v', v:'4', a:'5', t:'g', g:'c' },
      armadilha: { r:'b', b:'v', v:'c' }, // o atalho chega à Cida antes de ela voltar da padaria
    },
  },
];
