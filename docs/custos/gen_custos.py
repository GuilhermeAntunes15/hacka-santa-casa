# Gera custos-sobrecolchao.md e .html a partir de uma unica tabela de dados (totais calculados, nao digitados).
import html, sys, os

OUT = sys.argv[1]
DATA = "2026-10-17"

# ---------- Fontes (consultadas em 2026-10-17) ----------
S = {
 1: ("Usinainfo — ESP32-WROOM-32U DevKitC V4: R$ 49,97 (Pix) / R$ 52,60", "https://usinainfo.com.br/esp32/esp32-wroom-32u-devkitc-v4-com-wifi-e-bluetooth-7077.html"),
 2: ("Curto Circuito — Placa DOIT ESP32-WROOM-32D USB-C: R$ 67,00 (esgotada na consulta)", "https://curtocircuito.com.br/placa-doit-esp32-wroom-32d-usb-c.html"),
 3: ("Usinainfo — Mini bomba de ar 12 V 370, 1,8 L/min, 86 kPa, ~150 mA: R$ 24,67 (Pix) / R$ 25,97", "https://www.usinainfo.com.br/bombinha-de-agua-e-ar/mini-bomba-de-ar-12v-18lmin-370-8821.html"),
 4: ("Usinainfo — Mini bomba de ar e vácuo 12 V BVU555, 10 L/min, 580 mA; loja recomenda pausa de 10 min a cada 60 min: R$ 113,62 (Pix) / R$ 119,60", "https://www.usinainfo.com.br/bombinha-de-agua-e-ar/mini-bomba-de-ar-e-vacuo-12v-bvu555-10lmin-2873.html"),
 5: ("Casa da Robótica — Mini válvula solenoide 12 V DC NF para ar, ~8 L/min, 0,18 A: R$ 69,99 (R$ 66,49 à vista). Preço lido no índice de busca; a página da versão NA estava fora do ar", "https://www.casadarobotica.com/sensores-modulos/modulos/outros/mini-valvula-solenoide-12v-dc-normalmente-aberta-ou-normalmente-fechada-para-ar-gas-agua"),
 6: ("Usinainfo — Mini válvula solenoide 3 vias NA/NF para ar/gás, 5–6 V (\"pulso 12 V\"): R$ 53,41 (Pix). Listagem antiga, confirmar a tensão antes de comprar", "https://www.usinainfo.com.br/mini-fechadura-eletrica-solenoide/valvula-solenoide-para-gas-e-ar-6v-na-nf-5244.html"),
 7: ("Usinainfo — Módulo sensor de pressão MPS20N0040D-D 0–40 kPa com HX710B: R$ 15,14 (Pix) / R$ 15,94", "https://www.usinainfo.com.br/sensor-de-pressao/modulo-sensor-de-pressao-diferencial-0-40kpa-33v-5v-com-conversor-integrado-5452.html"),
 8: ("Eletrogate — Módulo relé 4 canais 5 V com optoacoplador: R$ 18,90 (Pix) / R$ 19,90", "https://www.eletrogate.com/modulo-rele-4-canais-5v"),
 9: ("Baú da Eletrônica — Módulo relé 5 V 4 canais: R$ 27,50 (R$ 24,75 Pix)", "https://www.baudaeletronica.com.br/produto/modulo-rele-5v-4-canais.html"),
 10: ("MakerHero — Módulo MOSFET IRF520N: R$ 6,80 (R$ 6,46 Pix)", "https://www.makerhero.com/produto/modulo-mosfet-irf520n/"),
 11: ("Curto Circuito — Fonte chaveada 12 V 5 A: R$ 41,60 (esgotada na consulta)", "https://curtocircuito.com.br/fonte-chaveada-12v-5a.html"),
 12: ("Usinainfo — Fonte colmeia 12 V 5 A 60 W bivolt MS-60-12: R$ 45,71 (Pix) / R$ 48,12", "https://www.usinainfo.com.br/fonte-colmeia/fonte-chaveada-colmeia-12v-5a-60w-bivolt-ms-60-12-2609.html"),
 13: ("Cobasi — Mangueira de silicone Tudo Pet 2 m, Ø int. 4 mm: R$ 17,50", "https://www.cobasi.com.br/mangueira-para-aquario-silicone-2-metros-tudo-pet-3155713/p"),
 14: ("Usinainfo — Conector T 1/4\" para microtubo (mangueira ~4 mm): R$ 1,89 (Pix) / R$ 1,99", "https://www.usinainfo.com.br/irrigacao-por-gotejamento/conector-t-14-para-microtubo-de-irrigacao-5550.html"),
 15: ("Curto Circuito — Kit protoboard 830 pontos + 65 jumpers + fonte: R$ 40,15", "https://curtocircuito.com.br/kit-protoboard.html"),
 16: ("MakerHero — Kit Protoboard Intermediate: R$ 55,90 (R$ 53,10 Pix)", "https://www.makerhero.com/produto/kit-protoboard-intermediate/"),
 17: ("Eletrogate — Buzzer ativo 5 V: R$ 2,38 (Pix) / R$ 2,50", "https://www.eletrogate.com/buzzer-ativo-5v"),
 18: ("Usinainfo — Caixa Patola PB-114 (55×97×148 mm): R$ 35,11 (Pix); PB-150 (100×150×214 mm): R$ 108,87 (Pix) / R$ 114,60", "https://www.usinainfo.com.br/caixas-patola/caixa-patola-pb-150-para-montagem-100-x-150-x-214-mm-3882.html"),
 19: ("Voolt3D — Filamento PETG HF 1 kg: R$ 69,90 (promoção, Pix) a R$ 139,99 (tabela)", "https://voolt3d.com.br/produtos/filamento-petg-hf-preto-high-fluidity-premium-1kg/"),
 20: ("KaBuM! — Bateria selada Unipower UP1270SEG 12 V 7 Ah: R$ 89,90 (oferta registrada em 26/06/2026)", "https://www.kabum.com.br/produto/878621/kit-bateria-selada-unipower-estacionaria-vrla-up1270seg-12v-7ah-f187-5uni"),
 21: ("Casas Bahia — Bateria selada 12 V 7 Ah Unipower UP1270E: R$ 161,08", "https://www.casasbahia.com.br/bateria-selada-12v-7ah-vrla-unipower-up1270e/p/1572385331"),
 22: ("Magazine Luiza — Kit 30 peças de fecho de engate e passador para fita de 25 mm: R$ 23,83 (Pix). Preço lido na listagem de busca", "https://www.magazineluiza.com.br/busca/kit+fechos+engate"),
 23: ("MadeiraMadeira — Capa impermeável/protetor de colchão solteiro com elástico: R$ 62,91 à vista", "https://www.madeiramadeira.com.br/capas-impermeavel-lencol-solteiro-elast-protetor-de-colchao-421851707.html"),
 24: ("Zoom (comparador) — Rolo de PVC cristal 0,30 mm × 30 m: R$ 1.492,11. A largura não aparece; se for 1,40 m, sai a ~R$ 35/m² (cálculo deste documento)", "https://www.zoom.com.br/plastico?page=5"),
 25: ("extremtextil (DE) — Filme TPU soldável 0,25 mm, largura 150 cm: € 12,90/m com IVA, sem frete", "https://www.extremtextil.de/en/tpu-film-0-25mm-weldable-265g-sqm/73120"),
 26: ("extremtextil (DE) — Nylon 70 den revestido de TPU em um lado, termosselável: € 16,40/m (largura não confirmada; página fora do ar na segunda consulta)", "https://www.extremtextil.de/en/nylon-70den-tpu-coated-one-side-heat-sealable-220g-sqm.html"),
 27: ("Numerando (PTAX/BCB) — Euro: R$ 5,9534 em 04/09/2026; média de setembro R$ 5,9488. Não havia cotação de outubro publicada na consulta", "https://www.numerando.com.br/cambio/euro/2026"),
 28: ("Mercado Livre — Seladora manual 30 cm RSA: R$ 112,90; Westpress 30 cm: R$ 149,90. Preços lidos na listagem de busca", "https://lista.mercadolivre.com.br/seladora-de-embalagens-manual"),
 29: ("Loja do Mecânico — Soprador térmico 2000 W: Lynus STL-2000 R$ 109,90; Vonder STV200 R$ 179,00", "https://www.lojadomecanico.com.br/produto/151057/21/228/soprador-termico-stv200-2000w-220v-com-3-estagios-vonder-6001020127"),
 30: ("Documento interno do time — \"Resumo Executivo (1).pdf\", seção \"BOM Estimado (Protótipo)\": total ~R$ 630 (formato colchão)", ""),
}

