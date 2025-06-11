<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Plan extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'duration_days',
        'traffic_limit_gb',
        'device_limit',
        'price',
        'node_selection_criteria', // Stored as JSON
        'target_user_group_id',
        'is_active',
    ];

    protected $casts = [
        'node_selection_criteria' => 'array', // Automatically cast JSON to array and vice-versa
        'is_active' => 'boolean',
        'price' => 'decimal:2', // Example cast, adjust precision as needed
        'traffic_limit_gb' => 'decimal:2', // Example cast
    ];

    /**
     * The user group that this plan might target.
     */
    public function targetUserGroup()
    {
        return $this->belongsTo(UserGroup::class, 'target_user_group_id');
    }

    /**
     * The user subscriptions associated with this plan.
     */
    public function userSubscriptions()
    {
        return $this->hasMany(UserSubscription::class); // UserSubscription model will be created later
    }
}
