# PLANO TÉCNICO — PressuSense Air (produzido pelo planner-agent, 2026-10-17)

## Contexto identificado
- **Linguagens detectadas**: nenhuma por enquanto. O diretório só tem `BRIEF.md`. Alvo: TypeScript + CSS.
- **Frameworks detectados**: nenhum instalado. Alvo, com versões conferidas no registry npm em 2026-10-17:
  - react 19.3.1, vite 8.3.4, @vitejs/plugin-react 6.1.2, create-vite 9.2.1 (o template traz TypeScript ~6.0 e oxlint).
  - three 0.186.1 com @types/three 0.186.0, @react-three/fiber 9.8.2 (peer `react >=19 <19.4`), @react-three/drei 10.7.9 (peer fiber ^9).
  - motion 14.3.0, zustand 5.0.15, recharts 3.10.1 (peer react-is), lucide-react 1.59.0.
  - tailwindcss e @tailwindcss/vite 4.3.3 (peer vite ^8 ok), @fontsource-variable/geist e geist-mono 5.3.0.
- **Estrutura relevante (alvo)**:
```
/ (raiz = D:\Users\ANTUNES\Desktop\hackasantacasa)
├─ index.html  vite.config.ts  package.json  tsconfig*.json  .gitignore  README.md  BRIEF.md
├─ public/favicon.svg
├─ tests/simulationEngine.test.ts  tests/economicModel.test.ts
└─ src/
   ├─ main.tsx  App.tsx  index.css
   ├─ pages/Home.tsx
   ├─ store/simulationStore.ts  store/presentationStore.ts
   ├─ hooks/useSimulationLoop.ts
   ├─ lib/simulationEngine.ts  economicModel.ts  content.ts  presentationScript.ts  format.ts
   └─ components/
      ├─ Header.tsx  Footer.tsx  Hero.tsx  EngineeringExplorer.tsx  EconomicCalculator.tsx
      ├─ Comparison.tsx  Roadmap.tsx  SocialImpact.tsx  HackaSanta.tsx  PresentationMode.tsx
      ├─ three/Viewport3D.tsx  Mattress3D.tsx  MattressLayers.tsx  MattressFallback.tsx
      ├─ simulator/Simulator.tsx  SimulationControls.tsx  PressureHeatmap.tsx  SimulationCharts.tsx  SimulationIndicators.tsx  FaultAlert.tsx
      └─ ui/Section.tsx  StatusBadge.tsx  Disclaimer.tsx
```
- **Convenções (impostas pelo template react-ts atual)**: `tsconfig.app.json` vem com `verbatimModuleSyntax`, `erasableSyntaxOnly`, `noUnusedLocals`, `noUnusedParameters` e `moduleResolution: bundler`.
  - Use sempre `import type {…}` em linha própria. Nada de `enum`, `namespace` ou parameter properties.
  - Parâmetro não usado leva prefixo `_`.
  - Imports relativos, sem alias `@/`.
  - Componentes em PascalCase `.tsx`, um por arquivo. Stores e libs em camelCase `.ts`.
- **Comandos**: `npm run dev`, `npm run build` (`tsc -b && vite build`), `npm run preview`, `npm run lint` (oxlint), `npm test` (a criar).
  - Deploy: a Vercel detecta Vite sozinha (build `npm run build`, saída `dist`). Sem rotas client-side → **não precisa de `vercel.json`**.

## Entendimento da task
- SPA estática, single-page, do PressuSense Air. Peça central: simulador 3D procedural com 4 modos e heatmap acoplado ao mesmo estado. Também: explorador explodido de 7 componentes, calculadora econômica, seções institucionais, modo "Demo de 3 minutos" e disclaimers.
- Escopo indireto: desempenho em notebook/projetor (até 3 canvases WebGL); linguagem regulatória e clínica (nada de alegação de eficácia, nada de mmHg/kPa, nenhuma estatística sem fonte, nenhum patrocinador); funcionamento offline no evento (nenhuma dependência de CDN).

## Diagnóstico técnico
- 4 camadas desacopladas:
  1. `lib/` puro, sem React nem three, testável com `node --test`.
  2. `store/` Zustand: única fonte de verdade.
  3. `hooks/useSimulationLoop.ts`: um único rAF, único escritor por frame.
  4. `components/`: leitores. O 3D e o heatmap leem via `getState`/`subscribe` sem re-render. Painéis React leem `telemetry` a 10 Hz.
- fiber 9 exige React <19.4 → fixar `~19.3.1`.
- `Environment preset` do drei baixa HDR de CDN → usar só `<Lightformer>`. `Text` do drei/troika baixa fonte → não usar.
- Zustand v5 entra em loop infinito com seletor que devolve objeto novo → só primitivos ou `useShallow`.

## Plano de implementação

> Ordem: **coder → design → coder (só TODO(coder)) → QA**. O BRIEF §16 manda lógica primeiro; fixar store, engine e contratos antes do visual evita retrabalho.

