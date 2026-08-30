# BlackFrame — AI Development Context

> Self-contained project context for ChatGPT or another coding assistant. Attach this file to a new conversation before requesting changes.

## Instructions for the receiving AI

Treat this document as the verified product and architecture snapshot for BlackFrame as of **August 30, 2026**. The repository remains the final source of truth, so inspect the relevant files before editing.

When implementing a feature:

1. Preserve existing behavior unless the request explicitly changes it.
2. Use Laravel for routing, authentication, validation, authorization, persistence, and domain rules.
3. Use React through Inertia for the interactive interface; do not introduce a separate API without a concrete need.
4. Add safe PostgreSQL migrations, indexes, foreign keys, constraints, policies, form requests, and rate limits where applicable.
5. Keep Inertia props and React state typed with TypeScript.
6. Follow the BlackFrame design system and provide responsive, accessible loading, empty, error, disabled, and success states.
7. Add focused tests for success, invalid input, unauthorized access, and important edge cases.
8. Run the relevant backend tests, TypeScript check, linting, formatting checks, and production build.
9. Never place credentials, API keys, real user data, `.env`, or database contents in source control or responses.
10. Do not copy Instagram branding, logos, wordmarks, or proprietary interface details.

## Project identity

| Field                 | Current value                                      |
| --------------------- | -------------------------------------------------- |
| Product               | **BlackFrame**                                     |
| Author                | **Celso Blackfyre**                                |
| Category              | Culture-aware social web application               |
| Repository            | `https://github.com/CelsoBlackfyre/blackframe`     |
| Repository visibility | Private at this snapshot                           |
| Default branch        | `main`                                             |
| License               | MIT                                                |
| Local development URL | `http://localhost:8000` or `http://127.0.0.1:8000` |
| Current verification  | 87 tests, 823 assertions                           |

BlackFrame began from an Instagram-clone roadmap but has evolved into an original product. It combines visual sharing, short-form conversation, structured geek-culture identity, transparent people matching, and private conversations.

The product should feel familiar enough to learn quickly without copying Instagram or presenting itself as a dating application.

## Product vision

BlackFrame is a social network that understands the media, stories, worlds, characters, and fandoms people care about. Users can share moments, talk through Pulse posts, curate a personal Geek Shelf, discover people through shared culture, and continue mutual connections privately through Direct.

Core principles:

- Shared culture is represented by reusable structured subjects, not uncontrolled free-text lists.
- Home and Pulse use the same users, follows, posts, subjects, likes, and comments graph.
- Matching is based on explainable shelf data, never demographics, popularity, or follower counts.
- Interest remains private until two people independently choose Connect.
- Direct is a continuation of a mutual Shelf Match, not an open cold-messaging system.
- User actions should be idempotent, authorized, validated, rate-limited, and reinforced by database constraints.
- The interface must work in light and dark themes, on mobile and desktop, with keyboard and reduced-motion support.

## Product layers

| Layer       | Current role                                                                 |
| ----------- | ---------------------------------------------------------------------------- |
| Home        | Visual timeline, lightweight composer, activation path, and culture context. |
| Pulse       | Conversation-first reverse-chronological text timeline.                      |
| Profiles    | Person center for posts, Pulse, shared culture, shelf, and About.            |
| Subjects    | Shared catalog linking posts, shelves, matching, and future fandom pages.    |
| Geek Shelf  | Personal culture profile with progress, status, ratings, and favorites.      |
| Discover    | Searchable Discover, Followers, and Following directory.                     |
| Shelf Match | Transparent compatibility and mutual connection workflow.                    |
| Direct      | Private one-to-one text conversations between mutual Shelf Matches.          |
| Spaces      | Future communities, memberships, roles, events, and discussions.             |
| Workspaces  | Future projects, tasks, files, calendars, and team collaboration.            |

## Implemented functionality

### Brand and interface foundation

