# BlackFrame overhaul — September 2026

The project now has a consistent interface across its public website, authentication, Home, Pulse, Geek Shelf, Discover, Matches, Direct, profiles, and settings. The original BlackFrame identity and Laravel/Inertia architecture remain in place.

## Audit findings and changes

| Finding | Implemented improvement |
| --- | --- |
| Competing panels, duplicated calls to action, and uneven spacing distracted from the content. | A slimmer navigation shell, one shared heading pattern, compact post composer, flatter context rail, and consistent neutral surfaces with a rose accent. |
| The public website and sign-in flow lacked a clear shared visual direction. | Editorial welcome page, focused split authentication layout, original culture still-life artwork, self-hosted typography, and coordinated light/dark tokens. |
| Mobile navigation did not expose every main destination reliably. | Accessible drawer with Matches and Geek Shelf, five labeled bottom navigation items, working drawer dismissal, and corrected profile active state. |
| Comment controls did not provide a complete conversation workflow. | Authenticated, paginated threads; creation, validation, author/post-owner deletion, confirmation, loading, retry, and empty states across Home, Pulse, and profiles. |
| The shelf emphasized forms over the collection. | Search, title/rating sorting, status filters, readable entry summaries, expandable editors, explicit unsaved/saved states, and an Add title dialog. |
| Mobile post creation put a large preview before the fields. | Editor-first mobile layout, a working Text shortcut, disabled empty submission, and field-associated validation. |
| Theme state was fragile across mounted components and unavailable browser storage. | One shared external theme store, system preference changes, cross-tab synchronization, storage fallbacks, and server-safe imports. |
| Future posts and deleted authors could affect feeds or cause failures. | Publication-time checks in feeds/profiles/policies, deleted-author filtering, correct newest-first comment previews, and a following subquery instead of a PHP ID list. |
| Direct refreshed only an open conversation and could compete with form visits. | Inbox and conversation refresh while visible/online, paused during navigation or submissions. |
| The inherited Docker environment could redirect PHPUnit to the local database. | Forced PHPUnit environment/server values plus a guard that validates the resolved database before RefreshDatabase runs. |
| Dependency and quality checks were scattered. | Updated vulnerable transitive npm packages and added `typecheck`, `lint:check`, and aggregate `check` scripts. |

## Design implementation

Both requested skills, `ui-ux-pro-max` and `design-taste-frontend`, informed the audit and implementation. The chosen direction uses Outfit Variable, cool neutral surfaces, generous photography, and one rose accent, with design/motion/density dials of 7/3/5. Radix/shadcn primitives remain the foundation for dialogs and menus.

The new local hero image is `public/images/campaign/culture-still-life.webp` (1536 × 1024, approximately 128 KiB). It was generated for this project, converted to WebP, dimensioned to reserve layout space, and preloaded on the welcome page. Existing brand assets remain in use.

Shared components now include `PageHeading`, `FeedComposer`, `FeedTabs`, `PostEngagement`, `PasswordInput`, `ConnectionStatus`, and `AppErrorBoundary`. The UI includes visible focus treatment, a working skip link, labeled icon actions, 44px primary action targets, scrollable mobile dialogs, and reduced-motion support.

The maintained UI contract is in [DESIGN.md](DESIGN.md), with full tokens and rules in [MASTER.md](design-system/blackframe/MASTER.md).

## Validation

- PHPUnit: **98 tests passed, 929 assertions**, including comment privacy/ownership, validation, pagination, deleted users, future publication, existing media, matching, Direct, and account flows.
- TypeScript, ESLint (zero warnings), and Prettier checks pass.
- Laravel Pint: **129 files pass**.
- Client production build and SSR bundle compilation pass. SSR service deployment was not enabled or tested.
- npm and Composer audits report **no known vulnerabilities** at verification time.
- Browser checks cover 375, 768, 1024, and 1440px layouts. Main routes were checked for horizontal overflow, with visual review of the welcome page, sign-in, feeds, shelf, matches, navigation drawer, and dialogs in both themes.
- Interactive browser checks verified login/logout, password visibility, keyboard skip navigation, text composer routing, comment creation/deletion, shelf search/edit/save, nested catalog dialog opening, and mobile drawer dismissal. Temporary comment content was removed and the edited demo shelf progress restored.
- No Lighthouse score or real-device performance claim is made; automated performance and assistive-technology audits remain release work.

## Local data and test isolation

An early test run inherited Docker's development environment and reset the local demo database. The issue was disclosed immediately. The user confirmed that it contained only demo content; the supplied demo fixtures were then restored. Subsequent tests run against `frame_testing`, and application startup in tests now fails before migration if the resolved database or environment is wrong.

The demo login remains `demo@blackframe.test` / `password`. Existing user edits to Docker/Vite configuration and shelf artwork sizing were preserved. No production deployment, external messages, or git commit were performed.

## Next product priorities

1. Add blocking, reporting, and moderation tools before opening registration broadly.
2. Add notification delivery and WebSocket-based Direct updates when operational requirements are defined.
3. Expand the single-image composer to multi-image uploads, with image transformation and storage lifecycle management.
4. Add dedicated subject pages and richer catalog browsing.
5. Run production-mode performance, real-device accessibility, backup/restore, and deployment validation against the intended hosting environment.

These are future product capabilities and release checks, rather than inactive controls presented as finished features.
