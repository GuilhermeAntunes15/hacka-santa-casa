# PROJETO: PRESSUSENSE AIR
## Landing Page Interativa + Simulador Digital — HackaSanta 2026

Você é um engenheiro de software sênior, especialista em experiências web imersivas, visualização 3D, React, Three.js, motion design e interfaces HealthTech de alto padrão.

Sua missão é **desenvolver uma aplicação web completa, responsiva, funcional e visualmente impressionante**, que represente digitalmente o conceito do PressuSense Air.

Não quero uma landing page genérica de startup, um dashboard estático ou uma apresentação de slides disfarçada de site.

Quero uma experiência de produto com qualidade de portfólio Awwwards, mas com linguagem médica séria, navegação intuitiva, excelente legibilidade e funcionalidades reais de simulação.

A aplicação será apresentada aos jurados do HackaSanta 2026.

---

# 1. CONTEXTO DO PRODUTO

**Nome:** PressuSense Air

**Conceito:** Colchão hospitalar híbrido inteligente de baixo custo, com dois mecanismos principais:

1. Redistribuição alternada de pressão por meio de câmaras pneumáticas.
2. Assistência ao reposicionamento lateral por meio de câmaras de inclinação.

**Problema:**

Pacientes com mobilidade reduzida apresentam risco de desenvolver lesões por pressão. Essas lesões podem causar sofrimento, complicações clínicas e custos assistenciais adicionais.

Existem sistemas hospitalares avançados de pressão alternada e inclinação lateral automatizada, mas o PressuSense Air propõe estudar uma arquitetura mais simples, modular e economicamente acessível.

**Proposta de valor:**

Democratizar o acesso a tecnologias de suporte para prevenção de lesões por pressão, com arquitetura modular, manutenção simplificada e controle pneumático inteligente.

**Importante:** este é um conceito em desenvolvimento. O site deve identificá-lo claramente como uma simulação digital de engenharia, não como dispositivo médico validado ou tecnologia de eficácia clínica comprovada.

---

# 2. STACK TECNOLÓGICA

Utilize:

- React com TypeScript.
- Vite.
- Tailwind CSS.
- React Three Fiber e Drei para visualização 3D.
- Three.js.
- Framer Motion ou Motion para animações.
- Lucide React para ícones.
- Recharts para gráficos.
- Zustand, se necessário, para controlar os estados da simulação.

O projeto deve funcionar localmente com npm install e npm run dev.

Preparar também para deploy estático na Vercel.

Não utilizar backend, banco de dados ou serviços externos obrigatórios.

Não utilizar API de IA paga.

Usar dados fictícios e modelos matemáticos simplificados, devidamente identificados.

---

# 3. DIREÇÃO VISUAL

Estética: tecnologia médica premium, com referências de design industrial, engenharia biomédica e interfaces futuristas.

Paleta:

- Fundo principal: #07111F
- Azul profundo: #0B1F33
- Ciano: #23D5E7
- Azul tecnológico: #3B82F6
- Verde de confirmação: #21C58E
- Texto principal: #F2F7FA
- Texto secundário: #94A3B8

Utilizar gradientes sutis, iluminação volumétrica simulada e materiais tridimensionais de aparência realista.

Tipografia: Geist, Inter ou similar.

Evitar excesso de glow, cards repetitivos e elementos decorativos sem função.

A experiência deve parecer um produto tecnológico real, não um template genérico.

Aplicar microinterações, scroll animations, transições cinematográficas e boa hierarquia tipográfica.

---

# 4. HERO SECTION

Criar uma hero section em tela cheia.

**Título:**

"PressuSense Air"

**Headline:**

"Redistribuindo a pressão. Repensando o cuidado."

**Subtítulo:**

"Um conceito de colchão pneumático inteligente e acessível, projetado para combinar alternância de pressão, assistência ao reposicionamento lateral e monitoramento em uma única plataforma."

Adicionar dois CTAs:

- Explorar a tecnologia
- Testar o simulador

À direita ou centralizado, mostrar um colchão hospitalar tridimensional, com aparência sofisticada.

O modelo deve ser criado proceduralmente usando Three.js, sem depender de arquivos 3D externos.

Ele deve possuir:

- Base estrutural.
- Camada de espuma.
- Câmaras pneumáticas superiores.
- Câmaras inferiores de inclinação.
- Tubulações estilizadas.
- Representação opcional de sensores e controlador.

Permitir rotação limitada com o mouse e zoom controlado.