- Product name is BlackFrame everywhere relevant.
- Original full and textless logo assets are stored in `public/images/`.
- The application uses the textless mark as its compact application icon and the full lockup where space permits.
- The black logo remains in its original color and is presented against the deep-rose brand surface instead of being inverted.
- Original landing page with editorial BlackFrame messaging and a generated hero image.
- Responsive desktop sidebar, compact mobile header, and five-item mobile bottom navigation.
- Light and dark themes using semantic CSS tokens.
- Locally bundled Outfit Variable typography.
- Lucide is the only application icon family.
- Focused GSAP motion is used for meaningful entrances and Shelf Match decisions, with reduced-motion fallbacks.

### Authentication and account settings

- Registration, login, logout, password confirmation, forgotten-password, reset-password, and email-verification routes/screens.
- Username, display name, unique email, biography, website, avatar path, and private-account schema fields.
- Profile editing, password editing, appearance settings, and account deletion.
- User soft deletion.
- Database-backed sessions and password reset tokens.
- Password reset behavior is covered by tests.
- Local development mail defaults to Laravel's `log` mailer.
- Laravel has a Resend mailer configuration entry, but `resend/resend-php` is not installed and production Resend delivery is not considered complete.
- Never reuse or publish an API key previously pasted into a conversation; configure a newly rotated key only in a private environment file.

### Posts and media creation

- One authenticated Create flow supports `image` and `text` post types.
- Image posts require an uploaded image and useful alternative text.
- Text posts publish to Pulse.
- Optional structured subject selection is available for both post types.
- Image uploads use generated storage names and content-based validation.
- Maximum upload size is 8 MB.
- Media metadata includes disk, path, MIME type, order, dimensions, alt text, and future JSON variants.
- `MediaService` owns storage and failed-record cleanup.
- `PostPolicy` and `StorePostRequest` protect the creation boundary.
- Content creation is rate-limited to 10 operations per minute per user.

### Home, Pulse, and social graph

- Home displays image posts from the signed-in user and followed users.
- Home includes a lightweight composer, a three-step activation panel, culture-aware people suggestions, and a current-shelf context rail.
- Activation uses concrete product actions: five shelf titles, three followed people, and one published post.
- Pulse displays text posts from the same social graph.
- Both timelines are reverse chronological and exclude unpublished content.
- Home paginates eight posts per page; Pulse paginates twelve.
- Feed queries eager-load authors, media, limited comment previews, counts, viewer-like state, and attached subjects.
- Subject badges appear on tagged Home and Pulse content.
- Polymorphic likes are implemented with an idempotent database uniqueness constraint.
- Follow and unfollow actions work in creator suggestions and People discovery.
- Post, Pulse, match, Direct, and discovery identities link to member profiles.
- Thread-ready comments exist in the database with optional parent comments and soft deletion, but comment authoring UI is not implemented.
- Like/follow interactions are rate-limited to 60 operations per minute per user.

### Federated subject catalog

The catalog avoids both a tiny hard-coded list and uncontrolled user-created records.

Supported subject types:

- game
- movie
- series
- anime
- manga
- book
- comic
- character
- franchise
- tabletop game

Search sources:

| Provider     | Coverage                                                                 | Credentials                      |
| ------------ | ------------------------------------------------------------------------ | -------------------------------- |
| Open Library | Books and covers                                                         | None                             |
| TVmaze       | Television series                                                        | None                             |
| Jikan        | Anime and manga                                                          | None; unofficial MyAnimeList API |
| Wikidata     | Games, films, characters, franchises, tabletop games, and other entities | None                             |
| TMDB         | Films and television                                                     | Optional `TMDB_API_TOKEN`        |

Catalog behavior:

- Search begins after two characters and is debounced by 350 ms.
- Authenticated search is limited to 40 requests per minute per user.
- Results are cached for 15 minutes.
- Local PostgreSQL results and external providers are searched together.
- Provider failures are isolated so one unavailable API does not block successful sources.
- External results are normalized and deduplicated by type and title.
- Nothing is imported merely because a user searched.
- External result details are encrypted/signed into an opaque reference.
- `SubjectResolver` verifies the reference and imports only the selected result during Shelf or Create submission.
- `(source, source_id)` uniqueness and exact normalized type/title reuse prevent duplicates.
- Provider attribution remains visible in the selection interface.

Missing-title moderation:

