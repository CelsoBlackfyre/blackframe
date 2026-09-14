<?php

namespace App\Services\Catalog;

use App\Enums\SubjectType;
use Illuminate\Http\Client\Pool;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Throwable;

class CatalogSearchService
{
    /**
     * Names that never contain the query are kept only when nothing else matched.
     */
    private const LOOSE_MATCH = 3;

    /**
     * Roman numerals providers use in sequel titles, mapped to how people type them.
     *
     * @var array<string, int>
     */
    private const ROMAN_NUMERALS = [
        'i' => 1,
        'ii' => 2,
        'iii' => 3,
        'iv' => 4,
        'v' => 5,
        'vi' => 6,
        'vii' => 7,
        'viii' => 8,
        'ix' => 9,
        'x' => 10,
    ];

    /** @var array<string, string> */
    private const SOURCE_LABELS = [
        'openlibrary' => 'Open Library',
        'tvmaze' => 'TVmaze',
        'jikan' => 'Jikan',
        'wikidata' => 'Wikidata',
        'tmdb' => 'TMDB',
        'rawg' => 'RAWG',
    ];

    /**
     * When two providers describe the same work, keep the one with the richest
     * record first, then fall back to this order.
     *
     * @var array<string, int>
     */
    private const SOURCE_PRIORITY = [
        'tmdb' => 0,
        'rawg' => 1,
        'tvmaze' => 2,
        'jikan' => 3,
        'openlibrary' => 4,
        'wikidata' => 5,
    ];

    /**
     * @return array{data: array<int, array<string, mixed>>, meta: array<string, mixed>}
     */
    public function search(string $query, ?SubjectType $type = null): array
    {
        [$term, $year] = $this->splitYear(Str::squish($query));
        $cacheKey = 'catalog-search:v4:'.sha1(implode('|', [
            Str::lower($term),
            (string) ($year ?? ''),
            $type?->value ?? 'all',
            filled(config('services.catalog.tmdb_token')) ? 'tmdb' : 'no-tmdb',
        ]));

        return Cache::remember($cacheKey, now()->addMinutes(15), function () use ($term, $year, $type): array {
            [$external, $searchedSources, $unavailableSources] = $this->externalResults($term, $type);

            $ranked = collect($external)
                ->map(fn (array $candidate): array => [
                    'richness' => $candidate['image_url'] ? 0 : 1,
                    'detailed' => $candidate['description'] ? 0 : 1,
                    'depth' => -strlen((string) $candidate['description']),
                    'priority' => self::SOURCE_PRIORITY[$candidate['source']] ?? 9,
                    'relevance' => $this->relevance($candidate['name'], $term),
                    'year_mismatch' => $year !== null && $candidate['year'] !== $year ? 1 : 0,
                    'candidate' => $candidate,
                ])
                ->sortBy([
                    ['richness', 'asc'],
                    ['detailed', 'asc'],
                    ['depth', 'asc'],
                    ['priority', 'asc'],
                ])
                ->unique(fn (array $entry): string => $entry['candidate']['type'].'|'.Str::lower($entry['candidate']['name']))
                ->sortBy([
                    ['relevance', 'asc'],
                    ['year_mismatch', 'asc'],
                ])
                ->values();

            if ($ranked->contains(fn (array $entry): bool => $entry['relevance'] < self::LOOSE_MATCH)) {
                $ranked = $ranked
                    ->filter(fn (array $entry): bool => $entry['relevance'] < self::LOOSE_MATCH)
                    ->values();
            }

            $results = $ranked->take(30)->pluck('candidate')->all();

            return [
                'data' => $results,
                'meta' => [
                    'query' => $term,
                    'year' => $year,
                    'type' => $type?->value,
                    'sources' => $searchedSources,
                    'unavailable_sources' => $unavailableSources,
                ],
            ];
        });
    }

    /**
     * Pull a trailing release year out of the query so providers receive a clean
     * title: "dune (2021)" and "dune 2021" both search providers for "dune".
     *
     * @return array{0: string, 1: int|null}
     */
    private function splitYear(string $query): array
    {
        if (preg_match('/^(.+?)\s*\((\d{4})\)$/', $query, $matches) === 1) {
            return [trim($matches[1]), (int) $matches[2]];
        }

        if (preg_match('/^(.+?\S)\s+((?:18|19|20)\d{2})$/', $query, $matches) === 1) {
            return [trim($matches[1]), (int) $matches[2]];
        }

        return [$query, null];
    }

