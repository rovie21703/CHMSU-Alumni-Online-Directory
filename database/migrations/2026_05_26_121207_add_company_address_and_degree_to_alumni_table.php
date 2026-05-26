<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('alumni', function (Blueprint $table) {
            $table->unsignedBigInteger('program_id')->nullable()->change();
            $table->string('degree')->nullable()->after('program_id');
            $table->text('company_address')->nullable()->after('company');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('alumni', function (Blueprint $table) {
            $table->dropColumn(['degree', 'company_address']);
            $table->unsignedBigInteger('program_id')->nullable(false)->change();
        });
    }
};
