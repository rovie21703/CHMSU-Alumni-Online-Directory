<?php

use App\Http\Middleware\AssignRequestId;
use App\Http\Middleware\EnsureUserIsAdmin;
use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->alias([
            'admin' => EnsureUserIsAdmin::class,
        ]);

        $middleware->web(prepend: [
            AssignRequestId::class,
        ]);

        $middleware->web(append: [
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->respond(function (Response $response, \Throwable $exception, Request $request) {
            if (! $request->header('X-Inertia') || app()->environment('local')) {
                return $response;
            }

            $status = $response->getStatusCode();

            if (! in_array($status, [403, 404, 429, 500, 503], true)) {
                return $response;
            }

            return Inertia::render('errors/show', [
                'status' => $status,
                'message' => match ($status) {
                    403 => 'You do not have permission to access this resource.',
                    404 => 'The page you are looking for could not be found.',
                    429 => 'Too many requests. Please wait a moment and try again.',
                    503 => 'The application is temporarily unavailable. Please try again shortly.',
                    default => 'Something went wrong on our end. Please try again.',
                },
            ])->toResponse($request)->setStatusCode($status);
        });
    })->create();
