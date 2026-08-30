<?php

namespace App\Enums;

enum ShelfStatus: string
{
    case Current = 'current';
    case Completed = 'completed';
    case Backlog = 'backlog';
    case Paused = 'paused';
    case Dropped = 'dropped';

    public function label(): string
    {
        return match ($this) {
            self::Current => 'In progress',
            self::Completed => 'Completed',
            self::Backlog => 'Backlog',
            self::Paused => 'Paused',
            self::Dropped => 'Dropped',
        };
    }

    public function labelFor(SubjectType $type): string
    {
        if ($this !== self::Current) {
            return $this->label();
        }

        return match ($type) {
            SubjectType::Game, SubjectType::TabletopGame => 'Playing',
            SubjectType::Movie, SubjectType::Series, SubjectType::Anime => 'Watching',
            SubjectType::Manga, SubjectType::Book, SubjectType::Comic => 'Reading',
            SubjectType::Character, SubjectType::Franchise => 'Exploring',
        };
    }
}
