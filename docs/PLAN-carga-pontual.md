# Plano — Carga pontual interativa (planner-agent, 2026-10-17)

Feature: 1 carga pontual aplicada por clique no colchão 3D do simulador, clique no heatmap ou teclado. O bump gaussiano é somado ao `BODY` ANTES de `rowFactor`/`colFactor`, então a interação com alternado/lateral/falha de sensor sai de graça do modelo.

## Etapa 1: Engine (`src/lib/simulationEngine.ts`)
```ts
export interface PointLoad { r: number; c: number; intensity: number }   // r 0..15, c 0..7 inteiros; intensity u.a.
// SimState: + point: PointLoad | null        (createInitialSim → null)
// Telemetry: + pointPeak: number | null      (pct(matrix[r*COLS+c]) ou null)
export const POINT_MIN = 0.2, POINT_MAX = 1.2, POINT_DEFAULT = 0.6, POINT_SIGMA = 0.8
export function makePointLoad(r: number, c: number, intensity = POINT_DEFAULT): PointLoad
  // r/c: NaN→0, Math.floor, clamp [0,ROWS-1]/[0,COLS-1]; intensity: NaN→POINT_DEFAULT, clamp [POINT_MIN,POINT_MAX]
export function regionAt(r: number): string            // label de REGIONS cuja faixa contém r
export function computeLoadMatrix(upper: number[], tilt: number, point: PointLoad | null = null): number[]
  // v = clamp(((BODY[idx] + bump(r,c)) * rowFactor[r] * colFactor[c]) / 1.6, 0, 1)
  // bump = point ? intensity * exp(-0.5*((r-pr)/POINT_SIGMA)^2 - 0.5*((c-pc)/POINT_SIGMA)^2) : 0
```
- `tick` usa `computeLoadMatrix(upper, tilt, s.point)`; o ponto atravessa via `...s`. `REFERENCE_MATRIX` fica idêntica.

## Etapa 2: Store (`src/store/simulationStore.ts`)
```ts
setPointLoad(r: number, c: number): void   // makePointLoad(r, c, sim.point?.intensity ?? POINT_DEFAULT)
setPointIntensity(v: number): void         // no-op se !sim.point
clearPointLoad(): void
// helper: withPoint(sim, point) => ({ ...sim, point,
//   matrix: sim.fault?.type === 'sensor' ? sim.matrix : computeLoadMatrix(sim.upper, sim.tilt, point) }) → commit()
```
- `snapNeutral` passa a usar `computeLoadMatrix(sim.upper, 0, sim.point)`.
- `setMode`/`triggerFault` mantêm o ponto. `reset` limpa (via `createInitialSim`).
- Ações recalculam a matriz na hora (funciona pausado).

## Etapa 3: 3D (`src/components/three/MattressLayers.tsx`) — só `variant === 'simulator'`
- `LOOK` + `pointSquash: 0.35`, `pointMarker: LOOK.accent` (ou ciano equivalente).
- Plano de raycast dentro de `<group ref={platform}>`: `<mesh rotation-x={-Math.PI/2} position={[0, topo das células em REF, 0]}>` com `<planeGeometry args={[N_UPPER*PITCH, CELL_SPAN]} />` e `<meshBasicMaterial transparent opacity={0} depthWrite={false} />`. NÃO usar `visible={false}`. Adapte nomes às constantes reais do arquivo.
- `onClick(e)`: se `e.delta > 5 || !e.uv` return; senão `stopPropagation` e `getState().setPointLoad(e.uv.x*ROWS, (1-e.uv.y)*COLS)` (v invertido: com rotação −90° o local +y vira z−, lado E, c=0). Confirme a orientação empiricamente (clique perto da borda z+ → c ≥ 5; marcador do heatmap no mesmo lado/região do marcador 3D).
- `onPointerOver` → cursor `crosshair`; `onPointerOut` → limpa (siga o padrão `document.body.style.cursor` existente).
- Marcador: `<group ref={marker} visible={false}>` com ring deitado (`ringGeometry [0.035,0.05,32]`) e cone apontando para baixo (`coneGeometry [0.03,0.12,16]`, rotation-x π) acima, `meshBasicMaterial` ciano. No `useFrame`: visible = !!point; x = posição da célula r; z = -CELL_SPAN/2 + (c+0.5)*CELL_SPAN/COLS; y = topo da célula r achatada; escala do cone 0.6 + 0.4*intensity/POINT_MAX.
- Achatamento só visual: buffer reutilizado `uVis` (useRef): `uVis[i] = upper[i] * (1 - pointSquash * (intensity/POINT_MAX) * exp(-0.5*((i-r)/POINT_SIGMA)^2))`. Usar `uVis` nas células E nas alturas das LOADS.
- `Viewport3D.tsx`: só o texto de `LABELS.simulator` acrescenta "Clique na superfície para aplicar uma carga pontual ilustrativa; o mapa de carga oferece alternativa por teclado."

