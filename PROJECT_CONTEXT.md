# BlackFrame Project Context

> A self-contained technical and product handoff for developers and AI assistants working on this repository.

## Document purpose

This document explains what BlackFrame is, what has already been implemented, how the application is structured, how to run and test it, and which constraints future work must preserve. It is intentionally written so it can be attached to or pasted into a new ChatGPT conversation before requesting development work.

Repository location on the original development machine:

```text
C:\Users\Doom-Windows\Documents\GitHub\InstagramClone
```

Last verified project snapshot: August 30, 2026.

## How to use this document with ChatGPT

1. Attach or paste this entire file at the beginning of a new conversation.
2. Tell ChatGPT to treat it as the current source of truth for the repository.
3. State the feature, bug, review, or planning task after the document.
4. Ask ChatGPT to inspect the relevant source files before changing code because this document describes the verified snapshot, while the repository may continue evolving.
5. Require migrations, authorization, validation, UI states, and tests whenever the requested feature needs them.

A good follow-up request is:

```text
Use PROJECT_CONTEXT.md as the project source of truth. Inspect the current repository before editing. Implement the next geek-identity feature: spoiler controls for subject-linked posts, including validation, accessible reveal behavior, timeline presentation, authorization where needed, and feature tests. Preserve the existing BlackFrame design system and run all relevant quality checks.
```

## Product overview

**Product name:** BlackFrame

**Product category:** Geek-culture social web application

**Product direction:** An Instagram-inspired sharing experience with an original visual identity and a structured understanding of geek interests. BlackFrame supports photographs and conversations, following creators and friends, discovering visual stories, and organizing games, films, series, anime, manga, books, comics, characters, franchises, and tabletop games. It must not copy Instagram branding, logos, wordmarks, or trademarked assets.

**Current maturity:** Working application foundation with the core timeline, creation, engagement, structured-subject, Geek Shelf, people discovery, transparent shelf-matching, and private Direct messaging slices. It is not yet a feature-complete social network.

### Product principles

- Media is the primary content and receives the strongest visual emphasis.
- Social actions should feel immediate while remaining idempotent and safe.
- The interface should be calm, accessible, responsive, and usable in light and dark themes.
- Laravel owns routing, authentication, validation, authorization, persistence, and server-side application behavior.
- React owns the interactive presentation layer delivered through Inertia.
- Domain logic that extends beyond a simple mutation should live in a service rather than a large controller.
- Database constraints are part of application correctness, especially for likes and follows.
- Geek features should connect through reusable structured subjects instead of isolated free-text lists.
- Future media, notification, search, story, and messaging features should have clear service boundaries.

### Long-term product layers

BlackFrame is evolving as one social operating system rather than several disconnected clones:

| Layer      | Role                                                                                               |
| ---------- | -------------------------------------------------------------------------------------------------- |
| Home       | Visual-first photos, carousels, and future video                                                   |
| Pulse      | Conversation-first short text posts and future replies, reposts, quotes, polls, and links          |
| Subjects   | Shared catalog connecting posts, shelves, future reviews, spoiler context, and fandom pages        |
| Geek Shelf | Personal identity layer for status, progress, ratings, favorites, and future public profile tastes |
| Spaces     | Future communities, memberships, roles, events, discussions, and shared media                      |
| Workspaces | Future projects, tasks, files, announcements, calendars, and team collaboration                    |
| Messages   | Shipped mutual-match Direct conversations; future groups, attachments, reactions, and real-time delivery |

All layers should reuse the same BlackFrame users, follows, content records, permissions, subject catalog, and interaction graph. Image and text posts share the `posts` table; optional `post_subject` records connect them to the same subjects used by the Geek Shelf.

## Current implementation status

### Implemented

- Public landing page with an original BlackFrame brand and generated editorial hero photograph.
- Supplied BlackFrame brand artwork, with a complete authentication lockup and a textless responsive application/browser icon.
- Registration, login, logout, password reset, password confirmation, and account settings.
- Username, display name, email, biography, website, avatar path, and private-account fields.
- Profile editing, password editing, appearance settings, and account deletion.
- User soft deletion.
- Posts with captions, locations, publication timestamps, types, and soft deletion.
- One responsive Create flow for validated image posts and short text posts.
- Optional structured topic selection in the Create flow with visible preview feedback.
- Type-aware server validation with a `PostPolicy`, form request, and content-creation rate limiter.
- Real image uploads with generated storage names, an 8 MB limit, content-based image validation, dimensions, MIME metadata, and required alt text.
- `MediaService` storage and failed-record cleanup.
- Polymorphic media records with disk, path, MIME type, order, dimensions, alt text, and future variant metadata.
- Polymorphic likes with a database uniqueness constraint.
- Thread-ready comments using an optional parent comment and soft deletion.
- Directed follower and following relationships with a uniqueness constraint.
- Visual-first Home and conversation-first Pulse views over the same post, follow, like, and comment graph.
- Typed subject catalog with parent-child relationships, provider provenance, secure on-selection imports, and extensible PostgreSQL JSON metadata.
- Personal Geek Shelf entries with context-aware statuses, progress notes, optional 1–10 ratings, and favorites.
- Shelf filters, summary metrics, accessible editing controls, debounced federated catalog search, source attribution, and moderated missing-title requests.
- Subject badges on tagged Home and Pulse posts.
- Reverse-chronological authenticated timelines containing the viewer's posts and posts from followed users.
- Home pagination with eight posts per page and Pulse pagination with twelve posts per page.
- Eager-loaded feed authors, media, limited comment previews, like counts, comment counts, and viewer-like state.
- Creator suggestions excluding the signed-in user and already-followed users.
- Searchable people discovery with URL-addressable Discover, Followers, and Following views, case-insensitive name or `@username` matching, relationship context, and twelve-person pagination.
- Shelf Match discovery that requires at least one real shared title and explains a score built from collection overlap, shared favorites, matching statuses, and rating closeness.
- Swipe-capable match cards with explicit Pass and Connect buttons, processing and failure feedback, reduced-motion behavior, practical Undo, and a mutual Connections view.
- Private, idempotent match decisions protected by authentication, CSRF, typed validation, existing-follow visibility for private profiles, a dedicated rate limiter, unique database constraints, and a distinct-user check.
- One reusable Direct conversation for each mutual Shelf Match, protected by participant authorization and an idempotent pair key.
- Validated 2,000-character private messages, participant-specific unread counts and last-read timestamps, recent-activity inbox ordering, and shared-shelf conversation context.
- Searchable two-pane Direct workspace on desktop and a single-focus conversation with predictable back navigation on mobile.
- Direct entry points from mutual Connections, desktop navigation, and the compact mobile header, with accessible unread badges.
- Like and unlike actions.
- Follow and unfollow actions in both creator suggestions and the People directory, with processing and success feedback.
- Per-user rate limiting for people search, like, follow, and content-creation actions.
- Responsive desktop sidebar with People, Shelf Match, and Direct destinations, compact mobile header with People, Match, and Direct access, and five-destination mobile navigation for Home, Pulse, Create, Shelf, and Profile.
- Light theme, dark theme, visible focus treatment, reduced-motion handling, and semantic color tokens.
- Seeded local demo users, visual posts, Pulse posts, likes, comments, follows, avatars, image content, twelve catalog subjects, overlapping community shelves, and tagged posts.
- Authentication, profile, Home, Pulse, post-creation, Geek Shelf, Shelf Match, Direct messaging, people-discovery, and social-interaction feature tests.