# linha: (item, qtd, min, max, fontes(list[int]), est(bool), obs)
C1 = [
 ("Microcontrolador ESP32 DevKit", "1", 50, 67, [1, 2], False, ""),
 ("Bomba de ar DC 12 V", "1", 25, 114, [3, 4], False, "mín.: bomba 370 (1,8 L/min); máx.: BVU555 (10 L/min)"),
 ("Válvulas solenoides 12 V para ar", "3–5", 160, 350, [6, 5], False, "3 × R$ 53,41 até 5 × R$ 69,99"),
 ("Sensor de pressão MPS20N0040D-D + HX710B", "2–3", 30, 48, [7], False, ""),
 ("Acionamento: módulo relé 4 canais", "1–2", 19, 55, [8, 9], False, "alternativa: MOSFET logic-level (ver alavancas)"),
 ("Fonte chaveada 12 V 5 A", "1", 42, 48, [11, 12], False, ""),
 ("Mangueira de silicone Ø 4 mm", "2–4 m", 18, 35, [13], False, "R$ 17,50 a cada 2 m"),
 ("Conectores T / derivações", "6–12", 11, 24, [14], False, ""),
 ("Válvulas de retenção (antirretorno)", "2", 10, 30, [], True, "preço BR não localizado"),
 ("Protoboard + jumpers", "1 kit", 40, 56, [15, 16], False, ""),
 ("Buzzer, LEDs, diodos de roda-livre, resistores", "—", 15, 35, [17], True, "buzzer R$ 2,38; restante estimado"),
 ("Câmaras do módulo (4–6 células + 2 laterais, ~2 m²)", "1 módulo", 50, 290, [24, 25, 26, 27], True, "mín.: PVC 0,30 mm; máx.: nylon-TPU importado"),
 ("Bicos / portas de ar soldáveis nas câmaras", "6–8", 20, 60, [], True, ""),
 ("Consumíveis de selagem (folha PTFE, fita, cola)", "—", 20, 50, [], True, ""),
 ("Frete (2 a 4 lojas)", "—", 30, 120, [], True, ""),
]

