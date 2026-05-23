<?php

namespace App\Policies;

use App\Enums\UserRole;
use App\Models\User;

class UserPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->isAdmin();
    }

    public function create(User $user): bool
    {
        return $user->isAdmin();
    }

    public function update(User $user, User $staff): bool
    {
        return $user->isAdmin() && $staff->role === UserRole::Staff;
    }

    public function delete(User $user, User $staff): bool
    {
        return $user->isAdmin()
            && $staff->role === UserRole::Staff
            && $staff->id !== $user->id;
    }
}
