<?php

namespace App\Policies;

use App\Models\Alumni;
use App\Models\User;

class AlumniPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->isAdmin() || $user->campus_id !== null;
    }

    public function view(User $user, Alumni $alumni): bool
    {
        return $this->userCanAccessAlumni($user, $alumni);
    }

    public function export(User $user): bool
    {
        return $user->isAdmin() || $user->campus_id !== null;
    }

    private function userCanAccessAlumni(User $user, Alumni $alumni): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        if ($user->campus_id === null) {
            return false;
        }

        $alumni->loadMissing('program');

        return $alumni->program?->campus_id === $user->campus_id;
    }
}
