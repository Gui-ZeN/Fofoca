# Fofoca! — o jogo inteiro

> Retrato do jogo em **11/11/2026**, tirado do código (`Fofoca/src`). Protótipo: roda no navegador, ninguém de fora jogou ainda.
> Plano de negócio e cronograma: `../reports/Fofoca plano de protótipo.md`. Consultas com outros modelos: vault, `Projetos/Fofoca — Consulta 1/2/3`.

---

## 1. Em uma frase

Um quebra-cabeça de **reação em cadeia** num prédio em corte: você desenha quem conta o boato pra quem, para ele chegar em quem quer saber — no tamanho e na ordem certos — **sem chegar na vítima**, que é sobre quem estão falando.

- **Público:** adultos casuais de 25 a 45 anos (forte público feminino 35+), celular em pé, partidas de 3 a 5 minutos, uma mão. Global desde o início; texto nasce em pt-BR.
- **Tom:** fofoca absurda e carinhosa ("O Seu Zé chama a samambaia de Dona Glória"). **Nunca** aparência, raça, orientação ou doença como piada.
- **O momento-chave:** a derrota engraçada — a vítima descobre e grita "QUÊ?!". É também o anúncio do jogo.

---

## 2. A história

- O lugar é o **Edifício Primavera**, um predinho brasileiro visto em corte, como casa de boneca.
- **Seu Zé é o síndico e odeia fofoca.** Às vezes ele é a própria vítima do boato; às vezes o boato é sobre outro morador (sorteado — "pra não parecer perseguição").
- Quando a vítima descobre, o síndico dá uma **advertência** (cartão amarelo). Três advertências e você fica **suspenso** até ele tirar uma (seção 7).
- O menu é o próprio prédio: você sobe andar por andar, de elevador (seção 8).

---

## 3. Como se joga (o "trilho")

1. A fase abre dizendo **pra quem você contou** (a origem: etiqueta laranja com um balãozinho). Ela já começa com um **cochicho**.
2. Você **desenha setas**: toca em quem conta e depois no vizinho que vai ouvir (ou arrasta de um apartamento pro outro). Cada morador tem **no máximo uma seta de saída**. Quem fica **sem seta guarda o boato pra si**.
3. Há um limite de setas (**"Setas x/K"**). Acabou, o contador treme.
4. Aperta **Espalhar!** e assiste: o boato anda **uma batida por vez** (850 ms cada), acendendo a luz de quem ouviu.
5. **Vence** se todas as estrelas (⭐) ouvirem — do tamanho pedido e na ordem pedida — e a vítima **não** ouvir.

**Controles:**
- Tocar num apartamento seleciona quem vai contar (contorno azul) e destaca pra quem dá pra contar (contorno tracejado).
- Depois de desenhar uma seta, a seleção pula pra quem vai ouvir, pra continuar a corrente tocando um atrás do outro.
- Tocar de novo no mesmo destino apaga a seta. **Desfazer** volta o último passo.
- Tocar em quem já está selecionado não desseleciona (o gesto natural "toco na Rita, depois na Ana" funciona).
- A faixa azul diz o que está acontecendo: "Rita guarda pra si. Toque em quem vai ouvir." / "As setas acabaram: aperte Espalhar ou desfaça."

---

## 4. As regras (o motor)

O motor é determinístico (`src/motor.ts`, função `espalhar`): a mesma jogada dá sempre o mesmo resultado. Nada de sorte.

**Como o boato anda:**
- Cada morador **ouve uma vez só**. Depois de ouvir, na batida seguinte ele conta (se tiver pra quem).
- Se duas mensagens chegam juntas na mesma pessoa, **vale a maior**; empate, vale a versão normal.
- Quem está **fora de casa** perde o recado que chegar antes da volta (seção 5, padaria).

**Tamanhos do boato:** **cochicho → fofoca → escândalo** (1, 2, 3). Começa sempre em cochicho. "Boato" é o nome da coisa toda — o tamanho do meio se chamava "boato" e confundia (um modelo jogando por texto errou por isso).

**Quem é quem:**

