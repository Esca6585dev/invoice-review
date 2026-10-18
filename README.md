# Invoice Review

A small document review tool: upload an invoice (PDF or image), see the fields an
extraction step pulled out of it, jump to the exact spot on the page each value
came from, and approve or correct every value with a full audit trail.

**Live demo:** _add your Vercel link here_

## What it does

- Drag-and-drop upload for PDF, PNG, JPG and WEBP (with type and size validation)
- Renders the document with `react-pdf` (multi-page PDFs supported) or as a plain image
- Loads a mock set of extracted fields with page + bounding box coordinates
- Side panel lists the fields; clicking one highlights its box on the page,
  clicking a box on the page selects the field
- Each value can be **approved** or **edited** inline (Enter to save, Esc to cancel)
- Every change is written to a **change log** with old value, new value and timestamp
- Bonus: **Add field by drawing** — draw a box directly on the document and enter
  a name and value for it. Manual fields are marked as such and also logged.

## Coordinates

Bounding boxes are stored in document space (`[x1, y1, x2, y2]`, origin top-left,
PDF points for PDFs, natural pixels for images). The viewer computes a single
`scale = renderedWidth / pageWidth` and applies it to the overlay, so boxes stay
aligned on any screen size or zoom level, and boxes drawn by the user are
converted back to document space before they're saved. That keeps the data
independent of how it happens to be displayed.

## Stack

React 19 · TypeScript · Vite · Tailwind CSS v4 · react-pdf (pdf.js)

## Run locally

```bash
npm install
npm run dev
```

`npm run build` produces a static site in `dist/` that deploys as-is to Vercel or Netlify.

## Structure

```
src/
  App.tsx                     state: file, fields, change log, draw mode
  components/
    UploadZone.tsx            drag & drop + validation
    DocumentViewer.tsx        PDF/image rendering, highlight overlay, box drawing
    FieldPanel.tsx            field list, approve / inline edit
    ChangeLog.tsx             audit trail
    NewFieldDialog.tsx        name + value for a manually drawn box
  data/mockFields.ts          mock extraction API response
  lib/format.ts               labels, time formatting, ids
  types.ts
```

## What I'd do next

- Persist fields and the change log to an API (optimistic updates, retry on failure)
- Text-layer hit testing so a drawn box snaps to the words underneath it
- Keyboard navigation through fields (↑/↓, A to approve, E to edit)
- Tests for the coordinate math and the reducer-style state updates (Vitest)