- The missing-title request appears only after search-first progressive disclosure.
- Requests include title, category, optional source URL, and optional notes.
- Normalized type/title uniqueness deduplicates repeated requests.
- Suggestions are `pending`, `approved`, or `rejected` and never become public subjects automatically.
- Requests are limited to five per user per hour.
- The moderation data model exists; an administrative review screen does not.

### Geek Shelf

- Users can search the federated catalog and add canonical subjects to their personal shelf.
- Each user/subject pair is unique.
- Supported status values are Current, Completed, Backlog, Paused, and Dropped.
- Entries support favorite state, optional progress text, and optional 1–10 rating.
- PostgreSQL constraints enforce valid statuses and rating range.
- Users can filter, update, and delete their own shelf entries.
- `UserSubjectPolicy` prevents editing another user's entries.
- Summary metrics and accessible editing states are included.
- Arbitrary external records are imported only when selected and submitted.

### People discovery

- One `/people` directory provides URL-addressable Discover, Followers, and Following views.
- Search matches display names and `@usernames` case-insensitively.
- Discover is culture-first: shared titles and mutual connections rank ahead of generic popularity signals.
- Results include shared-title badges, current shelf activity, explainable recommendation text, relationship direction, and mutual context.
- Avatars, names, and explicit profile actions lead to the person's profile.
- Results paginate twelve people per page.
- Search is validated, state-preserving, and limited to 90 requests per minute per user.
- Public follows are immediate; private follows remain pending until the recipient accepts or declines them.
- Follow, request, accept, decline, cancel, and unfollow actions expose processing and success feedback.

### Member profiles

- Authenticated member profiles live at `/profiles/{username}`.
- Profile headers include identity, bio, optional website, join date, counts, relationship context, and follow/edit actions.
- Tabs provide visual Posts, Pulse, a read-only Geek Shelf, and About.
- Current activity and shared culture are visible without duplicating the editable Shelf form.
- Profile post interactions reuse the existing like state and social content components.
- Private profiles hide posts, Pulse, shelf, cultural context, post interactions, and uploaded media until the owner approves a follow request.

### Shelf Match

Shelf Match is friendship and creator discovery, not dating.

Eligibility and privacy:

- A candidate must share at least one real shelf title with the viewer.
- Private profiles appear only when the viewer already follows that person.
- A prior Pass or Connect removes a candidate from the Discover deck until undone.
- Pass/Connect decisions remain private.
- A connection appears only after reciprocal Connect decisions.
- One ordered viewer/target decision exists per pair, and self-decisions are rejected by PostgreSQL.

Compatibility model:

| Signal                            | Weight |
| --------------------------------- | -----: |
| Collection overlap                |    55% |
| Shared favorites                  |    20% |
| Matching shelf statuses           |    15% |
| Rating closeness where both rated |    10% |

The bio, follower count, post count, and popularity never affect compatibility.

Interaction:

- Candidate cards reveal only shared titles, not the other person's complete shelf.
- Cards support drag left to Pass and right to Connect with a 100 px threshold.
- Explicit labeled Pass and Connect buttons remain available for keyboard and non-gesture use.
- Processing, failure, empty-shelf, caught-up, no-connection, success, and Undo states are implemented.
- Connections view displays mutual matches and provides the Direct entry point.
- Match decisions are limited to 40 per minute per user.

### Direct messaging

- Direct can start only when both users have reciprocal Connect decisions.
- A sorted, unique pair key guarantees one reusable conversation for a mutual pair.
- Only conversation participants can view or send messages.
- `ConversationPolicy` protects reading and message creation.
- Messages are trimmed plain text between 1 and 2,000 characters.
- PostgreSQL repeats the non-empty/length invariant as a check constraint.
- Sending is transactional: it creates the message, updates recent activity, clears sender unread state, and increments recipient unread state.
- Each participant has independent `last_read_at` and `unread_count` state.
- Opening a conversation marks it read for that participant.
- Inbox ordering is recent activity first, with message-less conversations last.
- The conversation loads the latest 100 messages in chronological order.
- Up to three shared shelf titles provide private conversation context.
- Desktop uses a searchable two-pane inbox and conversation workspace.
- Mobile shows either the inbox or one focused conversation with a predictable Back to Direct action.
- The composer supports Ctrl+Enter or Command+Enter, character count, disabled sending, and validation errors.
- Unread counts appear in desktop and mobile navigation without relying on color alone.
- Open conversations refresh through an Inertia partial reload every 10 seconds while the page is visible.
- Conversation creation is limited to 20 per minute; messages are limited to 60 per minute.