| Tipo | O que faz | Aceita seta? |
|---|---|---|
| **Comum** | conta pra quem a seta mandar; sem seta, guarda | sim |
| **Fofoqueira** (Neide, Lu) | conta pra **todos** os vizinhos de passagem, sozinha, na mesma batida | não |
| **Exagerado** (Beto, Lúcia) | conta **um tamanho maior** (máx. escândalo); selo **+1** na etiqueta | sim |
| **Do Contra** | conta a versão ao contrário (existe no motor; ainda não usado no trilho) | sim |
| **Padre** | ouve e não conta pra ninguém (existe no motor; ainda não usado no trilho) | não |
| **Vítima** (Seu Zé ou sorteado) | se ouvir, você perde; etiqueta vermelha | não |
| **Estrela ⭐** | quem quer saber; pode exigir tamanho exato (`= fofoca`) ou um lugar na fila (⭐1, ⭐2) | sim (comum com estrela) |

**Como se perde** (e a mensagem que aparece):
- A vítima ouviu → "Neide contou pro Seu Zé! Agora ele sabe que estão falando dele."
- Uma estrela não ouviu → "Cida não ficou sabendo de nada." / "Cida ainda estava na padaria quando o recado chegou."
- Tamanho errado → "Cida queria uma fofoca e recebeu um escândalo."
- Ordem errada → "A Bia tinha que saber antes da Cida."

**Vitória:** "Bia, Rita e Rui ficaram sabendo. Seu Zé nem desconfia."

---

## 5. As mecânicas (na ordem em que aparecem)

| Mecânica | Como funciona | Estreia (andar) |
|---|---|---|
| **Seta / trilho** | você desenha quem conta pra quem, até K setas | 1 |
| **Guardar** | quem fica sem seta não conta | 2 |
| **Estrela passa adiante** | quem quer saber também pode contar | 3 |
| **Fofoqueira** | conta pra todo mundo em volta sozinha — perigo perto da vítima, recurso quando longe | 4 |
| **Exagerado + tamanho exato** | +1 tamanho por Exagerado; a estrela quer exatamente aquele tamanho | 9 |
| **Padaria (fora de casa)** | placa com pão e número: recado que chega antes daquela batida se perde. Vale pra estrela (chegar tarde) e pra vítima (falar enquanto ela não está) | 10 |
| **Celular** | uma pessoa pode ligar pra alguém longe, sem passagem (linha pontilhada com telefone) | 13 |
| **Ordem** | ⭐1 tem que saber antes da ⭐2; junto não vale | 15 |

**Passagens:** porta na parede (vizinhos lado a lado) e escada (um em cima do outro, no canto direito). Só existe passagem onde está desenhada.

---

## 6. A campanha (os andares)

### 6.1 Tutorial (andares 1–5)
- Cada fase tem **uma dica de uma frase**, que diz a regra e **nunca** a jogada. Some na primeira seta.
- **Não custa advertência**, mesmo perdendo.
- Dicas: "Quem fica sem seta guarda o boato pra si." · "Quem quer saber também pode passar adiante." · "A Neide é fofoqueira: conta pra todo mundo em volta, sem você mandar." · "Duas pessoas querem saber."

### 6.2 Depois do tutorial
- Regra nova aparece só numa **etiqueta NOVO** de uma linha (ex.: "Exagerado: aumenta o boato um tamanho") — e numa **cena de chegada** antes da fase (seção 9).
- **Intercalado:** fase pesada, depois uma mais leve (a "escada" de dificuldade).

### 6.3 Os 28 andares feitos à mão