### Partially implemented or schema-ready

- Private accounts have an `is_private` field, but follow requests and privacy enforcement are not implemented.
- Comments exist in the database and feed previews, but users cannot create, edit, delete, or reply to comments through the current UI.
- Media records support multiple ordered attachments and JSON variants, but the current feed card displays only the first media item.
- Email-verification routes and screens exist from the starter kit, but the `User` model does not currently implement `MustVerifyEmail`; verification is therefore not enforced.
- The post type field currently supports `image` and `text`; carousel, video, poll, and link behavior remain future work.
- The queue tables and queue development process exist, but media processing jobs have not been implemented.
- Subjects can be attached to posts and shelf entries, but dedicated subject/fandom detail pages and public shelf views are not implemented.
- Direct refreshes an open conversation with a lightweight timed partial reload; WebSocket delivery, typing indicators, presence, attachments, reactions, message editing, and message deletion are not implemented.

### Not implemented yet

- Post editing and deletion UI.
- Public user profiles and profile post grids.
- Private-account follow approval.
- Comment authoring and moderation controls.
- Multiple-image carousel interaction.
- Explore, search, hashtags, mentions, saved posts, and collections.
- Spoiler controls, structured reviews, follows for subjects, fandom hubs, release tracking, recommendations, and compatibility features.
- Notifications and real-time broadcasting.
- Stories, reels, and video processing.
- Group conversations and unrestricted direct-message requests.
- Blocking, muting, reporting, moderation queues, and admin tooling.
- Production object storage and image transformation pipeline.
- Public API, mobile API authentication, or separate API-first frontend.
- Production deployment configuration, observability, backups, and CDN configuration.

## Technology stack

### Runtime and backend

| Technology              | Installed or declared version  | Purpose                                                                           |
| ----------------------- | ------------------------------ | --------------------------------------------------------------------------------- |
| PHP                     | `^8.2`; local runtime `8.3.30` | Backend runtime                                                                   |
| Laravel                 | `12.67.0`                      | Web framework, routing, authentication, ORM, validation, queues, cache, and tests |
| Inertia Laravel adapter | `2.0.25`                       | Delivers React pages and typed page props without building a separate REST API    |
| Eloquent ORM            | Included with Laravel          | Models, relationships, query building, pagination, casts, and soft deletion       |
| Ziggy                   | `2.6.4`                        | Makes named Laravel routes available to TypeScript and React                      |
| Laravel Tinker          | `2.11.1`                       | Interactive application shell                                                     |
| Laravel Pail            | `1.2.7`                        | Local log streaming in the combined development command                           |
| Laravel Pint            | `1.30.5`                       | PHP code formatting                                                               |
| PHPUnit                 | `11.5.56`                      | Unit and feature tests                                                            |

### Frontend and UI

| Technology               | Installed version   | Purpose                                                                                   |
| ------------------------ | ------------------- | ----------------------------------------------------------------------------------------- |
| React                    | `19.0.0`            | Component-based user interface                                                            |
| React DOM                | `19.0.0`            | Browser rendering                                                                         |
| TypeScript               | `5.7.3`             | Static typing for frontend code and Inertia props                                         |
| Inertia React            | `2.0.3`             | Client navigation, forms, partial reloads, and page state                                 |
| Tailwind CSS             | `4.0.8`             | Utility styling and semantic theme tokens                                                 |
| Vite                     | `6.4.3`             | Development server and production bundling                                                |
| Radix UI primitives      | Multiple packages   | Accessible dialogs, menus, labels, toggles, tooltips, avatars, and navigation foundations |
| Headless UI              | `2.2.0`             | Accessible headless interaction primitives where required                                 |
| Lucide React             | `0.475.0`           | Consistent application icon set                                                           |
| GSAP and React adapter   | `3.15.0` / `2.1.2`  | Focused scroll, card entrance, drag, and decision motion                                   |
| Outfit Variable          | `5.3.0`             | Locally bundled BlackFrame interface and display typography                               |
| class-variance-authority | `0.7.1`             | Component variant definitions                                                             |
| clsx and tailwind-merge  | `2.1.1` and `3.0.2` | Safe conditional class composition                                                        |

### Quality tooling

| Tool                | Purpose                                             |
| ------------------- | --------------------------------------------------- |
| ESLint 9            | React, hooks, and TypeScript linting                |
| Prettier 3          | Frontend formatting and Tailwind class organization |
| TypeScript compiler | Frontend type checking without output               |
| PHPUnit             | Backend unit and HTTP feature coverage              |
| Laravel Pint        | Laravel-style PHP formatting checks                 |
| npm audit           | JavaScript dependency vulnerability reporting       |

### Local infrastructure defaults