### Etapa 1: Scaffold (coder)
- Comandos (PowerShell, na raiz):
```
npx --yes create-vite@latest pressusense-air --template react-ts --no-interactive
Get-ChildItem -Force .\pressusense-air | Move-Item -Destination .
Remove-Item .\pressusense-air
npm install
npm install three@^0.186 @react-three/fiber@^9.8 @react-three/drei@^10.7 motion@^14 zustand@^5 recharts@^3 lucide-react@^1 @fontsource-variable/geist@^5 @fontsource-variable/geist-mono@^5
npm install -D @types/three@^0.186 tailwindcss@^4 @tailwindcss/vite@^4
```
  - **Não** rodar `create vite .` (sem TTY cancela; com `--overwrite` apaga o BRIEF).
- Ajustes: `package.json` com `"react": "~19.3.1"`, `"react-dom": "~19.3.1"`, `@types/react(-dom)` `~19.3`. Script `"test": "node --experimental-strip-types --test tests/simulationEngine.test.ts tests/economicModel.test.ts"`. Se o npm reclamar de `react-is`, `npm i react-is@~19.3.1`.
- Limpeza: apagar `src/App.css`, `src/assets/*`, `public/icons.svg`. Trocar `public/favicon.svg` por SVG simples da marca.
- `vite.config.ts`: `plugins: [react(), tailwindcss()]`, `build.chunkSizeWarningLimit: 1500`. Sem `manualChunks`.
- `index.html`: `lang="pt-BR"`, title "PressuSense Air — Simulador digital de engenharia | HackaSanta 2026", meta description, `<meta name="theme-color" content="#07111F">`.
- Tailwind v4: plugin, sem PostCSS, sem `tailwind.config`; tokens em `@theme` no CSS.

### Etapa 2: Base de estilos e App (coder)
- `src/index.css`: `@import "tailwindcss"; @import "@fontsource-variable/geist"; @import "@fontsource-variable/geist-mono";`
  - `@theme { --color-bg:#07111F; --color-surface:#0B1F33; --color-accent:#23D5E7; --color-tech:#3B82F6; --color-ok:#21C58E; --color-fg:#F2F7FA; --color-muted:#94A3B8; --color-warn:#FACC15; --color-danger:#EF4444; --font-sans:"Geist Variable",ui-sans-serif,system-ui,sans-serif; --font-mono:"Geist Mono Variable",ui-monospace,monospace; }`
  - `html{scroll-behavior:smooth}`, `section{scroll-margin-top:4.5rem}`, `@media (prefers-reduced-motion:reduce){html{scroll-behavior:auto}}`.
- `src/App.tsx`: `<MotionConfig reducedMotion="user">`, chama `useSimulationLoop()` uma vez, renderiza `<Header/> <Home/> <PresentationMode/>`.

