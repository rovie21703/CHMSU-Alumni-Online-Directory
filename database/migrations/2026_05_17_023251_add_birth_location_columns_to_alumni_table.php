<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('alumni', function (Blueprint $table) {
            $table->string('birth_province')->nullable()->after('age');
            $table->string('birth_city')->nullable()->after('birth_province');
        });

        DB::table('alumni')
            ->whereNotNull('place_of_birth')
            ->where('place_of_birth', '!=', '')
            ->orderBy('id')
            ->each(function (object $record): void {
                $parts = array_map('trim', explode(',', (string) $record->place_of_birth));

                if (count($parts) >= 2) {
                    $city = strtoupper($parts[0]);
                    $province = strtoupper($parts[count($parts) - 1]);

                    DB::table('alumni')->where('id', $record->id)->update([
                        'birth_city' => $city,
                        'birth_province' => $province,
                    ]);
                }
            });

        Schema::table('alumni', function (Blueprint $table) {
            $table->string('birth_province')->nullable(false)->change();
            $table->string('birth_city')->nullable(false)->change();
            $table->dropColumn('place_of_birth');
        });
    }

    public function down(): void
    {
        Schema::table('alumni', function (Blueprint $table) {
            $table->string('place_of_birth')->after('age');
        });

        DB::table('alumni')->orderBy('id')->each(function (object $record): void {
            if ($record->birth_city && $record->birth_province) {
                DB::table('alumni')->where('id', $record->id)->update([
                    'place_of_birth' => "{$record->birth_city}, {$record->birth_province}",
                ]);
            }
        });

        Schema::table('alumni', function (Blueprint $table) {
            $table->dropColumn(['birth_province', 'birth_city']);
        });
    }
};