| Andar | Rótulo | Nome | Moradores | Prédio | Setas | O que tem |
|---|---|---|---|---|---|---|
| 1 | T1 | Primeira ligação | 3 | 3×1 | 2 | — (sem vítima) |
| 2 | T2 | Sem seta, guarda | 4 | 3×2 | 3 | sobra seta de propósito |
| 3 | T3 | Passa adiante | 5 | 3×2 | 3 | — |
| 4 | T4 | A fofoqueira | 6 | 3×2 | 3 | Fofoqueira |
| 5 | T5 | Fofoqueira do bem | 6 | 3×2 | 2 | Fofoqueira |
| 6 | T6 | Só três setas | 7 | 3×3 | 3 | Fofoqueira |
| 7 | H1 | Fofoca de segunda mão | 8 | 3×3 | 3 | 2 Fofoqueiras (vazamento a dois passos) |
| 8 | T7 | Atalho que vaza | 7 | 3×3 | 4 | Fofoqueira |
| 9 | T8 | Boato na medida | 6 | 3×2 | 3 | Exagerado, tamanho — **NOVO** |
| 10 | H2 | Foi na padaria | 6 | 3×3 | 4 | padaria — **NOVO** |
| 11 | T9 | Escândalo na medida | 9 | 3×3 | 4 | Exagerado, Fofoqueira, tamanho |
| 12 | H3 | O Zé saiu | 6 | 3×2 | 2 | Fofoqueira, padaria (vítima fora) |
| 13 | T10 | Liga pra ela | 5 | 3×2 | 2 | celular — **NOVO** |
| 14 | H4 | Fala cedo, entrega tarde | 7 | 3×3 | 3 | Fofoqueira, padaria |
| 15 | O1 | A Bia primeiro | 6 | 3×3 | 4 | ordem — **NOVO** |
| 16 | O2 | Junto não vale | 6 | 3×3 | 3 | Fofoqueira, ordem |
| 17 | H5 | Volta às quatro | 8 | 3×3 | 3 | Fofoqueira, padaria |
| 18 | O3 | A Neide por último | 9 | 3×3 | 4 | Fofoqueira, ordem |
| 19 | H6 | Na hora do pão | 8 | 3×3 | 3 | Fofoqueira, padaria |
| 20 | O4 | Um, dois, três | 8 | 3×3 | 4 | Fofoqueira, ordem (3 na fila) |
| 21 | D1 | Corredor de cima | 10 | 3×4 | 5 | 2 Fofoqueiras, Zé no meio |
| 22 | O5 | Fila do pão | 8 | 3×3 | 4 | Fofoqueira, padaria, ordem |
| 23 | D2 | Antes do Zé voltar | 10 | 3×4 | 5 | 2 Fofoqueiras, padaria |
| 24 | O6 | Na volta, por ordem | 8 | 3×3 | 4 | Fofoqueira, padaria, ordem |
| 25 | D3 | A 2 está do lado | 11 | 3×4 | 5 | 2 Fofoqueiras, ordem |
| 26 | D4 | Fofoca, não escândalo | 11 | 3×4 | 5 | 2 Exagerados, 2 Fofoqueiras, padaria, tamanho |
| 27 | D5 | Volta comprida | 10 | 3×4 | 6 | 2 Fofoqueiras, padaria, ordem |
| 28 | D6 | Reunião de condomínio | 11 | 3×4 | 6 | 2 Fofoqueiras, padaria, ordem |

As letras dizem de onde a fase veio: **T** = trilho (as 10 primeiras), **H** = bloco Hora certa, **O** = bloco Ordem, **D** = bloco difícil "Prédio cheio".

**Garantias de toda fase feita à mão** (testes): uma única solução dentro das setas; com uma seta a menos não dá (exceto a T2, onde sobrar é a lição); a armadilha registrada perde; espelhada continua o mesmo quebra-cabeça; cada regra presente muda a jogada.

### 6.4 Prédio sem fim (andar 29 em diante)
- **150 andares gerados** (`src/andares.json`) depois dos 28 feitos à mão.
- Blocos de **25**: leve → média → pesada → leve → média… e um **chefão** no andar 25 de cada bloco.

| Peso | Prédio | Moradores | Setas | Extra |
|---|---|---|---|---|
| Leve | 3×3 | 6–7 | 3–4 | 1 Fofoqueira |
| Média | 3×3 | 7–9 | 4–5 | 1 Fofoqueira |
| Pesada | 3×4 | 9–11 | 5–6 | 2 Fofoqueiras, Zé no meio com 3+ portas |
| Chefão | 3×4 | 10–12 | 6–7 | 2 Fofoqueiras, Zé no meio, 2 estrelas |

