# BlackFrame design system

This is the product-wide visual source of truth. Explicit page overrides in `pages/` extend it. Updated September 2026 using **ui-ux-pro-max** and **design-taste-frontend**.

## Design read

An editorial social app for people who connect through books, films, games, and shared taste. The product should feel personal and easy to explore. Existing brand artwork, route names, social privacy rules, and the culture catalog remain the foundation.

`DESIGN_VARIANCE: 7` · `MOTION_INTENSITY: 3` · `VISUAL_DENSITY: 5`

The ui-ux-pro-max community/social search supported expressive typography, rose, and a clear feature hierarchy. Its additional blue accent and mixed font recommendations were rejected in favor of the established BlackFrame identity. The design-taste audit informed simpler copy, real photography, consistent themes, and fewer decorative containers.

## Foundations

- **Typography:** locally bundled Outfit Variable; system sans fallback. Body 16px with 1.5 line height; secondary app text 14px. Headings 30–40px in the app and responsive display type on the public landing page. User content wraps naturally.
- **Color:** cool neutral canvas and surfaces. Light primary `hsl(345 61% 45%)`, dark primary `hsl(345 72% 70%)`. The actual token definitions in `resources/css/app.css` are authoritative. Destructive actions use semantic error tokens, with separate foreground colors per theme.
- **Shape:** 16px cards/dialogs, 12px controls/navigation, circular identity avatars, 6px small cover artwork. These are semantic roles, not interchangeable decoration.
- **Elevation:** borders and spacing establish hierarchy. Use a light shadow for the movable match card and a scrim for dialogs; avoid shadowed containers elsewhere.
- **Icons:** Lucide, generally 1.6–1.8px strokes. Never add a second icon family.
- **Motion:** short feedback transitions and existing match gestures. Honor reduced motion. No decorative hero animations or scroll dependencies.
- **Layers:** sidebar 10, sticky header 20, mobile bottom navigation 30, Radix overlays and skip link 50. Page content stays in the default stacking context.

## Shared components

- `PageHeading`: consistent title, description, and optional action.
- `FeedComposer`: explicit Photo/Text entry points, with format preserved in the URL.
- `FeedTabs`: Home/Pulse navigation and current-page semantics.
- `PostEngagement`: likes, paginated comments, writing, confirmation before deletion, network/validation feedback.
- `PasswordInput`: accessible reveal control and password-manager support.
- `SubjectGroupSection`: medium headings (films & TV, books & comics, games, characters & franchises) shared by the shelf and profile shelf. Grouping mirrors `ShelfStatus::labelFor`, and `resources/js/lib/subject-groups.ts` is the only place a subject type is assigned to a medium.
- `ConnectionStatus` and `AppErrorBoundary`: useful feedback when the connection or rendering fails.

## Layout

- Persistent collapsible desktop sidebar; usable navigation drawer on mobile, including Geek Shelf and Matches.
- Header search opens the real people directory. Account and theme controls stay in predictable places.
- Home: 640px content column and optional 280px context rail. Photo lightboxes show the uncropped original; carousel controls have explicit labels.
- Pulse: the same navigation and composer, with a readable text measure and shared comment behavior.
- Shelf: collection first, grouped by medium with per-section counts, then search/sort/status filters, collapsed editors, and an Add title dialog. Keep in-progress edits visibly marked.
- Discover: search and relationship filters above people cards; real shared-title context and processing/error feedback.
- Profiles: clear identity, consistent tabs, shared taste grouped by medium, and the same visual/text post components.
- Settings: responsive navigation and a single focused settings surface, with a valid main landmark.
- Public pages: split hero with original photography, one primary action label per intent, and coherent light/dark presentation. Authentication continues the same visual identity.

## Languages

- Interface languages are English and Portuguese (Brazil). English is the source: its strings are the translation keys, so anything not yet translated still reads as English instead of showing a raw key.
- Catalogs live in `lang/{locale}.json` for interface copy and `lang/{locale}/*.php` for Laravel's own messages. Only the active catalog is sent to the browser, and the medium, status and type vocabulary must match `SubjectType` and `ShelfStatus` in every language.
- A visitor's choice is kept in the session and a `locale` cookie, and first-time visitors are matched against their browser's language. `settings/language` and the header switcher both write the same preference.
- Dates, relative times, numbers and server-rendered labels follow the active locale: Carbon carries the locale for relative dates, absolute dates use `translatedFormat`, and `Intl` formatting receives the locale instead of the browser default.
- Copy rules apply to every language: no em-dashes, sentence case, and the same friendly register.

## Accessibility and state

Use semantic links and buttons; retain browser keyboard order and visible focus. Controls have at least 44px touch targets. All meaningful images need truthful alt text. Reserve media space and lazy-load below the first post. Input errors must be associated with fields. Dialogs have a title, description, close control, and focus containment. Fixed navigation reserves bottom padding and safe areas.

Theme selection supports system preference, persistence, multiple mounted controls, and other tabs. Storage failures must not crash the UI. Do not access browser globals at module load or during server rendering.

Every feature defines loading, empty, error, success, and disabled behavior. No decorative controls implying future functionality.

## Product boundaries

Laravel owns authorization, validation, and persistence. Private content requires permission. Drafts and future-dated posts stay hidden. Deleted authors/commenters must not break timelines. Only comment authors and post owners may delete a comment. Owners may delete their own posts, and deleting a post removes its stored media.

Matching uses structured shared shelf data, never demographics or popularity. Direct opens only after mutual Connect decisions, and only participants can read or write. See page overrides for the scoring and messaging contracts.

## Review matrix

375px, 768px, 1024px, 1440px; light/dark; English and Portuguese; keyboard-only navigation; reduced motion; unavailable media; loading and empty states. Recheck affected flows after changing a shared component.