## Technology stack

### Runtime and backend

| Technology      | Current version or constraint      | Role                                                            |
| --------------- | ---------------------------------- | --------------------------------------------------------------- |
| PHP             | `^8.2`; verified locally on 8.3.30 | Backend runtime                                                 |
| Laravel         | 12.67.0                            | Framework, routing, auth, ORM, queues, cache, validation, tests |
| Inertia Laravel | 2.x                                | Server-driven React page responses                              |
| Eloquent        | Laravel 12                         | Models, relationships, queries, casts, soft deletion            |
| Ziggy           | 2.x                                | Named Laravel routes in TypeScript                              |
| PostgreSQL      | 18.6                               | Required relational database                                    |
| PHPUnit         | 11.x                               | Unit and feature tests                                          |
| Laravel Pint    | 1.x                                | PHP formatting                                                  |

### Frontend

| Technology      | Current version or constraint | Role                                             |
| --------------- | ----------------------------- | ------------------------------------------------ |
| React           | 19.x                          | Component interface                              |
| TypeScript      | 5.7.x                         | Static typing                                    |
| Inertia React   | 2.x                           | Navigation, forms, and partial reloads           |
| Tailwind CSS    | 4.x                           | Utility styling and semantic theme tokens        |
| Vite            | 6.x                           | Development server and production build          |
| Radix UI        | Multiple packages             | Accessible interface primitives                  |
| Headless UI     | 2.2.x                         | Headless interaction primitives where needed     |
| Lucide React    | 0.475.x                       | Application icon system                          |
| GSAP            | 3.15.x                        | Focused motion and Shelf Match drag choreography |
| Outfit Variable | 5.3.x                         | Locally bundled typography                       |

Node 22 is used in GitHub workflows. The local machine currently reports Node 24.19.0 and npm 12.0.2.

## Application architecture

BlackFrame is a Laravel monolith using Inertia as the bridge to React. It does not currently expose a separate REST or GraphQL API.

```text
Browser
  -> Laravel named web route
  -> authenticated middleware, CSRF, throttling, and route-model binding
  -> form request validation and policy authorization
  -> focused controller
  -> domain service for multi-step behavior
  -> Eloquent + PostgreSQL constraints
  -> presentation-ready Inertia props
  -> typed React page
```

Important services:

- `FeedService`: Home/Pulse timeline selection and query performance.
- `PeopleSearchService`: directory scopes, search relevance, relationship context, and pagination.
- `MatchCompatibilityService`: eligibility, score calculation, shared-subject presentation, and mutual connections.
- `DirectConversationService`: mutual-match eligibility, pair creation, sending, unread state, and read state.
- `MediaService`: image storage, dimensions, metadata, and failed-record cleanup.
- `CatalogSearchService`: cached local/external catalog federation and provider failure isolation.
- `SubjectResolver`: signed reference verification, canonical subject reuse, and on-selection import.

## Database model

| Table/model                                 | Purpose and important invariants                                                   |
| ------------------------------------------- | ---------------------------------------------------------------------------------- |
| `users` / `User`                            | Identity, unique username/email, profile fields, private flag, soft deletion.      |
| `posts` / `Post`                            | Image or text content, author, caption, location, publication time, soft deletion. |
| `media` / `Media`                           | Polymorphic attachment metadata and future variants.                               |
| `likes` / `Like`                            | Polymorphic likes, unique per user and target.                                     |
| `comments` / `Comment`                      | Thread-ready comments with nullable parent and soft deletion.                      |
| `follows`                                   | Directed follower graph, unique per follower/following pair.                       |
| `subjects` / `Subject`                      | Typed culture catalog, optional parent, provenance, JSONB metadata.                |
| `post_subject`                              | Unique many-to-many post/topic connection.                                         |
| `user_subjects` / `UserSubject`             | Unique shelf entry per user/subject with status, favorite, rating, and progress.   |
| `subject_suggestions` / `SubjectSuggestion` | Deduplicated moderated missing-title requests.                                     |
| `match_decisions` / `MatchDecision`         | Unique ordered Pass/Connect choice with distinct-user constraint.                  |
| `conversations` / `Conversation`            | Unique direct pair key and recent-message timestamp.                               |
| `conversation_user`                         | Participant membership, last-read time, and unread count.                          |
| `messages` / `Message`                      | Participant-authored text message with soft deletion and length check.             |
| `sessions`                                  | Database-backed Laravel sessions.                                                  |
| `password_reset_tokens`                     | Password reset tokens keyed by email.                                              |
| cache/jobs tables                           | Database cache, queues, batches, and failed jobs.                                  |

