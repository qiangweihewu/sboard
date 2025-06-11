<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Plan extends Model
{
    protected $fillable = [
        'name',
        'description',
        'duration_days',
        'traffic_limit_gb',
        'device_limit',
        'price',
        'node_selection_criteria',
        'target_user_group_id',
        'is_active',
    ];

    protected $casts = [
        'node_selection_criteria' => 'array',
        'is_active' => 'boolean',
    ];
}
