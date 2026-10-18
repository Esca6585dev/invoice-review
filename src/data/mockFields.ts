import type { ExtractedField } from '../types'

// Mock output of the extraction API. In the real product this would come from
// a GET /documents/:id/fields call after OCR finishes.
const raw = [
  { field: 'invoicenumber', value: 'INV-2041', page: 1, bbox: [120, 80, 260, 100] },
  { field: 'date', value: '2026-09-14', page: 1, bbox: [400, 80, 520, 100] },
  { field: 'totalamount', value: '48,250.00', page: 1, bbox: [400, 620, 520, 645] },
] as const

export function loadMockFields(): ExtractedField[] {
  return raw.map((f, i) => ({
    id: `f${i + 1}`,
    field: f.field,
    value: f.value,
    page: f.page,
    bbox: [...f.bbox],
    status: 'pending',
    source: 'auto',
  }))
}