    /**
     * Rank a candidate by how closely its name matches the query. Exact matches
     * (ignoring case and punctuation) come first, then prefixes, then names that
     * contain the query, and finally fuzzy provider matches.
     */
    private function relevance(string $name, string $query): int
    {
        $needle = $this->comparableText($query);

        if ($needle === '') {
            return self::LOOSE_MATCH;
        }

        $haystack = $this->comparableText((string) preg_replace('/\s*\(\d{4}\)$/', '', $name));

        return match (true) {
            $haystack === $needle => 0,
            str_starts_with($haystack, $needle) => 1,
            str_contains($haystack, $needle) => 2,
            default => self::LOOSE_MATCH,
        };
    }

    private function yearFrom(string $value): ?int
    {
        return preg_match('/\b((?:18|19|20)\d{2})\b/', $value, $matches) === 1 ? (int) $matches[1] : null;
    }

    private function comparableText(string $value): string
    {
        $value = Str::lower(Str::squish($value));

        // Providers title sequels with roman numerals ("Baldur's Gate III") while
        // people search with digits ("baldurs gate 3"); normalize the trailing
        // token so both forms compare as the same title.
        $value = (string) preg_replace_callback(
            '/\b(i{1,3}|iv|v|vi{1,3}|ix|x)$/',
            fn (array $matches): string => (string) self::ROMAN_NUMERALS[$matches[1]],
            $value,
        );

        return (string) preg_replace('/[^a-z0-9]+/', '', $value);
    }

    /**
     * @return array{0: array<int, array<string, mixed>>, 1: array<int, string>, 2: array<int, string>}
     */
    private function externalResults(string $query, ?SubjectType $type): array
    {
        $requestNames = $this->requestNames($type);
        $timeout = max(1, (int) config('services.catalog.timeout', 4));
        $userAgent = 'BlackFrame/1.0 ('.config('app.url').')';

        try {
            $responses = Http::pool(function (Pool $pool) use ($query, $requestNames, $timeout, $userAgent): array {
                $requests = [];

                foreach ($requestNames as $name) {
                    $request = $pool->as($name)->acceptJson()->withUserAgent($userAgent)->timeout($timeout);

                    $requests[] = match ($name) {
                        'openlibrary' => $request->get('https://openlibrary.org/search.json', [
                            'q' => $query,
                            'fields' => 'key,title,author_name,first_publish_year,cover_i',
                            'limit' => 6,
                        ]),
                        'openlibrary_comic' => $request->get('https://openlibrary.org/search.json', [
                            'q' => $query.' subject:comics',
                            'fields' => 'key,title,author_name,first_publish_year,cover_i',
                            'limit' => 6,
                        ]),
                        'tvmaze' => $request->get('https://api.tvmaze.com/search/shows', ['q' => $query]),
                        'jikan_anime' => $request->get('https://api.jikan.moe/v4/anime', ['q' => $query, 'limit' => 6, 'sfw' => 'true']),
                        'jikan_manga' => $request->get('https://api.jikan.moe/v4/manga', ['q' => $query, 'limit' => 6, 'sfw' => 'true']),
                        'wikidata' => $request->get('https://www.wikidata.org/w/api.php', [
                            'action' => 'wbsearchentities',
                            'format' => 'json',
                            'search' => $query,
                            'language' => 'en',
                            'uselang' => 'en',
                            'type' => 'item',
                            'limit' => 12,
                            'origin' => '*',
                        ]),
                        'tmdb' => $request
                            ->withToken((string) config('services.catalog.tmdb_token'))
                            ->get('https://api.themoviedb.org/3/search/multi', [
                                'query' => $query,
                                'include_adult' => 'false',
                                'language' => 'en-US',
                                'page' => 1,
                            ]),
                        'rawg' => $request
                            ->timeout(max($timeout, (int) config('services.catalog.rawg_timeout', 8)))
                            ->get('https://api.rawg.io/api/games', [
                                'key' => (string) config('services.catalog.rawg_key'),
                                'search' => $query,
                                'page_size' => 8,
                            ]),
                    };
                }

                return $requests;
            });
        } catch (Throwable $exception) {
            report($exception);

            return [[], $this->sourceLabels($requestNames), $this->sourceLabels($requestNames)];
        }

        $results = [];
        $unavailable = [];

        foreach ($requestNames as $name) {
            $response = $responses[$name] ?? null;

            if (! $response instanceof Response || ! $response->successful()) {
                $unavailable[] = self::SOURCE_LABELS[$this->sourceName($name)];

                continue;
            }

            $results = [...$results, ...match ($name) {
                'openlibrary' => $this->parseOpenLibrary($response, SubjectType::Book),
                'openlibrary_comic' => $this->parseOpenLibrary($response, SubjectType::Comic),
                'tvmaze' => $this->parseTvMaze($response),
                'jikan_anime' => $this->parseJikan($response, SubjectType::Anime),
                'jikan_manga' => $this->parseJikan($response, SubjectType::Manga),
                'wikidata' => $this->parseWikidata($response, $type),
                'tmdb' => $this->parseTmdb($response, $type),
                'rawg' => $this->parseRawg($response, $type),
            }];
        }

        return [
            $results,
            array_values(array_unique($this->sourceLabels($requestNames))),
            array_values(array_unique($unavailable)),
        ];
    }