C2 = [
 ("Microcontrolador ESP32 DevKit", "1", 50, 67, [1, 2], False, "pode vir da bancada"),
 ("Bomba de ar 12 V BVU555 (10 L/min)", "1–2", 114, 239, [4], False, "2 bombas aceleram o enchimento"),
 ("Válvulas solenoides 12 V para ar", "4–6", 214, 420, [6, 5], False, "A, B, lateral esq., lateral dir. (+ exaustão)"),
 ("Sensor de pressão MPS20N0040D-D + HX710B", "4–5", 61, 80, [7], False, "1 por linha + 1 de reserva"),
 ("Acionamento: módulo relé 4 canais", "2", 38, 55, [8, 9], False, ""),
 ("Fonte chaveada 12 V 5 A", "1", 46, 48, [12], False, "~2,5 A de pico com 2 bombas + válvulas"),
 ("Mangueira de silicone Ø 4 mm", "6–10 m", 53, 88, [13], False, ""),
 ("Conectores T / manifolds", "20–30", 38, 60, [14], False, ""),
 ("Retenção + válvula de alívio mecânica", "2–4", 20, 80, [], True, "proteção contra sobrepressão"),
 ("Câmaras + manta-base (~13 m² de material)", "1 manta", 330, 1860, [24, 25, 26, 27], True, "mín.: PVC 0,30 mm; máx.: nylon-TPU importado"),
 ("Bicos / portas de ar soldáveis", "20–22", 60, 220, [], True, ""),
 ("Capa", "1", 63, 610, [23], True, "mín.: protetor impermeável pronto adaptado; máx.: capa PU sob medida com costura"),
 ("Fixação: fechos 25 mm + fita de poliéster", "4–6 alças", 40, 80, [22], True, "fechos R$ 23,83; fita estimada"),
 ("Gabinete do controlador", "1", 21, 115, [19, 18], False, "mín.: ~300 g de PETG; máx.: Patola PB-150"),
 ("Placa perfurada, bornes, conectores", "—", 25, 60, [], True, "substitui a protoboard"),
 ("Alarme sonoro, LEDs, botões, passivos", "—", 20, 50, [17], True, ""),
 ("Frete (inclui importação, se TPU)", "—", 60, 250, [], True, ""),
]
C2_OPC = ("Bateria 12 V 7 Ah + módulo de carga (opcional)", "1", 110, 211, [20, 21], True, "bateria R$ 89,90–161,08 + carga estimada R$ 20–50")

C3 = [
 ("Controlador (ESP32, sensores, acionamento, PCB própria, gabinete, alarme)", 180, 350, "compra em lote; PCB fabricada substitui protoboard e placa perfurada"),
 ("Pneumática (bomba para regime contínuo, válvulas, tubos, conexões)", 350, 800, "a bomba de regime contínuo ainda precisa ser orçada"),
 ("Câmaras + manta (TPU nacional, solda terceirizada)", 400, 1200, "a orçar com fornecedor de solda HF/RF"),
 ("Capa PU costurada por facção", 150, 400, "tecido com ficha técnica; biocompatibilidade não incluída"),
 ("Fixação e embalagem", 40, 100, ""),
 ("Montagem e teste por unidade (4–8 h × R$ 30–60/h, premissa)", 120, 480, "valor-hora é premissa, não cotação"),
]

TOOLS = [
 ("Seladora manual de barra 30 cm", 113, 150, [28], False),
 ("Soprador térmico 2000 W (reparo e selagem localizada)", 110, 179, [29], False),
 ("Ferro de selar ou ferro doméstico + rolete", 60, 150, [], True),
 ("Impressão 3D terceirizada (se não houver impressora)", 0, 200, [], True),
 ("Multímetro (se o time não tiver)", 0, 120, [], True),
]

HOURS = [
 ("Eletrônica e firmware", "10–20 h", "20–40 h"),
 ("Corte e selagem das câmaras", "6–12 h", "25–50 h"),
 ("Capa e fixação", "—", "8–16 h (ou facção)"),
 ("Montagem e testes (vazamento, ciclos, alarme)", "6–12 h", "15–30 h"),
 ("Total", "22–44 h", "68–136 h"),
]

LEVERS = [
 ("Válvulas importadas (AliExpress)", "R$ 10–25 por unidade (estimativa, preço não verificado)", "Prazo de 20 a 40 dias, ficha técnica incerta e vazamento. Compre 1 de amostra antes."),
 ("PVC no lugar de TPU nas câmaras", "Até ~R$ 1.500 no protótipo em escala (diferença entre os extremos da faixa)", "Menos durável, enrijece no frio, usa plastificantes e não é adequado ao uso hospitalar. Serve para bancada e demonstração."),
 ("Protetor impermeável pronto como capa", "~R$ 550 contra capa sob medida", "Não é bi-elástico (pode travar a inflação), não é ignífugo e não tem ficha de biocompatibilidade."),
 ("1 bomba em vez de 2", "~R$ 115–125", "Enchimento inicial lento (~20 min para ~200 L, estimativa). A loja recomenda pausa de 10 min a cada 60 min."),
 ("MOSFET logic-level no lugar de relés", "~R$ 10–30 + silêncio", "O IRF520 não conduz bem com 3,3 V no gate. Use IRLZ44N ou um driver (ULN2803)."),
 ("Reaproveitar a eletrônica da bancada", "~R$ 150–250", "Nenhum relevante, desde que a protoboard seja trocada por placa soldada para transporte."),
 ("16 células em vez de 20", "~10% do material das câmaras", "Células mais largas distribuem a carga de forma menos uniforme."),
 ("Gabinete impresso no lugar de Patola", "~R$ 15–95", "Acabamento e vedação piores; depende de impressora disponível."),
 ("Bolsas/células prontas no lugar de fabricar", "A orçar", "Dimensões e conectores podem ser incompatíveis com a manta; dependência de fornecedor."),
]

