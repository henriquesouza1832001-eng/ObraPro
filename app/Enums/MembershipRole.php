<?php

namespace App\Enums;

enum MembershipRole: string
{
    case Owner = 'owner';
    case Admin = 'admin';
    case Engineer = 'engineer';
    case Supervisor = 'supervisor';
    case Worker = 'worker';
    case Student = 'student';

    public function canManageOrganization(): bool
    {
        return in_array($this, [self::Owner, self::Admin], true);
    }
}