    /** @return array<int, string> */
    private function requestNames(?SubjectType $type): array
    {
        $names = [];

        if ($type === null || $type === SubjectType::Book) {
            $names[] = 'openlibrary';
        }

        if ($type === SubjectType::Comic) {
            $names[] = 'openlibrary_comic';
        }

        if ($type === null || $type === SubjectType::Series) {
            $names[] = 'tvmaze';
        }

        if ($type === null || $type === SubjectType::Anime) {
            $names[] = 'jikan_anime';
        }

        if ($type === null || $type === SubjectType::Manga) {
            $names[] = 'jikan_manga';
        }

        $names[] = 'wikidata';

        if (filled(config('services.catalog.rawg_key')) && ($type === null || $type === SubjectType::Game)) {
            $names[] = 'rawg';
        }

        if (filled(config('services.catalog.tmdb_token')) && ($type === null || in_array($type, [SubjectType::Movie, SubjectType::Series], true))) {
            $names[] = 'tmdb';
        }

        return $names;
    }

    /** @return array<int, array<string, mixed>> */
    private function parseOpenLibrary(Response $response, SubjectType $type): array
    {
        return collect($response->json('docs', []))
            ->filter(fn ($item): bool => is_array($item) && filled($item['key'] ?? null) && filled($item['title'] ?? null))
            ->take(6)
            ->map(function (array $item) use ($type): array {
                $authors = collect($item['author_name'] ?? [])->take(2)->implode(', ');
                $year = $item['first_publish_year'] ?? null;
                $details = collect([$authors ? 'By '.$authors : null, $year ? 'First published '.$year : null])->filter()->implode(' · ');
                $sourceId = trim((string) $item['key'], '/');

                return $this->candidate([
                    'source' => 'openlibrary',
                    'source_id' => $sourceId,
                    'source_url' => 'https://openlibrary.org/'.$sourceId,
                    'name' => $item['title'],
                    'type' => $type,
                    'description' => $details ?: null,
                    'image_url' => filled($item['cover_i'] ?? null)
                        ? 'https://covers.openlibrary.org/b/id/'.$item['cover_i'].'-M.jpg'
                        : null,
                    'year' => is_numeric($year) ? (int) $year : null,
                ]);
            })
            ->all();
    }

    /** @return array<int, array<string, mixed>> */
    private function parseTvMaze(Response $response): array
    {
        return collect($response->json())
            ->pluck('show')
            ->filter(fn ($show): bool => is_array($show) && filled($show['id'] ?? null) && filled($show['name'] ?? null))
            ->take(6)
            ->map(fn (array $show): array => $this->candidate([
                'source' => 'tvmaze',
                'source_id' => (string) $show['id'],
                'source_url' => $show['url'] ?? null,
                'name' => $show['name'],
                'type' => SubjectType::Series,
                'description' => $this->plainText($show['summary'] ?? null),
                'image_url' => data_get($show, 'image.medium') ?? data_get($show, 'image.original'),
                'year' => $this->yearFrom((string) ($show['premiered'] ?? '')),
            ]))
            ->all();
    }