- Temas sorteados: corrente de Fofoqueiras, padaria, ordem, tamanho, padaria+ordem. Distribuição atual: 60 leves, 54 médias, 30 pesadas, 6 chefões.
- Título e boato de listas próprias ("Festa junina", "O Seu Zé ganhou concurso de bolo no clube").
- Acabou o estoque, **recomeça** — espelhado numa volta sim, outra não. O prédio vai até o andar **3.028**.
- No menu, o prédio "cresce": aparecem só 3 andares trancados acima de você.

---

## 7. Advertências do síndico (as vidas)

- **3 advertências.** Deixar a **vítima descobrir** dá uma (cartão amarelo). Errar tamanho, ordem ou esquecer uma estrela **não custa nada**.
- Na **terceira**, você fica **suspenso**: dá pra montar o trilho, mas o botão vira "Suspenso · 14:49" até o síndico tirar uma.
- O síndico tira **uma a cada 15 minutos**. A contagem começa na primeira advertência.
- **Tutorial (andares 1–5) não cobra.**
- Aparecem: no topo da fase (três cartões ao lado de "Setas"), na derrota ("O síndico te deu uma advertência (1 de 3)." / "Terceira advertência: suspenso por 14:50.") e no menu, com o relógio.
- **Ainda não existe** recuperar por anúncio ou compra (entra com a loja).
- ⚠️ Decisão do Guilherme contra o conselho do Sol (que preferia uma "medalha de discrição" sem bloquear). Rever se o teste mostrar gente largando por causa da suspensão.

---

## 8. Menu: o prédio

- Abre direto em `http://localhost:5179/` (sem link).
- Topo: "Edifício Primavera · **Fofoca!**" e os cartões de advertência com o relógio.
- Cada **andar é uma fase**: número, nome, estrela quando vencido, **cadeado** e nome escondido quando trancado.
- O **elevador** fica parado no andar onde você está (luz acesa).
- Embaixo, a **Portaria**: "Síndico: Seu Zé. Odeia fofoca: se a vítima descobrir, é advertência."
- Botão **"Jogar · 6º andar"** continua de onde parou. Dentro da fase, a **casinha** no topo volta ao prédio; o cabeçalho mostra o andar.
- O progresso fica salvo no aparelho.

---

## 9. Cenas de chegada

Na **primeira vez** que algo novo aparece, antes da fase, uma cena curta prepara o jogador. Usa o morador da própria fase, com o nome sorteado. **"Bora!"** pula a qualquer momento. Aparece **uma vez por aparelho**. Com "movimento reduzido" ligado, aparece já pronta.

| Andar | Título | O que acontece | Fala |
|---|---|---|---|
| 4 | Moradora nova! | a Neide chega andando; balõezinhos voam dela pros lados | "Cheguei! E já tô sabendo de tudo." |
| 9 | Morador novo! | o Beto chega; entra um cochicho, sai uma fofoca | "Cochicho? Comigo vira fofoca!" |
| 10 | Hora do pão | um morador sai do prédio e deixa a placa com o pão e o "3" | "Vou ali na padaria e já volto!" |
| 13 | Celular novo | o telefone toca na mão de quem vai poder ligar | "Agora eu ligo pra quem eu quiser!" |
| 15 | Fila da fofoca | quem chega ganha o ⭐1, a ⭐2 espera na porta, o balão passa pela 1 antes | "Eu primeiro, viu?" |

Depois da fala, uma frase explica a regra.

---

## 10. Visual

- **Prédio em corte** numa rua: céu, sol, nuvens passando, silhuetas do bairro, calçada, rua com faixa, poste.
- **Personagens cabeçudos de charge**, cada um com silhueta própria, respirando e piscando cada um no seu tempo.
  - Comuns: **Cida** (vovó), **Ana** (cabelo black), **Bia** (dona do cachorro), **Rita** e **Lia** (estudante), **Davi** (grandalhão), **Rui** (magrelo), **Edu** (senhor de óculos).
  - Especiais: **Neide/Lu** (Fofoqueira, de bobes), **Beto/Lúcia** (Exagerado/a), **Seu Zé**, Padre, três Do Contra.
  - Expressões: neutro, ouvindo, contando, chocado, bravo.
  - A cada abertura (fora do modo teste), os nomes trocam dentro do mesmo gênero, o prédio pode espelhar, e em ~35% das vezes a vítima é outro morador.
