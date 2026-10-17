import type { FaultType, LayerId, SubsystemId } from './simulationEngine'

export type Status = 'simulated' | 'proposed' | 'validation'

export const STATUS_LABELS: Record<Status, string> = {
  simulated: 'Simulado neste MVP digital',
  proposed: 'Proposto · ainda não construído',
  validation: 'Requer validação física e clínica',
}

export const HERO = {
  title: 'PressuSense Air',
  headline: 'Redistribuindo a pressão. Repensando o cuidado.',
  subtitle:
    'Um conceito de colchão pneumático inteligente e acessível, projetado para combinar alternância de pressão, assistência ao reposicionamento lateral e monitoramento em uma única plataforma.',
  ctaExplore: 'Explorar a tecnologia',
  ctaSimulator: 'Testar o simulador',
  problem:
    'Pacientes com mobilidade reduzida apresentam risco de desenvolver lesões por pressão. Essas lesões podem causar sofrimento, complicações clínicas e custos assistenciais adicionais.',
  proposal:
    'Democratizar o acesso a tecnologias de suporte para prevenção de lesões por pressão, com arquitetura modular, manutenção simplificada e controle pneumático inteligente.',
  status: 'Conceito em desenvolvimento — simulação digital de engenharia, não é dispositivo médico validado',
}

export const NAV_LINKS = [
  { href: '#simulador', label: 'Simulador' },
  { href: '#engenharia', label: 'Engenharia' },
  { href: '#economia', label: 'Economia' },
  { href: '#comparacao', label: 'Comparação' },
  { href: '#roadmap', label: 'Roadmap' },
  { href: '#hackasanta', label: 'HackaSanta' },
]

export interface LayerInfo {
  title: string
  fn: string
  importance: string
  costLever: string
  limitations: string
  status: Status
}

export const LAYER_ORDER: LayerId[] = [
  'cover',
  'topChambers',
  'tiltChambers',
  'foam',
  'pneumatic',
  'sensors',
  'controller',
]

