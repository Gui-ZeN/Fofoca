# Fofoca — protótipo da semana 0

Quebra-cabeça de reação em cadeia: o boato precisa chegar em quem quer saber (⭐) sem chegar no Seu Zé. O plano completo está em `../reports/Fofoca plano de protótipo.md`.

O visual é cru de propósito: esta versão testa **a regra**, não a arte.

```bash
npm install
npm run dev      # http://localhost:5173 (só no seu PC; veja o aviso abaixo)
npm test         # motor, trilho, comparação, variações e as fases geradas da mecânica antiga
npm run build    # gera dist/, que abre em qualquer hospedagem estática
```

> ⚠️ **Não use `npm run dev -- --host`.** O Vite 5 e o Vitest 2 instalados aqui têm alertas de segurança no **servidor de desenvolvimento** (leitura de arquivos e execução remota quando ele fica exposto na rede). A correção exige subir de versão principal (Vite 8 / Vitest 5), e as versões mais novas saíram há poucos dias. Para jogar no celular, rode `npm run build` e hospede a pasta `dist/`: o build final é estático e não carrega o servidor.

## Publicado
- Jogo: https://gui-zen.github.io/Fofoca/
- Teste com participante novo: https://gui-zen.github.io/Fofoca/?pesquisa&zerar

Cada push no `main` roda testes → build → publicação (`.github/workflows/pages.yml`); teste falhando não publica. O site é estático: o progresso fica no aparelho de quem joga. `PRODUCT.md` (metas e estratégia) não vai pro repositório.

## Mecânica atual: o trilho (protótipo)
Você contou pra uma pessoa, desenha quem conta pra quem (tocar um apartamento e depois o vizinho, ou arrastar), com setas limitadas, e espalha. Decidido na Consulta 1 com o Sol (vault: `Projetos/Fofoca — Consulta 1 (gpt-6.1-sol) — mecânica do trilho.md`). A mecânica antiga (origem livre + giros) e a trilha gerada continuam no código e nos testes, mas fora da tela, até o gerador do trilho existir.

## Arquivos
- `src/motor.ts`: regras puras (`espalhar`) e o `resolver`, que acha todas as soluções de uma fase.
- `src/fases.ts`: as 12 fases feitas à mão (viram tutoriais no começo de cada bloco).
- `src/gerador.ts`: monta fases do zero e dá nota de dificuldade; `src/trilha.ts`: os blocos de 25 fases e a fase n da trilha (sem fim).
- `src/variar.ts`: sorteia uma variação da fase cada vez que ela abre.
- `src/*.test.ts`: motor, as 12 fases, as variações e as 100 primeiras fases da trilha (todas justas, bem formadas, dificuldade subindo).
- `src/App.tsx`, `src/Predio.tsx`, `src/Personagem.tsx`, `src/Vazio.tsx`, `src/Icones.tsx` + `src/estilo.css`: a tela.

## Campanha (abre sem link)
`http://localhost:5179/` abre o jogo de verdade: o **menu é o prédio** (`src/Menu.tsx`), cada andar uma fase, o elevador parado no andar atual, andares de cima trancados até vencer o de baixo, progresso salvo no aparelho. São as 28 fases do trilho **intercaladas** (`src/campanha.ts`: tutorial T1–T5, depois pesada e leve alternando; cada regra estreia na fase com a etiqueta NOVO). A casinha no topo volta ao prédio.

**Prédio sem fim:** depois dos 28 andares feitos à mão vêm **150 andares gerados** (`src/andares.json`), em blocos de 25 com a escada leve → média → pesada e um **chefão** no fim de cada bloco (prédio 3×4, Zé no meio, duas Fofoqueiras, 6–7 setas). Acabou o estoque, ele recomeça espelhado numa volta sim, outra não. O menu só mostra até 3 andares trancados acima de você: o prédio "cresce". Todo andar gerado é recertificado nos testes (`src/andares.test.ts`).

Pra fabricar mais (ou de novo), da pasta Fofoca — cada bloco de 25 leva segundos:
```bash
npx vite-node scripts/gerarAndares.ts 0 25 bloco0.json
npx vite-node scripts/juntarAndares.ts bloco0.json bloco1.json …
```
A fábrica (`src/fabrica.ts`) só aceita um prédio com uma solução única no menor número de setas, em que o caminho mais curto perde (e, nas pesadas, quem só aprendeu a evitar o Zé e a Fofoqueira colada nele também perde) e em que cada regra presente muda a jogada. Ela não põe mais de 7 moradores comuns num prédio: só existem 7 desenhos de comum.

