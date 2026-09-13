<?php

namespace App\Enums;

enum ProfileConnectionList: string
{
    case Followers = 'followers';
    case Following = 'following';

    public function label(): string
    {
        return $this === self::Followers ? 'Followers' : 'Following';
    }
}
