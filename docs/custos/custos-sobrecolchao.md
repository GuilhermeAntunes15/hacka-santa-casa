# PressuSense Air: levantamento de custos de construção (formato sobrecolchão)

HackaSanta 2026, Santa Casa. Pesquisa de preços feita em **2026-10-17**. Versão editável; o HTML e o PDF são gerados a partir dos mesmos dados.

> **Leia antes.** Este é um levantamento de custo de **construção de protótipo**. Não é preço de venda nem preço do produto final, que ainda não foi fabricado nem orçado. Preços de varejo variam: confirme na loja antes de comprar. Itens marcados **ESTIMATIVA** não têm cotação verificada. Os números entre colchetes remetem à lista de fontes no fim.

## Resumo

| Cenário | Faixa (materiais) | Observação |
|---|---|---|
| 1. Protótipo de bancada (MVP físico) | **R$ 540 – R$ 1.390** | módulo reduzido: 4–6 células + 2 laterais |
| 2. Protótipo em escala real (1 sobrecolchão) | **R$ 1.250 – R$ 4.390** | R$ 1.360 – R$ 4.600 com bateria opcional |
| 3. Pequeno lote (10–50 un.), custo unitário | **R$ 1.240 – R$ 3.330** | ESTIMATIVA, por unidade, não é preço de venda |
| Ferramentas (investimento único) | **R$ 283 – R$ 799** | não entra no custo por unidade |

## Premissas de dimensionamento

- Leito padrão de ~90 × 190 cm. Sobrecolchão com **18 células transversais** (Ø ~10 cm × 85 cm, grupos A/B alternados) e **2 câmaras longitudinais** (~180 × 30 × 8 cm) embaixo para inclinação.
- Volume de ar (ESTIMATIVA): 18 × ~6,7 L + 2 × ~43 L ≈ **~200 L**. Com 10 L/min de vazão livre, o enchimento inicial leva ≥ 20 min.
- Material (ESTIMATIVA): células 18 × 2 folhas de 20 × 90 cm ≈ 6,5 m²; laterais ≈ 2,6 m²; manta-base ≈ 1,7 m²; com 20% de perda, **~13 m²**. Módulo de bancada: **~2 m²**.
- Custo do material por m² (ESTIMATIVA derivada): PVC cristal 0,30 mm nacional ≈ R$ 25–50/m² [24]; filme TPU 0,25 mm ≈ € 8,60/m² [25]; nylon-TPU ≈ € 10,90/m² [26]. Euro a R$ 5,95 [27] × fator de importação de 1,8 a 2,2 (II + ICMS + frete) ≈ **R$ 92–143/m²**.

## 1. Protótipo de bancada (MVP físico)

Módulo reduzido (~40 × 60 cm) com 4–6 células, 2 câmaras laterais pequenas, ESP32, bomba, 3–5 válvulas e sensores de linha. Objetivo: medir vazamento, tempo de ciclo, ângulo e alarme de queda de pressão.

