import type { ChangeLogEntry } from '../types'
import { formatDateTime, labelFor } from '../lib/format'

interface Props {
  entries: ChangeLogEntry[]
}

export default function ChangeLog({ entries }: Props) {
  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between px-4 py-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Change log</h2>
        <span className="text-xs text-zinc-500">{entries.length}</span>
      </div>
      {entries.length === 0 ? (
        <p className="px-4 pb-4 text-sm text-zinc-400">No changes yet.</p>
      ) : (
        <ol className="divide-y divide-zinc-100">
          {[...entries].reverse().map((e) => (
            <li key={e.id} className="px-4 py-2.5 text-sm">
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium">
                  <ActionWord action={e.action} /> {labelFor(e.fieldName)}
                </span>
                <time className="shrink-0 text-[11px] text-zinc-400" dateTime={e.at.toISOString()}>
                  {formatDateTime(e.at)}
                </time>
              </div>
              {e.action === 'edit' && (
                <p className="mt-0.5 font-mono text-xs">
                  <span className="text-red-600 line-through">{e.oldValue}</span>
                  <span className="mx-1 text-zinc-400">→</span>
                  <span className="text-emerald-700">{e.newValue}</span>
                </p>
              )}
              {e.action === 'add' && (
                <p className="mt-0.5 font-mono text-xs text-emerald-700">{e.newValue}</p>
              )}
              {e.action === 'approve' && (
                <p className="mt-0.5 font-mono text-xs text-zinc-500">{e.newValue}</p>
              )}
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}

function ActionWord({ action }: { action: ChangeLogEntry['action'] }) {
  const map = {
    edit: ['Edited', 'text-sky-700'],
    approve: ['Approved', 'text-emerald-700'],
    add: ['Added', 'text-violet-700'],
  } as const
  const [word, cls] = map[action]
  return <span className={cls}>{word}</span>
}
