<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class School extends Model
{
    /**
     * @var list<string>
     */
    protected $fillable = [
        'code',
        'name',
    ];

    /**
     * @return HasMany<Alumni, $this>
     */
    public function alumni(): HasMany
    {
        return $this->hasMany(Alumni::class);
    }
}