- **Apartamento vazio** tem cena própria (janela com lua, cama, caixas, placa de "aluga-se").
- **Rastro de cochicho:** três bolinhas crescendo na direção de quem ouve, com uma pontinha. Ligação de celular: pontilhado com o telefone em quem liga.
- **Leitura:** origem = etiqueta laranja; vítima = etiqueta vermelha; selecionado = contorno azul; pode ouvir = tracejado azul; ouviu = luz amarela; estrela com "=" e ícone quando exige tamanho; número da vez colado na estrela; placa de pão com número em quem saiu.
- **No alto da fase:** o boato, "Setas x/K", cartões de advertência, a escadinha "cochicho › fofoca › escândalo" (quando o tamanho importa), a etiqueta NOVO e a faixa de dica/estado.
- **O desfecho** (vitória/derrota) flutua por cima da rua, sem empurrar o prédio.
- **Fonte:** Bricolage Grotesque. **Ícones** desenhados, nada de emoji.

---

## 11. Modo teste (com pessoas)

| Link | O que abre |
|---|---|
| `?grupo=A` | as 10 fases do trilho e depois 4 fases de "giros" (mesmos prédios, setas prontas, você só gira) |
| `?grupo=B` | a mesma coisa na ordem inversa |
| `?bloco=hora` / `?bloco=ordem` / `?bloco=dificil` | só aquele bloco de 6 fases |

- No modo teste, **cada fase abre sempre igual** pra todo mundo (sem espelho, nomes fixos por fase), **sem advertência** e **sem cena de chegada**.
- Protocolo no `README.md`: entregar sem explicar; pedir pra apontar origem, vítima, objetivo e próximo destino; separar erro de leitura de erro de plano; perguntar "o que você mudaria agora, e o que espera que aconteça?"; ajuda padrão depois de 2 minutos travado; anotar desde a fase 1.
- **Ainda não rodou.** Falta escolher onde hospedar a pasta `dist/`.

---

## 12. Por dentro (técnico)

**Stack:** React + TypeScript + SVG, Vite, Vitest. Sem servidor: tudo no aparelho. Depois, Capacitor pra virar app Android.

| Arquivo | O que faz |
|---|---|
| `src/motor.ts` | regras puras: `espalhar`, avaliação de vitória/derrota |
| `src/trilho.ts` | as 10 fases T, `jogar`, `resolverTrilho` (acha todas as soluções), `espelhar` |
| `src/horaCerta.ts`, `src/ordem.ts`, `src/dificil.ts` | blocos H, O e D (6 fases cada) |
| `src/campanha.ts` | a ordem intercalada dos 28 + o prédio sem fim |
| `src/andares.json` | os 150 andares gerados |
| `src/fabrica.ts` | a fábrica de fases (monta prédio aleatório e só aceita com certificado) |
| `scripts/gerarAndares.ts`, `scripts/juntarAndares.ts` | geram e juntam o estoque |
| `src/advertencias.ts` | regra das vidas (pura, testada) |
| `src/elenco.ts` | troca de nomes e vítima ao abrir |
| `src/App.tsx` | campanha, modo teste, a tela da fase, o desfecho |
| `src/Menu.tsx`, `src/Chegada.tsx` | o prédio-menu e as cenas de chegada |
| `src/Predio.tsx`, `src/Cena.tsx`, `src/Personagem.tsx`, `src/Vazio.tsx`, `src/Icones.tsx`, `src/estilo.css` | o desenho |
| `src/comparacao.ts` | as 4 fases de giros do teste A/B |
| `src/gerador.ts`, `src/trilha.ts`, `src/variar.ts`, `src/fases.ts` | mecânica antiga (origem livre + giros), fora da tela, só nos testes |

