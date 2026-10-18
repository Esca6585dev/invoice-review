import { useEffect, useRef, useState } from 'react'
import type { ExtractedField } from '../types'
import { labelFor } from '../lib/format'

interface Props {
  fields: ExtractedField[]
  selectedId: string | null
  onSelect: (id: string) => void
  onApprove: (id: string) => void
  onEdit: (id: string, value: string) => void
}

export default function FieldPanel({ fields, selectedId, onSelect, onApprove, onEdit }: Props) {
  const approved = fields.filter((f) => f.status !== 'pending').length

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between px-4 py-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
          Extracted fields
        </h2>
        <span className="text-xs text-zinc-500">
          {approved}/{fields.length} reviewed
        </span>
      </div>
      <ul className="divide-y divide-zinc-100">
        {fields.map((f) => (
          <FieldRow
            key={f.id}
            field={f}
            selected={f.id === selectedId}
            onSelect={() => onSelect(f.id)}
            onApprove={() => onApprove(f.id)}
            onEdit={(v) => onEdit(f.id, v)}
          />
        ))}
      </ul>
    </div>
  )
}

function FieldRow({
  field,
  selected,
  onSelect,
  onApprove,
  onEdit,
}: {
  field: ExtractedField
  selected: boolean
  onSelect: () => void
  onApprove: () => void
  onEdit: (value: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(field.value)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing) inputRef.current?.select()
  }, [editing])

  function startEdit() {
    setDraft(field.value)
    setEditing(true)
    onSelect()
  }

  function commit() {
    const next = draft.trim()
    setEditing(false)
    if (next && next !== field.value) onEdit(next)
  }

  return (
    <li
      onClick={onSelect}
      className={[
        'cursor-pointer px-4 py-3 transition',
        selected ? 'bg-amber-50' : 'hover:bg-zinc-50',
      ].join(' ')}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-zinc-500">{labelFor(field.field)}</span>
            <StatusBadge status={field.status} />
            {field.source === 'manual' && (
              <span className="text-[10px] uppercase tracking-wide text-zinc-400">manual</span>
            )}
          </div>

          {editing ? (
            <input
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commit()
                if (e.key === 'Escape') setEditing(false)
              }}
              onBlur={commit}
              className="mt-1 w-full rounded border border-sky-400 px-2 py-1 font-mono text-sm outline-none ring-2 ring-sky-200"
            />
          ) : (
            <p className="mt-0.5 truncate font-mono text-sm">{field.value}</p>
          )}

          <p className="mt-1 text-[11px] text-zinc-400">
            p.{field.page} · [{field.bbox.join(', ')}]
          </p>
        </div>

        {!editing && (
          <div className="flex shrink-0 gap-1" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={startEdit}
              className="rounded border border-zinc-200 px-2 py-1 text-xs text-zinc-600 hover:bg-zinc-100"
            >
              Edit
            </button>
            <button
              onClick={onApprove}
              disabled={field.status === 'approved'}
              className="rounded bg-emerald-600 px-2 py-1 text-xs font-medium text-white hover:bg-emerald-700 disabled:cursor-default disabled:bg-emerald-200"
            >
              {field.status === 'approved' ? 'Approved' : 'Approve'}
            </button>
          </div>
        )}
      </div>
    </li>
  )
}

function StatusBadge({ status }: { status: ExtractedField['status'] }) {
  const map = {
    pending: 'bg-amber-100 text-amber-800',
    approved: 'bg-emerald-100 text-emerald-800',
    edited: 'bg-sky-100 text-sky-800',
  }
  return (
    <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${map[status]}`}>
      {status}
    </span>
  )
}