RISKS = [
 ("Solda de TPU em escala", "Selagem manual não é repetível. Para lote, é preciso cotar solda por alta frequência (HF/RF) com fornecedor, incluindo ferramental e gabarito.", "a orçar"),
 ("Material das câmaras no Brasil", "Não foi encontrado fornecedor nacional de filme ou tecido TPU com preço público. A faixa usa referência europeia + câmbio + importação.", "a orçar"),
 ("Capa hospitalar", "Tecido PU bi-elástico, impermeável e retardante a chama, com ficha técnica e dados de biocompatibilidade (ISO 10993) do fabricante do tecido.", "a orçar"),
 ("Bomba de regime contínuo", "A BVU555 tem pausa recomendada de 10 min/60 min. Um produto que funciona 24 h exige bomba especificada para regime contínuo e baixo ruído.", "a orçar"),
 ("Câmbio e importação", "A faixa do TPU depende do euro (~R$ 5,95, PTAX set/2026) e de tributos de importação estimados.", "monitorar"),
 ("Certificação e regulatório", "Custo regulatório futuro: registro ANVISA (RDC 751/2022), segurança elétrica (IEC 60601-1), gestão de risco (ISO 14971) e biocompatibilidade (ISO 10993). Os valores não foram estimados neste documento.", "não estimado"),
]

OLD = [
 ("MCU (ESP32)", "30", "50–67", "Preço real de varejo é maior que o estimado."),
 ("Bomba de ar DC 12 V", "100", "25–239", "Depende da vazão: bancada usa bomba pequena; escala real precisa de 1–2 BVU555."),
 ("Válvulas solenoides (3)", "150", "160–420", "Escala real precisa de 4–6 válvulas."),
 ("Espuma base RG70", "200", "0", "Saiu: o sobrecolchão usa o colchão existente do leito."),
 ("Capa PU", "100", "63–610", "Faixa larga: protetor pronto adaptado até capa sob medida."),
 ("Eletrônica / cabos", "50", "185–520", "Agora itemizado: sensores, acionamento, fonte, tubos, conexões, alarme."),
 ("Câmaras + manta", "não listado", "50–1.860", "Novo item, e o maior custo do protótipo em escala real."),
]

# ---------- helpers ----------
def brl(v):
    return "R$ " + f"{v:,.0f}".replace(",", ".")

def tot(rows, i=2):
    return sum(r[i] for r in rows), sum(r[i + 1] for r in rows)

def rnd(v, up):
    import math
    return int(math.ceil(v / 10) * 10) if up else int(math.floor(v / 10) * 10)

c1 = tot(C1); c2 = tot(C2); c2o = (c2[0] + C2_OPC[2], c2[1] + C2_OPC[3])
c3 = (sum(r[1] for r in C3), sum(r[2] for r in C3))
tl = (sum(r[1] for r in TOOLS), sum(r[2] for r in TOOLS))

def fr(r):
    return ", ".join(f"[{n}]" for n in r[4])

def src_label(r):
    s = fr(r)
    if r[5]:
        s = (s + " + " if s else "") + "ESTIMATIVA"
    return s

# ---------- Markdown ----------
md = []
A = md.append
A("# PressuSense Air: levantamento de custos de construção (formato sobrecolchão)\n")
A(f"HackaSanta 2026, Santa Casa. Pesquisa de preços feita em **{DATA}**. Versão editável; o HTML e o PDF são gerados a partir dos mesmos dados.\n")
A("> **Leia antes.** Este é um levantamento de custo de **construção de protótipo**. Não é preço de venda nem preço do produto final, que ainda não foi fabricado nem orçado. Preços de varejo variam: confirme na loja antes de comprar. Itens marcados **ESTIMATIVA** não têm cotação verificada. Os números entre colchetes remetem à lista de fontes no fim.\n")
A("## Resumo\n")
A("| Cenário | Faixa (materiais) | Observação |\n|---|---|---|")
A(f"| 1. Protótipo de bancada (MVP físico) | **{brl(rnd(c1[0],0))} – {brl(rnd(c1[1],1))}** | módulo reduzido: 4–6 células + 2 laterais |")
A(f"| 2. Protótipo em escala real (1 sobrecolchão) | **{brl(rnd(c2[0],0))} – {brl(rnd(c2[1],1))}** | {brl(rnd(c2o[0],0))} – {brl(rnd(c2o[1],1))} com bateria opcional |")
A(f"| 3. Pequeno lote (10–50 un.), custo unitário | **{brl(c3[0])} – {brl(c3[1])}** | ESTIMATIVA, por unidade, não é preço de venda |")
A(f"| Ferramentas (investimento único) | **{brl(tl[0])} – {brl(tl[1])}** | não entra no custo por unidade |\n")