export const LAYERS: Record<LayerId, LayerInfo> = {
  cover: {
    title: 'Revestimento',
    fn: 'Capa em tecido bi-elástico revestido em PU que envolve o conjunto e forma a superfície de contato com o paciente.',
    importance: 'É a barreira contra fluidos e sujidades e a camada que a equipe higieniza todos os dias; capa soldada e válvulas seladas facilitam a limpeza hospitalar padrão.',
    costLever: 'Tecido técnico de mercado com zíper de acesso: troca-se só a capa, sem descartar espuma nem câmaras.',
    limitations: 'Respirabilidade, ação antideslizante, impermeabilidade e retardância ao fogo são requisitos de projeto, ainda não ensaiados; biocompatibilidade (ISO 10993) a avaliar.',
    status: 'proposed',
  },
  topChambers: {
    title: 'Câmaras superiores de pressão alternada',
    fn: 'Câmaras de ar em PU/TPU embutidas na espuma, organizadas em dois grupos (A e B) que se alternam entre sustentar e aliviar a carga.',
    importance: 'A alternância muda periodicamente os pontos de apoio do corpo — o princípio de redistribuição de carga da proposta.',
    costLever: 'Poucas zonas modulares em vez de uma matriz de centenas de células: menos válvulas, menos complexidade e módulos fabricáveis e substituíveis separadamente.',
    limitations: 'Fadiga do material, soldas e tempo de ciclo não foram validados. Na operação real o ciclo seria da ordem de minutos; aqui ele é comprimido para 8 s. Pressão baixa demais deixa o corpo afundar; alta demais cria novos pontos de pressão.',
    status: 'simulated',
  },
  tiltChambers: {
    title: 'Câmaras inferiores de inclinação',
    fn: 'Grupo lateral de bolsões longitudinais sob a plataforma: comandos discretos inflam um lado e esvaziam o oposto, inclinando a superfície.',
    importance: 'Auxilia o reposicionamento lateral sem mover o paciente manualmente, com retorno lento ao neutro.',
    costLever: 'Usa a mesma bomba das câmaras superiores, direcionada por válvulas solenoides — sem um segundo sistema de acionamento.',
    limitations: 'Estabilidade, deslizamento e cisalhamento no quadril e na região lombar precisam de ensaio. Não indicado para todos: com fratura espinhal instável ou tração cervical não se deve lateralizar. Complementa, não substitui, a enfermagem.',
    status: 'simulated',
  },
  foam: {
    title: 'Espuma estrutural',
    fn: 'Base de espuma de poliuretano de alta densidade (ref. RG70) em formato "U", que aloja as câmaras e dá forma ao conjunto.',
    importance: 'Estrutura híbrida: a espuma dá a sustentação fixa e só parte do colchão precisa ser inflável. Com o design célula-sobre-célula, mantém apoio mesmo se o ar faltar.',
    costLever: 'Blocos de densidade padrão de mercado, cortados em módulos, sem moldagem sob medida.',
    limitations: 'Compressão permanente ao longo do tempo e inflamabilidade ainda precisam ser avaliadas; capacidade de ≈ 200 kg é meta de projeto, não valor ensaiado.',
    status: 'proposed',
  },
  pneumatic: {
    title: 'Sistema pneumático',
    fn: 'Uma bomba de ar DC 12 V insufla todas as câmaras; válvulas solenoides direcionam o ar para o Grupo A, o Grupo B ou o grupo lateral.',
    importance: 'Transforma a lógica do controlador em movimento físico e, em falha, fecha as válvulas para reter o ar (modo seguro).',
    costLever: 'Bomba genérica de prateleira, válvulas solenoides de 12 V e engates rápidos, fáceis de encontrar e trocar localmente.',
    limitations: 'Ruído da bomba e cada conexão como possível ponto de vazamento precisam ser medidos em bancada.',
    status: 'simulated',
  },
  sensors: {
    title: 'Sensores',
    fn: 'Sensores de pressão nas linhas pneumáticas (S1–S3) e uma matriz de superfície em estudo (S4) com FSR ou filme condutor Velostat.',
    importance: 'Permitem detectar vazamentos, valores fora do intervalo e perda de comunicação para acionar o modo seguro e o alarme.',
    costLever: 'Sensores de uso geral e substituíveis; a matriz de superfície usa materiais de baixo custo e é apenas qualitativa.',
    limitations: 'Calibração e deriva não foram avaliadas; a matriz seria apenas qualitativa/demonstrativa. O heatmap deste site é modelado, não medido.',
    status: 'validation',
  },
  controller: {
    title: 'Controlador eletrônico',
    fn: 'Microcontrolador comum (ex.: ESP32) que gerencia os ciclos A↔B, os comandos de inclinação, a leitura dos sensores e as respostas a falhas.',
    importance: 'Concentra a lógica de modo seguro e a interface off-line com LEDs e sinal sonoro, pensada para hospitais com conectividade limitada.',
    costLever: 'Eletrônica plugável e de prateleira, com operação local — sem nuvem nem assinatura de software.',
    limitations: 'Normas a avaliar: IEC 60601-1, IEC 60601-1-2, IEC 62304 e ISO 14971; registro ANVISA conforme RDC 751/2022 (classe a definir). Nenhuma certificação foi obtida.',
    status: 'simulated',
  },
}

export interface FaultCopy {
  label: string
  title: string
  message: string
  safeState: string[]
}

export const FAULT_ORDER: FaultType[] = ['leak', 'overpressure', 'pump', 'sensor']

export const FAULT_COPY: Record<FaultType, FaultCopy> = {
  leak: {
    label: 'Vazamento de ar',
    title: 'Vazamento de ar simulado na câmara C7 (Grupo A)',
    message:
      'A pressão relativa da câmara C7 caiu abaixo do intervalo de simulação. O controlador suspendeu a alternância, fechou a válvula da câmara afetada e acionou o alarme local. Regra de projeto: alarme ao perder mais de 20% da pressão em 1 minuto (tempo comprimido no simulador).',
    safeState: [
      'Alternância suspensa',
      'Câmara isolada',
      'Demais câmaras na pressão de referência',
      'Inclinação retornada ao centro',
      'Alerta local à equipe',
    ],
  },
  overpressure: {
    label: 'Pressão fora do intervalo',
    title: 'Pressão pneumática fora do intervalo de simulação (linha do Grupo A)',
    message:
      'A linha do Grupo A ultrapassou o limite superior do intervalo simulado. A válvula de alívio foi acionada e as câmaras retornam à referência.',
    safeState: [
      'Alternância suspensa',
      'Válvula de alívio acionada',
      'Câmaras retornando à pressão de referência',
      'Inclinação retornada ao centro',
      'Alerta local à equipe',
    ],
  },
  pump: {
    label: 'Bomba indisponível',
    title: 'Bomba indisponível (simulado)',
    message:
      'O controlador não detecta resposta da bomba. As válvulas fecharam (modo seguro) e o design célula-sobre-célula, com a espuma estrutural, mantém o colchão parcialmente inflado enquanto a equipe é alertada.',
    safeState: [
      'Alternância suspensa',
      'Válvulas fechadas para reter o ar',
      'Suporte passivo célula-sobre-célula e espuma',
      'Inclinação retornada ao centro',
      'Alerta local à equipe',
    ],
  },
  sensor: {
    label: 'Sensor sem comunicação',
    title: 'Sensor S4 sem comunicação (simulado)',
    message:
      'A matriz de superfície S4 (FSR/Velostat, qualitativa) parou de responder. O mapa exibe o último valor válido, as câmaras voltam à referência e a interface off-line sinaliza com LED e sinal sonoro.',
    safeState: [
      'Alternância suspensa',
      'Último valor válido mantido e sinalizado',
      'Câmaras na pressão de referência',
      'Inclinação retornada ao centro',
      'Alerta local à equipe',
    ],
  },
}