**Resolvedor:** só decide a seta de quem de fato ouve, na ordem em que ouve. Dá o mesmo resultado da força bruta antiga (conferido em 485 casos) e é rápido o bastante pra prédio 3×4.

**Certificado da fábrica** (o que uma fase gerada precisa passar):
1. uma única solução no menor número de setas;
2. com uma seta a mais, no máximo 2 soluções;
3. o caminho mais curto até as estrelas (ignorando vítima, horário, ordem e tamanho) **perde**;
4. nas pesadas, quem só aprendeu "não cutucar o Zé nem a Fofoqueira colada nele" também perde;
5. cada regra presente muda a jogada;
6. no máximo 7 moradores comuns (só existem 7 desenhos de comum).

**Números de hoje:** 563 testes em 13 arquivos, todos passando; pacote do jogo ~330 KB (~79 KB comprimido). Os 150 andares gerados saem em ~15 s.

**Guardado no aparelho:** `fofoca.campanha.liberada` (andar), `fofoca.campanha.tentativas`, `fofoca.advertencias`, `fofoca.visto.<andar>` (cenas vistas); no teste, `fofoca.teste.A/B.*` e `fofoca.<bloco>.*`.

**Como rodar** (pasta `Fofoca`):
```bash
npm install
npm run dev
npm test
npm run build
```
⚠️ Não use `npm run dev -- --host`: o Vite 5 / Vitest 2 instalados têm alerta de segurança no servidor de desenvolvimento. Pra jogar no celular, hospede a pasta `dist/`.

---

## 13. O que aprendemos medindo

- **Com origem livre, sempre havia vitória de um toque** (399 de 399 prédios) → nasceu o trilho (Consulta 1, Sol).
- **Em prédios aleatórios, o caminho mais curto ganha 98% das vezes.** A dificuldade vem de armadilha, não de regra a mais (Consulta 3).
- "Armadilha possível" por mecânica: **padaria 20–33%**, passar por X 19–29%, ordem 15–18%, fonte 12–20%, desconfiado 7–19%, dedo-duro 7–15%; **"usar todas as setas" é trivial** (96–98%: basta gastar uma seta à toa).
- **Vilão na ponta:** nas 20 fases com vítima, 0 no meio. Pôr o Zé no meio sozinho **não** dificulta (caminho curto acerta 99%): ele só ouve por seta sua ou por Fofoqueira colada. Quem dificulta é a Fofoqueira em volta dele.
- **Opiniões externas** (Sol e Astra, modelos da OpenAI): o teste A/B tinha vícios (corrigidos); o visual pedia separar papéis de estados (corrigido); ainda é cedo pra mais mecânicas antes de testar com gente.

---

## 14. O que ainda falta

**Jogo**
- Mecânica nova a cada 25–50 andares no prédio sem fim (hoje os blocos só variam tamanho e combinação). Candidatas: **Fonte** ("só acredita se vier da Ana"), **Desconfiado** (precisa ouvir de duas pessoas), **síndico que fecha uma passagem** na batida N, **estrela opcional** "em até N setas", **festa do prédio** (todo mundo menos a vítima).
- Padre e Do Contra no trilho (com cena de chegada).
- O síndico fora do tabuleiro (cena de derrota com a vítima reclamando).
- **Som:** "psst" a cada batida, "QUÊ?!" na derrota.
- Visual pendente: porta e escada mais claras; destacar na derrota quem contou pra vítima; reações específicas por boato; desenhos novos de comum (as fases D ainda repetem Lia = Rita).
- Ajustes, Fofoca do dia, Álbum de causos (meta).

**Produto e lançamento**
- O **teste com 5 pessoas** (precisa hospedar `dist/`).
- Analytics, app Android (Capacitor), conta no Google Play.
- Nome global e tradução (en/es), criativos em vídeo.
- Monetização: o plano ainda fala em "+1 giro" (no trilho seria "+1 seta") e "sem vidas no protótipo" (as advertências contradizem).

**Casa**
- Projeto **sem git**.
- Sem nota do projeto no vault (`Projetos/Fofoca.md`); só as consultas.
- Mecânica antiga ainda no código, só nos testes.
