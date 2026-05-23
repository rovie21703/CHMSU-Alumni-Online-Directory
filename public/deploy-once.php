<?php

/**
 * One-time InfinityFree deploy helper.
 *
 * Visit (use this exact token, not "YOUR_SECRET"):
 * https://chmsualumni.infinityfreeapp.com/deploy-once.php?token=chmsu-setup-change-me
 *
 * DELETE this file immediately after success.
 */

declare(strict_types=1);

$secret = 'chmsu-setup-change-me';

if (($_GET['token'] ?? '') !== $secret) {
    http_response_code(403);
    exit("Forbidden.\n\nUse: ?token={$secret}\n\nThen delete this file when done.");
}

$base = dirname(__DIR__);

$directories = [
    $base.'/storage/framework/views',
    $base.'/storage/framework/cache/data',
    $base.'/storage/framework/sessions',
    $base.'/storage/framework/testing',
    $base.'/storage/logs',
    $base.'/storage/app/public',
    $base.'/bootstrap/cache',
];

$cachedConfigFiles = [
    $base.'/bootstrap/cache/config.php',
    $base.'/bootstrap/cache/routes-v7.php',
    $base.'/bootstrap/cache/events.php',
    $base.'/bootstrap/cache/services.php',
];

header('Content-Type: text/plain; charset=utf-8');

echo "CHMSU Alumni Directory — one-time deploy\n\n";

echo "=== Storage directories ===\n";

foreach ($directories as $directory) {
    if (! is_dir($directory)) {
        mkdir($directory, 0755, true);
        echo "[created] {$directory}\n";
    } else {
        echo "[ok]      {$directory}\n";
    }

    if (! is_writable($directory)) {
        echo "          WARNING: not writable — set 755 or 775 in File Manager\n";
    }
}

echo "\n=== Remove XAMPP/local cached config ===\n";

foreach ($cachedConfigFiles as $file) {
    if (is_file($file)) {
        unlink($file);
        echo "[deleted] {$file}\n";
    }
}

echo "\n=== Laravel optimize (optional) ===\n";

try {
    require $base.'/vendor/autoload.php';
    $app = require_once $base.'/bootstrap/app.php';
    $kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);

    $commands = [
        'storage:link',
        'config:cache',
        'route:cache',
        'view:cache',
    ];

    foreach ($commands as $command) {
        $kernel->call($command);
        echo "[ok] php artisan {$command}\n";
    }
} catch (Throwable $exception) {
    echo "[skip] Artisan commands failed: {$exception->getMessage()}\n";
    echo "       Storage setup above may still be enough — reload the site.\n";
}

echo "\nDone. DELETE public/deploy-once.php now, then open your homepage.\n";