PostgreSQL—not SQLite—is the development, test, CI, and recommended production engine.

## Main routes

Public/authentication:

- `GET /` — landing page
- `/register`, `/login`, `/logout`
- `/forgot-password`, `/reset-password/{token}`
- `/verify-email` and signed verification link

Authenticated product routes:

- `GET /feed`
- `GET /pulse`
- `GET /people`
- `GET /profiles/{username}`
- `GET /matches`
- `POST|DELETE /matches/{user}/decision`
- `GET /direct`
- `POST /direct/{user}`
- `GET /direct/{conversation}`
- `POST /direct/{conversation}/messages`
- `GET /shelf`
- `POST|PATCH|DELETE /shelf...`
- `GET /catalog/search`
- `POST /catalog/suggestions`
- `GET /posts/create`
- `POST /posts`
- `POST|DELETE /posts/{post}/likes`
- `POST|DELETE /people/{user}/follow`
- `PATCH|DELETE /people/follow-requests/{user}`
- `GET /posts/{post}/media/{media}`
- `/settings/profile`, `/settings/password`, `/settings/appearance`

There are 49 non-vendor routes in the verified snapshot.

## Security and correctness boundaries

- Authenticated middleware protects application pages and mutations.
- Laravel CSRF protects web mutations.
- Form requests validate complex inputs.
- Policies protect posts, shelf entries, and conversations.
- Route-model binding resolves scoped application records.
- Per-user rate limits reduce abuse across social, catalog, matching, creation, and messaging endpoints.
- Transactions protect media/post creation and message/unread updates.
- Database uniqueness and check constraints protect invariants even if UI validation is bypassed.
- External catalog details are encrypted/signed before reaching the client.
- Arbitrary external records are not trusted or imported on search.
- Pending private follow requests are distinct from accepted relationships at the database and Eloquent boundaries.
- Private post visibility is enforced by policy for likes and authenticated media delivery; uploaded post files are not web-public.
- Password changes and resets rotate remember tokens and invalidate database-backed sessions.
- Production host validation and baseline browser security headers are enabled in middleware.
- Real credentials belong only in `.env` or a deployment secret manager.
- `.env`, dependencies, generated builds, logs, caches, and local agent files are ignored by Git.

## Design system

Primary sources:

- `design-system/blackframe/MASTER.md`
- `design-system/blackframe/pages/matches.md`
- `design-system/blackframe/pages/direct.md`
- `DESIGN.md`
- Live tokens: `resources/css/app.css`

Visual direction:

- Editorial, content-first, culture-aware, familiar but original.
- Deep rose is the only decorative brand accent.
- No gradients, neon glow, generic glass panels, or competing accent colors.
- Cards/media use approximately 16 px radii; inputs/buttons use 12–16 px.
- Borders are preferred over heavy shadows.
- Avatars remain circular because the shape conveys identity.
- Mobile-first breakpoints are 375, 768, 1024, and 1440 px.
- Desktop navigation is persistent; mobile has a compact top bar and no more than five bottom destinations.
- Touch actions target at least 44 px.
- Focus treatment, semantic labels, text contrast, alt text, keyboard order, and reduced-motion behavior are required.
- Every interactive feature defines loading, success, empty, error, and disabled states.

Core theme tokens:

