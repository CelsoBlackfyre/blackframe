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
            self::Current => __('In progress'),
            self::Completed => __('Completed'),
            self::Backlog => __('Backlog'),
            self::Paused => __('Paused'),
            self::Dropped => __('Dropped'),
        };
    }

    public function labelFor(SubjectType $type): string
    {
        if ($this !== self::Current) {
            return $this->label();
        }

        return match ($type) {
            SubjectType::Game, SubjectType::TabletopGame => __('Playing'),
            SubjectType::Movie, SubjectType::Series, SubjectType::Anime => __('Watching'),
            SubjectType::Manga, SubjectType::Book, SubjectType::Comic => __('Reading'),
            SubjectType::Character, SubjectType::Franchise => __('Exploring'),
        };
    }
}
