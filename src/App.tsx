import { useCallback, useState } from 'react'
import UploadZone from './components/UploadZone'
import DocumentViewer from './components/DocumentViewer'
import FieldPanel from './components/FieldPanel'
import ChangeLog from './components/ChangeLog'
import NewFieldDialog from './components/NewFieldDialog'
import { loadMockFields } from './data/mockFields'
import { uid } from './lib/format'
import type { BBox, ChangeLogEntry, ExtractedField } from './types'

export default function App() {
  const [file, setFile] = useState<File | null>(null)
  const [fields, setFields] = useState<ExtractedField[]>([])
  const [log, setLog] = useState<ChangeLogEntry[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [drawMode, setDrawMode] = useState(false)
  const [pendingBox, setPendingBox] = useState<{ bbox: BBox; page: number } | null>(null)

  function handleFile(f: File) {
    setFile(f)
    setFields(loadMockFields())
    setLog([])
    setSelectedId(null)
    setDrawMode(false)
  }

  function reset() {
    setFile(null)
    setFields([])
    setLog([])
    setSelectedId(null)
    setDrawMode(false)
    setPendingBox(null)
  }

  function record(entry: Omit<ChangeLogEntry, 'id' | 'at'>) {
    setLog((prev) => [...prev, { ...entry, id: uid('log'), at: new Date() }])
  }

  function approve(id: string) {
    const f = fields.find((x) => x.id === id)
    if (!f || f.status === 'approved') return
    setFields((prev) => prev.map((x) => (x.id === id ? { ...x, status: 'approved' } : x)))
    record({ fieldId: id, fieldName: f.field, action: 'approve', oldValue: null, newValue: f.value })
  }

  function edit(id: string, value: string) {
    const f = fields.find((x) => x.id === id)
    if (!f || f.value === value) return
    setFields((prev) => prev.map((x) => (x.id === id ? { ...x, value, status: 'edited' } : x)))
    record({ fieldId: id, fieldName: f.field, action: 'edit', oldValue: f.value, newValue: value })
  }

  function addField(name: string, value: string) {
    if (!pendingBox) return
    const f: ExtractedField = {
      id: uid('f'),
      field: name,
      value,
      page: pendingBox.page,
      bbox: pendingBox.bbox,
      status: 'edited',
      source: 'manual',
    }
    setFields((prev) => [...prev, f])
    record({ fieldId: f.id, fieldName: name, action: 'add', oldValue: null, newValue: value })
    setPendingBox(null)
    setDrawMode(false)
    setSelectedId(f.id)
  }

  const cancelNewField = useCallback(() => setPendingBox(null), [])

  if (!file) {
    return (
      <div className="flex h-full flex-col">
        <Header />
        <UploadZone onFile={handleFile} />
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <Header>
        <button
          onClick={() => setDrawMode((v) => !v)}
          className={[
            'rounded-md px-3 py-1.5 text-sm font-medium transition',
            drawMode
              ? 'bg-amber-500 text-white hover:bg-amber-600'
              : 'border border-zinc-300 text-zinc-700 hover:bg-zinc-100',
          ].join(' ')}
        >
          {drawMode ? 'Cancel drawing' : '+ Add field by drawing'}
        </button>
        <button
          onClick={reset}
          className="rounded-md px-3 py-1.5 text-sm text-zinc-600 hover:bg-zinc-100"
        >
          New document
        </button>
      </Header>

      <div className="flex min-h-0 flex-1">
        <main className="min-w-0 flex-1">
          <DocumentViewer
            file={file}
            fields={fields}
            selectedId={selectedId}
            drawMode={drawMode}
            onSelect={setSelectedId}
            onDrawBox={(bbox, page) => setPendingBox({ bbox, page })}
          />
        </main>
        <aside className="flex w-96 shrink-0 flex-col divide-y divide-zinc-200 overflow-y-auto border-l border-zinc-200 bg-white">
          <FieldPanel
            fields={fields}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onApprove={approve}
            onEdit={edit}
          />
          <ChangeLog entries={log} />
        </aside>
      </div>

      {pendingBox && (
        <NewFieldDialog
          bbox={pendingBox.bbox}
          page={pendingBox.page}
          onSubmit={addField}
          onCancel={cancelNewField}
        />
      )}
    </div>
  )
}

function Header({ children }: { children?: React.ReactNode }) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-zinc-200 bg-white px-4">
      <div className="flex items-center gap-2">
        <div className="h-6 w-6 rounded bg-zinc-900" />
        <span className="font-semibold">Invoice Review</span>
      </div>
      <div className="flex items-center gap-2">{children}</div>
    </header>
  )
}
