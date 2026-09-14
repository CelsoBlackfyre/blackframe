# BlackFrame Catalog

BlackFrame uses a federated search instead of shipping a small hard-coded list or allowing unrestricted subject creation. People search real catalogs, choose one canonical result, and BlackFrame imports only that chosen record. A missing item becomes one deduplicated review request rather than an immediately public subject.

## Sources

| Source | Coverage | Credentials | BlackFrame behavior |
| --- | --- | --- | --- |
| [Open Library](https://openlibrary.org/dev/docs/api/search) | Books and book covers | None | Low-volume title search, cached for 15 minutes |
| [TVmaze](https://www.tvmaze.com/api) | Television series | None | Fuzzy show search with source attribution |
| [Jikan](https://docs.api.jikan.moe/) | Anime and manga | None | Public, unofficial MyAnimeList search; failures do not block other sources |
| [Wikidata](https://www.wikidata.org/wiki/Help:Data_access) | Games, films, characters, franchises, tabletop games, and other recognizable media entities | None | Entity search with conservative type inference from the provider description |
| [TMDB](https://developer.themoviedb.org/reference/search-multi) | Films and television series | Optional bearer token | Enabled only when `TMDB_API_TOKEN` is configured |

Provider names and links are visible in the picker. Their data and imagery remain subject to their respective terms and licenses. Production owners should review those terms before commercial deployment.

## Request flow

```text
User enters at least 2 characters
  -> 350 ms browser debounce
  -> authenticated GET /catalog/search
  -> per-user rate limit
  -> 15-minute Laravel cache
  -> parallel provider requests
  -> normalize, deduplicate by type and title, rank by name relevance
  -> return encrypted external references

User selects a result and submits Shelf/Create
  -> validate the encrypted external reference
  -> decrypt and verify provider fields on the server
  -> reuse source/source_id or exact existing type/title
  -> import only when no canonical subject exists
  -> attach the canonical subject to the shelf entry or post
```

Search returns provider results only; existing BlackFrame subjects are not mixed in, so a catalog entry always reflects its source. Provider timeouts are isolated — if one API is unavailable, the remaining provider results still appear, and the picker names the unavailable source.

Results are ranked by how closely the name matches the query (exact, then prefix, then containing). Provider results whose names never contain the query are dropped while better matches exist, so fuzzy provider noise cannot bury a real match.

## Why the client receives a signed reference

External search results are not inserted while someone types. BlackFrame encrypts the provider id, type, name, description, image, and source URL into an opaque reference. The Shelf or Create submission sends that reference back to `SubjectResolver`, which rejects altered or invalid values before importing anything.

This keeps the database small, prevents client-side provider spoofing, and avoids a second provider request at the moment of submission.

## Duplicate control

Imported subjects use a unique `(source, source_id)` database key. The resolver also reuses an existing subject with the same normalized title and type, so a seeded BlackFrame subject wins over an external duplicate.

Missing-title requests use a unique `(type, normalized_name)` key. Repeated capitalization or whitespace variants therefore point to one pending request.

## Missing-title moderation

The picker reveals **Request a missing title** only after search. The request asks for:

- exact title;
- required category;
- optional official or database URL;
- optional note to distinguish similar works.

Requests are stored in `subject_suggestions` with `pending`, `approved`, or `rejected` status. They do not become public subjects automatically. The endpoint is limited to five requests per authenticated user per hour. An administrative review screen is a later milestone; until then, maintainers can inspect the queue in PostgreSQL or Laravel Tinker.

## Configuration

The built-in sources require no credentials. To add TMDB:

```dotenv
TMDB_API_TOKEN=your_tmdb_read_access_token
CATALOG_API_TIMEOUT=4
```

Then clear cached configuration if it is enabled:

```powershell
php artisan config:clear
```

The provider token stays server-side and is never exposed to React.

## Main implementation files

- `app/Services/Catalog/CatalogSearchService.php`
- `app/Services/Catalog/SubjectResolver.php`
- `app/Http/Controllers/CatalogController.php`
- `app/Http/Controllers/SubjectSuggestionController.php`
- `resources/js/components/subjects/subject-picker.tsx`
- `database/migrations/2026_08_25_200000_add_catalog_sources_and_subject_suggestions.php`
- `tests/Feature/CatalogSearchTest.php`