### Etapa 3: Motor de simulação puro e teste (coder)
- `src/lib/simulationEngine.ts` e `tests/simulationEngine.test.ts`. O engine tem **zero imports de valor**; todos os tipos definidos nele.
```ts
export type SimMode = 'static' | 'alternating' | 'lateral' | 'fault';
export type FaultType = 'leak' | 'overpressure' | 'pump' | 'sensor';
export type Group = 'A' | 'B';
export type LayerId = 'cover'|'topChambers'|'tiltChambers'|'foam'|'pneumatic'|'sensors'|'controller';
export type SubsystemId = 'pump'|'valves'|'lineA'|'lineB'|'lateral'|'sensors'|'controller';
export type Health = 'ok' | 'alert' | 'offline';
export type RegionId = 'head'|'scapular'|'sacral'|'thighs'|'heels';
export const SPEEDS = [0.5, 1, 2, 4] as const; export type Speed = typeof SPEEDS[number];
export interface FaultState { type: FaultType; elapsed: number; safe: boolean }
export interface SimState {
  mode: SimMode; playing: boolean; speed: Speed;
  elapsed: number;            // s simulados
  phase: number;              // 0..1 do ciclo alternado
  upper: number[];            // N_UPPER inflações 0..1.3 (u.a.)
  lower: [number, number];    // [esquerda, direita] 0..1
  tilt: number; tiltTarget: number; // graus; + = inclinação à direita (lado +z desce, câmara ESQUERDA infla)
  fault: FaultState | null;
  matrix: number[];           // ROWS*COLS, 0..1, índice r*COLS + c; r=cabeceira→pés, c=0 esquerda(z−)…COLS−1 direita(z+)
}
export interface RegionLoad { id: RegionId; label: string; share: number /*% do total*/; peak: number /*0..1*/ }
export interface HistorySample { t: number; a: number; b: number; l: number; r: number } // 0..100
export interface Telemetry {
  elapsed: number; groupA: number; groupB: number; lowerLeft: number; lowerRight: number; // 0..100
  tilt: number; activeGroup: Group | null; cycleLabel: string;
  chambers: number[];          // 0..100 por câmara
  regions: RegionLoad[]; side: { left: number; right: number }; // %
  subsystems: Record<SubsystemId, Health>;
  history: HistorySample[];    // máx HISTORY_MAX
}
export const N_UPPER=16, ROWS=16, COLS=8, REF=0.8, HIGH=1.0, LOW=0.4, OVER=1.25,
  SIM_RANGE=[0.3,1.05] as const, LOWER_BASE=0.12, MAX_TILT=20, CYCLE_SECONDS=8,
  TILT_RATE=6 /*°/s simulado*/, INFLATE_RATE=3, HISTORY_MAX=150, TELEMETRY_INTERVAL=0.1,
  LEAK_CHAMBER=6, DT_MAX=0.1;
```
- Funções:
  - `groupOf(i)`: par é A, ímpar é B. `createInitialSim()`: modo `static`, playing true, speed 1, upper todo REF, lower LOWER_BASE, tilt 0, matrix = REFERENCE_MATRIX.
  - `alternatingLevel(phase)` trapézio suavizado com smoothstep: [0,0.3)→1; [0.3,0.5)→1−ss((p−.3)/.2); [0.5,0.8)→0; [0.8,1)→ss((p−.8)/.2). Grupo A = `LOW + (HIGH−LOW)·lvl`; grupo B = `LOW + (HIGH−LOW)·(1−lvl)`.
  - `cycleLabel(phase)`: "Grupo A sustenta · Grupo B alivia", "Transição: A reduz, B infla", "Grupo B sustenta · Grupo A alivia", "Transição: B reduz, A infla". `activeGroup(phase)`: A se lvl ≥ 0.5 senão B.
  - `upperTargets(s)`: static/lateral → REF; alternating e fault sem falha ativa → ciclo; com falha ver tick.
  - `lowerTargets(tilt)`: esquerda = `LOWER_BASE + (1−LOWER_BASE)·max(0,tilt)/MAX_TILT`; direita espelho com −tilt.
  - `approach(cur,target,rate,dt) = cur + (target−cur)·(1−exp(−rate·dt))`. `moveToward(cur,target,maxDelta)`.
  - `computeLoadMatrix(upper, tilt)`: BODY[r][c] fixo = soma de gaussianas (cabeça r≈0.8 a=0.55; escápulas r≈3.8 a=0.75; sacral r≈7.6 a=1.0; coxas r≈11 a=0.45; calcanhares r≈14.6 a=0.6 em dois lobos c≈2.5/4.5), colunas 1..6. `rowFactor = s_r / mean(s_{r−2..r+2})`, s = max(upper,0.05). `colFactor = max(0.05, 1 + 1.4·sin(tiltRad)·zN_c)`, zN em [−1,1], normalizado pela média da linha. `v = clamp(BODY·rowFactor·colFactor / 1.6, 0, 1)`.
  - `export const REFERENCE_MATRIX = computeLoadMatrix(Array(N_UPPER).fill(REF), 0)`.
  - `regionLoads(matrix)`: linhas 0–1 head, 2–5 scapular, 6–9 sacral, 10–12 thighs, 13–15 heels. Labels: "Cabeça", "Região escapular", "Região sacral", "Coxas", "Calcanhares".
  - `sideShare(matrix)`: colunas 0–3 vs 4–7 em %.
  - `subsystemHealth(fault)`: leak → lineA alert, valves alert; overpressure → lineA alert, valves alert; pump → pump offline; sensor → sensors offline; qualquer falha → controller alert.
  - `tick(s, dtReal)` (imutável; dt = min(dtReal, DT_MAX)):
    1. Com falha: fault.elapsed += dt; tiltTarget=0; tilt moveToward 0 a TILT_RATE·1.5·dt; fase e elapsed congelados. `safe` true após 2.5 s (leak), 2.2 s (overpressure), 1.0 s (pump/sensor).
    2. Sem falha e playing: dts = dt·speed; elapsed += dts. alternating/fault: phase = (phase + dts/CYCLE_SECONDS) % 1. lateral: tilt moveToward tiltTarget a TILT_RATE·dts.
    3. Sempre: upper[i] = approach(upper[i], target_i, rate_i, dt); rate padrão INFLATE_RATE·max(1,speed). Alvos por falha: leak → câmara 6 → 0.08 rate 0.5, demais REF; overpressure → grupo A → OVER rate 6 enquanto elapsed<1.2 s, depois tudo REF rate 3; pump → max(LOW, u−0.02) rate 0.3; sensor → tudo REF. `lower = approach(lower, lowerTargets(tilt), 4, dt)`. `matrix = fault?.type==='sensor' ? s.matrix : computeLoadMatrix(upper, tilt)`.
  - `buildTelemetry(s, history)`: anexa amostra com `slice(-(HISTORY_MAX−1))`.
- Teste (`node:test` + `node:assert/strict`): (1) estático 200 ticks de 0.05: upper ≈ REF, sideShare 50/50 ±0.5, matrix em [0,1] length 128; (2) alternatingLevel(0)===1, (0.6)===0, sem salto >0.05 entre p e p+0.001; (3) lateral tiltTarget 15 por 5 s: 0<tilt≤15, lower[0]>lower[1], side.right>side.left; (4) leak: câmara 6 <0.3 em ≤5 s, fase inalterada, safe true; (5) tick(s,10) = dt 0.1.

