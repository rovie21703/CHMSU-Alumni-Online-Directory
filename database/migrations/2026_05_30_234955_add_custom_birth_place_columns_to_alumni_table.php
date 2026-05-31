<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('alumni', function (Blueprint $table) {
            $table->string('birth_province_custom')->nullable()->after('birth_city_id');
            $table->string('birth_city_custom')->nullable()->after('birth_province_custom');
        });

        Schema::table('alumni', function (Blueprint $table) {
            $table->unsignedBigInteger('birth_city_id')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('alumni', function (Blueprint $table) {
            $table->dropColumn(['birth_province_custom', 'birth_city_custom']);
            $table->unsignedBigInteger('birth_city_id')->nullable(false)->change();
        });
    }
};
