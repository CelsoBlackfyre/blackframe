<?php

namespace App\Enums;

enum SubjectType: string
{
    case Game = 'game';
    case Movie = 'movie';
    case Series = 'series';
    case Anime = 'anime';
    case Manga = 'manga';
    case Book = 'book';
    case Comic = 'comic';
    case Character = 'character';
    case Franchise = 'franchise';
    case TabletopGame = 'tabletop_game';

    public function label(): string
    {
        return match ($this) {
            self::Game => __('Game'),
            self::Movie => __('Movie'),
            self::Series => __('TV series'),
            self::Anime => __('Anime'),
            self::Manga => __('Manga'),
            self::Book => __('Book'),
            self::Comic => __('Comic'),
            self::Character => __('Character'),
            self::Franchise => __('Franchise'),
            self::TabletopGame => __('Tabletop game'),
        };
    }
}