### Etapa 4: Store e loop (coder)
```ts
interface SimulationStore {
  sim: SimState; telemetry: Telemetry;
  showGroups: boolean; compare: boolean;
  baseline: { matrix: number[]; label: string };     // padrão: REFERENCE_MATRIX, 'Referência (modo estático)'
  step(dt: number): void;                // sim = tick(sim, dt); a cada TELEMETRY_INTERVAL real → telemetry = buildTelemetry
  setMode(mode: SimMode): void;          // limpa falha; playing=true; tiltTarget=0 exceto 'lateral'
  togglePlay(): void; setSpeed(s: Speed): void;
  reset(): void;                         // createInitialSim() preservando mode/speed; zera history e falha
  setTiltTarget(deg: number): void;      // clamp ±MAX_TILT; se mode!=='lateral' → mode='lateral'; playing=true
  snapNeutral(): void;                   // tilt=tiltTarget=0 instantâneo, lower=[LOWER_BASE,LOWER_BASE]
  returnToCenter(): void;                // tiltTarget=0 gradual, playing=true
  triggerFault(t: FaultType): void;      // mode='fault', playing=false, fault={type:t,elapsed:0,safe:false}
  clearFault(): void;                    // fault=null, playing=true
  toggleGroups(): void; toggleCompare(): void;
  captureBaseline(): void;               // {matrix: sim.matrix.slice(), label: `Capturado em ${formatClock(elapsed)}`}
  resetBaseline(): void;
}
```
- Toda ação visível chama `buildTelemetry` na hora.
- `useSimulationLoop()`: um rAF com `dt = min((now−last)/1000, 0.1)` → `getState().step(dt)`. Montado uma vez em `App.tsx`.
- **Regra de leitura**: componentes React só selecionam primitivos/slices de baixa frequência (`s.sim.mode`, `s.sim.playing`, `s.sim.speed`, `s.sim.tiltTarget`, `s.sim.fault?.type ?? null`, `s.sim.fault?.safe ?? false`, `s.telemetry`, `s.showGroups`, `s.compare`, `s.baseline`). **Proibido** selecionar `s.sim` inteiro, `s.sim.fault`, `upper`/`matrix`/`tilt` em componente React. Vários campos → `useShallow`.

### Etapa 5: Modelo 3D procedural (coder) — `src/components/three/*`
- **`Viewport3D.tsx`** (eager): `hasWebGL()` em nível de módulo (webgl2 || webgl). `lazy(() => import('./Mattress3D'))` + ErrorBoundary de classe. `useInView` do `motion/react` `{margin:'300px', once:true}` decide montar; segunda chamada decide `active`. Estado `zoom` [1,1.8] com botões Zoom+/Zoom−/Resetar vista (aria-label). Atributos: `data-testid="viewport-3d"`, `data-variant`, `data-webgl`, `data-fault`, `data-reduced-motion`. Suspense fallback `data-testid="viewport-loading"`. Sem WebGL/erro → `<MattressFallback/>`.
```ts
type Viewport3DProps = { variant: 'hero'|'simulator'|'explorer'; selectedLayer?: LayerId|null;
  onSelectLayer?: (id: LayerId) => void; exploded?: boolean; className?: string };
```
- **`Mattress3D.tsx`** (default export, lazy): `<Canvas dpr={[1,1.5]} frameloop={active?'always':'never'} camera={{fov:32, position}} gl={{antialias:true, powerPreference:'high-performance'}}>`. Ambient + directional, `<Environment resolution={256} frames={1}>` só com `<Lightformer>`. `<Shadow>` do drei. Sem shadow map, ContactShadows contínuo, transmission, pós-processamento. `<OrbitControls enablePan={false} enableZoom={false} minPolarAngle={0.5} maxPolarAngle={1.35} minAzimuthAngle={-1} maxAzimuthAngle={1} enableDamping/>`, desabilitado em `(pointer: coarse)` em hero e explorer. Zoom só por botões: `ZoomRig` amortece `camera.zoom` + `updateProjectionMatrix`; `resetKey` → `controls.reset()`. Câmeras: hero [2.4,1.5,2.6]; simulator [2.2,1.7,2.4]; explorer [2.6,2.3,3.0] target [0,0.5,0].
- **`MattressLayers.tsx`**: exporta `LOOK` (único ponto de ajuste visual 3D para o design). Eixo x = comprimento (cabeceira x−), z = largura (direita z+).

| Camada | Geometria | Posição / comportamento |
|---|---|---|
| Base | RoundedBox [2.06, 0.07, 0.96] | fixa |
| tiltChambers | 2× box [1.92, 0.04 + 0.16·lower, 0.43] | z = ±0.225 |
| Plataforma (pivô) | — | rotation.x = +tiltRad; pivô na borda z = +W/2 se tilt ≥ 0, senão −W/2 |
| foam | [1.96, 0.09, 0.88] | dentro da plataforma |
| topChambers | 16× RoundedBox [0.112, 0.15, 0.84], radius 0.035, pitch 0.12 | scale.y = max(upper,0.05); position.y = 0.09 + 0.075·upper; cor A/B se showGroups; emissive pulsante no activeGroup em alternating |
| Cargas artificiais (só simulator) | 4 RoundedBox translúcidas c/ wireframe | cabeça x −0.82; escapular −0.42; sacral 0; calcanhares 0.82 |
| pneumatic | TubeGeometry de CatmullRomCurve3 (useMemo), linhas A/B em z = −0.47 com ramais | — |
| controller | box [0.2,0.16,0.34] em x=1.22, LED (verde ok / vermelho falha) e plano "tela" | — |
| sensors | pucks S1/S2/S3 nas linhas + manta S4 (PlaneGeometry wireframe 15×7 sobre a espuma) | — |
| cover | RoundedBox [2.0,0.26,0.92] opacidade ~0.14 | só hero e explorer |

  - Animação só em `useFrame` lendo `getState()` e mexendo em refs. Nunca setState no useFrame.
  - Intro (hero): camadas descem em sequência de y+0.8 a 0 (easeOutCubic 0.7 s, stagger 0.15 s); câmaras inflam em onda 0→REF. Pulada se reduced motion.
  - Sway do hero: `rotation.y = sin(t·0.2)·0.15` sem reduced motion.
  - Explodido (explorer): `explode` amortecido 0→1; offsets y — tiltChambers 0.22, foam 0.45, sensors 0.85, topChambers 0.7, cover 1.0; pneumatic sai em z −0.35; controller em x +0.4. Camada selecionada: emissive accent; demais opacidade 0.3. `onClick` por camada → `onSelectLayer` (stopPropagation, cursor pointer).
  - Falha: camada afetada emissive vermelho pulsante. leak → topChambers[6]; overpressure → pneumatic + câmaras A; pump → controller; sensor → sensors.