| Item | Qtd | Mín. | Máx. | Fonte | Obs. |
|---|---|--:|--:|---|---|
| Microcontrolador ESP32 DevKit | 1 | R$ 50 | R$ 67 | [1], [2] |  |
| Bomba de ar DC 12 V | 1 | R$ 25 | R$ 114 | [3], [4] | mín.: bomba 370 (1,8 L/min); máx.: BVU555 (10 L/min) |
| Válvulas solenoides 12 V para ar | 3–5 | R$ 160 | R$ 350 | [6], [5] | 3 × R$ 53,41 até 5 × R$ 69,99 |
| Sensor de pressão MPS20N0040D-D + HX710B | 2–3 | R$ 30 | R$ 48 | [7] |  |
| Acionamento: módulo relé 4 canais | 1–2 | R$ 19 | R$ 55 | [8], [9] | alternativa: MOSFET logic-level (ver alavancas) |
| Fonte chaveada 12 V 5 A | 1 | R$ 42 | R$ 48 | [11], [12] |  |
| Mangueira de silicone Ø 4 mm | 2–4 m | R$ 18 | R$ 35 | [13] | R$ 17,50 a cada 2 m |
| Conectores T / derivações | 6–12 | R$ 11 | R$ 24 | [14] |  |
| Válvulas de retenção (antirretorno) | 2 | R$ 10 | R$ 30 | ESTIMATIVA | preço BR não localizado |
| Protoboard + jumpers | 1 kit | R$ 40 | R$ 56 | [15], [16] |  |
| Buzzer, LEDs, diodos de roda-livre, resistores | — | R$ 15 | R$ 35 | [17] + ESTIMATIVA | buzzer R$ 2,38; restante estimado |
| Câmaras do módulo (4–6 células + 2 laterais, ~2 m²) | 1 módulo | R$ 50 | R$ 290 | [24], [25], [26], [27] + ESTIMATIVA | mín.: PVC 0,30 mm; máx.: nylon-TPU importado |
| Bicos / portas de ar soldáveis nas câmaras | 6–8 | R$ 20 | R$ 60 | ESTIMATIVA |  |
| Consumíveis de selagem (folha PTFE, fita, cola) | — | R$ 20 | R$ 50 | ESTIMATIVA |  |
| Frete (2 a 4 lojas) | — | R$ 30 | R$ 120 | ESTIMATIVA |  |
| **Total** | | **R$ 540** | **R$ 1.382** | | |

## 2. Protótipo em escala real (1 sobrecolchão)

Manta inteira com 18 células (faixa de 16–20) e 2 câmaras longitudinais, capa, alças, gabinete, alarme sonoro/LED e bateria opcional.

| Item | Qtd | Mín. | Máx. | Fonte | Obs. |
|---|---|--:|--:|---|---|
| Microcontrolador ESP32 DevKit | 1 | R$ 50 | R$ 67 | [1], [2] | pode vir da bancada |
| Bomba de ar 12 V BVU555 (10 L/min) | 1–2 | R$ 114 | R$ 239 | [4] | 2 bombas aceleram o enchimento |
| Válvulas solenoides 12 V para ar | 4–6 | R$ 214 | R$ 420 | [6], [5] | A, B, lateral esq., lateral dir. (+ exaustão) |
| Sensor de pressão MPS20N0040D-D + HX710B | 4–5 | R$ 61 | R$ 80 | [7] | 1 por linha + 1 de reserva |
| Acionamento: módulo relé 4 canais | 2 | R$ 38 | R$ 55 | [8], [9] |  |
| Fonte chaveada 12 V 5 A | 1 | R$ 46 | R$ 48 | [12] | ~2,5 A de pico com 2 bombas + válvulas |
| Mangueira de silicone Ø 4 mm | 6–10 m | R$ 53 | R$ 88 | [13] |  |
| Conectores T / manifolds | 20–30 | R$ 38 | R$ 60 | [14] |  |
| Retenção + válvula de alívio mecânica | 2–4 | R$ 20 | R$ 80 | ESTIMATIVA | proteção contra sobrepressão |
| Câmaras + manta-base (~13 m² de material) | 1 manta | R$ 330 | R$ 1.860 | [24], [25], [26], [27] + ESTIMATIVA | mín.: PVC 0,30 mm; máx.: nylon-TPU importado |
| Bicos / portas de ar soldáveis | 20–22 | R$ 60 | R$ 220 | ESTIMATIVA |  |
| Capa | 1 | R$ 63 | R$ 610 | [23] + ESTIMATIVA | mín.: protetor impermeável pronto adaptado; máx.: capa PU sob medida com costura |
| Fixação: fechos 25 mm + fita de poliéster | 4–6 alças | R$ 40 | R$ 80 | [22] + ESTIMATIVA | fechos R$ 23,83; fita estimada |
| Gabinete do controlador | 1 | R$ 21 | R$ 115 | [19], [18] | mín.: ~300 g de PETG; máx.: Patola PB-150 |
| Placa perfurada, bornes, conectores | — | R$ 25 | R$ 60 | ESTIMATIVA | substitui a protoboard |
| Alarme sonoro, LEDs, botões, passivos | — | R$ 20 | R$ 50 | [17] + ESTIMATIVA |  |
| Frete (inclui importação, se TPU) | — | R$ 60 | R$ 250 | ESTIMATIVA |  |
| **Total** | | **R$ 1.253** | **R$ 4.382** | | |
| *Bateria 12 V 7 Ah + módulo de carga (opcional)* | 1 | R$ 110 | R$ 211 | [20], [21] + ESTIMATIVA | bateria R$ 89,90–161,08 + carga estimada R$ 20–50 |