    /** @return array<int, array<string, mixed>> */
    private function parseJikan(Response $response, SubjectType $type): array
    {
        return collect($response->json('data', []))
            ->filter(fn ($item): bool => is_array($item) && filled($item['mal_id'] ?? null) && filled($item['title'] ?? null))
            ->take(6)
            ->map(fn (array $item): array => $this->candidate([
                'source' => 'jikan',
                'source_id' => $type->value.':'.$item['mal_id'],
                'source_url' => $item['url'] ?? null,
                'name' => $item['title_english'] ?? $item['title'],
                'type' => $type,
                'description' => $this->plainText($item['synopsis'] ?? null),
                'image_url' => data_get($item, 'images.jpg.large_image_url') ?? data_get($item, 'images.jpg.image_url'),
                'year' => $this->yearFrom((string) ($item['year'] ?? data_get($item, 'published.prop.from.year', ''))),
            ]))
            ->all();
    }

    /** @return array<int, array<string, mixed>> */
    private function parseWikidata(Response $response, ?SubjectType $requestedType): array
    {
        return collect($response->json('search', []))
            ->filter(fn ($item): bool => is_array($item) && filled($item['id'] ?? null) && filled($item['label'] ?? null))
            ->map(function (array $item): ?array {
                $type = $this->inferWikidataType((string) ($item['description'] ?? ''));

                if (! $type) {
                    return null;
                }

                return $this->candidate([
                    'source' => 'wikidata',
                    'source_id' => $item['id'],
                    'source_url' => $item['concepturi'] ?? 'https://www.wikidata.org/wiki/'.$item['id'],
                    'name' => $item['label'],
                    'type' => $type,
                    'description' => $item['description'] ?? null,
                    'image_url' => null,
                    'year' => $this->yearFrom((string) ($item['description'] ?? '')),
                ]);
            })
            ->filter()
            ->when($requestedType, fn ($items) => $items->where('type', $requestedType->value))
            ->take(8)
            ->values()
            ->all();
    }

    /** @return array<int, array<string, mixed>> */
    private function parseTmdb(Response $response, ?SubjectType $requestedType): array
    {
        return collect($response->json('results', []))
            ->filter(fn ($item): bool => is_array($item) && in_array($item['media_type'] ?? null, ['movie', 'tv'], true))
            ->map(function (array $item): array {
                $type = $item['media_type'] === 'movie' ? SubjectType::Movie : SubjectType::Series;
                $name = $item['title'] ?? $item['name'] ?? 'Untitled';

                return $this->candidate([
                    'source' => 'tmdb',
                    'source_id' => $item['media_type'].':'.$item['id'],
                    'source_url' => 'https://www.themoviedb.org/'.$item['media_type'].'/'.$item['id'],
                    'name' => $name,
                    'type' => $type,
                    'description' => $item['overview'] ?? null,
                    'image_url' => filled($item['poster_path'] ?? null) ? 'https://image.tmdb.org/t/p/w342'.$item['poster_path'] : null,
                    'year' => $this->yearFrom((string) ($item['release_date'] ?? $item['first_air_date'] ?? '')),
                ]);
            })
            ->when($requestedType, fn ($items) => $items->where('type', $requestedType->value))
            ->take(8)
            ->values()
            ->all();
    }

    /** @return array<int, array<string, mixed>> */
    private function parseRawg(Response $response, ?SubjectType $requestedType): array
    {
        if (filled($requestedType) && $requestedType !== SubjectType::Game) {
            return [];
        }

        return collect($response->json('results', []))
            ->filter(fn ($item): bool => is_array($item) && filled($item['id'] ?? null) && filled($item['name'] ?? null))
            ->take(8)
            ->map(function (array $item): array {
                $genres = collect($item['genres'] ?? [])->pluck('name')->take(2)->implode(', ');
                $platforms = collect($item['platforms'] ?? [])->pluck('platform.name')->take(3)->implode(', ');
                $score = $item['metacritic'] ?? null;
                $details = collect([
                    $genres ?: null,
                    $platforms ?: null,
                    $score ? 'Metacritic '.$score : null,
                ])->filter()->implode(' · ');

                return $this->candidate([
                    'source' => 'rawg',
                    'source_id' => (string) $item['id'],
                    'source_url' => filled($item['slug'] ?? null) ? 'https://rawg.io/games/'.$item['slug'] : null,
                    'name' => $item['name'],
                    'type' => SubjectType::Game,
                    'description' => $details ?: null,
                    'image_url' => $item['background_image'] ?? null,
                    'year' => $this->yearFrom((string) ($item['released'] ?? '')),
                ]);
            })
            ->all();
    }