Criar uma animação inicial em que a estrutura aparece em camadas, mostrando seus componentes.

---

# 5. SIMULADOR PRINCIPAL — O CORAÇÃO DO PROJETO

Este deve ser o componente mais elaborado de toda a aplicação.

Criar uma seção com título:

"Experimente o funcionamento do PressuSense Air"

Dividir a interface em:

**Área principal:** modelo 3D do colchão.

**Painel lateral:** comandos de simulação.

**Painel inferior:** dados técnicos e gráficos.

O usuário poderá alternar entre quatro modos.

## MODO 1 — Pressão estática

Todas as câmaras superiores permanecem em um estado de referência.

Mostrar um mapa ilustrativo da distribuição de carga na superfície.

Exibir indicadores:

- Estado das câmaras.
- Pressões pneumáticas simuladas.
- Distribuição relativa de carga.
- Tempo transcorrido da simulação.

Não apresentar valores clínicos inventados como se fossem medições de pacientes.

## MODO 2 — Pressão alternada

Criar uma sequência de animação:

1. Grupo A permanece inflado.
2. Grupo B reduz parcialmente o volume.
3. O sistema altera progressivamente a inflação.
4. O Grupo A reduz parcialmente o volume.
5. O Grupo B aumenta a inflação.
6. O ciclo reinicia.

As câmaras devem mudar visivelmente de volume, com animações contínuas e suaves.

O simulador deve atualizar seus estados e gráficos conforme a animação.

Adicionar:

- Play/Pause.
- Reiniciar.
- Velocidade de simulação.
- Visualização dos grupos A e B.
- Destaque visual da câmara ativa.

Os valores serão relativos e ilustrativos, não recomendações de operação clínica.

## MODO 3 — Reposicionamento lateral

Adicionar controles:

- Posição neutra.
- Inclinação simulada à esquerda.
- Inclinação simulada à direita.
- Retornar ao centro.

O modelo 3D deve mostrar as câmaras inferiores alterando seu volume e inclinando uma superfície de apoio com carga artificial representada.

Permitir que o usuário altere um ângulo demonstrativo dentro de uma faixa visual limitada.

Exibir:

- Ângulo geométrico simulado.
- Câmaras responsáveis pelo movimento.
- Mudanças estimadas na distribuição de carga.

IMPORTANTE: a animação não representa um procedimento clínico validado. Não criar instruções operacionais para movimentação real de pacientes.

## MODO 4 — Monitoramento e falhas

Simular situações como:

- Vazamento de ar.
- Pressão pneumática fora do intervalo de simulação.
- Bomba indisponível.
- Sensor sem comunicação.

Quando o usuário acionar uma falha:

- Interromper a animação automática.
- Destacar visualmente o subsistema afetado.
- Exibir uma notificação clara.
- Mostrar um estado seguro conceitual.
- Permitir reiniciar o demonstrador.

Não afirmar que a implementação digital demonstra segurança clínica.

---

# 6. MAPA DE PRESSÃO INTERATIVO

Criar um painel com heatmap animado.

As regiões devem mudar de cor conforme os estados simulados:

- Azul: menor leitura relativa.
- Ciano: leitura intermediária.
- Amarelo: leitura relativamente elevada.
- Vermelho: leitura mais elevada na escala ilustrativa.

Utilizar uma matriz visual ou um shader simples.

A alteração das câmaras deve modificar o mapa.

Adicionar opção "Comparar antes e depois".

Mostrar os dois estados lado a lado.

A lógica deve ser coerente entre o 3D e o heatmap: ambos devem compartilhar o mesmo estado da aplicação.

Observação obrigatória: este é um modelo demonstrativo simplificado. Uma redução da carga estimada em uma região não significa que o risco de lesão foi clinicamente eliminado.

---

# 7. EXPLORADOR DE ENGENHARIA

Criar uma seção chamada:

"Engenharia projetada para ser acessível"

Representar o colchão em camadas, usando um modelo 3D explodido.

Permitir selecionar:

1. Revestimento.
2. Câmaras superiores de pressão alternada.
3. Câmaras inferiores de inclinação.
4. Espuma estrutural.
5. Sistema pneumático.
6. Sensores.
7. Controlador eletrônico.

Ao selecionar um componente:

- Destacar a peça no 3D.
- Mostrar sua função.
- Mostrar por que ela é importante.
- Explicar qual escolha de engenharia poderia reduzir custos.
- Informar suas principais limitações.

