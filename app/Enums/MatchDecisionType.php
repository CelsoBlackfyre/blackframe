<?php

namespace App\Enums;

enum MatchDecisionType: string
{
    case Connect = 'connect';
    case Pass = 'pass';
}
