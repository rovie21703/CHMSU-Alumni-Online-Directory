<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Program extends Model
{
    /**
     * @var list<string>
     */
    protected $fillable = [
        'campus_id',
        'name',
    ];

    /**
     * @return BelongsTo<Campus, $this>
     */
    public function campus(): BelongsTo
    {
        return $this->belongsTo(Campus::class);
    }

    /**
     * @return HasMany<Alumni, $this>
     */
    public function alumni(): HasMany
    {
        return $this->hasMany(Alumni::class);
    }
}