    /** @param array{source: string, source_id: string, source_url: ?string, name: string, type: SubjectType, description: ?string, image_url: ?string, year?: int|null} $data */
    private function candidate(array $data): array
    {
        $year = $data['year'] ?? null;
        $name = Str::squish((string) $data['name']);

        if ($year !== null && ! str_contains($name, (string) $year)) {
            $name = Str::limit($name, 150, '').' ('.$year.')';
        }

        $payload = [
            'version' => 1,
            'source' => $data['source'],
            'source_id' => Str::limit((string) $data['source_id'], 160, ''),
            'source_url' => $this->httpsUrl($data['source_url']),
            'name' => Str::limit($name, 160, ''),
            'type' => $data['type']->value,
            'description' => $this->plainText($data['description']),
            'image_url' => $this->httpsUrl($data['image_url']),
        ];

        return [
            'key' => $payload['source'].':'.$payload['source_id'],
            'subject_id' => null,
            'reference' => Crypt::encryptString(json_encode($payload, JSON_THROW_ON_ERROR)),
            'name' => $payload['name'],
            'year' => $year,
            'type' => $payload['type'],
            'type_label' => $data['type']->label(),
            'description' => $payload['description'],
            'image_url' => $payload['image_url'],
            'source' => $payload['source'],
            'source_label' => self::SOURCE_LABELS[$payload['source']],
            'source_url' => $payload['source_url'],
        ];
    }

    private function inferWikidataType(string $description): ?SubjectType
    {
        $description = Str::lower($description);

        return match (true) {
            Str::contains($description, ['media franchise', 'video game franchise', 'film franchise', 'television franchise']) => SubjectType::Franchise,
            Str::contains($description, ['fictional character', 'comic book character', 'video game character']) => SubjectType::Character,
            Str::contains($description, ['board game', 'tabletop game', 'card game']) => SubjectType::TabletopGame,
            Str::contains($description, ['video game', 'computer game']) => SubjectType::Game,
            Str::contains($description, ['manga series', 'japanese manga', 'manga']) => SubjectType::Manga,
            Str::contains($description, ['anime series', 'anime television', 'anime film', 'japanese anime']) => SubjectType::Anime,
            Str::contains($description, ['television series', 'tv series', 'streaming series', 'miniseries']) => SubjectType::Series,
            Str::contains($description, ['comic book series', 'comic book', 'comics series', 'graphic novel']) => SubjectType::Comic,
            Str::contains($description, [' film ', 'film directed', 'feature film', 'motion picture']) || Str::endsWith($description, ' film') => SubjectType::Movie,
            Str::contains($description, [' novel ', 'novel by', 'book by']) || Str::startsWith($description, ['novel ', 'book ']) => SubjectType::Book,
            default => null,
        };
    }

    private function plainText(?string $value): ?string
    {
        if (! filled($value)) {
            return null;
        }

        $plain = Str::squish(html_entity_decode(strip_tags($value), ENT_QUOTES | ENT_HTML5, 'UTF-8'));

        return Str::limit($plain, 420);
    }

    private function httpsUrl(?string $value): ?string
    {
        if (! filled($value) || ! Str::startsWith($value, 'https://')) {
            return null;
        }

        return Str::limit($value, 2000, '');
    }

    /** @param array<int, string> $requestNames
     * @return array<int, string>
     */
    private function sourceLabels(array $requestNames): array
    {
        return array_map(fn (string $name): string => self::SOURCE_LABELS[$this->sourceName($name)], $requestNames);
    }

    private function sourceName(string $requestName): string
    {
        return match ($requestName) {
            'openlibrary_comic' => 'openlibrary',
            'jikan_anime', 'jikan_manga' => 'jikan',
            default => $requestName,
        };
    }
}
