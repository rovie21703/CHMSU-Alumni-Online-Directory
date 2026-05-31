<?php

namespace App\Support;

use App\Rules\ValidFormTiming;
use Illuminate\Support\Facades\Crypt;

class FormProtection
{
    public static function honeypotField(): string
    {
        return (string) config('security.honeypot_field', 'website');
    }

    public static function timingToken(): string
    {
        return Crypt::encryptString((string) now()->getTimestamp());
    }

    /**
     * @return array<string, mixed>
     */
    public static function sharedProps(): array
    {
        return [
            'honeypotField' => self::honeypotField(),
            'formStartedAt' => self::timingToken(),
        ];
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public static function rules(): array
    {
        return [
            self::honeypotField() => ['present', 'nullable', 'string', 'max:0'],
            'form_started_at' => ['required', 'string', new ValidFormTiming],
        ];
    }

    /**
     * @return array<string, string>
     */
    public static function validSubmissionFields(?int $elapsedSeconds = null): array
    {
        $elapsedSeconds ??= (int) config('security.form_min_seconds', 2) + 1;
        $startedAt = now()->subSeconds($elapsedSeconds)->getTimestamp();

        return [
            self::honeypotField() => '',
            'form_started_at' => Crypt::encryptString((string) $startedAt),
        ];
    }
}
