<?php

namespace App\Enums;

enum PeopleView: string
{
    case Discover = 'discover';
    case Followers = 'followers';
    case Following = 'following';
}
