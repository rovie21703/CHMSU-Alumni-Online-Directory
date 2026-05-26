<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('schools', function (Blueprint $table) {
            $table->foreignId('campus_id')->nullable()->after('name')->constrained();
        });

        // Map schools to their campuses based on the form registration logic.
        // TALISAY: CHMSU, CHMSC, PSC, NOCAT, NOSAT
        // ALIJIS: BCNTS, PSC, CHMSC, CHMSU
        // FORTUNE TOWNE: NOPCC, CHMSC, CHMSU
        // BINALBAGAN: NOSOF, CHMSC, CHMSU
        //
        // Schools belonging to multiple campuses (CHMSU, CHMSC, PSC) get NULL campus_id
        // since they are shared. They are always accessed via program_id instead.
        // Schools unique to a single campus get that campus_id.
        $campusMap = [
            'NOCAT' => 'TALISAY (MAIN) CAMPUS',
            'NOSAT' => 'TALISAY (MAIN) CAMPUS',
            'BCNTS' => 'ALIJIS CAMPUS',
            'NOPCC' => 'FORTUNE TOWNE CAMPUS',
            'NOSOF' => 'BINALBAGAN CAMPUS',
        ];

        foreach ($campusMap as $schoolCode => $campusName) {
            $campusId = DB::table('campuses')->where('name', $campusName)->value('id');

            if ($campusId !== null) {
                DB::table('schools')->where('code', $schoolCode)->update(['campus_id' => $campusId]);
            }
        }

        // Add soft deletes to alumni table
        Schema::table('alumni', function (Blueprint $table) {
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('alumni', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });

        Schema::table('schools', function (Blueprint $table) {
            $table->dropForeign(['campus_id']);
            $table->dropColumn('campus_id');
        });
    }
};
