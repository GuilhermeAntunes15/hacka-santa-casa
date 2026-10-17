# DELTAS DO CRITIC SOBRE O PLAN.md (prevalecem em caso de conflito) — 2026-10-17

Veredito: **APROVADO COM AJUSTES**. Executar PLAN.md Etapas 1→10 aplicando os deltas abaixo.

## Etapa 1: Scaffold
- **D1.1** NÃO fixar `@types/react(-dom)`. Manter o que o template instalar. Fixar só `react`/`react-dom` `~19.3.1`.
- **D1.2** Se o create-vite perguntar "install/start now?" ou subir dev server, interromper e conferir que os arquivos foram gerados na subpasta. Não rodar `create vite .`.
- **D1.3** `npm run lint`: usar o script que o template trouxer. Não adicionar linter. Se não houver, tirar do gate.
- **D1.4** Fallback Tailwind: se `@tailwindcss/vite` der ERESOLVE com Vite 8, usar `@tailwindcss/postcss` com `postcss.config.mjs` → `export default { plugins: { '@tailwindcss/postcss': {} } }`. Proibido `--legacy-peer-deps`.
- **D1.5** Fontes só via `@import` no `index.css`. Nunca importar fontsource em `.ts`/`.tsx`.

## Etapa 2: Estilos
- **D2.1** `[id]{scroll-margin-top:4.5rem}` em vez de `section{...}`.
- **D2.2** `:focus-visible` global (anel ciano 2px) como token.

## Etapa 3: `src/lib/simulationEngine.ts`
- **D3.1** `tick` substituído por:
```
dt = min(dtReal, DT_MAX)
if (fault): fault.elapsed += dt; tiltTarget = 0; tilt = moveToward(tilt, 0, TILT_RATE*1.5*dt);
            upper[i] = approach(upper[i], faultTarget_i, faultRate_i, dt)
else:       dts = playing ? dt*speed : 0; elapsed += dts;
            if mode ∈ {alternating, fault}: phase = (phase + dts/CYCLE_SECONDS) % 1
            tilt = moveToward(tilt, tiltTarget, TILT_RATE*dts)        // TODOS os modos (corrige tilt preso)
            upper[i] = approach(upper[i], target_i, INFLATE_RATE, dts) // pausa congela tudo
lower = lowerTargets(tilt)                                            // derivado, sem approach
matrix = fault?.type==='sensor' ? s.matrix : computeLoadMatrix(upper, tilt)
```
  - Alvos de falha: leak igual ao PLAN; overpressure condição `fault.elapsed < 1.2`; **pump: alvo `LOW` com rate 0.3**; sensor igual ao PLAN.
- **D3.2** `computeLoadMatrix`: câmara i = linha i (N_UPPER = ROWS). Janela de `rowFactor` cortada em [0, ROWS−1]. BODY = Σ aₖ·exp(−½((r−rₖ)/σr)²)·exp(−½((c−cₖ)/σc)²); tronco cₖ=3.5, σc≈1.6; calcanhares dois lobos c=2.5 e 4.5, σc≈0.6; σr≈1.0; **simétrico em c em torno de 3.5**. `colFactor = max(0.05, 1 + TILT_GAIN·sin(tiltRad)·zN_c)`, zN_c=(c−3.5)/3.5, **sem normalização**. Exportar `TILT_GAIN = 1.4`.
- **D3.3** `buildTelemetry(s, history)` **não anexa nada**, só embute o history recebido. Exportar `sample(s): HistorySample = {a,b,l,r}` sem `t`; eixo X do gráfico por índice. `pct = Math.round(v*100)` **sem clamp**. `groupA` = média pares; `groupB` = média ímpares; `lowerLeft/Right = pct(lower[0|1])`. `cycleLabel=''` e `activeGroup=null` fora de alternating e de fault sem falha ativa.
- **D3.4** `SIM_RANGE` ganha função: chip vermelho "fora do intervalo de simulação" quando `pct < 30 || pct > 105`. `subsystemHealth`: leak → `lineA` alert; overpressure → `lineA` + `valves` alert; pump → `pump` offline; sensor → `sensors` offline; qualquer falha → `controller` alert.
- **D3.5** Testes `tests/*.test.ts`: imports **com extensão `.ts`** (`from '../src/lib/simulationEngine.ts'`); `import type` em linha própria; só sintaxe removível pelo strip. Casos novos: (6) tilt 15 → `{...s, mode:'alternating', tiltTarget:0}` → tilt chega a ≈0; (7) `alternatingLevel` contínuo inclusive 0.999→0; (8) `playing=false` sem falha: `upper`, `phase`, `elapsed` idênticos após 20 ticks; (9) matriz estática simétrica (sideShare 50/50 ±0.5). Opcional: `--disable-warning=ExperimentalWarning`.