export const SUBSYSTEM_LABELS: Record<SubsystemId, string> = {
  pump: 'Bomba',
  valves: 'Válvulas',
  lineA: 'Linha Grupo A',
  lineB: 'Linha Grupo B',
  lateral: 'Câmaras de inclinação',
  sensors: 'Sensores',
  controller: 'Controlador',
}

export const HEALTH_LABELS = { ok: 'Normal', alert: 'Alerta', offline: 'Sem resposta' } as const

export const SIMULATOR = {
  title: 'Experimente o funcionamento do PressuSense Air',
  chip: 'Simulação digital · valores relativos e ilustrativos (u.a.)',
  lateralNotice: 'A animação não representa procedimento clínico validado.',
  heatmapDisclaimer:
    'Este é um modelo demonstrativo simplificado. Uma redução da carga estimada em uma região não significa que o risco de lesão foi clinicamente eliminado.',
  faultNotice: 'Demonstração conceitual — não demonstra segurança clínica.',
  modes: [
    { id: 'static', label: 'Pressão estática' },
    { id: 'alternating', label: 'Pressão alternada' },
    { id: 'lateral', label: 'Reposicionamento lateral' },
    { id: 'fault', label: 'Monitoramento e falhas' },
  ] as const,
}

export const COMPARISON = {
  title: 'Comparação com a tecnologia existente',
  intro:
    'Sistemas hospitalares de pressão alternada já existem, inclusive modelos com assistência à inclinação lateral. O PressuSense Air não afirma superioridade sobre eles: propõe investigar, na mesma categoria, uma arquitetura mais simples, modular e economicamente acessível.',
  category:
    'Como referência de categoria, sistemas híbridos comerciais combinam espuma de alta densidade com câmaras de PU, unidade de controle digital com ajuste por peso, alternância automática, lateralização automática e design célula-sobre-célula.',
  referenceLabel: 'Referência tecnológica da categoria: sistemas de pressão alternada Stiegelmeyer/Novacare',
  referenceUrl: 'https://www.stiegelmeyer.com/br/hospital/colchoes/sistemas-de-pressao-alternada/',
  note: 'Sem preços, imagens ou design industrial de terceiros. A comparação é de categoria, não de produto.',
}

export interface ComparisonRow {
  feature: string
  existing: string
  pressusense: string
  status: Status
}

export const COMPARISON_ROWS: ComparisonRow[] = [
  {
    feature: 'Pressão alternada',
    existing: 'Disponível na categoria comercial',
    pressusense: 'Dois grupos de câmaras (A/B) alternando em ciclo, demonstrados neste simulador com ciclo comprimido.',
    status: 'simulated',
  },
  {
    feature: 'Inclinação lateral assistida',
    existing: 'Disponível na categoria comercial',
    pressusense: 'Grupo lateral de bolsões longitudinais acionado pela mesma bomba, por comandos discretos.',
    status: 'simulated',
  },
  {
    feature: 'Arquitetura modular',
    existing: 'Varia conforme fabricante e modelo',
    pressusense: 'Poucas zonas infláveis independentes e espuma em módulos; possível kit "sobrecolchão + controlador" sobre camas padrão.',
    status: 'proposed',
  },
  {
    feature: 'Possibilidade de manutenção de componentes',
    existing: 'Varia conforme fabricante e modelo',
    pressusense: 'Eletrônica plugável e módulos infláveis intercambiáveis para substituição local.',
    status: 'proposed',
  },
  {
    feature: 'Controle eletrônico simplificado',
    existing: 'Varia conforme fabricante e modelo',
    pressusense: 'Microcontrolador comum (ex.: ESP32) com lógica de modo seguro, modelada neste MVP.',
    status: 'simulated',
  },
  {
    feature: 'Operação local',
    existing: 'Varia conforme fabricante e modelo',
    pressusense: 'Interface off-line com LEDs e sinal sonoro, pensada para hospitais com conectividade limitada.',
    status: 'proposed',
  },
  {
    feature: 'Investigação de menor custo de fabricação',
    existing: 'Não se aplica — direcionamento de pesquisa',
    pressusense: 'Bomba 12 V, válvulas solenoides e microcontrolador de prateleira; o custo real depende de protótipo e orçamento completos.',
    status: 'validation',
  },
  {
    feature: 'Aplicabilidade futura a hospitais e serviços de atenção domiciliar',
    existing: 'Não se aplica — direcionamento de pesquisa',
    pressusense: 'Objetivo de longo prazo, condicionado a validação e autorizações aplicáveis.',
    status: 'validation',
  },
]

