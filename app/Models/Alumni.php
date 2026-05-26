<?php

namespace App\Models;

use App\Policies\AlumniPolicy;
use Database\Factories\AlumniFactory;
use Illuminate\Database\Eloquent\Attributes\UsePolicy;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

#[UsePolicy(AlumniPolicy::class)]
class Alumni extends Model
{
    /** @use HasFactory<AlumniFactory> */
    use HasFactory, SoftDeletes;

    protected $table = 'alumni';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'submitted_at',
        'consent_given',
        'name',
        'sex',
        'date_of_birth',
        'birth_city_id',
        'mobile_no',
        'address',
        'civil_status',
        'religion',
        'email',
        'school_id',
        'program_id',
        'degree',
        'year_graduated',
        'highest_attainment',
        'eligibility',
        'employment_status',
        'employment_sector',
        'present_employment_status',
        'occupation',
        'position',
        'year_employed',
        'company',
        'company_address',
        'location_of_employment',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'submitted_at' => 'datetime',
            'consent_given' => 'boolean',
            'date_of_birth' => 'date',
        ];
    }

    /**
     * @return BelongsTo<School, $this>
     */
    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    /**
     * @return BelongsTo<Program, $this>
     */
    public function program(): BelongsTo
    {
        return $this->belongsTo(Program::class);
    }

    /**
     * @return BelongsTo<City, $this>
     */
    public function birthCity(): BelongsTo
    {
        return $this->belongsTo(City::class, 'birth_city_id');
    }

    /**
     * @return Attribute<int, never>
     */
    protected function age(): Attribute
    {
        return Attribute::get(
            fn (): int => (int) $this->date_of_birth?->age
        );
    }

    /**
     * @param  Builder<static>  $query
     * @return Builder<static>
     */
    public function scopeVisibleTo(Builder $query, User $user): Builder
    {
        if ($user->isAdmin()) {
            return $query;
        }

        if ($user->campus_id === null) {
            return $query->whereRaw('0 = 1');
        }

        return $query->where(function (Builder $q) use ($user) {
            // Alumni with a program linked to the user's campus
            $q->whereHas(
                'program',
                fn (Builder $programQuery) => $programQuery->where('campus_id', $user->campus_id)
            )
            // Alumni without a program (non-CHMSU/CHMSC schools) linked via school's campus
                ->orWhere(function (Builder $q2) use ($user) {
                    $q2->whereNull('program_id')
                        ->whereHas(
                            'school',
                            fn (Builder $schoolQuery) => $schoolQuery->where('campus_id', $user->campus_id)
                        );
                });
        });
    }
}
