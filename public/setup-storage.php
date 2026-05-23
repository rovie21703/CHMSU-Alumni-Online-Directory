<?php

/**
 * One-time InfinityFree / shared-hosting storage setup.
 * Prefer deploy-once.php instead. If you use this file:
 * https://chmsualumni.infinityfreeapp.com/setup-storage.php?token=chmsu-setup-change-me
 * DELETE THIS FILE immediately after it reports success.
 */

declare(strict_types=1);

$secret = 'chmsu-setup-change-me';

if (($_GET['token'] ?? '') !== $secret) {
    http_response_code(403);
    exit('Forbidden. Set ?token= to match the secret in this file, then delete the file when done.');
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

echo "CHMSU Alumni Directory — storage setup\n\n";

foreach ($directories as $directory) {
    if (! is_dir($directory)) {
        mkdir($directory, 0755, true);
        echo "[created] {$directory}\n";
    } else {
        echo "[ok]      {$directory}\n";
    }

    if (! is_writable($directory)) {
        echo "          WARNING: not writable — set folder permissions to 755 or 775 in File Manager\n";
    }
}

echo "\nRemoving cached config from local/XAMPP (wrong paths on this server):\n";

foreach ($cachedConfigFiles as $file) {
    if (is_file($file)) {
        unlink($file);
        echo "[deleted] {$file}\n";
    }
}

echo "\nDone. Reload your site, then DELETE public/setup-storage.php now.\n";
