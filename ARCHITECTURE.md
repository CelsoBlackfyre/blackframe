# BlackFrame Architecture

## Foundation

- Laravel 12.67, PHP 8.3
- React 19 and TypeScript, with locally bundled Outfit Variable typography and focused GSAP motion
- Inertia 2 for server-driven SPA navigation
- Tailwind CSS 4 with Radix/shadcn primitives
- PostgreSQL 18.6 for local development, automated tests, CI, and production

The official stable Laravel React starter kit supplies authentication, password reset, email verification, account settings, Vite, and test infrastructure.

## Database runtime

Local PostgreSQL runs from the pinned `postgres:18.6-alpine` image in `compose.yaml`. It binds only to `127.0.0.1:5433`, persists data in the `frame_frame-postgres-data` volume, and creates two databases with separate responsibilities:

- `frame`: local application data and seeded demo content.
- `frame_testing`: isolated PHPUnit data, rebuilt by Laravel's test database lifecycle.

GitHub Actions also provisions PostgreSQL 18.6, so database behavior is tested on the same engine used by the application. Laravel retains its optional SQLite connection definition, but SQLite is no longer a project runtime or test default.

## Current vertical slice

The current slices cover authentication, user profiles, follows, image and text posts, comments, likes, reverse-chronological Home and Pulse timelines, creator suggestions, searchable people discovery, secure image uploads, structured subjects, the personal Geek Shelf, explainable shelf-based matching, and private Direct messaging between mutual matches.

Request flow:

```text
Authenticated request
  -> FeedController or PulseController
  -> FeedService timeline query
  -> Eloquent query with eager loading and aggregate counts
  -> visual-first Home or conversation-first Pulse Inertia page
  -> like/follow action
  -> throttled controller mutation
  -> redirect back with preserved scroll
```

People discovery flow:

```text
Authenticated GET /people with view/query parameters
  -> IndexPeopleRequest normalization and validation
  -> PeopleSearchService relationship scope and ranking
  -> case-insensitive name/username matching
  -> relationship flags and aggregate follower/post counts
  -> twelve-person paginator
  -> searchable Discover, Followers, or Following Inertia view
```

Shelf Match flow:

```text
Authenticated GET /matches
  -> IndexMatchesRequest validates Discover or Connections view
  -> MatchCompatibilityService loads the viewer and candidate shelves
  -> candidates without a shared title or with a prior viewer decision are excluded
  -> score combines 55% collection overlap, 20% shared favorites,
     15% matching shelf status, and 10% rating closeness
  -> presentation reveals only shared titles and explanation metrics
  -> POST Pass or Connect stores one idempotent match_decisions record
  -> mutual Connect decisions appear in the Connections view
  -> DELETE decision provides practical Undo
```

Direct messaging flow:

```text
Mutual Shelf Match Connections view
  -> POST /direct/{user} verifies reciprocal Connect decisions
  -> DirectConversationService reuses one sorted direct_key per pair
  -> participant pivot stores last_read_at and unread_count independently
  -> GET /direct/{conversation} requires ConversationPolicy membership
  -> shared shelf titles provide opening context without exposing full shelves
  -> StoreDirectMessageRequest trims and validates a 2,000-character body
  -> transactional send updates recent activity and recipient unread state
  -> responsive Direct Inertia page polls an open thread every ten seconds
```

Creation flow:

```text
Authenticated Create page
  -> StorePostRequest type-aware validation and PostPolicy
  -> PostController transaction
  -> shared posts table with type image or text
  -> MediaService for validated image storage and metadata
  -> redirect to Home or Pulse with success feedback
```

Geek identity flow:

```text
Authenticated Geek Shelf request
  -> ShelfController with typed request validation and UserSubjectPolicy
  -> SubjectPicker calls the rate-limited catalog search endpoint
  -> CatalogSearchService merges local and cached external matches
  -> signed external reference is imported only after the user submits
  -> SubjectResolver deduplicates the canonical subject
  -> viewer-owned user_subjects record
  -> status, progress, optional 1–10 rating, and favorite state
  -> responsive Shelf Inertia page with filters and catalog discovery

Authenticated Create request with optional subject
  -> validated local subject_id or signed external reference
  -> SubjectResolver imports or reuses the canonical subject
  -> post_subject pivot attachment in the post transaction
  -> eager-loaded topic badges in Home and Pulse
```

## Domain model

