<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class DashboardIndexRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'search' => ['nullable', 'string', 'max:255'],
            'sort' => ['nullable', 'string', Rule::in(['name', 'degree', 'year_graduated', 'campus'])],
            'dir' => ['nullable', Rule::in(['asc', 'desc'])],
            'page' => ['nullable', 'integer', 'min:1'],
            'filter_status' => ['nullable', 'string', 'max:50'],
            'filter_sector' => ['nullable', 'string', 'max:50'],
            'filter_location' => ['nullable', Rule::in(['LOCAL', 'ABROAD'])],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function queryParams(): array
    {
        return $this->validated();
    }
}
