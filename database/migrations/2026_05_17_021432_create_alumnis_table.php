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
        Schema::create('alumni', function (Blueprint $table) {
            $table->id();
            $table->timestamp('submitted_at');
            $table->boolean('consent_given')->default(false);

            $table->string('name');
            $table->string('sex');
            $table->date('date_of_birth');
            $table->unsignedTinyInteger('age');
            $table->string('place_of_birth');
            $table->string('mobile_no', 12);
            $table->text('address');
            $table->string('civil_status');
            $table->string('religion')->nullable();
            $table->string('email');

            $table->string('school_attended');
            $table->string('year_graduated', 4);
            $table->string('campus');
            $table->string('degree');
            $table->string('highest_attainment');
            $table->string('eligibility')->nullable();

            $table->string('employment_status');
            $table->string('employment_sector')->nullable();
            $table->string('present_employment_status')->nullable();
            $table->string('occupation')->nullable();
            $table->string('position')->nullable();
            $table->string('year_employed', 4)->nullable();
            $table->text('company')->nullable();
            $table->text('location_of_employment')->nullable();

            $table->timestamps();

            $table->index('employment_status');
            $table->index('campus');
            $table->index('year_graduated');
            $table->index('school_attended');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('alumni');
    }
};