## 3. Pequeno lote (10–50 unidades): custo unitário indicativo

**ESTIMATIVA. Não é preço de venda.** Premissas: (a) componentes eletrônicos comprados em lote, de 20 a 40% abaixo do varejo; (b) câmaras e manta fabricadas por terceiro com solda HF/RF; (c) capa costurada por facção; (d) montagem e teste a R$ 30–60/h, como premissa. Fora da conta: impostos sobre venda, margem, garantia, assistência, ferramental de solda, custos regulatórios e de certificação.

| Bloco | Mín. | Máx. | Nota |
|---|--:|--:|---|
| Controlador (ESP32, sensores, acionamento, PCB própria, gabinete, alarme) | R$ 180 | R$ 350 | compra em lote; PCB fabricada substitui protoboard e placa perfurada |
| Pneumática (bomba para regime contínuo, válvulas, tubos, conexões) | R$ 350 | R$ 800 | a bomba de regime contínuo ainda precisa ser orçada |
| Câmaras + manta (TPU nacional, solda terceirizada) | R$ 400 | R$ 1.200 | a orçar com fornecedor de solda HF/RF |
| Capa PU costurada por facção | R$ 150 | R$ 400 | tecido com ficha técnica; biocompatibilidade não incluída |
| Fixação e embalagem | R$ 40 | R$ 100 |  |
| Montagem e teste por unidade (4–8 h × R$ 30–60/h, premissa) | R$ 120 | R$ 480 | valor-hora é premissa, não cotação |
| **Total por unidade** | **R$ 1.240** | **R$ 3.330** | ESTIMATIVA |

## 4. Custos não materiais

### Investimento único (ferramentas)

| Ferramenta | Mín. | Máx. | Fonte |
|---|--:|--:|---|
| Seladora manual de barra 30 cm | R$ 113 | R$ 150 | [28] |
| Soprador térmico 2000 W (reparo e selagem localizada) | R$ 110 | R$ 179 | [29] |
| Ferro de selar ou ferro doméstico + rolete | R$ 60 | R$ 150 | ESTIMATIVA |
| Impressão 3D terceirizada (se não houver impressora) | R$ 0 | R$ 200 | ESTIMATIVA |
| Multímetro (se o time não tiver) | R$ 0 | R$ 120 | ESTIMATIVA |
| Solda HF/RF de câmaras (para lote) | a orçar | a orçar | terceirizar |
| **Total** | **R$ 283** | **R$ 799** | |

### Horas estimadas (custo por unidade de protótipo; não monetizado)

| Atividade | Bancada | Escala real |
|---|---|---|
| Eletrônica e firmware | 10–20 h | 20–40 h |
| Corte e selagem das câmaras | 6–12 h | 25–50 h |
| Capa e fixação | — | 8–16 h (ou facção) |
| Montagem e testes (vazamento, ciclos, alarme) | 6–12 h | 15–30 h |
| Total | 22–44 h | 68–136 h |

Todos os números de horas são ESTIMATIVA. O trabalho é do próprio time; só vira custo em reais se houver contratação.

Testes: cargas simuladas (sacos de areia ou garrafas de água) por R$ 0–50 (ESTIMATIVA). Teste de vazamento com água e sabão, custo desprezível.

## 5. Alavancas de custo

