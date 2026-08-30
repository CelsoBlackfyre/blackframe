<?php

namespace App\Enums;

enum ProfileView: string
{
    case Posts = 'posts';
    case Pulse = 'pulse';
    case Shelf = 'shelf';
    case About = 'about';
}
