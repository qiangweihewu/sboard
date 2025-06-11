<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Node extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'type', // e.g., 'VLESS', 'VMESS'
        'address',
        'port',
        'protocol_specific_config', // Stored as JSON
        'tags', // Stored as JSON
        'is_active',
        'status_verified_at',
        'last_error_message',
    ];

    protected $casts = [
        'protocol_specific_config' => 'array',
        'tags' => 'array',
        'is_active' => 'boolean',
        'port' => 'integer',
        'status_verified_at' => 'datetime',
    ];
}