| Alavanca | Economia aproximada | Risco do corte |
|---|---|---|
| Válvulas importadas (AliExpress) | R$ 10–25 por unidade (estimativa, preço não verificado) | Prazo de 20 a 40 dias, ficha técnica incerta e vazamento. Compre 1 de amostra antes. |
| PVC no lugar de TPU nas câmaras | Até ~R$ 1.500 no protótipo em escala (diferença entre os extremos da faixa) | Menos durável, enrijece no frio, usa plastificantes e não é adequado ao uso hospitalar. Serve para bancada e demonstração. |
| Protetor impermeável pronto como capa | ~R$ 550 contra capa sob medida | Não é bi-elástico (pode travar a inflação), não é ignífugo e não tem ficha de biocompatibilidade. |
| 1 bomba em vez de 2 | ~R$ 115–125 | Enchimento inicial lento (~20 min para ~200 L, estimativa). A loja recomenda pausa de 10 min a cada 60 min. |
| MOSFET logic-level no lugar de relés | ~R$ 10–30 + silêncio | O IRF520 não conduz bem com 3,3 V no gate. Use IRLZ44N ou um driver (ULN2803). |
| Reaproveitar a eletrônica da bancada | ~R$ 150–250 | Nenhum relevante, desde que a protoboard seja trocada por placa soldada para transporte. |
| 16 células em vez de 20 | ~10% do material das câmaras | Células mais largas distribuem a carga de forma menos uniforme. |
| Gabinete impresso no lugar de Patola | ~R$ 15–95 | Acabamento e vedação piores; depende de impressora disponível. |
| Bolsas/células prontas no lugar de fabricar | A orçar | Dimensões e conectores podem ser incompatíveis com a manta; dependência de fornecedor. |

## 6. Riscos e itens a orçar com fornecedor

| Item | O que falta | Status |
|---|---|---|
| Solda de TPU em escala | Selagem manual não é repetível. Para lote, é preciso cotar solda por alta frequência (HF/RF) com fornecedor, incluindo ferramental e gabarito. | a orçar |
| Material das câmaras no Brasil | Não foi encontrado fornecedor nacional de filme ou tecido TPU com preço público. A faixa usa referência europeia + câmbio + importação. | a orçar |
| Capa hospitalar | Tecido PU bi-elástico, impermeável e retardante a chama, com ficha técnica e dados de biocompatibilidade (ISO 10993) do fabricante do tecido. | a orçar |
| Bomba de regime contínuo | A BVU555 tem pausa recomendada de 10 min/60 min. Um produto que funciona 24 h exige bomba especificada para regime contínuo e baixo ruído. | a orçar |
| Câmbio e importação | A faixa do TPU depende do euro (~R$ 5,95, PTAX set/2026) e de tributos de importação estimados. | monitorar |
| Certificação e regulatório | Custo regulatório futuro: registro ANVISA (RDC 751/2022), segurança elétrica (IEC 60601-1), gestão de risco (ISO 14971) e biocompatibilidade (ISO 10993). Os valores não foram estimados neste documento. | não estimado |

## 7. Comparação com a BOM antiga (formato colchão, ~R$ 630 [30])

| Item | BOM antiga (R$) | Este levantamento (R$) | O que mudou |
|---|--:|--:|---|
| MCU (ESP32) | 30 | 50–67 | Preço real de varejo é maior que o estimado. |
| Bomba de ar DC 12 V | 100 | 25–239 | Depende da vazão: bancada usa bomba pequena; escala real precisa de 1–2 BVU555. |
| Válvulas solenoides (3) | 150 | 160–420 | Escala real precisa de 4–6 válvulas. |
| Espuma base RG70 | 200 | 0 | Saiu: o sobrecolchão usa o colchão existente do leito. |
| Capa PU | 100 | 63–610 | Faixa larga: protetor pronto adaptado até capa sob medida. |
| Eletrônica / cabos | 50 | 185–520 | Agora itemizado: sensores, acionamento, fonte, tubos, conexões, alarme. |
| Câmaras + manta | não listado | 50–1.860 | Novo item, e o maior custo do protótipo em escala real. |

Resumo: a espuma RG70 (~R$ 200) sai, mas entram as câmaras e a manta, que antes estavam fora da conta e passam a ser o maior item do protótipo em escala real. Na BOM antiga, sensores, fonte, tubos e conexões também estavam subestimados.

