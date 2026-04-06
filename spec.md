# Granite

## Current State
New project. Only scaffolded Motoko actor and empty frontend exist.

## Requested Changes (Diff)

### Add
- Password-protected sign-in screen (hardcoded password: "GRANITE")
- Full MS Paint-style drawing canvas with:
  - Freehand pencil/brush tool with adjustable size
  - Eraser tool
  - Shape tools: rectangle, circle, line
  - Paint bucket (fill tool)
  - Color picker with full palette (30+ colors + custom color input)
  - Undo / Redo (unlimited history)
  - Clear canvas button
  - Save drawing as PNG download
  - New canvas button
  - Zoom in/out controls
  - Grid toggle overlay
  - Canvas size selector
- Top toolbar: file operations (New, Save/Download, Open image)
- Left sidebar: tool selector icons
- Bottom status bar: cursor coordinates, canvas size, zoom level
- Account section panel/page:
  - Display username (stored in backend)
  - Drawing history (list of saved drawing names with timestamps)
  - Stats: total drawings created, time spent drawing
  - Ability to rename account / change display name
  - Logout button
- Dark stone/granite themed UI matching design preview
- Persistent saved drawings (stored in backend as metadata)

### Modify
- Backend actor to support user accounts and drawing metadata storage

### Remove
- Nothing (new project)

## Implementation Plan
1. Backend: user login (password check), save drawing metadata (name, timestamp), list drawings, update username, get account stats
2. Frontend sign-in screen with password field (password = "GRANITE")
3. Main drawing app layout: top toolbar, left tool sidebar, center canvas, right/bottom panels
4. HTML5 Canvas drawing engine with all tools (pencil, eraser, shapes, fill)
5. Color palette panel
6. Undo/redo stack
7. Account section modal/page
8. Dark granite stone aesthetic UI