## Etapa 4: Store e hook
- **D4.1** History só cresce no `step`, por acumulador `let acc = 0` em nível de módulo. A cada `TELEMETRY_INTERVAL` real, e só se `playing || fault`, `history = [...prev.slice(-(HISTORY_MAX-1)), sample(sim)]` e `buildTelemetry`. Ações chamam `buildTelemetry(sim, get().telemetry.history)`; `reset` passa `[]`.
- **D4.2** `setTiltTarget`: se `mode !== 'lateral'`, aplicar semântica completa de `setMode('lateral')` (limpa falha) antes do clamp.
- **D4.3** `togglePlay` e `setSpeed` no-op com falha ativa; UI marca `disabled`.
- **D4.4** **Apagar `clearFault`.** `fault-reset` chama `reset()` (zera falha e history, mantém modo `fault`, `playing=true`).
- **D4.5** Clamp de dt só no `tick`. Hook passa dt bruto.
- **D4.6** Baseline fixo = `REFERENCE_MATRIX` obrigatório; `captureBaseline`/`resetBaseline` opcionais.

## Etapa 5: 3D
- **D5.1** **Só `variant="simulator"` lê o estado da simulação.** Hero: intro + (opcional) alternância ambiente local sem store, desligada com reduced motion. Explorer: estático em REF, tilt 0. `data-fault` só em `[data-variant=simulator]`.
- **D5.2** Pivô na linha superior central da câmara que desinfla: z=+0.225 se tilt ≥ 0, senão −0.225, y no topo da base + H0. Altura das câmaras inferiores vem do `tilt` no 3D: a que infla `H0 + 0.45·sin|tilt|`, a que desinfla `H0`. `H0 ≥ 0.08`. `lower` fica só para telemetria.
- **D5.3** OrbitControls desligado em `(pointer: coarse)` **em todas as variantes**. Zoom por botões continua.
- **D5.4** `hasWebGL()`: após o teste, `gl.getExtension('WEBGL_lose_context')?.loseContext()`.
- **D5.5** Materiais com opacidade variável nascem com `transparent` e `depthWrite={false}` nos translúcidos. Animar só `opacity`.
- **D5.6** Pulso de emissive sempre que `activeGroup !== null`. Wrapper do canvas com `role="img"` e `aria-label`.
- **D5.7** Cargas artificiais (4 RoundedBox translúcidas) são **obrigatórias**; wireframe opcional. Pucks S1–S3 obrigatórios; manta S4 opcional.

## Etapa 6: Simulador
- **D6.1** `SimulationControls`: transporte comum + **só o grupo do modo ativo**. Lista de saúde só no modo fault. Remover `sticky`. Meta: 3D, controles e heatmap cabem em 1366×768.
- **D6.2** Botões `fault-*` só no modo fault. Transporte `disabled` durante falha.
- **D6.3** Δ p.p. de `side-left/right` é em relação a 50%.
- **D6.4** `PressureHeatmap`: `draw()` na montagem + `subscribe` com unsubscribe no cleanup. Canvas do baseline desenhado uma vez.
- **D6.5** Nada de telemetria em `aria-live`. `FaultAlert` mantém `role="alert"`.

## Etapa 7: Economia
- **D7.1** `<h2>` literal: "Qual o potencial econômico da tecnologia?".
- **D7.2** `sanitizeInputs`: `undefined` → `DEFAULT_INPUTS`, `NaN` → mínimo, depois clamp. Tipos TS reais.
- **D7.3** Testes com tolerância `Math.abs(a-b) < 1e-6`.
- **D7.4** `paybackYears` opcional; se ficar, rotular "Ponto de equilíbrio hipotético (anos)".

