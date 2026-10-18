import { useEffect, useMemo, useRef, useState, type MouseEvent } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import type { BBox, ExtractedField, PageSize } from '../types'

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString()

interface Props {
  file: File
  fields: ExtractedField[]
  selectedId: string | null
  drawMode: boolean
  onSelect: (id: string) => void
  onDrawBox: (bbox: BBox, page: number) => void
}

export default function DocumentViewer({
  file,
  fields,
  selectedId,
  drawMode,
  onSelect,
  onDrawBox,
}: Props) {
  const isPdf = file.type === 'application/pdf'
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState(0)
  const [pageSize, setPageSize] = useState<PageSize | null>(null)
  const [numPages, setNumPages] = useState(1)
  const [currentPage, setCurrentPage] = useState(1)
  const [loadError, setLoadError] = useState<string | null>(null)

  const fileUrl = useMemo(() => URL.createObjectURL(file), [file])
  useEffect(() => () => URL.revokeObjectURL(fileUrl), [fileUrl])

  // reset when a new file comes in
  useEffect(() => {
    setPageSize(null)
    setCurrentPage(1)
    setLoadError(null)
  }, [file])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      setContainerWidth(entry.contentRect.width)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const renderWidth = Math.max(0, Math.min(containerWidth - 48, 900))
  const scale = pageSize ? renderWidth / pageSize.width : 1
  const renderHeight = pageSize ? pageSize.height * scale : 0

  // ---- drawing a new box ----
  const [drawStart, setDrawStart] = useState<{ x: number; y: number } | null>(null)
  const [drawCurrent, setDrawCurrent] = useState<{ x: number; y: number } | null>(null)
  const overlayRef = useRef<HTMLDivElement>(null)

  function pointFromEvent(e: MouseEvent) {
    const rect = overlayRef.current!.getBoundingClientRect()
    return {
      x: Math.min(Math.max(e.clientX - rect.left, 0), rect.width),
      y: Math.min(Math.max(e.clientY - rect.top, 0), rect.height),
    }
  }

  function onMouseDown(e: MouseEvent) {
    if (!drawMode) return
    e.preventDefault()
    const p = pointFromEvent(e)
    setDrawStart(p)
    setDrawCurrent(p)
  }

  function onMouseMove(e: MouseEvent) {
    if (!drawMode || !drawStart) return
    setDrawCurrent(pointFromEvent(e))
  }

  function onMouseUp() {
    if (!drawMode || !drawStart || !drawCurrent) return
    const x1 = Math.min(drawStart.x, drawCurrent.x) / scale
    const y1 = Math.min(drawStart.y, drawCurrent.y) / scale
    const x2 = Math.max(drawStart.x, drawCurrent.x) / scale
    const y2 = Math.max(drawStart.y, drawCurrent.y) / scale
    setDrawStart(null)
    setDrawCurrent(null)
    // ignore accidental clicks
    if (x2 - x1 < 4 || y2 - y1 < 4) return
    onDrawBox([Math.round(x1), Math.round(y1), Math.round(x2), Math.round(y2)], currentPage)
  }

  const draft =
    drawStart && drawCurrent
      ? {
          left: Math.min(drawStart.x, drawCurrent.x),
          top: Math.min(drawStart.y, drawCurrent.y),
          width: Math.abs(drawCurrent.x - drawStart.x),
          height: Math.abs(drawCurrent.y - drawStart.y),
        }
      : null

  const visibleFields = fields.filter((f) => f.page === currentPage)

  return (
    <div ref={containerRef} className="flex h-full flex-col overflow-auto bg-zinc-200/60">
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-200 bg-white/90 px-4 py-2 text-sm backdrop-blur">
        <span className="truncate font-medium text-zinc-700">{file.name}</span>
        <div className="flex items-center gap-3">
          {drawMode && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
              Draw a box on the document
            </span>
          )}
          {isPdf && numPages > 1 && (
            <div className="flex items-center gap-1 text-zinc-600">
              <button
                className="rounded px-2 py-0.5 hover:bg-zinc-100 disabled:opacity-40"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                ‹
              </button>
              <span>
                {currentPage} / {numPages}
              </span>
              <button
                className="rounded px-2 py-0.5 hover:bg-zinc-100 disabled:opacity-40"
                disabled={currentPage >= numPages}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                ›
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-1 justify-center p-6">
        {loadError ? (
          <p className="self-center text-sm text-red-600">{loadError}</p>
        ) : (
          <div
            className="relative shadow-lg"
            style={{ width: renderWidth, height: renderHeight || undefined }}
          >
            {isPdf ? (
              <Document
                file={fileUrl}
                onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                onLoadError={() => setLoadError('Could not read this PDF.')}
                loading={<div className="p-8 text-sm text-zinc-500">Loading PDF…</div>}
              >
                <Page
                  pageNumber={currentPage}
                  width={renderWidth}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                  onLoadSuccess={(page) =>
                    setPageSize({ width: page.originalWidth, height: page.originalHeight })
                  }
                />
              </Document>
            ) : (
              <img
                src={fileUrl}
                alt={file.name}
                className="block select-none"
                style={{ width: renderWidth }}
                draggable={false}
                onLoad={(e) => {
                  const img = e.currentTarget
                  setPageSize({ width: img.naturalWidth, height: img.naturalHeight })
                }}
                onError={() => setLoadError('Could not read this image.')}
              />
            )}

            {pageSize && (
              <div
                ref={overlayRef}
                className={['absolute inset-0', drawMode ? 'cursor-crosshair' : ''].join(' ')}
                onMouseDown={onMouseDown}
                onMouseMove={onMouseMove}
                onMouseUp={onMouseUp}
                onMouseLeave={onMouseUp}
              >
                {visibleFields.map((f) => (
                  <HighlightBox
                    key={f.id}
                    field={f}
                    scale={scale}
                    selected={f.id === selectedId}
                    interactive={!drawMode}
                    onClick={() => onSelect(f.id)}
                  />
                ))}
                {draft && (
                  <div
                    className="pointer-events-none absolute border-2 border-dashed border-amber-500 bg-amber-300/20"
                    style={draft}
                  />
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function HighlightBox({
  field,
  scale,
  selected,
  interactive,
  onClick,
}: {
  field: ExtractedField
  scale: number
  selected: boolean
  interactive: boolean
  onClick: () => void
}) {
  const [x1, y1, x2, y2] = field.bbox
  const color =
    field.status === 'approved'
      ? 'border-emerald-500 bg-emerald-400/15'
      : field.status === 'edited'
        ? 'border-sky-500 bg-sky-400/15'
        : 'border-amber-500 bg-amber-400/15'
  return (
    <button
      type="button"
      title={field.field}
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      className={[
        'absolute rounded-sm border-2 transition',
        color,
        selected ? 'ring-4 ring-amber-300/70 z-10' : 'opacity-70 hover:opacity-100',
        interactive ? '' : 'pointer-events-none',
      ].join(' ')}
      style={{
        left: x1 * scale,
        top: y1 * scale,
        width: (x2 - x1) * scale,
        height: (y2 - y1) * scale,
      }}
    />
  )
}