- **`MattressFallback.tsx`**: SVG vista lateral, 16 retângulos (`telemetry.chambers`), 2 câmaras laterais, grupo rotacionado por `telemetry.tilt`. `data-testid="mattress-fallback"`, texto "WebGL indisponível — exibindo esquema 2D equivalente".

### Etapa 6: Seção do simulador (coder) — `src/components/simulator/*`
- **`Simulator.tsx`** (`<section id="simulador">`): título "Experimente o funcionamento do PressuSense Air", chip "Simulação digital · valores relativos e ilustrativos (u.a.)". Âncora `id="simulador-palco"`. Grid ≥lg: 3D col 8 (altura `clamp(320px, 48vh, 560px)`, `<FaultAlert>` sobreposto) + `<SimulationControls>` col 4 sticky. Painel inferior: `<PressureHeatmap>` (5), `<SimulationCharts>` (4), `<SimulationIndicators>` (3). <1024 px empilhado. Em 1366×768 com `#simulador-palco` no topo: 3D, controles e heatmap visíveis.
- **`SimulationControls.tsx`**: tabs `aria-pressed`: `mode-static`, `mode-alternating`, `mode-lateral`, `mode-fault`. Transporte: `sim-play-toggle`, `sim-reset`, `speed-0.5`/`speed-1`/`speed-2`/`speed-4`. Alternada: `toggle-groups`, legenda A/B, `cycleLabel`. Lateral: `tilt-neutral` (snapNeutral), `tilt-left` (−15), `tilt-right` (+15), `tilt-center` (returnToCenter), `tilt-slider` (range −20..20 step 1, aria-label "Ângulo demonstrativo"). Aviso: "A animação não representa procedimento clínico validado." Falhas: `fault-leak`, `fault-overpressure`, `fault-pump`, `fault-sensor` + lista de saúde (`telemetry.subsystems`).
- **`SimulationIndicators.tsx`**: chips C1–C16 (grupo, u.a., falha em vermelho). `stat-group-a`, `stat-group-b`, `stat-elapsed` (mm:ss + "ciclo comprimido para demonstração"). `tilt-value` ("12,4°"), `lower-left`, `lower-right`. "Câmaras responsáveis": tilt>0.5 → "Câmara inferior esquerda inflando · direita em exaustão" (espelho para negativo). `side-left`/`side-right` em % com Δ p.p. Nunca mmHg/kPa; sempre "u.a. (simulado)".
- **`PressureHeatmap.tsx`**: Canvas 2D `width=ROWS` (16) `height=COLS` (8) escalado por CSS (`width:100%`, `aspect-ratio:2/1`, `image-rendering:auto`). Desenho via `subscribe((s,p) => s.sim.matrix !== p.sim.matrix && draw())` com `putImageData`. Orientação: cabeceira à esquerda; coluna 0 no topo; rótulos "Cabeceira / Pés / E / D". `heatColor(v)`: 0→#1E40AF; 0.33→#23D5E7; 0.66→#FACC15; 1→#EF4444. `<figure data-testid="heatmap" data-side-left data-side-right data-peak>`, canvas `role="img"` + aria-label com resumo por região. `heatmap-compare-toggle` → lado a lado `heatmap-baseline` ("Antes") e "Agora", com `heatmap-capture` e `heatmap-baseline-reset`. Overlay "S4 sem comunicação — exibindo último valor válido" em falha sensor. Legenda 4 níveis "escala ilustrativa". Disclaimer literal: "Este é um modelo demonstrativo simplificado. Uma redução da carga estimada em uma região não significa que o risco de lesão foi clinicamente eliminado."
- **`SimulationCharts.tsx`** (Recharts, `isAnimationActive={false}`, pai com altura explícita): LineChart de history A/B (+ E/D em lateral), eixo u.a. BarChart de `regions.share` + barras do baseline (`regionLoads(baseline.matrix)` useMemo) quando compare.
- **`FaultAlert.tsx`**: `role="alert"` `data-testid="fault-alert"`. Título/mensagem de `content.ts`. `data-testid="safe-state"` com checklist quando safe. `fault-reset` → clearFault. Texto "Demonstração conceitual — não demonstra segurança clínica."

