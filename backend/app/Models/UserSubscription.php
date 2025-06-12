<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class UserSubscription extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'plan_id',
        'start_date',
        'end_date',
        'total_traffic_gb',
        'used_traffic_gb',
        'current_device_count',
        'subscription_token',
        'status',
    ];

    protected $casts = [
        'start_date' => 'datetime',
        'end_date' => 'datetime',
        'total_traffic_gb' => 'decimal:2',
        'used_traffic_gb' => 'decimal:2',
        'current_device_count' => 'integer',
    ];

    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($subscription) {
            if (empty($subscription->subscription_token)) {
                $subscription->subscription_token = Str::random(32);
            }
        });
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function plan()
    {
        return $this->belongsTo(Plan::class);
    }

    public function isActive()
    {
        return $this->status === 'ACTIVE' && 
               $this->start_date <= now() && 
               $this->end_date >= now();
    }

    public function isExpired()
    {
        return $this->end_date < now();
    }

    public function getRemainingTrafficAttribute()
    {
        return max(0, $this->total_traffic_gb - $this->used_traffic_gb);
    }

    public function getTrafficUsagePercentageAttribute()
    {
        if ($this->total_traffic_gb <= 0) return 0;
        return round(($this->used_traffic_gb / $this->total_traffic_gb) * 100, 2);
    }
}