- PostgreSQL 18.6 is the default local and test database engine.
- Docker Compose exposes the project database only on `127.0.0.1:5433` and persists it in a named volume.
- Local application data uses `frame`; PHPUnit uses the isolated `frame_testing` database.
- Database-backed sessions are enabled.
- Database-backed cache and queue connections are enabled.
- Mail is written to the application log in local development.
- Broadcasting uses the log driver.
- Local file storage is the environment default; seeded media is explicitly marked as external.
- PostgreSQL is also the recommended production relational database, with credentials supplied by the deployment secret manager.
- S3 or Cloudflare R2 is the recommended production media store.

## Application architecture

BlackFrame is a Laravel monolith using Inertia as the bridge between server-side Laravel and client-side React. It does not currently expose a separate JSON REST API for the web interface. Home and Pulse deliberately reuse one content and interaction graph instead of operating as separate applications.

### Request and rendering flow

```text
Browser request
  -> Laravel route
  -> authentication and rate-limit middleware
  -> controller
  -> service or Eloquent operation
  -> presentation-ready Inertia props
  -> React page component
  -> shared React layouts and UI components
```

### Social mutation flow

```text
React component
  -> Inertia useForm request
  -> authenticated named Laravel route
  -> social-interactions rate limiter
  -> LikeController or FollowController
  -> idempotent Eloquent mutation
  -> redirect back
  -> partial Inertia prop refresh with preserved scroll
```

### Feed flow

```text
GET /feed
  -> FeedController
  -> FeedService::for(authenticated user)
  -> posts from the viewer and followed accounts
  -> published posts only
  -> reverse chronological ordering
  -> eager-loaded relationships and aggregate counts
  -> eight-item Laravel paginator
  -> resources/js/pages/feed/index.tsx
```

### Architectural boundaries

- Controllers should remain small and deal with HTTP concerns.
- `FeedService` owns feed selection and query performance.
- `PeopleSearchService` owns people discovery, relationship filtering, search relevance, and pagination.
- `MediaService` owns upload persistence, dimensions, metadata, and failed-record cleanup; queued variants and deletion orchestration remain future work.
- A future `NotificationService` should own durable notifications and broadcast dispatch.
- A future broader `SearchService` should add replaceable hashtag, subject, and full-text search without coupling those engines to the shipped database-backed people directory.
- A future `StoryService` should own active-story and expiry behavior.
- React pages should receive deliberately shaped data, not unrestricted serialized Eloquent models.

## Important repository structure

```text
app/
  Http/
    Controllers/
      Auth/                 Authentication controllers
      Settings/             Profile and password settings controllers
      FeedController.php    Feed page composition
      PeopleController.php  Searchable people-directory composition
      MatchController.php   Shelf Match discovery and mutual-connections composition
      MatchDecisionController.php Pass, Connect, and Undo mutations
      FollowController.php  Follow and unfollow mutations
      LikeController.php    Like and unlike mutations
      CatalogController.php Federated subject search endpoint
      ShelfController.php   Geek Shelf page and mutations
    Requests/               Login, profile, people, post, shelf, and match validation requests
  Models/
    User.php
    Post.php
    Media.php
    Like.php
    Comment.php
    Subject.php
    SubjectSuggestion.php
    UserSubject.php
    MatchDecision.php
  Enums/                    People/match views, decision types, subject types, and shelf statuses
  Policies/                 Post and shelf-entry authorization
  Providers/
    AppServiceProvider.php  Social rate limiter registration
  Services/
    Catalog/                Catalog search and secure subject resolution
    FeedService.php         Timeline query boundary
    PeopleSearchService.php People search and relationship query boundary
    MatchCompatibilityService.php Explainable shelf compatibility and mutual-match boundary

database/
  factories/                User, post, and subject test factories
  migrations/               Users, infrastructure, and social schema
  seeders/                  Core demo content and structured subjects

resources/
  css/app.css               Tailwind import and live design tokens
  js/
    components/social/      Feed/person cards, avatars, suggestions, and mobile nav
    components/shelf/       Editable shelf-entry presentation
    components/subjects/    Shared topic badges and catalog picker
    components/ui/          Shared Radix and shadcn-style primitives
    layouts/                App, authentication, and settings layouts
    pages/auth/             Authentication screens
    pages/feed/index.tsx    Authenticated home feed
    pages/people/index.tsx  Searchable people and relationship directory
    pages/matches/index.tsx Swipe-capable shelf matching and mutual connections
    pages/posts/create.tsx  Shared Photo/Text composer
    pages/pulse/index.tsx   Authenticated Pulse timeline
    pages/shelf/index.tsx   Geek Shelf and catalog
    pages/settings/         Profile, password, and appearance screens
    pages/welcome.tsx       Public landing page
    types/feed.ts           Feed-specific TypeScript contracts
    types/people.ts         People-directory TypeScript contracts
    types/matches.ts        Shelf Match TypeScript contracts
    types/pulse.ts          Pulse-specific TypeScript contracts
    types/subjects.ts       Subject and shelf contracts
    types/index.ts          Shared Inertia data contracts

routes/
  web.php                   Landing, timelines, people, matches, posts, shelf, like, and follow routes
  auth.php                  Authentication and verification routes
  settings.php              Profile, password, and appearance routes

tests/
  Feature/Auth/             Authentication behavior
  Feature/Settings/         Account settings behavior
  Feature/FeedTest.php      Feed visibility and ordering
  Feature/GeekShelfTest.php Shelf access, ownership, validation, and mutations
  Feature/ShelfMatchingTest.php Compatibility, decisions, mutuality, and Undo
  Feature/PostCreationTest.php
  Feature/PulseTest.php
  Feature/SocialInteractionTest.php

public/images/blackframe-hero.webp
public/images/blackframe_logo.png
public/images/blackframe_logo_textless.png
public/images/blackframe_favicon.png
public/images/campaign/blackframe-collections.png
DESIGN.md
ARCHITECTURE.md
design-system/blackframe/MASTER.md
README.md
PROJECT_CONTEXT.md
```

## Domain and database model

### Relationship summary

