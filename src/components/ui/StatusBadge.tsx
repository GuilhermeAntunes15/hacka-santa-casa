import { STATUS_LABELS } from '../../lib/content'
import type { Status } from '../../lib/content'

const TONE: Record<Status, { text: string; dot: string }> = {
  simulated: { text: 'border-ok/40 text-ok', dot: 'bg-ok' },
  proposed: { text: 'border-tech/40 text-[#7AA7F8]', dot: 'bg-tech' },
  validation: { text: 'border-warn/35 text-warn', dot: 'border border-warn bg-transparent' },
}

export default function StatusBadge({ status, label }: { status: Status; label?: string }) {
  const t = TONE[status]
  return (
    <span
      data-status={status}
      className={`inline-flex items-center gap-1.5 rounded-[4px] border px-2 py-0.5 font-mono text-[10.5px] leading-[1.35] tracking-wide w-fit max-w-full ${t.text}`}
    >
      <span aria-hidden className={`size-1.5 shrink-0 rounded-[1px] ${t.dot}`} />
      {label ?? STATUS_LABELS[status]}
    </span>
  )
}

export function StatusLegend() {
  return (
    <ul className="flex flex-wrap items-center gap-x-3 gap-y-2" aria-label="Legenda de status">
      <li className="label-mono mr-1">Legenda</li>
      {(Object.keys(STATUS_LABELS) as Status[]).map((s) => (
        <li key={s}>
          <StatusBadge status={s} />
        </li>
      ))}
    </ul>
  )
}