### Etapa 7: Modelo econômico, teste e calculadora (coder)
- `src/lib/economicModel.ts` (zero imports de valor), `src/lib/format.ts`, `src/components/EconomicCalculator.tsx` (`<section id="economia">`), `tests/economicModel.test.ts`.
```ts
export interface EconomicInputs { beds; patientsPerBedYear; equipmentCostPerBed; maintenancePerBedYear;
  incidencePct; reductionPct; incrementalCostPerCase; horizonYears: number }
export const DEFAULT_INPUTS = { beds:20, patientsPerBedYear:24, equipmentCostPerBed:6500, maintenancePerBedYear:450,
  incidencePct:8, reductionPct:20, incrementalCostPerCase:9000, horizonYears:5 };
export const INPUT_LIMITS: Record<keyof EconomicInputs,{min;max;step}>
// beds 1–1000/1; patients 1–120/1; equip 0–200000/100; maint 0–50000/50; incid 0–100/0.5; red 0–100/1; caso 0–500000/100; horizonte 1–10/1
export function sanitizeInputs(i: Partial<Record<keyof EconomicInputs, number>>): EconomicInputs // NaN→min, clamp
export function computeEconomics(i: EconomicInputs): { initialInvestment; annualMaintenance; baselineCasesPerYear;
  avoidedEventsPerYear; grossSavingsPerYear; netPerYear; balanceAtHorizon; paybackYears: number|null;
  series: { year; cumulativeCost; cumulativeSavings; balance }[] }   // year 0..H
```
- Fórmulas (exibidas em `<details>` "Como calculamos"): investimento = leitos × custo equip; manutenção/ano = leitos × manut/leito; casos base/ano = leitos × pacientes/leito/ano × incidência/100; evitados/ano = casos base × redução/100; economia bruta/ano = evitados × custo incremental; saldo(n) = n × (economia bruta − manutenção) − investimento; payback = investimento / (economia bruta − manutenção) ou null se ≤ 0.
- Teste defaults: 130000; 9000; 38.4; 7.68; 69120; saldo(5)=170600; payback ≈ 2.162. `sanitizeInputs({beds:-5, incidencePct:NaN})` → beds 1, incidence 0.
- UI: number + range sincronizados; valor bruto string local, normaliza no blur. Testids: `econ-beds`, `econ-patients`, `econ-equipment`, `econ-maintenance`, `econ-incidence`, `econ-reduction`, `econ-case-cost`, `econ-horizon`. Saídas: `econ-investment`, `econ-maintenance-annual`, `econ-avoided`, `econ-gross`, `econ-balance`, `econ-payback`. ComposedChart: barras de saldo + linhas custo/economia acumulados. `econ-reset` "Restaurar valores". BRL via `Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL',maximumFractionDigits:0})`. Disclaimers: "cenário matemático exploratório…" e "valores hipotéticos editáveis — não é preço do PressuSense Air".

### Etapa 8: Conteúdo e explorador (coder)
- `src/lib/content.ts` (dados tipados; design pode editar textos, nunca chaves/ids): `LAYER_ORDER`, `LAYERS: Record<LayerId,{title;fn;importance;costLever;limitations;status}>`, `FAULT_COPY: Record<FaultType,{title;message;safeState:string[]}>`, `COMPARISON_ROWS`, `ROADMAP_STEPS` (5), `CRITERIA` (5×20%), `IMPACT_POINTS`, `STATUS_LABELS`. `type Status = 'simulated'|'proposed'|'validation'` → "Simulado neste MVP digital", "Proposto · ainda não construído", "Requer validação física e clínica".
- Sementes do explorador: Revestimento (barreira/higiene; tecido técnico com zíper; microclima e desinfetantes não ensaiados). Câmaras superiores (alternância A/B; células idênticas termossoldadas substituíveis; fadiga/soldas/ciclo não validados). Câmaras de inclinação (duas bolsas longitudinais na mesma bomba via válvulas; estabilidade/deslizamento; não substitui enfermagem). Espuma (suporte passivo se o ar falhar; blocos densidade padrão; compressão permanente e inflamabilidade). Pneumático (bomba de diafragma, solenoides 12 V, engates rápidos de prateleira; ruído e conexões como ponto de vazamento). Sensores (MEMS nas linhas, matriz de superfície em estudo; calibração/deriva; heatmap **modelado, não medido**). Controlador (microcontrolador comum, operação local, lógica de estado seguro; normas IEC 60601-1, 60601-1-2, 62304, ISO 14971 "a avaliar").
- `FAULT_COPY.leak`: "Vazamento de ar simulado na câmara C7 (Grupo A)". Estado seguro: "Alternância suspensa", "Câmara isolada", "Demais câmaras na pressão de referência", "Inclinação retornada ao centro", "Alerta local à equipe".
- `EngineeringExplorer.tsx` (`#engenharia`): `<Viewport3D variant="explorer" selectedLayer onSelectLayer exploded/>`, 7 botões `layer-{id}` (aria-pressed), painel `layer-detail` (função, importância, redução de custo, limitações, status). `explorer-explode-toggle` ("Vista explodida"/"Vista montada"). Seleção local, padrão `topChambers`.