```text
User 1 -> many Post
User 1 -> many Comment
User many -> many User through follows
User 1 -> many UserSubject
User many -> many Subject through user_subjects
Post 1 -> many Comment
Comment 1 -> many Comment replies through parent_id
Post 1 -> many Media through polymorphic mediaable
Post 1 -> many Like through polymorphic likeable
User 1 -> many Like
Post many -> many Subject through post_subject
Subject 1 -> many Subject children through parent_id
```

### `users`

| Column              | Meaning                                                |
| ------------------- | ------------------------------------------------------ |
| `id`                | Primary key                                            |
| `name`              | Display name                                           |
| `username`          | Unique handle, maximum 32 characters                   |
| `email`             | Unique authentication email                            |
| `email_verified_at` | Nullable verification timestamp                        |
| `password`          | Automatically hashed by the model cast                 |
| `bio`               | Nullable profile biography                             |
| `website`           | Nullable profile website                               |
| `avatar_path`       | Nullable local path or external URL                    |
| `is_private`        | Privacy flag; approval behavior is not yet implemented |
| `remember_token`    | Persistent-login token                                 |
| timestamps          | Creation and update timestamps                         |
| `deleted_at`        | Soft-deletion timestamp                                |

The `avatar_url` accessor returns external avatar URLs unchanged and resolves local avatar paths through Laravel's public storage disk.

### `posts`

| Column         | Meaning                                               |
| -------------- | ----------------------------------------------------- |
| `id`           | Primary key                                           |
| `user_id`      | Author; cascades when the user is permanently deleted |
| `caption`      | Nullable post text                                    |
| `location`     | Nullable display location                             |
| `type`         | Media category, currently defaulting to `image`       |
| `published_at` | Nullable publication time and feed-ordering key       |
| timestamps     | Creation and update timestamps                        |
| `deleted_at`   | Soft-deletion timestamp                               |

Indexes support publication filtering and per-author feed ordering.

### `media`

| Column                           | Meaning                                                        |
| -------------------------------- | -------------------------------------------------------------- |
| `mediaable_type`, `mediaable_id` | Polymorphic owner                                              |
| `disk`                           | Laravel filesystem disk or the special seeded `external` value |
| `path`                           | Stored path or external URL                                    |
| `mime_type`                      | Media MIME type                                                |
| `order`                          | Attachment order                                               |
| `width`, `height`                | Optional intrinsic dimensions for stable layout                |
| `alt_text`                       | Accessible description, maximum 300 characters                 |
| `variants`                       | Nullable JSON metadata for future processed sizes or formats   |

### `likes`

Likes are polymorphic. The unique index on `user_id`, `likeable_type`, and `likeable_id` prevents duplicate engagement. Controller mutations are also idempotent through `firstOrCreate` and targeted deletion.

### `comments`

Comments belong to a post and user. `parent_id` enables one or more reply levels at the schema level. Comments use soft deletion. The feed currently loads at most two comment previews per post.

### `follows`

The table models a directed graph using `follower_id` and `following_id`. A composite unique index prevents duplicate follows. The controller rejects self-follow attempts with HTTP status 422.

### `subjects`

Subjects are shared catalog entities. Each has a unique slug, a constrained type, a name, optional description and image URL, extensible PostgreSQL `jsonb` metadata, and an optional self-referencing `parent_id`. Parents allow a book, character, game, or other entry to belong to a broader franchise without splitting the catalog into separate incompatible tables.

Externally imported subjects also store `source`, `source_id`, `source_url`, and the importing user. `(source, source_id)` is unique. Search results are not inserted while someone types; `SubjectResolver` imports only the signed result selected in a Shelf or Create submission and reuses an exact existing type/title when present.

Supported types are `game`, `movie`, `series`, `anime`, `manga`, `book`, `comic`, `character`, `franchise`, and `tabletop_game`.

### `subject_suggestions`

Missing titles enter a moderated queue instead of the public catalog. A normalized type/title uniqueness rule collapses capitalization and whitespace variants into one request. Status is constrained to `pending`, `approved`, or `rejected`; the optional source URL and note help a future administrative review flow.

### `user_subjects`

This table stores Geek Shelf state owned by one user for one subject. The composite uniqueness rule prevents duplicate shelf entries. Status is constrained to `current`, `completed`, `backlog`, `paused`, or `dropped`; rating is nullable and constrained from 1 through 10. Progress is deliberately free-form so it can represent chapters, episodes, hours, or other media-specific milestones.

### `match_decisions`

This table stores one private `connect` or `pass` choice for an ordered viewer/target user pair. Foreign keys cascade when either account is deleted. A composite unique constraint makes repeat submissions idempotent, a check constraint rejects self-targeting records, and directional indexes support both candidate exclusion and mutual-connection lookup.

### `post_subject`

This pivot connects posts to structured subjects with a composite primary key. The current composer attaches at most one subject, while the relationship and database design can support multiple topics later.

### Framework infrastructure tables

Default Laravel migrations provide password-reset tokens, sessions, cache entries, cache locks, jobs, job batches, and failed jobs.

## Feed behavior

`App\Services\FeedService` is the source of truth for timeline selection.

The shared timeline algorithm:

1. Read IDs of people followed by the authenticated viewer.
2. Add the viewer's own user ID.
3. Select posts whose author is in that set.
4. Exclude posts without `published_at`.
5. Filter Home to `image` and `carousel` types, or filter Pulse to the `text` type.
6. Eager-load the presentation-specific relationships, including structured subjects.
7. Calculate like and comment counts in SQL.
8. Calculate whether a like by the viewer exists.
9. Sort newest-first by `published_at`.
10. Paginate and preserve the query string.

Home eagerly loads ordered media and up to two comment previews and returns eight posts per page. Pulse loads author and engagement data and returns twelve posts per page. Both are intentionally following-only and reverse-chronological. Ranking, recommendations, muted accounts, blocked accounts, privacy filtering, and pagination caching are future work.

## HTTP route map

### Public and guest routes

