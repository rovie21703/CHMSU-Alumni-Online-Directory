<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class City extends Model
{
    /**
     * @var list<string>
     */
    protected $fillable = [
        'province_id',
        'name',
    ];

    /**
     * @return BelongsTo<Province, $this>
     */
    public function province(): BelongsTo
    {
        return $this->belongsTo(Province::class);
    }

    /**
     * @return HasMany<Alumni, $this>
     */
    public function alumni(): HasMany
    {
        return $this->hasMany(Alumni::class, 'birth_city_id');
    }
}