## Etapa 4: Heatmap e painel (`PressureHeatmap.tsx`, `content.ts`)
- `content.ts` `SIMULATOR`: `pointLoadHint: 'Clique no colchão 3D ou no mapa para aplicar uma carga pontual.'`, `pointLoadNotice: 'Carga pontual ilustrativa — não representa medição de paciente.'`
- Seletor useShallow só primitivos: `pointR: s.sim.point?.r ?? null`, `pointC`, `intensity`, `pointPeak: s.telemetry.pointPeak`.
- `<figure data-testid="heatmap" data-point-r data-point-c>` (ausentes sem ponto).
- HeatCanvas live com props `point`/`interactive`; wrapper `<div className="relative" data-testid="heatmap-surface" tabIndex={0} role="application" aria-label="Mapa interativo de carga: clique ou use as setas para posicionar a carga pontual; Enter aplica; Delete remove" className="cursor-crosshair">`.
  - `onClick`: rect do canvas → `setPointLoad((x-left)/w*ROWS, (y-top)/h*COLS)` (coluna 0 no topo).
  - `onKeyDown` (só teclas tratadas, `preventDefault()` + `stopPropagation()` para não avançar a demo): ←/→ r∓1/±1; ↑/↓ c∓1/±1; sem ponto parte de (7,3); Enter sem ponto → (7,3); Delete/Backspace → clear.
  - Marcador `<span data-testid="heatmap-point-marker" aria-hidden>` branco com sombra, posição `left:(r+.5)/ROWS*100%`, `top:(c+.5)/COLS*100%`.
  - Baseline não interativo. Overlay de falha de sensor bloqueia clique naturalmente.
- Painel (fieldset, legend `label-mono` "Carga pontual") dentro do PressureHeatmap:
  - `<p data-testid="point-load-label" data-active>`: com ponto `Carga pontual em: ${regionAt(r)} · lado ${c < COLS/2 ? 'E' : 'D'} · pico local ${pointPeak} u.a.`; sem ponto o hint.
  - `<input type="range" data-testid="point-load-intensity" aria-label="Intensidade da carga pontual" min=20 max=120 step=10 disabled sem ponto>` + valor `NN u.a.`.
  - `<button data-testid="point-load-clear" disabled sem ponto>Remover carga pontual</button>`.
  - `<Disclaimer>{SIMULATOR.pointLoadNotice}</Disclaimer>`.
- Manter a altura compacta: em 1366×768 com `#simulador-palco` no topo, 3D + controles + heatmap devem continuar cabendo (se o painel empurrar demais, use linha compacta horizontal).

## Etapa 5: Testes (`tests/simulationEngine.test.ts`)
(10) null → deepEqual REFERENCE_MATRIX; com {7,3,0.6} célula (7,3) > ref, |r−7| ≥ 5 iguais (±1e-6), length 128, [0,1].
(11) alternado sintético: ponto {7,1,0.5}, `m(upB)[7*8+1] > m(upA)[7*8+1] + 0.05`.
(12) lateral: {12,6,0.5} m(+15) > m(−15); espelho c:1 inverso.
(13) tick preserva point e célula acima da ref; point null → REFERENCE_MATRIX.
(14) makePointLoad(-3,99,5) → {0,7,POINT_MAX}; (NaN,3.9,NaN) → {0,3,POINT_DEFAULT}; (15.99,7.99) → 15,7.
(15) falha de sensor com ponto: matriz após tick é a mesma referência (===).
(16) buildTelemetry pointPeak null/igual a Math.round(matrix[r*8+c]*100); regionAt(7) === 'Região sacral'.

## Etapa 6 (opcional): demo (`presentationScript.ts`)
Passo "Pressão alternada": `{ at: 14, run: () => sim().setPointLoad(7, 3) }`, `{ at: 34, run: () => sim().clearPointLoad() }`, talking point "Clique em qualquer parte do colchão ou do mapa para simular uma carga pontual."

## Critérios de aceite
1. `npm test`, `npm run build`, `npm run lint` exit 0; console limpo.
2. Clique em `heatmap-surface` em (12.5/16·w, 6.5/8·h) → `data-point-r="12"` `data-point-c="6"`; label com "Coxas", "lado D", "u.a."; `data-side-right` > `data-side-left`.
3. Clique no centro do canvas simulator define o ponto e o marcador aparece; drag de 80px não altera.
4. Alternado com ponto (7,1): pico local varia ≥ 10 u.a. em 8 s.
5. Lateral (12,6): pico após `tilt-right` > após `tilt-left`.
6. Slider e clear `disabled` sem ponto; slider 60→120 aumenta pico.
7. Clear remove `data-point-r`, label volta ao hint, `data-peak` volta.
8. Teclado: Enter → (7,3) Região sacral; → r=8; ↓ c=4; Delete remove; com demo ativa, → no heatmap focado não muda etapa.
9. `sim-reset` limpa. Hero/explorer sem marcador nem clique.
10. Falha de sensor: clique no heatmap não altera `data-peak`.
11. Disclaimer presente.