| Method | Path                      | Name               | Purpose                                                              |
| ------ | ------------------------- | ------------------ | -------------------------------------------------------------------- |
| GET    | `/`                       | `home`             | Public landing page; authenticated users receive an Open Shelf Match action |
| GET    | `/register`               | `register`         | Registration form                                                    |
| POST   | `/register`               | `(none)`           | Create an account                                                    |
| GET    | `/login`                  | `login`            | Login form                                                           |
| POST   | `/login`                  | `(none)`           | Authenticate a session                                               |
| GET    | `/forgot-password`        | `password.request` | Password reset request form                                          |
| POST   | `/forgot-password`        | `password.email`   | Send a reset link through the configured mailer                      |
| GET    | `/reset-password/{token}` | `password.reset`   | Password reset form                                                  |
| POST   | `/reset-password`         | `password.store`   | Save a new password                                                  |

### Authenticated application routes

| Method | Path                              | Name                    | Purpose                                  |
| ------ | --------------------------------- | ----------------------- | ---------------------------------------- |
| GET    | `/feed`                           | `feed`                  | Render the authenticated feed            |
| GET    | `/pulse`                          | `pulse`                 | Render the text-post timeline            |
| GET    | `/people`                         | `people.index`          | Search Discover, Followers, or Following |
| GET    | `/matches`                        | `matches.index`         | Discover compatible shelves or mutual Connections |
| POST   | `/matches/{user}/decision`        | `matches.decisions.store` | Store an idempotent Pass or Connect choice |
| DELETE | `/matches/{user}/decision`        | `matches.decisions.destroy` | Undo the viewer's choice for one person |
| GET    | `/catalog/search`                 | `catalog.search`        | Search local and external subject sources |
| POST   | `/catalog/suggestions`            | `catalog.suggestions.store` | Queue one deduplicated missing title   |
| GET    | `/shelf`                          | `shelf.index`           | Render the viewer's shelf and catalog    |
| POST   | `/shelf`                          | `shelf.store`           | Add or replace a shelf entry             |
| PATCH  | `/shelf/{shelfEntry}`             | `shelf.update`          | Update an owned shelf entry              |
| DELETE | `/shelf/{shelfEntry}`             | `shelf.destroy`         | Remove an owned shelf entry              |
| GET    | `/dashboard`                      | `dashboard`             | Redirect legacy starter URL to `/feed`   |
| GET    | `/posts/create`                   | `posts.create`          | Render the shared post composer          |
| POST   | `/posts`                          | `posts.store`           | Publish an image or text post            |
| POST   | `/posts/{post}/likes`             | `posts.likes.store`     | Like a published post                    |
| DELETE | `/posts/{post}/likes`             | `posts.likes.destroy`   | Remove the viewer's like                 |
| POST   | `/people/{user}/follow`           | `people.follow.store`   | Follow another user                      |
| DELETE | `/people/{user}/follow`           | `people.follow.destroy` | Unfollow another user                    |
| POST   | `/logout`                         | `logout`                | End the authenticated session            |

Like and follow routes use the named `social-interactions` limiter, configured for 60 attempts per minute per authenticated user. Shelf Match decisions allow 40 attempts per minute. People discovery allows 90 requests per minute to support debounced live search. Post publishing uses `content-creation`, configured for 10 attempts per minute. Catalog search allows 40 requests per minute, while missing-title requests allow five per hour per authenticated user.

### Authenticated settings routes

| Method | Path                   | Name              | Purpose                      |
| ------ | ---------------------- | ----------------- | ---------------------------- |
| GET    | `/settings`            | `(none)`          | Redirect to profile settings |
| GET    | `/settings/profile`    | `profile.edit`    | Profile form                 |
| PATCH  | `/settings/profile`    | `profile.update`  | Update profile fields        |
| DELETE | `/settings/profile`    | `profile.destroy` | Delete the account           |
| GET    | `/settings/password`   | `password.edit`   | Password form                |
| PUT    | `/settings/password`   | `password.update` | Update the password          |
| GET    | `/settings/appearance` | `appearance`      | Theme settings               |

### Verification and confirmation routes

The starter includes email verification notice, signed verification, resend notification, and password confirmation routes. Verification enforcement must not be claimed until `MustVerifyEmail` is enabled on the user model and verified middleware is applied to protected routes.

## Frontend implementation

### Inertia conventions

- React pages live under `resources/js/pages`.
- Internal navigation uses Inertia `Link` rather than ordinary anchor navigation.
- Mutating social controls use Inertia `useForm`.
- Feed mutations preserve scroll and request only the props that need refreshing.
- Laravel named routes are referenced through Ziggy's `route()` helper.
- Shared server data is represented by TypeScript interfaces in `resources/js/types`.

### Main pages

- `welcome.tsx`: cinematic public hero, horizontal product chapters, dense editorial feature grid, account actions, and original generated BlackFrame campaign photography.
- `feed/index.tsx`: feed heading, compact mobile suggestions, post list or empty state, pagination, and desktop suggestion rail.
- `people/index.tsx`: debounced name/username search, Discover/Followers/Following tabs, network counts, relationship-aware cards, responsive pagination, and contextual empty/error/loading states.
- `matches/index.tsx`: shelf-compatible candidate stack with drag gestures, explicit Pass/Connect actions, transparent score details, practical Undo, mutual Connections, and shelf-aware empty/error/processing states.
- `pulse/index.tsx`: conversation-first text timeline, creation entry point, empty state, pagination, and shared-graph explanation.
- `posts/create.tsx`: type-aware Photo/Text composer with optional federated topic search, live media/topic preview, character limits, inline errors, image description, location, upload progress, and processing state.
- `shelf/index.tsx`: responsive Geek Shelf summary, status/favorite filters, entry editing, and a search-first add form backed by real catalog sources.
- `auth/*`: login, registration, password reset, password confirmation, and email verification screens.
- `settings/profile.tsx`: display name, username, email, biography, website, verification state, and account deletion.
- `settings/password.tsx`: password update flow.
- `settings/appearance.tsx`: light, dark, and system appearance selection.

### Social components