### Etapa 9: Modo apresentação (coder)
- `src/store/presentationStore.ts`, `src/lib/presentationScript.ts`, `src/components/PresentationMode.tsx`, `Header.tsx` (botão `demo-start` "Demo de 3 minutos").
```ts
{ active: boolean; paused: boolean; elapsed: number /*0..180*/; lastCueAt: number;
  start(): void /* reset() + setMode('static') + scroll #inicio; elapsed=0; lastCueAt=-0.001 */;
  stop(): void; togglePause(): void; next(): void; prev(): void; restart(): void; advance(dt: number): void }
```
- Cues com tempo absoluto disparam em `(lastCueAt, elapsed]`. `next()`/`prev()`: `elapsed = step.start`, `lastCueAt = step.start − 0.001`.
- `STEPS: { title; start; end; talkingPoints: string[]; cues: { at: number; run: () => void }[] }[]`:
  - 0–30 "Problema e proposta": `#inicio`.
  - 30–75 "Pressão alternada": at 0 → `#simulador-palco`, setMode('alternating'), setSpeed(2).
  - 75–120 "Inclinação lateral": at 0 → setMode('lateral'), setTiltTarget(15); at 18 → setTiltTarget(−15); at 34 → returnToCenter().
  - 120–150 "Custos e modularidade": at 0 → `#engenharia`; at 10 → `#economia`; at 22 → `#comparacao`.
  - 150–180 "Impacto, roadmap e encerramento": at 0 → `#impacto`; at 10 → `#roadmap`; at 20 → `#hackasanta`.
  - Scroll: `scrollIntoView({behavior: reduced ? 'auto' : 'smooth', block:'start'})`.
- `PresentationMode.tsx`: só com `active`. Barra fixa inferior (`demo-bar`). `role="progressbar"` `demo-progress` (aria-valuenow em s). 5 indicadores `demo-step-{i}` (aria-current), `demo-prev`, `demo-pause`, `demo-next`, `demo-exit`. `setInterval` 200 ms com delta `performance.now()`. Teclas ← → Espaço Esc (ignorar se foco em input). Em 180 s: pausa + "Demonstração concluída" com Recomeçar/Sair. Spacer no fim de Home quando ativo. **Nunca autostart.**

### Etapa 10: Montagem da Home, stubs e gate (coder) → entrega ao design
- `src/pages/Home.tsx` + stubs funcionais: `Hero.tsx` (`#inicio`), `Comparison.tsx` (`#comparacao`), `SocialImpact.tsx` (`#impacto`), `Roadmap.tsx` (`#roadmap`), `HackaSanta.tsx` (`#hackasanta`), `Footer.tsx`, `ui/Section.tsx`.
- Ordem: Hero → Simulator → EngineeringExplorer → EconomicCalculator → Comparison → SocialImpact → Roadmap → HackaSanta → Footer.
- Hero com textos literais do BRIEF §4, CTAs como `<a href="#engenharia">` e `<a href="#simulador">`. Faixa `data-testid="hero-problem"`: Problema, Proposta e Status ("Conceito em desenvolvimento — simulação digital de engenharia, não é dispositivo médico validado"). `<Viewport3D variant="hero"/>`.
- Header: logo, links (ocultos < md, sem hambúrguer) e `demo-start`.
- Gate: `npm run build`, `npm test`, `npm run lint` sem erros; console limpo.
- README.md: componentes, comandos, deploy Vercel (import do repo ou `npx vercel`; preset Vite; `dist`), funcionalidades concluídas, limitações.

### Etapa 11: Direção visual, Header, Hero, Footer (design-agent)
- Identidade "instrumentação biomédica de precisão": grid técnico sutil, rótulos mono caixa alta, números tabulares Geist Mono. Ciano só para estado ativo; verde só confirmação/estado seguro; amarelo/vermelho só heatmap e alertas. Sem glow excessivo, sem cards repetidos.
- `src/index.css` (expandir `@theme`, keyframes), `Header.tsx`, `Hero.tsx` (100svh; texto à esquerda, 3D à direita; callouts das camadas em sincronia com a intro), `Footer.tsx` (disclaimers completos, link Stiegelmeyer `rel="noopener noreferrer"`, sem patrocinadores).
- Entrada do texto do hero ≤ 600 ms. Skills: `impeccable`, `taste-skill`, `emil-design-eng`, `animation-performance`.

### Etapa 12: Seções institucionais (design-agent)
- `Comparison.tsx`: tabela Recurso | Sistemas existentes (categoria) | Direcionamento PressuSense | `StatusBadge`; legenda dos 3 status; sem preços, superioridade ou imagens de concorrentes.
- `SocialImpact.tsx`: título literal §11, editorial tipográfico, sem estatística.
- `Roadmap.tsx`: 5 etapas com trilho diferenciando "em desenvolvimento (MVP digital)" de "planejado".
- `HackaSanta.tsx`: evento, tema, trilhas, barra segmentada 5×20% com "como pretende atender" + status por critério.
- `ui/StatusBadge.tsx`, `ui/Disclaimer.tsx`.

