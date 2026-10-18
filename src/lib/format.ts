export function labelFor(field: string): string {
  const known: Record<string, string> = {
    invoicenumber: 'Invoice number',
    date: 'Date',
    totalamount: 'Total amount',
  }
  if (known[field]) return known[field]
  // "vendor_name" / "vendorName" -> "Vendor name"
  const spaced = field.replace(/[_-]+/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2')
  return spaced.charAt(0).toUpperCase() + spaced.slice(1).toLowerCase()
}

export function formatTime(d: Date): string {
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

export function formatDateTime(d: Date): string {
  return d.toLocaleString([], {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

let counter = 0
export function uid(prefix = 'id'): string {
  counter += 1
  return `${prefix}-${Date.now().toString(36)}-${counter}`
}
