import { useSimulationStore } from '../store/simulationStore'

export interface Cue {
  at: number
  run: () => void
}

export interface DemoStep {
  title: string
  start: number
  end: number
  talkingPoints: string[]
  cues: Cue[]
}

export const DEMO_DURATION = 180

export function scrollToId(id: string) {
  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
  document.getElementById(id)?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' })
}

const sim = () => useSimulationStore.getState()

export const STEPS: DemoStep[] = [
  {
    title: 'Problema e proposta',
    start: 0,
    end: 30,
    talkingPoints: [
      'Pacientes com mobilidade reduzida têm risco de lesões por pressão, com sofrimento, complicações e custos assistenciais.',
      'PressuSense Air: conceito de colchão híbrido de baixo custo — espuma de alta densidade com câmaras de ar controladas.',
      'Este site é uma simulação digital de engenharia, não um dispositivo médico validado.',
    ],
    cues: [{ at: 0, run: () => scrollToId('inicio') }],
  },
  {
    title: 'Pressão alternada',
    start: 30,
    end: 75,
    talkingPoints: [
      'Dois grupos de câmaras, A e B, alternam entre sustentar e aliviar a carga.',
      'O mapa de carga e os gráficos acompanham o mesmo estado do modelo 3D.',
      'O ciclo foi comprimido para a demonstração; os valores são relativos (u.a.).',
    ],
    cues: [
      {
        at: 0,
        run: () => {
          scrollToId('simulador-palco')
          sim().setMode('alternating')
        },
      },
    ],
  },
  {
    title: 'Inclinação lateral',
    start: 75,
    end: 120,
    talkingPoints: [
      'Bolsões longitudinais sob a plataforma inflam de um lado e esvaziam do outro, usando a mesma bomba.',
      'Veja o ângulo simulado e a carga estimada migrando para o lado mais baixo.',
      'A animação não representa procedimento clínico validado.',
    ],
    cues: [
      {
        at: 0,
        run: () => {
          scrollToId('simulador-palco')
          sim().setMode('lateral')
          sim().setTiltTarget(15)
        },
      },
      { at: 18, run: () => sim().setTiltTarget(-15) },
      { at: 34, run: () => sim().returnToCenter() },
    ],
  },
  {
    title: 'Custos e modularidade',
    start: 120,
    end: 150,
    talkingPoints: [
      'Hardware genérico: microcontrolador comum, bomba 12 V e válvulas solenoides de prateleira.',
      'Zonas modulares e eletrônica plugável permitem substituição local de componentes.',
      'O cenário econômico é exploratório e editável — não é preço do produto.',
    ],
    cues: [
      { at: 0, run: () => scrollToId('engenharia') },
      { at: 10, run: () => scrollToId('economia') },
      { at: 22, run: () => scrollToId('comparacao') },
    ],
  },
  {
    title: 'Impacto, roadmap e encerramento',
    start: 150,
    end: 180,
    talkingPoints: [
      'Tecnologia de cuidado não deveria depender apenas do orçamento disponível.',
      'Próximos passos: protótipo de bancada, protótipo de engenharia e validação.',
      'O MVP demonstra o conceito de engenharia e o raciocínio econômico; ainda requer validação física e clínica.',
    ],
    cues: [
      { at: 0, run: () => scrollToId('impacto') },
      { at: 10, run: () => scrollToId('roadmap') },
      { at: 20, run: () => scrollToId('hackasanta') },
    ],
  },
]

export function stepIndexAt(elapsed: number): number {
  let idx = 0
  STEPS.forEach((s, i) => {
    if (elapsed >= s.start) idx = i
  })
  return idx
}

export function runCues(from: number, to: number) {
  for (const step of STEPS) {
    for (const cue of step.cues) {
      const t = step.start + cue.at
      if (t > from && t <= to) cue.run()
    }
  }
}
