# Contexto adicional do produto (extraído dos PDFs do time, 2026-10-17)

> **Formato definido em 2026-10-17: sobrecolchão (opção B).** O PressuSense Air é um sobrecolchão pneumático — manta fina com câmaras infláveis instalada sobre o colchão hospitalar existente do leito, vendido como kit "sobrecolchão + controlador". A espuma RG70 em "U" deixa de fazer parte do produto. Vantagem: mais leve, transportável e potencialmente mais barato. Desvantagem: necessita de cobertura resistente e deve distribuir a pressão ao longo de todo o corpo. Referência: `docs/referencia-formatos.png`.

Fonte: "Resumo Executivo.pdf" e "Diferencial e modo de operação do PressuSense Air.pdf" (documentos internos do time, gerados com apoio de IA). Use para enriquecer `content.ts`, textos do explorador, comparação e roadmap. **Respeite as regras do BRIEF**: nada de estatística sem fonte verificável, nada de preço de concorrente, nada de "previne/comprovado", nada de alegação de superioridade.

## ✅ PODE USAR (fatos de engenharia do próprio conceito)

### Arquitetura
- **Sobrecolchão pneumático**: manta-base fina, fixada ao colchão existente por alças, com câmaras de ar de PU/TPU. Sem espuma estrutural própria (a RG70 em "U" dos PDFs foi descartada em 2026-10-17).
- Capa: tecido bi-elástico revestido em PU, **resistente** (protege câmaras finas contra abrasão/perfuração) — respirável, antideslizante, impermeável, retardante a fogo (**requisitos de projeto**, não ensaiados).
- Câmaras superiores agrupadas em **2 grupos (A/B)** para alternância + **1 grupo lateral** (bolsões longitudinais) para inclinação.
- **Atuadores**: 1 bomba de ar DC 12 V genérica (de prateleira) insufla todas as câmaras; **válvulas solenoides** direcionam o ar para A, B ou lateral.
- **Controlador**: microcontrolador comum (**ex.: ESP32**) gerencia ciclos A↔B e comandos de inclinação. Interface **off-line** (LEDs + sinal sonoro) para hospitais com conectividade limitada.
- **Sensores**: sensores de pressão nas linhas pneumáticas; matriz de superfície em estudo com **FSR ou filme condutor Velostat** — "apenas qualitativo/demonstrativo".
- **Segurança passiva "célula-sobre-célula"**: em falha de energia ou vazamento, as válvulas fecham ("safe mode") e o sobrecolchão se mantém parcialmente inflado pelo design sobreposto e o colchão existente permanece como apoio passivo. Alarme se a pressão cair muito.
- Capacidade de carga: **meta de projeto ≈ 200 kg** (alinhada à categoria comercial). Rotular como meta, não como ensaiado.

### Lógica de controle
- Alternância: ciclos A/B com tempo configurável (**ordem de grandeza real ~10 min por ciclo**; no site o ciclo é comprimido para 8 s para demonstração — manter o rótulo "ciclo comprimido").
- Inclinação lateral: comandos discretos inflam um lado e desinflam o oposto; **faixa demonstrativa ~15–30°**. Diretrizes de posicionamento citam ~30° como referência (pode mencionar "ângulos em torno de 30° são referência na literatura de posicionamento" **sem número de redução de incidência**).
- Ao voltar ao neutro, reinflação lenta.
- Ajuste do tempo de ciclo conforme carga detectada (planejado).

### Design de baixo custo (os 4 pilares — bom para o explorador e a comparação)
1. **Componentes comuns**: MCU, bomba e válvulas de prateleira; sensores substituíveis por FSR/Velostat.
2. **Zonas modulares**: poucos módulos independentes (ex.: 4 grupos) em vez de matriz de centenas de células → menos válvulas, menos complexidade, módulo fabricável separadamente.
3. **Formato sobrecolchão**: aproveita o colchão já existente no leito; dispensa a espuma estrutural principal (menos material, mais leve e transportável).
4. **Projeto reparável**: eletrônica plugável + módulos infláveis intercambiáveis → substituição local.
- Formato de produto (definido): **kit "sobrecolchão + controlador"** sobre o colchão de camas hospitalares padrão (evita fabricar base inteira).

### BOM estimado do PROTÓTIPO DE BANCADA (pode mostrar como "estimativa interna de protótipo, não preço de produto")
| Componente | Qtd | Est. (R$) |
|---|---|---|
| MCU (ESP32) | 1 | ~30 |
| Bomba de ar DC 12 V | 1 | ~100 |
| Válvulas solenoides | 3 | ~150 |
| Câmaras de ar (TPU/PVC) e manta | 1 | a orçar |
| Capa PU resistente | 1 | ~100 |
| Eletrônica/cabos | — | ~50 |
| **Total protótipo** | | **~430 + câmaras (a orçar)** |

