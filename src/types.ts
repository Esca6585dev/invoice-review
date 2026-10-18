// [x1, y1, x2, y2] in document coordinates (PDF points or image pixels)
export type BBox = [number, number, number, number]

export type FieldStatus = 'pending' | 'approved' | 'edited'

export interface ExtractedField {
  id: string
  field: string
  value: string
  page: number
  bbox: BBox
  status: FieldStatus
  source: 'auto' | 'manual'
}

export interface ChangeLogEntry {
  id: string
  fieldId: string
  fieldName: string
  action: 'edit' | 'approve' | 'add'
  oldValue: string | null
  newValue: string
  at: Date
}

export interface PageSize {
  width: number
  height: number
}