| Role       | Light              | Dark               |
| ---------- | ------------------ | ------------------ |
| Background | `hsl(240 7% 97%)`  | `hsl(240 7% 6%)`   |
| Card       | `hsl(0 0% 100%)`   | `hsl(240 6% 9%)`   |
| Foreground | `hsl(240 6% 10%)`  | `hsl(240 5% 96%)`  |
| Primary    | `hsl(347 77% 50%)` | `hsl(347 80% 62%)` |
| Border     | `hsl(240 5% 88%)`  | `hsl(240 4% 20%)`  |

## Local infrastructure and setup

Requirements:

- PHP 8.2 or newer with `pdo_pgsql`
- Composer 2
- Node.js and npm
- Docker Desktop

First-time setup from a cloned repository:

```powershell
composer install
npm install
Copy-Item .env.example .env
php artisan key:generate
composer run db:start
php artisan migrate --seed
php artisan storage:link
composer run dev
```

Open `http://localhost:8000`.

The combined `composer run dev` command:

1. Starts the PostgreSQL container and waits for health.
2. Applies safe pending migrations.
3. Starts the Laravel development server.
4. Starts the queue listener.
5. Starts Laravel Pail logs.
6. Starts Vite.

Database defaults:

- PostgreSQL image: `postgres:18.6-alpine`
- Host binding: `127.0.0.1:5433`
- Development database: `frame`
- Test database: `frame_testing`
- Persistent Docker volume: `frame_frame-postgres-data`

Useful commands:

```powershell
composer run db:start
composer run db:status
composer run db:stop
```

Never run `php artisan migrate:fresh --seed` against data that must be preserved.

Seeded demo login:

```text
Email: demo@blackframe.test
Password: password
```

## Quality baseline

Last verified locally:

- **87 tests passed**
- **823 assertions passed**
- TypeScript check passed
- ESLint passed without errors or warnings
- Prettier check passed
- Laravel Pint check passed
- Vite production build passed
- Direct was verified manually in signed-in desktop and mobile browser layouts

Commands:

```powershell
php artisan test
npx tsc --noEmit
npx eslint .
npm run format:check
php vendor/bin/pint --test
npm run build
```

GitHub Actions includes Tests and Quality workflows. At this snapshot, hosted workflow launches return `startup_failure` before allocating a job, while all equivalent local checks pass. Treat this as an account-level Actions availability/minutes issue unless a later run shows a real job failure.

## Repository and file map

```text
app/
  Enums/                 Typed domain values
  Http/Controllers/      Focused HTTP orchestration
  Http/Requests/         Validation and request authorization
  Models/                Eloquent domain models
  Policies/              Resource authorization
  Services/              Feed, people, catalog, shelf-match, media, and Direct logic
database/
  migrations/            PostgreSQL schema and constraints
  factories/             Test factories
  seeders/               Demo users, posts, subjects, and shelves
resources/js/
  components/            Shared, social, shelf, subject, and UI components
  layouts/               App, authentication, and settings layouts
  pages/                 Inertia React pages
  types/                 Typed page contracts
resources/css/app.css     Tailwind entry and live design tokens
routes/                   Web, auth, settings, and console routes
tests/                    PHPUnit unit and feature tests
design-system/            Product-wide and page-specific interface rules
```

Additional documentation:

- `README.md` — public-facing repository overview
- `PROJECT_CONTEXT.md` — long-form technical and product handoff
- `ARCHITECTURE.md` — backend boundaries and request flows
- `CATALOG.md` — providers, signed imports, caching, and moderation
- `DESIGN.md` — concise UI contract

## Known limitations

The following are not complete and must not be described as shipped:

- Post editing/deletion UI and media lifecycle cleanup.
- Comment creation, reply, edit, deletion, and moderation UI.
- Multiple-image carousel behavior, stories, reels, and video transcoding.
- Explore, hashtags, mentions, saved posts, and collections.
- Notifications and true real-time broadcasting.
- Direct attachments, reactions, replies, editing, deletion, typing indicators, presence, groups, blocking, and reporting.
- Subject/fandom pages, spoiler controls, structured reviews, subject following, release tracking, and fandom hubs.
- Administrative catalog suggestion review interface.
- Production object storage, image transformations, CDN, backups, observability, and deployment automation.
- Public/mobile API authentication or an API-first client.
- Production email delivery through Resend.

