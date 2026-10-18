import { useEffect, useRef, useState, type FormEvent } from 'react'
import type { BBox } from '../types'

interface Props {
  bbox: BBox
  page: number
  onSubmit: (name: string, value: string) => void
  onCancel: () => void
}

export default function NewFieldDialog({ bbox, page, onSubmit, onCancel }: Props) {
  const [name, setName] = useState('')
  const [value, setValue] = useState('')
  const nameRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    nameRef.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onCancel()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onCancel])

  function submit(e: FormEvent) {
    e.preventDefault()
    if (!name.trim() || !value.trim()) return
    onSubmit(name.trim().toLowerCase().replace(/\s+/g, ''), value.trim())
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
      onClick={onCancel}
    >
      <form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-xl bg-white p-5 shadow-xl"
      >
        <h3 className="text-base font-semibold">Add field manually</h3>
        <p className="mt-1 text-xs text-zinc-500">
          Page {page} · box [{bbox.join(', ')}]
        </p>

        <label className="mt-4 block text-xs font-medium text-zinc-600">
          Field name
          <input
            ref={nameRef}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. vendor name"
            className="mt-1 w-full rounded border border-zinc-300 px-2 py-1.5 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
          />
        </label>
        <label className="mt-3 block text-xs font-medium text-zinc-600">
          Value
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="What does the box contain?"
            className="mt-1 w-full rounded border border-zinc-300 px-2 py-1.5 font-mono text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
          />
        </label>

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded px-3 py-1.5 text-sm text-zinc-600 hover:bg-zinc-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!name.trim() || !value.trim()}
            className="rounded bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-40"
          >
            Add field
          </button>
        </div>
      </form>
    </div>
  )
}