## Fontes (consultadas em 2026-10-17)

1. Usinainfo — ESP32-WROOM-32U DevKitC V4: R$ 49,97 (Pix) / R$ 52,60. https://usinainfo.com.br/esp32/esp32-wroom-32u-devkitc-v4-com-wifi-e-bluetooth-7077.html
2. Curto Circuito — Placa DOIT ESP32-WROOM-32D USB-C: R$ 67,00 (esgotada na consulta). https://curtocircuito.com.br/placa-doit-esp32-wroom-32d-usb-c.html
3. Usinainfo — Mini bomba de ar 12 V 370, 1,8 L/min, 86 kPa, ~150 mA: R$ 24,67 (Pix) / R$ 25,97. https://www.usinainfo.com.br/bombinha-de-agua-e-ar/mini-bomba-de-ar-12v-18lmin-370-8821.html
4. Usinainfo — Mini bomba de ar e vácuo 12 V BVU555, 10 L/min, 580 mA; loja recomenda pausa de 10 min a cada 60 min: R$ 113,62 (Pix) / R$ 119,60. https://www.usinainfo.com.br/bombinha-de-agua-e-ar/mini-bomba-de-ar-e-vacuo-12v-bvu555-10lmin-2873.html
5. Casa da Robótica — Mini válvula solenoide 12 V DC NF para ar, ~8 L/min, 0,18 A: R$ 69,99 (R$ 66,49 à vista). Preço lido no índice de busca; a página da versão NA estava fora do ar. https://www.casadarobotica.com/sensores-modulos/modulos/outros/mini-valvula-solenoide-12v-dc-normalmente-aberta-ou-normalmente-fechada-para-ar-gas-agua
6. Usinainfo — Mini válvula solenoide 3 vias NA/NF para ar/gás, 5–6 V ("pulso 12 V"): R$ 53,41 (Pix). Listagem antiga, confirmar a tensão antes de comprar. https://www.usinainfo.com.br/mini-fechadura-eletrica-solenoide/valvula-solenoide-para-gas-e-ar-6v-na-nf-5244.html
7. Usinainfo — Módulo sensor de pressão MPS20N0040D-D 0–40 kPa com HX710B: R$ 15,14 (Pix) / R$ 15,94. https://www.usinainfo.com.br/sensor-de-pressao/modulo-sensor-de-pressao-diferencial-0-40kpa-33v-5v-com-conversor-integrado-5452.html
8. Eletrogate — Módulo relé 4 canais 5 V com optoacoplador: R$ 18,90 (Pix) / R$ 19,90. https://www.eletrogate.com/modulo-rele-4-canais-5v
9. Baú da Eletrônica — Módulo relé 5 V 4 canais: R$ 27,50 (R$ 24,75 Pix). https://www.baudaeletronica.com.br/produto/modulo-rele-5v-4-canais.html
10. MakerHero — Módulo MOSFET IRF520N: R$ 6,80 (R$ 6,46 Pix). https://www.makerhero.com/produto/modulo-mosfet-irf520n/
11. Curto Circuito — Fonte chaveada 12 V 5 A: R$ 41,60 (esgotada na consulta). https://curtocircuito.com.br/fonte-chaveada-12v-5a.html
12. Usinainfo — Fonte colmeia 12 V 5 A 60 W bivolt MS-60-12: R$ 45,71 (Pix) / R$ 48,12. https://www.usinainfo.com.br/fonte-colmeia/fonte-chaveada-colmeia-12v-5a-60w-bivolt-ms-60-12-2609.html
13. Cobasi — Mangueira de silicone Tudo Pet 2 m, Ø int. 4 mm: R$ 17,50. https://www.cobasi.com.br/mangueira-para-aquario-silicone-2-metros-tudo-pet-3155713/p
14. Usinainfo — Conector T 1/4" para microtubo (mangueira ~4 mm): R$ 1,89 (Pix) / R$ 1,99. https://www.usinainfo.com.br/irrigacao-por-gotejamento/conector-t-14-para-microtubo-de-irrigacao-5550.html
15. Curto Circuito — Kit protoboard 830 pontos + 65 jumpers + fonte: R$ 40,15. https://curtocircuito.com.br/kit-protoboard.html
16. MakerHero — Kit Protoboard Intermediate: R$ 55,90 (R$ 53,10 Pix). https://www.makerhero.com/produto/kit-protoboard-intermediate/
17. Eletrogate — Buzzer ativo 5 V: R$ 2,38 (Pix) / R$ 2,50. https://www.eletrogate.com/buzzer-ativo-5v
18. Usinainfo — Caixa Patola PB-114 (55×97×148 mm): R$ 35,11 (Pix); PB-150 (100×150×214 mm): R$ 108,87 (Pix) / R$ 114,60. https://www.usinainfo.com.br/caixas-patola/caixa-patola-pb-150-para-montagem-100-x-150-x-214-mm-3882.html
19. Voolt3D — Filamento PETG HF 1 kg: R$ 69,90 (promoção, Pix) a R$ 139,99 (tabela). https://voolt3d.com.br/produtos/filamento-petg-hf-preto-high-fluidity-premium-1kg/
20. KaBuM! — Bateria selada Unipower UP1270SEG 12 V 7 Ah: R$ 89,90 (oferta registrada em 26/06/2026). https://www.kabum.com.br/produto/878621/kit-bateria-selada-unipower-estacionaria-vrla-up1270seg-12v-7ah-f187-5uni
21. Casas Bahia — Bateria selada 12 V 7 Ah Unipower UP1270E: R$ 161,08. https://www.casasbahia.com.br/bateria-selada-12v-7ah-vrla-unipower-up1270e/p/1572385331
22. Magazine Luiza — Kit 30 peças de fecho de engate e passador para fita de 25 mm: R$ 23,83 (Pix). Preço lido na listagem de busca. https://www.magazineluiza.com.br/busca/kit+fechos+engate
23. MadeiraMadeira — Capa impermeável/protetor de colchão solteiro com elástico: R$ 62,91 à vista. https://www.madeiramadeira.com.br/capas-impermeavel-lencol-solteiro-elast-protetor-de-colchao-421851707.html
24. Zoom (comparador) — Rolo de PVC cristal 0,30 mm × 30 m: R$ 1.492,11. A largura não aparece; se for 1,40 m, sai a ~R$ 35/m² (cálculo deste documento). https://www.zoom.com.br/plastico?page=5
25. extremtextil (DE) — Filme TPU soldável 0,25 mm, largura 150 cm: € 12,90/m com IVA, sem frete. https://www.extremtextil.de/en/tpu-film-0-25mm-weldable-265g-sqm/73120
26. extremtextil (DE) — Nylon 70 den revestido de TPU em um lado, termosselável: € 16,40/m (largura não confirmada; página fora do ar na segunda consulta). https://www.extremtextil.de/en/nylon-70den-tpu-coated-one-side-heat-sealable-220g-sqm.html
27. Numerando (PTAX/BCB) — Euro: R$ 5,9534 em 04/09/2026; média de setembro R$ 5,9488. Não havia cotação de outubro publicada na consulta. https://www.numerando.com.br/cambio/euro/2026
28. Mercado Livre — Seladora manual 30 cm RSA: R$ 112,90; Westpress 30 cm: R$ 149,90. Preços lidos na listagem de busca. https://lista.mercadolivre.com.br/seladora-de-embalagens-manual
29. Loja do Mecânico — Soprador térmico 2000 W: Lynus STL-2000 R$ 109,90; Vonder STV200 R$ 179,00. https://www.lojadomecanico.com.br/produto/151057/21/228/soprador-termico-stv200-2000w-220v-com-3-estagios-vonder-6001020127
30. Documento interno do time — "Resumo Executivo (1).pdf", seção "BOM Estimado (Protótipo)": total ~R$ 630 (formato colchão)

Regras do documento: não há preço de concorrente, alegação de superioridade nem estatística clínica. Normas são citadas como requisitos a avaliar, não como atendidas.