Additional cautions:

- Home and Pulse are chronological, not recommendation algorithms.
- Only the first ordered media attachment is rendered today even though the media schema supports more.
- Email verification routes exist, but verification is not enforced by `MustVerifyEmail` on the current User model.
- Seed imagery is replaceable development content and may depend on external availability/licensing.
- Jikan is an unofficial MyAnimeList API; all provider terms require review before commercial deployment.
- Shelf ratings are private compatibility inputs, not public or aggregate reviews.
- Direct uses 10-second polling rather than WebSockets.
- Blocking/reporting and retention controls should ship before messaging is opened broadly in production.

## Recommended roadmap

Suggested order based on current dependencies:

1. Comment authoring/replies plus post editing/deletion and media cleanup.
2. Spoiler-aware subject posts and dedicated subject/fandom pages.
3. Structured reviews, subject following, release tracking, and catalog moderation UI.
4. Durable notifications and real-time delivery.
5. Direct moderation, blocking/reporting, attachments, reactions, replies, and WebSockets.
6. Carousels, queued media variants, stories, and video only after storage/processing boundaries are ready.
7. Production storage, CDN, observability, backups, deployment automation, and privacy workflows.
8. Spaces and Workspaces after membership and messaging permission models are mature.

## Definition of done for future changes

A feature is complete only when the applicable items below are satisfied:

- Current repository behavior was inspected before editing.
- Migration has safe `up` and `down` behavior.
- Foreign keys, indexes, uniqueness, and checks protect important invariants.
- Auth, CSRF, authorization, validation, and throttling are present.
- Multi-step logic is transactional and lives in a focused service when appropriate.
- Queries avoid obvious N+1 behavior.
- Inertia props and React state are typed.
- The interface provides responsive loading, success, empty, error, and disabled states.
- Keyboard behavior, focus, labels, alt text, contrast, touch targets, and reduced motion are checked.
- Happy path, invalid input, unauthorized access, and important edge cases have tests.
- Backend tests, TypeScript, ESLint, Prettier, Pint, and the production build pass.
- Documentation and known limitations are updated.
- The handoff states exactly what changed, what was verified, and what remains outside scope.

## Ready-to-use prompt for ChatGPT

Copy the following after attaching this file:

```text
Use AI_CONTEXT.md as the verified product and architecture context for BlackFrame. Inspect the current repository files before editing because the code is the final source of truth.

My request:
[Describe the feature, bug, audit, or design change here.]

Preserve BlackFrame's Laravel/Inertia architecture, PostgreSQL constraints, deep-rose editorial design system, responsive behavior, accessibility baseline, and existing tests. Include authorization, validation, loading/empty/error/disabled states, database changes, and focused tests whenever applicable. Run all relevant quality checks and clearly report what changed and what remains outside scope.
```

## Short context version

BlackFrame is a Laravel 12.67 and React 19 culture-aware social application using Inertia 2, TypeScript, Tailwind CSS 4, PostgreSQL 18.6, Radix primitives, Lucide icons, Outfit Variable typography, and focused GSAP motion. It ships authentication, image/text creation, chronological Home and Pulse timelines, activation-aware Home context, culture-first Discover, member profiles with Posts/Pulse/Shelf/About views, likes/follows, a federated subject catalog, personal Geek Shelves, transparent shelf-based matching, and participant-only Direct text conversations for mutual matches. Catalog search combines PostgreSQL with Open Library, TVmaze, Jikan, Wikidata, and optional TMDB results; signed external references are imported only when selected. Shelf Match requires a shared title and scores 55% overlap, 20% shared favorites, 15% status agreement, and 10% rating closeness. Direct provides one pair conversation, per-user unread state, shared-title context, authorization, validation, and 10-second refresh. Laravel owns security and domain rules; React is delivered through Inertia rather than a separate API. The design is editorial, responsive, accessible, supports light/dark themes, uses deep rose as the only brand accent, and must not copy Instagram branding. The verified quality baseline is maintained through PHPUnit/Pest, TypeScript, ESLint, Prettier, Pint, production builds, and browser checks.
