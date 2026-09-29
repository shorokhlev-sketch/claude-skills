# Figma MCP: gotchas

Notes from driving Figma through the MCP connector (`use_figma`, `upload_assets`, `create_new_file`) on real projects. Verified on a Pro plan with a Full seat.

## Limits

- The Starter plan cut the session off after about 40 tool calls ("You've reached the Figma MCP tool call limit on the Starter plan"). The reset period was not documented. On a paid plan with a Full seat the limit did not appear.
- Save calls: validate on one item, then run the rest in one script. Move bulk geometry as SVG, not as code.

## Geometry

- `upload_assets` with an SVG turns every shape (line, rect, ellipse, arc) into a VECTOR node. A PNG with `nodeIds` becomes an image fill on an existing rectangle.
- Layer name = file name. Cyrillic file names uploaded with `curl -F` arrive garbled; match layers by a numeric suffix instead.
- Real LINE nodes (stroke as thickness, extends past the ends), ELLIPSE with `arcData` and RECTANGLE only come from `use_figma`: `createLine()`, `resize(len, 0)`, `rotation = -atan2(dy, dx)` in degrees, `x`/`y` = start point.
- You can ship data into Figma inside a layer name (the SVG `id` attribute). A 6 KB JSON string arrives intact; the script reads `node.name` and parses it.
- Nodes with flipped transforms report `x`/`y` as the pivot point, not the top-left corner.
- When cloning nodes between frames or pages, check `absoluteBoundingBox` after the clone. Clones from a hidden cleanup layer went missing without an error.

## Text and fonts

- A local font can appear in `listAvailableFontsAsync()` and still not render in Figma; the text disappears. Inter is the safe default ("Semi Bold" with a space).
- Text with `layoutSizingHorizontal = FILL` and `textAutoResize = WIDTH_AND_HEIGHT` collapses to width 0 (letters stacked in a column). Fix: `textAutoResize = 'HEIGHT'`, then FIXED, then FILL again. When creating: `appendChild`, then `textAutoResize = 'HEIGHT'`, then FILL.

## Layout and components

- `appendChild` into an instance is not allowed. Build variations as separate frames.
- A vertical auto-layout frame stays FIXED in height after `resize()`. Set `primaryAxisSizingMode = 'AUTO'`.
- Opacity through `{...boundPaint, opacity}` did not apply to a fill bound to a variable. Use an unbound color for tints.

## Reliability

- A script that throws is rolled back completely; no partial nodes remain. That makes small scripts safe to retry.
- Long scripts (over about 60 s) drop the connection. Split them.
- Run `use_figma` calls one at a time. Parallel calls broke the connection.

## Speed reference

A palette board with 2 desktop frames, 4 phone frames, 5 components and color tokens took about 6 minutes and about 10 calls. The same board as HTML by an agent took about 10 minutes.