export interface RoadmapStep {
  title: string
  description: string
  status: Status
  statusLabel: string
  estimate: string
}

export const ROADMAP = {
  title: 'Roadmap do projeto',
  intro:
    'O que já existe é um MVP digital. Todas as etapas seguintes são planejadas e dependem de validação. Durações são estimativas do time.',
}

export const ROADMAP_STEPS: RoadmapStep[] = [
  {
    title: 'Etapa 1: MVP digital — HackaSanta 2026',
    description: 'Simulação 3D, controle interativo, visualização de funcionamento e modelo econômico exploratório.',
    status: 'simulated',
    statusLabel: 'Em desenvolvimento · MVP digital',
    estimate: 'Durante o evento',
  },
  {
    title: 'Etapa 2: Protótipo de bancada',
    description: 'Construção de um pequeno conjunto pneumático com sensores e cargas artificiais.',
    status: 'proposed',
    statusLabel: 'Planejado',
    estimate: 'Estimativa: 1–2 semanas',
  },
  {
    title: 'Etapa 3: Protótipo de engenharia',
    description: 'Escalonamento estrutural, ensaios mecânicos e análise de falhas.',
    status: 'proposed',
    statusLabel: 'Planejado',
    estimate: 'Estimativa: ~1 mês',
  },
  {
    title: 'Etapa 4: Validação pré-clínica e planejamento regulatório',
    description: 'Avaliação de estabilidade, segurança, higiene, durabilidade e normas aplicáveis.',
    status: 'validation',
    statusLabel: 'Planejado · requer validação física e clínica',
    estimate: 'Estimativa: 2–3 meses',
  },
  {
    title: 'Etapa 5: Estudos clínicos e industrialização',
    description:
      'Avaliação com instituições parceiras, após autorizações aplicáveis, e desenvolvimento da cadeia de produção.',
    status: 'validation',
    statusLabel: 'Planejado · requer validação física e clínica',
    estimate: 'Estimativa: 6–12 meses (estudo piloto)',
  },
]

export const PLANNED_KPIS = [
  'Redistribuição de carga: variação percentual do pico de carga após um ciclo (meta exploratória acima de 30%)',
  'Ângulo lateral efetivo alcançado (meta de 15° a 30°)',
  'Tempo de ciclo alternante',
  'Detecção de falhas: alarme ao perder mais de 20% da pressão em 1 minuto (regra de projeto)',
  'Autonomia em bateria (meta provisória de 1 a 2 horas)',
]

export const PROTOTYPE_BOM = {
  title: 'Estimativa de componentes do protótipo de bancada',
  note: 'Estimativa de componentes para protótipo de bancada; não é preço do produto final, que ainda não foi fabricado nem orçado.',
  items: [
    { item: 'Microcontrolador (ESP32)', qty: '1', cost: 30 },
    { item: 'Bomba de ar DC 12 V', qty: '1', cost: 100 },
    { item: 'Válvulas solenoides', qty: '3', cost: 150 },
    { item: 'Espuma base', qty: '1', cost: 200 },
    { item: 'Capa em PU', qty: '1', cost: 100 },
    { item: 'Eletrônica e cabos', qty: '—', cost: 50 },
  ],
  total: 630,
}

export const REGULATORY = [
  'ANVISA: dispositivo médico (classe a definir), registro conforme RDC 751/2022 — a avaliar',
  'IEC 60601-1 (segurança elétrica) — a avaliar',
  'ISO 14971 (gestão de risco) — a avaliar',
  'ISO 10993 (biocompatibilidade de capa e espuma) — a avaliar',
  'Retardância ao fogo dos materiais — requisito de projeto',
]

export const LIMITATIONS = [
  'Não substitui o reposicionamento manual nem o tratamento clínico: é um complemento ao cuidado da enfermagem.',
  'Não é indicado para todos: pacientes com fratura espinhal instável ou em tração cervical não devem ser lateralizados.',
  'Inflar demais um lado pode gerar cisalhamento; pressão baixa demais deixa o corpo afundar e alta demais cria novos pontos de pressão — daí a necessidade de calibração e modo seguro.',
  'Ruído da bomba e limite de peso (meta de projeto ≈ 200 kg) ainda precisam ser medidos.',
]