**Cenas de chegada** (`src/Chegada.tsx`): na 1ª vez que algo novo estreia na campanha, antes da fase, uma cena curta prepara o jogador — a Neide chega e os balões voam dela (andar 4), o Beto transforma cochicho em fofoca (9), alguém sai pra padaria e deixa a placa (10), alguém ganha celular (13), a fila da 1 e da 2 (15). Usa o morador da própria fase, com o nome sorteado; "Bora!" pula a qualquer momento; aparece uma vez por aparelho (`fofoca.visto.<rótulo>`). A etiqueta NOVO continua na fase. Não aparece nos links de teste.

**Advertências do síndico** (`src/advertencias.ts`, vidas clássicas): o Seu Zé é o síndico e odeia fofoca. Depois do tutorial, cada vez que a vítima descobre, ele dá uma advertência (cartão amarelo); na terceira você fica **suspenso** — monta o trilho mas não espalha — até ele tirar uma (uma a cada 15 min). Errar tamanho, ordem ou esquecer uma estrela não custa nada. Anúncio/compra pra recuperar: quando houver loja. Os links de teste (`?grupo`, `?bloco`) não têm advertência.

## Teste com 5 pessoas (pesquisa na campanha)
Roteiro fechado na Consulta 4 (Sol + Astra, vault). A pergunta da rodada: **prever, espalhar e corrigir sustenta uma sessão voluntária?** Não é votação nem medida de retenção: são 5 pessoas.

**Link:** `?pesquisa` — a campanha de verdade (menu, cenas de chegada, mesma sequência), **igual pra todo participante** e **sem advertências** (decisão do Guilherme, 11/11/2026: o teste mede o ciclo de jogo; **não** aprova as vidas). Progresso próprio, separado da campanha normal. Pra cada participante novo, abra **`?pesquisa&zerar`** (apaga só os dados da pesquisa).

**Quem:** pessoas do público (adultos casuais) que não conheçam o projeto, com variação de familiaridade com puzzle e celular. **2 pessoas → corrigir o que travou → 3 pessoas**, numa versão estável; relate cada versão separado.

1. **Preparar:** celular em pé, `?pesquisa&zerar`. Anote código anônimo, versão, aparelho e tamanho da tela.
2. **Apresentar sem ensinar:** "Abra e jogue como faria sozinho. Estamos testando o jogo. Você pode parar quando quiser." (Se houver compensação, ela não depende de continuar.)
3. **Observar até 3 minutos**, a partir do menu. Não explique, não peça pra pensar em voz alta, não pergunte nada. Anote: primeira seta, primeira tentativa, primeira vitória, erros aparentes, reações (riu do "QUÊ?!"?).
4. **Travou:** 2 minutos **sem nenhuma hipótese nova** (mexer e testar ideias conta como atividade) → anote o que aconteceu e pergunte "Você prefere uma ajuda ou encerrar por aqui?". Se aceitar, explique só o gesto ou a regra envolvida, sempre com a mesma frase. Daí em diante esse trecho é assistido.
5. **Saída real, antes da entrevista:** "Podemos encerrar aqui. Se quiser, pode jogar mais um andar; encerrar também está tudo certo." Anote a escolha (sem comemorar).
6. **Diagnóstico, depois:** "Quem começa? Quem precisa ouvir? Como você indica pra quem alguém vai contar?" (na 1ª fase não há vítima — pergunte "há alguém que não pode ouvir? mostre" numa fase que tenha). Depois de uma derrota: "O que você mudaria agora, e o que espera que aconteça?". Fofoqueira: numa fase ainda não jogada, "Se espalhar assim, quem vai ouvir?".
7. **Sobre o jogo:** "Como você explicaria esse jogo pra alguém?", "Qual momento você contaria pra outra pessoa?", "Do que você lembra do boato?".
8. **Folha do observador** (uma linha por episódio): horário, andar, o que parecia querer, o que fez, classificação (gesto · leitura · regra · plano · **incerto**), ajuda, fala relevante. Anote também onde a advertência **teria** sido cobrada (vítima descobriu, depois do andar 5).
9. **Retornos:** reabriu no dia seguinte / no 7º dia? Marque se foi espontâneo ou depois de lembrete.
10. **Registro das jogadas:** o menu da pesquisa mostra "Participante P-XXXX · exportar registro". Anote o código na folha. No fim, toque em **exportar registro** pra baixar o arquivo (`fofoca-registro-P-XXXX-data.json`). O registro **não** é apagado pelo `&zerar` (só o progresso é), então dá pra exportar tudo de uma vez no fim do dia; cada sessão leva o código de quem jogou. Ele guarda: abertura do app, cada tela (menu, cena de chegada, montando, espalhando, resultado), cada tentativa (andar, plano, setas, venceu/perdeu e por quê), o resultado efetivamente visto e quando o app foi pra segundo plano — com o tempo desde a abertura. Nada de nome, toque ou dado pessoal.

