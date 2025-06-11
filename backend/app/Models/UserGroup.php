<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserGroup extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'description'];

    /**
     * The users that belong to the group.
     */
    public function users()
    {
        return $this->belongsToMany(User::class, 'user_user_group', 'group_id', 'user_id');
    }

    /**
     * Plans that target this user group.
     */
    public function plans()
    {
        return $this->hasMany(Plan::class, 'target_user_group_id');
    }
}