## Etapa 8: Conteúdo e Explorer
- **D8.1** `<h2>` literal: "Engenharia projetada para ser acessível".
- **D8.2** `COMPARISON_ROWS`: uma linha por item do §9 (6) + "Pressão alternada" + "Inclinação lateral assistida". Coluna "Sistemas existentes": "disponível na categoria comercial". Cada linha com status.
- **D8.3** `IMPACT_POINTS` com os 5 itens do §11. `ROADMAP_STEPS` com texto literal do §10. `FAULT_COPY` completo para os 4 tipos.
- **D8.4** Link Stiegelmeyer **dentro de `#comparacao`** (`target="_blank" rel="noopener noreferrer"`).
- **D8.5** Status do roadmap: etapa 1 `simulated` "Em desenvolvimento · MVP digital"; 2–3 `proposed` "Planejado"; 4–5 `validation` "Planejado · requer validação física e clínica". `StatusBadge` renderiza `data-status={status}`.

## Etapa 9: Demo
- **D9.1** Tempo absoluto de cada cue = `step.start + cue.at`. Disparo em `(lastCueAt, elapsed]`.
- **D9.2** **Remover `setSpeed(2)`** do cue.
- **D9.3** `prev()` → início do passo `idx−1` (mín 0). `next()` no último → `elapsed=180` (concluído).
- **D9.4** Apagar `restart`; "Recomeçar" chama `start()`.
- **D9.5** `stop()` não mexe no simulador. README: "ao sair, o simulador permanece no último estado".
- **D9.6** `demo-step-{i}` = `<li aria-current>` não interativo.
- **D9.7** Atalhos de teclado opcionais; se implementar, ignorar quando `e.target` for input/select/textarea/button/[contenteditable] ou `e.repeat`.

## Etapa 10: Home
- **D10.1** Stubs já renderizam o conteúdo final do `content.ts` (textos literais do BRIEF). Design só reestiliza.

## Opcionais (só se sobrar tempo)
Captura de baseline; manta S4; callouts do hero; sway do hero; alternância ambiente do hero; `ZoomRig` amortecido (pode setar `camera.zoom` direto); atalhos de teclado da demo; payback; wireframe nas cargas.

## Critérios de aceite adicionais (QA)
- Checklist do PLAN.md (1–9 e gerais), testids inalterados.
- Item 6: clicar `mode-fault` antes e mirar `viewport-3d[data-variant=simulator][data-fault=...]`. `fault-reset` volta ao monitoramento com alternância e `stat-elapsed` 00:00.
- Alternada → lateral 15° → `mode-alternating`: `tilt-value` volta a ≈0°.
- Pausa no meio de transição: `stat-group-a`/`b` e canvas idênticos por 1 s.
- Com falha ativa, `sim-play-toggle` e `speed-*` `disabled`.
- Lateral a 20°: plataforma 3D encosta na câmara inflada (sem gap) e não atravessa a base.
- Hero e explorer não inclinam nem mostram falha quando o simulador muda.
- Viewport 375 px: scroll funciona por cima de todos os canvases.
- `npm test` passa incl. testes 6–9, imports `.ts` explícitos.
- Títulos literais §5, §7, §8, §11. Link Stiegelmeyer em `#comparacao`.
- `#roadmap` com `data-status` nos 3 valores e rótulos "Em desenvolvimento"/"Planejado".
- Demo sai sem speed residual. Espaço com botão focado não dispara duas ações.
- Zero "mmHg", "kPa", "previne", "comprovado" fora de negação. Nenhum botão sem efeito.

## Padrões
`import type` em linha própria; sem enum/namespace/parameter properties; `_` em params não usados; imports relativos (`.ts` explícito só nos testes); seletores Zustand só primitivos ou `useShallow`; nunca `setState` em `useFrame`; constantes visuais no `LOOK`; `TILT_GAIN` é o knob do heatmap. Não fixar `@types/react`. Nenhum CDN. Não adicionar Playwright nem vitest.