(A linha "Espuma base ~200" dos PDFs saiu com a mudança para sobrecolchão.)
→ Rotular SEMPRE: "estimativa de componentes para protótipo de bancada; não é preço do produto final, que ainda não foi fabricado nem orçado".

### Indicadores que o time pretende medir (bom para a seção HackaSanta/roadmap como "KPIs planejados")
- Redistribuição de pressão: % de variação do pico de carga após ciclo (meta exploratória >30%).
- Ângulo lateral efetivo alcançado (meta ~15–30°).
- Tempo de ciclo alternante.
- Detecção de falhas: alarme ao perder >20% da pressão em 1 min (regra de projeto).
- Autonomia em bateria (meta provisória 1–2 h).

### Regulatório (apresentar como "a avaliar / planejado")
- ANVISA: dispositivo médico (classe a definir), registro conforme **RDC 751/2022**.
- Normas: **IEC 60601-1** (segurança elétrica), **ISO 14971** (gestão de risco), **ISO 10993** (biocompatibilidade de capa/câmaras), retardância ao fogo.
- Higiene: capa soldada, válvulas seladas, limpeza hospitalar padrão.

### Roadmap do time (alinhar com as 5 etapas do BRIEF §10; pode adicionar durações estimadas como "estimativa")
| Fase | Atividades | Estimativa |
|---|---|---|
| MVP HackaSanta | Simulação 3D interativa (+ protótipo de bancada se houver) | evento |
| Protótipo de bancada | Matriz pequena (ex. 4×4) com Velostat/FSR, resposta a cargas conhecidas, medir vazamentos | 1–2 semanas |
| Testes de bancada / engenharia | Ciclos contínuos, detecção de falhas, ruído, consumo, segurança elétrica | ~1 mês |
| Ensaios pré-clínicos | Manequins/cargas simuladas, ajuste de pressões, higiene e resistência de materiais | 2–3 meses |
| Estudo piloto | Hospital parceiro, após autorizações | 6–12 meses |

### Limitações honestas (ótimo para credibilidade — usar no explorador e no impacto)
- Não substitui reposicionamento manual nem tratamento clínico; é **complemento**.
- **Não indicado para todos**: pacientes com fratura espinhal instável ou tração cervical não devem ser lateralizados — nesses casos, só modo estático após avaliação.
- Riscos de engenharia: inflar demais um lado pode gerar cisalhamento no quadril/lombar; pressão baixa demais → paciente "afunda" até o colchão existente; alta demais → superfície rígida cria novos pontos de pressão. Desempenho depende do estado e da densidade do colchão do leito; fixação/deslizamento a ensaiar. Por isso calibração e modo de segurança.
- Ruído de bomba; limite de peso.

### Comparação com a categoria (Stiegelmeyer/Novacare Smartline Hybrid como referência de categoria)
Pode dizer que a categoria comercial tem (o modelo de referência é híbrido, de colchão completo; há também sobrecolchões na categoria): espuma RG70 + ~14 câmaras de PU, unidade de controle digital com ajuste por peso, alternância automática, lateralização automática até ~30°, design célula-sobre-célula, capacidade até 200 kg. Posicionar o PressuSense como **investigação de arquitetura mais simples e modular** na mesma categoria — nunca como "melhor".

### Pitch (base do roteiro da "Demo de 3 minutos" — adaptar, sem as alegações proibidas)
- O que é: sobrecolchão pneumático alternante de baixo custo, que vai sobre o colchão do leito (câmaras de ar controladas).
- Como funciona: alterna grupos A/B e inclina lateralmente usando ar, sem mover o paciente manualmente.
- Inovação: hardware genérico + design modular + segurança passiva célula-sobre-célula.
- Encerramento: "torna viável investigar uma solução acessível ao SUS; ainda requer validação física e clínica; o MVP prova o conceito de engenharia e o raciocínio econômico".

## ❌ NÃO USAR (viola o BRIEF)
- "Reduz em até 60% a incidência de escaras", "queda de ~67%", "evidências Cochrane mostram reduções" — estatísticas sem fonte verificável no site. Se quiser citar literatura, só de forma qualitativa: "revisões sistemáticas discutem superfícies de redistribuição de pressão como parte da prevenção" + "ver referências" — sem número.
- "~10% do custo dos sistemas atuais", "colchão premium > R$ 5.000", "$5.000–8.000" — preço de concorrente / afirmação de superioridade.
- "Prevenção de lesões por pressão" como atributo do produto → trocar por "suporte à prevenção" / "redistribuição de carga".
- "Atendemos normas IEC 60601-1" → trocar por "normas a avaliar / requisitos de projeto".
- Qualquer menção a "cura", "milagrosa", "prova" clínica.
- Nome "Wellell Optima Turn" como comparação direta (não necessário; manter só a categoria Stiegelmeyer/Novacare indicada no BRIEF).