- `User`: profile fields, privacy flag, follower and following relationships.
- `Post`: author, caption, location, type, publication time, soft deletion.
- `Media`: polymorphic attachment with disk/path, order, dimensions, alt text, and future variants.
- `Like`: polymorphic engagement with a unique user/target constraint.
- `Comment`: threaded post comments with soft deletion.
- `Subject`: typed catalog entity with optional parent hierarchy, external-source provenance, importer audit field, and extensible JSON metadata.
- `SubjectSuggestion`: normalized, globally deduplicated missing-title request awaiting catalog review.
- `UserSubject`: viewer-owned Geek Shelf entry with status, progress, optional rating, and favorite state.
- `MatchDecision`: one viewer-owned Pass or Connect decision for another user, uniquely constrained per ordered user pair.
- `Conversation`: one direct thread identified by a unique sorted user-pair key and recent-message timestamp.
- `Message`: participant-authored plain-text conversation record with soft deletion support.
- `conversation_user`: participant membership with independent last-read time and unread count.
- `follows`: directed user graph with unique follower/following pairs.
- `post_subject`: many-to-many relationship connecting posts to structured topics.

Indexes cover feed ordering, polymorphic targets, follower lookup, comment chronology, subject discovery, post topics, shelf filtering, and match decisions in both directions. Duplicate likes, follows, post topics, shelf entries, and ordered match decisions are rejected by database constraints. PostgreSQL check constraints also enforce supported subject types, shelf statuses, ratings from 1 through 10, valid decision values, and distinct decision participants.

## Service boundaries

- `FeedService`: owns timeline selection and query performance.
- `PeopleSearchService`: owns database-backed people discovery, relationship filtering, search relevance, and pagination.
- `MatchCompatibilityService`: owns candidate eligibility, explainable score calculation, shared-title presentation, and mutual-connection selection.
- `DirectConversationService`: owns mutual-match eligibility, idempotent pair creation, transactional sending, and participant read state.
- `MediaService`: owns post-image storage, dimensions, metadata creation, and failed-record cleanup. Queued variants and deletion orchestration remain next steps.
- `CatalogSearchService`: owns cached, fault-tolerant federation of local subjects and external catalog providers.
- `SubjectResolver`: verifies signed provider references, deduplicates subjects, and imports only selected records.
- `NotificationService` (Phase 2): durable notification creation and broadcast dispatch.
- `SearchService` (Phase 2): user and hashtag discovery behind a replaceable search engine.
- `StoryService` (Phase 3): active-story queries and expiry jobs.

Controllers should validate/authorize input and delegate multi-step domain work to these services. React pages receive presentation-ready data, not unrestricted model serialization.

## Security and privacy

- All mutations use authenticated web middleware and Laravel CSRF protection.
- External catalog records are encrypted and signed before reaching the client; shelf and post submissions cannot alter provider fields.
- Catalog search and missing-title requests have separate per-user limits. Suggestions are normalized and deduplicated instead of becoming public subjects immediately.
- Like/follow actions use a named per-user rate limiter.
- Unique indexes make repeated social actions idempotent.
- Shelf Match requires a real shared title at the server boundary, excludes private profiles unless the viewer already follows them, stores interest privately, and does not call two users a match until both choose Connect.
- Direct requires reciprocal Connect decisions to start, reuses one pair conversation, authorizes every read and send against participant membership, validates message length, and rate-limits both thread creation and sending.
- Private accounts exist in the schema; follow approval is intentionally deferred and must be added before private profiles are exposed publicly.
- Media uploads must validate MIME type from file contents, set size limits, and process variants in a queue.
- Public profile and post routes require policies before they ship.

## Media strategy

Development uses Laravel's public disk plus explicitly marked external seed images. Production should use S3 or Cloudflare R2. The media table already stores dimensions, ordering, alt text, and JSON variants so storage can change without changing post records.

## Roadmap alignment

1. Complete the core social loop with post management, carousels, public profiles, follow approval, comments, and profile grids.
2. Expand the shipped subject graph and shelf matching with spoiler controls, subject detail pages, structured reviews, fandom hubs, and compatibility preferences.
3. Expand discovery with hashtags and subject-aware recommendations, then add notifications and Reverb events.
4. Add stories and queued video/reel processing.
5. Expand shipped Direct text messaging with attachments, reactions, group permissions, moderation controls, and real-time delivery.
6. Add caching, moderation, privacy export/delete, PWA behavior, observability, and production storage.

Each feature should include migrations, relationships, policies, form requests, services where needed, Inertia UI, tests, N+1 review, and accessibility checks.
