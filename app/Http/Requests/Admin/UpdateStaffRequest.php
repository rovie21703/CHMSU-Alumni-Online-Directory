<?php

namespace App\Http\Requests\Admin;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class UpdateStaffRequest extends FormRequest
{
    public function authorize(): bool
    {
        $staff = $this->route('staff');

        return $staff instanceof User
            && $this->user()?->can('update', $staff);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        /** @var User $staff */
        $staff = $this->route('staff');

        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users', 'email')->ignore($staff->id)],
            'password' => ['nullable', 'string', Password::defaults(), 'confirmed'],
            'campus_id' => ['required', 'integer', 'exists:campuses,id'],
        ];
    }
}
