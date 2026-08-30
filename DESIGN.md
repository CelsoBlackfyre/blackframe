# BlackFrame UI Contract

`design-system/blackframe/MASTER.md` is the full source of truth. This short file is the working checklist for everyday implementation.

## Direction

BlackFrame is a culture-aware social network with editorial typography, calm neutral surfaces, and one deep-rose accent. It should feel expressive, tactile, and social without imitating Instagram or a generic dating application.

Use these dials unless a page override says otherwise:

- `DESIGN_VARIANCE: 7`
- `MOTION_INTENSITY: 5`
- `VISUAL_DENSITY: 6`

## Build rules

- Use Tailwind 4 semantic tokens from `resources/css/app.css`.
- Use existing Radix/shadcn primitives and customize them to BlackFrame's radius and color rules.
- Use Lucide only. Standard stroke width is 1.8.
- Keep the supplied logo artwork in its original black/metallic treatment. Place compact marks and the complete authentication lockup on the semantic primary rose surface; use the rose-backed `blackframe_favicon.png` for browser icons.
- Keep touch actions at least 44px high and 8px apart.
- Use Inertia `Link` for internal navigation and preserve scroll for feed actions.
- Reserve media dimensions, lazy-load below the first post, and write useful alt text.
- Support light/dark mode and reduced motion in the first implementation.
- Provide loading, empty, error, and disabled states before considering a feature complete.
- Never expose an inactive navigation item or decorative control for a future phase.

## Current surfaces

- Welcome: cinematic two-line hero, original editorial photography, horizontal product chapters, dense 12-column storytelling, and direct account actions.
- Feed: persistent desktop navigation, mobile bottom navigation, 640px media column, optional discovery rail.
- People: URL-addressable Discover, Followers, and Following views with a debounced search field, relationship-aware controls, responsive cards, pagination, and explicit empty/error/loading states.
- Pulse: compact conversation cards, shared engagement behavior, and a readable single-column text measure.
- Create: one responsive composer with explicit Photo/Text formats, optional topic selection, stable media/topic preview, inline errors, upload progress, and a single Publish action.
- Geek Shelf: responsive summary metrics, editable collection cards, wrapping status filters, and a modal catalog picker with debounced search, source attribution, loading/error/empty states, and a progressively disclosed missing-title request.
- Shelf Match: swipe-capable profile stack, explicit Pass and Connect controls, transparent shelf-score rail, practical Undo, mutual Connections view, and shelf-aware empty states.
- Authentication/settings: starter-kit flows restyled through shared tokens, visible labels, inline errors, and autofill support.

## Review sizes

Test at 375px, 768px, 1024px, and 1440px. Also test keyboard-only navigation, reduced motion, dark mode, and a slow image connection.