**Como ler:** não entenderam → corrigir ensino ou leitura; entenderam mas corrigem por adivinhação → olhar o retorno da derrota e as fases; entenderam, corrigiram com intenção e quiseram continuar → próxima rodada; entenderam e não quiseram continuar → investigar o interesse antes de criar qualquer conteúdo.

### Links antigos (diagnóstico, não o teste principal)
- `?grupo=A` / `?grupo=B`: as 10 fases do trilho × 4 de giros (setas prontas, só gira; `src/comparacao.ts`). Útil se alguém entende a regra mas sofre pra montar o trilho.
- `?bloco=hora` / `ordem` / `dificil`: cada bloco de 6 fases.

## Bloco "Hora certa" (6 fases, sessão separada)
`?bloco=hora` (ou `#hora`) abre só as 6 fases de `src/horaCerta.ts`, no modo teste (cada fase sempre igual), com progresso próprio. A novidade é uma só: quem está **fora de casa até a batida N** (placa com pão e número; recado que chega antes se perde). H1 aquece só com as regras atuais (vazamento a dois passos: uma Fofoqueira longe do Zé conta pra outra colada nele); H2 estreia a padaria; H3 tira o Zé de casa; H4–H6 combinam com a Fofoqueira. Jogue **noutra sessão**, depois do teste trilho × giros, pra fadiga das 14 fases não se misturar com "difícil agrada ou afasta" (Consulta 3, vault). Sinal de passar do ponto (critério do Astra, não benchmark): 2 pessoas que entendem as regras ficam 2 minutos sem nova hipótese e querem largar a mesma fase.

## Bloco "Ordem" (6 fases, sessão separada)
`?bloco=ordem` (ou `#ordem`) abre as 6 fases de `src/ordem.ts`, também no modo teste e com progresso próprio. A novidade: a estrela com número menor (⭐1, ⭐2, ⭐3) tem que saber **antes** — empate perde (`interesse.ordem` no motor; derrota "A Bia tinha que saber antes da Cida."). O1 apresenta (a estrela mais perto é a 2); O2 mostra que a Fofoqueira conta pra todos **juntos**, e junto não vale; O3 (do Astra) deixa a Fofoqueira por último; O4 tem três na fila com a Fofoqueira abrindo; O5–O6 combinam com a padaria.

## Bloco "Prédio cheio" (difícil, 6 fases, sessão separada)
`?bloco=dificil` (ou `#dificil`) abre `src/dificil.ts`. Sem regra nova: prédio 3×4, o Zé **no meio** e cercado (3–4 portas), duas Fofoqueiras (uma colada nele) e soluções de 5–6 setas, combinando padaria, ordem e tamanho exato. Achadas pelo buscador (1 solução; o caminho mais curto perde; quem só aprendeu "não cutucar o Zé nem a Fofoqueira colada" também perde; cada regra combinada muda a jogada). O resolvedor do trilho passou a decidir só a seta de quem ouve (mesmo resultado da força bruta, conferido em 485 casos), o que deixa o 3×4 rápido.

Limites conhecidos (Consulta 2, vault): 5 pessoas dão razões e comportamentos, não uma votação; G0–G3 também têm origem fixa, então o A/B compara "desenhar o trilho" × "corrigir setas prontas"; os prédios de G1–G3 são os de T4, T6, T7, e quem já jogou um reconhece o outro (a ordem alternada só divide esse efeito).

Como ler (critérios do Sol, não benchmark): 3 de 5 erram o gesto → consertar a interação antes de julgar; 3 de 5 não preveem a Fofoqueira → consertar o ensino; entendem mas só seguem o caminho curto → faltam decisões nas fases; resolvem, explicam e não querem outra fase → sinal forte contra a mecânica.