- `PostCard`: author metadata, first media attachment, subject badges, like state, counts, caption, and comment previews.
- `PulsePostCard`: short text content, subject badges, and the same like and comment-count graph presented in a conversation-first layout.
- `CreatorSuggestions`: horizontally scrollable cards on compact screens and a sticky discovery rail on wide screens.
- `PersonCard`: avatar, identity, mutual/follows-you context, follower/post counts, and an explicit Follow or Unfollow action.
- `SocialAvatar`: consistent avatar and fallback initials.
- `ShelfEntryCard`: owned shelf state with context-aware status, rating, progress, favorite, save, and removal controls.
- `SubjectBadge`: shared static topic marker for composer previews and timelines.
- `SubjectPicker`: reusable modal search used by Shelf and Create, with debouncing, category filtering, source attribution, loading/error/empty states, and a progressively disclosed review request.
- `MobileNav`: fixed Home, Pulse, Create, Shelf, and Profile navigation with safe-area padding; People remains directly accessible from the compact top bar without exceeding the five-item limit.
- `AppSidebarHeader`: compact mobile access to both People and Match without expanding the fixed five-item bottom navigation.

### Media loading behavior

- The first feed image loads eagerly with high fetch priority.
- Later feed images load lazily.
- Width and height values are emitted to reduce layout shift.
- Specific alt text comes from the media record, with an author-based fallback.
- The current feed component uses `post.media[0]`; carousel rendering remains future work.

## Visual design system

The full source of truth is `design-system/blackframe/MASTER.md`. `DESIGN.md` is the shorter everyday implementation contract. The live CSS variables are in `resources/css/app.css`.

### Brand direction

- Calm, content-first social product.
- Original identity that does not copy Instagram.
- Neutral surfaces with one deep-rose primary accent.
- Mild editorial asymmetry on marketing surfaces.
- Compact but readable social-product density.

### Core visual rules

- Use semantic Tailwind tokens rather than hard-coded page colors.
- Do not add a second decorative accent.
- Use Instrument Sans with system sans-serif fallbacks.
- Use 16px radii for cards and media.
- Use 12px to 16px radii for controls.
- Prefer borders before shadows.
- Use Lucide icons only, normally at 1.8px stroke width.
- Keep the supplied BlackFrame artwork in its original black/metallic treatment. Compact navigation marks, the complete authentication lockup, and the derived favicon use the semantic primary rose as their contrast surface.
- Use at least 44px touch targets and at least 8px between adjacent controls.
- Do not expose dead navigation or controls for features that have not shipped.

### Layout rules

- Primary review widths are 375px, 768px, 1024px, and 1440px.
- Desktop uses persistent left navigation, a feed up to 640px, and an optional 300px discovery rail.
- Mobile uses a compact top bar and fixed bottom navigation.
- Fixed navigation must account for device safe-area insets.
- Page-level horizontal overflow is not allowed. The creator-suggestion row is the intentional horizontally scrolling element.

### Accessibility baseline

- WCAG AA text contrast in both themes.
- Visible 2px keyboard focus indication.
- Logical heading and keyboard order.
- Accessible names for icon-only controls.
- `aria-pressed` for toggle-like controls where applicable.
- No color-only status communication.
- Authentication must support paste, autofill, and password managers.
- Motion must use opacity or transform when possible and honor reduced-motion preferences.
- Every meaningful image needs accurate alt text.

## Authentication and security behavior

- Laravel's session authentication is used.
- CSRF protection applies to web mutations.
- Passwords use Laravel's hashed cast and local bcrypt configuration.
- Login validation and throttling come from the starter authentication request.
- Likes and follows have a named per-user limiter of 60 requests per minute.
- Duplicate likes and follows are prevented by database indexes.
- Self-follow attempts are rejected.
- Like creation returns 404 for unpublished posts.
- `PostPolicy` authorizes post creation. Update/delete abilities and public-profile policies remain required before those routes ship.
- `UserSubjectPolicy` restricts shelf updates and deletion to the owning user; shelf mutation requests validate subjects, statuses, ratings, progress, and favorite state.
- External catalog payloads are encrypted and signed on the server before reaching React. `SubjectResolver` rejects altered references, and provider credentials never reach the browser.
- Catalog search and missing-title requests have separate per-user limits; normalized suggestion uniqueness prevents duplicate queue entries.
- Private-account enforcement is incomplete and must be implemented before private profiles become publicly accessible.
- Current image uploads validate image contents and accepted MIME types, enforce an 8 MB limit, generate server-side names, record dimensions and alt text, and clean up stored files if media-record creation fails.
- Future upload work must process responsive variants in queued jobs and define deletion and retention behavior.
- Never place real credentials, API keys, storage secrets, or production connection strings in this document or committed environment files.

## Local development setup

### Existing Windows workspace

The original machine uses Laragon PHP and Composer plus Docker Desktop. PHP's `pdo_pgsql` extension must be enabled and Docker Desktop must be running. Open PowerShell:

```powershell
cd C:\Users\Doom-Windows\Documents\GitHub\InstagramClone
$env:Path = 'C:\laragon\bin\php\php-8.3.30-Win32-vs16-x64;C:\laragon\bin\composer;' + $env:Path
composer run dev
```

Open:

```text
http://localhost:8000
```

The Composer development script starts:

- The PostgreSQL Docker service and waits for its health check.
- Any pending, non-destructive database migrations.
- Laravel's local HTTP server.
- The database queue listener.
- Laravel Pail log output.
- The Vite development server.

Stop all development processes with `Ctrl+C` in the same terminal.

The PostgreSQL container continues running so application data remains immediately available. Stop it without deleting data with `composer run db:stop`.

### Fresh installation

From a new checkout with PHP, Composer, Node.js, npm, and Docker Desktop installed:

```powershell
Copy-Item .env.example .env
composer install
npm install
php artisan key:generate
composer run db:start
php artisan migrate --seed
php artisan storage:link
composer run dev
```

Do not use `php artisan migrate:fresh --seed` on a database containing information that must be preserved. That command drops all tables before rebuilding and reseeding them.

### Seeded demo account

```text
Email: demo@blackframe.test
Password: password
```

The demo user is Maya Santos with username `maya.santos`. The seeders also create five creator accounts, follows, visual and Pulse posts, demo engagement, twelve structured subjects, six Maya shelf entries, and two subject-tagged Pulse posts. Subject seeding is idempotent and can safely update its own fixtures.

