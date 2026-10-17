# PressuSense Air — simulador digital de engenharia (HackaSanta 2026)

Aplicação web estática que representa o conceito do **PressuSense Air**, um colchão hospitalar híbrido de baixo custo com
pressão alternada (grupos A/B) e assistência ao reposicionamento lateral.

> **Aviso:** é uma simulação digital de engenharia. Não é dispositivo médico validado, não tem eficácia clínica
> demonstrada e todos os valores são relativos e ilustrativos (u.a.).

## Como rodar

Requisitos: Node 22+ e npm 10+.

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # tsc -b + vite build → dist/
npm run preview   # serve o build
npm test          # node --test (motor de simulação e modelo econômico)
npm run lint      # oxlint
```

Não há backend, login, banco de dados, CDN nem chamadas externas: fontes, 3D e iluminação são locais.

## Deploy na Vercel

1. Suba o repositório para o GitHub e importe-o em <https://vercel.com/new>, **ou** rode `npx vercel` na raiz.
2. A Vercel detecta o preset **Vite**: build `npm run build`, saída `dist`. Não é preciso `vercel.json` (não há rotas client-side).

## Arquitetura

```
src/
├─ lib/            lógica pura, sem React nem three (testável com node --test)
│  ├─ simulationEngine.ts   estado, tick, matriz de carga, telemetria
│  ├─ economicModel.ts      fórmulas e saneamento dos inputs
│  ├─ content.ts            todos os textos (BRIEF + contexto do produto)
│  ├─ presentationScript.ts roteiro da demo de 3 minutos
│  └─ format.ts             formatação pt-BR
├─ store/          Zustand: simulationStore (fonte única da verdade) e presentationStore
├─ hooks/          useSimulationLoop: único loop rAF (+ watchdog) que chama step(dt)
├─ components/
│  ├─ three/       Viewport3D (lazy + fallback + zoom), Mattress3D (Canvas), MattressLayers (modelo procedural), MattressFallback (SVG)
│  ├─ simulator/   Simulator, SimulationControls, PressureHeatmap, SimulationCharts, SimulationIndicators, FaultAlert
│  ├─ ui/          Section, StatusBadge, Disclaimer
│  └─ Header, Hero, EngineeringExplorer, EconomicCalculator, Comparison, SocialImpact, Roadmap, HackaSanta, Footer, PresentationMode
└─ pages/Home.tsx
tests/             simulationEngine.test.ts, economicModel.test.ts
```

- O 3D do simulador e o heatmap leem o **mesmo estado** (`sim.upper`, `sim.tilt`, `sim.matrix`) via `getState`/`subscribe`, sem re-render.
- Painéis React leem `telemetry`, recalculada a cada 100 ms.
- O modelo 3D é 100% procedural (sem arquivos externos) e carregado sob demanda (`React.lazy` + montagem perto da viewport).

## Funcionalidades concluídas

- Hero com modelo 3D montado em camadas (animação de entrada), rotação limitada e zoom por botões.
- Simulador com 4 modos: estático, alternado (play/pause, reiniciar, velocidades 0,5×–4×, grupos A/B, destaque do grupo ativo),
  lateral (posição neutra, esquerda, direita, retorno ao centro, ângulo de −20° a +20°) e falhas (vazamento, pressão fora do intervalo,
  bomba indisponível, sensor sem comunicação) com alerta, subsistema destacado no 3D e estado seguro conceitual.
- Heatmap 16×8 acoplado ao estado, com "Comparar antes e depois" (referência estática ou captura do estado atual).
- Gráficos em tempo real (pressões simuladas por grupo/câmara inferior e carga por região) e indicadores (câmaras C1–C16, ângulo, distribuição lateral).
- Explorador de engenharia com vista explodida e 7 componentes selecionáveis (função, importância, redução de custo, limitações, status).
- Calculadora econômica exploratória com gráfico de saldo, fórmulas visíveis e botão "Restaurar valores".
- Comparação de categoria (com status simulado / proposto / requer validação), impacto social, roadmap e painel HackaSanta.
- "Demo de 3 minutos": roteiro guiado com barra de progresso, etapas, avançar/voltar/pausar/sair e atalhos (← → Espaço Esc).
  Nunca inicia sozinha; ao sair, o simulador permanece no último estado.
- Fallback 2D sem WebGL e respeito a `prefers-reduced-motion`.

## Limitações conhecidas do simulador

- Modelo matemático simplificado: a matriz de carga é uma soma de gaussianas modulada pela inflação relativa das câmaras e pelo ângulo; **não é medida** nem calibrada.
- Valores em unidades arbitrárias (u.a.); nunca representam pressões clínicas.
- O ciclo alternado foi comprimido para 8 s (na operação real seria da ordem de minutos).
- O ângulo demonstrativo é limitado a ±20° e não representa procedimento clínico.
- O estado seguro das falhas é conceitual e não demonstra segurança clínica.
- O cenário econômico usa valores hipotéticos editáveis e não é preço do produto.
- Em GPUs muito fracas ou renderização por software o 3D fica lento; a lógica continua em tempo real até ~2 fps de renderização.
