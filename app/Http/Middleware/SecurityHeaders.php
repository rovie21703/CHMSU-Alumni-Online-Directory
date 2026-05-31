<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SecurityHeaders
{
    /**
     * @param  Closure(Request): Response  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        $response->headers->set('X-Frame-Options', 'DENY');
        $response->headers->set('X-Content-Type-Options', 'nosniff');
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');
        $response->headers->set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
        $response->headers->set('X-XSS-Protection', '1; mode=block');

        if (! app()->environment('local')) {
            $response->headers->set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
        }

        $response->headers->set('Content-Security-Policy', $this->contentSecurityPolicy());

        return $response;
    }

    private function contentSecurityPolicy(): string
    {
        $viteHosts = $this->viteDevHosts();

        if (app()->environment('local')) {
            return implode('; ', [
                "default-src 'self'",
                "script-src 'self' 'unsafe-inline' 'unsafe-eval' {$viteHosts}",
                "style-src 'self' 'unsafe-inline' https://fonts.bunny.net {$viteHosts}",
                "font-src 'self' https://fonts.bunny.net data:",
                "img-src 'self' data: blob: {$viteHosts}",
                "connect-src 'self' {$viteHosts} ws://127.0.0.1:5173 ws://localhost:5173",
            ]);
        }

        return implode('; ', [
            "default-src 'self'",
            "script-src 'self'",
            "style-src 'self' 'unsafe-inline' https://fonts.bunny.net",
            "font-src 'self' https://fonts.bunny.net data:",
            "img-src 'self' data: blob:",
            "connect-src 'self'",
            "frame-ancestors 'none'",
            "base-uri 'self'",
            "form-action 'self'",
        ]);
    }

    private function viteDevHosts(): string
    {
        $hosts = [
            'http://127.0.0.1:5173',
            'http://localhost:5173',
        ];

        $configuredHost = env('VITE_HMR_HOST');

        if (is_string($configuredHost) && $configuredHost !== '') {
            $hosts[] = "http://{$configuredHost}:5173";
        }

        return implode(' ', array_unique($hosts));
    }
}