A("## Premissas de dimensionamento\n")
A("- Leito padrão de ~90 × 190 cm. Sobrecolchão com **18 células transversais** (Ø ~10 cm × 85 cm, grupos A/B alternados) e **2 câmaras longitudinais** (~180 × 30 × 8 cm) embaixo para inclinação.")
A("- Volume de ar (ESTIMATIVA): 18 × ~6,7 L + 2 × ~43 L ≈ **~200 L**. Com 10 L/min de vazão livre, o enchimento inicial leva ≥ 20 min.")
A("- Material (ESTIMATIVA): células 18 × 2 folhas de 20 × 90 cm ≈ 6,5 m²; laterais ≈ 2,6 m²; manta-base ≈ 1,7 m²; com 20% de perda, **~13 m²**. Módulo de bancada: **~2 m²**.")
A("- Custo do material por m² (ESTIMATIVA derivada): PVC cristal 0,30 mm nacional ≈ R$ 25–50/m² [24]; filme TPU 0,25 mm ≈ € 8,60/m² [25]; nylon-TPU ≈ € 10,90/m² [26]. Euro a R$ 5,95 [27] × fator de importação de 1,8 a 2,2 (II + ICMS + frete) ≈ **R$ 92–143/m²**.\n")

def md_table(rows, opc=None):
    A("| Item | Qtd | Mín. | Máx. | Fonte | Obs. |\n|---|---|--:|--:|---|---|")
    for r in rows:
        A(f"| {r[0]} | {r[1]} | {brl(r[2])} | {brl(r[3])} | {src_label(r)} | {r[6]} |")
    t = tot(rows)
    A(f"| **Total** | | **{brl(t[0])}** | **{brl(t[1])}** | | |")
    if opc:
        A(f"| *{opc[0]}* | {opc[1]} | {brl(opc[2])} | {brl(opc[3])} | {src_label(opc)} | {opc[6]} |")
    A("")

A("## 1. Protótipo de bancada (MVP físico)\n")
A("Módulo reduzido (~40 × 60 cm) com 4–6 células, 2 câmaras laterais pequenas, ESP32, bomba, 3–5 válvulas e sensores de linha. Objetivo: medir vazamento, tempo de ciclo, ângulo e alarme de queda de pressão.\n")
md_table(C1)
A("## 2. Protótipo em escala real (1 sobrecolchão)\n")
A("Manta inteira com 18 células (faixa de 16–20) e 2 câmaras longitudinais, capa, alças, gabinete, alarme sonoro/LED e bateria opcional.\n")
md_table(C2, C2_OPC)
A("## 3. Pequeno lote (10–50 unidades): custo unitário indicativo\n")
A("**ESTIMATIVA. Não é preço de venda.** Premissas: (a) componentes eletrônicos comprados em lote, de 20 a 40% abaixo do varejo; (b) câmaras e manta fabricadas por terceiro com solda HF/RF; (c) capa costurada por facção; (d) montagem e teste a R$ 30–60/h, como premissa. Fora da conta: impostos sobre venda, margem, garantia, assistência, ferramental de solda, custos regulatórios e de certificação.\n")
A("| Bloco | Mín. | Máx. | Nota |\n|---|--:|--:|---|")
for r in C3:
    A(f"| {r[0]} | {brl(r[1])} | {brl(r[2])} | {r[3]} |")
A(f"| **Total por unidade** | **{brl(c3[0])}** | **{brl(c3[1])}** | ESTIMATIVA |\n")

A("## 4. Custos não materiais\n")
A("### Investimento único (ferramentas)\n")
A("| Ferramenta | Mín. | Máx. | Fonte |\n|---|--:|--:|---|")
for r in TOOLS:
    A(f"| {r[0]} | {brl(r[1])} | {brl(r[2])} | {src_label((0,0,0,0,r[3],r[4]))} |")
A(f"| Solda HF/RF de câmaras (para lote) | a orçar | a orçar | terceirizar |")
A(f"| **Total** | **{brl(tl[0])}** | **{brl(tl[1])}** | |\n")
A("### Horas estimadas (custo por unidade de protótipo; não monetizado)\n")
A("| Atividade | Bancada | Escala real |\n|---|---|---|")
for r in HOURS:
    A(f"| {r[0]} | {r[1]} | {r[2]} |")
A("\nTodos os números de horas são ESTIMATIVA. O trabalho é do próprio time; só vira custo em reais se houver contratação.\n")
A("Testes: cargas simuladas (sacos de areia ou garrafas de água) por R$ 0–50 (ESTIMATIVA). Teste de vazamento com água e sabão, custo desprezível.\n")

A("## 5. Alavancas de custo\n")
A("| Alavanca | Economia aproximada | Risco do corte |\n|---|---|---|")
for r in LEVERS:
    A(f"| {r[0]} | {r[1]} | {r[2]} |")
A("")
A("## 6. Riscos e itens a orçar com fornecedor\n")
A("| Item | O que falta | Status |\n|---|---|---|")
for r in RISKS:
    A(f"| {r[0]} | {r[1]} | {r[2]} |")
A("")
A("## 7. Comparação com a BOM antiga (formato colchão, ~R$ 630 [30])\n")
A("| Item | BOM antiga (R$) | Este levantamento (R$) | O que mudou |\n|---|--:|--:|---|")
for r in OLD:
    A(f"| {r[0]} | {r[1]} | {r[2]} | {r[3]} |")
A("\nResumo: a espuma RG70 (~R$ 200) sai, mas entram as câmaras e a manta, que antes estavam fora da conta e passam a ser o maior item do protótipo em escala real. Na BOM antiga, sensores, fonte, tubos e conexões também estavam subestimados.\n")
A(f"## Fontes (consultadas em {DATA})\n")
for k, (t, u) in S.items():
    A(f"{k}. {t}" + (f". {u}" if u else ""))