Seeded avatars come from `i.pravatar.cc`, and seeded feed photographs come from `picsum.photos`. These external services are development fixtures, not production media dependencies.

## Environment configuration

The committed `.env.example` contains non-secret defaults:

```text
APP_NAME=BlackFrame
APP_ENV=local
APP_DEBUG=true
APP_TIMEZONE=UTC
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5433
DB_DATABASE=frame
DB_USERNAME=frame
DB_PASSWORD=frame_local_dev
DB_SSLMODE=prefer
SESSION_DRIVER=database
QUEUE_CONNECTION=database
CACHE_STORE=database
BROADCAST_CONNECTION=log
MAIL_MAILER=log
```

For a production environment:

- Set `APP_ENV=production` and `APP_DEBUG=false`.
- Provide a secure generated `APP_KEY`.
- Use production database credentials from environment secrets.
- Use a durable object-storage disk for user media.
- Use a real queue worker supervised by the platform.
- Configure an actual mail transport.
- Configure trusted hosts, HTTPS, secure cookies, backups, logs, and monitoring.
- Run Laravel's deployment optimization commands only as part of a tested deployment process.

## Development and quality commands

### Backend tests

```powershell
php artisan test
```

Last verified result:

```text
74 tests passed
608 assertions
```

### PHP formatting check

```powershell
php vendor/bin/pint --test
```

### TypeScript check

```powershell
npx tsc --noEmit
```

### Frontend lint

```powershell
npm run lint
```

The current lint script includes `--fix`, so it can update files while checking them.

### Frontend formatting check

```powershell
npm run format:check
```

### Production frontend build

```powershell
npm run build
```

### Dependency audit

```powershell
npm audit
```

At the last verification, all commands passed and npm reported zero known vulnerabilities.

## Existing test coverage

- Public and protected authentication page behavior.
- Successful and failed login.
- Logout.
- Registration including username handling.
- Password reset and password confirmation.
- Email verification route behavior from the starter.
- Profile rendering, update behavior, and email verification timestamp preservation.
- Password update validation.
- Account soft deletion and password confirmation for deletion.
- Guest redirection from the feed.
- Legacy dashboard redirection to the feed.
- Feed inclusion of the viewer and followed users only.
- Feed exclusion of strangers and unpublished posts.
- Reverse-chronological feed ordering.
- Separation of visual Home posts from Pulse text posts.
- Pulse inclusion of the viewer and followed users only.
- Guest protection for Pulse and the post composer.
- Successful text-post creation and Pulse redirect.
- Successful image upload, storage, dimensions, MIME metadata, alt text, and Home redirect.
- Type-specific validation and rejection of non-image uploads.
- Idempotent like creation and successful unlike.
- Idempotent follow creation and self-follow rejection.
- Searchable people discovery, relationship-direction filtering, relationship flags, validation, and pagination.
- Successful unfollow from the People directory with redirect and success feedback.
- Shelf Match guest protection and empty-shelf behavior.
- Explainable candidate ranking and shared-subject presentation.
- Decision validation, self-target rejection, real shared-title enforcement, and idempotent persistence.
- Pass removal, practical Undo restoration, and mutual-only Connections behavior.

Future features should add focused feature tests instead of relying only on browser testing.

## Coding conventions for future work

### Laravel

- Use named routes and route-model binding.
- Protect mutations with authentication, authorization, CSRF, validation, and appropriate rate limits.
- Use form request classes for non-trivial validation.
- Add policies before exposing public profiles or post-management routes.
- Keep controllers focused on HTTP orchestration.
- Move multi-step domain behavior into a dedicated service.
- Use eager loading and aggregate queries to avoid N+1 behavior.
- Add indexes and database constraints for application invariants.
- Use transactions for operations that must succeed or fail as a unit.
- Preserve soft-deletion semantics where the current model uses them.

### React and Inertia

- Keep page-specific contracts typed.
- Prefer Inertia navigation and forms for web application behavior.
- Use partial prop reloads only when the refreshed prop list is sufficient.
- Preserve scroll for feed-level interactions.
- Include processing, disabled, empty, validation-error, and failure states.
- Reuse shared UI primitives before adding a new component dependency.
- Avoid adding a client state library until a real cross-page state problem requires it.
- Keep browser-only optimistic state reconciled with server truth.

### Product UI

- Follow `DESIGN.md` and `design-system/blackframe/MASTER.md`.
- Keep the deep-rose token as the only brand accent.
- Preserve light mode, dark mode, keyboard use, reduced motion, and responsive behavior.
- Use Lucide for icons.
- Do not add inactive controls as previews of future features.
- Use real content hierarchy and specific empty-state language.
- Test at the documented responsive widths and check for horizontal overflow.

### Testing expectations for each feature

A complete feature should include the relevant items from this list:

- Migration and rollback behavior.
- Model relationships and casts.
- Database constraints.
- Authorization policy or gate.
- Form request validation.
- Controller and service behavior.
- Inertia prop shape.
- Accessible React interface.
- Loading, disabled, empty, error, and success states.
- Feature tests for happy paths, invalid input, unauthorized access, and important edge cases.
- Query review for N+1 issues.
- Type check, lint, formatting checks, backend tests, and production build.
- Desktop and mobile browser verification for visual work.

## Recommended roadmap

### Phase 1: Complete the core social loop

1. Completed: add a `MediaService` and authenticated single-image upload pipeline.
2. Completed: add image and text post creation with caption, location, alt text, and a shared Create flow.
3. Add ordered multiple attachments and carousel rendering.
4. Add post editing and deletion with policies and media cleanup.
5. Add public profile pages and responsive profile media grids.
6. Add follow and unfollow controls on profiles.
7. Implement private-account follow requests and visibility rules.
8. Add comment creation, deletion, and replies with validation and policies.

### Phase 2: Expand geek identity and fandoms