Usar linguagem técnica acessível.

---

# 8. CALCULADORA DE CUSTOS

Criar uma seção interativa chamada:

"Qual o potencial econômico da tecnologia?"

Adicionar inputs para:

- Número de leitos.
- Custo estimado do equipamento por leito.
- Custo anual estimado de manutenção.
- Taxa hipotética de ocorrência de lesões por pressão.
- Redução hipotética da ocorrência.
- Custo incremental hipotético por caso.

Exibir:

- Investimento inicial.
- Despesa anual de manutenção.
- Eventos potencialmente evitados no cenário hipotético.
- Economia bruta simulada.
- Saldo econômico simplificado.

Os gráficos devem atualizar em tempo real.

Exibir claramente que se trata de um cenário matemático exploratório, não uma comprovação de eficácia clínica, redução de custos ou retorno financeiro real.

Não apresentar um preço final confirmado do PressuSense Air, pois ele ainda não foi fabricado e orçado integralmente.

Adicionar botão para restaurar valores.

---

# 9. COMPARAÇÃO COM A TECNOLOGIA EXISTENTE

Criar uma seção comparativa visual.

Explicar que sistemas hospitalares de pressão alternada já existem, inclusive modelos com assistência à inclinação lateral.

Usar como referência tecnológica a categoria de sistemas da Stiegelmeyer/Novacare:

https://www.stiegelmeyer.com/br/hospital/colchoes/sistemas-de-pressao-alternada/

Não copiar o design industrial nem imagens dos concorrentes.

Não inventar preços ou afirmar superioridade sem evidências.

Destacar o direcionamento do PressuSense:

- Arquitetura modular.
- Possibilidade de manutenção de componentes.
- Controle eletrônico simplificado.
- Operação local.
- Investigação de menor custo de fabricação.
- Aplicabilidade futura a hospitais e serviços de atenção domiciliar.

A comparação deve diferenciar recursos planejados de capacidades já demonstradas.

---

# 10. ROADMAP DO PROJETO

Criar uma linha do tempo visual com cinco etapas:

**Etapa 1: MVP digital — HackaSanta 2026**

Simulação 3D, controle interativo, visualização de funcionamento e modelo econômico exploratório.

**Etapa 2: Protótipo de bancada**

Construção de um pequeno conjunto pneumático com sensores e cargas artificiais.

**Etapa 3: Protótipo de engenharia**

Escalonamento estrutural, ensaios mecânicos e análise de falhas.

**Etapa 4: Validação pré-clínica e planejamento regulatório**

Avaliação de estabilidade, segurança, higiene, durabilidade e normas aplicáveis.

**Etapa 5: Estudos clínicos e industrialização**

Avaliação com instituições parceiras, após autorizações aplicáveis, e desenvolvimento da cadeia de produção.

A linha do tempo deve diferenciar claramente o que foi desenvolvido do que ainda é planejado.

---

# 11. SEÇÃO DE IMPACTO SOCIAL

Título:

"Tecnologia de cuidado não deveria depender apenas do orçamento disponível."

Abordar:

- Lesões por pressão em pacientes com mobilidade reduzida.
- Desafios de acesso a tecnologias assistenciais.
- Importância do acompanhamento da enfermagem.
- Possibilidade de reduzir custos de manutenção por meio de módulos substituíveis.
- Potencial de aplicação em hospitais públicos.

Não utilizar estatísticas sem fonte.

Não afirmar prevenção comprovada de lesões pelo PressuSense.

---

# 12. SEÇÃO HACKASANTA 2026

Adicionar uma seção sobre o contexto do projeto.

Evento: HackaSanta 2026.

Tema: "Estratégias para otimização na assistência médica: desafios na jornada do paciente".

Trilha principal: Infraestrutura de Saúde.

Trilhas relacionadas: Impacto Social e Saúde Digital e IA.

Criar um painel com os cinco critérios do edital:

- Impacto em Saúde — 20%.
- Inovação — 20%.
- Modelo de Negócio — 20%.
- Produto — 20%.
- Apresentação — 20%.

Mostrar como a proposta pretende atender cada critério, sem afirmar que a solução já foi validada.

Não apresentar patrocinadores como parceiros oficiais do PressuSense sem autorização.

---

# 13. MODO APRESENTAÇÃO PARA OS JURADOS

Criar uma funcionalidade especial chamada "Demo de 3 minutos".