A("\nRegras do documento: não há preço de concorrente, alegação de superioridade nem estatística clínica. Normas são citadas como requisitos a avaliar, não como atendidas.")

os.makedirs(OUT, exist_ok=True)
with open(os.path.join(OUT, "custos-sobrecolchao.md"), "w", encoding="utf-8") as f:
    f.write("\n".join(md) + "\n")

# ---------- HTML ----------
e = html.escape

def tag(r):
    s = "".join(f'<a class="ref" href="#f{n}">{n}</a>' for n in r[4])
    if r[5]:
        s += '<span class="est">EST.</span>'
    return s

def h_rows(rows, opc=None):
    out = []
    for r in rows:
        out.append(f"<tr><td>{e(r[0])}<small>{e(r[6])}</small></td><td class=q>{e(r[1])}</td><td class=n>{brl(r[2])}</td><td class=n>{brl(r[3])}</td><td class=s>{tag(r)}</td></tr>")
    t = tot(rows)
    out.append(f'<tr class=tot><td>Total do cenário</td><td></td><td class=n>{brl(t[0])}</td><td class=n>{brl(t[1])}</td><td></td></tr>')
    if opc:
        out.append(f"<tr class=opc><td>{e(opc[0])}<small>{e(opc[6])}</small></td><td class=q>{opc[1]}</td><td class=n>+ {brl(opc[2])}</td><td class=n>+ {brl(opc[3])}</td><td class=s>{tag(opc)}</td></tr>")
    return ('<table class=bom><thead><tr><th>Item</th><th class=q>Qtd</th><th class=n>Mín.</th><th class=n>Máx.</th><th class=s>Fonte</th></tr></thead><tbody>'
            + "".join(out) + "</tbody></table>")

def simple(head, rows, numcols=()):
    th = "".join(f'<th class="{"n" if i in numcols else ""}">{e(h)}</th>' for i, h in enumerate(head))
    body = ""
    for r in rows:
        body += "<tr>" + "".join(f'<td class="{"n" if i in numcols else ""}">{e(str(c))}</td>' for i, c in enumerate(r)) + "</tr>"
    return f"<table class=plain><thead><tr>{th}</tr></thead><tbody>{body}</tbody></table>"

CSS = """
:root{--navy:#0B1F33;--ink:#1E3A55;--cyan:#23D5E7;--cyan-d:#0A6F7C;--mist:#F2F7FA;--rule:#D5E0E8;--muted:#5B6B7A;--amber:#A15C07}
*{box-sizing:border-box}
@page{size:A4;margin:14mm 14mm 16mm}
html{-webkit-print-color-adjust:exact;print-color-adjust:exact}
body{margin:0;background:#fff;color:var(--ink);font:10pt/1.5 "Segoe UI",system-ui,-apple-system,sans-serif;font-variant-numeric:tabular-nums}
.page{max-width:186mm;margin:0 auto;padding:10mm 0 16mm}
h1,h2,h3,.big,.kicker{font-family:Bahnschrift,"DIN Alternate","Segoe UI",sans-serif;font-weight:600;color:var(--navy)}
header.cover{background:var(--navy);color:#fff;padding:12mm 11mm 9mm;position:relative;margin-bottom:8mm}
header.cover:after{content:"";position:absolute;left:11mm;bottom:0;width:38mm;height:2.2mm;background:var(--cyan)}
.kicker{font-size:8.5pt;letter-spacing:.18em;text-transform:uppercase;color:var(--cyan);margin:0 0 3mm}
header h1{color:#fff;font-size:25pt;line-height:1.08;margin:0 0 3mm;font-weight:600;letter-spacing:-.01em}
header p{margin:0;color:#C9D6E2;font-size:10pt;max-width:140mm}
.meta{display:flex;gap:9mm;margin-top:6mm;font-size:8.5pt;color:#9FB3C6}
.meta b{display:block;color:#fff;font-weight:600;font-size:9.5pt}
.warn{border-left:2.2mm solid var(--cyan);background:var(--mist);padding:3.5mm 5mm;margin:0 0 7mm;font-size:9.3pt}
.warn b{color:var(--navy)}
.totals{display:grid;grid-template-columns:repeat(3,1fr);border-top:1.4pt solid var(--navy);border-bottom:.6pt solid var(--rule);margin-bottom:3mm}
.totals div{padding:4mm 4mm 4mm 0}
.totals div+div{border-left:.6pt solid var(--rule);padding-left:4mm}
.totals .n{font-family:Bahnschrift,"Segoe UI",sans-serif;font-size:8pt;letter-spacing:.14em;color:var(--cyan-d);text-transform:uppercase}
.totals .big{font-size:17pt;line-height:1.15;margin:1.5mm 0 1mm;white-space:nowrap}
.totals .big span{color:var(--muted);font-weight:400}
.totals p{margin:0;font-size:8.6pt;color:var(--muted)}
.foot{font-size:8.6pt;color:var(--muted);margin:0 0 6mm}
section{margin-top:8mm}
h2{font-size:14.5pt;margin:0 0 2.5mm;display:flex;align-items:baseline;gap:3mm;border-bottom:.6pt solid var(--rule);padding-bottom:1.5mm}
h2 .no{color:var(--cyan-d);font-size:10pt;letter-spacing:.1em}
h3{font-size:10.5pt;margin:5mm 0 2mm;color:var(--ink)}
p.lead{margin:0 0 3mm;max-width:165mm}
ul.prem{margin:0;padding-left:4.5mm}ul.prem li{margin:0 0 1.2mm}
table{width:100%;border-collapse:collapse;font-size:8.8pt;margin:1mm 0 2mm}
thead th{font-family:Bahnschrift,"Segoe UI",sans-serif;font-weight:600;font-size:7.6pt;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);text-align:left;border-bottom:1pt solid var(--navy);padding:1.6mm 2mm 1.6mm 0}
td{border-bottom:.5pt solid var(--rule);padding:1.6mm 2mm 1.6mm 0;vertical-align:top}
td small{display:block;color:var(--muted);font-size:7.8pt;line-height:1.35}
.n{text-align:right;white-space:nowrap}
.q{white-space:nowrap;color:var(--muted)}
.s{white-space:nowrap;width:1%}
tr.tot td{border-top:1pt solid var(--navy);border-bottom:none;font-weight:700;color:var(--navy);padding-top:2.2mm}
tr.opc td{color:var(--muted);font-style:italic;border-bottom:none}
a.ref{display:inline-block;min-width:4.6mm;text-align:center;font-size:7pt;font-weight:600;color:var(--cyan-d);border:.6pt solid var(--cyan-d);border-radius:1mm;padding:0 .8mm;margin-right:.8mm;text-decoration:none}
.est{display:inline-block;font-size:6.8pt;font-weight:700;letter-spacing:.06em;color:var(--amber);border:.6pt solid var(--amber);border-radius:1mm;padding:0 .8mm}
.two{display:grid;grid-template-columns:1fr 1fr;gap:7mm}
.note{font-size:8.6pt;color:var(--muted);margin:1mm 0 0}
.verdict{background:var(--navy);color:#E6EEF5;padding:4mm 5mm;margin-top:3mm;font-size:9.3pt}
.verdict b{color:var(--cyan)}
ol.src{font-size:7.8pt;color:var(--muted);padding-left:6mm;margin:0;columns:1}
ol.src li{margin:0 0 1.1mm;word-break:break-word}
ol.src a{color:var(--cyan-d)}
.rules{font-size:8pt;color:var(--muted);border-top:.6pt solid var(--rule);margin-top:6mm;padding-top:2mm}
@media screen{body{background:#E9EEF2}.page{background:#fff;padding:0 0 14mm;margin:8mm auto;box-shadow:0 1px 3px rgba(11,31,51,.15)}.page>*:not(header){margin-left:11mm;margin-right:11mm}}
@media print{.page{padding:0}section{break-inside:auto}h2,h3{break-after:avoid}tr{break-inside:avoid}.totals,.warn,.verdict{break-inside:avoid}.pb{break-before:page}}
"""

