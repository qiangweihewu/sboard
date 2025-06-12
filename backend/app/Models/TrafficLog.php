<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TrafficLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_subscription_id',
        'node_id',
        'uplink_bytes',
        'downlink_bytes',
        'recorded_at',
    ];

    protected $casts = [
        'uplink_bytes' => 'integer',
        'downlink_bytes' => 'integer',
        'recorded_at' => 'datetime',
    ];

    public function userSubscription()
    {
        return $this->belongsTo(UserSubscription::class);
    }

    public function node()
    {
        return $this->belongsTo(Node::class);
    }

    public function getTotalBytesAttribute()
    {
        return $this->uplink_bytes + $this->downlink_bytes;
    }

    public function getTotalGbAttribute()
    {
        return round($this->total_bytes / (1024 * 1024 * 1024), 3);
    }
}