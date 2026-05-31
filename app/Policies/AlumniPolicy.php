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

    public function update(User $user, Alumni $alumni): bool
    {
        return $this->userCanAccessAlumni($user, $alumni);
    }

    public function delete(User $user, Alumni $alumni): bool
    {
        return $this->userCanAccessAlumni($user, $alumni);
    }

    private function userCanAccessAlumni(User $user, Alumni $alumni): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        if ($user->campus_id === null) {
            return false;
        }

        $alumni->loadMissing(['program', 'school']);

        // Alumni with a program — check via program's campus
        if ($alumni->program !== null) {
            return $alumni->program->campus_id === $user->campus_id;
        }

        // Alumni without a program (non-CHMSU schools) — check via school's campus
        if ($alumni->school !== null) {
            return $alumni->school->campus_id === $user->campus_id;
        }

        return false;
    }
}
