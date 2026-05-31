<?php

namespace App\Http\Middleware;

use App\Support\FormProtection;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Symfony\Component\HttpFoundation\Response;

class ValidateFormSubmission
{
    /**
     * @param  Closure(Request): Response  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if ($this->shouldValidate($request)) {
            Validator::make($request->all(), FormProtection::rules())->validate();
        }

        return $next($request);
    }

    protected function shouldValidate(Request $request): bool
    {
        if (! in_array($request->method(), ['POST', 'PUT', 'PATCH', 'DELETE'], true)) {
            return false;
        }

        /** @var list<string|null> $excludedRoutes */
        $excludedRoutes = config('security.form_protection_excluded_routes', ['logout']);

        return ! in_array($request->route()?->getName(), $excludedRoutes, true);
    }
}
