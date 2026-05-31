<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Encryption\DecryptException;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Support\Facades\Crypt;

class ValidFormTiming implements ValidationRule
{
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (! is_string($value) || $value === '') {
            $fail('Invalid form submission.');

            return;
        }

        try {
            $startedAt = (int) Crypt::decryptString($value);
        } catch (DecryptException) {
            $fail('Invalid form submission.');

            return;
        }

        if ($startedAt <= 0) {
            $fail('Invalid form submission.');

            return;
        }

        $elapsed = now()->getTimestamp() - $startedAt;
        $minimumSeconds = (int) config('security.form_min_seconds', 2);
        $maximumSeconds = (int) config('security.form_max_seconds', 7200);

        if ($elapsed < $minimumSeconds) {
            $fail('Please take a moment before submitting the form.');

            return;
        }

        if ($elapsed > $maximumSeconds) {
            $fail('This form session has expired. Please refresh the page and try again.');
        }
    }
}