export const IMPACT = {
  title: 'Tecnologia de cuidado não deveria depender apenas do orçamento disponível.',
  note: 'O PressuSense Air não tem eficácia clínica demonstrada. Os pontos abaixo descrevem o problema e a direção do projeto, não resultados.',
}

export const IMPACT_POINTS = [
  {
    title: 'Lesões por pressão e mobilidade reduzida',
    text: 'Pacientes acamados ou com mobilidade reduzida permanecem longos períodos na mesma posição, o que os expõe ao risco de lesões por pressão, com sofrimento, complicações e custos assistenciais.',
  },
  {
    title: 'Acesso a tecnologias assistenciais',
    text: 'Superfícies com pressão alternada e inclinação automatizada existem, mas nem todos os serviços conseguem adquiri-las e mantê-las em funcionamento.',
  },
  {
    title: 'A enfermagem no centro do cuidado',
    text: 'Nenhuma superfície substitui o acompanhamento da enfermagem. O conceito é pensado como apoio às rotinas de avaliação e reposicionamento, nunca como substituto.',
  },
  {
    title: 'Manutenção por módulos substituíveis',
    text: 'Câmaras idênticas, engates rápidos e componentes de prateleira podem reduzir o custo de manutenção — hipótese a ser verificada em protótipo.',
  },
  {
    title: 'Hospitais públicos',
    text: 'A arquitetura é estudada pensando em aplicação futura em hospitais públicos e na atenção domiciliar, mediante validação e autorizações aplicáveis.',
  },
]

export const HACKASANTA = {
  title: 'HackaSanta 2026',
  event: 'HackaSanta 2026',
  theme: 'Estratégias para otimização na assistência médica: desafios na jornada do paciente',
  mainTrack: 'Infraestrutura de Saúde',
  relatedTracks: ['Impacto Social', 'Saúde Digital e IA'],
  note: 'Os critérios abaixo descrevem como a proposta pretende atendê-los. Nada aqui indica que a solução já foi validada. O projeto não possui patrocinadores ou parceiros oficiais.',
}

export interface Criterion {
  name: string
  weight: number
  approach: string
  status: Status
}

export const CRITERIA: Criterion[] = [
  {
    name: 'Impacto em Saúde',
    weight: 20,
    approach:
      'Propõe ampliar o acesso a superfícies com redistribuição de pressão em serviços com orçamento restrito, como apoio à enfermagem.',
    status: 'validation',
  },
  {
    name: 'Inovação',
    weight: 20,
    approach:
      'Combina pressão alternada e inclinação lateral assistida com hardware genérico, design modular e segurança passiva célula-sobre-célula, usando uma só bomba.',
    status: 'proposed',
  },
  {
    name: 'Modelo de Negócio',
    weight: 20,
    approach:
      'Explora menor custo de fabricação e manutenção por módulos, com um cenário econômico exploratório e editável.',
    status: 'simulated',
  },
  {
    name: 'Produto',
    weight: 20,
    approach: 'MVP digital com simulador 3D, mapa de carga, monitoramento de falhas e explorador de engenharia.',
    status: 'simulated',
  },
  {
    name: 'Apresentação',
    weight: 20,
    approach:
      'Demo guiada de 3 minutos e transparência sobre o que é simulado, o que é proposto e o que ainda requer validação.',
    status: 'simulated',
  },
]

export const ECONOMY = {
  title: 'Qual o potencial econômico da tecnologia?',
  disclaimer:
    'Este é um cenário matemático exploratório, não uma comprovação de eficácia clínica, de redução de custos ou de retorno financeiro real.',
  priceNote: 'Valores hipotéticos editáveis — não é preço do PressuSense Air, que ainda não foi fabricado nem orçado integralmente.',
}

export const DISCLAIMERS = [
  'PressuSense Air é um conceito em desenvolvimento. Este site é uma simulação digital de engenharia e não é um dispositivo médico validado.',
  'O conceito não tem eficácia clínica demonstrada. Todos os valores são relativos e ilustrativos (u.a.) e não representam medições de pacientes.',
  'As animações não representam procedimento clínico validado nem instruções para movimentação real de pacientes.',
  'O cenário econômico é exploratório e usa valores hipotéticos editáveis.',
  'Nenhum patrocinador ou instituição citada é parceira oficial do PressuSense Air.',
]
