<?php

use App\Support\CampusSchools;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('alumni', function (Blueprint $table) {
            $table->string('campus')->nullable()->after('school_id');
        });

        $alumni = DB::table('alumni')
            ->leftJoin('programs', 'alumni.program_id', '=', 'programs.id')
            ->leftJoin('campuses as program_campuses', 'programs.campus_id', '=', 'program_campuses.id')
            ->leftJoin('schools', 'alumni.school_id', '=', 'schools.id')
            ->leftJoin('campuses as school_campuses', 'schools.campus_id', '=', 'school_campuses.id')
            ->select([
                'alumni.id',
                'schools.code as school_code',
                'program_campuses.name as program_campus',
                'school_campuses.name as school_campus',
            ])
            ->get();

        foreach ($alumni as $record) {
            $campus = $record->program_campus
                ?? $record->school_campus
                ?? CampusSchools::defaultCampusForSchool($record->school_code);

            if (is_string($campus) && $campus !== '') {
                DB::table('alumni')->where('id', $record->id)->update(['campus' => $campus]);
            }
        }
    }

    public function down(): void
    {
        Schema::table('alumni', function (Blueprint $table) {
            $table->dropColumn('campus');
        });
    }
};