1. Completed: add the typed subject catalog, optional hierarchy, database constraints, and development fixtures.
2. Completed: add the personal Geek Shelf with status, progress, optional ratings, favorites, filters, search, editing, ownership policy, and tests.
3. Completed: allow Create, Home, and Pulse to attach and display structured subjects.
4. Completed: add explainable Shelf Match discovery, private Pass/Connect decisions, practical Undo, and mutual Connections.
5. Add spoiler scopes to subject-linked posts with explicit reveal behavior and per-user spoiler preferences.
6. Add subject detail pages that aggregate posts and safely expose catalog relationships.
7. Add structured written reviews separately from lightweight shelf ratings.
8. Add follows for subjects, release tracking, fandom hubs, and user-controlled compatibility preferences.

### Phase 3: Complete Pulse and discovery

1. Add replies through the shared comment graph.
2. Add reposts and quote posts with explicit source relationships.
3. Add mentions, hashtags, link previews, and polls.
4. Add user search and profile discovery.
5. Add hashtag and topic pages.
6. Add Explore with a documented ranking strategy.
7. Add durable notifications and real-time updates.

### Phase 4: Spaces

1. Add spaces and reusable membership records.
2. Add owner, admin, moderator, member, and guest roles.
3. Add space-scoped posts, media, events, discussions, and moderation.
4. Reuse the same identity and content graph rather than building a separate community application.

### Phase 5: Rich media and messaging

1. Expiring stories and story-view records.
2. Queued image variants and metadata extraction.
3. Video upload validation and asynchronous transcoding.
4. Reel-style playback only after storage, moderation, and performance requirements are defined.
5. Completed: mutual Shelf Match conversations, participants, text messages, unread counts, and read state.
6. Add message attachments, reactions, replies, editing, deletion, and group-conversation permissions.
7. Replace timed refresh with real-time delivery and authorization for private channels.

### Phase 6: Workspaces

1. Reuse space membership foundations for organizations and teams.
2. Add projects, tasks, boards, files, announcements, and calendars.
3. Add team channels after the messaging permission model is mature.
4. Introduce context switching between Personal, Space, and Workspace destinations.

### Phase 7: Production hardening

1. Blocking, muting, reporting, and moderation workflows.
2. Privacy export and deletion workflows.
3. Object storage, CDN, signed URLs where required, and media lifecycle cleanup.
4. Caching and feed-query measurement.
5. Observability, backups, alerts, deployment automation, and recovery testing.
6. PWA behavior only after offline and cache invalidation rules are specified.

## Known risks and decisions that must not be overlooked

- `is_private` is data only; it does not currently protect content.
- Public profile and post-management work requires policies before release.
- The current external seed images require internet access and may change or fail.
- Displaying only the first media record is intentional current behavior, not full carousel support.
- Email verification is not enforced by the `User` model.
- Home and Pulse are chronological and are not recommendation algorithms.
- Catalog search federates the application catalog with cached Open Library, TVmaze, Jikan, Wikidata, and optional TMDB results. Provider licenses and terms still require production review; Jikan is an unofficial MyAnimeList API, Wikidata classification is deliberately conservative, and the current missing-title queue does not yet have an administrative review screen.
- Shelf ratings are private entry metadata used only for rating-closeness compatibility when both people rated the same title; they are not public reviews or aggregate scores.
- Direct is limited to reciprocal Connect decisions. It currently refreshes open threads every ten seconds rather than using WebSockets, and moderation tools such as blocking, reporting, and retention controls must ship before production messaging is opened broadly.
- PostgreSQL is the required local, test, CI, and production database engine; keep its Docker image and CI service versions aligned.
- The legacy SQLite file is retained only as a backup and must not be mistaken for current application data.
- Local log mail does not send real password-reset emails.
- The rate limiter reduces abuse but does not replace authorization, moderation, or anomaly detection.
- Account deletion currently follows the starter's application behavior; production privacy requirements need an explicit deletion and retention policy.
- A separate REST or GraphQL API should not be introduced solely because React is present. Inertia is the current architectural choice.

## Definition of done for future ChatGPT-assisted changes

Before describing a requested change as complete, the assistant should verify all applicable requirements below:

1. The implementation matches the current repository rather than only this document.
2. Existing behavior remains intact unless the request explicitly changes it.
3. Authorization and validation are present at the server boundary.
4. Database changes have safe migrations, indexes, foreign keys, and rollback behavior.
5. React and Inertia data contracts remain typed.
6. The UI includes required interaction states and accessible labels.
7. Light, dark, mobile, desktop, keyboard, and reduced-motion behavior remain valid for visual work.
8. Targeted feature tests cover success and failure behavior.
9. `php artisan test`, `npx tsc --noEmit`, `npm run lint`, `npm run format:check`, `php vendor/bin/pint --test`, and `npm run build` pass when relevant.
10. The handoff states exactly what changed, what was tested, and what remains outside the implemented scope.

## Concise AI context summary

BlackFrame is a Laravel 12 and React 19 geek-culture social application using Inertia 2, TypeScript, Tailwind CSS 4, Radix UI primitives, Lucide icons, locally bundled Outfit Variable typography, focused GSAP motion, PostgreSQL 18.6, and PHPUnit. Docker Compose provides persistent `frame` development data and an isolated `frame_testing` database; CI runs the same PostgreSQL version. Home, Pulse, People, Geek Shelf, Shelf Match, and Direct share users, follows, posts, subjects, likes, comments, authorization, and one structured culture graph. People search supports Discover, Followers, and Following views with relationship context and pagination. Create and Geek Shelf use the same search-first SubjectPicker, which combines local subjects with cached Open Library, TVmaze, Jikan, Wikidata, and optional TMDB matches. Shelf Match requires a real shared title, explains compatibility through overlap, favorites, status, and rating closeness, keeps decisions private, supports practical Undo, and shows a match only after mutual Connect decisions. Mutual matches can open one participant-only Direct thread with shared-title context, searchable recent conversations, validated text messages, and per-user unread state. Signed provider records are imported only after selection, deduplicated by provenance and exact type/title, and arbitrary missing items enter a rate-limited review queue. Laravel remains the server and routing authority; React is delivered through Inertia rather than a separate API. The next geek milestone is spoiler-aware subject content followed by subject pages, structured reviews, and an administrative catalog-review screen; the core social loop still needs carousels, post management, public profiles, private-follow approval, and comment authoring. All work must preserve the BlackFrame design system, accessibility requirements, database invariants, typed Inertia props, and test coverage.
