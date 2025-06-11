<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Node extends Model
{
    protected $fillable = [
        'name',
        'type',
        'address',
        'port',
        'protocol_specific_config',
        'tags',
        'is_active',
    ];

    protected $casts = [
        'protocol_specific_config' => 'array',
        'tags' => 'array',
        'is_active' => 'boolean',
    ];
}
