<?php

namespace App\Http\Controllers\Admin;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreStaffRequest;
use App\Http\Requests\Admin\UpdateStaffRequest;
use App\Models\Campus;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class StaffController extends Controller
{
    public function index(): Response
    {
        $this->authorize('viewAny', User::class);

        $staff = User::query()
            ->staff()
            ->with('campus:id,name')
            ->orderBy('name')
            ->get()
            ->map(fn (User $user): array => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'campusId' => $user->campus_id,
                'campusName' => $user->campus?->name,
                'createdAt' => $user->created_at?->toDateTimeString(),
            ]);

        return Inertia::render('admin/staff/index', [
            'staff' => $staff,
            'campuses' => Campus::query()->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function store(StoreStaffRequest $request): RedirectResponse
    {
        User::query()->create([
            'name' => $request->validated('name'),
            'email' => $request->validated('email'),
            'password' => $request->validated('password'),
            'role' => UserRole::Staff,
            'campus_id' => $request->validated('campus_id'),
            'email_verified_at' => now(),
        ]);

        return redirect()
            ->route('admin.staff.index')
            ->with('success', 'Staff member created successfully.');
    }

    public function update(UpdateStaffRequest $request, User $staff): RedirectResponse
    {
        $data = [
            'name' => $request->validated('name'),
            'email' => $request->validated('email'),
            'campus_id' => $request->validated('campus_id'),
        ];

        if ($request->filled('password')) {
            $data['password'] = $request->validated('password');
        }

        $staff->update($data);

        return redirect()
            ->route('admin.staff.index')
            ->with('success', 'Staff member updated successfully.');
    }

    public function destroy(User $staff): RedirectResponse
    {
        $this->authorize('delete', $staff);

        $staff->delete();

        return redirect()
            ->route('admin.staff.index')
            ->with('success', 'Staff member removed successfully.');
    }
}