src_html = "".join(
    f'<li id="f{k}">{e(t)}' + (f'. <a href="{e(u)}">{e(u)}</a>' if u else "") + "</li>" for k, (t, u) in S.items())

H = f"""<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>PressuSense Air: custos de construção do sobrecolchão</title><style>{CSS}</style></head>
<body><main class="page">
<header class="cover">
<p class="kicker">PressuSense Air · HackaSanta 2026 · Santa Casa</p>
<h1>Levantamento de custos<br>de construção: sobrecolchão pneumático</h1>
<p>Quanto custa montar o protótipo de bancada, um sobrecolchão em escala real e, de forma indicativa, uma unidade em pequeno lote.</p>
<div class="meta"><div><b>{DATA}</b>Data da pesquisa de preços</div><div><b>Opção B</b>Sobrecolchão completo</div><div><b>Interno</b>Decisão de compra e banca</div></div>
</header>

<div class="warn"><b>Custo de construção de protótipo, não preço de venda.</b> O produto final ainda não foi fabricado nem orçado. Preços de varejo variam: confirme antes de comprar. <span class="est">EST.</span> marca valores sem cotação verificada. Os números em caixa remetem às fontes no fim do documento.</div>

<div class="totals">
<div><span class="n">Cenário 1 · Bancada</span><div class="big">{brl(rnd(c1[0],0))} <span>–</span> {brl(rnd(c1[1],1))[3:]}</div><p>Módulo reduzido: 4–6 células e 2 laterais.</p></div>
<div><span class="n">Cenário 2 · Escala real</span><div class="big">{brl(rnd(c2[0],0))} <span>–</span> {brl(rnd(c2[1],1))[3:]}</div><p>1 sobrecolchão completo; + bateria opcional: {brl(rnd(c2o[0],0))} – {brl(rnd(c2o[1],1))}.</p></div>
<div><span class="n">Cenário 3 · Lote 10–50</span><div class="big">{brl(c3[0])} <span>–</span> {brl(c3[1])[3:]}</div><p>Por unidade. <span class="est">EST.</span> Não é preço de venda.</p></div>
</div>
<p class="foot">Faixas de materiais arredondadas a R$ 10. Ferramentas (investimento único): {brl(tl[0])} – {brl(tl[1])}, fora dos totais. Horas do time não são monetizadas.</p>

<section><h2><span class="no">00</span>Premissas de dimensionamento</h2>
<ul class="prem">
<li>Leito padrão de ~90 × 190 cm. <b>18 células transversais</b> (Ø ~10 × 85 cm) em cima, alternando os grupos A/B, e <b>2 câmaras longitudinais</b> (~180 × 30 × 8 cm) embaixo para inclinar.</li>
<li>Volume de ar <span class="est">EST.</span> ≈ 18 × 6,7 L + 2 × 43 L ≈ <b>~200 L</b>. Com 10 L/min de vazão livre, o enchimento inicial leva 20 min ou mais.</li>
<li>Material <span class="est">EST.</span>: células ≈ 6,5 m², laterais ≈ 2,6 m², manta-base ≈ 1,7 m². Com 20% de perda, <b>~13 m²</b>. Módulo de bancada: <b>~2 m²</b>.</li>
<li>Preço por m² <span class="est">EST.</span>: PVC cristal 0,30 mm ≈ R$ 25–50 <a class="ref" href="#f24">24</a>. TPU e nylon-TPU europeus a € 8,60–10,90/m² <a class="ref" href="#f25">25</a><a class="ref" href="#f26">26</a>, com euro a R$ 5,95 <a class="ref" href="#f27">27</a> e fator de importação de 1,8 a 2,2, ficam em <b>R$ 92–143/m²</b>.</li>
</ul></section>

<section class="pb"><h2><span class="no">01</span>Protótipo de bancada (MVP físico)</h2>
<p class="lead">Módulo de ~40 × 60 cm para medir vazamento, tempo de ciclo, ângulo lateral e o alarme de queda de pressão antes de investir na manta inteira.</p>
{h_rows(C1)}
</section>

<section class="pb"><h2><span class="no">02</span>Protótipo em escala real (1 sobrecolchão)</h2>
<p class="lead">Manta inteira (16–20 células; base de cálculo: 18), 2 câmaras longitudinais, capa, alças, gabinete, alarme sonoro/LED. A largura da faixa vem quase toda do material das câmaras e da capa.</p>
{h_rows(C2, C2_OPC)}
</section>

<section><h2><span class="no">03</span>Pequeno lote (10–50 un.): custo unitário indicativo</h2>
<p class="lead"><span class="est">EST.</span> <b>Não é preço de venda.</b> Premissas: eletrônica comprada em lote (20–40% abaixo do varejo), câmaras e manta soldadas por terceiro em HF/RF, capa costurada por facção, montagem e teste a R$ 30–60/h. Não inclui impostos sobre venda, margem, garantia, ferramental de solda nem custo regulatório.</p>
{simple(["Bloco","Mín.","Máx.","Nota"], [(r[0], brl(r[1]), brl(r[2]), r[3]) for r in C3] + [("Total por unidade", brl(c3[0]), brl(c3[1]), "estimativa")], numcols=(1,2))}
</section>

<section><h2><span class="no">04</span>Custos não materiais</h2>
<div class="two"><div>
<h3>Investimento único: ferramentas</h3>
<table class=plain><thead><tr><th>Ferramenta</th><th class=n>Mín.</th><th class=n>Máx.</th><th class=s></th></tr></thead><tbody>
{"".join(f'<tr><td>{e(r[0])}</td><td class=n>{brl(r[1])}</td><td class=n>{brl(r[2])}</td><td class=s>{tag((0,0,0,0,r[3],r[4]))}</td></tr>' for r in TOOLS)}
<tr><td>Solda HF/RF de câmaras (lote)</td><td class=n colspan=2>a orçar</td><td></td></tr>
<tr class=tot><td>Total</td><td class=n>{brl(tl[0])}</td><td class=n>{brl(tl[1])}</td><td></td></tr>
</tbody></table></div><div>
<h3>Por unidade de protótipo: horas <span class="est">EST.</span></h3>
{simple(["Atividade","Bancada","Escala real"], HOURS)}
<p class="note">Horas do próprio time, não monetizadas. Testes: cargas simuladas (areia ou água) por R$ 0–50 <span class="est">EST.</span>; teste de vazamento com água e sabão.</p>
</div></div>
</section>

<section class="pb"><h2><span class="no">05</span>Alavancas de custo</h2>
{simple(["Alavanca","Economia aproximada","Risco do corte"], LEVERS)}
</section>

<section><h2><span class="no">06</span>Riscos e itens a orçar com fornecedor</h2>
{simple(["Item","O que falta","Status"], RISKS)}
</section>

<section><h2><span class="no">07</span>O que mudou desde a BOM antiga (formato colchão, ~R$ 630)</h2>
{simple(["Item","BOM antiga (R$)","Agora (R$)","O que mudou"], OLD, numcols=(1,2))}
<div class="verdict">A espuma RG70 (~R$ 200) <b>sai</b>. As <b>câmaras e a manta entram</b>: estavam fora da conta e passam a ser o maior item do protótipo em escala real. Na BOM antiga, sensores, fonte, tubos e conexões também estavam subestimados. Fonte da BOM antiga: <a class="ref" href="#f30" style="color:#23D5E7;border-color:#23D5E7">30</a></div>
</section>

<section><h2><span class="no">08</span>Fontes, consultadas em {DATA}</h2>
<ol class="src">{src_html}</ol>
<p class="rules">Este documento não traz preço de concorrente, alegação de superioridade nem estatística clínica. As normas (RDC 751/2022, IEC 60601-1, ISO 14971, ISO 10993) aparecem como requisitos a avaliar, não como atendidas.</p>
</section>
</main></body></html>"""

with open(os.path.join(OUT, "custos-sobrecolchao.html"), "w", encoding="utf-8") as f:
    f.write(H)

print("C1", c1, "C2", c2, "C2+opc", c2o, "C3", c3, "tools", tl)
top = sorted(C2, key=lambda r: -r[3])[:6]
for r in top: print("top", r[0], r[2], r[3])