Ao clicar, a aplicação inicia um roteiro guiado com navegação entre as seções:

**0–30 segundos:** problema e proposta de valor.

**30–75 segundos:** demonstração de pressão alternada.

**75–120 segundos:** demonstração de inclinação lateral.

**120–150 segundos:** diferencial de custos e modularidade.

**150–180 segundos:** impacto potencial, roadmap e encerramento.

Adicionar barra de progresso, indicadores de etapa e botões para avançar, voltar e sair da apresentação.

Não iniciar a apresentação automaticamente sem interação do usuário.

A aplicação precisa permitir interromper a sequência e voltar ao modo de exploração.

---

# 14. REQUISITOS TÉCNICOS E DE QUALIDADE

- Design responsivo para desktop, tablet e smartphone.
- Prioridade visual para apresentações em notebook e projetor.
- Animações suaves com bom desempenho.
- Lazy loading do modelo 3D.
- Fallback visual caso WebGL não esteja disponível.
- Respeitar prefers-reduced-motion.
- Componentes reutilizáveis e código organizado.
- Sem erros de TypeScript.
- Sem dependências desnecessárias.
- Estados da simulação centralizados.
- Todos os botões e controles devem funcionar.
- Não criar botões decorativos sem ação.
- Sem necessidade de login.
- Sem backend.
- Sem persistência de dados pessoais.
- Deploy simples na Vercel.

Não use imagens genéricas de médicos sorrindo ou pacientes fictícios como elemento principal.

A estrela da experiência é a engenharia do colchão.

---

# 15. ORGANIZAÇÃO DO CÓDIGO

Organizar os componentes de forma semelhante a:

src/
- components/
  - Hero.tsx
  - Mattress3D.tsx
  - MattressLayers.tsx
  - SimulationControls.tsx
  - PressureHeatmap.tsx
  - EngineeringExplorer.tsx
  - EconomicCalculator.tsx
  - Roadmap.tsx
  - PresentationMode.tsx
- store/
  - simulationStore.ts
- lib/
  - simulationEngine.ts
  - economicModel.ts
- pages/
  - Home.tsx
- styles/
- App.tsx

Pode adaptar a estrutura se houver uma arquitetura melhor.

---

# 16. ORDEM DE IMPLEMENTAÇÃO

Não desperdice o tempo inicial criando apenas efeitos visuais.

Siga esta prioridade:

1. Configurar projeto React + Vite + TypeScript.
2. Criar motor de simulação e estados compartilhados.
3. Implementar modelo 3D das câmaras.
4. Implementar modos de pressão alternada e inclinação lateral.
5. Sincronizar gráficos e heatmap.
6. Criar calculadora econômica.
7. Criar o modo apresentação.
8. Implementar seções institucionais.
9. Refinar animações, estética e responsividade.
10. Executar build, corrigir erros e testar interações.

A lógica de simulação deve ser separada da visualização 3D.

O sistema deve continuar funcional mesmo que algum efeito visual avançado precise ser simplificado.

---

# 17. CRITÉRIOS DE ACEITAÇÃO

O resultado final deve permitir que um jurado:

1. Abra o site e entenda o problema em menos de 15 segundos.
2. Visualize o colchão tridimensional.
3. Ative o modo de pressão alternada e veja as câmaras se movimentarem.
4. Ative o modo lateral e observe a inclinação simulada.
5. Visualize a alteração correspondente no heatmap.
6. Simule uma falha e veja o sistema sinalizá-la.
7. Altere parâmetros econômicos e veja os resultados atualizados.
8. Execute uma apresentação guiada de três minutos.
9. Entenda quais funcionalidades são propostas, quais foram simuladas e quais ainda precisam de validação física e clínica.

---

# 18. EXECUÇÃO

Implemente o projeto completo no diretório atual.

Se o diretório estiver vazio, inicialize a aplicação.

Não apenas descreva como faria.

Crie os arquivos, instale dependências, implemente os componentes e execute o build.

Corrija problemas de compilação.

Ao finalizar, apresente:

- Resumo dos componentes implementados.
- Comandos para executar localmente.
- Como realizar o deploy na Vercel.
- Funcionalidades efetivamente concluídas.
- Limitações conhecidas do simulador.

**Objetivo final:** criar uma experiência web que impressione pela clareza, qualidade visual e coerência técnica, mostrando como o PressuSense Air poderia funcionar e qual seria seu potencial, sem representar a simulação como validação de um dispositivo médico real.
