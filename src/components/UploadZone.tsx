import { useRef, useState, type DragEvent, type ChangeEvent } from 'react'

const ACCEPTED = ['application/pdf', 'image/png', 'image/jpeg', 'image/webp']
const MAX_MB = 20

interface Props {
  onFile: (file: File) => void
}

export default function UploadZone({ onFile }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loadingSample, setLoadingSample] = useState(false)

  function accept(file: File | undefined) {
    if (!file) return
    if (!ACCEPTED.includes(file.type)) {
      setError('Only PDF, PNG, JPG or WEBP files are supported.')
      return
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      setError(`File is too large. Max ${MAX_MB} MB.`)
      return
    }
    setError(null)
    onFile(file)
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setDragging(false)
    accept(e.dataTransfer.files[0])
  }

  function onChange(e: ChangeEvent<HTMLInputElement>) {
    accept(e.target.files?.[0])
    e.target.value = ''
  }

  return (
    <div className="flex h-full items-center justify-center p-6">
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={[
          'w-full max-w-xl cursor-pointer rounded-2xl border-2 border-dashed p-12 text-center transition',
          dragging
            ? 'border-emerald-500 bg-emerald-50'
            : 'border-zinc-300 bg-white hover:border-zinc-400',
        ].join(' ')}
      >
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-zinc-500">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 16V4m0 0l-4 4m4-4l4 4" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M4 16v3a1 1 0 001 1h14a1 1 0 001-1v-3" strokeLinecap="round" />
          </svg>
        </div>
        <p className="text-base font-medium">Drop an invoice here, or click to browse</p>
        <p className="mt-1 text-sm text-zinc-500">PDF, PNG, JPG or WEBP up to {MAX_MB} MB</p>
        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
        <button
          type="button"
          onClick={async (e) => {
            e.stopPropagation()
            setLoadingSample(true)
            try {
              const res = await fetch('/sample-invoice.pdf')
              const blob = await res.blob()
              onFile(new File([blob], 'sample-invoice.pdf', { type: 'application/pdf' }))
            } catch {
              setError('Could not load the sample. Please upload your own file.')
            } finally {
              setLoadingSample(false)
            }
          }}
          className="mt-6 text-sm font-medium text-emerald-700 underline-offset-2 hover:underline"
        >
          {loadingSample ? 'Loading…' : 'or try the sample invoice'}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED.join(',')}
          className="hidden"
          onChange={onChange}
        />
      </div>
    </div>
  )
}
