<?php

use Database\Seeders\ReferenceDataSeeder;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('campuses', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->timestamps();
        });

        Schema::create('schools', function (Blueprint $table) {
            $table->id();
            $table->string('code', 10)->unique();
            $table->string('name');
            $table->timestamps();
        });

        Schema::create('provinces', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->timestamps();
        });

        Schema::create('cities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('province_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->timestamps();

            $table->unique(['province_id', 'name']);
            $table->index('name');
        });

        Schema::create('programs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('campus_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->timestamps();

            $table->unique(['campus_id', 'name']);
        });

        (new ReferenceDataSeeder)->run();

        Schema::table('alumni', function (Blueprint $table) {
            $table->foreignId('school_id')->nullable()->after('email')->constrained();
            $table->foreignId('program_id')->nullable()->after('school_id')->constrained();
            $table->foreignId('birth_city_id')->nullable()->after('age')->constrained('cities');
        });

        $this->migrateAlumniReferenceData();

        Schema::table('alumni', function (Blueprint $table) {
            $table->dropIndex(['school_attended']);
            $table->dropIndex(['campus']);
            $table->dropColumn([
                'school_attended',
                'campus',
                'degree',
                'birth_province',
                'birth_city',
                'age',
            ]);
        });

        Schema::table('alumni', function (Blueprint $table) {
            $table->unsignedBigInteger('school_id')->nullable(false)->change();
            $table->unsignedBigInteger('program_id')->nullable(false)->change();
            $table->unsignedBigInteger('birth_city_id')->nullable(false)->change();
        });

        Schema::table('alumni', function (Blueprint $table) {
            $table->unique('email');
            $table->index('submitted_at');
            $table->index('birth_city_id');
            $table->index(['program_id', 'year_graduated']);
            $table->index(['employment_status', 'program_id']);
        });
    }

    public function down(): void
    {
        Schema::table('alumni', function (Blueprint $table) {
            $table->dropUnique(['email']);
            $table->dropIndex(['submitted_at']);
            $table->dropIndex(['birth_city_id']);
            $table->dropIndex(['program_id', 'year_graduated']);
            $table->dropIndex(['employment_status', 'program_id']);

            $table->unsignedTinyInteger('age')->after('date_of_birth');
            $table->string('birth_province')->after('age');
            $table->string('birth_city')->after('birth_province');
            $table->string('school_attended')->after('email');
            $table->string('campus')->after('year_graduated');
            $table->string('degree')->after('campus');
        });

        DB::table('alumni')->orderBy('id')->each(function (object $record): void {
            $school = DB::table('schools')->where('id', $record->school_id)->first();
            $program = DB::table('programs')->where('id', $record->program_id)->first();
            $campus = $program ? DB::table('campuses')->where('id', $program->campus_id)->first() : null;
            $city = DB::table('cities')->where('id', $record->birth_city_id)->first();
            $province = $city ? DB::table('provinces')->where('id', $city->province_id)->first() : null;

            DB::table('alumni')->where('id', $record->id)->update([
                'school_attended' => $school?->code,
                'campus' => $campus?->name,
                'degree' => $program?->name,
                'birth_province' => $province?->name,
                'birth_city' => $city?->name,
                'age' => 0,
            ]);
        });

        Schema::table('alumni', function (Blueprint $table) {
            $table->dropForeign(['school_id']);
            $table->dropForeign(['program_id']);
            $table->dropForeign(['birth_city_id']);
            $table->dropColumn(['school_id', 'program_id', 'birth_city_id']);

            $table->index('school_attended');
            $table->index('campus');
        });

        Schema::dropIfExists('programs');
        Schema::dropIfExists('cities');
        Schema::dropIfExists('provinces');
        Schema::dropIfExists('schools');
        Schema::dropIfExists('campuses');
    }

    private function migrateAlumniReferenceData(): void
    {
        DB::table('alumni')->orderBy('id')->each(function (object $record): void {
            $schoolId = DB::table('schools')->where('code', $record->school_attended)->value('id');

            $campusId = DB::table('campuses')->where('name', $record->campus)->value('id');

            $programId = null;
            if ($campusId) {
                $programId = DB::table('programs')
                    ->where('campus_id', $campusId)
                    ->where('name', $record->degree)
                    ->value('id');
            }

            $provinceId = DB::table('provinces')->where('name', $record->birth_province)->value('id');

            $birthCityId = null;
            if ($provinceId) {
                $birthCityId = DB::table('cities')
                    ->where('province_id', $provinceId)
                    ->where('name', $record->birth_city)
                    ->value('id');
            }

            DB::table('alumni')->where('id', $record->id)->update([
                'school_id' => $schoolId,
                'program_id' => $programId,
                'birth_city_id' => $birthCityId,
            ]);
        });
    }
};