### Etapa 13: Polish, 3D e responsividade (design-agent)
- Só markup e classes em `simulator/*`, `EngineeringExplorer.tsx`, `EconomicCalculator.tsx`, `PresentationMode.tsx`; cores/eixos Recharts; `LOOK` e luzes em `Mattress3D.tsx`; reveals `whileInView` sutis.
- Breakpoints: 375, 768, 1366×768 (prioridade), 1920. Sem overflow horizontal.
- **Proibido ao design**: editar `store/*`, `lib/simulationEngine.ts`, `lib/economicModel.ts`, `hooks/*`, cues de `presentationScript.ts`, lógica de `useFrame`, geometria; remover/renomear `data-testid`, ids de seção, roles ARIA; criar botão sem ação. Lógica nova → `// TODO(coder): …`.
- Verificação: screenshots Playwright nos 4 viewports.

### Etapa 14: Ajustes finais (coder, só se houver TODO(coder))
- Resolver `TODO(coder)` e repetir gate.

## Riscos e pontos de atenção
- create-vite em diretório não vazio (scaffold em subpasta e mover).
- Peer do fiber 9.8 (`react <19.4`) → fixar `~19.3.1`.
- Dependência de CDN no evento: só Lightformers, nada de `Text`, fontes via fontsource.
- Zustand v5: regra de leitura da Etapa 4.
- Desempenho GPU integrada: montagem perto da viewport, `frameloop='never'` fora da tela, dpr ≤ 1.5, sem sombra real-time, 16 meshes simples.
- Scroll sequestrado: `enableZoom=false`, controles desligados em pointer coarse no hero/explorer.
- Flags estritas do TS 6: `import type` em linha própria, sem enums, `_` em params.
- `--experimental-strip-types`: engine e economicModel autocontidos; testes fora de `src`.
- Recharts: pai com altura; animação desligada.
- Chunk three ~700 kB: lazy + `chunkSizeWarningLimit`.
- Linguagem clínica: proibido mmHg/kPa, "previne", "comprovado" (exceto negação), estatística sem fonte, patrocinador.
- Headless Chromium usa SwiftShader: 3D lento mas funcional; fallback testado anulando `getContext` via `addInitScript`.

## Checklist de aceitação (BRIEF §17 → Playwright)
1. **Problema <15 s**: 1366×768, `goto('/')`; em ≤3 s visíveis h1 "PressuSense Air", headline literal e `hero-problem` com "lesões por pressão" e "simulação digital".
2. **3D**: `[data-testid=viewport-3d][data-variant=hero] canvas` visível em ≤15 s, screenshot não uniforme; zoom muda screenshot; com WebGL anulado, `mattress-fallback` aparece e simulador segue operável.
3. **Alternada**: `mode-alternating` aria-pressed=true; com `speed-2`, `stat-group-a`/`stat-group-b` divergem e mudam entre t0 e t+3 s; canvas muda; `sim-play-toggle` em pausa congela por 1 s; `sim-reset` → `stat-elapsed` 00:00; `toggle-groups` alterna aria-pressed.
4. **Lateral**: `tilt-right` → `tilt-value` >5° em 3 s e `lower-left` > `lower-right`; `tilt-left` negativo; `tilt-center` volta a ~0 gradual; `tilt-neutral` zera na hora; `tilt-slider` não passa de 20.
5. **Heatmap**: estático `data-side-left` ≈ `data-side-right`; após tilt direita, `data-side-right` maior; alternado `data-peak`/screenshot muda; `heatmap-compare-toggle` mostra `heatmap-baseline` lado a lado no desktop; disclaimer literal presente.
6. **Falha**: para cada `fault-*`: `fault-alert` (role=alert) com texto do tipo e `viewport-3d[data-fault=tipo]`; `safe-state` em ≤4 s; grupos param de alternar; `fault-reset` limpa.
7. **Economia**: `econ-beds`=40 dobra `econ-investment` (R$ 260.000); `econ-reduction` atualiza `econ-avoided`; `.recharts-surface` presente; negativo/vazio sem "NaN"; `econ-reset` restaura R$ 130.000.
8. **Demo**: sem clique, `demo-bar` ausente após 5 s; `demo-start` abre; `demo-progress` avança após 3 s; `demo-next` → `demo-step-1`, `mode-alternating`, `#simulador` em viewport; próximo → `mode-lateral` e tilt muda; `demo-prev` volta; Esc/`demo-exit` fecha; controles seguem funcionando.
9. **Status**: `#comparacao` e `#roadmap` com `[data-status]` nos 3 valores + legenda; roadmap etapa 1 "em desenvolvimento", 2–5 "planejado"; hero e footer com disclaimers; nada de "mmHg"/"kPa".
- **Gerais**: `npm run build` e `npm test` exit 0; zero `console.error`; `scrollWidth <= innerWidth` em 375/768/1366/1920; `emulateMedia({reducedMotion:'reduce'})` → `data-reduced-motion=true` e seções visíveis; todo `<button>` com nome acessível e efeito observável.

## Pontos para o critic contestar
- Ordem coder→design (contraria default design→coder do CLAUDE.md).
- `node --experimental-strip-types` em vez de vitest.
- Inputs extras "pacientes por leito/ano" e horizonte na calculadora.
- Ciclo de 8 s comprimido e LEAK_CHAMBER = 6.
- Até 3 contextos WebGL simultâneos vs Canvas único com `View` do drei (descartado por complexidade).
- "Posição neutra" (instantâneo) e "Retornar ao centro" (gradual) como ações distintas.
