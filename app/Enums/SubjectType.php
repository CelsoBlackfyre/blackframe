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
            self::Game => 'Game',
            self::Movie => 'Movie',
            self::Series => 'TV series',
            self::Anime => 'Anime',
            self::Manga => 'Manga',
            self::Book => 'Book',
            self::Comic => 'Comic',
            self::Character => 'Character',
            self::Franchise => 'Franchise',
            self::TabletopGame => 'Tabletop game',
        };
    }
}
